/* eReturn Demo — প্রতিটি ঘরের কর-প্রভাব
   FieldHelp-এর উপর তিনটি তথ্য যোগ করে:
     counts  → এই অঙ্ক কর হিসাবে যায় কি না
     effect  → বেশি দিলে কর বাড়ে না কমে   ('up' = বেশি দিলে কর কমে,
                'down' = বেশি দিলে কর বাড়ে, 'none' = করে প্রভাব নেই)
     match   → কীসের সাথে হুবহু মিলতে হবে (কাগজ / গত বছরের রিটার্ন)
*/
(function (global) {
  'use strict';

  const T = {
    /* ---- করদাতার তথ্য ---- */
    taxpayerCategory: { counts: 'সরাসরি আয় নয়, কিন্তু করমুক্ত সীমা এখান থেকেই ঠিক হয়।', effect: 'up', effectNote: 'সঠিক শ্রেণি দিলে করমুক্ত সীমা বাড়ে, কর কমে।', match: 'TIN প্রোফাইলের জন্ম তারিখ ও লিঙ্গের সাথে মিলতে হবে।' },
    disabledChildren: { counts: 'আয় নয় — করমুক্ত সীমা বাড়ায়।', effect: 'up', effectNote: 'প্রতি সন্তানে সীমা ৫০,০০০ বাড়ে।', match: 'সুবর্ণ নাগরিক কার্ড থাকতে হবে; বাবা-মা যেকোনো একজন নেবেন।' },
    firstTimeFiler: { counts: 'আয় নয় — ন্যূনতম কর ঠিক করে।', effect: 'up', effectNote: 'নতুন হলে ন্যূনতম কর ৫,০০০-এর বদলে ১,০০০।', match: 'আগে রিটার্ন দিয়ে থাকলে "না" দিতেই হবে — NBR-এর রেকর্ডে থাকে।' },
    submitByFirstQuarter: { counts: 'আয় নয় — প্রদেয় করে ছাড় দেয়।', effect: 'up', effectNote: '৩০ সেপ্টেম্বরের মধ্যে জমা দিলে ১০% ছাড়।', match: 'সত্যিই ওই সময়ে জমা দিতে হবে।' },

    /* ---- Assessment ---- */
    residentStatus: { counts: 'আয় নয় — কর কাঠামো ঠিক করে।', effect: 'up', effectNote: 'Resident হলে করমুক্ত সীমা ও স্ল্যাব পাবেন; Non Resident বিদেশি হলে সরাসরি ৩০%।', match: 'পাসপোর্টের যাতায়াতের রেকর্ডের সাথে মিলতে হবে।' },
    hasExemptedIncome: { counts: 'করমুক্ত আয় — কর হিসাবে **যায় না**।', effect: 'up', effectNote: 'দেখালে কর বাড়ে না, বরং টাকার উৎস প্রমাণ হয়।', match: 'রেমিট্যান্স হলে ব্যাংকের এনক্যাশমেন্ট সনদ।' },
    hasTaxableIncome: { counts: '—', effect: 'none', effectNote: '"Yes" না দিলে আয় দেখানোর ঘরই আসবে না।' },
    heads: { counts: '—', effect: 'none', effectNote: 'যেটায় টিক দেবেন সেটার আয় কর হিসাবে যোগ হবে।', match: 'অফিস/ব্যাংক NBR-এ যে তথ্য পাঠায় তার সাথে মিলতে হবে।' },
    voluntaryDisclosure: { counts: 'কর হিসাবে **যায়** — উপরন্তু বাড়তি কর/জরিমানা।', effect: 'down', effectNote: 'না বুঝে টিক দিলে অযথা কর বাড়বে।' },

    /* ---- Additional Information ---- */
    location: { counts: 'আয় নয় — আগে ন্যূনতম কর ঠিক করত।', effect: 'none', effectNote: '২০২৬-২৭ থেকে সারা দেশে ন্যূনতম কর ৫,০০০। তবে ঘরটি আবশ্যক।', match: 'অফিস/ব্যবসার ঠিকানা।' },
    freedomFighter: { counts: 'আয় নয় — করমুক্ত সীমা বাড়ায়।', effect: 'up', effectNote: 'সীমা ৫,৫০,০০০ হয়ে যায়।', match: 'মুক্তিযোদ্ধা গেজেট।' },
    disabledThirdGender: { counts: 'আয় নয় — করমুক্ত সীমা বাড়ায়।', effect: 'up', effectNote: 'সীমা ৫,২৫,০০০ হয়ে যায়।', match: 'সুবর্ণ নাগরিক কার্ড।' },
    guardianOfDisabled: { counts: 'আয় নয় — করমুক্ত সীমা বাড়ায়।', effect: 'up', effectNote: 'প্রতি সন্তানে +৫০,০০০।', match: 'সন্তানের প্রতিবন্ধী পরিচয়পত্র; বাবা-মা একজনই নেবেন।' },
    claimTaxRebate: { counts: 'আয় নয় — রেয়াত পাবেন কিনা ঠিক করে।', effect: 'up', effectNote: '⚠️ "No" দিলে কোনো রেয়াত নেই, Rebate পাতাও আসবে না।' },

    /* ---- IT10B ---- */
    grossWealthOver50Lakh: { counts: 'আয় নয় — IT-10B লাগবে কিনা ঠিক করে।', effect: 'none', match: 'সম্পদের প্রকৃত হিসাবের সাথে মিলতে হবে।' },
    ownMotorCar: { counts: 'আয় নয়।', effect: 'down', effectNote: 'একাধিক গাড়ি থাকলে ১০% সারচার্জ বসে।', match: 'BRTA-র রেজিস্ট্রেশনের সাথে মিলতে হবে।' },
    offshoreProperty: { counts: 'বিদেশের আয় থাকলে কর হিসাবে যায়।', effect: 'down', match: 'গোপন করলে বড় ঝুঁকি — তথ্য বিনিময় চুক্তি আছে।' },
    shareholderDirector: { counts: 'আয় নয়।', effect: 'none', match: 'RJSC-র রেকর্ডের সাথে মিলতে হবে।' },
    housePropertyQ: { counts: 'আয় নয়।', effect: 'none' },

    /* ---- Employment ---- */
    employmentType: { counts: '—', effect: 'up', effectNote: 'সরকারি হলে বাড়ি ভাড়া/চিকিৎসা/যাতায়াত ভাতা পুরোপুরি করমুক্ত — কর অনেক কম আসে।', match: 'Salary Certificate ও অফিসের পাঠানো তথ্যের সাথে মিলতে হবে।' },
    employer: { counts: '—', effect: 'none', match: 'Salary Certificate-এর নামের সাথে হুবহু।' },
    designation: { counts: '—', effect: 'none', match: 'Salary Certificate।' },
    basicSalary: { counts: 'কর হিসাবে **যায়** — মোট বেতনের অংশ।', effect: 'down', effectNote: 'বেশি দিলে করযোগ্য আয় বাড়ে। কিন্তু কমিয়ে দেখানো যাবে না — অফিসের তথ্যের সাথে মিলতে হবে।', match: '⭐ Salary Certificate-এর সাথে হুবহু মিলতে হবে। অফিস প্রতি বছর NBR-এ কর্মীর বেতনের তথ্য পাঠায়।' },
    houseRentAllowance: { counts: 'বেসরকারি: কর হিসাবে **যায়** (এক-তৃতীয়াংশ ছাড়ের ভেতরে)। সরকারি: **যায় না** — সম্পূর্ণ করমুক্ত।', effect: 'down', effectNote: 'বেসরকারিতে ভাগ যেমনই হোক কর একই আসে, কারণ ছাড় হয় মোট বেতনের উপর।', match: 'Salary Certificate।' },
    medicalAllowance: { counts: 'বেসরকারি: **যায়**। সরকারি: **যায় না**।', effect: 'down', match: 'Salary Certificate।' },
    conveyanceAllowance: { counts: 'বেসরকারি: **যায়**। সরকারি: **যায় না**।', effect: 'down', match: 'Salary Certificate।' },
    festivalBonus: { counts: 'কর হিসাবে **যায়**।', effect: 'down', match: 'Salary Certificate ও ব্যাংক স্টেটমেন্ট।' },
    salaryExtra: { counts: 'কর হিসাবে **যায়**। তবে RPF-এ আপনার ও অফিসের চাঁদা পরে Rebate-এ বিনিয়োগ হিসেবেও গোনা হয়।', effect: 'down', effectNote: 'RPF চাঁদা দেখালে আয় বাড়ে ঠিকই, কিন্তু রেয়াতও বাড়ে — সাধারণত লাভই হয়।', match: 'Salary Certificate-এ যা যা আছে সব দিতে হবে।' },
    rentFreeAccommodation: { counts: 'কর হিসাবে **যায়** — নগদ না পেলেও বেতনের অংশ।', effect: 'down', effectNote: 'তবে "টাকার উৎস" হিসাব থেকে বাদ যায় (নগদ পাননি বলে)।', match: 'অফিসের হিসাব বিভাগের সাথে।' },
    concessionalAccommodation: { counts: 'পার্থক্যটুকু কর হিসাবে **যায়**।', effect: 'down' },
    vehicleFacility: { counts: 'কর হিসাবে **যায়** — নির্ধারিত হারে।', effect: 'down', match: 'অফিসের হিসাব বিভাগ থেকে সংখ্যা নিন।' },
    otherNonCash: { counts: 'কর হিসাবে **যায়**।', effect: 'down' },

    /* ---- Rent ---- */
    propertyType: { counts: '—', effect: 'none' },
    rentAddress: { counts: '—', effect: 'none', match: 'দলিল/হোল্ডিং ট্যাক্সের রসিদ।' },
    inCityCorporation: { counts: 'আয় নয়।', effect: 'none' },
    areaPersonalUse: { counts: 'নিজে থাকা অংশের ভাড়া কর হিসাবে **যায় না**।', effect: 'up', effectNote: 'সঠিকভাবে দেখালে করযোগ্য ভাড়া কমে।' },
    annualRent: { counts: 'কর হিসাবে **যায়**।', effect: 'down', effectNote: 'চুক্তির ভাড়া আর প্রকৃত ভাড়ার মধ্যে যেটি বেশি সেটিই ধরা হয়।', match: 'ভাড়ার চুক্তিপত্র।' },
    rentReceived: { counts: 'কর হিসাবে **যায়**।', effect: 'down', match: '⭐ ৫০,০০০+ মাসিক ভাড়া ব্যাংকে নিতে হয় — ব্যাংক স্টেটমেন্টের সাথে মিলতে হবে।' },
    chargePaidByTenant: { counts: 'কর হিসাবে **যায়** — আপনার আয় হিসেবে যোগ হয়।', effect: 'down' },
    rentInsurance: { counts: 'খরচ — আয় থেকে **বাদ যায়**।', effect: 'up', effectNote: 'বেশি দেখালে ভাড়া আয় কমে, কর কমে।', match: 'বীমার প্রিমিয়াম রসিদ।' },
    rentLoanInterest: { counts: 'খরচ — আয় থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ বড় ছাড়। পুরো সুদটাই বাদ যায়।', match: '⭐ ব্যাংকের Interest Certificate-এর সাথে হুবহু। কিস্তির পুরো টাকা নয়, শুধু সুদের অংশ।' },
    rentMunicipalTax: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', match: 'হোল্ডিং ট্যাক্সের রসিদ / খাজনার দাখিলা।' },
    rentRepair: { counts: 'খরচ — **বাদ যায়** (স্বয়ংক্রিয়)।', effect: 'up', effectNote: '⭐ আবাসিকে ২৫%, বাণিজ্যিকে ৩০% — কোনো ভাউচার লাগে না, এমনিতেই পাবেন।', match: 'কিছু লাগে না — নিজে থেকেই হিসাব হয়।' },
    rentPreRental: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', match: 'ব্যাংকের নির্মাণকালীন সুদের সনদ।' },
    unadjustableAdvance: { counts: 'কর হিসাবে **যায়** — পুরোটাই আয়।', effect: 'down' },
    refundableDeposit: { counts: 'বছরশেষ স্থিতির **১০%** কর হিসাবে যায়।', effect: 'down', match: 'ভাড়ার চুক্তিপত্র।' },
    ownershipPercent: { counts: 'আপনার অংশটুকুই কর হিসাবে যায়।', effect: 'up', effectNote: 'যৌথ মালিকানা সঠিকভাবে দেখালে আপনার ভাগের আয়ই ধরা হবে।', match: 'দলিলে যার যত অংশ।' },

    /* ---- Agriculture ---- */
    agricultureType: { counts: '—', effect: 'none' },
    agriArea: { counts: 'আয় নয়।', effect: 'none', match: 'খতিয়ান/দলিল।' },
    agriBooks: { counts: '—', effect: 'up', effectNote: '⭐ "No" দিলে বিক্রয়ের ৬০% খরচ এমনিতেই বাদ যায় — বেশির ভাগের জন্য সুবিধাজনক।' },
    salesProceed: { counts: 'কর হিসাবে **যায়**।', effect: 'down' },
    costOfProduction: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', effectNote: 'বই না রাখলে ৬০% নিজে থেকেই বসে।', match: 'বই রাখলে হিসাবের খাতা লাগবে।' },

    /* ---- Business ---- */
    businessCategory: { counts: '—', effect: 'none' },
    businessName: { counts: '—', effect: 'none', match: 'ট্রেড লাইসেন্স।' },
    turnover: { counts: 'কর হিসাবে **যায়** (খরচ বাদ দেওয়ার পরে)।', effect: 'down', match: '⭐ ভ্যাট রিটার্ন ও ব্যাংক স্টেটমেন্টের সাথে মিলতে হবে।' },
    costOfGoodsSold: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', match: 'ক্রয় চালান ও মজুদের হিসাব।' },
    businessExpense: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', effectNote: '⭐ অবচয় (Depreciation) অনেকেই দেখান না — বড় ছাড় হারান।', match: 'ভাউচার/বিল রাখতে হবে। ব্যক্তিগত খরচ দেওয়া যাবে না।' },
    balanceSheet: { counts: 'আয় নয়।', effect: 'none', match: '⭐ Total Assets = Total Capital and Liabilities হতেই হবে, নাহলে সাইট আটকাবে। গত বছরের Closing Capital = এ বছরের Opening Capital।' },

    /* ---- Capital Gain ---- */
    typeOfGains: { counts: '—', effect: 'none' },
    saleDeedValue: { counts: 'কর হিসাবে **যায়** (ক্রয়মূল্য বাদ দেওয়ার পরের লাভ)।', effect: 'down', match: 'সাব-রেজিস্ট্রি অফিসের দলিল।' },
    excessOverDeed: { counts: 'কর হিসাবে **যায়** — পুরোটাই লাভ।', effect: 'down' },
    costOfAcquisition: { counts: 'খরচ — লাভ থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ রেজিস্ট্রেশন ফি, স্ট্যাম্প, উকিলের ফি, উন্নয়ন খরচ সব যোগ করুন — লাভ কমবে, কর কমবে।', match: '⭐ আগের বছরের সম্পদ বিবরণীতে এই সম্পত্তি যত টাকায় দেখিয়েছিলেন, সেই অঙ্কের সাথে মিলতে হবে।' },
    cgTds: { counts: 'কর নয় — প্রদেয় কর থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ দাবি করলে কর সরাসরি কমে।', match: 'দলিলের সাথে থাকা কর জমার রসিদ।' },

    /* ---- Financial Assets ---- */
    faType: { counts: 'সঞ্চয়পত্র ও ট্রেজারি: **চূড়ান্ত করদায়** — স্ল্যাবে যায় না। ব্যাংক সুদ ও লভ্যাংশ: স্ল্যাব হারে কর হিসাবে **যায়**।', effect: 'none' },
    faValue: { counts: 'আয় নয় — মূল টাকা।', effect: 'none', match: '⭐ Assets পাতায় একই সম্পদের অঙ্কের সাথে মিলতে হবে।' },
    grossInterest: { counts: 'কর হিসাবে **যায়**।', effect: 'down', effectNote: 'সঞ্চয়পত্রের হলে স্ল্যাবে যায় না — কাটা ১০%-ই চূড়ান্ত।', match: '⭐ ব্যাংকের Interest Certificate-এর সাথে হুবহু। ব্যাংক এই তথ্য NBR-এ পাঠায়।' },
    faTds: { counts: 'কর নয় — প্রদেয় কর থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ দাবি করতেই হবে, নাহলে বাড়তি কর দেবেন।', match: 'ব্যাংকের কর কর্তনের সনদ।' },

    /* ---- Other Sources ---- */
    osType: { counts: 'কর হিসাবে **যায়**।', effect: 'none' },
    osGross: { counts: 'কর হিসাবে **যায়**।', effect: 'down', match: 'যিনি টাকা দিয়েছেন তাঁর দেওয়া সনদ।' },
    osExpense: { counts: 'খরচ — **বাদ যায়**।', effect: 'up', match: 'খরচের প্রমাণ রাখুন।' },

    /* ---- Tax Exempted ---- */
    exemptType: { counts: 'কর হিসাবে **যায় না** — সম্পূর্ণ করমুক্ত।', effect: 'up', effectNote: '⭐ কর বাড়ে না, কিন্তু "টাকা কোথা থেকে এলো" প্রমাণ হয়।' },
    exemptAmount: { counts: 'কর হিসাবে **যায় না**।', effect: 'up', match: 'রেমিট্যান্স: ব্যাংকের এনক্যাশমেন্ট সনদ। পেনশন: পেনশন বই।' },

    /* ---- Rebate ---- */
    rebateIntro: { counts: 'বিনিয়োগ — কর থেকে **রেয়াত** দেয়।', effect: 'up' },
    lifeInsurance: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', effectNote: 'পলিসি মূল্যের ১০% পর্যন্ত।', match: 'বীমা কোম্পানির প্রিমিয়াম রসিদ।' },
    policyValue: { counts: 'আয় নয়।', effect: 'none', match: 'পলিসির কাগজ।' },
    premiumPaid: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', match: 'প্রিমিয়াম জমার রসিদ।' },
    dps: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', effectNote: '⭐ বছরে সর্বোচ্চ ১,২০,০০০ পর্যন্ত। এর বেশি জমা দিলেও বাড়তি রেয়াত নেই।', match: 'ব্যাংকের DPS স্টেটমেন্ট। Assets পাতায় DPS-এর মোট স্থিতিও দিতে হবে।' },
    sanchayapatraInv: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', effectNote: 'শুধু এ বছর কেনাটা।', match: '⭐ সঞ্চয়পত্রের কাগজের ইস্যু তারিখ এই আয়বর্ষের ভেতরে হতে হবে। Assets পাতায় মোট সঞ্চয়পত্রেও যোগ থাকবে।' },
    mutualFund: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', match: 'ফান্ডের স্টেটমেন্ট।' },
    listedStocks: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', effectNote: 'বছরের নিট বিনিয়োগ (কেনা − বেচা)।', match: 'BO অ্যাকাউন্টের বার্ষিক স্টেটমেন্ট।' },
    gpf: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', match: 'GPF স্লিপ। Assets-এ মোট জমাও দিতে হবে।' },
    rpf: { counts: 'বিনিয়োগ — **রেয়াত** দেয় (আপনার + অফিসের চাঁদা দুটোই)।', effect: 'up', match: 'অফিসের PF স্টেটমেন্ট।' },
    superannuation: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up' },
    benevolent: { counts: 'বিনিয়োগ — **রেয়াত** দেয়।', effect: 'up', match: 'Pay Slip-এ কাটা অঙ্কের সাথে।' },
    zakatFund: { counts: 'বিনিয়োগ/দান — **রেয়াত** দেয়।', effect: 'up', effectNote: '⚠️ শুধু সরকারি অনুমোদিত জাকাত ফান্ডে দিলে।', match: 'জাকাত ফান্ডের রসিদ।' },
    universalPension: { counts: 'বিনিয়োগ — **রেয়াত** দেয়; পরে পেনশনও করমুক্ত।', effect: 'up', match: 'পেনশন আইডি ও জমার রসিদ।' },

    /* ---- Expenditure ---- */
    expenditureIntro: { counts: 'খরচ — কর হিসাবে **যায় না**, কর বাড়ায়ও না কমায়ও না।', effect: 'none', effectNote: '⚠️ কিন্তু খুব কম দেখালে অডিটের ঝুঁকি, আর বেশি দেখালে "টাকা কোথা থেকে" প্রশ্ন। বাস্তব অঙ্কই সবচেয়ে নিরাপদ।' },
    expFood: { counts: 'কর হিসাবে **যায় না**।', effect: 'none', effectNote: 'বাস্তবসম্মত অঙ্ক দিন — ০ দেবেন না।' },
    expAccommodation: { counts: 'কর হিসাবে **যায় না**।', effect: 'none', match: 'ভাড়ায় থাকলে ভাড়ার চুক্তির সাথে মিল রাখুন।' },
    expAuto: { counts: 'কর হিসাবে **যায় না**।', effect: 'none', match: 'গাড়ি থাকলে সম্পদ বিবরণীতেও গাড়ি থাকতে হবে।' },
    expUtility: { counts: 'কর হিসাবে **যায় না**।', effect: 'none' },
    expEducation: { counts: 'কর হিসাবে **যায় না**।', effect: 'none' },
    expFestival: { counts: 'কর হিসাবে **যায় না**।', effect: 'none', match: 'বিদেশ ভ্রমণ করলে অবশ্যই দেখান — পাসপোর্টে রেকর্ড থাকে।' },
    expTaxPaid: { counts: 'কর হিসাবে যায় না, তবে **Tax & Payment পাতার সাথে মিলতে হবে**।', effect: 'none', match: '⭐ Tax & Payment পাতার Source Tax + Advance Tax-এর সমান হওয়া উচিত।' },
    expLoanInterest: { counts: 'কর হিসাবে **যায় না** (ব্যক্তিগত ঋণ)।', effect: 'none', match: 'ঋণ থাকলে দায়ের ঘরেও দেখাতে হবে।' },
    expEnvSurcharge: { counts: 'কর হিসাবে যায় না — আলাদা সারচার্জ।', effect: 'down' },

    /* ---- Assets ---- */
    assetsIntro: { counts: 'সম্পদ আয় নয় — কিন্তু সম্পদ বৃদ্ধি আয় দিয়ে ব্যাখ্যা করতে হয়।', effect: 'none' },
    businessCapitalAsset: { counts: 'আয় নয়।', effect: 'none', match: '⭐ Business পাতার Closing Capital-এর সাথে মিলতে হবে।' },
    nonAgriProperty: { counts: 'আয় নয়।', effect: 'down', effectNote: 'বেশি হলে নিট সম্পদ বাড়ে — ৪ কোটি ছাড়ালে সারচার্জ।', match: '⭐ গত বছরের রিটার্নে যা দেখিয়েছিলেন তার সাথে মিলতে হবে; এ বছর নতুন কিনলে শুধু সেটাই যোগ হবে।' },
    agriProperty: { counts: 'আয় নয়।', effect: 'down', match: '⭐ গত বছরের রিটার্নের সাথে মিলতে হবে।' },
    shareDebentureBond: { counts: 'আয় নয় (লভ্যাংশ/লাভ আলাদাভাবে আয়)।', effect: 'down', effectNote: 'ক্রয়মূল্যে লিখতে হবে, বাজারদরে নয়।', match: '⭐ গত বছরের অঙ্ক + এ বছরের কেনা − বিক্রি।' },
    sanchayapatraAsset: { counts: 'আয় নয় (মুনাফা আলাদাভাবে আয়)।', effect: 'down', match: '⭐ গত বছরের অঙ্ক + এ বছর কেনা − ভাঙানো। Rebate পাতার এ বছরের কেনার সাথেও সামঞ্জস্য থাকতে হবে।' },
    fixedDepositAsset: { counts: 'আয় নয় (সুদ আলাদাভাবে আয়)।', effect: 'down', match: 'ব্যাংকের ৩০ জুনের স্থিতিপত্র।' },
    dpsAsset: { counts: 'আয় নয়।', effect: 'down', match: '⭐ গত বছরের DPS স্থিতি + এ বছরের জমা + সুদ।' },
    loansGiven: { counts: 'আয় নয় (সুদ পেলে সেটা আয়)।', effect: 'down' },
    providentFundAsset: { counts: 'আয় নয়।', effect: 'down', match: '⭐ গত বছরের স্থিতি + এ বছরের চাঁদা + সুদ। PF স্টেটমেন্টের সাথে মিলতে হবে।' },
    motorCarAsset: { counts: 'আয় নয়।', effect: 'down', effectNote: '⚠️ একাধিক গাড়ি থাকলে ১০% সারচার্জ।', match: '⭐ গত বছরের রিটার্ন ও BRTA রেজিস্ট্রেশন।' },
    goldJewellery: { counts: 'আয় নয়।', effect: 'down', effectNote: 'উত্তরাধিকার/উপহারে পাওয়া হলেও দেখান — নাহলে পরে উৎসের প্রশ্ন।', match: '⭐ গত বছরের রিটার্নের সাথে মিলতে হবে। হঠাৎ বেড়ে গেলে উৎস দেখাতে হবে।' },
    furnitureElectronics: { counts: 'আয় নয়।', effect: 'down', match: '⭐ গত বছরের অঙ্ক + এ বছরের কেনা। হঠাৎ কমানো যাবে না।' },
    cashInHand: { counts: 'আয় নয়।', effect: 'down', effectNote: '⚠️ অস্বাভাবিক বেশি নগদ দেখালে প্রশ্ন ওঠে।', match: '⭐ গত বছরের অঙ্কের সাথে সামঞ্জস্যপূর্ণ হতে হবে।' },
    bankCardsElectronic: { counts: 'আয় নয়।', effect: 'down', match: '⭐ প্রতিটি ব্যাংকের ৩০ জুনের ব্যালান্স সার্টিফিকেট।' },
    assetOutsideBangladesh: { counts: 'সম্পদ আয় নয়, কিন্তু তার আয় কর হিসাবে যায়।', effect: 'down' },
    bankFiLoan: { counts: 'দায় — নিট সম্পদ থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ ঋণ দেখালে নিট সম্পদ কমে, সারচার্জও কমতে পারে।', match: '⭐ ব্যাংকের ঋণ স্থিতিপত্র। গত বছরের স্থিতি − এ বছরের পরিশোধ।' },
    unsecuredLoan: { counts: 'দায় — **বাদ যায়**।', effect: 'up', effectNote: '⚠️ ৫ লাখের বেশি হলে ব্যাংকিং চ্যানেলে নিতে হবে।', match: 'ঋণদাতার নাম-TIN লাগতে পারে।' },
    previousNetWealth: { counts: 'আয় নয় — তহবিলের হিসাব মেলাতে লাগে।', effect: 'none', effectNote: '⚠️ ভুল দিলে "shortage of fund" দেখাবে, সাইট আটকাবে।', match: '⭐⭐ গত বছরের জমা দেওয়া রিটার্নের "Net Wealth" লাইনের সাথে **হুবহু** মিলতে হবে। এটাই সবচেয়ে গুরুত্বপূর্ণ মিল।' },
    giftDonation: { counts: 'কর হিসাবে যায় না — তহবিল থেকে বেরিয়ে যাওয়া টাকা।', effect: 'none' },
    otherReceipts: { counts: 'আয় নয় — কিন্তু তহবিলের উৎস হিসেবে গোনা হয়।', effect: 'up', effectNote: '⭐ ঘাটতি মেলানোর বৈধ জায়গা।', match: 'দানপত্র/ওয়ারিশ সনদ/বিক্রির দলিল রাখতে হবে।' },
    houseSqftInCityCorp: { counts: 'আয় নয়।', effect: 'down', effectNote: '⚠️ ৮,০০০ বর্গফুট ছাড়ালে ১০% সারচার্জ।' },

    /* ---- Tax & Payment ---- */
    sourceTax: { counts: 'কর নয় — প্রদেয় কর থেকে **বাদ যায়**।', effect: 'up', effectNote: '⭐ যত বেশি (সনদসহ) দাবি করবেন, তত কম টাকা দিতে হবে।', match: '⭐ প্রতিটির TDS সনদ থাকতে হবে। Expenditure পাতার "Payment of Tax at Source"-এর সাথেও মিল রাখুন।' },
    advanceIncomeTax: { counts: 'কর নয় — **বাদ যায়**।', effect: 'up', match: 'চালানের কপি।' },
    taxPaidWithReturn: { counts: 'কর নয় — **বাদ যায়**।', effect: 'up', effectNote: 'Net Payable যত, তত টাকা দিতে হবে।', match: 'a-Chalan / ব্যাংক চালানের নম্বর ও তারিখ।' },
    refundAdjustment: { counts: 'কর নয় — **বাদ যায়**।', effect: 'up', match: '⭐ গত বছরের রিটার্নে ফেরতযোগ্য দেখানো অঙ্কের সাথে মিলতে হবে।' },
    carryForward: { counts: 'কর নয় — **বাদ যায়**।', effect: 'up', match: '⭐ গত করবর্ষের রিটার্নের সাথে মিলতে হবে।' }
  };

  const EFFECT_TEXT = {
    up: { icon: '⬇️', label: 'বেশি দিলে কর কমে', cls: 'good' },
    down: { icon: '⬆️', label: 'বেশি দিলে কর বাড়ে', cls: 'warn' },
    none: { icon: '➖', label: 'করে সরাসরি প্রভাব নেই', cls: 'info' }
  };

  function decorate() {
    if (!global.FieldHelp) return;
    Object.keys(T).forEach(k => {
      if (!global.FieldHelp[k]) return;
      Object.assign(global.FieldHelp[k], T[k]);
    });
  }
  decorate();

  global.TaxEffect = { data: T, EFFECT_TEXT, decorate };
})(window);
