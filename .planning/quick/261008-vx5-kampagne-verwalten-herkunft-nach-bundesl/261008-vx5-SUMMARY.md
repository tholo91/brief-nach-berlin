---
phase: quick-261008-vx5
plan: 01
subsystem: kampagne-verwalten
tags: [creator-stats, letter_signals, dsgvo]
status: complete
commits: 3
plan_head_before: 7af47934b599db351c96903fc71bbed00ac40ac0
plan_head_after: b3c819d4d8ed6414b25fd3316a073944751e7a8a
requirements: [KAMPAGNEN-VERWALTEN-CREATOR-STATS]
key-files:
  modified:
    - web/src/lib/campaigns/creatorStats.ts
    - web/src/components/campaigns/CampaignCreatorStats.tsx
    - web/src/__tests__/campaignCreatorStats.test.ts
    - DSGVO-VERARBEITUNGSVERZEICHNIS.md
    - web/src/app/(site)/datenschutz/page.tsx
actuals:
  tasks: 3
  commits: 3
---

# Quick 261008-vx5: Herkunft nach Bundesland und mehr Review-Stats für Creator

Die Karte "So kommt deine Kampagne an" zeigt jetzt Bundesland-Herkunft, Wochenverlauf, Empfängerverteilung, eine vierte Kachel (politische Ohnmacht) und Feedback-Tag-Chips. Alles ist aggregiert und per 10-Signale-Gate geschützt.

## Commits

- `4519592` Task 1 (Tracer): letter_signals-Loader mit fester Spaltenliste, `bucketRegions`, Gate ab 10 Signalen, Platzhalter mit Fortschrittsbalken, ruhige Fehleranzeige, unabhängige Loader.
- `2213834` Task 2: `buildWeeklySeries` (Berlin, Montag, max. 52 Wochen), `bucketRecipients`, Ohnmacht-KPI, Tag-Chips, Verlauf-Balken, 4-Kachel-Grid.
- `b3c819d` Task 3: VT-5, VT-6 und Datenschutz §17, §18, §20 (inkl. der beiden Zusatzpunkte vom Orchestrator).

## Verification (real output)

- `npm run test -- campaignCreatorStats`: 65 passed, 0 failed.
- Full `npm run test`: 100 suites passed, 781 tests passed.
- `npx eslint` auf die 3 geänderten TS-Dateien: 0 Fehler, 0 Warnings. `npm run lint` gesamt: 0 Fehler, 7 Warnings (alle in nicht geänderten Dateien).
- `npx tsc --noEmit`: 4 vorbestehende Fehler in `src/__tests__/campaignTopicReset.test.ts` (TS7022/TS7024, nicht angefasst), sonst keine.
- Em-Dash-Check: DSGVO-Datei 0, `datenschutz/page.tsx` 1 (vorbestehend, unverändert).
- `package.json`, `package-lock.json` und `verwalten/page.tsx` ohne Diff.
- Visueller Check im Dev-Server nicht gemacht (optional laut Plan). Layout durch Render-Tests abgedeckt.

## Entscheidungen

- 4-Kachel-Grid bleibt `sm:grid-cols-2 lg:grid-cols-4`. Kein visueller Check, daher kein Fallback nötig gewesen; bei langen Labels bei 1024 bis 1280px ggf. nachsehen.
- Caption der stärksten Woche nutzt Dativ ("mit 18 Briefen"), Bar-Tooltips Nominativ ("14 Briefe").
- Fehlen valide Zeitstempel bei ready-Signalen, zeigt Verlauf eine ruhige Zeile statt eines Charts.
- Tags und Empfänger sortieren bei Gleichstand nach deutschem Namen.

## Deviations from Plan

**1. [Orchestrator-Zusatz] Datenschutz-Lücken geschlossen**
- Datenschutz §17 und VT-5 nennen die Creator-Sicht auf Review-Aggregate (ab 10 Rückmeldungen, Kommentare nur mit Einwilligung, ohne Name/PLZ/E-Mail).
- Datenschutz §18 listet "Empfängerart" in den gespeicherten Feldern (passend zu VT-6).

**2. [Prozess] Commits auf `main`**
- Der Pre-Commit-Schutz gegen Commits auf dem Default-Branch wurde nicht angewendet: Der Orchestrator wies explizit Ausführung auf dem Main-Checkout ohne Worktree an, das Repo ist trunk-based. Nichts gepusht.

Sonst keine Abweichungen. Keine Auth-Gates, keine Stubs.

## Hinweise

- Außerhalb des Scopes (nicht angefasst): `web/src/app/api/review-improvement-click/route.ts` setzt `campaign_slug` nicht.
- Vorbestehend: tsc-Fehler in `campaignTopicReset.test.ts`.
- Das 1000-Zeilen-Limit von PostgREST gilt für beide Reads (im JSDoc dokumentiert).

## Threat Flags

Keine neue Angriffsfläche außerhalb des Plan-Threat-Models. Mitigationen T-vx5-01 bis 06 sind getestet (Spaltenliste, Merge, Slug-Filter, Logs ohne Slug, Tag-Allowlist, unabhängige Loader). T-vx5-SC: keine Pakete installiert.

## Self-Check: PASSED

Commits 4519592, 2213834, b3c819d liegen auf `main`. Alle 5 Dateien geändert und committet.
