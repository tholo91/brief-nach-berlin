---
created: "2026-04-14T09:18:20.664Z"
title: "v2: Tone slider for letter undertone"
area: ui
files:
  - web/src/lib/generation/generateLetter.ts
  - web/src/components/wizard/Step2Issue.tsx
---

## Problem

The current letter generation has a fixed tone ("sachlich, respektvoll, auf Augenhöhe"). Users have no control over how assertive or gentle the letter sounds. Some issues call for diplomatic language, others for firm demands. Additionally, users may want to influence whether the framing leans more conservative or progressive.

## Solution

Add a drag/slider UI element (likely on Step2Issue or a new sub-step) that lets users set:
1. **Undertone**: spectrum from "freundlich" (diplomatic) to "nachdrücklich" (assertively demanding)
2. **Optional framing**: conservative vs. progressive angle on the same issue

The slider value gets passed to the generateLetter prompt as an additional instruction modifying tone/framing. The system prompt adjusts its language intensity accordingly (e.g., "Ich bitte Sie..." vs. "Ich erwarte von meinem Abgeordneten...").

Design consideration: keep it simple — one slider, not a control panel. Labels at each end, maybe 3-5 stops with descriptive words.
