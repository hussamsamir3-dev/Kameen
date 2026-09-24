/* Serializable game state + persistence. CP.G is the single source of truth. */
CP.G = null;
CP.SAVE_KEY = 'cpns_save_v1';
CP.SET_KEY = 'cpns_settings_v1';

CP.defaultSettings = () => ({ lang: 'ar', shiftMin: 15, readMode: 'slow', assist: false, subs: true, reducedFx: false, reducedFlash: false, textSize: 'normal', master: 0.85, music: 0.55, tod: 'auto', sheet: null, amb: 0.6, sfx: 0.8, mute: false, quality: 'high', camZoom: 'auto' });
CP.S = CP.defaultSettings();
/* time of day: every shift spans 12 in-game hours and crosses a sunrise or sunset */
CP.TOD = { dusk: 15 * 60 + 30, dawn: 1 * 60 + 30, day: 7 * 60, night: 20 * 60 };
CP.todOf = no => { const t = CP.S.tod || 'auto'; if (t !== 'auto') return t; return ['dusk', 'dawn', 'day', 'night'][(Math.max(1, no) - 1) % 4]; };
CP.todStart = no => CP.TOD[CP.todOf(no)];
CP.SPAN = 720;
/* 0 = full day, 1 = full night; sunrise 05:15–06:45, sunset 17:15–18:45 */
CP.nightAt = mins => { const h = ((mins % 1440) + 1440) % 1440 / 60; const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  if (h >= 6.75 && h <= 17.25) return 0; if (h > 17.25 && h < 18.75) return sm((h - 17.25) / 1.5); if (h > 5.25 && h < 6.75) return 1 - sm((h - 5.25) / 1.5); return 1; };
CP.loadSettings = function () {
  try { const s = JSON.parse(localStorage.getItem(CP.SET_KEY) || 'null'); if (s) CP.S = Object.assign(CP.defaultSettings(), s); }
  catch (e) { console.warn('settings', e); }
  CP.lang = CP.S.lang;
};
CP.saveSettings = function () {
  try { localStorage.setItem(CP.SET_KEY, JSON.stringify(CP.S)); } catch (e) { CP.UI && CP.UI.toast(CP.t('sv_fail', { e: e.message }), 'bad'); }
};

CP.UPG = {
  lighting: { max: 2, cost: [3, 5] }, radio: { max: 2, cost: [3, 5] }, supplies: { max: 2, cost: [2, 4] },
  partner: { max: 2, cost: [3, 5] }, bay: { max: 1, cost: [6] }
};

CP.newCareer = function (mode) {
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  return {
    v: CP.SAVE_VERSION, created: Date.now(), mode: mode || 'career', rng: { s: seed },
    career: { shiftNo: 1, credits: 0, upgrades: { lighting: 0, radio: 0, supplies: 0, partner: 0, bay: 0 }, tutorialDone: false, trust: 60, history: [], returning: [], updates: [], date: '2026-10-03' },
    shift: null
  };
};

/* unlock tier by shift number (career) — free patrol unlocks everything */
CP.tier = function () {
  const G = CP.G; if (!G) return 1;
  if (G.mode === 'free') return 6;
  return Math.min(6, G.career.shiftNo);
};

CP.newShift = function (loc) {
  const G = CP.G, c = G.career, r = CP.srng();
  const date = CP.dateAdd(c.date, (c.shiftNo - 1) * 2);
  const sup = c.upgrades.supplies;
  G.shift = {
    no: c.shiftNo, loc, date, t: 0, dur: CP.S.shiftMin * 60, startMin: CP.todStart(c.shiftNo), tod: CP.todOf(c.shiftNo),
    spawnT: 3, backlog: 0, nextVid: 1, nextCase: 1, spawned: 0,
    gate: { state: 'closed', ang: 0, mode: 'hold', jam: false, manual: false, sensorMsgT: 0 },
    prioOpen: false, vehicles: [], cases: {}, caseOrder: [], selected: null,
    officer: { x: 16.2, px: 16.2, dir: 1, pose: 'idle', poseT: 0, walkT: 0, target: null, pending: null },
    partner: { x: 24.2, px: 24.2, dir: -1, pose: 'idle', walkT: 0, target: null, task: null, home: 24.2 },
    tasks: [], radio: [], notes: [], evidence: [], nextNote: 1, nextEv: 1, nextTask: 1,
    equipment: { breath: 'ready', mouth: 6 + sup * 4, kits: 3 + sup * 2, gloves: 6 + sup * 4, bags: 4 + sup * 3, generator: 'ok' },
    events: { active: [], cd: {}, lastMajor: 40, log: [], radioDelayUntil: 0, dustUntil: 0 },
    stats: { handled: 0, checked: 0, waved: 0, complaints: 0, safety: [], waits: [], honks: 0 },
    idem: {}, tutorial: { step: (c.tutorialDone || G.mode === 'free') ? 99 : 1 },
    visitor: null, ended: false, lookouts: [], seedTag: r.int(1000, 9999)
  };
  CP.bus.emit('shiftStart');
};

/* ---------------- persistence ---------------- */
CP.save = function (reason) {
  if (!CP.G) return false;
  try {
    CP.G.savedAt = Date.now();
    const data = JSON.stringify(CP.G);
    try { const prev = localStorage.getItem(CP.SAVE_KEY); if (prev) localStorage.setItem(CP.SAVE_KEY + '_bak', prev); } catch (e) { /* backup best-effort */ }
    localStorage.setItem(CP.SAVE_KEY, data);
    if (reason && CP.UI) CP.UI.saveIndicator(reason === 'manual' ? CP.t('sv_saved') : CP.t('sv_auto'));
    return true;
  } catch (e) {
    CP.UI && CP.UI.toast(CP.t('sv_fail', { e: e.message || 'storage unavailable' }), 'bad');
    return false;
  }
};
CP.autosave = function () { CP.save('auto'); };

CP.validateSave = function (o) {
  if (!o || typeof o !== 'object') throw new Error('not an object');
  if (o.v !== CP.SAVE_VERSION) throw new Error(CP.t('sv_version', { v: String(o.v) }));
  if (!o.career || typeof o.career.shiftNo !== 'number') throw new Error('career missing');
  if (!o.rng || typeof o.rng.s !== 'number') throw new Error('random state missing');
  if (CP.Prog) CP.Prog.ensure(o.career);
  if (o.shift) {
    const s = o.shift;
    for (const k of ['vehicles', 'cases', 'notes', 'tasks', 'gate', 'officer', 'partner', 'equipment', 'events'])
      if (!(k in s)) throw new Error('shift.' + k + ' missing');
    if (!Array.isArray(s.vehicles)) throw new Error('vehicles must be a list');
    for (const v of s.vehicles) { if (!CP.A.M.vehicles[v.type]) throw new Error('unknown vehicle ' + v.type); if (v.caseId && !s.cases[v.caseId]) throw new Error('vehicle case missing ' + v.caseId); }
  }
  return true;
};
CP.loadSaved = function () {
  let raw = null;
  try { raw = localStorage.getItem(CP.SAVE_KEY); } catch (e) { CP.UI && CP.UI.toast(CP.t('sv_loadFail', { e: e.message }), 'bad'); return null; }
  if (!raw) return null;
  try { const o = JSON.parse(raw); CP.validateSave(o); return o; }
  catch (e) {
    CP.UI && CP.UI.toast(CP.t('sv_loadFail', { e: e.message }), 'bad');
    try { const b = JSON.parse(localStorage.getItem(CP.SAVE_KEY + '_bak') || 'null'); if (b) { CP.validateSave(b); return b; } } catch (e2) { /* ignore */ }
    return null;
  }
};
CP.hasSave = function () { try { return !!localStorage.getItem(CP.SAVE_KEY); } catch (e) { return false; } };
CP.exportSave = function () { return JSON.stringify({ game: 'checkpoint-night-shift', exported: new Date().toISOString(), save: CP.G }); };
CP.importSave = function (text) {
  let o; try { o = JSON.parse(text); } catch (e) { throw new Error('JSON: ' + e.message); }
  if (o && o.game === 'checkpoint-night-shift') o = o.save;
  CP.validateSave(o);
  return o;
};

/* idempotency guard: returns true only the first time a key is used within the shift */
CP.once = function (key) {
  const s = CP.G.shift; if (!s) return false;
  if (s.idem[key]) return false; s.idem[key] = 1; return true;
};
;(window.CP_FILES = window.CP_FILES || {})['04_state'] = '2.8.1';
