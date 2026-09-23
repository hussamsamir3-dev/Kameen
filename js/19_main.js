/* Boot + fixed-timestep loop (60 Hz simulation, interpolated rendering). */
CP.Main = { running: false, acc: 0, last: 0, DT: 1 / 60, saveT: 0, uiT: 0 };
const M = CP.Main;

M.timeScale = function () {
  const s = CP.G && CP.G.shift; if (!s || s.ended) return 0;
  if (CP.Screens.cur) return 0;
  if (CP.FX && CP.FX.hold) return 0;
  if (CP.R.cine) return 0.3;
  if (CP.UI.holding) return 1;
  if (CP.UI.panel && CP.UI.READING.indexOf(CP.UI.panel.kind) >= 0 && !CP.Events.emergency()) {
    return CP.S.readMode === 'pause' ? 0 : CP.S.readMode === 'off' ? 1 : 0.35;
  }
  return 1;
};

M.step = function (dt) {
  const s = CP.G.shift;
  s.t += dt;
  CP.Actors.update(dt);
  CP.T.step(dt);
  CP.Gate.update(dt);
  CP.Tasks.update(dt);
  CP.Events.spawnTick(dt);
  CP.Events.update(dt);
  CP.Actors.partnerTraffic(dt);
  CP.T.far(dt);
  if (s.officer.torchT > 0) s.officer.torchT -= dt;
  // barrier closing on approaching traffic → the officer turns to the incoming lane (left) and raises the stop hand
  const g = s.gate, o = s.officer;
  if (g.state === 'closing' && M.lastGate !== 'closing') {
    const incoming = s.vehicles.some(v => v.row === 0 && !v.cleared && v.caseId && v.x < CP.W.marker && v.x > -6);
    if (incoming && !o.target && !o.moving && !CP.Tasks.find(t => t.owner === 'officer')) { o.dir = -1; CP.Actors.seq('officer', ['raise', 'stop'], 0.18, 1.6); CP.Audio.whistle(); }
  }
  M.lastGate = g.state;
  // after a case is closed the officer walks back to his post by the barrier (unless busy elsewhere)
  if (o.returnAt != null && s.t >= o.returnAt) { o.returnAt = null;
    const busy = o.target || o.moving || CP.UI.panel || s.vehicles.some(v => v.caseId && !s.cases[v.caseId].res && (v.st === 'stopped' || v.st === 'bay') && CP.Act.nearVeh(v, 2.5));
    if (!busy && Math.abs(o.x - (CP.W.marker + 1.3)) > 1.2) CP.Actors.walkTo(CP.W.marker + 1.3, 0); }
  // when idle, the officer watches the incoming traffic on the left
  if (!o.moving && !o.target && !o.seq && !CP.Tasks.find(t => t.owner === 'officer') && !(CP.UI.panel && CP.UI.openCase)) {
    o.idleT = (o.idleT || 0) + dt;
    const busy = s.vehicles.some(v => (v.st === 'stopped' || v.st === 'bay') && v.caseId && !s.cases[v.caseId].res && CP.Act.nearVeh(v, 2.2));
    if (o.idleT > 2 && !busy) o.dir = -1;
  } else o.idleT = 0;
  // perception: far cues for everything on screen, close cues for the vehicle beside the officer
  for (const v of s.vehicles) { if (!v.caseId || v.x < 0) continue; const c = s.cases[v.caseId]; if (!c.res && c.cues.length) CP.Act.seeCues(v, c); }
  CP.bus.emit('stepEnd');
  M.tutorial();
  M.saveT += dt; if (M.saveT > 8) { M.saveT = 0; CP.autosave(); }
  M.objT = (M.objT || 0) + dt; if (M.objT > 1) { M.objT = 0; CP.Prog.checkObjectives(); }
};

M.frame = function (now) {
  if (!M.running) return;
  requestAnimationFrame(M.frame);
  let real = CP.clamp((now - M.last) / 1000, 0, 0.1); M.last = now;
  const G = CP.G; if (!G || !G.shift) return;
  const ts = M.timeScale();
  M.acc += real * ts;
  let n = 0;
  while (M.acc >= M.DT && n < 8) { M.step(M.DT); M.acc -= M.DT; n++; if (G.shift.ended) break; }
  if (n >= 8) M.acc = 0;
  // radio replies run on real time even while a reading panel slows the scene, so a check never exceeds 5 real seconds
  if (ts < 1 && !CP.Screens.cur && !G.shift.ended) { const extra = real * (1 - ts); for (const t of CP.Tasks.all(x => x.owner === 'radio' || x.owner === 'driver')) t.t = Math.min(t.dur - 1e-3, t.t + extra); }
  if (!G.shift.ended && CP.Career.checkEnd()) { M.endShift(); return; }
  CP.R.frame(M.acc / M.DT, real);
  CP.Audio.update(real); CP.Audio.rainUpdate && CP.Audio.rainUpdate(G.shift);
  M.uiT += real;
  if (M.uiT > 0.2) { M.uiT = 0; CP.UI.refreshHud(); CP.UI.refreshDock(); CP.UI.tickPanel(); }
};
M.start = function () { if (M.running) return; M.running = true; M.last = performance.now(); M.acc = 0; requestAnimationFrame(M.frame); };
M.stop = function () { M.running = false; };

/* ---------------- flows ---------------- */
M.useKey = function (mode) { CP.SAVE_KEY = mode === 'free' ? 'cpns_free_v1' : mode === 'daily' ? 'cpns_daily_v1' : 'cpns_save_v1'; };
M.newCareer = function () { M.useKey('career'); CP.G = CP.newCareer('career'); CP.save(); CP.Screens.briefing(); };
M.continueCareer = function (o) { M.useKey('career'); M.adopt(o); };
M.free = function (cont) {
  const career = CP.loadSaved(); M.useKey('free');
  let o = cont ? CP.loadSaved() : null;
  if (!o) { o = CP.newCareer('free'); if (career) { o.career.upgrades = CP.deep(career.career.upgrades); o.career.tutorialDone = true; o.career.shiftNo = career.career.shiftNo; } }
  CP.G = o; CP.save(); if (o.shift && !o.shift.ended) M.enterGame(); else CP.Screens.briefing();
};
/* adopt a loaded / imported save */
M.adopt = function (o) {
  CP.G = o; M.useKey(o.mode === 'free' || o.mode === 'daily' ? o.mode : 'career'); CP.save();
  if (o.shift && !o.shift.ended) M.enterGame();
  else if (o.shift && o.shift.ended) CP.Screens.report(o.shift.report || CP.Career.report());
  else CP.Screens.briefing();
};
M.startShift = function (loc) {
  CP.newShift(loc); const s = CP.G.shift; CP.Prog.startShift(s);
  s.bay = { A: null, B: null }; s.flow = 'hold'; s.far = [];
  CP.UI.resCase = null; CP.UI.docCase = null; CP.UI.srZone = null;
  CP.save('auto'); M.enterGame();
};
M.enterGame = function () {
  CP.Screens.hideAll(); document.getElementById('game').classList.remove('hidden');
  CP.UI.panel = null; CP.UI.openCase = null;
  if (!CP.G.shift.prog) CP.Prog.startShift(CP.G.shift);
  CP.UI.buildGame(); if (CP.Staff) CP.Staff.reset(); CP.R.camX = -0.5; CP.R.camFree = null; CP.R.parts = []; CP.R.fx = []; CP.R.zoom = 1; CP.R.camY = 0;
  M.saveT = 0; M.start(); M.tutorial(true);
};
M.endShift = function () {
  const rep = CP.Career.finishShift(); if (!rep) return;
  if (CP.G.mode === 'daily') rep.daily = CP.Daily.record(rep.score);
  M.stop(); CP.Screens.report(rep);
};

/* ---------------- guided tutorial (shift 1) ---------------- */
M.tutorial = function (force) {
  const s = CP.G.shift; const el = document.getElementById('tut'); if (!el) return;
  const T = s.tutorial;
  if (T.step >= 99) { if (!el.classList.contains('hidden')) el.classList.add('hidden'); return; }
  const cs = Object.values(s.cases);
  const adv = () => { T.step++; T.t0 = s.t; };
  switch (T.step) {
    case 1: if ((s.officer.walkT || 0) > 1.5 || s.t > 25) adv(); break;
    case 2: if (s.vehicles.some(v => v.st === 'marker') && CP.Act.curV() && CP.Act.curV().st === 'marker') adv(); break;
    case 3: if (cs.some(c => c.k.stopped)) adv(); break;
    case 4: if (cs.some(c => c.k.greeted)) adv(); break;
    case 5: if (cs.some(c => c.k.docsViewed)) adv(); break;
    case 6: if (cs.some(c => c.k.verif.vehicle.length || c.k.verif.person.length || c.k.pending.vehicle || c.k.pending.person) || s.t - (T.t0 || 0) > 30) adv(); break;
    case 7: if (cs.some(c => c.res && c.res.decision !== 'waved')) adv(); break;
    case 8: if (cs.some(c => c.res && c.res.decision === 'waved') || s.t - (T.t0 || 0) > 60) { T.step = 99; CP.G.career.tutorialDone = true; CP.UI.toast(CP.t('tut_done'), 'ok'); s.spawnT = 8; CP.autosave(); } break;
  }
  const key = 'tut_' + T.step + CP.lang;
  if (el.dataset.k === key && !force) return;
  el.dataset.k = key; el.classList.toggle('hidden', T.step >= 99); el.innerHTML = '';
  if (T.step < 99) el.append(CP.h('span', { class: 'n' }, CP.num(T.step)), CP.h('span', null, CP.t('tut_' + T.step)), CP.h('button', { class: 'btn', onclick: () => { T.step = 99; CP.G.career.tutorialDone = true; s.spawnT = Math.min(s.spawnT, 6); el.classList.add('hidden'); CP.autosave(); } }, CP.t('tut_skip')));
};

/* ---------------- boot ---------------- */
/* every script stamps its version; a missing or mismatched stamp means an old or failed file on the server */
M.EXPECTED = ["00_util", "01_strings", "02_content", "03_assets", "04_state", "05_cases", "06_dialogue", "07_tasks", "08_traffic", "09_actors", "10_actions", "11_events", "12_inspection", "13_screening", "14_render", "15_audio", "16_ui", "17_panels", "18_screens", "19_main", "20_progress", "21_features", "22_brand", "23_staff", "24_pulse", "25_revamp", "26_polish", "27_depth", "28_features", "29_world", "30_economy", "31_guard", "32_polish2", "33_device"];
M.checkFiles = function (silent) {
  const F = window.CP_FILES || {}; const bad = M.EXPECTED.filter(n => F[n] !== CP.VERSION);
  if (!bad.length) return true;
  if (silent) return false;
  const el = document.getElementById('ldErr') || document.body;
  const box = document.createElement('div'); box.className = 'errs'; box.style.cssText = 'max-width:640px;margin:12px auto;text-align:start;line-height:1.6';
  box.innerHTML = '<b>' + (CP.lang === 'ar' ? 'في ملفات قديمة أو ناقصة على السيرفر — ارفع مجلد js كله من جديد:' : 'Some game files on the server are old or missing — re-upload the whole js folder:') + '</b><br>' + bad.map(n => 'js/' + n + '.js — ' + (F[n] ? 'v' + F[n] : (CP.lang === 'ar' ? 'مش بيحمّل' : 'not loading'))).join('<br>') + ((window.CP_ERRS || []).length ? '<br><br><b>Browser errors:</b><br>' + window.CP_ERRS.slice(0, 8).map(e => String(e).replace(/</g, '&lt;')).join('<br>') : '') + '<br><small>v' + CP.VERSION + ' • ' + navigator.userAgent.replace(/</g, '') + '</small>';
  el.appendChild(box); console.error('CP file check failed', bad); return false;
};
M.boot = function () {
  CP.loadSettings(); CP.UI.applyLang();
  CP.Input.bindKeys();
  CP.Screens.loading();
  window.addEventListener('resize', () => { if (CP.R.cv && !document.getElementById('game').classList.contains('hidden')) CP.R.resize(); if (CP.Screens._mr) CP.Screens._mr(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && CP.G && CP.G.shift && !CP.G.shift.ended) { CP.save('auto'); if (M.running && !CP.Screens.cur) CP.Screens.pause(); } });
  window.addEventListener('pointerdown', () => CP.Audio.unlock(), { once: true });
  // if a file is stale or failed (e.g. a cached copy), fetch it again once, bypassing every cache, before giving up
  if (!M.checkFiles(true)) {
    const bad = M.EXPECTED.filter(n => (window.CP_FILES || {})[n] !== CP.VERSION);
    Promise.all(bad.map(n => new Promise(res => { const el = document.createElement('script'); el.src = 'js/' + n + '.js?v=' + CP.VERSION + '&t=' + Date.now(); el.onload = el.onerror = () => res(); document.head.appendChild(el); })))
      .then(() => { if (M.checkFiles()) M.bootLoad(); });
    return;
  }
  M.bootLoad();
};
M.bootLoad = function () {
  CP.A.load((p, f) => CP.Screens.loadProgress(p, f)).then(errs => {
    const core = errs.filter(f => !/logo_|fx_particles|checkpoint_props2|police_vehicles|driver_portraits_3|vehicles_extra|driver_portraits_2|loc_/.test(f));
    if (core.length) { CP.Screens.loadErrors(core); if (core.length > 3) return; }
    errs = core;
    const go = () => CP.Screens.menu();
    setTimeout(() => { if (errs.length || sessionStorage.getItem('cp_intro')) return go(); try { sessionStorage.setItem('cp_intro', '1'); } catch (e) { } CP.Screens.hideAll(); CP.Brand.intro(go); }, errs.length ? 1500 : 120);
  }).catch(e => { CP.Screens.loadErrors([e.message]); });
};
window.addEventListener('DOMContentLoaded', M.boot);

CP.bus.on('caseClosed', () => { const s = CP.G && CP.G.shift; if (s) s.officer.returnAt = s.t + 1.6; });
;(window.CP_FILES = window.CP_FILES || {})['19_main'] = '2.3.5';
