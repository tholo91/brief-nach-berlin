---
phase: 03-email-delivery-privacy-compliance
verified: 2026-04-14T00:00:00Z
status: gaps_found
score: 7/8 must-haves verified
overrides_applied: 0
gaps:
  - truth: "The /app route reads a ?text= query param and pre-fills the issue textarea"
    status: failed
    reason: "WizardShell reads ?text= into wizardData.issueText and jumps to step 2 correctly, but Step2Issue component has no defaultValue/initialValue prop — it initializes with useState('') and ignores wizardData.issueText entirely. The textarea is always empty on load regardless of the URL param."
    artifacts:
      - path: "web/src/components/wizard/Step2Issue.tsx"
        issue: "No defaultValue or initialValue prop. Line 19: const [issueText, setIssueText] = useState(''). Props interface has no issueText prop."
      - path: "web/src/components/wizard/WizardShell.tsx"
        issue: "Step2Issue rendered at line 225-230 with no issueText/defaultValue prop passed, even though wizardData.issueText holds the ?text= value."
    missing:
      - "Add defaultValue prop to Step2Issue component props interface"
      - "Initialize useState with defaultValue: const [issueText, setIssueText] = useState(defaultValue ?? '')"
      - "Pass wizardData.issueText as defaultValue when rendering Step2Issue in WizardShell"
---

# Phase 3: Email Delivery & Privacy Compliance — Verification Report

**Phase Goal:** The generated letter is delivered to the user's inbox with mailing instructions, and the product is fully DSGVO-compliant and safe for public launch
**Verified:** 2026-04-14
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | User receives the generated letter by email, including the politician's full postal address and clear instructions for handwriting and mailing | VERIFIED | sendLetterEmail.ts calls Brevo API; buildEmailHtml.ts includes Postadresse block and Naechste Schritte section with 5 numbered steps; both server actions (submitWizard + selectPolitician) call sendLetterEmail via after() |
| 2 | No user frustration text or generated letter is stored after the email is sent | VERIFIED | WizardActionResult success variant has no letter field (wizard.ts line 29); letter only exists inside after() callback scope in server actions; Step3Success has zero letterText references |
| 3 | The Datenschutzerklaerung accurately covers PLZ processing, email usage, and OpenAI API data handling | VERIFIED | datenschutz/page.tsx has 13 sections; Section 4 covers PLZ, Section 5 covers E-Mail-Adresse, Section 9 covers OpenAI Moderation API with SCCs basis, Sections 8 and 10 cover Mistral and Brevo; old false "keine personenbezogenen Daten" claim removed |
| 4 | sendLetterEmail accepts recipient email, politician data, letter text, and issue text | VERIFIED | SendLetterEmailParams interface defined; all fields present and used |
| 5 | Email is sent fire-and-forget via after() on both generation paths | VERIFIED | submitWizard.ts line 80 and selectPolitician.ts line 43 both use after(async () => { await sendLetterEmail(...) }) |
| 6 | No letter text is ever sent from server to browser | VERIFIED | TypeScript type system enforces this — WizardActionResult success variant is { success: true; politician: Politician; politicalLevel: PoliticalLevel } with no letter field |
| 7 | letterText state fully removed from Step3Success | VERIFIED | grep count = 0 for both "letterText" and "result.letter" in Step3Success.tsx |
| 8 | The /app route reads a ?text= query param and pre-fills the issue textarea | FAILED | WizardShell reads textParam into wizardData.issueText and jumps to step 2, but Step2Issue has no defaultValue prop and ignores wizardData.issueText |

**Score:** 7/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `web/src/lib/email/sendLetterEmail.ts` | Brevo client initialization and sendLetterEmail function | VERIFIED | Exports sendLetterEmail; uses BrevoClient; correct subject "Dein Brief nach Berlin ist fertig"; graceful error handling |
| `web/src/lib/email/buildEmailHtml.ts` | Pure function that builds complete HTML email string | VERIFIED | All 7 sections present; MSO conditional for Outlook; inline CSS throughout; Courier New font; HTML entity escaping; encodeURIComponent + 1500-char truncation |
| `web/src/lib/actions/submitWizard.ts` | Server action with after() email dispatch | VERIFIED | Contains import { after } from "next/server", import { sendLetterEmail }, and after(async () => block |
| `web/src/lib/actions/selectPolitician.ts` | Disambiguation server action with after() email dispatch | VERIFIED | Same pattern as submitWizard; after(async () => block present |
| `web/src/lib/types/wizard.ts` | Updated WizardActionResult without letter field on success | VERIFIED | Line 29: { success: true; politician: Politician; politicalLevel: PoliticalLevel } |
| `web/src/components/wizard/Step3Success.tsx` | Success UI without letterText state | VERIFIED | Zero occurrences of letterText or result.letter |
| `web/src/components/wizard/WizardShell.tsx` | Wizard with ?text= param pre-fill support | PARTIAL | Reads searchParams.get("text") and jumps to step 2, but does NOT pass value to Step2Issue textarea |
| `web/src/app/datenschutz/page.tsx` | Complete, accurate DSGVO-compliant Datenschutzerklaerung | VERIFIED | 13 sections; Mistral x6, OpenAI x4, Brevo x8, Postleitzahl x5, E-Mail x10; legal.mistral.ai and openai.com DPA links present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| sendLetterEmail.ts | @getbrevo/brevo | BrevoClient import and API call | WIRED | Line 1: import { BrevoClient }; line 21: brevo.transactionalEmails.sendTransacEmail |
| sendLetterEmail.ts | buildEmailHtml.ts | import buildEmailHtml | WIRED | Line 2: import { buildEmailHtml } from "./buildEmailHtml" |
| submitWizard.ts | sendLetterEmail.ts | import sendLetterEmail, called inside after() | WIRED | Line 9 import; line 80-89 after() block |
| selectPolitician.ts | sendLetterEmail.ts | import sendLetterEmail, called inside after() | WIRED | Line 8 import; line 43-51 after() block |
| WizardShell.tsx | useSearchParams | searchParams.get('text') for pre-fill | PARTIAL | Line 56: searchParams.get("text") reads the param and stores in wizardData, but never passes to Step2Issue |
| datenschutz/page.tsx | landing page footer | Link component href=/datenschutz | WIRED | Footer.tsx confirmed: href="/datenschutz" |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| sendLetterEmail.ts | htmlContent | buildEmailHtml(params) | Yes — pure function producing full HTML from caller-supplied params | FLOWING |
| buildEmailHtml.ts | letterHtml, fullName, addressLines | params (letterText, politicianName, politicianTitle, politicianPostalAddress) | Yes — real letter data from server action | FLOWING |
| submitWizard.ts after() | sendLetterEmail params | result.letter (from generateLetter), data.email, result.selectedPolitician | Yes — real generated letter and politician data | FLOWING |
| Step2Issue textarea | issueText | useState("") — NOT from wizardData.issueText | No real data when entering via ?text= URL param | HOLLOW_PROP — wizardData.issueText populated but never passed to component |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles without errors | cd web && npx tsc --noEmit | Exit 0 — no errors | PASS |
| @getbrevo/brevo installed | cat web/package.json | "@getbrevo/brevo": "^5.0.4" | PASS |
| letterText absent from Step3Success | grep -c "letterText" Step3Success.tsx | 0 | PASS |
| result.letter absent from Step3Success | grep -c "result.letter" Step3Success.tsx | 0 | PASS |
| Old false Datenschutz claim removed | grep -c "erhebt und verarbeitet derzeit keine personenbezogenen Daten" | 0 | PASS |
| BREVO_API_KEY documented (not a real value) | grep BREVO web/.env.local | BREVO_API_KEY=your-brevo-api-key-here | PASS |
| ?text= pre-fills textarea | Step2Issue has no defaultValue prop | useState("") ignores wizardData.issueText | FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| MAIL-01 | 03-01, 03-02 | Generated letter sent to user's email with politician address and mailing instructions | SATISFIED | sendLetterEmail.ts + buildEmailHtml.ts wired via after() in both server actions; email includes Postadresse and Naechste Schritte |
| MAIL-02 | 03-01 | Email includes clear instructions on handwriting and mailing | SATISFIED | buildEmailHtml.ts Naechste Schritte section: 5 numbered steps, "Empfehlung: Brief von Hand abschreiben" with reasoning |
| MAIL-03 | 03-01, 03-02 | Email is DSGVO-compliant: minimal data, clear purpose, no marketing | SATISFIED | Email sends only necessary data (email + letter + politician postal address); no tracking pixels; purpose clear; fire-and-forget with no persistence |
| PRIV-01 | 03-02 | No persistent storage of user frustration text or generated letters beyond email delivery | SATISFIED | letter field removed from WizardActionResult at type level; only exists inside after() callback scope; no database writes anywhere |
| PRIV-04 | 03-03 | Datenschutzerklaerung covers PLZ processing, email usage, OpenAI API data handling | SATISFIED | datenschutz/page.tsx Sections 4 (PLZ), 5 (E-Mail), 9 (OpenAI Moderation API) all present with Zweck, Rechtsgrundlage, Empfaenger, Speicherdauer |

All 5 phase requirements are satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|---------|--------|
| WizardShell.tsx | 56-59 | wizardData.issueText populated from ?text= param but never passed to Step2Issue | Blocker | "Neuen Brief schreiben" email magic link navigates to step 2 with empty textarea — the whole re-generation flow is broken for email recipients |

No TODOs, FIXMEs, or placeholder comments found in any phase 3 files.

### Human Verification Required

#### 1. Email Delivery End-to-End

**Test:** Set a real BREVO_API_KEY in .env.local, complete the wizard with a valid PLZ and email address, and verify the email arrives.
**Expected:** Email arrives with subject "Dein Brief nach Berlin ist fertig", contains the letter block in Courier New, shows the politician's postal address, and has the 5-step mailing instructions.
**Why human:** Cannot test Brevo delivery without a live API key and real email send. The after() fire-and-forget pattern means server-side failures are silent to the user.

#### 2. Airmail Stripe Visual Rendering

**Test:** Render the generated email HTML in a real email client (Gmail, Outlook, Apple Mail).
**Expected:** Red/white/blue alternating stripe header appears correctly at the top of the email.
**Why human:** Email client rendering differences cannot be verified programmatically.

### Gaps Summary

One gap blocking the "Neuen Brief schreiben" magic link feature:

**Gap: ?text= URL param does not actually pre-fill the Step2Issue textarea**

The plan specifies (03-02 Plan, Task 2, Step 2) that `WizardShell.tsx` should read `searchParams.get("text")` and pre-fill `issueText`. The WizardShell was updated to read the param and store it in `wizardData.issueText`, and to jump to step 2. However, `Step2Issue` component has no `defaultValue` prop and manages its own state with `useState("")`. The populated `wizardData.issueText` is never passed into the component.

Fix: Add `defaultValue?: string` prop to `Step2IssueProps`, change `useState("")` to `useState(defaultValue ?? "")`, and pass `wizardData.issueText` to `Step2Issue` in `WizardShell`.

This does not affect the core email delivery (MAIL-01, MAIL-02, MAIL-03, PRIV-01, PRIV-04 are all satisfied). It only affects the email action button "Neuen Brief schreiben" — users clicking that link will land on step 2 but will need to type their issue again.

---

_Verified: 2026-04-14_
_Verifier: Claude (gsd-verifier)_
