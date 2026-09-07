/* eReturn Demo — প্রতিটি ঘরের বিস্তারিত বাংলা ব্যাখ্যা
   যিনি কিছুই জানেন না, তিনিও যেন পারেন — সেভাবে লেখা।

   প্রতিটি এন্ট্রি:
     t        শিরোনাম
     page     ডেমোর কোন পাতায় ঘরটি আছে (নেভিগেট করার জন্য)
     path     ঘরের data-path (তীর দিয়ে দেখানোর জন্য)
     live     লাইভ eReturn-এ ঘরটির নাম
     what     এটা আসলে কী
     where    সংখ্যাটা কোথা থেকে পাবেন
     how      কীভাবে হিসাব করবেন
     typical  সাধারণত কেমন হয় / কত হয়
     example  উদাহরণ (সংখ্যা সহ)
     mistake  যে ভুলটা বেশির ভাগ মানুষ করে
     tip      বাড়তি টিপস
*/
(function (global) {
  'use strict';

  const HELP = {

    /* ============ করদাতার তথ্য ============ */
    taxpayerCategory: {
      t: 'করদাতার শ্রেণি', page: 'home', path: 'taxpayer.category',
      what: 'আপনি কোন শ্রেণির করদাতা। শ্রেণি অনুযায়ী কত টাকা পর্যন্ত আয়ে কোনো কর লাগবে না (করমুক্ত সীমা) তা আলাদা হয়।',
      how: 'সাধারণ পুরুষ ৪,০০,০০০ · নারী অথবা ৬৫ বছরের বেশি বয়সী ৪,৫০,০০০ · প্রতিবন্ধী বা তৃতীয় লিঙ্গ ৫,২৫,০০০ · গেজেটেড মুক্তিযোদ্ধা/জুলাই যোদ্ধা ৫,৫০,০০০।',
      example: 'একজন নারী করদাতার মোট আয় ৪,৪০,০০০ টাকা হলে তাঁর কর ০ — কারণ তাঁর করমুক্ত সীমা ৪,৫০,০০০। একই আয় একজন পুরুষের হলে ৪,০০,০০০-এর উপরের ৪০,০০০ টাকায় ১০% হারে কর বসত।',
      mistake: 'অনেক নারী করদাতা জানেনই না যে তাঁদের সীমা ৫০ হাজার টাকা বেশি — ফলে বাড়তি কর দেন।',
      tip: 'লাইভ সাইটে এটা আপনার TIN প্রোফাইলের জন্ম তারিখ ও লিঙ্গ থেকে নিজে থেকেই ঠিক হয়ে যায়। ডেমোতে হাতে বেছে নিন।'
    },
    disabledChildren: {
      t: 'প্রতিবন্ধী সন্তান/পোষ্যের সংখ্যা', page: 'home', path: 'taxpayer.disabledChildren',
      what: 'আপনার প্রতিবন্ধী সন্তান বা পোষ্য কতজন আছে।',
      how: 'প্রতি জনের জন্য আপনার করমুক্ত সীমা ৫০,০০০ টাকা করে বেড়ে যায়।',
      example: 'সাধারণ পুরুষ + ১ জন প্রতিবন্ধী সন্তান = ৪,০০,০০০ + ৫০,০০০ = ৪,৫০,০০০ টাকা পর্যন্ত কোনো কর নেই।',
      mistake: 'বাবা-মা দুজনেই করদাতা হলে দুজনেই এই সুবিধা নিতে পারবেন না — যেকোনো একজন নেবেন।',
      where: 'সমাজসেবা অধিদপ্তরের প্রতিবন্ধী পরিচয়পত্র (সুবর্ণ নাগরিক কার্ড) থাকতে হবে।'
    },
    firstTimeFiler: {
      t: 'প্রথমবার রিটার্ন দিচ্ছেন?', page: 'home', path: 'taxpayer.firstTimeFiler',
      what: 'নতুন TIN নিয়ে জীবনে এই প্রথম রিটার্ন জমা দিচ্ছেন কিনা।',
      how: 'নতুন করদাতার ন্যূনতম কর ১,০০০ টাকা, অন্য সবার ৫,০০০ টাকা।',
      tip: 'আগে কখনও রিটার্ন দিয়ে থাকলে এটি "না" রাখুন — মিথ্যা দিলে পরে ধরা পড়বে।'
    },
    submitByFirstQuarter: {
      t: 'প্রথম কোয়ার্টারে জমা দেবেন?', page: 'home', path: 'taxpayer.submitByFirstQuarter',
      what: 'আয়বর্ষ শেষ হওয়ার পর প্রথম তিন মাসের মধ্যে — অর্থাৎ ১ জুলাই থেকে ৩০ সেপ্টেম্বরের মধ্যে — রিটার্ন জমা দিলে প্রদেয় করের ১০% ছাড় পাওয়া যায়।',
      example: 'আপনার কর ২৬,৩৫০ টাকা হলে সেপ্টেম্বরের মধ্যে জমা দিলে ২,৬৩৫ টাকা ছাড় — দিতে হবে ২৩,৭১৫ টাকা।',
      tip: 'এটাই সবচেয়ে সহজ সাশ্রয় — শুধু আগে জমা দিলেই হয়, কোনো বাড়তি কাগজ লাগে না।'
    },

    /* ============ Additional Information (লাইভের বাম কলাম) ============ */
    location: {
      t: 'Location of Main Source of Income', page: 'additional', path: 'additional.location',
      live: 'Location of Main Source of Income',
      what: 'আপনার প্রধান আয়ের উৎস কোন এলাকায়। অফিস/ব্যবসা যেখানে, সেই এলাকা বেছে নিন।',
      how: 'পাঁচটি অপশন: Dhaka North City Corporation · Dhaka South City Corporation · ' +
        'Chattogram City Corporation · Other City Corporation · Any Other Area (সিটি কর্পোরেশনের বাইরে)।',
      where: 'অফিসের ঠিকানা বা ট্রেড লাইসেন্সের ঠিকানা দেখে ঠিক করুন।',
      mistake: '⚠️ এটি **আবশ্যক** — না দিলে লাইভ সাইট লাল বর্ডার দিয়ে ' +
        '"Location of Main Source of Income is Required!" দেখাবে এবং সামনে এগোতে দেবে না।',
      tip: 'আগে এই এলাকার উপর ন্যূনতম কর নির্ভর করত (ঢাকা/চট্টগ্রাম ৫,০০০ · অন্য সিটি ৪,০০০ · বাইরে ৩,০০০)। ' +
        '২০২৬-২৭ করবর্ষ থেকে সারা দেশে একই — ৫,০০০ টাকা।'
    },
    freedomFighter: {
      t: 'War-wounded Gazetted Freedom Fighter / Wounded Gazetted July Fighter',
      page: 'additional', path: 'additional.freedomFighter',
      live: 'War-wounded Gazetted Freedom Fighter/Wounded Gazetted July Fighter',
      what: 'আপনি গেজেটভুক্ত যুদ্ধাহত মুক্তিযোদ্ধা, অথবা জুলাই ২০২৪ গণঅভ্যুত্থানে আহত গেজেটভুক্ত যোদ্ধা কিনা।',
      how: 'টিক দিলে আপনার করমুক্ত সীমা বেড়ে ৫,৫০,০০০ টাকা হয়ে যাবে।',
      where: 'মুক্তিযোদ্ধা গেজেট / সাময়িক সনদ থাকতে হবে।',
      mistake: 'যোগ্য না হয়ে টিক দেবেন না — গেজেট যাচাই করা হয়।'
    },
    disabledThirdGender: {
      t: 'Person with Disability / Third Gender',
      page: 'additional', path: 'additional.disabledThirdGender',
      live: 'Person with Disability/Third Gender',
      what: 'আপনি নিজে প্রতিবন্ধী ব্যক্তি অথবা তৃতীয় লিঙ্গের করদাতা কিনা।',
      how: 'টিক দিলে করমুক্ত সীমা বেড়ে ৫,২৫,০০০ টাকা হবে।',
      where: 'সমাজসেবা অধিদপ্তরের প্রতিবন্ধী পরিচয়পত্র (সুবর্ণ নাগরিক কার্ড)।'
    },
    guardianOfDisabled: {
      t: 'Claim Benefit as a Parent/Legal Guardian of a Person with Disability',
      page: 'additional', path: 'additional.guardianOfDisabled',
      live: 'Claim Benefit as a Parent/Legal Guardian of a Person with Disability',
      what: 'আপনি প্রতিবন্ধী সন্তান বা পোষ্যের বাবা-মা / আইনগত অভিভাবক হিসেবে সুবিধা নিতে চান কিনা।',
      how: 'টিক দিলে প্রতি প্রতিবন্ধী সন্তানের জন্য করমুক্ত সীমা ৫০,০০০ টাকা করে বাড়বে। ' +
        'টিক দেওয়ার সাথে সাথেই সংখ্যা লেখার ঘরটি নিচে চলে আসবে।',
      mistake: '⚠️ বাবা-মা দুজনেই করদাতা হলে যেকোনো **একজনই** এই সুবিধা নিতে পারবেন।',
      example: 'সাধারণ পুরুষ + ১ জন প্রতিবন্ধী সন্তান = ৪,০০,০০০ + ৫০,০০০ = ৪,৫০,০০০ টাকা করমুক্ত।'
    },
    claimTaxRebate: {
      t: 'Claim tax rebate for investment?', page: 'additional', path: 'additional.claimTaxRebate',
      live: 'Claim tax rebate for investment?',
      what: 'বিনিয়োগের বিপরীতে কর রেয়াত দাবি করবেন কিনা।',
      how: '**Yes** দিলে পরে Rebate পাতা আসবে — সেখানে DPS/সঞ্চয়পত্র/জীবন বীমা/GPF দেখাতে পারবেন। ' +
        '**No** দিলে Rebate পাতাটাই আসবে না এবং কোনো রেয়াত পাবেন না।',
      mistake: '⚠️ না বুঝে "No" দিলে হাজার হাজার টাকা রেয়াত হারাবেন।',
      tip: '⭐ কর কমানোর সবচেয়ে বড় সুযোগ এটাই। বেতন থেকে GPF/RPF কাটা হলেও সেটা রেয়াতযোগ্য বিনিয়োগ — ' +
        'তাই প্রায় সব চাকরিজীবীরই "Yes" দেওয়া উচিত।'
    },

    /* ============ Assessment ============ */
    returnScheme: {
      t: 'Return Scheme', page: 'assessment', live: 'Return Scheme',
      what: 'কোন পদ্ধতিতে রিটার্ন দিচ্ছেন। ব্যক্তি করদাতার জন্য সবসময় "Self" — অর্থাৎ স্বনির্ধারণী, আপনি নিজেই আয় ও কর হিসাব করে দিচ্ছেন।',
      tip: 'এই ঘরটি লাইভ সাইটে নিজে থেকেই পূরণ থাকে, বদলানো যায় না।'
    },
    assessmentYear: {
      t: 'Assessment Year (করবর্ষ)', page: 'assessment', live: 'Assessment Year',
      what: 'যে বছরের জন্য কর নির্ধারণ হচ্ছে।',
      how: 'করবর্ষ সবসময় আয়বর্ষের ঠিক পরের বছর। ২০২৬-২০২৭ করবর্ষ মানে আয় হয়েছে ০১-০৭-২০২৫ থেকে ৩০-০৬-২০২৬ পর্যন্ত।',
      mistake: 'অনেকে ভুল করে চলতি বছরের আয় দেখান। গত ১ জুলাই থেকে এ বছরের ৩০ জুন পর্যন্ত যা আয় হয়েছে সেটাই দিতে হবে।'
    },
    incomeYear: {
      t: 'Income Year (আয়বর্ষ)', page: 'assessment', live: 'Income Year',
      what: 'যে ১২ মাসের আয় দেখাচ্ছেন। বাংলাদেশে সবসময় ১ জুলাই থেকে পরের বছরের ৩০ জুন।',
      mistake: '⚠️ বিনিয়োগও এই সময়ের মধ্যেই করতে হবে। ৩০ জুনের পরে DPS/সঞ্চয়পত্র কিনলে সেটা এ বছরের রেয়াতে ধরা হবে না।'
    },
    residentStatus: {
      t: 'Resident Status', page: 'assessment', path: 'assessment.residentStatus', live: 'Resident Status',
      what: 'আপনি কর-হিসাবে বাংলাদেশের বাসিন্দা কিনা।',
      how: 'আয়বর্ষে বাংলাদেশে মোট ১৮২ দিন বা তার বেশি থেকে থাকলে "Resident"। অথবা এ বছর ৯০ দিন + আগের ৪ বছরে মোট ৩৬৫ দিন থাকলেও Resident।',
      typical: 'দেশে চাকরি/ব্যবসা করা প্রায় সবাই Resident।',
      mistake: 'প্রবাসী হলেও অনেকে Resident দেন। Non Resident বিদেশি হলে করমুক্ত সীমাই পাওয়া যায় না, পুরো আয়ে ৩০% কর।',
      tip: 'প্রবাসী বাংলাদেশি (NRB) হলেও বেশির ভাগ ক্ষেত্রে Resident-এর সুবিধা পাওয়া যায় — নিশ্চিত না হলে জিজ্ঞেস করুন।'
    },
    hasExemptedIncome: {
      t: 'করমুক্ত আয় আছে কি?', page: 'assessment', path: 'assessment.hasExemptedIncome',
      live: 'Any income which is fully exempted from tax?',
      what: 'এমন কোনো আয় আছে কিনা যার উপর একদমই কর বসে না।',
      typical: 'বৈধ পথে আসা বৈদেশিক রেমিট্যান্স, সরকারি পেনশন, সর্বজনীন পেনশনের টাকা, সফটওয়্যার/IT ব্যবসার নির্দিষ্ট আয়, সরকারি পুরস্কার।',
      tip: '⭐ থাকলে অবশ্যই "Yes" দিন। এতে কর এক টাকাও বাড়ে না, কিন্তু "এত টাকা কোথা থেকে এলো" প্রশ্নের উত্তর তৈরি হয়ে যায় — সম্পদ বাড়ার ব্যাখ্যা দিতে এটা খুব কাজে লাগে।'
    },
    hasTaxableIncome: {
      t: 'করযোগ্য আয় আছে কি?', page: 'assessment', path: 'assessment.hasTaxableIncome',
      live: 'Any taxable income in the income year?',
      what: 'আয়বর্ষে কোনো আয় হয়েছে কিনা।',
      mistake: 'আয় করমুক্ত সীমার নিচে হলেও "Yes" দিয়ে আয়টা দেখাতে হবে — তখন কর ০ আসবে। "No" দিলে আয় দেখানোর সুযোগই পাবেন না।'
    },
    heads: {
      t: 'Heads of Income (আয়ের খাত)', page: 'assessment', live: 'Heads of Income',
      what: 'আপনার টাকা কোন কোন উৎস থেকে আসে, সেগুলো বেছে নেওয়া।',
      how: 'চাকরি করলে → Employment। বাড়ি/দোকান ভাড়া দিলে → Rent। জমি-খামার থেকে আয় হলে → Agriculture। দোকান/ব্যবসা/ফ্রিল্যান্সিং/ডাক্তারি-উকিলি → Business or Profession। জমি-ফ্ল্যাট-শেয়ার বিক্রির লাভ → Capital Gains। ব্যাংক সুদ, সঞ্চয়পত্রের মুনাফা, লভ্যাংশ → Financial Assets। বাকি সব (সম্মানী, রয়্যালটি, লটারি) → Other Sources।',
      mistake: 'যেটায় টিক দেবেন সেটার পাতা পূরণ না করলে লাইভ সাইট সামনে এগোতে দেবে না। ভুল করে টিক দিলে টিক তুলে দিন।',
      tip: 'ব্যাংকে টাকা থাকলে সুদ আসেই — তাই বেশির ভাগ মানুষের Financial Assets টিক দেওয়া লাগে।'
    },
    voluntaryDisclosure: {
      t: 'Voluntary Disclosure of Income', page: 'assessment',
      what: 'আগে গোপন রাখা আয় এখন নিজে থেকে প্রকাশ করা।',
      mistake: 'এতে বাড়তি কর ও জরিমানা লাগে। সাধারণ করদাতার এটা লাগেই না — না বুঝে টিক দেবেন না।'
    },

    /* ============ IT10B Requirements ============ */
    grossWealthOver50Lakh: {
      t: 'Gross Wealth over 50,00,000?', page: 'additional', path: 'additional.grossWealthOver50Lakh',
      live: 'Gross Wealth over 50,00,000?',
      what: '৩০ জুন তারিখে আপনার সব সম্পদ (ঋণ বাদ দেওয়ার আগে) মিলিয়ে ৫০ লাখ টাকার বেশি কিনা।',
      how: 'জমি + ফ্ল্যাট + গাড়ি + স্বর্ণ + ব্যাংকের টাকা + সঞ্চয়পত্র + DPS + আসবাব — সব ক্রয়মূল্যে যোগ করুন।',
      tip: '"Yes" হলে Assets & Liabilities (IT-10B) পাতা পূরণ করা বাধ্যতামূলক।'
    },
    ownMotorCar: {
      t: 'Own Motor Car?', page: 'additional', path: 'additional.ownMotorCar', live: 'Own Motor Car?',
      what: 'আপনার নামে কোনো গাড়ি আছে কিনা (মোটরসাইকেল গাড়ি নয়)।',
      mistake: '⚠️ গাড়ি থাকলেই IT-10B বাধ্যতামূলক। আর একাধিক গাড়ি থাকলে নিট সম্পদ ৪ কোটির কম হলেও ১০% সারচার্জ বসে।'
    },
    offshoreProperty: {
      t: 'Own Offshore Property?', page: 'additional', path: 'additional.offshoreProperty',
      what: 'দেশের বাইরে কোনো সম্পদ, ব্যাংক হিসাব বা বিনিয়োগ আছে কিনা।',
      mistake: 'গোপন করা খুব ঝুঁকিপূর্ণ — এখন অনেক দেশের সাথে তথ্য বিনিময় হয়।'
    },
    shareholderDirector: {
      t: 'Shareholder director of a company?', page: 'additional', path: 'additional.shareholderDirector',
      what: 'কোনো লিমিটেড কোম্পানির শেয়ারহোল্ডার পরিচালক কিনা।',
      tip: '"Yes" হলে কোম্পানির নাম ও শেয়ার সংখ্যা সম্পদ বিবরণীতে দিতে হবে।'
    },
    housePropertyQ: {
      t: 'Have any House Property?', page: 'additional', path: 'additional.houseProperty',
      what: 'সিটি কর্পোরেশন এলাকায় বাড়ি বা ফ্ল্যাটে বিনিয়োগ আছে কিনা।',
      tip: '"Yes" হলে IT-10B বাধ্যতামূলক।'
    },

    /* ============ Employment — বেতন ============ */
    salaryStructure: {
      t: '📚 বেতন কাঠামো কীভাবে ভাঙে — পুরো ব্যাখ্যা', page: 'employment',
      what: 'অফিস আপনাকে মাসে যত টাকা দেয় সেটা এক অঙ্ক নয় — কয়েকটা ভাগে ভাঙা থাকে। রিটার্নে প্রতিটা ভাগ আলাদা করে লিখতে হয়। ভাগগুলো আপনার Salary Certificate বা Pay Slip-এ লেখা থাকে।',
      how: 'বাংলাদেশের বেসরকারি প্রতিষ্ঠানে সবচেয়ে প্রচলিত ভাগ এরকম:\n' +
        '• মূল বেতন (Basic Salary) — মোট বেতনের প্রায় ৫০% থেকে ৬০%\n' +
        '• বাড়ি ভাড়া ভাতা (House Rent) — মূল বেতনের ৫০% (অর্থাৎ মোট বেতনের ~২৫–৩০%)\n' +
        '• চিকিৎসা ভাতা (Medical) — মূল বেতনের ~১০%\n' +
        '• যাতায়াত ভাতা (Conveyance) — নির্দিষ্ট অঙ্ক, বছরে সাধারণত ৩০,০০০ টাকার মতো\n' +
        '• উৎসব বোনাস (Festival Bonus) — সাধারণত ২টি, প্রতিটি এক মাসের মূল বেতনের সমান',
      example: 'মাসিক মোট বেতন ৮০,০০০ টাকা হলে সাধারণ ভাঙা:\n' +
        'মূল বেতন ৫০,০০০ × ১২ = ৬,০০,০০০\n' +
        'বাড়ি ভাড়া ২৫,০০০ × ১২ = ৩,০০,০০০\n' +
        'চিকিৎসা ৫,০০০ × ১২ = ৬০,০০০\n' +
        'যাতায়াত ৩,০০০ × ১২ = ৩৬,০০০\n' +
        'উৎসব বোনাস ২ × ৫০,০০০ = ১,০০,০০০\n' +
        'মোট বার্ষিক = ১০,৯৬,০০০ টাকা',
      mistake: '⚠️ সবচেয়ে বড় ভুল: মাসিক অঙ্ক লিখে ফেলা। রিটার্নে সবসময় **১২ মাসের যোগফল** (বার্ষিক) লিখতে হয়।\n' +
        '⚠️ দ্বিতীয় ভুল: নিজের মনগড়া ভাগ বানানো। অফিসের Salary Certificate-এ যে ভাগ আছে হুবহু সেটাই দিন — অফিস NBR-এ যে তথ্য পাঠায় তার সাথে মিলতে হবে।',
      tip: 'বেসরকারি চাকরিতে ভাগ যেমনই হোক কর একই আসে — কারণ ছাড় হয় মোট বেতনের ১/৩ (সর্বোচ্চ ৫,০০,০০০), আলাদা আলাদা ভাতার উপর নয়। তাই সঠিক ভাগ দিতে ভয় পাবেন না।\n' +
        'কিন্তু সরকারি চাকরিতে ভাগ খুব গুরুত্বপূর্ণ — সেখানে বাড়ি ভাড়া, চিকিৎসা ও যাতায়াত ভাতা সম্পূর্ণ করমুক্ত।'
    },
    employmentType: {
      t: 'Employment Type (চাকরির ধরন)', page: 'employment', path: 'employment[0].employmentType',
      live: 'Employment Type',
      what: 'আপনার চাকরি সরকারি নাকি বেসরকারি — এর উপর কর হিসাব সম্পূর্ণ আলাদা হয়।',
      how: '• সরকারি চাকরি, বেতন iBAS++ দিয়ে পান → "Government Pay Scale (Payment through iBAS++)"\n' +
        '• সরকারি বেতন কাঠামো কিন্তু iBAS++ নয় (স্বায়ত্তশাসিত সংস্থা) → "Government Pay Scale (Payment not through iBAS++)"\n' +
        '• বেসরকারি কোম্পানি, NGO, ব্যাংক, স্কুল-কলেজ → "Private/Other than Government Pay Scale"',
      typical: 'বেশির ভাগ মানুষের জন্য "Private/Other than Government Pay Scale"।',
      tip: '⭐ পার্থক্যটা বড়: সরকারি হলে বাড়ি ভাড়া + চিকিৎসা + যাতায়াত ভাতা **পুরোটাই করমুক্ত**। বেসরকারি হলে মোট বেতনের ১/৩ অথবা ৫,০০,০০০ — যেটি কম, ততটুকু ছাড়।'
    },
    employer: {
      t: 'Name of the Employer', page: 'employment', path: 'employment[0].employer',
      live: 'Name of the Employer',
      what: 'যে প্রতিষ্ঠানে চাকরি করেন তার পুরো নাম।',
      where: 'Salary Certificate-এর উপরে যেভাবে লেখা, হুবহু সেভাবে লিখুন।',
      tip: 'বছরের মাঝে চাকরি বদলালে "+ Add Employment" চেপে দুটো প্রতিষ্ঠানই আলাদা করে দেখান — দুটোরই সনদ নিন।'
    },
    designation: {
      t: 'Designation (পদবি)', page: 'employment', path: 'employment[0].designation',
      what: 'আপনার পদের নাম — যেমন Officer, Senior Executive, Manager, শিক্ষক।',
      where: 'Salary Certificate বা নিয়োগপত্রে যা লেখা।'
    },
    basicSalary: {
      t: 'Basic Salary (মূল বেতন)', page: 'employment', path: 'employment[0].basicSalary',
      live: 'Basic Salary',
      what: 'বেতনের মূল অংশ। অন্য সব ভাতা সাধারণত এর উপর ভিত্তি করেই হিসাব হয়।',
      where: 'Salary Certificate বা Pay Slip-এ "Basic" বা "মূল বেতন" লেখা থাকে।',
      how: '**মাসিক মূল বেতন × ১২** = এখানে যে সংখ্যা লিখবেন। মাঝপথে বেতন বাড়লে প্রতি মাসের মূল বেতন যোগ করুন।',
      typical: 'সাধারণত মোট বেতনের ৫০%–৬০%।',
      example: 'মাসিক মূল বেতন ৫০,০০০ টাকা হলে এখানে লিখবেন **৬,০০,০০০** (৫০,০০০ × ১২)।',
      mistake: '⚠️ মাসিক অঙ্ক (৫০,০০০) লিখে ফেলা — সবচেয়ে সাধারণ ভুল। বার্ষিক লিখতে হবে।'
    },
    houseRentAllowance: {
      t: 'House Rent Allowance (বাড়ি ভাড়া ভাতা)', page: 'employment', path: 'employment[0].houseRentAllowance',
      live: 'House Rent Allowance',
      what: 'বাসা ভাড়ার জন্য অফিস যে ভাতা দেয়। আপনি ভাড়া বাসায় থাকুন বা নিজের বাসায় — ভাতা পেলে এখানে দেখাতে হবে।',
      where: 'Salary Certificate-এ "House Rent" বা "বাড়ি ভাড়া ভাতা"।',
      how: '**মাসিক বাড়ি ভাড়া ভাতা × ১২**।',
      typical: 'সাধারণত মূল বেতনের ৫০% — অর্থাৎ মোট বেতনের ২৫%–৩০%।',
      example: 'মূল বেতন মাসে ৫০,০০০ হলে বাড়ি ভাড়া সাধারণত ২৫,০০০ → বছরে **৩,০০,০০০**।',
      tip: 'বেসরকারি চাকরিতে এটি আলাদা করে করমুক্ত নয় — মোট বেতনের সাথে যোগ হয়ে এক-তৃতীয়াংশ ছাড়ের হিসাব হয়। সরকারি চাকরিতে পুরোটাই করমুক্ত।'
    },
    medicalAllowance: {
      t: 'Medical Allowance (চিকিৎসা ভাতা)', page: 'employment', path: 'employment[0].medicalAllowance',
      live: 'Medical Allowance',
      what: 'চিকিৎসার জন্য অফিস যে ভাতা দেয়।',
      how: '**মাসিক চিকিৎসা ভাতা × ১২**।',
      typical: 'সাধারণত মূল বেতনের ১০% এর মতো। মাসে ৩,০০০–৮,০০০ টাকা প্রচলিত।',
      example: 'মাসে ৫,০০০ টাকা পেলে বছরে **৬০,০০০**।',
      tip: 'সরকারি কর্মচারীর ক্ষেত্রে সম্পূর্ণ করমুক্ত।'
    },
    conveyanceAllowance: {
      t: 'Conveyance Allowance (যাতায়াত ভাতা)', page: 'employment', path: 'employment[0].conveyanceAllowance',
      live: 'Conveyance Allowance',
      what: 'অফিসে যাওয়া-আসার খরচ বাবদ নগদ ভাতা।',
      how: '**মাসিক যাতায়াত ভাতা × ১২**।',
      typical: 'বছরে ৩০,০০০ টাকার মতো খুব প্রচলিত।',
      mistake: '⚠️ অফিস থেকে গাড়ি পেলে সেটা এখানে নয় — ডান পাশের "Vehicle Facility Provided" ঘরে যাবে।'
    },
    festivalBonus: {
      t: 'Festival Bonus (উৎসব বোনাস)', page: 'employment', path: 'employment[0].festivalBonus',
      live: 'Festival Bonus',
      what: 'ঈদ/পূজা ইত্যাদি উৎসবে পাওয়া বোনাস।',
      how: 'বছরে যতগুলো উৎসব বোনাস পেয়েছেন সব যোগ করুন।',
      typical: 'সাধারণত ২টি বোনাস, প্রতিটি এক মাসের মূল বেতনের সমান।',
      example: 'মূল বেতন ৫০,০০০ এবং ২টি বোনাস পেলে → **১,০০,০০০**।',
      mistake: 'পারফরম্যান্স বোনাস বা ইনসেনটিভ এখানে নয় — সেটা "Add More → Other Bonus"-এ দিন।'
    },
    salaryExtra: {
      t: 'Add More (অন্যান্য বেতন উপাদান)', page: 'employment',
      what: 'উপরের পাঁচটি ছাড়া বেতনের বাকি সব উপাদান এখানে যোগ করুন।',
      typical: 'বকেয়া বেতন (Arrear), শিক্ষা ভাতা, ওভারটাইম, ছুটি ভাতা, পারফরম্যান্স বোনাস, গ্র্যাচুইটি, ভবিষ্য তহবিলে (RPF) নিয়োগকর্তার চাঁদা, RPF-এ জমা সুদ।',
      how: 'ড্রপডাউন থেকে ধরন বেছে নিয়ে বার্ষিক অঙ্ক লিখুন। একাধিক থাকলে "+ Add More" চেপে সারি বাড়ান।',
      mistake: 'Salary Certificate-এ যা যা আছে সব দিতে হবে। কিছু বাদ পড়লে অফিসের পাঠানো তথ্যের সাথে মিলবে না — নোটিশ আসতে পারে।'
    },
    rentFreeAccommodation: {
      t: 'Rent Free Accommodation (বিনা ভাড়ায় বাসা)', page: 'employment', path: 'employment[0].nonCash.rentFreeAccommodation',
      what: 'অফিস আপনাকে বিনা ভাড়ায় বাসা দিলে সেই বাসার বাজার ভাড়া।',
      how: 'ওই এলাকায় একই মানের বাসার বছরের ভাড়া কত হতো, সেই অঙ্ক।',
      tip: 'টাকা হাতে পাননি, কিন্তু সুবিধা পেয়েছেন — তাই বেতনের অংশ হিসেবে যোগ হয়। ডেমো এটা "টাকার উৎস" হিসাব থেকে নিজে থেকেই বাদ দেয়।'
    },
    concessionalAccommodation: {
      t: 'Accommodation at Concessional Rate (কম ভাড়ায় বাসা)', page: 'employment', path: 'employment[0].nonCash.concessionalAccommodation',
      what: 'বাজারদরের চেয়ে কম ভাড়ায় অফিসের বাসা পেলে, বাজার ভাড়া ও আপনার দেওয়া ভাড়ার পার্থক্য।',
      example: 'বাজার ভাড়া বছরে ৩,০০,০০০, আপনি দেন ১,০০,০০০ → এখানে লিখবেন ২,০০,০০০।'
    },
    vehicleFacility: {
      t: 'Vehicle Facility Provided (অফিসের গাড়ি)', page: 'employment', path: 'employment[0].nonCash.vehicleFacility',
      what: 'অফিসের গাড়ি ব্যক্তিগত কাজেও ব্যবহার করলে নির্ধারিত হারে একটা মূল্য বেতনের সাথে যোগ হয়।',
      how: 'সাধারণত গাড়ির ইঞ্জিন ক্ষমতা (CC) অনুযায়ী মাসে নির্দিষ্ট অঙ্ক ধরা হয় — অফিসের হিসাব বিভাগ থেকে সংখ্যাটা নিন।'
    },
    otherNonCash: {
      t: 'Other Non-Cash Benefit', page: 'employment', path: 'employment[0].nonCash.otherNonCash',
      what: 'অন্য যেকোনো অ-নগদ সুবিধা — যেমন বিনা সুদে/কম সুদে ঋণ, অফিসের দেওয়া গৃহকর্মী, ক্লাব সদস্যপদ।'
    },

    /* ============ Rent ============ */
    propertyType: {
      t: 'Property Type', page: 'rent', path: 'rent[0].propertyType', live: 'Property Type',
      what: 'কী ভাড়া দিয়েছেন।',
      how: 'বাড়ি/ফ্ল্যাট/অ্যাপার্টমেন্ট → "House Property"। খালি জমি, দোকান, গুদাম ইত্যাদি → "Other Property"।'
    },
    rentAddress: {
      t: 'Address of the Property', page: 'rent', path: 'rent[0].address',
      what: 'ভাড়া দেওয়া সম্পত্তির পূর্ণ ঠিকানা।',
      where: 'দলিল বা হোল্ডিং ট্যাক্সের রসিদে যেভাবে আছে।'
    },
    inCityCorporation: {
      t: 'Is it in any city corporation?', page: 'rent', path: 'rent[0].inCityCorporation',
      what: 'সম্পত্তিটি সিটি কর্পোরেশন এলাকার ভেতরে কিনা।',
      tip: 'সারচার্জ ও IT-10B বাধ্যতামূলক কিনা — এই দুই হিসাবে কাজে লাগে।'
    },
    areaPersonalUse: {
      t: 'Area Occupied for Personal Use', page: 'rent', path: 'rent[0].areaPersonalUse',
      what: 'পুরো বাড়ির কতটুকু অংশে আপনি নিজে থাকেন (বর্গফুটে)।',
      tip: 'নিজে যে অংশে থাকেন সেটার কোনো ভাড়া আয় ধরা হয় না।',
      example: '৩,০০০ বর্গফুটের বাড়ির ১,২০০ বর্গফুটে নিজে থাকলে এখানে ১২০০ লিখুন।'
    },
    annualRent: {
      t: 'Annual Rent (চুক্তির বার্ষিক ভাড়া)', page: 'rent', path: 'rent[0].residential.annualRent',
      live: 'Annual Rent',
      what: 'ভাড়ার চুক্তি অনুযায়ী বছরে যত টাকা পাওয়ার কথা।',
      how: 'মাসিক ভাড়া × ১২।',
      example: 'মাসে ২৫,০০০ টাকায় ভাড়া দিলে → ৩,০০,০০০।',
      mistake: 'চুক্তির ভাড়া আর প্রকৃত পাওয়া ভাড়ার মধ্যে **যেটি বেশি** সেটাকেই আয় ধরা হয়।'
    },
    rentReceived: {
      t: 'Rent Received (বাস্তবে পাওয়া ভাড়া)', page: 'rent', path: 'rent[0].residential.rentReceived',
      what: 'বছরে হাতে বা ব্যাংকে বাস্তবে যত ভাড়া এসেছে।',
      example: 'বাড়ি ২ মাস খালি থাকলে ১০ মাসের ভাড়াই পাবেন — সেই অঙ্কটা লিখুন।',
      tip: '৫০,০০০ টাকার বেশি মাসিক ভাড়া হলে ব্যাংকের মাধ্যমে নেওয়া বাধ্যতামূলক।'
    },
    chargePaidByTenant: {
      t: 'Any Charge Paid by Tenant', page: 'rent', path: 'rent[0].residential.chargePaidByTenant',
      what: 'ভাড়াটিয়া যদি আপনার হয়ে সার্ভিস চার্জ, হোল্ডিং ট্যাক্স বা বিল দেয়, সেই টাকাও আপনার আয় হিসেবে ধরা হয়।'
    },
    rentInsurance: {
      t: 'Insurance Premium (ভাড়া খাত)', page: 'rent', path: 'rent[0].deductions.insurancePremium',
      what: 'ভাড়া দেওয়া বাড়ির অগ্নি/সম্পত্তি বীমার প্রিমিয়াম — খরচ হিসেবে বাদ যায়।'
    },
    rentLoanInterest: {
      t: 'Interest paid on Loan/Mortgage (গৃহঋণের সুদ)', page: 'rent', path: 'rent[0].deductions.loanInterest',
      what: 'ওই ভাড়া দেওয়া বাড়ি কেনা/বানানোর ঋণে বছরে যত সুদ দিয়েছেন।',
      where: 'ব্যাংক থেকে "Interest Certificate" নিন — সেখানে বছরের সুদ আলাদা করে লেখা থাকে।',
      tip: '⭐ এটি সবচেয়ে বড় ছাড়গুলোর একটি — পুরো সুদটাই বাদ যায়। অনেকে ভুলে যান এবং হাজার হাজার টাকা বেশি কর দেন।',
      example: 'বছরে ৩,৬০,০০০ টাকা কিস্তি দিলে তার মধ্যে হয়তো ২,৮০,০০০ সুদ — সেই ২,৮০,০০০ এখানে লিখবেন, পুরো কিস্তি নয়।'
    },
    rentMunicipalTax: {
      t: 'Municipal, Local Tax or Land Revenue', page: 'rent', path: 'rent[0].deductions.municipalTax',
      what: 'সিটি কর্পোরেশন/পৌরসভার হোল্ডিং ট্যাক্স বা ভূমি উন্নয়ন কর।',
      where: 'হোল্ডিং ট্যাক্সের রসিদ বা খাজনার দাখিলা।'
    },
    rentRepair: {
      t: 'Repair, Collections, etc. (মেরামত খরচ)', page: 'rent',
      what: 'বাড়ি মেরামত, রক্ষণাবেক্ষণ ও ভাড়া আদায়ের খরচ।',
      how: '⭐ এটি নিজে থেকেই হিসাব হয় — আবাসিক হলে মোট ভাড়ার ২৫%, বাণিজ্যিক হলে ৩০%। **কোনো ভাউচার বা প্রমাণ লাগে না।**',
      example: 'বছরে ৩,০০,০০০ টাকা আবাসিক ভাড়া হলে ৭৫,০০০ টাকা এমনিতেই বাদ যাবে।',
      tip: 'প্রকৃত খরচ কম হলেও এই হারে ছাড় পাবেন — এটি আইনসম্মত সুবিধা।'
    },
    rentPreRental: {
      t: 'Pre-rental interest', page: 'rent', path: 'rent[0].deductions.preRentalInterest',
      what: 'বাড়ি ভাড়া দেওয়া শুরু হওয়ার আগের সময়ের গৃহঋণের সুদ।',
      how: 'নির্মাণকালীন সময়ের সুদ কয়েক বছরে ভাগ করে বাদ দেওয়া যায়।'
    },
    unadjustableAdvance: {
      t: 'Unadjustable Advance / Selami / Premium', page: 'rent', path: 'rent[0].special.unadjustableAdvance',
      what: 'যে অগ্রিম বা সেলামি ভাড়াটিয়াকে আর ফেরত দিতে হবে না — পুরোটাই আপনার আয়।'
    },
    refundableDeposit: {
      t: 'Refundable / Adjustable Deposit (ফেরতযোগ্য জামানত)', page: 'rent', path: 'rent[0].special.refundableDeposit',
      what: 'ভাড়াটিয়ার কাছ থেকে নেওয়া অগ্রিম যা পরে ফেরত দিতে হবে।',
      how: 'বছর শেষে আপনার হাতে যত জামানত আছে তার **১০%** আয় হিসেবে ধরা হয়।',
      example: '৫,০০,০০০ টাকা জামানত থাকলে ৫০,০০০ টাকা আয় ধরা হবে।'
    },
    ownershipPercent: {
      t: 'আপনার মালিকানার অংশ (%)', page: 'rent', path: 'rent[0].ownershipPercent',
      what: 'বাড়িটি যৌথ মালিকানার হলে আপনার ভাগ কত শতাংশ।',
      example: 'স্বামী-স্ত্রী সমান মালিক হলে ৫০ লিখুন — তখন ভাড়া আয়ের অর্ধেক আপনার রিটার্নে আসবে।'
    },

    /* ============ Agriculture ============ */
    agricultureType: {
      t: 'Agriculture Type', page: 'agriculture', path: 'agriculture[0].agricultureType',
      what: 'কৃষি আয়ের ধরন — ফসল চাষ, খামার (মাছ/গরু/মুরগি), চা-রাবার বাগান, ইত্যাদি।'
    },
    agriArea: {
      t: 'Total Cultivation Area', page: 'agriculture', path: 'agriculture[0].area',
      what: 'যত জমিতে চাষ করেছেন তার পরিমাণ। পাশের ঘর থেকে একক (শতক/একর/বিঘা) বেছে নিন।'
    },
    agriBooks: {
      t: 'Maintain Books of Accounts? (হিসাবের বই রাখেন?)', page: 'agriculture', path: 'agriculture[0].booksOfAccounts',
      what: 'কৃষি আয়-ব্যয়ের নিয়মিত হিসাবের খাতা রাখেন কিনা।',
      tip: '⭐ "No" দিলে বিক্রয়মূল্যের **৬০%** উৎপাদন খরচ হিসেবে নিজে থেকেই বাদ যাবে — কোনো কাগজ লাগবে না। বেশির ভাগ ছোট কৃষকের জন্য এটাই সুবিধাজনক।',
      example: '৫,০০,০০০ টাকার ফসল বিক্রি করলে ৩,০০,০০০ খরচ ধরে নিট আয় ২,০০,০০০ হবে।'
    },
    salesProceed: {
      t: 'Sales Proceed (বিক্রয়মূল্য)', page: 'agriculture', path: 'agriculture[0].salesProceed',
      what: 'বছরে কৃষিপণ্য বিক্রি করে মোট যত টাকা পেয়েছেন।'
    },
    costOfProduction: {
      t: 'Cost of Production (উৎপাদন খরচ)', page: 'agriculture', path: 'agriculture[0].costOfProduction',
      what: 'বীজ, সার, কীটনাশক, সেচ, শ্রমিক, পরিবহন — উৎপাদনের সব খরচ।',
      tip: 'হিসাবের বই না থাকলে এটি নিজে থেকেই বিক্রয়মূল্যের ৬০% বসে যাবে।'
    },

    /* ============ Business ============ */
    businessCategory: {
      t: 'Business Category', page: 'business', path: 'business[0].businessCategory',
      what: 'ব্যবসার ধরন।',
      typical: 'সাধারণ দোকান, ট্রেডিং, সেবা, ফ্রিল্যান্সিং, ডাক্তার/উকিল/প্রকৌশলীর পেশা → "Business or Professional Income"।',
      tip: 'বাকি অপশনগুলো বিশেষ ধরনের ব্যবসার জন্য — তামাক, কোমল পানীয়, চা-রাবার ইত্যাদি।'
    },
    businessName: {
      t: 'Business Name', page: 'business', path: 'business[0].businessName',
      what: 'ব্যবসা প্রতিষ্ঠানের নাম।',
      where: 'ট্রেড লাইসেন্সে যেভাবে লেখা।'
    },
    turnover: {
      t: 'Sales/Turnover/Receipts (মোট বিক্রি)', page: 'business', path: 'business[0].turnover',
      what: 'বছরে ব্যবসা থেকে মোট যত টাকা এসেছে — খরচ বাদ দেওয়ার আগে।',
      example: 'দোকানে বছরে ৫০ লাখ টাকার মাল বিক্রি করলে এখানে ৫০,০০,০০০।'
    },
    costOfGoodsSold: {
      t: 'Cost of Goods Sold (বিক্রিত পণ্যের ক্রয়মূল্য)', page: 'business', path: 'business[0].costOfGoodsSold',
      what: 'যে মাল বিক্রি করেছেন সেটা কিনতে বা বানাতে যত খরচ হয়েছে।',
      how: 'বছরের শুরুর মজুদ + এ বছরের কেনা − বছর শেষের মজুদ।',
      tip: 'Turnover − এই অঙ্ক = Gross Profit (মোট মুনাফা)।'
    },
    businessExpense: {
      t: 'Expenses (ব্যবসার খরচ)', page: 'business',
      what: 'ব্যবসা চালাতে যত খরচ হয়েছে — এগুলো বাদ দিলে নিট মুনাফা কমে, কর কমে।',
      typical: 'কর্মচারীর বেতন, দোকান ভাড়া, বিদ্যুৎ-পানি, পরিবহন, বিজ্ঞাপন, ব্যাংক সুদ ও চার্জ, অবচয় (Depreciation), অনাদায়ী পাওনা।',
      tip: '⭐ **অবচয় (Depreciation)** — দোকানের ফ্রিজ, শোকেস, কম্পিউটার, গাড়ি প্রতি বছর যত মূল্য হারায় তা খরচ হিসেবে বাদ দেওয়া যায়। অনেকেই এটা দেখান না — বড় ছাড় হারান।',
      mistake: 'ব্যক্তিগত খরচ (নিজের সংসার খরচ) এখানে দেওয়া যাবে না — সেটা Expenditure পাতায় যাবে।'
    },
    balanceSheet: {
      t: 'Balance Sheet Summary', page: 'business',
      what: 'ব্যবসার সম্পদ, মূলধন ও দায়ের সংক্ষিপ্ত চিত্র।',
      how: 'Total Assets = Total Capital and Liabilities — দুটো সমান হতেই হবে।\nClosing Capital = Opening Capital + Net Profit − Withdrawals।',
      mistake: 'না মিললে লাইভ সাইট সামনে এগোতে দেবে না। মিলছে না মানে কোথাও একটা অঙ্ক বাদ পড়েছে।'
    },

    /* ============ Capital Gain ============ */
    typeOfGains: {
      t: 'Type of Gains', page: 'capital-gain', path: 'capitalGain[0].typeOfGains',
      what: 'কোন জিনিস বিক্রি করে লাভ হয়েছে — জমি, ফ্ল্যাট, শেয়ার, স্বর্ণ ইত্যাদি।'
    },
    saleDeedValue: {
      t: 'Sale Deed Value (দলিলমূল্য)', page: 'capital-gain', path: 'capitalGain[0].saleDeedValue',
      what: 'বিক্রির দলিলে যত টাকা লেখা আছে।',
      where: 'সাব-রেজিস্ট্রি অফিসের দলিল থেকে।'
    },
    excessOverDeed: {
      t: 'Excess Amount Received Over Deed Value', page: 'capital-gain', path: 'capitalGain[0].excessOverDeed',
      what: 'দলিলে লেখা অঙ্কের চেয়ে বেশি টাকা পেলে সেই অতিরিক্ত অংশ।',
      tip: 'সৎভাবে দেখানোই ভালো — না দেখালে ওই টাকা সম্পদে যোগ করার সময় "উৎস কী" প্রশ্ন আসবে।'
    },
    costOfAcquisition: {
      t: 'Cost of Acquisition (কেনার খরচ)', page: 'capital-gain', path: 'capitalGain[0].costOfAcquisition',
      what: 'জিনিসটা যখন কিনেছিলেন তখন মোট কত খরচ হয়েছিল।',
      how: '⭐ শুধু দাম নয় — **রেজিস্ট্রেশন ফি, স্ট্যাম্প খরচ, উকিলের ফি, উন্নয়ন/নির্মাণ খরচ** সবই যোগ করুন। যত বেশি খরচ দেখাতে পারবেন, লাভ তত কম, কর তত কম।',
      example: '১০ বছর আগে ২০ লাখে জমি কিনে ৩ লাখ রেজিস্ট্রেশন খরচ হলে Cost = ২৩,০০,০০০।',
      mistake: 'শুধু দলিলের দাম লিখে রেজিস্ট্রেশন খরচ বাদ দিয়ে দেওয়া — এতে বাড়তি কর দিতে হয়।'
    },
    cgTds: {
      t: 'Tax Deducted/Collected at Source', page: 'capital-gain', path: 'capitalGain[0].tds',
      what: 'দলিল রেজিস্ট্রেশনের সময় সাব-রেজিস্ট্রি অফিস যে কর কেটে রেখেছিল।',
      tip: '⭐ এটি আপনার প্রদেয় কর থেকে সরাসরি বাদ যায় — দাবি করতে ভুলবেন না। দলিলের সাথে রসিদ থাকে।'
    },

    /* ============ Financial Assets ============ */
    faType: {
      t: 'আর্থিক সম্পদের ধরন', page: 'financial-assets',
      what: 'টাকা কোথায় রেখেছেন এবং কী ধরনের মুনাফা পাচ্ছেন।',
      how: '• সঞ্চয়পত্রের মুনাফা → "Interest From Sanchayapatra"\n• ব্যাংকের সঞ্চয়ী/FDR-এর সুদ বা ইসলামী ব্যাংকের মুনাফা → "Interest/Profit (Bank/FI)"\n• ট্রেজারি বিল/বন্ড/সুকুক → তৃতীয় অপশন\n• শেয়ারের লভ্যাংশ → "Dividend (Any kind)"',
      tip: '⭐ সঞ্চয়পত্র ও ট্রেজারির মুনাফা "চূড়ান্ত করদায়" — কেনার সময় কাটা ১০% করই শেষ, স্ল্যাব হারে আবার কর বসে না।'
    },
    faValue: {
      t: 'Value (বিনিয়োগের অঙ্ক)', page: 'financial-assets',
      what: 'কত টাকা রেখেছেন (মুনাফা নয়, মূল টাকা)।',
      example: '৫ লাখ টাকার সঞ্চয়পত্র কিনলে এখানে ৫,০০,০০০।'
    },
    grossInterest: {
      t: 'Gross Interest / Profit (মোট সুদ/মুনাফা)', page: 'financial-assets',
      what: 'বছরে যত সুদ বা মুনাফা পেয়েছেন — **কর কাটার আগের** অঙ্ক।',
      where: 'ব্যাংকের স্টেটমেন্ট, অথবা ব্যাংক থেকে "Interest Certificate"/"মুনাফা সনদ" চেয়ে নিন। সঞ্চয়পত্রের ক্ষেত্রে ব্যাংক/পোস্ট অফিসের মুনাফার কাগজ।',
      mistake: '⚠️ হাতে পাওয়া অঙ্ক (কর কাটার পরের) লিখে ফেলা। মোট সুদ লিখতে হবে, আর কাটা কর পাশের TDS ঘরে।',
      example: 'ব্যাংক ২৫,০০০ সুদ দিয়ে ২,৫০০ কর কেটে ২২,৫০০ দিলে → Gross Interest ২৫,০০০, TDS ২,৫০০।'
    },
    faTds: {
      t: 'TDS (উৎসে কাটা কর)', page: 'financial-assets',
      what: 'সুদ/মুনাফা থেকে ব্যাংক যত টাকা কর কেটে রেখেছে।',
      typical: 'TIN থাকলে ব্যাংক সুদে ১০%, TIN না থাকলে ১৫%। সঞ্চয়পত্রে ১০%।',
      tip: '⭐ এই পুরো টাকাটা আপনার প্রদেয় কর থেকে বাদ যাবে — দাবি করতেই হবে।'
    },

    /* ============ Other Sources ============ */
    osType: {
      t: 'Income Type', page: 'other-sources',
      what: 'বেতন/ভাড়া/ব্যবসা/কৃষি — এসবের বাইরের আয়।',
      typical: 'বই বা গানের রয়্যালটি, কোম্পানির লভ্যাংশ তহবিল (WPPF), লাইসেন্স ফি, কারিগরি সেবার ফি, সরকারি ভর্তুকি, লটারি/প্রাইজবন্ডের পুরস্কার, সভার সম্মানী, যৌথ উদ্যোগের মুনাফা।'
    },
    osGross: {
      t: 'Gross Amount Received', page: 'other-sources',
      what: 'কর কাটার আগে মোট যত টাকা পেয়েছেন।'
    },
    osExpense: {
      t: 'Related Expenses', page: 'other-sources',
      what: 'ওই আয় করতে সরাসরি যে খরচ হয়েছে — সেটা বাদ যাবে।',
      example: 'সম্মানী পেতে যাতায়াত খরচ হলে সেটা এখানে দেখানো যায়।'
    },

    /* ============ Tax Exempted ============ */
    exemptType: {
      t: 'Tax Exempted Income Type', page: 'exempted',
      what: 'সম্পূর্ণ করমুক্ত আয়ের ধরন।',
      typical: '• বৈধ পথে (ব্যাংকিং চ্যানেলে) আসা বৈদেশিক রেমিট্যান্স\n• সরকারি পেনশন ও গ্র্যাচুইটি\n• সর্বজনীন পেনশন স্কিমের টাকা\n• সফটওয়্যার/IT সেবা রপ্তানির নির্দিষ্ট আয়\n• সরকারি পুরস্কার ও কল্যাণ ভাতা',
      tip: '⭐ এই আয় দেখালে কর এক টাকাও বাড়ে না, বরং টাকার উৎস প্রমাণিত হয় — সম্পদ বাড়ার ব্যাখ্যা দিতে দারুণ কাজে লাগে।'
    },
    exemptAmount: {
      t: 'Amount', page: 'exempted',
      what: 'করমুক্ত আয়ের পরিমাণ।',
      where: 'রেমিট্যান্স হলে ব্যাংকের এনক্যাশমেন্ট সার্টিফিকেট নিন। পেনশন হলে পেনশন বইয়ের হিসাব।'
    },

    /* ============ Rebate ============ */
    rebateIntro: {
      t: '📚 বিনিয়োগ কর রেয়াত — কীভাবে কাজ করে', page: 'rebate',
      what: 'সরকার চায় আপনি সঞ্চয় করুন। তাই কিছু নির্দিষ্ট খাতে টাকা রাখলে আপনার করের একটা অংশ মাফ হয় — এটাই "রেয়াত"। এটা খরচ নয়, টাকাটা আপনারই থাকে; শুধু কর কমে যায়।',
      how: 'রেয়াত = নিচের তিনটার মধ্যে **যেটা সবচেয়ে কম**:\n' +
        '১) আপনার অনুমোদিত বিনিয়োগের ১০%\n' +
        '২) আপনার মোট আয়ের ৩%\n' +
        '৩) ৭,৫০,০০০ টাকা',
      example: 'মোট আয় ৮,০০,০০০ টাকা হলে —\n' +
        'আয়ের ৩% = ২৪,০০০ টাকা (এটাই আপনার সর্বোচ্চ রেয়াত)\n' +
        '২৪,০০০ পেতে বিনিয়োগ লাগবে ২,৪০,০০০ টাকা (কারণ ২,৪০,০০০-এর ১০% = ২৪,০০০)\n' +
        'অর্থাৎ **মোট আয়ের প্রায় ৩০% বিনিয়োগ করলেই সর্বোচ্চ রেয়াত** — এর বেশি বিনিয়োগে আর কর কমবে না।',
      tip: '⭐ কোন কোন খাতে বিনিয়োগ গোনা হয়: DPS (বছরে সর্বোচ্চ ১,২০,০০০), সঞ্চয়পত্র, জীবন বীমার প্রিমিয়াম, তালিকাভুক্ত শেয়ার/মিউচুয়াল ফান্ড, GPF/RPF, সর্বজনীন পেনশন স্কিম, সরকারি জাকাত ফান্ড।',
      mistake: '⚠️ বিনিয়োগটা ৩০ জুনের মধ্যে হতেই হবে। রিটার্ন জমার সময় (নভেম্বরে) DPS খুললে সেটা এ বছর গোনা হবে না।'
    },
    lifeInsurance: {
      t: 'Life Insurance Premium (জীবন বীমা)', page: 'rebate',
      what: 'নিজের, স্বামী/স্ত্রীর বা সন্তানের জীবন বীমার প্রিমিয়াম।',
      how: 'বছরে যত প্রিমিয়াম দিয়েছেন।',
      mistake: '⚠️ প্রিমিয়াম পলিসি মূল্যের ১০%-এর বেশি হলে অতিরিক্ত অংশে রেয়াত পাবেন না।',
      example: 'পলিসি ৫,০০,০০০ টাকার, প্রিমিয়াম দিয়েছেন ৬০,০০০ → রেয়াতযোগ্য মাত্র ৫০,০০০ (৫ লাখের ১০%)।'
    },
    policyValue: {
      t: 'Policy Value (পলিসির মূল্য)', page: 'rebate',
      what: 'বীমা পলিসিতে যত টাকার নিশ্চয়তা দেওয়া আছে (Sum Assured)।',
      where: 'বীমার পলিসি কাগজে বড় করে লেখা থাকে।'
    },
    premiumPaid: {
      t: 'Premium Paid', page: 'rebate',
      what: 'এই আয়বর্ষে বাস্তবে যত প্রিমিয়াম জমা দিয়েছেন।',
      where: 'বীমা কোম্পানির প্রিমিয়াম জমার রসিদ।'
    },
    dps: {
      t: 'Deposit Pension Scheme (DPS)', page: 'rebate',
      what: 'ব্যাংক বা আর্থিক প্রতিষ্ঠানে প্রতি মাসে নির্দিষ্ট টাকা জমা রাখার স্কিম।',
      how: 'বছরে মোট যত টাকা জমা দিয়েছেন।',
      mistake: '⚠️ বছরে সর্বোচ্চ **১,২০,০০০ টাকা** রেয়াতযোগ্য — অর্থাৎ মাসে ১০,০০০ টাকা। একাধিক ব্যাংকে DPS থাকলেও সব মিলিয়ে ১,২০,০০০।',
      example: 'মাসে ১০,০০০ করে দিলে বছরে ১,২০,০০০ → পুরোটাই গোনা হবে। মাসে ১৫,০০০ দিলে ১,৮০,০০০ জমা হলেও গোনা হবে ১,২০,০০০।',
      tip: 'নতুন করদাতার জন্য সবচেয়ে সহজ রেয়াতের পথ — ব্যাংকে গিয়ে DPS খুললেই হয়।'
    },
    sanchayapatraInv: {
      t: 'Approved Sanchayapatra & Govt. Securities', page: 'rebate',
      what: 'এই আয়বর্ষে **নতুন কেনা** সঞ্চয়পত্র বা সরকারি সিকিউরিটিজ।',
      mistake: '⚠️ আগের বছর কেনা সঞ্চয়পত্র এখানে নয় — শুধু এ বছর যা কিনেছেন।',
      tip: 'আগের কেনাগুলো Assets & Liabilities পাতায় সম্পদ হিসেবে দেখাবেন।'
    },
    mutualFund: {
      t: 'Unit Certificate / Mutual Fund / ETF', page: 'rebate',
      what: 'মিউচুয়াল ফান্ড, ইউনিট সার্টিফিকেট বা ETF-এ এ বছরের বিনিয়োগ।',
      where: 'ফান্ডের স্টেটমেন্ট বা ক্রয়ের রসিদ।'
    },
    listedStocks: {
      t: 'Listed Stocks or Shares (শেয়ার)', page: 'rebate',
      what: 'ঢাকা/চট্টগ্রাম স্টক এক্সচেঞ্জে তালিকাভুক্ত কোম্পানির শেয়ারে বছরের নিট বিনিয়োগ।',
      how: 'বছরে যত টাকার শেয়ার কিনেছেন − যত টাকার বিক্রি করেছেন = নিট বিনিয়োগ।',
      where: 'ব্রোকারেজ হাউস থেকে BO অ্যাকাউন্টের বার্ষিক স্টেটমেন্ট নিন।'
    },
    gpf: {
      t: 'General Provident Fund (GPF)', page: 'rebate',
      what: 'সরকারি কর্মচারীদের জিপিএফ-এ বছরের চাঁদা।',
      where: 'হিসাবরক্ষণ অফিসের GPF স্লিপ।'
    },
    rpf: {
      t: 'Recognized Provident Fund (RPF)', page: 'rebate',
      what: 'বেসরকারি প্রতিষ্ঠানের স্বীকৃত ভবিষ্য তহবিল।',
      how: 'আপনার চাঁদা এবং নিয়োগকর্তার চাঁদা — **দুটোই** রেয়াতযোগ্য বিনিয়োগ হিসেবে গোনা হয়।',
      where: 'অফিসের PF স্টেটমেন্ট।'
    },
    superannuation: {
      t: 'Approved Superannuation Fund', page: 'rebate',
      what: 'অনুমোদিত অবসর তহবিলে দেওয়া চাঁদা।'
    },
    benevolent: {
      t: 'Benevolent Fund & Group Insurance', page: 'rebate',
      what: 'অনুমোদিত কল্যাণ তহবিলের চাঁদা এবং গোষ্ঠী বীমার প্রিমিয়াম।',
      typical: 'সরকারি ও অনেক বেসরকারি চাকরিতে বেতন থেকে এই দুটো কাটা হয় — Pay Slip দেখুন।'
    },
    zakatFund: {
      t: 'Zakat Fund (জাকাত ফান্ড)', page: 'rebate',
      what: 'সরকারি জাকাত ফান্ডে দেওয়া জাকাত।',
      mistake: '⚠️ নিজে গিয়ে গরিবকে জাকাত দিলে রেয়াত পাওয়া যায় না। **সরকারি জাকাত ফান্ড ব্যবস্থাপনা আইন ২০২৩** অনুযায়ী অনুমোদিত ফান্ডে জমা দিলেই কেবল রেয়াত।',
      tip: 'যেহেতু জাকাত দিতেই হবে, সরকারি ফান্ডে দিলে করও কমে — দুই দিকেই লাভ।'
    },
    universalPension: {
      t: 'Universal Pension Scheme (সর্বজনীন পেনশন)', page: 'rebate',
      what: 'সরকারের সর্বজনীন পেনশন স্কিম — প্রবাস, প্রগতি, সুরক্ষা, সমতা।',
      tip: '⭐ দ্বিগুণ সুবিধা: এখন চাঁদা দিলে রেয়াত পাবেন, আর পরে পেনশনের টাকাও সম্পূর্ণ করমুক্ত।'
    },

    /* ============ Expenditure ============ */
    expenditureIntro: {
      t: '📚 জীবনযাত্রার ব্যয় (IT-10BB) কেন দিতে হয়', page: 'expenditure',
      what: 'বছরে আপনি কত টাকা খরচ করেছেন তার হিসাব। এটা দিয়ে কর বাড়ে না — কিন্তু NBR মেলায় যে আপনার আয় দিয়ে এই খরচ ও সম্পদ বৃদ্ধি ব্যাখ্যা করা যায় কিনা।',
      how: 'বাস্তবে যা খরচ হয়েছে তাই লিখুন। রসিদ না থাকলেও যুক্তিসঙ্গত হিসাব দিন।',
      mistake: '⚠️ সবচেয়ে বিপজ্জনক ভুল: খরচ ০ বা খুব কম দেখানো। ৮ লাখ টাকা আয় করে ১ লাখ খরচ দেখালে প্রশ্ন উঠবেই — অডিটে পড়ার বড় কারণ।',
      typical: 'একজন মধ্যবিত্ত পরিবারের বার্ষিক খরচ সাধারণত আয়ের ৫০%–৭০% হয়।'
    },
    expFood: {
      t: 'Expenses for Food, Clothing and Other Essentials', page: 'expenditure', path: 'expenditure.food',
      what: 'খাওয়া-দাওয়া, জামা-কাপড় ও নিত্যপ্রয়োজনীয় জিনিসের খরচ।',
      typical: '৪ জনের পরিবারে মাসে ২০,০০০–৩৫,০০০ টাকা মানে বছরে ২,৪০,০০০–৪,২০,০০০।',
      example: 'মাসে ২০,০০০ টাকা বাজার খরচ হলে → ২,৪০,০০০।'
    },
    expAccommodation: {
      t: 'Accommodation Expense (বাসস্থান খরচ)', page: 'expenditure', path: 'expenditure.accommodation',
      what: 'বাসা ভাড়া। নিজের বাসায় থাকলে ফ্ল্যাটের সার্ভিস চার্জ ও রক্ষণাবেক্ষণ খরচ।',
      example: 'মাসে ২০,০০০ ভাড়া দিলে → ২,৪০,০০০।'
    },
    expAuto: {
      t: 'Auto and Transportation Expenses', page: 'expenditure',
      what: 'যাতায়াতের সব খরচ।',
      how: 'গাড়ি থাকলে → ড্রাইভারের বেতন, তেল, সার্ভিসিং, ইনস্যুরেন্স। গাড়ি না থাকলে → রিকশা, বাস, উবার/পাঠাও ভাড়া "Other Transportation"-এ।',
      typical: 'গাড়ি না থাকলে বছরে ৩০,০০০–৭০,০০০। গাড়ি থাকলে ২,০০,০০০–৪,০০,০০০।'
    },
    expUtility: {
      t: 'Household and Utility Expenses', page: 'expenditure',
      what: 'বাসার নিয়মিত বিল ও গৃহকর্মীর খরচ।',
      how: 'বিদ্যুৎ, গ্যাস-পানি-সুয়ারেজ, ফোন-ইন্টারনেট-টিভি, গৃহকর্মীর বেতন — প্রতিটি আলাদা ঘরে।',
      typical: 'বিদ্যুৎ বছরে ১৮,০০০–৪৮,০০০ · গ্যাস-পানি ১২,০০০–২৪,০০০ · ফোন-ইন্টারনেট ১২,০০০–৩০,০০০।'
    },
    expEducation: {
      t: 'Education Expenses', page: 'expenditure', path: 'expenditure.education',
      what: 'সন্তানদের স্কুল-কলেজের বেতন, ভর্তি ফি, প্রাইভেট টিউটর, বই-খাতা।',
      typical: 'স্কুলপড়ুয়া দুই সন্তানে বছরে ৬০,০০০–৩,০০,০০০ (স্কুলভেদে অনেক তারতম্য)।'
    },
    expFestival: {
      t: 'Festival And Other Special Expenses', page: 'expenditure',
      what: 'উৎসব-অনুষ্ঠান, ভ্রমণ ও দান-খয়রাতের খরচ।',
      how: 'ঈদ/পূজার খরচ, বিয়ে-জন্মদিনের অনুষ্ঠান → "Festival, Party, Events"। দেশে-বিদেশে বেড়াতে যাওয়া → "Domestic and Overseas Tour"। দান-সদকা → "Philanthropy"।',
      tip: 'বিদেশ ভ্রমণ করলে অবশ্যই দেখান — পাসপোর্টে সিল থাকে, না দেখালে অসঙ্গতি ধরা পড়ে।'
    },
    expTaxPaid: {
      t: 'Tax, Charges Paid During the Year', page: 'expenditure',
      what: 'বছরে যত কর দিয়েছেন — উৎসে কাটা কর, অগ্রিম কর, আগের বছরের বকেয়া কর।',
      tip: 'Tax & Payment পাতার সংখ্যার সাথে মিল রাখুন।'
    },
    expLoanInterest: {
      t: 'Interest Payment of Personal Loan', page: 'expenditure', path: 'expenditure.personalLoanInterest',
      what: 'ব্যক্তিগত ঋণ বা ক্রেডিট কার্ডের সুদ বাবদ যা দিয়েছেন।'
    },
    expEnvSurcharge: {
      t: 'Environmental Surcharge', page: 'expenditure', path: 'expenditure.environmentalSurcharge',
      what: 'একাধিক গাড়ি থাকলে দ্বিতীয় গাড়ি থেকে যে পরিবেশ সারচার্জ দিতে হয়।',
      typical: 'একটাই গাড়ি থাকলে ০।'
    },

    /* ============ Assets ============ */
    assetsIntro: {
      t: '📚 সম্পদ ও দায় (IT-10B) — কীভাবে ভরবেন', page: 'assets',
      what: '৩০ জুন তারিখে আপনার হাতে যা যা আছে (সম্পদ) আর যা যা ঋণ আছে (দায়) তার তালিকা।',
      how: '⭐ **সম্পদ সবসময় ক্রয়মূল্যে লিখতে হয়, বাজারমূল্যে নয়।** ২০ বছর আগে ৫ লাখে কেনা জমির আজ ১ কোটি দাম হলেও লিখবেন ৫ লাখ (+ রেজিস্ট্রেশন খরচ)।',
      mistake: '⚠️ বড় ভুল: দায় (ঋণ) দেখাতে ভুলে যাওয়া। গৃহঋণ, গাড়ির ঋণ, ব্যক্তিগত ঋণ দেখালে নিট সম্পদ কমে — সারচার্জও কমে।\n' +
        '⚠️ দ্বিতীয় ভুল: গত বছরের নিট সম্পদ ভুল বসানো। এতে "তহবিলে ঘাটতি" দেখায় আর লাইভ সাইট আটকে দেয়।',
      tip: 'প্রতি বছর একই ভিত্তিতে লিখুন। এবারের রিটার্নের একটা কপি রেখে দিন — পরের বছর লাগবে।'
    },
    businessCapitalAsset: {
      t: 'Business Capital', page: 'assets', path: 'assets.businessCapital',
      what: 'ব্যবসায় আপনার নিজের যত মূলধন খাটছে (সম্পদ − দায়)।'
    },
    nonAgriProperty: {
      t: 'Non-Agricultural Property (জমি/বাড়ি/ফ্ল্যাট)', page: 'assets', path: 'assets.nonAgriProperty',
      what: 'কৃষি নয় এমন সব স্থাবর সম্পত্তি — প্লট, বাড়ি, ফ্ল্যাট, দোকান।',
      how: 'ক্রয়মূল্য + রেজিস্ট্রেশন খরচ + নির্মাণ/উন্নয়ন খরচ।',
      example: '২০ লাখে ফ্ল্যাট কিনে ৩ লাখ রেজিস্ট্রেশন ও ২ লাখ সাজসজ্জা করলে → ২৫,০০,০০০।'
    },
    agriProperty: {
      t: 'Agricultural Property (কৃষি জমি)', page: 'assets', path: 'assets.agriProperty',
      what: 'কৃষি জমির ক্রয়মূল্য।',
      tip: 'উত্তরাধিকারে পাওয়া হলে দলিলে উল্লেখ করা মূল্য লিখুন।'
    },
    shareDebentureBond: {
      t: 'Share, Debenture, Bond, Securities', page: 'assets', path: 'assets.shareDebentureBond',
      what: 'শেয়ার, বন্ড, ডিবেঞ্চার, ইউনিট সার্টিফিকেটের **ক্রয়মূল্য**।',
      mistake: '⚠️ আজকের বাজারদর নয় — যত টাকায় কিনেছিলেন সেটাই।'
    },
    sanchayapatraAsset: {
      t: 'Sanchayapatra (সঞ্চয়পত্র)', page: 'assets', path: 'assets.sanchayapatra',
      what: 'হাতে থাকা সব সঞ্চয়পত্রের মোট মূল্য (এ বছরের ও আগের বছরের সব)।'
    },
    fixedDepositAsset: {
      t: 'Fixed Deposits, Term Deposits (FDR)', page: 'assets', path: 'assets.fixedDeposit',
      what: '৩০ জুন তারিখে FDR/মেয়াদি আমানতে যত টাকা আছে।',
      where: 'ব্যাংকের FDR সার্টিফিকেট বা স্টেটমেন্ট।'
    },
    dpsAsset: {
      t: 'DPS (সম্পদ হিসেবে)', page: 'assets', path: 'assets.dps',
      what: '৩০ জুন তারিখে DPS হিসাবে জমা হওয়া মোট টাকা (সুদসহ)।',
      tip: 'এটা Rebate পাতার DPS থেকে আলাদা — ওখানে শুধু এ বছরের জমা, এখানে মোট স্থিতি।'
    },
    loansGiven: {
      t: 'Loans Given to Others (ধার দেওয়া টাকা)', page: 'assets', path: 'assets.loansGiven',
      what: 'অন্যকে ধার দিয়েছেন কিন্তু এখনো ফেরত পাননি এমন টাকা।'
    },
    providentFundAsset: {
      t: 'Provident Fund and Other Fund', page: 'assets', path: 'assets.providentFund',
      what: 'GPF/RPF-এ ৩০ জুন পর্যন্ত জমা হওয়া মোট টাকা (সুদসহ)।',
      where: 'অফিসের PF স্টেটমেন্ট।'
    },
    motorCarAsset: {
      t: 'Motor Car (গাড়ি)', page: 'assets', path: 'assets.motorCar',
      what: 'গাড়ির ক্রয়মূল্য (রেজিস্ট্রেশন খরচসহ)।',
      mistake: '⚠️ একাধিক গাড়ি থাকলে নিট সম্পদ ৪ কোটির কম হলেও ১০% সারচার্জ বসে — পাশের ঘরে সঠিক সংখ্যা দিন।'
    },
    goldJewellery: {
      t: 'Gold, Diamond, Gems and Other Items (স্বর্ণ-অলংকার)', page: 'assets', path: 'assets.goldJewellery',
      what: 'সব স্বর্ণ, হীরা ও মূল্যবান অলংকারের ক্রয়মূল্য।',
      typical: 'সাধারণ পরিবারে বিয়ের অলংকার মিলিয়ে ২–১০ ভরি খুব স্বাভাবিক।',
      tip: 'উত্তরাধিকারে বা বিয়েতে উপহার পেলে সেটাও দেখান — তাহলে ভবিষ্যতে "এত স্বর্ণ কোথা থেকে" প্রশ্ন এড়াবেন।'
    },
    furnitureElectronics: {
      t: 'Furniture, Equipments and Electronic Items', page: 'assets', path: 'assets.furnitureElectronics',
      what: 'খাট-আলমারি-সোফা, ফ্রিজ, টিভি, এসি, ওভেন, কম্পিউটার, মোবাইল — সবের ক্রয়মূল্য।',
      typical: 'একটি সাজানো সংসারে সাধারণত ১,৫০,০০০ – ৫,০০,০০০ টাকা।'
    },
    cashInHand: {
      t: 'Cash in Hand (হাতে নগদ)', page: 'assets', path: 'assets.cashInHand',
      what: '৩০ জুন তারিখে বাসায়/হাতে যত নগদ টাকা ছিল।',
      typical: 'সাধারণত ২০,০০০ – ২,০০,০০০।',
      mistake: '⚠️ অস্বাভাবিক বেশি নগদ (যেমন ২০ লাখ) দেখালে প্রশ্ন ওঠে। ব্যাংকে থাকলে ব্যাংকের ঘরে দিন।'
    },
    bankCardsElectronic: {
      t: 'Banks, Cards and Other Electronic Cash', page: 'assets', path: 'assets.bankCardsElectronic',
      what: '৩০ জুন তারিখে সব ব্যাংক হিসাব, কার্ড ও মোবাইল ব্যাংকিং (বিকাশ/নগদ)-এ যত টাকা ছিল।',
      where: 'প্রতিটি ব্যাংক থেকে ৩০ জুনের ব্যালান্স সার্টিফিকেট নিন।'
    },
    assetOutsideBangladesh: {
      t: 'Asset Outside Bangladesh', page: 'assets', path: 'assets.assetOutsideBangladesh',
      what: 'দেশের বাইরে থাকা সম্পদ, ব্যাংক হিসাব বা বিনিয়োগ।'
    },
    bankFiLoan: {
      t: 'Borrowing from Bank or Other FI (ব্যাংক ঋণ)', page: 'assets', path: 'liabilities.bankFiLoan',
      what: '৩০ জুন তারিখে ব্যাংক/আর্থিক প্রতিষ্ঠানে আপনার যত ঋণ বাকি আছে।',
      where: 'ব্যাংক থেকে ঋণের স্থিতিপত্র (Loan Balance Certificate) নিন।',
      tip: '⭐ ঋণ দেখালে নিট সম্পদ কমে — সারচার্জও কমতে পারে। গৃহঋণ, গাড়ির ঋণ দেখাতে ভুলবেন না।'
    },
    unsecuredLoan: {
      t: 'Unsecured Loan (আত্মীয়/বন্ধুর ঋণ)', page: 'assets', path: 'liabilities.unsecuredLoan',
      what: 'বন্ধু, আত্মীয় বা পরিচিতজনের কাছ থেকে নেওয়া ঋণ যা এখনো শোধ হয়নি।',
      mistake: '⚠️ ৫ লাখ টাকার বেশি হলে ব্যাংকিং চ্যানেলে (চেক/ব্যাংক ট্রান্সফার) নিতে হবে — নগদ নিলে গ্রহণযোগ্য হবে না।'
    },
    previousNetWealth: {
      t: 'Net Wealth at the Last Date of Previous Income Year', page: 'assets', path: 'wealth.previousNetWealth',
      what: 'গত বছরের রিটার্নে আপনার নিট সম্পদ কত দেখিয়েছিলেন।',
      where: 'গত বছরের জমা দেওয়া রিটার্নের কপি খুলে "Net Wealth" লাইনটি দেখুন।',
      how: 'এবারের নিট সম্পদ − গত বছরের নিট সম্পদ = এ বছর সম্পদ কত বেড়েছে। সেই বৃদ্ধি + সব খরচ আপনার আয় দিয়ে ব্যাখ্যা করতে হবে।',
      mistake: '⚠️ ভুল বসালে "You have shortage of fund" দেখাবে এবং লাইভ সাইট সামনে এগোতে দেবে না। এটাই সবচেয়ে বেশি মানুষ যেখানে আটকায়।',
      tip: 'প্রথমবার রিটার্ন দিলে ০ দিন — তখন এ বছরের পুরো সম্পদই "নতুন" ধরা হবে, আর তার উৎস দেখাতে হবে।'
    },
    giftDonation: {
      t: 'Gift, Donation and Contribution (দিয়েছেন)', page: 'assets', path: 'wealth.giftDonation',
      what: 'বছরে আপনি অন্যকে যত টাকা উপহার বা দান করেছেন।'
    },
    otherReceipts: {
      t: 'Other Receipts (অন্যান্য প্রাপ্তি)', page: 'assets', path: 'wealth.otherReceipts',
      what: 'যে টাকা আয় নয় কিন্তু হাতে এসেছে — উত্তরাধিকার সূত্রে পাওয়া, বিয়ের উপহার, পুরনো সম্পদ বিক্রির টাকা, স্বামী/স্ত্রীর দেওয়া টাকা।',
      tip: '⭐ "তহবিলে ঘাটতি" মেলানোর সবচেয়ে বৈধ জায়গা এটি। তবে প্রমাণ (দানপত্র, ওয়ারিশ সনদ, বিক্রির দলিল) রাখতে হবে।',
      mistake: 'প্রমাণ ছাড়া বড় অঙ্ক লিখে দেওয়া ঝুঁকিপূর্ণ।'
    },
    houseSqftInCityCorp: {
      t: 'সিটি কর্পোরেশনে গৃহসম্পত্তির আয়তন (বর্গফুট)', page: 'assets', path: 'wealth.houseSqftInCityCorp',
      what: 'সিটি কর্পোরেশন এলাকায় আপনার বাড়ি/ফ্ল্যাটের মোট আয়তন।',
      mistake: '⚠️ ৮,০০০ বর্গফুট ছাড়ালে নিট সম্পদ কম হলেও ১০% সারচার্জ বসে।'
    },

    /* ============ Tax & Payment ============ */
    sourceTax: {
      t: 'Source Tax (উৎসে কাটা কর)', page: 'tax', path: 'payments.sourceTax',
      what: 'বছরজুড়ে বিভিন্ন জায়গা থেকে আগেই কেটে নেওয়া কর।',
      how: 'সব যোগ করুন — বেতন থেকে কাটা কর + ব্যাংক সুদের TDS + সঞ্চয়পত্রের ১০% + গাড়ির অগ্রিম কর + জমি রেজিস্ট্রেশনের কর + মোবাইল/ইন্টারনেট বিলের কর নয় (সেটা ভ্যাট)।',
      where: 'প্রতিটির জন্য সনদ নিন — অফিস থেকে TDS সার্টিফিকেট, ব্যাংক থেকে কর কর্তনের সনদ।',
      tip: '⭐ এটি প্রদেয় কর থেকে সরাসরি বাদ যায়। অনেকে এটা দাবি না করে বাড়তি কর দিয়ে দেন।',
      mistake: '⚠️ সনদ ছাড়া দাবি করবেন না — যাচাইয়ে না মিললে সমস্যা।'
    },
    advanceIncomeTax: {
      t: 'Advance Income Tax (অগ্রিম আয়কর)', page: 'tax', path: 'payments.advanceIncomeTax',
      what: 'বছরের মধ্যে কিস্তিতে আগেই যে কর জমা দিয়েছেন।',
      typical: 'বড় ব্যবসায়ীদের ক্ষেত্রে হয়। চাকরিজীবীদের সাধারণত ০।'
    },
    taxPaidWithReturn: {
      t: 'Tax Paid With Return', page: 'tax', path: 'payments.taxPaidWithReturn',
      what: 'রিটার্ন জমা দেওয়ার সময় চালান বা a-Chalan দিয়ে যত কর দিচ্ছেন।',
      how: 'উপরের হিসাবে "Net Payable" যত আসবে, ঠিক তত টাকা এখানে দিতে হবে।'
    },
    refundAdjustment: {
      t: 'Adjustment of Tax Refund', page: 'tax', path: 'payments.refundAdjustment',
      what: 'আগের বছর বেশি কর দিয়ে ফেলেছিলেন? সেই ফেরতযোগ্য টাকা এ বছরের করের সাথে সমন্বয় করা যায়।'
    },
    carryForward: {
      t: 'Carry forwarded amount', page: 'tax', path: 'payments.carryForward',
      what: 'আগের করবর্ষ থেকে বয়ে আনা উদ্বৃত্ত টাকা।'
    }
  };

  /* পুরনো ফরম্যাটের সাথে মিল রাখা (d / e) */
  Object.keys(HELP).forEach(k => {
    const h = HELP[k];
    if (!h.d) h.d = h.what || '';
    if (!h.e) h.e = h.tip || h.example || '';
  });

  global.FieldHelp = HELP;
})(window);
