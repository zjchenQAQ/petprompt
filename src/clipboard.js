// Cross-platform "copy text to clipboard" with graceful fallback. Returns true on success.
import { spawnSync } from 'node:child_process';

export function copyToClipboard(text) {
  const candidates =
    process.platform === 'darwin'
      ? [['pbcopy', []]]
      : process.platform === 'win32'
        ? [['clip', []]]
        : [
            ['wl-copy', []],
            ['xclip', ['-selection', 'clipboard']],
            ['xsel', ['--clipboard', '--input']],
          ];

  for (const [cmd, args] of candidates) {
    try {
      const r = spawnSync(cmd, args, { input: text });
      if (r.status === 0) return true;
    } catch {
      /* try next */
    }
  }
  return false;
}
