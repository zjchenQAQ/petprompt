<div align="center">

# ʕ•ᴥ•ʔ Prompet

[English](README.md) · [简体中文](README.zh-CN.md) · **日本語**

**ターミナルに住む可愛いペット。あなたのプロンプトを、プロンプトエンジニアリングの作法に沿った形へ書き換えます —— 意味はそのまま、表現だけ明確に —— 今の Claude Code セッションの文脈・メモリ・モデルを使って。**

API キー不要。別のチャットも不要。コピペの往復もなし。あなたが頼んだときだけ動きます。

<!-- TODO: 実際のデモ GIF に差し替え -->
<!-- ![Prompet demo](assets/demo.gif) -->

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

Prompet はこの遠回りをまるごと無くします。セッションの*中*に住み、あなたが頼んだ瞬間に
プロンプトを書き換えます。

## 仕組み

Prompet は Claude Code の **`UserPromptSubmit` フック**を登録します。最適化対象として印を付けた
プロンプト（既定では `pp ` で始まるもの —— [モード](#モード)参照）を送信すると：

```
pp 冗長なプロンプト
        │
        ▼
  ┌───────────┐   読み取り：このセッションのモデル · 会話ログ · CLAUDE.md メモリ
  │  Prompet  │ ──────────────────────────────────────────────────────────────►
  │  フック   │   ローカルの `claude -p` を呼び出し（同じログイン・モデル・利用枠）
  └───────────┘
        │
        ▼
  意味はそのまま・表現が明確なプロンプトが Claude へ —— ペットも大喜び ✨
```

- **別の頭脳ではなく、あなたのセッションを使う。** 最適化は*今あなたのウィンドウが使っている
  のと同じモデル*で、既存の Claude Code ログインを通じて実行されます。だから **API キーは不要**、
  利用枠も**同じもの**です。（最適化だけ高速なモデルを指定することも可能。）
- **書き換えるだけ、水増ししない。** 表現をプロンプトエンジニアリングの作法 —— 明確・具体的・
  曖昧さなし —— に沿って書き換えますが、**意味と範囲はそのまま**です。最近の会話と `CLAUDE.md`
  メモリは、曖昧な指示（「それ」「これ」が何を指すか）の解決と正しい名称のためだけに使い、
  新しい要件を加えることは**ありません**。
- **必要なときだけ、邪魔をしない。** Prompet は印を付けたプロンプトだけを処理し、それ以外は
  そのまま通します。すべてに効かせたい場合は `prompet mode auto`。
- **設計から安全。** Claude には元のプロンプトも見えています。書き換え版は黙って差し替えるのではなく、
  補足として*追加*されます。失敗やタイムアウト時は、元のプロンプトが**そのまま**通ります ——
  Prompet があなたを止めることは決してありません。
- **ステータスラインに 1 匹のペット。** ʕ•ᴥ•ʔ は普段はくつろぎ、最適化中はくるくる回り、
  完了すると ✨ をくれます。

## インストール

### 方法 A —— Claude Code プラグイン（推奨）

```text
/plugin marketplace add zjchenQAQ/prompet
/plugin install prompet@prompet
```

その後 Claude Code を再起動。これで完了 —— フック、ステータスラインのペット、
`/prompet:optimize` コマンドがすべて有効になります。

### 方法 B —— npm + コマンド 1 つ

```bash
npm install -g prompet
prompet init       # フック + ステータスラインを ~/.claude/settings.json に書き込む
prompet doctor     # 準備状況を確認
```

> **Node.js ≥ 18** と、PATH 上の **Claude Code CLI**（`claude`）が必要です。

## 使い方

インストール後は、任意のプロンプトの先頭に `pp ` を付けると、Claude が実行する前に Prompet が
書き換えます：

```text
pp users のクエリが遅い、見て
```

Prompet はそれを綺麗でプロンプトエンジニアリング的な表現（意味はそのまま）に書き換えて Claude へ
渡します。マーカーの**ない**プロンプトは完全にそのまま —— Prompet はあなたが頼んだときだけ動きます。
（毎回効かせたい？ `prompet mode auto`。）

実行前に確認したい場合はプレビューコマンドを —— 適用せず、書き換え結果だけ表示します：

```text
/prompet:optimize ダークモードの切り替えを追加
```

あるいは任意のシェルから：

```bash
prompet optimize "ダークモードの切り替えを追加"
echo "ダークモードの切り替えを追加" | prompet optimize
```

## モード

`prompet mode <m>`（または `prompet on` / `prompet off`）でフックの挙動を切り替えます：

| モード | 挙動 |
| --- | --- |
| `marker`（既定） | マーカー（`pp `）で始まるプロンプトのみ書き換え —— タイミングはあなた次第。 |
| `manual` | 自動書き換えなし。必要なときに `/prompet:optimize`。 |
| `auto` | 実質的なプロンプトをすべて自動書き換え（任意オン）。 |
| `off` | 何もしない。 |

## 設定

`prompet config` で全設定を表示、`prompet set <key> <value>` で変更。保存先は
`~/.claude/prompet/config.json`。

| キー | 既定 | 意味 |
| --- | --- | --- |
| `mode` | `marker` | `marker` · `manual` · `auto` · `off` |
| `optimizeModel` | `inherit` | `inherit` = セッションのモデル；または `claude-haiku-4-5` 等を指定して高速化 |
| `lang` | `auto` | 表示言語：`auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | `marker` モードで書き換えを起動する接頭辞 |
| `minWords` / `minChars` | `4` / `16` | `auto` モード：これより短ければスキップ |
| `contextMessages` | `12` | 書き換え器に渡す直近メッセージ数 |
| `timeoutMs` | `25000` | 書き換えのタイムアウト（30s のフック上限内に収める）|
| `showNote` | `true` | 書き換え時に 1 行の通知を表示 |

```bash
prompet set optimizeModel claude-haiku-4-5   # より速く・安く書き換え
prompet mode auto                            # 実質的なプロンプトをすべて書き換え（任意オン）
prompet lang ja                              # 表示言語を固定
prompet off                                   # Prompet を一時停止
```

## プライバシー

Prompet は完全にあなたのマシン上で動作し、あなた自身の `claude` CLI とのみ通信します。
プロンプト・直近の会話・メモリは、**普段あなたがプロンプトを送るのとまったく同じ方法**で
Claude に送られます —— 第三者のサーバーやキーを介すことはありません。

## コマンド

```text
prompet init | uninstall | doctor        セットアップと自己診断
prompet on | off | mode <m>              挙動
prompet lang <code>                      表示言語（auto | en | zh | ja）
prompet config | set <key> <value>       設定
prompet optimize [text]                  プロンプトを書き換えて表示
prompet help | version
```

## ロードマップ

- [x] UI + README の多言語対応（English / 简体中文 / 日本語）
- [ ] **Codex 対応**（`codex exec` ベースの最適化）—— *次回アップデート*
- [ ] クリップボード / グローバルホットキーモード（コーディングエージェント以外でも利用）
- [ ] before/after の差分ビュー
- [ ] ペットの個性とスキン

## スター推移

<a href="https://star-history.com/#zjchenQAQ/prompet&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zjchenQAQ/prompet&type=Date" width="600" />
  </picture>
</a>

## コントリビュート

Issue・PR を歓迎します。Prompet はフックを高速かつどこでも動くように、意図的に
**依存ゼロ・純粋な Node** で作られています。

## ライセンス

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
