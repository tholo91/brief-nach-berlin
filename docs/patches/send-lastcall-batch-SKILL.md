---
name: send-lastcall-batch
description: "Brief-nach-Berlin: manueller Last-Call mit Ja/Nein-Antwortlinks, Cohort-Export aus Reviews und Mai-Liste, persönlichem Löschlink, Testmail und lokalem Versandjournal. Kein automatischer Versand."
---

# Last-Call Batch (followup-3m)

Manueller Versand der dritten und letzten Follow-up-Mail an Briefschreiber:innen. Für den geplanten Lauf am 14.10.2026 um 09:30 Uhr Europe/Berlin. Dieser Workflow plant oder startet niemals automatisch einen Versand.

## Voraussetzungen und Freigabereihenfolge

1. Migration 033 manuell im Supabase SQL Editor ausführen und `letter_outcomes` sowie den Unique-Schlüssel `(email, cohort)` read-only verifizieren.
2. `git status --short` prüfen, nur die freigegebenen Taskdateien stage (kein `git add .`) und den geprüften Stand auf `main` deployen.
3. Die Rückmeldeseite auf dem Handy durchklicken.
4. Brevo-Kontingent unmittelbar vor Versand prüfen.
5. Testmail prüfen. Der Dry-Run sendet wirklich eine Nachricht an `Brief-nach-Berlin@posteo.de`.
6. Am freigegebenen Zeitpunkt den echten Versand manuell starten.

## Lokale Preview und Handytest

```bash
cd "/Users/thomas/Documents/Git Repos/brief-nach-berlin/web"
npm exec -- tsx scripts/send-lastcall-followup.ts --check-token
npm exec -- tsx scripts/send-lastcall-followup.ts --preview
open .lastcall-preview.html
```

`--preview` braucht keine CSV und keinen Brevo-Key, ruft kein Netzwerk auf und schreibt tokenhaltige HTML/Textdateien mit Modus 0600. Die Ausgabe nennt nur ihre Pfade. Öffne die Antwortlinks auf deinem eigenen Handy und lösche die Preview-Dateien danach.

## Export und Testmail

```bash
cd "/Users/thomas/Documents/Git Repos/brief-nach-berlin/web"
npm exec -- tsx scripts/export-lastcall-cohort.ts
git check-ignore .lastcall-cohort.csv .lastcall-cohort.csv.tmp .lastcall-send-journal.json .lastcall-send-journal.json.lock .lastcall-send-journal.json.tmp .lastcall-send-journal.json.preflight .lastcall-preview.html .lastcall-preview.txt
npm exec -- tsx scripts/send-lastcall-followup.ts --check-token
npm exec -- tsx scripts/send-lastcall-followup.ts .lastcall-cohort.csv --dry-run
```

Der Export bildet die Reviews vor dem 13.08.2026 (Europe/Berlin) mit der Mai-Liste `web/.backlog-recipients.csv` zusammen. Testadressen aus `fetch-reviews.ts` werden ausgeschlossen. Der Export dedupliziert normalisierte Adressen und zeigt nur aggregierte Quell-, Duplikat-, ungültig- und Testausschlusszahlen.

## Echter Versand

Kontingent, Migration, Deploy, Mobiltest und Testmail müssen geprüft sein. Dann manuell:

```bash
npm exec -- tsx scripts/send-lastcall-followup.ts .lastcall-cohort.csv --confirm
```

`--confirm` plus die interaktive Eingabe `SENDEN` sind erforderlich. Bei bis zu 500 eindeutigen Empfängern sendet das Script mit 300 ms Abstand. Das lokale Journal speichert Erfolge und verhindert beim erneuten Lauf deren erneuten Versand. Vor jeder Mail wird ein `pendingEmail` geschrieben. Nach Prozessabbruch oder Netzwerkfehler blockiert dieser Eintrag weitere Versuche, bis Brevo manuell geprüft und das Journal bewusst abgeglichen wurde. Ein Lock verhindert parallele Sendungen; ein zurückgebliebenes `.lock` erst nach Prozessprüfung entfernen. Brevo-Logs reichen für ältere Dedup-Zeiträume nicht aus.

## Konfiguration

`web/.env.local` benötigt `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `FEEDBACK_TOKEN_SECRET` und `REVIEW_IP_SALT`. Beide Geheimnisse müssen lokal und in der Produktionsumgebung vorhanden sein; `FEEDBACK_TOKEN_SECRET` muss übereinstimmen, damit Preview-Links dort gültig sind. Cohort-CSV nach geprüftem Versand löschen, Journal höchstens 24 Monate behalten. CSV, Journal und Preview-Dateien sind private Daten und gehören nicht in Logs oder Tickets.
