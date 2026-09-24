/* Adaptive music (v2.5)
   Three looping layers mixed live, the way AAA games do it:
     bed_day   — calm cinematic bed, full in daylight, fades out as night falls
     bed_night — night bed, fades in with night
     tension   — rises under a wanted car on the road, rush hour, supervisor inspection or an emergency; falls back after
   plus sting.mp3, a short flourish on big catches, warrant arrests and shift end.
   Every layer respects the music/master sliders and mute, ducks to 50% under radio calls (CP.Audio.ducked), pauses when
   the tab is hidden, and the whole system waits for the first user gesture like the old music did. */
CP.Music = { L: {}, started: false, want: { day: 1, night: 0, tension: 0 }, stingT: 0 };
const MU = CP.Music;
MU.FILES = { day: 'assets/music/bed_day.mp3', night: 'assets/music/bed_night.mp3', tension: 'assets/music/tension.mp3', sting: 'assets/music/sting.mp3' };
MU.mk = (k, loop) => { const a = new Audio(); a.preload = 'auto'; a.src = MU.FILES[k]; a.loop = loop; a.volume = 0; return a; };
MU.master = () => { const S = CP.S; return S.mute ? 0 : CP.clamp((S.music ?? 0.6) * (S.master ?? 1) * (CP.Audio.ducked ? 0.5 : 1), 0, 1); };
MU.start = function () {
  if (this.started) return; this.started = true;
  for (const k of ['day', 'night', 'tension']) { this.L[k] = this.mk(k, true); const p = this.L[k].play(); if (p && p.catch) p.catch(() => { this.started = false; }); }
  this.sting = this.mk('sting', false);
  if (!this._tick) this._tick = setInterval(() => MU.tick(), 100);
};
MU.stop = function () { for (const k in this.L) { try { this.L[k].pause(); } catch (e) { } } this.started = false; };
/* decide the target mix: beds cross-fade with the light; the tension track plays only on the shift-end report */
MU.target = function () {
  const s = CP.G && CP.G.shift; const night = CP.R && CP.R.nightLvl != null && s ? CP.R.nightLvl : 0;
  const onReport = !!(CP.Screens && CP.Screens.cur === 'report');
  const inMenu = !s || (CP.Screens && CP.Screens.cur);
  const bed = onReport ? 0 : inMenu ? 0.75 : 1;
  this.want = { day: bed * (1 - night), night: bed * night, tension: onReport ? 0.9 : 0 };
};
MU.tick = function () {
  if (!this.started || document.hidden) return; this.target(); const m = this.master();
  const stingLevel = this.sting && !this.sting.paused && !this.sting.ended ? 0.55 : 1; // beds dip under the sting
  for (const k in this.L) { const el = this.L[k]; const goal = m * this.want[k] * (k === 'tension' ? 1 : stingLevel); const rate = k === 'tension' ? 0.06 : 0.025; // tension answers faster than the beds cross-fade
    el.volume = CP.clamp(el.volume + CP.clamp(goal - el.volume, -rate, rate), 0, 1);
    if (el.paused && goal > 0.005) { const p = el.play(); if (p && p.catch) p.catch(() => {}); } }
};
MU.playSting = function () { if (!this.started || !this.sting || CP.S.mute) return; if (performance.now() - this.stingT < 6000) return; this.stingT = performance.now(); try { this.sting.currentTime = 0; this.sting.volume = this.master() * 0.95; const p = this.sting.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { } };
/* replace the old playlist player: same entry points, same settings */
CP.Audio.music.start = function () { MU.start(); };
CP.Audio.music.play = function () {}; CP.Audio.music.next = function () {}; CP.Audio.music.tick = function () {};
{ const stopAll = CP.Audio.stopAll; CP.Audio.stopAll = function () { const r = stopAll.apply(this, arguments); try { for (const k in MU.L) MU.L[k].volume = Math.min(MU.L[k].volume, 0.001); } catch (e) { } return r; }; }
document.addEventListener('visibilitychange', () => { try { if (document.hidden) { for (const k in MU.L) MU.L[k].pause(); if (MU.sting) MU.sting.pause(); } else if (MU.started) { for (const k in MU.L) { const p = MU.L[k].play(); if (p && p.catch) p.catch(() => {}); } } } catch (e) { } });
/* stings: serious catch, warrant arrest, shift end, black file closed */
CP.bus.on('caseClosed', c => { if (c.res && c.res.eval && c.res.eval.sound && CP.FAM[c.fam] && CP.FAM[c.fam].serious && ['hold', 'handover', 'refer_admin'].indexOf(c.res.decision) >= 0) MU.playSting(); });
{ const rep = CP.Screens.report; CP.Screens.report = function () { const r = rep.apply(this, arguments); MU.playSting(); try { if (MU.L.tension) MU.L.tension.currentTime = 0; } catch (e) { } return r; }; }
{ const st = CP.R.stamp; CP.R.stamp = function (text) { if (/WANTED|مطلوب|BET WON|كسبت|الملف|File/i.test(String(text))) MU.playSting(); return st.apply(this, arguments); }; }
;(window.CP_FILES = window.CP_FILES || {})['34_music'] = '2.6.0';
