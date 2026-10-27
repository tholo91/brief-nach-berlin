---
quick_id: 261027-w2f
status: complete
date: 2026-10-27
---

# Briefmail: Nebenlinks in „Gut zu wissen“

- Intro, Gruß und Teilen-Kasten tragen keine Nebenlinks mehr. Intro verweist auf „weitere Tipps ganz unten“.
- Neuer Block `buildGoodToKnowHtml` in `web/src/lib/email/buildEmailHtml.ts` über dem Footer, nach 6 Testmail-Runden mit Thomas:
  - Titel „Gut zu wissen“ mit Trennlinie darunter.
  - Nur bei `mdb`: „🤝 {Name} persönlich treffen“ / „Mehr Chancen für dein Anliegen. Sprechstunde finden“.
  - Nur bei `mdb` und nicht `jung`: „🚆 Kostenlos nach Berlin“, mobil kürzerer Text („Abgeordnete laden nach Berlin ein, so kommst du mit“).
  - Keine Kästen: Emoji inline, Titel fett grau, Umbruch nach dem Titel.
  - „Weitere Infos + Tipps für dich:“ mit Umbruch, dann Linkzeile mit Trennpunkten (Links brechen nur als Ganzes um). „Wer darf MdBs schreiben?“ ist aus dem Footer hierher gewandert.
  - „Du hast Fragen oder Ideen? Schreib mir sehr gern“.
- „Nicht ganz dein Ton?“ unter dem Brief: mobil kürzer („→ Hier schnell anpassen“), damit es eine Zeile bleibt.
- Copy in `mailLocale.ts` unter `goodToKnow` für de/en/tr, ungenutzte Keys entfernt.
- Tests: neue Fälle in `buildEmailHtmlRecipients.test.ts`, `emailMeetMdbLine.test.ts` und `emailVariantCta.test.ts` angepasst, Snapshot aktualisiert. `npx jest`: 169 Suites, 1587 Tests grün. `tsc`: keine Fehler in `src/`.
- Geprüft per Testmail an Thomas (Brevo, Tag `brief-test`). Produktion nicht geprüft.
