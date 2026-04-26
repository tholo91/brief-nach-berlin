---
id: SEED-001
status: dormant
planted: 2026-04-26
planted_during: v1.0 / Phase 02
trigger_when: First real abuse incident OR sustained >100 letters/day
scope: Medium
---

# SEED-001: Upgrade rate limiter to shared state + add Cloudflare Turnstile

## Why This Matters

The current rate limiter ([web/src/lib/rateLimit.ts](../../web/src/lib/rateLimit.ts)) is in-memory only. Buckets do not share across Vercel serverless instances and are lost on redeploy. There is also no CAPTCHA on the wizard form.

Practical consequence: a moderately motivated bot can drain the OpenAI/Mistral budget by hitting cold-start instances or by staying under the per-IP/per-hour caps (10 letters + 30 transcriptions per IP/hour). Today the spend is small enough that this is acceptable; the moment we see real traffic or an abuse spike, this becomes a direct cost-and-availability problem.

## When to Surface

**Trigger:** First real abuse incident OR sustained >100 letters/day

Surface this seed during `/gsd-new-milestone` when the next milestone scope touches:
- Abuse mitigation, anti-bot, or fraud prevention
- Cost controls on AI providers (OpenAI / Mistral)
- Scaling beyond MVP traffic levels
- Public launch / marketing push that will spike traffic

## Scope Estimate

**Medium** — likely a phase or two:
1. Migrate rate limiter to shared store (`@vercel/kv` or Upstash Redis). Same `checkRateLimit` API, swap the backing Map for KV with TTLs.
2. Add Cloudflare Turnstile to the wizard form (Step 1 or pre-submit). Verify token server-side in `submitWizardAction` / `selectPoliticianAction` / `/api/transcribe`.
3. Optional: per-action cost ceiling (kill switch when daily OpenAI spend exceeds a threshold).

## Breadcrumbs

- [web/src/lib/rateLimit.ts](../../web/src/lib/rateLimit.ts) — current limiter, caveats already documented in header comment (lines 1-8). `LIMITS` const at lines 54-63.
- [web/src/lib/actions/submitWizard.ts](../../web/src/lib/actions/submitWizard.ts) — call site (IP + email buckets)
- [web/src/lib/actions/selectPolitician.ts](../../web/src/lib/actions/selectPolitician.ts) — call site (IP + email buckets)
- [web/src/app/api/transcribe/route.ts](../../web/src/app/api/transcribe/route.ts) — call site (IP bucket, returns 429 with Retry-After)
- [web/src/components/wizard/WizardShell.tsx](../../web/src/components/wizard/WizardShell.tsx) — wizard entry point where Turnstile widget would mount

## Notes

Captured 2026-04-26 after a security/rate-limit review of the live app. No abuse observed yet; this is preventative. Source-of-truth for current limits and rationale is the inline comment block in `rateLimit.ts` — keep that file's comment in sync if limits are tuned before this seed activates.
