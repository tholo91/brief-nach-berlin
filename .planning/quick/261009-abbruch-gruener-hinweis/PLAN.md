# Quick 261009: Verbindungsabbruch als grüner Hinweis statt Fehler

**Anlass:** Fehler-Report 09.10.2026 (PLZ 50859, iOS Safari, `load_failed`, Seite im Hintergrund). Vercel: Request nach 6,7 s fertig. Brevo: Mail 13:48:50 zugestellt, Report 13:48:59. Der Brief war da, die Seite zeigte trotzdem Rot.

**Ziel:** Bricht die Verbindung ohne HTTP-Status ab, sieht die Seite aus wie der Erfolgsfall (Postfach öffnen, So geht es weiter) plus ein ruhiger grüner Hinweis. Kein „Fehler melden“, keine Ladepunkte.

**Grenzen:** Nur `Step3Success.tsx` + `successPageExperience.test.ts`. HTTP-Fehler (4xx/5xx) bleiben rot wie bisher. Kein Retry, keine neue ID, nichts speichern. „Keine E-Mail erhalten?“ bleibt an `letterReady` gebunden (Resend braucht den Brieftext). Fallback: Mailto an FOUNDER_EMAIL.

**UI:** Nutzt die vorhandene grüne Box (`bg-waldgruen/10 border-l-4`) und den vorhandenen Erfolgsblock. Kein neues Layout, deshalb kein /frontend-design-Durchlauf (bewusst vermerkt).

## Tasks
1. State `connectionLost`; im Catch-Zweig ohne HTTP-Status setzen statt Fehlertext.
2. Kopfzeile, Postfach-Block und Ladepunkte behandeln `connectionLost` wie `letterReady`; Resend-Button nur bei `letterReady`.
3. Grüner Hinweis mit Mailto-Fallback.
4. Test anpassen.
