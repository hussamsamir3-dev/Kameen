/* Progression: XP, 11 ranks with insignia, combo multiplier, shift objectives, achievements, daily streak,
   local service record (best shifts) and a district leaderboard of fictional officers.
   XP rewards sound, proportionate decisions — never the number of arrests. */
CP.addStrings({
  pr_xp: ['خبرة', 'XP'], pr_rank: ['الرتبة', 'Rank'], pr_next: ['للرتبة الجاية: {n}', 'Next rank: {n}'], pr_max: ['أعلى رتبة', 'Top rank'],
  pr_combo: ['كومبو', 'Combo'], pr_comboLost: ['الكومبو اتقطع', 'Combo broken'], pr_streak: ['{n} يوم ورا بعض', '{n}-day streak'],
  pr_rankUp: ['ترقية!', 'Promotion!'], pr_rankUpTo: ['اترقيت لـ {r}', 'You are now {r}'], pr_objectives: ['أهداف الوردية', 'Shift objectives'],
  pr_objDone: ['هدف اتحقق: {o}', 'Objective complete: {o}'], pr_ach: ['وسام جديد', 'New medal'], pr_board: ['ترتيب المديرية', 'District ranking'],
  pr_you: ['إنت', 'You'], pr_record: ['سجل الخدمة', 'Service record'], pr_best: ['أحسن ورديات', 'Best shifts'], pr_medals: ['الأوسمة', 'Medals'],
  pr_position: ['ترتيبك: #{n} من {t}', 'Your position: #{n} of {t}'], pr_moved: ['اتقدمت {n} مراكز!', 'Up {n} places!'],
  pr_stars: ['نجوم', 'Stars'], pr_xpGain: ['خبرة الوردية', 'Shift XP'], pr_bd_cases: ['القرارات', 'Decisions'], pr_bd_score: ['التقييم', 'Score bonus'],
  pr_bd_stars: ['النجوم', 'Stars'], pr_bd_obj: ['الأهداف', 'Objectives'], pr_bd_streak: ['مكافأة الاستمرار', 'Streak bonus'], pr_total: ['إجمالي الخبرة', 'Total XP'],
  pr_quick: ['عين سريعة', 'Quick eye'], pr_bigCatch: ['قضية كبيرة!', 'Big catch!'], pr_lifeSaver: ['أنقذت حياة', 'Life saver'],
  st_clear: ['سليم ✓', 'CLEAR ✓'], st_release: ['يعدي ✓', 'RELEASED'], st_advice: ['نصيحة', 'ADVISED'], st_warning: ['إنذار', 'WARNING'], st_citation: ['مخالفة', 'CITED'],
  st_refer_admin: ['إحالة', 'REFERRED'], st_medical: ['إسعاف', 'MEDICAL'], st_hold: ['تحفظ', 'HELD'], st_handover: ['تسليم', 'HANDOVER']
});
CP.Prog = {};
const PG = CP.Prog;
PG.RANKS = [
  { xp: 0, ar: 'مجند', en: 'Recruit' }, { xp: 300, ar: 'عسكري', en: 'Constable' }, { xp: 800, ar: 'عريف', en: 'Corporal' },
  { xp: 1600, ar: 'رقيب', en: 'Sergeant' }, { xp: 2800, ar: 'رقيب أول', en: 'Staff Sergeant' }, { xp: 4500, ar: 'أمين شرطة', en: 'Warrant Officer' },
  { xp: 7000, ar: 'ملازم', en: 'Lieutenant' }, { xp: 10000, ar: 'ملازم أول', en: 'First Lieutenant' }, { xp: 14000, ar: 'نقيب', en: 'Captain' },
  { xp: 19000, ar: 'رائد', en: 'Major' }, { xp: 25000, ar: 'مقدم', en: 'Lieutenant Colonel' }
];
PG.rankOf = xp => { let i = 0; for (let k = 0; k < PG.RANKS.length; k++) if (xp >= PG.RANKS[k].xp) i = k; return i; };
PG.rankName = i => CP.L(PG.RANKS[i]);
PG.ensure = function (car) {
  if (!car) return car;
  car.xp = car.xp || 0; car.ach = car.ach || {}; car.records = car.records || []; car.streak = car.streak || 0; car.lastDay = car.lastDay || null;
  car.totals = Object.assign({ cases: 0, sound: 0, waves: 0, shifts: 0, bestCombo: 0, catches: 0, lives: 0 }, car.totals || {});
  return car;
};
{ const nc = CP.newCareer; CP.newCareer = function (m) { const o = nc(m); PG.ensure(o.career); return o; }; }

/* ---------- insignia (SVG, gold) ---------- */
PG.badge = function (i, size) {
  size = size || 44; const n = i;
  const chev = n >= 1 && n <= 5 ? n : 0; const stars = n >= 6 ? Math.min(3, n - 5) : 0; const eagle = n >= 9;
  let inner = '';
  for (let k = 0; k < Math.min(chev, 3); k++) inner += `<path d="M14 ${30 + k * 7} L32 ${22 + k * 7} L50 ${30 + k * 7}" stroke="url(#gd)" stroke-width="4.2" fill="none" stroke-linejoin="round"/>`;
  if (chev >= 4) inner += `<path d="M18 ${chev === 5 ? 18 : 20} Q32 ${chev === 5 ? 10 : 13} 46 ${chev === 5 ? 18 : 20}" stroke="url(#gd)" stroke-width="3.6" fill="none"/>`;
  if (chev === 5) inner += '<circle cx="32" cy="15" r="3" fill="url(#gd)"/>';
  const star = (cx, cy, r) => { let p = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? r * 0.45 : r; p += (k ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return `<path d="${p}Z" fill="url(#gd)"/>`; };
  if (eagle) inner += `<path d="M20 26 Q32 16 44 26 Q38 24 32 30 Q26 24 20 26Z" fill="url(#gd)"/>`;
  const sy = eagle ? 42 : 34;
  if (stars === 1) inner += star(32, sy, 8);
  if (stars === 2) inner += star(23, sy, 7) + star(41, sy, 7);
  if (stars >= 3) inner += star(18, sy, 6) + star(32, sy - 4, 6) + star(46, sy, 6);
  if (n === 0) inner += '<rect x="22" y="30" width="20" height="4" rx="2" fill="url(#gd)"/>';
  return `<svg class="badge" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#f0b840"/><stop offset="1" stop-color="#9a6410"/></linearGradient><linearGradient id="bgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27324a"/><stop offset="1" stop-color="#0d1220"/></linearGradient></defs><path d="M32 3 L57 12 V32 C57 47 45 56 32 61 C19 56 7 47 7 32 V12 Z" fill="url(#bgb)" stroke="url(#gd)" stroke-width="2.5"/>${inner}</svg>`;
};

/* ---------- daily streak ---------- */
PG.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
PG.touchStreak = function (car) {
  const t = PG.today(); if (car.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1); const yd = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  car.streak = car.lastDay === yd ? car.streak + 1 : 1; car.lastDay = t;
};
PG.streakMult = car => 1 + 0.05 * Math.min(6, Math.max(0, (car.streak || 1) - 1));

/* ---------- objectives ---------- */
PG.OBJ = {
  wave5: { t: ['عدّي ٥ عربيات سليمة', 'Wave through 5 clean vehicles'], goal: 5, xp: 120, f: s => s.prog.cleanWaves },
  combo5: { t: ['وصل كومبو ×٥', 'Reach a 5× combo'], goal: 5, xp: 150, f: s => s.prog.bestCombo },
  sound6: { t: ['٦ قرارات سليمة', '6 sound decisions'], goal: 6, xp: 140, f: s => s.prog.sound },
  quick3: { t: ['٣ فحوص أوراق في أقل من ٥ ثواني', '3 paper checks under 5 s'], goal: 3, xp: 130, f: s => s.prog.quick },
  disc2: { t: ['اكتشف تعارضين حقيقيين', 'Catch 2 real discrepancies'], goal: 2, xp: 160, f: s => s.prog.realDisc },
  nocomp: { t: ['صفر شكاوى لحد نص الوردية', 'No complaints by mid-shift'], goal: 1, xp: 110, f: s => (s.t > s.dur / 2 && !s.stats.complaints ? 1 : 0) },
  serious: { t: ['اتعامل صح مع قضية كبيرة', 'Handle a serious case correctly'], goal: 1, xp: 220, tier: 2, f: s => s.prog.catches },
  amb: { t: ['عدّي الإسعاف بسرعة', 'Let an ambulance through fast'], goal: 1, xp: 160, tier: 5, f: s => s.stats.safety.filter(x => x.why === 'ambulance' && x.v >= 90).length }
};
PG.startShift = function (s) {
  const car = CP.G.career; PG.ensure(car); PG.touchStreak(car);
  const r = CP.makeRng(s.seedTag + 17); const tier = CP.tier();
  const pool = Object.keys(PG.OBJ).filter(k => (PG.OBJ[k].tier || 1) <= tier);
  s.prog = { xp: 0, combo: 0, bestCombo: 0, sound: 0, cleanWaves: 0, quick: 0, realDisc: 0, catches: 0, lives: 0, objs: r.shuffle(pool).slice(0, 3).map(id => ({ id, done: false })), ach: [], rank0: PG.rankOf(car.xp), xp0: car.xp, pos0: PG.position(car.xp) };
};
PG.checkObjectives = function () {
  const s = CP.G.shift; if (!s || !s.prog) return;
  for (const o of s.prog.objs) {
    if (o.done) continue; const d = PG.OBJ[o.id];
    if (d.f(s) >= d.goal) { o.done = true; PG.gain(d.xp, null, null, '#8fe3a8'); CP.UI.banner('🎯 ' + CP.t('pr_objDone', { o: CP.L(d.t) }), 'ok'); CP.Audio.chime('obj'); CP.R.confetti(40, CP.R.W * 0.5, CP.R.H * 0.3); }
  }
};
PG.objProgress = (s, o) => { const d = PG.OBJ[o.id]; return Math.min(d.goal, d.f(s)); };

/* ---------- XP & combo ---------- */
PG.gain = function (xp, x, yup, color, label) {
  const s = CP.G.shift; if (!s || !s.prog || xp <= 0) return;
  s.prog.xp += xp;
  CP.R.popup((label ? label + ' ' : '') + '+' + CP.num(xp) + ' ' + CP.t('pr_xp'), x, yup, color);
  CP.UI.xpPulse && CP.UI.xpPulse();
};
const STAMP_COL = { waved: '#6fe39a', release: '#6fe39a', advice: '#8fd3ff', warning: '#ffcf5a', citation: '#ff9a4a', refer_admin: '#c9a6ff', medical: '#ff6a6a', hold: '#ff5a5a', handover: '#ff5a5a' };
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !s.prog || !c.res || !c.res.eval) return;
  const e = c.res.eval; const P = s.prog; const v = CP.vehOfCase(c);
  const vx = v ? v.x - v.len / 2 : null, vy = v ? CP.R.rowY(v.row) + 2.4 : null;
  if (e.escaped) { P.combo = 0; return; }
  const dec = c.res.decision;
  CP.R.stamp(CP.t(dec === 'waved' ? 'st_clear' : 'st_' + dec), STAMP_COL[dec] || '#fff', vx, vy - 0.8); CP.Audio.stampSfx();
  if (e.sound) {
    P.combo++; P.bestCombo = Math.max(P.bestCombo, P.combo); P.sound++;
    if (dec === 'waved') P.cleanWaves++;
    const base = e.waved ? 12 : 30; const q = e.waved ? 1 : CP.clamp(((e.dec ?? 80) * 0.6 + (e.prop ?? 80) * 0.25 + (e.com ?? 80) * 0.15) / 100, 0.3, 1);
    const mult = (1 + 0.25 * Math.min(8, P.combo - 1)) * PG.streakMult(CP.G.career);
    let xp = Math.round(base * q * mult);
    PG.gain(xp, vx, vy, '#ffd35a');
    if (P.combo >= 3) { CP.Audio.chime(P.combo % 5 === 0 ? 'combo' : 'good'); if (P.combo % 5 === 0) CP.R.confetti(35, CP.R.sx(vx ?? 17), CP.R.H * 0.3); }
    else CP.Audio.chime('good');
    if (CP.FAM[c.fam] && CP.FAM[c.fam].serious && ['hold', 'handover', 'medical', 'refer_admin', 'citation'].indexOf(dec) >= 0) {
      if (c.fam === 'medical') { P.lives++; PG.gain(60, vx, vy + 0.9, '#ff8a8a', CP.t('pr_lifeSaver')); }
      else { P.catches++; PG.gain(80, vx, vy + 0.9, '#ff9a4a', CP.t('pr_bigCatch')); CP.R.punch(); }
      CP.R.confetti(60, CP.R.sx(vx ?? 17), CP.R.H * 0.3); CP.Audio.chime('great');
    }
    if (!e.waved && CP.notesFor(c).some(n => n.type === 'discrepancy')) P.realDisc += CP.Cases.trueDiscrepancies(c).length ? 1 : 0;
  } else {
    if (P.combo >= 3) CP.UI.toast(CP.t('pr_comboLost') + ' (×' + CP.num(P.combo) + ')', 'warn');
    P.combo = 0; CP.Audio.chime('bad');
  }
  PG.unlock('first_stop');
  if (P.cleanWaves >= 10) PG.unlock('green_wave');
  if (P.bestCombo >= 10) PG.unlock('combo10');
  if (P.catches) PG.unlock('big_catch'); if (P.lives) PG.unlock('life_saver'); if (P.realDisc) PG.unlock('sharp_eye');
  PG.checkObjectives();
});
/* quick paper check: documents read and a decision/discrepancy made within 5 s of receiving them */
CP.bus.on('panel', kind => { const s = CP.G && CP.G.shift; const c = CP.UI.panel && CP.UI.panel.caseId && s.cases[CP.UI.panel.caseId]; if (kind === 'docs' && c && c.k.docsHave && c.k.docsT == null) c.k.docsT = s.t; });
CP.bus.on('note', n => {
  const s = CP.G && CP.G.shift; if (!s || !s.prog || !n || n.type !== 'discrepancy') return; const c = s.cases[n.caseId]; if (!c || c.k.quickDone || c.k.docsT == null) return;
  if (s.t - c.k.docsT <= 5 && CP.Cases.trueDiscrepancies(c).length) { c.k.quickDone = true; s.prog.quick++; const v = CP.vehOfCase(c); PG.gain(15, v ? v.x - v.len / 2 : null, v ? CP.R.rowY(v.row) + 3.2 : null, '#8fd3ff', CP.t('pr_quick')); PG.checkObjectives(); }
});
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !s.prog || c.k.quickDone || c.k.docsT == null || !c.res || c.res.eval.waved) return;
  if (s.t - c.k.docsT <= 5 && c.res.eval.sound) { c.k.quickDone = true; s.prog.quick++; PG.checkObjectives(); }
});

/* ---------- achievements ---------- */
PG.ACH = {
  first_stop: { i: '🚦', t: ['أول قرار', 'First call'], d: ['قفلت أول حالة', 'Closed your first case'] },
  sharp_eye: { i: '🔎', t: ['عين صقر', 'Sharp eye'], d: ['اكتشفت تعارض حقيقي في الأوراق', 'Caught a real document discrepancy'] },
  life_saver: { i: '🚑', t: ['منقذ', 'Life saver'], d: ['تعاملت صح مع حالة طبية', 'Handled a medical emergency correctly'] },
  big_catch: { i: '🦅', t: ['صيدة كبيرة', 'Big catch'], d: ['قضية كبيرة بإجراء سليم', 'A serious case, done by the book'] },
  green_wave: { i: '🟢', t: ['موجة خضرا', 'Green wave'], d: ['١٠ عربيات سليمة في وردية', '10 clean vehicles in one shift'] },
  combo10: { i: '🔥', t: ['نار', 'On fire'], d: ['كومبو ×١٠', 'Reached a 10× combo'] },
  perfect: { i: '⭐', t: ['وردية مثالية', 'Perfect shift'], d: ['تقييم ٩٠ أو أكتر', 'Scored 90 or more'] },
  night_owl: { i: '🌙', t: ['بومة الليل', 'Night owl'], d: ['خلصت وردية في الطريق الصحراوي', 'Completed a desert shift'] },
  clean_shift: { i: '🧤', t: ['إيد نضيفة', 'Clean hands'], d: ['٨ فحوص من غير تفتيش بلا سبب', '8 checks with no unjustified search'] },
  officer: { i: '🎖️', t: ['ضابط', 'Commissioned'], d: ['وصلت رتبة ملازم', 'Reached Lieutenant'] },
  streak3: { i: '📅', t: ['منتظم', 'Regular'], d: ['٣ أيام ورا بعض', '3-day streak'] },
  veteran: { i: '🏅', t: ['قديم', 'Veteran'], d: ['١٠ ورديات', 'Completed 10 shifts'] }
};
PG.unlock = function (id) {
  const car = CP.G.career; PG.ensure(car); if (car.ach[id]) return false;
  car.ach[id] = PG.today(); const a = PG.ACH[id]; const s = CP.G.shift; if (s && s.prog) s.prog.ach.push(id);
  if (CP.UI && CP.UI.medal) CP.UI.medal(a); CP.Audio.fanfare();
  return true;
};

/* ---------- district leaderboard (fictional officers, deterministic) ---------- */
PG.board = function (car) {
  car = car || CP.G.career; const r = CP.makeRng(90210); const C = CP.C; const n = 24; const list = [];
  const sh = Math.max(1, car.shiftNo || 1);
  for (let i = 0; i < n; i++) {
    const first = r.pick(C.maleFirst.concat(C.femaleFirst)); const fam = r.pick(C.family);
    const base = 120 * Math.pow(1.23, i) * (0.8 + r() * 0.4); const growth = 0.06 + r() * 0.1;
    list.push({ name: { ar: first[0] + ' ' + fam[0], en: first[1] + ' ' + fam[1] }, xp: Math.round(base * (1 + growth * (sh - 1))), me: false });
  }
  list.push({ name: { ar: CP.STR.ar.pr_you, en: CP.STR.en.pr_you }, xp: car.xp || 0, me: true });
  list.sort((a, b) => b.xp - a.xp); list.forEach((e, i) => { e.pos = i + 1; e.rank = PG.rankOf(e.xp); });
  return list;
};
PG.position = xp => { const car = Object.assign({}, CP.G.career, { xp }); return PG.board(car).find(e => e.me).pos; };

/* ---------- shift end ---------- */
PG.finishShift = function (rep) {
  const G = CP.G, s = G.shift, car = G.career; PG.ensure(car); if (!s.prog) PG.startShift(s);
  const P = s.prog;
  const stars = rep.score >= 88 ? 3 : rep.score >= 72 ? 2 : rep.score >= 55 ? 1 : 0;
  const objXp = P.objs.filter(o => o.done).reduce((a, o) => a + PG.OBJ[o.id].xp, 0);
  const caseXp = P.xp - objXp;
  const scoreXp = rep.score * 3, starXp = stars * 60;
  const streakXp = Math.round((caseXp + scoreXp) * (PG.streakMult(car) - 1));
  const total = Math.max(0, Math.round(caseXp + scoreXp + starXp + objXp + streakXp));
  const r0 = PG.rankOf(car.xp), pos0 = P.pos0 || PG.position(car.xp);
  const xpBefore = car.xp;
  car.xp += Math.round(scoreXp + starXp + streakXp + P.xp); // case & objective XP already live in P.xp
  const r1 = PG.rankOf(car.xp);
  const t = car.totals; t.shifts++; t.cases += rep.handled; t.sound += rep.sound; t.bestCombo = Math.max(t.bestCombo, P.bestCombo); t.catches += P.catches; t.lives += P.lives; t.waves += P.cleanWaves;
  car.records.push({ no: s.no, loc: s.loc, score: rep.score, stars, xp: total, date: PG.today(), rank: r1 });
  car.records.sort((a, b) => b.score - a.score); car.records = car.records.slice(0, 10);
  if (rep.score >= 90) PG.unlock('perfect'); if (CP.locBase(s.loc) === 'desert') PG.unlock('night_owl');
  const unjust = Object.values(s.cases).some(c => c.k.searchReason && !CP.Cases.searchReasonValid(c, c.k.searchReason));
  if (!unjust && rep.checked >= 8) PG.unlock('clean_shift');
  if (r1 >= 6) PG.unlock('officer'); if ((car.streak || 0) >= 3) PG.unlock('streak3'); if (t.shifts >= 10) PG.unlock('veteran');
  const pos1 = PG.position(car.xp);
  return { stars, caseXp, scoreXp, starXp, objXp, streakXp, total, xpBefore, xpAfter: car.xp, r0, r1, rankUp: r1 > r0, pos0, pos1, objs: P.objs.map(o => ({ id: o.id, done: o.done })), ach: P.ach.slice(), bestCombo: P.bestCombo };
};
;(window.CP_FILES = window.CP_FILES || {})['20_progress'] = '2.5.1';
