/* Search: justified, zone-by-zone, timed. Items support examine / ask / identify / record / return / bag.
   Appearance never decides anything: identification results come from the case's seeded item variants. */
CP.addStrings({
  s_reasonSet: ['سبب التفتيش: {r}', 'Search reason: {r}'],
  s_zoneDone: ['تفتيش {z}: {n} غرض', 'Searched {z}: {n} item(s)'],
  s_needSearch: ['فتّش المنطقة الأول', 'Search this area first'],
  s_inBag: ['جوه الشنطة', 'inside the bag'],
  s_openBag: ['افتح الشنطة', 'Open the bag'],
  s_assist: ['الزميل بيساعد — التفتيش أسرع', 'Partner assisting — faster search'],
  i_owner: ['صاحبها', 'Owner'],
  i_ownerDriver: ['السواق', 'Driver'],
  i_ownerPax: ['راكب', 'Passenger'],
  i_idPending: ['محتاج تأكيد معمل — مش إدانة', 'Needs lab confirmation — not a finding'],
  ev_title: ['سجل الأحراز', 'Evidence log'],
  ev_status_unverified: ['غير متحقق', 'Unverified'],
  ev_status_confirmed: ['متأكد', 'Confirmed'],
  ev_status_lawful: ['مشروع', 'Lawful'],
  ev_status_lab: ['في انتظار المعمل', 'Awaiting lab'],
  ev_status_pending: ['في انتظار التأكيد', 'Pending confirmation']
});
CP.Insp = {};
const IC = CP.C;
CP.Insp.zones = c => IC.veh[c.type].zones;
CP.Insp.hasArt = c => !!IC.veh[c.type].interior;
CP.Insp.setReason = function (c, reason) {
  if (c.k.searchReason) return false;
  c.k.searchReason = reason;
  CP.note(c, 'incident', CP.fill([CP.STR.ar.s_reasonSet, CP.STR.en.s_reasonSet], { r: [CP.STR.ar['sr_' + reason], CP.STR.en['sr_' + reason]] }), 'verified', { searchReason: reason, valid: CP.Cases.searchReasonValid(c, reason) });
  CP.autosave(); return true;
};
CP.Insp.task = (c, zone) => CP.Tasks.find(t => t.type === 'search' && t.caseId === c.id && (!zone || t.data.zone === zone));
CP.Insp.searchZone = function (c, zone) {
  if (!c.k.searchReason) return 's_reasonPick';
  if (c.k.zones[zone] === 'done') return null;
  if (CP.Insp.task(c, zone)) return null;
  const v = CP.vehOfCase(c); const sp = CP.Act.spot(v);
  const r = CP.makeRng(c.seed + zone.length * 31);
  const dur = 8 + r() * 7;
  CP.Tasks.add({ type: 'search', owner: 'officer', caseId: c.id, dur, key: 'search:' + c.id + ':' + zone, data: { zone, x: sp.x, row: sp.row } });
  c.k.zones[zone] = 'searching';
  CP.Actors.poseHold('flashlight', 1.5);
  CP.Audio.door();
  return null;
};
CP.Tasks.on('search', t => {
  const c = CP.G.shift.cases[t.caseId]; if (!c) return;
  c.k.zones[t.data.zone] = 'done';
  const n = (c.inv.zones[t.data.zone] || []).length;
  CP.note(c, 'observation', CP.fill([CP.STR.ar.s_zoneDone, CP.STR.en.s_zoneDone], { z: [CP.STR.ar['z_' + t.data.zone], CP.STR.en['z_' + t.data.zone]], n: { ar: CP.arDigits(n), en: String(n) } }), 'verified');
  CP.bus.emit('searchDone', { c, zone: t.data.zone }); CP.autosave();
}, t => {
  const o = CP.G.shift.officer;
  const p = CP.Actors.partnerTask();
  t.rate = p && p.type === 'p_assist' && p.caseId === t.caseId && CP.Tasks.P.p_assist(p) ? 1.8 : 1;
  return !o.moving && Math.abs(o.x - t.data.x) < 1.9 && Math.abs((o.row || 0) - t.data.row) < 0.3;
});
/* items visible in a zone (closed bags hide what is inside until opened) */
const LOOSE = ['phone', 'wallet', 'water_bottle', 'snack', 'keys', 'notebook', 'duffel_closed'];
CP.Insp.items = function (c, zone) {
  if (c.k.zones[zone] !== 'done') return [];
  const ids = c.inv.zones[zone] || [];
  const its = ids.map(id => c.inv.items[id]);
  const bag = its.find(i => i.kind === 'duffel_closed');
  return its.map(i => Object.assign({}, i, { hidden: bag && !bag.st.opened && i !== bag && LOOSE.indexOf(i.kind) < 0 && zone !== 'cargo' })).filter(i => !i.hidden);
};
CP.Insp.sprite = it => it.kind === 'duffel_closed' && it.st.opened ? 'duffel_open' : it.kind;
CP.Insp.name = it => { const b = IC.items[it.kind]; return b ? CP.L(b.name) : it.kind; };
CP.Insp.desc = it => { const vr = it.variant && IC.itemVariants[it.variant]; return vr ? CP.L(vr.desc) : CP.L(IC.items[it.kind].desc); };
CP.Insp.open = function (c, id) { const it = c.inv.items[id]; if (!it || it.kind !== 'duffel_closed') return; it.st.opened = true; CP.Audio.zip(); CP.autosave(); };
CP.Insp.examine = function (c, id) {
  const it = c.inv.items[id]; if (!it) return;
  if (!it.st.examined) { it.st.examined = true; }
  return CP.Insp.desc(it);
};
const ANS = {
  duffel_clothes: ['دي هدومي، راجع من عند أهلي.', "Just my clothes — I'm coming back from family."],
  med_rx: ['ده دوايا للضغط، والروشتة في الشنطة.', "That's my blood-pressure medicine; the prescription is in the bag."],
  med_otc: ['مسكن عادي، بشتريه من الصيدلية.', 'Ordinary painkillers from the pharmacy.'],
  med_rx_noscript: ['ده دوايا، الروشتة في البيت.', 'My medicine — the prescription is at home.'],
  med_unlabelled: ['ده دوا حساسية، العلبة اترمت.', 'Allergy tablets; I threw the box away.'],
  paper_contract: ['ده عقد البيع، أنا لسه شاري العربية.', "That's the sale contract — I just bought the car."],
  paper_invoice: ['فواتير الطلبية، كل كرتونة ليها رقم.', 'The order invoices — every carton has a number.'],
  paper_blank: ['ورق التوصيل… الشركة بتبعته كده.', 'Delivery slips… the company sends them like that.'],
  paper_prescription: ['روشتة الدكتور.', "The doctor's prescription."],
  paper_receipts: ['إيصالات بنزين وكارتة.', 'Fuel and toll receipts.'],
  notebook_fares: ['حسابات الأجرة بتاعة النهارده.', "Today's fare tallies."],
  notebook_plain: ['مواعيدي ونمر تليفونات.', 'My appointments and numbers.']
};
const ANS_KIND = { phone: ['موبايلي.', 'My phone.'], wallet: ['محفظتي.', 'My wallet.'], keys: ['مفاتيح البيت.', 'House keys.'], water_bottle: ['مية.', 'Water.'], snack: ['أكل للطريق.', 'Food for the road.'], duffel_closed: ['هدوم.', 'Clothes.'] };
CP.Insp.ask = function (c, id) {
  const it = c.inv.items[id]; if (!it || it.st.asked) return;
  it.st.asked = true;
  let a = ANS[it.variant] || ANS_KIND[it.kind] || ['ده بتاعي.', "That's mine."];
  if (it.variant === 'med_bulk') a = c.variant === 'A' ? ['طلبية صيدلية، الفواتير في الصندوق.', "A pharmacy order — the invoices are in the back."] : ['دي بضاعة واحد صاحبي… أنا بس بوصلها.', "Goods for a friend… I'm only delivering them."];
  const txt = { ar: a[0], en: a[1] };
  CP.Dlg.say(c, it.owner === 'passenger' ? 'passenger' : 'driver', txt);
  CP.Dlg.statement(c, 'item_' + it.kind, txt, it.variant || it.kind, { passenger: it.owner === 'passenger' });
  CP.autosave();
  return txt;
};
CP.Insp.evStatus = function (c, it) {
  const vr = it.variant && IC.itemVariants[it.variant];
  if (!it.st.identified) return 'unverified';
  if (c.fam === 'lookout' && c.variant === 'B' && (it.variant === 'med_bulk' || it.variant === 'paper_blank')) return 'confirmed';
  if (vr && vr.lawful === false) return 'confirmed';
  if (vr && vr.lawful === null) return 'lab';
  return 'lawful';
};
CP.Insp.identify = function (c, id) {
  const it = c.inv.items[id]; if (!it || it.st.identified) return;
  if (CP.Tasks.find(t => t.type === 'identify' && t.data.id === id)) return;
  const v = CP.vehOfCase(c); const sp = CP.Act.spot(v);
  CP.Tasks.add({ type: 'identify', owner: 'officer', caseId: c.id, dur: 4.5, key: 'id:' + id, data: { id, x: sp.x, row: sp.row } });
};
CP.Tasks.on('identify', t => {
  const c = CP.G.shift.cases[t.caseId]; if (!c) return; const it = c.inv.items[t.data.id]; if (!it) return;
  it.st.identified = true;
  const vr = it.variant && IC.itemVariants[it.variant];
  const txt = vr ? { ar: vr.id[0], en: vr.id[1] } : { ar: 'غرض شخصي عادي.', en: 'An ordinary personal item.' };
  let st = CP.Insp.evStatus(c, it);
  if (st === 'confirmed' && c.fam === 'lookout') {
    txt.ar += ' أرقام التشغيلة مطابقة لبلاغ المخزن.'; txt.en += ' Batch numbers match the depot report.';
  }
  CP.note(c, 'item', { ar: CP.Insp.nameL(it, 'ar') + ': ' + txt.ar, en: CP.Insp.nameL(it, 'en') + ': ' + txt.en }, st === 'lab' ? 'pending' : 'verified', { itemId: it.id, result: st });
  // an item already bagged gets its evidence status updated in the chain
  const ev = CP.G.shift.evidence.find(e => e.itemId === it.id); if (ev) { ev.status = st; ev.hist.push({ t: CP.G.shift.t, st }); if (st === 'confirmed') CP.note(c, 'evidence', { ar: 'حرز ' + ev.id + ' اتأكد', en: 'Evidence ' + ev.id + ' confirmed' }, 'verified', { result: 'confirmed', evId: ev.id }); }
  CP.autosave();
}, t => { const o = CP.G.shift.officer; return !o.moving && Math.abs(o.x - t.data.x) < 1.9; });
CP.Insp.nameL = (it, lang) => { const b = IC.items[it.kind]; return b ? (lang === 'ar' ? b.name[0] : b.name[1]) : it.kind; };
CP.Insp.record = function (c, id) {
  const it = c.inv.items[id]; if (!it || it.st.recorded) return;
  it.st.recorded = true;
  const vr = it.variant && IC.itemVariants[it.variant];
  const d = vr ? vr.desc : IC.items[it.kind].desc;
  CP.note(c, 'item', { ar: CP.Insp.nameL(it, 'ar') + ' (' + CP.STR.ar['z_' + it.zone] + '): ' + d[0], en: CP.Insp.nameL(it, 'en') + ' (' + CP.STR.en['z_' + it.zone] + '): ' + d[1] }, 'verified', { itemId: it.id });
  CP.autosave();
};
CP.Insp.ret = function (c, id) { const it = c.inv.items[id]; if (!it || it.st.bagged) return; it.st.returned = true; CP.autosave(); };
CP.Insp.canBag = function (c) { const e = CP.G.shift.equipment; if (e.bags < 1) return 'i_needGloves'; if (!c.k.gloved && e.gloves < 1) return 'i_needGloves'; return null; };
CP.Insp.bag = function (c, id) {
  const it = c.inv.items[id]; if (!it || it.st.bagged) return null;
  const err = CP.Insp.canBag(c); if (err) return err;
  if (!CP.once('bag:' + id)) return null;
  const s = CP.G.shift, e = s.equipment;
  if (!c.k.gloved) { e.gloves--; c.k.gloved = true; }
  e.bags--;
  it.st.bagged = true; it.st.returned = false;
  const st = CP.Insp.evStatus(c, it);
  const ev = { id: 'E' + s.no + '-' + (s.nextEv++), caseId: c.id, itemId: it.id, kind: it.kind, variant: it.variant, zone: it.zone, t: s.t, clock: CP.gameClock(), status: st, hist: [{ t: s.t, st }] };
  s.evidence.push(ev);
  CP.note(c, 'evidence', { ar: 'حرز ' + ev.id + ': ' + CP.Insp.nameL(it, 'ar') + ' — ' + CP.STR.ar['z_' + it.zone], en: 'Evidence ' + ev.id + ': ' + CP.Insp.nameL(it, 'en') + ' — ' + CP.STR.en['z_' + it.zone] }, st === 'confirmed' ? 'verified' : 'unverified', { result: st, evId: ev.id });
  CP.Audio.paper(); CP.autosave();
  return null;
};
;(window.CP_FILES = window.CP_FILES || {})['12_inspection'] = '2.2.5';
