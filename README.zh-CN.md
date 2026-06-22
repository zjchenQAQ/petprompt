<div align="center">

# ʕ•ᴥ•ʔ PetPrompt

[English](README.md) · **简体中文** · [日本語](README.ja.md)

[![npm](https://img.shields.io/npm/v/petprompt?logo=npm&color=cb3837)](https://www.npmjs.com/package/petprompt)
[![GitHub stars](https://img.shields.io/github/stars/zjchenQAQ/petprompt?style=flat&logo=github)](https://github.com/zjchenQAQ/petprompt/stargazers)
[![CI](https://github.com/zjchenQAQ/petprompt/actions/workflows/ci.yml/badge.svg)](https://github.com/zjchenQAQ/petprompt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**一只住在终端里的可爱桌宠，把你的 prompt 改写成更符合 prompt engineering 规范的版本 —— 意思不变、表达更清晰 —— 用你当前 Claude Code 会话的上下文、记忆和模型。**

无需 API key，无需另开对话，无需来回复制粘贴。只在你主动触发时才动手。

![PetPrompt demo](assets/demo.gif)

</div>

---

## 痛点

你正沉浸在 Claude Code 里，想到哪写到哪，敲下一长串啰嗦的 prompt：

> 就是有个 bug 吧我感觉 —— 用户传一个特别大的 CSV 的时候整个就卡死了，有时候标签页直接崩，不知道是解析的问题还是啥，你看下那个上传组件，对了最好能显示个进度啥的因为现在根本不知道传到哪了，还有别一次性把整个文件读进内存感觉不太行，另外失败的时候那个报错就俩字"错误"根本没用

如果按 prompt engineering 推荐的方式来写 —— 清晰、直接、有条理 —— 效果会更好，
而且**不改变你要表达的意思**：

> 在 CSV 上传组件里，修复上传超大文件时卡死、偶尔标签页崩溃的问题。具体来说：
>
> - 分块流式解析文件，不要一次性全部读入内存；
> - 向用户显示上传/解析进度；
> - 失败时把笼统的"错误"提示改成有意义的报错信息。
>
> 先判断瓶颈是否在解析环节。

上面每一条需求，原话里其实都有 —— 只是埋在啰嗦里。范围一样、没加任何东西，只是理清、说明白了。平时你得停下来，另开一个对话，粘贴进去，问一句"帮我改成清晰的 prompt"，等结果，再复制回来，最后才运行。**每一次都这样。**

PetPrompt 把这一整段绕路全省了。它就住在你的会话里，在你主动触发的那一刻替你改写好 prompt。

## 工作原理

PetPrompt 注册了一个 Claude Code 的 **`UserPromptSubmit` hook**。默认（`preview` 模式）下，
当你在 prompt 前加上 `pp ` 前缀：

```
pp 你那句啰嗦的 prompt
        │
        ▼
  ┌─────────────┐   读取：本会话的模型 · 对话记录 · CLAUDE.md 记忆
  │  PetPrompt  │ ──────────────────────────────────────────────────────►
  │    hook     │   调用你本地已装的 `claude -p`（同一登录、模型、额度）
  └─────────────┘
        │
        ▼
  原始 prompt 被拦截 · 改写版展示出来并复制到剪贴板
        │
        ▼
  粘贴（桌宠鼓掌 ✨）+ 回车  →  Claude 运行干净的版本
```

- **用你的会话，而不是另起炉灶。** 改写跑在*你当前窗口正在用的同一个模型*上，走你现有的
  Claude Code 登录 —— 所以**不需要 API key**，也走**同一份额度**。（也可单独指定更快的模型来改写。）
- **只改写，绝不加料。** 把你的措辞改写得更符合 prompt engineering 规范，但**意思和范围保持不变**。
  只用最近对话和 `CLAUDE.md` 记忆来消解歧义（搞清楚"它/这个"指代什么）、用对名字，**绝不**新增需求。
- **你能看到、由你确认。** `preview` 模式下你的原始 prompt 被**拦截**（不会进 Claude），改写版展示
  出来并复制到剪贴板，你粘贴+回车才运行 —— 所以只有你过目过的干净版本会被发送。想一步到位？
  `petprompt mode auto` 会自动注入改写版并立即运行。
- **设计上很安全。** 一旦出错或超时，你的原始 prompt 会**原封不动**地通过 —— PetPrompt 永远不碍事。
- **状态栏里的一只桌宠。** 自己挑角色，它平时发呆、改写时有反应、完成时给你一个 ✨。

## 桌宠角色

桌宠住在状态栏。从原创角色里挑一个 —— 每个都有自己的待机 / 思考 / 兴奋动画：

```bash
petprompt pet              # 列出所有角色（带预览）+ 显示当前
petprompt pet cat          # 切换角色
petprompt pet on | off     # 显示 / 隐藏状态栏桌宠
```

| 名字 | 角色 |
| --- | --- |
| `shiba`（默认） | 柴犬 —— 忠诚、有点小傲娇，会摇尾巴 |
| `cat` | 猫 —— 高冷，但其实很在意你 |
| `slime` | 史莱姆 —— 弹弹的、容易开心，会一缩一缩 |
| `fox` | 狐狸 —— 狡黠机灵 |
| `bunny` | 兔子 —— 害羞，开心时蹦跶 |

## 安装

### 方式 A —— Claude Code 插件（推荐）

```text
/plugin marketplace add zjchenQAQ/petprompt
/plugin install petprompt@petprompt
```

然后重启 Claude Code —— hook 和 `/petprompt:optimize` 命令就绪。

> **开启桌宠（状态栏）：** 插件无法自己注册状态栏，所以手动开一次：
>
> ```bash
> node ~/.claude/plugins/marketplaces/petprompt/src/cli.js pet on
> ```
>
> 然后重启 Claude Code。（不开也能改写 —— 桌宠只是可爱的那部分。）

### 方式 B —— npm + 一条命令

```bash
npm install -g petprompt
petprompt init       # 把 hook + 状态栏桌宠写入 ~/.claude/settings.json
petprompt doctor     # 检查是否就绪
```

> 需要 **Node.js ≥ 18** 和在 PATH 中的 **Claude Code CLI**（`claude`）。

## 使用

在任意 prompt 前加上 `pp ` 前缀来改写。PetPrompt 会展示干净版本并复制到剪贴板 ——
**粘贴 + 回车即可运行**（你的原始 prompt 永远不会被发送）：

```text
pp users 查询有点慢，看一下
```

**没加** `pp ` 的 prompt 会被完全放过。想让它改写并一步运行？`petprompt mode auto`
（自动改写每一条实质性 prompt）。

只想看改写、不运行任何东西？

```text
/petprompt:optimize 加个深色模式开关
```

或在任意 shell 里：

```bash
petprompt optimize "加个深色模式开关"
echo "加个深色模式开关" | petprompt optimize
```

## 模式

用 `petprompt mode <m>`（或 `petprompt on` / `petprompt off`）切换 hook 的行为：

| 模式 | 行为 |
| --- | --- |
| `preview`（默认） | 命中 `pp ` 前缀时：拦截原始 prompt、展示改写、复制到剪贴板。你粘贴+回车运行。 |
| `auto` | 自动改写每一条实质性 prompt 并注入（一步到位）。 |
| `manual` | 从不自动运行；需要时用 `/petprompt:optimize`。 |
| `off` | 什么都不做。 |

## 配置

`petprompt config` 打印全部配置；`petprompt set <键> <值>` 修改。存储于
`~/.claude/petprompt/config.json`。

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `mode` | `preview` | `preview` · `auto` · `manual` · `off` |
| `character` | `shiba` | 状态栏桌宠：`shiba` · `cat` · `slime` · `fox` · `bunny` |
| `optimizeModel` | `inherit` | `inherit` = 跟随会话模型；或指定 id，如 `claude-haiku-4-5` 提速 |
| `lang` | `auto` | 界面语言：`auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | `preview` 模式下触发改写的前缀 |
| `minWords` / `minChars` | `4` / `16` | `auto` 模式：短于此则跳过 |
| `contextMessages` | `12` | 喂给改写器的最近消息条数 |
| `timeoutMs` | `25000` | 改写超时（控制在 30s hook 上限内）|
| `showNote` | `true` | `auto` 模式下把改写作为提示展示 |

```bash
petprompt set optimizeModel claude-haiku-4-5   # 更快更省地改写
petprompt mode auto                            # 改写 + 运行一步到位
petprompt pet fox                              # 换个角色
petprompt off                                   # 暂停 PetPrompt
```

## 隐私

PetPrompt 完全运行在你本机，只和你自己的 `claude` CLI 通信。你的 prompt、最近对话和记忆，
**与你平时正常发 prompt 的方式完全一致**地发送给 Claude —— 不经过任何第三方服务器或 key。

## 命令

```text
petprompt init | uninstall | doctor          安装与自检
petprompt pet [名字|on|off]                  选择角色 / 显示隐藏桌宠
petprompt mode <m> | on | off                行为（preview | auto | manual | off）
petprompt lang <code>                        界面语言（auto | en | zh | ja）
petprompt config | set <键> <值>             配置
petprompt optimize [文本]                    改写一段 prompt 并打印
petprompt help | version
```

## 路线图

- [x] 界面 + README 多语言（English / 简体中文 / 日本語）
- [x] 可选的、带动画的桌宠角色
- [ ] **Codex 支持**（基于 `codex exec` 的改写）—— *下一版*
- [ ] 剪贴板 / 全局热键模式，可在编码 agent 之外使用
- [ ] before/after 对比视图
- [ ] 更多角色与皮肤

## Star 趋势

<a href="https://star-history.com/#zjchenQAQ/petprompt&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" width="600" />
  </picture>
</a>

## 贡献

欢迎提 issue 和 PR。PetPrompt 刻意保持**零依赖、纯 Node**，让 hook 足够快、随处可装。

## 许可证

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
