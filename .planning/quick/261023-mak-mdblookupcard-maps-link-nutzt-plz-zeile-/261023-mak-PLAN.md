---
quick_id: 261023-mak
---
# Maps-Link nutzt PLZ-Zeile

1. In `web/src/components/MdbLookupCard.tsx` die Maps-Suche aus Straßenzeile + PLZ-Zeile (`/^\d{5}\s+\S/`) bauen statt `officeLines.slice(-2)`; ohne PLZ-Zeile kein Maps-Link.
   - verify: eslint auf die Datei, alle 1063 Büros aus `web/data/constituency-offices.json` ergeben eine Suche ohne Telefonnummer
