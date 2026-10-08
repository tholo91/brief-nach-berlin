---
created: 2026-10-08T20:00:00.000Z
title: "Kampagnen auf /ngo-briefkampagne nach Thema gruppieren"
area: ui
severity: minor
files:
  - web/src/app/(site)/ngo-briefkampagne/page.tsx
  - web/src/components/campaigns/CampaignList.tsx
  - web/src/lib/campaigns/classifyTopic.ts
---

## Problem
Die NGO-Seite listet alle laufenden Kampagnen ungruppiert. Bei 10 Kampagnen (Stand 08.10.2026) passt das, ab etwa 20 wird die Liste unübersichtlich.

## Lösung
Erst angehen, wenn ca. 20 Kampagnen laufen. Dann Themen-Chips oder Gruppen nach `topic_categories[0]`. Voraussetzung: Topic-Backfill für Altkampagnen, aktuell haben 7 von 11 aktiven Kampagnen keine `topic_categories`.
