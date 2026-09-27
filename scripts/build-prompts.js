// js/data.js の髪型データから、画像生成用の指示文（docs/illustration-prompts.md）を作る
//   node scripts/build-prompts.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), ctx);
const { HM_STYLES: styles, HM_LABELS: L } = ctx.window;

const TOP = { 0: 'とても短く、全体がほぼ同じ短さ', 1: '短め（トップ3〜4cm程度）で丸みがある', 2: 'ふつう（トップ5〜6cm程度）で自然なボリューム', 3: '長め（トップ7cm以上）でふんわり丸い' };
const EAR = { out: '出す（耳全体が見える）', half: '一部見せる（耳の上半分に髪がかかる）', cover: '隠す（耳がほぼ隠れる）' };
const NAPE = { short: 'すっきりさせる（首すじが見える）', mid: '自然に残す', long: '長めに残す（首すじに少しかかる）' };
const FADE = [
  'なし。短い部分を描かない',
  'あり。襟足の生えぎわのまわりだけ低めに刈り上げ、上の髪と段階的になじませる。耳のまわりと耳の上には刈り上げを入れない（横から見て、耳の上は短い普通の髪）',
  'あり。耳の下半分より下だけを刈り上げ、上の髪と段階的になじませる。耳の上やこめかみには刈り上げを入れない（横から見て、刈り上げの上端は耳の真ん中あたり）。ツーブロックのように上の髪を刈り上げにかぶせない',
  'あり。耳の上くらいの高さまで刈り上げ、境界ははっきりさせる。上の髪が刈り上げ部分に少しかぶる'
];

function bang(p) {
  if (p.bangShape === 'none') return 'ほぼなし（生えぎわが見える短さ）';
  if (p.bangShape === 'up') return '短めで、根元から上げておでこを出す。立ち上がりは自然な高さにとどめる';
  if (p.bangShape === 'spiky') return '短め。トップ中央を少し立たせる。極端に尖らせない';
  return `${L.bang[p.bang]}、${L.bangShape[p.bangShape]}`;
}

const COMMON = [
  '10歳くらいの日本の男の子の髪型見本を作成する。目的は美容室で髪型を選び、美容師に希望を伝えること。線画を主体とした、落ち着いたマンガ風のイラスト。写真風ではなく、髪型の輪郭、毛束、前髪、トップ、耳まわり、後頭部、襟足が読み取れる描写にする。髪型を主役にし、顔は控えめにする（目は小さめで、瞳の光は控えめ）。',
  '同じ子ども、同じ髪型を、正面・真横（左向き）・後ろの3方向から描き、左から正面・横・後ろの順に横一列に並べた1枚の横長の画像にする。3つの絵は同じ縮尺・同じ高さにそろえ、絵と絵のあいだは十分にあける（重ねない）。各方向で頭の大きさ、髪の長さ、毛流れ、分け目、刈り上げの範囲、襟足の形を一致させる。'
];
const TAIL = '描く範囲は頭から首まで（肩の線まで）。服は描かない。髪色は黒または暗い茶色で、黒の線と控えめなハッチングで表す。背景は白の無地。背景の模様、小物、文字、ラベル、ロゴは入れない。頭頂部のはねた毛（アホ毛）や飾りの毛は入れない。現実の小学生が美容室で注文できる髪型として描き、極端なデフォルメや非現実的な髪の形は避ける。カラー、パーマ、剃り込み、ラインは加えない。';

let md = `# 髪型ごとの画像生成用の指示文

\`node scripts/build-prompts.js\` で \`js/data.js\` から自動作成したファイル。直接編集せず、髪型データを直してから作り直す。
参考写真を確認して特徴が違っていた場合は、\`js/data.js\` の髪型データを直す（参考写真は生成ツールへ入力しない。[illustration-guide.md](illustration-guide.md) の2章）。

## 共通部分

${COMMON.join('\n\n')}

${TAIL}
`;

for (const s of styles) {
  const p = s.params;
  const features = `${s.catch}。` + s.stylist.join('。') + '。';
  md += `
## ${s.name}（\`${s.id}\`）

\`\`\`text
${COMMON.join('\n')}
髪型の特徴：${features}全体の長さ・トップ：${TOP[p.top]}。
刈り上げ：${s.fadeNote ? `あり。${s.fadeNote}` : FADE[p.fade]}。
前髪：${bang(p)}。
耳まわり：${EAR[p.ear]}。
襟足：${NAPE[p.nape]}。
${s.kidNotes ? `子ども向けの注意：${s.kidNotes}。\n` : ''}${TAIL}
\`\`\`
`;
}

fs.writeFileSync(path.join(root, 'docs/illustration-prompts.md'), md);
console.log(`docs/illustration-prompts.md に ${styles.length} 件を書き出しました`);
