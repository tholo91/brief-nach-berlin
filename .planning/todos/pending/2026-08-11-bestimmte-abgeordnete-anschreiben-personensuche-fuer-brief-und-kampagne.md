---
created: 2026-08-11T00:00:00.000Z
title: Bestimmte Abgeordnete anschreiben - Personensuche als Empfaenger-Modus (Brief + Kampagne)
area: ui
files:
  - web/src/components/wizard/WizardShell.tsx
  - web/src/components/wizard/StepLevelSelect.tsx
  - web/src/lib/lookup/plzLookup.ts
  - web/src/lib/types/politician.ts
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/lib/actions/submitWizard.ts
  - web/src/lib/generation/generateLetter.ts
---

## Problem

Heute gibt es keinen Weg, einen Brief an eine gezielt gewaehlte Person zu schreiben: Der PLZ-Flow zwingt zu den eigenen Wahlkreis-MdBs. Wer z. B. der Innenministerin oder einem Fachpolitiker aus einem anderen Wahlkreis schreiben will, bleibt aussen vor. Das gilt fuer freie Briefe ebenso wie fuer Kampagnen, die bislang nur eine Ebene (Bund/Land) plus optional ein Bundesland fixieren koennen, aber keine einzelne Person.

## Loesung (ein gemeinsamer Baustein fuer beide Faelle)

Type-Ahead-Suche als zweiter Empfaenger-Modus, ueber den vorhandenen `politicians-cache.json` (608 MdBs + 1.722 MdLs mit Name, Partei, Ebene, Bundesland, postalAddress). Kein neuer Daten-Layer, reine Client-Suche im Cache.

**Freier Brief (supersedes Backlog-Phase 999.25, erweitert um Landtag):**
1. Im Empfaenger-Schritt ein dezenter Modus-Wechsel "Meine Wahlkreis-Abgeordneten" vs. "Bestimmte Person anschreiben" (Opt-in, PLZ-Flow bleibt Default).
2. Im zweiten Modus Suchfeld mit Type-Ahead ueber Bundestag und Landtag: Buchstaben eingeben, Person separat auswaehlen.
3. Suchergebnis pro Treffer mit Kontext (Partei, Ebene, Bundesland) rendern, damit die Person eindeutig ist.
4. PLZ wird in diesem Modus nicht fuer die Empfaenger-Aufloesung gebraucht; Anliegen-Eingabe und Briefgenerierung bleiben unveraendert (Empfaenger kommt aus `selection.kind`).

**Kampagne (optionales Feld `targetPerson`):**
5. `CreatorCampaignForm` bekommt optional "Fester Empfaenger": Person aus derselben Suche waehlen. Datenmodell: `targetPersonId` (bzw. `targetPerson` als Referenz auf den Cache-Eintrag), orthogonal zu `targetLevel`/`targetState`.
6. Besucher-Wizard bindet den Empfaenger bei gesetzter `targetPerson` direkt daran, unabhaengig von der Besucher-PLZ. Kein PLZ->Empfaenger-Routing, kein Mismatch-Fallback noetig (keine PLZ-Abhaengigkeit).
7. Ist keine Person gesetzt, gilt das bisherige Verhalten (`targetLevel`/`targetState`).

## Grenzen

- Nur Bund und Landtag durchsuchbar. Kommune hat keine Personendaten (Cache `kommune: 0`), bleibt bewusst aussen vor.
- Opt-in statt Pflicht: Deckt sich mit der Entscheidung vom 19.07.2026 (Personenlisten werden nicht zum Pflichtschritt). Kein Widerspruch zum Produktziel "Produkt findet den Empfaenger", weil die Suche eine bewusste Abweichung ist, nicht der Standard.
- Land ohne Ausschussdaten: Die Suche ist reine Namenssuche, keine fachliche Empfehlung. Keine Zusicherung "passt fachlich am besten".

## Validierung

999.25 war bewusst Backlog, weil unklar war, ob es ein echter Schmerz ist. Vor dem Bau schlank pruefen: Klick-/Nutzungsdaten, ob "Empfaenger aendern" genutzt wird, und ob Kampagnen-Creator einen festen Empfaenger nachfragen.

## Aufwand

Klein: Ein Such-UI-Komponent + Suche ueber den Cache (~halber Tag), Kampagnen-Feld zusaetzlich (~halber Tag).
