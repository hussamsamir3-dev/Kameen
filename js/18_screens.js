/* Full screens. Real HTML text over supplied art (menu uses the Cairo background, booth, gate, microbus and officer). */
CP.addStrings({
  br_tod: ['وقت الوردية', 'Shift time'], tod_auto: ['تلقائي', 'Auto'], tod_dusk: ['العصر ← الليل', 'Afternoon → night'], tod_night: ['الليل ← الفجر', 'Night → dawn'], tod_dawn: ['الفجر ← الضهر', 'Dawn → midday'], tod_day: ['الصبح ← المغرب', 'Morning → sunset'],
  tod_hint: ['الوردية دي: {t} — ١٢ ساعة في اللعبة، الشمس بتطلع أو بتغيب قدامك.', 'This shift: {t} — 12 in-game hours; you will see the sun rise or set.'],
  m_continueFree: ['كمّل الدورية الحرة', 'Continue free patrol'],
  m_missing: ['رسومات ناقصة', 'Missing art'],
  br_shift: ['الوردية {n}', 'Shift {n}'], br_tutorial: ['تدريب موجّه في أول وردية', 'Guided training on the first shift'], br_locked: ['بيتفتح من الوردية ٢', 'Unlocks from shift 2'],
  rp_unresolved: ['اتسابت مفتوحة', 'Left unresolved'], rp_escaped: ['هربت من الحارة', 'Skipped via lane'], rp_credit: ['رصيد مكتسب: +{n}', 'Credit earned: +{n}'],
  set_mode_off: ['عادي', 'Normal'], sv_exported: ['نسخة احتياطية جاهزة', 'Backup ready'], set_download: ['تنزيل ملف', 'Download file'], set_file: ['اختار ملف', 'Choose file'],
  how_keys: ['التحكم', 'Controls'], how_touch: ['على الموبايل والتابلت: المس العربية تختارها، المس الأرض تمشي، واسحب يمين وشمال عشان تتفرج على الطريق. الزراير الكبيرة تحت هي الإجراءات؛ لو زرار باهت، بيقولك ناقص إيه.', 'Touch: tap a vehicle to select it, tap the ground to walk, drag sideways to look along the road. The large buttons below are your actions; a dimmed button tells you what is missing.'],
  pause_settings: ['الإعدادات', 'Settings'], end_confirm: ['تنهي الوردية دلوقتي؟ الحالات المفتوحة هتتحسب مش محلولة.', 'End the shift now? Open cases will count as unresolved.']
});
CP.Screens = { cur: null, stack: [] };
const sh = CP.h;
CP.Screens.el = function (id) { let e = document.getElementById(id); if (!e) { e = sh('div', { id, class: 'screen hidden' }); document.getElementById('app').appendChild(e); } return e; };
CP.Screens.show = function (id, overlay) {
  for (const e of document.querySelectorAll('.screen')) e.classList.add('hidden');
  if (!overlay) document.getElementById('game').classList.add('hidden');
  const e = this.el(id); e.classList.remove('hidden'); this.cur = id; this.overlay = !!overlay;
  const f = e.querySelector('.btn.pri, .btn'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  return e;
};
CP.Screens.hideAll = function () { for (const e of document.querySelectorAll('.screen')) e.classList.add('hidden'); this.cur = null; this.overlay = false; };
CP.Screens.overlayOpen = () => !!CP.Screens.cur;
CP.Screens.back = function () { if (this.cur === 'settings' || this.cur === 'how') { if (this.from === 'pause') this.pause(); else if (this.from === 'menu') this.menu(); else this.hideAll(); } else if (this.cur === 'pause') this.resume(); };

/* ---------- loading ---------- */
CP.Screens.loading = function () {
  const e = this.show('loading'); e.innerHTML = '';
  const lsrc = (window.CP_EMBED && window.CP_EMBED.logo_checkpoint) || 'assets/logo_checkpoint.png';
  const limg = sh('div', { class: 'logoimg', style: '--ls:.9' }); const im = new Image(); im.alt = 'كمين — Checkpoint'; im.src = lsrc; im.onerror = () => { limg.replaceWith(CP.Brand.logo({ size: 0.85, static: true })); }; limg.append(sh('div', { class: 'lglow' }), im, sh('i', { class: 'lshine', style: `-webkit-mask-image:url(${lsrc});mask-image:url(${lsrc})` }));
  e.append(limg, sh('div', { class: 'muted', id: 'ldTxt' }, CP.t('loading')), sh('div', { class: 'bar' }, sh('i', { id: 'ldBar' })), sh('div', { class: 'errs', id: 'ldErr' }));
};
CP.Screens.loadProgress = function (p, file) { const b = document.getElementById('ldBar'); if (b) b.style.width = (p * 100) + '%'; const t = document.getElementById('ldTxt'); if (t) t.textContent = CP.t('loading'); };
CP.Screens.loadErrors = function (errs) {
  errs = errs.filter(f => !/logo_|fx_particles|checkpoint_props2|police_vehicles|driver_portraits_3|vehicles_extra|driver_portraits_2|gate_barrier|officer_(walk|idle)_seq|loc_/.test(f)); if (!errs.length) return;
  const e = document.getElementById('ldErr'); if (!e) return;
  e.innerHTML = ''; for (const f of errs) e.appendChild(sh('div', null, CP.t('loadFail', { f })));
  e.appendChild(sh('p', { class: 'muted' }, CP.t('loadFailHelp')));
  e.appendChild(sh('button', { class: 'btn', onclick: () => location.reload() }, '↻'));
};

/* ---------- main menu: live animated checkpoint diorama with mouse/tilt parallax ---------- */
CP.Screens.menuScene = function (cv) {
  const A = CP.A; const st = { t: 0, cars: [], ang: 0, gateT: 0, spawn: 0.5, mx: 0, my: 0, dust: [], last: performance.now() };
  const types = ['microbus', 'cairo_taxi', 'silver_sedan', 'classic_sedan', 'charcoal_suv', 'older_minibus', 'courier_van'];
  const onMove = e => { const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return; st.mx = ((e.clientX - r.left) / r.width - 0.5); st.my = ((e.clientY - r.top) / r.height - 0.5); };
  window.addEventListener('pointermove', onMove);
  const loop = now => {
    if (CP.Screens.cur !== 'menu') { window.removeEventListener('pointermove', onMove); return; }
    requestAnimationFrame(loop);
    const dt = CP.clamp((now - st.last) / 1000, 0, 0.05); st.last = now; st.t += dt;
    CP.Audio.update(dt);
    const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = r.width, H = r.height; const ar = CP.lang === 'ar'; if (W < 10 || H < 10 || !isFinite(dt)) return;
    const ppm = Math.min(H / 8.6, W / 15.5); const gy = H * 0.84;
    const gx = ar ? W * 0.34 : W * 0.66; // gate screen x (scene sits opposite the menu panel)
    const px = st.mx * 18, py = st.my * 10;
    // sky/background with slow drift + parallax
    // rotating destinations: each supplied location fades between day and night, then on to the next
    const scenes = CP.LOC_ORDER.filter(k => CP.LOCS[k].bg.day); const per = 14; const si = Math.floor(st.t / per) % scenes.length; const sp = (st.t % per) / per;
    const drawScene = (k, a) => { const B = CP.LOCS[k].bg; const nl = 0.5 - 0.5 * Math.cos(sp * Math.PI * 2); for (const [id, al] of [[B.day, 1], [B.night, nl]]) { const im = A.img[id]; if (!im || al <= 0.01) continue; const kk = Math.max(W / im.width, (gy + 0.2 * ppm) / (im.height * B.frac)) * 1.08; const bw = im.width * kk, bh = im.height * kk; ctx.globalAlpha = a * al; ctx.drawImage(im, (W - bw) / 2 - px * 1.2, gy - 1.1 * ppm - B.frac * bh - py * 0.5, bw, bh); } ctx.globalAlpha = 1; };
    const bg = null;
    drawScene(scenes[si], 1); if (sp > 0.9) drawScene(scenes[(si + 1) % scenes.length], (sp - 0.9) / 0.1);
    if (bg) { }
    const sk = ctx.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, 'rgba(18,10,40,.35)'); sk.addColorStop(0.6, 'rgba(10,8,20,.15)'); sk.addColorStop(1, 'rgba(5,5,8,.65)'); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
    // road strip
    const rr = A.rect('road_marked'); const rim = A.img[A.M.sprites.road_marked.sheet];
    if (rim) { const rh = 1.9 * ppm; const tw = rr[2] * rh / rr[3]; const off = -((st.t * 0) % tw) - px * 2; for (let x = off - tw; x < W + tw; x += tw) ctx.drawImage(rim, rr[0], rr[1], rr[2], rr[3], x, gy - rh * 0.72, tw + 1, rh); }
    const X = m => gx + m * ppm - px * 2.2; // metres relative to the gate → screen
    // booth + floodlights behind
    A.groundedH(ctx, 'booth', X(4.2) + px * 1.2, gy - rhFar(ppm) - 0.25 * ppm, 2.0 * ppm);
    A.groundedH(ctx, 'floodlight', X(-3.4) + px, gy - rhFar(ppm) - 0.25 * ppm, 3.4 * ppm); A.groundedH(ctx, 'floodlight', X(7.2) + px, gy - rhFar(ppm) - 0.25 * ppm, 3.4 * ppm);
    // cars: approach, stop at the barrier, gate lifts, drive on
    st.spawn -= dt;
    const lastC = st.cars[st.cars.length - 1];
    if (st.spawn <= 0 && (!lastC || lastC.x - lastC.len > -W / ppm * 0.5 - 2)) { const tp = types[Math.floor(Math.random() * types.length)]; st.cars.push({ type: tp, len: A.M.vehicles[tp].lengthMetres, x: -(W / ppm) * 0.6 - 3, v: 7, w: 0, wait: 0 }); st.spawn = 3 + Math.random() * 4; }
    for (let i = 0; i < st.cars.length; i++) {
      const c = st.cars[i]; const lead = st.cars[i - 1];
      let stopX = Infinity; if (st.ang < 0.9 && c.x < -0.2) stopX = -0.35; if (lead) stopX = Math.min(stopX, lead.x - lead.len - 1.2);
      const d = stopX - c.x; const want = d < Infinity ? Math.min(8, Math.sqrt(Math.max(0, 2 * 3.5 * d))) : 8;
      c.v += CP.clamp(want - c.v, -6 * dt, 2.6 * dt); if (c.v < 0) c.v = 0;
      const dx = c.v * dt; c.x += dx; c.w += dx / A.M.vehicles[c.type].wheelRadiusMetres;
      if (c.v < 0.05 && Math.abs(c.x + 0.35) < 0.2) c.wait += dt; else c.wait = 0;
    }
    const front = st.cars.find(c => c.x > -3 && c.x - c.len < 1.5);
    if (front && front.wait > 1.4) st.gateT = 1; else if (!st.cars.some(c => c.x - c.len < 1.2 && c.x > -0.5)) st.gateT = 0;
    st.ang += CP.clamp(st.gateT - st.ang, -dt / 1.3, dt / 1.3);
    st.cars = st.cars.filter(c => c.x - c.len < W / ppm);
    // barrier on the far side of the road (5 frames, cross-faded)
    const NF = (A.M.gateFrames || 5) - 1, f = st.ang * NF, i0 = Math.floor(f), fr = f - i0, GH = 3.2 * ppm, bx = X(0.2), by = gy - 1.05 * ppm;
    const dF = (i, a) => { if (i > NF || a <= 0.01 || !A.img.gate_barrier) return; const id = 'gate_f' + i, rc = A.rect(id), an = A.M.sprites[id].anchor, k = GH / rc[3]; ctx.globalAlpha = a; ctx.drawImage(A.img.gate_barrier, rc[0], rc[1], rc[2], rc[3], bx - an[0] * rc[2] * k, by - an[1] * rc[3] * k, rc[2] * k, rc[3] * k); ctx.globalAlpha = 1; };
    dF(i0, 1); dF(i0 + 1, fr);
    for (const c of st.cars) {
      const g = A.vgeom(c.type, ppm); const left = X(c.x - c.len);
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(left + g.width / 2, gy + 2, g.width * 0.5, 0.2 * ppm, 0, 0, 7); ctx.fill();
      A.drawVehicle(ctx, c.type, left, gy, ppm, c.w, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const hx = left + g.width * 0.985, hy = gy - g.bodyBottom + g.height * 0.6;
      const hg = ctx.createLinearGradient(hx, hy, hx + 6 * ppm, hy); hg.addColorStop(0, 'rgba(255,235,190,.35)'); hg.addColorStop(1, 'rgba(255,235,190,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(hx, hy - 3); ctx.lineTo(hx + 6 * ppm, hy - 0.8 * ppm); ctx.lineTo(hx + 6 * ppm, hy + 1.1 * ppm); ctx.lineTo(hx, hy + 3); ctx.fill();
      if (c.v < 1) { const bg2 = ctx.createRadialGradient(left + 4, hy, 0, left + 4, hy, 0.5 * ppm); bg2.addColorStop(0, 'rgba(255,40,30,.8)'); bg2.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = bg2; ctx.fillRect(left - 0.5 * ppm, hy - 0.5 * ppm, ppm, ppm); }
      ctx.restore();
    }
    // officer waving the car through
    // the crew from the v1.5 sheet: the sergeant by the booth on the radio, the player's officer working the barrier,
    // the partner (white) beside him ready with the papers
    const F = CP.Actors.frameFor, dr = (fr, x, y, h, flip) => { const sp = A.M.sprites[fr]; if (!sp) return; const k = h * ppm / (sp.hRef || sp.rect[3]); if (CP.R.castShadow) { const R = CP.R, sv = { ctx: R.ctx, ppm: R.ppm, W: R.W, nightLvl: R.nightLvl }; R.ctx = ctx; R.ppm = ppm; R.W = W; R.nightLvl = st.night || 0; R.castShadow(fr, x, y, k, flip, h); Object.assign(R, sv); } A.drawGroundedScale(ctx, fr, x, y, k, flip); };
    const incoming = st.cars.some(c => c.v > 0.5 && c.x < -1 && c.x > -9);
    dr(F(2, Math.floor(st.t / 7) % 3 === 1 ? 'radio' : 'idle', false, 0, st.t + 2), X(3.7) + px * 1.2, gy - rhFar(ppm) - 0.25 * ppm, CP.HUMAN.menuSgt, true);
    dr(F(0, st.ang > 0.5 ? 'wave' : incoming ? 'stop' : 'idle', false, 0, st.t), X(1.6), gy + 0.4 * ppm, CP.HUMAN.menuOfficer, true);
    dr(F(1, st.ang > 0.5 ? 'idle' : incoming ? 'documents' : 'idle', false, 0, st.t + 0.9), X(3.0), gy + 0.42 * ppm, CP.HUMAN.menuPartner, true);
    // lamp + floodlight glows
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lampC = st.ang > 0.95 ? '60,255,120' : st.ang < 0.05 ? '255,60,50' : '255,190,40';
    const lg = ctx.createRadialGradient(bx - 0.12 * ppm, by - 1.06 * ppm, 0, bx - 0.12 * ppm, by - 1.06 * ppm, 0.6 * ppm); lg.addColorStop(0, `rgba(${lampC},.9)`); lg.addColorStop(1, `rgba(${lampC},0)`); ctx.fillStyle = lg; ctx.fillRect(bx - ppm, by - 1.8 * ppm, 2 * ppm, 1.6 * ppm);
    for (const fx of [-3.4, 7.2]) { const x = X(fx) + px, y = gy - rhFar(ppm) - 3.45 * ppm; const fl = 0.55 + 0.05 * Math.sin(st.t * 13 + fx); const g2 = ctx.createRadialGradient(x, y, 0, x, y, 1.6 * ppm); g2.addColorStop(0, `rgba(255,240,200,${fl})`); g2.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g2; ctx.fillRect(x - 2 * ppm, y - 2 * ppm, 4 * ppm, 4 * ppm); }
    ctx.restore();
    // floating dust motes
    if (st.dust.length < 70) st.dust.push({ x: Math.random() * W, y: Math.random() * H, v: 6 + Math.random() * 14, r: 0.6 + Math.random() * 1.6, a: 0.2 + Math.random() * 0.4 });
    for (const d of st.dust) { d.x += d.v * dt; d.y += Math.sin(st.t + d.x * 0.01) * 0.2; if (d.x > W) d.x = -5; ctx.fillStyle = `rgba(255,220,170,${d.a})`; ctx.beginPath(); ctx.arc(d.x - px, d.y - py, d.r, 0, 7); ctx.fill(); }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // 3D tilt of the title follows the pointer
    const tl = document.querySelector('#menu .t3d'); if (tl) tl.style.transform = `perspective(900px) rotateY(${(ar ? -1 : 1) * st.mx * 14}deg) rotateX(${-st.my * 10}deg) translateZ(0)`;
  };
  const rhFar = p => 0.72 * 1.9 * p * 0.9;
  requestAnimationFrame(loop);
};
CP.Screens.rankCard = function (car) {
  CP.Prog.ensure(car); const ri = CP.Prog.rankOf(car.xp), R = CP.Prog.RANKS, nx = R[ri + 1];
  const pct = nx ? (car.xp - R[ri].xp) / (nx.xp - R[ri].xp) * 100 : 100; const pos = CP.Prog.board(car).find(e => e.me).pos;
  return sh('div', { class: 'rankcard', html: CP.Prog.badge(ri, 58) + `<div class="rc"><div class="lbl">${CP.t('pr_rank')}</div><b>${CP.Prog.rankName(ri)}</b><div class="xpbar big"><i style="width:${pct.toFixed(1)}%"></i></div><div class="small muted">${CP.num(car.xp)} ${CP.t('pr_xp')} • ${nx ? CP.t('pr_next', { n: CP.num(nx.xp) }) : CP.t('pr_max')}</div><div class="small"><span class="tag am">#${CP.num(pos)}</span> ${car.streak > 1 ? CP.t('pl_streakDay', { n: CP.num(car.streak), p: CP.num(Math.round((CP.Prog.streakMult(car) - 1) * 100)) }) : ''}</div></div>` });
};
CP.Screens.menu = function () {
  CP.Main.stop(); CP.Audio.stopAll(); this.from = 'menu';
  const e = this.show('menu'); e.innerHTML = '';
  const cv = sh('canvas', { class: 'bg', 'aria-hidden': 'true' });
  const saved = (() => { CP.SAVE_KEY = 'cpns_save_v1'; return CP.loadSaved(); })();
  const freeSaved = (() => { try { return !!localStorage.getItem('cpns_free_v1'); } catch (er) { return false; } })();
  const done = saved && saved.career.tutorialDone;
  const mc = sh('div', { class: 'mc glass' },
    sh('div', { class: 't3d' }, sh('div', { class: 'title-ar' }, 'كمين', sh('span', { class: 'colon' }, ':'), sh('br'), 'وردية ليل'), sh('div', { class: 'title-en' }, 'CHECKPOINT: NIGHT SHIFT')),
    sh('div', { class: 'muted', style: 'margin-bottom:6px' }, CP.t('subtitle')),
    saved ? this.rankCard(saved.career) : null,
    saved ? sh('button', { class: 'btn pri mb', onclick: () => CP.Main.continueCareer(saved) }, '▶ ' + CP.t('m_continue'), sh('span', { class: 'small', style: 'margin-inline-start:auto;opacity:.75' }, CP.t('m_careerOf', { n: CP.num(saved.career.shiftNo) }))) : null,
    sh('button', { class: 'btn mb' + (saved ? '' : ' pri'), onclick: () => { if (saved) CP.UI.confirm(CP.t('m_newConfirm'), () => CP.Main.newCareer()); else CP.Main.newCareer(); } }, CP.t('m_new')),
    sh('button', { class: 'btn mb', 'aria-disabled': done ? 'false' : 'true', title: done ? '' : CP.t('m_freeLocked'), onclick: () => { if (!done) { CP.UI.toast(CP.t('m_freeLocked'), 'warn'); return; } CP.Main.free(false); } }, CP.t('m_free'), done ? null : sh('span', { class: 'small muted', style: 'margin-inline-start:auto' }, CP.t('m_freeLocked'))),
    freeSaved && done ? sh('button', { class: 'btn mb', onclick: () => CP.Main.free(true) }, CP.t('m_continueFree')) : null,
    saved ? sh('button', { class: 'btn mb', onclick: () => this.record(saved.career) }, '🏆 ' + CP.t('pr_record')) : null,
    sh('div', { class: 'row' }, sh('button', { class: 'btn mb', style: 'flex:1', onclick: () => this.settings('menu') }, CP.icon('gear'), CP.t('m_settings')), sh('button', { class: 'btn mb', style: 'flex:1', onclick: () => this.how('menu') }, CP.t('m_how'))),
    sh('div', { class: 'row' }, sh('button', { class: 'btn sm ghost', onclick: () => { CP.S.lang = CP.S.lang === 'ar' ? 'en' : 'ar'; CP.saveSettings(); CP.UI.applyLang(); this.menu(); } }, CP.lang === 'ar' ? 'English' : 'العربية'), sh('button', { class: 'btn sm ghost', onclick: () => CP.UI.quickMenu() }, '🔊 ' + CP.t('qm_music'))),
    sh('div', { class: 'foot' }, sh('div', null, CP.t('credit')), sh('div', null, CP.t('fictionNote')), sh('div', null, 'v' + CP.VERSION)));
  e.append(cv, sh('div', { class: 'shade' }), mc);
  this.menuScene(cv);
  this._mr = null;
};

/* ---------- service record: ranking, best shifts, medals ---------- */
CP.Screens.record = function (car) {
  car = car || CP.G.career; CP.Prog.ensure(car);
  const e = this.show('record'); e.innerHTML = '';
  const board = CP.Prog.board(car); const me = board.find(x => x.me);
  const lst = sh('div', { class: 'board scroll' });
  for (const b of board) lst.appendChild(sh('div', { class: 'brow' + (b.me ? ' me' : ''), html: `<span class="bp">${CP.num(b.pos)}</span>${CP.Prog.badge(b.rank, 30)}<span class="bn">${CP.L(b.name)}</span><span class="small muted">${CP.Prog.rankName(b.rank)}</span><b>${CP.num(b.xp)}</b>` }));
  const best = sh('div', { class: 'col' }, ...(car.records.length ? car.records.map(r => sh('div', { class: 'note', html: `<div class="h"><span class="stars">${'★'.repeat(r.stars)}<i>${'★'.repeat(3 - r.stars)}</i></span><b>${CP.num(r.score)}</b><span class="small muted">${CP.t('br_shift', { n: CP.num(r.no) })} • ${CP.t('loc_' + r.loc)} • +${CP.num(r.xp)} ${CP.t('pr_xp')}</span></div>` })) : [sh('div', { class: 'muted' }, CP.t('rp_noCases'))]));
  const med = sh('div', { class: 'medals' }, ...Object.entries(CP.Prog.ACH).map(([id, a]) => sh('div', { class: 'md' + (car.ach[id] ? ' got' : ''), title: CP.L(a.d) }, sh('div', { class: 'mi' }, a.i), sh('b', null, CP.L(a.t)), sh('span', { class: 'small muted' }, CP.L(a.d)))));
  e.appendChild(sh('div', { class: 'inner col', style: 'gap:14px' }, sh('h1', null, '🏆 ' + CP.t('pr_record')), this.rankCard(car),
    sh('div', { class: 'grid2' }, sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('pr_board') + ' — ' + CP.t('pr_position', { n: CP.num(me.pos), t: CP.num(board.length) })), lst),
      sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('pr_best')), best)),
    sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('pr_medals') + ' ' + CP.num(Object.keys(car.ach).length) + '/' + CP.num(Object.keys(CP.Prog.ACH).length)), med),
    sh('button', { class: 'btn pri', onclick: () => this.menu() }, CP.t('back'))));
};

/* ---------- briefing ---------- */
CP.Screens.briefing = function () {
  const G = CP.G; const e = this.show('briefing'); e.innerHTML = '';
  const tier = CP.tier(); this.loc = this.loc || 'cairo';
  const locCard = (loc) => {
    const L = CP.LOCS[loc]; const cv = document.createElement('canvas'); cv.width = 400; cv.height = 200; const ctx = cv.getContext('2d');
    if (L.bg.day) {
      const d = CP.A.img[L.bg.day], n = CP.A.img[L.bg.night];
      if (d) ctx.drawImage(d, 0, d.height * 0.05, d.width, d.width / 2, 0, 0, 400, 200);
      if (n) { ctx.save(); ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(400, 0); ctx.lineTo(400, 200); ctx.lineTo(170, 200); ctx.closePath(); ctx.clip(); ctx.drawImage(n, 0, n.height * 0.05, n.width, n.width / 2, 0, 0, 400, 200); ctx.restore(); }
    } else { const im = CP.A.img[L.bg.single]; if (im) ctx.drawImage(im, 0, im.height * 0.1, im.width, im.width / 2, 0, 0, 400, 200); }
    return sh('button', { class: 'loc' + (this.loc === loc ? ' on' : ''), 'aria-pressed': this.loc === loc ? 'true' : 'false', onclick: () => { this.loc = loc; this.briefing(); } }, cv, sh('div', { class: 'd' }, sh('b', null, CP.t('loc_' + loc)), sh('div', { class: 'small muted' }, CP.t('loc_' + loc + '_d'))));
  };
  const unl = []; for (let i = 1; i <= Math.min(6, tier); i++) unl.push(sh('div', { class: 'row' }, sh('span', { class: 'tag ' + (i === tier ? 'am' : '') }, CP.num(i)), CP.t('unl_' + i)));
  const tut = !G.career.tutorialDone && G.mode !== 'free';
  const lens = [12, 15, 18];
  e.appendChild(sh('div', { class: 'inner col', style: 'gap:14px' },
    sh('div', { class: 'row' }, sh('div', { class: 'lbl' }, CP.t('br_title')), sh('span', { class: 'tag am' }, G.mode === 'free' ? CP.t('m_free') : CP.t('br_shift', { n: CP.num(G.career.shiftNo) }))),
    sh('h1', { style: 'margin:0' }, CP.t('br_location')), sh('div', { class: 'locs' }, ...CP.LOC_ORDER.map(locCard)),
    sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('br_tod')), sh('div', { class: 'seg' }, ...['auto', 'dusk', 'night', 'dawn', 'day'].map(k => sh('button', { class: (CP.S.tod || 'auto') === k ? 'on' : '', onclick: () => { CP.S.tod = k; CP.saveSettings(); this.briefing(); } }, CP.t('tod_' + k)))), sh('div', { class: 'small muted' }, CP.t('tod_hint', { t: CP.t('tod_' + CP.todOf(G.career.shiftNo)) }))),
    sh('div', { class: 'grid2' },
      sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('br_unlocks')), ...unl, tut ? sh('div', { class: 'notice' }, CP.t('br_tutorial')) : null),
      sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('set_shift')), sh('div', { class: 'seg' }, ...lens.map(n => sh('button', { class: CP.S.shiftMin === n ? 'on' : '', onclick: () => { CP.S.shiftMin = n; CP.saveSettings(); this.briefing(); } }, CP.t('set_min', { n: CP.num(n) })))),
        sh('div', { class: 'small muted' }, CP.t('br_length', { n: CP.num(CP.S.shiftMin) })), sh('div', { class: 'notice' }, CP.t('br_tip')))),
    sh('div', { class: 'row' }, sh('button', { class: 'btn pri', style: 'min-width:220px', onclick: () => CP.Main.startShift(this.loc) }, '▶ ' + CP.t('br_start')), sh('button', { class: 'btn', onclick: () => this.menu() }, CP.t('rp_menu')))));
};

/* ---------- report & upgrades ---------- */
CP.Screens.report = function (rep) {
  const G = CP.G, s = G.shift; const e = this.show('report'); e.innerHTML = '';
  CP.Main.stop(); CP.Audio.stopAll(); CP.UI.close();
  const barRow = (k, v) => sh('div', { class: 'card col' }, sh('div', { class: 'small muted' }, CP.t(k)), sh('b', { style: 'font-size:1.5em' }, CP.num(v)), sh('div', { class: 'bar' }, sh('i', { style: 'width:' + v + '%' })));
  const cases = sh('div', { class: 'cases' });
  if (!rep.cases.length) cases.appendChild(sh('div', { class: 'muted' }, CP.t('rp_noCases')));
  for (const c of rep.cases) {
    const ev = c.res && c.res.eval; const why = sh('div', { class: 'small hidden', style: 'margin-top:6px;white-space:pre-line' }, ev ? ev.notes.map(n => '• ' + CP.L(n)).join('\n') : CP.t('rp_unresolved'));
    const dec = c.res ? (c.res.decision === 'waved' ? CP.t('res_waved') : c.res.decision === 'escaped' ? CP.t('rp_escaped') : CP.t('res_' + c.res.decision)) : CP.t('rp_unresolved');
    const cls = !ev ? 'bad' : ev.escaped ? 'warn' : ev.waved ? (ev.sound ? '' : 'bad') : ev.dec >= 90 ? 'ok' : ev.dec >= 60 ? 'am' : 'bad';
    cases.appendChild(sh('div', { class: 'case' }, sh('div', { class: 'top' }, sh('span', { class: 'tag am' }, c.id), sh('b', null, CP.t('v_' + c.type)), sh('span', { class: 'small muted' }, CP.L(CP.famName[c.fam])), sh('span', { class: 'tag ' + cls }, dec), ev && ev.dec != null && !ev.waved ? sh('span', { class: 'small' }, CP.num(Math.round(ev.dec))) : null,
      sh('button', { class: 'btn sm ghost', style: 'margin-inline-start:auto', onclick: () => why.classList.toggle('hidden') }, CP.t('rp_why'))), why));
  }
  const ups = G.career.updates.filter(u => u.shift <= s.no).slice(-6).reverse();
  const upg = sh('div', { class: 'upg' });
  const upIcon = { lighting: 'floodlight', radio: 'radio', supplies: 'screening_kit', partner: 'officer_idle', bay: 'canopy' };
  const renderUpg = () => {
    upg.innerHTML = '';
    for (const k in CP.UPG) {
      const lv = G.career.upgrades[k], U = CP.UPG[k]; const max = lv >= U.max; const cost = max ? 0 : U.cost[lv];
      upg.appendChild(sh('div', { class: 'card' }, sh('div', { class: 'row' }, CP.A.thumb(upIcon[k], 54, 54), sh('div', { class: 'col', style: 'gap:0' }, sh('b', null, CP.t('up_' + k)), sh('span', { class: 'small muted' }, CP.t('up_lvl', { n: CP.num(lv) }) + ' / ' + CP.num(U.max)))), sh('div', { class: 'small muted' }, CP.t('up_' + k + '_d')),
        sh('button', { class: 'btn sm' + (max ? '' : ' pri'), 'aria-disabled': max || G.career.credits < cost ? 'true' : 'false', onclick: () => { const r = CP.Career.buy(k); if (r) CP.UI.toast(CP.t(r), 'warn'); else { CP.UI.toast(CP.t('up_' + k) + ' ✓', 'ok'); renderUpg(); document.getElementById('credN').textContent = CP.t('rp_credits', { n: CP.num(G.career.credits) }); } } }, max ? CP.t('up_max') : CP.t('up_buy', { c: CP.num(cost) }))));
    }
  };
  renderUpg();
  const fmtW = sec => CP.num(CP.fmtTime(sec));
  e.appendChild(sh('div', { class: 'inner col', style: 'gap:16px' },
    sh('div', { class: 'row', style: 'align-items:flex-end;gap:20px' }, sh('div', null, sh('div', { class: 'lbl' }, CP.t('rp_title') + ' — ' + CP.t('br_shift', { n: CP.num(s.no) })), sh('div', { class: 'score' }, CP.num(rep.score)), sh('div', { class: 'small muted' }, CP.t('rp_score'))),
      sh('div', { class: 'kv', style: 'flex:1' }, ...[['rp_vehicles', rep.handled], ['rp_checked', rep.checked], ['rp_waved', rep.waved], ['rp_correct', rep.sound], ['rp_complaints', rep.complaints], ['rp_trust', rep.trust]].map(([k, v]) => sh('div', null, sh('span', { class: 'small muted' }, CP.t(k)), sh('b', null, CP.num(v)))), sh('div', null, sh('span', { class: 'small muted' }, CP.t('rp_wait')), sh('b', null, fmtW(rep.avgWait))))),
    sh('div', { class: 'sub' }, barRow('rp_decision', rep.D), barRow('rp_proportion', rep.P), barRow('rp_safety', rep.S), barRow('rp_comm', rep.C)),
    sh('div', { class: 'lbl' }, CP.t('rp_cases')), cases,
    ups.length ? sh('div', { class: 'col' }, sh('div', { class: 'lbl' }, CP.t('rp_updates')), ...ups.map(u => sh('div', { class: 'note' }, CP.L(u.text)))) : null,
    G.mode === 'career' ? sh('div', { class: 'col' }, sh('div', { class: 'row' }, sh('div', { class: 'lbl' }, CP.t('rp_upgrades')), sh('span', { class: 'tag am', id: 'credN' }, CP.t('rp_credits', { n: CP.num(G.career.credits) })), sh('span', { class: 'small muted' }, CP.t('rp_credit', { n: CP.num(rep.credits) }))), upg) : null,
    sh('div', { class: 'row' }, G.mode === 'career' ? sh('button', { class: 'btn pri', onclick: () => { CP.Career.nextShift(); this.briefing(); } }, CP.t('rp_next') + ' ▶') : sh('button', { class: 'btn pri', onclick: () => { CP.G.shift = null; CP.save(); this.briefing(); } }, CP.t('rp_next') + ' ▶'), sh('button', { class: 'btn', onclick: () => { if (G.mode !== 'free') CP.Career.nextShift(); else { CP.G.shift = null; CP.save(); } this.menu(); } }, CP.t('rp_menu')))));
  const inner = e.querySelector('.inner'); if (rep.prog && inner) inner.prepend(this.progBlock(rep.prog));
  if (inner && rep.daily) inner.prepend(sh('div', { class: 'card row dailycard' }, sh('b', null, '📅 ' + CP.t('daily_title')), sh('span', { class: 'tag am' }, CP.t('daily_best', { n: CP.num(rep.daily.best) })), rep.daily.streak > 1 ? sh('span', { class: 'tag warn' }, CP.t('daily_streak', { n: CP.num(rep.daily.streak) })) : null));
  if (inner && rep.prog && rep.prog.rankUp) { const nl = CP.LOC_ORDER.filter(k => CP.LOC_RANK[k] > rep.prog.r0 && CP.LOC_RANK[k] <= rep.prog.r1); if (nl.length) inner.prepend(sh('div', { class: 'card newloc' }, ...nl.map(k => sh('div', null, CP.t('map_new', { l: CP.t('loc_' + k) }))))); }
};

/* animated progression summary: stars, XP count-up, rank bar, promotion, medals, ranking movement */
CP.Screens.progBlock = function (P) {
  const R = CP.Prog.RANKS;
  const stars = sh('div', { class: 'bigstars' }, ...[0, 1, 2].map(i => sh('span', { class: 'st' + (i < P.stars ? ' on' : ''), style: `animation-delay:${0.25 + i * 0.35}s` }, '★')));
  const xpN = sh('b', { class: 'xpcount' }, '+0');
  const bd = sh('div', { class: 'xpbd' }, ...[['pr_bd_cases', P.caseXp], ['pr_bd_score', P.scoreXp], ['pr_bd_stars', P.starXp], ['pr_bd_obj', P.objXp], ['pr_bd_streak', P.streakXp]].filter(x => x[1] > 0).map(([k, v]) => sh('div', null, sh('span', null, CP.t(k)), sh('b', null, '+' + CP.num(Math.round(v))))));
  const ri0 = P.r0, ri1 = P.r1;
  const pctOf = (xp, ri) => { const nx = R[ri + 1]; return nx ? (xp - R[ri].xp) / (nx.xp - R[ri].xp) * 100 : 100; };
  const barI = sh('i', { style: `width:${pctOf(P.xpBefore, ri0).toFixed(1)}%` });
  const rankLine = sh('div', { class: 'rankline', html: CP.Prog.badge(ri1, 52) });
  const rinfo = sh('div', { class: 'col', style: 'flex:1;gap:4px' }, sh('b', null, CP.Prog.rankName(ri1)), sh('div', { class: 'xpbar big' }, barI), sh('div', { class: 'small muted' }, CP.num(P.xpAfter) + ' ' + CP.t('pr_xp') + (R[ri1 + 1] ? ' • ' + CP.t('pr_next', { n: CP.num(R[ri1 + 1].xp) }) : '')));
  rankLine.appendChild(rinfo);
  const moved = P.pos0 - P.pos1;
  const objs = sh('div', { class: 'col' }, ...P.objs.map(o => sh('div', { class: 'ob' + (o.done ? ' done' : '') }, sh('span', null, o.done ? '✓' : '✗'), sh('span', { class: 'ot' }, CP.L(CP.Prog.OBJ[o.id].t)), sh('span', { class: 'op' }, o.done ? '+' + CP.num(CP.Prog.OBJ[o.id].xp) : ''))));
  const meds = P.ach.length ? sh('div', { class: 'row' }, ...P.ach.map(id => sh('span', { class: 'tag am' }, CP.Prog.ACH[id].i + ' ' + CP.L(CP.Prog.ACH[id].t)))) : null;
  const box = sh('div', { class: 'progblock card' }, sh('div', { class: 'row', style: 'align-items:center;gap:22px' }, stars, sh('div', { class: 'col', style: 'gap:0' }, sh('span', { class: 'lbl' }, CP.t('pr_xpGain')), xpN), bd),
    rankLine, sh('div', { class: 'row' }, sh('span', { class: 'tag' }, CP.t('pr_position', { n: CP.num(P.pos1), t: CP.num(25) })), moved > 0 ? sh('span', { class: 'tag ok' }, '▲ ' + CP.t('pr_moved', { n: CP.num(moved) })) : null, P.bestCombo >= 2 ? sh('span', { class: 'tag warn' }, '🔥 ×' + CP.num(P.bestCombo)) : null),
    sh('div', { class: 'lbl' }, CP.t('pr_objectives')), objs, meds);
  // animations
  const t0 = performance.now(); const dur = 1400;
  const tick = now => { const p = Math.min(1, (now - t0) / dur); xpN.textContent = '+' + CP.num(Math.round(P.total * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  setTimeout(() => { barI.style.transition = 'width 1.4s cubic-bezier(.2,.8,.2,1)'; barI.style.width = (P.rankUp ? 100 : pctOf(P.xpAfter, ri1)).toFixed(1) + '%'; }, 600);
  for (let i = 0; i < P.stars; i++) setTimeout(() => CP.Audio.chime('xp'), 250 + i * 350);
  if (P.rankUp) setTimeout(() => CP.Screens.promotion(ri1), 2000);
  return box;
};
CP.Screens.promotion = function (ri) {
  const m = sh('div', { class: 'promo', onclick: () => m.remove() }, sh('div', { class: 'pc', html: `<div class="lbl">${CP.t('pr_rankUp')}</div>${CP.Prog.badge(ri, 150)}<h1>${CP.Prog.rankName(ri)}</h1><div class="muted">${CP.t('pr_rankUpTo', { r: CP.Prog.rankName(ri) })}</div>` }));
  for (let i = 0; i < 90; i++) m.appendChild(sh('i', { class: 'cf', style: `left:${Math.random() * 100}%;background:hsl(${Math.random() * 360},90%,60%);animation-delay:${Math.random() * 0.8}s;animation-duration:${2 + Math.random() * 2}s` }));
  document.body.appendChild(m); CP.Audio.fanfare(); setTimeout(() => m.remove(), 6500);
};

/* ---------- settings ---------- */
CP.Screens.settings = function (from) {
  this.from = from || this.from; const inGame = from === 'pause';
  const e = this.show('settings', inGame); e.innerHTML = '';
  const S = CP.S; const set = (k, v) => { S[k] = v; CP.saveSettings(); CP.Audio.apply(); if (k === 'lang' || k === 'textSize') { CP.UI.applyLang(); if (CP.G && CP.G.shift && !CP.G.shift.ended) CP.UI.buildGame(); } if (k === 'quality' && CP.R.cv) CP.R.resize(); this.settings(this.from); };
  const seg = (k, opts) => sh('div', { class: 'seg' }, ...opts.map(([v, l]) => sh('button', { class: S[k] === v ? 'on' : '', 'aria-pressed': S[k] === v ? 'true' : 'false', onclick: () => set(k, v) }, l)));
  const onoff = k => seg(k, [[true, CP.t('set_on')], [false, CP.t('set_off')]]);
  const rng = k => { const i = sh('input', { type: 'range', min: 0, max: 1, step: 0.05, 'aria-label': k }); i.value = S[k]; i.addEventListener('input', () => { S[k] = +i.value; CP.saveSettings(); CP.Audio.apply(); }); return i; };
  const io = sh('textarea', { class: 'io', placeholder: CP.t('set_importPaste'), 'aria-label': CP.t('set_import') });
  const file = sh('input', { type: 'file', accept: '.json,application/json', class: 'hidden' });
  file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { io.value = r.result; }; r.readAsText(f); });
  e.appendChild(sh('div', { class: 'inner col', style: 'gap:14px' }, sh('h1', null, CP.t('set_title')),
    sh('div', { class: 'set' },
      sh('div', null, CP.t('set_lang')), seg('lang', [['ar', 'العربية'], ['en', 'English']]),
      sh('div', null, CP.t('set_shift')), seg('shiftMin', [[12, CP.t('set_min', { n: CP.num(12) })], [15, CP.t('set_min', { n: CP.num(15) })], [18, CP.t('set_min', { n: CP.num(18) })]]),
      sh('div', null, CP.t('set_read')), seg('readMode', [['slow', CP.t('set_read_slow')], ['pause', CP.t('set_read_pause')], ['off', CP.t('set_mode_off')]]),
      sh('div', null, CP.t('set_assist')), onoff('assist'),
      sh('div', null, CP.t('set_subs')), onoff('subs'),
      sh('div', null, CP.t('set_fx')), onoff('reducedFx'),
      sh('div', null, CP.t('set_flash')), onoff('reducedFlash'),
      sh('div', null, CP.t('set_text')), seg('textSize', [['small', CP.t('set_small')], ['normal', CP.t('set_normal')], ['large', CP.t('set_large')]]),
      sh('div', null, CP.t('set_quality')), seg('quality', [['high', CP.t('set_q_high')], ['low', CP.t('set_q_low')]]),
      sh('div', null, CP.t('set_master')), rng('master'), sh('div', null, CP.t('qm_music') + ' — Nile Serenity'), sh('div', { class: 'row' }, rng('music'), sh('button', { class: 'btn sm', onclick: () => CP.Audio.music.next() }, CP.t('qm_next'))), sh('div', null, CP.t('set_amb')), rng('amb'), sh('div', null, CP.t('set_sfx')), rng('sfx'),
      sh('div', null, CP.t('qm_cam')), seg('camZoom', [['auto', CP.t('cam_auto')], ['close', CP.t('cam_close')], ['wide', CP.t('cam_wide')]]),
      sh('div', null, CP.t('set_mute')), onoff('mute')),
    sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('set_save')),
      sh('div', { class: 'row' },
        sh('button', { class: 'btn', 'aria-disabled': CP.G ? 'false' : 'true', onclick: () => { if (CP.G && CP.save('manual')) CP.UI.toast(CP.t('sv_saved'), 'ok'); } }, CP.t('set_saveNow')),
        sh('button', { class: 'btn', 'aria-disabled': CP.G ? 'false' : 'true', onclick: () => { if (!CP.G) return; io.value = CP.exportSave(); io.select(); CP.UI.toast(CP.t('sv_exported'), 'ok'); } }, CP.t('set_export')),
        sh('button', { class: 'btn', onclick: () => { io.select(); try { navigator.clipboard.writeText(io.value).then(() => CP.UI.toast(CP.t('set_copied'), 'ok')); } catch (er) { document.execCommand('copy'); } } }, CP.t('set_copy')),
        sh('button', { class: 'btn', 'aria-disabled': CP.G ? 'false' : 'true', onclick: () => { if (!CP.G) return; const b = new Blob([CP.exportSave()], { type: 'application/json' }); const a = sh('a', { href: URL.createObjectURL(b), download: 'checkpoint-night-shift-backup.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, CP.t('set_download'))),
      io, sh('div', { class: 'row' }, sh('button', { class: 'btn', onclick: () => file.click() }, CP.t('set_file')), file,
        sh('button', { class: 'btn pri', onclick: () => { try { const o = CP.importSave(io.value); CP.Main.adopt(o); CP.UI.toast(CP.t('sv_restored'), 'ok'); } catch (er) { CP.UI.toast(CP.t('sv_badFile', { e: er.message }), 'bad'); } } }, CP.t('set_importDo')))),
    sh('div', { class: 'row' }, sh('button', { class: 'btn pri', onclick: () => this.back() }, CP.t('back')))));
};

/* ---------- how to play ---------- */
CP.Screens.how = function (from) {
  this.from = from || this.from; const e = this.show('how', from === 'pause'); e.innerHTML = '';
  e.appendChild(sh('div', { class: 'inner col', style: 'gap:12px' }, sh('h1', null, CP.t('m_how')), sh('div', { class: 'card', html: CP.t('how_body') }),
    sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('how_keys')), sh('div', null, CP.t('k_help')), sh('div', null, CP.t('how_touch'))),
    sh('div', { class: 'card col' }, sh('div', { class: 'lbl' }, CP.t('missingArt')), ...CP.C.missingArt.map(m => sh('div', { class: 'small' }, '• ' + CP.L(m)))),
    sh('div', { class: 'small muted' }, CP.t('fictionNote')), sh('button', { class: 'btn pri', onclick: () => this.back() }, CP.t('back'))));
};

/* ---------- pause ---------- */
CP.Screens.pause = function () {
  if (!CP.G || !CP.G.shift || CP.G.shift.ended) return;
  CP.UI.close(); CP.save('auto'); this.from = 'pause';
  const e = this.show('pause', true); e.innerHTML = ''; e.style.background = 'rgba(10,11,14,.88)';
  e.appendChild(sh('div', { class: 'inner col', style: 'max-width:420px;gap:10px;margin-top:10vh' }, sh('h1', null, CP.t('pause_title')),
    sh('button', { class: 'btn pri', onclick: () => this.resume() }, '▶ ' + CP.t('pause_resume')),
    sh('button', { class: 'btn', onclick: () => this.settings('pause') }, CP.t('pause_settings')),
    sh('button', { class: 'btn', onclick: () => this.how('pause') }, CP.t('m_how')),
    sh('button', { class: 'btn', onclick: () => { CP.save('manual'); this.menu(); } }, CP.t('pause_quit')),
    sh('button', { class: 'btn bad', onclick: () => CP.UI.confirm(CP.t('end_confirm'), () => { this.hideAll(); CP.Main.endShift(); }) }, CP.t('pause_end'))));
};
CP.Screens.resume = function () { this.hideAll(); document.getElementById('game').classList.remove('hidden'); CP.R.resize(); CP.Main.last = performance.now(); };
;(window.CP_FILES = window.CP_FILES || {})['18_screens'] = '2.5.0';
