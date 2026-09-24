/* Cinema (v2.8)
   - Main menu is an attract-mode cinematic of the real game: zoomed-out corniche with day→night cycle, two lanes of traffic,
     the officer stopping and releasing cars, the sergeant on the far pavement, and every 28 s a set piece: a runner
     smashing through, the spike strip deploying with sparks and tyre smoke, the car limping to a stop and the tow truck
     loading it and driving off. Officers are in proportion with the vehicles.
   - Rank badge SVG gets a unique gradient id everywhere (it was invisible on the menu because the id collided with a hidden screen).
   - Rank name shown in the HUD next to the badge.
   - Spike strip lower on the lane and acts as a speed bump (cars slow to 2.5 m/s and bounce over it).
   - Panel switches no longer animate (no flash / lag spike when swapping papers ↔ radio ↔ dialogue).
   - Developer section in Settings: password unlocks test tools (money, XP, rank, shop, night, end shift, runner, tow, unban).
     The password is never stored; only a keyed hash of it is compared and the unlocked state is written into the encrypted save. */
CP.addStrings({
  dv_dev: ['المطوّر', 'Developer'], dv_pw: ['كلمة سر المطوّر', 'Developer password'], dv_unlock: ['فتح', 'Unlock'], dv_bad: ['كلمة السر غلط', 'Wrong password'], dv_ok: ['أدوات المطوّر مفتوحة', 'Developer tools unlocked'], dv_lock: ['قفل أدوات المطوّر', 'Lock developer tools'],
  dv_money: ['+٥٠٠٠ ج.م', '+5000 EGP'], dv_xp: ['+١٠٠٠ خبرة', '+1000 XP'], dv_rank: ['ترقية فورية', 'Promote now'], dv_shop: ['فتح كل المتجر', 'Unlock whole shop'], dv_night: ['ليل فوراً', 'Night now'], dv_end: ['إنهاء الوردية', 'End shift'], dv_runner: ['هروب سيارة', 'Spawn runner'], dv_tow: ['استدعاء ونش', 'Call tow'], dv_unban: ['فك أي إيقاف', 'Clear ban'], dv_needShift: ['لازم تكون في وردية', 'Needs a running shift']
});
CP.Cine = {}; const CN = CP.Cine;

/* ---------- unique gradient ids for every badge ---------- */
{ const badge = CP.Prog.badge; let n = 0; CP.Prog.badge = function () { const s = badge.apply(this, arguments); if (typeof s !== 'string') return s; const id = 'gd' + (++n); return s.replace(/id="gd"/g, 'id="' + id + '"').replace(/url\(#gd\)/g, 'url(#' + id + ')'); }; }

/* ---------- rank name in the HUD ---------- */
{ const rh = CP.UI.refreshHud; CP.UI.refreshHud = function () { const r = rh.apply(this, arguments); const chip = document.getElementById('hRank'); if (chip && CP.G && CP.G.career) { let nm = chip.querySelector('.rk-name'); if (!nm) { nm = CP.h('span', { class: 'rk-name' }); chip.appendChild(nm); } const t = CP.Prog.rankName(CP.Prog.rankOf(CP.G.career.xp)); if (nm.textContent !== t) nm.textContent = t; } return r; }; }

/* ---------- spikes: lower on the lane, speed bump physics ---------- */
if (CP.Spikes) {
  { const upd = CP.T.update; CP.T.update = function (dt) { const r = upd.apply(this, arguments); const s = CP.G.shift; const X = CP.Spikes.x; for (const v of s.vehicles) { if (v.row !== 0 || v.tow) continue; const d = v.x - X; if (d > -2.2 && d < v.len + 0.4 && !v.runner && !v.spiked) { v.bumpZone = true; } else v.bumpZone = false; } return r; }; }
}

/* ---------- no panel animation when swapping ---------- */
{ const open = CP.UI.open; CP.UI.open = function (kind) { const swapping = !!CP.UI.panel; document.documentElement.classList.toggle('pswap', swapping); const r = open.apply(this, arguments); if (swapping) setTimeout(() => document.documentElement.classList.remove('pswap'), 60); return r; }; }

/* ---------- developer tools ---------- */
CN.devHash = s => CP.Guard ? CP.Guard.str(String(s).trim().toLowerCase() + '|dev|' + CP.Guard.K) : null;
CN.DEV_H = 'a9906ef9'; // keyed hash of the developer password; the password itself is never stored
CN.isDev = () => !!(CP.S._devUnlocked && CP.Guard && CP.S._devUnlocked === CP.Guard.str('unlocked|' + CP.Guard.K));
CN.devAct = function (k) { const s = CP.G && CP.G.shift; const car = CP.G && CP.G.career; if (!car) return; const G = CP.Guard; if (G) G.devPass = true;
  try {
    if (k === 'money') CP.Econ.addMoney(5000); else if (k === 'xp') { if (s && s.prog) CP.Prog.gain(1000, null, null, '#ffd35a', 'DEV'); else car.xp += 1000; }
    else if (k === 'rank') { const ri = CP.Prog.rankOf(car.xp); const nx = CP.Prog.RANKS[ri + 1]; if (nx) car.xp = nx.xp; }
    else if (k === 'shop') { car.gear = car.gear || {}; for (const id in CP.Econ.ITEMS) if (!CP.Econ.ITEMS[id].consumable) car.gear[id] = true; }
    else if (k === 'night') { if (!s) return CP.UI.toast(CP.t('dv_needShift'), 'warn'); s.t = Math.max(s.t, s.dur * 0.7); }
    else if (k === 'end') { if (!s) return CP.UI.toast(CP.t('dv_needShift'), 'warn'); s.t = s.dur + 4; CP.Screens.hideAll(); document.getElementById('game').classList.remove('hidden'); CP.Main.start && CP.Main.start(); }
    else if (k === 'runner') { if (!s) return CP.UI.toast(CP.t('dv_needShift'), 'warn'); const v = s.vehicles.find(x => x.st === 'marker' || x.st === 'stopped'); if (v && v.caseId) { s.cases[v.caseId].fam = Object.keys(CP.FAM).find(f => CP.FAM[f].serious) || s.cases[v.caseId].fam; v.st = 'stopped'; s.cases[v.caseId].k.stopped = true; CP.Events.start('runner'); } }
    else if (k === 'tow') { if (!s) return CP.UI.toast(CP.t('dv_needShift'), 'warn'); const v = s.vehicles.find(x => x.st === 'marker' || x.st === 'stopped') || s.vehicles[0]; if (v) { v.stall = 30; v.stallKind = 'stall'; CP.Tow.call(v, 'towed'); } }
    else if (k === 'unban') { try { localStorage.removeItem('cpns_g2_ban'); } catch (e) { } const b = document.getElementById('banScreen'); if (b) b.remove(); }
    CP.save('auto'); CP.UI.toast('DEV: ' + CP.t('dv_' + k), 'ok'); CP.Audio.click();
  } finally { if (G) G.devPass = false; }
};
{ const st = CP.Screens.settings; CP.Screens.settings = function () { const r = st.apply(this, arguments); const host = document.querySelector('#settings .set'); if (!host || host.querySelector('.dev-sec')) return r;
    const sec = CP.h('section', { class: 'set-sec dev-sec' }, CP.h('h3', null, CP.t('dv_dev')));
    if (!CN.isDev()) { const inp = CP.h('input', { type: 'password', class: 'gd-inp', placeholder: CP.t('dv_pw'), autocomplete: 'off' }); sec.appendChild(CP.h('div', { class: 'row' }, inp, CP.h('button', { class: 'btn', onclick: () => { if (CN.devHash(inp.value) === CN.DEV_H) { CP.S._devUnlocked = CP.Guard.str('unlocked|' + CP.Guard.K); CP.saveSettings(); CP.UI.toast(CP.t('dv_ok'), 'ok'); CP.Screens.settings(CP.Screens.from); } else { CP.UI.toast(CP.t('dv_bad'), 'bad'); inp.value = ''; } } }, CP.t('dv_unlock')))); }
    else { const grid = CP.h('div', { class: 'dev-grid' }, ...['money', 'xp', 'rank', 'shop', 'night', 'end', 'runner', 'tow', 'unban'].map(k => CP.h('button', { class: 'btn', onclick: () => CN.devAct(k) }, CP.t('dv_' + k)))); sec.appendChild(grid); sec.appendChild(CP.h('button', { class: 'btn ghost sm', style: 'margin-top:8px', onclick: () => { delete CP.S._devUnlocked; CP.saveSettings(); CP.Screens.settings(CP.Screens.from); } }, CP.t('dv_lock'))); }
    host.appendChild(sec); return r; }; }
/* guard: developer actions are legitimate */
if (CP.Guard) { const watch = CP.Guard.watch; CP.Guard.watch = function (obj, key, limit, label) { const d = Object.getOwnPropertyDescriptor(obj, key); if (d && d.get && d.get._guard) return; let cur = Number(obj[key]) || 0; const get = () => cur; get._guard = true; Object.defineProperty(obj, key, { enumerable: true, configurable: true, get, set(v) { v = Number(v) || 0; if (v - cur > limit && !CP.Guard.devPass && !CP.Guard.banned()) { CP.Guard.tamper(label); return; } cur = v; } }); }; }

/* ---------- attract-mode cinematic ---------- */
CP.Screens.menuScene = function (cv) {
  const A = CP.A; const st = { t: 0, cars: [], last: performance.now(), officer: { pose: 'idle', dir: -1, t: 0 }, sgt: { x: 0, dir: -1, pose: 'idle', t: 0 }, ev: null, evT: 12, spikes: 0, sparks: [], smoke: [], night: 0 };
  const TYPES = ['microbus', 'cairo_taxi', 'silver_sedan', 'classic_sedan', 'charcoal_suv', 'courier_van', 'hatch_silver', 'sedan_white', 'suv_navy', 'pickup_white', 'moto_black', 'van_white'].filter(t => A.M.vehicles[t]);
  const loop = now => {
    if (CP.Screens.cur !== 'menu') return; requestAnimationFrame(loop);
    const dt = CP.clamp((now - st.last) / 1000, 0, 0.05); st.last = now; st.t += dt; CP.Audio.update && CP.Audio.update(dt);
    const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); if (r.width < 10) return;
    if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); const W = r.width, H = r.height; const ar = CP.lang === 'ar';
    const gateX = 19.5; const base = Math.min(H / 12, W / 26); const cam = st.cam || (st.cam = { x: 0, z: 1, tx: 0, tz: 1 });
    // shot list: idle = slow dolly; bolt = follow the runner, pushed in; spike = tight on the strip; tow = follow the truck wide
    const anchor = CP.lang === 'ar' ? 0.28 : 0.72; const E = st.ev; let focusX = gateX, tz = 1 + 0.04 * Math.sin(st.t * 0.11), sway = Math.sin(st.t * 0.06) * 1.4;
    if (E && E.stage === 'wait') { focusX = gateX - 3; tz = 1.25; sway = 0; } else if (E && E.stage === 'bolt') { focusX = E.car.x + 2; tz = 1.2; sway = 0; } else if (E && E.stage === 'spike') { focusX = gateX + 4.2 + (E.car.spiked ? E.car.x - gateX - 4.2 : 0) * 0.5; tz = 1.35; sway = 0; } else if (E && E.stage === 'tow') { focusX = E.truck ? E.truck.x - 3 : gateX + 4; tz = 1.05; sway = 0; }
    cam.tx = focusX - (W / (base * tz)) * anchor + sway; cam.tz = tz; cam.x += (cam.tx - cam.x) * Math.min(1, dt * 1.6); cam.z += (cam.tz - cam.z) * Math.min(1, dt * 1.2);
    const ppm = base * cam.z; const span = W / ppm; const camX = cam.x; const sx = x => (x - camX) * ppm; const gy0 = H * 0.66, gy1 = H * 0.86; // far lane / near lane ground
    st.night = 0.5 + 0.5 * Math.sin(st.t / 30 * Math.PI - Math.PI / 2); const night = CP.clamp(st.night, 0, 1);
    // backdrop
    const L = CP.LOCS.alex; const im = A.img[L.bg.day], nimg = A.img[L.bg.night]; if (im) { let bw = W * 1.08, bh = bw * im.height / im.width; const minH = gy0 - 0.4 * ppm + 10; if (bh < minH) { bh = minH; bw = bh * im.width / im.height; } const bx = W / 2 - bw / 2 + Math.sin(st.t * 0.05) * 6; ctx.drawImage(im, bx, gy0 - 0.4 * ppm - bh, bw, bh); if (nimg && night > 0.01) { ctx.globalAlpha = night; ctx.drawImage(nimg, bx, gy0 - 0.4 * ppm - bh, bw, bh); ctx.globalAlpha = 1; } }
    // road band
    const g = ctx.createLinearGradient(0, gy0 - 0.4 * ppm, 0, H); g.addColorStop(0, `rgb(${70 - 30 * night},${72 - 30 * night},${76 - 30 * night})`); g.addColorStop(1, `rgb(${48 - 20 * night},${50 - 20 * night},${54 - 20 * night})`); ctx.fillStyle = g; ctx.fillRect(0, gy0 - 0.4 * ppm, W, H);
    ctx.fillStyle = 'rgba(235,230,215,.6)'; for (let x = -((st.t * 0) % 60); x < W; x += 3 * ppm) ctx.fillRect(x, gy1 - 1.6 * ppm, 1.5 * ppm, Math.max(2, 0.07 * ppm));
    // gate + booth + sign (simple props from the sheet)
    const dr = (id, x, gy, hM, flip) => { const sp = A.M.sprites[id]; if (!sp) return; const k = hM * ppm / (sp.hRef || sp.rect[3]); if (id.startsWith('o')) CP.R.castShadow && (() => { const sv = { ctx: CP.R.ctx, ppm: CP.R.ppm, W: CP.R.W, nightLvl: CP.R.nightLvl }; CP.R.ctx = ctx; CP.R.ppm = ppm; CP.R.W = W; CP.R.nightLvl = night; CP.R.castShadow(id, x, gy, k, flip, hM); Object.assign(CP.R, sv); })(); A.drawGroundedScale(ctx, id, x, gy, k, flip); };
    const prop = (id, x, gy, hM) => { const sp = A.M.sprites[id]; if (!sp) return; const k = hM * ppm / sp.rect[3]; A.drawGroundedScale(ctx, id, sx(x), gy, k, false, 0.5); };
    prop('booth', 26, gy0 - 0.3 * ppm, 3.2); prop('floodlight', 13.6, gy0 - 0.3 * ppm, 4.2); prop('gate_motor', gateX, gy0 - 0.2 * ppm, 1.6); prop('gate_f7', gateX, gy0 - 0.2 * ppm, 1.6);
    // sergeant on the far pavement
    const S = st.sgt; S.t += dt; if (S.t > 9) { S.t = 0; S.target = 10 + Math.random() * 14; } if (S.target != null) { const d = S.target - S.x; if (Math.abs(d) > 0.1) { S.x += Math.sign(d) * 1.2 * dt; S.dir = Math.sign(d); S.walk = (S.walk || 0) + 1.2 * dt; S.moving = true; } else { S.moving = false; S.target = null; } } dr(CP.Actors.frameFor(2, S.moving ? 'idle' : (Math.floor(st.t / 7) % 3 ? 'idle' : 'radio'), S.moving, S.walk || 0, st.t + 2, true), sx(S.x || 12), gy0 - 0.35 * ppm, 1.45, S.dir < 0);
    // traffic
    st.spawn = (st.spawn || 0) - dt; if (st.spawn <= 0 && st.cars.length < 7) { st.spawn = 4 + Math.random() * 5; const type = TYPES[Math.floor(Math.random() * TYPES.length)]; const V = A.M.vehicles[type]; st.cars.push({ type, x: camX - 8 - Math.random() * 6, v: 6 + Math.random() * 3, w: 0, lane: 1, len: V.lengthMetres, stopT: 0 }); }
    const marker = gateX - 3.5; const O = st.officer; O.t -= dt; let held = null;
    for (const c of st.cars) { const prev = c.x; if (c.lane === 1 && !c.runner) { const stopHere = !c.passed && c.x >= marker - 0.2; if (stopHere && c.stopT < 3.6) { c.v = Math.max(0, c.v - 12 * dt); c.stopT += dt; held = c; if (c.stopT > 3.2) { c.passed = true; O.pose = 'wave'; O.t = 0.9; } } else if (c.passed && c.x < marker + 2 && st.ev && st.ev.stage === 'bolt' && st.ev.car === c) { c.v = Math.min(15, c.v + 7 * dt); } else c.v = Math.min(c.limp ? 1.2 : 8, c.v + 3 * dt); if (!c.passed && c.x > marker - 6 && c.x < marker - 0.2 && !held) { O.pose = 'stop'; O.t = 0.5; } }
      else c.v = Math.min(8, c.v + 3 * dt);
      c.x += c.v * dt; c.w += (c.x - prev) / A.M.vehicles[c.type].wheelRadiusMetres; if (c.spiked && c.v < 0.2 && !c.towing) c.towing = 0; }
    // set piece: runner → spikes → tow
    st.evT -= dt; if (!st.ev && st.evT <= 0) { const cand = st.cars.find(c => c.lane === 1 && !c.passed && c.x > marker - 8 && c.x < marker); if (cand) st.ev = { stage: 'wait', car: cand, t: 0 }; }
    if (st.ev) { const E = st.ev, c = E.car; E.t += dt;
      if (E.stage === 'wait' && c.stopT > 1.4) { E.stage = 'bolt'; c.passed = true; c.runner = true; c.v = 4; O.pose = 'stop'; O.t = 1.2; }
      if (E.stage === 'bolt') { c.v = Math.min(14, c.v + 8 * dt); if (c.x > gateX + 1.5) { E.stage = 'spike'; st.spikes = 0; } }
      if (E.stage === 'spike') { st.spikes = Math.min(1, st.spikes + dt / 0.5); if (c.x > gateX + 4.2 && !c.spiked) { c.spiked = true; for (let i = 0; i < 110; i++) st.sparks.push({ x: sx(gateX + 4.2), y: gy1, vx: (Math.random() - 0.3) * 380, vy: -60 - Math.random() * 360, t: 0 }); } if (c.spiked) { c.v = Math.max(0, c.v - 6 * dt); c.limp = true; if (Math.random() < 0.6) st.smoke.push({ x: sx(c.x - c.len * 0.8), y: gy1, r: 4 + Math.random() * 8, t: 0 }); if (c.v < 0.2) { E.stage = 'tow'; E.truck = { x: -12, v: 0 }; } } }
      if (E.stage === 'tow') { const T = E.truck; if (T.x === -12) T.x = camX - 12; const target = c.x + 0.6; if (!E.loaded) { const d = target - T.x; T.v = Math.min(8, Math.max(0.6, d * 1.3)); T.x += Math.min(d, T.v * dt); if (d < 0.05) { E.lift = (E.lift || 0) + dt / 2.4; if (E.lift >= 1) E.loaded = true; } } else { T.v = Math.min(9, T.v + 2.5 * dt); T.x += T.v * dt; c.x = T.x - 7.4 * 0.58 + c.len / 2; if (T.x > camX + span + 14) { st.cars = st.cars.filter(x => x !== c); st.ev = null; st.evT = 24; st.spikes = 0; } }
        const p = E.loaded ? 1 : (E.lift || 0); c.lift = Math.sin(p * Math.PI) * 0.5 + (p > 0.5 ? (p - 0.5) * 2 * 1.05 : 0); if (p > 0.05) { const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; c.x = c.x0 == null ? (c.x0 = c.x, c.x) : c.x0 + (T.x - 7.4 * 0.58 + c.len / 2 - c.x0) * e; } if (st.spikes > 0 && E.loaded) st.spikes = Math.max(0, st.spikes - dt); }
    }
    // draw spikes, lanes back to front
    const spf = 'spikes_' + String(Math.round(st.spikes * 15)).padStart(2, '0'); const spS = A.M.sprites[spf]; if (spS) { const k = 1.15 * ppm / spS.rect[2]; A.drawGroundedScale(ctx, spf, sx(gateX + 4.2), gy1 + 0.25 * ppm, k, false, 0.5); }
    for (const c of st.cars.filter(c => c.lane === 0)) A.drawVehicle(ctx, c.type, sx(c.x - c.len), gy0 + 0.25 * ppm, ppm * 0.92, c.w, 0, 0);
    if (st.ev && st.ev.truck) { const T = st.ev.truck; A.drawVehicle(ctx, 'tow_truck', sx(T.x - 7.4), gy1 + 0.35 * ppm, ppm, 0, 0, 0); }
    for (const c of st.cars.filter(c => c.lane === 1)) A.drawVehicle(ctx, c.type, sx(c.x - c.len), gy1 - (c.lift || 0) * ppm, ppm, c.w, 0, 0);
    // officer at the marker
    O.pose = O.t > 0 ? O.pose : 'idle'; dr(CP.Actors.frameFor(0, O.pose, false, 0, st.t), sx(marker + 1.6), gy1 + 0.02 * ppm, 1.78, true);
    // sparks + smoke
    ctx.save(); for (const s of st.sparks) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 500 * dt; ctx.globalAlpha = Math.max(0, 1 - s.t * 1.6); ctx.fillStyle = Math.random() < 0.5 ? '#ffd35a' : '#ff8a3a'; ctx.fillRect(s.x, s.y, 2.5, 2.5); } st.sparks = st.sparks.filter(s => s.t < 0.7);
    for (const m of st.smoke) { m.t += dt; m.y -= 18 * dt; m.r += 14 * dt; ctx.globalAlpha = Math.max(0, 0.35 - m.t * 0.25); ctx.fillStyle = '#9a9a9a'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill(); } st.smoke = st.smoke.filter(m => m.t < 1.5); ctx.restore();
    // headlights / brake lights at night, tow beacon, post-processing
    if (night > 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const c of st.cars) { const hx = sx(c.x), hy = gy1 - 0.55 * ppm; const g = ctx.createLinearGradient(hx, hy, hx + 5 * ppm, hy); g.addColorStop(0, `rgba(255,240,200,${0.35 * night})`); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, hy - 0.15 * ppm); ctx.lineTo(hx + 5.5 * ppm, hy - 1.1 * ppm); ctx.lineTo(hx + 5.5 * ppm, hy + 0.7 * ppm); ctx.lineTo(hx, hy + 0.15 * ppm); ctx.closePath(); ctx.fill(); if (c.v < 1.5) { ctx.fillStyle = `rgba(255,60,50,${0.55 * night})`; ctx.beginPath(); ctx.arc(sx(c.x - c.len) + 0.1 * ppm, gy1 - 0.6 * ppm, 0.12 * ppm, 0, 6.283); ctx.fill(); } } ctx.restore(); }
    const flares = night > 0.35 ? [13.6, 30].map(fx => ({ x: sx(fx) + 0.2 * ppm, y: gy0 - 0.3 * ppm - 4.0 * ppm, r: 1.6 * ppm, a: 0.45 * night })) : [];
    const beacon = st.ev && st.ev.truck ? { x: sx(st.ev.truck.x - 1.2), y: gy1 + 0.35 * ppm - 3.3 * ppm, r: 1.2 * ppm } : null;
    // night: floodlight pools + vignette
    if (night > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const fx of [13.6, 30]) { const cx = sx(fx), cy = gy1 - 0.5 * ppm; const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6 * ppm); gg.addColorStop(0, `rgba(255,225,170,${0.25 * night})`); gg.addColorStop(1, 'rgba(255,225,170,0)'); ctx.fillStyle = gg; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.4); ctx.beginPath(); ctx.arc(0, 0, 6 * ppm, 0, 6.283); ctx.fill(); ctx.restore(); } ctx.restore(); ctx.fillStyle = `rgba(10,14,30,${0.35 * night})`; ctx.fillRect(0, 0, W, H); }
    st.cars = st.cars.filter(c => c.x - c.len < camX + span + 6 || c.towing != null || (st.ev && st.ev.car === c));
    if (CP.CineFX) CP.CineFX.post(ctx, W, H, night, st.t, flares, beacon);
  };
  requestAnimationFrame(loop);
};
;(window.CP_FILES = window.CP_FILES || {})['39_cinema'] = '2.8.2';
