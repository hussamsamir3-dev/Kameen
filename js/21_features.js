/* v1.4 — career map, daily challenge, recurring characters, big-catch cinematics, detective streaks,
   "what you missed" feedback, weather, a small physics engine and cinematic environment lighting. */
CP.addStrings({
  map_title: ['خريطة الخدمة', 'Service map'], map_locked: ['🔒 بيتفتح برتبة {r}', '🔒 Unlocks at {r}'], map_pick: ['اختار الكمين', 'Choose your checkpoint'],
  map_new: ['📍 موقع جديد اتفتح: {l}', '📍 New location unlocked: {l}'], br_options: ['خيارات الوردية', 'Shift options'], br_go: ['▶ ابدأ الوردية', '▶ Start shift'],
  m_play: ['▶ العب', '▶ Play'], m_map: ['الخريطة', 'Map'], m_daily: ['تحدي اليوم', 'Daily challenge'], m_record2: ['السجل', 'Record'], m_more: ['المزيد', 'More'],
  daily_title: ['تحدي اليوم', 'Daily challenge'], daily_desc: ['وردية واحدة لكل الناس النهارده — نفس الموقع ونفس العربيات. حاول تجيب أعلى تقييم!', 'One shift for everyone today — same place, same traffic. Chase the top score!'],
  daily_best: ['أحسن نتيجة النهارده: {n}', "Today's best: {n}"], daily_none: ['لسه ماجربتش النهارده', 'Not played today yet'], daily_case: ['🎯 قضية اليوم في الطريق…', '🎯 Case of the day is on its way…'],
  daily_streak: ['🔥 {n} يوم تحدي ورا بعض', '🔥 {n}-day challenge streak'],
  cast_tag: ['⭐ شخصية متكررة — الزيارة {n}', '⭐ Recurring character — visit {n}'], cast_back: ['{n} راجع تاني!', '{n} is back!'],
  fx_catch: ['صيدة!', 'BIG CATCH!'], fx_life: ['أنقذت حياة', 'LIFE SAVED'], fx_det: ['🕵️ عين المحقق ×{n}', '🕵️ Detective eye ×{n}'],
  miss_title: ['اللي فاتك', 'What you missed'], miss_ok: ['فهمت', 'Got it'], miss_clues: ['الأدلة اللي كانت قدامك', 'Clues that were there'],
  miss_expiry_lic: ['رخصة القيادة كانت منتهية ({d})', 'The driving licence had expired ({d})'], miss_expiry_reg: ['رخصة العربية كانت منتهية ({d})', 'The vehicle licence had expired ({d})'],
  miss_owner: ['المالك في رخصة العربية مش هو السواق', 'The registered owner was not the driver'], miss_name_id: ['الاسم في الرخصة مختلف عن البطاقة', 'The licence name did not match the ID'],
  miss_photo: ['صورة الرخصة مش صورة السواق', 'The licence photo was not the driver'], miss_plate: ['رقم اللوحة مختلف عن الرخصة', 'The plate did not match the vehicle licence'],
  miss_cue: ['ماشفتش: {c}', 'You did not notice: {c}'], miss_unasked: ['ماطلبتش الأوراق خالص', 'You never asked for the documents'],
  docs_none: ['لسه مامعاكش الرخص — اطلبها من السواق الأول («مساء الخير — الرخص لو سمحت»)', 'You do not have the papers yet — ask the driver for them first'],
  a_more: ['الكل', 'All'], a_less: ['أقل', 'Less'],
  wx_clear: ['صافي', 'Clear'], wx_rain: ['مطر', 'Rain'], wx_fog: ['شبورة', 'Fog'], wx_dust: ['تراب', 'Dust'], wx_haze: ['حر وشبورة خفيفة', 'Heat haze'],
  wx_banner: ['الجو: {w}', 'Weather: {w}'], cap_rain: ['[مطر]', '[rain]'], cap_thunder: ['[رعد]', '[thunder]']
});
CP.addStrings({ tod_auto: ['تلقائي', 'Auto'] });

/* ======================= career map & location unlocks ======================= */
CP.LOC_RANK = { cairo: 0, desert: 1, alex: 2, hurghada: 3, sinai: 4, luxor: 5, aswan: 6 };
CP.LOC_POS = { alex: [150, 62], desert: [182, 84], cairo: [214, 108], sinai: [304, 150], hurghada: [282, 214], luxor: [246, 290], aswan: [252, 356] };
CP.locUnlocked = (loc, G) => { G = G || CP.G; if (!G || G.mode !== 'career') return true; return CP.Prog.rankOf(G.career.xp || 0) >= (CP.LOC_RANK[loc] || 0); };
CP.mapSVG = function (sel, onPick, G) {
  const pins = CP.LOC_ORDER.map(k => {
    const [x, y] = CP.LOC_POS[k]; const open = CP.locUnlocked(k, G); const on = sel === k;
    return `<g class="pin${open ? '' : ' locked'}${on ? ' on' : ''}" data-loc="${k}" tabindex="0" role="button" aria-label="${CP.t('loc_' + k)}"><circle cx="${x}" cy="${y}" r="${on ? 11 : 8}"/><circle class="ring" cx="${x}" cy="${y}" r="16"/><text x="${CP.lang === 'ar' ? x - 14 : x + 14}" y="${y + 4}" text-anchor="${CP.lang === 'ar' ? 'start' : 'start'}" direction="${CP.lang === 'ar' ? 'rtl' : 'ltr'}">${open ? '' : '🔒 '}${CP.t('loc_' + k).split(' — ')[0]}</text></g>`;
  }).join('');
  const html = `<svg class="egmap" viewBox="0 0 400 430" role="group" aria-label="${CP.t('map_title')}">
    <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16324f"/><stop offset="1" stop-color="#0c1c30"/></linearGradient>
    <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3024"/><stop offset="1" stop-color="#241d15"/></linearGradient></defs>
    <rect width="400" height="430" fill="url(#sea)"/>
    <path d="M18 60 C70 48 120 44 160 58 C185 66 205 60 228 58 L246 64 L250 150 C265 200 290 240 320 285 C345 320 368 360 392 428 L18 428 Z" fill="url(#land)" stroke="#c9a15a" stroke-opacity=".5"/>
    <path d="M256 64 L328 62 L318 110 L300 170 L284 150 L262 104 Z" fill="url(#land)" stroke="#c9a15a" stroke-opacity=".5"/>
    <path class="nile" d="M238 428 C236 390 250 360 248 330 C246 300 236 280 240 250 C242 220 228 190 226 160 C224 130 216 112 214 104 C200 90 176 70 158 60 M214 104 C222 90 226 76 230 60" fill="none"/>
    <text x="60" y="300" class="lbl2">الصحراء الغربية</text><text x="330" y="230" class="lbl2">البحر الأحمر</text><text x="120" y="36" class="lbl2">البحر المتوسط</text>
    ${pins}</svg>`;
  const wrap = document.createElement('div'); wrap.className = 'mapwrap'; wrap.innerHTML = html;
  wrap.querySelectorAll('.pin').forEach(p => { const go = () => onPick(p.dataset.loc); p.addEventListener('click', go); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); }); });
  return wrap;
};

/* ======================= daily challenge ======================= */
CP.Daily = {
  key: 'cpns_daily_v1', bestKey: 'cpns_daily_best',
  today() { return CP.Prog.today(); },
  hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; },
  spec() { const d = this.today(), h = this.hash('kameen-' + d); return { date: d, seed: h, loc: CP.LOC_ORDER[h % CP.LOC_ORDER.length], tod: ['dusk', 'night', 'dawn', 'day'][(h >>> 5) % 4], fam: ['alert', 'lookout', 'screening', 'borrowed', 'journey'][(h >>> 9) % 5], wx: (h >>> 13) % 5 }; },
  best() { try { const b = JSON.parse(localStorage.getItem(this.bestKey) || 'null'); return b || { date: null, best: 0, streak: 0, last: null }; } catch (e) { return { date: null, best: 0, streak: 0 }; } },
  record(score) {
    const b = this.best(), d = this.today();
    if (b.date !== d) { const y = new Date(); y.setDate(y.getDate() - 1); const yd = y.toISOString().slice(0, 10); b.streak = b.last === yd ? (b.streak || 0) + 1 : 1; b.date = d; b.best = 0; b.last = d; }
    b.best = Math.max(b.best || 0, score); try { localStorage.setItem(this.bestKey, JSON.stringify(b)); } catch (e) { }
    return b;
  },
  start() {
    const sp = this.spec(); CP.SAVE_KEY = this.key;
    const car = (() => { try { const k = CP.SAVE_KEY; CP.SAVE_KEY = 'cpns_save_v1'; const o = CP.loadSaved(); CP.SAVE_KEY = k; return o; } catch (e) { return null; } })();
    const o = CP.newCareer('daily'); o.rng = { s: sp.seed }; o.career.tutorialDone = true; o.career.shiftNo = 4; if (car) { o.career.xp = car.career.xp || 0; }
    CP.G = o; const keepTod = CP.S.tod, keepLen = CP.S.shiftMin; CP.S.tod = sp.tod; CP.S.shiftMin = 12;
    CP.Main.startShift(sp.loc); CP.S.tod = keepTod; CP.S.shiftMin = keepLen;
    const s = CP.G.shift; s.daily = { date: sp.date, fam: sp.fam, spawned: false }; s.weather = null; CP.Weather.init(s, true);
    CP.UI.banner(CP.t('daily_title') + ' — ' + CP.t('loc_' + sp.loc), 'ok');
  }
};

/* ======================= recurring characters ======================= */
CP.Cast = {
  list: {
    salah: { portrait: 2, type: 'cairo_taxi', pers: 'chatty', person: { first: ['صلاح', 'Salah'], father: ['عبد الحميد', 'Abdelhamid'], fam: ['المصري', 'El-Masry'], g: 'm', age: 64 },
      fams: ['expired', 'routine', 'overheat', 'routine'],
      lines: [['أهلاً يا باشا! أنا عم صلاح، سواق تاكسي من أربعين سنة.', "Evening, officer! I'm Uncle Salah — forty years behind this wheel."],
        ['إنت تاني يا باشا؟ ربنا يكرمك، فاكرني؟', 'You again, officer? God bless you — remember me?'],
        ['العربية دي مخها سخن زيي… الموتور بيسخن من الصبح.', "This car's as hot-headed as me… the engine's been overheating all day."],
        ['آخر وردية ليا قبل المعاش، قلت أعدي أسلّم عليك.', 'My last shift before retirement — thought I would say goodbye.']],
      fix: ['جددت الرخصة زي ما قلتلي يا باشا! شوف كده.', 'I renewed the licence like you said, officer — look!'] },
    nadia: { portrait: 13, type: 'maroon_hatch', pers: 'anxious', person: { first: ['نادية', 'Nadia'], father: ['حسن', 'Hassan'], fam: ['فؤاد', 'Fouad'], g: 'f', age: 45 },
      fams: ['medicine', 'routine', 'journey', 'routine'],
      lines: [['معايا أدوية والدتي، هي تعبانة شوية وأنا رايحة لها.', "I have my mother's medicine with me — she's unwell and I'm on my way to her."],
        ['الحمد لله ماما بقت أحسن، شكراً إنك كنت متفهم المرة اللي فاتت.', 'Mum is better now, thank God — thank you for being understanding last time.'],
        ['رايحة مشوار بعيد النهارده… ادعيلي.', 'Long trip today… wish me luck.'],
        ['دي آخر مرة هعدّي من هنا، اتنقلت شغلي. تسلم يا فندم.', 'Last time through here — I have been transferred. Thank you, officer.']] },
    karim: { portrait: 17, type: 'blue_hatch', pers: 'impatient', person: { first: ['كريم', 'Karim'], father: ['أشرف', 'Ashraf'], fam: ['السعيد', 'El-Saeed'], g: 'm', age: 22 },
      fams: ['borrowed', 'routine', 'journey', 'routine'],
      lines: [['معلش يا باشا مستعجل، عندي امتحان الصبح.', 'Sorry officer, I am in a hurry — exam in the morning.'],
        ['تاني الكمين ده؟ ماشي ماشي…', 'This checkpoint again? Fine, fine…'],
        ['نجحت في الامتحان على فكرة!', 'I passed the exam, by the way!'],
        ['اتخرجت يا باشا! أول عربية باسمي.', 'I graduated, officer! First car in my own name.']],
      fix: ['طلّعت رخصتي خلاص يا باشا! أهي باسمي المرة دي.', 'I got my own licence, officer — in my name this time.'] },
    fathi: { portrait: 22, type: 'box_truck', pers: 'patient', person: { first: ['فتحي', 'Fathy'], father: ['محمود', 'Mahmoud'], fam: ['عبد الرحيم', 'Abdelrehim'], g: 'm', age: 66 },
      fams: ['routine', 'lookout', 'routine', 'routine'],
      lines: [['سلام عليكم يا ابني، بوزّع خضار على المحلات من الفجر.', 'Peace be upon you, son — delivering vegetables to the shops since dawn.'],
        ['معايا طلبية كبيرة النهارده، الورق كله في التابلوه.', 'Big order today — all the paperwork is in the glovebox.'],
        ['ابني هيمسك الشغل بعدي إن شاء الله.', 'My son will take over the business after me, God willing.'],
        ['ربنا يحفظك يا ابني، دايماً محترم.', 'God keep you, son — always respectful.']] }
  },
  state() { const car = CP.G.career; car.cast = car.cast || {}; return car.cast; },
  maybeSpawn(s) {
    if (!CP.G || CP.G.mode !== 'career' || (CP.G.career.shiftNo || 1) < 2 || s.tutorial.step < 99 || s.castSpawned || s.t < 90) return false;
    const st = this.state(); const r = CP.srng();
    const ids = Object.keys(this.list).filter(id => (st[id] ? st[id].stage : 0) < 4 && !(st[id] && st[id].lastShift === s.no));
    if (!ids.length || r() > 0.5) { s.castSpawned = true; return false; }
    const id = ids[Math.floor(r() * ids.length)]; const P = this.list[id]; const stage = st[id] ? st[id].stage : 0;
    const ret = { person: P.person, portrait: P.portrait, civ: 1, pers: P.pers, type: P.type, lastFam: st[id] ? st[id].lastFam : null, lastOutcome: st[id] ? st[id].last : null, lastShift: st[id] ? st[id].lastShift : null, lastLoc: s.loc, name: null };
    const v = CP.T.spawnCivilian({ fam: P.fams[stage], type: P.type, ret }); if (!v) return false;
    const c = s.cases[v.caseId]; c.cast = { id, stage }; s.castSpawned = true;
    if (stage > 0) CP.UI.toast(CP.t('cast_back', { n: CP.L(P.person.first) }), 'ok');
    return true;
  },
  opener(c) {
    const P = this.list[c.cast.id]; const st = this.state()[c.cast.id];
    const fixed = P.fix && st && ['warning', 'citation', 'advice', 'refer_admin'].indexOf(st.last) >= 0 && c.cast.stage === 1;
    const L = fixed ? P.fix : P.lines[Math.min(3, c.cast.stage)]; return { ar: L[0], en: L[1] };
  }
};
CP.bus.on('caseClosed', c => {
  if (!c.cast || !CP.G || CP.G.mode !== 'career') return;
  const st = CP.Cast.state(); const o = st[c.cast.id] || { stage: 0 };
  st[c.cast.id] = { stage: Math.min(4, (o.stage || 0) + 1), last: c.res.decision, lastFam: c.fam, lastShift: CP.G.shift.no };
});
/* the recurring character greets you by story, right after you ask for the papers */
{ const ask = CP.Dlg.ask; CP.Dlg.ask = function (c, intent, tone) { const r = ask.apply(this, arguments); if (c && c.cast && intent === 'greet_docs' && !c.flags.castLine) { c.flags.castLine = true; CP.Dlg.say(c, 'driver', CP.Cast.opener(c)); } return r; }; }
{ const pd = CP.Panels.dialogue; CP.Panels.dialogue = function (body, foot, c) { pd(body, foot, c); if (c && c.cast) { const who = body.querySelector('.who'); if (who) who.appendChild(CP.h('span', { class: 'tag am' }, CP.t('cast_tag', { n: CP.num(c.cast.stage + 1) }))); }
  const g = CP.UI.pulseIntent && body.querySelectorAll('.opts .btn'); if (g && CP.UI.pulseIntent) { const ints = CP.Dlg.intents(c); const i = ints.indexOf(CP.UI.pulseIntent); if (i >= 0 && g[i]) g[i].classList.add('pulse'); CP.UI.pulseIntent = null; } }; }

/* ======================= cinematics, detective streaks, "what you missed" ======================= */
CP.FX = { hold: false };
CP.FX.cinematic = function (title, sub, color, v) {
  CP.R.cine = { t0: CP.R.t, dur: 2.6, title, sub, color: color || '#ffd35a', vid: v ? v.id : null };
  CP.R.punch(); CP.R.confetti(90, CP.R.W / 2, CP.R.H * 0.3); CP.Audio.fanfare(); CP.Audio.burst(0.8, 0.35, 90, 1, undefined, 'lowpass');
};
CP.bus.on('caseClosed', c => {
  const s = CP.G && CP.G.shift; if (!s || !c.res || !c.res.eval) return; const e = c.res.eval; const v = CP.vehOfCase(c);
  if (e.escaped) return;
  const serious = CP.FAM[c.fam] && CP.FAM[c.fam].serious;
  if (e.sound && !e.waved) {
    s.detStreak = (s.detStreak || 0) + 1;
    if (serious && ['hold', 'handover', 'citation', 'refer_admin', 'medical'].indexOf(c.res.decision) >= 0) CP.FX.cinematic(CP.t(c.fam === 'medical' ? 'fx_life' : 'fx_catch'), CP.L(CP.famName[c.fam]), c.fam === 'medical' ? '#ff8a8a' : '#ffd35a', v);
    else if ([3, 5, 8, 12].indexOf(s.detStreak) >= 0) { CP.UI.banner(CP.t('fx_det', { n: CP.num(s.detStreak) }), 'ok'); CP.Audio.chime('combo'); CP.R.punch(); }
  } else if (!e.sound) { s.detStreak = 0; setTimeout(() => CP.FX.missed(c), 900); }
});
CP.FX.clues = function (c) {
  const out = []; const D = c.docs;
  for (const d of CP.Cases.trueDiscrepancies(c)) {
    const date = d.key === 'expiry_lic' ? CP.fmtDate(D.licence.exp) : d.key === 'expiry_reg' ? CP.fmtDate(D.reg.exp) : '';
    const k = 'miss_' + d.key; out.push(CP.STR.ar[k] ? CP.t(k, { d: date }) : d.key);
  }
  for (const q of c.cues || []) if (c.k.cuesSeen.indexOf(q) < 0 && CP.C.cues[q]) out.push(CP.t('miss_cue', { c: CP.L(CP.C.cues[q]) }));
  if (!c.k.docsViewed && !c.res.eval.waved) out.push(CP.t('miss_unasked'));
  return out.slice(0, 5);
};
CP.FX.missed = function (c) {
  if (!CP.G || !CP.G.shift || CP.G.shift.ended || document.querySelector('.missed')) return;
  const e = c.res.eval; const v = CP.vehOfCase(c); CP.R.missVid = v ? v.id : null; CP.R.missT = CP.R.t;
  const clues = CP.FX.clues(c); const notes = (e.notes || []).map(n => CP.L(n)).slice(-3);
  CP.FX.hold = true; CP.Audio.chime('bad');
  const card = CP.h('div', { class: 'missed', role: 'dialog' }, CP.h('div', { class: 'mh' }, CP.h('span', { class: 'mi' }, '🔍'), CP.h('b', null, CP.t('miss_title')), CP.h('span', { class: 'tag' }, c.id + ' • ' + CP.t('v_' + c.type))),
    clues.length ? CP.h('div', { class: 'col' }, CP.h('div', { class: 'lbl' }, CP.t('miss_clues')), ...clues.map(t => CP.h('div', { class: 'clue' }, '• ' + t))) : null,
    CP.h('div', { class: 'small muted', style: 'white-space:pre-line' }, notes.join('\n')),
    CP.h('button', { class: 'btn pri', onclick: () => { card.remove(); CP.FX.hold = false; CP.R.missVid = null; } }, CP.t('miss_ok')));
  document.getElementById('stage').appendChild(card); card.querySelector('.btn').focus();
  setTimeout(() => { if (card.isConnected && CP.FX.hold) { /* auto-dismiss after 12 s so the shift never stalls */ card.remove(); CP.FX.hold = false; CP.R.missVid = null; } }, 12000);
};

/* ======================= weather ======================= */
CP.Weather = {
  KINDS: ['clear', 'rain', 'fog', 'dust', 'haze'],
  init(s, force) {
    if (s.weather && !force) return;
    const r = CP.srng(); const loc = s.loc, tod = s.tod || 'dusk'; let k = 'clear';
    if (s.weatherForce != null) k = this.KINDS[s.weatherForce];
    else { const x = r();
      if (loc === 'alex') k = x < 0.35 ? 'rain' : x < 0.45 ? 'fog' : 'clear';
      else if (loc === 'cairo') k = x < 0.08 ? 'rain' : (tod === 'dawn' && x < 0.45) ? 'fog' : x < 0.6 ? 'haze' : 'clear';
      else if (loc === 'desert' || loc === 'sinai') k = x < 0.3 ? 'dust' : (tod === 'dawn' && x < 0.5) ? 'fog' : 'clear';
      else k = (tod === 'day' || tod === 'dusk') && x < 0.45 ? 'haze' : (tod === 'dawn' && x < 0.35) ? 'fog' : 'clear'; }
    s.weather = { kind: k, i: k === 'clear' ? 0 : 0.55 + r() * 0.45, wind: (r() - 0.3) * 2, flashT: 0 };
    if (k === 'dust') s.events.dustUntil = s.dur + 999;
    if (k !== 'clear') setTimeout(() => CP.UI.banner && CP.UI.banner(CP.t('wx_banner', { w: CP.t('wx_' + k) }), 'info'), 1500);
  },
  grip(s) { const w = s && s.weather; return w && w.kind === 'rain' ? 1 - 0.3 * w.i : 1; },
  vis(s) { const w = s && s.weather; return !w ? 1 : w.kind === 'fog' ? 1 - 0.55 * w.i : w.kind === 'rain' ? 1 - 0.25 * w.i : w.kind === 'dust' ? 1 - 0.45 * w.i : 1; }
};

/* ======================= physics: suspension, road excitation, weather grip ======================= */
CP.Phys = {
  kick(v, f, r) { const P = v.ph || (v.ph = { zf: 0, vf: 0, zr: 0, vr: 0 }); P.vf += f; P.vr += r; },
  /* two-axle spring-damper suspension: nose-dives under braking, squats under acceleration,
     bounces over the rumble strip and road texture, and rocks after a knock */
  step(v, dt, dx, row) {
    const P = v.ph || (v.ph = { zf: 0, vf: 0, zr: 0, vr: 0 });
    const heavy = v.len > 7;
    const k = heavy ? 55 : 78, c = heavy ? 8.5 : 9.5;           // realistic: firm springs, well damped (settles in ~1 bounce)
    const a = v.a || 0;
    const wt = CP.clamp(-a * 0.018, -0.055, 0.055);                 // weight transfer front/rear
    const ff = -k * (P.zf - wt) - c * P.vf, fr = -k * (P.zr + wt) - c * P.vr;
    const front = v.x, rear = v.x - v.len * 0.8;
    const hit = (p, x0) => row === 0 && v.v > 0.4 && p - dx < x0 && p >= x0;
    for (const x0 of [10.3, 10.45, 10.6, 10.75]) {
      if (hit(front, x0)) P.vf += 0.22 + v.v * 0.03;
      if (hit(rear, x0)) P.vr += 0.22 + v.v * 0.03;
    }
    if (v.v > 1.5 && Math.random() < 0.25) { const n = (Math.random() - 0.5) * v.v * 0.014; P.vf += n; P.vr -= n * 0.7; }
    if (v.stall && v.stallKind === 'overheat' && Math.random() < 0.2) { P.vf += 0.12; P.vr -= 0.1; }
    P.vf += ff * dt; P.vr += fr * dt; P.zf += P.vf * dt; P.zr += P.vr * dt;
    P.zf = CP.clamp(P.zf, -0.075, 0.075); P.zr = CP.clamp(P.zr, -0.075, 0.075);
    v.heave = (P.zf + P.zr) * 0.45;                                // metres of body travel
    v.pitch = CP.clamp((P.zf - P.zr) / Math.max(2.6, v.len * 0.8), -0.045, 0.045);
  }
};

/* ======================= environment: depth blur, god rays, sun, shadows, rain, fog, grading ======================= */
CP.Env = { graded: {}, grain: null };
/* static depth-of-field: far (top) part of a backdrop is progressively blurred, the road stays sharp */
CP.Env.gradedImg = function (id, frac) {
  if (CP.S.quality === 'low') return CP.A.img[id];
  if (this.graded[id]) return this.graded[id];
  const im = CP.A.img[id]; if (!im || !im.width) return im;
  const W = im.width, H = im.height; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.drawImage(im, 0, 0);
  const sm = document.createElement('canvas'); sm.width = Math.max(1, W >> 3); sm.height = Math.max(1, H >> 3); const sg = sm.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(im, 0, 0, sm.width, sm.height);
  const md = document.createElement('canvas'); md.width = W >> 1; md.height = H >> 1; const mg = md.getContext('2d'); mg.imageSmoothingQuality = 'high'; mg.drawImage(sm, 0, 0, md.width, md.height);
  const bl = document.createElement('canvas'); bl.width = W; bl.height = H; const bg = bl.getContext('2d'); bg.imageSmoothingQuality = 'high'; bg.drawImage(md, 0, 0, W, H);
  const mask = bg.createLinearGradient(0, 0, 0, H * frac);
  mask.addColorStop(0, 'rgba(0,0,0,0.85)'); mask.addColorStop(0.55, 'rgba(0,0,0,0.45)'); mask.addColorStop(0.9, 'rgba(0,0,0,0)'); mask.addColorStop(1, 'rgba(0,0,0,0)');
  bg.globalCompositeOperation = 'destination-in'; bg.fillStyle = mask; bg.fillRect(0, 0, W, H);
  g.drawImage(bl, 0, 0);
  this.graded[id] = cv; return cv;
};
CP.Env.shadowShift = function (x) {
  const s = CP.G.shift, n = CP.R.nightLvl || 0;
  if (n > 0.6) { const fx = Math.abs(x - 8.4) < Math.abs(x - 35.2) ? 8.4 : 35.2; return CP.clamp((x - fx) * 0.06, -0.9, 0.9); }
  const mins = CP.R.clockMins() % 1440; const sunX = CP.clamp((mins - 720) / 360, -1, 1);   // morning sun from the left, evening from the right
  return -sunX * 0.9;
};
CP.Env.back = function (s, ctx, W, H, ppm, Y, night) {
  // low sun: warm light shafts across the scene at dawn / dusk; moon shafts at night are very faint
  const mins = CP.R.clockMins() % 1440, day = 1 - night; const low = 1 - Math.min(1, Math.abs(night - 0.5) * 2);
  const inten = (day * 0.12 + low * 0.28) * (s.weather && s.weather.kind === 'rain' ? 0.3 : 1);
  if (inten > 0.02 && CP.S.quality !== 'low') {
    const fromLeft = mins < 720; ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const x0 = (fromLeft ? -0.1 : 1.1) * W, off = (i * 0.19 + Math.sin(CP.R.t * 0.07 + i) * 0.02) * W; const x1 = fromLeft ? off : W - off;
      const g = ctx.createLinearGradient(x0, 0, x1, H * 0.8); const col = low > 0.4 ? '255,170,90' : '255,240,200';
      g.addColorStop(0, `rgba(${col},${inten * 0.55})`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x1 - 40, H); ctx.lineTo(x1 + 30 + i * 14, H); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
};
CP.Env.front = function (s, ctx, W, H, ppm, Y, night, dt) {
  const R = CP.R, w = s.weather || { kind: 'clear', i: 0, wind: 0 };
  // volumetric floodlight cones (ray-marched look: layered additive cones with drifting dust motes)
  if (night > 0.35 && s.equipment.generator === 'ok' && CP.S.quality !== 'low') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const fx of [8.4, 35.2]) {
      const x = R.sx(fx - 0.1), top = R.sy(Y.mainFar + 0.12 + 4.0), bot = R.sy(Y.mainGround - 0.6);
      if (x < -W * 0.3 || x > W * 1.3) continue;
      for (let k = 0; k < 3; k++) {
        const spread = (2.2 + k * 1.1) * ppm; const a = (0.07 - k * 0.018) * night * (w.kind === 'fog' ? 2.2 : w.kind === 'rain' ? 1.6 : 1);
        const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, `rgba(255,240,205,${a})`); g.addColorStop(1, 'rgba(255,240,205,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 0.25 * ppm, top); ctx.lineTo(x + 0.25 * ppm, top); ctx.lineTo(x + spread, bot); ctx.lineTo(x - spread, bot); ctx.closePath(); ctx.fill();
      }
      for (let m = 0; m < 5; m++) { const t = R.t * 0.3 + m * 1.7; const mx = x + Math.sin(t * 1.3 + m) * 1.6 * ppm, my = top + ((t * 30 + m * 37) % Math.max(1, (bot - top))); ctx.fillStyle = `rgba(255,245,220,${0.14 * night})`; ctx.fillRect(mx, my, 1.2, 1.2); }
    }
    ctx.restore();
  }
  // rain: wind-driven streaks, road splashes (simple ballistic particles), darker wet grade, rare lightning
  if (w.kind === 'rain') {
    const n = Math.floor((CP.S.quality === 'low' ? 60 : 160) * w.i); R.rain = R.rain || [];
    while (R.rain.length < n) R.rain.push({ x: Math.random() * W, y: Math.random() * H, v: 700 + Math.random() * 400 });
    ctx.save(); ctx.strokeStyle = `rgba(200,215,235,${0.35 + 0.2 * night})`; ctx.lineWidth = 1; ctx.beginPath();
    const wx = w.wind * 120;
    for (const d of R.rain) { d.y += d.v * dt; d.x += wx * dt; if (d.y > H) { if (Math.random() < 0.35) R.splash.push({ x: d.x, y: R.sy(Y.mainGround - Math.random() * 1.8), t: 0 }); d.y = -20; d.x = Math.random() * W; } ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - wx * 0.02, d.y - 14); }
    ctx.stroke();
    R.splash = (R.splash || []).filter(p => (p.t += dt) < 0.3);
    ctx.strokeStyle = 'rgba(210,225,240,.5)'; for (const p of R.splash) { const r = 2 + p.t * 16; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * 0.3, 0, 0, 7); ctx.stroke(); }
    ctx.fillStyle = `rgba(20,30,45,${0.18 * w.i})`; ctx.fillRect(0, 0, W, H);
    w.flashT -= dt; if (w.i > 0.8 && Math.random() < dt * 0.02) { w.flashT = 0.25; setTimeout(() => CP.Audio.thunder && CP.Audio.thunder(), 700 + Math.random() * 1500); }
    if (w.flashT > 0) { ctx.fillStyle = `rgba(230,235,255,${w.flashT * 1.6})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  } else R.splash = R.splash || [];
  // fog / haze: drifting layered banks, thicker far away
  if (w.kind === 'fog' || w.kind === 'haze') {
    ctx.save(); const col = w.kind === 'fog' ? (night > 0.5 ? '120,130,150' : '215,220,228') : '240,215,170';
    for (let i = 0; i < 4; i++) {
      const y = R.sy(Y.mainFar + 0.5 + i * 1.6), off = ((R.t * (6 + i * 3) + i * 300) % (W + 600)) - 300;
      const g = ctx.createRadialGradient(off, y, 0, off, y, W * 0.5); const a = (w.kind === 'fog' ? 0.32 : 0.12) * w.i * (1 - i * 0.12);
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, y - W * 0.5, W, W);
    }
    const g2 = ctx.createLinearGradient(0, 0, 0, R.sy(Y.mainNear)); g2.addColorStop(0, `rgba(${col},${(w.kind === 'fog' ? 0.38 : 0.1) * w.i})`); g2.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, R.sy(Y.mainNear)); ctx.restore();
  }
  // filmic grade: warm highlights / cool shadows, lens vignette, fine grain
  ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, night > 0.5 ? 'rgba(90,120,200,.35)' : 'rgba(255,200,140,.28)'); gr.addColorStop(1, night > 0.5 ? 'rgba(20,30,60,.4)' : 'rgba(60,70,110,.25)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.45, W / 2, H * 0.45, Math.max(W, H) * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (!CP.S.reducedFx && CP.S.quality !== 'low') {
    if (!this.grain) { const g = document.createElement('canvas'); g.width = g.height = 128; const gc = g.getContext('2d'); const id = gc.createImageData(128, 128); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; } gc.putImageData(id, 0, 0); this.grain = ctx.createPattern(g, 'repeat'); }
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.translate((Math.random() * 128) | 0, (Math.random() * 128) | 0); ctx.fillStyle = this.grain; ctx.fillRect(-128, -128, W + 256, H + 256); ctx.restore();
  }
  // cinematic letterbox + title for big moments; red focus pulse for "what you missed"
  const cn = R.cine;
  if (cn) {
    const p = (R.t - cn.t0) / cn.dur; if (p >= 1) R.cine = null; else {
      const bar = H * 0.11 * Math.min(1, p * 5, (1 - p) * 5); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
      const sc = p < 0.15 ? 2.4 - 1.4 * (p / 0.15) : 1, a = p > 0.8 ? (1 - p) / 0.2 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.36); ctx.scale(sc, sc); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `900 ${Math.max(34, Math.min(76, W * 0.07))}px ${CP.UI.font()}`; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.strokeText(cn.title, 0, 0);
      ctx.fillStyle = cn.color; ctx.shadowColor = cn.color; ctx.shadowBlur = 30; ctx.fillText(cn.title, 0, 0); ctx.shadowBlur = 0;
      if (cn.sub) { ctx.font = `700 ${Math.max(14, Math.min(24, W * 0.022))}px ${CP.UI.font()}`; ctx.fillStyle = '#fff'; ctx.fillText(cn.sub, 0, Math.max(36, W * 0.045)); }
      ctx.restore();
    }
  }
  if (R.missVid) { const v = CP.T.get(R.missVid); if (v && v._scr) { const a = 0.5 + 0.5 * Math.sin((R.t - R.missT) * 6); ctx.save(); ctx.strokeStyle = `rgba(255,80,70,${a})`; ctx.lineWidth = 4; ctx.shadowColor = '#ff5040'; ctx.shadowBlur = 18; ctx.strokeRect(v._scr.left - 6, v._scr.top - 6, v._scr.w + 12, v._scr.h + 12); ctx.restore(); } }
};

/* rain bed + thunder (synthesised) */
CP.Audio.rainUpdate = function (s) {
  if (!this.ok) return; const w = s && s.weather; const want = w && w.kind === 'rain' && !CP.Screens.cur ? 0.09 * w.i : 0;
  if (!this.rainNode && want > 0) { const c = this.ctx; const src = c.createBufferSource(); src.buffer = this.pink || this.white; src.loop = true; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900; const g = c.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(this.amb); src.start(); this.rainNode = { g }; }
  if (this.rainNode) this.rainNode.g.gain.setTargetAtTime(want, this.ctx.currentTime, 0.8);
};
CP.Audio.thunder = function () { this.burst(2.4, 0.5, 70, 0.7, undefined, 'lowpass'); this.burst(1.2, 0.2, 180, 0.8, this.ok ? this.ctx.currentTime + 0.2 : undefined, 'lowpass'); this.cap('cap_thunder'); };

/* ======================= simplified dock: available actions first, "All" reveals the rest ======================= */
CP.UI.showAll = false;
CP.UI.simplifyDock = function () {
  const box = document.getElementById('actions'); if (!box) return;
  let t = box.querySelector('.act.more');
  if (!t) { t = CP.h('button', { class: 'act more', onclick: () => { CP.UI.showAll = !CP.UI.showAll; CP.UI.simplifyDock(); } }, CP.h('span', { class: 't' }), CP.h('span', { class: 's' })); box.appendChild(t); }
  let hidden = 0;
  for (const b of box.querySelectorAll('.act[data-a]')) { const off = b.getAttribute('aria-disabled') === 'true'; const hide = off && !CP.UI.showAll; b.classList.toggle('gone', hide); if (hide) hidden++; }
  t.querySelector('.t').textContent = CP.UI.showAll ? '⋯ ' + CP.t('a_less') : '⋯ ' + CP.t('a_more') + (hidden ? ' (' + CP.num(hidden) + ')' : '');
  t.classList.toggle('gone', !hidden && !CP.UI.showAll);
};
{ const rd = CP.UI.refreshDock; CP.UI.refreshDock = function () { rd.apply(this, arguments); CP.UI.simplifyDock(); }; }

/* ======================= documents: hint when the driver has not handed them over ======================= */
{
  const D = CP.Act.defs.docs;
  D.label = () => 'a_docs';
  D.run = function (v, c) {
    CP.Act.ensureNear(v, 'docs', () => {
      if (!c.k.docsHave) {
        CP.UI.toast(CP.t(c.k.docsHanding ? 'r_docsHanding' : 'docs_none'), 'warn'); CP.Audio.deny();
        if (!c.k.docsHanding) { CP.UI.pulseIntent = 'greet_docs'; CP.UI.open('dialogue', c.id); }
        return;
      }
      CP.UI.open('docs', c.id);
    });
  };
}

/* ======================= hooks into the loop ======================= */
CP.bus.on('stepEnd', () => {
  const s = CP.G && CP.G.shift; if (!s) return;
  if (!s.weather) CP.Weather.init(s);
  if (s.daily && !s.daily.spawned && s.t > 150 && s.t < s.dur - 60) { const v = CP.T.spawnCivilian({ fam: s.daily.fam }); if (v) { s.daily.spawned = true; CP.UI.banner(CP.t('daily_case'), 'info'); } }
  if (!s.castSpawned && s.t > 90 && Math.floor(s.t) % 20 === 0) CP.Cast.maybeSpawn(s);
});

/* ======================= simplified menu + map-based briefing ======================= */
{
  const sh = CP.h;
  CP.Screens.menu = function () {
    CP.Main.stop(); CP.Audio.stopAll(); this.from = 'menu';
    const e = this.show('menu'); e.innerHTML = '';
    const cv = sh('canvas', { class: 'bg', 'aria-hidden': 'true' });
    const saved = (() => { CP.SAVE_KEY = 'cpns_save_v1'; return CP.loadSaved(); })();
    const freeSaved = (() => { try { return !!localStorage.getItem('cpns_free_v1'); } catch (er) { return false; } })();
    const done = saved && saved.career.tutorialDone; const db = CP.Daily.best(); const today = db.date === CP.Daily.today();
    const tile = (icon, label, sub, fn, dis) => sh('button', { class: 'tile', 'aria-disabled': dis ? 'true' : 'false', onclick: () => { if (dis) { CP.UI.toast(dis, 'warn'); return; } fn(); } }, sh('span', { class: 'ti' }, icon), sh('b', null, label), sub ? sh('small', null, sub) : null);
    const mc = sh('div', { class: 'mc glass' },
      CP.Brand.logo({ size: 1, tag: false }),
      saved ? this.rankCard(saved.career) : sh('div', { class: 'muted' }, CP.t('subtitle')),
      sh('button', { class: 'btn pri mb play', onclick: () => saved ? CP.Main.continueCareer(saved) : CP.Main.newCareer() }, saved ? CP.t('m_play') + ' — ' + CP.t('m_careerOf', { n: CP.num(saved.career.shiftNo) }) : CP.t('m_play')),
      sh('div', { class: 'tiles' },
        tile('🗺️', CP.t('m_map'), null, () => { if (saved) { CP.Main.continueCareer(saved); } else CP.Main.newCareer(); }),
        tile('📅', CP.t('m_daily'), today ? CP.t('daily_best', { n: CP.num(db.best) }) : CP.t('daily_none'), () => CP.Daily.start(), done ? null : CP.t('m_freeLocked')),
        tile('🏆', CP.t('m_record2'), null, () => this.record(saved.career), saved ? null : CP.t('m_freeLocked')),
        tile('⚙️', CP.t('m_settings'), null, () => this.settings('menu'))),
      sh('details', { class: 'more' }, sh('summary', null, CP.t('m_more')),
        sh('div', { class: 'col' },
          sh('button', { class: 'btn mb', onclick: () => { if (saved) CP.UI.confirm(CP.t('m_newConfirm'), () => CP.Main.newCareer()); else CP.Main.newCareer(); } }, CP.t('m_new')),
          sh('button', { class: 'btn mb', 'aria-disabled': done ? 'false' : 'true', onclick: () => { if (!done) { CP.UI.toast(CP.t('m_freeLocked'), 'warn'); return; } CP.Main.free(false); } }, CP.t('m_free')),
          freeSaved && done ? sh('button', { class: 'btn mb', onclick: () => CP.Main.free(true) }, CP.t('m_continueFree')) : null,
          sh('button', { class: 'btn mb', onclick: () => this.how('menu') }, CP.t('m_how')),
          sh('div', { class: 'row' }, sh('button', { class: 'btn sm ghost', onclick: () => { CP.S.lang = CP.S.lang === 'ar' ? 'en' : 'ar'; CP.saveSettings(); CP.UI.applyLang(); this.menu(); } }, CP.lang === 'ar' ? 'English' : 'العربية'), sh('button', { class: 'btn sm ghost', onclick: () => CP.UI.quickMenu() }, '🔊 ' + CP.t('qm_music'))))),
      sh('div', { class: 'foot' }, sh('div', null, CP.t('credit')), sh('div', null, 'v' + CP.VERSION)));
    e.append(cv, sh('div', { class: 'shade' }), mc);
    this.menuScene(cv);
  };
  CP.Screens.briefing = function () {
    const G = CP.G; const e = this.show('briefing'); e.innerHTML = '';
    if (!this.loc || !CP.locUnlocked(this.loc)) this.loc = CP.LOC_ORDER.filter(k => CP.locUnlocked(k)).pop() || 'cairo';
    const L = CP.LOCS[this.loc]; const open = CP.locUnlocked(this.loc);
    const pv = document.createElement('canvas'); pv.width = 480; pv.height = 240; const pc = pv.getContext('2d');
    const img = L.bg.day ? CP.A.img[L.bg.day] : CP.A.img[L.bg.single]; if (img) pc.drawImage(img, 0, img.height * 0.05, img.width, img.width / 2, 0, 0, 480, 240);
    if (L.bg.night && CP.A.img[L.bg.night]) { pc.save(); pc.beginPath(); pc.moveTo(300, 0); pc.lineTo(480, 0); pc.lineTo(480, 240); pc.lineTo(210, 240); pc.closePath(); pc.clip(); const n = CP.A.img[L.bg.night]; pc.drawImage(n, 0, n.height * 0.05, n.width, n.width / 2, 0, 0, 480, 240); pc.restore(); }
    const tut = !G.career.tutorialDone && G.mode === 'career';
    const map = CP.mapSVG(this.loc, k => { if (!CP.locUnlocked(k)) { CP.UI.toast(CP.t('map_locked', { r: CP.Prog.rankName(CP.LOC_RANK[k]) }), 'warn'); CP.Audio.deny(); return; } this.loc = k; this.briefing(); });
    const opts = sh('details', { class: 'more' }, sh('summary', null, CP.t('br_options')),
      sh('div', { class: 'col' }, sh('div', { class: 'lbl' }, CP.t('br_tod')), sh('div', { class: 'seg' }, ...['auto', 'dusk', 'night', 'dawn', 'day'].map(k => sh('button', { class: (CP.S.tod || 'auto') === k ? 'on' : '', onclick: () => { CP.S.tod = k; CP.saveSettings(); this.briefing(); } }, CP.t('tod_' + k)))),
        sh('div', { class: 'lbl' }, CP.t('set_shift')), sh('div', { class: 'seg' }, ...[12, 15, 18].map(n => sh('button', { class: CP.S.shiftMin === n ? 'on' : '', onclick: () => { CP.S.shiftMin = n; CP.saveSettings(); this.briefing(); } }, CP.t('set_min', { n: CP.num(n) }))))));
    e.appendChild(sh('div', { class: 'inner brief2' },
      sh('div', { class: 'row', style: 'justify-content:space-between' }, sh('div', null, sh('div', { class: 'lbl' }, CP.t('map_pick')), sh('h1', { style: 'margin:2px 0' }, G.mode === 'career' ? CP.t('br_shift', { n: CP.num(G.career.shiftNo) }) : CP.t('m_free'))), sh('button', { class: 'btn sm ghost', onclick: () => this.menu() }, CP.t('rp_menu'))),
      sh('div', { class: 'bgrid' }, map,
        sh('div', { class: 'col locinfo' }, pv, sh('h2', { style: 'margin:0' }, CP.t('loc_' + this.loc)), sh('div', { class: 'muted' }, CP.t('loc_' + this.loc + '_d')),
          sh('div', { class: 'small muted' }, CP.t('tod_hint', { t: CP.t('tod_' + CP.todOf(G.career.shiftNo)) })),
          tut ? sh('div', { class: 'notice' }, CP.t('br_tutorial')) : null,
          sh('button', { class: 'btn pri mb play', 'aria-disabled': open ? 'false' : 'true', onclick: () => open && CP.Main.startShift(this.loc) }, CP.t('br_go')), opts))));
  };
}
;(window.CP_FILES = window.CP_FILES || {})['21_features'] = '1.4.1';
