---
quick_id: 261009-mxa
status: complete
---

# Quick 261009-mxa: Unterseite /bundestag-besuch-kostenlos

## Ergebnis
- Neue Seite `web/src/app/(site)/bundestag-besuch-kostenlos/page.tsx` (Frage-H1, zwei Wege, 3 Schritte mit kopierbarem Anruftext, Wahlkreisveranstaltungen, 6 FAQ, Article- und FAQPage-JSON-LD, Stand Oktober 2026).
- PLZ-Karte `MdbLookupCard` + Server Action `lookupMdbContactAction`, Logik in `web/src/lib/lookup/mdbContact.ts` (Namens-Join mit `constituency-offices.json`, Fallback abgeordnetenwatch-Link).
- Treppe: neue Stufe 7, Stufen 8 bis 11, "elf Stufen" in Treppe, FAQ, Meta, `aktiv-werden`.
- Sitemap-Eintrag (Priorität 0.8).
- Bildprompts `prompts/bundestag-besuch/image/001` (16:9) und `002` (OG 1.91:1). Seite zeigt Hero/OG automatisch, sobald `web/public/images/img-bundestag-besuch.webp` und `og-bundestag-besuch.webp` existieren.
- `.planning/brand-identity.md` 6.4a: "Solarpunk nur als Hauch".

## Verifikation
- `npx jest`: 110 Suites, 923 Tests grün (neu: `mdbContact.test.ts`, 8 Tests).
- ESLint auf allen geänderten Dateien sauber, `tsc` ohne Fehler in den geänderten Dateien (vorhandene Fehler in iCloud-Duplikaten unter `.next/` und `campaignTopicReset.test.ts` sind nicht von dieser Aufgabe).
- Browser: Seite lädt ohne Konsolenfehler, PLZ 28195 liefert 4 Abgeordnete mit Büroadresse und Link, mobil (375px) kein horizontaler Scroll, keine Gedankenstriche.

## Nicht geprüft
- `npm run build` nicht gelaufen (ein anderer Dev-Server nutzt `.next` im selben Ordner).
- Bilder fehlen noch, Hero und OG erscheinen erst nach dem Ablegen der Dateien.
