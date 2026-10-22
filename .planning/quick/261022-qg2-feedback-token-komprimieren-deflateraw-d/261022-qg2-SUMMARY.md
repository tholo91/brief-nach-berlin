---
phase: quick-261022-qg2
plan: 01
subsystem: feedback
tags: [token, compression, brevo, zlib]
requires: []
provides:
  - "signFeedbackToken emits z-prefixed deflateRaw tokens; verifyFeedbackToken accepts both z and legacy tokens"
affects: [sendLetterEmail, submitReview, review-improvement-click, feedback page]
tech-stack:
  added: []
  patterns: ["explicit format prefix inside the MAC'd body", "MAC check before inflate, maxOutputLength cap"]
key-files:
  created: [web/src/__tests__/feedbackToken.test.ts]
  modified: [web/src/lib/feedback/token.ts]
key-decisions:
  - "Explicit z prefix instead of sniffing eyJ; legacy bodies always start with e"
status: complete
commits: 2
plan_head_before: 847635c2afec6516922b559a669162bdac034b85
plan_head_after: 87ab6ffb00d1597ba04e0d1a2132cb3cd54bbe7b
actuals:
  tokens: 4500
  tasks: 2
  commits: 2
---

# Phase quick-261022-qg2 Plan 01: Feedback-Token komprimieren Summary

Feedback tokens are now `z` + base64url(deflateRaw level 9) with an unchanged HMAC over the full body; verification still accepts legacy uncompressed tokens, so star links in already-sent mails keep working.

## Commits
- 44072d0 feat: token.ts compresses on sign, inflates (64 KiB cap) on verify, legacy path unchanged; test file with roundtrip, format, legacy
- 87ab6ff test: size guarantee, tamper, malformed, garbage with valid MAC, decompression bomb, expiry, missing iat

(`commits: 2` is measured from the ledger as 3 because the orchestrator's docs commit 69949b5 for quick-qdd landed in between; the plan's own commits are 44072d0 and 87ab6ff.)

## Measured lengths (test fixture with all LetterDebugPayload fields, 36-char UUID, umlauts)
- Legacy token: 1418 chars
- New token: 817 chars (57.6% of legacy)
- `https://brief-nach-berlin.de/feedback?r=5&t=<token>&s=2`: 865 chars (limit asserted: under 1000)

## Verification
- Jest: 6 suites (feedbackToken, dataDeletionToken, rueckmeldungToken, letterSignalToken, debugPayload, reviewCampaignSlug), 47 tests, all green (feedbackToken alone: 9 tests)
- eslint on both touched files: clean
- tsc --noEmit: 0 errors in src; 1 error only in `.next/types/routes.d 2.ts` (iCloud duplicate file in gitignored `.next`, pre-existing, unrelated)
- web/scripts unchanged since 6b894de

## Deviations from Plan
None - plan executed as written.

## Open
- Real Brevo-wrapped link length in a sent production mail is not verifiable locally; needs deploy (push decision with Thomas) and one test letter.

## Known Stubs
None.

## Self-Check: PASSED
