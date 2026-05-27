---
phase: 04-stadtstaaten-plz-wahlkreis-genauigkeit-und-wahlkreis-gruppie
plan: "01"
subsystem: data-pipeline
tags: [geodaten, plz, turf, dsgvo, odbl]
dependency_graph:
  requires: []
  provides: [web/data/raw/plz-polygons-stadtstaaten.geojson, "@turf/intersect", "@turf/area"]
  affects: [web/scripts/parse-plz-mapping.ts (plan 04-02 konsumiert diesen Datensatz)]
tech_stack:
  added: ["@turf/intersect@7.3.5", "@turf/area@7.3.5"]
  patterns: [brotli-decompress-at-buildtime, gitignore-exception-fuer-kleine-geodatei]
key_files:
  created:
    - web/data/raw/plz-polygons-stadtstaaten.geojson
    - web/scripts/filter-plz-polygons.ts
  modified:
    - web/.gitignore
    - web/package.json
    - web/package-lock.json
    - web/src/app/(site)/datenschutz/page.tsx
decisions:
  - "GeoJSON ueber .gitignore-Exception committiert (analog zu btw25-stadtstaaten-polygons.json)"
  - "filter-plz-polygons.ts bleibt aus dem Build-Prozess heraus -- nur manuell laufen lassen"
  - "ODbL-Attributierung mit OSM-Link in Abschnitt 5 der Datenschutz-Seite platziert"
metrics:
  duration: "~30 min"
  completed: "2026-05-28"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 4
---

# Phase 04 Plan 01: Datensatz-Grundlage fuer Stadtstaat-PLZ-Genauigkeit

Gefilteter PLZ-Polygon-Subset fuer Berlin/Hamburg/Bremen (324 Features, ODbL), turf.js-Geometrie-Bibliotheken als devDependencies, und ODbL-Pflichtattributierung auf der Datenschutz-Seite.

## Erledigte Tasks

| Task | Name | Commit | Dateien |
|------|------|--------|---------|
| 1 | PLZ-Polygon-Subset + Filterskript | 73088e9 | web/data/raw/plz-polygons-stadtstaaten.geojson, web/scripts/filter-plz-polygons.ts, web/.gitignore |
| 2 | @turf/intersect + @turf/area als devDependencies | 2efa99f | web/package.json, web/package-lock.json |
| 3 | ODbL-Attributierung Datenschutz-Seite | 73f66b7 | web/src/app/(site)/datenschutz/page.tsx |

## Abweichungen vom Plan

### Auto-Fixed

**1. [Rule 3 - Blocking] .gitignore blockierte Commit der GeoJSON-Datei**

- **Gefunden waehrend:** Task 1
- **Problem:** web/.gitignore hatte `/data/raw/*` mit Ausnahme nur fuer `btw25-stadtstaaten-polygons.json`. Das neue `plz-polygons-stadtstaaten.geojson` wurde geblockt.
- **Fix:** Zweite Ausnahme `!/data/raw/plz-polygons-stadtstaaten.geojson` hinzugefuegt -- analog zum bestehenden Muster.
- **Dateien geaendert:** web/.gitignore
- **Commit:** 73088e9

## Verifikation

- 324 Features mit PLZs 20249, 20354, 22417, 10997, 28195 bestaeigt.
- `@turf/intersect` und `@turf/area` als devDependencies, importierbar via tsx, nicht in `dependencies`.
- Datenschutz-Seite Abschnitt 5 traegt "Postleitzahl-Geodaten: (c) OpenStreetMap contributors, ODbL 1.0." -- kein Gedankenstrich.
- Lint fuer datenschutz/page.tsx fehlerfrei (bestehende Fehler in anderen Dateien sind pre-existing).
- Keine Runtime-API-Aufrufe eingefuehrt (PRIV-02 erhalten).

## Known Stubs

Keine -- alle drei Outputs sind vollstaendige, produktionsreife Artefakte.

## Self-Check: PASSED

- web/data/raw/plz-polygons-stadtstaaten.geojson: FOUND
- web/scripts/filter-plz-polygons.ts: FOUND
- Commit 73088e9: FOUND
- Commit 2efa99f: FOUND
- Commit 73f66b7: FOUND
