// Minimal i18n for PetPrompt's user-facing strings. Language resolves from config
// (`lang`: auto | en | zh | ja); 'auto' falls back to $LC_ALL/$LANG/$LANGUAGE, then 'en'.
import { loadConfig } from './config.js';

const STR = {
  en: {
    cfgTitle: 'PetPrompt config',
    unknownKey: (k) => `Unknown key: ${k}`,
    validKeys: 'Valid keys',
    invalidMode: (m) => `Invalid mode: ${m}`,
    invalidLang: (l) => `Invalid language: ${l}`,
    langUsage: 'Usage: petprompt lang <auto|en|zh|ja>',
    installedInto: 'PetPrompt installed into',
    hookLabel: 'hook:',
    statusLabel: 'statusline:',
    statuslinePet: 'PetPrompt pet',
    alreadyPresent: 'already present',
    replacedStatus: 'Replaced an existing statusLine (backed up to settings.json.bak).',
    restartHint: 'Restart Claude Code (or /hooks reload) to activate.',
    nothingToRemove: 'Nothing to remove.',
    removedFrom: 'PetPrompt removed from',
    docTitle: 'ʕ•ᴥ•ʔ PetPrompt doctor',
    docClaude: 'claude CLI',
    docNotFound: 'not found in PATH',
    docHook: 'hook installed',
    docStatus: 'statusline pet',
    docMode: 'mode',
    docModel: 'optimizeModel',
    docConfig: 'config',
    docState: 'pet state',
    docInstallClaude: 'Install Claude Code first: https://claude.com/claude-code',
    docNotWired: 'Not wired into settings.json. Run `petprompt init`, or install the plugin via /plugin.',
    nothingToOptimize: 'Nothing to optimize.',
    nothingToOptimizeHint: ' Pass text or pipe via stdin.',
    optimizeFailed: 'Optimization failed.',
    optimizeFailedHint: ' Run `petprompt doctor` to check claude.',
    unknownCommand: (c) => `Unknown command: ${c}`,
    sysRefined: '✨ PetPrompt refined your prompt',
    petRefining: 'refining…',
    petRefined: '✨ refined',
    previewTitle: 'paste & press Enter to run',
    previewCopied: '✓ Copied to clipboard.',
    previewManual: '(Copy the text above to run it.)',
    autoNote: 'PetPrompt rewrote your prompt',
  },
  zh: {
    cfgTitle: 'PetPrompt 配置',
    unknownKey: (k) => `未知配置项：${k}`,
    validKeys: '可用配置项',
    invalidMode: (m) => `无效模式：${m}`,
    invalidLang: (l) => `无效语言：${l}`,
    langUsage: '用法：petprompt lang <auto|en|zh|ja>',
    installedInto: 'PetPrompt 已安装到',
    hookLabel: 'hook：',
    statusLabel: '状态栏桌宠：',
    statuslinePet: 'PetPrompt 桌宠',
    alreadyPresent: '已存在',
    replacedStatus: '已替换原有 statusLine（已备份到 settings.json.bak）。',
    restartHint: '重启 Claude Code（或 /hooks reload）后生效。',
    nothingToRemove: '没有需要移除的内容。',
    removedFrom: 'PetPrompt 已从以下文件移除',
    docTitle: 'ʕ•ᴥ•ʔ PetPrompt 自检',
    docClaude: 'claude 命令',
    docNotFound: '未在 PATH 中找到',
    docHook: 'hook 已安装',
    docStatus: '状态栏桌宠',
    docMode: '模式',
    docModel: '优化模型',
    docConfig: '配置',
    docState: '桌宠状态',
    docInstallClaude: '请先安装 Claude Code：https://claude.com/claude-code',
    docNotWired: '尚未写入 settings.json。运行 `petprompt init`，或通过 /plugin 安装插件。',
    nothingToOptimize: '没有可优化的内容。',
    nothingToOptimizeHint: ' 请传入文本，或通过标准输入管道传入。',
    optimizeFailed: '优化失败。',
    optimizeFailedHint: ' 运行 `petprompt doctor` 检查 claude。',
    unknownCommand: (c) => `未知命令：${c}`,
    sysRefined: '✨ PetPrompt 已优化你的 prompt',
    petRefining: '优化中…',
    petRefined: '✨ 已优化',
    previewTitle: '粘贴后回车运行',
    previewCopied: '✓ 已复制到剪贴板。',
    previewManual: '（复制上面的文本即可运行。）',
    autoNote: 'PetPrompt 已改写你的 prompt',
  },
  ja: {
    cfgTitle: 'PetPrompt 設定',
    unknownKey: (k) => `不明な設定項目: ${k}`,
    validKeys: '有効な設定項目',
    invalidMode: (m) => `無効なモード: ${m}`,
    invalidLang: (l) => `無効な言語: ${l}`,
    langUsage: '使い方: petprompt lang <auto|en|zh|ja>',
    installedInto: 'PetPrompt をインストールしました:',
    hookLabel: 'フック:',
    statusLabel: 'ステータスラインのペット:',
    statuslinePet: 'PetPrompt ペット',
    alreadyPresent: '既に存在します',
    replacedStatus: '既存の statusLine を置き換えました（settings.json.bak にバックアップ済み）。',
    restartHint: 'Claude Code を再起動（または /hooks reload）すると有効になります。',
    nothingToRemove: '削除する項目はありません。',
    removedFrom: 'PetPrompt を次のファイルから削除しました:',
    docTitle: 'ʕ•ᴥ•ʔ PetPrompt ドクター',
    docClaude: 'claude CLI',
    docNotFound: 'PATH に見つかりません',
    docHook: 'フック導入済み',
    docStatus: 'ステータスラインのペット',
    docMode: 'モード',
    docModel: '最適化モデル',
    docConfig: '設定',
    docState: 'ペットの状態',
    docInstallClaude: 'まず Claude Code をインストールしてください: https://claude.com/claude-code',
    docNotWired: 'settings.json に未設定です。`petprompt init` を実行するか、/plugin でプラグインを導入してください。',
    nothingToOptimize: '最適化する内容がありません。',
    nothingToOptimizeHint: ' テキストを渡すか、標準入力でパイプしてください。',
    optimizeFailed: '最適化に失敗しました。',
    optimizeFailedHint: ' `petprompt doctor` を実行して claude を確認してください。',
    unknownCommand: (c) => `不明なコマンド: ${c}`,
    sysRefined: '✨ PetPrompt がプロンプトを最適化しました',
    petRefining: '最適化中…',
    petRefined: '✨ 最適化完了',
    previewTitle: '貼り付けて Enter で実行',
    previewCopied: '✓ クリップボードにコピーしました。',
    previewManual: '（上のテキストをコピーして実行してください。）',
    autoNote: 'PetPrompt がプロンプトを書き換えました',
  },
};

export const LANGS = ['auto', 'en', 'zh', 'ja'];

let _lang = null;
export function detectLang() {
  if (_lang) return _lang;
  let lang = 'en';
  try {
    const cfg = loadConfig();
    if (cfg.lang && cfg.lang !== 'auto' && STR[cfg.lang]) {
      lang = cfg.lang;
    } else {
      const env = (process.env.LC_ALL || process.env.LANG || process.env.LANGUAGE || '').toLowerCase();
      if (env.startsWith('zh')) lang = 'zh';
      else if (env.startsWith('ja')) lang = 'ja';
    }
  } catch {
    /* default en */
  }
  _lang = lang;
  return _lang;
}

export function t(key, ...args) {
  const table = STR[detectLang()] || STR.en;
  let v = table[key];
  if (v === undefined) v = STR.en[key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(...args) : v;
}

// Help is built with color helpers + version, so it's a dedicated builder per language.
export function helpText(C, v) {
  const lang = detectLang();
  if (lang === 'zh') {
    return `${C.cyan('ʕ•ᴥ•ʔ PetPrompt')} ${C.dim('v' + v)} —— 帮你优化 prompt 的可爱桌宠。

${C.b('用法：')} petprompt <命令>

${C.b('安装')}
  init               把 hook + 状态栏桌宠写入 ~/.claude/settings.json
  uninstall          从 ~/.claude/settings.json 移除 PetPrompt
  doctor             检查是否准备就绪

${C.b('行为')}
  pet [名字|on|off]  选择桌宠角色 / 显示或隐藏状态栏桌宠
  mode <m>           模式：preview | auto | manual | off
  on / off           开启(preview) / 关闭
  lang <code>        界面语言：auto | en | zh | ja
  config             打印当前配置
  set <键> <值>      设置某项配置（如 set optimizeModel claude-haiku-4-5）

${C.b('使用')}
  optimize [文本]    优化一段 prompt 并打印（无文本则读取标准输入）
  help               显示本帮助

${C.b('内部')}（由 Claude Code 调用）
  hook               运行 UserPromptSubmit hook
  statusline         渲染状态栏桌宠`;
  }
  if (lang === 'ja') {
    return `${C.cyan('ʕ•ᴥ•ʔ PetPrompt')} ${C.dim('v' + v)} — プロンプトを最適化してくれる可愛いペット。

${C.b('使い方:')} petprompt <コマンド>

${C.b('セットアップ')}
  init               フック + ステータスラインを ~/.claude/settings.json に設定
  uninstall          ~/.claude/settings.json から PetPrompt を削除
  doctor             準備が整っているか確認

${C.b('動作')}
  pet [名前|on|off]  キャラクター選択 / ステータスラインの表示・非表示
  mode <m>           モード: preview | auto | manual | off
  on / off           有効化(preview) / 無効化
  lang <code>        表示言語: auto | en | zh | ja
  config             現在の設定を表示
  set <key> <value>  設定値を変更（例: set optimizeModel claude-haiku-4-5）

${C.b('利用')}
  optimize [text]    プロンプトを最適化して表示（テキスト無しなら標準入力）
  help               このヘルプを表示

${C.b('内部')}（Claude Code が呼び出す）
  hook               UserPromptSubmit フックを実行
  statusline         ステータスラインのペットを描画`;
  }
  return `${C.cyan('ʕ•ᴥ•ʔ PetPrompt')} ${C.dim('v' + v)} — a cute pet that refines your prompts.

${C.b('Usage:')} petprompt <command>

${C.b('Setup')}
  init               Wire the hook + statusline into ~/.claude/settings.json
  uninstall          Remove PetPrompt from ~/.claude/settings.json
  doctor             Check that everything is ready

${C.b('Behaviour')}
  pet [name|on|off]  Choose a character / show or hide the statusline pet
  mode <m>           Set mode: preview | auto | manual | off
  on / off           Enable (preview) / disable
  lang <code>        UI language: auto | en | zh | ja
  config             Print the current config
  set <key> <value>  Set a config value (e.g. set optimizeModel claude-haiku-4-5)

${C.b('Use')}
  optimize [text]    Refine a prompt and print it (reads stdin if no text)
  help               Show this help

${C.b('Internal')} (called by Claude Code)
  hook               Run the UserPromptSubmit hook
  statusline         Render the statusline pet`;
}
