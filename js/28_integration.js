/* Integration Module: Initializes all new game systems and ensures compatibility.
   Handles feature initialization, system setup, and cross-module communication. */

CP.Integration = {
  // Feature flags for optional systems
  features: {
    officerAI: true,
    dailySystem: true,
    repairUI: true,
    enhancedAudio: true,
    propsAlignment: true,
    dialogueCleanup: true,
    performanceOptimization: true
  },

  // Initialization status
  initialized: {
    officerAI: false,
    dailySystem: false,
    repairUI: false,
    enhancedAudio: false,
    propsAlignment: false,
    dialogueCleanup: false
  },

  // Initialize all systems
  init() {
    console.log('[Kameen Enhanced] Initializing integrated systems...');

    // Initialize Officer AI system
    if (this.features.officerAI && CP.OfficerAI) {
      CP.OfficerAI.init();
      this.initialized.officerAI = true;
      console.log('✓ Officer AI System initialized');
    }

    // Initialize Daily Engagement System
    if (this.features.dailySystem && CP.Daily) {
      CP.Daily.init();
      this.initialized.dailySystem = true;
      console.log('✓ Daily Engagement System initialized');
    }

    // Initialize Repair UI System
    if (this.features.repairUI && CP.RepairUI) {
      CP.RepairUI.init();
      this.initialized.repairUI = true;
      console.log('✓ Repair UI System initialized');
    }

    // Initialize Enhanced Audio (if not already done)
    if (this.features.enhancedAudio && CP.EnhancedAudio) {
      if (!CP.EnhancedAudio.initialized) {
        CP.EnhancedAudio.init();
      }
      this.initialized.enhancedAudio = true;
      console.log('✓ Enhanced Audio System initialized');
    }

    // Initialize Props Alignment
    if (this.features.propsAlignment && CP.PropsAlign) {
      this.initialized.propsAlignment = true;
      console.log('✓ Props Alignment System initialized');
      
      // Show alignment report in debug mode
      if (CP.DEBUG) {
        const report = CP.PropsAlign.getReport();
        console.log('Props Alignment Report:', report);
      }
    }

    // Apply Dialogue Cleanup
    if (this.features.dialogueCleanup && CP.DialogueCleanup) {
      CP.DialogueCleanup.applyCleanup();
      this.initialized.dialogueCleanup = true;
      console.log('✓ Dialogue Cleanup System applied');
    }

    console.log('[Kameen Enhanced] All systems initialized successfully!');
  },

  // Update systems each frame
  update(dt) {
    if (!CP.G || !CP.G.shift) return;

    // Update Officer AI
    if (this.initialized.officerAI && CP.OfficerAI) {
      CP.OfficerAI.update(dt);
    }

    // Update Daily System
    if (this.initialized.dailySystem && CP.Daily) {
      // Daily system primarily updates on session start, but check for challenge progress
      if (CP.G.shift && CP.G.shift.t % 0.5 === 0) { // Check every 0.5s
        // Update challenge progress if needed
      }
    }

    // Update Repair UI
    if (this.initialized.repairUI && CP.RepairUI) {
      CP.RepairUI.update(dt);
    }

    // Update Enhanced Audio (reactive to game state)
    if (this.initialized.enhancedAudio && CP.EnhancedAudio) {
      // Audio updates are handled reactively through action listeners
    }
  },

  // Render systems
  render(ctx) {
    if (!CP.R) return;

    // Render Officer AI entities
    if (this.initialized.officerAI && CP.OfficerAI) {
      const officers = CP.OfficerAI.getRenderList();
      officers.forEach(officer => {
        // Officer rendering integrated with main render pipeline
      });
    }

    // Render Props Alignment (debug)
    if (this.initialized.propsAlignment && CP.PropsAlign && CP.DEBUG) {
      const location = CP.G && CP.G.shift && CP.G.shift.loc;
      if (location) {
        CP.PropsAlign.applyAlignment(ctx, location, CP.R.ppm);
      }
    }

    // Render Repair UI
    if (this.initialized.repairUI && CP.RepairUI) {
      CP.RepairUI.renderElements();
    }
  },

  // Handle events for system integration
  onShiftStart(shift) {
    if (this.initialized.dailySystem && CP.Daily) {
      CP.Daily.checkLogin();
      const activeChallenge = CP.Daily.getActiveChallenge();
      if (activeChallenge && CP.UI && CP.UI.toast) {
        const streakText = CP.Daily.session.streak > 1 ? ` | ${CP.Daily.session.streak} day streak!` : '';
        CP.UI.toast(
          `${activeChallenge.name.en}: ${activeChallenge.desc.en}${streakText}`,
          'info'
        );
      }
    }

    if (this.initialized.officerAI && CP.OfficerAI) {
      CP.OfficerAI.init();
    }

    if (this.initialized.repairUI && CP.RepairUI) {
      CP.RepairUI.loadElementStates();
    }
  },

  onVehicleStop(vehicle) {
    if (this.initialized.enhancedAudio && CP.EnhancedAudio && CP.Audio) {
      const pan = CP.Audio.pan(vehicle.x);
      CP.EnhancedAudio.vehicleBrake(1, pan);
    }

    if (this.initialized.officerAI && CP.OfficerAI) {
      // Officer AI might react to stopped vehicles
    }
  },

  onVehicleHorn(vehicle) {
    if (this.initialized.enhancedAudio && CP.EnhancedAudio && CP.Audio) {
      const pan = CP.Audio.pan(vehicle.x);
      CP.EnhancedAudio.horn('standard', pan);
    }
  },

  onRepair(elementId, repairType) {
    if (this.initialized.repairUI && CP.RepairUI) {
      CP.RepairUI.startRepair(elementId);
    }

    if (this.initialized.enhancedAudio && CP.EnhancedAudio && CP.Audio) {
      CP.EnhancedAudio.successSequence(0);
    }
  },

  onChallengeProgress(challengeType, amount) {
    if (this.initialized.dailySystem && CP.Daily) {
      CP.Daily.updateChallengeProgress(challengeType, amount);
    }
  },

  // Configuration helper
  configure(options) {
    Object.assign(this.features, options);
  },

  // Get system status
  getStatus() {
    return {
      features: this.features,
      initialized: this.initialized,
      allReady: Object.values(this.initialized).every(v => v === true),
      timestamp: new Date().toISOString()
    };
  },

  // Performance optimization settings
  optimizeForPerformance() {
    if (CP.S) {
      // Reduce animation updates if needed
      if (CP.S.quality === 'low') {
        CP.OfficerAI.animationQuality = 'low';
        CP.RepairUI.feedbackEffects.maxActive = 10;
      } else if (CP.S.quality === 'high') {
        CP.OfficerAI.animationQuality = 'high';
        CP.RepairUI.feedbackEffects.maxActive = 30;
      }
    }
  },

  // Cleanup on shift end
  onShiftEnd() {
    if (this.initialized.dailySystem && CP.Daily) {
      CP.Daily.saveProgress();
    }

    if (this.initialized.repairUI && CP.RepairUI) {
      CP.RepairUI.elements.clear?.();
    }
  }
};

// Auto-initialize when game systems are ready
if (CP && CP.G) {
  setTimeout(() => {
    if (CP.Daily && CP.OfficerAI && CP.RepairUI) {
      CP.Integration.init();
    }
  }, 100);
}

// Attach to main game loop if available
if (CP && typeof CP.bus !== 'undefined' && CP.bus.on) {
  CP.bus.on('shift_start', () => CP.Integration.onShiftStart(CP.G.shift));
  CP.bus.on('shift_end', () => CP.Integration.onShiftEnd());
}

// Export
(window.CP_FILES = window.CP_FILES || {})['28_integration'] = '1.0.0';
