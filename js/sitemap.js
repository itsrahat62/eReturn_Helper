/* eReturn Demo — লাইভ etaxnbr.gov.bd-এর কেন্দ্রীয় ডিজাইন-মানচিত্র
   কোন পাতায় কোন সেকশন, কোন সেকশনে কোন ঘর, ঘরের ধরন ও অপশন — সব এক জায়গায়।
   Ask AI এই মানচিত্র + কর নিয়ম + ব্যবহারকারীর বর্তমান সংখ্যা — তিনটা মিলিয়ে উত্তর দেয়।

   f = [লাইভ ঘরের নাম, ধরন, help key (থাকলে), নোট]
   ধরন: text | money | select | radio | checkbox | table | auto (নিজে হিসাব হয়)
*/
(function (global) {
  'use strict';

  const PAGES = [
    {
      id: 'login', title: 'লগইন', live: 'Sign in',
      url: 'https://etaxnbr.gov.bd/#/auth/sign-in',
      demo: null,
      intro: 'TIN + পাসওয়ার্ড দিয়ে ঢুকতে হয়। রেজিস্ট্রেশন না থাকলে আগে Register করতে হবে।',
      sections: [{
        name: 'Sign in',
        fields: [
          ["Taxpayer's Identification Number (TIN)", 'text', null, '১২ ডিজিটের TIN'],
          ['Password', 'text', null, 'ভুল বারবার দিলে অ্যাকাউন্ট সাময়িক ব্লক হতে পারে']
        ]
      }],
      buttons: ['Sign in', 'Forgot password?', 'Change mobile number', 'Register']
    },

    {
      id: 'assessment', title: 'Regular e-Return — Assessment Information',
      live: 'Assessment Information / Heads of Income',
      url: 'https://etaxnbr.gov.bd/#/user-panel/assessment/regular-return',
      demo: 'assessment',
      intro: 'রিটার্নের প্রথম পাতা। এখানে যেসব খাতে টিক দেবেন, সেই পাতাগুলোই পরে আসবে।',
      sections: [
        {
          name: 'Assessment Information',
          fields: [
            ['Return Scheme', 'auto', 'returnScheme', 'সবসময় "Self", বদলানো যায় না'],
            ['Assessment Year', 'auto', 'assessmentYear', 'উপরের ডানের ড্রপডাউন থেকে ঠিক হয়'],
            ['Income Year — From / To', 'auto', 'incomeYear', '০১-০৭-২০২৫ থেকে ৩০-০৬-২০২৬'],
            ['Resident Status', 'radio', 'residentStatus', 'Resident / Non Resident']
          ]
        },
        {
          name: 'Tax Exempted Income',
          fields: [['Any income which is fully exempted from tax?', 'radio', 'hasExemptedIncome',
            'Yes দিলে "Tax Exempted Income" পাতা যুক্ত হবে']]
        },
        {
          name: 'Heads of Income',
          fields: [
            ['Any taxable income in the income year?', 'radio', 'hasTaxableIncome', 'Yes/No'],
            ['Income from Employment', 'checkbox', 'heads', 'চাকরি — Employment পাতা যুক্ত হবে'],
            ['Income from Rent', 'checkbox', 'heads', 'বাড়ি/দোকান ভাড়া — Rent পাতা'],
            ['Income from Agriculture', 'checkbox', 'heads', 'ফসল চাষ — Agriculture পাতা'],
            ['Income from Business or Profession', 'checkbox', 'heads', 'দোকান/ব্যবসা/পেশা/খামার — Business পাতা'],
            ['Capital Gains', 'checkbox', 'heads', 'জমি/ফ্ল্যাট/শেয়ার বিক্রির লাভ'],
            ['Income from Financial Assets', 'checkbox', 'heads', 'ব্যাংক সুদ, সঞ্চয়পত্র, লভ্যাংশ'],
            ['Income from Other Sources', 'checkbox', 'heads', 'সম্মানী, রয়্যালটি, লটারি ইত্যাদি']
          ]
        },
        {
          name: 'Any income from the following sources?',
          fields: [
            ['As a Partner of a Firm', 'checkbox', null, 'অংশীদারি ফার্মের মুনাফার অংশ'],
            ['As a Member of an AoP', 'checkbox', null, ''],
            ['Income Earned outside Bangladesh', 'checkbox', null, 'বিদেশে অর্জিত আয়'],
            ['Income Earned by the Spouse or Minor Children (Not Assessed Separately)', 'checkbox', null,
              'শুধু তখনই যখন তাঁদের আলাদা রিটার্ন হয় না']
          ]
        },
        {
          name: 'Voluntary Disclosure of Income',
          fields: [['Voluntary Disclosure of Income under 1st Schedule', 'checkbox', 'voluntaryDisclosure',
            'আগে গোপন থাকা আয় প্রকাশ — বাড়তি কর/জরিমানা লাগে']]
        }
      ],
      buttons: ['Save Draft', 'Save & Continue']
    },

    {
      id: 'additional', title: 'Additional Information',
      live: 'Additional Information / Tax Rebate / IT10B Requirements',
      url: 'https://etaxnbr.gov.bd/#/user-panel/additional-information',
      demo: 'additional',
      intro: 'Assessment-এর Save & Continue চাপলে এই পাতা আসে। বাঁয়ে দুটি কার্ড (Additional Information, ' +
        'Tax Rebate), ডানে IT10B Requirements।',
      sections: [
        {
          name: 'Additional Information',
          fields: [
            ['Location of Main Source of Income', 'select', 'location',
              '⚠️ আবশ্যক। Dhaka North City Corporation / Dhaka South City Corporation / ' +
              'Chattogram City Corporation / Other City Corporation / Any Other Area'],
            ['War-wounded Gazetted Freedom Fighter/Wounded Gazetted July Fighter', 'checkbox', 'freedomFighter',
              'করমুক্ত সীমা ৫,৫০,০০০ হয়ে যায়'],
            ['Person with Disability/Third Gender', 'checkbox', 'disabledThirdGender',
              'করমুক্ত সীমা ৫,২৫,০০০ হয়ে যায়'],
            ['Claim Benefit as a Parent/Legal Guardian of a Person with Disability', 'checkbox', 'guardianOfDisabled',
              'টিক দিলে সন্তানের সংখ্যার ঘর আসে; প্রতি সন্তানে +৫০,০০০']
          ]
        },
        {
          name: 'Tax Rebate',
          fields: [['Claim tax rebate for investment?', 'radio', 'claimTaxRebate',
            '⭐ Yes দিলে পরে Rebate পাতা আসবে; No দিলে আসবে না এবং কোনো রেয়াত পাবেন না']]
        },
        {
          name: 'IT10B Requirements',
          fields: [
            ['Gross Wealth over 50,00,000?', 'radio', 'grossWealthOver50Lakh', ''],
            ['Own Motor Car?', 'radio', 'ownMotorCar', 'মোটরসাইকেল গাড়ি নয়'],
            ['Own Offshore Property?', 'radio', 'offshoreProperty', ''],
            ['Shareholder director of a company?', 'radio', 'shareholderDirector', ''],
            ['Have any House Property?', 'radio', 'housePropertyQ', 'সিটি কর্পোরেশনে বাড়ি/ফ্ল্যাট']
          ]
        }
      ],
      buttons: ['Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'employment', title: 'Income → Employment', live: 'Income Details → Employment',
      url: 'https://etaxnbr.gov.bd/#/user-panel/employment',
      demo: 'employment',
      intro: 'চাকরির আয়। একাধিক চাকরি থাকলে "Add Employment" দিয়ে আলাদা করে দিন। সব ঘরে বার্ষিক অঙ্ক।',
      sections: [
        {
          name: 'Employment',
          fields: [
            ['Employment Type', 'select', 'employmentType',
              'Government Pay Scale (Payment through iBAS++) / Government Pay Scale (Payment not through iBAS++) / ' +
              'Private/Other than Government Pay Scale / Salary Subject to Reduced Tax Rate'],
            ['Name of the Employer', 'text', 'employer', ''],
            ['Designation', 'text', 'designation', ''],
            ['Shareholder Director', 'checkbox', null, 'কোম্পানির শেয়ারহোল্ডার পরিচালক হলে']
          ]
        },
        {
          name: 'Particulars (বার্ষিক)',
          fields: [
            ['Basic Salary', 'money', 'basicSalary', 'মাসিক × ১২'],
            ['House Rent Allowance', 'money', 'houseRentAllowance', 'সাধারণত মূল বেতনের ৫০%'],
            ['Medical Allowance', 'money', 'medicalAllowance', 'সাধারণত মূল বেতনের ~১০%'],
            ['Conveyance Allowance', 'money', 'conveyanceAllowance', ''],
            ['Festival Bonus', 'money', 'festivalBonus', 'সাধারণত ২ × এক মাসের মূল বেতন'],
            ['Add More (ড্রপডাউন)', 'select', 'salaryExtra',
              'Arrear Salary, Dearness Allowance, Education Allowance, Tiffin Allowance, ' +
              'Employee Share Schemes, Employer’s Contribution to RPF, Entertainment Allowance, ' +
              'Gratuity (Approved/Not Approved), Interest Accrued on RPF, Leave Allowance, Other Bonus, ' +
              'Overtime Allowance, TA/DA/Conveyance (not expended), Other If Any (Give Detail)']
          ]
        },
        {
          name: 'Non-Cash Benefits',
          fields: [
            ['Rent Free Accommodation', 'money', 'rentFreeAccommodation', ''],
            ['Accommodation at Concessional Rate', 'money', 'concessionalAccommodation', ''],
            ['Vehicle Facility Provided', 'money', 'vehicleFacility', 'গাড়ির CC অনুযায়ী নির্ধারিত হারে'],
            ['Other Non-Cash Benefit', 'money', 'otherNonCash', '']
          ]
        },
        {
          name: 'Employment Summary (নিজে হিসাব হয়)',
          fields: [
            ['Total Salary', 'auto', null, ''],
            ['Tax Free / Exempted', 'auto', null, 'বেসরকারি: ১/৩ বা ৫,০০,০০০ — যেটি কম'],
            ['Taxable', 'auto', null, '']
          ]
        }
      ],
      buttons: ['Add Employment', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'rent', title: 'Income → Rent', live: 'Income Details → Rent',
      url: 'https://etaxnbr.gov.bd/#/user-panel/rent',
      demo: 'rent',
      intro: 'ভাড়া আয়। আবাসিক ও বাণিজ্যিক আলাদা কলাম। একাধিক সম্পত্তি হলে "Add Another Property"।',
      sections: [
        {
          name: 'Property',
          fields: [
            ['Property Type', 'select', 'propertyType', 'House Property / Other Property'],
            ['Address of the Property', 'text', 'rentAddress', ''],
            ['Is it in any city corporation?', 'radio', 'inCityCorporation', ''],
            ['Area Occupied for Personal Use (Sq. ft.)', 'money', 'areaPersonalUse', 'নিজে থাকার অংশ'],
            ['Total Area of the Property (Sq. ft.)', 'auto', null, '']
          ]
        },
        {
          name: 'Particular (Residential / Commercial কলাম)',
          fields: [
            ['Area Rented Out (Sq. ft.)', 'money', null, ''],
            ['Rental Period (Months)', 'money', null, ''],
            ['Annual Rent', 'money', 'annualRent', 'চুক্তির বার্ষিক ভাড়া'],
            ['Rent Received', 'money', 'rentReceived', 'বাস্তবে পাওয়া'],
            ['Any Charge Paid by Tenant', 'money', 'chargePaidByTenant', ''],
            ['Less: Vacancy Allowance', 'auto', null, 'খালি থাকার ছাড়'],
            ['Total Rent / Net Total Rent', 'auto', null, '']
          ]
        },
        {
          name: 'Deductions',
          fields: [
            ['Insurance Premium', 'money', 'rentInsurance', ''],
            ['Interest paid on Loan/Mortgage/Capital Charge', 'money', 'rentLoanInterest', '⭐ বড় ছাড়'],
            ['Municipal, Local Tax or Land Revenue', 'money', 'rentMunicipalTax', ''],
            ['Repair, Collections, etc.', 'auto', 'rentRepair', 'আবাসিক ২৫% / বাণিজ্যিক ৩০% — নিজে বসে'],
            ['Pre-rental interest paid on Loan', 'money', 'rentPreRental', ''],
            ['Other (if any)', 'money', null, ''],
            ['Total / Allowable deduction', 'auto', null, '']
          ]
        },
        {
          name: 'Special Rental Income',
          fields: [
            ['Unadjustable and non-refundable Advance, Selami, Premium', 'money', 'unadjustableAdvance', ''],
            ['Refundable or Adjustable deposit', 'money', 'refundableDeposit', 'বছরশেষ স্থিতির ১০% আয়'],
            ['Unspent Repair, Collections, etc.', 'money', null, '']
          ]
        },
        {
          name: 'অন্যান্য',
          fields: [
            ['Service Charge paid by tenant?', 'radio', null, ''],
            ['Are you the only owner?', 'radio', 'ownershipPercent', 'না হলে আপনার অংশ %']
          ]
        }
      ],
      buttons: ['Add Another Property', 'Rent Summary', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'agriculture', title: 'Income → Agriculture', live: 'Income Details → Agriculture',
      url: 'https://etaxnbr.gov.bd/#/user-panel/agriculture',
      demo: 'agriculture',
      intro: 'ফসল চাষের আয়। ⚠️ গরু/মুরগি/মাছের খামার সাধারণত এখানে নয় — সেটা Business → ' +
        '"Certain Sources of Agro-Business Income"।',
      sections: [{
        name: 'Agriculture',
        fields: [
          ['Agriculture Type', 'select', 'agricultureType',
            'Cultivation / Income from Farming / Production of Tea or Rubber / Other Agricultural Income / Special Agricultural Income'],
          ['Total Cultivation Area', 'money', 'agriArea', 'একক: Decimal / Acre / Bigha / Katha'],
          ['Particular of Produces', 'text', null, 'কী ফসল'],
          ['Maintain Books of Accounts?', 'radio', 'agriBooks', '⭐ No দিলে ৬০% খরচ এমনিতেই বাদ'],
          ['Sales Proceed', 'money', 'salesProceed', ''],
          ['Cost of Production', 'money', 'costOfProduction', 'বই না থাকলে নিজে বসে'],
          ['Other Allowable Deduction', 'money', null, ''],
          ['Net Income', 'auto', null, '']
        ]
      }],
      buttons: ['Add Another Type', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'business', title: 'Income → Business or Profession',
      live: 'Income Details → Business',
      url: 'https://etaxnbr.gov.bd/#/user-panel/business',
      demo: 'business',
      intro: 'দোকান, ব্যবসা, পেশা, ফ্রিল্যান্সিং এবং খামারের আয়।',
      sections: [
        {
          name: 'Business',
          fields: [
            ['Business Category', 'select', 'businessCategory',
              'Business or Professional Income / Business or Professional Income (with TDS) / ' +
              'Business Subject to Final Tax / Business Exempted from Turnover Tax / ' +
              'Manufacturing of Tobacco Products / Production of Tea or Rubber / ' +
              'Manufacturing of Carbonated/Sweetened Beverage / **Certain Sources of Agro-Business Income** ' +
              '(গরু/মুরগি/মাছের খামার — হ্রাসকৃত হার) / Business Income from Royalty, Intangibles etc. / ' +
              'Special Business Income / Income Subject to Reduced Tax Rate'],
            ['Business Type', 'select', null, 'Business (Regular) / Profession (Without TDS)'],
            ['Business Name', 'text', 'businessName', 'ট্রেড লাইসেন্স অনুযায়ী'],
            ['Business Address', 'text', null, ''],
            ['Maintain Books of Accounts?', 'radio', null, '']
          ]
        },
        {
          name: 'Income Summary',
          fields: [
            ['Sales/Turnover/Receipts', 'money', 'turnover', ''],
            ['Cost of Production/ Cost of Goods Sold', 'money', 'costOfGoodsSold', ''],
            ['Gross Profit', 'auto', null, 'Turnover − COGS']
          ]
        },
        {
          name: 'Expenses (টেবিল)',
          fields: [['Particulars', 'select', 'businessExpense',
            'All general, administrative, selling & other expenses (Consolidated) / ' +
            'Financial expense (Bank/FI interest) / **Depreciation** / Amortization / R&D expense / ' +
            'Bad debt written off / Amount paid for Right of Use / Contribution to Worker\'s Welfare Fund']]
        },
        {
          name: 'Balance Sheet Summary',
          fields: [
            ['Cash in Hand & at Bank', 'money', 'balanceSheet', ''],
            ['Inventories', 'money', null, ''],
            ['Fixed Assets', 'money', null, ''],
            ['Other Assets', 'money', null, ''],
            ['Total Assets', 'auto', null, ''],
            ['Opening Capital & New Investment This Year', 'money', null, ''],
            ['Net Profit', 'auto', null, ''],
            ['Withdrawals in the Income Year', 'money', null, ''],
            ['Closing Capital', 'auto', null, 'Opening + Net Profit − Withdrawals'],
            ['Liabilities', 'money', null, ''],
            ['Total Capital and Liabilities', 'auto', null, '⚠️ Total Assets-এর সমান হতেই হবে']
          ]
        }
      ],
      buttons: ['Add Another Type', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'capital-gain', title: 'Income → Capital Gains',
      live: 'Income Details → Capital Gains',
      url: 'https://etaxnbr.gov.bd/#/user-panel/capital-gain',
      demo: 'capital-gain',
      intro: 'সম্পদ বিক্রির লাভ।',
      sections: [{
        name: 'Capital Gain',
        fields: [
          ['Type of Gains', 'select', 'typeOfGains',
            'Transfer of property (Land Only) / (House/Apartment) / Signing money from the developer / ' +
            'Compensation against property acquisition / Transfer of share of listed Company (Individual) / ' +
            '(Director/Sponsor/Placement Shareholder) / not-listed Company / Transfer of business or undertaking / ' +
            'Transfer of personal effects (Gold, Silver, Gems...) / valuable assets (Painting, Antiques, Club Membership) / ' +
            'Other capital gain / Gain subject to reduced tax rate'],
          ['Description of the Property', 'text', null, 'মৌজা/ঠিকানা'],
          ['Location of the property', 'select', null, ''],
          ['Total Area', 'money', null, 'একক সহ'],
          ['Date of Acquisition / Purchase', 'text', null, ''],
          ['TIN of Buyer', 'text', null, ''],
          ['Sale Deed No / Date of Sale Deed / Sub Registrar Office', 'text', null, ''],
          ['Sale Deed Value', 'money', 'saleDeedValue', ''],
          ['Excess Amount Received Over Deed Value', 'money', 'excessOverDeed', ''],
          ['Cost of Acquisition', 'money', 'costOfAcquisition', '⭐ রেজিস্ট্রেশন খরচসহ'],
          ['Tax Deducted/Collected at Source', 'money', 'cgTds', '⭐ কর থেকে বাদ যায়'],
          ['Capital Gain (Based On Sale Deed) / (Excess) / Total', 'auto', null, '']
        ]
      }],
      buttons: ['Add Another Category', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'financial-assets', title: 'Income → Financial Assets',
      live: 'Income Details → Financial Assets',
      url: 'https://etaxnbr.gov.bd/#/user-panel/financial-assets',
      demo: 'financial-assets',
      intro: 'ব্যাংক সুদ, সঞ্চয়পত্রের মুনাফা, লভ্যাংশ ইত্যাদি।',
      sections: [{
        name: 'ধরন অনুযায়ী টেবিল',
        fields: [
          ['ধরন', 'select', 'faType',
            'Interest From Sanchayapatra / Interest/Profit (Bank/FI) / ' +
            'Interest/Profit/Discount on Treasury Bill/Bond/SUKUK/Other Securities with TDS / ' +
            'Dividend (Any kind) / Interest From Any Other Securities/Financial Assets / ' +
            'Securities Subject to Reduced Tax Rate'],
          ['Scheme Name', 'select', null,
            'Poribar Sanchayapatra / Tin Mash Antar Munafa Vittik 3 Year / 5-Year Bangladesh Sanchayapatra / Pensioner Sanchayapatra'],
          ['Registration No / Issue Date', 'text', null, ''],
          ['Value', 'money', 'faValue', 'মূল বিনিয়োগ'],
          ['Gross Interest', 'money', 'grossInterest', 'কর কাটার আগের মুনাফা'],
          ['TDS', 'money', 'faTds', '⭐ কর থেকে বাদ যায়'],
          ['Encashed', 'checkbox', null, 'ভাঙানো হলে টিক']
        ]
      }],
      buttons: ['Import From NSD', 'Add', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'other-sources', title: 'Income → Other Sources',
      live: 'Income Details → Other Sources',
      url: 'https://etaxnbr.gov.bd/#/user-panel/income-from-other-sources',
      demo: 'other-sources',
      intro: 'বেতন/ভাড়া/ব্যবসা/কৃষির বাইরের আয়।',
      sections: [{
        name: 'Other Sources',
        fields: [
          ['Income Type', 'select', 'osType',
            'Royalty / Payment from WPPF / License Fee / Fees for Technical Services / ' +
            'Income From Intangible Assets / Cash Subsidy / Lottery, Puzzle, Card Game/Online Game / ' +
            'Meeting Fee, Honorarium etc. (with TDS) / Joint Venture(JV) Profit Share / Any Other Income / ' +
            'Income Subject to Reduced Tax Rate'],
          ['Name of the Client / Payment Authority', 'text', null, ''],
          ['Gross Payment Amount', 'money', 'osGross', ''],
          ['Related Expenses', 'money', 'osExpense', ''],
          ['Net Income', 'auto', null, ''],
          ['Tax Deducted/Collected at Source', 'money', null, '']
        ]
      }],
      buttons: ['Add Another Category', 'Add', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'exempted', title: 'Income → Tax Exempted Income',
      live: 'Tax Exempted Income',
      url: 'https://etaxnbr.gov.bd/#/user-panel/tax-exempted-income',
      demo: 'exempted',
      intro: 'সম্পূর্ণ করমুক্ত আয়। কর বাড়ে না, কিন্তু টাকার উৎস প্রমাণ হয়।',
      sections: [{
        name: 'Tax Exempted Income',
        fields: [
          ['Tax Exempted Income Type', 'select', 'exemptType',
            'Foreign Remittance / Software and IT Business / Income from Tax Exempted Bond or Securities / ' +
            'Welfare Allowance from Government/Muktijhoddha Kallyan Trust / Rewards from Government / ' +
            'Income from Old Home / Income from Prize / Income from Pension / Universal Pension Scheme / ' +
            'Other Exemption under 6th Schedule Part 1 / Exemption by SRO'],
          ['Amount', 'money', 'exemptAmount', '']
        ]
      }],
      buttons: ['Add Another Type', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'rebate', title: 'Rebate — Investment Category',
      live: 'Rebate',
      url: 'https://etaxnbr.gov.bd/#/user-panel/rebate',
      demo: 'rebate',
      intro: 'বিনিয়োগ কর রেয়াত। যেটা আছে সেটায় টিক দিলে ভেতরের টেবিল খুলবে।',
      sections: [{
        name: 'Investment Category (১২টি টিকবক্স)',
        fields: [
          ['Life Insurance Premium', 'table', 'lifeInsurance',
            'Policy Number, Insurance Company, Policy Value, Premium Paid — পলিসি মূল্যের ১০% পর্যন্ত'],
          ['Deposit Pension Scheme (DPS)', 'table', 'dps', 'Bank/FI, Account No, Deposit — সর্বোচ্চ ১,২০,০০০'],
          ['Approved Sanchayapatra & Other Govt. Securities', 'table', 'sanchayapatraInv',
            'Name of Instrument, Registration No, Issue Date, Investment Amount'],
          ['Unit Certificate/Mutual Fund/ETF/Joint Investment Scheme', 'table', 'mutualFund', 'Name, Account No, Issue Date, Amount'],
          ['Listed Stocks or Shares', 'table', 'listedStocks', 'BO Account No, Brokerage House, Investment During the Year'],
          ['General Provident Fund (GPF)', 'table', 'gpf', 'Account No, Contribution'],
          ['Recognized Provident Fund (RPF)', 'table', 'rpf', 'Employer Name, Self Contribution, Employer Contribution'],
          ['Approved Superannuation Fund', 'table', 'superannuation', 'Fund Name, Date, Contribution'],
          ['Approved Benevolent Fund & Group Insurance Premium', 'money', 'benevolent',
            'Contribution of Benevolent Fund, Group Insurance Premium'],
          ['Zakat Fund (Under Zakat Fund Management ACT 2023)', 'table', 'zakatFund', 'Fund Name, Date, Contribution'],
          ['Universal Pension Scheme', 'table', 'universalPension', 'Scheme (প্রবাস/প্রগতি/সুরক্ষা/সমতা), Pension ID, Amount'],
          ['Others', 'money', null, 'Investment Under 6th Schedule Part 3 / Investment Under SRO'],
          ['Total Actual Investment / Total Allowable Investment for Rebate', 'auto', 'rebateIntro', '']
        ]
      }],
      buttons: ['Import from Income', 'Add', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'expenditure', title: 'Expenditure (IT-10BB)',
      live: 'Expenditure',
      url: 'https://etaxnbr.gov.bd/#/user-panel/expenditure',
      demo: 'expenditure',
      intro: 'জীবনযাত্রার ব্যয়। তীর চিহ্নওয়ালা সারিতে ক্লিক করলে ভেতরের উপ-ঘর খোলে।',
      sections: [{
        name: 'Particulars (Amount + Comment)',
        fields: [
          ['Expenses for Food, Clothing and Other Essentials', 'money', 'expFood', ''],
          ['Accommodation Expense', 'money', 'expAccommodation', ''],
          ['Auto and Transportation Expenses', 'auto', 'expAuto',
            'উপ-ঘর: Driver\'s Salary Fuel and Maintenance, Other Transportation'],
          ['Household and Utility Expenses', 'auto', 'expUtility',
            'উপ-ঘর: Electricity, Gas Water Sewer Garbage, Phone Internet TV, Home-Support Stuff'],
          ['Education Expenses', 'money', 'expEducation', ''],
          ['Festival And Other Special Expenses', 'auto', 'expFestival',
            'উপ-ঘর: Festival Party Events, Domestic and Overseas Tour, Philanthropy, Other Special'],
          ['Any Other Expenses', 'money', null, ''],
          ['Total Expense Relating to Lifestyle', 'auto', null, ''],
          ['Tax, Charges, Etc. Paid During the year', 'auto', 'expTaxPaid',
            'উপ-ঘর: Payment of Tax at Source & Advance Tax, Payment of Tax/Surcharge or Other Amounts'],
          ['Interest Payment of Personal Loan', 'money', 'expLoanInterest', ''],
          ['Environmental Surcharge', 'money', 'expEnvSurcharge', ''],
          ['Total Amount of Expense and Tax', 'auto', null, '']
        ]
      }],
      buttons: ['Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'assets', title: 'Assets & Liabilities (IT-10B)',
      live: 'Assets & Liabilities',
      url: 'https://etaxnbr.gov.bd/#/user-panel/assets-and-liabilities',
      demo: 'assets',
      intro: '⭐ দ্বিতীয়/তৃতীয় রিটার্ন হলে প্রথমেই "Import and Autofill" চাপুন — গত বছরের সব বসে যাবে। ' +
        'সম্পদ ক্রয়মূল্যে লিখতে হয়। শেষে Summary-র Difference **শূন্য** হতে হবে।',
      sections: [
        {
          name: 'Business Related',
          fields: [
            ['Business Capital', 'money', 'businessCapitalAsset', 'Name of the Business, Total Business Asset, Business Liabilities'],
            ['Director\'s Shareholdings in Limited Companies', 'table', null, 'Company Name, Type of Acquisition (Purchased/Inheritance), No of Shares, Value'],
            ['Capital of Partnership Firm', 'table', null, 'Firm Name, TIN of Firm, Partners Capital']
          ]
        },
        {
          name: 'Property',
          fields: [
            ['Non-Agricultural Property', 'table', 'nonAgriProperty',
              'Description and Location (মৌজা), Area, Purchase cost at start/end — উত্তরাধিকার হলে ভ্যালু ০'],
            ['Advance Made for Non-Agricultural Property', 'table', null, 'Particulars, Advance at start/end'],
            ['Agricultural Property', 'table', 'agriProperty', 'একই ধরনের ঘর']
          ]
        },
        {
          name: 'Financial Assets',
          fields: [
            ['Share, Debenture, Bond, Securities, Unit Certificate', 'table', 'shareDebentureBond',
              'BO Account/Instrument/ISIN No, Brokerage House/Bank, Cost Value'],
            ['Sanchayapatra', 'table', 'sanchayapatraAsset', 'Type, Registration No, Issue Date, Value'],
            ['Fixed Deposits, Term Deposits', 'table', 'fixedDepositAsset', 'Particulars, Bank Name, Account No, Balance'],
            ['DPS', 'table', 'dpsAsset', 'Bank Name, Account No, Balance'],
            ['Loans Given to Others', 'table', 'loansGiven', 'Name of Borrower, TIN of Borrower, Amount'],
            ['Provident Fund and Other Fund', 'table', 'providentFundAsset', 'Name of Employer, Particulars of the Fund, Balance'],
            ['Other Financial Assets', 'table', null, 'Type and Particulars, Value']
          ]
        },
        {
          name: 'Motor Car, Ornaments, Furniture',
          fields: [
            ['Motor Car', 'table', 'motorCarAsset', 'Type (Motorcycle / Car, Microbus, Zeep / Any other), Engine Capacity, Value'],
            ['Gold, Diamond, Gems and Other Items', 'table', 'goldJewellery',
              'Type (Gold/Platinum/Silver/Diamond/Others), Quantity (ভরি/Kilogram), Value — উপহার হলে ০'],
            ['Furniture, Equipments and Electronic Items', 'table', 'furnitureElectronics', 'Particulars, Value'],
            ['Other Assets of Significant Value', 'table', null, '']
          ]
        },
        {
          name: 'Cash and Fund outside Business',
          fields: [
            ['Notes, Currencies, Banks, Cards and Other Electronic Cash', 'table', 'bankCardsElectronic',
              'Select Type → Bank Account, Bank/FI Name, Account/Card no, Balance'],
            ['Cash in Hand', 'money', 'cashInHand', ''],
            ['Other Deposits, Balance and Advance', 'table', null, ''],
            ['Asset Outside Bangladesh', 'table', 'assetOutsideBangladesh', '']
          ]
        },
        {
          name: 'Liabilities (Outside Business)',
          fields: [
            ['Borrowing from Bank or Other FI', 'table', 'bankFiLoan', 'Bank Name, Account No, Purpose, Balance'],
            ['Unsecured Loan', 'table', 'unsecuredLoan', 'Name, TIN, Amount'],
            ['Other Loan or Advance or Overdraft', 'table', null, '']
          ]
        },
        {
          name: 'Other Fund Outflow',
          fields: [
            ['Annual Living Expense', 'auto', null, 'Expenditure পাতা থেকে নিজে আসে'],
            ['Loss, Deduction, Other Expense', 'money', null, ''],
            ['Gift, Donation and Contribution', 'money', 'giftDonation', '']
          ]
        },
        {
          name: 'Source of Fund',
          fields: [
            ['Income Shown in the Return (excluding non cash benefits)', 'auto', null, ''],
            ['Tax Exempted Income and Allowances', 'auto', null, ''],
            ['Other Receipts', 'money', 'otherReceipts', 'উত্তরাধিকার, উপহার, সম্পদ বিক্রির টাকা']
          ]
        },
        {
          name: 'Summary',
          fields: [
            ['Gross Wealth', 'auto', null, ''],
            ['Total Liabilities Outside Business', 'auto', null, ''],
            ['Net Wealth', 'auto', null, ''],
            ['Net Wealth at the Last Date of Previous Income Year', 'money', 'previousNetWealth', '⭐⭐ গত বছরের রিটার্ন থেকে হুবহু'],
            ['Change in Net Wealth', 'auto', null, ''],
            ['Total Fund Outflow', 'auto', null, ''],
            ['Source of Fund', 'auto', null, ''],
            ['Difference', 'auto', null, '⚠️ শূন্য হতে হবে']
          ]
        }
      ],
      buttons: ['Import and Autofill', 'Add', 'Back', 'Save Draft', 'Save & Continue']
    },

    {
      id: 'tax', title: 'Tax & Payment', live: 'Tax & Payment',
      url: 'https://etaxnbr.gov.bd/#/user-panel/tax-and-payment',
      demo: 'tax',
      intro: 'কর হিসাব ও পরিশোধ। উৎসে কাটা কর দাবি করতে "Update Tax Payment Status" → "Claim Source Tax"।',
      sections: [
        {
          name: 'Particulars of Total Income',
          fields: [['প্রতিটি খাতের আয় ও Total Income', 'auto', null, 'আগের পাতাগুলো থেকে নিজে আসে']]
        },
        {
          name: 'Tax Computation',
          fields: [
            ['Gross Tax before Rebate — Tax on Regular Income / u/s 163(3) / SRO Income', 'auto', null, ''],
            ['Tax Rebate — On Investment / On Firm-AoP Share / Foreign Tax Relief / Other Rebate', 'auto', null, ''],
            ['Tax after Rebate', 'auto', null, ''],
            ['Minimum Payable Tax', 'auto', null, 'ন্যূনতম ৫,০০০ (নতুন ১,০০০)'],
            ['Net Tax after Rebate', 'auto', null, ''],
            ['Surcharge — Wealth / Tobacco / Environmental', 'auto', null, ''],
            ['Total Amount Payable', 'auto', null, '']
          ]
        },
        {
          name: 'Payment',
          fields: [
            ['Source Tax', 'money', 'sourceTax', '⭐ "Claim Source Tax" দিয়ে যাচাই করতে হয়'],
            ['Advance Income Tax', 'money', 'advanceIncomeTax', ''],
            ['Tax Paid With Return', 'money', 'taxPaidWithReturn', ''],
            ['Environment Surcharge', 'money', null, ''],
            ['Adjustment of Tax Refund', 'money', 'refundAdjustment', ''],
            ['Carry forwarded amount u/s 163', 'money', 'carryForward', ''],
            ['Total Payment & Adjustments', 'auto', null, '']
          ]
        },
        {
          name: 'Final Payable',
          fields: [
            ['Total Amount Payable / Incentive (1st quarter) / after Incentive', 'auto', null, ''],
            ['Refundable / Net Payable', 'auto', null, '']
          ]
        }
      ],
      buttons: ['Reset Calculation', 'Save', 'Update Tax Payment Status', 'Pay Now', 'Proceed to online return']
    },

    {
      id: 'return-view', title: 'Return View', live: 'Return View',
      url: 'https://etaxnbr.gov.bd/#/user-panel/return-view',
      demo: 'return-view',
      intro: 'পূরণ করা পুরো রিটার্নের প্রিভিউ। একদম নিচে "Submit Return" — চাপলেই চূড়ান্ত জমা।',
      sections: [{ name: 'Preview', fields: [['পুরো রিটার্ন', 'auto', null, '']] }],
      buttons: ['Submit Return', 'Acknowledgement Receipt', 'Express Certificate']
    }
  ];

  function findPage(q) {
    const s = (q || '').toLowerCase();
    return PAGES.filter(p =>
      p.title.toLowerCase().indexOf(s) >= 0 ||
      (p.live || '').toLowerCase().indexOf(s) >= 0 ||
      p.sections.some(sec => sec.fields.some(f => String(f[0]).toLowerCase().indexOf(s) >= 0)));
  }

  function findField(q) {
    const s = (q || '').toLowerCase();
    const out = [];
    PAGES.forEach(p => p.sections.forEach(sec => sec.fields.forEach(f => {
      if (String(f[0]).toLowerCase().indexOf(s) >= 0 || String(f[3] || '').toLowerCase().indexOf(s) >= 0) {
        out.push({ page: p, section: sec.name, label: f[0], type: f[1], help: f[2], note: f[3] });
      }
    })));
    return out;
  }

  function asText() {
    const L = ['### লাইভ eReturn-এর পূর্ণ ডিজাইন-মানচিত্র (কোন পাতায় কোন ঘর)'];
    PAGES.forEach(p => {
      L.push('');
      L.push('**' + p.title + '** — ডেমো পাতা: `' + (p.demo || '-') + '` | লাইভ: ' + p.url);
      if (p.intro) L.push('  ' + p.intro);
      p.sections.forEach(sec => {
        L.push('  · সেকশন: ' + sec.name);
        sec.fields.forEach(f => {
          L.push('    - ' + f[0] + ' [' + f[1] + ']' +
            (f[2] ? ' (help key: ' + f[2] + ')' : '') +
            (f[3] ? ' — ' + f[3] : ''));
        });
      });
      if (p.buttons) L.push('  · বোতাম: ' + p.buttons.join(' · '));
    });
    return L.join('\n');
  }

  global.SiteMap = { PAGES, findPage, findField, asText };
})(window);
