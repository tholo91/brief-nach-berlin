---
quick_id: 260511-mistral-retry-backoff
description: Retry Mistral calls with exponential backoff and surface 503s as a specific user-facing error
date: 2026-05-11
status: in-progress
---

# Quick Task: Mistral Retry + Backoff

## Problem

`POST /api/generate-letter` returns 500 when Mistral has a transient outage (observed: 503 `unreachable_backend` in fra1 on 2026-05-11). There is no retry around the two `mistral.chat.complete` calls in `web/src/lib/generation/generateLetter.ts`, and the API route returns a generic German error that hides the cause from the user.

## Tasks

### T1 — Add retry helper to mistral client wrapper
- **files:** `web/src/lib/mistral.ts`
- **action:** Add `withMistralRetry()` helper (max 3 attempts, exponential backoff with jitter) that retries on 408/429/500/502/503/504 and common network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, EAI_AGAIN). Export a `MistralProviderUnavailableError` class thrown after retries are exhausted on 5xx so the route handler can map it to a 503 with a user-facing message.
- **verify:** `npm run build` (in `web/`) succeeds, no new TS errors.
- **done:** Helper is exported and ready to use.

### T2 — Wrap both `mistral.chat.complete` calls in generateLetter
- **files:** `web/src/lib/generation/generateLetter.ts`
- **action:** Wrap the first call (line 277) and the retry call (line 308) with `withMistralRetry()`. Pass distinct labels (`generateLetter:first`, `generateLetter:length-retry`) for logging clarity.
- **verify:** `npm run build` succeeds. Word-count retry logic is unchanged.
- **done:** Both Mistral calls now self-heal on transient errors.

### T3 — Map provider error to specific 503 in route handler
- **files:** `web/src/app/api/generate-letter/route.ts`
- **action:** In the catch block, detect `MistralProviderUnavailableError` and return `{ error: "Unser KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut." }` with status 503 and `Retry-After: 60` header. Keep the existing generic 500 for everything else.
- **verify:** `npm run build` succeeds.
- **done:** Users see actionable copy instead of generic error.

## Out of scope

- `moderateText()` in `web/src/lib/moderation/moderateText.ts` also calls Mistral but is intentionally left alone for this quick fix — moderation failures already short-circuit to a different code path and adding retry there is a separate decision.
- Fallback to a second model/provider — defer until Mistral outages become a pattern.
- Increasing `maxDuration` — 3 attempts with backoff fit comfortably inside the existing 60s budget.

## Must-haves

- Retry helper bounded to ≤ 3 attempts and ≤ ~2s of total wait time to stay well inside the 60s function budget.
- Original error preserved on non-retryable failures (no error swallowing).
- No new runtime dependencies.
