---
quick_id: 260707-vrt
status: passed
date: "2026-07-07"
commit: 2e6cc60
---

# Verification: No-Storage-Flow zum Anpassen bestehender Briefentwürfe

## Must-Haves

| Requirement | Status | Evidence |
|---|---|---|
| Mail-Template enthält CTA "Brief anpassen" | Passed | `buildEmailHtml.ts`, `emailVariantCta.test.ts` |
| CTA-Link übergibt nur E-Mail im URL-Hash | Passed | `variantUrl = /brief/anpassen#email=...`, Test prüft keinen `briefText`/`letterText` Parameter |
| `/brief/anpassen` zeigt E-Mail, Brieftext, Tonalität und Änderungswunsch | Passed | `VariantForm.tsx` |
| Submit validiert E-Mail und Mindestlänge | Passed | `letterVariantSchema`, Client-Validation, Mindestlänge 500 Zeichen |
| Prompt behandelt Input als bestehenden Brief | Passed | `VARIANT_SYSTEM_PROMPT`, `generateLetterVariantPrompt.test.ts` |
| Fakten, Empfänger, Forderung, Grußformel bleiben erhalten | Passed | Prompt-Regeln explizit, Test deckt Regelanker ab |
| Versand nutzt Brevo-Tag `brief_variant` | Passed | `sendVariantEmail.ts` |
| Public Counter bleibt unverändert | Passed | Neuer API-Pfad importiert `incrementLetterCounters` nicht |
| Eigene Success-Seite | Passed | `/brief/anpassen/erfolg`, Build-Route vorhanden |

## Commands

```bash
npm test -- --runInBand src/__tests__/generateLetterVariantPrompt.test.ts src/__tests__/emailVariantCta.test.ts
npx eslint 'src/app/(site)/brief/anpassen/page.tsx' 'src/app/(site)/brief/anpassen/VariantForm.tsx' 'src/app/(site)/brief/anpassen/erfolg/page.tsx' src/app/api/generate-letter-variant/route.ts src/lib/generation/generateLetterVariant.ts src/lib/email/buildVariantEmailHtml.ts src/lib/email/sendVariantEmail.ts src/lib/validation/wizardSchemas.ts src/lib/rateLimit.ts src/lib/email/buildEmailHtml.ts src/__tests__/generateLetterVariantPrompt.test.ts src/__tests__/emailVariantCta.test.ts
npm run build
```

## Result

Passed. Der Flow ist buildbar, die neuen Tests laufen grün, und die neuen Seiten
liefern lokal `200 OK`.
