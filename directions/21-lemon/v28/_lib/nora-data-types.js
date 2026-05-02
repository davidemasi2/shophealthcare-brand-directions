/* =============================================================
   NORA DATA TYPES — V21 Component D
   Single source of truth for the surface_plan_options response shape.
   This file is documentation-only (JSDoc typedefs). It exports nothing
   beyond comments — included so editors/IDEs pick up types when
   the lib is loaded as a module.

   Spec: front-end design/endpoints-contract.md §5
         front-end design/nora-app-design-brief.md §8
         NORA OUTPUTS (OLD)/MAIN PAGE VIEW.pdf, LARGE PLAN VIEW.pdf
   ============================================================= */

/**
 * @typedef {Object} NoraUserProfile
 * Quiz/intake recap shown alongside the plan options. Mirrors the
 * "user_profile" block returned by the backend.
 * @property {string} dob          ISO date "YYYY-MM-DD"
 * @property {'M'|'F'} gender
 * @property {string} zip          5-digit ZIP
 * @property {string} coverage_type  e.g. "Individual", "Individual+Spouse", "Family"
 * @property {string} start_date   ISO date — first day of coverage
 */

/**
 * @typedef {Object} PlanHighlight
 * Single highlight row shown on a plan card (max 3 per card).
 * @property {string} label   short label, e.g. "Deductible"
 * @property {string} value   the value string, e.g. "$9,000 individual"
 */

/**
 * @typedef {Object.<string, string|number|string[]>} PlanBenefits
 * The full benefit table. Keys map to specific benefit categories.
 * Values are pre-formatted display strings ("$60 Copay…") OR raw
 * numbers (medical_deductible_individual etc.). Unknown keys are
 * tolerated — the report Fine Print section renders all of them.
 *
 * Common keys:
 *   medical_deductible_individual  (number)
 *   medical_deductible_family      (number)
 *   out_of_pocket_max_individual   (number)
 *   out_of_pocket_max_family       (number)
 *   primary_care                   (string)
 *   specialist                     (string)
 *   urgent_care                    (string)
 *   emergency_room                 (string)
 *   preventive                     (string)
 *   generic_drugs                  (string)
 *   preferred_brand_drugs          (string)
 *   non_preferred_brand_drugs      (string)
 *   specialty_drugs                (string)
 *   imaging                        (string)
 *   outpatient_surgery             (string)
 *   inpatient_hospital             (string)
 *   mental_health_outpatient       (string)
 *   mental_health_inpatient        (string)
 *   substance_abuse_outpatient     (string)
 *   substance_abuse_inpatient      (string)
 *   prenatal_postnatal             (string)
 *   delivery_inpatient_maternity   (string)
 *   rehab_speech                   (string)
 *   rehab_occupational_physical    (string)
 *   additional_benefits            (string[])
 */

/**
 * @typedef {Object} ComparedToUser
 * OCR-derived comparison block. Only present if user scanned their card.
 * Populated by the /api/scan-card endpoint. Drives the Tertiary tier
 * of Component A in Mode 2.
 * @property {number} current_plan_premium    monthly $ they currently pay
 * @property {number} savings_monthly         (current - this plan) per month
 * @property {number} savings_annual          ×12 of above
 * @property {number} deductible_delta_individual  + means worse, − better
 * @property {Array<{category:string, delta:string, favor:'this_plan'|'current_plan'}>} key_differences
 */

/**
 * @typedef {Object} Plan
 * One of the 3 plans in a plan_set.
 * @property {string} plan_id
 * @property {'budget'|'recommended'|'premium'} tier
 * @property {string} tier_label                e.g. "Budget Option"
 * @property {string} [tier_optimization]       e.g. "Optimize for Lowest Monthly Cost"
 * @property {string} name                      plan title
 * @property {string} carrier                   carrier name (used to look up logo)
 * @property {string} [carrier_logo]            optional override URL
 * @property {'EPO'|'PPO'|'HMO'|'POS'} network_type
 * @property {number} monthly_premium           in $
 * @property {string} description               1-sentence plain-English description
 * @property {PlanHighlight[]} highlights       3 rows shown on the card
 * @property {PlanBenefits} benefits            40+ rows for Fine Print + comparison
 * @property {string[]} exclusions              ALWAYS surfaced — Plan 01 compliance
 * @property {ComparedToUser} [compared_to_user]  only if card-scanned
 * @property {string[]} things_youll_use        4 lines, persona+conditions filtered
 * @property {string[]} things_to_know          things_to_know warnings (mute color)
 * @property {string} [disclaimer]              optional carrier-specific footer string
 */

/**
 * @typedef {Object} AddOn
 * One add-on tier entry. 3 categories × 3 tiers = 9 add-ons total.
 * @property {'budget'|'recommended'|'premium'} tier
 * @property {string} carrier
 * @property {string} name
 * @property {number} monthly_premium
 */

/**
 * @typedef {Object} AddOns
 * Optional companion coverage shown in the Mode 2 report.
 * @property {AddOn[]} dental
 * @property {AddOn[]} vision
 * @property {AddOn[]} critical_illness
 */

/**
 * @typedef {Object} NoraPlanSetResponse
 * The full surface_plan_options response. This is what the frontend
 * receives as a single payload — the same shape feeds Mode 1 (cards),
 * Mode 2 (drawer report), and Mode 3 (compare modal).
 * @property {number} set_number              1-indexed (1 of total_sets)
 * @property {number} total_sets              total available sets
 * @property {NoraUserProfile} user_profile
 * @property {Plan[]} plans                   exactly 3 plans (Budget, Recommended, Premium)
 * @property {AddOns} addons
 * @property {string[]} faq_chips             5 follow-up question prompts
 */

/**
 * @typedef {Object} PlanCardsOptions
 * Mount options for the Mode 1 component (PlanCards.mount).
 * @property {NoraPlanSetResponse} planSet
 * @property {string} [selectedPlanId]
 * @property {function(string):void} [onSelect]
 * @property {function():void} [onCompareClick]
 * @property {function(number):void} [onSetChange]   pagination callback
 */

/**
 * @typedef {Object} PlanReportOptions
 * Mount options for the Mode 2 component (PlanReport.mount).
 * @property {NoraPlanSetResponse} planSet
 * @property {string} selectedPlanId
 * @property {function():void} [onSave]
 * @property {function():void} [onEmailPdf]
 * @property {function():void} [onForward]
 * @property {function():void} [onContinueEnroll]
 * @property {boolean} [skipped]              if true → save/forward/share locked
 * @property {string} [licenseText]           override license footer string
 */

/**
 * @typedef {Object} PlanCompareModalOptions
 * Mount/show options for Mode 3 (PlanCompareModal.show).
 * @property {NoraPlanSetResponse} planSet
 * @property {boolean} [diffsOnly]            initial state of "show only diffs" toggle
 * @property {function():void} [onClose]
 * @property {string} [licenseText]
 */

/* This file deliberately exports nothing at runtime — comments only. */
(function () { 'use strict'; })();
