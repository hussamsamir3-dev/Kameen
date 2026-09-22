/* OFFICER SPRITE SYSTEM - Proper integration with walking (24) + idle (16) frame sequences */

CP.OfficerSprites = {
  /* Frame mapping: sprite sheet layout */
  frames: {
    navy: {
      walk: [], // 0-23: walking frames
      idle: []  // 0-15: idle frames
    },
    white: {
      walk: [],
      idle: []
    }
  },
  
  init() {
    // Navy walk frames (top-left 24 frames in first row)
    for (let i = 0; i < 24; i++) {
      this.frames.navy.walk.push('officer_n_walk_' + String(i).padStart(2, '0'));
    }
    // Navy idle frames (16 frames in second row, left side)
    for (let i = 0; i < 16; i++) {
      this.frames.navy.idle.push('officer_n_idle_' + String(i).padStart(2, '0'));
    }
    // White walk frames (top-right 24 frames)
    for (let i = 0; i < 24; i++) {
      this.frames.white.walk.push('officer_w_walk_' + String(i).padStart(2, '0'));
    }
    // White idle frames (16 frames, right side)
    for (let i = 0; i < 16; i++) {
      this.frames.white.idle.push('officer_w_idle_' + String(i).padStart(2, '0'));
    }
  },
  
  /* Get frame ID for officer */
  getFrame(uniform, moving, time) {
    const frames = this.frames[uniform] || this.frames.navy;
    
    if (moving) {
      // Walking: 24 frames at ~12 fps = 2 second walk cycle
      const idx = Math.floor((time * 12) % 24);
      return frames.walk[idx];
    }
    
    // Idle: 16 frames at ~8 fps = 2 second idle cycle
    const idx = Math.floor((time * 8) % 16);
    return frames.idle[idx];
  }
};

// Initialize on load
CP.OfficerSprites.init();

;(window.CP_FILES = window.CP_FILES || {})['24_officer_sprites'] = '1.0.0';
