---
phase: quick-261021-kcm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/wizard/Step3Success.tsx
  - web/src/__tests__/successPageExperience.test.ts
autonomous: true
requirements:
  - QUICK-261021-kcm

estimate:
  tokens: 25000
  raw_tokens: 25000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A non-JSON HTTP 504 from /api/generate-letter (Vercel FUNCTION_INVOCATION_TIMEOUT at maxDuration = 60) leaves generationMayHaveSucceeded false, so the success page shows the 'Brief konnte nicht erstellt werden' state with the 'Nochmal versuchen' button instead of 'Die Verbindung ist abgebrochen / Dein Brief ist sehr wahrscheinlich trotzdem fertig geworden'"
    - "Every other non-JSON 5xx (500, 502, 503, ...) keeps today's conservative behavior: generationMayHaveSucceeded true, no retry button, because letter delivery is not idempotent (commit 7a69cdf)"
    - "JSON error bodies keep the existing retryIsSafe rule (status < 500 or retrySafe === true) unchanged; network errors and lost connections keep their existing handling unchanged"
    - "No user-facing copy changes; no em dashes in any added line"
    - "Only the two listed files change; CLAUDE.md, AGENTS.md, .planning/research/2026-10-19-mistral-rate-limit.md and .planning/todos/pending/2026-10-20-kampagnen-verlauf-echte-briefzahlen.md stay unstaged and untouched; nothing is pushed"
  artifacts:
    - path: "web/src/components/wizard/Step3Success.tsx"
      provides: "Non-JSON error branch that treats 504 as retry-safe"
      contains: "setGenerationMayHaveSucceeded(res.status >= 500 && res.status !== 504)"
    - path: "web/src/__tests__/successPageExperience.test.ts"
      provides: "Source-string regression test for the 504 handling"
      contains: "res.status !== 504"
  key_links:
    - from: "web/src/components/wizard/Step3Success.tsx (non-JSON catch branch, ~line 621-624)"
      to: "web/src/components/wizard/Step3Success.tsx ({!generationMayHaveSucceeded && ( ~line 1073, 'Nochmal versuchen' button)"
      via: "generationMayHaveSucceeded state"
      pattern: "setGenerationMayHaveSucceeded\\(res.status >= 500 && res.status !== 504\\)"
    - from: "web/src/app/api/generate-letter/route.ts (maxDuration = 60 line 42, after() mail send ~line 355)"
      to: "web/src/components/wizard/Step3Success.tsx (504 = not created)"
      via: "Mail only goes out in after(), which never runs when Vercel kills the function before the handler returns"
      pattern: "after\\(async"
---

<objective>
Fix the success page so a Vercel timeout (HTTP 504, non-JSON body, after 60 s) is treated as "Brief wurde nicht erstellt" and the user gets the "Nochmal versuchen" button.

Purpose: In the Mistral outage on 2026-10-21 (10:35-11:00 Berlin) two users hit a 504 after 60.1 s / 60.3 s. The UI told them their letter was "sehr wahrscheinlich trotzdem fertig" and hid the retry button, but Brevo shows no letter mail was sent. A 504 means the function was killed at maxDuration before returning, so the after() block that sends the letter mail never ran. Retry is safe for 504 only.

Output: one-line logic change plus a short German comment in Step3Success.tsx, one new source-string test in successPageExperience.test.ts.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/components/wizard/Step3Success.tsx
@web/src/__tests__/successPageExperience.test.ts

Verified facts (from orchestrator investigation, do not re-investigate):
- web/src/app/api/generate-letter/route.ts line 42: `export const maxDuration = 60;`. The route itself never returns a 504 (grep confirms no 504 in the route), so any 504 the browser sees is Vercel's non-JSON FUNCTION_INVOCATION_TIMEOUT page and lands in the catch branch, not the JSON branch.
- route.ts ~line 355: the letter mail is sent only inside `after(async () => { ... sendLetterEmail ... })`, registered right before the 200 JSON return. Killed at maxDuration = handler never returned = after() never ran = no mail.
- Step3Success.tsx current non-JSON branch (~line 621-624): a `catch {` with the comment "Body nicht lesbar (z.B. HTML-Errorpage) - Status reicht." followed by `setGenerationMayHaveSucceeded(res.status >= 500);`.
- The retry button is gated by `{!generationMayHaveSucceeded && (` (~line 1073).
- Existing test "treats a lost generation response as a possible email success" (successPageExperience.test.ts ~line 70-83) does not assert the catch-branch line, so it stays green.
- Tests read source files via `join(process.cwd(), "src/...")`, so jest must run with cwd `web/`.

No UI skill (/frontend-design, /taste) needed: this is state logic only, no visual or copy change.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Treat non-JSON 504 as retry-safe on the success page, with regression test</name>
  <files>web/src/__tests__/successPageExperience.test.ts, web/src/components/wizard/Step3Success.tsx</files>
  <behavior>
    - New test "treats a Vercel 504 timeout as not created so retry stays visible": successSource contains `setGenerationMayHaveSucceeded(res.status >= 500 && res.status !== 504)`
    - Same test also asserts the retry gate still exists: successSource contains `{!generationMayHaveSucceeded && (`
    - Existing test "treats a lost generation response as a possible email success" stays green unchanged (JSON branch rule `const retryIsSafe = res.status < 500 || errBody?.retrySafe === true` untouched)
  </behavior>
  <action>
    RED: In web/src/__tests__/successPageExperience.test.ts add a new `it(...)` block directly after the existing "treats a lost generation response as a possible email success" block, named "treats a Vercel 504 timeout as not created so retry stays visible", with the two `expect(successSource).toContain(...)` assertions from the behavior list. Do not edit any existing assertion. Run the test file and confirm the new test fails.

    GREEN: In web/src/components/wizard/Step3Success.tsx, inside the `.then(async (res) => { if (!res.ok) {` block, in the `catch {` branch after the failed `res.json()`, change the single call `setGenerationMayHaveSucceeded(res.status >= 500);` to `setGenerationMayHaveSucceeded(res.status >= 500 && res.status !== 504);`. Keep the existing comment line "Body nicht lesbar (z.B. HTML-Errorpage) - Status reicht." and add directly below it a short German comment in the file's existing style (plain hyphen " - ", no em dash) saying: 504 = Vercel hat die Funktion bei maxDuration gestoppt; die Brief-Mail geht erst in after() nach der Antwort raus, also wurde nichts verschickt und ein neuer Versuch ist sicher. Wrap the comment to the surrounding line width (two `//` lines are fine).

    Do NOT change: the JSON branch (`retryIsSafe` logic), the `lastErrorRef` payload, the network-error / connectionLost handling, the `setGenerationMayHaveSucceeded(true)` call around line 688, any JSX or user-facing copy. Other non-JSON 5xx must keep returning true (retry stays hidden) because letter delivery is not idempotent since commit 7a69cdf and a retry after a real success would send a second mail.

    Tests must not call Mistral (this test only reads source strings). If jest crashes with an "alias"/read error, the cause is iCloud-evicted files: run `brctl download <file>` on the failing file and retry, do not change code for it.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/successPageExperience.test.ts</automated>
  </verify>
  <done>The new 504 test failed before the source change and passes after it; all other tests in successPageExperience.test.ts pass; Step3Success.tsx contains `setGenerationMayHaveSucceeded(res.status >= 500 && res.status !== 504)` with the German comment above it, and nothing else in the file changed.</done>
</task>

<task type="auto">
  <name>Task 2: Typecheck, lint, em-dash check, scoped commit</name>
  <files>web/src/components/wizard/Step3Success.tsx, web/src/__tests__/successPageExperience.test.ts</files>
  <action>
    Run the typecheck and lint on the two touched files (commands in verify). Check that no added diff line contains an em dash. Confirm `git status --short` shows only the two plan files as newly modified besides the four pre-existing user changes (CLAUDE.md, AGENTS.md, .planning/research/2026-10-19-mistral-rate-limit.md, .planning/todos/pending/2026-10-20-kampagnen-verlauf-echte-briefzahlen.md), which must stay unstaged.

    Stage only by explicit path: `git add web/src/components/wizard/Step3Success.tsx web/src/__tests__/successPageExperience.test.ts`. Never use `git add -A` or `git add .`. Run `git diff --cached --name-only` and confirm exactly those two paths. Commit with message `fix(erfolgsseite): HTTP 504 als nicht erstellt behandeln, Retry zeigen` and a body line explaining that a Vercel timeout at maxDuration means after() never ran and no mail went out, ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push (push to main = production deploy, Thomas releases manually).
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit -p . && npx eslint src/components/wizard/Step3Success.tsx src/__tests__/successPageExperience.test.ts && C=$(git log -1 --format=%H --grep='HTTP 504 als nicht erstellt') && test -n "$C" && F=$(git diff --name-only "$C^..$C") && test "$(echo "$F" | sort | tr '\n' ' ')" = "web/src/__tests__/successPageExperience.test.ts web/src/components/wizard/Step3Success.tsx " && D=$(git diff "$C^..$C") && test "$(echo "$D" | grep '^+' | grep -c '—')" = "0"</automated>
  </verify>
  <done>tsc and eslint exit 0; no em dash in added lines; HEAD commit contains exactly the two plan files; the four pre-existing user changes are still uncommitted and unstaged; nothing pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Vercel edge -> browser | Non-JSON 504 error page from the platform, no errorId, interpreted client-side |
| client retry -> /api/generate-letter | Retry triggers a new Mistral call and a new letter mail (not idempotent) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261021-kcm-01 | Repudiation (duplicate side effect) | Step3Success.tsx non-JSON catch branch | low | mitigate | Retry unlocked only for status 504, where the function was killed before returning and after() (sole mail sender) cannot have run; all other non-JSON 5xx keep mayHaveSucceeded true, so no duplicate mail path is opened |
| T-261021-kcm-02 | Denial of Service | /api/generate-letter during a Mistral outage | low | accept | A visible retry may add Mistral calls during an outage; existing server-side rate limit and the shared 15/min quota already bound it, and a user retry is the intended recovery |
| T-261021-kcm-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan; nothing to audit |
</threat_model>

<verification>
- `cd web && npx jest src/__tests__/successPageExperience.test.ts` green, including the new 504 test.
- `cd web && npx tsc --noEmit -p .` and eslint on both files exit 0.
- `git show --stat HEAD` lists only the two plan files; `git status --short` still shows the four pre-existing user changes; `git log origin/main..HEAD` shows the commit as unpushed.
</verification>

<success_criteria>
- Non-JSON 504 -> retry button visible, "Brief konnte nicht erstellt werden" state.
- Other non-JSON 5xx, JSON error bodies, network errors -> behavior unchanged.
- Regression test locks the 504 rule in source.
- Single scoped commit on main, not pushed.
</success_criteria>

<output>
Create `.planning/quick/261021-kcm-erfolgsseite-http-504-vercel-timeout-als/261021-kcm-SUMMARY.md` when done
</output>
