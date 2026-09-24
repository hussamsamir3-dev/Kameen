/* Actions: every dock button maps to a validated command. avail() returns {ok, reason} so disabled buttons explain themselves. */
CP.addStrings({
  r_tooFar: ['امشي لحد شباك السواق', "Walk to the driver's window"],
  r_locked: ['بتتفتح في الوردية {n}', 'Unlocks on shift {n}'],
  r_notApproached: ['اقرب من السواق الأول', 'Approach the driver first'],
  r_noCase: ['مفيش حالة للعربية دي', 'No case for this vehicle'],
  r_notInBayOrMarker: ['العربية لازم تكون واقفة للفحص', 'Vehicle must be stopped for a check'],
  r_bayForHold: ['التحفظ بيكون في منطقة الفحص — حوّل العربية الأول', 'Holding happens in the bay — divert the vehicle first'],
  r_waitAmb: ['استنى الإسعاف', 'Waiting for the ambulance'],
  r_noVisitor: ['مفيش زائر', 'No visitor'],
  a_torch: ['كشاف', 'Flashlight'],
  a_torch_s: ['نوّر على الكابينة', 'Light up the cabin'],
  a_goCones: ['روح للأقماع', 'Go to the cones'],
  a_goGate: ['روح للبوابة', 'Go to the gate'],
  a_goGen: ['روح للمولد', 'Go to the generator'],
  a_goVisitor: ['روح للزائر', 'Go to the visitor'],
  a_select: ['اختيار', 'Select'],
  ctx_title: ['إجراءات قريبة', 'Nearby actions'],
  working: ['جاري… {s}ث', 'Working… {s}s'],
  paused_away: ['متوقف — ارجع للمكان', 'Paused — return to the spot'],
  obs_recorded: ['اتسجلت الملاحظة', 'Observation recorded'],
  obs_none: ['مفيش حاجة واضحة تتسجل من مكانك. قرّب أو استخدم الكشاف.', 'Nothing clear to record from here. Move closer or use the flashlight.'],
  obs_hidden: ['محتاج تقرب أو تنوّر', 'Needs a closer look or light'],
  res_waved: ['عدّت من غير فحص', 'Waved through'],
  res_escaped: ['مشيت من غير إذن', 'Left without clearance']
});

CP.Act = {};
const AX = CP.W;
CP.Act.curV = () => { const s = CP.G.shift; return s.selected ? CP.T.get(s.selected) : null; };
CP.Act.curC = () => { const v = CP.Act.curV(); return v && v.caseId ? CP.G.shift.cases[v.caseId] : null; };
CP.Act.select = function (id) { const s = CP.G.shift; s.selected = id; CP.bus.emit('select', id); };
CP.Act.tone = 'calm';

/* where the officer should stand to interact with a vehicle */
CP.Act.spot = function (v) {
  const row = Math.round(v.row) === 2 ? 1 : 0;
  return { x: CP.T.windowX(v) + 0.55, row };
};
CP.Act.nearVeh = function (v, tol) { const sp = CP.Act.spot(v); return CP.Actors.near(sp.x, tol ?? 1.3, sp.row); };
const stoppedFor = (v, c) => c && !c.res && ((v.st === 'stopped' && c.k.stopped) || v.st === 'bay');
const lock = n => CP.tier() < n ? CP.t('r_locked', { n: CP.num(n) }) : null;

CP.Act.defs = {
  stop: {
    avail(v, c) {
      if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved';
      if (c.k.stopped) return 'r_alreadyStopped';
      if (v.st !== 'marker') return 'r_notAtMarker';
      if (v.cleared) return 'r_leaving';
      return null;
    },
    run(v, c) {
      if (!CP.once('stop:' + v.id)) return;
      const s = CP.G.shift; c.k.stopped = true; c.k.stopT = s.t; c.status = 'stopped'; v.st = 'stopped';
      CP.Audio.click(); CP.bus.emit('stopped', v); CP.autosave();
      CP.Act.run('approach');
    }
  },
  wave: {
    avail(v, c) {
      if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved';
      if (c.k.stopped) return 'r_caseOpen';
      if (v.st !== 'marker') return 'r_notAtMarker';
      if (CP.G.shift.gate.jam && !CP.Gate.isOpen()) return 'r_gateJam';
      return null;
    },
    run(v) { CP.Act.doWave(v, 'officer'); }
  },
  approach: {
    label(v, c) { return c && CP.Gender && CP.Gender.isF(c) ? 'a_approach_f' : 'a_approach'; },
    avail(v, c) {
      if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved';
      if (!stoppedFor(v, c)) return v.st === 'toBay' ? 'r_notStopped' : 'r_needStop';
      return null;
    },
    run(v, c) { const sp = CP.Act.spot(v); if (CP.Act.nearVeh(v)) { CP.Act.arrived(v, c, 'talk'); return; } CP.Actors.walkTo(sp.x, sp.row, { act: 'approach', vid: v.id }); }
  },
  talk: {
    avail(v, c) { if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; if (!stoppedFor(v, c)) return 'r_needStop'; if (!c.k.approached) return 'r_notApproached'; return null; },
    run(v, c) { CP.Act.ensureNear(v, 'talk', () => CP.UI.open('dialogue', c.id)); }
  },
  docs: {
    label(v, c) { return c && c.k.docsHave ? 'a_docs' : 'a_docs_req'; },
    avail(v, c) { if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (!stoppedFor(v, c) && !(c.k.docsHave && !c.k.docsReturned)) return 'r_needStop'; if (!c.k.approached) return 'r_notApproached'; if (c.k.docsHanding && !c.k.docsHave) return 'r_docsHanding'; return null; },
    run(v, c) {
      CP.Act.ensureNear(v, 'docs', () => {
        // papers can only be read after asking for them and receiving them from the driver
        if (!c.k.docsHave) { if (!c.k.docsHanding) CP.Dlg.ask(c, 'greet_docs', CP.Act.tone); CP.UI.open('dialogue', c.id); return; }
        CP.UI.open('docs', c.id);
      });
    }
  },
  bay: {
    avail(v, c) {
      if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved';
      if (v.route === 'bay') return v.st === 'bay' ? 'st_bay' : 'st_toBay';
      if (!(v.st === 'stopped' && c.k.stopped)) return 'r_needStop';
      if (v.len > AX.bayMaxLen) return 'r_tooLong';
      if (!CP.T.bayFree()) return 'r_bayFull';
      if (CP.G.shift.gate.jam && !CP.Gate.isOpen()) return 'r_gateJam';
      if (CP.T.prioBusy()) return 'r_laneBusy';
      return null;
    },
    run(v, c) { const e = CP.T.sendToBay(v); if (e) CP.UI.toast(CP.t(e), 'warn'); else { CP.Actors.face(v.x + 3); CP.Actors.seq('officer', ['wave', 'idle'], 0.35); CP.autosave(); } }
  },
  inspect: {
    avail(v, c) { const l = lock(3); if (l) return l; if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; if (v.st !== 'bay') return 'r_needBay'; return null; },
    run(v, c) { CP.Act.ensureNear(v, 'inspect', () => { c.k.approached = true; CP.UI.open('search', c.id); }); }
  },
  screen: {
    avail(v, c) { const l = lock(4); if (l) return l; if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; if (!stoppedFor(v, c)) return 'r_notInBayOrMarker'; if (!c.k.approached) return 'r_notApproached'; return null; },
    run(v, c) { CP.Act.ensureNear(v, 'screen', () => CP.UI.open('screen', c.id)); }
  },
  radio: {
    avail(v, c) { if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; if (!c.k.docsHave && !c.k.docsReturned) return 'r_needDocs'; return null; },
    run(v, c) { CP.UI.open('radio', c.id); }
  },
  partner: {
    avail() { const l = lock(5); if (l && CP.G.mode !== 'free') return l; return null; },
    run() { CP.UI.open('partner'); }
  },
  record: {
    avail(v, c) { if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; return null; },
    run(v, c) { CP.UI.open('record', c.id); }
  },
  resolve: {
    avail(v, c) { if (!v) return 'r_noVehicle'; if (!c) return 'r_noCase'; if (c.res) return 'r_resolved'; if (!stoppedFor(v, c)) return 'r_needStop'; if (!c.k.approached) return 'r_notApproached'; return null; },
    run(v, c) { CP.UI.open('resolve', c.id); }
  }
};
CP.Act.order = ['stop', 'wave', 'approach', 'talk', 'docs', 'bay', 'inspect', 'screen', 'radio', 'partner', 'record', 'resolve'];
CP.Act.avail = function (id) {
  const v = CP.Act.curV(), c = CP.Act.curC();
  const r = CP.Act.defs[id].avail(v, c);
  return r ? { ok: false, reason: r.indexOf(' ') > 0 || r.indexOf('…') > 0 || /[\u0600-\u06FF]/.test(r) ? r : CP.t(r) } : { ok: true };
};
CP.Act.run = function (id) {
  if (!CP.G || !CP.G.shift || CP.G.shift.ended) return;
  const a = CP.Act.avail(id);
  if (!a.ok) { CP.UI.toast(a.reason, 'warn'); CP.Audio.deny(); return; }
  CP.Act.defs[id].run(CP.Act.curV(), CP.Act.curC());
};
/* walk to the vehicle first if needed, then run fn */
CP.Act.ensureNear = function (v, act, fn) {
  if (CP.Act.nearVeh(v)) { CP.Actors.face(CP.T.windowX(v)); fn(); return; }
  const sp = CP.Act.spot(v); CP.Actors.walkTo(sp.x, sp.row, { act, vid: v.id });
};
CP.Act.arrived = function (v, c, then) {
  if (!c.k.approached) { c.k.approached = true; CP.Audio.ack(c.driver.g); }
  CP.Actors.face(CP.T.windowX(v) - 1);
  CP.Act.seeCues(v, c);
  if (then === 'talk') CP.UI.open('dialogue', c.id);
  CP.autosave();
};
CP.bus.on('arrive', p => {
  if (p.act && p.vid) {
    const v = CP.T.get(p.vid); if (!v) return; const c = CP.G.shift.cases[v.caseId]; if (!c) return;
    if (p.act === 'approach') { CP.Act.arrived(v, c, 'talk'); return; }
    if (!CP.Act.nearVeh(v)) return;
    CP.Act.select(v.id);
    if (CP.Act.defs[p.act] && !CP.Act.defs[p.act].avail(v, c)) { c.k.approached = c.k.approached || p.act === 'inspect'; CP.Act.defs[p.act].run(v, c); }
  } else if (p.ctx) CP.Act.ctxRun(p.ctx, true);
});

/* cues the officer can perceive now (lighting matters; never appearance) */
CP.Act.dark = function () {
  const s = CP.G.shift; const lvl = CP.G.career.upgrades.lighting;
  const gen = s.equipment.generator !== 'ok';
  if (CP.locBase(s.loc) === 'desert') return gen || lvl === 0;
  return gen || (s.t / s.dur > 0.45 && lvl === 0);
};
CP.Act.cueVisible = function (v, c, cue) {
  const near = CP.Act.nearVeh(v, 2.2);
  const far = ['steam', 'shouting', 'swerve'].indexOf(cue) >= 0;
  if (far) return true;
  if (cue === 'cargo_cartons') return near || CP.Actors.near(v.x - v.len + 0.5, 2.5);
  if (!near) return false;
  if (['sweating', 'drowsy', 'bag_seat', 'passenger_pale'].indexOf(cue) >= 0 && CP.Act.dark() && !c.k.torch) return false;
  return true;
};
CP.Act.seeCues = function (v, c) {
  for (const cue of c.cues) if (c.k.cuesSeen.indexOf(cue) < 0 && CP.Act.cueVisible(v, c, cue)) c.k.cuesSeen.push(cue);
};
CP.Act.recordCue = function (c, cue) {
  if (c.k.cuesRec.indexOf(cue) >= 0) return false;
  c.k.cuesRec.push(cue);
  CP.note(c, 'observation', { ar: CP.C.cues[cue][0], en: CP.C.cues[cue][1] }, 'verified', { cue });
  CP.autosave(); return true;
};
CP.Act.torch = function (c) {
  if (!CP.once('torch:' + c.id + ':' + Math.floor(CP.G.shift.t / 4))) return;
  c.k.torch = true; CP.Actors.poseHold('flashlight', 1.8); CP.G.shift.officer.torchT = 1.8; CP.Audio.click();
  const v = CP.vehOfCase(c); if (v) CP.Act.seeCues(v, c);
};

/* wave through (officer or partner) — closes the case as 'waved', idempotent */
CP.Act.doWave = function (v, by) {
  const s = CP.G.shift; const c = s.cases[v.caseId];
  if (!CP.once('wave:' + v.id)) return;
  if (c && !c.res && CP.once('close:' + c.id)) {
    c.k.endT = s.t;
    c.res = { decision: 'waved', reason: 'routine', support: [], t: s.t, clock: CP.gameClock(), by };
    c.res.eval = CP.Cases.evaluateWaved(c); c.status = 'closed'; s.stats.waved++;
    CP.bus.emit('caseClosed', c);
  }
  v.cleared = true; CP.Gate.open();
  if (by !== 'partner') { CP.Actors.face(v.x + 2); CP.Actors.seq('officer', ['lower', 'wave', 'idle'], 0.22); }
  CP.Audio.whistle(true);
  CP.autosave();
};

/* resolve a case with a decision; enforces requirements; runs release/hold/medical flows once */
CP.Act.resolve = function (c, decision, reason, support) {
  const v = CP.vehOfCase(c);
  if (c.res) return 'r_resolved';
  if (!reason) return 'res_needReason';
  const req = CP.Cases.decisionReq(c, decision, support); if (req) return req;
  if ((decision === 'hold' || decision === 'handover') && (!v || v.st !== 'bay')) return 'r_bayForHold';
  if (!CP.Cases.close(c, decision, reason, support)) return 'r_resolved';
  const s = CP.G.shift;
  // documents go back to the driver
  if (c.k.docsHave && !c.k.docsReturned) { c.k.docsReturned = true; CP.Audio.paper(); CP.Actors.poseHold('documents', 1.0); }
  CP.Career.caseTrust(c);
  if (v) {
    if (decision === 'medical') { v.st = 'medical'; v.hold = true; CP.Events.callAmbulance(c, v); }
    else if (decision === 'hold' || decision === 'handover') { v.st = 'held'; v.hold = true; c.status = 'held'; CP.Events.schedulePickup(c, v, decision === 'handover' ? 22 : 45); }
    else { v.releaseAt = s.t + 0.9; }
  }
  CP.autosave();
  return null;
};

/* ---------------- contextual (location-based) actions ---------------- */
CP.Act.ctx = function () {
  const s = CP.G.shift, out = [];
  const o = s.officer;
  const nearX = (x, t) => Math.abs(o.x - x) <= (t || 1.6);
  if (s.tutorial.step < 99 && s.tutorial.step < 3) return out;
  // cones / priority lane
  out.push({ id: 'cones', icon: 'cone', label: s.prioOpen ? 'a_prioClose' : 'a_prioOpen', near: nearX(AX.coneX + 0.6, 1.8), x: AX.coneX + 0.6, go: 'a_goCones', show: CP.tier() >= 5 || s.events.active.some(e => e.type === 'ambulance') || s.prioOpen });
  const g = s.gate;
  if (g.jam) {
    out.push({ id: 'repair', icon: 'wrench', label: 'a_repairGate', near: nearX(AX.gateX, 1.6), x: AX.gateX, go: 'a_goGate', show: true, task: 'o_repair' });
    out.push({ id: 'manual', icon: 'gate', label: 'a_manualGate', near: nearX(AX.gateX, 1.6), x: AX.gateX, go: 'a_goGate', show: true });
  }
  if (s.equipment.generator !== 'ok') out.push({ id: 'generator', icon: 'bolt', label: 'a_generator', near: nearX(AX.genX, 1.8), x: AX.genX, go: 'a_goGen', show: true, task: 'o_generator' });
  if (s.visitor && !s.visitor.done) out.push({ id: 'visitor', icon: 'person', label: 'a_visitor', near: nearX(AX.visitorX, 1.6), x: AX.visitorX, go: 'a_goVisitor', show: true });
  for (const v of s.vehicles) {
    if (v.stallKind === 'overheat' || v.stallKind === 'collision') {
      const sp = CP.Act.spot(v);
      out.push({ id: 'assist:' + v.id, icon: 'wrench', label: v.stallKind === 'collision' ? 'a_incident' : 'a_assistVehicle', near: CP.Act.nearVeh(v, 1.8), x: sp.x, row: sp.row, go: 'a_walkTo', show: true, task: 'o_vehicle', vid: v.id });
    }
    if (v.leaving) { const sp = CP.Act.spot(v); out.push({ id: 'calm:' + v.id, icon: 'alert', label: 'a_incident', near: CP.Act.nearVeh(v, 1.8), x: sp.x, row: sp.row, go: 'a_walkTo', show: true, vid: v.id }); }
  }
  return out.filter(a => a.show);
};
CP.Act.ctxRun = function (id, arrived) {
  const s = CP.G.shift; const a = CP.Act.ctx().find(x => x.id === id); if (!a) return;
  if (!a.near) { if (arrived) return; CP.Actors.walkTo(a.x, a.row || 0, { ctx: id }); return; }
  const base = id.split(':')[0];
  if (base === 'cones') { CP.Tasks.add({ type: 'o_cones', owner: 'officer', dur: 2.5, key: 'o_cones', data: { x: a.x } }); CP.Actors.poseHold('stop', 2.5); return; }
  if (base === 'repair') { CP.Tasks.add({ type: 'o_repair', owner: 'officer', dur: 6, key: 'o_repair', data: { x: a.x } }); return; }
  if (base === 'manual') { CP.Events.manualGate(); return; }
  if (base === 'generator') { CP.Tasks.add({ type: 'o_generator', owner: 'officer', dur: 4, key: 'o_generator', data: { x: a.x } }); return; }
  if (base === 'visitor') { CP.UI.open('visitor'); return; }
  if (base === 'assist') { CP.Tasks.add({ type: 'o_vehicle', owner: 'officer', dur: 10, key: 'o_vehicle:' + a.vid, data: { x: a.x, row: a.row || 0, vid: a.vid } }); return; }
  if (base === 'calm') { CP.Events.calmLeaver(CP.T.get(a.vid)); return; }
};
const officerAt = t => { const o = CP.G.shift.officer; return !o.moving && Math.abs(o.x - t.data.x) < 1.9 && Math.abs((o.row || 0) - (t.data.row || 0)) < 0.3; };
CP.Tasks.on('o_cones', () => CP.Actors.toggleCones(), officerAt);
CP.Tasks.on('o_repair', () => CP.Events.gateRepaired('officer'), officerAt);
CP.Tasks.on('o_generator', () => CP.Events.generatorFixed('officer'), officerAt);
CP.Tasks.on('sgt_repair', () => CP.Events.gateRepaired('partner'));
CP.Tasks.on('sgt_generator', () => CP.Events.generatorFixed('partner'));
CP.Tasks.on('o_vehicle', t => { const v = CP.T.get(t.data.vid); if (v) CP.Events.fixVehicle(v); }, officerAt);
CP.Act.officerTask = () => CP.Tasks.find(t => t.owner === 'officer');

/* documents handover: the driver passes the papers through the window */
CP.Tasks.on('handover', t => {
  const c = CP.G.shift.cases[t.caseId]; if (!c) return;
  c.k.docsHanding = false; c.k.docsHave = true; CP.Audio.paper();
  CP.UI.toast(CP.t(CP.Gender.isF(c) ? 'docs_handed_f' : 'docs_handed'), 'ok');
  CP.bus.emit('dialogue'); CP.UI.refreshDock(true); CP.autosave();
});
;(window.CP_FILES = window.CP_FILES || {})['10_actions'] = '2.8.0';
