# Phase 5: Creator-Paid Brief Templates & Shareable Prefilled Pages - Research

**Date:** 2026-06-26
**Scope:** What needs to be true so Phase 5 can be planned and executed without breaking the existing landing-first, privacy-first letter flow.

## Summary

Phase 5 should be built as a small server-backed campaign subsystem around the existing product, not as a second letter engine. The cheapest viable architecture is:

1. Store campaign metadata in Supabase.
2. Keep visitor letter generation on the existing `/app` wizard path.
3. Reuse Brevo for creator emails.
4. Use Stripe Checkout for the one-time payment.
5. Use revocable DB-backed creator tokens for verification and management, not permanent stateless links.

## Existing patterns worth reusing

### Landing to wizard handoff

- `web/src/lib/wizard-handoff.ts` already moves issue text from landing to wizard via `sessionStorage`.
- `web/src/components/wizard/WizardShell.tsx` consumes that handoff once and clears it immediately.
- This pattern is the right base for campaign pages too, because it keeps user text out of the URL.

### Per-tab draft persistence

- `web/src/lib/landing-draft.ts` persists the generic landing issue draft per tab.
- Campaign pages need the same behavior, but namespaced by campaign slug so a public campaign draft does not overwrite the generic landing draft.

### Email delivery

- `web/src/lib/email/sendLetterEmail.ts` and `web/src/lib/email/buildEmailHtml.ts` already establish Brevo as the transactional email path.
- Creator activation and management mails should extend this stack instead of introducing a second provider.

### Moderation

- `web/src/lib/moderation/moderateText.ts` is the current moderation boundary.
- Campaign issue text and optional description become public, so they must be moderated before a campaign can become active, and again on edits before changed public text is published.

### Server-side data writes

- `web/src/lib/supabase/server.ts` already exposes a service-role client for server-only writes.
- The roadmap signup work shows the intended pattern: Supabase table + restrictive RLS + server action.

## Key architecture decisions

### 1. Storage model

Use three tables, not one:

- `campaigns`: current canonical record used by the app.
- `campaign_revisions`: immutable snapshots of public fields on creation and every successful edit.
- `campaign_tokens`: hashed, revocable creator tokens for `verify_email` and `manage`.

Why:

- `campaigns` gives a simple read path for `/kampagne/[slug]`.
- `campaign_revisions` satisfies the roadmap promise that history is not deleted, while still allowing direct overwrite on the live slug.
- `campaign_tokens` avoids permanent bearer links that cannot be revoked.

### 2. Status model

Use an explicit status machine on `campaigns`:

- `draft`
- `awaiting_payment`
- `awaiting_email_verification`
- `active`
- `paused`
- `archived`
- `blocked`

Rules:

- Public route serves only `active`.
- `paused` and `archived` keep history and creator access but disappear publicly.
- `blocked` is for moderation or integrity failures and must not leak publicly.

### 3. Token strategy

Do not use the existing stateless HMAC feedback token pattern for creator management links.

Reason:

- Feedback tokens are low-risk and intentionally long-lived.
- Creator links control public content and lifecycle state, so revocation and one-time use matter.

Recommended approach:

- Generate a random token.
- Store only `sha256(token)` plus `campaign_id`, `kind`, `expires_at`, `used_at`.
- Email the raw token once.
- On open, exchange it for a short-lived HttpOnly management session cookie and mark the original token as used.

### 4. Payment and activation sequence

The cleanest sequence that matches the phase context is:

1. Creator submits campaign form with email.
2. Server validates + moderates public text.
3. Draft campaign row is created and slug is reserved.
4. Stripe Checkout session is created for that campaign.
5. Stripe webhook marks the campaign as paid.
6. Paid creator receives a verification email.
7. Verification click activates the campaign only if the current public text still passes moderation.
8. Creator receives a separate management link email after activation.

This keeps typoed emails from creating unreachable live campaigns and avoids public go-live before payment is confirmed.

### 5. Public campaign page

Campaign pages should reuse the current landing-first behavior rather than fork it.

Implications:

- The route should be a campaign-specific landing page under `/kampagne/[slug]`.
- The issue field is prefilled and editable.
- Clicking the CTA should reuse the wizard handoff pattern and continue into `/app`.
- The wizard must remain the single place that collects PLZ, email, tone, and optional sender data.

### 6. Privacy boundary

Phase 5 must not introduce storage of visitor letters or raw visitor issue text beyond the existing flow.

Allowed persistence:

- Creator-authored campaign metadata
- Creator email
- Payment linkage
- Token hashes
- Revision snapshots of campaign text

Not allowed:

- Persisting visitor-modified issue text from the public campaign page
- Persisting generated letters for campaign visitors

## Suggested file and route footprint

### New backend areas

- `web/supabase/migrations/*campaign*.sql`
- `web/src/lib/campaigns/*`
- `web/src/lib/actions/*campaign*.ts`
- `web/src/app/api/stripe/webhook/route.ts` or existing Stripe webhook endpoint

### New public routes

- `web/src/app/(site)/kampagne/starten/page.tsx`
- `web/src/app/(site)/kampagne/[slug]/page.tsx`
- `web/src/app/(site)/kampagne/verifizieren/page.tsx`
- `web/src/app/(site)/kampagne/verwalten/page.tsx`

### Likely reusable components

- `Step2Issue` for the prefilled editable issue field
- existing landing sections for trust continuity
- existing email builder style patterns for creator mails

## Open choices left to planning

- Exact Stripe product/price wiring and whether the price ID is config-only or stored in DB
- Exact campaign description limit inside the preferred 300-400 character band
- Whether creator management lives behind a cookie-backed page session or a one-time route that rotates links on every open
- Whether creator edit saves auto-publish after moderation or require an explicit "Änderungen veröffentlichen" click

## Planning recommendation

Split Phase 5 into four plans:

1. Campaign schema, token security, server repository layer.
2. Creator creation flow, moderation gate, Stripe checkout, activation mails.
3. Public campaign landing page and wizard handoff reuse.
4. Creator management, pause/archive, revision snapshots, Datenschutz update.
