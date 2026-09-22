/* Revamp (v1.7): the experience layer.
   - Menu: one hero PLAY button, rank ring, streak & best, daily card, tidy icon row (fewer boxes, clearer hierarchy).
   - Coach: a single plain-language "next step" line above the dock so a first-time player never wonders what to press.
   - Driver reactions: every closed case gets a spoken reaction above the car (thanks / grumbling / relief), by personality.
   - Richer small talk: more openers and replies per personality, plus topical lines (football, weather, fuel, traffic).
   - Double-or-nothing: at 5× / 10× combo the player can bet the streak — next call ×3 XP or lose 150 XP.
   - Final sprint: last 90 s of a shift pays ×2 XP.
   - Sound: every button gets a calm tap, panels whoosh, radio static under dispatch banners, a soft engine hum for the car at the marker. */
CP.addStrings({
  rv_play: ['العب', 'PLAY'], rv_continue: ['كمّل الوردية', 'Continue shift'], rv_new: ['وردية جديدة', 'New shift'], rv_first: ['ابدأ أول وردية', 'Start your first shift'],
  rv_best: ['أحسن تقييم', 'Best score'], rv_shifts: ['ورديات', 'Shifts'], rv_catches: ['قضايا كبيرة', 'Big catches'], rv_streak: ['يوم ورا بعض', 'day streak'],
  rv_daily: ['تحدي اليوم', 'Daily challenge'], rv_dailyDone: ['لعبت النهارده: {n}', 'Played today: {n}'], rv_dailyNew: ['جديد النهارده', 'New today'],
  rv_choose: ['اختار الكمين', 'Choose checkpoint'], rv_record: ['السجل', 'Record'], rv_settings: ['الإعدادات', 'Settings'], rv_how: ['طريقة اللعب', 'How to play'], rv_music: ['الصوت', 'Sound'],
  rv_nextRank: ['للرتبة الجاية', 'to next rank'],
  co_pick: ['👆 اضغط على العربية اللي وصلت عند علامة الوقوف', '👆 Tap the car that stopped at the marker'],
  co_stop: ['🖐 اقرب من العربية واضغط «فحص» عشان توقفها', '🖐 Walk up to the car and press "Check" to stop it'],
  co_greet: ['💬 سلّم على السواق واطلب الأوراق', '💬 Greet the driver and ask for the papers'],
  co_docs: ['📄 افتح الأوراق وقارن الاسم والصورة واللوحة', '📄 Open the papers and compare name, photo and plate'],
  co_verify: ['📻 في شك؟ اتصل بالعمليات — أو خد قرارك لو كل حاجة سليمة', '📻 In doubt? Radio dispatch — or decide if everything checks out'],
  co_decide: ['⚖️ خد القرار: يعدي، إنذار، مخالفة، أو تحفظ', '⚖️ Decide: release, warning, citation or hold'],
  co_wait: ['🚗 استنى العربية الجاية… (أو افتح حارة الطوارئ لو في إسعاف)', '🚗 Waiting for the next car… (open the priority lane if an ambulance comes)'],
  co_bay: ['🔦 العربية في منطقة التفتيش — فتّش المناطق وسجّل اللي تلاقيه', '🔦 The car is in the bay — search the zones and log what you find'],
  bet_q: ['🔥 كومبو ×{n}! تراهن على الستريك؟ القرار الجاي: سليم = خبرة ×٣ … غلط = −١٥٠ خبرة', '🔥 ×{n} combo! Bet the streak? Next call: sound = ×3 XP … wrong = −150 XP'],
  bet_yes: ['أراهن 🎲', 'Bet it 🎲'], bet_no: ['ألعبها آمن', 'Play it safe'], bet_win: ['كسبت الرهان!', 'BET WON!'], bet_lose: ['خسرت الرهان', 'Bet lost'],
  sprint: ['⏱ آخر دقيقة ونص — الخبرة ×٢!', '⏱ Final sprint — XP ×2!'], sprintHud: ['سبرنت أخير', 'FINAL SPRINT']
});
CP.Revamp = {};
const RV = CP.Revamp, rh = CP.h;

/* ================= premium main menu ================= */
CP.Screens.menu = function () {
  CP.Main.stop(); CP.Audio.stopAll(); this.from = 'menu';
  const e = this.show('menu'); e.innerHTML = '';
  const cv = rh('canvas', { class: 'bg', 'aria-hidden': 'true' });
  const saved = (() => { CP.SAVE_KEY = 'cpns_save_v1'; return CP.loadSaved(); })();
  const car = saved && CP.Prog.ensure(saved.career); const done = car && car.tutorialDone;
  const db = CP.Daily.best(); const today = db.date === CP.Daily.today(); const sp = CP.Daily.spec();
  const active = saved && saved.shift && !saved.shift.ended;
  const openMap = () => { if (!saved) { CP.Main.newCareer(); return; } const go = () => { CP.Main.useKey('career'); CP.G = saved; if (CP.G.shift && !CP.G.shift.ended) { CP.G.shift = null; CP.save(); } CP.Screens.briefing(); }; if (active) CP.UI.confirm(CP.t('mm_active'), go); else go(); };
  const play = () => { CP.Audio.click(); if (active) CP.Main.continueCareer(saved); else openMap(); };
  // rank ring
  let ring = null;
  if (car) {
    const ri = CP.Prog.rankOf(car.xp), R = CP.Prog.RANKS, nx = R[ri + 1]; const pct = nx ? (car.xp - R[ri].xp) / (nx.xp - R[ri].xp) : 1;
    ring = rh('div', { class: 'rv-rank' },
      rh('div', { class: 'rv-ring', style: `--p:${(pct * 100).toFixed(1)}%`, html: CP.Prog.badge(ri, 54) }),
      rh('div', { class: 'rv-rt' }, rh('b', null, CP.Prog.rankName(ri)), rh('small', null, nx ? CP.num(nx.xp - car.xp) + ' ' + CP.t('pr_xp') + ' ' + CP.t('rv_nextRank') : CP.t('pr_max'))));
  }
  const stat = (v, l) => rh('div', { class: 'rv-stat' }, rh('b', null, v), rh('small', null, l));
  const stats = car ? rh('div', { class: 'rv-stats' },
    stat(CP.num(car.records && car.records.length ? Math.max(...car.records.map(r => r.score)) : 0), CP.t('rv_best')),
    stat(CP.num(car.totals.shifts || 0), CP.t('rv_shifts')),
    stat(CP.num(car.totals.catches || 0), CP.t('rv_catches')),
    stat((car.streak > 1 ? '🔥 ' : '') + CP.num(car.streak || 0), CP.t('rv_streak'))) : null;
  const hero = rh('button', { class: 'rv-play', onclick: play },
    rh('span', { class: 'rv-playIcon' }, '▶'),
    rh('span', { class: 'rv-playT' }, rh('b', null, active ? CP.t('rv_continue') : saved ? CP.t('rv_new') : CP.t('rv_first')),
      rh('small', null, active ? CP.t('loc_' + saved.shift.loc).split(' — ')[0] + ' • ' + CP.t('br_shift', { n: CP.num(saved.shift.no) }) : saved ? CP.t('rv_choose') : CP.t('subtitle'))));
  const card = (icon, title, sub, fn, dis, cls) => rh('button', { class: 'rv-card ' + (cls || ''), 'aria-disabled': dis ? 'true' : 'false', onclick: () => { if (dis) { CP.UI.toast(dis, 'warn'); return; } CP.Audio.click(); fn(); } }, rh('span', { class: 'rv-ci' }, icon), rh('span', { class: 'rv-ct' }, rh('b', null, title), rh('small', null, sub)), rh('span', { class: 'rv-go' }, '›'));
  const cards = rh('div', { class: 'rv-cards' },
    active ? card('🗺️', CP.t('rv_new'), CP.t('rv_choose'), openMap) : null,
    card('📅', CP.t('rv_daily'), (today ? CP.t('rv_dailyDone', { n: CP.num(db.best) }) : CP.t('rv_dailyNew')) + ' • ' + CP.t('loc_' + sp.loc).split(' — ')[0], () => CP.Daily.start(), done ? null : CP.t('m_freeLocked'), today ? '' : 'new'));
  const ico = (icon, label, fn, dis) => rh('button', { class: 'rv-ico', 'aria-disabled': dis ? 'true' : 'false', onclick: () => { CP.Audio.clickSoft(); if (dis) { CP.UI.toast(dis, 'warn'); return; } fn(); } }, rh('span', null, icon), rh('small', null, label));
  const icons = rh('div', { class: 'rv-icons' },
    ico('🏆', CP.t('rv_record'), () => this.record(car), car ? null : CP.t('m_freeLocked')),
    ico('⚙️', CP.t('rv_settings'), () => this.settings('menu')),
    ico('📘', CP.t('rv_how'), () => this.how('menu')),
    ico('🔊', CP.t('rv_music'), () => CP.UI.quickMenu()),
    ico('🌐', CP.lang === 'ar' ? 'EN' : 'ع', () => { CP.S.lang = CP.S.lang === 'ar' ? 'en' : 'ar'; CP.saveSettings(); CP.UI.applyLang(); this.menu(); }));
  const more = rh('details', { class: 'more rv-more' }, rh('summary', null, CP.t('m_more')), rh('div', { class: 'col' },
    rh('button', { class: 'btn mb', onclick: () => CP.UI.confirm(CP.t('m_newConfirm'), () => CP.Main.newCareer()) }, CP.t('m_new')),
    rh('button', { class: 'btn mb', 'aria-disabled': done ? 'false' : 'true', onclick: () => done ? CP.Main.free(false) : CP.UI.toast(CP.t('m_freeLocked'), 'warn') }, CP.t('m_free'))));
  const mc = rh('div', { class: 'mc glass rv-menu' }, CP.Brand.logo({ size: 1.05, tag: false, static: true }), ring, stats, hero, cards, icons, more,
    rh('div', { class: 'foot' }, rh('div', null, CP.t('credit')), rh('div', null, 'v' + CP.VERSION)));
  e.append(cv, rh('div', { class: 'shade' }), mc);
  this.menuScene(cv);
};

/* ================= coach line ================= */
RV.coachKey = function (s) {
  if (!s || s.tutorial.step < 99) return null;
  const v = CP.Act.curV(); const c = v && v.caseId ? s.cases[v.caseId] : null;
  if (!c || c.res) { const m = s.vehicles.find(x => x.st === 'marker' && x.caseId && !s.cases[x.caseId].res); return m ? 'co_pick' : 'co_wait'; }
  if (v.st === 'bay') return 'co_bay';
  if (!c.k.stopped) return 'co_stop';
  if (!c.k.greeted) return 'co_greet';
  if (!c.k.docsViewed) return 'co_docs';
  const k = c.k; const pend = k.pending && (k.pending.vehicle || k.pending.person);
  if (!pend && !(k.verif && (k.verif.vehicle.length || k.verif.person.length))) return 'co_verify';
  return 'co_decide';
};
RV.coachTick = function () {
  const s = CP.G && CP.G.shift; const dock = document.getElementById('dock'); if (!s || !dock) return;
  let el = document.getElementById('coach'); if (!el) { el = rh('div', { id: 'coach' }); dock.parentElement.insertBefore(el, dock); }
  const key = RV.coachKey(s); const hidden = !key || (CP.UI.panel && CP.UI.panel.kind !== 'case') || (CP.G.career.totals && CP.G.career.totals.shifts >= 6 && key === 'co_wait');
  el.classList.toggle('hidden', !!hidden); if (hidden) return;
  if (el.dataset.k !== key + CP.lang) { el.dataset.k = key + CP.lang; el.textContent = CP.t(key); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
};
CP.bus.on('stepEnd', () => { RV.ct = (RV.ct || 0) + 1; if (RV.ct % 20 === 0) RV.coachTick(); });

/* ================= driver reactions (speech bubbles above the car) ================= */
CP.REACT = {
  waved: { patient: [['شكراً يا باشا، ربنا يعينك.', 'Thanks officer, God help you.'], ['تسلم يا سيادة الضابط.', 'Much obliged, officer.']], chatty: [['يا باشا كنت هحكيلك عن الماتش!', 'Officer, I was going to tell you about the match!'], ['مع السلامة يا كبير.', 'Take care, boss.']], anxious: [['الحمد لله… الحمد لله.', 'Thank God… thank God.'], ['كنت خايف على الفاضي.', 'I was nervous for nothing.']], impatient: [['أخيراً!', 'Finally!'], ['كل ده عشان تعدّيني؟', 'All that just to let me go?']], defensive: [['قلتلك مفيش حاجة.', 'Told you there was nothing.'], ['تمام.', 'Fine.']] },
  release: { patient: [['شكراً على ذوقك.', 'Thank you for your courtesy.']], chatty: [['على فكرة الكمين بتاعكم أنضف واحد على الطريق!', 'By the way, your checkpoint is the cleanest on the road!']], anxious: [['ربنا يخليك يا باشا.', 'Bless you, officer.']], impatient: [['ماشي… ماشي.', 'Alright… alright.']], defensive: [['كان لازم كل ده؟', 'Was all that necessary?']] },
  advice: { patient: [['حاضر يا باشا، هاخد بالي.', 'Understood, I will be careful.']], chatty: [['نصيحة غالية، هجدد الرخصة بكرة إن شاء الله.', 'Good advice — I will renew it tomorrow, God willing.']], anxious: [['حاضر حاضر، آسف.', 'Yes yes, sorry.']], impatient: [['تمام تمام.', 'OK, OK.']], defensive: [['هو أنا عملت حاجة؟', 'Did I do something?']] },
  warning: { patient: [['حقك يا باشا، مش هتتكرر.', 'Fair enough, officer — it will not happen again.']], chatty: [['إنذار؟ طب ما تخليها نصيحة!', 'A warning? Make it advice instead!']], anxious: [['حاضر… آسف والله.', 'Yes… I am really sorry.']], impatient: [['يا سلام!', 'Unbelievable!']], defensive: [['إنذار على إيه بس؟', 'A warning for what?']] },
  citation: { patient: [['ماشي يا باشا، هدفع.', 'Alright officer, I will pay.']], chatty: [['مخالفة؟ ده أنا كنت هعزمك على شاي!', 'A ticket? I was about to offer you tea!']], anxious: [['يا نهار أبيض… طب أدفعها فين؟', 'Oh no… where do I pay it?']], impatient: [['خلاص ادّيني الورقة وسيبني أمشي.', 'Just give me the paper and let me go.']], defensive: [['هعترض عليها.', 'I will contest it.']] },
  hold: { patient: [['أنا تحت أمرك.', 'I am at your disposal.']], chatty: [['تحفظ؟! ده أنا معروف في المنطقة!', 'Held?! Everyone here knows me!']], anxious: [['أرجوك… أنا مش فاهم حاجة.', 'Please… I do not understand.']], impatient: [['هتصل بالمحامي.', 'I am calling my lawyer.']], defensive: [['ده ظلم!', 'This is unfair!']] },
  handover: { patient: [['…', '…']], chatty: [['في غلطة أكيد.', 'There must be a mistake.']], anxious: [['لا لا لا…', 'No no no…']], impatient: [['هتندموا.', 'You will regret this.']], defensive: [['ماعنديش حاجة أقولها.', 'I have nothing to say.']] },
  medical: { patient: [['شكراً… ربنا يكرمكم.', 'Thank you… bless you all.']], chatty: [['الله يخليكم.', 'God keep you.']], anxious: [['الحمد لله إنكم هنا.', 'Thank God you were here.']], impatient: [['بسرعة لو سمحت.', 'Quickly, please.']], defensive: [['أنا كويس… أنا كويس.', 'I am fine… I am fine.']] }
};
CP.REACT.refer_admin = CP.REACT.advice;
CP.R.bubble = function (text, vid, dur) { this.fx.push({ kind: 'bubble', text, vid, t0: this.t, dur: dur || 3.4 }); };
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !c.res) return; const v = CP.vehOfCase(c); if (!v || v.x < 0) return;
  const pool = (CP.REACT[c.res.decision] || CP.REACT.waved); const lines = pool[c.driver.pers] || pool.patient; const l = lines[Math.floor(Math.random() * lines.length)];
  CP.R.bubble(CP.Gender.driverText(c, CP.L({ ar: l[0], en: l[1] })), v.id); CP.Audio.ack(c.driver.g);
});
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) {
    wui.call(this, s, alpha); const ctx = this.ctx, font = CP.UI ? CP.UI.font() : 'sans-serif';
    for (const f of this.fx) {
      if (f.kind !== 'bubble') continue; const v = CP.T.get(f.vid); if (!v || !v._scr) continue;
      const p = (this.t - f.t0) / f.dur; const a = p < 0.1 ? p / 0.1 : p > 0.8 ? (1 - p) / 0.2 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.font = `600 ${Math.max(12, Math.min(16, 0.34 * this.ppm))}px ${font}`;
      const maxW = Math.min(this.W * 0.6, 320); const words = f.text.split(' '); const lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur);
      const lh = 19, bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 22, bh = lines.length * lh + 12;
      const cx = CP.clamp(v._scr.left + v._scr.w * 0.62, bw / 2 + 6, this.W - bw / 2 - 6), by = Math.max(bh + 6, v._scr.top - 34 - (p < 0.15 ? 0 : (p - 0.15) * 14));
      ctx.fillStyle = 'rgba(250,246,238,.97)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - bw / 2, by - bh, bw, bh, 12) : ctx.rect(cx - bw / 2, by - bh, bw, bh); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 7, by); ctx.lineTo(cx + 7, by); ctx.lineTo(cx, by + 9); ctx.fill();
      ctx.fillStyle = '#1b1c22'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, cx, by - bh + 6 + lh / 2 + i * lh));
      ctx.restore();
    }
  }; }

/* ================= richer small talk ================= */
CP.CHAT.officer.push(['الأهلي ولا الزمالك؟ من غير زعل.', 'Ahly or Zamalek? No hard feelings.'], ['البنزين غالي ولا لسه؟', 'Is petrol still that expensive?'], ['الجو حر النهارده، شارب مية؟', 'Hot today — drinking enough water?'], ['من ساعة ما فتحوا الطريق الجديد والزحمة قلت، صح؟', 'Traffic eased since the new road opened, right?']);
CP.CHAT.patient.push(['زملكاوي يا باشا بس بحب الكل.', 'Zamalek, officer — but I love everyone.'], ['غالي، بس نعمل إيه.', 'Expensive, but what can we do.'], ['معايا قزازة مية، تشرب؟', 'I have a bottle of water — want some?']);
CP.CHAT.chatty.push(['أهلاوي من يوم ما اتولدت، وأخويا زملكاوي، البيت مقسوم!', 'Ahly since birth — my brother is Zamalek, the house is split!'], ['البنزين؟ ما تفتحش الجرح يا باشا.', 'Petrol? Do not open that wound, officer.'], ['أنا بقول للناس دايماً الكمين ده أحسن كمين على الطريق.', 'I always tell people this is the best checkpoint on the road.']);
CP.CHAT.anxious.push(['أ… أهلاوي… يعني… أي حاجة إنت عايزها.', 'A… Ahly… I mean… whatever you prefer.'], ['شربت مية كتير عشان كده إيدي بترعش.', 'I drank a lot of water, that is why my hands shake.']);
CP.CHAT.impatient.push(['يا باشا الماتش هيبدأ وأنا لسه هنا.', 'Officer, the match is starting and I am still here.'], ['البنزين غالي والوقت أغلى.', 'Petrol is expensive and time is dearer.']);
CP.CHAT.defensive.push(['مش بتابع كورة.', 'I do not follow football.'], ['الجو حر عشان الكمين طويل.', 'It is hot because this stop is long.']);

/* ================= double-or-nothing ================= */
RV.offerBet = function (n) {
  const s = CP.G.shift; if (!s || s.events.bet || s.events.betOffered === n || document.querySelector('.choicecard') || CP.UI.panel) return;
  s.events.betOffered = n; CP.FX.hold = true; CP.Audio.chime('combo');
  const box = rh('div', { class: 'choicecard bet', role: 'dialog' }, rh('div', { class: 'lbl' }, '🎲 ' + CP.t('pr_combo')), rh('b', null, CP.t('bet_q', { n: CP.num(n) })),
    rh('div', { class: 'row' }, rh('button', { class: 'btn pri', style: 'flex:1', onclick: () => { box.remove(); CP.FX.hold = false; s.events.bet = { combo: n }; CP.Audio.click(); CP.R.punch(); } }, CP.t('bet_yes')),
      rh('button', { class: 'btn', style: 'flex:1', onclick: () => { box.remove(); CP.FX.hold = false; CP.Audio.clickSoft(); } }, CP.t('bet_no'))));
  document.getElementById('stage').appendChild(box);
};
CP.bus.on('caseClosed', c => {
  const s = CP.G.shift; if (!s || !s.prog || !c.res || !c.res.eval) return; const E = s.events;
  if (E.bet) { const bet = E.bet; E.bet = null; const v = CP.vehOfCase(c); const vx = v ? v.x - v.len / 2 : null, vy = v ? CP.R.rowY(v.row) + 3.0 : null;
    if (c.res.eval.sound) { CP.Prog.gain(120, vx, vy, '#ffd35a', '🎲'); CP.R.stamp(CP.t('bet_win'), '#ffd35a'); CP.R.confetti(80); CP.Audio.fanfare(); CP.Pulse.flash('255,210,80', 0.35); }
    else { s.prog.xp = Math.max(0, s.prog.xp - 150); CP.R.popup('−150 ' + CP.t('pr_xp'), null, null, '#ff6a6a'); CP.R.stamp(CP.t('bet_lose'), '#ff5a5a'); CP.Pulse.flash('200,30,30', 0.4); CP.R.shake(8, 0.5); }
    return; }
  const n = s.prog.combo; if (c.res.eval.sound && (n === 5 || n === 10 || n === 15)) setTimeout(() => RV.offerBet(n), 1400);
});

/* ================= final sprint ================= */
CP.bus.on('stepEnd', () => { const s = CP.G && CP.G.shift; if (!s || s.ended || s.events.sprint) return; if (s.dur - s.t <= 90 && s.t > 60) { s.events.sprint = true; CP.UI.banner(CP.t('sprint'), 'warn'); CP.Audio.chime('obj'); CP.R.punch(); } });
{ const gain = CP.Prog.gain; CP.Prog.gain = function (xp, x, yup, color, label) { const s = CP.G.shift; if (s && s.events.sprint && !s.ended && x != null) xp = Math.round(xp * 2); return gain.call(this, xp, x, yup, color, label); }; }
{ const wui = CP.R.worldUI; CP.R.worldUI = function (s, alpha) { wui.call(this, s, alpha); if (!s.events.sprint || s.ended) return; const ctx = this.ctx, W = this.W; ctx.save(); ctx.font = `800 ${CP.UI.isMob ? 12 : 14}px ${CP.UI.font()}`; const text = '⏱ ' + CP.t('sprintHud') + ' ×2  ' + CP.fmtTime(Math.max(0, s.dur - s.t)); const w = ctx.measureText(text).width + 22, y = this.H * 0.16 + 68; ctx.fillStyle = `rgba(255,80,60,${0.75 + 0.25 * Math.sin(this.t * 7)})`; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W / 2 - w / 2, y, w, 26, 8) : ctx.rect(W / 2 - w / 2, y, w, 26); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, y + 14); ctx.restore(); }; }

/* ================= sound hooks ================= */
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('.btn, .act, .rv-card, .rv-ico, .mini, .fld, .dec, .chip, .opts button'); if (!b || b.getAttribute('aria-disabled') === 'true') return; CP.Audio.clickSoft(); }, true);
{ const rp = CP.UI.renderPanel; CP.UI.renderPanel = function () { const k = CP.UI.panel && CP.UI.panel.kind; if (k && k !== RV.lastPanel && CP.Audio.ok) { const t = CP.Audio.ctx.currentTime; CP.Audio.burst(0.22, 0.035, 900, 0.5, t, 'bandpass'); } RV.lastPanel = k || null; return rp.apply(this, arguments); }; }
{ const bn = CP.UI.banner; CP.UI.banner = function (text, kind) { if ((kind === 'warn' || kind === 'emergency') && CP.Audio.ok) { const t = CP.Audio.ctx.currentTime; CP.Audio.burst(0.5, 0.03, 2400, 0.8, t, 'bandpass'); CP.Audio.burst(0.15, 0.02, 1200, 0.6, t + 0.55, 'bandpass'); } return bn.apply(this, arguments); }; }
/* engine idle hum for the car waiting at the marker (fades with distance to the camera centre) */
RV.hum = null;
CP.bus.on('stepEnd', () => {
  const A = CP.Audio; if (!A.ok || CP.S.reducedFx) return; const s = CP.G.shift; const v = CP.T.atMarker();
  if (v && !RV.hum) { const o = A.ctx.createOscillator(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 42 + Math.random() * 8; f.type = 'lowpass'; f.frequency.value = 160; g.gain.value = 0; o.connect(f); f.connect(g); g.connect(A.out()); o.start(); RV.hum = { o, g, f }; }
  if (RV.hum) { const target = v ? 0.035 : 0; const gg = RV.hum.g.gain; gg.setTargetAtTime(target, A.ctx.currentTime, 0.4); RV.hum.o.frequency.setTargetAtTime(v ? 44 + Math.sin(CP.R.t * 3) * 1.5 : 30, A.ctx.currentTime, 0.2); if (!v && gg.value < 0.002) { RV.hum.o.stop(); RV.hum = null; } }
});
CP.bus.on('shiftStart', () => { if (RV.hum) { try { RV.hum.o.stop(); } catch (e) { } RV.hum = null; } });
;(window.CP_FILES = window.CP_FILES || {})['25_revamp'] = '2.0.0';
