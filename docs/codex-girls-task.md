# Codex作業指示：女の子の髪型見本イラストの生成と登録

「ヘアみっけ」に女の子の髪型を8つ追加した（`js/data.js` の `gender: 'girl'` の髪型）。その見本イラストを、男の子の髪型と同じ作り方（正面・横・後ろの3方向の1枚を作り、3枚に分ける）で作って登録する。

アプリ側は対応済み。画像を `HM_IMAGES` に登録すれば、一覧・詳細・相談メモの「イラスト準備中」が見本イラストに置きかわる。

## 1. 最初に読むもの

| ファイル | 内容 |
|---|---|
| [illustration-guide.md](illustration-guide.md) | 画風、描写ルール、避ける表現。**4-1「女の子のモデル」を必ず守る** |
| [illustration-prompts.md](illustration-prompts.md) | 生成用の指示文。**「女の子の髪型」の章の文をそのまま使う** |
| [reference-collection-report.md](reference-collection-report.md) | 3回目の結果。特に「髪型どうしの見分け方」 |
| `img/styles/natural-sheet.webp` | 画風の基準（線の太さ、髪の塗り方、顔の控えめさ） |

Web上の写真や `docs/references.csv` のURL先の画像は、生成ツールへ入力・参照させない。

## 2. 男の子の見本との違い

- **モデル：** 10歳くらいの日本の女の子。画風・線・塗り方は男の子の見本（`natural-sheet.webp`）にそろえる。
- **描く範囲：** 頭から**胸まで**。長さを体の位置（あご・肩・鎖骨・胸）で示すため。肩と胸の位置が分かるよう、無地の丸首の服の線だけを描く（柄・リボン・飾りなし）。短い髪型も同じ範囲で描く。
- **髪飾りなし：** 髪は結ばずに下ろす。ヘアピン、ヘアゴム、カチューシャは描かない。
- **顔：** 目は小さめ、瞳の光とまつ毛は控えめ。メイクなし。

## 3. 作るもの

1つの髪型につき、正面・真横（左向き）・後ろを左から横一列に並べた1枚の横長画像を作る。上から順に進める。

| 順 | ID | 髪型 | 特に確認すること |
|---|---|---|---|
| 1 | `g-shortbob` | ショートボブ | **女の子のモデルの基準にする。** 裾があごの高さ。毛先が内に丸くおさまる。前髪はまゆ毛くらいで自然に下ろし、厚みがある |
| 2 | `g-roundshort` | 丸みショート | 横はあご上。**後ろの襟足が短く首が見える**。後頭部の高い位置に丸み（横から見て卵形） |
| 3 | `g-pattsunbob` | ぱっつんボブ | 前髪が**一直線**。裾も水平な一直線で段なし、重め。長さはあご |
| 4 | `g-bluntbob` | 切りっぱなしボブ | 長さは**肩上**（肩につかない）。裾は水平。毛先はまっすぐか、自然に軽く外にはねる（巻かない）。前髪は自然に下ろす |
| 5 | `g-medium` | ミディアム | 毛先が**肩に当たる**長さ。顔まわりに軽い段。強い段（ウルフ）にしない |
| 6 | `g-pattsunlong` | ぱっつんロング | 前髪が一直線。長さは胸。段なしで、横の髪もまっすぐ下りる |
| 7 | `g-nobanglong` | 前髪なしロング | 前髪なしで、まん中で分けておでこが見える。段なしで、顔の横の毛もまっすぐ |
| 8 | `g-layerlong` | 顔まわりレイヤーロング | 前髪なしで分ける。**あご下から顔まわりに段**が見え、毛先へ長くつながる。後ろの段は控えめ |

### 女の子のモデルをそろえる

- 1番（ショートボブ）を最初に作り、合格したら `img/styles/g-shortbob-sheet.png` を2番以降の**顔立ち・体の範囲・縮尺の基準**にする。8つとも同じ女の子に見えるようにする。
- 2番以降では、指示文の最後に次を足す：「顔立ち、頭の大きさ、肩と胸の位置、線の太さは、ショートボブの見本と同じ女の子にそろえる。変えるのは髪型だけ。」

## 4. 手順

1. 生成した1枚を `img/styles/<ID>-sheet.png` に保存し、3枚に分ける。

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/split-sheet.ps1 -src img/styles/g-shortbob-sheet.png -outDir img/styles -prefix g-shortbob
   ```

   `g-shortbob-front.png`・`g-shortbob-side.png`・`g-shortbob-back.png` ができる。`could not split into 3 drawings` と出たら、絵が近すぎるか重なっている。間を広くあけるよう指示して生成し直す。
2. 6章のチェックを確かめる。満たさなければ、違う点を指示文に書き足して生成し直す（1髪型につき最大3回）。不採用版は `img/styles/drafts/` に移す。
3. 合格したら、`js/data.js` の `window.HM_IMAGES` に登録する（男の子の髪型の登録はそのまま残す）。

   ```js
   'g-shortbob': { front: 'img/styles/g-shortbob-front.png', side: 'img/styles/g-shortbob-side.png', back: 'img/styles/g-shortbob-back.png' },
   ```

4. 8つ（またはできたところまで）そろったら、5章の見比べをする。

## 5. 見比べ（似すぎていないかの確認）

1枚ずつでは合格でも、並べると区別がつかないことがある（男の子のスポーツ刈りとボウズで起きた）。**必ず並べた画像で判定する。**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view front -ids "g-roundshort,g-shortbob,g-pattsunbob,g-bluntbob" -out check-girls-short-front.png -cols 4
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view side -ids "g-roundshort,g-shortbob,g-pattsunbob,g-bluntbob" -out check-girls-short-side.png -cols 4
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view back -ids "g-roundshort,g-shortbob,g-pattsunbob,g-bluntbob" -out check-girls-short-back.png -cols 4
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view front -ids "g-medium,g-pattsunlong,g-nobanglong,g-layerlong" -out check-girls-long-front.png -cols 4
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view side -ids "g-medium,g-pattsunlong,g-nobanglong,g-layerlong" -out check-girls-long-side.png -cols 4
powershell -ExecutionPolicy Bypass -File scripts/montage-styles.ps1 -view back -ids "g-medium,g-pattsunlong,g-nobanglong,g-layerlong" -out check-girls-long-back.png -cols 4
```

（`check-*.png` は git の対象外。）次の組み合わせで、決め手の違いが**小さい表示でも一目で分かる**ことを確かめる。

| 組み合わせ | 決め手 |
|---|---|
| 丸みショート ↔ ショートボブ | 後ろの裾：丸みショートは襟足が短く首が見える。ショートボブは裾があごの高さまで下りる |
| ショートボブ ↔ ぱっつんボブ | 前髪と裾：ぱっつんボブは前髪も裾も一直線で重い。ショートボブは前髪を自然に下ろし、毛先が内に丸まる |
| ぱっつんボブ ↔ 切りっぱなしボブ | 長さ（あご／肩上）と毛先（内に入る／まっすぐか軽く外にはねる） |
| 切りっぱなしボブ ↔ ミディアム | 長さ（肩につかない／肩に当たる）と顔まわりの段 |
| ぱっつんロング ↔ 前髪なしロング | 前髪（一直線／なしで、おでこが見える） |
| 前髪なしロング ↔ 顔まわりレイヤーロング | 顔まわり（段なしでまっすぐ／あご下から段） |

区別がつかない組み合わせがあれば、**どちらか一方**を作り直す。作り直すときは、もう一方の絵との違いを指示文にはっきり書き足す（例：「横から見て、襟足は首の付け根で終わり、首すじがはっきり見える。あごの高さまで下りない」）。

## 6. チェック項目

- [ ] 3章の表の「特に確認すること」を満たしている
- [ ] 正面・横・後ろで、長さ、前髪、段の位置、裾の形がそろっている
- [ ] 長さが体の位置どおり（あご上／あご／肩上／肩／胸）。胸までの髪型は、前に下ろした髪が胸の高さに届いている
- [ ] 8つとも同じ女の子に見える（顔立ち、頭の大きさ、肩と胸の位置）
- [ ] 髪飾り、結んだ髪、巻き髪、カラー、パーマ、メイクがない
- [ ] 服は無地の丸首の線だけ（柄・リボン・飾りなし）
- [ ] 背景が白の無地で、透明になっていない
- [ ] 文字、番号、ラベル、矢印がない
- [ ] 画風が `natural-sheet.webp` とそろっている（線画主体、控えめなハッチング、目は小さめ）
- [ ] 5章の見比べで、似すぎている組み合わせがない

## 7. 変えてはいけないもの

- `js/data.js` は `window.HM_IMAGES` への女の子の髪型の追加だけにする。髪型データ（`HM_STYLES`）の中身は変えない。見本の形とデータが合わないと判断した場合は、変えずに報告する。
- 男の子の髪型の見本画像（`img/styles/` の `g-` 以外）、比較画像（`img/fade/`・`img/compare/`）は触らない。
- `js/app.js` などのコードは変えない。
- git のコミットやpushはしない（レビューのあとで反映する）。

## 8. 報告

| ID | 生成回数 | 合格したか | チェックで気になった点 |
|---|---|---|---|

5章の見比べの結果（組み合わせごとに、区別がつくか）も書く。作り直した場合は、何が問題で、指示文に何を書き足したかも書く。
