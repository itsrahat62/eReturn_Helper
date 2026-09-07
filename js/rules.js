/* eReturn Demo — কর নীতিমালা (Tax Rules)
   AY 2026-2027 (আয় বছর ০১-০৭-২০২৫ থেকে ৩০-০৬-২০২৬)
   সব মান এখানে এক জায়গায় — Rules প্যানেল থেকে এডিট করা যায়।
   NBR লাইভ সাইটে হিসাব ভিন্ন এলে এখানে বদলে নিন।
*/
(function (global) {
  'use strict';

  const DEFAULT_RULES = {
    label: 'AY 2026-2027 (Finance Act 2026)',

    // করমুক্ত সীমা — করদাতার শ্রেণি অনুযায়ী
    threshold: {
      general: 400000,          // সাধারণ (পুরুষ)
      female_senior: 450000,    // নারী ও ৬৫+ বছর বয়সী
      disabled_third: 525000,   // প্রতিবন্ধী ও তৃতীয় লিঙ্গ
      freedom_fighter: 550000   // গেজেটেড মুক্তিযোদ্ধা / জুলাই যোদ্ধা
    },
    // প্রতিবন্ধী সন্তানের অভিভাবক — অতিরিক্ত ছাড় (প্রতি সন্তান)
    disabledChildRelief: 50000,

    // করমুক্ত সীমার উপরে স্ল্যাব
    slabs: [
      { width: 300000, rate: 0.10 },
      { width: 400000, rate: 0.15 },
      { width: 500000, rate: 0.20 },
      { width: 2000000, rate: 0.25 },
      { width: Infinity, rate: 0.30 }
    ],

    // বেতন আয়ের ছাড়: মোট বেতনের ১/৩ অথবা সিলিং — যেটি কম
    salaryExemption: { fraction: 1 / 3, ceiling: 500000 },

    // বিনিয়োগ কর রেয়াত (ধারা ৭৮)
    rebate: {
      onInvestment: 0.10,   // প্রকৃত অনুমোদিত বিনিয়োগের ১০%
      onIncome: 0.03,       // মোট আয়ের ৩%
      ceiling: 750000       // সর্বোচ্চ রেয়াত
    },

    // ন্যূনতম কর
    minimumTax: { standard: 5000, firstTime: 1000 },

    // নিট সম্পদের উপর সারচার্জ
    surcharge: [
      { upto: 40000000, rate: 0 },
      { upto: 100000000, rate: 0.10 },
      { upto: 200000000, rate: 0.20 },
      { upto: 500000000, rate: 0.30 },
      { upto: Infinity, rate: 0.35 }
    ],
    // একাধিক গাড়ি অথবা সিটি কর্পোরেশনে ৮০০০ বর্গফুটের বেশি গৃহসম্পত্তি থাকলে
    // নিট সম্পদ ৪ কোটির নিচে হলেও ন্যূনতম এই হারে সারচার্জ
    surchargeAssetTrigger: 0.10,
    surchargeHouseSqft: 8000,

    // গৃহসম্পত্তি আয়ে খরচের হার (মেরামত/আদায় ইত্যাদি)
    rentRepairRate: { residential: 0.25, commercial: 0.30 },

    // IT-10B (সম্পদ বিবরণী) বাধ্যতামূলক হওয়ার সীমা
    grossWealthLimit: 5000000,

    // ১ম কিস্তিতে (৩০ সেপ্টেম্বরের মধ্যে) রিটার্ন দিলে প্রণোদনা
    firstQuarterIncentive: 0.10,

    // অনলাইন রিটার্নের সময়সীমা
    dueDate: '৩০ নভেম্বর ২০২৬ (ট্যাক্স ডে)'
  };

  /* গত করবর্ষের নিয়ম — ডেমোর হিসাব যাচাই করার জন্য রাখা।
     বাংলাদেশি টিউটোরিয়ালের বাস্তব উদাহরণে এই নিয়মে হুবহু মিলেছে:
     করযোগ্য বেতন আয় ৬,৩৬,৩৬০ → কর ২৩,৬৩৬; বিনিয়োগ ১,২১,৮০০ → রেয়াত ১৮,২৭০ (১৫%);
     সিটি কর্পোরেশনের বাইরে ন্যূনতম কর ৩,০০০। */
  const AY_2025_2026 = {
    label: 'AY 2025-2026 (গত বছর — যাচাইয়ের জন্য)',
    threshold: { general: 350000, female_senior: 400000, disabled_third: 475000, freedom_fighter: 500000 },
    disabledChildRelief: 50000,
    slabs: [
      { width: 100000, rate: 0.05 },
      { width: 400000, rate: 0.10 },
      { width: 500000, rate: 0.15 },
      { width: 500000, rate: 0.20 },
      { width: 2000000, rate: 0.25 },
      { width: Infinity, rate: 0.30 }
    ],
    salaryExemption: { fraction: 1 / 3, ceiling: 450000 },
    rebate: { onInvestment: 0.15, onIncome: 0.03, ceiling: 1000000 },
    minimumTax: { standard: 5000, firstTime: 1000 },
    firstQuarterIncentive: 0
  };

  const RULES_KEY = 'ereturn-demo:rules';

  function load() {
    try {
      const raw = localStorage.getItem(RULES_KEY);
      if (!raw) return deepClone(DEFAULT_RULES);
      const saved = JSON.parse(raw);
      return reviveInfinity(merge(deepClone(DEFAULT_RULES), saved));
    } catch (e) {
      return deepClone(DEFAULT_RULES);
    }
  }

  function save(rules) {
    try {
      localStorage.setItem(RULES_KEY, JSON.stringify(rules, replacerInfinity));
    } catch (e) { /* ignore */ }
  }

  function reset() {
    try { localStorage.removeItem(RULES_KEY); } catch (e) {}
    return deepClone(DEFAULT_RULES);
  }

  function replacerInfinity(k, v) {
    return v === Infinity ? '__INF__' : v;
  }
  function reviveInfinity(o) {
    if (o === '__INF__') return Infinity;
    if (Array.isArray(o)) return o.map(reviveInfinity);
    if (o && typeof o === 'object') {
      Object.keys(o).forEach(k => { o[k] = reviveInfinity(o[k]); });
    }
    return o;
  }
  function deepClone(o) {
    if (Array.isArray(o)) return o.map(deepClone);
    if (o && typeof o === 'object') {
      const r = {};
      Object.keys(o).forEach(k => { r[k] = deepClone(o[k]); });
      return r;
    }
    return o;
  }
  function merge(base, patch) {
    if (!patch || typeof patch !== 'object') return base;
    Object.keys(patch).forEach(k => {
      if (Array.isArray(patch[k])) base[k] = patch[k];
      else if (patch[k] && typeof patch[k] === 'object') base[k] = merge(base[k] || {}, patch[k]);
      else base[k] = patch[k];
    });
    return base;
  }

  function preset(name) {
    if (name === '2025-2026') return merge(deepClone(DEFAULT_RULES), deepClone(AY_2025_2026));
    return deepClone(DEFAULT_RULES);
  }

  global.TaxRules = { DEFAULT: DEFAULT_RULES, AY_2025_2026, preset, load, save, reset, deepClone };
})(window);
