# Codex support — research notes (deferred)

Status: **planned for a later release.** v0.1 ships Claude Code only. This file captures the
research (June 2026) so the Codex phase starts from facts, not a blank page.

## Bottom line

Mirror the Claude Code design: a **UserPromptSubmit-style command hook** is the only
deterministic in-session, pre-send integration point. It runs on the session's existing
**ChatGPT auth (no API key)**, and like Claude Code it is **append-only** — you can add
context or block, but not rewrite the prompt in place (in-place rewrite is "reserved for the
future"). The pet cannot live in Codex's status line; render it via `terminal_title` or a
sidecar instead.

## Findings

- **Status line:** Codex has **no scriptable status line.** Open issue #17827 ("Customizable
  status line") confirms there's no equivalent to Claude Code's command statusline;
  `tui.status_line` accepts only a fixed enum of built-in items — no arbitrary text,
  command output, conditional formatting, or ANSI colors. → pet via `terminal_title` or a
  separate sidecar process.
- **Auth / quota:** ChatGPT login is cached and reused; `codex exec` reuses it and usage is
  **included in your plan when signed in with ChatGPT**. API keys are recommended only for
  CI/CD, not required. → matches our "no key, follow the session" goal.
- **Headless entry:** `codex exec "<task>"` — flags include `--json`, `-o <file>`,
  `--model <id>`. Treat it as a **fresh** session (no live interactive context) unless a
  resume/attach mechanism is confirmed. TODO: check for `--resume`/session-id.
- **On-disk state:** sessions/config live under `~/.codex/`; project instructions =
  `AGENTS.md`; global config = `config.toml`. An external script can likely read the latest
  session transcript to reconstruct context (verify path/format on a live install).
- **MCP:** supported via `config.toml` (`[mcp_servers.<name>]` + `[mcp_servers.<name>.env]`,
  `env_vars = [...]`; add with `codex mcp add <name> -- <cmd>`). But MCP tools are
  **model-invoked**, not pre-send interceptors → not suitable for automatic "rewrite my
  prompt" behavior. Useful only for an explicit, model-triggered optimize tool.

## TODO before building the Codex phase

- [ ] Confirm the exact Codex hook mechanism name + input/output schema on a live install.
- [ ] Confirm how to detect the current session's model (config.toml key? env var?).
- [ ] Confirm the session transcript path + format under `~/.codex/`.
- [ ] Decide pet rendering: `terminal_title` vs. sidecar.
- [ ] Factor `optimize.js` backend selection so `claude -p` / `codex exec` are interchangeable.
