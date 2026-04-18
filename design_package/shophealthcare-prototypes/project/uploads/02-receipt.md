# Direction 02 — The Receipt

**Thesis:** Health insurance is the only industry where the document you pay for is illegible on purpose. We flip that. We design the entire brand as if it were a receipt — every number visible, every line item named, every limit disclosed. Radical document-forward honesty, made beautiful. Anti-design as design.

**Analog brands:** GoodRx (pushed further), Craigslist (made premium), Dropbox's 2023 identity, Robinhood's plain disclosures, Figma's settings pages, the IRS's best forms, Bloomberg's terminal honesty.

**Why now:** Trust in insurers is at historic lows *because* of the fine print. We are the brand that says the fine print out loud, in the hero.

---

## Positioning moment

> *"Your plan went up $127. Here's what else is available."*

The homepage looks like a well-designed bill. Literally. A paper color, a monospace accent, a big number, a clear table. No marketing language above the fold. Just: here's what you pay, here's what else exists, scan your card to see exactly.

---

## Decision 1 — Color

**Primary — "Carbon"** `#0E0E0E` (true ink, not black-blue)
**Paper — "Manila"** `#F3EEE0` (warm document cream with a yellow lean)
**Highlight — "Safety Orange"** `#FF5E1A` (used only for "this is the number that matters" moments — savings, limits, calls to action)
**Rule lines:** `#1A1A1A` at 0.5px — every divider is a hairline, every section has one.
**Neutrals:** `#E0DACB` · `#B8AE97` · `#6E6757`
**Alert:** No separate alert color — Safety Orange plus bold ink does it.

**Rule:** Every page has a hairline rule under the headline. Every dollar amount that matters is Safety Orange. Nothing else gets highlighted.

**What we're differentiating from:** Every other health brand uses softening colors to mask complexity. We use color *to mark* the numbers that matter. The Manila + Ink combination is owned by nobody in this category.

---

## Decision 2 — Typography

**Headline + numerics:** **GT America Mono** — display monospace, a wink at the document aesthetic but readable
**Body:** **Söhne** (or **Inter** as fallback) — clean sans, pairs with the mono without fighting it
**Large display numbers (savings, premiums):** **GT America Mono** at huge scale — the document aesthetic lives here

**Scale:**
- Hero: 44 / 68 — Mono, weight 500, tight tracking
- H1: 32 / 48 — Mono, 500
- Section label: 12 / 14 — Mono, 600, uppercase, `+0.08em` tracking (reads like a receipt line)
- Body: 16 / 17 — Söhne, 400, line-height 1.55
- Display number: 72 / 120 — Mono, 500

**Rule:** Every section gets a mono uppercase label above it ("PLAN DETAILS", "SAVINGS ESTIMATE", "WHAT I CAN'T DO"). This is the receipt aesthetic.

---

## Decision 3 — Nora

**Form:** No avatar. Nora is a typographic entity. Her messages appear as a labeled block — "NORA:" in mono, uppercase, orange — followed by body type. Like a transcript.
**Color signature:** Safety Orange label. That's it.
**Motion:** Text prints in, character by character, very fast (60ms per line). Like a dot-matrix printer caught up to modern speed. No bounce, no avatar animation.
**Personality adjectives:** Direct · Literate · Unsparing · Honest · Dry

**Nora DO/DON'T:**
- DO: "Your plan: Ambetter Essential 5. $412/mo. Found 7 cheaper. 3 under $200." · "Before I show you anything: I can't recommend plans in AL, AK, or HI."
- DON'T: Emojis · softening phrases · any phrase that could appear on a greeting card

---

## Decision 4 — Photography

**Direction:** Documents. Objects. Hands holding paper. Detail shots. Very few full human portraits — when there is a person, they are cropped tight (just hands, just a shoulder). The hero aesthetic is "the thing on the table."

**Treatment:** High-contrast, desaturated, slight scanner-bed artifacts preserved. Almost forensic.

**Per persona:**
- RU-1: a termination letter being unfolded
- SP-1: a 1099 stack, a laptop keyboard, a coffee cup — all cropped tight
- BR-1: Medicare comparison guide paper, a highlighter, a calendar
- CL-1: the renewal letter itself, a pen, a highlighted premium number
- PC-1: an insurance card held up to the light, a magnifying glass optional

**Reference brands:** Robinhood's early dividend feature, Figma's release photography, Bloomberg Businessweek covers, Wirecutter's product shots, Apple's Files app marketing.

**Rule:** We don't show happy families. We show *documents handled confidently*.

---

## Decision 5 — Voice

**10-line style guide:**
1. State the fact. Don't frame it.
2. Numbers before adjectives. Always.
3. Name limits before benefits. Every time.
4. Use line items, not paragraphs, when a list will do.
5. Use mono type for every number, plan name, and CTA.
6. No em-dashes as drama. No ellipses as suspense.
7. Say "You pay." Say "You save." Not "potentially" or "up to."
8. If a sentence could be a bullet, make it a bullet.
9. When in doubt, sound like a well-written receipt.
10. Legal disclosures are features, not fine print. Put them in the hero when relevant.

**Example rewrites:**
- ❌ "Discover savings on health insurance tailored to you!"
- ✅ "Scan your card. See what 7 other plans in your state cost."
- ❌ "Our trusted AI assistant helps guide you through enrollment."
- ✅ "Nora can help in 43 states. Not AL, AK, HI, or NV. Licensed human otherwise."
- ❌ "You could save up to $2,500 per year!"
- ✅ "Members pay $2,100/yr less on average. 7 plans available in your state."

---

## Persona register

- **RU-1:** Tighten the orange. Bigger premium number. Add "You lost coverage on [date]" as an opening fact.
- **SP-1:** This is their native register. No adjustments needed.
- **BR-1:** Slow the density slightly. Add more line breaks. Never warm the tone — but leave white space.
- **CL-1:** *Lead with their letter.* "Your premium: $X. Your new premium: $Y. Difference: $Z." This is the direction's home court.
- **PC-1:** Reframe the honesty as a diagnostic. "Your plan might be fine. Let's check. 30 seconds."

---

## Sample moment — Savings Reveal Card

```
SAVINGS ESTIMATE —————————————————————

Your current plan
Ambetter Essential Care 5        $412/mo

Found in your state (Texas)
7 plans                          starting at
                                  $183/mo

────────────────────────────────
You could pay                    $229/mo
                                  less
                                  = $2,748/yr

[ SHOW ME THE PLANS → ]

NORA: I have your income and household
on file. The subsidy math is already
built into these numbers.
```

Manila background. Safety Orange on `$229/mo`. Every number in Mono. Hairline rules.

---

## Stitch promptability — very high

Receipt is the most Stitch-native direction. The rules are structural:
- "Document layout, monospace display, manila background, hairline rules, every section has a mono uppercase label"
- Stitch generates this cleanly — it's literally a structural aesthetic

---

## Risk

- **"Looks ugly"** — some people will see this and read it as un-designed. That's also the point. Requires brave leadership to defend.
- **Can feel cold for BR-1** — mitigate with pacing (more whitespace, slower motion), not warmth (don't break the system).
- **Hard to pivot away from** — this is a committed aesthetic. If we decide in 18 months we want to be "warm friendly Oscar," we're rebuilding.
- **May feel too fintech** — safety orange + mono is GoodRx/Robinhood-adjacent. Defensible because we're the only health brand doing it, but the adjacency exists.

---

## Best suited for

CL-1 (angry, document-forward — this is their direction), SP-1 (skeptical, data-forward), RU-1 (loss-framed, no BS). Works for BR-1 and PC-1 with register adjustments, but not their home court.

## Works against

Any persona that wants to be held, not handled. If our research shows BR-1 needs a softer embrace, this direction stresses for them.
