// Render the chosen PetPrompt character in the Claude Code statusline (multi-line),
// animating by cycling frames and reacting to the shared hook state.
import { CHARACTERS, DEFAULT_CHARACTER } from './characters.js';
import { t } from './i18n.js';

const ESC = String.fromCharCode(27);
const esc = (c, s) => `${ESC}[${c}m${s}${ESC}[0m`;
const magenta = (s) => esc('35', s);
const cyan = (s) => esc('36', s);
const green = (s) => esc('32', s);
const yellow = (s) => esc('33', s);
const dim = (s) => esc('2', s);

const DONE_MS = 8000; // how long the "done" cheer lingers
const SLEEP_MS = 5 * 60 * 1000; // idle this long -> sleep
const FRAME_MS = 900; // animation frame duration

export function renderPet(state, info = {}) {
  const key = info.character && CHARACTERS[info.character] ? info.character : DEFAULT_CHARACTER;
  const ch = CHARACTERS[key];
  const age = Date.now() - (state.ts || 0);

  let st = state.status || 'idle';
  if (st === 'done' && age > DONE_MS) st = 'idle';
  if (st === 'idle' && age > SLEEP_MS) st = 'sleep';

  const frames = ch.states[st] || ch.states.idle;
  const frame = frames[Math.floor(Date.now() / FRAME_MS) % frames.length];

  let label;
  if (st === 'think') label = yellow(t('petRefining'));
  else if (st === 'done') label = green(t('petRefined'));
  else if (st === 'sleep') label = dim('PetPrompt');
  else label = cyan('PetPrompt') + (info.ctx != null ? dim(' · ' + info.ctx + '%') : '');

  const lines = frame.map((l) => magenta(l));
  lines[lines.length - 1] += '  ' + label;
  return lines.join('\n');
}
