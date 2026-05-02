/* =============================================================
   PLAN MOCK DATA — V21 Component D
   Seeds the demo with a realistic Nora plan set.
   Lifted from NORA OUTPUTS (OLD)/LARGE PLAN VIEW.pdf — 3 Utah-state
   plans + 3 add-on categories × 3 tiers + 5 FAQ chips.

   When real Nora data lands (Eugenio's Phase 3), retrofit by replacing
   MOCK_NORA_RESPONSE with a fetch(/api/plan-options) result. Schema is
   identical (see nora-data-types.js).
   ============================================================= */
(function () {
  'use strict';

  // Repeated benefit fragments — keep as strings so they match what
  // the LLM/backend returns verbatim.
  var COIN_10_AFTER_DED = '10% Coinsurance after deductible';
  var COIN_25_AFTER_DED = '25% Coinsurance after deductible';
  var FIRST_4_THEN_10 = '$60 Copay first 4 visits then 10% Coinsurance after deductible';
  var FIRST_4_COMB_THEN_10 = '$60 Copay first 4 Combined visits then 10%';

  // -----------------------------------------------------------
  // PLAN 1 — Bronze Essential 9000 (Budget)
  // -----------------------------------------------------------
  var PLAN_BRONZE = {
    plan_id: 'plan_bronze_essential_9000_v1',
    tier: 'budget',
    tier_label: 'Budget Option',
    tier_optimization: 'Optimize for Lowest Monthly Cost',
    name: 'Bronze Essential 9000 Deductible With 4 Copay No Deductible Office Visits',
    carrier: 'Regence BlueCross BlueShield of Utah',
    network_type: 'EPO',
    monthly_premium: 290,
    description: 'Lower premium, higher out-of-pocket. Best if you rarely visit a doctor.',
    highlights: [
      { label: 'Deductible', value: '$9,000 individual / $18,000 family' },
      { label: 'Primary care', value: '$60 first 4 visits, then 10%' },
      { label: 'Generic Rx', value: '$15' }
    ],
    benefits: {
      medical_deductible_individual: 9000,
      medical_deductible_family: 18000,
      drug_deductible: '—',
      combined_med_drug_deductible: 'Individual: $9,000 / Family: $18,000',
      out_of_pocket_max_individual: 10600,
      out_of_pocket_max_family: 21200,
      primary_care: FIRST_4_THEN_10,
      other_practitioner: FIRST_4_COMB_THEN_10,
      specialist: FIRST_4_COMB_THEN_10,
      urgent_care: FIRST_4_COMB_THEN_10,
      emergency_room: COIN_10_AFTER_DED,
      emergency_transportation: COIN_10_AFTER_DED,
      preventive: 'No Charge',
      well_baby: 'No Charge',
      generic_drugs: '$15',
      preferred_brand_drugs: '30% Coinsurance after deductible',
      non_preferred_brand_drugs: '40% Coinsurance after deductible',
      specialty_drugs: '50% Coinsurance after deductible',
      imaging: COIN_10_AFTER_DED,
      xrays: COIN_10_AFTER_DED,
      laboratory: COIN_10_AFTER_DED,
      chiropractic: '—',
      outpatient_surgery: COIN_10_AFTER_DED,
      outpatient_rehabilitation: COIN_10_AFTER_DED,
      inpatient_physician: COIN_10_AFTER_DED,
      inpatient_hospital: COIN_10_AFTER_DED,
      skilled_nursing: COIN_10_AFTER_DED,
      habilitation: COIN_10_AFTER_DED,
      home_health: COIN_10_AFTER_DED,
      durable_medical: COIN_10_AFTER_DED,
      hospice: COIN_10_AFTER_DED,
      mental_health_outpatient: COIN_10_AFTER_DED,
      mental_health_inpatient: COIN_10_AFTER_DED,
      substance_abuse_outpatient: COIN_10_AFTER_DED,
      substance_abuse_inpatient: COIN_10_AFTER_DED,
      prenatal_postnatal: COIN_10_AFTER_DED,
      delivery_inpatient_maternity: COIN_10_AFTER_DED,
      rehab_speech: COIN_10_AFTER_DED,
      rehab_occupational_physical: COIN_10_AFTER_DED,
      allergy_testing: COIN_10_AFTER_DED,
      chemotherapy: COIN_10_AFTER_DED,
      radiation: COIN_10_AFTER_DED,
      dialysis: COIN_10_AFTER_DED,
      infusion_therapy: COIN_10_AFTER_DED,
      transplant: COIN_10_AFTER_DED,
      reconstructive_surgery: COIN_10_AFTER_DED,
      accidental_dental: '—',
      diabetes_education: 'No Charge',
      routine_eye_exam_children: 'No Charge',
      eye_glasses_children: 'No Charge',
      dental_check_children: 'No Charge',
      additional_benefits: [
        'Outpatient Facility Fee (e.g. Ambulatory Surgery Center): 10% after ded.',
        'Prosthetic Devices: 10% after ded.',
        'Diabetes Care Management: 10% after ded.',
        'Inherited Metabolic Disorder — PKU: 10% after ded.',
        'Autism Spectrum Disorders: 10% after ded.'
      ]
    },
    exclusions: [
      'Maternity (route to Catalog)',
      'Adult dental',
      'Adult vision',
      'Pre-existing condition exclusions may apply',
      'Routine foot care'
    ],
    compared_to_user: {
      current_plan_premium: 890,
      savings_monthly: 600,
      savings_annual: 7200,
      deductible_delta_individual: -2000,
      key_differences: [
        { category: 'premium', delta: '−$600/mo', favor: 'this_plan' },
        { category: 'deductible', delta: '+$2,000', favor: 'current_plan' },
        { category: 'rx_generic', delta: '$15 vs current $20', favor: 'this_plan' }
      ]
    },
    things_youll_use: [
      'Primary care: $60 first 4 visits, then 10% after ded',
      'Generic Rx: $15',
      'Preventive: No charge',
      'ER: 10% after ded'
    ],
    things_to_know: [
      'Deductible: $9,000 individual is on the high side',
      'Specialist limit kicks in after 4 visits',
      'Drug deductible is combined with medical'
    ],
    disclaimer: 'Network: Regence Advantage. Provider directory available at regence.com.'
  };

  // -----------------------------------------------------------
  // PLAN 2 — Silver 6500 (Recommended ⭐)
  // -----------------------------------------------------------
  var PLAN_SILVER = {
    plan_id: 'plan_silver_6500_v1',
    tier: 'recommended',
    tier_label: 'Recommended',
    tier_optimization: 'Best balance of premium + coverage',
    name: 'Silver 6500',
    carrier: 'Regence BlueCross BlueShield of Utah',
    network_type: 'EPO',
    monthly_premium: 420,
    description: 'Balanced premium with predictable copays. Most chosen by freelancers in your bracket.',
    // V24 Tier 3 · Wealthfront "We picked this because…" rationale.
    // Renders ONLY on the Recommended ⭐ card. ≤14 words, italic accent
    // on the *emphasized phrase* (rendered as <em>…</em>).
    rationale: 'Best balance of premium and out-of-pocket for <em>irregular income</em>.',
    rationale_by_persona: {
      SP1: 'Best balance of premium and out-of-pocket for <em>irregular income</em>.',
      CL1: 'Cuts your renewal almost in half — <em>same major network</em>.',
      BR1: 'Bridges the gap years with <em>predictable copays</em>, not coinsurance.',
      PC1: 'Drops your monthly while keeping your <em>specialists in-network</em>.',
      RU1: 'Active in <em>24 hours</em>, no underwriting wait.',
      GEN: 'Best balance of premium and out-of-pocket for your <em>situation</em>.'
    },
    highlights: [
      { label: 'Deductible', value: '$6,500 individual / $13,000 family' },
      { label: 'Primary care', value: '$20 copay' },
      { label: 'Generic Rx', value: '$10' }
    ],
    benefits: {
      medical_deductible_individual: 6500,
      medical_deductible_family: 13000,
      drug_deductible: '—',
      combined_med_drug_deductible: 'Individual: $6,500 / Family: $13,000',
      out_of_pocket_max_individual: 9500,
      out_of_pocket_max_family: 19000,
      primary_care: '$20',
      other_practitioner: '$20',
      specialist: '$60',
      urgent_care: '$60',
      emergency_room: COIN_10_AFTER_DED,
      emergency_transportation: COIN_10_AFTER_DED,
      preventive: 'No Charge',
      well_baby: 'No Charge',
      generic_drugs: '$10',
      preferred_brand_drugs: '20% Coinsurance after deductible',
      non_preferred_brand_drugs: '40% Coinsurance after deductible',
      specialty_drugs: '50% Coinsurance after deductible',
      imaging: COIN_10_AFTER_DED,
      xrays: COIN_10_AFTER_DED,
      laboratory: COIN_10_AFTER_DED,
      chiropractic: '$20',
      outpatient_surgery: COIN_10_AFTER_DED,
      outpatient_rehabilitation: COIN_10_AFTER_DED,
      inpatient_physician: COIN_10_AFTER_DED,
      inpatient_hospital: COIN_10_AFTER_DED,
      skilled_nursing: COIN_10_AFTER_DED,
      habilitation: COIN_10_AFTER_DED,
      home_health: COIN_10_AFTER_DED,
      durable_medical: COIN_10_AFTER_DED,
      hospice: COIN_10_AFTER_DED,
      mental_health_outpatient: '$20',
      mental_health_inpatient: COIN_10_AFTER_DED,
      substance_abuse_outpatient: '$20',
      substance_abuse_inpatient: COIN_10_AFTER_DED,
      prenatal_postnatal: COIN_10_AFTER_DED,
      delivery_inpatient_maternity: COIN_10_AFTER_DED,
      rehab_speech: COIN_10_AFTER_DED,
      rehab_occupational_physical: COIN_10_AFTER_DED,
      allergy_testing: COIN_10_AFTER_DED,
      chemotherapy: COIN_10_AFTER_DED,
      radiation: COIN_10_AFTER_DED,
      dialysis: COIN_10_AFTER_DED,
      infusion_therapy: COIN_10_AFTER_DED,
      transplant: COIN_10_AFTER_DED,
      reconstructive_surgery: COIN_10_AFTER_DED,
      accidental_dental: COIN_10_AFTER_DED,
      diabetes_education: 'No Charge',
      routine_eye_exam_children: 'No Charge',
      eye_glasses_children: 'No Charge',
      dental_check_children: 'No Charge',
      additional_benefits: [
        'Outpatient Facility Fee (e.g. Ambulatory Surgery Center): 10% after ded.',
        'Prosthetic Devices: 10% after ded.',
        'Diabetes Care Management: 10% after ded.',
        'Inherited Metabolic Disorder — PKU: 10% after ded.',
        'Autism Spectrum Disorders: 10% after ded.'
      ]
    },
    exclusions: [
      'Maternity (route to Catalog)',
      'Adult dental',
      'Adult vision',
      'Pre-existing condition exclusions may apply'
    ],
    compared_to_user: {
      current_plan_premium: 890,
      savings_monthly: 470,
      savings_annual: 5640,
      deductible_delta_individual: 500,
      key_differences: [
        { category: 'premium', delta: '−$470/mo', favor: 'this_plan' },
        { category: 'deductible', delta: '−$500', favor: 'this_plan' },
        { category: 'specialist', delta: '$60 copay vs current $80', favor: 'this_plan' }
      ]
    },
    things_youll_use: [
      'Primary care: $20 copay (no deductible)',
      'Generic Rx: $10',
      'Specialist: $60 copay',
      'Preventive: No charge'
    ],
    things_to_know: [
      'Deductible: $6,500 individual',
      'Specialty drugs are 50% after deductible',
      'ER is 10% coinsurance after deductible'
    ],
    disclaimer: 'Network: Regence Advantage. Most-chosen plan for SP1 cohort in this state.'
  };

  // -----------------------------------------------------------
  // PLAN 3 — Healthy Premier Gold Standard (Premium)
  // -----------------------------------------------------------
  var PLAN_GOLD = {
    plan_id: 'plan_healthy_premier_gold_v1',
    tier: 'premium',
    tier_label: 'Premium',
    tier_optimization: 'Lowest deductible, lowest copays',
    name: 'Healthy Premier Gold Standard',
    carrier: 'University of Utah Health Plans',
    network_type: 'EPO',
    monthly_premium: 580,
    description: 'Highest premium, lowest deductible. Best if you use care often or have ongoing prescriptions.',
    highlights: [
      { label: 'Deductible', value: '$2,000 individual / $4,000 family' },
      { label: 'Primary care', value: '$30 copay' },
      { label: 'Generic Rx', value: '$15' }
    ],
    benefits: {
      medical_deductible_individual: 2000,
      medical_deductible_family: 4000,
      drug_deductible: '—',
      combined_med_drug_deductible: 'Individual: $2,000 / Family: $4,000',
      out_of_pocket_max_individual: 8200,
      out_of_pocket_max_family: 16400,
      primary_care: '$30',
      other_practitioner: '$30',
      specialist: '$60',
      urgent_care: '$45',
      emergency_room: COIN_25_AFTER_DED,
      emergency_transportation: COIN_25_AFTER_DED,
      preventive: 'No Charge',
      well_baby: 'No Charge',
      generic_drugs: '$15',
      preferred_brand_drugs: '$30',
      non_preferred_brand_drugs: '$60',
      specialty_drugs: '$250',
      imaging: COIN_25_AFTER_DED,
      xrays: COIN_25_AFTER_DED,
      laboratory: COIN_25_AFTER_DED,
      chiropractic: '—',
      outpatient_surgery: COIN_25_AFTER_DED,
      outpatient_rehabilitation: COIN_25_AFTER_DED,
      inpatient_physician: COIN_25_AFTER_DED,
      inpatient_hospital: COIN_25_AFTER_DED,
      skilled_nursing: COIN_25_AFTER_DED,
      habilitation: '$30',
      home_health: COIN_25_AFTER_DED,
      durable_medical: COIN_25_AFTER_DED,
      hospice: COIN_25_AFTER_DED,
      mental_health_outpatient: '$30',
      mental_health_inpatient: COIN_25_AFTER_DED,
      substance_abuse_outpatient: '$30',
      substance_abuse_inpatient: COIN_25_AFTER_DED,
      prenatal_postnatal: COIN_25_AFTER_DED,
      delivery_inpatient_maternity: COIN_25_AFTER_DED,
      rehab_speech: '$30',
      rehab_occupational_physical: '$30',
      allergy_testing: COIN_25_AFTER_DED,
      chemotherapy: COIN_25_AFTER_DED,
      radiation: COIN_25_AFTER_DED,
      dialysis: COIN_25_AFTER_DED,
      infusion_therapy: COIN_25_AFTER_DED,
      transplant: COIN_25_AFTER_DED,
      reconstructive_surgery: COIN_25_AFTER_DED,
      accidental_dental: '—',
      diabetes_education: COIN_25_AFTER_DED,
      routine_eye_exam_children: 'No Charge',
      eye_glasses_children: 'No Charge',
      dental_check_children: '—',
      additional_benefits: [
        'Outpatient Facility Fee (e.g. Ambulatory Surgery Center): 25% after ded.',
        'Prosthetic Devices: 20% after ded.',
        'Inherited Metabolic Disorder — PKU: 25% after ded.',
        'Autism Spectrum Disorders: 25% after ded.'
      ]
    },
    exclusions: [
      'Maternity (route to Catalog)',
      'Adult dental',
      'Adult vision',
      'Pre-existing condition exclusions may apply',
      'Chiropractic care'
    ],
    compared_to_user: {
      current_plan_premium: 890,
      savings_monthly: 310,
      savings_annual: 3720,
      deductible_delta_individual: -5000,
      key_differences: [
        { category: 'premium', delta: '−$310/mo', favor: 'this_plan' },
        { category: 'deductible', delta: '−$5,000', favor: 'this_plan' },
        { category: 'specialty_drugs', delta: '$250 vs % coinsurance', favor: 'this_plan' }
      ]
    },
    things_youll_use: [
      'Primary care: $30 copay',
      'Specialist: $60 copay',
      'Generic Rx: $15',
      'Preventive: No charge'
    ],
    things_to_know: [
      'ER is 25% coinsurance after deductible (higher than other plans)',
      'No accidental dental or chiropractic',
      'Network is University of Utah Health only'
    ],
    disclaimer: 'Network: U of U Health. Best in-network access for Salt Lake County providers.'
  };

  // -----------------------------------------------------------
  // FULL RESPONSE
  // -----------------------------------------------------------
  var MOCK_NORA_RESPONSE = {
    set_number: 1,
    total_sets: 3,
    user_profile: {
      dob: '1990-04-12',
      gender: 'M',
      zip: '84101',
      coverage_type: 'Individual',
      start_date: '2026-05-01'
    },
    plans: [PLAN_BRONZE, PLAN_SILVER, PLAN_GOLD],
    addons: {
      dental: [
        { tier: 'budget',      carrier: 'Delta Dental',         name: 'DeltaCare USA — UTA60 Individual/Family', monthly_premium: 19 },
        { tier: 'recommended', carrier: 'Manhattan Life DVH',   name: 'Manhattan Life DVH Select $1,500 Max',     monthly_premium: 47 },
        { tier: 'premium',     carrier: 'Delta Dental',         name: 'Delta Dental Immediate Coverage — Dental for Everyone', monthly_premium: 93 }
      ],
      vision: [
        { tier: 'budget',      carrier: 'VSP', name: 'VSP Base',     monthly_premium: 17 },
        { tier: 'recommended', carrier: 'VSP', name: 'VSP Premium',  monthly_premium: 22 },
        { tier: 'premium',     carrier: 'VSP', name: 'VSP Premium+', monthly_premium: 22 }
      ],
      critical_illness: [
        { tier: 'budget',      carrier: 'Assurity',                          name: 'Assurity Critical Illness $10,000', monthly_premium: 12 },
        { tier: 'recommended', carrier: 'Occidental Life Insurance Company', name: 'Critical Life $45,000',             monthly_premium: 73 },
        { tier: 'premium',     carrier: 'Occidental Life Insurance Company', name: 'Critical Life $100,000',            monthly_premium: 151 }
      ]
    },
    faq_chips: [
      'What is my deductible and how does it work?',
      "What's covered for specialist visits?",
      'Are prescriptions covered? What are the copays?',
      'What happens if I go to the emergency room?',
      'Is mental health treatment covered?'
    ]
  };

  // Expose
  window.MOCK_NORA_RESPONSE = MOCK_NORA_RESPONSE;
})();
