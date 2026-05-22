---
quick_id: 260522-upk
slug: stimmen-editorial-polish-eyebrows-signed
description: /stimmen Editorial Polish - 5 surgical changes, 5 atomic commits
date: 2026-05-22
type: execute
autonomous: true
files_modified:
  - web/src/app/(site)/stimmen/page.tsx
tasks_total: 5
tasks_completed: 5
commits:
  - 16158e6
  - 355858b
  - f67bc65
  - a969b34
  - fb35a26
duration_seconds: 222
---

# Quick Task 260522-upk: /stimmen Editorial Polish Summary

Five surgical editorial-polish moves to `web/src/app/(site)/stimmen/page.tsx`, each landed as one atomic commit in plan order. Net diff against the worktree base: 28 insertions, 33 deletions, one file touched. No new files, no new dependencies, no new Tailwind tokens, no `"use client"` added, no em dashes anywhere.

## Commits (in plan order)

| # | Hash | Subject | Diff |
|---|------|---------|------|
| 1 | `16158e6` | `feat(stimmen): typewriter eyebrows above pullquotes` | +2 lines |
| 2 | `355858b` | `feat(stimmen): replace duplicate final CTA with signed handwritten close` | +11/-19 |
| 3 | `f67bc65` | `feat(stimmen): bridge line between FAQ heading and accordion` | +1 line |
| 4 | `a969b34` | `feat(stimmen): convert feedback-changes paragraph into scannable list` | +7/-10 |
| 5 | `fb35a26` | `feat(stimmen): standfirst deck above story section` | +7/-4 |

## What each commit changed

### 1. `16158e6` - typewriter eyebrows above pullquotes
Added a typewriter eyebrow `<p>` inside each Prose wrapper immediately before the PullQuote.
- Section 4: `Aus den Reviews / Mai 2026`
- Section 6: `Aus den Reviews / einen Monat später`

Both eyebrows use `font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4`. Separator is the U+002F forward slash, not an em dash.

### 2. `355858b` - replace duplicate final CTA with signed handwritten close
Deleted the entire Section 8 bordered box (h2 "Schreib uns. Auch wenn du nichts schickst.", the paragraph, and the duplicate Feedback zum Tool / Direkt schreiben buttons). Replaced with a centered sign-off:
- Handwriting line: "Wenn du bis hier gelesen hast: schreib mir. Auch eine Zeile reicht."
- Typewriter signature: "Thomas, Bremen" (comma, not em dash)
- Small underlined `posteo` mailto link below

Updated the comment to `{/* 8. Sign-off */}`. Section 2 stays the canonical primary CTA. `FOUNDER_FEEDBACK_URL` remains imported (still used by Section 2) - grep count of 2 confirmed (import line + Section 2 reference).

### 3. `f67bc65` - bridge line between FAQ heading and accordion
Inserted a single bridge `<p>` inside the Prose wrapper, between the `Häufige Fragen` h2 and `</Prose>`: "Was wir am häufigsten gefragt werden, kurz beantwortet." The `<FAQAccordion>` stays a sibling outside Prose (unmoved).

### 4. `a969b34` - convert feedback-changes paragraph into scannable list
Replaced the dense second paragraph in Section 5's Prose (the one starting "Konkrete Beispiele aus den letzten Wochen: Nach mehreren Hinweisen...") with an intro line plus a 4-item `<ul>`:

- Komplexitäts-Floskel raus, ersetzt durch positive Anti-Halluzinations-Regel
- Wiederholungs-Fix für doppelte Sätze
- Längen-Korridor auf plus minus fünfzehn Prozent gelockert
- Negative Feedback-Chips für strukturierte Kritik

List uses `list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40` because `Prose.tsx` only clears floats around `<ul>` and does not style markers, padding, or spacing itself. Used the words "plus minus" rather than the `±` symbol (Thomas's product is handwritten letters; the symbol does not survive copy-paste cleanly). Origin paragraph and follow-up paragraph were untouched in this commit.

### 5. `fb35a26` - standfirst deck above story section
Inserted a handwriting standfirst with a left-border rule between the `<h2>Wo das hier herkommt</h2>` and the `<Figure ...>` element. Classes: `font-handwriting text-xl md:text-2xl text-waldgruen leading-snug text-balance border-l-2 border-waldgruen/30 pl-5 my-6 not-italic`. Copy: "Drei Monate, dreihundert Briefe, und eine Liste an Dingen, die wir wegen euch geändert haben."

Also trimmed the first paragraph's redundant opener as the plan instructed: "Die Idee entstand Anfang 2026. " was removed because the new standfirst already announces "Drei Monate, dreihundert Briefe". The first paragraph in Section 5 now starts with "Seitdem sind über 300 Briefe entstanden, viele davon mit Anliegen..." (this is the trim decision Thomas pre-approved in the plan's `<interfaces>` block).

## Deviations from Plan

None. The plan's `<interfaces>` block already pre-approved the Section 5 opener trim, so it is not a deviation but the planned behavior.

Two minor environment notes (not deviations from the user-facing plan, but worth recording for the next executor):

1. **`tsc` binary location.** The worktree had no `node_modules/` at start. I created a symlink `node_modules -> /Users/thomas/Documents/Git Repos/brief-nach-berlin/web/node_modules` so the local `./node_modules/.bin/tsc` resolved against the worktree's source. The symlink is gitignored (node_modules is in `.gitignore`) and does not appear in any commit. No `package.json` or lockfile was touched.
2. **Worktree branch base.** On entry, the worktree's HEAD was `4ef5f74` (newer than the required base `20eef1d`). I hard-reset to `20eef1d` per the `<worktree_branch_check>` instructions before any edits. No work was lost (`4ef5f74` is the same commit on `main` ahead of the base; not part of this task).

## Verification

| Check | Result |
|-------|--------|
| 5 commits in plan order | PASS (see commit table) |
| Each commit touches only `web/src/app/(site)/stimmen/page.tsx` | PASS (`git log --oneline -5 --name-only` confirmed) |
| `grep -n "—" web/src/app/(site)/stimmen/page.tsx` empty | PASS (no em dashes in file) |
| Commit messages em-dash-free | PASS (verified via `git log -5 --format=%B`) |
| `cd web && npx tsc --noEmit` clean | PASS (exit code 0, no output) |
| Section 2 Feedback CTA intact | PASS (unchanged) |
| `FOUNDER_FEEDBACK_URL` still imported and used | PASS (grep count = 2: import + Section 2) |
| Section 8 has no box, just sign-off | PASS |
| Section 5 standfirst sits between h2 and Figure | PASS |
| First paragraph of Section 5 now starts "Seitdem sind über 300 Briefe..." | PASS |
| Section 7 bridge line inside Prose, accordion outside | PASS |
| `Konkrete Beispiele` list has 4 li with on-brand markers | PASS |
| Both PullQuotes have eyebrow above | PASS |

## Self-Check: PASSED

- File `web/src/app/(site)/stimmen/page.tsx` exists at the expected path - FOUND
- Commit `16158e6` exists in `git log` - FOUND
- Commit `355858b` exists in `git log` - FOUND
- Commit `f67bc65` exists in `git log` - FOUND
- Commit `a969b34` exists in `git log` - FOUND
- Commit `fb35a26` exists in `git log` - FOUND
- Working tree clean (`git status --short` empty) - CONFIRMED
- TypeScript check clean (`./node_modules/.bin/tsc --noEmit` exit 0) - CONFIRMED
