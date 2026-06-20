<div align="center">

# ʕ•ᴥ•ʔ PetPrompt

[English](README.md) · **简体中文** · [日本語](README.ja.md)

**一只住在终端里的可爱桌宠，把你的 prompt 改写成更符合 prompt engineering 规范的版本 —— 意思不变、表达更清晰 —— 用你当前 Claude Code 会话的上下文、记忆和模型。**

无需 API key，无需另开对话，无需来回复制粘贴。只在你主动触发时才优化。

<!-- TODO: 替换为真实的演示 GIF -->
<!-- ![PetPrompt demo](assets/demo.gif) -->

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

PetPrompt 注册了一个 Claude Code 的 **`UserPromptSubmit` hook**。当你提交一条被标记为需要优化的
prompt 时（默认是以 `pp ` 开头的那种 —— 见[模式](#模式)）：

```
pp 你那句啰嗦的 prompt
        │
        ▼
  ┌───────────┐   读取：本会话的模型 · 对话记录 · CLAUDE.md 记忆
  │  PetPrompt  │ ──────────────────────────────────────────────────────►
  │   hook    │   调用你本地已装的 `claude -p`（同一登录、模型、额度）
  └───────────┘
        │
        ▼
  一条意思不变、表达更清晰的 prompt 交给 Claude —— 桌宠鼓掌 ✨
```

- **用你的会话，而不是另起炉灶。** 优化跑在*你当前窗口正在用的同一个模型*上，走你现有的
  Claude Code 登录 —— 所以**不需要 API key**，也走**同一份额度**。（也可单独指定一个更快的模型来优化。）
- **只改写，绝不加料。** 它把你的措辞改写得更符合 prompt engineering 规范 —— 清晰、具体、无歧义 ——
  但**意思和范围保持不变**。它只用最近对话和 `CLAUDE.md` 记忆来消解歧义（搞清楚"它/这个"指代什么）、
  用对名字，**绝不会**新增任何需求。
- **按需触发，不碍事。** PetPrompt 只处理你标记的 prompt，其余的原样直达。想让它对每条都生效，
  用 `petprompt mode auto`。
- **设计上很安全。** Claude 仍然能看到你的原始 prompt；改写版是作为引导*追加*进去的，而非悄悄替换。
  一旦出错或超时，你的原始 prompt 会**原封不动**地通过 —— PetPrompt 永远不会卡住你。
- **状态栏里的一只桌宠。** ʕ•ᴥ•ʔ 平时发呆，优化时转圈，完成时给你一个 ✨。

## 安装

### 方式 A —— Claude Code 插件（推荐）

```text
/plugin marketplace add zjchenQAQ/petprompt
/plugin install petprompt@petprompt
```

然后重启 Claude Code。搞定 —— hook、状态栏桌宠、`/petprompt:optimize` 命令全部就绪。

### 方式 B —— npm + 一条命令

```bash
npm install -g petprompt
petprompt init       # 把 hook + 状态栏写入 ~/.claude/settings.json
petprompt doctor     # 检查是否就绪
```

> 需要 **Node.js ≥ 18** 和在 PATH 中的 **Claude Code CLI**（`claude`）。

## 使用

装好后，在任意 prompt 前加上 `pp ` 前缀，PetPrompt 就会在 Claude 运行前替你改写：

```text
pp users 查询有点慢，看一下
```

PetPrompt 会把它改写成干净、符合 prompt engineering 规范的版本（意思不变）再交给 Claude。
**没加** marker 的 prompt 会被完全放过 —— PetPrompt 只在你主动触发时才动手。
（想对每条都生效？`petprompt mode auto`。）

想先看再发？用预览命令 —— 它只展示改写结果，不自动套用：

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
| `marker`（默认） | 仅改写以 marker（`pp `）开头的 prompt —— 由你决定何时触发。 |
| `manual` | 从不自动改写；需要时用 `/petprompt:optimize`。 |
| `auto` | 自动改写每一条实质性 prompt（需手动开启）。 |
| `off` | 什么都不做。 |

## 配置

`petprompt config` 打印全部配置；`petprompt set <键> <值>` 修改。存储于
`~/.claude/petprompt/config.json`。

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `mode` | `marker` | `marker` · `manual` · `auto` · `off` |
| `optimizeModel` | `inherit` | `inherit` = 跟随会话模型；或指定 id，如 `claude-haiku-4-5` 提速 |
| `lang` | `auto` | 界面语言：`auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | `marker` 模式下触发改写的前缀 |
| `minWords` / `minChars` | `4` / `16` | `auto` 模式：短于此则跳过 |
| `contextMessages` | `12` | 喂给改写器的最近消息条数 |
| `timeoutMs` | `25000` | 改写超时（控制在 30s hook 上限内）|
| `showNote` | `true` | 改写时显示一行提示 |

```bash
petprompt set optimizeModel claude-haiku-4-5   # 更快更省地改写
petprompt mode auto                            # 对每条实质性 prompt 都改写（手动开启）
petprompt lang zh                              # 强制界面语言
petprompt off                                   # 暂停 PetPrompt
```

## 隐私

PetPrompt 完全运行在你本机，只和你自己的 `claude` CLI 通信。你的 prompt、最近对话和记忆，
**与你平时正常发 prompt 的方式完全一致**地发送给 Claude —— 不经过任何第三方服务器或 key。

## 命令

```text
petprompt init | uninstall | doctor        安装与自检
petprompt on | off | mode <m>              行为
petprompt lang <code>                      界面语言（auto | en | zh | ja）
petprompt config | set <键> <值>           配置
petprompt optimize [文本]                  改写一段 prompt 并打印
petprompt help | version
```

## 路线图

- [x] 界面 + README 多语言（English / 简体中文 / 日本語）
- [ ] **Codex 支持**（基于 `codex exec` 的优化）—— *下一版*
- [ ] 剪贴板 / 全局热键模式，可在编码 agent 之外使用
- [ ] before/after 对比视图
- [ ] 桌宠个性与皮肤

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
