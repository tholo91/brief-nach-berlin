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

## Regionale Einordnung

Bremen ist ein besonders deutlicher Sonderfall, aber nicht das einzige Problem:

- Fuer die PLZ 28203 liefert der aktuelle Datenbestand 72 Mitglieder der Bremischen Buergerschaft. Die PLZ wird korrekt dem Wahlkreis Bremen zugeordnet. Dieser Wahlkreis umfasst aber praktisch die gesamte Stadt; viele Mandate kommen ueber Landeslisten. Die 72 Personen sind deshalb keine 72 individuell zustaendigen Ansprechpartner:innen.
- Bremerhaven ist separat erfasst und kommt auf 15 Personen. Die hohe Zahl in Bremen ist damit kein Fehler der PLZ-Zuordnung, sondern eine Folge der Wahlkreis- und Mandatsstruktur.
- Hamburg ist ebenfalls ein Stadtstaat. Dort verteilen sich die Mandate auf mehrere Wahlkreise, deshalb sind die Gruppen kleiner, aber die persoenliche Zustaendigkeit bleibt genauso wenig offensichtlich.
- Berlin hat Wahlkreis- und Listenmandate sowie Bezirksstrukturen. Eine PLZ kann mehrere Bezirke beruehren. Auch dort ist ein einzelnes MdA nicht automatisch der fachlich passende Empfaenger.
- In allen Laendern gibt es zusaetzlich Listenmandate. Ein Anliegen kann daher fachlich besser bei einem Ausschuss, einer Fraktion, dem Landtag als Institution oder der Landesregierung aufgehoben sein als bei einer zufaellig ausgewaehlten Person aus dem Wahlkreis.

Die Schlussfolgerung ist deshalb nicht nur ein Bremer Sonderweg: Eine PLZ kann den politischen Raum eingrenzen, aber sie sagt noch nicht, welche Person einen frei formulierten Brief am sinnvollsten bearbeiten kann.

## Festgehaltene Entscheidung vom 19.07.2026

Die Land-Empfaengerlogik bleibt im aktuellen Paket unveraendert. Es werden vorerst keine Ausschussdaten importiert, keine Person automatisch empfohlen und kein Bremer Sonder-Fallback eingebaut. Die Entscheidung wird getroffen, bevor weitere Arbeit in den heutigen MdL-Flow fliesst.

## Datenstand vom 19.07.2026

- Der lokale Cache enthält 1.722 Landtagsmandate, aber keine Ausschussdaten.
- Die öffentliche [Abgeordnetenwatch-API](https://www.abgeordnetenwatch.de/api/entitaeten/committee-membership) liefert für 1.597 dieser Mandate mindestens eine Ausschussmitgliedschaft. Sprecherrollen sind bundesweit nicht einheitlich gepflegt.
- Für Bremen fehlen dort fachlich wichtige staatliche Deputationen. Die [Bremische Bürgerschaft führt diese Gremien separat](https://www.bremische-buergerschaft.de/drs_abo/2023-07-04_Drs-21-20_6c041.pdf).
- Nur 7.517 der 9.849 bekannten PLZ haben derzeit einen Landtagswahlkreis-Treffer. Viele PLZ ergeben mehrere Wahlkreise. Eine PLZ allein reicht deshalb nicht für eine belastbare persönliche Empfehlung.

## Entscheidungshilfe

Zuerst sollte geklaert werden, ob ein Personenempfaenger ueberhaupt der Standard sein muss. Fuer die meisten Nutzer:innen ist weder das eigene MdB noch ein MdL bekannt. Die Auswahl einer einzelnen Person verlagert die Recherche zurueck auf die Nutzer:innen und erzeugt eine Scheingenauigkeit.

Vier Modelle gegeneinander pruefen:

1. Zustaendiges Ministerium oder Landesregierung: passend fuer Anliegen, bei denen die Landesverwaltung handeln, foerdern, regeln oder umsteuern kann. Die Anschrift bleibt institutionell stabiler als eine einzelne Person.
2. Landtag als Institution oder zustaendiger Petitionsausschuss: passend fuer landesweite politische Anliegen, Gesetzgebung und formelle Petitionen. Vorher klaeren, ob ein normaler Brief dort sinnvoll bearbeitet wird oder in ein Petitionsverfahren ueberfuehrt werden muss.
3. Fachlich zustaendiger Ausschuss: passend, wenn das Thema klar einem parlamentarischen Fachgebiet zugeordnet werden kann. Das waere naeher am Anliegen als eine reine PLZ-Zuordnung, setzt aber gepflegte Ausschussdaten und eine klare Routinglogik voraus.
4. Einzelnes MdL: persoenlicher demokratischer Adressat. Dieses Modell braucht eine bundesweit belastbare fachliche Zuordnung und einen ehrlichen Fallback fuer fehlende oder widerspruechliche Ausschussdaten. Es sollte eher eine optionale Vertiefung bleiben als der Standard.

Die Entscheidung soll nicht danach fallen, welcher Datensatz am leichtesten einzubauen ist. Entscheidend ist, wo ein normaler, frei formulierter Buergerbrief am ehesten gelesen und sinnvoll bearbeitet wird.

## Akzeptanzkriterien fuer die spaetere Umsetzung

1. Genau ein vorausgewaehlter institutioneller Land-Empfaenger statt einer langen Pflichtauswahl.
2. Eine kurze Begruendung im Wizard: warum dieser Empfaenger fachlich passt und woher die Daten stammen.
3. Mistral darf hoechstens einen kontrollierten Themenschluessel liefern. Name, Funktion, Anschrift, Quelle und Datenstand kommen aus gepflegten Daten.
4. "Empfaenger aendern" bleibt optional. Partei- und Personenlisten werden nicht zum Pflichtschritt. Eine fachliche Ressort- oder Ausschussauswahl erscheint nur, wenn die Datenlage das verlaesslich traegt.
5. Ein bundesweit einheitlicher Fallback. Keine eigenen Sonderlogiken fuer einzelne Landtage, solange sie nicht verfassungsrechtlich zwingend sind.
6. Stichproben fuer alle 16 Bundeslaender sowie eigene Tests fuer Bremen, Hamburg und Berlin.

## Verwandte Backlog-Punkte

- `2026-04-14-v2-politician-research-for-personalized-letters.md`
- `2026-06-29-kampagnen-ziel-bund-oder-landesregierung-festlegen.md`
- `2026-08-11-bestimmte-abgeordnete-anschreiben-personensuche-fuer-brief-und-kampagne.md`: Personen-Suche als opt-in Empfaenger-Modus fuer freie Briefe und Kampagnen. Kein Widerspruch zu dieser Entscheidung (Suche ist bewusste Ausnahme, keine Pflichtauswahl).
