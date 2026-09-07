/* eReturn Demo — অস্বাভাবিক অঙ্ক ধরার ইঞ্জিন
   ঘরে টাইপ করার সাথে সাথেই সতর্ক করে: "এটা কি ঠিক দিলেন?"
   ফেরত দেয়: [{path, level, msg}]  level = error | warn | info
*/
(function (global) {
  'use strict';

  const n = v => TaxCalc.n(v);
  const f = v => TaxCalc.fmt(v);

  function check(data, res, rules) {
    const out = [];
    const add = (path, level, msg) => out.push({ path, level, msg });
    const A = data.assessment || {};
    const heads = A.heads || {};
    const income = res.totalIncome;

    /* ---------- Additional Information ---------- */
    if (!data.additional.location) {
      add('additional.location', 'error',
        'Location of Main Source of Income আবশ্যক — লাইভ সাইট এটি না দিলে সামনে এগোতে দেবে না। ' +
        'আপনার অফিস/ব্যবসা যে এলাকায়, সেটি বেছে নিন।');
    }
    if (data.additional.claimTaxRebate === 'No' && res.investment.actual > 0) {
      add('additional.claimTaxRebate', 'error',
        'আপনি "Claim tax rebate for investment?" = No দিয়েছেন, তাই কোনো রেয়াত পাচ্ছেন না — ' +
        'অথচ Rebate পাতায় বিনিয়োগ দেখানো আছে। "Yes" করলে কর কমবে।');
    } else if (data.additional.claimTaxRebate === 'No' && income > res.threshold) {
      add('additional.claimTaxRebate', 'warn',
        'রেয়াত দাবি করছেন না — DPS, সঞ্চয়পত্র, জীবন বীমা, GPF/RPF যেকোনো একটি থাকলেও "Yes" দিলে কর কমত। ' +
        'বেতন থেকে GPF/RPF কাটা হলেও সেটা রেয়াতযোগ্য বিনিয়োগ।');
    }
    if (data.additional.guardianOfDisabled && n(data.taxpayer.disabledChildren) === 0) {
      add('taxpayer.disabledChildren', 'warn',
        'প্রতিবন্ধী সন্তানের অভিভাবক হিসেবে সুবিধা চেয়েছেন কিন্তু সংখ্যা ০ — সংখ্যা দিলে করমুক্ত সীমা বাড়বে।');
    }

    /* ---------- বেতন ---------- */
    if (heads.employment) {
      (data.employment || []).forEach((e, i) => {
        const p = 'employment[' + i + ']';
        const basic = n(e.basicSalary);
        const hr = n(e.houseRentAllowance);
        const med = n(e.medicalAllowance);
        const conv = n(e.conveyanceAllowance);
        const fest = n(e.festivalBonus);

        if (basic > 0 && basic < 60000) {
          add(p + '.basicSalary', 'warn',
            'মাসিক অঙ্ক লিখে ফেলেননি তো? এখানে **বার্ষিক** (১২ মাসের যোগফল) লিখতে হয়। ' +
            'মাসে ' + f(basic) + ' হলে বছরে ' + f(basic * 12) + '।');
        }
        if (hr > 0 && basic === 0) {
          add(p + '.basicSalary', 'warn', 'বাড়ি ভাড়া ভাতা দিয়েছেন কিন্তু মূল বেতন ০ — মূল বেতন দিতে ভুলে গেছেন?');
        }
        if (basic > 0 && hr > basic) {
          add(p + '.houseRentAllowance', 'warn',
            'বাড়ি ভাড়া ভাতা মূল বেতনের চেয়ে বেশি — সাধারণত এটি মূল বেতনের ৫০% এর মতো হয় ' +
            '(আপনার ক্ষেত্রে হতো প্রায় ' + f(basic * 0.5) + ')। স্যালারি সনদ মিলিয়ে দেখুন।');
        }
        if (basic > 0 && med > basic * 0.4) {
          add(p + '.medicalAllowance', 'warn',
            'চিকিৎসা ভাতা মূল বেতনের ' + Math.round(med / basic * 100) + '% — সাধারণত ১০% এর মতো হয়।');
        }
        if (conv > 300000) {
          add(p + '.conveyanceAllowance', 'warn',
            'যাতায়াত ভাতা বছরে ' + f(conv) + ' — বেশ বেশি। অফিসের গাড়ি পেলে সেটা ডান পাশের ' +
            '"Vehicle Facility Provided" ঘরে দিতে হয়, এখানে নয়।');
        }
        if (basic > 0 && fest > basic * 0.5) {
          add(p + '.festivalBonus', 'warn',
            'উৎসব বোনাস মূল বেতনের অর্ধেকের বেশি — সাধারণত ২টি বোনাস = ২ মাসের মূল বেতন ≈ ' +
            f(basic / 6) + '। পারফরম্যান্স বোনাস হলে "Add More → Other Bonus"-এ দিন।');
        }
        if ((basic + hr + med + conv + fest) > 0 && !String(e.employer || '').trim()) {
          add(p + '.employer', 'info', 'প্রতিষ্ঠানের নাম দিতে ভুলে গেছেন।');
        }
        if ((basic + hr + med + conv + fest) > 0 && !e.employmentType) {
          add(p + '.employmentType', 'error',
            'Employment Type না দিলে লাইভ সাইট এগোতে দেবে না — সরকারি নাকি বেসরকারি বেছে নিন।');
        }
      });
    }

    /* ---------- বাড়ি ভাড়া ---------- */
    if (heads.rent) {
      (data.rent || []).forEach((r, i) => {
        const p = 'rent[' + i + ']';
        const c = res.rent.rows[i] || {};
        ['residential', 'commercial'].forEach(k => {
          const s = r[k] || {};
          const ar = n(s.annualRent);
          if (ar > 0 && ar < 24000) {
            add(p + '.' + k + '.annualRent', 'warn',
              'মাসিক ভাড়া লিখে ফেলেননি তো? বার্ষিক লিখতে হয় — মাসে ' + f(ar) + ' হলে বছরে ' + f(ar * 12) + '।');
          }
          if (n(s.rentReceived) > ar * 1.5 && ar > 0) {
            add(p + '.' + k + '.rentReceived', 'warn',
              'প্রকৃত ভাড়া চুক্তির ভাড়ার চেয়ে অনেক বেশি — দুটো মিলিয়ে দেখুন।');
          }
        });
        if (c.totalRent > 0 && n(r.deductions && r.deductions.loanInterest) > c.totalRent) {
          add(p + '.deductions.loanInterest', 'warn',
            'গৃহঋণের সুদ (' + f(r.deductions.loanInterest) + ') মোট ভাড়ার (' + f(c.totalRent) + ') চেয়ে বেশি। ' +
            'কিস্তির পুরো টাকা নয় — শুধু **সুদের অংশ** লিখুন (ব্যাংকের Interest Certificate দেখুন)।');
        }
        if (n(r.totalArea) > 0 && n(r.areaPersonalUse) > n(r.totalArea)) {
          add(p + '.areaPersonalUse', 'error', 'নিজে থাকার অংশ মোট আয়তনের চেয়ে বেশি হতে পারে না।');
        }
      });
    }

    /* ---------- কৃষি ---------- */
    if (heads.agriculture) {
      (data.agriculture || []).forEach((a, i) => {
        const p = 'agriculture[' + i + ']';
        if (a.booksOfAccounts === 'Yes' && n(a.costOfProduction) > n(a.salesProceed)) {
          add(p + '.costOfProduction', 'warn', 'উৎপাদন খরচ বিক্রয়মূল্যের চেয়ে বেশি — লোকসান দেখাচ্ছেন? কাগজপত্র লাগবে।');
        }
      });
    }

    /* ---------- ব্যবসা ---------- */
    if (heads.business) {
      (data.business || []).forEach((b, i) => {
        const p = 'business[' + i + ']';
        if (n(b.costOfGoodsSold) > n(b.turnover) && n(b.turnover) > 0) {
          add(p + '.costOfGoodsSold', 'warn', 'বিক্রিত পণ্যের ক্রয়মূল্য মোট বিক্রির চেয়ে বেশি — অর্থাৎ লোকসান। ঠিক আছে তো?');
        }
        const bal = b.balance || {};
        const ta = n(bal.cash) + n(bal.inventories) + n(bal.fixedAssets) + n(bal.otherAssets);
        const c = res.biz.rows[i] || { net: 0 };
        const cc = n(bal.openingCapital) + c.net - n(bal.withdrawals) + n(bal.liabilities);
        if (ta > 0 && Math.abs(ta - cc) > 1) {
          add(p + '.balance.cash', 'error',
            'ব্যালান্স শিট মিলছে না — Total Assets ' + f(ta) + ' বনাম Capital+Liabilities ' + f(cc) +
            ' (পার্থক্য ' + f(ta - cc) + ')। লাইভ সাইট এখানে আটকে দেবে।');
        }
      });
    }

    /* ---------- মূলধনী মুনাফা ---------- */
    if (heads.capitalGain) {
      (data.capitalGain || []).forEach((c, i) => {
        const p = 'capitalGain[' + i + ']';
        if (n(c.saleDeedValue) > 0 && n(c.costOfAcquisition) === 0) {
          add(p + '.costOfAcquisition', 'warn',
            'ক্রয়মূল্য ০ দিলে পুরো বিক্রয়মূল্যই লাভ ধরা হবে — কর অনেক বেশি আসবে। ' +
            'রেজিস্ট্রেশন খরচসহ প্রকৃত ক্রয়মূল্য দিন।');
        }
        if (n(c.tds) === 0 && n(c.saleDeedValue) > 0) {
          add(p + '.tds', 'info', 'জমি/ফ্ল্যাট রেজিস্ট্রেশনের সময় সাধারণত উৎসে কর কাটা হয় — রসিদ দেখে বসান, কর কমবে।');
        }
      });
    }

    /* ---------- আর্থিক সম্পদ ---------- */
    if (heads.financialAssets) {
      (data.financialAssets || []).forEach((x, i) => {
        const p = 'financialAssets[' + i + ']';
        const v = n(x.value), g = n(x.grossInterest), t = n(x.tds);
        if (v > 0 && g === 0) {
          add(p + '.grossInterest', 'warn', 'বিনিয়োগ আছে কিন্তু সুদ/মুনাফা ০ — ব্যাংক স্টেটমেন্ট দেখে বসান। ব্যাংক এই তথ্য NBR-কে পাঠায়।');
        }
        if (v > 0 && g > v * 0.20) {
          add(p + '.grossInterest', 'warn',
            'সুদের হার দাঁড়াচ্ছে ' + Math.round(g / v * 100) + '% — অস্বাভাবিক বেশি। ' +
            'মূল টাকা আর মুনাফা উল্টে দেননি তো?');
        }
        if (g > 0 && t > g * 0.35) {
          add(p + '.tds', 'warn', 'কাটা কর মুনাফার ' + Math.round(t / g * 100) + '% — সাধারণত ১০%–১৫%।');
        }
        if (g > 0 && t === 0) {
          add(p + '.tds', 'info', 'সুদের উপর সাধারণত ১০% উৎস কর কাটা হয় — সনদ নিয়ে বসালে প্রদেয় কর কমবে।');
        }
      });
    }

    /* ---------- রেয়াত ---------- */
    (data.rebate.dps || []).forEach((x, i) => {
      if (n(x.deposit) > 120000) {
        add('rebate.dps[' + i + '].deposit', 'warn',
          'DPS-এ বছরে সর্বোচ্চ ১,২০,০০০ টাকা রেয়াতযোগ্য। ' + f(x.deposit) +
          ' লিখলেও রেয়াতে ধরা হবে ১,২০,০০০।');
      }
    });
    (data.rebate.lifeInsurance || []).forEach((x, i) => {
      const pv = n(x.policyValue), pp = n(x.premiumPaid);
      if (pv > 0 && pp > pv * 0.10) {
        add('rebate.lifeInsurance[' + i + '].premiumPaid', 'warn',
          'প্রিমিয়াম পলিসি মূল্যের ১০%-এর বেশি — রেয়াতযোগ্য হবে সর্বোচ্চ ' + f(pv * 0.10) + ' টাকা।');
      }
      if (pv === 0 && pp > 0) {
        add('rebate.lifeInsurance[' + i + '].policyValue', 'warn', 'পলিসি মূল্য না দিলে ১০% সীমা যাচাই করা যাবে না।');
      }
    });
    if (income > 0 && res.investment.allowable > income) {
      add('rebate.others.schedule6Part3', 'warn',
        'বিনিয়োগ (' + f(res.investment.allowable) + ') আপনার মোট আয়ের (' + f(income) + ') চেয়ে বেশি — ' +
        'এই টাকা কোথা থেকে এলো তার ব্যাখ্যা লাগবে।');
    }

    /* ---------- খরচ ---------- */
    if (income > res.threshold) {
      if (res.lifestyleExpense === 0) {
        add('expenditure.food', 'error',
          'জীবনযাত্রার ব্যয় ০ — এটি অবাস্তব এবং অডিটে পড়ার সবচেয়ে বড় কারণ। বাস্তব খরচ লিখুন।');
      } else if (res.lifestyleExpense < income * 0.20) {
        add('expenditure.food', 'warn',
          'মোট আয় ' + f(income) + ' টাকার বিপরীতে খরচ মাত্র ' + f(res.lifestyleExpense) +
          ' (' + Math.round(res.lifestyleExpense / income * 100) + '%) — সাধারণত আয়ের ৫০%–৭০% খরচ হয়।');
      } else if (res.lifestyleExpense > income * 1.3) {
        add('expenditure.food', 'warn',
          'খরচ (' + f(res.lifestyleExpense) + ') আয়ের (' + f(income) + ') চেয়ে অনেক বেশি — ' +
          'বাড়তি টাকার উৎস (সঞ্চয় ভাঙা / ঋণ / উপহার) দেখাতে হবে।');
      }
      if (n(data.expenditure.food) === 0 && res.lifestyleExpense > 0) {
        add('expenditure.food', 'warn', 'খাওয়া-পরার খরচ ০ — এটি বাস্তবসম্মত নয়।');
      }
      if (n(data.expenditure.accommodation) === 0 && res.lifestyleExpense > 0) {
        add('expenditure.accommodation', 'info',
          'বাসস্থান খরচ ০ — নিজের বাসায় থাকলেও সার্ভিস চার্জ/রক্ষণাবেক্ষণ খরচ থাকে।');
      }
    }

    /* ---------- সম্পদ ---------- */
    const As = data.assets || {};
    if (n(As.cashInHand) > 500000) {
      add('assets.cashInHand', 'warn',
        'হাতে নগদ ' + f(As.cashInHand) + ' টাকা — অস্বাভাবিক বেশি। ব্যাংকে থাকলে ব্যাংকের ঘরে দিন।');
    }
    if (n(As.motorCarCount) > 0 && n(As.motorCar) === 0) {
      add('assets.motorCar', 'warn', 'গাড়ির সংখ্যা দিয়েছেন কিন্তু ক্রয়মূল্য ০ — ক্রয়মূল্য দিন।');
    }
    if (data.additional.ownMotorCar === 'Yes' && n(As.motorCar) === 0) {
      add('assets.motorCar', 'error',
        'Additional Information-এ "গাড়ি আছে" বলেছেন কিন্তু সম্পদে গাড়ি নেই — অমিল ধরা পড়বে।');
    }
    if (res.grossWealth > rules.grossWealthLimit && data.additional.grossWealthOver50Lakh === 'No') {
      add('assets.nonAgriProperty', 'error',
        'আপনার মোট সম্পদ ' + f(res.grossWealth) + ' — ৫০ লাখের বেশি। কিন্তু Additional Information-এ ' +
        '"Gross Wealth over 50,00,000?" = No দিয়েছেন। ওটা Yes করুন।');
    }
    if (n(data.wealth.previousNetWealth) === 0 && !data.taxpayer.firstTimeFiler && res.grossWealth > 0) {
      add('wealth.previousNetWealth', 'warn',
        'গত বছরের নিট সম্পদ ০ দিয়েছেন অথচ প্রথমবার রিটার্ন নয় — গত বছরের রিটার্ন দেখে সঠিক অঙ্ক বসান, ' +
        'নাহলে তহবিলের হিসাব মিলবে না।');
    }

    /* ---------- তহবিলের হিসাব ---------- */
    if (res.totalFundOutflow !== 0 || res.sourceOfFund !== 0) {
      if (res.fundDifference < -1) {
        add('wealth.previousNetWealth', 'error',
          'তহবিলে ঘাটতি ' + f(Math.abs(res.fundDifference)) + ' টাকা — লাইভ সাইট "You have shortage of fund" ' +
          'বলে আটকে দেবে। আয় কম দেখিয়েছেন, নাকি সম্পদ/খরচ বেশি?');
      } else if (res.fundDifference > 1) {
        add('wealth.otherReceipts', 'warn',
          'তহবিলে উদ্বৃত্ত ' + f(res.fundDifference) + ' টাকা — অর্থাৎ এই টাকাটা কোথায় গেল দেখানো হয়নি। ' +
          'Difference **শূন্য** হওয়া উচিত। কোনো সম্পদ (ব্যাংক ব্যালান্স, নগদ) বা খরচ দিতে ভুলে গেছেন।');
      }
    }

    /* ---------- পাতায় পাতায় মিল ---------- */
    const anyDps = (data.rebate.dps || []).some(x => n(x.deposit) > 0);
    if (anyDps && n(As.dps) === 0) {
      add('assets.dps', 'warn', 'Rebate-এ DPS দেখিয়েছেন কিন্তু সম্পদে DPS ০ — সম্পদের ঘরেও বছরশেষ স্থিতি দিন।');
    }
    const anySanchay = (data.rebate.sanchayapatra || []).some(x => n(x.amount) > 0);
    if (anySanchay && n(As.sanchayapatra) === 0) {
      add('assets.sanchayapatra', 'warn', 'Rebate-এ সঞ্চয়পত্র কিনেছেন বলেছেন কিন্তু সম্পদে সঞ্চয়পত্র ০।');
    }
    const anyGpf = (data.rebate.gpf || []).some(x => n(x.contribution) > 0) ||
      (data.rebate.rpf || []).some(x => n(x.selfContribution) + n(x.employerContribution) > 0);
    if (anyGpf && n(As.providentFund) === 0) {
      add('assets.providentFund', 'warn', 'GPF/RPF-এ চাঁদা দিয়েছেন কিন্তু সম্পদে Provident Fund ০ — মোট জমা দিন।');
    }
    const bankInterest = (data.financialAssets || []).some(x =>
      /Bank\/FI/.test(x.assetType) && n(x.grossInterest) > 0);
    if (bankInterest && n(As.bankCardsElectronic) === 0) {
      add('assets.bankCardsElectronic', 'warn', 'ব্যাংক সুদ দেখিয়েছেন কিন্তু সম্পদে ব্যাংক ব্যালান্স ০।');
    }
    const expTax = n(data.expenditure.taxAtSourceAdvance);
    const paidTax = n(data.payments.sourceTax) + n(data.payments.advanceIncomeTax);
    if (expTax > 0 && paidTax > 0 && Math.abs(expTax - paidTax) > 1) {
      add('payments.sourceTax', 'warn',
        'Expenditure পাতায় উৎসে কর লিখেছেন ' + f(expTax) + ', এখানে দাবি করছেন ' + f(paidTax) +
        ' — দুটো এক হওয়া উচিত।');
    }
    if (res.sourceTaxAuto > 0 && n(data.payments.sourceTax) === 0) {
      add('payments.sourceTax', 'info',
        'আপনার এন্ট্রি থেকে উৎসে কাটা কর পাওয়া গেছে ' + f(res.sourceTaxAuto) +
        ' টাকা — এখানে বসালে ততটাই কম টাকা দিতে হবে।');
    }
    if (n(data.payments.sourceTax) > res.totalAmountPayable * 3 && res.totalAmountPayable > 0) {
      add('payments.sourceTax', 'warn', 'দাবি করা উৎস কর প্রদেয় করের তুলনায় অনেক বেশি — সনদ মিলিয়ে দেখুন।');
    }

    /* ---------- খাত টিক দিয়েছেন কিন্তু কিছু দেননি ---------- */
    const empty = [
      ['employment', 'employment', 'Income from Employment', res.emp.gross],
      ['rent', 'rent', 'Income from Rent', res.rent.taxable],
      ['agriculture', 'agriculture', 'Income from Agriculture', res.agri.taxable],
      ['business', 'business', 'Income from Business or Profession', res.biz.taxable],
      ['capitalGain', 'capital-gain', 'Capital Gains', res.cg.taxable],
      ['financialAssets', 'financial-assets', 'Income from Financial Assets', res.fin.taxable + res.fin.finalTaxIncome],
      ['otherSources', 'other-sources', 'Income from Other Sources', res.oth.taxable]
    ];
    empty.forEach(([k, page, label, amount]) => {
      if (heads[k] && !amount) {
        add('assessment.heads.' + k, 'warn',
          '"' + label + '"-এ টিক দিয়েছেন কিন্তু কোনো অঙ্ক দেননি। ' +
          'হয় পাতাটি পূরণ করুন, নয়তো টিক তুলে দিন — নাহলে লাইভ সাইট এগোতে দেবে না।');
      }
    });

    return out;
  }

  function byPath(list) {
    const m = {};
    list.forEach(w => { (m[w.path] = m[w.path] || []).push(w); });
    return m;
  }

  function counts(list) {
    return {
      error: list.filter(w => w.level === 'error').length,
      warn: list.filter(w => w.level === 'warn').length,
      info: list.filter(w => w.level === 'info').length
    };
  }

  global.Validate = { check, byPath, counts };
})(window);
