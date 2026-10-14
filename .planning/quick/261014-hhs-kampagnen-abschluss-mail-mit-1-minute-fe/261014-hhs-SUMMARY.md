---
phase: quick-261014-hhs
plan: 01
subsystem: campaigns
tags: [creator-survey, ended-mail, brevo, migration-034, script]
status: complete
requires:
  - quick-261009-luq (ended mail + script)
  - quick-261009-r0z (creator survey)
provides:
  - "Abschluss-Mail mit persönlichem Absatz, Abschickquote ab 10 Antworten, einem Button '1 Minute Feedback'"
  - "Survey mit Erwartung, Ergebnissen, To-Do-Aussage, Zitat-Modus named/anonym"
  - "Skript --list / --preview-to-me / --note / --send mit ended_notified_at-Schutz"
  - "Admin-Hinweis an Thomas bei endCampaignAction"
affects: [kampagne/verwalten/feedback, send-campaign-ended-mail, datenschutz]
key-files:
  created:
    - web/supabase/migrations/034_campaign_end_feedback.sql
    - web/src/lib/campaigns/creatorStatsView.ts
    - web/src/lib/campaigns/endedMail.ts
    - web/src/lib/email/sendCampaignEndedAdminNotice.ts
    - web/src/__tests__/campaignEndedMailFlow.test.ts
    - web/src/__tests__/campaignEndedAdminNotice.test.ts
    - web/src/__tests__/creatorSurveyRepository.test.ts
  modified:
    - web/src/lib/campaigns/creatorSurvey.ts
    - web/src/lib/campaigns/creatorSurveyRepository.ts
    - web/src/lib/campaigns/creatorStats.ts
    - web/src/lib/actions/submitCreatorSurvey.ts
    - web/src/lib/actions/campaignEnd.ts
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
    - web/src/lib/email/sendCampaignCreatorEmail.ts
    - web/src/lib/email/sendCreatorSurveyAdminEmail.ts
    - web/scripts/send-campaign-ended-mail.ts
    - web/src/components/campaigns/CreatorSurveyForm.tsx
    - web/src/components/campaigns/CreatorSurveyCard.tsx
    - web/src/app/(site)/kampagne/verwalten/feedback/page.tsx
    - web/src/app/(site)/datenschutz/page.tsx
    - web/supabase/MIGRATION_STATUS.md
    - .planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md
decisions:
  - "Statistik-Builder in creatorStatsView.ts (ohne server-only) ausgelagert, damit das tsx-Skript ihn importieren kann; creatorStats.ts re-exportiert alles"
  - "consentQuote ohne explizites quoteMode wird abgelehnt (kein stilles Default auf named)"
  - "Versand-Schutz als reine Funktion resolveEndedMailSend (Jest-testbar)"
plan_head_before: 5e414d8e72e0dea1e77bb3e3b399dcb120246ccb
plan_head_after: 284cd6c2157bb3c5e29cd9ed504945abca7a5e08
commits: 3
actuals:
  tokens: 120000
  tasks: 3
  commits: 3
---

# Phase quick-261014-hhs Plan 01: Abschluss-Mail mit 1-Minute-Feedback Summary

Abschluss-Mail für Kampagnen-Ersteller:innen mit einem großen "1 Minute Feedback"-Button, erweitertem Formular (Erwartung, Ergebnisse, To-Do-Aussage, anonymes Zitat) und einem manuellen, zweistufigen Versandskript mit Doppelversand-Schutz. Nichts angewendet, nichts gesendet, nichts gepusht.

## Was geändert wurde

1. **Task 1 (tracer), f67203c:** Umfrage für beendete Kampagnen ab 10 statt 50 Briefen (laufende bleiben bei 500, blockierte nie). Abschluss-Mail hat statt des Antwort-Hinweises einen Button, dessen Link `creatorSurveyUrl(token)` ist (Manage-Link mit `ziel=feedback`).
2. **Task 2, d24312e:** Migration 034 (nur Datei), `MIGRATION_STATUS.md` (Reihenfolge 029, dann 034). Schema, Normalisierung, `toggleOutcome`, `creatorSurveyQuoteAttribution`, Re-Stamp von `consent_quote_at` bei Moduswechsel. Repository-Status-Probe liest `quote_mode`, damit die Umfrage dunkel bleibt, bis 034 existiert. `getCampaignCreatedByFounder` (nie werfend). Admin-Mail mit Founder-Zeile, Erwartung, Ergebnissen (Notiz escaped), drei Freigabe-Varianten. Formular mit den neuen Fragen, Zitat-Modus-Radiogroup, Label-Feld, Live-Vorschau je Modus. Datenschutz Abschnitt 21.
3. **Task 3, 284cd6c:** Mail komplett umgebaut (siehe Copy). Skript mit `--list`, `--preview-to-me`, `--note`, `--send`; `ended_notified_at` wird nur nach echtem Versand ohne `--to` gesetzt. `endCampaignAction` plant per `after()` einen Admin-Hinweis (Fehler ändern das Ergebnis nie, nichts geht an Ersteller:innen).

## Tests, Build, Lint (echte Ergebnisse)

- `npx jest src/__tests__/campaignEnd src/__tests__/campaignCreatorStats.test.ts src/__tests__/creatorSurvey`: 10 Suites, 252 Tests, alle grün.
- `npx jest` komplett: 140 Suites, 1258 Tests, alle grün (enthält die parallel laufende Aufgabe 261014-hpa im selben Checkout).
- `npx eslint` auf alle geänderten TS/TSX-Dateien (inkl. Skript und Tests): ohne Befund.
- `npx tsc --noEmit` ohne Treffer außerhalb der bekannten Altlasten (.next/dev/types, campaignTopicReset).
- `npm run build`: erfolgreich (Routentabelle ausgegeben, kein Fehler).
- Em-Dash-Grep (printf-basiert) über die berührten Copy-Dateien: keine Treffer.
- `npx tsx scripts/send-campaign-ended-mail.ts` ohne Flags: Usage mit allen Flags, Exit vor Env/DB.

## Previews (nur Dateien, nichts gesendet)

`.planning/quick/261014-hhs-kampagnen-abschluss-mail-mit-1-minute-fe/preview/`
- `ended-preview-placeholder.html` (Platzhalter-Box, keine Notiz, kein Founder, keine Quote)
- `ended-with-note.html` (Beispielnotiz, kein Founder, keine Quote)
- `ended-founder-stats.html` (Notiz, Founder-Satz, "78 % der 23")
- `admin-notice.html`
- `ended-founder-stats-640.png`, `ended-preview-placeholder-640.png` (Headless-Chrome-Screenshots bei 640 px, gesichtet). 375 px: nicht belastbar prüfbar, headless Chrome erzwingt eine Mindestbreite und schneidet das Bild rechts ab; die Mail nutzt die bestehenden `bnb-*` Media-Queries unverändert.

## Copy zur Freigabe

Alle Texte sind Entwürfe. Keine Gedankenstriche, "ich" statt "wir" für Thomas, Schreibweise "Brief-nach-Berlin".

### Abschluss-Mail (Ihr-Anrede im Body, `buildCampaignCreatorEmailHtml.ts`)
- Betreff unverändert: `Danke für {N} Briefe zu „{Titel}“`. Vorschau: Präfix `[Vorschau] `.
- Persönlicher Absatz (Caveat, oben): Text kommt per `--note`. Vorschau-Platzhalter: "Dein persönlicher Absatz: 2-3 Sätze, kommen per --note hier rein."
- Danke: "Eure Kampagne ist beendet. {N} Briefe sind darüber entstanden: So viele Menschen haben eure Argumente aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben. Danke, dass ihr euch das getraut habt, obwohl Brief-nach-Berlin noch so klein ist."
- Founder-Zusatz (nur `created_by_founder`): "Und danke, dass ihr mir vertraut habt, die Kampagne für euch aufzusetzen."
- Abschickquote (nur ab 10 Antworten): "{P} % der {N} Unterstützer:innen, die geantwortet haben, haben ihren Brief abgeschickt." Link-Text: "Alle Zahlen findet ihr auf eurer Verwaltungsseite."
- Weiterempfehlung: "Kennt ihr andere Initiativen oder Creator, für die so eine Briefkampagne passt? Erzählt ihnen davon, das hilft mir am meisten." Link-Text: "Mehr dazu findet ihr hier." (auf /ngo-briefkampagne)
- Button: "1 Minute Feedback". Darunter: "Oder antwortet einfach auf diese Mail."
- Share-Intro: "Wenn ihr mögt, teilt euren Erfolg auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig." Share-Box-Label unverändert: "Erfolg auf den Socials teilen".
- Gruß: "Allerbeste Grüße aus Bremen" (ohne "und danke für dein Engagement"), Signatur "Thomas".
- Spende (klein, grau): "Brief-nach-Berlin bleibt kostenlos. Wer mich unterstützen will, findet hier die Spendenseite."
- Footer (von mir angepasst, nicht im Plan, damit Du/Ihr nicht gemischt ist): "Ihr bekommt diese Mail einmalig, weil eure Kampagne beendet ist." (vorher: "Du bekommst diese Mail einmalig, weil deine Kampagne beendet ist.")
- Entfallen: Box "Neu: Statistiken zu deiner Kampagne" mit Button "Statistiken ansehen", Box "Wie war es für dich?", Outline-Button "Unterstützen".

### Formular `/kampagne/verwalten/feedback` (`CreatorSurveyForm.tsx`, Du-Anrede wie bisher)
- Lead: "Ein paar kurze Fragen, etwa 1 Minute. Jede Angabe ist freiwillig." (vorher "etwa 90 Sekunden")
- Legende 1: "Wie viele Briefe sind es geworden?" Chips: "Mehr als erwartet", "So viele wie erwartet", "Weniger als erwartet".
- Legende 2: "Habt ihr schon von Ergebnissen gehört?" Chips: "Medienbericht", "Antwort aus der Politik", "Politische Entscheidung", "Noch nichts", "Noch zu früh". Label: "Was genau? (optional)". Hinweis: "Kommt später noch etwas? Tragt es hier nach oder antwortet einfach auf meine Mail."
- Neue Aussage: "Ein konkretes To-Do hat unsere Leute ins Handeln gebracht."
- Freigabe-Checkbox: "Unser Satz darf auf brief-nach-berlin.de erscheinen." (vorher "... mit Logo und Name auf brief-nach-berlin.de erscheinen.")
- Modus-Chips: "Mit Logo und Name", "Anonym". Radiogroup-Label (Screenreader): "Wie soll der Satz erscheinen?"
- Anonym-Feld: Label "So darf ich euch nennen (optional)", Platzhalter "eine Umwelt-NGO aus NRW", Hinweis "Leer gelassen steht dort „eine Initiative“."
- Markenschreibweise korrigiert (zwei Stellen): "Je mehr Menschen über Brief-nach-Berlin sprechen ..." und "Du willst Brief-nach-Berlin unterstützen?"

### Karte auf der Verwaltungsseite (`CreatorSurveyCard.tsx`)
- Überschrift: "Hast du 1 Minute für mich?" (vorher "90 Sekunden")
- Text: "Brief nach Berlin besser zu machen" wurde zu "Brief-nach-Berlin besser zu machen".

### Admin-Mails an Thomas (intern)
- Survey-Mail: "Von Thomas aufgesetzt: ja/nein", "Briefe im Vergleich zur Erwartung", "Ergebnisse gehört", "Zitat freigegeben: nein / mit Logo und Name / anonym als „{label}“" (ersetzt "Zitat mit Logo/Name freigegeben: ja/nein").
- Beenden-Hinweis: Betreff "[BnB Kampagne beendet] {slug}", "Kampagne beendet", "Briefe: {N}", "Abschluss-Mail vorbereiten:" plus Befehl, bzw. "Unter 10 Briefen: keine Abschluss-Mail vorgesehen."

### Datenschutz, Abschnitt 21 (Sie-Form, `datenschutz/page.tsx`)
- "Ab einer bestimmten Größe oder nach dem Ende Ihrer Kampagne bitte ich um freiwilliges Feedback. Gespeichert werden die angekreuzten Antworten, ob die Zahl der Briefe Ihre Erwartung getroffen hat, welche Ergebnisse Sie gehört haben (Medienbericht, Antwort oder Entscheidung aus der Politik) mit einem optionalen Freitext, ein optionaler Satz an andere Initiativen, angekreuzte Hilfsangebote und Ihre Freigaben mit Zeitpunkt, einschließlich der Wahl, ob Ihr Satz mit Logo und Namen oder anonym erscheinen darf."
- "Ihren Satz zeige ich nur nach Ihrer ausdrücklichen Freigabe, entweder mit Logo und Namen der Kampagne oder anonym mit einer Beschreibung, die Sie selbst wählen (ohne Angabe: „eine Initiative“)."
- Rechtsgrundlage lit. a: "... die Veröffentlichung des Zitats (mit Logo und Namen oder anonym) sowie die anonyme Auswertung."
- "Stand: 14. Oktober 2026" unverändert.

### CLI-Meldungen, die Thomas liest (Skript)
- "Ohne --note kein Versand. Erst --preview-to-me, dann --note."
- "Die Abschluss-Mail wurde schon verschickt (...). Für einen Testversand --to nutzen."
- "Das Feedback-Formular ist noch nicht verfügbar (Migration 029 und 034 fehlen). Der Button in der Mail würde ins Leere führen."
- "Migration 034 fehlt (campaigns.ended_notified_at / created_by_founder)." und weitere Einzeiler in `endedMail.ts` / Skript.

## Deviations from Plan

### Auto-fixed / Anpassungen
**1. [Rule 2 - Konsistenz] Footer der Abschluss-Mail auf Ihr gestellt** (siehe Copy). Sonst stünde im selben Mail "ihr" im Text und "du" im Footer. Commit 284cd6c.
**2. [Rule 3] Repository-Tests als eigene Datei** `creatorSurveyRepository.test.ts` statt als Describe in `creatorSurvey.test.ts`, weil `jest.mock("server-only")` auf Dateiebene stehen muss. Zusätzlich `campaignEndedAdminNotice.test.ts` für den neuen Mail-Builder.
**3. [Rule 1/2] Zwei weitere "Brief nach Berlin"-Stellen** in `CreatorSurveyCard.tsx` und im Formular (siehe Copy) auf "Brief-nach-Berlin" korrigiert.
**4. createdByFounder wird nur geladen, wenn sich die Antworten geändert haben** (statt vor jedem Speichern), spart eine Abfrage; das Ergebnis erreicht die Admin-Mail wie vorgesehen.
**5. `--list`/`--send`-Verhalten ohne 034:** `--send` verweigert zusätzlich, wenn `ended_notified_at` nicht lesbar ist (`endedNotifiedAt === undefined`).

### Hinweis zum Arbeitsverzeichnis
Im selben Checkout lief parallel Aufgabe 261014-hpa (Änderungen an `share.ts`, `CampaignReferralCard.tsx`, `CampaignReferralShareButton.tsx`, `campaignCreatorStats.test.ts`, `verwalten/page.tsx`, `STATE.md`). Ich habe nur meine Dateien einzeln gestaged; diese Änderungen sind uncommittet und gehören nicht zu meinen Commits.
Die Commits liegen direkt auf `main`, weil der Auftrag das so verlangte (Trunk-Based).

## Known Stubs

Keine. Der Platzhalter "Dein persönlicher Absatz" erscheint nur in Vorschau-Mails.

## Threat Flags

Keine neuen Flächen außerhalb des Threat-Models (T-hhs-01 bis 07 mitigiert: Allowlists plus DB-CHECKs, Modus-Pflicht bei Freigabe, escapeHtml/esc überall mit Tests, Token nur bei `--send`, Haupt-Campaign-Select unverändert, `resolveEndedMailSend`-Guards, Admin-Hinweis ohne Ersteller-Adresse).

## Offene Schritte für Thomas

1. Freigabe der Copy oben (jeder Text ist Entwurf).
2. Migration 029, danach 034 im Supabase SQL Editor anwenden (nach OK). Bis dahin bleibt die Umfrage dunkel; `--list` und `--send` verweigern.
3. `created_by_founder = true` im Dashboard für die Kampagnen setzen, die Thomas selbst aufgesetzt hat.
4. Pro beendeter Kampagne: `cd web && npx tsx scripts/send-campaign-ended-mail.ts --list`, dann `--slug <slug> --preview-to-me`, 2-3 Sätze schreiben, `--note "..." --preview-to-me` als zweite Vorschau, nach OK `--note "..." --send`. NRV (`unterschrift-ist-kein-dienstvergehen`) als Nachtrag formulieren (D-09).
5. Browser-Check des Formulars bei 375 px nach den Migrationen (Zitat-Vorschau named/anonym, Absenden, Danke-Zustand).
6. Frage: Soll Datenschutz Abschnitt 21 auch die einmalige Abschluss-Mail an Ersteller:innen erwähnen? (Nicht im Plan, nicht geändert.)
7. Push/Deploy: nicht erfolgt.

## Self-Check: PASSED

- Dateien vorhanden: 034 Migration, creatorStatsView.ts, endedMail.ts, sendCampaignEndedAdminNotice.ts, drei neue Testdateien, vier Preview-HTMLs, zwei PNGs.
- Commits f67203c, d24312e, 284cd6c sind Vorfahren von HEAD.
- `commits: 3` gemessen per `git rev-list --count 5e414d8..HEAD`.
