#!/usr/bin/env node
// Prompet CLI: single entry point for the hook, the statusline, config, and install.
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { loadConfig, saveConfig, DEFAULT_CONFIG, CONFIG_PATH, PROMPET_DIR } from './config.js';
import { readState } from './state.js';
import { optimize } from './optimize.js';

const SELF = fileURLToPath(import.meta.url);
const NODE = process.execPath;
const SETTINGS = join(homedir(), '.claude', 'settings.json');
const HOOK_CMD = `"${NODE}" "${SELF}" hook`;
const STATUS_CMD = `"${NODE}" "${SELF}" statusline`;
const VERSION = '0.1.0';

// Identify Prompet's own entries by their command referencing this cli.js (robust to
// JSON escaping and node-path changes, unlike stringify+substring matching).
const isOurHook = (e) =>
  Array.isArray(e?.hooks) &&
  e.hooks.some(
    (h) => typeof h?.command === 'string' && h.command.includes(SELF) && h.command.trim().endsWith(' hook'),
  );
const isOurStatus = (sl) => typeof sl?.command === 'string' && sl.command.includes(SELF);

const C = {
  b: (s) => `[1m${s}[0m`,
  dim: (s) => `[2m${s}[0m`,
  cyan: (s) => `[36m${s}[0m`,
  green: (s) => `[32m${s}[0m`,
  red: (s) => `[31m${s}[0m`,
  yellow: (s) => `[33m${s}[0m`,
};

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const HELP = `${C.cyan('ʕ•ᴥ•ʔ Prompet')} ${C.dim('v' + VERSION)} — a cute pet that refines your prompts.

${C.b('Usage:')} prompet <command>

${C.b('Setup')}
  init               Wire the hook + statusline into ~/.claude/settings.json
  uninstall          Remove Prompet from ~/.claude/settings.json
  doctor             Check that everything is ready

${C.b('Behaviour')}
  on                 Enable auto-refine (mode = auto)
  off                Disable refining  (mode = off)
  mode <m>           Set mode: auto | marker | manual | off
  config             Print the current config
  set <key> <value>  Set a config value (e.g. set optimizeModel claude-haiku-4-5)

${C.b('Use')}
  optimize [text]    Refine a prompt and print it (reads stdin if no text)
  help               Show this help

${C.b('Internal')} (called by Claude Code)
  hook               Run the UserPromptSubmit hook
  statusline         Render the statusline pet`;

function printConfig() {
  const cfg = loadConfig();
  console.log(C.b('Prompet config') + C.dim(' (' + CONFIG_PATH + ')'));
  for (const k of Object.keys(DEFAULT_CONFIG)) {
    const v = cfg[k];
    const shown = Array.isArray(v) ? `[${v.length} pattern(s)]` : JSON.stringify(v);
    console.log(`  ${k.padEnd(16)} ${C.cyan(shown)}`);
  }
}

function setKey(key, raw) {
  if (!(key in DEFAULT_CONFIG)) {
    console.error(C.red(`Unknown key: ${key}`));
    console.error(C.dim('Valid keys: ' + Object.keys(DEFAULT_CONFIG).join(', ')));
    process.exit(1);
  }
  const cfg = loadConfig();
  const def = DEFAULT_CONFIG[key];
  let value = raw;
  if (typeof def === 'number') value = Number(raw);
  else if (typeof def === 'boolean') value = raw === 'true' || raw === '1';
  cfg[key] = value;
  saveConfig(cfg);
  console.log(C.green('✓') + ` ${key} = ${JSON.stringify(value)}`);
}

function setMode(mode) {
  const valid = ['auto', 'marker', 'manual', 'off'];
  if (!valid.includes(mode)) {
    console.error(C.red(`Invalid mode: ${mode}`) + C.dim(' (' + valid.join(' | ') + ')'));
    process.exit(1);
  }
  const cfg = loadConfig();
  cfg.mode = mode;
  saveConfig(cfg);
  console.log(C.green('✓') + ` mode = ${mode}`);
}

function backup(path) {
  try {
    if (existsSync(path)) copyFileSync(path, path + '.bak');
  } catch {
    /* best effort */
  }
}

function doInit() {
  mkdirSync(dirname(SETTINGS), { recursive: true });
  const s = readJson(SETTINGS, {});
  backup(SETTINGS);

  // hooks.UserPromptSubmit
  s.hooks = s.hooks || {};
  const list = Array.isArray(s.hooks.UserPromptSubmit) ? s.hooks.UserPromptSubmit : [];
  const already = list.some(isOurHook);
  if (!already) {
    list.push({ hooks: [{ type: 'command', command: HOOK_CMD, timeout: 30 }] });
  }
  s.hooks.UserPromptSubmit = list;

  // statusLine (warn if replacing a custom one)
  let statusNote = '';
  if (s.statusLine && !isOurStatus(s.statusLine)) {
    statusNote = C.yellow('  ! Replaced an existing statusLine (backed up to settings.json.bak).');
  }
  s.statusLine = { type: 'command', command: STATUS_CMD, padding: 0 };

  saveConfig(loadConfig()); // ensure config dir/file exist
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');

  console.log(C.green('✓ Prompet installed into ') + SETTINGS);
  console.log('  ' + C.dim('hook:       ') + (already ? C.dim('already present') : C.cyan('UserPromptSubmit')));
  console.log('  ' + C.dim('statusline: ') + C.cyan('Prompet pet'));
  if (statusNote) console.log(statusNote);
  console.log(C.dim('  Restart Claude Code (or /hooks reload) to activate.'));
}

function doUninstall() {
  if (!existsSync(SETTINGS)) return console.log(C.dim('Nothing to remove.'));
  const s = readJson(SETTINGS, {});
  backup(SETTINGS);
  if (s.hooks?.UserPromptSubmit) {
    s.hooks.UserPromptSubmit = s.hooks.UserPromptSubmit.filter((e) => !isOurHook(e));
    if (s.hooks.UserPromptSubmit.length === 0) delete s.hooks.UserPromptSubmit;
  }
  if (isOurStatus(s.statusLine)) delete s.statusLine;
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');
  console.log(C.green('✓ Prompet removed from ') + SETTINGS);
}

function doDoctor() {
  const cfg = loadConfig();
  const claude = spawnSync('claude', ['--version'], { encoding: 'utf8' });
  const claudeOk = claude.status === 0;
  const s = readJson(SETTINGS, {});
  const hookInstalled = (s.hooks?.UserPromptSubmit || []).some(isOurHook);
  const statusInstalled = isOurStatus(s.statusLine);
  const ok = (b) => (b ? C.green('✓') : C.red('✗'));

  console.log(C.b('ʕ•ᴥ•ʔ Prompet doctor'));
  console.log(`  ${ok(claudeOk)} claude CLI       ${claudeOk ? C.dim((claude.stdout || '').trim()) : C.red('not found in PATH')}`);
  console.log(`  ${ok(hookInstalled)} hook installed   ${C.dim(SETTINGS)}`);
  console.log(`  ${ok(statusInstalled)} statusline pet`);
  console.log(`  ${C.green('•')} mode             ${C.cyan(cfg.mode)}`);
  console.log(`  ${C.green('•')} optimizeModel    ${C.cyan(cfg.optimizeModel)}`);
  console.log(`  ${C.green('•')} config           ${C.dim(CONFIG_PATH)}`);
  console.log(`  ${C.green('•')} pet state        ${C.dim(JSON.stringify(readState()))}`);
  if (!claudeOk) console.log(C.yellow('\n  Install Claude Code first: https://claude.com/claude-code'));
  if (!hookInstalled)
    console.log(
      C.yellow('\n  Not wired into settings.json. Run `prompet init`, or install the plugin via /plugin.'),
    );
}

async function doOptimize(args) {
  const cfg = loadConfig();
  let text = args.join(' ').trim();
  if (!text) text = (await readStdin()).trim();
  if (!text) {
    console.error(C.red('Nothing to optimize.') + C.dim(' Pass text or pipe via stdin.'));
    process.exit(1);
  }
  const result = await optimize({
    prompt: text,
    model: undefined, // no session here → claude default (or cfg.optimizeModel if set)
    cwd: process.cwd(),
    transcriptPath: null,
    cfg,
  });
  if (!result) {
    console.error(C.red('Optimization failed.') + C.dim(' Run `prompet doctor` to check claude.'));
    process.exit(1);
  }
  process.stdout.write(result + '\n');
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case 'hook': {
      const { runHook } = await import('./hook.js');
      await runHook();
      break;
    }
    case 'statusline': {
      const { runStatusline } = await import('./statusline.js');
      await runStatusline();
      break;
    }
    case 'optimize':
      await doOptimize(args);
      break;
    case 'config':
      printConfig();
      break;
    case 'set':
      if (args.length < 2) {
        console.error(C.red('Usage: prompet set <key> <value>'));
        process.exit(1);
      }
      setKey(args[0], args.slice(1).join(' '));
      break;
    case 'mode':
      setMode(args[0]);
      break;
    case 'on':
      setMode('auto');
      break;
    case 'off':
      setMode('off');
      break;
    case 'init':
      doInit();
      break;
    case 'uninstall':
      doUninstall();
      break;
    case 'doctor':
      doDoctor();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log('prompet ' + VERSION);
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      break;
    default:
      console.error(C.red(`Unknown command: ${cmd}`));
      console.log(HELP);
      process.exit(1);
  }
}

main().catch(() => process.exit(1));
