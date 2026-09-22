/* Officer + partner: walk (keyboard or click/tap destination), pose sequences, partner task queue (one task at a time). */
CP.Actors = {};
const AW = CP.W;
CP.Actors.ROW_WALK = 0; CP.Actors.ROW_BAY = 1;

CP.Actors.walkTo = function (x, row, pending) {
  const o = CP.G.shift.officer;
  o.target = { x: CP.clamp(x, -0.3, AW.worldW - 0.7), row: row ?? o.row ?? 0 };
  o.pending = pending || null;
  o.seq = null;
};
CP.Actors.near = function (x, tol, row) {
  const o = CP.G.shift.officer; tol = tol ?? 1.4;
  if (row != null && Math.abs((o.row || 0) - row) > 0.2) return false;
  return Math.abs(o.x - x) <= tol;
};
CP.Actors.walking = () => { const o = CP.G.shift.officer; return !!o.target || (CP.Input && CP.Input.axis !== 0); };
/* pose sequences, e.g. stop: idle → raise → stop (hold) */
CP.Actors.seq = function (who, frames, step, hold) {
  const a = who === 'partner' ? CP.G.shift.partner : CP.G.shift.officer;
  a.seq = { frames, step, t: 0, hold: hold || 0 };
};
CP.Actors.poseHold = function (pose, dur, who) {
  const a = who === 'partner' ? CP.G.shift.partner : CP.G.shift.officer;
  a.seq = { frames: [pose], step: dur, t: 0, hold: 0 };
};
CP.Actors.face = function (x, who) { const a = who === 'partner' ? CP.G.shift.partner : CP.G.shift.officer; a.dir = x >= a.x ? 1 : -1; };

function stepActor(a, dt, speed) {
  a.px = a.x; a.prow = a.row || 0;
  let moving = false;
  const inAxis = (a === CP.G.shift.officer && CP.Input) ? CP.Input.axis : 0;
  if (inAxis !== 0 && a === CP.G.shift.officer) {
    a.target = null; a.pending = null;
    const nx = CP.clamp(a.x + inAxis * speed * dt, -0.3, AW.worldW - 0.7);
    a.walkT += Math.abs(nx - a.x); a.x = nx; a.dir = inAxis; moving = true; a.seq = null;
    if (CP.Input.vert) { a.row = CP.clamp((a.row || 0) + CP.Input.vert * dt * 1.2, 0, 1); }
  } else if (a.target) {
    const t = a.target; const dr = (t.row || 0) - (a.row || 0);
    const dx = t.x - a.x;
    const dist = Math.hypot(dx, dr * 2.2);
    if (dist < 0.04) {
      a.x = t.x; a.row = t.row || 0; a.target = null;
      if (a === CP.G.shift.officer && a.pending) { const p = a.pending; a.pending = null; CP.bus.emit('arrive', p); }
    } else {
      const stepLen = Math.min(dist, speed * dt);
      a.x += dx / dist * stepLen; a.row = (a.row || 0) + (dr * 2.2) / dist * stepLen / 2.2;
      a.walkT += stepLen; if (Math.abs(dx) > 0.02) a.dir = Math.sign(dx); moving = true; a.seq = null;
    }
  }
  a.moving = moving;
  if (a.seq) { a.seq.t += dt; const n = a.seq.frames.length; const idx = Math.floor(a.seq.t / a.seq.step); if (idx >= n) { if (a.seq.hold > 0 && a.seq.t < n * a.seq.step + a.seq.hold) { a.pose = a.seq.frames[n - 1]; } else { a.seq = null; a.pose = 'idle'; } } else a.pose = a.seq.frames[idx]; }
  else if (!moving) a.pose = a.basePose || 'idle';
}

CP.Actors.update = function (dt) {
  const s = CP.G.shift; const o = s.officer, p = s.partner;
  o.row = o.row || 0; p.row = p.row || 0;
  stepActor(o, dt, AW.officerSpeed * (o.pending ? 1.85 : 1));
  // partner: go to current task location, else home
  const task = p.task ? CP.Tasks.get(p.task) : null;
  if (p.task && !task) { p.task = null; p.basePose = 'idle'; }
  const goal = task ? task.data : { x: p.home, row: 0 };
  if (!p.target || Math.abs(p.target.x - goal.x) > 0.05 || (p.target.row || 0) !== (goal.row || 0)) {
    if (Math.abs(p.x - goal.x) > 0.05 || Math.abs(p.row - (goal.row || 0)) > 0.05) p.target = { x: goal.x, row: goal.row || 0 };
  }
  stepActor(p, dt, AW.officerSpeed * 0.95);
  if (task && !p.moving) { p.basePose = task.data.pose || 'idle'; if (task.data.faceX != null) CP.Actors.face(task.data.faceX, 'partner'); }
  else if (!task) { p.basePose = 'idle'; if (!p.moving) p.dir = -1; }
};
/* v1.6 officer sheets: 4 characters (0 navy, 1 white, 2 navy senior, 3 white senior), each with 8-frame rows:
   idle (breathing), hand (fidget), stop (raise → hold → lower), pass (wave-through), radio (walk + talk), run.
   The player is character 0, the partner character 1; checkpoint staff (23_staff.js) use 2 and 3. */
CP.Actors.charOf = a => a.char != null ? a.char : (CP.G && CP.G.shift && a === CP.G.shift.partner ? 1 : 0);
const PP = (t, fps, n) => { const k = ((Math.floor(t * fps) % (2 * n - 2)) + 2 * n - 2) % (2 * n - 2); return k < n ? k : 2 * n - 2 - k; }; // ping-pong index
CP.Actors.frameFor = function (ch, pose, moving, walkT, t, calm, prog) {
  const S = CP.A.M.sprites, o = 'o' + ch + '_'; const has = id => !!S[id];
  if (moving) {
    if (calm) return o + 'radio_' + [2, 3, 4, 5, 4, 3][((Math.floor(walkT / 0.22) % 6) + 6) % 6]; // relaxed walk holding the radio
    return o + 'run_' + (((Math.floor(walkT / (1.45 / 8)) % 8) + 8) % 8);
  }
  pose = pose || 'idle'; let id;
  switch (pose) {
    case 'idle': { const ph = t % 13; id = ph > 10.2 && ph < 11.6 ? o + 'hand_' + Math.min(7, Math.floor((ph - 10.2) / 1.4 * 8)) : o + 'idle_' + PP(t, 5, 8); break; }
    case 'raise': id = o + 'stop_' + (prog == null ? 2 : Math.min(3, Math.floor(prog * 4))); break;
    case 'stop': id = o + 'stop_' + (Math.floor(t * 1.2) % 2 ? 4 : 3); break;
    case 'lower': id = o + 'stop_' + (prog == null ? 6 : 4 + Math.min(3, Math.floor(prog * 4))); break;
    case 'wave': id = o + 'pass_' + (prog == null ? [1, 2, 3, 4, 5, 4, 3, 2][((Math.floor(t * 11) % 8) + 8) % 8] : Math.min(7, Math.floor(prog * 8))); break;
    case 'radio': id = o + 'radio_' + (Math.floor(t * 2.5) % 2 ? 4 : 3); break;
    case 'documents': id = o + 'hand_' + (Math.floor(t * 0.9) % 2 ? 3 : 2); break;
    case 'flashlight': id = o + 'radio_5'; break;
    default: id = o + pose;
  }
  return has(id) ? id : o + 'idle_0';
};
CP.Actors.frameOf = function (a) {
  const t = (CP.R && CP.R.t || 0) + (a.animOff || (CP.G && CP.G.shift && a === CP.G.shift.partner ? 0.9 : 0));
  const s = CP.G && CP.G.shift; const far = a.target != null && Math.abs(a.target - a.x) > 5.5;
  const calm = a.calm != null ? a.calm : (s && a === s.partner) ? true : !(far || a.hurry || (s && (s.events.rushUntil > s.t)));
  const prog = a.seq && a.seq.step > 0 ? Math.min(0.999, (a.seq.t % a.seq.step) / a.seq.step) : null;
  return CP.Actors.frameFor(CP.Actors.charOf(a), a.pose, a.moving, a.walkT || 0, t, calm, prog);
};

/* ---------------- partner tasks ---------------- */
CP.PT = {
  lvl: { traffic: 0, verify: 0, cones: 0, supplies: 0, visitor: 0, vehicle: 0, medical: 1, assist: 1, repair: 2, generator: 2 },
  dur: { verify: 1, cones: 4, supplies: 7, visitor: 8, vehicle: 6, medical: 14, assist: 1e9, repair: 6, generator: 4, traffic: 1e9 }
};
CP.Actors.partnerTask = () => { const p = CP.G.shift.partner; return p.task ? CP.Tasks.get(p.task) : null; };
CP.Actors.partnerCan = function (kind) {
  return CP.G.career.upgrades.partner >= (CP.PT.lvl[kind] || 0) ? null : 'r_partnerSkill';
};
/* assign a partner task; returns error key or null. `force` replaces the current task. */
CP.Actors.assign = function (kind, data, force) {
  const s = CP.G.shift, p = s.partner;
  const err = CP.Actors.partnerCan(kind); if (err) return err;
  const cur = CP.Actors.partnerTask();
  if (cur && !force) return 'r_partnerBusy';
  if (cur) CP.Tasks.cancel(cur.id, 'replaced');
  if (kind === 'traffic') s.flow = 'flow'; else if (s.flow === 'flow') s.flow = 'hold';
  const t = CP.Tasks.add({ type: 'p_' + kind, owner: 'partner', dur: CP.PT.dur[kind], caseId: data.caseId || null, data: Object.assign({ kind, row: 0 }, data) });
  p.task = t.id;
  CP.Audio.radioClick();
  CP.bus.emit('partner', t);
  return null;
};
CP.Actors.partnerRecall = function () {
  const s = CP.G.shift, cur = CP.Actors.partnerTask();
  if (cur) CP.Tasks.cancel(cur.id, 'recalled');
  s.partner.task = null; if (s.flow === 'flow') s.flow = 'hold';
};
/* partner tasks progress only once the partner has arrived */
const atGoal = t => { const p = CP.G.shift.partner; return p.task === t.id && Math.abs(p.x - t.data.x) < 0.3 && Math.abs(p.row - (t.data.row || 0)) < 0.1; };
for (const k of Object.keys(CP.PT.lvl)) CP.Tasks.P['p_' + k] = atGoal;

const endPartner = t => { const p = CP.G.shift.partner; if (p.task === t.id) p.task = null; };
CP.Tasks.on('p_verify', t => { endPartner(t); const c = CP.G.shift.cases[t.caseId]; if (c && !c.res) { const e = CP.Cases.radioQuery(c, t.data.q, true); if (e && CP.UI) CP.UI.toast(CP.t(e), 'warn'); } }, atGoal);
CP.Tasks.on('p_cones', t => { endPartner(t); CP.Actors.toggleCones(); }, atGoal);
CP.Tasks.on('p_supplies', t => { endPartner(t); CP.Actors.restock(); }, atGoal);
CP.Tasks.on('p_visitor', t => { endPartner(t); CP.Events.visitorHelped(true, 'partner'); }, atGoal);
CP.Tasks.on('p_vehicle', t => { endPartner(t); const v = CP.T.get(t.data.vid); if (v) CP.Events.fixVehicle(v); }, atGoal);
CP.Tasks.on('p_medical', t => { endPartner(t); const c = CP.G.shift.cases[t.caseId]; if (c) { c.flags.stabilised = true; CP.note(c, 'incident', { ar: 'الزميل قدّم إسعافات أولية وطمّن الراكب', en: 'Partner gave first aid and reassured the patient' }, 'verified'); } }, atGoal);
CP.Tasks.on('p_repair', t => { endPartner(t); CP.Events.gateRepaired('partner'); }, atGoal);
CP.Tasks.on('p_generator', t => { endPartner(t); CP.Events.generatorFixed('partner'); }, atGoal);
CP.Tasks.on('p_assist', t => { endPartner(t); }, atGoal);
CP.Tasks.on('p_traffic', t => { endPartner(t); }, atGoal);

CP.Actors.toggleCones = function () {
  const s = CP.G.shift; s.prioOpen = !s.prioOpen; CP.Audio.cone();
  CP.UI && CP.UI.toast(CP.t(s.prioOpen ? 'a_prioOpen' : 'a_prioClose') + ' ✓', 'ok');
  if (s.prioOpen) s.prioOpenedT = s.t;
};
CP.Actors.restock = function () {
  const s = CP.G.shift, e = s.equipment;
  s.restocks = (s.restocks || 0) + 1;
  if (s.restocks > 2) { CP.UI && CP.UI.toast(CP.L({ ar: 'مفيش مستلزمات تانية في الكشك', en: 'No spare supplies left in the booth' }), 'warn'); return; }
  e.mouth += 2; e.kits += 1; e.gloves += 2; e.bags += 1; if (e.breath === 'fault') e.breath = 'ready';
  CP.UI && CP.UI.toast(CP.L({ ar: 'المستلزمات اتجابت من الكشك', en: 'Supplies fetched from the booth' }), 'ok');
};

/* partner "traffic" mode: waves vehicles through at the marker unless the player has stopped them */
CP.Actors.partnerTraffic = function (dt) {
  const s = CP.G.shift; const t = CP.Actors.partnerTask();
  if (!t || t.type !== 'p_traffic' || !atGoal(t)) return;
  const v = s.vehicles.find(x => x.st === 'marker' && x.caseId);
  if (!v) { s.flowT = 0; return; }
  const c = s.cases[v.caseId]; if (c.k.stopped || c.k.approached || s.selected === v.id && s.officer && Math.abs(s.officer.x - CP.T.windowX(v)) < 3) { s.flowT = 0; return; }
  s.flowT = (s.flowT || 0) + dt;
  if (s.flowT > 3.2) { s.flowT = 0; CP.Act.doWave(v, 'partner'); CP.Actors.seq('partner', ['lower', 'wave', 'idle'], 0.22); }
};
;(window.CP_FILES = window.CP_FILES || {})['09_actors'] = '1.9.0';
