---
created: 2026-10-09T10:00:00.000Z
title: "Spendenbereitschaft: Spendenbitte an bessere Momente verschieben, Betrag, Foto, Fortschritt"
area: ui
severity: minor
files:
  - web/src/lib/support-content.ts
  - web/src/lib/email/financingNotice.ts
  - web/src/lib/email/buildEmailHtml.ts:670
  - web/src/lib/email/buildFollowupHtml.ts
  - web/src/app/(site)/feedback/FeedbackForm.tsx
  - web/src/components/wizard/Step3Success.tsx
  - web/src/app/(site)/spenden/page.tsx
---

## Problem

Ziel: mehr Spenden von Briefschreibenden, ohne zu nerven. Analyse vom 2026-10-08 (Code-Stand verifiziert, WE-AID-Seite live angesehen):

Heute fragt Brief-nach-Berlin an diesen Stellen:

| Ort | Moment | Foto | Befund |
|---|---|---|---|
| Landing `#mitmachen` (ProjectSupport) | beim Lesen | ja | gut |
| Footer | immer | nein | gut, leise |
| Erfolgsscreen (Step3Success) | direkt nach dem Brief | ja | guter Moment, Fokus liegt aber auf "Mail checken" |
| /spenden | aktiv gesucht | ja | ohne Zahlen, Betrag, Monatsoption, Fortschritt; zweimal derselbe Button |
| Brief-Mail + Resend (`buildFinancingNoticeHtml`) | Minuten danach | **nein** | gut platziert, kein Foto, kein Betrag |
| Follow-up-Mail (Bewertung) | Tage danach | nein | Spendenbox gleichrangig neben den Sternen, fragt bevor die Person bestätigt hat, dass ihr der Brief gefiel |
| Last-Call-Mail | 2 bis 3 Monate danach | - | keine Bitte, richtig so |
| **Feedback-Danke-Seite** | nach der Bewertung | - | **keine Bitte, größte Lücke**; Seite leitet zudem automatisch weiter |
| /weitersagen, /was-noch-kommt | - | - | keine Bitte |

Ersteller-Seite ist seit 2026-10-09 abgedeckt und folgt "Reichweite vor Spende" (Memory `feedback_creator-asks-reach-over-donation`): Verwalten-Mail-Box mit Avatar, Meilenstein-Mail (Unterstützen erst ab 500 Briefen), Kampagnenende-Mail, leise Zeile in `CampaignReferralCard` und `CreatorSurveyForm`. Dort nichts verstärken, nur prüfen, dass jede Mail höchstens eine Bitte hat.

WE-AID-Seite (Live-Stand 2026-10-08, nicht verifiziert für später): Ziel 5.000 €, gesammelt 1.645 €. Beträge 5 bis 1.000 €, einmalig/monatlich/jährlich, Quittung optional. Formular erst nach extra Klick auf "Jetzt spenden". Kein Foto von Thomas. Tippfehler "Lieben Dank dir deinen Beitrag" (fehlt "für").

Prinzipien (Inferenz aus Fundraising-Praxis): Bitte direkt nach bestätigtem Nutzen, ein Gesicht statt Institution, konkreter kleiner Betrag, sichtbares Ziel mit Fortschritt. Nicht nerven: eine Bitte pro Kontakt, nie vor dem Nutzen, nie bei Frust (≤3 Sterne, Fehler), immer "völlig ok, wenn nicht".

## Solution

Jetzt (größter Hebel):

1. **Danke-Seite nach ≥4 Sternen:** Spendenkarte mit Avatar. Copy-Idee: "Schön, dass dein Brief passt. Damit das für die Nächsten auch kostenlos bleibt: Schon 5 € helfen." Auto-Redirect bei ≥4 Sternen abschalten oder deutlich verlängern. Bei ≤3 Sternen keine Bitte (dort läuft die Verbesserungs-Karte).
2. **Follow-up-Mail:** Spendenbox neben den Sternen entfernen, höchstens eine P.S.-Zeile unter der Signatur. Sterne bekommen volle Breite. Anzahl Bitten bleibt gleich, Zeitpunkt wird besser.
3. **Betrag + Monatsoption** zentral in `support-content.ts` (wirkt auf Erfolgsscreen, Brief-Mail, /spenden): "Schon 5 € helfen. Wer regelmäßig mag: 5 € im Monat machen die Kosten planbar." Stärker mit echter Zahl "5 € decken die KI-Kosten für etwa N Briefe" (braucht Kosten/Monat ÷ Briefe/Monat).
4. **Avatar in die Spendenbox der Brief-Mail:** `buildFinancingNoticeHtml` nimmt seit den Ersteller-Mails schon einen Avatar-Parameter, Brief-Mail (`buildEmailHtml.ts:670`) übergibt ihn noch nicht. Manuell bei WE AID: Portrait als erstes Bild, Tippfehler fixen.
5. **Fortschritt zeigen:** "1.645 € von 5.000 € gesammelt" auf /spenden und im Erfolgsscreen, als von Hand gepflegte Konstante (monatlich aktualisieren).

Später:

6. /spenden schärfen: echte Monatszahlen statt nur Kostenarten, Satz mit "Scheingenauigkeit" streichen, zweiten Button durch Monats-CTA ersetzen, "steuerlich absetzbar, Quittung über WE AID" sichtbarer.
7. Neue Stellen: /was-noch-kommt (Spenden an nächste Features knüpfen), /weitersagen ("Oder mit 5 € helfen"), /warum (Karte statt Textlink).
8. Messen: eigener Link pro Stelle (`?src=success|mail|feedback|followup`). Vorher klären, ob WE AID Parameter oder Referrer im Dashboard zeigt; sonst Klicks selbst zählen.
9. Last-Call bleibt ohne Bitte. Wenn jemand eine MdB-Antwort meldet: P.S. mit Spendenlink in Thomas' persönlicher Antwort (manuell, kein Code).
10. Validierung vorab: 2 bis 3 bisherige Spender:innen fragen, wo sie geklickt haben und warum.

## Offene Entscheidungen (Thomas)

1. Umfang: A. Punkte 1 bis 5 als ein Paket, B. erst nur 1 und 2, C. erst Kostenzahl liefern, dann Paket.
2. Betragsanker: A. 5 € einmalig oder monatlich, B. 3 €, C. nur "jeder Betrag hilft".
3. Fortschrittsanzeige: A. manuell gepflegte Konstante, B. weglassen.

Copy: keine Gedankenstriche, Check gegen signs-of-ai-writing. Frontend über `/frontend-design` bzw. `/design-taste-frontend`.

Check: Jest für Follow-up-Mail (keine Spendenbox mehr neben Sternen) und Brief-Mail (Avatar drin); FeedbackForm-Test für Karte nur bei ≥4 Sternen und kein Redirect; Mail-HTML lokal rendern, Screenshots mobil + Desktop. Kein Versand.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md` um. Entscheidungen: <hier 1A 2A 3A o.ä. eintragen>.
