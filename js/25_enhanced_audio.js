/* Enhanced Audio System: Realistic vehicle sounds, calming action sequences, 
   dynamic mixing, spatial positioning, and premium audio feedback. */

CP.EnhancedAudio = {
  // Vehicle engine characteristics
  vehicleSounds: {
    taxi: { idle: 800, rev: 2200, accel: 0.8, brake: 400 },
    bus: { idle: 600, rev: 1800, accel: 0.6, brake: 350 },
    truck: { idle: 500, rev: 1600, accel: 0.5, brake: 300 },
    microbus: { idle: 750, rev: 2100, accel: 0.75, brake: 380 },
    suv: { idle: 900, rev: 2400, accel: 0.85, brake: 420 },
    luxury: { idle: 950, rev: 2500, accel: 0.9, brake: 430 },
    emergency: { idle: 1000, rev: 2600, siren: true }
  },

  // Action sound profiles - calming and professional
  actionSounds: {
    stop: { freq: 400, duration: 0.4, peak: 0.25, type: 'sine' },
    wave: { freq: 600, duration: 0.3, peak: 0.2, type: 'sine' },
    radio: { freq: 800, duration: 0.2, peak: 0.15, type: 'sine' },
    confirm: { freq: 1000, duration: 0.25, peak: 0.2, type: 'sine' },
    error: { freq: 300, duration: 0.4, peak: 0.2, type: 'sine' },
    success: { freq: 1200, duration: 0.35, peak: 0.25, type: 'sine' },
    checkbox: { freq: 1400, duration: 0.15, peak: 0.15, type: 'sine' },
    notification: { freq: 2000, duration: 0.2, peak: 0.18, type: 'sine' }
  },

  // Environmental sounds
  ambience: {
    traffic_light: { freq: 1800, duration: 0.5, peak: 0.15 },
    whistle: { freq: 2500, duration: 0.3, peak: 0.2 },
    clipboard: { freq: 1200, duration: 0.2, peak: 0.15 },
    footsteps: { freq: 400, duration: 0.1, peak: 0.1 }
  },

  init() {
    this.vehicleStates = new Map();
    this.activeEffects = [];
    this.masterVolume = 0.7;
    this.calibrate();
  },

  // Calibrate audio levels for balance
  calibrate() {
    this.levels = {
      vehicle: 0.6,
      action: 0.4,
      ambience: 0.3,
      alert: 0.5,
      music: 0.5
    };
  },

  // Generate realistic vehicle engine sound
  vehicleEngine(vehicleType, acceleration, pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const config = this.vehicleSounds[vehicleType] || this.vehicleSounds.taxi;
    const idleFreq = config.idle;
    const revFreq = config.rev;
    
    // Interpolate based on acceleration
    const freq = CP.lerp(idleFreq, revFreq, Math.abs(acceleration));
    const duration = 0.15;
    const peak = this.levels.vehicle * (0.1 + Math.abs(acceleration) * 0.5);

    CP.Audio.tone('sine', freq, duration, peak, undefined, undefined, pan);

    // Add engine roughness (subtle brown noise)
    if (acceleration > 0.5) {
      CP.Audio.burst(duration * 0.8, peak * 0.3, 400, 2, undefined, 'bandpass', pan, CP.Audio.brown);
    }
  },

  // Generate brake sound
  vehicleBrake(intensity, pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const duration = Math.min(0.5, intensity * 0.6);
    const freq = 200 + intensity * 400;
    const peak = this.levels.vehicle * intensity * 0.4;

    // Brake squeal (bandpass noise)
    CP.Audio.burst(duration, peak, freq, 3, undefined, 'bandpass', pan, CP.Audio.brown);

    // Low frequency rumble
    CP.Audio.tone('sine', 100, duration, peak * 0.5, undefined, undefined, pan);
  },

  // Horn with realistic profile
  horn(type = 'standard', pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const configs = {
      standard: { freq: 600, duration: 0.3, peak: 0.35 },
      taxi: { freq: 700, duration: 0.25, peak: 0.3 },
      truck: { freq: 450, duration: 0.4, peak: 0.4 },
      wedding: { freq: 800, duration: 0.4, peak: 0.35 }
    };

    const cfg = configs[type] || configs.standard;
    CP.Audio.tone('sine', cfg.freq, cfg.duration, this.levels.vehicle * cfg.peak, undefined, undefined, pan);

    // Add harmonics
    CP.Audio.tone('sine', cfg.freq * 1.5, cfg.duration * 0.8, this.levels.vehicle * cfg.peak * 0.6, undefined, undefined, pan);
  },

  // Action sounds - professional and clear
  actionSound(actionType, subType = null, pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const cfg = this.actionSounds[actionType];
    if (!cfg) return;

    const peak = this.levels.action * cfg.peak;
    CP.Audio.tone(cfg.type, cfg.freq, cfg.duration, peak, undefined, undefined, pan);

    // Add a subtle second tone for depth
    const harmonic = cfg.freq * 1.3;
    CP.Audio.tone(cfg.type, harmonic, cfg.duration * 0.7, peak * 0.4, undefined, undefined, pan);
  },

  // Siren with realistic warble
  siren(intensity, duration, pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const t0 = CP.Audio.ctx.currentTime;
    const baseFreq = 600 + intensity * 400;
    const peak = this.levels.alert * 0.5;

    // Main siren tone with pitch modulation
    const osc = CP.Audio.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t0);
    
    // Warble effect (3Hz modulation)
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, t0 + 0.15);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.85, t0 + 0.3);

    CP.Audio.env(osc, t0, 0.05, peak, duration, CP.Audio.out(pan));
    osc.start(t0);
    osc.stop(t0 + duration + 0.1);
  },

  // Calming success/confirmation sequence
  successSequence(pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const t0 = CP.Audio.ctx.currentTime;
    const times = [t0, t0 + 0.15, t0 + 0.3];
    const freqs = [800, 1000, 1200];
    
    times.forEach((time, i) => {
      CP.Audio.tone('sine', freqs[i], 0.15, this.levels.action * 0.25, time, undefined, pan);
    });
  },

  // Alert/warning sequence
  alertSequence(pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const t0 = CP.Audio.ctx.currentTime;
    // Lower frequency for caution
    CP.Audio.tone('sine', 400, 0.2, this.levels.alert * 0.3, t0, undefined, pan);
    CP.Audio.tone('sine', 400, 0.2, this.levels.alert * 0.3, t0 + 0.25, undefined, pan);
  },

  // Document/clipboard sound
  documentSound(pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const cfg = this.ambience.clipboard;
    CP.Audio.burst(cfg.duration, this.levels.ambience * cfg.peak, cfg.freq, 2, undefined, 'highpass', pan, CP.Audio.white);
  },

  // Radio communication sound
  radioComm(pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const t0 = CP.Audio.ctx.currentTime;
    const duration = 0.3;

    // Radio click (frequency sweep down)
    const osc = CP.Audio.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t0);
    osc.frequency.exponentialRampToValueAtTime(800, t0 + duration);

    CP.Audio.env(osc, t0, 0.01, this.levels.action * 0.2, duration, CP.Audio.out(pan));
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  },

  // Footstep sound
  footstep(surface = 'concrete', pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const surfaces = {
      concrete: { freq: 300, q: 1.5 },
      gravel: { freq: 250, q: 2 },
      floor: { freq: 350, q: 1.2 },
      grass: { freq: 200, q: 1.8 }
    };

    const surf = surfaces[surface] || surfaces.concrete;
    CP.Audio.burst(0.1, this.levels.ambience * 0.15, surf.freq, surf.q, undefined, 'bandpass', pan, CP.Audio.brown);
  },

  // Traffic light beep sound (pleasant bell-like)
  trafficLight(pan) {
    if (!CP.Audio || !CP.Audio.ok) return;

    const t0 = CP.Audio.ctx.currentTime;
    // Two-tone bell effect
    CP.Audio.tone('sine', 1200, 0.3, this.levels.ambience * 0.2, t0, undefined, pan);
    CP.Audio.tone('sine', 1600, 0.25, this.levels.ambience * 0.15, t0 + 0.05, undefined, pan);
  },

  // Update vehicle sounds based on movement
  updateVehicleSound(vehicleId, vehicleType, velocity, isAccelerating, isBraking, pan) {
    if (!vehicleType || !velocity) return;

    // Generate appropriate engine sound
    if (Math.abs(velocity) > 0.1) {
      const acceleration = isAccelerating ? 0.8 : isBraking ? -0.8 : 0.3;
      this.vehicleEngine(vehicleType, acceleration, pan);
    }

    // Brake sound
    if (isBraking && Math.abs(velocity) > 0.2) {
      this.vehicleBrake(Math.abs(velocity), pan);
    }
  },

  // Master volume control
  setMasterVolume(level) {
    this.masterVolume = CP.clamp(level, 0, 1);
    if (CP.Audio && CP.Audio.apply) {
      CP.Audio.apply();
    }
  },

  // Get current master volume
  getMasterVolume() {
    return this.masterVolume;
  }
};

// Integration with existing audio system
if (CP.Audio) {
  CP.EnhancedAudio.init();
}

// Export
(window.CP_FILES = window.CP_FILES || {})['25_enhanced_audio'] = '1.0.0';
