/* Brand: the game's 3D logo and the studio intro (EGYSeal — by Hossam Hegazi).
   Everything is vector + CSS 3D, so it scales to any screen without extra image files. */
CP.addStrings({
  brand_tag: ['محاكاة كمين مصري', 'AN EGYPTIAN CHECKPOINT SIM'], brand_by: ['تطوير حسام حجازي', 'by Hossam Hegazi'],
  brand_studio: ['إيجي سيل', 'EGYSEAL'], brand_sub: ['ألعاب ومحاكاة', 'GAMES & SIMULATIONS'], brand_skip: ['تخطي', 'Skip']
});
CP.Brand = {};

/* ---------- shared gold / metal defs ---------- */
CP.Brand.defs = (id) => `
  <linearGradient id="g_${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#fff6d5"/><stop offset=".18" stop-color="#f7d888"/><stop offset=".42" stop-color="#d9a233"/>
    <stop offset=".58" stop-color="#8a5f14"/><stop offset=".74" stop-color="#e8c55f"/><stop offset="1" stop-color="#7a4f0e"/>
  </linearGradient>
  <linearGradient id="s_${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".85"/><stop offset=".55" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="r_${id}" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#1d2a44"/><stop offset="1" stop-color="#070b14"/></radialGradient>
  <filter id="b_${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

/* ---------- game emblem: shield + boom barrier + night star ---------- */
CP.Brand.uid = 0;
CP.Brand.emblem = function (size) {
  const u = 'e' + (++CP.Brand.uid);
  return `<svg class="emb" viewBox="0 0 120 130" width="${size}" height="${size * 130 / 120}" aria-hidden="true"><defs>${CP.Brand.defs(u)}</defs>
    <path class="shield" d="M60 4 L112 22 V64 C112 96 90 116 60 126 C30 116 8 96 8 64 V22 Z" fill="url(#r_${u})" stroke="url(#g_${u})" stroke-width="3.2"/>
    <path d="M60 11 L105 27 V64 C105 92 86 110 60 119 C34 110 15 92 15 64 V27 Z" fill="none" stroke="url(#g_${u})" stroke-width="1" opacity=".55"/>
    <g class="barrier">
      <rect x="20" y="74" width="80" height="9" rx="3" fill="url(#g_${u})"/>
      <rect x="27" y="74" width="12" height="9" fill="#9d2b1f" opacity=".92"/><rect x="51" y="74" width="12" height="9" fill="#9d2b1f" opacity=".92"/><rect x="75" y="74" width="12" height="9" fill="#9d2b1f" opacity=".92"/>
      <rect x="86" y="70" width="14" height="30" rx="4" fill="url(#g_${u})" opacity=".9"/>
    </g>
    <g class="rays" opacity=".85"><path d="M60 26 L66 44 L85 44 L70 55 L76 73 L60 62 L44 73 L50 55 L35 44 L54 44 Z" fill="url(#g_${u})"/></g>
    <path class="sweep" d="M8 22 L112 22 V126 H8 Z" fill="url(#s_${u})" opacity=".28"/>
  </svg>`;
};
/* ---------- the game logo (3D extruded wordmark + emblem) ---------- */
CP.Brand.logo = function (opts) {
  opts = opts || {}; const size = opts.size || 1;
  const LI = CP.A && CP.A.img && CP.A.img.logo_checkpoint;
  if (LI && LI.src) {
    const d = document.createElement('div'); d.className = 'logoimg'; d.style.setProperty('--ls', size);
    d.innerHTML = `<div class="lglow"></div><img src="${LI.src}" alt="كمين — Checkpoint"><i class="lshine" style="-webkit-mask-image:url(${LI.src});mask-image:url(${LI.src})"></i><img class="lrefl" src="${LI.src}" alt="">`;
    if (!opts.static) { const mv = e => { const r = d.getBoundingClientRect(); d.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 10).toFixed(2) + 'deg'); d.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg'); }; window.addEventListener('pointermove', mv); }
    return d;
  }
  const el = document.createElement('div');
  el.className = 'logo3d' + (opts.compact ? ' compact' : '');
  el.style.setProperty('--ls', size);
  el.innerHTML = `<div class="lemb">${CP.Brand.emblem(96)}</div>
    <div class="lwords">
      <div class="lar" data-txt="كمين"><span>كمين</span></div>
      <div class="lar2" data-txt="وردية ليل"><span>وردية ليل</span></div>
      <div class="len">CHECKPOINT: NIGHT SHIFT</div>
      ${opts.tag === false ? '' : `<div class="ltag">${CP.t('brand_tag')}</div>`}
    </div><i class="lshine"></i>`;
  if (!opts.static) {
    const move = e => { const r = el.getBoundingClientRect(); const mx = (e.clientX - r.left) / r.width - .5, my = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--rx', (-my * 12).toFixed(2) + 'deg'); el.style.setProperty('--ry', (mx * 16).toFixed(2) + 'deg'); };
    window.addEventListener('pointermove', move); el._off = () => window.removeEventListener('pointermove', move);
  }
  return el;
};

/* ---------- studio seal: scarab-wing ring with an EGY monogram ---------- */
CP.Brand.seal = function () {
  const u = 's' + (++CP.Brand.uid);
  const ticks = Array.from({ length: 36 }, (_, i) => `<rect x="99" y="10" width="2" height="${i % 3 ? 5 : 9}" fill="url(#g_${u})" opacity=".8" transform="rotate(${i * 10} 100 100)"/>`).join('');
  return `<svg class="seal" viewBox="0 0 200 200" aria-hidden="true"><defs>${CP.Brand.defs(u)}</defs>
    <circle cx="100" cy="100" r="96" fill="url(#r_${u})" stroke="url(#g_${u})" stroke-width="2.5"/>
    <circle class="ring" cx="100" cy="100" r="86" fill="none" stroke="url(#g_${u})" stroke-width="3" stroke-dasharray="540" stroke-dashoffset="540"/>
    <g class="ticks">${ticks}</g>
    <g class="wings" fill="url(#g_${u})">
      <path d="M100 108 C76 96 52 92 30 100 C52 104 70 112 86 124 C92 118 96 113 100 108 Z"/>
      <path d="M100 108 C124 96 148 92 170 100 C148 104 130 112 114 124 C108 118 104 113 100 108 Z"/>
    </g>
    <path class="eye" d="M62 78 C78 60 122 60 138 78 C122 96 78 96 62 78 Z M100 70 a9 9 0 1 0 .1 0" fill="url(#g_${u})" opacity=".95"/>
    <path class="beam" d="M100 100 L18 168 L182 168 Z" fill="url(#s_${u})" opacity=".12"/>
    <path class="sweep2" d="M4 4 H196 V196 H4 Z" fill="url(#s_${u})" opacity=".22"/>
  </svg>`;
};
/* ---------- AAA-style studio intro, ~3.2 s, skippable ---------- */
CP.Brand.intro = function (done) {
  if (CP.S.reducedFx) { done(); return; }
  const w = document.createElement('div'); w.className = 'intro';
  const EI = CP.A && CP.A.img && CP.A.img.logo_egyseal;
  w.innerHTML = `<div class="istage">
      <div class="glow"></div>
      <div class="sealwrap${EI && EI.src ? ' img' : ''}">${EI && EI.src ? `<img src="${EI.src}" alt="EGY SEAL">` : CP.Brand.seal()}</div>
      ${EI && EI.src ? '' : '<div class="studio"><span>E</span><span>G</span><span>Y</span><span class="sp"></span><span>S</span><span>E</span><span>A</span><span>L</span></div>'}
      <div class="byline">${CP.t('brand_by')}</div>
      <div class="substudio">${CP.t('brand_sub')}</div>
      <div class="lightbar"></div>
    </div><button class="skip">${CP.t('brand_skip')} ⏭</button>`;
  const parts = document.createElement('div'); parts.className = 'dustlayer';
  for (let i = 0; i < 26; i++) { const d = document.createElement('i'); d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${(-Math.random() * 8).toFixed(2)}s;animation-duration:${(6 + Math.random() * 8).toFixed(2)}s;opacity:${(0.15 + Math.random() * 0.5).toFixed(2)}`; parts.appendChild(d); }
  w.querySelector('.istage').appendChild(parts);
  document.body.appendChild(w);
  let finished = false;
  const finish = () => { if (finished) return; finished = true; w.classList.add('out'); setTimeout(() => { w.remove(); done(); }, 620); };
  w.querySelector('.skip').addEventListener('click', finish);
  w.addEventListener('click', finish); window.addEventListener('keydown', finish, { once: true });
  // a short synthesised swell, if audio is already unlocked
  setTimeout(() => { try { if (CP.Audio.ok) { CP.Audio.tone('sine', 110, 2.4, 0.05, undefined, 220); CP.Audio.tone('triangle', 330, 1.6, 0.03); CP.Audio.burst(1.6, 0.05, 5200, 0.6, undefined, 'highpass'); setTimeout(() => CP.Audio.chime('great'), 900); } } catch (e) { } }, 250);
  setTimeout(finish, 3200);
};
;(window.CP_FILES = window.CP_FILES || {})['22_brand'] = '1.8.0';
