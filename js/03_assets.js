/* Asset loader + sprite helpers. Uses measured source rectangles from manifest.json (window.CHECKPOINT_ASSETS). */
CP.A = {
  M: null, img: {}, ok: false, errors: [],
  /* horizontal body-centre anchors measured from the officer/civilian frames (torso centroid), so frames do not jitter */
  bodyAnchor: {
    officer_walk_0: .459, officer_walk_1: .506, officer_walk_2: .592, officer_walk_3: .424, officer_walk_4: .484, officer_walk_5: .414, officer_walk_6: .618, officer_walk_7: .406,
    officer_idle: .479, officer_raise: .353, officer_stop: .368, officer_lower: .283, officer_wave: .372, officer_radio: .508, officer_documents: .424, officer_flashlight: .306
  },
  load(onProgress) {
    const M = this.M = window.CHECKPOINT_ASSETS;
    if (!M) return Promise.reject(new Error('manifest.js'));
    const embed = window.CP_EMBED || {};
    const ids = Object.keys(M.sheets);
    let done = 0;
    return Promise.all(ids.map(id => new Promise(res => {
      const im = new Image();
      im.onload = () => { this.img[id] = im; done++; onProgress && onProgress(done / ids.length, M.sheets[id].file); res(); };
      im.onerror = () => { this.errors.push(M.sheets[id].file); done++; onProgress && onProgress(done / ids.length, M.sheets[id].file); res(); };
      im.src = embed[id] || M.sheets[id].file;
    }))).then(() => { this.ok = this.errors.length === 0; return this.errors; });
  },
  rect(id) { return this.M.sprites[id].rect; },
  /* draw sprite id with top-left at x,y and given width (height keeps aspect unless given) */
  draw(ctx, id, x, y, w, h) {
    const s = this.M.sprites[id]; const im = this.img[s.sheet]; if (!im) return;
    const [sx, sy, sw, sh] = s.rect; h = h ?? w * sh / sw;
    ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
  },
  /* draw grounded by bottom, horizontally anchored at ax (0..1) of width; scale = pixels per source pixel */
  drawGroundedScale(ctx, id, cx, ground, scale, flip, ax) {
    const s = this.M.sprites[id]; const im = this.img[s.sheet]; if (!im) return;
    const [sx, sy, sw, sh] = s.rect; const w = sw * scale, h = sh * scale;
    ax = ax ?? (s.ax ?? this.bodyAnchor[id] ?? 0.5);
    ctx.save(); ctx.translate(cx, ground);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, sx, sy, sw, sh, -ax * w, -h, w, h);
    ctx.restore();
  },
  groundedH(ctx, id, cx, ground, height) {
    const r = this.rect(id); const w = height * r[2] / r[3];
    this.draw(ctx, id, cx - w / 2, ground - height, w, height);
    return w;
  },
  /* compute vehicle drawing geometry for a vehicle type at ppm */
  vgeom(type, ppm) {
    const v = this.M.vehicles[type], r = this.M.sprites[v.body].rect;
    const width = v.lengthMetres * ppm, k = width / r[2];
    const maxAxle = Math.max(...v.axles.map(a => a[1]));
    const bodyBottom = (maxAxle + v.wheelRadiusSource) * k; // from body top to ground
    return { v, r, width, k, height: r[3] * k, bodyBottom, wheelR: v.wheelRadiusSource * k };
  },
  /* draw vehicle (wheels behind body). left = rear x px, ground px. body transform: pitch (rad) about chassis centre, heave px */
  drawVehicle(ctx, type, left, ground, ppm, wheelAngle, pitch, heave, alpha) {
    const g = this.vgeom(type, ppm); const v = g.v;
    const top = ground - g.bodyBottom;
    const im = this.img[this.M.sprites[v.wheel].sheet];
    if (alpha != null) ctx.globalAlpha = alpha;
    // dark wheel wells so the road never shows through the arches behind the tyres
    ctx.save(); ctx.beginPath(); ctx.rect(left - 2, top - 2, g.width + 4, g.bodyBottom + 2); ctx.clip();
    for (const [ax, ay] of v.axles) {
      const wx = left + ax * g.k, wy = top + ay * g.k, wr = g.wheelR * 1.14;
      const wg = ctx.createRadialGradient(wx, wy - wr * 0.25, wr * 0.2, wx, wy, wr);
      wg.addColorStop(0, '#000'); wg.addColorStop(0.75, '#0a0a0c'); wg.addColorStop(1, '#141417');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    for (const [ax, ay] of v.axles) {
      ctx.save(); ctx.translate(left + ax * g.k, top + ay * g.k); ctx.rotate(wheelAngle);
      const [sx, sy, sw, sh] = this.M.sprites[v.wheel].rect;
      ctx.drawImage(im, sx, sy, sw, sh, -g.wheelR, -g.wheelR, 2 * g.wheelR, 2 * g.wheelR);
      ctx.restore();
    }
    ctx.save();
    const cx = left + g.width / 2, cy = top + g.height * 0.8;
    ctx.translate(cx, cy + (heave || 0)); ctx.rotate(pitch || 0); ctx.translate(-cx, -cy);
    this.draw(ctx, v.body, left, top, g.width);
    ctx.restore();
    if (alpha != null) ctx.globalAlpha = 1;
    return g;
  },
  /* small standalone canvas thumbnail of a sprite (for DOM cards) */
  thumb(id, w, h, pad) {
    const c = document.createElement('canvas'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr); pad = pad ?? 4;
    const r = this.rect(id); const k = Math.min((w - 2 * pad) / r[2], (h - 2 * pad) / r[3]);
    this.draw(ctx, id, (w - r[2] * k) / 2, (h - r[3] * k) / 2, r[2] * k, r[3] * k);
    return c;
  },
  vehicleThumb(type, w, h) {
    const c = document.createElement('canvas'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const g = this.vgeom(type, 1); const k = Math.min((w - 8) / g.width, (h - 8) / (g.bodyBottom + 2));
    this.drawVehicle(ctx, type, (w - g.width * k) / 2, h - 4, k, 0, 0, 0);
    return c;
  },
  /* portrait into a canvas element */
  portrait(n, size) { return this.thumb('portrait_' + String(n).padStart(2, '0'), size, size, 0); }
};
;(window.CP_FILES = window.CP_FILES || {})['03_assets'] = '1.8.0';
