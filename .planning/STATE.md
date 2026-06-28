---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Completed 05-04-PLAN.md
last_updated: "2026-06-28T19:04:49.302Z"
last_activity: 2026-06-28
progress:
  total_phases: 33
  completed_phases: 4
  total_plans: 22
  completed_plans: 15
  percent: 68
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.
**Current focus:** Phase 05 — Creator-Paid Brief Templates & Shareable Prefilled Pages

## Current Position

Phase: 05 — EXECUTING
Plan: 4 of 4
Status: Phase complete — ready for verification
Last activity: 2026-06-28 - Completed quick task 260628-ta0: Marken-Entity-Schema Organization und WebSite JSON-LD im Next Root-Layout ergänzen

Progress: [███████░░░] 68%

## Current Implementation Notes

- Landing is now the practical first issue step: `Hero.tsx` renders `Step2Issue variant="landing"` and sends the issue to `/app` through `wizard-handoff.ts`.
- Wizard step 1 is now review/tone confirmation for a prefilled issue when arriving from the Landing. It is not a blank first contact in the common flow.
- The Landing issue draft survives browser-back through `landing-draft.ts` and is cleared after successful send in `WizardShell`.
- The Landing-to-Wizard field morph is implemented with the current View Transition path. Future 999.6 routing prefetch must not block that morph or add a visible intermediate step.
- Phase 999.6 plans were amended on 2026-06-26 so `routeToLevel` prefetch starts at Landing submit and is passed forward only as a signed, issue-hash-bound token.

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: 10.5 min
- Total execution time: 21 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 03 | 3 | - | - |
| 05 | 2 | 21 min | 10.5 min |

**Recent Trend:**

- Last 5 plans: 05-01, 05-02
- Trend: Phase 5 started

*Updated after each plan completion*
| Phase 05 P02 | 12 min | 3 tasks | 7 files |
| Phase 05 P03 | 4 min | 3 tasks | 6 files |
| Phase 05 P04 | 6min | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: PLZ-to-Wahlkreis preprocessing (shapefile → static JSON) placed in Phase 1 as data infrastructure prerequisite
- Roadmap: Abgeordnetenwatch cache build placed in Phase 1 alongside data prep
- Roadmap: Content safety (SAFE-01..03) placed in Phase 2 — must exist before any letter can be generated or shown
- Phase 05-01: Campaign access uses random DB-backed token hashes, not stateless feedback HMAC links.
- Phase 05-01: `markPaid` currently advances draft campaigns to awaiting_email_verification without adding payment columns because Stripe/payment is deferred.
- Phase 05-01: Management sessions are short-lived HttpOnly cookies signed server-side and scoped to `/kampagne`.
- 05-02: Stripe/payment stayed out of the creator flow; draft creation advances directly to email verification for validation.
- 05-02: Verification links are one-time tokens; reused or expired links return status without duplicate management emails.
- 05-02: Management token creation and email delivery are implemented, while the management UI remains for the later creator-management plan.
- 05-03: Public campaign pages load active campaigns only via `getActiveCampaignBySlug`; invalid, paused, archived, draft, blocked, and missing slugs return `notFound()`.
- 05-03: Campaign visitor issue text uses the existing sessionStorage wizard handoff, not URL text parameters.
- 05-03: Campaign drafts are namespaced by slug so campaign pages do not collide with the generic landing draft.
- 05-04: Creator management remains a single no-account page gated by emailed manage tokens and the existing short-lived management cookie.
- 05-04: Pause and archive are status transitions only; public routes serve active campaigns only.

### Roadmap Evolution

- Phase 4 added: Stadtstaaten PLZ-Wahlkreis Genauigkeit und Wahlkreis-Gruppierung im Wizard (user-reported defect, Matthias 2026-05-27 — Stadtstaat PLZs surface 3-4 neighbouring Wahlkreise; fix = PLZ-polygon ∩ Wahlkreis-polygon intersection + group results by Wahlkreis in wizard)
- Phase 5 added: Creator-Paid Brief Templates & Shareable Prefilled Pages (creator-owned no-login template pages with moderated prefill, share links, and frozen/archiveable versions)

### Pending Todos

13 pending — see `.planning/todos/pending/`

### Blockers/Concerns

- Phase 1: No official PLZ-to-Wahlkreis CSV exists. Bundeswahlleiter shapefiles require preprocessing. Script must be written and validated before Phase 2 can proceed.
- Phase 1: Landing page structure (Hero, HowItWorks, etc.) exists in /web but LAND-03 (letter counter) requires real data — placeholder acceptable for Phase 1, real data in v2.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260426-c59 | Polish letter email + kill em dashes + warmer share copy + OG fix | 2026-04-26 | 30b1d14 | [260426-c59-polish-letter-email-kill-em-dashes-warme](./quick/260426-c59-polish-letter-email-kill-em-dashes-warme/) |
| 260511 | Retry Mistral on transient errors, surface 503 as specific user message | 2026-05-11 | 3a562ec | [260511-mistral-retry-backoff](./quick/260511-mistral-retry-backoff/) |
| 260511-wgf | Firefox hero video fallback - add WebM source, loop, preload | 2026-05-11 | db9524b | [260511-wgf-firefox-hero-video-fallback-add-webm-sou](./quick/260511-wgf-firefox-hero-video-fallback-add-webm-sou/) |
| 260512-vco | Stichpunkte-Botschaft auf Landingpage + Wizard klarstellen (User-Feedback) | 2026-05-12 | 43e8d07 | [260512-vco-stichpunkte-copy-clarification](./quick/260512-vco-stichpunkte-copy-clarification/) |
| 260521-tn1 | Review-Lernschleife: Chips, Anti-Halluzination, Length-Korridor, Wiederholungs-Fix | 2026-05-21 | 1a9e8e3 | [260521-tn1-review-lernschleife-chips-anti-halluzina](./quick/260521-tn1-review-lernschleife-chips-anti-halluzina/) |
| 260522-k6t | Reviews-Seite /stimmen bauen mit reusable Komponenten | 2026-05-22 | (post-merge) | [260522-k6t-reviews-seite-stimmen-bauen-mit-reusable](./quick/260522-k6t-reviews-seite-stimmen-bauen-mit-reusable/) |
| 260522-u2u | /stimmen Polish: Reviews-Filter ab 2026-05-21, Karten uniform, Copy/Captions | 2026-05-22 | b628913 | [260522-u2u-stimmen-polish-reviews-filter-ab-2026-05](./quick/260522-u2u-stimmen-polish-reviews-filter-ab-2026-05/) |
| 260522-upk | /stimmen Editorial Polish: eyebrows, signed close, FAQ intro, list, standfirst | 2026-05-22 | fb35a26 | [260522-upk-stimmen-editorial-polish-eyebrows-signed](./quick/260522-upk-stimmen-editorial-polish-eyebrows-signed/) |
| 260522-v52 | /stimmen Hero-Note + Datums-Korrektur: Mitte Mai 2026, 350+ Briefe | 2026-05-22 | bd4e181 | [260522-v52-stimmen-hero-note-datums-korrektur-mitte](./quick/260522-v52-stimmen-hero-note-datums-korrektur-mitte/) |
| 260523-e8o | Switch von "wir" auf "ich" über Landing + Subpages, plus Mithelfen-Block auf /was-noch-kommt und /stimmen | 2026-05-23 | a9b7c5a | [260523-e8o-switch-wir-auf-ich-ber-landing-und-subpa](./quick/260523-e8o-switch-wir-auf-ich-ber-landing-und-subpa/) |
| 260523-n2a | /stimmen dynamic letter count + consolidate Mithelfen and Sign-off (hide email) | 2026-05-23 | d20ca74 | [260523-n2a-stimmen-dynamic-letter-count-consolidate](./quick/260523-n2a-stimmen-dynamic-letter-count-consolidate/) |
| 260523-pph | /stimmen sign-off copy + /brief-verbessern mobile copy button + bold prompt anchors | 2026-05-23 | ff75d77 | [260523-pph-stimmen-sign-off-copy-brief-verbessern-m](./quick/260523-pph-stimmen-sign-off-copy-brief-verbessern-m/) |
| 260526-u4r | /stimmen: swipeable reviews on touch + hide reviews below 3 stars | 2026-05-26 | 35a98a3 | [260526-u4r-stimmen-swipe-and-filter](./quick/260526-u4r-stimmen-swipe-and-filter/) |
| 260527-fast | Hero sub-headlines 5→4 + Art. 17 GG variant (inspired by liebemdb competitor analysis) | 2026-05-27 | b29e24c | (gsd-fast, no PLAN.md) |
| 260527-wu1 | Subpage /was-bisher-geschah: kuratiertes, monatsgruppiertes Fortschritts-Log aus Git-Historie + Footer-Link + Sitemap | 2026-05-27 | 27a7557 | [260527-wu1-subpage-was-bisher-geschah-kuratiertes-f](./quick/260527-wu1-subpage-was-bisher-geschah-kuratiertes-f/) |
| 260527-m36 | E-Mail Footer MdB-Link inline + Resend mit Debug & Sterne vereinheitlichen | 2026-05-27 | 755b077 | [260527-m36-e-mail-footer-mdb-link-inline-resend-mit](./quick/260527-m36-e-mail-footer-mdb-link-inline-resend-mit/) |
| 260530-kk4 | Mistral model migration: centralize IDs + URGENT voxtral swap + switch letter gen to small+reasoning_effort=high | 2026-05-30 | ac5b9d3 | [260530-kk4-mistral-model-migration-centralize-ids-i](./quick/260530-kk4-mistral-model-migration-centralize-ids-i/) |
| 260601-jts | PLZ-Ort-Anzeige unter dem PLZ-Inputfeld in Step1Form.tsx | 2026-06-01 | 98f50bb | [260601-jts-plz-ort-anzeige-unter-dem-plz-inputfeld-](./quick/260601-jts-plz-ort-anzeige-unter-dem-plz-inputfeld-/) |
| 260610-jal | PLZ-Lookup vor Rate-Limit ziehen: plz_not_found verbraucht keinen Email-Token mehr (kein Self-Lockout bei Tippfehler/Listen-Wahlkreis) | 2026-06-10 | (pending) | [260610-jal-rate-limit-after-plz-lookup](./quick/260610-jal-rate-limit-after-plz-lookup/) |
| 260621-og8 | Dritte/letzte Follow-up-Mail (Last-Call, followup-3m): MdB-Reaktion + Story-Sharing via heyspeak/Mail, Versand-Script + Skill | 2026-06-21 | dba21c4 | [260621-og8-letzte-lastcall-followup-mail](./quick/260621-og8-letzte-lastcall-followup-mail/) |
| 260625-9at | E-Mail-Adresse aus Hardcoding befreien — THOMAS_MAIL env var (contact.ts, config.ts, 7 Dateien) | 2026-06-25 | 6fa05fc | [260625-9at-email-hardcoding-env-var](./quick/260625-9at-email-hardcoding-env-var/) |
| 260625-w13 | Voice-Flag (usedSpeechToText) durch Landing→Wizard-Handoff reichen — Debug-Link meldete Voice immer false | 2026-06-25 | 5e5acbe | [260625-w13-voice-flag-usedspeechtotext-geht-beim-la](./quick/260625-w13-voice-flag-usedspeechtotext-geht-beim-la/) |
| 260625-wh4 | Debug-Readout schlanker: Anliegen-Auszug 300→600 Zeichen, Issue-text-words-Zeile raus | 2026-06-25 | b6c1410 | [260625-wh4-debug-readout-schlanker-input-cap-600-is](./quick/260625-wh4-debug-readout-schlanker-input-cap-600-is/) |
| 260625-skh | Landing-Anliegen übersteht Browser-Zurück: per-Tab sessionStorage-Draft (lib/landing-draft.ts), Restore in Step2Issue, Clear nach Versand in WizardShell | 2026-06-25 | 99ddfac | [260625-skh-landing-anliegen-ueberlebt-browser-zurue](./quick/260625-skh-landing-anliegen-ueberlebt-browser-zurue/) |
| 260625-wko | Log-Observability fetchMdbContext: 404→no_poll_results info statt api_error warning, Log-Label politicianId→mandateId | 2026-06-25 | cb1d15b | [260625-wko-log-observability-fetchmdbcontext-404-al](./quick/260625-wko-log-observability-fetchmdbcontext-404-al/) |
| 260626-0cz | View-Transition-Morph fürs Anliegen-Feld Landing→Wizard (nativer VT-Flag + geteilter view-transition-name, graceful degradation) | 2026-06-26 | 96969f6 | [260626-0cz-vt-morph-anliegenfeld](./quick/260626-0cz-vt-morph-anliegenfeld/) |
| 260626-h4r | Hero verschlanken + 2-zeiliges Anliegen-Feld, laengere Placeholder, Reassurance in "So einfach geht's" | 2026-06-26 | (pending) | [260626-h4r-hero-vereinfachen-2zeiliger-input](./quick/260626-h4r-hero-vereinfachen-2zeiliger-input/) |
| 260628-ta0 | Marken-Entity-Schema Organization und WebSite JSON-LD im Next Root-Layout ergänzen | 2026-06-28 | 09bf448 | [260628-ta0-marken-entity-schema-organization-und-we](./quick/260628-ta0-marken-entity-schema-organization-und-we/) |

## Session Continuity

Last session: 2026-06-28T14:56:10.946Z
Stopped at: Completed 05-04-PLAN.md
Resume file: None

**Planned Phase:** 4 (Stadtstaaten PLZ-Wahlkreis Genauigkeit und Wahlkreis-Gruppierung im Wizard) — 3 plans — 2026-05-27T21:50:31.369Z
