/* eReturn Demo — শেল, রাউটার ও সব পাতা */
(function (global) {
  'use strict';

  const f = v => TaxCalc.fmt(v);
  const esc = UI.esc;

  /* প্রতিবার ছাড়ার সময় বাড়ানো হয় — লাইভে কোন বিল্ড চলছে বোঝার জন্য */
  const APP_VERSION = '2026.09.07-4';

  /* ---------------- বাংলা ফন্ট ও লেখার আকার ---------------- */

  const FONTS = [
    { id: 'Anek Bangla', bn: 'আনেক বাংলা', note: 'আধুনিক ও ঝকঝকে — ডিফল্ট' },
    { id: 'Hind Siliguri', bn: 'হিন্দ শিলিগুড়ি', note: 'সরল, বাংলাদেশে সবচেয়ে পরিচিত' },
    { id: 'Tiro Bangla', bn: 'তিরো বাংলা', note: 'বইয়ের মতো — লম্বা লেখা পড়তে আরাম' },
    { id: 'Baloo Da 2', bn: 'বালু দা ২', note: 'মোটা ও গোলগাল — দূর থেকেও পড়া যায়' },
    { id: 'Noto Sans Bengali', bn: 'নোটো সান্স বাংলা', note: 'নিরপেক্ষ, সব ডিভাইসে একরকম' }
  ];
  const SIZES = [
    { id: '0.92', t: 'ছোট' }, { id: '1', t: 'স্বাভাবিক' },
    { id: '1.1', t: 'বড়' }, { id: '1.22', t: 'আরও বড়' }
  ];
  const FONT_KEY = 'ereturn-demo:font';
  const SIZE_KEY = 'ereturn-demo:uiscale';

  function getFont() { try { return localStorage.getItem(FONT_KEY) || 'Anek Bangla'; } catch (e) { return 'Anek Bangla'; } }
  function getScale() { try { return localStorage.getItem(SIZE_KEY) || '1'; } catch (e) { return '1'; } }
  function applyFont() {
    document.documentElement.style.setProperty('--bn-font', "'" + getFont() + "'");
    document.documentElement.style.setProperty('--ui-scale', getScale());
  }
  applyFont();

  let data = ReturnState.load();
  let rules = TaxRules.load();
  let res = TaxCalc.compute(data, rules);
  let route = (location.hash || '#home').slice(1);
  const isMobile = () => window.matchMedia('(max-width: 860px)').matches;
  let sideCollapsed = isMobile();   // ফোনে সাইডবার শুরুতে বন্ধ থাকে

  /* ---------------- পাতার তালিকা ---------------- */

  const INCOME_PAGES = [
    { id: 'employment', title: 'Income from Employment', head: 'employment' },
    { id: 'rent', title: 'Income from Rent', head: 'rent' },
    { id: 'agriculture', title: 'Income from Agriculture', head: 'agriculture' },
    { id: 'business', title: 'Income from Business or Profession', head: 'business' },
    { id: 'capital-gain', title: 'Capital Gains', head: 'capitalGain' },
    { id: 'financial-assets', title: 'Income from Financial Assets', head: 'financialAssets' },
    { id: 'other-sources', title: 'Income from Other Sources', head: 'otherSources' },
    { id: 'exempted', title: 'Tax Exempted Income', head: '__exempt' }
  ];

  function activeIncomePages() {
    return INCOME_PAGES.filter(p => p.head === '__exempt'
      ? data.assessment.hasExemptedIncome === 'Yes'
      : data.assessment.heads[p.head]);
  }

  function flow() {
    const list = ['home', 'assessment', 'additional'];
    activeIncomePages().forEach(p => list.push(p.id));
    // লাইভের মতো: "Claim tax rebate for investment?" = No হলে Rebate পাতা আসে না
    if (data.additional.claimTaxRebate !== 'No') list.push('rebate');
    return list.concat(['expenditure', 'assets', 'tax', 'advisor', 'live']);
  }

  const STEPS = [
    { key: 'assessment', label: 'Assessment', pages: ['assessment', 'additional'] },
    { key: 'income', label: 'Income', pages: INCOME_PAGES.map(p => p.id) },
    { key: 'rebate', label: 'Rebate', pages: ['rebate'], hideIf: () => data.additional.claimTaxRebate === 'No' },
    { key: 'expenditure', label: 'Expenditure', pages: ['expenditure'] },
    { key: 'assets', label: 'Assets & Liabilities', pages: ['assets'] },
    { key: 'tax', label: 'Tax & Payment', pages: ['tax'] },
    { key: 'return', label: 'Return View', pages: ['return-view'] }
  ];

  /* ---------------- শেল ---------------- */

  function shell() {
    const t = data.taxpayer;
    const initials = (t.name || 'ডে').trim().slice(0, 2);
    return '' +
      '<div class="demo-banner">' +
      '<span>⚠️ এটি একটি <b>ডেমো</b> — সব তথ্য শুধু এই কম্পিউটারে থাকে, NBR-এ কিছুই যায় না। ' +
      'এখানে অনুশীলন করে তারপর লাইভ সাইটে বসান।</span>' +
      '<span class="grow"></span>' +
      '<button data-act="export">সেভ ফাইল</button>' +
      '<button data-act="import">ফাইল লোড</button>' +
      '<button data-act="reset">সব মুছুন</button>' +
      '</div>' +
      '<div class="er-shell">' +
      '<div class="er-header">' +
      '<img class="logo" src="assets/img/eReturn_Logo.svg" alt="e-Return">' +
      '<button class="burger" data-act="burger">&#9776;</button>' +
      '<span class="spacer"></span>' +
      '<span class="ay-label">Assessment Year</span>' +
      '<select class="ay" data-path="assessment.assessmentYear">' +
      ['2024-2025', '2025-2026', '2026-2027'].map(y =>
        '<option' + (data.assessment.assessmentYear === y ? ' selected' : '') + '>' + y + '</option>').join('') +
      '</select>' +
      '<span class="user">' + esc(t.name || 'ডেমো করদাতা') +
      '<span class="avatar">' + esc(initials) + '</span></span>' +
      '</div>' +
      '<div class="er-body">' + sidebar() +
      '<div class="side-backdrop' + (sideCollapsed ? '' : ' show') + '" data-act="close-side"></div>' +
      '<div class="er-main" id="page"></div></div>' +
      '<div class="er-foot"><span>Copyright © 2026. National Board of Revenue. All rights reserved. ' +
      '<b>(ডেমো কপি)</b></span><span class="spacer"></span>' +
      '<span class="small">নিয়ম: ' + esc(rules.label) + ' · সংস্করণ ' + esc(APP_VERSION) + '</span></div>' +
      '</div>' +
      drawer() + aiPanel() +
      '<div class="tour-bar" id="tourBar"><span class="txt"></span>' +
      '<button class="ghost" data-act="tour-prev">← আগেরটা</button>' +
      '<button data-act="tour-next">পরেরটা →</button>' +
      '<button class="ghost" data-act="tour-stop">✕</button></div>' +
      '<button class="ai-fab" data-act="ai">💬 Ask AI</button>';
  }

  function sideItem(id, label, sub) {
    return '<a class="item' + (sub ? ' sub' : '') + (route === id ? ' active' : '') +
      '" href="#' + id + '">' + esc(label) + '</a>';
  }

  function sidebar() {
    let h = '<div class="er-side' + (sideCollapsed ? ' collapsed' : '') + '">';
    h += sideItem('home', '🏠  Home');
    h += '<div class="grp">Submission</div>';
    h += sideItem('assessment', 'Regular e-Return', true);
    h += '<div class="grp">ডেমো সহায়তা</div>';
    h += sideItem('zero', '🎯  জিরো রিটার্ন গাইড', true);
    h += sideItem('info', '📚  তথ্যভাণ্ডার', true);
    h += sideItem('guide', '🗺️  লাইভ সাইট গাইড', true);
    h += sideItem('advisor', '💡  কর পরামর্শ', true);
    h += sideItem('live', '📋  লাইভে কী লিখবেন', true);
    h += sideItem('return-view', '📄  Return View', true);
    h += sideItem('rules', '⚖️  কর নীতিমালা', true);
    h += sideItem('settings', '⚙️  সেটিংস / AI key', true);
    h += '<div class="side-foot">&#8249;</div></div>';
    return h;
  }

  function pills(activeKey) {
    return '<div class="pills">' + STEPS.map(s => {
      if (s.hideIf && s.hideIf()) return '';
      const target = s.key === 'income' ? (activeIncomePages()[0] || {}).id : s.pages[0];
      if (s.key === 'income' && !target) return '';
      return '<button class="pill' + (s.key === activeKey ? ' active' : '') +
        '" data-go="' + esc(target) + '">' + esc(s.label) + '</button>';
    }).join('') + '</div>';
  }

  function head(title, activeKey, extra) {
    return '<div class="page-head"><h1>' + esc(title) + '</h1>' +
      '<button id="warnBadge" class="warn-badge ok" data-act="warnings">✅</button>' +
      '<span class="spacer"></span>' +
      (activeKey ? pills(activeKey) : '') + '</div>' + (extra || '');
  }

  function incomeChips(cur) {
    const list = activeIncomePages();
    if (list.length < 2) return '';
    return '<div class="pills" style="margin-bottom:14px">' + list.map(p =>
      '<button class="pill' + (p.id === cur ? ' active' : '') + '" data-go="' + p.id + '">' +
      esc(p.title.replace('Income from ', '')) + '</button>').join('') + '</div>';
  }

  /* ---------------- KPI ---------------- */

  function kpis() {
    return '<div class="kpi-row">' +
      kpi('মোট আয়', f(res.totalIncome)) +
      kpi('করমুক্ত সীমা', f(res.threshold)) +
      kpi('স্ল্যাব কর', f(res.grossTaxBeforeRebate)) +
      kpi('বিনিয়োগ রেয়াত', f(res.totalRebate), 'good') +
      kpi('নিট কর', f(res.netTaxAfterRebate), 'hi') +
      kpi(res.refundable > 0 ? 'ফেরতযোগ্য' : 'এখন দিতে হবে',
        f(res.refundable > 0 ? res.refundable : res.netPayable),
        res.refundable > 0 ? 'good' : 'danger') +
      '</div>';
  }
  function kpi(k, v, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="k">' + esc(k) + '</div><div class="v">' + v + '</div></div>';
  }

  /* ---------------- পাতা: Home ---------------- */

  function pageHome() {
    const t = data.taxpayer;
    return head('শুরু করুন — করদাতার তথ্য') + kpis() +
      '<div class="grid2">' +
      UI.card('করদাতার তথ্য',
        UI.field({ label: 'নাম', type: 'text', path: 'taxpayer.name', value: t.name }) +
        UI.field({ label: 'TIN', type: 'text', path: 'taxpayer.tin', value: t.tin }) +
        UI.field({
          label: 'করদাতার শ্রেণি (লাইভে TIN প্রোফাইল থেকে নিজে আসে)', type: 'select',
          path: 'taxpayer.category', help: 'taxpayerCategory',
          value: t.category, options: [
            { v: 'general', t: 'সাধারণ (পুরুষ) — করমুক্ত ' + f(rules.threshold.general) },
            { v: 'female_senior', t: 'নারী / ৬৫+ বছর — করমুক্ত ' + f(rules.threshold.female_senior) }
          ],
          hint: 'মুক্তিযোদ্ধা / প্রতিবন্ধী / তৃতীয় লিঙ্গ হলে সেটা <b>Additional Information</b> পাতায় টিক দিতে হয় — ' +
            'লাইভেও ঠিক সেখানেই আছে। <button class="btn ghost" data-go="additional">সেখানে যান →</button>'
        }) +
        '<div class="checklist">' +
        UI.field({ type: 'checkbox', label: 'প্রথমবার রিটার্ন দিচ্ছি (ন্যূনতম কর ' + f(rules.minimumTax.firstTime) + ')', path: 'taxpayer.firstTimeFiler', help: 'firstTimeFiler', value: t.firstTimeFiler }) +
        UI.field({ type: 'checkbox', label: 'প্রথম কোয়ার্টারে জমা দেব (' + (rules.firstQuarterIncentive * 100) + '% প্রণোদনা)', path: 'taxpayer.submitByFirstQuarter', help: 'submitByFirstQuarter', value: t.submitByFirstQuarter }) +
        '</div>' +
        '<div class="field" style="margin-top:10px"><label>আপনার করমুক্ত সীমা এখন</label>' +
        '<input readonly class="num" value="' + f(res.threshold) + '"></div>'
      ) +
      (location.protocol === 'file:'
        ? '<div class="tip warn"><h4>সরাসরি ফাইল থেকে খোলা হয়েছে</h4><p>' +
          'সব কিছুই কাজ করবে — শুধু <b>Ask AI</b>-এর অনলাইন উত্তর ব্রাউজার আটকে দিতে পারে ' +
          '(অফলাইন উত্তর ঠিকই আসবে)। পুরো সুবিধা পেতে ফোল্ডারের <b>START.bat</b> ডাবল-ক্লিক করুন।</p></div>'
        : '') +
      UI.card('এই ডেমো কীভাবে কাজ করে',
        '<p class="muted" style="line-height:1.85;font-size:13.5px">' +
        '১. বাঁ পাশের <b>Regular e-Return</b> থেকে শুরু করুন — লাইভ সাইটের হুবহু একই ধাপ।<br>' +
        '২. প্রতিটি ঘরের পাশে <span class="help">?</span> আছে — চাপলে বাংলায় বোঝানো হবে।<br>' +
        '৩. উপরে সবসময় দেখা যাবে কর কত হচ্ছে — অঙ্ক বদলালেই সাথে সাথে বদলাবে।<br>' +
        '৪. <b>কর পরামর্শ</b> পাতায় দেখবেন কীভাবে বৈধভাবে কর কমানো/০ করা যায়।<br>' +
        '৫. সব ঠিক হলে <b>লাইভে কী লিখবেন</b> পাতা খুলে সেটা দেখে দেখে আসল সাইটে বসান।<br>' +
        '৬. নিচের ডানে <b>💬 Ask AI</b> — যেকোনো প্রশ্ন বাংলায় করুন, কোথায় কী দিতে হবে বলে দেবে।' +
        '</p>' +
        '<div style="margin-top:14px"><button class="btn" data-go="assessment">শুরু করুন &rarr;</button> ' +
        '<button class="btn ghost" data-act="sample">নমুনা ডেটা ভরে দিন</button></div>'
      ) + '</div>' +
      storageBox() +
      UI.card('সংরক্ষিত সিনারিও (তুলনা করার জন্য)', scenarioBox());
  }

  function storageOk() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }

  function storageBox() {
    const ok = storageOk();
    const when = data.meta && data.meta.savedAt
      ? new Date(data.meta.savedAt).toLocaleString('bn-BD')
      : 'এখনো কিছু লেখা হয়নি';
    if (!ok) {
      return '<div class="verdict danger"><div class="vi">⚠️</div><div>' +
        '<h3>এই ব্রাউজারে সেভ করা যাচ্ছে না</h3>' +
        '<p>প্রাইভেট/ইনকগনিটো উইন্ডো অথবা সাইট-ডেটা ব্লক করা আছে। এখানে যা লিখবেন, ' +
        'ট্যাব বন্ধ করলেই হারিয়ে যাবে।<br>সাধারণ উইন্ডোতে খুলুন, অথবা কাজ শেষে ' +
        '<b>"সেভ ফাইল"</b> দিয়ে ফাইল নামিয়ে রাখুন।</p>' +
        '<button class="btn" data-act="export">এখনই ফাইল নামান</button></div></div>';
    }
    return UI.card('আপনার তথ্য কোথায় থাকে',
      '<div class="storagegrid">' +
      '<div class="sg"><div class="sgi">💾</div><div><b>নিজে থেকেই সেভ হয়</b>' +
      '<div class="small muted">প্রতিবার কিছু লিখলেই সাথে সাথে — কোনো Save বোতাম চাপতে হয় না।<br>' +
      'সর্বশেষ সেভ: ' + esc(when) + '</div></div></div>' +
      '<div class="sg"><div class="sgi">🖥️</div><div><b>শুধু এই কম্পিউটারে</b>' +
      '<div class="small muted">এই ব্রাউজারের ভেতরেই থাকে (localStorage)। ইন্টারনেটে যায় না, ' +
      'NBR-এ যায় না, আমরাও দেখতে পাই না।</div></div></div>' +
      '<div class="sg"><div class="sgi">🔁</div><div><b>পরে এসে আবার পাবেন</b>' +
      '<div class="small muted">ব্রাউজার বন্ধ করে কাল-পরশু এসে খুললেও সব ঠিক আগের মতোই থাকবে — ' +
      'Ask AI-এর কথোপকথনসহ।</div></div></div>' +
      '<div class="sg"><div class="sgi">⚠️</div><div><b>যেভাবে হারাতে পারে</b>' +
      '<div class="small muted">ব্রাউজারের History/সাইট-ডেটা মুছলে, অন্য ব্রাউজার বা অন্য পিসিতে খুললে, ' +
      'বা ইনকগনিটোতে কাজ করলে।</div></div></div>' +
      '</div>' +
      '<div class="tip good" style="margin-top:14px"><h4>নিরাপদ থাকতে</h4><p>' +
      'কাজ শেষে <b>"সেভ ফাইল"</b> চেপে একটা <code>.json</code> ফাইল নামিয়ে রাখুন। ' +
      'অন্য পিসিতে বা পরে কখনো <b>"ফাইল লোড"</b> দিয়ে হুবহু ফিরিয়ে আনতে পারবেন।</p>' +
      '<div style="margin-top:10px"><button class="btn" data-act="export">💾 সেভ ফাইল নামান</button> ' +
      '<button class="btn ghost" data-act="import">📂 ফাইল থেকে ফিরিয়ে আনুন</button></div></div>');
  }

  function scenarioBox() {
    const all = ReturnState.listScenarios();
    const names = Object.keys(all);
    let h = '<div class="inline" style="margin-bottom:10px">' +
      '<input type="text" id="scName" placeholder="সিনারিওর নাম (যেমন: DPS ছাড়া)" style="flex:1;min-width:220px;border:1px solid #ced4da;border-radius:4px;padding:7px 10px">' +
      '<button class="btn ghost" data-act="scenario-save">এখনকার অবস্থা সেভ করুন</button></div>';
    if (!names.length) return h + '<p class="muted small">এখনো কিছু সেভ করা নেই। ভিন্ন ভিন্ন বিনিয়োগে কর কত হয় তুলনা করতে কাজে লাগবে।</p>';
    h += '<div class="tbl-wrap"><table class="dt"><thead><tr><th>নাম</th><th>মোট আয়</th><th>নিট কর</th><th></th></tr></thead><tbody>';
    names.forEach(nm => {
      const d = ReturnState.loadScenario(nm);
      const r = TaxCalc.compute(d, rules);
      h += '<tr><td>' + esc(nm) + '</td><td class="num">' + f(r.totalIncome) + '</td><td class="num">' + f(r.netTaxAfterRebate) + '</td>' +
        '<td><button class="btn ghost" data-act="scenario-load" data-name="' + esc(nm) + '">লোড</button> ' +
        '<button class="icon-btn" data-act="scenario-del" data-name="' + esc(nm) + '">&#128465;</button></td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  /* ---------------- পাতা: Assessment ---------------- */

  function pageAssessment() {
    const A = data.assessment;
    const headBoxes = [
      ['employment', 'Income from Employment'], ['rent', 'Income from Rent'],
      ['agriculture', 'Income from Agriculture'], ['business', 'Income from Business or Profession'],
      ['capitalGain', 'Capital Gains'], ['financialAssets', 'Income from Financial Assets'],
      ['otherSources', 'Income from Other Sources']
    ];
    const otherBoxes = [
      ['partnerOfFirm', 'As a Partner of a Firm'], ['memberOfAop', 'As a Member of an AoP'],
      ['foreignIncome', 'Income Earned outside Bangladesh'],
      ['spouseMinorIncome', 'Income Earned by the Spouse or Minor Children (Not Assessed Separately)']
    ];
    return head('Regular e-Return', 'assessment') + kpis() +
      '<div class="grid2"><div>' +
      UI.card('Assessment Information',
        UI.field({ label: 'Return Scheme', type: 'text', readonly: true, value: A.returnScheme, help: 'returnScheme' }) +
        UI.field({ label: 'Assessment Year', type: 'text', readonly: true, value: A.assessmentYear, help: 'assessmentYear' }) +
        '<div class="row2">' +
        UI.field({ label: 'Income Year — From', type: 'text', readonly: true, value: A.incomeYearFrom, help: 'incomeYear' }) +
        UI.field({ label: 'To', type: 'text', readonly: true, value: A.incomeYearTo }) + '</div>' +
        UI.field({ label: 'Resident Status', type: 'radio', path: 'assessment.residentStatus', help: 'residentStatus', value: A.residentStatus, options: ['Resident', 'Non Resident'] })
      ) +
      UI.card('Tax Exempted Income',
        UI.field({ label: 'Any income which is fully exempted from tax?', type: 'radio', path: 'assessment.hasExemptedIncome', help: 'hasExemptedIncome', value: A.hasExemptedIncome, options: ['Yes', 'No'] })
      ) +
      '</div><div>' +
      UI.card('Heads of Income',
        UI.field({ label: 'Any taxable income in the income year?', type: 'radio', path: 'assessment.hasTaxableIncome', help: 'hasTaxableIncome', value: A.hasTaxableIncome, options: ['Yes', 'No'] }) +
        '<div class="checklist" style="margin-top:8px">' + headBoxes.map(([k, l]) =>
          UI.field({ type: 'checkbox', label: l, path: 'assessment.heads.' + k, value: A.heads[k], help: 'heads' })).join('') + '</div>' +
        '<hr style="border:none;border-top:1px solid #e1eaec;margin:14px 0">' +
        '<b style="font-size:14px">Any income from the following sources?</b>' +
        '<div class="checklist" style="margin-top:10px">' + otherBoxes.map(([k, l]) =>
          UI.field({ type: 'checkbox', label: l, path: 'assessment.otherSourcesFlags.' + k, value: A.otherSourcesFlags[k] })).join('') + '</div>' +
        '<hr style="border:none;border-top:1px solid #e1eaec;margin:14px 0">' +
        '<b style="font-size:14px">Voluntary Disclosure of Income</b>' +
        '<div class="checklist" style="margin-top:10px">' +
        UI.field({ type: 'checkbox', label: 'Voluntary Disclosure of Income under 1st Schedule', path: 'assessment.voluntaryDisclosure', value: A.voluntaryDisclosure, help: 'voluntaryDisclosure' }) +
        '</div>'
      ) + '</div></div>' +
      addedPagesBox() +
      (anyFlag() ? UI.card('Firm / AoP / বিদেশ / স্বামী-স্ত্রী ও নাবালকের আয়', flagFields()) : '') +
      (A.voluntaryDisclosure ? UI.card('Voluntary Disclosure of Income',
        UI.field({ label: 'প্রকাশিত আয়ের পরিমাণ', path: 'voluntaryDisclosure.amount', value: data.voluntaryDisclosure.amount })) : '') +
      UI.pageActions();
  }

  /* টিক দেওয়ার পর কোন পাতাগুলো যুক্ত হলো — না দেখালে মানুষ বুঝতে পারে না */
  function addedPagesBox() {
    const list = activeIncomePages();
    if (!list.length) {
      return '<div class="tip warn"><h4>এখনো কোনো আয়ের খাত বাছাই করেননি</h4><p>' +
        'ডানের "Heads of Income"-এ আপনার আয়ের খাতে টিক দিন। যেটায় টিক দেবেন, ' +
        'ঠিক সেই পাতাটাই পরের ধাপে যুক্ত হবে — তখন সেখানে অঙ্ক বসাতে হবে।</p></div>';
    }
    return '<div class="tip good"><h4>✅ আপনার জন্য যে পাতাগুলো যুক্ত হলো (' + list.length + ' টি)</h4>' +
      '<p>নিচের যেকোনোটিতে চাপ দিলে সরাসরি সেই পাতায় চলে যাবেন। প্রতিটি পাতা পূরণ করতেই হবে — ' +
      'নাহলে লাইভ সাইট সামনে এগোতে দেবে না।</p>' +
      '<div class="pills" style="margin-top:10px">' +
      list.map(p => '<button class="pill" data-go="' + p.id + '">' + esc(p.title.replace('Income from ', '')) + ' →</button>').join('') +
      '</div></div>';
  }

  function anyFlag() {
    const o = data.assessment.otherSourcesFlags;
    return o.partnerOfFirm || o.memberOfAop || o.foreignIncome || o.spouseMinorIncome;
  }
  function flagFields() {
    const o = data.assessment.otherSourcesFlags, F = data.firmAopForeignSpouse;
    let h = '<div class="row2">';
    if (o.partnerOfFirm) h += UI.field({ label: 'ফার্ম থেকে প্রাপ্ত মুনাফার অংশ', path: 'firmAopForeignSpouse.firmShare', value: F.firmShare });
    if (o.memberOfAop) h += UI.field({ label: 'AoP থেকে প্রাপ্ত অংশ', path: 'firmAopForeignSpouse.aopShare', value: F.aopShare });
    if (o.foreignIncome) h += UI.field({ label: 'বিদেশে অর্জিত আয়', path: 'firmAopForeignSpouse.foreignIncome', value: F.foreignIncome });
    if (o.foreignIncome) h += UI.field({ label: 'বিদেশে পরিশোধিত কর (Foreign Tax Relief)', path: 'firmAopForeignSpouse.foreignTaxPaid', value: F.foreignTaxPaid });
    if (o.spouseMinorIncome) h += UI.field({ label: 'স্বামী/স্ত্রী বা নাবালক সন্তানের আয়', path: 'firmAopForeignSpouse.spouseMinorIncome', value: F.spouseMinorIncome });
    return h + '</div>';
  }

  /* ---------------- পাতা: Additional Information ---------------- */

  const LOCATIONS = ['Dhaka North City Corporation', 'Dhaka South City Corporation',
    'Chattogram City Corporation', 'Other City Corporation', 'Any Other Area'];

  function pageAdditional() {
    const a = data.additional;
    const q = [
      ['grossWealthOver50Lakh', 'Gross Wealth over 50,00,000?', 'grossWealthOver50Lakh'],
      ['ownMotorCar', 'Own Motor Car?', 'ownMotorCar'],
      ['offshoreProperty', 'Own Offshore Property?', 'offshoreProperty'],
      ['shareholderDirector', 'Shareholder director of a company?', 'shareholderDirector'],
      ['houseProperty', 'Have any House Property?', 'housePropertyQ']
    ];
    const need = q.some(([k]) => a[k] === 'Yes');
    const locMissing = !a.location;

    return head('Additional Information', 'assessment') + kpis() +
      '<div class="grid2"><div>' +
      UI.card('Additional Information',
        '<div class="field">' +
        '<label>Location of Main Source of Income' + UI.helpIcon('location') + '</label>' +
        '<select data-path="additional.location"' + (locMissing ? ' class="is-invalid"' : '') + '>' +
        '<option value="">Select One</option>' +
        LOCATIONS.map(l => '<option' + (a.location === l ? ' selected' : '') + '>' + esc(l) + '</option>').join('') +
        '</select>' +
        (locMissing ? '<div class="req-msg">Location of Main Source of Income is Required!.</div>' : '') +
        '</div>' +
        '<div class="checklist" style="margin-top:12px">' +
        UI.field({ type: 'checkbox', label: 'War-wounded Gazetted Freedom Fighter/Wounded Gazetted July Fighter', path: 'additional.freedomFighter', help: 'freedomFighter', value: a.freedomFighter }) +
        UI.field({ type: 'checkbox', label: 'Person with Disability/Third Gender', path: 'additional.disabledThirdGender', help: 'disabledThirdGender', value: a.disabledThirdGender }) +
        UI.field({ type: 'checkbox', label: 'Claim Benefit as a Parent/Legal Guardian of a Person with Disability', path: 'additional.guardianOfDisabled', help: 'guardianOfDisabled', value: a.guardianOfDisabled }) +
        '</div>' +
        (a.guardianOfDisabled
          ? UI.field({ label: 'প্রতিবন্ধী সন্তান/পোষ্যের সংখ্যা', path: 'taxpayer.disabledChildren', help: 'disabledChildren', value: data.taxpayer.disabledChildren })
          : '') +
        '<div class="tip info" style="margin-top:12px"><h4>আপনার করমুক্ত সীমা এখন ' + f(res.threshold) + ' টাকা</h4><p>' +
        thresholdWhy() + '</p></div>'
      ) +
      UI.card('Tax Rebate',
        UI.field({
          label: 'Claim tax rebate for investment?', type: 'radio', path: 'additional.claimTaxRebate',
          help: 'claimTaxRebate', value: a.claimTaxRebate, options: ['Yes', 'No']
        }) +
        (a.claimTaxRebate === 'No'
          ? '<div class="tip warn"><h4>Rebate পাতা বাদ পড়ে যাবে</h4><p>"No" দিলে বিনিয়োগ রেয়াতের পাতা আসবে না ' +
            'এবং কোনো রেয়াত পাবেন না। DPS, সঞ্চয়পত্র, জীবন বীমা, GPF — যেকোনো একটি থাকলেও "Yes" দিন।</p></div>'
          : '<div class="tip good"><h4>ঠিক আছে</h4><p>পরে Rebate পাতায় আপনার বিনিয়োগ দেখাতে পারবেন — ' +
            'এটাই কর কমানোর সবচেয়ে বড় সুযোগ।</p></div>')
      ) +
      '</div><div>' +
      UI.card('IT10B Requirements',
        q.map(([k, l, hk]) => UI.field({
          label: l, type: 'radio', path: 'additional.' + k, help: hk, value: a[k], options: ['Yes', 'No']
        })).join('') +
        '<div class="tip ' + (need ? 'warn' : 'good') + '" style="margin-top:6px"><h4>' +
        (need ? 'IT-10B (সম্পদ বিবরণী) বাধ্যতামূলক' : 'IT-10B লাগছে না') + '</h4><p>' +
        (need ? 'উপরের যেকোনো একটিতে "Yes" হলেই Assets &amp; Liabilities পাতা পূরণ করতে হবে।'
          : 'তবু সম্পদ-দায় দেখানো ভালো — ভবিষ্যতে টাকার উৎস প্রমাণ করা সহজ হয়।') + '</p></div>'
      ) +
      '</div></div>' + UI.pageActions();
  }

  function thresholdWhy() {
    const a = data.additional, t = data.taxpayer;
    const parts = [];
    if (a.freedomFighter) parts.push('গেজেটেড মুক্তিযোদ্ধা/জুলাই যোদ্ধা → ' + f(rules.threshold.freedom_fighter));
    if (a.disabledThirdGender) parts.push('প্রতিবন্ধী/তৃতীয় লিঙ্গ → ' + f(rules.threshold.disabled_third));
    if (t.category === 'female_senior') parts.push('নারী বা ৬৫+ → ' + f(rules.threshold.female_senior));
    if (!parts.length) parts.push('সাধারণ করদাতা → ' + f(rules.threshold.general));
    if (a.guardianOfDisabled && TaxCalc.n(t.disabledChildren) > 0) {
      parts.push('প্রতিবন্ধী সন্তান ' + t.disabledChildren + ' জন → +' +
        f(TaxCalc.n(t.disabledChildren) * rules.disabledChildRelief));
    }
    return parts.join('<br>') + '<br><b>একাধিক প্রযোজ্য হলে সবচেয়ে বেশি সীমাটাই পাবেন।</b>';
  }

  /* ---------------- পাতা: Employment ---------------- */

  const EMP_EXTRAS = ['Arrear Salary', 'Education Allowance', 'Employee Share Schemes (Share Received)',
    'Employer’s Contribution to RPF', 'Entertainment Allowance', 'Gratuity (Approved Gratuity Fund)',
    'Interest Accrued on RPF', 'Leave Allowance', 'Other Bonus', 'Overtime Allowance',
    'TA/DA/Conveyance (not expended)', 'Other, If Any (Give Detail)'];

  function pageEmployment() {
    if (!data.employment.length) data.employment.push(ReturnState.blankEmployment());
    let body = '';
    data.employment.forEach((e, i) => {
      const p = 'employment[' + i + ']';
      const d = res.emp.details[i] || { gross: 0, exempt: 0, taxable: 0 };
      body += UI.card('Employment ' + (i + 1) +
        (data.employment.length > 1 ? '' : ''),
        '<div class="grid2"><div>' +
        UI.field({
          label: 'Employment Type', type: 'select', path: p + '.employmentType', help: 'employmentType',
          value: e.employmentType, options: [{ v: '', t: 'Select' }].concat(TaxCalc.GOVT_TYPES,
            ['Private/Other than Government Pay Scale', 'Salary Subject to Reduced Tax Rate'])
        }) +
        UI.field({ label: 'Name of the Employer', type: 'text', path: p + '.employer', help: 'employer', value: e.employer }) +
        UI.field({ label: 'Designation', type: 'text', path: p + '.designation', help: 'designation', value: e.designation }) +
        '<b style="font-size:14px">Particulars (বার্ষিক অঙ্ক)</b>' +
        UI.field({ label: 'Basic Salary', path: p + '.basicSalary', help: 'basicSalary', value: e.basicSalary }) +
        UI.field({ label: 'House Rent Allowance', path: p + '.houseRentAllowance', help: 'houseRentAllowance', value: e.houseRentAllowance }) +
        UI.field({ label: 'Medical Allowance', path: p + '.medicalAllowance', help: 'medicalAllowance', value: e.medicalAllowance }) +
        UI.field({ label: 'Conveyance Allowance', path: p + '.conveyanceAllowance', help: 'conveyanceAllowance', value: e.conveyanceAllowance }) +
        UI.field({ label: 'Festival Bonus', path: p + '.festivalBonus', help: 'festivalBonus', value: e.festivalBonus }) +
        UI.dynTable({
          title: 'Add More', help: 'salaryExtra', path: p + '.extras', addLabel: 'Add More',
          cols: [{ key: 'key', label: 'Particular', type: 'select', options: EMP_EXTRAS, width: '55%' },
          { key: 'amount', label: 'Amount' }],
          rows: e.extras || []
        }) +
        '</div><div>' +
        UI.card('Non-Cash Benefits',
          UI.field({ label: 'Rent Free Accommodation', path: p + '.nonCash.rentFreeAccommodation', help: 'rentFreeAccommodation', value: e.nonCash.rentFreeAccommodation }) +
          UI.field({ label: 'Accommodation at Concessional Rate', path: p + '.nonCash.concessionalAccommodation', help: 'concessionalAccommodation', value: e.nonCash.concessionalAccommodation }) +
          UI.field({ label: 'Vehicle Facility Provided', path: p + '.nonCash.vehicleFacility', help: 'vehicleFacility', value: e.nonCash.vehicleFacility }) +
          UI.field({ label: 'Other Non-Cash Benefit', path: p + '.nonCash.otherNonCash', help: 'otherNonCash', value: e.nonCash.otherNonCash })
        ) +
        UI.calcTable([
          { label: 'মোট বেতন (নগদ + অ-নগদ)', value: d.gross },
          { label: 'করমুক্ত ছাড়', value: d.exempt },
          { label: 'করযোগ্য বেতন আয়', value: d.taxable, cls: 'strong' }
        ], { head: ['Employment Summary', 'Amount'] }) +
        (data.employment.length > 1 ?
          '<div style="margin-top:12px"><button class="btn danger" data-del="employment" data-i="' + i + '">এই চাকরিটি মুছুন</button></div>' : '') +
        '</div></div>');
    });
    return head('Income Details', 'income') + incomeChips('employment') + kpis() +
      '<div class="tip info"><h4>📚 বেতন কীভাবে ভাগ হয় — এক নজরে</h4><p>' +
      'অফিস মাসে যত টাকা দেয় সেটা কয়েক ভাগে ভাঙা থাকে। বাংলাদেশে প্রচলিত ভাগ: ' +
      '<b>মূল বেতন</b> মোট বেতনের ৫০–৬০% · <b>বাড়ি ভাড়া</b> মূল বেতনের ৫০% · ' +
      '<b>চিকিৎসা</b> মূল বেতনের ~১০% · <b>যাতায়াত</b> নির্দিষ্ট অঙ্ক · ' +
      '<b>উৎসব বোনাস</b> সাধারণত ২টি, প্রতিটি এক মাসের মূল বেতন।<br>' +
      '⚠️ সব ঘরে <b>বার্ষিক</b> (১২ মাসের যোগফল) লিখতে হয় — মাসিক নয়। ' +
      '<span class="help" data-help="salaryStructure">?</span> চাপলে পুরো ব্যাখ্যা ও উদাহরণ পাবেন।</p></div>' +
      salarySplitter() + body +
      '<div style="margin-bottom:14px"><button class="btn ghost" data-add="employment">+ Add Employment</button></div>' +
      UI.pageActions();
  }

  /* ---------------- পাতা: Rent ---------------- */

  function pageRent() {
    if (!data.rent.length) data.rent.push(ReturnState.blankRent());
    let body = '';
    data.rent.forEach((r, i) => {
      const p = 'rent[' + i + ']';
      const c = res.rent.rows[i] || { totalRent: 0, repair: 0, deduction: 0, income: 0, special: 0, total: 0 };
      const part = (key, label) => '<div class="card" style="margin-bottom:12px"><b>' + label + '</b>' +
        '<div class="row2" style="margin-top:10px">' +
        UI.field({ label: 'Area Rented Out (Sq. ft.)', path: p + '.' + key + '.areaRented', value: r[key].areaRented }) +
        UI.field({ label: 'Rental Period (Months)', path: p + '.' + key + '.months', value: r[key].months }) +
        UI.field({ label: 'Annual Rent', path: p + '.' + key + '.annualRent', help: 'annualRent', value: r[key].annualRent }) +
        UI.field({ label: 'Rent Received', path: p + '.' + key + '.rentReceived', help: 'rentReceived', value: r[key].rentReceived }) +
        UI.field({ label: 'Any Charge Paid by Tenant', path: p + '.' + key + '.chargePaidByTenant', help: 'chargePaidByTenant', value: r[key].chargePaidByTenant }) +
        '</div></div>';
      body += UI.card('Property ' + (i + 1),
        '<div class="grid2"><div>' +
        UI.field({ label: 'Property Type', type: 'select', path: p + '.propertyType', help: 'propertyType', value: r.propertyType, options: ['House Property', 'Other Property'] }) +
        UI.field({ label: 'Address of the Property', type: 'text', path: p + '.address', help: 'rentAddress', value: r.address }) +
        UI.field({ label: 'Is it in any city corporation?', type: 'radio', path: p + '.inCityCorporation', help: 'inCityCorporation', value: r.inCityCorporation, options: ['Yes', 'No'] }) +
        '<div class="row2">' +
        UI.field({ label: 'Area Occupied for Personal Use (Sq. ft.)', path: p + '.areaPersonalUse', help: 'areaPersonalUse', value: r.areaPersonalUse }) +
        UI.field({ label: 'Total Area of the Property (Sq. ft.)', path: p + '.totalArea', value: r.totalArea }) + '</div>' +
        part('residential', 'Residential') + part('commercial', 'Commercial') +
        '</div><div>' +
        UI.field({ label: 'Service Charge paid by tenant?', type: 'radio', path: p + '.serviceChargeByTenant', value: r.serviceChargeByTenant, options: ['Yes', 'No'] }) +
        UI.field({ label: 'Are you the only owner?', type: 'radio', path: p + '.onlyOwner', value: r.onlyOwner, options: ['Yes', 'No'] }) +
        (r.onlyOwner === 'No' ? UI.field({ label: 'আপনার মালিকানার অংশ (%)', path: p + '.ownershipPercent', help: 'ownershipPercent', value: r.ownershipPercent }) : '') +
        UI.card('Deductions',
          UI.field({ label: 'Insurance Premium', path: p + '.deductions.insurancePremium', help: 'rentInsurance', value: r.deductions.insurancePremium }) +
          UI.field({ label: 'Interest paid on Loan/Mortgage/Capital Charge', path: p + '.deductions.loanInterest', help: 'rentLoanInterest', value: r.deductions.loanInterest }) +
          UI.field({ label: 'Municipal, Local Tax or Land Revenue', path: p + '.deductions.municipalTax', help: 'rentMunicipalTax', value: r.deductions.municipalTax }) +
          UI.field({ label: 'Repair, Collections, etc. (স্বয়ংক্রিয়)', readonly: true, help: 'rentRepair', value: f(c.repair) }) +
          UI.field({ label: 'Pre-rental interest paid on Loan', path: p + '.deductions.preRentalInterest', help: 'rentPreRental', value: r.deductions.preRentalInterest }) +
          UI.field({ label: 'Other (if any)', path: p + '.deductions.other', value: r.deductions.other }) +
          UI.field({ label: 'Allowable deduction', readonly: true, value: f(c.deduction) })
        ) +
        UI.card('Special Rental Income',
          UI.field({ label: 'Unadjustable and non-refundable Advance, Selami, Premium', path: p + '.special.unadjustableAdvance', help: 'unadjustableAdvance', value: r.special.unadjustableAdvance }) +
          UI.field({ label: 'Refundable or Adjustable deposit (বছরশেষ স্থিতির ১০% ধরা হবে)', path: p + '.special.refundableDeposit', help: 'refundableDeposit', value: r.special.refundableDeposit }) +
          UI.field({ label: 'Unspent Repair, Collections, etc.', path: p + '.special.unspentRepair', value: r.special.unspentRepair })
        ) +
        UI.calcTable([
          { label: 'Total Rent', value: c.totalRent },
          { label: 'Deductions', value: c.deduction },
          { label: 'Special Rental Income', value: c.special },
          { label: 'Income from Property ' + (i + 1), value: c.total, cls: 'strong' }
        ], { head: ['Income from Property ' + (i + 1), 'Amount'] }) +
        (data.rent.length > 1 ? '<div style="margin-top:12px"><button class="btn danger" data-del="rent" data-i="' + i + '">এই সম্পত্তিটি মুছুন</button></div>' : '') +
        '</div></div>');
    });
    return head('Income Details', 'income') + incomeChips('rent') + kpis() + body +
      '<div style="margin-bottom:14px"><button class="btn ghost" data-add="rent">+ Add Another Property</button></div>' +
      UI.pageActions();
  }

  /* ---------------- পাতা: Agriculture ---------------- */

  function pageAgriculture() {
    if (!data.agriculture.length) data.agriculture.push(ReturnState.blankAgriculture());
    let body = '';
    data.agriculture.forEach((a, i) => {
      const p = 'agriculture[' + i + ']';
      const c = res.agri.rows[i] || { sales: 0, cost: 0, net: 0, deemed: true };
      body += UI.card('Agriculture ' + (i + 1),
        '<div class="grid2"><div>' +
        UI.field({ label: 'Agriculture Type', type: 'select', path: p + '.agricultureType', help: 'agricultureType', value: a.agricultureType, options: ['Cultivation', 'Income from Farming', 'Production of Tea or Rubber', 'Other Agricultural Income', 'Special Agricultural Income'] }) +
        '<div class="row2">' +
        UI.field({ label: 'Total Cultivation Area', path: p + '.area', help: 'agriArea', value: a.area }) +
        UI.field({ label: 'একক', type: 'select', path: p + '.areaUnit', value: a.areaUnit, options: ['Decimal', 'Acre', 'Bigha', 'Katha'] }) + '</div>' +
        UI.field({ label: 'Particular of Produces', type: 'text', path: p + '.produce', value: a.produce }) +
        UI.field({ label: 'Maintain Books of Accounts?', type: 'radio', path: p + '.booksOfAccounts', help: 'agriBooks', value: a.booksOfAccounts, options: ['Yes', 'No'] }) +
        '</div><div>' +
        UI.card('Income Summary',
          UI.field({ label: 'Sales Proceed', path: p + '.salesProceed', help: 'salesProceed', value: a.salesProceed }) +
          (a.booksOfAccounts === 'Yes'
            ? UI.field({ label: 'Cost of Production', path: p + '.costOfProduction', help: 'costOfProduction', value: a.costOfProduction })
            : UI.field({ label: 'Cost of Production (বিক্রয়ের ৬০% স্বয়ংক্রিয়)', readonly: true, help: 'costOfProduction', value: f(c.cost) })) +
          UI.field({ label: 'Other Allowable Deduction', path: p + '.otherDeduction', value: a.otherDeduction }) +
          UI.field({ label: 'Net Income', readonly: true, value: f(c.net) })
        ) +
        (data.agriculture.length > 1 ? '<button class="btn danger" data-del="agriculture" data-i="' + i + '">মুছুন</button>' : '') +
        '</div></div>');
    });
    return head('Income Details', 'income') + incomeChips('agriculture') + kpis() + body +
      '<div style="margin-bottom:14px"><button class="btn ghost" data-add="agriculture">+ Add Another Type</button></div>' +
      UI.pageActions();
  }

  /* ---------------- পাতা: Business ---------------- */

  const BIZ_EXPENSES = ['All general, administrative, selling & other expenses (Consolidated)',
    'Financial expense (Bank/FI interest, other charges & related expenses)', 'Depreciation',
    'Amortization', 'R&D expense', 'Bad debt written off', 'Amount paid for Right of Use',
    'Contribution to Worker\'s Welfare Fund'];

  function pageBusiness() {
    if (!data.business.length) data.business.push(ReturnState.blankBusiness());
    let body = '';
    data.business.forEach((b, i) => {
      const p = 'business[' + i + ']';
      const c = res.biz.rows[i] || { grossProfit: 0, expenses: 0, net: 0 };
      const bal = b.balance;
      const totalAssets = TaxCalc.n(bal.cash) + TaxCalc.n(bal.inventories) + TaxCalc.n(bal.fixedAssets) + TaxCalc.n(bal.otherAssets);
      const closingCapital = TaxCalc.n(bal.openingCapital) + c.net - TaxCalc.n(bal.withdrawals);
      body += UI.card('Business ' + (i + 1),
        '<div class="grid2"><div>' +
        UI.field({
          label: 'Business Category', type: 'select', path: p + '.businessCategory', help: 'businessCategory', value: b.businessCategory,
          options: ['Business or Professional Income', 'Business or Professional Income (with TDS)', 'Business Subject to Final Tax',
            'Business Exempted from Turnover Tax', 'Manufacturing of Tobacco Products', 'Production of Tea or Rubber',
            'Manufacturing of Carbonated/ Sweetened Beverage', 'Certain Sources of Agro-Business Income',
            'Business Income from Royalty, Intangibles etc.', 'Special Business Income', 'Income Subject to Reduced Tax Rate']
        }) +
        UI.field({ label: 'Business Type', type: 'select', path: p + '.businessType', value: b.businessType, options: ['Business (Regular)', 'Profession (Without TDS)'] }) +
        UI.field({ label: 'Business Name', type: 'text', path: p + '.businessName', help: 'businessName', value: b.businessName }) +
        UI.field({ label: 'Business Address', type: 'text', path: p + '.businessAddress', value: b.businessAddress }) +
        UI.card('Income Summary',
          UI.field({ label: 'Sales/Turnover/Receipts', path: p + '.turnover', help: 'turnover', value: b.turnover }) +
          UI.field({ label: 'Cost of Production/ Cost of Goods Sold', path: p + '.costOfGoodsSold', help: 'costOfGoodsSold', value: b.costOfGoodsSold }) +
          UI.field({ label: 'Gross Profit', readonly: true, value: f(c.grossProfit) })
        ) +
        UI.dynTable({
          title: 'Expenses', help: 'businessExpense', path: p + '.expenses', addLabel: 'Add',
          cols: [{ key: 'type', label: 'Particulars', type: 'select', options: BIZ_EXPENSES, width: '60%' }, { key: 'amount', label: 'Amount' }],
          rows: b.expenses || []
        }) +
        UI.calcTable([
          { label: 'Total general, administrative, selling & other expenses', value: c.expenses },
          { label: 'Net Profit', value: c.net, cls: 'strong' }
        ]) +
        '</div><div>' +
        UI.field({ label: 'Maintain Books of Accounts?', type: 'radio', path: p + '.booksOfAccounts', value: b.booksOfAccounts, options: ['Yes', 'No'] }) +
        UI.card('Balance Sheet Summary',
          UI.field({ label: 'Cash in Hand & at Bank', path: p + '.balance.cash', value: bal.cash }) +
          UI.field({ label: 'Inventories', path: p + '.balance.inventories', value: bal.inventories }) +
          UI.field({ label: 'Fixed Assets', path: p + '.balance.fixedAssets', value: bal.fixedAssets }) +
          UI.field({ label: 'Other Assets', path: p + '.balance.otherAssets', value: bal.otherAssets }) +
          UI.field({ label: 'Total Assets', readonly: true, value: f(totalAssets) }) +
          UI.field({ label: 'Opening Capital & New Investment This Year', path: p + '.balance.openingCapital', value: bal.openingCapital }) +
          UI.field({ label: 'Net Profit', readonly: true, value: f(c.net) }) +
          UI.field({ label: 'Withdrawals in the Income Year', path: p + '.balance.withdrawals', value: bal.withdrawals }) +
          UI.field({ label: 'Closing Capital', readonly: true, value: f(closingCapital) }) +
          UI.field({ label: 'Liabilities', path: p + '.balance.liabilities', value: bal.liabilities }) +
          UI.field({ label: 'Total Capital and Liabilities', readonly: true, value: f(closingCapital + TaxCalc.n(bal.liabilities)) }),
          'balanceSheet') +
        (Math.abs(totalAssets - (closingCapital + TaxCalc.n(bal.liabilities))) > 1
          ? '<div class="tip warn"><h4>ব্যালান্স মিলছে না</h4><p>Total Assets (' + f(totalAssets) + ') ও Total Capital and Liabilities (' +
          f(closingCapital + TaxCalc.n(bal.liabilities)) + ') সমান হতে হবে। পার্থক্য ' +
          f(totalAssets - (closingCapital + TaxCalc.n(bal.liabilities))) + ' টাকা — লাইভ সাইট এখানে আটকে দেবে।</p></div>' : '') +
        (data.business.length > 1 ? '<button class="btn danger" data-del="business" data-i="' + i + '">মুছুন</button>' : '') +
        '</div></div>');
    });
    return head('Income Details', 'income') + incomeChips('business') + kpis() + body +
      '<div style="margin-bottom:14px"><button class="btn ghost" data-add="business">+ Add Another Type</button></div>' +
      UI.pageActions();
  }

  /* ---------------- পাতা: Capital Gain ---------------- */

  function pageCapitalGain() {
    if (!data.capitalGain.length) data.capitalGain.push(ReturnState.blankCapitalGain());
    let body = '';
    data.capitalGain.forEach((c, i) => {
      const p = 'capitalGain[' + i + ']';
      const r = res.cg.rows[i] || { gain: 0, tds: 0 };
      body += UI.card('Capital Gain ' + (i + 1),
        '<div class="grid2"><div>' +
        UI.field({
          label: 'Type of Gains', type: 'select', path: p + '.typeOfGains', help: 'typeOfGains', value: c.typeOfGains,
          options: ['Transfer of property (Land Only)', 'Transfer of property (House/Apartment)',
            'Signing money from the developer', 'Compensation against property acquisition',
            'Transfer of share of listed Company (Individual)',
            'Transfer of share of listed Company (Director/Sponsor/Placement Shareholder)',
            'Transfer of share of not-listed Company/Private Limited Company',
            'Transfer of business or undertaking',
            'Transfer of personal effects (Gold, Silver, Gems, Diamond, Coin, Metal, Ornament)',
            'Transfer of valuable assets (Painting, Antiques, Club Membership)',
            'Other capital gain', 'Gain subject to reduced tax rate']
        }) +
        UI.field({ label: 'Description of the Property', type: 'text', path: p + '.description', value: c.description }) +
        UI.field({ label: 'Sale Deed Value', path: p + '.saleDeedValue', help: 'saleDeedValue', value: c.saleDeedValue }) +
        UI.field({ label: 'Excess Amount Received Over Deed Value', path: p + '.excessOverDeed', help: 'excessOverDeed', value: c.excessOverDeed }) +
        UI.field({ label: 'Cost of Acquisition', path: p + '.costOfAcquisition', help: 'costOfAcquisition', value: c.costOfAcquisition }) +
        UI.field({ label: 'Tax Deducted/Collected at Source', path: p + '.tds', help: 'cgTds', value: c.tds }) +
        '</div><div>' +
        UI.calcTable([
          { label: 'Capital Gain (Based On Sale Deed)', value: Math.max(0, TaxCalc.n(c.saleDeedValue) - TaxCalc.n(c.costOfAcquisition)) },
          { label: 'Capital Gain (Excess Amount Received)', value: c.excessOverDeed },
          { label: 'Total Capital Gain', value: r.gain, cls: 'strong' },
          { label: 'উৎসে কর্তিত কর (প্রদেয় কর থেকে বাদ যাবে)', value: r.tds }
        ], { head: ['Summary', 'Amount'] }) +
        (data.capitalGain.length > 1 ? '<div style="margin-top:12px"><button class="btn danger" data-del="capitalGain" data-i="' + i + '">মুছুন</button></div>' : '') +
        '</div></div>');
    });
    return head('Income Details', 'income') + incomeChips('capital-gain') + kpis() + body +
      '<div style="margin-bottom:14px"><button class="btn ghost" data-add="capitalGain">+ Add Another Category</button></div>' +
      UI.pageActions();
  }

  /* ---------------- পাতা: Financial Assets ---------------- */

  function pageFinancialAssets() {
    const types = ['Interest From Sanchayapatra', 'Interest/Profit (Bank/FI)',
      'Interest/Profit/Discount on Treasury Bill/Bond/SUKUK/Other Securities with TDS',
      'Dividend (Any kind)', 'Interest From Any Other Securities/Financial Assets',
      'Securities Subject to Reduced Tax Rate'];
    const rows = res.fin.rows;
    return head('Income Details', 'income') + incomeChips('financial-assets') + kpis() +
      UI.card('Income from Financial Assets',
        UI.dynTable({
          title: 'সব আর্থিক সম্পদের আয়', help: 'faType', path: 'financialAssets', addLabel: 'Add',
          cols: [
            { key: 'assetType', label: 'ধরন', type: 'select', options: types, width: '30%', help: 'faType' },
            { key: 'particulars', label: 'Scheme / Bank / Reg. No', type: 'text', width: '20%' },
            { key: 'value', label: 'Value', help: 'faValue' },
            { key: 'grossInterest', label: 'Gross Interest', help: 'grossInterest' },
            { key: 'tds', label: 'TDS', help: 'faTds' }
          ],
          rows: data.financialAssets
        }) +
        UI.calcTable([
          { label: 'নিয়মিত হারে করযোগ্য সুদ/মুনাফা', value: res.fin.taxable },
          { label: 'চূড়ান্ত করদায়ভুক্ত সুদ (সঞ্চয়পত্র/ট্রেজারি)', value: res.fin.finalTaxIncome },
          { label: 'মোট উৎসে কর্তিত কর', value: res.fin.tds, cls: 'strong' }
        ]) +
        (rows.some(r => r.isFinal) ? '<div class="tip good"><h4>চূড়ান্ত করদায়</h4><p>সঞ্চয়পত্র ও ট্রেজারি বিল/বন্ডের সুদের উপর কাটা ১০% উৎস করই চূড়ান্ত — এর উপর স্ল্যাব হারে আবার কর বসে না। তাই এই আয় আলাদা রাখা হয়েছে।</p></div>' : '')
      ) + UI.pageActions();
  }

  /* ---------------- পাতা: Other Sources ---------------- */

  function pageOtherSources() {
    const types = ['Royalty', 'Payment from WPPF', 'License Fee', 'Fees for Technical Services',
      'Income From Intangible Assets', 'Cash Subsidy', 'Lottery, Puzzle, Card Game/Online Game, or Similar',
      'Meeting Fee, Honorarium etc. (with TDS)', 'Joint Venture(JV) Profit Share', 'Any Other Income',
      'Income Subject to Reduced Tax Rate'];
    return head('Income Details', 'income') + incomeChips('other-sources') + kpis() +
      UI.card('Income from Other Sources',
        UI.dynTable({
          title: 'অন্যান্য উৎসের আয়', help: 'osType', path: 'otherSources', addLabel: 'Add',
          cols: [
            { key: 'incomeType', label: 'Income Type', type: 'select', options: types, width: '28%', help: 'osType' },
            { key: 'particulars', label: 'Particulars / Client', type: 'text', width: '22%' },
            { key: 'grossAmount', label: 'Gross Amount', help: 'osGross' },
            { key: 'relatedExpense', label: 'Related Expenses', help: 'osExpense' },
            { key: 'tds', label: 'TDS' }
          ],
          rows: data.otherSources
        }) +
        UI.calcTable([
          { label: 'Net Income', value: res.oth.taxable, cls: 'strong' },
          { label: 'উৎসে কর্তিত কর', value: res.oth.tds }
        ])
      ) + UI.pageActions();
  }

  /* ---------------- পাতা: Tax Exempted ---------------- */

  function pageExempted() {
    const types = ['Foreign Remittance', 'Software and IT Business', 'Income from Tax Exempted Bond or Securities',
      'Welfare Allowance from Government/Muktijhoddha Kallyan Trust', 'Rewards from Government',
      'Income from Old Home', 'Income from Prize', 'Income from Pension', 'Universal Pension Scheme',
      'Other Exemption under 6th Schedule Part 1', 'Exemption by SRO'];
    return head('Income Details', 'income') + incomeChips('exempted') + kpis() +
      UI.card('Tax Exempted Income',
        UI.dynTable({
          title: 'করমুক্ত আয়', help: 'exemptType', path: 'exempted', addLabel: 'Add Another Type',
          cols: [
            { key: 'type', label: 'Tax Exempted Income Type', type: 'select', options: types, width: '40%', help: 'exemptType' },
            { key: 'particulars', label: 'Particulars', type: 'text', width: '30%' },
            { key: 'amount', label: 'Amount', help: 'exemptAmount' }
          ],
          rows: data.exempted
        }) +
        UI.calcTable([{ label: 'মোট করমুক্ত আয়', value: res.exemptedIncome, cls: 'strong' }]) +
        '<div class="tip info"><h4>কেন গুরুত্বপূর্ণ</h4><p>করমুক্ত আয় দেখালে কর বাড়ে না, কিন্তু Assets &amp; Liabilities-এর "Source of Fund"-এ যোগ হয় — অর্থাৎ সম্পদ বৃদ্ধি ও খরচের বৈধ ব্যাখ্যা হিসেবে কাজ করে।</p></div>'
      ) + UI.pageActions();
  }

  /* ---------------- পাতা: Rebate ---------------- */

  function pageRebate() {
    const R = data.rebate;
    const inv = res.investment;
    const t = TaxAdvisor.investmentTargets(res, rules);
    const sec = (key, title, cfg, helpKey) => {
      const on = (R[key] || []).length > 0;
      return '<div class="card"><div class="tbl-head"><b>' + esc(title) + '</b>' + UI.helpIcon(helpKey) +
        '<span class="spacer"></span></div>' +
        UI.dynTable(Object.assign({ path: 'rebate.' + key, addLabel: 'Add', rows: R[key] || [], title: '' }, cfg)) + '</div>';
    };

    return head('Rebate', 'rebate') + kpis() +
      '<div class="tip action"><h4>রেয়াতের সূত্র</h4><p>রেয়াত = সর্বনিম্ন { অনুমোদিত বিনিয়োগের ' +
      (rules.rebate.onInvestment * 100) + '%, মোট আয়ের ' + (rules.rebate.onIncome * 100) + '%, ' +
      f(rules.rebate.ceiling) + ' }<br>আপনার সর্বোচ্চ সম্ভব রেয়াত <b>' + f(t.maxRebate) +
      '</b> টাকা — সেটা পেতে বিনিয়োগ লাগবে <b>' + f(t.investForMax) + '</b> টাকা (মোট আয়ের ~' +
      t.optimalPercentOfIncome.toFixed(0) + '%)। এখন দেখানো হয়েছে <b>' + f(inv.allowable) + '</b> টাকা।' +
      (t.moreNeededForMax > 0 ? ' আরও <b>' + f(t.moreNeededForMax) + '</b> টাকা দরকার।' : ' ✅ পূর্ণ।') +
      '</p></div>' +
      UI.card('Investment Category',
        sec('lifeInsurance', 'Life Insurance Premium', {
          cols: [{ key: 'policyNo', label: 'Policy Number', type: 'text' }, { key: 'company', label: 'Insurance Company', type: 'text' },
          { key: 'policyValue', label: 'Policy Value', help: 'policyValue' }, { key: 'premiumPaid', label: 'Premium Paid', help: 'premiumPaid' }]
        }, 'lifeInsurance') +
        sec('dps', 'Deposit Pension Scheme (DPS)', {
          cols: [{ key: 'bank', label: 'Bank/FI', type: 'text' }, { key: 'accountNo', label: 'Account No', type: 'text' }, { key: 'deposit', label: 'Deposit Amount' }]
        }, 'dps') +
        sec('sanchayapatra', 'Approved Sanchayapatra & Other Govt. Securities', {
          cols: [{ key: 'instrument', label: 'Name of the Instrument', type: 'text' }, { key: 'regNo', label: 'Registration No.', type: 'text' },
          { key: 'issueDate', label: 'Issue Date', type: 'text' }, { key: 'amount', label: 'Investment Amount' }]
        }, 'sanchayapatraInv') +
        sec('mutualFund', 'Unit Certificate/Mutual Fund/ETF/Joint Investment Scheme', {
          cols: [{ key: 'name', label: 'Name', type: 'text' }, { key: 'accountNo', label: 'Account No.', type: 'text' }, { key: 'amount', label: 'Investment Amount' }]
        }, 'mutualFund') +
        sec('listedStocks', 'Listed Stocks or Shares', {
          cols: [{ key: 'boAccount', label: 'BO Account No.', type: 'text' }, { key: 'brokerage', label: 'Brokerage House Name', type: 'text' }, { key: 'amount', label: 'Investment During the Year' }]
        }, 'listedStocks') +
        sec('gpf', 'General Provident Fund (GPF)', {
          cols: [{ key: 'accountNo', label: 'Account No.', type: 'text' }, { key: 'contribution', label: 'Contribution' }]
        }, 'gpf') +
        sec('rpf', 'Recognized Provident Fund (RPF)', {
          cols: [{ key: 'employer', label: 'Employer Name', type: 'text' }, { key: 'selfContribution', label: 'Self Contribution' }, { key: 'employerContribution', label: 'Employer Contribution' }]
        }, 'rpf') +
        sec('superannuation', 'Approved Superannuation Fund', {
          cols: [{ key: 'fundName', label: 'Name of the Fund', type: 'text' }, { key: 'date', label: 'Date', type: 'text' }, { key: 'amount', label: 'Contribution Amount' }]
        }, 'superannuation') +
        '<div class="card"><b>Approved Benevolent Fund & Group Insurance Premium</b>' + UI.helpIcon('benevolent') +
        '<div class="row2" style="margin-top:10px">' +
        UI.field({ label: 'Contribution of Benevolent Fund', path: 'rebate.benevolent.benevolentFund', value: R.benevolent.benevolentFund }) +
        UI.field({ label: 'Group Insurance Premium', path: 'rebate.benevolent.groupInsurance', value: R.benevolent.groupInsurance }) + '</div></div>' +
        sec('zakatFund', 'Zakat Fund (Under Zakat Fund Management ACT 2023)', {
          cols: [{ key: 'fundName', label: 'Name of the Zakat Fund', type: 'text' }, { key: 'date', label: 'Date', type: 'text' }, { key: 'amount', label: 'Contribution Amount' }]
        }, 'zakatFund') +
        sec('universalPension', 'Universal Pension Scheme', {
          cols: [{ key: 'scheme', label: 'Name of the Scheme', type: 'select', options: ['প্রবাস', 'প্রগতি', 'সুরক্ষা', 'সমতা'] },
          { key: 'pensionId', label: 'Pension ID Number', type: 'text' }, { key: 'amount', label: 'Investment Amount' }]
        }, 'universalPension') +
        '<div class="card"><b>Others</b><div class="row2" style="margin-top:10px">' +
        UI.field({ label: 'Investment Under 6th Schedule Part 3', path: 'rebate.others.schedule6Part3', value: R.others.schedule6Part3 }) +
        UI.field({ label: 'Investment Under SRO', path: 'rebate.others.sro', value: R.others.sro }) + '</div></div>' +
        UI.calcTable([
          { label: 'Total Actual Investment', value: inv.actual },
          { label: 'Total Allowable Investment for Rebate', value: inv.allowable, cls: 'strong' },
          { label: 'রেয়াত (এই তিনটির সর্বনিম্ন)', raw: '', cls: 'muted' }
        ].concat(res.rebateCandidates.map(c => ({ label: '&nbsp;&nbsp;• ' + c.label, value: c.value })))
          .concat([{ label: 'প্রযোজ্য রেয়াত', value: res.rebateOnInvestment, cls: 'big' }])),
        'rebateIntro') +
      (inv.notes.length ? '<div class="tip warn"><h4>সীমা প্রয়োগ হয়েছে</h4><p>' + inv.notes.join('<br>') + '</p></div>' : '') +
      UI.pageActions();
  }

  /* ---------------- পাতা: Expenditure ---------------- */

  function pageExpenditure() {
    const E = data.expenditure;
    const row = (label, key, help, indent) => '<tr><td style="' + (indent ? 'padding-left:34px;color:#4a6072' : 'font-weight:600') + '">' +
      esc(label) + (help ? UI.helpIcon(help) : '') + '</td>' +
      '<td style="width:190px"><input type="text" class="num" inputmode="numeric" data-path="expenditure.' + key + '" value="' +
      (E[key] === 0 ? '' : esc(E[key])) + '"></td></tr>';
    const ro = (label, val) => '<tr><td style="font-weight:600">' + esc(label) + '</td><td><input readonly class="num" value="' + f(val) + '"></td></tr>';
    const n = TaxCalc.n;
    return head('Expenditure', 'expenditure') + kpis() +
      UI.card('Expenditure (IT-10BB)',
        '<div class="tbl-wrap"><table class="dt"><thead><tr><th>Particulars</th><th style="width:190px">Amount</th></tr></thead><tbody>' +
        row('Expenses for Food, Clothing and Other Essentials', 'food', 'expFood') +
        row('Accommodation Expense', 'accommodation', 'expAccommodation') +
        ro('Auto and Transportation Expenses', n(E.autoDriverFuel) + n(E.autoOther)) +
        row('Driver\'s Salary, Fuel and Maintenance', 'autoDriverFuel', null, true) +
        row('Other Transportation', 'autoOther', null, true) +
        ro('Household and Utility Expenses', n(E.utilityElectricity) + n(E.utilityGasWater) + n(E.utilityPhoneInternet) + n(E.utilityHomeSupport)) +
        row('Electricity', 'utilityElectricity', null, true) +
        row('Gas, Water, Sewer and Garbage', 'utilityGasWater', null, true) +
        row('Phone, Internet, TV channels and Subscription', 'utilityPhoneInternet', null, true) +
        row('Home-Support Stuff and Other Expenses', 'utilityHomeSupport', null, true) +
        row('Education Expenses', 'education', 'expEducation') +
        ro('Festival And Other Special Expenses', n(E.festivalParty) + n(E.tourHoliday) + n(E.philanthropy) + n(E.otherSpecial)) +
        row('Festival, Party, Events', 'festivalParty', null, true) +
        row('Domestic and Overseas Tour, Holiday, Etc.', 'tourHoliday', null, true) +
        row('Philanthropy, Etc', 'philanthropy', null, true) +
        row('Other Special Expenses', 'otherSpecial', null, true) +
        row('Any Other Expenses', 'anyOther') +
        ro('Total Expense Relating to Lifestyle', res.lifestyleExpense) +
        ro('Tax, Charges, Etc. Paid During 1st July 2025 to 30th June 2026', n(E.taxAtSourceAdvance) + n(E.taxSurchargeOther)) +
        row('Payment of Tax at Source & Advance Tax.', 'taxAtSourceAdvance', 'expTaxPaid', true) +
        row('Payment of Tax, Surcharge or Other Amounts', 'taxSurchargeOther', null, true) +
        row('Interest Payment of Personal Loan', 'personalLoanInterest', 'expLoanInterest') +
        row('Environmental Surcharge', 'environmentalSurcharge', 'expEnvSurcharge') +
        ro('Total Amount of Expense and Tax', res.totalExpenseAndTax) +
        '</tbody></table></div>') +
      (res.lifestyleExpense === 0 ? '<div class="tip warn"><h4>খরচ ০ রাখবেন না</h4><p>বাস্তব খরচ না দেখালে অডিটে পড়ার ঝুঁকি বাড়ে। খাওয়া-পরা, বাসা, বিদ্যুৎ, যাতায়াত — সব লিখুন।</p></div>' : '') +
      UI.pageActions();
  }

  /* ---------------- পাতা: Assets & Liabilities ---------------- */

  const ASSET_GROUPS = [
    {
      title: 'Business Related', items: [
        ['businessCapital', 'Business Capital', 'businessCapitalAsset'],
        ['directorShareholding', 'Director\'s Shareholdings in Limited Companies'],
        ['partnershipCapital', 'Capital of Partnership Firm']
      ]
    },
    {
      title: 'Property', items: [
        ['nonAgriProperty', 'Non-Agricultural Property', 'nonAgriProperty'],
        ['advanceNonAgriProperty', 'Advance Made for Non-Agricultural Property'],
        ['agriProperty', 'Agricultural Property', 'agriProperty']
      ]
    },
    {
      title: 'Financial Assets', items: [
        ['shareDebentureBond', 'Share, Debenture, Bond, Securities, Unit Certificate', 'shareDebentureBond'],
        ['sanchayapatra', 'Sanchayapatra', 'sanchayapatraAsset'],
        ['fixedDeposit', 'Fixed Deposits, Term Deposits', 'fixedDepositAsset'],
        ['dps', 'DPS', 'dpsAsset'],
        ['loansGiven', 'Loans Given to Others', 'loansGiven'],
        ['providentFund', 'Provident Fund and Other Fund', 'providentFundAsset'],
        ['otherFinancial', 'Other Financial Assets']
      ]
    },
    {
      title: 'Motor Car, Ornaments, Furniture', items: [
        ['motorCar', 'Motor Car (ক্রয়মূল্য)', 'motorCarAsset'],
        ['motorCarCount', 'গাড়ির সংখ্যা'],
        ['goldJewellery', 'Gold, Diamond, Gems and Other Items', 'goldJewellery'],
        ['furnitureElectronics', 'Furniture, Equipments and Electronic Items', 'furnitureElectronics'],
        ['otherSignificant', 'Other Assets of Significant Value']
      ]
    },
    {
      title: 'Cash and Fund outside Business', items: [
        ['cashInHand', 'Cash in Hand', 'cashInHand'],
        ['bankCardsElectronic', 'Notes, Currencies, Banks, Cards and Other Electronic Cash', 'bankCardsElectronic'],
        ['otherDeposits', 'Other Deposits, Balance and Advance'],
        ['assetOutsideBangladesh', 'Asset Outside Bangladesh', 'assetOutsideBangladesh']
      ]
    }
  ];

  function pageAssets() {
    const A = data.assets, L = data.liabilities, W = data.wealth;
    let left = '';
    ASSET_GROUPS.forEach(g => {
      left += UI.card(g.title, g.items.map(([k, l, hk]) =>
        UI.field({ label: l, path: 'assets.' + k, help: hk, value: A[k] })).join(''));
    });
    const right =
      UI.card('Liabilities (Outside Business)',
        UI.field({ label: 'Borrowing from Bank or Other FI', path: 'liabilities.bankFiLoan', help: 'bankFiLoan', value: L.bankFiLoan }) +
        UI.field({ label: 'Unsecured Loan', path: 'liabilities.unsecuredLoan', help: 'unsecuredLoan', value: L.unsecuredLoan }) +
        UI.field({ label: 'Other Loan or Advance or Overdraft', path: 'liabilities.otherLoanOverdraft', value: L.otherLoanOverdraft })
      ) +
      UI.card('আগের বছর ও অন্যান্য তথ্য',
        UI.field({ label: 'Net Wealth at the Last Date of Previous Income Year', path: 'wealth.previousNetWealth', help: 'previousNetWealth', value: W.previousNetWealth }) +
        UI.field({ label: 'Gift, Donation and Contribution (দিয়েছেন)', path: 'wealth.giftDonation', help: 'giftDonation', value: W.giftDonation }) +
        UI.field({ label: 'Loss, Deduction, Other Expense', path: 'wealth.lossDeductionOtherExpense', value: W.lossDeductionOtherExpense }) +
        UI.field({ label: 'Other Receipts (উত্তরাধিকার/উপহার প্রাপ্তি ইত্যাদি)', path: 'wealth.otherReceipts', help: 'otherReceipts', value: W.otherReceipts }) +
        UI.field({ label: 'সিটি কর্পোরেশনে গৃহসম্পত্তির আয়তন (বর্গফুট)', path: 'wealth.houseSqftInCityCorp', help: 'houseSqftInCityCorp', value: W.houseSqftInCityCorp })
      ) +
      UI.card('Summary',
        UI.calcTable([
          { label: 'Gross Wealth', value: res.grossWealth },
          { label: 'Total Liabilities Outside Business', value: res.totalLiabilities },
          { label: 'Net Wealth', value: res.netWealth, cls: 'strong' },
          { label: 'Net Wealth at the Last Date of Previous Income Year', value: W.previousNetWealth },
          { label: 'Change in Net Wealth', value: res.changeInNetWealth },
          { label: 'Other Fund Outflow During Income Year', value: res.otherFundOutflow },
          { label: 'Total Fund Outflow', value: res.totalFundOutflow, cls: 'strong' },
          { label: 'Source of Fund', value: res.sourceOfFund, cls: 'strong' },
          { label: 'Difference', value: res.fundDifference, cls: 'big' }
        ])) +
      (res.fundDifference < 0
        ? '<div class="tip warn"><h4>You have shortage of fund — লাইভ সাইট এখানে আটকাবে</h4><p>ঘাটতি ' +
        f(Math.abs(res.fundDifference)) + ' টাকা। বৈধ সমাধান: গত বছরের নিট সম্পদ ঠিক করুন, করমুক্ত আয় দেখান, ' +
        'প্রাপ্ত উপহার/উত্তরাধিকার "Other Receipts"-এ দিন, অথবা জীবনযাত্রার ব্যয় বাস্তবসম্মত করুন।</p></div>'
        : '<div class="tip good"><h4>তহবিলের হিসাব মিলেছে</h4><p>উদ্বৃত্ত ' + f(res.fundDifference) + ' টাকা।</p></div>');
    return head('Assets & Liabilities', 'assets', UI.helpIcon('assetsIntro')) + kpis() +
      '<div class="grid2"><div>' + left + '</div><div>' + right + '</div></div>' + UI.pageActions();
  }

  /* ---------------- পাতা: Tax & Payment ---------------- */

  function pageTax() {
    const P = data.payments;
    return head('Tax & Payment', 'tax') + kpis() +
      UI.card('Particulars of Total Income',
        UI.calcTable(res.heads.map(h => ({ label: h.label, value: h.amount }))
          .concat([{ label: 'Total Income', value: res.totalIncome, cls: 'strong' },
          { label: 'Tax Exempted Income', value: res.exemptedIncome }]),
          { head: ['Particulars of Total Income', 'Amount'] })) +
      UI.card('Tax Computation',
        UI.calcTable([
          { label: 'Gross Tax before Rebate — Tax on Regular Income', value: res.slab.tax },
          { label: '&nbsp;&nbsp;Tax on Income u/s 163(3) (চূড়ান্ত করদায়)', value: res.taxOn163 },
          { label: 'Gross Tax before Rebate', value: res.grossTaxBeforeRebate, cls: 'strong' },
          { label: 'Tax Rebate — On Investment', value: res.rebateOnInvestment },
          { label: '&nbsp;&nbsp;Foreign Tax Relief', value: res.foreignTaxRelief },
          { label: 'Tax after Rebate', value: res.taxAfterRebate, cls: 'strong' },
          { label: 'Minimum Payable Tax', value: res.minTax + res.minTaxOn163 },
          { label: 'Net Tax after Rebate', value: res.netTaxAfterRebate, cls: 'strong' },
          { label: 'Surcharge (' + (res.surchargeRate * 100) + '%)', value: res.surcharge },
          { label: 'Total Amount Payable', value: res.totalAmountPayable, cls: 'big' }
        ], { head: ['Particular of Tax Computation', 'Amount'] }) +
        '<details style="margin-top:14px"><summary style="cursor:pointer;color:#01649A">স্ল্যাব অনুযায়ী ভাঙা হিসাব দেখুন</summary>' +
        UI.calcTable(res.slab.breakdown.map(b => ({
          label: b.label + ' @ ' + (b.rate * 100) + '%  (' + f(b.amount) + ')', value: b.tax
        })).concat([{ label: 'মোট স্ল্যাব কর', value: res.slab.tax, cls: 'strong' }])) + '</details>') +
      '<div class="grid2"><div>' +
      UI.card('Payment',
        UI.field({ label: 'Source Tax', path: 'payments.sourceTax', help: 'sourceTax', value: P.sourceTax, hint: res.sourceTaxAuto > 0 ? 'আপনার এন্ট্রি থেকে পাওয়া গেছে <b>' + f(res.sourceTaxAuto) + '</b> টাকা।' : '' }) +
        UI.field({ label: 'Advance Income Tax', path: 'payments.advanceIncomeTax', help: 'advanceIncomeTax', value: P.advanceIncomeTax }) +
        UI.field({ label: 'Tax Paid With Return', path: 'payments.taxPaidWithReturn', help: 'taxPaidWithReturn', value: P.taxPaidWithReturn }) +
        UI.field({ label: 'Environment Surcharge', path: 'payments.environmentSurchargePaid', value: P.environmentSurchargePaid }) +
        UI.field({ label: 'Adjustment of Tax Refund', path: 'payments.refundAdjustment', help: 'refundAdjustment', value: P.refundAdjustment }) +
        UI.field({ label: 'Carry forwarded amount u/s 163 for A/Y 2025-2026', path: 'payments.carryForward', help: 'carryForward', value: P.carryForward }) +
        UI.calcTable([{ label: 'Total Payment & Adjustments', value: res.totalPayments, cls: 'strong' }])
      ) + '</div><div>' +
      UI.card('Final Payable',
        UI.calcTable([
          { label: 'Total Amount Payable', value: res.totalAmountPayable },
          { label: 'Incentive (For 1st quarter submission)', value: res.incentive },
          { label: 'Total Amount after Incentive', value: res.afterIncentive, cls: 'strong' },
          { label: 'Total Payment & Adjustments', value: res.totalPayments },
          { label: 'Refundable', value: res.refundable },
          { label: 'Net Payable', value: res.netPayable, cls: 'big' }
        ])) +
      '<div class="tip info"><h4>লাইভে এখানে কী করবেন</h4><p>ডেমোর এই সংখ্যাগুলো মিলে গেলে লাইভ সাইটে Tax &amp; Payment পাতায় ' +
      'একই মান বসান, তারপর <b>Save</b> চাপুন। প্রয়োজনে "Pay Now"/a-Chalan দিয়ে টাকা দিন। ' +
      '<b>Proceed to online return</b> চাপলেই চূড়ান্ত জমা — নিশ্চিত না হয়ে চাপবেন না।</p></div>' +
      '</div></div>' + UI.pageActions();
  }

  /* ---------------- পাতা: Advisor ---------------- */

  function pageAdvisor() {
    const out = TaxAdvisor.build(data, res, rules);
    const t = out.inv;
    const sim = [];
    const step = Math.max(25000, Math.round(t.investForMax / 4 / 5000) * 5000);
    for (let i = 0; i <= 5; i++) {
      const amt = i * step;
      const r = TaxAdvisor.simulate(data, rules, amt);
      sim.push({ amt, tax: r.netTaxAfterRebate, rebate: r.rebateOnInvestment });
    }
    return head('কর পরামর্শ') + kpis() +
      UI.card('বিনিয়োগ বাড়ালে কর কত হবে (what-if)',
        '<div class="tbl-wrap"><table class="dt"><thead><tr><th>অনুমোদিত বিনিয়োগ</th><th>রেয়াত</th><th>নিট কর</th><th>সাশ্রয়</th></tr></thead><tbody>' +
        sim.map(s => '<tr' + (Math.abs(s.amt - t.investForMax) < step / 2 ? ' style="background:#e8f6ec;font-weight:600"' : '') +
          '><td>' + f(s.amt) + '</td><td>' + f(s.rebate) + '</td><td>' + f(s.tax) + '</td><td>' +
          f(Math.max(0, sim[0].tax - s.tax)) + '</td></tr>').join('') +
        '</tbody></table></div>' +
        '<p class="small muted" style="margin-top:10px">সবুজ সারিটাই সবচেয়ে কার্যকর বিনিয়োগ — এর বেশি বিনিয়োগে আর কর কমে না।</p>') +
      out.tips.map(t2 => '<div class="tip ' + t2.level + '"><h4>' + t2.title + '</h4><p>' +
        t2.body.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</p>' +
        (t2.gain > 0 ? '<span class="gain">সম্ভাব্য সাশ্রয় ≈ ' + f(t2.gain) + ' টাকা</span>' : '') + '</div>').join('') +
      '<div class="page-actions"><button class="btn" data-go="live">লাইভে কী লিখবেন &rarr;</button></div>';
  }

  /* ---------------- পাতা: লাইভে কী লিখবেন ---------------- */

  function pageLive() {
    const steps = [];
    const S = (title, url, rows) => { if (rows.length) steps.push({ title, url, rows }); };
    const V = (fld, val, note) => ({ fld, val, note });
    const A = data.assessment;

    S('১. Regular e-Return → Assessment Information', 'https://etaxnbr.gov.bd/#/user-panel/assessment/regular-return', [
      V('Resident Status', A.residentStatus),
      V('Any income which is fully exempted from tax?', A.hasExemptedIncome),
      V('Any taxable income in the income year?', A.hasTaxableIncome),
      V('Heads of Income — টিক দিন', Object.keys(A.heads).filter(k => A.heads[k]).map(k => ({
        employment: 'Income from Employment', rent: 'Income from Rent', agriculture: 'Income from Agriculture',
        business: 'Income from Business or Profession', capitalGain: 'Capital Gains',
        financialAssets: 'Income from Financial Assets', otherSources: 'Income from Other Sources'
      }[k])).join(', ') || 'কোনোটি নয়')
    ]);

    const ad = data.additional;
    S('২. Additional Information (IT10B Requirements)', 'https://etaxnbr.gov.bd/#/user-panel/additional-information', [
      V('Gross Wealth over 50,00,000?', ad.grossWealthOver50Lakh),
      V('Own Motor Car?', ad.ownMotorCar),
      V('Own Offshore Property?', ad.offshoreProperty),
      V('Shareholder director of a company?', ad.shareholderDirector),
      V('Have any House Property?', ad.houseProperty)
    ]);

    if (A.heads.employment) {
      data.employment.forEach((e, i) => {
        const rows = [V('Employment Type', e.employmentType || '— বেছে নিন —'),
        V('Name of the Employer', e.employer), V('Designation', e.designation),
        V('Basic Salary', f(e.basicSalary)), V('House Rent Allowance', f(e.houseRentAllowance)),
        V('Medical Allowance', f(e.medicalAllowance)), V('Conveyance Allowance', f(e.conveyanceAllowance)),
        V('Festival Bonus', f(e.festivalBonus))];
        (e.extras || []).forEach(x => rows.push(V('Add More → ' + x.key, f(x.amount))));
        const nc = e.nonCash;
        if (TaxCalc.n(nc.rentFreeAccommodation)) rows.push(V('Non-Cash → Rent Free Accommodation', f(nc.rentFreeAccommodation)));
        if (TaxCalc.n(nc.concessionalAccommodation)) rows.push(V('Non-Cash → Accommodation at Concessional Rate', f(nc.concessionalAccommodation)));
        if (TaxCalc.n(nc.vehicleFacility)) rows.push(V('Non-Cash → Vehicle Facility Provided', f(nc.vehicleFacility)));
        if (TaxCalc.n(nc.otherNonCash)) rows.push(V('Non-Cash → Other Non-Cash Benefit', f(nc.otherNonCash)));
        S('৩. Income → Employment ' + (i + 1), 'https://etaxnbr.gov.bd/#/user-panel/employment', rows);
      });
    }
    if (A.heads.rent) {
      data.rent.forEach((r, i) => {
        const rows = [V('Property Type', r.propertyType), V('Address of the Property', r.address),
        V('Is it in any city corporation?', r.inCityCorporation),
        V('Residential → Annual Rent', f(r.residential.annualRent)),
        V('Residential → Rent Received', f(r.residential.rentReceived)),
        V('Commercial → Annual Rent', f(r.commercial.annualRent)),
        V('Deductions → Insurance Premium', f(r.deductions.insurancePremium)),
        V('Deductions → Interest paid on Loan/Mortgage', f(r.deductions.loanInterest)),
        V('Deductions → Municipal, Local Tax', f(r.deductions.municipalTax))];
        S('৪. Income → Rent (Property ' + (i + 1) + ')', 'https://etaxnbr.gov.bd/#/user-panel/rent', rows);
      });
    }
    if (A.heads.agriculture) {
      data.agriculture.forEach((a, i) => S('৫. Income → Agriculture ' + (i + 1), 'https://etaxnbr.gov.bd/#/user-panel/agriculture', [
        V('Agriculture Type', a.agricultureType), V('Maintain Books of Accounts?', a.booksOfAccounts),
        V('Sales Proceed', f(a.salesProceed)),
        V('Cost of Production', a.booksOfAccounts === 'Yes' ? f(a.costOfProduction) : 'স্বয়ংক্রিয় (৬০%)')
      ]));
    }
    if (A.heads.business) {
      data.business.forEach((b, i) => S('৬. Income → Business ' + (i + 1), 'https://etaxnbr.gov.bd/#/user-panel/business', [
        V('Business Category', b.businessCategory), V('Business Name', b.businessName),
        V('Sales/Turnover/Receipts', f(b.turnover)), V('Cost of Goods Sold', f(b.costOfGoodsSold))
      ].concat((b.expenses || []).map(x => V('Expenses → ' + x.type, f(x.amount))))));
    }
    if (A.heads.capitalGain) {
      data.capitalGain.forEach((c, i) => S('৭. Income → Capital Gains ' + (i + 1), 'https://etaxnbr.gov.bd/#/user-panel/capital-gain', [
        V('Type of Gains', c.typeOfGains), V('Description of the Property', c.description),
        V('Sale Deed Value', f(c.saleDeedValue)), V('Cost of Acquisition', f(c.costOfAcquisition)),
        V('Tax Deducted/Collected at Source', f(c.tds))
      ]));
    }
    if (A.heads.financialAssets && data.financialAssets.length) {
      S('৮. Income → Financial Assets', 'https://etaxnbr.gov.bd/#/user-panel/financial-assets',
        data.financialAssets.map(x => V(x.assetType + ' — ' + (x.particulars || ''),
          'Value ' + f(x.value) + ' | Gross Interest ' + f(x.grossInterest) + ' | TDS ' + f(x.tds))));
    }
    if (A.heads.otherSources && data.otherSources.length) {
      S('৯. Income → Other Sources', 'https://etaxnbr.gov.bd/#/user-panel/income-from-other-sources',
        data.otherSources.map(x => V(x.incomeType + ' — ' + (x.particulars || ''),
          'Gross ' + f(x.grossAmount) + ' | Expense ' + f(x.relatedExpense) + ' | TDS ' + f(x.tds))));
    }
    if (A.hasExemptedIncome === 'Yes' && data.exempted.length) {
      S('১০. Income → Tax Exempted Income', 'https://etaxnbr.gov.bd/#/user-panel/tax-exempted-income',
        data.exempted.map(x => V(x.type, f(x.amount))));
    }

    const R = data.rebate, rrows = [];
    (R.lifeInsurance || []).forEach(x => rrows.push(V('Life Insurance Premium → ' + (x.company || ''), 'Policy ' + f(x.policyValue) + ' | Premium ' + f(x.premiumPaid))));
    (R.dps || []).forEach(x => rrows.push(V('DPS → ' + (x.bank || ''), f(x.deposit))));
    (R.sanchayapatra || []).forEach(x => rrows.push(V('Sanchayapatra → ' + (x.instrument || ''), f(x.amount))));
    (R.mutualFund || []).forEach(x => rrows.push(V('Mutual Fund/ETF → ' + (x.name || ''), f(x.amount))));
    (R.listedStocks || []).forEach(x => rrows.push(V('Listed Stocks → BO ' + (x.boAccount || ''), f(x.amount))));
    (R.gpf || []).forEach(x => rrows.push(V('GPF → ' + (x.accountNo || ''), f(x.contribution))));
    (R.rpf || []).forEach(x => rrows.push(V('RPF → ' + (x.employer || ''), 'Self ' + f(x.selfContribution) + ' | Employer ' + f(x.employerContribution))));
    (R.zakatFund || []).forEach(x => rrows.push(V('Zakat Fund → ' + (x.fundName || ''), f(x.amount))));
    (R.universalPension || []).forEach(x => rrows.push(V('Universal Pension → ' + (x.scheme || ''), f(x.amount))));
    if (TaxCalc.n(R.benevolent.benevolentFund)) rrows.push(V('Benevolent Fund', f(R.benevolent.benevolentFund)));
    if (TaxCalc.n(R.benevolent.groupInsurance)) rrows.push(V('Group Insurance Premium', f(R.benevolent.groupInsurance)));
    S('১১. Rebate → Investment Category', 'https://etaxnbr.gov.bd/#/user-panel/rebate', rrows);

    const E = data.expenditure;
    S('১২. Expenditure (IT-10BB)', 'https://etaxnbr.gov.bd/#/user-panel/expenditure', [
      V('Expenses for Food, Clothing and Other Essentials', f(E.food)),
      V('Accommodation Expense', f(E.accommodation)),
      V('Driver\'s Salary, Fuel and Maintenance', f(E.autoDriverFuel)),
      V('Other Transportation', f(E.autoOther)),
      V('Electricity', f(E.utilityElectricity)),
      V('Gas, Water, Sewer and Garbage', f(E.utilityGasWater)),
      V('Phone, Internet, TV channels', f(E.utilityPhoneInternet)),
      V('Home-Support Stuff and Other Expenses', f(E.utilityHomeSupport)),
      V('Education Expenses', f(E.education)),
      V('Festival, Party, Events', f(E.festivalParty)),
      V('Domestic and Overseas Tour, Holiday', f(E.tourHoliday)),
      V('Philanthropy, Etc', f(E.philanthropy)),
      V('Other Special Expenses', f(E.otherSpecial)),
      V('Any Other Expenses', f(E.anyOther)),
      V('Payment of Tax at Source & Advance Tax', f(E.taxAtSourceAdvance)),
      V('Payment of Tax, Surcharge or Other Amounts', f(E.taxSurchargeOther)),
      V('Interest Payment of Personal Loan', f(E.personalLoanInterest)),
      V('Environmental Surcharge', f(E.environmentalSurcharge))
    ].filter(r => r.val !== '0'));

    const As = data.assets, L = data.liabilities;
    const arows = [];
    ASSET_GROUPS.forEach(g => g.items.forEach(([k, l]) => {
      if (TaxCalc.n(As[k])) arows.push(V(l, f(As[k])));
    }));
    if (TaxCalc.n(L.bankFiLoan)) arows.push(V('Liabilities → Borrowing from Bank or Other FI', f(L.bankFiLoan)));
    if (TaxCalc.n(L.unsecuredLoan)) arows.push(V('Liabilities → Unsecured Loan', f(L.unsecuredLoan)));
    if (TaxCalc.n(L.otherLoanOverdraft)) arows.push(V('Liabilities → Other Loan or Overdraft', f(L.otherLoanOverdraft)));
    arows.push(V('Net Wealth at the Last Date of Previous Income Year', f(data.wealth.previousNetWealth)));
    if (TaxCalc.n(data.wealth.otherReceipts)) arows.push(V('Source of Fund → Other Receipts', f(data.wealth.otherReceipts)));
    S('১৩. Assets & Liabilities (IT-10B)', 'https://etaxnbr.gov.bd/#/user-panel/assets-and-liabilities', arows);

    const P = data.payments;
    S('১৪. Tax & Payment', 'https://etaxnbr.gov.bd/#/user-panel/tax-and-payment', [
      V('Source Tax', f(P.sourceTax || res.sourceTaxAuto)),
      V('Advance Income Tax', f(P.advanceIncomeTax)),
      V('Tax Paid With Return', f(P.taxPaidWithReturn)),
      V('Adjustment of Tax Refund', f(P.refundAdjustment)),
      V('— যাচাই: Total Amount Payable', f(res.totalAmountPayable), 'লাইভে এই সংখ্যাটাই আসা উচিত'),
      V('— যাচাই: Net Payable', f(res.netPayable), 'না মিললে কোথাও অমিল আছে')
    ]);

    return head('লাইভে কী লিখবেন') +
      '<div class="tip warn"><h4>মনে রাখুন</h4><p>এই তালিকা দেখে দেখে <b>etaxnbr.gov.bd</b>-তে বসান। ' +
      'প্রতিটি পাতায় <b>Save &amp; Continue</b> চাপুন। সবার শেষে Tax &amp; Payment পাতায় সংখ্যাগুলো ' +
      'ডেমোর সাথে মিলিয়ে নিন — মিলে গেলে তবেই <b>Proceed to online return</b> চেপে চূড়ান্ত জমা দিন।</p></div>' +
      '<div class="page-actions" style="margin-bottom:14px"><button class="btn ghost" data-act="print">🖨️ প্রিন্ট / PDF</button>' +
      '<button class="btn ghost" data-act="copy-live">📋 টেক্সট কপি</button></div>' +
      '<div class="copy-list" id="liveList">' + steps.map(s =>
        '<div class="copy-step"><div class="h">' + esc(s.title) + '<span class="spacer" style="flex:1"></span>' +
        '<span class="url">' + esc(s.url.replace('https://etaxnbr.gov.bd/', '')) + '</span></div><table>' +
        s.rows.map(r => '<tr><td class="f">' + esc(r.fld) + '</td><td class="v">' + esc(r.val) +
          (r.note ? '<div class="note">' + esc(r.note) + '</div>' : '') + '</td></tr>').join('') +
        '</table></div>').join('') + '</div>';
  }

  /* ---------------- পাতা: Return View ---------------- */

  function pageReturnView() {
    const t = data.taxpayer;
    return head('Return View', 'return') +
      UI.card('',
        '<div style="text-align:center;margin-bottom:20px">' +
        '<div class="small muted">National Board of Revenue — ডেমো কপি</div>' +
        '<h2 style="font-size:20px;margin:8px 0">Return of Income — Assessment Year ' + esc(data.assessment.assessmentYear) + '</h2>' +
        '<div class="small muted">Income Year: ' + esc(data.assessment.incomeYearFrom) + ' — ' + esc(data.assessment.incomeYearTo) + '</div></div>' +
        '<div class="grid2">' +
        UI.calcTable([
          { label: 'Name', raw: esc(t.name || '—') },
          { label: 'TIN', raw: esc(t.tin || '—') },
          { label: 'Resident Status', raw: esc(data.assessment.residentStatus) },
          { label: 'করদাতার শ্রেণি', raw: esc({ general: 'সাধারণ', female_senior: 'নারী/৬৫+', disabled_third: 'প্রতিবন্ধী/তৃতীয় লিঙ্গ', freedom_fighter: 'মুক্তিযোদ্ধা' }[t.category]) },
          { label: 'করমুক্ত সীমা', value: res.threshold }
        ], { head: ['করদাতার তথ্য', ''] }) +
        UI.calcTable([
          { label: 'Total Income', value: res.totalIncome },
          { label: 'Tax Exempted Income', value: res.exemptedIncome },
          { label: 'Gross Wealth', value: res.grossWealth },
          { label: 'Net Wealth', value: res.netWealth },
          { label: 'Total Amount Payable', value: res.totalAmountPayable, cls: 'strong' },
          { label: 'Net Payable', value: res.netPayable, cls: 'big' }
        ], { head: ['সারাংশ', 'Amount'] }) + '</div>' +
        UI.calcTable(res.heads.filter(h => h.amount).map(h => ({ label: h.label, value: h.amount }))
          .concat([{ label: 'Total Income', value: res.totalIncome, cls: 'strong' }]),
          { head: ['Heads of Income', 'Amount'] })) +
      '<div class="page-actions"><button class="btn ghost" data-act="print">🖨️ প্রিন্ট / PDF</button></div>';
  }

  /* ---------------- পাতা: Rules ---------------- */

  function pageRules() {
    const R = rules;
    return head('কর নীতিমালা (' + R.label + ')') +
      '<div class="tip info"><h4>কেন এখানে বদলানো যায়</h4><p>NBR প্রতি বছর নিয়ম বদলায়, আর প্রকাশিত উৎসেও কখনও অমিল থাকে। ' +
      'লাইভ সাইটের হিসাবের সাথে ডেমোর হিসাব না মিললে নিচের সংখ্যাগুলো বদলে নিন — গণনা সাথে সাথে ঠিক হয়ে যাবে।</p>' +
      '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn ghost" data-act="rules-preset" data-year="2026-2027">AY 2026-2027 (চলতি)</button>' +
      '<button class="btn ghost" data-act="rules-preset" data-year="2025-2026">AY 2025-2026 (গত বছর)</button>' +
      '</div>' +
      '<p class="small" style="margin-top:10px">গত বছরের নিয়ম দিয়ে যাচাই করা হয়েছে: করযোগ্য বেতন আয় ৬,৩৬,৩৬০ → কর ২৩,৬৩৬; ' +
      'বিনিয়োগ ১,২১,৮০০ → রেয়াত ১৮,২৭০। বাংলাদেশি টিউটোরিয়ালের বাস্তব সংখ্যার সাথে ডেমোর হিসাব হুবহু মেলে।</p></div>' +
      '<div class="grid2"><div>' +
      UI.card('করমুক্ত সীমা',
        UI.field({ label: 'সাধারণ (পুরুষ)', path: 'threshold.general', value: R.threshold.general }) +
        UI.field({ label: 'নারী ও ৬৫+', path: 'threshold.female_senior', value: R.threshold.female_senior }) +
        UI.field({ label: 'প্রতিবন্ধী / তৃতীয় লিঙ্গ', path: 'threshold.disabled_third', value: R.threshold.disabled_third }) +
        UI.field({ label: 'গেজেটেড মুক্তিযোদ্ধা', path: 'threshold.freedom_fighter', value: R.threshold.freedom_fighter }) +
        UI.field({ label: 'প্রতিবন্ধী সন্তান প্রতি অতিরিক্ত', path: 'disabledChildRelief', value: R.disabledChildRelief })
      ) +
      UI.card('স্ল্যাব (করমুক্ত সীমার উপরে)',
        R.slabs.map((s, i) => '<div class="row2">' +
          UI.field({ label: 'ধাপ ' + (i + 1) + ' — পরিমাণ', path: 'slabs[' + i + '].width', value: s.width === Infinity ? '∞' : s.width, readonly: s.width === Infinity }) +
          UI.field({ label: 'হার (%)', path: 'slabs[' + i + '].ratePct', value: (s.rate * 100) }) + '</div>').join('')
      ) +
      '</div><div>' +
      UI.card('বেতন ছাড় ও রেয়াত',
        UI.field({ label: 'বেতন ছাড়ের ভগ্নাংশ (১/৩ = 0.3333)', path: 'salaryExemption.fraction', value: R.salaryExemption.fraction }) +
        UI.field({ label: 'বেতন ছাড়ের সিলিং', path: 'salaryExemption.ceiling', value: R.salaryExemption.ceiling }) +
        UI.field({ label: 'রেয়াত — বিনিয়োগের হার (%)', path: 'rebate.onInvestmentPct', value: R.rebate.onInvestment * 100 }) +
        UI.field({ label: 'রেয়াত — মোট আয়ের হার (%)', path: 'rebate.onIncomePct', value: R.rebate.onIncome * 100 }) +
        UI.field({ label: 'রেয়াতের সর্বোচ্চ সীমা', path: 'rebate.ceiling', value: R.rebate.ceiling })
      ) +
      UI.card('ন্যূনতম কর ও অন্যান্য',
        UI.field({ label: 'ন্যূনতম কর (সাধারণ)', path: 'minimumTax.standard', value: R.minimumTax.standard }) +
        UI.field({ label: 'ন্যূনতম কর (নতুন করদাতা)', path: 'minimumTax.firstTime', value: R.minimumTax.firstTime }) +
        UI.field({ label: 'ভাড়া — আবাসিক মেরামত হার (%)', path: 'rentRepairRate.residentialPct', value: R.rentRepairRate.residential * 100 }) +
        UI.field({ label: 'ভাড়া — বাণিজ্যিক মেরামত হার (%)', path: 'rentRepairRate.commercialPct', value: R.rentRepairRate.commercial * 100 }) +
        UI.field({ label: '১ম কোয়ার্টার প্রণোদনা (%)', path: 'firstQuarterIncentivePct', value: R.firstQuarterIncentive * 100 })
      ) +
      UI.card('সারচার্জ',
        R.surcharge.map((s, i) => '<div class="row2">' +
          UI.field({ label: 'নিট সম্পদ পর্যন্ত', path: 'surcharge[' + i + '].upto', value: s.upto === Infinity ? '∞' : s.upto, readonly: s.upto === Infinity }) +
          UI.field({ label: 'হার (%)', path: 'surcharge[' + i + '].ratePct', value: s.rate * 100 }) + '</div>').join('')
      ) +
      '</div></div>' +
      '<div class="page-actions"><button class="btn ghost" data-act="rules-reset">ডিফল্টে ফিরে যান</button></div>' +
      '<div class="card"><h2>তথ্যসূত্র</h2><p class="small muted" style="line-height:1.9">' +
      'করবর্ষ ২০২৬-২০২৭ (আয়বর্ষ ০১-০৭-২০২৫ — ৩০-০৬-২০২৬) — Finance Act 2026 / আয়কর আইন ২০২৩।<br>' +
      'উৎসে প্রকাশিত তথ্যে কিছু অমিল আছে (বিশেষ করে করমুক্ত সীমা ৩,৭৫,০০০ বনাম ৪,০০,০০০ এবং ' +
      'রেয়াতের হার ১৫% বনাম ১০%)। এখানে Finance Act 2026 অনুযায়ী <b>৪,০০,০০০</b> ও <b>১০% / ৩% / ৭,৫০,০০০</b> ধরা হয়েছে। ' +
      '<b>লাইভ eReturn-এ Tax &amp; Payment পাতার সংখ্যার সাথে মিলিয়ে নিন</b> — না মিললে উপরে বদলে নিন।</p></div>';
  }

  /* ---------------- পাতা: তথ্যভাণ্ডার ---------------- */

  function pageInfo() {
    let h = head('তথ্যভাণ্ডার — যা জানা দরকার') +
      '<div class="tip info"><h4>এক জায়গায় সব</h4><p>বাংলাদেশের আয়কর নিয়ে যেসব তথ্য NBR-এর প্রকাশনা, ' +
      'আইন ফার্মের গাইড ও কর ব্লগে ছড়িয়ে আছে — সেগুলো এখানে গুছিয়ে দেওয়া হয়েছে।<br>' +
      '⚠️ নিয়ম প্রতি বছর বদলায়। বড় সিদ্ধান্তের আগে NBR বা একজন কর আইনজীবীর কাছে যাচাই করে নিন।</p></div>' +
      '<div class="infonav">' + RefInfo.SECTIONS.map(s =>
        '<button class="pill" data-scroll="sec-' + s.id + '">' + s.icon + ' ' + esc(s.title) + '</button>').join('') +
      '</div>';

    RefInfo.SECTIONS.forEach(s => {
      let body = s.intro ? '<p class="secintro">' + nl2(s.intro) + '</p>' : '';
      if (s.items) {
        body += '<div class="deflist">' + s.items.map(i =>
          '<div class="dl"><div class="dt">' + nl2(i[0]) + '</div>' +
          (i[1] ? '<div class="dd">' + nl2(i[1]) + '</div>' : '') + '</div>').join('') + '</div>';
      }
      if (s.groups) {
        body += '<div class="zgrid">' + s.groups.map(g =>
          '<div class="zcard"><div class="zt">' + esc(g[0]) + '</div>' +
          '<ul class="chklist">' + g[1].map(x => '<li>' + nl2(x) + '</li>').join('') + '</ul></div>').join('') + '</div>';
      }
      if (s.qa) {
        body += s.qa.map(q =>
          '<details class="faq"><summary>' + esc(q[0]) + '</summary><div>' + nl2(q[1]) + '</div></details>').join('');
      }
      if (s.note) body += '<div class="tip info" style="margin-top:12px"><p>' + nl2(s.note) + '</p></div>';
      if (s.src) body += '<div class="srcline">উৎস: ' + esc(s.src) + '</div>';
      h += '<div id="sec-' + s.id + '">' + UI.card(s.icon + '  ' + s.title, body) + '</div>';
    });
    return h;
  }

  /* ---------------- পাতা: জিরো রিটার্ন গাইড ---------------- */

  function pageZero() {
    const z = ZeroGuide.analyse(data, res, rules);
    let h = head('জিরো রিটার্ন — ০ টাকা কর দিয়ে রিটার্ন') + kpis();

    /* আপনার অবস্থা */
    if (z.state === 'zero') {
      h += '<div class="verdict good"><div class="vi">✅</div><div><h3>আপনার কর এখনই ০ টাকা</h3>' +
        '<p>মোট আয় <b>' + f(res.totalIncome) + '</b> টাকা, করমুক্ত সীমা <b>' + f(res.threshold) + '</b> টাকা। ' +
        'স্ল্যাব করও ০, ন্যূনতম করও প্রযোজ্য নয়।<br>' +
        'তবু <b>রিটার্ন জমা দিতেই হবে</b> — নাহলে জরিমানা, আর PSR ছাড়া ব্যাংক ঋণ/ট্রেড লাইসেন্স/' +
        'সঞ্চয়পত্র কেনা আটকে যাবে।</p>' +
        '<button class="btn" data-go="live">লাইভে কী লিখবেন দেখুন →</button></div></div>';
    } else if (z.state === 'minonly') {
      h += '<div class="verdict warn"><div class="vi">⚠️</div><div><h3>স্ল্যাব কর ০ করা যাবে, কিন্তু পুরোপুরি ০ নয়</h3>' +
        '<p>আপনার আয় করমুক্ত সীমা (' + f(res.threshold) + ') থেকে <b>' + f(z.gap) + '</b> টাকা বেশি। ' +
        'বিনিয়োগ রেয়াত দিয়ে স্ল্যাব কর ০ করা সম্ভব — কিন্তু তখনও <b>ন্যূনতম কর ' + f(z.minTax) +
        ' টাকা</b> দিতেই হবে।<br>' +
        '<b>সত্যিকারের ০ টাকা</b> তখনই, যখন মোট আয় ' + f(res.threshold) + ' টাকার নিচে থাকে।</p></div></div>';
    } else {
      h += '<div class="verdict danger"><div class="vi">❌</div><div><h3>এখন কর ' + f(res.netTaxAfterRebate) + ' টাকা</h3>' +
        '<p>আয় করমুক্ত সীমা থেকে <b>' + f(z.gap) + '</b> টাকা বেশি। সর্বোচ্চ রেয়াত (' +
        f(z.targets.maxRebate) + ') নিয়েও কর পুরোপুরি ০ হবে না।<br>' +
        'নিচের বৈধ সুযোগগুলো দেখুন — কর অনেকটাই কমানো যেতে পারে।</p></div></div>';
    }

    /* বৈধভাবে কর কমানোর সুযোগ */
    if (z.ways.length) {
      h += UI.card('আপনার জন্য যেসব সুযোগ এখনো বাকি',
        '<p class="muted small" style="margin-top:-6px">সবগুলোই আইনসম্মত। তবে প্রতিটির পেছনে প্রকৃত কাগজ থাকতে হবে।</p>' +
        z.ways.map((w, i) => '<div class="wayrow">' +
          '<div class="wn">' + (i + 1) + '</div>' +
          '<div class="wb"><div class="wt">' + esc(w.title) +
          '<span class="wg">' + esc(w.gainText) + '</span></div>' +
          '<div class="wd">' + nl2(w.how) + '</div>' +
          (w.goto && FieldHelp[w.goto] && FieldHelp[w.goto].path
            ? '<button class="ai-goto" data-goto="' + esc(FieldHelp[w.goto].path) + '" data-label="' +
              esc(FieldHelp[w.goto].t) + '">➜ ' + esc(FieldHelp[w.goto].t) + '</button>' : '') +
          '</div></div>').join(''));
    }

    /* কে কীভাবে জিরো রিটার্ন দেন */
    h += UI.card('আপনি কোন দলে পড়েন? — নমুনা দেখে শিখুন',
      '<p class="muted small" style="margin-top:-6px">যেকোনোটিতে চাপলে ডেমোতে সেই অবস্থার নমুনা ডেটা ভরে দেওয়া হবে — ' +
      'তখন প্রতিটি পাতা ঘুরে দেখতে পারবেন কী কোথায় বসে।</p>' +
      '<div class="zgrid">' + ZeroGuide.PROFILES.map(p =>
        '<div class="zcard"><div class="zi">' + p.icon + '</div>' +
        '<div class="zt">' + esc(p.title) + '</div>' +
        '<div class="zw">' + esc(p.who) + '</div>' +
        '<div class="zy">' + nl2(p.why) + '</div>' +
        '<ol class="zs">' + p.steps.map(s => '<li>' + nl2(s) + '</li>').join('') + '</ol>' +
        '<button class="btn ghost" data-zero="' + esc(p.id) + '">এই নমুনা ভরে দিন</button>' +
        '</div>').join('') + '</div>');

    /* লাইভে জমা দেওয়ার ধাপ */
    h += UI.card('লাইভে জিরো রিটার্ন জমা দেওয়ার ধাপ',
      '<ol class="steps">' + ZeroGuide.LIVE_STEPS.map(s =>
        '<li><b>' + esc(s.s) + '</b> — ' + nl2(s.d) + '</li>').join('') + '</ol>' +
      '<div class="tip warn" style="margin-top:12px"><h4>যা কখনও করবেন না</h4><p>' +
      'আয় গোপন করে কর ০ দেখানো, ভুয়া বিনিয়োগ/খরচের কাগজ, গোঁজামিল দিয়ে Difference শূন্য করা — ' +
      'ধরা পড়লে জরিমানা ও শাস্তি দুটোই। উপরের প্রতিটি পথ বৈধ, কিন্তু প্রকৃত কাগজ লাগবে।</p></div>');

    return h;
  }

  function applyZeroProfile(id) {
    const p = ZeroGuide.PROFILES.find(x => x.id === id);
    if (!p) return;
    if (!confirm('"' + p.title + '" নমুনা ভরে দিলে এখনকার ডেটা মুছে যাবে। চালিয়ে যাবেন?\n\n' +
      '(আগে "সেভ ফাইল" দিয়ে ব্যাকআপ নিতে পারেন)')) return;
    data = ReturnState.defaults();
    data.taxpayer.name = 'ডেমো করদাতা';
    p.fill(data);
    ReturnState.save(data);
    render();
    setTimeout(() => alert('নমুনা ভরে দেওয়া হয়েছে।\n\nএখন বাঁ পাশের Regular e-Return থেকে ' +
      'প্রতিটি পাতা ঘুরে দেখুন — কোথায় কী বসেছে।'), 100);
  }

  /* ---------------- পাতা: লাইভ সাইট গাইড (সাইটম্যাপ) ---------------- */

  function pageGuide() {
    let h = head('লাইভ সাইট গাইড — কোথায় কী আছে') +
      '<div class="tip info"><h4>এটা কী</h4><p>লাইভ <b>etaxnbr.gov.bd</b>-এর প্রতিটি পাতা, ' +
      'প্রতিটি সেকশন আর প্রতিটি ঘরের পূর্ণ তালিকা। কোন ঘরটা কোথায় আছে খুঁজে না পেলে এখানে দেখুন। ' +
      'Ask AI-ও ঠিক এই মানচিত্র দেখেই উত্তর দেয়।</p></div>';

    SiteMap.PAGES.forEach(p => {
      h += '<div class="copy-step"><div class="h">' + esc(p.title) +
        '<span style="flex:1"></span>' +
        (p.demo ? '<button class="btn ghost" data-go="' + esc(p.demo) + '">ডেমোতে খুলুন →</button>' : '') +
        '</div>';
      if (p.intro) h += '<div style="padding:10px 14px;font-size:13px;line-height:1.7;color:#3d4b5a">' + nl2(p.intro) + '</div>';
      p.sections.forEach(sec => {
        h += '<div style="padding:6px 14px;background:#f7fafb;font-weight:600;font-size:13px">' + esc(sec.name) + '</div><table>';
        sec.fields.forEach(fl => {
          const hk = fl[2];
          h += '<tr><td class="f">' + esc(fl[0]) +
            (hk && FieldHelp[hk] ? ' <span class="help" data-help="' + esc(hk) + '">?</span>' : '') +
            (fl[3] ? '<div class="note">' + nl2(fl[3]) + '</div>' : '') + '</td>' +
            '<td class="v" style="width:110px"><span class="small muted">' + esc(fl[1]) + '</span>' +
            (hk && FieldHelp[hk] && FieldHelp[hk].path
              ? '<br><button class="btn ghost" style="margin-top:4px" data-goto="' + esc(FieldHelp[hk].path) + '">➜</button>' : '') +
            '</td></tr>';
        });
        h += '</table>';
      });
      if (p.buttons) {
        h += '<div style="padding:8px 14px;font-size:12px;color:#6b7785">বোতাম: ' +
          p.buttons.map(b => '<b>' + esc(b) + '</b>').join(' · ') + '</div>';
      }
      h += '</div>';
    });
    return h;
  }

  /* ---------------- পাতা: Settings ---------------- */

  function pageSettings() {
    const k = AskAI.allKeys();
    const curFont = getFont(), curScale = getScale();
    return head('সেটিংস / AI key') +
      UI.card('লেখার ফন্ট ও আকার',
        '<p class="muted small" style="margin-top:-6px">পড়তে কষ্ট হলে এখান থেকে বদলে নিন। ' +
        'সাথে সাথেই বদলাবে এবং আপনার ব্রাউজারে মনে থাকবে।</p>' +
        '<div class="fontpick">' + FONTS.map(ft =>
          '<button class="fontcard' + (curFont === ft.id ? ' active' : '') + '" data-font="' + esc(ft.id) + '">' +
          '<div class="fn">' + (curFont === ft.id ? '<span class="tick">✓</span>' : '') +
          esc(ft.bn) + ' — ' + esc(ft.note) + '</div>' +
          '<div class="fs" style="font-family:\'' + esc(ft.id) + '\', sans-serif">' +
          'করমুক্ত সীমা ৪,০০,০০০ টাকা।<br>বিনিয়োগ রেয়াত ও ন্যূনতম কর।</div></button>').join('') +
        '</div>' +
        '<div style="margin-top:18px"><b>লেখার আকার</b>' +
        '<div class="sizepick" style="margin-top:8px">' + SIZES.map(s =>
          '<button class="btn ' + (curScale === s.id ? '' : 'ghost') + '" data-uiscale="' + esc(s.id) + '"' +
          ' style="font-size:calc(' + (13 * parseFloat(s.id)).toFixed(1) + 'px * var(--ui-scale))">' +
          (curScale === s.id ? '✓ ' : '') + esc(s.t) + '</button>').join('') + '</div>' +
        '<div class="small muted" style="margin-top:8px">এখন: <b>' +
        esc((SIZES.find(x => x.id === curScale) || {}).t || 'স্বাভাবিক') + '</b> · ফন্ট: <b>' +
        esc((FONTS.find(x => x.id === curFont) || {}).bn || curFont) + '</b></div></div>') +
      UI.card('Ask AI — API key',
        '<p class="muted small" style="line-height:1.8">key না দিলেও Ask AI কাজ করে (বিল্ট-ইন অফলাইন জ্ঞান থেকে)। ' +
        'key দিলে সত্যিকারের AI বিস্তারিত উত্তর দেবে। key শুধু আপনার ব্রাউজারে থাকে — কোথাও পাঠানো হয় না।<br>' +
        'একটি key/মডেল শেষ হলে (কোটা/৪২৯) নিজে থেকেই পরেরটায় চলে যাবে।</p>' +
        '<div class="field"><label>Gemini API key (প্রতি লাইনে একটি)</label>' +
        '<textarea id="geminiKeys" rows="4" style="width:100%;border:1px solid #ced4da;border-radius:4px;padding:8px;font-family:monospace;font-size:12px">' +
        esc((savedOnly().gemini || []).join('\n')) + '</textarea></div>' +
        '<div class="field"><label>Groq API key (প্রতি লাইনে একটি)</label>' +
        '<textarea id="groqKeys" rows="2" style="width:100%;border:1px solid #ced4da;border-radius:4px;padding:8px;font-family:monospace;font-size:12px">' +
        esc((savedOnly().groq || []).join('\n')) + '</textarea></div>' +
        '<button class="btn" data-act="save-keys">সেভ করুন</button> ' +
        '<button class="btn ghost" data-act="reset-ai">ব্যর্থ key/মডেল রিসেট</button>' +
        '<div style="margin-top:14px" class="small muted">এখন সক্রিয়: Gemini ' + k.gemini.length +
        ' টি key, Groq ' + k.groq.length + ' টি key।' +
        (k.gemini.length ? '<br>' + k.gemini.map(x => '• ' + AskAI.maskKey(x)).join('<br>') : '') +
        (k.groq.length ? '<br>' + k.groq.map(x => '• ' + AskAI.maskKey(x)).join('<br>') : '') +
        '<br>keys.local.js ফাইলে রাখা key গুলো এখানে দেখা যায় কিন্তু এডিট করা যায় না।</div>') +
      UI.card('ডেটা',
        '<button class="btn ghost" data-act="export">রিটার্ন ফাইল হিসেবে সেভ</button> ' +
        '<button class="btn ghost" data-act="import">ফাইল থেকে লোড</button> ' +
        '<button class="btn danger" data-act="reset">সব ডেটা মুছুন</button>');
  }
  function savedOnly() {
    try { return JSON.parse(localStorage.getItem('ereturn-demo:aikeys') || '{}'); } catch (e) { return {}; }
  }

  /* ---------------- ড্রয়ার ও AI প্যানেল ---------------- */

  function drawer() {
    return '<div class="drawer" id="drawer"><header><span id="drawerTitle">সহায়িকা</span>' +
      '<span class="spacer"></span><button data-act="close-drawer">&times;</button></header>' +
      '<div class="body" id="drawerBody"></div></div>';
  }

  function aiPanel() {
    return '<div class="ai-panel" id="aiPanel"><header>💬 Ask AI — কোথায় কী দিতে হবে' +
      '<span class="spacer"></span>' +
      '<button data-act="ai-clear" title="কথোপকথন মুছুন">🗑</button>' +
      '<button data-act="ai-size" title="বড়/ছোট করুন">⤢</button>' +
      '<button data-act="ai-min" title="ছোট করে রাখুন (কথা মুছবে না)">&minus;</button>' +
      '<button data-act="ai-close" title="বন্ধ করুন (কথা সংরক্ষিত থাকবে)">&times;</button></header>' +
      '<div class="ai-log" id="aiLog"></div>' +
      '<div class="ai-chips">' +
      ['কর ০ করব কীভাবে?', 'কত বিনিয়োগ করলে সর্বোচ্চ রেয়াত?', 'বেতন কোথায় দেব?',
        'সঞ্চয়পত্র কোথায় লিখব?', 'সম্পদের হিসাব মিলছে না', 'কীভাবে পূরণ শুরু করব?']
        .map(q => '<button data-askq="' + esc(q) + '">' + esc(q) + '</button>').join('') +
      '</div>' +
      '<div class="ai-input"><input id="aiInput" placeholder="বাংলায় প্রশ্ন লিখুন…"><button data-act="ai-send">➤</button></div></div>';
  }

  /* ---------------- রেন্ডার ---------------- */

  const PAGES = {
    home: pageHome, assessment: pageAssessment, additional: pageAdditional,
    employment: pageEmployment, rent: pageRent, agriculture: pageAgriculture,
    business: pageBusiness, 'capital-gain': pageCapitalGain,
    'financial-assets': pageFinancialAssets, 'other-sources': pageOtherSources,
    exempted: pageExempted, rebate: pageRebate, expenditure: pageExpenditure,
    assets: pageAssets, tax: pageTax, advisor: pageAdvisor, live: pageLive,
    'return-view': pageReturnView, rules: pageRules, settings: pageSettings,
    guide: pageGuide, zero: pageZero, info: pageInfo
  };

  function recompute() {
    res = TaxCalc.compute(data, rules);
  }

  function render() {
    recompute();
    const root = document.getElementById('root');
    if (!root.dataset.shell) {
      root.innerHTML = shell();
      root.dataset.shell = '1';
    } else {
      // শেলের সাইডবার/হেডার আপডেট
      const side = root.querySelector('.er-side');
      if (side) side.outerHTML = sidebar();
      const bd = root.querySelector('.side-backdrop');
      if (bd) bd.classList.toggle('show', !sideCollapsed);
      const user = root.querySelector('.er-header .user');
      if (user) user.innerHTML = esc(data.taxpayer.name || 'ডেমো করদাতা') +
        '<span class="avatar">' + esc((data.taxpayer.name || 'ডে').trim().slice(0, 2)) + '</span>';
    }
    const fn = PAGES[route] || pageHome;
    document.getElementById('page').innerHTML = fn();
    // পুরনো তীর যেন ঝুলে না থাকে — যে ঘরটা দেখানো হচ্ছিল সেটা DOM-এ না থাকলে সরাও
    if (spot && !document.body.contains(spot.el)) clearSpotlight();
    applyWarnings();
    restoreAIPanel();
    window.scrollTo({ top: 0 });
  }

  /* শেল আবার তৈরি হলেও AI প্যানেল যেন খোলা ও কথাসহ থাকে */
  function restoreAIPanel() {
    const p = document.getElementById('aiPanel');
    if (!p) return;
    if (!p.dataset.painted) { p.dataset.painted = '1'; paintAILog(); }
    if (aiWasOpen && !p.classList.contains('open')) {
      p.classList.add('open');
      const fab = document.querySelector('.ai-fab');
      if (fab) fab.style.display = 'none';
    }
  }

  function rerender() {
    const el = document.activeElement;
    const p = el && el.getAttribute && el.getAttribute('data-path');
    const pos = el && el.selectionStart;
    recompute();
    const fn = PAGES[route] || pageHome;
    document.getElementById('page').innerHTML = fn();
    // পুরনো তীর যেন ঝুলে না থাকে — যে ঘরটা দেখানো হচ্ছিল সেটা DOM-এ না থাকলে সরাও
    if (spot && !document.body.contains(spot.el)) clearSpotlight();
    applyWarnings();
    if (p) {
      const nel = document.querySelector('#page [data-path="' + p.replace(/"/g, '\\"') + '"]');
      if (nel) { nel.focus(); try { nel.setSelectionRange(pos, pos); } catch (e) {} }
    }
  }

  /* ---------------- ইভেন্ট ---------------- */

  function parseNum(v) {
    if (v === '' || v === null) return 0;
    const x = parseFloat(String(v).replace(/,/g, '').trim());
    return isNaN(x) ? 0 : x;
  }

  function applyRulesPath(path, raw) {
    // rules পাতার বিশেষ পথ (শতাংশ → ভগ্নাংশ)
    if (/Pct$/.test(path)) {
      const real = path.replace(/Pct$/, '');
      UI.set(rules, real, parseNum(raw) / 100);
    } else if (/slabs\[\d+\]\.width$/.test(path) || /surcharge\[\d+\]\.upto$/.test(path)) {
      if (raw === '∞' || raw === '') return;
      UI.set(rules, path, parseNum(raw));
    } else if (path === 'salaryExemption.fraction') {
      UI.set(rules, path, parseNum(raw));
    } else {
      UI.set(rules, path, parseNum(raw));
    }
    TaxRules.save(rules);
  }

  function onInput(e) {
    const el = e.target;
    const path = el.getAttribute && el.getAttribute('data-path');
    if (!path) return;
    if (route === 'rules') { applyRulesPath(path, el.value); rerender(); return; }

    let val;
    if (el.type === 'checkbox') val = el.checked;
    else if (el.classList.contains('num')) val = parseNum(el.value);
    else val = el.value;

    UI.set(data, path, val);
    ReturnState.save(data);
    spotlightDone(el);   // যে ঘরটি দেখানো হচ্ছিল সেটাই পূরণ হলে তীর সরিয়ে দাও

    if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'radio') render();
    else rerender();
  }

  function pathArray(path) {
    // "employment" বা "employment[0].extras"
    return UI.get(data, path) || [];
  }

  function blankFor(path) {
    if (path === 'employment') return ReturnState.blankEmployment();
    if (path === 'rent') return ReturnState.blankRent();
    if (path === 'agriculture') return ReturnState.blankAgriculture();
    if (path === 'business') return ReturnState.blankBusiness();
    if (path === 'capitalGain') return ReturnState.blankCapitalGain();
    if (path === 'financialAssets') return ReturnState.blankFinancialAsset();
    if (path === 'otherSources') return ReturnState.blankOtherSource();
    if (path === 'exempted') return ReturnState.blankExempt();
    if (/extras$/.test(path)) return { key: 'Other Bonus', amount: 0 };
    if (/expenses$/.test(path)) return { type: BIZ_EXPENSES[0], amount: 0 };
    if (path === 'rebate.lifeInsurance') return { policyNo: '', company: '', policyValue: 0, premiumPaid: 0 };
    if (path === 'rebate.dps') return { bank: '', accountNo: '', deposit: 0 };
    if (path === 'rebate.sanchayapatra') return { instrument: '', regNo: '', issueDate: '', amount: 0 };
    if (path === 'rebate.mutualFund') return { name: '', accountNo: '', amount: 0 };
    if (path === 'rebate.listedStocks') return { boAccount: '', brokerage: '', amount: 0 };
    if (path === 'rebate.gpf') return { accountNo: '', contribution: 0 };
    if (path === 'rebate.rpf') return { employer: '', selfContribution: 0, employerContribution: 0 };
    if (path === 'rebate.superannuation') return { fundName: '', date: '', amount: 0 };
    if (path === 'rebate.zakatFund') return { fundName: '', date: '', amount: 0 };
    if (path === 'rebate.universalPension') return { scheme: 'প্রগতি', pensionId: '', amount: 0 };
    return {};
  }

  function onClick(e) {
    const el = e.target.closest('[data-act],[data-go],[data-add],[data-del],[data-nav],[data-help],[data-askq],[data-goto],[data-tour],[data-zero],[data-scroll],[data-wact],[data-font],[data-uiscale],.er-side a.item');
    if (!el) return;

    const help = el.getAttribute('data-help');
    if (help) {
      // label-এর ভেতরে থাকলেও যেন চেকবক্স/রেডিও টগল না হয়
      e.preventDefault();
      e.stopPropagation();
      openHelp(help);
      return;
    }

    const goto = el.getAttribute('data-goto');
    if (goto) { focusField(goto, el.getAttribute('data-label')); return; }

    const tour = el.getAttribute('data-tour');
    if (tour) { startTour(JSON.parse(tour)); return; }

    const zp = el.getAttribute('data-zero');
    if (zp) { applyZeroProfile(zp); return; }

    const fnt = el.getAttribute('data-font');
    if (fnt) {
      try { localStorage.setItem(FONT_KEY, fnt); } catch (err) {}
      applyFont(); render();
      toast('✅ ফন্ট বদলে গেছে — ' + ((FONTS.find(x => x.id === fnt) || {}).bn || fnt));
      return;
    }
    const usc = el.getAttribute('data-uiscale');
    if (usc) {
      try { localStorage.setItem(SIZE_KEY, usc); } catch (err) {}
      applyFont(); render();
      toast('✅ লেখার আকার — ' + ((SIZES.find(x => x.id === usc) || {}).t || usc));
      return;
    }

    const wa = el.getAttribute('data-wact');
    if (wa) {
      e.preventDefault(); e.stopPropagation();
      try { doWarnAction(JSON.parse(wa)); } catch (err) {}
      return;
    }

    const sc = el.getAttribute('data-scroll');
    if (sc) {
      const t = document.getElementById(sc);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const go = el.getAttribute('data-go');
    if (go) { if (isMobile()) sideCollapsed = true; location.hash = '#' + go; return; }

    // ফোনে সাইডবারের লিংকে চাপলে সাইডবার বন্ধ হয়ে যাক
    if (isMobile() && el.classList && el.classList.contains('item')) sideCollapsed = true;

    const add = el.getAttribute('data-add');
    if (add) {
      const arr = pathArray(add);
      arr.push(blankFor(add));
      UI.set(data, add, arr);
      ReturnState.save(data); render(); return;
    }

    const del = el.getAttribute('data-del');
    if (del) {
      const arr = pathArray(del);
      arr.splice(+el.getAttribute('data-i'), 1);
      UI.set(data, del, arr);
      ReturnState.save(data); render(); return;
    }

    const nav = el.getAttribute('data-nav');
    if (nav) {
      const list = flow();
      const i = list.indexOf(route);
      const t = nav === 'back' ? list[Math.max(0, i - 1)] : list[Math.min(list.length - 1, i + 1)];
      location.hash = '#' + t; return;
    }

    const askq = el.getAttribute('data-askq');
    if (askq) { openAI(); askAI(askq); return; }

    switch (el.getAttribute('data-act')) {
      case 'burger': sideCollapsed = !sideCollapsed; render(); break;
      case 'close-side': sideCollapsed = true; render(); break;
      case 'warnings': openWarnings(); break;
      case 'tour-next': tourStep(1); break;
      case 'tour-prev': tourStep(-1); break;
      case 'tour-stop': stopTour(); break;
      case 'split-apply': applySplit(); break;
      case 'rules-preset': {
        const y = el.getAttribute('data-year');
        rules = TaxRules.preset(y); TaxRules.save(rules); render(); break;
      }
      case 'close-drawer': document.getElementById('drawer').classList.remove('open'); break;
      case 'ai': openAI(); break;
      case 'ai-min':
      case 'ai-close': closeAI(false); break;
      case 'ai-clear': clearAIChat(); break;
      case 'ai-size': {
        const p = document.getElementById('aiPanel');
        p.classList.toggle('big');
        el.textContent = p.classList.contains('big') ? '⤡' : '⤢';
        break;
      }
      case 'ai-send': {
        const inp = document.getElementById('aiInput');
        const q = inp.value.trim();
        if (q) { inp.value = ''; askAI(q); }
        break;
      }
      case 'print': window.print(); break;
      case 'copy-live': copyLive(); break;
      case 'reset':
        if (confirm('সব ডেটা মুছে যাবে। নিশ্চিত?')) { data = ReturnState.clear(); render(); }
        break;
      case 'export': exportJson(); break;
      case 'import': importJson(); break;
      case 'sample': fillSample(); break;
      case 'rules-reset': rules = TaxRules.reset(); render(); break;
      case 'save-keys': {
        const g = document.getElementById('geminiKeys').value.split('\n').map(s => s.trim()).filter(Boolean);
        const q = document.getElementById('groqKeys').value.split('\n').map(s => s.trim()).filter(Boolean);
        AskAI.setKeys({ gemini: g, groq: q });
        AskAI.clearDead();
        alert('সেভ হয়েছে।'); render(); break;
      }
      case 'reset-ai': AskAI.clearDead(); try { localStorage.removeItem('ereturn-demo:aimodels'); } catch (x) {} alert('রিসেট হয়েছে।'); break;
      case 'scenario-save': {
        const nm = (document.getElementById('scName') || {}).value;
        if (!nm || !nm.trim()) { alert('নাম দিন'); break; }
        ReturnState.saveScenario(nm.trim(), data); render(); break;
      }
      case 'scenario-load': {
        const d = ReturnState.loadScenario(el.getAttribute('data-name'));
        if (d) { data = d; ReturnState.save(data); render(); }
        break;
      }
      case 'scenario-del':
        ReturnState.deleteScenario(el.getAttribute('data-name')); render(); break;
    }
  }

  /* ---------------- সহায়িকা ড্রয়ার ---------------- */

  function nl2 (s) { return esc(s).replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

  /* কোন অপশনটা বাছবেন — টেবিল */
  function choiceTable(key) {
    const c = global.Choices && Choices.get(key);
    if (!c) return '';
    const tagTxt = { good: 'সাধারণত এটাই', care: 'সাবধান', rare: 'কম লাগে' };
    let h = '<div class="hs"><div class="hh">🎯 কোনটা বাছবেন — ' + esc(c.q) + '</div>';
    if (c.rule) h += '<div class="hb" style="margin-bottom:8px">' + nl2(c.rule) + '</div>';
    h += '<div class="choice-list">';
    c.opts.forEach(o => {
      h += '<div class="choice' + (o.tag ? ' ' + o.tag : '') + '">' +
        '<div class="co">' + esc(o.o) +
        (o.tag ? '<span class="ctag ' + o.tag + '">' + tagTxt[o.tag] + '</span>' : '') + '</div>' +
        '<div class="cw"><b>কখন:</b> ' + nl2(o.when) + '</div>' +
        (o.why ? '<div class="cy"><b>কেন:</b> ' + nl2(o.why) + '</div>' : '') +
        '</div>';
    });
    return h + '</div></div>';
  }

  function openHelp(key) {
    const h = FieldHelp[key];
    if (!h) return;
    const sec = (cls, icon, title, body) => body
      ? '<div class="hs ' + cls + '"><div class="hh">' + icon + ' ' + title + '</div><div class="hb">' + nl2(body) + '</div></div>'
      : '';

    const ef = TaxEffect.EFFECT_TEXT[h.effect] || null;
    let chips = '';
    if (h.counts || ef) {
      chips = '<div class="chips3">' +
        (h.counts ? '<span class="chip3 info">🧾 ' + nl2(h.counts) + '</span>' : '') +
        (ef ? '<span class="chip3 ' + ef.cls + '">' + ef.icon + ' ' + ef.label + '</span>' : '') +
        '</div>';
    }

    document.getElementById('drawerTitle').textContent = h.t;
    document.getElementById('drawerBody').innerHTML =
      '<h3>' + esc(h.t) + '</h3>' +
      (h.live ? '<div class="small muted" style="margin:-4px 0 10px">লাইভে ঘরের নাম: <b>' + esc(h.live) + '</b></div>' : '') +
      chips +
      sec('', '📖', 'এটা কী', h.what) +
      choiceTable(key) +
      sec('', '📄', 'সংখ্যাটা কোথায় পাবেন', h.where) +
      sec('', '🧮', 'কীভাবে হিসাব করবেন', h.how) +
      sec('', '📊', 'সাধারণত কেমন হয়', h.typical) +
      sec('ex', '💡', 'উদাহরণ', h.example) +
      sec('mis', '⚠️', 'যে ভুলটা সবাই করে', h.mistake) +
      sec('tip', '⭐', 'টিপস', h.tip) +
      (h.effectNote ? sec('', '💰', 'করে প্রভাব', h.effectNote) : '') +
      (h.match ? sec('mis', '🔗', 'কীসের সাথে মিলতে হবে', h.match) : '') +
      '<div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap">' +
      (h.path ? '<button class="btn ghost" data-goto="' + esc(h.path) + '">➜ ঘরটি দেখান</button>' : '') +
      '<button class="btn ghost" data-askq="' + esc(h.t + ' — লাইভ eReturn-এ ঠিক কোথায় কী দিতে হবে বিস্তারিত বলুন') + '">💬 AI-কে জিজ্ঞেস করুন</button>' +
      '</div>';
    document.getElementById('drawer').classList.add('open');
  }

  /* ---------------- ঘর খুঁজে তীর দিয়ে দেখানো ---------------- */

  function pageForPath(p) {
    if (/^taxpayer\./.test(p)) return 'home';
    if (/^assessment\./.test(p) || /^firmAopForeignSpouse\./.test(p) || /^voluntaryDisclosure\./.test(p)) return 'assessment';
    if (/^additional\./.test(p)) return 'additional';
    if (/^employment/.test(p)) return 'employment';
    if (/^rent/.test(p)) return 'rent';
    if (/^agriculture/.test(p)) return 'agriculture';
    if (/^business/.test(p)) return 'business';
    if (/^capitalGain/.test(p)) return 'capital-gain';
    if (/^financialAssets/.test(p)) return 'financial-assets';
    if (/^otherSources/.test(p)) return 'other-sources';
    if (/^exempted/.test(p)) return 'exempted';
    if (/^rebate\./.test(p)) return 'rebate';
    if (/^expenditure\./.test(p)) return 'expenditure';
    if (/^assets\.|^liabilities\.|^wealth\./.test(p)) return 'assets';
    if (/^payments\./.test(p)) return 'tax';
    return null;
  }

  let spotTimer = null;
  let spot = null;   // { el, path, arrow, place }

  function clearSpotlight() {
    if (spot) {
      window.removeEventListener('scroll', spot.place, true);
      window.removeEventListener('resize', spot.place);
      spot = null;
    }
    clearTimeout(spotTimer);
    document.querySelectorAll('.spotlight').forEach(x => x.classList.remove('spotlight'));
    document.querySelectorAll('.spot-arrow').forEach(x => x.remove());
  }

  function spotlight(el, label) {
    clearSpotlight();
    if (!el) return;
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    el.classList.add('spotlight');
    const a = document.createElement('div');
    a.className = 'spot-arrow';
    const tick = el.type === 'checkbox' || el.type === 'radio';
    a.textContent = '👇 ' + (label || (tick ? 'এই ঘরটি' : 'এখানে দিন'));
    document.body.appendChild(a);
    const place = () => {
      if (!document.body.contains(el)) { clearSpotlight(); return; }
      const r = el.getBoundingClientRect();
      a.style.left = Math.max(8, Math.min(window.scrollX + r.left,
        window.scrollX + window.innerWidth - a.offsetWidth - 16)) + 'px';
      a.style.top = (window.scrollY + r.top - 44) + 'px';
    };
    spot = { el, path: el.getAttribute && el.getAttribute('data-path'), arrow: a, place };
    place();
    requestAnimationFrame(place);
    setTimeout(place, 300);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    if (el.focus) { try { el.focus({ preventScroll: true }); } catch (e) {} }
    spotTimer = setTimeout(clearSpotlight, 20000);
  }

  /* কাজটা করে ফেললে তীর নিজে থেকেই সরে যাক */
  function spotlightDone(target) {
    if (!spot || !target) return;
    const same = target === spot.el ||
      (spot.path && target.getAttribute && target.getAttribute('data-path') === spot.path) ||
      (target.closest && target.closest('label') && target.closest('label').contains(spot.el));
    if (!same) return;
    const inTour = tour.steps.length > 0;
    clearSpotlight();
    if (inTour) setTimeout(() => tourStep(1), 450);   // ট্যুরে থাকলে পরের ঘরে
  }

  function findEl(path) {
    let el = document.querySelector('#page [data-path="' + path.replace(/"/g, '\\"') + '"]');
    if (el) return el;
    // অ্যারের সূচক ছাড়া খুঁজি (যেমন employment[0].basicSalary → প্রথম মিল)
    const loose = path.replace(/\[\d+\]/g, '');
    const all = [...document.querySelectorAll('#page [data-path]')];
    return all.find(x => x.getAttribute('data-path').replace(/\[\d+\]/g, '') === loose) || null;
  }

  function focusField(path, label) {
    const page = pageForPath(path);
    if (!page) return false;
    const label2 = label || ((Object.values(FieldHelp).find(h => h.path === path) || {}).t) || '';
    if (route !== page) {
      location.hash = '#' + page;
      setTimeout(() => spotlight(findEl(path), label2), 260);
    } else {
      spotlight(findEl(path), label2);
    }
    document.getElementById('drawer').classList.remove('open');
    return true;
  }

  /* ---------------- ইনলাইন সতর্কতা ---------------- */

  let warnings = [];

  /* সতর্কবার্তার সাথে "কী করব" বোতাম */
  function wActs(w) {
    if (!w.actions || !w.actions.length) return '';
    return '<span class="fw-acts">' + w.actions.map(a =>
      '<button class="wbtn' + (a.danger ? ' danger' : '') + '" data-wact="' +
      esc(JSON.stringify(a)) + '">' + esc(a.t) + '</button>').join('') + '</span>';
  }

  function doWarnAction(a) {
    if (a.do === 'page') { location.hash = '#' + a.page; return; }
    if (a.do === 'field') { focusField(a.path); return; }
    if (a.do === 'set') {
      UI.set(data, a.path, a.val);
      ReturnState.save(data);
      render();
      const h = Object.values(FieldHelp).find(x => x.path === a.path);
      const name = a.label || (h ? h.t : a.path);
      toast('✅ হয়ে গেছে — ' + name + ' এখন "' +
        (a.val === false ? 'টিক নেই' : a.val === true ? 'টিক দেওয়া' :
          (typeof a.val === 'number' ? f(a.val) : a.val)) + '"');
    }
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast'; t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function applyWarnings() {
    warnings = [];
    try { warnings = Validate.check(data, res, rules); } catch (e) { return; }
    const byPath = Validate.byPath(warnings);
    const icons = { error: '⛔', warn: '⚠️', info: '💡' };
    Object.keys(byPath).forEach(p => {
      const el = findEl(p);
      if (!el) return;
      // চেকবক্সের সতর্কতা পুরো তালিকার নিচে বসাই, নাহলে পাশে গিয়ে এলোমেলো হয়
      const host = (el.type === 'checkbox' && el.closest('.checklist'))
        || el.closest('.field') || el.closest('td') || el.parentElement;
      if (!host) return;
      byPath[p].forEach(w => {
        const d = document.createElement('div');
        d.className = 'fw ' + w.level;
        d.innerHTML = '<span class="ic">' + icons[w.level] + '</span>' +
          '<span>' + nl2(w.msg) + wActs(w) + '</span>';
        host.appendChild(d);
      });
    });
    const badge = document.getElementById('warnBadge');
    if (badge) {
      const c = Validate.counts(warnings);
      const cls = c.error ? 'error' : (c.warn ? 'warn' : 'ok');
      badge.className = 'warn-badge ' + cls;
      badge.textContent = c.error ? '⛔ ' + c.error + ' টি সমস্যা' + (c.warn ? ' · ⚠️ ' + c.warn : '')
        : (c.warn ? '⚠️ ' + c.warn + ' টি সতর্কতা' : '✅ সব ঠিক আছে');
    }
  }

  function openWarnings() {
    const icons = { error: '⛔', warn: '⚠️', info: '💡' };
    const titles = { error: 'ঠিক না করলে লাইভে আটকাবে', warn: 'যাচাই করে দেখুন', info: 'সুযোগ' };
    document.getElementById('drawerTitle').textContent = 'সব সতর্কতা';
    let h = '';
    ['error', 'warn', 'info'].forEach(lv => {
      const list = warnings.filter(w => w.level === lv);
      if (!list.length) return;
      h += '<h3 style="margin-top:14px">' + icons[lv] + ' ' + titles[lv] + ' (' + list.length + ')</h3>';
      list.forEach(w => {
        h += '<div class="warn-item ' + lv + '">' + nl2(w.msg) +
          '<div class="go">' + wActs(w) +
          '<button class="btn ghost" data-goto="' + esc(w.path) + '">➜ ঘরটি দেখান</button></div></div>';
      });
    });
    if (!h) h = '<div class="tip good"><h4>সব ঠিক আছে</h4><p>এখন পর্যন্ত কোনো অসঙ্গতি ধরা পড়েনি।</p></div>';
    document.getElementById('drawerBody').innerHTML = h;
    document.getElementById('drawer').classList.add('open');
  }

  /* ---------------- ধাপে ধাপে ট্যুর ---------------- */

  let tour = { steps: [], i: 0 };

  function startTour(keys) {
    tour.steps = (keys || []).filter(k => FieldHelp[k] && FieldHelp[k].path);
    tour.i = -1;
    if (!tour.steps.length) return;
    closeAI(true);            // ট্যুরের সময় ছোট করে রাখি, কথা হারায় না
    tourStep(1);
  }
  function stopTour() {
    tour.steps = [];
    clearSpotlight();
    document.getElementById('tourBar').classList.remove('open');
    if (aiWasOpen) openAI();  // ট্যুর শেষে আবার খুলে দিই
  }
  function tourStep(d) {
    const ni = tour.i + d;
    if (ni < 0 || ni >= tour.steps.length) { stopTour(); return; }
    tour.i = ni;
    const key = tour.steps[ni];
    const h = FieldHelp[key];
    focusField(h.path, h.t);
    const bar = document.getElementById('tourBar');
    bar.querySelector('.txt').innerHTML =
      '<b>' + (ni + 1) + '/' + tour.steps.length + '</b> — ' + esc(h.t) +
      (h.how ? '<br><span style="color:#cfd6de">' + esc(String(h.how).split('\n')[0].slice(0, 90)) + '</span>' : '');
    bar.querySelector('[data-act="tour-prev"]').style.display = ni === 0 ? 'none' : '';
    bar.querySelector('[data-act="tour-next"]').textContent = ni === tour.steps.length - 1 ? 'শেষ ✓' : 'পরেরটা →';
    bar.classList.add('open');
  }

  /* ---------------- বেতন ভাঙার সহায়ক ---------------- */

  function salarySplitter() {
    return '<div class="splitter"><b>🧮 বেতন ভাঙতে পারছেন না? মাসিক মোট বেতন লিখুন</b>' +
      UI.helpIcon('salaryStructure') +
      '<div class="small muted" style="margin:6px 0 10px">Salary Certificate না থাকলে এটি দিয়ে ' +
      'বাংলাদেশের প্রচলিত হারে আনুমানিক ভাগ পেয়ে যাবেন। <b>সনদ থাকলে সেটাই ব্যবহার করুন।</b></div>' +
      '<div class="row"><div><label style="font-size:13px">মাসিক মোট বেতন (gross)</label>' +
      '<input type="text" class="num" id="splitGross" inputmode="numeric" placeholder="যেমন 80000" ' +
      'style="width:100%;border:1px solid #ced4da;border-radius:4px;padding:7px 10px"></div>' +
      '<div><label style="font-size:13px">উৎসব বোনাস কয়টি</label>' +
      '<input type="text" class="num" id="splitBonus" inputmode="numeric" value="2" ' +
      'style="width:100%;border:1px solid #ced4da;border-radius:4px;padding:7px 10px"></div>' +
      '<div style="flex:0 0 auto"><button class="btn" data-act="split-apply">ভাগ করে বসিয়ে দিন</button></div></div>' +
      '<div id="splitOut"></div></div>';
  }

  function applySplit() {
    const g = TaxCalc.n((document.getElementById('splitGross') || {}).value);
    const nb = TaxCalc.n((document.getElementById('splitBonus') || {}).value) || 2;
    if (!g) { alert('মাসিক মোট বেতন লিখুন।'); return; }
    // প্রচলিত হার: মূল ৬০%, বাড়ি ভাড়া মূলের ৫০%, চিকিৎসা মূলের ১০%, বাকিটা যাতায়াত
    const basicM = Math.round(g * 0.60 / 100) * 100;
    const hrM = Math.round(basicM * 0.50 / 100) * 100;
    const medM = Math.round(basicM * 0.10 / 100) * 100;
    const convM = Math.max(0, g - basicM - hrM - medM);
    const e = data.employment[0] || ReturnState.blankEmployment();
    e.basicSalary = basicM * 12;
    e.houseRentAllowance = hrM * 12;
    e.medicalAllowance = medM * 12;
    e.conveyanceAllowance = convM * 12;
    e.festivalBonus = basicM * nb;
    if (!data.employment.length) data.employment.push(e);
    ReturnState.save(data);
    render();
    const out = document.getElementById('splitOut');
    if (out) {
      out.innerHTML = '<table><tr><td>মূল বেতন (মাসে ' + f(basicM) + ')</td><td>' + f(basicM * 12) + '</td></tr>' +
        '<tr><td>বাড়ি ভাড়া ভাতা (মাসে ' + f(hrM) + ')</td><td>' + f(hrM * 12) + '</td></tr>' +
        '<tr><td>চিকিৎসা ভাতা (মাসে ' + f(medM) + ')</td><td>' + f(medM * 12) + '</td></tr>' +
        '<tr><td>যাতায়াত ভাতা (মাসে ' + f(convM) + ')</td><td>' + f(convM * 12) + '</td></tr>' +
        '<tr><td>উৎসব বোনাস (' + nb + ' × মূল বেতন)</td><td>' + f(basicM * nb) + '</td></tr></table>' +
        '<div class="small muted" style="margin-top:8px">উপরের ঘরগুলোয় বসিয়ে দেওয়া হয়েছে — ' +
        'আপনার সনদের সাথে মিলিয়ে দরকারে বদলে নিন।</div>';
    }
  }

  /* ---------------- AI ---------------- */

  /* ---------- কথোপকথন সংরক্ষণ — রিফ্রেশ/পাতা বদলেও হারায় না ---------- */
  const AI_LOG_KEY = 'ereturn-demo:aichat';
  let aiHistory = [];
  try { aiHistory = JSON.parse(localStorage.getItem(AI_LOG_KEY) || '[]'); } catch (e) { aiHistory = []; }
  function saveAIHistory() {
    try { localStorage.setItem(AI_LOG_KEY, JSON.stringify(aiHistory.slice(-60))); } catch (e) {}
  }

  const AI_GREETING = 'আসসালামু আলাইকুম! 👋\n\nআমি বলে দেব লাইভ eReturn-এর কোন পাতায়, কোন ঘরে, ' +
    'কী লিখতে হবে — কোন অপশনটা বাছবেন, কেন বাছবেন, আর কীভাবে বৈধভাবে কর কমানো যায়।\n\n' +
    'নিচের প্রশ্নগুলোয় চাপ দিন, অথবা নিজের প্রশ্ন লিখুন।';

  function paintAILog() {
    const log = document.getElementById('aiLog');
    if (!log) return;
    log.innerHTML = '';
    if (!aiHistory.length) {
      appendBubble('ai', AI_GREETING, AskAI.hasAnyKey() ? 'AI প্রস্তুত' : 'অফলাইন মোড (key দিলে আরও ভালো উত্তর)');
    } else {
      aiHistory.forEach(m => appendBubble(m.who, m.text, m.via));
    }
    log.scrollTop = log.scrollHeight;
  }

  let aiWasOpen = false;

  function openAI() {
    const p = document.getElementById('aiPanel');
    p.classList.add('open');
    aiWasOpen = true;
    const fab = document.querySelector('.ai-fab');
    if (fab) fab.style.display = 'none';
    if (!p.dataset.painted) { p.dataset.painted = '1'; paintAILog(); }
    setTimeout(() => { const i = document.getElementById('aiInput'); if (i) i.focus(); }, 60);
  }

  function closeAI(remember) {
    const p = document.getElementById('aiPanel');
    if (p) p.classList.remove('open');
    if (!remember) aiWasOpen = false;
    const fab = document.querySelector('.ai-fab');
    if (fab) fab.style.display = '';
  }

  function clearAIChat() {
    if (!confirm('এই কথোপকথন মুছে যাবে। নিশ্চিত?')) return;
    aiHistory = []; saveAIHistory(); paintAILog();
  }

  /* AI-এর উত্তরে [[goto:key]] থাকলে সেটাকে "➜ এখানে নিয়ে যান" বোতাম বানাই */
  function renderAI(text) {
    const keys = [];
    let html = esc(text)
      .replace(/\[\[goto:([A-Za-z0-9_]+)\]\]/g, (m, k) => {
        const h = FieldHelp[k];
        if (!h || !h.path) return '';
        keys.push(k);
        return '<button class="ai-goto" data-goto="' + esc(h.path) + '" data-label="' + esc(h.t) + '">➜ ' + esc(h.t) + '</button>';
      })
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/^\s*[-•*]\s+/gm, '• ');
    if (keys.length > 1) {
      html += '<button class="ai-tour" data-tour=\'' + esc(JSON.stringify(keys)) + '\'>▶ ধাপে ধাপে দেখান (' + keys.length + ' টি ঘর)</button>';
    }
    return html;
  }

  function appendBubble(who, text, via) {
    const log = document.getElementById('aiLog');
    if (!log) return null;
    const d = document.createElement('div');
    d.className = 'ai-msg' + (who === 'me' ? ' me' : '');
    d.innerHTML = '<div class="who">' + (who === 'me' ? 'আপনি' : 'AI') + '</div>' +
      '<div class="bubble">' + (who === 'me' ? esc(text) : renderAI(text)) + '</div>' +
      '<div class="via">' + esc(via || '') + '</div>';
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function addAIMsg(who, text, via, skipSave) {
    if (!skipSave) { aiHistory.push({ who, text, via: via || '' }); saveAIHistory(); }
    return appendBubble(who, text, via);
  }

  async function askAI(q) {
    addAIMsg('me', q);
    const pending = addAIMsg('ai', 'ভাবছি…', '', true);   // পেন্ডিং বার্তা সেভ করি না
    const setP = txt => { const v = pending.querySelector('.via'); if (v) v.textContent = txt; };
    try {
      const out = await AskAI.ask(q, data, res, rules, setP);
      pending.querySelector('.bubble').innerHTML = renderAI(out.text);
      const v = pending.querySelector('.via'); if (v) v.textContent = out.via || '';
      aiHistory.push({ who: 'ai', text: out.text, via: out.via || '' });
      saveAIHistory();
    } catch (e) {
      const msg = 'উত্তর আনা গেল না: ' + e.message;
      pending.querySelector('.bubble').textContent = msg;
      aiHistory.push({ who: 'ai', text: msg, via: '' });
      saveAIHistory();
    }
    const log = document.getElementById('aiLog');
    if (log) log.scrollTop = 999999;
  }

  /* ---------------- আমদানি/রপ্তানি ---------------- */

  function exportJson() {
    const blob = new Blob([JSON.stringify({ data, rules }, (k, v) => v === Infinity ? '__INF__' : v, 2)],
      { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ereturn-demo-' + (data.taxpayer.tin || 'return') + '.json';
    a.click();
  }

  function importJson() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = () => {
      const file = inp.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const j = JSON.parse(rd.result);
          if (j.data) { data = j.data; ReturnState.save(data); }
          if (j.rules) { rules = j.rules; TaxRules.save(rules); rules = TaxRules.load(); }
          render();
        } catch (e) { alert('ফাইল পড়া গেল না।'); }
      };
      rd.readAsText(file);
    };
    inp.click();
  }

  function copyLive() {
    const el = document.getElementById('liveList');
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(
      () => alert('কপি হয়েছে — যেকোনো জায়গায় পেস্ট করুন।'),
      () => alert('কপি করা গেল না।'));
  }

  function fillSample() {
    data = ReturnState.defaults();
    data.taxpayer.name = 'ডেমো করদাতা';
    data.taxpayer.tin = '123456789012';
    data.assessment.heads.employment = true;
    data.assessment.heads.financialAssets = true;
    data.assessment.hasExemptedIncome = 'No';
    const e = ReturnState.blankEmployment();
    e.employmentType = 'Private/Other than Government Pay Scale';
    e.employer = 'ABC Limited'; e.designation = 'Senior Officer';
    e.basicSalary = 600000; e.houseRentAllowance = 300000;
    e.medicalAllowance = 60000; e.conveyanceAllowance = 36000; e.festivalBonus = 100000;
    data.employment.push(e);
    data.financialAssets.push({ assetType: 'Interest/Profit (Bank/FI)', particulars: 'সঞ্চয়ী হিসাব', value: 500000, grossInterest: 25000, tds: 2500 });
    data.rebate.dps.push({ bank: 'Islami Bank', accountNo: 'DPS-001', deposit: 120000 });
    Object.assign(data.expenditure, {
      food: 240000, accommodation: 240000, autoOther: 36000,
      utilityElectricity: 24000, utilityGasWater: 12000, utilityPhoneInternet: 18000,
      education: 60000, festivalParty: 30000, taxAtSourceAdvance: 2500
    });
    Object.assign(data.assets, { cashInHand: 50000, bankCardsElectronic: 300000, dps: 240000, furnitureElectronics: 150000, goldJewellery: 200000 });
    data.wealth.previousNetWealth = 500000;
    data.payments.sourceTax = 2500;
    ReturnState.save(data);
    location.hash = '#assessment';
    render();
  }

  /* ---------------- বুট ---------------- */

  function onHash() {
    route = (location.hash || '#home').slice(1);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    document.addEventListener('input', onInput);
    document.addEventListener('change', function (e) {
      const el = e.target;
      if (el.getAttribute && el.getAttribute('data-path') &&
        (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio')) onInput(e);
    });
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.id === 'aiInput') {
        const q = e.target.value.trim();
        if (q) { e.target.value = ''; askAI(q); }
      }
      if (e.key === 'Escape') {
        document.getElementById('drawer').classList.remove('open');
      }
    });
    window.addEventListener('hashchange', onHash);
  });

  global.Demo = { get data() { return data; }, get res() { return res; }, get rules() { return rules; }, render };
})(window);
