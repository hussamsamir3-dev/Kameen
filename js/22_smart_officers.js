/* SMART OFFICER SYSTEM - Player officer + AI officers with realistic behavior */

CP.SmartOfficers = {
  /* Player officer (main) - use new sprite sheet */
  player: {
    x: 15.2,
    row: 0.1,
    uniform: 'navy',
    pose: 'idle',
    isPlayer: true,
    moving: false
  },
  
  /* AI officers - patrol and react */
  ai: [],
  
  init(loc) {
    // Clear previous AI officers
    this.ai = [];
    
    // Create 2-3 AI officers based on location
    const aiCount = 2 + Math.floor(Math.random());
    const aiSpots = {
      cairo: [
        { x: 8.5, row: 0.15, pose: 'watch' },
        { x: 20.1, row: 0.08, pose: 'wave' }
      ],
      alex: [
        { x: 9.2, row: 0.18, pose: 'watch' },
        { x: 19.5, row: 0.10, pose: 'idle' }
      ],
      sinai: [
        { x: 8.8, row: 0.16, pose: 'watch' },
        { x: 20.0, row: 0.09, pose: 'idle' }
      ],
      hurghada: [
        { x: 9.1, row: 0.17, pose: 'wave' },
        { x: 20.2, row: 0.10, pose: 'idle' }
      ],
      luxor: [
        { x: 8.9, row: 0.14, pose: 'watch' },
        { x: 19.8, row: 0.08, pose: 'idle' }
      ],
      aswan: [
        { x: 9.0, row: 0.18, pose: 'watch' },
        { x: 19.9, row: 0.11, pose: 'idle' }
      ],
      desert: [
        { x: 8.7, row: 0.15, pose: 'wave' },
        { x: 20.3, row: 0.09, pose: 'idle' }
      ]
    };
    
    const spots = aiSpots[loc] || aiSpots.cairo;
    for (let i = 0; i < Math.min(aiCount, spots.length); i++) {
      const spot = spots[i];
      this.ai.push({
        id: 'ai_' + i,
        x: spot.x,
        row: spot.row,
        uniform: Math.random() > 0.5 ? 'navy' : 'white',
        pose: spot.pose,
        isPlayer: false,
        moving: false,
        patrolT: Math.random() * 20,
        actionT: 0,
        targetPose: spot.pose
      });
    }
  },
  
  update(dt, shift) {
    if (!shift) return;
    
    // Update AI officers
    for (const officer of this.ai) {
      officer.patrolT += dt;
      officer.actionT += dt;
      
      // Patrol: every 10-20 seconds, move to nearby location
      if (officer.patrolT > 10 + Math.random() * 10) {
        officer.patrolT = 0;
        // Slight X variation (±0.5)
        officer.x += (Math.random() - 0.5) * 0.5;
        officer.moving = Math.random() > 0.7;
      }
      
      // Situational awareness: if vehicles present, react
      const busyVehicles = shift.vehicles.filter(v => v.caseId && !shift.cases[v.caseId].res);
      if (busyVehicles.length > 0) {
        // Alert pose when checking vehicles
        officer.pose = Math.random() > 0.6 ? 'watch' : 'idle';
      } else {
        // Relax pose when idle
        officer.pose = Math.random() > 0.5 ? 'idle' : 'wave';
      }
      
      // Occasional walking (realistic patrol movement)
      if (officer.actionT > 5 && officer.moving) {
        officer.moving = false;
        officer.actionT = 0;
      }
    }
  },
  
  /* Get frame for officer */
  frameOf(officer) {
    const uniform = officer.uniform === 'white' ? 'w' : 'n';
    
    if (officer.moving) {
      // Walk animation: 24 frames total
      const walkFrame = Math.floor(officer.actionT * 10) % 24;
      return 'officer_' + uniform + '_walk_' + String(walkFrame).padStart(2, '0');
    }
    
    // Idle/pose animation: 16 frames cycling
    const idleFrame = Math.floor((CP.R?.t || 0) * 7) % 16;
    return 'officer_' + uniform + '_idle_' + String(idleFrame).padStart(2, '0');
  },
  
  /* Render all AI officers (called from render.js) */
  renderAI(ctx, ppm, R) {
    if (!this.ai) return;
    
    for (const officer of this.ai) {
      const sx = R.sx(officer.x);
      const sy = R.sy(R.actorY(officer.row));
      
      // Draw officer using new sprite
      const frameId = this.frameOf(officer);
      CP.A.drawGroundedScale(ctx, frameId, sx, sy, 0.0015 * ppm, false, 0.5);
    }
  }
};

// Initialize on shift start
const origIntegrationInit = CP.Integration?.initShift;
CP.Integration = CP.Integration || {};
CP.Integration.initShift = function(shift) {
  if (origIntegrationInit) origIntegrationInit.call(this, shift);
  if (CP.SmartOfficers) CP.SmartOfficers.init(shift?.loc);
};

;(window.CP_FILES = window.CP_FILES || {})['22_smart_officers'] = '1.0.0';
