# PetPrompt — Update Backlog

Living backlog for continuous daily updates. Built from a multi-agent research sweep
(bug audit + growth brainstorm + competitor/inspiration research, June 2026). Pick 1–2 items
a day; re-run the agents to refill when it runs low (see the `petprompt-daily-cadence` memory).

## Strategic read (this reframes priorities)

1. **The "cute pet" space is crowded and partly first-party.** Anthropic shipped its own
   terminal pet `/buddy` (18 species, rarity, hats, stats); `clawd-on-desk` (~4.7k★);
   `codachi` (statusline tamagotchi, same architecture as us). Generic cute pet is no moat.
2. **Our moat is the REWRITER, not the pet.** Nobody else combines: real session-model
   rewrite (no API key) + clipboard paste-and-run + transparent preview + a pet persona. The
   leading rewriter (~1.6k★) only *injects context* — it can't show a clean rewrite. Lead with this.
3. **The community is allergic to token cost & latency.** Frame PetPrompt as featherweight +
   transparent + *saves tokens/turns*. Preview mode (only acts on `pp`, you approve) is already
   on the right side — make it the pitch.

→ **Throughline:** the pet gets attention; the rewriter is the defensible product. Lead with
the rewriter, dress it in the pet, feed the daily backlog with shareable rewrite cards + community skins.

## Done ✅
- Trilingual UI + READMEs (en/zh/ja) + cross-language localization fixes.
- Selectable animated characters (shiba/cat/slime/fox/bunny), 3-line art.
- Preview flow (block raw → show rewrite → copy to clipboard) + pet in the result card.
- Honest demo GIF (amber, matches Claude Code) via VHS.
- Bug-audit fixes: H1 think-state, H2 marker strip, H3 empty marker, `set` validation, config normalize.

## Now — small & high-leverage (this week)
- [ ] **Reposition README to lead with the rewriter + "saves turns, ~0 token overhead, no API key"** (S) — highest-leverage day. Keep the pet GIF as the charm, but the *headline value* is the rewrite.
- [ ] **Pet personality / quips** (S) — short reactions tied to rewrite quality ("oof, that was a ramble — fixed it ✨" / "clean prompt, barely touched it"). Charm = shares; aligns with "pet feels alive."
- [ ] **Recursion + cost guard** (S) — depth/sentinel guard; spawn the child with `CLAUDECODE` unset (`env -u CLAUDECODE claude -p …`) so the nested-session check doesn't block it; document "featherweight, no MCP, fast hook."
- [ ] **Get listed** (S) — PR into `hesreallyhim/awesome-claude-code` (~36k★, earns a badge), submit to `quemsah/awesome-claude-plugins` index, awesome-terminal-art.
- [ ] **VHS-in-CI** (S) — auto-refresh the demo GIF each release; keep it <5MB / 5–15s.

## Differentiators — medium
- [ ] **Stats / streak engine** (S–M) — `stats.json`: lifetime rewrites, chars saved, daily streak. The data layer behind cards/badges/wrapped (`state.js` already accepts `extra`).
- [ ] **`petprompt share` / rewrite card** (M) — screenshot-ready card (pet + before/after). Every good rewrite → free marketing ("rewrite of the week").
- [ ] **Reactive statusline telemetry** (M) — pet reacts to context % / rate-limit / cost / effort (all free, no tokens). Differentiates from /buddy's one-off card. Add `refreshInterval: 1` so it keeps breathing.
- [ ] **"Turns/tokens saved" surfacing** (M) — `claude -p --output-format json` returns cost; show "this polish cost $0.003, saved ~2 correction turns." Gamify SAVINGS, not spend.
- [ ] **Teaching mode — "why it rewrote it"** (M) — briefly explain the change ("moved requirements into a list; resolved 'it' → the CSV component"). Educational = shareable + builds trust.
- [ ] **Pet growth / levels / evolution** (M) — XP per rewrite → evolves; rare skins. The mascot-brand engine.
- [ ] **Name your pet** (S) — `petprompt pet name Mochi`; shows on the card + cheer. Ownership = attachment.
- [ ] **Rewrite presets** (M) — `pp:plan` / `pp:debug` / `pp:refactor` swap the meta-prompt framing.
- [ ] **Before/after diff in the card** (M) — show what changed; trust + best video material.
- [ ] **Open community pets/skins** (M, then forever) — `CONTRIBUTING-pets.md` + a gallery + `good first issue`. Contributor-driven growth (how oneko/BongoCat/Shimeji became ecosystems).

## Bigger bets — large
- [ ] **Concentrated launch** — Show HN + Product Hunt + r/ClaudeAI + r/commandline + X in one 48–72h window to trigger GitHub Trending. Do once the above land. (Copy ready in `launch-kit.md`.)
- [ ] **Codex support** — `codex exec` provider; pet via `terminal_title`. Watch issue #27365 (`updatedPrompt` for UserPromptSubmit → would enable silent in-place rewrite for auto mode).
- [ ] **Web playground / landing** — paste a prompt, watch the pet rewrite it; the link for every video.

## Daily / continuous (bite-sized, repeatable)
- Build-in-public X posts: "shipped X today + GIF", "rewrite of the week", "pet of the day", "which pet next?" polls.
- New community pet merged · changelog GIF per feature · seasonal skin / "pet drop Friday" · one directory submission.

## Competitors to study
- [clawd-on-desk](https://github.com/rullerzhou-afk/clawd-on-desk) (~4.7k★) — reactive AI-agent pet; study its mood states + skin system.
- [Claude Buddy](https://claudefa.st/blog/guide/mechanics/claude-buddy) — Anthropic's official pet; the bar + proof of demand.
- [codachi](https://github.com/vincent-k2026/codachi) — direct statusline tamagotchi; our rewriter is the wedge it lacks.
- [claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver) (~1.6k★) — rewriter that only injects (can't show a clean rewrite) — the gap we fill.
