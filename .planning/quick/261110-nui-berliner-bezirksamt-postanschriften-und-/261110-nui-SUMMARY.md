---
quick_id: 261110-nui
status: complete
commits: 3
plan_head_before: 08f849e556ae32b236d49b7b3cdab3a7dd39c755
plan_head_after: b5f48722cfa783efd56521577b3e62225e7a3794
---

# Quick 261110-nui: Berliner Bezirksamt-Postanschriften und besserer Rathaus-Fallback

Berliner Kommune-Briefe bekommen jetzt eine berlin.de-Postanschrift (12 Bezirke), mehrdeutige PLZ listen die Bezirke mit Adresse, und der Restfall zeigt Satz plus Button "Adresse suchen" mit Ortsname in der Suche.

## Commits
- 1b5b5ac feat(kommune): Daten, Adress-Union `official`, Lookup, Envelope, Ort in Suche
- 8c27544 feat(kommune): UI und Mail (Kandidatenliste, Button, Quellenname)
- b5f4872 test(kommune): Tests angepasst und ergänzt

## Verification
- `npx jest`: 181/181 Suites, 1778/1778 Tests grün
- `npx tsc --noEmit`: Exit 0
- eslint auf geänderte Dateien: ohne Befund

## Deviations
- [Rule 3] `Step3Success` darf `RathausAdresseButton` laut `successPageExperience.test.ts` nicht erwähnen. Gemeinsame Teile (Kandidatenliste, Suchbutton) liegen deshalb in neuer Datei `web/src/components/wizard/RathausHinweise.tsx`.
- Zusatzfelder: `recipientLine?` an der `official`-Adresse und `recipientLine` pro Kandidat (offizielle erste Umschlagzeile "Bezirksamt X von Berlin"), `formatBezirkeList` in `recipientEnvelope.ts`.
- Die `=== "destatis"`-Umstellung in `buildEmailHtml`, `Step3Success`, `RathausAdresseButton` lag schon in Commit 1, damit `tsc` je Commit grün bleibt.
- Tests liefen zwischen Commit 1 und 3 rot (erwartet, Tests erst in Commit 3).

## Copy
- Mehrdeutig: "Deine PLZ liegt in {A oder B}. Nimm die Adresse deines Bezirks:" (3 Kandidaten: "A, B oder C")
- Fallback: "Die Postanschrift konnte ich für deine PLZ nicht sicher zuordnen."
- Button: "Adresse suchen"
- Mail: en/tr analog in `mailLocale.ts`.

## Known Stubs
None.
