/* Experience (v2.7)
   - Cosmetics drawn on the PLAYER officer only, anchored per frame (cap centroid / chest centroid measured for every sprite),
     so they follow every animation row: aviator shades, gold cap badge, shoulder radio, body camera, gold whistle lanyard.
     Shop shows a live preview of the officer wearing what you own and lets you wear/remove each item.
   - Settings reorganised into sections (Sound / Display / Gameplay / Data) with "Reset progress" (confirmed, keeps settings).
   - Coworker removed: the partner at the podium and the bay supervisor are gone with their actions and HUD chip; the
     sergeant (repairs, breakdowns, barrier) stays.
   - Radio sounds: real squelch + band-limited static, no melodic beeps.
   - Quick-flow: the routine runs without artificial waits; "Verify" swaps panels cleanly instead of opening under the papers. */
CP.addStrings({
  ex_sound: ['الصوت', 'Sound'], ex_display: ['العرض', 'Display'], ex_play: ['اللعب', 'Gameplay'], ex_data: ['البيانات', 'Data'],
  ex_reset: ['🗑️ مسح التقدم', '🗑️ Reset progress'], ex_resetQ: ['هتمسح كل التقدم: الرتبة، الفلوس، المتجر، الورديات. الإعدادات بتفضل. متأكد؟', 'This wipes all progress: rank, money, shop, shifts. Settings are kept. Sure?'], ex_resetDone: ['اتمسح التقدم', 'Progress reset'],
  ex_wear: ['البس', 'Wear'], ex_unwear: ['اقلع', 'Remove'], ex_preview: ['المظهر', 'Your look'],
  ec_i_capgold: ['شارة كاب ذهبية', 'Gold cap badge'], ec_i_capgoldD: ['شارة ذهبية لامعة على الكاب', 'A gleaming gold badge on the cap'], ec_i_shoulder: ['لاسلكي كتف', 'Shoulder radio'], ec_i_shoulderD: ['لاسلكي مثبت على الكتف', 'A radio clipped to the shoulder'],
  ec_i_lanyard: ['صفارة بحبل ذهبي', 'Gold whistle lanyard'], ec_i_lanyardD: ['حبل صفارة ذهبي على الصدر', 'A gold lanyard across the chest'], ec_i_shadesD2: ['نضارة أفياتور — بتتلبس فعلاً', 'Aviator shades — actually worn']
});
CP.Exp = {}; const EX = CP.Exp;

/* ---------- cosmetics ---------- */
EX.COS = { shades: 1, capgold: 1, shoulder: 1, bodycam: 1, lanyard: 1 };
EX.worn = k => { const c = CP.G && CP.G.career; return !!(c && c.gear && c.gear[k] && (!c.unworn || !c.unworn[k])); };
EX.drawCos = function (ctx, fr, cx, gy, k, flip, hM) {
  const sp = CP.A.M.sprites[fr]; if (!sp) return; const [sx, sy, sw, sh] = sp.rect; const ax = sp.ax ?? 0.5; const hx = sp.hx ?? 0.5, chx = sp.cx ?? 0.5;
  const left = cx - (flip ? (1 - ax) : ax) * sw * k, top = gy - sh * k; const fx = d => flip ? -d : d;
  const headX = left + (flip ? 1 - hx : hx) * sw * k, chestX = left + (flip ? 1 - chx : chx) * sw * k; const H = sp.hRef * k; // full standing height in px
  ctx.save(); ctx.lineCap = 'round';
  if (EX.worn('capgold')) { ctx.fillStyle = '#e8b84a'; ctx.beginPath(); ctx.arc(headX + fx(0.03 * H), top + 0.042 * H, Math.max(1.2, 0.014 * H), 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(headX + fx(0.026 * H), top + 0.038 * H, Math.max(0.6, 0.005 * H), 0, 6.283); ctx.fill(); }
  if (EX.worn('shades')) { const y = top + 0.108 * H, w = 0.068 * H, h = 0.022 * H; ctx.fillStyle = 'rgba(20,22,30,.92)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(headX + fx(0.005 * H) - (flip ? w : 0), y - h / 2, w, h, h / 2) : ctx.rect(headX + fx(0.005 * H) - (flip ? w : 0), y - h / 2, w, h); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(0.6, 0.004 * H); ctx.beginPath(); ctx.moveTo(headX + fx(0.01 * H), y - h * 0.3); ctx.lineTo(headX + fx(0.05 * H), y - h * 0.3); ctx.stroke(); }
  if (EX.worn('shoulder')) { const x = chestX - fx(0.055 * H), y = top + 0.24 * H; ctx.fillStyle = '#15171c'; ctx.fillRect(x - 0.012 * H, y, 0.024 * H, 0.05 * H); ctx.strokeStyle = '#15171c'; ctx.lineWidth = Math.max(1, 0.006 * H); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 0.04 * H); ctx.stroke(); ctx.fillStyle = '#4fd1ff'; ctx.beginPath(); ctx.arc(x + 0.006 * H, y + 0.012 * H, Math.max(0.6, 0.004 * H), 0, 6.283); ctx.fill(); }
  if (EX.worn('bodycam')) { const x = chestX + fx(0.03 * H), y = top + 0.3 * H; ctx.fillStyle = '#101216'; ctx.fillRect(x - 0.015 * H, y - 0.015 * H, 0.03 * H, 0.03 * H); ctx.fillStyle = (Math.floor(performance.now() / 600) % 2) ? '#ff3b3b' : '#7a1c1c'; ctx.beginPath(); ctx.arc(x + fx(0.006 * H), y - 0.007 * H, Math.max(0.6, 0.0045 * H), 0, 6.283); ctx.fill(); }
  if (EX.worn('lanyard')) { ctx.strokeStyle = '#e8b84a'; ctx.lineWidth = Math.max(0.8, 0.005 * H); ctx.beginPath(); ctx.moveTo(chestX - fx(0.06 * H), top + 0.19 * H); ctx.quadraticCurveTo(chestX + fx(0.01 * H), top + 0.29 * H, chestX + fx(0.045 * H), top + 0.34 * H); ctx.stroke(); ctx.fillStyle = '#d8d8dc'; ctx.beginPath(); ctx.arc(chestX + fx(0.045 * H), top + 0.35 * H, Math.max(0.8, 0.008 * H), 0, 6.283); ctx.fill(); }
  ctx.restore();
};
{ const da = CP.R.drawActor; CP.R.drawActor = function (a, who, alpha) { const r = da.apply(this, arguments); if (who === 'officer' && this.officerScr && CP.G.career && CP.G.career.gear) { const fr = CP.Actors.frameOf(a); const sp = CP.A.M.sprites[fr]; if (sp) { const ppm = this.ppm; const hM = CP.HUMAN.officer * this.depthScale(CP.R.actorY(a.row)); const k = hM * ppm / (sp.hRef || sp.rect[3]); const cx = this.officerScr.x, gy = this.officerScr.y + hM * ppm; EX.drawCos(this.ctx, fr, cx, gy, k, a.dir < 0, hM); } } return r; }; }

/* ---------- shop: cosmetics with preview & wear/remove ---------- */
{ const E = CP.Econ; E.ITEMS.capgold = { price: 1800, rank: 1, cos: true }; E.ITEMS.shoulder = { price: 2200, rank: 2, cos: true }; E.ITEMS.lanyard = { price: 2600, rank: 3, cos: true }; E.ITEMS.shades.cos = true; E.ITEMS.bodycam.cos = true;
  CP.STR.ar.ec_i_shadesD = CP.STR.ar.ec_i_shadesD2; CP.STR.en.ec_i_shadesD = CP.STR.en.ec_i_shadesD2;
  const shop = E.shop; E.shop = function () { shop.apply(this, arguments); const box = document.querySelector('.modal .perks'); if (!box) return; const car = CP.G.career; car.unworn = car.unworn || {};
    const cv = CP.h('canvas', { class: 'ex-prev', width: 260, height: 300 }); const draw = () => { const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height); const fr = CP.Actors.frameFor(0, 'idle', false, 0, 0.3); const sp = CP.A.M.sprites[fr]; if (!sp) return; const k = 270 / sp.hRef; const cx = 130, gy = 292; CP.A.drawGroundedScale(ctx, fr, cx, gy, k, true); EX.drawCos(ctx, fr, cx, gy, k, true, 1); };
    const wearRow = CP.h('div', { class: 'ex-wear' }, ...Object.keys(EX.COS).filter(k => car.gear && car.gear[k]).map(k => CP.h('button', { class: 'btn sm' + (EX.worn(k) ? ' pri' : ''), onclick: () => { car.unworn[k] = !car.unworn[k]; CP.save(); draw(); E.shop(); } }, CP.t('ec_i_' + k) + ' • ' + CP.t(EX.worn(k) ? 'ex_unwear' : 'ex_wear'))));
    const prev = CP.h('div', { class: 'ex-preview' }, CP.h('b', null, CP.t('ex_preview')), cv, wearRow); box.insertBefore(prev, box.children[2] || null); draw(); const icons = { capgold: '🎖️', shoulder: '📟', lanyard: '🎗️' }; const grid = box.querySelector('.perk-grid'); if (grid && !grid.querySelector('.ex-cos')) {
      const item = (k, it) => { const own = !!car.gear[k], ok = CP.Prog.rankOf(car.xp) >= it.rank, can = E.wallet(car) >= it.price; return CP.h('button', { class: 'perk shop ex-cos' + (own ? ' own' : ok ? '' : ' locked'), onclick: () => { if (own) return; if (!ok) { CP.UI.toast(CP.t('ec_rank', { r: CP.Prog.rankName(it.rank) }), 'warn'); return; } if (!can) { CP.UI.toast(CP.t('ec_poor'), 'warn'); return; } E.addMoney(-it.price, true); car.gear[k] = true; CP.save(); CP.Audio.fanfare(); document.querySelector('.modal').remove(); E.shop(); } }, CP.h('span', { class: 'pk-i' }, icons[k]), CP.h('span', { class: 'pk-t' }, CP.h('b', null, CP.t('ec_i_' + k)), CP.h('small', null, CP.t('ec_i_' + k + 'D'))), CP.h('span', { class: 'pk-c' }, own ? CP.t('ec_owned') : ok ? E.fmt(it.price) : CP.t('ec_rank', { r: CP.Prog.rankName(it.rank) }))); };
      grid.appendChild(CP.h('div', { class: 'perk-branch' }, item('capgold', E.ITEMS.capgold), item('shoulder', E.ITEMS.shoulder), item('lanyard', E.ITEMS.lanyard))); } }; }

/* ---------- settings: sections + reset ---------- */
{ const st = CP.Screens.settings; CP.Screens.settings = function (from) { const r = st.apply(this, arguments); const set = document.querySelector('#settings .set'); if (!set || set.dataset.sectioned) return r; set.dataset.sectioned = '1';
    const kids = [...set.children]; const secs = { sound: [], display: [], play: [], data: [] }; const cls = t => /صوت|موسيقى|مؤثرات|Sound|Music|SFX|Volume|Mute|كتم/i.test(t) ? 'sound' : /لغة|خط|جودة|تأثير|زوم|اهتزاز|Language|Text|Quality|Effects|Zoom|Haptic|Flash|Contrast|تباين/i.test(t) ? 'display' : /استيراد|تصدير|حفظ|Import|Export|Save|Backup|نسخ/i.test(t) ? 'data' : 'play';
    for (let i = 0; i < kids.length; i += 2) { const lab = kids[i], ctrl = kids[i + 1]; const t = (lab && lab.textContent) || ''; if (/Nile|المقطوعة|Serenity|Patrol|Track/i.test(t + ' ' + ((ctrl && ctrl.textContent) || ''))) continue; /* no music track names anywhere */ secs[cls(t)].push(lab, ctrl); }
    set.innerHTML = ''; const mk = (key, title) => { const wrap = CP.h('section', { class: 'set-sec' }, CP.h('h3', null, CP.t(title)), CP.h('div', { class: 'set' })); const g = wrap.querySelector('.set'); secs[key].forEach(el => el && g.appendChild(el)); return wrap; };
    set.appendChild(mk('sound', 'ex_sound')); set.appendChild(mk('display', 'ex_display')); set.appendChild(mk('play', 'ex_play')); const data = mk('data', 'ex_data');
    data.appendChild(CP.h('button', { class: 'btn danger', style: 'margin-top:10px', onclick: () => CP.UI.confirm(CP.t('ex_resetQ'), () => { for (const k of ['cpns_save_v1', 'cpns_save_v1_bak', 'cpns_free_v1', 'cpns_free_v1_bak', 'cpns_daily_v1', 'cpns_daily_v1_bak', 'cpns_chest', 'cpns_g2_ban']) { try { localStorage.removeItem(k); } catch (e) { } } CP.G = null; CP.UI.toast(CP.t('ex_resetDone'), 'ok'); CP.Screens.menu(); }) }, CP.t('ex_reset'))); set.appendChild(data); set.classList.add('sectioned'); return r; }; }

/* ---------- coworker removed: partner + bay supervisor ---------- */
{ const da = CP.R.drawActor; CP.R.drawActor = function (a, who) { if (who === 'partner') return; return da.apply(this, arguments); }; }
{ const rd = CP.UI.refreshDock; CP.UI.refreshDock = function () { const r = rd.apply(this, arguments); const d = CP.Act.defs.partner; if (d) { const lab = CP.t(d.label); document.querySelectorAll('#dock .act').forEach(b => { if ((b.textContent || '').indexOf(lab) >= 0) b.remove(); }); } return r; }; }
{ const av = CP.Act.avail; CP.Act.avail = function (id) { if (id === 'partner' || /^p_/.test(String(id))) return { ok: false, reason: '' }; return av.apply(this, arguments); }; }
{ const reset = CP.Staff.reset; CP.Staff.reset = function () { reset.apply(this, arguments); this.list = this.list.filter(m => m.id !== 'sup'); }; }
CP.bus.on('shiftStart', () => { CP.Staff.list = CP.Staff.list.filter(m => m.id !== 'sup'); const hp = document.getElementById('hPartner'); if (hp && hp.parentElement) hp.parentElement.classList.add('hidden'); });
{ const upd = CP.Actors.update; if (upd) CP.Actors.update = function (s, dt) { const r = upd.apply(this, arguments); if (s && s.partner) { s.partner.moving = false; s.partner.task = null; s.partner.target = null; } return r; }; }
document.addEventListener('DOMContentLoaded', () => { const style = document.createElement('style'); style.textContent = '#hPartner, #dock [data-act="partner"], .act.partner { display: none !important; }'; document.head.appendChild(style); });

/* ---------- radio: real squelch + band-limited static ---------- */
CP.Audio.radioSfx = function (kind) { if (!this.ok) return; const t = this.ctx.currentTime; const L = kind === 'long' ? 1.1 : 0.55; this.burst(0.035, 0.3, 1800, 1.2, t); this.burst(0.05, 0.12, 700, 0.9, t + 0.03, 'bandpass'); this.burst(L, 0.075, 2100, 0.35, t + 0.06, 'bandpass'); this.burst(L * 0.7, 0.04, 1200, 0.5, t + 0.1, 'bandpass'); this.burst(0.03, 0.22, 1500, 1.4, t + L + 0.05); };

/* ---------- quick-flow tuning ---------- */
if (CP.Logic) { const orig = CP.Logic.strip; }
{ const bt = CP.bus.on; }
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('#flowStrip .btn.ask'); if (!b || !/📻/.test(b.textContent)) return; e.stopPropagation(); e.preventDefault(); const a = CP.Act.avail('radio'); if (!a.ok) { CP.UI.toast(a.reason, 'warn'); return; } if (CP.UI.panel && CP.UI.panel.kind !== 'radio') CP.UI.close(); setTimeout(() => CP.Act.run('radio'), 30); }, true);
;(window.CP_FILES = window.CP_FILES || {})['38_experience'] = '2.8.2';
