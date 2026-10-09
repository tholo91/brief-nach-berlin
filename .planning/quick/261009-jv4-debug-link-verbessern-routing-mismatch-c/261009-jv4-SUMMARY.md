---
quick_id: 261009-jv4
status: complete
date: 2026-10-09
commits: 3
plan_head_before: 290b27e4f656f316f84cfd3c35beccc0a36f10c3
plan_head_after: 025180311e678a08b93ce1618fc98669c9e253c0
---

# Quick 261009-jv4: Debug-Link verbessern

/debug zeigt jetzt Routing, Mismatch (aus vorhandenen Feldern abgeleitet), Letter-ID, Code-Version und Kuerzungshinweis; Anliegen-Auszug bis 2000 Zeichen.

## Commits
- 4577a9a feat(debug): Anliegen-Auszug bis 2000 Zeichen und Code-Version im Debug-Payload
- 7365533 feat(debug): /debug zeigt Routing, Mismatch, Letter-ID, Code-Version und Kuerzungshinweis
- 0251803 test(debug): Feedback-Token enthaelt weiterhin kein issueTextPreview

## Deviations
- [Rule 3] `format()` nach `web/src/app/debug/formatDebug.ts` ausgelagert (neue Datei) statt aus `page.tsx` exportiert: Next-Pages duerfen keine zusaetzlichen Exports haben.

## Checks
- jest (6 Plan-Suites inkl. neuer debugPageFormat): 30/30 gruen
- tsc: keine Fehler in geaenderten Dateien (vorbestehende Fehler in `* 2.*`-Duplikaten und campaignTopicReset.test.ts)
- lint: 0 Errors, 8 vorbestehende Warnings, keine in geaenderten Dateien

## Known Stubs
None.
