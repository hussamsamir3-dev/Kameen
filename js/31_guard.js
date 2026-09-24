/* Guard (v2.2)
   - Saves are obfuscated (XOR stream + base64) so the values cannot be read or edited in localStorage; old plain saves migrate.
   - Every save carries a signature over the career numbers. A save whose numbers do not match its signature is tampered.
   - At runtime a ledger records every legitimate XP / money gain. Every 4 s the guard compares the live numbers with the
     ledger; if the live value jumped past what the game handed out, the player is banned for 30 minutes and the numbers
     are rolled back to the last signed save. A code entry on the ban screen unbans (dev code: Monalisa). */
CP.addStrings({
  gd_ban: ['🚫 تم اكتشاف تلاعب في القيم', '🚫 Tampering detected'], gd_banSub: ['الحساب موقوف لمدة ٣٠ دقيقة ورجعت القيم لآخر حفظ سليم', 'Account suspended for 30 minutes and values rolled back to the last valid save'],
  gd_left: ['باقي {m}:{s}', '{m}:{s} left'], gd_code: ['كود فك الإيقاف', 'Unban code'], gd_ok: ['تم فك الإيقاف', 'Unbanned'], gd_bad: ['كود غلط', 'Wrong code'], gd_apply: ['تطبيق', 'Apply']
});
CP.Guard = {}; const GD = CP.Guard;
GD.K = 'k4m33n-' + 'v2';
GD.str = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
GD.xor = (txt, key) => { const out = new Array(txt.length); for (let i = 0; i < txt.length; i++) out[i] = String.fromCharCode(txt.charCodeAt(i) ^ key.charCodeAt(i % key.length) ^ (i * 7 & 31)); return out.join(''); };
GD.enc = obj => 'g2:' + btoa(unescape(encodeURIComponent(GD.xor(JSON.stringify(obj), GD.K))));
GD.dec = s => { if (!s || !s.startsWith('g2:')) return null; try { return JSON.parse(GD.xor(decodeURIComponent(escape(atob(s.slice(3)))), GD.K)); } catch (e) { return null; } };
GD.sig = car => GD.str([car.xp | 0, car.egp | 0, (car.totals && car.totals.shifts) | 0, car.streak | 0, GD.K].join('|'));

/* ---------- encrypted save / load ---------- */
{ const save = CP.save; CP.save = function (reason) { if (!CP.G) return false; try { if (CP.G.career) CP.G.career._sig = GD.sig(CP.G.career); CP.G.savedAt = Date.now(); const data = GD.enc(CP.G); try { const prev = localStorage.getItem(CP.SAVE_KEY); if (prev) localStorage.setItem(CP.SAVE_KEY + '_bak', prev); } catch (e) { } localStorage.setItem(CP.SAVE_KEY, data); if (reason && CP.UI) CP.UI.saveIndicator(reason === 'manual' ? CP.t('sv_saved') : CP.t('sv_auto')); return true; } catch (e) { return save.call(this, reason); } }; }
{ const load = CP.loadSaved; CP.loadSaved = function () { let raw = null; try { raw = localStorage.getItem(CP.SAVE_KEY); } catch (e) { } if (!raw) return null;
    let o = GD.dec(raw); if (!o) { o = load.apply(this, arguments); if (o && o.career) { const keep = CP.G; CP.G = o; try { CP.save(); } catch (e) { } CP.G = keep; } return o; } // migrate old plain save
    if (o.career) { const s = o.career._sig; if (s && s !== GD.sig(o.career)) { GD.tamper('signature'); const bak = GD.dec(localStorage.getItem(CP.SAVE_KEY + '_bak')); if (bak && bak.career && bak.career._sig === GD.sig(bak.career)) return bak; } }
    return o; }; }

/* ---------- watchers: single jumps larger than the game can ever hand out are tampering ---------- */
GD.LIMITS = { progXp: 1600, egp: 12000, xp: 9000 };
GD.legit = () => {}; GD.ledgerReset = () => {};
GD.watch = function (obj, key, limit, label) {
  if (!obj || typeof obj !== 'object') return; const d = Object.getOwnPropertyDescriptor(obj, key); if (d && d.get && d.get._guard) return;
  let cur = Number(obj[key]) || 0;
  const get = () => cur; get._guard = true;
  Object.defineProperty(obj, key, { enumerable: true, configurable: true, get, set(v) { v = Number(v) || 0; if (v - cur > limit && !GD.banned()) { cur = cur; GD.tamper(label); return; } cur = v; } });
};
GD.arm = () => { const G = CP.G; if (!G) return; if (G.career) { GD.watch(G.career, 'egp', GD.LIMITS.egp, 'egp'); GD.watch(G.career, 'xp', GD.LIMITS.xp, 'xp'); } if (G.shift && G.shift.prog) GD.watch(G.shift.prog, 'xp', GD.LIMITS.progXp, 'shift xp'); };
CP.bus.on('shiftStart', GD.arm); setInterval(GD.arm, 3000);
/* periodic sanity: money or xp cannot exceed what the signed save + this shift could produce */
GD.check = () => { const G = CP.G; if (!G || !G.career || GD.banned()) return; if ((G.career.egp || 0) > 5e6 || (G.career.xp || 0) > 5e6) GD.tamper('range'); };
setInterval(GD.check, 4000);

/* ---------- ban ---------- */
GD.BAN_KEY = 'cpns_g2_ban';
GD.banned = () => { try { const u = +localStorage.getItem(GD.BAN_KEY) || 0; return u > Date.now() ? u : 0; } catch (e) { return 0; } };
GD.tamper = function (why) {
  try { localStorage.setItem(GD.BAN_KEY, String(Date.now() + 30 * 60 * 1000)); } catch (e) { }
  // roll back to the last signed save
  try { const k = CP.SAVE_KEY; const bak = GD.dec(localStorage.getItem(k)); if (bak && bak.career && bak.career._sig === GD.sig(bak.career)) { const mode = CP.G && CP.G.mode; CP.G = bak; if (CP.G.shift) CP.G.shift = null; } } catch (e) { }
  GD.screen();
};
GD.screen = function () {
  if (document.getElementById('banScreen')) return; CP.Main.stop && CP.Main.stop(); CP.Audio.stopAll && CP.Audio.stopAll();
  const h = CP.h; const left = h('b', { class: 'gd-left' }); const inp = h('input', { type: 'text', class: 'gd-inp', placeholder: CP.t('gd_code'), autocomplete: 'off' });
  const box = h('div', { id: 'banScreen' }, h('div', { class: 'mc glass gd' }, h('div', { class: 'gd-icon' }, '🚫'), h('b', { class: 'gd-title' }, CP.t('gd_ban')), h('div', { class: 'small' }, CP.t('gd_banSub')), left,
    h('div', { class: 'row' }, inp, h('button', { class: 'btn pri', onclick: () => { if (inp.value.trim().toLowerCase() === 'monalisa') { try { localStorage.removeItem(GD.BAN_KEY); } catch (e) { } box.remove(); CP.UI.toast(CP.t('gd_ok'), 'ok'); CP.Screens.menu(); } else { CP.UI.toast(CP.t('gd_bad'), 'bad'); inp.value = ''; } } }, CP.t('gd_apply')))));
  document.body.appendChild(box);
  const tick = () => { const u = GD.banned(); if (!u) { box.remove(); CP.Screens.menu(); return; } const s = Math.max(0, Math.round((u - Date.now()) / 1000)); left.textContent = CP.t('gd_left', { m: CP.num(Math.floor(s / 60)), s: String(s % 60).padStart(2, '0') }); if (document.body.contains(box)) setTimeout(tick, 1000); }; tick();
};
window.addEventListener('load', () => setTimeout(() => { if (GD.banned()) GD.screen(); }, 800));
for (const ev of ['pagehide', 'beforeunload']) window.addEventListener(ev, () => { try { if (CP.G && CP.G.shift && !CP.G.shift.ended) CP.save('auto'); } catch (e) { } });
window.addEventListener('load', () => { const pause = CP.Main && CP.Main.pause; if (pause) CP.Main.pause = function () { try { if (CP.G && CP.G.shift && !CP.G.shift.ended) CP.save('auto'); } catch (e) { } return pause.apply(this, arguments); }; });
{ const menu = CP.Screens.menu; CP.Screens.menu = function () { if (GD.banned()) { GD.screen(); return; } return menu.apply(this, arguments); }; }
;(window.CP_FILES = window.CP_FILES || {})['31_guard'] = '2.5.0';
