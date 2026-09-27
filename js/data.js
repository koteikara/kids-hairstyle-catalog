// ヘアみっけ：髪型データ（プロトタイプ用の仮データ）
// params はイラスト生成と絞り込みの両方に使う。
//   top      : 全体の長さ 0=とても短め 1=短め 2=ふつう 3=長め
//   bang     : 前髪の長さ none / short / brow / long
//   bangShape: 前髪の形 natural / straight / side / center / up / spiky / none
//   ear      : 耳まわり out / half / cover
//   nape     : 襟足 short / mid / long
//   fade     : 刈り上げ 0=なし 1=低め 2=中くらい 3=高め
//   （女の子の髪型）hairLength: 長さの位置 / layer: 段 / faceFrame: 顔まわり / tie: 結べる長さ。top は使わない
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
    sideup: 'おでこを出して横に流す', grown: '前髪なし（伸ばして分ける）', none: '—'
  },
  // 長い髪型用（女の子の髪型）。長さは体の位置で示す
  hairLength: { chinUp: 'あご上', chin: 'あご', shoulderUp: '肩上', shoulder: '肩', collarbone: '鎖骨', chest: '胸' },
  layer: { none: '段なし（重め）', light: '段を少し', strong: '段をしっかり' },
  faceFrame: { none: 'そのまま', frame: '顔まわりに段' },
  tie: { keep: '結べる長さを残す', free: 'こだわらない' },
  group: { short: 'ショート', bob: 'ボブ', medium: 'ミディアム', long: 'ロング' },
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
    wax: 'ワックスでしっかりセット',
    tie: '結ぶ（ゴムでまとめる）'
  }
};

window.HM_FILTERS = [
  { key: 'group', label: '髪の長さ', options: [['short', 'ショート'], ['bob', 'ボブ'], ['medium', 'ミディアム'], ['long', 'ロング']] },
  { key: 'top', label: 'ショートの長さ', options: [['1', '短め'], ['2', 'ふつう'], ['3', '長め']] },
  { key: 'bang', label: '前髪', options: [['none', 'ほぼなし'], ['short', '短め'], ['brow', 'まゆ毛くらい'], ['long', 'まゆ下'], ['up', '上げる・立てる']] },
  { key: 'ear', label: '耳まわり', options: [['out', '耳を出す'], ['half', '半分かかる'], ['cover', 'かくれる']] },
  { key: 'nape', label: '襟足', options: [['short', '短め'], ['mid', 'ふつう'], ['long', '長め']] },
  { key: 'fade', label: '刈り上げ', options: [['0', 'なし'], ['1', '低め'], ['2', '中くらい'], ['3', '高め']] },
  { key: 'effort', label: 'セットの手間', options: [['1', 'かんたん'], ['2', 'ふつう'], ['3', 'ちょっと手間']] },
  { key: 'wax', label: 'ワックス', options: [['none', '使わない'], ['light', '少し'], ['use', '使う']] }
];

window.HM_QUICK = [
  { label: 'ショート', key: 'group', val: 'short' },
  { label: 'ボブ', key: 'group', val: 'bob' },
  { label: 'ミディアム', key: 'group', val: 'medium' },
  { label: 'ロング', key: 'group', val: 'long' },
  { label: 'ワックスなし', key: 'wax', val: 'none' },
  { label: 'セットかんたん', key: 'effort', val: '1' },
  { label: '刈り上げなし', key: 'fade', val: '0' }
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
  },
  // ───────── 女の子の髪型（2026-09-28 追加。参考は docs/references.csv の収集3回目） ─────────
  // gender:'girl' の髪型は、axes に書いた項目だけを相談メモで選ぶ。長さは hairLength（体の位置）で示す
  //   params.hairLength / layer / faceFrame / tie を使い、top は持たない。fade は常に 0（刈り上げなし）
  {
    id: 'g-roundshort', gender: 'girl', group: 'short', name: '丸みショート', catch: '後ろがまるくて、首すっきり',
    params: { hairLength: 'chinUp', bang: 'brow', bangShape: 'natural', layer: 'light', faceFrame: 'none', ear: 'cover', nape: 'short', fade: 0, tie: 'free' },
    axes: ['hairLength', 'bangShape', 'bang', 'ear', 'nape', 'set'],
    variants: [
      { field: 'hairLength', values: ['chinUp', 'chin'], basis: '参考3件は、横があご上〜あご' },
      { field: 'bangShape', values: ['natural', 'straight'], basis: '子どもの実例では、一直線にそろえた前髪も多い' },
      { field: 'ear', values: ['cover', 'half'], basis: 'さらに短くして、耳が半分出る形（ベリーショート寄り）も選べる' },
      { field: 'nape', values: ['short', 'mid'], basis: '標準は首が見える短め。首に少しかかる長さも選べる' }
    ],
    kidNotes: '前髪は目にかからないまゆ上〜まゆ。毛先をざくざくさせず、内に丸くおさめる。カラー、パーマ、刈り上げは描かない',
    set: 'none', effort: 1, wax: 'none', tags: ['さっぱり', 'かわかしやすい', '首すっきり'],
    kid: 'うしろあたまが、まあるいかたち！ くびがすっきりして、あついひもかるいよ。',
    stylist: ['横はあご上。後ろは襟足を短くして首を見せる', '後ろは下を短く上を長くして、後頭部に丸みを出す', '前髪はまゆ上〜まゆ毛くらいで自然に下ろす。耳はかくす'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-shortbob', gender: 'girl', group: 'bob', name: 'ショートボブ', catch: 'あごの長さで、内にまるく',
    params: { hairLength: 'chin', bang: 'brow', bangShape: 'natural', layer: 'light', faceFrame: 'none', ear: 'cover', nape: 'mid', fade: 0, tie: 'free' },
    axes: ['hairLength', 'bangShape', 'bang', 'layer', 'ear', 'set'],
    variants: [
      { field: 'hairLength', values: ['chin', 'chinUp'], basis: '参考3件は、あご〜あご上' },
      { field: 'bangShape', values: ['natural', 'straight', 'grown'], basis: '前髪なし（分けて流す）の実例が1件あった。一直線にそろえるとぱっつんボブに近づく' }
    ],
    variantNotes: ['前髪の厚さ：ふつう／軽め（すき間のある前髪）。軽めは大人っぽく見える'],
    kidNotes: 'すき間の多い軽すぎる前髪にしない。アイロンで巻かず、カットの形で内に丸くおさまる程度。カラー、パーマ、強い前下がりは描かない',
    set: 'none', effort: 1, wax: 'none', tags: ['定番', '学校向き'],
    kid: 'あごのながさで、けさきがうちがわにくるんとまるまるよ。',
    stylist: ['長さはあご。後ろの裾もあごの高さまで下ろす', '毛先は内に丸くおさまるように。後頭部に少し丸みを出す', '前髪はまゆ毛くらいで自然に下ろし、厚みを残す。耳はかくす'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-pattsunbob', gender: 'girl', group: 'bob', name: 'ぱっつんボブ', catch: '前髪も毛先も、一直線',
    params: { hairLength: 'chin', bang: 'brow', bangShape: 'straight', layer: 'none', faceFrame: 'none', ear: 'cover', nape: 'mid', fade: 0, tie: 'free' },
    axes: ['hairLength', 'bang', 'layer', 'ear', 'set'],
    variants: [
      { field: 'hairLength', values: ['chin', 'shoulderUp'], basis: '参考4件は、あご〜あご下' }
    ],
    variantNotes: ['毛先：内に丸くおさまる／まっすぐストン', '前髪：まゆ上の短めは、幼児の実例に多い'],
    kidNotes: '前髪はまゆ毛くらい（まゆよりかなり上にはしない）。カラー、インナーカラー、アイロンの外ハネは描かない',
    set: 'none', effort: 1, wax: 'none', tags: ['かわいい', 'まとまる'],
    kid: 'まえがみも、けさきも、まっすぐそろっているよ。つやつやで、まとまりやすい！',
    stylist: ['長さはあご。段は入れず、裾は水平な一直線', '前髪はまゆ毛くらいで一直線にそろえる', '毛量は重めに残し、毛先は少し内に入る程度。耳はかくす'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-bluntbob', gender: 'girl', group: 'bob', name: '切りっぱなしボブ', catch: '肩上で、まっすぐ切りそろえる',
    params: { hairLength: 'shoulderUp', bang: 'brow', bangShape: 'natural', layer: 'none', faceFrame: 'none', ear: 'cover', nape: 'long', fade: 0, tie: 'free' },
    axes: ['hairLength', 'bang', 'layer', 'ear', 'set'],
    variants: [
      { field: 'hairLength', values: ['shoulderUp', 'chin'], basis: '参考3件は肩上が多く、あご下の短めの例もあった' }
    ],
    variantNotes: ['毛先：まっすぐストン／肩に当たって自然に外にはねる', '前髪なし（センター分け・横分け）：子どもの実例は見つかっていない'],
    kidNotes: 'アイロンの強い外巻き、スタイリング剤の束感、カラーは描かない。外はねは肩に当たって自然にはねる程度',
    set: 'none', effort: 1, wax: 'none', tags: ['かわかしやすい', 'おしゃれ'],
    kid: 'かたの上で、まっすぐきりそろえるよ。けさきがかたにあたって、ちょっとはねるのもかわいい。',
    stylist: ['長さは肩上（肩につかないくらい）。段は入れない', '裾は水平にまっすぐ切りそろえる。外はねはアイロンなしの自然な程度', '前髪はまゆ毛くらいで自然に下ろす（ぱっつんほどきっちりさせない）'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-medium', gender: 'girl', group: 'medium', name: 'ミディアム', catch: '結べる長さで、顔まわりかるく',
    params: { hairLength: 'shoulder', bang: 'brow', bangShape: 'natural', layer: 'light', faceFrame: 'frame', ear: 'cover', nape: 'long', fade: 0, tie: 'keep' },
    axes: ['hairLength', 'bangShape', 'bang', 'layer', 'faceFrame', 'tie', 'set'],
    variants: [
      { field: 'hairLength', values: ['shoulder', 'collarbone'], basis: '参考4件は肩〜鎖骨' },
      { field: 'bangShape', values: ['natural', 'straight', 'grown'], basis: '前髪は、一直線・軽く流す・なしの例があった' },
      { field: 'faceFrame', values: ['frame', 'none'], basis: '子どもの実例は「結べる長さを残して、顔まわりにだけ段」' }
    ],
    variantNotes: ['毛先：肩に当たって外にはねる／内に丸くおさまる'],
    kidNotes: '段は低い位置と顔まわりだけ。シャギーやウルフのような強い段、巻き髪、カラー、パーマは描かない',
    set: 'none', effort: 1, wax: 'none', tags: ['結べる', '学校向き'],
    kid: 'かたくらいのながさで、むすぶこともできるよ。かおのまわりがかるくなるよ。',
    stylist: ['長さは肩〜鎖骨。ひとつに結べる長さを残す', '段は低い位置に少しだけ。顔まわりに軽く段を入れる', '前髪はまゆ毛くらいで自然に下ろす'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-pattsunlong', gender: 'girl', group: 'long', name: 'ぱっつんロング', catch: 'まっすぐ前髪と、さらさらロング',
    params: { hairLength: 'chest', bang: 'brow', bangShape: 'straight', layer: 'none', faceFrame: 'none', ear: 'cover', nape: 'long', fade: 0, tie: 'keep' },
    axes: ['hairLength', 'bang', 'layer', 'faceFrame', 'set'],
    variants: [
      { field: 'hairLength', values: ['chest', 'collarbone'], basis: '子どもの実例はロングとだけ書かれ、鎖骨下〜胸を候補にした' }
    ],
    variantNotes: ['前髪の厚み：ふつう／厚め'],
    kidNotes: '顔まわりの段、カラー、パーマ、巻き髪、すき間の多い前髪は描かない。横の髪は耳をかくしてまっすぐ下ろす',
    set: 'none', effort: 1, wax: 'none', tags: ['のばしたい子に', '結べる'],
    kid: 'まえがみはまっすぐ、うしろはむねまでのびた、さらさらのかみだよ。',
    stylist: ['長さは胸。段は入れず、毛先はまっすぐ切りそろえる', '前髪はまゆ上〜まゆ毛くらいで一直線にそろえる', '横の髪も段なしでまっすぐ下ろす'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-nobanglong', gender: 'girl', group: 'long', name: '前髪なしロング', catch: 'おでこを出して、すっきり大人っぽく',
    params: { hairLength: 'chest', bang: 'none', bangShape: 'grown', layer: 'none', faceFrame: 'none', ear: 'cover', nape: 'long', fade: 0, tie: 'keep' },
    axes: ['hairLength', 'layer', 'faceFrame', 'set'],
    variants: [
      { field: 'faceFrame', values: ['none', 'frame'], basis: '顔まわりだけ、あご下で少し軽くする形もある（段を強くすると顔まわりレイヤーロングになる）' }
    ],
    variantNotes: ['分け目：まん中／少し横寄り（7:3）', '長さ：背中の中ほどまでのばす（スーパーロング）'],
    kidNotes: '巻き髪、カラー、かきあげの強いセットは描かない。顔まわりははっきりした段を入れず、あごより下で後ろの毛となじませる',
    set: 'none', effort: 1, wax: 'none', tags: ['のばしたい子に', '結べる', '前髪なし'],
    kid: 'まえがみをのばして、まんなかでわけるよ。おでこが見えて、すっきり！',
    stylist: ['長さは胸（後ろは肩甲骨の下）', '前髪は作らず、まん中か少し横寄りで分ける。伸ばした前髪はあごより下で後ろとなじませる', '段は入れず、毛先はまっすぐ。量は少しだけ減らして扱いやすく'],
    base: { view: 0, like: 0, save: 0, card: 0 }
  },
  {
    id: 'g-layerlong', gender: 'girl', group: 'long', name: '顔まわりレイヤーロング', catch: '顔まわりに段で、かるく動く',
    params: { hairLength: 'chest', bang: 'none', bangShape: 'grown', layer: 'light', faceFrame: 'frame', ear: 'cover', nape: 'long', fade: 0, tie: 'keep' },
    axes: ['hairLength', 'bangShape', 'layer', 'faceFrame', 'set'],
    variants: [
      { field: 'hairLength', values: ['chest', 'collarbone'], basis: '子どもの実例は鎖骨〜胸の上が多い' },
      { field: 'bangShape', values: ['grown', 'side', 'straight'], basis: '前髪なしが多く、長めを横に流す例、まゆ上のぱっつんと合わせる例もあった' },
      { field: 'layer', values: ['light', 'strong'], basis: '段は顔まわりだけ／顔まわりと表面にも' }
    ],
    variantNotes: ['顔まわりのいちばん短い毛：あご／あご下'],
    kidNotes: '後ろの段は控えめにし、首まわりのくびれ（ウルフ）は作らない。巻き髪、カラー、強いシャギーは描かない',
    set: 'none', effort: 1, wax: 'none', tags: ['のばしたい子に', '結べる', 'おしゃれ'],
    kid: 'かおのまわりのかみを、だんだんにみじかくするよ。うごきが出て、かるいかんじ。',
    stylist: ['長さは胸（後ろは肩甲骨の下）', '顔まわりにあご下から段を入れ、毛先へ向かって長くつなげる', '後ろの段は控えめに。首まわりはくびれさせない'],
    base: { view: 0, like: 0, save: 0, card: 0 }
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
  softmohi: { front: 'img/styles/softmohi-front.png', side: 'img/styles/softmohi-side.png', back: 'img/styles/softmohi-back.png' },
  // 女の子の髪型（Codexで生成、2026-09-28 レビューで採用）
  'g-roundshort': { front: 'img/styles/g-roundshort-front.png', side: 'img/styles/g-roundshort-side.png', back: 'img/styles/g-roundshort-back.png' },
  'g-shortbob': { front: 'img/styles/g-shortbob-front.png', side: 'img/styles/g-shortbob-side.png', back: 'img/styles/g-shortbob-back.png' },
  'g-pattsunbob': { front: 'img/styles/g-pattsunbob-front.png', side: 'img/styles/g-pattsunbob-side.png', back: 'img/styles/g-pattsunbob-back.png' },
  'g-bluntbob': { front: 'img/styles/g-bluntbob-front.png', side: 'img/styles/g-bluntbob-side.png', back: 'img/styles/g-bluntbob-back.png' },
  'g-medium': { front: 'img/styles/g-medium-front.png', side: 'img/styles/g-medium-side.png', back: 'img/styles/g-medium-back.png' },
  'g-pattsunlong': { front: 'img/styles/g-pattsunlong-front.png', side: 'img/styles/g-pattsunlong-side.png', back: 'img/styles/g-pattsunlong-back.png' },
  'g-nobanglong': { front: 'img/styles/g-nobanglong-front.png', side: 'img/styles/g-nobanglong-side.png', back: 'img/styles/g-nobanglong-back.png' },
  'g-layerlong': { front: 'img/styles/g-layerlong-front.png', side: 'img/styles/g-layerlong-side.png', back: 'img/styles/g-layerlong-back.png' }
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
  },
  ear: {
    front: { out: 'img/compare/ears-front-out.png', half: 'img/compare/ears-front-half.png', cover: 'img/compare/ears-front-cover.png' },
    side: { out: 'img/compare/ears-side-out.png', half: 'img/compare/ears-side-half.png', cover: 'img/compare/ears-side-cover.png' }
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
    options: [['none', '何もしない', 'くしでとかすだけ'], ['dryer', 'ドライヤー', 'かわかすだけ'], ['waxlight', 'ワックス少し', '毛先を整える'], ['wax', 'ワックスしっかり', '毎朝セットする'], ['tie', '結ぶ', 'ゴムでまとめる', 'long']] },
  // ここから下は、髪型の axes に書いたときだけ使う（長い髪型用）
  { key: 'hairLength', label: '全体の長さ', en: 'LENGTH', q: 'どこまでの長さにする？', hint: '体の位置でえらんでね。', explicit: true,
    options: [['chinUp', 'あご上', ''], ['chin', 'あご', ''], ['shoulderUp', '肩上', '肩につかない'], ['shoulder', '肩', '肩につく'], ['collarbone', '鎖骨', ''], ['chest', '胸', '']] },
  { key: 'layer', label: '段（レイヤー）', en: 'LAYER', q: '段は入れる？', hint: '段を入れると軽く、動きが出る。', explicit: true,
    options: [['none', '入れない', '重めで、毛先が一直線'], ['light', '少し', '毛先を軽く'], ['strong', 'しっかり', '動きが出る']] },
  { key: 'faceFrame', label: '顔まわり', en: 'FACE', q: '顔まわりはどうする？', hint: '顔のまわりに短い毛を作ると、軽く見える。', explicit: true,
    options: [['none', 'そのまま', ''], ['frame', '顔まわりに段', '顔のまわりを軽く']] },
  { key: 'tie', label: '結べる長さ', en: 'TIE', q: '結べる長さを残す？', hint: 'ポニーテールや、体育のときに結べるか。', explicit: true,
    options: [['keep', '残す', '結べる長さ'], ['free', 'こだわらない', '']] }
];

// 編集部のおすすめ（ホームに並べる順）。人気の数字は表示しない（docs/spec.md 8章の決定8）
window.HM_PICKS = ['natural', 'twoblock', 'mash', 'sports', 'centerpart', 'upbang'];

// 髪型の英語名（見出しの添え）
(function () {
  const EN = {
    sports: 'SPORTS CUT', buzz: 'BUZZ CUT', twoblock: 'TWO BLOCK', natural: 'NATURAL SHORT', mash: 'MUSHROOM',
    upbang: 'UP BANG', softmohi: 'SOFT MOHAWK', centerpart: 'CENTER PART', longmash: 'LONG MUSHROOM', sidepart: 'SIDE PART',
    'g-roundshort': 'ROUND SHORT', 'g-shortbob': 'SHORT BOB', 'g-pattsunbob': 'BLUNT BANG BOB', 'g-bluntbob': 'BLUNT CUT BOB',
    'g-medium': 'MEDIUM', 'g-pattsunlong': 'BLUNT BANG LONG', 'g-nobanglong': 'NO BANG LONG', 'g-layerlong': 'FACE LAYER LONG'
  };
  window.HM_STYLES.forEach((s, i) => { s.en = EN[s.id] || ''; s.no = String(i + 1).padStart(2, '0'); });
})();
