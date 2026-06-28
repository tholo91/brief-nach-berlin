---
status: partial
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
source:
  - 05-VERIFICATION.md
started: 2026-06-28T15:08:44Z
updated: 2026-06-28T15:08:44Z
---

# Phase 05 Human UAT

## Current Test

Awaiting live browser, inbox, moderation, and Supabase verification.

## Tests

### 1. Creator activation flow end to end
expected: Draft is not public before email verification; verification email arrives; opening it activates the campaign; management email arrives with a working access link.
result: [pending]

### 2. Public campaign browser flow
expected: Active `/kampagne/[slug]` renders the campaign page; edited issue text opens `/app` prefilled; issue text is not present in the URL; browser-back draft restore works.
result: [pending]

### 3. Creator management lifecycle
expected: Management link opens the editor; edit publishes to the same public slug; failed moderation preserves old public text; pause/archive remove the public route.
result: [pending]

### 4. Revision history in live Supabase
expected: Create/activate/edit write `campaign_revisions` rows, `last_published_revision_id` points at the latest published snapshot, and history remains after pause/archive.
result: [pending]

### 5. Email client/link-scanner behavior
expected: Verification and management links are usable from the creator inbox and are not burned by previews/scanners before the creator acts.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

None recorded yet.
