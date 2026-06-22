# PetPrompt launch kit

Stars come from **distribution**, not features. PetPrompt is ready; this is the plan to get
it in front of the right people. Always **lead with the demo GIF**.

Repo: https://github.com/zjchenQAQ/petprompt

---

## Pre-flight (do once)

- [ ] Generate + commit the demo GIF: `brew install vhs && vhs assets/demo.tape` → commit `assets/demo.gif`.
- [ ] `npm publish` so `npm i -g petprompt` works (adds the npm badge + a clean install path).
- [ ] Set the repo **social preview image** (Settings → Social preview) — a 1280×640 image with the pet + tagline. This is what shows when the link is shared on X / Reddit / Slack; it massively lifts click-through.
- [ ] Warm up the Reddit account (comment for a few days, ~100+ karma) before posting — new accounts get auto-filtered.

## Posting order (highest signal first)

1. **r/ClaudeAI** (most on-target) → 2. **X #buildinpublic** → 3. **awesome-claude-code PR** →
4. **Show HN** → 5. **r/commandline / r/SideProject** → 6. **掘金 / V2EX (中文)**.
Space them out; don't blast the same link everywhere in one hour.

---

## 1) Reddit — r/ClaudeAI (text post)

**Title:** I made PetPrompt — a tiny terminal pet that rewrites your rough Claude Code prompts before they run (no API key)

**Body:**
> I kept firing off lazy, rambling prompts in Claude Code and then wishing I'd written them
> properly. So I built **PetPrompt**: type `pp ` before a prompt and a little terminal pet
> rewrites it into a clean, prompt-engineering-style version — **same meaning, nothing added**
> — then shows it and copies it to your clipboard so you paste + run it.
>
> - **No API key** — it uses your existing Claude Code session (same model, same quota).
> - **Only runs when you ask** (the `pp ` prefix); your raw prompt is never sent.
> - It's a **terminal pet** with a few characters you can swap, and it cheers when it finishes — obviously the most important feature.
>
> [demo GIF]
>
> Open source (MIT): https://github.com/zjchenQAQ/petprompt
>
> Genuinely curious whether the rewrites are useful to others or if I'm solving a problem only
> I have 😅 (I'm the author.)

> Check the subreddit rules first — if self-promo needs a specific thread/flair, use it.

## 2) X / Twitter (thread, #buildinpublic)

**1/** I built a terminal pet that fixes my lazy Claude Code prompts 🐾
type `pp <rambling>` → it rewrites it into a clean prompt (same meaning, nothing added), shows it, copies it. no API key — uses your own Claude session.
[demo GIF]

**2/** Why: I always *know* the prompt would go better if I phrased it properly… but I'm lazy.
PetPrompt does the rephrase in-session, then you paste + run. Your raw prompt is never sent.

**3/** It's also just cute. Swap characters (柴犬 / cat / slime / fox / bunny); it reacts while
thinking and cheers when done.

**4/** Free + open source (MIT). Would love feedback 🙏
⭐ https://github.com/zjchenQAQ/petprompt
#buildinpublic #ClaudeCode

## 3) awesome-claude-code (PR)

Find the relevant list (e.g. search GitHub for `awesome-claude-code`), add under tools/plugins:

```md
- [PetPrompt](https://github.com/zjchenQAQ/petprompt) — A cute terminal pet that rewrites your rough prompts (preview + copy, no API key) using your current session's model & memory.
```

## 4) Show HN

**Title:** Show HN: PetPrompt – a terminal pet that rewrites your Claude Code prompts

**First comment:**
> Author here. PetPrompt is a Claude Code hook: type `pp ` before a prompt and it rewrites it
> into a clean, prompt-engineering-style version using your current session (no API key), shows
> it, and copies it so you paste + run. The raw prompt is blocked, so only the version you've
> read gets sent. It's deliberately tiny (zero-dependency Node) and, yes, it's a cute pet.
> Feedback welcome — especially on whether the rewrites actually help.

## 5) 中文 — 掘金 / V2EX「分享创造」

**标题：** 我做了个住在 Claude Code 里的桌宠，专门帮你把烂 prompt 改写好（开源、不要 API key）

**正文：**
> 经常在 Claude Code 里随手写很潦草的 prompt，写完又后悔。于是做了 **PetPrompt**：
> 在 prompt 前加 `pp `，一只终端桌宠就用你**当前会话的模型 + 上下文**把它改写成更规范的版本
> （**意思不变、不加料**），拦下原始 prompt、把改写版复制到剪贴板，你粘贴+回车运行。
> 不需要 API key（走你现有的 Claude Code 登录、同一额度），只在你主动触发时才动手。
> 还能换角色（柴犬/猫/史莱姆/狐狸/兔子），改写完会撒花。
>
> [demo GIF] · 开源 MIT：https://github.com/zjchenQAQ/petprompt
> 想听听大家觉得"自动改写 prompt"到底有没有用～

---

## Content angles (for 抖音 / 小红书 / B站 / YouTube)

- 30s 竖屏：「我给 Claude Code 养了只宠物，它专治我的烂 prompt」— 直接放 demo（乱写→拦截→改写→撒花）。
- 对比图：before（一长串啰嗦）/ after（清晰版），「意思一样，只是说清楚了」。
- 「换装」系列：5 个角色各来一条，引导评论「你想要哪只」。
