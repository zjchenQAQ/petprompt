<div align="center">

# ʕ•ᴥ•ʔ Prompet

**A cute terminal pet that quietly refines your rough prompts into great ones — using your current Claude Code session's context, memory, and model.**

No API key. No separate chat. No copy‑paste round‑trips.

<!-- TODO: replace with a real demo GIF -->
<!-- ![Prompet demo](assets/demo.gif) -->

</div>

---

## The problem

You're deep in Claude Code. You type a quick, rough prompt:

> make the login page

…and you *know* it would go better if you'd written:

> Update `src/pages/Login.tsx`: add email + password validation with inline error
> states, a "remember me" checkbox, and a responsive layout matching our Tailwind theme.

So you stop, open another chat, paste your prompt, ask "optimize this," wait, copy the
result back, and finally run it. **Every single time.**

Prompet removes that whole detour. It lives *inside* your session and polishes the prompt
for you, the moment you hit enter.

## How it works

Prompet registers a Claude Code **`UserPromptSubmit` hook**. When you submit a prompt:

```
your rough prompt
        │
        ▼
  ┌───────────┐   reads: this session's model · transcript · CLAUDE.md memory
  │  Prompet  │ ──────────────────────────────────────────────────────────────►
  │   hook    │   calls your installed `claude -p` (same login, model & quota)
  └───────────┘
        │
        ▼
  a clear, context‑aware prompt is handed to Claude — and the pet cheers ✨
```

- **Uses your session, not a separate brain.** The refinement runs on the *same model your
  window is using*, through your existing Claude Code login — so there's **no API key** and
  it counts against the **same quota**. (Set a faster model just for refining if you like.)
- **Context‑aware, like `/btw` without the typing.** It reads the recent conversation and
  your project + user `CLAUDE.md` memory, so "make the login page" becomes a prompt that
  actually knows your stack and files.
- **Safe by design.** Claude still sees your original prompt; the refined version is added
  as authoritative guidance, not a silent swap. If anything fails or times out, your
  original prompt goes through **untouched** — Prompet never blocks you.
- **A pet in your statusline.** ʕ•ᴥ•ʔ idles, spins while refining, and gives a ✨ when done.

## Install

### Option A — Claude Code plugin (recommended)

```text
/plugin marketplace add zjchenQAQ/prompet
/plugin install prompet
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

Once installed, just use Claude Code normally. Substantive prompts get refined
automatically; trivial ones (`yes`, `continue`, `run it`, slash commands…) are left alone.

Prefer to drive it yourself? Use the preview command — it shows the refined prompt for you
to review instead of auto‑applying:

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
| `auto` *(default)* | Refine substantive prompts automatically; skip trivial ones. |
| `marker` | Only refine prompts that start with the marker (default `pp `). |
| `manual` | Never auto‑refine; use `/prompet:optimize` when you want it. |
| `off` | Do nothing. |

## Configuration

`prompet config` prints everything; `prompet set <key> <value>` changes it. Stored at
`~/.claude/prompet/config.json`.

| Key | Default | Meaning |
| --- | --- | --- |
| `mode` | `auto` | `auto` · `marker` · `manual` · `off` |
| `optimizeModel` | `inherit` | `inherit` = your session model; or an id like `claude-haiku-4-5` for speed |
| `marker` | `pp ` | Prefix that triggers refinement in `marker` mode |
| `minWords` / `minChars` | `4` / `16` | Auto‑mode: skip prompts shorter than this |
| `contextMessages` | `12` | How many recent messages to feed the optimizer |
| `timeoutMs` | `25000` | Refinement timeout (kept under the 30s hook limit) |
| `showNote` | `true` | Show a one‑line note when a prompt is refined |

```bash
prompet set optimizeModel claude-haiku-4-5   # faster, cheaper refining
prompet mode marker                          # only refine prompts starting with "pp "
prompet off                                   # pause Prompet
```

## Privacy

Prompet runs entirely on your machine and talks only to your own `claude` CLI. Your prompt,
recent conversation, and memory are sent to Claude **the same way your normal prompts
already are** — nothing goes anywhere else, and there's no third‑party server or key.

## Commands

```text
prompet init | uninstall | doctor        setup & diagnostics
prompet on | off | mode <m>              behaviour
prompet config | set <key> <value>       configuration
prompet optimize [text]                  refine a prompt and print it
prompet help | version
```

## Roadmap

- [ ] **Codex support** (`codex exec`‑based refinement) — *next update*
- [ ] Clipboard / global‑hotkey mode for use outside coding agents
- [ ] A before/after diff view
- [ ] Pet personalities, skins & a 中文 version

## Contributing

Issues and PRs welcome. Prompet is intentionally **zero‑dependency, pure Node** so the hook
stays fast and installs anywhere.

## License

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
