---
quick_id: 261009-dl0
status: complete
branch: worktree-agent-a2bba0c0752c42305
worktree: /Users/thomas/Documents/Git Repos/brief-nach-berlin/.claude/worktrees/agent-a2bba0c0752c42305
plan_head_before: 100a57aedb5b38d4d72ed09f64c27782305ae7cd
plan_head_after: 258d94e
commits: 5
generated_file_bytes: 23742
---

# 261009-dl0: Bundesländer-Karte, Sprungleiste, gebündelte Fußnoten

Static Natural-Earth Bundesland SVG as a shared `BundeslandMap`, used on "Kampagne verwalten" (replaces the bar list) and on /stats (above the bar list). Second sticky header row with section links on verwalten. Footnotes bundled into one footer.

## Commits (branch worktree-agent-a2bba0c0752c42305, not pushed)
1. ee5b41a feat(kampagne): Bundesland-Geometrie aus Natural Earth als statisches SVG
2. 234a061 feat(kampagne): Bundesland-Key in den Herkunfts-Buckets
3. 2ea2d86 feat(kampagne): Bundesland-Karte statt Balkenliste, Fussnoten gebuendelt
4. 946c10a feat(kampagne): Sprungleiste als zweite Kopfzeile auf Kampagne verwalten
5. 258d94e feat(stats): Bundesland-Karte ueber der Balkenliste, Klick nutzt den Filterlink

## Generated file
`web/src/lib/campaigns/bundeslandMapGeometry.generated.ts`: 23,742 bytes (limit 30 KB), viewBox `0 0 164 220`, all 16 keys. Douglas-Peucker tolerance 0.3 (0.15 for BE/HB/HH, which are always kept). Rendered to PNG in headless Chrome: Berlin, Bremen (incl. Bremerhaven), Hamburg are visible.

## Checks (from web/)
- `npx jest` (full): 100 suites, 783 tests passed. `npx jest campaignCreatorStats`: 67 passed (2 new tests, 2 updated).
- `npx tsc --noEmit`: 4 errors, all in `src/__tests__/campaignTopicReset.test.ts` (TS7022/TS7024), a file not touched here. Pre-existing, not fixed (out of scope).
- `npm run lint`: 0 errors, 7 warnings, all in files not touched here.
- Not run: any browser/dev-server check (instructed).

## Deviations
1. **/stats map takes `hrefs` instead of `onSelect`.** `stats/page.tsx` is a server component and the list filters via links (`buildStatsHref`), so a callback prop cannot be passed. The map renders `<a href>` per state (keyboard-focusable) and uses `router.push`; cmd/ctrl/shift-click fall through to the normal link. The `useRouter` hook lives in a small `MapLink` sub-component so the creator mode (no hrefs) renders without a router (tests).
2. **Sprungleiste lives in `verwalten/page.tsx`, not in `CampaignManager`.** `CampaignBackground` has `overflow-hidden`, which breaks `position: sticky`. The nav is rendered as a sibling before `CampaignBackground`, directly under the AppHeader. Only shown for the non-"awaiting approval" view.
3. **Header offset is measured, not hardcoded.** `SectionNav variant="header" stickyBelow="[data-app-header]"` reads the AppHeader height via ResizeObserver (fallback `top-[4.25rem]` before measuring). Added `data-app-header` to the `<header>` in `AppHeader.tsx`.
4. **Ids:** instead of `campaign-share-heading` the nav links to new section ids `campaign-share`, `creator-stats`, `creator-donation`, `campaign-settings` (all with `scroll-mt-32`). "Einstellungen" opens the `<details>` generically: SectionNav sets `open = true` when the link target is a `<details>`; the existing `onToggle` syncs `editOpen`.
5. **Nav look:** header variant uses `font-body text-sm` links with an underline for the active section (matches the /ngo-briefkampagne header links, no uppercase typewriter pills). The "↑" link is omitted in this variant. /stats uses the unchanged default variant.
6. **Legend rest line:** "+ n weitere" for /stats; in creator mode with a merged "Weitere Bundesländer" bucket it reads "+ n weitere und kleinere Länder" (or just "Weitere Bundesländer" when no named state is left), percent covers the whole rest.
7. **Verlauf height:** `Timeline` is now `flex h-full flex-col` with the chart `min-h-24 flex-1`, so on md+ the Verlauf column stretches to the region column and both end flush. Bars use percent heights inside that flex-grown box; needs a browser look.
8. **SUMMARY location:** the Write tool refused the shared-checkout path for this file, so it sits in the worktree at `.planning/quick/261009-dl0-.../261009-dl0-SUMMARY.md` (untracked, not committed).

## Copy added (no dashes)
Hover line `Bayern: 31 Briefe · 17 %`, default hint "Bundesland berühren für die Zahl.", "grau = unter 5 Briefe" (creator only), aria-label "Karte der Bundesländer, eingefärbt nach Anteil der Briefe. Am meisten: ...", nav labels Teilen, Zahlen, Spenden, Einstellungen. Tests assert no en/em dashes in the creator block.

## Open verification gaps (not verified)
- No browser check done: flush height of map and Verlauf on md+, sticky nav under the header (measured top), 375 px horizontal scroll and overflow, anchor jumps with `scroll-mt-32`, "Einstellungen" opening the details, hover/tap highlight and line, /stats click filter.
- Touch tap behaviour of the map (tap sets highlight; tap on blank SVG area clears) untested on a device.
- The `<details>` open-by-hash on page load is not handled (only click).

## Local creator session for /kampagne/verwalten (noticed, not used)
`web/src/lib/campaigns/session.ts`: cookie `bnb_campaign_management_session`, value from `createCampaignManagementSessionValue(campaignId, creatorEmail)`, HMAC-signed with `CAMPAIGN_SESSION_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` (from `.env.local`, TTL 2 h). Page checks `campaign.creatorEmail === session.creatorEmail`. Mint it with a tsx script (load `.env.local`, run with `--conditions react-server` because the module imports `server-only`), take a real campaign id + creator email from the DB, set the cookie in the browser. Alternative: the token route `kampagne/verwalten/zugang` consumes a management token from the creator mail.

## Lead verification (2026-10-09)
- Browser-Check mit temporärer Fixture-Seite (nicht committet, wieder gelöscht), Dev-Server lokal.
- Desktop 1280px: Karte und Verlauf bündig, Sprungleiste klebt unter AppHeader, Sprung zu "Zahlen" landet unter Header+Leiste (scroll-mt passt), aktive Markierung stimmt.
- Tap/Klick auf Land: Hervorhebung + "Nordrhein-Westfalen: 48 Briefe · 27 %". Reiner Mouse-Hover ließ sich im emulierten Viewport nicht synthetisch auslösen (gleicher State-Setter wie Klick).
- 375px: kein horizontaler Overflow, "Einstellungen" springt hin und öffnet <details>, Karte stapelt über Legende.
- Copy-Fix 634c338: Rest-Zeile "Alle anderen" statt "+ n weitere und kleinere Länder", Hinweis "Für die genaue Zahl auf ein Land zeigen."
- Checks: jest campaignCreatorStats+bundeslandMap 70/70, eslint geänderte Dateien sauber, tsc nur 4 vorbestehende Fehler in campaignTopicReset.test.ts.
- Offen: /stats Karte + Klick-Filter nicht im Browser geprüft (Passwort-Gate). Echte Creator-Session nicht getestet.
