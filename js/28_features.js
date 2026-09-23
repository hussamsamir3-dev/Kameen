/* Features (v2.0)
   A1 Daily directives — shift bulletin adds standing rules the player must remember and apply; graded per case.
   B1 Aftermath radio — dispatch reports back 40–90 s after a decision with the real outcome (delayed variable reward).
   C1 Perks tree — rank points spent on Investigator / Negotiator / Field perks with real mechanical effects.
   D2 Rival officer — Lt. Adel at the next checkpoint: weekly score to beat, radio banter, no server needed.
   F1 Cold open — the very first shift starts with a wanted car already rolling in.
   B2 Letters — end-of-shift envelope: complaints and commendations with consequences.
   C3 Cosmetics — titles, badge colours and an in-game nameplate unlocked by commendations.
   G1 Micro-animations — paper handed through the window, barrier bounce, booth light, partner nod.
   G2 Ducking — music dips under dispatch with a static tail.   G3 Haptics — vibration on stamps, catches, bets. */
CP.addStrings({
  ft_bulletin: ['📋 تعليمات الوردية', '📋 Shift directives'], ft_dirOk: ['التزمت بالتعليمات', 'Directive followed'], ft_dirMiss: ['خالفت تعليمات الوردية: {r}', 'You broke a directive: {r}'], ft_dirChip: ['تعليمات', 'Directives'],
  ft_r_expired: ['أي رخصة منتهية = مخالفة أو إنذار (مش نصيحة)', 'Expired documents get a citation or warning — never just advice'],
  ft_r_pax: ['أي عربية فيها ٣ ركاب أو أكتر لازم تتوقف وتتكلم مع السواق', 'Any car with 3+ passengers must be stopped and the driver questioned'],
  ft_r_plate: ['اللوحات اللي بتبدأ بحرف «{L}» لازم استعلام لاسلكي', 'Plates starting with "{L}" require a radio check'],
  ft_r_comm: ['العربيات التجارية لازم تتفحص أوراقها', 'Commercial vehicles must have their papers inspected'],
  ft_r_night: ['بالليل ممنوع تعدّي أي عربية من غير وقوف', 'At night no vehicle passes without being stopped'],
  ft_after_bad: ['📻 العمليات: {v} اللي عدّيتها اتورطت في حادث بعد الكمين بكيلو', '📻 Dispatch: the {v} you waved through was in a collision a kilometre down the road'],
  ft_after_bad2: ['📻 العمليات: {v} اللي عدّيتها طلعت عليها بلاغ سرقة', '📻 Dispatch: the {v} you let go was reported stolen'],
  ft_after_good: ['📻 العمليات: اللي تحفظت عليه طلع عليه أمر ضبط — شغل نضيف', '📻 Dispatch: the man you held had a warrant — clean work'],
  ft_after_good2: ['📻 العمليات: التحفظ بتاعك طلع صح، النيابة شكرت الكمين', '📻 Dispatch: your hold was right, the prosecutor thanked the checkpoint'],
  ft_after_neutral: ['📻 العمليات: {v} وصلت بالسلامة، مفيش ملاحظات', '📻 Dispatch: the {v} arrived safely, nothing to report'],
  ft_perks: ['المهارات', 'Skills'], ft_perkPts: ['{n} نقطة متاحة', '{n} points available'], ft_perkSub: ['كل رتبة جديدة = نقطة', 'Every new rank = 1 point'], ft_locked: ['مقفول', 'Locked'], ft_buy: ['فتح', 'Unlock'], ft_owned: ['مفعّل ✓', 'Active ✓'],
  ft_inv: ['محقق', 'Investigator'], ft_neg: ['مفاوض', 'Negotiator'], ft_fld: ['ميداني', 'Field'],
  ft_p_eagle: ['عين الصقر', 'Eagle Eye'], ft_p_eagleD: ['أول تعارض في الأوراق بيتعلّم لوحده', 'The first discrepancy in the papers is flagged for you'],
  ft_p_memory: ['ذاكرة حديد', 'Iron Memory'], ft_p_memoryD: ['الكومبو يستحمل ٨٥ ثانية بدل ٥٥', 'Combo survives 85 s instead of 55'],
  ft_p_talk: ['لسان حلو', 'Smooth Talker'], ft_p_talkD: ['السواقين بيبدأوا بصبر أعلى', 'Drivers start with more patience'],
  ft_p_charm: ['ابن بلد', 'Local Hero'], ft_p_charmD: ['العلاقة مع الوجوه المعروفة بتتحسن أسرع', 'Regulars warm to you twice as fast'],
  ft_p_radio: ['لاسلكي سريع', 'Fast Radio'], ft_p_radioD: ['الاستعلام أسرع ٤٠٪', 'Verification 40% faster'],
  ft_p_mech: ['ميكانيكي', 'Mechanic'], ft_p_mechD: ['المنطقة الخضرا في التصليح أوسع', 'Wider green zone when repairing'],
  ft_rival: ['منافسك الأسبوعي', 'Weekly rival'], ft_rivalSub: ['{n} — {s} نقطة • إنت {m}', '{n} — {s} pts • you {m}'], ft_rivalWin: ['إنت متقدم 🏆', 'You lead 🏆'], ft_rivalLose: ['هو متقدم', 'He leads'],
  ft_rivalTaunt: ['📻 الملازم عادل: "نشوف مين هيقفل الأسبوع الأول النهارده يا {r}"', '📻 Lt. Adel: "let us see who tops the week today, {r}"'],
  ft_rivalBeat: ['📻 الملازم عادل: "…ماشي، الأسبوع ده ليك"', '📻 Lt. Adel: "…fine, this week is yours"'], ft_rivalAhead: ['📻 الملازم عادل: "لسه ورايا يا بطل"', '📻 Lt. Adel: "still behind me, champ"'],
  ft_cold: ['🚨 العمليات: عربية مطلوبة داخلة عليك دلوقتي — أول قرار ليك!', '🚨 Dispatch: a wanted vehicle is rolling in right now — your first call!'],
  ft_letters: ['✉️ بريد الوردية', '✉️ Shift mail'], ft_cmp: ['شكاوى', 'Complaints'], ft_cmd: ['تقديرات', 'Commendations'], ft_cmpTalk: ['المشرف كلمك بسبب ٣ شكاوى — خصم ١٠٠ خبرة', 'The supervisor had a word about 3 complaints — −100 XP'],
  ft_cmpLine: ['شكوى من {n}: "الضابط كان قاسي من غير سبب"', 'Complaint from {n}: "the officer was harsh for no reason"'], ft_cmdLine: ['تقدير من {n}: "شكراً على المعاملة المحترمة"', 'Thanks from {n}: "thank you for the respectful treatment"'], ft_cmdCatch: ['تقدير من العمليات على ضبط {v}', 'Commendation from dispatch for the {v} catch'], ft_noMail: ['مفيش بريد النهارده', 'No mail today'],
  ft_style: ['اللقب والشارة', 'Title & badge'], ft_styleSub: ['بتتفتح بالتقديرات ({n})', 'Unlocked by commendations ({n})'], ft_none: ['بدون لقب', 'No title'],
  ft_t1: ['نسر الكمين', 'Eagle of the Checkpoint'], ft_t2: ['عين الصقر', 'Hawk Eye'], ft_t3: ['أسطورة الطريق', 'Legend of the Road'], ft_badge: ['لون الشارة', 'Badge colour']
});
CP.Feat = {}; const FT = CP.Feat, fh = CP.h;
const carOf = () => (CP.G && CP.G.career) || null;

/* ======================= A1 directives ======================= */
FT.RULES = {
  expired: { cond: c => c.fam === 'expired', ok: c => ['citation', 'warning', 'hold', 'handover'].indexOf(c.res.decision) >= 0, s: 'ft_r_expired' },
  pax: { cond: c => c.pax >= 3, ok: c => !!c.k.greeted, s: 'ft_r_pax' },
  plate: { cond: (c, s) => c.plate && c.plate.l && c.plate.l[0] === s.events.dirLetter, ok: c => !!(c.k.verif && (c.k.verif.vehicle.length || c.k.verif.person.length)), s: 'ft_r_plate' },
  comm: { cond: c => (CP.C.veh[c.type] || {}).cls && CP.C.veh[c.type].cls !== 'private', ok: c => !!c.k.docsViewed, s: 'ft_r_comm' },
  night: { cond: () => (CP.R.nightLvl || 0) > 0.5, ok: c => !!c.k.stopped, s: 'ft_r_night' }
};
FT.ruleText = (k, s) => CP.t(FT.RULES[k].s, { L: CP.C.plateLetters ? CP.L(CP.C.plateLetters[s.events.dirLetter] || { ar: '?', en: '?' }) : s.events.dirLetter });
CP.bus.on('shiftStart', () => {
  const s = CP.G.shift, car = carOf(); if (!car || !car.tutorialDone) return;
  const n = Math.min(3, 1 + Math.floor((car.totals.shifts || 0) / 3)); const keys = Object.keys(FT.RULES); const r = CP.srng ? CP.srng() : Math.random;
  const seed = (s.no * 7 + (car.totals.shifts || 0) * 13) % 1000; const pick = []; let i = seed % keys.length; while (pick.length < n) { const k = keys[i % keys.length]; if (pick.indexOf(k) < 0) pick.push(k); i += 3; }
  s.events.directives = pick; s.events.dirLetter = (seed * 3) % ((CP.C.plateLetters && CP.C.plateLetters.length) || 10);
  setTimeout(() => { if (CP.G.shift !== s) return; CP.UI.banner(CP.t('ft_bulletin') + ': ' + pick.map(k => FT.ruleText(k, s)).join(' • '), 'info'); CP.Audio.radioClick(true); FT.showBulletin(s); }, 1200);
});
FT.showBulletin = function (s) {
  if (document.getElementById('bulletin')) return; CP.FX.hold = true;
  const box = fh('div', { class: 'choicecard bulletin', role: 'dialog' }, fh('div', { class: 'lbl' }, CP.t('ft_bulletin')), fh('ul', null, ...s.events.directives.map(k => fh('li', null, FT.ruleText(k, s)))),
    fh('button', { class: 'btn pri', onclick: () => { box.remove(); CP.FX.hold = false; CP.Audio.click(); } }, '✔'));
  box.id = 'bulletin'; document.getElementById('stage').appendChild(box);
};
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !c.res || !s.events.directives || !s.events.directives.length) return; const v = CP.vehOfCase(c); const vx = v ? v.x - v.len / 2 : null, vy = v ? CP.R.rowY(v.row) + 3.4 : null;
  for (const k of s.events.directives) { const R = FT.RULES[k]; if (!R.cond(c, s)) continue;
    if (R.ok(c)) CP.Prog.gain(35, vx, vy, '#8fd3ff', CP.t('ft_dirOk'));
    else { s.prog.xp = Math.max(0, s.prog.xp - 40); CP.R.popup('−40 ' + CP.t('pr_xp'), vx, vy, '#ff6a6a'); CP.UI.banner(CP.t('ft_dirMiss', { r: FT.ruleText(k, s) }), 'warn'); CP.Audio.chime('bad'); (s.events.letters = s.events.letters || { cmp: [], cmd: [] }); }
  }
});
// HUD chip (click to re-open the bulletin)
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); if (!s.events.directives || !s.events.directives.length) return; const ctx = this.ctx; const text = '📋 ' + CP.t('ft_dirChip') + ' ' + CP.num(s.events.directives.length); ctx.save(); ctx.font = `700 ${CP.UI.isMob ? 11 : 13}px ${CP.UI.font()}`; const w = ctx.measureText(text).width + 18, x = CP.lang === 'ar' ? 12 : this.W - w - 12, y = this.H * 0.16; ctx.fillStyle = 'rgba(20,22,30,.8)'; ctx.strokeStyle = 'rgba(143,211,255,.5)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 24, 8) : ctx.rect(x, y, w, 24); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#cfe9ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + w / 2, y + 13); ctx.restore(); this.dirChip = { x, y, w, h: 24 }; }; }
document.addEventListener('pointerdown', e => { const R = CP.R, c = R.cv; if (!c || e.target !== c || !R.dirChip || !CP.G.shift) return; const r = c.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, d = R.dirChip; if (px > d.x && px < d.x + d.w && py > d.y && py < d.y + d.h) { e.stopPropagation(); FT.showBulletin(CP.G.shift); } }, true);

/* ======================= B1 aftermath radio ======================= */
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !c.res || !c.res.eval) return; const serious = CP.FAM[c.fam] && CP.FAM[c.fam].serious; const V = CP.C.veh[c.type]; const vn = { ar: V.colour[0] + ' ' + V.make[0], en: V.colour[1] + ' ' + V.make[1] };
  const soft = ['waved', 'release', 'advice'].indexOf(c.res.decision) >= 0, hard = ['hold', 'handover'].indexOf(c.res.decision) >= 0;
  let kind = null; if (serious && soft && !c.res.eval.sound) kind = 'bad'; else if (serious && hard && c.res.eval.sound) kind = 'good'; else if (Math.random() < 0.18) kind = 'neutral'; if (!kind) return;
  (s.events.after = s.events.after || []).push({ at: s.t + 40 + Math.random() * 50, kind, vn, id: c.id });
});
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s || !s.events.after || s.ended) return; for (const a of s.events.after) { if (a.done || s.t < a.at) continue; a.done = true;
    const key = a.kind === 'bad' ? (Math.random() < 0.5 ? 'ft_after_bad' : 'ft_after_bad2') : a.kind === 'good' ? (Math.random() < 0.5 ? 'ft_after_good' : 'ft_after_good2') : 'ft_after_neutral';
    CP.UI.banner(CP.t(key, { v: CP.L(a.vn) }), a.kind === 'bad' ? 'emergency' : a.kind === 'good' ? 'ok' : 'info'); CP.Audio.radioClick(true);
    if (a.kind === 'bad') { s.prog.xp = Math.max(0, s.prog.xp - 80); CP.R.popup('−80 ' + CP.t('pr_xp'), null, null, '#ff6a6a'); CP.G.career.trust = CP.clamp(CP.G.career.trust - 3, 0, 100); CP.Pulse.flash('200,30,30', 0.3); FT.buzz([60, 40, 60]); }
    if (a.kind === 'good') { CP.Prog.gain(90, null, null, '#ffd35a', '📻'); CP.R.confetti(30); FT.buzz(40); }
  } });

/* ======================= C1 perks ======================= */
FT.PERKS = { eagle: { br: 'inv', cost: 1 }, memory: { br: 'inv', cost: 2 }, talk: { br: 'neg', cost: 1 }, charm: { br: 'neg', cost: 2 }, radio: { br: 'fld', cost: 1 }, mech: { br: 'fld', cost: 2 } };
FT.perks = () => { const c = carOf(); c.perks = c.perks || {}; return c.perks; };
FT.points = c => CP.Prog.rankOf(c.xp) - Object.keys(c.perks || {}).reduce((a, k) => a + (FT.PERKS[k] ? FT.PERKS[k].cost : 0), 0);
FT.has = k => { const c = carOf(); return !!(c && c.perks && c.perks[k]); };
FT.perksModal = function () {
  const car = carOf(); if (!car) return; car.perks = car.perks || {}; const pts = FT.points(car); const wrap = fh('div', { class: 'modal' }); const close = () => wrap.remove();
  const br = (id, label) => fh('div', { class: 'perk-branch' }, fh('b', null, CP.t(label)), ...Object.keys(FT.PERKS).filter(k => FT.PERKS[k].br === id).map(k => { const own = !!car.perks[k], can = pts >= FT.PERKS[k].cost;
    return fh('button', { class: 'perk' + (own ? ' own' : can ? '' : ' locked'), onclick: () => { if (own || !can) { CP.Audio.clickSoft(); return; } car.perks[k] = true; CP.save(); CP.Audio.fanfare(); close(); FT.perksModal(); } },
      fh('span', { class: 'pk-i' }, { eagle: '🦅', memory: '🧠', talk: '💬', charm: '🤝', radio: '📻', mech: '🔧' }[k]), fh('span', { class: 'pk-t' }, fh('b', null, CP.t('ft_p_' + k)), fh('small', null, CP.t('ft_p_' + k + 'D'))), fh('span', { class: 'pk-c' }, own ? CP.t('ft_owned') : (can ? CP.t('ft_buy') + ' • ' : CP.t('ft_locked') + ' • ') + CP.num(FT.PERKS[k].cost))); }));
  wrap.appendChild(fh('div', { class: 'mc glass perks' }, fh('div', { class: 'row' }, fh('b', { style: 'font-size:1.2em' }, CP.t('ft_perks')), fh('span', { class: 'sp' }), fh('span', { class: 'tag ok' }, CP.t('ft_perkPts', { n: CP.num(pts) })), fh('button', { class: 'btn sm ghost', onclick: close }, '✕')), fh('div', { class: 'small muted' }, CP.t('ft_perkSub')), fh('div', { class: 'perk-grid' }, br('inv', 'ft_inv'), br('neg', 'ft_neg'), br('fld', 'ft_fld'))));
  document.body.appendChild(wrap);
};
// effects
CP.bus.on('shiftStart', () => { CP.UI.docAssist = FT.has('eagle') ? 'perk' : CP.UI.docAssist === 'perk' ? null : CP.UI.docAssist; CP.Pulse.comboTimeout = FT.has('memory') ? 85 : 55; CP.Polish.zoneW = FT.has('mech') ? 0.3 : 0.18; });
{ const td = CP.Cases.trueDiscrepancies; CP.Cases.trueDiscrepancies = function (c) { const r = td.apply(this, arguments); return CP.UI.docAssist === 'perk' && !CP.S.assist ? r.slice(0, 1) : r; }; }
CP.bus.on('spawn', v => { const c = CP.G.shift.cases[v.caseId]; if (c && FT.has('talk')) c.patience = Math.min(100, c.patience + 15); });
{ const add = CP.Tasks.add; CP.Tasks.add = function (spec) { if (spec.type === 'radio' && FT.has('radio')) spec = Object.assign({}, spec, { dur: spec.dur * 0.6 }); return add.call(this, spec); }; }
CP.bus.on('caseClosed', c => { if (c.regular && FT.has('charm') && c.res && c.res.eval && c.res.eval.sound && CP.G.career.regulars && CP.G.career.regulars[c.regular]) CP.G.career.regulars[c.regular].rel = Math.min(4, CP.G.career.regulars[c.regular].rel + 1); });

/* ======================= D2 rival ======================= */
FT.week = () => { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return Math.floor((d - j) / 864e5 / 7) + d.getFullYear() * 60; };
FT.rival = () => { const c = carOf(); if (!c) return null; const w = FT.week(); if (!c.rival || c.rival.week !== w) { const best = c.records && c.records.length ? Math.max(...c.records.map(r => r.score)) : 60; c.rival = { week: w, name: { ar: 'الملازم عادل', en: 'Lt. Adel' }, score: Math.round(CP.clamp(best * 0.92 + 6 + (w % 7) * 1.5, 55, 97)), mine: 0 }; } return c.rival; };
CP.bus.on('shiftStart', () => { const r = FT.rival(); const c = carOf(); if (!r || !c.tutorialDone) return; setTimeout(() => { if (CP.G.shift) CP.UI.banner(CP.t('ft_rivalTaunt', { r: CP.Prog.rankName(CP.Prog.rankOf(c.xp)) }), 'info'); }, 9000); });
FT.rivalReport = rep => { const r = FT.rival(); if (!r || !rep) return; const sc = rep.score ?? rep.total ?? 0; r.mine = Math.max(r.mine, sc); setTimeout(() => CP.UI.toast(CP.t(r.mine > r.score ? 'ft_rivalBeat' : 'ft_rivalAhead'), r.mine > r.score ? 'ok' : 'info'), 900); };

/* ======================= F1 cold open ======================= */
CP.bus.on('shiftStart', () => { const s = CP.G.shift, c = carOf(); if (!s || !c || c.tutorialDone || s.no !== 1 || s.events.coldOpen) return; s.events.coldOpen = true;
  setTimeout(() => { if (CP.G.shift !== s) return; const cs = CP.Cases.generate({ fam: 'lookout' }); if (!cs) return; cs.variant = 'B'; cs.flags = cs.flags || {}; cs.flags.lookoutMatch = true; const v = CP.T.mk(cs.type, { caseId: cs.id, x: -1.5, v: 8 }); s.vehicles.push(v); s.spawned++; cs.status = 'approach'; cs.spawnT = s.t; CP.bus.emit('spawn', v);
    s.events.wanted = { caseId: cs.id, at: s.t, plate: cs.flags.lookoutPlate || cs.plate, type: cs.type, done: false, spawned: true, vid: v.id }; s.events.active.push({ type: 'wanted', t0: s.t, caseId: cs.id });
    CP.UI.banner(CP.t('ft_cold'), 'emergency'); CP.Audio.siren(true); setTimeout(() => CP.Audio.siren(false), 1500); CP.R.punch(); FT.buzz([80, 40, 80]); }, 2500); });

/* ======================= B2 letters ======================= */
FT.mail = s => (s.events.mail = s.events.mail || { cmp: [], cmd: [] });
CP.bus.on('caseClosed', c => { const s = CP.G.shift; if (!s || !c.res || !c.res.eval) return; const m = FT.mail(s); const harsh = ['citation', 'hold', 'handover'].indexOf(c.res.decision) >= 0; const serious = CP.FAM[c.fam] && CP.FAM[c.fam].serious; const V = CP.C.veh[c.type];
  if (harsh && !c.res.eval.sound) m.cmp.push(CP.t('ft_cmpLine', { n: CP.L(c.driver.name) }));
  if (serious && harsh && c.res.eval.sound) m.cmd.push(CP.t('ft_cmdCatch', { v: CP.L({ ar: V.colour[0] + ' ' + V.make[0], en: V.colour[1] + ' ' + V.make[1] }) }));
  if (c.regular && !harsh && c.res.eval.sound && Math.random() < 0.5) m.cmd.push(CP.t('ft_cmdLine', { n: CP.L(c.driver.name) })); });
{ const rep = CP.Screens.report; CP.Screens.report = function (r) { const s = CP.G.shift; const m = s ? FT.mail(s) : { cmp: [], cmd: [] }; const car = carOf(); const out = rep.apply(this, arguments); FT.rivalReport(r);
    if (car) { car.mail = car.mail || { cmp: 0, cmd: 0 }; car.mail.cmp += m.cmp.length; car.mail.cmd += m.cmd.length; if (car.mail.cmp >= 3) { car.mail.cmp = 0; car.xp = Math.max(0, car.xp - 100); CP.UI.toast(CP.t('ft_cmpTalk'), 'warn'); } CP.save && CP.save(); }
    const host = document.querySelector('#report .mc, #report'); if (!host) return out;
    const card = fh('div', { class: 'card col mail' }, fh('b', null, CP.t('ft_letters')), ...(m.cmp.length + m.cmd.length ? [] : [fh('div', { class: 'muted small' }, CP.t('ft_noMail'))]),
      ...m.cmd.map(x => fh('div', { class: 'ln cmd' }, '💌 ' + x)), ...m.cmp.map(x => fh('div', { class: 'ln cmp' }, '⚠️ ' + x)));
    const anchor = host.querySelector('.cases'); if (anchor) anchor.parentElement.insertBefore(card, anchor); else host.appendChild(card); return out; }; }

/* ======================= C3 cosmetics ======================= */
FT.TITLES = [{ id: 'none', need: 0 }, { id: 't1', need: 3 }, { id: 't2', need: 8 }, { id: 't3', need: 15 }];
FT.BADGES = ['#f0b840', '#c9d3e0', '#6fb7ff', '#ff6a6a'];
FT.styleModal = function () {
  const car = carOf(); if (!car) return; car.style = car.style || { title: 'none', badge: 0 }; const n = (car.mail && car.mail.cmd) || 0; const wrap = fh('div', { class: 'modal' }); const close = () => wrap.remove();
  wrap.appendChild(fh('div', { class: 'mc glass perks' }, fh('div', { class: 'row' }, fh('b', { style: 'font-size:1.2em' }, CP.t('ft_style')), fh('span', { class: 'sp' }), fh('button', { class: 'btn sm ghost', onclick: close }, '✕')), fh('div', { class: 'small muted' }, CP.t('ft_styleSub', { n: CP.num(n) })),
    fh('div', { class: 'perk-grid' }, fh('div', { class: 'perk-branch' }, fh('b', null, CP.t('ft_style')), ...FT.TITLES.map(t => { const ok = n >= t.need, on = car.style.title === t.id; return fh('button', { class: 'perk' + (on ? ' own' : ok ? '' : ' locked'), onclick: () => { if (!ok) return; car.style.title = t.id; CP.save(); CP.Audio.click(); close(); FT.styleModal(); } }, fh('span', { class: 'pk-i' }, t.id === 'none' ? '—' : '🎖️'), fh('span', { class: 'pk-t' }, fh('b', null, t.id === 'none' ? CP.t('ft_none') : CP.t('ft_' + t.id)), fh('small', null, ok ? '' : CP.num(t.need) + ' ' + CP.t('ft_cmd'))), fh('span', { class: 'pk-c' }, on ? '✓' : '')); })),
      fh('div', { class: 'perk-branch' }, fh('b', null, CP.t('ft_badge')), fh('div', { class: 'row' }, ...FT.BADGES.map((c, i) => fh('button', { class: 'swatch' + (car.style.badge === i ? ' on' : ''), style: `background:${c}`, 'aria-disabled': i > Math.floor(n / 4) ? 'true' : 'false', onclick: () => { if (i > Math.floor(n / 4)) return; car.style.badge = i; CP.save(); FT.applyStyle(); CP.Audio.clickSoft(); close(); FT.styleModal(); } })))))));
  document.body.appendChild(wrap);
};
FT.applyStyle = () => { const car = carOf(); if (!car || !car.style) return; document.documentElement.style.setProperty('--amberUser', FT.BADGES[car.style.badge] || FT.BADGES[0]); };
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); const car = carOf(); if (!car || !car.style || car.style.title === 'none' || !this.hitsOfficer) return; const ctx = this.ctx, o = this.hitsOfficer; ctx.save(); ctx.font = `700 ${Math.max(10, 0.26 * this.ppm)}px ${CP.UI.font()}`; ctx.textAlign = 'center'; ctx.fillStyle = FT.BADGES[car.style.badge] || '#f0b840'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6; ctx.fillText('★ ' + CP.t('ft_' + car.style.title), o.x, o.y - 1.95 * this.ppm); ctx.restore(); }; }

/* ======================= menu cards ======================= */
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { menu.apply(this, arguments); const saved = CP.loadSaved(); const car = saved && saved.career; const cards = document.querySelector('.rv-cards'); if (!car || !cards) return; CP.G = CP.G || saved; FT.applyStyle();
    const pts = FT.points(car); cards.appendChild(fh('button', { class: 'rv-card' + (pts > 0 ? ' new' : ''), onclick: () => { CP.G = saved; CP.Audio.click(); FT.perksModal(); } }, fh('span', { class: 'rv-ci' }, '🧩'), fh('span', { class: 'rv-ct' }, fh('b', null, CP.t('ft_perks')), fh('small', null, CP.t('ft_perkPts', { n: CP.num(pts) }))), fh('span', { class: 'rv-go' }, '›')));
    const r = (() => { CP.G = saved; return FT.rival(); })(); cards.appendChild(fh('div', { class: 'rv-card static' }, fh('span', { class: 'rv-ci' }, '🥊'), fh('span', { class: 'rv-ct' }, fh('b', null, CP.t('ft_rival')), fh('small', null, CP.t('ft_rivalSub', { n: CP.L(r.name), s: CP.num(r.score), m: CP.num(r.mine) }))), fh('span', { class: 'tag ' + (r.mine > r.score ? 'ok' : '') }, CP.t(r.mine > r.score ? 'ft_rivalWin' : 'ft_rivalLose'))));
    cards.appendChild(fh('button', { class: 'rv-card', onclick: () => { CP.G = saved; CP.Audio.click(); FT.styleModal(); } }, fh('span', { class: 'rv-ci' }, '🎖️'), fh('span', { class: 'rv-ct' }, fh('b', null, CP.t('ft_style')), fh('small', null, CP.t('ft_styleSub', { n: CP.num((car.mail && car.mail.cmd) || 0) }))), fh('span', { class: 'rv-go' }, '›'))); }; }

/* ======================= G1 micro-animations ======================= */
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return; const g = s.gate;
  if (g.state === 'open' && g._was !== 'open') { g.bounceT = 0.7; } if (g.state === 'closed' && g._was !== 'closed') { g.bounceT = 0.5; } g._was = g.state; if (g.bounceT > 0) g.bounceT -= 1 / 60;
  // paper handed through the window when the driver produces the documents
  for (const id in s.cases) { const c = s.cases[id]; if (c.k.docsHave && !c._paperFx) { c._paperFx = true; const v = CP.vehOfCase(c); if (v && v.x > 0) CP.R.fx.push({ kind: 'paper', t0: CP.R.t, dur: 0.75, x0: CP.T.windowX(v), y0: CP.R.rowY(v.row) + 1.1, x1: s.officer.x, y1: CP.R.actorY(s.officer.row) + 1.25 }); } }
  // booth light flickers on at dusk
  const n = CP.R.nightLvl || 0; if (n > 0.4 && !s.events.boothLit) { s.events.boothLit = CP.R.t; } if (n < 0.3) s.events.boothLit = 0;
});
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); const ctx = this.ctx, R = this;
    for (const f of this.fx) { if (f.kind !== 'paper') continue; const p = CP.clamp((this.t - f.t0) / f.dur, 0, 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; const x = R.sx(f.x0 + (f.x1 - f.x0) * e), y = R.sy(f.y0 + (f.y1 - f.y0) * e) - Math.sin(p * Math.PI) * 0.35 * R.ppm; ctx.save(); ctx.translate(x, y); ctx.rotate((p - 0.5) * 0.8); ctx.fillStyle = '#f4efe2'; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 4; ctx.fillRect(-0.11 * R.ppm, -0.08 * R.ppm, 0.22 * R.ppm, 0.16 * R.ppm); ctx.fillStyle = '#9aa'; ctx.fillRect(-0.08 * R.ppm, -0.04 * R.ppm, 0.14 * R.ppm, 0.015 * R.ppm); ctx.fillRect(-0.08 * R.ppm, 0.0 * R.ppm, 0.1 * R.ppm, 0.015 * R.ppm); ctx.restore(); }
    if (s.events.boothLit) { const age = this.t - s.events.boothLit; const on = age > 1.6 || (Math.floor(age * 9) % 3 !== 1); if (on) { const cx = R.sx(CP.W.boothX + 0.35), cy = R.sy(R.Y.mainFar + 0.12) - 1.55 * R.ppm; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1.3 * R.ppm); g.addColorStop(0, 'rgba(255,220,150,.28)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 1.3 * R.ppm, cy - 1.3 * R.ppm, 2.6 * R.ppm, 2.6 * R.ppm); ctx.restore(); } }
  }; }
CP.bus.on('caseClosed', c => { const s = CP.G.shift; if (!s || !s.partner || s.partner.moving) return; CP.Actors.seq('partner', ['documents', 'idle'], 0.55, 0); });
{ const fxs = CP.R.fx; } // (fx entries expire through the renderer's own age check; paper uses t0/dur like bubbles)
CP.bus.on('stepEnd', () => { const R = CP.R; if (!R.fx) return; R.fx = R.fx.filter(f => !(f.kind === 'paper' && R.t - f.t0 > f.dur)); });

/* ======================= G2 ducking ======================= */
{ const bn = CP.UI.banner; CP.UI.banner = function (text, kind) { const A = CP.Audio; A.ducked = true; clearTimeout(FT._duck); FT._duck = setTimeout(() => { A.ducked = false; if (A.ok) { const t = A.ctx.currentTime; A.burst(0.12, 0.02, 3000, 0.7, t, 'bandpass'); } }, 3200); return bn.apply(this, arguments); }; }

/* ======================= G3 haptics ======================= */
FT.buzz = p => { if (CP.S.haptics === false || !navigator.vibrate) return; try { navigator.vibrate(p); } catch (e) { } };
{ const st = CP.R.stamp; CP.R.stamp = function () { FT.buzz(35); return st.apply(this, arguments); }; }
CP.bus.on('caseClosed', c => { if (c.res && c.res.eval && c.res.eval.sound && CP.FAM[c.fam] && CP.FAM[c.fam].serious && ['hold', 'handover'].indexOf(c.res.decision) >= 0) FT.buzz([50, 30, 90]); });
;(window.CP_FILES = window.CP_FILES || {})['28_features'] = '2.2.2';
