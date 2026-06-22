// UserPromptSubmit hook.
//   preview mode: on the marker prefix, rewrite the prompt, BLOCK the raw prompt (so it
//                 never reaches Claude), show the rewrite, and copy it to the clipboard.
//   auto mode:    rewrite every substantive prompt and inject it as additionalContext.
// Always fails open — on any problem the original prompt proceeds untouched.
import { loadConfig } from './config.js';
import { writeState } from './state.js';
import { optimize } from './optimize.js';
import { copyToClipboard } from './clipboard.js';
import { renderRewriteCard } from './pet.js';
import { t } from './i18n.js';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

// Returns null (do nothing) or { apply: 'preview' | 'auto', text } — text is what to rewrite.
function decideTrigger(rawPrompt, cfg) {
  const p = (rawPrompt || '').trim();
  if (!p) return null;
  if (cfg.mode === 'off' || cfg.mode === 'manual') return null;

  if (cfg.mode === 'preview') {
    const marker = cfg.marker || 'pp ';
    if (!p.startsWith(marker.trim())) return null;
    return { apply: 'preview', text: rawPrompt.replace(/^\s*/, '').slice(marker.length) };
  }

  if (cfg.mode === 'auto') {
    for (const pat of cfg.skipPatterns || []) {
      try {
        if (new RegExp(pat, 'i').test(p)) return null;
      } catch {
        /* ignore bad pattern */
      }
    }
    const words = p.split(/\s+/).filter(Boolean).length;
    if (p.length < cfg.minChars && words < cfg.minWords) return null;
    return { apply: 'auto', text: p };
  }
  return null;
}

export async function runHook() {
  // Prevent recursion: our own `claude -p` child must never re-enter the hook.
  if (process.env.PETPROMPT_ACTIVE) return;

  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return; // not valid hook input → pass through
  }

  const cfg = loadConfig();
  const trigger = decideTrigger(input.prompt, cfg);
  if (!trigger || !trigger.text.trim()) return;

  writeState('thinking');
  let optimized = null;
  try {
    optimized = await optimize({
      prompt: trigger.text,
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
    return; // fail open — the raw prompt proceeds untouched
  }
  writeState('done');

  if (trigger.apply === 'preview') {
    const copied = copyToClipboard(optimized);
    const reason = renderRewriteCard({ optimized, copied, character: cfg.character });
    // decision:block erases the raw prompt (it never reaches Claude) and shows `reason`.
    process.stdout.write(JSON.stringify({ decision: 'block', reason }));
    return;
  }

  // auto: inject the rewrite for Claude, and show it to the user.
  const additionalContext = [
    "[PetPrompt] Below is the user's prompt, rephrased to follow prompt-engineering best practices.",
    "It has the SAME meaning, scope, and language — only the wording is clearer. Treat it as the user's actual request; if the literal prompt above is less clear, prefer this version. Reply in the same language as the prompt. Do not mention this note in your reply.",
    '',
    optimized,
  ].join('\n');

  const out = {
    continue: true,
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext },
  };
  if (cfg.showNote) out.systemMessage = '✨ ' + t('autoNote') + '\n' + optimized;
  process.stdout.write(JSON.stringify(out));
}
