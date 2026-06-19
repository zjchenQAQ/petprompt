// Prompet configuration: a single JSON file under ~/.claude/prompet/config.json.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

export const PROMPET_DIR = join(homedir(), '.claude', 'prompet');
export const CONFIG_PATH = join(PROMPET_DIR, 'config.json');

export const DEFAULT_CONFIG = {
  // How the UserPromptSubmit hook behaves:
  //   auto    – refine substantive prompts automatically (skips trivial ones)
  //   marker  – only refine when the prompt starts with `marker`
  //   manual  – never auto-refine; use the /prompet:optimize command instead
  //   off     – do nothing
  mode: 'auto',

  // In `marker` mode, the prefix that opts a prompt into refinement.
  marker: 'pp ',

  // Which model performs the refinement.
  //   'inherit' – use the current session's model (follows your window). Default.
  //   '<id>'    – force a model, e.g. 'claude-haiku-4-5' for lower latency/cost.
  optimizeModel: 'inherit',

  // auto-mode guardrails: skip prompts that are too short to be worth refining.
  minWords: 4,
  minChars: 16,

  // How many recent conversation messages to feed the optimizer.
  contextMessages: 12,

  // Hard cap for the refinement call. MUST stay under the 30s hook timeout.
  timeoutMs: 25000,

  // Surface a one-line note when a prompt is refined.
  showNote: true,

  // Statusline pet style (reserved for future styles).
  petStyle: 'bear',

  // auto-mode: never refine prompts matching these (control words, commands, etc.).
  skipPatterns: [
    '^\\s*(y|n|yes|no|ok|okay|k|go|stop|wait|continue|cont|next|run( it)?|do it|sure|thx|thanks?|ty|yep|nope|undo|redo|fix it|retry|again)\\s*[.!?]*\\s*$',
    '^\\s*/', // slash commands
    '^\\s*!', // shell passthrough
  ],
};

export function loadConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) };
    }
  } catch {
    // fall through to defaults on any parse/read error
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(cfg) {
  mkdirSync(PROMPET_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}
