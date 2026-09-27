// ヘアみっけ：髪型データ（プロトタイプ用の仮データ）
// params はイラスト生成と絞り込みの両方に使う。
//   top      : 全体の長さ 0=とても短め 1=短め 2=ふつう 3=長め
//   bang     : 前髪の長さ none / short / brow / long
//   bangShape: 前髪の形 natural / straight / side / center / up / spiky / none
//   ear      : 耳まわり out / half / cover
//   nape     : 襟足 short / mid / long
//   fade     : 刈り上げ 0=なし 1=低め 2=中くらい 3=高め
// base は人気表示用の仮の集計値（閲覧・いいね・保存・カード作成）。
// params は見本イラストに描く「標準形」。正解として固定するものではない。
// variants は「その髪型で選べるバリエーション候補」。参考写真などで違いが見つかった項目を
//   { field, values, basis } で記録する。カード作成で候補として示し、絞り込みでも候補に一致すれば表示する。
//   field: ear / nape / fade / bangShape、values: 選べる値（標準形の値も含める）、basis: 候補にした根拠
// variantNotes は、まだ選択項目になっていない違いのメモ（今後の候補）。
// fadeNote は、その髪型だけの刈り上げの説明（共通の段階ラベルの説明より優先して表示する）。
// kidNotes は、大人・中高生の参考から子ども向けにするとき控える点（イラスト制作の指示に使う）。

window.HM_LABELS = {
  top: { 0: 'とても短め', 1: '短め', 2: 'ふつう', 3: '長め' },
  bang: { none: 'ほぼなし', short: '短め（おでこが見える）', brow: 'まゆ毛くらい', long: 'まゆ下（目にはかからない）' },
  bangShape: {
    natural: '自然におろす', straight: 'まっすぐそろえる', side: '横に流す',
    center: 'まん中で分ける', up: '上げておでこを出す', spiky: 'ツンツン立たせる',
    sideup: 'おでこを出して横に流す', none: '—'
  },
  ear: { out: '耳を出す', half: '耳に半分かかる', cover: '耳がかくれる' },
  nape: { short: '短め（すっきり）', mid: 'ふつう', long: '長め' },
  fade: ['なし', '低め', '中くらい', '高め'],
  fadeDesc: [
    '刈り上げなし。ハサミでなじませる',
    '襟足のまわりだけ、低めに刈り上げ',
    '耳の真ん中くらいの高さまで刈り上げ',
    '耳の上くらいの高さまで刈り上げ（ツーブロック気味もOK）'
  ],
  effort: { 1: 'かんたん', 2: 'ふつう', 3: 'ちょっと手間' },
  effortDesc: { 1: 'くしでとかすだけ', 2: 'ドライヤーでかわかす', 3: 'ワックスでととのえる' },
  wax: { none: 'ワックスなし', light: 'ワックス少し', use: 'ワックスあり' },
  set: {
    none: '何もしない（くしでとかすだけ）',
    dryer: 'ドライヤーでかわかすだけ',
    waxlight: 'ワックスを少しつける',
    wax: 'ワックスでしっかりセット'
  }
};

window.HM_FILTERS = [
  { key: 'top', label: '全体の長さ', options: [['1', '短め'], ['2', 'ふつう'], ['3', '長め']] },
  { key: 'bang', label: '前髪', options: [['none', 'ほぼなし'], ['short', '短め'], ['brow', 'まゆ毛くらい'], ['long', 'まゆ下'], ['up', '上げる・立てる']] },
  { key: 'ear', label: '耳まわり', options: [['out', '耳を出す'], ['half', '半分かかる'], ['cover', 'かくれる']] },
  { key: 'nape', label: '襟足', options: [['short', '短め'], ['mid', 'ふつう'], ['long', '長め']] },
  { key: 'fade', label: '刈り上げ', options: [['0', 'なし'], ['1', '低め'], ['2', '中くらい'], ['3', '高め']] },
  { key: 'effort', label: 'セットの手間', options: [['1', 'かんたん'], ['2', 'ふつう'], ['3', 'ちょっと手間']] },
  { key: 'wax', label: 'ワックス', options: [['none', '使わない'], ['light', '少し'], ['use', '使う']] }
];

window.HM_QUICK = [
  { label: 'ワックスなし', key: 'wax', val: 'none' },
  { label: 'セットかんたん', key: 'effort', val: '1' },
  { label: '刈り上げなし', key: 'fade', val: '0' },
  { label: '耳を出す', key: 'ear', val: 'out' },
  { label: '長め', key: 'top', val: '3' }
];

window.HM_STYLES = [
  {
    id: 'sports', name: 'さっぱりスポーツ刈り', catch: '汗をかいてもすぐかわく！',
    params: { top: 1, bang: 'short', bangShape: 'natural', ear: 'out', nape: 'short', fade: 3 },
    fadeNote: 'サイドはこめかみ〜はちの下まで、後ろは低めに刈り上げ、上の髪へ段差なくなじませる（ツーブロックのように上の髪をかぶせない）',
    variants: [
      { field: 'fade', values: [2, 3], basis: '参考3件と見本イラスト：サイドはこめかみ〜はちの下まで。低めにしたい場合は中くらいも選べる' },
      { field: 'bangShape', values: ['natural', 'side'], basis: '小学生の参考1件は前髪を少しななめに流していた' }
    ],
    variantNotes: ['トップの質感：寝かせて丸く（標準）／毛先を軽く立たせる', '刈り上げの境目：なじませる（標準）／段を少し残す'],
    kidNotes: 'ノーセットの自然な状態で描く。ツンツンの立ち上げ、ワックスの艶、カラーは描かない。刈り上げは地肌が白く見えない長さにする',
    effort: 1, wax: 'none', tags: ['スポーツ向き', '夏にぴったり'],
    kid: 'みじかくて、あたまがかるい！ サッカーや水泳のあとも、タオルでふくだけですぐかわくよ。',
    stylist: ['トップは3〜4cmほど残して丸みを出す', 'サイドはこめかみ〜はちの下まで、後ろは低めにバリカンで刈り上げ、上の髪へ段差なくなじませる（ツーブロックのように上の髪をかぶせない）', '前髪はまゆ上2〜3cm、ギザギザ過ぎず自然に'],
    base: { view: 1240, like: 210, save: 132, card: 74 }
  },
  {
    id: 'buzz', name: 'ボウズ風ベリーショート', catch: 'いちばんラク。朝は何もしなくてOK',
    params: { top: 0, bang: 'none', bangShape: 'none', ear: 'out', nape: 'short', fade: 1 },
    variants: [
      { field: 'fade', values: [0, 1], basis: '参考3件：全体同じ長さのものと、裾だけ短くしてぼかすもの' }
    ],
    variantNotes: ['全体の長さ：9mm／12mm／15mm前後の長めボウズ', '頭頂部：均一（標準）／少し長く残す（おしゃれ坊主寄り）'],
    kidNotes: '裾は3〜6mm程度にとどめ、地肌が目立たないように描く。スキンフェード、ライン、剃り込みは描かない',
    effort: 1, wax: 'none', tags: ['スポーツ向き', 'お手入れラク'],
    kid: 'あたまぜんぶが、みじかくてそろっているよ。さわるとジョリジョリして気持ちいい！',
    stylist: ['全体をバリカンでそろえる（長さは9〜12mm前後から相談）', '襟足と耳まわりは少し短めにしてメリハリ', 'はえぎわは自然に'],
    base: { view: 610, like: 88, save: 41, card: 22 }
  },
  {
    id: 'twoblock', name: 'キッズツーブロック', catch: 'サイドすっきり、上はふんわり',
    params: { top: 2, bang: 'brow', bangShape: 'natural', ear: 'out', nape: 'short', fade: 3 },
    variants: [
      { field: 'fade', values: [2, 3], basis: '参考2件：耳上まで〜はちの下まで（小学生の実例はなし）' }
    ],
    variantNotes: ['刈り上げの見せ方：上の髪で隠す／段差を見せる', '後ろ：襟足まで刈り上げる／後ろは長さを残す（参考の本文のみ、写真では未確認）'],
    kidNotes: '上の髪を刈り上げ部分にかぶせ、刈り上げが見えすぎないように描く。地肌が見えるほどの刈り上げ、ハードワックスの束感、カラーは描かない',
    effort: 2, wax: 'light', tags: ['人気', 'かっこいい'],
    kid: 'よこはみじかく、うえはすこし長めだよ。うえのかみが、みじかいところにふわっとかぶさるよ。',
    stylist: ['耳上まで刈り上げ（ツーブロック）、上の髪がかぶる程度の長さを残す', 'トップは5〜6cm、重くなりすぎないよう量を調整', '学校の決まりがある場合は刈り上げ部分が見えすぎないように'],
    base: { view: 1580, like: 260, save: 175, card: 98 }
  },
  {
    id: 'natural', name: 'ナチュラルショート', catch: 'はじめてでも頼みやすい定番',
    params: { top: 2, bang: 'brow', bangShape: 'natural', ear: 'out', nape: 'mid', fade: 0 },
    variants: [
      { field: 'ear', values: ['out', 'half'], basis: '標準は耳を出す（参考写真2件と見本イラスト）。耳に半分かける形も選べる' },
      { field: 'nape', values: ['mid', 'short'], basis: '参考写真2件はどちらも襟足が短め' },
      { field: 'fade', values: [0, 1], basis: '短めのベリーショート寄りにするなら、襟足だけ低めに刈り上げる' }
    ],
    variantNotes: ['全体を短めにした形（ベリーショート）：トップ3〜4cmで丸く、前髪はまゆ上でそろえ、襟足だけ低めに刈り上げる'],
    effort: 1, wax: 'none', tags: ['学校向き', '定番', 'ベリーショートも'],
    kid: 'いちばんふつうで、にあいやすいかみがただよ。みみが出ていて、すっきりやさしいかんじ。',
    stylist: ['全体をハサミで。トップ5cm前後', '耳は出して、耳まわりはすっきり。刈り上げなし', '前髪はまゆ毛くらいで自然に'],
    base: { view: 990, like: 132, save: 101, card: 60 }
  },
  {
    id: 'mash', name: 'マッシュ', catch: 'まるいシルエットでやわらかい印象',
    params: { top: 3, bang: 'brow', bangShape: 'straight', ear: 'half', nape: 'mid', fade: 1 },
    variants: [
      { field: 'ear', values: ['half', 'out'], basis: '参考3件で、耳が半分かかるものと出すものがあった' },
      { field: 'fade', values: [0, 1], basis: '参考3件で、刈り上げなし（襟足を短く切る）と低めのものがあった' }
    ],
    variantNotes: ['前髪：まゆ毛くらい／まゆ上で軽め', '重さ：厚めにそろえる／軽く束感を出す'],
    kidNotes: '前髪は目にかからない長さにする。重すぎるおかっぱ風にしない。パーマ、カラー、高い刈り上げ（くびれ）は描かない',
    effort: 2, wax: 'none', tags: ['人気', 'おしゃれ'],
    kid: 'キノコみたいに、まるいかたち！ まえがみはまゆげのあたりで、ふんわりそろっているよ。',
    stylist: ['前髪〜サイドを丸くつなげたマッシュライン', '前髪はまゆ毛くらい、厚めにそろえる', '襟足は低めに刈り上げて首まわりを軽く'],
    base: { view: 1420, like: 240, save: 160, card: 85 }
  },
  {
    id: 'upbang', name: 'アップバング', catch: 'おでこを出して、さわやかに',
    params: { top: 2, bang: 'short', bangShape: 'up', ear: 'out', nape: 'short', fade: 2 },
    variants: [
      { field: 'fade', values: [1, 2], basis: '参考3件：耳上まで、またはもっと低め' }
    ],
    variantNotes: ['刈り上げの境目：なじませる／段差を見せる', '立ち上げ：ふんわり軽め／束感をしっかり', 'スタイリング：ワックスを使う／使わず短く上がる形（写真では未確認）'],
    kidNotes: '前髪はふんわり軽く上げる程度にする。強いツンツンの立ち上げ、ハードワックスの束感、ハイライト、地肌が見える強いフェードは描かない',
    effort: 3, wax: 'use', tags: ['かっこいい', '高学年向き'],
    kid: 'まえがみを上にあげて、おでこを出すよ。ワックスで立ち上げると、かっこよくきまる！',
    stylist: ['前髪は立ち上げやすい長さ（4〜5cm）を残す', 'サイドは中くらいまで刈り上げ', '毎朝ワックスを使う前提。子どもが自分でできる手順も教えてほしい'],
    base: { view: 760, like: 120, save: 58, card: 30 }
  },
  {
    id: 'softmohi', name: 'ソフトモヒカン', catch: 'まん中をツンツン、元気いっぱい',
    params: { top: 2, bang: 'short', bangShape: 'spiky', ear: 'out', nape: 'short', fade: 3 },
    variants: [
      { field: 'fade', values: [2, 3], basis: '参考4件の多くは、はちの下まで（中くらい）' }
    ],
    variantNotes: ['刈り上げの濃さ：地肌を見せない／うっすら地肌が分かる', 'トップ：全体を短くツンツン／中央だけ少し長め', 'セット：なし（自然に立つ）／ワックスで中央に寄せる'],
    kidNotes: 'トップは中央を少し長くする程度で、極端に立ち上げない。地肌がはっきり見えるフェード、剃り込み、ライン、模様は描かない',
    effort: 3, wax: 'use', tags: ['スポーツ向き', 'かっこいい'],
    kid: 'あたまのまん中のかみを、ツンツンたたせるよ。よこはみじかくて、すっきり！',
    stylist: ['トップ中央を長めに残し、サイドは高めに刈り上げ', '前髪は短め、立たせやすく', 'セットはワックスで中央に寄せる'],
    base: { view: 700, like: 118, save: 52, card: 27 }
  },
  {
    id: 'centerpart', name: 'センターパート', catch: 'まん中分けで、ちょっとお兄さん風',
    params: { top: 3, bang: 'long', bangShape: 'center', ear: 'half', nape: 'mid', fade: 1 },
    variants: [
      { field: 'ear', values: ['half', 'out'], basis: '参考写真3件すべてで耳が見えていた' },
      { field: 'nape', values: ['mid', 'short'], basis: '参考写真は襟足を刈り上げて短くしていた' },
      { field: 'fade', values: [0, 1, 2], basis: 'ツーブロック・刈り上げは好みで別に選べる' }
    ],
    effort: 2, wax: 'light', tags: ['おしゃれ', '高学年向き'],
    kid: 'まえがみをまん中で分けるよ。目にかからないから、べんきょうもしやすい！',
    stylist: ['前髪はまゆ下〜目の上、目にかからない長さ', '分け目は中央、ドライヤーで根元をクセづけ', '襟足は低めに刈り上げ'],
    base: { view: 920, like: 170, save: 88, card: 40 }
  },
  {
    id: 'longmash', name: '長めマッシュ', catch: 'ふんわり長め。耳まですっぽり',
    params: { top: 3, bang: 'long', bangShape: 'straight', ear: 'cover', nape: 'long', fade: 0 },
    effort: 2, wax: 'none', tags: ['おしゃれ', 'のばしたい子に'],
    kid: 'ながめで、みみまでかくれるよ。ふわっとしていて、やさしいかんじ。',
    stylist: ['全体をハサミで、耳がかくれる長さ', '前髪はまゆ下、目にかからないようにそろえる', '襟足は長めに残して重くなりすぎないよう量を調整'],
    base: { view: 540, like: 96, save: 47, card: 19 }
  },
  {
    id: 'sidepart', name: '横流しショート', catch: 'きちんと感があって行事にも',
    params: { top: 2, bang: 'brow', bangShape: 'side', ear: 'out', nape: 'short', fade: 1 },
    variants: [
      { field: 'bangShape', values: ['side', 'sideup'], basis: '参考写真2件の七三は、どちらも額を出して流していた' },
      { field: 'fade', values: [1, 2], basis: '参考写真は低め〜中くらいのツーブロック' }
    ],
    effort: 2, wax: 'light', tags: ['学校向き', 'きちんと'],
    kid: 'まえがみを、よこにながすよ。ピシッとして、しゃしんをとるときにもいいね。',
    stylist: ['前髪をまゆ毛くらいで残し、横に流しやすくカット', '耳は出してすっきり', '襟足は低めに刈り上げ、分け目は子どもの毛流れに合わせて'],
    base: { view: 650, like: 90, save: 49, card: 24 }
  }
];

// 統合した髪型のIDの読みかえ。保存済みのいいね・カード・共有リンクが古いIDでも開けるようにする。
//   veryshort（ベリーショート）は、2026-09-27 にナチュラルショートの短めバリエーションへ統合した
window.HM_ALIASES = { veryshort: 'natural' };

// 完成イラスト（参考写真をもとに制作した画像）の登録先。
// 画像がある髪型は画像を表示し、ない髪型は js/illust.js の簡易図で代わりに表示する。
//   例：natural: { front: 'img/styles/natural-front.webp', side: 'img/styles/natural-side.webp', back: 'img/styles/natural-back.webp' }
window.HM_IMAGES = {
  // 試作（2026-09-27）：画像生成で作成した3方向の1枚（natural-sheet.webp）を分割したもの
  natural: { front: 'img/styles/natural-front.png', side: 'img/styles/natural-side.png', back: 'img/styles/natural-back.png' },
  // Codexで生成（第2案）。後ろの中心で上の髪が少しV字に下がるが、刈り上げの高さは横と後ろでそろっていると判断して採用
  twoblock: { front: 'img/styles/twoblock-front.png', side: 'img/styles/twoblock-side.png', back: 'img/styles/twoblock-back.png' },
  buzz: { front: 'img/styles/buzz-front.png', side: 'img/styles/buzz-side.png', back: 'img/styles/buzz-back.png' },
  mash: { front: 'img/styles/mash-front.png', side: 'img/styles/mash-side.png', back: 'img/styles/mash-back.png' },
  sidepart: { front: 'img/styles/sidepart-front.png', side: 'img/styles/sidepart-side.png', back: 'img/styles/sidepart-back.png' },
  centerpart: { front: 'img/styles/centerpart-front.png', side: 'img/styles/centerpart-side.png', back: 'img/styles/centerpart-back.png' },
  longmash: { front: 'img/styles/longmash-front.png', side: 'img/styles/longmash-side.png', back: 'img/styles/longmash-back.png' },
  // 3回目の生成版。刈り上げはこめかみまで（参考写真の実例に合わせてデータ側を直した）
  sports: { front: 'img/styles/sports-front.png', side: 'img/styles/sports-side.png', back: 'img/styles/sports-back.png' },
  // 再生成版をレビューで採用（docs/image-review.md）。softmohi は中央の高さが控えめで条件付き
  upbang: { front: 'img/styles/upbang-front.png', side: 'img/styles/upbang-side.png', back: 'img/styles/upbang-back.png' },
  softmohi: { front: 'img/styles/softmohi-front.png', side: 'img/styles/softmohi-side.png', back: 'img/styles/softmohi-back.png' }
};

// 刈り上げ比較の共通画像（同じ子・同じ角度・同じ髪で、刈り上げだけを変えたもの）。0=なし〜3=高め
//   例：back: ['img/fade/back-0.webp', 'img/fade/back-1.webp', 'img/fade/back-2.webp', 'img/fade/back-3.webp']
window.HM_FADE_IMAGES = {
  side: ['img/fade/side-0.png', 'img/fade/side-1.png', 'img/fade/side-2.png', 'img/fade/side-3.png'],
  back: ['img/fade/back-0.png', 'img/fade/back-1.png', 'img/fade/back-2.png', 'img/fade/back-3.png']
};

// 違いを比べる軸（詳細画面のタブの順）。values は比較画像を並べる順、views は比べる向き（先頭が基本）
window.HM_COMPARE_AXES = [
  { key: 'fade', label: '刈り上げ', values: [0, 1, 2, 3], views: ['side', 'back'], scale: ['ひかえめ', 'はっきり'] },
  { key: 'bangShape', label: '前髪', values: ['natural', 'side', 'center', 'up'], views: ['front', 'side'], scale: ['おろす', '上げる'] },
  { key: 'ear', label: '耳まわり', values: ['out', 'half', 'cover'], views: ['front', 'side'], scale: ['出す', 'かくす'] }
];
// 比較画像の登録先：軸 → 向き → 値。刈り上げは配列（添字＝値）、ほかは値をキーにしたオブジェクト
//   例：bangShape: { front: { natural: 'img/compare/bangs-front-natural.png', ... }, side: { ... } }
//   登録がない軸は、詳細画面で「準備中」と表示する
window.HM_COMPARE_IMAGES = {
  fade: window.HM_FADE_IMAGES,
  bangShape: {
    front: { natural: 'img/compare/bangs-front-natural.png', side: 'img/compare/bangs-front-side.png', center: 'img/compare/bangs-front-center.png', up: 'img/compare/bangs-front-up.png' },
    side: { natural: 'img/compare/bangs-side-natural.png', side: 'img/compare/bangs-side-side.png', center: 'img/compare/bangs-side-center.png', up: 'img/compare/bangs-side-up.png' }
  }
};

// 調整軸（相談メモで選ぶ項目）。希望を選ぶ画面・相談メモ・相談モード・比較画像はこの一覧を参照する（docs/spec.md 4-2）
//   key: 相談メモでの項目名（len・bang は見本からの相対：-1 短め／0 見本どおり／1 長め）
//   options: [値, 名前, ひとこと]。どの軸でも 'unsure'（わからない・美容師さんと相談）を選べる
window.HM_AXES = [
  { key: 'len', label: '全体の長さ', en: 'LENGTH', q: '全体の長さは？', hint: '見本とくらべて、だいたいでOK。',
    options: [[-1, '見本より短め', 'すっきりさせたい'], [0, '見本どおり', ''], [1, '見本より長め', 'のばしたい']] },
  { key: 'bangShape', label: '前髪の向き', en: 'BANGS', q: '前髪はどうする？', hint: 'おろすか、流すか、上げるか。', onlyVariants: true, options: [] },
  { key: 'bang', label: '前髪の長さ', en: 'BANGS', q: '前髪の長さは？', hint: '見本とくらべて。目にかからない長さにするのが基本。',
    options: [[-1, '見本より短め', 'おでこが見える'], [0, '見本どおり', ''], [1, '見本より長め', 'まゆ毛にかかる']] },
  { key: 'ear', label: '耳まわり', en: 'EARS', q: '耳まわりは？', hint: '耳を出すか、かくすか。',
    options: [['out', '出す', '耳全体が見える'], ['half', '半分かかる', '耳の上半分に髪がかかる'], ['cover', 'かくす', '耳がほぼかくれる']] },
  { key: 'fade', label: '刈り上げ', en: 'FADE', q: '刈り上げの高さは？', hint: '横から見た高さ。耳を目印に比べてね。', compare: true,
    options: [[0, 'なし', 'ハサミだけで整える'], [1, '低め', '首の後ろだけ短く'], [2, '中くらい', '耳の真ん中まで'], [3, '高め', '耳の上まで。上の髪が少しかぶる']] },
  { key: 'nape', label: '襟足', en: 'NAPE', q: '襟足（首の後ろ）は？', hint: '首すじを見せるか、少し残すか。',
    options: [['short', '短め', '首すじが見える'], ['mid', 'ふつう', '自然に残す'], ['long', '長め', '首すじに少しかかる']] },
  { key: 'set', label: 'ふだんのセット', en: 'STYLING', q: 'ふだんのセットは？', hint: '朝、どこまでやる？',
    options: [['none', '何もしない', 'くしでとかすだけ'], ['dryer', 'ドライヤー', 'かわかすだけ'], ['waxlight', 'ワックス少し', '毛先を整える'], ['wax', 'ワックスしっかり', '毎朝セットする']] }
];

// 編集部のおすすめ（ホームに並べる順）。人気の数字は表示しない（docs/spec.md 8章の決定8）
window.HM_PICKS = ['natural', 'twoblock', 'mash', 'sports', 'centerpart', 'upbang'];

// 髪型の英語名（見出しの添え）
(function () {
  const EN = {
    sports: 'SPORTS CUT', buzz: 'BUZZ CUT', twoblock: 'TWO BLOCK', natural: 'NATURAL SHORT', mash: 'MUSHROOM',
    upbang: 'UP BANG', softmohi: 'SOFT MOHAWK', centerpart: 'CENTER PART', longmash: 'LONG MUSHROOM', sidepart: 'SIDE PART'
  };
  window.HM_STYLES.forEach((s, i) => { s.en = EN[s.id] || ''; s.no = String(i + 1).padStart(2, '0'); });
})();
