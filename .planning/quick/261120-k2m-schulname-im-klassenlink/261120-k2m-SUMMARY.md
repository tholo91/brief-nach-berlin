---
quick_id: 261120-k2m
slug: schulname-im-klassenlink
status: complete
commits: 3
plan_head_before: d781d23a8980fcfc48e2d98c75fbe094c312439b
plan_head_after: 207f46bc4512fefbd2abf898f6e2aaf5a59fd927
actuals:
  tasks: 3
  commits: 3
---

# Quick 261120-k2m: Schulname im Klassenlink

Optionales Feld "Schule und Ort" im Klassenlink-Generator. Der Wert reist signiert im Token (`s`), steht gesperrt in der Kinderansicht und wird einmal in der Vorstellung des Briefs genannt. Nichts wird gespeichert. Alte Tokens funktionieren unverändert.

## Commits

- 3a03a24 feat(schule): Schulname im signierten Klassen-Token, QR wächst bei Bedarf
- 5178447 feat(schule): Schulname aus dem Token in Prompt und Kinderansicht
- 207f46b feat(schule): Feld Schule und Ort im Klassenlink-Generator, Hinweise auf Eltern-, KI- und Ablauf-Seite

## Entscheidungen

- `SCHULE_MAX_CHARS = 60` (`web/src/lib/schule/youth.ts`), `normalizeSchule()` dort: NFC, Steuerzeichen und `<>` zu Leerzeichen, Leerraum zusammengezogen, leer oder zu lang gibt `undefined` (kein Kürzen).
- QR-Encoder (`web/src/lib/qr-code.ts`) wählt die kleinste passende Version aus 10-Q (151 Byte), 12-Q (203 Byte) und 14-Q (258 Byte). Block- und EC-Tabellen aus ISO 18004, Rest wird berechnet. Statt nur einer größeren Version drei Stufen, damit normale Schulnamen nur v12 (65 Module) brauchen.
- Token mit Schulname trägt wie bei fester Ebene den gekürzten 128-Bit-MAC. Tokens ohne `s` sind byte-identisch zu vorher.
- `createClassLinkAction` lehnt ab (`invalid_input`, Meldung nennt die Höchstlänge), wenn der Name zu lang ist oder der fertige Link nicht in 258 Byte passt (schwer komprimierbare Zeichen wie CJK).
- Anzeige für das Kind in `JungExperience` (dort steht die Zeile "Klasse X, PLZ Y (vom Klassenlink festgelegt)"), nicht in `Step1Form`; `JungEntry.schule` kommt aus dem serverseitig geprüften Token. `classLinkStorage` und Handoff brauchen den Namen nicht und blieben unverändert.

## Verifikation

- QR: Matrizen für v10, v12, v14 (Grenzfälle 151/152, 203/204, 258 Byte) stimmen per SHA-256 mit einer unabhängigen Referenz (Python-Paket `qrcode`, Q, Byte-Modus, Maske 0) überein. Der alte Encoder liefert für v10-Texte dieselbe Matrix wie der neue (einmaliger Vergleichstest, nicht eingecheckt).
- Server-Vertrauen: Schule kommt nur aus dem verifizierten Token (`resolveYouthLetterContext`, Route-Test), Client-Feld `schule` wird ignoriert. Prompt ohne Schule ist unverändert (bestehende Snapshots grün).
- Kein Logging des Werts auf dem Pfad (Logs in Route und `generateLetter` enthalten keine Prompt- oder Token-Inhalte).

## Deviations from Plan

None, bis auf diese Abweichungen:

- [Rule 2] Zusätzlich zur Längenprüfung ein QR-Passt-Check in `createClassLinkAction` (`qrFits`), sonst entstünde bei exotischen Zeichen ein Link ohne scanbaren Code.
- Ablauf-Seite: Der Satz steht direkt in `web/src/app/unterricht/ablauf/page.tsx` unter "Vorher kurz prüfen", nicht in `PRECHECK_ITEMS` (die Liste wird auch auf `/unterricht` genutzt und ein Test prüft ihre Länge 4).

## Nicht verifiziert

- Kein echter Handy-Scan der größeren Codes (v12/v14). Nur Abgleich mit der Referenz-Implementierung.
- Kein echter Mistral-Aufruf, also keine Prüfung, wie das Modell die Schule im Brief formuliert.
- Hinweis: Der Name steckt lesbar (komprimiert, nicht verschlüsselt) im Link. Die Texte sagen "in keiner Datenbank gespeichert"; die Anfrage-URL kann trotzdem in Hosting-Logs stehen, wie schon Klasse und PLZ.

## Out of scope

`web/src/components/LocalizedFooter.tsx` und `web/src/components/SocialFollow.tsx` tauchten während des Tasks als uncommittete Änderungen auf (nicht von diesem Task, vermutlich parallele Arbeit) und blieben unangetastet und uncommittet.
