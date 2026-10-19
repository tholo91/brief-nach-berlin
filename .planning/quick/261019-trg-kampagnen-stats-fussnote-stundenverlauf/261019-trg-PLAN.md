---
quick_id: 261019-trg
mode: quick
---

# Kampagnen-Stats: Doppelte-Schätzung in die Fußnote, Stundenverlauf an Tag 1 und 2

Ersteller-Statistik (`/kampagne/.../verwalten`, `CampaignCreatorStats`). Screenshots sollen nur die echte Briefzahl zeigen; der Verlauf soll ab dem ersten Brief etwas zeigen statt „erscheint ab dem dritten Tag“.

## Task 1: Doppelte-Schätzung in die Fußnote
- files: web/src/components/campaigns/CampaignCreatorStats.tsx, web/src/__tests__/campaignCreatorStats.test.ts
- action: Zeile „ca. X ohne Doppelte“ unter der Kopfzahl entfernen. Die Fußnote nennt die Schätzung: „Etwa 3 bis 5 % … abschickt. Ohne Doppelte sind es rund X Briefe (pauschal 4 % abgezogen).“ `/stats` bleibt unverändert.
- done: Kopfbereich enthält keine Schätzung, Footer schon; bei kleinen Zahlen (keine Änderung) erscheint beides nicht.

## Task 2: Stundenbalken, solange die Kampagne jünger als 3 Kalendertage ist
- files: web/src/lib/campaigns/creatorStatsView.ts, web/src/components/campaigns/CampaignCreatorStats.tsx, web/src/__tests__/campaignCreatorStats.test.ts
- action: `buildTimeline` liefert bei Spannweite < 3 Berliner Tagen `granularity: "hour"` (Buckets = volle Stunden, `start` als ISO-Zeitpunkt, von der ersten Brief-Stunde bis jetzt bzw. bis zum letzten Brief bei beendeten Kampagnen). Status `pending` entfällt. UI: Tooltip/Achse/Summary in Berliner Zeit („Stärkste Stunde: 19. Okt., 19 Uhr mit N Briefen“), engere Balkenabstände.
- done: Tests für Stunden-Buckets (inkl. Zeitzone, Lücken, beendete Kampagne) grün; keine Supabase-Änderung (`generated_at` ist `timestamptz`).

## Verify
- `npx vitest run src/__tests__/campaignCreatorStats.test.ts`, `npx tsc --noEmit`, Sichtprüfung im Browser.
