---
quick_id: 260511-mistral-retry-backoff
description: Retry Mistral calls with exponential backoff and surface 503s as a specific user-facing error
date: 2026-05-11
status: complete
---

# Summary: Mistral Retry + Backoff

## Trigger

Production incident `dpl_41fEfjMVSVdyah895MquWsZ8qhKJ` (fra1, 2026-05-11 20:46 UTC): `POST /api/generate-letter` returned 500 because Mistral responded with 503 `unreachable_backend` (`code: 1100`). Single-shot Mistral calls had no resilience; the user-facing error was generic and did not signal that retrying would help.

## Changes

- **`web/src/lib/mistral.ts`** — Added `withMistralRetry()` helper: max 3 attempts, exponential backoff (400ms / 800ms / 1600ms) with up to 200ms jitter. Retries on HTTP 408/429/500/502/503/504 and common network errors (`ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND`, `EAI_AGAIN`, `UND_ERR_*`, `AbortError`, `TimeoutError`). Throws a new `MistralProviderUnavailableError` if all retries are exhausted on a 5xx status. Non-retryable errors propagate unchanged.
- **`web/src/lib/generation/generateLetter.ts`** — Wrapped both `mistral.chat.complete` calls with `withMistralRetry()` using labels `generateLetter:first` and `generateLetter:length-retry`. Word-count retry logic is unchanged.
- **`web/src/app/api/generate-letter/route.ts`** — Catch block now detects `MistralProviderUnavailableError` and responds with HTTP 503 + `Retry-After: 60` and the message `"Unser KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut."`. All other errors keep the existing generic 500.

## Verification

- `npm run build` in `web/` — compiles, TypeScript clean, 21/21 static pages generated.
- `npx eslint` on the three changed files — no warnings.

## Time budget

3 attempts × worst-case ~8s Mistral latency + ~2.4s backoff = ~26s. Comfortably inside the `maxDuration = 60` budget, even when combined with the existing word-count retry path.

## Out of scope (deliberately)

- `moderateText()` in `web/src/lib/moderation/moderateText.ts` still uses a raw single-shot Mistral call. Out of scope for this fix.
- No fallback provider/model. Defer until Mistral outages become a pattern, not a one-off.
- No client-side change. The wizard's existing retry button now sees a 503 with a clear message instead of a 500.
