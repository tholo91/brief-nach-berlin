# Phase 5: Creator-Paid Brief Templates & Shareable Prefilled Pages - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Creators can launch a paid no-login campaign flow that produces a public campaign page under a shareable slug. Visitors landing on that campaign page see a campaign-specific variant of the Brief nach Berlin landing experience, with a prefilled issue they can adapt before continuing into the normal letter flow. The creator can later edit campaign content and archive/pause the campaign through emailed access links, but this phase does not add user accounts.

</domain>

<decisions>
## Implementation Decisions

### Creator entrypoint & roles
- **D-01:** There are two explicit roles in this phase: **creator** and **user**. Their flows are separate.
- **D-02:** There is a general public subpage for starting a campaign. It explains what campaign mode is and also tells creators how existing campaigns can be edited later without an account.
- **D-03:** The creator flow is deliberately **no-login** for MVP. Access after creation is handled through email-based links, not accounts.

### Creator setup flow
- **D-04:** The campaign creation page lets the creator draft the campaign directly in-product, not via a hidden admin flow.
- **D-05:** Creator-editable fields are: campaign title, prefilled issue/anliegen, optional creator name or NGO name, optional short campaign description, and optional external link to the creator/organization.
- **D-06:** The creation UI should help the creator write useful input. It should include example guidance showing that they are not writing the final letter itself, but the issue/anliegen and any supporting framing that should seed later letters.
- **D-07:** The optional campaign description should stay lean and bounded. A short text limit in the roughly 300-400 character range is preferred.
- **D-08:** The public slug is chosen during creation and is only chosen once. Format should be taught with an example like `klimakrise-weckruf`, using hyphens instead of spaces.

### Public campaign page experience
- **D-09:** A visitor opening a campaign link lands on a campaign-specific landing page, not on the generic homepage and not on a bare form.
- **D-10:** That page should feel structurally similar to the existing landing page so trust and orientation stay intact, but it is clearly marked as part of a campaign.
- **D-11:** The page may optionally show who started the campaign. Creator attribution is optional because anonymous campaigns are allowed.
- **D-12:** The main focus of the page is still letter creation, not campaign browsing. The prefilled issue is visible immediately and the primary CTA is a separate, prominent button below the field.
- **D-13:** The campaign issue text is **prefilled and editable** for visitors. This preserves the core product promise that each user can still individualize the brief.

### Publishing, payments & activation
- **D-14:** Billing model for MVP is **one-time payment**. After payment, the campaign stays live until the creator pauses or archives it.
- **D-15:** Campaigns do **not** go live immediately after payment. They go live only after the creator confirms the email address. This protects the no-login edit/access model from typoed emails.
- **D-16:** After creation, the creator receives an email with share guidance, the campaign URL, and clear instructions for editing or pausing later.

### Editing, lifecycle & URL behavior
- **D-17:** The emailed creator link may be used to edit campaign content, including the issue text, description, optional attribution, and optional external link.
- **D-18:** The creator link may also be used to pause/archive the campaign.
- **D-19:** For MVP, editing an already-live campaign **directly overwrites** the public content under the existing slug. There is no versioning layer in this phase.
- **D-20:** If the creator wants a materially different campaign with a different identity, that should be treated as a new campaign rather than a versioned revision of the old one.

### Safety, trust & legal framing
- **D-21:** The public campaign page must make clear that Brief nach Berlin does not take responsibility for the creator-authored issue text. A visible non-liability/disclaimer note is required.
- **D-22:** Because campaign content becomes publicly shareable, planning must include a moderation/publishing step before or around go-live so abusive or unsafe templates do not become public. The exact mechanism is left to planning/research, but public campaigns are not an unmoderated free-for-all.

### the agent's Discretion
- Exact copy for the creator education/example block
- Exact short-description length limit
- Exact email verification mechanism and token flow
- Exact Stripe linkage for payment state and creator re-entry
- Exact public campaign page layout, as long as it stays landing-like and letter-first
- Exact pause/archive semantics and whether Stripe links are surfaced inside the creator email or management view

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` — Phase 5 goal, dependencies, requirements, and lifecycle promises
- `.planning/REQUIREMENTS.md` — `ENGM-03`, `SAFE-03`, `PRIV-01`, and `PRIV-04` constraints that campaign mode must respect
- `.planning/PROJECT.md` — product principles: minimal friction, no accounts in v1-style flows, and validation-first scope discipline

### Existing landing and wizard behavior
- `web/src/components/wizard/WizardShell.tsx` — current landing-to-wizard handoff, URL param behavior, and wizard step architecture
- `web/src/lib/wizard-handoff.ts` — existing sessionStorage handoff pattern between landing and wizard
- `web/src/lib/landing-draft.ts` — current landing draft persistence behavior
- `web/src/app/app/page.tsx` — current wizard entry route and suspense shell
- `.planning/todos/pending/2026-06-02-v2-landing-wizard-merge-with-voice-input-field.md` — locked context on the landing-first interaction model that campaign pages should align with

### Existing generation, safety, and email constraints
- `web/src/app/api/generate-letter/route.ts` — current generation pipeline, moderation order, and no-persistence runtime flow
- `web/src/lib/generation/generateLetter.ts` — letter-generation contract and prompt assumptions the campaign-prefill flow must preserve
- `web/src/lib/moderation/moderateText.ts` — current moderation wrapper pattern
- `web/src/lib/email/sendLetterEmail.ts` — current email delivery entrypoint
- `web/src/lib/email/buildEmailHtml.ts` — current email content conventions
- `.planning/phases/03-email-delivery-privacy-compliance/03-CONTEXT.md` — locked decisions about email delivery, prefill links, and privacy posture

### Prior product decisions
- `.planning/phases/01-landing-page-data-infrastructure/01-CONTEXT.md` — landing tone, disclaimer expectations, and copy constraints
- `.planning/phases/02-core-engine/02-CONTEXT.md` — wizard behavior, prefill expectations, and letter individuality constraints

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `web/src/components/wizard/WizardShell.tsx`: already owns the multi-step flow, handoff intake, and `/app` progression logic that campaign pages should reuse instead of duplicating.
- `web/src/components/wizard/Step2Issue.tsx`: existing issue-entry component that likely serves both generic landing and campaign-prefill entry.
- `web/src/lib/wizard-handoff.ts`: proven way to pass a drafted issue from one page into the wizard without leaking text into the URL.
- `web/src/lib/landing-draft.ts`: existing per-tab persistence behavior that may need campaign-aware boundaries.
- `web/src/lib/email/*`: existing creator/user email patterns can be extended instead of inventing a new mail stack.

### Established Patterns
- Landing-first UX is already the dominant path: users start with the issue, then continue into `/app`.
- The current product avoids accounts and keeps sensitive text out of persistent URLs when possible.
- Email is already used as the trusted delivery and follow-up channel, which makes it the natural channel for creator management links too.
- Output moderation and no-persistence guarantees are already central product constraints and must not be broken by campaign mode.

### Integration Points
- New campaign landing pages should hand off into the existing wizard rather than fork the letter-generation flow.
- Campaign creation/editing will need to connect payment state, email verification, slug uniqueness, and creator-management tokens in one place.
- Public campaign content likely needs server-backed storage distinct from the stateless current flow, but must still respect the project's privacy posture for end-user letters.

</code_context>

<specifics>
## Specific Ideas

- Public campaign URLs should use a neutral pattern like `/kampagne/afd-verbot-jetzt`.
- The campaign creation page should explicitly teach the creator what kind of text belongs in the issue field, potentially with an example.
- The creator email should feel "ready to share" immediately after activation, with the link and simple instructions up front.
- Anonymous campaigns are allowed; creator attribution is optional, not mandatory.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-creator-paid-brief-templates-shareable-prefilled-pages*
*Context gathered: 2026-06-26*
