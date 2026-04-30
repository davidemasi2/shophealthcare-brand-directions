# Nora App — Comprehensive Design Brief

**Document type:** Build-ready design brief for Claude Design (or any design partner) to construct the post-quiz Nora web app.
**Version:** v1.0
**Date:** 2026-04-29
**Owner:** Davide De Masi (handoff to design partner)
**Status:** Authoritative — single source of truth for the Nora app build

---

## 0. How to read this brief

This brief is structured as a build spec. Every section either defines a **decision** (locked) or a **TBD** (called out explicitly). Designers should treat decisions as constraints and TBDs as inputs that need an answer before the section can be built.

The Nora app is the post-quiz experience. It begins when a user clicks "See my real plan with Nora →" on the V20 homepage quiz-end mini dashboard. It ends when the user is handed off to the carrier-side checkout (Quoted).

**Out of scope for V21 (this build):**
- The V20 homepage (already shipped — `homepage-v20-persona-quiz.html`)
- The carrier checkout (Quoted) — minimal styling/routing only
- Spotify-Wrapped post-purchase share asset (V22)

**In scope for V21:**
- Three-zone web app layout (chat / dashboard / drawer)
- Persona-tagged Nora opener
- In-chat discovery flow (5 questions)
- In-chat card-scan offer (persona-conditional)
- Email gate with three-layer carrot
- Plan presentation in dashboard
- Right drawer fills with plan + comparison report
- Mobile responsive

---

## 1. Brand foundation

### 1.1 Design system inputs

**Visual identity:** ShopHealthcare V19 SHC-Match palette ("Lemon" direction, canonical 2026-04-29).

**Palette tokens (CSS variables):**
```css
--ink: #0E2A3A;            /* primary text + outlines */
--cream: #FFFAEA;          /* primary background */
--lemon: #FFE86E;          /* accent — primary highlight color */
--blush: #FFE4DB;          /* secondary accent — softer */
--pink: #FF6A5C;           /* CTA + emphasis */
--pink-dark: #C84B3F;      /* hover/pressed CTA */
--mute: rgba(14,42,58,0.62); /* muted text */
```

**Type:**
- Display / H1 / H2 / H3: **Fraunces** (serif, weights 400/500/600)
- Body: **Inter** (sans, 400/500/600)
- Mono / eyebrow / metadata: **JetBrains Mono** (700 weight, all-caps, letter-spacing .14em)

**Motion language:**
- Standard transition: `cubic-bezier(.22,.61,.36,1)` at 0.9s for state changes
- Hover/click feedback: 0.15s ease
- Reveal animations: `IntersectionObserver`-triggered, `prefers-reduced-motion` gated
- Hard 3D ink shadows: `4px 4px 0 var(--ink)` on rest, `6px 6px 0 var(--ink)` on hover, with `translate(-2px, -2px)`

**Existing assets:**
- `lemon.css` (shared stylesheet — extends, don't override)
- `palette-switch.js` (palette dropdown — keep available in dev mode)
- Carrier SVG logos at `assets/carriers/{uhc,bcbs,cigna,aetna,humana}.svg`

### 1.2 Voice principles

Voice rules are codified in the **ShopHealthcare brand-voice skill** at `~/.claude/skills/shophealthcare-voice/`. Apply automatically.

Key rules to enforce:
- Never say "free" customer-facing
- Never imply ACA / Medicare / government coverage
- Use "around", "~", "about" on all estimates (compliance: cannot misrepresent)
- "No follow-up unless you ask." — surfaced at every email-related moment
- "Estimate; Nora refines" — present whenever an estimate is shown before the real quote

---

## 2. The persona context contract (CRITICAL)

This is the foundation everything else builds on. Read this first.

### 2.1 URL params (the handoff)

The V20 homepage quiz hands off to the Nora app via URL params:

```
https://shophealthcare.io/?p=SP1&s=TX&a=35&x=M&pg=0&c=none
                            │     │    │    │   │     │
                            │     │    │    │   │     └─ conditions: none|managed|utilization|pregnancy
                            │     │    │    │   └─ pregnancy: 0 (no) | 1 (yes/maybe)
                            │     │    │    └─ sex: M | F
                            │     │    └─ age: integer 18–65
                            │     └─ state: 2-char code (50 states)
                            └─ persona: RU1 | SP1 | BR1 | CL1 | PC1 | GEN
```

The Nora app MUST parse these on load. Missing params should fall back gracefully (default to `GEN` persona).

### 2.2 `persona-strings.json` — the canonical config

Both the V20 homepage AND the Nora app read from this file. Designers must reference this for ALL persona-tagged copy.

```json
{
  "RU1": {
    "label": "Just lost insurance",
    "noraOpener": "Let's get you back on coverage fast. Plan 01 can be active in 24 hours.",
    "reinforce": "You just got hit. The system failed you. We can have you covered by your start date.",
    "dashboardHeadline": "Coverage in 24 hours.",
    "comparisonAnchor": "what your monthly premium will be once you're back on coverage",
    "hasCurrentCoverage": false,
    "cardScanRelevance": "none"
  },
  "SP1": {
    "label": "Self-employed / 1099",
    "noraOpener": "37% of self-employed people in your bracket save the most on Plan 01. Let me show you what that looks like for you.",
    "reinforce": "You're 1099 — and most freelancers don't realize Plan 01 exists. It was built for self-employed people with irregular income. ACA wasn't.",
    "dashboardHeadline": "Built for irregular income.",
    "comparisonAnchor": "what most freelancers pay on the open market",
    "hasCurrentCoverage": "maybe",
    "cardScanRelevance": "optional"
  },
  "BR1": {
    "label": "Pre-Medicare 55–64",
    "noraOpener": "5+ years from Medicare is the costliest stretch. Let's bridge it without the ACA cliff.",
    "reinforce": "You're in the longest, most expensive insurance gap of your life. Plan 01 was designed for exactly this window.",
    "dashboardHeadline": "Bridge to Medicare.",
    "comparisonAnchor": "what you'd pay for ACA bridge coverage until Medicare",
    "hasCurrentCoverage": "usually",
    "cardScanRelevance": "optional"
  },
  "CL1": {
    "label": "My premium just spiked",
    "noraOpener": "Let me see your current premium and show you the actual delta.",
    "reinforce": "Your renewal letter is real. Most renewals jumped 26–114%. Plan 01 sits 50–60% under what you're being asked to pay now.",
    "dashboardHeadline": "Your renewal vs. Plan 01.",
    "comparisonAnchor": "your renewal premium — the one that just spiked",
    "hasCurrentCoverage": true,
    "cardScanRelevance": "critical"
  },
  "PC1": {
    "label": "Check if I'm overpaying",
    "noraOpener": "Worst case: your plan's fine and you saved 60 seconds. Let me run the check.",
    "reinforce": "Most people are. About 6 in 10 we check are paying for things they'll never use.",
    "dashboardHeadline": "Plan diagnostic.",
    "comparisonAnchor": "whether your current plan is the best deal in your state",
    "hasCurrentCoverage": true,
    "cardScanRelevance": "critical"
  },
  "GEN": {
    "label": "Not sure",
    "noraOpener": "Let me ask 3 things and tell you which path makes sense.",
    "reinforce": "Most common answer we get. Most people have no idea what they're actually paying for.",
    "dashboardHeadline": "Routing your numbers.",
    "comparisonAnchor": "the typical premium for someone in your situation",
    "hasCurrentCoverage": "unknown",
    "cardScanRelevance": "ask"
  }
}
```

**Rule:** If you find yourself writing persona-specific copy anywhere in the app, it MUST go in this file. One source of truth.

### 2.3 Pregnancy / catalog routing

If `pg=1` in URL params (pregnant or planning), the user is on the **Catalog (Plan 02) route**, not Plan 01. The app's framing must shift:

- Headline: "A plan that covers it." (vs persona dashboardHeadline)
- Pricing: Catalog estimate (~$520/mo typical) vs Plan 01 (~$290/mo typical)
- Tone: "Same brokerage, different product. We're routing you to a plan that covers what Plan 01 doesn't."
- Never: pretend Plan 01 fits when pregnancy is flagged

The pregnancy flag also overrides `hasCurrentCoverage` for card scan logic — pregnancy users still get the card-scan offer (they probably have ACA coverage).

---

## 3. Three-zone layout — architecture

### 3.1 Layout

```
┌────────────────┬─────────────────────────┬──────────────────┐
│                │                         │                  │
│   ZONE 1       │       ZONE 2            │    ZONE 3        │
│   NORA CHAT    │       DASHBOARD         │    REPORT        │
│                │                         │    DRAWER        │
│   ~36% width   │       ~38% width        │    ~26% width    │
│                │                         │                  │
│   - Avatar     │   - Persona headline    │   Empty until    │
│   - Name +     │   - Big savings number  │   Nora has       │
│     credential │   - Quiz answer recap   │   finalized.     │
│   - Conv flow  │   - Live updates as     │                  │
│   - Quick-     │     Nora gathers info   │   Then fills:    │
│     reply      │   - Card scan widget    │   - Plan summary │
│     buttons    │   - Trust elements      │   - Fine print   │
│                │                         │   - Comparison   │
│                │                         │   - Save/share/  │
│                │                         │     forward      │
│                │                         │                  │
└────────────────┴─────────────────────────┴──────────────────┘
```

### 3.2 Desktop breakpoints

- **Wide desktop (≥1280px):** Full 3-zone, percentages above
- **Laptop (1024–1279px):** Same 3-zone, slightly compressed (33/40/27%)
- **Tablet (768–1023px):** 2-zone (Chat + Dashboard); drawer becomes a slide-out triggered by a "View Report" button in dashboard
- **Mobile (<768px):** Single-zone tab navigation: Chat → Dashboard → Drawer; or bottom-sheet pattern (drawer slides up over chat)

### 3.3 Page chrome

- **Top bar:** ShopHealthcare logo (left) · "Nora · Live" status pill (center) · Account icon (right, only after email captured)
- **No bottom nav** on desktop
- **Mobile bottom nav:** Chat / Dashboard / Drawer tabs

### 3.4 Visual rhythm

The app should feel like a single, unified workspace — NOT three separate cards floating on a page. Use:
- A **single ink-bordered container** wrapping all three zones
- **Subtle vertical dividers** between zones (1px dashed `rgba(14,42,58,0.18)`)
- **Cream background** throughout
- **Hard 3D ink shadow** on the outer container only — `6px 6px 0 var(--ink)`

---

## 4. Zone 1 — Nora Chat

### 4.1 Structure

```
┌────────────────────────┐
│  [N] Nora              │   ← header: avatar + name + credential
│  Licensed enrollment   │
│  assistant · ● Live    │
├────────────────────────┤
│                        │
│  [chat scroll area]    │   ← messages render here
│                        │
│  [N]: Hi, I see you're │
│       in Texas...      │
│                        │
│  [U]: ...              │
│                        │
│  [N]: ...              │
│                        │
├────────────────────────┤
│  [quick reply buttons] │   ← contextual: 2-4 buttons
│  [text input box]      │   ← always available fallback
└────────────────────────┘
```

### 4.2 Header

- **Avatar:** Lemon-yellow circle, "N" in ink, 40px diameter. Animated: subtle 4s breathing pulse on idle.
- **Name + credential:** "Nora · Licensed enrollment assistant"
- **Status:** "● Live" with green pulsing dot (same as V20 hero)
- **Sticky** to top of zone on scroll

### 4.3 Message bubbles

**Nora messages (incoming):**
- Cream background, ink border, ink text
- Left-aligned
- Avatar to the left of bubble
- Max-width: 80% of zone width
- Padding: 14px 18px
- Border-radius: 18px
- Timestamp small below: JetBrains Mono 9.5px, opacity 0.5

**User messages (outgoing):**
- Lemon background, ink text, ink border
- Right-aligned
- "U" avatar to the right (or user's initial if logged in)
- Same dimensions

**Aha moment messages** (when Nora reveals a number):
- Lemon-tinted background with extra emphasis
- Big numbers in Fraunces italic, pink-dark color (`var(--pink-dark)`)
- Style match V20 hero chat preview pattern (already designed)

### 4.4 Typing indicator

- 3 ink dots, 6px diameter, in a flex-inline row
- Animation: dots pulse sequentially (1.2s cycle, 0.15s stagger)
- Uses existing `.chat-preview .typing` pattern from V20

### 4.5 Quick-reply buttons

When Nora asks a question with constrained answers (yes/no, dates, etc.):
- 2–4 pill-shaped buttons appear below the message
- Cream bg, ink border, ink text
- Hover: lemon bg, hard 3D shadow
- Click: instantly sends as user message + advances conversation
- Disappear after click

### 4.6 Text input fallback

Always present at the bottom of the chat zone:
- Single-line input (auto-grows on multi-line)
- "Send" arrow button on the right (lemon bg)
- Placeholder text changes contextually: e.g. *"Type or pick an option above..."*

### 4.7 Persona-tagged opener (the FIRST message)

When the app loads, Nora sends ONE opening message before any user input. This message:

1. Echoes the URL params back to the user (proves Nora knows the context)
2. Pulls `noraOpener` from `persona-strings.json` for the persona
3. Sets up the next question

**Template:**
> *"I see [STATE_NAME] · age [AGE] · [SEX_LABEL]. [noraOpener]"*

**Example for SP1, TX, 35, M:**
> *"I see Texas · 35 · male. 37% of self-employed people in your bracket save the most on Plan 01. Let me ask 4 quick questions to lock it in. First — what's your name?"*

**Example for CL1, CA, 32, F, pregnant:**
> *"I see California · 32 · female · pregnancy planned. Plan 01 doesn't cover maternity, so I'm routing you to our Catalog product line — same brokerage, different plan that covers it. Let me ask a few things. First — what's your name?"*

The opener is NEVER cold. NEVER generic. ALWAYS persona-tagged.

---

## 5. Zone 2 — Live Dashboard

### 5.1 Structure (top to bottom)

```
┌─────────────────────────────────┐
│  ★ YOUR ESTIMATE                │   ← persona-tagged eyebrow
│                                 │
│  Built for irregular income.    │   ← dashboardHeadline (Fraunces)
│                                 │
│  ───────────────────            │
│                                 │
│  ┌─────────────────────────┐   │
│  │  $290/mo                 │   │   ← BIG number (Fraunces 64px+)
│  │  Plan 01 estimate        │   │
│  └─────────────────────────┘   │
│                                 │
│  Compared to:                   │
│  ~$890/mo open-market PPO       │
│  You'd save ~$600/mo            │
│                                 │
│  ───────────────────            │
│                                 │
│  WHAT WE KNOW SO FAR:           │
│  ✓ State: Texas                 │
│  ✓ Age: 35                      │
│  ✓ Sex: Male                    │
│  ✓ No pre-existing conditions   │
│  ⊙ Name: pending...             │
│                                 │
│  ───────────────────            │
│                                 │
│  [📷 Got your card?             │
│      Snap it for the real       │
│      number ↓]                  │
│                                 │
└─────────────────────────────────┘
```

### 5.2 The big number (the anchor)

**Critical:** This is the dashboard's hero element. Treat it like the Zillow Zestimate.

- **Initial state:** Persona's quiz-end estimate (from URL params + `persona-strings.json` defaults)
- **Live update behavior:** As Nora gathers data, the number REFINES in place with a subtle 0.4s tween animation (number rolls smoothly, no flash)
- **Final state:** Real Nora-quoted price, locked

**Typography:** Fraunces, weight 600, size `clamp(48px, 6vw, 72px)`, color `var(--ink)`. Italic if it's still an estimate. Roman if it's the real quote.

### 5.3 "What we know so far" — quiz answer recap

A list of facts Nora has captured. Three states per row:
- ✓ Confirmed (ink checkmark + ink text)
- ⊙ Pending (ink ring + muted text)
- ⚠ Conflict (pink warning if user contradicts)

This builds confidence ("the system knows what I told it") and progress ("we're getting closer").

### 5.4 Card scan widget (conditional, see §6)

Renders only if `cardScanRelevance` is `critical`, `optional`, or `ask` AND user hasn't already scanned. Spec'd in §6.

### 5.5 Live update mechanics

The dashboard updates whenever Nora:
- Asks a question → adds the field to "What we know so far" as ⊙ pending
- Receives an answer → flips ⊙ to ✓ + may refine the big number
- Detects a routing change (e.g. pregnancy flag, condition flag) → switches Plan 01 ↔ Catalog with a smooth reveal

### 5.6 Trust elements (footer of zone)

Below all dynamic content:
- "Operated by Core Value Insurance Associates, LLC · NPN #19482230"
- "Licensed in [STATE_NAME]"
- "Verifiable at NIPR.com"
- Small font, muted color

---

## 6. Card Scan — placement, UX, copy

### 6.1 When to surface the card-scan offer

Decision matrix:

| Persona | hasCurrentCoverage | Surface? | Where |
|---|---|---|---|
| RU1 | false | ❌ Never | — |
| SP1 | maybe | ✅ Optional | Dashboard widget |
| BR1 | usually | ✅ Optional | Dashboard widget |
| CL1 | true | ✅ Critical | Dashboard widget + Nora prompt |
| PC1 | true | ✅ Critical | Dashboard widget + Nora prompt |
| GEN | unknown | ✅ Ask in chat | Nora asks first |

If the V22 build adds **homepage entry-path branching** for CL1/PC1, the user may already have card-scan results when they land in the Nora app — in that case skip the offer and surface the parsed data immediately.

### 6.2 Dashboard widget UI

```
┌─────────────────────────────────┐
│  📷  GOT YOUR CARD?              │
│                                 │
│  Snap it and I'll show you the  │
│  EXACT delta vs. Plan 01 — line │
│  by line.                       │
│                                 │
│  [ Snap your card ]             │
│  [ Skip ]                       │
└─────────────────────────────────┘
```

- Compact card, lemon-tinted background
- Icon: outlined camera, ink
- CTA: pink button with hard ink shadow
- Skip: text link, muted color

### 6.3 Card scan flow (modal sequence)

When user clicks "Snap your card":

**Step 1 — Permission + transparency**
> *"Two things before we open your camera:*
> *1. We don't store your card image.*
> *2. We read three things: your insurance company name, plan type, and member ID. That's it."*
>
> [ Open camera ]  [ Cancel ]

**Step 2 — Camera active**
- Live camera preview, full screen
- Overlay: corner guide brackets (4 ink-colored L-shapes at viewport corners)
- Centered hint text: *"Center your card in frame"*
- Bottom-right: large lemon-bg shutter button
- Top-left: X to cancel

**Step 3 — Processing animation**
After capture, modal returns with animated text sequence:
> *Reading your plan...*
> *Checking 2026 rates...*
> *Calculating subsidy gaps...*
> *Finding lower-premium alternatives...*

Each line types in (60ms/char) then stays. Total duration ~3s. Background is lemon-tinted, with subtle scanning-line animation.

**Step 4 — Confirmation**
> *"Got it. You're on [Aetna Bronze HMO] at [$743/mo]. Is that right?"*
> [ Yes, that's me ]  [ Let me edit ]

**Step 5 — Manual edit fallback** (if "Let me edit")
- Form with: Carrier (dropdown of major carriers + "other"), Plan name (text), Monthly premium (number), Plan type (HMO/PPO/EPO), Deductible (optional)
- Pre-filled with OCR results
- Save → returns to chat with confirmed data

**Step 6 — Error state** (if OCR fails)
> *"I had trouble reading that. Want to try again, or just type it in?"*
> [ Retry scan ]  [ Type manually ]

### 6.4 Card scan amplifies the email gate carrot

This is the strategic point of card scan: it transforms the email-gate carrot from generic to **hyper-specific**.

| Without card scan | With card scan |
|---|---|
| "Plan 01 ~$290 vs typical PPO ~$890. You'd save ~$600/mo." | "Plan 01 $290 vs YOUR Aetna Bronze HMO $743. You save $453/mo. Your deductible drops from $7,000 to $5,000. Your prescription tier doesn't cover [drug X]; Plan 01 covers it." |
| Peer benchmark | Their actual plan, line by line |

Designers: make sure the email-gate (§7) reads dramatically more compelling for users who scanned vs didn't. The carrot copy should mention "line by line" only when scan data is present.

---

## 7. Email gate — the carrot stack

### 7.1 When it triggers

After Nora has completed discovery (name, ZIP, DOB, conditions, start date) AND before the real plan is presented in the dashboard. The trigger phrase from Nora:

> *"Quick thing while I finish."*

This is the famous "while I finish" framing — positions email as something Nora *needs* to do her work, not something we're collecting.

### 7.2 The three-layer carrot stack

**Layer 1 — Tangible artifact (primary pull)**
> *"Give me your email and I'll prepare a full plan-vs-plan breakdown — line by line, exactly what you'd save over [persona-specific anchor]."*

The `[persona-specific anchor]` pulls from `persona-strings.json` `comparisonAnchor`:
- RU1: *"what your monthly premium will be once you're back on coverage"*
- SP1: *"what most freelancers pay on the open market"*
- BR1: *"what you'd pay for ACA bridge coverage until Medicare"*
- CL1: *"your renewal premium — the one that just spiked"* ← strongest
- PC1: *"whether your current plan is the best deal in your state"*
- GEN: *"the typical premium for someone in your situation"*

**Layer 2 — Loss aversion (secondary)**
> *"You'll also get the rate locked for 30 days so you can think it over."*

**Layer 3 — Utility / FOMO (tertiary)**
> *"And I'll text you the day before your enrollment window closes so you don't miss it."*

### 7.3 Full gate copy (rendered in-chat)

```
[N]: Quick thing while I finish.

     Give me your email and I'll prepare your full
     plan-vs-plan breakdown. It'll show you exactly
     what you'd save over [comparisonAnchor] — line
     by line.

     Plus I'll lock this rate for 30 days, and text
     you before your enrollment window closes so
     you don't miss it.

     No follow-up unless you ask.

     ┌──────────────────────────┐
     │ 📧 email                 │
     └──────────────────────────┘
     ┌──────────────────────────┐
     │ 📱 phone (optional)      │
     └──────────────────────────┘
     [ Continue → ]

     Skip and just show me the plan
```

### 7.4 UI mechanics

- **Email field:** standard email input, ink border, lemon focus ring
- **Phone field:** standard tel input, marked "(optional)" — defaults to no SMS opt-in
- **Continue button:** Pink bg, ink border, hard 3D shadow
- **Skip link:** Below the form, text-link style, muted color
- **Microcopy stack** (small text, JetBrains Mono, all-caps, .14em letter-spacing):
  - "Email = your account. Not a list."
  - "No follow-up unless you ask."
  - "We never sell your data. Ever."

### 7.5 Skip-for-now handling

This is a counterintuitive but **critical** trust move.

If user clicks "Skip and just show me the plan":
- They proceed to plan presentation in the dashboard
- The right drawer **shows summary only** — no full breakdown PDF
- Save / forward / share features are **locked** behind email capture
- A persistent banner appears at the top of the dashboard:
  > *"Want to save or share this? Email me anytime — same gate, same offer."*
- Clicking the banner reopens the email gate

### 7.6 Account creation mechanics

Auth is **magic link** (passwordless), not password-first. Lower friction, modern, fits "we don't want to be your bank" tone.

Flow:
1. User enters email → clicks Continue
2. Nora confirms in chat: *"Sent you a magic link. Tap it from your email and we're in."*
3. User opens email → clicks link → returns to app, now logged in
4. Real plan reveals in dashboard + drawer fills

Phone is captured here but NEVER required. Default state: SMS off. User must explicitly opt in to enrollment-window reminders.

### 7.7 Edge cases

- **User pastes email but doesn't click Continue:** Show ghost-validate (green checkmark) but don't gate further until click
- **User enters obviously-fake email** (like "x@x.x"): Soft warning *"Looks like a typo? Want to double-check?"* — but allow proceed
- **User already has account** (returning visitor): Skip entire gate, recognize and welcome back
- **Magic link expired/used:** Inline retry — "Your link expired. Want a new one?"

---

## 8. Zone 3 — Report Drawer

### 8.1 Structure

The drawer fills progressively as Nora finishes. Three states:

**State 1 — Empty (default until Nora has data)**
```
┌──────────────────┐
│                  │
│   [Subtle        │
│    illustration  │
│    of envelope]  │
│                  │
│   YOUR REPORT    │
│   WILL APPEAR    │
│   HERE           │
│                  │
│   Once Nora has  │
│   finalized your │
│   plan, this     │
│   drawer fills   │
│   with your full │
│   breakdown.     │
│                  │
└──────────────────┘
```

**State 2 — Plan summary (post-discovery, pre-quote)**
```
┌──────────────────┐
│  YOUR PLAN       │
│  ────────────    │
│                  │
│  PLAN 01         │
│  $290/mo         │
│                  │
│  Network:        │
│  UnitedHealth    │
│  Choice Plus     │
│                  │
│  [Skeleton for   │
│   benefits...]   │
│                  │
└──────────────────┘
```

**State 3 — Full report (post-quote)**
```
┌──────────────────┐
│  YOUR PLAN       │
│  ────────────    │
│                  │
│  PLAN 01         │
│  $290/mo         │
│                  │
│  ───── Network   │
│  ───── Coverage  │
│  ───── Rx        │
│  ───── Network   │
│  ───── Limits    │
│                  │
│  ────────────    │
│                  │
│  vs. YOUR Aetna  │
│  Bronze HMO      │
│  $743/mo         │
│                  │
│  [comparison     │
│   table]         │
│                  │
│  ────────────    │
│                  │
│  [💾 Save]        │
│  [✉️ Email PDF]   │
│  [↗ Forward]     │
│                  │
└──────────────────┘
```

### 8.2 Content sections

When fully populated:
1. **Plan headline** — name + price
2. **What's covered** — bulleted list, plain English
3. **What's NOT covered** — explicit limits (per Scott's compliance rules)
4. **Network** — top doctors/hospitals/pharmacies in user's ZIP
5. **Comparison vs. current plan** (if card scan or manual data)
   - Side-by-side: current plan vs Plan 01
   - Premium delta (monthly + annual)
   - Deductible delta
   - Coverage delta (gaps + adds)
6. **Fine print** — collapsed by default, expandable
7. **Action buttons:** Save · Email PDF · Forward · [Continue to enrollment]

### 8.3 Saved / forwarded artifacts

When user clicks "Email PDF":
- Generate PDF: cream background, ShopHealthcare brand, full report content
- Filename: `ShopHealthcare-Plan-Report-[user-firstname]-[date].pdf`
- Email subject: *"Your Plan 01 breakdown · ShopHealthcare"*
- Email body: *"Here's the full plan-vs-plan breakdown we discussed. Your rate is locked for 30 days. Reply to this email if you want to talk to a licensed broker."*

When user clicks "Forward":
- Modal: *"Send this to a spouse, partner, or whoever's on the plan with you."*
- Email field
- Sends a stripped version (no PII) with a "see your own report at [link]" CTA
- This is the precursor to the V22 Spotify-Wrapped share

### 8.4 Mobile drawer behavior

On mobile, the drawer is a **bottom sheet** that slides up over the chat zone:
- Default state: collapsed to a thin tab at the bottom showing "Your plan: $290/mo · See report ↑"
- Tap the tab → drawer slides up to 80% height, chat scrolls behind
- Pull-down gesture closes
- Same content, vertically optimized

---

## 9. Mobile responsive

### 9.1 Layout shifts

| Breakpoint | Layout |
|---|---|
| ≥1280px | 3-zone (chat 36% / dashboard 38% / drawer 26%) |
| 1024–1279px | 3-zone (33/40/27) |
| 768–1023px | 2-zone (chat / dashboard); drawer is slide-in modal |
| <768px | 1-zone tab nav: Chat / Dashboard / Drawer |

### 9.2 Mobile chat optimizations

- Larger tap targets on quick-reply buttons (min 48px height)
- Sticky chat header (Nora avatar + name)
- Sticky chat input at bottom
- Auto-scroll to newest message on send
- Pull-to-refresh disabled (avoid accidental reloads mid-conversation)

### 9.3 Mobile dashboard optimizations

- Big number stays huge (don't shrink below 56px)
- "What we know" list collapses by default — tap to expand
- Card scan widget becomes full-width

### 9.4 Mobile drawer

- Bottom sheet pattern (described §8.4)
- Save / Forward / Email PDF buttons in a horizontal row at top of drawer
- Section navigation: tabs at top of drawer for sections (Plan / Compare / Fine Print)

---

## 10. Animation & motion

### 10.1 Standard transitions

- **State changes:** `cubic-bezier(.22,.61,.36,1)` 0.9s
- **Hover/click:** 0.15s ease
- **Number tween:** 0.4s ease-out, smooth roll (no flash)
- **Reveal animations:** IntersectionObserver-triggered, opacity + 10px Y translate
- **All animations gated on `prefers-reduced-motion`**

### 10.2 Specific animations

**Nora avatar idle pulse:**
- Subtle box-shadow expand/contract, 4s cycle
- Reads as "alive"
- Pauses when user is typing

**Typing indicator:**
- 3 dots, sequential pulse (already designed in V20)
- 1.2s cycle, 0.15s stagger between dots

**Big number refinement:**
- When Nora updates the dashboard number:
  1. Old number scales 0.95 + opacity 0.5 (300ms)
  2. New number scales from 1.05 + opacity 0 → 1 (400ms, eased)
- No flash, smooth roll

**Card scan widget reveal:**
- Slides up + fades in when triggered (400ms)
- Subtle bounce on entry

**Drawer fill animation:**
- Each section reveals sequentially as Nora finishes that data
- 200ms stagger between sections
- Each: opacity + 8px Y translate, eased

### 10.3 Loading states

- **Skeleton loaders** for any zone awaiting data: subtle pulse, ink-on-cream stripes
- **Nora "thinking":** typing indicator + status line *"Pulling [carrier] rates for [state]..."*

---

## 11. Empty / loading / error states

### 11.1 Empty states

- **First load (URL params present):** No empty state; jump straight to Nora's persona-tagged opener
- **First load (URL params missing):** Nora opens with the GEN persona opener: *"Let me ask 3 things and tell you which path makes sense."*
- **Drawer empty:** State 1 (§8.1)
- **Card scan declined:** Widget hides; drawer fills with peer-benchmark comparison instead

### 11.2 Loading states

- **App shell load:** Skeleton of three zones, subtle pulse
- **Nora response pending (>2s):** Typing indicator
- **Real quote loading:** Big number shows estimate w/ italic + small "calculating..." note below
- **PDF generation:** Modal with progress bar + "Generating your full report..."

### 11.3 Error states

- **Network drop mid-conversation:** Banner: *"Lost connection. Saving where we are. We'll pick up when you're back."*
- **Card scan OCR failure:** Inline option to retry or type manually (see §6.3)
- **Magic link expired:** Inline retry — "Your link expired. Want a new one?"
- **Carrier rate lookup failure:** Nora gracefully says *"My system's slow on [carrier] right now — let me try the comparable network instead."*
- **Underwriting hard exit triggered mid-flow** (e.g. user reveals condition that disqualifies Plan 01): Smooth transition to Catalog routing, with explicit framing: *"Based on what you just told me, Plan 01 isn't the right fit — let me show you Plan 02, which covers it."*

---

## 12. Backend integration touchpoints (Eugenio)

### 12.1 The data contract

The Nora app reads URL params on load → calls Nora's existing backend with persona context → renders responses in chat zone.

**Inbound contract (URL params on app load):**
```
?p=<persona_code>&s=<state>&a=<age>&x=<sex>&pg=<pregnancy_flag>&c=<conditions>
```

**Outbound contract (Nora API call on app load):**
```json
{
  "persona": "SP1",
  "state": "TX",
  "age": 35,
  "sex": "M",
  "pregnancy": false,
  "conditions": "none",
  "session_id": "<generated>"
}
```

**Outbound contract (each user response):**
```json
{
  "session_id": "<carried>",
  "user_message": "<text>",
  "context_updates": { "name": "Sarah", "zip": "78701" }
}
```

**Inbound contract (Nora response):**
```json
{
  "messages": [
    { "type": "text", "content": "..." },
    { "type": "quick_replies", "options": ["Yes", "No", "Skip"] }
  ],
  "dashboard_updates": {
    "estimate": 290,
    "comparison": 890,
    "savings": 600,
    "facts": [
      { "key": "name", "value": "Sarah", "status": "confirmed" }
    ]
  },
  "drawer_state": "summary" | "full" | "empty"
}
```

### 12.2 Card scan integration

OCR provider TBD (open question for Eugenio). Integration spec:
- **Endpoint:** `POST /api/scan-card` with multipart image
- **Response:** `{ carrier, plan_name, plan_type, member_id, monthly_premium, deductible }`
- **Latency target:** <3s for 95th percentile
- **Failure mode:** return `{ error: "ocr_failed", suggested_action: "manual_entry" }`

### 12.3 Email + magic link

- **Endpoint:** `POST /api/auth/magic-link` with `{ email }`
- **Response:** `{ sent: true }`
- **Magic link URL format:** `https://shophealthcare.io/?p=<persona>&s=<state>&...&token=<jwt>`
- **Token TTL:** 24 hours
- **One-time use** (consumed on first click)

### 12.4 Rate locking

- **Endpoint:** `POST /api/rate-lock` with `{ session_id, plan_id }`
- **Response:** `{ locked_until: ISO-date, lock_id }`
- **TTL:** 30 days from lock creation

### 12.5 SMS opt-in

- **Endpoint:** `POST /api/sms-optin` with `{ phone, session_id }`
- **Compliance:** Must use TCPA-compliant double opt-in (text reply YES required)

---

## 13. Build sequencing recommendation

If splitting into milestones:

### Milestone 1 — App shell + Nora chat (week 1)
- Three-zone layout scaffolding
- Nora chat zone (header, message bubbles, typing indicator, quick replies, text input)
- Persona-tagged opener mechanic
- URL param parsing
- Mobile single-zone tab navigation

### Milestone 2 — Dashboard live updates (week 1.5)
- Big number + estimate refinement
- "What we know so far" panel
- Persona-tagged eyebrow + headline
- Backend-driven update contract

### Milestone 3 — Email gate + auth (week 2)
- Three-layer carrot copy
- Email + phone form
- Magic-link flow
- Skip-for-now handling
- Account creation backend

### Milestone 4 — Card scan (week 2.5)
- Dashboard card-scan widget
- Camera permission flow
- OCR integration
- Manual edit fallback
- Confirmation flow

### Milestone 5 — Report drawer (week 3)
- Three drawer states (empty / summary / full)
- Plan summary content
- Comparison table (with card-scan delta if available)
- Fine print collapse
- Save / Forward / Email PDF actions

### Milestone 6 — Polish + edge cases (week 3.5)
- Empty / loading / error states
- Mobile drawer bottom sheet
- Animations (number tween, drawer fill, etc.)
- `prefers-reduced-motion` gates
- Browser/device QA

---

## 14. Acceptance criteria

The app is build-complete when:

### 14.1 Persona context
- [ ] All 6 personas (RU1, SP1, BR1, CL1, PC1, GEN) load with their persona-tagged opener
- [ ] Pregnancy flag (`pg=1`) routes to Catalog framing in dashboard + Nora copy
- [ ] Missing URL params fall back to GEN persona without errors
- [ ] `persona-strings.json` is the single source of truth — no persona copy hardcoded in components

### 14.2 Three-zone layout
- [ ] Desktop (≥1280px): 3-zone visible side-by-side
- [ ] Tablet: drawer collapses to slide-in modal
- [ ] Mobile: tab nav between zones
- [ ] Single ink-bordered container wraps all zones, with hard 3D ink shadow

### 14.3 Chat zone
- [ ] Persona-tagged opener fires on app load
- [ ] Echoes URL params back to user (state · age · sex)
- [ ] Quick replies advance conversation correctly
- [ ] Text input fallback always available
- [ ] Typing indicator displays during Nora response wait
- [ ] Aha-moment messages have lemon emphasis treatment

### 14.4 Dashboard
- [ ] Big number renders + tweens smoothly on update
- [ ] "What we know so far" updates as Nora gathers data
- [ ] Card-scan widget appears for correct personas only
- [ ] Trust footer (NPN, license, Core Value entity) always visible

### 14.5 Card scan
- [ ] Permission step + transparency copy displays before camera opens
- [ ] OCR returns parsed plan within 3s (95th percentile)
- [ ] Confirmation step lets user edit OCR results
- [ ] Manual fallback works without camera
- [ ] Failure recovery offers retry + manual options

### 14.6 Email gate
- [ ] Triggers after Nora discovery, before plan reveal
- [ ] Three-layer carrot copy displays
- [ ] Comparison anchor pulls from `persona-strings.json`
- [ ] Skip-for-now allows plan view without account
- [ ] Magic-link flow completes end-to-end
- [ ] Phone is optional, default-off SMS

### 14.7 Drawer
- [ ] Three states render correctly (empty / summary / full)
- [ ] Sections fill progressively as Nora completes them
- [ ] Comparison table renders if card-scan data available
- [ ] Save / Email PDF / Forward all functional
- [ ] PDF generates with correct ShopHealthcare branding

### 14.8 Compliance + voice
- [ ] No "free" anywhere customer-facing
- [ ] No ACA / Medicare / government implications
- [ ] All estimates use "around", "~", "about"
- [ ] "No follow-up unless you ask" surfaced at email gate
- [ ] All Plan 01 mentions disclose exclusions (pregnancy, pre-existing, mental health, rehab)
- [ ] Pregnancy flag NEVER shown a Plan 01 estimate

### 14.9 Performance + accessibility
- [ ] Initial load <2s on 3G
- [ ] Lighthouse: ≥90 Performance, ≥95 Accessibility, ≥95 Best Practices, ≥95 SEO
- [ ] All interactive elements keyboard-navigable
- [ ] Focus rings visible on all focusable elements
- [ ] Screen-reader labels on all icons / unlabeled controls
- [ ] `prefers-reduced-motion` honored

### 14.10 Cross-browser / device
- [ ] Safari (macOS + iOS)
- [ ] Chrome (Windows + Android)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)
- [ ] iPad Safari (portrait + landscape)
- [ ] Android Chrome (small + large)

---

## 15. Out-of-scope items (V22+)

Track for future builds, NOT to be built in V21:

- **Spotify-Wrapped post-purchase share asset** (V22)
- **Homepage card-scan branching for CL1/PC1** (V22 — currently in V20 quiz only)
- **SMS reminder system** for enrollment-window deadlines (V22 backend)
- **Returning-user logged-in state** with saved sessions (V22)
- **Family / dependent flow** (V23 — single user only in V21)
- **Spanish-language version** (V23)
- **Carrier-side checkout (Quoted) styling** — this is the broker's flow; we only style the handoff page (V21 includes minimal styling, full polish in V22)

---

## 16. Open questions (to resolve before build)

These are the decisions we need answers on. Ranked by build dependency.

### Critical (block the build)
- **OCR provider selection** — who handles card scan parsing? (Eugenio call)
- **Magic-link auth backend** — existing or new? (Eugenio call)
- **PDF generation** — frontend (jsPDF), backend (Puppeteer), or third-party (DocRaptor / WeasyPrint)? (TBD)

### High-priority (block specific zones)
- **S11** — Re-skin scope: Nora chat container only, or full quoting view (Plan presentation + Quoted)? (Affects how many surfaces this brief covers)
- **S15** — Plan-vs-plan comparison PDF: who generates, what template, what branding? (Affects drawer build)
- **S16** — Skip-for-now: shows summary only or full breakdown? (My recommendation: summary only — affects drawer state machine)

### Medium-priority (affect UX details)
- **S13** — Card scan branching UX on V22 homepage — full screen or inline secondary CTA? (Doesn't block V21)
- **S14** — Magic-link vs password-first — which converts better in our cohort? (Recommend magic-link for V21; A/B in V22)
- **Phone number compliance** — TCPA double opt-in is required; UX flow?

### Low-priority (can defer)
- **Spotify-Wrapped asset format** (S12) — V22 scope
- **Spanish-language localization** — V23 scope

---

## 17. Reference files

- **V20 homepage live build:** `brand bible/directions/21-lemon/homepage-v20-persona-quiz.html`
- **Quiz/App/Capture flow spec:** `front-end design/quiz-app-capture-flow.md`
- **Brand-voice skill:** `~/.claude/skills/shophealthcare-voice/`
- **Brand bible:** `brand bible/SHOPHEALTHCARE-BRAND-BIBLE.html`
- **Scott sales logic:** `front-end design/scott-sales-logic.md`
- **Lemon CSS shared:** `brand bible/directions/21-lemon/lemon.css`

## 18. Notion cross-references

- [Design Decisions — V19→V20](https://app.notion.com/p/35126136b372816599dfd00a939ff88d)
- [Quiz / App / Contact Capture Flow](https://app.notion.com/p/35226136b372810b810ae7a03d0b2e92)
- [Brand & FE Decision Brief §10](https://app.notion.com/p/33d26136b3728140ba2ef19d7968d71a)
- [FE Rebuild — Direction & First Moves](https://app.notion.com/p/34126136b372816cb32dc222a804180d)
- [Meeting Notes 2026-04-29](https://app.notion.com/p/33c26136b3728045be53fff20b4fc565)

---

**End of brief. Hand to Claude Design.**
