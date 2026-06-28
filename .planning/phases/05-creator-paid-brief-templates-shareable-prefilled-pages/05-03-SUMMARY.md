---
phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
plan: 03
subsystem: campaigns-ui
tags: [nextjs, react, campaigns, wizard-handoff, privacy]

requires:
  - phase: 05-creator-paid-brief-templates-shareable-prefilled-pages
    provides: Campaign repository, active status model, and creator activation flow from 05-01 and 05-02
provides:
  - Server-rendered public campaign route for active campaigns only
  - Landing-like campaign page with editable issue starter and visible liability disclaimer
  - Campaign-scoped wizard handoff and per-tab draft persistence without URL issue text
affects: [phase-05-creator-management, public-campaign-flow, wizard-handoff]

tech-stack:
  added: []
  patterns:
    - active-only campaign route using repository public fields
    - campaign-scoped sessionStorage draft keys
    - one-time wizard handoff tagged by campaign slug

key-files:
  created:
    - web/src/app/(site)/kampagne/[slug]/page.tsx
    - web/src/components/campaigns/CampaignHero.tsx
    - web/src/components/campaigns/CampaignIssueStarter.tsx
  modified:
    - web/src/lib/wizard-handoff.ts
    - web/src/lib/landing-draft.ts
    - web/src/components/wizard/WizardShell.tsx

key-decisions:
  - "The public campaign route calls getActiveCampaignBySlug and returns notFound for invalid, missing, paused, archived, draft, or blocked campaigns."
  - "Campaign visitor issue text is passed via the existing sessionStorage wizard handoff, never through a text URL parameter."
  - "Campaign draft persistence reuses landing-draft helpers but namespaces keys by slug so generic landing drafts do not collide."

patterns-established:
  - "Campaign pages expose only title, issue text, optional description, optional attribution, optional external URL, and slug to the public UI."
  - "WizardShell keeps campaign slug only as a local draft cleanup ref, not as WizardData submitted to backend actions."

requirements-completed: [ENGM-03, PRIV-01, SAFE-03]

duration: 4min
completed: 2026-06-28
---

# Phase 5 Plan 3: Public Campaign Landing Page Summary

**Active campaign pages with editable prefilled issue text, visible creator disclaimer, and privacy-safe handoff into the existing wizard**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-28T14:37:42Z
- **Completed:** 2026-06-28T14:41:36Z
- **Tasks:** 3 automated tasks complete; 1 browser-flow human-verification checkpoint pending
- **Files modified:** 6

## Accomplishments

- Added `/kampagne/[slug]` as a server-rendered public route that loads active campaigns only and returns `notFound()` for invalid, missing, or inactive campaigns.
- Added a Brief-nach-Berlin-style campaign landing UI with title, optional description, optional creator/NGO attribution, editable prefilled issue field, CTA below the field, and a visible Haftung disclaimer.
- Extended the existing wizard handoff so campaign visitors continue into `/app` without putting issue text in the URL.
- Namespaced per-tab campaign drafts by slug while keeping the generic landing draft key unchanged.

## Task Commits

1. **Task 1 + 2: Public campaign route and landing-like UI** - `4dd925b` (feat)
2. **Task 3: Campaign-safe wizard handoff and draft persistence** - `3c53d85` (feat)

**Plan metadata:** final docs commit

## Files Created/Modified

- `web/src/app/(site)/kampagne/[slug]/page.tsx` - Active-only public campaign route with metadata and 404 handling.
- `web/src/components/campaigns/CampaignHero.tsx` - Campaign-specific landing section with public fields, attribution, and non-liability disclaimer.
- `web/src/components/campaigns/CampaignIssueStarter.tsx` - Editable issue textarea, slug-scoped draft persistence, and CTA into the wizard.
- `web/src/lib/wizard-handoff.ts` - Adds optional campaign source and slug metadata to the existing sessionStorage handoff.
- `web/src/lib/landing-draft.ts` - Adds optional slug namespacing while preserving the generic landing draft behavior.
- `web/src/components/wizard/WizardShell.tsx` - Consumes campaign handoff once and clears the campaign-scoped draft after successful completion.

## Decisions Made

- Combined Task 1 and Task 2 in one code commit because the route depends on the new campaign UI components to compile cleanly.
- Kept campaign slug out of `WizardData`; it is only held in a local ref for clearing the matching sessionStorage draft.
- Did not perform browser-flow verification in this automated run; it remains pending as requested.

## Deviations from Plan

None - plan executed within the requested scope. The only task-combining was commit granularity, not behavior scope.

## Issues Encountered

- Browser-flow verification remains pending. I did not open an active campaign in a browser, edit text, continue into `/app`, or test browser-back draft restore visually.

## Known Stubs

None. Stub scan found only existing legitimate `null`/object initializers in wizard code.

## Verification

- `cd web && npx tsc --noEmit` - passed.
- `cd web && rg -n "kampagne/\\[slug\\]|active campaign|active campaigns|notFound" src/app src/lib` - passed via `notFound()` route guards.
- `cd web && rg -n "Haftung|Hinweis|CTA|Step2Issue" src/components/campaigns src/app/(site)/kampagne` - passed via visible Hinweis/Haftung copy.
- `cd web && rg -n "campaign|slug|handoff|sessionStorage" src/lib/wizard-handoff.ts src/lib/landing-draft.ts src/components/wizard/WizardShell.tsx` - passed.
- `cd web && rg -n "Brief daraus starten|campaignSlug|source: \"campaign\"|getActiveCampaignBySlug|notFound|Haftung|Hinweis" ...` - passed.
- `cd web && rg -n "text=" ...` - no implementation path found; only the existing explanatory comment mentions `?text=`.

## Human Verification Pending

Browser-flow checkpoint still needs manual or browser-agent verification:

1. Open an active `/kampagne/[slug]` URL.
2. Confirm the page feels like a campaign-specific Brief nach Berlin landing page, not a dashboard.
3. Edit the prefilled issue text.
4. Click `Brief daraus starten`.
5. Confirm `/app` opens with the edited text and no issue text in the URL.
6. Navigate back and confirm the campaign-scoped draft survives.

## User Setup Required

None. This plan uses the existing Supabase service-role read path and browser sessionStorage.

## Next Phase Readiness

Plan 05-04 can build creator management on top of the active public route and existing campaign repository. Public campaign pages now have the visitor-side handoff needed for live creator validation.

## Self-Check: PASSED

- Created files exist on disk.
- Task commits `4dd925b` and `3c53d85` exist in git history.

---
*Phase: 05-creator-paid-brief-templates-shareable-prefilled-pages*
*Completed: 2026-06-28*
