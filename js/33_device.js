/* Device (v2.3)
   - Device picker on first launch (and from the menu): iPhone / iPhone Pro Max / iPad / Desktop / Auto. Sets the UI scale,
     the layout profile and the preferred orientation; "Auto" detects from the screen.
   - The game is sized from the *visual* viewport (iOS Safari toolbar, keyboard, rotation) and re-measured on every
     visualViewport change, orientation change and after iOS's late layout — so the canvas never stays stretched.
   - Pointer → canvas mapping is scale-corrected (rect size vs canvas logical size): taps land where they are drawn.
   - Phones: landscape is recommended; a rotate prompt appears in portrait unless the player picked the portrait layout,
     which restacks the game (compact HUD, world 44%, actions in a bottom sheet with big buttons).
   - Safe-area insets (notch / home indicator) padded into HUD and dock. Fullscreen + orientation lock attempted on phones. */
CP.addStrings({
  dv_title: ['على إيه بتلعب؟', 'What are you playing on?'], dv_sub: ['اختار جهازك عشان اللعبة تترتب على الشاشة بالظبط — تقدر تغيّرها من القائمة', 'Pick your device so the game fits the screen exactly — you can change it later from the menu'],
  dv_phone: ['iPhone / موبايل', 'iPhone / phone'], dv_phoneD: ['شاشة ٦ بوصة — عرضي أفضل', '6" screen — landscape recommended'], dv_max: ['iPhone Pro Max / موبايل كبير', 'iPhone Pro Max / large phone'], dv_maxD: ['شاشة ٦٫٧ بوصة — عرضي أفضل', '6.7" screen — landscape recommended'],
  dv_tab: ['iPad / تابلت', 'iPad / tablet'], dv_tabD: ['واجهة أوسع', 'Wider layout'], dv_desk: ['كمبيوتر / لابتوب', 'Desktop / laptop'], dv_deskD: ['ماوس وكيبورد', 'Mouse and keyboard'], dv_auto: ['تلقائي', 'Auto-detect'],
  dv_rotate: ['أدر الجهاز عرضياً', 'Rotate to landscape'], dv_rotSub: ['اللعبة أوضح وأسهل بالعرض', 'The game plays best in landscape'], dv_portrait: ['العب طولي', 'Play in portrait'], dv_device: ['الجهاز', 'Device'], dv_full: ['ملء الشاشة', 'Fullscreen']
});
CP.Device = {}; const DV = CP.Device, dvh = CP.h;
DV.PROFILES = { phone: { ui: 1.0, mob: true }, phonemax: { ui: 1.08, mob: true }, tablet: { ui: 1.12, mob: false }, desktop: { ui: null, mob: false } };

/* ---------- viewport-driven sizing ---------- */
DV.fitViewport = function () {
  const vv = window.visualViewport; const h = Math.round(vv ? vv.height : innerHeight), w = Math.round(vv ? vv.width : innerWidth);
  const root = document.documentElement; root.style.setProperty('--vvh', h + 'px'); root.style.setProperty('--vvw', w + 'px'); root.style.setProperty('--vvt', Math.round(vv ? vv.offsetTop : 0) + 'px');
  if (CP.UI && CP.UI.detect) CP.UI.detect(); if (CP.R && CP.R.cv) CP.R.resize(); DV.rotatePrompt();
};
{ const vv = window.visualViewport; const re = () => { DV.fitViewport(); setTimeout(DV.fitViewport, 120); setTimeout(DV.fitViewport, 450); };
  if (vv) { vv.addEventListener('resize', re); vv.addEventListener('scroll', re); } window.addEventListener('orientationchange', re); window.addEventListener('resize', re); window.addEventListener('load', re); }

/* ---------- scale-corrected pointer mapping ---------- */
{ const pick = CP.R.pick; CP.R.pick = function (px, py) { const cv = this.cv; if (cv) { const r = cv.getBoundingClientRect(); if (r.width && r.height) { px *= this.W / r.width; py *= this.H / r.height; } } return pick.call(this, px, py); }; }
{ const tw = CP.R.toWorld; CP.R.toWorld = function (px, py) { return tw.call(this, px, py); }; }

/* ---------- device profile ---------- */
DV.apply = function () {
  const d = CP.S.device || 'auto'; const html = document.documentElement; for (const k of ['phone', 'phonemax', 'tablet', 'desktop']) html.classList.toggle('dev-' + k, d === k);
  const P = DV.PROFILES[d]; if (P && P.ui != null) html.style.setProperty('--ui', String(P.ui)); else if (CP.Polish && CP.Polish.fit) CP.Polish.fit();
  html.classList.toggle('force-mob', !!(P && P.mob)); html.classList.toggle('portrait-ok', CP.S.portraitOk === true); DV.fitViewport();
};
{ const det = CP.UI.detect; CP.UI.detect = function () { const r = det.apply(this, arguments); const d = CP.S.device; if (d === 'phone' || d === 'phonemax') { document.documentElement.classList.add('mob'); CP.UI.isMob = true; } if (d === 'desktop' || d === 'tablet') { document.documentElement.classList.remove('mob'); CP.UI.isMob = false; } return r; }; }

/* ---------- picker ---------- */
DV.pick = function (first) {
  if (document.getElementById('devPick')) return; if (first && CP.G && CP.G.shift && !CP.G.shift.ended) return; /* never interrupt play */ const opt = (id, icon, t, sub) => dvh('button', { class: 'dv-opt' + ((CP.S.device || 'auto') === id ? ' on' : ''), onclick: () => { CP.S.device = id; if (id === 'phone' || id === 'phonemax') CP.S.portraitOk = false; CP.saveSettings(); CP.Audio.click(); DV.apply(); box.remove(); if (id !== 'desktop' && id !== 'auto') DV.fullscreen(); } }, dvh('span', { class: 'dv-i' }, icon), dvh('span', { class: 'dv-t' }, dvh('b', null, t), dvh('small', null, sub)));
  const box = dvh('div', { id: 'devPick', class: 'modal' }, dvh('div', { class: 'mc glass dv' }, dvh('b', { class: 'dv-title' }, CP.t('dv_title')), dvh('div', { class: 'small muted' }, CP.t('dv_sub')),
    dvh('div', { class: 'dv-grid' }, opt('phone', '📱', CP.t('dv_phone'), CP.t('dv_phoneD')), opt('phonemax', '📱', CP.t('dv_max'), CP.t('dv_maxD')), opt('tablet', '📟', CP.t('dv_tab'), CP.t('dv_tabD')), opt('desktop', '🖥️', CP.t('dv_desk'), CP.t('dv_deskD'))),
    dvh('button', { class: 'btn ghost', onclick: () => { CP.S.device = 'auto'; CP.saveSettings(); DV.apply(); box.remove(); } }, CP.t('dv_auto'))));
  document.body.appendChild(box);
};
DV.fullscreen = async () => { try { const el = document.documentElement; if (el.requestFullscreen && !document.fullscreenElement) await el.requestFullscreen(); if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (e) { } };

/* ---------- rotate prompt (phones in portrait) ---------- */
DV.rotatePrompt = function () {
  const d = CP.S.device; const isPhone = d === 'phone' || d === 'phonemax' || (d !== 'desktop' && d !== 'tablet' && CP.UI && CP.UI.isMob); const port = document.documentElement.classList.contains('port');
  const want = isPhone && port && CP.S.portraitOk !== true && CP.G && CP.G.shift && !CP.Screens.cur; let el = document.getElementById('rotate');
  if (!want) { if (el) el.remove(); return; } if (el) return;
  el = dvh('div', { id: 'rotate' }, dvh('div', { class: 'rot-icon' }, '🔄'), dvh('b', null, CP.t('dv_rotate')), dvh('div', { class: 'small' }, CP.t('dv_rotSub')), dvh('div', { class: 'row' }, dvh('button', { class: 'btn pri', onclick: () => DV.fullscreen() }, CP.t('dv_full')), dvh('button', { class: 'btn ghost', onclick: () => { CP.S.portraitOk = true; CP.saveSettings(); DV.apply(); el.remove(); } }, CP.t('dv_portrait'))));
  document.body.appendChild(el);
};
CP.bus.on('shiftStart', () => { const dp = document.getElementById('devPick'); if (dp) dp.remove(); setTimeout(DV.rotatePrompt, 300); });

/* ---------- menu hook + first launch ---------- */
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { const r = menu.apply(this, arguments); const icons = document.querySelector('.rv-icons'); if (icons && !icons.querySelector('.dv-btn')) icons.appendChild(dvh('button', { class: 'rv-ico dv-btn', onclick: () => { CP.Audio.clickSoft(); DV.pick(false); } }, dvh('span', null, '📐'), dvh('small', null, CP.t('dv_device')))); if (!CP.S.device) setTimeout(() => DV.pick(true), 600); return r; }; }
window.addEventListener('load', () => setTimeout(DV.apply, 50));
;(window.CP_FILES = window.CP_FILES || {})['33_device'] = '2.6.2';
