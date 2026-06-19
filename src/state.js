// Tiny shared state between the hook (writer) and the statusline pet (reader).
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = join(homedir(), '.claude', 'prompet');
const STATE_PATH = join(DIR, 'state.json');

// status: 'idle' | 'thinking' | 'done'
export function writeState(status, extra = {}) {
  try {
    mkdirSync(DIR, { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify({ status, ts: Date.now(), ...extra }));
  } catch {
    // state is best-effort; never throw
  }
}

export function readState() {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { status: 'idle', ts: 0 };
  }
}
