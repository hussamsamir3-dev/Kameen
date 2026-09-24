/* World (v2.1)
   - Nine new civilian vehicles (hatchback, sedan, SUV, double-cab pickup, tuk-tuk, delivery bike, motorbike, panel van, box truck)
     registered with the same physics/wheel rules as the originals (body + rotating wheel cut from the body at the axle).
   - Pedestrians: 25 distinct people from your sheets. They walk the far pavement and the near walkway, never duplicate on
     screen, keep spacing, pause for officers, stop and look when a siren or wanted car arrives, drift off at the edges.
     8-frame stride tied to distance travelled (no foot sliding), cast shadows, night torch reactions.
   - Painted-street mode: the road texture tiles are replaced by a procedural asphalt band tinted from the backdrop, so the
     street reads as part of the painting. Toggle in the menu's "More" (falls back to the textures instantly).
   - Search complications: frisk (body) and underbody zones; drivers may refuse a search — get dispatch authorisation over
     the radio, insist with a valid reason, or back off; forcing it without grounds costs trust and draws a complaint. */
CP.addStrings({
  wd_walk: ['مشاة', 'Pedestrians'], wd_street: ['شارع مرسوم (بدون تكستشر)', 'Painted street (no road textures)'],
  z_body: ['تفتيش ذاتي', 'Frisk'], z_under: ['تحت العربية', 'Underbody'],
  wd_refuse: ['السواق رافض التفتيش: "مش هتفتح حاجة من غير إذن"', 'The driver refuses: "you open nothing without authorisation"'],
  wd_optRadio: ['📻 اطلب إذن العمليات (١٥ ث)', '📻 Request authorisation (15 s)'], wd_optForce: ['✋ فتّش بالمبرر المسجّل', '✋ Insist on the logged reason'], wd_optBack: ['تراجع', 'Back off'],
  wd_authOk: ['العمليات: مأذون بالتفتيش', 'Dispatch: search authorised'], wd_forceBad: ['فتّشت من غير مبرر كافي — شكوى', 'You searched without sufficient grounds — complaint'],
  wd_friskCue: ['التفتيش الذاتي: في حاجة صلبة في جيب الجاكيت', 'Frisk: something hard in the jacket pocket'], wd_underCue: ['تحت العربية: لحام جديد على الأرضية', 'Underbody: fresh welding on the floor pan'], wd_clean: ['{z}: مفيش حاجة', '{z}: nothing']
});
CP.World = {}; const WD = CP.World;

/* ---------- vehicles ---------- */
{ const base = CP.C.veh.classic_sedan; const wAll = { cairo: 6, alex: 6, sinai: 5, hurghada: 5, luxor: 5, aswan: 5, desert: 4 };
  const mk = (id, o) => { CP.C.veh[id] = Object.assign({}, base, { driver: 'm', cls: 'private', lic: 'private', maxV: 12, acc: 2.4, dec: 5.5, pax: [0, 3], win: 0.6, w: wAll, zones: ['cabin', 'glovebox', 'seats', 'boot'] }, o); };
  mk('hatch_silver', { make: ['سوزوكي سويفت', 'Suzuki Swift'], colour: ['فضي', 'Silver'], win: 0.62 });
  mk('sedan_white', { make: ['شيري أريزو', 'Chery Arrizo'], colour: ['أبيض', 'White'], win: 0.6 });
  mk('suv_navy', { make: ['إم جي ZS', 'MG ZS'], colour: ['كحلي', 'Navy'], pax: [0, 4], maxV: 13, win: 0.6 });
  mk('pickup_white', { make: ['تويوتا هايلكس', 'Toyota Hilux'], colour: ['أبيض', 'White'], cls: 'commercial', lic: 'commercial', pax: [0, 2], acc: 2.0, zones: ['cabin', 'glovebox', 'cargo'], w: { cairo: 4, alex: 4, sinai: 6, hurghada: 5, luxor: 6, aswan: 6, desert: 7 } });
  mk('tuktuk', { make: ['توك توك باجاج', 'Bajaj tuk-tuk'], colour: ['أسود وأصفر', 'Black and yellow'], cls: 'commercial', lic: 'commercial', pax: [0, 2], maxV: 8, acc: 1.6, dec: 4, win: 0.5, zones: ['cabin', 'seats'], w: { cairo: 7, alex: 5, sinai: 1, hurghada: 2, luxor: 4, aswan: 4, desert: 0 } });
  mk('moto_delivery', { make: ['موتوسيكل دليفري', 'Delivery motorbike'], colour: ['أحمر', 'Red'], cls: 'commercial', lic: 'motor', pax: [0, 0], maxV: 13, acc: 3.2, dec: 6, win: 0.55, zones: ['cabin', 'cargo'], w: { cairo: 7, alex: 6, sinai: 2, hurghada: 3, luxor: 3, aswan: 3, desert: 1 } });
  mk('moto_black', { make: ['موتوسيكل هوندا', 'Honda motorbike'], colour: ['أسود', 'Black'], lic: 'motor', pax: [0, 1], maxV: 14, acc: 3.4, dec: 6, win: 0.55, zones: ['cabin'], w: { cairo: 5, alex: 5, sinai: 3, hurghada: 3, luxor: 3, aswan: 3, desert: 3 } });
  mk('van_white', { make: ['شيفروليه فان', 'Chevrolet van'], colour: ['أبيض', 'White'], cls: 'commercial', lic: 'commercial', pax: [0, 2], maxV: 11, acc: 1.9, win: 0.72, zones: ['cabin', 'glovebox', 'cargo'] });
  mk('box_truck_white', { make: ['إيسوزو NPR', 'Isuzu NPR'], colour: ['أبيض', 'White'], cls: 'commercial', lic: 'heavy', pax: [0, 1], maxV: 9, acc: 1.3, dec: 4, win: 0.8, zones: ['cabin', 'glovebox', 'cargo'], w: { cairo: 3, alex: 4, sinai: 5, hurghada: 3, luxor: 3, aswan: 3, desert: 6 } });
}

/* ---------- pedestrians ---------- */
CP.Peds = { list: [], N: 25, nextT: 4 };
CP.Peds.reset = function () { this.list = []; this.nextT = 3 + Math.random() * 5; };
CP.Peds.spawn = function (s) {
  const used = new Set(this.list.map(p => p.id)); const free = []; for (let i = 0; i < this.N; i++) if (!used.has(i) && CP.A.M.sprites['ped' + i + '_0']) free.push(i); if (!free.length) return;
  const id = free[Math.floor(Math.random() * free.length)]; const dir = Math.random() < 0.5 ? 1 : -1; const row = 'far';
  const yup = CP.R.Y.mainFar + 0.34 + Math.random() * 0.22; // the corniche pavement behind the police car, booth and sign
  const x0 = dir > 0 ? CP.R.camX - 3 : CP.R.camX + CP.R.span + 3;
  this.list.push({ id, x: x0, px: x0, yup, yupBase: yup, dir, v: 1.05 + Math.random() * 0.45, walkT: 0, hM: (row === 'far' ? CP.HUMAN.pedFar : CP.HUMAN.pedNear) - 0.06 + (id % 5) * 0.03, pause: 0, look: 0, off: Math.random() * 9, row });
};
CP.Peds.update = function (dt) {
  const s = CP.G.shift; if (!s) return; const R = CP.R;
  this.nextT -= dt; const maxN = CP.UI.isMob ? 2 : 3;
  if (this.nextT <= 0) { if (this.list.length < maxN) this.spawn(s); this.nextT = 16 + Math.random() * 22; }
  const alert = (s.events.wanted && s.events.wanted.spawned && !s.events.wanted.done) || CP.Events.emergency();
  for (const p of this.list) {
    p.px = p.x;
    // always moving: never stop. Slow down for a moment behind someone walking the same way, drift a little deeper
    // (further from the lane) to pass a person coming the other way, and slow to a stroll while something is happening.
    let v = p.v * (alert ? 0.6 : 1);
    for (const q of this.list) { if (q === p) continue; const dx = q.x - p.x; if (Math.sign(dx) !== p.dir || Math.abs(dx) > 1.4) continue;
      if (q.dir === p.dir) v = Math.min(v, q.v * 0.9); else p.yup = CP.lerp(p.yup, p.yupBase + 0.14, dt * 2); }
    p.yup = CP.lerp(p.yup, p.yupBase, dt * 0.8);
    const step = v * dt; p.x += p.dir * step; p.walkT += step;
  }
  // they enter from outside the visible world and leave it before despawning
  this.list = this.list.filter(p => p.x > R.camX - 6 && p.x < R.camX + R.span + 6);
};
CP.Peds.frame = p => 'ped' + p.id + '_' + (((Math.floor(p.walkT / (1.3 / 8)) % 8) + 8) % 8);
CP.Peds.ents = function () {};
CP.Peds.drawAll = function (R, s, alpha) {
  const A = CP.A, ppm = R.ppm;
  for (const p of this.list) { (() => {
    const x = CP.lerp(p.px, p.x, alpha); const cx = R.sx(x), gy = R.sy(p.yup); if (cx < -80 || cx > R.W + 80) return;
    const fr = CP.Peds.frame(p); const sp = A.M.sprites[fr]; if (!sp) return; const k = p.hM * R.depthScale(p.yup) * ppm / (sp.hRef || sp.rect[3]);
    R.castShadow(fr, cx, gy, k, p.dir < 0, p.hM); A.drawGroundedScale(R.ctx, fr, cx, gy, k, p.dir < 0);
  })(); }
};
{ const tile = CP.R.tile; CP.R.tile = function (id, yTopUp, yBotUp, vfrac) { const r = tile.apply(this, arguments); if (id === 'road_marked' && CP.Peds && CP.G && CP.G.shift && !this._pedsDrawn) { this._pedsDrawn = true; CP.Peds.drawAll(this, CP.G.shift, 1); } return r; }; }
CP.bus.on('stepEnd', () => { CP.R._pedsDrawn = false; });
CP.bus.on('shiftStart', () => CP.Peds.reset());
CP.bus.on('stepEnd', () => { if (CP.G && CP.G.shift) CP.Peds.update(1 / 60); });

/* ---------- painted street ---------- */
WD.noise = null;
WD.street = function (R, id, yTopUp, yBotUp) {
  const ctx = R.ctx, ppm = R.ppm, W = R.W; const top = R.sy(yTopUp), bot = R.sy(yBotUp); const h = bot - top; if (h <= 0) return;
  const night = R.nightLvl || 0; const L = CP.LOCS[CP.G.shift.loc] || CP.LOCS.cairo; const warm = /desert|luxor|aswan|sinai/.test(CP.G.shift.loc);
  const g = ctx.createLinearGradient(0, top, 0, bot);
  const c0 = warm ? [78, 74, 68] : [70, 72, 76], c1 = warm ? [58, 55, 50] : [48, 50, 54]; const dim = 1 - night * 0.55;
  g.addColorStop(0, `rgb(${c0.map(v => Math.round(v * dim)).join(',')})`); g.addColorStop(1, `rgb(${c1.map(v => Math.round(v * dim)).join(',')})`);
  ctx.fillStyle = g; ctx.fillRect(0, top, W, h);
  if (!WD.noise) { const n = document.createElement('canvas'); n.width = n.height = 128; const nc = n.getContext('2d'); const im = nc.createImageData(128, 128); for (let i = 0; i < im.data.length; i += 4) { const v = 118 + Math.random() * 30; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 26; } nc.putImageData(im, 0, 0); WD.noise = ctx.createPattern(n, 'repeat'); }
  ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = WD.noise; const off = R.camX * ppm; ctx.translate(-off, 0); ctx.fillRect(off, top, W, h); ctx.restore(); // pattern anchored to the world, scrolls with the camera
  // kerb line + subtle sheen band
  ctx.fillStyle = `rgba(255,255,255,${0.10 * dim})`; ctx.fillRect(0, top, W, Math.max(1, 0.03 * ppm)); ctx.fillStyle = `rgba(0,0,0,.18)`; ctx.fillRect(0, bot - Math.max(1, 0.05 * ppm), W, Math.max(1, 0.05 * ppm));
  if (id === 'road_marked') { // dashed centre line in world metres
    const yc = R.sy((yTopUp + yBotUp) / 2); const dash = 1.5 * ppm, gap = 1.5 * ppm, t = Math.max(2, 0.08 * ppm); ctx.fillStyle = `rgba(235,230,215,${0.75 * dim})`;
    const start = -((R.camX * ppm) % (dash + gap)) - dash - gap; for (let x = start; x < W; x += dash + gap) ctx.fillRect(x, yc - t / 2, dash, t);
  }
};
{ const tile = CP.R.tile; CP.R.tile = function (id, yTopUp, yBotUp, vfrac) { if (CP.S.paintedStreet !== false && (id === 'road_marked' || id === 'road_plain') && CP.G && CP.G.shift) return WD.street(this, id, yTopUp, yBotUp); return tile.apply(this, arguments); }; }

/* ---------- search complications ---------- */
{ const zones = CP.Insp.zones; CP.Insp.zones = c => { const z = zones(c).slice(); const v = CP.vehOfCase(c); const inBay = v && v.st === 'bay';
    if (!inBay) return z.filter(x => x === 'boot' || x === 'cargo' || x === 'luggage'); // quick trunk check at the marker
    if (z.indexOf('driver') < 0) z.push('driver'); if (z.indexOf('body') < 0) z.push('body'); if (z.indexOf('under') < 0 && c.type.indexOf('moto') < 0 && c.type !== 'tuktuk') z.push('under'); return z; }; }
CP.addStrings({ z_driver: ['السواق', 'Driver'], wd_quick: ['فحص سريع للشنطة عند العلامة — التفتيش الكامل في منطقة التفتيش', 'Quick trunk check at the marker — full search in the inspection bay'] });
/* no repeats: recently used faces and vehicle types are skipped for as long as the pools allow */
WD.recentP = []; WD.recentV = [];
CP.bus.on('spawn', v => { const c = CP.G.shift.cases[v.caseId]; if (!c || c.regular) return; const PR = CP.C.portraits; const pool = Object.keys(PR).map(Number).filter(p => PR[p].g === c.driver.g && WD.recentP.indexOf(p) < 0);
  if (WD.recentP.indexOf(c.driver.portrait) >= 0 && pool.length) c.driver.portrait = pool[Math.floor(Math.random() * pool.length)];
  WD.recentP.push(c.driver.portrait); if (WD.recentP.length > 14) WD.recentP.shift(); WD.recentV.push(v.type); if (WD.recentV.length > 7) WD.recentV.shift(); });
{ const sc = CP.T.spawnCivilian; CP.T.spawnCivilian = function (opts) { opts = opts || {}; if (!opts.type && CP.G && CP.G.shift) { const loc = CP.locBase(CP.G.shift.loc); const cand = Object.keys(CP.C.veh).filter(t => CP.C.veh[t].w && (CP.C.veh[t].w[loc] || 0) > 0 && WD.recentV.indexOf(t) < 0 && !/^pol_|ambulance/.test(t)); if (cand.length) { let tot = 0; const ws = cand.map(t => { tot += CP.C.veh[t].w[loc]; return tot; }); const r = Math.random() * tot; opts.type = cand[ws.findIndex(x => r < x)]; } } return sc.call(this, opts); }; }
{ const sz = CP.Insp.searchZone; CP.Insp.searchZone = function (c, zone) {
    if (!c.k.searchReason) return sz.call(this, c, zone);
    if (!c.k.consent && c.coop < 45 && !c.k.refused) { c.k.refused = true; WD.refusal(c, zone); return null; }
    if (c.k.refused && !c.k.consent) return null;
    return sz.call(this, c, zone); }; }
WD.refusal = function (c, zone) {
  CP.Dlg.say(c, 'driver', CP.t('wd_refuse')); CP.Audio.ack(c.driver.g); CP.FX.hold = true;
  const box = CP.h('div', { class: 'choicecard', role: 'dialog' }, CP.h('div', { class: 'lbl' }, CP.t('z_' + zone)), CP.h('b', null, CP.t('wd_refuse')),
    CP.h('div', { class: 'col' },
      CP.h('button', { class: 'btn pri', onclick: () => { box.remove(); CP.FX.hold = false; CP.Audio.radioClick(true); CP.Tasks.add({ type: 'radio', owner: 'officer', dur: 15, key: 'auth:' + c.id, caseId: c.id, data: { auth: true, zone } }); } }, CP.t('wd_optRadio')),
      CP.h('button', { class: 'btn', onclick: () => { box.remove(); CP.FX.hold = false; const valid = CP.Cases.searchReasonValid(c, c.k.searchReason); c.k.consent = true; if (!valid) { CP.G.career.trust = CP.clamp(CP.G.career.trust - 3, 0, 100); CP.UI.banner(CP.t('wd_forceBad'), 'warn'); (CP.G.shift.events.mail = CP.G.shift.events.mail || { cmp: [], cmd: [] }).cmp.push(CP.t('ft_cmpLine', { n: CP.L(c.driver.name) })); } CP.Insp.searchZone(c, zone); CP.UI.renderPanel(); } }, CP.t('wd_optForce')),
      CP.h('button', { class: 'btn ghost sm', onclick: () => { box.remove(); CP.FX.hold = false; c.k.refused = false; CP.Audio.clickSoft(); } }, CP.t('wd_optBack'))));
  document.getElementById('stage').appendChild(box);
};
{ const prevR = CP.Tasks.H.radio, prevP = CP.Tasks.P.radio; CP.Tasks.on('radio', t => { if (prevR) prevR(t); if (t.data && t.data.auth) { const c = CP.G.shift.cases[t.caseId]; if (c) { c.k.consent = true; CP.UI.banner(CP.t('wd_authOk'), 'ok'); CP.Insp.searchZone(c, t.data.zone); CP.UI.renderPanel(); } } }, prevP); }
CP.bus.on('searchDone', ({ c, zone }) => {
  if (zone !== 'body' && zone !== 'under') return; const serious = CP.FAM[c.fam] && CP.FAM[c.fam].serious; const r = CP.makeRng(c.seed + zone.length * 97);
  if (serious && r() < 0.5) { const cue = zone === 'body' ? 'bulge' : 'welding'; c.cues.push(cue); CP.note(c, 'observation', CP.fill([CP.STR.ar[zone === 'body' ? 'wd_friskCue' : 'wd_underCue'], CP.STR.en[zone === 'body' ? 'wd_friskCue' : 'wd_underCue']]), 'verified'); CP.Audio.chime('xp'); CP.R.punch(); }
  else CP.UI.toast(CP.t('wd_clean', { z: CP.t('z_' + zone) }), 'info');
});

/* ---------- zoom-change flicker fix: quantised depth of field ---------- */
CP.R.dof = function () { if (CP.S.reducedFx || !('filter' in this.ctx)) return 'none'; const z = this.zoom || 1; let px = CP.clamp((z - 0.9) * 2.6, 0.6, 4.2) * (this.ppm / 60); px = Math.round(px * 2) / 2; if (px < 0.75) return 'none'; return `blur(${px.toFixed(1)}px)`; };
;(window.CP_FILES = window.CP_FILES || {})['29_world'] = '2.6.0';
