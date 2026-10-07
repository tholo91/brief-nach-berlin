---
created: 2026-10-04
title: Beispielbrief beim Erstellen einer Kampagne
area: campaigns
files:
  - web/src/lib/actions/createCampaignDraft.ts
  - web/src/lib/generation/generateLetter.ts
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/components/campaigns/CampaignManager.tsx
---

## Ziel

Kampagnenersteller:innen können direkt prüfen, ob der generierte Brief ihr Anliegen richtig wiedergibt. Dafür entsteht beim Erstellen einer Kampagne einmalig ein gespeicherter Beispielbrief, der über die Kampagnenverwaltung angesehen werden kann.

## Gewünschtes Verhalten

- Nach erfolgreichem Erstellen der Kampagne automatisch einmal einen Beispielbrief aus dem gespeicherten Anliegen generieren.
- Bestehende Briefgenerierung verwenden, mit Tonalität **„höflich-konstruktiv“**, Standardlänge und ohne zusätzliche persönliche Angaben.
- Den Brief speichern und in **„Kampagne verwalten“ → „Beispielbrief ansehen“** anzeigen. Wiederholtes Öffnen erzeugt keinen neuen Brief.
- **Gesamtzähler und Kampagnenzähler bleiben unverändert.** Keine Briefversand-, Follow-up- oder Teilnahmeaktionen auslösen.
- Bei einem Generierungsfehler bleibt die Kampagne erfolgreich erstellt; die Verwaltung zeigt den Fehler und ermöglicht einen erneuten Versuch.

## Umsetzungshinweis

Die bestehende Briefgenerierung über einen separaten internen Aufruf verwenden. Der reguläre Teilnehmer-Endpunkt `/api/generate-letter` erhöht Zähler und stößt Folgeaktionen an; der Beispielbrief darf diesen Ablauf nicht auslösen. Erstellung und Fehlerbehandlung des Beispielbriefs müssen unabhängig vom erfolgreichen Speichern der Kampagne bleiben.

## Akzeptanzkriterien

- Ein Beispielbrief entsteht auch vor Veröffentlichung der Kampagne und ist ausschließlich über den geschützten Verwaltungszugang sichtbar.
- Beide Zähler bleiben bei Generierung, Wiederholungsversuch und Ansicht unverändert; reguläre Teilnehmerbriefe werden weiterhin gezählt.
- Ladezustand, erfolgreiche Anzeige und Fehlerfall sind verständlich dargestellt.

## Festgelegte Grenzen

Der Brief bleibt eine Referenz auf den Stand bei Erstellung; spätere Änderungen erzeugen zunächst keinen neuen Beispielbrief. Bestehende Kampagnen werden nicht automatisch nachgeneriert.

Feste Empfänger werden übernommen; bei ortsabhängigen Kampagnen werden klar erkennbare, zur Zielebene passende Empfängerplatzhalter verwendet.
