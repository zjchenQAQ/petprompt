---
name: optimize
description: Refine a rough prompt into a clear, well-structured prompt using the current conversation and project memory, then show it for review WITHOUT executing. Use when the user runs /prompet:optimize or asks to improve/polish/optimize their prompt before running it.
---

# Prompet — optimize a prompt (preview mode)

This is the manual, preview counterpart to Prompet's automatic hook. The user wants to
SEE a refined version of their prompt before running it.

When invoked:

1. Take the user's rough request — their arguments if provided, otherwise their most
   recent message.
2. Rewrite it into ONE clear, specific, well-structured prompt a coding agent can execute
   well. Use everything visible in the CURRENT conversation and the project memory
   (CLAUDE.md, etc.) to make implicit context explicit: relevant files, stack, constraints,
   naming conventions, and acceptance criteria.
3. **Never invent** features or requirements the user did not imply. Preserve their intent,
   scope, and language. If the prompt is already clear, say so and return it essentially
   unchanged.

Output format:

- Print the rewritten prompt inside a fenced code block so it is easy to copy.
- Follow it with a single-sentence "What changed" note.
- **Do NOT execute the task.** This is preview/optimize only — wait for the user to run it.
