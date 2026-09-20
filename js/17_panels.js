/* Panel contents. Each builder gets (body, foot, case). State that is only UI (selections) lives on CP.UI. */
CP.addStrings({
  d_driver: ['السواق', 'Driver'], d_mood: ['الصبر', 'Patience'], d_coop: ['التعاون', 'Cooperation'],
  d_name_unknown: ['الاسم هيبان من الرخصة', 'Name shown once you read the licence'],
  doc_sel: ['مختار: {n}', 'Selected: {n}'], doc_list: ['المخالفات المسجلة', 'Recorded violations'], doc_hint: ['اختار خانتين تتقارنوا (أو تاريخ واحد)، وبعدين سجّل سبب المخالفة.', 'Select two fields to compare (or one date), then record.'],
  rv_state_none: ['لسه', 'Not run'], rv_log: ['سجل اللاسلكي', 'Radio log'], rv_byPartner: ['خلي الزميل يستعلم', 'Let partner run it'],
  s_grounds: ['الأسباب المسجلة لحد دلوقتي', 'Grounds recorded so far'], s_equipment: ['العهدة', 'Equipment'], s_assistBtn: ['الزميل يساعد في التفتيش', 'Partner assists search'],
  g_disc: ['تعارض في الأوراق', 'Document discrepancy'], g_alert: ['سجل عليه ملاحظة', 'Flagged record'], g_statement: ['أقوال متعارضة', 'Contradicting statements'], g_consent: ['موافقة السواق', 'Driver consent'], g_obs: ['ملاحظة مباشرة', 'Direct observation'],
  nb_evidence_log: ['سجل الأحراز', 'Evidence log'], nb_filter: ['عرض', 'Show'], nb_case: ['الحالة', 'Case'],
  res_open_none: ['مفيش أسئلة مفتوحة', 'No open questions'], res_pick: ['اختار قرار', 'Choose a decision'], res_confirmBtn: ['سجّل القرار ورجّع الأوراق', 'Record decision & return documents'],
  res_support_hint: ['علّم الملاحظات اللي بتسند القرار', 'Tick the notes that support the decision'], res_unsearched: ['لسه ماتفتشتش', 'Not searched'],
  res_scrPending: ['كشف لسه مستني تأكيد', 'A screening result is still pending'],
  pt_current: ['المهمة الحالية', 'Current task'], pt_none: ['الزميل فاضي في مكانه', 'Partner is at post'], pt_recall: ['ارجع لمكانك', 'Return to post'], pt_needCase: ['اختار حالة الأول', 'Select a case first'], pt_notNeeded: ['مش مطلوبة دلوقتي', 'Not needed right now'],
  rec_seen: ['ملاحظات شايفها', 'What you can observe'], rec_done: ['اتسجلت', 'Recorded'], rec_torchHint: ['الإضاءة ضعيفة — الكشاف بيوضح اللي جوه الكابينة', 'Lighting is poor — the flashlight shows the cabin'],
  vis_q: ['الزائر بيسأل', 'The visitor asks']
});
CP.Panels = {};
const hh = CP.h;
const noteTag = n => ({ statement: 'info', observation: 'ok', discrepancy: 'warn', verification: 'am', evidence: 'bad', screening: 'warn', incident: '', item: 'info' }[n.type] || '');
CP.UI.noteEl = function (n, sel, onToggle) {
  const st = n.result ? CP.t('rv_' + n.result) !== 'rv_' + n.result ? CP.t('rv_' + n.result) : n.result : CP.t('nb_' + n.status);
  const body = hh('div', { class: 'note' + (sel ? ' sel' : '') },
    hh('div', { class: 'h' }, hh('span', { class: 'tag ' + noteTag(n) }, CP.t('nb_' + n.type)), hh('span', { class: 'small muted' }, CP.num(n.clock)), hh('span', { class: 'tag' }, st)),
    hh('div', null, CP.L(n.text)));
  if (!onToggle) return body;
  const cb = hh('input', { type: 'checkbox', onchange: e => onToggle(n.id, e.target.checked) }); cb.checked = !!sel;
  return hh('label', { class: 'chk' }, cb, body);
};
const taskMeter = (t, fmt) => hh('div', { class: 'meter', 'data-task': t.id, 'data-fmt': fmt || 'working' }, hh('span', { class: 'tt' }, CP.t(fmt || 'working', { s: CP.num(Math.ceil(CP.Tasks.remaining(t))) })), hh('div', { class: 'bar' }, hh('i', { style: 'width:' + (CP.Tasks.progress(t) * 100) + '%' })));
const quick = (foot, list) => { for (const id of list) { const a = CP.Act.avail(id); foot.appendChild(hh('button', { class: 'btn sm', 'aria-disabled': a.ok ? 'false' : 'true', title: a.ok ? '' : a.reason, onclick: () => { CP.UI.close(); CP.Act.run(id); } }, CP.icon(id), CP.t('a_' + id))); } };

/* ---------------- dialogue ---------------- */
CP.Panels.dialogue = function (body, foot, c) {
  const k = c.k;
  const who = hh('div', { class: 'who' }, CP.A.portrait(c.driver.portrait, 140),
    hh('div', null, hh('b', null, k.docsViewed ? CP.L(c.driver.name) : CP.L(CP.Gender.driverWord(c))), hh('div', { class: 'small muted' }, CP.L(CP.Gender.pers(c, c.driver.pers)))),
    hh('div', { class: 'meter' }, hh('span', null, CP.t('d_mood')), hh('div', { class: 'bar' }, hh('i', { style: `width:${c.patience}%;background:${c.patience < 30 ? 'var(--bad)' : 'var(--amber)'}` }))),
    hh('div', { class: 'meter' }, hh('span', null, CP.t('d_coop')), hh('div', { class: 'bar' }, hh('i', { style: `width:${c.coop}%;background:var(--info)` }))));
  const log = hh('div', { class: 'log scroll', 'data-stick': 'bottom', 'aria-live': 'polite' });
  if (!c.dlg.log.length) log.appendChild(hh('div', { class: 'muted small' }, CP.t('a_talk_s')));
  for (const l of c.dlg.log) log.appendChild(hh('div', { class: 'ln ' + l.who }, hh('span', { class: 'w' }, l.who === 'officer' ? CP.t('d_you') : l.who === 'passenger' ? CP.t('d_passenger') : CP.L(CP.Gender.driverWord(c))), CP.L(l.text)));
  const tone = hh('div', { class: 'seg', role: 'radiogroup', 'aria-label': CP.t('tone') }, ...['calm', 'direct', 'firm'].map(t => hh('button', { class: CP.Act.tone === t ? 'on' : '', role: 'radio', 'aria-checked': CP.Act.tone === t ? 'true' : 'false', onclick: () => { CP.Act.tone = t; CP.UI.renderPanel(); } }, CP.t('tone_' + t))));
  const opts = hh('div', { class: 'opts' });
  const intents = CP.Dlg.intents(c);
  intents.forEach((id, i) => opts.appendChild(hh('button', { class: 'btn', onclick: () => { CP.Dlg.ask(c, id, CP.Act.tone); if (id === 'close') CP.UI.close(); else if (id === 'greet_docs') CP.UI.renderPanel(); } }, hh('span', { class: 'n' }, CP.num(i + 1)), CP.L(CP.Gender.label(c, id)))));
  if (!intents.length) opts.appendChild(hh('div', { class: 'muted' }, CP.t('d_noOptions')));
  const center = hh('div', { class: 'col', style: 'min-height:0' }, log, hh('div', { class: 'row' }, hh('span', { class: 'lbl' }, CP.t('tone')), tone), opts);
  const notes = hh('div', { class: 'notes scroll' }); const ns = CP.notesFor(c).slice(-10).reverse();
  if (!ns.length) notes.appendChild(hh('div', { class: 'muted small' }, CP.t('nb_empty')));
  for (const n of ns) notes.appendChild(CP.UI.noteEl(n));
  body.appendChild(hh('div', { class: 'dlg' }, who, center, hh('div', { class: 'side col' }, hh('div', { class: 'lbl' }, CP.t('d_driverNotes')), notes)));
  quick(foot, ['docs', 'radio', 'record', 'bay', 'resolve']);
};

/* ---------------- documents ---------------- */
CP.UI.docSel = []; CP.UI.docCase = null; CP.UI.docZoom = null;
CP.Panels.docs = function (body, foot, c) {
  if (CP.UI.docCase !== c.id) { CP.UI.docSel = []; CP.UI.docCase = c.id; CP.UI.docZoom = null; }
  const s = CP.G.shift, D = c.docs, V = CP.C.veh[c.type];
  if (!c.k.docsHave) { body.appendChild(hh('div', { class: 'notice' }, CP.t('r_needDocs'))); quick(foot, ['talk']); return; }
  const assist = CP.S.assist || CP.UI.docAssist;
  const flagged = new Set(); if (assist) CP.Cases.trueDiscrepancies(c).forEach(d => d.f.forEach(f => flagged.add(f)));
  const sel = CP.UI.docSel;
  const toggle = f => { const i = sel.indexOf(f); if (i >= 0) sel.splice(i, 1); else { sel.push(f); if (sel.length > 2) sel.shift(); } CP.UI.renderPanel(); };
  const fld = (f, key, val) => hh('button', { class: 'fld' + (sel.indexOf(f) >= 0 ? ' sel' : '') + (flagged.has(f) ? ' assist' : ''), 'aria-pressed': sel.indexOf(f) >= 0 ? 'true' : 'false', onclick: () => toggle(f) }, hh('span', { class: 'k' }, CP.t(key)), hh('span', { class: 'v' }, val));
  const photo = (f, n) => { const ph = hh('div', { class: 'ph' }); ph.appendChild(CP.A.portrait(n, 110)); ph.appendChild(hh('button', { class: 'fld photo' + (sel.indexOf(f) >= 0 ? ' sel' : '') + (flagged.has(f) ? ' assist' : ''), 'aria-label': CP.t('f_photo'), onclick: () => toggle(f) })); return ph; };
  const card = (id, surf, title, fields, ph, cls) => {
    const el = hh('div', { class: 'doc ' + (cls || '') + (CP.UI.docZoom === id ? ' zoom' : '') + (ph ? '' : ' nophoto') });
    if (surf) { const cv = CP.A.thumb(surf, 628, 388, 0); el.appendChild(cv); }
    el.appendChild(hh('div', { class: 'ttl' }, hh('span', null, CP.t(title)), hh('button', { class: 'btn sm ghost', style: 'min-height:28px;padding:0 8px;font-size:.8em', onclick: () => { CP.UI.docZoom = CP.UI.docZoom === id ? null : id; CP.UI.renderPanel(); } }, CP.UI.docZoom === id ? '−' : CP.t('doc_zoom'))));
    if (ph) el.appendChild(ph);
    el.appendChild(hh('div', { class: 'fl' }, ...fields));
    if (surf) el.appendChild(hh('div', { class: 'foot' }, CP.t('doc_fict')));
    return el;
  };
  const lic = card('lic', 'driver_licence_surface', 'doc_licence', [fld('lic.name', 'f_name', CP.L(D.licence.name)), fld('lic.dob', 'f_dob', CP.fmtDate(D.licence.dob)), fld('lic.no', 'f_licNo', D.licence.no), fld('lic.cls', 'f_class', CP.t('lic_' + D.licence.cls)), fld('lic.exp', 'f_expiry', CP.fmtDate(D.licence.exp))], photo('lic.photo', D.licence.photo));
  const reg = card('reg', 'vehicle_licence_surface', 'doc_reg', [fld('reg.plate', 'f_plate', CP.plateStr(D.reg.plate)), fld('reg.make', 'f_make', CP.L(D.reg.make)), fld('reg.colour', 'f_colour', CP.L(D.reg.colour)), fld('reg.cls', 'f_vclass', CP.t('cls_' + D.reg.cls)), fld('reg.owner', 'f_owner', CP.L(D.reg.owner)), fld('reg.exp', 'f_expiry', CP.fmtDate(D.reg.exp))], null);
  const idc = card('id', 'id_surface', 'doc_id', [fld('id.name', 'f_name', CP.L(D.id.name)), fld('id.dob', 'f_dob', CP.fmtDate(D.id.dob)), fld('id.no', 'f_idNo', D.id.no), fld('id.addr', 'f_address', CP.L(D.id.addr)), fld('id.exp', 'f_expiry', CP.fmtDate(D.id.exp))], photo('id.photo', D.id.photo));
  const obs = card('obs', null, 'doc_observed', [fld('obs.plate', 'f_plate', CP.plateStr(c.plate)), fld('obs.make', 'f_make', CP.L(V.make)), fld('obs.colour', 'f_colour', CP.L(V.colour)), fld('obs.cls', 'f_type', CP.t('cls_' + V.cls))], photo('obs.face', c.driver.portrait), 'obs');
  const top = hh('div', { class: 'cmpbar' }, hh('span', { class: 'tag am' }, CP.t('doc_today', { d: CP.fmtDate(s.date) })), hh('span', { class: 'small muted' }, sel.length ? CP.t('doc_sel', { n: sel.map(f => f).length === 0 ? '' : CP.num(sel.length) }) : CP.t('doc_hint')),
    hh('button', { class: 'btn pri sm', 'aria-disabled': sel.length ? 'false' : 'true', onclick: () => {
      if (!sel.length) { CP.UI.toast(CP.t('doc_select'), 'warn'); return; }
      const r = CP.Cases.recordDiscrepancy(c, sel.slice());
      if (!r.ok) CP.UI.toast(CP.t(r.msg), 'warn'); else { CP.UI.toast(CP.t('doc_recorded', { x: r.text }), 'ok'); CP.UI.docSel = []; CP.Audio.paper(); }
      CP.UI.renderPanel();
    } }, CP.t('doc_record')),
    hh('label', { class: 'chk small' }, (() => { const i = hh('input', { type: 'checkbox', onchange: e => { CP.UI.docAssist = e.target.checked; CP.UI.renderPanel(); } }); i.checked = assist; if (CP.S.assist) i.disabled = true; return i; })(), CP.t('doc_assist')));
  const grid = hh('div', { class: 'docs' }, lic, reg, idc, obs);
  const disc = CP.notesFor(c).filter(n => n.type === 'discrepancy');
  const dl = hh('div', { class: 'col' }, hh('div', { class: 'lbl' }, CP.t('doc_list')), ...(disc.length ? disc.map(n => CP.UI.noteEl(n)) : [hh('div', { class: 'muted small' }, CP.t('res_none'))]));
  body.append(top, hh('div', { style: 'height:10px' }), grid, hh('div', { style: 'height:10px' }), dl);
  quick(foot, ['talk', 'radio', 'resolve']);
};

/* ---------------- radio ---------------- */
CP.Panels.radio = function (body, foot, c) {
  const s = CP.G.shift; const vv = c.k.verif;
  const row = (kind) => {
    const t = CP.Tasks.find(x => x.type === 'radio' && x.caseId === c.id && x.data.kind === kind);
    const last = vv[kind][vv[kind].length - 1];
    const b = hh('button', { class: 'btn', 'aria-disabled': t ? 'true' : 'false', onclick: () => {
      if (t) return; const e = CP.Cases.radioQuery(c, kind, false);
      if (e) CP.UI.toast(CP.t(e), 'warn'); else { CP.Actors.poseHold('radio', 2.5); CP.UI.toast(CP.t('rv_sent')); }
      CP.UI.renderPanel();
    } }, CP.icon('radio'), CP.t('rv_' + kind));
    const pb = CP.Actors.partnerCan('verify') || CP.tier() < 5 ? null : hh('button', { class: 'btn sm ghost', 'aria-disabled': t || CP.Actors.partnerTask() ? 'true' : 'false', onclick: () => { if (t) return; const e = CP.Actors.assign('verify', { caseId: c.id, q: kind, x: CP.G.shift.partner.x, row: CP.G.shift.partner.row || 0, pose: 'radio' }); if (e) CP.UI.toast(CP.t(e, { task: '' }), 'warn'); CP.UI.renderPanel(); } }, CP.t('rv_byPartner'));
    return hh('div', { class: 'card row' }, b, pb, t ? taskMeter(t, 'rv_sent') : hh('span', { class: 'tag ' + (last ? (last.st === 'clear' || last.st === 'notConfirmed' ? 'ok' : last.st === 'unresolved' ? 'warn' : 'bad') : '') }, last ? CP.t('rv_' + last.st) : CP.t('rv_state_none')));
  };
  const vn = CP.notesFor(c).filter(n => n.type === 'verification').reverse();
  const glog = hh('div', { class: 'notes scroll', style: 'max-height:30vh' }, ...s.radio.slice(-14).reverse().map(r => hh('div', { class: 'note' }, hh('span', { class: 'small muted' }, CP.num(CP.fmtTime(r.t)) + ' '), CP.L(r.text))));
  body.appendChild(hh('div', { class: 'grid2' }, hh('div', { class: 'col' }, row('vehicle'), row('person'), row('confirm'), s.events.radioDelayUntil > s.t ? hh('div', { class: 'notice' }, CP.t('ev_radioDelay')) : null, ...vn.map(n => CP.UI.noteEl(n))), hh('div', { class: 'col' }, hh('div', { class: 'lbl' }, CP.t('rv_log')), glog)));
  quick(foot, ['talk', 'docs', 'resolve']);
};

/* ---------------- search ---------------- */
CP.UI.srZone = null; CP.UI.srItem = null;
CP.Panels.search = function (body, foot, c) {
  const k = c.k, s = CP.G.shift; const zones = CP.Insp.zones(c);
  const g = CP.Cases.grounds(c);
  const gl = [g.discrepancy && 'g_disc', g.alert && 'g_alert', g.statement && 'g_statement', g.consent && 'g_consent', g.observation && 'g_obs'].filter(Boolean);
  const reasons = ['discrepancy', 'alert', 'statement', 'consent', 'observation', 'routine'];
  const rbox = hh('div', { class: 'card col' }, hh('div', { class: 'lbl' }, CP.t('s_reason')),
    k.searchReason ? hh('div', null, hh('span', { class: 'tag am' }, CP.t('sr_' + k.searchReason))) : hh('div', { class: 'row' }, ...reasons.map(r => hh('button', { class: 'btn sm', onclick: () => { CP.Insp.setReason(c, r); CP.UI.renderPanel(); } }, CP.t('sr_' + r)))),
    hh('div', { class: 'small muted' }, CP.t('s_grounds') + ': ' + (gl.length ? gl.map(x => CP.t(x)).join(' • ') : CP.t('res_none'))));
  // vehicle view with hotspots / zone buttons
  const view = hh('div', { class: 'col' });
  const zoneBtn = (z, cls, style) => {
    const t = CP.Insp.task(c, z); const st = k.zones[z];
    return hh('button', { class: (cls || 'btn sm') + (st === 'done' ? ' done' : '') + (t ? ' run' : '') + (CP.UI.srZone === z ? ' on' : ''), style, onclick: () => {
      CP.UI.srZone = z; CP.UI.srItem = null;
      if (st !== 'done' && !t) { const e = CP.Insp.searchZone(c, z); if (e) CP.UI.toast(CP.t(e), 'warn'); }
      CP.UI.renderPanel();
    } }, CP.t('z_' + z) + (st === 'done' ? ' ✓' : ''));
  };
  if (CP.Insp.hasArt(c)) {
    const box = hh('div', { class: 'cut' }); box.appendChild(CP.A.thumb(k.zones.seats === 'done' || k.zones.luggage === 'done' || k.zones.floor === 'done' ? 'microbus_cutaway' : 'microbus_open', 735, 343, 0));
    const hs = (CP.A.M.inspectionHotspots.microbus_cutaway || []).concat([{ id: 'storage', x: 0.07, y: 0.4 }]);
    for (const p of hs) if (zones.indexOf(p.id) >= 0) box.appendChild(zoneBtn(p.id, 'hs', `left:${p.x * 100}%;top:${p.y * 100}%`));
    view.appendChild(box);
  } else {
    const cv = CP.A.vehicleThumb(c.type, 520, 170); cv.style.width = '100%'; cv.style.height = 'auto';
    view.append(cv, hh('div', { class: 'notice' }, CP.t('s_noArt')), hh('div', { class: 'zones' }, ...zones.map(z => zoneBtn(z))));
  }
  const running = CP.Tasks.all(t => t.type === 'search' && t.caseId === c.id);
  for (const t of running) view.appendChild(hh('div', { class: 'card' }, hh('b', null, CP.t('z_' + t.data.zone)), taskMeter(t, 's_searching')));
  const pt = CP.Actors.partnerTask();
  if (!CP.Actors.partnerCan('assist') && CP.tier() >= 5) view.appendChild(pt && pt.type === 'p_assist' && pt.caseId === c.id ? hh('div', { class: 'tag ok' }, CP.t('s_assist')) : hh('button', { class: 'btn sm ghost', onclick: () => { const v = CP.vehOfCase(c); const sp = CP.Act.spot(v); const e = CP.Actors.assign('assist', { caseId: c.id, x: sp.x - 1.3, row: sp.row, pose: 'flashlight', faceX: sp.x }); if (e) CP.UI.toast(CP.t(e, { task: pt ? CP.t('pt_' + pt.data.kind) : '' }), 'warn'); CP.UI.renderPanel(); } }, CP.icon('partner'), CP.t('s_assistBtn')));
  // items
  const right = hh('div', { class: 'col' });
  const z = CP.UI.srZone;
  if (z) {
    right.appendChild(hh('div', { class: 'lbl' }, CP.t('z_' + z) + ' — ' + CP.t('s_items')));
    if (k.zones[z] !== 'done') right.appendChild(hh('div', { class: 'muted small' }, CP.Insp.task(c, z) ? '…' : CP.t('s_needSearch')));
    else {
      const its = CP.Insp.items(c, z);
      if (!its.length) right.appendChild(hh('div', { class: 'muted' }, CP.t('s_empty')));
      const grid = hh('div', { class: 'items' });
      for (const it of its) { const el = hh('button', { class: 'item' + (CP.UI.srItem === it.id ? ' on' : '') + (it.st.bagged ? ' bagged' : ''), onclick: () => { CP.UI.srItem = it.id; CP.UI.renderPanel(); } }, CP.A.thumb(CP.Insp.sprite(it), 64, 56), CP.Insp.name(it), it.st.bagged ? hh('span', { class: 'tag info' }, CP.t('i_bagged')) : it.st.returned ? hh('span', { class: 'tag' }, CP.t('i_returned')) : null); grid.appendChild(el); }
      right.appendChild(grid);
      const it = CP.UI.srItem && c.inv.items[CP.UI.srItem];
      if (it && it.zone === z) {
        const idT = CP.Tasks.find(t => t.type === 'identify' && t.data.id === it.id);
        const vr = it.variant && CP.C.itemVariants[it.variant];
        const d = hh('div', { class: 'card col' }, hh('b', null, CP.Insp.name(it)), hh('div', { class: 'small muted' }, CP.t('i_owner') + ': ' + CP.t(it.owner === 'passenger' ? 'i_ownerPax' : 'i_ownerDriver')),
          it.st.examined ? hh('div', null, CP.Insp.desc(it)) : null,
          it.st.identified ? hh('div', { class: 'notice' + (CP.Insp.evStatus(c, it) === 'confirmed' ? ' bad' : '') }, vr ? CP.L(vr.id) : CP.L({ ar: 'غرض شخصي عادي.', en: 'An ordinary personal item.' }), vr && vr.lawful === null ? ' — ' + CP.t('i_idPending') : '') : null,
          idT ? taskMeter(idT, 'i_identifying') : null,
          hh('div', { class: 'row' },
            it.kind === 'duffel_closed' && !it.st.opened ? hh('button', { class: 'btn sm', onclick: () => { CP.Insp.open(c, it.id); CP.UI.renderPanel(); } }, CP.t('s_openBag')) : null,
            hh('button', { class: 'btn sm', onclick: () => { CP.Insp.examine(c, it.id); CP.UI.renderPanel(); } }, CP.t('i_examine')),
            hh('button', { class: 'btn sm', 'aria-disabled': it.st.asked ? 'true' : 'false', onclick: () => { const r = CP.Insp.ask(c, it.id); if (r) CP.UI.toast(CP.L(r)); CP.UI.renderPanel(); } }, CP.t('i_ask')),
            hh('button', { class: 'btn sm', 'aria-disabled': it.st.identified || idT ? 'true' : 'false', onclick: () => { CP.Insp.identify(c, it.id); CP.UI.renderPanel(); } }, CP.t('i_identify')),
            hh('button', { class: 'btn sm', 'aria-disabled': it.st.recorded ? 'true' : 'false', onclick: () => { CP.Insp.record(c, it.id); CP.UI.renderPanel(); } }, CP.t('i_record')),
            hh('button', { class: 'btn sm', 'aria-disabled': it.st.bagged || it.st.returned ? 'true' : 'false', onclick: () => { CP.Insp.ret(c, it.id); CP.UI.renderPanel(); } }, CP.t('i_return')),
            hh('button', { class: 'btn sm bad', 'aria-disabled': it.st.bagged ? 'true' : 'false', title: CP.t('i_needGloves'), onclick: () => { const e = CP.Insp.bag(c, it.id); if (e) CP.UI.toast(CP.t(e), 'warn'); CP.UI.renderPanel(); } }, CP.A.thumb('evidence_bag', 20, 22, 0), CP.t('i_bag'))));
        right.appendChild(d);
      }
    }
  } else right.appendChild(hh('div', { class: 'muted' }, k.searchReason ? CP.t('s_select') : CP.t('s_reasonPick')));
  const e = s.equipment;
  right.appendChild(hh('div', { class: 'small muted' }, CP.t('s_equipment') + ': ' + CP.t('sc_supplies', { m: CP.num(e.mouth), k: CP.num(e.kits), g: CP.num(e.gloves), b: CP.num(e.bags) })));
  body.append(rbox, hh('div', { style: 'height:10px' }), hh('div', { class: 'srch' }, view, right));
  quick(foot, ['talk', 'screen', 'resolve']);
};

/* ---------------- screening ---------------- */
CP.UI.scrTab = 'breath';
CP.Panels.screen = function (body, foot, c) {
  const kind = CP.UI.scrTab; const S = c.k.scr[kind]; const e = CP.G.shift.equipment;
  const g = CP.Cases.grounds(c);
  const tabs = hh('div', { class: 'seg' }, ...['breath', 'drug'].map(t => hh('button', { class: kind === t ? 'on' : '', onclick: () => { CP.UI.scrTab = t; CP.UI.renderPanel(); } }, CP.t(t === 'breath' ? 'sc_breath' : 'sc_drug'))));
  const art = hh('div', { class: 'col', style: 'align-items:center' }, CP.A.thumb(kind === 'breath' ? 'breath_device' : 'screening_kit', 150, 170), kind === 'drug' ? hh('div', { class: 'row' }, CP.A.thumb('gloves', 56, 56), CP.A.thumb('sample_tube', 30, 60)) : null,
    hh('div', { class: 'small muted', style: 'text-align:center' }, CP.t('sc_supplies', { m: CP.num(e.mouth), k: CP.num(e.kits), g: CP.num(e.gloves), b: CP.num(e.bags) })));
  const task = CP.Scr.task(c, kind);
  const step = (n, label, done, cur, ...kids) => hh('div', { class: 'step' + (done ? ' done' : '') + (cur ? ' cur' : '') }, hh('span', { class: 'n' }, (done ? '✓ ' : '') + CP.t(n)), hh('span', { class: 'small muted' }, label || ''), ...kids);
  const readyDone = kind === 'breath' ? ['fitted', 'processing', 'refer', 'pending', 'done'].indexOf(S.st) >= 0 || S.attempts.length > 0 : ['fitted', 'processing', 'refer', 'pending', 'done'].indexOf(S.st) >= 0 || S.attempts.length > 0;
  const steps = hh('div', { class: 'steps' });
  steps.appendChild(step('sc_step_explain', S.explained ? CP.t('sc_explained') : '', S.explained, !S.explained, S.explained ? null : hh('button', { class: 'btn sm', onclick: () => { CP.Scr.explain(c, kind); CP.UI.renderPanel(); } }, CP.t('sc_explain'))));
  let readyBtn;
  if (S.st === 'unavail') readyBtn = hh('span', { class: 'result unavail' }, CP.t('sc_res_unavail'));
  else if (kind === 'breath') readyBtn = S.st === 'checking' && task ? taskMeter(task, 'sc_checking') : !S.checked ? hh('button', { class: 'btn sm', onclick: () => { const r = CP.Scr.ready(c, kind); if (r) CP.UI.toast(CP.t(r), 'warn'); CP.UI.renderPanel(); } }, CP.t('sc_selfcheck')) : S.st === 'needMouth' ? hh('button', { class: 'btn sm', onclick: () => { const r = CP.Scr.ready(c, kind); if (r) CP.UI.toast(CP.t(r), 'warn'); CP.UI.renderPanel(); } }, CP.t('sc_mouth')) : hh('span', { class: 'tag ok' }, CP.t('sc_ready'));
  else readyBtn = S.st === 'idle' || S.st === 'needKit' ? hh('button', { class: 'btn sm', onclick: () => { const r = CP.Scr.ready(c, kind); if (r) CP.UI.toast(CP.t(r), 'warn'); CP.UI.renderPanel(); } }, CP.t(c.k.gloved ? 'sc_step_ready' : 'sc_gloves')) : hh('span', { class: 'tag ok' }, CP.t('sc_kitReady'));
  steps.appendChild(step('sc_step_ready', '', readyDone && S.st !== 'needMouth' && S.st !== 'needKit', !readyDone || S.st === 'needMouth' || S.st === 'needKit', readyBtn));
  // hold-to-sample
  const hold = hh('button', { class: 'btn pri hold', 'aria-disabled': S.st === 'fitted' ? 'false' : 'true' }, hh('i'), hh('span', null, CP.t(kind === 'breath' ? 'sc_sample' : 'sc_swab')));
  let t0 = 0, raf = 0;
  const need = kind === 'breath' ? 2.4 : 2.0;
  const start = ev => { if (S.st !== 'fitted') { CP.UI.toast(CP.t('r_notInBayOrMarker') === '' ? '' : CP.t('sc_step_ready'), 'warn'); return; } ev.preventDefault(); CP.UI.holding = true; t0 = performance.now(); const bar = hold.querySelector('i'); const loop = () => { const d = (performance.now() - t0) / 1000; bar.style.width = Math.min(100, d / need * 100) + '%'; raf = requestAnimationFrame(loop); }; loop(); CP.Audio.tone('sine', 220, 0.3, 0.02); };
  const end = () => { if (!CP.UI.holding) return; cancelAnimationFrame(raf); CP.UI.holding = false; const d = (performance.now() - t0) / 1000; const r = CP.Scr.sample(c, kind, d); if (r === 'short') CP.UI.toast(CP.t('sc_tooShort'), 'warn'); CP.UI.renderPanel(); };
  hold.addEventListener('pointerdown', start); hold.addEventListener('pointerup', end); hold.addEventListener('pointerleave', end); hold.addEventListener('pointercancel', end);
  hold.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && !CP.UI.holding && !ev.repeat) start(ev); });
  hold.addEventListener('keyup', ev => { if (ev.key === 'Enter' || ev.key === ' ') end(); });
  steps.appendChild(step('sc_step_sample', S.st === 'fitted' ? CP.t('sc_holdHint') : '', S.attempts.length > 0 && S.st !== 'fitted', S.st === 'fitted', hold, S.st === 'processing' && task ? taskMeter(task, 'sc_processing') : null));
  // result
  const resKey = S.result === 'pending' ? 'pending' : S.result;
  const resLbl = { clear: 'sc_res_clear', refer: 'sc_res_refer', invalid: 'sc_res_invalid', pending: 'sc_res_pending', unavail: 'sc_res_unavail', confirmed: 'rv_confirmed', notConfirmed: 'rv_notConfirmed' }[resKey];
  const confT = CP.Tasks.find(t => t.type === 'scr_conf' && t.caseId === c.id && t.data.kind === kind);
  steps.appendChild(step('sc_step_result', '', S.st === 'done', ['refer', 'pending'].indexOf(S.st) >= 0,
    resLbl ? hh('span', { class: 'result ' + resKey }, CP.t(resLbl)) : null,
    S.st === 'refer' ? hh('button', { class: 'btn sm', onclick: () => { CP.Scr.confirm(c, kind); CP.UI.renderPanel(); } }, CP.t('sc_confirm')) : null,
    confT ? taskMeter(confT, 'sc_confirming') : null,
    (S.result === 'invalid') ? hh('span', { class: 'small muted' }, CP.t('sc_repeat')) : null,
    hh('button', { class: 'btn sm ghost', onclick: () => { CP.UI.resDec = 'medical'; CP.UI.open('resolve', c.id); } }, CP.t('sc_medical'))));
  if (c.flags.medHint && kind === 'breath') steps.appendChild(hh('div', { class: 'notice bad' }, CP.t('sc_medHint')));
  if (S.attempts.length) steps.appendChild(hh('div', { class: 'small muted' }, CP.t('sc_attempts') + ': ' + S.attempts.map(a => CP.t({ clear: 'sc_res_clear', refer: 'sc_res_refer', invalid: 'sc_res_invalid' }[a.res])).join(' → ')));
  const warn = !g.impairCue ? hh('div', { class: 'notice bad' }, CP.t('sc_noReason')) : null;
  body.append(hh('div', { class: 'row' }, tabs, hh('span', { class: 'small muted' }, CP.t('sc_fictional'))), hh('div', { style: 'height:8px' }), warn || '', hh('div', { class: 'scr' }, art, hh('div', { class: 'col' }, steps, hh('div', { class: 'notice' }, CP.t('sc_prelim')))));
  quick(foot, ['talk', 'record', 'resolve']);
};

/* ---------------- notebook ---------------- */
CP.UI.nbAll = false;
CP.Panels.notebook = function (body, foot, c) {
  const s = CP.G.shift;
  if (!c) { const cc = CP.Act.curC(); if (cc) { CP.UI.panel.caseId = cc.id; c = cc; } }
  const all = CP.UI.nbAll || !c;
  const seg = hh('div', { class: 'seg' }, hh('button', { class: !all ? 'on' : '', 'aria-disabled': c ? 'false' : 'true', onclick: () => { CP.UI.nbAll = false; CP.UI.renderPanel(); } }, CP.t('nb_thisCase')), hh('button', { class: all ? 'on' : '', onclick: () => { CP.UI.nbAll = true; CP.UI.renderPanel(); } }, CP.t('nb_allCases')));
  const list = hh('div', { class: 'notes scroll', style: 'max-height:none' });
  const notes = (all ? s.notes : s.notes.filter(n => n.caseId === c.id)).slice().reverse();
  if (!notes.length) list.appendChild(hh('div', { class: 'muted' }, CP.t('nb_empty')));
  let lastCase = null;
  for (const n of notes) { if (all && n.caseId !== lastCase) { lastCase = n.caseId; list.appendChild(hh('div', { class: 'lbl', style: 'margin-top:6px' }, n.caseId ? CP.t('nb_case') + ' ' + n.caseId + ' — ' + CP.t('v_' + s.cases[n.caseId].type) : '—')); } list.appendChild(CP.UI.noteEl(n)); }
  const ev = hh('div', { class: 'col' }, hh('div', { class: 'lbl' }, CP.t('nb_evidence_log')));
  const evs = all ? s.evidence : s.evidence.filter(e => c && e.caseId === c.id);
  if (!evs.length) ev.appendChild(hh('div', { class: 'muted small' }, CP.t('res_none')));
  for (const e of evs) ev.appendChild(hh('div', { class: 'note' }, hh('div', { class: 'h' }, hh('span', { class: 'tag bad' }, e.id), hh('span', { class: 'small muted' }, e.caseId + ' • ' + CP.num(e.clock)), hh('span', { class: 'tag' }, CP.t('ev_status_' + e.status))), CP.L(CP.C.items[e.kind] ? CP.C.items[e.kind].name : { ar: 'عينة', en: 'Sample' }) + ' — ' + (e.zone === 'sample' ? CP.t('sc_drug') : CP.t('z_' + e.zone))));
  body.append(hh('div', { class: 'row' }, seg), hh('div', { style: 'height:8px' }), hh('div', { class: 'grid2' }, list, ev));
};

/* ---------------- resolve ---------------- */
CP.UI.resCase = null; CP.UI.resDec = null; CP.UI.resReason = null; CP.UI.resSup = new Set(); CP.UI.resReasonUser = false;
/* sensible default reason for each decision (release → routine check); the player can still change it */
CP.UI.DEF_REASON = { release: 'routine', advice: 'routine', medical: 'medical' };
CP.Panels.resolve = function (body, foot, c) {
  if (CP.UI.resCase !== c.id) { const keepDec = CP.UI.resDec === 'medical' ? 'medical' : null; CP.UI.resCase = c.id; CP.UI.resReasonUser = false; CP.UI.resDec = keepDec; CP.UI.resReason = keepDec ? 'medical' : null; CP.UI.resSup = new Set(); }
  if (c.res) { body.appendChild(hh('div', { class: 'notice' }, CP.t('r_resolved'))); return; }
  const k = c.k, v = CP.vehOfCase(c);
  const sup = CP.UI.resSup;
  const facts = hh('div', { class: 'notes scroll', style: 'max-height:40vh' });
  const ns = CP.notesFor(c).filter(n => n.type !== 'incident' || !n.searchReason);
  if (!ns.length) facts.appendChild(hh('div', { class: 'muted small' }, CP.t('nb_empty')));
  for (const n of ns) facts.appendChild(CP.UI.noteEl(n, sup.has(n.id), (id, on) => { on ? sup.add(id) : sup.delete(id); CP.UI.renderPanel(); }));
  const open = [];
  for (const q of ['vehicle', 'person', 'confirm']) if (k.pending[q]) open.push(CP.t('res_pendingQ') + ' (' + CP.t('rv_' + q) + ')');
  if (!k.docsViewed) open.push(CP.t('res_unreviewedDocs'));
  for (const q of ['breath', 'drug']) if (['refer', 'pending', 'processing'].indexOf(k.scr[q].st) >= 0) open.push(CP.t('res_scrPending') + ' (' + CP.t(q === 'breath' ? 'sc_breath' : 'sc_drug') + ')');
  const decs = ['release', 'advice', 'warning', 'citation', 'refer_admin', 'medical', 'hold', 'handover'];
  const dgrid = hh('div', { class: 'decs' });
  for (const d of decs) {
    let why = CP.Cases.decisionReq(c, d, [...sup]);
    if (!why && (d === 'hold' || d === 'handover') && (!v || v.st !== 'bay')) why = 'r_bayForHold';
    dgrid.appendChild(hh('button', { class: 'btn dec' + (CP.UI.resDec === d ? ' on' : '') + (why ? ' no' : ''), onclick: () => { CP.UI.resDec = d; if (!CP.UI.resReasonUser) CP.UI.resReason = CP.UI.DEF_REASON[d] || CP.UI.resReason; CP.UI.renderPanel(); } }, CP.t(d === 'release' && CP.Gender.isF(c) ? 'res_release_f' : 'res_' + d), hh('span', { class: 's' }, why ? CP.t(why) : '✓')));
  }
  const reasons = ['routine', 'expired', 'noLicence', 'admin', 'alert', 'journey', 'screen', 'medical', 'safety', 'conduct', 'evidence', 'favour'];
  const sel = hh('select', { class: 'sel', 'aria-label': CP.t('res_reason'), onchange: e => { CP.UI.resReason = e.target.value || null; CP.UI.resReasonUser = !!e.target.value; } }, hh('option', { value: '' }, '— ' + CP.t('res_reason') + ' —'), ...reasons.map(r => { const o = hh('option', { value: r }, CP.t('rr_' + r)); if (CP.UI.resReason === r) o.selected = true; return o; }));
  const left = hh('div', { class: 'col' }, hh('div', { class: 'lbl' }, CP.t('res_known')), hh('div', { class: 'small muted' }, CP.t('res_support_hint')), facts,
    hh('div', { class: 'lbl' }, CP.t('res_open')), hh('div', { class: 'small' }, open.length ? open.map(x => '• ' + x).join('\n') : CP.t('res_open_none')));
  const right = hh('div', { class: 'col' }, hh('div', { class: 'lbl' }, CP.t('res_pick')), dgrid, hh('div', { class: 'lbl' }, CP.t('res_reason')), sel);
  const confirmBtn =     hh('button', { class: 'btn pri', onclick: () => {
      if (!CP.UI.resDec) { CP.UI.toast(CP.t('res_pick'), 'warn'); return; }
      const e = CP.Act.resolve(c, CP.UI.resDec, CP.UI.resReason, [...sup]);
      if (e) { CP.UI.toast(CP.t(e), 'warn'); CP.Audio.deny(); return; }
      CP.UI.toast(CP.t('res_done', { d: CP.t('res_' + CP.UI.resDec) }), 'ok'); CP.UI.resCase = null; CP.UI.resDec = null; CP.UI.close();
    } }, CP.icon('resolve'), CP.UI.resDec ? CP.t(CP.UI.resDec === 'release' && CP.Gender.isF(c) ? 'res_release_f' : 'res_' + CP.UI.resDec) + ' — ' + CP.t('res_confirmBtn') : CP.t('res_confirmBtn'));
  left.lastChild.style.whiteSpace = 'pre-line';
  body.appendChild(hh('div', { class: 'res' }, left, right));
  confirmBtn.style.flex = '1'; foot.appendChild(confirmBtn);
};

/* ---------------- partner ---------------- */
CP.Panels.partner = function (body) {
  const s = CP.G.shift; const cur = CP.Actors.partnerTask(); const c = CP.Act.curC(); const v = CP.Act.curV();
  const head = hh('div', { class: 'card row' }, hh('span', { class: 'lbl' }, CP.t('pt_current')), cur ? hh('b', null, CP.t('pt_' + cur.data.kind)) : hh('span', { class: 'muted' }, CP.t('pt_none')),
    cur && cur.dur < 1e8 ? taskMeter(cur) : null, cur ? hh('button', { class: 'btn sm', onclick: () => { CP.Actors.partnerRecall(); CP.UI.renderPanel(); } }, CP.t('pt_recall')) : null);
  const stalled = s.vehicles.find(x => x.stallKind === 'overheat' || x.stallKind === 'collision');
  const opts = [
    { k: 'traffic', need: null, data: () => ({ x: 15.4, row: 0, pose: 'stop', faceX: 8 }) },
    { k: 'cones', need: null, data: () => ({ x: CP.W.coneX + 0.9, row: 0, pose: 'lower', faceX: 0 }) },
    { k: 'supplies', need: null, data: () => ({ x: CP.W.boothX - 1.3, row: 0 }) },
    { k: 'visitor', need: s.visitor && !s.visitor.done ? null : 'pt_notNeeded', data: () => ({ x: CP.W.visitorX - 0.7, row: 0, faceX: CP.W.visitorX + 1 }) },
    { k: 'vehicle', need: stalled ? null : 'pt_notNeeded', data: () => { const sp = CP.Act.spot(stalled); return { x: sp.x - 0.9, row: sp.row, vid: stalled.id, pose: 'flashlight', faceX: sp.x }; } },
    { k: 'medical', need: c && !c.res && v && (v.st === 'stopped' || v.st === 'bay') ? null : 'pt_needCase', data: () => { const sp = CP.Act.spot(v); return { x: sp.x - 1.0, row: sp.row, caseId: c.id, faceX: sp.x }; } },
    { k: 'assist', need: c && !c.res && v && v.st === 'bay' ? null : 'r_needBay', data: () => { const sp = CP.Act.spot(v); return { x: sp.x - 1.3, row: sp.row, caseId: c.id, pose: 'flashlight', faceX: sp.x }; } },
    { k: 'repair', need: s.gate.jam ? null : 'pt_notNeeded', data: () => ({ x: CP.W.gateX + 0.7, row: 0, pose: 'lower', faceX: CP.W.gateX }) },
    { k: 'generator', need: s.equipment.generator !== 'ok' ? null : 'pt_notNeeded', data: () => ({ x: CP.W.genX - 0.9, row: 0, faceX: CP.W.genX }) }
  ];
  const grid = hh('div', { class: 'decs' });
  for (const o of opts) {
    const lock = CP.Actors.partnerCan(o.k); const why = lock || o.need;
    const isCur = cur && cur.data.kind === o.k;
    grid.appendChild(hh('button', { class: 'btn dec' + (isCur ? ' on' : '') + (why ? ' no' : ''), onclick: () => {
      if (why) { CP.UI.toast(CP.t(why), 'warn'); return; }
      const go = force => { const e = CP.Actors.assign(o.k, o.data(), force); if (e === 'r_partnerBusy') CP.UI.confirm(CP.t('pt_replace'), () => { go(true); CP.UI.renderPanel(); }); else if (e) CP.UI.toast(CP.t(e), 'warn'); CP.UI.renderPanel(); };
      go(false);
    } }, CP.t('pt_' + o.k), hh('span', { class: 's' }, why ? CP.t(why) : isCur ? '●' : CP.t('up_lvl', { n: CP.num(CP.PT.lvl[o.k]) }))));
  }
  body.append(head, hh('div', { style: 'height:10px' }), grid);
};

/* ---------------- record observation ---------------- */
CP.Panels.record = function (body, foot, c) {
  const v = CP.vehOfCase(c); if (v) CP.Act.seeCues(v, c);
  const k = c.k; const list = hh('div', { class: 'col' });
  for (const cue of k.cuesSeen) {
    const done = k.cuesRec.indexOf(cue) >= 0;
    list.appendChild(hh('div', { class: 'card row' }, hh('span', { style: 'flex:1' }, CP.L(CP.C.cues[cue])), done ? hh('span', { class: 'tag ok' }, CP.t('rec_done')) : hh('button', { class: 'btn sm pri', onclick: () => { CP.Act.recordCue(c, cue); CP.UI.toast(CP.t('obs_recorded'), 'ok'); CP.UI.renderPanel(); } }, CP.t('a_record'))));
  }
  if (!k.cuesSeen.length) list.appendChild(hh('div', { class: 'muted' }, CP.t('obs_none')));
  const dark = CP.Act.dark();
  body.append(hh('div', { class: 'lbl' }, CP.t('rec_seen')), list, hh('div', { style: 'height:10px' }),
    hh('div', { class: 'row' }, hh('button', { class: 'btn', 'aria-disabled': v && CP.Act.nearVeh(v, 2.2) ? 'false' : 'true', onclick: () => { if (!v || !CP.Act.nearVeh(v, 2.2)) { CP.UI.toast(CP.t('r_tooFar'), 'warn'); return; } CP.Act.torch(c); CP.UI.renderPanel(); } }, CP.A.thumb('flashlight', 34, 20, 0), CP.t('a_torch')), dark ? hh('span', { class: 'small muted' }, CP.t('rec_torchHint')) : null));
  quick(foot, ['talk', 'resolve']);
};

/* ---------------- lost visitor ---------------- */
CP.Panels.visitor = function (body) {
  const s = CP.G.shift; if (!s.visitor || s.visitor.done) { body.appendChild(hh('div', { class: 'muted' }, CP.t('r_noVisitor'))); return; }
  const V = CP.C.visitor[s.loc] || CP.C.visitor[CP.locBase(s.loc)]; const r = CP.makeRng(s.seedTag + Math.floor(s.visitor.t0));
  const opts = r.shuffle(V.opts);
  body.appendChild(hh('div', { class: 'row', style: 'align-items:flex-start' }, CP.A.thumb(s.visitor.civ, 80, 150), hh('div', { class: 'col', style: 'flex:1' }, hh('div', { class: 'lbl' }, CP.t('vis_q')), hh('div', { class: 'ln driver' }, CP.L(V.q)),
    ...opts.map(o => hh('button', { class: 'btn', style: 'justify-content:flex-start;text-align:start', onclick: () => { CP.Events.visitorHelped(o.ok); if (o.ok) CP.UI.toast(CP.L(V.thanks), 'ok'); CP.UI.close(); } }, CP.L(o.t))))));
};
;(window.CP_FILES = window.CP_FILES || {})['17_panels'] = '1.4.1';
