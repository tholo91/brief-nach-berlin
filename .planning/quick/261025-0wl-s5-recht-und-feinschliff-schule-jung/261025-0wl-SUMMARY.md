---
quick_id: 261025-0wl
status: complete
commit: 6f941c9
---

# S5 Recht und Feinschliff: Summary

## Gebaut

- `/datenschutz` Abschnitt 22 „Jugendmodus für Schülerinnen und Schüler“ (`id="jugendmodus"`, Sie-Form wie die ganze Seite): Zugang über `/jung` und Klassenlinks, verarbeitete Daten und Zweck, was im Jugendmodus wegfällt, Inhalt und Gültigkeit des Klassenlinks, Klassen-Limit statt IP-Limit, anonymes Ereignis „Brief im Jugendmodus erstellt“ über Vercel Web Analytics.
- `/ki-transparenz` Abschnitt „Briefe von Schüler:innen“ (`id="schueler"`): Klassenstufe und Unterrichtsprojekt im Prompt, 150 bis 200 Wörter, Wahlstatus-Satz, Hinweis auf Fehler der KI, Link auf den Datenschutz-Abschnitt.
- Test `youthLegalPages.test.ts` (rendert beide Seiten).
- Copy-Check über alle neuen Texte: keine Gedankenstriche (nur Halbgeviertstriche in Zeitspannen), „ich“ statt „wir“ in Projektstimme („wir/uns“ nur in Schüler:innen-Stimme), Marke überall „Brief-nach-Berlin“, ein Satz mit KI-Muster auf `/schule` umformuliert.
- Vorbestehender Lint-Fehler in `lastcallSender.test.ts` behoben (`existsSync` importiert statt `require`).
- Sitemap enthält `/jung`, `/schule`, `/schule/ablauf` (geprüft über `/sitemap.xml`).

## Nicht geändert (gemeldet)

- „Stand: 19. Oktober 2026“ auf `/datenschutz` bleibt, weil `privacyEmail.test.ts` genau diesen String prüft.
- `/datenschutz` Abschnitt 14 nennt den heyspeak-Link in Mail und Erfolgsseite; die Jugend-Mail enthält ihn weiterhin (offene Entscheidung im REPORT).
