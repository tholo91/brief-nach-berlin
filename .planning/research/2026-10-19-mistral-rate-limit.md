# Mistral-Rate-Limit: Befund und Stand (19.10.2026, vertagt)

Status: vertagt auf morgen. Am Repo und bei Mistral nichts geändert. Rohdaten und Testskripte liegen in `2026-10-19-mistral-modelltest/` (`modeltest.ts`, `probe.ts`, Ergebnisse als JSON).

## Problem (verifiziert)

- Brief-Generierung läuft über `mistral-large-latest`. Das ist laut Mistral-Doku Mistral Large 3 (`mistral-large-2512`). Limit laut Mistral-Konsole (Admin > API > Limits): 0,25 Anfragen/s = 15 pro Minute, pro Organisation.
- 19.10. (Vercel-Logs, Production): 755 Briefe zwischen 15:18 und 17:09, davon 16 als Fehler 502 (Mistral 429, Stage "generation"). Zwei Spitzen: 16:05 (9 von 22 Anfragen) und 16:17/16:18 (7 von 26). Bis ca. 14 Briefe/Minute ging es ohne 429.
- Pro Brief ca. 1,085 Large-Aufrufe (8,5 % Längen-Retry) plus ca. 1 Small-Aufruf (Routing, eigenes Limit 100/min, nie auffällig).
- Der Retry in `web/src/lib/mistral.ts` wartet nur 2 s und 4 s (kein Retry-After ausgewertet), gibt nach ca. 6 s auf. Gegen ein Minuten-Limit hilft das nicht.
- Alle 4 API-Keys liegen im selben Default Workspace derselben Organisation. Ein Extra-Key bringt nichts.
- Hinweis, kein Beweis: In der Spitze 16:04 bis 16:07 passt die Zahl der erfolgreichen Large-Aufrufe in Mistrals Nutzung (45) exakt zu den Live-Logs, also keine Testläufe dabei. In 16:17 bis 16:20 zeigt Mistral 41 statt 32 nach Logs, ca. 9 Aufrufe mehr (mögliche Testläufe, Zeitgrenzen unscharf).

## Optionen

Limits pro Modell (Mistral-Konsole): Large 3 = 15/min. `mistral-large-4` = 500/min (neu seit 06.10.2026, Public Preview). `mistral-medium-latest` (Medium 3.5) = 1000/min. `mistral-small-2603` = 100/min.

1. **Support** um höheres Limit für Large 3 bitten (laut Doku der Weg: Modelle, Ziel-Anfragen/s, Tokens/min, Use Case nennen). Wert aus den Logs: Spitze 22 Briefe/min = ca. 25 Large-Aufrufe/min, mit Puffer ca. 50/min. Konto-Aktion, nur Thomas.
2. **Modellwechsel** der Brief-Generierung (`MISTRAL_MODELS.letter`). Qualität ist der Knackpunkt, siehe Test unten.
3. **Retry verbessern** (`mistral.ts`): bei 429 länger warten (Retry-After oder 10 bis 20 s, `maxDuration` ist 60 s), 429 beim Längen-Retry nicht still schlucken. Hilft bei kurzen Spitzen, schafft aber kein Limit.
4. **Fallback**: bei 429 von Large 3 auf Medium ausweichen.

## Modelltest (Zwischenstand, 5 Testtexte + Kampagnentext prueft-die-afd, Tonstufe 3, Länge "1" = 200 bis 240 Wörter)

- `mistral-large-4` denkt standardmäßig (Antwort = Array mit `thinking`-Block). Ohne Änderung meldet die Pipeline "Mistral returned empty response". Mit `reasoningEffort: "none"` kommt wieder ein String (0 Reasoning-Tokens). Medium liefert direkt einen String.
- Large 4 (Denken aus): in 11 von 11 Briefen zu kurz (104 bis 183 Wörter, Soll 200 bis 240). Jeder Brief löste den Längen-Retry aus (also 2 Aufrufe statt 1), danach trotzdem 122 bis 183 Wörter. Weitere Auffälligkeiten einzelner Briefe: "nicht nur ... sondern", "sowohl ... als auch", Wort "Daseinsvorsorge", Bitte um Antwort. Large 4 mit Denken an wurde nicht getestet (langsamer, teurer, mehr Output-Tokens).
## Modelltest Ergebnis (fertig, 30 Briefe, `2026-10-19-mistral-modelltest/modeltest-results.json`)

| Modell | Briefe | Wörter (Median, Soll 200 bis 240) | Längen-Retry | Gedankenstrich | Median-Dauer |
|---|---|---|---|---|---|
| Large 3 (`mistral-large-latest`, live) | 6 | 195 | 5 von 6 | 5 von 6 | 14 s |
| Large 4 (Denken aus) | 12 | 138 | 10 von 12 | 0 | 12 s |
| Medium 3.5 (`mistral-medium-latest`) | 12 | 119 | 12 von 12 | 0 | 5 s |

- Beide Alternativen schreiben ca. 30 bis 40 % zu kurz (Medium 107 bis 152, Large 4 122 bis 184 Wörter) und lösen fast immer den Längen-Retry aus, der kaum hilft. Kein Fehler, kein 429, JSON-Schema funktioniert.
- Kampagnentext (prueft-die-afd, Landesregierung BW), gelesen: Medium und Large 4 bleiben nah am Kampagnentext und übernehmen "ergebnisoffen" bzw. "muss das Gericht prüfen". Large 3 (live) dichtet dazu: "Als Bürger dieses Landes", "AfD sitzt in allen Landesparlamenten", "autoritären Charakter", "verlieren wir am Ende alle unsere Freiheiten". Das verletzt die Regel "keine Erfindungen". Stichprobe von 1 Brief je Modell, kein Beleg für die Gesamtquote.
- Large 3 setzt in 5 von 6 Briefen Gedankenstriche, obwohl der Prompt sie verbietet. Medium und Large 4: 0 von 24.
- Die 5 Testtexte sind sehr kurz (ein bis drei Sätze). Das erhöht die Zahl der Längen-Retries gegenüber dem Live-Betrieb (dort 8,5 %).
- Der Test lief mit dem Arbeitsstand von `generateLetter.ts` (zwei Zeilen AfD-Partei-Absatz uncommittet geändert, irrelevant für die Testfälle).

Fazit: Ein reiner Modellwechsel ist kein Schnellschuss. Er hebt das Limit (500 bzw. 1000 pro Minute), braucht aber eine Längen-Anpassung im Prompt (z. B. höheres Wortziel) und einen Re-Test. Inhaltlich sind Medium und Large 4 beim Kampagnentext treuer als Large 3.

## Vorschlag für morgen

1. Support-Anfrage (Option 1) schicken. Fasst die Qualität nicht an, braucht aber Wartezeit.
2. Retry-Fix (Option 3) klein umsetzen, mit OK.
3. Modellwechsel als eigenes Experiment: Medium mit höherem Wortziel im Prompt, 10 bis 20 Briefe, Länge und Treue prüfen. Als Fallback bei 429 wäre Medium (5 s, eigener Topf) denkbar, aber mit kürzeren Briefen. Large 4 nicht vor Ende der Public Preview.
4. Keine Testläufe gegen `mistral-large-latest` während einer beworbenen Kampagne.

## Kosten (20.10.2026, Mistral-Konsole gelesen, nichts geändert)

- Gezahlt insgesamt 30 €: 06.03. 10 € (manuell, erst im Oktober aufgebraucht), 10.10. und 19.10. je 10 € per **Auto Recharge** (aktiv: bei Guthaben unter 10 € lädt Mistral 10 € nach). Guthaben am 20.10.: 18,10 €. Kein Modellwechsel im Code (`mistral.ts` seit 10.09. unverändert).
- Nutzung 01.10. bis 20.10. mittags: 14.653 Anfragen, geschätzt 16,34 €. Davon Large 3 ca. 15,2 € (Input 25,87 Mio. Tokens zu 0,43 €/Mio. = 11,00 €, Output 3,14 Mio. zu 1,28 €/Mio. = 4,00 €, gecachter Input 0,23 €), Small ca. 0,8 €.
- Pro Large-Aufruf im Schnitt 3.280 Input- und 400 Output-Tokens = ca. 0,19 Cent. Pro Brief ca. 0,2 Cent.
- Briefzahl: Zähler `letter_count` = 8.921 (gesamt). Kampagnen: eeg-so-nicht 3.473, prueft-die-afd 1.994, afd-vor-gericht 558. Mistral zeigt 7.881 Large-Aufrufe im Oktober = ca. 7.250 Briefe (bei 1,085 Aufrufen pro Brief). Passt zum Zähler (8.921 minus Stand vor Oktober). Die "2000" sind nur prueft-die-afd.
- Modelltests am 19./20.10.: Large 4 29 Aufrufe 0,04 €, Medium 26 Aufrufe 0,16 €, 6 Vergleichsbriefe Large 3 ca. 0,03 € (geschätzt).
- Preise pro 1 Mio. Tokens: Large 3 Input 0,43 € / Output 1,28 €. Medium 3.5 Input 1,28 € / Output 6,38 € (3- bis 5-mal teurer). Large 4 aktuell mit Einführungsrabatt Input 0,58 € / Output 1,78 €. Ein Wechsel auf Medium würde die Kosten also erhöhen, nicht senken.

## Kosten pro Brief nach Modell (20.10.2026)

Grundlage: Mistral-Kostenseite (Oktober, geschätzt) und die Modelltest-Läufe vom 19.10. Ein Brief = 1 Routing-Aufruf (Small) + 1 Brief-Aufruf (+ Längen-Retry, der die erste Antwort mitschickt). Alle Zahlen in Cent, geschätzt, ohne Mehrwertsteuer-Prüfung.

| Modell | Preis pro 1 Mio. Tokens (Input / Output) | Kosten pro Aufruf | Aufrufe pro Brief | Kosten pro Brief | pro 1.000 Briefe |
|---|---|---|---|---|---|
| Large 3 (live, `mistral-large-latest`) | 0,43 € / 1,28 € | 0,19 ct (Oktober-Schnitt, 7.881 Aufrufe) | 1,085 (Live-Wert 19.10.) | **0,22 ct** (inkl. Routing) | 2,2 € |
| Large 4 (Denken aus), Einführungsrabatt | 0,58 € / 1,78 € | 0,14 ct (Test, viel Cache) bis 0,27 ct (ohne Cache) | ca. 1,8 (10 von 12 mit Längen-Retry) | 0,3 bis 0,5 ct | 3 bis 5 € |
| Large 4, Normalpreis (Doku zeigt Originalpreis doppelt so hoch, Inferenz) | ca. 1,16 € / 3,56 € | ca. 0,5 ct | ca. 1,8 | 0,6 bis 1,0 ct | 6 bis 10 € |
| Medium 3.5 | 1,28 € / 6,38 € | 0,62 ct (Test) | 2 (12 von 12 mit Längen-Retry) | **1,24 ct** (mit nur 1 Aufruf 0,63 ct) | 12,4 € (bzw. 6,3 €) |

Weitere Posten pro Aufruf: Routing mit Small 0,012 ct. Voxtral-Spracheingabe 0,0043 ct pro Sekunde (30 s = 0,13 ct), nur bei Aufnahme.

Kostentreiber bei Large 3: Input 72 % (System-Prompt ca. 3.300 Tokens pro Aufruf), Output 26 %, gecachter Input 2 %. Ein kürzerer Prompt ist der Hebel, nicht das Modell.
