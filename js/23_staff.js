/* Checkpoint staff (v1.5): two senior officers from the new sheet who live at the checkpoint and react to what is happening.
   Sergeant (navy senior, character 2) works the far side by the barrier; the supervisor (white senior, character 3) runs the
   inspection bay from the near walkway. They never take decisions for the player — they read the scene and act like a real crew:
   a second stop hand on approaching traffic, a wave when the barrier lifts, a radio call after a big case, walking to the gate
   cabinet or the generator when something breaks, a torch on the car in the bay at night. */
CP.Staff = { list: [], SPEED: 1.35 };
const staffSpeed = m => m.hurry ? 2.6 : CP.Staff.SPEED;
const SW = CP.W;

CP.Staff.reset = function () {
  const Y = CP.R.Y;
  this.list = [
    { id: 'sgt', char: 2, x: 16.0, px: 16.0, yup: Y.mainFar + 0.10, dir: -1, pose: 'idle', walkT: 0, home: 16.0, wp: [16.0, 12.3, 21.9], next: 22 + Math.random() * 20, animOff: 1.7, hM: CP.HUMAN.staffFar },
    { id: 'sup', char: 3, x: 31.0, px: 31.0, yup: 0.30, dir: -1, pose: 'idle', walkT: 0, home: 31.0, wp: [27.6, 31.0, 35.4], next: 15 + Math.random() * 20, animOff: 3.1, hM: CP.HUMAN.staffNear }
  ];
};

/* move toward a target x on the member's own walkway; returns true while moving */
function staffStep(m, dt) {
  m.px = m.x;
  if (m.target == null) { m.moving = false; return false; }
  const dx = m.target - m.x, step = Math.min(Math.abs(dx), staffSpeed(m) * dt);
  if (Math.abs(dx) < 0.05) { m.x = m.target; m.target = null; m.moving = false; if (m.faceX != null) { m.dir = m.faceX >= m.x ? 1 : -1; m.faceX = null; } return false; }
  m.x += Math.sign(dx) * step; m.walkT += step; m.dir = Math.sign(dx); m.moving = true; m.hold = 0; return true;
}
function hold(m, pose, dur) { m.pose = pose; m.hold = Math.max(m.hold || 0, dur); }

CP.Staff.update = function (dt) {
  const s = CP.G.shift; if (!s) return;
  if (!this.list.length) this.reset();
  const g = s.gate, night = CP.R.nightLvl || 0;
  const approaching = s.vehicles.find(v => v.row === 0 && !v.cleared && v.caseId && !s.cases[v.caseId].res && v.x > SW.marker - 9 && v.x < SW.marker - 0.5 && v.v > 0.8);
  const passing = s.vehicles.find(v => v.row === 0 && v.x > SW.gateX - 0.5 && v.x < SW.clearX + 3 && v.v > 0.5);
  const inBay = s.vehicles.find(v => v.st === 'bay' || (v.row >= 1.5 && v.x > 26 && v.x < 39));
  for (const m of this.list) {
    m.hold = Math.max(0, (m.hold || 0) - dt);
    const walking = staffStep(m, dt); if (!walking) m.hurry = false;
    if (walking) { m.pose = 'idle'; continue; }
    if (m.hold > 0) continue; // finishing a held pose
    m.pose = 'idle';
    if (m.id === 'sgt') {
      // breakdowns first: gate motor jammed → work at the cabinet; generator dead → work at the generator
      if (g.jam) { const tx = SW.gateX + 1.1; if (Math.abs(m.x - tx) > 0.2) { m.target = tx; m.hurry = true; m.faceX = SW.gateX; } else { m.dir = -1; hold(m, 'lower', 1.5); } continue; }
      if (s.equipment.generator !== 'ok') { const tx = SW.genX - 1.3; if (Math.abs(m.x - tx) > 0.2) { m.target = tx; m.hurry = true; m.faceX = SW.genX; } else { m.dir = 1; hold(m, 'radio', 1.2); } continue; }
      const atPost = Math.abs(m.x - m.home) < 0.6;
      if (approaching && atPost) { m.dir = -1; hold(m, 'stop', 0.6); continue; }
      if (passing && (g.state === 'open' || g.state === 'opening') && atPost) { m.dir = 1; hold(m, 'wave', 0.5); continue; }
      if (CP.Events.emergency() && atPost) { m.dir = -1; hold(m, 'radio', 0.8); continue; }
      if (m.bigCase) { m.bigCase = false; hold(m, 'radio', 4.5); continue; }
      m.next -= dt;
      if (m.next <= 0) {
        if (atPost) { m.target = m.wp[1 + Math.floor(Math.random() * 2)]; m.faceX = m.target > m.x ? m.target + 2 : m.target - 2; m.next = 6 + Math.random() * 6; }
        else { if (Math.random() < 0.5) hold(m, 'radio', 3 + Math.random() * 2); m.target = m.home; m.faceX = 8; m.next = 28 + Math.random() * 25; }
      } else if (atPost) m.dir = -1;
    } else {
      // bay supervisor: attend the vehicle in the bay, otherwise patrol the bay edge
      if (inBay) {
        const tx = CP.clamp(inBay.x - inBay.len * 0.55, 26.5, 37.6);
        if (Math.abs(m.x - tx) > 0.3) { m.target = tx; m.faceX = tx + 0.01; continue; }
        m.dir = 1; m.inspT = (m.inspT || 0) + dt;
        const ph = Math.floor(m.inspT / 2.6) % 3;
        hold(m, ph === 0 ? 'documents' : ph === 1 ? (night > 0.35 ? 'flashlight' : 'idle') : 'radio', 0.4);
        continue;
      }
      m.inspT = 0; m.next -= dt;
      if (m.next <= 0) { const tx = m.wp[Math.floor(Math.random() * m.wp.length)]; if (Math.abs(tx - m.x) > 0.5) { m.target = tx; m.faceX = 20; } else hold(m, 'radio', 2.5 + Math.random() * 2); m.next = 14 + Math.random() * 16; }
      else if (Math.random() < dt * 0.05) hold(m, night > 0.35 ? 'flashlight' : 'documents', 2.2);
      else m.dir = -1;
    }
  }
};

/* depth-sorted drawing through the renderer's entity list */
CP.Staff.ents = function (R, s, ents, alpha) {
  const A = CP.A, ppm = R.ppm;
  for (const m of this.list) {
    ents.push({ y: m.yup, k: 'fn', draw: () => {
      const x = CP.lerp(m.px ?? m.x, m.x, alpha); const cx = R.sx(x), gy = R.sy(m.yup);
      if (cx < -60 || cx > R.W + 60) return;
      const fr = CP.Actors.frameFor(m.char, m.pose, m.moving, m.walkT, R.t + m.animOff, !m.hurry); const sp = A.M.sprites[fr]; if (!sp) return;
      const k = m.hM * R.depthScale(m.yup) * ppm / (sp.hRef || sp.rect[3]);
      R.castShadow(fr, cx, gy, k, m.dir < 0);
      { const hh = m.hM * R.depthScale(m.yup) * ppm; (R.occluders = R.occluders || []).push({ x0: cx - 0.26 * ppm, x1: cx + 0.26 * ppm, y0: gy - hh, y1: gy, h: hh }); }
      A.drawGroundedScale(R.ctx, fr, cx, gy, k, m.dir < 0);
      if (m.pose === 'flashlight' && (R.nightLvl || 0) > 0.35) R.glows.push({ x: cx + m.dir * 0.5 * ppm, y: gy - 1.1 * ppm, r: 0.9 * ppm, c: '255,240,200', a: 0.55 });
    } });
  }
};

/* the player's officer looks at the papers while a case panel is open beside the car, and radios after a big case */
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return;
  const o = s.officer; const p = CP.UI && CP.UI.panel;
  const c = p && p.caseId && s.cases[p.caseId]; const v = c && CP.vehOfCase(c);
  const reading = !!(v && !c.res && ['dialogue', 'docs', 'verify', 'notes'].indexOf(p.kind) >= 0 && CP.Act.nearVeh(v, 2.6));
  o.basePose = reading ? 'documents' : 'idle';
  if (reading && !o.moving && !o.seq) o.dir = CP.T.windowX(v) >= o.x ? 1 : -1;
  CP.Staff.update(1 / 60);
  CP.Actors.settle(o, 1 / 60); if (s.partner) CP.Actors.settle(s.partner, 1 / 60); for (const m of CP.Staff.list) CP.Actors.settle(m, 1 / 60);
});
CP.bus.on('caseClosed', c => { const sgt = CP.Staff.list.find(m => m.id === 'sgt'); if (sgt && c.res && ['hold', 'handover', 'medical'].indexOf(c.res.decision) >= 0) sgt.bigCase = true; });
CP.bus.on('shiftStart', () => CP.Staff.reset());

/* ---------- v2.4 action rows wired to what the player does ---------- */
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c, intent) { const r = ask.apply(this, arguments); if (/docs|papers|greet/.test(String(intent))) CP.Actors.seq('officer', ['request', 'idle'], 1.1, 0); return r; }; }
{ const sz = CP.Insp.searchZone; CP.Insp.searchZone = function (c, zone) { const r = sz.apply(this, arguments); if (r !== null) CP.Actors.seq('officer', [zone === 'body' || zone === 'under' ? 'crouch' : 'reach', 'idle'], 1.6, 0); return r; }; }
CP.bus.on('caseClosed', c => { if (c.res && c.res.decision === 'citation') CP.Actors.seq('officer', ['citation', 'idle'], 2.2, 0); });
{ const sb = CP.T.sendToBay; CP.T.sendToBay = function (v) { const e = sb.apply(this, arguments); if (!e) setTimeout(() => CP.Actors.seq('officer', ['point', 'idle'], 1.3, 0), 0); return e; }; }
CP.bus.on('shiftStart', () => setTimeout(() => { if (CP.G.shift && !CP.G.shift.officer.moving) CP.Actors.seq('officer', ['salute', 'idle'], 1.4, 0); }, 900));
{ const st = CP.Events.start; CP.Events.start = function (t) { const r = st.apply(this, arguments); if (r && t === 'inspect') CP.Actors.seq('officer', ['salute', 'idle'], 1.4, 0); return r; }; }
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; const o = s.officer; if (o.moving || o.seq) return; const v = s.vehicles.find(x => x.row === 0 && !x.cleared && x.v > 8 && x.x > CP.W.marker - 14 && x.x < CP.W.marker - 5 && !x._slowed); if (v) { v._slowed = true; CP.Actors.seq('officer', ['slow', 'idle'], 0.9, 0); } });
;(window.CP_FILES = window.CP_FILES || {})['23_staff'] = '2.5.2';
