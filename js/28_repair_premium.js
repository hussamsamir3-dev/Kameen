/* PREMIUM REPAIR INTERACTION - Hover detection, visual feedback, progress tracking */

CP.RepairUI = {
  hovering: null,
  repairing: null,
  repairProgress: 0,
  
  /* Repair data per location */
  repairables: {
    cairo: [
      { id: 'gate_l', x: 2.8, y: 4.28, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.2, y: 4.28, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth_l', x: 3.2, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.5, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 },
      { id: 'umb', x: 2.8, y: 3.8, name: 'Umbrella Stand', duration: 4, reward: 75 }
    ],
    alex: [
      { id: 'gate_l', x: 2.9, y: 4.25, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.1, y: 4.25, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.3, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light_l', x: 8.2, y: 4.0, name: 'Light Pole (L)', duration: 6, reward: 100 },
      { id: 'light_r', x: 9.2, y: 4.0, name: 'Light Pole (R)', duration: 6, reward: 100 }
    ],
    sinai: [
      { id: 'gate_l', x: 2.75, y: 4.30, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.25, y: 4.30, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.1, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.3, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 }
    ],
    hurghada: [
      { id: 'gate_l', x: 2.85, y: 4.29, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.15, y: 4.29, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.25, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.7, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 }
    ],
    luxor: [
      { id: 'gate_l', x: 2.9, y: 4.28, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.1, y: 4.28, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.2, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.6, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 }
    ],
    aswan: [
      { id: 'gate_l', x: 2.8, y: 4.31, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.2, y: 4.31, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.15, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.9, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 }
    ],
    desert: [
      { id: 'gate_l', x: 2.95, y: 4.27, name: 'Gate Barrier (L)', duration: 8, reward: 150 },
      { id: 'gate_r', x: 21.05, y: 4.27, name: 'Gate Barrier (R)', duration: 8, reward: 150 },
      { id: 'booth', x: 3.05, y: 3.5, name: 'Inspection Booth', duration: 12, reward: 200 },
      { id: 'light', x: 8.4, y: 4.0, name: 'Light Pole', duration: 6, reward: 100 }
    ]
  },
  
  /* Check hover on repair items */
  checkHover(mouseX, mouseY, R, ppm, location) {
    this.hovering = null;
    const items = this.repairables[location] || this.repairables.cairo;
    const HOVER_RADIUS = 40; // pixels
    
    for (const item of items) {
      const sx = R.sx(item.x);
      const sy = R.sy(item.y);
      const dist = Math.hypot(mouseX - sx, mouseY - sy);
      
      if (dist < HOVER_RADIUS) {
        this.hovering = item;
        break;
      }
    }
  },
  
  /* Start repair on click */
  startRepair(item) {
    if (!item) return;
    this.repairing = item;
    this.repairProgress = 0;
    
    CP.notify({
      type: 'info',
      msg: `🔧 Repairing ${item.name}... (${item.duration}s)`
    });
  },
  
  /* Update repair progress */
  update(dt, career) {
    if (!this.repairing) return;
    
    this.repairProgress += dt;
    const progress = Math.min(this.repairProgress / this.repairing.duration, 1);
    
    if (progress >= 1) {
      // Repair complete
      const item = this.repairing;
      career.cash = (career.cash || 0) + item.reward;
      
      CP.Engagement.addXP(career, item.reward / 2);
      CP.Engagement.updateChallenges(career, 'repairs', 1);
      
      CP.notify({
        type: 'success',
        msg: `✅ ${item.name} repaired! +$${item.reward}`
      });
      
      this.repairing = null;
      this.repairProgress = 0;
    }
  },
  
  /* Render hover indicator + progress */
  render(ctx, R, ppm, location) {
    const items = this.repairables[location] || this.repairables.cairo;
    
    for (const item of items) {
      const sx = R.sx(item.x);
      const sy = R.sy(item.y);
      const INDICATOR_SIZE = 30;
      
      // Hover indicator - bright blue
      if (this.hovering === item) {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(sx, sy, INDICATOR_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64C8FF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Premium tooltip
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, sx, sy - INDICATOR_SIZE - 15);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`+$${item.reward}  ${item.duration}s`, sx, sy - INDICATOR_SIZE - 2);
      }
    }
    
    // Repair progress bar
    if (this.repairing) {
      const item = this.repairing;
      const sx = R.sx(item.x);
      const sy = R.sy(item.y);
      const barWidth = 80;
      const barHeight = 8;
      const progress = this.repairProgress / item.duration;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(sx - barWidth / 2, sy + 30, barWidth, barHeight);
      
      // Fill
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(sx - barWidth / 2, sy + 30, barWidth * progress, barHeight);
      
      // Border
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - barWidth / 2, sy + 30, barWidth, barHeight);
    }
  }
};

;(window.CP_FILES = window.CP_FILES || {})['28_repair_premium'] = '1.0.0';
