---
phase: quick-261008-n3g
plan: 01
subsystem: campaigns
tags: [campaigns, ends_at, letter-pipeline, creator-ui]
requires: [migration 025]
provides: [campaigns.ends_at, isCampaignEnded, CampaignEndedView, CampaignEndDatePicker, endCampaignAction]
affects: [kampagne/[slug], kampagne/verwalten, generate-letter, wizard handoff]
key-files:
  created:
    - web/supabase/migrations/026_campaign_ends_at.sql
    - web/src/lib/campaigns/endDate.ts
    - web/src/lib/actions/campaignEnd.ts
    - web/src/components/campaigns/CampaignEndedView.tsx
    - web/src/components/campaigns/CampaignEndDatePicker.tsx
    - web/src/__tests__/campaignEndDate.test.ts
    - web/src/__tests__/campaignEndRepository.test.ts
    - web/src/__tests__/campaignEndActions.test.ts
  modified:
    - web/src/lib/campaigns/schema.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/app/(site)/kampagne/[slug]/page.tsx
    - web/src/app/(site)/kampagne/verwalten/page.tsx
    - web/src/app/api/generate-letter/route.ts
    - web/src/lib/actions/{submitWizard,selectPolitician,resendLetter,updateCampaign,pauseCampaign,transferCampaign,createCampaignDraft}.ts
    - web/src/components/wizard/WizardShell.tsx
    - web/src/components/campaigns/{CampaignManager,CreatorCampaignForm}.tsx
  deleted:
    - web/src/lib/actions/archiveCampaign.ts
decisions:
  - "ends_at = 23:59:59 Europe/Berlin on the chosen day; end now stores the current instant"
  - "Single-campaign reads keep select(*) and tolerate a missing column; list queries filter in SQL and need migration 026"
  - "Ended campaigns stay resolvable by getActiveCampaignBySlug; letter pipeline applies runningCampaign"
  - "Ending a paused campaign also sets status active so the public ended page is reachable"
  - "Runtime feedback (pause, end date, end) moved from the edit form result box into its own box in the runtime section"
status: complete
commits: 3
plan_head_before: 4bc0bd5d8094ee8896090a017967eb56b4b4ce66
plan_head_after: 830cdfcb858e35913574514deb85b1d58a59cfb1
actuals:
  tokens: 70000
  tasks: 3
  commits: 3
---

# Phase quick-261008-n3g Plan 01: Kampagnen S2 Ablaufdatum und Beendet-Ansichten Summary

Optional campaign end date (`campaigns.ends_at`) with a calm public ended page, ended campaigns dropped from lists and the letter pipeline, and read-only creator management after the end.

## Commits

| Task | Commit | Scope |
| ---- | ------ | ----- |
| 1 (tracer) | 8f29e8d | Migration 026 (file only), endDate.ts, schema/repository read side, list filters, CampaignEndedView, page wiring, tests |
| 2 | fac4ddf | runningCampaign in generate-letter / selectPolitician / resendLetter / submitWizard, WizardShell handoff, repository write guards, endCampaignAction, updateCampaignEndDateAction, ended guards, tests |
| 3 | 830cdfc | CampaignEndDatePicker, creation form, CampaignManager (read-only ended state, "Kampagne jetzt beenden"), manage page, archive action removed |

## Results

- Jest: 96 suites, 94 pass, 2 fail (baseline `letterSignalActions`, `supportContent`); 633 tests pass, 2 fail (baseline 589 pass / 2 fail, plus new tests).
- Lint: 0 errors, 7 warnings (all pre-existing, none in touched files).
- `tsc --noEmit`: only pre-existing errors in `campaignTopicReset.test.ts`.
- Build: `npm run build` (Turbopack) fails in this worktree for an environment reason: `node_modules` is a symlink out of the filesystem root ("Symlink [project]/node_modules is invalid"). `next build --webpack` with dummy env vars (Supabase URL/key, Brevo, Mistral, session secret) exits 0 and lists `/kampagne/[slug]` and `/kampagne/verwalten` as dynamic (ƒ). `/kampagne` list is static with 1h revalidate, so ending a campaign also revalidates `/kampagne`.
- No em or en dashes in any added line under `web/src` and `web/supabase`.

## Migration state (reported separately)

- File: created, `web/supabase/migrations/026_campaign_ends_at.sql`.
- Local: not applied (no local Supabase).
- Remote: not applied. Needs Thomas.

## Deploy order

Apply 026 in Supabase Studio BEFORE merging to main (Vercel deploys main). Without 026: single-campaign reads, letter generation and manage page still work; `getRecentActiveCampaigns` and `getLandingCampaigns` error (landing pills, not-found list, ended-view list fall back to empty; `/ngo-briefkampagne` returns 500). Creating a campaign without an end date works without 026.

## Deviations from Plan

**1. [Rule 3 - Blocking] updateCampaignAction moderation order**
- **Issue:** the plan wants the ended guard before moderation, but moderation ran before the campaign was loaded.
- **Fix:** moved the moderation block after the creator-email check and the new ended guard. Behavior otherwise identical.
- **Files:** `web/src/lib/actions/updateCampaign.ts`

**2. [Rule 2 - Missing critical] Revalidate `/kampagne`**
- The public campaign list is static (1h). Added `revalidatePath("/kampagne")` in the end and end-date actions so ended campaigns leave the list immediately.

**3. UI structure choice**
- Runtime results (pause, end date, end) now show in their own status box inside the "Laufzeit und Status" section instead of the edit-form result box. The "Änderungen veröffentlichen" button is hidden when ended (read-only).

**4. Build verification**
- Turbopack build not possible in the worktree (symlinked node_modules); verified with `next build --webpack` and dummy env instead. Not a code issue.

No auth gates. No package installs.

## Copy decisions

German, informal du, no dashes as Gedankenstriche. Locked strings used verbatim. Additions: "Die Seite bleibt als Endstand erreichbar. Neue Briefe lassen sich über diese Kampagne nicht mehr starten." (ended view, neutral, no reason speculated), "Diese Kampagnen laufen noch" (list heading), "Laufzeit und Status", "Letzter Tag der Kampagne", "Endet am {Datum} um 23:59 Uhr.", "Die Kampagne läuft, bis du sie selbst beendest.", confirmation "Kampagne jetzt beenden? Der Link bleibt erreichbar und zeigt den Endstand. Über die Kampagne kann niemand mehr einen Brief starten. Das lässt sich nicht rückgängig machen." Ended banner: "Die Kampagnenseite bleibt online und zeigt den Endstand. Ändern lässt sich nichts mehr. Wenn du die Kampagne neu starten willst oder Fragen hast, schreib uns."

## Design notes

Existing airmail/paper/green language: `CampaignBackground`, `font-typewriter` headline, white/70 panel with a waldgruen left border (calm, not an error look), `rounded-md` everywhere, waldgruen primary CTA, airmail-rot only for the destructive confirm. Picker chips are real radios (`sr-only peer`) with visible focus outline, 44px min height, wrapping on 375px. Date input appears only for "Eigenes Datum".

## Browser-preview seams (orchestrator)

- Public ended view: `web/src/app/(site)/kampagne/[slug]/page.tsx:92` `const { campaign } = resolved;` replace temporarily with `const campaign = { ...resolved.campaign, endsAt: "2026-10-01T21:59:59.000Z" };` (the `isCampaignEnded` call is line 93).
- Manage ended state: `web/src/app/(site)/kampagne/verwalten/page.tsx:95` `const ended = ...` plus the campaign passed on line 112. Forcing only `ended = true` shows the read-only state but the banner needs `campaign.endsAt`, so also pass `{ ...authorizedCampaign, endsAt: "2026-10-01T21:59:59.000Z" }` to `CampaignManager`.

## Known Stubs

None.

## Threat Flags

None. Server actions reuse the existing session/owner check; ended guards exist in actions and repository.

## Self-Check: PASSED

- Files exist: migration 026, endDate.ts, campaignEnd.ts, CampaignEndedView.tsx, CampaignEndDatePicker.tsx, three new test files.
- Commits present: 8f29e8d, fac4ddf, 830cdfc.

## Orchestrator-Nachtrag (Browser-Verifikation)

- Migration 026 von Thomas in Produktion angewendet (2026-10-08); verifiziert über `/ngo-briefkampagne` 200 mit Listenfilter auf `ends_at`.
- Screenshots mobil 375px + Desktop 1440px: öffentliche Beendet-Seite, Verwalten aktiv (Enddatum-Picker), Verwalten beendet (Banner, read-only, mailto Kontakt). Beendet-Zustand per temporärer, nicht committeter Übersteuerung erzwungen.
- Nachbesserung `6191f9e`: eigene Kampagne aus "Diese Kampagnen laufen noch" gefiltert, Copy ohne Meta-Satz, Enddatum-Chips mobil im 2-Spalten-Raster.
- Turbopack-Build grün nach Ersetzen des node_modules-Symlinks durch APFS-Klon.
