# Lemon Direction · Specs & Briefs

This directory holds the canonical design specs, briefs, and source-of-truth documents that drive the Lemon-direction work (V11+ homepages and the V21 Nora app).

## Files

| File | What it is | Last updated |
|---|---|---|
| `quiz-app-capture-flow.md` | V20+ build spec for the user journey from homepage tile click through carrier checkout. Wires together persona context, quiz, value reveal, Nora app, card scan, email capture, and post-purchase. | 2026-04-29 |
| `nora-app-design-brief.md` | Build-ready design brief for the V21 Nora app. 18 sections, 80+ acceptance criteria, 6-milestone build plan, full backend integration spec for Eugenio. ~700 lines. **Hand this to Claude Design.** | 2026-04-29 |
| `scott-sales-logic.md` | Scott's *Internal Insurance Education Brief* (Apr-13) translated into a structured working doc — products, qualification flow, state matrix, segments, Plan 01 / Catalog routing rules. Drives every page's CTA + qualifying copy + Nora's discovery questions. | 2026-04-22 |

## Reading order (for someone new to the project)

1. **`scott-sales-logic.md`** — what we're actually selling, who's eligible, how routing works
2. **`quiz-app-capture-flow.md`** — the user journey at a glance + persona context contract
3. **`nora-app-design-brief.md`** — full build spec for the V21 Nora app (consumes the persona context)

## Cross-references

- **Live homepage:** `directions/21-lemon/index.html` (V19) · V20 at `homepage-v20-persona-quiz.html`
- **V21 Nora app:** `directions/21-lemon/nora-app/?p=SP1&s=TX&a=35&x=M&pg=0&c=none`
- **Brand voice skill** (auto-applied by AI agents): `~/.claude/skills/shophealthcare-voice/`
- **Notion mirrors:**
  - [Quiz / App / Contact Capture Flow](https://app.notion.com/p/35226136b372810b810ae7a03d0b2e92)
  - [Nora App Design Brief](https://app.notion.com/p/35226136b372813a8df2e9fb77315b72)
  - [Design Decisions — V19→V20](https://app.notion.com/p/35126136b372816599dfd00a939ff88d)
  - [Brand & FE Decision Brief](https://app.notion.com/p/33d26136b3728140ba2ef19d7968d71a)

## Convention

These markdown files are **the canonical source of truth**. The Notion mirrors and any HTML/CSS/JS in `directions/21-lemon/` follow them, not the other way around.

When updating: edit the markdown here first, commit it, then propagate changes to Notion + code.
