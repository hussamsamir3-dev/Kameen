/* Tow & pursuit (v2.7)
   TOW: any broken vehicle can be towed (tow popover option, the tow contract, or automatically after a spike stop).
        A flatbed tow truck enters on the lower road from the left, stops beside the broken car, the car is lifted onto
        the bed (lift → slide → settle), then truck + car drive off to the right and despawn beyond the frame.
   RUNNER: a stopped driver with something to hide may suddenly bolt — he smashes the barrier (jams it) and speeds off.
   SPIKES: a spike strip lies flat after the barrier. While a runner is on the road a big DEPLOY button appears; pressing
        it plays the 16-frame deploy animation. A vehicle crossing the raised strip gets flat tyres, limps to a stop and
        is towed automatically; the runner's driver is sent to jail with a bonus. Deploy under an innocent car and you pay
        for it. The strip retracts on its own after 6 s. */
CP.addStrings({
  st_towed: ['اتسحبت', 'Towed'], r_towed: ['اتسحبت للمرور', 'Towed away'], dec_towed: ['سحب', 'Tow'],
  tw_call: ['🚛 الونش في الطريق', '🚛 Tow truck on its way'], tw_load: ['بيتحمّل على الونش', 'Loading onto the tow truck'], tw_gone: ['اتسحبت للمرور', 'Towed to the traffic pound'],
  rn_run: ['🚨 السواق هرب! كسر البوابة وطلع يجري', '🚨 The driver bolted! He smashed the barrier and sped off'], rn_deploy: ['🧨 انزل الشوك', '🧨 DEPLOY SPIKES'], rn_hit: ['الشوك خرم عجله — واقف!', 'Spikes shredded his tyres — he is stopping!'],
  rn_jail: ['🚔 السواق اتقبض عليه واتحبس — مكافأة +{x} خبرة و +{m} ج.م', '🚔 Driver arrested and jailed — bonus +{x} XP and +{m} EGP'], rn_escaped: ['الهارب فلت — بلّغ العمليات', 'The runner got away — dispatch informed'],
  rn_innocent: ['نزّلت الشوك تحت عربية بريئة! شكوى وتعويض −٤٠٠ ج.م', 'You spiked an innocent car! Complaint and −400 EGP compensation'], rn_reason: ['هروب من الكمين', 'Fled the checkpoint']
});
CP.C.veh.tow_truck = Object.assign({}, CP.C.veh.classic_sedan, { driver: 'm', cls: 'service', lic: 'heavy', maxV: 9, acc: 2, dec: 5, pax: [0, 0], win: 0.86, make: ['ونش الطريق', 'Road tow truck'], colour: ['أبيض', 'White'], w: {}, zones: [] });
CP.Tow = { list: [] }; const TOW = CP.Tow; const TWW = CP.W;
TOW.BED_Y = 1.05;   // flatbed deck height in metres
TOW.BED_AT = 0.58;  // the towed car's centre sits this fraction of the truck length behind its front

/* ---------- call a tow for a vehicle ---------- */
TOW.call = function (v, why) {
  if (!v || v.towing) return; const s = CP.G.shift; v.towing = { phase: 'wait' }; v.stallKind = v.stallKind || 'stall'; v.stall = Math.max(v.stall || 0, 9999); v.hold = true; v.v = 0;
  const truck = CP.T.mk('tow_truck', { x: -9, v: 7 }); truck.row = 1; truck.route = 'tow'; truck.cleared = true; truck.tow = { target: v.id, phase: 'arrive', t: 0 }; truck.st = 'tow'; truck.maxV = 9; truck.hold = false; truck.stopAt = null; truck.noCase = true;
  s.vehicles.push(truck); TOW.list.push(truck.id); CP.UI.toast(CP.t('tw_call'), 'ok'); CP.Audio.horn && CP.Audio.horn('short', -6);
  if (v.caseId && s.cases[v.caseId] && !s.cases[v.caseId].res) { const c = s.cases[v.caseId]; c.res = { decision: why || 'towed', reason: 'observation', eval: { sound: true, dec: 70 }, t: s.t }; c.status = 'closed'; try { CP.bus.emit('caseClosed', c); } catch (e) { } }
};
/* the base traffic update must not move these two while the lift plays */
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return; const dt = 1 / 60;
  for (const truck of s.vehicles) {
    if (!truck.tow) continue; const T = truck.tow; const v = CP.T.get(T.target);
    if (!v && T.phase !== 'leave') { T.phase = 'leave'; }
    const targetX = v ? v.x + 0.6 : 999;   // park with the bed under the car (truck front ahead of the car)
    if (T.phase === 'arrive') { truck.row = 1; truck.hold = false; truck.stopAt = null; const dx = targetX - truck.x; const sp = Math.min(truck.maxV, Math.max(0.6, dx * 1.4)); truck.px = truck.x; truck.x += Math.min(dx, sp * dt); truck.wheel += (sp * dt) / CP.A.M.vehicles.tow_truck.wheelRadiusMetres; truck.v = sp; if (dx < 0.05) { T.phase = 'lift'; T.t = 0; truck.v = 0; if (v) { v.towing.phase = 'lift'; v.towing.x0 = v.x; v.towing.row0 = v.row; } CP.UI.toast(CP.t('tw_load'), 'info'); CP.Audio.gen && CP.Audio.gen(); } continue; }
    if (T.phase === 'lift') { T.t += dt; const p = CP.clamp(T.t / 2.6, 0, 1); if (v) { const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; v.px = v.x; v.prow = v.row; v.x = v.towing.x0 + (truck.x - truck.len * TOW.BED_AT + v.len / 2 - v.towing.x0) * e; v.row = v.towing.row0 + (1 - v.towing.row0) * e; v.towLift = Math.sin(p * Math.PI) * 0.5 + (p > 0.5 ? (p - 0.5) * 2 * TOW.BED_Y : 0); v.v = 0; v.hold = true; v.stall = 9999; }
      if (p >= 1) { T.phase = 'leave'; if (v) { v.towing.phase = 'ride'; v.towLift = TOW.BED_Y; } CP.UI.toast(CP.t('tw_gone'), 'ok'); } continue; }
    if (T.phase === 'leave') { truck.px = truck.x; const sp = Math.min(truck.maxV, truck.v + 2.5 * dt); truck.v = sp; truck.x += sp * dt; truck.wheel += (sp * dt) / CP.A.M.vehicles.tow_truck.wheelRadiusMetres; if (v) { v.px = v.x; v.x = truck.x - truck.len * TOW.BED_AT + v.len / 2; v.row = 1; v.hold = true; v.stall = 9999; }
      if (truck.x - truck.len > TWW.worldW + 6) { if (v) CP.T.remove(v); CP.T.remove(truck); TOW.list = TOW.list.filter(id => id !== truck.id); } continue; }
  }
});
/* keep the base physics off towed vehicles and the truck */
{ const upd = CP.T.update; CP.T.update = function (s, dt) { const held = s.vehicles.filter(v => v.tow || (v.towing && v.towing.phase !== 'wait')); const snap = held.map(v => ({ v, x: v.x, row: v.row, vel: v.v })); const r = upd.apply(this, arguments); for (const o of snap) { o.v.x = o.x; o.v.row = o.row; o.v.v = o.vel; } return r; }; }
/* draw the towed car lifted on the bed (heave) */
{ const dv = CP.R.drawVeh; CP.R.drawVeh = function (v, alpha) { if (v.towLift) { const sv = v.heave; v.heave = (v.heave || 0) - v.towLift; const r = dv.apply(this, arguments); v.heave = sv; return r; } return dv.apply(this, arguments); }; }
/* tow requests from the repair popover / tow contract / radio task now bring the truck */
{ const fix = CP.Events.fixVehicle; CP.Events.fixVehicle = function (v) { if (v && v._towReq) { v._towReq = false; TOW.call(v, 'towed'); return; } return fix.apply(this, arguments); }; }
{ const add = CP.Tasks.add; CP.Tasks.add = function (spec) { if (spec && spec.type === 'radio' && spec.data && spec.data.tow) { const v = CP.T.get(spec.data.tow); if (v) v._towReq = true; } return add.call(this, spec); }; }

/* ---------- spike strip ---------- */
CP.Spikes = { x: TWW.gateX + 3.2, up: 0, deployed: false, t: 0, armedFor: null };
const SK = CP.Spikes;
SK.deploy = function () { if (SK.deployed) return; SK.deployed = true; SK.t = 0; CP.Audio.click(); CP.R.punch(); if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { } } };
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return; const dt = 1 / 60;
  if (SK.deployed) { SK.t += dt; SK.up = CP.clamp(SK.t / 0.6, 0, 1); if (SK.t > 6.5) { SK.deployed = false; } }
  else SK.up = Math.max(0, SK.up - dt * 2);
  if (SK.up > 0.8) for (const v of s.vehicles) { if (v.tow || v.limp || v.spiked || v.row !== 0) continue; const front = v.x, back = v.x - v.len; if (front > SK.x && back < SK.x && v.v > 0.5) SK.hit(v); }
  for (const v of s.vehicles) if (v.spiked && !v.towing && v.v < 0.3 && s.t - v.spiked > 1) { v.stall = 9999; v.stallKind = 'stall'; TOW.call(v, v.runner ? 'handover' : 'towed'); }
});
SK.hit = function (v) { const s = CP.G.shift; v.spiked = s.t; v.limp = true; v.maxV = 1.5; v.v = Math.min(v.v, 4); v.hold = false; v.stopAt = v.x + 6; CP.Audio.chime('bad'); CP.R.shake(6, 0.4);
  if (v.runner) { CP.UI.banner(CP.t('rn_hit'), 'ok'); const xp = 300, m = 800; setTimeout(() => { if (!CP.G.shift) return; CP.Prog.gain(xp, v.x - v.len / 2, CP.R.rowY(0) + 3, '#ffd35a', '🚔'); CP.Econ && CP.Econ.addMoney(m); CP.UI.banner(CP.t('rn_jail', { x: CP.num(xp), m: CP.num(m) }), 'ok'); CP.R.stamp(CP.t('rn_reason'), '#ff5a5a'); CP.R.confetti(90); CP.Music && CP.Music.playSting(); v.runner = false; SK.armedFor = null; }, 1600); }
  else { CP.UI.banner(CP.t('rn_innocent'), 'emergency'); CP.Econ && CP.Econ.addMoney(-400); CP.G.career.trust = CP.clamp(CP.G.career.trust - 4, 0, 100); (s.events.mail = s.events.mail || { cmp: [], cmd: [] }).cmp.push(CP.t('rn_innocent')); }
};
/* draw the strip after the barrier (world-anchored), with the deploy frames */
{ const st = CP.R.structures; CP.R.structures = function (s) { const r = st.apply(this, arguments); const A = CP.A; const fr = 'spikes_' + String(Math.min(15, Math.round(SK.up * 15))).padStart(2, '0'); const sp = A.M.sprites[fr]; if (!sp) return r; const ppm = this.ppm; const cx = this.sx(SK.x), gy = this.sy(this.Y.mainNear + 0.35); const k = 1.15 * ppm / sp.rect[2]; A.drawGroundedScale(this.ctx, fr, cx, gy, k, false, 0.5); return r; }; }

/* ---------- runner scenario ---------- */
CP.Events.MINOR.push('runner'); CP.Events.tierOf.runner = 3;
{ const can = CP.Events.can; CP.Events.can = function (t) { const s = CP.G.shift; if (t === 'runner') return !s.vehicles.some(v => v.runner) && s.t < s.dur - 90 && s.vehicles.some(v => v.st === 'stopped' && v.caseId && !s.cases[v.caseId].res && CP.FAM[s.cases[v.caseId].fam] && CP.FAM[s.cases[v.caseId].fam].serious); return can.call(this, t); }; }
{ const start = CP.Events.start; CP.Events.start = function (t) { const s = CP.G.shift; if (t !== 'runner') return start.call(this, t);
    const v = s.vehicles.find(x => x.st === 'stopped' && x.caseId && !s.cases[x.caseId].res && CP.FAM[s.cases[x.caseId].fam] && CP.FAM[s.cases[x.caseId].fam].serious); if (!v) return false;
    v.runner = true; v.hold = false; v.stopAt = null; v.cleared = true; v.st = 'leaving'; v.maxV = 15; v.acc = 5; v.v = Math.max(v.v, 3); s.gate.jam = true; s.gate.state = 'open'; s.gate.ang = 1;
    s.events.active.push({ type: 'runner', t0: s.t, vid: v.id }); CP.Events.log('runner', 'rn_run', 'emergency'); CP.Audio.rev && CP.Audio.rev(); CP.Audio.siren(true); setTimeout(() => CP.Audio.siren(false), 2500); CP.R.shake(7, 0.5); SK.armedFor = v.id;
    if (v.caseId && s.cases[v.caseId]) { const c = s.cases[v.caseId]; c.k.stopped = false; }
    return true; }; }
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; for (const v of s.vehicles) { if (v.runner && !v.spiked && v.x - v.len > TWW.worldW + 4) { v.runner = false; SK.armedFor = null; CP.UI.banner(CP.t('rn_escaped'), 'warn'); s.prog.xp = Math.max(0, s.prog.xp - 80); CP.G.career.trust = CP.clamp(CP.G.career.trust - 3, 0, 100); s.events.active = s.events.active.filter(e => e.type !== 'runner'); } } });
/* deploy button: big, on screen only while a runner is on the road (or the strip is up) */
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; let b = document.getElementById('spikeBtn'); const show = s && (s.vehicles.some(v => v.runner && !v.spiked) || SK.deployed);
  if (!show) { if (b) b.remove(); return; } if (b) { b.classList.toggle('up', SK.deployed); return; }
  b = CP.h('button', { id: 'spikeBtn', onclick: e => { e.stopPropagation(); SK.deploy(); } }, CP.t('rn_deploy')); document.getElementById('stage').appendChild(b); });
document.addEventListener('keydown', e => { if (e.code === 'Space' && document.getElementById('spikeBtn') && !document.getElementById('fixbar')) { e.preventDefault(); SK.deploy(); } });
;(window.CP_FILES = window.CP_FILES || {})['37_tow'] = '2.7.0';
