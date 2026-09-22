/* Enhanced Repair Interaction System: Premium visual feedback for repairs, gates, and maintenance.
   Hover states, animated progress indicators, contextual tooltips, and elegant completion effects. */

CP.RepairUI = {
  // Visual states for repair items
  states: {
    OK: 'ok',
    BROKEN: 'broken',
    REPAIRING: 'repairing',
    COMPLETED: 'completed',
    UNAVAILABLE: 'unavailable'
  },

  // Repair items configuration
  items: {
    gate: {
      name: { ar: 'البوابة', en: 'Gate Barrier' },
      duration: 6,
      icon: 'gate_barrier',
      sound: 'gate_motor',
      cost: 2000,
      description: { ar: 'أصلح البوابة المكسورة', en: 'Repair the broken barrier gate' }
    },
    generator: {
      name: { ar: 'المولد', en: 'Generator' },
      duration: 4,
      icon: 'generator',
      sound: 'engine_start',
      cost: 3000,
      description: { ar: 'أصلح المولد الكهربائي', en: 'Repair the electrical generator' }
    },
    barrier_arm: {
      name: { ar: 'ذراع الحاجز', en: 'Barrier Arm' },
      duration: 5,
      icon: 'barrier',
      sound: 'mechanical',
      cost: 1500,
      description: { ar: 'أصلح ذراع الحاجز', en: 'Repair the barrier arm' }
    },
    floodlight: {
      name: { ar: 'كشاف', en: 'Floodlight' },
      duration: 3,
      icon: 'light',
      sound: 'electricity',
      cost: 800,
      description: { ar: 'أصلح كشاف الإضاءة', en: 'Repair the floodlight' }
    },
    checkpoint_table: {
      name: { ar: 'طاولة الفحص', en: 'Inspection Table' },
      duration: 2,
      icon: 'table',
      sound: 'cloth',
      cost: 500,
      description: { ar: 'نظف وأعد ترتيب طاولة الفحص', en: 'Clean and organize inspection table' }
    }
  },

  // Interactive repair elements on each map
  mapElements: {
    cairo: [
      { id: 'cairo_gate', type: 'gate', x: 30, y: 4.3, status: 'ok' },
      { id: 'cairo_gen', type: 'generator', x: 28, y: 3.5, status: 'ok' },
      { id: 'cairo_light1', type: 'floodlight', x: 8, y: 5.2, status: 'ok' },
      { id: 'cairo_light2', type: 'floodlight', x: 16, y: 5.2, status: 'ok' },
      { id: 'cairo_table', type: 'checkpoint_table', x: 18, y: 3.9, status: 'ok' }
    ],
    alex: [
      { id: 'alex_gate', type: 'gate', x: 28, y: 4.3, status: 'ok' },
      { id: 'alex_gen', type: 'generator', x: 26, y: 3.5, status: 'ok' },
      { id: 'alex_arm', type: 'barrier_arm', x: 27.5, y: 4.5, status: 'ok' },
      { id: 'alex_light', type: 'floodlight', x: 7, y: 5.0, status: 'ok' }
    ],
    sinai: [
      { id: 'sinai_gate', type: 'gate', x: 29, y: 4.3, status: 'ok' },
      { id: 'sinai_light1', type: 'floodlight', x: 12, y: 5.2, status: 'ok' },
      { id: 'sinai_light2', type: 'floodlight', x: 22, y: 5.2, status: 'ok' }
    ],
    hurghada: [
      { id: 'hg_gate', type: 'gate', x: 27, y: 4.3, status: 'ok' },
      { id: 'hg_light', type: 'floodlight', x: 10, y: 5.0, status: 'ok' }
    ],
    luxor: [
      { id: 'lx_gate', type: 'gate', x: 28, y: 4.3, status: 'ok' },
      { id: 'lx_table', type: 'checkpoint_table', x: 17, y: 3.9, status: 'ok' }
    ],
    aswan: [
      { id: 'aw_gate', type: 'gate', x: 29, y: 4.3, status: 'ok' },
      { id: 'aw_gen', type: 'generator', x: 27, y: 3.5, status: 'ok' }
    ],
    desert: [
      { id: 'desert_gate', type: 'gate', x: 30, y: 4.3, status: 'ok' },
      { id: 'desert_light', type: 'floodlight', x: 6, y: 5.0, status: 'ok' }
    ]
  },

  // Hover state tracking
  hoverState: {
    hoveredElement: null,
    hoveredType: null,
    showTooltip: false,
    tooltipX: 0,
    tooltipY: 0
  },

  // Visual feedback system
  feedbackEffects: {
    active: [],
    
    addRepairEffect(elementId, x, y) {
      this.active.push({
        id: elementId,
        x: x,
        y: y,
        type: 'repair',
        lifetime: 2,
        age: 0,
        scale: 0,
        opacity: 1
      });
    },

    addCompleteEffect(elementId, x, y) {
      // Particle burst on completion
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        this.active.push({
          id: elementId + '_particle_' + i,
          x: x,
          y: y,
          type: 'particle',
          lifetime: 1,
          age: 0,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          opacity: 1
        });
      }
    },

    update(dt) {
      this.active = this.active.filter(effect => {
        effect.age += dt;
        effect.opacity = 1 - (effect.age / effect.lifetime);
        effect.scale = (effect.age / effect.lifetime);
        
        if (effect.type === 'particle') {
          effect.x += effect.vx * dt;
          effect.y += effect.vy * dt;
        }

        return effect.age < effect.lifetime;
      });
    }
  },

  init() {
    this.elements = {};
    this.activeRepairs = new Map();
    this.loadElementStates();
  },

  loadElementStates() {
    const s = CP.G && CP.G.shift;
    if (!s) return;

    const mapElements = this.mapElements[s.loc] || [];
    mapElements.forEach(elem => {
      this.elements[elem.id] = {
        ...elem,
        status: elem.status || this.states.OK,
        repairProgress: 0,
        repairTime: 0
      };
    });
  },

  // Check if cursor is hovering over repair element
  checkHover(mouseX, mouseY) {
    const ppm = CP.R && CP.R.ppm;
    if (!ppm) return null;

    let closest = null;
    let closestDist = 0.5; // 0.5 meter interaction radius

    Object.values(this.elements).forEach(elem => {
      if (elem.status === this.states.BROKEN || elem.status === this.states.OK) {
        const sx = CP.R.sx(elem.x);
        const sy = CP.R.sy(elem.y);
        const dist = Math.hypot(mouseX - sx, mouseY - sy) / ppm;

        if (dist < closestDist) {
          closestDist = dist;
          closest = elem;
        }
      }
    });

    return closest;
  },

  // Show hover indicator and tooltip
  showHoverIndication(element, x, y) {
    if (!element) return;

    this.hoverState.hoveredElement = element;
    this.hoverState.showTooltip = true;
    this.hoverState.tooltipX = x;
    this.hoverState.tooltipY = y;

    // Render hover outline and text
    if (CP.R && CP.R.ctx) {
      const ctx = CP.R.ctx;
      const sx = CP.R.sx(element.x);
      const sy = CP.R.sy(element.y);
      const ppm = CP.R.ppm;

      // Glow effect
      ctx.strokeStyle = element.status === this.states.BROKEN ? 
        'rgba(255, 100, 100, 0.8)' : 'rgba(100, 200, 100, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Status icon
      const statusIcon = element.status === this.states.BROKEN ? '⚠' : '✓';
      ctx.fillStyle = element.status === this.states.BROKEN ? '#ff6464' : '#64ff64';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(statusIcon, sx, sy);
    }
  },

  // Render tooltip
  renderTooltip(x, y, element) {
    if (!CP.R || !CP.R.ctx || !element) return;

    const ctx = CP.R.ctx;
    const config = this.items[element.type];
    if (!config) return;

    const text = element.status === this.states.BROKEN ? 
      `Click to repair: ${config.name.en} (${config.duration}s)` :
      `${config.name.en} - OK`;

    const padding = 8;
    const fontSize = 12;
    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;

    // Tooltip background
    ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
    ctx.fillRect(x + 10, y - boxHeight - 10, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = element.status === this.states.BROKEN ? '#ff6464' : '#64ff64';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y - boxHeight - 10, boxWidth, boxHeight);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 10 + padding, y - boxHeight / 2 - 10);
  },

  // Start repair on element
  startRepair(elementId, partner = false) {
    const elem = this.elements[elementId];
    if (!elem || elem.status !== this.states.BROKEN) return false;

    const config = this.items[elem.type];
    if (!config) return false;

    // Check resources
    const s = CP.G && CP.G.shift;
    if (s && s.budget < config.cost) {
      if (CP.UI && CP.UI.toast) {
        CP.UI.toast(`Insufficient budget for repair. Need ${config.cost} EGP`, 'warn');
      }
      return false;
    }

    // Deduct cost
    if (s) s.budget -= config.cost;

    // Start repair
    elem.status = this.states.REPAIRING;
    elem.repairProgress = 0;
    elem.repairTime = config.duration;

    this.activeRepairs.set(elementId, {
      startTime: Date.now(),
      duration: config.duration * 1000,
      byPartner: partner,
      config: config
    });

    // Play sound
    if (CP.Audio && config.sound) {
      CP.Audio.burst(config.duration * 0.3, 0.3, 800, 2, undefined, 'highpass');
    }

    // Add visual effect
    this.feedbackEffects.addRepairEffect(elementId, elem.x, elem.y);

    if (CP.UI && CP.UI.toast) {
      CP.UI.toast(`Repairing ${config.name.en}... (${config.duration}s)`, 'info');
    }

    return true;
  },

  // Update active repairs
  update(dt) {
    this.feedbackEffects.update(dt);

    const now = Date.now();
    const completed = [];

    this.activeRepairs.forEach((repair, elementId) => {
      const elem = this.elements[elementId];
      if (!elem) return;

      const elapsed = now - repair.startTime;
      const progress = Math.min(1, elapsed / repair.duration);
      elem.repairProgress = progress;

      if (progress >= 1) {
        elem.status = this.states.COMPLETED;
        elem.repairProgress = 1;
        this.feedbackEffects.addCompleteEffect(elementId, elem.x, elem.y);

        if (CP.Audio) {
          CP.Audio.tone('sine', 800, 0.3, 0.2);
          CP.Audio.tone('sine', 1000, 0.2, 0.15);
        }

        if (CP.UI && CP.UI.toast) {
          CP.UI.toast(`${repair.config.name.en} repaired! ✓`, 'ok');
        }

        completed.push(elementId);

        // Reset after 3 seconds to "OK" state
        setTimeout(() => {
          if (this.elements[elementId]) {
            this.elements[elementId].status = this.states.OK;
          }
        }, 3000);
      }
    });

    completed.forEach(id => this.activeRepairs.delete(id));
  },

  // Get repair progress for rendering
  getRepairProgress(elementId) {
    const elem = this.elements[elementId];
    if (!elem) return null;

    return {
      status: elem.status,
      progress: elem.repairProgress,
      isActive: this.activeRepairs.has(elementId)
    };
  },

  // Render all repair elements
  renderElements() {
    if (!CP.R || !CP.R.ctx) return;

    const ctx = CP.R.ctx;
    const ppm = CP.R.ppm;

    Object.values(this.elements).forEach(elem => {
      const sx = CP.R.sx(elem.x);
      const sy = CP.R.sy(elem.y);
      const size = 20;

      // Base circle
      ctx.fillStyle = elem.status === this.states.BROKEN ? 
        '#ff4444' : elem.status === this.states.OK ? 
        '#44ff44' : elem.status === this.states.REPAIRING ?
        '#ffaa44' : '#888888';

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // Progress ring for repairing items
      if (elem.status === this.states.REPAIRING && elem.repairProgress > 0) {
        ctx.strokeStyle = '#ffff44';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, size + 8, 0, Math.PI * 2 * elem.repairProgress);
        ctx.stroke();
      }

      // Status symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = elem.status === this.states.BROKEN ? '!' : 
                     elem.status === this.states.REPAIRING ? '◐' :
                     elem.status === this.states.COMPLETED ? '✓' : '○';
      ctx.fillText(symbol, sx, sy);
    });
  }
};

// Export
(window.CP_FILES = window.CP_FILES || {})['25_repair_ui'] = '1.0.0';
