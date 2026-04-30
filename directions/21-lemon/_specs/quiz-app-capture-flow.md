# Quiz / App / Contact Capture Flow

**Version:** V20+ build spec
**Last updated:** 2026-04-29
**Source:** Weekly Sync 2026-04-29 + same-day strategy session
**Status:** Authoritative for V20+ work

> Build-spec for the V20+ user journey from homepage tile click through carrier checkout. Wires together persona context, quiz, value reveal, Nora app, card scan, email capture, and post-purchase. Single source of truth for Davide + Eugenio on data contract + copy.

## Cross-references
- [Design Decisions — V19→V20 (2026-04-29 Sync)](https://app.notion.com/p/35126136b372816599dfd00a939ff88d)
- [Brand & FE Decision Brief §10](https://app.notion.com/p/33d26136b3728140ba2ef19d7968d71a)
- [Meeting Notes 2026-04-29](https://app.notion.com/p/33c26136b3728045be53fff20b4fc565)
- ShopHealthcare brand-voice skill (`~/.claude/skills/shophealthcare-voice/`)
- `front-end design/scott-sales-logic.md`
- `front-end design/Copy Bible/`

---

## Core principles (read first)

1. **Show the number free.** No email gate before the user sees a believable estimate. Zillow Zestimate model.
2. **Persona context flows everywhere.** The tile click is the first emotional declaration. It colors every downstream string — quiz copy, dashboard reveal, Nora's opener, the email carrot.
3. **Email = account, not gate.** Captured inside Nora during the "while I finish your quote" moment, framed as the protection of value already shown.
4. **Card scan is a delta tool.** It only matters when there's a current plan to compare against. Persona-conditional.
5. **Compliance non-negotiables.** Cannot misrepresent the policy. Sales steers user to see the right number; framing stays honest. *"No follow-up unless you ask."*

---

## 1. Persona context contract

The 6 tiles aren't routing labels — they're emotional declarations. Each tile click sets a **persona context object** that is passed through to every downstream surface and pulled by Nora to color her language.

### URL param schema (5 chars)

```
?p=SP1&s=TX&a=35&x=M&pg=0
   │     │    │   │   └─ pregnancy 0/1
   │     │    │   └─ sex M/F
   │     │    └─ age (int)
   │     └─ state (2-char)
   └─ persona tile code (RU1/SP1/BR1/CL1/PC1/GEN)
```

Strings are NOT passed in the URL. Both quiz UI and Nora read from `persona-strings.json` keyed by code.

### `persona-strings.json` schema

```json
{
  "RU1": {
    "label": "Just lost my insurance",
    "reinforce": "You just got hit. The system failed you. We can have you covered by your start date — most people don't realize that's possible.",
    "noraOpener": "Let's get you back on coverage fast. Plan 01 can be active in 24 hours.",
    "dashboardHeadline": "Coverage in 24 hours.",
    "comparisonAnchor": "what your monthly premium will be once you're back on coverage",
    "hasCurrentCoverage": false,
    "cardScanRelevance": "none"
  },
  "SP1": {
    "label": "I'm self-employed / 1099",
    "reinforce": "You're 1099 — and most freelancers don't realize Plan 01 exists. It was built for self-employed people with irregular income. ACA wasn't.",
    "noraOpener": "37% of self-employed people in your bracket save the most on Plan 01. Let me show you what that looks like for you.",
    "dashboardHeadline": "Built for irregular income.",
    "comparisonAnchor": "what most freelancers pay on the open market",
    "hasCurrentCoverage": "maybe",
    "cardScanRelevance": "optional"
  },
  "BR1": {
    "label": "Pre-Medicare 55–64",
    "reinforce": "You're in the longest, most expensive insurance gap of your life. Plan 01 was designed for exactly this window.",
    "noraOpener": "5+ years from Medicare is the costliest stretch. Let's bridge it without the ACA cliff.",
    "dashboardHeadline": "Bridge to Medicare.",
    "comparisonAnchor": "what you'd pay for ACA bridge coverage until Medicare",
    "hasCurrentCoverage": "usually",
    "cardScanRelevance": "optional"
  },
  "CL1": {
    "label": "My premium just spiked",
    "reinforce": "Your renewal letter is real. Most renewals jumped 26–114%. Plan 01 sits 50–60% under what you're being asked to pay now.",
    "noraOpener": "Let me see your current premium and show you the actual delta.",
    "dashboardHeadline": "Your renewal vs. Plan 01.",
    "comparisonAnchor": "your renewal premium — the one that just spiked",
    "hasCurrentCoverage": true,
    "cardScanRelevance": "critical"
  },
  "PC1": {
    "label": "Check if I'm overpaying",
    "reinforce": "Most people are. About 6 in 10 we check are paying for things they'll never use.",
    "noraOpener": "Worst case: your plan's fine and you saved 60 seconds. Let me run the check.",
    "dashboardHeadline": "Plan diagnostic.",
    "comparisonAnchor": "whether your current plan is the best deal in your state",
    "hasCurrentCoverage": true,
    "cardScanRelevance": "critical"
  },
  "GEN": {
    "label": "Not sure — help me",
    "reinforce": "Most common answer we get. Most people have no idea what they're actually paying for.",
    "noraOpener": "Let me ask 3 things and tell you which path makes sense.",
    "dashboardHeadline": "Routing your numbers...",
    "comparisonAnchor": "the typical premium for someone in your situation",
    "hasCurrentCoverage": "unknown",
    "cardScanRelevance": "ask"
  }
}
```

This file is the canonical contract. Both the homepage quiz UI and the Nora app read from it. One source of truth, six rows. Edit copy here, propagates everywhere.

---

## 2. The quiz (V20)

### Goal
Mindset framing + Boolean payload generation. NOT data collection. The recommendation engine needs few inputs; the quiz's value is emotional ramp + self-segmentation + payload to pre-fill Nora.

### Screens

**S0 — Persona self-select** *(already built, unchanged)*
- 6 tiles laid out as a switchboard (V19 has it)
- Click sets `p=` URL param

**S1 — State**
- 50-state grid + dropdown fallback (already built in V11)
- **Hard exit**: states where Plan 01 isn't licensed → soft waitlist:
  > *"Not yet in your state. Want us to email you when we are?"* (the only legitimate email ask in the quiz)

**S2 — Age**
- Single number input + slider
- **Hard exits**:
  - Under 18 → *"Plan 01 is built for ages 18–65. We can still help — let me show you Plan 02."*
  - Over 65 → *"You're eligible for Medicare. We don't compete with that — go get the better deal."*
  - DE residents over 60 → DE-specific exit copy (Delaware caps Plan 01 at 60)

**S3 — Sex**
- M / F. Two large tappable cards.
- Rate-relevant in most states. Pregnancy-eligibility relevant.

**S4 — Pregnancy?** *(recommended; resolves S8)*
- Yes / No / Not sure
- If **Yes** or **Not sure** → routed to Plan 02 Catalog estimate, not Plan 01. Avoids any false-promise on Plan 01.

### What we deliberately do NOT ask in the quiz
- ❌ Income (irrelevant — we route away from ACA)
- ❌ Pre-existing conditions (Nora handles in discovery — too sensitive for cold quiz)
- ❌ Tobacco use (Nora handles)
- ❌ Name / DOB / ZIP (Nora handles in discovery for binding info)
- ❌ Email (NEVER in the quiz)

### Total time
30–45 seconds. 3 screens minimum (S1–S3), 4 recommended (S1–S4).

---

## 3. Value reveal — quiz-end mini dashboard

### Decision
Reveal happens **at the end of the quiz, before Nora opens.** No email gate.

### Why
- Zillow Zestimate effect — anchoring carries the user through every subsequent step
- 2026 climate forbids upfront-email-gates (subsidy-cliff anger + scam-ad flood = trust killer)
- If we wait until inside Nora, the user has to commit ~3 minutes before seeing any value — drops conversion at the highest-friction handoff

### Mockup — SP1 variant

```
┌──────────────────────────────────────────────┐
│                                              │
│  You're 1099 — good news.                    │
│                                              │
│  Most freelancers don't know Plan 01 exists. │
│  It was built specifically for self-employed │
│  people with irregular income.               │
│                                              │
│  ─────────────────────────────────────       │
│                                              │
│   You could pay around                       │
│                                              │
│       $290/month                             │
│       ━━━━━━━━━━━━                           │
│                                              │
│   A typical PPO in Texas runs ~$890/mo.      │
│   You'd save ~$600/mo · ~$7,200/yr.          │
│                                              │
│   This is an estimate.                       │
│   Nora refines it in 60 seconds.             │
│                                              │
│  [ Show me the real number → ]               │
│                                              │
└──────────────────────────────────────────────┘
```

### Mockup — CL1 variant (different anchor)

```
Your renewal letter wasn't a mistake.
Most are jumping 26–114% this year.

Your renewal:        $890/mo
Plan 01 estimate:    $290/mo
                     ━━━━━━━━
You'd save:          $600/mo · $7,200/yr

Nora will get the exact number in 60 seconds.

[ See my real plan → ]
```

CL1 anchors the comparison to *their* renewal premium (which they're emotionally angry about), not a generic average. Highest-converting variant.

### Per-persona dashboard headline (from `persona-strings.json` `dashboardHeadline`)

| Persona | Headline |
|---|---|
| RU1 | Coverage in 24 hours. ~$X/mo. |
| SP1 | Built for irregular income. ~$X/mo. |
| BR1 | Bridge to Medicare. ~$X/mo · ~$Y/yr saved. |
| CL1 | Your renewal: $X. Plan 01: $Y. Save $Z. |
| PC1 | Plan diagnostic. Likely savings: ~$X. |
| GEN | Routing your numbers... |

### Copy compliance
- *"around"*, *"~"*, *"about"* never lock a number we can't honor
- *"Estimate"* + *"Nora refines"* manage the gap to real quote
- CTA names what they get (their plan), not what we collect

---

## 4. Nora app (V21)

### Architecture
- **Dedicated web app, not a chat widget.**
- **Same repo as homepage.** **React.js.**
- **UI/CSS re-skin only** — Nora backend untouched.
- Feels embedded because it shares V19 design tokens.

### Three-zone layout

```
┌────────────┬───────────────────┬──────────────┐
│            │                   │              │
│   NORA     │     DASHBOARD     │    REPORT    │
│   CHAT     │                   │    DRAWER    │
│            │   • Savings $$    │              │
│  Nora's    │   • Plan summary  │  Empty until │
│  opener    │   • Key facts     │  Nora has    │
│  echoes    │                   │  finalized   │
│  estimate  │   Estimate locked │  the plan    │
│            │   as anchor       │              │
│            │                   │              │
└────────────┴───────────────────┴──────────────┘
```

Mobile: collapses to single column with drawer accordion.

### Persona-tagged opener
Nora reads `p=` from URL params and pulls `noraOpener` from `persona-strings.json`. First message Nora sends:

> *"I see [state, age, sex]. [noraOpener for that persona]."*

Example for SP1, TX, 35, M:
> *"I see Texas, 35, male. 37% of self-employed people in your bracket save the most on Plan 01. Let me ask 4 quick questions to lock it in."*

Never opens cold. Always echoes the context.

### Discovery flow (Stage 1 of Scott's 3-stage)

In Nora chat, sequentially:
1. Name
2. ZIP (refines state)
3. DOB (refines age)
4. Pre-existing condition flags (2–3 yes/no)
5. Plan start date
6. **Card scan offer** if `hasCurrentCoverage = true|maybe` and not already scanned (see §5)

**Account creation gate** sits between discovery and plan presentation. Email captured here (see §6).

---

## 5. Card scan placement

### Strategic frame
Card scan only delivers value when there's a current plan to compare against. Partition by persona:

| Persona | Has current coverage | Card scan value |
|---|---|---|
| RU1 | ❌ | Zero. Don't ask. |
| SP1 | Maybe | Optional |
| BR1 | Usually | Optional |
| CL1 | ✅ Always | **Critical** |
| PC1 | ✅ Always | **Critical** |
| GEN | Unknown | Conditional |

### Recommendation — Two placements (Option C + Option B)

**Placement 1 — Homepage entry branching (Option C)**
When user clicks **CL1** or **PC1** tile, the next screen is a forking decision:

```
You're in the right place. Two ways to do this:

[ 📷 Scan your card (60 sec) — most accurate ]
[ ✍️  Answer 3 questions (45 sec) — works without your card ]
```

CL1 has the renewal letter on the table. PC1 came specifically to check their plan. Card scan IS the fastest path for these two personas. The other 4 tiles route directly to the standard quiz.

**Placement 2 — Inside Nora discovery (Option B)**
For any user who didn't card-scan upfront but Nora detects they have current coverage from the conversation, Nora offers the shortcut:

> *"Got your card handy? Snap it and I'll fill in your current plan automatically — saves us 4 questions."*

Catches SP1 / BR1 users who didn't expect to scan but realize it's faster.

### Card scan UI requirements

- Pre-scan transparency: *"We don't store your card image. We read: insurance company name, plan type, member ID."*
- Camera-active state with live frame guides
- Processing animation: *"Reading your plan... checking 2026 rates... finding the comparison..."* — communicates scope, builds anticipation
- Error state: graceful fallback to typing
- Manual-edit fallback after scan if OCR misses anything

### Why card scan amplifies the email carrot dramatically

| Without card scan | With card scan |
|---|---|
| *"Plan 01 ~$290 vs typical PPO ~$890"* | *"Plan 01 $290 vs YOUR Aetna Bronze HMO $743 — your deductible is $7K vs Plan 01's $X — your prescription tier doesn't cover [drug]"* |
| Generic anchor | Hyper-specific. Their actual plan, line by line. |

The carrot only becomes truly tantalizing when card scan has fed real data into it. **This is the unlock for the highest-converting email gate.**

For users who don't card-scan, the carrot still works (peer-benchmark comparison) — just not as devastatingly.

---

## 6. Email gate — the carrot stack (V21)

### When it triggers
Inside Nora chat, after discovery is complete and Nora is "finalizing" the real quote. The user has invested 2–3 minutes and is emotionally committed to seeing the real number.

### The three-layer carrot stack (escalating order)

**1. Tangible artifact (primary pull)**
*"While I finish your real quote, give me your email and I'll prepare a full plan-vs-plan breakdown — line by line, exactly what you'd save over [persona-specific anchor]."*

**2. Loss aversion (secondary)**
*"You'll also get the rate locked for 30 days so you can think it over."*

**3. Utility / FOMO (tertiary)**
*"And I'll text you the day before your enrollment window closes so you don't miss it."*

### Full gate copy (in-chat, persona-tagged)

For an SP1 user:

> **Nora**
> Quick thing while I finish.
>
> Give me your email and I'll prepare your full plan-vs-plan breakdown. It'll show you exactly what you'd save over what most freelancers pay on the open market — line by line.
>
> Plus I'll lock this rate for 30 days, and text you before your enrollment window closes so you don't miss it.
>
> No follow-up unless you ask.
>
> ┌──────────────────────────────┐
> │  📧  email                   │
> └──────────────────────────────┘
> ┌──────────────────────────────┐
> │  📱  phone (optional)        │
> └──────────────────────────────┘
> [ Continue → ]
>
> *Skip and just show me the plan*

### Per-persona comparison anchor (the carrot's "what you'd save over")

Pulled from `persona-strings.json` `comparisonAnchor`:

| Persona | "Exactly what you'd save over..." |
|---|---|
| RU1 | *"...what your monthly premium will be once you're back on coverage."* (no comparison — they had nothing) |
| SP1 | *"...what most freelancers pay on the open market."* |
| BR1 | *"...what you'd pay for ACA bridge coverage until Medicare."* |
| CL1 | *"...your renewal premium — the one that just spiked."* ← strongest |
| PC1 | *"...whether your current plan is the best deal in your state."* |
| GEN | *"...the typical premium for someone in your situation."* |

CL1 should convert highest at this gate — comparison is to a number they're emotionally angry about.

### Why "while I finish" is the move
- Positions email as something Nora *needs* to do her work, not something we're collecting
- The user feels they're enabling, not paying
- Time pressure is implicit (Nora is mid-task) without being dishonest
- Frames Nora as performing an active service for them

### Skip-for-now treatment
**Visible link**: *"Skip and just show me the plan"*
- They see the plan presentation without account creation
- Save / share / forward features are locked behind email
- Counterintuitive but it's the trust move — every comp that does this (Wealthfront, Ethos, Stride) sees *higher* conversion on the gate. Users who *can* skip but choose not to are more invested.

### Microcopy stack at the gate
- *"Email = your account. Not a list."*
- *"No follow-up unless you ask."*
- *"We never sell your data. Ever."*
- Visible "Skip for now" link

### What we explicitly don't do
- ❌ Email field anywhere on the homepage hero
- ❌ Email field in the quiz
- ❌ Email field on the quiz-end mini dashboard
- ❌ "Get a free quote" framing (banned per §C2)
- ❌ Hidden cost / dark-pattern unsubscribes
- ❌ SMS marketing without explicit opt-in (kept skippable)

### Account creation mechanics
- **Magic link** (passwordless) recommended for first-time. Lower friction, modern, fits the "we don't want to be your bank" tone.
- Phone number optional, default off, used only for SMS reminders if opted in.
- Password optional later (account upgrade path).

---

## 7. Plan presentation + post-purchase

### After email gate passes
- Real Nora-quoted price replaces the estimate in the dashboard
- Right drawer fills:
  - Full plan summary
  - Fine print
  - Comparison report (with card-scan delta if available)
  - Save / forward / share actions
- Email goes out with the personalized plan-vs-plan PDF breakdown

### Carrier checkout (Quoted)
- Carrier-side flow. Minimal design control on our end — style + routing only.
- Pre-fill all fields we have (name, DOB, ZIP, etc.) from Nora.

### Post-purchase
- **Spotify-Wrapped style share asset** unlocks: *"I just saved $5,000 — send to your wife."*
- Format: TBD between PNG / PDF / link. (Open question S12.)
- Drives viral loop + spouse/family co-decision moment.
- Asset includes: savings number, persona-flavored copy, share-back link with attribution.

---

## 8. Full flow

```
HOMEPAGE
  Hero · Carrier band · Bento · Two Paths · Decode · etc.
  CTA: "Run the 90-second check"
  ↓
PERSONA TILE CLICK (S0)
  6 tiles → sets persona context object (URL p= param)
  ↓
  ├── If CL1 or PC1 → branching screen:
  │     [ 📷 Scan card (60s, most accurate) ]
  │     [ ✍️  3 questions (45s, no card needed) ]
  │
  └── If RU1, SP1, BR1, GEN → straight to quiz
  ↓
QUIZ — state, age, sex, pregnancy (3-4 screens)
  Hard-exits for non-served states / age / pregnancy → Catalog
  ↓
QUIZ-END MINI DASHBOARD (persona-tagged)
  Reinforcing copy + estimated number + per-persona anchor
  CTA: "See my real plan with Nora →"
  NO email gate
  ↓
NORA APP OPENS (three-zone, V19-skinned)
  Left: Nora chat — persona-tagged opener echoes estimate
  Middle: dashboard with estimate locked as anchor
  Right: empty drawer skeleton
  ↓
NORA DISCOVERY (in chat)
  Name → ZIP → DOB → conditions → start date
  + card scan offer if hasCurrentCoverage = true|maybe
  ↓
EMAIL GATE — "while I finish your quote..."
  Tangible carrot: personalized comparison report
  Loss aversion: 30-day rate lock
  Utility: enrollment window text reminder
  Visible skip-for-now link
  Microcopy: "No follow-up unless you ask."
  ↓
PLAN PRESENTATION
  Real Nora quote replaces estimate in dashboard
  Right drawer fills: full plan, fine print, comparison report
  Email sent: personalized plan-vs-plan PDF breakdown
  ↓
QUOTED (carrier checkout)
  ↓
POST-PURCHASE
  Spotify-Wrapped share asset unlocks
  Save / share / forward to spouse
```

---

## 9. Build sequencing

### V20 (next 1–2 weeks)
- Quiz upgrade: 3-4 screens (state, age, sex, +pregnancy)
- `persona-strings.json` config file (6 entries written)
- Quiz-end mini-dashboard component (6 persona variants)
- URL param contract finalized with Eugenio
- Persona-tagged Nora opener (Eugenio reads from same config)
- Homepage V20 visual tweaks (hero chat box gradient · carrier band moved · 50-states placeholder)

### V21
- Three-zone Nora app layout (chat-left / dashboard-middle / report-drawer-right)
- Email gate with full carrot stack inside Nora chat
- Card scan inside Nora discovery (Placement 2)
- Magic-link account creation
- 30-day rate-lock backend (with Eugenio)
- Personalized comparison report PDF generation

### V22
- Card scan on homepage entry for CL1/PC1 (Placement 1)
- Spotify-Wrapped share asset (post-purchase)
- Phone-number opt-in SMS reminders
- Save / forward / share UI in right drawer

This sequencing keeps each version shippable + testable in isolation.

---

## 10. Open questions

### Resolved by this doc
- **S8** Pregnancy/intent routing UI → **resolved**: ask in quiz S4, route Plan 01 vs Catalog before any false-promise.
- **S10** Lead-capture timing → **resolved**: estimate visible at quiz end (no gate), email gate at Nora "while I finish" moment.

### Still open
- **S9** "Upgrade anytime" wording satisfying no-misrepresentation rule — Scott sign-off needed before homepage copy lock.
- **S11** Re-skin scope: Nora chat container only, or full quoting view (Plan presentation + Quoted)?
- **S12** Spotify-Wrapped share asset format: PNG / PDF / link? Tracking? Attribution back to viral referrer?

### New (raised by this doc)
- **S13** Card scan branching UX on homepage for CL1/PC1 — should the branch be a full screen or an inline secondary CTA on the persona tile click?
- **S14** Magic-link vs password-first for account creation — which converts better in our cohort?
- **S15** Plan-vs-plan comparison PDF: who generates it (frontend / backend / Nora-side)? What template? Branding?
- **S16** Skip-for-now: does skipping show only the plan summary or the full breakdown? (Recommend: summary only; full breakdown gated behind email.)

---

## Authoritative-decisions log (this session)

1. **Persona context wired through everything** via `persona-strings.json` + URL params.
2. **Quiz = state + age + sex + pregnancy.** No email, no income, no conditions, no name.
3. **Value reveal = quiz-end mini dashboard.** No email gate. Persona-tagged copy.
4. **Email gate = inside Nora "while I finish your quote."** Three-layer carrot stack: comparison report → rate lock → window reminder.
5. **Card scan = persona-conditional.** Homepage branching for CL1/PC1; in-Nora offer for SP1/BR1/GEN with detected current coverage; never asked of RU1.
6. **Account creation = magic link** (passwordless), not password-first. Phone optional.
7. **Skip-for-now visible at email gate.** Trust move.
8. **Compliance**: every estimate copy uses *"around"*, *"~"*, *"about"*. *"Estimate; Nora refines"* always present. *"No follow-up unless you ask"* surfaced at gate.
