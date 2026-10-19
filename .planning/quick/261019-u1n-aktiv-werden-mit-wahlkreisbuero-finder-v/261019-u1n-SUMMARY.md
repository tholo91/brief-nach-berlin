---
quick_id: 261019-u1n
status: complete
commits: 2
---

# Quick 261019-u1n Summary: /aktiv-werden mit Wahlkreisbüro-Finder verbunden

## Commits
- 5b42616 feat(aktiv-werden): Wahlkreisbüro-Finder direkt auf der Seite
- 1379284 feat(email): MdB-Briefe verlinken auf Wahlkreisbüro und Sprechstunde

## Tests
Runner ist jest (nicht vitest).
`cd web && npx jest src/__tests__/emailMeetMdbLine.test.ts src/__tests__/buildEmailHtmlRecipients.test.ts src/__tests__/emailLocalization.test.ts` -> 3 Suites, 35 Tests grün.
Alle 19 *mail*-Suites zusätzlich grün (182 Tests). tsc: keine Fehler in den geänderten Dateien. eslint: sauber. Kein Gedankenstrich in neuen Zeilen.

## Neue Strings
Template-Funktion `meetMdbIntro(name)` (Name = Titel + Name, HTML-escaped, wie in der Empfängerzeile) plus `meetMdbLink`.
- DE: "Du willst {name} auch persönlich sprechen?" / "Hier findest du das Wahlkreisbüro und die Bürgersprechstunde."
- EN: "Want to talk to {name} in person?" / "Find the constituency office and the Bürgersprechstunde (in German)."
- TR: "{name} ile yüz yüze görüşmek ister misiniz?" / "Seçim bölgesi ofisini ve Bürgersprechstunde'yi burada bulabilirsiniz (Almanca)."
- Seite: Karte-CTA "Dein Wahlkreisbüro finden"; Zeile "Du willst den Bundestag auch mal von innen sehen? So kommst du kostenlos nach Berlin."

## Umsetzung
- page.tsx: `MdbLookupCard` in `<div id="wahlkreisbuero" class="scroll-mt-24 mt-10">` unter dem Karten-Grid; Karten rendern nicht-externe Links via `next/link`, Hash-Link funktioniert.
- buildEmailHtml.ts: neue Tabellenzeile direkt vor dem Cause-recruit-Block, nur bei `recipientKind === "mdb"`, Link `${APP_URL}/aktiv-werden#wahlkreisbuero` ohne Query.
- Keine Plaintext-Variante der Brief-Mail gefunden, nichts geändert.

## Abweichungen
- Test mit jest statt vitest (Repo nutzt jest).
- Die Karte "Geh in die Bürgersprechstunde" verlinkt nicht mehr auf `/treppe-der-selbstwirksamkeit#stufe-6` (laut Plan ersetzt); die zweite Karte zur Treppe bleibt.
- Commits liegen auf main (wie beauftragt, kein Worktree). Co-Author-Zeile laut Plan "Claude Opus 5.5".
