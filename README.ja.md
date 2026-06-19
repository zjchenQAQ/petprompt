<div align="center">

# ʕ•ᴥ•ʔ Prompet

[English](README.md) · [简体中文](README.zh-CN.md) · **日本語**

**ターミナルに住む可愛いペット。送信する前に、雑なプロンプトをそっと洗練されたプロンプトへ磨き上げます —— 今の Claude Code セッションの文脈・メモリ・モデルを使って。**

API キー不要。別のチャットを開く必要なし。コピペの往復もなし。

<!-- TODO: 実際のデモ GIF に差し替え -->
<!-- ![Prompet demo](assets/demo.gif) -->

</div>

---

## 課題

Claude Code に没頭しているとき、つい雑なプロンプトを打ってしまいます：

> ログインページ作って

でも本当は、こう書いた方がうまくいくと分かっています：

> `src/pages/Login.tsx` を更新：メール + パスワードのバリデーションとインラインの
> エラー表示、「ログイン状態を保持」チェックボックス、そして既存の Tailwind テーマに
> 合わせたレスポンシブなレイアウトを追加。

そこで手を止め、別のチャットを開き、プロンプトを貼り付け、「これを最適化して」と尋ね、
待って、結果をコピーして戻し、ようやく実行する。**毎回これです。**

Prompet はこの遠回りをまるごと無くします。セッションの*中*に住み、あなたが Enter を
押した瞬間にプロンプトを磨き上げます。

## 仕組み

Prompet は Claude Code の **`UserPromptSubmit` フック**を登録します。プロンプトを送信すると：

```
あなたの雑なプロンプト
        │
        ▼
  ┌───────────┐   読み取り：このセッションのモデル · 会話ログ · CLAUDE.md メモリ
  │  Prompet  │ ──────────────────────────────────────────────────────────────►
  │  フック   │   ローカルの `claude -p` を呼び出し（同じログイン・モデル・利用枠）
  └───────────┘
        │
        ▼
  文脈を踏まえた明確なプロンプトが Claude へ —— ペットも大喜び ✨
```

- **別の頭脳ではなく、あなたのセッションを使う。** 最適化は*今あなたのウィンドウが使っている
  のと同じモデル*で、既存の Claude Code ログインを通じて実行されます。だから **API キーは不要**、
  利用枠も**同じもの**を使います。（最適化だけ高速なモデルを指定することも可能。）
- **`/btw` のように、でも入力なしで。** 最近の会話とプロジェクト + ユーザーの `CLAUDE.md`
  メモリを読み取るので、「ログインページ作って」が、あなたのスタックとファイルを理解した
  プロンプトに変わります。
- **設計から安全。** Claude には元のプロンプトも見えています。最適化版は黙って差し替えるのではなく、
  権威ある補足として*追加*されます。失敗やタイムアウト時は、元のプロンプトが**そのまま**通ります ——
  Prompet があなたを止めることは決してありません。
- **ステータスラインに 1 匹のペット。** ʕ•ᴥ•ʔ は普段はくつろぎ、最適化中はくるくる回り、
  完了すると ✨ をくれます。

## インストール

### 方法 A —— Claude Code プラグイン（推奨）

```text
/plugin marketplace add zjchenQAQ/prompet
/plugin install prompet
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

インストール後は、いつも通り Claude Code を使うだけ。実質的なプロンプトは自動で最適化され、
些細なもの（`yes`、`continue`、`run it`、スラッシュコマンドなど）はそのまま通ります。

自分で制御したい場合はプレビューコマンドを —— 自動適用せず、最適化後のプロンプトを見せてくれます：

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
| `auto`（既定） | 実質的なプロンプトを自動最適化し、些細なものはスキップ。 |
| `marker` | マーカー（既定 `pp `）で始まるプロンプトのみ最適化。 |
| `manual` | 自動最適化はしない。必要なときに `/prompet:optimize` を使う。 |
| `off` | 何もしない。 |

## 設定

`prompet config` で全設定を表示、`prompet set <key> <value>` で変更。保存先は
`~/.claude/prompet/config.json`。

| キー | 既定 | 意味 |
| --- | --- | --- |
| `mode` | `auto` | `auto` · `marker` · `manual` · `off` |
| `optimizeModel` | `inherit` | `inherit` = セッションのモデル；または `claude-haiku-4-5` 等を指定して高速化 |
| `lang` | `auto` | 表示言語：`auto` · `en` · `zh` · `ja` |
| `marker` | `pp ` | `marker` モードで最適化を起動する接頭辞 |
| `minWords` / `minChars` | `4` / `16` | auto モード：これより短ければスキップ |
| `contextMessages` | `12` | 最適化器に渡す直近メッセージ数 |
| `timeoutMs` | `25000` | 最適化のタイムアウト（30s のフック上限内に収める）|
| `showNote` | `true` | 最適化時に 1 行の通知を表示 |

```bash
prompet set optimizeModel claude-haiku-4-5   # より速く・安く最適化
prompet lang ja                              # 表示を日本語に
prompet mode marker                          # "pp " で始まるプロンプトのみ最適化
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
prompet lang <code>                      表示言語
prompet config | set <key> <value>       設定
prompet optimize [text]                  プロンプトを最適化して表示
prompet help | version
```

## ロードマップ

- [x] UI + README の多言語対応（English / 简体中文 / 日本語）
- [ ] **Codex 対応**（`codex exec` ベースの最適化）—— *次回アップデート*
- [ ] クリップボード / グローバルホットキーモード（コーディングエージェント以外でも利用）
- [ ] before/after の差分ビュー
- [ ] ペットの個性とスキン

## コントリビュート

Issue・PR を歓迎します。Prompet はフックを高速かつどこでも動くように、意図的に
**依存ゼロ・純粋な Node** で作られています。

## ライセンス

MIT © [zjchenQAQ](https://github.com/zjchenQAQ)
