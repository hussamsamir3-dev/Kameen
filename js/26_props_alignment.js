/* Props Alignment System: Correct positioning for checkpoint structures and props across all maps.
   Ensures gates, barriers, lights, and structures are properly aligned with the scene geometry. */

CP.PropsAlign = {
  // Correct prop positions by location (x, y coordinates in world space)
  propPositions: {
    cairo: {
      gate_barrier: { x: 30.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 30.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      left_light: { x: 8.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      right_light: { x: 16.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      booth: { x: 18.0, y: 3.8, width: 3.0, height: 2.2, rotation: 0 },
      far_light: { x: 24.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      sign_checkpoint: { x: 28.5, y: 5.2, width: 1.5, height: 0.6, rotation: 0 },
      water_station: { x: 20.0, y: 3.5, width: 0.8, height: 0.8, rotation: 0 }
    },

    alex: {
      gate_barrier: { x: 28.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 28.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      checkpoint_light: { x: 7.0, y: 4.95, width: 0.4, height: 0.4, rotation: 0 },
      booth_main: { x: 16.5, y: 3.8, width: 2.8, height: 2.1, rotation: 0 },
      umbrella_stand: { x: 15.0, y: 3.5, width: 1.5, height: 1.8, rotation: 0 },
      sea_backdrop: { x: 35.0, y: 6.0, width: 40.0, height: 2.0, rotation: 0 },
      far_light: { x: 22.0, y: 4.95, width: 0.4, height: 0.4, rotation: 0 },
      sign_alexandria: { x: 26.5, y: 5.1, width: 1.8, height: 0.7, rotation: 0 }
    },

    sinai: {
      gate_barrier: { x: 29.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 29.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      left_light: { x: 12.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      right_light: { x: 22.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      checkpoint_booth: { x: 18.0, y: 3.8, width: 2.5, height: 2.0, rotation: 0 },
      security_camera: { x: 25.0, y: 5.0, width: 0.3, height: 0.3, rotation: 0 },
      desert_sand_backdrop: { x: 0, y: 1.0, width: 40.0, height: 3.0, rotation: 0 }
    },

    hurghada: {
      gate_barrier: { x: 27.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 27.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      checkpoint_light: { x: 10.0, y: 4.9, width: 0.4, height: 0.4, rotation: 0 },
      palm_tree: { x: 5.0, y: 3.2, width: 0.6, height: 3.0, rotation: 0 },
      palm_tree_2: { x: 32.0, y: 3.2, width: 0.6, height: 3.0, rotation: 0 },
      beach_backdrop: { x: 35.0, y: 5.5, width: 40.0, height: 2.5, rotation: 0 },
      booth: { x: 16.0, y: 3.8, width: 2.5, height: 2.0, rotation: 0 }
    },

    luxor: {
      gate_barrier: { x: 28.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 28.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      temple_backdrop: { x: 35.0, y: 4.0, width: 40.0, height: 4.0, rotation: 0 },
      checkpoint_light_1: { x: 8.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      checkpoint_light_2: { x: 20.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      booth: { x: 17.0, y: 3.8, width: 2.5, height: 2.0, rotation: 0 }
    },

    aswan: {
      gate_barrier: { x: 29.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 29.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      nile_backdrop: { x: 35.0, y: 5.0, width: 40.0, height: 3.0, rotation: 0 },
      checkpoint_light: { x: 9.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      felucca_sail: { x: 32.0, y: 4.0, width: 1.0, height: 3.5, rotation: 15 },
      booth: { x: 18.0, y: 3.8, width: 2.5, height: 2.0, rotation: 0 }
    },

    desert: {
      gate_barrier: { x: 30.0, y: 4.2, width: 2.5, height: 0.8, rotation: 0 },
      barrier_arm: { x: 30.2, y: 4.5, width: 1.2, height: 0.15, rotation: 0 },
      left_light: { x: 6.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      right_light: { x: 24.0, y: 5.0, width: 0.4, height: 0.4, rotation: 0 },
      booth: { x: 19.0, y: 3.8, width: 2.5, height: 2.0, rotation: 0 },
      sand_dunes: { x: 0, y: 1.0, width: 40.0, height: 3.5, rotation: 0 }
    }
  },

  // Alignment verification and correction
  verify(location) {
    const props = this.propPositions[location];
    if (!props) return { location, status: 'unknown', issues: [] };

    const issues = [];
    
    Object.entries(props).forEach(([propName, pos]) => {
      // Check for common alignment issues
      if (Math.abs(pos.y - 4.2) > 0.15 && propName.includes('gate')) {
        issues.push(`${propName}: vertical misalignment (y=${pos.y}, should be ~4.2)`);
      }
      if (Math.abs(pos.y - 5.0) > 0.1 && propName.includes('light')) {
        issues.push(`${propName}: light height misalignment (y=${pos.y}, should be ~5.0)`);
      }
      if (pos.x < 0 || pos.x > 40) {
        issues.push(`${propName}: out of bounds horizontally (x=${pos.x})`);
      }
    });

    return {
      location,
      status: issues.length === 0 ? 'aligned' : 'misaligned',
      issues,
      props: Object.keys(props).length
    };
  },

  // Get corrected position for a prop
  getPosition(location, propName) {
    const locProps = this.propPositions[location];
    if (!locProps) return null;
    return locProps[propName] || null;
  },

  // Apply alignment to render system
  applyAlignment(ctx, location, ppm) {
    const props = this.propPositions[location];
    if (!props || !ctx || !CP.R) return;

    Object.entries(props).forEach(([propName, pos]) => {
      if (!pos) return;

      const sx = CP.R.sx(pos.x);
      const sy = CP.R.sy(pos.y);
      const width = pos.width * ppm;
      const height = pos.height * ppm;

      // Draw alignment guides (debug mode)
      if (CP.DEBUG && CP.DEBUG.showPropsAlignment) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - width / 2, sy - height / 2, width, height);
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(propName, sx, sy + height / 2 + 12);
      }
    });
  },

  // Correct Alexandria props specifically
  correctAlexandriaProps() {
    // Known Alexandria alignment issues and corrections
    const corrections = {
      alex: {
        gate_barrier: { x: 28.0, y: 4.25 }, // Was misaligned by 0.15m vertically
        booth_main: { x: 16.5, y: 3.85 },    // Slight adjustment for booth height
        umbrella_stand: { x: 15.0, y: 3.6 }  // Reposition closer to booth
      }
    };

    Object.entries(corrections).forEach(([loc, props]) => {
      Object.entries(props).forEach(([propName, newPos]) => {
        if (this.propPositions[loc] && this.propPositions[loc][propName]) {
          this.propPositions[loc][propName] = {
            ...this.propPositions[loc][propName],
            ...newPos
          };
        }
      });
    });

    return this.verify('alex');
  },

  // Verify all locations
  verifyAll() {
    const results = {};
    Object.keys(this.propPositions).forEach(location => {
      results[location] = this.verify(location);
    });
    return results;
  },

  // Get alignment report
  getReport() {
    const report = { timestamp: new Date().toISOString(), locations: {} };
    Object.keys(this.propPositions).forEach(location => {
      const verification = this.verify(location);
      report.locations[location] = {
        status: verification.status,
        propCount: verification.props,
        issues: verification.issues
      };
    });
    report.summary = {
      totalLocations: Object.keys(this.propPositions).length,
      alignedLocations: Object.values(report.locations).filter(l => l.status === 'aligned').length,
      issuesFound: Object.values(report.locations).reduce((sum, l) => sum + l.issues.length, 0)
    };
    return report;
  }
};

// Initialize alignment system
CP.PropsAlign.correctAlexandriaProps();

// Export
(window.CP_FILES = window.CP_FILES || {})['26_props_alignment'] = '1.0.0';
