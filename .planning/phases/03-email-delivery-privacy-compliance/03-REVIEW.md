---
phase: 03-email-delivery-privacy-compliance
reviewed: 2026-04-14T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - web/src/app/datenschutz/page.tsx
  - web/src/components/wizard/Step3Success.tsx
  - web/src/components/wizard/WizardShell.tsx
  - web/src/lib/actions/selectPolitician.ts
  - web/src/lib/actions/submitWizard.ts
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/lib/email/sendLetterEmail.ts
  - web/src/lib/types/wizard.ts
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-14
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This phase introduces email delivery via Brevo, the wizard disambiguation flow, and the Datenschutz page. The core email pipeline is structurally sound: HTML escaping is applied consistently before injection into the template, Zod validation runs server-side before any AI calls, and the fire-and-forget `after()` pattern is correctly used for non-blocking email dispatch.

Three warnings stand out: the email address is stored in URL query parameters (browser history / server log exposure, a real DSGVO concern), the second server action `selectPoliticianAction` skips re-validation of user-supplied data, and the Brevo API key uses a non-null assertion that silently degrades into a confusing runtime error when the env var is absent. Three info items cover a rendering inconsistency in the email template, an inaccurate data processor disclosure in the Datenschutzerklaerung, and German umlaut missing from an error string.

No critical security vulnerabilities were found. The HTML email builder correctly escapes all user-controlled content before interpolation.

---

## Warnings

### WR-01: Email address stored in URL query parameters

**File:** `web/src/components/wizard/WizardShell.tsx:15`
**Issue:** `PARAM_KEYS` includes `"email"`, which means the user's email address is written into the browser URL via `router.replace()` in the `useEffect` on line 77-81. Email addresses in URLs are stored in browser history, may appear in Vercel access logs, and could be leaked via the `Referer` header if the user navigates to an external link. The Datenschutzerklaerung states "keine Nutzerdaten dauerhaft auf unseren Servern" — Vercel logs undermine this claim in practice.
**Fix:** Remove `"email"` from `PARAM_KEYS`. Keep email in React state only, never in the URL. If URL-persistence is needed for the PLZ only, keep `"plz"` but drop the other fields that qualify as personal data:
```typescript
const PARAM_KEYS = ["plz"] as const;
```
The email, name, party, and ngo fields should persist in React state only.

---

### WR-02: `selectPoliticianAction` sends email without re-validating user-supplied input

**File:** `web/src/lib/actions/selectPolitician.ts:10-68`
**Issue:** This server action receives `data: WizardData` from the client. The client sends this data after the disambiguation step, where the user could theoretically tamper with `data.email` or `data.issueText` between the initial `submitWizardAction` call and the disambiguation confirm. The action validates only that the selected politician ID matches the list, but never re-validates or re-moderates `data.issueText` — a user who bypasses the first moderation check (e.g., via race condition or direct API call) can reach `generateLetter` and `sendLetterEmail` with unmoderated content.
**Fix:** Add the same validation and moderation guards that `submitWizardAction` uses:
```typescript
// At the top of selectPoliticianAction, before generateLetter:
const step1Result = step1Schema.safeParse({ plz: data.plz, email: data.email });
if (!step1Result.success) {
  return { error: "server_error", message: "Ungültige Eingabe." };
}
const step2Result = step2Schema.safeParse({ issueText: data.issueText });
if (!step2Result.success) {
  return { error: "server_error", message: "Bitte beschreibe dein Anliegen." };
}
const inputModeration = await moderateText(data.issueText);
if (inputModeration.flagged) {
  return {
    error: "moderation_rejected",
    message: "Wir können dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich.",
  };
}
```

---

### WR-03: Brevo API key non-null assertion fails silently at module init

**File:** `web/src/lib/email/sendLetterEmail.ts:4-6`
**Issue:** `new BrevoClient({ apiKey: process.env.BREVO_API_KEY! })` is called at module load time (outside any function). The `!` non-null assertion tells TypeScript the value is defined, but if `BREVO_API_KEY` is missing from the environment, `process.env.BREVO_API_KEY` evaluates to `undefined` at runtime. `BrevoClient` will store `undefined` coerced to the string `"undefined"` as the API key. The error surfaces only when `sendTransacEmail` is called inside `after()`, where it is caught and logged — meaning emails silently fail with a misleading auth error rather than a clear startup failure.
**Fix:** Validate the env var at startup with an explicit check:
```typescript
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  throw new Error("[brief-nach-berlin] BREVO_API_KEY environment variable is not set");
}
const brevo = new BrevoClient({ apiKey });
```

---

## Info

### IN-01: `white-space:pre-wrap` and `<br>` tags applied simultaneously to letter text

**File:** `web/src/lib/email/buildEmailHtml.ts:88`
**Issue:** The `<p>` element that displays the letter uses `style="white-space:pre-wrap"` while `letterHtml` is produced by `nlToBr()`, which converts `\n` to `<br>`. Under `pre-wrap`, raw newlines render as line breaks — so the `<br>` tags are redundant and will cause double spacing in email clients that honor `pre-wrap` (most modern webmail clients). Outlook ignores `pre-wrap` and relies on `<br>`, so the current code happens to work everywhere but for the wrong reason.
**Fix:** Pick one approach and be explicit. The safer cross-client choice is `<br>` only, without `pre-wrap`:
```html
<p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;">${letterHtml}</p>
```

---

### IN-02: Datenschutzerklaerung discloses Mistral Voxtral for audio transcription, but stack specifies OpenAI Whisper

**File:** `web/src/app/datenschutz/page.tsx:138-143`
**Issue:** Section 6 of the Datenschutzerklaerung states: "Wenn Sie die Spracheingabe nutzen, wird Ihre Audioaufnahme an die Mistral Voxtral API zur Transkription übermittelt." The project CLAUDE.md and technology stack documentation specify OpenAI Whisper API as the audio transcription provider, not Mistral Voxtral. If the implementation actually uses OpenAI Whisper, this disclosure names the wrong data processor — a DSGVO Art. 13 compliance issue (processor must be correctly identified).
**Fix:** Verify which transcription API is actually used in the implementation. If it is OpenAI Whisper, update Section 6 to reference OpenAI (already disclosed as a processor in Section 9) and remove the Mistral Voxtral reference. If Voxtral is actually used, update Section 8 to clarify Mistral processes both letter generation and audio transcription, and ensure the Mistral AVV covers both use cases.

---

### IN-03: Validation error message missing German umlaut character

**File:** `web/src/lib/actions/submitWizard.ts:25`
**Issue:** The error message `"Ungueltige Eingabe."` uses the ASCII transliteration `ue` instead of the proper German umlaut `ü`. The rest of the codebase uses proper German characters throughout (including this file, e.g. "Fuer" on line 49-50 also has this issue). This will appear wrong to German-speaking users.
**Fix:**
```typescript
return { error: "server_error", message: "Ungültige Eingabe." };
// and on line 49-50:
message: "Für diese Postleitzahl haben wir keine Daten. Bitte prüfe deine Eingabe.",
```

---

_Reviewed: 2026-04-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
