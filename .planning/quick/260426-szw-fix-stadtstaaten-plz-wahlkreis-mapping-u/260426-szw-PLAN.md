---
quick_id: 260426-szw
description: Fix Stadtstaaten PLZ-Wahlkreis mapping + UI auto-scroll + grid layout
status: in-progress
date: 2026-04-26
---

# Quick Task 260426-szw: Fix Stadtstaaten PLZ→Wahlkreis mapping + UI polish

## Problem

PLZ 10997 (Berlin Kreuzberg) currently maps to all 12 Berlin Wahlkreise [74-85] instead of just Wahlkreis 82 (Pascal Meiser, Die Linke). Users see ~15 politicians in the disambiguation step, drowning the actual representative.

Root cause: `parse-plz-mapping.ts` joins Geonames ↔ Bundeswahlleiter via AGS-5 (5-digit Kreis code). For Berlin/Hamburg/Bremen all Wahlkreise share one AGS-5 (Stadtstaat = single Kreis). The Bundeswahlleiter CSV doesn't expose Bezirk-level data.

Geonames has the Bezirk in `placeName` ("Berlin Kreuzberg"). We can use it.

## Tasks

### Task 1 — Stadtstaaten Bezirk lookup
- Files: `web/data/raw/stadtstaaten-bezirke.json` (new)
- Action: Hand-curated `{ "Berlin Kreuzberg": [82], "Berlin Mitte": [75, 76], ... }` for ~24 Bezirke (Berlin: 12 Bezirke → ~15 PLZ-relevant subdivisions, Hamburg: 7, Bremen: 2). Source: Bundestag Wahlkreissuche.
- Verify: file exists, valid JSON, all 12 Berliner Wahlkreise (75-86) covered, Hamburg (18-23), Bremen (54-55).
- Done: `cat web/data/raw/stadtstaaten-bezirke.json | jq 'keys | length' >= 24`

### Task 2 — parse-plz-mapping.ts integration
- Files: `web/scripts/parse-plz-mapping.ts`
- Action: For Geonames rows with admin3Code in `{11000, 02000, 04011}`, extract Bezirk from placeName (e.g. "Berlin Kreuzberg" → "Berlin Kreuzberg") and look up in stadtstaaten-bezirke.json. If found, use as authoritative; otherwise fall back to existing logic.
- Verify: run script, check output for 10997.
- Done: `jq '.["10997"]' web/data/plz-wahlkreis-mapping.json` returns `[82]`.

### Task 3 — Regenerate mapping
- Files: `web/data/plz-wahlkreis-mapping.json`
- Action: `npm run build:plz` from web/
- Verify: spot checks for Berlin (10997, 10115), Hamburg (20095), Bremen (28195), and a non-Stadtstaat (47167) to ensure no regression.
- Done: PLZ 10997 → [82], PLZ 47167 unchanged.

### Task 4 — UI: auto-scroll on select
- Files: `web/src/components/wizard/Step3Success.tsx`
- Action: After `setSelectedPoliticianId(p.id)`, scroll the submit button into view smoothly (`block: "center"`). Use a ref on the submit button.
- Verify: Manual click in dev server.
- Done: Selecting a card scrolls "Brief erstellen" into view.

### Task 5 — UI: 2-column grid for >5
- Files: `web/src/components/wizard/Step3Success.tsx`
- Action: Wrap politician cards in `grid grid-cols-1 md:grid-cols-2 gap-3` when `sortedPoliticians.length > 5`; otherwise keep `space-y-3`.
- Verify: Manual rendering check (mock or via dev with a multi-Wahlkreis PLZ).
- Done: 6+ politicians render in 2-column responsive grid.

### Task 6 — Verify Bremen WK 54
- Files: `web/data/politicians-cache.json` (read-only check)
- Action: Confirm if WK 54 having no isDirect entry is a true Wahlrechtsreform-2025 unbesetzt slot or a cache gap.
- Done: Documented in SUMMARY.md.

## must_haves

- truths:
  - PLZ 10997 maps to exactly [82]
  - PLZ 47167 (Duisburg) mapping unchanged after script rerun
  - Auto-scroll triggers on every politician card selection
  - Grid layout activates only when politicians.length > 5
- artifacts:
  - `web/data/raw/stadtstaaten-bezirke.json`
  - `web/data/plz-wahlkreis-mapping.json` (regenerated)
  - Updated `web/scripts/parse-plz-mapping.ts`
  - Updated `web/src/components/wizard/Step3Success.tsx`
- key_links:
  - https://www.bundestag.de/abgeordnete/wahlkreissuche
