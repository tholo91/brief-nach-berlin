---
created: 2026-06-02T20:55:00.000Z
title: v2 Landing wizard merge with voice input field
area: ui
files:
  - web/src/components/Hero.tsx
  - web/src/components/wizard/WizardShell.tsx
  - web/src/components/wizard/Step1Form.tsx
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/components/audio/VoiceRecorder.tsx
  - web/src/app/page.tsx
  - web/src/app/app/page.tsx
---

## Problem

The 2026-06-02 conversion analysis (Vercel logs) showed that the single biggest funnel leak is the boundary between the landing page (`/`) and the wizard route (`/app`). Roughly 79% of sessions that reach the landing page never enter the wizard. The navigation jump itself is the suspected drop-off cause — every click between a visitor and the first wizard action is friction.

Today's funnel:
1. Visitor lands on `/`.
2. Sees hero, CTAs, marketing content.
3. Clicks "Brief schreiben" → navigates to `/app`.
4. Starts Step 1 (PLZ + email).

Hypothesis: if the first interaction the visitor sees IS the wizard, the drop-off shrinks.

**Do NOT implement yet.** Thomas explicitly chose to keep the status quo and decide based on real funnel data from Umami (see [[2026-06-02-setup-umami-cloud-analytics-for-funnel-visibility]]) after at least one week of measurement.

## Solution

Rough sketch (Thomas's vision, captured for future reference):

- Visitor lands on `/`.
- Above the fold: a prominent text input field where the user can start typing their frustration directly. Placeholder text rotates like the current hero subheads ("Mir ist aufgefallen, dass…", etc.).
- The input has a **microphone icon on the right edge** for voice dictation (reuse the existing `VoiceRecorder` / `AudioRecorder` flow from Step 2).
- Once the user starts typing (or finishes recording), a "Weiter" button reveals the rest of the wizard inline: PLZ + email (Step 1), optional enrichment + tone slider (Step 1b), then generation.
- The marketing content (HowItWorks, WhyItWorks, Vision, Roadmap, FAQ, CallToAction, Marquee testimonials, LetterCounter) sits below the wizard for visitors who want to scroll instead of convert.
- `/app` route either: (a) becomes a redirect to `/#wizard` for backward compatibility, or (b) stays as a dedicated standalone wizard route for direct deep-linking.

Implementation considerations:
- WizardShell uses Server Actions and a client-side state machine — those can stay intact; only the mount location changes.
- SEO: ensure `/app` URL still resolves (redirect) so existing inbound links (Lage der Nation mention, Reddit posts, etc.) keep working.
- Voice-first vs text-first: the input field should treat both equally — voice transcription via Mistral Voxtral fills the same textarea.
- Mobile: the wizard input must NOT collide with the header CTA logic (`#hero-cta` IntersectionObserver in `Header.tsx`).
- Tonality check / disambiguation: happen after "Weiter" is clicked, exactly as today.

Decision gate before implementation:
1. Wait for at least 1 week of Umami funnel data.
2. If `landing → step1_entered` rate stays under ~30%, proceed with this redesign.
3. If it improves with smaller CTA/copy changes alone, deprioritise.

Risk level: medium. Layout-level rewrite of the landing page, but the wizard internals stay untouched. Most likely impact area: mobile layout, header sticky behaviour, and the negative-margin marquee section above the testimonials.
