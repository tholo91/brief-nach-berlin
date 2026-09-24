# Plan: Self-Service-Datenlöschung (`/datenloeschen`)

Stand: 2026-09-21 · Status: freigegeben zur Umsetzung · Ort: `.planning/datenloeschen-selfservice.md`

## Ziel

Nutzer:innen, die von uns eine E-Mail erhalten, sollen ihre in Supabase gespeicherten Daten direkt selbst löschen können, statt einen Löschwunsch per Mail an Brief-nach-Berlin@posteo.de zu schicken. Einstieg: persönlicher Link in der E-Mail, der einen signierten Token trägt. Die Lösch-Seite ist vorausgefüllt und löscht Bewertung und freiwilliges Themensignal endgültig. Der manuelle Weg (mailto) bleibt als Fallback auf der Seite bestehen.

## Heutiger Ist-Zustand

- Löschwunsch läuft ausschließlich über `mailto:Brief-nach-Berlin@posteo.de`, statisch erzeugt durch `buildDataDeletionMailto(locale)` in `web/src/lib/email/mailLocale.ts:255`.
- Verwendet wird dieser mailto in:
  - `web/src/lib/email/buildFollowupHtml.ts:66` (Followup, in HTML- und Text-Footer)
  - `web/src/lib/email/buildLastcallHtml.ts:49` (Lastcall, HTML- und Text-Footer)
  - `web/src/app/(site)/datenschutz/page.tsx:651`
  - `web/src/app/(site)/feedback/PrivacyDisclosure.tsx:74`
- Manuelles Löschen: `web/scripts/delete-letter-data-by-email.ts`. Logik (Zeile 56 bis 96): löscht `reviews` per `email`, `letter_signals` per `email_lookup_hash`, per `email_normalized` und zusätzlich per `letter_id` der gefundenen Reviews. Dry-run default, `--confirm` für echtes Löschen.
- Betroffene Tabellen:
  - `reviews.email` (Bewertung; RLS nur SELECT für consented, Deletes nur Service-Role)
  - `letter_signals.email_normalized` + `email_lookup_hash` (freiwilliges Themensignal mit PLZ; alles Service-Role)
  - Nicht relevant für diesen Plan: `roadmap_signups`, `campaigns.creator_email` (Folge-TODO)
- Token-Infrastruktur zum Nachahmen: `web/src/lib/feedback/token.ts` (HMAC-b64url, TTL 90 Tage, `iat` im Envelope) und `web/src/lib/letterSignals/token.ts` (Purpose-Feld in einer zod-Verified Envelope).
- Rate-Limiting: `web/src/lib/rateLimit.ts` mit `LIMITS` und `checkRateLimit`, `hashIdentifier`, `getClientIp`.
- Kein Supabase-Auth, anon-Key hart gesperrt. Deletes laufen über Service-Role-Client (Server Actions) wie in `web/src/lib/actions/letterSignals.ts`.
- Mail-Anbindung Followup: `web/src/lib/email/sendFollowupEmail.ts` hat `recipientEmail` (Summe 34). Lastcall: `web/scripts/send-lastcall-followup.ts` rendert HTML/Text aktuell EINMAL für alle (Zeile 91/92), Empfänger kommen aus CSV.

## Freigegebene Entscheidungen

| Entscheidung | Wert |
|---|---|
| Route | `/datenloeschen` unter `(site)`, `noindex`, kein Sitemap-Eintrag |
| Einstieg | Persönlicher signierter HMAC-Token im Mail-Link, Muster `feedback/token.ts` |
| Token-Inhalt | `purpose: "data_deletion"` + normalisierte E-Mail + `iat`, TTL 90 Tage |
| E-Mail-Feld | Vorausgefüllt aus Token und editierbar; gelöscht wird die eingereichte Adresse |
| Umfang | Nur `reviews` + `letter_signals`, exakt die heutige Skript-Logik |
| Ohne Token | Nur Text + mailto-Fallback (keine manuelle Fremd-Löschung) |
| Brevo-Schedule | Nicht canceln in v1; kurzer Disclaimer auf der Seite |
| Sprache | Deutsch, v1 (en/tr als Folge-TODO) |
| Logging | Kein PII; bei Fehlern nur `email_lookup_hash` |

## UX-Zustände und Copy (Deutsch, ohne Em-Dashes)

### State A: kein Token / ungültiger / abgelaufener Token

- H1: „Gespeicherte Daten löschen"
- „Brief-nach-Berlin speichert von dir höchstens zwei Dinge: eine Bewertung deines Briefs, falls du eine abgegeben hast, und ein freiwilliges Themensignal mit PLZ, falls du das freigegeben hast. Beides kannst du hier endgültig löschen."
- Hinweis-Box: „Der direkte Weg geht über den persönlichen Link in der E-Mail, die wir dir geschickt haben. Hast du den nicht mehr zur Hand, schreib mir einfach eine kurze Mail an [Brief-nach-Berlin@posteo.de] und ich prüfe das persönlich. Brief-nach-Berlin pflege ich allein in meiner Freizeit. Deine Daten sind bei mir sicher, und gelöscht wird nur, was wirklich zu deiner Adresse gehört."
- Mailto-Link: „E-Mail an Brief-nach-Berlin schreiben"

### State B: gültiger Token (Formular)

- Label „E-Mail-Adresse" (vorausgefüllt, editierbar)
- Hinweis: „Mit dem Löschen verschwinden deine Bewertung und dein Themensignal endgültig aus unserer Datenbank. Sollte zu deinem Brief noch eine einzelne Rückfrage-Mail geplant sein, kann ich eine bereits eingeplante Nachricht nicht mehr zurückholen. Sie ist kein Newsletter, und danach ist Schluss. Deine Daten bleiben gelöscht."
- Button: „Alle Daten löschen"
- Sekundär: „Stimmt die Adresse nicht? Schreib mir: [mailto]"

### State C: Erfolg

- „Geschafft. Deine Daten wurden gelöscht."
- Mit Treffern: „X Bewertung(en) und Y Themensignal(e) wurden dauerhaft entfernt."
- Ohne Treffer: „Es lagen keine Daten zu dieser Adresse vor. Alles gut, für uns bist du hier sauber."
- „Danke, dass du einen Brief geschrieben hast. Falls doch noch eine einmalige Rückfrage-Mail unterwegs ist, endet es nach ihr endgültig."
- Outbound-Link „Einen neuen Brief schreiben" nach `/app`

### State D: Fehler

- „Da ist etwas schiefgegangen. Deine Daten wurden nicht gelöscht. Bitte versuch es gleich noch einmal oder schreib mir: [mailto]"

## Umsetzung, Datei für Datei

### 1. Neu: `web/src/lib/dataDeletion/token.ts` (server-only)

Kopie des Aufbaus von `feedback/token.ts`, aber mit Purpose-Check:

- Envelope: `{ v: 1, purpose: "data_deletion", email, iat }`, HMAC-SHA256, b64url, `timingSafeEqual`.
- Secret: `FEEDBACK_TOKEN_SECRET` (wie `letterSignals/token.ts` als Fallback-Kette). Wirft, wenn nicht gesetzt.
- TTL: 90 Tage (Konstante `DATA_DELETION_TOKEN_MAX_AGE_SECONDS`), `MAX_FUTURE_SKEW_SECONDS = 30`.
- Exporte:
  - `createDataDeletionToken(email: string, nowSeconds?: number): string`
  - `verifyDataDeletionToken(token: string, nowSeconds?: number): { email: string } | null`
- Verify lehnt ab: falsche Signatur, falsches Purpose (damit ein Feedback- oder Letter-Signal-Token nicht als Lösch-Token funktioniert), abgelaufenes `iat`, Token länger als 4096 Zeichen.
- Email vor dem Signieren normalisieren: `email.trim().toLowerCase()`.

### 2. Neu: `web/src/lib/dataDeletion/deleteByEmail.ts` (server-only)

Shared-Logik, exakt nach `delete-letter-data-by-email.ts:56-96`:

- `getServiceRoleClient()` aus `@/lib/supabase/server` nutzen.
- Lookups parallel:
  - `reviews` per `.eq("email", email)`
  - `letter_signals` per `.eq("email_lookup_hash", hash)` (Hash via `createLetterSignalEmailHash(email, LETTER_SIGNAL_EMAIL_HASH_SECRET)`)
  - `letter_signals` per `.eq("email_normalized", email)`
  - `letter_signals` per `in("letter_id", linkedLetterIds)` (letter_ids der Reviews des Users), dedupliziert per `id`.
- Export `deleteUserDataByEmail(email): Promise<{ deletedReviews: number; deletedSignals: number }>`: führt die Deletes aus und gibt exakte Counts zurück (`{ count: "exact" }`).
- Wirft bei Fehlern; ruft nichts anderes nebenbei auf (kein Logging von E-Mail).

### 3. Neu: `web/src/lib/actions/deleteData.ts` (Server Action)

- Input zod: `{ token: string (max. 4096), email: string (Email-Regex) }`.
- Ablauf:
  1. `verifyDataDeletionToken(token)`; bei null → `{ ok: false, reason: "invalid_link" }`.
  2. Email normalisieren.
  3. Rate-Limit:
     - `checkRateLimit("data-deletion:ip:" + hashIdentifier(await getClientIp()), LIMITS.DATA_DELETION_PER_IP.max, ...)` → `rate_limited`
     - `checkRateLimit("data-deletion:email:" + hash, LIMITS.DATA_DELETION_PER_EMAIL.max, ...)` → `rate_limited`
  4. `deleteUserDataByEmail(email)`.
  5. Rückgabe-Union:
     `{ ok: true, deletedReviews, deletedSignals }` (beide >= 0) oder `{ ok: false, reason: "invalid_link" | "rate_limited" | "server_error" }`.
- Kein Logging der rohen E-Mail. Bei `server_error` nur `console.error` mit Reason, ohne die Adresse.

### 4. Neu: `web/src/app/(site)/datenloeschen/page.tsx` (Server-Component)

- Muster: `web/src/app/(site)/feedback/page.tsx`.
- `searchParams: Promise<{ t?: string }>`; bei `t` vorhanden → `verifyDataDeletionToken` (server-side im Render) und Client-Formular mit vorausgefüllter, lesbarer E-Mail; sonst State A.
- `metadata`: `title: "Gespeicherte Daten löschen | Brief-nach-Berlin"`, `robots: { index: false, follow: false }`, `referrer: "no-referrer"` (kein Token-Leak im Referer).
- Styling im bestehenden Look (bg-creme, weiße Card, waldgruen Primary-Button, font-typewriter/font-body), keine Marketing-Elemente.

### 5. Neu: `web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx` (Client-Component)

- Formular: E-Mail-Input (vorausgefüllt, editierbar, `autocomplete="email"`), Hinweis-Text (State-B-Copy), Button „Alle Daten löschen".
- Submit ruft Server Action mit Token + eingereichter E-Mail; während des Requests Button disabled.
- Mapping der Rückgabe auf State C (mit/ohne Treffer) oder State D.
- Sekundärbereich: mailto-Fallback (Reuse `buildDataDeletionMailto("de")` aus `mailLocale.ts`) für „Stimmt die Adresse nicht?" und State A/D.

### 6. Edit: `web/src/lib/email/buildFollowupHtml.ts`

- `BuildFollowupParams` + optionales `deleteUrl?: string`.
- Zeile 66: `const deleteUrl = params.deleteUrl ?? \`${base}/datenloeschen\`;` (Default = Seite ohne Token, damit Preview- und Nicht-Mail-Kontexte sauber sind).
- Text-Footer Zeile 99: `... ${copy.privacy}: ${base}/datenschutz · ${copy.delete}: ${deleteUrl} · ...` statt `FOUNDER_EMAIL`.
- HTML-Footer (Zeile 261) nutzt automatisch `deleteUrl`; Import von `buildDataDeletionMailto` entfernen, sofern nicht anderweitig benutzt.

### 7. Edit: `web/src/lib/email/sendFollowupEmail.ts`

- Token münzen: `const deleteUrl = \`${APP_URL}/datenloeschen?t=${createDataDeletionToken(params.recipientEmail)}\`;`
- An `buildFollowupHtml` durchreichen.
- Importe: `createDataDeletionToken`, `APP_URL` (aus `@/lib/config`).

### 8. Edit: `web/src/lib/email/buildLastcallHtml.ts`

- `BuildLastcallParams` + optionales `deleteUrl?: string`.
- Zeile 49: `const deleteUrl = params.deleteUrl ?? \`${base}/datenloeschen\`;`.
- Text (Zeile 84) und HTML-Footer (Zeile 247) auf `deleteUrl` umstellen.
- Vorhandene Selbsttest-Prüfung `buildLastcallHtml()` ohne Params muss weiterhin funktionieren (Default-Fallback).

### 9. Edit: `web/scripts/send-lastcall-followup.ts`

- Das „render einmal" (Zeilen 91/92) ersetzen: Schleife rendert pro Empfänger:
  ```
  const deleteUrl = `${APP_URL}/datenloeschen?t=${createDataDeletionToken(to)}`;
  const { subject, html, text } = buildLastcallHtml({ deleteUrl });
  ```
  `APP_URL` in diesem Script aus env/`.env.local` (analog `loadEnvLocal()`) oder konstant; konsistent mit Produktion.
- Konsolen-Log anpassen („Subject: ja identisch, HTML pro Empfänger").
- Kein echtes Senden ohne ausdrückliche Autorisierung (AGENTS-Regel bleibt; Dry-Run-Test nur gegen Brief-nach-Berlin@posteo.de).

### 10. Edit: statische Verlinkungen

- `web/src/app/(site)/datenschutz/page.tsx:651`: href auf `/datenloeschen`.
- `web/src/app/(site)/feedback/PrivacyDisclosure.tsx:74`: href auf `/datenloeschen`.
- `buildDataDeletionMailto` bleibt existieren (wird vom Client als Fallback mailto benutzt).

### 11. Edit: `web/src/lib/rateLimit.ts`

Neue LIMITS-Einträge:

```ts
DATA_DELETION_PER_IP: { max: 10, windowMs: 60 * 60_000 },
DATA_DELETION_PER_EMAIL: { max: 3, windowMs: 24 * 60 * 60_000 },
```

### 12. Refactor (empfohlen, optional): `web/scripts/delete-letter-data-by-email.ts`

- Ruft stattdessen `deleteUserDataByEmail(email)` auf; `--confirm`-Verhalten und Dry-run-Ausgaben unverändert. Reduziert Divergenz zwischen Skript und Self-Service.

## Tests

Neue Jest-Dateien unter `web/src/__tests__/`:

- `dataDeletionToken.test.ts`: sign/verify, Purpose-Mismatch (Feedback-token-formart wird abgelehnt), TTL abgelaufen, manipulierter Body, abweichende Location.
- `dataDeletionAction.test.ts`: Mock von `@/lib/supabase/server` und `@/lib/dataDeletion/deleteByEmail`; Prüfe Pfade: gültiger Token + E-Mail, Kein-Treffer (0/0), `invalid_link`, `rate_limited`, editierte E-Mail wird benutzt.
- `dataDeletionDeleteByEmail.test.ts`: Lookup-Kombinationen (reviews, hash, normalized, linked letter_ids), Dedup, Counts.

Aktualisieren:

- `privacyEmail.test.ts`: Followup/Lastcall enthalten `/datenloeschen` und nicht mehr mailto; mit `deleteUrl` in Params erscheint der Token-Link; ohne deleteUrl der Fallback.
- `emailSocialFollow.test.ts` und andere Footer-Assertionen ggf. auf neue URL anpassen (nur wo mailto geprüft wird).

## DSGVO und Doku

- `DSGVO-VERARBEITUNGSVERZEICHNIS.md` (Repo-Root): Abschnitt ergänzen: „Selbstbedienungs-Löschung durch Betroffene über `/datenloeschen`": stateless signierter Token (HMAC, kein neues Storage), Löschung von `reviews` + `letter_signals`, manueller Weg bleibt. Kein neues Tracking, keine neuen Logs mit E-Mail-Adressen.

## Verifikation

- Aus `web/`: `npm run lint`
- Gezielte Tests: `npm run test src/__tests__/dataDeletionToken.test.ts src/__tests__/dataDeletionAction.test.ts src/__tests__/dataDeletionDeleteByEmail.test.ts src/__tests__/privacyEmail.test.ts`
- `npm run build`
- Smoke: `api/email-preview` zeigt Followup mit Fallback-/Token-URL.
- Kein echter Mail-Versand und kein `--confirm`-Löschen ohne ausdrückliche Autorisierung durch Thomas.
- Stichprobe gegen lokale Supabase-Staging-Daten: einmal mit vorhandener Bewertung+Signal, einmal ohne Treffer.

## Out of Scope (Folge-TODOs)

- Canceln geplanter Brevo-Sends (followup-3d/followup-3m) bei Löschung per `deleteScheduledEmailById`.
- en/tr-Lokalisierung der Seite.
- Einbezug `roadmap_signups` und `campaigns.creator_email` in die Selbstbedienung.