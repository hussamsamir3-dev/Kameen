/* Authored content data (fictional). Bilingual pairs are [Arabic, English]. */
CP.C = {};

/* ---------------- people ---------------- */
CP.C.maleFirst = [['محمد','Mohamed'],['أحمد','Ahmed'],['محمود','Mahmoud'],['مصطفى','Mostafa'],['حسن','Hassan'],['كريم','Karim'],['عمرو','Amr'],['إبراهيم','Ibrahim'],['شريف','Sherif'],['يوسف','Youssef'],['عادل','Adel'],['سامح','Sameh'],['طارق','Tarek'],['وليد','Walid'],['رامي','Ramy'],['هشام','Hesham'],['سيد','Sayed'],['عبده','Abdo'],['مينا','Mina'],['جرجس','Girgis'],['خالد','Khaled'],['أشرف','Ashraf']];
CP.C.femaleFirst = [['منى','Mona'],['هبة','Heba'],['نادية','Nadia'],['سارة','Sara'],['دينا','Dina'],['إيمان','Eman'],['ياسمين','Yasmin'],['فاطمة','Fatma'],['رانيا','Rania'],['مريم','Mariam'],['نهى','Noha'],['عزة','Azza']];
CP.C.family = [['السيد','El-Sayed'],['عبد الله','Abdallah'],['عبد الرحمن','Abdelrahman'],['فهمي','Fahmy'],['منصور','Mansour'],['الشاذلي','El-Shazly'],['سليمان','Soliman'],['رزق','Rizk'],['عثمان','Osman'],['بدوي','Badawi'],['نصار','Nassar'],['الجمال','El-Gamal'],['خليل','Khalil'],['حنا','Hanna'],['شحاتة','Shehata'],['النجار','El-Naggar'],['عيسى','Eissa'],['قنديل','Kandil']];
/* portraits & civilian figures: index → gender / age band. Numeric pairing is organisational only. */
CP.C.portraits = {
  1: { g: 'm', age: 'mid' }, 2: { g: 'm', age: 'old' }, 3: { g: 'm', age: 'young' }, 4: { g: 'f', age: 'young' },
  5: { g: 'f', age: 'mid' }, 6: { g: 'm', age: 'mid' }, 7: { g: 'm', age: 'young' }, 8: { g: 'f', age: 'young' },
  9: { g: 'm', age: 'old' }, 10: { g: 'm', age: 'young' }, 11: { g: 'm', age: 'mid' }, 12: { g: 'f', age: 'mid' },
  13: { g: 'f', age: 'mid' }, 14: { g: 'm', age: 'old' }, 15: { g: 'f', age: 'young' }, 16: { g: 'm', age: 'mid' },
  17: { g: 'm', age: 'young' }, 18: { g: 'f', age: 'old' }, 19: { g: 'm', age: 'mid' }, 20: { g: 'f', age: 'young' },
  21: { g: 'f', age: 'mid' }, 22: { g: 'm', age: 'old' }, 23: { g: 'm', age: 'young' }, 24: { g: 'f', age: 'mid' },
  25: { g: 'm', age: 'young' }, 26: { g: 'f', age: 'mid' }, 27: { g: 'm', age: 'young' }, 28: { g: 'f', age: 'mid' },
  29: { g: 'f', age: 'mid' }, 30: { g: 'm', age: 'mid' }, 31: { g: 'f', age: 'mid' }, 32: { g: 'm', age: 'old' },
  33: { g: 'f', age: 'old' }, 34: { g: 'm', age: 'old' }, 35: { g: 'f', age: 'young' }, 36: { g: 'm', age: 'mid' }
};
CP.C.civFemale = [4, 5, 8, 12];
CP.C.civMale = [1, 2, 3, 6, 7, 9, 10, 11];
CP.C.personalities = ['patient', 'chatty', 'anxious', 'impatient', 'defensive'];
CP.C.persLabel = { patient: ['هادي', 'Patient'], chatty: ['رغاي', 'Chatty'], anxious: ['متوتر', 'Anxious'], impatient: ['مستعجل', 'Impatient'], defensive: ['متحفز', 'Defensive'] };
CP.C.relations = {
  brother: ['أخويا', 'my brother'], father: ['أبويا', 'my father'], uncle: ['خالي', 'my uncle'], cousin: ['ابن عمي', 'my cousin'],
  employer: ['صاحب الشغل', 'my employer'], friend: ['صاحبي', 'my friend'], husband: ['جوزي', 'my husband'], sister: ['أختي', 'my sister']
};
CP.C.addresses = {
  cairo: [['مدينة نصر، القاهرة','Nasr City, Cairo'],['شبرا، القاهرة','Shubra, Cairo'],['المعادي، القاهرة','Maadi, Cairo'],['إمبابة، الجيزة','Imbaba, Giza'],['حلوان، القاهرة','Helwan, Cairo'],['الهرم، الجيزة','Haram, Giza'],['عين شمس، القاهرة','Ain Shams, Cairo'],['المطرية، القاهرة','Matariya, Cairo']],
  desert: [['الإسكندرية','Alexandria'],['وادي النطرون','Wadi El Natrun'],['السادات','Sadat City'],['كفر الدوار','Kafr El Dawwar'],['٦ أكتوبر، الجيزة','6th of October, Giza'],['دمنهور','Damanhour']]
};

/* ---------------- journeys ---------------- */
CP.C.places = {
  cairo: [['المعادي','Maadi'],['مدينة نصر','Nasr City'],['شبرا','Shubra'],['الهرم','Haram'],['التجمع','New Cairo'],['حلوان','Helwan'],['رمسيس','Ramses'],['المهندسين','Mohandessin'],['العباسية','Abbasiya'],['٦ أكتوبر','6th of October'],['العتبة','Ataba'],['المطار','the airport']],
  desert: [['إسكندرية','Alexandria'],['وادي النطرون','Wadi El Natrun'],['العلمين','El Alamein'],['السادات','Sadat City'],['القاهرة','Cairo'],['مطروح','Matrouh'],['برج العرب','Borg El Arab'],['كفر الدوار','Kafr El Dawwar']]
};
CP.C.purposes = [
  { id: 'home', t: ['مروّح من الشغل', 'heading home from work'] },
  { id: 'work', t: ['رايح وردية الليل', 'going to a night shift'] },
  { id: 'family', t: ['رايح أزور أهلي', 'visiting family'] },
  { id: 'hospital', t: ['رايح أزور قريبي في المستشفى', 'visiting a relative in hospital'] },
  { id: 'airport', t: ['رايح أجيب قريبي من المطار', 'picking a relative up from the airport'] },
  { id: 'wedding', t: ['رايحين فرح', 'going to a wedding'] },
  { id: 'errand', t: ['بجيب حاجات للبيت', 'running errands for the house'] },
  { id: 'fares', t: ['شغال على الخط، ده آخر دور', 'working my route — this is the last trip'] },
  { id: 'delivery', t: ['بسلّم طلبيات', 'making deliveries'] },
  { id: 'cargo', t: ['شايل بضاعة للمخزن', 'carrying goods to a depot'] },
  { id: 'tour', t: ['راجعين من رحلة', 'returning from a group trip'] }
];

/* ---------------- plates ---------------- */
CP.C.plateLetters = [['أ','A'],['ب','B'],['ج','G'],['د','D'],['ر','R'],['س','S'],['ص','S'],['ط','T'],['ع','E'],['ف','F'],['ق','K'],['ل','L'],['م','M'],['ن','N'],['هـ','H'],['و','W'],['ى','Y']];

/* ---------------- vehicles (gameplay parameters; art calibration comes from the manifest) ---------------- */
CP.C.veh = {
  classic_sedan:  { driver: 'm', cls: 'private', lic: 'private', maxV: 11, acc: 2.0, dec: 5.0, pax: [0, 3], win: 0.58, make: ['لادا ٢١٠٧','Lada 2107'], colour: ['بيج','Beige'], w: { cairo: 9, desert: 5 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  silver_sedan:   { driver: 'm', cls: 'private', lic: 'private', maxV: 13, acc: 2.6, dec: 6.0, pax: [0, 3], win: 0.60, make: ['تويوتا كورولا','Toyota Corolla'], colour: ['فضي','Silver'], w: { cairo: 10, desert: 9 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  cairo_taxi:     { driver: 'm', cls: 'taxi', lic: 'pro', maxV: 11, acc: 2.1, dec: 5.2, pax: [0, 3], win: 0.60, make: ['لادا ٢١٠٧','Lada 2107'], colour: ['أسود وأبيض','Black & white'], w: { cairo: 10, desert: 2 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  charcoal_suv:   { driver: 'm', cls: 'private', lic: 'private', maxV: 13, acc: 2.4, dec: 6.0, pax: [0, 4], win: 0.60, make: ['هيونداي توسان','Hyundai Tucson'], colour: ['رمادي غامق','Charcoal'], w: { cairo: 6, desert: 7 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  microbus:       { driver: 'm', cls: 'passenger', lic: 'pro', maxV: 11, acc: 1.6, dec: 4.5, pax: [4, 13], win: 0.78, make: ['تويوتا هاي إس','Toyota Hiace'], colour: ['أبيض','White'], w: { cairo: 14, desert: 7 }, zones: ['driver', 'seats', 'luggage', 'floor', 'storage'], interior: true },
  older_minibus:  { driver: 'm', cls: 'passenger', lic: 'pro', maxV: 10, acc: 1.4, dec: 4.2, pax: [3, 10], win: 0.80, make: ['ميتسوبيشي L300','Mitsubishi L300'], colour: ['أبيض','White'], w: { cairo: 7, desert: 4 }, zones: ['cabin', 'seats', 'floor', 'cargo'] },
  city_bus:       { driver: 'm', cls: 'passenger', lic: 'pro', maxV: 9, acc: 1.0, dec: 3.5, pax: [8, 30], win: 0.93, make: ['نصر','Nasr'], colour: ['بيج','Cream'], w: { cairo: 4, desert: 0 }, zones: ['cabin', 'seats', 'floor'] },
  cargo_truck:    { driver: 'm', cls: 'cargo', lic: 'pro', maxV: 9, acc: 1.0, dec: 3.8, pax: [0, 1], win: 0.89, make: ['إيسوزو NPR','Isuzu NPR'], colour: ['بيج','Cream'], w: { cairo: 4, desert: 9 }, zones: ['cabin', 'glovebox', 'cargo'] },
  courier_van:    { cls: 'cargo', lic: 'private', maxV: 12, acc: 2.0, dec: 5.5, pax: [0, 1], win: 0.62, make: ['بيجو بارتنر','Peugeot Partner'], colour: ['أبيض','White'], w: { cairo: 6, desert: 4 }, zones: ['cabin', 'glovebox', 'cargo'] },
  coach:          { cls: 'passenger', lic: 'pro', maxV: 10, acc: 0.9, dec: 3.4, pax: [12, 40], win: 0.95, make: ['يوتونج','Yutong'], colour: ['أصفر','Yellow'], w: { cairo: 2, desert: 5 }, zones: ['cabin', 'seats', 'cargo'] },
  ambulance:      { cls: 'service', lic: 'pro', maxV: 14, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.78, make: ['فورد ترانزيت','Ford Transit'], colour: ['أبيض','White'], w: { cairo: 0, desert: 0 }, zones: [] },
  estate_wagon:   { cls: 'private', lic: 'private', maxV: 12, acc: 1.9, dec: 5.0, pax: [0, 4], win: 0.62, make: ['بيجو ٥٠٤ ستيشن','Peugeot 504 Estate'], colour: ['بيج','Beige'], w: { cairo: 6, desert: 8 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  green_pickup:   { cls: 'cargo', lic: 'private', maxV: 11, acc: 1.8, dec: 5.0, pax: [0, 1], win: 0.72, make: ['تويوتا هايلكس','Toyota Hilux'], colour: ['أخضر','Green'], w: { cairo: 4, desert: 8 }, zones: ['cabin', 'glovebox', 'cargo'] },
  white_luxury:   { cls: 'private', lic: 'private', maxV: 14, acc: 3.0, dec: 6.5, pax: [0, 3], win: 0.60, make: ['بي إم دبليو الفئة الخامسة','BMW 5 Series'], colour: ['أبيض','White'], w: { cairo: 5, desert: 4 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  box_truck:      { cls: 'cargo', lic: 'pro', maxV: 10, acc: 1.3, dec: 4.2, pax: [0, 1], win: 0.86, make: ['دي إف إس كيه صندوق','DFSK box truck'], colour: ['أزرق','Blue'], w: { cairo: 5, desert: 6 }, zones: ['cabin', 'glovebox', 'cargo'] },
  red_classic:    { cls: 'private', lic: 'private', maxV: 11, acc: 1.8, dec: 4.8, pax: [0, 4], win: 0.60, make: ['نصر ١٢٨','Nasr 128'], colour: ['أحمر','Red'], w: { cairo: 8, desert: 5 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  blue_hatch:     { cls: 'private', lic: 'private', maxV: 12, acc: 2.0, dec: 5.2, pax: [0, 3], win: 0.62, make: ['دايهاتسو شاريد','Daihatsu Charade'], colour: ['أزرق فاتح','Light blue'], w: { cairo: 7, desert: 3 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  alex_taxi:      { cls: 'taxi', lic: 'pro', maxV: 11, acc: 1.9, dec: 5.0, pax: [0, 3], win: 0.60, make: ['فيات ١٢٨','Fiat 128'], colour: ['أصفر وأسود','Yellow & black'], w: { cairo: 5, desert: 1 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  maroon_hatch:   { cls: 'private', lic: 'private', maxV: 13, acc: 2.6, dec: 6.0, pax: [0, 3], win: 0.62, make: ['كيا ريو','Kia Rio'], colour: ['نبيتي','Maroon'], w: { cairo: 8, desert: 4 }, zones: ['cabin', 'glovebox', 'seats', 'boot'] },
  pol_traffic_sedan: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_sedan: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_hatch: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_suv: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_4x4: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_pickup: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_van: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_hiace: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_armored: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  pol_tow: { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.7, make: ['الشرطة','Police'], colour: ['أزرق وأبيض','Navy & white'], w: { cairo: 0, desert: 0 }, zones: ['cabin'] },
  police_pickup:  { cls: 'service', lic: 'pro', maxV: 13, acc: 2.4, dec: 6.0, pax: [1, 2], win: 0.62, make: ['تويوتا هايلكس','Toyota Hilux'], colour: ['أسود','Black'], w: { cairo: 0, desert: 0 }, zones: [] }
};

/* ---------------- items ---------------- */
CP.C.items = {
  water_bottle: { name: ['زجاجة مية', 'Water bottle'], desc: ['مية معدنية، نص مليانة.', 'Mineral water, half full.'] },
  snack: { name: ['كيس شيبسي', 'Snack bag'], desc: ['كيس شيبسي مفتوح.', 'An opened bag of crisps.'] },
  phone: { name: ['موبايل', 'Phone'], desc: ['موبايل شخصي. محتواه مش جزء من التفتيش.', 'Personal phone. Its contents are not part of this search.'] },
  wallet: { name: ['محفظة', 'Wallet'], desc: ['كروت وفلوس قليلة.', 'Cards and a little cash.'] },
  keys: { name: ['مفاتيح', 'Keys'], desc: ['مفاتيح بيت على ميدالية.', 'House keys on a keyring.'] },
  notebook: { name: ['كشكول', 'Notebook'], desc: ['كشكول صغير.', 'A small notebook.'] },
  paper_stack: { name: ['ورق', 'Papers'], desc: ['رزمة ورق.', 'A stack of papers.'] },
  medicine_carton: { name: ['علبة دوا', 'Medicine carton'], desc: ['علبة دوا.', 'A medicine carton.'] },
  duffel_closed: { name: ['شنطة سفر', 'Duffel bag'], desc: ['شنطة سفر مقفولة.', 'A closed duffel bag.'], container: true },
  duffel_open: { name: ['شنطة سفر مفتوحة', 'Open duffel'], desc: ['شنطة مفتوحة.', 'An open duffel bag.'] }
};
/* variants refine descriptions and identification results */
CP.C.itemVariants = {
  notebook_fares: { desc: ['حسابات الأجرة لليوم، أرقام وأسماء مواقف.', "Today's fare tallies with stop names."], id: ['حسابات شغل عادية.', 'Ordinary work records.'], lawful: true },
  notebook_plain: { desc: ['مواعيد ونمر تليفونات.', 'Appointments and phone numbers.'], id: ['غرض شخصي.', 'Personal item.'], lawful: true },
  paper_prescription: { desc: ['روشتة باسم صاحب الشنطة ومختومة من عيادة.', "A stamped clinic prescription in the bag owner's name."], id: ['روشتة سليمة، الاسم مطابق.', 'Valid prescription; the name matches.'], lawful: true },
  paper_contract: { desc: ['عقد بيع ابتدائي للعربية، تاريخه من أسبوع.', 'A preliminary sale contract for this vehicle, dated last week.'], id: ['عقد بيع ابتدائي — مش بيلغي بلاغ قائم.', 'A preliminary sale contract — it does not cancel an active report.'], lawful: true },
  paper_invoice: { desc: ['فواتير توريد لصيدليات، عليها ختم شركة توزيع.', "Pharmacy supply invoices stamped by a distributor."], id: ['الفواتير مطابقة للكراتين وأرقام التشغيلة.', 'Invoices match the cartons and batch numbers.'], lawful: true },
  paper_blank: { desc: ['ورق توصيل بدون أختام ولا عناوين واضحة.', 'Delivery slips with no stamps or clear addresses.'], id: ['ورق مش بيثبت مصدر البضاعة.', 'Papers do not establish where the goods came from.'], lawful: false },
  paper_receipts: { desc: ['إيصالات بنزين وكارتة.', 'Fuel and toll receipts.'], id: ['إيصالات عادية.', 'Ordinary receipts.'], lawful: true },
  med_otc: { desc: ['مسكن ألم عادي، علبة مقفولة عليها تاريخ صلاحية.', 'Ordinary pain-relief tablets, sealed and dated.'], id: ['دوا عادي بيتباع في الصيدليات.', 'Common pharmacy medication.'], lawful: true },
  med_rx: { desc: ['دوا بروشتة، شريط ناقص حباية.', 'Prescription medicine, one tablet missing from the strip.'], id: ['دوا بروشتة ومطابق للروشتة الموجودة.', 'Prescription medicine matching the prescription found.'], lawful: true },
  med_rx_noscript: { desc: ['دوا بروشتة، مفيش روشتة معاه.', 'Prescription medicine; no prescription with it.'], id: ['دوا معروف بيتصرف بروشتة. محتاج تأكيد الروشتة، مش إدانة.', 'A known prescription drug. The prescription should be confirmed; this is not an offence by itself.'], lawful: true },
  med_bulk: { desc: ['كراتين أدوية كتير، نفس الصنف، عليها أرقام تشغيلة.', 'Many cartons of one medicine, batch-numbered.'], id: ['الكمية تجارية. لازم ورق يثبت المصدر.', 'Commercial quantity. Paperwork must show where it came from.'], lawful: true },
  med_unlabelled: { desc: ['شريط حبوب من غير علبة ولا اسم.', 'A strip of tablets with no packaging or name.'], id: ['مش ممكن تتعرف هنا — محتاجة تأكيد معمل.', 'Cannot be identified here — needs lab confirmation.'], lawful: null },
  duffel_clothes: { desc: ['هدوم وشاحن موبايل.', 'Clothes and a phone charger.'], id: ['أغراض سفر عادية.', 'Ordinary travel items.'], lawful: true }
};

/* ---------------- personality flavour ---------------- */
CP.C.persOpen = {
  patient: [['اتفضل يا فندم.', 'Certainly, officer.'], ['حاضر يا باشا.', 'Of course.'], ['ماشي يا فندم، براحتك.', 'Take your time, officer.']],
  chatty: [['والله يا باشا الطريق النهارده زحمة موت…', 'Honestly officer, the road is packed tonight…'], ['أهلاً يا باشا، ربنا يعينكم على السهر.', 'Evening officer, God help you with these night shifts.'], ['ده أنا لسه قايل لمراتي إن الكمين ده بيطوّل…', 'I was just telling my wife this checkpoint takes a while…']],
  anxious: [['هو… هو في حاجة يا فندم؟', 'Is… is something wrong, officer?'], ['أيوه يا فندم، حاضر.', 'Yes officer, right away.'], ['أنا آسف، أنا مش متعود على الكماين.', "Sorry, I'm not used to checkpoints."]],
  impatient: [['بسرعة الله يخليك، أنا متأخر.', "Quickly please, I'm late."], ['يا باشا إحنا واقفين بقالنا كتير.', "Officer, we've been waiting ages."], ['اتفضل، بس ياريت نخلص.', "Here — but let's finish, please."]],
  defensive: [['هو أنا عملت إيه يعني؟', 'What exactly did I do?'], ['كل يوم نفس الكلام.', 'Same thing every day.'], ['اتفضل. أنا ماشي في حالي.', "Here. I'm minding my own business."]]
};
CP.C.evasive = [['وحضرتك محتاج تعرف ده ليه؟', 'Why do you need to know that?'], ['هو ده مهم يعني؟', 'Does that really matter?'], ['يا باشا أنا قلت اللي عندي.', "Officer, I've said what I have to say."]];
CP.C.repeatAnnoy = [['ما أنا قلت لحضرتك قبل كده.', 'I already told you that.'], ['تاني؟ طيب…', 'Again? Fine…']];

/* ---------------- officer lines per intent & tone ---------------- */
CP.C.officer = {
  greet_docs: { calm: ['مساء الخير، رخصة القيادة ورخصة العربية لو سمحت.', 'Good evening. Your driving and vehicle licences, please.'], direct: ['الرخص والبطاقة لو سمحت.', 'Licences and ID, please.'], firm: ['رخصك وبطاقتك. دلوقتي.', 'Your licences and ID. Now.'] },
  ask_destination: { calm: ['رايح فين إن شاء الله؟', 'Where are you heading tonight?'], direct: ['رايح فين؟', 'Where are you going?'], firm: ['قولي رايح فين بالظبط.', 'Tell me exactly where you are going.'] },
  ask_origin: { calm: ['وجاي منين؟', 'And where are you coming from?'], direct: ['جاي منين؟', 'Coming from where?'], firm: ['جاي منين؟ بالتحديد.', 'Coming from where? Be specific.'] },
  ask_purpose: { calm: ['خير، رايح ليه دلوقتي؟', "What's the trip for tonight?"], direct: ['سبب المشوار؟', 'Purpose of the trip?'], firm: ['إيه سبب المشوار ده دلوقتي؟', 'Why are you making this trip now?'] },
  ask_passengers: { calm: ['مين معاك في العربية؟', "Who's travelling with you?"], direct: ['الركاب دول مين؟', 'Who are the passengers?'], firm: ['عايز أعرف مين الركاب.', 'I need to know who the passengers are.'] },
  ask_owner: { calm: ['العربية باسم شخص تاني، إيه صلتك بصاحبها؟', "The car is registered to someone else — how do you know the owner?"], direct: ['العربية مش باسمك. مين صاحبها؟', "The car isn't yours. Who owns it?"], firm: ['العربية مش باسمك. اشرح.', "This vehicle isn't in your name. Explain."] },
  ask_expiry: { calm: ['الرخصة دي منتهية، تعرف؟', 'This licence has expired — were you aware?'], direct: ['رخصتك منتهية.', 'Your licence is expired.'], firm: ['ماشي برخصة منتهية ليه؟', 'Why are you driving on an expired licence?'] },
  ask_plate: { calm: ['رقم اللوحة في الرخصة مختلف عن اللوحة اللي على العربية.', "The plate on the licence differs from the one on the car."], direct: ['اللوحة مش مطابقة للرخصة.', "The plate doesn't match the licence."], firm: ['اللوحة مش مطابقة. ده إيه؟', "The plate doesn't match. What is this?"] },
  ask_photo: { calm: ['الصورة والاسم اللي في الرخصة مش زي البطاقة.', "The licence photo and name don't match your ID."], direct: ['الرخصة دي مش بتاعتك.', "This licence isn't yours."], firm: ['دي رخصة مين؟', 'Whose licence is this?'] },
  ask_health: { calm: ['إنت كويس؟ شكلك تعبان شوية.', 'Are you feeling alright? You look unwell.'], direct: ['إنت تعبان؟', 'Are you unwell?'], firm: ['ركّز معايا. إنت كويس؟', 'Focus. Are you alright?'] },
  ask_drink: { calm: ['شربت أي حاجة أو خدت أي دوا النهارده؟', 'Have you had anything to drink or taken any medication today?'], direct: ['شارب حاجة؟ واخد دوا؟', 'Been drinking? Taken any medication?'], firm: ['هسألك مرة واحدة: شارب أو واخد حاجة؟', "I'll ask once: have you been drinking or taken anything?"] },
  ask_bag: { calm: ['الشنطة دي فيها إيه؟', "What's in that bag?"], direct: ['إيه اللي في الشنطة؟', "What's in the bag?"], firm: ['افتح لي الشنطة دي وقولي فيها إيه.', "Tell me what's in that bag."] },
  explain: { calm: ['ده فحص روتيني، دقايق ونخلص إن شاء الله.', 'This is a routine check — just a few minutes.'], direct: ['فحص روتيني. شوية وهتمشي.', "Routine check. You'll be on your way shortly."], firm: ['استنى لحد ما أخلص الإجراءات.', 'Wait until I finish the procedure.'] },
  repeat_destination: { calm: ['قلت لي رايح فين تاني؟', 'Where did you say you were going?'], direct: ['رايح فين؟ تاني.', 'Where are you going? Again.'], firm: ['كرر رايح فين.', 'Repeat where you are going.'] },
  ask_passenger_confirm: { calm: ['حضرتك رايحين فين؟', 'Where are you all heading?'], direct: ['رايحين فين؟', 'Where are you heading?'], firm: ['الركاب: رايحين فين؟', 'Passengers — where are you going?'] },
  ask_reason_change: { calm: ['قلت حاجة وبعدين حاجة تانية. إيه الحكاية؟', 'You said one thing and then another. What is going on?'], direct: ['كلامك اتغير. ليه؟', 'Your story changed. Why?'], firm: ['كلامك مش راكب على بعضه. احكي الحقيقة.', "Your account doesn't add up. Tell me the truth."] },
  ask_lookout: { calm: ['في تعميم على عربية شبه دي. شايل إيه؟', "There's a lookout for a vehicle like this. What are you carrying?"], direct: ['شايل إيه في الصندوق؟', "What's in the back?"], firm: ['عليك تعميم. شايل إيه؟', "There's a lookout on you. What are you carrying?"] },
  mediate: { calm: ['يا جماعة اهدوا، كل واحد يقول اللي عنده بالدور.', 'Everyone calm down — one at a time, please.'], direct: ['بالراحة. إيه المشكلة؟', "Easy. What's the problem?"], firm: ['كفاية زعيق. إيه اللي حصل؟', "Enough shouting. What happened?"] },
  settle_dispute: { calm: ['الأجرة المتفق عليها تتدفع، ونزّل الراجل مكانه. تمام؟', 'Pay the agreed fare and drop him at his stop. Agreed?'], direct: ['اتفقوا على الأجرة المكتوبة وخلصنا.', "Settle on the posted fare and we're done."], firm: ['الأجرة الرسمية وبس. مفيش نقاش.', 'Official fare only. No argument.'] },
  refuse_favour_polite: { calm: ['شكراً، مفيش داعي لأي حاجة. ده شغلنا.', "Thank you, but nothing is needed. This is our job."], direct: ['لأ. مفيش حاجة من دي.', 'No. None of that.'], firm: ['اللي بتعمله ده مخالفة. شيل إيدك.', 'What you are doing is an offence. Put that away.'] },
  refuse_favour_record: { calm: ['هسجل إنك عرضت فلوس. خلّينا نمشي بالإجراءات.', "I'll record that you offered money. We follow procedure."], direct: ['العرض ده هيتسجل.', 'That offer will be recorded.'], firm: ['عرض الرشوة هيتسجل في المحضر.', 'The bribe offer goes in the record.'] },
  ask_symptoms: { calm: ['عندك سكر أو ضغط؟ محتاج حاجة؟', 'Are you diabetic, or have blood pressure? Do you need anything?'], direct: ['عندك مرض مزمن؟', 'Any chronic condition?'], firm: ['قولي حالتك الصحية بسرعة.', 'Tell me your condition, quickly.'] },
  close: { calm: ['شكراً، استنى هنا دقيقة لو سمحت.', 'Thank you. Please wait here a moment.'], direct: ['استنى هنا.', 'Wait here.'], firm: ['متتحركش.', "Don't move."] }
};
CP.C.intentLabel = {
  greet_docs: ['مساء الخير — الرخص لو سمحت', 'Good evening — licences, please'],
  ask_destination: ['رايح فين؟', 'Where are you heading?'],
  ask_origin: ['جاي منين؟', 'Where are you coming from?'],
  ask_purpose: ['سبب المشوار؟', 'What is the trip for?'],
  ask_passengers: ['مين معاك؟', 'Who is with you?'],
  ask_owner: ['العربية باسم مين؟', 'Who owns the vehicle?'],
  ask_expiry: ['الرخصة منتهية', 'Ask about the expired licence'],
  ask_plate: ['اللوحة مش مطابقة', 'Ask about the plate mismatch'],
  ask_photo: ['الرخصة دي بتاعة مين؟', 'Whose licence is this?'],
  ask_health: ['إنت كويس؟', 'Are you feeling alright?'],
  ask_drink: ['شربت أو خدت دوا؟', 'Drinking or medication?'],
  ask_bag: ['الشنطة فيها إيه؟', "What's in the bag?"],
  explain: ['اشرح الإجراء', 'Explain the procedure'],
  repeat_destination: ['رايح فين تاني؟ (تأكيد)', 'Where to, again? (check)'],
  ask_passenger_confirm: ['اسأل الركاب', 'Ask the passengers'],
  ask_reason_change: ['كلامك اتغير — ليه؟', 'Your story changed — why?'],
  ask_lookout: ['في تعميم — شايل إيه؟', 'Lookout issued — what cargo?'],
  mediate: ['هدّي الخناقة', 'Calm the dispute'],
  settle_dispute: ['حل موضوع الأجرة', 'Settle the fare'],
  refuse_favour_polite: ['ارفض بأدب', 'Refuse politely'],
  refuse_favour_record: ['ارفض وسجّل العرض', 'Refuse and record the offer'],
  ask_symptoms: ['عندك سكر أو ضغط؟', 'Diabetes or blood pressure?'],
  close: ['استنى هنا لو سمحت', 'Please wait here']
};

/* ---------------- observation cues (what the officer can see/hear) ---------------- */
CP.C.cues = {
  sweating: ['السواق عرقان وبطيء في الرد', 'Driver is sweating and slow to respond'],
  alcohol_smell: ['ريحة كحول خفيفة في الكابينة', 'Faint smell of alcohol in the cabin'],
  drowsy: ['السواق نعسان وعينه تقيلة', 'Driver appears drowsy'],
  swerve: ['العربية كانت بتتمايل وهي جاية', 'Vehicle weaved slightly on approach'],
  steam: ['بخار طالع من الموتور', 'Steam rising from the engine'],
  shouting: ['زعيق جوه الميكروباص', 'Shouting inside the vehicle'],
  bag_seat: ['شنطة على الكرسي جنب السواق', 'A bag on the seat beside the driver'],
  cargo_cartons: ['كراتين كتير في الصندوق', 'Many cartons in the back'],
  passenger_pale: ['راكب شكله تعبان جداً', 'A passenger looks very unwell']
};

/* ---------------- lost visitor directions (location-specific) ---------------- */
CP.C.visitor = {
  cairo: { q: ['لو سمحت يا فندم، مستشفى الدمرداش منين؟', 'Excuse me officer, how do I get to Demerdash Hospital?'],
    opts: [{ t: ['امشي على طول لحد الميدان وبعدين يمين عند محطة المترو.', 'Straight on to the square, then right at the metro station.'], ok: true },
           { t: ['ارجع ورا وخد الدائري.', 'Turn back and take the Ring Road.'], ok: false },
           { t: ['معرفش، اسأل حد تاني.', "No idea, ask someone else."], ok: false }],
    thanks: ['ربنا يخليك يا ابني، تعبتك معايا.', 'God bless you, son. Sorry for the trouble.'] },
  desert: { q: ['يا باشا، الاستراحة اللي فيها بنزينة قريبة؟', 'Officer, is there a rest stop with fuel nearby?'],
    opts: [{ t: ['البنزينة اللي منورة قدام، حوالي كيلو على اليمين.', 'The lit station ahead — about a kilometre on the right.'], ok: true },
           { t: ['مفيش حاجة لحد إسكندرية.', 'Nothing until Alexandria.'], ok: false },
           { t: ['ارجع القاهرة.', 'Go back to Cairo.'], ok: false }],
    thanks: ['شكراً يا فندم، كنت خايف البنزين يخلص.', "Thanks officer, I was worried I'd run out of fuel."] }
};

/* ---------------- missing art register (honest list for future expansion) ---------------- */
CP.C.missingArt = [
  ['رسومات داخلية/أبواب مفتوحة لكل العربيات ماعدا الميكروباص', 'Interior / open-door art for every vehicle except the microbus'],
  ['دورة مشي للمدنيين (الشخصيات ثابتة)', 'Civilian walk cycles (figures are static)'],
  ['رسومات منفصلة للزميل (بيستخدم نفس رسم الظابط)', 'Distinct partner officer art (partner reuses officer frames)'],
  ['عربية ونش لسحب العربيات المتحفظ عليها', 'Tow truck for held vehicles'],
  ['موتوسيكل، هاتشباك، نقل خفيف، ميكروباص تاني، تاكسي أبيض (توسعة الـ١٨ عربية)', 'Motorcycle, hatchback, light truck, second microbus, white taxi (18-vehicle expansion)'],
  ['خلفية المدخل الساحلي', 'Coastal entrance background'],
  ['معزة/حيوانات للأحداث الطريفة', 'Goat / animals for humorous events'],
  ['ديكور زفة الفرح (شرايط وورد على العربيات)', 'Wedding convoy decorations'],
  ['تسجيلات صوتية: محركات، كلاكسات، جو القاهرة، أصوات حوار', 'Recorded audio: engines, horns, Cairo ambience, dialogue voice'],
  ['وضعيات الركاب القاعدين كطبقة منفصلة', 'Seated occupant layers']
];

/* ---------------- locations (v1.3): 2 original + 5 supplied day/night scenes ---------------- */
CP.LOCS = {
  cairo: { base: 'cairo', bg: { single: 'background_cairo_dusk', frac: 0.66 }, far: true },
  desert: { base: 'desert', bg: { single: 'background_desert_night', frac: 0.66 }, far: true, dust: true },
  alex: { base: 'cairo', bg: { day: 'loc_alex_day', night: 'loc_alex_night', frac: 0.696 }, sea: true, wedding: true },
  sinai: { base: 'desert', bg: { day: 'loc_sinai_day', night: 'loc_sinai_night', frac: 0.711 }, sea: true, dust: true },
  hurghada: { base: 'cairo', bg: { day: 'loc_hurghada_day', night: 'loc_hurghada_night', frac: 0.755 }, sea: true },
  luxor: { base: 'cairo', bg: { day: 'loc_luxor_day', night: 'loc_luxor_night', frac: 0.710 }, sea: true },
  aswan: { base: 'cairo', bg: { day: 'loc_aswan_day', night: 'loc_aswan_night', frac: 0.707 }, sea: true }
};
Object.assign(CP.LOCS.cairo, { mul: { alex_taxi: 0.1 } });
Object.assign(CP.LOCS.desert, { mul: { alex_taxi: 0.1 } });
Object.assign(CP.LOCS.alex, { mul: { alex_taxi: 5, cairo_taxi: 0.05, red_classic: 1.5 } });
Object.assign(CP.LOCS.sinai, { mul: { coach: 4, charcoal_suv: 2, green_pickup: 2, estate_wagon: 2, white_luxury: 1.5, cairo_taxi: 0, alex_taxi: 0, city_bus: 0 } });
Object.assign(CP.LOCS.hurghada, { mul: { coach: 3, white_luxury: 2, microbus: 1.2, cairo_taxi: 0.2, alex_taxi: 0 } });
Object.assign(CP.LOCS.luxor, { mul: { coach: 3, microbus: 1.5, cairo_taxi: 0.3, alex_taxi: 0 } });
Object.assign(CP.LOCS.aswan, { mul: { coach: 2, microbus: 1.5, older_minibus: 1.5, cairo_taxi: 0.3, alex_taxi: 0 } });
CP.LOC_ORDER = ['cairo', 'desert', 'alex', 'sinai', 'hurghada', 'luxor', 'aswan'];
CP.locBase = loc => (CP.LOCS[loc] || CP.LOCS.cairo).base;
Object.assign(CP.C.places, {
  alex: [['محطة الرمل','Raml Station'],['سيدي جابر','Sidi Gaber'],['المنشية','Mansheya'],['سموحة','Smouha'],['ستانلي','Stanley'],['العجمي','Agami'],['المندرة','Mandara'],['برج العرب','Borg El Arab'],['القاهرة','Cairo'],['المينا','the port']],
  sinai: [['دهب','Dahab'],['شرم الشيخ','Sharm El Sheikh'],['نويبع','Nuweiba'],['طابا','Taba'],['سانت كاترين','Saint Catherine'],['الطور','El Tor'],['البلو هول','the Blue Hole'],['القاهرة','Cairo']],
  hurghada: [['الدهار','Dahar'],['السقالة','Sakala'],['الممشى السياحي','the tourist promenade'],['الجونة','El Gouna'],['سفاجا','Safaga'],['مكادي','Makadi'],['المطار','the airport'],['القصير','El Quseir']],
  luxor: [['الكرنك','Karnak'],['البر الغربي','the West Bank'],['محطة القطر','the train station'],['إسنا','Esna'],['أرمنت','Armant'],['قنا','Qena'],['المطار','the airport'],['وادي الملوك','Valley of the Kings']],
  aswan: [['كورنيش النيل','the Nile Corniche'],['السد العالي','the High Dam'],['غرب سهيل','Gharb Soheil'],['كوم أمبو','Kom Ombo'],['إدفو','Edfu'],['دراو','Daraw'],['المطار','the airport'],['أبو سمبل','Abu Simbel']]
});
Object.assign(CP.C.addresses, {
  alex: [['سيدي بشر، الإسكندرية','Sidi Bishr, Alexandria'],['محرم بك، الإسكندرية','Moharram Bek, Alexandria'],['العصافرة، الإسكندرية','Asafra, Alexandria'],['كليوباترا، الإسكندرية','Cleopatra, Alexandria'],['الورديان، الإسكندرية','Wardian, Alexandria']],
  sinai: [['دهب، جنوب سيناء','Dahab, South Sinai'],['شرم الشيخ، جنوب سيناء','Sharm El Sheikh, South Sinai'],['الطور، جنوب سيناء','El Tor, South Sinai'],['السويس','Suez'],['القاهرة','Cairo']],
  hurghada: [['الدهار، الغردقة','Dahar, Hurghada'],['الكوثر، الغردقة','El Kawther, Hurghada'],['سفاجا، البحر الأحمر','Safaga, Red Sea'],['قنا','Qena'],['القاهرة','Cairo']],
  luxor: [['الأقصر','Luxor'],['البر الغربي، الأقصر','West Bank, Luxor'],['إسنا، الأقصر','Esna, Luxor'],['قنا','Qena'],['سوهاج','Sohag']],
  aswan: [['أسوان','Aswan'],['غرب سهيل، أسوان','Gharb Soheil, Aswan'],['كوم أمبو، أسوان','Kom Ombo, Aswan'],['إدفو، أسوان','Edfu, Aswan'],['دراو، أسوان','Daraw, Aswan']]
});
Object.assign(CP.C.visitor, {
  alex: { q: ['لو سمحت يا حضرة الظابط، قلعة قايتباي منين؟', 'Excuse me officer, which way to Qaitbay Citadel?'],
    opts: [{ t: ['امشي على الكورنيش على طول ناحية بحري، هتلاقيها في آخره.', 'Straight along the Corniche towards Bahary — it is at the end.'], ok: true },
           { t: ['خد الترام لحد فكتوريا.', 'Take the tram to Victoria.'], ok: false }, { t: ['دي في العجمي.', "It's in Agami."], ok: false }],
    thanks: ['تسلم يا باشا، ربنا يخليك.', 'Thank you, officer — God keep you.'] },
  sinai: { q: ['يا باشا، الطريق لنويبع من هنا؟', 'Officer, is this the way to Nuweiba?'],
    opts: [{ t: ['أيوه، كمّل على الطريق الساحلي شمال وخلي بالك من المنحنيات بالليل.', 'Yes — keep north on the coastal road and mind the bends at night.'], ok: true },
           { t: ['لأ، ارجع ناحية شرم.', 'No, turn back towards Sharm.'], ok: false }, { t: ['خد طريق سانت كاترين.', 'Take the Saint Catherine road.'], ok: false }],
    thanks: ['شكراً جزيلاً، يوم سعيد!', 'Thank you so much — have a good one!'] },
  hurghada: { q: ['لو سمحت، المارينا منين؟ عندي حجز مركب الصبح.', 'Excuse me, where is the marina? I have a boat booked in the morning.'],
    opts: [{ t: ['هي قدامك على الممشى، امشي مع السور لحد الفنار.', 'Right ahead on the promenade — follow the wall to the lighthouse.'], ok: true },
           { t: ['روح الجونة.', 'Go to El Gouna.'], ok: false }, { t: ['المارينا في سفاجا.', 'The marina is in Safaga.'], ok: false }],
    thanks: ['متشكر جداً يا فندم.', 'Many thanks, officer.'] },
  luxor: { q: ['يا باشا، معبد الأقصر قريب؟ عايز أروح الصوت والضوء.', 'Officer, is Luxor Temple near? I want the sound-and-light show.'],
    opts: [{ t: ['امشي على الكورنيش ناحية الجنوب، هتلاقيه على إيدك الشمال.', 'Walk south along the Corniche — it is on your left.'], ok: true },
           { t: ['اعدي البر الغربي.', 'Cross to the West Bank.'], ok: false }, { t: ['في الكرنك بس.', 'Only at Karnak.'], ok: false }],
    thanks: ['ربنا يكرمك يا ابني.', 'Bless you, son.'] },
  aswan: { q: ['لو سمحت، المركب اللي بتروح غرب سهيل منين؟', 'Excuse me, where do the boats to Gharb Soheil leave from?'],
    opts: [{ t: ['من المرسى اللي على الكورنيش قدام السوق.', 'From the landing on the Corniche, opposite the market.'], ok: true },
           { t: ['من السد العالي.', 'From the High Dam.'], ok: false }, { t: ['مفيش مراكب بالليل خالص.', 'There are no boats at night at all.'], ok: false }],
    thanks: ['تسلم إيدك يا باشا.', 'Thank you kindly, officer.'] }
});
CP.addStrings = CP.addStrings || function () {};
;(window.CP_FILES = window.CP_FILES || {})['02_content'] = '1.5.0';
