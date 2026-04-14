---
phase: "03"
plan: "01"
subsystem: email-delivery
tags: [brevo, email, html-email, dsgvo, typescript]
dependency_graph:
  requires:
    - "02-03: submitWizard and selectPolitician server actions (consume sendLetterEmail in 03-02)"
  provides:
    - "sendLetterEmail: callable Brevo wrapper for transactional email dispatch"
    - "buildEmailHtml: complete HTML email template builder"
  affects:
    - "03-02: wires these modules into server actions"
tech_stack:
  added:
    - "@getbrevo/brevo@^5.0.4 — EU-native transactional email SDK (Brevo / ex-Sendinblue)"
  patterns:
    - "Pure function HTML email builder (no template engine)"
    - "Inline CSS only — Gmail strips style blocks"
    - "Table-based layout — Outlook compatibility"
    - "HTML entity escaping for all user-supplied content (T-03-02)"
    - "encodeURIComponent + 1500-char truncation for URL params (T-03-03)"
key_files:
  created:
    - web/src/lib/email/sendLetterEmail.ts
    - web/src/lib/email/buildEmailHtml.ts
  modified:
    - web/package.json
    - web/package-lock.json
decisions:
  - "Used BrevoClient from @getbrevo/brevo v5 (replaces deprecated sib-api-v3-sdk) — current maintained SDK with full TypeScript support"
  - "buildEmailHtml is a pure function with no external dependencies — easily testable in isolation"
  - "HTML entity escaping applied to all user input before HTML embedding (T-03-02 mitigation)"
  - "Replaced 'Mit KI verbessern' button (D-09) with two share buttons (WhatsApp + X/Twitter) — no clean email-JS mechanism for clipboard, share URLs are standard and reliable"
  - "Airmail stripe uses alternating colored <td> cells (not CSS gradient) — better email client support"
metrics:
  duration_minutes: 20
  completed_date: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
---

# Phase 3 Plan 1: Email Module — Brevo SDK + HTML Template

**One-liner:** Brevo transactional email module with `BrevoClient` wrapper and inline-CSS table-based HTML email template covering all 7 D-08 sections.

## What Was Built

Two standalone, testable modules forming the email delivery foundation for Phase 3:

1. **`sendLetterEmail.ts`** — Brevo SDK client initialization (`BrevoClient`) and the `sendLetterEmail` async function. Accepts recipient email, politician data, letter text, and issue text. Calls `brevo.transactionalEmails.sendTransacEmail` with subject "Dein Brief nach Berlin ist fertig" (D-07). Returns `{ success: boolean, messageId?: string }`. Graceful error handling: logs to console and returns `{ success: false }` on failure without throwing.

2. **`buildEmailHtml.ts`** — Pure function `(SendLetterEmailParams) => string`. Produces a complete HTML email with:
   - Airmail red/white/blue stripe header (alternating `<td>` cells per email client support)
   - "Brief nach Berlin" Georgia serif title in waldgruen
   - Letter block with Courier New/monospace font, `white-space:pre-wrap`, `\n` converted to `<br>` for Outlook
   - Postadresse block with politician full name (title + name) and address split by comma
   - Naechste Schritte section with handwriting recommendation and 5-step numbered mailing instructions
   - Disclaimer with bundestag.de link and datenschutz link
   - Action buttons: "Neuen Brief schreiben" (primary, waldgruen), "Brief nach Berlin teilen" (WhatsApp), "Teilen auf X" (Twitter)
   - Footer with homepage link

## Security Mitigations Applied (Threat Model)

| Threat | Mitigation |
|--------|------------|
| T-03-01 (API key disclosure) | BREVO_API_KEY only in env var, never `NEXT_PUBLIC_` prefixed, server-side only |
| T-03-02 (HTML injection via user input) | `escapeHtml()` applied to all user-supplied fields before HTML embedding |
| T-03-03 (URL param injection/length) | `encodeURIComponent()` + 1500-char truncation on issueText before embedding in ?text= link |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

### Discretionary Decisions (within Claude's Discretion scope per CONTEXT.md)

**1. "Mit KI verbessern" button replaced with WhatsApp + X share buttons**
- **Reason:** The plan's D-09 notes that "Mit KI verbessern" has no clean mechanism without client-side JS in email. The plan explicitly flags this as Claude's discretion.
- **Decision:** Replaced with pre-composed WhatsApp share URL (`wa.me/?text=...`) and Twitter/X intent URL. Both use the same `shareText` string. Consistent with the D-09 note in the plan.

**2. BREVO_SENDER_EMAIL env var added alongside BREVO_API_KEY**
- **Reason:** Allows configuring the sender address without code changes (important for dev vs. prod environments where domain isn't yet verified in Brevo).
- **Impact:** Env var documented in `.env.local` comments only. Falls back to `brief@brief-nach-berlin.de` if not set.

## Known Stubs

None — both modules are fully functional. Note that `sendLetterEmail.ts` requires `BREVO_API_KEY` to be set with a real value in `.env.local` before emails will actually send (documented, placeholder value in env file).

## Self-Check: PASSED

- [x] `web/src/lib/email/sendLetterEmail.ts` exists and exports `sendLetterEmail`
- [x] `web/src/lib/email/buildEmailHtml.ts` exists and exports `buildEmailHtml`
- [x] `web/package.json` contains `@getbrevo/brevo: ^5.0.4`
- [x] TypeScript compiles without errors (`npx tsc --noEmit` clean)
- [x] All 15 content checks pass (DOCTYPE, MSO conditional, Courier New, Postadresse, Naechste Schritte, bundestag.de, datenschutz link, regen link, wa.me, twitter intent, HTML escaping, encodeURIComponent, 1500-char truncation)
- [x] No `BREVO_API_KEY` value committed (`.env.local` is gitignored)
- [x] Task 1 commit: `47b8109`
- [x] Task 2 commit: `88556ce`
