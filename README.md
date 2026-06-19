<div align="center">

# ʕ•ᴥ•ʔ Prompet

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**A cute terminal pet that rewrites your prompts to follow prompt-engineering best practices — same meaning, clearer wording — using your current Claude Code session's context, memory, and model.**

No API key. No separate chat. No copy-paste round-trips. It only acts when you ask it to.

<!-- TODO: replace with a real demo GIF -->
<!-- ![Prompet demo](assets/demo.gif) -->

</div>

---

## The problem

You're deep in Claude Code. You fire off a long, rambling prompt as it comes to mind:

> ok so theres this bug i think — when a user uploads a really big CSV the whole thing just hangs and sometimes the tab crashes, idk if it's the parsing or what, can you look into the upload component, oh and it should probably show some kind of progress thing because right now you have no idea what's happening, and maybe don't load the whole file into memory at once that seems bad, also the error message when it fails is just "error" which is useless

It runs better when it's phrased the way prompt engineering recommends — clear, direct, structured — **without changing what you're asking for**:

> In the CSV upload component, fix the hang and occasional tab crash that happen with very large files. Specifically:
>
> - Parse the file in streamed chunks instead of loading it all into memory.
> - Show upload/parse progress to the user.
> - Replace the generic "error" message with a meaningful one on failure.
>
> Start by checking whether the bottleneck is the parsing.

Every requirement above was already in the original — just buried in the ramble. Same scope, nothing added; only organized and made clear. Normally you'd stop, open another chat, paste it, ask "rewrite this as a clean prompt," wait, copy it back, and only then run it. **Every single time.**

Prompet removes that whole detour. It lives *inside* your session and rewrites the prompt for you, the moment you ask.

## How it works

Prompet registers a Claude Code **`UserPromptSubmit` hook**. When you submit a prompt you've marked for refinement (by default, one that starts with `pp ` — see [Modes](#modes)):

```
pp your rambling prompt
        │
        ▼
  ┌───────────┐   reads: this session's model · transcript · CLAUDE.md memory
  │  Prompet  │ ──────────────────────────────────────────────────────────────►
  │   hook    │   calls your installed `claude -p` (same login, model & quota)
  └───────────┘
        │
        ▼
  a clearer, same-meaning prompt is handed to Claude — and the pet cheers ✨
```

- **Uses your session, not a separate brain.** The refinement runs on the *same model your
  window is using*, through your existing Claude Code login — so there's **no API key** and
  it counts against the **same quota**. (Set a faster model just for refining if you like.)
- **Rephrases, never pads.** It rewrites your wording to follow prompt-engineering best
  practices — clear, specific, unambiguous — while keeping your **meaning and scope
  unchanged**. It uses the recent conversation and your `CLAUDE.md` memory only to resolve
  ambiguous references (what "it" / "this" means) and use the right names — never to add new
  requirements.
- **On demand, not in your way.** Prompet only acts on prompts you mark; everything else
  goes straight through. Flip it to fully automatic with `prompet mode auto` if you prefer.
- **Safe by design.** Claude still sees your original prompt; the rewrite is added as
  guidance, not a silent swap. If anything fails or times out, your original prompt goes
  through **untouched** — Prompet never blocks you.
- **A pet in your statusline.** ʕ•ᴥ•ʔ idles, spins while refining, and gives a ✨ when done.

## Install

### Option A — Claude Code plugin (recommended)

```text
/plugin marketplace add zjchenQAQ/prompet
/plugin install prompet@prompet
```

Then restart Claude Code. That's it — hook, statusline pet, and the `/prompet:optimize`
command are all wired up.

### Option B — npm + one command

```bash
npm install -g prompet
prompet init       # writes the hook + statusline into ~/.claude/settings.json
prompet doctor     # verify everything is ready
```

> Requires **Node.js ≥ 18** and the **Claude Code CLI** (`claude`) on your PATH.

## Usage

Once installed, prefix any prompt with `pp ` to have Prompet rewrite it before Claude runs it:

```text
pp the users query feels slow, look into it
```

Prompet rewrites it into a clean, prompt-engineering-style version (same meaning) and hands
that to Claude. Prompts **without** the marker are left completely alone — Prompet only acts
when you ask it to. (Want it on for every prompt? `prompet mode auto`.)

Prefer to review before running? Use the preview command — it shows the rewrite without
applying it:

```text
/prompet:optimize add a dark mode toggle
```

Or from any shell:

```bash
prompet optimize "add a dark mode toggle"
echo "add a dark mode toggle" | prompet optimize
```

## Modes

Switch how the hook behaves with `prompet mode <m>` (or `prompet on` / `prompet off`):

| Mode | Behaviour |
| --- | --- |
| `marker` *(default)* | Only refine prompts that start with the marker (`pp `) — you choose when. |
| `manual` | Never auto-refine; use `/prompet:optimize` when you want it. |
| `auto` | Refine every substantive prompt automatically (opt-in). |
| `off` | Do nothing. |

## Configuration

`prompet config` prints everything; `prompet set <key> <value>` changes it. Stored at
`~/.claude/prompet/config.json`.

| Key | Default | Meaning |
| --- | --- | --- |
| `mode` | `marker` | `marker` · `manual` · `auto` · `off` |
| `optimizeModel` | `inherit` | `inherit` = your session model; or an id like `claude-haiku-4-5` for speed |
| `lang` | `auto` | UI language: `auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | Prefix that triggers refinement in `marker` mode |
| `minWords` / `minChars` | `4` / `16` | `auto` mode: skip prompts shorter than this |
| `contextMessages` | `12` | How many recent messages to feed the rewriter |
| `timeoutMs` | `25000` | Refinement timeout (kept under the 30s hook limit) |
| `showNote` | `true` | Show a one-line note when a prompt is refined |

```bash
prompet set optimizeModel claude-haiku-4-5   # faster, cheaper refining
prompet mode auto                            # refine every substantive prompt (opt-in)
prompet lang en                              # force the UI language
prompet off                                   # pause Prompet
```

## Privacy

Prompet runs entirely on your machine and talks only to your own `claude` CLI. Your prompt,
recent conversation, and memory are sent to Claude **the same way your normal prompts
already are** — nothing goes anywhere else, and there's no third-party server or key.

## Commands

```text
prompet init | uninstall | doctor        setup & diagnostics
prompet on | off | mode <m>              behaviour
prompet lang <code>                      UI language (auto | en | zh | ja)
prompet config | set <key> <value>       configuration
prompet optimize [text]                  rewrite a prompt and print it
prompet help | version
```

## Roadmap

- [x] Localized UI + README (English / 简体中文 / 日本語)
- [ ] **Codex support** (`codex exec`-based refinement) — *next update*
- [ ] Clipboard / global-hotkey mode for use outside coding agents
- [ ] A before/after diff view
- [ ] Pet personalities & skins

## Star History

<a href="https://star-history.com/#zjchenQAQ/prompet&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date" width="600" />
  </picture>
</a>

## Contributing

Issues and PRs welcome. Prompet is intentionally **zero-dependency, pure Node** so the hook
stays fast and installs anywhere.

## License

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
