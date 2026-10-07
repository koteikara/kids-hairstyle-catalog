// ヘアみっけ：画面とデータ操作（データはこの端末の localStorage に保存）
// 相談メモ（希望 → 美容師さんの提案 → 合意）の仕様は docs/spec.md 4-3
(function () {
  const S = window.HM_STYLES;
  const L = window.HM_LABELS;
  const IL = window.HM_ILLUST;
  const AXES = window.HM_AXES;
  const KEY = 'hairmikke:v1';
  const UNSURE = 'unsure';
  const VIEW_NAME = { front: '正面', side: '横', back: '後ろ' };
  const STATUS = { draft: '作成中', shown: '相談中', agreed: '合意済み' };
  const app = document.getElementById('app');
  const sheet = document.getElementById('sheet');

  // ───────── 保存データ ─────────
  // cards は旧形式（注文票）。消さずに残し、読み込み時に memos（相談メモ）へ変換する
  const empty = () => ({ events: {}, liked: [], saved: [], cards: [], memos: null, flow: null });
  let store = load();
  function load() {
    let s;
    try { s = Object.assign(empty(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { s = empty(); }
    if (!Array.isArray(s.memos)) s.memos = (s.cards || []).map(fromOldCard);
    return s;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* 保存できなくても動かす */ } }
  // 行動の記録：髪型ごと・行動ごとに別々に数える（view / like / save / card / compare / show / agree）
  function track(id, type, delta) {
    const e = store.events[id] || (store.events[id] = {});
    e[type] = Math.max(0, (e[type] || 0) + (delta || 1));
    persist();
  }

  const byId = id => S.find(s => s.id === ((window.HM_ALIASES || {})[id] || id));
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  // ───────── 調整軸 ─────────
  const setOf = s => s.wax === 'use' ? 'wax' : s.wax === 'light' ? 'waxlight' : s.effort >= 2 ? 'dryer' : 'none';
  const variantOf = (s, field) => (s.variants || []).find(v => v.field === field);
  const isCandidate = (s, field, val) => { const v = variantOf(s, field); return !!v && v.values.some(x => String(x) === String(val)); };

  // その髪型で選ぶ軸と、軸ごとの選択肢
  // その髪型で使う軸。髪型に axes があればその順で使う（長い髪型用）。なければ短い髪型の標準の軸
  const isGirl = s => s.gender === 'girl';
  function axesFor(s) {
    const list = s.axes
      ? s.axes.map(k => AXES.find(a => a.key === k)).filter(Boolean)
      : AXES.filter(a => {
        if (a.explicit) return false;
        if (a.onlyVariants) return !!variantOf(s, a.key);
        if (a.key === 'bang') return !['none', 'up', 'spiky'].includes(s.params.bangShape);
        return true;
      });
    return list.map(a => {
      if (a.key === 'bangShape') {
        const v = variantOf(s, 'bangShape');
        const vals = v ? v.values : [s.params.bangShape];
        return Object.assign({}, a, { options: vals.map(x => [x, L.bangShape[x], '']) });
      }
      if (a.key === 'set' && !s.axes) return Object.assign({}, a, { options: a.options.filter(o => o[3] !== 'long') });
      if (a.key === 'set' && isGirl(s)) return Object.assign({}, a, { options: a.options.filter(o => !['waxlight', 'wax'].includes(o[0])) });
      // 長さの位置は、その髪型の候補だけ（候補がなければ見本と、ひとつ短い位置）
      if (a.key === 'hairLength') {
        const v = variantOf(s, 'hairLength');
        const i = a.options.findIndex(o => o[0] === s.params.hairLength);
        const vals = v ? v.values : a.options.slice(Math.max(0, i - 1), i + 1).map(o => o[0]);
        return Object.assign({}, a, { options: a.options.filter(o => vals.includes(o[0])) });
      }
      return a;
    });
  }
  const axisDef = (s, key) => axesFor(s).find(a => a.key === key) || AXES.find(a => a.key === key);
  function standardOf(s, key) {
    if (key === 'len' || key === 'bang') return 0;
    if (key === 'set') return s.set || setOf(s);
    return s.params[key];
  }
  function valueLabel(s, key, v) {
    if (v === UNSURE) return '相談したい';
    const opt = axisDef(s, key).options.find(o => String(o[0]) === String(v));
    return opt ? opt[1] : '—';
  }
  // 希望と合意を重ねた「いまの内容」（合意した項目は合意を優先）
  function effective(m) { return Object.assign({}, m.wish.axes, m.agreed.axes); }
  // イラスト用：わからない・セットを除いて、見本の形に重ねる
  function paramsFor(s, axes) {
    const adj = {};
    ['len', 'bang', 'bangShape', 'ear', 'nape', 'fade'].forEach(k => {
      if (axes[k] !== undefined && axes[k] !== UNSURE && axes[k] !== null) adj[k] = axes[k];
    });
    return IL.applyAdjust(s.params, adj);
  }
  function fadeText(s, f) { return (s.fadeNote && f === s.params.fade) ? s.fadeNote : L.fadeDesc[f]; }

  // ───────── 相談メモ ─────────
  function newMemo(s, base) {
    const axes = {};
    axesFor(s).forEach(a => { axes[a.key] = standardOf(s, a.key); });
    if (base) Object.assign(axes, effective(base));
    return {
      schemaVersion: 2, id: newId(), styleId: s.id, createdAt: Date.now(), updatedAt: Date.now(), status: 'draft',
      child: { nickname: base ? base.child.nickname : '' },
      wish: { axes, consultLength: true, note: '' },
      proposals: [], agreed: { axes: {} }, basedOn: base ? base.id : null
    };
  }
  // 旧形式のカード（adj / set / consult / nick / memo）を相談メモに変換する
  function fromOldCard(c) {
    const axes = {};
    Object.entries(c.adj || {}).forEach(([k, v]) => { if (v !== null && v !== undefined) axes[k] = v; });
    if (c.set) axes.set = c.set;
    return {
      schemaVersion: 2, id: c.id || newId(), styleId: c.styleId, createdAt: c.createdAt || Date.now(), updatedAt: c.createdAt || Date.now(),
      status: 'draft', child: { nickname: c.nick || '' },
      wish: { axes, consultLength: c.consult !== false, note: c.memo || '' },
      proposals: [], agreed: { axes: {} }, basedOn: null
    };
  }
  const memoById = id => store.memos.find(m => m.id === id);
  function saveMemo(m) {
    m.updatedAt = Date.now();
    const i = store.memos.findIndex(x => x.id === m.id);
    if (i < 0) store.memos.push(m); else store.memos[i] = m;
    persist();
  }

  // ───────── 共有リンク（内容をURLに入れる。呼び名以外の個人情報は入れない） ─────────
  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function dec(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  }
  function sharePayload(m) {
    return { v: 2, s: m.styleId, n: m.child.nickname, w: m.wish, p: m.proposals, a: m.agreed, st: m.status, c: m.createdAt };
  }
  function fromPayload(o) {
    if (o.v === 2) {
      return { schemaVersion: 2, id: 'shared', styleId: o.s, createdAt: o.c, status: o.st || 'draft', child: { nickname: o.n || '' },
        wish: o.w || { axes: {} }, proposals: o.p || [], agreed: o.a || { axes: {} } };
    }
    return fromOldCard(o); // 旧形式の共有リンク
  }

  // ───────── 画面の状態 ─────────
  const ui = { filters: {}, q: '', sort: 'recommend', view: 'front', compareAxis: 'fade', compareView: 'side', draft: null, step: 0, consult: null };

  function filterValue(s, key) {
    const p = s.params;
    switch (key) {
      case 'top': return String(Math.max(1, p.top));
      case 'bang': return ['up', 'spiky', 'sideup'].includes(p.bangShape) ? 'up' : p.bang;
      case 'fade': return String(p.fade);
      case 'group': return s.group || 'short';
      case 'effort': return String(s.effort);
      case 'wax': return s.wax;
      default: return p[key];
    }
  }
  function filterValues(s, key) {
    const vals = new Set([filterValue(s, key)]);
    for (const v of s.variants || []) {
      for (const val of v.values) {
        if (v.field === key) vals.add(String(val));
        if (key === 'bang' && v.field === 'bangShape') vals.add(['up', 'spiky', 'sideup'].includes(val) ? 'up' : s.params.bang);
      }
    }
    return vals;
  }
  const activeFilters = () => Object.entries(ui.filters).flatMap(([k, set]) => [...set].map(v => [k, v]));
  function matched() {
    const q = ui.q.trim();
    let list = S.filter(s => Object.entries(ui.filters).every(([k, set]) => {
      if (!set.size) return true;
      if (k === 'hairType') return [...set].every(t => hairRating(s, t) !== 'care');   // 髪質はすべてに合うもの
      const vals = filterValues(s, k);
      return [...set].some(x => vals.has(x));
    }));
    if (q) list = list.filter(s => [s.name, s.en, s.catch, ...s.tags].join(' ').toLowerCase().includes(q.toLowerCase()));
    if (ui.sort === 'easy') list = list.slice().sort((a, b) => a.effort - b.effort);
    if (ui.sort === 'hairType') list = list.slice().sort((a, b) => hairScore(b) - hairScore(a));
    return list;
  }
  // 髪質との相性（HM_CARE の目安）。good 2・ok 1・care 0 点。目安がない髪型は ok あつかい
  const HAIR_TYPES = ['straight', 'wavy', 'thick', 'thin', 'cowlick'];
  const hairRating = (s, t) => (s.requirements && s.requirements.hairTypes[t] || {}).rating || 'ok';
  const pickedHairTypes = () => ui.filters.hairType && ui.filters.hairType.size ? [...ui.filters.hairType] : HAIR_TYPES;
  const hairScore = s => pickedHairTypes().reduce((n, t) => n + ({ good: 2, ok: 1, care: 0 })[hairRating(s, t)], 0);
  // 一覧のタグ：髪質で探しているときは、選んだ髪質との相性を出す
  function hairTag(s) {
    const picked = ui.filters.hairType && ui.filters.hairType.size ? [...ui.filters.hairType] : null;
    if (!picked && ui.sort !== 'hairType') return '';
    if (!picked) { const good = HAIR_TYPES.filter(t => hairRating(s, t) === 'good').length, care = HAIR_TYPES.filter(t => hairRating(s, t) === 'care').length; return `向いている ${good}・注意 ${care}`; }
    if (picked.length === 1) return `${L.hairType[picked[0]]}：${L.rating[hairRating(s, picked[0])]}`;
    const good = picked.filter(t => hairRating(s, t) === 'good').length;
    return good ? `えらんだ髪質に向いている ${good}` : 'えらんだ髪質：ふつう';
  }
  function toggleFilter(key, val) {
    const set = ui.filters[key] || (ui.filters[key] = new Set());
    set.has(val) ? set.delete(val) : set.add(val);
  }
  const filterLabel = (k, v) => {
    const g = window.HM_FILTERS.find(f => f.key === k);
    const o = g && g.options.find(x => x[0] === v);
    return g && o ? `${g.label}：${o[1]}` : v;
  };

  // ───────── 部品 ─────────
  const imgTag = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" decoding="async">`;
  function pic(s, view, label) {
    const img = window.HM_IMAGES[s.id] && window.HM_IMAGES[s.id][view];
    const alt = label || `${s.name}（${VIEW_NAME[view]}）`;
    if (img) return `<div class="art">${imgTag(img, alt)}</div>`;
    if (isGirl(s)) return `<div class="art ph"><span>イラスト<br>準備中</span></div>`;   // 男の子用の簡易図は使わない
    return `<div class="art">${IL.render(s.params, view, { label: alt })}</div>`;
  }
  // 比較画像：登録があれば画像。刈り上げだけは、画像がなくても簡易図で代わりに描く
  // 比較画像は男の子のモデルで作っているので、女の子の髪型では使わない
  const compareSrc = (key, view, v, s) => (s && isGirl(s)) ? null : (((window.HM_COMPARE_IMAGES[key] || {})[view] || {})[v] || null);
  const compareMeta = key => window.HM_COMPARE_AXES.find(c => c.key === key);
  const compareReady = key => !!window.HM_COMPARE_IMAGES[key];
  function comparePic(key, view, v, fallbackParams) {
    const src = compareSrc(key, view, v);
    if (src) return `<div class="art">${imgTag(src, '')}</div>`;
    if (key === 'fade') return `<div class="art">${IL.render(Object.assign({}, fallbackParams, { fade: v }), view)}</div>`;
    return '';
  }
  // 希望を選ぶ・相談モードで使う向き（刈り上げは横／後ろ、ほかは基本の向き）
  // 画像が登録されている向きだけを使う（刈り上げは簡易図があるので全部の向き）
  const compareViews = key => {
    const meta = compareMeta(key);
    if (!meta) return ['front'];
    if (key === 'fade') return meta.views;
    const ok = meta.views.filter(v => (window.HM_COMPARE_IMAGES[key] || {})[v]);
    return ok.length ? ok : meta.views;
  };
  const pickView = (key, where) => key === 'fade' ? (where === 'consult' ? 'back' : 'side') : compareViews(key)[0];
  const meter = (n, max) => `<span class="meter" aria-label="${n}/${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  const tagFor = s => isGirl(s) ? `長さ ${L.hairLength[s.params.hairLength] || ''}` : s.params.fade >= 2 ? `刈り上げ ${L.fade[s.params.fade]}` : `セット ${L.effort[s.effort]}`;
  // 相談メモでいちばん大きく出す項目（短い髪型は刈り上げ、長い髪型は全体の長さ）
  const primaryKey = s => isGirl(s) ? 'hairLength' : 'fade';

  function appbar(left, right) {
    return `<header class="appbar">${left}${right || ''}</header>`;
  }
  const logoBar = (title, en, right) => appbar(`<div class="logo">${title}<small>${en}</small></div>`, right);
  const backBar = (right) => appbar(`<button class="back" data-act="back">← BACK</button>`, right);

  function cell(s) {
    const saved = store.saved.includes(s.id);
    return `<article class="cell">
      <a href="#/style/${s.id}" aria-label="${esc(s.name)}の詳細">${pic(s, 'front', s.name)}
        <div class="cap"><span class="no">No.${s.no}</span><b>${esc(s.name)}</b><span class="tag">${hairTag(s) || tagFor(s)}</span></div></a>
      <button class="save ${saved ? 'on' : ''}" data-act="save" data-id="${s.id}" aria-pressed="${saved}" aria-label="ほぞん">${saved ? '♥' : '♡'}</button>
    </article>`;
  }

  // ───────── ホーム ─────────
  function viewHome() {
    const picks = window.HM_PICKS.map(byId).filter(Boolean);
    return `<div class="pole"></div>
      ${logoBar('ヘアみっけ', 'HAIR MIKKE', `<a class="icon" href="#/parents" aria-label="おうちの方へ">?</a>`)}
      <section class="hero">
        <div class="kicker">HAIR STYLE CATALOG &amp; MEMO</div>
        <h1>その髪型、<br><em>ちゃんと</em>伝わる。</h1>
        <p>イラストで見比べて選んで、美容師さんと一緒に決める。親子のための髪型カタログと相談メモ。</p>
      </section>
      <nav class="entries">
        <button class="entry" data-act="flow" data-flow="booked"><span class="num">01</span><span><b>もう予約してある</b><small>髪型を選んで、相談メモを作る</small></span><span class="go">→</span></button>
        <button class="entry" data-act="flow" data-flow="shop"><span class="num">02</span><span><b>これからお店をさがす</b><small>相談メモを作ってから、お店をさがす</small></span><span class="go">→</span></button>
        <a class="entry now" href="#/memos"><span class="num">03</span><span><b>お店で相談中</b><small>美容師さんと一緒に画面を見る</small></span><span class="go">→</span></a>
      </nav>
      <section class="sec">
        <div class="sec-title"><h2>編集部のおすすめ</h2><span class="en">PICK UP</span></div>
        <div class="hscroll">${picks.map(s => `<a class="pick" href="#/style/${s.id}">${pic(s, 'front', s.name)}<div class="cap"><span class="no">No.${s.no}</span><b>${esc(s.name)}</b></div></a>`).join('')}</div>
        <p class="note-line">編集部が選んだ髪型です。広告は含みません。</p>
      </section>
      <a class="parents" href="#/parents"><span>おうちの方へ：保存するデータと使い方</span><span class="en">→</span></a>
      <footer class="foot"><a href="#/stats">集計（運営向け）</a></footer>`;
  }

  // ───────── カタログ ─────────
  function viewFind() {
    return `${logoBar('さがす', 'FIND')}
      <section class="sec find-head">
        <label class="search"><span aria-hidden="true">⌕</span><input type="search" data-act="q" placeholder="髪型の名前・特徴でさがす" value="${esc(ui.q)}"></label>
        <div class="chips">${window.HM_QUICK.map(q => {
          const on = ui.filters[q.key] && ui.filters[q.key].has(q.val);
          return `<button class="chip ${on ? 'on' : ''}" data-act="quick" data-key="${q.key}" data-val="${q.val}" aria-pressed="${!!on}">${q.label}</button>`;
        }).join('')}</div>
        <div id="find-status"></div>
      </section>
      <div id="find-grid"></div>`;
  }
  function renderFindParts() {
    const list = matched();
    const act = activeFilters();
    const st = document.getElementById('find-status');
    const gr = document.getElementById('find-grid');
    if (!st || !gr) return;
    st.innerHTML = `${act.length ? `<div class="applied">${act.map(([k, v]) => `<button class="x" data-act="unfilter" data-key="${k}" data-val="${v}">${esc(filterLabel(k, v))}</button>`).join('')}
        <button class="clear" data-act="clear">すべて解除</button></div>` : ''}
      <div class="count-row"><span class="big">${String(list.length).padStart(2, '0')}<small>件</small></span>
        <span class="tools">
          <select data-act="sort" aria-label="ならび順"><option value="recommend" ${ui.sort === 'recommend' ? 'selected' : ''}>編集部の順</option><option value="easy" ${ui.sort === 'easy' ? 'selected' : ''}>セットがかんたん</option><option value="hairType" ${ui.sort === 'hairType' ? 'selected' : ''}>髪質に合う順</option></select>
          <button class="tag" data-act="open-filter">しぼりこみ ▾</button>
        </span></div>`;
    gr.innerHTML = list.length
      ? `<div class="grid">${list.map(cell).join('')}</div>${S.some(isGirl) ? '' : '<p class="list-note">女の子の髪型は準備中です。</p>'}<div class="list-end">— END OF LIST —</div>`
      : `<div class="empty">条件に合う髪型がありません。<br>条件を少しへらしてみてください。</div>`;
    if (ui.filters.hairType && ui.filters.hairType.size || ui.sort === 'hairType') gr.insertAdjacentHTML('afterbegin', '<p class="list-note">髪質との相性は、資料をもとにした目安です。「注意」の髪型も、美容師さんと相談すればできることがあります。</p>');
  }

  function openFilter() {
    sheet.innerHTML = `<div class="sheet-bg" data-act="close-sheet"></div>
      <div class="sheet-body" role="dialog" aria-modal="true" aria-label="しぼりこみ">
        <div class="sheet-head"><h2>しぼりこみ</h2><button class="clear" data-act="clear-sheet">すべて解除</button></div>
        <div class="sheet-scroll">${window.HM_FILTERS.map(g => `<fieldset class="fgroup"><legend>${g.label}</legend><div class="chips wrap">
          ${g.options.map(([v, t]) => {
            const on = ui.filters[g.key] && ui.filters[g.key].has(v);
            return `<button class="chip ${on ? 'on' : ''}" data-act="sheet-chip" data-key="${g.key}" data-val="${v}" aria-pressed="${!!on}">${t}</button>`;
          }).join('')}</div></fieldset>`).join('')}</div>
        <button class="btn" data-act="close-sheet"><span id="sheet-count">${matched().length}件を見る</span> <span class="arrow">→</span></button>
      </div>`;
    sheet.hidden = false;
    document.body.classList.add('lock');
  }
  function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; document.body.classList.remove('lock'); }

  // ───────── 髪型の詳細 ─────────
  function viewStyle(id) {
    const s = byId(id);
    if (!s) return notFound();
    const p = s.params, saved = store.saved.includes(s.id);
    return `${backBar(`<button class="icon ${saved ? 'on' : ''}" data-act="save" data-id="${s.id}" aria-pressed="${saved}" aria-label="ほぞん">${saved ? '♥' : '♡'}</button>`)}
      <section class="title-block"><span class="no">No.${s.no}</span><h1>${esc(s.name)}</h1><span class="en">${esc(s.en)}</span></section>
      <div class="stage">${pic(s, ui.view)}</div>
      <div class="views" role="tablist">${['front', 'side', 'back'].map(v => `<button role="tab" class="${ui.view === v ? 'on' : ''}" aria-selected="${ui.view === v}" data-act="view" data-view="${v}">${VIEW_NAME[v]}</button>`).join('')}</div>
      <section class="sec"><p class="kidline">${esc(s.kid)}</p></section>
      <section class="sec">
        <div class="sec-title"><h2>髪型のとくちょう</h2><span class="en">SPEC</span></div>
        ${specTable(s)}
      </section>
      ${isGirl(s) ? '' : `<section class="sec">
        <div class="sec-title"><h2>違いを比べる</h2><span class="en">COMPARE</span></div>
        ${compareSection(s)}
      </section>`}
      ${(s.variants || []).length ? `<section class="sec">
        <div class="sec-title"><h2>この髪型で選べる形</h2><span class="en">VARIATIONS</span></div>
        <ul class="variants">${s.variants.map(v => `<li><b>${axisDef(s, v.field).label}</b>
          <span>${v.values.map(x => `<em class="${String(x) === String(standardOf(s, v.field)) ? 'std' : ''}">${esc(valueLabel(s, v.field, x))}</em>`).join('')}</span>
          <small>${esc(v.basis)}</small></li>`).join('')}</ul>
      </section>` : ''}
      ${(s.variantNotes || []).length ? `<section class="sec">
        <div class="sec-title"><h2>ほかにもある形</h2><span class="en">NOTES</span></div>
        <ul class="bullets">${s.variantNotes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <p class="note-line">美容師さんと相談して決めてね。</p>
      </section>` : ''}
      ${careSection(s)}
      <section class="sec">
        <div class="sec-title"><h2>美容師さんへの伝え方</h2><span class="en">FOR STYLIST</span></div>
        <ul class="bullets">${s.stylist.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      </section>
      <div class="bottombar"><a class="btn red" href="#/make/${s.id}">この髪型で相談メモを作る <span class="arrow">→</span></a></div>`;
  }

  // 髪型のとくちょうの表（短い髪型と長い髪型で項目を分ける）
  function specTable(s) {
    const p = s.params;
    const bangTxt = p.bangShape === 'none' ? `<b>${L.bang.none}</b>` : p.bangShape === 'grown' ? `<b>${L.bangShape.grown}</b>` : `<b>${L.bang[p.bang] || ''}</b>・${L.bangShape[p.bangShape]}`;
    const rows = isGirl(s) ? [
      ['全体の長さ', `<b>${L.hairLength[p.hairLength]}</b>`],
      ['前髪', bangTxt],
      ['段', `<b>${L.layer[p.layer]}</b>`],
      ['顔まわり', `<b>${L.faceFrame[p.faceFrame]}</b>`],
      ['耳まわり', `<b>${L.ear[p.ear]}</b>`],
      ['セット', `<b>${L.effort[s.effort]}</b>`]
    ] : [
      ['全体の長さ', `<b>${L.top[p.top]}</b>`],
      ['前髪', bangTxt],
      ['耳まわり', `<b>${L.ear[p.ear]}</b>`],
      ['刈り上げ', `<b>${L.fade[p.fade]}</b> ${meter(p.fade, 3)}<small>${esc(fadeText(s, p.fade))}</small>`],
      ['襟足', `<b>${L.nape[p.nape]}</b>`],
      ['セット', `<b>${L.effort[s.effort]}</b>・${L.wax[s.wax]}`]
    ];
    return `<table class="spec">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
  }

  // 再現しやすさ・手入れ（資料から作った目安。監修なし）
  function careSection(s) {
    const r = s.requirements, m = s.maintenance;
    if (!r && !m) return '';
    const order = ['straight', 'wavy', 'thick', 'thin', 'cowlick'];
    const types = r && r.hairTypes ? order.filter(k => r.hairTypes[k]).map(k => [k, r.hairTypes[k]]) : [];
    const rows = [];
    if (r && r.length) rows.push(['必要な長さ', esc(r.length)]);
    if (m && m.cutWeeks) rows.push(['カットの間隔', `<b>${m.cutWeeks[0] === m.cutWeeks[1] ? m.cutWeeks[0] : m.cutWeeks.join('〜')}週間</b>ごと<small>形をきれいに保つなら。${esc(m.cutNote || '')}</small>`]);
    if (m && m.morning) rows.push(['朝のセット', esc(m.morning)]);
    if (m && m.growOut) rows.push(['のびてきたら', esc(m.growOut)]);
    return `<section class="sec">
        <div class="sec-title"><h2>再現しやすさ・手入れ<small class="tag-guide">目安</small></h2><span class="en">CARE</span></div>
        ${rows.length ? `<table class="spec">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>` : ''}
        ${types.length ? `<h3 class="sub">髪質との相性</h3><ul class="hairtypes">${types.map(([k, v]) => `<li class="${v.rating}"><b>${L.hairType[k]}</b><em>${L.rating[v.rating]}</em>${v.note ? `<small>${esc(v.note)}</small>` : ''}</li>`).join('')}</ul>` : ''}
        <p class="note-line">資料をもとにした目安です。髪質や生えぐせで変わるので、最後は美容師さんと相談してね。</p>
      </section>`;
  }

  // 違いを比べる：軸のタブ、向きの切りかえ、同じ頭で値だけが違う比較画像
  function compareSection(s) {
    const meta = compareMeta(ui.compareAxis) && compareReady(ui.compareAxis) ? compareMeta(ui.compareAxis) : compareMeta('fade');
    const views = compareViews(meta.key);
    const view = views.includes(ui.compareView) ? ui.compareView : views[0];
    const std = s.params[meta.key];
    const label = v => meta.key === 'fade' ? L.fade[v] : (L[meta.key] || {})[v] || v;
    return `<div class="axis-tabs">${window.HM_COMPARE_AXES.map(c => compareReady(c.key)
        ? `<button class="${c.key === meta.key ? 'on' : ''}" data-act="compare-axis" data-key="${c.key}">${c.label}</button>`
        : `<span class="off">${c.label}<small>準備中</small></span>`).join('')}</div>
      <div class="seg small">${views.map(v => `<button class="${view === v ? 'on' : ''}" data-act="compare-view" data-view="${v}">${VIEW_NAME[v]}から</button>`).join('')}</div>
      <div class="compare cols${meta.values.length}">${meta.values.map(v => `<figure class="${String(v) === String(std) ? 'on' : ''}">${comparePic(meta.key, view, v, s.params)}<figcaption>${esc(label(v))}${String(v) === String(std) ? '<i>見本</i>' : ''}</figcaption></figure>`).join('')}</div>
      <div class="axis-scale"><span>${meta.scale[0]}</span><span>→</span><span>${meta.scale[1]}</span></div>`;
  }

  // ───────── 希望を選ぶ（1項目ずつ） ─────────
  function viewMake(id) {
    const s = byId(id);
    if (!s) return notFound();
    if (!ui.draft || ui.draft.styleId !== s.id) { ui.draft = newMemo(s); ui.step = 0; }
    const m = ui.draft, axes = axesFor(s), total = axes.length + 1;
    const step = Math.min(ui.step, total - 1);
    const bar = `<div class="steps"><span>${esc(s.name)}</span><span class="bar">${Array.from({ length: total }, (_, i) => `<i class="${i < step ? 'on' : i === step ? 'now' : ''}"></i>`).join('')}</span></div>`;
    const preview = `<div class="preview3">${['front', 'side', 'back'].map(v => pic(s, v)).join('')}</div>`;
    const head = backBar(`<span class="en step-no">STEP ${step + 1} / ${total}</span>`);
    if (step < axes.length) {
      const a = axes[step], cur = m.wish.axes[a.key], std = standardOf(s, a.key);
      return `${head}${bar}${preview}
        <section class="q"><span class="en">Q.${String(step + 1).padStart(2, '0')} ${a.en}</span><h1>${a.q}</h1><p>${a.hint}</p></section>
        <div class="options">
          ${a.options.map(([v, t, d]) => {
            const on = String(cur) === String(v);
            const img = !isGirl(s) && (a.compare || compareSrc(a.key, pickView(a.key), v)) ? comparePic(a.key, pickView(a.key), v, s.params) : '';
            return `<button class="opt ${img ? 'has-art' : ''} ${on ? 'on' : ''}" data-act="pick" data-key="${a.key}" data-val="${v}" aria-pressed="${on}">
              ${img}<span class="txt"><b>${esc(t)}${String(v) === String(std) ? '<span class="std">STANDARD</span>' : isCandidate(s, a.key, v) ? '<span class="std cand">候補</span>' : ''}</b>${d ? `<small>${esc(d)}</small>` : ''}</span><span class="radio"></span></button>`;
          }).join('')}
          <button class="unsure ${cur === UNSURE ? 'on' : ''}" data-act="pick" data-key="${a.key}" data-val="${UNSURE}" aria-pressed="${cur === UNSURE}">
            <span>わからない・美容師さんと相談<small>相談メモに「相談したい」と出ます</small></span><span class="radio"></span></button>
        </div>
        <div class="bottombar"><button class="btn ghost w30" data-act="step" data-dir="-1">${step === 0 ? 'やめる' : 'もどる'}</button><button class="btn" data-act="step" data-dir="1">つぎへ <span class="arrow">→</span></button></div>`;
    }
    return `${head}${bar}${preview}
      <section class="q"><span class="en">LAST STEP</span><h1>さいごに</h1><p>美容師さんに伝えたいことがあれば書いてね（なくてもOK）。</p></section>
      <div class="form">
        <label class="field">よびな（相談メモに表示）<input type="text" data-act="nick" maxlength="12" placeholder="例：けんた" value="${esc(m.child.nickname)}"></label>
        <label class="field">美容師さんへのメモ<textarea data-act="note" rows="3" maxlength="200" placeholder="例：学校で刈り上げが目立たない程度に／つむじがはねやすい">${esc(m.wish.note)}</textarea></label>
        <label class="check"><input type="checkbox" data-act="consult-len" ${m.wish.consultLength ? 'checked' : ''}> 細かい長さ（何cm・何mm）は、美容師さんと相談して決めたい</label>
        <p class="note-line">よびな以外の名前や写真は入れないでね。共有リンクを知っている人は内容を見られます。</p>
      </div>
      <div class="bottombar"><button class="btn ghost w30" data-act="step" data-dir="-1">もどる</button><button class="btn red" data-act="create">相談メモを作る <span class="arrow">→</span></button></div>`;
  }

  // ───────── 相談メモ ─────────
  function memoRows(s, m, opts) {
    const eff = effective(m);
    const rows = axesFor(s).filter(a => a.key !== primaryKey(s)).map(a => {
      const v = eff[a.key];
      const changed = m.agreed.axes[a.key] !== undefined && String(m.agreed.axes[a.key]) !== String(m.wish.axes[a.key]);
      const ask = v === UNSURE;
      return `<div class="${ask ? 'ask' : ''}"><span class="k">${a.label}${changed ? '<i class="chg">変更</i>' : ''}</span><span class="v">${esc(valueLabel(s, a.key, v))}</span></div>`;
    });
    rows.push(`<div><span class="k">細かい長さ</span><span class="v">${m.wish.consultLength ? '相談して決める' : 'おまかせ'}</span></div>`);
    if (rows.length % 2) rows.push('<div class="blank"></div>');
    return rows.join('');
  }
  function memoCard(s, m) {
    const eff = effective(m), pk = primaryKey(s), f = eff[pk];
    const agreed = m.status === 'agreed';
    return `<article class="pass" id="pass">
      <div class="pass-head"><span class="en">HAIR MEMO</span><span class="who">${m.child.nickname ? esc(m.child.nickname) + ' さん' : ''}</span></div>
      <div class="pass-main">
        <div class="label">${agreed ? '美容師さんと決めた髪型' : '美容師さん、この髪型にしたいです'}</div>
        <div class="style">${esc(s.name)}</div>
        <div class="primary"><span class="k">${axisDef(s, pk).label}</span>${f === UNSURE ? '<span class="askv">相談したい</span>' : `${esc(valueLabel(s, pk, f))} ${pk === 'fade' ? meter(f, 3) : ''}`}
          ${m.agreed.axes[pk] !== undefined && String(m.agreed.axes[pk]) !== String(m.wish.axes[pk]) ? '<i class="chg">変更</i>' : ''}</div>
      </div>
      <div class="pass-views">${['front', 'side', 'back'].map(v => pic(s, v)).join('')}</div>
      <div class="rows">${memoRows(s, m)}</div>
      ${m.wish.note ? `<div class="pass-note"><span class="k">メモ</span>${esc(m.wish.note)}</div>` : ''}
      <div class="pass-foot"><span class="status st-${m.status}">${STATUS[m.status] || ''}</span><span>${new Date(m.updatedAt || m.createdAt).toLocaleDateString('ja-JP')}</span></div>
    </article>`;
  }
  function memoDetails(s, m) {
    const props = m.proposals || [];
    return `<section class="sec">
        <div class="sec-title"><h2>美容師さんの提案</h2><span class="en">PROPOSALS</span></div>
        ${props.length ? `<ul class="props">${props.map(p => `<li><b>${esc(axisDef(s, p.axis).label)}：${esc(valueLabel(s, p.axis, p.value))}</b>${p.reason ? `<p>${esc(p.reason)}</p>` : ''}</li>`).join('')}</ul>`
          : '<p class="note-line">まだ提案はありません。お店で「相談する」を開くと、美容師さんが記録できます。</p>'}
      </section>
      <section class="sec">
        <div class="sec-title"><h2>美容師さんへの伝え方</h2><span class="en">FOR STYLIST</span></div>
        <ul class="bullets">${s.stylist.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${s.fadeNote ? `<p class="note-line">刈り上げ：${esc(s.fadeNote)}</p>` : ''}
      </section>`;
  }
  function viewMemo(id) {
    const m = memoById(id);
    if (!m) return notFound();
    const s = byId(m.styleId);
    if (!s) return notFound();
    return `${appbar(`<a class="back" href="#/memos">← MEMO</a>`, `<button class="icon" data-act="print" aria-label="印刷">⎙</button>`)}
      <div class="pass-wrap">${memoCard(s, m)}<p class="bright">画面を明るくして、美容師さんに見せてね</p></div>
      ${memoDetails(s, m)}
      <section class="sec links">
        <a href="#/make/${s.id}" data-act="remake" data-id="${m.id}">このメモをもとに作り直す →</a>
        ${store.flow === 'shop' ? '<a href="#/shops">キッズ対応のお店をさがす →</a>' : ''}
        <button class="danger" data-act="delete-memo" data-id="${m.id}">このメモを消す</button>
      </section>
      <div class="bottombar"><button class="btn ghost" data-act="share" data-id="${m.id}">共有する</button><a class="btn red" href="#/consult/${m.id}">相談する <span class="arrow">→</span></a></div>`;
  }
  function viewShared(data) {
    let m;
    try { m = fromPayload(dec(data)); } catch (e) { m = null; }
    const s = m && byId(m.styleId);
    if (!s) return `${logoBar('共有された相談メモ', 'MEMO')}<div class="empty">相談メモを読みこめませんでした。</div>`;
    return `${logoBar('共有された相談メモ', 'SHARED')}
      <div class="pass-wrap">${memoCard(s, m)}</div>
      ${memoDetails(s, m)}
      <div class="bottombar"><button class="btn ghost" data-act="keep-shared" data-payload="${esc(data)}">この端末に保存</button><a class="btn" href="#/">ヘアみっけを開く</a></div>`;
  }

  // ───────── 相談モード ─────────
  function viewConsult(id) {
    const m = memoById(id);
    if (!m) return notFound();
    const s = byId(m.styleId);
    if (!s) return notFound();
    if (!ui.consult || ui.consult.id !== id) {
      ui.consult = { id, i: 0, pick: null, reason: '' };
      if (m.status === 'draft') { m.status = 'shown'; saveMemo(m); }
      track(s.id, 'show');
    }
    const axes = axesFor(s), c = ui.consult;
    const a = axes[c.i];
    const wish = m.wish.axes[a.key];
    const agreedV = m.agreed.axes[a.key];
    const pick = c.pick !== null ? c.pick : (agreedV !== undefined ? agreedV : wish);
    const decided = k => m.agreed.axes[k] !== undefined;
    const cv = pickView(a.key, 'consult');
    const withArt = !isGirl(s) && (a.compare || a.options.some(([v]) => compareSrc(a.key, cv, v)));
    const optionHtml = a.options.map(([v, t]) => {
      const isWish = String(v) === String(wish), isPick = String(v) === String(pick);
      return `<button class="c-opt ${withArt ? 'has-art' : ''} ${isPick ? 'pick' : ''}" data-act="c-pick" data-val="${v}" aria-pressed="${isPick}">
        ${isWish ? '<span class="mark wish">希望</span>' : ''}${isPick && !isWish ? '<span class="mark prop">提案</span>' : ''}
        ${withArt ? (comparePic(a.key, cv, v, s.params) || '<div class="art noimg"></div>') : ''}<span class="t">${esc(t)}</span></button>`;
    }).join('');
    const doneAll = axes.every(x => decided(x.key));
    return `${appbar(`<a class="back" href="#/memo/${m.id}">← MEMO</a>`, `<span class="en step-no">CONSULT</span>`)}
      <div class="mode"><span>美容師さんと相談中</span><span class="en">WITH STYLIST</span></div>
      <div class="axis-strip">${axes.map((x, i) => `<button class="${i === c.i ? 'on' : ''} ${decided(x.key) ? 'done' : ''}" data-act="c-axis" data-i="${i}">${x.label}</button>`).join('')}</div>
      <section class="axis-big"><span class="no">AXIS ${String(c.i + 1).padStart(2, '0')} / ${a.en}</span><h1>${a.label}</h1></section>
      <div class="c-options ${withArt ? 'grid4' : ''}">${optionHtml}</div>
      <div class="vs"><div><span class="k">親子の希望</span><span class="v">${esc(valueLabel(s, a.key, wish))}</span></div>
        <div><span class="k">いま選んでいる形</span><span class="v">${esc(valueLabel(s, a.key, pick))}</span></div></div>
      <label class="reason">提案の理由（美容師さんが記入・任意）<textarea data-act="c-reason" rows="2" maxlength="160" placeholder="例：髪質がやわらかいので、下ろす形のほうが再現しやすい">${esc(c.reason)}</textarea></label>
      <div class="agree-list">${axes.map(x => {
        const w = m.wish.axes[x.key], g = m.agreed.axes[x.key];
        const badge = g === undefined ? '<span class="pending">相談中</span>' : String(g) === String(w) ? '<span class="ok">OK</span>' : '<span class="chg">CHANGED</span>';
        return `<div><span>${x.label}<small>${g === undefined ? esc(valueLabel(s, x.key, w)) : esc(valueLabel(s, x.key, g))}</small></span>${badge}</div>`;
      }).join('')}</div>
      <div class="bottombar col">
        <div class="row"><button class="btn ghost" data-act="c-keep" ${wish === UNSURE ? 'disabled' : ''}>希望のまま決定</button><button class="btn red" data-act="c-decide" ${pick === UNSURE ? 'disabled' : ''}>この形で決定</button></div>
        ${doneAll ? `<button class="btn" data-act="c-finish">相談を終えて、決めた内容を保存 <span class="arrow">→</span></button>` : ''}
      </div>`;
  }

  // ───────── ほぞん・相談メモ一覧 ─────────
  function viewSaved() {
    const list = store.saved.map(byId).filter(Boolean);
    return `${logoBar('ほぞん', 'SAVED')}
      ${list.length ? `<div class="grid">${list.map(cell).join('')}</div>`
        : '<div class="empty">まだありません。<br>気になる髪型の「♡」をおすと、ここに集まります。</div>'}`;
  }
  function viewMemos() {
    const list = store.memos.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return `${logoBar('相談メモ', 'MEMO')}
      ${list.length ? `<p class="lead">お店で見せたいメモを開いて、「相談する」をおしてね。</p><div class="memo-list">${list.map(m => {
        const s = byId(m.styleId);
        if (!s) return '';
        return `<a class="memo-row" href="#/memo/${m.id}">${pic(s, 'front')}
          <span class="body"><b>${esc(s.name)}</b><small>${m.child.nickname ? esc(m.child.nickname) + ' さん・' : ''}${new Date(m.updatedAt || m.createdAt).toLocaleDateString('ja-JP')}</small>
          <span class="status st-${m.status}">${STATUS[m.status] || ''}</span></span><span class="go en">→</span></a>`;
      }).join('')}</div>`
        : '<div class="empty">まだ相談メモがありません。<br>髪型を選んで「相談メモを作る」をおしてね。<br><a class="btn" href="#/find">髪型をさがす →</a></div>'}`;
  }

  // ───────── お店 ─────────
  function viewShops() {
    const q = encodeURIComponent('キッズカット 美容室');
    return `${logoBar('お店', 'SHOP')}
      <section class="sec"><p class="lead0">予約がまだなら、相談メモを持って、キッズカットに対応したお店をさがしましょう。予約をしなくても、相談メモは使えます。</p></section>
      <nav class="entries">
        <a class="entry" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener"><span class="num">01</span><span><b>地図で近くをさがす</b><small>Googleマップで「キッズカット 美容室」を検索</small></span><span class="go">↗</span></a>
        <a class="entry" href="https://beauty.rakuten.co.jp/" target="_blank" rel="noopener"><span class="num">02</span><span><b>予約サイトでさがす</b><small>楽天ビューティで「キッズカット」を検索</small></span><span class="go">↗</span></a>
      </nav>
      <section class="sec">
        <div class="sec-title"><h2>子ども対応をチェック</h2><span class="en">CHECK</span></div>
        <ul class="checklist">
          <li>メニューに「キッズカット」「小学生」の料金がある</li>
          <li>口コミに子どものカットの話が出ている</li>
          <li>予約のときに「相談メモを持っていく」と伝えられる</li>
          <li>待ち時間・所要時間が書かれている</li>
          <li>バリカン（刈り上げ）に対応している</li>
        </ul>
      </section>
      <section class="sec"><div class="box"><h3>掲載・広告について</h3><p>ヘアみっけは、お店の掲載や広告をしていません。上のリンクは外部サイトで、紹介しているお店をすすめるものではありません。将来お店を紹介する場合は、子ども対応の根拠と確認日を表示し、広告には「広告」と書いて、おすすめとは別の枠に置きます。</p></div></section>`;
  }

  // ───────── おうちの方へ ─────────
  function viewParents() {
    return `${backBar()}
      <section class="title-block"><span class="no">FOR PARENTS</span><h1>おうちの方へ</h1></section>
      <section class="sec"><ul class="facts">
        <li><b>ログインは不要です。</b>アカウントを作らずに使えます。</li>
        <li><b>データはこの端末の中だけに保存します。</b>ほぞんした髪型と相談メモは、このブラウザに保存されます。サーバーには送りません。</li>
        <li><b>子どもの写真や位置情報は使いません。</b></li>
        <li><b>広告はありません。</b>「編集部のおすすめ」は編集部が選んだもので、有料の掲載ではありません。</li>
        <li><b>共有リンクについて。</b>相談メモの内容はリンクの中に入っています。リンクを知っている人は見られるので、よびな以外の名前は入れないでください。</li>
        <li><b>髪型のイラストは見本です。</b>髪質や今の長さによって仕上がりは変わります。最後は美容師さんと相談して決めてください。</li>
      </ul></section>
      <section class="sec"><button class="danger" data-act="reset">この端末のデータをすべて消す</button></section>`;
  }

  // ───────── 集計（運営向け） ─────────
  function viewStats() {
    const cols = [['view', '閲覧'], ['like', 'いいね'], ['save', '保存'], ['card', 'メモ作成'], ['compare', '比較'], ['show', '相談'], ['agree', '合意']];
    return `${backBar()}
      <section class="title-block"><span class="no">OPERATOR</span><h1>集計（運営向け）</h1></section>
      <section class="sec"><p class="lead0">この端末での行動を、髪型ごと・行動ごとに別々に数えています。利用者には数字を表示していません。</p>
      <div class="table-wrap"><table class="stats"><thead><tr><th>髪型</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead>
      <tbody>${S.map(s => { const e = store.events[s.id] || {}; return `<tr><td>${esc(s.name)}</td>${cols.map(c => `<td>${e[c[0]] || 0}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div></section>`;
  }

  function notFound() { return `${backBar()}<div class="empty">ページが見つかりません。<br><a href="#/">トップへ</a></div>`; }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ───────── ルーティング ─────────
  function route(keepScroll) {
    const y = window.scrollY;
    const h = location.hash.replace(/^#/, '') || '/';
    const parts = h.split('/');
    const page = parts[1] || '';
    const arg = parts.slice(2).join('/');
    if (page === 'card') { location.replace(`#/memo/${arg}`); return; }   // 旧URL
    if (page === 'cards') { location.replace('#/memos'); return; }
    if (!keepScroll) closeSheet();
    let html, tab = '';
    switch (page) {
      case '': html = viewHome(); tab = 'home'; break;
      case 'find': html = viewFind(); tab = 'find'; break;
      case 'style':
        if (!keepScroll) { track((byId(arg) || {}).id || arg, 'view'); ui.view = 'front'; ui.compareAxis = 'fade'; ui.compareView = 'side'; }
        html = viewStyle(arg); tab = 'find'; break;
      case 'make': html = viewMake(arg); tab = 'find'; break;
      case 'memo': html = viewMemo(arg); tab = 'memos'; break;
      case 'consult': html = viewConsult(arg); tab = 'memos'; break;
      case 'share': html = viewShared(arg); break;
      case 'saved': html = viewSaved(); tab = 'saved'; break;
      case 'memos': html = viewMemos(); tab = 'memos'; break;
      case 'shops': html = viewShops(); tab = 'shops'; break;
      case 'parents': html = viewParents(); tab = 'home'; break;
      case 'stats': html = viewStats(); break;
      default: html = notFound();
    }
    app.innerHTML = html;
    document.body.dataset.page = page || 'home';
    document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    if (page === 'find') renderFindParts();
    window.scrollTo(0, keepScroll ? y : 0);
  }
  const rerender = () => route(true);
  window.addEventListener('hashchange', () => route(false));

  // ───────── 操作 ─────────
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    switch (act) {
      case 'back':
        if (history.length > 1) history.back(); else location.hash = '#/';
        break;
      case 'flow':
        store.flow = el.dataset.flow; persist();
        location.hash = '#/find';
        toast(store.flow === 'shop' ? 'まずは髪型をえらぼう。相談メモのあとでお店をさがせます' : '髪型をえらんで、相談メモを作ろう');
        break;
      case 'save': {
        e.preventDefault();
        const on = store.saved.includes(id);
        store.saved = on ? store.saved.filter(x => x !== id) : store.saved.concat(id);
        track(id, 'save', on ? -1 : 1);
        if (document.body.dataset.page === 'find') renderFindParts(); else rerender();
        toast(on ? 'ほぞんを取り消しました' : 'ほぞんしました');
        break;
      }
      case 'quick': toggleFilter(el.dataset.key, el.dataset.val); el.classList.toggle('on'); renderFindParts(); break;
      case 'unfilter': toggleFilter(el.dataset.key, el.dataset.val); rerender(); break;
      case 'clear': ui.filters = {}; rerender(); break;
      case 'open-filter': openFilter(); break;
      case 'sheet-chip': {
        toggleFilter(el.dataset.key, el.dataset.val);
        const on = ui.filters[el.dataset.key].has(el.dataset.val);
        el.classList.toggle('on', on); el.setAttribute('aria-pressed', on);
        document.getElementById('sheet-count').textContent = `${matched().length}件を見る`;
        break;
      }
      case 'clear-sheet': ui.filters = {}; openFilter(); break;
      case 'close-sheet': closeSheet(); rerender(); break;
      case 'view': ui.view = el.dataset.view; rerender(); break;
      case 'compare-axis': {
        ui.compareAxis = el.dataset.key; ui.compareView = compareViews(el.dataset.key)[0]; rerender();
        const s = byId(location.hash.split('/')[2]); if (s) track(s.id, 'compare');
        break;
      }
      case 'compare-view': {
        ui.compareView = el.dataset.view; rerender();
        const s = byId(location.hash.split('/')[2]); if (s) track(s.id, 'compare');
        break;
      }
      // 希望を選ぶ
      case 'pick': {
        const k = el.dataset.key, v = el.dataset.val;
        ui.draft.wish.axes[k] = (v === UNSURE || isNaN(Number(v)) || v === '') ? v : Number(v);
        rerender();
        break;
      }
      case 'step': {
        const dir = Number(el.dataset.dir);
        if (dir < 0 && ui.step === 0) { history.back(); break; }
        ui.step = Math.max(0, ui.step + dir);
        route(false);
        break;
      }
      case 'remake': {
        const base = memoById(id), s = base && byId(base.styleId);
        if (s) { ui.draft = newMemo(s, base); ui.step = 0; }
        break;
      }
      case 'create': {
        const m = ui.draft;
        saveMemo(m);
        track(m.styleId, 'card');
        ui.draft = null; ui.step = 0;
        location.hash = `#/memo/${m.id}`;
        toast('相談メモができました');
        break;
      }
      case 'delete-memo':
        if (confirm('この相談メモを消します。よろしいですか？')) {
          store.memos = store.memos.filter(m => m.id !== id); persist();
          location.hash = '#/memos';
        }
        break;
      case 'share': {
        const m = memoById(id), s = byId(m.styleId);
        const url = location.href.split('#')[0] + '#/share/' + enc(sharePayload(m));
        const text = `ヘアみっけの相談メモ：${s.name}`;
        if (navigator.share) navigator.share({ title: 'ヘアみっけ', text, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('共有用のリンクをコピーしました'), () => prompt('このリンクをコピーしてください', url));
        else prompt('このリンクをコピーしてください', url);
        break;
      }
      case 'keep-shared': {
        try {
          const m = fromPayload(dec(el.dataset.payload));
          m.id = newId(); m.updatedAt = Date.now();
          saveMemo(m);
          location.hash = `#/memo/${m.id}`;
          toast('この端末に保存しました');
        } catch (err) { toast('保存できませんでした'); }
        break;
      }
      case 'print': window.print(); break;
      // 相談モード
      case 'c-axis': ui.consult.i = Number(el.dataset.i); ui.consult.pick = null; ui.consult.reason = ''; rerender(); break;
      case 'c-pick': {
        const v = el.dataset.val;
        ui.consult.pick = isNaN(Number(v)) ? v : Number(v);
        const m = memoById(ui.consult.id); track(m.styleId, 'compare');
        rerender();
        break;
      }
      case 'c-keep':
      case 'c-decide': {
        const m = memoById(ui.consult.id), s = byId(m.styleId), a = axesFor(s)[ui.consult.i];
        const wish = m.wish.axes[a.key];
        const value = act === 'c-keep' ? wish : (ui.consult.pick !== null ? ui.consult.pick : (m.agreed.axes[a.key] !== undefined ? m.agreed.axes[a.key] : wish));
        if (value === UNSURE) break;
        m.agreed.axes[a.key] = value;
        m.proposals = (m.proposals || []).filter(p => p.axis !== a.key);
        if (String(value) !== String(wish) || ui.consult.reason.trim()) {
          m.proposals.push({ axis: a.key, value, reason: ui.consult.reason.trim(), by: 'stylist', at: Date.now() });
        }
        saveMemo(m);
        const axes = axesFor(s);
        const next = axes.findIndex((x, i) => i > ui.consult.i && m.agreed.axes[x.key] === undefined);
        ui.consult.i = next >= 0 ? next : ui.consult.i;
        ui.consult.pick = null; ui.consult.reason = '';
        rerender();
        break;
      }
      case 'c-finish': {
        const m = memoById(ui.consult.id);
        m.status = 'agreed'; m.agreed.at = Date.now(); m.agreed.by = 'family+stylist';
        saveMemo(m);
        track(m.styleId, 'agree');
        ui.consult = null;
        location.hash = `#/memo/${m.id}`;
        toast('決めた内容を保存しました');
        break;
      }
      case 'reset':
        if (confirm('この端末のほぞん・相談メモ・記録をすべて消します。よろしいですか？')) {
          store = empty(); store.memos = []; persist(); toast('消しました'); location.hash = '#/';
        }
        break;
    }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.act === 'sort') { ui.sort = el.value; renderFindParts(); }
    if (el.dataset.act === 'consult-len') ui.draft.wish.consultLength = el.checked;
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.act === 'q') { ui.q = el.value; renderFindParts(); }
    if (el.dataset.act === 'nick') ui.draft.child.nickname = el.value;
    if (el.dataset.act === 'note') ui.draft.wish.note = el.value;
    if (el.dataset.act === 'c-reason') ui.consult.reason = el.value;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  route(false);
})();
