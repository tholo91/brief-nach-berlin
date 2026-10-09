---
phase: quick-261009-jb1
plan: 01
subsystem: kampagnen-verwalten
tags: [campaigns, creator-stats, timeline, share-links, privacy]
requires: []
provides:
  - buildTimeline (pending | empty | ready, day or week granularity)
  - campaignCompactShortUrl, campaignLinkParts, campaignLinkText
  - COMPACT_APP_URL
affects:
  - web/src/lib/campaigns/creatorStats.ts
  - web/src/components/campaigns/CampaignCreatorStats.tsx
  - web/src/components/campaigns/CampaignUrlCopyField.tsx
  - web/src/components/campaigns/CampaignManager.tsx
tech-stack:
  added: []
  patterns: [pure helpers carry the copy-text contract]
key-files:
  created: []
  modified:
    - web/src/lib/campaigns/creatorStats.ts
    - web/src/components/campaigns/CampaignCreatorStats.tsx
    - web/src/__tests__/campaignCreatorStats.test.ts
    - web/src/lib/config.ts
    - web/src/lib/share.ts
    - web/src/components/campaigns/CampaignUrlCopyField.tsx
    - web/src/components/campaigns/CampaignManager.tsx
    - web/src/__tests__/campaignManagerLayout.test.ts
    - web/src/app/(site)/datenschutz/page.tsx
    - DSGVO-VERARBEITUNGSVERZEICHNIS.md
decisions:
  - "Ended campaigns skip the 3-day gate but keep granularity by span (daily up to 28 days, weekly beyond)."
  - "Empty timeline copy is time-neutral: 'Zu diesen Briefen gibt es noch keine Zahlen für den Verlauf.'"
metrics:
  duration: ~15min
  completed: 2026-10-09
status: complete
actuals:
  tokens: 20000
  tasks: 3
  commits: 3
plan_head_before: 0e4e4681f2642f770ebd8b97b2be2aafeb64a9a2
plan_head_after: 5efd543cbe7a9a089ab068526ee69c54a88b3afc
commits: 3
---

# Phase quick-261009-jb1 Plan 01: Verlauf pro Tag, Kurzlinks Summary

Verlauf chart shows Berlin calendar days for spans up to 28 days, waits until day 3 for running campaigns, and falls back to the unchanged weekly bars beyond that. Compact link fields copy exactly what they show, and active campaigns get a hyphen-free radio link on www.briefnachberlin.de.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Verlauf per day / pending / weekly (buildTimeline, card, tests) | be74504 |
| 2 | Compact link copies displayed text, radio link on briefnachberlin.de | c15ec52 |
| 3 | Privacy texts (Datenschutz section 20, VT-6) | 5efd543 |

## Verification

- Full jest suite: 101 suites passed, 795 tests passed, 0 failed.
- tsc (plan's filtered gate): no output, no new errors.
- eslint on all 9 code files: clean.
- No package.json or lockfile diff, no "* 2.*" duplicate touched.

## Deviations from Plan

None - plan executed exactly as written. Minor: the Datenschutz sentence was reflowed so the phrase "Briefe pro Tag (nach den ersten vier Wochen pro Woche)" sits on one source line, matching the plan's grep.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Commits be74504, c15ec52, 5efd543 exist on main; all listed files modified.
