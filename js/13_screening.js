/* Screening (fictional game rules). Breath and drug are separate procedures:
   explain → readiness (self-check / gloves+kit) → sample quality (hold) → processing → result → repeat / confirm / medical.
   Results derive from the case truth. A preliminary REFER is never a finding. */
CP.addStrings({
  sc_step_explain: ['١. اشرح الإجراء', '1. Explain the procedure'],
  sc_step_ready: ['٢. جهّز الجهاز', '2. Prepare the equipment'],
  sc_step_sample: ['٣. خد العينة', '3. Take the sample'],
  sc_step_result: ['٤. النتيجة', '4. Result'],
  sc_explained: ['اتشرح للسواق', 'Explained to the driver'],
  sc_checking: ['فحص ذاتي… {s}ث', 'Self-check… {s}s'],
  sc_processing: ['تحليل… {s}ث', 'Processing… {s}s'],
  sc_confirming: ['تأكيد… {s}ث', 'Confirming… {s}s'],
  sc_noSupplies: ['المستلزمات خلصت — اطلب من الزميل يجيب من الكشك', 'Out of supplies — ask your partner to fetch more from the booth'],
  sc_medHint: ['السواق مش قادر ينفخ بثبات وعرقان — ممكن تكون حالة طبية', 'The driver cannot give a steady breath and is sweating — this may be medical'],
  sc_hold: ['اضغط مطولاً', 'Press and hold'],
  sc_attempts: ['المحاولات', 'Attempts'],
  sc_confirmedPos: ['التأكيد: فوق الحد (قواعد اللعبة)', 'Confirmed: above the limit (game rules)'],
  sc_confirmedNeg: ['التأكيد: سلبي — النتيجة المبدئية ماتأكدتش', 'Confirmation negative — the preliminary result was not confirmed'],
  sc_gloved: ['لابس جوانتي', 'Gloves on'],
  sc_kitReady: ['الكيت جاهز', 'Kit ready']
});
CP.Scr = {};
const SX = t => CP.G.shift.cases[t.caseId];
CP.Scr.st = (c, kind) => c.k.scr[kind];
CP.Scr.near = function (c) { const v = CP.vehOfCase(c); return v && CP.Act.nearVeh(v, 1.9); };
const spotOf = c => CP.Act.spot(CP.vehOfCase(c));
const taskOf = (c, kind) => CP.Tasks.find(t => t.type.indexOf('scr_') === 0 && t.caseId === c.id && t.data.kind === kind);
CP.Scr.task = taskOf;

CP.Scr.explain = function (c, kind) {
  const S = c.k.scr[kind]; if (S.explained) return;
  S.explained = true; c.k.explained = true; c.coop = CP.clamp(c.coop + 4, 0, 100); c.patience = CP.clamp(c.patience + 6, 0, 100);
  const fem = CP.Gender.isF(c); const line = kind === 'breath' ? { ar: fem ? 'هنعمل كشف نَفَس مبدئي. هتنفخي في الجهاز نفَس طويل لحد ما أقولك. النتيجة المبدئية مش حكم.' : 'هنعمل كشف نَفَس مبدئي. هتنفخ في الجهاز نفَس طويل لحد ما أقولك. النتيجة المبدئية مش حكم.', en: "I'm going to do a preliminary breath screen. Blow one long breath until I say stop. A preliminary result is not a finding." } : { ar: 'هناخد مسحة من البُق بعد إذنك. بتاخد ثواني، والنتيجة المبدئية محتاجة تأكيد.', en: "I'll take a mouth swab, with your permission. It takes seconds, and any preliminary result needs confirmation." };
  CP.Dlg.say(c, 'officer', line);
  CP.Dlg.say(c, 'driver', c.coop > 40 ? { ar: 'ماشي يا فندم.', en: 'All right, officer.' } : { ar: 'هو ده لازم؟… ماشي.', en: 'Is this necessary?… Fine.' });
  CP.autosave();
};
CP.Scr.ready = function (c, kind) {
  const S = c.k.scr[kind], e = CP.G.shift.equipment;
  if (taskOf(c, kind)) return null;
  if (kind === 'breath') {
    if (S.st !== 'idle' && S.st !== 'needMouth' && S.st !== 'unavail') return null;
    if (!S.checked) { const sp = spotOf(c); CP.Tasks.add({ type: 'scr_check', owner: 'officer', caseId: c.id, dur: 3, data: { kind, x: sp.x, row: sp.row } }); S.st = 'checking'; return null; }
    if (e.mouth < 1) { S.st = 'unavail'; return 'sc_noSupplies'; }
    e.mouth--; S.st = 'fitted'; CP.Audio.click(); return null;
  }
  // drug: gloves + kit
  if (S.st !== 'idle' && S.st !== 'needKit' && S.st !== 'unavail') return null;
  if (!c.k.gloved) { if (e.gloves < 1) { S.st = 'unavail'; return 'sc_noSupplies'; } e.gloves--; c.k.gloved = true; }
  S.gloves = true;
  if (e.kits < 1) { S.st = 'unavail'; return 'sc_noSupplies'; }
  e.kits--; S.st = 'fitted'; CP.Audio.click(); return null;
};
CP.Tasks.on('scr_check', t => {
  const c = SX(t); if (!c) return; const S = c.k.scr.breath;
  if (CP.G.shift.equipment.breath === 'fault') { S.st = 'unavail'; S.result = 'unavail'; CP.note(c, 'screening', { ar: 'كشف النفس: الجهاز مش متاح', en: 'Breath screen: equipment unavailable' }, 'verified', { result: 'unavail', kind: 'breath' }); }
  else { S.checked = true; S.st = 'needMouth'; }
  CP.autosave();
}, t => CP.Scr.near(SX(t)));
/* hold duration measured in real seconds by the UI */
CP.Scr.sample = function (c, kind, held) {
  const S = c.k.scr[kind]; if (S.st !== 'fitted') return;
  const need = kind === 'breath' ? 2.4 : 2.0;
  if (held < need) {
    S.attempts.push({ res: 'invalid', why: 'short', t: CP.G.shift.t }); S.st = kind === 'breath' ? 'needMouth' : 'needKit'; S.result = 'invalid';
    CP.note(c, 'screening', kind === 'breath' ? { ar: 'كشف النفس: عينة غير صالحة (النفس قصير)', en: 'Breath screen: invalid sample (breath too short)' } : { ar: 'مسحة: عينة غير صالحة (قليلة)', en: 'Swab: invalid sample (insufficient)' }, 'verified', { result: 'invalid', kind });
    CP.autosave(); return 'short';
  }
  const sp = spotOf(c); const r = CP.makeRng(c.seed + S.attempts.length * 7 + (kind === 'drug' ? 99 : 0));
  CP.Tasks.add({ type: 'scr_proc', owner: 'officer', caseId: c.id, dur: kind === 'breath' ? 6 + r() * 3 : 16 + r() * 6, data: { kind, x: sp.x, row: sp.row } });
  S.st = 'processing'; CP.Audio.beep(); CP.autosave(); return 'ok';
};
CP.Tasks.on('scr_proc', t => {
  const c = SX(t); if (!c) return; const kind = t.data.kind; const S = c.k.scr[kind]; const T = c.truth;
  const valid = S.attempts.filter(a => a.res !== 'invalid').length;
  let res;
  if (kind === 'breath') {
    if (T.medical === 'hypo') res = 'invalid';
    else if (T.breathInvalidFirst && !S.attempts.some(a => a.firstInvalidDone)) { res = 'invalid'; }
    else res = T.breath === 'refer' ? 'refer' : 'clear';
  } else res = T.drug === 'refer' ? 'refer' : 'clear';
  const att = { res, t: CP.G.shift.t }; if (res === 'invalid' && T.breathInvalidFirst) att.firstInvalidDone = true;
  S.attempts.push(att); S.result = res;
  S.st = res === 'invalid' ? (kind === 'breath' ? 'needMouth' : 'needKit') : res === 'refer' ? 'refer' : 'done';
  const L = kind === 'breath' ? ['كشف النفس', 'Breath screen'] : ['مسحة مبدئية', 'Preliminary swab'];
  const R = { clear: ['سلبي (CLEAR)', 'CLEAR'], refer: ['يحتاج تأكيد (REFER) — مش إدانة', 'REFER — needs confirmation, not a finding'], invalid: ['عينة غير صالحة', 'INVALID SAMPLE'] }[res];
  CP.note(c, 'screening', { ar: L[0] + ': ' + R[0], en: L[1] + ': ' + R[1] }, res === 'refer' ? 'pending' : 'verified', { result: res, kind });
  if (res === 'invalid' && T.medical === 'hypo' && !c.flags.medHint) { c.flags.medHint = true; if (c.cues.indexOf('sweating') >= 0 && c.k.cuesSeen.indexOf('sweating') < 0) c.k.cuesSeen.push('sweating'); }
  if (res === 'refer' && kind === 'drug') {
    const s = CP.G.shift; const ev = { id: 'E' + s.no + '-' + (s.nextEv++), caseId: c.id, itemId: null, kind: 'sample_tube', variant: null, zone: 'sample', t: s.t, clock: CP.gameClock(), status: 'pending', hist: [{ t: s.t, st: 'pending' }] };
    s.evidence.push(ev); S.evId = ev.id; s.equipment.bags = Math.max(0, s.equipment.bags - 1);
  }
  CP.Audio.beep(res === 'clear' ? 1 : res === 'refer' ? 2 : 0);
  CP.autosave();
}, t => CP.Scr.near(SX(t)));
CP.Scr.confirm = function (c, kind) {
  const S = c.k.scr[kind]; if (S.st !== 'refer' || taskOf(c, kind)) return;
  const up = CP.G.career.upgrades.radio;
  CP.Tasks.add({ type: 'scr_conf', owner: 'radio', caseId: c.id, dur: Math.min(5, (kind === 'breath' ? 4 : 4.8) * [1, .85, .7][up]), data: { kind } });
  S.st = 'pending'; S.result = 'pending'; CP.Audio.radioClick(); CP.autosave();
};
CP.Tasks.on('scr_conf', t => {
  const c = SX(t); if (!c) return; const kind = t.data.kind; const S = c.k.scr[kind];
  const conf = kind === 'breath' ? c.truth.breathConfirm : c.truth.drugConfirm;
  const ok = conf === 'confirmed';
  S.st = 'done'; S.result = ok ? 'confirmed' : 'notConfirmed';
  CP.note(c, 'screening', ok ? { ar: CP.STR.ar.sc_confirmedPos, en: CP.STR.en.sc_confirmedPos } : { ar: CP.STR.ar.sc_confirmedNeg, en: CP.STR.en.sc_confirmedNeg }, 'verified', { result: ok ? 'confirmed' : 'notConfirmed', kind });
  if (S.evId) { const ev = CP.G.shift.evidence.find(e => e.id === S.evId); if (ev) { ev.status = ok ? 'confirmed' : 'lawful'; ev.hist.push({ t: CP.G.shift.t, st: ev.status }); } }
  CP.Audio.radioClick(true); CP.UI && CP.UI.radioFlash(ok ? 'confirmed' : 'notConfirmed'); CP.autosave();
});
;(window.CP_FILES = window.CP_FILES || {})['13_screening'] = '2.7.0';
