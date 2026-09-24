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

/* ---------- drivers and officers talk about what is actually being ridden ---------- */
LG.NOUN = { moto: ['الموتوسيكل', 'motorbike'], tuktuk: ['التوك توك', 'tuk-tuk'], microbus: ['الميكروباص', 'microbus'], bus: ['الأتوبيس', 'bus'], truck: ['النقل', 'truck'], van: ['الفان', 'van'], pickup: ['النص نقل', 'pickup'], taxi: ['التاكسي', 'taxi'] };
LG.nounFor = type => { for (const k in LG.NOUN) if (type.indexOf(k) >= 0 || (k === 'truck' && /cargo|box_truck/.test(type))) return LG.NOUN[k]; return null; };
LG.fix = (text, type) => { const n = LG.nounFor(type); if (!n || typeof text !== 'string') return text;
  return text.replace(/العربية دي|العربية|عربيتك|عربيتي|العربيه/g, m => m === 'عربيتك' ? n[0] + ' بتاعك' : m === 'عربيتي' ? n[0] + ' بتاعي' : n[0]).replace(/\bthe car\b/gi, 'the ' + n[1]).replace(/\byour car\b/gi, 'your ' + n[1]).replace(/\bmy car\b/gi, 'my ' + n[1]).replace(/\bcar\b/gi, n[1]).replace(/\bvehicle licence(s?)\b/gi, n[1] + ' licence$1').replace(/\byour vehicle\b/gi, 'your ' + n[1]).replace(/\bthe vehicle\b/gi, 'the ' + n[1]); };
{ const say = CP.Dlg.say; CP.Dlg.say = function (c, who, text) { if (c && c.type) text = typeof text === 'string' ? LG.fix(text, c.type) : (text && text.ar ? { ar: LG.fix(text.ar, c.type), en: LG.fix(text.en, c.type) } : text); return say.call(this, c, who, text); }; }

/* ---------- Flow mode: one tap runs the routine, the player only makes the calls that matter ---------- */
CP.addStrings({
  fl_go: ['▶ افحص', '▶ Check'], fl_goSub: ['اقرب • سلّم • اطلب الأوراق', 'approach • greet • papers'], fl_release: ['✅ عدّي', '✅ Release'], fl_warn: ['⚠️ إنذار', '⚠️ Warning'], fl_cite: ['🧾 مخالفة', '🧾 Citation'], fl_bay: ['🔦 تفتيش', '🔦 Search'], fl_hold: ['🚔 تحفظ', '🚔 Hold'],
  fl_ask: ['💬 اسأل', '💬 Ask'], fl_radio: ['📻 تأكد', '📻 Verify'], fl_search: ['🔦 تفتيش سريع', '🔦 Quick search'], fl_holdBay: ['التحفظ بيتم من منطقة التفتيش — بعتناه هناك', 'Holds happen in the inspection bay — sent there'], fl_flow: ['وضع التدفق السريع', 'Quick-flow mode'],
  fl_noEvidence: ['مفيش دليل على العربية دي — الأوراق سليمة ومفيش ملاحظات. عدّيها أو فتّشها', 'No evidence on this vehicle — papers are clean and nothing was observed. Release it or search it'],
  fl_q1: ['رايح فين؟', 'Where to?'], fl_q2: ['مين معاك؟', 'Who is with you?'], fl_q3: ['شغلك إيه؟', 'What do you do?']
});
LG.flowOn = () => CP.S.flow !== false;
LG.flow = { caseId: null, stage: null };
LG.startFlow = function () { const v = CP.Act.curV(); const c = CP.Act.curC(); if (!v || !c || c.res) return; LG.flow = { caseId: c.id, stage: 'stop' }; if (!c.k.stopped) CP.Act.run('stop'); };
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; const f = LG.flow; if (!s || !f.caseId || !LG.flowOn()) return; const c = s.cases[f.caseId]; const v = c && CP.vehOfCase(c); if (!c || !v || c.res) { f.caseId = null; return; }
  if (s.officer.moving) return;
  f.wait = (f.wait || 0) - 1; if (f.wait > 0) return;
  if (f.stage === 'stop' && c.k.stopped) { f.stage = 'talk'; if (!c.k.greeted) { const a = CP.Act.avail('talk'); if (a.ok) CP.Act.run('talk'); } f.wait = 6; return; }
  if (f.stage === 'talk') { if (!c.k.greeted) { if (CP.UI.panel && CP.UI.panel.kind === 'dialogue') { CP.Dlg.ask(c, 'greet_docs', 'calm'); CP.UI.renderPanel(); f.wait = 12; } return; } f.stage = 'docs'; f.wait = 6; return; }
  if (f.stage === 'docs') { if (c.k.docsHanding) return; if (!c.k.docsHave) { f.wait = 6; return; } if (!(CP.UI.panel && CP.UI.panel.kind === 'docs')) { const a = CP.Act.avail('docs'); if (a.ok) CP.Act.run('docs'); f.wait = 6; return; } f.stage = 'decide'; }
});
/* automatic reason: the strongest evidence the case already holds */
LG.reasonFor = c => { const k = c.k || {}; if (CP.Cases.trueDiscrepancies && CP.Cases.trueDiscrepancies(c).length && k.docsViewed) return 'discrepancy'; if (c.flags && (c.flags.lookoutMatch || c.flags.tuktuk) || c.fam === 'alert' || c.fam === 'lookout') return 'alert'; if ((c.cues || []).length && (k.searchReason || k.docsViewed)) return 'observation'; if (k.consent) return 'consent'; if (k.asked && Object.keys(k.asked).length) return 'statement'; return 'routine'; };
/* evidence is gathered automatically: the highlighted discrepancies become discrepancy notes, cues become observation
   notes, and every note the case holds is passed as support — the player never has to tick evidence boxes */
LG.autoEvidence = function (c) {
  try { const td = CP.Cases.trueDiscrepancies(c) || []; for (const d of td) if ((c.k.disc || []).indexOf(d.key) < 0) CP.Cases.recordDiscrepancy(c, d.f); } catch (e) { }
  if ((c.cues || []).length && !c._cueNoted) { c._cueNoted = true; CP.note(c, 'observation', CP.fill(['ملاحظة ميدانية: {n}', 'Field observation: {n}'], { n: String((c.cues || []).join('، ')) }), 'verified'); }
  if (c.flags && c.flags.tuktuk && !c._tkNoted) { c._tkNoted = true; CP.note(c, 'observation', CP.fill([CP.STR.ar.tk_note, CP.STR.en.tk_note]), 'verified'); }
  return CP.notesFor(c).map(n => n.id);
};
LG.decide = function (dec) { const c = CP.Act.curC(); const v = CP.Act.curV(); if (!c || c.res) return; CP.Audio.click();
  if (dec === 'bay') { const a = CP.Act.avail('bay'); if (a.ok) CP.Act.run('bay'); else CP.UI.toast(a.reason, 'warn'); return; }
  if (dec === 'hold' && (!v || v.st !== 'bay')) { const a = CP.Act.avail('bay'); if (a.ok) { CP.Act.run('bay'); CP.UI.toast(CP.t('fl_holdBay'), 'info'); } else CP.UI.toast(a.reason, 'warn'); return; }
  const soft = dec === 'release' || dec === 'advice' || dec === 'waved'; const support = soft ? [] : LG.autoEvidence(c);
  if (!soft && !support.length) { CP.UI.toast(CP.t('fl_noEvidence'), 'warn'); CP.Audio.deny(); return; }
  const strong = LG.reasonFor(c); const reason = soft ? (c.k.asked && Object.keys(c.k.asked).length ? 'statement' : 'routine') : strong;
  const e = CP.Act.resolve(c, dec, reason, support); if (e) { CP.UI.toast(CP.t(e), 'warn'); CP.Audio.deny(); } else { CP.UI.close && CP.UI.close(); } };
LG.quickSearch = function () { const c = CP.Act.curC(); const v = CP.Act.curV(); if (!c || !v) return; if (!c.k.searchReason) c.k.searchReason = LG.reasonFor(c) === 'routine' ? 'consent' : LG.reasonFor(c); c.k.consent = c.k.consent || c.coop >= 45;
  const zones = CP.Insp.zones(c).filter(z => !(c.k.zones && c.k.zones[z] && c.k.zones[z].done)); if (!zones.length) { CP.UI.toast(CP.t('wd_clean', { z: '' }), 'info'); return; }
  let i = 0; const next = () => { if (i >= zones.length || !CP.G.shift || c.res) return; const z = zones[i++]; const r = CP.Insp.searchZone(c, z); if (r === null) return; setTimeout(next, 1800); }; next(); };
/* the decision strip: injected into any case panel and the dock while a case is stopped */
LG.strip = function () {
  const s = CP.G && CP.G.shift; if (!s || !LG.flowOn()) return; const c = CP.Act.curC(); const v = CP.Act.curV(); const old = document.getElementById('flowStrip');
  if (!c || !v || c.res || !c.k.stopped) { if (old) old.remove(); return; }
  const host = (CP.UI.panel && document.querySelector('#panel .pf')) || document.getElementById('dock'); if (!host) return;
  if (old && old.parentElement === host && old.dataset.c === c.id + ':' + (v.st === 'bay')) return; if (old) old.remove();
  const h = CP.h; const inBay = v.st === 'bay';
  const btn = (cls, k, fn) => h('button', { class: 'btn fl ' + cls, onclick: e => { e.stopPropagation(); fn(); } }, CP.t(k));
  const strip = h('div', { id: 'flowStrip', 'data-c': c.id + ':' + inBay },
    h('div', { class: 'fl-row' }, btn('rel', 'fl_release', () => LG.decide('release')), btn('wrn', 'fl_warn', () => LG.decide('warning')), btn('cit', 'fl_cite', () => LG.decide('citation')), inBay ? btn('hld', 'fl_hold', () => LG.decide('hold')) : btn('bay', 'fl_bay', () => LG.decide('bay'))),
    h('div', { class: 'fl-row sm' }, inBay ? btn('srch', 'fl_search', () => LG.quickSearch()) : null, btn('ask', 'fl_radio', () => { const a = CP.Act.avail('radio'); if (a.ok) CP.Act.run('radio'); else CP.UI.toast(a.reason, 'warn'); }),
      h('button', { class: 'btn fl ask', onclick: e => { e.stopPropagation(); const m = strip.querySelector('.fl-ask'); m.classList.toggle('hidden'); } }, CP.t('fl_ask'))),
    h('div', { class: 'fl-ask hidden' }, ...[['fl_q1', 'ask_destination'], ['fl_q2', 'ask_passengers'], ['fl_q3', 'ask_purpose']].map(([k, intent]) => h('button', { class: 'btn sm', onclick: e => { e.stopPropagation(); CP.Dlg.ask(c, intent, 'calm'); if (!CP.UI.panel || CP.UI.panel.kind !== 'dialogue') CP.UI.open('dialogue', c.id); else CP.UI.renderPanel(); } }, CP.t(k)))));
  host.appendChild(strip);
};
CP.bus.on('stepEnd', () => { LG.st = (LG.st || 0) + 1; if (LG.st % 15 === 0) LG.strip(); });
{ const rp = CP.UI.renderPanel; CP.UI.renderPanel = function () { const r = rp.apply(this, arguments); setTimeout(LG.strip, 0); return r; }; }
/* the case card's "Check" becomes the one-tap routine */
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('#dock .act'); if (!b || !LG.flowOn()) return; const lab = (b.textContent || ''); if (/فحص|Check/.test(lab) && !/سريع|Quick/.test(lab)) { const c = CP.Act.curC(); if (c && !c.k.stopped) { setTimeout(() => { if (!LG.flow.caseId) LG.startFlow(); }, 0); } } }, true);
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { const r = menu.apply(this, arguments); const more = document.querySelector('.rv-more .col'); if (more) more.appendChild(CP.h('button', { class: 'btn mb', onclick: () => { CP.S.flow = CP.S.flow === false; CP.saveSettings(); CP.UI.toast(CP.t('fl_flow') + ': ' + (CP.S.flow === false ? 'OFF' : 'ON')); } }, CP.t('fl_flow'))); return r; }; }
;(window.CP_FILES = window.CP_FILES || {})['36_logic'] = '2.8.0';
