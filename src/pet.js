// The Prompet pet, rendered in the Claude Code statusline.
const esc = (code, s) => `[${code}m${s}[0m`;
export const dim = (s) => esc('2', s);
export const cyan = (s) => esc('36', s);
export const green = (s) => esc('32', s);
export const yellow = (s) => esc('33', s);
export const magenta = (s) => esc('35', s);

const FACES = {
  idle: 'ʕ•ᴥ•ʔ',
  thinking: 'ʕ•ᴥ•ʔ?',
  done: 'ʕ◕ᴥ◕ʔ',
};

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Render a single-line pet based on the shared state + statusline info.
export function renderPet(state, info = {}) {
  const age = Date.now() - (state.ts || 0);
  let status = state.status || 'idle';
  // 'done' decays back to idle after a few seconds so the cheer isn't permanent.
  if (status === 'done' && age > 6000) status = 'idle';

  if (status === 'thinking') {
    const frame = SPIN[Math.floor(age / 90) % SPIN.length];
    return `${magenta(FACES.thinking)} ${cyan('Prompet')} ${yellow(frame + ' refining…')}`;
  }
  if (status === 'done') {
    return `${magenta(FACES.done)} ${cyan('Prompet')} ${green('✨ refined')}`;
  }
  const ctx = info.ctx != null ? dim(` · ctx ${info.ctx}%`) : '';
  return `${magenta(FACES.idle)} ${cyan('Prompet')}${ctx}`;
}
