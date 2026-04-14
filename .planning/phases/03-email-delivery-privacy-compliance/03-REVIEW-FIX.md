---
phase: 03-email-delivery-privacy-compliance
fixed_at: 2026-04-14T00:00:00Z
review_path: .planning/phases/03-email-delivery-privacy-compliance/03-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-14
**Source review:** .planning/phases/03-email-delivery-privacy-compliance/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### WR-01: Email address stored in URL query parameters

**Files modified:** `web/src/components/wizard/WizardShell.tsx`
**Commit:** b02c99e
**Applied fix:** Reduced `PARAM_KEYS` from `["plz", "email", "name", "party", "ngo"]` to `["plz"]` only. Email and other personal data fields now persist in React state only and are never written to the browser URL, preventing exposure via browser history, server logs, and Referer headers.

### WR-02: `selectPoliticianAction` sends email without re-validating user-supplied input

**Files modified:** `web/src/lib/actions/selectPolitician.ts`
**Commit:** a9d8293
**Applied fix:** Added `step1Schema` and `step2Schema` Zod validation and `moderateText()` input moderation at the top of `selectPoliticianAction`, before `generateLetter` is called. This mirrors the same validation and moderation guards already present in `submitWizardAction`, closing the bypass path for tampered data arriving via the disambiguation flow.

### WR-03: Brevo API key non-null assertion fails silently at module init

**Files modified:** `web/src/lib/email/sendLetterEmail.ts`
**Commit:** 78f33b5
**Applied fix:** Replaced `process.env.BREVO_API_KEY!` non-null assertion with an explicit runtime check that throws a descriptive error (`"[brief-nach-berlin] BREVO_API_KEY environment variable is not set"`) at module load time if the env var is missing, instead of silently passing `undefined` to the Brevo client.

---

_Fixed: 2026-04-14_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
