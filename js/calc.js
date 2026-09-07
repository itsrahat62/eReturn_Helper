/* eReturn Demo — কর গণনা ইঞ্জিন
   লাইভ eReturn-এর "Tax & Payment" পাতার লাইনগুলোর সাথে মিলিয়ে সাজানো।
*/
(function (global) {
  'use strict';

  const n = v => {
    const x = typeof v === 'string' ? parseFloat(String(v).replace(/,/g, '')) : v;
    return isFinite(x) && !isNaN(x) ? x : 0;
  };
  const r0 = v => Math.round(n(v));

  const GOVT_TYPES = [
    'Government Pay Scale (Payment through iBAS++)',
    'Government Pay Scale (Payment not through iBAS++)'
  ];

  // চূড়ান্ত করদায় (final tax) — এই আয়ের উৎসে কাটা করই চূড়ান্ত
  const FINAL_TAX_FINANCIAL = [
    'Interest From Sanchayapatra',
    'Interest/Profit/Discount on Treasury Bill/Bond/SUKUK/Other Securities with TDS'
  ];

  /* ---------------- আয় খাতভিত্তিক ---------------- */

  function employmentIncome(list, rules) {
    let grossTotal = 0, exemptTotal = 0, details = [];
    (list || []).forEach(e => {
      const cash = n(e.basicSalary) + n(e.houseRentAllowance) + n(e.medicalAllowance) +
        n(e.conveyanceAllowance) + n(e.festivalBonus) +
        (e.extras || []).reduce((s, x) => s + n(x.amount), 0);
      const nonCash = n(e.nonCash && e.nonCash.rentFreeAccommodation) +
        n(e.nonCash && e.nonCash.concessionalAccommodation) +
        n(e.nonCash && e.nonCash.vehicleFacility) +
        n(e.nonCash && e.nonCash.otherNonCash);
      const gross = cash + nonCash;
      let exempt = 0;
      if (GOVT_TYPES.indexOf(e.employmentType) >= 0) {
        // সরকারি বেতন কাঠামো: মূল বেতন + বোনাস ছাড়া ভাতাগুলো সম্পূর্ণ করমুক্ত
        exempt = n(e.houseRentAllowance) + n(e.medicalAllowance) + n(e.conveyanceAllowance);
      } else {
        exempt = Math.min(gross * rules.salaryExemption.fraction, rules.salaryExemption.ceiling);
      }
      exempt = Math.min(exempt, gross);
      grossTotal += gross;
      exemptTotal += exempt;
      details.push({ employer: e.employer || '(নাম দেওয়া হয়নি)', gross, exempt, taxable: gross - exempt });
    });
    return { gross: r0(grossTotal), exempt: r0(exemptTotal), taxable: r0(grossTotal - exemptTotal), details };
  }

  function rentOne(p, rules) {
    const parts = ['residential', 'commercial'];
    let totalRent = 0, repair = 0;
    parts.forEach(k => {
      const s = p[k] || {};
      const base = Math.max(n(s.annualRent), n(s.rentReceived));
      const charge = p.serviceChargeByTenant === 'Yes' ? n(s.chargePaidByTenant) : 0;
      const sub = base + charge;
      totalRent += sub;
      repair += sub * (k === 'residential' ? rules.rentRepairRate.residential : rules.rentRepairRate.commercial);
    });
    const d = p.deductions || {};
    const claimed = n(d.insurancePremium) + n(d.loanInterest) + n(d.municipalTax) +
      n(d.preRentalInterest) + n(d.other) + repair;
    const allowable = Math.min(claimed, totalRent);
    const share = (n(p.ownershipPercent) || 100) / 100;
    const netRent = (totalRent - allowable) * share;
    const sp = p.special || {};
    const special = n(sp.unadjustableAdvance) + n(sp.refundableDeposit) * 0.10 + n(sp.unspentRepair);
    return {
      totalRent: r0(totalRent), repair: r0(repair), deduction: r0(allowable),
      income: r0(netRent), special: r0(special), total: r0(netRent + special)
    };
  }

  function rentIncome(list, rules) {
    let total = 0, rows = [];
    (list || []).forEach(p => { const x = rentOne(p, rules); rows.push(x); total += x.total; });
    return { taxable: r0(total), rows };
  }

  function agricultureIncome(list) {
    let total = 0, rows = [];
    (list || []).forEach(a => {
      const sales = n(a.salesProceed);
      const cost = a.booksOfAccounts === 'Yes' ? n(a.costOfProduction) : sales * 0.60;
      const net = Math.max(0, sales - cost - n(a.otherDeduction));
      rows.push({ sales: r0(sales), cost: r0(cost), net: r0(net), deemed: a.booksOfAccounts !== 'Yes' });
      total += net;
    });
    return { taxable: r0(total), rows };
  }

  function businessIncome(list) {
    let total = 0, rows = [];
    (list || []).forEach(b => {
      const gross = n(b.turnover) - n(b.costOfGoodsSold);
      const exp = (b.expenses || []).reduce((s, x) => s + n(x.amount), 0);
      const net = gross - exp;
      rows.push({ turnover: r0(n(b.turnover)), grossProfit: r0(gross), expenses: r0(exp), net: r0(net) });
      total += net;
    });
    return { taxable: r0(total), rows };
  }

  function capitalGainIncome(list) {
    let total = 0, tds = 0, rows = [];
    (list || []).forEach(c => {
      const gain = Math.max(0, n(c.saleDeedValue) - n(c.costOfAcquisition)) + n(c.excessOverDeed);
      rows.push({ gain: r0(gain), tds: r0(n(c.tds)) });
      total += gain; tds += n(c.tds);
    });
    return { taxable: r0(total), tds: r0(tds), rows };
  }

  function financialAssetsIncome(list) {
    let regular = 0, final = 0, tds = 0, rows = [];
    (list || []).forEach(f => {
      const income = n(f.grossInterest);
      const isFinal = FINAL_TAX_FINANCIAL.indexOf(f.assetType) >= 0;
      rows.push({ type: f.assetType, income: r0(income), tds: r0(n(f.tds)), isFinal });
      if (isFinal) final += income; else regular += income;
      tds += n(f.tds);
    });
    return { taxable: r0(regular), finalTaxIncome: r0(final), tds: r0(tds), rows };
  }

  function otherSourcesIncome(list) {
    let total = 0, tds = 0, rows = [];
    (list || []).forEach(o => {
      const net = Math.max(0, n(o.grossAmount) - n(o.relatedExpense));
      rows.push({ type: o.incomeType, net: r0(net), tds: r0(n(o.tds)) });
      total += net; tds += n(o.tds);
    });
    return { taxable: r0(total), tds: r0(tds), rows };
  }

  /* ---------------- বিনিয়োগ ও রেয়াত ---------------- */

  function allowableInvestment(rebate) {
    const R = rebate || {};
    let actual = 0, allowable = 0, notes = [];

    (R.lifeInsurance || []).forEach(x => {
      const paid = n(x.premiumPaid);
      const cap = n(x.policyValue) * 0.10;
      const ok = cap > 0 ? Math.min(paid, cap) : paid;
      actual += paid; allowable += ok;
      if (cap > 0 && paid > cap) {
        notes.push('জীবন বীমা: প্রিমিয়াম পলিসি মূল্যের ১০%-এর বেশি হলে অতিরিক্ত অংশ রেয়াতযোগ্য নয় (' +
          fmt(paid) + ' → ' + fmt(ok) + ')।');
      }
    });

    (R.dps || []).forEach(x => {
      const paid = n(x.deposit);
      const ok = Math.min(paid, 120000);
      actual += paid; allowable += ok;
      if (paid > 120000) notes.push('DPS: বছরে সর্বোচ্চ ১,২০,০০০ টাকা রেয়াতযোগ্য (' + fmt(paid) + ' → ' + fmt(ok) + ')।');
    });

    const plain = [
      ['sanchayapatra', 'amount'], ['mutualFund', 'amount'], ['listedStocks', 'amount'],
      ['gpf', 'contribution'], ['superannuation', 'amount'], ['zakatFund', 'amount'],
      ['universalPension', 'amount']
    ];
    plain.forEach(([key, field]) => {
      (R[key] || []).forEach(x => { const v = n(x[field]); actual += v; allowable += v; });
    });

    (R.rpf || []).forEach(x => {
      const v = n(x.selfContribution) + n(x.employerContribution);
      actual += v; allowable += v;
    });

    const b = R.benevolent || {};
    actual += n(b.benevolentFund) + n(b.groupInsurance);
    allowable += n(b.benevolentFund) + n(b.groupInsurance);

    const o = R.others || {};
    actual += n(o.schedule6Part3) + n(o.sro);
    allowable += n(o.schedule6Part3) + n(o.sro);

    return { actual: r0(actual), allowable: r0(allowable), notes };
  }

  /* ---------------- স্ল্যাব অনুযায়ী কর ---------------- */

  /* করমুক্ত সীমা — লাইভের মতো: TIN প্রোফাইলের শ্রেণি + Additional Information-এর চেকবক্স।
     একাধিক প্রযোজ্য হলে সবচেয়ে বেশি সীমাটাই পাওয়া যায়। */
  function thresholdFor(taxpayer, rules, additional) {
    const a = additional || {};
    let base = rules.threshold[taxpayer.category] || rules.threshold.general;
    if (a.disabledThirdGender) base = Math.max(base, rules.threshold.disabled_third);
    if (a.freedomFighter) base = Math.max(base, rules.threshold.freedom_fighter);
    const kids = a.guardianOfDisabled ? n(taxpayer.disabledChildren) : 0;
    return base + kids * rules.disabledChildRelief;
  }

  function slabTax(taxableIncome, threshold, rules) {
    let remaining = Math.max(0, taxableIncome - threshold);
    let tax = 0;
    const breakdown = [];
    if (threshold > 0) {
      breakdown.push({ label: 'প্রথম ' + fmt(threshold), rate: 0, amount: Math.min(taxableIncome, threshold), tax: 0 });
    }
    for (const s of rules.slabs) {
      if (remaining <= 0) break;
      const w = Math.min(remaining, s.width);
      const t = w * s.rate;
      breakdown.push({
        label: (s.width === Infinity ? 'অবশিষ্ট' : 'পরবর্তী ' + fmt(s.width)),
        rate: s.rate, amount: w, tax: t
      });
      tax += t;
      remaining -= w;
    }
    return { tax: r0(tax), breakdown };
  }

  function surchargeOn(netWealth, rules, flags) {
    let rate = 0;
    for (const s of rules.surcharge) {
      if (netWealth <= s.upto) { rate = s.rate; break; }
    }
    if (rate === 0 && flags && (flags.multipleCars || flags.bigHouse)) {
      rate = rules.surchargeAssetTrigger;
    }
    return rate;
  }

  /* ---------------- মূল হিসাব ---------------- */

  function compute(data, rules) {
    const T = data.taxpayer || {};
    const A = data.assessment || {};
    const heads = A.heads || {};

    const emp = heads.employment ? employmentIncome(data.employment, rules) : { gross: 0, exempt: 0, taxable: 0, details: [] };
    const rent = heads.rent ? rentIncome(data.rent, rules) : { taxable: 0, rows: [] };
    const agri = heads.agriculture ? agricultureIncome(data.agriculture) : { taxable: 0, rows: [] };
    const biz = heads.business ? businessIncome(data.business) : { taxable: 0, rows: [] };
    const cg = heads.capitalGain ? capitalGainIncome(data.capitalGain) : { taxable: 0, tds: 0, rows: [] };
    const fin = heads.financialAssets ? financialAssetsIncome(data.financialAssets) : { taxable: 0, finalTaxIncome: 0, tds: 0, rows: [] };
    const oth = heads.otherSources ? otherSourcesIncome(data.otherSources) : { taxable: 0, tds: 0, rows: [] };

    const F = data.firmAopForeignSpouse || {};
    const firmAop = n(F.firmShare) + n(F.aopShare);
    const foreign = A.otherSourcesFlags && A.otherSourcesFlags.foreignIncome ? n(F.foreignIncome) : 0;
    const spouse = A.otherSourcesFlags && A.otherSourcesFlags.spouseMinorIncome ? n(F.spouseMinorIncome) : 0;
    const vdi = A.voluntaryDisclosure ? n((data.voluntaryDisclosure || {}).amount) : 0;

    const exemptedIncome = (data.exempted || []).reduce((s, x) => s + n(x.amount), 0);

    const heads_ = [
      { key: 'employment', label: 'Income from Employment', amount: emp.taxable },
      { key: 'financialAssets', label: 'Income from Financial Assets', amount: fin.taxable + fin.finalTaxIncome },
      { key: 'rent', label: 'Income from Rent', amount: rent.taxable },
      { key: 'agriculture', label: 'Income from Agriculture', amount: agri.taxable },
      { key: 'business', label: 'Income from Business or Profession', amount: biz.taxable },
      { key: 'capitalGain', label: 'Capital Gains', amount: cg.taxable },
      { key: 'otherSources', label: 'Income from Other Sources', amount: oth.taxable },
      { key: 'vdi', label: 'Voluntary Disclosure of Income (1st Schedule)', amount: vdi },
      { key: 'firmAop', label: 'Share of Income from Firm or AoP', amount: firmAop },
      { key: 'spouse', label: 'Income of Minor or Spouse', amount: spouse },
      { key: 'foreign', label: 'Foreign Income', amount: foreign }
    ];

    const totalIncome = heads_.reduce((s, h) => s + h.amount, 0);
    // চূড়ান্ত করদায়ভুক্ত আয় নিয়মিত হারে করযোগ্য নয়
    const regularIncome = Math.max(0, totalIncome - fin.finalTaxIncome);

    const AD = data.additional || {};
    const threshold = thresholdFor(T, rules, AD);
    const slab = slabTax(regularIncome, threshold, rules);
    const taxOn163 = r0(fin.finalTaxIncome * 0.10); // ধারা ১৬৩(৩) — উৎসে কর্তিত করই চূড়ান্ত
    const grossTaxBeforeRebate = slab.tax + taxOn163;

    const claimsRebate = AD.claimTaxRebate !== 'No';
    const inv = claimsRebate ? allowableInvestment(data.rebate)
      : { actual: 0, allowable: 0, notes: [] };
    const rebateCandidates = [
      { label: 'অনুমোদিত বিনিয়োগের ' + (rules.rebate.onInvestment * 100) + '%', value: r0(inv.allowable * rules.rebate.onInvestment) },
      { label: 'মোট আয়ের ' + (rules.rebate.onIncome * 100) + '%', value: r0(totalIncome * rules.rebate.onIncome) },
      { label: 'সর্বোচ্চ সীমা', value: rules.rebate.ceiling }
    ];
    const rebateOnInvestment = Math.min.apply(null, rebateCandidates.map(c => c.value));
    const foreignTaxRelief = Math.min(n(F.foreignTaxPaid), grossTaxBeforeRebate);
    const totalRebate = rebateOnInvestment + foreignTaxRelief;

    const taxAfterRebate = Math.max(0, grossTaxBeforeRebate - totalRebate);

    const hasTaxableIncome = regularIncome > threshold;
    const minTax = hasTaxableIncome
      ? (T.firstTimeFiler ? rules.minimumTax.firstTime : rules.minimumTax.standard)
      : 0;
    const minTaxOn163 = taxOn163;
    const netTaxAfterRebate = Math.max(taxAfterRebate, minTax + minTaxOn163);

    // সম্পদ
    const grossWealth = Object.keys(data.assets || {})
      .filter(k => k !== 'motorCarCount')
      .reduce((s, k) => s + n(data.assets[k]), 0);
    const totalLiabilities = Object.keys(data.liabilities || {})
      .reduce((s, k) => s + n(data.liabilities[k]), 0);
    const netWealth = grossWealth - totalLiabilities;

    const W = data.wealth || {};
    const flags = {
      multipleCars: n(data.assets && data.assets.motorCarCount) > 1,
      bigHouse: n(W.houseSqftInCityCorp) > rules.surchargeHouseSqft
    };
    const surchargeRate = surchargeOn(netWealth, rules, flags);
    const surcharge = r0(netTaxAfterRebate * surchargeRate);

    const envSurcharge = n((data.expenditure || {}).environmentalSurcharge);
    const totalAmountPayable = netTaxAfterRebate + surcharge;

    const incentive = T.submitByFirstQuarter ? r0(totalAmountPayable * rules.firstQuarterIncentive) : 0;
    const afterIncentive = Math.max(0, totalAmountPayable - incentive);

    const P = data.payments || {};
    const sourceTaxAuto = cg.tds + fin.tds + oth.tds;
    const sourceTax = n(P.sourceTax) || sourceTaxAuto;
    const totalPayments = sourceTax + n(P.advanceIncomeTax) + n(P.taxPaidWithReturn) +
      n(P.environmentSurchargePaid) + n(P.refundAdjustment) + n(P.carryForward);

    const netPayable = Math.max(0, afterIncentive - totalPayments);
    const refundable = Math.max(0, totalPayments - afterIncentive);

    // ব্যয়
    const E = data.expenditure || {};
    const lifestyleExpense = ['food', 'accommodation', 'autoDriverFuel', 'autoOther',
      'utilityElectricity', 'utilityGasWater', 'utilityPhoneInternet', 'utilityHomeSupport',
      'education', 'festivalParty', 'tourHoliday', 'philanthropy', 'otherSpecial', 'anyOther']
      .reduce((s, k) => s + n(E[k]), 0);
    const totalExpenseAndTax = lifestyleExpense + n(E.taxAtSourceAdvance) + n(E.taxSurchargeOther) +
      n(E.personalLoanInterest) + n(E.environmentalSurcharge);

    // তহবিল সমন্বয় (Source of fund reconciliation)
    const changeInNetWealth = netWealth - n(W.previousNetWealth);
    const otherFundOutflow = totalExpenseAndTax + n(W.giftDonation) + n(W.lossDeductionOtherExpense);
    const totalFundOutflow = changeInNetWealth + otherFundOutflow;
    const nonCashBenefit = (data.employment || []).reduce((s, e) => {
      const nc = e.nonCash || {};
      return s + n(nc.rentFreeAccommodation) + n(nc.concessionalAccommodation) +
        n(nc.vehicleFacility) + n(nc.otherNonCash);
    }, 0);
    const sourceOfFund = (totalIncome - nonCashBenefit) + exemptedIncome + n(W.otherReceipts);
    const fundDifference = sourceOfFund - totalFundOutflow;

    return {
      heads: heads_,
      emp, rent, agri, biz, cg, fin, oth,
      exemptedIncome: r0(exemptedIncome),
      totalIncome: r0(totalIncome),
      regularIncome: r0(regularIncome),
      threshold,
      slab,
      taxOn163,
      grossTaxBeforeRebate: r0(grossTaxBeforeRebate),
      investment: inv,
      rebateCandidates,
      rebateOnInvestment: r0(rebateOnInvestment),
      foreignTaxRelief: r0(foreignTaxRelief),
      totalRebate: r0(totalRebate),
      taxAfterRebate: r0(taxAfterRebate),
      minTax, minTaxOn163,
      netTaxAfterRebate: r0(netTaxAfterRebate),
      grossWealth: r0(grossWealth),
      totalLiabilities: r0(totalLiabilities),
      netWealth: r0(netWealth),
      surchargeRate, surcharge, surchargeFlags: flags,
      envSurcharge: r0(envSurcharge),
      totalAmountPayable: r0(totalAmountPayable),
      incentive, afterIncentive: r0(afterIncentive),
      sourceTax: r0(sourceTax), sourceTaxAuto: r0(sourceTaxAuto),
      totalPayments: r0(totalPayments),
      netPayable: r0(netPayable),
      refundable: r0(refundable),
      lifestyleExpense: r0(lifestyleExpense),
      totalExpenseAndTax: r0(totalExpenseAndTax),
      changeInNetWealth: r0(changeInNetWealth),
      otherFundOutflow: r0(otherFundOutflow),
      totalFundOutflow: r0(totalFundOutflow),
      sourceOfFund: r0(sourceOfFund),
      fundDifference: r0(fundDifference),
      hasTaxableIncome,
      claimsRebate
    };
  }

  function fmt(v) {
    if (v === Infinity) return '∞';
    const x = Math.round(n(v));
    const neg = x < 0;
    let s = String(Math.abs(x));
    // বাংলাদেশি ধরন: শেষ ৩ সংখ্যা, তারপর ২ করে
    if (s.length > 3) {
      const last3 = s.slice(-3);
      let rest = s.slice(0, -3);
      const parts = [];
      while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
      if (rest) parts.unshift(rest);
      s = parts.join(',') + ',' + last3;
    }
    return (neg ? '-' : '') + s;
  }

  global.TaxCalc = { compute, fmt, n, slabTax, thresholdFor, allowableInvestment, GOVT_TYPES, FINAL_TAX_FINANCIAL };
})(window);
