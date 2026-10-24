---
quick_id: 261024-xax
story: S0 (schule-jung)
mode: quick
spec: /Users/thomas/Documents/Git Repos/brief-nach-berlin/.planning/schule-jung/SPEC.md
---

# S0 Klassenlink-Token und Belastbarkeit

Ziel: Eine Klasse (25 Schüler:innen hinter einer Schul-IP) kann über einen Klassenlink Briefe erzeugen, ohne am IP-Limit (10/h) zu scheitern. Mistral-429 in Spitzen wird länger abgefedert, der Client erklärt die Wartezeit.

Nicht in S0: UI für /jung oder /schule, Prompt-Änderungen, Client-Plumbing von `classToken` aus dem Handoff (S1). S0 baut nur die Server-Seite plus Wartetext.

## Task 1: Klassen-Token durch Erweiterung von `feedback/token.ts`

Files: `web/src/lib/feedback/token.ts`, neu `web/src/lib/schule/classToken.ts`, neu `web/src/__tests__/classToken.test.ts`

- `signFeedbackToken(payload, opts?)` und `verifyFeedbackToken(token, opts?)` bekommen optional `{ macDomain?: string; maxAgeSeconds?: number }`. MAC-Eingabe = `(macDomain ?? "") + body`. Ohne Optionen ist das Verhalten byte-gleich zu heute (bestehende Tokens bleiben gültig, `feedbackToken.test.ts` bleibt grün).
- `classToken.ts` (`import "server-only"` wie `feedback/token.ts`):
  - `CLASS_TOKEN_MAX_AGE_SECONDS = 14 * 24 * 60 * 60`, `MAC_DOMAIN = "class-link-v1."`, Payload `{ v: 1, k: klasse, p: plz }` (+ `iat` vom Signer = issuedAt).
  - `signClassToken({ klasse, plz })` → string.
  - `verifyClassToken(token: unknown)` → `{ klasse: number; plz: string; issuedAt: number; bucketId: string } | null`. Wirft nie (fehlendes Secret, Müll, falscher Typ → null). Längen-Cap 512. Zod: `v` literal 1, `k` int 7..13, `p` `/^\d{5}$/`. `bucketId = hashIdentifier(token)` aus `@/lib/rateLimit`.
- Tests: Roundtrip; manipulierter Body/MAC → null; abgelaufen (15 Tage, `jest.useFakeTimers`/`setSystemTime`) → null; 13 Tage → gültig; ein normaler Feedback-Token (ohne Domain) → null; Klassen-Token als Feedback-Token → null; ungültige Klasse/PLZ → null; ohne `FEEDBACK_TOKEN_SECRET` → null statt Exception.

## Task 2: Klassen-Bucket statt IP-Bucket

Files: `web/src/lib/rateLimit.ts`, `web/src/lib/types/wizard.ts`, `web/src/lib/actions/submitWizard.ts`, `web/src/lib/actions/prefetchRouting.ts`, `web/src/app/api/generate-letter/route.ts`, neu `web/src/__tests__/classRateLimit.test.ts` (plus ggf. Ergänzungen in `prefetchRouting.test.ts` / `generateLetterRouteHardening.test.ts`)

- `LIMITS` bekommt `LETTERS_PER_CLASS: { max: 80, windowMs: 60 * 60_000 }` und `ROUTING_PREFETCH_PER_CLASS: { max: 60, windowMs: 60 * 60_000 }`, mit Kommentar: Brief-Vorprüfung (`submitWizardAction`) und Generierung (`/api/generate-letter`) teilen den Bucket wie beim IP-Limit, ein Brief zählt bis zu zweimal, 80 ≈ 40 Briefe pro Stunde und Klassenlink.
- Ein Helper in `rateLimit.ts`, der von allen drei Stellen genutzt wird (keine Kopien):
  `checkOriginRateLimit(kind: "letter" | "routing-prefetch", ipHash: string, classBucketId?: string | null): RateLimitResult`
  - mit `classBucketId`: Key `${kind}:class:${classBucketId}`, Limit `LETTERS_PER_CLASS` bzw. `ROUTING_PREFETCH_PER_CLASS`
  - sonst: heutiger Key `${kind}:ip:${ipHash}` mit `LETTERS_PER_IP` bzw. `ROUTING_PREFETCH_PER_IP` (Keys exakt wie heute: `letter:ip:` und `routing-prefetch:ip:`)
- `WizardData` bekommt `classToken?: string`.
- `submitWizardAction` und `/api/generate-letter`: IP-Check ersetzen durch `checkOriginRateLimit("letter", ipHash, verifyClassToken(data.classToken)?.bucketId)`. Der E-Mail-Check (`LETTERS_PER_EMAIL`, 3/24 h) bleibt unverändert und läuft immer.
- `prefetchRoutingAction(issueText, classToken?: string)`: zweiter optionaler Parameter, Check über den Helper mit `"routing-prefetch"`. Bestehende Aufrufer bleiben kompatibel.
- Logs dürfen den Bucket-Typ nennen (`origin: "class" | "ip"`), nie Token, PLZ oder E-Mail.
- Tests (Mistral immer gemockt, keine Netzaufrufe):
  - 25 Briefe mit einem gültigen Klassen-Token, gleiche IP, je eigene E-Mail, je zwei Checks (Vorprüfung + Generierung) → alle erlaubt.
  - Ohne Token: der 11. Check derselben IP ist blockiert.
  - Abgelaufener oder manipulierter Token → fällt auf den IP-Bucket zurück (blockiert ab dem 11.).
  - E-Mail-Limit greift auch mit Klassen-Token (4. Check derselben E-Mail blockiert).
  - Prefetch: mit Token eigener Bucket, ohne Token IP-Bucket wie heute.
  - Mindestens ein Test über den echten Route-Handler `POST` von `/api/generate-letter` (Muster: `generateLetterRouteHardening.test.ts`), der 25 Requests mit Klassen-Token durchlässt und ohne Token beim 11. mit 429 antwortet.

## Task 3: Längeres 429-Backoff + Client-Wartetext

Files: `web/src/lib/mistral.ts`, `web/src/lib/generation/generateLetter.ts`, `web/src/components/wizard/Step3Success.tsx`, Tests in neuem `web/src/__tests__/mistralRetry.test.ts` (oder bestehender Retry-Test, falls vorhanden)

- `withMistralRetry(label, fn, opts)` bekommt optional `rateLimitBudgetMs`. Ohne die Option ist das Verhalten exakt wie heute (alle bestehenden Tests grün, Routing und Transkription unverändert).
- Mit `rateLimitBudgetMs` gilt nur für Status 429:
  - Wartezeit = `Retry-After` (Sekunden, aus `rawResponse.headers` wie heute), sonst zufällig 4 bis 10 s (Jitter verteilt eine Klasse, die gleichzeitig klickt).
  - Weiter versuchen, solange die Summe aller 429-Wartezeiten im Budget bleibt; passt die nächste Wartezeit nicht mehr ins Budget, sofort mit dem letzten 429-Fehler abbrechen (gleicher Fehlerweg wie heute). Harte Obergrenze 6 Versuche.
  - Andere retrybare Fehler (5xx, Netzwerk) behalten Zeitplan und `maxAttempts` (3) von heute.
- `generateLetter.ts`: nur der erste Aufruf (`generateLetter:first`) nutzt `{ rateLimitBudgetMs: 20_000 }`. Begründung im Kommentar: `maxDuration` der Route ist 60 s, ein Brief braucht im Median 14 s plus ggf. Längen-Retry. Der Längen-Retry (`generateLetter:retry`) bleibt unverändert.
- `Step3Success.tsx`: Während auf `/api/generate-letter` gewartet wird (nicht `letterReady`, kein `connectionLost`, kein `generationFetchError`), nach 20 s den Hinweis „Bitte lass diese Seite offen. Lange Briefe können bis zu einer Minute dauern.“ ersetzen durch „Viele schreiben gerade, dein Brief kommt gleich. Bitte lass diese Seite offen.“ Timer sauber aufräumen. Konstante für die 20 s, keine weitere UI-Änderung.
- Tests (fake timers, Mistral gemockt): 429, 429, Erfolg im Budget → Ergebnis; dauerhafter 429 → wirft nach Budget, Gesamtwartezeit ≤ Budget; `Retry-After: 3` wird genutzt; ohne Option: 429 wartet wie heute (2 s, 4 s) und bricht nach 3 Versuchen ab; 500 mit Option → weiterhin 3 Versuche.

## Verify

- `cd web && npx jest src/__tests__/classToken.test.ts src/__tests__/classRateLimit.test.ts src/__tests__/mistralRetry.test.ts src/__tests__/feedbackToken.test.ts src/__tests__/prefetchRouting.test.ts src/__tests__/generateLetterRouteHardening.test.ts src/__tests__/schreibMerzSubmit.test.ts`
- `cd web && npx jest` komplett grün (Baseline: 149 Suites, 1424 Tests)
- `cd web && npx tsc --noEmit -p tsconfig.json` ohne neue Fehler, `npm run lint` ohne neue Fehler in geänderten Dateien

## Done

- Klassen-Token signiert, 14 Tage gültig, Domain-getrennt, Fallback auf IP-Limit bei ungültigem Token
- 25 Briefe pro Klassenlink laufen durch, ohne Token greift das IP-Limit beim 11.
- E-Mail-Limit unverändert
- 429 mit Budget-Backoff nur bei der Brief-Generierung, Wartetext nach 20 s
