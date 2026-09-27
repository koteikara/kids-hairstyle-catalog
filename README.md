# ヘアみっけ（kids-hairstyle-catalog）

公開版：https://koteikara.github.io/kids-hairstyle-catalog/ （スマホで開くのがおすすめ）

小学生の親子が、イラストを見ながら現実的な髪型を選び、美容師さんに見せるカードを作るためのスマートフォン向けWebアプリのプロトタイプ。

## 仕様とロードマップ

- [docs/spec.md](docs/spec.md)：サービス仕様（親子と美容師さんの相談ツールへの拡張を含む）
- [docs/roadmap.md](docs/roadmap.md)：初期版と将来機能の進め方
- [docs/future-photo-ai.md](docs/future-photo-ai.md)：写真の取り込み・AI試着の検討事項（将来）
- [docs/design-references.md](docs/design-references.md)：海外のデザイン参考
- [docs/design-direction.md](docs/design-direction.md)：デザインの方向性「バーバー・モノクロ」（デザイン案は `design/mock.html`）

## 動かし方

```bash
node serve.js
```

ブラウザで http://localhost:5173 を開く（スマホ幅での表示を想定）。ビルドや依存パッケージは不要。

## プロトタイプでできること

| 画面 | 内容 |
|---|---|
| さがす | 「予約済み／これから店を探す」の入口、最近よく見られている髪型、条件チップと絞り込み（長さ・前髪・耳まわり・襟足・刈り上げ・セットの手間・ワックス）、並び替え |
| 髪型の詳細 | 正面・横・後ろのイラスト、子ども向け説明、特徴一覧、美容師さんへの伝え方、閲覧・いいね・候補数、いいね／保存 |
| カードを作る | 刈り上げ4段階をイラストで比較、長さ・前髪・耳まわり・襟足の大まかな調整（イラストに即反映）、普段のセット、相談希望、メモ |
| ヘアカード | 美容師さんに見せる大きい表示、共有リンク（カード内容をURLに含める）、印刷・PDF |
| お店 | 地図・予約サイトへの補助リンク、子ども対応を確かめるチェックリスト、広告表示の方針 |
| 集計 | 閲覧と、保存・カード作成（候補になった行動）を分けた集計表（フッターのリンクから） |

## 構成

- `js/data.js` — 髪型データ、タグの表示名、絞り込み条件。人気の数字は仮データ。
- `js/illust.js` — 髪型パラメータ（長さ・前髪・耳まわり・襟足・刈り上げ）から正面・横・後ろのSVGを描く。カードで調整した内容もここで反映する。
- `js/app.js` — 画面、ルーティング（ハッシュ）、いいね・保存・カード・集計の保存（localStorage）。
- `css/styles.css` — スマホ向けのスタイル。

## 髪型イラスト

- 本番のイラストは、Web上のヘアスタイル写真を参考に特徴を文章化し、人物や構図を新しくして作る。手順とルールは [docs/illustration-guide.md](docs/illustration-guide.md)。
- 参考写真の記録は [docs/references-template.csv](docs/references-template.csv) の形式で行う。写真ファイルはリポジトリに入れない。
- Codexに画像を作らせるときの作業指示は [docs/codex-image-task.md](docs/codex-image-task.md)。3方向を並べた1枚は `scripts/split-sheet.ps1` で3枚に分ける。刈り上げ比較画像の作業指示は [docs/codex-fade-task.md](docs/codex-fade-task.md)、前髪の比較画像は [docs/codex-bangs-task.md](docs/codex-bangs-task.md)、耳まわりは [docs/codex-ears-task.md](docs/codex-ears-task.md)。似た髪型を並べて見比べるには `scripts/montage-styles.ps1`。
- 画像生成用の指示文は [docs/illustration-prompts.md](docs/illustration-prompts.md)。`node scripts/build-prompts.js` で `js/data.js` から作り直せる。
- 完成画像は `js/data.js` の `HM_IMAGES`（髪型ごとの正面・横・後ろ）と `HM_FADE_IMAGES`（刈り上げ比較）に登録する。登録がない髪型は `js/illust.js` の簡易図で代わりに表示する。

## 髪型データの考え方

- `params` は見本イラストに描く「標準形」。正解として固定しない。
- `variants` は「その髪型で選べるバリエーション候補」（耳まわり・襟足・刈り上げ・前髪の向き）。参考写真などで違いが見つかったら、標準形を書き換えず、ここに根拠と一緒に追加する。カード作成では候補に印がつき、絞り込みでは候補の値でも一致する。

## プロトタイプでの割り切り

- 現在のイラストはすべて、パラメータから描く仮の簡易図。
- いいね・保存・カード・集計は端末内（localStorage）に保存しているだけで、サーバー集計はしていない。
- 店舗掲載・広告はなし。店舗検索は外部サイトへのリンクだけ。
- AIは使っていない。
