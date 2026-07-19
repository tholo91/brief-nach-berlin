---
created: 2026-07-19T00:00:00.000Z
title: Land-Empfaenger festlegen: Landesregierung, Landtag oder MdL
area: product
files:
  - web/src/components/wizard/Step3Success.tsx
  - web/src/lib/lookup/plzLookup.ts
  - web/src/lib/generation/generateLetter.ts
  - web/scripts/fetch-landtag-data.ts
---

## Problem

Die PLZ-Zuordnung ist keine belastbare Empfaenger-Empfehlung. Fuer 28203 zeigt der aktuelle Wizard 72 moegliche Mitglieder der Bremischen Buergerschaft. Der lokale Cache enthaelt fuer 1.722 Landtagsmandate keine Ausschussdaten. Abgeordnetenwatch liefert zwar fuer viele Mandate Ausschussmitgliedschaften, aber Sprecherrollen sind uneinheitlich gepflegt und fuer Bremen fehlen wichtige staatliche Deputationen. Die Aussage "Diese Person passt wahrscheinlich am besten" waere deshalb nicht bundesweit belegbar.

Eine Namenssuche oder ein Parteifilter verkleinert die Liste, uebertraegt die eigentliche Auswahl aber wieder an die Nutzer:innen. Das widerspricht dem Produktziel: Nutzer:innen sollen ihr Anliegen schildern koennen, waehrend das Produkt einen nachvollziehbaren Empfaenger und eine brauchbare Formulierung vorbereitet.

## Festgehaltene Entscheidung vom 19.07.2026

Die Land-Empfaengerlogik bleibt im aktuellen Paket unveraendert. Es werden vorerst keine Ausschussdaten importiert, keine Person automatisch empfohlen und kein Bremer Sonder-Fallback eingebaut. Die Entscheidung wird getroffen, bevor weitere Arbeit in den heutigen MdL-Flow fliesst.

## Datenstand vom 19.07.2026

- Der lokale Cache enthält 1.722 Landtagsmandate, aber keine Ausschussdaten.
- Die öffentliche [Abgeordnetenwatch-API](https://www.abgeordnetenwatch.de/api/entitaeten/committee-membership) liefert für 1.597 dieser Mandate mindestens eine Ausschussmitgliedschaft. Sprecherrollen sind bundesweit nicht einheitlich gepflegt.
- Für Bremen fehlen dort fachlich wichtige staatliche Deputationen. Die [Bremische Bürgerschaft führt diese Gremien separat](https://www.bremische-buergerschaft.de/drs_abo/2023-07-04_Drs-21-20_6c041.pdf).
- Nur 7.517 der 9.849 bekannten PLZ haben derzeit einen Landtagswahlkreis-Treffer. Viele PLZ ergeben mehrere Wahlkreise. Eine PLZ allein reicht deshalb nicht für eine belastbare persönliche Empfehlung.

## Entscheidungshilfe

Drei Modelle gegeneinander pruefen:

1. Landesregierung oder zustaendiges Ministerium: einfache institutionelle Adressierung und passend fuer exekutive Anliegen. Vorher klaeren, wie legislative Anliegen und Ressortwechsel behandelt werden.
2. Landtag als Institution oder Petitionsausschuss: ein stabiler Empfaenger pro Bundesland. Vorher pruefen, ob ein normaler Brief dort sinnvoll bearbeitet wird oder ein formelles Petitionsverfahren erwartet wird.
3. Einzelnes MdL: persoenlicher demokratischer Adressat. Dieses Modell braucht eine bundesweit belastbare fachliche Zuordnung und einen ehrlichen Fallback fuer fehlende oder widerspruechliche Ausschussdaten.

Die Entscheidung soll nicht danach fallen, welcher Datensatz am leichtesten einzubauen ist. Entscheidend ist, wo ein normaler, frei formulierter Buergerbrief am ehesten gelesen und sinnvoll bearbeitet wird.

## Akzeptanzkriterien fuer die spaetere Umsetzung

1. Genau ein vorausgewaehlter Land-Empfaenger statt einer langen Pflichtauswahl.
2. Eine kurze Begruendung im Wizard: warum dieser Empfaenger fachlich passt und woher die Daten stammen.
3. Mistral darf hoechstens einen kontrollierten Themenschluessel liefern. Name, Funktion, Anschrift, Quelle und Datenstand kommen aus gepflegten Daten.
4. "Empfaenger aendern" bleibt optional. Partei-, Personen- oder Ressortlisten werden nur dort gezeigt.
5. Ein bundesweit einheitlicher Fallback. Keine eigenen Sonderlogiken fuer einzelne Landtage, solange sie nicht verfassungsrechtlich zwingend sind.
6. Stichproben fuer alle 16 Bundeslaender sowie eigene Tests fuer Bremen, Hamburg und Berlin.

## Verwandte Backlog-Punkte

- `2026-04-14-v2-politician-research-for-personalized-letters.md`
- `2026-06-29-kampagnen-ziel-bund-oder-landesregierung-festlegen.md`
