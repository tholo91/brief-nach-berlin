---
created: 2026-10-13T18:00:00.000Z
title: "Rückmeldeseite /rueckmeldung + Last-Call-Mail mit Ja/Nein-Buttons"
area: ui
severity: major
files:
  - web/src/lib/email/buildLastcallHtml.ts
  - web/scripts/send-lastcall-followup.ts
  - web/src/app/(site)/rueckmeldung/
  - web/src/lib/actions/submitOutcome.ts
  - web/src/lib/rueckmeldung/token.ts
  - web/supabase/migrations/033_letter_outcomes.sql
  - web/src/lib/dataDeletion/userData.ts
  - web/src/app/(site)/datenschutz/page.tsx
  - web/src/components/AnalyticsWrapper.tsx
---

> Führt ROADMAP-Phasen 999.16 (Stories sammeln) und 999.31 (Mail #3 "Hat dein:e MdB geantwortet?") zusammen. Ziel: Versand Mi 14.10.2026, 9:30.


## Context

Thomas will morgen (Mi 14.10., 9:30) die dritte und letzte Mail an Briefschreiber:innen von vor 2+ Monaten schicken: Wie ist es gelaufen, kam eine Reaktion, wie geht es dir damit? Die Mail existiert schon (Last-Call `followup-3m`, Juni, nie verschickt), hat aber nur heyspeak + Mail-Antwort. Neu: Ja/Nein-Buttons in der Mail, die auf eine eigene, schöne Rückmeldeseite führen (Muster wie `/feedback`), deren Antworten in Supabase landen. These dahinter: Handschreiben aktiviert und stärkt Selbstwirksamkeit, auch ohne Antwort.

Umsetzung via `/gsd-quick`, UI über `/frontend-design`. Planung und Grilling am 13.10. abgeschlossen.

## Entscheidungen (Grilling, 13.10.)

1. Last-Call wurde nie verschickt → das ist die erlaubte 3. Mail laut Datenschutzseite.
2. Versand Mi 14.10., 9:30, trotz Brevo-Kontingent (keine große Kampagne mehr aktiv; Kontingent vorher kurz ansehen).
3. Empfänger: Reviews vor 13.08. (217) + Mai-Liste `web/.backlog-recipients.csv` → ca. 335 eindeutig.
4. Mail: Frage „Hat sich jemand auf deinen Brief gemeldet?“ → [😊 Ja, es kam was] [😕 Nein, noch nichts], darunter Textlink „Ich hab meinen Brief nicht abgeschickt →“. Alle drei → `/rueckmeldung`, vorausgefüllt.
5. Klick in der Mail speichert sofort (wie Sterne). Wichtig: erkennbar, wer nur klickt vs. wer alles ausfüllt.
6. Kein Foto-Upload. Hinweis: Foto vom Antwortbrief an Brief-nach-Berlin@posteo.de.
7. Kein Kalenderlink. heyspeak-Button für Sprachnachricht + Häkchen „offen für ein kurzes Gespräch“. Veröffentlichung wie Reviews: Checkbox + optionaler Name (leer = anonym).
8. 7 Fragen, verzweigt, progressiv aufgedeckt wie im Review-Formular; oben „Dauert ca. 2 Minuten“.
9. Lokal lösbar vs. großes Thema: als eine Klickfrage.
10. Erst sammeln, keine öffentliche Anzeige morgen (Anzeige auf `/stimmen` = Folge-Task).
11. Betreff „Brief aus Berlin?“ bleibt, Text kürzer, Ja/Nein-Frage weit oben.

## Fragen auf der Seite (progressiv, Copy final via /frontend-design + Anti-KI-Checkliste, du-Form, „ich“, keine Gedankenstriche)

Kopf: Danke-Zeile passend zum Mail-Klick, „Dauert ca. 2 Minuten. Jede Antwort zählt, auch ‚nichts gehört‘.“

1. **Abgeschickt?** Von Hand geschrieben / Getippt oder ausgedruckt / Nein (übersprungen, wenn Einstieg „nicht abgeschickt“).
   - Nein-Pfad: **Was hat dich gebremst?** Keine Zeit / Briefmarke oder Adresse / Zweifel, ob es was bringt / Vergessen / Anderes → weiter mit 4.
2. **Kam eine Reaktion?** (vorausgefüllt aus Mail, änderbar) Mehrfach: Brief / E-Mail / Anruf / Bitte um Rückruf / Termin oder Einladung / Nur Eingangsbestätigung / Noch nichts.
3. Nur bei Reaktion: **Wurde auf dein Anliegen eingegangen?** Ja, konkret / Teilweise / Eher allgemein.
4. **Wie war dein Anliegen?** Konkret vor Ort lösbar / Größeres politisches Thema.
5. **Was hast du dir vorher erwartet?** Eine Antwort / Dass es gelesen wird / Es einmal gesagt zu haben / Nichts Bestimmtes.
6. **Wie fühlst du dich jetzt damit?** Exakt `POLITICAL_SELF_EFFICACY_VALUES/LABELS` aus `web/src/lib/feedback/politicalActivation.ts` (vergleichbar mit Reviews), für alle Pfade.
7. **Würdest du wieder einen Brief schreiben?** Hab ich schon / Ja, gern / Vielleicht / Eher nicht.
8. **Erzähl mir gern mehr** (Freitext, optional) + Foto-Hinweis (Mail) + heyspeak-Button + Checkbox „darf anonymisiert auf brief-nach-berlin.de gezeigt werden“ + optionaler Name + Checkbox „Ich wär offen für ein kurzes Gespräch“ → Absenden → Danke-Karte (Muster `ThankYouCard`).

Speichern: Mail-Klick → `initial` (Insert, ignoreDuplicates). Jede beantwortete Klickfrage → `progress`-Save (nur Klickfelder, kein Freitext). Absenden → `full`, `completed=true`. So sieht Thomas Abbruchpunkte und Vollausfüller.

## Datenbank (ja, Änderung nötig)

Neue Migration `web/supabase/migrations/033_letter_outcomes.sql`, Thomas wendet sie **vor dem Deploy** manuell im SQL-Editor an, Eintrag in `web/supabase/MIGRATION_STATUS.md`. RLS-Muster wie `017_letter_signals.sql:69-75` (FORCE RLS, nur service_role).

Tabelle `letter_outcomes`: `id uuid pk`, `created_at`, `updated_at`, `email text not null`, `cohort text not null` (`lastcall_2026_10`), `entry_choice` (`yes|no|not_sent`), `letter_sent` (`handwritten|typed|not_sent`), `not_sent_reason`, `reply_channels text[]`, `reply_addressed` (`concrete|partly|generic`), `issue_scope` (`local|big`), `expectation`, `political_self_efficacy`, `write_again`, `body`, `consent bool default false`, `display_name`, `call_ok bool default false`, `completed bool default false`, `completed_at`, `last_step text`, `ip_hash`. CHECK-Constraints für alle Enums. `UNIQUE(email, cohort)` als Upsert-Schlüssel.

Bewusst eigene Tabelle statt `reviews`: Sterne-Statistiken (`getReviewStats`, `/stimmen`) bleiben unberührt.

## Umsetzung (Dateien)

1. **Token** `web/src/lib/rueckmeldung/token.ts`: Kopie des Musters `web/src/lib/dataDeletion/token.ts` (zod, `purpose`, `v`, eigene MAC-Domain `rueckmeldung-v1.`, Payload `{email, cohort, iat}`, 90 Tage, ohne server-only-Import, damit das tsx-Script minten kann).
2. **Server Action** `web/src/lib/actions/submitOutcome.ts`: Modi `initial | progress | full`, zod-Validierung, Token-Check, `ip_hash` + Rate-Limit wie `web/src/lib/actions/submitReview.ts:112-141` (`rateLimit.ts`), Upsert auf `(email, cohort)`.
3. **Seite** `web/src/app/(site)/rueckmeldung/page.tsx` + `RueckmeldungForm.tsx`: Muster `web/src/app/(site)/feedback/page.tsx` + `FeedbackForm.tsx` (silent initial save `:163-177`, Token aus URL strippen `:149-153`, `no-referrer`, noindex). `SurveyChoice`/`SentTab` (`FeedbackForm.tsx:613-684`) in eine gemeinsame Komponente ziehen und in beiden Formularen nutzen. Gestaltung über `/frontend-design`, mobil zuerst.
4. **Mail** `web/src/lib/email/buildLastcallHtml.ts`: neue Param `answerBaseUrl` (bzw. Token) → 2 Buttons + Textlink nach Button-Muster `:171-180` (Mobile-Stack `:102-108`), Plaintext `:57-89` mitziehen, Text kürzen, Foto-Hinweis auf Brief-nach-Berlin@posteo.de, heyspeak + Mail als ruhige Zeile, Footer/Löschlink bleiben. URLs: `/rueckmeldung?a=ja|nein|nicht&t=<token>`.
5. **Versand** `web/scripts/send-lastcall-followup.ts`: pro Empfänger Rückmelde-Token neben dem Lösch-Token (`:150-151`) minten, Secret-Check `:99-104` erweitern. Neues Script `web/scripts/export-lastcall-cohort.ts`: Reviews mit E-Mail vor 13.08. + Mai-CSV, ohne Testadressen (Liste aus `fetch-reviews.ts:35-44`), dedupliziert → gitignorierte CSV.
6. **Löschung** `web/src/lib/dataDeletion/userData.ts` (collect/lookup/delete um `letter_outcomes` erweitern), Anzeige `datenloeschen/page.tsx:24-31` + `DatenloeschenClient.tsx:26-29`.
7. **Datenschutz** `web/src/app/(site)/datenschutz/page.tsx`: neuer Abschnitt nach Abschnitt 17 (Rückmeldungen: was, Zweck, Rechtsgrundlage, 24 Monate, Löschung), Satz in Abschnitt 11 (`:363-364`, „nur die zweite Mail hat signierten Link“) anpassen, Stand-Datum `:869` auf 14.10.2026.
8. **Analytics** `web/src/components/AnalyticsWrapper.tsx:14`: `/rueckmeldung` ausschließen.
9. **Skill** `~/.claude/skills/send-lastcall-batch/SKILL.md`: Quelle = Export-Script statt Brevo-Logs (Brevo hält nur 1 Monat), Dry-Run-/Reply-To-Adresse, `FEEDBACK_TOKEN_SECRET`, npm statt pnpm, neue Buttons.

## Planungsstand (13.10.)

1. Grilling abgeschlossen, Entscheidungen oben sind final.
2. ROADMAP 999.16 und 999.31 auf dieses To-do verwiesen.
3. Noch kein Code, keine Migration, kein Versand.

## Verification (für den Umsetzungs-Chat)

1. Tests (Vitest, Muster `dataDeletionToken.test.ts`, `politicalActivation.test.ts`, `dataDeletionUserData.test.ts`, `privacyEmail.test.ts`, `emailSocialFollow.test.ts`): Token sign/verify/Ablauf/falsche Domain, Action-Modi inkl. `completed`, Löschung findet `letter_outcomes`, Mail enthält 3 Links mit gültigem Token und keine Gedankenstriche.
2. `npm run build` + `npm test` in `web/`.
3. Preview: `/rueckmeldung?a=ja|nein|nicht&t=<Testtoken>` mobil + Desktop durchklicken, Screenshot, Zeilen in Supabase prüfen (initial → progress → completed).
4. Migration 033 auf Prod angewendet und per Read-only-Query bestätigt, dann Deploy von `main`.
5. `send-lastcall-followup.ts --dry-run` an Brief-nach-Berlin@posteo.de, Mail in Mail.app + Handy ansehen, Buttons klicken.
6. Mi 9:30: Brevo-Kontingent ansehen, dann echter Versand der ~335.

## Offene Restpunkte (nicht blockierend)

1. heyspeak-Prompt für die Story-Sprachnachricht ist laut Juni-Summary noch nicht eingerichtet: Thomas manuell.
2. Spalte `reviews.full_feedback_submitted` hat keine Migration im Repo (vermutlich von Hand angelegt): eigener Mini-Task.
3. Uncommittete Fremdänderungen im Worktree (Kampagnen-Varianten, Migration 032) nicht mitcommitten.

## Umsetzung am 14.10.2026

Lokaler Code vollständig umgesetzt. Siehe `.planning/quick/261013-wuq-rueckmeldeseite-und-lastcall-mail-komple/261013-wuq-SUMMARY.md`. Migration 033, Deploy, echter Handytest, Testmail und Versand bleiben bewusst manuell offen; Anleitung: `docs/lastcall-release-2026-10-14.md`. Kein Versand geplant oder gestartet.
