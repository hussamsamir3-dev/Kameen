/* Pulse (v1.5): the "one more car" layer. Everything here plugs into the existing director, case families and XP engine.
   1. Wanted vehicle — dispatch broadcasts a plate; a matching (or near-matching) lookout case arrives a minute later.
      Stopping the real one by the book pays big; a wave-through lets it escape. A near-miss plate tests the player's eye.
   2. Rush hour — a 70 s traffic surge with 1.5× case XP and a live countdown.
   3. Pacing — cars arrive faster the better you get (baseline was 21–48 s between cars).
   4. Juice — hit-stop and a screen flash on big catches, milestone stamps at 5×/10× combos, a live XP-multiplier pill. */
CP.addStrings({
  pl_wanted: ['📻 تعميم من العمليات: {v} لوحتها {p} — لو عدّت اوقفها', '📻 Dispatch lookout: {v}, plate {p} — stop it if it comes through'],
  pl_wantedHud: ['مطلوب', 'WANTED'], pl_wantedCaught: ['قبضت على المطلوب!', 'WANTED — CAUGHT'], pl_wantedEsc: ['العربية المطلوبة عدّت!', 'The wanted vehicle got through'],
  pl_nearMiss: ['عين صقر — اللوحة كانت مختلفة بحرف', 'Sharp eye — the plate differed by one letter'], pl_wantedGone: ['التعميم اتلغى — العربية اتقبض عليها في كمين تاني', 'Lookout cancelled — picked up at another checkpoint'],
  pl_rush: ['⚡ ساعة الذروة! زحمة جاية والخبرة ×١٫٥ لمدة دقيقة', '⚡ Rush hour! Heavy traffic — case XP ×1.5 for a minute'], pl_rushHud: ['ذروة', 'RUSH'], pl_rushEnd: ['الذروة خلصت', 'Rush hour over'],
  pl_combo5: ['كومبو ×٥!', '5× COMBO!'], pl_combo10: ['كومبو ×١٠ — نار!', '10× COMBO — ON FIRE!'], pl_mult: ['خبرة', 'XP']
});
CP.Pulse = {};
const PL = CP.Pulse, PE = CP.Events, PW = CP.W;

/* ---------- director hooks ---------- */
PE.MINOR.push('rush'); PE.MAJOR.push('wanted');
PE.tierOf.rush = 2; PE.tierOf.wanted = 3;
{ const can = PE.can; PE.can = function (t) {
    const s = CP.G.shift, E = s.events;
    if (t === 'rush') return !(E.rushUntil > s.t) && s.t < s.dur - 110 && s.vehicles.filter(v => v.caseId && !s.cases[v.caseId].res).length <= 3;
    if (t === 'wanted') return !E.wanted && s.t < s.dur - 150 && !Object.values(s.cases).some(c => !c.res && c.fam === 'lookout');
    return can.call(this, t);
  }; }
{ const start = PE.start; PE.start = function (t) {
    const s = CP.G.shift, E = s.events, r = CP.srng();
    if (t === 'rush') { E.rushUntil = s.t + 70; s.spawnT = Math.min(s.spawnT, 1.5); E.active.push({ type: t, t0: s.t }); PE.log(t, 'pl_rush', 'warn'); CP.Audio.chime('obj'); CP.Audio.horn && CP.Audio.horn('short', 4); CP.R.punch(); return true; }
    if (t === 'wanted') {
      const c = CP.Cases.generate({ fam: 'lookout' }); if (!c) return false;
      c.status = 'offscreen'; const V = CP.C.veh[c.type];
      E.wanted = { caseId: c.id, at: s.t + 45 + r() * 45, plate: c.flags.lookoutPlate, type: c.type, done: false, spawned: false };
      E.active.push({ type: t, t0: s.t, caseId: c.id });
      PE.log(t, CP.fill([CP.STR.ar.pl_wanted, CP.STR.en.pl_wanted], { v: { ar: V.make[0] + ' ' + V.colour[0], en: V.colour[1] + ' ' + V.make[1] }, p: { ar: CP.plateStr(E.wanted.plate, 'ar'), en: CP.plateStr(E.wanted.plate, 'en') } }), 'warn');
      CP.Audio.radioClick(true); return true;
    }
    return start.call(this, t);
  }; }
/* the wanted case drives in once dispatch has had its minute; both events end themselves */
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s || s.ended) return; const E = s.events;
  if (E.rushUntil && E.rushUntil <= s.t) { E.rushUntil = 0; E.active = E.active.filter(e => e.type !== 'rush'); CP.UI.toast(CP.t('pl_rushEnd'), 'ok'); }
  const w = E.wanted;
  if (w && !w.spawned && s.t >= w.at && CP.T.tailX(0) > 2) {
    const c = s.cases[w.caseId]; if (!c) { E.wanted = null; return; }
    const v = CP.T.mk(c.type, { caseId: c.id, x: -1.5, v: 6 }); s.vehicles.push(v); s.spawned++; c.status = 'approach'; c.spawnT = s.t; w.spawned = true; w.vid = v.id; CP.bus.emit('spawn', v);
  }
  // never spawned (queue stayed full) or never dealt with: dispatch cancels the lookout quietly
  if (w && !w.done && ((!w.spawned && s.t - w.at > 240) || (w.spawned && s.t - w.at > 420 && !(s.cases[w.caseId] && s.cases[w.caseId].k.stopped)))) {
    w.done = true; E.wanted = null; E.active = E.active.filter(e => e.type !== 'wanted');
    if (!w.spawned) { const c = s.cases[w.caseId]; if (c && c.status === 'offscreen') delete s.cases[w.caseId]; CP.UI.toast(CP.t('pl_wantedGone'), 'info'); }
  }
});
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift, E = s.events, w = E.wanted; if (!w || w.done || c.id !== w.caseId) return;
  w.done = true; E.active = E.active.filter(e => e.type !== 'wanted');
  const v = CP.vehOfCase(c); const vx = v ? v.x - v.len / 2 : null, vy = v ? CP.R.rowY(v.row) + 3.2 : null;
  const real = c.variant === 'B', dec = c.res.decision;
  if (real && ['hold', 'handover', 'refer_admin'].indexOf(dec) >= 0) {
    CP.Prog.gain(140, vx, vy, '#ff9a4a', CP.t('pl_wantedHud')); CP.R.stamp(CP.t('pl_wantedCaught'), '#ff5a5a'); CP.R.confetti(90); CP.R.punch(); CP.R.shake(9, 0.5); PL.flash('255,120,40', 0.5); PL.hitStop(260);
    CP.Audio.siren(true); setTimeout(() => CP.Audio.siren(false), 1800); CP.Audio.chime('great'); CP.G.career.trust = CP.clamp(CP.G.career.trust + 3, 0, 100);
  } else if (real) { PE.log('wanted', 'pl_wantedEsc', 'emergency'); CP.G.career.trust = CP.clamp(CP.G.career.trust - 3, 0, 100); s.prog.combo = 0; CP.Audio.chime('bad'); PL.flash('200,30,30', 0.45); }
  else if (['waved', 'release', 'advice'].indexOf(dec) >= 0) { CP.Prog.gain(45, vx, vy, '#8fd3ff', CP.t('pl_nearMiss')); CP.Audio.chime('good'); }
  setTimeout(() => { if (CP.G.shift === s) E.wanted = null; }, 0);
});
/* case XP ×1.5 during rush hour (objective XP is unaffected) */
{ const gain = CP.Prog.gain; CP.Prog.gain = function (xp, x, yup, color, label) {
    const s = CP.G.shift; if (s && s.events.rushUntil > s.t && x != null) xp = Math.round(xp * 1.5);
    return gain.call(this, xp, x, yup, color, label); }; }

/* ---------- pacing: traffic keeps up with the player ---------- */
PL.spawnGap = function (s) {
  const cairo = CP.locBase(s.loc) === 'cairo'; let lo = cairo ? 14 : 18, hi = cairo ? 26 : 34;
  const t = Math.min(6, (CP.tier() - 1) * 1.3); lo = Math.max(9, lo - t); hi = Math.max(lo + 8, hi - t * 1.5);
  if (s.events.rushUntil > s.t) { lo *= 0.32; hi *= 0.32; }
  return [lo, hi];
};

/* ---------- juice ---------- */
PL.flash = function (rgb, a) { CP.R.flashC = rgb; CP.R.flashA = a; };
PL.hitStop = function (ms) { if (CP.S.reducedFx || CP.FX.hold) return; CP.FX.hold = true; setTimeout(() => { CP.FX.hold = false; }, ms); };
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !s.prog || !c.res || !c.res.eval || !c.res.eval.sound) return;
  const n = s.prog.combo;
  if (n === 5) { CP.R.stamp(CP.t('pl_combo5'), '#ffd35a'); PL.flash('255,200,60', 0.22); }
  if (n === 10) { CP.R.stamp(CP.t('pl_combo10'), '#ff7a3a'); PL.flash('255,120,40', 0.3); CP.R.shake(6, 0.4); CP.Audio.fanfare(); }
  if (CP.FAM[c.fam] && CP.FAM[c.fam].serious && ['hold', 'handover', 'medical', 'refer_admin'].indexOf(c.res.decision) >= 0) { PL.hitStop(200); PL.flash('255,170,80', 0.3); CP.R.shake(5, 0.35); }
});
/* screen flash, live event pills (rush countdown / wanted plate) */
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) {
    wui.call(this, s, alpha);
    const ctx = this.ctx, W = this.W, font = CP.UI ? CP.UI.font() : 'sans-serif';
    if (this.flashA > 0.005 && !CP.S.reducedFlash) { ctx.fillStyle = `rgba(${this.flashC},${this.flashA})`; ctx.fillRect(0, 0, W, this.H); this.flashA *= 0.86; }
    const E = s.events; let y = 12;
    const pill = (text, bg, fg) => { ctx.save(); ctx.font = `800 ${CP.UI.isMob ? 12 : 14}px ${font}`; const w = ctx.measureText(text).width + 22, h = 26; const x = W / 2 - w / 2;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 9) : ctx.rect(x - 2, y - 2, w + 4, h + 4); ctx.fill();
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fill();
      ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, y + h / 2 + 1); ctx.restore(); y += h + 8; };
    if (E.rushUntil > s.t) pill('⚡ ' + CP.t('pl_rushHud') + ' ×1.5  ' + CP.fmtTime(E.rushUntil - s.t), `rgba(255,200,60,${0.8 + 0.2 * Math.sin(this.t * 5)})`, '#1a1200');
    if (E.wanted && !E.wanted.done) { const w = E.wanted; pill('🚨 ' + CP.t('pl_wantedHud') + ': ' + CP.plateStr(w.plate, CP.lang) + (w.spawned ? '  ◄' : ''), w.spawned ? `rgba(255,70,60,${0.75 + 0.25 * Math.sin(this.t * 6)})` : 'rgba(255,90,80,.85)', '#fff'); }
    if (s.prog && s.prog.combo >= 2) { const m = (1 + 0.25 * Math.min(8, s.prog.combo - 1)) * (E.rushUntil > s.t ? 1.5 : 1); pill('🔥 ×' + m.toFixed(2).replace(/\.?0+$/, '') + ' ' + CP.t('pl_mult'), 'rgba(255,150,40,.9)', '#1a0c00'); }
  }; }


/* ---------- v1.6: tension ---------- */
CP.addStrings({
  pl_heat: ['الكومبو هيتقطع', 'Combo fading'], pl_heatLost: ['الكومبو اتقطع — بطء', 'Combo lost — too slow'],
  pl_insp: ['👔 المشرف واقف يتفرج: كل قرار سليم ×٢ خبرة، وأي غلطة −٦٠', '👔 The supervisor is watching: sound decisions ×2 XP, any mistake −60'], pl_inspHud: ['المشرف', 'INSPECTION'], pl_inspEnd: ['المشرف مشي — عاش', 'The supervisor left — well done'],
  pl_inspFail: ['غلطة قدام المشرف', 'Mistake in front of the supervisor'],
  pl_perfect: ['قرار مثالي!', 'PERFECT CALL!'], pl_streakDay: ['🔥 {n} يوم ورا بعض — خبرة اليوم +{p}٪', '🔥 {n}-day streak — today\'s XP +{p}%']
});
/* combo pressure: a combo fades after 55 s without a sound decision (warning pill in the last 15 s) */
CP.bus.on('caseClosed', c => { const s = CP.G.shift; if (s && c.res && c.res.eval && c.res.eval.sound) s.events.lastSoundT = s.t; });
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s || !s.prog || s.ended) return; const E = s.events;
  if (s.prog.combo >= 2 && E.lastSoundT != null && s.t - E.lastSoundT > (CP.Pulse.comboTimeout || 55)) { s.prog.combo = 0; CP.UI.toast(CP.t('pl_heatLost'), 'warn'); CP.Audio.chime('bad'); }
  if (E.inspUntil && E.inspUntil <= s.t) { E.inspUntil = 0; E.active = E.active.filter(e => e.type !== 'inspect'); CP.UI.banner(CP.t('pl_inspEnd'), 'ok'); CP.Prog.gain(60, null, null, '#8fe3a8'); CP.Audio.chime('obj'); }
});
/* supervisor inspection: 80 s window, ×2 XP for sound decisions, −60 XP and a complaint for mistakes */
PE.MINOR.push('inspect'); PE.tierOf.inspect = 2;
{ const can = PE.can; PE.can = function (t) { const s = CP.G.shift; if (t === 'inspect') return !(s.events.inspUntil > s.t) && !(s.events.rushUntil > s.t) && s.t < s.dur - 120; return can.call(this, t); }; }
{ const start = PE.start; PE.start = function (t) { const s = CP.G.shift, E = s.events;
    if (t === 'inspect') { E.inspUntil = s.t + 80; E.active.push({ type: t, t0: s.t }); PE.log(t, 'pl_insp', 'warn'); CP.Audio.radioClick(true); CP.R.punch(); return true; }
    return start.call(this, t); }; }
{ const gain = CP.Prog.gain; CP.Prog.gain = function (xp, x, yup, color, label) { const s = CP.G.shift; if (s && s.events.inspUntil > s.t && x != null) xp = Math.round(xp * 2); return gain.call(this, xp, x, yup, color, label); }; }
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !s.prog || !c.res || !c.res.eval || !(s.events.inspUntil > s.t)) return;
  if (!c.res.eval.sound) { s.prog.xp = Math.max(0, s.prog.xp - 60); CP.R.popup('−60 ' + CP.t('pr_xp'), null, null, '#ff6a6a'); CP.UI.banner(CP.t('pl_inspFail'), 'warn'); PL.flash('200,30,30', 0.35); CP.R.shake(6, 0.4); }
  else if ((c.res.eval.dec ?? 0) >= 92) { CP.R.stamp(CP.t('pl_perfect'), '#ffd35a'); CP.R.confetti(40); }
});
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); const E = s.events, ctx = this.ctx, W = this.W, font = CP.UI ? CP.UI.font() : 'sans-serif';
    const pill = (text, bg, fg, y) => { ctx.save(); ctx.font = `800 ${CP.UI.isMob ? 12 : 14}px ${font}`; const w = ctx.measureText(text).width + 22, h = 26, x = W / 2 - w / 2; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, y + h / 2 + 1); ctx.restore(); };
    let y = this.H * 0.16;
    if (E.inspUntil > s.t) { pill('👔 ' + CP.t('pl_inspHud') + ' ×2  ' + CP.fmtTime(E.inspUntil - s.t), `rgba(150,120,255,${0.8 + 0.2 * Math.sin(this.t * 4)})`, '#fff', y); y += 34; }
    if (s.prog && s.prog.combo >= 2 && E.lastSoundT != null) { const left = (CP.Pulse.comboTimeout || 55) - (s.t - E.lastSoundT); if (left < 15) pill('⏳ ' + CP.t('pl_heat') + ' ' + Math.ceil(left), `rgba(255,90,60,${0.6 + 0.4 * Math.sin(this.t * 8)})`, '#fff', y); }
  }; }
/* high-stakes situations added to the choice-event pool */
CP.FUN.push(
  { t: ['سواق بيمد إيده بورقة ٢٠٠ جنيه: "خلينا نخلص يا باشا".', 'A driver slides a 200-pound note: "let\'s just wrap this up, officer".'], o: [[['نرفض ونسجل محاولة رشوة', 'Refuse and log the bribe attempt'], { xp: 90, trust: 4 }], [['نتجاهل ونعدّيه', 'Ignore it and wave him on'], { trust: -6, xp: -40 }]] },
  { t: ['راكب في عربية فخمة: "إنت عارف أنا مين؟ ابن اللوا."', 'A passenger in a luxury car: "do you know who I am? The general\'s son."'], o: [[['الإجراء واحد للكل', 'Same procedure for everyone'], { xp: 80, trust: 3 }], [['نعدّيه من غير فحص', 'Let him through unchecked'], { trust: -5 }]] },
  { t: ['بلاغ من سواق تاكسي: "الميكروباص اللي وراي شايل حاجة غريبة".', 'A taxi driver tips you off: "the microbus behind me is carrying something odd".'], o: [[['نوقفه ونفتش بالأصول', 'Stop it and search properly'], { xp: 50, trust: 2, rush: false }], [['كلام سواقين', 'Just driver talk'], { trust: -1 }]] },
  { t: ['العمليات: "الدورية جاية تاخد المحتجز خلال دقيقتين — جهّز الورق".', 'Dispatch: "the patrol is 2 minutes out for the detainee — get the paperwork ready".'], o: [[['نجهّز الملف دلوقتي', 'Prepare the file now'], { xp: 45, trust: 2 }], [['نسيبه لما يوصلوا', 'Leave it until they arrive'], { trust: -2 }]] }
);
{ const ap = CP.Fun.apply; CP.Fun.apply = function (fx) { if (fx.xp < 0 && CP.G.shift.prog) { CP.G.shift.prog.xp = Math.max(0, CP.G.shift.prog.xp + fx.xp); CP.R.popup(CP.num(fx.xp) + ' ' + CP.t('pr_xp'), null, null, '#ff6a6a'); fx = Object.assign({}, fx, { xp: 0 }); } return ap.call(this, fx); }; }
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; const ob = document.getElementById('objBox'); if (!s || !ob) return; const dim = s.t > 12 && !(s.t - (s.events.objPingT || -99) < 8); ob.classList.toggle('dim', dim); });
{ const chk = CP.Prog.checkObjectives; CP.Prog.checkObjectives = function () { const s = CP.G.shift; const before = s && s.prog ? s.prog.objs.filter(o => o.done).length : 0; chk.apply(this, arguments); if (s && s.prog && s.prog.objs.filter(o => o.done).length !== before) s.events.objPingT = s.t; }; }
;(window.CP_FILES = window.CP_FILES || {})['24_pulse'] = '2.6.0';
