# Phase 3: Email Delivery & Privacy Compliance - Research

**Researched:** 2026-04-14
**Domain:** Email delivery (Brevo API), HTML email templating, DSGVO compliance, Next.js Server Action patterns
**Confidence:** HIGH

## Summary

Phase 3 wires two distinct workstreams: (1) Brevo email delivery integrated into the existing server actions, and (2) a comprehensive Datenschutzerklaerung rewrite. The technical surface is well-defined -- Brevo's v5 SDK (`@getbrevo/brevo@5.0.4`) provides a clean `BrevoClient` with full TypeScript support and async/await patterns that slot directly into Next.js Server Actions. Next.js 16's stable `after()` API (from `next/server`) enables true fire-and-forget email dispatch: the server action returns `{ success: true }` immediately, while Brevo sends the email in the background.

The HTML email template must use inline CSS exclusively (no `<style>` blocks -- Gmail strips them). Courier Prime will not render in any email client, so the font stack falls back to `'Courier New', Courier, monospace`. The airmail stripe motif can be achieved with simple CSS border/background on a `<td>`. The Datenschutzerklaerung must cover seven processing activities (PLZ, email, Freitext, Sprachaufnahme, Mistral API, OpenAI Moderation, Brevo), each with purpose, legal basis, recipient, retention, and transfer information per DSGVO Art. 13.

**Primary recommendation:** Use `@getbrevo/brevo@5.0.4` with the `BrevoClient` class, wrap email sends in `after()` for non-blocking dispatch, and build the HTML email as a single-file TypeScript function returning an inline-styled HTML string (no external template engine needed).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Brevo (EU-native, formerly Sendinblue). Chosen over Resend for DSGVO reasons -- French company, EU data residency, 300 emails/day free tier.
- **D-02:** Use Brevo API (not SMTP) for Next.js server action integration.
- **D-03:** Email sending is inline and server-side, fire-and-forget. Letter text is never sent back to the browser.
- **D-04:** Both code paths (submitWizard + selectPoliticianAction) must send emails.
- **D-05:** Remove `letterText` state in Step3Success.tsx and forward-contract comment.
- **D-06:** HTML email, branded but lean. Airmail stripe header (CSS-only). Waldgruen accent. Courier Prime (monospace) for letter body.
- **D-07:** Subject: "Dein Brief nach Berlin ist fertig"
- **D-08:** Email sections: Brief block, Postadresse, Naechste Schritte, Disclaimer, Action buttons.
- **D-09:** Footer buttons: "Neu generieren" (with ?text= param), "Mit KI verbessern", "Brief nach Berlin teilen".
- **D-10:** Datenschutz page currently says no data collected -- must be updated.
- **D-11:** Updated Datenschutzerklaerung must cover: PLZ, E-Mail, Anliegen (Freitext), Sprachaufnahme, Mistral API, OpenAI Moderation API, Brevo, Vercel.
- **D-12:** Planner writes Datenschutz copy. Honest and complete, no marketing language.

### Claude's Discretion
- Exact Brevo npm package and client initialization pattern
- Sending email address (brief@brief-nach-berlin.de or similar)
- "Mit KI verbessern" exact mechanism
- "Brief nach Berlin teilen" exact share URL format
- Exact Datenschutzerklaerung text
- Exact handwriting instruction copy
- Error handling if Brevo send fails
- Pre-fill behavior on /app?text=...

### Deferred Ideas (OUT OF SCOPE)
- PDF attachment with formatted letter (MAIL-11 -- v2)
- Edit link in email to reopen and modify (MAIL-10 -- v2)
- Email magic links via temporary tokens
- Analytics or open-rate tracking
- Email marketing / follow-up sequences
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAIL-01 | Generated letter sent to user's email with politician address and mailing instructions | Brevo v5 SDK integration pattern, HTML email template with Brief block + Postadresse + Naechste Schritte sections |
| MAIL-02 | Email includes clear instructions on how to handwrite and mail the letter | Naechste Schritte section in email template with step-by-step mailing instructions |
| MAIL-03 | Email is DSGVO-compliant (minimal data, clear purpose, no marketing) | Brevo EU data residency (France/Germany servers), no tracking, fire-and-forget with no persistent storage |
| PRIV-01 | No persistent storage of user frustration text or generated letters beyond email delivery | `after()` fire-and-forget pattern ensures data exists only during request lifecycle; `letterText` state removed from client |
| PRIV-04 | Datenschutzerklaerung covers PLZ processing, email usage, OpenAI API data processing | Complete Datenschutz rewrite covering all 7 processing activities per DSGVO Art. 13 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @getbrevo/brevo | 5.0.4 | Transactional email delivery via API | Current stable SDK. BrevoClient class with full TypeScript types, async/await, automatic retries. [VERIFIED: npm registry -- v5.0.4 latest, dist-tag `legacy: 3.0.1`] |
| next/server `after()` | built-in (Next.js 16.2) | Fire-and-forget background task after response | Stable since Next.js 15.1. Allows email send to run after server action returns. Supported on Vercel. [VERIFIED: nextjs.org/docs/app/api-reference/functions/after] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | -- | -- | No additional libraries required. HTML email is built as a plain TypeScript function. No template engine. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @getbrevo/brevo v5 | sib-api-v3-sdk v8 | Legacy SDK, deprecated. v5 is the actively maintained replacement. |
| @getbrevo/brevo | Resend | Resend is US-based. Brevo is EU-native (locked decision D-01). |
| @getbrevo/brevo | nodemailer + SMTP | Locked decision D-02: use API, not SMTP. API is cleaner for serverless. |
| Raw HTML string | react-email / mjml | Over-engineering for a single template. react-email adds build complexity. MJML adds a compile step. A single `buildEmailHtml()` function is sufficient and fully transparent. |
| `after()` | Inline await before return | Blocks the server action response. User waits 1-3s longer for Brevo round-trip. |
| `after()` | `waitUntil()` from @vercel/functions | `after()` wraps `waitUntil` internally on Vercel. `after()` is the official Next.js API. |

**Installation:**
```bash
cd web && npm install @getbrevo/brevo
```

**Version verification:**
- `@getbrevo/brevo`: 5.0.4 (latest on npm, published 2025) [VERIFIED: npm registry 2026-04-14]
- `next`: 16.2.3 (already installed, `after()` available) [VERIFIED: web/node_modules/next/package.json]

## Architecture Patterns

### Recommended Project Structure
```
web/src/
  lib/
    email/
      sendLetterEmail.ts   # Brevo client init + sendTransacEmail call
      buildEmailHtml.ts    # Pure function: (data) => HTML string
    actions/
      submitWizard.ts      # Add after() with email send (existing file)
      selectPolitician.ts  # Add after() with email send (existing file)
  components/
    wizard/
      Step3Success.tsx     # Remove letterText state (existing file)
  app/
    app/
      page.tsx             # Add ?text= param reading (existing file)
    datenschutz/
      page.tsx             # Full content rewrite (existing file)
```

### Pattern 1: Brevo Client Initialization
**What:** Single Brevo client instance, initialized from env var
**When to use:** In `sendLetterEmail.ts`, called from server actions
**Example:**
```typescript
// Source: https://developers.brevo.com/docs/api-clients/node-js [VERIFIED]
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendLetterEmail(params: {
  recipientEmail: string;
  politicianName: string;
  politicianTitle: string | null;
  politicianPostalAddress: string;
  letterText: string;
  issueText: string;
}): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Dein Brief nach Berlin ist fertig",
      htmlContent: buildEmailHtml(params),
      sender: { name: "Brief nach Berlin", email: "brief@brief-nach-berlin.de" },
      to: [{ email: params.recipientEmail }],
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[brief-nach-berlin] Brevo send failed:", error);
    return { success: false };
  }
}
```

### Pattern 2: Fire-and-Forget with after()
**What:** Use `after()` to send email without blocking the server action response
**When to use:** In both `submitWizard.ts` and `selectPolitician.ts` after letter generation succeeds
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/after [VERIFIED]
"use server";
import { after } from "next/server";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";

// Inside submitWizardAction, after moderation passes:
after(async () => {
  await sendLetterEmail({
    recipientEmail: data.email,
    politicianName: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
    politicianTitle: result.selectedPolitician.title,
    politicianPostalAddress: result.selectedPolitician.postalAddress,
    letterText: result.letter,
    issueText: data.issueText,
  });
});

// Return immediately -- email sends in background
return {
  success: true,
  politician: result.selectedPolitician,
  politicalLevel: result.politicalLevel,
  // letter field REMOVED per D-05 (no longer sent to client)
};
```

### Pattern 3: WizardActionResult Type Update
**What:** Remove `letter` field from success variant since letter is no longer returned to client
**When to use:** Update `WizardActionResult` type after wiring email
**Example:**
```typescript
// Updated success variant (letter removed per D-03/D-05):
export type WizardActionResult =
  | { success: true; politician: Politician; politicalLevel: PoliticalLevel }
  | { disambiguationNeeded: true; politicians: Politician[] }
  | { error: "moderation_rejected"; message: string }
  // ... rest unchanged
```

### Pattern 4: Pre-fill via URL Query Parameter
**What:** Read `?text=` from URL and pre-fill issueText textarea when user clicks "Neu generieren" from email
**When to use:** In WizardShell.tsx on initial load
**Example:**
```typescript
// WizardShell already uses useSearchParams() and reads PARAM_KEYS
// Add "text" to the PARAM_KEYS array or handle it separately:
const PARAM_KEYS = ["plz", "email", "name", "party", "ngo"] as const;

// In WizardShell initialization:
const textParam = searchParams.get("text");
const [wizardData, setWizardData] = useState<Partial<WizardData>>(() => {
  const data = readParamsToData(searchParams);
  if (textParam) data.issueText = textParam;
  return data;
});
// If textParam exists, start on Step 2 (issue input) with pre-filled text
const [step, setStep] = useState<WizardStep>(() => {
  if (textParam) return 2; // Skip to issue step with pre-filled text
  // ... existing logic
});
```

### Pattern 5: HTML Email Template (Inline CSS)
**What:** Build email HTML as a pure function, all styles inline
**When to use:** In `buildEmailHtml.ts`
**Key rules:**
- ALL CSS must be inline (`style="..."` on every element) -- Gmail strips `<style>` blocks [VERIFIED: multiple sources]
- Use table-based layout for Outlook compatibility [VERIFIED: emailonacid.com, designmodo.com]
- Font stack for letter body: `'Courier New', Courier, monospace` (Courier Prime will NOT load in email clients) [VERIFIED: email clients don't load Google Fonts]
- Max width 600px (standard email width)
- Keep total HTML under 100KB (Gmail clips larger emails) [VERIFIED: textmagic.com]
- No images for the airmail stripe -- use CSS background-color/border on `<td>` elements
- Use `<!--[if mso]>` conditionals for Outlook-specific fixes if needed

### Anti-Patterns to Avoid
- **Returning letter text to client:** D-03 explicitly forbids this. The `letter` field must be removed from the success response.
- **External CSS/`<style>` blocks in email:** Gmail strips them. All styling must be inline.
- **Google Fonts in email:** No email client reliably loads external fonts. Use web-safe fallbacks only.
- **Awaiting email send before returning:** Blocks user response for 1-3 seconds. Use `after()`.
- **Storing letter or user data after send:** PRIV-01 requires no persistence. `after()` scope is ephemeral.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP client / nodemailer | @getbrevo/brevo SDK | Handles retries, error codes, deliverability. Brevo is the locked provider. |
| Email HTML layout | Custom responsive grid | Table-based layout with inline CSS | Email clients don't support flexbox/grid. Tables are the only reliable layout. |
| Background task scheduling | setTimeout / custom queue | `after()` from `next/server` | Built-in Next.js API, works on Vercel, handles serverless lifecycle. |
| DSGVO text | Writing from scratch | Follow Art. 13 checklist (see below) | Standard structure exists. Follow e-recht24.de pattern for KI services. |
| Share URLs | Custom share API | Pre-composed Twitter/WhatsApp URLs | Standard URL schemes: `https://twitter.com/intent/tweet?text=...` and `https://wa.me/?text=...` |

**Key insight:** The email workstream is integration (wiring Brevo into existing server actions) and templating (HTML with inline CSS). No custom infrastructure needed.

## Common Pitfalls

### Pitfall 1: Gmail Clipping
**What goes wrong:** Gmail clips emails larger than 102KB, showing "[Message clipped]" with a "View entire message" link. Users never see the action buttons.
**Why it happens:** Heavy HTML, embedded base64 images, or verbose inline styles.
**How to avoid:** Keep total HTML under 80KB. No images. Minimal inline styles. Test with Litmus or send to personal Gmail.
**Warning signs:** Email template function output exceeds 80KB when measured with `Buffer.byteLength()`.

### Pitfall 2: Outlook Font Rendering
**What goes wrong:** Outlook on Windows ignores font-family declarations and reverts to Times New Roman for the letter body block.
**Why it happens:** Outlook uses Word's rendering engine, which has its own font cascade.
**How to avoid:** Use the MSO conditional: `<!--[if mso]><style>td { font-family: 'Courier New', monospace !important; }</style><![endif]-->`. This is the ONE exception to inline-only CSS -- Outlook processes `<style>` blocks inside MSO conditionals.
**Warning signs:** Letter block looks serif instead of monospace when viewed in Outlook desktop.

### Pitfall 3: URL Length Limit for ?text= Parameter
**What goes wrong:** "Neu generieren" link breaks when issueText exceeds URL limits.
**Why it happens:** Browser URL limits vary: Edge/IE = 2,083 chars, Chrome = 32,779, Safari/Firefox = 64,000+. But email clients may truncate long URLs.
**How to avoid:** URL-encode the issueText. Truncate at 1,500 characters (conservative limit that works everywhere including email clients). Add an ellipsis indicator if truncated. The full domain + path + param overhead is ~60 chars, leaving ~1,440 for encoded text.
**Warning signs:** Issue text longer than ~500 raw characters (URL-encoding can 3x the length for non-ASCII German characters with umlauts).

### Pitfall 4: Brevo Sender Domain Verification
**What goes wrong:** Emails land in spam or Brevo rejects the send because the sender domain isn't verified.
**Why it happens:** Brevo requires domain authentication (SPF, DKIM, DMARC) for custom sender addresses.
**How to avoid:** Before going live: verify `brief-nach-berlin.de` in Brevo dashboard, add DNS records (SPF TXT, DKIM TXT, optional DMARC). Until domain is verified, use Brevo's default sender or a pre-verified domain.
**Warning signs:** Brevo API returns 400 with "sender not found" or emails consistently land in spam.

### Pitfall 5: after() Not Running on Static Pages
**What goes wrong:** `after()` callback never fires.
**Why it happens:** If the route is statically rendered, `after()` runs at build time, not request time. Server Actions are always dynamic, so this shouldn't be an issue for this phase -- but worth knowing.
**How to avoid:** Server Actions are inherently dynamic. The `after()` call inside a Server Action will always run at request time. No action needed.
**Warning signs:** None expected for this use case. [VERIFIED: nextjs.org docs confirm after() is not a Request-time API but server actions are always dynamic]

### Pitfall 6: Brevo Free Tier Daily Limit
**What goes wrong:** After 300 emails in a day, subsequent sends fail.
**Why it happens:** Brevo free plan: 300 emails/day, shared across all email types.
**How to avoid:** For v1 validation, 300/day is sufficient. Log failures so Thomas can monitor. If approaching limit during validation, upgrade to Starter (20 EUR/month, 20,000 emails/month). Add error handling that gracefully fails without crashing the server action.
**Warning signs:** Brevo API returns 429 or quota-exceeded error. Monitor in Brevo dashboard.

## Code Examples

### Complete Email HTML Builder
```typescript
// Source: Composite pattern from multiple verified sources
// buildEmailHtml.ts

interface EmailData {
  letterText: string;
  politicianName: string;
  politicianTitle: string | null;
  politicianPostalAddress: string;
  issueText: string;
}

export function buildEmailHtml(data: EmailData): string {
  const fullName = data.politicianTitle
    ? `${data.politicianTitle} ${data.politicianName}`
    : data.politicianName;

  // URL-encode issueText for "Neu generieren" link, truncate if needed
  const maxTextLength = 1500;
  const truncatedText = data.issueText.length > maxTextLength
    ? data.issueText.slice(0, maxTextLength) + "..."
    : data.issueText;
  const regenerateUrl = `https://brief-nach-berlin.de/app?text=${encodeURIComponent(truncatedText)}`;

  // Share URLs
  const shareText = encodeURIComponent(
    "Ich habe gerade einen Brief an meinen Abgeordneten geschrieben — in unter 3 Minuten. Probier es selbst: https://brief-nach-berlin.de"
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style>td { font-family: 'Courier New', monospace !important; }</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr><td align="center" style="padding:20px 0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

        <!-- Airmail stripe header -->
        <tr>
          <td style="height:8px;background:repeating-linear-gradient(90deg,#C62828 0,#C62828 20px,#ffffff 20px,#ffffff 30px,#1565C0 30px,#1565C0 50px,#ffffff 50px,#ffffff 60px);"></td>
        </tr>

        <!-- Logo / Title -->
        <tr>
          <td style="padding:24px 32px 16px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;">Brief nach Berlin</h1>
          </td>
        </tr>

        <!-- Letter body block -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">
${data.letterText}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Postal address -->
        <tr>
          <td style="padding:0 32px 24px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;">Postadresse</h2>
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.6;color:#4A4A4A;">
              ${fullName}<br>
              ${data.politicianPostalAddress.replace(/,\s*/g, "<br>")}
            </p>
          </td>
        </tr>

        <!-- ... Naechste Schritte, Disclaimer, Action buttons sections ... -->

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
```

### Server Action Wiring with after()
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/after [VERIFIED]
// In submitWizard.ts, after moderation passes and letter is generated:

import { after } from "next/server";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";

// After step 6 (output moderation), before returning:
after(async () => {
  await sendLetterEmail({
    recipientEmail: data.email,
    politicianName: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
    politicianTitle: result.selectedPolitician.title,
    politicianPostalAddress: result.selectedPolitician.postalAddress,
    letterText: result.letter,
    issueText: data.issueText,
  });
});

return {
  success: true,
  politician: result.selectedPolitician,
  politicalLevel: result.politicalLevel,
  // Note: `letter` field removed -- not sent to client (D-03)
};
```

### Pre-fill from URL Param
```typescript
// In WizardShell.tsx -- read ?text= param to pre-fill issue text
const textParam = searchParams.get("text");
// If text param exists AND no step param, jump to step 2 with pre-filled text
// The user already did steps 1/1b in their previous session
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sib-api-v3-sdk (Sendinblue) | @getbrevo/brevo v5 (BrevoClient) | 2024-2025 | Complete API redesign. v3 is tagged `legacy` on npm. v5 uses modern TS patterns. |
| Custom background task (setTimeout) | `after()` from next/server | Next.js 15.1 (late 2024) | Official API for fire-and-forget. Works with Vercel's serverless lifecycle. |
| `<style>` blocks in email | Inline styles only | Always been true, but reinforced 2024-2025 | Gmail, Yahoo, and other clients increasingly strip non-inline CSS. |

**Deprecated/outdated:**
- `sib-api-v3-sdk`: Legacy SDK, marked `legacy` in npm dist-tags. Use `@getbrevo/brevo@5.0.4` instead.
- `unstable_after`: Renamed to `after` in Next.js 15.1. The unstable prefix is gone.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Brevo sender domain `brief-nach-berlin.de` can be verified via DNS records in Brevo dashboard | Architecture Patterns | Medium -- if domain not yet purchased/configured, emails will need a fallback sender. Thomas mentioned domain is available but not necessarily purchased yet. |
| A2 | `after()` works correctly in Server Actions on Vercel Hobby tier | Architecture Patterns | Low -- officially documented and supported, but untested in this specific project. [ASSUMED based on official docs] |
| A3 | Brevo free tier (300 emails/day) is sufficient for v1 validation | Common Pitfalls | Low -- if Brief nach Berlin goes viral, 300/day could be hit. Upgrade path is clear (Starter 20 EUR/month). |
| A4 | `repeating-linear-gradient` for airmail stripe renders in most email clients | Code Examples | Medium -- CSS gradients have limited email client support. May need to fall back to solid color bands (alternating `<td>` elements with red/blue backgrounds). [ASSUMED -- needs testing] |
| A5 | Email clients correctly render `white-space: pre-wrap` on the letter block | Code Examples | Medium -- some older Outlook versions may collapse whitespace. Needs testing. Alternative: convert newlines to `<br>` tags. [ASSUMED] |

## Open Questions

1. **Domain DNS setup**
   - What we know: `brief-nach-berlin.de` was available as of 2026-04-10. Brevo requires SPF/DKIM/DMARC records.
   - What's unclear: Has Thomas purchased the domain? Is DNS access available?
   - Recommendation: Use a temporary Brevo-verified sender (e.g., Thomas's personal email or Brevo default) for development/testing. Add domain verification as a deployment prerequisite, not a code blocker.

2. **"Mit KI verbessern" button mechanism**
   - What we know: D-09 mentions this button but notes it's planner's discretion. No client-side JS in email.
   - What's unclear: Best mechanism without JS.
   - Recommendation: Use a `mailto:` link with pre-filled subject and body containing the letter text. Example: `mailto:?subject=Brief%20verbessern&body=[letter text]`. This opens the user's email client with the letter pasted, and they can forward it to ChatGPT or any AI. Alternatively, simply link to `https://brief-nach-berlin.de/app?text=[issueText]` (same as "Neu generieren") -- the user gets a fresh generation which may differ. Planner should pick simplest option.

3. **Airmail stripe rendering**
   - What we know: CSS gradients have poor email client support (especially Outlook).
   - Recommendation: Replace `repeating-linear-gradient` with a simple table row of alternating red/white/blue `<td>` cells. More reliable, looks the same.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| @getbrevo/brevo | Email delivery | Not yet installed | 5.0.4 (to install) | -- |
| BREVO_API_KEY env var | Email delivery | Not yet set | -- | Must be obtained from Brevo dashboard |
| DNS access for brief-nach-berlin.de | Sender domain verification | Unknown | -- | Use personal email as sender during dev |
| Next.js after() | Background email send | Available (built-in) | 16.2.3 | -- |
| Brevo account | Email delivery | Unknown | Free tier | Must create account at brevo.com |

**Missing dependencies with no fallback:**
- BREVO_API_KEY: Must be obtained from Brevo dashboard. Blocks email functionality.
- Brevo account: Must be created. Free tier is sufficient.

**Missing dependencies with fallback:**
- Domain DNS verification: Can use fallback sender email during development.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in v1 |
| V3 Session Management | No | No sessions in v1 |
| V4 Access Control | No | No protected resources |
| V5 Input Validation | Yes | Zod validation on email field (already in Phase 2 schemas); URL-encode issueText for ?text= param to prevent XSS |
| V6 Cryptography | No | No encryption needed (Brevo handles TLS for email delivery) |
| V8 Data Protection | Yes | No persistent storage of user data (PRIV-01). Letter text never returned to client (D-03). |
| V13 API Security | Yes | Brevo API key stored as env var, never exposed to client. Rate limiting via Brevo's built-in limits. |
| V14 Configuration | Yes | BREVO_API_KEY in env vars only, not in code. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure in client bundle | Information Disclosure | Server-side only: Brevo client instantiated in server action, env var prefixed without NEXT_PUBLIC_ |
| Email injection via recipient field | Tampering | Zod email validation (already exists in Phase 2 step1Schema) |
| XSS via ?text= URL param | Tampering | URL-decode then sanitize/escape before rendering in textarea. React's JSX auto-escapes. |
| Spam abuse (automated letter generation) | Denial of Service | Brevo's 300/day limit acts as natural rate limit. OpenAI moderation catches abusive content. |
| Letter text in email logs | Information Disclosure | Brevo retains transactional email logs for 24 months by default. Acceptable for v1 (Brevo is a locked provider with GDPR compliance). |

## DSGVO Datenschutzerklaerung Structure

Based on research of DSGVO Art. 13 requirements and e-recht24.de/datenschutz-generator.de guidance for KI-based web services, the Datenschutzerklaerung must include these sections. [CITED: e-recht24.de/dsg/13449, datenschutz-generator.de/ki-datenschutz]

### Required Sections

1. **Verantwortlicher** (Art. 13 Abs. 1 lit. a) -- already exists, keep as-is
2. **Allgemeines zur Datenverarbeitung** -- rewrite to reflect actual processing
3. **Hosting (Vercel)** -- already exists, keep/update
4. **Verarbeitung von Postleitzahlen** -- PLZ entered, used for Wahlkreis lookup, not stored
5. **Verarbeitung der E-Mail-Adresse** -- entered, used solely for letter delivery via Brevo, not stored server-side
6. **Verarbeitung des Anliegens (Freitext/Spracheingabe)** -- entered/recorded, sent to Mistral for letter generation, not stored
7. **KI-gestuetzte Briefgenerierung (Mistral AI)** -- EU-hosted, French company, Art. 6 Abs. 1 lit. b (Vertragserfuellung/Nutzungsanfrage)
8. **Inhaltspruefung (OpenAI Moderation API)** -- US-hosted, text sent for safety check, Standardvertragsklauseln (SCCs), DPA available
9. **E-Mail-Versand (Brevo)** -- EU-hosted (France/Germany), email + letter content for dispatch only
10. **Ihre Rechte** -- already exists, keep as-is
11. **Streitschlichtung** -- already exists, keep as-is
12. **KI-generierte Inhalte und Disclaimer** -- already exists, keep/update

### Per-Service Disclosure Pattern (Art. 13)
For each third-party service (Mistral, OpenAI, Brevo), include:
- **Zweck** (purpose)
- **Rechtsgrundlage** (legal basis -- Art. 6 Abs. 1 lit. b or f DSGVO)
- **Verarbeitete Daten** (which data categories)
- **Empfaenger** (company name, country)
- **Drittlandtransfer** (if non-EU: legal basis for transfer -- SCCs, adequacy decision)
- **Speicherdauer** (retention -- "keine Speicherung nach Versand" for most)
- **Auftragsverarbeitung** (note existence of DPA/AVV)

### Key Legal Facts for Datenschutz Text
| Service | Headquartered | Servers | DPA Available | Transfer Basis |
|---------|---------------|---------|---------------|----------------|
| Mistral AI | Paris, France | EU | Yes (legal.mistral.ai/terms/data-processing-addendum) | Not needed (EU-to-EU) |
| OpenAI (Moderation) | San Francisco, USA | USA (with EU residency option) | Yes (openai.com/policies/data-processing-addendum) | EU Standard Contractual Clauses (SCCs) |
| Brevo | Paris, France | EU (OVH France/Germany) | Yes (available in dashboard) | Not needed (EU-to-EU) |
| Vercel | San Francisco, USA | Edge, some EU | Yes | SCCs / DPF certification |

[VERIFIED: Brevo servers in EU via OVH France/Germany -- help.brevo.com/data-storage-location]
[VERIFIED: Mistral DPA at legal.mistral.ai/terms/data-processing-addendum]
[VERIFIED: OpenAI DPA at openai.com/policies/data-processing-addendum]
[ASSUMED: Vercel DPF certification and SCC availability -- not independently verified in this session]

## Sources

### Primary (HIGH confidence)
- [npm registry: @getbrevo/brevo@5.0.4](https://www.npmjs.com/package/@getbrevo/brevo) -- version, dist-tags verified via `npm view`
- [Next.js after() docs](https://nextjs.org/docs/app/api-reference/functions/after) -- stable API, usable in Server Actions, Next.js 16.2.3
- [Brevo Node.js SDK docs](https://developers.brevo.com/docs/api-clients/node-js) -- BrevoClient initialization, sendTransacEmail API
- [Brevo Send Transactional Email API](https://developers.brevo.com/reference/send-transac-email) -- required/optional fields, response structure
- [Brevo data storage location](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location) -- EU servers (OVH France/Germany)
- [Mistral DPA](https://legal.mistral.ai/terms/data-processing-addendum) -- EU data processing, French company
- [OpenAI DPA](https://openai.com/policies/data-processing-addendum) -- SCCs for EU transfers

### Secondary (MEDIUM confidence)
- [e-recht24.de: KI Datenschutzerklaerung](https://www.e-recht24.de/dsg/13449-einsatz-von-kuenstlicher-intelligenz-auf-der-website.html) -- DSGVO Art. 13 requirements for KI services
- [datenschutz-generator.de: KI Datenschutz](https://datenschutz-generator.de/ki-datenschutz/) -- Checklist for KI DSGVO compliance
- [designmodo.com: HTML CSS in Emails 2026](https://designmodo.com/html-css-emails/) -- Email client CSS support
- [emailonacid.com: Email Safe Fonts](https://www.emailonacid.com/blog/article/email-development/best-font-for-email-everything-you-need-to-know-about-email-safe-fonts/) -- Font stacks, Courier New as safe monospace
- [Brevo free plan limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan) -- 300 emails/day
- [Brevo Wikipedia](https://en.wikipedia.org/wiki/Brevo) -- Founded 2012 Paris, formerly Sendinblue

### Tertiary (LOW confidence)
- [URL length limits](https://www.geeksforgeeks.org/computer-networks/maximum-length-of-a-url-in-different-browsers/) -- Browser limits vary; 2,083 chars is conservative cross-browser minimum

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Brevo v5 SDK verified on npm, after() verified in Next.js docs, both have official documentation with code examples
- Architecture: HIGH -- Patterns follow official docs and locked decisions. Server action wiring is straightforward.
- Pitfalls: MEDIUM -- Email rendering quirks (Outlook font, Gmail clipping) are well-documented but not tested against this specific template
- DSGVO compliance: MEDIUM -- Legal structure follows e-recht24/datenschutz-generator patterns, but not lawyer-reviewed. Sufficient for v1 validation.

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (30 days -- stable domain, no fast-moving dependencies)
