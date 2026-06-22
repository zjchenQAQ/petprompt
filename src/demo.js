// `petprompt demo` — a self-contained playback of the REAL pp flow (no claude, no network):
// you type a messy prompt, it's rewritten, and the exact result card the hook shows appears.
// It uses the same renderRewriteCard() as the live hook, so the demo == the real experience.
// Doubles as the README GIF source (assets/demo.tape) and a zero-setup `npx petprompt demo`.
import { loadConfig } from './config.js';
import { renderRewriteCard } from './pet.js';

const ESC = String.fromCharCode(27);
const col = (code, s) => `${ESC}[${code}m${s}${ESC}[0m`;
const dim = (s) => col('2', s);
const cyan = (s) => col('36', s);
const bold = (s) => col('1', s);
const amber = (s) => col('38;5;214', s); // matches Claude Code's amber hook message

const w = (s) => process.stdout.write(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function typeOut(s, ms = 14) {
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
].join('\n');

export async function runDemo() {
  const cfg = loadConfig();
  w(ESC + '[2J' + ESC + '[H'); // clear screen
  w('\n  ' + bold(cyan('PetPrompt')) + dim('  ·  a cute pet that fixes your prompts') + '\n\n');

  // 1) you type a messy prompt with the `pp ` prefix (real)
  w('  ' + dim('›') + ' ');
  await typeOut(MESSY);
  await sleep(500);

  // 2) a brief beat while it rewrites (in real use, Claude Code spins here)
  w('\n\n  ' + dim('· rewriting your prompt …'));
  await sleep(1300);
  w('\r' + ESC + '[K');

  // 3) the EXACT card the hook shows. In Claude Code this is an amber hook message, so we
  //    render it amber (and with the real "blocked by hook" line) to match what you see.
  w('  ' + amber('● UserPromptSubmit operation blocked by hook:') + '\n');
  const card = renderRewriteCard({ optimized: CLEAN, copied: true, character: cfg.character });
  for (const line of card.split('\n')) {
    w('     ' + amber(line) + '\n');
    await sleep(45);
  }

  // 4) you paste it and run it
  await sleep(700);
  w('\n  ' + dim('›') + ' In the CSV upload component, fix the hang …' + dim('  ⏎') + '\n');
  await sleep(1600);
}
