/* Renderer: fixed side camera, layered pipeline with interpolation.
   sky/background → far carriageway traffic → roads & markings → far structures → gate arm → depth-sorted vehicles/actors/props
   → lightmap (multiply) → additive glows (headlights, beacons, floods, torch) → particles → world UI markers. */
CP.R = { cv: null, ctx: null, L: null, lctx: null, parts: [], fx: [], m: null, camX: -0.5, camY: 0, zoom: 1, shakeT: 0, shakeA: 0, t: 0 };
const RW = CP.W;
/* world heights (metres above scene bottom) */
CP.R.Y = { baysideFeet: 0.32, bayNear: 0.62, bayGround: 0.95, prioGround: 2.15, lowerFar: 3.0, walkFeet: 3.48, mainNear: 3.9, mainGround: 4.3, mainFar: 5.95, bgRoad: 7.2 };
CP.R.rowY = r => { const Y = CP.R.Y; return r <= 1 ? CP.lerp(Y.mainGround, Y.prioGround, r) : CP.lerp(Y.prioGround, Y.bayGround, r - 1); };
CP.R.actorY = r => CP.lerp(CP.R.Y.walkFeet, CP.R.Y.baysideFeet, r);

CP.R.init = function (cv) {
  this.cv = cv; this.ctx = cv.getContext('2d');
  this.L = document.createElement('canvas'); this.lctx = this.L.getContext('2d');
};
CP.R.resize = function () {
  const cv = this.cv; const r = cv.parentElement.getBoundingClientRect();
  const dpr = CP.S.quality === 'low' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const W = Math.max(200, Math.floor(r.width)), H = Math.max(120, Math.floor(r.height));
  cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  this.dpr = dpr; this.W = W; this.H = H;
  const fit = Math.min(W / 38.5, H / 9.6);
  // small screens: zoom in and let the camera follow instead of shrinking vehicles to nothing
  let ppm = fit >= 24 ? fit : Math.max(fit, Math.min(H / 8.4, W / 17));
  this.basePpm = ppm; this.ppm = ppm * (this.zoom || 1); this.span = W / this.ppm;
  this.L.width = Math.ceil(W / 3); this.L.height = Math.ceil(H / 3);
};
CP.R.sx = x => (x - CP.R.camX) * CP.R.ppm;
CP.R.sy = yup => CP.R.H - (yup - CP.R.camY) * CP.R.ppm;
CP.R.toWorld = function (px, py) { return { x: px / this.ppm + this.camX, yup: (this.H - py) / this.ppm + this.camY }; };

/* camera: follows the action and zooms into the lane of the vehicle being inspected */
CP.R.focus = function () {
  const s = CP.G.shift; const o = s.officer;
  let v = null;
  if (CP.UI && CP.UI.openCase) v = CP.vehOfCase(s.cases[CP.UI.openCase]);
  if (!v) { const sv = s.selected && CP.T.get(s.selected); const c = sv && sv.caseId && s.cases[sv.caseId]; if (sv && c && !c.res && sv.x > -2) v = sv; }
  if (!v) v = s.vehicles.find(x => x.st === 'marker' || x.st === 'stopped') || null;
  const amb = s.vehicles.find(x => x.special === 'ambulance' && x.x > -4 && x.x < 40);
  if (amb && !v) v = amb;
  return v;
};
CP.R.updateCamera = function (dt) {
  const s = CP.G.shift; const mode = CP.S.camZoom || 'auto';
  const v = (this.cine && this.cine.vid && CP.T.get(this.cine.vid)) || (this.missVid && CP.T.get(this.missVid)) || this.focus();
  // zoom target: tight on the inspected vehicle's lane, wide when idle
  let zt = 1, fy = null, fx = s.officer.x;
  const fa = CP.UI && CP.UI.freeArea ? CP.UI.freeArea() : null; this.free = fa;
  if (v && mode !== 'wide') {
    const want = Math.max(v.len + 13, 20) * (mode === 'close' ? 0.78 : 1);
    zt = CP.clamp((fa ? Math.max(fa.x1 - fa.x0, this.W * 0.35) : this.W) / this.basePpm / want, 1, 2.6);
    const row = CP.lerp(v.prow ?? v.row, v.row, 1);
    fy = CP.R.rowY(row);
    fx = (CP.T.windowX(v) + s.officer.x) / 2;
    if (Math.abs(s.officer.x - CP.T.windowX(v)) > want * 0.7) fx = CP.T.windowX(v);
  }
  if (this.cine || this.missVid) zt *= 1.22;
  if (this.punchT > 0) { this.punchT -= dt; zt *= 1 + 0.06 * Math.sin(Math.min(1, this.punchT) * Math.PI); }
  this.zoom += (zt - this.zoom) * Math.min(1, dt * 2.4);
  this.ppm = this.basePpm * this.zoom; this.span = this.W / this.ppm;
  // vertical: keep the focus lane around 60% down the view; never show below the scene bottom
  let cyT = 0;
  if (fy != null && this.zoom > 1.02) cyT = Math.max(0, fy - (this.H * 0.2) / this.ppm);
  if (fy != null && fa && fa.y1 < this.H * 0.95) { const ty = fa.y1 - (fa.y1 - fa.y0) * 0.3; cyT = Math.max(-0.3 - (this.H - fa.y1) / this.ppm, fy - (this.H - ty) / this.ppm); }
  this.camY += (cyT - this.camY) * Math.min(1, dt * 2.4);
  const span = this.span;
  if (span >= 38.4) { this.camX = 19 - span / 2 - 0.1; }
  else {
    const cxs = fa ? (fa.x0 + fa.x1) / 2 / this.ppm : span * 0.5;
    const tgt = CP.clamp(fx - cxs, -0.8 - (fa ? span * 0.4 : 0), 38.6 - span + (fa ? span * 0.4 : 0));
    if (this.camFree != null) { this.camFree = CP.clamp(this.camFree, -0.8, 38.6 - span); this.camX += (this.camFree - this.camX) * Math.min(1, dt * 8); }
    else this.camX += (tgt - this.camX) * Math.min(1, dt * 3);
  }
  if (this.shakeT > 0) { this.shakeT -= dt; const a = this.shakeA * Math.max(0, this.shakeT) / 0.5; this.camX += (Math.random() - .5) * a / this.ppm; this.camY += (Math.random() - .5) * a / this.ppm; }
};
CP.R.shake = function (px, t) { if (CP.S.reducedFx) return; this.shakeA = px; this.shakeT = t || 0.5; };
CP.R.punch = function () { if (!CP.S.reducedFx) this.punchT = 1; };

/* night level 0..1 from the in-game clock (each shift crosses a sunrise or a sunset) */
CP.R.clockMins = function () { const s = CP.G.shift; return s.startMin + (s.t / s.dur) * (s.span || CP.SPAN); };
CP.R.night = function () {
  const s = CP.G.shift; let n = CP.nightAt(this.clockMins());
  if (s.equipment.generator !== 'ok') n = Math.min(1, n + 0.06 * n);
  return n;
};
/* background: supplied day/night pair cross-faded by the clock, aligned so the image's road meets ours */
CP.R.background = function (s, W, H, ppm, Y, night) {
  const A = CP.A, ctx = this.ctx, L = CP.LOCS[s.loc] || CP.LOCS.cairo, B = L.bg;
  const par = (this.camX + 0.8) * ppm * 0.22;
  const place = (im, frac, anchorY) => {
    let bh = Math.max(anchorY / frac, (W * 1.18) * im.height / im.width); const bw = bh * im.width / im.height;
    const top = anchorY - frac * bh; const left = (W - bw) / 2 - par + (W < bw ? (bw - W) * 0.1 : 0);
    return { left, top, bw, bh };
  };
  if (B.day) {
    const d = CP.Env.gradedImg(B.day, B.frac), nImg = CP.Env.gradedImg(B.night, B.frac); if (!d) { ctx.fillStyle = '#1b1c22'; ctx.fillRect(0, 0, W, H); return; }
    const g = place(d, B.frac, this.sy(Y.mainFar));
    if (night < 0.999) ctx.drawImage(d, g.left, g.top, g.bw, g.bh);
    if (nImg && night > 0.001) { ctx.globalAlpha = night; ctx.drawImage(nImg, g.left, g.top, g.bw, g.bh); ctx.globalAlpha = 1; }
    // twilight tint during sunrise/sunset
    const tw = 1 - Math.abs(night - 0.5) * 2; if (tw > 0.01) { ctx.fillStyle = `rgba(255,120,60,${0.18 * tw})`; ctx.fillRect(0, 0, W, this.sy(Y.mainFar)); }
    if (g.top + g.bh < H) { ctx.fillStyle = '#222'; ctx.fillRect(0, g.top + g.bh, W, H - g.top - g.bh); }
    return;
  }
  const bim = CP.Env.gradedImg(B.single, B.frac);
  if (!bim) { ctx.fillStyle = '#1b1c22'; ctx.fillRect(0, 0, W, H); return; }
  const g = place(bim, B.frac, this.sy(Y.bgRoad));
  ctx.drawImage(bim, g.left, g.top, g.bw, g.bh);
  // single-image scenes: grade towards daylight when the sun is up
  const day = 1 - night;
  if (day > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = s.loc === 'desert' ? `rgba(200,175,140,${0.55 * day})` : `rgba(150,160,175,${0.35 * day})`; ctx.fillRect(0, 0, W, this.sy(Y.mainFar)); ctx.restore(); }
  if (g.top + g.bh < H) { ctx.fillStyle = '#222'; ctx.fillRect(0, g.top + g.bh, W, H - g.top - g.bh); }
};

CP.R.frame = function (alpha, dt) {
  const G = CP.G; if (!G || !G.shift) return;
  const s = G.shift, ctx = this.ctx, A = CP.A, ppm = this.ppm, W = this.W, H = this.H, Y = this.Y;
  dt = Math.max(0, dt || 0); this.t += dt; this.updateCamera(dt);
  ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = CP.S.quality === 'low' ? 'low' : 'high';
  const night = this.night(); this.nightLvl = night;
  // 1. background (parallax)
  this.background(s, W, H, ppm, Y, night);
  CP.Env.back(s, ctx, W, H, ppm, Y, night);
  // 2. distant traffic on the far carriageway (smaller scale, hazed)
  if (s.far && (CP.LOCS[s.loc] || {}).far) {
    const k = 0.5, gy = this.sy(Y.bgRoad - 0.55);
    ctx.globalAlpha = 0.85;
    for (const f of s.far) { const x = CP.lerp(f.px, f.x, alpha); const L = A.M.vehicles[f.type].lengthMetres; A.drawVehicle(ctx, f.type, (x * 0.5 - L - this.camX * 0.5) * ppm, gy, ppm * k, CP.lerp(f.pw, f.w, alpha), 0, 0); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = s.loc === 'desert' ? `rgba(20,28,55,${0.35 * night})` : `rgba(120,80,60,${0.18 * night})`; ctx.fillRect(0, 0, W, this.sy(Y.mainFar));
  }
  // 3. roads and pavements (tiled from the supplied road texture)
  if (!(CP.LOCS[s.loc] || {}).bg.day) this.tile('pavement', Y.mainFar + 0.35, Y.mainFar - 0.02, 0.35);
  this.tile('road_marked', Y.mainFar, Y.mainNear, 1);
  this.tile('pavement', Y.mainNear + 0.02, Y.lowerFar - 0.02, 1);
  this.tile('road_plain', Y.lowerFar, Y.bayNear, 1);
  this.tile('pavement', Y.bayNear + 0.02, 0, 1);
  this.markings(s);
  // 4. far-side structures & props
  this.structures(s);
  // 6. depth-sorted entities
  const ents = [];
  for (const v of s.vehicles) { const row = CP.lerp(v.prow, v.row, alpha); ents.push({ y: CP.R.rowY(row), k: 'v', v, row }); }
  const o = s.officer, p = s.partner;
  ents.push({ y: CP.R.actorY(CP.lerp(o.prow ?? o.row, o.row, alpha)), k: 'a', a: o, who: 'officer' });
  ents.push({ y: CP.R.actorY(CP.lerp(p.prow ?? p.row, p.row, alpha)) + 0.01, k: 'a', a: p, who: 'partner' });
  if (s.visitor && !s.visitor.done) ents.push({ y: Y.walkFeet + 0.05, k: 'civ', id: s.visitor.civ, x: RW.visitorX + 0.5 });
  const cp = s.prioOpen ? 1 : 0; this.coneT = CP.lerp(this.coneT ?? cp, cp, Math.min(1, dt * 3));
  const cones = [[2.62, 0], [2.17, 0.12], [1.72, 0.24]];
  cones.forEach(([yy, dx], i) => { const oy = CP.lerp(yy, i === 0 ? 2.9 : i === 1 ? 1.45 : 1.3, this.coneT); const ox = RW.coneX + dx - this.coneT * (1.1 + i * 0.5); ents.push({ y: oy, k: 'prop', id: 'cone', x: ox, h: 0.72 }); });
  ents.push({ y: Y.bayNear - 0.05, k: 'prop', id: 'cone', x: 24.6, h: 0.72 }); ents.push({ y: Y.bayNear - 0.05, k: 'prop', id: 'cone', x: 38.1, h: 0.72 });
  ents.push({ y: 0.2, k: 'prop', id: 'concrete_barrier', x: 6.5, h: 0.82 }); ents.push({ y: 0.2, k: 'prop', id: 'concrete_barrier', x: 9.2, h: 0.82 });
  ents.push({ y: Y.mainFar + 0.12, k: 'gate' }); // far side of the road, behind the lane
  ents.sort((a, b) => b.y - a.y);
  this.hits = [];
  for (const e of ents) {
    if (e.k === 'v') this.drawVeh(e.v, e.row, alpha, s);
    else if (e.k === 'a') this.drawActor(e.a, e.who, alpha);
    else if (e.k === 'prop') { const r = A.rect(e.id); const h = e.h * ppm; this.shadow(this.sx(e.x), this.sy(e.y), h * r[2] / r[3] * 0.55, h * 0.12, .35); A.groundedH(ctx, e.id, this.sx(e.x), this.sy(e.y), h); }
    else if (e.k === 'gate') this.gateFront(s);
    else if (e.k === 'civ') { this.shadow(this.sx(e.x), this.sy(e.y), 0.35 * ppm, 0.08 * ppm, .4); A.groundedH(ctx, e.id, this.sx(e.x), this.sy(e.y), 1.72 * ppm); }
  }
  // 7. lighting
  this.lighting(s, night, alpha);
  // 8. particles
  this.particles(s, dt, alpha);
  CP.Env.front(s, ctx, W, H, ppm, Y, night, dt);
  // 9. world UI
  this.worldUI(s, alpha);
};

CP.R.tile = function (id, yTopUp, yBotUp, vfrac) {
  const ctx = this.ctx, A = CP.A; const r = A.rect(id); const im = A.img[A.M.sprites[id].sheet]; if (!im) return;
  const y0 = this.sy(yTopUp), y1 = this.sy(yBotUp); const h = y1 - y0; if (h <= 0) return;
  const sh = r[3] * (vfrac || 1); const tw = r[2] * (h / sh);
  const off = -((this.camX * this.ppm) % tw) - tw;
  for (let x = off; x < this.W + tw; x += tw) ctx.drawImage(im, r[0], r[1] + r[3] - sh, r[2], sh, Math.floor(x), y0, Math.ceil(tw) + 1, h);
};

CP.R.markings = function (s) {
  const ctx = this.ctx, Y = this.Y, ppm = this.ppm;
  // stop marker line
  const mx = this.sx(RW.marker + 0.15);
  ctx.fillStyle = 'rgba(240,236,225,.85)';
  ctx.beginPath(); ctx.moveTo(mx, this.sy(Y.mainFar - 0.1)); ctx.lineTo(mx + 0.25 * ppm, this.sy(Y.mainFar - 0.1)); ctx.lineTo(mx + 0.12 * ppm, this.sy(Y.mainNear + 0.05)); ctx.lineTo(mx - 0.13 * ppm, this.sy(Y.mainNear + 0.05)); ctx.fill();
  ctx.save(); ctx.font = `700 ${Math.max(9, 0.42 * ppm)}px ${CP.UI ? CP.UI.font() : 'sans-serif'}`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(240,236,225,.55)';
  ctx.fillText(CP.lang === 'ar' ? 'قف' : 'STOP', this.sx(RW.marker - 1.4), this.sy(Y.mainNear + 0.55));
  // bay and priority markings
  ctx.fillStyle = 'rgba(240,184,64,.5)'; ctx.font = `700 ${Math.max(8, 0.34 * ppm)}px ${CP.UI ? CP.UI.font() : 'sans-serif'}`;
  ctx.fillText(CP.lang === 'ar' ? 'حارة طوارئ ←' : 'PRIORITY LANE →', this.sx(6), this.sy(Y.prioGround - 0.18));
  ctx.fillText(CP.lang === 'ar' ? 'منطقة التفتيش' : 'INSPECTION BAY', this.sx(33), this.sy(1.3));
  ctx.restore();
  // dashed separator between priority and bay rows
  ctx.strokeStyle = 'rgba(240,236,225,.35)'; ctx.lineWidth = Math.max(1, 0.05 * ppm); ctx.setLineDash([0.9 * ppm, 0.8 * ppm]);
  ctx.beginPath(); ctx.moveTo(0, this.sy(1.55)); ctx.lineTo(this.W, this.sy(1.55)); ctx.stroke(); ctx.setLineDash([]);
  // bay boxes
  const slots = CP.G.career.upgrades.bay >= 1 ? [RW.bayA, RW.bayB] : [RW.bayA];
  ctx.strokeStyle = 'rgba(240,184,64,.6)'; ctx.lineWidth = Math.max(1.5, 0.07 * ppm);
  for (const sx of slots) { const x0 = this.sx(sx - 7.1), x1 = this.sx(sx + 0.15); const y0 = this.sy(1.45), y1 = this.sy(Y.bayNear + 0.1); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); }
  // rumble strip
  ctx.fillStyle = 'rgba(240,236,225,.18)';
  for (let i = 0; i < 4; i++) ctx.fillRect(this.sx(10.3 + i * 0.13), this.sy(Y.mainFar - 0.1), 0.06 * ppm, (Y.mainFar - Y.mainNear - 0.2) * ppm);
};

CP.R.shadow = function (cx, y, rx, ry, a) {
  const ctx = this.ctx; a *= 1.15 - 0.3 * (this.nightLvl || 0); ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(cx, y, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
};

CP.R.structures = function (s) {
  const A = CP.A, ctx = this.ctx, ppm = this.ppm, Y = this.Y; const base = this.sy(Y.mainFar + 0.12);
  const put = (id, x, h) => A.groundedH(ctx, id, this.sx(x), base, h * ppm);
  put('concrete_barrier', 1.5, 0.8); put('concrete_barrier', 3.4, 0.8);
  put('floodlight', 8.4, 4.2);
  put('canopy', 13.9, 4.1);
  put('blank_sign', 15.2, 1.9);
  // sign text drawn on the blank sign surface (fictional)
  { const r = A.rect('blank_sign'); const h = 1.9 * ppm; const w = h * r[2] / r[3]; const x = this.sx(15.2) - w / 2; ctx.save(); ctx.fillStyle = '#1d1f27'; ctx.font = `800 ${Math.max(7, h * 0.13)}px ${CP.UI ? CP.UI.font() : 'sans-serif'}`; ctx.textAlign = 'center'; ctx.fillText('قف', x + w / 2, base - h * 0.84); ctx.font = `800 ${Math.max(6, h * 0.1)}px sans-serif`; ctx.fillText('STOP', x + w / 2, base - h * 0.73); ctx.restore(); }
  put('booth', RW.boothX, 2.75);
  put('sandbags', 20.7, 0.75); put('extinguisher', 25.25, 0.62); put('chair', 26.0, 0.9); put('bench', 27.4, 0.95); put('bin', 28.6, 0.8);
  put('generator', RW.genX, 1.55);
  put('floodlight', 35.2, 4.2);
  // generator status lamp
  const gok = s.equipment.generator === 'ok';
  ctx.fillStyle = gok ? '#58d27a' : (Math.sin(this.t * 6) > 0 ? '#ff5a4a' : '#6a1d18');
  ctx.beginPath(); ctx.arc(this.sx(RW.genX + 0.55), base - 1.1 * ppm, Math.max(2, 0.07 * ppm), 0, 7); ctx.fill();
};

/* boom barrier on the far side of the lane (user-supplied 5-frame art, closed → open), cross-faded by arm angle */
CP.R.gateFront = function (s) {
  const A = CP.A, ctx = this.ctx, ppm = this.ppm, g = s.gate;
  const x = this.sx(RW.gateX + 0.15), y = this.sy(this.Y.mainFar + 0.12);
  const NF = (CP.A.M.gateFrames || 5) - 1; const H = 3.3 * ppm; const f = CP.clamp(g.ang, 0, 1) * NF; const i0 = Math.floor(f), fr = f - i0;
  this.shadow(x - 0.1 * ppm, y, 0.75 * ppm, 0.12 * ppm, .45);
  const drawF = (i, a) => { if (i > NF || a <= 0.01) return; const id = 'gate_f' + i; const r = A.rect(id); const an = A.M.sprites[id].anchor; const k = H / r[3]; ctx.globalAlpha = a; ctx.drawImage(A.img.gate_barrier, r[0], r[1], r[2], r[3], x - an[0] * r[2] * k, y - an[1] * r[3] * k, r[2] * k, r[3] * k); ctx.globalAlpha = 1; };
  if (A.img.gate_barrier) { drawF(i0, 1); drawF(i0 + 1, fr); }
  // status lamp on the cabinet: red closed / green open / amber moving / flashing when jammed
  const lx = x - 0.03 * ppm, ly = y - 1.3 * ppm;
  const col = g.jam ? (Math.sin(this.t * 8) > 0 ? '255,160,20' : '80,40,0') : g.state === 'open' ? '60,255,120' : g.state === 'closed' ? '255,60,50' : '255,190,40';
  const gr = ctx.createRadialGradient(lx, ly, 0, lx, ly, 0.35 * ppm); gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = gr; ctx.fillRect(lx - 0.35 * ppm, ly - 0.35 * ppm, 0.7 * ppm, 0.7 * ppm);
  this.glows.push({ x: lx, y: ly, r: 0.35 * ppm, c: col, a: 0.8 });
  if ((g.state === 'opening' || g.state === 'closing') && Math.random() < 0.3) this.emit('spark', x - 0.05 * ppm, y - 0.9 * ppm);
};

CP.R.drawVeh = function (v, row, alpha, s) {
  const A = CP.A, ctx = this.ctx, ppm = this.ppm;
  const x = CP.lerp(v.px, v.x, alpha); const L = v.len;
  const left = this.sx(x - L), ground = this.sy(CP.R.rowY(row));
  if (left > this.W + 20 || left + L * ppm < -20) return;
  const g = A.vgeom(v.type, ppm);
  { const sh = CP.Env.shadowShift(x - L / 2) * ppm; this.shadow(left + L * ppm / 2 + sh * 0.6, ground + 0.02 * ppm, L * ppm * 0.5 + Math.abs(sh) * 0.5, 0.2 * ppm, .45); this.shadow(left + L * ppm / 2, ground + 0.01 * ppm, L * ppm * 0.42, 0.08 * ppm, .35); }
  const idle = 0; // no idle engine shake
  const shake = v.stallKind === 'overheat' ? Math.sin(this.t * 25) * 0.01 * ppm : 0;
  A.drawVehicle(ctx, v.type, left, ground, ppm, CP.lerp(v.pwheel, v.wheel, alpha), v.pitch, v.heave * ppm + idle + shake);
  const top = ground - g.bodyBottom;
  v._scr = { left, top, w: g.width, h: g.bodyBottom, ground };
  this.hits.push({ id: v.id, x0: left, x1: left + g.width, y0: top, y1: ground });
  (this.occluders = this.occluders || []).push({ x0: left, x1: left + g.width, y0: top, y1: ground, h: g.bodyBottom });
  // brake lights (rear = left side)
  if (v.brake && this.nightLvl > 0.25) this.glows.push({ x: left + g.width * 0.015, y: top + g.height * 0.5, r: 0.45 * ppm, c: '255,40,30', a: 0.55 });
  if (this.nightLvl > 0.3) { this.glows.push({ x: left + g.width * 0.985, y: top + g.height * 0.6, r: 0.35 * ppm, c: '255,240,200', a: 0.7 }); this.cones.push({ x: left + g.width * 0.985, y: top + g.height * 0.6, len: 7 * ppm, dir: 1, gy: ground }); }
  if (v.beacon) {
    const ph = CP.S.reducedFlash ? Math.sin(this.t * 2) : Math.sin(this.t * 9);
    const bx = left + g.width * (v.type === 'ambulance' ? 0.78 : 0.45), by = top + g.height * 0.04;
    this.glows.push({ x: bx - 0.3 * ppm, y: by, r: 1.2 * ppm, c: '60,120,255', a: ph > 0 ? 0.8 : 0.15, big: true });
    this.glows.push({ x: bx + 0.3 * ppm, y: by, r: 1.2 * ppm, c: '255,50,50', a: ph > 0 ? 0.15 : 0.8, big: true });
  }
  // particles emitters
  if (v.stallKind === 'overheat' && Math.random() < 0.5) this.emit('steam', left + g.width * 0.86, top + g.height * 0.2);
  if (v.a > 0.4 && v.v < 5 && Math.random() < 0.25) this.emit('exhaust', left - 2, ground - 0.35 * ppm);
};

CP.R.drawActor = function (a, who, alpha) {
  const A = CP.A, ctx = this.ctx, ppm = this.ppm;
  const x = CP.lerp(a.px ?? a.x, a.x, alpha); const row = CP.lerp(a.prow ?? a.row, a.row, alpha);
  const cx = this.sx(x), gy = this.sy(CP.R.actorY(row));
  let fr = CP.Actors.frameOf(a); if (!A.M.sprites[fr]) { if (!this._warned) { this._warned = 1; console.warn('missing frame', fr); } fr = 'ofi_00'; } const r = A.rect(fr);
  const hM = who === 'partner' ? 1.76 : 1.8; const k = hM * ppm / (A.M.sprites[fr].hRef || r[3]);
  this.shadow(cx, gy, 0.32 * ppm, 0.07 * ppm, .45);
  (this.occluders = this.occluders || []).push({ x0: cx - 0.28 * ppm, x1: cx + 0.28 * ppm, y0: gy - hM * ppm, y1: gy, h: hM * ppm });
  A.drawGroundedScale(ctx, fr, cx, gy, k, a.dir < 0);
  if (who === 'officer') { this.hitsOfficer = { x: cx, y: gy }; if (a.pose === 'flashlight' || (a.torchT > 0)) { this.torch = { x: cx + a.dir * 0.45 * ppm, y: gy - 1.15 * ppm, dir: a.dir }; } }
  if (who === 'partner') this.partnerScr = { x: cx, y: gy - hM * ppm };
  else this.officerScr = { x: cx, y: gy - hM * ppm };
};

/* lightmap: ambient colour multiplied, with light pools cut in */
/* Lighting: ambient grade + area/spot lights rendered into a lightmap, with hard-edged
   shadow volumes cast by vehicles and people (area lights are sampled 3× for soft edges). */
CP.R.glows = []; CP.R.cones = []; CP.R.occluders = [];
CP.R.lighting = function (s, night, alpha) {
  const ctx = this.ctx, L = this.L, l = this.lctx, W = this.W, H = this.H, ppm = this.ppm, Y = this.Y;
  const sc = L.width / W;
  if (!this.L2 || this.L2.width !== L.width || this.L2.height !== L.height) { this.L2 = document.createElement('canvas'); this.L2.width = L.width; this.L2.height = L.height; this.l2 = this.L2.getContext('2d'); }
  const L2 = this.L2, l2 = this.l2;
  const dust = s.events.dustUntil > s.t;
  const dayC = [255, 250, 242], warm = [255, 188, 150], cool = CP.locBase(s.loc) === 'desert' ? [58, 70, 112] : [72, 82, 126];
  const amb = night < 0.5 ? dayC.map((w, i) => Math.round(CP.lerp(w, warm[i], night * 2))) : warm.map((w, i) => Math.round(CP.lerp(w, cool[i], (night - 0.5) * 2)));
  l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over';
  l.fillStyle = `rgb(${amb[0]},${amb[1]},${amb[2]})`; l.fillRect(0, 0, L.width, L.height);
  if ((CP.LOCS[s.loc] || {}).bg.day) { const bl = amb.map(c => Math.round(CP.lerp(c, 255, 0.82))); l.fillStyle = `rgb(${bl[0]},${bl[1]},${bl[2]})`; l.fillRect(0, 0, L.width, Math.max(0, this.sy(Y.mainFar + 0.5)) * sc); }
  l.globalCompositeOperation = 'lighter';

  const genOk = s.equipment.generator === 'ok'; const up = CP.G.career.upgrades.lighting;
  const fl = genOk ? (0.55 + up * 0.18) * night : 0;
  const lights = [];
  // area lights: each floodlight head is sampled three times so its shadows have soft edges
  if (fl > 0.02) for (const fx of [8.4, 35.2]) for (let i = -1; i <= 1; i++)
    lights.push({ x: this.sx(fx + 0.1 + i * 0.85), y: this.sy(Y.mainFar + 4.1), r: 9.5 * ppm, ry: 5.2 * ppm, c: '255,236,190', a: fl / 3, shadow: 0.8 });
  if (fl > 0.02) for (let i = -1; i <= 1; i++) lights.push({ x: this.sx(13.9 + i * 1.6), y: this.sy(Y.mainFar + 2.6), r: 5.4 * ppm, ry: 3.4 * ppm, c: '255,240,210', a: fl * 0.28, shadow: 0.55 });
  // booth window (small area light) and the gate lamp
  lights.push({ x: this.sx(RW.boothX - 0.6), y: this.sy(Y.mainFar + 1.5), r: 1.9 * ppm, ry: 1.4 * ppm, c: '255,220,150', a: 0.6 * night, shadow: 0.35 });
  const gcol = s.gate.jam ? '255,170,40' : s.gate.state === 'open' ? '90,255,140' : s.gate.state === 'closed' ? '255,70,60' : '255,190,50';
  lights.push({ x: this.sx(RW.gateX + 0.12), y: this.sy(Y.mainFar + 1.3), r: 1.5 * ppm, ry: 1.1 * ppm, c: gcol, a: 0.5 * night, shadow: 0 });
  for (const g0 of this.glows) lights.push({ x: g0.x, y: g0.y, r: g0.r * (g0.big ? 3 : 1.6), ry: g0.r * (g0.big ? 2.2 : 1.2), c: g0.c, a: g0.a * night, shadow: 0 });

  const occ = this.occluders || [];
  const shadowQuad = (c2, o, lx, ly, strength) => {
    // project the occluder silhouette away from the light onto its own ground line
    const yb = o.y1; if (!isFinite(yb) || !isFinite(lx) || !isFinite(ly) || !isFinite(o.x0) || !isFinite(o.x1) || ly >= yb - 2) return;
    const t = (yb - ly) / Math.max(6, (o.y0 - ly));
    const p0 = lx + (o.x0 - lx) * t, p1 = lx + (o.x1 - lx) * t;
    const far = Math.max(Math.abs(p0 - o.x0), Math.abs(p1 - o.x1));
    if (!isFinite(p0) || !isFinite(p1) || !isFinite(far)) return;
    const dir = (p0 + p1) / 2 > (o.x0 + o.x1) / 2 ? 1 : -1;
    const g = c2.createLinearGradient((o.x0 + o.x1) / 2 * sc, 0, ((o.x0 + o.x1) / 2 + dir * Math.max(30, far * 1.4)) * sc, 0);
    g.addColorStop(0, `rgba(0,0,0,${strength})`); g.addColorStop(0.65, `rgba(0,0,0,${strength * 0.5})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    c2.fillStyle = g; c2.beginPath();
    c2.moveTo(o.x0 * sc, (yb - 1) * sc); c2.lineTo(o.x1 * sc, (yb - 1) * sc);
    c2.lineTo(p1 * sc, (yb + o.h * 0.28) * sc); c2.lineTo(p0 * sc, (yb + o.h * 0.28) * sc); c2.closePath(); c2.fill();
  };
  const shadowsOn = CP.S.quality !== 'low' && !CP.S.reducedFx;
  for (const li of lights) {
    if (!(li.a > 0.01) || !isFinite(li.x) || !isFinite(li.y) || !isFinite(li.r) || li.r <= 0) continue;
    const cast = shadowsOn && li.shadow > 0 && occ.length;
    const c2 = cast ? l2 : l;
    if (cast) { l2.setTransform(1, 0, 0, 1, 0, 0); l2.globalCompositeOperation = 'source-over'; l2.clearRect(0, 0, L2.width, L2.height); }
    c2.save(); c2.translate(li.x * sc, li.y * sc); c2.scale(1, (li.ry || li.r) / li.r);
    const g = c2.createRadialGradient(0, 0, 0, 0, 0, li.r * sc);
    g.addColorStop(0, `rgba(${li.c},${li.a})`); g.addColorStop(0.55, `rgba(${li.c},${li.a * 0.45})`); g.addColorStop(1, `rgba(${li.c},0)`);
    c2.fillStyle = g; c2.fillRect(-li.r * sc, -li.r * sc, li.r * 2 * sc, li.r * 2 * sc); c2.restore();
    if (cast) {
      l2.globalCompositeOperation = 'destination-out';
      for (const o of occ) shadowQuad(l2, o, li.x, li.y, li.shadow);
      l2.globalCompositeOperation = 'source-over';
      l.drawImage(L2, 0, 0);
    }
  }
  // spot lights: headlight cones and the officer's torch, occluded by whatever is in front
  const spot = (c2, sp) => {
    if (!isFinite(sp.x) || !isFinite(sp.y) || !isFinite(sp.len) || sp.len <= 0) return;
    c2.save(); c2.translate(sp.x * sc, sp.y * sc); c2.scale(sp.dir, 1);
    const g = c2.createLinearGradient(0, 0, sp.len * sc, 0);
    g.addColorStop(0, `rgba(${sp.c},${sp.a})`); g.addColorStop(0.5, `rgba(${sp.c},${sp.a * 0.5})`); g.addColorStop(1, `rgba(${sp.c},0)`);
    c2.fillStyle = g; c2.beginPath(); c2.moveTo(0, -2 * sc); c2.lineTo(sp.len * sc, -sp.spread * sc); c2.lineTo(sp.len * sc, sp.spread * 1.25 * sc); c2.lineTo(0, 2 * sc); c2.fill(); c2.restore();
  };
  for (const c of this.cones) {
    const sp = { x: c.x, y: c.y, dir: c.dir || 1, len: c.len, spread: 0.9 * ppm, c: '255,240,200', a: 0.55 * night };
    if (shadowsOn && occ.length) {
      l2.setTransform(1, 0, 0, 1, 0, 0); l2.globalCompositeOperation = 'source-over'; l2.clearRect(0, 0, L2.width, L2.height);
      spot(l2, sp); l2.globalCompositeOperation = 'destination-out';
      for (const o of occ) { if (Math.abs((o.x0 + o.x1) / 2 - c.x) < 6) continue; shadowQuad(l2, o, c.x, c.y, 0.75); }
      l2.globalCompositeOperation = 'source-over'; l.drawImage(L2, 0, 0);
    } else spot(l, sp);
  }
  if (this.torch) { const t = this.torch; spot(l, { x: t.x, y: t.y, dir: t.dir, len: 4 * ppm, spread: 1.1 * ppm, c: '255,250,225', a: 0.95 }); }

  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true; ctx.drawImage(L, 0, 0, W, H); ctx.restore();
  // bloom-ish additive glows on top
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (night > 0.25 && CP.S.quality !== 'low') for (const c of this.cones) { if (c.gy == null) continue; const rx = 2.4 * ppm, x = c.x + 2.2 * ppm, y = c.gy + 0.12 * ppm; const g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(255,230,180,${0.22 * night})`); g.addColorStop(1, 'rgba(255,230,180,0)'); ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.16); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2); ctx.restore(); }
  for (const g0 of this.glows) { const rr = g0.r * (g0.big ? 1.1 : 0.6); const g = ctx.createRadialGradient(g0.x, g0.y, 0, g0.x, g0.y, rr); g.addColorStop(0, `rgba(${g0.c},${g0.a * (0.35 + night * 0.6)})`); g.addColorStop(1, `rgba(${g0.c},0)`); ctx.fillStyle = g; ctx.fillRect(g0.x - rr, g0.y - rr, rr * 2, rr * 2); }
  if (fl > 0) for (const fx of [8.4, 35.2]) { const x = this.sx(fx - 0.1), y = this.sy(Y.mainFar + 0.12 + 4.0); const g = ctx.createRadialGradient(x, y, 0, x, y, 0.9 * ppm); g.addColorStop(0, `rgba(255,245,215,${0.6 * night})`); g.addColorStop(1, 'rgba(255,245,215,0)'); ctx.fillStyle = g; ctx.fillRect(x - ppm, y - ppm, 2 * ppm, 2 * ppm); }
  ctx.restore();
  if (dust) { ctx.fillStyle = `rgba(170,140,100,${0.28 + 0.06 * Math.sin(this.t * 0.7)})`; ctx.fillRect(0, 0, W, H); }
  this.glows = []; this.cones = []; this.torch = null; this.occluders = [];
};

CP.R.emit = function (kind, x, y) {
  if (CP.S.reducedFx && Math.random() < 0.7) return;
  if (this.parts.length > (CP.S.quality === 'low' ? 80 : 260)) return;
  const p = { kind, x, y, vx: 0, vy: 0, life: 0, max: 1.5, r: 3 };
  if (kind === 'steam') { p.vx = (Math.random() - 0.5) * 10; p.vy = -25 - Math.random() * 20; p.max = 1.6; p.r = 0.12 * this.ppm; }
  if (kind === 'exhaust') { p.vx = -12 - Math.random() * 8; p.vy = -4; p.max = 1.1; p.r = 0.08 * this.ppm; }
  if (kind === 'spark') { p.vx = (Math.random() - 0.5) * 60; p.vy = -40 - Math.random() * 40; p.max = 0.45; p.r = 1.5; }
  if (kind === 'confetti') { p.vx = (Math.random() - 0.5) * 260; p.vy = -180 - Math.random() * 160; p.max = 2.2; p.r = 3 + Math.random() * 3; p.hue = Math.floor(Math.random() * 360); p.g = 260; }
  if (kind === 'dust') { p.vx = 30 + Math.random() * 60; p.vy = (Math.random() - 0.5) * 8; p.max = 3; p.r = 1 + Math.random() * 2.2; }
  this.parts.push(p);
};
CP.R.particles = function (s, dt) {
  const ctx = this.ctx;
  if ((s.events.dustUntil > s.t || s.loc === 'desert') && Math.random() < (s.events.dustUntil > s.t ? 0.9 : 0.12)) this.emit('dust', -10, Math.random() * this.H);
  for (const p of this.parts) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; if (p.kind === 'spark') p.vy += 200 * dt; else if (p.kind !== 'dust' && p.kind !== 'confetti') p.r += dt * 6; }
  this.parts = this.parts.filter(p => p.life < p.max && p.x < this.W + 20 && p.y < this.H + 40);
  for (const p of this.parts) {
    const a = 1 - p.life / p.max;
    if (p.kind === 'confetti') { ctx.fillStyle = `hsla(${p.hue},90%,60%,${a})`; ctx.fillRect(p.x, p.y, p.r, p.r * 1.6); continue; }
    if (p.kind === 'spark') { ctx.fillStyle = `rgba(255,${200 + Math.floor(55 * a)},120,${a})`; ctx.fillRect(p.x, p.y, 2, 2); continue; }
    ctx.fillStyle = p.kind === 'dust' ? `rgba(200,170,120,${0.5 * a})` : p.kind === 'steam' ? `rgba(235,235,240,${0.45 * a})` : `rgba(90,90,95,${0.35 * a})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }
};

/* selection brackets, chips and progress rings drawn in screen space */
CP.R.worldUI = function (s, alpha) {
  const ctx = this.ctx, ppm = this.ppm; const font = CP.UI ? CP.UI.font() : 'sans-serif';
  const chip = (x, y, text, bg, fg) => {
    ctx.font = `700 ${Math.max(10, Math.min(15, 0.3 * ppm))}px ${font}`; const w = ctx.measureText(text).width + 12, h = Math.max(16, Math.min(22, 0.42 * ppm));
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h, w, h, 5) : ctx.rect(x - w / 2, y - h, w, h); ctx.fill();
    ctx.fillStyle = fg || '#16171c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y - h / 2 + 1);
  };
  for (const v of s.vehicles) {
    const sc = v._scr; if (!sc) continue;
    const c = v.caseId ? s.cases[v.caseId] : null;
    const sel = s.selected === v.id;
    if (sel) {
      ctx.strokeStyle = '#f0b840'; ctx.lineWidth = 2.5; const pad = 4, L = Math.min(22, sc.w * 0.15);
      const x0 = sc.left - pad, x1 = sc.left + sc.w + pad, y0 = sc.top - pad, y1 = sc.ground + pad;
      ctx.beginPath(); ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0); ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L); ctx.moveTo(x0, y1 - L); ctx.lineTo(x0, y1); ctx.lineTo(x0 + L, y1); ctx.moveTo(x1 - L, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - L); ctx.stroke();
    }
    const cx = sc.left + sc.w / 2; let cy = sc.top - 6;
    if (v.special === 'wedding') { chip(cx, cy, '♪ ' + CP.t('ev_wedLabel'), '#e8c9e6'); cy -= 24; }
    if (v.special === 'ambulance' || v.special === 'pickup') continue;
    if (c && v.st === 'marker' && !c.res) { const pulse = 0.6 + 0.4 * Math.sin(this.t * 4); chip(cx, cy, (sel ? '▼ ' : '') + CP.t('st_marker'), `rgba(240,184,64,${pulse})`); }
    else if (c && sel && !c.res) chip(cx, cy, c.id, '#f0b840');
    if (v.stallKind === 'overheat') chip(cx, cy - 26, '♨', '#ffd6c2');
    if (v.leaving) chip(cx, cy - 26, '⚠', '#ff8a70');
    if (c && c.res && v.st === 'held') chip(cx, cy, CP.t('st_held'), '#9fb4ff');
  }
  // officer / partner task progress rings
  const ring = (pos, task) => {
    if (!pos || !task) return; const pr = CP.Tasks.progress(task); const r = Math.max(9, 0.28 * ppm); const x = pos.x, y = pos.y - r - 6;
    ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = task.paused ? '#ff9a6a' : '#f0b840'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + pr * Math.PI * 2); ctx.stroke();
    if (task.dur < 1e8) { ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.max(9, r * 0.8)}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(task.paused ? '❚❚' : CP.num(Math.ceil(CP.Tasks.remaining(task))), x, y + 1); }
  };
  ring(this.officerScr, CP.Tasks.find(t => t.owner === 'officer' || (t.owner === 'radio' && t.data && !t.data.byPartner)));
  const pt = CP.Actors.partnerTask(); if (pt) ring(this.partnerScr, pt);
  if (this.partnerScr && CP.S.textSize !== 'small') { ctx.font = `600 ${Math.max(9, 0.22 * ppm)}px ${font}`; ctx.fillStyle = 'rgba(245,240,230,.75)'; ctx.textAlign = 'center'; ctx.fillText(CP.t('h_partner'), this.partnerScr.x, this.partnerScr.y - (pt ? 0.8 * ppm : 6)); }
  // walk target marker
  const o = s.officer; if (o.target) { const x = this.sx(o.target.x), y = this.sy(CP.R.actorY(o.target.row || 0)); ctx.strokeStyle = 'rgba(240,184,64,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 0.3 * ppm, 0.08 * ppm, 0, 0, 7); ctx.stroke(); }
  // speech bubble: the driver's latest reply is shown above the car (handy on phones where the log sits lower in the sheet)
  if (CP.UI && CP.UI.panel && CP.UI.panel.kind === 'dialogue' && CP.UI.isMob) {
    const c = s.cases[CP.UI.panel.caseId]; const v = c && CP.vehOfCase(c); const L = c && c.dlg.log[c.dlg.log.length - 1];
    if (v && v._scr && L && L.who !== 'officer') {
      const txt = CP.L(L.text); ctx.save(); ctx.font = `600 ${Math.max(12, Math.min(15, 0.32 * ppm))}px ${font}`;
      const maxW = Math.min(this.W * 0.8, 300); const words = txt.split(' '); const lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur);
      const lh = 18, bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width))) + 20, bh = lines.length * lh + 12;
      const cx = CP.clamp(v._scr.left + v._scr.w * 0.6, bw / 2 + 6, this.W - bw / 2 - 6), by = Math.max(bh + 6, v._scr.top - 28);
      ctx.fillStyle = 'rgba(245,240,230,.96)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - bw / 2, by - bh, bw, bh, 10) : ctx.rect(cx - bw / 2, by - bh, bw, bh); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 6, by); ctx.lineTo(cx + 6, by); ctx.lineTo(cx, by + 8); ctx.fill();
      ctx.fillStyle = '#1b1c22'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, cx, by - bh + 6 + lh / 2 + i * lh));
      ctx.restore();
    }
  }
  // floating feedback: +XP popups, decision stamps
  const now = this.t;
  this.fx = this.fx.filter(f => now - f.t0 < f.dur);
  for (const f of this.fx) {
    const p = (now - f.t0) / f.dur;
    if (f.kind === 'xp') {
      const x = f.x != null ? this.sx(f.x) : this.W / 2, y = (f.yup != null ? this.sy(f.yup) : this.H * 0.4) - p * 60;
      ctx.save(); ctx.globalAlpha = p < 0.8 ? 1 : (1 - p) / 0.2; ctx.font = `900 ${Math.round(18 + 8 * (1 - p))}px ${font}`; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(f.text, x, y); ctx.fillStyle = f.color || '#ffd35a'; ctx.fillText(f.text, x, y); ctx.restore();
    } else if (f.kind === 'stamp') {
      const x = f.x != null ? this.sx(f.x) : this.W / 2, y = f.yup != null ? this.sy(f.yup) : this.H * 0.4;
      const sc = p < 0.12 ? 2.2 - 1.2 * (p / 0.12) : 1; const a = p > 0.75 ? (1 - p) / 0.25 : 1;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.14); ctx.scale(sc, sc); ctx.globalAlpha = a * 0.92;
      ctx.font = `900 ${Math.max(18, 0.62 * ppm)}px ${font}`; const w = ctx.measureText(f.text).width + 26, hh = Math.max(34, 0.95 * ppm);
      ctx.strokeStyle = f.color; ctx.lineWidth = 4; ctx.strokeRect(-w / 2, -hh / 2, w, hh); ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 5, -hh / 2 + 5, w - 10, hh - 10);
      ctx.fillStyle = f.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2); ctx.restore();
    }
  }
  // emergency vignette
  if (CP.Events.emergency() && !CP.S.reducedFlash) { const a = 0.18 + 0.1 * Math.sin(this.t * 4); const g = ctx.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.35, this.W / 2, this.H / 2, this.W * 0.7); g.addColorStop(0, 'rgba(200,20,20,0)'); g.addColorStop(1, `rgba(200,20,20,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, this.W, this.H); }
  // gate interlock message
  if (s.gate.sensorMsgT > 0) chip(this.sx(RW.gateX + 1.6), this.sy(this.Y.mainFar + 2.2), CP.t('g_sensorBlock'), '#ffb020');
};

/* hit testing for clicks/taps */
CP.R.pick = function (px, py) {
  const hits = (this.hits || []).filter(h => px >= h.x0 && px <= h.x1 && py >= h.y0 - 10 && py <= h.y1 + 6);
  if (hits.length) return { veh: hits[hits.length - 1].id };
  const w = this.toWorld(px, py);
  return { ground: { x: w.x, row: w.yup < 1.7 ? 1 : 0 } };
};

CP.R.popup = function (text, x, yup, color) { this.fx.push({ kind: 'xp', text, x, yup, color, t0: this.t, dur: 1.6 }); };
CP.R.stamp = function (text, color, x, yup) { this.fx.push({ kind: 'stamp', text, color, x, yup, t0: this.t, dur: 1.8 }); };
CP.R.confetti = function (n, x, y) { for (let i = 0; i < (n || 60); i++) { this.emit('confetti', x ?? this.W / 2, y ?? this.H * 0.35); } };
;(window.CP_FILES = window.CP_FILES || {})['14_render'] = '1.4.1';
