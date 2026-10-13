---
quick_id: 261013-wuq
status: complete
scope: local implementation
completed: 2026-10-14
commit: 3c49b89
production: pending manual migration and deployment
---

# Rückmeldeseite und Last-Call-Mail

Die komplette lokale Umsetzung ist fertig. Migration, Deploy, echte Handy-/Mail-Client-Prüfung und Versand bleiben die vom Nutzer gewünschten manuellen Schritte.

## Verhalten

- Persönliche Ja/Nein/nicht-abgeschickt-Links führen auf `/rueckmeldung`. Der Einstieg wird idempotent gespeichert, der Token aus der sichtbaren URL entfernt; kein Referrer und keine Analytics für diese Seite.
- Weitere Umfrageantworten erfordern eine separate ausdrückliche Verarbeitungseinwilligung. Veröffentlichung, optionaler Name und Gesprächsbereitschaft bleiben davon getrennt. Progressive Klickantworten werden gespeichert; Freitext und Freigaben erst beim Absenden.
- Alle Fragepfade, Mehrfachantworten, Korrekturen der Mail-Auswahl und eine Danke-Ansicht sind umgesetzt. SurveyChoice/SentTab sind aus dem Review extrahiert.
- Migration 033: eigene `letter_outcomes`, Enum-/Branch-Checks, Unique `(email, cohort)`, FORCE RLS, nur service_role, atomare Schreibfunktion. Verspätete initial/progress-Aufrufe überschreiben keinen Abschluss. Erneutes bewusstes Full-Absenden darf Antworten ändern. Täglicher Cron löscht kurz vor 24 Monaten.
- Löschseite und manuelles Löschscript berücksichtigen Einstieg, Teilantworten und vollständige Rückmeldungen. Datenschutztext und Stand 14.10.2026 angepasst.
- Mail: frühe Ja/Nein-Buttons, dritter Textlink, kurze Copy, dezente Sprachnachricht/Mail-Zeile, Foto-Adresse und persönlicher Löschlink.
- Export: Reviews vor 13.08.2026 (Berlin), Mai-Liste, Pagination, Normalisierung, Testausschluss, Dedup; private CSV.
- Sender: Offline-Preview, echter Single-Testmail-Modus, echte Batch-Freigabe, exklusiver Lock, Journal vor/nach jedem Send und Sperre bei unklarem Anbieterergebnis. Keine echten Sendungen während der Umsetzung.
- Last-Call-Skills unter `~/.claude/skills` und `~/.codex/skills` aktualisiert; reviewbarer Inhalt in `docs/patches/send-lastcall-batch-SKILL.md`.

## Prüfung

- Vollständiger Jest-Lauf: 137 Suites, 1192 Tests bestanden.
- TypeScript und gezielter ESLint: bestanden.
- Produktionsbuild des endgültigen Stands: bestanden (npm run build).
- Browser mit lokalem Supabase-Mock: drei Mail-Einstiege, korrigierter Versandstatus, Mehrfachantworten, Freigaben, drei Full-Saves und 20 Progress-Saves; keine JavaScript-Fehler oder horizontaler Überlauf bei 390px/1280px. Initial enthält keine Umfrageantworten, Progress keinen Freitext/Publikationsnamen.
- Mail im Browser: mobile Buttons untereinander, mindestens 44px hoch, kein horizontaler Überlauf. Apple Mail/iPhone bleibt manuell zu prüfen.
- Screenshots unter `screenshots/` (gitignoriert). Keine Produktionsdaten verwendet.
- `git diff --check`: bestanden. Vorhandene Fremdänderungen nicht zurückgesetzt oder mitcommittet.
- Veraltete doppelte generierte Next-Type-Dateien nach `/tmp/bnb-outcome-generated-types` verschoben; keine Quelldateien dadurch geändert.

## Manueller Release

Die fünf Schritte mit Befehlen und SQL-Prüfung stehen in `docs/lastcall-release-2026-10-14.md`:

1. Migration 033 ist laut Thomas im SQL Editor ausgeführt. Tabelle, Unique, Rechte, RPC und Cron noch schreibgeschützt prüfen; `schedule: 2` ist die zurückgegebene Job-ID, keine Anzahl vorhandener Jobs.
2. Taskänderungen prüfen und von main deployen. Bestehende weitere Änderungen separat bewerten; kein pauschales `git add .`.
3. Offline-Testmailvorschau erstellen und alle drei Links auf dem echten Handy prüfen.
4. Cohort exportieren, tatsächliche Empfängerzahl prüfen, eine echte Testmail an Brief-nach-Berlin@posteo.de senden und prüfen.
5. Heute 14.10.2026 um 09:30 Europe/Berlin: Brevo-Kontingent prüfen und Batch bewusst manuell starten.

Offen/unverifiziert: Die Migration-Ausführung ist von Thomas bestätigt, aber Tabellen-/Rechte-/RPC-Prüfungen, Existenz genau eines Cron-Jobs und Migration-History sind nicht unabhängig geprüft. Kein Deploy, keine tatsächliche Zustellung, kein automatischer Versand oder Zeitplan. Das Todo bleibt bis zur manuellen Freigabe im Pending-Ordner.

## Git

Der Umsetzungs-Commit ist `3c49b89`; Review-Korrekturen folgten in `8f45b0a`. Die abschließende Projektdokumentation wurde danach aktualisiert. Vor dem Push `git log --oneline origin/main..main` prüfen. Kein Branch oder Worktree aufzuräumen; vorhandene Commits wurden nicht umgeschrieben.

Datenschutz-Referenz für ausdrückliche Einwilligung: [DSGVO Art. 6, 7, 9, 13](https://eur-lex.europa.eu/eli/reg/2016/679/oj).
