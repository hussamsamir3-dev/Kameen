/* Event director: paced incidents with prerequisites, cooldowns and a budget (≤1 major, ≤2 minor active).
   Also: civilian spawning, ambulance / supervisor pickup flows, shift end and career scoring. */
CP.addStrings({
  ev_towCalled: ['ونش الشرطة جاي يسحب العربية العطلانة', 'Police tow truck on its way for the broken-down car'], ev_towDone: ['الونش سحب العربية وفتح الطريق', 'The tow truck cleared the broken-down car'],
  ev_leaveGiveUp: ['السواق زق البوابة — الموتور علّق', 'The driver forced the barrier — the gate motor jammed'],
  ev_calmed: ['السواق هدي ورجع مكانه', 'The driver calmed down and stayed put'],
  ev_medicsDone: ['المسعفين استلموا الحالة', 'Paramedics have taken over'],
  ev_handoverDone: ['تم التسليم للدورية', 'Handed over to the patrol'],
  ev_visitorLeft: ['الزائر مشي من غير مساعدة', 'The visitor left without help'],
  ev_visitorOk: ['الزائر شكرك ومشي', 'The visitor thanked you and left'],
  ev_visitorBad: ['الوصف كان غلط — هيتوه', 'Wrong directions — they will get lost'],
  ev_stallOk: ['العربية دارت', 'The engine started'],
  ev_fixed: ['العربية اتظبطت مؤقتاً', 'Vehicle temporarily fixed'],
  ev_gateFixed: ['موتور البوابة اتصلح', 'Gate motor repaired'],
  ev_genFixed: ['المولد اشتغل', 'Generator running again'],
  ev_supplyFault: ['جهاز النفس بطاريته فاضية', 'Breath device battery flat'],
  ev_shiftEnding: ['الوردية خلصت — خلّص الحالات المفتوحة', 'Shift time is up — finish open cases'],
  ev_wedLabel: ['زفة', 'Wedding'],
  ev_noDecor: ['(من غير زينة — الرسم مش موجود)', '(no decoration art in the pack)']
});
CP.Events = {};
const EW = CP.W;
const Ev = CP.Events;
Ev.MAJOR = ['ambulance', 'medical', 'leave', 'gateFault'];
Ev.MINOR = ['visitor', 'stall', 'radioDelay', 'dust', 'collision', 'wedding', 'generator', 'supplyFault'];
Ev.tierOf = { ambulance: 5, medical: 5, leave: 2, gateFault: 2, visitor: 1, stall: 1, radioDelay: 1, dust: 1, collision: 2, wedding: 2, generator: 3, supplyFault: 4 };
Ev.log = function (type, text, kind) {
  const s = CP.G.shift; s.events.log.push({ t: s.t, clock: CP.gameClock(), type, text: typeof text === 'string' ? { ar: CP.STR.ar[text] || text, en: CP.STR.en[text] || text } : text });
  if (s.events.log.length > 60) s.events.log.shift();
  CP.UI && CP.UI.banner(CP.L(s.events.log[s.events.log.length - 1].text), kind || 'info');
};
Ev.active = type => CP.G.shift.events.active.find(e => e.type === type) || null;
Ev.safety = function (score, why) { const s = CP.G.shift; s.stats.safety.push({ v: score, why, t: s.t }); };
Ev.emergency = function () {
  const s = CP.G.shift;
  return s.events.active.some(e => e.type === 'ambulance' || (e.type === 'medical' && e.onset) || e.type === 'leave');
};

/* ---------------- spawning ---------------- */
Ev.spawnTick = function (dt) {
  const s = CP.G.shift;
  if (s.t >= s.dur) return;
  s.spawnT -= dt;
  if (s.events.convoy && s.events.convoy.n > 0) {
    s.events.convoy.t -= dt;
    if (s.events.convoy.t <= 0 && CP.T.tailX(0) > 2) { const v = CP.T.spawnCivilian({ fam: 'routine', type: s.events.convoy.types[s.events.convoy.n - 1], special: 'wedding' }); if (v) { s.events.convoy.n--; s.events.convoy.t = 1.2; } }
    return;
  }
  if (s.spawnT > 0) return;
  const tut = s.tutorial.step < 99;
  const dens = CP.Pulse ? CP.Pulse.spawnGap(s) : (CP.locBase(s.loc) === 'cairo' ? [21, 38] : [26, 48]);
  const r = CP.srng();
  s.spawnT = tut ? 40 : dens[0] + r() * (dens[1] - dens[0]);
  if (tut) {
    const n = s.spawned;
    if (n >= 3) { s.spawnT = 9999; return; }
    CP.T.spawnCivilian({ fam: n === 1 ? 'expired' : 'routine', type: n === 0 ? 'silver_sedan' : n === 1 ? 'cairo_taxi' : 'microbus' });
    return;
  }
  // content mix target ~65% ordinary / 25% admin-safety / 10% serious is carried by family weights
  const count = s.vehicles.filter(v => v.caseId && !s.cases[v.caseId].res).length;
  if (count >= 7) { s.spawnT = 6; return; }
  CP.T.spawnCivilian({});
};

/* ---------------- director ---------------- */
Ev.update = function (dt) {
  const s = CP.G.shift, E = s.events;
  E.pickups = E.pickups || [];
  // continuous behaviours
  Ev.updateActive(dt);
  Ev.familyTriggers(dt);
  for (const p of E.pickups.slice()) if (s.t >= p.at && !p.spawned) { p.spawned = true; Ev.spawnPickup(p); }
  if (s.visitor && !s.visitor.done && s.t - s.visitor.t0 > 100) { s.visitor.done = true; CP.G.career.trust -= 1; Ev.log('visitor', 'ev_visitorLeft', 'warn'); Ev.finish('visitor'); }
  // director tick (1 s)
  E.tick = (E.tick || 0) - dt; if (E.tick > 0) return; E.tick = 1;
  if (s.tutorial.step < 99 || s.t > s.dur - 20 || s.ended) return;
  const tier = CP.tier(); const r = CP.srng();
  for (const k in E.cd) if (E.cd[k] > 0) E.cd[k] -= 1;
  const majors = E.active.filter(e => Ev.MAJOR.indexOf(e.type) >= 0).length;
  const minors = E.active.filter(e => Ev.MINOR.indexOf(e.type) >= 0).length;
  E.nextMajor = E.nextMajor ?? 90 + r() * 60;
  if (!majors && s.t - E.lastMajor > E.nextMajor) {
    const opts = Ev.MAJOR.filter(t => Ev.tierOf[t] <= tier && !(E.cd[t] > 0) && Ev.can(t));
    if (opts.length) { const t = opts[Math.floor(r() * opts.length)]; if (Ev.start(t)) { E.lastMajor = s.t; E.nextMajor = 90 + r() * 60; E.cd[t] = 260; } }
  }
  if (minors < 2 && r() < 0.022) {
    const opts = Ev.MINOR.filter(t => Ev.tierOf[t] <= tier && !(E.cd[t] > 0) && Ev.can(t));
    if (opts.length) { const t = opts[Math.floor(r() * opts.length)]; if (Ev.start(t)) E.cd[t] = 150; }
  }
  // opportunistic: open priority lane with no emergency invites queue-jumping
  if (s.prioOpen && !Ev.active('ambulance') && s.t - (s.prioOpenedT || 0) > 30 && r() < 0.05) Ev.prioAbuse();
};
Ev.can = function (t) {
  const s = CP.G.shift;
  switch (t) {
    case 'ambulance': return !s.vehicles.some(v => v.special === 'ambulance');
    case 'medical': return !Object.values(s.cases).some(c => !c.res && c.fam === 'medical');
    case 'leave': return s.vehicles.some(v => v.st === 'stopped' && v.caseId && !s.cases[v.caseId].res && s.cases[v.caseId].patience < 55 && !v.leaving);
    case 'gateFault': return !s.gate.jam && s.gate.state === 'closed';
    case 'visitor': return !s.visitor || s.visitor.done;
    case 'stall': return true;
    case 'radioDelay': return s.events.radioDelayUntil < s.t;
    case 'dust': return s.events.dustUntil < s.t && ((CP.LOCS[s.loc] || {}).dust || CP.srng()() < 0.15);
    case 'collision': return s.vehicles.some(v => v.row === 0 && v.x < EW.marker - 8 && v.caseId && !v.late);
    case 'wedding': return CP.locBase(s.loc) === 'cairo' && !(s.events.convoy && s.events.convoy.n > 0);
    case 'generator': return s.equipment.generator === 'ok' && CP.srng()() < [1, .55, .25][CP.G.career.upgrades.lighting];
    case 'supplyFault': return s.equipment.breath === 'ready';
  }
  return false;
};
Ev.start = function (t) {
  const s = CP.G.shift, E = s.events, r = CP.srng();
  const add = extra => { const e = Object.assign({ type: t, t0: s.t }, extra || {}); E.active.push(e); return e; };
  switch (t) {
    case 'ambulance': { const v = CP.T.spawnService('ambulance', { special: 'ambulance' }); add({ vid: v.id, blockedT: 0 }); Ev.log(t, 'ev_ambulance', 'emergency'); CP.Audio.siren(true); CP.R.punch(); return true; }
    case 'medical': { const v = CP.T.spawnCivilian({ fam: 'medical' }); if (!v) return false; add({ vid: v.id, caseId: v.caseId, onset: false }); return true; }
    case 'leave': {
      const v = s.vehicles.find(x => x.st === 'stopped' && x.caseId && !s.cases[x.caseId].res && s.cases[x.caseId].patience < 55 && !x.leaving);
      if (!v) return false; v.leaving = true; add({ vid: v.id }); Ev.log(t, 'ev_leave', 'emergency'); CP.Audio.rev(); return true; }
    case 'gateFault': { s.gate.jam = true; s.gate.state = 'jammed'; add({}); Ev.log(t, 'ev_gateFault', 'warn'); CP.Audio.fault(); return true; }
    case 'visitor': { s.visitor = { civ: 'civilian_' + String(r.int(1, 12)).padStart(2, '0'), t0: s.t, done: false }; add({}); Ev.log(t, 'ev_visitor', 'info'); return true; }
    case 'stall': {
      const v = s.vehicles.find(x => x.cleared && x.row === 0 && x.x <= EW.marker + 0.4 && x.v < 0.5 && !x.stall && x.caseId);
      if (!v) return false; v.stall = 4 + r() * 3; v.stallKind = 'stall'; add({ vid: v.id }); Ev.log(t, 'ev_stall', 'info'); CP.Audio.crank(); return true; }
    case 'radioDelay': E.radioDelayUntil = s.t + 90; add({ until: s.t + 90 }); Ev.log(t, 'ev_radioDelay', 'warn'); return true;
    case 'dust': E.dustUntil = s.t + 70; add({ until: s.t + 70 }); Ev.log(t, 'ev_dust', 'warn'); return true;
    case 'collision': {
      const v = s.vehicles.find(x => x.row === 0 && x.x < EW.marker - 8 && x.caseId && !x.late); if (!v) return false;
      v.late = true; add({ vid: v.id, armed: true }); return true; }
    case 'wedding': { E.convoy = { n: 3, t: 0, types: [r.pick(['silver_sedan', 'charcoal_suv']), 'classic_sedan', r.pick(['silver_sedan', 'charcoal_suv'])] }; add({ until: s.t + 150 }); Ev.log(t, CP.fill(['{a} {b}', '{a} {b}'], { a: [CP.STR.ar.ev_wedding, CP.STR.en.ev_wedding], b: [CP.STR.ar.ev_noDecor, CP.STR.en.ev_noDecor] }), 'info'); CP.Audio.horn('wedding', -2); return true; }
    case 'generator': { s.equipment.generator = 'down'; add({}); Ev.log(t, 'ev_generator', 'warn'); CP.Audio.fault(); return true; }
    case 'supplyFault': { s.equipment.breath = 'fault'; add({}); Ev.log(t, 'ev_supplyFault', 'warn'); return true; }
  }
  return false;
};
Ev.finish = function (type, pred) {
  const E = CP.G.shift.events; const i = E.active.findIndex(e => e.type === type && (!pred || pred(e)));
  if (i >= 0) { const e = E.active[i]; E.active.splice(i, 1); CP.bus.emit('eventEnd', e); }
};

Ev.updateActive = function (dt) {
  const s = CP.G.shift;
  for (const e of s.events.active.slice()) {
    if (e.type === 'ambulance') {
      const v = CP.T.get(e.vid);
      if (!v) { Ev.finish('ambulance', x => x === e); Ev.safety(CP.clamp(100 - e.blockedT * 5, 10, 100), 'ambulance'); Ev.log('ambulance', 'ev_ambPassed', 'ok'); CP.Audio.siren(false); continue; }
      if (!s.prioOpen && v.v < 0.1 && v.x <= EW.coneX) { e.blockedT += dt; if (e.blockedT > 3 && !e.warned) { e.warned = true; Ev.log('ambulance', 'ev_ambBlocked', 'emergency'); } v.honkT -= dt; if (v.honkT <= 0) { v.honkT = 2.5; CP.Audio.horn('long', v.x); } }
      if (v.stopAt != null && Math.abs(v.x - v.stopAt) < 0.25 && v.v < 0.05) {
        v.dwell -= dt;
        if (v.dwell <= 0) { v.stopAt = null; Ev.medicsDone(e); }
      }
    } else if (e.type === 'medical') {
      const v = CP.T.get(e.vid); const c = s.cases[e.caseId];
      if (!v || !c || c.k.medicalDone || (c.res && c.res.decision !== 'medical')) { Ev.finish('medical', x => x === e); continue; }
      if (!e.onset && v.x > 4 && v.v < 0.1) { e.onset = true; Ev.log('medical', 'ev_medical', 'emergency'); CP.Audio.horn('long', v.x); if (c.cues.indexOf('passenger_pale') < 0 && c.pax > 0) c.cues.push('passenger_pale'); }
    } else if (e.type === 'leave') {
      const v = CP.T.get(e.vid);
      if (!v || !v.leaving) { Ev.finish('leave', x => x === e); continue; }
      e.el = (e.el || 0) + dt;
      if (e.el > 28) { v.leaving = false; s.gate.jam = true; s.gate.state = 'jammed'; if (!Ev.active('gateFault')) s.events.active.push({ type: 'gateFault', t0: s.t }); Ev.safety(45, 'leave'); s.stats.complaints++; Ev.log('leave', 'ev_leaveGiveUp', 'warn'); CP.Audio.fault(); Ev.finish('leave', x => x === e); }
    } else if (e.until && s.t > e.until) Ev.finish(e.type, x => x === e);
    else if (e.type === 'stall') { const v = CP.T.get(e.vid); if (!v || !v.stall) { Ev.finish('stall', x => x === e); if (v) Ev.log('stall', 'ev_stallOk', 'ok'); } }
    else if (e.type === 'collision') { const v = CP.T.get(e.vid); if (!v || (e.armed && s.t - e.t0 > 120)) { if (v) v.late = false; Ev.finish('collision', x => x === e); } }
    else if (e.type === 'supplyFault' && s.equipment.breath !== 'fault') Ev.finish('supplyFault', x => x === e);
  }
};

/* case-family triggers (truth decides; director only times the onset) */
Ev.familyTriggers = function () {
  const s = CP.G.shift;
  for (const v of s.vehicles) {
    const c = v.caseId ? s.cases[v.caseId] : null; if (!c || c.res) continue;
    if (c.truth.overheat && !c.flags.overheated && v.v < 0.1 && ((c.flags.overheatAt === 0 && v.x > 4 && v.st === 'queue') || v.st === 'marker' || v.st === 'stopped')) {
      c.flags.overheated = true; v.stall = 1; v.stallKind = 'overheat'; Ev.log('overheat', 'ev_overheat', 'warn');
    }
    if (c.ret && !c.flags.retShown && (v.st === 'marker')) { c.flags.retShown = true; Ev.log('returning', CP.fill([CP.STR.ar.ev_returning, CP.STR.en.ev_returning], { n: c.driver.name }), 'info'); }
  }
};
CP.bus.on('bump', ({ a, b, sp }) => {
  const s = CP.G.shift; a.stall = 1; a.stallKind = 'collision'; b.stall = 1; b.stallKind = 'collision'; a.pair = b.id; b.pair = a.id; a.late = false;
  CP.Phys.kick(b, 0, 1.4); CP.Phys.kick(a, 1.0, 0); CP.Audio.bump(); CP.R.shake(9, 0.6);
  Ev.safety(70, 'collision'); Ev.log('collision', 'ev_collision', 'warn');
  const e = Ev.active('collision'); if (e) e.armed = false;
});

/* ---------------- resolutions ---------------- */
Ev.fixVehicle = function (v) {
  const s = CP.G.shift;
  const fixOne = x => { if (!x) return; if (x.stallKind === 'overheat') x.limp = true; x.stall = 0; x.stallKind = null; };
  fixOne(v); if (v.pair) { fixOne(CP.T.get(v.pair)); v.pair = null; }
  const c = v.caseId ? s.cases[v.caseId] : null;
  if (c) CP.note(c, 'incident', { ar: 'اتساعدت العربية وقدرت تتحرك', en: 'Vehicle assisted and able to move' }, 'verified');
  Ev.finish('collision'); Ev.log('fix', 'ev_fixed', 'ok');
};
Ev.gateRepaired = function () {
  const g = CP.G.shift.gate; g.jam = false; g.state = g.ang > 0.5 ? 'open' : 'closed'; if (g.ang > 0 && g.ang < 1) g.state = 'closing';
  Ev.finish('gateFault'); Ev.log('gate', 'ev_gateFixed', 'ok');
};
Ev.manualGate = function () {
  const s = CP.G.shift, g = s.gate;
  g.manualOp = true;
  if (g.ang > 0.5) { if (CP.Gate.sensorBusy()) { g.sensorMsgT = 2.5; CP.UI.toast(CP.t('g_sensorBlock'), 'warn'); return; } g.state = 'closing'; }
  else g.state = 'opening';
  CP.Actors.poseHold('lower', 3); CP.Audio.gate(g.state === 'opening');
};
Ev.generatorFixed = function () { CP.G.shift.equipment.generator = 'ok'; Ev.finish('generator'); Ev.log('gen', 'ev_genFixed', 'ok'); CP.Audio.gen(); };
Ev.visitorHelped = function (ok) {
  const s = CP.G.shift; if (!s.visitor || s.visitor.done) return;
  s.visitor.done = true; CP.G.career.trust += ok ? 2 : -2;
  if (!ok) s.stats.complaints++;
  Ev.log('visitor', ok ? 'ev_visitorOk' : 'ev_visitorBad', ok ? 'ok' : 'warn'); Ev.finish('visitor');
};
Ev.calmLeaver = function (v) {
  if (!v) return; const s = CP.G.shift; const c = s.cases[v.caseId];
  v.leaving = false; if (c) { c.patience = Math.min(100, c.patience + 30); c.k.explained = true; CP.note(c, 'incident', { ar: CP.Gender.isF(c) ? 'السواقة حاولت تمشي قبل الإذن — اتكلمت معاها وهديت' : 'السواق حاول يمشي قبل الإذن — اتكلمت معاه وهدي', en: 'Driver tried to leave before clearance — spoke with them and they calmed down' }, 'verified'); { const ln = CP.Gender.officer(c, 'explain', 'calm'); CP.Dlg.say(c, 'officer', { ar: ln[0], en: ln[1] }); } }
  Ev.safety(95, 'leaveCalmed'); Ev.log('leave', 'ev_calmed', 'ok'); CP.Actors.poseHold('stop', 1.2);
};
Ev.prioAbuse = function () {
  const s = CP.G.shift;
  const v = s.vehicles.find(x => x.row === 0 && !x.trans && x.x < 5 && x.x > -3 && x.caseId && !s.cases[x.caseId].res && !s.cases[x.caseId].k.stopped);
  if (!v || !CP.once('abuse:' + v.id)) return;
  const c = s.cases[v.caseId];
  v.trans = { from: 0, to: 1, x0: v.x, x1: v.x + 3.5 }; v.route = 'prio'; v.cleared = true;
  if (CP.once('close:' + c.id)) { c.k.endT = s.t; c.res = { decision: 'escaped', reason: 'prio', support: [], t: s.t, clock: CP.gameClock() }; c.res.eval = { dec: null, prop: 100, com: null, wait: 0, notes: [{ ar: 'العربية استغلت حارة الطوارئ المفتوحة وعدّت من غير فحص.', en: 'The vehicle used the open priority lane to skip the check.' }], sound: true, escaped: true }; c.status = 'closed'; }
  Ev.safety(60, 'prioAbuse'); Ev.log('prioAbuse', 'ev_prioAbuse', 'warn');
};

/* medical: ambulance to the patient; the case stays closed as "medical" and is re-evaluated when medics finish */
Ev.callAmbulance = function (c, v) {
  const s = CP.G.shift;
  c.k.medicalCalled = true;
  const amb = CP.T.spawnService('ambulance', { special: 'ambulance', stopAt: Math.max(EW.coneX + 2, v.x + 1.0), dwell: 9, forCase: c.id, forVid: v.id });
  s.events.active.push({ type: 'ambulance', t0: s.t, vid: amb.id, blockedT: 0, caseId: c.id });
  Ev.log('ambulance', 'ev_ambulance', 'emergency'); CP.Audio.siren(true);
};
Ev.medicsDone = function (e) {
  const s = CP.G.shift; const amb = CP.T.get(e.vid); if (!amb || !amb.forCase) return;
  const c = s.cases[amb.forCase]; const v = CP.T.get(amb.forVid);
  if (c) { c.k.medicalDone = true; CP.note(c, 'incident', { ar: 'المسعفين استلموا الحالة', en: 'Paramedics took over care' }, 'verified'); if (c.res) c.res.eval = CP.Cases.evaluate(c); }
  Ev.log('ambulance', 'ev_medicsDone', 'ok');
  if (v) { v.hold = false; v.releaseAt = CP.G.shift.t + 2.5; }
};
Ev.schedulePickup = function (c, v, delay) { CP.G.shift.events.pickups.push({ caseId: c.id, vid: v.id, at: CP.G.shift.t + delay }); };
Ev.spawnPickup = function (p) {
  const v = CP.T.get(p.vid); if (!v) return;
  const c0 = CP.G.shift.cases[p.caseId]; const loc = CP.G.shift.loc;
  const htype = p.tow ? 'pol_tow' : (c0 && c0.pax > 2) ? 'pol_hiace' : (CP.locBase(loc) === 'desert') ? 'pol_4x4' : (Math.random() < 0.5 ? 'pol_pickup' : 'pol_suv');
  const pk = CP.T.spawnService(CP.C.veh[htype] ? htype : 'police_pickup', { tow: !!p.tow, special: 'pickup', beacon: true, stopAt: v.x + 1.0, dwell: 7, forCase: p.caseId, forVid: p.vid, maxV: 11 });
  CP.G.shift.events.active.push({ type: 'pickup', t0: CP.G.shift.t, vid: pk.id });
  Ev.log('pickup', 'ev_supervisor', 'info');
};
/* pickup dwell handled here (reuses dwell logic) */
CP.bus.on('stepEnd', () => {
  const s = CP.G.shift; if (!s) return;
  for (const e of s.events.active.slice()) {
    if (e.type !== 'pickup') continue;
    const pk = CP.T.get(e.vid);
    if (!pk) { Ev.finish('pickup', x => x === e); continue; }
    if (pk.stopAt != null && Math.abs(pk.x - pk.stopAt) < 0.25 && pk.v < 0.05) {
      pk.dwell -= 1 / 60;
      if (pk.dwell <= 0) {
        pk.stopAt = null; const v = CP.T.get(pk.forVid); const c = s.cases[pk.forCase];
        if (c) CP.note(c, 'incident', { ar: 'تم التسليم للدورية تحت الإشراف', en: 'Handed over to the patrol under supervision' }, 'verified');
        if (pk.tow && v) { CP.Events.fixVehicle(v); v.hold = false; CP.T.release(v); Ev.log('pickup', 'ev_towDone', 'ok'); }
        else { if (v) { v.hold = false; CP.T.release(v); }
        Ev.log('pickup', 'ev_handoverDone', 'ok'); }
      }
    }
  }
});

/* ---------------- shift end & career ---------------- */
CP.Career = {};
CP.Career.caseTrust = function (c) {
  const e = c.res.eval; const G = CP.G;
  let d = 0; if (e.sound) d += 1; else d -= 2; if (e.prop < 60) d -= 2; if (e.com >= 85) d += 1;
  G.career.trust = CP.clamp(G.career.trust + d, 0, 100);
};
CP.Career.checkEnd = function () {
  const s = CP.G.shift; if (s.ended) return false;
  if (s.t < s.dur) return false;
  if (!s.endWarned) { s.endWarned = true; Ev.log('end', 'ev_shiftEnding', 'warn'); }
  // v2.5.2: the shift ends when the timer ends (3 s grace for the closing banner); open cases hand over to the next shift
  return s.t > s.dur + 3;
};
CP.Career.report = function () {
  const G = CP.G, s = G.shift;
  const cases = s.caseOrder.map(id => s.cases[id]).filter(c => c.status !== 'offscreen');
  const resolved = cases.filter(c => c.res && c.res.eval);
  const unresolved = cases.filter(c => !c.res && CP.T.get((CP.vehOfCase(c) || {}).id));
  const dec = [], prop = [], com = [];
  for (const c of resolved) { const e = c.res.eval; if (e.dec != null) dec.push(e.dec); if (e.prop != null && !e.waved) prop.push(e.prop); if (e.com != null) com.push(e.com); }
  for (const c of unresolved) dec.push(20);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 100;
  const safetyScores = s.stats.safety.map(x => x.v);
  let safety = avg(safetyScores); safety -= Math.min(20, s.stats.honks * 0.4); safety = CP.clamp(safety, 0, 100);
  const waits = resolved.filter(c => c.res.eval.wait != null).map(c => Math.max(0, c.res.eval.wait));
  const avgWait = waits.length ? avg(waits) : 0;
  const D = avg(dec), P = avg(prop), C = avg(com);
  const score = Math.round(D * 0.40 + P * 0.25 + safety * 0.20 + C * 0.15);
  const sound = resolved.filter(c => c.res.eval.sound && !c.res.eval.waved).length;
  const credits = Math.max(1, Math.round(score / 20) + (resolved.filter(c => !c.res.eval.waved).length >= 5 ? 1 : 0));
  return { score, D: Math.round(D), P: Math.round(P), S: Math.round(safety), C: Math.round(C), avgWait, handled: resolved.length, checked: resolved.filter(c => !c.res.eval.waved && c.res.decision !== 'escaped').length, waved: s.stats.waved, sound, complaints: s.stats.complaints, trust: Math.round(G.career.trust), cases: resolved.concat(unresolved), credits };
};
CP.Career.finishShift = function () {
  const G = CP.G, s = G.shift; if (!CP.once('finish')) return null;
  s.ended = true;
  const rep = CP.Career.report();
  s.report = rep;
  G.career.credits += rep.credits;
  G.career.history.push({ no: s.no, loc: s.loc, score: rep.score, date: s.date });
  G.career.tutorialDone = true;
  if (CP.Prog) rep.prog = CP.Prog.finishShift(rep);
  CP.save('auto');
  return rep;
};
CP.Career.nextShift = function () {
  const G = CP.G; G.career.shiftNo++; G.shift = null; CP.save('auto');
};
CP.Career.buy = function (k) {
  const G = CP.G, u = G.career.upgrades, U = CP.UPG[k];
  if (u[k] >= U.max) return 'up_max';
  const cost = U.cost[u[k]]; if (G.career.credits < cost) return 'up_noCredit';
  G.career.credits -= cost; u[k]++; CP.save('auto'); return null;
};
;(window.CP_FILES = window.CP_FILES || {})['11_events'] = '2.8.0';
