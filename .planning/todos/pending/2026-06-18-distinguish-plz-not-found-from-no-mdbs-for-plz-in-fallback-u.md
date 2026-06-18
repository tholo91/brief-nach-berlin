---
created: 2026-06-18T13:48:00.345Z
title: Distinguish PLZ-not-found from no-MdBs-for-PLZ in fallback UI
area: ui
files:
  - web/src/components/wizard/Step3Success.tsx:83-86
  - web/src/lib/lookup/plzLookup.ts:26-43
---

## Problem

Both "PLZ not in our mapping" and "PLZ found but no politicians in cache" currently collapse into the same `isNoMdbFound` fallback UI in `Step3Success.tsx`. They have different root causes and call for different user actions:

- **Case A** (`wahlkreisId === 0`): PLZ not found at all — likely a typo. Right CTA: "PLZ korrigieren" (trigger `onChangePlz`).
- **Case B** (`wahlkreisId > 0`, id === -1): PLZ is valid, our data is stale/incomplete. Right CTA: keep "MdB später auswählen".

## Solution

Split `isNoMdbFound` into two signals in `Step3Success.tsx`:

```ts
const isPlzUnknown     = isNoMdbFound && politicians[0].wahlkreisId === 0;
const isMdbDataMissing = isNoMdbFound && politicians[0].wahlkreisId > 0;
```

- Case A description: "Die PLZ {plz} haben wir nicht erkannt. Bitte prüfe deine Eingabe oder passe die PLZ an." — show prominent "PLZ ändern" button (calls `onChangePlz`)
- Case B description: current text ("Für die PLZ … haben wir kein MdB gefunden…") — unchanged

No server/data changes needed — the signal is already in the fallback shape from `plzLookup.ts`.
