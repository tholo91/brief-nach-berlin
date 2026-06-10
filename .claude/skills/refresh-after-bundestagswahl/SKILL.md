---
name: refresh-after-bundestagswahl
description: "Brief nach Berlin: kompletter Daten-Refresh nach einer neuen Bundestagswahl. Lädt MdBs + Ausschüsse via Abgeordnetenwatch neu UND baut das PLZ→Wahlkreis-Mapping aus den neuen Bundeswahlleiter-Daten neu. Schont die Abgeordnetenwatch-API. Nur nach einer Wahl nötig, nicht im Alltag."
user_invocable: true
---

# Refresh nach Bundestagswahl

Operator-Runbook für den kompletten Daten-Refresh nach einer **neuen Bundestagswahl**. Die App hat zwei statische Datensätze, die beide an die Legislaturperiode gebunden sind. Nach einer Wahl werden Wahlkreis-Grenzen oft neu gezogen (zuletzt bei BTW25 durch die Wahlrechtsreform 2025) — dann muss **beides** neu gebaut werden.

## Wann nutzen

- Nach einer Bundestagswahl, sobald Abgeordnetenwatch die neue Legislatur erfasst hat (meist ein paar Wochen nach der Wahl).
- NICHT im Alltag. Für reine Zwischen-Updates (Nachrücker, gestorbene/zurückgetretene MdBs) reicht Pipeline A allein.
- Auslöser z.B.: "lass uns die MdBs nach der Wahl neu laden" oder "/refresh-after-bundestagswahl".

## Warum BEIDE Pipelines (der wichtigste Punkt)

Beide Outputs joinen über die **Wahlkreis-Nr**:
- `web/data/politicians-cache.json` → Feld `wahlkreisId` pro MdB
- `web/data/plz-wahlkreis-mapping.json` → `{ "PLZ": [wahlkreisNr, ...] }`
- `web/src/lib/lookup/plzLookup.ts` verbindet PLZ → Wahlkreis-Nr → MdB.

Wenn die Wahlkreis-Einteilung sich ändert und du **nur** die MdBs neu lädst, zeigt die PLZ-Eingabe stillschweigend auf falsche Wahlkreise. Kein Fehler, keine Warnung — einfach der falsche Abgeordnete. Deshalb: nach einer Wahl immer beide Pipelines, in dieser Reihenfolge.

## Repo

Alle Pfade unter `/Users/thomas/Documents/Git Repos/brief-nach-berlin`. Die App liegt in `web/`. Scripts in `web/scripts/`, Daten in `web/data/`. Befehle aus `web/` ausführen.

---

## Pipeline A — MdBs + Ausschüsse (Abgeordnetenwatch)

**Script:** `web/scripts/fetch-politician-data.ts` · **Befehl:** `npm run fetch:politicians` · **Output:** `web/data/politicians-cache.json` · **Quelle:** Abgeordnetenwatch API v2 (CC0, kein Auth)

Das Script lädt die Mandate der Legislatur, baut das Cache-Schema, und hängt pro Mandat die Ausschussmitgliedschaften an (`committee-memberships`-Endpoint). Ausschüsse werden **sequenziell mit 600ms Delay** geladen (`COMMITTEE_DELAY_MS`, Concurrency 1) — das ist der API-schonende Teil und dauert bei ~600 MdBs rund 6-10 Minuten.

### Schritt A1 — Neue parliament_period-ID finden (PFLICHT)

In `fetch-politician-data.ts` ist die Periode hart kodiert:

```ts
// Zeile ~28
const BUNDESTAG_PERIOD = 161; // 21. Bundestag (2025–2029)
```

Nach einer Wahl gibt es eine neue ID. Finde sie:

```bash
curl -s "https://www.abgeordnetenwatch.de/api/v2/parliament-periods?parliament=5&type=legislature" \
  | python3 -m json.tool | grep -iE '"id"|"label"|"start_date"' | head -20
```

`parliament=5` ist der Bundestag. Nimm die `id` der neuen Legislatur (höchstes `start_date`) und trage sie in `BUNDESTAG_PERIOD` ein. Den Kommentar mit Jahreszahl mit aktualisieren.

### Schritt A2 — Adresse / Konstanten prüfen

- `BUNDESTAG_ADDRESS` (Zeile ~33) bleibt normalerweise `Platz der Republik 1, 11011 Berlin`. Nur ändern, wenn der Bundestag umzieht (praktisch nie).
- `mandate_won`-Logik (`constituency`/`list`/`moved_up`) ist stabil; nichts zu tun, solange Abgeordnetenwatch das Schema nicht ändert.

### Schritt A3 — Lauf

```bash
cd web && npm run fetch:politicians
```

Bei hartem Rate-Limiting (viele `HTTP 429` in der Konsole): `COMMITTEE_DELAY_MS` von 600 auf z.B. 1000-1500 erhöhen und neu starten. Der eingebaute 429-Backoff fängt einzelne Treffer ab; dauerhaftes 429 heißt "langsamer machen".

### Schritt A4 — Verifizieren

Das Script druckt am Ende eine Zusammenfassung. Prüfe:
- **Anzahl Einträge** plausibel (21. BT: ~600). Bei massiver Abweichung stimmt die Period-ID nicht.
- **Committees attached: X/Y** — sollte deutliche Mehrheit sein (Richtwert ~90%; Fraktions-/Regierungsspitzen ohne regulären Ausschusssitz sind korrekt leer).
- **Sample-Zeile** zeigt einen echten MdB mit Wahlkreis.

Stichprobe gegen die Website:
```bash
cd web && python3 -c "import json; d=json.load(open('data/politicians-cache.json')); \
m=[p for p in d['bundestag'] if p['lastName'] in ('Lauterbach','Gysi','Hofreiter')]; \
print(json.dumps([{'name':p['firstName']+' '+p['lastName'],'wk':p['wahlkreisId'],'committees':p.get('committees')} for p in m], ensure_ascii=False, indent=2))"
```

---

## Pipeline B — PLZ→Wahlkreis (Bundeswahlleiterin + Geonames)

**Script:** `web/scripts/parse-plz-mapping.ts` · **Befehl:** `npm run build:plz` · **Output:** `web/data/plz-wahlkreis-mapping.json`

Joint die offizielle Wahlkreis↔Gemeinde-Tabelle der Bundeswahlleiterin mit Geonames (PLZ→Gemeinde) plus Stadtstaat-Polygone für Berlin/Hamburg/Bremen.

### Schritt B1 — Neue Bundeswahlleiterin-Daten besorgen (PFLICHT bei neuer Wahlkreis-Einteilung)

Inputs in `web/data/raw/`:

| Datei | Quelle | Ändert sich nach Wahl? |
|---|---|---|
| `btw25_wkr_gemeinden.csv` | **Bundeswahlleiterin Opendata** | **JA** — neue Wahlkreis↔Gemeinde-Zuordnung |
| `btw25-stadtstaaten-polygons.json` | Wahlkreis-Grenzen Berlin/HH/HB | **JA, wenn Grenzen neu** |
| `plz-polygons-stadtstaaten.geojson` | PLZ-Polygone | Nein (PLZ-Grenzen stabil) |
| `geonames_de.txt` | Geonames DE (ODbL) | Nein (selten) |

**Wo runterladen:** [bundeswahlleiterin.de](https://www.bundeswahlleiterin.de) → Bundestagswahlen → *[Jahr]* → Ergebnisse → **Opendata**, bzw. die Rubrik *Wahlkreiseinteilung / Strukturdaten*. Gesucht ist die CSV, die **Wahlkreis-Nr ↔ Gemeinde (mit RGS/AGS)** auflistet — das Pendant zu `btw25_wkr_gemeinden.csv`.

> **Wichtig:** Die Bundeswahlleiterin liefert Wahlkreis-Geometrie und -Zuordnung — **keine Ausschüsse**. Ausschussdaten gibt es ausschließlich über Abgeordnetenwatch (Pipeline A). Die beiden Quellen ersetzen sich nicht.

Neue CSV nach `web/data/raw/` legen. Dann in `parse-plz-mapping.ts` den Pfad anpassen:
```ts
// Zeile ~36
const BTW_CSV = path.join(DATA_DIR, "raw/btw25_wkr_gemeinden.csv"); // → neuen Dateinamen eintragen
```
(Sauberer: Datei gleich passend benennen oder die Konstante umbenennen.)

### Schritt B2 — Stadtstaat-Konstanten prüfen (PFLICHT bei geänderter Nummerierung)

Wenn die **Wahlkreis-Nummern** sich ändern, sind diese hart kodierten Werte in `parse-plz-mapping.ts` stale und müssen aktualisiert werden:

- `STADTSTAAT_WKS` (Zeile ~53): die gültigen Wahlkreis-Nr je Stadtstaat
  (Berlin `74–85`, Hamburg `18–23`, Bremen `54,55` — Stand BTW25).
- `STADTSTAAT_PLZ_RANGES` (Zeile ~65): PLZ-Bereiche je Stadtstaat (stabil, PLZ ändern sich nicht).
- `STADTSTAAT_AGS5` (Zeile ~49): AGS-5 der Stadtstaaten (stabil).

Die neuen Wahlkreis-Nummern je Stadtstaat stehen in der neuen Bundeswahlleiterin-CSV.

### Schritt B3 — Lauf

```bash
cd web && npm run build:plz
```

### Schritt B4 — Verifizieren

Das Script druckt am Ende **Spot checks** für bekannte PLZ (Nicht-Stadtstaat-Regression, Berlin/Hamburg/Bremen, plus Großempfänger-PLZ die `DROPPED` sein sollen). Prüfe:
- **Gesamtzahl Einträge** plausibel (Richtwert BTW25: mehrere tausend PLZ).
- **Spot checks** liefern sinnvolle Wahlkreis-Nr und Großempfänger sind `DROPPED`.
- **Unmatched** nicht ungewöhnlich hoch (→ CSV-Format oder AGS-Spalten geändert).

> Falls die Spot-Check-PLZ nach der neuen Einteilung anderen Wahlkreisen zugeordnet sind: die erwarteten Werte in der Spot-Check-Liste (Zeile ~597) mit anpassen, damit der Check aussagekräftig bleibt.

---

## Schritt C — End-to-End-Sanity + Commit

1. **Join-Check:** Eine bekannte PLZ durch `plzLookup.ts` schicken (oder im laufenden `npm run dev` einen Brief mit einer Test-PLZ starten) und prüfen, dass der zurückgegebene MdB zum erwarteten Wahlkreis passt. Das fängt den Fall ab, dass die beiden Datensätze auf unterschiedlichen Wahlkreis-Nummerierungen sitzen.
2. **Typecheck:** `cd web && npx tsc --noEmit` — keine neuen Fehler.
3. **Commit** beide Datendateien + Script-Änderungen zusammen, damit Cache und Mapping immer konsistent versioniert sind:
   ```bash
   git add web/scripts/fetch-politician-data.ts web/scripts/parse-plz-mapping.ts \
           web/data/politicians-cache.json web/data/plz-wahlkreis-mapping.json \
           web/data/raw/
   git commit
   ```
   Commit-Message: was neu (z.B. "data: refresh MdBs + PLZ-Mapping auf 22. Bundestag").

## Reihenfolge auf einen Blick

```
A1 Period-ID updaten → A3 fetch:politicians → A4 verify
B1 neue BWL-CSV holen → B2 Stadtstaat-Nr prüfen → B3 build:plz → B4 verify
C  Join-Check → tsc → ein gemeinsamer Commit
```

## Fallstricke

- **Nur Pipeline A laufen lassen** nach geänderter Wahlkreis-Einteilung = stilles Fehlrouting. Immer beide.
- **Period-ID vergessen** = Script lädt die alte Legislatur erneut (Anzahl wirkt plausibel, Daten sind aber veraltet). Immer A1 zuerst.
- **Abgeordnetenwatch 429** = `COMMITTEE_DELAY_MS` hoch, nicht abbrechen. Die Daten sind CC0, aber die API ist klein — fair bleiben.
- **Stadtstaat-Nummern** in `parse-plz-mapping.ts` sind hart kodiert; bei Neueinteilung mitziehen, sonst kippen Berlin/HH/HB.
