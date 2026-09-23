/* Polish (v1.8)
   - Calm ambient particles: sun-lit dust motes by day, drifting embers near the floodlights by night; a few in the menu.
   - Repair is an interaction: a timing bar — tap when the needle is in the green; 3 clean hits finish the job fast and pay XP,
     misses slow it down. Works for the gate motor, the generator and the cones.
   - Panels show the 5 most relevant options first; the rest sit behind one "More" button.
   - Daily reward chest on the menu (claim once a day, grows with the login streak).
   - Responsive: the UI scales its type with the viewport so a phone, a laptop and a 4K screen read the same. */
CP.addStrings({
  po_more: ['المزيد ▾', 'More ▾'], po_less: ['أقل ▴', 'Less ▴'],
  po_fix: ['اضغط لما المؤشر يبقى في الأخضر', 'Tap when the needle is in the green'], po_hit: ['تمام!', 'Nice!'], po_miss: ['فاتك', 'Missed'], po_fixDone: ['اتصلح بسرعة!', 'Fixed fast!'],
  po_chest: ['هدية اليوم', 'Daily reward'], po_claim: ['استلم +{n} خبرة', 'Claim +{n} XP'], po_claimed: ['استلمت هدية النهارده ✓', 'Claimed today ✓'], po_chestSub: ['كل يوم دخول = هدية أكبر', 'Every day you play, the gift grows']
});
CP.Polish = {}; const PO = CP.Polish, ph = CP.h;

/* ---------- ambient particles ---------- */
PO.motes = [];
PO.tickMotes = function (ctx, W, H, t, night, count) {
  if (CP.S.reducedFx) return;
  while (PO.motes.length < count) PO.motes.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.2, s: 4 + Math.random() * 10, ph: Math.random() * 7, a: 0.05 + Math.random() * 0.12 });
  if (PO.motes.length > count) PO.motes.length = count;
  ctx.save();
  for (const m of PO.motes) {
    m.x += Math.sin(t * 0.35 + m.ph) * 0.25 + (night ? 0.08 : 0.15); m.y -= m.s * 0.012 * (night ? 1.6 : 0.6); m.y += Math.cos(t * 0.5 + m.ph) * 0.12;
    if (m.y < -6) { m.y = H + 4; m.x = Math.random() * W; } if (m.x > W + 6) m.x = -4; if (m.x < -6) m.x = W + 4;
    const tw = 0.6 + 0.4 * Math.sin(t * 2.2 + m.ph * 3); ctx.globalAlpha = m.a * tw * (night ? 1.4 : 1);
    ctx.fillStyle = night ? '#ffd9a0' : '#fff7e0'; ctx.shadowColor = night ? '#ffb347' : '#fff'; ctx.shadowBlur = night ? 8 : 4;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (night ? 0.8 : 1), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); PO.tickMotes(this.ctx, this.W, this.H * 0.82, this.t, (this.nightLvl || 0) > 0.5, CP.UI.isMob ? 16 : 30); }; }
// menu: an overlay canvas with a handful of drifting sparks
{ const ms = CP.Screens.menuScene; CP.Screens.menuScene = function (cv) { ms.call(this, cv);
    const ov = ph('canvas', { class: 'bg rv-fx', 'aria-hidden': 'true' }); cv.parentElement.insertBefore(ov, cv.nextSibling); const ctx = ov.getContext('2d'); let run = true; PO.menuMotes = [];
    const loop = (ts) => { if (!document.body.contains(ov)) return; ov.width = ov.clientWidth; ov.height = ov.clientHeight; const sv = PO.motes; PO.motes = PO.menuMotes; PO.tickMotes(ctx, ov.width, ov.height, ts / 1000, true, 22); PO.menuMotes = PO.motes; PO.motes = sv; PO.menuCine(ctx, ov.width, ov.height, ts / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop); }; }

/* cinematic overlay for the menu diorama: drifting ground fog, a soft lens flare from the floodlight, film grain */
PO.menuCine = function (ctx, W, H, t) {
  if (CP.S.reducedFx) return; ctx.save();
  const gx = CP.lang === 'ar' ? W * 0.34 : W * 0.66;
  // ground fog
  for (let i = 0; i < 3; i++) { const y = H * (0.62 + i * 0.09), a = 0.05 - i * 0.012; const g = ctx.createLinearGradient(0, y - 40, 0, y + 40); g.addColorStop(0, 'rgba(200,210,230,0)'); g.addColorStop(0.5, `rgba(200,210,230,${a + 0.02 * Math.sin(t * 0.3 + i)})`); g.addColorStop(1, 'rgba(200,210,230,0)'); ctx.fillStyle = g; ctx.fillRect(0, y - 40, W, 80); }
  // lens flare anchored on the floodlight head (left of the scene)
  const fx = gx - W * 0.235 + Math.sin(t * 0.2) * 3, fy = H * 0.19; ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(fx, fy, 0, fx, fy, W * 0.16); halo.addColorStop(0, 'rgba(255,240,200,.22)'); halo.addColorStop(0.35, 'rgba(255,220,150,.08)'); halo.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = halo; ctx.fillRect(fx - W * 0.16, fy - W * 0.16, W * 0.32, W * 0.32);
  for (let i = 1; i <= 4; i++) { const k = i / 4, px = fx + (W * 0.5 - fx) * k * 1.3, py = fy + (H * 0.5 - fy) * k * 1.3, r = 8 + i * 9; const g = ctx.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(255,200,120,${0.10 - i * 0.015})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill(); }
  ctx.restore();
};

/* ---------- repair skill-check ---------- */
PO.fixTypes = { o_repair: 1, o_generator: 1, o_cones: 1 };
PO.skillCheck = function (task) {
  if (document.getElementById('fixbar')) return; task.rate = 0.45; let hits = 0, tries = 0, pos = 0, dir = 1, last = performance.now(), alive = true;
  const box = ph('div', { id: 'fixbar', role: 'dialog' }, ph('div', { class: 'lbl' }, '🔧 ' + CP.t('po_fix')), ph('div', { class: 'track' }, ph('div', { class: 'zone' }), ph('div', { class: 'needle' })), ph('div', { class: 'dots' }, ph('i'), ph('i'), ph('i')));
  document.getElementById('stage').appendChild(box); const needle = box.querySelector('.needle'), dots = box.querySelectorAll('.dots i');
  const zoneW = PO.zoneW || 0.18, zoneL = 0.3 + Math.random() * (0.6 - zoneW); const zone = box.querySelector('.zone'); zone.style.left = (zoneL * 100) + '%'; zone.style.width = (zoneW * 100) + '%';
  const tap = () => { if (!alive) return; tries++; const ok = pos >= zoneL && pos <= zoneL + zoneW;
    if (ok) { hits++; dots[hits - 1].classList.add('on'); task.t += task.dur * 0.22; task.rate = Math.min(1.8, task.rate + 0.45); CP.Audio.chime('xp'); CP.R.popup(CP.t('po_hit'), null, null, '#8fe3a8'); zone.style.left = ((0.2 + Math.random() * 0.5) * 100) + '%'; }
    else { task.rate = Math.max(0.3, task.rate - 0.1); CP.Audio.chime('bad'); box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 260); }
    if (hits >= 3 || tries >= 6) { end(hits >= 3); } };
  const end = (perfect) => { alive = false; box.remove(); window.removeEventListener('keydown', kd); if (perfect) { task.rate = 2.2; CP.Prog.gain(25, null, null, '#8fe3a8', CP.t('po_fixDone')); CP.R.confetti(20); } };
  const kd = e => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); tap(); } };
  box.addEventListener('pointerdown', e => { e.stopPropagation(); tap(); }); window.addEventListener('keydown', kd);
  const anim = now => { if (!alive) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; pos += dir * dt * 0.9; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } needle.style.left = (pos * 100) + '%';
    const s = CP.G.shift; if (!s || !s.tasks.includes(task)) { end(false); return; } requestAnimationFrame(anim); };
  requestAnimationFrame(anim);
};
CP.bus.on('task', t => { if (t.owner === 'officer' && PO.fixTypes[t.type] && !CP.UI.isMob) setTimeout(() => PO.skillCheck(t), 250); else if (t.owner === 'officer' && PO.fixTypes[t.type]) setTimeout(() => PO.skillCheck(t), 250); });

/* ---------- progressive disclosure in panels ---------- */
{ const rp = CP.UI.renderPanel; CP.UI.renderPanel = function () { const r = rp.apply(this, arguments);
    document.querySelectorAll('#panel .opts').forEach(o => { const b = [...o.children].filter(x => x.tagName === 'BUTTON' && !x.classList.contains('po-more')); if (b.length <= 6 || o.dataset.open) return;
      b.slice(5).forEach(x => x.classList.add('po-hid')); if (!o.querySelector('.po-more')) o.appendChild(ph('button', { class: 'btn ghost po-more', onclick: () => { o.dataset.open = '1'; o.querySelectorAll('.po-hid').forEach(x => x.classList.remove('po-hid')); o.querySelector('.po-more').remove(); } }, CP.t('po_more'))); });
    return r; }; }

/* ---------- daily reward chest ---------- */
PO.chestKey = 'cpns_chest'; PO.chestAmount = car => 40 + 25 * Math.min(10, Math.max(1, car.streak || 1));
PO.chest = function (car) {
  if (!car) return null; const today = CP.Prog.today(); const got = localStorage.getItem(PO.chestKey) === today; const n = PO.chestAmount(car);
  const el = ph('button', { class: 'rv-chest' + (got ? ' got' : ''), 'aria-disabled': got ? 'true' : 'false', onclick: () => { if (localStorage.getItem(PO.chestKey) === today) return; localStorage.setItem(PO.chestKey, today); car.xp += n; if (CP.Guard) CP.Guard.legit('cxp', n); CP.Prog.ensure(car); CP.G = CP.G || CP.loadSaved(); if (CP.G && CP.G.career) { CP.G.career.xp = car.xp; CP.save(); } CP.Audio.fanfare(); el.classList.add('got'); el.querySelector('b').textContent = CP.t('po_claimed'); PO.burst(el); } },
    ph('span', { class: 'rv-ci' }, got ? '🎁' : '🎁'), ph('span', { class: 'rv-ct' }, ph('b', null, got ? CP.t('po_claimed') : CP.t('po_claim', { n: CP.num(n) })), ph('small', null, CP.t('po_chest') + ' • ' + CP.t('po_chestSub'))));
  return el;
};
PO.burst = el => { const r = el.getBoundingClientRect(); for (let i = 0; i < 18; i++) { const s = ph('i', { class: 'rv-spark' }); s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px'; s.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px'); s.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 1100); } };
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { menu.apply(this, arguments); const car = (() => { const s = CP.loadSaved(); return s && s.career; })(); const hero = document.querySelector('.rv-play'); const ch = PO.chest(car); if (hero && ch) hero.parentElement.insertBefore(ch, hero.nextSibling); }; }

/* ---------- responsive type scale ---------- */
PO.fit = () => { const w = window.innerWidth, h = window.innerHeight; const base = Math.min(w / 1440, h / 820); const s = CP.clamp(0.86 + base * 0.32, 0.86, 1.32); document.documentElement.style.setProperty('--ui', s.toFixed(3)); document.documentElement.classList.toggle('wide', w / h > 2); document.documentElement.classList.toggle('short', h < 620); };
window.addEventListener('resize', PO.fit); PO.fit();
;(window.CP_FILES = window.CP_FILES || {})['26_polish'] = '2.3.4';
