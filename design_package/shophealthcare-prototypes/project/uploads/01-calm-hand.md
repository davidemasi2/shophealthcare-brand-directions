# Direction 01 — The Calm Hand

**Thesis:** In a category full of noise — blinking quote widgets, aggressive CTAs, corporate blue, siren-red urgency banners — we win by being the quietest voice in the room. Confident people speak softly. We design like that.

**Analog brands:** Monocle, Apple, Mailchimp (classic era), Stripe, Pentagram's work for retirement brands.

**Why now:** Consumer sentiment is at historic lows. Everyone is exhausted. The four-color premium hike letter they just got in the mail is loud. We are not. That contrast *is* the pitch.

---

## Positioning moment

> *"Health insurance, quietly sorted."*

The homepage feels like the moment after you close a loud tab. One anchor line. A lot of room to breathe. A single next move.

---

## Decision 1 — Color

**Primary — "Morning Ink"** `#1F2A37` (deep warm navy, not corporate blue — has a brown undertone)
**Accent — "Ledger Green"** `#2F7D4F` (used only for trust signals, savings numbers, "verified" marks — never decorative)
**Surface — "Paper"** `#FAF7F2` (warm off-white, the background for everything)
**Neutrals:** `#E8E3DB` · `#C9C2B7` · `#7B7569` · `#4A4539`
**Alert (minimal use):** Warning amber `#B8842B` · Error oxblood `#8E2E2E`

**Rule:** 80% of any screen is Paper. 15% is Morning Ink type. 5% is Ledger Green + one photo.

**What we're differentiating from:**
- Oscar's coral (F9F1E9) — too playful
- Lemonade's pink — too startup
- GoodRx green — too utilitarian
- Stride's yellow — too gig-economy
- Standard insurance blue — too corporate

**What we're adjacent to:** Monocle editorial, early Mailchimp, Kinfolk magazine, Tonal fitness.

---

## Decision 2 — Typography

**Headline:** **GT Sectra** (warm humanist serif) — for hero lines only, never small
**Body + UI:** **Inter** — clean, boring on purpose, reads well at 14px
**Numerics:** **Inter Tabular** for savings reveals (aligns columns in comparison tables)

**Scale (mobile → desktop):**
- Hero: 36 / 56 — GT Sectra, weight 400, tight leading
- H1: 28 / 40 — GT Sectra, 400
- H2: 22 / 28 — Inter, 600
- Body: 16 / 17 — Inter, 400, line-height 1.6
- Small: 13 / 14 — Inter, 500
- Savings display: 48 / 72 — Inter Tabular, 700

**Rule:** One weight per screen for Inter. Never italicize UI. Serifs only appear in the largest type on a given screen.

---

## Decision 3 — Nora

**Form:** Simple 2D illustrated portrait. Not a 3D render. Not a photo. Think Headspace's mascots — but aged up, less playful, more like a trusted nurse.
**Color signature:** A single warm dot of `#C97F4A` (terracotta) that appears when Nora is about to speak. Nothing else on the screen uses this color.
**Motion:** One-beat pause before each message. No typing indicator bounce. A soft fade-in. Calm by design.
**Personality adjectives:** Patient · Literate · Understated · Competent · Warm

**Nora DO/DON'T:**
- DO: "Let's take this one step at a time." · "I can see your plan. Let me walk through it."
- DON'T: "Let me help you find the RIGHT plan for YOU!" · emojis · exclamation marks · "Great choice!"

---

## Decision 4 — Photography

**Direction:** Real people in real, quiet rooms. Natural light from the left. Nobody is smiling broadly. Nobody is holding a laptop at a kitchen island. Hands on mugs. Hands on mail. A window. A plant that isn't a monstera.

**Treatment:** Warm color grade, slight grain, natural shadows preserved. No pure-white backgrounds. No overhead shots.

**Per persona:**
- RU-1: a person at a kitchen table with an open laptop, reading. Not distressed — focused.
- SP-1: a person at a studio or workshop, alone, mid-thought.
- BR-1: a couple at a dining table with mail between them. Sun through curtains.
- CL-1: a person holding a letter, reading it. Half-lit. Back-of-house.
- PC-1: a person on a porch or stoop, phone down, coffee up.

**Reference brands:** Aesop, Le Labo, early Everlane, The New York Times Magazine photography.

---

## Decision 5 — Voice

**10-line style guide:**
1. Short sentences. If a sentence runs long, break it.
2. One idea per paragraph.
3. No exclamation marks. Ever.
4. Name the reader's situation first. Never lead with the product.
5. Specific numbers, not ranges. $2,100/yr, not "up to $3,000."
6. "Actually" is allowed. "Amazing," "incredible," "revolutionary" are not.
7. Insurance jargon only with inline plain-English. Always.
8. Show the limit before the promise. ("Nora can't recommend plans outside your state.")
9. Address the tired 3pm Tuesday reader. Not the enthusiastic one.
10. If you can delete a word, delete it.

**Example rewrites:**
- ❌ "Discover your personalized health insurance options today!"
- ✅ "Let's see what you actually qualify for."
- ❌ "Our AI-powered platform revolutionizes how you shop."
- ✅ "Nora reads the fine print for you."
- ❌ "Save up to 40% on premiums!"
- ✅ "Most members pay $2,100/yr less after the switch."

---

## Persona register

- **RU-1:** Voice softens slightly. "You're not alone in this" framing.
- **SP-1:** Voice tightens, more data-forward. "Here's the number. Here's the plan. Ready when you are."
- **BR-1:** Voice slows further. Longer paragraphs permitted. More about *time* than *savings*.
- **CL-1:** Voice stays calm but moves faster. "Scan the letter. I'll handle the rest."
- **PC-1:** Voice adds curiosity. "Want to see if you're overpaying? Takes 30 seconds."

---

## Sample moment — Savings Reveal Card

```
           Paper background

           Based on your plan
           and your income:

           $2,100/yr
           ─────────
           less than what you're paying now.

           Across 7 plans in your state.

           [ Walk me through them ]

           ↓ show the math
```

Morning Ink type. Ledger Green on the number. Inter Tabular. No confetti. No animation on reveal except a 200ms fade.

---

## Stitch promptability — high

Calm Hand translates cleanly to Stitch prompts because the rules are reductive:
- "Minimal layout, one anchor element per viewport, Paper background, Morning Ink type, single photograph"
- Stitch will not be tempted to over-decorate because the system has almost no decoration to generate

---

## Risk

- **Reads as generic startup** if discipline slips (another "clean minimal brand"). Defended by the GT Sectra/Inter pairing, warm Paper background, and Ledger Green being the *only* color permitted outside ink.
- **Can feel cold to RU-1** in their most fearful moment. Mitigate with photography choice and voice softening rules.
- **Hard to stand out on a Meta ad grid** full of louder competitors. This is a real tradeoff. We win in funnel, not in feed.

---

## Best suited for

SP-1 (data-forward, skeptical), BR-1 (warm, slow), PC-1 (zero pressure). Works for RU-1 and CL-1 via persona register adjustments.

## Works against

Any future pivot to "fast, aggressive, growth-hacky" positioning. If we win and then want to look like a scrappy challenger later, we're stuck.
