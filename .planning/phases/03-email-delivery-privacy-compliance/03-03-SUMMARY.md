---
phase: 03-email-delivery-privacy-compliance
plan: "03"
subsystem: privacy-compliance
tags: [datenschutz, dsgvo, privacy, legal]
dependency_graph:
  requires: []
  provides: [accurate-datenschutzerklaerung]
  affects: [web/src/app/datenschutz/page.tsx]
tech_stack:
  added: []
  patterns: [dsgvo-art13-disclosure, react-server-component]
key_files:
  created: []
  modified:
    - web/src/app/datenschutz/page.tsx
decisions:
  - "Retained existing page structure, styling, and German Unicode characters — only content sections replaced"
  - "Politician data section (Section 7) clarifies these are public official data, not user PII"
  - "Remaining 'keine personenbezogenen Daten' in Section 7 is accurate context — describes politician data, not a false claim about the service"
metrics:
  duration: "10 minutes"
  completed: "2026-04-14"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 03 Plan 03: Datenschutzerklaerung Rewrite Summary

**One-liner:** Complete DSGVO Art. 13 Datenschutzerklaerung rewrite covering all 7 processing activities (PLZ, E-Mail, Freitext, Spracheingabe, Mistral AI, OpenAI Moderation, Brevo) with legal basis, recipients, transfers, and retention per-service.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite Datenschutzerklaerung with full processing activity disclosures | e34d04f | web/src/app/datenschutz/page.tsx |

## What Was Built

The `datenschutz/page.tsx` was expanded from 6 sections to 13 sections:

| Section | Content |
|---------|---------|
| 1 | Verantwortlicher (kept as-is) |
| 2 | Allgemeines — replaced false "keine Daten" claim with accurate processing description |
| 3 | Hosting (Vercel) — expanded with full address, legal basis (Art. 6 lit. f), SCC transfer basis |
| 4 | PLZ processing — local lookup only, Art. 6 lit. b, no storage |
| 5 | E-Mail-Adresse — Brevo delivery only, no server storage |
| 6 | Anliegen (Freitext + Spracheingabe) — Mistral AI + OpenAI Moderation, no server storage |
| 7 | Politikerdaten — public official data from Abgeordnetenwatch (CC0) + Bundeswahlleiterin |
| 8 | Mistral AI — EU-hosted, French company, AVV, DPA link |
| 9 | OpenAI Moderation API — US-hosted, SCCs basis, DPA link |
| 10 | Brevo — EU-hosted (France/Germany), AVV, no server storage |
| 11 | Ihre Rechte (kept as-is, renumbered from 4) |
| 12 | Streitschlichtung (kept as-is, renumbered from 5) |
| 13 | KI-generierte Inhalte und Disclaimer (kept as-is, renumbered from 6) |

## Acceptance Criteria Verification

| Criterion | Result |
|-----------|--------|
| Does NOT contain "erhebt und verarbeitet derzeit keine personenbezogenen Daten" | PASS (count=0) |
| Contains "Mistral" >= 2 times | PASS (count=6) |
| Contains "OpenAI" >= 2 times | PASS (count=4) |
| Contains "Brevo" >= 2 times | PASS (count=8) |
| Contains "Postleitzahl" >= 1 time | PASS (count=5) |
| Contains "E-Mail" >= 2 times | PASS (count=10) |
| Contains "Art. 6 Abs. 1 lit. b DSGVO" | PASS (count=4) |
| Contains "Standardvertragsklauseln" (SCCs) | PASS (count=2) |
| Contains "legal.mistral.ai" (Mistral DPA link) | PASS (count=2) |
| Contains "openai.com/policies/data-processing-addendum" | PASS (count=2) |
| Contains "Thomas Lorenz" | PASS (count=1) |
| Contains "Stand: April 2026" | PASS (count=1) |
| TypeScript compiles without errors | PASS |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the Datenschutzerklaerung is a static informational page with no data dependencies.

## Threat Flags

No new security surface introduced. The page is a static informational page with no data processing. Threat mitigations T-03-08 and T-03-09 are satisfied:
- T-03-08 (Information Disclosure): No internal API keys, server paths, or implementation details exposed — only public service names, addresses, and DPA links.
- T-03-09 (Repudiation): Page now accurately reflects actual data processing flows from Phases 1-3. The false "keine Daten" claim has been removed.

## Self-Check: PASSED

- File exists: web/src/app/datenschutz/page.tsx — FOUND
- Commit exists: e34d04f — FOUND
- TypeScript: no errors
