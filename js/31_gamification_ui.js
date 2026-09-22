/* GAMIFICATION UI & EFFECTS - Render combos, achievements, weather, etc */

CP.GamificationUI = {
  /* Floating popups for rewards */
  popups: [],
  
  addPopup(x, y, text, type = 'reward', duration = 2) {
    this.popups.push({
      x, y, text, type, duration,
      age: 0,
      vx: (Math.random() - 0.5) * 3,
      vy: -2 + Math.random() * 1
    });
  },

  /* Update and remove old popups */
  update(dt) {
    this.popups = this.popups.filter(p => {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.age < p.duration;
    });
  },

  /* Render all UI elements */
  render(ctx, W, H) {
    // Get data
    const g = CP.G.shift;
    if (!g) return;
    
    const cam = CP.Gamification || {};
    const combo = cam.combo ? cam.combo.current : 0;
    
    // Combo counter (top right)
    if (combo > 0) {
      this.renderCombo(ctx, W, H, combo);
    }
    
    // Weather indicator (top center)
    if (cam.weather) {
      this.renderWeather(ctx, W, H, cam.weather.current);
    }
    
    // Score multiplier (top left)
    this.renderScoreMultiplier(ctx, W, H, g);
    
    // Floating popups
    this.renderPopups(ctx);
    
    // Achievement toast if visible
    this.renderAchievementToast(ctx, W, H);
    
    // Quick session timer (if active)
    this.renderQuickSessionTimer(ctx, W, H, g);
  },

  renderCombo(ctx, W, H, combo) {
    const x = W - 100;
    const y = 50;
    
    // Determine color and size based on combo
    let color = '#FFF', size = 24;
    if (combo >= 20) { color = '#FFD700'; size = 48; } // Gold
    else if (combo >= 10) { color = '#FF6B6B'; size = 40; } // Red
    else if (combo >= 5) { color = '#FFA500'; size = 32; } // Orange
    else { color = '#FFD700'; size = 28; }
    
    // Scale animation on high combos
    const scale = combo >= 10 ? 1 + Math.sin(performance.now() / 200) * 0.1 : 1;
    
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.font = `bold ${Math.floor(size * scale)}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 20;
    ctx.fillText(`${combo}x COMBO`, x, y);
    ctx.restore();
  },

  renderWeather(ctx, W, H, weatherType) {
    const x = W / 2;
    const y = 40;
    
    const weatherInfo = {
      'clear': { emoji: '☀️', text: 'Clear', color: '#FFD700' },
      'dusty': { emoji: '💨', text: 'Dusty', color: '#D2B48C' },
      'sandstorm': { emoji: '🌪️', text: 'Sandstorm', color: '#CD853F' },
      'hot': { emoji: '🔥', text: 'Hot', color: '#FF4500' }
    };
    
    const info = weatherInfo[weatherType] || weatherInfo['clear'];
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.font = '14px Arial';
    ctx.fillStyle = info.color;
    ctx.textAlign = 'center';
    ctx.fillText(`${info.emoji} ${info.text}`, x, y);
    ctx.restore();
  },

  renderScoreMultiplier(ctx, W, H, shift) {
    const x = 50;
    const y = 50;
    
    const cam = CP.Gamification;
    let multiplier = 1;
    
    if (cam.combo && cam.combo.current >= 3) {
      if (cam.combo.current >= 20) multiplier = 5;
      else if (cam.combo.current >= 10) multiplier = 3;
      else if (cam.combo.current >= 5) multiplier = 2;
      else if (cam.combo.current >= 3) multiplier = 1.5;
    }
    
    if (multiplier > 1) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'left';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      ctx.fillText(`${multiplier.toFixed(1)}x Multiplier`, x, y);
      ctx.restore();
    }
  },

  renderPopups(ctx) {
    this.popups.forEach(p => {
      const alpha = Math.max(0, 1 - (p.age / p.duration));
      const scale = 1 + (p.age / p.duration) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = p.type === 'success' ? '#00FF00' : p.type === 'combo' ? '#FFD700' : '#FFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      ctx.scale(scale, scale);
      ctx.fillText(p.text, p.x / scale, p.y / scale);
      ctx.restore();
    });
  },

  achievementToastVisible: null,
  renderAchievementToast(ctx, W, H) {
    // Placeholder - would display unlocked achievements
    // Implementation depends on achievement system state
  },

  renderQuickSessionTimer(ctx, W, H, shift) {
    if (!shift.quickSessionActive) return;
    
    const timeLeft = Math.max(0, shift.quickSessionDuration - shift.quickSessionTime);
    const x = W / 2;
    const y = H - 60;
    
    // Bar background
    const barWidth = 200;
    const barHeight = 30;
    ctx.fillStyle = '#222';
    ctx.fillRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight);
    
    // Progress bar
    const progress = shift.quickSessionTime / shift.quickSessionDuration;
    ctx.fillStyle = progress > 0.8 ? '#FF4444' : progress > 0.5 ? '#FFA500' : '#00AA00';
    ctx.fillRect(x - barWidth/2, y - barHeight/2, barWidth * progress, barHeight);
    
    // Text
    const seconds = Math.ceil(timeLeft);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${seconds}s`, x, y + 5);
  }
};

// Hook into render pipeline
const origRender14 = CP.R.render;
CP.R.render = function(s, alpha) {
  origRender14.call(this, s, alpha);
  
  // Render gamification UI on top
  if (CP.GamificationUI) {
    CP.GamificationUI.update(1/60); // Assuming 60fps
    CP.GamificationUI.render(this.ctx, this.W, this.H);
  }
};

;(window.CP_FILES = window.CP_FILES || {})['31_gamification_ui'] = '1.0.0';
