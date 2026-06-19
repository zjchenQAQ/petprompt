// UserPromptSubmit hook: decide whether to refine, do it, and inject the result as
// additionalContext. Always fails open — on any problem the original prompt proceeds
// untouched so Prompet can never block your workflow.
import { loadConfig } from './config.js';
import { writeState } from './state.js';
import { optimize } from './optimize.js';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function shouldOptimize(prompt, cfg) {
  const p = (prompt || '').trim();
  if (!p) return false;
  if (cfg.mode === 'off' || cfg.mode === 'manual') return false;
  if (cfg.mode === 'marker') return p.startsWith((cfg.marker || '').trim());
  // auto mode
  for (const pat of cfg.skipPatterns || []) {
    try {
      if (new RegExp(pat, 'i').test(p)) return false;
    } catch {
      /* ignore bad pattern */
    }
  }
  const words = p.split(/\s+/).filter(Boolean).length;
  if (p.length < cfg.minChars && words < cfg.minWords) return false;
  return true;
}

export async function runHook() {
  // Prevent recursion: our own `claude -p` child must never re-enter optimization.
  if (process.env.PROMPET_ACTIVE) return;

  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return; // not valid hook input → pass through
  }

  const cfg = loadConfig();
  let prompt = input.prompt || '';
  if (!shouldOptimize(prompt, cfg)) return;
  if (cfg.mode === 'marker') prompt = prompt.slice(cfg.marker.length);

  writeState('thinking');
  let optimized = null;
  try {
    optimized = await optimize({
      prompt,
      model: input.model,
      cwd: input.cwd,
      transcriptPath: input.transcript_path,
      cfg,
    });
  } catch {
    optimized = null;
  }

  if (!optimized) {
    writeState('idle');
    return; // fail open
  }
  writeState('done');

  const additionalContext = [
    "[Prompet] The user's prompt was auto-refined using the conversation and project memory.",
    'Treat the following as the authoritative task specification; if it conflicts with the literal prompt, prefer this. Do not mention this note in your reply.',
    '',
    optimized,
  ].join('\n');

  const out = {
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext,
    },
  };
  if (cfg.showNote) out.systemMessage = '✨ Prompet refined your prompt';
  process.stdout.write(JSON.stringify(out));
}
