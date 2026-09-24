/* Traffic: fixed-step (60 Hz) vehicle simulation with car-following, stop marker, gate interlock, bay transitions.
   Positions are in metres. x = FRONT bumper. rows: 0 main lane, 1 priority lane, 2 inspection bay. */
CP.W = {
  marker: 16.8, gateX: 17.35, armLen: 3.35, sensor: [17.1, 20.9], clearX: 21.0,
  exitX: 46, bayA: 36.8, bayB: 29.4, bayMaxLen: 7, coneX: 1.1, boothX: 23.4, genX: 32.2, visitorX: 26.2,
  transStart: 21.6, transLen: 4.0, worldW: 38.5, stopGap: 1.25, officerSpeed: 1.9
};
CP.T = {};
const TW = CP.W;

CP.T.len = type => CP.A.M.vehicles[type].lengthMetres;
CP.T.rOcc = v => v.trans ? [v.trans.from, v.trans.to] : [Math.round(v.row)];
CP.T.rTarget = v => v.trans ? v.trans.to : Math.round(v.row);
CP.T.rear = v => v.x - v.len;
CP.T.windowX = v => { const V = CP.C.veh[v.type]; return v.x - v.len + v.len * (V ? V.win : .75); };
CP.T.get = id => CP.G.shift.vehicles.find(v => v.id === id) || null;
CP.T.atMarker = () => CP.G.shift.vehicles.find(v => v.row === 0 && !v.trans && (v.st === 'marker' || v.st === 'stopped')) || null;

CP.T.mk = function (type, extra) {
  const s = CP.G.shift; const V = CP.C.veh[type];
  const v = Object.assign({
    id: 'V' + (s.nextVid++), type, caseId: null, special: null, row: 0, prow: 0, x: -2, px: -2, v: 0, a: 0, wheel: 0, pwheel: 0,
    pitch: 0, pitchV: 0, heave: 0, heaveV: 0, brake: false, st: 'approach', route: 'main', slot: null, cleared: false,
    trans: null, react: 0.55 + Math.random() * 0.5, reactT: 0, stall: 0, stallKind: null, len: CP.T.len(type),
    maxV: V.maxV, acc: V.acc, dec: V.dec, spawnT: s.t, honkT: 0, stopAt: null, dwell: 0, late: false, beacon: false, idleT: Math.random() * 6
  }, extra || {});
  v.px = v.x; v.prow = v.row; v.pwheel = v.wheel;
  return v;
};

/* rear-most x of vehicles in a row (for spawning behind the queue) */
CP.T.tailX = function (row) {
  let m = Infinity; for (const v of CP.G.shift.vehicles) if (CP.T.rOcc(v).indexOf(row) >= 0) m = Math.min(m, v.x - v.len);
  return m;
};

/* spawn a civilian vehicle with its case (truth generated ONCE here) */
CP.T.spawnCivilian = function (opts) {
  const s = CP.G.shift; opts = opts || {};
  const tail = CP.T.tailX(0);
  // need room: new front at min(-1, tail - gap); refuse if it would be far off screen (backlog)
  const c = CP.Cases.generate(opts);
  const len = CP.T.len(c.type);
  let x = Math.min(-1.5, tail - 4);
  if (x < -18) { // no room — undo nothing (case exists but vehicle waits off-screen)
    s.pending = s.pending || []; s.pending.push(c.id); c.status = 'offscreen'; s.backlog = s.pending.length;
    return null;
  }
  const v = CP.T.mk(c.type, { caseId: c.id, x, v: Math.min(8, CP.C.veh[c.type].maxV * 0.7), special: opts.special || null });
  if (c.cues.indexOf('swerve') >= 0) v.swerve = 1;
  s.vehicles.push(v); s.spawned++;
  c.status = 'approach';
  CP.bus.emit('spawn', v);
  return v;
};
/* bring an off-screen pending case onto the road when space frees */
CP.T.flushPending = function () {
  const s = CP.G.shift; if (!s.pending || !s.pending.length) return;
  const tail = CP.T.tailX(0); if (tail < 2) return;
  const cid = s.pending.shift(); const c = s.cases[cid]; s.backlog = s.pending.length;
  const v = CP.T.mk(c.type, { caseId: c.id, x: Math.min(-1.5, tail - 4), v: 6 });
  s.vehicles.push(v); c.status = 'approach';
};
CP.T.spawnService = function (type, extra) {
  const s = CP.G.shift;
  const tail = CP.T.tailX(1);
  const v = CP.T.mk(type, Object.assign({ row: 1, x: Math.min(-3, tail - 5), v: 10, beacon: true, route: 'prio' }, extra || {}));
  v.prow = v.row; v.px = v.x;
  s.vehicles.push(v);
  return v;
};

/* ---------------- gate ---------------- */
CP.Gate = {
  sensorBusy() {
    const [a, b] = TW.sensor;
    return CP.G.shift.vehicles.some(v => CP.T.rOcc(v).indexOf(0) >= 0 && v.x > a && v.x - v.len < b);
  },
  open(manual) {
    const g = CP.G.shift.gate;
    if (g.jam && !manual) return 'r_gateJam';
    if (g.state === 'open' || g.state === 'opening') return null;
    g.state = 'opening'; g.holdT = 0; CP.Audio.gate(true); return null;
  },
  close(manual) {
    const g = CP.G.shift.gate;
    if (g.jam && !manual) return 'r_gateJam';
    if (this.sensorBusy()) { g.sensorMsgT = 2.5; return 'g_sensorBlock'; }
    if (g.state === 'closed' || g.state === 'closing') return null;
    g.state = 'closing'; CP.Audio.gate(false); return null;
  },
  update(dt) {
    const s = CP.G.shift, g = s.gate;
    if (g.sensorMsgT > 0) g.sensorMsgT -= dt;
    if (g.jam) { if (g.state !== 'jammed') g.state = 'jammed'; }
    const speed = g.manualOp ? 1 / 3.2 : 1 / 1.5;
    if (g.state === 'opening') { g.ang = Math.min(1, g.ang + dt * speed); if (g.ang >= 1) { g.state = g.jam ? 'jammed' : 'open'; g.manualOp = false; } }
    else if (g.state === 'closing') {
      if (this.sensorBusy()) { g.state = 'opening'; g.sensorMsgT = 2.5; CP.bus.emit('gateInterlock'); }
      else { g.ang = Math.max(0, g.ang - dt * speed); if (g.ang <= 0) { g.state = g.jam ? 'jammed' : 'closed'; g.manualOp = false; } }
    } else if (g.state === 'open' && !g.jam) {
      // auto-close when nothing cleared is waiting to pass and the sensor is clear
      const waiting = s.vehicles.some(v => v.cleared && CP.T.rOcc(v).indexOf(0) >= 0 && v.x - v.len < TW.sensor[1] + 0.2);
      if (!waiting && !this.sensorBusy()) { g.holdT = (g.holdT || 0) + dt; if (g.holdT > 0.8) { g.holdT = 0; this.close(); } }
      else g.holdT = 0;
    } else if (g.state === 'closed' && !g.jam) {
      // a cleared vehicle waiting at the marker gets the arm back up
      if (s.vehicles.some(v => v.cleared && !v.hold && v.row === 0 && !v.trans && Math.abs(v.x - TW.marker) < 0.35 && !v.stall)) this.open();
    }
  },
  isOpen() { const g = CP.G.shift.gate; return g.ang > 0.9; }
};

/* ---------------- stop points ---------------- */
function stopPointFor(v, s) {
  let sp = Infinity;
  const tgt = CP.T.rTarget(v);
  // main lane marker & gate
  if (tgt === 0 || (v.trans && v.trans.from === 0 && v.x <= TW.marker + 0.3)) {
    if (v.x <= TW.marker + 0.25) {
      const mayPass = v.cleared && CP.Gate.isOpen();
      if (!mayPass) sp = Math.min(sp, TW.marker);
    }
  }
  if (v.route === 'bay' && v.slot) sp = Math.min(sp, v.slot === 'A' ? TW.bayA : TW.bayB);
  if ((tgt === 1) && !s.prioOpen && v.x <= TW.coneX - 0.4) sp = Math.min(sp, TW.coneX - 0.6);
  if (v.stopAt != null && v.x <= v.stopAt + 0.3) sp = Math.min(sp, v.stopAt);
  if (v.hold) sp = Math.min(sp, v.x);
  return sp;
}
function leaderOf(v, s) {
  const tr = CP.T.rTarget(v), cur = Math.round(v.row);
  let best = null, bx = Infinity;
  for (const o of s.vehicles) {
    if (o === v || o.x <= v.x) continue;
    const occ = CP.T.rOcc(o);
    if (occ.indexOf(tr) < 0 && !(v.trans && occ.indexOf(cur) >= 0 && Math.abs(v.row - cur) < 0.35)) continue;
    const r = o.x - o.len; if (r < bx) { bx = r; best = o; }
  }
  return best;
}

/* ---------------- main step ---------------- */
CP.T.step = function (dt) {
  const s = CP.G.shift;
  const dust = s.events.dustUntil > s.t;
  for (const v of s.vehicles) {
    v.px = v.x; v.prow = v.row; v.pwheel = v.wheel;
    if (v.releaseAt != null && s.t >= v.releaseAt) { v.releaseAt = null; CP.T.release(v); if (v.row === 0 || CP.Act.nearVeh(v, 3)) CP.Actors.seq('officer', ['stop', 'lower', 'wave', 'idle'], 0.2); }
  }
  // order front-to-back so leaders update first
  const order = s.vehicles.slice().sort((a, b) => b.x - a.x);
  for (const v of order) {
    const L = leaderOf(v, s);
    let stopX = stopPointFor(v, s);
    let gapStop = Infinity;
    if (L) gapStop = (L.x - L.len) - (v.late ? 0.15 : TW.stopGap);
    const target = Math.min(stopX, gapStop);
    let maxV = v.maxV * (dust ? 0.7 : 1);
    const rowNow = Math.round(v.row);
    if (rowNow !== 0 || v.trans) maxV = Math.min(maxV, v.special === 'ambulance' ? 9 : 5);
    if (v.trans) maxV = Math.min(maxV, 3.2);
    if (v.limp) maxV = Math.min(maxV, 2.2);
    const dist = target - v.x;
    // stopping-distance governed desired speed: d = v^2/(2b) + v*t + margin
    const b = v.dec * 0.62 * (CP.Weather ? CP.Weather.grip(s) : 1);
    let vDes = dist <= 0.02 ? 0 : Math.min(maxV, Math.sqrt(2 * b * Math.max(0, dist - 0.02)));
    // anticipate a moving leader
    if (L && isFinite(gapStop) && gapStop - v.x < 12) {
      const lead = L.v; const safe = (v.v * v.v) / (2 * v.dec) + v.v * v.react + (v.late ? 0.2 : TW.stopGap);
      if ((L.x - L.len) - v.x < safe) vDes = Math.min(vDes, lead);
    }
    if (v.stall > 0) { vDes = 0; v.stall -= dt; if (v.stall <= 0 && v.stallKind === 'stall') { v.stall = 0; v.stallKind = null; CP.bus.emit('unstall', v); } if (v.stallKind === 'overheat' || v.stallKind === 'collision') v.stall = Math.max(v.stall, 0.1); }
    // reaction delay when starting from rest
    let a;
    if (v.v < 0.05 && vDes > 0.3) { v.reactT += dt; a = v.reactT >= v.react ? v.acc : 0; }
    else { if (v.v > 0.2) v.reactT = 0; a = CP.clamp((vDes - v.v) * 2.4, -v.dec * 1.4, v.acc); }
    { const J = a < (v.a || 0) ? 16 : 6; a = (v.a || 0) + CP.clamp(a - (v.a || 0), -J * dt, J * dt); }
    if (v.v <= 0 && a < 0) a = 0;
    v.a = a;
    v.v = Math.max(0, v.v + a * dt);
    let dx = v.v * dt;
    // hard constraints: never pass the stop target or overlap the leader
    if (v.x + dx > stopX) { dx = Math.max(0, stopX - v.x); v.v = 0; }
    if (L) {
      const limit = (L.x - L.len) - (v.late ? 0.05 : 0.3);
      if (v.x + dx > limit) {
        const was = v.v;
        dx = Math.max(0, limit - v.x); v.v = Math.min(v.v, L.v);
        if (v.late && was > 0.6 && !v.bumped) { v.bumped = true; CP.bus.emit('bump', { a: v, b: L, sp: was }); }
      }
    }
    v.x += dx;
    v.wheel += dx / CP.A.M.vehicles[v.type].wheelRadiusMetres;
    v.brake = a < -0.4 || v.v < 0.05;
    // lane transitions
    if (v.trans) {
      const p = CP.clamp((v.x - v.trans.x0) / (v.trans.x1 - v.trans.x0), 0, 1);
      v.row = CP.lerp(v.trans.from, v.trans.to, CP.smooth(p));
      if (p >= 1) { v.row = v.trans.to; v.trans = null; }
    } else routeTransitions(v);
    // suspension: braking pitch (nose down) + heave spring
    const tp = CP.clamp(-v.a * 0.0045, -0.022, 0.03);
    // (suspension handled by CP.Phys)
    ;
    // rumble strip before marker
    ;
    if (CP.Phys) CP.Phys.step(v, dt, dx, rowNow);
    if (v.v < 0.05) v.idleT += dt;
    statusUpdate(v, s, dt);
  }
  // remove exited
  for (const v of s.vehicles.slice()) {
    if (v.x - v.len > TW.exitX) { CP.T.remove(v); }
  }
  CP.T.freeSlotIfLeft();
  CP.T.flushPending();
};

function routeTransitions(v) {
  if (v.route === 'bay' && v.slot) {
    const sx = v.slot === 'A' ? TW.bayA : TW.bayB;
    if (v.row === 0 && v.x >= TW.transStart) v.trans = { from: 0, to: 1, x0: v.x, x1: v.x + TW.transLen };
    else if (v.row === 1 && v.x >= sx - 3.2) v.trans = { from: 1, to: 2, x0: v.x, x1: sx - 0.1 };
  } else if (v.route === 'exit' && v.row === 2) {
    v.trans = { from: 2, to: 1, x0: v.x, x1: v.x + 3.4 };
  }
}

function statusUpdate(v, s, dt) {
  const c = v.caseId ? s.cases[v.caseId] : null;
  if (!c) return;
  const k = c.k;
  if (c.res) { if (v.st !== 'held' && v.st !== 'medical') v.st = 'leaving'; }
  else if (v.route === 'bay') {
    const sx = v.slot === 'A' ? TW.bayA : TW.bayB;
    if (v.row === 2 && !v.trans && Math.abs(v.x - sx) < 0.15 && v.v < 0.05) { if (v.st !== 'bay') { v.st = 'bay'; c.status = 'bay'; CP.bus.emit('bayArrive', v); } }
    else v.st = 'toBay';
  } else if (v.row === 0 && !v.trans) {
    const atM = Math.abs(v.x - TW.marker) < 0.3 && v.v < 0.05;
    if (k.stopped) v.st = atM ? 'stopped' : 'queue';
    else if (atM) { if (v.st !== 'marker') { v.st = 'marker'; c.status = 'marker'; if (k.markerT == null) k.markerT = s.t; CP.bus.emit('atMarker', v); } }
    else v.st = v.x < -0.5 ? 'approach' : 'queue';
  }
  // patience: waiting drains it; impatience makes noise and complaints, never proves guilt
  const waiting = !c.res && v.v < 0.1 && ['queue', 'marker', 'stopped', 'bay'].indexOf(v.st) >= 0;
  if (waiting) {
    const pr = { patient: .025, chatty: .035, anxious: .04, impatient: .07, defensive: .05 }[c.driver.pers] * (1 + c.urgency) * (v.special === 'wedding' ? 2.2 : 1);
    const talking = CP.UI && CP.UI.openCase === c.id;
    c.patience = Math.max(0, c.patience - dt * pr * (talking ? 0.4 : 1) * (k.explained ? 0.6 : 1));
    v.honkT -= dt;
    if (c.patience < 30 && v.honkT <= 0 && v.st !== 'bay') {
      v.honkT = 9 + Math.random() * 10;
      CP.Audio.horn(v.special === 'wedding' ? 'wedding' : 'short', v.x); s.stats.honks++;
      CP.bus.emit('honk', v);
    }
    if (c.patience <= 0 && CP.once('cmp:' + c.id)) { s.stats.complaints++; CP.note(c, 'incident', { ar: 'شكوى من طول الانتظار', en: 'Complaint about the waiting time' }, 'verified'); }
  }
}

CP.T.remove = function (v) {
  const s = CP.G.shift; const i = s.vehicles.indexOf(v); if (i < 0) return;
  s.vehicles.splice(i, 1);
  if (s.selected === v.id) s.selected = null;
  for (const k of ['A', 'B']) if (s.bay && s.bay[k] === v.id) s.bay[k] = null;
  const c = v.caseId ? s.cases[v.caseId] : null;
  if (c) { c.status = 'closed'; if (!c.res) { /* should not happen: vehicles only leave when cleared */ c.res = { decision: 'waved', reason: 'left', support: [], t: s.t, eval: CP.Cases.evaluateWaved(c) }; } s.stats.handled++; }
  CP.bus.emit('despawn', v);
};

/* ---------------- commands (validated; idempotent) ---------------- */
CP.T.bayFree = function () {
  const s = CP.G.shift; s.bay = s.bay || { A: null, B: null };
  const cap = CP.G.career.upgrades.bay >= 1 ? ['A', 'B'] : ['A'];
  for (const k of cap) if (!s.bay[k]) return k;
  return null;
};
CP.T.prioBusy = function () {
  return CP.G.shift.vehicles.some(o => CP.T.rOcc(o).indexOf(1) >= 0 && o.x > -16 && o.x - o.len < TW.bayA + 1 && (o.special === 'ambulance' || o.special === 'pickup' || o.route === 'exit' || o.route === 'bay') && o.v > 0.05);
};
CP.T.sendToBay = function (v) {
  const s = CP.G.shift;
  if (v.len > TW.bayMaxLen) return 'r_tooLong';
  const slot = CP.T.bayFree(); if (!slot) return 'r_bayFull';
  if (s.gate.jam && !CP.Gate.isOpen()) return 'r_gateJam';
  if (CP.T.prioBusy()) return 'r_laneBusy';
  if (!CP.once('bay:' + v.id)) return null;
  s.bay[slot] = v.id; v.route = 'bay'; v.slot = slot; v.cleared = true;
  CP.Gate.open();
  const c = s.cases[v.caseId]; if (c) c.status = 'toBay';
  v.st = 'toBay';
  CP.Audio.whistle();
  return null;
};
CP.T.release = function (v) {
  const s = CP.G.shift;
  if (!CP.once('rel:' + v.id)) return null;
  v.hold = false; v.stopAt = null;
  if (Math.round(v.row) === 2) {
    if (v.slot && s.bay[v.slot] === v.id) { /* keep slot reserved until it leaves the bay row */ }
    v.route = 'exit'; v.cleared = true;
  } else { v.cleared = true; CP.Gate.open(); }
  v.st = 'leaving';
  return null;
};
CP.T.freeSlotIfLeft = function () {
  const s = CP.G.shift; if (!s.bay) return;
  for (const k of ['A', 'B']) { const id = s.bay[k]; if (!id) continue; const v = CP.T.get(id); if (!v || (v.route === 'exit' && v.row < 1.5)) s.bay[k] = null; }
};

/* decorative distant traffic on the far carriageway (not part of cases) */
CP.T.far = function (dt) {
  const s = CP.G.shift; s.far = s.far || [];
  if (CP.S.quality === 'low' && s.far.length > 1) return;
  s.farT = (s.farT || 0) - dt;
  if (s.farT <= 0) {
    if (!(CP.LOCS[s.loc] || {}).far) { s.farT = 999; return; }
    s.farT = (s.loc === 'desert' ? 9 : 4) + Math.random() * (s.loc === 'desert' ? 14 : 7);
    const types = s.loc === 'desert' ? ['cargo_truck', 'silver_sedan', 'coach', 'charcoal_suv', 'green_pickup', 'estate_wagon', 'box_truck'].concat(Math.random() < 0.1 ? ['pol_4x4', 'pol_suv', 'pol_armored'] : []) : ['cairo_taxi', 'microbus', 'classic_sedan', 'silver_sedan', 'city_bus', 'red_classic', 'blue_hatch', 'maroon_hatch', 'white_luxury', 'alex_taxi'].concat(Math.random() < 0.12 ? ['pol_traffic_sedan', 'pol_sedan', 'pol_hatch'] : []);
    s.far.push({ type: types[Math.floor(Math.random() * types.length)], x: -8, px: -8, v: 9 + Math.random() * 6, w: 0, pw: 0 });
  }
  for (const f of s.far) { f.px = f.x; f.pw = f.w; f.x += f.v * dt * 2.1; f.w += (f.v * dt) / CP.A.M.vehicles[f.type].wheelRadiusMetres; }
  s.far = s.far.filter(f => f.x < 95);
};
;(window.CP_FILES = window.CP_FILES || {})['08_traffic'] = '2.7.0';
