// PetPrompt configuration: a single JSON file under ~/.claude/petprompt/config.json.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

export const PETPROMPT_DIR = join(homedir(), '.claude', 'petprompt');
export const CONFIG_PATH = join(PETPROMPT_DIR, 'config.json');

export const DEFAULT_CONFIG = {
  // How the UserPromptSubmit hook behaves:
  //   preview – on the `marker` prefix, rewrite the prompt, show it, and copy it to the
  //             clipboard; your raw prompt is NOT sent to Claude (default).
  //   auto    – rewrite every substantive prompt and inject it automatically.
  //   manual  – never auto-run; use the /petprompt:optimize command.
  //   off     – do nothing.
  mode: 'preview',

  // Prefix that triggers a rewrite (used in `preview` mode).
  marker: 'pp ',

  // Which model performs the rewrite.
  //   'inherit' – use the current session's model (follows your window). Default.
  //   '<id>'    – force a model, e.g. 'claude-haiku-4-5' for lower latency/cost.
  optimizeModel: 'inherit',

  // Statusline character: shiba | cat | slime | fox | bunny.
  character: 'shiba',

  // auto-mode guardrails: skip prompts that are too short to be worth rewriting.
  minWords: 4,
  minChars: 16,

  // How many recent conversation messages to feed the rewriter.
  contextMessages: 12,

  // Hard cap for the rewrite call. MUST stay under the 30s hook timeout.
  timeoutMs: 25000,

  // Surface a one-line note when a prompt is rewritten (auto mode).
  showNote: true,

  // UI language for PetPrompt's own messages: auto | en | zh | ja.
  // 'auto' follows $LC_ALL / $LANG; the rewritten prompt always keeps your own language.
  lang: 'auto',

  // auto-mode: never rewrite prompts matching these (control words, commands, etc.).
  skipPatterns: [
    '^\\s*(y|n|yes|no|ok|okay|k|go|stop|wait|continue|cont|next|run( it)?|do it|sure|thx|thanks?|ty|yep|nope|undo|redo|fix it|retry|again)\\s*[.!?]*\\s*$',
    '^\\s*/', // slash commands
    '^\\s*!', // shell passthrough
  ],
};

export function loadConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const cfg = { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) };
      // normalize critical fields so a hand-edited config can't break the hook
      if (!Array.isArray(cfg.skipPatterns)) cfg.skipPatterns = DEFAULT_CONFIG.skipPatterns;
      if (!Number.isFinite(cfg.minChars)) cfg.minChars = DEFAULT_CONFIG.minChars;
      if (!Number.isFinite(cfg.minWords)) cfg.minWords = DEFAULT_CONFIG.minWords;
      return cfg;
    }
  } catch {
    // fall through to defaults on any parse/read error
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(cfg) {
  mkdirSync(PETPROMPT_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}
