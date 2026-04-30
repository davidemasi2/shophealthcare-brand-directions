# ShopHealthcare.com — Internal Insurance Education Brief

> **Source:** `ShopHealthcare_AdBrief_v11.pdf` — translated verbatim to markdown on 2026-04-22.
> **From:** Scott Porter, Founder — ShopHealthcare.com / Golden Ticket FMO
> **To:** Davide De Masi, CMO
> **Date:** April 13, 2026
> **For:** META Ad Agency Distribution
> **Classification:** Confidential
> **Purpose:** Product logic, qualification rules, and audience guidance for the META ad team. Authoritative answer to the Apr-14 Scott-intake brief — governs FE wireframes, copy deck, Nora routing logic, and ad targeting.

---

## Section 1 — The Market

### Why this product exists

| Metric | Value | Note |
|---|---|---|
| **Total Addressable Market** | 60M+ | Self-employed Americans without adequate coverage |
| **Without adequate coverage** | 90% | Uninsured or on the wrong plan |
| **Earn over $100K/year** | 4.7M | Up 57% since 2020 |
| **Serviceable Market** | $6.7B annual | 15 target states |

- 60–73M self-employed Americans have no employer-sponsored coverage
- Most are uninsured, on the wrong plan, or overpaying for coverage they don't use
- They've never had a knowledgeable guide to private options — **that's what we are**
- **We do NOT sell ACA plans. We do NOT sell government-subsidized products. Private only.**

---

## Section 2 — Our Products

### Product 01 — PRIMARY GOAL ★ OPTIMIZE FOR THIS
**ShopHealthcare.com Plan**

- A la carte private coverage + supplemental policies stacked together
- **Premiums 50–60% lower** than a traditional private health plan
- **Annual rate increases under 5%** — historically stable
- **UnitedHealth Choice Plus PPO** — 93% of doctors, 97% of hospitals nationwide
- Covers **6 of 10 minimum essential coverages**
- Eligible ages **18–65**
- **Does NOT cover:** Maternity, Pediatric Dental, Rehab/Substance Abuse, Mental Health
- Built for **healthy, low-utilization individuals** — not for regular system users

### Product 02 — FALLBACK PATH
**Everything Else Catalog**

- Broader private coverage options for those who don't qualify for Plan 01
- Still off-exchange, still private — not ACA or government
- Right product for higher utilizers, pre-existing conditions, or maternity needs
- We still broker and earn — **this is not a dead end**
- **Ads should target Plan 01 profile; catalog catches the rest**

---

## Section 3 — Qualification Logic

### How every lead gets routed

```
Person arrives at ShopHealthcare.com
              ↓
     Age Check — Between 18 and 65?
      ├─ UNDER 18 / OVER 65 → HARD EXIT (cannot be served)
              ↓
     State Check — In a contracted state?
      ├─ OUT OF TERRITORY → HARD EXIT (geographic limitation)
              ↓
     Health Profile — Pre-existing? Pregnant? Regular doctor?
      ├─ CLEAN PROFILE (healthy, rare utilizer, not pregnant)
      │      → ShopHealthcare.com Plan (PLAN 01)
      └─ CONDITION PRESENT (pre-ex, pregnant, regular utilizer)
             → Everything Else Catalog (PLAN 02)
```

### Disqualification rules

| Rule | Routing |
|---|---|
| **Pre-existing conditions** | Any diagnosed chronic condition routes **out of Plan 01** — underwriting rule, not a sales call. → Catalog |
| **Pregnancy / planning pregnancy** | A la carte structure does not cover maternity. → Catalog |
| **Regular doctor utilization** | High utilizers don't benefit from a la carte pricing. Premium savings disappear. → Catalog |
| **Hard exit: Age or State** | Under 18, 65+, or outside contracted states — cannot write coverage. **Do NOT target in ads.** |

---

## Section 4 — Primary Plan: Health ProtectorGuard (HPG)

**Fixed benefits health insurance — Golden Rule Insurance Co. / UnitedHealthcare**

> Fixed indemnity = pays a stated cash benefit per event, not a percentage of actual costs.
> No deductible. No coinsurance. No copays. Benefit pays regardless of what other coverage exists.

### Policy-level exclusions (HPG3-GRI Policy Form)

These apply **in addition to** the sales-level disqualifiers above.

| Exclusion | Detail |
|---|---|
| **Pregnancy & Childbirth** | Excluded except complications of pregnancy or as required by state law. |
| **Mental Health & Substance Abuse** | No coverage for treatment of mental disorders or substance abuse. |
| **Pre-Existing Conditions (12-Month Lookback)** | Any condition for which care, diagnosis, or treatment was received or recommended within 12 months prior to effective date. Limitation expires after 12 months of coverage. |
| **Dental & Vision** | No dental expenses (except as expressly provided). No eyeglasses, contact lenses, hearing aids, eye refraction, or visual therapy. |
| **Cosmetic Treatment** | Excluded unless part of reconstructive surgery following trauma or illness. |
| **Infertility & Sexual Reassignment** | Infertility treatment and sexual reassignment surgery excluded. |
| **Experimental / Investigational** | No coverage for treatments classified as experimental or investigational. |
| **Services Outside the U.S.** | No coverage except emergency treatment. |
| **Self-Inflicted Harm / Criminal Acts** | Intentional self-harm, felony commission, riot participation, incarceration. |
| **Intoxication / Non-Prescribed Substances** | Loss sustained while intoxicated or under influence of narcotics/unprescribed controlled substances. |
| **High-Risk Activities** | Skydiving, bungee jumping, hang gliding, parachute jumping, semi-pro sports, scuba 60+ ft, paid motorsport instruction, rock/mountain climbing, skiing (paid instruction). |
| **Weekend Hospital Admissions** | Confinement beginning Fri/Sat not covered unless emergency or medically necessary inpatient surgery scheduled next day. (FL, TX waive.) |
| **Non-Medical Necessity** | Services not medically necessary for diagnosis/treatment of illness or injury. |
| **Rehabilitation / Custodial Care** | Hospital confinement primarily for rehab, custodial, educational, or nursing services (unless expressly covered). |

### HPG state availability & key variations

| State | Key variation |
|---|---|
| **Delaware** | ⚠ Maximum issue age is **60** — not 65. |
| **Florida** | Fri/Sat admission exclusion does not apply. Child eligibility to age 30 (unmarried, no other coverage). 45-day premium change notice. |
| **Georgia** | 60-day premium change notice required. |
| **Texas** | Fri/Sat admission exclusion waived. High-risk activity and motorsport exclusions do not apply. Family member provider exclusion waived. Out-of-U.S. exclusion waived except as noted. |
| **North Carolina** | Terrorism not excluded from war clause. Cosmetic exclusion does not apply to congenital defects. 45-day premium notice. |
| **Tennessee** | Chiropractic visits billed as Doctor Office Visits (not separate therapy benefit). |
| **Colorado** | Civil union partners eligible as spouse. Pre-existing symptom lookback exclusion does not apply (only actual treatment lookback). |
| **Nevada** | Pre-existing lookback reduced to **6 months** (vs. 12). 60-day premium notice. |
| **Wyoming** | Pre-existing lookback reduced to **6 months**. 60-day claim notice (vs. 30 days standard). |
| **Illinois** | High-risk activity exclusions do not apply. Civil union partners eligible. Child eligibility to age 30 for honorably discharged veterans. |
| **Virginia** | Mental health/substance abuse exclusion applies (drug addiction & alcoholism added). Many activity/lifestyle exclusions waived. Cosmetic narrowed for reconstructive cases. |
| **Michigan** | Self-inflicted harm, riot, and intoxication exclusions do not apply. Felony/misdemeanor exclusion replaces these. |
| **Louisiana** | 30-day right-to-examine. Incarceration exclusion does not apply to unadjudicated detainees. 45-day premium notice. |
| **AK / ME / MS / GA / NV / WI / NC** | 60-day premium change notice required (vs. 31-day standard). |
| **IN / OK / SC / LA** | 30-day right-to-examine / free-look period (vs. 10 days standard). |
| **AK, AL, AR, AZ, HI, IA, IN, KY, ME, MI, MN, MO, MS, NE, OK, RI, SC, UT, WI, WV, WY** | Follow base policy form with minor administrative variations. |

> **Delaware is the only state with a hard age cap below 65** — maximum issue age 60. All other contracted states follow the 18–65 window.

### HPG real-world scenarios

**Scenario 01 — The Healthy Freelance Consultant, 52 (Marco)**
Self-employed 8 years, one doctor visit a year, no chronic conditions. Paying $890/month for a traditional PPO he barely uses. HPG cuts premium by >50%, keeps him on UHC Choice Plus network, covers annual physical, urgent care, labs, Rx. **Saves $400+/month immediately.**

**Scenario 02 — The Independent Contractor, 38 (Danielle)**
Project-based IT work, no employer benefits. Healthy non-smoker, rarely sick. Couldn't justify $700+/month for a plan built around conditions she doesn't have. HPG gives her hospital, ER, surgery, Rx at a fraction of the cost — **benefits automatically increase in year two** as a reward for staying enrolled.

**Scenario 03 — The Self-Employed Tradesperson, 45 (Carlos)**
Runs his own HVAC company. Healthy, active, hasn't seen a specialist in years. Needed worst-case coverage — hospital stay, surgery, ICU. HPG's inpatient hospital benefit ($5,000/day on Premier) gives real protection. **Pays less per month than his truck payment.**

---

## Section 5 — Who to Target

### Audiences most likely to qualify and convert

| Segment | Description | Flags |
|---|---|---|
| **01 — Highest Value** | **Established professionals, 45–64.** Healthy, rarely uses the system. Self-employed for years, never found the right plan. 37% of all self-employed are 55+. Premium savings most impactful at this income. | `Plan 01 Primary` `Consultant` `Owner/Operator` |
| **02** | **Tradespeople & contractors, 35–55.** 2.9M solo construction businesses nationally. Physically healthy, low utilizers. Highest uninsured rate of any skilled occupation. Targetable via trade interests on META. | `Plan 01 Primary` `Contractor` `HVAC` |
| **03** | **Real estate agents & brokers.** 3.2M nationally — one of the most targetable groups. Commission income, zero employer coverage. Working-age, typically healthy. Trust-responsive messaging performs well. | `Plan 01 Primary` `Real Estate` `Broker` |
| **04** | **Health & wellness practitioners.** 2.3M solo businesses. Healthy by lifestyle, often uninsured. Respond to independence/self-reliance messaging. | `Plan 01 Primary` `Trainer` `Coach` |
| **05** | **Full-time gig workers, 28–45.** Went full-time, never set up coverage. May qualify for Plan 01 depending on health profile. Education-first creative works best. | `Plan 01 or Catalog` `Freelancer` |
| **⊘ DO NOT TARGET** | **Pregnant, under 18, or 65+.** Cannot be served — hard exits from our flow. Exclude Medicare-age demographics from all campaigns. Exclude pregnancy intent audiences. | `Exclude` `Hard Exit` |

---

## Section 6 — Supplemental Product: Accident ExpenseGuard

**Accidental injury insurance with AD&D — Golden Rule Insurance Co. / UnitedHealthcare**

> Fixed indemnity accident insurance with AD&D. Pays cash directly to you for covered accidental injuries. Supplement to health insurance — not a substitute for major medical.

| Attribute | Value |
|---|---|
| Product type | Accident — fixed indemnity + AD&D |
| Eligible ages | 18–64 (renewable to age 70) |
| Deductible | $250 per person, per calendar year |
| Benefit options | 5 tiers: $5K–$20K injury + matching AD&D |

### What it covers

- **Within 48 hours:** burns, lacerations, concussion, ER visit, urgent care
- **Within 30 days:** fractures, hospital stay/ICU, surgery, prosthetics, anesthesia, ambulance, labs, x-rays, MRI/CT, doctor visits, prescriptions
- Pays in addition to any other insurance — no coordination of benefits
- Annual benefit resets each calendar year
- No waiting period

### AD&D benefit (included with every plan)

- Death from accidental injury within 30 days → 100% of benefit
- Loss of two or more limbs/hands/feet → 100%
- Loss of one limb or hand/foot → 50%
- Thumb & index finger same hand → 25%
- AD&D amount matches selected injury benefit, paid on top of injury benefit
- Lifetime maximum per covered person

### Exclusions

- **Mental Health & Substance Abuse** — no coverage for related services
- **Infections / Stroke / Non-Accidental Illness** — all infections excluded regardless of cause; stroke excluded; only accidental injuries covered
- **High-Risk Activities** — skydiving, bungee jumping, hang gliding, parachute jumping, semi-pro sports, scuba 60+ ft, paid motorsport/ski/rock climbing instruction
- **Work-Related / Cosmetic / Experimental** — excluded
- **Services Outside the U.S.** — excluded
- **Intoxication / Self-Harm / Criminal Acts / Incarceration** — excluded
- **Weekend Hospital Admissions** — Fri/Sat excluded unless emergency or next-day surgery (TX waives)

### Accident ExpenseGuard state availability

| State | Key variation |
|---|---|
| **Available in** | AL, AK, AZ, AR, CA, CO, CT, DE, DC, FL, GA, HI, ID, IL, IN, IA, KS, LA, ME, MD, MI, MN, MS, MO, MT, NE, NV, NC, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VA, WV, WI, WY |
| **AR / IL / MD / ME / OK / TX / VA** | AD&D window extended to 90 days (vs. 30). |
| **Utah** | AD&D window extended to 180 days. |
| **Texas** | Fri/Sat admission waived. High-risk, motorsport, family-member provider exclusions do not apply. |
| **California** | No deductible applies. |
| **Indiana** | Fracture treatment window extended to 6 months. |
| **Kentucky / Wyoming** | Notice of claim extended to 60 days (vs. 30). |

### Accident ExpenseGuard scenarios

**Scenario 01 — The Weekend Athlete, 34 (Jason)**
Coaches his kid's soccer team and plays rec league. Tears his ACL. HPG covers hospital/surgery but he still owes $2,800. Accident ExpenseGuard ($10,000 tier) pays him directly — covers the gap plus two weeks off work without financial stress.

**Scenario 02 — The Single Mom with a Young Child, 41 (Priya)**
9-year-old falls off a backyard playset, breaks her arm. ER, x-rays, casting, follow-ups: $6,200 total. After HPG + network discounts she owes $1,400. Accident plan pays $4,800 directly — covers lost work hours and childcare during recovery.

**Scenario 03 — The Independent Delivery Driver, 29 (Marcus)**
Full-time gig delivery driver in a minor off-the-job car accident — lacerations, concussion, urgent care. $3,100 bill. $5,000 Accident plan pays $2,850 after $250 deductible. **No out-of-pocket, no medical debt.**

---

## Section 7 — Supplemental Product: CriticalGuard

**Lump sum critical illness insurance — Golden Rule Insurance Co. / UnitedHealthcare**

| Attribute | Value |
|---|---|
| Product type | Critical Illness — lump sum on first diagnosis |
| Eligible ages | 18–90 (guaranteed issue options available) |
| Waiting period | 30 days from policy effective date |
| Benefit range | $5K–$100K (varies by age and plan type) |

### Four plan types — choose your coverage

- **Cancer Only** — life-threatening cancer (100%), cancer in situ (25%), benign brain tumor (25%), skin cancer ($500)
- **Heart/Stroke Only** — heart attack (100%), stroke (100%), heart illness (25%)
- **Cancer + Heart/Stroke** — combines both above
- **Critical Illness (Full Suite)** — all above plus: Advanced Alzheimer's (100%), ALS (100%), Coma 7+ days (100%), End Stage Renal Failure (100%), Major Organ Transplant (100%), Loss of Independent Living (50%)

### Included & optional benefits

- All plans include: **$10K COVID ICU benefit**, 50% pregnancy bonus benefit
- Optional add-ons: Wellness ($75/exam), Rx (up to $600/yr), Telemedicine ($0)

### Benefit lifetime maximum by age

| Age | Max |
|---|---|
| 18–49 | up to $100,000 |
| 50–64 | up to $100,000 |
| 65–74 | up to $75,000 |
| 75–90 | up to $50,000 |

- $5,000 and $10,000 tiers are **guaranteed issue** (no underwriting) for most age groups
- Benefits paid regardless of other insurance — use money however needed
- Preexisting condition limitation: 12-month lookback, expires after 12 months of coverage

### CriticalGuard exclusions

- **Pre-Existing Conditions (12-Month Lookback)** — no benefit for qualifying events caused by conditions treated/recommended within 12 months of effective date
- **30-Day Waiting Period** — no benefits for events diagnosed within 30 days
- **AIDS / HIV-Related Conditions** — excluded
- **Non-Qualifying Conditions** — only specifically defined qualifying events covered; any other disease, even if complicated by a qualifying event, is not covered
- **High-Risk Activities (Heart/Stroke & Full Suite Plans)** — professional sports, skydiving, hang gliding, bungee jumping, scuba 60+ ft, rodeo, paid motorsport/ski/rock-climbing instruction
- **Intoxication / Felony / Self-Harm / Incarceration** — excluded

### CriticalGuard state availability

| State | Key variation |
|---|---|
| **Available in** | AK, AL, AR, AZ, CO, CT, DC, DE, FL, GA, HI, IA, ID, IL, IN, KS, KY, LA, MD, ME, MI, MN, MO, MS, MT, NC, ND, NE, NH, NV, OH, OK, PA, RI, SC, SD, TN, TX, UT, VA, WI, WV, WY |
| **Maryland** | No waiting period. Intoxication, felony, riot, incarceration, AIDS exclusions do not apply. |
| **Indiana** | First Diagnosis requirement does not apply. COVID benefit not available. |
| **ME / NH / UT / NV / WY** | Preexisting lookback reduced to **6 months** (vs. 12). |
| **Pennsylvania** | Wellness, Rx, Telemedicine optional benefits not available. Optum programs not available. Preexisting lookback is **5 years**. |
| **Idaho** | Loss of Independent Living and Major Organ Transplant not available. Wellness/Rx/Telemedicine not available. |
| **Georgia** | Lifetime max $250K for Cancer + Heart/Stroke and Critical Illness plans. 60-day premium notice. |
| **Texas** | Out-of-U.S., intoxication, riot, AIDS, high-risk activity exclusions all waived. Optum programs not available through policy. |
| **Virginia** | Wellness and Telemedicine not available. First Diagnosis replaced with Diagnosis — does not need to be first in lifetime. |

### CriticalGuard scenarios

**Scenario 01 — The Real Estate Agent, 49 (Sandra)**
No family history of cancer but knows the stats. Picks Cancer + Heart/Stroke at $50,000. Three years later diagnosed with breast cancer. Receives $50,000 lump sum — covers six months of reduced income, deductibles, and household help during recovery.

**Scenario 02 — The Solo Business Owner, 58 (David)**
Built landscaping business over 25 years. Has a heart attack, survives, faces $60,000+ exposure — hospital, rehab, three months unable to work. CriticalGuard Heart/Stroke pays $75,000. **Keeps business afloat, pays crew, doesn't touch retirement.**

**Scenario 03 — The Older Freelancer, 67 (Patricia)**
Semi-retired graphic designer still taking clients. Picks full Critical Illness suite at $25,000. Husband diagnosed with early-stage Alzheimer's. As primary caregiver her income drops. CriticalGuard pays the full $25,000 Advanced Alzheimer's benefit — covers in-home care for nearly a year.

---

## Section 8 — Supplemental Product: DentalWise

**PPO dental insurance for individuals and families — Golden Rule Insurance Co. / UnitedHealthcare**

| Attribute | Value |
|---|---|
| Product type | Dental PPO insurance |
| Eligible ages | 18–99 (spouse/partner 16–99; children under 26) |
| Deductible | $100 per person, per policy year |
| Waiting period | None (except implants: 12 months) |

### DentalWise plan comparison

| Plan | Annual Max | Preventive | Basic (fillings) | Major (crowns/root canals) | Implants |
|---|---|---|---|---|---|
| **Basic Plan** | $1,000 | 100% | 60% yr1 / 80% yr2+ | Not covered | Not covered |
| **Plan 1000** | $1,000 | 100% | 60% yr1 / 80% yr2+ | 15% yr1 / 50% yr2+ | Not covered |
| **Plan 2000** | $2,000 | 100% | 60% yr1 / 80% yr2+ | 15% yr1 / 50% yr2+ | 50% after deductible ($1,500 lifetime max) |

### DentalWise exclusions

- **Cosmetic / Aesthetic Services** — no whitening, veneers placed for appearance only
- **TMJ / Jaw Surgery** — no coverage for temporomandibular joint, upper/lower jaw bone surgery, or orthognathic surgery (GA and MN exceptions apply)
- **Wisdom Tooth Surgical Extractions** — excluded. Simple (non-surgical) extractions covered as basic services
- **Mouthguards / Occlusal Guards / Duplicates** — mouthguards, occlusal guards, precision attachments, duplicate dentures, harmful habit appliances, sleep disorder appliances all excluded
- **Services Outside the U.S.** — excluded except dental emergency
- **Experimental / Non-Medically Necessary** — excluded

### DentalWise state availability

| State | Key variation |
|---|---|
| **Available in** | AK, AL, AR, AZ, CO, CT, DC, DE, FL, GA, HI, IA, ID, IL, IN, KS, KY, LA, MD, ME, MI, MN, MO, MS, NC, ND, NE, NH, NV, OH, OK, PA, SC, SD, TN, TX, UT, VA, VT, WI, WV, WY |
| **Colorado / Minnesota** | Basic / Basic Plus plans not available. MN also includes TMJ and cleft lip/palate under major services. |
| **Florida** | Dependent children eligible to age 31. 45-day premium notice. Foster children eligible. |
| **Georgia** | TMJ included in major services. 60-day premium notice. 30-day right to examine. |
| **Maine** | Implant benefits limited to insured persons over age 18. 60-day premium notice. |
| **Texas** | Family member provider exclusion waived. Grandchildren eligible as dependents. |
| **North Carolina** | Cleft lip/palate included in major services. Rates guaranteed for 12 months, 45-day notice thereafter. Reimbursement provision does not apply. |
| **Vermont** | Implant waiting period reduced to **6 months**. Civil union partners eligible as spouse. |
| **Illinois** | Foster children and grandchildren with interim court custody order eligible. Dependent age limit extended to 30. |

### DentalWise scenarios

**Scenario 01 — The Self-Employed Consultant Who Skipped Dental, 44 (Tom)**
No dental coverage since leaving his last W-2 job six years ago. Signs up for Plan 1000 — no waiting period. Exam and cleaning immediately (100% covered). Needs two fillings and a crown. Total out-of-pocket: **$182**. Without coverage, that crown alone would've been $1,400.

**Scenario 02 — The Young Freelancer Building Good Habits, 27 (Alexis)**
Full-time content creator. Picks Basic Plan — lowest premium — wants preventive covered plus basic fillings. Two cleanings/year, x-rays, one simple filling all covered. **Pays less per month for dental than for her streaming subscriptions.**

**Scenario 03 — The Self-Employed Family, 51 (Robert)**
Robert and his wife both self-employed. Enroll together on Plan 2000. Teenage son needs a crown, Robert needs a root canal, wife looking at an implant. $2,000 annual max per person, 50% major coverage in year two, and $1,500 implant lifetime benefit means the whole family gets real coverage without group plan pricing.

---

## Footer — Confidentiality

> ShopHealthcare.com / Golden Ticket FMO — Confidential Internal Document — April 2026
>
> For internal marketing and creative team distribution only. Product availability subject to state contracting and underwriting guidelines. ShopHealthcare.com plans involve a la carte private coverage combined with supplemental insurance — **not ACA, Medicare, Medicaid, or government-sponsored products.** Consumer routing administered through ShopHealthcare.com powered by **Nora AI.**
