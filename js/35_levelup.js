/* Level-up (v2.5.2): AAA-style promotion celebration on the report screen + a 5-second save heartbeat that also
   runs outside the game loop (menu, report, panels), so the last progress is never more than 5 s old. */
CP.addStrings({ lu_title: ['ترقية!', 'PROMOTED!'], lu_sub: ['رتبتك الجديدة', 'Your new rank'], lu_tap: ['اضغط للمتابعة', 'Tap to continue'], lu_perk: ['+١ نقطة مهارة', '+1 skill point'] });
CP.LevelUp = {};
CP.LevelUp.show = function (ri) {
  if (document.getElementById('levelup')) return; const h = CP.h; const el = h('div', { id: 'levelup' },
    h('div', { class: 'lu-rays' }), (() => { let bd = CP.Prog.badge(ri, 150); if (typeof bd === 'string') bd = bd.replace(/id="gd"/g, 'id="gdlu"').replace(/url\(#gd\)/g, 'url(#gdlu)'); const w = h('div', { class: 'lu-badge' }); if (typeof bd === 'string') w.innerHTML = bd; else if (bd) w.appendChild(bd); return w; })(), h('div', { class: 'lu-title' }, CP.t('lu_title')), h('div', { class: 'lu-sub' }, CP.t('lu_sub')), h('div', { class: 'lu-rank' }, CP.Prog.rankName(ri)), h('div', { class: 'lu-perk' }, '🧩 ' + CP.t('lu_perk')), h('div', { class: 'lu-tap' }, CP.t('lu_tap')));
  document.body.appendChild(el); const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 500); };
  el.addEventListener('pointerdown', close); setTimeout(close, 6500);
  try { CP.Audio.fanfare(); if (CP.Music) CP.Music.playSting(); if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 120]); } catch (e) { }
  const r = el.getBoundingClientRect(); for (let i = 0; i < 40; i++) { const s = h('i', { class: 'rv-spark lu-spark' }); s.style.left = (r.width / 2) + 'px'; s.style.top = (r.height * 0.36) + 'px'; s.style.setProperty('--dx', (Math.random() * 520 - 260) + 'px'); s.style.setProperty('--dy', (Math.random() * 420 - 260) + 'px'); s.style.animationDelay = (Math.random() * 0.4) + 's'; el.appendChild(s); }
};
{ const fin = CP.Career.finishShift; CP.Career.finishShift = function () { const car = CP.G && CP.G.career; const before = car ? CP.Prog.rankOf(car.xp) : 0; const r = fin.apply(this, arguments); const after = car ? CP.Prog.rankOf(car.xp) : 0; if (after > before) setTimeout(() => CP.LevelUp.show(after), 900); return r; }; }
/* save heartbeat: every 5 s whenever there is a career, in or out of a shift */
setInterval(() => { try { if (CP.G && CP.G.career && !(CP.Guard && CP.Guard.banned())) CP.save('auto'); } catch (e) { } }, 5000);
;(window.CP_FILES = window.CP_FILES || {})['35_levelup'] = '2.8.0';
