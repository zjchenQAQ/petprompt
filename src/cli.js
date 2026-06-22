#!/usr/bin/env node
// PetPrompt CLI: single entry point for the hook, the statusline, config, and install.
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { loadConfig, saveConfig, DEFAULT_CONFIG, CONFIG_PATH } from './config.js';
import { readState } from './state.js';
import { optimize } from './optimize.js';
import { t, helpText, LANGS } from './i18n.js';
import { CHARACTERS, characterKeys } from './characters.js';
import { renderPet } from './pet.js';

const SELF = fileURLToPath(import.meta.url);
// Use bare `node` (resolved from PATH in the hook/statusline exec environment) rather than
// process.execPath, so the wiring survives Node upgrades / version-pinned paths.
const NODE = 'node';
const SETTINGS = join(homedir(), '.claude', 'settings.json');
const HOOK_CMD = `"${NODE}" "${SELF}" hook`;
const STATUS_CMD = `"${NODE}" "${SELF}" statusline`;
const VERSION = '0.1.0';

// Identify PetPrompt's own entries by their command referencing this cli.js (robust to
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

function printConfig() {
  const cfg = loadConfig();
  console.log(C.b(t('cfgTitle')) + C.dim(' (' + CONFIG_PATH + ')'));
  for (const k of Object.keys(DEFAULT_CONFIG)) {
    const v = cfg[k];
    const shown = Array.isArray(v) ? `[${v.length} pattern(s)]` : JSON.stringify(v);
    console.log(`  ${k.padEnd(16)} ${C.cyan(shown)}`);
  }
}

function setKey(key, raw) {
  if (!(key in DEFAULT_CONFIG)) {
    console.error(C.red(t('unknownKey', key)));
    console.error(C.dim(t('validKeys') + ': ' + Object.keys(DEFAULT_CONFIG).join(', ')));
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
  const valid = ['preview', 'auto', 'manual', 'off'];
  if (!valid.includes(mode)) {
    console.error(C.red(t('invalidMode', mode)) + C.dim(' (' + valid.join(' | ') + ')'));
    process.exit(1);
  }
  const cfg = loadConfig();
  cfg.mode = mode;
  saveConfig(cfg);
  console.log(C.green('✓') + ` mode = ${mode}`);
}

function setLang(lang) {
  if (!LANGS.includes(lang)) {
    console.error(C.red(t('invalidLang', lang)) + C.dim(' (' + LANGS.join(' | ') + ')'));
    process.exit(1);
  }
  const cfg = loadConfig();
  cfg.lang = lang;
  saveConfig(cfg);
  console.log(C.green('✓') + ` lang = ${lang}`);
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

  s.hooks = s.hooks || {};
  const list = Array.isArray(s.hooks.UserPromptSubmit) ? s.hooks.UserPromptSubmit : [];
  const already = list.some(isOurHook);
  if (!already) {
    list.push({ hooks: [{ type: 'command', command: HOOK_CMD, timeout: 30 }] });
  }
  s.hooks.UserPromptSubmit = list;

  let statusNote = '';
  if (s.statusLine && !isOurStatus(s.statusLine)) {
    statusNote = C.yellow('  ! ' + t('replacedStatus'));
  }
  s.statusLine = { type: 'command', command: STATUS_CMD, padding: 0 };

  saveConfig(loadConfig()); // ensure config dir/file exist
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');

  console.log(C.green('✓ ' + t('installedInto') + ' ') + SETTINGS);
  console.log('  ' + C.dim(t('hookLabel') + ' ') + (already ? C.dim(t('alreadyPresent')) : C.cyan('UserPromptSubmit')));
  console.log('  ' + C.dim(t('statusLabel') + ' ') + C.cyan(t('statuslinePet')));
  if (statusNote) console.log(statusNote);
  console.log(C.dim('  ' + t('restartHint')));
}

function doUninstall() {
  if (!existsSync(SETTINGS)) return console.log(C.dim(t('nothingToRemove')));
  const s = readJson(SETTINGS, {});
  backup(SETTINGS);
  if (s.hooks?.UserPromptSubmit) {
    s.hooks.UserPromptSubmit = s.hooks.UserPromptSubmit.filter((e) => !isOurHook(e));
    if (s.hooks.UserPromptSubmit.length === 0) delete s.hooks.UserPromptSubmit;
  }
  if (isOurStatus(s.statusLine)) delete s.statusLine;
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');
  console.log(C.green('✓ ' + t('removedFrom') + ' ') + SETTINGS);
}

function doDoctor() {
  const cfg = loadConfig();
  const claude = spawnSync('claude', ['--version'], { encoding: 'utf8' });
  const claudeOk = claude.status === 0;
  const s = readJson(SETTINGS, {});
  const hookInstalled = (s.hooks?.UserPromptSubmit || []).some(isOurHook);
  const statusInstalled = isOurStatus(s.statusLine);
  const ok = (b) => (b ? C.green('✓') : C.red('✗'));

  console.log(C.b(t('docTitle')));
  console.log(`  ${ok(claudeOk)} ${t('docClaude')}: ${claudeOk ? C.dim((claude.stdout || '').trim()) : C.red(t('docNotFound'))}`);
  console.log(`  ${ok(hookInstalled)} ${t('docHook')}: ${C.dim(SETTINGS)}`);
  console.log(`  ${ok(statusInstalled)} ${t('docStatus')}`);
  console.log(`  ${C.green('•')} ${t('docMode')}: ${C.cyan(cfg.mode)}`);
  console.log(`  ${C.green('•')} ${t('docModel')}: ${C.cyan(cfg.optimizeModel)}`);
  console.log(`  ${C.green('•')} ${t('docConfig')}: ${C.dim(CONFIG_PATH)}`);
  console.log(`  ${C.green('•')} ${t('docState')}: ${C.dim(JSON.stringify(readState()))}`);
  if (!claudeOk) console.log(C.yellow('\n  ' + t('docInstallClaude')));
  if (!hookInstalled) console.log(C.yellow('\n  ' + t('docNotWired')));
}

async function doOptimize(args) {
  const cfg = loadConfig();
  let text = args.join(' ').trim();
  if (!text) text = (await readStdin()).trim();
  if (!text) {
    console.error(C.red(t('nothingToOptimize')) + C.dim(t('nothingToOptimizeHint')));
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
    console.error(C.red(t('optimizeFailed')) + C.dim(t('optimizeFailedHint')));
    process.exit(1);
  }
  process.stdout.write(result + '\n');
}

function setCharacter(name) {
  if (!characterKeys().includes(name)) {
    console.error(C.red('Unknown character: ' + name) + C.dim(' (' + characterKeys().join(' | ') + ')'));
    process.exit(1);
  }
  const cfg = loadConfig();
  cfg.character = name;
  saveConfig(cfg);
  console.log(C.green('✓') + ` character = ${name}`);
  console.log(renderPet({ status: 'done', ts: Date.now() }, { character: name }));
}

// Wire only the statusline (the pet) into ~/.claude/settings.json. Plugin users use this
// because plugins cannot register a statusline themselves.
function wireStatusline(enable) {
  mkdirSync(dirname(SETTINGS), { recursive: true });
  const s = readJson(SETTINGS, {});
  backup(SETTINGS);
  if (enable) s.statusLine = { type: 'command', command: STATUS_CMD, padding: 0 };
  else if (isOurStatus(s.statusLine)) delete s.statusLine;
  saveConfig(loadConfig());
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2) + '\n');
  console.log(C.green('✓') + (enable ? ' pet statusline enabled ' : ' pet statusline removed ') + C.dim(SETTINGS));
  if (enable) console.log(C.dim('  ' + t('restartHint')));
}

function doPet(args) {
  const sub = args[0];
  if (sub === 'on' || sub === 'enable') return wireStatusline(true);
  if (sub === 'off' || sub === 'disable') return wireStatusline(false);
  if (sub && sub !== 'list') return setCharacter(sub);

  const cfg = loadConfig();
  console.log(C.b('PetPrompt characters') + C.dim('  (current: ' + cfg.character + ')'));
  for (const k of characterKeys()) {
    const cur = k === cfg.character ? C.green('  ◀ current') : '';
    console.log('\n' + C.cyan(k) + C.dim('  ' + CHARACTERS[k].name + ' — ' + CHARACTERS[k].blurb) + cur);
    console.log(renderPet({ status: 'idle', ts: Date.now() }, { character: k }));
  }
  console.log(C.dim('\n  petprompt pet <name>    choose a character'));
  console.log(C.dim('  petprompt pet on|off    show/hide the statusline pet'));
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
    case 'demo': {
      const { runDemo } = await import('./demo.js');
      await runDemo();
      break;
    }
    case 'config':
      printConfig();
      break;
    case 'set':
      if (args.length < 2) {
        console.error(C.red('Usage: petprompt set <key> <value>'));
        process.exit(1);
      }
      setKey(args[0], args.slice(1).join(' '));
      break;
    case 'mode':
      setMode(args[0]);
      break;
    case 'lang':
      if (!args[0]) {
        console.error(C.red(t('langUsage')));
        process.exit(1);
      }
      setLang(args[0]);
      break;
    case 'on':
      setMode('preview');
      break;
    case 'off':
      setMode('off');
      break;
    case 'pet':
    case 'character':
      doPet(args);
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
      console.log('petprompt ' + VERSION);
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(helpText(C, VERSION));
      break;
    default:
      console.error(C.red(t('unknownCommand', cmd)));
      console.log(helpText(C, VERSION));
      process.exit(1);
  }
}

main().catch(() => process.exit(1));
