/* Economy (v2.1)
   - EGP wallet on the career. Salary every shift: base by rank + performance, clean-record, directive, streak and wanted
     bonuses, minus complaints. Itemised payslip on the report screen.
   - Shop (menu): equipment and cosmetics with real effects — LED floodlights, plate-reader camera, radio upgrade, booth AC,
     coffee thermos (per-shift consumable), gold nameplate trim. Unlock tiers by rank.
   - Wanted board: three live warrants per shift (face, name, plate, vehicle, crime, reward). The wanted-vehicle event draws
     from the board; an arrest pays the reward in EGP and rolls a new warrant. HUD button opens the premium board.
   - Fix: daily/free shifts now merge XP, EGP and mail back into the career, so the rank you earned is the rank you keep.
   - Radio sound effects: squelch, static bed and end beep on every dispatch message. */
CP.addStrings({
  ec_egp: ['ج.م', 'EGP'], ec_wallet: ['الرصيد', 'Wallet'], ec_pay: ['💵 كشف المرتب', '💵 Payslip'], ec_base: ['أساسي الرتبة', 'Rank base'], ec_perf: ['أداء الوردية', 'Shift performance'], ec_clean: ['سجل نظيف', 'Clean record'],
  ec_dir: ['التزام بالتعليمات', 'Directives'], ec_streak: ['ستريك يومي', 'Daily streak'], ec_wanted: ['مكافآت المطلوبين', 'Warrant rewards'], ec_cmp: ['شكاوى', 'Complaints'], ec_total: ['الإجمالي', 'Total'],
  ec_shop: ['المتجر', 'Shop'], ec_shopSub: ['تجهيزات ومظهر بجنيهات الوردية', 'Gear and looks, paid with shift money'], ec_buy: ['شراء', 'Buy'], ec_owned: ['مملوك ✓', 'Owned ✓'], ec_poor: ['الرصيد مش كفاية', 'Not enough money'], ec_rank: ['يتفتح عند {r}', 'Unlocks at {r}'],
  ec_i_leds: ['كشافات LED', 'LED floodlights'], ec_i_ledsD: ['إضاءة ليلية أقوى وتفتيش أسهل', 'Brighter nights, easier searches'],
  ec_i_cam: ['كاميرا قراءة لوحات', 'Plate-reader camera'], ec_i_camD: ['تنبيه فوري لما لوحة مطلوبة تدخل الكمين', 'Instant alert when a wanted plate enters the checkpoint'],
  ec_i_radio: ['لاسلكي حديث', 'Modern radio'], ec_i_radioD: ['الاستعلام أسرع ٢٥٪', 'Verification 25% faster'],
  ec_i_ac: ['تكييف الكشك', 'Booth AC'], ec_i_acD: ['الزميل بيخلص مهامه أسرع ٢٠٪', 'Partner finishes tasks 20% faster'],
  ec_i_coffee: ['ترمس قهوة (وردية واحدة)', 'Coffee thermos (one shift)'], ec_i_coffeeD: ['+٢٠ ثانية على مهلة الكومبو', '+20 s on the combo timer'],
  ec_i_trim: ['شارة ذهبية', 'Gold nameplate trim'], ec_i_trimD: ['لقبك بيلمع فوق راسك', 'Your title glows above your head'],
  ec_board: ['🚨 لوحة المطلوبين', '🚨 Wanted board'], ec_boardSub: ['٣ أوامر ضبط سارية — راقب اللوحات', '3 live warrants — watch the plates'], ec_reward: ['مكافأة', 'Reward'], ec_crime: ['التهمة', 'Charge'],
  ec_c1: ['هروب من حادث', 'Hit and run'], ec_c2: ['تهريب بضائع', 'Smuggling'], ec_c3: ['سرقة سيارة', 'Vehicle theft'], ec_c4: ['نصب واحتيال', 'Fraud'], ec_c5: ['مخدرات', 'Narcotics'], ec_c6: ['هروب من الحبس', 'Escaped custody'],
  ec_arrest: ['🚨 قبضت على مطلوب: {n} — +{r} ج.م', '🚨 Warrant served: {n} — +{r} EGP'], ec_camAlert: ['📷 كاميرا اللوحات: لوحة مطلوبة داخلة دلوقتي!', '📷 Plate reader: a wanted plate is rolling in now!'],
  ec_merged: ['الخبرة والفلوس اتضافت لمسيرتك', 'XP and money added to your career']
});
CP.Econ = {}; const EC = CP.Econ, eh = CP.h;
CP.addStrings({ v_hatch_silver: ['هاتشباك فضي', 'Silver hatchback'], v_sedan_white: ['ملاكي بيضا', 'White sedan'], v_suv_navy: ['دفع رباعي كحلي', 'Navy SUV'], v_pickup_white: ['نص نقل دبل كابينة', 'Double-cab pickup'], v_tuktuk: ['توك توك', 'Tuk-tuk'], v_moto_delivery: ['موتوسيكل دليفري', 'Delivery bike'], v_moto_black: ['موتوسيكل', 'Motorbike'], v_van_white: ['فان بيضا', 'White van'], v_box_truck_white: ['نقل صندوق', 'Box truck'] });
const ecCar = () => (CP.G && CP.G.career) || null;
EC.wallet = c => { c.egp = c.egp || 0; return c.egp; };
EC.fmt = n => CP.num(Math.round(n)) + ' ' + CP.t('ec_egp');
EC.addMoney = function (n, quiet) { const c = ecCar(); if (!c) return; EC.wallet(c); c.egp = Math.max(0, c.egp + n); if (CP.Guard) CP.Guard.legit('egp', n); if (!quiet && n) CP.R.popup((n > 0 ? '+' : '') + EC.fmt(n), null, null, n > 0 ? '#8fe3a8' : '#ff8a8a'); EC.refreshHud(); };

/* ---------- radio sfx ---------- */
CP.Audio.radioSfx = function (kind) { if (!this.ok) return; const t = this.ctx.currentTime; const L = kind === 'long' ? 1.3 : 0.7; this.burst(0.06, 0.32, 2400, 1.6, t); this.burst(L, 0.12, 1700, 0.5, t + 0.05, 'bandpass'); this.burst(L * 0.6, 0.06, 900, 0.7, t + 0.12, 'bandpass'); this.burst(0.09, 0.14, 4000, 1.5, t + L + 0.02, 'bandpass'); this.tone('sine', 1180, 0.09, 0.05, t + L + 0.08); this.tone('sine', 1480, 0.07, 0.035, t + L + 0.2); };
{ const bn = CP.UI.banner; CP.UI.banner = function (text, kind) { if (/📻|🚨|📷/.test(String(text))) CP.Audio.radioSfx(kind === 'emergency' ? 'long' : 'short'); return bn.apply(this, arguments); }; }
{ const lg = CP.Events.log; CP.Events.log = function (type, text, kind) { CP.Audio.radioSfx(kind === 'emergency' ? 'long' : 'short'); return lg.apply(this, arguments); }; }
{ const rc = CP.Audio.radioClick; CP.Audio.radioClick = function (reply) { rc.apply(this, arguments); if (reply) this.radioSfx('short'); }; }

/* pause every sound when the tab goes to the background, resume when it comes back */
document.addEventListener('visibilitychange', () => { const A = CP.Audio; try { if (document.hidden) { if (A.ctx && A.ctx.state === 'running') A.ctx.suspend(); if (A.music && A.music.el && !A.music.el.paused) { A.music._wasPlaying = true; A.music.el.pause(); } } else { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); if (A.music && A.music.el && A.music._wasPlaying) { A.music._wasPlaying = false; A.music.el.play().catch(() => {}); } } } catch (e) { } });
/* ---------- career merge for daily / free shifts ---------- */
/* daily / free shifts run on a copy of the career: the copy now starts with the real wallet, gear, perks and board,
   and at the end the wallet, XP, mail and board are written back — nothing earned there is lost */
CP.addStrings({ ec_carry: ['الفلوس والخبرة اتضافت لمسيرتك', 'Money and XP carried to your career'] });
{ const ds = CP.Daily && CP.Daily.start; if (ds) CP.Daily.start = function () { const r = ds.apply(this, arguments); EC.borrow(); return r; }; }
window.addEventListener('load', () => { const fr = CP.Main && CP.Main.free; if (fr) CP.Main.free = function () { const r = fr.apply(this, arguments); EC.borrow(); return r; }; });
EC.borrow = function () { try { const G = CP.G; if (!G || G.mode === 'career') return; const k = CP.SAVE_KEY; CP.SAVE_KEY = 'cpns_save_v1'; const car = CP.loadSaved(); CP.SAVE_KEY = k; if (!car || !car.career) return; for (const f of ['egp', 'gear', 'perks', 'board', 'mail', 'style', 'regulars', 'casefile']) if (car.career[f] != null) G.career[f] = JSON.parse(JSON.stringify(car.career[f])); G.career._borrowedXp = car.career.xp; EC.refreshHud(); } catch (e) { console.warn('borrow', e); } };
{ const fin = CP.Career.finishShift; CP.Career.finishShift = function () { const r = fin.apply(this, arguments); try { const G = CP.G, s = G.shift; if (s && s.prog && !s.pay) EC.pay(s, s.report); if (G.mode === 'career') CP.save('auto'); if (G.mode !== 'career' && s && s.prog) { const k = CP.SAVE_KEY; CP.SAVE_KEY = 'cpns_save_v1'; const car = CP.loadSaved(); if (car && car.career) { car.career.xp = Math.max(car.career.xp || 0, (G.career._borrowedXp != null ? G.career._borrowedXp : car.career.xp || 0) + (s.prog.xp || 0)); car.career.egp = Math.max(0, (G.career.egp || 0)); car.career.mail = G.career.mail || car.career.mail; car.career.board = G.career.board || car.career.board; car.career.regulars = G.career.regulars || car.career.regulars; car.career.casefile = G.career.casefile || car.career.casefile; CP.Prog.ensure(car.career); const keep = CP.G; CP.G = car; CP.save(); CP.G = keep; CP.UI.toast(CP.t('ec_carry'), 'ok'); } CP.SAVE_KEY = k; } } catch (e) { console.warn('merge', e); } return r; }; }

/* ---------- salary ---------- */
EC.pay = function (s, rep) {
  const car = ecCar(); const ri = CP.Prog.rankOf(car.xp); const m = s.events.mail || { cmp: [], cmd: [] };
  const rows = []; const add = (k, v) => { if (v) rows.push([k, v]); };
  add('ec_base', 900 + ri * 260); add('ec_perf', Math.round(Math.max(0, ((rep && rep.score) || 0) - 50) * 12)); add('ec_clean', m.cmp.length ? 0 : 150);
  add('ec_dir', s.events.dirMiss ? 0 : (s.events.directives && s.events.directives.length ? 120 : 0)); add('ec_streak', Math.min(300, (car.streak || 0) * 50)); add('ec_wanted', s.events.warrantPay || 0); add('ec_cmp', -100 * m.cmp.length);
  const total = rows.reduce((a, r) => a + r[1], 0); s.pay = { rows, total }; EC.addMoney(total, true); return s.pay;
};
CP.bus.on('caseClosed', c => { const s = CP.G.shift; if (s && s.events.directives && c.res && s.events.directives.some(k => CP.Feat.RULES[k].cond(c, s) && !CP.Feat.RULES[k].ok(c))) s.events.dirMiss = true; });
{ const rep = CP.Screens.report; CP.Screens.report = function (r) { const s = CP.G.shift; const pay = s ? (s.pay || EC.pay(s, r)) : null; if (s) s.events.coffee = false; const out = rep.apply(this, arguments); if (!pay) return out;
    const host = document.querySelector('#report .mc, #report'); const card = eh('div', { class: 'card col payslip' }, eh('b', null, CP.t('ec_pay')), ...pay.rows.map(([k, v]) => eh('div', { class: 'prow' + (v < 0 ? ' neg' : '') }, eh('span', null, CP.t(k)), eh('b', null, (v > 0 ? '+' : '') + EC.fmt(v)))), eh('div', { class: 'prow total' }, eh('span', null, CP.t('ec_total')), eh('b', null, EC.fmt(pay.total))), eh('div', { class: 'small muted' }, CP.t('ec_wallet') + ': ' + EC.fmt(EC.wallet(ecCar()))));
    const anchor = host && host.querySelector('.mail'); if (anchor) anchor.parentElement.insertBefore(card, anchor); else if (host) host.appendChild(card); return out; }; }

/* ---------- search pay: professionalism earns money ---------- */
CP.addStrings({ ec_searchPay: ['أجر تفتيش', 'Search fee'], ec_searchBad: ['تفتيش بدون مبرر — بدون أجر', 'Search without grounds — no fee'] });
CP.bus.on('searchDone', ({ c, zone }) => { const valid = c.k.searchReason && CP.Cases.searchReasonValid(c, c.k.searchReason); const found = (c.inv && c.inv.zones && c.inv.zones[zone] || []).length; const cue = (c.cues || []).some(x => x === 'bulge' || x === 'welding');
  if (!valid) { CP.UI.toast(CP.t('ec_searchBad'), 'warn'); return; } const n = 40 + (c.k.consent ? 20 : 0) + found * 60 + (cue ? 80 : 0); EC.addMoney(n); CP.UI.toast(CP.t('ec_searchPay') + ' +' + EC.fmt(n), 'ok'); });
/* ---------- shop ---------- */
EC.ITEMS = { leds: { price: 3500, rank: 2 }, cam: { price: 6000, rank: 4 }, radio: { price: 2500, rank: 1 }, ac: { price: 4000, rank: 3 }, coffee: { price: 600, rank: 0, consumable: true }, trim: { price: 2000, rank: 5 },
  bodycam: { price: 4500, rank: 3 }, tow: { price: 5500, rank: 4 }, radar: { price: 7000, rank: 5 }, drone: { price: 12000, rank: 7 }, shades: { price: 1500, rank: 2 }, siren: { price: 2500, rank: 3 } };
CP.addStrings({ ec_i_bodycam: ['كاميرا صدر', 'Body camera'], ec_i_bodycamD: ['الشكاوى بتتشال لو التفتيش كان بمبرر', 'Complaints dropped when a search had grounds'], ec_i_tow: ['عقد ونش', 'Tow contract'], ec_i_towD: ['العربيات العطلانة بتتشال في نص الوقت', 'Stalled cars cleared in half the time'],
  ec_i_radar: ['رادار سرعة', 'Speed radar'], ec_i_radarD: ['بيوقّع مخالفة سرعة تلقائي: +١٢٠ ج.م لكل عربية مسرعة', 'Auto-tickets speeders: +120 EGP each'], ec_i_drone: ['درون مراقبة', 'Surveillance drone'], ec_i_droneD: ['بيكشف نوع القضية للعربية الجاية قبل ما توصل', 'Reveals the next car\'s case family before it arrives'],
  ec_i_shades: ['نضارة شمس', 'Aviator shades'], ec_i_shadesD: ['+٨ صبر للسواقين، وشكل أحلى', '+8 driver patience, and you look the part'], ec_i_siren: ['سرينة مخصصة', 'Custom siren'], ec_i_sirenD: ['صوت سرينة مميز عند ضبط مطلوب', 'A signature siren on every warrant arrest'] });
EC.own = k => { const c = ecCar(); return !!(c && c.gear && c.gear[k]); };
EC.shop = function () {
  const car = ecCar(); if (!car) return; car.gear = car.gear || {}; const ri = CP.Prog.rankOf(car.xp); const wrap = eh('div', { class: 'modal' }); const close = () => wrap.remove();
  const item = (k, it) => { const own = !!car.gear[k], ok = ri >= it.rank, can = EC.wallet(car) >= it.price; const icon = { leds: '💡', cam: '📷', radio: '📻', ac: '❄️', coffee: '☕', trim: '✨', bodycam: '🎥', tow: '🚛', radar: '📡', drone: '🛸', shades: '🕶️', siren: '🚨' }[k];
    return eh('button', { class: 'perk shop' + (own ? ' own' : ok ? '' : ' locked'), onclick: () => { if (own && !it.consumable) return; if (!ok) { CP.UI.toast(CP.t('ec_rank', { r: CP.Prog.rankName(it.rank) }), 'warn'); return; } if (!can) { CP.UI.toast(CP.t('ec_poor'), 'warn'); CP.Audio.chime('bad'); return; } EC.addMoney(-it.price, true); car.gear[k] = it.consumable ? (car.gear[k] || 0) + 1 : true; CP.save(); CP.Audio.fanfare(); CP.Polish.burst && CP.Polish.burst(wrap.querySelector('.wallet')); close(); EC.shop(); } },
      eh('span', { class: 'pk-i' }, icon), eh('span', { class: 'pk-t' }, eh('b', null, CP.t('ec_i_' + k) + (it.consumable && car.gear[k] ? ' ×' + CP.num(car.gear[k]) : '')), eh('small', null, CP.t('ec_i_' + k + 'D'))), eh('span', { class: 'pk-c' }, own && !it.consumable ? CP.t('ec_owned') : ok ? EC.fmt(it.price) : CP.t('ec_rank', { r: CP.Prog.rankName(it.rank) }))); };
  wrap.appendChild(eh('div', { class: 'mc glass perks' }, eh('div', { class: 'row' }, eh('b', { style: 'font-size:1.2em' }, CP.t('ec_shop')), eh('span', { class: 'sp' }), eh('span', { class: 'tag ok wallet' }, '💵 ' + EC.fmt(EC.wallet(car))), eh('button', { class: 'btn sm ghost', onclick: close }, '✕')), eh('div', { class: 'small muted' }, CP.t('ec_shopSub')), eh('div', { class: 'perk-grid' }, eh('div', { class: 'perk-branch' }, ...['radio', 'leds', 'ac', 'bodycam'].map(k => item(k, EC.ITEMS[k]))), eh('div', { class: 'perk-branch' }, ...['coffee', 'cam', 'tow', 'radar'].map(k => item(k, EC.ITEMS[k]))), eh('div', { class: 'perk-branch' }, ...['shades', 'siren', 'trim', 'drone'].map(k => item(k, EC.ITEMS[k]))))));
  document.body.appendChild(wrap);
};
// effects
{ const add = CP.Tasks.add; CP.Tasks.add = function (spec) { if (spec.type === 'radio' && EC.own('radio')) spec = Object.assign({}, spec, { dur: spec.dur * 0.75 }); if (spec.owner === 'partner' && EC.own('ac')) spec = Object.assign({}, spec, { dur: spec.dur * 0.8 }); return add.call(this, spec); }; }
CP.bus.on('shiftStart', () => { const c = ecCar(); if (!c) return; c.gear = c.gear || {}; if (c.gear.coffee > 0) { c.gear.coffee--; CP.G.shift.events.coffee = true; } CP.Pulse.comboTimeout = (CP.Feat.has('memory') ? 85 : 55) + (CP.G.shift.events.coffee ? 20 : 0); });
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); if (!EC.own('leds') || (this.nightLvl || 0) < 0.3) return; const ctx = this.ctx, R = this; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const fx of [8.4, 35.2]) { const cx = R.sx(fx + 0.6), cy = R.sy(R.Y.mainFar - 0.6); const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 7 * R.ppm); g.addColorStop(0, `rgba(220,235,255,${0.2 * this.nightLvl})`); g.addColorStop(1, 'rgba(220,235,255,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.35); ctx.beginPath(); ctx.arc(0, 0, 7 * R.ppm, 0, 6.283); ctx.fill(); ctx.restore(); } ctx.restore(); }; }

/* ---------- wanted board ---------- */
EC.CRIMES = ['ec_c1', 'ec_c2', 'ec_c3', 'ec_c4', 'ec_c5', 'ec_c6'];
EC.board = () => { const c = ecCar(); c.board = c.board || []; let guard = 0; while (c.board.length < 3 && guard++ < 30) { const w = EC.warrant(); if (!c.board.some(x => x.name.ar === w.name.ar)) c.board.push(w); } return c.board; };
EC.warrant = function () { const types = ['classic_sedan', 'silver_sedan', 'sedan_white', 'hatch_silver', 'suv_navy', 'van_white', 'pickup_white', 'courier_van'].filter(t => CP.C.veh[t]); const type = types[Math.floor(Math.random() * types.length)];
  const g = Math.random() < 0.85 ? 'm' : 'f'; const first = (g === 'm' ? CP.C.maleFirst : CP.C.femaleFirst); const fam = CP.C.family; const nm = { ar: CP.L({ ar: first[Math.floor(Math.random() * first.length)][0], en: '' }) || '', en: '' };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)]; const f = pick(first), l = pick(fam); const name = { ar: (Array.isArray(f) ? f[0] : f) + ' ' + (Array.isArray(l) ? l[0] : l), en: (Array.isArray(f) ? f[1] : f) + ' ' + (Array.isArray(l) ? l[1] : l) };
  const n = 2 + Math.floor(Math.random() * 2); const L = CP.C.plateLetters.length; const plate = { l: Array.from({ length: n }, () => Math.floor(Math.random() * L)), d: String(Math.random() < 0.6 ? 1000 + Math.floor(Math.random() * 9000) : 100 + Math.floor(Math.random() * 900)) };
  const PR = CP.C.portraits || {}; const pool = Object.keys(PR).filter(k => PR[k] && PR[k].g === g); const portraits = pool.length ? pool : null; return { id: 'W' + Date.now().toString(36) + Math.floor(Math.random() * 999), name, g, type, plate, crime: pick(EC.CRIMES), reward: 800 + 100 * Math.floor(Math.random() * 18), portrait: portraits ? pick(portraits) : null };
};
{ const start = CP.Events.start; CP.Events.start = function (t) { const r = start.call(this, t); if (t === 'wanted' && r && ecCar()) { const b = EC.board(); const w = b[Math.floor(Math.random() * b.length)]; const E = CP.G.shift.events.wanted; const c = CP.G.shift.cases[E.caseId]; if (c && w) { E.plate = w.plate; E.warrant = w.id; c.flags.lookoutPlate = w.plate; if (c.variant === 'B') c.plate = w.plate; c.type = w.type; if (CP.C.veh[w.type]) { c.driver.name = w.name; c.owner.name = w.name; if (w.portrait) c.driver.portrait = w.portrait; } } } return r; }; }
CP.bus.on('caseClosed', c => { const s = CP.G.shift, E = s.events.wanted; if (!E || !E.warrant || c.id !== E.caseId || c.variant !== 'B' || !c.res || ['hold', 'handover', 'refer_admin'].indexOf(c.res.decision) < 0) return; const car = ecCar(); const i = car.board.findIndex(w => w.id === E.warrant); if (i < 0) return; const w = car.board[i]; car.board.splice(i, 1); EC.board(); s.events.warrantPay = (s.events.warrantPay || 0) + w.reward; EC.addMoney(w.reward); CP.UI.banner(CP.t('ec_arrest', { n: CP.L(w.name), r: CP.num(w.reward) }), 'ok'); CP.R.stamp(CP.t('ec_reward') + ' +' + EC.fmt(w.reward), '#ffd35a'); CP.Audio.fanfare(); EC.refreshHud(); });
CP.bus.on('spawn', v => { const s = CP.G.shift, E = s.events.wanted; if (E && E.spawned && v.id === E.vid && EC.own('cam')) { CP.UI.banner(CP.t('ec_camAlert'), 'emergency'); CP.R.punch(); } });
EC.boardModal = function () {
  const car = ecCar(); if (!car) return; const b = EC.board(); const wrap = eh('div', { class: 'modal' }); const close = () => wrap.remove();
  wrap.appendChild(eh('div', { class: 'mc glass perks board' }, eh('div', { class: 'row' }, eh('b', { style: 'font-size:1.2em' }, CP.t('ec_board')), eh('span', { class: 'sp' }), eh('button', { class: 'btn sm ghost', onclick: close }, '✕')), eh('div', { class: 'small muted' }, CP.t('ec_boardSub')),
    eh('div', { class: 'wgrid' }, ...b.map(w => { const V = CP.C.veh[w.type]; const el = eh('div', { class: 'wcard' }, eh('div', { class: 'wstamp' }, 'WANTED'), w.portrait ? CP.A.portrait(w.portrait, 96) : eh('div', { class: 'wph' }, '👤'), eh('b', null, CP.L(w.name)), eh('div', { class: 'small' }, CP.t('ec_crime') + ': ' + CP.t(w.crime)), eh('div', { class: 'small' }, V ? CP.L({ ar: V.colour[0] + ' ' + V.make[0], en: V.colour[1] + ' ' + V.make[1] }) : ''), eh('div', { class: 'wplate' }, CP.plateStr(w.plate, CP.lang)), eh('div', { class: 'wreward' }, CP.t('ec_reward') + ' ' + EC.fmt(w.reward))); return el; }))));
  document.body.appendChild(wrap);
};

/* ---------- HUD: wallet + board button; compact top bar ---------- */
EC.refreshHud = function () { const car = ecCar(); const el = document.getElementById('hEgp'); if (el && car) el.textContent = EC.fmt(EC.wallet(car)); };
{ const bg = CP.UI.buildGame; CP.UI.buildGame = function () { const r = bg.apply(this, arguments); const hud = document.getElementById('hud'); if (!hud || document.getElementById('hEgp')) return r;
    const money = eh('div', { class: 'hi money' }, eh('b', { id: 'hEgp' }, '0'), eh('span', null, CP.t('ec_wallet'))); const btn = eh('button', { class: 'btn sm hboard', onclick: () => { CP.Audio.click(); EC.boardModal(); } }, '🚨');
    const sp = hud.querySelector('.sp'); if (sp) { hud.insertBefore(money, sp); hud.insertBefore(btn, sp); } else { hud.appendChild(money); hud.appendChild(btn); } EC.refreshHud(); return r; }; }
CP.bus.on('shiftStart', () => { EC.board(); setTimeout(EC.refreshHud, 50); });

/* ---------- menu: shop + wanted + painted street toggle ---------- */
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { menu.apply(this, arguments); const saved = CP.loadSaved(); const car = saved && saved.career; const cards = document.querySelector('.rv-cards'); if (!car || !cards) return; CP.G = CP.G || saved;
    cards.insertBefore(eh('button', { class: 'rv-card', onclick: () => { CP.G = saved; CP.Audio.click(); EC.shop(); } }, eh('span', { class: 'rv-ci' }, '🛒'), eh('span', { class: 'rv-ct' }, eh('b', null, CP.t('ec_shop')), eh('small', null, '💵 ' + EC.fmt(car.egp || 0))), eh('span', { class: 'rv-go' }, '›')), cards.children[1] || null);
    cards.appendChild(eh('button', { class: 'rv-card', onclick: () => { CP.G = saved; CP.Audio.click(); EC.boardModal(); } }, eh('span', { class: 'rv-ci' }, '🚨'), eh('span', { class: 'rv-ct' }, eh('b', null, CP.t('ec_board')), eh('small', null, CP.t('ec_boardSub'))), eh('span', { class: 'rv-go' }, '›')));
    const more = document.querySelector('.rv-more .col'); if (more) more.appendChild(eh('button', { class: 'btn mb', onclick: () => { CP.S.paintedStreet = CP.S.paintedStreet === false ? true : false; CP.saveSettings(); CP.UI.toast(CP.t('wd_street') + ': ' + (CP.S.paintedStreet === false ? 'OFF' : 'ON')); } }, CP.t('wd_street'))); }; }
;(window.CP_FILES = window.CP_FILES || {})['30_economy'] = '2.4.0';
