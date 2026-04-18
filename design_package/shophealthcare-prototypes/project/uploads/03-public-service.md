# Direction 03 — The Public Service

**Thesis:** The Navigator program got defunded. Trusted public guidance disappeared overnight. We step into that vacuum and look the part. Civic utility confidence — gov.uk × Bloomberg Terminal × Apple Health Records — applied commercially. We look like the infrastructure America wishes it still had.

**Analog brands:** gov.uk, 18F, NY Subway wayfinding, Bloomberg Terminal, Apple Health Records, USPS design system (the good parts), NYPL's visual identity, Massimo Vignelli's Unimark work.

**Why now:** Federal Navigator funding cut 90%. Nobody trusts insurers. Nobody trusts the government. But everyone trusts *systems that work*. Wayfinding does. Weather.gov does. We look like those.

---

## Positioning moment

> *"Every plan in your state. One number. Scan your card."*

The homepage is a wayfinding system. You always know where you are, what's available, what's next. Confidence comes from structure, not from copy.

---

## Decision 1 — Color

**Primary — "Deep Teal"** `#0A4B55` (institutional, civic, nobody in insurance owns this)
**Accent — "Sunlit Yellow"** `#FFC43D` (used for status indicators, savings, affirmations — the civic yellow of wayfinding)
**Surface — "Bone"** `#F7F4EE` (warm, civic-document off-white — not clinical white)
**Utility neutrals:** `#0E0E0E` · `#3A3A3A` · `#6E6E6E` · `#C9C5BD` (a clear grey scale like a transit map)
**Alert:** Civic red `#C6392B` · Civic green `#1E6F3E`

**Rule:** Every interactive element gets a status color. Every status has a fixed semantic meaning that never changes across the product. Sunlit Yellow = "this is the useful number." Deep Teal = "this is navigation." Red = "stop and read." Green = "you're good."

**What we're differentiating from:**
- Oscar/Lemonade softness — we are more structural
- GoodRx commercial green — we are civic
- Devoted's concierge warmth — we are confident, not cozy
- Standard corporate health blue — we own teal, not blue

**What we're adjacent to:** gov.uk, MTA map aesthetic, Apple Health Records, Stripe's docs.

---

## Decision 2 — Typography

**Everything — "Inter" with tabular numerics enabled** — the modern civic default, free, accessible, infinitely scalable
**Labels + microcopy — "IBM Plex Mono"** — for codes, plan IDs, status labels, timestamps
**Optional display — "Söhne Breit"** for very large hero numbers (wider, more institutional)

**Scale:**
- Hero: 40 / 64 — Inter, 600, slightly tighter tracking
- H1: 28 / 40 — Inter, 600
- H2: 22 / 28 — Inter, 600
- Label: 11 / 13 — Plex Mono, 500, uppercase
- Body: 16 / 17 — Inter, 400
- Data display: 36–88 — Inter Tabular, 600

**Rule:** Numerical hierarchy matters more than textual hierarchy. The biggest thing on any page is always a number.

---

## Decision 3 — Nora

**Form:** Single-color circular avatar. No face. Just a solid Deep Teal circle with a small sunlit yellow dot — Nora's "I'm listening" indicator. Like Ada Health's minimalism, pushed further into pure civic infrastructure.
**Color signature:** Deep Teal + Sunlit Yellow dot. Nothing else touches these together.
**Motion:** A single pulse when she's "thinking." A single fade when she speaks. That's it. No bouncy typing.
**Personality adjectives:** Competent · Steady · Civic · Measured · Clear

**Nora DO/DON'T:**
- DO: "I have your plan and your subsidy eligibility on file. Here's what's available." · "I can help in 43 states. I'll hand you to a licensed human in others."
- DON'T: Personality for personality's sake · "Hi friend!" · casual phrases · emojis

---

## Decision 4 — Photography

**Direction:** Environmental portraits — people in their actual environments, not posed. Shot like civic documentary photography. Think WPA-era with modern production quality. Diverse, specific, American.

**Treatment:** Slightly desaturated with warm highlights preserved. Natural composition — rule of thirds, no centered subjects, no eye contact with camera. Wide shots that include environment.

**Per persona:**
- RU-1: a person on a loading dock, factory floor, or back kitchen — at the moment they just lost their job. Not dramatic. Just ordinary.
- SP-1: a welder, a graphic designer at a monitor, a contractor in a truck. Working.
- BR-1: a retired teacher in their garden, a couple on a front porch, a grandmother with grandkids — all mid-life, not staged.
- CL-1: a person at a mailbox, opening a letter. A person at a bus stop checking a phone.
- PC-1: a person at a grocery store, a person in a doctor's office waiting room, a person on a Zoom call.

**Reference brands:** The Library of Congress photography collection, ProPublica, NPR editorial, Stripe Press photography.

---

## Decision 5 — Voice

**10-line style guide:**
1. State what's possible. Then state what isn't.
2. Lead with numbers and states, not emotions.
3. Every sentence answers a question the user would ask.
4. Use "we" for the product, not "us at ShopHealthcare."
5. Civic clarity, not casual friendliness.
6. If a user is in a state we don't serve, say so in the first sentence.
7. Verbs before adjectives. "Scan your card" not "Easy card scanning."
8. Dates and times are always absolute. Never "soon" or "recently."
9. Disclosures read like a transit announcement — matter-of-fact, useful, visible.
10. The tone of a well-designed government form that actually works.

**Example rewrites:**
- ❌ "Find your perfect health plan with our AI-powered platform!"
- ✅ "Scan your card. See every plan available in your state. Typically 90 seconds."
- ❌ "We're here to help you every step of the way!"
- ✅ "Licensed agents available 7am–10pm ET. Nora available anytime for the first steps."
- ❌ "Our amazing team makes insurance simple!"
- ✅ "43 states fully supported. 7 states via licensed agent only. Call 1-800-XXX-XXXX."

---

## Persona register

- **RU-1:** Voice stays civic but adds a grounding opening. "Coverage lost in the last 60 days? A Special Enrollment Period may apply. Here's what that means."
- **SP-1:** Home court. "Self-employed filers: here are your 4 routes to coverage. Pick one."
- **BR-1:** Slightly warmer framing around Medicare-adjacent language. Slower pacing. "Between 55 and 64? You have 3 paths. Here's the clearest one."
- **CL-1:** "You received a renewal letter. Here's how to read it, and here's what else is available."
- **PC-1:** Reframes as civic diagnostic. "Haven't checked your plan in a while? Here's a free comparison. No signup required."

---

## Sample moment — Savings Reveal Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLAN COMPARISON · STATE: TEXAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT PLAN
Ambetter Essential Care 5
$412/mo

AVAILABLE ALTERNATIVES
7 plans · starting at $183/mo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POTENTIAL MONTHLY SAVINGS

     $229
     /month
     ──────
     $2,748/yr

(Based on your income and household size.
Subsidy eligibility verified.)

[ VIEW THE 7 PLANS → ]

NORA · AVAILABLE
```

Bone background. Deep Teal structure. Sunlit Yellow on `$229` only. Everything wayfinded.

---

## Stitch promptability — very high

Public Service is the most system-native direction. Stitch prompts write themselves:
- "Civic wayfinding layout, structured sections with uppercase mono labels, teal primary, yellow status indicator, Inter typography, tabular numerics for all numbers"
- The system is so defined that every Stitch output will look like the same brand

---

## Risk

- **Reads as "government website"** if palette fails — Deep Teal has to be rich, not institutional-drab. Bone has to be warm, not clinical.
- **Missing "startup energy"** — no swagger, no challenger attitude. Some of the team may read this as boring. Defensible — confidence is not the same as swagger.
- **Requires maintained discipline** — every new component has to use the same wayfinding rules. Any ornamental break weakens the whole.

---

## Best suited for

All 5 personas, genuinely. Civic confidence is the one register that spans fear (RU-1), skepticism (SP-1), anxiety (BR-1), anger (CL-1), and disengagement (PC-1) without failing anyone. This direction is the most universal.

## Works against

Meta ad-feed performance. Civic aesthetic reads as "serious app" which can depress click-through vs. softer lifestyle-coded creative. Mitigate with persona-specific ad creative that breaks the aesthetic slightly outside the product.
