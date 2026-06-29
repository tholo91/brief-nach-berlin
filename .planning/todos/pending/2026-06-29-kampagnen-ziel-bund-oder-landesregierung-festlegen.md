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

Offene Produktfrage vor Umsetzung:

Soll eine Landes-Kampagne an ein festes Bundesland gebunden sein, oder darf dieselbe Kampagne fuer jedes Bundesland laufen und erst die Besucher-PLZ entscheidet das konkrete Land?
