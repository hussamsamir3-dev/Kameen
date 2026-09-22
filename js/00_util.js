/* CHECKPOINT: NIGHT SHIFT — core utilities (namespace, seeded RNG, i18n, math) */
'use strict';
const CP = window.CP = {};
CP.VERSION = '1.9.0';
CP.SAVE_VERSION = 1;

/* ---------- Seeded RNG (mulberry32) — state is a single serializable uint32 ---------- */
CP.rngNext = function (holder) {
  let t = (holder.s = (holder.s + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/* A local RNG object for case-generation (seed fixed per case, so re-generation is identical) */
CP.makeRng = function (seed) {
  const h = { s: seed >>> 0 };
  const r = () => CP.rngNext(h);
  r.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.chance = p => r() < p;
  r.weighted = (entries) => { // [[value, weight], ...]
    let tot = 0; for (const e of entries) tot += e[1];
    let x = r() * tot;
    for (const e of entries) { if ((x -= e[1]) <= 0) return e[0]; }
    return entries[entries.length - 1][0];
  };
  r.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  r.state = h;
  return r;
};
/* Game-state RNG: wraps state.rng holder so the stream survives save/load */
CP.srng = function () { return CP.makeRngFromHolder(CP.G.rng); };
CP.makeRngFromHolder = function (holder) {
  const r = () => CP.rngNext(holder);
  r.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.chance = p => r() < p;
  r.weighted = (entries) => { let tot = 0; for (const e of entries) tot += e[1]; let x = r() * tot; for (const e of entries) { if ((x -= e[1]) <= 0) return e[0]; } return entries[entries.length - 1][0]; };
  return r;
};

/* ---------- math ---------- */
CP.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
CP.lerp = (a, b, t) => a + (b - a) * t;
CP.smooth = t => { t = CP.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
CP.fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); };
CP.deep = o => JSON.parse(JSON.stringify(o));

/* ---------- i18n ---------- */
CP.lang = 'ar';
CP.STR = { ar: {}, en: {} };
CP.addStrings = function (table) { // table: { key: [ar, en] }
  for (const k in table) { CP.STR.ar[k] = table[k][0]; CP.STR.en[k] = table[k][1]; }
};
CP.t = function (key, vars) {
  let s = CP.STR[CP.lang][key];
  if (s === undefined) s = CP.STR.en[key] !== undefined ? CP.STR.en[key] : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? CP.L(vars[k]) : m);
  return s;
};
/* L: localize a bilingual value {ar,en} | [ar,en] | string */
CP.L = function (v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return CP.lang === 'ar' ? v[0] : v[1];
  if (typeof v === 'object' && ('ar' in v || 'en' in v)) return CP.lang === 'ar' ? (v.ar ?? v.en) : (v.en ?? v.ar);
  return String(v);
};
/* fill placeholders inside a bilingual pair */
CP.fill = function (pair, vars) {
  const f = (s, lang) => s.replace(/\{(\w+)\}/g, (m, k) => {
    const v = vars[k]; if (v === undefined) return m;
    if (typeof v === 'object') return lang === 'ar' ? (Array.isArray(v) ? v[0] : v.ar) : (Array.isArray(v) ? v[1] : v.en);
    return String(v);
  });
  return { ar: f(Array.isArray(pair) ? pair[0] : pair.ar, 'ar'), en: f(Array.isArray(pair) ? pair[1] : pair.en, 'en') };
};
CP.arDigits = s => String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
CP.num = n => CP.lang === 'ar' ? CP.arDigits(n) : String(n);

/* ---------- tiny event bus ---------- */
CP.bus = { h: {}, on(e, f) { (this.h[e] = this.h[e] || []).push(f); }, emit(e, d) { (this.h[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(err); } }); } };

/* ---------- dates (fictional in-game calendar) ---------- */
CP.dateAdd = (iso, days) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
CP.dateDiff = (a, b) => Math.round((new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 86400000);
CP.fmtDate = iso => {
  const [y, m, d] = iso.split('-');
  const ms = CP.lang === 'ar' ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'] : ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return CP.lang === 'ar' ? CP.arDigits(+d) + ' ' + ms[+m - 1] + ' ' + CP.arDigits(y) : (+d) + ' ' + ms[+m - 1] + ' ' + y;
};

/* Minimal gender helpers — the full Egyptian-Arabic version in 06_dialogue.js replaces this.
   Kept here so the game never breaks if an older/cached 06_dialogue.js is served. */
CP.Gender = CP.Gender || {
  isF: c => !!(c && c.driver && c.driver.g === 'f'),
  officer: (c, intent, tone) => CP.C.officer[intent][tone],
  label: (c, intent) => CP.C.intentLabel[intent],
  driverText: (c, t) => t,
  driverWord: c => (c && c.driver && c.driver.g === 'f') ? { ar: 'السواقة', en: 'Driver' } : { ar: 'السواق', en: 'Driver' },
  pers: (c, p) => CP.C.persLabel[p]
};
;(window.CP_FILES = window.CP_FILES || {})['00_util'] = '1.9.0';
