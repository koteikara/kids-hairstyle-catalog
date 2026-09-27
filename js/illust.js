// ヘアみっけ：髪型パラメータから正面・横・後ろの見本イラスト（SVG）を描く
// 画風は docs/illustration-guide.md に合わせる：線画主体、髪の外形を主線で明確に、
// 毛束は形を説明する分だけ、ツヤ・派手な色なし、顔と服は控えめ。
(function () {
  let uid = 0;
  const HAIR = '#4a3d35';      // 髪（暗めの茶色。主線が読めるよう真っ黒にはしない）
  const INK = '#1e1814';       // 主線
  const STRAND = '#261e19';    // 毛束の線
  const SKIN = '#f8e7d8';
  const SKIN_LINE = '#8f7767';
  const FACE = '#3a302a';
  const SHIRT = '#e6e7e9';
  const SHIRT_LINE = '#a2a6ab';
  const STUBBLE = '#d8cdc4';   // 刈り上げ部分（短い毛＋地肌）

  const VOL = [3, 6, 11, 16];                                  // top(0..3) → 髪のふくらみ
  const BANG_Y = { none: 62, short: 76, brow: 95, long: 106 }; // 前髪の下端
  const SIDE_B = { out: 100, half: 117, cover: 136 };          // 耳まわりの下端
  const NAPE_B = { short: 150, mid: 162, long: 178 };          // 襟足の下端
  const FADE_FRONT = [0, 108, 98, 88];
  const FADE_SIDE = [0, 146, 128, 110];
  const FADE_BACK = [0, 146, 128, 110];
  const LW = 2.4;                                              // 主線の太さ

  function bangBottom(p) {
    if (p.bangShape === 'up') return 68;
    if (p.bangShape === 'sideup') return 74;
    if (p.bangShape === 'spiky') return 72;
    if (p.bangShape === 'none') return 62;
    return BANG_Y[p.bang] || 80;
  }

  function defs(id, fadeTop) {
    return `<defs>
      <pattern id="dt${id}" width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="3" height="3" fill="${STUBBLE}"/><circle cx="1.5" cy="1.5" r=".75" fill="${HAIR}" opacity=".6"/>
      </pattern>
      <linearGradient id="gb${id}" x1="0" x2="0" y1="${fadeTop}" y2="${fadeTop + 10}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${HAIR}"/><stop offset="1" stop-color="${HAIR}" stop-opacity="0"/>
      </linearGradient>
    </defs>`;
  }

  // 刈り上げ部分。高め（ツーブロック）は境界をはっきり、低め・中くらいは段階的になじませる
  function fadeRect(id, p, x, y, w, h) {
    const crisp = p.fade === 3;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#dt${id})"/>` +
      (crisp
        ? `<path d="M${x} ${y} h${w}" stroke="${INK}" stroke-width="1.3"/>`
        : `<rect x="${x}" y="${y}" width="${w}" height="12" fill="url(#gb${id})"/>`);
  }

  // 毛束の線：始点から終点へ、頭の中心から外へふくらむ曲線
  function strands(list, cx, cy) {
    return list.map(([x0, y0, x1, y1, bulge]) => {
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const dx = mx - cx, dy = my - cy, len = Math.hypot(dx, dy) || 1;
      const k = bulge == null ? 8 : bulge;
      return `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${(mx + dx / len * k).toFixed(1)} ${(my + dy / len * k).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }).map(d => `<path d="${d}" fill="none" stroke="${STRAND}" stroke-width="1.1" stroke-linecap="round" opacity=".85"/>`).join('');
  }

  // 形 S と切り抜き P の重なりを塗り、その外形だけに主線を引く
  function hairMass(id, shapeMk, polyMk, inner) {
    return `<clipPath id="cp${id}">${polyMk}</clipPath><clipPath id="cs${id}">${shapeMk}</clipPath>
      <g clip-path="url(#cp${id})"><g clip-path="url(#cs${id})"><rect width="200" height="220" fill="${HAIR}"/>${inner}</g></g>
      <g clip-path="url(#cp${id})" fill="none" stroke="${INK}" stroke-width="${LW}">${shapeMk}</g>
      <g clip-path="url(#cs${id})" fill="none" stroke="${INK}" stroke-width="${LW}">${polyMk}</g>`;
  }

  function shirt() {
    return `<path d="M36 222 Q40 186 84 180 L116 180 Q160 186 164 222Z" fill="${SHIRT}" stroke="${SHIRT_LINE}" stroke-width="1.2"/>
            <path d="M85 180 Q100 190 115 180" fill="none" stroke="${SHIRT_LINE}" stroke-width="1.2"/>`;
  }
  function neck(x, w) {
    return `<rect x="${x}" y="140" width="${w}" height="46" fill="${SKIN}"/>
            <path d="M${x} 140 V183 M${x + w} 140 V183" stroke="${SKIN_LINE}" stroke-width="1.2"/>`;
  }
  function ear(cx, cy, right) {
    const d = right ? -1 : 1;
    return `<ellipse cx="${cx}" cy="${cy}" rx="8" ry="13" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.3"/>
            <path d="M${cx + 3 * d} ${cy - 6} Q${cx - 2 * d} ${cy} ${cx + 3 * d} ${cy + 6}" fill="none" stroke="${SKIN_LINE}" stroke-width="1.1"/>`;
  }

  // ───────── 正面 ─────────
  function front(p, id) {
    const v = VOL[p.top];
    const hx = 100, hy = 104, rx = 50 + v, ry = 58 + v, topY = hy - ry;
    let sideB = SIDE_B[p.ear] + (p.nape === 'long' && p.ear === 'cover' ? 10 : 0);
    if (p.fade && p.ear === 'out') sideB = Math.max(sideB, 114);
    const b = bangBottom(p);
    const fadeTop = FADE_FRONT[p.fade] || 0;
    const shapeMk = `<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${ry}"/>`;

    let s = defs(id, fadeTop) + shirt() + neck(86, 28);

    // 髪のかたまり（顔の後ろ側）
    const sideStrands = strands([
      [hx - rx * 0.55, topY + 26, hx - rx + 5, sideB - 4],
      [hx + rx * 0.55, topY + 26, hx + rx - 5, sideB - 4]
    ], hx, hy);
    s += hairMass(id, shapeMk, `<rect x="-10" y="-10" width="220" height="${sideB + 10}"/>`,
      sideStrands + (p.fade ? fadeRect(id, p, 0, fadeTop, 58, 60) + fadeRect(id, p, 142, fadeTop, 58, 60) : ''));

    s += ear(50, 121) + ear(150, 121, true);
    s += `<ellipse cx="100" cy="112" rx="50" ry="58" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.4"/>`;
    s += faceFront();

    // 耳にかかる髪
    if (p.ear !== 'out') {
      const lx = hx - rx, rx2 = hx + rx;
      const lock = d => `<path d="${d}" fill="${HAIR}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
      s += lock(`M${lx + 1} ${hy - 14} Q${lx - 2} ${sideB - 4} ${lx + 7} ${sideB} L61 ${sideB - 3} Q57 ${hy + 4} 62 ${hy - 22}`);
      s += lock(`M${rx2 - 1} ${hy - 14} Q${rx2 + 2} ${sideB - 4} ${rx2 - 7} ${sideB} L139 ${sideB - 3} Q143 ${hy + 4} 138 ${hy - 22}`);
      s += strands([[lx + 8, hy - 6, lx + 9, sideB - 5, 2], [rx2 - 8, hy - 6, rx2 - 9, sideB - 5, 2]], hx, hy);
    }

    // 前髪
    const templeY = Math.max(b + 4, 98);
    const pts = [];
    let i = 0;
    for (let x = 146; x >= 54; x -= 6, i++) {
      const t = i % 2 ? 4 : 0;
      let y = b;
      switch (p.bangShape) {
        case 'straight': y = b + t * 0.6; break;
        case 'side': y = b - 10 + ((x - 54) / 92) * 16 + t * 0.4; break;
        case 'center': y = b + 2 - 24 * Math.max(0, 1 - Math.abs(x - 100) / 34) + t * 0.3; break;
        case 'up': y = b + 1.5 * Math.sin(x / 5); break;
        case 'sideup': y = b - 6 + ((x - 54) / 92) * 12; break;
        case 'spiky': y = b + t * 0.7; break;
        case 'none': y = b; break;
        default: y = b + 3 * Math.sin(x / 7) + t * 0.5;
      }
      pts.push([x, y]);
    }
    const edge = [[146, templeY]].concat(pts, [[54, templeY]]);
    const edgeStr = edge.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ');
    const bangStrands = [];
    for (let k = 0; k < 7; k++) {
      const [ex, ey] = pts[Math.round(1 + k * (pts.length - 3) / 6)];
      let sx = 100 + (k - 3) * 7;
      if (p.bangShape === 'side' || p.bangShape === 'sideup') sx = 70 + k * 4;
      if (p.bangShape === 'center') sx = 100 + (k < 3.5 ? -2 : 2);
      bangStrands.push([sx, topY + 12, ex, ey - 5, p.bangShape === 'up' ? -6 : 6]);
    }
    s += `<clipPath id="cb${id}"><polygon points="54,0 146,0 ${edgeStr}"/></clipPath>
      <g clip-path="url(#cb${id})"><g clip-path="url(#cs${id})"><rect width="200" height="220" fill="${HAIR}"/>${strands(bangStrands, hx, hy)}</g></g>
      <g clip-path="url(#cb${id})" fill="none" stroke="${INK}" stroke-width="${LW}">${shapeMk}</g>
      <g clip-path="url(#cs${id})"><polyline points="${edgeStr}" fill="none" stroke="${INK}" stroke-width="${LW - 0.4}" stroke-linejoin="round"/></g>`;
    if (p.bangShape === 'center') {
      s += `<path d="M100 ${topY + 6} L100 ${b - 20}" stroke="${INK}" stroke-width="1.4"/>`;
    }

    // 立ち上げ・中央を立たせる（塗りは閉じた形、主線は上側の輪郭だけ）
    if (p.bangShape === 'up') {
      const top = `M58 ${topY + 24} C58 ${topY + 4} 84 ${topY - 8} 106 ${topY - 7} C126 ${topY - 6} 144 ${topY + 6} 142 ${topY + 24}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW}"/>`;
      s += strands([[84, topY + 20, 98, topY - 2, -4], [100, topY + 20, 112, topY - 3, -4], [116, topY + 20, 126, topY + 2, -4]], hx, hy);
    }
    if (p.bangShape === 'sideup') {
      // 分け目（向かって左）から右へ、ゆるく持ち上げて流す
      const top = `M66 ${topY + 20} C70 ${topY + 2} 96 ${topY - 6} 120 ${topY - 2} C136 ${topY + 2} 146 ${topY + 12} 146 ${topY + 26}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW}"/>`;
      s += `<path d="M78 ${topY + 8} L80 ${b - 4}" stroke="${INK}" stroke-width="1.3"/>`;
      s += strands([[82, topY + 6, 132, topY + 12, -5], [84, topY + 16, 138, topY + 24, -5], [86, topY + 26, 142, b - 2, -4]], hx, hy);
    }
    if (p.bangShape === 'spiky') {
      const top = `M74 ${topY + 12} L82 ${topY - 1} L90 ${topY + 6} L98 ${topY - 5} L106 ${topY + 5} L114 ${topY - 3} L121 ${topY + 6} L127 ${topY + 12}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW - 0.4}" stroke-linejoin="round"/>`;
    }
    return s;
  }

  function faceFront() {
    return `<path d="M78 112 Q84 109 90 111" fill="none" stroke="${FACE}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M110 111 Q116 109 122 112" fill="none" stroke="${FACE}" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="84" cy="124" rx="2.5" ry="3.1" fill="${FACE}"/>
      <ellipse cx="116" cy="124" rx="2.5" ry="3.1" fill="${FACE}"/>
      <path d="M100 133 Q102 137 99 138" fill="none" stroke="${SKIN_LINE}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M94 150 Q100 152.5 106 150" fill="none" stroke="${FACE}" stroke-width="1.5" stroke-linecap="round"/>`;
  }

  // ───────── 横（右向き） ─────────
  function side(p, id) {
    const v = VOL[p.top];
    const hx = 94, hy = 104, rx = 56 + v, ry = 58 + v, topY = hy - ry;
    const b = bangBottom(p);
    const sideB = SIDE_B[p.ear];
    const earB = p.fade && p.ear === 'out' ? 124 : sideB;
    const napeB = NAPE_B[p.nape];
    const templeY = b >= 96 ? b + 4 : 98;
    const fadeTop = FADE_SIDE[p.fade] || 0;
    const earOver = p.ear === 'out';

    let s = defs(id, fadeTop) + shirt() + neck(76, 36);
    s += `<ellipse cx="98" cy="110" rx="54" ry="58" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.4"/>`;
    s += `<path d="M150 116 Q161 128 151 132" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.3"/>`;
    const earSvg = `<ellipse cx="94" cy="120" rx="9" ry="13" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.3"/>
      <path d="M90 113 Q98 120 91 127" fill="none" stroke="${SKIN_LINE}" stroke-width="1.1"/>`;
    if (!earOver) s += earSvg;

    // 髪の形：頭の上側の弧から後頭部、襟足へ一続きの輪郭にする
    const shapeMk = p.nape === 'short'
      ? `<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${ry}"/>`
      : `<path d="M${hx + rx} ${hy} A${rx} ${ry} 0 0 0 ${hx - rx} ${hy} C${hx - rx} ${hy + 34} 44 ${napeB} 64 ${napeB} L100 ${napeB} L100 ${hy + 20} Z"/>`;
    const polyMk = `<path d="M-10 -10 H210 V${b} H156 Q146 ${b} 143 ${templeY - 2} Q132 ${templeY + 3} 124 ${templeY}
      Q115 ${templeY + 1} 115 ${templeY + 10} L114 ${earB} Q96 ${earB + 5} 78 ${earB} Q68 ${napeB - 12} 62 ${napeB} H-10 Z"/>`;
    const st = strands([
      [hx - 12, topY + 12, 152, b - 4, 10],
      [hx - 6, topY + 14, 140, templeY - 3, 8],
      [hx - 16, topY + 16, 118, templeY + 2, 6],
      [hx - 20, topY + 12, hx - rx + 8, hy + 6, 10],
      [hx - 24, topY + 18, 70, napeB - 10, 8],
      [hx - 20, topY + 24, 100, Math.min(earB, 118) - 6, 6]
    ], hx, hy);
    s += hairMass(id, shapeMk, polyMk, st + (p.fade ? fadeRect(id, p, -10, fadeTop, 132, 100) : ''));
    if (earOver) s += earSvg;

    // 顔のパーツ（控えめ）
    s += `<path d="M131 110 Q136 108 141 110" fill="none" stroke="${FACE}" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="137" cy="122" rx="2.2" ry="3" fill="${FACE}"/>
      <path d="M140 148 Q144 149 147 147" fill="none" stroke="${FACE}" stroke-width="1.4" stroke-linecap="round"/>`;

    if (p.bangShape === 'up' || p.bangShape === 'sideup') {
      const top = `M84 ${topY + 8} C104 ${topY - 4} 138 ${topY - 8} 157 ${topY + 5} C163 ${topY + 12} 158 ${b - 4} 150 ${b}`;
      s += `<path d="${top} L128 ${topY + 30} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW}"/>`;
      s += strands([[110, topY + 18, 150, topY + 8, -4], [106, topY + 26, 152, b - 6, -4]], hx, hy);
    }
    if (p.bangShape === 'spiky') {
      const top = `M70 ${topY + 14} L76 ${topY + 2} L86 ${topY + 8} L94 ${topY - 3} L104 ${topY + 6} L113 ${topY - 4} L122 ${topY + 6} L131 ${topY + 2} L136 ${topY + 14}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW - 0.4}" stroke-linejoin="round"/>`;
    }
    return s;
  }

  // ───────── 後ろ ─────────
  function back(p, id) {
    const v = VOL[p.top];
    const hx = 100, hy = 104, rx = 54 + v, ry = 58 + v, topY = hy - ry;
    const sideB = p.fade && p.ear === 'out' ? 124 : SIDE_B[p.ear];
    const napeB = NAPE_B[p.nape];
    const fadeTop = FADE_BACK[p.fade] || 0;
    const earOver = p.ear === 'out';

    let s = defs(id, fadeTop) + shirt() + neck(80, 40);
    s += `<ellipse cx="100" cy="108" rx="52" ry="58" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.4"/>`;
    const ears = ear(47, 120, true) + ear(153, 120);
    if (!earOver) s += ears;

    const shapeMk = p.nape === 'short'
      ? `<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${ry}"/>`
      : `<path d="M${hx - rx} ${hy} A${rx} ${ry} 0 0 1 ${hx + rx} ${hy} C${hx + rx} ${hy + 40} ${hx + 38} ${napeB - 8} ${hx + 34} ${napeB} L${hx - 34} ${napeB} C${hx - 38} ${napeB - 8} ${hx - rx} ${hy + 40} ${hx - rx} ${hy} Z"/>`;
    const polyMk = `<polygon points="-10,-10 210,-10 210,${sideB} 152,${sideB} 142,${napeB} 58,${napeB} 48,${sideB} -10,${sideB}"/>`;
    const c = topY + 26;
    const st = strands([
      [98, c + 4, hx - rx + 6, sideB - 6, 10],
      [98, c + 6, 66, napeB - 10, 8],
      [100, c + 8, 86, napeB - 6, 4],
      [104, c + 8, 114, napeB - 6, 4],
      [106, c + 6, 134, napeB - 10, 8],
      [106, c + 4, hx + rx - 6, sideB - 6, 10],
      [102, c - 2, 70, topY + 16, 6],
      [106, c - 2, 132, topY + 16, 6]
    ], hx, c);
    s += hairMass(id, shapeMk, polyMk, st + (p.fade ? fadeRect(id, p, -10, fadeTop, 220, 100) : ''));
    if (earOver) s += ears;

    // つむじ
    s += `<path d="M104 ${c} m-5 0 a5 5 0 1 1 5 5 a3 3 0 1 1 -2.6 -3.4" fill="none" stroke="${STRAND}" stroke-width="1.2"/>`;
    if (p.bangShape === 'spiky') {
      const top = `M80 ${topY + 12} L86 ${topY + 1} L94 ${topY + 7} L100 ${topY - 3} L106 ${topY + 7} L114 ${topY + 1} L120 ${topY + 12}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW - 0.4}" stroke-linejoin="round"/>`;
    }
    if (p.bangShape === 'up') {
      const top = `M76 ${topY + 12} C82 ${topY - 6} 118 ${topY - 6} 124 ${topY + 12}`;
      s += `<path d="${top} Z" fill="${HAIR}"/><path d="${top}" fill="none" stroke="${INK}" stroke-width="${LW}"/>`;
    }
    return s;
  }

  const VIEWS = { front, side, back };

  function render(params, view, opts) {
    opts = opts || {};
    const id = 'h' + (++uid);
    const body = VIEWS[view || 'front'](params, id);
    const label = opts.label ? `role="img" aria-label="${opts.label}"` : 'aria-hidden="true"';
    return `<svg class="hair-svg ${opts.cls || ''}" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" ${label}>${body}</svg>`;
  }

  // 見本パラメータに、カードで選んだ調整を反映する
  const BANG_ORDER = ['none', 'short', 'brow', 'long'];
  function applyAdjust(base, adj) {
    const p = Object.assign({}, base);
    if (!adj) return p;
    if (adj.len) p.top = Math.min(3, Math.max(base.top === 0 ? 0 : 1, base.top + adj.len));
    if (adj.bang && base.bang !== 'none') {
      const i = BANG_ORDER.indexOf(base.bang) + adj.bang;
      p.bang = BANG_ORDER[Math.min(3, Math.max(1, i))];
    }
    if (adj.bangShape) p.bangShape = adj.bangShape;
    if (adj.ear) p.ear = adj.ear;
    if (adj.nape) p.nape = adj.nape;
    if (adj.fade !== null && adj.fade !== undefined) p.fade = adj.fade;
    return p;
  }
  function isAdjusted(adj) {
    return !!adj && !!(adj.len || adj.bang || adj.bangShape || adj.ear || adj.nape || (adj.fade !== null && adj.fade !== undefined));
  }

  window.HM_ILLUST = { render, applyAdjust, isAdjusted };
})();
