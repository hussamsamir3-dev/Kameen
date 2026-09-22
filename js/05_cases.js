/* Encounter engine: truth is generated ONCE per case from a fixed seed; player knowledge is kept separately in c.k */
CP.Cases = {};
const CC = CP.C;

/* ---------------- helpers ---------------- */
CP.plateStr = function (p, lang) {
  lang = lang || CP.lang;
  const letters = p.l.map(i => CC.plateLetters[i][lang === 'ar' ? 0 : 1]).join(' ');
  const digits = lang === 'ar' ? CP.arDigits(p.d) : p.d;
  return lang === 'ar' ? letters + '  ' + digits : letters + ' ' + digits;
};
CP.plateEq = (a, b) => a.d === b.d && a.l.join() === b.l.join();
CP.nameOf = (p) => ({ ar: p.first[0] + ' ' + p.father[0] + ' ' + p.fam[0], en: p.first[1] + ' ' + p.father[1] + ' ' + p.fam[1] });
CP.caseOf = (vid) => { const s = CP.G.shift; const v = s.vehicles.find(x => x.id === vid); return v && v.caseId ? s.cases[v.caseId] : null; };
CP.vehOfCase = (c) => CP.G.shift.vehicles.find(v => v.caseId === c.id) || null;
CP.gameClock = function () { const s = CP.G.shift; const mins = s.startMin + (s.t / s.dur) * (s.span || CP.SPAN); const h = Math.floor(mins / 60) % 24, m = Math.floor(mins % 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };

/* notebook entry */
CP.note = function (c, type, text, status, extra) {
  const s = CP.G.shift;
  const n = Object.assign({ id: 'N' + (s.nextNote++), caseId: c ? c.id : null, type, text, status: status || 'unverified', t: s.t, clock: CP.gameClock() }, extra || {});
  s.notes.push(n);
  CP.bus.emit('note', n);
  return n;
};
CP.notesFor = (c) => CP.G.shift.notes.filter(n => n.caseId === c.id);

/* ---------------- family table ---------------- */
const PRIVATE = ['classic_sedan', 'silver_sedan', 'charcoal_suv', 'cairo_taxi', 'estate_wagon', 'white_luxury', 'red_classic', 'blue_hatch', 'maroon_hatch', 'alex_taxi'];
const CARS = ['classic_sedan', 'silver_sedan', 'charcoal_suv', 'estate_wagon', 'white_luxury', 'red_classic', 'blue_hatch', 'maroon_hatch'];
const PROS = ['cairo_taxi', 'alex_taxi', 'microbus', 'older_minibus', 'cargo_truck', 'courier_van', 'box_truck', 'green_pickup'];
CP.FAM = {
  routine: { tier: 1, w: 50, types: null },
  expired: { tier: 1, w: 11, types: null },
  borrowed: { tier: 1, w: 10, types: PRIVATE.concat(['courier_van', 'cargo_truck', 'green_pickup', 'box_truck']) },
  plate_admin: { tier: 1, w: 7, types: PRIVATE.concat(['microbus', 'courier_van', 'green_pickup']) },
  overheat: { tier: 1, w: 5, types: ['microbus', 'older_minibus', 'cargo_truck', 'classic_sedan', 'cairo_taxi', 'red_classic', 'estate_wagon', 'alex_taxi', 'box_truck'] },
  alert: { tier: 2, w: 6, types: PRIVATE.concat(['courier_van', 'green_pickup']), serious: true },
  journey: { tier: 2, w: 7, types: CARS },
  licence_other: { tier: 2, w: 5, types: PRIVATE.concat(['microbus']) },
  medicine: { tier: 3, w: 6, types: CARS.concat(['cairo_taxi', 'alex_taxi']) },
  lookout: { tier: 3, w: 4, types: ['courier_van', 'cargo_truck', 'box_truck'], serious: true },
  screening: { tier: 4, w: 6, types: CARS, serious: true },
  invalid_sample: { tier: 4, w: 4, types: ['cairo_taxi', 'alex_taxi', 'microbus', 'cargo_truck', 'courier_van', 'box_truck'] },
  medical: { tier: 5, w: 4, types: CARS.concat(['cairo_taxi', 'courier_van']), serious: true },
  dispute: { tier: 5, w: 5, types: ['microbus', 'older_minibus'] }
};
CP.famName = {
  routine: ['فحص روتيني', 'Routine stop'], expired: ['رخصة منتهية', 'Expired document'], borrowed: ['عربية مستعارة', 'Borrowed vehicle'],
  plate_admin: ['خطأ في بيانات اللوحة', 'Plate record error'], overheat: ['موتور سخن', 'Overheating vehicle'], alert: ['ملاحظة على العربية', 'Vehicle alert'],
  journey: ['أقوال غير متسقة', 'Inconsistent journey'], licence_other: ['رخصة شخص تاني', "Someone else's licence"], medicine: ['أدوية مشروعة', 'Lawful medicine'],
  lookout: ['تعميم على شحنة', 'Cargo lookout'], screening: ['كشف يحتاج تأكيد', 'Screening needing confirmation'], invalid_sample: ['عينة غير صالحة', 'Invalid sample'],
  medical: ['حالة صحية', 'Medical distress'], dispute: ['خناقة ركاب', 'Passenger dispute'], wedding: ['زفة', 'Wedding convoy']
};

/* ---------------- generation ---------------- */
CP.Cases.pickFamily = function (r, loc) {
  const tier = CP.tier();
  const entries = [];
  for (const f in CP.FAM) { const F = CP.FAM[f]; if (F.tier <= tier) entries.push([f, F.w]); }
  return r.weighted(entries);
};
CP.Cases.pickType = function (r, fam, loc) {
  const F = CP.FAM[fam];
  const entries = [];
  for (const t in CC.veh) { if (t === 'ambulance' || t === 'police_pickup') continue; if (F.types && F.types.indexOf(t) < 0) continue; const L = CP.LOCS[loc] || {}; const w = (CC.veh[t].w[loc] ?? CC.veh[t].w[CP.locBase(loc)] ?? 0) * ((L.mul && L.mul[t] != null) ? L.mul[t] : 1); if (w > 0) entries.push([t, w]); }
  return entries.length ? r.weighted(entries) : 'silver_sedan';
};
function mkPerson(r, g, ageBand, famName) {
  const first = g === 'f' ? r.pick(CC.femaleFirst) : r.pick(CC.maleFirst);
  const father = r.pick(CC.maleFirst), fam = famName || r.pick(CC.family);
  const age = ageBand === 'old' ? r.int(58, 70) : ageBand === 'mid' ? r.int(36, 55) : r.int(21, 34);
  return { first, father, fam, g, age };
}
function mkPlate(r) { const n = r.int(2, 3); const l = []; for (let i = 0; i < n; i++) l.push(r.int(0, CC.plateLetters.length - 1)); const big = r() < .6; return { l, d: String(big ? r.int(1000, 9999) : r.int(100, 999)) }; }

CP.Cases.generate = function (opts) {
  const G = CP.G, s = G.shift, gr = CP.srng();
  const seed = Math.floor(gr() * 4294967295) >>> 0;
  const r = CP.makeRng(seed);
  const loc = s.loc;
  let fam = opts.fam || CP.Cases.pickFamily(r, loc);
  // returning citizen?
  let ret = null;
  if (opts.ret) ret = opts.ret;
  else if (!opts.fam && G.career.returning.length && r.chance(0.12)) { ret = r.pick(G.career.returning); if (ret.lastShift === s.no) ret = null; else fam = r.chance(.6) ? 'routine' : 'borrowed'; }
  let type = opts.type || (ret && ret.type && r.chance(.7) ? ret.type : CP.Cases.pickType(r, fam, loc));
  // a returning woman never re-appears in a vehicle whose artwork shows a male driver
  if (ret && CC.portraits[ret.portrait].g === 'f' && CC.veh[type].driver === 'm') type = (ret.type && CC.veh[ret.type].driver !== 'm') ? ret.type : r.pick(CARS.filter(t => CC.veh[t].driver !== 'm'));
  const V = CC.veh[type];
  const date = s.date;
  // driver
  let portrait, civ, g, pers;
  if (ret) { portrait = ret.portrait; g = CC.portraits[portrait].g; civ = ret.civ; pers = ret.pers; }
  else {
    const pro = V.lic === 'pro' || V.cls === 'cargo';
    const pool = Object.keys(CC.portraits).map(Number).filter(p => CC.portraits[p].g === 'm' || (V.driver !== 'm' && !(pro && r() < .85)));
    portrait = r.pick(pool); g = CC.portraits[portrait].g; civ = g === 'f' ? r.pick(CC.civFemale) : r.pick(CC.civMale); pers = r.pick(CC.personalities);
  }
  const dp = ret ? ret.person : mkPerson(r, g, CC.portraits[portrait].age);
  const dname = CP.nameOf(dp);
  const addr = r.pick(CC.addresses[loc] || CC.addresses[CP.locBase(loc)]);
  const dob = (2026 - dp.age) + '-' + String(r.int(1, 12)).padStart(2, '0') + '-' + String(r.int(1, 28)).padStart(2, '0');
  const plate = mkPlate(r);
  const licNo = 'L-' + r.int(100000, 999999);
  const idNo = 'G-' + r.int(1000, 9999) + '-' + r.int(1000, 9999);
  const places = CC.places[loc] || CC.places[CP.locBase(loc)];
  let origin = r.pick(places), dest = r.pick(places); while (dest === origin) dest = r.pick(places);
  let purpose = V.cls === 'passenger' ? (type === 'coach' ? CC.purposes[10] : CC.purposes[7]) : V.cls === 'cargo' ? (type === 'courier_van' ? CC.purposes[8] : CC.purposes[9]) : r.pick(CC.purposes.slice(0, 7));
  const pax = r.int(V.pax[0], V.pax[1]);
  const c = {
    id: 'K' + s.no + '-' + String(s.nextCase++).padStart(2, '0'), seed, fam, variant: 'A', type, loc, spawnT: s.t,
    driver: { p: dp, name: dname, g, portrait, civ, pers, addr, dob, licNo, idNo },
    owner: { name: dname, rel: null },
    plate, pax, paxRel: pax ? (V.cls === 'passenger' ? 'fares' : r.pick(['family', 'friends', 'colleagues'])) : null,
    journey: { origin, dest, purpose: purpose.id, purposeT: purpose.t, alt: null },
    docs: {},
    inv: { items: {}, zones: {} },
    truth: { vehRecord: 'clear', vehConfirm: null, personRecord: 'valid', breath: 'clear', breathInvalidFirst: false, drug: 'clear', drugConfirm: null, medical: null, overheat: false, dispute: null, favour: false, labResult: null, lookoutMatch: false },
    cues: [], urgency: r() * .5, patience: 70 + r.int(-15, 20), coop: { patient: 80, chatty: 75, anxious: 65, impatient: 55, defensive: 45 }[pers] + r.int(-8, 8),
    status: 'approach', ret: ret ? { lastFam: ret.lastFam, lastOutcome: ret.lastOutcome, lastShift: ret.lastShift, lastLoc: ret.lastLoc } : null,
    k: { docsHave: false, docsViewed: false, docsReturned: false, greeted: false, approached: false, stopped: false, asked: {}, statements: [], disc: [], verif: { vehicle: [], person: [], confirm: [] }, zones: {}, searchReason: null, scr: { breath: { st: 'idle', attempts: [], explained: false, checked: false, result: null }, drug: { st: 'idle', attempts: [], explained: false, gloves: false, result: null } }, explained: false, tones: { calm: 0, direct: 0, firm: 0 }, cuesSeen: [], cuesRec: [], medicalDone: false, medicalCalled: false, favourOffered: false, favourHandled: null, disputeCalm: false, disputeSettled: false, consent: false, repeats: 0, pending: {}, markerT: null, stopT: null, endT: null, intrusions: [] },
    dlg: { log: [] }, res: null, flags: {}
  };
  const licClass = V.lic;
  c.docs.licence = { name: dname, dob, no: licNo, cls: licClass, exp: CP.dateAdd(date, r.int(120, 2400)), photo: portrait };
  c.docs.reg = { plate: CP.deep(plate), make: V.make, colour: V.colour, cls: V.cls, owner: dname, exp: CP.dateAdd(date, r.int(40, 1000)) };
  c.docs.id = { name: dname, dob, no: idNo, addr, exp: CP.dateAdd(date, r.int(300, 2400)), photo: portrait };
  // base inventory (ordinary contents)
  const Z = V.zones; const addItem = (zone, kind, variant, owner) => { const id = c.id + '-i' + Object.keys(c.inv.items).length; c.inv.items[id] = { id, kind, variant: variant || null, zone, owner: owner || 'driver', st: {} }; (c.inv.zones[zone] = c.inv.zones[zone] || []).push(id); return id; };
  c._add = addItem; // (removed before save; see below)
  for (const z of Z) c.inv.zones[z] = [];
  const zDriver = Z.indexOf('driver') >= 0 ? 'driver' : 'cabin';
  addItem(zDriver, 'phone'); if (r.chance(.6)) addItem(zDriver, 'water_bottle');
  if (Z.indexOf('glovebox') >= 0) { addItem('glovebox', 'paper_stack', 'paper_receipts'); if (r.chance(.4)) addItem('glovebox', 'keys'); }
  if (V.cls === 'passenger') { addItem(zDriver, 'notebook', 'notebook_fares'); if (Z.indexOf('luggage') >= 0) { addItem('luggage', 'duffel_closed', 'duffel_clothes', 'passenger'); if (r.chance(.5)) addItem('luggage', 'duffel_closed', 'duffel_clothes', 'passenger'); } if (Z.indexOf('seats') >= 0 && r.chance(.6)) addItem('seats', 'snack', null, 'passenger'); if (Z.indexOf('floor') >= 0 && r.chance(.4)) addItem('floor', 'water_bottle', null, 'passenger'); }
  else { if (Z.indexOf('seats') >= 0 && r.chance(.5)) addItem('seats', 'snack'); if (Z.indexOf('boot') >= 0 && r.chance(.5)) addItem('boot', 'duffel_closed', 'duffel_clothes'); if (Z.indexOf('cargo') >= 0) addItem('cargo', 'paper_stack', 'paper_receipts'); }
  if (r.chance(.5)) addItem(zDriver, 'wallet');

  CP.Cases.applyFamily(c, r, date);
  delete c._add;
  s.cases[c.id] = c; s.caseOrder.push(c.id);
  return c;
};

CP.Cases.applyFamily = function (c, r, date) {
  const T = c.truth, D = c.docs, add = c._add, V = CC.veh[c.type];
  const zBag = V.zones.indexOf('seats') >= 0 ? 'seats' : 'cabin';
  switch (c.fam) {
    case 'routine': if (c.ret && c.ret.lastFam === 'expired') { /* renewed since last time */ } break;
    case 'expired': {
      const days = r.int(18, 260); D.licence.exp = CP.dateAdd(date, -days); T.personRecord = 'expired'; c.flags.expDays = days; break; }
    case 'borrowed': {
      const rels = c.driver.g === 'f' ? ['husband', 'father', 'brother', 'sister'] : ['brother', 'father', 'uncle', 'cousin', 'employer', 'friend'];
      const rel = r.pick(rels); const og = (rel === 'sister') ? 'f' : 'm';
      const same = ['brother', 'father', 'sister', 'cousin'].indexOf(rel) >= 0;
      const op = mkPerson(r, og, rel === 'father' ? 'old' : 'mid', same ? c.driver.p.fam : null);
      if (rel === 'father') { op.first = c.driver.p.father; }
      if (rel === 'brother' || rel === 'sister') op.father = c.driver.p.father;
      c.owner = { name: CP.nameOf(op), rel, person: op }; D.reg.owner = c.owner.name; T.vehRecord = 'clear'; break; }
    case 'plate_admin': {
      const d = c.plate.d.split(''); const i = r.int(0, d.length - 2); [d[i], d[i + 1]] = [d[i + 1], d[i]]; if (d.join('') === c.plate.d) d[i] = String((+d[i] + 1) % 10);
      D.reg.plate = { l: c.plate.l.slice(), d: d.join('') }; T.vehRecord = 'outdated'; c.flags.reissued = CP.dateAdd(date, -r.int(10, 50)); break; }
    case 'overheat': {
      T.overheat = true; c.cues.push('steam'); if (c.pax > 0 && r.chance(.35)) { T.medical = 'faint'; c.variant = 'B'; c.cues.push('passenger_pale'); }
      c.flags.overheatAt = r.int(0, 1); break; }
    case 'alert': {
      c.variant = r.chance(.6) ? 'A' : 'B';
      const op = mkPerson(r, 'm', 'mid'); c.owner = { name: CP.nameOf(op), rel: c.variant === 'B' ? 'seller' : r.pick(['friend', 'cousin', 'employer']), person: op }; D.reg.owner = c.owner.name;
      T.vehRecord = 'flagged'; T.vehConfirm = c.variant === 'A' ? 'notConfirmed' : 'confirmed'; c.flags.reportDate = CP.dateAdd(date, -r.int(20, 90));
      if (c.variant === 'B') add(V.zones.indexOf('glovebox') >= 0 ? 'glovebox' : 'cabin', 'paper_stack', 'paper_contract');
      break; }
    case 'journey': {
      c.variant = r.chance(.65) ? 'A' : 'B'; if (c.pax < 1) c.pax = r.int(1, 2); c.paxRel = 'family';
      const places = CC.places[c.loc]; let alt = r.pick(places); while (alt === c.journey.dest || alt === c.journey.origin) alt = r.pick(places);
      c.journey.alt = alt; // first stated destination is 'alt' (cover story); the truth is journey.dest
      if (c.variant === 'B') T.personRecord = 'suspended', c.flags.suspUntil = CP.dateAdd(date, r.int(30, 120));
      break; }
    case 'licence_other': {
      c.variant = 'A';
      const bp = mkPerson(r, 'm', CC.portraits[c.driver.portrait].age === 'old' ? 'old' : 'mid', c.driver.p.fam); bp.father = c.driver.p.father;
      const males = Object.keys(CC.portraits).map(Number).filter(p => CC.portraits[p].g === 'm' && p !== c.driver.portrait);
      if (c.driver.g !== 'm') { /* keep female drivers in this family using a sister's licence */ bp.g = 'f'; bp.first = r.pick(CC.femaleFirst); }
      const ages = ['young', 'mid', 'old']; const myAge = ages.indexOf(CC.portraits[c.driver.portrait].age);
      const sib = Object.keys(CC.portraits).map(Number).filter(p => p !== c.driver.portrait && CC.portraits[p].g === c.driver.g);
      const near = sib.filter(p => Math.abs(ages.indexOf(CC.portraits[p].age) - myAge) <= 1);
      const photo = r.pick(near.length ? near : sib);
      c.flags.other = { name: CP.nameOf(bp), photo, rel: c.driver.g === 'm' ? 'brother' : 'sister' };
      D.licence.name = c.flags.other.name; D.licence.photo = photo; D.licence.dob = (2026 - bp.age) + '-0' + r.int(1, 9) + '-1' + r.int(0, 9);
      T.personRecord = 'none'; T.favour = r.chance(.45); break; }
    case 'medicine': {
      c.cues.push('bag_seat'); const bid = add(zBag, 'duffel_closed', 'duffel_clothes'); c.flags.bag = bid;
      c.variant = r.chance(.6) ? 'A' : 'B';
      add(zBag, 'medicine_carton', c.variant === 'A' ? 'med_rx' : 'med_otc'); if (c.variant === 'A') add(zBag, 'paper_stack', 'paper_prescription');
      if (r.chance(.5)) c.driver.pers = 'anxious'; break; }
    case 'lookout': {
      c.variant = r.chance(.55) ? 'A' : 'B'; c.cues.push('cargo_cartons');
      const lp = CP.deep(c.plate); if (c.variant === 'A') { lp.l[0] = (lp.l[0] + 1 + r.int(0, 3)) % CC.plateLetters.length; }
      c.flags.lookoutPlate = lp; T.lookoutMatch = c.variant === 'B'; T.vehRecord = c.variant === 'B' ? 'flagged' : 'clear'; T.vehConfirm = c.variant === 'B' ? 'confirmed' : null;
      add('cargo', 'medicine_carton', 'med_bulk'); add('cargo', 'medicine_carton', 'med_bulk'); add('cargo', 'paper_stack', c.variant === 'A' ? 'paper_invoice' : 'paper_blank');
      c.journey.purpose = 'delivery'; c.journey.purposeT = CC.purposes[8].t; break; }
    case 'screening': {
      c.variant = r.chance(.55) ? 'A' : 'B';
      if (c.variant === 'A') { T.breath = 'refer'; T.breathConfirm = 'confirmed'; c.cues.push('alcohol_smell'); if (r.chance(.5)) c.cues.push('swerve'); }
      else { T.drug = 'refer'; T.drugConfirm = 'notConfirmed'; c.cues.push('drowsy'); add(V.zones.indexOf('glovebox') >= 0 ? 'glovebox' : 'cabin', 'medicine_carton', 'med_otc'); }
      break; }
    case 'invalid_sample': { T.breathInvalidFirst = true; c.cues.push(r.chance(.5) ? 'swerve' : 'drowsy'); break; }
    case 'medical': { T.medical = 'hypo'; c.cues.push('sweating'); if (r.chance(.5)) c.cues.push('swerve'); c.urgency = .9; break; }
    case 'dispute': { c.variant = r.chance(.6) ? 'A' : 'B'; T.dispute = c.variant; c.cues.push('shouting'); c.pax = Math.max(c.pax, 5); break; }
  }
  // driver impatience comes from urgency and personality, never from truth
  if (c.journey.purpose === 'hospital' || c.journey.purpose === 'airport') c.urgency = Math.max(c.urgency, .7);
};

/* ---------------- verification results (derived from truth, never re-rolled) ---------------- */
CP.Cases.verifyResult = function (c, kind) {
  const T = c.truth, D = c.docs, f = c.flags;
  if (kind === 'vehicle') {
    if (c.fam === 'lookout') {
      if (T.lookoutMatch) return { st: 'flagged', text: CP.fill(['اللوحة {p} مطابقة لتعميم سرقة مخزن أدوية. مطلوب تأكيد قبل أي إجراء.', 'Plate {p} matches an active lookout (pharmacy depot theft). Confirm before any action.'], { p: { ar: CP.plateStr(c.plate, 'ar'), en: CP.plateStr(c.plate, 'en') } }) };
      return { st: 'clear', text: CP.fill(['العربية {p} مسجلة باسم {o}. مش هي العربية اللي عليها التعميم — التعميم على حرف مختلف.', 'Vehicle {p} registered to {o}. Not the lookout vehicle — the lookout plate differs by a letter.'], { p: { ar: CP.plateStr(c.plate, 'ar'), en: CP.plateStr(c.plate, 'en') }, o: c.owner.name }) };
    }
    if (T.vehRecord === 'clear') return { st: 'clear', text: CP.fill(['العربية {p} مسجلة باسم {o}. مفيش أي ملاحظات.', 'Vehicle {p} is registered to {o}. No alerts.'], { p: { ar: CP.plateStr(c.plate, 'ar'), en: CP.plateStr(c.plate, 'en') }, o: c.owner.name }) };
    if (T.vehRecord === 'outdated') return { st: 'outdated', text: CP.fill(['السجل اتحدث يوم {d}: العربية خدت لوحة جديدة {p} والرخصة لسه ماتغيرتش. محتاج تحديث إداري.', 'Record updated {d}: vehicle re-plated as {p}; the licence card has not been reissued yet. Administrative update needed.'], { d: { ar: CP.fmtDateL(f.reissued, 'ar'), en: CP.fmtDateL(f.reissued, 'en') }, p: { ar: CP.plateStr(c.plate, 'ar'), en: CP.plateStr(c.plate, 'en') } }) };
    if (T.vehRecord === 'flagged') return { st: 'flagged', text: CP.fill(['تنبيه: العربية دي عليها بلاغ سرقة من يوم {d}. البلاغ محتاج تأكيد قبل أي إجراء.', 'ALERT: this vehicle was reported stolen on {d}. The report must be confirmed before action.'], { d: { ar: CP.fmtDateL(f.reportDate, 'ar'), en: CP.fmtDateL(f.reportDate, 'en') } }) };
  }
  if (kind === 'person') {
    const pr = T.personRecord;
    if (c.fam === 'licence_other') return { st: 'flagged', text: CP.fill(['مفيش رخصة قيادة مسجلة باسم {n}. رخصة رقم {l} مسجلة باسم {o}.', 'No driving licence on record for {n}. Licence {l} is registered to {o}.'], { n: c.driver.name, l: D.licence.no, o: f.other.name }) };
    if (pr === 'valid') return { st: 'clear', text: CP.fill(['رخصة {l} باسم {n} سارية. مفيش ملاحظات.', 'Licence {l} for {n} is valid. No notes.'], { l: D.licence.no, n: c.driver.name }) };
    if (pr === 'expired') return { st: 'flagged', text: CP.fill(['رخصة {l} منتهية من {n} يوم. مفيش ملاحظات تانية.', 'Licence {l} expired {n} days ago. No other notes.'], { l: D.licence.no, n: { ar: CP.arDigits(f.expDays), en: String(f.expDays) } }) };
    if (pr === 'suspended') return { st: 'flagged', text: CP.fill(['رخصة {l} موقوفة إدارياً لحد {d}.', 'Licence {l} is administratively suspended until {d}.'], { l: D.licence.no, d: { ar: CP.fmtDateL(f.suspUntil, 'ar'), en: CP.fmtDateL(f.suspUntil, 'en') } }) };
  }
  if (kind === 'confirm') {
    if (c.fam === 'lookout' && T.lookoutMatch) return { st: 'confirmed', text: { ar: 'المشرف أكد: التعميم ساري والعربية مطلوبة. تحفظ لحين التسليم.', en: 'Supervisor confirms: the lookout is active. Hold the vehicle for handover.' } };
    if (T.vehConfirm === 'confirmed') return { st: 'confirmed', text: { ar: 'المشرف أكد: البلاغ ساري. تحفظ على العربية لحين التسليم.', en: 'Supervisor confirms: the theft report is active. Hold the vehicle for handover.' } };
    if (T.vehConfirm === 'notConfirmed') return { st: 'notConfirmed', text: CP.fill(['المشرف: البلاغ اتقفل يوم {d} والعربية اترجعت لصاحبها. التنبيه لسه ماتشالش من السيستم.', 'Supervisor: the report was closed on {d}; the vehicle was returned to its owner. The alert was never cleared from the system.'], { d: { ar: CP.fmtDateL(CP.dateAdd(c.flags.reportDate, 12), 'ar'), en: CP.fmtDateL(CP.dateAdd(c.flags.reportDate, 12), 'en') } }) };
    return { st: 'notConfirmed', text: { ar: 'المشرف: مفيش حاجة تستدعي تأكيد.', en: 'Supervisor: nothing requires confirmation.' } };
  }
  return { st: 'unresolved', text: { ar: '—', en: '—' } };
};
CP.fmtDateL = (iso, lang) => { const o = CP.lang; CP.lang = lang; const s = CP.fmtDate(iso); CP.lang = o; return s; };

/* start a radio query (asynchronous timed task). Returns error key or null */
CP.Cases.radioQuery = function (c, kind, byPartner) {
  const s = CP.G.shift;
  if (c.k.pending[kind]) return 'r_pending';
  if (kind !== 'confirm' && !c.k.docsHave && !c.k.docsReturned) return 'r_needDocs';
  const r = CP.srng();
  const up = CP.G.career.upgrades.radio;
  // radio checks are quick: never more than 5 seconds (better radio upgrade makes them faster still)
  let dur = (2.4 + r() * 1.4) * [1, .85, .7][up];
  if (kind === 'confirm') dur = (3.2 + r() * 1.0) * [1, .85, .7][up];
  if (s.events.radioDelayUntil > s.t) dur += 0.8;
  dur = Math.min(5, dur);
  const fail = r() < [0.16, 0.09, 0.04][up];
  c.k.pending[kind] = true;
  CP.Tasks.add({ type: 'radio', owner: 'radio', caseId: c.id, dur, data: { kind, fail, byPartner: !!byPartner } });
  CP.Audio.radioClick();
  s.radio.push({ t: s.t, text: CP.fill(['{who}: استعلام {k} — {id}', '{who}: {k} query — {id}'], { who: byPartner ? { ar: 'الزميل', en: 'Partner' } : { ar: 'أنت', en: 'You' }, k: kind === 'vehicle' ? { ar: 'عربية', en: 'vehicle' } : kind === 'person' ? { ar: 'رخصة', en: 'licence' } : { ar: 'تأكيد', en: 'confirmation' }, id: c.id }) });
  return null;
};
CP.Cases.radioComplete = function (task) {
  const s = CP.G.shift; const c = s.cases[task.caseId]; if (!c) return;
  const kind = task.data.kind; c.k.pending[kind] = false;
  let res;
  if (task.data.fail) res = { st: 'unresolved', text: { ar: 'العمليات: الإشارة مقطوعة، مفيش رد واضح. أعد الاستعلام.', en: 'Dispatch: signal broke up, no clear reply. Please repeat the query.' } };
  else res = CP.Cases.verifyResult(c, kind);
  c.k.verif[kind].push({ st: res.st, t: s.t });
  const status = res.st === 'clear' ? 'verified' : res.st === 'unresolved' ? 'unverified' : res.st === 'outdated' ? 'verified' : res.st === 'confirmed' ? 'verified' : res.st === 'notConfirmed' ? 'verified' : 'unverified';
  CP.note(c, 'verification', res.text, status, { result: res.st, kind });
  s.radio.push({ t: s.t, text: CP.fill(['العمليات ← {id}: {r}', 'Dispatch → {id}: {r}'], { id: c.id, r: { ar: CP.STR.ar['rv_' + res.st] || res.st, en: CP.STR.en['rv_' + res.st] || res.st } }), st: res.st });
  CP.Audio.radioClick(true);
  CP.UI && CP.UI.radioFlash(res.st);
  CP.bus.emit('verification', { c, kind, res });
  CP.autosave();
};

/* ---------------- discrepancy logic (documents panel) ---------------- */
CP.Cases.fieldVal = function (c, f) {
  const D = c.docs; const V = CC.veh[c.type];
  switch (f) {
    case 'lic.name': return { k: 'name', v: D.licence.name.en }; case 'id.name': return { k: 'name', v: D.id.name.en }; case 'reg.owner': return { k: 'name', v: D.reg.owner.en };
    case 'lic.photo': return { k: 'photo', v: D.licence.photo }; case 'id.photo': return { k: 'photo', v: D.id.photo }; case 'obs.face': return { k: 'photo', v: c.driver.portrait };
    case 'lic.dob': return { k: 'dob', v: D.licence.dob }; case 'id.dob': return { k: 'dob', v: D.id.dob };
    case 'reg.plate': return { k: 'plate', v: D.reg.plate.l.join() + D.reg.plate.d }; case 'obs.plate': return { k: 'plate', v: c.plate.l.join() + c.plate.d };
    case 'reg.make': return { k: 'make', v: D.reg.make[1] }; case 'obs.make': return { k: 'make', v: V.make[1] };
    case 'reg.colour': return { k: 'colour', v: D.reg.colour[1] }; case 'obs.colour': return { k: 'colour', v: V.colour[1] };
    case 'reg.cls': return { k: 'cls', v: D.reg.cls }; case 'obs.cls': return { k: 'cls', v: V.cls };
    case 'lic.cls': return { k: 'lcls', v: D.licence.cls };
    case 'lic.exp': return { k: 'exp', v: D.licence.exp }; case 'reg.exp': return { k: 'exp', v: D.reg.exp }; case 'id.exp': return { k: 'exp', v: D.id.exp };
    case 'lic.no': return { k: 'no', v: D.licence.no }; case 'id.no': return { k: 'idno', v: D.id.no }; case 'id.addr': return { k: 'addr', v: D.id.addr[1] };
  }
  return { k: 'x', v: null };
};
/* returns {ok, key, text, msg} */
CP.Cases.compare = function (c, fields) {
  const s = CP.G.shift;
  if (fields.length === 1) {
    const a = CP.Cases.fieldVal(c, fields[0]);
    if (a.k !== 'exp') return { ok: false, msg: 'doc_select' };
    const days = CP.dateDiff(s.date, a.v);
    if (days <= 0) return { ok: false, msg: 'doc_notExpired' };
    const which = fields[0].split('.')[0];
    const lab = { lic: ['رخصة القيادة', 'Driver licence'], reg: ['رخصة المركبة', 'Vehicle licence'], id: ['البطاقة', 'ID card'] }[which];
    return { ok: true, key: 'expiry_' + which, text: CP.fill(['{d} منتهية من {n} يوم', '{d} expired {n} days ago'], { d: lab, n: { ar: CP.arDigits(days), en: String(days) } }) };
  }
  const a = CP.Cases.fieldVal(c, fields[0]), b = CP.Cases.fieldVal(c, fields[1]);
  // licence class vs vehicle class is a special comparable pair
  if ((a.k === 'lcls' && b.k === 'cls') || (a.k === 'cls' && b.k === 'lcls')) {
    const lc = a.k === 'lcls' ? a.v : b.v, vc = a.k === 'cls' ? a.v : b.v; const need = (vc === 'private' ? 'private' : (vc === 'cargo' && c.type === 'courier_van') ? 'private' : 'pro');
    if (lc === need || lc === 'pro') return { ok: false, msg: 'doc_match' };
    return { ok: true, key: 'lic_class', text: { ar: 'فئة الرخصة مش مناسبة لنوع العربية', en: 'Licence class does not cover this vehicle type' } };
  }
  if (a.k !== b.k || fields[0] === fields[1]) return { ok: false, msg: 'doc_invalidPair' };
  if (a.v === b.v) return { ok: false, msg: 'doc_match' };
  const pairs = fields.slice().sort().join('|');
  const key = { name: pairs.indexOf('reg.owner') >= 0 ? 'owner' : 'name_id', photo: 'photo', dob: 'dob', plate: 'plate', make: 'veh_desc', colour: 'veh_desc', cls: 'veh_desc' }[a.k] || a.k;
  const texts = {
    owner: CP.fill(['المالك في رخصة المركبة ({o}) مش السواق', 'Registered owner ({o}) is not the driver'], { o: c.docs.reg.owner }),
    name_id: CP.fill(['الاسم في الرخصة ({a}) مختلف عن البطاقة ({b})', 'Licence name ({a}) differs from ID card ({b})'], { a: c.docs.licence.name, b: c.docs.id.name }),
    photo: { ar: 'صورة الرخصة مش مطابقة لوش السواق/البطاقة', en: "Licence photo does not match the driver's face / ID" },
    dob: { ar: 'تاريخ الميلاد مختلف بين الرخصة والبطاقة', en: 'Date of birth differs between licence and ID' },
    plate: CP.fill(['اللوحة في الرخصة {a} واللي على العربية {b}', 'Licence plate {a}; plate on vehicle {b}'], { a: { ar: CP.plateStr(c.docs.reg.plate, 'ar'), en: CP.plateStr(c.docs.reg.plate, 'en') }, b: { ar: CP.plateStr(c.plate, 'ar'), en: CP.plateStr(c.plate, 'en') } }),
    veh_desc: { ar: 'وصف العربية مش مطابق للرخصة', en: 'Vehicle description does not match the licence' }
  };
  return { ok: true, key, text: texts[key] || { ar: 'تعارض', en: 'Discrepancy' } };
};
CP.Cases.recordDiscrepancy = function (c, fields) {
  const res = CP.Cases.compare(c, fields);
  if (!res.ok) return res;
  if (c.k.disc.indexOf(res.key) >= 0) return { ok: false, msg: 'doc_already' };
  c.k.disc.push(res.key);
  CP.note(c, 'discrepancy', res.text, 'unverified', { dkey: res.key, fields });
  CP.autosave();
  return res;
};
/* actual discrepancies present (for assist highlighting & evaluation) */
CP.Cases.trueDiscrepancies = function (c) {
  const out = [], s = CP.G.shift;
  if (CP.dateDiff(s.date, c.docs.licence.exp) > 0) out.push({ key: 'expiry_lic', f: ['lic.exp'] });
  if (CP.dateDiff(s.date, c.docs.reg.exp) > 0) out.push({ key: 'expiry_reg', f: ['reg.exp'] });
  if (c.docs.reg.owner.en !== c.driver.name.en) out.push({ key: 'owner', f: ['reg.owner', 'lic.name'] });
  if (c.docs.licence.name.en !== c.docs.id.name.en) out.push({ key: 'name_id', f: ['lic.name', 'id.name'] });
  if (c.docs.licence.photo !== c.driver.portrait) out.push({ key: 'photo', f: ['lic.photo', 'obs.face'] });
  if (!CP.plateEq(c.docs.reg.plate, c.plate)) out.push({ key: 'plate', f: ['reg.plate', 'obs.plate'] });
  return out;
};

/* ---------------- grounds (for proportionality) ---------------- */
CP.Cases.grounds = function (c) {
  const k = c.k; const g = {};
  g.discrepancy = k.disc.length > 0;
  g.alert = k.verif.vehicle.some(v => v.st === 'flagged') || k.verif.person.some(v => v.st === 'flagged');
  g.statement = k.disc.indexOf('statement') >= 0;
  g.consent = k.consent;
  g.observation = k.cuesRec.length > 0;
  g.lookout = c.fam === 'lookout' && (k.cuesRec.indexOf('cargo_cartons') >= 0 || g.alert || k.asked.ask_lookout);
  g.impairCue = k.cuesRec.some(x => ['alcohol_smell', 'drowsy', 'swerve', 'sweating'].indexOf(x) >= 0) || k.statements.some(s => s.key === 'drink' && s.admit);
  return g;
};
CP.Cases.searchReasonValid = function (c, reason) {
  const g = CP.Cases.grounds(c);
  return { discrepancy: g.discrepancy, alert: g.alert || g.lookout, statement: g.statement, consent: g.consent, observation: g.observation, routine: false }[reason] || false;
};

/* ---------------- evaluation ---------------- */
const P = (ar, en) => ({ ar, en });
CP.Cases.outcomes = function (c) {
  const T = c.truth, v = c.variant;
  switch (c.fam) {
    case 'routine': return { ideal: ['release', 'advice'], ok: [], bad: ['warning', 'citation', 'refer_admin', 'hold', 'handover', 'medical'] };
    case 'expired': return { ideal: ['warning', 'citation'], ok: ['refer_admin', 'advice'], bad: ['release', 'hold', 'handover', 'medical'] };
    case 'borrowed': return { ideal: ['release', 'advice'], ok: [], bad: ['warning', 'citation', 'refer_admin', 'hold', 'handover', 'medical'] };
    case 'plate_admin': return { ideal: ['refer_admin'], ok: ['advice', 'release', 'warning'], bad: ['citation', 'hold', 'handover', 'medical'] };
    case 'overheat': return T.medical ? { ideal: ['medical'], ok: ['advice', 'release'], bad: ['warning', 'citation', 'hold', 'handover', 'refer_admin'] } : { ideal: ['advice', 'release'], ok: ['medical'], bad: ['warning', 'citation', 'hold', 'handover', 'refer_admin'] };
    case 'alert': return v === 'A' ? { ideal: ['refer_admin', 'release'], ok: ['advice', 'hold'], bad: ['handover', 'citation', 'warning', 'medical'] } : { ideal: ['handover', 'hold'], ok: [], bad: ['release', 'advice', 'warning', 'refer_admin', 'citation', 'medical'] };
    case 'journey': return v === 'A' ? { ideal: ['release', 'advice'], ok: [], bad: ['warning', 'citation', 'refer_admin', 'hold', 'handover', 'medical'] } : { ideal: ['citation', 'refer_admin'], ok: ['warning', 'hold'], bad: ['release', 'advice', 'handover', 'medical'] };
    case 'licence_other': return { ideal: ['citation', 'refer_admin'], ok: ['hold', 'warning'], bad: ['release', 'advice', 'handover', 'medical'] };
    case 'medicine': return { ideal: ['release', 'advice'], ok: [], bad: ['warning', 'citation', 'refer_admin', 'hold', 'handover', 'medical'] };
    case 'lookout': return v === 'A' ? { ideal: ['release', 'advice'], ok: [], bad: ['warning', 'citation', 'refer_admin', 'hold', 'handover', 'medical'] } : { ideal: ['handover', 'hold'], ok: [], bad: ['release', 'advice', 'warning', 'citation', 'refer_admin', 'medical'] };
    case 'screening': return v === 'A' ? { ideal: ['hold', 'citation'], ok: ['handover', 'refer_admin'], bad: ['release', 'advice', 'warning', 'medical'] } : { ideal: ['advice', 'release'], ok: ['hold', 'medical'], bad: ['citation', 'handover', 'warning', 'refer_admin'] };
    case 'invalid_sample': return { ideal: ['advice', 'release'], ok: ['warning'], bad: ['citation', 'hold', 'handover', 'refer_admin', 'medical'] };
    case 'medical': return { ideal: ['medical'], ok: [], bad: ['release', 'advice', 'warning', 'citation', 'hold', 'handover', 'refer_admin'] };
    case 'dispute': return v === 'A' ? { ideal: ['advice', 'release'], ok: ['warning'], bad: ['citation', 'hold', 'handover', 'refer_admin', 'medical'] } : { ideal: ['warning', 'citation'], ok: ['advice'], bad: ['release', 'hold', 'handover', 'refer_admin', 'medical'] };
  }
  return { ideal: ['release'], ok: [], bad: [] };
};
CP.Cases.truthSummary = function (c) {
  const v = c.variant, T = c.truth;
  const m = {
    routine: P('كل الأوراق سليمة — مشوار عادي.', 'Everything was in order — an ordinary trip.'),
    expired: P('رخصة القيادة كانت منتهية فعلاً؛ غير كده كله سليم.', 'The driving licence really had expired; nothing else was wrong.'),
    borrowed: P('العربية مستعارة بشكل قانوني من ' + CP.L(c.owner.name) + '.', 'The vehicle was lawfully borrowed from ' + CP.L(c.owner.name) + '.'),
    plate_admin: P('اللوحة اتغيرت ورخصة المركبة لسه ماتحدثتش — خطأ إداري.', 'The vehicle was re-plated and the licence card not yet updated — a clerical issue.'),
    overheat: T.medical ? P('الموتور سخن، وراكب كان محتاج رعاية طبية.', 'The engine overheated and a passenger needed medical attention.') : P('عطل موتور بس؛ الأوراق سليمة.', 'Only an engine fault; the papers were fine.'),
    alert: v === 'A' ? P('البلاغ قديم ومقفول؛ التنبيه ماتشالش من السيستم.', 'The report was old and closed; the alert had never been cleared.') : P('البلاغ ساري فعلاً — والعقد مايلغيش البلاغ.', 'The report was genuinely active — the sale contract did not cancel it.'),
    journey: v === 'A' ? P('السواق خبّى وجهته لسبب شخصي بريء.', 'The driver hid the destination for an innocent personal reason.') : P('رخصة السواق كانت موقوفة إدارياً.', "The driver's licence was administratively suspended."),
    licence_other: P('السواق كان سايق برخصة قريبه ومعهوش رخصة.', "The driver was using a relative's licence and had none of their own."),
    medicine: P('الأدوية مشروعة ومعاها روشتة أو بتتباع عادي.', 'The medicine was lawful (prescribed or over the counter).'),
    lookout: v === 'A' ? P('شحنة صيدلية سليمة بفواتير — العربية مش المقصودة بالتعميم.', 'A legitimate pharmacy delivery with invoices — not the lookout vehicle.') : P('العربية هي المطلوبة في التعميم والبضاعة من غير مصدر.', 'This was the lookout vehicle; the goods had no provenance.'),
    screening: v === 'A' ? P('نتيجة النفس اتأكدت فوق الحد في قواعد اللعبة.', 'The breath result was confirmed above the game limit.') : P('النتيجة المبدئية كانت بسبب دوا برد مشروع — التأكيد نفى.', 'The preliminary result came from lawful cold medicine — confirmation cleared it.'),
    invalid_sample: P('العينة الأولى باظت بسبب حساسية صدر؛ الإعادة سليمة.', 'The first sample failed because of a chest condition; the repeat was clear.'),
    medical: P('هبوط سكر — حالة طبية، مش قيادة تحت تأثير.', 'Low blood sugar — a medical condition, not impairment.'),
    dispute: v === 'A' ? P('الراكب فهم الأجرة غلط؛ السواق ملتزم.', 'The passenger misunderstood the fare; the driver was compliant.') : P('السواق كان بياخد أجرة زيادة.', 'The driver was overcharging.')
  };
  return m[c.fam] || P('—', '—');
};

CP.Cases.evaluate = function (c) {
  const s = CP.G.shift, k = c.k, res = c.res, notes = [];
  const out = CP.Cases.outcomes(c);
  const d = res.decision;
  let dec = out.ideal.indexOf(d) >= 0 ? 100 : out.ok.indexOf(d) >= 0 ? 65 : out.bad.indexOf(d) >= 0 ? 15 : 40;
  const decWord = dec >= 100 ? P('قرار سليم', 'Sound decision') : dec >= 60 ? P('قرار مقبول', 'Acceptable decision') : P('قرار مش مناسب للحالة', 'Decision did not fit the facts');
  notes.push(P(decWord.ar + ': ' + CP.STR.ar['res_' + d] + '.', decWord.en + ': ' + CP.STR.en['res_' + d] + '.'));
  const vv = k.verif;
  // requirements & procedure
  const needVeh = ['alert', 'lookout', 'plate_admin'].indexOf(c.fam) >= 0 && c.fam !== 'lookout' || (c.fam === 'lookout' && c.variant === 'B');
  if (needVeh && !vv.vehicle.some(x => x.st !== 'unresolved')) { dec -= 25; notes.push(P('ماتعملش استعلام عن العربية قبل القرار.', 'No vehicle verification before deciding.')); }
  if ((c.fam === 'alert' || (c.fam === 'lookout' && c.variant === 'B')) && ['handover', 'hold'].indexOf(d) >= 0 && !vv.confirm.some(x => x.st !== 'unresolved')) { dec -= 20; notes.push(P('التنبيه ماتأكدش من المشرف قبل الإجراء.', 'The alert was not confirmed by a supervisor before acting.')); }
  if (c.fam === 'alert' && c.variant === 'A' && !vv.confirm.length && ['release', 'refer_admin'].indexOf(d) >= 0) { dec -= 15; notes.push(P('أطلقت عربية عليها تنبيه من غير تأكيد — القرار صح بالصدفة.', 'Released a flagged vehicle without confirmation — right outcome, weak process.')); }
  if (['journey', 'licence_other', 'expired'].indexOf(c.fam) >= 0 && (c.fam !== 'journey' || c.variant === 'B') && !vv.person.some(x => x.st !== 'unresolved') && ['citation', 'hold', 'refer_admin'].indexOf(d) >= 0 && c.fam !== 'expired') { dec -= 15; notes.push(P('ماستعلمتش عن الرخصة قبل المخالفة.', 'No licence verification before the citation.')); }
  if (!k.docsViewed && ['routine', 'borrowed', 'dispute', 'overheat', 'medical'].indexOf(c.fam) < 0) { dec -= 20; notes.push(P('ماراجعتش الأوراق.', 'Documents were never reviewed.')); }
  if (c.fam === 'screening' && c.variant === 'B' && ['citation', 'handover'].indexOf(d) >= 0) notes.push(P('اتعاملت مع نتيجة مبدئية على إنها إدانة.', 'A preliminary result was treated as a finding.'));
  if (c.fam === 'screening' && !k.scr.breath.result && !k.scr.drug.result && ['hold', 'citation', 'handover'].indexOf(d) >= 0) { dec -= 30; notes.push(P('مفيش كشف يدعم القرار.', 'No screening supports this decision.')); }
  if (c.fam === 'medical' || (c.fam === 'overheat' && c.truth.medical)) {
    if (d === 'medical' && k.medicalDone) notes.push(P('الحالة الطبية اتعاملت صح.', 'The medical need was handled.'));
    const late = k.stopT != null && (c.k.endT - k.stopT) > 240; if (late) { dec -= 10; notes.push(P('الاستجابة الطبية اتأخرت.', 'The medical response was slow.')); }
  }
  if (c.truth.favour && k.favourOffered) {
    if (k.favourHandled === 'record') notes.push(P('رفضت عرض الرشوة وسجلته.', 'You refused the improper offer and recorded it.'));
    else if (k.favourHandled === 'polite') notes.push(P('رفضت العرض بس ماسجلتهوش.', 'You refused the offer but did not record it.'));
  }
  dec = CP.clamp(dec, 0, 100);
  // proportionality
  let prop = 100;
  const g = CP.Cases.grounds(c);
  const zonesDone = Object.keys(k.zones).length;
  if (zonesDone) {
    const valid = k.searchReason && CP.Cases.searchReasonValid(c, k.searchReason);
    if (!valid) { prop -= 25; notes.push(P('تفتيش من غير سبب مسجل.', 'Search without a recorded reason.')); }
    if (!valid && zonesDone > 2) { prop -= 5 * (zonesDone - 2); }
  }
  const bagged = Object.values(c.inv.items).filter(i => i.st.bagged);
  for (const it of bagged) { const vr = it.variant && CC.itemVariants[it.variant]; if (vr && vr.lawful === true && !(c.fam === 'lookout' && c.variant === 'B')) { prop -= 25; notes.push(P('تحريز غرض مشروع.', 'A lawful item was bagged as evidence.')); break; } }
  const screened = k.scr.breath.attempts.length + k.scr.drug.attempts.length;
  if (screened && !g.impairCue) { prop -= 20; notes.push(P('كشف من غير مؤشر مسجل.', 'Screening without a recorded indicator.')); }
  if (['hold', 'handover'].indexOf(d) >= 0 && out.ideal.indexOf(d) < 0) { prop -= 30; notes.push(P('تحفظ مش متناسب مع الحالة.', 'Detention was disproportionate.')); }
  prop = CP.clamp(prop, 0, 100);
  // communication
  let com = 70;
  if (k.greeted) com += 8;
  if (k.explained) com += 10;
  const tot = k.tones.calm + k.tones.direct + k.tones.firm;
  if (tot && k.tones.firm / tot > .5 && ['patient', 'chatty', 'anxious'].indexOf(c.driver.pers) >= 0) { com -= 15; notes.push(P('نبرة حازمة زيادة مع سواق متعاون.', 'Overly firm tone with a cooperative driver.')); }
  if (tot && k.tones.calm / tot >= .5) com += 7;
  if (k.repeats > 2) { com -= 8; notes.push(P('أسئلة متكررة كتير.', 'Too many repeated questions.')); }
  if (c.fam === 'dispute') { if (k.disputeSettled) { com += 10; notes.push(P('الخناقة اتحلت بالكلام.', 'The dispute was settled by talking.')); } else { com -= 10; notes.push(P('الخناقة ماتحلتش.', 'The dispute was left unresolved.')); } }
  if (k.docsHave && !k.docsReturned && ['release', 'advice', 'warning', 'citation', 'refer_admin'].indexOf(d) >= 0) com -= 5;
  com = CP.clamp(com, 0, 100);
  const wait = (c.k.endT ?? s.t) - (c.k.markerT ?? c.spawnT);
  notes.push(P('الحقيقة: ' + CP.Cases.truthSummary(c).ar, 'What was true: ' + CP.Cases.truthSummary(c).en));
  return { dec, prop, com, wait, notes, sound: dec >= 60 };
};

/* waved-through evaluation: only obvious visible problems are counted */
CP.Cases.evaluateWaved = function (c) {
  const visible = c.cues.filter(x => ['steam', 'sweating', 'alcohol_smell', 'passenger_pale', 'shouting'].indexOf(x) >= 0);
  const notes = [];
  let dec = null;
  if (visible.length || (c.fam === 'lookout' && c.variant === 'B')) {
    dec = 30; notes.push(P('عدّت رغم علامات ظاهرة كانت تستاهل وقفة.', 'Waved through despite visible signs that warranted a stop.'));
  }
  notes.push(P('الحقيقة: ' + CP.Cases.truthSummary(c).ar, 'What was true: ' + CP.Cases.truthSummary(c).en));
  return { dec, prop: 100, com: null, wait: c.k.endT - (c.k.markerT ?? c.spawnT), notes, sound: dec == null, waved: true };
};

/* decisions: requirements for consequential actions */
CP.Cases.decisionReq = function (c, d, support) {
  const k = c.k;
  const notes = CP.notesFor(c).filter(n => support.indexOf(n.id) >= 0);
  if (['warning', 'citation', 'refer_admin'].indexOf(d) >= 0 && notes.length < 1) return 'res_needSupport';
  if (d === 'hold') {
    const ok = notes.some(n => (n.type === 'verification' && ['flagged', 'confirmed', 'outdated'].indexOf(n.result) >= 0) || n.type === 'screening' || n.type === 'evidence' || n.type === 'discrepancy');
    if (!ok) return 'res_needGrounds';
  }
  if (d === 'handover') {
    const ok = notes.some(n => (n.type === 'verification' && n.result === 'confirmed') || (n.type === 'screening' && n.result === 'confirmed') || (n.type === 'evidence' && n.result === 'confirmed'));
    if (!ok) return 'res_needConfirmed';
  }
  if (d === 'medical' && notes.length < 1 && !k.cuesRec.length && !k.statements.some(s => s.key === 'symptoms' || s.key === 'health')) return 'res_needSupport';
  return null;
};

/* closing a case — idempotent */
CP.Cases.close = function (c, decision, reason, support) {
  if (c.res) return false;
  if (!CP.once('close:' + c.id)) return false;
  const s = CP.G.shift;
  c.k.endT = s.t;
  c.res = { decision, reason, support: support.slice(), t: s.t, clock: CP.gameClock() };
  c.res.eval = CP.Cases.evaluate(c);
  c.status = 'closed';
  s.stats.checked++;
  CP.note(c, 'incident', CP.fill(['القرار: {d} — السبب: {r}', 'Decision: {d} — reason: {r}'], { d: [CP.STR.ar['res_' + decision], CP.STR.en['res_' + decision]], r: [CP.STR.ar['rr_' + reason] || reason, CP.STR.en['rr_' + reason] || reason] }), 'verified');
  // remember citizen for returning encounters
  const rec = { person: c.driver.p, portrait: c.driver.portrait, civ: c.driver.civ, pers: c.driver.pers, type: c.type, lastFam: c.fam, lastOutcome: decision, lastShift: s.no, lastLoc: s.loc, name: c.driver.name };
  const R = CP.G.career.returning; if (R.length > 14) R.shift(); R.push(rec);
  // later dispatcher updates (delivered in the report / next shift)
  if (['alert', 'lookout', 'screening', 'journey'].indexOf(c.fam) >= 0 && c.variant !== 'A' || (c.fam === 'alert')) {
    CP.G.career.updates.push({ shift: s.no, caseId: c.id, text: CP.Cases.laterUpdate(c, decision) });
  }
  CP.bus.emit('caseClosed', c);
  return true;
};
CP.Cases.laterUpdate = function (c, d) {
  const good = c.res.eval.sound;
  if (c.fam === 'alert' && c.variant === 'A') return P('تحديث: التنبيه على العربية ' + CP.plateStr(c.plate, 'ar') + ' اتشال من السيستم بعد الإحالة.', 'Update: the alert on ' + CP.plateStr(c.plate, 'en') + ' was cleared from the system' + (d === 'refer_admin' ? ' after your referral.' : '.'));
  if (c.fam === 'alert') return good ? P('تحديث: العربية اترجعت لصاحبها الأصلي بعد التسليم.', 'Update: the vehicle was returned to its registered owner after handover.') : P('تحديث: العربية اتضبطت بعدين في كمين تاني.', 'Update: the vehicle was stopped later at another checkpoint.');
  if (c.fam === 'lookout') return good ? P('تحديث: البضاعة اتعرفت إنها من المخزن المسروق.', 'Update: the goods were identified as the stolen depot stock.') : P('تحديث: الشحنة اتضبطت بعدين في مكان تاني.', 'Update: the cargo was intercepted later elsewhere.');
  if (c.fam === 'screening') return P('تحديث: نتيجة التأكيد اتسجلت في ملف القضية.', 'Update: the confirmation result was added to the case file.');
  return P('تحديث: الإحالة الإدارية اتقفلت.', 'Update: the administrative referral was closed.');
};
;(window.CP_FILES = window.CP_FILES || {})['05_cases'] = '1.9.0';
