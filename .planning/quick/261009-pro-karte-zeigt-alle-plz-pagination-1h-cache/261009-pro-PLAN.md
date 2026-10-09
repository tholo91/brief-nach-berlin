---
quick_id: 261009-pro
mode: quick
---

# Quick 261009-pro: Karte zeigt alle PLZ (Pagination + 1h-Cache), neuer Text, Waben-Story

## Context
`get_letter_signal_postcode_counts` returns one row per PLZ, `ORDER BY plz`. PostgREST caps responses at 1,000 rows, and `getPublicLetterMapData` makes a single call. As a result the landing map shows only PLZ 0xxxx up to roughly 7xxxx, and Bayern is missing. Fix the truncation now, keep the dot look, and cache harder so Supabase load (free tier) goes down. The hex-map plus aggregate table is written up as a story only.

## Task 1: Paginate + cache map data
Files: `web/src/lib/letterSignals/getPublicMapData.ts`, `web/src/__tests__/letterSignalMapRoute.test.ts`
- Loop `getServiceRoleClient().rpc("get_letter_signal_postcode_counts").range(from, from + PAGE_SIZE - 1)` with `PAGE_SIZE = 1000` until a page returns fewer than 1,000 rows. Throw on error, same as today.
- Wrap the aggregation in `unstable_cache` from `next/cache`, `revalidate: 3600`, with a tag. Follow the pattern in `web/src/lib/counter.ts` (`readLetterCount`). Keep the exported `getPublicLetterMapData()` signature and the existing x:y merge logic. Leave the route's CDN headers unchanged.
- Tests: mock `next/cache` `unstable_cache` as a passthrough, as `web/src/__tests__/counterCache.test.ts` does. Change the rpc mock so it returns an object with `.range` resolving `{data, error}`. Update the existing tests. Add a case: page 1 has 1,000 rows (e.g. generated valid PLZ that exist in plzMapPoints, or any rows; only the count matters), page 2 has 5 rows including an 8xxxx PLZ. Expect `.range` to be called exactly twice (0–999, 1000–1999), the 8xxxx point to be present, and `postcodeAreas` to cover all mapped rows.
- Verify: `cd web && npx jest src/__tests__/letterSignalMapRoute.test.ts`

## Task 2: Copy above the map
File: `web/src/components/letter-signals/LetterActivityCard.tsx`, line ~49
- Replace `{letterCount} Briefe aus {postcodeAreas}+ Orten` with the letter count followed by:
  - `<span className="sm:hidden">aus ganz Deutschland</span>`
  - `<span className="hidden sm:inline">aus Städten, Dörfern und Gemeinden</span>`
- Remove the hardcoded "+". Leave the map aria-label as is. Do not use em dashes in the copy.
- Verify: `cd web && npx jest` (all) + `npx tsc --noEmit`

## Task 3: Story todo (docs only)
File: `.planning/todos/pending/2026-10-09-wabenkarte-mit-aggregat-tabelle.md`. Match the format of `.planning/todos/pending/2026-10-08-supabase-migrationen-an-einem-ort.md`: frontmatter with created, title, area, severity, files, then `## Problem` and `## Solution`. Write it in German, without em dashes.
Content:
1. **Problem:** Point map becomes a cloud as numbers grow. The query reads exact PLZ counts and grows with every new PLZ.
2. **Idee:** On each contribution, also increment a hex cell in a new table `letter_signal_hex_counts (hex_id, x, y, count)` inside the same RPC as the insert (pattern: `increment_letter_counters`). The map reads only this table, returned as a single JSON value, so the 1,000-row limit never bites again.
3. **Haken:**
   - a. PLZ coordinates live only in TS (`plzMapPoints.generated.json`), so the hex must be computed in the server action and passed to the RPC.
   - b. The grid is fixed once chosen. Changing hex size later needs a rebuild from `letter_signals.plz`, so keep the PLZ there.
   - c. Deletion (`web/scripts/delete-letter-data-by-email.ts`) must decrement. A one-time backfill is needed.
   - d. Alternative: hex-binning in TS on the 1h-cached data with no new table. That is simpler; the table mainly adds privacy (the map never sees a PLZ) and scale.
4. **Design:** ~10 km hexes (`HEX_RADIUS` ≈ 1.8 units in the 180-unit viewBox), 4 opacity steps (1 / 2–3 / 4–9 / 10+), clipped to the Germany outline via `clipPath`. The own point stays red and exact. For the wizard's local append, snap to the hex.
5. **Entscheidung offen:** table vs. TS-only.
