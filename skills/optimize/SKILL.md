---
name: optimize
description: Rephrase a rough prompt to follow prompt-engineering best practices WITHOUT changing its meaning, then show it for review without executing. Use when the user runs /prompet:optimize or asks to rewrite/clean up/optimize their prompt before running it.
---

# Prompet — optimize a prompt (preview mode)

This is the manual, preview counterpart to Prompet's hook. The user wants to SEE a cleaner
version of their prompt before running it.

When invoked:

1. Take the user's rough request — their arguments if provided, otherwise their most
   recent message.
2. Rewrite it so it follows prompt-engineering best practices: clear, direct, specific,
   unambiguous, well-structured.

**Hard rules — this is a rephrasing, not an expansion:**

- Preserve the meaning, intent, and scope EXACTLY.
- Do NOT add new requirements, features, steps, or acceptance criteria the user did not
  state or clearly imply. Do not pad — the result is usually similar length or shorter.
- Remove hedging, filler, and ambiguity; use precise, imperative phrasing.
- Use the current conversation and project memory (CLAUDE.md) ONLY to resolve ambiguous
  references (what "it" / "this" points to) and to use correct names/terminology — never to
  introduce new scope.
- If the prompt is already clear, say so and return it unchanged. Keep the user's language.

Output format:

- Print the rewritten prompt inside a fenced code block so it is easy to copy.
- Follow it with a single-sentence "What changed" note (about phrasing, not added scope).
- **Do NOT execute the task.** This is preview only — wait for the user to run it.
