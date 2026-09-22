/* Dialogue: authored intents with conditions. Answers derive from the case truth + previous statements; tone changes cooperation, never truth. */
CP.Dlg = {};
const DC = CP.C;
const pr = (ar, en) => ({ ar, en });

CP.Dlg.say = function (c, who, text) { c.dlg.log.push({ who, text, t: CP.G.shift.t }); if (c.dlg.log.length > 80) c.dlg.log.shift(); };
CP.Dlg.statement = function (c, key, text, val, extra) {
  const st = Object.assign({ key, val, t: CP.G.shift.t, text }, extra || {});
  c.k.statements.push(st);
  const who = extra && extra.passenger ? pr('راكب', 'Passenger') : pr('السواق', 'Driver');
  CP.note(c, 'statement', pr(who.ar + ': «' + text.ar + '»', who.en + ': “' + text.en + '”'), 'unverified', { skey: key });
  CP.Dlg.checkContradiction(c, st);
};
CP.Dlg.checkContradiction = function (c, st) {
  if (['dest2', 'pax_dest'].indexOf(st.key) < 0) return;
  const first = c.k.statements.find(x => x.key === 'dest');
  if (!first || first.val === st.val) return;
  if (c.k.disc.indexOf('statement') >= 0) return;
  c.k.disc.push('statement');
  const a = DC.places[c.loc][first.val], b = DC.places[c.loc][st.val];
  CP.note(c, 'discrepancy', CP.fill(['الوجهة اتقالت {a} وبعدين {b}', 'Destination stated as {a}, later {b}'], { a, b }), 'unverified', { dkey: 'statement' });
};
const placeIdx = (c, p) => DC.places[c.loc].indexOf(p);

/* ---------------- availability ---------------- */
CP.Dlg.intents = function (c) {
  const k = c.k, s = CP.G.shift; const out = [];
  const add = (id, cond) => { if (cond) out.push(id); };
  if (!k.approached) return [];
  if (k.favourOffered && !k.favourHandled) return ['refuse_favour_record', 'refuse_favour_polite'];
  add('greet_docs', !k.greeted);
  if (!k.greeted) { add('explain', !k.explained); return out; }
  add('mediate', c.cues.indexOf('shouting') >= 0 && !k.disputeCalm);
  add('settle_dispute', k.disputeCalm && !k.disputeSettled);
  add('ask_symptoms', k.statements.some(x => x.key === 'health' && x.unwell) && !k.asked.ask_symptoms);
  add('ask_photo', (k.disc.indexOf('photo') >= 0 || k.disc.indexOf('name_id') >= 0) && !(k.statements.some(x => x.key === 'photo' && x.admit)));
  add('ask_expiry', k.disc.indexOf('expiry_lic') >= 0 && !k.asked.ask_expiry);
  add('ask_plate', k.disc.indexOf('plate') >= 0 && !k.asked.ask_plate);
  add('ask_owner', k.docsViewed && c.docs.reg.owner.en !== c.driver.name.en && !k.asked.ask_owner);
  add('ask_reason_change', k.disc.indexOf('statement') >= 0 && !k.statements.some(x => x.key === 'confession'));
  add('ask_lookout', CC_isCargo(c) && s.lookouts.length > 0 && !k.asked.ask_lookout);
  add('ask_destination', !k.asked.ask_destination);
  add('ask_origin', k.asked.ask_destination && !k.asked.ask_origin);
  add('ask_purpose', k.asked.ask_destination && !k.asked.ask_purpose);
  add('ask_passengers', c.pax > 0 && !k.asked.ask_passengers);
  add('ask_passenger_confirm', c.pax > 0 && k.asked.ask_destination && !k.asked.ask_passenger_confirm && CP.C.veh[c.type].cls !== 'passenger');
  add('ask_bag', (c.cues.indexOf('bag_seat') >= 0 || c.cues.indexOf('cargo_cartons') >= 0) && !k.asked.ask_bag);
  add('ask_health', (k.asked.ask_health || 0) < 2);
  add('ask_drink', !k.asked.ask_drink);
  add('repeat_destination', k.asked.ask_destination && (k.asked.repeat_destination || 0) < 2);
  add('explain', !k.explained);
  add('close', true);
  return out;
};
function CC_isCargo(c) { return CP.C.veh[c.type].cls === 'cargo'; }

/* ---------------- tone effects ---------------- */
CP.Dlg.applyTone = function (c, tone) {
  const p = c.driver.pers; c.k.tones[tone]++;
  if (tone === 'calm') { c.coop += (p === 'anxious' || p === 'defensive') ? 4 : 2; c.patience += 1; }
  if (tone === 'firm') { c.coop -= (p === 'anxious' || p === 'defensive' || p === 'patient') ? 7 : 3; c.patience -= 2; if (p === 'impatient') c.coop += 1; }
  c.coop = CP.clamp(c.coop, 0, 100); c.patience = CP.clamp(c.patience, 0, 100);
};
const persOpenLine = c => DC.persOpen[c.driver.pers][Math.floor(CP.makeRng(c.seed + c.dlg.log.length)() * 3)];
const pickL = (c, arr, salt) => arr[Math.floor(CP.makeRng(c.seed + (salt || 0))() * arr.length)];
const fillL = (pair, vars) => CP.fill(pair, vars);

/* ---------------- main ask ---------------- */
CP.Dlg.ask = function (c, intent, tone) {
  const k = c.k; const s = CP.G.shift;
  const idem = 'dlg:' + c.id + ':' + c.dlg.log.length + ':' + intent; if (!CP.once(idem)) return;
  CP.Dlg.applyTone(c, tone);
  const line = CP.Gender.officer(c, intent, tone);
  CP.Dlg.say(c, 'officer', pr(line[0], line[1]));
  const prev = k.asked[intent] || 0; k.asked[intent] = prev + 1;
  const J = c.journey; const places = DC.places[c.loc];
  const D = (text) => CP.Dlg.say(c, 'driver', text);
  const PX = (text) => CP.Dlg.say(c, 'passenger', text);
  const vars = { dest: J.dest, origin: J.origin, owner: c.owner.name, purpose: J.purposeT };
  const lowCoop = c.coop < 35;
  CP.Audio.ack(c.driver.g);
  if (prev >= 1 && ['greet_docs', 'explain', 'close', 'repeat_destination'].indexOf(intent) < 0) { D(pr(...pickL(c, DC.repeatAnnoy, 7 + prev))); c.patience = Math.max(0, c.patience - 4); k.repeats = (k.repeats || 0) + 1; }

  switch (intent) {
    case 'greet_docs': {
      k.greeted = true;
      let t = persOpenLine(c);
      if (c.fam === 'medical') t = ['… مساء النور… اتفضل… الرخص… آه.', '…Evening… here… the licences… yes.'];
      if (c.fam === 'overheat') t = ['الموتور سخن مني يا باشا، معلش. اتفضل الرخص.', 'The engine overheated on me, sorry officer. Here are the licences.'];
      D(pr(t[0] + (c.fam === 'medical' || c.fam === 'overheat' ? '' : ' اتفضل الرخص والبطاقة.'), t[1] + (c.fam === 'medical' || c.fam === 'overheat' ? '' : ' Here are my licences and ID.')));
      if (c.fam === 'dispute') PX(pr('(زعيق من ورا) يا باشا الراجل ده بيسرقنا!', '(shouting from the back) Officer, this man is robbing us!'));
      if (c.ret) {
        D(pr('حضرتك فاكرني؟ وقفتني قبل كده في وردية فاتت.', 'Do you remember me? You stopped me on an earlier shift.'));
        if (c.ret.lastFam === 'expired' && ['warning', 'citation', 'refer_admin', 'advice'].indexOf(c.ret.lastOutcome) >= 0) D(pr('جددت الرخصة زي ما قلت لي، أهي.', 'I renewed the licence like you told me — here it is.'));
        else if (['release', 'advice'].indexOf(c.ret.lastOutcome) >= 0) D(pr('كنت محترم معايا المرة اللي فاتت، ربنا يكرمك.', 'You treated me decently last time, thank you.'));
        CP.note(c, 'observation', pr('مواطن متعامل معاه قبل كده (' + CP.STR.ar['res_' + c.ret.lastOutcome] + ')', 'Returning citizen — previous outcome: ' + CP.STR.en['res_' + c.ret.lastOutcome]), 'verified');
      }
      // the driver now hands the papers over (short, visible handover) — documents are only readable once received
      if (!k.docsHave && !k.docsHanding) { k.docsHanding = true; CP.Tasks.add({ type: 'handover', owner: 'driver', caseId: c.id, dur: 1.6, key: 'handover:' + c.id, data: {} }); }
      CP.Actors.poseHold('documents', 2.2);
      break; }
    case 'ask_destination': {
      if (lowCoop && prev === 0) { D(pr(...pickL(c, DC.evasive, 1))); k.asked[intent] = 0; c.coop += 6; break; }
      const said = c.fam === 'journey' ? J.alt : J.dest;
      let t;
      if (CP.C.veh[c.type].cls === 'passenger') t = fillL(['الخط بتاعي من {origin} لـ{dest}، ده آخر دور يا باشا.', 'My route is {origin} to {dest} — this is the last run, officer.'], { origin: J.origin, dest: said });
      else t = fillL(pickL(c, [['رايح {dest} يا فندم.', 'Heading to {dest}, officer.'], ['على {dest} إن شاء الله.', 'To {dest}, God willing.'], ['{dest}، مش بعيد.', '{dest} — not far.']], 2), { dest: said });
      D(t); CP.Dlg.statement(c, 'dest', t, placeIdx(c, said));
      break; }
    case 'ask_origin': {
      const t = fillL(pickL(c, [['جاي من {origin}.', 'Coming from {origin}.'], ['من {origin}، وماشي على طول.', 'From {origin}, going straight through.']], 3), vars);
      D(t); CP.Dlg.statement(c, 'origin', t, placeIdx(c, J.origin)); break; }
    case 'ask_purpose': {
      let t;
      if (c.fam === 'journey' && c.variant === 'A') t = pr('مشوار كده يا باشا… حاجة شخصية.', "Just an errand, officer… something personal.");
      else if (c.fam === 'lookout') t = pr('بسلّم طلبية أدوية لصيدلية.', "I'm delivering a medicine order to a pharmacy.");
      else t = fillL(['والله {purpose}.', "I'm {purpose}."], vars);
      D(t); CP.Dlg.statement(c, 'purpose', t, J.purpose); break; }
    case 'ask_passengers': {
      let t;
      if (c.paxRel === 'fares') t = pr('ركاب يا باشا، طالعين من الموقف.', "Fare-paying passengers, officer, from the stand.");
      else if (c.paxRel === 'family') t = c.driver.g === 'f' ? pr('دي بنتي وأختي.', 'My daughter and my sister.') : pr('دي مراتي والعيال.', 'My wife and the kids.');
      else if (c.paxRel === 'friends') t = pr('أصحابي، راجعين من قعدة.', "Friends — we're heading back from a get-together.");
      else t = pr('زمايلي في الشغل.', 'Colleagues from work.');
      D(t); CP.Dlg.statement(c, 'pax', t, c.paxRel); break; }
    case 'ask_passenger_confirm': {
      const t = fillL(['رايحين {dest} يا فندم.', "We're going to {dest}, officer."], { dest: J.dest });
      PX(t); CP.Dlg.statement(c, 'pax_dest', t, placeIdx(c, J.dest), { passenger: true }); break; }
    case 'repeat_destination': {
      if (prev >= 1 || k.repeats > 1) { D(pr(...pickL(c, DC.repeatAnnoy, 5))); c.patience -= 5; k.repeats++; }
      else k.repeats++;
      const said = c.fam === 'journey' ? J.dest : (k.statements.find(x => x.key === 'dest') ? places[k.statements.find(x => x.key === 'dest').val] : J.dest);
      const t = fillL(['قلت لحضرتك {dest}.', 'I told you — {dest}.'], { dest: said });
      D(t); CP.Dlg.statement(c, 'dest2', t, placeIdx(c, said)); break; }
    case 'ask_reason_change': {
      if (c.coop < 40 || tone === 'firm' && c.driver.pers !== 'impatient' && prev === 0) { D(pr('مفيش حاجة يا باشا، اتلخبطت بس.', 'Nothing, officer — I just got mixed up.')); k.asked[intent] = 0; c.coop += 4; break; }
      let t;
      if (c.variant === 'A') t = fillL(['بصراحة يا باشا… رايح {dest} أقابل أهل البنت اللي عايز أتقدم لها، ومحدش في البيت يعرف لسه. اتكسفت أقول.', "Honestly officer… I'm going to {dest} to meet the family of the girl I want to propose to. Nobody at home knows yet — I was embarrassed."], { dest: J.dest });
      else t = pr('بصراحة… الرخصة عليها مشكلة صغيرة في المرور، وكنت خايف تعطلني.', "Honestly… there's a small problem with my licence at the traffic office. I was afraid you'd hold me up.");
      D(t); CP.Dlg.statement(c, 'confession', t, c.variant, { admit: true }); break; }
    case 'ask_owner': {
      const rel = c.owner.rel;
      const L = {
        brother: ['دي عربية أخويا، عربيتي في الورشة.', "It's my brother's car — mine is at the workshop."],
        father: ['دي عربية الحاج أبويا، بوصل حاجات لأمي.', "It's my father's car — I'm running errands for my mother."],
        uncle: ['عربية خالي، سلفهالي أسبوع.', "It's my uncle's — he lent it to me for a week."],
        cousin: ['عربية ابن عمي، هو مسافر وسايبها معايا.', "My cousin's car — he's travelling and left it with me."],
        employer: ['دي عربية صاحب الشغل، أنا شغال عليها.', 'It belongs to my employer — I drive it for work.'],
        friend: ['عربية صاحبي، سلفهالي النهارده بس.', "A friend's car — he lent it to me just for today."],
        husband: ['عربية جوزي، عربيتي عطلانة.', "My husband's car — mine broke down."],
        sister: ['عربية أختي، هي اللي قالت لي خدها.', 'My sister’s car — she told me to take it.'],
        seller: ['أنا شاريها الأسبوع اللي فات يا باشا، والعقد معايا في التابلوه. لسه مانقلتش الملكية.', "I bought it last week, officer. The contract is in the glovebox — I haven't transferred ownership yet."]
      }[rel] || ['العربية باسم قريبي.', "It's in a relative's name."];
      const t = pr(L[0], L[1]); D(t); CP.Dlg.statement(c, 'owner_rel', t, rel);
      if (rel === 'seller') { k.consent = true; }
      break; }
    case 'ask_expiry': {
      let t = c.driver.pers === 'defensive' ? pr('هي منتهية من كام يوم بس يا باشا!', 'It only expired a few days ago!') : pickL(c, [pr('والله نسيت خالص، هجددها الأسبوع ده.', "Honestly, I completely forgot. I'll renew it this week."), pr('كنت مستني الكشف الطبي، والمرور زحمة.', 'I was waiting for the medical exam; the traffic office is swamped.')], 7);
      if (c.fam !== 'expired') t = pr('بجد؟ مش واخد بالي.', "Really? I hadn't noticed.");
      D(t); CP.Dlg.statement(c, 'expiry', t, 1); break; }
    case 'ask_plate': {
      const t = c.fam === 'plate_admin' ? pr('العربية لسه طالعة من المرور يا باشا، غيروا اللوح القديمة، والرخصة الجديدة لسه ماطلعتش.', "The car just came back from the traffic office — they replaced the old plates and the new licence card isn't out yet.") : pr('مش عارف يا باشا، اللوحة دي من يوم ما اشتريتها.', "I don't know, officer — it's had this plate since I bought it.");
      D(t); CP.Dlg.statement(c, 'plate', t, 1); break; }
    case 'ask_photo': {
      const o = c.flags.other;
      if (c.fam !== 'licence_other') { D(pr('دي رخصتي يا باشا، الصورة قديمة بس.', "It's my licence, the photo is just old.")); break; }
      if (c.coop < 50 && !k.statements.some(x => x.key === 'photo')) {
        const t = pr('هي رخصتي… الصورة قديمة بس.', "It's mine… the photo is just old."); D(t); CP.Dlg.statement(c, 'photo', t, 0); c.coop += 8; break;
      }
      const t = fillL(['خلاص يا باشا… دي رخصة {rel} {name}. أنا لسه بطلّع رخصتي، كنت رايح مشوار قريب.', "Alright officer… it's {rel2}'s licence — {name}. I'm still getting mine; I was only going somewhere close."], { rel: o.rel === 'brother' ? 'أخويا' : 'أختي', rel2: o.rel === 'brother' ? 'my brother' : 'my sister', name: o.name });
      D(t); CP.Dlg.statement(c, 'photo', t, 1, { admit: true });
      if (c.truth.favour && !k.favourOffered) { k.favourOffered = true; D(pr('طب يا باشا… خلّيها علينا المرة دي، وحاجة كده للشاي…', "Come on officer… let this one go, and a little something for your tea…")); CP.note(c, 'observation', pr('السواق عرض فلوس', 'Driver offered money'), 'verified'); }
      break; }
    case 'ask_health': {
      let t, unwell = false;
      if (c.truth.medical === 'hypo') { t = pr('مش… مش عارف، دايخ شوية وإيدي بتترعش.', "I… don't know. I'm dizzy and my hands are shaking."); unwell = true; }
      else if (c.truth.medical === 'faint') { PX(pr('الست اللي ورا تعبانة من الحر يا باشا، مش قادرة تتنفس!', "The lady in the back is overcome by the heat, officer — she can't breathe!")); t = pr('أنا كويس، بس الراكبة تعبانة.', "I'm fine, but the passenger isn't."); unwell = true; }
      else if (c.fam === 'invalid_sample') t = pr('مرهق بس يا باشا، بقالي ١٤ ساعة على الطريق، وعندي حساسية صدر.', "Just exhausted, officer — fourteen hours on the road, and I have a chest allergy.");
      else if (c.fam === 'screening' && c.variant === 'B') t = pr('واخد دوا برد، بيخليني أنعس شوية.', "I took cold medicine — it makes me a bit drowsy.");
      else t = pr('الحمد لله كويس.', "I'm fine, thank God.");
      D(t); CP.Dlg.statement(c, 'health', t, unwell ? 1 : 0, { unwell }); break; }
    case 'ask_symptoms': {
      const t = c.truth.medical === 'hypo' ? pr('أيوه… عندي سكر، ومكلتش من الصبح.', "Yes… I'm diabetic, and I haven't eaten since morning.") : c.truth.medical === 'faint' ? pr('(الراكبة) عندي ضغط… والعربية كانت فرن.', "(passenger) I have blood pressure problems… it was like an oven in there.") : pr('لأ الحمد لله.', 'No, thank God.');
      D(t); CP.Dlg.statement(c, 'symptoms', t, c.truth.medical ? 1 : 0); break; }
    case 'ask_drink': {
      let t, admit = false;
      if (c.fam === 'screening' && c.variant === 'A') { if (c.coop >= 50) { t = pr('كاسة واحدة مع العشا بس يا باشا.', 'Just one glass with dinner, officer.'); admit = true; } else t = pr('لأ خالص.', 'No, nothing at all.'); }
      else if (c.fam === 'screening') { t = pr('خدت دوا برد من الصيدلية الضهر.', 'I took cold medicine from the pharmacy at noon.'); admit = true; }
      else if (c.fam === 'invalid_sample') t = pr('لأ، أنا بس تعبان من السواقة.', "No, I'm just tired from driving.");
      else if (c.fam === 'medical') t = pr('لأ… أنا مابشربش.', "No… I don't drink.");
      else t = c.driver.pers === 'defensive' ? pr('لأ طبعاً! إيه السؤال ده؟', 'Of course not! What kind of question is that?') : pr('لأ يا فندم.', 'No, officer.');
      D(t); CP.Dlg.statement(c, 'drink', t, admit ? 1 : 0, { admit }); break; }
    case 'ask_bag': case 'ask_lookout': {
      let t;
      if (c.fam === 'medicine') { t = pr('دي أدوية والدتي، هي تعبانة وأنا رايح لها. افتحها لو حابب يا باشا.', "It's my mother's medicine — she's ill and I'm going to her. Open it if you like, officer."); k.consent = true; }
      else if (c.fam === 'lookout') t = c.variant === 'A' ? fillL(['طلبية أدوية لصيدليات في {dest}، والفواتير معايا في الصندوق.', 'A medicine order for pharmacies in {dest}; the invoices are with me in the back.'], vars) : pr('بضاعة يا باشا… الورق مع المندوب التاني، أنا بس سواق.', "Goods, officer… the paperwork is with the other rep. I'm just the driver.");
      else if (CC_isCargo(c)) t = pr('بضاعة عادية، والورق معايا.', 'Ordinary goods; the paperwork is with me.');
      else t = pr('حاجاتي الشخصية يا باشا.', 'My personal things, officer.');
      if (c.fam === 'lookout' && c.variant === 'A') k.consent = true;
      D(t); CP.Dlg.statement(c, 'bag', t, 1); break; }
    case 'mediate': {
      if (tone === 'firm' && c.coop < 55) { PX(pr('يا باشا ده حرامي!', "Officer, he's a thief!")); D(pr('الكلام ده مايصحش!', 'That’s outrageous!')); c.coop += 3; break; }
      if (c.variant === 'A') { PX(pr('السواق عايز خمسة جنيه زيادة عشان أنزل عند الكوبري!', 'The driver wants five pounds more to drop me at the bridge!')); D(pr('الأجرة مكتوبة على الإزاز يا باشا، هو عايز ينزل في حتة مش على الخط.', "The fare is posted on the window, officer — he wants to get off somewhere that's not on the route.")); }
      else { PX(pr('الأجرة الرسمية عشرة وهو واخد مننا خمستاشر!', "The official fare is ten and he's charging us fifteen!")); D(pr('السولار غلي يا باشا، أعمل إيه؟', 'Diesel went up, officer — what am I supposed to do?')); }
      k.disputeCalm = true; CP.note(c, 'incident', c.variant === 'A' ? pr('خلاف على مكان النزول والأجرة', 'Dispute over drop-off point and fare') : pr('ركاب بيقولوا الأجرة أعلى من الرسمية', 'Passengers say the fare exceeds the posted fare'), 'unverified');
      break; }
    case 'settle_dispute': {
      if (c.variant === 'A') { PX(pr('خلاص يا باشا، ماشي، هنزل عند الموقف.', "Alright officer, fine — I'll get off at the stand.")); D(pr('ربنا يخليك يا باشا.', 'Thank you, officer.')); }
      else { D(pr('حاضر يا باشا، الأجرة الرسمية. حقكم عليا.', "Yes officer, the official fare. My apologies to them.")); CP.Dlg.statement(c, 'overcharge', pr('حاضر، الأجرة الرسمية.', 'Fine, the official fare.'), 1, { admit: true }); }
      k.disputeSettled = true; c.cues = c.cues.filter(x => x !== 'shouting'); break; }
    case 'refuse_favour_polite': case 'refuse_favour_record': {
      D(pr('لا مؤاخذة يا باشا، ماقصدش حاجة.', "Sorry officer, I didn't mean anything by it."));
      k.favourHandled = intent === 'refuse_favour_record' ? 'record' : 'polite';
      if (intent === 'refuse_favour_record') CP.note(c, 'incident', pr('عرض رشوة اتسجل واترفض', 'Improper offer refused and recorded'), 'verified');
      break; }
    case 'explain': {
      k.explained = true; c.patience = CP.clamp(c.patience + 12, 0, 100); c.coop = CP.clamp(c.coop + 5, 0, 100);
      D(c.driver.pers === 'impatient' ? pr('ماشي… بس بسرعة لو سمحت.', 'Alright… but quickly, please.') : pr('ماشي يا فندم، براحتك.', 'Alright officer, take your time.'));
      break; }
    case 'close': D(pr('حاضر.', 'Alright.')); break;
  }
  CP.bus.emit('dialogue', c);
  CP.autosave();
};

/* ---------- gender-aware Egyptian Arabic ----------
   Officer lines addressed to a woman use feminine forms (رايحة، إنتي، استني، لو سمحتي…);
   a woman driver speaks about herself in the feminine (رايحة، تعبانة، واخدة…). English is already neutral. */
CP.Gender = {};
const GF = CP.Gender;
CP.Gender.full = true;
GF.isF = c => !!(c && c.driver && c.driver.g === 'f');
GF.OFF = {
  greet_docs: { calm: 'مساء الخير، رخصة القيادة ورخصة العربية لو سمحتي.', direct: 'الرخص والبطاقة لو سمحتي.' },
  ask_destination: { calm: 'رايحة فين إن شاء الله؟', direct: 'رايحة فين؟', firm: 'قوليلي رايحة فين بالظبط.' },
  ask_origin: { calm: 'وجاية منين؟', direct: 'جاية منين؟', firm: 'جاية منين؟ بالتحديد.' },
  ask_purpose: { calm: 'خير، رايحة ليه دلوقتي؟' },
  ask_passengers: { calm: 'مين معاكي في العربية؟' },
  ask_owner: { firm: 'العربية مش باسمك. اشرحي.' },
  ask_expiry: { calm: 'الرخصة دي منتهية، تعرفي؟', firm: 'ماشية برخصة منتهية ليه؟' },
  ask_health: { calm: 'إنتي كويسة؟ شكلك تعبانة شوية.', direct: 'إنتي تعبانة؟', firm: 'ركّزي معايا. إنتي كويسة؟' },
  ask_drink: { calm: 'شربتي أي حاجة أو خدتي أي دوا النهارده؟', direct: 'شاربة حاجة؟ واخدة دوا؟', firm: 'هسألك مرة واحدة: شاربة أو واخدة حاجة؟' },
  ask_bag: { firm: 'افتحي لي الشنطة دي وقوليلي فيها إيه.' },
  explain: { firm: 'استني لحد ما أخلص الإجراءات.' },
  repeat_destination: { calm: 'قلتيلي رايحة فين تاني؟', direct: 'رايحة فين؟ تاني.', firm: 'كرري رايحة فين.' },
  ask_reason_change: { calm: 'قلتي حاجة وبعدين حاجة تانية. إيه الحكاية؟' },
  ask_lookout: { calm: 'في تعميم على عربية شبه دي. شايلة إيه؟', direct: 'شايلة إيه في الصندوق؟', firm: 'عليكي تعميم. شايلة إيه؟' },
  refuse_favour_polite: { firm: 'اللي بتعمليه ده مخالفة. شيلي إيدك.' },
  refuse_favour_record: { calm: 'هسجل إنك عرضتي فلوس. خلّينا نمشي بالإجراءات.' },
  ask_symptoms: { calm: 'عندك سكر أو ضغط؟ محتاجة حاجة؟', firm: 'قوليلي حالتك الصحية بسرعة.' },
  close: { calm: 'شكراً، استني هنا دقيقة لو سمحتي.', direct: 'استني هنا.', firm: 'متتحركيش.' }
};
GF.LBL = { greet_docs: 'مساء الخير — الرخص لو سمحتي', ask_destination: 'رايحة فين؟', ask_origin: 'جاية منين؟', ask_passengers: 'مين معاكي؟', ask_health: 'إنتي كويسة؟', ask_drink: 'شربتي أو خدتي دوا؟', repeat_destination: 'رايحة فين تاني؟ (تأكيد)', ask_lookout: 'في تعميم — شايلة إيه؟', close: 'استني هنا لو سمحتي' };
GF.officer = function (c, intent, tone) {
  const base = DC.officer[intent][tone];
  const f = GF.isF(c) && GF.OFF[intent] && GF.OFF[intent][tone];
  return f ? [f, base[1]] : base;
};
GF.label = function (c, intent) { const base = CP.C.intentLabel[intent]; return GF.isF(c) && GF.LBL[intent] ? [GF.LBL[intent], base[1]] : base; };
/* first-person feminine forms for a woman driver's own words */
const FEM1 = { 'متأخر': 'متأخرة', 'كويس': 'كويسة', 'قايل': 'قايلة', 'شاريها': 'شارياها', 'رايح': 'رايحة', 'مروّح': 'مروّحة', 'مروح': 'مروحة', 'شغال': 'شغالة', 'تعبان': 'تعبانة', 'واخد': 'واخدة', 'عارف': 'عارفة', 'دايخ': 'دايخة', 'متأكد': 'متأكدة', 'مستعجل': 'مستعجلة', 'آسف': 'آسفة', 'راجع': 'راجعة', 'جاي': 'جاية', 'نازل': 'نازلة', 'متعود': 'متعودة', 'فاهم': 'فاهمة', 'خايف': 'خايفة', 'زعلان': 'زعلانة', 'شايل': 'شايلة', 'سايق': 'سايقة', 'مضطر': 'مضطرة' };
const AR = '\u0600-\u06FF';
const FEM1_RE = new RegExp('(^|[^' + AR + '])(' + Object.keys(FEM1).join('|') + ')(?=$|[^' + AR + '])', 'g');
const FEM_PHRASE = [['لمراتي', 'لجوزي'], ['دي مراتي والعيال', 'ده جوزي والعيال'], ['أنا ماشي في حالي', 'أنا ماشية في حالي'], ['أنا بس سواق', 'أنا بس سواقة']];
GF.fem1 = ar => { if (typeof ar !== 'string') return ar; for (const [m, f] of FEM_PHRASE) ar = ar.split(m).join(f); return ar.replace(FEM1_RE, (x, pre, w) => pre + FEM1[w]); };
GF.driverText = function (c, text) {
  if (!GF.isF(c) || !text) return text;
  const en = t => typeof t === 'string' ? t.replace(/\b([Mm])y wife\b/g, '$1y husband') : t;
  if (Array.isArray(text)) return [GF.fem1(text[0]), en(text[1])];
  return Object.assign({}, text, { ar: GF.fem1(text.ar), en: en(text.en) });
};
GF.driverWord = c => GF.isF(c) ? { ar: 'السواقة', en: 'Driver' } : { ar: 'السواق', en: 'Driver' };
GF.pers = (c, p) => { const L = CP.C.persLabel[p]; if (!GF.isF(c)) return L; const f = { patient: 'هادية', chatty: 'رغّاية', anxious: 'متوترة', impatient: 'مستعجلة', defensive: 'متحفزة' }[p]; return f ? [f, L[1]] : L; };
{ const say = CP.Dlg.say; CP.Dlg.say = function (c, who, text) { return say(c, who, who === 'driver' ? GF.driverText(c, text) : text); }; }
{ const st = CP.Dlg.statement; CP.Dlg.statement = function (c, key, text, val, extra) {
    const pax = extra && extra.passenger; const t = pax ? text : GF.driverText(c, text);
    const r = st(c, key, t, val, extra);
    if (!pax && GF.isF(c)) { const n = CP.G.shift.notes[CP.G.shift.notes.length - 1]; if (n && n.caseId === c.id && n.type === 'statement' && n.text.ar.indexOf('السواق: ') === 0) n.text = { ar: 'السواقة: ' + n.text.ar.slice(8), en: n.text.en }; }
    return r; }; }
;(window.CP_FILES = window.CP_FILES || {})['06_dialogue'] = '1.9.0';
