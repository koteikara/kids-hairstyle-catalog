# 海外のデザイン参考（2026-09-27）

デザインを一新するために、海外の類似アプリ・サイトを3つの観点で調べた（エージェント3つで並行調査、合計39件）。

- 髪型カタログ・試着・美容師への伝え方
- 美容室の予約アプリとキッズサロン
- 親子向けアプリ・見た目で選ぶ仕組み・店員に見せる画面

**調べ方の限界：** 多くのページは文章だけを読んでいて、画面の見た目は確認できていない。見た目を確認できたのは、Treatwell Lookbook、Warby Parker、Scratch、Dribbbleのデザイン案など一部だけ。色や配置は、使う前にブラウザで確かめる。画像は保存していない。

## 分かったこと

1. **線画で、同じ頭の3方向を見せ、刈り上げを段階で比べるカタログは、見つからなかった。** 海外の例はどれも写真かAI生成の写真で、刈り上げの段階も1つずつ縦に並べるだけだった。ここはヘアみっけの強みになる。
2. **美容師への伝え方は、頭の部位ごとの「仕様」にまとまっている。** トップ・サイド・後ろ（襟足）・刈り上げの高さ・どこまで短くするか・ハサミかバリカンか・トップの流し方・手入れの手間。HairCut History、Pigtails & Crewcuts、Manhattan Barbershop の3つが、ほぼ同じ項目に行き着いている。
3. **刈り上げは「ひかえめ → はっきり」の1本の軸で、耳を目印に説明する。** ミリ数は補足にとどめる。
4. **子ども対応は、言葉ではなく具体的な設備や取り組みで示す。** 静かなバリカン、落ち着いて過ごせる時間枠、子どもに慣れたスタッフなど。
5. **有料枠を「おすすめ」と呼ばない。** 英国の広告審査機関（ASA）は2023年、Booksyの有料バッジ「Booksy Recommended」を、広告だと分からない表示だと判断した。
6. **10歳の男の子向けには、幼児向けのかわいさより、道具らしい落ち着いた見た目が合う。** 予約アプリのすっきりした構成に、キッズサロンの安心材料と、控えめな案内役を少しだけ足す。

## 画面ごとに取り入れたい点

### ホーム

- 親の悩みの言葉から始める。例：「美容師さんにどう伝えればいいか分からない」（Pigtails & Crewcuts）
- 子ども向けの言葉と、親向けの事実を分ける。親向けは「ログイン不要・広告なし・保存するデータ」を短く書く（Khan Academy Kids）。
- 親向けには「おうちの方へ」の別ページを用意する（Scratch）。

### カタログと絞り込み

- 検索欄の下に、条件のチップを並べる。チップには小さな線画アイコンを付ける（Treatwell Lookbook）。
- 一覧は2列で、同じ大きさのタイルを並べる。ばらばらの高さで詰める並べ方（石積み型）にしない。線画は大きさがそろうほど見比べやすい（Pinterest Gestalt）。
- 絞り込みは下から出るシートで行い、「12件を見る」と件数を出す。選んだ条件は一覧の上に「×」付きのチップで残す。0件になる選択肢は薄く表示する（Baymard Institute）。
- タイルには、髪型名と手入れの手間を見える形で出す（キッズサロンの各スタイル紹介）。
- 無限スクロールにせず、一覧に終わりがある形にする。

### 髪型の詳細

- 特徴を一覧で見せ、行動ボタンは1つ（「カードを作る」）にする（Treatwell Lookbook）。
- すべての髪型に同じ項目を出す。例：「こんな子に」「手入れ」（Manhattan Barbershop）
- 近い髪型を並べて見せる（Sherwin-Williams ColorSnap の似た色）。

### カード作成（希望を選ぶ）

- 1画面で1項目を選ぶ。上に1つ、変わらないプレビューを置く（Apple Memoji）。
- 手順の数は「1 / 5」のように小さく出す。選択肢は大きなカードにする（Warby Parker）。
- どの項目にも「わからない・おまかせ」を用意する（Warby Parker の「スキップ」）。子どもは「襟足」のような言葉で止まりやすい。
- 前のカードをもとに少し変えて作り直せるようにする（Memoji の複製）。

### 刈り上げの比較

- 同じ頭で4段階を横に並べ、「ひかえめ → はっきり」の順にする。各段階には短い呼び名を付ける（HairIsEverything）。
- 高さは耳を目印に説明し、ミリ数は補足にする（Manhattan Barbershop、StyleSeat）。

### 美容師さんに見せるカード

- 搭乗券のように作る。いちばん大事な項目を1つ大きく出し、短い項目をいくつか並べ、詳しい内容は2ページ目に回す（Apple Wallet の設計指針）。
- 項目名と値は短くする（Google Wallet の目安は、項目名20文字未満・値15文字未満）。
- 項目は頭の部位の順に並べる（トップ → サイド → 後ろ → 刈り上げ）（HairCut History）。
- 共有はQRコードやリンクにし、美容師さんにはアカウントを求めない（HairCut History）。
- 絵を読まない美容師さんのために、文章の要約も必ず付ける（NHS App の手入力用の番号）。
- 腕を伸ばして見せても読める大きさにする。「画面を明るくして見せてね」と案内を出す。
- 美容師さんからのメモを残せるようにすると、次回の記録になる（HairCut History）。**→ 相談メモの設計に使う**

### 人気

- 集計のルールと期間を、一覧の横に書く。例：「過去30日の閲覧とカード作成で集計。広告は含みません」（StyleSeat の Top Pro）
- 並び順は利用者が選べるようにする（Vagaro）。

### お店さがし

- 子ども対応は、決まった項目のタグで示す。タグには出典と確認日を付ける（Cookie Cutters、Kids Hair Play、Sensory Hair Hub）。
- キッズメニューは「メニュー名（年齢の条件）・料金〜・所要時間」の形で見せる（Booksy）。
- 「掲載は推薦ではありません」と一文入れる（英国自閉症協会のディレクトリ）。
- 広告は「広告」「PR」と書き、カードそのものに付ける。人気の一覧とは別の枠に置く（Booksy の反面教師）。
- 将来は、選んだ髪型からお店を探せるようにする（theCut）。

## 避けること

- 見る前に課金させる、週ごとの定期購読（多くの髪型試着アプリ）。
- 子どもの顔写真を前提にすること（AI試着アプリ）。
- 比べたい項目のあいだに広告を挟むこと（髪型まとめサイト）。
- 連続記録、ランキング争い、「残り3つ」のような急がせる表示（Duolingo、Vagaro）。
- 幼児向けのキャラクターと派手な色（Lingokids、キッズサロンチェーン）。
- 高級感を出した写真と割引の帯（Dribbbleのデザイン案）。

## 参考一覧

確認欄：「画面」はブラウザで画面を見た、「文章」はページの文章だけを読んだ、「ストア」はアプリストアの説明だけを読んだ。

### 髪型カタログ・伝え方

| 名前 | URL | 見るところ | 確認 |
|---|---|---|---|
| HairCut History | https://haircuthistory.com/ | 部位ごとのカード、QRで共有、美容師のメモ（アプリの実在は未確認） | 文章 |
| Pigtails & Crewcuts スタイルブック | https://pigtailsandcrewcuts.com/stylechat/style-book/ | 親の悩みから始める言葉、スタイルごとの技術説明 | 文章 |
| Pigtails & Crewcuts 男の子の髪型ガイド | https://pigtailsandcrewcuts.com/roswell-ga/kids-haircuts/boys-haircut-guide/ | 美容師に伝える項目の一覧、年齢別 | 文章 |
| Snip-its 親向けガイド | https://snipits.com/kids-haircuts-the-complete-guide-for-parents/ | 髪質 × 目的の表、手入れの軽さ | 文章 |
| StyleSeat バリカン番号の解説 | https://www.styleseat.com/blog/haircut-number-system/ | 番号・mm・例の表、そのまま言える一言 | 文章 |
| HairIsEverything 刈り上げガイド | https://hairiseverything.app/blog/men-hairstyles/hub/fade-and-taper-guide | ひかえめ → はっきりの軸、短い呼び名 | 文章 |
| Manhattan Barbershop 刈り上げガイド | https://www.manhattanbarbershopnyc.com/style-guide/fade-haircuts | 耳を目印にした高さ、同じ項目のそろえ方 | 文章 |
| L'Oréal Professionnel バーチャル試着 | https://www.lorealprofessionnel.com/virtual-try-on | 3手順の流れ、最後が美容師との相談 | 文章 |
| Men's Hairstyles – Face Guide | https://apps.apple.com/us/app/mens-hairstyles-face-guide/id1608292806 | 絞り込みの軸（反面教師：課金で隠す） | ストア |
| Hairstyle Try On Men – Cuts AI | https://apps.apple.com/us/app/hairstyle-try-on-men-cuts-ai/id6753205043 | 反面教師（定期購読、自撮り） | ストア |
| The Right Hairstyles 刈り上げ15種 | https://therighthairstyles.com/types-of-fades-for-men/ | 高さ順（反面教師：広告が挟まる） | 文章 |

### 予約アプリ・キッズサロン

| 名前 | URL | 見るところ | 確認 |
|---|---|---|---|
| Treatwell Lookbook | https://www.treatwell.co.uk/lookbook/looks/ | 条件チップ、2列の一覧、特徴の一覧と行動ボタン1つ | 画面 |
| theCut | https://thecut.co/ | 髪型から探す、得意分野のタグ | ストア・文章 |
| Booksy | https://booksy.com/en-us/s/barber-shop/18229_chicago | キッズメニューの書き方（反面教師：有料バッジ） | 文章 |
| ASA の Booksy に関する判断 | https://www.asa.org.uk/rulings/booksy-uk-ltd-a23-1185972-booksy-uk-ltd.html | 有料枠の表示についての判断 | 文章 |
| StyleSeat Top Pro | https://styleseat.freshdesk.com/support/solutions/articles/69000843265-how-to-become-a-top-pro | 基準を公開したバッジ | 検索結果のみ |
| Fresha | https://www.fresha.com/ | スタイリスト個人の紹介ページ | 文章 |
| Vagaro | https://www.vagaro.com/ | 利用者が選ぶ並び順 | 文章 |
| Cookie Cutters | https://haircutsarefun.com/the-experience/ | 具体的な子ども対応の示し方 | 文章 |
| Pigtails & Crewcuts | https://www.pigtailsandcrewcuts.com/services | メニューの分け方、安心させる言葉 | 文章 |
| Snip-its | https://www.snipits.com/ | 道具のキャラクター（使うなら控えめに） | 文章 |
| Kids Hair Play | https://kidshairplay.co.uk/ | 静かなバリカンなどの設備、料金「〜」 | 文章 |
| Fidgets | https://thesalonforkids.co.uk/ | 感覚に配慮した時間枠 | 文章 |
| Sensory Hair Hub | https://www.sensoryhairhub.co.uk/ | 確認済みの印をカードに出す | 文章 |
| 英国自閉症協会 サービス一覧 | https://www.autism.org.uk/autism-services-directory/kiddies-kutz | 決まった項目、「推薦ではない」の一文 | 文章 |

### 親子向けUI・見た目で選ぶ・見せる画面

| 名前 | URL | 見るところ | 確認 |
|---|---|---|---|
| Khan Academy Kids | https://www.khanacademy.org/kids | 子ども向けと親向けの言葉を分ける | 画面（一部）・文章 |
| Scratch 保護者の方へ | https://scratch.mit.edu/parents/ | 親向けの別ページ、道具らしい見た目 | 画面 |
| Duolingo タブの作り直し | https://blog.duolingo.com/core-tabs-redesign/ | 文字の大きさを絞る、余白で分ける | 文章 |
| Toca Boca World キャラクター作成 | https://tocaboca.helpshift.com/hc/en/3-toca-boca-world/faq/379-character-creator-improvements-are-here-it-s-time-for-a-glow-up-1779808294/ | 選択肢を絞ってそろえる | 文章 |
| Apple ミー文字 | https://support.apple.com/guide/iphone/create-and-send-memoji-iphd730f04a7/ios | 1項目ずつ選ぶ、変わらないプレビュー、複製 | 文章 |
| Warby Parker フレーム診断 | https://www.warbyparker.com/quiz/frames | 手順の数、大きな選択肢、スキップ | 画面 |
| Baymard Institute 絞り込みUI | https://baymard.com/blog/ecommerce-filter-ui | スマホの絞り込みの作法 | 文章 |
| Pinterest Gestalt Masonry | https://gestalt.pinterest.systems/web/masonry | 同じ大きさで並べる形 | 文章 |
| Sherwin-Williams ColorSnap | https://www.sherwin-williams.com/homeowners/color-through-the-decades/color-tools/colorsnap-mobile | 似たものを並べる、店内用の表示 | 文章 |
| Apple Wallet 設計指針 | https://developer.apple.com/design/human-interface-guidelines/wallet | 見せる画面の項目の優先順位 | 文章 |
| Google Wallet ブランド指針 | https://developers.google.com/wallet/generic/resources/brand-guidelines | 文字数の目安、落ち着いた色 | 文章 |
| NHS App 処方せんバーコード | https://www.nhs.uk/nhs-app/help/prescriptions/requesting-a-prescription/ | 複数ページ、手入力の代わり | 文章 |
| Dribbble 美容室予約アプリ案（Tapadar） | https://dribbble.com/shots/24865802-Barber-Booking-Mobile-App-Concept | 伝えにくさという課題の書き方（実在の製品ではない） | 画面 |
| Dribbble 美容室アプリ案（Mavero、Supitar） | https://dribbble.com/shots/20582863-Style-Hair-App-Exploration | チップ＋2列（見た目はまねしない。実在の製品ではない） | 画面 |
