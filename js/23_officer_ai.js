/* Advanced Officer AI System: Context-aware animation sequencing, smart positioning, realistic behaviors.
   Each officer has dual animation sequences (walk + idle) with intelligent state management.
   Behaviors: traffic control, inspections, patrols, incidents, medical response. */

CP.OfficerAI = {
  // Officer role definitions with animation states
  roles: {
    traffic_control: { walk: 'walk_gesture', idle: 'idle_waiting', active: 'signal_stop', secondary: 'signal_go' },
    inspection: { walk: 'walk_casual', idle: 'idle_checking', active: 'inspect_vehicle', secondary: 'idle_document' },
    patrol: { walk: 'walk_alert', idle: 'idle_observing', active: 'radio_alert', secondary: 'idle_calm' },
    response: { walk: 'walk_urgent', idle: 'idle_ready', active: 'assist_medical', secondary: 'idle_concerned' },
    checkpoint: { walk: 'walk_standard', idle: 'idle_standard', active: 'checkpoint_wave', secondary: 'idle_stern' }
  },

  // Map-specific officer positions (x, row, role)
  mapPositions: {
    cairo: [
      { x: 8, row: 0, role: 'traffic_control', name: 'Cairo Traffic' },
      { x: 16, row: 0.3, role: 'inspection', name: 'Cairo Inspector' },
      { x: 24, row: 0, role: 'checkpoint', name: 'Cairo Gate' }
    ],
    alex: [
      { x: 7, row: 0.2, role: 'traffic_control', name: 'Alex Traffic' },
      { x: 15, row: 0, role: 'checkpoint', name: 'Alex Checkpoint' },
      { x: 22, row: 0.4, role: 'patrol', name: 'Alex Patrol' }
    ],
    sinai: [
      { x: 9, row: 0, role: 'checkpoint', name: 'Sinai Gate' },
      { x: 18, row: 0.3, role: patrol', name: 'Sinai Patrol' }
    ],
    hurghada: [
      { x: 8, row: 0.1, role: 'checkpoint', name: 'Hurghada Gate' },
      { x: 20, row: 0, role: 'traffic_control', name: 'Hurghada Traffic' }
    ],
    luxor: [
      { x: 7.5, row: 0, role: 'checkpoint', name: 'Luxor Checkpoint' },
      { x: 17, row: 0.2, role: 'patrol', name: 'Luxor Patrol' }
    ],
    aswan: [
      { x: 9, row: 0, role: 'checkpoint', name: 'Aswan Gate' },
      { x: 19, row: 0.1, role: 'traffic_control', name: 'Aswan Traffic' }
    ],
    desert: [
      { x: 12, row: 0, role: 'checkpoint', name: 'Desert Checkpoint' },
      { x: 22, row: 0.2, role: 'patrol', name: 'Desert Patrol' }
    ]
  },

  // Animation state machine for officers
  states: {
    IDLE: 'idle',
    WALKING: 'walking',
    SIGNAL_STOP: 'signal_stop',
    SIGNAL_GO: 'signal_go',
    INSPECT: 'inspect',
    RADIO: 'radio',
    ASSIST: 'assist',
    WAIT: 'wait'
  },

  init() {
    this.officers = {};
    this.activeStates = new WeakMap();
    this.animationQueues = new WeakMap();
  },

  // Get officer animations based on context
  getAnimation(officer, context) {
    const role = officer.role || 'checkpoint';
    const roleConfig = this.roles[role] || this.roles.checkpoint;

    if (context === 'urgent') return roleConfig.active;
    if (context === 'patrolling') return roleConfig.walk;
    if (context === 'waiting') return roleConfig.idle;
    if (context === 'secondary') return roleConfig.secondary;
    
    return officer.moving ? roleConfig.walk : roleConfig.idle;
  },

  // Smart officer positioning based on vehicle flow
  updateOfficerPosition(officer, dt, vehicleNear) {
    if (!officer.patrol) return; // Only move if in patrol mode

    const speed = 1.2; // m/s walking speed
    const targetX = vehicleNear ? vehicleNear.x - 2 : officer.home_x;
    const dx = targetX - officer.x;

    if (Math.abs(dx) > 0.1) {
      officer.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
      officer.moving = true;
      officer.state = this.states.WALKING;
    } else {
      officer.moving = false;
      officer.state = this.states.IDLE;
    }
  },

  // Queue contextual animation sequences
  queueAnimation(officer, sequence) {
    if (!this.animationQueues.has(officer)) {
      this.animationQueues.set(officer, []);
    }
    this.animationQueues.get(officer).push(sequence);
  },

  // Execute animation sequences with timing
  executeSequence(officer, sequence, dt) {
    const durations = {
      signal_stop: [0.3, 0.4, 0.5],      // raise arm, hold, lower
      signal_go: [0.3, 0.2, 0.5],        // wave, wave, lower
      inspect_vehicle: [0.5, 1.2, 0.5],  // approach, inspect, back up
      radio_alert: [0.2, 0.8, 0.3],      // radio to ear, listen, lower
      assist_medical: [1, 2, 1]          // bend, assist, straighten
    };

    if (!officer.seqTime) officer.seqTime = 0;
    officer.seqTime += dt;

    const dur = durations[sequence] || [0.5, 0.5, 0.5];
    const totalDur = dur.reduce((a, b) => a + b, 0);

    if (officer.seqTime >= totalDur) {
      officer.seqTime = 0;
      return true; // Sequence complete
    }

    // Determine which frame of sequence we're in
    let elapsed = officer.seqTime;
    for (let i = 0; i < dur.length; i++) {
      if (elapsed < dur[i]) {
        officer.animPhase = i;
        return false;
      }
      elapsed -= dur[i];
    }
  },

  // Behavior: Traffic control - signal vehicles
  trafficControl(officer, vehicleNear, dt) {
    if (!vehicleNear) {
      officer.state = this.states.WAIT;
      return;
    }

    const approaching = vehicleNear.x < officer.x + 1 && vehicleNear.x > officer.x - 2;
    
    if (approaching) {
      if (vehicleNear.stopped) {
        officer.state = this.states.SIGNAL_GO;
        this.executeSequence(officer, 'signal_go', dt);
      } else {
        officer.state = this.states.SIGNAL_STOP;
        this.executeSequence(officer, 'signal_stop', dt);
      }
    } else {
      officer.state = this.states.IDLE;
    }
  },

  // Behavior: Checkpoint enforcement
  checkpointControl(officer, vehicleNear, dt) {
    if (vehicleNear && vehicleNear.x > officer.x - 1 && vehicleNear.x < officer.x + 1) {
      officer.state = this.states.SIGNAL_STOP;
      officer.direction = vehicleNear.x > officer.x ? -1 : 1;
      this.executeSequence(officer, 'signal_stop', dt);
    } else {
      officer.state = this.states.IDLE;
    }
  },

  // Behavior: Patrol mode - responsive positioning
  patrol(officer, incidents, dt) {
    const urgentIncident = incidents.find(i => i.severity === 'high');
    
    if (urgentIncident) {
      officer.state = this.states.RADIO;
      officer.direction = urgentIncident.x > officer.x ? 1 : -1;
      this.executeSequence(officer, 'radio_alert', dt);
      // Move toward incident
      this.updateOfficerPosition(officer, dt, urgentIncident);
    } else {
      officer.state = this.states.WALKING;
      officer.moving = true;
    }
  },

  // Main update loop for all officers
  update(dt) {
    const s = CP.G && CP.G.shift;
    if (!s) return;

    const location = s.loc;
    const positions = this.mapPositions[location] || this.mapPositions.cairo;

    positions.forEach((pos, idx) => {
      const id = location + '_' + idx;
      if (!this.officers[id]) {
        this.officers[id] = {
          id, ...pos,
          x: pos.x, row: pos.row,
          home_x: pos.x,
          moving: false,
          state: this.states.IDLE,
          direction: 1,
          animPhase: 0,
          seqTime: 0
        };
      }

      const officer = this.officers[id];
      const vehicles = s.vehicles || [];
      const nearby = vehicles.find(v => Math.abs(v.x - officer.x) < 5 && !v.special);

      // Execute role-specific behavior
      switch (officer.role) {
        case 'traffic_control':
          this.trafficControl(officer, nearby, dt);
          break;
        case 'checkpoint':
          this.checkpointControl(officer, nearby, dt);
          break;
        case 'patrol':
          this.patrol(officer, vehicles.filter(v => v.incident), dt);
          break;
        case 'inspection':
          if (nearby) officer.state = this.states.INSPECT;
          else officer.state = this.states.IDLE;
          break;
        case 'response':
          const emergency = vehicles.find(v => v.special === 'ambulance' || v.incident);
          if (emergency) this.updateOfficerPosition(officer, dt, emergency);
          break;
      }
    });
  },

  // Get current animation frame for rendering
  getFrame(officer) {
    const animation = this.getAnimation(officer, undefined);
    const phase = officer.animPhase || 0;
    return `officer_${animation}_${phase}`;
  },

  // Get all officers for rendering
  getRenderList() {
    return Object.values(this.officers);
  }
};

// Export
(window.CP_FILES = window.CP_FILES || {})['23_officer_ai'] = '1.0.0';
