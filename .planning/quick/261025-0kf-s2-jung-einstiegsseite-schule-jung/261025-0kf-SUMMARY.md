---
quick_id: 261025-0kf
status: complete
commit: 0829329
---

# S2 `/jung` als Einstiegsseite: Summary

## Gebaut

- `web/src/app/(site)/jung/page.tsx`: Server-Seite, liest `?k=` (Promise-`searchParams`), prüft den Klassen-Token serverseitig und gibt dem Client nur Klasse, PLZ und Token. Metadata mit Canonical ohne Query, OG/Twitter, JSON-LD WebPage + FAQPage, Abschnitte „So geht's“, FAQ, Link zu `/schule`.
- `web/src/components/jung/JungExperience.tsx`: Klassenstufe als Radio-Gruppe, 8 Themen-Chips, Textfeld mit Spracheingabe, „Brief entwerfen“ schreibt den S1-Handoff und öffnet den Wizard.
- Geteilte Chips: `components/topics/TopicStarterGrid.tsx` (Varianten `numbered` für `/schreib-merz`, `plain` für `/jung`), `useTopicStarters.ts`, reine Helfer `lib/topics/topicStarters.ts`. `/schreib-merz` nutzt sie mit gleichem Markup und gleichem Draft-Key.
- Spracheingabe im Klassen-Bucket: `LIMITS.TRANSCRIBE_PER_CLASS` 90/h, `/api/transcribe` liest `classToken`, `VoiceRecorder`/`Step2Issue`/`WizardShell` reichen ihn durch.
- Sitemap: `/jung` (0.8).
- PO-Nacharbeit: weiche Trennstellen in „Schulgebäude“ und „Lehrkräftemangel“, damit die Chips auf 375 px nicht überlaufen.

## Verifikation

- `cd web && npx jest`: 160 Suites, 1504 Tests, 18 Snapshots grün. tsc sauber, eslint ohne neue Meldungen.
- Preview 375 px: `/jung?k=<gültig>` zeigt „Klasse 9 und PLZ 28195“, `?k=kaputt` zeigt den Ablauf-Hinweis, Chip-Tap fügt Satzanfang ein, „Brief entwerfen“ → Wizard mit PLZ 28195 → „Dein Brief ist fertig“.
- Klickweg ab `/jung`: 1 Chip, 1 Satz tippen, „Brief entwerfen“, E-Mail tippen, 4 Taps bis zum Entwurf (Weiter, Ebene, Empfänger:in, Brief erstellen). Automatisiert gemessen 90 s inkl. Tool-Latenz und Fehlersuche; realistisch für Schüler:innen ca. 45 bis 60 s plus 15 s Generierung (Schätzung, nicht gemessen).
- `/schreib-merz` vorher/nachher gleich (Screenshots), Einfügen und Entfernen per Chip funktionieren, Draft-Key unverändert.
- Screenshots (lokal, gitignored): `screenshots/`.

## Befunde für REPORT.md

- Mikrofon-Button im bestehenden `VoiceRecorder` ist 36 px, unter 44 px Tap-Ziel (betrifft alle Flows).
- Klassenstufe aus dem Link bleibt änderbar (so gewollt: „vorbelegt“).
- Mit Klassenlink ließe sich der Ton-Schritt im Wizard überspringen, um unter 60 s zu bleiben (offene Entscheidung).
