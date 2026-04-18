# Shophealthcare — Brand Directions Handoff

## What this is

A browseable gallery of **16 homepage brand directions** for Shophealthcare, each with two variants:

- **v1 · Free** — full content density, conceptual reframing permitted (e.g. "Open a case" in place of literal wireframe labels).
- **v2 · Wireframe-loyal** — strict wireframe skeleton with canonical copy labels ("I just lost my health insurance", "Meet Nora — Your Licensed Enrollment Assistant", "01 SCAN OR SEARCH / 02 COMPARE / 03 ENROLL", stats row, "The navigator void"). Creative drift expressed only through type, color, and texture.

## How to view

Open [`index.html`](index.html) in a browser. Use the toolbar:
- **VIEW** — Grid 2-up / Grid 3-up / One at a time
- **VERSION** — v1 Free / v2 Wireframe-loyal
- **DIRECTION** — All, or filter to a single direction

Each card has **Open full** (new tab) and **Focus** (fullscreen in place).

## Directions

| # | Name | Lineage |
|---|------|---------|
| 01 | Calm Hand | Editorial, GT Sectra + Inter, paper + ledger green |
| 02 | Receipt | Document-forward, mono everywhere, manila + safety orange |
| 03 | Public Service | Civic wayfinding, deep teal + sunlit yellow |
| 04 | Protest | Activist poster, alarm red + hi-vis yellow |
| 05 | Receipt × Bridge | Receipt tuned for 55–64, adds Agent Blue |
| 06 | Tape | Evidence room, case-file dossier |
| 07 | Atlas | Cartographic, topographic chart |
| 08 | Score | Credit-Karma-style, indigo/violet on navy |
| 09 | Broadcast | Public-radio station WSHC |
| 10 | Vitals | Clinical bedside monitor |
| 11 | Clinic | Hims/Hers warmth, peach + editorial consult |
| 12 | Lemon | Lemonade playful, blush + lemon + pink |
| 13 | **Margin** | Cost Plus Drugs × Keeper × Robinhood cards × Bloomberg — margin-transparency-as-hero, formula UI |
| 14 | **Guide** | Devoted Guides × One Medical × Alan × Headspace — named human concierge, membership-artifact warmth |
| 15 | **Prompt** | Hinge prompts × Warby Parker quiz × Root custom type × Notion editorial — intake as self-expression |
| 16 | **Dashboard** | Marble × Linear × Ramp × Robinhood card-stack — year-round SaaS dashboard as the brand |

## File structure

```
Claude Design Pass/
├── index.html                       # Gallery viewer
├── directions/
│   ├── 01-calm-hand.html            # v1 · Free
│   ├── 01-calm-hand-v2.html         # v2 · Wireframe-loyal
│   ├── ...                          # (same pattern through 16)
│   ├── 13-margin.html               # v1 · Free  (NEW — replaces 13 Agent)
│   ├── 13-margin-v2.html            # v2 · Wireframe-loyal
│   ├── 14-guide.html                # v1 · Free  (NEW — replaces 14 Diagram)
│   ├── 14-guide-v2.html             # v2 · Wireframe-loyal
│   ├── 15-prompt.html               # v1 · Free  (NEW)
│   ├── 15-prompt-v2.html            # v2 · Wireframe-loyal
│   ├── 16-dashboard.html            # v1 · Free  (NEW)
│   └── 16-dashboard-v2.html         # v2 · Wireframe-loyal
├── design_package/                  # Original handoff bundle from Claude Design
│   └── shophealthcare-prototypes/
│       ├── README.md                # Original bundle readme
│       ├── chats/chat1.md           # Full design conversation
│       └── project/
│           └── uploads/
│               ├── shophealthcare-design-thesis.md   # Design thesis
│               ├── homepage.png                      # Wireframe reference
│               └── page2.png                         # Bridge page wireframe
└── HANDOFF.md                       # This file
```

## Wireframe skeleton (v2 contract)

All v2 directions follow this exact section order with the exact copy labels:

1. **Announce bar** — "ACA OPEN ENROLLMENT IS LIVE — ENDS JAN 15 · CHECK YOUR SUBSIDY"
2. **Nav** — Wordmark + `STATE LICENSED BROKERAGE` / `NPN #19482230` + links + CTAs
3. **Crumb** — `HOME / SHOPHEALTHCARE`
4. **Hero** — two-col: headline left ("Health insurance was never built for the way you *work.* We fixed that.") + illustration slot right + lede + two CTAs
5. **Nora chip** — `Nora · Licensed enrollment assistant · ACTIVE · 2:04 AVG RESPONSE`
6. **Situations grid** — 5 literal labels + 1 overflow ("None of these fit")
7. **Phone row** — `(800) 555-0198` + 90-second check link
8. **Nora section** — two-col: "Meet Nora — Your Licensed Enrollment Assistant." + three paragraphs + Nora illustration slot
9. **Nora link** — "See exactly what Nora can and can't do → Methodology & Limitations"
10. **Process** — 01 SCAN OR SEARCH / 02 COMPARE / 03 ENROLL
11. **Stats** — PLANS COMPARED 1.2M+ / LICENSED DIRECTORS 180+ / HIPAA-AUDIT ENCRYPTION 256-BIT / COST $0.00
12. **Navigator void** — "The navigator void, and why Nora exists."
13. **Footer** — four-col: wordmark/tag, CONTACT, LEGAL, COMPLIANCE

## New direction specs (13–16)

### 13 · Margin
- **Combo:** Cost Plus Drugs (radical margin transparency) × Keeper ($1,249 overpayment anchor) × Robinhood cards (reveal beats) × Bloomberg terminal density
- **The move:** The formula IS the hero UI — `(Premium × 12) + (Expected OOP) + (Deductible Risk) − Subsidy = Your Real Cost`. Broker commission shown inline, not buried.
- **Palette:** Cost Plus cobalt `#0A1F7D` · paper `#FAFAF7` · strike-through red `#E5261F` · ink `#0C0F14`
- **Type:** Neue Haas Grotesk Display (or Inter Display) + heavy tabular mono (JetBrains Mono) for all numerics
- **Personas:** SP-1 primary (financially literate), CL-1 secondary
- **Whitespace:** Nobody in insurance shows broker commission on the homepage. That's the single most credible anti-scam signal available in 2026.

### 14 · Guide
- **Combo:** Devoted Health Guides × One Medical membership × Alan (French chat-first) × Headspace warmth
- **The move:** Membership-artifact healthcare brand. A named human Guide lives in the hero with a real photo, direct line, `est. 2026` card. The whole site feels like joining, not buying.
- **Palette:** Membership cream `#F6F0E4` · forest `#1E3A2C` · terracotta `#C9683D` · ink `#141611`
- **Type:** GT Walsheim (or Söhne) body + soft humanist serif (Canela / Freight Display) for the Guide's byline
- **Personas:** BR-1 primary (concierge warmth for 55–64), RU-1 secondary (warmth destigmatizes fear)
- **Whitespace:** No ACA broker combines illustrated warmth + named Guide + membership artifact. Devoted owns this for Medicare; this is the ACA version.

### 15 · Prompt
- **Combo:** Hinge prompts × Warby Parker quiz × Root commissioned typeface × Notion editorial
- **The move:** Intake as self-expression, not a form. Homepage is a scrollable stack of fillable prompts: *"The last medical bill I didn't understand was…" / "I pay $___ a month and I don't know why."* Filling the one that resonates IS the persona segmentation. Savings Reveal is a Warby-style 3-frame curated shortlist.
- **Palette:** Off-white `#F4EEE5` · ink `#141413` · electric lime accent `#CFFF4C`
- **Type:** Chunky humanist serif (Migra, Editorial New, or Söhne Breit) + mono for fill-ins
- **Personas:** SP-1 creatives + PC-1 curiosity
- **Whitespace:** Every insurance intake is a TurboTax clone. Dating-app/DTC prompt language is the generational unlock for under-40 users.

### 16 · Dashboard
- **Combo:** Marble (year-round wallet) × Linear (product page taste) × Ramp (light-mode fintech) × Robinhood card-stack
- **The move:** Reframe the category from seasonal tool to year-round dashboard. The homepage IS a demo of the logged-in product — live coverage dashboard, card-stack reveals, plan-change alerts, subsidy monitors, "last checked" timestamps. Light mode mandatory.
- **Palette:** Canvas `#FAFAFB` · Operator blue `#0064F0` · state-indicator hits (green `#10B981`, amber `#F59E0B`)
- **Type:** Inter (or Söhne) body + JetBrains Mono for numerics
- **Personas:** SP-1 ops segment primary, PC-1 secondary (continuous check-up)
- **Whitespace:** Nobody renders health insurance as a monitorable SaaS product. Marble tried and stayed small because they used insurance aesthetics. Linear/Mercury rendering makes this the category's first real SaaS-taste brand.

## Recent changes

- **Directions 13 & 14 replaced** (2026-04-18). Old Agent and Diagram concepts killed. New combos (Margin, Guide, Prompt, Dashboard) built from unclaimed Notion workspace references.
- **Gallery expanded from 14 to 16 directions** with the addition of 15 Prompt and 16 Dashboard.

## Next steps

1. **Pick 2–3 winners** from the 16. Kill or merge the rest.
2. **Develop the winners** into:
   - Bridge page (55–64 secondary landing — wireframe `page2.png`)
   - Mobile breakpoint
   - Component set (nav, cards, forms, Nora chip, CTA primitives)
3. **Copy tightening pass** once a direction is chosen.
4. **Production implementation** — these are HTML/CSS prototypes, not production code. Recreate pixel-perfectly in the target stack (React/Vue/native). Don't copy the prototype DOM; match the visual output.

## References

- **Design thesis** — [`design_package/shophealthcare-prototypes/project/uploads/shophealthcare-design-thesis.md`](design_package/shophealthcare-prototypes/project/uploads/shophealthcare-design-thesis.md) — personas (RU-1, CL-1, PC-1, SP-1, etc.), loss framing, analog brands, anchor numbers.
- **Conversation history** — [`design_package/shophealthcare-prototypes/chats/chat1.md`](design_package/shophealthcare-prototypes/chats/chat1.md) — full iterative history including v1/v2 distinction reasoning.
- **Wireframes** — [`design_package/shophealthcare-prototypes/project/uploads/homepage.png`](design_package/shophealthcare-prototypes/project/uploads/homepage.png) and [`page2.png`](design_package/shophealthcare-prototypes/project/uploads/page2.png).
- **Notion workspace** — Brand & FE Decision Brief + 35-company competitive teardown; source of Cost Plus Drugs / Keeper / Alan / Marble / Hinge / Robinhood refs that seeded 13–16.

## Contact

Handed off from Claude Design session, 2026-04-18.
