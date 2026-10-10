---
quick_id: 261009-urp
mode: quick
---

# Kampagnen-Mail zeigt Briefanzahl ab 25 Briefen

Ziel: Im Kampagnen-Kasten der Brief-Mail steht ab 25 Briefen die Anzahl ("Mit deinem Engagement sind es schon 63 Briefe und es werden immer mehr. Danke dir!"). Darunter bleibt der alte Satz. Keine Success-Page-Änderung (Entscheidung Thomas 2026-10-09: Schwelle 25, nur Mail).

## Task 1: Zahl durchreichen
- files: web/src/app/api/generate-letter/route.ts, web/src/lib/email/sendLetterEmail.ts, web/src/app/api/email-preview/route.ts
- action: route.ts setzt `campaignLetterCount = campaign.letterCount + 1` (Kampagne wird vor `incrementLetterCounters` geladen). `prepareLetterEmail` reicht das Feld wie `letterNumber` in alle Params-Zweige durch. Email-Preview `?campaign=1` zeigt 63.

## Task 2: Copy und Rendering
- files: web/src/lib/email/mailLocale.ts, web/src/lib/email/buildEmailHtml.ts
- action: `campaignCount(count)` für de/en/tr, Zahl lokal formatiert. `CAMPAIGN_COUNT_MIN = 25` in buildEmailHtml.

## Task 3: Test
- files: web/src/__tests__/emailLocalization.test.ts
- verify: `npx jest src/__tests__/emailLocalization.test.ts` (25/1234 sichtbar, 24/undefined nicht, 1.234 formatiert)
