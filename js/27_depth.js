/* Depth (v1.9)
   - Broken equipment is clickable: a pulsing ring on the jammed barrier / dead generator; tap it → repair yourself
     (timing bar), ask the sergeant (he walks over and fixes it while you keep working), or cancel.
   - Light casting: soft warm ground pools under each floodlight and the booth window, headlight spill on the road at night.
   - Guided dialogue panel: 4-step strip (Talk → Papers → Verify → Decide), tone tucked away, 3 questions at a time,
     the next-step footer button glows, notes column hidden on smaller screens.
   - Regulars: 6 recurring Egyptian drivers who remember how you treated them. Friends tip you off about trouble on the road;
     people you wronged complain to the supervisor.
   - The Black File: serious catches drop clues; 5 clues close a file for a big reward and a rank-up nudge — progress on the menu.
   - Uniform unlock: reach rank 6 to switch to the white officer's uniform (partner takes navy). */
CP.addStrings({
  dp_carQ: ['العربية عطلانة — تعمل إيه؟', 'The car has broken down — what now?'], dp_push: ['💪 ادفعها على الجنب (١٠ ث)', '💪 Push it aside (10 s)'], dp_tow: ['🚛 اطلب ونش (٢٠ ث)', '🚛 Call a tow (20 s)'], dp_sgtCar: ['👮 خلي الرقيب يساعد', '👮 Ask the sergeant'], dp_towOn: ['الونش في الطريق', 'Tow truck on its way'],
  dp_fixQ: ['البوابة عطلانة — تعمل إيه؟', 'The barrier is jammed — what now?'], dp_genQ: ['المولد فصل — تعمل إيه؟', 'The generator tripped — what now?'],
  dp_me: ['🔧 أصلحها بنفسي', '🔧 Fix it myself'], dp_sgt: ['👮 خلي الرقيب يصلحها', '👮 Ask the sergeant'], dp_cancel: ['إلغاء', 'Cancel'], dp_sgtBusy: ['الرقيب مشغول دلوقتي', 'The sergeant is busy right now'], dp_sgtOn: ['الرقيب رايح يصلحها', 'The sergeant is on it'],
  dp_step1: ['١ كلام', '1 Talk'], dp_step2: ['٢ الأوراق', '2 Papers'], dp_step3: ['٣ تأكيد', '3 Verify'], dp_step4: ['٤ القرار', '4 Decide'], dp_tone: ['النبرة', 'Tone'],
  dp_regular: ['🧑 وجه معروف: {n} — لقاء رقم {k}', '🧑 A familiar face: {n} — meeting #{k}'],
  dp_tip: ['{n}: "خلي بالك يا باشا، في عربية ورايا شكلها مش مظبوط"', '{n}: "Careful officer, there is a car behind me that looks wrong"'],
  dp_grudge: ['{n} اشتكى منك للمشرف', '{n} complained about you to the supervisor'],
  dp_clue: ['🗂 دليل جديد في الملف الأسود ({k}/٥)', '🗂 New clue in the Black File ({k}/5)'], dp_fileDone: ['الملف الأسود اتقفل! +٥٠٠ خبرة', 'Black File closed! +500 XP'],
  dp_file: ['الملف الأسود', 'The Black File'], dp_fileSub: ['{k}/٥ أدلة • ملفات مقفولة: {d}', '{k}/5 clues • files closed: {d}'],
  dp_uniform: ['الزي الأبيض', 'White uniform'], dp_uniLocked: ['يتفتح عند رتبة {r}', 'Unlocks at rank {r}'], dp_uniOn: ['شغّال — اضغط للرجوع للكحلي', 'On — tap to switch back to navy'], dp_uniOff: ['اضغط لتغيير الزي', 'Tap to change uniform']
});
CP.Depth = {}; const DP = CP.Depth, dh = CP.h;

/* ---------- clickable broken equipment ---------- */
DP.brokenSpots = function (s) {
  const out = []; const W = CP.W, Y = CP.R.Y;
  if (s.gate.jam) out.push({ kind: 'gate', x: W.gateX, yup: Y.mainFar + 0.12, h: 1.6, w: 1.2 });
  if (s.equipment.generator !== 'ok') out.push({ kind: 'gen', x: W.genX, yup: Y.mainFar + 0.12, h: 1.6, w: 1.8 });
  for (const v of s.vehicles) if (v.stall > 0 && v.stallKind) out.push({ kind: 'car', x: v.x - v.len / 2, yup: CP.R.rowY(v.row) + 0.2, h: 1.5, w: v.len, vid: v.id });
  return out;
};
DP.hitBroken = function (s, px, py) {
  const R = CP.R; for (const b of DP.brokenSpots(s)) { const cx = R.sx(b.x), gy = R.sy(b.yup), hw = b.w * R.ppm * 0.7, hh = b.h * R.ppm; if (px > cx - hw && px < cx + hw && py > gy - hh - 10 && py < gy + 10) return b; } return null;
};
DP.popover = function (b, px, py) {
  if (document.getElementById('fixpop')) return; const s = CP.G.shift; const stage = document.getElementById('stage'); const sgt = CP.Staff.list.find(m => m.id === 'sgt');
  const close = () => { const e = document.getElementById('fixpop'); if (e) e.remove(); };
  if (b.kind === 'car') { const v = CP.T.get(b.vid); const towDur = CP.Econ && CP.Econ.own('tow') ? 10 : 20;
    const pop = dh('div', { id: 'fixpop', role: 'dialog' }, dh('b', null, CP.t('dp_carQ')),
      dh('button', { class: 'btn pri', onclick: () => { close(); CP.Audio.click(); CP.Tasks.add({ type: 'o_vehicle', owner: 'officer', dur: 10, key: 'o_vehicle:' + b.vid, data: { vid: b.vid, x: b.x } }); CP.Actors.walkTo(v.x - v.len / 2 - 0.6, v.row); } }, CP.t('dp_push')),
      dh('button', { class: 'btn', onclick: () => { close(); CP.Audio.radioClick(true); CP.UI.toast(CP.t('dp_towOn'), 'ok'); CP.Tasks.add({ type: 'radio', owner: 'officer', dur: towDur, key: 'tow:' + b.vid, data: { tow: b.vid } }); } }, CP.t('dp_tow')),
      dh('button', { class: 'btn', onclick: () => { close(); if (!sgt || sgt.job) { CP.UI.toast(CP.t('dp_sgtBusy'), 'warn'); return; } sgt.job = 'car:' + b.vid; sgt.hurry = true; CP.Audio.radioClick(true); CP.UI.toast(CP.t('dp_sgtOn'), 'ok'); } }, CP.t('dp_sgtCar')),
      dh('button', { class: 'btn ghost sm', onclick: () => { close(); CP.Audio.clickSoft(); } }, CP.t('dp_cancel')));
    stage.appendChild(pop); const r = stage.getBoundingClientRect(); pop.style.left = CP.clamp(px - r.left - 120, 8, r.width - 250) + 'px'; pop.style.top = CP.clamp(py - r.top - 200, 8, r.height - 230) + 'px';
    setTimeout(() => document.addEventListener('pointerdown', function h(e) { if (!pop.contains(e.target)) { close(); document.removeEventListener('pointerdown', h); } }), 50); return; }
  const me = () => { close(); CP.Audio.click(); const t = b.kind === 'gate' ? CP.Tasks.add({ type: 'o_repair', owner: 'officer', dur: 6, key: 'o_repair', data: { x: b.x } }) : CP.Tasks.add({ type: 'o_generator', owner: 'officer', dur: 7, key: 'o_generator', data: { x: b.x } }); CP.Actors.walkTo(b.x + (b.kind === 'gate' ? 0.9 : -1.2), 0); };
  const ask = () => { close(); if (!sgt || sgt.job) { CP.UI.toast(CP.t('dp_sgtBusy'), 'warn'); return; } CP.Audio.radioClick(true); sgt.job = b.kind; sgt.hurry = true; CP.UI.toast(CP.t('dp_sgtOn'), 'ok'); };
  const pop = dh('div', { id: 'fixpop', role: 'dialog' }, dh('b', null, CP.t(b.kind === 'gate' ? 'dp_fixQ' : 'dp_genQ')),
    dh('button', { class: 'btn pri', onclick: me }, CP.t('dp_me')), dh('button', { class: 'btn', onclick: ask }, CP.t('dp_sgt')), dh('button', { class: 'btn ghost sm', onclick: () => { close(); CP.Audio.clickSoft(); } }, CP.t('dp_cancel')));
  stage.appendChild(pop); const r = stage.getBoundingClientRect(); pop.style.left = CP.clamp(px - r.left - 120, 8, r.width - 250) + 'px'; pop.style.top = CP.clamp(py - r.top - 170, 8, r.height - 200) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', function h(e) { if (!pop.contains(e.target)) { close(); document.removeEventListener('pointerdown', h); } }), 50);
};
CP.Tasks.on('sgt_vehicle', t => { const v = CP.T.get(t.data.vid); if (v) CP.Events.fixVehicle(v); });
{ const pr = CP.Tasks.H.radio, pp = CP.Tasks.P.radio; CP.Tasks.on('radio', t => { if (pr) pr(t); if (t.data && t.data.tow) { const v = CP.T.get(t.data.tow); if (v) CP.Events.fixVehicle(v); } }, pp); }
{ const cv = () => CP.R.cv; document.addEventListener('pointerdown', e => { const c = cv(); if (!c || e.target !== c || !CP.G || !CP.G.shift) return; const b = DP.hitBroken(CP.G.shift, e.clientX - c.getBoundingClientRect().left, e.clientY - c.getBoundingClientRect().top); if (b) { e.stopPropagation(); DP.popover(b, e.clientX, e.clientY); } }, true);
  document.addEventListener('pointermove', e => { const c = cv(); if (!c || e.target !== c || !CP.G || !CP.G.shift) return; const rr = c.getBoundingClientRect(); c.style.cursor = DP.hitBroken(CP.G.shift, e.clientX - rr.left, e.clientY - rr.top) ? 'pointer' : ''; }); }
// sergeant carries out the job
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return; const sgt = CP.Staff.list.find(m => m.id === 'sgt'); if (!sgt || !sgt.job) return;
  const W = CP.W; if (String(sgt.job).startsWith('car:')) { const v = CP.T.get(sgt.job.slice(4)); if (!v || !(v.stall > 0)) { sgt.job = null; return; } const tx = v.x - v.len / 2 - 0.8; if (Math.abs(sgt.x - tx) > 0.3) { sgt.target = tx; sgt.hurry = true; return; } sgt.pose = 'lower'; sgt.hold = 0.3; if (!s.tasks.find(t => t.key === 'sgt_car:' + v.id)) CP.Tasks.add({ type: 'sgt_vehicle', owner: 'staff', dur: 12, key: 'sgt_car:' + v.id, data: { vid: v.id } }); return; }
  const tx = sgt.job === 'gate' ? W.gateX + 1.1 : W.genX - 1.3;
  if ((sgt.job === 'gate' && !s.gate.jam) || (sgt.job === 'gen' && s.equipment.generator === 'ok')) { sgt.job = null; return; }
  if (Math.abs(sgt.x - tx) > 0.25) { sgt.target = tx; sgt.hurry = true; return; }
  sgt.pose = 'lower'; sgt.hold = 0.3; if (!s.tasks.find(t => t.key === 'sgt_' + sgt.job)) CP.Tasks.add({ type: sgt.job === 'gate' ? 'sgt_repair' : 'sgt_generator', owner: 'staff', dur: 11, key: 'sgt_' + sgt.job, data: {} });
});
// pulsing ring on broken equipment + light pools
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) {
    wui.call(this, s, alpha); const ctx = this.ctx, R = this, ppm = this.ppm, night = this.nightLvl || 0;
    for (const b of DP.brokenSpots(s)) { const cx = R.sx(b.x), cy = R.sy(b.yup) - b.h * ppm * 0.5; const pu = 0.5 + 0.5 * Math.sin(this.t * 4); ctx.save(); ctx.strokeStyle = `rgba(255,120,60,${0.45 + 0.4 * pu})`; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -this.t * 30; ctx.beginPath(); ctx.arc(cx, cy, (0.85 + pu * 0.12) * ppm, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.font = `700 ${Math.round(0.5 * ppm)}px ${CP.UI.font()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6; ctx.fillText('🔧', cx, cy + 0.18 * ppm); ctx.restore(); }
    if (night > 0.3 && !CP.S.reducedFx && s.equipment.generator === 'ok') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const pool = (x, yup, rx, ry, a, c) => { const cx = R.sx(x), cy = R.sy(yup); if (cx < -rx || cx > R.W + rx) return; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx); g.addColorStop(0, `rgba(${c},${a * night})`); g.addColorStop(0.6, `rgba(${c},${a * night * 0.35})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore(); };
      for (const fx of [8.4, 35.2]) pool(fx + 0.6, R.Y.mainFar - 0.6, 5.2 * ppm, 1.9 * ppm, 0.22, '255,225,170');
      pool(CP.W.boothX + 0.4, R.Y.mainFar + 0.05, 2.6 * ppm, 1.0 * ppm, 0.16, '255,200,120');
      for (const v of s.vehicles) { if (v.row !== 0 || v.x < -2 || v.x > 40) continue; const fx = v.x + 0.3; pool(fx + 1.4, R.rowY(v.row) - 0.15, 2.4 * ppm, 0.7 * ppm, 0.14, '255,240,215'); }
      ctx.restore();
    }
  }; }

/* ---------- guided dialogue panel ---------- */
{ const rp = CP.UI.renderPanel; CP.UI.renderPanel = function () { const r = rp.apply(this, arguments); const p = CP.UI.panel; if (!p || p.kind !== 'dialogue') return r;
    const body = document.querySelector('#panel .dlg'); if (!body || body.querySelector('.dp-steps')) return r;
    const s = CP.G.shift, c = s.cases[p.caseId]; const key = CP.Revamp.coachKey(s); const stepIdx = { co_stop: 0, co_greet: 0, co_docs: 1, co_verify: 2, co_decide: 3 }[key] ?? 0;
    const steps = dh('div', { class: 'dp-steps' }, ...['dp_step1', 'dp_step2', 'dp_step3', 'dp_step4'].map((k, i) => dh('span', { class: 'dp-step' + (i < stepIdx ? ' done' : i === stepIdx ? ' on' : '') }, CP.t(k))));
    body.parentElement.insertBefore(steps, body);
    const toneRow = body.querySelector('.seg') && body.querySelector('.seg').parentElement; if (toneRow) { toneRow.classList.add('dp-tone'); const tg = dh('button', { class: 'btn sm ghost dp-toneT', onclick: () => toneRow.classList.toggle('open') }, CP.t('dp_tone') + ' ▾'); toneRow.parentElement.insertBefore(tg, toneRow); }
    const opts = body.querySelector('.opts'); if (opts && !opts.dataset.open) { const b = [...opts.children].filter(x => x.tagName === 'BUTTON' && !x.classList.contains('po-more')); if (b.length > 4) { b.forEach((x, i) => x.classList.toggle('po-hid', i >= 3)); let m = opts.querySelector('.po-more'); if (!m) { m = dh('button', { class: 'btn ghost po-more' }, CP.t('po_more')); opts.appendChild(m); } m.onclick = () => { opts.dataset.open = '1'; opts.querySelectorAll('.po-hid').forEach(x => x.classList.remove('po-hid')); m.remove(); }; } }
    const foot = document.querySelector('#panel .pf'); if (foot) { const want = { co_docs: 0, co_verify: 1, co_decide: 4 }[key]; [...foot.querySelectorAll('.btn')].forEach((b, i) => b.classList.toggle('dp-next', i === want)); }
    return r; }; }

/* ---------- regulars ---------- */
CP.REGULARS = [
  { id: 'sayed', name: ['عم سيد التاكسي', 'Am Sayed the taxi driver'], types: ['classic_sedan', 'silver_sedan'], g: 'm' },
  { id: 'hamada', name: ['حمادة سواق الميكروباص', 'Hamada the microbus driver'], types: ['microbus'], g: 'm' },
  { id: 'mona', name: ['الدكتورة منى', 'Dr. Mona'], types: ['silver_sedan', 'suv'], g: 'f' },
  { id: 'abdo', name: ['عبده الطالب', 'Abdo the student'], types: ['classic_sedan'], g: 'm' },
  { id: 'nour', name: ['المهندسة نور', 'Eng. Nour'], types: ['suv', 'silver_sedan'], g: 'f' },
  { id: 'haj', name: ['الحاج رمضان', 'Hajj Ramadan'], types: ['pickup', 'classic_sedan'], g: 'm' }
];
DP.regs = () => { const c = CP.G.career; c.regulars = c.regulars || {}; return c.regulars; };
CP.bus.on('spawn', v => {
  const s = CP.G.shift; const c = v.caseId && s.cases[v.caseId]; if (!c || c.regular || c.fam === 'lookout' || Math.random() > 0.16) return;
  const pool = CP.REGULARS.filter(r => r.g === c.driver.g && (!r.types.length || r.types.indexOf(c.type) >= 0 || Math.random() < 0.3)); if (!pool.length) return;
  const r = pool[Math.floor(Math.random() * pool.length)]; const R = DP.regs(); const st = R[r.id] = R[r.id] || { met: 0, rel: 0, portrait: c.driver.portrait };
  c.regular = r.id; c.driver.portrait = st.portrait; c.driver.name = { ar: r.name[0], en: r.name[1] }; c.owner.name = c.driver.name;
});
CP.bus.on('caseOpened', c => {});
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c, intent, tone) { const r = ask.apply(this, arguments); if (!c.regular || c._regHi) return r; c._regHi = true; const st = DP.regs()[c.regular]; const reg = CP.REGULARS.find(x => x.id === c.regular); st.met++;
    CP.UI.toast(CP.t('dp_regular', { n: CP.L({ ar: reg.name[0], en: reg.name[1] }), k: CP.num(st.met) }), 'info');
    const line = st.rel >= 2 ? ['إنت تاني يا باشا! إنت اللي عاملني كويس المرة اللي فاتت — تشرب شاي؟', 'You again, officer! You were fair with me last time — tea?'] : st.rel <= -2 ? ['هو إنت تاني؟ المرة اللي فاتت خدت مخالفة على الفاضي.', 'You again? Last time you ticketed me for nothing.'] : st.met > 1 ? ['أهلاً يا باشا، فاكرني؟ عدّيت من هنا قبل كده.', 'Hello officer, remember me? I came through here before.'] : null;
    if (line) CP.Dlg.say(c, 'driver', CP.L({ ar: line[0], en: line[1] }));
    if (st.rel >= 2 && Math.random() < 0.5 && CP.Events.can('wanted')) { setTimeout(() => { CP.Events.start('wanted'); CP.UI.banner(CP.t('dp_tip', { n: CP.L({ ar: reg.name[0], en: reg.name[1] }) }), 'warn'); }, 1500); }
    return r; }; }
CP.bus.on('caseClosed', c => {
  if (!c.regular || !c.res) return; const st = DP.regs()[c.regular]; const reg = CP.REGULARS.find(x => x.id === c.regular); const sound = c.res.eval && c.res.eval.sound; const harsh = ['citation', 'hold', 'handover'].indexOf(c.res.decision) >= 0;
  if (sound && !harsh) st.rel = Math.min(4, st.rel + 1); else if (!sound && harsh) { st.rel = Math.max(-4, st.rel - 2); CP.G.career.trust = CP.clamp(CP.G.career.trust - 2, 0, 100); CP.UI.toast(CP.t('dp_grudge', { n: CP.L({ ar: reg.name[0], en: reg.name[1] }) }), 'warn'); } else if (sound && harsh) st.rel = Math.max(-4, st.rel - 1);
});

/* ---------- the Black File ---------- */
DP.file = () => { const c = CP.G.career; c.casefile = c.casefile || { clues: 0, done: 0 }; return c.casefile; };
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !c.res || !c.res.eval || !c.res.eval.sound) return; if (!(CP.FAM[c.fam] && CP.FAM[c.fam].serious) || ['hold', 'handover', 'refer_admin'].indexOf(c.res.decision) < 0) return;
  if (Math.random() > 0.55) return; const f = DP.file(); f.clues++;
  if (f.clues >= 5) { f.clues = 0; f.done++; CP.Prog.gain(500, null, null, '#ffd35a', '🗂'); CP.R.stamp(CP.t('dp_fileDone'), '#ffd35a'); CP.R.confetti(120); CP.Audio.fanfare(); }
  else { CP.UI.toast(CP.t('dp_clue', { k: CP.num(f.clues) }), 'ok'); CP.Audio.chime('xp'); }
});

/* ---------- uniform unlock + menu cards ---------- */
DP.UNI_RANK = 6;
CP.bus.on('shiftStart', () => { const s = CP.G.shift; const white = CP.S.uniform === 'white' && CP.Prog.rankOf(CP.G.career.xp) >= DP.UNI_RANK; s.officer.char = white ? 1 : 0; s.partner.char = white ? 0 : 1; });
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { menu.apply(this, arguments); const saved = CP.loadSaved(); const car = saved && saved.career; const cards = document.querySelector('.rv-cards'); if (!car || !cards) return;
    const f = car.casefile || { clues: 0, done: 0 };
    cards.appendChild(dh('div', { class: 'rv-card static' }, dh('span', { class: 'rv-ci' }, '🗂'), dh('span', { class: 'rv-ct' }, dh('b', null, CP.t('dp_file')), dh('small', null, CP.t('dp_fileSub', { k: CP.num(f.clues), d: CP.num(f.done) }))), dh('span', { class: 'dp-pips' }, ...[0, 1, 2, 3, 4].map(i => dh('i', { class: i < f.clues ? 'on' : '' })))));
    const ri = CP.Prog.rankOf(car.xp), ok = ri >= DP.UNI_RANK, on = CP.S.uniform === 'white';
    cards.appendChild(dh('button', { class: 'rv-card' + (ok ? '' : ' locked'), 'aria-disabled': ok ? 'false' : 'true', onclick: () => { if (!ok) { CP.UI.toast(CP.t('dp_uniLocked', { r: CP.Prog.rankName(DP.UNI_RANK) }), 'warn'); return; } CP.S.uniform = on ? 'navy' : 'white'; CP.saveSettings(); CP.Audio.click(); CP.Screens.menu(); } },
      dh('span', { class: 'rv-ci' }, ok ? (on ? '🤍' : '💙') : '🔒'), dh('span', { class: 'rv-ct' }, dh('b', null, CP.t('dp_uniform')), dh('small', null, ok ? CP.t(on ? 'dp_uniOn' : 'dp_uniOff') : CP.t('dp_uniLocked', { r: CP.Prog.rankName(DP.UNI_RANK) })))));
  }; }
;(window.CP_FILES = window.CP_FILES || {})['27_depth'] = '2.2.5';
