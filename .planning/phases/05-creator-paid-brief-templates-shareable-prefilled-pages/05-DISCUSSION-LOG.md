# Phase 5: Creator-Paid Brief Templates & Shareable Prefilled Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26
**Phase:** 5-creator-paid-brief-templates-shareable-prefilled-pages
**Areas discussed:** public campaign page, creator setup flow, creator access model, publishing gate, editing behavior

---

## Public campaign page

| Option | Description | Selected |
|--------|-------------|----------|
| Generic landing reuse | Visitors land on a page structurally similar to the homepage, but campaign-specific | ✓ |
| Bare prefill form | Visitors skip campaign framing and see only a prefilled input | |
| Separate informational subpage first | Visitors read campaign copy first, then click onward to a second page | |

**User's choice:** Campaign links should land on something similar to the homepage. It should clearly look like a campaign, optionally show who started it, show a prefilled issue immediately, and keep the main emphasis on creating the letter.
**Notes:** The CTA should be a distinct button below the field, not just embedded in the field. The creator may also add a short description and an optional external link.

---

## Visitor prefill behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Prefilled and editable | Visitors can adapt the seeded issue before continuing | ✓ |
| Prefilled and locked | Visitors can only continue with the creator's exact wording | |
| Only a loose starter | Visitors get a hint but mostly write from scratch | |

**User's choice:** The seeded issue should be editable.
**Notes:** This preserves individual letter creation even inside a coordinated campaign.

---

## Creator setup fields

| Option | Description | Selected |
|--------|-------------|----------|
| Lean campaign form | Title, issue, optional creator/NGO name, optional short description, optional external link | ✓ |
| Minimal issue-only form | Only issue plus maybe creator name | |
| Rich campaign builder | More extensive campaign metadata and structure | |

**User's choice:** Lean campaign form with issue text plus a few optional metadata fields.
**Notes:** The creator page should teach what belongs in the issue field, because creators are not writing the final letter itself.

---

## Slug and public URL

| Option | Description | Selected |
|--------|-------------|----------|
| Neutral slug under `/kampagne/` | Shareable neutral URL such as `/kampagne/klimakrise-weckruf` | ✓ |
| Creator-branded URL | URL includes creator identity | |
| System-generated opaque slug | URL is generated and not chosen by creator | |

**User's choice:** Neutral `/kampagne/<slug>` URLs with creator-chosen slug.
**Notes:** Slug is only chosen once. The UI should explain formatting with hyphens instead of spaces.

---

## Creator access model

| Option | Description | Selected |
|--------|-------------|----------|
| No-login email access | Creation and later editing happen through email-based access links | ✓ |
| Full accounts | Creator manages campaigns through a registered account | |
| Payment-only recovery | Creator identity is mostly tied to payment proofs | |

**User's choice:** No-login model, with later editing handled via creator email links.
**Notes:** The user mentioned that payment-linked verification like Stripe invoice IDs could help if needed, but email remains the primary access path.

---

## Billing and activation

| Option | Description | Selected |
|--------|-------------|----------|
| One-time payment | Campaign stays live until paused/archived | ✓ |
| Subscription | Campaign stays live while recurring payment remains active | |
| Fixed-term one-time fee | Campaign is live only for a time-boxed window | |

**User's choice:** One-time payment.
**Notes:** Creator should receive a post-creation email with share instructions and management access.

---

## Go-live gate

| Option | Description | Selected |
|--------|-------------|----------|
| Live immediately after payment | Fastest flow, but risky if email is wrong | |
| Live after email confirmation | Payment first, then confirm email, then activate | ✓ |
| Manual moderation before live | Human approval required before activation | |

**User's choice:** Leaned to email-confirmed activation.
**Notes:** This keeps the no-login creator management path recoverable.

---

## Editing after launch

| Option | Description | Selected |
|--------|-------------|----------|
| Direct overwrite | Existing slug updates in place when creator edits | ✓ |
| New version required | Public text stays frozen, edits become a new version | |
| Hybrid | Meta fields can change directly, issue text requires versioning | |

**User's choice:** Direct overwrite for MVP.
**Notes:** The user explicitly wants to keep MVP lean. If the campaign changes substantially, that should just be a new campaign.

---

## Creator management capabilities

| Option | Description | Selected |
|--------|-------------|----------|
| Edit + pause/archive | Creator link allows content edits and stopping the campaign | ✓ |
| Edit only | No pause/archive in MVP | |
| Edit + delete | Creator can delete the campaign entirely | |

**User's choice:** Edit plus pause/archive.
**Notes:** The user also wants payment state stoppable somehow, possibly with Stripe involvement, but left the exact mechanism open.

---

## Safety and liability

| Option | Description | Selected |
|--------|-------------|----------|
| Visible non-liability note | Public campaign surface states that Brief nach Berlin does not stand behind the creator-authored issue text | ✓ |
| No explicit disclaimer | Trust the platform frame without separate legal note | |
| Fully manual legal review | Every campaign is manually vetted before publication | |

**User's choice:** A clear disclaimer must exist saying the platform does not take responsibility for the text.
**Notes:** The user asked specifically that this protection be included.

## the agent's Discretion

- Exact creator-writing helper copy and example format
- Exact character limit for campaign description
- Exact Stripe/payment verification handoff
- Exact archive/pause UX and whether it is surfaced directly in the creator email or through a management page

## Deferred Ideas

None.
