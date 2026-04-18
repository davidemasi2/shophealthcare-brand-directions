# ShopHealthcare — Design Thesis & Reference Pack

**Purpose:** Single-file ingestible reference for front-end design, brand, and conversion work. Aggregates every locked decision, every active open question, every reference asset worth citing. No raw interview transcripts. No redundant restatement.

**Source-of-truth map:** Notion (Brand & FE Decision Brief, FE Architecture Brief, Homepage Recs, FE Rebuild Direction, Signal Validation, UX Swipe File, Phase B Amendment, Week 2 Execution, Meeting Notes) + local `brand bible/`, `front-end design/`, `comp-library/`, `stitch-exports/` + 20 brand direction proposals.

**Target launch:** Priority 1A = F4 (Cliff Letter), 1B = F1 (Subsidy Shock). Sprint ends Week 3 with production LPs live. Soft May 1 deadline per April 8 strategy meeting.

---

## 1. Positioning (locked)

**"Confident Approachable."** Calm authority. Plain language. Never condescending. Never bureaucratic. This is the positioning lock against which every one of the 20 brand directions below was written — they diverge on aesthetic whitespace, not on this core.

**Category insight driving everything:** Health insurance is the only consumer category where the document you pay for is illegible on purpose. Every design decision is a vote against that legacy.

**Market moment (why now):**
- 4.8M Americans newly uninsured (2026)
- 92% of marketplace enrollees facing premium increases, avg +$1,016/yr
- ACA enhanced subsidies expired Dec 31, 2025 → the "subsidy cliff"
- Federal Navigator program funding cut 90% → trusted public guidance vacuum
- Consumer sentiment -0.74 to -0.40 across platforms (historic lows)
- AI trust is split but curious — 40% willing to try AI for insurance if it's faster

Every validated ad hook, every funnel entry, every direction riffs off these five facts.

---

## 2. The 5 Personas

Locked. No new personas before launch. Each has psychometric profile, primary funnel, qualifying economic fact, and validated ad-copy register.

### RU-1 — Recently Uninsured
- **Who:** Laid off in last 6 months, lost employer coverage, no SEP clarity.
- **Emotion:** Fear + urgency. "I have 63 days, what do I do."
- **Primary funnel:** F1 (Subsidy Shock) and F2 (Navigator replacement).
- **TAM:** ~4.8M.
- **Validated hook:** "You lost your job. You have 63 days. Here's exactly what to do."
- **Trust triggers:** licensed agent credential, SEP deadline math, specific dollars.
- **Fails on:** abstract "coverage solutions" language, happy families holding clipboards.

### SP-1 — Self-Employed Professional
- **Who:** 1099, freelancer, founder, creative. Lives in Linear/Figma/Notion/Stripe.
- **Emotion:** Skeptical + competent. "I run my own books; don't patronize me."
- **Primary funnel:** F2 (Navigator) and F5 (Check-Up).
- **TAM:** ~16M (largest single persona).
- **Validated hook:** "Navigator funding cut 90%. You're on your own. We're not."
- **Trust triggers:** data density, keyboard-first UX, honest commission disclosure.
- **Fails on:** soft pharma photography, "Your health matters" platitudes.

### BR-1 — Pre-Medicare Bridge (55–64)
- **Who:** Too young for Medicare, often early-retired or laid off in late career.
- **Emotion:** Anxious + warm. Most important coverage decision of their life.
- **Primary funnel:** F3 (Bridge) — **gated on Golden Ticket product fit**.
- **TAM:** ~15M in age band; narrower slice qualifies for GT.
- **Validated hook:** "55 to Medicare is the hardest 5 years. We simplify it."
- **Trust triggers:** named licensed agent with photo, phone number above fold, slower pace, bigger type.
- **Fails on:** speed-forward UX, anonymous chatbots, tabloid volume.

### CL-1 — Renewal-Triggered (Cliff Letter)
- **Who:** Got the 2026 renewal letter. Plan went up $127–$400/mo. Furious.
- **Emotion:** Angry + reactive. Fast-moving, not trust-anxious.
- **Primary funnel:** F4 (Cliff Letter) — **Priority 1A**.
- **TAM:** ~23M+.
- **Validated hook:** "Your renewal went up $127. Scan the letter. See what else exists."
- **Trust triggers:** card scan as hero, specific variance number, no fluff.
- **Fails on:** warm onboarding, long-form storytelling, "help" language.

### PC-1 — Passive/Complacent Check-Up
- **Who:** Has insurance. Thinks they're fine. Hasn't checked in 3+ years.
- **Emotion:** Disengaged + playful. Not in pain, not in panic.
- **Primary funnel:** F5 (Check-Up) — free diagnostic framing.
- **TAM:** ~23M+.
- **Validated hook:** "When did you last actually check your health insurance?"
- **Trust triggers:** curiosity hook (score/grade/report card), free framing, shareable artifact.
- **Fails on:** urgency banners, loss framing, anger.

**Persona register map for voice:**
- RU-1 → direct, deadline-forward
- SP-1 → dense, no-BS, peer-to-peer
- BR-1 → slower, warmer, document-forward, agent-visible
- CL-1 → fast, specific numbers, variance-forward
- PC-1 → curious, playful, diagnostic framing

---

## 3. The 5 Funnels

| # | Route | Persona | Entry | Hero mechanic | Priority |
|---|---|---|---|---|---|
| F1 | `/lost-coverage` | RU-1 | Meta cold | Quiz (Hims-pattern one-Q-per-screen) | **1B** |
| F2 | `/freelancer` | SP-1 | Search + Meta | Nora chat + navigator-void hero | 2 |
| F3 | `/pre-medicare` | BR-1 | Referral + search | Agent-visible LP + quiz (4–5Q) | Gated on GT fit |
| F4 | `/renewal` | CL-1 | Direct mail QR + Meta retarget | **Card scan as hero** | **1A** |
| F5 | `/check-my-plan` | PC-1 | Social + referral | Free diagnostic (score/grade/report card) | 4 |

**Funnel gating rules (locked):**
- F4 and F1 ship first. F2 and F5 follow Week 3.
- F3 blocked on Golden Ticket (GT) product confirmation + photography readiness + staffed agent phone line.
- Every funnel includes Nora handoff; Nora receives pre-filled context per contract in §8.
- Golden Ticket restriction copy must appear verbatim in Nora scripts before any BR-1 traffic.

**Cross-funnel pattern — "Savings Reveal Card":** anchor-number moment borrowed from Zillow's Zestimate. Every funnel terminates in the same reveal card (pre-calc → revealing → detailed states) so the dopamine beat is consistent regardless of entry.

---

## 4. Homepage Architecture — Option A (locked)

Three options were tested (Tiles-Dominant, Narrative-Dominant, Hybrid). **Option A — Tiles-Dominant — confirmed.** It's the only layout that lets a first-time visitor self-segment into a persona funnel without reading any copy.

**Stack (top to bottom):**
1. **Trust Bar** (fixed, static, above fold) — licensed agent credential · 44-state coverage · plan count
2. **Hero** — one line. Signal Validation-compliant. Current lock: "Every plan in your state. One number. Scan your card."
3. **Step 0 Tiles** (5 variants, Tile 1 largest) — one tile per persona, no clinical jargon
4. **Parallel paths row** — phone + free check-up (serves BR-1 + PC-1 who may not self-identify in tiles)
5. **How it works** (3-step visible flow)
6. **Social proof** (3-up stat strip, named agents + plan type)
7. **Trust expansion** + footer

**Mobile overrides:**
- Tile 1 stays full-width, others collapse to 2-col
- Sticky scan CTA (see H2 open question — A/B post-launch)
- Phone number behavior per H5 (visible always vs. persona-gated)

**Tile labels (locked 4 of 5):**
1. "I just lost my coverage" (RU-1)
2. "I'm self-employed" (SP-1)
3. "My renewal just went up" (CL-1)
4. **Open — H1** (BR-1: "55-64, not yet on Medicare" vs. "Bridging to Medicare" vs. "Between jobs and Medicare")
5. "I just want a check-up" (PC-1)

---

## 5. The 8 Shared Components

Stitch generates structure; Brand Bible dresses. Component anatomy lives in Stitch output + FE Architecture Brief §4. States and interaction rules below are the locked contract.

| # | Component | States | Appears in |
|---|---|---|---|
| C1 | Trust Bar | 1 (static) | Every page |
| C2 | Step 0 Tiles | 1 + hover | Homepage |
| C3 | Card Scan Module | 5 (pre-scan, camera, processing, error, results) | F4 hero, F5 hero, Nora handoff |
| C4 | Quiz Engine | n per branch (one-Q-per-screen) | F1, F3, F5 |
| C5 | Savings Reveal Card | 3 (pre-calc, revealing, detailed) | Terminal state of every funnel |
| C6 | Nora Chat Interface | 4 (pre-fill, typing, handoff, resolved) | Every funnel terminal + `/assistant` |
| C7 | Limitation Disclosure | inline + expandable | Anywhere plans are named |
| C8 | Social Proof Strip | 3-up (named + plan type) | Every LP + homepage |

**C3 — Card Scan Module (special callout):** This is the single most competitive-differentiating component. Mirrors direct-mail behavior (QR code → card scan → pre-fill). OCR pipeline powered by Steady integration (per April 15 meeting notes). Five states must be bulletproof because this component IS the F4 hero.

**C6 — Nora:** Named AI pattern (see Ada, Cleo). Nora is a **closer**, not a full-funnel chatbot. She only opens with pre-fill context from the upstream funnel. See §8 pre-fill schema.

---

## 6. Brand Directions — 20 Treatments

Four core directions were written against four unclaimed whitespaces. Sixteen additional directions are variants, hybrids, or novel extensions. Only one will ship. No blending. Below is the triage register — each direction gets: whitespace, analog brands, primary persona fit, failure mode.

### Core four

**01 — Calm Hand** — *Quiet editorial calm.* Analogs: Monocle, Apple, Mailchimp classic, Stripe, Pentagram retirement work. Fits: SP-1, CL-1. Fails: RU-1 urgency, PC-1 curiosity.

**02 — Receipt** — *Document-forward radical transparency.* Analogs: GoodRx pushed further, Robinhood disclosures, Figma settings, IRS best forms, Bloomberg terminal. Fits: SP-1, CL-1. Fails: BR-1 warmth need (see variant 05 and 12).

**03 — Public Service** — *Civic utility confidence.* Analogs: gov.uk, 18F, NY Subway, Bloomberg Terminal, Apple Health Records, USPS good parts, Vignelli. Fits: all personas surprisingly well. Fails: creative SP-1 who want taste signals.

**04 — Protest** — *Righteous populist activism.* Analogs: Patagonia activist era, Cash App, Bernie 2020 merch, Oatly anti-dairy, Dollar Shave Club early, early Mailchimp weird. Fits: RU-1, CL-1. Fails: BR-1 (see 05), PC-1 (see 06), high polarization risk.

### Variants & adaptations

**05 — Receipt × Bridge** — Receipt warmed for BR-1. Manila paper, bigger type, licensed agent block, slower pace.

**06 — Protest × Check-Up** — Protest energy redirected from ANGER to INCREDULITY for PC-1. Card scan as free diagnostic, friend-at-bar voice.

**07 — Terminal** — Novel. Linear/Vercel/Arc-style dashboard-as-brand. "The interface IS the pitch." Fits SP-1 tech/creative segment.

**08 — Score** — Spotify Wrapped × Credit Karma. 0–100 shareable Coverage Score. Viral hook, PC-1 primary.

**09 — Club** — Membership identity (USAA, Costco, Amex Black). Golden Ticket reframed as membership card. (Redone as Co-op in 16.)

**10 — Headline** — NY Post tabloid. "EXPOSED: YOU'RE PAYING $2,748 MORE." Screenshot-bait. Fits RU-1 + CL-1.

**11 — Rave** — Festival poster. Neon on black. Maximum pattern interrupt. Fits SP-1 creatives + PC-1 shock-stop.

**12 — Almanac** — Receipt humanist variant. Wirecutter × NYT Cooking × Lemonade warmth. Warm paper, humanist serif, hairline tables.

**13 — Reform** — Protest softened. Navy over Alarm Red. "We believe" over "We refuse." Editorial manifesto voice.

**14 — Report Card** — Receipt × Score hybrid. Clinical audit, not game UI. 47-point evaluation, shareable because credible.

**15 — Dispatch** — Headline humanized. ProPublica over NY Post. Condensed serif, byline, investigation framing.

**16 — Co-op** — Club redone as cooperative / mutual aid. REI × Vanguard × Patagonia environmental report. Honest-about-commissions register.

**17 — Grade** — Novel Score variant. Blue-book exam aesthetic. Big red "C−", margin comments, "See me after class." Fits PC-1 + over-30s who never used Credit Karma.

**18 — Ledger** — Novel Receipt variant. Double-entry bookkeeping, 1926 CPA register. Freelancer-native — green bar paper, debits/credits columns. Highest SP-1 resonance of any direction.

**19 — Operator** — Novel. Ramp × Mercury × Linear dashboard. Light mode mandatory. "Healthcare for people who run their own P&L." SP-1 ops segment.

**20 — Studio** — Novel. Figma × Linear × Framer editorial. Instrument Serif typography taste. SP-1 creatives (~5M of the 16M). Requires the highest execution bar.

**Current team favorite (per April 15 meeting):** Receipt (02). Not locked.

**Decision forcing function:** Voice codification (Brand Bible Decision 5) cannot fully lock without the direction chosen. Direction affects typographic register, color, Nora visual ID, photography treatment, and voice DO/DON'T specifics.

---

## 7. Brand Bible — 5 Decisions to Lock (Week 1)

Every Stitch output gets dressed in these 5 decisions. Nothing more, nothing less.

### Decision 1 — Color
- Primary brand color (differentiated from: Oscar coral, Lemonade pink, Stride yellow, GoodRx green, Devoted orange)
- Trust-signal accent (Trust Bar, licensed agent, limitation disclosures)
- Neutral scale (5 steps min)
- Alert system (error, warning, success, info)
- Deliverables: `colors.md` + Figma styles + `tokens.css`

### Decision 2 — Typography
- Headline + body (can be same family)
- 6-step size scale, mobile + desktop
- Weight hierarchy
- Rules for: hero, body, quiz Q's, Nora messages, savings reveal numbers (display), legal (small readable)
- Deliverables: `typography.md` + Figma text styles + `tokens.css`

### Decision 3 — Nora Visual Identity
- Avatar: illustrated leaning (per Cleo/Ada reference)
- Single color signature (= "Nora is talking")
- Motion signature (typing, state transitions, human handoff)
- 3–5 personality adjectives
- Nora-specific voice DO/DON'T (narrower than brand voice)

### Decision 4 — Photography Direction
- Real people, real settings. No stock families with clipboards.
- 5 persona scenarios mapped
- Diversity baseline: age, race, body type, geography (not all urban, not all suburban)
- Minimum 3 assets per persona for V1
- Treatment rules (color grading, crop, people vs. environment)

### Decision 5 — Voice Codification
- 10-line style guide covering 90% of copy decisions
- DO list: lead with situation · show number before ask · name limits · specific numbers · design for tired 3pm reader
- DON'T list: no insurance jargon uninline · no "AI" as feature · no cold chat · no unbacked savings · no stock smiles · no "free quote" language (scam signature per Signal Validation)
- Persona register overrides (BR-1 slower/warmer, SP-1 dense/no-BS, CL-1 document-forward, etc.)
- 10 example rewrites (before/after)

**Blocking dependency (added 2026-04-13):** Decision 5 can draft to 70% without Scott's sales logic doc, but locks at 100% only after plan inventory + qualifying language + Golden Ticket restriction copy is codified. Nora scripts carry the same dependency. Decisions 1–4 proceed independently.

---

## 8. Nora Pre-Fill Data Contract

The architectural lock that enables Nora to open with context, not a greeting. Every funnel must emit this object on handoff.

```json
{
  "entry_source": "f1|f2|f3|f4|f5|homepage-tile",
  "persona_id": "ru-1|sp-1|br-1|cl-1|pc-1",
  "quiz_data": { "/* persona-specific Q/A pairs */" },
  "card_scan_data": { "carrier": "", "plan_name": "", "premium": 0, "tier": "" },
  "sep_window_active": true,
  "sep_deadline_iso": "",
  "utm_funnel": "",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "golden_ticket_eligible": false,
  "state": "US-XX",
  "household_size": 0,
  "estimated_income_bucket": ""
}
```

**Rules:**
- Nora never opens with "Hi, how can I help?" — she opens with the pre-filled situation acknowledgment.
- If `golden_ticket_eligible: true`, Nora's first message must include the restriction language verbatim (Scott-sourced, pending).
- `sep_window_active` triggers deadline-countdown styling in the savings reveal card.
- Missing fields → Nora asks ONE question at a time to fill them. Never asks anything already pre-filled.

---

## 9. Analytics + Pre-Launch Gates

**Pre-launch gates (block ad spend):**
- OCR pipeline live, 10/10 test cards parsed
- Nora pre-fill contract implemented (schema above)
- Real subsidy data wired (no placeholders)
- Per-funnel UTMs + GA4 events separated
- Meta CAPI firing on card scan + quiz completion
- Golden Ticket restriction copy live in Nora
- All 8 components pass Brand Bible token audit
- Every artifact has a decision log entry in `decisions.md`

**KPI targets per variant (from Phase B Amendment):**
- Card scan completion: ≥ 45%
- Quiz start-to-finish: ≥ 60%
- Savings reveal → Nora handoff: ≥ 35%
- Nora handoff → agent booking / plan select: ≥ 18%

---

## 10. Signal Validation — Language Rules (synthesized)

From the Signal Validation Report and Week 2 execution doc. These are the voice rules Signal-tested against real consumer sentiment data (-0.74 to -0.40 per platform) and Meta ad performance.

### DO
- Lead with the **situation**, not the product. ("Your renewal went up $127." not "Save on insurance.")
- Show the **number before the ask**. Anchor first, CTA second.
- **Name limits inline**, not in footnotes. "This plan has a $4,000 deductible" not "See terms."
- Use **specific numbers**. "$2,748 average overpayment" beats "significant savings."
- Design for a **tired 3pm reader** who just got a letter in the mail.
- **Loss framing** outperforms gain framing 2:1 (confirmed Meta data). "What you're losing" beats "what you can save."
- Use **validated hooks** per persona (§2).
- Lead with **licensed agent credential** when target trusts humans > AI (BR-1).
- **AI trust is split** — disclose Nora is AI but emphasize the licensed human handoff.

### DON'T
- "**AI**" as a feature. Say what it does, not what it is.
- "**Free quote**" — scam signature per Signal data. Use "free check-up" only for diagnostic (F5), never pricing.
- **Cold chat openers.** Nora always opens with context.
- **Unbacked savings claims.** Every number sourced.
- **Stock family photography.** People without clipboards, or no people at all.
- **Insurance jargon uninline.** HMO/PPO/HDHP explained on first use or never used.
- **Urgency theater.** Red banners for non-urgent events erode trust.
- **"We're here to help"** language. Show, don't announce.

### Seven validated narratives (Signal-ranked)
1. Subsidy cliff ($62K line, Dec 31 2025 expiry)
2. Navigator void (90% funding cut)
3. Renewal shock ($127 avg bump, 92% affected)
4. Self-employed void (no HR to ask)
5. Pre-Medicare gap (hardest 5 years)
6. Plan literacy gap (nobody reads the document)
7. Card-scan magic (pre-fill as proof)

---

## 11. UX Swipe File — 15 Patterns We're Borrowing

Each pattern is sourced from a specific competitor teardown and mapped to a specific component or funnel. All 15 patterns live as annotated screenshots in Notion's UX Swipe File page.

**F-series — Funnel mechanics**
- **F1** One question per screen (Hims-pattern) → C4 Quiz Engine
- **F2** Pre-fill from upstream signal (card scan, UTM, quiz) → C6 Nora
- **F3** Anchor-number reveal (Zestimate moment) → C5 Savings Reveal
- **F4** Deadline counter without countdown theater → F1/F4 LPs
- **F5** Named-human handoff exit (Policygenius pattern) → C6 Nora final state

**T-series — Trust signals**
- **T1** Above-fold licensed-agent credential → C1 Trust Bar
- **T2** Inline limit disclosure with expandable source → C7 Limitation Disclosure
- **T3** Named testimonial with plan name (Lemonade pattern) → C8 Social Proof Strip
- **T4** State-by-state coverage claim with specific number → C1 Trust Bar
- **T5** Honest commission disclosure (Policygenius) → footer + Nora

**P-series — Page composition**
- **P1** Card-scan-as-hero (novel — no competitor does this) → F4 LP
- **P2** Tiles-dominant homepage (Hims condition LPs, Ro) → Homepage
- **P3** Quiz-as-hero (Hims, Ro GLP-1 page) → F1 LP option
- **P4** Editorial long-form with sidebar CTA (Wirecutter) → F2 LP (Reform/Dispatch directions)
- **P5** Dashboard-as-homepage (Linear, Ramp, Stripe) → Terminal/Operator directions only

**Q-series — Quiz specifics**
- **Q1** Slider for income (Zestimate-style) → F1 income step
- **Q2** Bucket-select for income (mobile-fast alternative) → F1 income step (F1-2 open question)
- **Q3** Yes/no branching that feels like a conversation (Noom pattern) → F1, F5
- **Q4** Progress bar with specific question count, not abstract % → all quizzes

**B-series — Brand expression**
- **B1** Named, illustrated AI agent (Cleo, Ada) → C6 Nora
- **B2** Concierge warmth for 55+ (Devoted) → F3 Bridge treatment
- **B3** Membership-card artifact for premium product (USAA, Amex) → Golden Ticket UI

---

## 12. Competitor Reference Library — 23 Teardowns

Each folder in `comp-library/` contains hero, below-fold, mobile, and quiz PNGs + `metadata.md`. Only the design lessons worth citing are listed here.

### Direct category competitors
- **Oscar Health** — owns warm coral + illustrations. Lesson: emotional warmth in health insurance works, but they bought it; we can't copy. Avoid coral.
- **Lemonade** — challenger coral/pink + illustration + plain-language disclosures. Lesson: illustration can replace stock photo without losing trust. Study their footer honesty.
- **Oscar's mobile quiz** — bucket income, not slider. Fastest completion in the category.
- **Policygenius** — AI + licensed hybrid (our closest analog). Lesson: how to show "AI opinion + human verify" without making users choose.
- **HealthMarkets** — aggressive phone-first. Counter-model: everything they do loudly, we do quietly (applies if Calm Hand wins).
- **Insurify** — quote-widget heavy. Counter-model: we never lead with a quote widget.

### Price-first / transparency analogs
- **GoodRx** — owns green + price transparency. Lesson: the Receipt direction pushes this further than they did; they're the floor, not the ceiling.
- **Ro** — price-first GLP-1 pages. Lesson: single-column narrative with inline pricing and disclosure. Directly influences F1 single-column quiz pattern.
- **Hims** — condition-LP pattern. The clearest template for our tile-dominant homepage + quiz-forward LPs.

### Concierge / trust analogs
- **Devoted Health** — owns concierge orange for 55+. Lesson: F3 Bridge must match this tone or lose to them. Avoid orange.
- **One Medical** — $99/yr membership premium. Lesson: membership as trust artifact (Club/Co-op directions).
- **Chime** — fintech trust via aggressive color + friendly illustration. Rarely a direct comp, but useful for mobile onboarding.

### AI / pattern analogs
- **Ada** — named AI in healthcare triage. Lesson: how to make an AI avatar feel clinical-competent without being cold.
- **Cleo** — named AI in finance. Lesson: personality adjectives, motion signature, humor without condescension.
- **Headspace** — warm AI-adjacent onboarding. Lesson: the first 30 seconds set the whole brand. Applies to Nora open.
- **Noom** — quiz-as-onboarding with emotional payoff. Lesson: Q3 pattern (yes/no branching as conversation).

### Adjacent categories (taste references, not direct comps)
- **Stride** — gig worker yellow. Counter-model — avoid yellow.
- **Ethos** — life insurance but closest to our "calm + data" whitespace.
- **Credit Karma** — free score as top-of-funnel. Direct influence on Score/Grade directions.
- **Rocket Mortgage** — Zestimate-style anchor reveal → directly copied to Savings Reveal Card.
- **TurboTax** — tax quiz mechanic. Lesson: "one scary thing at a time" pacing.
- **Wealthfront** — Calm Hand adjacent, data-forward. Taste reference for SP-1.
- **Root Insurance** — young-brand auto insurance. Not a comp; useful for Studio direction motion references.

### Non-insurance taste references (for brand directions)
- **Linear, Vercel, Arc Browser, Stripe Dashboard, Raycast, Figma, Warp, Ramp, Mercury, Pilot.com** — Terminal, Operator, Studio directions.
- **Patagonia, Oatly, Cash App, Bernie 2020, Moveon, early Mailchimp** — Protest, Reform, Co-op directions.
- **gov.uk, 18F, Bloomberg Terminal, Apple Health Records, NY Subway, USPS, Vignelli's Unimark** — Public Service direction.
- **Monocle, Apple, Mailchimp classic, Stripe, Pentagram** — Calm Hand direction.
- **McSweeney's, Field Notes, Moleskine, Sharpie, Ticonderoga** — Grade direction.
- **Boorum & Pease, Rockefeller ledger books, Pilot Custom fountain pens** — Ledger direction.
- **Wirecutter, NYT Cooking, Farmers' Almanac, Patagonia field guides** — Almanac direction.
- **ProPublica, NYT Magazine, New Yorker, The Markup, Bloomberg Businessweek, Kaiser Health News** — Dispatch direction.
- **NY Post, Drudge, The Sun UK, TMZ, WikiLeaks aesthetic, early Vice** — Headline direction.
- **Acid house flyers, Supreme, Liquid Death, Spotify, Gumroad, Cash App, early MTV** — Rave direction.
- **Spotify Wrapped, BeReal, Apple Health, Duolingo, Robinhood cards** — Score direction.
- **USAA, Costco, Amex Black/Centurion, Soho House, Liquid Death Country Club** — Club direction (redone as Co-op in 16).
- **REI, Vanguard, Patagonia, Park Slope Food Co-op, Credit Union Movement** — Co-op direction.
- **Figma marketing, Linear product pages, Framer, Arc Browser, Notion 2024, Craft, Are.na, Pentagram SaaS, early Stripe Press, Dropbox 2023, Character, Substack** — Studio direction.

---

## 13. Stitch Exports — Inventory

Thirty HTML screens generated and exported for the production workflow. Located at `front-end design/stitch-exports/`. Used as the structural source of truth before Brand Bible dressing.

**Structure & strategy:** 01 Cover · 02 Exec Summary · 03 System Architecture · 04b Current State · 05 Future State · 30 Build Plan

**Personas:** 06 Overview · 07 RU-1 · 08 SP-1 · 09 BR-1 · 10 CL-1 · 11 PC-1

**Funnels + homepage:** 12 Homepage Step 0 · 13 F1 · 14 F2 · 15 F3 · 16 F4 · 17 F5

**Components:** 18 Components Overview · 19 C2 Card Scan · 20 C3 Quiz Engine · 21 C4 Nora · 22 C5–C8

**Competitive + UX:** 23 Comp Funnel · 24 Comp Visual · 25 Comp AI Trust · 26 Comp Concierge · 27 Comp Card Scan · 28 UX Patterns · 29 Voice Guide

**Workflow rule:** Stitch output must include desktop + mobile, all states, annotated interactions. Exports to Figma for the merge step. No visual decisions made inside Stitch. No structural decisions made inside the Brand Bible.

---

## 14. Page Decisions — Locked

### Homepage
- Option A (Tiles-Dominant) confirmed
- 7-section stack locked
- Hero headline: "Every plan in your state. One number. Scan your card." (subject to direction-specific rewrite in voice pass)
- 4 of 5 tile labels locked; BR-1 tile pending H1

### F4 Cliff Letter LP (`/renewal`) — Priority 1A
- Card scan as hero (P1 pattern, novel in category)
- Direct-mail-with-QR is the primary inbound
- FAQ-lite 3 questions (pending draft — F4-4)
- Agent phone subdued in nav; not hero (CL-1 is not trust-anxious)

### F1 Subsidy Shock LP (`/lost-coverage`) — Priority 1B
- Quiz-forward hero (Hims P3 pattern)
- Screen 3 income input: bucket vs. slider unresolved (F1-2)
- Q1 self-employed branch likely redirects to F2 for attribution cleanliness (F1-3)
- Ad copy ↔ LP headline continuity blocked on ad draft (F1-4)

### F2 Navigator LP (`/freelancer`) — Priority 2
- Navigator-void hero ("90% funding cut") — Signal-validated
- Nora launch mode: modal vs. redirect (F2-1)
- Phone number treatment open (F2-3) — SP-1 is not BR-1

### F5 Check-Up LP (`/check-my-plan`) — Priority 4
- Free diagnostic framing (only place "free" is allowed per X1)
- Plan report card (or Coverage Score, per direction) as incentive
- Path A ("your plan is competitive") still open — F5-3

### F3 Bridge LP (`/pre-medicare`) — Gated
- **F3-1 Golden Ticket product fit** — blocks build
- **F3-2 Photography** — custom shoot required or launch blocker
- **F3-4 Agent phone infrastructure** — ops readiness before LP ships
- **F3-5 Quiz length** — 4 vs. 5 Q's, income deferred until post-scan option

---

## 15. Open Questions (as of 2026-04-18)

Seventeen UX decisions still open across funnels. Most are unblockable without Scott's sales logic doc or ad-copy draft. Tracked in `front-end design/open-questions.md`.

**Unblockable right now** (can decide without waiting):
- H1 — BR-1 tile label phrasing
- H2 — mobile sticky scan CTA placement (can A/B post-launch)
- F4-2 — "What happens next" placement
- X1 — "Free" language rule (F5 diagnostic only; banned elsewhere)

**Blocked on Scott sales logic (§8A of FE plan):**
- Plan inventory per state (44 states per April 15 meeting)
- Qualification criteria per persona
- Disqualification / handoff logic
- Pricing floors/ceilings so copy isn't lying
- Subsidy calculation post-2026 cliff
- Golden Ticket rules + verbatim restriction language
- Agent handoff triggers

**Blocked on Brand Bible direction lock:**
- Decision 5 (voice) cannot fully lock
- Nora scripts cannot finalize
- Color/type/photography tokens

**Blocked on ops:**
- F3-2 custom shoot
- F3-4 staffed agent phone
- X2 real carrier logos (licensing)

---

## 16. Meeting Notes — Load-Bearing Decisions

### April 15, 2026 — Team Update
- **44 states confirmed** for plan coverage claim (Trust Bar lock)
- **Steady** confirmed as card scan OCR partner
- Plan hierarchy codified: Health Protector Guard → Premier 5,000 (= Golden Ticket subcategory, medically underwritten)
- 10 of 20 brand treatments reviewed live; **Receipt (02) is current team favorite** but not locked
- Next review: pick direction, start Brand Bible Decisions 1–4

### April 8, 2026 — Strategic Planning
- **Golden Ticket qualification** finalized as a subcategory of Health Protector Guard (Premier 5,000), medically underwritten
- **3 primary personas** prioritized for V1 (RU-1, SP-1, CL-1); BR-1 gated on GT; PC-1 secondary for V1 volume
- **Data monetization** strategy surfaced (member-data advocacy) — informs Co-op direction viability
- **$500K fundraising** target discussed
- **Soft May 1 launch** target — drives 3-week sprint

### April 13, 2026 — Brief revision
- Added §8 (Scott sales logic) + §8B (copy deck) + §8C (open questions walkthrough) as blocking dependencies
- Reframed build discipline around copy deck readiness, not wireframe readiness

---

## 17. Behavioral Rationale Stack

Why each core mechanic earns its place. Keep this when tempted to cut for speed.

- **Card scan as hero (F4)** — direct-mail QR is our highest-intent inbound. Scanning the thing they just got is the lowest-friction first act.
- **One question per screen (F1)** — Hims + Ro + Noom all converge on this. Cognitive load = drop-off.
- **Anchor number before CTA** — Zestimate moment. Dopamine beat locks engagement before the ask.
- **Loss framing 2:1 over gain** — Meta CAPI data confirms. "What you're losing" outperforms "what you save."
- **Named agent above fold** — T1. Highest-ROI trust signal for BR-1, second-highest for RU-1.
- **Inline limit disclosure** — T2. Trust compounds per disclosure shown, not per disclosure hidden.
- **Nora as closer, not opener** — Policygenius/F5 pattern. AI trust is highest when AI is framed as a pre-screener for a human, not a replacement.
- **Tile-dominant homepage (A)** — self-segmentation without reading copy. 5 personas → 5 tiles → 5 funnels.
- **Persona-register voice** — BR-1 and SP-1 require inverse treatments. A single voice loses both.
- **Free diagnostic framing only for F5** — "free quote" = scam signature per Signal data.

---

## 18. Scope Discipline — What We Are Not Doing

- No hand-drawn wireframes. Stitch only.
- No visual polish inside Stitch. Structure only.
- No A/B design variants pre-launch. Ship the locked direction.
- No mobile-as-afterthought. Every Stitch prompt includes mobile.
- No Nora redesign from scratch. Use existing backend; change entry + pre-fill only.
- No component built without a Stitch source artifact.
- No token added without a Stitch artifact using it.
- No new personas before launch.
- No brand blending. One direction wins.
- No decisions made without a reference from the competitive library.
- No page ships without a decision-log entry.

---

## 19. Three-Week Calendar

**Week 1 — Components.** Stitch: Trust Bar, Step 0 Tiles, Card Scan Module, Homepage layout. Brand Bible: lock all 5 decisions (blocking). Dress + build: Trust Bar, Step 0 Tiles, Card Scan Module.

**Week 2 — Engine.** Stitch: Quiz Engine, Savings Reveal, Nora Interface, Limitation Disclosure, Social Proof. Dress + build all. Homepage assembly (Option A). Analytics scaffold (UTMs, GA4, Meta CAPI).

**Week 3 — Assemble & launch.** Stitch: F4 LP, F1 LP. Dress + build. QA pass. Pre-launch gate check (§9). Launch EOW.

---

## 20. Reference Index — What to cite from where

| When you need… | Go to |
|---|---|
| A persona's emotion, hook, or trust trigger | §2 + Notion Brand & FE Decision Brief §4 |
| A funnel's mechanic and priority | §3 + `front-end design/project.md` §3 |
| A component spec | §5 + FE Architecture Brief §4 + Stitch exports 18–22 |
| A page decision or open question | §14–15 + `open-questions.md` |
| A language rule | §10 + Signal Validation Report |
| A visual reference | §12 + `comp-library/*/metadata.md` + UX Swipe File Notion page |
| A brand direction to cite or reject | §6 + `brand bible/directions/*.md` |
| The Nora handoff contract | §8 + FE Architecture Brief §10 |
| A KPI target | §9 + Phase B Amendment |
| A meeting-level decision | §16 + Notion Meeting Notes page `33c26136-b372-8045-be53-fff20b4fc565` |
| A workflow rule (Stitch → Brand Bible → build) | §13 + `front-end design/project.md` §3 + `brand bible/project.md` §4 |
| A launch gate | §9 + FE project §7 |

---

## 21. Single-line summary for future sessions

> ShopHealthcare is a confident-approachable insurance-shopping brand with 5 personas, 5 funnels, 8 shared components, a card-scan hero mechanic, a pre-filled Nora AI closer, and an unlocked brand direction (current favorite Receipt) — building Stitch-first to a May 1 launch of F4 Cliff Letter + F1 Subsidy Shock, gated on Scott's sales logic and the Brand Bible's 5 decisions.
