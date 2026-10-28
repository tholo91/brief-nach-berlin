---
phase: quick-261028-enu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/supabase/migrations/038_reviews_letter_history.sql
  - web/supabase/MIGRATION_STATUS.md
  - web/src/lib/feedback/letterHistory.ts
  - web/src/app/(site)/feedback/FeedbackForm.tsx
  - web/src/lib/actions/submitReview.ts
  - web/src/app/(site)/datenschutz/page.tsx
  - web/src/lib/internalStats/getInternalStats.ts
  - web/src/lib/internalStats/aggregate.ts
  - web/src/app/stats/page.tsx
  - web/src/lib/campaigns/creatorStatsView.ts
  - web/src/components/campaigns/CampaignCreatorStats.tsx
  - web/src/__tests__/letterHistory.test.ts
  - web/src/__tests__/internalStats.test.ts
  - web/src/__tests__/campaignCreatorStats.test.ts
autonomous: true
requirements:
  - QUICK-261028-enu
user_setup:
  - "Thomas spielt 038_reviews_letter_history.sql im Supabase SQL Editor ein, BEVOR gepusht wird."

must_haves:
  truths:
    - "D-01: Im Feedback-Formular /feedback steht eine freiwillige Frage 'Hast du schon mal einen Brief an Politiker:innen geschrieben?' mit (optional)-Hinweis wie bei der Altersfrage, sichtbar unabhängig davon, ob der Brief verschickt wird. Optionen: first = 'Nein, das ist mein erster', bnb_only = 'Ja, aber nur mit Brief-nach-Berlin', before = 'Ja, auch schon vorher'."
    - "D-02: Nur bei first oder bnb_only erscheint (animate-feedback-in) die freiwillige Folgefrage 'Hattest du davor schon mal anders Kontakt zu Politiker:innen, z. B. per Mail oder Anruf?' mit Ja / Nein. Bei Wechsel auf before oder Abwahl wird die Folgefrage geleert."
    - "D-03: Gespeichert in reviews.letter_history (text, null|first|bnb_only|before) und reviews.prior_other_contact (boolean, nur erlaubt bei first|bnb_only), nur im Modus full. Der Server lehnt prior_other_contact ohne passendes letter_history ab."
    - "D-04: /stats zeigt einen Block nach dem Muster der Altersgruppen: Antwortzahl und 'erfasst seit', Verteilung, Anteil 'vor Brief-nach-Berlin nie einen Brief' (first+bnb_only), Anteil 'noch nie Kontakt' (prior_other_contact=false unter first+bnb_only mit Antwort auf die Folgefrage), Anteil bnb_only, und positive Handlungsfähigkeit (clearly_yes+rather_yes unter Antworten mit political_self_efficacy) bei first+bnb_only gegenüber before."
    - "D-05: Die Kampagnen-Statistik zeigt 'X % hatten vor Brief-nach-Berlin noch nie einen Brief an Politiker:innen geschrieben', erst ab CREATOR_STATS_MIN_RESPONSES (10) Antworten auf diese Frage; darunter nichts."
    - "D-06: Die Datenschutzerklärung listet neben der Altersgruppe: 'Optional: ob Sie schon einmal an Politiker:innen geschrieben oder sie anders kontaktiert haben'."
    - "D-07: Copy ohne Gedankenstriche, Ich-Form, Markenname 'Brief-nach-Berlin' mit Bindestrichen."
  artifacts:
    - path: "web/supabase/migrations/038_reviews_letter_history.sql"
      provides: "Spalten letter_history + prior_other_contact mit CHECKs und REVOKE SELECT von anon/authenticated/PUBLIC"
      contains: "prior_other_contact"
    - path: "web/src/lib/feedback/letterHistory.ts"
      provides: "LETTER_HISTORY_VALUES, LETTER_HISTORY_LABELS, needsPriorContactQuestion"
      contains: "needsPriorContactQuestion"
---

# Quick 261028-enu: Erstschreiber-Frage im Feedback-Formular

Ziel: belegen, ob Brief-nach-Berlin Menschen zum ersten Mal an die Politik schreiben lässt. Nur erfassen und intern auswerten: kein neues Freitextfeld, keine Zitate, keine Änderung an der Einwilligung, nichts Öffentliches.

## Task 1: Datenmodell, Formular, Server, Datenschutz

**files:** migration 038, MIGRATION_STATUS.md, letterHistory.ts, FeedbackForm.tsx, submitReview.ts, datenschutz/page.tsx, letterHistory.test.ts

**action:**
- `web/supabase/migrations/038_reviews_letter_history.sql` nach Vorlage `028_reviews_age_group.sql` (ALTER TABLE ADD COLUMN IF NOT EXISTS, DROP/ADD CONSTRAINT, REVOKE SELECT (col) FROM anon, authenticated, PUBLIC). CHECK `letter_history IS NULL OR letter_history IN ('first','bnb_only','before')`; CHECK `prior_other_contact IS NULL OR letter_history IN ('first','bnb_only')`. Kopfkommentar: optional, intern, nie öffentlich; vor Deploy einspielen.
- `web/supabase/MIGRATION_STATUS.md`: Zeile für 038 „Not yet applied“; Thomas spielt sie VOR dem Deploy ein, weil Insert in reviews und die /stats-Abfrage sonst mit 42703 scheitern.
- `web/src/lib/feedback/letterHistory.ts` in der Form von `ageGroup.ts`: VALUES, Typ, LABELS, `needsPriorContactQuestion(value)` (true für first/bnb_only).
- `submitReview.ts`: Zod `letterHistory: z.enum(LETTER_HISTORY_VALUES).nullable().default(null)`, `priorOtherContact: z.boolean().nullable().default(null)`. Ungültige Kombination (priorOtherContact !== null ohne needsPriorContactQuestion) mit deutscher Fehlermeldung ablehnen, analog zum bestehenden `validatePoliticalReviewAnswers`-Aufruf. Im full-Insert `letter_history` und `prior_other_contact` setzen, im initial-Modus nicht anfassen.
- `FeedbackForm.tsx`: State + neues Fieldset direkt nach dem bedingten Block zur Handlungsfähigkeit, vor der Ohnmacht-Frage. `SurveyChoice` wiederverwenden (grid-cols-2 wie die anderen; die dritte Option `wide`), Hinweiszeile in Ich-Form: „Hilft mir zu sehen, ob Brief-nach-Berlin Menschen zum ersten Mal zum Schreiben bringt.“ Folgefrage als zweites Fieldset mit `animate-feedback-in`, Ja/Nein über `SurveyChoice`. Erneutes Antippen der gewählten Option muss nicht abwählen (gleiches Verhalten wie Altersfrage). Wert an die Server-Action übergeben wie ageGroup.
- `datenschutz/page.tsx` ~Zeile 607: neuer `<li>` direkt nach der Altersgruppe.
- `web/src/__tests__/letterHistory.test.ts` nach `ageGroup.test.ts`, plus Test der Kombinationsprüfung (reine Funktion, falls ausgelagert, sonst über die Action mit gemocktem Supabase wie in `reviewCampaignSlug.test.ts`).

**verify:** `cd web && npx jest letterHistory reviewCampaignSlug feedbackThankYouDonation` grün.

**done:** Formular sendet beide Werte, Server validiert und speichert sie, Datenschutz ergänzt.

## Task 2: Auswertung in /stats und Kampagnen-Statistik

**files:** getInternalStats.ts, aggregate.ts, stats/page.tsx, creatorStatsView.ts, CampaignCreatorStats.tsx, internalStats.test.ts, campaignCreatorStats.test.ts

**action:**
- `getInternalStats.ts`: `letter_history, prior_other_contact` in die reviews-Abfrage.
- `aggregate.ts`: neuer Block nach dem Muster `ageGroups` (`emptyAgeGroupStats`, `answerCount`, `answeredSince`): Verteilung je Wert, `neverBeforeShare` (first+bnb_only), `noPriorContactShare` (false unter first+bnb_only mit Folgeantwort, mit eigener Basis-Zahl), `repeatShare` (bnb_only), Handlungsfähigkeit positiv für Erstschreiber (first+bnb_only) vs. before inkl. Basiszahlen. Leerfall sauber (null statt NaN).
- `stats/page.tsx`: Abschnitt „Erstschreiber“ im Stil des Altersgruppen-Abschnitts, mit Basiszahlen neben Prozenten.
- `creatorStatsView.ts`: `letter_history` in die Spaltenliste (`…_SELECT`-Konstante), Wert `firstTimeShare` (first+bnb_only unter allen Antworten auf die Frage) nur wenn Antworten ≥ `CREATOR_STATS_MIN_RESPONSES`, sonst null. `endedMail.ts` nutzt dieselbe View: dort nichts Neues anzeigen, aber Typen dürfen nicht brechen.
- `CampaignCreatorStats.tsx`: ein Satz „X % hatten vor Brief-nach-Berlin noch nie einen Brief an Politiker:innen geschrieben“, nur wenn `firstTimeShare !== null`, im vorhandenen Stil.
- Tests: `internalStats.test.ts` (Anteile, Vergleich, Leerfall), `campaignCreatorStats.test.ts` (9 Antworten → null, 10 → Prozent).

**verify:** `cd web && npx jest internalStats campaignCreatorStats campaignEndedMailFlow` grün.

**done:** /stats und Kampagnen-Statistik zeigen die neuen Werte.

## Task 3: Gesamtcheck

**action:** `cd web && npx jest` und `npx tsc --noEmit` grün. Mistral bleibt in allen Tests gemockt (`@/lib/mistral`). Kein Push, kein Deploy, keine Schreibzugriffe auf die Produktions-Datenbank.

**verify:** beide Befehle ohne Fehler.
