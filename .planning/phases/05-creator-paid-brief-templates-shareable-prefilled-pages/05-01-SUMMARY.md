---
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
plan: 01
subsystem: database
tags: [supabase, postgres, rls, campaigns, tokens, nextjs]

requires:
  - phase: 03-email-delivery-privacy-compliance
    provides: service-role-only Supabase write pattern and privacy constraints
provides:
  - Supabase campaign tables with restrictive RLS
  - Typed campaign repository and status machine
  - Revocable creator tokens and HttpOnly management session helpers
affects: [phase-05-campaign-creation, phase-05-public-campaign-pages, phase-05-creator-management]

tech-stack:
  added: []
  patterns:
    - service-role-only campaign persistence
    - immutable campaign revision snapshots
    - hashed one-time creator tokens

key-files:
  created:
    - web/supabase/migrations/008_campaigns.sql
    - web/src/lib/campaigns/schema.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/campaigns/tokens.ts
    - web/src/lib/campaigns/session.ts
  modified: []

key-decisions:
  - "Campaign access uses random DB-backed token hashes, not stateless feedback HMAC links."
  - "markPaid currently advances draft campaigns to awaiting_email_verification without adding payment columns because Stripe/payment is deferred."
  - "Management sessions are short-lived HttpOnly cookies signed server-side and scoped to /kampagne."

patterns-established:
  - "Campaign repository owns lifecycle transitions so future actions do not hand-roll status strings."
  - "Published campaign text is snapshotted to campaign_revisions before public activation/update references move."
  - "Creator email-link tokens are single-use and revocable via used_at."

requirements-completed: [ENGM-03, PRIV-01, SAFE-03]

duration: 9min
completed: 2026-06-28
---

# Phase 5 Plan 1: Campaign Backend Foundation Summary

**Supabase-backed campaign records with immutable revision snapshots, restrictive RLS, typed lifecycle helpers, and revocable creator access tokens**

## Performance

- **Duration:** 9 min
- **Started:** 2026-06-28T14:10:47Z
- **Completed:** 2026-06-28T14:19:31Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added `campaigns`, `campaign_revisions`, and `campaign_tokens` with restrictive RLS and revoked anon/authenticated access.
- Added typed campaign schema helpers, slug normalization, repository reads/writes, status transitions, moderation updates, and revision snapshots.
- Added random SHA-256-hashed one-time creator tokens plus short-lived HttpOnly management session helpers.
- Preserved the privacy boundary: no visitor-generated letters or visitor-edited issue text are persisted.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the campaign tables and RLS baseline** - `9bb73a0` (feat)
2. **Task 2: Implement typed repository helpers and status transitions** - `6d3a7d0` (feat)
3. **Task 3: Add revocable creator token and management session helpers** - `f0fe013` (feat)

**Plan metadata:** final docs commit

## Files Created/Modified

- `web/supabase/migrations/008_campaigns.sql` - Campaign, revision, and token tables with checks, indexes, forced RLS, and revoked public grants.
- `web/src/lib/campaigns/schema.ts` - Status unions, Zod schemas, slug normalization, and shared campaign/token types.
- `web/src/lib/campaigns/repository.ts` - Service-role repository with create/read/update helpers, moderation updates, lifecycle transitions, and snapshot publishing.
- `web/src/lib/campaigns/tokens.ts` - Random token creation, SHA-256 hashing, single-use consume, and revocation helpers.
- `web/src/lib/campaigns/session.ts` - Signed HttpOnly campaign management session helpers and token-to-session exchange.

## Decisions Made

- Used DB-backed SHA-256 token hashes for creator access because campaign links control public content and must be revocable.
- Kept payment out of schema for this plan; `markPaid` is a lifecycle hook that advances to email verification for future Stripe wiring.
- Scoped management cookies to `/kampagne` and kept the session TTL short at 2 hours.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed generated duplicate Next type files before TypeScript verification**
- **Found during:** Task 2
- **Issue:** `cd web && npx tsc --noEmit` failed on duplicate generated `.next/types/* 2.ts` definitions before reaching the new campaign code.
- **Fix:** Removed only the three generated duplicate files under `web/.next/types`.
- **Files modified:** none tracked
- **Verification:** `cd web && npx tsc --noEmit` passed afterward.
- **Committed in:** not committed; generated build artifacts were untracked.

---

**Total deviations:** 1 auto-fixed (Rule 3).
**Impact on plan:** Verification was unblocked without changing tracked application code or scope.

## Issues Encountered

- The plan's migration grep was case-sensitive, so SQL keywords for the required table/RLS lines were written lowercase to match the exact verification command.

## Known Stubs

None. Stub scan found only legitimate empty patch/default objects in repository helpers.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: public-content-storage | `web/supabase/migrations/008_campaigns.sql` | New Supabase tables persist creator-authored campaign issue text and metadata. RLS is forced and public grants are revoked. |
| threat_flag: bearer-token-management | `web/src/lib/campaigns/tokens.ts` | New creator access token flow controls campaign management. Tokens are random, hashed at rest, time-limited, single-use, and revocable. |
| threat_flag: management-session-cookie | `web/src/lib/campaigns/session.ts` | New HttpOnly campaign management cookie. Cookie is signed, short-lived, sameSite=lax, and scoped to `/kampagne`. |

## Verification

- `rg -n "create table .*campaigns|create table .*campaign_revisions|create table .*campaign_tokens|enable row level security" web/supabase/migrations` - passed.
- `cd web && npx tsc --noEmit` - passed.
- `cd web && rg -n "verify_email|manage|HttpOnly|token_hash" src/lib/campaigns && npx tsc --noEmit` - passed.
- Privacy scan for visitor letter/issue persistence - passed; only creator-authored `issue_text` is stored.

## User Setup Required

None for this plan. The helpers use the existing Supabase service-role environment; `CAMPAIGN_SESSION_SECRET` can be added later, otherwise session signing falls back to `SUPABASE_SERVICE_ROLE_KEY`.

## Next Phase Readiness

Plan 05-02 can call the repository to create draft campaigns, moderate creator-authored public text, issue verification tokens, and exchange verified email links for management sessions.

## Self-Check: PASSED

- Created files exist on disk.
- Task commits `9bb73a0`, `6d3a7d0`, and `f0fe013` exist in git history.

---
*Phase: 05-creator-paid-brief-templates-shareable-prefilled-pages*
*Completed: 2026-06-28*
