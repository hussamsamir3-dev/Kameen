/* Audio. Music: 4 supplied tracks (Nile Serenity I/II, Nile Patrol I/II) in random order with crossfades; volume in Settings and the quick menu.
   Ambience: the supplied street loops (day & night) cross-faded by the in-game clock. SFX are synthesised (WebAudio) and stereo-panned. */
CP.addStrings({
  cap_horn: ['[كلاكس]', '[horn]'], cap_hornW: ['[كلاكسات زفة]', '[wedding horns]'], cap_siren: ['[سارينة إسعاف]', '[ambulance siren]'],
  cap_radio: ['[لاسلكي]', '[radio]'], cap_whistle: ['[صفارة]', '[whistle]'], cap_gate: ['[موتور البوابة]', '[gate motor]'],
  cap_rev: ['[موتور بيزمجر]', '[engine revving]'], cap_fault: ['[إنذار عطل]', '[fault alarm]'], cap_bump: ['[خبطة]', '[bump]'], cap_crank: ['[موتور مش راضي يدور]', '[engine cranking]'],
  cap_chatter: ['[لاسلكي بعيد]', '[distant radio chatter]'], mus_now: ['♪ {n}', '♪ {n}']
});
CP.MUSIC = ['assets/music/nile_serenity_1.mp3', 'assets/music/nile_serenity_2.mp3', 'assets/music/nile_patrol_1.mp3', 'assets/music/nile_patrol_2.mp3', 'assets/music/clearing_tension_1.mp3', 'assets/music/clearing_tension_2.mp3'];
CP.addStrings({ mus_name_0: ['نيل سيرينيتي ١', 'Nile Serenity I'], mus_name_1: ['نيل سيرينيتي ٢', 'Nile Serenity II'], mus_name_2: ['نيل باترول ١', 'Nile Patrol I'], mus_name_3: ['نيل باترول ٢', 'Nile Patrol II'], mus_name_4: ['تهدئة التوتر ١', 'Clearing the Tension I'], mus_name_5: ['تهدئة التوتر ٢', 'Clearing the Tension II'] });
CP.Audio = {
  ctx: null, ok: false, ducked: false, sirenNode: null, layers: {},
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); this.music.start(); return; }
    this.music.start();
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.connect(c.destination);
      this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 3; this.comp.connect(this.master);
      this.amb = c.createGain(); this.amb.connect(this.comp);
      this.sfx = c.createGain(); this.sfx.connect(this.comp);
      const mk = (sec, fn) => { const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate); fn(b.getChannelData(0)); return b; };
      this.white = mk(2, d => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
      this.brown = mk(4, d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.4; } });
      this.pink = mk(4, d => { let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 1.8; } });
      this.buildAmbience();
      this.ok = true; this.apply();
    } catch (e) { console.warn('audio', e); }
  },
  apply() {
    const S = CP.S;
    if (!this.ok) return; const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(S.mute ? 0 : S.master, t, 0.05);
    this.amb.gain.setTargetAtTime(S.amb * (this.ducked ? 0.45 : 1), t, 0.25);
    this.sfx.gain.setTargetAtTime(S.sfx, t, 0.05);
  },
  duck(on) { if (this.ducked === on) return; this.ducked = on; this.apply(); },
  cap(key) { if (CP.S.subs && CP.UI && CP.UI.caption) CP.UI.caption(CP.t(key)); },
  pan(x) { if (x == null || !CP.R || !CP.R.ppm || !CP.R.W) return 0; return CP.clamp((CP.R.sx(x) / CP.R.W) * 2 - 1, -0.9, 0.9); },
  out(pan) { if (!pan || !this.ctx.createStereoPanner) return this.sfx; const p = this.ctx.createStereoPanner(); p.pan.value = pan; p.connect(this.sfx); return p; },
  env(node, t0, a, peak, dur, dest) { const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); node.connect(g); g.connect(dest || this.sfx); return g; },
  tone(type, f, dur, peak, t0, f2, pan) {
    peak = peak * 0.78; dur = dur * 1.12;
    if (!this.ok) return; const c = this.ctx; t0 = t0 ?? c.currentTime;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    this.env(o, t0, 0.01, peak, dur, this.out(pan)); o.start(t0); o.stop(t0 + dur + 0.05);
  },
  burst(dur, peak, freq, q, t0, type, pan, buf) {
    peak = peak * 0.8;
    if (!this.ok) return; const c = this.ctx; t0 = t0 ?? c.currentTime;
    const s = c.createBufferSource(); s.buffer = buf || this.white; s.playbackRate.value = 0.8 + Math.random() * 0.4; const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    s.connect(f); this.env(f, t0, 0.005, peak, dur, this.out(pan)); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  },

  /* ---------------- music playlist (HTML audio: works from file:// and from embedded data) ---------------- */
  music: {
    els: [], cur: -1, started: false,
    src(i) { const E = window.CP_MUSIC_EMBED; return E && E[i] ? E[i] : CP.MUSIC[i]; },
    target() { const S = CP.S; return S.mute ? 0 : CP.clamp(S.music * S.master * (CP.Audio.ducked ? 0.5 : 1), 0, 1); },
    start() {
      if (this.started) return;
      this.started = true;
      if (!this.els.length) { for (let i = 0; i < CP.MUSIC.length; i++) { const a = new Audio(); a.preload = 'auto'; a.src = this.src(i); a.volume = 0; a.addEventListener('ended', () => this.next()); this.els.push(a); } setInterval(() => this.tick(), 200); }
      this.play(this.cur >= 0 ? this.cur : Math.floor(Math.random() * this.els.length), true);
    },
    play(i, quiet) {
      const el = this.els[i]; if (!el) return; const prev = this.els[this.cur];
      this.cur = i; if (!quiet || el.ended) el.currentTime = 0; el.volume = 0;
      const p = el.play(); if (p && p.catch) p.catch(() => { this.started = false; });
      if (prev && prev !== el) { const pv = prev; const f = setInterval(() => { pv.volume = Math.max(0, pv.volume - 0.04); if (pv.volume <= 0) { pv.pause(); clearInterval(f); } }, 80); }
      
    },
    next() { if (!this.els.length) return; let n = this.cur; if (this.els.length > 1) while (n === this.cur) n = Math.floor(Math.random() * this.els.length); this.play(n); },
    tick() {
      const el = this.els[this.cur]; if (!el) return;
      if (document.hidden) { if (!el.paused) el.pause(); return; }
      if (el.paused && this.started && !el.ended) el.play().catch(() => { });
      const tgt = this.target(); const left = (el.duration || 999) - el.currentTime;
      if (left < 4 && this.els.length > 1 && !el._x) { el._x = true; setTimeout(() => { el._x = false; }, 8000); this.next(); return; }
      el.volume = CP.clamp(el.volume + CP.clamp(tgt - el.volume, -0.05, 0.025), 0, 1);
    }
  },

  /* ---------------- ambience layers ---------------- */
  loopSrc(buf, filterType, freq, q) {
    const c = this.ctx; const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = c.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q || 0.7;
    const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.amb); s.start(0, Math.random() * 2);
    return { s, f, g };
  },
  buildAmbience() {
    const c = this.ctx, L = this.layers;
    // supplied street ambience: day & night 30 s loops, cross-faded by the clock (gapless via overlapping restarts)
    L.day = { g: c.createGain(), buf: null }; L.night = { g: c.createGain(), buf: null };
    L.day.g.gain.value = 0; L.night.g.gain.value = 0; L.day.g.connect(this.amb); L.night.g.connect(this.amb);
    const E = window.CP_AMB || {};
    const decode = (key) => {
      const url = E[key]; if (!url) return;
      const b64 = url.slice(url.indexOf(',') + 1); const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const done = buf => { L[key].buf = buf; this.loopStart(L[key]); };
      const p = c.decodeAudioData(u8.buffer, done, e => console.warn('ambience', e)); if (p && p.catch) p.catch(() => { });
    };
    decode('day'); decode('night');
    // generator hum (equipment feedback) and a quiet engine bed that follows the traffic
    const go = c.createOscillator(); go.type = 'sawtooth'; go.frequency.value = 50; const gf = c.createBiquadFilter(); gf.type = 'lowpass'; gf.frequency.value = 180;
    const gg = c.createGain(); gg.gain.value = 0; go.connect(gf); gf.connect(gg); gg.connect(this.amb); go.start(); L.gen = { g: gg };
    const eo = c.createOscillator(); eo.type = 'sawtooth'; eo.frequency.value = 42; const eo2 = c.createOscillator(); eo2.type = 'triangle'; eo2.frequency.value = 63;
    const ef = c.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 170; const eg = c.createGain(); eg.gain.value = 0;
    eo.connect(ef); eo2.connect(ef); ef.connect(eg); eg.connect(this.amb); eo.start(); eo2.start(); L.eng = { o: eo, o2: eo2, g: eg };
  },
  /* seamless loop: each pass starts 1.5 s before the previous ends and cross-fades */
  loopStart(layer) {
    const c = this.ctx, buf = layer.buf, X = 1.5;
    const play = t0 => {
      const src = c.createBufferSource(); src.buffer = buf; const g = c.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + X);
      const end = t0 + buf.duration; g.gain.setValueAtTime(1, end - X); g.gain.linearRampToValueAtTime(0, end);
      src.connect(g); g.connect(layer.g); src.start(t0); src.stop(end + 0.05);
      layer.next = setTimeout(() => play(end - X), Math.max(0, (end - X - c.currentTime - 0.5) * 1000));
    };
    play(c.currentTime + 0.05);
  },
  crickets(level) {
    if (!this.ok || level < 0.1) return; const c = this.ctx, t = c.currentTime; const f = 4200 + Math.random() * 900; const n = 3 + Math.floor(Math.random() * 4); const pan = Math.random() * 1.6 - 0.8;
    for (let i = 0; i < n; i++) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = c.createGain(); const t0 = t + i * 0.055; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.012 * level, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04); o.connect(g); const p = c.createStereoPanner ? c.createStereoPanner() : null; if (p) { p.pan.value = pan; g.connect(p); p.connect(this.amb); } else g.connect(this.amb); o.start(t0); o.stop(t0 + 0.05); }
  },
  bird() { if (!this.ok) return; const t = this.ctx.currentTime; const f0 = 2400 + Math.random() * 1400; const pan = Math.random() * 1.6 - 0.8; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) this.tone('sine', f0 * (1 + Math.random() * 0.2), 0.09, 0.011, t + i * 0.13, f0 * 1.35, pan); },
  swoosh(near) {
    if (!this.ok) return; const c = this.ctx, t = c.currentTime; const s = c.createBufferSource(); s.buffer = this.pink; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    const dur = near ? 2.2 : 3.5; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(near ? 1100 : 700, t + dur * 0.5); f.frequency.linearRampToValueAtTime(260, t + dur);
    const g = c.createGain(); const pk = near ? 0.07 : 0.035; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(pk, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = c.createStereoPanner ? c.createStereoPanner() : null; s.connect(f); f.connect(g);
    if (p) { p.pan.setValueAtTime(-0.9, t); p.pan.linearRampToValueAtTime(0.9, t + dur); g.connect(p); p.connect(this.amb); } else g.connect(this.amb);
    s.start(t, Math.random() * 2); s.stop(t + dur + 0.1);
  },
  chatter() {
    if (!this.ok) return; const t = this.ctx.currentTime; this.burst(0.05, 0.05, 2600, 3, t, 'bandpass', 0.5);
    for (let i = 0; i < 6 + Math.random() * 6; i++) this.burst(0.08 + Math.random() * 0.12, 0.018, 900 + Math.random() * 900, 4, t + 0.08 + i * 0.14, 'bandpass', 0.5);
    this.burst(0.05, 0.05, 2600, 3, t + 1.3, 'bandpass', 0.5); this.cap('cap_chatter');
  },
  dog() { if (!this.ok) return; const t = this.ctx.currentTime; const pan = Math.random() < .5 ? -0.8 : 0.8; for (let i = 0; i < 2; i++) this.tone('sawtooth', 380, 0.12, 0.01, t + i * 0.3, 240, pan); },

  /* ---------------- SFX ---------------- */
  radioClick(reply) { this.burst(0.06, 0.25, 2500, 2); if (reply && this.ok) { const t = this.ctx.currentTime; this.burst(0.35, 0.05, 1800, 0.8, t + 0.07); this.tone('sine', 1320, 0.07, 0.03, t + 0.45); this.cap('cap_radio'); } },
  paper() { if (!this.ok) return; const t = this.ctx.currentTime; for (let i = 0; i < 4; i++) this.burst(0.09 + Math.random() * 0.06, 0.03 + Math.random() * 0.02, 2200 + Math.random() * 2400, 0.6, t + i * 0.055, 'bandpass'); this.burst(0.3, 0.02, 5200, 0.4, t + 0.1, 'bandpass'); },
  paperOld() { if (!this.ok) return; const t = this.ctx.currentTime; for (let i = 0; i < 3; i++) this.burst(0.08 + Math.random() * 0.08, 0.1, 3500 + Math.random() * 2500, 0.8, t + i * 0.07, 'highpass'); },
  ack(g) { this.tone('sine', g === 'f' ? 330 : 190, 0.12, 0.05); },
  /* v1.6: calm, tactile UI clicks — a soft felt thud with a faint wooden tick, no bright bell */
  click() { if (!this.ok) return; const t = this.ctx.currentTime; this.burst(0.05, 0.11, 240, 1.2, t, 'lowpass'); this.burst(0.018, 0.035, 3200, 2.2, t + 0.004, 'bandpass'); this.tone('sine', 210, 0.09, 0.02, t + 0.002, 150); },
  clickSoft() { if (!this.ok) return; const t = this.ctx.currentTime; this.burst(0.03, 0.06, 300, 1.4, t, 'lowpass'); this.tone('sine', 260, 0.06, 0.01, t, 180); },
  hover() { if (!this.ok) return; this.tone('sine', 1760, 0.05, 0.004); },
  deny() { if (!this.ok) return; const t = this.ctx.currentTime; this.tone('sine', 330, 0.14, 0.03, t); this.tone('sine', 262, 0.18, 0.025, t + 0.1); },
  whistle(release) { if (!this.ok) return; const t = this.ctx.currentTime; this.tone('sine', 2600, release ? 0.12 : 0.3, 0.07, t, release ? 2400 : 2800); if (release) this.tone('sine', 2600, 0.14, 0.06, t + 0.18); this.burst(release ? 0.12 : 0.3, 0.02, 2700, 6, t); this.cap('cap_whistle'); },
  gate(open) { if (!this.ok) return; const t = this.ctx.currentTime; this.tone('sawtooth', open ? 70 : 90, 1.4, 0.03, t, open ? 110 : 60, 0.1); this.burst(1.3, 0.02, 400, 2, t, 'bandpass', 0.1); this.tone('sine', 900, 0.05, 0.03, t + 1.35); this.cap('cap_gate'); },
  horn(kind, x) {
    if (!this.ok) return; const t = this.ctx.currentTime; const pan = this.pan(x); const vol = 0.06 * (x != null && (x < -2 || x > 40) ? 0.5 : 1);
    if (kind === 'wedding') { for (let i = 0; i < 6; i++) { this.tone('square', 415, 0.15, vol, t + i * 0.2, null, pan); this.tone('square', 523, 0.15, vol * 0.7, t + i * 0.2, null, pan); } this.cap('cap_hornW'); return; }
    const d = kind === 'long' ? 0.9 : 0.25; this.tone('square', 370, d, vol, t, null, pan); this.tone('square', 466, d, vol * 0.8, t, null, pan); this.cap('cap_horn');
  },
  siren(on) {
    if (!this.ok) return; const c = this.ctx;
    if (on && !this.sirenNode) {
      const o = c.createOscillator(); o.type = 'triangle'; const lfo = c.createOscillator(); lfo.frequency.value = 0.85; const lg = c.createGain(); lg.gain.value = 240;
      lfo.connect(lg); lg.connect(o.frequency); o.frequency.value = 830; const g = c.createGain(); g.gain.value = 0.03; const p = c.createStereoPanner ? c.createStereoPanner() : null;
      o.connect(g); if (p) { g.connect(p); p.connect(this.sfx); } else g.connect(this.sfx); o.start(); lfo.start();
      this.sirenNode = { o, lfo, g, p }; this.cap('cap_siren');
    } else if (!on && this.sirenNode && !CP.G.shift.vehicles.some(v => v.special === 'ambulance')) { const n = this.sirenNode; n.g.gain.setTargetAtTime(0, c.currentTime, 0.4); setTimeout(() => { try { n.o.stop(); n.lfo.stop(); } catch (e) { } }, 1800); this.sirenNode = null; }
  },
  rev() { this.tone('sawtooth', 60, 1.2, 0.06, undefined, 150); this.cap('cap_rev'); },
  crank() { if (!this.ok) return; const t = this.ctx.currentTime; for (let i = 0; i < 6; i++) this.burst(0.09, 0.15, 180, 2, t + i * 0.16, 'lowpass'); this.cap('cap_crank'); },
  fault() { if (!this.ok) return; const t = this.ctx.currentTime; for (let i = 0; i < 3; i++) this.tone('square', 880, 0.12, 0.035, t + i * 0.25); this.cap('cap_fault'); },
  bump() { this.burst(0.3, 0.4, 130, 1, undefined, 'lowpass'); this.burst(0.15, 0.1, 2500, 1, undefined, 'highpass'); this.cap('cap_bump'); },
  cone() { this.burst(0.1, 0.12, 900, 2); this.tone('triangle', 520, 0.08, 0.02); },
  door() { this.burst(0.12, 0.25, 300, 1.2, undefined, 'lowpass'); this.burst(0.05, 0.08, 2000, 2); },
  zip() { this.tone('sawtooth', 900, 0.35, 0.015, undefined, 1800); },
  gen() { this.tone('sawtooth', 40, 1.6, 0.05, undefined, 100); },
  step() { this.burst(0.05, 0.03 + Math.random() * 0.02, 380 + Math.random() * 200, 1.2, undefined, 'lowpass', this.pan(CP.G && CP.G.shift ? CP.G.shift.officer.x : null)); },
  stampSfx() { if (!this.ok) return; const t = this.ctx.currentTime; this.burst(0.09, 0.32, 160, 0.9, t, 'lowpass'); this.burst(0.04, 0.12, 1400, 1.2, t + 0.01, 'bandpass'); this.burst(0.25, 0.05, 900, 0.5, t + 0.05, 'bandpass'); this.tone('sine', 95, 0.2, 0.05, t, 60); },
  beep(n) { if (!this.ok) return; const t = this.ctx.currentTime; const cnt = n == null ? 1 : n + 1; for (let i = 0; i < cnt; i++) this.tone('sine', n === 0 ? 500 : 1200, 0.1, 0.05, t + i * 0.15); },
  chime(kind) {
    if (!this.ok) return; const t = this.ctx.currentTime;
    // v1.6: warmer chimes — layered sine + soft triangle with a gentle decay, quieter and rounder than before
    const seq = { good: [659, 988], great: [523, 659, 784, 1047], bad: [330, 262], xp: [1319, 1760], combo: [784, 988, 1175, 1568], obj: [587, 740, 880, 1175] }[kind] || [880];
    const g = kind === 'bad' ? 0.045 : 0.038;
    seq.forEach((f, i) => { const d = t + i * (kind === 'bad' ? 0.16 : 0.09); this.tone('sine', f, 0.55, g, d); this.tone('triangle', f, 0.25, g * 0.35, d); this.tone('sine', f * 2, 0.18, g * 0.15, d); });
    if (kind === 'great' || kind === 'combo') this.burst(0.8, 0.02, 7000, 0.6, t + 0.2, 'highpass');
  },
  fanfare() { if (!this.ok) return; const t = this.ctx.currentTime; [[523, 0], [659, .12], [784, .24], [1047, .4], [784, .62], [1047, .74]].forEach(([f, d]) => { this.tone('triangle', f, 0.45, 0.06, t + d); this.tone('sawtooth', f / 2, 0.4, 0.012, t + d); }); this.burst(1.2, 0.03, 6000, 0.6, t + 0.4, 'highpass'); },

  /* ---------------- per-frame mixing ---------------- */
  update(dt) {
    if (!this.ok) return; const L = this.layers; const t = this.ctx.currentTime; dt = dt || 0.016;
    const s = CP.G && CP.G.shift;
    const inGame = !!(s && !s.ended && CP.Main.running && !CP.Screens.cur);
    const night = inGame && CP.R.nightLvl != null ? CP.R.nightLvl : 0.6;
    let load = 0, near = 0;
    if (inGame) for (const v of s.vehicles) if (v.x > -3 && v.x < 42) { load += 0.25 + v.v * 0.08 + Math.max(0, v.a) * 0.15; if (Math.abs(v.x - s.officer.x) < 8) near += v.v; }
    const nl = inGame ? night : 0.75;
    const dust = !!(s && s.events && s.events.dustUntil > s.t);
    L.day.g.gain.setTargetAtTime((1 - nl) * (inGame ? 1 : 0.7), t, 0.8);
    L.night.g.gain.setTargetAtTime(nl * (inGame ? 1 : 0.7) * (dust ? 1.2 : 1), t, 0.8);
    const genOn = inGame && s.equipment.generator === 'ok';
    const genNear = inGame ? CP.clamp(1 - Math.abs(s.officer.x - CP.W.genX) / 14, 0.15, 1) : 0.1;
    L.gen.g.gain.setTargetAtTime(genOn ? 0.03 * genNear : 0, t, 0.3);
    L.eng.g.gain.setTargetAtTime(inGame ? Math.min(0.08, load * 0.014) : 0, t, 0.3);
    L.eng.o.frequency.setTargetAtTime(38 + Math.min(40, load * 4), t, 0.4); L.eng.o2.frequency.setTargetAtTime(57 + Math.min(60, load * 6), t, 0.4);
    if (inGame) {
      this.vs = this.vs || {};
      for (const v of s.vehicles) {
        const st = this.vs[v.id] || (this.vs[v.id] = { a: 0, v: v.v, t: 0 }); st.t -= dt;
        const scrX = CP.R.sx ? CP.R.sx(v.x - v.len / 2) : 0, onScr = scrX > -50 && scrX < CP.R.W + 50;
        // pass-by: a moving vehicle crossing the middle of the view
        const mid = CP.R.W / 2; if (onScr && v.v > 6 && st.side != null && Math.sign(scrX - mid) !== st.side && st.t <= 0) { this.swoosh(true); st.t = 2; }
        st.side = Math.sign(scrX - mid);
        // brake squeal on a hard stop, engine start when pulling away from rest
        if (onScr && v.a < -3.4 && v.v > 3 && st.t <= 0 && Math.random() < 0.4) { this.tone('sine', 2600 + Math.random() * 500, 0.35, 0.006, undefined, 2200, this.pan(v.x)); st.t = 3; }
        if (onScr && st.v < 0.2 && v.v > 0.6 && st.t <= 0) { this.tone('sawtooth', 55, 0.8, 0.02, undefined, 95, this.pan(v.x)); this.burst(0.5, 0.02, 220, 1, undefined, 'lowpass', this.pan(v.x)); st.t = 2; }
        st.v = v.v;
      }
      // occasional wind gust and distant city life
      this.gustT = (this.gustT || 6) - dt; if (this.gustT <= 0) { this.gustT = 8 + Math.random() * 14; const c = this.ctx, tt = c.currentTime; const src = c.createBufferSource(); src.buffer = this.pink; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.8; const g = c.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.03, tt + 1.4); g.gain.exponentialRampToValueAtTime(0.0001, tt + 3.6); src.connect(f); f.connect(g); g.connect(this.amb); src.start(tt, Math.random()); src.stop(tt + 3.8); }
    }
    if (this.sirenNode && this.sirenNode.p && inGame) { const a = s.vehicles.find(v => v.special === 'ambulance'); if (a) this.sirenNode.p.pan.setTargetAtTime(this.pan(a.x), t, 0.1); }
    if (inGame) { const o = s.officer; if (o.moving) { this.stepT = (this.stepT || 0) - dt * (o.pending ? 1.7 : 1); if (this.stepT <= 0) { this.stepT = 0.36; this.step(); } } }
  },
  stopAll() { if (this.sirenNode) { try { this.sirenNode.o.stop(); this.sirenNode.lfo.stop(); } catch (e) { } this.sirenNode = null; } }
};
;(window.CP_FILES = window.CP_FILES || {})['15_audio'] = '2.3.3';
