/* OFFICER PLACEMENT SYSTEM - Realistic positioning across all maps with animation sequences */

CP.OfficerPlacement = {
  /* Map-specific officer placement (x position, row, default pose) */
  placements: {
    cairo: {
      primary: { x: 15.2, row: 0.1, pose: 'idle' },
      secondary: [
        { x: 8.5, row: 0.15, pose: 'watch' },
        { x: 20.1, row: 0.08, pose: 'idle' }
      ]
    },
    alex: {
      primary: { x: 14.8, row: 0.12, pose: 'idle' },
      secondary: [
        { x: 9.2, row: 0.18, pose: 'watch' },
        { x: 19.5, row: 0.10, pose: 'idle' }
      ]
    },
    sinai: {
      primary: { x: 15.0, row: 0.10, pose: 'idle' },
      secondary: [
        { x: 8.8, row: 0.16, pose: 'watch' },
        { x: 20.0, row: 0.09, pose: 'idle' }
      ]
    },
    hurghada: {
      primary: { x: 15.3, row: 0.11, pose: 'idle' },
      secondary: [
        { x: 9.1, row: 0.17, pose: 'wave' },
        { x: 20.2, row: 0.10, pose: 'idle' }
      ]
    },
    luxor: {
      primary: { x: 15.1, row: 0.09, pose: 'idle' },
      secondary: [
        { x: 8.9, row: 0.14, pose: 'watch' },
        { x: 19.8, row: 0.08, pose: 'idle' }
      ]
    },
    aswan: {
      primary: { x: 15.0, row: 0.12, pose: 'idle' },
      secondary: [
        { x: 9.0, row: 0.18, pose: 'watch' },
        { x: 19.9, row: 0.11, pose: 'idle' }
      ]
    },
    desert: {
      primary: { x: 15.2, row: 0.10, pose: 'idle' },
      secondary: [
        { x: 8.7, row: 0.15, pose: 'wave' },
        { x: 20.3, row: 0.09, pose: 'idle' }
      ]
    }
  },
  
  /* Animation sequences per action - 2 rows each: walk (24 frames) then idle (16 frames) */
  animSequences: {
    walk: { frames: 24, row: 1, loop: true },       // continuous walking
    idle: { frames: 16, row: 2, loop: true },       // idle standing
    watch: { frames: 16, row: 2, loop: true },      // attentive watching
    signal_go: { frames: 8, row: 3, loop: false },  // go signal gesture
    signal_stop: { frames: 8, row: 4, loop: false }, // stop signal gesture
    radio: { frames: 6, row: 5, loop: false },      // radio communication
    wave: { frames: 10, row: 6, loop: false }       // friendly wave
  },
  
  /* Get placement for location */
  getPlacement(loc) {
    return this.placements[loc] || this.placements.cairo;
  },
  
  /* Apply smart officer positioning per shift location */
  applyPlacement(officer, loc) {
    const placement = this.getPlacement(loc);
    if (!placement) return;
    
    // Primary officer position (main checkpoint position)
    officer.x = placement.primary.x;
    officer.row = placement.primary.row;
    officer._lastPose = placement.primary.pose || 'idle';
    
    // Initialize patrol data
    officer._patrolSpots = [
      placement.primary.x,
      ...placement.secondary.map(s => s.x)
    ];
  },
  
  /* Smart animation selection based on officer state */
  selectAnimation(officer) {
    if (officer.moving) return 'walk';
    if (officer._actionState === 'signal_go') return 'signal_go';
    if (officer._actionState === 'signal_stop') return 'signal_stop';
    if (officer._actionState === 'radio') return 'radio';
    if (officer._actionState === 'wave') return 'wave';
    
    // Default based on last pose
    const pose = officer._lastPose || 'idle';
    return this.animSequences[pose] ? pose : 'idle';
  },
  
  /* Simulate realistic officer behavior and animation switching */
  update(officer, dt) {
    if (!officer) return;
    
    // Track time for animation switching
    officer._animT = (officer._animT || 0) + dt;
    
    // Auto-switch animations every 3-8 seconds when idle
    if (!officer.moving && !officer.target) {
      if (officer._animT > 3 + Math.random() * 5) {
        officer._animT = 0;
        const poses = ['idle', 'watch', 'wave'];
        officer._lastPose = poses[Math.floor(Math.random() * poses.length)];
      }
    }
  }
};

;(window.CP_FILES = window.CP_FILES || {})['20_officer_placement'] = '1.0.0';
