---
created: "2026-05-21T00:00:00.000Z"
title: "Automated 3-day follow-up mail via Brevo scheduledAt"
area: email
files:
  - web/src/app/api/generate-letter/route.ts
  - web/src/lib/email/sendFollowupEmail.ts
  - web/src/lib/email/buildFollowupHtml.ts
---

## Problem

Aktuell bekommen Briefschreiber:innen nur eine einzige Mail: den generierten Brief. Sterne-Bewertungen kommen nur unmittelbar nach der Generierung rein, bevor die Person den Brief überhaupt abgeschickt hat. Das Resultat: Reviewrate liegt bei ~1,5 % (5 von 318 nach der Lage-der-Nation-Welle, 2026-05).

Wir wissen aus den ersten Reviews, dass das Feedback erst nach dem Abschicken wirklich brauchbar wird (Tonfall, Wahrheitsgehalt, Wunsch nach Kommunalebene).

## Solution

Pro Brief eine zweite Brevo-Transactional-Mail einqueuen, ~72 Stunden nach dem Originalversand, mit dem **selben** signierten Feedback-Token (90 Tage gültig, siehe [token.ts:7](web/src/lib/feedback/token.ts#L7)). Brevo's Queue ist der Timer, keine Vercel-Cron-Slot-Belegung, keine neue DB-Tabelle, keine neue Persistenz.

## Wiederverwendet aus der Backlog-Kampagne (bereits gebaut, 2026-05-21)

- `web/src/lib/email/buildFollowupHtml.ts` rendert exakt die richtige Mail. Signatur: `buildFollowupHtml({ token, politicianName? })`. Wenn `politicianName` gesetzt ist, taucht der Name im Body auf. Keine neue Mail-Copy nötig.
- Stil basiert auf [buildEmailHtml.ts](web/src/lib/email/buildEmailHtml.ts) (Georgia, Airmail-Stripe, Caveat-Signatur). Bereits gegen `signs-of-ai-writing.md` geprüft.

## Neu zu bauen

1. `web/src/lib/email/sendFollowupEmail.ts`
   - Dünner Wrapper um `brevo.transactionalEmails.sendTransacEmail`
   - Param: `{ recipientEmail, politicianName, feedbackToken, scheduledAt }`
   - `scheduledAt` als ISO-String an Brevo. Aktuelle Doku gibt **bis zu 72 h** Vorlauf für transactional sends an: <https://developers.brevo.com/reference/sendtransacemail>. **Vor Implementierung verifizieren**, ob das Limit aktuell so steht. Falls reduziert: auf 48 h fallback und dokumentieren. Falls erweitert: weiterhin bei 72 h bleiben (sweet spot zwischen "Brief ist da, ist verschickt" und "noch frisch").
   - Tags: `["followup-3d"]`
   - Reply-To: `thomas@visualmakers.de`

2. Einbau in [generate-letter/route.ts:114-131](web/src/app/api/generate-letter/route.ts#L114-L131)
   - Im selben `after()`-Block, nach dem Original-`sendLetterEmail`
   - `Promise.allSettled` damit der Followup den Original-Versand nicht killen kann
   - Logging via `@/lib/observability`

3. Feature-Flag: `BREVO_FOLLOWUP_ENABLED=true` (Env). Wenn nicht gesetzt: Skip. Erlaubt schnelles Killen ohne Deploy.

## Verification

- Local: `scheduledAt` auf +5 min stellen, Brief mit Test-Email generieren, Brevo-Dashboard prüfen (2 Mails: 1× `sent`, 1× `scheduled`)
- Smoke-Test: nach 5 min trifft Follow-up ein, Sternklick landet auf `/feedback`, Review-Insert klappt mit vollem `debug_payload` (im Gegensatz zur Backlog-Variante speichert dieser Pfad den signierten Token + alle Brief-Metadaten)
- Production: Brevo-Statistics auf Tag `followup-3d` filtern, Open-Rate / Click-Rate beobachten
- Erfolgskriterium: Reviewrate >6 % nach 2 Wochen (Backlog-Kampagne von 2026-05 dient als Vergleichswert)

## Decision Log

- **Kein Cron-Job**: Brevo `scheduledAt` ist robuster, kostet nichts und steht nicht im Wettbewerb mit dem einzigen Vercel-Cron-Slot
- **Keine `letters_sent`-Tabelle**: bleibt DSGVO-Linie treu ("Brief-Daten werden nach Versand nicht gespeichert")
- **Gleiche Mail wie Backlog**: bewusste Wiederverwendung. Wenn Copy iteriert wird, profitieren beide Use-Cases automatisch
- **Nur ein Follow-up, kein zweites**: erst messen, dann eventuell zweite Welle nach 7 Tagen für Nicht-Antworter:innen (bräuchte dann minimale Persistenz, deshalb separater Todo)

## Out of scope

- Wunsch-Feature-Frage auf `/feedback` (z.B. Kommunalebene): separater Todo
- Webhook-basiertes Open/Click-Tracking in der DB
- Zweite Follow-up-Welle
