/* PROPER OFFICER SPRITE SYSTEM - Replaces old yellow vest officer with new sprites */

CP.OfficerFrames = {
  /* Map poses to new sprite sequences */
  
  getIdleFrame(officer, time) {
    const frames = [];
    if (officer.uniform === 'white') {
      for (let i = 0; i < 16; i++) frames.push(`officer_w_idle_${String(i).padStart(2, '0')}`);
    } else {
      for (let i = 0; i < 16; i++) frames.push(`officer_n_idle_${String(i).padStart(2, '0')}`);
    }
    const idx = Math.floor(time * 8) % frames.length;
    return frames[idx] || frames[0];
  },

  getWalkFrame(officer, time) {
    const frames = [];
    if (officer.uniform === 'white') {
      for (let i = 0; i < 24; i++) frames.push(`officer_w_walk_${String(i).padStart(2, '0')}`);
    } else {
      for (let i = 0; i < 24; i++) frames.push(`officer_n_walk_${String(i).padStart(2, '0')}`);
    }
    const idx = Math.floor(time * 12) % frames.length;
    return frames[idx] || frames[0];
  },

  getFrame(officer, pose, moving, animTime) {
    // Fallback to pose-based frames for special actions
    if (pose && pose !== 'idle') {
      return `officer_${pose}`;
    }
    
    // Use animation frames for walking/idle
    if (moving) {
      return this.getWalkFrame(officer, animTime);
    }
    
    return this.getIdleFrame(officer, animTime);
  }
};

// Hook into existing frameOf to replace officer sprites
const origFrameOf = CP.Actors.frameOf;
CP.Actors.frameOf = function(a) {
  if (!a || a.id === 'partner') return origFrameOf(a); // Keep partner as-is
  
  // Player officer - use new navy uniform sprites
  const pose = a.pose || 'idle';
  const moving = a.target || (CP.Input && CP.Input.axis !== 0);
  const time = (CP.R && CP.R.t || 0);
  
  // For special poses (raise, stop, wave, flashlight, etc) use old frames temporarily
  if (pose !== 'idle' && pose !== 'walk') {
    return `officer_${pose}`;
  }
  
  // Use new officer sprites
  return CP.OfficerFrames.getFrame(a, pose, moving, time);
};

;(window.CP_FILES = window.CP_FILES || {})['29_officer_frames'] = '1.0.0';
