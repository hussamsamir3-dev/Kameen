/* COMPLETE OFFICER INTEGRATION - Player officer + Smart AI officers with new sprites and situational behavior */

CP.OfficerSystem = {
  
  /* Configuration */
  config: {
    playerUniform: 'navy',
    aiUniforms: ['navy', 'white'],
    zoomScale: true,
    situationalAwareness: true,
    patrolInterval: { min: 10, max: 20 },
    actionChangeInterval: { min: 5, max: 8 }
  },
  
  /* Loaded officer data */
  officers: {
    player: null,
    ai: []
  },
  
  /**
   * Initialize officers for location
   */
  init(loc) {
    const locations = {
      cairo: [
        { x: 8.5, row: 0.15 },
        { x: 20.1, row: 0.08 }
      ],
      alex: [
        { x: 9.2, row: 0.18 },
        { x: 19.5, row: 0.10 }
      ],
      sinai: [
        { x: 8.8, row: 0.16 },
        { x: 20.0, row: 0.09 }
      ],
      hurghada: [
        { x: 9.1, row: 0.17 },
        { x: 20.2, row: 0.10 }
      ],
      luxor: [
        { x: 8.9, row: 0.14 },
        { x: 19.8, row: 0.08 }
      ],
      aswan: [
        { x: 9.0, row: 0.18 },
        { x: 19.9, row: 0.11 }
      ],
      desert: [
        { x: 8.7, row: 0.15 },
        { x: 20.3, row: 0.09 }
      ]
    };
    
    const positions = locations[loc] || locations.cairo;
    
    // Player officer (navy, center position)
    this.officers.player = {
      id: 'player',
      x: 15.2,
      row: 0.1,
      uniform: 'navy',
      action: 'idle',
      moving: false,
      isPlayer: true,
      walkT: 0,
      actionT: 0
    };
    
    // AI officers (patrol other positions)
    this.officers.ai = positions.map((pos, i) => ({
      id: 'ai_' + i,
      x: pos.x,
      row: pos.row,
      uniform: this.config.aiUniforms[i % this.config.aiUniforms.length],
      action: Math.random() > 0.5 ? 'idle' : 'watch',
      moving: false,
      isPlayer: false,
      walkT: 0,
      actionT: 0,
      nextPatrol: Math.random() * 20,
      nextActionChange: Math.random() * 8,
      busyCount: 0
    }));
  },
  
  /**
   * Update officers each frame
   */
  update(dt, shift) {
    if (!shift) return;
    
    // Update AI officers with situational awareness
    const busyVehicles = shift.vehicles.filter(v => v.caseId && !shift.cases[v.caseId].res);
    
    for (const officer of this.officers.ai) {
      officer.nextPatrol -= dt;
      officer.nextActionChange -= dt;
      
      // Patrol: move to new position periodically
      if (officer.nextPatrol <= 0) {
        officer.nextPatrol = this.config.patrolInterval.min + Math.random() * (this.config.patrolInterval.max - this.config.patrolInterval.min);
        officer.x += (Math.random() - 0.5) * 1.0; // ±0.5 movement
        officer.x = Math.max(8, Math.min(21, officer.x)); // Clamp to checkpoint area
        officer.moving = Math.random() > 0.7;
        if (officer.moving) officer.walkT = 0;
      }
      
      // Action change: switch between idle, watch, wave based on situation
      if (officer.nextActionChange <= 0) {
        officer.nextActionChange = this.config.actionChangeInterval.min + Math.random() * (this.config.actionChangeInterval.max - this.config.actionChangeInterval.min);
        
        if (this.config.situationalAwareness && busyVehicles.length > 0) {
          // Alert when vehicles present
          officer.action = Math.random() > 0.5 ? 'watch' : 'idle';
        } else {
          // Relaxed when no vehicles
          officer.action = ['idle', 'watch', 'wave'][Math.floor(Math.random() * 3)];
        }
      }
      
      // Update walking animation
      if (officer.moving) {
        officer.walkT += dt;
        if (officer.walkT > 2) { // Stop after 2 seconds of walking
          officer.moving = false;
        }
      }
      
      officer.actionT += dt;
    }
  },
  
  /**
   * Get frame ID for officer sprite
   */
  getFrame(officer) {
    const uniform = officer.uniform === 'white' ? 'w' : 'n';
    
    if (officer.moving) {
      // Walking: cycle through 8 walk frames
      const frame = Math.floor((officer.walkT * 8) % 8);
      return 'officer_' + uniform + '_walk_' + String(frame).padStart(2, '0');
    }
    
    // Idle: cycle through 8 idle frames
    const frame = Math.floor((officer.actionT * 7) % 8);
    return 'officer_' + uniform + '_idle_' + String(frame).padStart(2, '0');
  },
  
  /**
   * Render AI officers to canvas
   */
  renderAI(ctx, R, ppm) {
    if (!this.officers.ai) return;
    
    const A = CP.A;
    
    for (const officer of this.officers.ai) {
      const frameId = this.getFrame(officer);
      const spriteRect = A.rect(frameId);
      
      if (!spriteRect) continue; // Skip if frame not found
      
      const sx = R.sx(officer.x);
      const sy = R.sy(R.actorY(officer.row));
      
      // Smart scaling: handle zoom levels properly
      // Use ppm (pixels per meter) to scale with world zoom
      const scale = ppm * 0.0015; // Adjust multiplier based on desired size
      
      A.drawGroundedScale(ctx, frameId, sx, sy, scale, false, 0.5);
    }
  }
};

/**
 * Hook into shift initialization
 */
const origNewShift = CP.newShift;
CP.newShift = function(loc) {
  const result = origNewShift.call(this, loc);
  if (CP.OfficerSystem) CP.OfficerSystem.init(loc);
  return result;
};

/**
 * Hook into main update loop
 */
const origMainStep = (CP.Main?.step);
if (CP.Main) {
  CP.Main.step = function(dt) {
    if (origMainStep) origMainStep.call(this, dt);
    if (CP.OfficerSystem && CP.G?.shift) {
      CP.OfficerSystem.update(dt, CP.G.shift);
    }
  };
}

;(window.CP_FILES = window.CP_FILES || {})['23_officer_integration'] = '1.0.0';
