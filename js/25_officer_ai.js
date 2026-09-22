/* OFFICER AI SYSTEM - Realistic placement + smart patrol + situational awareness */

CP.Officers = {
  player: null,
  ai: [],
  
  /* Map-specific realistic positions */
  locations: {
    cairo: [
      { x: 8.5, row: 0.15, uniform: 'navy' },
      { x: 20.1, row: 0.08, uniform: 'white' }
    ],
    alex: [
      { x: 9.2, row: 0.18, uniform: 'navy' },
      { x: 19.5, row: 0.10, uniform: 'white' }
    ],
    sinai: [
      { x: 8.8, row: 0.16, uniform: 'navy' },
      { x: 20.0, row: 0.09, uniform: 'white' }
    ],
    hurghada: [
      { x: 9.1, row: 0.17, uniform: 'white' },
      { x: 20.2, row: 0.10, uniform: 'navy' }
    ],
    luxor: [
      { x: 8.9, row: 0.14, uniform: 'navy' },
      { x: 19.8, row: 0.08, uniform: 'white' }
    ],
    aswan: [
      { x: 9.0, row: 0.18, uniform: 'white' },
      { x: 19.9, row: 0.11, uniform: 'navy' }
    ],
    desert: [
      { x: 8.7, row: 0.15, uniform: 'white' },
      { x: 20.3, row: 0.09, uniform: 'navy' }
    ]
  },
  
  init(loc) {
    const positions = this.locations[loc] || this.locations.cairo;
    this.ai = [];
    
    // Player officer - CENTER, NAVY
    this.player = {
      id: 'player',
      x: 15.2,
      row: 0.1,
      uniform: 'navy',
      moving: false,
      walkT: 0,
      idleT: 0,
      isPlayer: true
    };
    
    // AI officers - patrol positions
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      this.ai.push({
        id: 'ai_' + i,
        x: pos.x,
        row: pos.row,
        uniform: pos.uniform,
        moving: false,
        walkT: 0,
        idleT: 0,
        isPlayer: false,
        
        // Patrol behavior
        patrolTimer: Math.random() * 20,
        patrolInterval: 10 + Math.random() * 10,
        
        // Situational behavior
        actionTimer: 0,
        actionInterval: 5 + Math.random() * 8,
        lastAction: 'idle',
        
        // Intelligence
        targetX: pos.x,
        moveSpeed: 0.5
      });
    }
  },
  
  update(dt, shift) {
    if (!shift) return;
    
    const busyVehicles = shift.vehicles.filter(v => v.caseId && !shift.cases[v.caseId].res);
    const isBusy = busyVehicles.length > 0;
    
    // Update AI officers
    for (const officer of this.ai) {
      officer.patrolTimer -= dt;
      officer.actionTimer -= dt;
      
      // Patrol: move to new position
      if (officer.patrolTimer <= 0) {
        officer.patrolTimer = officer.patrolInterval;
        officer.targetX = 8 + Math.random() * 12; // Between 8-20
        officer.moving = true;
        officer.walkT = 0;
      }
      
      // Move towards target
      if (officer.moving) {
        const diff = officer.targetX - officer.x;
        if (Math.abs(diff) > 0.1) {
          officer.x += Math.sign(diff) * officer.moveSpeed * dt;
          officer.walkT += dt;
        } else {
          officer.moving = false;
          officer.walkT = 0;
        }
      }
      
      // Action switching: situational awareness
      if (officer.actionTimer <= 0) {
        officer.actionTimer = officer.actionInterval;
        
        if (isBusy) {
          // Alert when checkpoint busy
          officer.lastAction = Math.random() > 0.5 ? 'watch' : 'idle';
        } else {
          // Relax when quiet
          officer.lastAction = ['idle', 'wave', 'watch'][Math.floor(Math.random() * 3)];
        }
      }
      
      // Update idle animation time
      if (!officer.moving) {
        officer.idleT += dt;
      } else {
        officer.idleT = 0;
      }
    }
  },
  
  /* Get current frame for officer */
  getFrame(officer) {
    if (!CP.OfficerSprites) return 'officer_idle_0';
    
    if (officer.moving) {
      return CP.OfficerSprites.getFrame(officer.uniform, true, officer.walkT);
    }
    return CP.OfficerSprites.getFrame(officer.uniform, false, officer.idleT);
  },
  
  /* Render all AI officers */
  renderAI(ctx, R, ppm) {
    const A = CP.A;
    
    for (const officer of this.ai) {
      const frameId = this.getFrame(officer);
      const sx = R.sx(officer.x);
      const sy = R.sy(R.actorY(officer.row));
      
      // Draw with proper scaling
      const scale = 0.0015 * ppm;
      A.drawGroundedScale(ctx, frameId, sx, sy, scale, false, 0.5);
    }
  }
};

// Hook into shift init
const origNewShift = CP.newShift;
CP.newShift = function(loc) {
  const result = origNewShift.call(this, loc);
  if (CP.Officers) CP.Officers.init(loc);
  return result;
};

;(window.CP_FILES = window.CP_FILES || {})['25_officer_ai'] = '1.0.0';
