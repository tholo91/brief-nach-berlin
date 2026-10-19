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
