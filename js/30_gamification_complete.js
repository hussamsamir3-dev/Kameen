/* COMPLETE GAMIFICATION SYSTEM - Combo + Achievements + Difficulty + Speed Bonuses + Leaderboards */

CP.Gamification = {
  /* COMBO SYSTEM */
  combo: {
    current: 0,
    maxCombo: 0,
    lastActionTime: 0,
    comboTimeout: 8 // seconds
  },

  /* ADD COMBO ON CORRECT ACTION */
  addCombo(amount = 1, multiplier = 1) {
    if (!CP.G || !CP.G.shift) return;
    
    const now = CP.G.shift.t;
    const time_since_last = now - this.combo.lastActionTime;
    
    // Reset if too long since last action
    if (time_since_last > this.combo.comboTimeout) {
      this.combo.current = 0;
    }
    
    this.combo.current += 1;
    this.combo.lastActionTime = now;
    this.combo.maxCombo = Math.max(this.combo.maxCombo, this.combo.current);
    
    // Bonus multiplier based on combo
    let comboBonus = 1;
    if (this.combo.current >= 20) comboBonus = 5;
    else if (this.combo.current >= 10) comboBonus = 3;
    else if (this.combo.current >= 5) comboBonus = 2;
    else if (this.combo.current >= 3) comboBonus = 1.5;
    
    const totalReward = Math.floor(amount * multiplier * comboBonus);
    
    // Visual feedback
    this.showComboPopup(this.combo.current, comboBonus);
    
    return totalReward;
  },

  showComboPopup(count, multiplier) {
    if (!CP.FX) return;
    // Trigger screen shake on milestones
    if ([3, 5, 10, 20].includes(count)) {
      if (CP.R) CP.R.punchT = 0.2;
      if (CP.Audio) CP.Audio.chime('good');
    }
  },

  resetCombo() {
    this.combo.current = 0;
  },

  /* ACHIEVEMENT SYSTEM */
  achievements: {
    rookie: { name: 'First Shift', desc: 'Complete your first shift', icon: '🚔', unlocked: false, date: null },
    suspect_1: { name: 'First Catch', desc: 'Catch your first suspect', icon: '👮', unlocked: false, date: null },
    
    suspect_10: { name: 'Rookie Officer', desc: 'Catch 10 suspects', icon: '🌟', unlocked: false, date: null },
    suspect_50: { name: 'Experienced', desc: 'Catch 50 suspects', icon: '⭐', unlocked: false, date: null },
    suspect_100: { name: 'Expert', desc: 'Catch 100 suspects', icon: '🔶', unlocked: false, date: null },
    suspect_500: { name: 'Sergeant', desc: 'Catch 500 suspects', icon: '⬛', unlocked: false, date: null },
    suspect_1000: { name: 'Major', desc: 'Catch 1000 suspects', icon: '👑', unlocked: false, date: null },
    
    cash_1000: { name: 'First Grand', desc: 'Earn $1000', icon: '💵', unlocked: false, date: null },
    cash_10000: { name: 'Rich', desc: 'Earn $10,000', icon: '💰', unlocked: false, date: null },
    cash_100000: { name: 'Wealthy', desc: 'Earn $100,000', icon: '🏦', unlocked: false, date: null },
    cash_1000000: { name: 'Millionaire', desc: 'Earn $1,000,000', icon: '💎', unlocked: false, date: null },
    
    perfect_day: { name: 'Perfect Shift', desc: 'Go through a shift with 0 mistakes', icon: '✨', unlocked: false, date: null },
    combo_3: { name: 'On A Roll', desc: 'Get a combo of 3', icon: '🔥', unlocked: false, date: null },
    combo_10: { name: 'Hot Streak', desc: 'Get a combo of 10', icon: '🔥🔥', unlocked: false, date: null },
    combo_20: { name: 'Legendary', desc: 'Get a combo of 20', icon: '👑🔥', unlocked: false, date: null },
    
    speed_10: { name: 'Speedster', desc: 'Complete 10 cases in under 30 seconds', icon: '⚡', unlocked: false, date: null },
    streak_7: { name: '7-Day Warrior', desc: 'Maintain 7 day login streak', icon: '📅', unlocked: false, date: null },
    streak_30: { name: 'Month Champion', desc: 'Maintain 30 day login streak', icon: '🏅', unlocked: false, date: null },
  },

  checkAchievement(key, condition) {
    if (!this.achievements[key] || this.achievements[key].unlocked) return;
    
    if (condition) {
      this.achievements[key].unlocked = true;
      this.achievements[key].date = new Date();
      CP.notify({
        type: 'success',
        msg: `🏆 Achievement Unlocked: ${this.achievements[key].name}!`
      });
    }
  },

  /* WEATHER SYSTEM */
  weather: {
    types: ['clear', 'dusty', 'sandstorm', 'hot'],
    current: 'clear',
    intensity: 0.5,
    
    update(t) {
      const day_cycle = Math.floor(t / 30) % 4;
      this.current = ['clear', 'dusty', 'sandstorm', 'hot'][day_cycle];
      this.intensity = 0.3 + Math.sin(t * 0.5) * 0.3;
    },
    
    getDifficultyMultiplier() {
      const multipliers = {
        'clear': 1.0,
        'dusty': 1.15,
        'sandstorm': 1.35,
        'hot': 1.1
      };
      return multipliers[this.current] || 1.0;
    }
  },

  /* SPEED BONUS */
  speedBonus(caseCompletionTime, baseReward) {
    if (caseCompletionTime < 30) return baseReward + 200; // 30 sec bonus
    if (caseCompletionTime < 60) return baseReward + 100; // 60 sec bonus
    return baseReward;
  },

  /* DIFFICULTY SCALING */
  difficulty: {
    level: 1,
    
    getSuspectTruthfulness() {
      // Higher level = suspects lie more
      const base = 0.4; // 40% truth rate base
      return Math.max(base - (this.level * 0.01), 0.2); // min 20%
    },
    
    getDocumentForgeryChance() {
      const base = 0.15;
      return Math.min(base + (this.level * 0.02), 0.6);
    },
    
    update(level) {
      this.level = Math.min(level, 999); // Level cap 999
    }
  },

  /* QUICK SESSIONS - 5min scenarios */
  quickSessions: [
    { name: 'Speed Runner', desc: 'Complete 5 cases in 5 minutes', time: 300, caseCount: 5, reward: 500 },
    { name: 'Accuracy Drills', desc: 'Get 90% accuracy in 10 cases', time: 600, caseCount: 10, accuracy: 0.9, reward: 750 },
    { name: 'Combo Master', desc: 'Get a 10+ combo', time: 600, comboGoal: 10, reward: 1000 },
  ],

  /* PRESTIGE SYSTEM */
  prestige: {
    level: 0,
    
    canPrestige(playerLevel) {
      return playerLevel >= 100;
    },
    
    doPrestige() {
      this.level += 1;
      return {
        xpMultiplier: 1 + (this.level * 0.2),
        cashMultiplier: 1 + (this.level * 0.1),
        prestigeTitle: ['', 'Prestige I', 'Prestige II', 'Prestige III', 'Prestige IV', 'Prestige V'][this.level]
      };
    }
  },

  /* WEEKLY TOURNAMENT */
  tournament: {
    week: 1,
    location: 'cairo',
    leaderboard: {},
    
    getCurrentChallenge() {
      const challenges = [
        { location: 'cairo', goal: 'suspects', desc: 'Most suspects caught' },
        { location: 'alex', goal: 'accuracy', desc: 'Highest accuracy %' },
        { location: 'sinai', goal: 'combo', desc: 'Longest combo streak' },
        { location: 'hurghada', goal: 'cash', desc: 'Most cash earned' },
      ];
      return challenges[this.week % 4];
    },
    
    recordScore(playerId, score) {
      this.leaderboard[playerId] = score;
    }
  },

  /* FACTION SYSTEM */
  factions: [
    { name: 'Cairo Traffic Police', id: 'traffic', location: 'cairo', bonus: 'suspects' },
    { name: 'Customs Enforcement', id: 'customs', bonus: 'smuggling' },
    { name: 'Narcotics Unit', id: 'narcotics', bonus: 'drugs' },
    { name: 'Highway Patrol', id: 'highway', bonus: 'vehicles' },
  ],

  chosenFaction: null
};

;(window.CP_FILES = window.CP_FILES || {})['30_gamification_complete'] = '1.0.0';
