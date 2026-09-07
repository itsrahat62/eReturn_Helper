/* eReturn Demo — কর পরামর্শ (Tax Advisor)
   বৈধভাবে কর কমানোর / শূন্য করার পরামর্শ, প্রতিটির সাথে সংখ্যা।
*/
(function (global) {
  'use strict';

  const fmt = v => TaxCalc.fmt(v);
  const n = v => TaxCalc.n(v);

  /* কত বিনিয়োগ করলে সর্বোচ্চ রেয়াত — এবং কত বিনিয়োগে কর শূন্য */
  function investmentTargets(res, rules) {
    const ti = res.totalIncome;
    const capIncome = ti * rules.rebate.onIncome;                 // ৩% of income
    const maxRebate = Math.min(capIncome, rules.rebate.ceiling);  // যত রেয়াত সর্বোচ্চ পাওয়া যাবে
    const investForMax = rules.rebate.onInvestment > 0 ? maxRebate / rules.rebate.onInvestment : 0;

    const grossTax = res.grossTaxBeforeRebate;
    const rebateNeededForZero = Math.max(0, grossTax);
    const achievableRebate = Math.min(rebateNeededForZero, maxRebate);
    const investForZero = rules.rebate.onInvestment > 0 ? achievableRebate / rules.rebate.onInvestment : 0;
    const canZeroByRebate = maxRebate >= grossTax && grossTax > 0;

    return {
      maxRebate: Math.round(maxRebate),
      investForMax: Math.round(investForMax),
      investForZero: Math.round(investForZero),
      canZeroByRebate,
      alreadyInvested: res.investment.allowable,
      moreNeededForMax: Math.max(0, Math.round(investForMax - res.investment.allowable)),
      moreNeededForZero: Math.max(0, Math.round(investForZero - res.investment.allowable)),
      optimalPercentOfIncome: rules.rebate.onInvestment > 0
        ? (rules.rebate.onIncome / rules.rebate.onInvestment) * 100
        : 0
    };
  }

  function build(data, res, rules) {
    const T = data.taxpayer || {};
    const tips = [];
    const add = (level, title, body, gain) => tips.push({ level, title, body, gain: gain || 0 });

    const inv = investmentTargets(res, rules);

    /* ---------- ১. কর শূন্য করার পথ ---------- */
    if (res.totalIncome <= res.threshold) {
      add('good', 'আপনার কর এখনই শূন্য',
        'মোট আয় ' + fmt(res.totalIncome) + ' টাকা, যা করমুক্ত সীমা ' + fmt(res.threshold) +
        ' টাকার মধ্যে। স্ল্যাব কর ০, ন্যূনতম করও প্রযোজ্য নয়। তবু রিটার্ন জমা দিতে হবে (PSR-এর জন্য)।');
    } else {
      const over = res.totalIncome - res.threshold;
      add('info', 'কর শূন্য কখন হয় — আসল নিয়মটা জেনে নিন',
        'করমুক্ত সীমা ' + fmt(res.threshold) + ' টাকা। আপনার করযোগ্য আয় এর চেয়ে ' + fmt(over) +
        ' টাকা বেশি। ⚠️ গুরুত্বপূর্ণ: আয় করমুক্ত সীমা ছাড়িয়ে গেলে বিনিয়োগ রেয়াত দিয়ে স্ল্যাব কর ০ করা গেলেও ' +
        '**ন্যূনতম কর ' + fmt(T.firstTimeFiler ? rules.minimumTax.firstTime : rules.minimumTax.standard) +
        ' টাকা** দিতেই হবে। অর্থাৎ প্রকৃত অর্থে "০ টাকা কর" তখনই হয় যখন মোট আয় ' + fmt(res.threshold) +
        ' টাকার নিচে থাকে।');
    }

    /* ---------- ২. বিনিয়োগ রেয়াত ---------- */
    if (res.totalIncome > res.threshold) {
      if (inv.moreNeededForMax > 0) {
        const extraRebate = Math.min(inv.maxRebate, res.grossTaxBeforeRebate) - res.rebateOnInvestment;
        add('action', 'সবচেয়ে বড় সাশ্রয়: বিনিয়োগ রেয়াত পূর্ণ করুন',
          'রেয়াতের সূত্র = সর্বনিম্ন{ অনুমোদিত বিনিয়োগের ' + (rules.rebate.onInvestment * 100) + '%, ' +
          'মোট আয়ের ' + (rules.rebate.onIncome * 100) + '%, ' + fmt(rules.rebate.ceiling) + ' }। ' +
          'তাই আপনার জন্য সর্বোচ্চ রেয়াত ' + fmt(inv.maxRebate) + ' টাকা, আর সেটা পেতে বিনিয়োগ লাগবে ' +
          fmt(inv.investForMax) + ' টাকা (মোট আয়ের প্রায় ' + inv.optimalPercentOfIncome.toFixed(0) + '%)। ' +
          'আপনি এখন দেখিয়েছেন ' + fmt(inv.alreadyInvested) + ' টাকা — আরও ' + fmt(inv.moreNeededForMax) +
          ' টাকা বিনিয়োগ দেখাতে পারলে কর কমবে।',
          Math.max(0, extraRebate));
      } else {
        add('good', 'বিনিয়োগ রেয়াত সর্বোচ্চ পর্যায়ে',
          'আপনি ইতিমধ্যে ' + fmt(inv.alreadyInvested) + ' টাকা অনুমোদিত বিনিয়োগ দেখিয়েছেন। ' +
          'এর বেশি বিনিয়োগে আর রেয়াত বাড়বে না — কারণ মোট আয়ের ' + (rules.rebate.onIncome * 100) +
          '% (' + fmt(inv.maxRebate) + ' টাকা) সিলিং। বাড়তি টাকা অন্য খাতে রাখাই ভালো।');
      }

      if (inv.canZeroByRebate) {
        add('action', 'স্ল্যাব কর শূন্যে নামানো সম্ভব',
          fmt(inv.investForZero) + ' টাকা অনুমোদিত বিনিয়োগ দেখালে রেয়াত ' + fmt(res.grossTaxBeforeRebate) +
          ' টাকা হয়ে স্ল্যাব কর ০ হয়ে যাবে। তবু ন্যূনতম কর ' +
          fmt(T.firstTimeFiler ? rules.minimumTax.firstTime : rules.minimumTax.standard) + ' টাকা দিতে হবে।');
      } else if (res.grossTaxBeforeRebate > 0) {
        const bestTax = Math.max(res.grossTaxBeforeRebate - inv.maxRebate,
          T.firstTimeFiler ? rules.minimumTax.firstTime : rules.minimumTax.standard);
        add('info', 'সর্বোচ্চ রেয়াতের পরেও কর থাকবে',
          'রেয়াত সর্বোচ্চ ' + fmt(inv.maxRebate) + ' টাকা, কিন্তু আপনার মোট কর ' +
          fmt(res.grossTaxBeforeRebate) + ' টাকা। সব ঠিকঠাক করলেও কর দাঁড়াবে প্রায় ' + fmt(bestTax) + ' টাকা।');
      }

      add('info', 'কোন বিনিয়োগে রেয়াত পাওয়া যায়',
        'DPS (বছরে সর্বোচ্চ ১,২০,০০০), সঞ্চয়পত্র, জীবন বীমা প্রিমিয়াম (পলিসি মূল্যের ১০% পর্যন্ত), ' +
        'তালিকাভুক্ত শেয়ার/মিউচুয়াল ফান্ড/ETF, GPF/RPF/অনুমোদিত সুপারঅ্যানুয়েশন ফান্ড, ' +
        'সর্বজনীন পেনশন স্কিম, অনুমোদিত জাকাত ফান্ড। ' +
        '🕐 সময় খুব জরুরি — বিনিয়োগ ৩০ জুন ২০২৬-এর মধ্যে হতে হবে, রিটার্ন জমার সময় করলে হবে না।');
    }

    /* ---------- ৩. বেতন কাঠামো ---------- */
    if ((data.assessment.heads || {}).employment && res.emp.gross > 0) {
      const cap = rules.salaryExemption.ceiling;
      const oneThird = res.emp.gross * rules.salaryExemption.fraction;
      const isGovt = (data.employment || []).some(e => TaxCalc.GOVT_TYPES.indexOf(e.employmentType) >= 0);
      if (!isGovt) {
        if (oneThird > cap) {
          add('info', 'বেতন ছাড়ের সিলিং ছুঁয়ে ফেলেছেন',
            'বেসরকারি চাকরিতে ছাড় = মোট বেতনের ১/৩ অথবা ' + fmt(cap) + ' — যেটি কম। আপনার ১/৩ হয় ' +
            fmt(Math.round(oneThird)) + ', তাই ছাড় ' + fmt(cap) + ' টাকাতেই আটকে গেছে। ' +
            'বেতন আরও বাড়লে পুরোটাই করযোগ্য হবে — তখন রেয়াতযোগ্য বিনিয়োগই প্রধান হাতিয়ার।');
        } else {
          add('good', 'বেতন ছাড় পুরোপুরি পাচ্ছেন',
            'ছাড় = মোট বেতনের ১/৩ = ' + fmt(res.emp.exempt) + ' টাকা (সিলিং ' + fmt(cap) + ' টাকার নিচে)।');
        }
        add('info', 'বেতনের অ-নগদ সুবিধা সাবধানে দেখান',
          'গাড়ি সুবিধা, বিনা ভাড়ায় বাসা ইত্যাদি অ-নগদ সুবিধাও বেতনের অংশ হিসেবে যোগ হয় এবং ১/৩ ছাড়ের ' +
          'ভিত্তি বাড়ায়। কিন্তু এগুলো নগদ পাননি — তাই Assets & Liabilities-এর "Source of Fund"-এ ' +
          'এগুলো বাদ যায়। ডেমো সেটা নিজেই সমন্বয় করে দিচ্ছে।');
      } else {
        add('good', 'সরকারি বেতন কাঠামো',
          'সরকারি বেতন কাঠামোয় বাড়ি ভাড়া, চিকিৎসা ও যাতায়াত ভাতা সম্পূর্ণ করমুক্ত। ' +
          'মূল বেতন ও বোনাসই করযোগ্য। ছাড় হিসেবে বাদ গেছে ' + fmt(res.emp.exempt) + ' টাকা।');
      }
    }

    /* ---------- ৪. করদাতার শ্রেণি ---------- */
    if (T.category === 'general') {
      add('info', 'শ্রেণি ঠিক আছে তো?',
        'নারী করদাতা বা ৬৫+ বছর বয়সী হলে করমুক্ত সীমা ' + fmt(rules.threshold.female_senior) +
        ', প্রতিবন্ধী/তৃতীয় লিঙ্গ হলে ' + fmt(rules.threshold.disabled_third) +
        ', গেজেটেড মুক্তিযোদ্ধা হলে ' + fmt(rules.threshold.freedom_fighter) + ' টাকা। ' +
        'যোগ্য হলে "করদাতার তথ্য"-এ শ্রেণি বদলে দেখুন কত কমে।');
    }
    if (n(T.disabledChildren) === 0) {
      add('info', 'প্রতিবন্ধী সন্তান থাকলে অতিরিক্ত ছাড়',
        'প্রতিবন্ধী সন্তান/পোষ্য প্রতি জনের জন্য করমুক্ত সীমা ' + fmt(rules.disabledChildRelief) +
        ' টাকা বাড়ে (বাবা-মা দুজনেই করদাতা হলে একজনই নিতে পারবেন)।');
    }
    if (!T.firstTimeFiler) {
      add('info', 'প্রথমবার রিটার্ন দিচ্ছেন?',
        'নতুন করদাতার ন্যূনতম কর ' + fmt(rules.minimumTax.firstTime) + ' টাকা, সাধারণের ' +
        fmt(rules.minimumTax.standard) + ' টাকা।');
    }

    /* ---------- ৫. সময়মতো জমা দিলে প্রণোদনা ---------- */
    if (!T.submitByFirstQuarter && res.totalAmountPayable > 0) {
      add('action', 'প্রথম কোয়ার্টারে জমা দিলে ' + (rules.firstQuarterIncentive * 100) + '% ছাড়',
        'আয়বর্ষ শেষের প্রথম তিন মাসের মধ্যে (৩০ সেপ্টেম্বরের মধ্যে) রিটার্ন জমা দিলে প্রদেয় করের ' +
        (rules.firstQuarterIncentive * 100) + '% প্রণোদনা পাওয়া যায় — আপনার ক্ষেত্রে ' +
        fmt(Math.round(res.totalAmountPayable * rules.firstQuarterIncentive)) + ' টাকা।',
        Math.round(res.totalAmountPayable * rules.firstQuarterIncentive));
    }

    /* ---------- ৬. উৎসে কর্তিত কর ---------- */
    if (res.sourceTaxAuto > 0 && n((data.payments || {}).sourceTax) === 0) {
      add('action', 'উৎসে কাটা কর দাবি করতে ভুলবেন না',
        'আপনার এন্ট্রি থেকে উৎসে কাটা কর পাওয়া গেছে ' + fmt(res.sourceTaxAuto) + ' টাকা। ' +
        'Tax & Payment পাতায় Source Tax ঘরে এটি বসালে প্রদেয় কর ততটাই কমবে। ব্যাংক/অফিস থেকে ' +
        'উৎসে কর কর্তনের সনদ (TDS certificate) সংগ্রহ করুন — সনদ ছাড়া দাবি করবেন না।',
        res.sourceTaxAuto);
    }
    add('info', 'সব TDS একসাথে করুন',
      'বেতনের TDS, ব্যাংক সুদের TDS, সঞ্চয়পত্রের ১০% উৎস কর, গাড়ির অগ্রিম কর, জমি রেজিস্ট্রেশনের কর — ' +
      'সবগুলোই প্রদেয় কর থেকে বাদ যায়। অনেকে এগুলো না দেখিয়ে বাড়তি কর দেন।');

    /* ---------- ৭. চূড়ান্ত করদায় ---------- */
    if (res.fin.finalTaxIncome > 0) {
      add('good', 'সঞ্চয়পত্র/ট্রেজারির সুদ — চূড়ান্ত করদায়',
        fmt(res.fin.finalTaxIncome) + ' টাকা সুদ চূড়ান্ত করদায়ের আওতায়। এর উপর কাটা ১০% উৎস করই চূড়ান্ত — ' +
        'স্ল্যাব হারে আবার কর বসে না। তাই এই আয় স্ল্যাব হিসাব থেকে আলাদা রাখা হয়েছে।');
    }

    /* ---------- ৮. করমুক্ত আয় ---------- */
    if (res.exemptedIncome === 0) {
      add('info', 'করমুক্ত আয় থাকলে অবশ্যই দেখান',
        'বৈধ পথে আসা বৈদেশিক রেমিট্যান্স, সরকারি পেনশন, সর্বজনীন পেনশন, IT/সফটওয়্যার ব্যবসার নির্দিষ্ট আয় ' +
        'ইত্যাদি সম্পূর্ণ করমুক্ত। এগুলো Tax Exempted Income-এ দেখালে কর বাড়ে না, কিন্তু ' +
        '"টাকার উৎস" প্রমাণ হয় — সম্পদ বাড়ানোর ব্যাখ্যা দিতে এটি খুব কাজে লাগে।');
    }

    /* ---------- ৯. তহবিলের হিসাব মেলা ---------- */
    if (res.fundDifference < 0) {
      add('warn', 'তহবিলে ঘাটতি — লাইভ সাইট এখানে আটকে দেবে',
        'আপনার আয় + করমুক্ত আয় + অন্যান্য প্রাপ্তি = ' + fmt(res.sourceOfFund) + ' টাকা, ' +
        'কিন্তু সম্পদ বৃদ্ধি + খরচ = ' + fmt(res.totalFundOutflow) + ' টাকা। ঘাটতি ' +
        fmt(Math.abs(res.fundDifference)) + ' টাকা। ' +
        'এটি ঠিক করার বৈধ উপায়: (ক) আগের বছরের নিট সম্পদ সঠিকভাবে বসান, (খ) করমুক্ত আয় দেখান, ' +
        '(গ) উপহার/উত্তরাধিকার/ঋণ পেলে "Other Receipts" বা দায়-এ দেখান, (ঘ) জীবনযাত্রার ব্যয় বাস্তবসম্মত করুন।');
    } else if (res.fundDifference > 0 && res.totalFundOutflow > 0) {
      add('good', 'তহবিলের হিসাব মিলেছে',
        'উদ্বৃত্ত ' + fmt(res.fundDifference) + ' টাকা — অর্থাৎ আয় দিয়ে খরচ ও সম্পদ বৃদ্ধি ব্যাখ্যা করা যাচ্ছে।');
    }

    /* ---------- ১০. জীবনযাত্রার ব্যয় ---------- */
    if (res.lifestyleExpense === 0 && res.totalIncome > res.threshold) {
      add('warn', 'জীবনযাত্রার ব্যয় ০ দেখাবেন না',
        'IT-10BB-তে খরচ ০ দেখালে তা অবাস্তব — অডিটে পড়ার ঝুঁকি বাড়ে। খাওয়া-পরা, বাসা ভাড়া, বিদ্যুৎ, ' +
        'গ্যাস, ফোন/ইন্টারনেট, যাতায়াত, শিক্ষা, উৎসব — বাস্তব খরচগুলো লিখুন।');
    } else if (res.lifestyleExpense > 0 && res.lifestyleExpense > res.totalIncome * 1.2) {
      add('warn', 'খরচ আয়ের তুলনায় অনেক বেশি',
        'খরচ ' + fmt(res.lifestyleExpense) + ' টাকা, মোট আয় ' + fmt(res.totalIncome) + ' টাকা। ' +
        'অতিরিক্ত টাকার উৎস (সঞ্চয় ভাঙা, ঋণ, উপহার) দেখাতে হবে।');
    }

    /* ---------- ১১. সারচার্জ ---------- */
    if (res.surchargeRate > 0) {
      add('warn', 'নিট সম্পদের উপর সারচার্জ বসেছে (' + (res.surchargeRate * 100) + '%)',
        'নিট সম্পদ ' + fmt(res.netWealth) + ' টাকা' +
        (res.surchargeFlags.multipleCars ? ' এবং একাধিক গাড়ি' : '') +
        (res.surchargeFlags.bigHouse ? ' এবং সিটি কর্পোরেশনে ৮,০০০ বর্গফুটের বেশি গৃহসম্পত্তি' : '') +
        '। সারচার্জ ' + fmt(res.surcharge) + ' টাকা। সম্পদ ও দায় দুটোই সঠিকভাবে দেখান — ' +
        'যে দায় (গৃহঋণ ইত্যাদি) দেখাতে ভুলে গেছেন, তা যোগ করলে নিট সম্পদ কমে সারচার্জও কমতে পারে।');
    } else if (res.netWealth > rules.surcharge[0].upto * 0.85) {
      add('info', 'সারচার্জ সীমার কাছাকাছি',
        'নিট সম্পদ ' + fmt(res.netWealth) + ' টাকা; ' + fmt(rules.surcharge[0].upto) +
        ' টাকা পেরোলে ১০% সারচার্জ বসবে। সব দায় (ঋণ) দেখাতে ভুলবেন না।');
    }

    /* ---------- ১২. খাতভিত্তিক ---------- */
    if ((data.assessment.heads || {}).rent && res.rent.rows.length) {
      add('info', 'বাড়ি ভাড়ার খরচ ছাড় স্বয়ংক্রিয়',
        'আবাসিকে মোট ভাড়ার ২৫% ও বাণিজ্যিকে ৩০% মেরামত/আদায় খরচ হিসেবে এমনিতেই বাদ যায় — এর জন্য ' +
        'কোনো ভাউচার লাগে না। এর সাথে পৌরকর, বীমা প্রিমিয়াম ও গৃহঋণের সুদ আলাদাভাবে বাদ দেওয়া যায়। ' +
        'গৃহঋণের সুদ দেখাতে ভুলবেন না — এটি বড় অঙ্কের ছাড়।');
    }
    if ((data.assessment.heads || {}).agriculture) {
      const anyDeemed = res.agri.rows.some(r => r.deemed);
      if (anyDeemed) {
        add('good', 'কৃষি আয়ে ৬০% উৎপাদন খরচ ধরা হয়েছে',
          'হিসাবের বই না রাখলে বিক্রয়মূল্যের ৬০% উৎপাদন খরচ হিসেবে এমনিতেই বাদ যায়।');
      }
    }
    if ((data.assessment.heads || {}).business && res.biz.taxable > 0) {
      add('info', 'ব্যবসার খরচ সম্পূর্ণ দেখান',
        'বেতন, ভাড়া, বিদ্যুৎ, পরিবহন, অবচয় (Depreciation), ব্যাংক সুদ/চার্জ, বিজ্ঞাপন — বৈধ ব্যবসায়িক ' +
        'খরচ বাদ দিলে নিট মুনাফা কমে কর কমে। অবচয় অনেকেই দেখান না — এটি বড় ছাড়।');
    }

    /* ---------- ১৩. যা করবেন না ---------- */
    add('warn', 'যা কখনও করবেন না',
      'ভুয়া বিনিয়োগ/খরচের কাগজ, না-করা DPS বা বীমা দেখানো, আয় গোপন করা — এসব ধরা পড়লে জরিমানা ও ' +
      'শাস্তি দুটোই হয়। উপরের প্রতিটি পরামর্শ আইনসম্মত, কিন্তু প্রতিটির পেছনে প্রকৃত কাগজ থাকতে হবে।');

    const order = { action: 0, warn: 1, good: 2, info: 3 };
    tips.sort((a, b) => (order[a.level] - order[b.level]) || (b.gain - a.gain));
    return { tips, inv };
  }

  /* what-if: নির্দিষ্ট বিনিয়োগে কর কত হবে */
  function simulate(data, rules, allowableInvestmentOverride) {
    const clone = JSON.parse(JSON.stringify(data));
    clone.rebate = {
      lifeInsurance: [], dps: [], sanchayapatra: [], mutualFund: [], listedStocks: [],
      gpf: [], rpf: [], superannuation: [], benevolent: { benevolentFund: 0, groupInsurance: 0 },
      zakatFund: [], universalPension: [],
      others: { schedule6Part3: allowableInvestmentOverride, sro: 0 }
    };
    return TaxCalc.compute(clone, rules);
  }

  global.TaxAdvisor = { build, investmentTargets, simulate };
})(window);
