/* DAILY ENGAGEMENT SYSTEM - Unlimited targets + daily missions + achievements */

CP.Engagement = {
  /* Daily mission system */
  dailyMissions: {
    vehicles: {
      name: 'Vehicle Handler',
      desc: 'Check %target% vehicles',
      rewards: (n) => Math.floor(n * 50)
    },
    cases: {
      name: 'Case Master',
      desc: 'Resolve %target% cases',
      rewards: (n) => Math.floor(n * 100)
    },
    arrests: {
      name: 'Arrest Expert',
      desc: 'Make %target% arrests',
      rewards: (n) => Math.floor(n * 200)
    },
    corruption: {
      name: 'Anti-Corruption',
      desc: 'Report %target% corruption claims',
      rewards: (n) => Math.floor(n * 150)
    },
    accuracy: {
      name: 'Precision Officer',
      desc: 'Reach %target%% accuracy',
      rewards: (n) => Math.floor(n * 75)
    }
  },
  
  /* Unlimited progression tiers */
  progressionTiers: [
    // Level 1-10
    { level: 5, xp: 500, title: 'Junior Officer', badge: '🌟' },
    { level: 10, xp: 1000, title: 'Police Officer', badge: '⭐' },
    { level: 15, xp: 2000, title: 'Senior Officer', badge: '🔶' },
    { level: 20, xp: 3500, title: 'Sergeant', badge: '⬛' },
    { level: 25, xp: 5000, title: 'Lieutenant', badge: '🔷' },
    { level: 30, xp: 7500, title: 'Captain', badge: '🌐' },
    { level: 50, xp: 15000, title: 'Major', badge: '👑' },
    { level: 100, xp: 50000, title: 'Colonel', badge: '🏛️' }
  ],
  
  /* Daily challenge generator */
  generateDaily(career) {
    if (!career.dailyChallenges) career.dailyChallenges = {};
    
    const today = new Date().toDateString();
    if (career.dailyDate === today && career.dailyChallenges.length > 0) {
      return; // Already generated
    }
    
    career.dailyDate = today;
    career.dailyChallenges = [];
    
    // 3 random challenges
    const types = ['vehicles', 'cases', 'arrests', 'corruption', 'accuracy'];
    const shuffled = types.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3; i++) {
      const type = shuffled[i];
      const mission = this.dailyMissions[type];
      const target = type === 'accuracy' ? 
        80 + Math.random() * 15 :  // 80-95%
        3 + Math.floor(Math.random() * 8); // 3-10 items
      
      career.dailyChallenges.push({
        type,
        name: mission.name,
        desc: mission.desc.replace('%target%', Math.round(target)),
        target: Math.round(target),
        progress: 0,
        completed: false,
        reward: mission.rewards(Math.round(target))
      });
    }
  },
  
  /* Daily login streak */
  updateLoginStreak(career) {
    const today = new Date().toDateString();
    const lastLogin = career.lastLoginDate;
    
    if (lastLogin === today) return; // Already logged in today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLogin === yesterday.toDateString()) {
      // Streak continues
      career.loginStreak = (career.loginStreak || 0) + 1;
    } else {
      // Streak broken
      career.loginStreak = 1;
    }
    
    career.lastLoginDate = today;
    
    // Streak bonuses
    const streakRewards = {
      1: 50,
      3: 250,
      7: 500,
      14: 1000,
      30: 2000,
      60: 5000,
      100: 10000,
      365: 50000
    };
    
    if (streakRewards[career.loginStreak]) {
      const bonus = streakRewards[career.loginStreak];
      career.cash = (career.cash || 0) + bonus;
      CP.notify({
        type: 'success',
        msg: `🔥 ${career.loginStreak} day streak! +$${bonus}`
      });
    }
  },
  
  /* XP + rank system */
  addXP(career, amount) {
    career.xp = (career.xp || 0) + amount;
    
    // Find current rank
    let currentRank = 1;
    for (const tier of this.progressionTiers) {
      if (career.xp >= tier.xp) {
        currentRank = tier.level;
        career.rank = tier.title;
        career.rankBadge = tier.badge;
      }
    }
    
    // Level cap: 999 (unlimited)
    career.level = Math.min(Math.floor(career.xp / 100) + 1, 999);
    
    return currentRank;
  },
  
  /* Challenge progress tracking */
  updateChallenges(career, actionType, amount = 1) {
    if (!career.dailyChallenges) return;
    
    for (const challenge of career.dailyChallenges) {
      if (challenge.type === actionType && !challenge.completed) {
        challenge.progress += amount;
        if (challenge.progress >= challenge.target) {
          challenge.completed = true;
          challenge.progress = challenge.target;
          
          // Award immediately
          career.cash = (career.cash || 0) + challenge.reward;
          this.addXP(career, challenge.reward / 2);
          
          CP.notify({
            type: 'success',
            msg: `✅ ${challenge.name}! +$${challenge.reward}`
          });
        }
      }
    }
  }
};

;(window.CP_FILES = window.CP_FILES || {})['26_engagement'] = '1.0.0';
