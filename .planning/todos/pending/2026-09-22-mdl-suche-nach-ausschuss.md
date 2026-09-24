---
created: 2026-09-22T00:00:00.000Z
title: MdL-Suche nach Ausschuss ergänzen
area: data+ui
files:
  - web/scripts/fetch-landtag-data.ts
  - web/src/lib/types/politician.ts
  - web/data/politicians-cache.json
  - web/src/lib/lookup/recipientSearch.ts
  - web/src/components/wizard/AlternativeRecipientPicker.tsx
  - web/src/__tests__/recipientSearch.test.ts
---

## Ziel

Menschen, die im optionalen Landtags-Pfad bewusst eine andere Person auswählen, können ein MdL im eigenen Bundesland zusätzlich nach Ausschuss finden. Die bereits vorhandenen Parteichips bleiben erhalten. So wird die Auswahl nach einem konkreten Anliegen einfacher, ohne dass Brief-nach-Berlin eine politische oder fachliche Empfehlung vortäuscht.

## Ist-Zustand

- Der Wizard bietet im freien Landtags-Flow bereits den opt-in Link „Lieber einer anderen Person im Landtag schreiben?“.
- Die Alternative-Suche ist auf das Bundesland der PLZ begrenzt, schließt die bereits lokal angebotenen MdLs aus und kann nach Name, Partei oder Wahlkreis suchen. Parteichips, 250-ms-Entprellung, Mindestlänge von zwei Zeichen und 12er-Paginierung existieren bereits.
- `resolveRecipientSelection()` löst die gewählte MdL-ID serverseitig erneut gegen das Bundesland der PLZ auf. Eine manipulierte oder fremdländische ID wird abgelehnt.
- Der lokale Cache enthält derzeit 1.722 MdLs, aber keine Ausschussdaten. Deshalb durchsucht `recipientSearch.ts` Ausschüsse bislang absichtlich nur für MdBs.
- Abgeordnetenwatch v2 liefert Ausschussmitgliedschaften über `committee-memberships`: Ausschusslabel, Mandats-ID und Rolle. Die App bleibt trotzdem ein Build-Snapshot; es darf keine Abgeordnetenwatch-Abfrage im Besucherfluss geben.

## Produktentscheidung

1. **Partei-Chips bleiben, Ausschüsse werden über das bestehende Suchfeld gefunden.** Keine Ausschuss-Chip-Leiste: Bezeichnungen und Gremien sind zwischen 16 Landtagen zu heterogen und würden die Auswahl überladen.
2. **Die Personensuche bleibt eine bewusste Ausnahme.** Der institutionelle Land-Standard und der lokale MdL-Pfad bleiben unverändert; es gibt keine automatische Auswahl oder Rangfolge „fachlich passendster“ Personen.
3. **Die Ausschusssuche bleibt im eigenen Bundesland.** Kein bundesweiter MdL-Suchmodus und keine Änderung der Server-Absicherung.
4. **Ausschussdaten sind Suchkontext, kein Brief-Faktenkontext.** Die Briefgenerierung darf Ausschüsse nicht nennen oder daraus Zuständigkeit ableiten, solange es keinen separat verifizierten MdL-Kontext gibt.

## Umsetzung

### 1. Ausschussdaten beim Landtags-Import ergänzen

- `web/scripts/fetch-landtag-data.ts` erweitert jeden aktuellen MdL-Datensatz bei vorhandenen Daten um das bestehende optionale Feld `committees: string[]` aus `Politician`.
- Quelle ist ausschließlich die öffentliche Abgeordnetenwatch-v2-API. Ausschussmitgliedschaften werden über ihre Mandats-ID mit den im selben Lauf ermittelten, heute aktiven Mandaten verknüpft; nur nichtleere, deduplizierte Ausschusslabels speichern.
- Vor der Umsetzung den effizientesten paginierten Abruf gegen die aktuelle API-Dokumentation verifizieren. Nicht 1.722 Einzelabfragen ungebremst ausführen: Die API nennt derzeit 30 Requests pro Minute. Der Import muss drosseln, 429 respektieren und bei einem einzelnen Datenfehler nicht stillschweigend einen vollständigen Cache als frisch ausgeben.
- Rollen (Vorsitz, stellvertretendes Mitglied usw.) zunächst nicht im Cache oder UI ausspielen. Sie erhöhen die Scheingenauigkeit, sind für die Suchfunktion nicht nötig und werden zwischen Landtagen uneinheitlich gepflegt.
- Den Cache nur nach einem vollständigen, nachvollziehbaren Lauf aktualisieren. Datenstand, Trefferquote und Lücken je Bundesland im Skript-Output sichtbar machen; nicht aus einem erfolgreichen lokalen Import auf einen Deploy schließen.

### 2. Bestehende Land-Suche erweitern

- In `web/src/lib/lookup/recipientSearch.ts` die bestehende `matchesQuery()`-Logik auch für `level: "Land"` mit `politician.committees` aufrufen, sobald die Cache-Daten vorhanden sind.
- Bestehendes Verhalten unverändert bewahren: Partei und Suchbegriff sind ein UND-Filter; Name, Partei, Wahlkreis und Ausschuss sind Suchfelder; Normalisierung bleibt umlaut- und groß/kleinschreibungsrobust.
- `web/src/components/wizard/AlternativeRecipientPicker.tsx`: Land-Platzhalter auf „Name, Partei, Wahlkreis oder Ausschuss“ ändern.
- Optional nur bei tatsächlich passendem Suchtext: Auf der Ergebnis-Karte maximal zwei passende Ausschussnamen als erklärenden Text anzeigen. Kein zusätzlicher Filterzustand, keine vollständige Ausschussliste und keine neue Auswahlregel.
- Route, Payload und Auswahlvertrag nicht verbreitern: `/api/recipient-options` erhält weiterhin nur `level`, `plz`, optional `party`, `query` und `offset`; `handleAlternativeSelect()` übergibt weiter ausschließlich Auswahltyp und ID.

## Akzeptanzkriterien

1. Eine Ausschussbezeichnung und ein Teilbegriff davon finden einen passenden MdL im eigenen Bundesland; Umlaute sowie Groß-/Kleinschreibung funktionieren wie bei der bestehenden Suche.
2. Ein MdL ohne `committees` verursacht keinen Fehler und wird nicht als Ausschuss-Treffer angezeigt.
3. Parteichip plus Ausschuss-Suchtext liefert nur MdLs, auf die beide Bedingungen zutreffen.
4. Die Alternativsuche bleibt auf das Bundesland der PLZ begrenzt; bereits lokale MdLs bleiben daraus ausgeschlossen; Paging bleibt 12 Treffer pro Seite ohne Duplikate.
5. Eine gewählte Person funktioniert im freien Flow; fremdländische oder manipulierte IDs werden weiterhin serverseitig abgewiesen.
6. Kampagnen zeigen weiterhin keine freie Landtags-Alternativsuche. Landesregierung und institutioneller Standard bleiben unverändert.
7. Es gibt keine Laufzeit-Abfragen an Abgeordnetenwatch, keine Speicherung oder Protokollierung von Anliegen- bzw. Brieftexten und keine neue Analyse des Suchbegriffs.
8. Mindestens je eine frische Stichprobe aus Bremen, einem Flächenland und einem Stadtstaat prüft: aktives Mandat, gespeicherter Ausschussname, Suchtreffer und Anschrift. Fehlende oder unvollständige Ausschussdaten werden als Datenlücke dokumentiert, nicht durch erfundene Zuständigkeit ersetzt.

## Tests und Verifikation

- `recipientSearch.test.ts`: den Test „sucht Ausschüsse nur beim Bund“ in einen positiven Land-Fall überführen und die bestehenden Grenzfälle für Landesgrenze, lokale Ausschlüsse, Parteifilter, Mindestlänge und Paging beibehalten.
- Für Import-Normalisierung einen kleinen fixture-basierten Test ergänzen: mehrere Mitgliedschaften desselben Mandats, leere Labels, API-Fehler und 429-Backoff.
- Nach dem Datenimport: Anzahl MdLs mit mindestens einem Ausschuss pro Bundesland sowie mindestens drei reale Stichproben dokumentieren. Ein lokaler Test oder Cache-Refresh ist kein Live-Nachweis.
- Vor einem Release den Wizard lokal mit einer Land-PLZ prüfen; nach Deploy separat in Produktion testen.

## Nicht Teil dieser Story

- Kein automatisches Themenrouting an Ausschüsse, Ministerien oder Personen.
- Keine Aussage, ein MdL sei „zuständig“ oder „der beste Ansprechpartner“, nur weil ein Ausschussname passt.
- Keine bundesweite MdL-Suche, keine Kommunalpersonen, keine neue Kampagnen-Auswahl.
- Kein Echtzeit-Import, keine neue Datenbank und keine Änderungen an der Briefgenerierung.

## Verwandte Backlog-Punkte

- `2026-07-19-land-empfaenger-landesregierung-landtag-oder-mdl-entscheiden.md`: Institutioneller Land-Standard und Grenzen gegen Scheingenauigkeit.
- `2026-08-11-bestimmte-abgeordnete-anschreiben-personensuche-fuer-brief-und-kampagne.md`: Der größere, optionale Empfänger-Suchmodus; der freie Land-Picker ist inzwischen teilweise umgesetzt.
- `2026-06-08-999.6-fetch-landtag-cron-monitoring.md`: Datenfrische und Monitoring bleiben ein separates Ops-Thema.
