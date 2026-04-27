### 🧠 App Overview
App 1 (`web/`) is a Next.js 16 app with:
- Marketing site (`/`) and wizard flow (`/app`) for collecting PLZ + issue text, selecting an MdB, generating a letter via Mistral, and sending it by email via Brevo.
- No internal DB; it relies on static local JSON mapping for PLZ→Wahlkreis and cached politician data, plus live Abgeordnetenwatch enrichment.
- Core backend flow:
  1. [`submitWizardAction`](file:///Users/thomas/Documents/Git%20Repos/brief-nach-berlin/web/src/lib/actions/submitWizard.ts) validates/moderates input and returns candidates.
  2. [`selectPoliticianAction`](file:///Users/thomas/Documents/Git%20Repos/brief-nach-berlin/web/src/lib/actions/selectPolitician.ts) revalidates, regenerates from server-derived politician, sends email asynchronously.
  3. [`resendLetterAction`](file:///Users/thomas/Documents/Git%20Repos/brief-nach-berlin/web/src/lib/actions/resendLetter.ts) regenerates/resends.

### ⚠️ Critical Issues (Fix before launch)
- **Issue:** `resendLetterAction` trusts full client-supplied `politician` object instead of re-deriving from PLZ/ID (unlike `selectPoliticianAction`).  
  **Why it matters:** A tampered client can inject arbitrary postal/profile data into outbound emails (spoofed recipient metadata, malicious link payload).  
  **Where:** [resendLetter.ts:17](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/actions/resendLetter.ts:17), [resendLetter.ts:67](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/actions/resendLetter.ts:67), compare safe pattern in [selectPolitician.ts:82](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/actions/selectPolitician.ts:82).  
  **Suggested fix:** Change resend signature to accept only `selectedPoliticianId`; re-derive candidate list server-side via `lookupPLZ`, verify ID membership, and ignore all client politician fields.

- **Issue:** `/api/transcribe` accepts arbitrary uploaded blob size/content and copies full blob into memory.  
  **Why it matters:** Easy resource/cost exhaustion (memory spikes + paid transcription abuse).  
  **Where:** [route.ts:38](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/api/transcribe/route.ts:38), [route.ts:49](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/api/transcribe/route.ts:49).  
  **Suggested fix:** Enforce strict max size/duration/content-type before `arrayBuffer()`, reject unsupported media, add request body caps at infra level, and short-circuit early with `413`.

### 🔴 High Priority Issues
- **Issue:** Rate limiting is in-memory per instance and explicitly non-distributed.  
  **Why:** Abuse protection collapses under scale/multi-instance traffic; paid infra cost exposure.  
  **Where:** [rateLimit.ts:1](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/rateLimit.ts:1).  
  **Fix:** Move to centralized store (Upstash/Vercel KV/Redis), keyed by IP + fingerprint + email, with atomic increments.

- **Issue:** IP source trusts forwarded headers directly.  
  **Why:** In non-Vercel/self-host/misproxy scenarios this is spoofable, weakening limits.  
  **Where:** [rateLimit.ts:72](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/rateLimit.ts:72), [route.ts:7](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/api/transcribe/route.ts:7).  
  **Fix:** Use trusted platform-provided IP field only, or parse forwarded chain with trusted proxy list.

- **Issue:** Optional free-text fields (`name`, `party`, `ngo`) have no max length constraints.  
  **Why:** Prompt bloat/token abuse and possible reliability issues.  
  **Where:** [wizardSchemas.ts:11](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/validation/wizardSchemas.ts:11).  
  **Fix:** Add `.trim().max(...)` bounds and normalization for all optional fields.

- **Issue:** Missing CSP and request-origin guard for expensive endpoints.  
  **Why:** Browser-triggered abuse surface stays larger than necessary.  
  **Where:** [next.config.ts:3](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/next.config.ts:3).  
  **Fix:** Add strict CSP, and verify `Origin/Host` for POST routes/server actions where feasible.

### 🟡 Medium Priority Improvements
- **Issue:** Resend regenerates a fresh letter each time instead of reusing prior result.  
  **Why:** User may receive inconsistent variants; extra LLM cost per retry.  
  **Where:** [resendLetter.ts:67](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/actions/resendLetter.ts:67).  
  **Fix:** Store short-lived encrypted payload/token for one resend window or re-send same rendered content.

- **Issue:** Legal/privacy messaging risks mismatch with operational reality (third-party logs/retention).  
  **Why:** Trust and compliance risk if statements are interpreted too absolutely.  
  **Where:** [datenschutz/page.tsx:65](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/datenschutz/page.tsx:65), [buildEmailHtml.ts:284](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/email/buildEmailHtml.ts:284).  
  **Fix:** Tighten wording to explicitly separate “no first-party DB persistence” from processor log retention.

- **Issue:** Test coverage is narrow (only PLZ mapping), no backend-action/security regression tests.  
  **Why:** Critical flow can regress silently.  
  **Where:** [plzLookup.test.ts](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/__tests__/plzLookup.test.ts).  
  **Fix:** Add tests for action validation, tampering prevention, rate-limit behavior, and transcribe limits.

### 🟢 Low Priority / Nice-to-Have
- **Issue:** Lint pipeline currently broken due dependency resolution error.  
  **Why:** No static quality gate in CI path.  
  **Where:** `npm run lint` fails (`Cannot find module 'resolve'`).  
  **Fix:** Reinstall lockfile-clean deps and pin/verify eslint plugin dependency graph.

- **Issue:** Some docs/legal model references appear stale vs runtime model config.  
  **Why:** Operational confusion during audits/incidents.  
  **Where:** [datenschutz/page.tsx:242](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/datenschutz/page.tsx:242), runtime in [generateLetter.ts:6](/Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/lib/generation/generateLetter.ts:6).  
  **Fix:** Generate legal/model strings from a single config source.

### 🔐 Security Summary
Top risks:
- Trust-boundary break in resend path (client-controlled politician payload).
- Unbounded transcription uploads (DoS/cost exposure).
- Weak distributed abuse controls (in-memory rate limiting + header-derived IP).

Overall posture:
- Better than average MVP in some areas (server-side validation/moderation, deliberate anti-tamper logic in `selectPoliticianAction`, output moderation, security headers baseline).
- Not launch-safe for paid usage yet due the two critical issues above plus abuse-control gaps.

### 🚀 MVP Readiness Verdict
- **Safe to launch with a price tag?** **No**.
- **Must fix before charging users:**
  1. Re-derive politician server-side in resend flow.
  2. Add strict upload caps/type checks for transcribe.
  3. Move rate limiting to shared durable backend and harden IP trust/origin checks.

### 🛠 Suggested Next Steps
1. Patch `resendLetterAction` to use server-authoritative politician lookup by ID only, and add regression tests for tampered payload rejection.
2. Implement transcribe guardrails: max bytes, MIME whitelist, duration checks, request timeout/abort, infra-level body limit.
3. Replace in-memory limiter with Redis/KV-backed atomic counters; add per-route limit policies and abuse telemetry.
4. Add security test suite for server actions/API (tampering, rate limits, validation bounds).
5. Restore lint pipeline reliability and enforce CI gate (`lint + test`) before deploy.
6. Reconcile privacy/legal text with actual processor retention and model usage configuration.

I only found one runnable app in this repo (`/Users/thomas/Documents/Git Repos/brief-nach-berlin/web`). Send the second codebase and I’ll produce an equivalent App 2 report with the same criteria.