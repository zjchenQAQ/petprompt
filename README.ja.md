<div align="center">

# ʕ•ᴥ•ʔ PetPrompt

[English](README.md) · [简体中文](README.zh-CN.md) · **日本語**

[![npm](https://img.shields.io/npm/v/petprompt?logo=npm&color=cb3837)](https://www.npmjs.com/package/petprompt)
[![GitHub stars](https://img.shields.io/github/stars/zjchenQAQ/petprompt?style=flat&logo=github)](https://github.com/zjchenQAQ/petprompt/stargazers)
[![CI](https://github.com/zjchenQAQ/petprompt/actions/workflows/ci.yml/badge.svg)](https://github.com/zjchenQAQ/petprompt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ターミナルに住む可愛いペット。あなたのプロンプトを、プロンプトエンジニアリングの作法に沿った形へ書き換えます —— 意味はそのまま、表現だけ明確に —— 今の Claude Code セッションの文脈・メモリ・モデルを使って。**

API キー不要。別のチャットも不要。コピペの往復もなし。あなたが頼んだときだけ動きます。

![PetPrompt demo](assets/demo.gif)

</div>

---

## 課題

Claude Code に没頭しているとき、思いつくままに長くて冗長なプロンプトを打ってしまいます：

> えっとバグだと思うんだけど —— ユーザーがすごく大きい CSV をアップロードすると全体が固まって、たまにタブごと落ちる、パースのせいかどうか分からない、あのアップロードのコンポーネント見てほしい、あと進捗みたいなのを表示してほしい今どこまで進んでるか全然分からないから、それからファイル全体を一気にメモリに読み込むのはやめたほうがいい気がする、あと失敗したときのエラーが「エラー」としか出なくて全然役に立たない

プロンプトエンジニアリングが推奨する書き方 —— 明確・直接的・構造化 —— にすると、
**求めている内容を変えずに**、より良く動きます：

> CSV アップロードのコンポーネントで、巨大なファイルをアップロードしたときに固まる・タブが落ちる不具合を修正して。具体的には：
>
> - ファイルを一括でメモリに読み込まず、チャンク単位でストリーミング解析する；
> - アップロード/解析の進捗をユーザーに表示する；
> - 失敗時の汎用的な「エラー」表示を、意味のあるエラーメッセージに置き換える。
>
> まずボトルネックがパースにあるかを切り分けて。

上記の要件はすべて、元の文にもう含まれていました —— ただ冗長さに埋もれていただけ。範囲は同じ、何も足していません。整理して明確にしただけです。普段なら手を止め、別のチャットを開き、貼り付け、「綺麗なプロンプトに書き換えて」と頼み、待って、コピーして戻し、ようやく実行する。**毎回これです。**

PetPrompt はこの遠回りをまるごと無くします。セッションの*中*に住み、あなたが頼んだ瞬間に
プロンプトを書き換えます。

## 仕組み

PetPrompt は Claude Code の **`UserPromptSubmit` フック**を登録します。既定（`preview` モード）では、
プロンプトの先頭に `pp ` を付けると：

```
pp 冗長なプロンプト
        │
        ▼
  ┌─────────────┐   読み取り：このセッションのモデル · 会話ログ · CLAUDE.md メモリ
  │  PetPrompt  │ ──────────────────────────────────────────────────────►
  │   フック    │   ローカルの `claude -p` を呼び出し（同じログイン・モデル・利用枠）
  └─────────────┘
        │
        ▼
  生のプロンプトはブロック · 書き換え版を表示してクリップボードにコピー
        │
        ▼
  貼り付け（ペットが大喜び ✨）+ Enter  →  Claude が綺麗な版を実行
```

- **別の頭脳ではなく、あなたのセッションを使う。** 書き換えは*今あなたのウィンドウが使っている
  のと同じモデル*で、既存の Claude Code ログインを通じて実行されます。だから **API キーは不要**、
  利用枠も**同じもの**です。（書き換えだけ高速なモデルを指定することも可能。）
- **書き換えるだけ、水増ししない。** 表現をプロンプトエンジニアリングの作法に沿って書き換えますが、
  **意味と範囲はそのまま**です。最近の会話と `CLAUDE.md` メモリは、曖昧な指示（「それ」「これ」が
  何を指すか）の解決と正しい名称のためだけに使い、新しい要件を加えることは**ありません**。
- **見て、あなたが承認する。** `preview` モードでは生のプロンプトは**ブロック**され（Claude には届かない）、
  書き換え版が表示・クリップボードにコピーされ、貼り付け + Enter で実行します —— つまり、あなたが
  目を通した綺麗な版だけが送られます。1 ステップが良ければ `petprompt mode auto` で自動注入＆即実行。
- **設計から安全。** 失敗やタイムアウト時は、元のプロンプトが**そのまま**通ります ——
  PetPrompt が邪魔をすることはありません。
- **ステータスラインにペット。** キャラクターを選べます。普段はくつろぎ、書き換え中は反応し、
  完了すると喜びます。

## キャラクター

ペットはステータスラインに住みます。オリジナルのキャラクターから選べます —— それぞれに待機・思考・
歓喜のアニメーションがあります：

```bash
petprompt pet              # 全キャラを一覧（プレビュー付き）+ 現在のキャラを表示
petprompt pet cat          # キャラクターを切り替え
petprompt pet on | off     # ステータスラインのペットを表示 / 非表示
```

| キー | キャラクター |
| --- | --- |
| `shiba`（既定） | 柴犬 —— 忠実で少し得意げ、しっぽを振る |
| `cat` | 猫 —— クールだけど本当は気にかけている |
| `slime` | 史莱姆（スライム）—— ぷるぷる、すぐ喜ぶ |
| `fox` | 狐 —— ずる賢くて機転が利く |
| `bunny` | 兎 —— 内気、嬉しいと跳ねる |

## インストール

### 方法 A —— Claude Code プラグイン（推奨）

```text
/plugin marketplace add zjchenQAQ/petprompt
/plugin install petprompt@petprompt
```

その後 Claude Code を再起動 —— フックと `/petprompt:optimize` コマンドが有効になります。

> **ペット（ステータスライン）を有効化：** プラグインはステータスラインを登録できないので、一度だけ有効化します：
>
> ```bash
> node ~/.claude/plugins/marketplaces/petprompt/src/cli.js pet on
> ```
>
> その後 Claude Code を再起動。（これなしでも書き換えは動きます —— ペットは可愛い部分だけ。）

### 方法 B —— npm + コマンド 1 つ

```bash
npm install -g petprompt
petprompt init       # フック + ステータスラインのペットを ~/.claude/settings.json に書き込む
petprompt doctor     # 準備状況を確認
```

> **Node.js ≥ 18** と、PATH 上の **Claude Code CLI**（`claude`）が必要です。

## 使い方

任意のプロンプトの先頭に `pp ` を付けると書き換えます。PetPrompt は綺麗な版を表示し、クリップボードに
コピーします —— **貼り付け + Enter で実行**（生のプロンプトは送られません）：

```text
pp users のクエリが遅い、見て
```

`pp ` の**ない**プロンプトは完全にそのまま。書き換えて一気に実行したい？ `petprompt mode auto`
（実質的なプロンプトをすべて自動で書き換え）。

何も実行せず書き換えだけ見たい？

```text
/petprompt:optimize ダークモードの切り替えを追加
```

あるいは任意のシェルから：

```bash
petprompt optimize "ダークモードの切り替えを追加"
echo "ダークモードの切り替えを追加" | petprompt optimize
```

## モード

`petprompt mode <m>`（または `petprompt on` / `petprompt off`）でフックの挙動を切り替えます：

| モード | 挙動 |
| --- | --- |
| `preview`（既定） | `pp ` マーカー時：生のプロンプトをブロックし、書き換えを表示してクリップボードにコピー。貼り付け + Enter で実行。 |
| `auto` | 実質的なプロンプトをすべて自動で書き換え・注入（1 ステップ）。 |
| `manual` | 自動実行なし。必要なときに `/petprompt:optimize`。 |
| `off` | 何もしない。 |

## 設定

`petprompt config` で全設定を表示、`petprompt set <key> <value>` で変更。保存先は
`~/.claude/petprompt/config.json`。

| キー | 既定 | 意味 |
| --- | --- | --- |
| `mode` | `preview` | `preview` · `auto` · `manual` · `off` |
| `character` | `shiba` | ステータスラインのペット：`shiba` · `cat` · `slime` · `fox` · `bunny` |
| `optimizeModel` | `inherit` | `inherit` = セッションのモデル；または `claude-haiku-4-5` 等を指定して高速化 |
| `lang` | `auto` | 表示言語：`auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | `preview` モードで書き換えを起動する接頭辞 |
| `minWords` / `minChars` | `4` / `16` | `auto` モード：これより短ければスキップ |
| `contextMessages` | `12` | 書き換え器に渡す直近メッセージ数 |
| `timeoutMs` | `25000` | 書き換えのタイムアウト（30s のフック上限内に収める）|
| `showNote` | `true` | `auto` モードで書き換えを通知として表示 |

```bash
petprompt set optimizeModel claude-haiku-4-5   # より速く・安く書き換え
petprompt mode auto                            # 書き換え + 実行を 1 ステップで
petprompt pet fox                              # キャラクターを変更
petprompt off                                   # PetPrompt を一時停止
```

## プライバシー

PetPrompt は完全にあなたのマシン上で動作し、あなた自身の `claude` CLI とのみ通信します。
プロンプト・直近の会話・メモリは、**普段あなたがプロンプトを送るのとまったく同じ方法**で
Claude に送られます —— 第三者のサーバーやキーを介すことはありません。

## コマンド

```text
petprompt init | uninstall | doctor          セットアップと自己診断
petprompt pet [名前|on|off]                  キャラ選択 / ペットの表示・非表示
petprompt mode <m> | on | off                挙動（preview | auto | manual | off）
petprompt lang <code>                        表示言語（auto | en | zh | ja）
petprompt config | set <key> <value>         設定
petprompt optimize [text]                    プロンプトを書き換えて表示
petprompt help | version
```

## ロードマップ

- [x] UI + README の多言語対応（English / 简体中文 / 日本語）
- [x] 選択可能・アニメーション付きのキャラクター
- [ ] **Codex 対応**（`codex exec` ベースの書き換え）—— *次回アップデート*
- [ ] クリップボード / グローバルホットキーモード（コーディングエージェント以外でも利用）
- [ ] before/after の差分ビュー
- [ ] さらなるキャラクターとスキン

## スター推移

<a href="https://star-history.com/#zjchenQAQ/petprompt&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zjchenQAQ/petprompt&type=Date" width="600" />
  </picture>
</a>

## コントリビュート

Issue・PR を歓迎します。PetPrompt はフックを高速かつどこでも動くように、意図的に
**依存ゼロ・純粋な Node** で作られています。

## ライセンス

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
