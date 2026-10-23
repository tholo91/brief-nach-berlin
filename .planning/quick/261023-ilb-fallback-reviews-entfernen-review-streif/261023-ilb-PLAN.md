---
phase: quick-261023-ilb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/reviews/getHeroReviews.ts
  - web/src/lib/reviews/fallbackReviews.ts
  - web/src/__tests__/getHeroReviews.test.ts
  - web/scripts/delete-letter-data-by-email.ts
autonomous: true
requirements:
  - QUICK-261023-ilb

estimate:
  tokens: 15000
  raw_tokens: 15000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "getHeroReviews returns [] when the featured query returns an error, when the call throws, and when no featured review with a non-empty body remains; it never returns hard-coded reviews"
    - "The landing review strip hides in all three cases, because web/src/app/page.tsx only renders ReviewMarquee when heroReviews.length > 0 (unchanged, pre-c8d6b18 behaviour)"
    - "No file under web/src or web/scripts contains real reviewer names, places, review UUIDs or review text as source code; the hard-coded review list file is deleted from HEAD"
    - "The four files are byte-identical to their state in c8d6b18^ (c8d6b18 undone exactly, no other edits); git history is not rewritten and nothing is pushed"
    - "Thomas's uncommitted change in web/src/components/MdbLookupCard.tsx is untouched: still modified in the working tree, never staged, never part of the commit"
  artifacts:
    - path: "web/src/lib/reviews/getHeroReviews.ts"
      provides: "Hero review fetch that returns an empty list on error or empty result"
      contains: "return [];"
    - path: "web/src/__tests__/getHeroReviews.test.ts"
      provides: "Jest coverage expecting [] for query error and for no featured reviews"
      contains: "resolves.toEqual([])"
    - path: "web/scripts/delete-letter-data-by-email.ts"
      provides: "Deletion script without the manual source-file removal note"
  key_links:
    - from: "web/src/app/page.tsx"
      to: "web/src/lib/reviews/getHeroReviews.ts"
      via: "getHeroReviews() result gates the strip via heroReviews.length > 0"
      pattern: "heroReviews.length > 0"
---

<objective>
Undo commit c8d6b18 exactly: delete the hard-coded hero review list, restore getHeroReviews, its tests and the deletion script to their state in c8d6b18^, and commit locally.

Purpose: The GitHub repo tholo91/brief-nach-berlin is public. c8d6b18 put six real, consented hero reviews (first names, places, Supabase review UUIDs, free text) into source code. The users consented to display on the website, not to publication in a public repo, and the file created a manual deletion duty in the deletion script. Target behaviour is the pre-c8d6b18 one: on a Supabase error or with no featured reviews the strip simply hides (lean principle: rare failures degrade cleanly instead of getting special logic).

Output: One local commit touching exactly the four files in files_modified. No push, no history rewrite.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/lib/reviews/getHeroReviews.ts
@web/src/__tests__/getHeroReviews.test.ts

Facts verified during planning (2026-10-23):
- c8d6b18 added exactly one file (`git diff --name-only --diff-filter=A c8d6b18^ c8d6b18` prints one path) and modified exactly three: web/scripts/delete-letter-data-by-email.ts, web/src/__tests__/getHeroReviews.test.ts, web/src/lib/reviews/getHeroReviews.ts.
- None of the four files changed between c8d6b18 and HEAD (`git diff --quiet c8d6b18 HEAD -- <4 files>` exits 0), so restoring them from c8d6b18^ is an exact revert.
- web/src/app/page.tsx line 49 renders the strip only when `heroReviews.length > 0`; HeroReviewStack also returns null on an empty list. No UI change is needed.
- `git status --porcelain` shows only ` M web/src/components/MdbLookupCard.tsx` (unstaged, belongs to Thomas).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Restore pre-c8d6b18 state of hero reviews and commit locally</name>
  <files>web/src/lib/reviews/getHeroReviews.ts, web/src/lib/reviews/fallbackReviews.ts, web/src/__tests__/getHeroReviews.test.ts, web/scripts/delete-letter-data-by-email.ts</files>
  <precondition>The three modified files are unchanged since c8d6b18 and nothing under the touched directories is dirty: `git diff --quiet c8d6b18 HEAD -- web/src/lib/reviews/getHeroReviews.ts web/src/__tests__/getHeroReviews.test.ts web/scripts/delete-letter-data-by-email.ts` exits 0 and `git status --porcelain -- web/src/lib/reviews web/src/__tests__ web/scripts` prints nothing. Halt and report if either fails.</precondition>
  <action>
Work from the repo root. This is a pure undo of c8d6b18; write no new logic, comments or tests.

1. Restore the three modified files to their c8d6b18^ content in index and working tree with `git restore --source=c8d6b18^ --staged --worktree -- web/src/lib/reviews/getHeroReviews.ts web/src/__tests__/getHeroReviews.test.ts web/scripts/delete-letter-data-by-email.ts`. Result: getHeroReviews returns `[]` on query error, on thrown error and when the filtered featured list is empty (pickBalancedReviews result returned directly); its doc comment no longer mentions a fallback; the test file no longer imports the hard-coded list and its two affected cases are named "does not fall back to non-featured reviews when none are featured" and "returns no reviews when the featured query fails" and expect `[]`; the deletion script no longer prints the note about removing a review from a source file.
2. Delete the file c8d6b18 added (the hard-coded review list under web/src/lib/reviews/, fourth path in files) with `git rm -- "$(git diff --name-only --diff-filter=A c8d6b18^ c8d6b18)"`. Do not reference the deleted module name anywhere else.
3. Do NOT use `git revert` (it leaves sequencer state and a mixed index), `git stash`, `git add -A`, `git add .`, `git commit -a`, or any command that touches web/src/components/MdbLookupCard.tsx. That file is Thomas's uncommitted work and must stay modified and unstaged.
4. Run the verification below. If jest crashes with an "alias" error or git reports invalid objects, the cause is iCloud-evicted (dataless) files: run `brctl download <path>` on the affected file and retry; do not change code to work around it.
5. Assert the staged set is exactly the four files: `git diff --cached --name-only | sort` must equal the four paths from files_modified (sorted), and `git diff --cached --name-only` must not list MdbLookupCard.tsx.
6. Commit with an explicit pathspec so nothing else can slip in: `git commit -m "<msg>" -- web/src/lib/reviews/getHeroReviews.ts web/src/__tests__/getHeroReviews.test.ts web/scripts/delete-letter-data-by-email.ts` plus the deleted path from step 2 (`git diff --name-only --diff-filter=A c8d6b18^ c8d6b18`). Commit message, German, no em dashes: subject `revert(reviews): feste Review-Liste entfernt, Review-Streifen blendet bei Fehler wieder aus`; body `Macht c8d6b18 rückgängig. Echte Vornamen, Orte und Review-Texte gehören nicht in das öffentliche Repo, und die Datei hätte bei jeder Löschanfrage Handarbeit verlangt. Bei Supabase-Fehler oder ohne Featured-Reviews liefert getHeroReviews wieder [] und der Streifen blendet aus.` followed by a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
7. Do not push. Do not rewrite history (no rebase, amend of older commits, filter-repo or force-push); c8d6b18 stays in history by decision.
  </action>
  <verify>
    <automated>(cd web && npx jest getHeroReviews) && (cd web && npx tsc --noEmit) && ! grep -rn "FALLBACK_HERO_REVIEWS\|fallbackReviews" web/src web/scripts && test ! -e web/src/lib/reviews/fallbackReviews.ts && git diff --quiet c8d6b18^ HEAD -- web/src/lib/reviews/getHeroReviews.ts web/src/lib/reviews/fallbackReviews.ts web/src/__tests__/getHeroReviews.test.ts web/scripts/delete-letter-data-by-email.ts && HEAD_FILES="$(git show --name-only --format= HEAD)" && test "$(printf '%s\n' "$HEAD_FILES" | sort | tr '\n' ' ')" = "web/scripts/delete-letter-data-by-email.ts web/src/__tests__/getHeroReviews.test.ts web/src/lib/reviews/fallbackReviews.ts web/src/lib/reviews/getHeroReviews.ts " && test "$(git status --porcelain)" = " M web/src/components/MdbLookupCard.tsx"</automated>
  </verify>
  <done>getHeroReviews jest suite green with `[]` expectations; tsc clean; grep for the hard-coded list's identifiers in web/src and web/scripts finds nothing; the four paths match c8d6b18^ exactly at HEAD; HEAD commit contains exactly those four paths; working tree shows only Thomas's unstaged MdbLookupCard.tsx change; nothing pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| repo source -> public GitHub | Everything committed to main is world-readable in the public repo tholo91/brief-nach-berlin |
| Supabase reviews -> landing page | Consented reviews are meant to reach visitors only via the live DB query |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261023-ilb-01 | Information Disclosure | hard-coded review list under web/src/lib/reviews/ | high | mitigate | Delete the file and all imports at HEAD (Task 1 steps 1-2); verify gate greps web/src and web/scripts for its identifiers and asserts the file is absent |
| T-261023-ilb-02 | Information Disclosure | git history of c8d6b18 in the public repo | medium | accept | Lead decision: no history rewrite, force-push to main is forbidden. Residual exposure is reported to Thomas in the SUMMARY so he can decide separately |
| T-261023-ilb-03 | Repudiation | DSGVO deletion requests | low | mitigate | With the list gone, deleting a review row in Supabase removes it from the site again; the manual source-file note in the deletion script is removed with the restore |
| T-261023-ilb-04 | Tampering | Thomas's uncommitted MdbLookupCard.tsx | medium | mitigate | No revert/stash/add-all; pathspec-limited commit; verify asserts `git status --porcelain` still shows only that file as unstaged-modified |
| T-261023-ilb-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs in this plan |
</threat_model>

<verification>
- `(cd web && npx jest getHeroReviews)` green
- `(cd web && npx tsc --noEmit)` clean
- `grep -rn "FALLBACK_HERO_REVIEWS\|fallbackReviews" web/src web/scripts` prints nothing
- `git show --stat HEAD` lists exactly the four files; `git status --porcelain` shows only ` M web/src/components/MdbLookupCard.tsx`
- `git log origin/main..HEAD` shows the new commit as local only (not pushed)
</verification>

<success_criteria>
- Review strip hides on Supabase error or when no featured reviews exist (getHeroReviews returns `[]`)
- No real reviewer data in source code at HEAD
- Exact undo of c8d6b18, one local commit, Thomas's working-tree change untouched, nothing pushed
</success_criteria>

<output>
Create `.planning/quick/261023-ilb-fallback-reviews-entfernen-review-streif/261023-ilb-SUMMARY.md` when done. Include the commit hash, the verification output, and the residual note that c8d6b18 (with the six reviews) remains readable in the public git history.
</output>
