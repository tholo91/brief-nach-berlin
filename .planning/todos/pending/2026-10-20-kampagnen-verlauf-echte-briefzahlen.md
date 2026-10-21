---
created: 2026-10-20T00:00:00.000Z
title: Kampagnen-Verlauf zeigt echte Briefzahlen statt Kartenbeiträge
area: campaigns
files:
  - web/supabase/migrations/009_campaign_letter_count.sql
  - web/src/lib/campaigns/creatorStats.ts
  - web/src/lib/campaigns/creatorStatsView.ts
  - web/src/components/campaigns/CampaignCreatorStats.tsx
  - web/src/__tests__/campaignCreatorStats.test.ts
---

# Kampagnen-Verlauf: echte Briefzahlen

Status: backlog (Stand 20.10.2026, Entscheidung für eigene Zählertabelle steht)

## Problem

- Der Verlauf auf der Ersteller-Statistikseite zählt `letter_signals`, also nur Briefe mit Kartenfreigabe (grob jeder Dritte).
- Beispiel: Am 19.10. zeigte die Seite „Stärkster Tag: 19. Okt. mit 485 Briefen“, tatsächlich waren es über 1.400.
- `campaigns.letter_count` ist nur ein Gesamtzähler ohne Zeitbezug.
- `letter_signals.letter_number` ist die globale Briefnummer über ganz Brief-nach-Berlin, nicht pro Kampagne. Differenzen davon zählen freie Briefe und andere Kampagnen mit.

## Entscheidung

Neue kleine Tabelle mit einer Zeile pro Kampagne und Stunde, in der nur Briefe gezählt werden:

```sql
create table public.campaign_letter_hours (
  campaign_slug text not null,
  hour timestamptz not null,
  letters integer not null default 0 check (letters >= 0),
  primary key (campaign_slug, hour)
);
```

- `increment_letter_counters` erhöht in derselben Transaktion per `insert ... on conflict do update set letters = letters + 1`, und zwar genau dann, wenn auch `campaigns.letter_count` hochgeht (gleiche Bedingung `status = 'active'`).
- Es gibt keine Personendaten, keinen Brieftext und keine PLZ, nur Zähler.

Verworfen:
- Spalte `campaign_letter_number` an `letter_signals` (Entscheidung 21.10.2026): spart kaum Speicher, braucht aber mehr Code im Schreibpfad (Rückgabe der SQL-Funktion, signierter generationProof, Signal-Upsert). Außerdem gibt es Signale nur bei Briefen mit Zustimmung, dadurch entstehen Lücken, und bei kleinen Kampagnen landen Briefe im falschen Tag.
- JSON-Spalte auf `campaigns` (Stunde → Anzahl): Jeder Brief schreibt die ganze Kampagnenzeile neu, und das JSON wächst unbegrenzt.

## Speicher (Supabase Free, 500 MB)

Schätzung, nicht gemessen: etwa 120 Byte pro Zeile inklusive Primärschlüssel. Zeilen entstehen nur für Stunden, in denen Briefe kamen.

- Eine große Kampagne mit 12 aktiven Stunden pro Tag über ein Jahr: rund 4.400 Zeilen, also etwa 0,5 MB.
- 20 Kampagnen über ein Jahr: rund 10 MB.
- Zum Vergleich: `letter_signals` schreibt eine Zeile pro freigegebenem Brief, inklusive Arrays. Die neue Tabelle ist deutlich kleiner.
- Vor dem Start einmal die aktuelle DB-Größe im Supabase-Dashboard ansehen.

## Umsetzung

1. Migration `036_campaign_letter_hours.sql`: Tabelle anlegen, RLS an und erzwungen ohne Policies, `REVOKE ALL ... FROM PUBLIC, anon, authenticated` und `GRANT ... TO service_role` (Vorlage `033_letter_outcomes.sql`, Pflicht ab 30.10.2026), `increment_letter_counters` ersetzen. Eintrag in `web/supabase/MIGRATION_STATUS.md`. Thomas führt die Migration manuell im SQL Editor aus, und zwar vor dem Code-Deploy.
2. `creatorStats.ts`: Stundenzeilen der Kampagne lesen. Fehlt die Tabelle, auf den heutigen Signal-Pfad zurückfallen.
3. `creatorStatsView.ts`: `buildTimeline` aus Stundenzeilen bauen. Stunde, Tag und Woche ergeben sich durch Aufsummieren, die Berliner Tagesgrenze bleibt wie heute.
4. Altdaten vor dem Migrationszeitpunkt: Signale pro Bucket × (`letter_count` vor der Migration ÷ Signale vor der Migration). Diese Balken heller zeigen und im Tooltip und in der Zusammenfassung „ca.“ davorschreiben.
5. Tests in `campaignCreatorStats.test.ts`: exakte Zählung, Mischfall mit Altdaten und Fallback ohne Tabelle.

## Fertig, wenn

- Für eine Kampagne ergibt die Summe aller Balken ab dem Migrationszeitpunkt genau den Anstieg von `letter_count` im selben Zeitraum.
- „Stärkster Tag“ nennt die echte Zahl, Altdaten sind als „ca.“ markiert.
- Jest-Tests grün, `npm run build` grün.

## Nicht Teil davon

- Pro Balken die Zahl anzeigen, weil Hover-Tooltips auf dem Handy nicht funktionieren. Das ist ein eigenes kleines UI-To-do.
