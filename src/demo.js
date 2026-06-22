// `petprompt demo` — a self-contained, scripted playback of the pp flow (no claude, no
// network). It doubles as the source for the README GIF (record with assets/demo.tape) and
// as a zero-setup "see the vibe" command (npx petprompt demo).
import { CHARACTERS, DEFAULT_CHARACTER } from './characters.js';
import { loadConfig } from './config.js';

const ESC = String.fromCharCode(27);
const col = (code, s) => `${ESC}[${code}m${s}${ESC}[0m`;
const dim = (s) => col('2', s);
const cyan = (s) => col('36', s);
const green = (s) => col('32', s);
const yellow = (s) => col('33', s);
const magenta = (s) => col('35', s);
const bold = (s) => col('1', s);

const w = (s) => process.stdout.write(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function typeOut(s, ms = 16) {
  for (const ch of s) {
    w(ch);
    await sleep(ms);
  }
}

const MESSY =
  'pp ok so theres this bug, big CSV upload hangs the whole thing and sometimes crashes the tab, idk maybe parsing, look into the upload component, show progress too, dont load the whole file into memory, and the error just says "error" which is useless';

const CLEAN = [
  'In the CSV upload component, fix the hang and occasional tab crash on very large',
  'files. Parse the file in streamed chunks instead of loading it all into memory,',
  'show upload progress, and replace the generic "error" message with a meaningful',
  'one. Start by checking whether parsing is the bottleneck.',
];

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export async function runDemo() {
  const cfg = loadConfig();
  const ch = CHARACTERS[cfg.character] || CHARACTERS[DEFAULT_CHARACTER];

  w(ESC + '[2J' + ESC + '[H'); // clear screen
  w('\n  ' + magenta('ʕ•ᴥ•ʔ') + '  ' + bold('PetPrompt') + dim(' — a cute pet that fixes your prompts') + '\n\n');

  // 1) you fire off a messy prompt with the `pp ` prefix
  w('  ' + dim('›') + ' ');
  await typeOut(MESSY, 14);
  await sleep(450);
  w('\n\n');

  // 2) the pet thinks
  const think = ch.states.think[0];
  w('  ' + magenta(think[0]) + '\n');
  for (let i = 0; i < 20; i++) {
    w('\r  ' + magenta(think[1]) + '  ' + yellow(SPIN[i % SPIN.length] + ' thinking…'));
    await sleep(70);
  }
  w('\r' + ESC + '[K' + '  ' + magenta(think[1]) + '  ' + green('done') + '\n\n');
  await sleep(300);

  // 3) raw prompt blocked; clean rewrite shown + copied
  w('  ' + yellow('✨ Optimized prompt') + dim(' — paste & Enter to run:') + '\n\n');
  for (const line of CLEAN) {
    w('  ' + line + '\n');
    await sleep(280);
  }
  w('\n  ' + green('✓ copied to clipboard') + dim('   · your raw prompt was never sent') + '\n\n');
  await sleep(450);

  // 4) the pet celebrates
  const done = ch.states.done[0];
  w('  ' + magenta(done[0]) + '\n');
  w('  ' + magenta(done[1]) + '  ' + green('refined!') + '\n\n');
  await sleep(1600);
}
