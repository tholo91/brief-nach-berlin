---
status: complete
---
# 261008-vqh: Kampagne verwalten Feinschliff

- Einstellungen (Laufzeit und Status, Pausieren, Beenden, Übertragen) liegen jetzt unten im Aufklapper "Kampagne bearbeiten".
- Unterstützen-Buttons ohne Zeilenbruch, Herz-Icon am Spenden-Button.
- Fünf statische Emojis um das Thomas-Avatar (nur ab md).
- Quellen-Satz der Statistik ohne max-w, einheitlich text-xs.
- Teillinks: aktive Kampagnen zeigen brief-nach-berlin.de/<slug> und /<kompakt> (ohne https, www, /kampagne/), kopiert wird die volle Kurz-URL. Nicht aktive behalten /kampagne/. QR und "Kampagnenseite ansehen" unverändert.
- Header: "Moin {creatorName} 👋" statt "Deine Kampagne", Status-Pill "aktiv seit TT.MM.JJJJ". "Live seit" aus Statistik-Karte entfernt, Formatter nach endDate.ts verschoben.

Checks: jest 100/100 Suites (753 Tests), eslint sauber. tsc-Fehler nur in unveränderter campaignTopicReset.test.ts (vorbestehend).
Offen: lokale Sichtprüfung im Browser nicht gemacht (Session-Cookie für Vorschau wurde blockiert).
