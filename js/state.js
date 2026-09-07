/* eReturn Demo — রিটার্নের ডেটা মডেল ও সংরক্ষণ (localStorage) */
(function (global) {
  'use strict';

  const KEY = 'ereturn-demo:return';
  const SCENARIO_KEY = 'ereturn-demo:scenarios';

  function blankEmployment() {
    return {
      employmentType: '',
      employer: '',
      designation: '',
      shareholderDirector: false,
      basicSalary: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      conveyanceAllowance: 0,
      festivalBonus: 0,
      extras: [],                 // [{key, amount}]
      nonCash: {
        rentFreeAccommodation: 0,
        concessionalAccommodation: 0,
        vehicleFacility: 0,
        otherNonCash: 0
      }
    };
  }

  function blankRent() {
    return {
      propertyType: 'House Property',
      address: '',
      inCityCorporation: 'Yes',
      areaPersonalUse: 0,
      totalArea: 0,
      residential: { areaRented: 0, months: 12, annualRent: 0, rentReceived: 0, chargePaidByTenant: 0 },
      commercial: { areaRented: 0, months: 12, annualRent: 0, rentReceived: 0, chargePaidByTenant: 0 },
      serviceChargeByTenant: 'No',
      onlyOwner: 'Yes',
      ownershipPercent: 100,
      deductions: {
        insurancePremium: 0,
        loanInterest: 0,
        municipalTax: 0,
        preRentalInterest: 0,
        other: 0
      },
      special: { unadjustableAdvance: 0, refundableDeposit: 0, unspentRepair: 0 }
    };
  }

  function blankAgriculture() {
    return {
      agricultureType: 'Cultivation',
      area: 0, areaUnit: 'Decimal',
      produce: '',
      booksOfAccounts: 'No',
      salesProceed: 0,
      costOfProduction: 0,
      otherDeduction: 0
    };
  }

  function blankBusiness() {
    return {
      businessCategory: 'Business or Professional Income',
      businessType: 'Business (Regular)',
      businessName: '',
      businessAddress: '',
      booksOfAccounts: 'Yes',
      turnover: 0,
      costOfGoodsSold: 0,
      expenses: [],              // [{type, amount}]
      balance: {
        cash: 0, inventories: 0, fixedAssets: 0, otherAssets: 0,
        openingCapital: 0, withdrawals: 0, liabilities: 0
      }
    };
  }

  function blankCapitalGain() {
    return {
      typeOfGains: 'Transfer of property (Land Only)',
      description: '',
      saleDeedValue: 0,
      excessOverDeed: 0,
      costOfAcquisition: 0,
      tds: 0
    };
  }

  function blankFinancialAsset() {
    return {
      assetType: 'Interest/Profit (Bank/FI)',
      particulars: '',
      value: 0,
      grossInterest: 0,
      tds: 0
    };
  }

  function blankOtherSource() {
    return {
      incomeType: 'Any Other Income',
      particulars: '',
      grossAmount: 0,
      relatedExpense: 0,
      tds: 0
    };
  }

  function blankExempt() {
    return { type: 'Foreign Remittance', particulars: '', amount: 0 };
  }

  function defaults() {
    return {
      meta: { savedAt: null, name: 'আমার রিটার্ন' },

      taxpayer: {
        name: '',
        tin: '',
        circle: '',
        zone: '',
        category: 'general',       // general | female_senior  (লাইভে TIN প্রোফাইল থেকে আসে)
        disabledChildren: 0,
        firstTimeFiler: false,
        submitByFirstQuarter: false
      },

      assessment: {
        returnScheme: 'Self',
        assessmentYear: '2026-2027',
        incomeYearFrom: '01-07-2025',
        incomeYearTo: '30-06-2026',
        residentStatus: 'Resident',
        hasExemptedIncome: 'No',
        hasTaxableIncome: 'Yes',
        heads: {
          employment: false,
          rent: false,
          agriculture: false,
          business: false,
          capitalGain: false,
          financialAssets: false,
          otherSources: false
        },
        otherSourcesFlags: {
          partnerOfFirm: false,
          memberOfAop: false,
          foreignIncome: false,
          spouseMinorIncome: false
        },
        voluntaryDisclosure: false
      },

      additional: {
        // Additional Information কার্ড
        location: '',                    // Location of Main Source of Income (আবশ্যক)
        freedomFighter: false,           // War-wounded Gazetted Freedom Fighter/Wounded Gazetted July Fighter
        disabledThirdGender: false,      // Person with Disability/Third Gender
        guardianOfDisabled: false,       // Claim Benefit as a Parent/Legal Guardian of a Person with Disability
        // Tax Rebate কার্ড
        claimTaxRebate: 'Yes',           // Claim tax rebate for investment?
        // IT10B Requirements কার্ড
        grossWealthOver50Lakh: 'No',
        ownMotorCar: 'No',
        offshoreProperty: 'No',
        shareholderDirector: 'No',
        houseProperty: 'No'
      },

      employment: [],
      rent: [],
      agriculture: [],
      business: [],
      capitalGain: [],
      financialAssets: [],
      otherSources: [],
      exempted: [],

      firmAopForeignSpouse: {
        firmShare: 0,
        aopShare: 0,
        foreignIncome: 0,
        foreignTaxPaid: 0,
        spouseMinorIncome: 0
      },

      voluntaryDisclosure: { amount: 0 },

      rebate: {
        lifeInsurance: [],        // [{policyNo, company, policyValue, premiumPaid}]
        dps: [],                  // [{bank, accountNo, deposit}]
        sanchayapatra: [],        // [{instrument, regNo, issueDate, amount}]
        mutualFund: [],           // [{name, accountNo, issueDate, amount}]
        listedStocks: [],         // [{boAccount, brokerage, amount}]
        gpf: [],                  // [{accountNo, contribution}]
        rpf: [],                  // [{employer, selfContribution, employerContribution}]
        superannuation: [],       // [{fundName, date, amount}]
        benevolent: { benevolentFund: 0, groupInsurance: 0 },
        zakatFund: [],            // [{fundName, date, amount}]
        universalPension: [],     // [{scheme, pensionId, amount}]
        others: { schedule6Part3: 0, sro: 0 }
      },

      expenditure: {
        food: 0,
        accommodation: 0,
        autoDriverFuel: 0,
        autoOther: 0,
        utilityElectricity: 0,
        utilityGasWater: 0,
        utilityPhoneInternet: 0,
        utilityHomeSupport: 0,
        education: 0,
        festivalParty: 0,
        tourHoliday: 0,
        philanthropy: 0,
        otherSpecial: 0,
        anyOther: 0,
        taxAtSourceAdvance: 0,
        taxSurchargeOther: 0,
        personalLoanInterest: 0,
        environmentalSurcharge: 0
      },

      assets: {
        businessCapital: 0,
        directorShareholding: 0,
        partnershipCapital: 0,
        nonAgriProperty: 0,
        advanceNonAgriProperty: 0,
        agriProperty: 0,
        shareDebentureBond: 0,
        sanchayapatra: 0,
        fixedDeposit: 0,
        dps: 0,
        loansGiven: 0,
        providentFund: 0,
        otherFinancial: 0,
        motorCar: 0,
        motorCarCount: 0,
        goldJewellery: 0,
        furnitureElectronics: 0,
        otherSignificant: 0,
        cashInHand: 0,
        bankCardsElectronic: 0,
        otherDeposits: 0,
        assetOutsideBangladesh: 0
      },

      liabilities: {
        bankFiLoan: 0,
        unsecuredLoan: 0,
        otherLoanOverdraft: 0
      },

      wealth: {
        previousNetWealth: 0,
        giftDonation: 0,
        lossDeductionOtherExpense: 0,
        otherReceipts: 0,
        houseSqftInCityCorp: 0
      },

      payments: {
        sourceTax: 0,
        advanceIncomeTax: 0,
        taxPaidWithReturn: 0,
        environmentSurchargePaid: 0,
        refundAdjustment: 0,
        carryForward: 0
      }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return mergeDefaults(defaults(), JSON.parse(raw));
    } catch (e) {
      return defaults();
    }
  }

  function save(data) {
    data.meta = data.meta || {};
    data.meta.savedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return defaults();
  }

  function mergeDefaults(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(saved).forEach(k => {
      if (Array.isArray(saved[k])) base[k] = saved[k];
      else if (saved[k] && typeof saved[k] === 'object' && base[k] && typeof base[k] === 'object') {
        base[k] = mergeDefaults(base[k], saved[k]);
      } else if (saved[k] !== undefined) base[k] = saved[k];
    });
    return base;
  }

  // ---- একাধিক সিনারিও (তুলনা করার জন্য) ----
  function listScenarios() {
    try { return JSON.parse(localStorage.getItem(SCENARIO_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveScenario(name, data) {
    const all = listScenarios();
    all[name] = { savedAt: new Date().toISOString(), data: JSON.parse(JSON.stringify(data)) };
    try { localStorage.setItem(SCENARIO_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function loadScenario(name) {
    const all = listScenarios();
    return all[name] ? mergeDefaults(defaults(), all[name].data) : null;
  }
  function deleteScenario(name) {
    const all = listScenarios();
    delete all[name];
    try { localStorage.setItem(SCENARIO_KEY, JSON.stringify(all)); } catch (e) {}
  }

  global.ReturnState = {
    defaults, load, save, clear,
    listScenarios, saveScenario, loadScenario, deleteScenario,
    blankEmployment, blankRent, blankAgriculture, blankBusiness,
    blankCapitalGain, blankFinancialAsset, blankOtherSource, blankExempt
  };
})(window);
