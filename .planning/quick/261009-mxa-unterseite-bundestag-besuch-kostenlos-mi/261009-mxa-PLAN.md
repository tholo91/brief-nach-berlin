---
quick_id: 261009-mxa
mode: quick
---

# Plan: Unterseite `/bundestag-besuch-kostenlos` + Treppe-Stufe + Bildprompts

## Context
MdBs können über das Bundespresseamt (BPA) Bürger:innen aus ihrem Wahlkreis kostenlos nach Berlin einladen (Fahrt, Hotel, Teil der Verpflegung). Brief nach Berlin soll dazu eine schöne, kurze Info-Seite bekommen: SEO/GEO stärken, Anleitung zum Anfragen (Anruf/Mail), Wahlkreisveranstaltungen erklären, ein CTA. Kein Briefflow, keine Spende. Die Reise kommt als neue Stufe auf die Treppe der Selbstwirksamkeit.

## Entschieden (Grill-Ergebnis)
- Slug `/bundestag-besuch-kostenlos`, H1 als Frage. "BPA-Fahrt" in H2/FAQ.
- Seite ist reine Info + Anleitung. Statt Brief: kurzer höflicher Anruf-/Mail-Text zum Kopieren.
- CTA = kleine PLZ-Suche -> Karte mit Name, Partei, Wahlkreis + Button "Wahlkreisbüro & Kontakt". Hinweis: Telefon steht meist auf der MdB-Homepage unter "Kontakt".
- Kleiner Kasten "Ohne MdB": Selbstanmeldung für Plenum/Kuppel beim Besucherdienst (bundestag.de/besuche, kostenlos).
- Wahlkreisveranstaltungen: erklären (Sitzungswochen vs. Wahlkreiswochen, Bürgersprechstunden), Link auf Bundestags-Sitzungskalender, keine hartcodierten 2027-Termine.
- Aussagen nur gesichert, "Stand Oktober 2026": BPA zahlt Fahrt/Hotel (Doppelzimmer)/Teil der Verpflegung, MdB entscheidet allein, kein Anspruch, Haushaltsvorbehalt, ab 18. Muster nur als "viele Büros" (Wohnsitz im Wahlkreis, Warteliste, oft keine zweite Teilnahme). Keine Beispiel-MdB, keine Zusagen, kein Betrag "wie viel Eigenanteil".
- Treppe: neue Stufe 7 "Zur Bundestagsfahrt einladen lassen" (zwischen Bürgersprechstunde und Landtag), verlinkt auf die neue Seite. Stufen ab 7 rücken nach, "10 Stufen" -> 11 überall.
- Bild: erfundene Abgeordnete, Gruppe vor dem Reichstag im Gespräch auf Augenhöhe, gemischte Gruppe, Ghibli-Stil, Solarpunk nur als Hauch. Ein Hero-Bild 16:9 plus ein eigenes OG-Bild 1.91:1 (Annahme: das ist mit "OG extra" gemeint).
- Brand-Doku: "Solarpunk nur ein Hauch" punktuell in `.planning/brand-identity.md` eintragen.
- Ablauf: parallel, Seite mit Platzhalter-Bild; nur meine Dateien committen, und nur auf Zuruf.

## Umsetzung (über `/gsd-quick`, UI mit `/frontend-design`, Struktur mit `add-subpage`)
1. **Bildprompts** `prompts/bundestag-besuch/image/001-hero-reichstag-gespraech.md` (16:9) und `002-og-reichstag-gespraech.md` (1.91:1), nach dem Format von `prompts/stimmen-hero/image/001-germany-letters-to-reichstag.md` (Header Type/Status/Target tool/Aspect ratio, `## Prompt` Codeblock, Kompositionsnotizen). Regeln aus `.planning/brand-identity.md` 6.2/6.4a: Creme/Waldgrün-Palette, kein Text/UI, keine erkennbaren Politiker, keine Laptops/Handys, kein Stock-Look, keine Parteifarben.
2. **Brand-Doku**: Solarpunk-Dosierung in `.planning/brand-identity.md` punktuell ergänzen (Datei ist schon dirty, nur dieser Hunk).
3. **PLZ-Karte (wiederverwendbar, ohne Briefflow)**: neue Client-Komponente `MdbLookupCard` + schlanke Server Action, die `lookupPLZ` aus `web/src/lib/lookup/plzLookup.ts:88` aufruft. Büro-Link per Namens-Join mit `web/data/constituency-offices.json` (nur serverseitig lesen, nicht ins Client-Bundle). Fallback bei fehlendem Match: `abgeordnetenwatchUrl`. Parteikürzel via `formatPartyShort` (`web/src/lib/formatParty.ts`). Mehrere Wahlkreise pro PLZ: alle Treffer zeigen. `Step1Form`/`Step3Success` bleiben unangetastet.
4. **Seite** `web/src/app/(site)/bundestag-besuch-kostenlos/page.tsx` nach `add-subpage`-Skelett (URL_PATH/PUBLISHED/TITLE/DESCRIPTION 150-160 Zeichen, Metadata mit canonical + OG, FAQPage- und Article-JSON-LD, 4-6 FAQ, `FAQAccordion`, `APP_URL`). Editorial-Komponenten aus `components/editorial/` (Prose, FactCallout, PullQuote, SectionDivider). Aufbau, kurz gehalten: Hero (Frage-H1, Kurzantwort, Bild) -> "Zwei Wege" (BPA-Fahrt mit MdB / Besucherdienst ohne MdB) -> Anleitung in 3 Schritten mit kopierbarem Anruf-/Mail-Text -> Wahlkreisveranstaltungen -> PLZ-Karte als CTA -> FAQ -> Stand-Hinweis. Mindestens 2 interne Links (Treppe, `wahlkreisbuero-oder-berlin`, `guide`). Copy: keine Gedankenstriche, Anti-KI-Checkliste, Sie/Du konsistent zur Site.
5. **Treppe**: `web/src/app/(site)/treppe-der-selbstwirksamkeit/page.tsx` (`steps`-Array ab Zeile 93): neue Stufe einfügen, `n` neu nummerieren, "10 Stufen" per Grep in Texten/Meta/JSON-LD/Footer auf 11 ziehen, Link auf die neue Seite.
6. **Sitemap** `web/src/app/sitemap.ts` (priority 0.8), optional Footer-/Guide-Link wie bei den anderen Themenseiten.
7. **Test**: Unit-Test für den Büro-Join und `MdbLookupCard`-Logik im Stil von `web/src/__tests__/`.

## Verifikation
- `npm run build`, Lint und Tests grün (Befehle aus `web/package.json`).
- Preview: Seite auf Desktop + Mobil (375px) per Screenshot, Konsole/Netzwerk ohne Fehler.
- PLZ-Test: z. B. 28195 (Bremen) liefert MdB-Karte mit funktionierendem Button; eine PLZ mit mehreren Wahlkreisen; ungültige PLZ -> freundliche Fehlermeldung.
- Treppe zeigt 11 Stufen, Link auf neue Seite funktioniert, keine übrig gebliebenen "10 Stufen".
- Sitemap enthält die neue URL, JSON-LD parsebar.
- Platzhalter-Bild ersetzt sich später durch `web/public/images/img-bundestag-besuch.webp` (Dateiname fix vereinbart).

## Offene Annahmen
- "OG extra" = eigenes OG-Bild 1.91:1 neben dem Hero. Falls nicht gemeint: zweiten Prompt streichen.
- Namens-Join von 638 Büro-Datensätzen kann einzelne Fehltreffer haben; Fallback abgeordnetenwatch-Link deckt das ab.
- Die untergeordnete Frage Landtag-Besuche kommt nicht auf die Seite (Ländersache, nicht verifiziert).
