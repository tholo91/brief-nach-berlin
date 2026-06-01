---
phase: quick-260601-jts
plan: 01
subsystem: wizard/Step1Form
tags: [ux, plz, locality-hint, openplzapi]
dependency_graph:
  requires: []
  provides: [plz-locality-hint]
  affects: [web/src/components/wizard/Step1Form.tsx]
tech_stack:
  added: []
  patterns: [native-fetch, AbortController, useEffect-watch-pattern]
key_files:
  modified:
    - web/src/components/wizard/Step1Form.tsx
decisions:
  - Used native fetch + useEffect with AbortController (no new deps, no SWR/axios)
  - Silent fail on all error paths — feature is purely additive
  - No loading spinner — matches "dezent" requirement, lookup is fast enough
  - text-warmgrau/70 chosen over /60 so locality reads as sibling info, slightly more present than the static hint
metrics:
  duration: ~10min
  completed: "2026-06-01"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260601-jts Summary

**One-liner:** Live Ort/Ortsteil confirmation hint below the PLZ input, fetched from openplzapi.org once 5 digits are entered, with AbortController stale-response guard and silent fail on all error paths.

## What Was Done

Added locality lookup to `Step1Form.tsx`. When the user types exactly 5 digits into the PLZ field, a `useEffect` fires a fetch to `https://openplzapi.org/de/Localities?postalCode=${plz}`. On success the Ort (and Ortsteil if present and distinct) appears in a styled hint below the existing static hint. The hint disappears immediately when the PLZ changes away from 5 valid digits.

### Diff Summary

**Imports added:**
```ts
import { useEffect, useState } from "react";
```

**Hook additions (after `useForm` destructure):**
```ts
const plzValue = watch("plz");
const [locality, setLocality] = useState<{ ort: string; ortsteil?: string } | null>(null);

useEffect(() => {
  if (!/^\d{5}$/.test(plzValue ?? "")) { setLocality(null); return; }
  const controller = new AbortController();
  (async () => { /* fetch + parse + setLocality */ })();
  return () => controller.abort();
}, [plzValue]);
```

**JSX insertion** (after `<p id="plz-hint">`, before error block):
```tsx
{locality && (
  <p id="plz-locality" className="font-body text-sm text-warmgrau/70 mt-1" aria-live="polite">
    {locality.ort}{locality.ortsteil ? ` · ${locality.ortsteil}` : ""}
  </p>
)}
```

**aria-describedby update:**
```ts
aria-describedby={
  errors.plz && touchedFields.plz
    ? "plz-error"
    : locality
      ? "plz-hint plz-locality"
      : "plz-hint"
}
```

## Behavior Under Each Case

| Case | Result |
|------|--------|
| PLZ < 5 digits | No hint shown |
| PLZ = 5 digits, valid code (e.g. "10115") | "Berlin" (or "Berlin · Mitte" if district present) |
| PLZ = 5 digits, unknown code (e.g. "00000") | Empty array from API, no hint shown |
| API returns non-200 | No hint, no error surfaced |
| Network offline | fetch throws, caught silently, no hint |
| User types 6th digit (maxLength prevents it) | n/a — maxLength=5 on input |
| User edits from 5 back to 4 digits | hint cleared immediately (regex test fails) |
| User types fast (new PLZ before response arrives) | AbortController cancels in-flight request, new lookup starts |

## openplzapi.org Response Shape Observations

Tested PLZs during development:
- **10115 (Berlin):** `name: "Berlin"`, `district: { name: "Mitte", ... }` — object shape with nested `name`. Locality hint: "Berlin · Mitte".
- **47169 (Duisburg):** `name: "Duisburg"`, `district: { name: "Marxloh", ... }` — same shape. Hint: "Duisburg · Marxloh".
- The `district` field is consistently an object `{ name: string, key: string }` in tested responses, not a bare string. The defensive parser handles both shapes for safety.
- Array may contain multiple entries for PLZs spanning multiple localities; we use `data[0]` (the first/primary result).

## Verification

- TypeScript: errors in `route.ts` are pre-existing (unrelated modified file in git status), not introduced by this task. Step1Form.tsx itself compiles cleanly.
- Lint: 0 errors on `Step1Form.tsx`. 1 warning from React Compiler plugin flagging `watch()` as non-memoizable — this is a known characteristic of react-hook-form's `watch()` API and was present before this task (any `watch()` usage triggers it).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes. The outbound fetch to openplzapi.org is client-side and carries no user PII (PLZ only, never stored).

## Self-Check

- [x] `web/src/components/wizard/Step1Form.tsx` modified and committed
- [x] Commit `98f50bb` exists: `feat(quick-260601-jts): show Ort/Ortsteil hint under PLZ input`
- [x] No file deletions in commit
- [x] Zero new dependencies in `web/package.json`

## Self-Check: PASSED
