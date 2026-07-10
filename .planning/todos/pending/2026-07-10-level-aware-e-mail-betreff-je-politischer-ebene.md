---
created: 2026-07-10T15:58:53.579Z
title: Level-aware E-Mail-Betreff je politischer Ebene
area: api
files:
  - web/src/lib/config.ts:9
  - web/src/lib/email/sendLetterEmail.ts:172
  - web/data/landtag-addresses.json
---

## Problem

Der Betreff der Ergebnis-Mail ist statisch: `EMAIL_SUBJECT = "Dein Brief nach Berlin ist fertig"` (web/src/lib/config.ts:9, verwendet in sendLetterEmail.ts:172). Seit 999.6 gehen Briefe auch an Landtage und Rathaeuser; "nach Berlin" ist dort faktisch falsch und verschenkt den Moment in der Push-Notification, in dem die richtige Ebene sichtbar wuerde (User-Idee Thomas, 2026-07-10).

## Solution

Betreff aus `recipient` ableiten (sendLetterEmail kennt den Empfaenger bzw. bekommt das Level durchgereicht):

- Bund: unveraendert "Dein Brief nach Berlin ist fertig" (Marke).
- Land: "Dein Brief nach {Landtagssitz-Stadt} ist fertig", z.B. "Dein Brief nach Duesseldorf ist fertig". Sitz-Stadt aus web/data/landtag-addresses.json ableiten (dort stehen die Landtagsadressen inkl. Ort). Sonderfall Berlin: Landtagssitz ist ebenfalls Berlin, Betreff bleibt dann wie Bund.
- Kommune: "Dein Brief ans Rathaus ist fertig" (bewusst ohne Stadtnamen-Praeposition-Grammatikprobleme; Alternative "Dein Brief ans Rathaus {Stadt} ist fertig" nur, wenn Grammatik robust ist).

Absendername bleibt "Brief nach Berlin", die Marke ist in der Notification also weiterhin sichtbar. Fallback bei fehlendem Level: bisheriger Betreff.

Achtung Koordination: In einem parallelen Chat laeuft gerade Feedback-Arbeit an der Empfaenger-Darstellung in der Mail (doppelte "Stadtverwaltung"-Zeile, "Adresse suchen"-Button). Vor Umsetzung pruefen, ob buildEmailHtml/sendLetterEmail dort schon angefasst wurden.

Umsetzung auf Branch codex/999-6-level-routing-v2 (Worktree brief-nach-berlin-999.6).
