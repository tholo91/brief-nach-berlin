---
quick_id: 261009-sdc
status: complete
date: 2026-10-09
commits: 3
plan_head_before: 96f2a91
plan_head_after: eeedc4b
---

# Quick 261009-sdc: Politiker-Daten aktualisieren (Stand 09.10.2026)

Zschau ersetzt Junge im Bundestag-Cache, Landtag Sachsen-Anhalt auf neue Periode 178, RP-Ministerpräsident Schnieder, Fetch-Skripte gegen Datenverlust abgesichert.

## Commits

| Task | Hash | Inhalt |
|------|------|--------|
| 1 | bdd6add | Fetch-Skripte behalten Landtag-Daten (fetch-politician-data behält landtag[], fetch-landtag-data behält MdL bei 0 Mandaten/keiner Periode, Feld `bundeslandKey`) |
| 2 | 77b53aa | politicians-cache.json + plz-landtagswahlkreis-mapping.json neu |
| 3 | eeedc4b | RP Gordon Schnieder, Test-Anpassung, Runbook "Nach Landtagswahlen" |

## Vorher / Nachher

- MdB: 608 -> 608. Entfernt: Frank Junge, Stephan (Nachname); neu: Katrin Zschau (WK 14 Rostock - Landkreis Rostock II), Steinmüller. `grep -c Junge` = 0.
- Committees attached: 550/608 (vorher 549). Ein Mandat (Akbulut, id 68381) scheiterte an 429 und wurde aus dem alten Cache wiederhergestellt.
- MdL gesamt: 1722 -> 1757.
- MdL pro Land vorher -> nachher: BE 152 -> 152, ST 47 -> 82, MV 75 -> 75, BW 153 -> 153, RP 98 -> 98. Übrige Länder unverändert.
- PLZs mit WK-Match: 7517 -> 7517 (ST-PLZs im Mapping vorher/nachher gleich, kein Kollaps; 142 PLZ-Einträge mit geänderten Wahlkreisen). Log ST: 93/219 PLZs.

## Perioden laut fetch:landtag-Log

ST 178 "2026-2031" (83 Mandate, 82 übernommen), BW 165, RP 166, MV 134 (2021-2026, unverändert), BE 133 (2021-2026, unverändert), SH 138, SN 157, BB 158, TH 156, SL 137, BY 149, NI 143, HE 150, HB 146, NW 139, HH 162. Kein Land mit 0 Mandaten, keine WARN-Zeilen.

## Test / Build

- `npm test`: 115/115 Suites, 1008/1008 Tests grün (nach Anpassung von `landesregierungHeads.test.ts`, RP erwartet verifiedAt 2026-10-09).
- `npm run build`: erfolgreich. `tsc --noEmit`: ohne Fehler.

## Deviations

1. [Rule 3] Test `landesregierungHeads.test.ts` erwartete für alle Länder verifiedAt 2026-09-24; RP-Eintrag jetzt 2026-10-09, Test entsprechend angepasst.
2. Wahlkreisbüro-Scraper (`scripts/fetch-constituency-offices.ts`): **nicht erfolgreich**. bundestag.de liefert geändertes HTML, der Parser findet 0 Einträge und überschrieb `constituency-offices.json` mit leeren Daten. Datei per `git checkout` wiederhergestellt, nichts committet. Folge: Zschau ist NICHT in constituency-offices.json (Junge, Frank steht dort weiter). Das Skript braucht einen Parser-Fix (Karten-Markup `e-teaserCardProfile`, Name in `.e-teaserCardProfile__title`, Partei in `__text`; `data-id`/`bt-person-fraktion` existieren nicht mehr) und sollte nie mit 0 Einträgen überschreiben. Außerhalb des Scopes, nicht behoben.
3. Neben bdd6add/77b53aa/eeedc4b liegen zwei fremde Commits (d8fcbaa, bb18e43) auf main, nicht von dieser Aufgabe.

## Known Stubs

None.

## Self-Check: PASSED
