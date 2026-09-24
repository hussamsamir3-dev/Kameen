/* Logic (v2.6)
   - Dialogue consistency: what a driver says must match the vehicle and who is in it. A motorbike carries at most a
     pillion, never "my wife and the kids"; a tuk-tuk/taxi/microbus carries fares; a van/pickup/truck carries a colleague
     or nobody; a delivery bike is delivering an order; a truck is delivering goods. Answers are rewritten accordingly.
   - Repair timer drawn above the item being repaired (arc + seconds left); the extra dashed ring is gone — only the
     game's own pulsing marker remains, and it still opens the repair popover.
   - Resume: an unfinished daily or free shift is offered on the menu as "Continue" too, not only career shifts.
   - Version chip in the HUD so the loaded build is always visible. */
CP.addStrings({
  lg_pillion_m: ['ده أخويا يا باشا، راكب ورايا.', 'That is my brother, officer, riding pillion.'], lg_pillion_f: ['دي أختي يا باشا.', 'That is my sister, officer.'],
  lg_alone: ['لوحدي يا باشا.', 'Just me, officer.'], lg_colleague: ['زميلي في الشغل، بنوصّل شحنة.', 'A colleague from work — we are delivering a load.'], lg_fares: ['ركاب يا باشا، كل واحد نازل مكان.', 'Fares, officer — each one getting off somewhere.'],
  lg_one_family_m: ['مراتي يا باشا.', 'My wife, officer.'], lg_one_family_f: ['جوزي يا باشا.', 'My husband, officer.'], lg_one_friend: ['صاحبي، راجعين سوا.', 'A friend — we are heading back together.'],
  lg_delivery: ['أوردر أكل يا باشا، الزبون مستني في {dest}.', 'A food order, officer, the customer is waiting in {dest}.'], lg_goods: ['بوصّل بضاعة للمخزن في {dest}.', 'Delivering goods to the warehouse in {dest}.'], lg_tuk: ['بوصّل الركاب جوه {dest}.', 'Dropping the fares inside {dest}.'],
  lg_resumeDaily: ['كمّل تحدي اليوم', 'Continue the daily challenge'], lg_resumeFree: ['كمّل الوردية الحرة', 'Continue the free shift']
});
CP.Logic = {}; const LG = CP.Logic;
const isBike = t => /moto/.test(t), isTuk = t => t === 'tuktuk', isFare = t => /taxi|microbus|bus|tuktuk/.test(t), isCargo = t => /van|pickup|truck|courier|cargo/.test(t) && !/moto/.test(t);

/* ---------- who is in the vehicle: normalised at spawn ---------- */
CP.bus.on('spawn', v => {
  const c = CP.G.shift.cases[v.caseId]; if (!c) return; const t = c.type;
  if (isBike(t)) { c.pax = Math.min(c.pax || 0, 1); c.paxRel = c.pax ? 'pillion' : null; }
  else if (isTuk(t)) { c.pax = Math.min(c.pax || 0, 2); c.paxRel = c.pax ? 'fares' : null; }
  else if (isFare(t)) { c.paxRel = c.pax ? 'fares' : null; }
  else if (isCargo(t)) { c.pax = Math.min(c.pax || 0, 2); c.paxRel = c.pax ? 'colleague' : null; }
  else { if (!c.pax) c.paxRel = null; else if (c.pax === 1 && c.paxRel === 'family') c.paxRel = 'spouse'; else if (c.pax === 1 && c.paxRel === 'friends') c.paxRel = 'friend'; }
  if (c.paxRel === 'family' && (c.pax || 0) < 2) c.pax = 2; // "wife and kids" needs at least two people
});
/* ---------- answers that follow from the vehicle (the base answer is suppressed, ours replaces it) ---------- */
LG.custom = function (c, intent) {
  const J = c.journey || {}; const dest = J.dest ? (typeof J.dest === 'string' ? J.dest : CP.L(J.dest)) : ''; const g = c.driver.g;
  if (intent === 'ask_passengers') {
    if (!c.pax) return ['lg_alone', {}]; if (c.paxRel === 'pillion') return [g === 'f' ? 'lg_pillion_f' : 'lg_pillion_m', {}]; if (c.paxRel === 'colleague') return ['lg_colleague', {}];
    if (c.paxRel === 'spouse') return [g === 'f' ? 'lg_one_family_f' : 'lg_one_family_m', {}]; if (c.paxRel === 'friend') return ['lg_one_friend', {}]; if (c.paxRel === 'fares' && isTuk(c.type)) return ['lg_fares', {}];
  }
  if (intent === 'ask_destination' && dest) { if (c.type === 'moto_delivery') return ['lg_delivery', { dest }]; if (/box_truck|cargo_truck|courier/.test(c.type)) return ['lg_goods', { dest }]; if (isTuk(c.type)) return ['lg_tuk', { dest }]; }
  return null;
};
{ const say = CP.Dlg.say; CP.Dlg.say = function (c, who, text) { if (who === 'driver' && c && c._lgSkip) return; return say.apply(this, arguments); }; }
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c, intent, tone) { const cu = LG.custom(c, intent); if (!cu) return ask.apply(this, arguments);
    c._lgSkip = true; const r = ask.apply(this, arguments); c._lgSkip = false; const t = CP.t(cu[0], cu[1]); CP.Dlg.say(c, 'driver', t); if (intent === 'ask_passengers' && CP.Dlg.statement) CP.Dlg.statement(c, 'pax', t, c.paxRel || 'alone'); return r; }; }

/* ---------- repair timer above the item; no second ring ---------- */
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); const ctx = this.ctx, R = this, ppm = this.ppm;
    for (const t of s.tasks) { let x, yup, h = 1.7; if (/repair/.test(t.type)) { x = CP.W.gateX; yup = R.Y.mainFar + 0.12; } else if (/generator/.test(t.type)) { x = CP.W.genX; yup = R.Y.mainFar + 0.12; } else if (t.type === 'o_vehicle' || t.type === 'sgt_vehicle') { const v = t.data && CP.T.get(t.data.vid); if (!v) continue; x = v.x - v.len / 2; yup = R.rowY(v.row); h = 1.5; } else continue;
      const p = CP.clamp(t.t / t.dur, 0, 1), left = Math.max(0, (t.dur - t.t) / (t.rate || 1)); const cx = R.sx(x), cy = R.sy(yup) - h * ppm - 0.55 * ppm, r = 0.32 * ppm;
      ctx.save(); ctx.lineWidth = Math.max(2, 0.06 * ppm); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke(); ctx.strokeStyle = '#ffb347'; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + p * 6.283); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.max(11, Math.round(0.28 * ppm))}px ${CP.UI.font()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6; ctx.fillText(Math.ceil(left) + 's', cx, cy); ctx.font = `${Math.max(9, Math.round(0.2 * ppm))}px ${CP.UI.font()}`; ctx.fillText('🔧', cx, cy - r - 0.2 * ppm); ctx.restore(); }
  }; }

/* ---------- resume an unfinished daily / free shift from the menu ---------- */
LG.pending = () => { for (const [mode, key] of [['daily', 'cpns_daily_v1'], ['free', 'cpns_free_v1']]) { try { const k = CP.SAVE_KEY; CP.SAVE_KEY = key; const o = CP.loadSaved(); CP.SAVE_KEY = k; if (o && o.shift && !o.shift.ended && o.shift.t > 20) return { mode, o }; } catch (e) { } } return null; };
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { const r = menu.apply(this, arguments); const pend = LG.pending(); const hero = document.querySelector('.rv-play'); if (!pend || !hero) return r;
    hero.parentElement.insertBefore(CP.h('button', { class: 'rv-card new', onclick: () => { CP.Audio.click(); CP.Main.useKey(pend.mode); CP.Main.adopt(pend.o); } }, CP.h('span', { class: 'rv-ci' }, pend.mode === 'daily' ? '📅' : '🗺️'), CP.h('span', { class: 'rv-ct' }, CP.h('b', null, CP.t(pend.mode === 'daily' ? 'lg_resumeDaily' : 'lg_resumeFree')), CP.h('small', null, CP.t('loc_' + pend.o.shift.loc).split(' — ')[0] + ' • ' + CP.fmtTime(Math.max(0, pend.o.shift.dur - pend.o.shift.t)))), CP.h('span', { class: 'rv-go' }, '›')), hero.nextSibling); return r; }; }

/* ---------- version chip in the HUD ---------- */
{ const bg = CP.UI.buildGame; CP.UI.buildGame = function () { const r = bg.apply(this, arguments); const hud = document.getElementById('hud'); if (hud && !document.getElementById('hVer')) hud.appendChild(CP.h('div', { id: 'hVer', class: 'hud-hint' }, 'v' + CP.VERSION)); return r; }; }
;(window.CP_FILES = window.CP_FILES || {})['36_logic'] = '2.6.0';
