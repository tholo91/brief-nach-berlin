---
status: complete
date: 2026-11-17
---
# Summary 261117-tsu

- Kampagnen-Mail: Kampagnen-Kasten und Teilen-Kasten sind eine Karte.
- Kopf: Logo + "Kampagne von X" (Link), darunter Zähler ab 25 + "Danke dir ❤️", Trennlinie, dann Teilen-Text + Buttons.
- Fallbacks: ohne Logo nur Text, ohne Ersteller "Öffentliche Kampagne", unter 25 nur Dank.
- Locales de/en/tr: campaignPart + campaignShareHeading ersetzt durch campaignHeading.
- Tests: emailLocalization angepasst, Snapshot aktualisiert; Email/Kampagne 643/643 grün, tsc sauber.
- Visuell geprüft Desktop + 375px (Herz bleibt per &nbsp; beim Text).
- Commit nur mit Dateien dieses Tasks (Worktree hatte fremde Änderungen).
