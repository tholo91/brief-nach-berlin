---
phase: 260414-pci
plan: 01
type: quick
subsystem: frontend/layout
tags: [header, footer, app-layout, navigation, airmail]
key-files:
  created:
    - web/src/components/AppHeader.tsx
    - web/src/components/AppFooter.tsx
    - web/src/app/app/layout.tsx
  modified:
    - web/src/app/app/page.tsx
decisions:
  - Used "use client" on AppHeader (sticky header requires client component)
  - AppFooter is a server component (no interactivity needed)
  - Layout owns min-h-screen flex column; page.tsx trimmed to Suspense + WizardShell only
metrics:
  duration: ~10min
  completed: 2026-04-14
  tasks_completed: 2
  tasks_total: 3
  files_created: 3
  files_modified: 1
---

# Phase 260414-pci Plan 01: Add Header and Footer to /app Layout Summary

**One-liner:** Persistent AppHeader + AppFooter added to /app/* via Next.js App Router segment layout, matching airmail/creme brand — landing page untouched.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create AppHeader and AppFooter components | d13da39 | web/src/components/AppHeader.tsx, web/src/components/AppFooter.tsx |
| 2 | Create /app segment layout and trim /app/page.tsx | 307a8bd | web/src/app/app/layout.tsx, web/src/app/app/page.tsx |
| 3 | Visual verification | checkpoint | awaiting human |

## What Was Built

- **AppHeader.tsx**: Client component. Sticky header with airmail stripe, "Brief nach Berlin" brand link (→ /), and "← Zur Startseite" back-link (→ /). No section anchors or CTA.
- **AppFooter.tsx**: Server component. Footer with airmail stripe, copyright, and three links: Startseite (/), Impressum (/impressum), Datenschutz (/datenschutz).
- **app/app/layout.tsx**: App Router segment layout. Wraps all /app/* routes with AppHeader + main flex-grow container + AppFooter. Uses `min-h-screen flex flex-col bg-creme`.
- **app/app/page.tsx**: Trimmed from 12 lines to 8. Removed `<main className="min-h-screen bg-creme">` wrapper — layout now owns the shell.

## Verification

- `next build` passes (10 routes, no TS errors, no warnings beyond expected edge runtime notice)
- Root layout (`web/src/app/layout.tsx`) not touched
- Landing page (`web/src/app/page.tsx`) not touched
- Awaiting visual verification at `http://localhost:3000/app`

## Deviations from Plan

None — plan executed exactly as written. The `npx tsc --noEmit` check in Task 1 returned the wrong binary (Next.js ships a wrapper that intercepts npx), so TypeScript was verified via `next build` instead — same result.

## Known Stubs

None. All links are wired to real routes.

## Threat Flags

None. No new network endpoints or auth paths introduced.
