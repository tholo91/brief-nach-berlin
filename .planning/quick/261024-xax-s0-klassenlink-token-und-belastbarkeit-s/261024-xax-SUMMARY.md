---
quick_id: 261024-xax
status: complete
commit: d4bf324
---

# S0 Klassenlink-Token und Belastbarkeit: Summary

## Gebaut

- `web/src/lib/feedback/token.ts`: optionale `macDomain` und `maxAgeSeconds`; ohne Optionen byte-gleich zu vorher.
- `web/src/lib/schule/classToken.ts`: `signClassToken({klasse, plz})`, `verifyClassToken(token)` (14 Tage, Domäne `class-link-v1.`, Klasse 7 bis 13, PLZ fünfstellig, wirft nie, `bucketId` = gesalzener Hash).
- `web/src/lib/rateLimit.ts`: `LETTERS_PER_CLASS` 80/h (zwei Checks pro Brief, also ca. 40 Briefe), `ROUTING_PREFETCH_PER_CLASS` 60/h, Helper `checkOriginRateLimit(kind, ipHash, classBucketId?)`.
- `submitWizardAction`, `/api/generate-letter`, `prefetchRoutingAction(issueText, classToken?)` nutzen den Helper. `WizardData.classToken?` ist neu. E-Mail-Limit 3/24 h unverändert.
- `withMistralRetry(..., { rateLimitBudgetMs })`: 429 wartet `Retry-After` oder zufällig 4 bis 10 s, solange die Summe ins Budget passt, höchstens 6 Versuche. Nur `generateLetter:first` nutzt 20 s. Ohne Option unverändert.
- `Step3Success.tsx`: Nach 20 s Wartezeit auf den Brief steht „Viele schreiben gerade, dein Brief kommt gleich. Bitte lass diese Seite offen.“ Der Timer startet erst mit der Generierung.

## Verifikation

- `cd web && npx jest`: 152 Suites, 1451 Tests grün (vorher 149/1424).
- Neue Tests: `classToken.test.ts` (9), `classRateLimit.test.ts` (inkl. echter Route: 25 Requests mit Klassen-Token ok, ohne Token 429 beim 11.), `mistralRetry.test.ts` (5).
- `npx tsc --noEmit` sauber, `eslint` auf allen geänderten Dateien sauber.
- Klassenlink-URL mit Token: 140 Byte, passt in den QR (Version 10, max. 151 Byte).

## Hinweise

- Bestehende Mocks von `@/lib/rateLimit` in 4 Tests um `checkOriginRateLimit` ergänzt.
- Der Wartetext gilt für alle Nutzer:innen, weil das Backoff für alle gilt.
- Missbrauch: Wer viele Klassenlinks erzeugt, bekommt viele Buckets. Die Erzeugung wird in S3 pro IP begrenzt.
