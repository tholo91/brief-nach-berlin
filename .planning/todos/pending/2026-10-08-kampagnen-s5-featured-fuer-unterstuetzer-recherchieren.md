---
created: 2026-10-08T13:36:32.000Z
title: "Kampagnen S5: Startseiten-Platzierung für Unterstützer recherchieren"
area: planning
severity: minor
files:
  - web/supabase/migrations/024_campaign_landing_rank.sql
  - web/src/lib/campaigns/repository.ts:428-446
  - .planning/research/2026-09-10-we-aid-donation-conversion-evidence.md
  - .planning/research/2026-09-17-ngo-sponsoring-ai-infrastructure.md
---

## Problem

Teil von "Kampagnen 2.0" (S5 von 5, nur Recherche). Idee von Thomas: Kampagnen werden auf der Startseite bevorzugt angezeigt, wenn ihre Ersteller ab 50 € spenden. Eine Spende mit Gegenleistung ist steuerlich aber keine Spende mehr, sondern Sponsoring oder Werbung. Bei WE AID mit Zuwendungsbestätigung könnte das ein Problem sein. Bis zur Klärung setzt Thomas `landing_rank` weiter von Hand.

## Solution

Recherche-Datei unter `.planning/research/` (Skill `/research`), keine Implementierung:

1. Spende vs. Sponsoring vs. Werbeleistung in Deutschland: Folgen für Zuwendungsbestätigung und Umsatzsteuer.
2. WE-AID-Bedingungen: Darf eine Spende an eine Gegenleistung geknüpft sein?
3. Alternativen ohne Gegenleistung: redaktionelle Auswahl durch Thomas nach Qualität/Wirkung, öffentliches Danke an Unterstützer, getrenntes bezahltes "Hervorheben" mit Rechnung.
4. Empfehlung mit einem nächsten Schritt.

## Startprompt für neuen Chat

`/research` Bearbeite `.planning/todos/pending/2026-10-08-kampagnen-s5-featured-fuer-unterstuetzer-recherchieren.md`.
