---
phase: quick-261009-r0z
plan: 01
subsystem: campaigns
tags: [creator-survey, feedback, server-action, supabase-migration, brevo, datenschutz]
requires: []
provides:
  - "Feedback-Formular /kampagne/verwalten/feedback fuer Kampagnen-Ersteller:innen"
  - "Tabelle campaign_creator_surveys (Migration 029, lokal, nicht angewendet)"
  - "creatorSurvey.ts inkl. isCreatorSurveyMilestone, creatorSurveyUrl, resolveManageJumpPath (fuer Task 2 des freigegebenen Plans)"
affects:
  - "kampagne/verwalten (Karte + Navigation)"
  - "kampagne/verwalten/zugang (ziel-Sprung)"
  - "datenschutz Abschnitt 20"
tech-stack:
  added: []
  patterns:
    - "Feature bleibt dunkel, solange die Tabelle fehlt (Status unavailable)"
    - "Admin-Mail per after(), Fehler schlucken"
key-files:
  created:
    - web/supabase/migrations/029_campaign_creator_surveys.sql
    - web/src/lib/campaigns/creatorSurvey.ts
    - web/src/lib/campaigns/creatorSurveyRepository.ts
    - web/src/lib/actions/submitCreatorSurvey.ts
    - web/src/lib/email/sendCreatorSurveyAdminEmail.ts
    - web/src/app/(site)/kampagne/verwalten/feedback/page.tsx
    - web/src/components/campaigns/CreatorSurveyForm.tsx
    - web/src/components/campaigns/CreatorSurveyCard.tsx
    - web/src/__tests__/creatorSurvey.test.ts
    - web/src/__tests__/creatorSurveyAction.test.ts
    - web/src/__tests__/creatorSurveyAdminEmail.test.ts
  modified:
    - web/src/app/(site)/kampagne/verwalten/zugang/route.ts
    - web/src/app/(site)/kampagne/verwalten/page.tsx
    - web/src/__tests__/campaignTransferAccess.test.ts
    - web/src/app/(site)/datenschutz/page.tsx
    - web/supabase/MIGRATION_STATUS.md
    - .planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md
key-decisions:
  - "isCreatorSurveyMilestone bekommt einen dritten Parameter alreadyNotified, damit ein Sprung (100 direkt auf 1000) die Umfrage genau einmal ausloest"
  - "Art. 6 Abs. 1 lit. f DSGVO fuer das Speichern des freiwilligen Feedbacks (Ermessen, Thomas pruefen), lit. a fuer Zitat/Logo und anonyme Auswertung"
  - "Keine Regel 'mindestens eine Antwort', damit Antworten wieder geleert werden koennen"
  - "Ended-Kampagnen duerfen absenden (anders als setMilestoneMails)"
duration: n/a
completed: 2026-10-09
status: complete
commits: 3
plan_head_before: af965e145fcd797f7d76f1afc664e18273f8cd94
plan_head_after: 0e865eb6ca16587892206e6f9fe356f4dbf1cb85
actuals:
  tokens: 60000
  tasks: 3
  commits: 3
---

# Phase quick-261009-r0z Plan 01: Feedback-Formular fuer Kampagnen-Ersteller Summary

Feedback-Formular fuer Ersteller:innen ab 500 Briefen (beendet: ab 50) mit eigener Tabelle, Server Action mit Session- und Berechtigungspruefung, Admin-Mail an Thomas (nur bei geaenderten Antworten, Hilfsangebote oben, replyTo = Ersteller), Karte + Navigation auf der Verwalten-Seite und `ziel=feedback`-Sprung ueber den Zugangs-Link. Alles bleibt unsichtbar, solange Migration 029 nicht angewendet ist.

## Commits

| Task | Commit | Inhalt |
| --- | --- | --- |
| 1 | 53e3283 | Datenmodell, Repository, Action, Admin-Mail, 3 neue Jest-Suiten |
| 2 | 8e1ebce | zugang-Route, Verwalten-Seite, Feedback-Seite, Formular, Karte, Route-Tests |
| 3 | 0e865eb | Datenschutz Abschnitt 20, MIGRATION_STATUS, Todo S4 |

Die Commits liegen lokal auf `main` (Auftrag des Orchestrators, trunk-based, kein Push). Der Protected-Branch-Check aus dem Executor-Standard wurde bewusst nicht als Abbruch gewertet, weil der Auftrag ausdruecklich sequenziell auf `main` committen sollte.

## Verification (aus web/)

| Check | Ergebnis |
| --- | --- |
| `npx jest src/__tests__/creatorSurvey src/__tests__/campaign` | PASS, 36 Suiten, 412 Tests, 0 Fehler (enthaelt campaignTransferAccess und die 3 neuen Suiten; stderr-Warnungen aus bestehenden Tests sind erwartet) |
| Neue Suiten allein (creatorSurvey, creatorSurveyAction, creatorSurveyAdminEmail) | PASS, 64 Tests |
| `npx eslint` ueber alle geaenderten TS/TSX-Dateien (14 Dateien) | PASS, Exit 0 |
| `npx tsc --noEmit` | PASS, Exit 0 |
| `npm run build` | PASS, Exit 0, `/kampagne/verwalten/feedback` als dynamische Route gelistet |
| `grep -c '^import "server-only"' creatorSurvey.ts` | 0 |
| Em-Dash-Suche in CreatorSurveyForm, CreatorSurveyCard, feedback/page.tsx | keine Treffer |
| Docs-Greps (029-Zeile, lit. a, Stand 9. Oktober 2026, 261009-r0z im Todo) | PASS |

Nicht Teil dieses Nachweises: Browser-Check des Formulars (Orchestrator), Migration 029 in Supabase, Push, Deploy. Ein lokaler Pass ist kein Produktionsnachweis. Das Formular wurde nicht im Browser gerendert; Layout (Float-Legende in Fieldsets, Preview-Karte, 375 px) ist ungeprueft.

## Deviations from Plan

None - plan executed as written. Kleine Anmerkungen ohne Abweichung:

- Migration: `FORCE ROW LEVEL SECURITY` mit einfachem Leerzeichen geschrieben (005 hat zwei), weil der vorgegebene Test genau diesen String prueft.
- Projekt nutzt zod 4.x (nicht 3.x wie in CLAUDE.md); der Code ist mit beiden `z.enum`-Formen kompatibel.
- Das Todo S4 liegt unter `.planning/` und wurde laut Plan im Task-3-Commit mitcommittet. SUMMARY, STATE und PLAN wurden nicht committet.

## Ermessensentscheidungen

1. `isCreatorSurveyMilestone(milestones, stufe, alreadyNotified)`: dritter Parameter, damit ein Sprung ueber die Schwelle (z. B. 100 direkt auf 1000) die Umfrage genau einmal ausloest. Schwelle = kleinste normalisierte Stufe ab 500, Standardstufen bei leerer/fehlender Liste.
2. Rechtsgrundlage lit. f fuer das Speichern des freiwilligen Feedbacks zur Verbesserung des Dienstes (zusaetzlich zu lit. a laut Plan). Bitte pruefen.
3. Keine "mindestens eine Antwort"-Regel (Antworten muessen sich wieder leeren lassen).
4. Wenn nur die Umfrage-Karte, aber keine Statistik angezeigt wird, rendert `insights` die Karte allein (ohne Referral-Karte).
5. Navigation: "Dein Feedback" steht direkt nach "Bewertungen" (bzw. nach "Teilen") und vor "Bearbeiten".
6. Visuelle Idee in der Freigabe-Vorschau: schmaler Airmail-Streifen am oberen Rand der Karte, Zitat in Caveat (`font-handwriting`). Sonst bewusst ruhig, passend zu den bestehenden Karten.

## Copy zur Freigabe

Alle Texte sind Entwuerfe fuer Thomas, ohne Gedankenstriche.

**Navigation (Verwalten-Seite)**
- "Bewertungen" (umbenannt, vorher "Feedback")
- "Dein Feedback" (neu)

**Karte auf der Verwalten-Seite**
- Status offen: Titel "Hast du 90 Sekunden für mich?"
- Text: "Erzähl mir kurz, wie eure Kampagne gelaufen ist. Deine Antworten helfen mir, Brief nach Berlin besser zu machen und anderen Initiativen den Start leichter."
- Button: "Feedback geben"
- Status abgeschickt: "Danke, dein Feedback ist angekommen" mit Link "Antworten ändern"

**Feedback-Seite**
- Seitentitel: "Dein Feedback | Brief-nach-Berlin"
- Zurueck-Link: "Zurück zur Kampagne"
- H1: "Wie lief eure Kampagne?"
- Lead: "Ein paar kurze Fragen, etwa 90 Sekunden. Jede Angabe ist freiwillig."

**Frage a: "Was hat euch überzeugt, es zu wagen?"**
- Kostenlos und ohne Account
- Persönlicher Kontakt zu Thomas
- Handschrift statt Klick-Petition
- Empfehlung von anderen
- Presse oder Podcast
- Einfach für unsere Community
- Mal was Neues ausprobieren

**Frage b: "Welche Bedenken hattet ihr vorher?"**
- Klingt nach KI-Spam
- Zu viel Aufwand für Unterstützer:innen
- Bringt das was?
- Kontrolle über die Botschaft
- Keine (schliesst die anderen aus)

**Frage c: "Was davon stimmt für euch?"**
- "Unsere Community hatte eine einfache Möglichkeit, politisch aktiv zu werden." (Orchestrator: auf freigegebenen Wortlaut zurückgesetzt)
- "Das Schreiben per Hand hat bei den Leuten etwas bewegt." (Orchestrator: auf freigegebenen Wortlaut zurückgesetzt)
- "Die Einrichtung ging schnell."
- "Wir würden wieder eine Kampagne starten."
- Antworten: Stimmt / Teils / Stimmt nicht / Weiß nicht

**Frage d (Zitat)**
- Label: "Ein Satz an andere Initiativen (optional)"
- Hinweis: "Was würdest du einer Initiative sagen, die überlegt, eine Briefkampagne zu starten?"
- Zaehler: "n/300"

**Freigaben (Legende "Was ich zeigen darf")**
- Vorschau-Zeile: "So würde dein Satz auf brief-nach-berlin.de aussehen:"
- Vorschau-Titel: "Anliegen von {Name}" (Name = Ersteller-Name, sonst Kampagnentitel)
- Platzhalter ohne Satz: "Hier erscheint dein Satz."
- Haekchen 1: "Unser Satz darf mit Logo und Name auf brief-nach-berlin.de erscheinen." (deaktiviert ohne Satz)
- Haekchen 2: "Unsere Antworten dürfen anonym in Zahlen einfließen."
- Hinweis: "Du kannst beides jederzeit hier ändern oder per Mail an Thomas zurücknehmen."

**Hilfsangebote (Legende "Was mir gerade am meisten hilft")**
- Intro: "Mir geht es nicht darum, selbst bekannt zu werden. Je mehr Menschen über Brief nach Berlin sprechen, desto mehr schreiben ihren ersten Brief und merken: Ich kann etwas bewegen. Wenn ihr Lust habt, kreuzt an, wobei ihr helfen könnt. Ich melde mich dann persönlich."
- Einen gemeinsamen Post oder ein Reel machen
- Mich einem Podcast, einer Redaktion oder einer Journalistin vorstellen
- Mich einer Initiative vorstellen, für die das passt
- 15 Minuten Austausch: Ich probiere gerade neue Wege aus, wie Menschen ins Handeln kommen
- Spendenzeile: "Du willst Brief nach Berlin unterstützen? Hier geht's zur Spende."

**Absenden und Danke-Zustand**
- Button: "Feedback senden", beim Senden "Wird gesendet …"
- Danke: "Danke, dein Feedback ist angekommen." und, falls Hilfsangebote angekreuzt: "Ich melde mich persönlich bei dir."
- Links: "Zurück zur Kampagne", Button "Antworten ändern"

**Meldungen der Action**
- Session abgelaufen: "Dein Zugang ist abgelaufen. Öffne den Link aus deiner Mail in einem neuen Tab und tippe dann hier noch einmal auf „Feedback senden“. Deine Antworten bleiben stehen."
- Fremde Kampagne: "Dieser Verwaltungslink gehört nicht zu dieser Kampagne."
- Mail passt nicht: "Dieser Verwaltungslink ist nicht mehr gültig."
- Nicht berechtigt: "Das Feedback-Formular ist für diese Kampagne gerade nicht offen."
- Ungueltige Eingabe: "Bitte prüf deine Angaben noch einmal."
- Fehler: "Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal."

**Interne Admin-Mail an Thomas** (Betreff `[BnB Ersteller-Feedback] <slug>`, Zusatz " (geändert)")
- "Neues Ersteller-Feedback" / "Ersteller-Feedback geändert"
- "Hilfsangebote" bzw. "Keine Hilfsangebote angekreuzt"
- "Kampagne: …", "Ersteller:in: … Antworten geht direkt per Reply."
- "Was hat überzeugt?", "Bedenken vorher", "Aussagen", "Ein Satz an andere Initiativen"
- "Nichts angekreuzt", "keine Angabe", "Kein Satz geschrieben."
- "Zitat mit Logo/Name freigegeben: ja/nein", "Anonym in Zahlen: ja/nein"

**Datenschutz Abschnitt 20 (neuer Absatz, Sie-Form)**
"Ab einer bestimmten Größe Ihrer Kampagne bitte ich um freiwilliges Feedback. Gespeichert werden die angekreuzten Antworten, ein optionaler Satz an andere Initiativen, angekreuzte Hilfsangebote und Ihre Freigaben mit Zeitpunkt. Die Antworten gehören zur Kampagne, werden mit ihr gelöscht und gehen bei einer Übergabe an die neue Inhaberin oder den neuen Inhaber mit über. Ich bekomme die Antworten zusätzlich per E-Mail über Brevo (siehe Abschnitt 11), um mich bei Ihnen melden zu können. Ihren Satz zeige ich mit Logo und Namen der Kampagne nur nach Ihrer ausdrücklichen Freigabe. Anonymisierte Zahlen nutze ich nur mit Ihrer Freigabe. Beide Freigaben können Sie jederzeit über die Verwaltungsseite oder per E-Mail widerrufen."

Rechtsgrundlage-Absatz erweitert um: "…sichere Verwaltungslinks und das Speichern des freiwilligen Feedbacks, um den Dienst zu verbessern; Art. 6 Abs. 1 lit. a DSGVO für die Veröffentlichung von Zitat und Logo sowie die anonyme Auswertung." Stand-Zeile unveraendert ("Stand: 9. Oktober 2026").

## Known Stubs

Keine. `CREATOR_SURVEY_BANNER_PATH = null` ist beabsichtigt und wird in Task 2 des freigegebenen Plans (Mails, Banner) gesetzt. Der Mail-Versand, `creatorSurveyUrl` und `isCreatorSurveyMilestone` sind noch nirgends eingebunden (Task 2).

## Threat Flags

Keine neue Angriffsflaeche ausserhalb des Threat Models. Neue Flaeche (Server Action, `ziel`-Parameter, neue Tabelle, Admin-Mail) ist durch T-r0z-01 bis T-r0z-08 abgedeckt und getestet.

## Open Items

1. Migration 029 in Supabase anwenden (erst nach Thomas' OK). Bis dahin: Status `unavailable`, keine Karte, kein Nav-Punkt, Feedback-Seite leitet um.
2. Browser-Check durch den Orchestrator: Verwalten-Link mit `&ziel=feedback`, absenden, Danke-Zustand, Karte, Screenshot bei 375 px. Erst moeglich, nachdem die Tabelle existiert oder ueber Mock.
3. Task 2 des freigegebenen Plans (Mails 500er und Abschluss, Banner, Skripte, Preview).
4. Texte von Thomas freigeben lassen, insbesondere "Bewertungen"/"Dein Feedback", lit. f und den Datenschutz-Absatz.
5. Push und Deploy: nicht erfolgt, Branch ist 10 Commits vor origin (7 vorher plus 3).

## Self-Check: PASSED

Alle 8 neuen Code-Dateien vorhanden, Commits 53e3283, 8e1ebce und 0e865eb sind Vorfahren von HEAD, `git rev-list --count` ab plan_head_before = 3.
