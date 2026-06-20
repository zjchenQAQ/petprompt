<div align="center">

# ʕ•ᴥ•ʔ PetPrompt

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**A cute terminal pet that rewrites your prompts to follow prompt-engineering best practices — same meaning, clearer wording — using your current Claude Code session's context, memory, and model.**

No API key. No separate chat. No copy-paste round-trips. It only acts when you ask it to.

<!-- TODO: replace with a real demo GIF -->
<!-- ![PetPrompt demo](assets/demo.gif) -->

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

PetPrompt removes that whole detour. It lives *inside* your session and rewrites the prompt the moment you ask.

## How it works

PetPrompt registers a Claude Code **`UserPromptSubmit` hook**. By default (`preview` mode), when you prefix a prompt with `pp `:

```
pp your rambling prompt
        │
        ▼
  ┌─────────────┐   reads: this session's model · transcript · CLAUDE.md memory
  │  PetPrompt  │ ──────────────────────────────────────────────────────────────►
  │    hook     │   calls your installed `claude -p` (same login, model & quota)
  └─────────────┘
        │
        ▼
  raw prompt is BLOCKED · clean rewrite is shown + copied to your clipboard
        │
        ▼
  paste (the pet cheers ✨) + Enter  →  Claude runs the clean version
```

- **Uses your session, not a separate brain.** The rewrite runs on the *same model your
  window is using*, through your existing Claude Code login — so there's **no API key** and
  it counts against the **same quota**. (Set a faster model just for rewriting if you like.)
- **Rephrases, never pads.** It rewrites your wording to follow prompt-engineering best
  practices while keeping your **meaning and scope unchanged**. It uses the recent
  conversation and your `CLAUDE.md` memory only to resolve ambiguous references (what "it" /
  "this" means) and use the right names — never to add new requirements.
- **You see it and approve it.** In `preview` mode your raw prompt is **blocked** (it never
  reaches Claude), the rewrite is shown and copied to your clipboard, and you paste + Enter to
  run it — so only the clean version, which you've read, is sent. Prefer one step?
  `petprompt mode auto` injects the rewrite and runs immediately.
- **Safe by design.** If anything fails or times out, your original prompt goes through
  **untouched** — PetPrompt never gets in your way.
- **A pet in your statusline.** Pick a character; it idles, reacts while rewriting, and
  cheers when done.

## Characters

Your pet lives in the statusline. Choose from original characters — each with its own idle,
thinking, and excited animations:

```bash
petprompt pet              # list all characters (with a preview) + show current
petprompt pet cat          # switch character
petprompt pet on | off     # show / hide the statusline pet
```

| Key | Character |
| --- | --- |
| `shiba` *(default)* | 柴犬 — loyal, a little smug; wags its tail |
| `cat` | 猫 — aloof, but secretly cares |
| `slime` | 史莱姆 — bouncy, easily delighted; squishes |
| `fox` | 狐狸 — sly and quick-witted |
| `bunny` | 兔子 — shy; hops when happy |

## Install

### Option A — Claude Code plugin (recommended)

```text
/plugin marketplace add zjchenQAQ/petprompt
/plugin install petprompt@petprompt
```

Then restart Claude Code — the hook and the `/petprompt:optimize` command are wired up.

> **Enable the pet (statusline):** plugins can't register a statusline, so turn it on once:
>
> ```bash
> node ~/.claude/plugins/marketplaces/petprompt/src/cli.js pet on
> ```
>
> then restart Claude Code. (Rewriting works without this — the pet is just the cute part.)

### Option B — npm + one command

```bash
npm install -g petprompt
petprompt init       # writes the hook + statusline pet into ~/.claude/settings.json
petprompt doctor     # verify everything is ready
```

> Requires **Node.js ≥ 18** and the **Claude Code CLI** (`claude`) on your PATH.

## Usage

Prefix any prompt with `pp ` to rewrite it. PetPrompt shows the clean version and copies it
to your clipboard — **paste + Enter to run it** (your raw prompt is never sent):

```text
pp the users query feels slow, look into it
```

Prompts **without** `pp ` are left completely alone. Want it to rewrite and run in one step
instead? `petprompt mode auto` (it rewrites every substantive prompt automatically).

Just want to see a rewrite without running anything?

```text
/petprompt:optimize add a dark mode toggle
```

Or from any shell:

```bash
petprompt optimize "add a dark mode toggle"
echo "add a dark mode toggle" | petprompt optimize
```

## Modes

Switch how the hook behaves with `petprompt mode <m>` (or `petprompt on` / `petprompt off`):

| Mode | Behaviour |
| --- | --- |
| `preview` *(default)* | On the `pp ` marker: block the raw prompt, show the rewrite, copy it to the clipboard. You paste + Enter to run. |
| `auto` | Rewrite every substantive prompt and inject it automatically (one step). |
| `manual` | Never auto-run; use `/petprompt:optimize`. |
| `off` | Do nothing. |

## Configuration

`petprompt config` prints everything; `petprompt set <key> <value>` changes it. Stored at
`~/.claude/petprompt/config.json`.

| Key | Default | Meaning |
| --- | --- | --- |
| `mode` | `preview` | `preview` · `auto` · `manual` · `off` |
| `character` | `shiba` | Statusline pet: `shiba` · `cat` · `slime` · `fox` · `bunny` |
| `optimizeModel` | `inherit` | `inherit` = your session model; or an id like `claude-haiku-4-5` for speed |
| `lang` | `auto` | UI language: `auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | Prefix that triggers a rewrite in `preview` mode |
| `minWords` / `minChars` | `4` / `16` | `auto` mode: skip prompts shorter than this |
| `contextMessages` | `12` | How many recent messages to feed the rewriter |
| `timeoutMs` | `25000` | Rewrite timeout (kept under the 30s hook limit) |
| `showNote` | `true` | Show the rewrite as a note in `auto` mode |

```bash
petprompt set optimizeModel claude-haiku-4-5   # faster, cheaper rewriting
petprompt mode auto                            # rewrite + run in one step
petprompt pet fox                              # change the character
petprompt off                                   # pause PetPrompt
```

## Privacy

PetPrompt runs entirely on your machine and talks only to your own `claude` CLI. Your prompt,
recent conversation, and memory are sent to Claude **the same way your normal prompts
already are** — nothing goes anywhere else, and there's no third-party server or key.

## Commands

```text
petprompt init | uninstall | doctor          setup & diagnostics
petprompt pet [name|on|off]                  choose character / show-hide the pet
petprompt mode <m> | on | off                behaviour (preview | auto | manual | off)
petprompt lang <code>                        UI language (auto | en | zh | ja)
petprompt config | set <key> <value>         configuration
petprompt optimize [text]                    rewrite a prompt and print it
petprompt help | version
```

## Roadmap

- [x] Localized UI + README (English / 简体中文 / 日本語)
- [x] Selectable, animated characters
- [ ] **Codex support** (`codex exec`-based rewriting) — *next update*
- [ ] Clipboard / global-hotkey mode for use outside coding agents
- [ ] A before/after diff view
- [ ] More characters & skins

## Star History

<a href="https://star-history.com/#zjchenQAQ/petprompt&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" width="600" />
  </picture>
</a>

## Contributing

Issues and PRs welcome. PetPrompt is intentionally **zero-dependency, pure Node** so the hook
stays fast and installs anywhere.

## License

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
