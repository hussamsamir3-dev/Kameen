/* Polish 2 (v2.2)
   - Shift clarity: a progress bar under the HUD with elapsed %, time left, cases closed, and "what happens next";
     heads-up at 5 minutes and 1 minute, and the report explains the shift ended.
   - Dialogue: a question disappears once asked; the driver never repeats the same line twice in a row.
   - 20 new driver portraits (37–56) with gender/age so cases pick from 56 faces.
   - Environment particles by location: sand streaks in the desert, sea sparkle in Alexandria/Hurghada, warm haze in Cairo/Luxor/Aswan.
   - Shop effects: body camera, tow contract, speed radar, surveillance drone, aviator shades, custom siren. */
CP.addStrings({
  p2_shift: ['الوردية', 'Shift'], p2_left: ['باقي {t}', '{t} left'], p2_cases: ['{n} قضية', '{n} cases'], p2_next: ['بعدها: تقرير الوردية والمرتب', 'Then: shift report & payslip'],
  p2_five: ['⏰ باقي ٥ دقايق على نهاية الوردية — خلّص اللي في إيدك', '⏰ 5 minutes to the end of the shift — wrap up what you have'], p2_one: ['⏰ آخر دقيقة! أي عربية لسه واقفة هتتسلم للوردية الجاية', '⏰ Final minute! Anything still stopped hands over to the next shift'],
  p2_ended: ['انتهت الوردية — التقرير والمرتب جاهزين', 'Shift over — report and payslip are ready'],
  p2_radar: ['📡 رادار: {v} مسرعة — مخالفة تلقائية +١٢٠ ج.م', '📡 Radar: {v} speeding — auto citation +120 EGP'], p2_drone: ['🛸 الدرون: العربية الجاية {f}', '🛸 Drone: next car looks like {f}']
});
CP.P2 = {}; const PZ = CP.P2, p2h = CP.h;

/* ---------- shift progress ---------- */
PZ.bar = function () { let el = document.getElementById('shiftbar'); if (el) return el; const hud = document.getElementById('hud'); if (!hud) return null; el = p2h('div', { id: 'shiftbar' }, p2h('div', { class: 'sb-track' }, p2h('i', { class: 'sb-fill' }), p2h('i', { class: 'sb-mark', style: 'left:83%' })), p2h('div', { class: 'sb-text' }, p2h('span', { class: 'sb-l' }), p2h('span', { class: 'sb-m' }), p2h('span', { class: 'sb-r' }))); const stage = document.getElementById('stage'); (stage || hud.parentElement).appendChild(el); return el; };
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; PZ.t = (PZ.t || 0) + 1; if (PZ.t % 30) return; const el = PZ.bar(); if (!el) return; const p = CP.clamp(s.t / s.dur, 0, 1); el.querySelector('.sb-fill').style.width = (p * 100).toFixed(1) + '%'; const done = Object.values(s.cases).filter(c => c.res).length;
  el.querySelector('.sb-l').textContent = CP.t('p2_shift') + ' ' + CP.num(Math.round(p * 100)) + '%'; el.querySelector('.sb-m').textContent = CP.t('p2_left', { t: CP.fmtTime(Math.max(0, s.dur - s.t)) }) + ' • ' + CP.t('p2_cases', { n: CP.num(done) }); el.querySelector('.sb-r').textContent = p > 0.85 ? CP.t('p2_next') : (s.events.sprint ? '⏱ ×2' : '');
  el.classList.toggle('late', s.dur - s.t < 300);
  if (!s.events.p2five && s.dur - s.t <= 300) { s.events.p2five = true; CP.UI.banner(CP.t('p2_five'), 'info'); CP.Audio.chime('obj'); }
  if (!s.events.p2one && s.dur - s.t <= 60) { s.events.p2one = true; CP.UI.banner(CP.t('p2_one'), 'warn'); CP.Audio.chime('obj'); }
});
{ const rep = CP.Screens.report; CP.Screens.report = function () { const out = rep.apply(this, arguments); setTimeout(() => CP.UI.toast(CP.t('p2_ended'), 'ok'), 400); return out; }; }

/* ---------- dialogue: no repeated questions / lines ---------- */
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c, intent, tone) { const r = ask.apply(this, arguments); (c.k.asked = c.k.asked || {})[intent] = (c.k.asked[intent] || 0) + 1; return r; }; }
{ const say = CP.Dlg.say; CP.Dlg.say = function (c, who, text) { const key = who + ':' + (typeof text === 'string' ? text : CP.L(text)); c._lastSaid = c._lastSaid || []; if (c._lastSaid.indexOf(key) >= 0) return; c._lastSaid.push(key); if (c._lastSaid.length > 6) c._lastSaid.shift(); return say.apply(this, arguments); }; }
{ const rp = CP.UI.renderPanel; CP.UI.renderPanel = function () { const r = rp.apply(this, arguments); const p = CP.UI.panel; if (!p || p.kind !== 'dialogue') return r; const c = CP.G.shift.cases[p.caseId]; if (!c || !c.k.asked) return r;
    document.querySelectorAll('#panel .opts button').forEach(b => { const t = (b.textContent || '').replace(/^[٠-٩0-9]+\s*/, '').trim(); if (!t || b.classList.contains('po-more')) return; for (const i in c.k.asked) { const lab = CP.STR[CP.lang] && CP.STR[CP.lang]['i_' + i]; if (lab && (Array.isArray(lab) ? lab : [lab]).some(x => String(x).trim() === t) && c.k.asked[i] >= 1 && !/more|المزيد/.test(t)) b.classList.add('asked'); } });
    return r; }; }

/* ---------- portraits 37–56 ---------- */
PZ.portraits = () => { if (!CP.A.M || PZ._por) return; PZ._por = true; const meta = [['m', 'young'], ['f', 'young'], ['m', 'mid'], ['f', 'mid'], ['m', 'old'], ['f', 'mid'], ['m', 'young'], ['f', 'young'], ['m', 'mid'], ['f', 'old'], ['f', 'young'], ['m', 'old'], ['f', 'young'], ['m', 'young'], ['f', 'mid'], ['m', 'old'], ['f', 'young'], ['m', 'mid'], ['f', 'old'], ['m', 'mid']];
  meta.forEach(([g, age], i) => { if (CP.A.M.sprites['portrait_' + (37 + i)]) CP.C.portraits[37 + i] = { g, age }; }); };
CP.bus.on('shiftStart', PZ.portraits); setTimeout(PZ.portraits, 3000);

/* ---------- environment particles by location ---------- */
{ const tick = CP.Polish.tickMotes; CP.Polish.tickMotes = function (ctx, W, H, t, night, count) { tick.call(this, ctx, W, H, t, night, count); if (CP.S.reducedFx || !CP.G || !CP.G.shift || ctx !== CP.R.ctx) return; const loc = CP.G.shift.loc || ''; const R = CP.R;
    PZ.env = PZ.env || []; const kind = /desert|sinai/.test(loc) ? 'sand' : /alex|hurghada/.test(loc) ? 'sea' : 'haze'; const n = CP.UI.isMob ? 10 : 22;
    while (PZ.env.length < n) PZ.env.push({ x: Math.random() * W, y: Math.random() * H, s: 20 + Math.random() * 60, ph: Math.random() * 9, a: 0.04 + Math.random() * 0.08, l: 10 + Math.random() * 30 });
    ctx.save();
    for (const e of PZ.env) {
      if (kind === 'sand') { e.x += (e.s * 0.06 + 1.5) * 0.4; e.y += Math.sin(t * 0.7 + e.ph) * 0.25; if (e.x > W + 40) { e.x = -40; e.y = H * (0.3 + Math.random() * 0.6); } ctx.globalAlpha = e.a * 1.6; ctx.strokeStyle = night ? '#c9b48a' : '#e8d6a8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - e.l, e.y + 1); ctx.stroke(); }
      else if (kind === 'sea') { const sy = H * 0.14 + (e.ph % 1) * H * 0.14; const tw = Math.max(0, Math.sin(t * 3 + e.ph * 4)); ctx.globalAlpha = e.a * 2.4 * tw; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((e.x + t * 4) % W, sy, 1 + tw, 0, 6.283); ctx.fill(); }
      else { e.x += 0.12; e.y -= 0.05; if (e.x > W + 60) e.x = -60; if (e.y < -60) e.y = H; const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.s); g.addColorStop(0, `rgba(255,220,170,${e.a * (night ? 0.5 : 0.8)})`); g.addColorStop(1, 'rgba(255,220,170,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(e.x - e.s, e.y - e.s, e.s * 2, e.s * 2); }
    }
    ctx.restore(); }; }

/* ---------- shop effects ---------- */
const own = k => CP.Econ && CP.Econ.own(k);
// shades: driver patience
CP.bus.on('spawn', v => { const c = CP.G.shift.cases[v.caseId]; if (c && own('shades')) c.patience = Math.min(100, c.patience + 8); });
// body camera: complaints from grounded searches are dropped
{ const mail = () => CP.G.shift && CP.G.shift.events.mail; CP.bus.on('stepEnd', () => { const m = mail(); if (!m || !own('bodycam') || !m.cmp.length) return; const s = CP.G.shift; const grounded = Object.values(s.cases).some(c => c.k.searchReason && CP.Cases.searchReasonValid(c, c.k.searchReason)); if (grounded && m.cmp.length > (m._bc || 0)) { m.cmp.pop(); m._bc = m.cmp.length; } }); }
// speed radar: auto-citation for fast approaching cars
CP.bus.on('spawn', v => { if (!own('radar') || Math.random() > 0.22) return; v._radar = true; });
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s) return; for (const v of s.vehicles) { if (!v._radar || v._radarDone || v.x < CP.W.marker - 12 || v.x > CP.W.marker - 4) continue; v._radarDone = true; const V = CP.C.veh[v.type]; CP.Econ.addMoney(120); CP.UI.banner(CP.t('p2_radar', { v: CP.L({ ar: V.colour[0] + ' ' + V.make[0], en: V.colour[1] + ' ' + V.make[1] }) }), 'info'); CP.R.popup('📡', v.x - v.len / 2, CP.R.rowY(v.row) + 3, '#8fd3ff'); } });
// drone: hint at the next car's family
CP.bus.on('spawn', v => { if (!own('drone')) return; const c = CP.G.shift.cases[v.caseId]; if (!c || v.x > 0) return; setTimeout(() => { if (CP.G.shift && CP.G.shift.cases[c.id]) CP.UI.toast(CP.t('p2_drone', { f: CP.L(CP.FAM_NAMES && CP.FAM_NAMES[c.fam] || { ar: c.fam, en: c.fam }) }), 'info'); }, 1200); });
// custom siren on warrant arrests
{ const bn = CP.UI.banner; CP.UI.banner = function (text, kind) { if (own('siren') && /🚨/.test(String(text)) && CP.Audio.ok) { const t = CP.Audio.ctx.currentTime; for (let i = 0; i < 4; i++) { CP.Audio.tone('sawtooth', 620 + (i % 2) * 260, 0.22, 0.03, t + i * 0.25); } } return bn.apply(this, arguments); }; }

/* ---------- tuk-tuks on the main road: violation ---------- */
CP.addStrings({
  tk_note: ['توك توك على الطريق الرئيسي — ممنوع قانوناً: مخالفة كبيرة وتحفظ على المركبة', 'Tuk-tuk on the main road — illegal: heavy fine and impound the vehicle'],
  tk_line: ['يا باشا الطريق قصير، مش هاخد غير كيلو واحد على الرئيسي…', 'Officer it is a short hop, only one kilometre on the main road…'],
  tk_fine: ['مخالفة توك توك على الطريق الرئيسي +٥٠٠ ج.م وتحفظ', 'Tuk-tuk on the main road: fine +500 EGP and impound'], tk_let: ['عدّيت توك توك على الطريق الرئيسي — ده ممنوع', 'You let a tuk-tuk onto the main road — that is illegal'],
  ft_r_tuktuk: ['التوك توك ممنوع على الطريق الرئيسي: مخالفة + تحفظ', 'Tuk-tuks are banned from the main road: fine + impound']
});
CP.bus.on('spawn', v => { if (v.type !== 'tuktuk') return; const c = CP.G.shift.cases[v.caseId]; if (!c) return; c.flags = c.flags || {}; c.flags.tuktuk = true; (c.cues = c.cues || []).push('tuktuk'); CP.note(c, 'observation', CP.fill([CP.STR.ar.tk_note, CP.STR.en.tk_note]), 'verified'); });
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c) { const r = ask.apply(this, arguments); if (c.flags && c.flags.tuktuk && !c._tkLine) { c._tkLine = true; CP.Dlg.say(c, 'driver', CP.t('tk_line')); } return r; }; }
CP.bus.on('caseClosed', c => {
  if (!c.flags || !c.flags.tuktuk || !c.res) return; const s = CP.G.shift; const v = CP.vehOfCase(c); const vx = v ? v.x - v.len / 2 : null, vy = v ? CP.R.rowY(v.row) + 3.2 : null;
  if (['citation', 'hold', 'handover', 'refer_admin'].indexOf(c.res.decision) >= 0) { CP.Prog.gain(70, vx, vy, '#ffd35a', '🛺'); CP.Econ.addMoney(500); CP.UI.banner(CP.t('tk_fine'), 'ok'); CP.R.stamp(CP.t('pr_citation') || 'مخالفة', '#ff9a4a'); }
  else { s.prog.xp = Math.max(0, s.prog.xp - 60); CP.R.popup('−60 ' + CP.t('pr_xp'), vx, vy, '#ff6a6a'); s.prog.combo = 0; CP.G.career.trust = CP.clamp(CP.G.career.trust - 2, 0, 100); CP.UI.banner(CP.t('tk_let'), 'warn'); CP.Audio.chime('bad'); (s.events.mail = s.events.mail || { cmp: [], cmd: [] }).cmp.push(CP.t('tk_let')); }
});
if (CP.Feat && CP.Feat.RULES) CP.Feat.RULES.tuktuk = { cond: c => !!(c.flags && c.flags.tuktuk), ok: c => ['citation', 'hold', 'handover', 'refer_admin'].indexOf(c.res.decision) >= 0, s: 'ft_r_tuktuk' };
if (CP.C.veh.tuktuk) CP.C.veh.tuktuk.w = { cairo: 3, alex: 2, sinai: 0, hurghada: 1, luxor: 2, aswan: 2, desert: 0 };
;(window.CP_FILES = window.CP_FILES || {})['32_polish2'] = '2.2.3';
