/* Daily Engagement System: Daily login rewards, streaks, time-limited challenges, 
   and persistent progression to encourage long-term play and daily returns. */

CP.Daily = {
  // Daily reward tiers (XP, money, special items)
  rewardTiers: {
    day_1: { xp: 150, salary: 500, bonus: 'none' },
    day_2: { xp: 200, salary: 750, bonus: 'none' },
    day_3: { xp: 250, salary: 1000, bonus: 'extra_coffee' },
    day_4: { xp: 300, salary: 1250, bonus: 'none' },
    day_5: { xp: 350, salary: 1500, bonus: 'none' },
    day_6: { xp: 400, salary: 2000, bonus: 'none' },
    day_7: { xp: 500, salary: 3000, bonus: 'weekend_bonus' },
    day_14: { xp: 750, salary: 5000, bonus: 'partner_unlock' },
    day_30: { xp: 1000, salary: 10000, bonus: 'uniform_upgrade' }
  },

  // Time-limited daily challenges
  dailyChallenges: {
    speed_demon: {
      name: { ar: 'صاحب السرعة', en: 'Speed Demon' },
      desc: { ar: 'فتش 3 مركبات بدون أخطاء', en: 'Inspect 3 vehicles without mistakes' },
      reward: 200,
      timeLimit: 3600 // 1 hour in seconds
    },
    clean_sweep: {
      name: { ar: 'التنظيف الكامل', en: 'Clean Sweep' },
      desc: { ar: 'أوقف 5 مخالفات متتالية', en: 'Catch 5 consecutive violations' },
      reward: 300,
      timeLimit: 7200 // 2 hours
    },
    mercy: {
      name: { ar: 'الرحمة', en: 'Mercy' },
      desc: { ar: 'أطلق سراح 3 سيارات بدون إنذار', en: 'Release 3 vehicles without warnings' },
      reward: 250,
      timeLimit: 3600
    },
    night_owl: {
      name: { ar: 'قيم الليل', en: 'Night Owl' },
      desc: { ar: 'أكمل وردية ليل كاملة بدون أخطاء', en: 'Complete full night shift with no mistakes' },
      reward: 400,
      timeLimit: 28800 // 8 hours
    },
    perfect_inspection: {
      name: { ar: 'الفحص المثالي', en: 'Perfect Inspection' },
      desc: { ar: 'فتش مركبة واحدة بكل الفحوصات', en: 'Inspect one vehicle with all checks' },
      reward: 150,
      timeLimit: 1800
    },
    comeback: {
      name: { ar: 'العودة', en: 'Comeback' },
      desc: { ar: 'لعب بعد 3 أيام بدون اللعبة', en: 'Play after 3 days away' },
      reward: 500,
      timeLimit: 86400 // 24 hours
    }
  },

  // Streak bonuses (cumulative multipliers for consecutive days)
  streakBonuses: {
    3: { name: 'Hot Streak', multiplier: 1.2 },
    7: { name: 'Weekly Champion', multiplier: 1.5 },
    14: { name: 'Fortnight Warrior', multiplier: 1.8 },
    30: { name: 'Monthly Legend', multiplier: 2.0 },
    60: { name: 'Dedicated Officer', multiplier: 2.5 },
    100: { name: 'Century Guardian', multiplier: 3.0 }
  },

  init() {
    this.today = new Date().toISOString().split('T')[0];
    this.session = {
      hasPlayedToday: false,
      loginTime: null,
      streak: 0,
      lastLogin: null,
      activeChallenges: []
    };
    this.loadProgress();
  },

  loadProgress() {
    if (!CP.S) return;
    const saved = localStorage.getItem('kameen_daily_progress');
    if (saved) {
      const data = JSON.parse(saved);
      this.session = Object.assign(this.session, data);
      this.checkLogin();
    }
  },

  saveProgress() {
    if (!CP.S) return;
    localStorage.setItem('kameen_daily_progress', JSON.stringify(this.session));
  },

  // Check if player logged in today and handle streak
  checkLogin() {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = this.session.lastLogin ? new Date(this.session.lastLogin) : null;
    const now = new Date();

    if (!lastLogin || lastLogin.toISOString().split('T')[0] !== today) {
      // First login today
      const timeSinceLastLogin = lastLogin ? Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24)) : null;

      if (timeSinceLastLogin === 1) {
        // Consecutive day
        this.session.streak++;
      } else if (timeSinceLastLogin && timeSinceLastLogin > 1) {
        // Streak broken
        this.session.streak = 1;
      } else if (!lastLogin) {
        // First ever login
        this.session.streak = 1;
      }

      this.session.hasPlayedToday = false;
      this.session.loginTime = now.toISOString();
      this.activateDailyRewards();
      this.activateDailyChallenge();
    }

    this.session.lastLogin = now.toISOString();
    this.saveProgress();
  },

  activateDailyRewards() {
    const streakKey = `day_${Math.min(this.session.streak, 30)}`;
    const rewards = this.rewardTiers[streakKey] || this.rewardTiers.day_1;
    
    // Apply rewards
    if (CP.G && CP.G.career) {
      const bonusMultiplier = this.getStreakMultiplier();
      CP.G.career.totalXP = (CP.G.career.totalXP || 0) + Math.floor(rewards.xp * bonusMultiplier);
      CP.G.career.salary = (CP.G.career.salary || 0) + Math.floor(rewards.salary * bonusMultiplier);

      if (rewards.bonus !== 'none') {
        this.applyBonus(rewards.bonus);
      }

      if (CP.UI && CP.UI.toast) {
        const streakText = this.session.streak > 1 ? ` (${this.session.streak} day streak!)` : '';
        CP.UI.toast(
          `Daily Reward: ${rewards.xp * bonusMultiplier}XP + ${rewards.salary * bonusMultiplier} EGP${streakText}`,
          'bonus'
        );
      }
    }
  },

  getStreakMultiplier() {
    for (const days of Object.keys(this.streakBonuses).map(Number).sort((a, b) => b - a)) {
      if (this.session.streak >= days) {
        return this.streakBonuses[days].multiplier;
      }
    }
    return 1;
  },

  applyBonus(bonusType) {
    const s = CP.G && CP.G.shift;
    if (!s) return;

    switch (bonusType) {
      case 'extra_coffee':
        s.equipment.mouth = Math.min(s.equipment.mouth + 1, 5);
        if (CP.UI && CP.UI.toast) CP.UI.toast('Extra coffee available!', 'ok');
        break;
      case 'weekend_bonus':
        if (CP.G && CP.G.career) {
          CP.G.career.salary = (CP.G.career.salary || 0) + 2000;
          if (CP.UI && CP.UI.toast) CP.UI.toast('Weekend bonus! +2000 EGP', 'bonus');
        }
        break;
      case 'partner_unlock':
        if (CP.G && CP.G.career) {
          CP.G.career.upgrades = CP.G.career.upgrades || {};
          CP.G.career.upgrades.partner = Math.max(CP.G.career.upgrades.partner || 0, 1);
          if (CP.UI && CP.UI.toast) CP.UI.toast('Partner skill unlocked!', 'bonus');
        }
        break;
      case 'uniform_upgrade':
        if (CP.G && CP.G.career) {
          CP.G.career.prestige = (CP.G.career.prestige || 0) + 1;
          if (CP.UI && CP.UI.toast) CP.UI.toast('Uniform upgraded!', 'bonus');
        }
        break;
    }
  },

  activateDailyChallenge() {
    const challenges = Object.keys(this.dailyChallenges);
    const selected = challenges[Math.floor(Math.random() * challenges.length)];
    
    this.session.activeChallenges = [{
      id: selected,
      startTime: Date.now(),
      progress: 0,
      completed: false
    }];

    this.saveProgress();
    
    if (CP.UI && CP.UI.toast) {
      const challenge = this.dailyChallenges[selected];
      CP.UI.toast(
        `Today's Challenge: ${challenge.name.en} - ${challenge.desc.en} (+${challenge.reward}XP)`,
        'info'
      );
    }
  },

  updateChallengeProgress(challengeType, amount = 1) {
    const active = this.session.activeChallenges[0];
    if (!active) return;

    const challenge = this.dailyChallenges[active.id];
    if (!challenge) return;

    active.progress += amount;
    this.saveProgress();

    // Check if challenge complete
    const target = this.getChallengeTarget(active.id);
    if (active.progress >= target && !active.completed) {
      this.completeChallenge(active.id);
    }
  },

  getChallengeTarget(challengeId) {
    const targets = {
      speed_demon: 3,
      clean_sweep: 5,
      mercy: 3,
      night_owl: 8,
      perfect_inspection: 1,
      comeback: 1
    };
    return targets[challengeId] || 1;
  },

  completeChallenge(challengeId) {
    const challenge = this.dailyChallenges[challengeId];
    if (!challenge) return;

    if (CP.G && CP.G.career) {
      CP.G.career.totalXP = (CP.G.career.totalXP || 0) + challenge.reward;
    }

    if (CP.UI && CP.UI.toast) {
      CP.UI.toast(`Challenge Complete: ${challenge.name.en}! +${challenge.reward}XP`, 'bonus');
    }

    const active = this.session.activeChallenges[0];
    if (active) active.completed = true;
    this.saveProgress();
  },

  // Format player statistics
  getStreakDisplay() {
    return {
      streak: this.session.streak,
      nextMilestone: Object.keys(this.streakBonuses)
        .map(Number)
        .find(d => d > this.session.streak),
      currentBonus: this.getStreakMultiplier(),
      hasPlayedToday: this.session.hasPlayedToday,
      daysUntilReset: this.session.lastLogin ? 1 : 0
    };
  },

  getActiveChallenge() {
    const active = this.session.activeChallenges[0];
    if (!active) return null;

    const challenge = this.dailyChallenges[active.id];
    const elapsed = Date.now() - active.startTime;
    const timeLeft = challenge.timeLimit * 1000 - elapsed;

    return {
      ...challenge,
      progress: active.progress,
      target: this.getChallengeTarget(active.id),
      timeLeft: Math.max(0, timeLeft),
      completed: active.completed,
      percentage: Math.floor((active.progress / this.getChallengeTarget(active.id)) * 100)
    };
  }
};

// Export
(window.CP_FILES = window.CP_FILES || {})['24_daily_system'] = '1.0.0';
