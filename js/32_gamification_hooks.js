/* GAMIFICATION INTEGRATION - Hook into game events for combo, achievements, rewards */

// Override case completion to add gamification
const origCaseFinish = CP.bus ? CP.bus.listeners('finish') : null;

if (!window.CP_GameificationHooked) {
  window.CP_GameificationHooked = true;
  
  // Listen to game finish event (shift/case complete)
  if (CP.bus && typeof CP.bus.on === 'function') {
    CP.bus.on('caseSuccess', function(data) {
      if (!CP.Gamification) return;
      
      // Add combo on success
      const baseReward = data.reward || 100;
      const comboBonus = CP.Gamification.addCombo(baseReward);
      
      // Speed bonus
      const speedBonus = CP.Gamification.speedBonus(data.time || 60, baseReward);
      
      // Weather difficulty
      const diffMult = CP.Gamification.weather.getDifficultyMultiplier();
      
      // Total reward with all bonuses
      const totalReward = Math.floor((baseReward + comboBonus + speedBonus) * diffMult);
      
      // Show popup
      if (CP.GamificationUI) {
        CP.GamificationUI.addPopup(200, 200, `+${totalReward}! Combo x${CP.Gamification.combo.current}`, 'reward');
      }
      
      // Check achievements
      if (CP.G && CP.G.shift) {
        const career = CP.G.career;
        CP.Gamification.checkAchievement('suspect_1', true);
        CP.Gamification.checkAchievement('suspect_10', career.suspects >= 10);
        CP.Gamification.checkAchievement('suspect_50', career.suspects >= 50);
        CP.Gamification.checkAchievement('suspect_100', career.suspects >= 100);
        CP.Gamification.checkAchievement('cash_1000', career.cash >= 1000);
        CP.Gamification.checkAchievement('cash_10000', career.cash >= 10000);
        CP.Gamification.checkAchievement('combo_3', CP.Gamification.combo.current >= 3);
        CP.Gamification.checkAchievement('combo_10', CP.Gamification.combo.current >= 10);
        CP.Gamification.checkAchievement('combo_20', CP.Gamification.combo.current >= 20);
      }
    });
    
    CP.bus.on('caseFail', function(data) {
      if (!CP.Gamification) return;
      
      // Reset combo on failure
      CP.Gamification.resetCombo();
      
      // Show popup
      if (CP.GamificationUI) {
        CP.GamificationUI.addPopup(200, 200, 'Combo Lost!', 'failure');
      }
    });
    
    CP.bus.on('arrive', function(data) {
      if (!CP.Gamification || !CP.Gamification.weather) return;
      
      // Update weather for this location
      if (CP.G && CP.G.shift) {
        CP.Gamification.weather.update(CP.G.shift.t);
      }
    });
  }
  
  // Update difficulty based on player level
  if (CP.G && CP.G.career && CP.Gamification.difficulty) {
    const origCareer = CP.G.career;
    Object.defineProperty(CP.G.career, 'level', {
      get() { return origCareer._level || 1; },
      set(v) {
        origCareer._level = v;
        CP.Gamification.difficulty.update(v);
      }
    });
  }
}

;(window.CP_FILES = window.CP_FILES || {})['32_gamification_hooks'] = '1.0.0';
