---
created: 2026-06-29T15:52:35.512Z
title: Kampagnen-Ziel Bund oder Landesregierung festlegen
area: ui
files:
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/lib/actions/createCampaignDraft.ts
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts
  - web/src/lib/wizard-handoff.ts
  - web/src/components/wizard/WizardShell.tsx
  - web/src/app/(site)/kampagne/[slug]/page.tsx
---

## Problem

Nach dem Livegang von Landtag und Kommune brauchen Kampagnen eine feste politische Ziel-Ebene. Eine Kampagne soll bei der Erstellung festlegen koennen, ob sie an den Bund oder an die Landesregierung des jeweiligen Bundeslands gerichtet ist. Kommune ist bewusst ausgeschlossen, weil kommunale Kampagnen zu heterogen waeren und die Zielzustaendigkeit pro Ort staerker schwankt.

Ohne diese Festlegung wuerde der Besucher-Wizard weiter automatisch aus Anliegen und PLZ routen. Das ist fuer normale Einzelbriefe richtig, aber fuer Kampagnen falsch: Der Kampagnen-Ersteller hat bereits entschieden, welcher politische Hebel gemeint ist. Besucher sollen daraus nur ihren eigenen Brief mit eigener PLZ und Perspektive schreiben, nicht die Kampagne versehentlich auf eine andere Ebene umlenken.

## Solution

UX-Plan:

1. Kampagnen-Erstellung: In `CreatorCampaignForm` ein Pflichtfeld "Wohin soll die Kampagne gehen?" einfuehren. Zwei Optionen: "Bundesregierung / Bundestag" und "Landesregierung meines Bundeslands". Keine Kommune-Option.
2. Landes-Kampagnen: Bei Auswahl Land muss die Kampagne entweder ein Bundesland speichern oder der Wizard muss es eindeutig aus der Besucher-PLZ ableiten. Empfehlung: Bundesland erst im Besucher-Wizard aus der PLZ ableiten, damit eine Landeskampagne in jedem passenden Bundesland funktionieren kann, falls der Kampagnentext allgemein ist. Falls die Kampagne nur fuer ein bestimmtes Land gedacht ist, braucht die Erstellung zusaetzlich ein Bundesland-Feld.
3. Datenmodell: Kampagne speichert `targetLevel: "Bund" | "Land"` und optional `targetState`. Existing Campaign-Records, Repository-Mapping, Validierung und Management-UI muessen das Feld mitfuehren.
4. Handoff: `wizard-handoff` reicht den Kampagnen-Kontext an `/app` weiter: Slug, Titel und neu `targetLevel` plus optional `targetState`.
5. Wizard: Bei `source === "campaign"` darf die automatische politische Level-Erkennung die Kampagnen-Ebene nicht ueberschreiben. Sie kann weiter fuer Prompt-Kontext genutzt werden, aber die Empfaenger-Aufloesung muss an `targetLevel` gebunden sein.
6. Kampagnenseite: Nur anzeigen, wenn es dem Besucher hilft. Leichte Copy im Hero reicht: "Schreib einen Brief an die Bundesregierung" oder "Schreib einen Brief an die Landesregierung in [Bundesland]". Nicht als schweres Badge oder technische Erklaerung ausspielen.
7. Brief-Prompt: Der Generator bekommt den Kampagnen-Zielkontext, damit der Brief den richtigen Hebel anspricht und nicht bei Landeskampagnen Bundeskompetenzen konstruiert.

## Ergaenzung 2026-07-10 (User-Input)

Der Besucher-Wizard verhaelt sich fuer Kampagnen-Briefe anders als fuer freie Briefe:

1. `StepLevelSelect` (neuer Ebene-Auswahl-Step aus 999.6) wird bei `source === "campaign"` komplett uebersprungen. Der Besucher waehlt keine Ebene, sie ist durch `targetLevel` der Kampagne vorgegeben.
2. Die Empfaenger-Aufloesung (levelRouter/resolveRecipient) laeuft direkt mit der Kampagnen-Ebene: Bund -> MdB aus Besucher-PLZ, Land -> MdL aus Besucher-PLZ.
3. Der Mistral-Prompt (`generateLetter` / `LETTER_PROMPT_LEVEL_AWARE`) bekommt die Kampagnen-Ebene fest gesetzt, damit Argumentation und Anrede den richtigen Hebel treffen. Die automatische Level-Erkennung darf weiterhin als Prompt-Kontext dienen, aber nie den Empfaenger umlenken.
4. Kampagnen-Erstellung (`CreatorCampaignForm` unter /kampagne/starten): Pflichtfeld Ziel-Ebene mit zwei Optionen (Bundestag vs. Landtag). Zielgruppe sind NGOs und e.V.s, die den politischen Hebel bereits kennen.

Umsetzung auf Branch `codex/999-6-level-routing-v2` (Worktree `brief-nach-berlin-999.6`), da abhaengig von levelRouter, StepLevelSelect und Recipient-Union aus 999.6.

## Entscheidungen 2026-07-10 (mit Thomas geklaert)

1. Land-Kampagnen bekommen ein optionales Bundesland-Feld: Creator waehlt entweder ein festes Bundesland oder "alle Bundeslaender" (dann entscheidet die Besucher-PLZ). Datenmodell: `targetLevel: "Bund" | "Land"`, `targetState: string | null` (null = alle).
2. PLZ-Mismatch bei fester Bindung: freundlich abfangen. Hinweis "Diese Kampagne richtet sich an den Landtag von X" plus Angebot, stattdessen einen freien Brief zum Thema zu schreiben (normale Ebenen-Erkennung, ohne Kampagnen-Kontext). Kein harter Stopp, kein Brief an den falschen Landtag.
3. Bestehende Kampagnen ohne Feld gelten als `targetLevel: "Bund"`.
4. Kampagnenseite: dezente Pill "Landtagskampagne · {Bundesland}" (bzw. ohne Bundesland nur "Landtagskampagne") nur bei Land-Kampagnen. Bund-Kampagnen ohne Pill, weil Bund das Default-Mental-Model ist.

## Verwandte Backlog-Punkte

- `2026-08-11-bestimmte-abgeordnete-anschreiben-personensuche-fuer-brief-und-kampagne.md`: Erweitert diese Kampagnen-Zielsetzung um einen optionalen festen Personen-Empfaenger (`targetPerson`) — gemeinsamer Such-Baustein fuer freie Briefe und Kampagnen.
