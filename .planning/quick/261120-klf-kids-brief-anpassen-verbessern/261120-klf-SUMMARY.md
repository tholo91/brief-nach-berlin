---
status: complete
date: 2026-11-20
---
# Kids-Erfolgsseite: anpassen und einmal verbessern

- Jugend-Entwurf ist editierbar, aktive Fassung speist PDF (600 ms entprellt) und "Text kopieren".
- Infobox "So wirkt dein Brief" (1-2 Anliegen, begründet, persönlich).
- Einmal "Brief verbessern": /api/generate-letter-variant mit mode "youth", Text direkt zurück, keine Mail, kein Zähler; Limit 40/h pro Klassenlink, sonst 15/h pro IP; Wortfenster 70-120 % des Originals; 20 s 429-Budget.
- Danach Tabs "Erste Fassung / Verbesserte Fassung". Sperre nur im Client (bewusst).
- Checks: Jest 206/206 Suiten grün, tsc und eslint sauber, Browser-Test mit simulierter Antwort (Tablet).
- Offen: echter Mistral-Lauf mit Jugendbrief nicht geprüft; Produktion nicht geprüft.
