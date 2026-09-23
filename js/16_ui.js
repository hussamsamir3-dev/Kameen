/* UI core: HUD, dock (vehicle card + 12 contextual actions), toasts/banners/captions, input (keyboard, mouse, touch), panel frame. */
CP.addStrings({
  k_help: ['مفاتيح: ١–٩ و٠ للإجراءات • Q/E تبديل العربية • A/D مشي • N الدفتر • P الزميل • R تسجيل • T النبرة • Esc قفل • مسافة إيقاف', 'Keys: 1–9, 0 actions • Q/E cycle vehicle • A/D walk • N notebook • P partner • R record • T tone • Esc close • Space pause'],
  v_none: ['مفيش عربية مختارة', 'No vehicle selected'],
  v_prev: ['السابقة', 'Previous'], v_next: ['التالية', 'Next'],
  bay_lbl: ['منطقة التفتيش', 'Bay'], bay_free: ['فاضية', 'free'],
  queue_n: ['{n} في الطابور', '{n} queued'],
  h_flow: ['الزميل بيدير المرور', 'Partner managing traffic'],
  tone_lbl: ['النبرة', 'Tone']
});
CP.UI = { panel: null, openCase: null, holding: false, lastDock: 0, objMin: window.innerHeight < 560 || window.innerWidth < 700 };
const $ = (sel, root) => (root || document).querySelector(sel);
const h = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) { const v = attrs[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
  for (const kd of kids.flat()) { if (kd == null || kd === false) continue; e.appendChild(typeof kd === 'string' || typeof kd === 'number' ? document.createTextNode(String(kd)) : kd); }
  return e;
};
CP.h = h; CP.$ = $;
CP.UI.font = () => CP.lang === 'ar' ? getComputedStyle(document.body).fontFamily || 'Tahoma' : 'Segoe UI, Arial, sans-serif';

/* ---------- icons (UI glyphs only; all game art comes from the asset pack) ---------- */
const ICONS = {
  stop: 'M12 2.5 19 6.5v8.2c0 3.6-3 6.1-7 7.3-4-1.2-7-3.7-7-7.3V6.5Z|M9 9.5v5M12 9v6M15 9.5v5',
  wave: 'M3 12h13|M12 7l5 5-5 5|M20 5v14',
  approach: 'M12 4.5a2 2 0 1 0 0 .1|M9 21l1.8-6.2 2.7 2.4V21|M8 11.5l3.4-3 3 2.2 2.6.8|M11.4 8.5l-2.4 5.8',
  talk: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9.5L5 19.5V16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z|M7.5 9.5h9M7.5 12.5h6',
  docs: 'M3.5 6h17v12h-17Z|M6.5 9.5h4.5v5.5H6.5Z|M13.5 10h4.5M13.5 12.5h4.5M13.5 15h3',
  bay: 'M2.5 18h19|M4.5 18v-5.5l2.2-4.5h10.6l2.2 4.5V18|M4.5 13h15|M7.5 15.5h1.5M15 15.5h1.5',
  inspect: 'M10.5 10.5m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0|M15.3 15.3 21 21|M8 10.5h5M10.5 8v5',
  screen: 'M8.5 2.5h7v5h-7Z|M7 7.5h10v13.5H7Z|M10 12h4M10 15h4M10 18h2',
  radio: 'M8 7h8v14H8Z|M10 7V2.5|M10.5 11h3M10.5 14h3|M18.5 9.5a4 4 0 0 1 0 5M20.5 7.5a7 7 0 0 1 0 9',
  partner: 'M9 7.5a3 3 0 1 0 .1 0|M3 20.5v-1.5a5 5 0 0 1 10 0v1.5|M16 5.5a3 3 0 0 1 0 6|M17 14.5a4.5 4.5 0 0 1 4 4.5v1.5',
  record: 'M6 3h9l4 4v14H6Z|M15 3v4h4|M9 11h7M9 14.5h7M9 18h4',
  resolve: 'M12 2.5a9.5 9.5 0 1 0 .1 0|M7.5 12.5l3 3 6-6.5',
  pause: 'M8.5 5v14M15.5 5v14', book: 'M4 4.5h7v15.5H4Z|M13 4.5h7v15.5h-7Z|M6 8h3M15 8h3',
  gear: 'M12 9a3 3 0 1 0 .1 0|M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
  cone: 'M9.5 19.5h5l-2.5-15Z|M6 19.5h12|M10.4 14h3.2M11 10h2', wrench: 'M14.5 5.5a4 4 0 0 0 4.9 4.9l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 1-1.9-1.9Z',
  gate: 'M3.5 20.5V8h3v12.5|M6.5 11h14.5|M9 11l2 -0M12 11l2 0M17 11l2 0', bolt: 'M13.5 2 5 14h6l-1 8 8.5-12H12.5Z',
  person: 'M12 7a3 3 0 1 0 .1 0|M6.5 21v-4a5.5 5.5 0 0 1 11 0v4', alert: 'M12 3 22 20.5H2Z|M12 10v5|M12 18v.3', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7'
};
CP.icon = (n) => {
  // premium duotone icon: soft glass disc, gold gradient strokes, subtle inner highlight
  const NS = 'http://www.w3.org/2000/svg'; const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); sv.setAttribute('class', 'ico'); sv.setAttribute('aria-hidden', 'true');
  const gid = 'ig' + (CP._icoN = (CP._icoN || 0) + 1);
  sv.innerHTML = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#f3c24f"/><stop offset="1" stop-color="#b47a16"/></linearGradient></defs>`;
  const parts = (ICONS[n] || ICONS.alert).split('|');
  parts.forEach((d, i) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', i === 0 && /Z$/.test(d.trim()) ? 'rgba(243,194,79,.14)' : 'none'); p.setAttribute('stroke', `url(#${gid})`); p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); sv.appendChild(p); });
  return sv;
};

/* ---------- language / text size ---------- */
CP.UI.applyLang = function () {
  CP.lang = CP.S.lang; const html = document.documentElement;
  html.lang = CP.lang; html.dir = CP.lang === 'ar' ? 'rtl' : 'ltr';
  html.classList.remove('ts-small', 'ts-large'); if (CP.S.textSize !== 'normal') html.classList.add('ts-' + CP.S.textSize);
  document.title = CP.t('title') + ' — ' + 'كمين: وردية ليل';
};

/* ---------- messages ---------- */
CP.UI.toast = function (text, kind) {
  const box = $('#toasts'); if (!box) return;
  const el = h('div', { class: 'toast ' + (kind || ''), role: 'status' }, text);
  box.appendChild(el); while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => el.remove(), kind === 'bad' ? 6000 : 3600);
};
CP.UI.banner = function (text, kind) {
  const b = $('#banner'); if (!b) return;
  b.textContent = text; b.className = kind || ''; b.style.opacity = 1;
  clearTimeout(this._bt); this._bt = setTimeout(() => { b.style.opacity = 0; }, kind === 'emergency' ? 7000 : 4200);
};
CP.UI.caption = function (text) { const c = $('#caption'); if (!c) return; c.textContent = text; c.classList.remove('hidden'); clearTimeout(this._ct); this._ct = setTimeout(() => c.classList.add('hidden'), 2200); };
CP.UI.saveIndicator = function (text) { const e = $('#saveInd'); if (!e) return; e.textContent = '💾 ' + text; e.style.opacity = 1; clearTimeout(this._st); this._st = setTimeout(() => e.style.opacity = 0.0, 1400); };
CP.UI.radioFlash = function (st) { const e = $('#strip .radio'); if (!e) return; e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 1600); CP.UI.toast(CP.t('p_radio') + ': ' + CP.t('rv_' + st), st === 'clear' || st === 'notConfirmed' ? 'ok' : st === 'unresolved' ? 'warn' : 'bad'); };
CP.UI.confirm = function (text, yes, no) {
  const m = h('div', { class: 'modal' }, h('div', { class: 'card' }, h('div', null, text), h('div', { class: 'row' },
    h('button', { class: 'btn pri', onclick: () => { m.remove(); yes && yes(); } }, CP.t('confirm')),
    h('button', { class: 'btn', onclick: () => { m.remove(); no && no(); } }, CP.t('cancel')))));
  document.body.appendChild(m); m.querySelector('.btn.pri').focus();
};

/* ---------- game shell ---------- */
CP.UI.buildGame = function () {
  const g = $('#game'); g.innerHTML = '';
  const hud = h('header', { id: 'hud' },
    (CP.A.img.logo_checkpoint ? h('img', { class: 'brandimg', src: CP.A.img.logo_checkpoint.src, alt: 'كمين' }) : h('div', { class: 'brand' }, CP.lang === 'ar' ? 'كمين: وردية ليل' : 'CHECKPOINT: NIGHT SHIFT')),
    h('div', { class: 'rankchip', id: 'hRank', title: CP.t('pr_rank') }),
    h('div', { class: 'combo', id: 'hCombo' }),
    h('div', { class: 'hi' }, h('b', { id: 'hShift' }), h('span', null, CP.t('h_shift'))),
    h('div', { class: 'hi' }, h('b', { id: 'hClock' }), h('span', { id: 'hLeft' })),
    h('div', { class: 'hi' }, h('b', { id: 'hQueue' }), h('span', null, CP.t('h_queue'))),
    h('div', { class: 'hi opt' }, h('b', { id: 'hTrust' }), h('span', null, CP.t('h_trust'))),
    h('div', { class: 'hi gate' }, h('span', { class: 'dot', id: 'hGateDot' }), h('div', { class: 'hi' }, h('b', { id: 'hGate' }), h('span', null, CP.t('a_gate')))),
    h('div', { class: 'hi opt' }, h('b', { id: 'hPartner' }), h('span', null, CP.t('h_partner'))),
    h('div', { class: 'sp' }), h('span', { id: 'saveInd', class: 'small muted', style: 'opacity:0;transition:opacity .6s' }),
    h('button', { class: 'ib', id: 'qmBtn', title: CP.t('qm_title'), 'aria-label': CP.t('qm_title'), onclick: e => { e.stopPropagation(); CP.UI.quickMenu(); } }, '🔊'),
    h('button', { class: 'ib', title: CP.t('h_notebook') + ' (N)', 'aria-label': CP.t('h_notebook'), onclick: () => CP.UI.open('notebook') }, CP.icon('book')),
    h('button', { class: 'ib', title: CP.t('h_pause') + ' (Space)', 'aria-label': CP.t('h_pause'), onclick: () => CP.Screens.pause() }, CP.icon('pause')));
  const stage = h('main', { id: 'stage' }, h('canvas', { id: 'cv', 'aria-label': CP.t('title') }), h('div', { id: 'speed', class: 'hidden' }), h('div', { id: 'banner', style: 'opacity:0' }), h('div', { id: 'ctx' }), h('div', { id: 'tut', class: 'hidden' }), h('div', { id: 'objBox' }), h('div', { id: 'caption', class: 'hidden' }), h('div', { id: 'toasts' }));
  const strip = h('section', { id: 'strip' }, h('span', { class: 'lbl' }, CP.t('p_radio')), h('span', { class: 'radio', id: 'radioLine' }, '—'), h('span', { id: 'bayLine', class: 'small' }), h('span', { id: 'equipLine', class: 'small muted' }));
  const dock = h('footer', { id: 'dock' }, h('div', { id: 'vcard' }), h('div', { id: 'actions' }));
  g.append(hud, stage, strip, dock, h('div', { id: 'panel', class: 'hidden' }));
  // actions
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'P', 'R', '0'];
  const icons = { stop: 'stop', wave: 'wave', approach: 'approach', talk: 'talk', docs: 'docs', bay: 'bay', inspect: 'inspect', screen: 'screen', radio: 'radio', partner: 'partner', record: 'record', resolve: 'resolve' };
  const box = $('#actions');
  CP.Act.order.forEach((id, i) => {
    const b = h('button', { class: 'act', 'data-a': id, onclick: () => { CP.Audio.unlock(); CP.Act.run(id); CP.UI.refreshDock(true); } }, h('span', { class: 'k' }, keys[i]), CP.icon(icons[id]), h('span', { class: 't' }), h('span', { class: 's' }));
    box.appendChild(b);
  });
  CP.R.init($('#cv')); CP.R.resize();
  if (window.ResizeObserver) { if (CP.UI._ro) CP.UI._ro.disconnect(); CP.UI._ro = new ResizeObserver(() => CP.R.resize()); CP.UI._ro.observe($('#stage')); }
  requestAnimationFrame(() => CP.R.resize());
  CP.Input.bindCanvas($('#cv'));
  CP.UI.refreshDock(true); CP.UI.refreshHud();
};

CP.UI.refreshHud = function () {
  const s = CP.G && CP.G.shift; if (!s || !$('#hShift')) return;
  CP.UI.refreshProg();
  $('#hShift').textContent = CP.num(s.no) + ' • ' + CP.t('loc_' + s.loc).split(' — ')[0];
  $('#hClock').textContent = CP.num(CP.gameClock());
  $('#hLeft').textContent = CP.num(CP.fmtTime(Math.max(0, s.dur - s.t)));
  const q = s.vehicles.filter(v => v.caseId && !s.cases[v.caseId].res && v.row === 0).length;
  $('#hQueue').textContent = CP.num(q) + (s.backlog ? ' ' + CP.t('h_offscreen', { n: CP.num(s.backlog) }) : '');
  $('#hTrust').textContent = CP.num(Math.round(CP.G.career.trust));
  const g = s.gate; $('#hGate').textContent = CP.t('g_' + (g.jam ? 'jammed' : g.state)) + (g.manualOp ? ' • ' + CP.t('g_manual') : '');
  $('#hGateDot').className = 'dot ' + (g.jam ? 'bad' : g.state === 'closed' ? '' : 'am');
  const pt = CP.Actors.partnerTask();
  $('#hPartner').textContent = pt ? CP.t('pt_' + pt.data.kind).slice(0, 26) : CP.t('h_idle');
  // strip
  const last = s.radio[s.radio.length - 1]; $('#radioLine').textContent = last ? CP.num(CP.fmtTime(last.t)) + ' — ' + CP.L(last.text) : '—';
  const bay = s.bay || {}; const cap = CP.G.career.upgrades.bay >= 1 ? ['A', 'B'] : ['A'];
  $('#bayLine').textContent = CP.t('bay_lbl') + ': ' + cap.map(k => bay[k] ? (CP.caseOf(bay[k]) || {}).id || '•' : CP.t('bay_free')).join(' / ');
  const e = s.equipment; $('#equipLine').textContent = CP.t('sc_supplies', { m: CP.num(e.mouth), k: CP.num(e.kits), g: CP.num(e.gloves), b: CP.num(e.bags) });
  // speed indicator
  const sp = $('#speed'); const ts = CP.Main.timeScale();
  if (CP.Events.emergency()) { sp.className = 'em'; sp.textContent = CP.t('h_emergency'); }
  else if (ts < 1 && ts > 0) { sp.className = ''; sp.textContent = CP.t('h_speedRead'); }
  else if (ts === 0 && CP.UI.panel) { sp.className = ''; sp.textContent = CP.t('h_paused'); }
  else if (s.flow === 'flow') { sp.className = ''; sp.textContent = CP.t('h_flow'); }
  else sp.className = 'hidden';
};

CP.UI.refreshDock = function (force) {
  const s = CP.G && CP.G.shift; if (!s || !$('#vcard')) return;
  const now = performance.now(); if (!force && now - this.lastDock < 180) return; this.lastDock = now;
  const v = CP.Act.curV(), c = CP.Act.curC();
  const vc = $('#vcard'); const key = v ? v.id + ':' + v.st + ':' + (c ? c.k.cuesSeen.length + ':' + !!c.res + c.k.docsViewed : '') + CP.lang + Math.floor((c ? (s.t - (c.k.markerT ?? c.spawnT)) : 0) / 5) + (s.events.dustUntil > s.t) : 'none' + CP.lang;
  if (vc.dataset.k !== key) {
    vc.dataset.k = key; vc.innerHTML = '';
    const cyc = h('div', { class: 'cyc' }, h('button', { class: 'btn sm ghost', 'aria-label': CP.t('v_prev'), title: 'Q', onclick: () => CP.UI.cycle(-1) }, CP.icon(CP.lang === 'ar' ? 'right' : 'left')), h('button', { class: 'btn sm ghost', 'aria-label': CP.t('v_next'), title: 'E', onclick: () => CP.UI.cycle(1) }, CP.icon(CP.lang === 'ar' ? 'left' : 'right')));
    if (!v) { vc.append(h('div', { class: 'full' }, h('div', { class: 'lbl' }, CP.t('c_select')), h('div', { class: 'muted small' }, CP.t('c_selectHelp'))), h('div', { class: 'full' }, cyc)); }
    else {
      const th = CP.A.vehicleThumb(v.type, 96, 44); th.classList.add('th');
      const dust = s.events.dustUntil > s.t && !CP.Act.nearVeh(v, 4);
      const plate = c ? (dust ? h('span', { class: 'muted small' }, CP.t('c_plateUnreadable')) : h('span', { class: 'plate' }, CP.plateStr(c.plate))) : null;
      const wait = c ? CP.fmtTime(s.t - (c.k.markerT ?? c.spawnT)) : '';
      vc.append(th, h('div', { class: 'nm' }, CP.t('v_' + v.type) + (c ? ' • ' + c.id : '')), h('div', null, plate),
        h('div', { class: 'small muted' }, c ? CP.t('st_' + (c.res ? (v.st === 'held' ? 'held' : 'closed') : (v.st === 'marker' ? 'marker' : v.st === 'stopped' ? 'stopped' : v.st === 'toBay' ? 'toBay' : v.st === 'bay' ? 'bay' : v.st === 'leaving' ? 'leaving' : v.x < 0 ? 'approach' : 'queue'))) + ' • ' + CP.t('c_wait') + ' ' + CP.num(wait) : CP.t('cls_service')));
      if (c) {
        const V = CP.C.veh[c.type]; const paxTxt = V.cls === 'passenger' || c.pax ? CP.num(c.pax) + ' ' + CP.t('c_pax') : '';
        const seen = c.k.cuesSeen.map(q => CP.L(CP.C.cues[q]));
        vc.append(h('div', { class: 'full small muted' }, paxTxt), h('div', { class: 'full small cues' }, seen.length ? h('span', null, h('b', { style: 'color:var(--amber)' }, CP.t('c_notice') + ': '), seen.join(' • ')) : ''));
      }
      vc.append(h('div', { class: 'full' }, cyc));
    }
  }
  // actions
  const hot = CP.UI.hot();
  for (const b of document.querySelectorAll('#actions .act[data-a]')) {
    const id = b.dataset.a; const def = CP.Act.defs[id];
    const lab = def.label ? CP.t(def.label(v, c)) : CP.t('a_' + id);
    const a = CP.Act.avail(id);
    b.querySelector('.t').textContent = lab;
    b.querySelector('.s').textContent = a.ok ? CP.t('a_' + id + '_s') : a.reason;
    b.setAttribute('aria-disabled', a.ok ? 'false' : 'true');
    b.title = lab + (a.ok ? '' : ' — ' + a.reason);
    b.classList.toggle('hot', a.ok && hot.indexOf(id) >= 0);
  }
  // contextual actions
  const cx = $('#ctx'); const list = CP.Act.ctx(); const ck = list.map(a => a.id + a.near + a.label).join('|') + CP.lang;
  if (cx.dataset.k !== ck) {
    cx.dataset.k = ck; cx.innerHTML = '';
    for (const a of list) cx.appendChild(h('button', { class: 'btn' + (a.near ? ' near' : ''), onclick: () => { CP.Audio.unlock(); CP.Act.ctxRun(a.id); } }, CP.icon(a.icon), a.near ? CP.t(a.label) : CP.t(a.label) + ' ← ' + CP.t(a.go)));
  }
};
/* suggested next steps (highlight only; never automatic) */
CP.UI.hot = function () {
  const v = CP.Act.curV(), c = CP.Act.curC(); if (!v || !c || c.res) return [];
  if (v.st === 'marker') return ['stop', 'wave'];
  if (v.st === 'stopped' && !c.k.approached) return ['approach'];
  if (!c.k.docsHave) return ['docs'];
  if (!c.k.docsViewed) return ['docs'];
  return ['resolve'];
};
CP.UI.cycle = function (d) {
  const s = CP.G.shift; const list = s.vehicles.filter(v => v.x > -1).sort((a, b) => (a.row - b.row) || (b.x - a.x));
  if (!list.length) return; const i = list.findIndex(v => v.id === s.selected);
  const n = list[(i + d + list.length) % list.length]; CP.Act.select(n.id); CP.UI.refreshDock(true);
};
/* auto-select the vehicle arriving at the marker when nothing relevant is selected */
CP.bus.on('atMarker', v => {
  const s = CP.G.shift; const cur = CP.Act.curV(); const cc = CP.Act.curC();
  if (!cur || (cc && cc.res) || (cur.st !== 'stopped' && cur.st !== 'bay' && cur.st !== 'toBay')) CP.Act.select(v.id);
  CP.UI.refreshDock(true);
});
CP.bus.on('despawn', () => CP.UI.refreshDock(true));

/* ---------- panels ---------- */
CP.UI.READING = ['dialogue', 'docs', 'notebook', 'resolve', 'record', 'visitor', 'partner'];
CP.UI.open = function (kind, caseId) {
  const s = CP.G.shift; if (!s || s.ended) return;
  CP.UI.panel = { kind, caseId: caseId || null, scroll: 0 };
  CP.UI.openCase = caseId || null;
  if (caseId) { const c = s.cases[caseId]; if (c && kind === 'docs') c.k.docsViewed = true; }
  if (kind === 'dialogue') CP.Audio.duck(true);
  CP.UI.renderPanel();
  CP.bus.emit('panel', kind);
};
CP.UI.close = function () {
  if (!CP.UI.panel) return;
  CP.UI.panel = null; CP.UI.openCase = null; CP.Audio.duck(false);
  const p = $('#panel'); p.classList.add('hidden'); p.innerHTML = '';
  CP.UI.sheetSpace();
  CP.UI.refreshDock(true); CP.bus.emit('panelClose');
};
CP.UI.renderPanel = function () {
  const P0 = CP.UI.panel; const root = $('#panel'); if (!P0 || !root) return;
  const s = CP.G.shift; const c = P0.caseId ? s.cases[P0.caseId] : null;
  const old = root.querySelector('.pb'); const keepScroll = old ? [...old.querySelectorAll('.scroll')].map(e => e.scrollTop) : [];
  root.innerHTML = ''; root.classList.remove('hidden');
  const titleKey = { dialogue: 'p_dialogue', docs: 'p_docs', search: 'p_search', screen: 'p_screen', notebook: 'p_notebook', resolve: 'p_resolve', partner: 'p_partner', radio: 'p_radio', record: 'p_record', visitor: 'a_visitor' }[P0.kind];
  const body = h('div', { class: 'pb scroll' }); const foot = h('div', { class: 'pf' });
  const head = h('div', { class: 'ph' }, h('h2', null, CP.t(titleKey)), c ? h('span', { class: 'tag am' }, c.id) : null, c ? h('span', { class: 'small muted' }, CP.t('v_' + c.type)) : null,
    h('button', { class: 'btn sm x', onclick: () => CP.UI.close(), 'aria-label': CP.t('close') }, '✕ ' + CP.t('close')));
  const pw = h('div', { class: 'pw', role: 'dialog', 'aria-label': CP.t(titleKey) }, head, body, foot);
  root.appendChild(pw);
  CP.UI.addGrip(pw);
  try { CP.Panels[P0.kind](body, foot, c); } catch (e) { console.error(e); body.appendChild(h('div', { class: 'notice bad' }, String(e.message))); }
  if (!foot.children.length) foot.remove();
  const sc = [...body.querySelectorAll('.scroll')]; sc.forEach((e, i) => { if (e.dataset.stick === 'bottom') e.scrollTop = e.scrollHeight; else if (keepScroll[i] != null) e.scrollTop = keepScroll[i]; });
  if (old && keepScroll.length) body.scrollTop = old.scrollTop;
};
/* live bits (progress bars/timers) update without rebuilding */
CP.UI.tickPanel = function () {
  for (const e of document.querySelectorAll('[data-task]')) {
    const t = CP.Tasks.get(e.dataset.task);
    if (!t) { e.dataset.task = ''; CP.UI.renderPanel(); return; }
    const bar = e.querySelector('i'); if (bar) bar.style.width = (CP.Tasks.progress(t) * 100).toFixed(1) + '%';
    const lab = e.querySelector('.tt'); if (lab) lab.textContent = t.paused ? CP.t('paused_away') : CP.t(e.dataset.fmt || 'working', { s: CP.num(Math.ceil(CP.Tasks.remaining(t))) });
  }
};
let refreshQ = 0;
CP.UI.queueRefresh = function () { if (!CP.UI.panel || CP.UI.holding) return; clearTimeout(refreshQ); refreshQ = setTimeout(() => CP.UI.renderPanel(), 30); };
['note', 'dialogue', 'taskDone', 'verification', 'searchDone', 'caseClosed', 'partner'].forEach(e => CP.bus.on(e, () => CP.UI.queueRefresh()));

/* ---------- input ---------- */
CP.Input = { axis: 0, vert: 0, keys: {} };
CP.Input.bindKeys = function () {
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
    CP.Audio.unlock();
    const k = e.key; const inGame = CP.G && CP.G.shift && !CP.G.shift.ended && !$('#game').classList.contains('hidden') && !CP.Screens.overlayOpen();
    if (k === 'Escape') { if ($('.modal')) { $('.modal').remove(); return; } if (CP.UI.panel) { CP.UI.close(); e.preventDefault(); return; } if (CP.Screens.overlayOpen()) { CP.Screens.back(); return; } if (inGame) CP.Screens.pause(); return; }
    if (!inGame) return;
    if (k === ' ') { e.preventDefault(); CP.Screens.pause(); return; }
    const l = k.toLowerCase();
    if (!CP.UI.panel) {
      if (l === 'a' || k === 'ArrowLeft') { CP.Input.keys.l = 1; e.preventDefault(); }
      if (l === 'd' || k === 'ArrowRight') { CP.Input.keys.r = 1; e.preventDefault(); }
      if (l === 'w' || k === 'ArrowUp') { CP.Input.keys.u = 1; e.preventDefault(); }
      if (l === 's' || k === 'ArrowDown') { CP.Input.keys.d = 1; e.preventDefault(); }
      if (l === 'q') CP.UI.cycle(-1); if (l === 'e') CP.UI.cycle(1);
      const map = { '1': 'stop', '2': 'wave', '3': 'approach', '4': 'talk', '5': 'docs', '6': 'bay', '7': 'inspect', '8': 'screen', '9': 'radio', '0': 'resolve', p: 'partner', r: 'record' };
      if (map[l]) { CP.Act.run(map[l]); CP.UI.refreshDock(true); }
    } else if (CP.UI.panel.kind === 'dialogue' && /^[1-9]$/.test(k)) { const b = document.querySelectorAll('#panel .opts .btn')[+k - 1]; if (b) b.click(); }
    if (l === 'n') { CP.UI.panel && CP.UI.panel.kind === 'notebook' ? CP.UI.close() : CP.UI.open('notebook', CP.Act.curC() ? CP.Act.curC().id : null); }
    if (l === 't') { const o = ['calm', 'direct', 'firm']; CP.Act.tone = o[(o.indexOf(CP.Act.tone) + 1) % 3]; CP.UI.toast(CP.t('tone_lbl') + ': ' + CP.t('tone_' + CP.Act.tone)); CP.UI.queueRefresh(); }
    CP.Input.sync();
  });
  window.addEventListener('keyup', e => { const l = e.key.toLowerCase(); if (l === 'a' || e.key === 'ArrowLeft') CP.Input.keys.l = 0; if (l === 'd' || e.key === 'ArrowRight') CP.Input.keys.r = 0; if (l === 'w' || e.key === 'ArrowUp') CP.Input.keys.u = 0; if (l === 's' || e.key === 'ArrowDown') CP.Input.keys.d = 0; CP.Input.sync(); });
  window.addEventListener('blur', () => { CP.Input.keys = {}; CP.Input.sync(); });
};
CP.Input.sync = function () { const k = this.keys; this.axis = (k.r ? 1 : 0) - (k.l ? 1 : 0); this.vert = (k.d ? 1 : 0) - (k.u ? 1 : 0); };
CP.Input.bindCanvas = function (cv) {
  let down = null; const pts = new Map(); let pinch = null;
  // strategy-game camera: wheel zoom, screen-edge pan, pinch zoom and drag pan on touch
  cv.addEventListener('wheel', e => { e.preventDefault(); CP.R.userZoom = CP.clamp((CP.R.userZoom || 1) * Math.exp(-e.deltaY * 0.0012), 0.55, 2.4); }, { passive: false });
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); const x = e.clientX - r.left;
    CP.R.edge = (e.pointerType === 'mouse' && !CP.UI.panel) ? (x < 45 ? -(1 - x / 45) : x > r.width - 45 ? (1 - (r.width - x) / 45) : 0) : 0;
  });
  cv.addEventListener('pointerleave', () => { CP.R.edge = 0; });
  cv.addEventListener('dblclick', () => { CP.R.userZoom = 1; CP.R.camFree = null; CP.R.panY = 0; });
  cv.addEventListener('pointerdown', e => { CP.Audio.unlock(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { const [a1, b1] = [...pts.values()]; pinch = { d: Math.hypot(a1.x - b1.x, a1.y - b1.y), z: CP.R.userZoom || 1 }; down = null; return; }
    down = { x: e.clientX, y: e.clientY, cam: CP.R.camX, py: CP.R.panY || 0, moved: false }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) { const [a1, b1] = [...pts.values()]; const d = Math.hypot(a1.x - b1.x, a1.y - b1.y); CP.R.userZoom = CP.clamp(pinch.z * (d / Math.max(20, pinch.d)), 0.55, 2.4); return; }
    if (!down) return; const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { down.moved = true; if (CP.R.span < 38.4) CP.R.camFree = down.cam - dx / CP.R.ppm; CP.R.panY = CP.clamp((down.py || 0) + dy / CP.R.ppm, -2.5, 4); }
  });
  cv.addEventListener('pointerup', e => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (!down) return; const moved = down.moved; down = null;
    if (moved) { clearTimeout(CP.Input._camT); CP.Input._camT = setTimeout(() => { CP.R.camFree = null; }, 3500); return; }
    if (!CP.G || !CP.G.shift || CP.G.shift.ended) return;
    const r = cv.getBoundingClientRect(); const p = CP.R.pick(e.clientX - r.left, e.clientY - r.top);
    if (p.fix) { // repair straight from the flashing icon: short remote repair, no walking needed
      if (CP.UI._fixing) return; CP.UI._fixing = true; CP.Audio.click(); CP.Audio.tone('sine', 520, 0.25, 0.03);
      CP.UI.toast(CP.t(p.fix === 'generator' ? 'fix_gen_now' : 'fix_gate_now'), 'info');
      setTimeout(() => { CP.UI._fixing = false; const s2 = CP.G && CP.G.shift; if (!s2) return;
        if (p.fix === 'generator' && s2.equipment.generator !== 'ok') CP.Events.generatorFixed();
        if (p.fix === 'repair' && s2.gate.jam) CP.Events.gateRepaired();
        CP.Audio.chime('good'); }, 1600);
      return; }
    if (p.veh) { const s = CP.G.shift; if (s.selected === p.veh) { const v = CP.T.get(p.veh); const c = CP.Act.curC(); if (c && !c.res && (v.st === 'stopped' || v.st === 'bay') && !c.k.approached) CP.Act.run('approach'); } CP.Act.select(p.veh); CP.UI.refreshDock(true); }
    else if (p.ground) { CP.R.camFree = null; CP.Actors.walkTo(p.ground.x, p.ground.row); }
  });
  cv.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; down = null; });
};

/* ---------- progression HUD ---------- */
CP.addStrings({ fix_gen_now: ['⚡ جاري تشغيل المولد…', '⚡ Restarting the generator…'], fix_gate_now: ['🔧 جاري إصلاح البوابة…', '🔧 Repairing the gate…'], qm_title: ['الصوت والكاميرا', 'Sound & camera'], qm_music: ['الموسيقى', 'Music'], qm_next: ['المقطوعة الجاية ⏭', 'Next track ⏭'], qm_cam: ['الكاميرا', 'Camera'], cam_auto: ['زووم تلقائي', 'Auto zoom'], cam_close: ['قريب', 'Close'], cam_wide: ['واسع', 'Wide'] });
CP.UI.refreshProg = function () {
  const s = CP.G.shift, car = CP.G.career; if (!s.prog || !$('#hRank')) return;
  const xp = car.xp + s.prog.xp; const ri = CP.Prog.rankOf(xp); const R = CP.Prog.RANKS; const nx = R[ri + 1];
  const pct = nx ? (xp - R[ri].xp) / (nx.xp - R[ri].xp) * 100 : 100;
  const key = ri + ':' + Math.floor(pct) + CP.lang;
  const el = $('#hRank');
  if (el.dataset.k !== key) { el.dataset.k = key; el.innerHTML = CP.Prog.badge(ri, 34) + `<div class="rk"><b>${CP.Prog.rankName(ri)}</b><div class="xpbar"><i style="width:${pct.toFixed(1)}%"></i></div><span>${CP.num(xp)} ${CP.t('pr_xp')}</span></div>`; }
  const cb = $('#hCombo'); const n = s.prog.combo;
  cb.className = 'combo' + (n >= 2 ? ' on' : '') + (n >= 5 ? ' hot' : '');
  const ck = n + CP.lang; if (cb.dataset.k !== ck) { cb.dataset.k = ck; cb.innerHTML = n >= 2 ? `<span class="fl">🔥</span><b>×${CP.num(n)}</b><small>${CP.t('pr_combo')}</small>` : ''; if (n >= 2) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); } }
  const ob = $('#objBox'); const ok = s.prog.objs.map(o => o.id + (o.done ? 1 : 0) + CP.Prog.objProgress(s, o)).join() + CP.lang + (CP.UI.objMin ? 'm' : '');
  if (ob.dataset.k !== ok) {
    ob.dataset.k = ok; ob.innerHTML = '';
    ob.appendChild(h('button', { class: 'oh', onclick: () => { CP.UI.objMin = !CP.UI.objMin; ob.dataset.k = ''; CP.UI.refreshProg(); } }, '🎯 ' + CP.t('pr_objectives') + ' ' + CP.num(s.prog.objs.filter(o => o.done).length) + '/' + CP.num(s.prog.objs.length)));
    if (!CP.UI.objMin) for (const o of s.prog.objs) { const d = CP.Prog.OBJ[o.id]; const p = CP.Prog.objProgress(s, o); ob.appendChild(h('div', { class: 'ob' + (o.done ? ' done' : '') }, h('span', null, o.done ? '✓' : '○'), h('span', { class: 'ot' }, CP.L(d.t)), h('span', { class: 'op' }, CP.num(p) + '/' + CP.num(d.goal)))); }
  }
};
CP.UI.xpPulse = function () { const e = $('#hRank'); if (!e) return; e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); };
CP.UI.medalQ = [];
CP.UI.medal = function (a) { CP.UI.medalQ.push(a); if (CP.UI.medalQ.length === 1) CP.UI.medalShow(); };
CP.UI.medalShow = function () {
  const a = CP.UI.medalQ[0]; if (!a) return;
  setTimeout(() => { CP.UI.medalQ.shift(); CP.UI.medalShow(); }, 4400);
  const m = h('div', { class: 'medal' }, h('div', { class: 'mi' }, a.i), h('div', null, h('div', { class: 'lbl' }, CP.t('pr_ach')), h('b', null, CP.L(a.t)), h('div', { class: 'small muted' }, CP.L(a.d))));
  document.body.appendChild(m); setTimeout(() => m.classList.add('out'), 3600); setTimeout(() => m.remove(), 4300);
  if (CP.R && CP.R.W) CP.R.confetti(50, CP.R.W / 2, CP.R.H * 0.25);
};
CP.UI.quickMenu = function () {
  const old = $('#qm'); if (old) { old.remove(); return; }
  const S = CP.S;
  const sl = (k, lbl) => { const i = h('input', { type: 'range', min: 0, max: 1, step: 0.05, 'aria-label': CP.t(lbl) }); i.value = S[k]; i.addEventListener('input', () => { S[k] = +i.value; CP.saveSettings(); CP.Audio.apply(); }); return h('label', { class: 'qrow' }, h('span', null, CP.t(lbl)), i); };
  const seg = (k, opts) => h('div', { class: 'seg' }, ...opts.map(([v, l]) => h('button', { class: S[k] === v ? 'on' : '', onclick: e => { S[k] = v; CP.saveSettings(); CP.Audio.apply(); e.target.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('on')); e.target.classList.add('on'); } }, CP.t(l))));
  const box = h('div', { id: 'qm', class: 'qm', onclick: e => e.stopPropagation() }, h('div', { class: 'lbl' }, CP.t('qm_title')),
    sl('music', 'qm_music'), sl('amb', 'set_amb'), sl('sfx', 'set_sfx'), sl('master', 'set_master'),
    h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => CP.Audio.music.next() }, CP.t('qm_next')), seg('mute', [[false, 'set_on'], [true, 'set_mute']])),
    h('div', { class: 'lbl' }, CP.t('qm_cam')), seg('camZoom', [['auto', 'cam_auto'], ['close', 'cam_close'], ['wide', 'cam_wide']]));
  document.body.appendChild(box);
  setTimeout(() => document.addEventListener('click', function f() { box.remove(); document.removeEventListener('click', f); }), 0);
};
/* subtle UI sounds */
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('button'); if (b) { if (b.getAttribute('aria-disabled') === 'true') CP.Audio.deny(); else CP.Audio.click(); } }, true);

/* ---------- device detection & adjustable panel sheet on phones ---------- */
CP.addStrings({ sh_min: ['صغّر — شوف الطريق', 'Minimise — see the road'], sh_max: ['كبّر', 'Expand'], sh_drag: ['اسحب لتغيير الحجم', 'Drag to resize'] });
CP.UI.detect = function () {
  const html = document.documentElement; const vv = window.visualViewport;
  const w = vv ? vv.width : innerWidth, h = vv ? vv.height : innerHeight;
  const mq = q => !!(window.matchMedia && matchMedia(q).matches);
  const coarse = mq('(pointer: coarse)');
  const mob = Math.min(w, h) < 560 || (coarse && Math.max(w, h) < 1100);
  // orientation from the media query first (iOS reports stale sizes during rotation), sizes as fallback
  const land = mq('(orientation: landscape)') || (!mq('(orientation: portrait)') && w >= h);
  const changed = CP.UI.isLand !== land || CP.UI.isMob !== mob;
  html.classList.toggle('mob', mob); html.classList.toggle('land', land); html.classList.toggle('port', !land);
  CP.UI.isMob = mob; CP.UI.isLand = land;
  if (changed && CP.UI.panel) CP.UI.renderPanel();
  if (changed && CP.R && CP.R.cv) CP.R.resize();
};
CP.UI.redetect = function () { CP.UI.detect(); clearTimeout(CP.UI._dt); CP.UI._dt = setTimeout(() => { CP.UI.detect(); if (CP.R && CP.R.cv) CP.R.resize(); }, 350); };
window.addEventListener('resize', CP.UI.redetect);
window.addEventListener('orientationchange', CP.UI.redetect);
if (window.visualViewport) visualViewport.addEventListener('resize', CP.UI.redetect);
if (window.matchMedia) { const m = matchMedia('(orientation: landscape)'); if (m.addEventListener) m.addEventListener('change', CP.UI.redetect); else if (m.addListener) m.addListener(CP.UI.redetect); }
CP.UI.detect();
CP.UI.VH = (window.CSS && CSS.supports && CSS.supports('height', '1dvh')) ? 'dvh' : 'vh';
CP.UI.VW = (window.CSS && CSS.supports && CSS.supports('width', '1dvw')) ? 'dvw' : 'vw';
CP.UI.sheetSpace = function () {
  // portrait phones: the road view shrinks to the space above the sheet, so nothing is hidden under it
  const html = document.documentElement; const pw = document.querySelector('#panel .pw');
  const on = !!(pw && CP.UI.panel && CP.UI.isMob && !CP.UI.isLand);
  html.classList.toggle('sheet-open', on);
  html.classList.toggle('panel-open', !!(pw && CP.UI.panel && CP.UI.isMob));
  if (on) html.style.setProperty('--sheetPx', Math.round(pw.getBoundingClientRect().height) + 'px');
};
CP.UI.applySheet = function () {
  const pw = document.querySelector('#panel .pw'); if (!pw || !CP.UI.isMob) { CP.UI.sheetSpace(); return; }
  const S = CP.S.sheet || {}; pw.classList.toggle('min', !!CP.UI.sheetMin);
  if (CP.UI.isLand) pw.style.setProperty('--sheetW', CP.clamp(S.w || 0.58, 0.4, 0.8) * 100 + CP.UI.VW);
  else pw.style.setProperty('--sheetH', CP.clamp(S.h || 0.6, 0.3, 0.86) * 100 + CP.UI.VH);
  requestAnimationFrame(() => CP.UI.sheetSpace());
};
CP.UI.addGrip = function (pw) {
  if (!CP.UI.isMob) return;
  const grip = h('div', { class: 'grip', title: CP.t('sh_drag'), 'aria-hidden': 'true' }, h('i'));
  pw.prepend(grip);
  let st = null;
  grip.addEventListener('pointerdown', e => { e.preventDefault(); grip.setPointerCapture(e.pointerId); st = { x: e.clientX, y: e.clientY, w: pw.getBoundingClientRect().width, hh: pw.getBoundingClientRect().height }; CP.UI.sheetMin = false; pw.classList.remove('min'); });
  grip.addEventListener('pointermove', e => {
    if (!st) return; const S = CP.S.sheet = CP.S.sheet || {};
    if (CP.UI.isLand) { const rtl = document.documentElement.dir === 'rtl'; const dx = (e.clientX - st.x) * (rtl ? 1 : -1); S.w = CP.clamp((st.w + dx) / innerWidth, 0.4, 0.8); }
    else { const dy = st.y - e.clientY; S.h = CP.clamp((st.hh + dy) / innerHeight, 0.3, 0.86); }
    CP.UI.applySheet();
  });
  const end = () => { if (st) { st = null; CP.saveSettings(); } };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', () => { CP.UI.sheetMin = !CP.UI.sheetMin; CP.UI.applySheet(); });
  const head = pw.querySelector('.ph');
  if (head) head.insertBefore(h('button', { class: 'btn sm ghost shmin', 'aria-label': CP.t('sh_min'), title: CP.t('sh_min'), onclick: () => { CP.UI.sheetMin = !CP.UI.sheetMin; CP.UI.applySheet(); } }, CP.UI.sheetMin ? '▴' : '▾'), head.querySelector('.x'));
  CP.UI.applySheet();
};
/* free (uncovered) part of the road view while a sheet is open on a phone — the camera frames the car there */
CP.UI.freeArea = function () {
  if (!CP.UI.isMob || !CP.UI.panel) return null;
  const pw = document.querySelector('#panel .pw'), st = document.getElementById('stage'); if (!pw || !st) return null;
  const a = st.getBoundingClientRect(), b = pw.getBoundingClientRect();
  let x0 = 0, x1 = a.width, y0 = 0, y1 = a.height;
  if (b.bottom <= a.top || b.top >= a.bottom || b.right <= a.left || b.left >= a.right) return null;
  if (CP.UI.isLand && b.height > a.height * 0.6) { if (b.left > a.left + a.width * 0.3) x1 = b.left - a.left; else x0 = b.right - a.left; }
  else y1 = Math.max(40, b.top - a.top);
  return { x0, x1, y0, y1 };
};
;(window.CP_FILES = window.CP_FILES || {})['16_ui'] = '2.2.1';
