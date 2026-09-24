/* Cinema FX (v2.8.1)
   - Menu cinematic post-processing: slow camera drift and breathing zoom, letterbox, warm-day / cool-night colour grade,
     lens flares on the floodlights at night, headlight cones and brake lights on traffic, amber beacon on the tow truck,
     film grain and vignette, bigger spike sparks with a heat glow.
   - In-game spikes: any car crossing the raised strip blows its tyres — spark shower with heat glow, tyre smoke trail,
     rim sparks while it limps, screen shake and a squeal.
   - Spike switch in the HUD (🧨): raise / lower the strip at any time; it stays where you put it.
   - Cosmetics redrawn realistically: aviator lenses with gradient and rim, gold shield cap badge with outline and highlight,
     shoulder radio with antenna, clip and screen, body camera with lens ring and LED, braided lanyard with a real whistle. */
CP.addStrings({ sk_on: ['🧨 الشوك مرفوع', '🧨 Spikes UP'], sk_off: ['🧨 الشوك', '🧨 Spikes'], sk_squeal: ['صوت عجل!', 'Tyres!'] });
const CFX = CP.CineFX = { sparks: [], smoke: [] };

/* ---------- in-game spike effects ---------- */
CFX.tyreX = function (v, i) { const V = CP.A.M.vehicles[v.type]; if (!V || !V.axles || !V.axles[i]) return v.x - v.len * (i ? 0.2 : 0.8); const b = CP.A.M.sprites[V.body].rect; return v.x - v.len + (V.axles[i][0] / b[2]) * v.len; };
CFX.burst = function (x, gy, n, h) { for (let i = 0; i < n; i++) CFX.sparks.push({ x, gy, h: h || 0.05, vx: (Math.random() - 0.35) * 6, vy: 1.5 + Math.random() * 5, t: 0, life: 0.45 + Math.random() * 0.5 }); };
CFX.puff = function (x, gy, r) { CFX.smoke.push({ x, gy, h: 0.15, r: r || 0.25, t: 0, vx: -0.4 + Math.random() * 0.3 }); };
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; const dt = 1 / 60;
  for (const v of s.vehicles) { if (!v.spiked) continue; if (!v._sparkT) { v._sparkT = 0; const gy = CP.R.rowY(v.row); CFX.burst(CFX.tyreX(v, 1), gy, 70, 0.08); CFX.burst(CFX.tyreX(v, 0), gy, 50, 0.08); CP.R.shake(9, 0.5); CP.Audio.burst && CP.Audio.ok && CP.Audio.burst(0.6, 0.18, 2200, 1.2); }
    v._sparkT += dt; if (v.v > 0.4 && v.limp) { const gy = CP.R.rowY(v.row); if (Math.random() < 0.7) CFX.puff(CFX.tyreX(v, 1), gy, 0.2 + Math.random() * 0.2); if (Math.random() < 0.35) CFX.burst(CFX.tyreX(v, 1), gy, 2, 0.06); } }
  for (const p of CFX.sparks) { p.t += dt; p.x += p.vx * dt; p.h += p.vy * dt; p.vy -= 16 * dt; if (p.h < 0) { p.h = 0; p.vy *= -0.4; } } CFX.sparks = CFX.sparks.filter(p => p.t < p.life);
  for (const m of CFX.smoke) { m.t += dt; m.x += m.vx * dt; m.r += 0.5 * dt; m.h += 0.6 * dt; } CFX.smoke = CFX.smoke.filter(m => m.t < 1.6);
});
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); const ctx = this.ctx, R = this, ppm = this.ppm; if (!CFX.sparks.length && !CFX.smoke.length) return; ctx.save();
    for (const m of CFX.smoke) { const a = Math.max(0, 0.32 - m.t * 0.2); const cx = R.sx(m.x), cy = R.sy(m.gy) - m.h * ppm; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, m.r * ppm); g.addColorStop(0, `rgba(120,120,125,${a})`); g.addColorStop(1, 'rgba(120,120,125,0)'); ctx.fillStyle = g; ctx.fillRect(cx - m.r * ppm, cy - m.r * ppm, m.r * ppm * 2, m.r * ppm * 2); }
    ctx.globalCompositeOperation = 'lighter'; for (const p of CFX.sparks) { const a = Math.max(0, 1 - p.t / p.life); const cx = R.sx(p.x), cy = R.sy(p.gy) - p.h * ppm; ctx.fillStyle = `rgba(255,${200 - 120 * p.t},80,${a})`; ctx.fillRect(cx, cy, Math.max(1.5, 0.035 * ppm), Math.max(1.5, 0.035 * ppm)); if (a > 0.6) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 0.18 * ppm); g.addColorStop(0, `rgba(255,170,60,${0.25 * a})`); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 0.18 * ppm, cy - 0.18 * ppm, 0.36 * ppm, 0.36 * ppm); } }
    ctx.restore(); }; }
/* ---------- suspension: front/rear springs, excited by the strip (raised or flat) ---------- */
CFX.susp = function (v, dt) { const S = v.susp || (v.susp = { zf: 0, vf: 0, zr: 0, vr: 0, cf: false, cr: false }); const K = 85, C = 9; const X = CP.Spikes ? CP.Spikes.x : -99; const hStrip = 0.06 + 0.2 * (CP.Spikes ? CP.Spikes.up : 0);
  const fx = CFX.tyreX(v, 1), rx = CFX.tyreX(v, 0); const onF = Math.abs(fx - X) < 0.35, onR = Math.abs(rx - X) < 0.35; const sp = Math.min(1.6, Math.abs(v.v) / 3);
  if (onF && !S.cf) S.vf += hStrip * 9 * sp; if (onR && !S.cr) S.vr += hStrip * 9 * sp; S.cf = onF; S.cr = onR;
  S.vf += (-K * S.zf - C * S.vf) * dt; S.zf += S.vf * dt; S.vr += (-K * S.zr - C * S.vr) * dt; S.zr += S.vr * dt; };
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; for (const v of s.vehicles) if (!v.tow) CFX.susp(v, 1 / 60); });
{ const dv = CP.R.drawVeh; CP.R.drawVeh = function (v) { const S = v.susp; if (S && (Math.abs(S.zf) > 0.002 || Math.abs(S.zr) > 0.002)) { const sh = v.heave, sp = v.pitch; v.heave = (v.heave || 0) - (S.zf + S.zr) / 2; v.pitch = (v.pitch || 0) + (S.zr - S.zf) / Math.max(1.5, v.len * 0.6) * 0.9; const r = dv.apply(this, arguments); v.heave = sh; v.pitch = sp; return r; } return dv.apply(this, arguments); }; }
/* ---------- HUD spike switch ---------- */
{ const bg = CP.UI.buildGame; CP.UI.buildGame = function () { const r = bg.apply(this, arguments); const hud = document.getElementById('hud'); if (!hud || document.getElementById('hSpikes') || !CP.Spikes) return r; const b = CP.h('button', { id: 'hSpikes', class: 'btn sm', onclick: () => { const S = CP.Spikes; S.manual = !S.manual; S.deployed = S.manual; S.t = S.manual ? 0 : 99; CP.Audio.click(); b.classList.toggle('on', S.manual); b.textContent = CP.t(S.manual ? 'sk_on' : 'sk_off'); } }, CP.t('sk_off')); const sp = hud.querySelector('.sp'); if (sp) hud.insertBefore(b, sp); else hud.appendChild(b); return r; }; }
CP.bus.on('stepEnd', () => { const S = CP.Spikes; if (!S) return; if (S.manual) S.deployed = true; });
CP.bus.on('shiftStart', () => { if (CP.Spikes) { CP.Spikes.manual = false; CP.Spikes.deployed = false; } });

/* ---------- realistic cosmetics ---------- */
CP.Exp.drawCos = function (ctx, fr, cx, gy, k, flip, hM) {
  const sp = CP.A.M.sprites[fr]; if (!sp) return; const [sx, sy, sw, sh] = sp.rect; const ax = sp.ax ?? 0.5; const hx = sp.hx ?? 0.5, chx = sp.cx ?? 0.5; const EX = CP.Exp;
  const left = cx - (flip ? (1 - ax) : ax) * sw * k, top = gy - sh * k; const fx = d => flip ? -d : d; const H = sp.hRef * k; const headX = left + (flip ? 1 - hx : hx) * sw * k, chestX = left + (flip ? 1 - chx : chx) * sw * k;
  const u = H / 100; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (EX.worn('capgold')) { const bx = headX + fx(2.6 * u), by = top + 4.2 * u; ctx.save(); ctx.translate(bx, by); ctx.scale(fx(1), 1); const g = ctx.createLinearGradient(-1.6 * u, -1.6 * u, 1.6 * u, 1.8 * u); g.addColorStop(0, '#fff1b0'); g.addColorStop(0.5, '#e0a93a'); g.addColorStop(1, '#8a5e12'); ctx.fillStyle = g; ctx.strokeStyle = 'rgba(60,40,5,.8)'; ctx.lineWidth = Math.max(0.5, 0.3 * u); ctx.beginPath(); ctx.moveTo(-1.4 * u, -1.5 * u); ctx.lineTo(1.4 * u, -1.5 * u); ctx.lineTo(1.3 * u, 0.6 * u); ctx.quadraticCurveTo(0, 2.1 * u, -1.3 * u, 0.6 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-0.5 * u, -0.7 * u, 0.5 * u, 0.3 * u, -0.6, 0, 6.283); ctx.fill(); ctx.restore(); }
  if (EX.worn('shades')) { const ey = top + 10.6 * u; ctx.save(); ctx.translate(headX, ey); ctx.scale(fx(1), 1); // facing +x
    const lens = (x0, w) => { const g = ctx.createLinearGradient(x0, -1.3 * u, x0 + w, 1.6 * u); g.addColorStop(0, 'rgba(50,60,80,.95)'); g.addColorStop(0.45, 'rgba(15,18,26,.96)'); g.addColorStop(1, 'rgba(90,110,140,.85)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, -1.2 * u); ctx.lineTo(x0 + w, -1.3 * u); ctx.quadraticCurveTo(x0 + w + 0.2 * u, 1.4 * u, x0 + w * 0.55, 1.9 * u); ctx.quadraticCurveTo(x0 - 0.1 * u, 1.9 * u, x0, -1.2 * u); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d6b25a'; ctx.lineWidth = Math.max(0.4, 0.22 * u); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x0 + w * 0.35, -0.5 * u, w * 0.22, 0.35 * u, -0.3, 0, 6.283); ctx.fill(); };
    lens(0.6 * u, 3.4 * u); lens(-3.0 * u, 3.2 * u); ctx.strokeStyle = '#d6b25a'; ctx.lineWidth = Math.max(0.4, 0.25 * u); ctx.beginPath(); ctx.moveTo(0.2 * u, -0.9 * u); ctx.lineTo(0.6 * u, -0.9 * u); ctx.moveTo(-3.0 * u, -1.0 * u); ctx.lineTo(-5.2 * u, -1.6 * u); ctx.stroke(); ctx.restore(); }
  if (EX.worn('shoulder')) { const x = chestX - fx(5.2 * u), y = top + 23 * u; ctx.save(); ctx.translate(x, y); ctx.scale(fx(1), 1); ctx.fillStyle = '#1c1f26'; ctx.strokeStyle = '#0a0b0e'; ctx.lineWidth = Math.max(0.4, 0.2 * u); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-1.3 * u, 0, 2.6 * u, 5.2 * u, 0.5 * u) : ctx.rect(-1.3 * u, 0, 2.6 * u, 5.2 * u); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2f343d'; ctx.fillRect(-0.9 * u, 0.6 * u, 1.8 * u, 1.5 * u); ctx.fillStyle = '#4fd1ff'; ctx.fillRect(-0.6 * u, 0.9 * u, 1.2 * u, 0.4 * u); ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(0.6, 0.35 * u); ctx.beginPath(); ctx.moveTo(0.6 * u, 0); ctx.lineTo(0.9 * u, -3.4 * u); ctx.stroke(); ctx.fillStyle = '#3a3f48'; ctx.fillRect(-1.5 * u, 2.4 * u, 0.5 * u, 2 * u); ctx.restore(); }
  if (EX.worn('bodycam')) { const x = chestX + fx(2.8 * u), y = top + 30 * u; ctx.save(); ctx.translate(x, y); const g = ctx.createLinearGradient(-1.6 * u, -1.6 * u, 1.6 * u, 1.6 * u); g.addColorStop(0, '#2a2e36'); g.addColorStop(1, '#0d0f13'); ctx.fillStyle = g; ctx.strokeStyle = '#000'; ctx.lineWidth = Math.max(0.4, 0.2 * u); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-1.6 * u, -1.6 * u, 3.2 * u, 3.2 * u, 0.6 * u) : ctx.rect(-1.6 * u, -1.6 * u, 3.2 * u, 3.2 * u); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = Math.max(0.4, 0.25 * u); ctx.beginPath(); ctx.arc(fx(0.3 * u), 0.2 * u, 0.85 * u, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#0a0c10'; ctx.beginPath(); ctx.arc(fx(0.3 * u), 0.2 * u, 0.5 * u, 0, 6.283); ctx.fill(); ctx.fillStyle = (Math.floor(performance.now() / 600) % 2) ? '#ff3b3b' : '#5a1212'; ctx.beginPath(); ctx.arc(fx(-1.0 * u), -1.0 * u, 0.3 * u, 0, 6.283); ctx.fill(); ctx.restore(); }
  if (EX.worn('lanyard')) { ctx.save(); const x0 = chestX - fx(6 * u), y0 = top + 18.5 * u, x1 = chestX + fx(4.5 * u), y1 = top + 34 * u; for (const [c, w, o] of [['#8a5e12', 0.75, 0], ['#e8b84a', 0.45, -0.15]]) { ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.5, w * u); ctx.beginPath(); ctx.moveTo(x0, y0 + o * u); ctx.quadraticCurveTo(chestX + fx(1 * u), top + 27 * u, x1, y1); ctx.stroke(); }
    ctx.translate(x1, y1 + 0.6 * u); const g = ctx.createLinearGradient(-1 * u, -1 * u, 1 * u, 1 * u); g.addColorStop(0, '#f2f2f4'); g.addColorStop(1, '#8a8f99'); ctx.fillStyle = g; ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = Math.max(0.4, 0.2 * u); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-1.3 * u, -0.6 * u, 2.6 * u, 1.2 * u, 0.4 * u) : ctx.rect(-1.3 * u, -0.6 * u, 2.6 * u, 1.2 * u); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(fx(-0.6 * u), 0.9 * u, 0.9 * u, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
};

/* ---------- menu cinematic post-processing ---------- */
CFX.grain = null;
CFX.post = function (ctx, W, H, night, t, flares, beacon) {
  // colour grade
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = night > 0.5 ? `rgba(150,170,215,${0.55 * night})` : `rgba(255,236,205,${0.35 * (1 - night)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  // flares (night) and beacon
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of flares) { const a = f.a * (0.8 + 0.2 * Math.sin(t * 7 + f.x)); const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); g.addColorStop(0, `rgba(255,240,205,${a})`); g.addColorStop(0.3, `rgba(255,220,150,${a * 0.35})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); ctx.strokeStyle = `rgba(255,235,190,${a * 0.5})`; ctx.lineWidth = 1; for (const ang of [0, 0.5, 1.05]) { ctx.beginPath(); ctx.moveTo(f.x - Math.cos(ang) * f.r * 1.8, f.y - Math.sin(ang) * f.r * 0.5); ctx.lineTo(f.x + Math.cos(ang) * f.r * 1.8, f.y + Math.sin(ang) * f.r * 0.5); ctx.stroke(); } }
  if (beacon) { const on = Math.sin(t * 9) > 0; const g = ctx.createRadialGradient(beacon.x, beacon.y, 0, beacon.x, beacon.y, beacon.r); g.addColorStop(0, `rgba(255,170,40,${on ? 0.9 : 0.25})`); g.addColorStop(1, 'rgba(255,170,40,0)'); ctx.fillStyle = g; ctx.fillRect(beacon.x - beacon.r, beacon.y - beacon.r, beacon.r * 2, beacon.r * 2); }
  ctx.restore();
  // vignette + letterbox + grain
  const vg = ctx.createRadialGradient(W * 0.45, H * 0.5, H * 0.35, W * 0.45, H * 0.5, H * 0.95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H * 0.055); ctx.fillRect(0, H * 0.945, W, H * 0.055);
  if (!CFX.grain) { const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); const im = x.createImageData(160, 160); for (let i = 0; i < im.data.length; i += 4) { const v = 100 + Math.random() * 80; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 18; } x.putImageData(im, 0, 0); CFX.grain = ctx.createPattern(c, 'repeat'); }
  ctx.save(); ctx.translate((t * 60) % 160, (t * 37) % 160); ctx.fillStyle = CFX.grain; ctx.fillRect(-160, -160, W + 320, H + 320); ctx.restore();
};
;(window.CP_FILES = window.CP_FILES || {})['40_cinefx'] = '2.8.2';
