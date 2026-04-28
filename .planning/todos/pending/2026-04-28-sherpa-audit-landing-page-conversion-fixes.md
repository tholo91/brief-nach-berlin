---
created: 2026-04-28T00:00:00.000Z
title: Sherpa Audit — Landing Page Conversion Fixes
area: frontend / copy / visuals
source: https://www.withsherpa.ai/audit/brief-nach-berlin.de
files:
  - web/src/app/page.tsx
  - web/src/components/landing/*
---

## Context

Sherpa Conversion Audit Scores:
- Visual Hierarchy: **82/100**
- CTA Clarity: **78/100**
- Trust Signals: **58/100** ← biggest gap

Strengths to preserve: Headline ("Dein persönliches Anliegen. Direkt an die Politik"), CTA copy ("In 3 Minuten zum fertigen Brief"), 3-Step "So einfach geht's", 9.260-Petitionen Stat.

---

## Quick Wins (≤30 min each — do these first tomorrow)

### 1. Final CTA Reassurance Micro-Copy
**Where:** Bottom CTA button, [web/src/app/page.tsx]
**Change:** Add subtitle/microcopy under final CTA: `Kostenlos · In 3 Minuten · Ohne Anmeldung`
**Why:** Last-chance trust nudge before bounce.

### 2. Specify Secondary CTA
**Where:** Hero section secondary button
**Change:** "Mehr erfahren" → `Beispiel-Brief ansehen`
**Why:** Concrete > generic. Sets expectation.

### 3. Reduce Choice Paralysis in "Unterstützen, mitmachen, mitgestalten"
**Where:** 4-CTA section
**Change:** Funnel toward letter-writing as primary. Demote 3 others to text links or move into footer/secondary block.
**Why:** Four equal-weight CTAs dilute focus → drops conversion.

### 4. Enlarge Trust Badges
**Where:** DSGVO/Privacy badges
**Change:** Bigger size, possibly add "Made in Germany" / "Open Source" / "Kein Tracking" indicators.
**Why:** German users weight privacy heavily; current badges are undersized.

---

## Medium Tasks (require new assets/copy — plan together)

### 5. Replace Watercolor Hero with Action Imagery
**Current:** Faded watercolor → reads passive
**Target:** Person writing a letter at a desk / hand-addressed envelope / letter slot at Bundestag
**Approach:** Generate 2–3 candidates in Ghibli-style solarpunk Berlin direction (per [visual-direction memory]).
**See "Image & Mockup Sourcing" section below.**

### 6. Verify or Remove Thomas Laezer Quote
**Where:** Quote section
**Decision needed:** Add photo + title + role (LinkedIn link?), OR remove quote entirely.
**Why:** Unattributed quotes hurt trust more than they help.

### 7. Surface Founder Credentials (Bundestag background)
**Add:** Founder photo, LinkedIn, any press mentions, role/dates of Bundestag work.
**Where:** "Über uns" / Founder block on landing page.

---

## High-Leverage But Blocked on Validation

### 8. Real User Testimonials
**Goal:** 3–5 quotes "Ich schrieb über X, bekam Y zurück"
**Blocker:** Need actual users with stories. → This is a validation task, not a design task.
**Action for Thomas:** Identify the first 5 users who'd give a quote. If you can't name them, that's the priority before more landing-page polish.

---

## Image & Mockup Sourcing — Tooling Plan

### Stock Photos (free, fastest path)
- **Unsplash** — search: `writing letter`, `german parliament`, `Bundestag`, `handwritten letter`, `Berlin Reichstag`
- **Pexels** — fallback for portraits/lifestyle
- **Note:** Avoid generic "office/laptop" stock. Look for warm, human, hand-on-paper imagery to match brand.

### App Mockups & Screenshots (Claude Code Skills to evaluate)
Found via research — install the one that fits best, then run a session to generate marketing visuals:

1. **Sketch — AI Visual Design & UI Mockups**
   https://mcpmarket.com/tools/skills/sketch-visual-design
   Describes screens in plain language → renders UI mockups + HTML/CSS. Best fit for "show the app in action" hero/section visuals.

2. **App Screenshots (alexop.dev)**
   https://alexop.dev/posts/app-screenshots-claude-code-skill/
   Annotated screenshots of live web app → markdown visual guide. Good for "So einfach geht's" step illustrations using real product screens.

3. **App Store Screenshots (ScreenshotWhale)**
   https://screenshotwhale.com/blog/generate-app-store-screenshots-with-claude-code
   More mobile-app focused but pattern transfers — guided generation in ~5 min.

4. **Claude Design (Anthropic Labs)**
   https://www.anthropic.com/news/claude-design-anthropic-labs
   Web capture tool can grab elements directly from brief-nach-berlin.de → mockup variations stay on-brand.

5. **Already installed:** `frontend-design` skill (invoke `/frontend-design`) — useful for new component variations on the landing page itself.

### Custom Illustrations (Ghibli-Solarpunk direction)
Per existing [visual-direction memory] — image-first workflow already established. Generate via:
- ChatGPT/Sora image gen with the established Ghibli-solarpunk Berlin prompt
- Mid-journey if quality bar requires
- Keep faded-watercolor-ish but with **action** (person writing, letter dropping, hand on envelope)

---

## Tomorrow's Execution Order (proposed)

1. **30 min** — Quick Wins #1, #2, #3, #4 (copy + layout only)
2. **30 min** — Install + try ONE mockup skill (recommend Sketch first), generate 2 product-screen visuals
3. **30 min** — Generate 2 hero-image candidates (Ghibli-solarpunk, action-focused)
4. **15 min** — Decide on Laezer quote (verify or kill)
5. Commit incrementally per /gsd:quick

Testimonials (#8) and full founder block (#7) → separate session, depends on validation outreach.
