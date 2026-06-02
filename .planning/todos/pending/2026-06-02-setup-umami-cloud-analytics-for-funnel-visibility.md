---
created: 2026-06-02T20:50:16.197Z
title: Setup Umami Cloud analytics for funnel visibility
area: general
files:
  - web/src/app/layout.tsx
  - web/src/components/wizard/Step1Form.tsx
  - web/src/components/wizard/Step1bOptional.tsx
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/components/wizard/Step3Success.tsx
  - web/src/app/api/generate-letter/route.ts
  - web/src/app/(site)/datenschutz/page.tsx
---

## Problem

Vercel Free tier only retains roughly one hour of logs (downloadable), and even those are dominated by Next.js RSC link prefetches rather than real navigations. The conversion analysis on 2026-06-02 found that 85% of Vercel log rows in a 3-hour slice were `_rsc=…` prefetches, with only ~20 real sessions inferable. This makes it effectively impossible to see how visitors actually move through the funnel — landing → wizard → letter generated — across a normal week.

Without funnel visibility, every optimisation hypothesis (CTA copy, page reorganisation, /beispiele changes, hero rewrites) is a guess. We need step-level data: how many sessions enter Step 1, how many reach Step 2, how many trigger letter generation, where they fall off.

The current architecture is deliberately analytics-free for DSGVO/trust reasons. Whatever we add must respect that promise.

## Solution

**Use Umami Cloud (free tier, cookieless, DSGVO-friendly, EU-hosted option).**

Why Umami specifically:
- Free tier: 100k events/month, 1 website — plenty for current traffic.
- Cookieless by design — no consent banner trigger.
- Supports custom events (`umami.track("event_name")`) — exactly what funnel measurement needs.
- EU hosting option keeps data residency clean.
- Lower-overhead alternative to Cloudflare Web Analytics, which is also free but lacks custom events.

Steps:
1. Sign up at umami.is, create one website for brief-nach-berlin.de.
2. Add the Umami script tag to `web/src/app/layout.tsx` (or just the landing+app routes).
3. Instrument wizard milestones with `umami.track(...)` calls:
   - `step1_entered` — on Step1Form mount
   - `step2_entered` — on Step2Issue mount
   - `step3_entered` — on Step3Success mount
   - `letter_generated` — on successful `/api/generate-letter` response
4. Update `web/src/app/(site)/datenschutz/page.tsx` to disclose Umami (cookieless mode, no PII).
5. After 1 week of data: read the funnel in Umami's dashboard and decide on landing/CTA changes.

Related: see [[2026-04-18-feedback-letter-quality-collection-without-breaking-privacy-]] — that todo covers per-letter feedback (different purpose). Umami covers aggregate funnel, not letter quality.

Trigger context: 2026-06-02 conversion-analysis session against Vercel CSV `Logs nach Berlin Juni 2026.csv`. Findings: real funnel was 19 landings → 4 wizard sessions → 3 generate-letter calls, but RSC noise made this almost unrecoverable from raw logs.
