// The refinement engine: build the meta-prompt, run it through the user's installed
// `claude` CLI (no API key — reuses the session's auth, model, and quota), return text.
import { spawn } from 'node:child_process';
import { readMemory, readTranscript } from './context.js';

export function buildMetaPrompt({ prompt, memory, conversation }) {
  return [
    'You are Prompet, a prompt optimizer for AI coding agents.',
    "Rewrite the user's RAW PROMPT into ONE clear, specific, well-structured prompt the coding agent can execute well.",
    '',
    'Rules:',
    "- Preserve the user's original intent and scope. Never add features or requirements they did not imply.",
    '- Use the conversation and project memory to make implicit context explicit (relevant files, stack, constraints, naming conventions).',
    '- Add concrete acceptance criteria or expected output only when clearly implied.',
    '- If the raw prompt is already clear and specific, return it essentially unchanged.',
    "- Keep the user's language.",
    '- Output ONLY the rewritten prompt. No preamble, no explanation, no markdown headings, no code fences.',
    '',
    '== PROJECT MEMORY (may be empty) ==',
    memory || '(none)',
    '',
    '== RECENT CONVERSATION (may be empty) ==',
    conversation || '(none)',
    '',
    '== RAW PROMPT ==',
    prompt,
    '',
    '== REWRITTEN PROMPT ==',
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
