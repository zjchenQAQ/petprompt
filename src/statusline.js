// Statusline command: render the Prompet pet, reflecting the hook's current state.
import { readState } from './state.js';
import { renderPet } from './pet.js';

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

export async function runStatusline() {
  let info = {};
  try {
    info = JSON.parse(await readStdin());
  } catch {
    /* statusline still renders without info */
  }
  const state = readState();
  const ctx = info?.context_window?.used_percentage;
  process.stdout.write(renderPet(state, { ctx }));
}
