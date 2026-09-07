/* eReturn Demo — জিরো রিটার্ন (কর ০) গাইড
   কে কীভাবে বৈধভাবে ০ টাকা কর দিয়ে রিটার্ন জমা দিতে পারেন — ধাপে ধাপে।
*/
(function (global) {
  'use strict';

  const n = v => TaxCalc.n(v);
  const f = v => TaxCalc.fmt(v);

  /* ---------- কারা সাধারণত জিরো রিটার্ন দেন ---------- */
  const PROFILES = [
    {
      id: 'newtin',
      icon: '🆕',
      title: 'নতুন TIN নিয়েছি, আয় নেই বা খুব কম',
      who: 'ব্যাংক হিসাব, ট্রেড লাইসেন্স, ক্রেডিট কার্ড বা চাকরির জন্য TIN নিয়েছেন — কিন্তু করযোগ্য আয় নেই।',
      why: 'TIN থাকলে রিটার্ন দিতেই হবে, কিন্তু আয় করমুক্ত সীমার নিচে থাকায় কর ০।',
      steps: [
        'Assessment → "Any taxable income in the income year?" = **Yes** (No দিলে আয় দেখানোর ঘরই আসবে না)',
        'যে খাতে সামান্য আয় আছে সেটায় টিক দিন — না থাকলে কোনোটাতেই নয়',
        'Additional Information → Location দিন, বাকি সব "No"',
        'Expenditure → বাস্তব খরচ লিখুন (৳০ দেবেন না)',
        'Assets & Liabilities → যা আছে ক্রয়মূল্যে; প্রথম রিটার্ন হলে "গত বছরের নিট সম্পদ" = ০',
        'Tax & Payment → কর ০ দেখাবে → Proceed to online return → Submit'
      ],
      fill: d => {
        d.taxpayer.firstTimeFiler = true;
        d.assessment.hasTaxableIncome = 'Yes';
        d.assessment.heads.employment = false;
        d.additional.location = 'Any Other Area';
        Object.assign(d.expenditure, { food: 120000, accommodation: 60000, utilityElectricity: 9000, utilityPhoneInternet: 6000 });
        Object.assign(d.assets, { cashInHand: 20000, bankCardsElectronic: 60000, furnitureElectronics: 50000 });
        d.wealth.previousNetWealth = 0;
        d.wealth.otherReceipts = 175000;
      }
    },
    {
      id: 'lowsalary',
      icon: '💼',
      title: 'চাকরি করি, কিন্তু বেতন কম',
      who: 'বার্ষিক মোট বেতন এমন যে ১/৩ ছাড়ের পর করমুক্ত সীমার নিচে থেকে যায়।',
      why: 'বেসরকারি চাকরিতে মোট বেতনের ১/৩ (সর্বোচ্চ ৫,০০,০০০) এমনিতেই বাদ যায়। ' +
        'তাই ৬,০০,০০০ টাকা বেতনেও করযোগ্য আয় দাঁড়ায় ৪,০০,০০০ — ঠিক করমুক্ত সীমায়।',
      steps: [
        'Assessment → Income from Employment-এ টিক',
        'Employment → Employment Type ঠিকভাবে বাছুন (সরকারি/বেসরকারি)',
        'Salary Certificate দেখে প্রতিটি ভাতার **বার্ষিক** অঙ্ক বসান',
        'Employment Summary-তে দেখুন করযোগ্য বেতন কত দাঁড়াল',
        'করমুক্ত সীমার নিচে থাকলে কর ০ — সরাসরি Submit'
      ],
      fill: d => {
        d.assessment.hasTaxableIncome = 'Yes';
        d.assessment.heads.employment = true;
        d.additional.location = 'Any Other Area';
        const e = ReturnState.blankEmployment();
        e.employmentType = 'Private/Other than Government Pay Scale';
        e.employer = 'ABC Enterprise'; e.designation = 'Officer';
        e.basicSalary = 300000; e.houseRentAllowance = 150000;
        e.medicalAllowance = 30000; e.conveyanceAllowance = 24000; e.festivalBonus = 50000;
        d.employment = [e];
        Object.assign(d.expenditure, { food: 180000, accommodation: 96000, utilityElectricity: 12000, utilityPhoneInternet: 9000, autoOther: 18000 });
        Object.assign(d.assets, { cashInHand: 25000, bankCardsElectronic: 90000, furnitureElectronics: 80000 });
        d.wealth.previousNetWealth = 120000;
      }
    },
    {
      id: 'remittance',
      icon: '✈️',
      title: 'প্রবাসী — রেমিট্যান্সই আয়',
      who: 'বিদেশে থাকেন/কাজ করেন, দেশে ব্যাংকের মাধ্যমে টাকা পাঠান।',
      why: '⭐ বৈধ ব্যাংকিং চ্যানেলে আসা রেমিট্যান্স **সম্পূর্ণ করমুক্ত**। ' +
        'তাই যত টাকাই পাঠান, এই খাতে কর ০। কিন্তু দেখাতেই হবে — নাহলে সম্পদ বাড়ার ব্যাখ্যা মিলবে না।',
      steps: [
        'Assessment → "Any income which is fully exempted from tax?" = **Yes**',
        'Assessment → Resident Status ঠিক করুন (বছরে ১৮২ দিন দেশে থাকলে Resident)',
        'Tax Exempted Income পাতা → "Foreign Remittance" → বছরের মোট অঙ্ক',
        'ব্যাংকের **এনক্যাশমেন্ট সনদ** সংগ্রহ করে রাখুন',
        'Assets-এ দেশে যা কিনেছেন/জমিয়েছেন তা দেখান — উৎস হিসেবে রেমিট্যান্সই দাঁড়াবে',
        'Tax & Payment → কর ০ → Submit'
      ],
      fill: d => {
        d.assessment.hasTaxableIncome = 'Yes';
        d.assessment.hasExemptedIncome = 'Yes';
        d.additional.location = 'Any Other Area';
        d.exempted = [{ type: 'Foreign Remittance', particulars: 'ব্যাংকের মাধ্যমে পাঠানো', amount: 900000 }];
        Object.assign(d.expenditure, { food: 240000, accommodation: 120000, utilityElectricity: 18000, education: 60000 });
        Object.assign(d.assets, { cashInHand: 50000, bankCardsElectronic: 400000, goldJewellery: 150000, furnitureElectronics: 120000 });
        d.wealth.previousNetWealth = 90000;
      }
    },
    {
      id: 'pension',
      icon: '🧓',
      title: 'অবসরপ্রাপ্ত / পেনশনভোগী',
      who: 'সরকারি চাকরি থেকে অবসর নিয়েছেন, পেনশন ও সঞ্চয়পত্রের মুনাফা পান।',
      why: 'সরকারি পেনশন ও অনুমোদিত গ্র্যাচুইটি **সম্পূর্ণ করমুক্ত**। ' +
        '৬৫+ বয়সে করমুক্ত সীমাও বেশি (' + '৪,৫০,০০০' + ')। সঞ্চয়পত্রের মুনাফা চূড়ান্ত করদায় — ' +
        'কাটা ১০% করই শেষ।',
      steps: [
        'Home → করদাতার শ্রেণি = **নারী / ৬৫+ বছর** (বয়স ৬৫+ হলে)',
        'Assessment → করমুক্ত আয় = **Yes**; Financial Assets-এ টিক (সঞ্চয়পত্র থাকলে)',
        'Tax Exempted Income → "Income from Pension" → বছরের মোট পেনশন',
        'Financial Assets → "Interest From Sanchayapatra" → মুনাফা ও কাটা ১০% কর',
        'Tax & Payment → Source Tax-এ কাটা কর দাবি করুন',
        'বেশির ভাগ ক্ষেত্রেই কর ০ বা ফেরতযোগ্য আসে'
      ],
      fill: d => {
        d.taxpayer.category = 'female_senior';
        d.assessment.hasTaxableIncome = 'Yes';
        d.assessment.hasExemptedIncome = 'Yes';
        d.assessment.heads.financialAssets = true;
        d.additional.location = 'Any Other Area';
        d.exempted = [{ type: 'Income from Pension', particulars: 'সরকারি পেনশন', amount: 420000 }];
        d.financialAssets = [{ assetType: 'Interest From Sanchayapatra', particulars: 'পেনশনার সঞ্চয়পত্র', value: 3000000, grossInterest: 330000, tds: 33000 }];
        d.payments.sourceTax = 33000;
        Object.assign(d.expenditure, { food: 240000, accommodation: 60000, utilityElectricity: 18000, utilityPhoneInternet: 9000 });
        Object.assign(d.assets, { sanchayapatra: 3000000, cashInHand: 40000, bankCardsElectronic: 200000, furnitureElectronics: 100000 });
        d.wealth.previousNetWealth = 3000000;
      }
    },
    {
      id: 'housewife',
      icon: '🏠',
      title: 'গৃহিণী / নির্ভরশীল',
      who: 'নিজের আয় নেই, স্বামী/পরিবার খরচ চালায়, কিন্তু TIN আছে।',
      why: 'নারী করদাতার করমুক্ত সীমা ৪,৫০,০০০। নিজের আয় না থাকলে কর ০।',
      steps: [
        'Home → করদাতার শ্রেণি = **নারী / ৬৫+ বছর**',
        'Assessment → করযোগ্য আয় = Yes, কিন্তু কোনো খাতে টিক নয় (আয় না থাকলে)',
        'Expenditure → সংসারের যতটুকু খরচ আপনার নামে হয়, বাস্তব অঙ্ক লিখুন',
        'Assets → নিজের নামে যা আছে (স্বর্ণ, ব্যাংক, DPS) ক্রয়মূল্যে',
        '⭐ Assets & Liabilities → "Other Receipts"-এ স্বামী/পরিবার থেকে পাওয়া টাকা দেখান — ' +
        'এতে খরচ ও সম্পদের উৎস মিলে যাবে',
        'Tax & Payment → কর ০ → Submit'
      ],
      fill: d => {
        d.taxpayer.category = 'female_senior';
        d.assessment.hasTaxableIncome = 'Yes';
        d.additional.location = 'Any Other Area';
        Object.assign(d.expenditure, { food: 150000, accommodation: 60000, utilityElectricity: 12000, utilityPhoneInternet: 6000 });
        Object.assign(d.assets, { goldJewellery: 250000, cashInHand: 30000, bankCardsElectronic: 80000, furnitureElectronics: 60000 });
        d.wealth.previousNetWealth = 192000;
        d.wealth.otherReceipts = 456000;
      }
    },
    {
      id: 'student',
      icon: '🎓',
      title: 'ছাত্র / সদ্য চাকরিপ্রার্থী',
      who: 'পড়াশোনা করছেন, টিউশনি বা পার্টটাইম থেকে সামান্য আয়।',
      why: 'আয় করমুক্ত সীমার নিচে থাকায় কর ০। নতুন করদাতা হলে ন্যূনতম করও ১,০০০।',
      steps: [
        'Home → "প্রথমবার রিটার্ন দিচ্ছি"-তে টিক',
        'টিউশনি/ফ্রিল্যান্সিং থাকলে Assessment → Business or Profession-এ টিক',
        'Business → Category "Business or Professional Income" → বছরের মোট আয়',
        'Expenditure → বাস্তব খরচ',
        'পরিবার থেকে টাকা পেলে Assets → Other Receipts-এ দেখান',
        'কর ০ → Submit'
      ],
      fill: d => {
        d.taxpayer.firstTimeFiler = true;
        d.assessment.hasTaxableIncome = 'Yes';
        d.assessment.heads.business = true;
        d.additional.location = 'Any Other Area';
        const b = ReturnState.blankBusiness();
        b.businessCategory = 'Business or Professional Income';
        b.businessName = 'টিউশনি / ফ্রিল্যান্সিং';
        b.turnover = 180000; b.costOfGoodsSold = 0;
        b.expenses = [{ type: 'All general, administrative, selling & other expenses (Consolidated)', amount: 30000 }];
        d.business = [b];
        Object.assign(d.expenditure, { food: 96000, accommodation: 36000, utilityPhoneInternet: 9000, education: 40000, autoOther: 12000 });
        Object.assign(d.assets, { cashInHand: 15000, bankCardsElectronic: 40000, furnitureElectronics: 30000 });
        d.wealth.previousNetWealth = 0;
        d.wealth.otherReceipts = 108000;
      }
    }
  ];

  /* ---------- আপনার ক্ষেত্রে কর ০ সম্ভব কিনা ---------- */
  function analyse(data, res, rules) {
    const gap = res.totalIncome - res.threshold;
    const minTax = data.taxpayer.firstTimeFiler ? rules.minimumTax.firstTime : rules.minimumTax.standard;
    const t = TaxAdvisor.investmentTargets(res, rules);

    const state = res.totalIncome <= res.threshold ? 'zero'
      : (t.canZeroByRebate ? 'minonly' : 'taxable');

    /* বৈধভাবে করযোগ্য আয় কমানোর যেসব সুযোগ এখনো নেওয়া হয়নি */
    const ways = [];
    const add = (title, gainText, how, goto) => ways.push({ title, gainText, how, goto });

    if (data.taxpayer.category === 'general' && !data.additional.disabledThirdGender && !data.additional.freedomFighter) {
      add('শ্রেণি ঠিক আছে তো?',
        'সীমা ' + f(rules.threshold.female_senior - rules.threshold.general) + ' – ' +
        f(rules.threshold.freedom_fighter - rules.threshold.general) + ' টাকা বাড়তে পারে',
        'নারী করদাতা বা ৬৫+ বছর হলে সীমা ' + f(rules.threshold.female_senior) + '; ' +
        'প্রতিবন্ধী/তৃতীয় লিঙ্গ হলে ' + f(rules.threshold.disabled_third) + '; ' +
        'গেজেটেড মুক্তিযোদ্ধা হলে ' + f(rules.threshold.freedom_fighter) + ' টাকা।',
        'taxpayerCategory');
    }
    if (!data.additional.guardianOfDisabled) {
      add('প্রতিবন্ধী সন্তান আছে?',
        'প্রতি সন্তানে +' + f(rules.disabledChildRelief),
        'Additional Information-এ "Claim Benefit as a Parent/Legal Guardian" টিক দিলে ' +
        'প্রতি প্রতিবন্ধী সন্তানের জন্য করমুক্ত সীমা ' + f(rules.disabledChildRelief) + ' টাকা বাড়ে।',
        'guardianOfDisabled');
    }
    if (data.assessment.hasExemptedIncome !== 'Yes' || !res.exemptedIncome) {
      add('করমুক্ত আয় আলাদা করে দেখান',
        'যতটুকু করমুক্ত, ততটুকু করযোগ্য আয় থেকে বাদ',
        'রেমিট্যান্স, সরকারি পেনশন, সর্বজনীন পেনশন, IT/সফটওয়্যার রপ্তানির আয় — ' +
        'এগুলো আয়ের খাতে না দিয়ে **Tax Exempted Income** পাতায় দিলে করযোগ্য আয়ে যোগ হয় না।',
        'exemptType');
    }
    if (data.assessment.heads.rent && !(data.rent || []).some(r => n(r.deductions && r.deductions.loanInterest))) {
      add('গৃহঋণের সুদ বাদ দিয়েছেন?',
        'পুরো সুদটাই ভাড়া আয় থেকে বাদ যায়',
        'ব্যাংক থেকে Interest Certificate নিয়ে Rent পাতার Deductions-এ বসান।',
        'rentLoanInterest');
    }
    if (data.assessment.heads.agriculture && (data.agriculture || []).some(a => a.booksOfAccounts === 'Yes')) {
      add('কৃষিতে "হিসাবের বই রাখি না" দিন',
        'বিক্রয়মূল্যের ৬০% খরচ এমনিতেই বাদ',
        'Maintain Books of Accounts? = **No** দিলে কোনো ভাউচার ছাড়াই ৬০% উৎপাদন খরচ বাদ যাবে।',
        'agriBooks');
    }
    if (data.assessment.heads.business && !(data.business || []).some(b =>
      (b.expenses || []).some(x => /Depreciation/i.test(x.type)))) {
      add('ব্যবসায় অবচয় (Depreciation) দেখান',
        'যন্ত্রপাতি/আসবাব/গাড়ির বার্ষিক মূল্যক্ষয়',
        'Business → Expenses → "Depreciation" যোগ করুন। নগদ খরচ না হলেও বাদ দেওয়া যায় — অনেকেই এটা বাদ দেন।',
        'businessExpense');
    }
    if (data.assessment.heads.capitalGain && (data.capitalGain || []).some(c => n(c.saleDeedValue) && !n(c.costOfAcquisition))) {
      add('ক্রয়মূল্যে রেজিস্ট্রেশন খরচ যোগ করুন',
        'মূলধনী মুনাফা কমবে',
        'Cost of Acquisition-এ শুধু দাম নয় — রেজিস্ট্রেশন ফি, স্ট্যাম্প, উকিলের ফি, উন্নয়ন খরচ সব যোগ করুন।',
        'costOfAcquisition');
    }
    if (data.additional.claimTaxRebate === 'No') {
      add('রেয়াত দাবি করুন',
        'সর্বোচ্চ ' + f(t.maxRebate) + ' টাকা কর কমতে পারে',
        'Additional Information → "Claim tax rebate for investment?" = **Yes** করুন।',
        'claimTaxRebate');
    } else if (t.moreNeededForMax > 0 && res.grossTaxBeforeRebate > 0) {
      add('বিনিয়োগ রেয়াত পূর্ণ করুন',
        'আরও ' + f(Math.max(0, Math.min(t.maxRebate, res.grossTaxBeforeRebate) - res.rebateOnInvestment)) + ' টাকা রেয়াত',
        fJoin(t), 'dps');
    }
    if (res.sourceTaxAuto > 0 && n(data.payments.sourceTax) === 0) {
      add('উৎসে কাটা কর দাবি করুন',
        f(res.sourceTaxAuto) + ' টাকা সরাসরি বাদ',
        'Tax & Payment → Source Tax ঘরে বসান। লাইভে "Update Tax Payment Status" → "Claim Source Tax" দিয়ে যাচাই করতে হয়।',
        'sourceTax');
    }

    return { state, gap, minTax, targets: t, ways };
  }

  function fJoin(t) {
    return 'Rebate পাতায় আরও ' + f(t.moreNeededForMax) + ' টাকা অনুমোদিত বিনিয়োগ দেখাতে পারলে ' +
      'রেয়াত সর্বোচ্চ ' + f(t.maxRebate) + ' টাকায় পৌঁছাবে। DPS (বছরে ১,২০,০০০ পর্যন্ত), ' +
      'সঞ্চয়পত্র, জীবন বীমা, GPF/RPF, সর্বজনীন পেনশন — যেকোনোটি।';
  }

  /* ---------- জিরো রিটার্ন লাইভে জমা দেওয়ার ধাপ ---------- */
  const LIVE_STEPS = [
    { s: 'লগইন', d: 'etaxnbr.gov.bd → eReturn → TIN + পাসওয়ার্ড + ক্যাপচা' },
    { s: 'Assessment Year', d: 'উপরে ডানে ২০২৬-২০২৭ ঠিক আছে কিনা দেখুন' },
    { s: 'Regular e-Return', d: 'Resident Status ঠিক করুন। করমুক্ত আয় থাকলে "Yes"। ' +
        '"Any taxable income?" = **Yes** — আয় কম হলেও Yes দিতে হবে।' },
    { s: 'Heads of Income', d: 'যে খাতে সামান্য আয় আছে শুধু সেটায় টিক। আয় একদমই না থাকলে কোনোটাতেই নয়।' },
    { s: 'Additional Information', d: 'Location আবশ্যক। মুক্তিযোদ্ধা/প্রতিবন্ধী হলে টিক দিন — সীমা বাড়বে। ' +
        'Claim tax rebate = Yes (বিনিয়োগ থাকলে)।' },
    { s: 'আয়ের পাতাগুলো', d: 'যা যা টিক দিয়েছেন সব পূরণ করুন। কাগজ দেখে হুবহু, বানিয়ে নয়।' },
    { s: 'Tax Exempted Income', d: 'রেমিট্যান্স/পেনশন থাকলে এখানে দিন — কর বাড়বে না, উৎস প্রমাণ হবে।' },
    { s: 'Expenditure', d: '⚠️ বাস্তব খরচ লিখুন। ০ দিলে অডিটে পড়ার ঝুঁকি সবচেয়ে বেশি।' },
    { s: 'Assets & Liabilities', d: 'সম্পদ ক্রয়মূল্যে। প্রথম রিটার্ন হলে "গত বছরের নিট সম্পদ" = ০। ' +
        '**Difference শূন্য** হতে হবে — না হলে "Other Receipts"-এ পরিবার/উপহারের টাকা দেখান।' },
    { s: 'Tax & Payment', d: 'কর ০ দেখাচ্ছে কিনা মিলিয়ে নিন। উৎসে কর কাটা থাকলে দাবি করুন — ফেরতও পেতে পারেন।' },
    { s: 'Submit', d: 'Proceed to online return → একদম নিচে **Submit Return** → Yes → ' +
        'Acknowledgement Receipt ডাউনলোড করে রাখুন (PSR হিসেবে এটাই লাগবে)।' }
  ];

  global.ZeroGuide = { PROFILES, analyse, LIVE_STEPS };
})(window);
