---
quick_id: 260523-pph
slug: stimmen-sign-off-copy-brief-verbessern-m
description: /stimmen sign-off copy tweaks + /brief-verbessern mobile copy button + bold prompt anchors
date: 2026-05-23
mode: quick (inline orchestrator)
tasks_total: 3
---

# /stimmen copy + /brief-verbessern mobile fix + bold anchors

Three tiny changes, two files. Three atomic commits.

## Task 1 — /stimmen sign-off copy tweaks

**File:** `web/src/app/(site)/stimmen/page.tsx`

- Button label: `Schreib mir` → `Melde dich gerne bei mir`
- Signature line: `Thomas, Bremen` → `Thomas aus Bremen`

**Commit:** `style(stimmen): warmer sign-off — "Thomas aus Bremen" + "Melde dich gerne bei mir"`

## Task 2 — PromptCopyBlock: mobile-visible copy button

**File:** `web/src/components/PromptCopyBlock.tsx`

The copy button is currently `opacity-0 group-hover:opacity-100`, which means it never appears on touch devices (no hover state). Replace with `opacity-100 md:opacity-0 md:group-hover:opacity-100` — visible on mobile, hover-reveal on desktop.

**Commit:** `fix(prompt-copy): always show copy button on touch devices`

## Task 3 — Bold the two prompt anchor lines for visual emphasis

**Files:**
- `web/src/components/PromptCopyBlock.tsx` (add optional `boldLines?: string[]` prop)
- `web/src/app/(site)/brief-verbessern/page.tsx` (pass the two lines)

The prompt is rendered inside a `<pre>`. To bold specific lines visually while keeping the copy/paste output as plain text, split the text by newline on render and wrap matching lines in `<strong>`. The `text` prop stays the source of truth for clipboard copy.

The two lines to bold:
- `Das möchte ich am Brief ändern oder ergänzen:`
- `Hier ist der Entwurf, den du überarbeiten sollst:`

**Commit:** `feat(brief-verbessern): bold the two prompt anchor lines for scannability`

## Constraints

- Next.js 16 App Router. PromptCopyBlock is already `"use client"`.
- No em dashes (also not in commit subjects — use hyphens or omit).
- TypeScript clean (`npx tsc --noEmit`).
- Sprache: Deutsch.
