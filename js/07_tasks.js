/* Timed tasks: every timed action has an ID, owner, duration, completion effect and cancellation rule.
   Tasks live in shift.tasks (serializable). Interruptions pause them; they are never discarded by events. */
CP.Tasks = {
  H: {},            // completion handlers by type (registered by subsystems)
  P: {},            // optional progress-condition predicates by type (return false = paused)
  on(type, fn, cond) { this.H[type] = fn; if (cond) this.P[type] = cond; },
  add(spec) {
    const s = CP.G.shift;
    if (spec.key) { const ex = s.tasks.find(t => t.key === spec.key); if (ex) return ex; }
    const t = Object.assign({ id: 'T' + (s.nextTask++), t: 0, paused: false, rate: 1, data: {}, created: s.t }, spec);
    s.tasks.push(t);
    CP.bus.emit('task', t);
    return t;
  },
  get(id) { return CP.G.shift.tasks.find(t => t.id === id) || null; },
  find(pred) { return CP.G.shift.tasks.find(pred) || null; },
  all(pred) { return CP.G.shift.tasks.filter(pred); },
  byKey(key) { return this.find(t => t.key === key); },
  cancel(id, why) {
    const s = CP.G.shift; const i = s.tasks.findIndex(t => t.id === id);
    if (i < 0) return false;
    const t = s.tasks[i]; s.tasks.splice(i, 1);
    CP.bus.emit('taskCancel', { t, why }); return true;
  },
  progress(t) { return t ? CP.clamp(t.t / t.dur, 0, 1) : 0; },
  remaining(t) { return t ? Math.max(0, t.dur - t.t) : 0; },
  update(dt) {
    const s = CP.G.shift;
    for (const t of s.tasks.slice()) {
      const cond = this.P[t.type];
      const ok = cond ? cond(t) : true;
      t.paused = !ok;
      if (!ok) continue;
      t.t += dt * (t.rate || 1);
      if (t.t >= t.dur) {
        const i = s.tasks.indexOf(t); if (i >= 0) s.tasks.splice(i, 1);
        const h = this.H[t.type];
        try { h && h(t); } catch (e) { console.error('task', t.type, e); }
        CP.bus.emit('taskDone', t);
      }
    }
  }
};
CP.Tasks.on('radio', t => CP.Cases.radioComplete(t));
;(window.CP_FILES = window.CP_FILES || {})['07_tasks'] = '1.9.0';
