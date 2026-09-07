/* eReturn Demo — Ask AI
   ১) অফলাইন উত্তর: সব ফিল্ডের জ্ঞান + আপনার বর্তমান সংখ্যা থেকে সরাসরি উত্তর।
   ২) অনলাইন উত্তর: Gemini → Groq ফলব্যাক চেইন, মডেল অটো-ডিসকভারি সহ।
      একটা key/model শেষ হলে (429/404/quota) নিজে থেকেই পরেরটায় চলে যাবে।
   API key কখনও এই ফাইলে থাকে না — keys.local.js (gitignored) বা সেটিংস থেকে আসে।
*/
(function (global) {
  'use strict';

  const LS_KEYS = 'ereturn-demo:aikeys';
  const LS_MODELS = 'ereturn-demo:aimodels';
  const LS_STATE = 'ereturn-demo:aistate';
  const MODEL_TTL = 6 * 60 * 60 * 1000; // ৬ ঘণ্টা

  /* ---------------- Key management ---------------- */

  function savedKeys() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS) || 'null'); } catch (e) { return null; }
  }
  function setKeys(obj) {
    try { localStorage.setItem(LS_KEYS, JSON.stringify(obj)); } catch (e) {}
  }
  function allKeys() {
    const local = (global.ERETURN_LOCAL_KEYS || {});
    const saved = savedKeys() || {};
    const gemini = dedupe([].concat(local.gemini || [], saved.gemini || []));
    const groq = dedupe([].concat(local.groq || [], saved.groq || []));
    return { gemini, groq };
  }
  function dedupe(a) { return a.filter((v, i) => v && a.indexOf(v) === i); }
  function hasAnyKey() { const k = allKeys(); return k.gemini.length > 0 || k.groq.length > 0; }
  function maskKey(k) { return k ? k.slice(0, 8) + '…' + k.slice(-4) : ''; }

  /* ---------------- ব্যর্থ key/model মনে রাখা ---------------- */

  function state() {
    try { return JSON.parse(localStorage.getItem(LS_STATE) || '{}'); } catch (e) { return {}; }
  }
  function setState(s) { try { localStorage.setItem(LS_STATE, JSON.stringify(s)); } catch (e) {} }
  function markDead(id, minutes) {
    const s = state();
    s[id] = Date.now() + (minutes || 30) * 60000;
    setState(s);
  }
  function isDead(id) {
    const s = state();
    return s[id] && s[id] > Date.now();
  }
  function clearDead() { setState({}); }

  /* ---------------- মডেল ডিসকভারি ---------------- */

  function cachedModels(provider) {
    try {
      const c = JSON.parse(localStorage.getItem(LS_MODELS) || '{}');
      const e = c[provider];
      if (e && Date.now() - e.at < MODEL_TTL && e.models && e.models.length) return e.models;
    } catch (err) {}
    return null;
  }
  function cacheModels(provider, models) {
    try {
      const c = JSON.parse(localStorage.getItem(LS_MODELS) || '{}');
      c[provider] = { at: Date.now(), models };
      localStorage.setItem(LS_MODELS, JSON.stringify(c));
    } catch (e) {}
  }

  // Gemini মডেল নাম র‍্যাংকিং — নতুন/দ্রুত মডেল আগে
  function rankGemini(name) {
    let s = 0;
    if (/latest/.test(name)) s += 40;
    const m = name.match(/gemini-(\d+)\.?(\d+)?/);
    if (m) s += parseInt(m[1], 10) * 10 + (m[2] ? parseInt(m[2], 10) : 0);
    if (/flash/.test(name)) s += 6;          // দ্রুত ও ফ্রি কোটা বেশি
    if (/pro/.test(name)) s += 4;
    if (/lite/.test(name)) s += 2;
    if (/thinking|exp|preview/.test(name)) s -= 3;
    if (/embedding|aqa|imagen|veo|tts|image|vision-only/.test(name)) s -= 100;
    return s;
  }

  async function discoverGemini(key) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key);
    const res = await fetch(url);
    if (!res.ok) throw new Error('list-models ' + res.status);
    const j = await res.json();
    const models = (j.models || [])
      .filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
      .map(m => String(m.name).replace(/^models\//, ''))
      .filter(nm => !/embedding|aqa|imagen|veo|tts/i.test(nm))
      .sort((a, b) => rankGemini(b) - rankGemini(a));
    // ফলব্যাক হিসেবে সবসময় কাজ করা নামগুলো শেষে রাখি
    ['gemini-flash-latest', 'gemini-pro-latest'].forEach(nm => {
      if (models.indexOf(nm) < 0) models.push(nm);
    });
    return models.slice(0, 8);
  }

  async function geminiModels(key) {
    const c = cachedModels('gemini');
    if (c) return c;
    try {
      const m = await discoverGemini(key);
      cacheModels('gemini', m);
      return m;
    } catch (e) {
      return ['gemini-flash-latest', 'gemini-pro-latest'];
    }
  }

  function rankGroq(id) {
    let s = 0;
    if (/llama-3\.3|llama-4|llama3-70|70b/.test(id)) s += 10;
    if (/versatile/.test(id)) s += 5;
    if (/instant|8b/.test(id)) s += 3;
    if (/whisper|tts|guard|vision/.test(id)) s -= 100;
    return s;
  }

  async function groqModels(key) {
    const c = cachedModels('groq');
    if (c) return c;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: 'Bearer ' + key }
      });
      if (!res.ok) throw new Error('groq list ' + res.status);
      const j = await res.json();
      const models = (j.data || []).map(m => m.id)
        .filter(id => !/whisper|tts|guard/i.test(id))
        .sort((a, b) => rankGroq(b) - rankGroq(a))
        .slice(0, 6);
      if (models.length) { cacheModels('groq', models); return models; }
    } catch (e) {}
    return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  }

  /* ---------------- প্রোভাইডার কল ---------------- */

  async function callGemini(key, model, system, prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.05, topP: 0.8, maxOutputTokens: 2048 }
      })
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error('gemini ' + res.status + ' ' + body.slice(0, 200));
      err.status = res.status;
      throw err;
    }
    const j = await res.json();
    const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
    const text = parts.map(p => p.text || '').join('').trim();
    if (!text) throw new Error('gemini empty');
    return text;
  }

  async function callGroq(key, model, system, prompt) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model,
        temperature: 0.05,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error('groq ' + res.status + ' ' + body.slice(0, 200));
      err.status = res.status;
      throw err;
    }
    const j = await res.json();
    const text = (((j.choices || [])[0] || {}).message || {}).content || '';
    if (!text.trim()) throw new Error('groq empty');
    return text.trim();
  }

  /* ---------------- ফলব্যাক চেইন ---------------- */

  async function askOnline(system, prompt, onProgress) {
    const keys = allKeys();
    const attempts = [];

    for (const key of keys.gemini) {
      const models = await geminiModels(key);
      models.forEach(m => attempts.push({ provider: 'gemini', key, model: m }));
    }
    for (const key of keys.groq) {
      const models = await groqModels(key);
      models.forEach(m => attempts.push({ provider: 'groq', key, model: m }));
    }
    if (!attempts.length) throw new Error('no-key');

    const errors = [];
    for (const a of attempts) {
      const id = a.provider + '|' + a.key.slice(-6) + '|' + a.model;
      if (isDead(id)) continue;
      if (onProgress) onProgress(a.provider + ' · ' + a.model + ' (' + maskKey(a.key) + ') চেষ্টা করছি…');
      try {
        const text = a.provider === 'gemini'
          ? await callGemini(a.key, a.model, system, prompt)
          : await callGroq(a.key, a.model, system, prompt);
        return { text, via: a.provider + ' · ' + a.model };
      } catch (e) {
        errors.push(id + ' → ' + e.message);
        const st = e.status || 0;
        if (st === 429) markDead(id, 20);          // কোটা শেষ — কিছুক্ষণ বাদ
        else if (st === 404 || st === 400) markDead(id, 24 * 60); // মডেল নেই
        else if (st === 401 || st === 403) markDead(id, 24 * 60); // key খারাপ
        else markDead(id, 3);
        // মডেল ক্যাশ পুরনো হলে নতুন করে খুঁজি
        if (st === 404) { try { localStorage.removeItem(LS_MODELS); } catch (x) {} }
      }
    }
    const err = new Error('all-failed');
    err.details = errors;
    throw err;
  }

  /* ---------------- জ্ঞানভাণ্ডার (system prompt) ---------------- */

  // লাইভ eReturn-এর কোন পাতায় কী আছে
  const PAGE_MAP = [
    ['Regular e-Return → Assessment Information', '#/user-panel/assessment/regular-return',
      'Return Scheme, Assessment Year, Income Year, Resident Status, Tax Exempted Income (Yes/No), Heads of Income চেকবক্স, Voluntary Disclosure'],
    ['Additional Information (IT10B Requirements)', '#/user-panel/additional-information',
      'Gross Wealth over 50,00,000?, Own Motor Car?, Own Offshore Property?, Shareholder director of a company?, Have any House Property?'],
    ['Income → Employment', '#/user-panel/employment',
      'Employment Type, Name of the Employer, Designation, Shareholder Director, Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance, Festival Bonus, Add More (Arrear Salary, Education Allowance, Employer’s Contribution to RPF, Gratuity, Leave Allowance, Other Bonus, Overtime ইত্যাদি), Non-Cash Benefits (Rent Free Accommodation, Accommodation at Concessional Rate, Vehicle Facility Provided, Other Non-Cash Benefit)'],
    ['Income → Rent', '#/user-panel/rent',
      'Property Type, Address, Is it in any city corporation?, Area Occupied for Personal Use, Total Area, Residential/Commercial কলামে Area Rented Out, Rental Period, Annual Rent, Rent Received, Any Charge Paid by Tenant, Vacancy Allowance, Deductions (Insurance Premium, Interest paid on Loan/Mortgage, Municipal/Local Tax, Repair Collections, Pre-rental interest, Other), Special Rental Income'],
    ['Income → Agriculture', '#/user-panel/agriculture',
      'Agriculture Type, Total Cultivation Area, Particular of Produces, Maintain Books of Accounts?, Sales Proceed, Cost of Production, Other Allowable Deduction, Net Income'],
    ['Income → Business or Profession', '#/user-panel/business',
      'Business Category, Business Type, Business Name, Business Address, Sales/Turnover/Receipts, Cost of Goods Sold, Gross Profit, Expenses টেবিল, Net Profit, Balance Sheet Summary (Cash in Hand & at Bank, Inventories, Fixed Assets, Other Assets, Opening Capital, Withdrawals, Liabilities)'],
    ['Income → Capital Gains', '#/user-panel/capital-gain',
      'Type of Gains, Description of the Property, Location, Total Area, Date of Acquisition, TIN of Buyer, Sale Deed No, Date of Sale Deed, Sub Registrar Office, Sale Deed Value, Excess Amount Received Over Deed Value, Cost of Acquisition, Tax Deducted/Collected at Source'],
    ['Income → Financial Assets', '#/user-panel/financial-assets',
      'ধরন (Interest From Sanchayapatra, Interest/Profit Bank/FI, Treasury Bill/Bond/SUKUK, Dividend, Other Securities), Scheme Name, Registration No, Issue Date, Value, Gross Interest, TDS, Encashed'],
    ['Income → Other Sources', '#/user-panel/income-from-other-sources',
      'Income Type (Royalty, WPPF, License Fee, Technical Services, Cash Subsidy, Lottery, Meeting Fee/Honorarium, JV Profit Share, Any Other Income), Gross Payment Amount, Related Expenses, Net Income, TDS'],
    ['Income → Tax Exempted Income', '#/user-panel/tax-exempted-income',
      'Foreign Remittance, Software and IT Business, Tax Exempted Bond, Welfare Allowance, Rewards from Government, Income from Pension, Universal Pension Scheme, 6th Schedule Part 1, Exemption by SRO'],
    ['Rebate', '#/user-panel/rebate',
      'Life Insurance Premium, Deposit Pension Scheme (DPS), Approved Sanchayapatra & Other Govt. Securities, Unit Certificate/Mutual Fund/ETF, Listed Stocks or Shares, General Provident Fund (GPF), Recognized Provident Fund (RPF), Approved Superannuation Fund, Benevolent Fund & Group Insurance, Zakat Fund, Universal Pension Scheme, Others'],
    ['Expenditure (IT-10BB)', '#/user-panel/expenditure',
      'Expenses for Food Clothing, Accommodation Expense, Auto and Transportation (Driver’s Salary Fuel Maintenance, Other Transportation), Household and Utility (Electricity, Gas Water Sewer Garbage, Phone Internet TV, Home-Support Stuff), Education Expenses, Festival And Other Special (Festival Party Events, Domestic and Overseas Tour, Philanthropy, Other Special), Any Other Expenses, Tax Charges Paid, Interest Payment of Personal Loan, Environmental Surcharge'],
    ['Assets & Liabilities (IT-10B)', '#/user-panel/assets-and-liabilities',
      'Business Capital, Director’s Shareholdings, Capital of Partnership Firm, Non-Agricultural Property, Advance Made for Non-Agricultural Property, Agricultural Property, Financial Assets (Share/Debenture/Bond, Sanchayapatra, Fixed Deposits, DPS, Loans Given to Others, Provident Fund, Other), Motor Car, Gold Diamond Gems, Furniture Equipments Electronics, Other Assets of Significant Value, Cash in Hand, Banks Cards Electronic Cash, Other Deposits, Asset Outside Bangladesh, Liabilities (Borrowing from Bank or FI, Unsecured Loan, Other Loan or Overdraft), Summary (Gross Wealth, Net Wealth, Previous Year Net Wealth, Change in Net Wealth, Other Fund Outflow, Source of Fund, Difference)'],
    ['Tax & Payment', '#/user-panel/tax-and-payment',
      'Particulars of Total Income, Tax Computation (Gross Tax before Rebate, Tax Rebate on Investment, Tax after Rebate, Minimum Payable Tax, Net Tax after Rebate, Surcharge, Total Amount Payable), Payment (Source Tax, Advance Income Tax, Tax Paid With Return, Environment Surcharge, Adjustment of Tax Refund, Carry forwarded amount), Final Payable'],
    ['Return View', '#/user-panel/return-view', 'পূরণ করা পুরো রিটার্নের প্রিভিউ']
  ];

  function knowledgeBase(rules) {
    const R = rules || TaxRules.load();
    const lines = [];
    lines.push('### বাংলাদেশ eReturn (etaxnbr.gov.bd) — করবর্ষ ' + R.label);
    lines.push('আয়বর্ষ: ০১-০৭-২০২৫ থেকে ৩০-০৬-২০২৬।');
    lines.push('');
    lines.push('#### করমুক্ত সীমা');
    lines.push('- সাধারণ (পুরুষ): ' + TaxCalc.fmt(R.threshold.general));
    lines.push('- নারী ও ৬৫+: ' + TaxCalc.fmt(R.threshold.female_senior));
    lines.push('- প্রতিবন্ধী/তৃতীয় লিঙ্গ: ' + TaxCalc.fmt(R.threshold.disabled_third));
    lines.push('- গেজেটেড মুক্তিযোদ্ধা/জুলাই যোদ্ধা: ' + TaxCalc.fmt(R.threshold.freedom_fighter));
    lines.push('- প্রতিবন্ধী সন্তান প্রতি অতিরিক্ত: ' + TaxCalc.fmt(R.disabledChildRelief));
    lines.push('');
    lines.push('#### স্ল্যাব (করমুক্ত সীমার উপরে)');
    R.slabs.forEach(s => {
      lines.push('- ' + (s.width === Infinity ? 'অবশিষ্ট' : 'পরবর্তী ' + TaxCalc.fmt(s.width)) +
        ' → ' + (s.rate * 100) + '%');
    });
    lines.push('');
    lines.push('#### গুরুত্বপূর্ণ নিয়ম');
    lines.push('- বেতন ছাড় (বেসরকারি): মোট বেতনের ১/৩ অথবা ' + TaxCalc.fmt(R.salaryExemption.ceiling) + ' — যেটি কম।');
    lines.push('- সরকারি বেতন কাঠামো: বাড়ি ভাড়া/চিকিৎসা/যাতায়াত ভাতা সম্পূর্ণ করমুক্ত।');
    lines.push('- বিনিয়োগ রেয়াত = সর্বনিম্ন { অনুমোদিত বিনিয়োগের ' + (R.rebate.onInvestment * 100) +
      '%, মোট আয়ের ' + (R.rebate.onIncome * 100) + '%, ' + TaxCalc.fmt(R.rebate.ceiling) + ' }।');
    lines.push('  → তাই সর্বোচ্চ রেয়াত পেতে মোট আয়ের প্রায় ' +
      ((R.rebate.onIncome / R.rebate.onInvestment) * 100).toFixed(0) + '% বিনিয়োগ করলেই যথেষ্ট।');
    lines.push('- DPS রেয়াতযোগ্য সর্বোচ্চ ১,২০,০০০/বছর। জীবন বীমা প্রিমিয়াম পলিসি মূল্যের ১০% পর্যন্ত।');
    lines.push('- ন্যূনতম কর ' + TaxCalc.fmt(R.minimumTax.standard) + ' (নতুন করদাতা ' +
      TaxCalc.fmt(R.minimumTax.firstTime) + ')। আয় করমুক্ত সীমা ছাড়ালে রেয়াত দিয়ে কর ০ করা গেলেও ন্যূনতম কর দিতেই হবে।');
    lines.push('- বাড়ি ভাড়ায় মেরামত খরচ: আবাসিক ২৫%, বাণিজ্যিক ৩০% (স্বয়ংক্রিয়, ভাউচার লাগে না)।');
    lines.push('- কৃষিতে হিসাবের বই না থাকলে বিক্রয়ের ৬০% উৎপাদন খরচ ধরা হয়।');
    lines.push('- সঞ্চয়পত্র ও ট্রেজারি বিল/বন্ডের সুদ চূড়ান্ত করদায় — ১০% উৎস করই চূড়ান্ত।');
    lines.push('- নিট সম্পদ সারচার্জ: ৪ কোটি পর্যন্ত ০; ৪–১০ কোটি ১০%; ১০–২০ কোটি ২০%; ২০–৫০ কোটি ৩০%; ৫০ কোটির উপরে ৩৫%। ' +
      'একাধিক গাড়ি বা সিটি কর্পোরেশনে ৮,০০০ বর্গফুটের বেশি বাড়ি থাকলে ন্যূনতম ১০%।');
    lines.push('- প্রথম কোয়ার্টারে (৩০ সেপ্টেম্বরের মধ্যে) রিটার্ন দিলে প্রদেয় করের ' +
      (R.firstQuarterIncentive * 100) + '% প্রণোদনা।');
    lines.push('- মোট সম্পদ ' + TaxCalc.fmt(R.grossWealthLimit) + ' ছাড়ালে, গাড়ি থাকলে, ' +
      'সিটি কর্পোরেশনে বাড়ি থাকলে বা শেয়ারহোল্ডার পরিচালক হলে IT-10B বাধ্যতামূলক।');
    lines.push('');
    lines.push('#### লাইভ সাইটের পাতা ও ঘর');
    PAGE_MAP.forEach(([title, url, fields]) => {
      lines.push('- **' + title + '** (' + url + '): ' + fields);
    });
    lines.push('');
    if (global.RefInfo) lines.push(RefInfo.asText());
    lines.push('');
    if (global.SiteMap) lines.push(SiteMap.asText());
    lines.push('');
    if (global.Knowledge) {
      lines.push('### "আমার X আছে — কোথায় দেখাব?" রাউটিং');
      Knowledge.ROUTING.forEach(r => {
        lines.push('- **' + r.what + '** → ' + r.head + ' (ডেমো পাতা: ' + r.page + ')');
        lines.push('  ' + r.how.replace(/\n/g, '\n  '));
        if (r.goto) lines.push('  নেভিগেশন কী: ' + r.goto.map(g => '[[goto:' + g + ']]').join(' '));
      });
      lines.push('');
      lines.push(Knowledge.asText());
    }
    lines.push('');
    lines.push('#### প্রতিটি ঘরের অর্থ, কর-প্রভাব ও নেভিগেশন কী');
    lines.push('(নিচের প্রতিটি লাইনে: `key` = নেভিগেশন কী | ঘরের নাম | কোন পাতায় | কী বোঝায় | ' +
      'কর হিসাবে যায় কি না | বেশি দিলে কর বাড়ে/কমে | কীসের সাথে মিলতে হবে)');
    const EFF = { up: 'বেশি দিলে কর কমে', down: 'বেশি দিলে কর বাড়ে', none: 'করে প্রভাব নেই' };
    Object.keys(FieldHelp).forEach(k => {
      const h = FieldHelp[k];
      lines.push('- `' + k + '` | ' + h.t + ' | পাতা: ' + (h.page || '-') + ' | ' +
        (h.what || h.d || '').replace(/\n/g, ' ') +
        (h.how ? ' | কীভাবে: ' + h.how.replace(/\n/g, ' ') : '') +
        (h.typical ? ' | সাধারণত: ' + h.typical.replace(/\n/g, ' ') : '') +
        (h.example ? ' | উদাহরণ: ' + h.example.replace(/\n/g, ' ') : '') +
        (h.mistake ? ' | ভুল: ' + h.mistake.replace(/\n/g, ' ') : '') +
        (h.counts ? ' | ' + h.counts : '') +
        (EFF[h.effect] ? ' | ' + EFF[h.effect] : '') +
        (h.match ? ' | মিলতে হবে: ' + h.match.replace(/\n/g, ' ') : ''));
    });
    return lines.join('\n');
  }

  function gotoKeys() {
    return Object.keys(FieldHelp).filter(k => FieldHelp[k].path);
  }

  function userSnapshot(data, res) {
    const f = TaxCalc.fmt;
    const heads = Object.keys(data.assessment.heads).filter(k => data.assessment.heads[k]);
    return [
      '#### এই ব্যবহারকারীর বর্তমান ডেমো ডেটা',
      'করদাতার শ্রেণি: ' + data.taxpayer.category + ' | করমুক্ত সীমা: ' + f(res.threshold),
      'নির্বাচিত আয়ের খাত: ' + (heads.join(', ') || 'কোনোটি নয়'),
      'বেতন (মোট/ছাড়/করযোগ্য): ' + f(res.emp.gross) + ' / ' + f(res.emp.exempt) + ' / ' + f(res.emp.taxable),
      'বাড়ি ভাড়া আয়: ' + f(res.rent.taxable) + ' | কৃষি: ' + f(res.agri.taxable) +
        ' | ব্যবসা: ' + f(res.biz.taxable) + ' | মূলধনী মুনাফা: ' + f(res.cg.taxable) +
        ' | আর্থিক সম্পদ: ' + f(res.fin.taxable + res.fin.finalTaxIncome) + ' | অন্যান্য: ' + f(res.oth.taxable),
      'মোট আয়: ' + f(res.totalIncome) + ' | করমুক্ত আয়: ' + f(res.exemptedIncome),
      'স্ল্যাব কর: ' + f(res.slab.tax) + ' | অনুমোদিত বিনিয়োগ: ' + f(res.investment.allowable) +
        ' | রেয়াত: ' + f(res.rebateOnInvestment),
      'রেয়াতের পর কর: ' + f(res.taxAfterRebate) + ' | ন্যূনতম কর: ' + f(res.minTax) +
        ' | নিট কর: ' + f(res.netTaxAfterRebate),
      'নিট সম্পদ: ' + f(res.netWealth) + ' | সারচার্জ: ' + f(res.surcharge),
      'মোট প্রদেয়: ' + f(res.totalAmountPayable) + ' | পরিশোধিত: ' + f(res.totalPayments) +
        ' | এখনো দিতে হবে: ' + f(res.netPayable) + ' | ফেরতযোগ্য: ' + f(res.refundable),
      'জীবনযাত্রার ব্যয়: ' + f(res.lifestyleExpense) + ' | তহবিল পার্থক্য: ' + f(res.fundDifference) +
        (res.fundDifference < 0 ? ' (⚠️ ঘাটতি)' : '')
    ].join('\n');
  }

  function systemPrompt(data, res, rules) {
    return [
      'আপনি বাংলাদেশের NBR eReturn (etaxnbr.gov.bd) পূরণের একজন অভিজ্ঞ কর পরামর্শক।',
      'ব্যবহারকারী একটি ডেমো সাইটে অনুশীলন করছেন যেটি লাইভ eReturn-এর হুবহু নকল।',
      '',
      '## ⛔ নির্ভুলতার কঠোর নিয়ম (সবার আগে)',
      '- **নিচের জ্ঞানভাণ্ডারে যা আছে কেবল তাই বলবেন।** বাইরের কিছু মনে করে বলবেন না।',
      '- ঘরের নাম, ড্রপডাউনের অপশন, পাতার নাম — **হুবহু** জ্ঞানভাণ্ডার থেকে নেবেন। কখনও বানাবেন না।',
      '  তালিকায় নেই এমন কোনো ঘর/অপশন/বোতামের নাম বললে সেটা ভুল উত্তর।',
      '- সংখ্যা (করমুক্ত সীমা, স্ল্যাব হার, রেয়াতের হার/সিলিং, ন্যূনতম কর, সীমা) — শুধু নিচে দেওয়া',
      '  মানগুলোই ব্যবহার করবেন। স্মৃতি থেকে অন্য কোনো হার বলবেন না।',
      '- ব্যবহারকারীর হিসাব বলতে হলে নিচের "বর্তমান ডেটা" অংশের সংখ্যাই বলবেন — নিজে নতুন করে গুনবেন না।',
      '- জরিমানার অঙ্ক, SRO নম্বর, ধারা নম্বর, নির্দিষ্ট তারিখ — জ্ঞানভাণ্ডারে না থাকলে **বলবেন না**।',
      '- প্রশ্নের উত্তর জ্ঞানভাণ্ডারে না থাকলে সোজা লিখবেন:',
      '  "এই বিষয়টা ডেমোর জ্ঞানভাণ্ডারে নেই — NBR হেল্পলাইন বা একজন কর আইনজীবীর কাছে যাচাই করে নিন।"',
      '  আন্দাজে উত্তর দেওয়ার চেয়ে "জানি না" বলা অনেক ভালো।',
      '- কোনো বিষয়ে দুই রকম নিয়ম থাকতে পারলে (যেমন খামারের আয় Business না Agriculture) — দুটোই বলবেন',
      '  এবং যাচাই করে নিতে বলবেন। এক পক্ষ নিয়ে জোর দিয়ে বলবেন না।',
      '- ভুয়া কাগজ, আয় গোপন, গোঁজামিল দিয়ে Difference শূন্য করা — এসব কখনও বলবেন না।',
      '',
      '## উত্তর দেওয়ার নিয়ম',
      '১. সহজ বাংলায় লিখুন — ধরে নিন পাঠক কর সম্পর্কে কিছুই জানেন না।',
      '২. সবসময় বলুন: কোন পাতায় যেতে হবে → কোন ঘরে → কী মান বসাতে হবে → কেন।',
      '৩. **সবচেয়ে গুরুত্বপূর্ণ:** যখনই কোনো নির্দিষ্ট ঘরের কথা বলবেন, ঠিক তার পরেই লিখুন',
      '   `[[goto:key]]` — যেখানে key হলো নিচের তালিকার নেভিগেশন কী।',
      '   এতে ব্যবহারকারী বোতাম চেপে সরাসরি ওই ঘরে পৌঁছে যাবেন, তীর দিয়ে দেখানো হবে।',
      '   একাধিক ঘর বললে প্রতিটির পরেই আলাদা করে `[[goto:...]]` দিন — তখন "ধাপে ধাপে দেখান" বোতাম আসবে।',
      '   উদাহরণ: "মূল বেতনের ঘরে বার্ষিক অঙ্ক লিখুন [[goto:basicSalary]] তারপর বাড়ি ভাড়া ভাতা [[goto:houseRentAllowance]]"',
      '   শুধু তালিকায় থাকা key ব্যবহার করবেন, নিজে key বানাবেন না।',
      '৪. প্রতিটি ঘরের ক্ষেত্রে বলুন — এটা কর হিসাবে যায় কি না, বেশি দিলে কর বাড়ে না কমে,',
      '   আর কোন কাগজ/গত বছরের রিটার্নের সাথে মিলতে হবে।',
      '৫. ব্যবহারকারীর এখনকার সংখ্যা ব্যবহার করে উত্তর দিন (নিচে দেওয়া আছে)।',
      '৬. শুধু বৈধ কর পরিকল্পনা। ভুয়া কাগজ, আয় গোপন বা গোঁজামিলের পরামর্শ কখনও নয়।',
      '৭. নিশ্চিত না হলে স্পষ্ট বলুন যে NBR/কর আইনজীবীর কাছে যাচাই করতে।',
      '৮. উত্তর সংক্ষিপ্ত ও কাজের — বুলেট পয়েন্টে।',
      '',
      '## ব্যবহারযোগ্য নেভিগেশন কী (এর বাইরে কোনো key লিখবেন না)',
      gotoKeys().join(', '),
      '',
      (global.Choices ? Choices.asText() : ''),
      '',
      knowledgeBase(rules),
      '',
      userSnapshot(data, res),
      '',
      currentWarnings(data, res, rules)
    ].join('\n');
  }

  function currentWarnings(data, res, rules) {
    if (!global.Validate) return '';
    let w = [];
    try { w = Validate.check(data, res, rules); } catch (e) { return ''; }
    if (!w.length) return '#### এখন কোনো অসঙ্গতি ধরা পড়েনি।';
    return '#### ডেমো এখন যেসব অসঙ্গতি ধরেছে (প্রশ্নের সাথে মিললে এগুলো উল্লেখ করুন)\n' +
      w.slice(0, 20).map(x => '- [' + x.level + '] ' + x.path + ' → ' + x.msg.replace(/\n/g, ' ')).join('\n');
  }

  /* ---------------- অফলাইন উত্তর ইঞ্জিন ---------------- */

  const OFFLINE_RULES = [
    {
      k: ['কর ০', 'কর শূন্য', 'শুন্য', 'zero tax', 'tax 0', 'কর দিতে হবে না', 'কর মাফ'],
      a: (d, res, R) => {
        const f = TaxCalc.fmt;
        if (res.totalIncome <= res.threshold) {
          return '✅ আপনার কর এখনই **০ টাকা** — মোট আয় ' + f(res.totalIncome) +
            ', করমুক্ত সীমা ' + f(res.threshold) + '। তবু রিটার্ন জমা দিতে হবে।';
        }
        const t = TaxAdvisor.investmentTargets(res, R);
        return '**কর ০ করার আসল নিয়ম:**\n\n' +
          '১. স্ল্যাব কর ০ করা যায় বিনিয়োগ রেয়াত দিয়ে। আপনার স্ল্যাব কর ' + f(res.grossTaxBeforeRebate) +
          ' টাকা। ' + (t.canZeroByRebate
            ? 'Rebate পাতায় মোট ' + f(t.investForZero) + ' টাকা অনুমোদিত বিনিয়োগ দেখালে এটি ০ হয়ে যাবে।'
            : 'কিন্তু রেয়াতের সর্বোচ্চ সীমা ' + f(t.maxRebate) + ' টাকা, তাই পুরোটা ০ করা যাবে না।') + '\n' +
          '২. ⚠️ কিন্তু আয় করমুক্ত সীমা (' + f(res.threshold) + ') ছাড়ালে **ন্যূনতম কর ' +
          f(res.minTax) + ' টাকা** দিতেই হবে — রেয়াত যতই হোক।\n' +
          '৩. অর্থাৎ সত্যিকারের ০ টাকা কর তখনই, যখন মোট আয় ' + f(res.threshold) + ' টাকার নিচে থাকে।\n\n' +
          '**কোথায় দিতে হবে:** Rebate পাতায় (Investment Category) DPS/সঞ্চয়পত্র/জীবন বীমা/শেয়ার/GPF-RPF ' +
          'যেটা প্রযোজ্য সেটায় টিক দিয়ে অঙ্ক বসান।';
      }
    },
    {
      k: ['কত বিনিয়োগ', 'বিনিয়োগ কত', 'rebate', 'রেয়াত', 'investment'],
      a: (d, res, R) => {
        const f = TaxCalc.fmt;
        const t = TaxAdvisor.investmentTargets(res, R);
        return '**বিনিয়োগ রেয়াতের হিসাব**\n\n' +
          'রেয়াত = সর্বনিম্ন { বিনিয়োগের ' + (R.rebate.onInvestment * 100) + '%, মোট আয়ের ' +
          (R.rebate.onIncome * 100) + '%, ' + f(R.rebate.ceiling) + ' }\n\n' +
          '- আপনার মোট আয়: ' + f(res.totalIncome) + '\n' +
          '- সর্বোচ্চ সম্ভব রেয়াত: **' + f(t.maxRebate) + ' টাকা**\n' +
          '- সেটা পেতে বিনিয়োগ লাগবে: **' + f(t.investForMax) + ' টাকা** (আয়ের ~' +
          t.optimalPercentOfIncome.toFixed(0) + '%)\n' +
          '- এখন দেখিয়েছেন: ' + f(t.alreadyInvested) + '\n' +
          (t.moreNeededForMax > 0 ? '- আরও দরকার: **' + f(t.moreNeededForMax) + ' টাকা**\n' : '- ✅ পূর্ণ হয়ে গেছে\n') +
          '\n**কোথায়:** Rebate পাতা → Investment Category। DPS বছরে সর্বোচ্চ ১,২০,০০০; ' +
          'জীবন বীমা প্রিমিয়াম পলিসি মূল্যের ১০% পর্যন্ত। বিনিয়োগ ৩০ জুনের মধ্যে করতে হবে।';
      }
    },
    {
      k: ['বেতন', 'salary', 'basic', 'মূল বেতন', 'ভাতা'],
      a: (d, res, R) => {
        const f = TaxCalc.fmt;
        return '**বেতন কোথায় দেবেন:** Income → Employment পাতা।\n\n' +
          '- Employment Type: সরকারি হলে "Government Pay Scale", বেসরকারি হলে "Private/Other than Government Pay Scale"।\n' +
          '- Basic Salary, House Rent Allowance, Medical Allowance, Conveyance Allowance, Festival Bonus — ' +
          'সবই **বার্ষিক** অঙ্ক (১২ মাসের যোগফল), মাসিক নয়।\n' +
          '- বাকি উপাদান (বকেয়া বেতন, ওভারটাইম, RPF-এ অফিসের চাঁদা) "Add More" ড্রপডাউন থেকে যোগ করুন।\n' +
          '- অফিসের গাড়ি/বাসা পেলে ডান পাশে Non-Cash Benefits-এ দিন।\n\n' +
          '**ছাড়:** বেসরকারিতে মোট বেতনের ১/৩ বা ' + f(R.salaryExemption.ceiling) + ' — যেটি কম। ' +
          'আপনার এখনকার হিসাব: মোট ' + f(res.emp.gross) + ' → ছাড় ' + f(res.emp.exempt) +
          ' → করযোগ্য ' + f(res.emp.taxable) + '।\n' +
          'বেতন সনদ (Salary Certificate) দেখে হুবহু বসান — অমিল হলে পরে সমস্যা।';
      }
    },
    {
      k: ['বাড়ি ভাড়া', 'rent', 'ভাড়া আয়', 'house property'],
      a: () => '**বাড়ি ভাড়া:** Income → Rent পাতা।\n\n' +
        '- Property Type → House Property; ঠিকানা ও সিটি কর্পোরেশন কিনা দিন।\n' +
        '- Residential/Commercial কলামে Annual Rent (চুক্তির ভাড়া) ও Rent Received (বাস্তবে পাওয়া) দিন — ' +
        'যেটি বেশি সেটিই আয় ধরা হবে।\n' +
        '- Deductions-এ: পৌরকর, বীমা প্রিমিয়াম, **গৃহঋণের সুদ** (ব্যাংক সনদ নিন — বড় ছাড়)।\n' +
        '- "Repair, Collections" ঘরটি নিজে থেকেই পূরণ হয় — আবাসিকে ২৫%, বাণিজ্যিকে ৩০%। ভাউচার লাগে না।\n' +
        '- ফেরতযোগ্য জামানত থাকলে Special Rental Income-এ দিন (বছরশেষ স্থিতির ১০% আয় ধরা হয়)।'
    },
    {
      k: ['সম্পদ', 'asset', 'liabilit', 'it10b', 'it-10b', 'দায়', 'net wealth', 'নিট সম্পদ'],
      a: (d, res) => {
        const f = TaxCalc.fmt;
        return '**সম্পদ ও দায়:** Assets & Liabilities (IT-10B) পাতা।\n\n' +
          '- সম্পদ **ক্রয়মূল্যে** লিখুন, বাজারমূল্যে নয়।\n' +
          '- "Net Wealth at the Last Date of Previous Income Year"-এ গত বছরের রিটার্নের নিট সম্পদ হুবহু বসান।\n' +
          '- সব দায় (গৃহঋণ, ব্যাংক ঋণ, আত্মীয়ের ঋণ) দেখান — নিট সম্পদ কমে, সারচার্জও কমতে পারে।\n\n' +
          'আপনার এখনকার হিসাব: মোট সম্পদ ' + f(res.grossWealth) + ', দায় ' + f(res.totalLiabilities) +
          ', নিট সম্পদ ' + f(res.netWealth) + '।\n' +
          (res.fundDifference < 0
            ? '⚠️ তহবিলে ঘাটতি ' + f(Math.abs(res.fundDifference)) +
              ' টাকা — লাইভ সাইট এখানে "You have shortage of fund" বলে আটকাবে। ' +
              'গত বছরের নিট সম্পদ, করমুক্ত আয় ও Other Receipts ঠিক করুন।'
            : '✅ তহবিলের হিসাব মিলেছে।');
      }
    },
    {
      k: ['খরচ', 'expenditure', 'it10bb', 'ব্যয়', 'lifestyle'],
      a: () => '**জীবনযাত্রার ব্যয়:** Expenditure (IT-10BB) পাতা।\n\n' +
        'খাওয়া-পরা, বাসা ভাড়া, গাড়ি/যাতায়াত, বিদ্যুৎ-গ্যাস-পানি, ফোন/ইন্টারনেট, শিক্ষা, উৎসব, ভ্রমণ, দান — ' +
        'প্রতিটি বাস্তব অঙ্কে দিন। ⚠️ ০ দেখাবেন না — অবাস্তব খরচ অডিটে পড়ার বড় কারণ। ' +
        'তীর চিহ্নওয়ালা সারিগুলোয় ক্লিক করলে ভেতরের উপ-ঘরগুলো খুলবে; মোট নিজে থেকেই যোগ হবে।'
    },
    {
      k: ['tds', 'উৎসে', 'source tax', 'উৎস কর', 'কর কেটে'],
      a: (d, res) => '**উৎসে কাটা কর:** Tax & Payment পাতা → Payment অংশ → Source Tax ঘর।\n\n' +
        'বেতনের TDS, ব্যাংক সুদের TDS, সঞ্চয়পত্রের ১০%, গাড়ির অগ্রিম কর, জমি রেজিস্ট্রেশনের কর — ' +
        'সব যোগ করে বসান। এটি প্রদেয় কর থেকে সরাসরি বাদ যায়।\n' +
        'আপনার এন্ট্রি থেকে পাওয়া গেছে ' + TaxCalc.fmt(res.sourceTaxAuto) + ' টাকা। ' +
        '⚠️ TDS সনদ ছাড়া দাবি করবেন না।'
    },
    {
      k: ['সঞ্চয়পত্র', 'sanchayapatra', 'sanchay'],
      a: () => '**সঞ্চয়পত্র দুই জায়গায় যায়:**\n\n' +
        '১. **আয়** — Income → Financial Assets → "Interest From Sanchayapatra"। ' +
        'Scheme Name, Registration No, Issue Date, Value, Gross Interest, TDS দিন। ' +
        'এই সুদ চূড়ান্ত করদায় — ১০% উৎস করই চূড়ান্ত, স্ল্যাব হারে আবার কর বসে না।\n' +
        '২. **বিনিয়োগ রেয়াত** — এই বছরে নতুন কেনা হলে Rebate → "Approved Sanchayapatra & Other Govt. Securities"।\n' +
        '৩. **সম্পদ** — Assets & Liabilities → Financial Assets → Sanchayapatra-তে মোট মূল্য।'
    },
    {
      k: ['dps', 'ডিপিএস'],
      a: () => '**DPS তিন জায়গায়:**\n\n' +
        '১. Rebate → Deposit Pension Scheme (DPS): Bank/FI, Account No, Deposit Amount। ' +
        '⚠️ বছরে সর্বোচ্চ **১,২০,০০০ টাকা** রেয়াতযোগ্য (একাধিক DPS থাকলেও মোট এতটুকুই)।\n' +
        '২. Assets & Liabilities → Financial Assets → DPS: বছরশেষ জমার স্থিতি।\n' +
        '৩. Expenditure-এ DPS আলাদা করে দিতে হয় না (এটি খরচ নয়, সঞ্চয়)।'
    },
    {
      k: ['কোথায় শুরু', 'শুরু করব', 'প্রথমে', 'কিভাবে পূরণ', 'কীভাবে পূরণ', 'step'],
      a: () => '**ধাপে ধাপে:**\n\n' +
        '১. Assessment — আয়ের খাতে টিক দিন (যেটায় টিক দেবেন সেটার পাতা আসবে)।\n' +
        '২. Additional Information — IT10B লাগবে কিনা ঠিক হয়।\n' +
        '৩. Income — প্রতিটি খাতের আয় দিন।\n' +
        '৪. Rebate — বিনিয়োগ দিন (এখানেই সবচেয়ে বেশি কর বাঁচে)।\n' +
        '৫. Expenditure — জীবনযাত্রার ব্যয়।\n' +
        '৬. Assets & Liabilities — সম্পদ ও দায়; "Difference" ০ বা ধনাত্মক রাখতে হবে।\n' +
        '৭. Tax & Payment — কর ও পরিশোধ।\n' +
        '৮. Return View — মিলিয়ে দেখুন।\n\n' +
        'ডেমোতে সব মিলে গেলে "লাইভে কী লিখবেন" পাতা খুলে সেটা দেখে দেখে লাইভে বসান।'
    }
  ];

  function offlineAnswer(question, data, res, rules) {
    const q = (question || '').toLowerCase();

    // "আমার X আছে — কোথায় দেখাব?" — সবার আগে এটি দেখি
    if (global.Knowledge) {
      const hits = Knowledge.route(q);
      if (hits.length) {
        return hits.slice(0, 2).map(r =>
          '**' + r.what + ' → ' + r.head + '**\n\n' + r.how +
          (r.goto ? '\n\n' + r.goto.map(g => '[[goto:' + g + ']]').join(' ') : '')
        ).join('\n\n---\n\n');
      }
    }

    // লাইভ সাইটের কোন ঘর — সাইটম্যাপে খুঁজি
    if (global.SiteMap && q.length > 3) {
      const ff = SiteMap.findField(q);
      if (ff.length) {
        return ff.slice(0, 3).map(x =>
          '**' + x.label + '**\n' +
          'পাতা: ' + x.page.title + '\n' +
          'সেকশন: ' + x.section + '\n' +
          (x.note ? x.note + '\n' : '') +
          (x.help && FieldHelp[x.help] && FieldHelp[x.help].path ? '\n[[goto:' + x.help + ']]' : '')
        ).join('\n\n---\n\n');
      }
    }

    for (const r of OFFLINE_RULES) {
      if (r.k.some(k => q.indexOf(k.toLowerCase()) >= 0)) {
        return r.a(data, res, rules);
      }
    }
    // কোনো ফিল্ডের নাম মিলে গেলে তার ব্যাখ্যা
    const hits = Object.keys(FieldHelp).filter(k => {
      const h = FieldHelp[k];
      return q.length > 2 && (h.t.toLowerCase().indexOf(q) >= 0 || q.indexOf(h.t.toLowerCase()) >= 0);
    });
    if (hits.length) {
      return hits.slice(0, 3).map(k => {
        const h = FieldHelp[k];
        return '**' + h.t + '**\n' + h.d + (h.e ? '\n\n💡 ' + h.e : '');
      }).join('\n\n---\n\n');
    }
    // পাতা খোঁজা
    const page = PAGE_MAP.find(p => q && (p[0].toLowerCase().indexOf(q) >= 0 || p[2].toLowerCase().indexOf(q) >= 0));
    if (page) return '**' + page[0] + '**\nলাইভ ঠিকানা: ' + page[1] + '\nএই পাতার ঘরগুলো: ' + page[2];

    return 'অফলাইন উত্তরে এই প্রশ্নটা মিলল না। কয়েকটা নমুনা প্রশ্ন:\n\n' +
      '- "কর ০ করব কীভাবে?"\n- "কত টাকা বিনিয়োগ করলে সর্বোচ্চ রেয়াত?"\n' +
      '- "বেতন কোথায় দেব?"\n- "সঞ্চয়পত্র কোথায় লিখব?"\n- "DPS কোথায়?"\n- "সম্পদের হিসাব মিলছে না"\n\n' +
      '💡 আরও ভালো উত্তরের জন্য উপরে ⚙️ থেকে API key দিন — তখন সত্যিকারের AI উত্তর দেবে।';
  }

  /* ---------------- পাবলিক API ---------------- */

  /* ---------------- উত্তর যাচাই (ভুল ঠেকানোর শেষ ধাপ) ---------------- */

  const BN_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  function toAscii(s) { return String(s).replace(/[০-৯]/g, d => BN_DIGITS[d]); }

  function verify(text, res, rules) {
    const notes = [];
    let clean = text;

    // ১) ভুয়া নেভিগেশন কী বাদ দিই
    const valid = new Set(gotoKeys());
    clean = clean.replace(/\[\[goto:([A-Za-z0-9_]+)\]\]/g, (m, k) => {
      if (valid.has(k)) return m;
      notes.push('একটি ভুল নেভিগেশন লিংক বাদ দেওয়া হয়েছে।');
      return '';
    });

    // ২) করমুক্ত সীমা নিয়ে ভুল সংখ্যা বললে ধরি
    const ascii = toAscii(clean).replace(/,/g, '');
    const allowedThresholds = Object.keys(rules.threshold).map(k => rules.threshold[k]);
    const near = ascii.match(/(করমুক্ত\s*সীমা|threshold)[^0-9]{0,40}(\d{5,8})/g) || [];
    near.forEach(seg => {
      const num = +(seg.match(/(\d{5,8})$/) || [])[1];
      if (!num) return;
      const ok = allowedThresholds.some(t => Math.abs(t - num) < 1) ||
        allowedThresholds.some(t => Math.abs((t + rules.disabledChildRelief * 3) - num) < 1) ||
        Math.abs(num - res.threshold) < 1;
      if (!ok) {
        notes.push('⚠️ উত্তরে করমুক্ত সীমা হিসেবে ' + TaxCalc.fmt(num) +
          ' বলা হয়েছে — কিন্তু এই ডেমোর নিয়মে আপনার সীমা ' + TaxCalc.fmt(res.threshold) + ' টাকা।');
      }
    });

    // ৩) রেয়াতের হার নিয়ে ভুল বললে ধরি
    const rebPct = ascii.match(/(রেয়াত|rebate)[^0-9%]{0,50}(\d{1,2})\s*%/g) || [];
    const allowedPct = [rules.rebate.onInvestment * 100, rules.rebate.onIncome * 100];
    rebPct.forEach(seg => {
      const p = +(seg.match(/(\d{1,2})\s*%$/) || [])[1];
      if (!p) return;
      if (!allowedPct.some(a => Math.abs(a - p) < 0.5)) {
        notes.push('⚠️ উত্তরে রেয়াতের হার ' + p + '% বলা হয়েছে — এই ডেমোর নিয়মে হার ' +
          (rules.rebate.onInvestment * 100) + '% (বিনিয়োগের) ও ' +
          (rules.rebate.onIncome * 100) + '% (মোট আয়ের)।');
      }
    });

    if (notes.length) {
      clean += '\n\n———\n' + [...new Set(notes)].join('\n') +
        '\nসঠিক সংখ্যার জন্য "কর নীতিমালা" পাতা দেখুন।';
    }
    return clean;
  }

  const FOOTER = '\n\n— উৎস: এই ডেমোর জ্ঞানভাণ্ডার। লাইভে জমা দেওয়ার আগে Tax & Payment পাতার ' +
    'সংখ্যার সাথে মিলিয়ে নিন। বড় অঙ্ক বা জটিল বিষয় হলে কর আইনজীবীর পরামর্শ নিন।';

  async function ask(question, data, res, rules, onProgress) {
    if (!hasAnyKey()) {
      return { text: offlineAnswer(question, data, res, rules), via: 'অফলাইন (বিল্ট-ইন জ্ঞান)' };
    }
    try {
      const out = await askOnline(systemPrompt(data, res, rules), question, onProgress);
      out.text = verify(out.text, res, rules) + FOOTER;
      return out;
    } catch (e) {
      const fallback = offlineAnswer(question, data, res, rules);
      const why = e.message === 'no-key' ? 'কোনো API key নেই'
        : 'সব API চেষ্টা ব্যর্থ হয়েছে' + (e.details ? ' (' + e.details.length + ' চেষ্টা)' : '');
      return { text: fallback, via: 'অফলাইন — ' + why, errors: e.details };
    }
  }

  global.AskAI = {
    ask, offlineAnswer, systemPrompt, knowledgeBase,
    allKeys, setKeys, hasAnyKey, maskKey, clearDead,
    geminiModels, groqModels, PAGE_MAP
  };
})(window);
