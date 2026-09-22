/* ENHANCED DIALOGUE SYSTEM - No duplicates, engaging options, smart variety */

CP.DriverChat = {
  /* Dialogue pools - NO DUPLICATES */
  greetings: [
    'السلام عليكم ورحمة الله',
    'صباح الخير يا ضابط',
    'نهار الخير يا أخي',
    'السلام عليكم',
    'صباحك سعيد يا سيادة الضابط',
    'تمام يا أستاذ؟'
  ],
  
  paperCheck: [
    'أوراقي موجودة معي يا سيادة',
    'كل الأوراق تمام يا حضرة الضابط',
    'إن شاء الله الأوراق موجودة',
    'بتوع في الشنطة فوق',
    'ما فيش مشكلة يا سيادة الضابط'
  ],
  
  defenseClean: [
    'والله أنا نظيف',
    'ما في حاجة عندي يا سيادة',
    'أنا صحيح يا حاج',
    'ما حملت حاجة غير الحلال',
    'لا يا سيادة الضابط، أنا شغال عادي'
  ],
  
  defenseInvolved: [
    'أنا آسف يا سيادة',
    'ما كنت أعرف يا حاج',
    'حدثت غلطة يا سيادة الضابط',
    'والله ما قصدت شيء',
    'أنا مجرد نقل يا سيادة'
  ],
  
  negotiatePolite: [
    'يمكن يا سيادة لو سمحت؟',
    'في حل يا حاج؟',
    'هل ممكن نحل الموضوع؟',
    'يا ريت يا سيادة الضابط',
    'ممكن حاجة يا عم؟'
  ],
  
  negotiateBribe: [
    'أنا فاهم يا سيادة... عايز حاجة؟',
    'نفسك في حاجة يا حاج؟',
    'وقفة بسيطة يا سيادة؟',
    'ممكن نتفاهم؟',
    'أنا في الخدمة يا ضابط'
  ],
  
  refusal: [
    'والله ما عندي يا سيادة',
    'أنا مضروش يا حاج',
    'ما في معي حاجة',
    'عايز إيه يا سيادة الضابط؟',
    'لا يا حاج، أنا شغال زي الناس'
  ],
  
  success: [
    'شكراً يا حاج، رب يديم الخير',
    'ربنا يحفظك يا سيادة',
    'السلام عليكم ورحمة الله وبركاته',
    'شكراً يا ضابط، الله ينعم عليك',
    'رب يصير كل خير يا سيادة'
  ],
  
  arrest: [
    'لا يا سيادة الضابط، أنا بس...',
    'والله أنا بريء يا حاج!',
    'ما تفعل كده يا سيادة!',
    'هذا ظلم يا ضابط!',
    'أنا بشرح الموضوع يا حاج...'
  ],
  
  /* Get random from pool */
  random(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
  },
  
  /* Generate options for vehicle */
  getOptions(vehicle, caseData) {
    const options = [];
    
    // Papers check
    options.push({
      label: '🗂️ أوراق',
      action: 'check_papers',
      reply: this.random(this.paperCheck)
    });
    
    // Defense (varies based on case)
    if (caseData && caseData.type) {
      options.push({
        label: '🚗 دفاع',
        action: 'defense',
        reply: caseData.guilty > 0.5 ? 
          this.random(this.defenseInvolved) :
          this.random(this.defenseClean)
      });
    }
    
    // Negotiation (if case exists)
    if (caseData && !caseData.res) {
      options.push({
        label: '💬 تفاوض',
        action: 'negotiate',
        reply: this.random(this.negotiatePolite)
      });
      
      // Corruption route (never suggest directly)
      if (vehicle.driver && vehicle.driver.mood < 0.4) {
        options.push({
          label: '💰 (شبهة)',
          action: 'bribe_attempt',
          reply: this.random(this.negotiateBribe)
        });
      }
    }
    
    // Arrest/Send
    if (caseData && (caseData.type === 'weapon' || caseData.type === 'drugs')) {
      options.push({
        label: '⚠️ احبس',
        action: 'arrest',
        reply: this.random(this.arrest)
      });
    }
    
    return options;
  }
};

;(window.CP_FILES = window.CP_FILES || {})['27_dialogue'] = '1.0.0';
