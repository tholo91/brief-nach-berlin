---
created: 2026-07-10T15:58:53.579Z
completed: 2026-07-19T00:00:00.000Z
title: Kommune-Briefe ans Buergermeisteramt statt Stadtverwaltung adressieren
area: api
files:
  - web/src/lib/lookup/rathausRecipient.ts
  - web/src/lib/email/buildEmailHtml.ts:97
  - web/src/lib/email/buildEmailHtml.ts:130
  - web/src/components/wizard/Step3Success.tsx
---

## Problem

Kommune-Briefe adressieren aktuell die anonyme "Stadtverwaltung {Stadt}" (RathausRecipient.label + postalAddress in rathausRecipient.ts). Ein Brief an die Verwaltung landet in der Poststelle. Die Kernidee des Produkts ist aber, Personen mit (Wieder-)Wahlinteresse zu erreichen. Entscheidung mit Thomas 2026-07-10: v1 adressiert das Amt statt der Organisation, Namen einzelner Buergermeister:innen kommen erst spaeter (kein sauberer bundesweiter Datensatz fuer ~11.000 Kommunen; Abgeordnetenwatch deckt kommunal nicht ab, Wikidata ist lueckenhaft).

Zusaetzlich gemeldetes UI-Problem aus Thomas' Test-Mail (Kommune Duisburg): Im Empfaenger-Block der Ergebnis-Mail erscheint "Stadtverwaltung Duisburg" doppelt, weil label UND postalAddress (beginnt wieder mit "Stadtverwaltung Duisburg") gerendert werden. Und der Textlink "Rathaus-Adresse finden" (buildEmailHtml.ts:130) soll ein richtiger Button "Adresse suchen" werden.

ACHTUNG Koordination: Ein paralleler Chat arbeitet bereits am Feedback zur Empfaenger-Darstellung (doppelte Zeile, Button). Vor Umsetzung pruefen, ob rathausRecipient.ts / buildEmailHtml.ts dort schon geaendert wurden. Dieses Todo buendelt die Entscheidung, damit nichts verloren geht.

## Solution

1. Adressblock v1 (ohne neue Daten): "An die Buergermeisterin / den Buergermeister" + "Stadt/Gemeinde {X}" + "{PLZ} {X}". Berliner Bezirke: "An die Bezirksbuergermeisterin / den Bezirksbuergermeister" + "Bezirksamt {Bezirk}". Anrede im Brief bleibt "Sehr geehrte Damen und Herren" oder funktionsbezogen.
2. Hinweis: In kreisfreien Staedten heisst es Oberbuergermeister:in. Fuer v1 generisch "Buergermeisterin / Buergermeister" verwenden oder ueber eine kleine Liste kreisfreier Staedte differenzieren (Liste existiert als offene Daten, ~106 Staedte, machbar). Nicht ueber-engineeren.
3. Duplikat im Mail-Empfaengerblock fixen: fuer rathaus-Empfaenger die erste Zeile der postalAddress weglassen, wenn sie dem label entspricht.
4. "Rathaus-Adresse finden" als Button im Mail-Stil ("Adresse suchen") statt Textlink.
5. Spaeter (nur wenn Kommune-Traffic es rechtfertigt): Top 50-100 Staedte mit echten Buergermeister-Namen anreichern, Rest behaelt Amts-Adressierung.

Umsetzung auf Branch codex/999-6-level-routing-v2 (Worktree brief-nach-berlin-999.6), idealerweise im parallelen Routing-Feedback-Chat.

## Ergebnis vom 19.07.2026

Kommunale Briefe gehen institutionell an das Bürgermeisteramt, in Berlin weiterhin an das Bezirksamt. Eine neutral formulierte Anrede vermeidet die Pflege persönlicher Namen. Amtliche Anschriften stammen aus dem Destatis-Verzeichnis mit Quellenstand; ein konservatives PLZ-Mapping ordnet nur eindeutige Treffer zu. Für den Rest zeigt Wizard und E-Mail eine Suchhilfe ohne vorbefüllte Wohn-PLZ. Die ursprüngliche Idee einer bloß generischen Zustellanschrift wurde damit ersetzt.
