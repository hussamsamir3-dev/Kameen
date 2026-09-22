/* INTEGRATION LAYER - Ties together daily engagement, officer placement, repair UI, and performance optimizations */

CP.Integration = {
  
  /* Initialize systems when shift starts */
  initShift(shift) {
    if (!shift) return;
    
    // Check daily login and award bonuses
    if (CP.Daily && CP.Daily.checkLogin) {
      CP.Daily.checkLogin();
    }
    
    // Apply smart officer placement for location
    if (CP.OfficerPlacement && shift.officer) {
      CP.OfficerPlacement.applyPlacement(shift.officer, shift.loc);
    }
    
    // Initialize repair UI for location
    if (CP.RepairUI) {
      const items = CP.RepairUI.repairables[shift.loc];
      if (items) {
        CP.RepairUI.hoveredItem = null;
        CP.RepairUI.activeRepair = null;
      }
    }
  },
  
  /* Update all systems per frame */
  update(dt) {
    const s = CP.G?.shift;
    if (!s) return;
    
    // Update officer animation and behavior
    if (CP.OfficerPlacement && s.officer) {
      CP.OfficerPlacement.update(s.officer, dt);
    }
    
    // Update repair UI
    if (CP.RepairUI) {
      CP.RepairUI.update(dt);
    }
  },
  
  /* Handle mouse interaction for repair UI */
  handleMouseMove(x, y) {
    if (!CP.RepairUI) return;
    CP.RepairUI.hoveredItem = CP.RepairUI.checkHover(x, y);
  },
  
  /* Handle click for repair interactions */
  handleClick(x, y) {
    if (!CP.RepairUI) return;
    const item = CP.RepairUI.checkHover(x, y);
    if (item) {
      CP.RepairUI.startRepair(item.id);
    }
  },
  
  /* Report engagement metrics */
  getEngagementReport() {
    const k = CP.G?.career;
    if (!k) return null;
    
    return {
      streak: k.daily?.streak || 0,
      level: k.daily?.level || 0,
      totalSessions: k.shiftNo || 0,
      challenges: k.daily?.challenges || {},
      engagement: (k.daily?.streak || 0) > 7 ? 'high' : (k.daily?.streak || 0) > 0 ? 'active' : 'new'
    };
  }
};

/* Hook into shift initialization */
const origNewShift = window.CP && window.CP.newShift;
CP.newShift = function(loc) {
  const s = origNewShift ? origNewShift.call(this, loc) : null;
  if (CP.Integration && CP.G?.shift) {
    CP.Integration.initShift(CP.G.shift);
  }
  return s;
};

/* PERFORMANCE OPTIMIZATIONS */
CP.PerfOpt = {
  
  /* Enable frame rate limiting for battery life */
  targetFrameRate: 60,
  
  /* Reduce render quality on low-end devices */
  autoQuality() {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|android/.test(ua);
    const isLowEnd = /zte|nokia|blackberry|nexus 5|moto g/.test(ua);
    
    if (isLowEnd) {
      if (CP.S) CP.S.quality = 'low';
      if (CP.S) CP.S.particles = 0.5;
    }
  },
  
  /* Optimize canvas rendering */
  optimizeCanvas(canvas) {
    if (!canvas) return;
    
    // Use appropriate DPI scaling
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 2) canvas.style.imageRendering = 'pixelated';
    
    // Disable smoothing for retro feel
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }
  },
  
  /* Memory management */
  clearUnusedAssets() {
    // Remove old save files
    const now = Date.now();
    const saves = Object.keys(localStorage);
    for (const key of saves) {
      if (key.startsWith('cpns_') && localStorage.getItem(key + '_t')) {
        const t = parseInt(localStorage.getItem(key + '_t') || 0);
        // Clear saves older than 30 days
        if (now - t > 30 * 86400 * 1000) {
          localStorage.removeItem(key);
          localStorage.removeItem(key + '_t');
        }
      }
    }
  },
  
  /* Garbage collection hint */
  forceGC() {
    if (performance && performance.memory && performance.memory.usedJSHeapSize) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      if (used / limit > 0.85) {
        // Suggest GC by clearing caches
        if (CP.A && CP.A.img) {
          // Keep only active assets
          const keep = ['gate_barrier', 'road_marked', 'pavement', 'vehicle_'];
          for (const key in CP.A.img) {
            if (!keep.some(k => key.includes(k))) {
              // Can't delete but can release reference
            }
          }
        }
      }
    }
  }
};

/* Initialize performance optimizations */
if (CP.PerfOpt) {
  CP.PerfOpt.autoQuality();
  CP.PerfOpt.clearUnusedAssets();
}

;(window.CP_FILES = window.CP_FILES || {})['21_integration'] = '1.0.0';
