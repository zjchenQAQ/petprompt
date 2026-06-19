// The refinement engine: build the meta-prompt, run it through the user's installed
// `claude` CLI (no API key — reuses the session's auth, model, and quota), return text.
import { spawn } from 'node:child_process';
import { readMemory, readTranscript } from './context.js';

export function buildMetaPrompt({ prompt, memory, conversation }) {
  return [
    'You are Prompet, a prompt rewriter for AI coding agents.',
    "Rewrite the user's RAW PROMPT so it follows prompt-engineering best practices: clear, direct, specific, unambiguous, and well-structured.",
    '',
    'Hard rules:',
    '- PRESERVE THE MEANING EXACTLY. Keep the same intent, scope, and constraints.',
    '- DO NOT add new requirements, features, steps, acceptance criteria, or details the user did not state or clearly imply. This is a REPHRASING, not an expansion.',
    '- Do not pad or lengthen. The result is usually a similar length or shorter — only clearer.',
    '- Remove hedging, filler, and ambiguity; prefer precise, imperative phrasing.',
    '- Use the conversation and project memory ONLY to resolve ambiguous references (what "it" / "this" / "that" point to) and to use correct names and terminology — never to introduce new scope.',
    '- If the prompt is already clear, return it unchanged.',
    "- Keep the user's language.",
    '- Output ONLY the rewritten prompt. No preamble, no explanation, no markdown, no code fences.',
    '',
    '== PROJECT MEMORY (context only — may be empty) ==',
    memory || '(none)',
    '',
    '== RECENT CONVERSATION (context only — may be empty) ==',
    conversation || '(none)',
    '',
    '== RAW PROMPT ==',
    prompt,
    '',
    '== REWRITTEN PROMPT (same meaning, clearer phrasing) ==',
  ].join('\n');
}

// Invoke `claude -p` headlessly. Resolves to the trimmed text, or null on any failure
// so callers can always fail open. PROMPET_ACTIVE guards against the hook re-triggering
// itself when this child process runs.
function runClaude({ metaPrompt, model, timeoutMs }) {
  return new Promise((resolve) => {
    const args = ['-p', metaPrompt, '--output-format', 'text', '--max-turns', '1'];
    if (model && model !== 'inherit') args.push('--model', model);

    let child;
    try {
      child = spawn('claude', args, {
        env: { ...process.env, PROMPET_ACTIVE: '1' },
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      return resolve(null);
    }

    let out = '';
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
        /* noop */
      }
      resolve(null);
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const text = out.trim();
      resolve(code === 0 && text ? text : null);
    });
  });
}

export async function optimize({ prompt, model, cwd, transcriptPath, cfg }) {
  const memory = readMemory(cwd);
  const conversation = readTranscript(transcriptPath, cfg.contextMessages);
  const metaPrompt = buildMetaPrompt({ prompt, memory, conversation });
  const useModel = cfg.optimizeModel === 'inherit' ? model : cfg.optimizeModel;
  const result = await runClaude({ metaPrompt, model: useModel, timeoutMs: cfg.timeoutMs });
  if (!result || result.length < 3) return null;
  return result;
}
