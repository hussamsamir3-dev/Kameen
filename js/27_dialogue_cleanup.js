/* Dialogue System Cleanup: Remove duplicate options, increase dialogue variety, 
   streamline conversation flow, and improve player experience. */

CP.DialogueCleanup = {
  // Track used dialogue options to prevent repetition within a session
  usageTracker: new Map(),
  
  // Alternative dialogue options to reduce repetition
  alternativeResponses: {
    ask_destination: [
      { ar: 'وجهتك فين؟', en: 'Where are you headed?' },
      { ar: 'فين الوجهة؟', en: 'Your destination?' },
      { ar: 'قول لي فين رايح.', en: 'Tell me where you\'re going.' }
    ],
    ask_origin: [
      { ar: 'طلعت منين؟', en: 'Where did you come from?' },
      { ar: 'جاية من فين؟', en: 'Coming from where?' },
      { ar: 'نقطة البداية فين؟', en: 'What\'s your starting point?' }
    ],
    ask_purpose: [
      { ar: 'في إيه؟', en: 'What\'s the purpose?' },
      { ar: 'روحتك ليه؟', en: 'What\'s this trip for?' },
      { ar: 'السبب إيه؟', en: 'Reason for the trip?' }
    ],
    ask_passengers: [
      { ar: 'كام واحد معاك؟', en: 'How many passengers?' },
      { ar: 'كام راكب في الحتة؟', en: 'How many riders?' },
      { ar: 'الركاب كام؟', en: 'Passenger count?' }
    ],
    ask_health: [
      { ar: 'تمام التمام؟', en: 'Everything okay?' },
      { ar: 'صحتك كويسة؟', en: 'You doing alright?' },
      { ar: 'في حاجة تقلقك؟', en: 'Something wrong?' }
    ],
    ask_drink: [
      { ar: 'شربت أي حاجة النهارده؟', en: 'Had anything to drink today?' },
      { ar: 'في دوا أو حاجة؟', en: 'Any medication or substances?' },
      { ar: 'تحت تأثير حاجة؟', en: 'Under the influence of anything?' }
    ]
  },

  // Condense repeat options
  repeatResponses: {
    patient: [
      { ar: 'استني شوية، هكرر السؤال.', en: 'Bear with me, I\'ll ask again.' },
      { ar: 'سؤال سريع تاني.', en: 'One more quick question.' },
      { ar: 'بس بسؤال واحد بتاني.', en: 'Just one more thing.' }
    ],
    impatient: [
      { ar: 'ما حدتيش قول كويس. كرري.', en: 'Didn\'t catch that. Repeat.' },
      { ar: 'سمعتك بالكويس. قول تاني.', en: 'Heard you. Say it again.' },
      { ar: 'هكرر السؤال لو سمحتي.', en: 'Repeating the question.' }
    ]
  },

  // Filter out duplicate intents
  deduplicateIntents(intentions) {
    if (!Array.isArray(intentions)) return intentions;

    const seen = new Set();
    const filtered = [];

    intentions.forEach(intent => {
      if (!seen.has(intent)) {
        seen.add(intent);
        filtered.push(intent);
      }
    });

    return filtered;
  },

  // Rotate dialogue variety based on usage
  selectVariant(intentKey, toneKey, usage = 0) {
    const alts = this.alternativeResponses[intentKey];
    if (!alts || alts.length === 0) return null;

    // Cycle through alternatives based on usage count
    const index = usage % alts.length;
    return alts[index];
  },

  // Track dialogue option usage within a case
  trackUsage(caseId, intentKey) {
    const key = `${caseId}:${intentKey}`;
    const current = this.usageTracker.get(key) || 0;
    this.usageTracker.set(key, current + 1);
    return current;
  },

  // Clean up case dialogue log (remove duplicates)
  cleanCaseLog(caseLog) {
    if (!Array.isArray(caseLog)) return caseLog;

    const cleaned = [];
    const seen = new Set();

    caseLog.forEach(entry => {
      const key = `${entry.who}:${JSON.stringify(entry.text)}`;
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(entry);
      }
    });

    return cleaned;
  },

  // Reduce repetitive question chains
  optimizeQuestionOrder(intents) {
    if (!Array.isArray(intents)) return intents;

    // Reorder to ask most important questions first
    const priority = [
      'greet_docs', 'ask_destination', 'ask_origin',
      'ask_purpose', 'ask_health', 'ask_lookout',
      'settle_dispute', 'mediate', 'close'
    ];

    return intents.sort((a, b) => {
      const aIdx = priority.indexOf(a);
      const bIdx = priority.indexOf(b);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });
  },

  // Merge similar dialogue options
  mergeOptions(optionA, optionB) {
    if (!optionA || !optionB) return optionA || optionB;

    // If options have similar intent, merge them
    const merged = {
      ar: optionA.ar || optionB.ar,
      en: optionA.en || optionB.en
    };

    return merged;
  },

  // Get optimized dialogue flow for a case
  getOptimizedFlow(caseObj) {
    if (!caseObj) return [];

    const intents = CP.Dlg.intents(caseObj);
    const deduped = this.deduplicateIntents(intents);
    const optimized = this.optimizeQuestionOrder(deduped);

    return optimized;
  },

  // Apply cleanup to dialogue system
  applyCleanup() {
    if (!CP.Dlg) return false;

    // Wrapper for intents function
    const originalIntents = CP.Dlg.intents;
    CP.Dlg.intents = function(c) {
      const intents = originalIntents.call(this, c);
      return CP.DialogueCleanup.deduplicateIntents(intents);
    };

    // Wrapper for ask function to track usage
    const originalAsk = CP.Dlg.ask;
    CP.Dlg.ask = function(c, intent, tone) {
      CP.DialogueCleanup.trackUsage(c.id, intent);
      return originalAsk.call(this, c, intent, tone);
    };

    return true;
  },

  // Generate dialogue statistics
  getStatistics() {
    const stats = {
      totalTracked: this.usageTracker.size,
      mostUsedIntents: [],
      caseStats: {}
    };

    // Find most repeated intents
    const intentsMap = new Map();
    this.usageTracker.forEach((count, key) => {
      const [caseId, intent] = key.split(':');
      intentsMap.set(intent, (intentsMap.get(intent) || 0) + count);
    });

    stats.mostUsedIntents = Array.from(intentsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));

    return stats;
  },

  // Clear usage history (for new session)
  clearHistory() {
    this.usageTracker.clear();
  }
};

// Initialize cleanup on system startup
if (CP.Dlg) {
  CP.DialogueCleanup.applyCleanup();
}

// Export
(window.CP_FILES = window.CP_FILES || {})['27_dialogue_cleanup'] = '1.0.0';
