---
phase: quick-261022-qdd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/app/(site)/brief/anpassen/VariantForm.tsx
  - web/src/lib/generation/generateLetterVariant.ts
  - web/src/__tests__/generateLetterVariantPrompt.test.ts
autonomous: true
requirements:
  - QUICK-261022-qdd

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "On /brief/anpassen the preset row still has 5 chips; the third chip is 'Einfache Worte' (same position as the removed preset 'Eigene Worte behalten'), and clicking it adds the bullet '- Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen.' to the change request field through the unchanged toggleChangePreset logic (D-01)"
    - "That preset text reaches Mistral inside <aenderungswunsch>, and VARIANT_SYSTEM_PROMPT tells the model to replace Fachwörter and Fremdwörter with simple words and split long sentences when the change request asks for everyday language, while the Sachverhalte stay the same (D-01)"
    - "Every variant request, with or without change request and at every tone level, sends the rule block 'Eigene Stimme bleibt': personal opinions and judgements (also about the recipient) stay in content and as literally as possible, gender-inclusive forms stay as written, deliberately set sentences such as an own closing sentence only change when the change request asks, and the variant keeps the original's address form (Du or Sie, Sie when none is recognisable) with precedence over <tonalitaet> (D-03, D-05)"
    - "VARIANT_SYSTEM_PROMPT no longer forces a formal letter in Sie-Form and no longer invites shortening, smoothing or sharpening language; the rest of the existing rules (facts, demand, salutation, closing, tone ceiling, no dashes, JSON format) is unchanged (D-04)"
    - "Main letter generation is untouched: web/src/lib/generation/generateLetter.ts (including tonalityBlock and its tone-5 Du-Form ban) has no diff; the precedence is resolved only in the variant system prompt (D-05)"
    - "No real Mistral call happens anywhere: tests mock @/lib/mistral, no script calls generateLetter or generateLetterVariant; no new dependency; nothing is pushed (D-02, D-07)"
  artifacts:
    - path: "web/src/app/(site)/brief/anpassen/VariantForm.tsx"
      provides: "CHANGE_PRESETS with 'Einfache Worte' in third position, old keep-own-words preset removed"
      contains: "label: \"Einfache Worte\""
    - path: "web/src/lib/generation/generateLetterVariant.ts"
      provides: "VARIANT_SYSTEM_PROMPT with simple-language rule, rule block 'Eigene Stimme bleibt', address-form precedence over <tonalitaet>, conflicting phrasing removed"
      contains: "Eigene Stimme bleibt"
    - path: "web/src/__tests__/generateLetterVariantPrompt.test.ts"
      provides: "Tests for the preset (source read of VariantForm.tsx), its path into <aenderungswunsch>, the new rule block, removed phrasing, precedence and no dash characters"
      contains: "Einfache Worte"
  key_links:
    - from: "CHANGE_PRESETS in web/src/app/(site)/brief/anpassen/VariantForm.tsx"
      to: "buildVariantUserPrompt in web/src/lib/generation/generateLetterVariant.ts"
      via: "toggleChangePreset -> changeRequest state -> setPendingLetterVariantSubmission -> /api/generate-letter-variant -> generateLetterVariant({ changeRequest }) -> <aenderungswunsch> block (all existing wiring, unchanged)"
      pattern: "toggleChangePreset\\(preset\\.text\\)"
    - from: "VARIANT_SYSTEM_PROMPT"
      to: "Mistral system message"
      via: "requestVariantCompletion sends { role: \"system\", content: VARIANT_SYSTEM_PROMPT } on first call and length retry (existing, unchanged)"
      pattern: "content: VARIANT_SYSTEM_PROMPT"
    - from: "tonalityBlock(toneLevel) in web/src/lib/generation/generateLetter.ts (shared, unchanged)"
      to: "Address-form precedence sentence in VARIANT_SYSTEM_PROMPT"
      via: "System prompt states that the original's address form takes precedence over <tonalitaet>, so tone 5 'verboten: ... Du-Form' does not rewrite a Du letter"
      pattern: "Vorrang vor <tonalitaet>"
---

<objective>
Brief anpassen (/brief/anpassen) keeps the writer's own voice by default and offers a one-click "Einfache Worte" preset. Source: todo `.planning/todos/pending/2026-10-21-variant-flow-eigene-stimme-und-einfache-worte.md` (HeySpeak feedback: the rewrite removes own opinions, gendering, Du-Form and own closing sentences; wish for simpler language).

Locked decisions from the orchestrator, referenced below as D-01 to D-07:
- D-01 (decision 1A): Replace the preset "Eigene Worte behalten" in CHANGE_PRESETS with label "Einfache Worte", text "Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen." The own-voice rule then applies always in the prompt (D-03), not only via a chip.
- D-02 (decision 2B): No real Mistral run. Only Jest tests with `@/lib/mistral` mocked. Never call real generateLetter or generateLetterVariant.
- D-03: New rule block "Eigene Stimme bleibt" in VARIANT_SYSTEM_PROMPT: (a) personal opinions and judgements incl. about the recipient stay, (b) gender-inclusive forms stay, (c) deliberately set sentences like an own closing sentence only change if the change request asks, (d) keep the original's address form Sie or Du, otherwise Sie. Formulated positively, not as a list of prohibitions (project prompt style).
- D-04: Remove or adjust conflicting phrasing in VARIANT_SYSTEM_PROMPT (the "shorten, smooth or sharpen language" sentence and the forced formal Sie-Form line).
- D-05: The original's address form takes precedence over the tone level. tonalityBlock in generateLetter.ts bans Du-Form at tone 5; resolve precedence in the variant prompt only, generateLetter.ts stays unchanged.
- D-06: Check whether anything else references the removed preset (tests, analytics labels) and update.
- D-07: Do not push. No new dependencies. German copy, no em or en dashes.

Claude's discretion (documented in the tasks): one positive simple-language sentence in VARIANT_SYSTEM_PROMPT so the new chip works against "Erhalte ... konkrete Sachverhalte"; a closing line in the D-03 block that an explicit change request may override the block; the preservation_check JSON hint names address form and own judgements as a self-check; the chip keeps the third position.

Purpose: Users who revise their letter keep what makes it theirs, which is the most frequent complaint in the HeySpeak export (about 6 of 65 answers). Users without political experience get plain language in one click.
Output: Updated preset list, updated variant system prompt, extended Jest coverage. Locally committed, not pushed.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.planning/todos/pending/2026-10-21-variant-flow-eigene-stimme-und-einfache-worte.md
@web/src/lib/generation/generateLetterVariant.ts
@web/src/app/(site)/brief/anpassen/VariantForm.tsx
@web/src/__tests__/generateLetterVariantPrompt.test.ts

<interfaces>
Facts the planner verified, so the executor does not need to search:

- CHANGE_PRESETS is a const array at web/src/app/(site)/brief/anpassen/VariantForm.tsx lines ~16-22 with 5 entries `{ label, text }`. The entry to replace is the third one (line ~19). The chips render at ~283-302 via `CHANGE_PRESETS.map`, active state is `changeRequest.includes(preset.text)`, click calls `toggleChangePreset(preset.text)` (~123-136), which adds or removes a line `- ${text}`. All 5 preset texts together stay far below the changeRequest max of 1000 chars (web/src/lib/validation/wizardSchemas.ts ~57-60).
- Reference check for D-06 (grep over web/src, web/scripts, .planning): the old label and its text appear only in VariantForm.tsx and in the source todo. No test, no analytics call (no track() in web/src/app/(site)/brief/anpassen/), no email or SEO copy references them. web/src/app/(site)/brief-verbessern/page.tsx contains "durchgehend Sie-Form" in a separate copy-paste prompt for external chatbots; that is a different feature and stays unchanged (mention as follow-up only).
- VARIANT_SYSTEM_PROMPT (generateLetterVariant.ts ~31-58) is a template string with a "Nicht verhandelbare Regeln:" bullet list, then the JSON answer format with a preservation_check hint. Lines touched by this plan: "Verändere nur Tonalität, Formulierungen, Klarheit, Satzbau und bei Bedarf die Struktur." (~41, keep), "Behalte etwa 70 bis 90 Prozent ... Kürze, glätte oder schärfe Sprache, aber tausche die Substanz nicht aus." (~49), "Der Brief bleibt ein formeller Brief in Sie-Form." (~52, last bullet), and the preservation_check hint (~55).
- buildVariantUserPrompt (~60-82) puts `tonalityBlock(toneLevel)` into <tonalitaet> and the trimmed changeRequest into <aenderungswunsch>. It needs no change.
- tonalityBlock(level) is exported from web/src/lib/generation/generateLetter.ts (~73-78); TONE_REGISTERS[5].verboten is "Beleidigungen, Unterstellungen, Pauschalurteile, Du-Form. ..." (~67). Main letter generation also uses it. Do not edit this file (D-05).
- Existing test web/src/__tests__/generateLetterVariantPrompt.test.ts mocks @/lib/mistral at the top (mistral.chat.complete as jest.fn, withMistralRetry passthrough). Its first test asserts these system prompt fragments, which must keep passing: "bereits fertigen politischen Brief", "keine neuen Fakten", "Empfängeranrede", "Grußformel", "derselben Grußformel und derselben Namenszeile", the quoted Mit-freundlichen-Grüßen line, "keine neue lokale Lage", "so hoch wie nie", "Tonalität als Obergrenze", "Verrat", "dramatischen Zuspitzungen".
- Source-reading tests are an established pattern here: web/src/__tests__/landingPageContent.test.ts uses `readFileSync(join(process.cwd(), "src/..."), "utf8")` from node:fs and node:path. Jest runs from web/ (testMatch `**/src/__tests__/**/*.test.ts`, node environment), so a .tsx client component cannot be rendered, only read as source.
- `cd web && npx jest generateLetterVariant` matches generateLetterVariantPrompt.test.ts and generateLetterVariantRoute.test.ts; the route test does not assert prompt text.
- None of the three files contains em or en dash characters today.
- If jest crashes with odd module or "alias" errors, check for iCloud-evicted (dataless) files first (project memory: fix with brctl download per file) before changing code.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer "Einfache Worte" end to end: chip on /brief/anpassen, change request, variant prompt</name>
  <files>web/src/app/(site)/brief/anpassen/VariantForm.tsx, web/src/lib/generation/generateLetterVariant.ts, web/src/__tests__/generateLetterVariantPrompt.test.ts</files>
  <read_first>web/src/app/(site)/brief/anpassen/VariantForm.tsx (lines 1-25 and 120-140, 280-305), web/src/lib/generation/generateLetterVariant.ts (lines 31-82), web/src/__tests__/generateLetterVariantPrompt.test.ts, web/src/__tests__/landingPageContent.test.ts (lines 1-5 and 77-85 for the readFileSync pattern)</read_first>
  <behavior>
    - Test A (source read of VariantForm.tsx): contains `label: "Einfache Worte"` and the exact text "Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen."; does not contain "Eigene Worte behalten" and does not contain "Gute eigene Formulierungen"; still contains the other four labels "Klingt nach mir", "Anliegen im Zentrum", "Nur sichere Fakten", "Klarer roter Faden" (D-01, D-06).
    - Test B: buildVariantUserPrompt with a 500+ character letter and changeRequest set to "- " plus the exact preset text returns a prompt whose <aenderungswunsch> block (slice between the opening and closing tag) contains the preset text (D-01).
    - Test C: VARIANT_SYSTEM_PROMPT contains "Alltagssprache" and "Fachwörter und Fremdwörter durch einfache Wörter" (D-01, discretion).
    - All three tests fail before the change (RED), pass after (GREEN). Mistral stays mocked by the existing jest.mock at the top of the file (D-02).
  </behavior>
  <action>
UI skill note (project rule: frontend edits go through a UI skill): this task changes one label/text pair inside the existing CHANGE_PRESETS array, no markup, layout or styling. Before editing VariantForm.tsx, run the `design-taste-frontend` (or `frontend-design:frontend-design`) checklist only to confirm the label "Einfache Worte" fits the existing chip row on a 375px screen (5 chips, flex-wrap, min-h 40px). Do not restyle anything.

1. RED: In web/src/__tests__/generateLetterVariantPrompt.test.ts add a new `describe("Einfache Worte preset", ...)` with Tests A, B and C from the behavior block. For Test A read the component source with readFileSync and join from node:fs and node:path, path `src/app/(site)/brief/anpassen/VariantForm.tsx` relative to process.cwd(), same pattern as landingPageContent.test.ts. Keep the preset text in one test-local constant and reuse it in A and B. Run `cd web && npx jest generateLetterVariantPrompt` and confirm the new tests fail. Commit the failing tests.

2. GREEN, VariantForm.tsx (per D-01): replace the third CHANGE_PRESETS entry in place (same position, so the chip order stays: Klingt nach mir, Anliegen im Zentrum, Einfache Worte, Nur sichere Fakten, Klarer roter Faden). New entry: label "Einfache Worte", text "Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen." Use the copy verbatim. Do not touch toggleChangePreset, the chip markup or the placeholder.

3. GREEN, generateLetterVariant.ts (Claude's discretion, supports D-01): in VARIANT_SYSTEM_PROMPT add one bullet directly after the bullet "Verändere nur Tonalität, Formulierungen, Klarheit, Satzbau und bei Bedarf die Struktur." with this exact text: "Wenn <aenderungswunsch> Alltagssprache oder einfache Wörter verlangt, ersetze Fachwörter und Fremdwörter durch einfache Wörter und teile lange Sätze. Die Sachverhalte bleiben dieselben." Reason: the existing rule "Erhalte ... konkrete Sachverhalte" otherwise lets template jargon survive (todo, section Ursache). Positive wording, no dash characters.

4. D-06 re-check: run `grep -rn "Eigene Worte behalten" web/src web/scripts` and `grep -rn "Gute eigene Formulierungen" web/src web/scripts` from repo root; the only hits allowed are inside the new test assertions. If anything else shows up (test, analytics label, copy), update it to the new preset and note it in the SUMMARY.

5. Run the verify command, then commit locally (no push, D-07).
  </action>
  <verify>
    <automated>cd web && npx jest generateLetterVariant && npx eslint "src/app/(site)/brief/anpassen/VariantForm.tsx" && grep -c 'label: "Einfache Worte"' "src/app/(site)/brief/anpassen/VariantForm.tsx"</automated>
  </verify>
  <acceptance_criteria>
    - `cd web && npx jest generateLetterVariant` passes, including Tests A, B, C.
    - `grep -c 'label: "Einfache Worte"' "web/src/app/(site)/brief/anpassen/VariantForm.tsx"` returns 1.
    - `grep -c "Alltagssprache oder einfache Wörter verlangt" web/src/lib/generation/generateLetterVariant.ts` returns 1.
    - ESLint on VariantForm.tsx reports no errors.
  </acceptance_criteria>
  <done>The chip "Einfache Worte" is the third preset on /brief/anpassen, its text lands in <aenderungswunsch>, the system prompt knows how to apply it, the old preset is gone everywhere outside the test assertions, and the tests prove all three. Committed locally.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Rule block "Eigene Stimme bleibt" with address-form precedence, conflicting phrasing removed</name>
  <files>web/src/lib/generation/generateLetterVariant.ts, web/src/__tests__/generateLetterVariantPrompt.test.ts</files>
  <read_first>web/src/lib/generation/generateLetterVariant.ts (lines 31-58 after Task 1), web/src/lib/generation/generateLetter.ts (lines 36-78, read only, do not edit)</read_first>
  <behavior>
    - Test D: VARIANT_SYSTEM_PROMPT contains "Eigene Stimme bleibt", "über die Empfängerin oder den Empfänger", "Autofahrende", "Bürger*innen", "eigener Schlusssatz", "Anredeform des bestehenden Briefs", "Du-Form bleibt Du-Form", "Vorrang vor <tonalitaet>" (D-03, D-05).
    - Test E: VARIANT_SYSTEM_PROMPT does not contain "formeller Brief in Sie-Form" and does not contain "glätte" (D-04).
    - Test F: buildVariantUserPrompt with toneLevel 5 still contains "Du-Form" inside <tonalitaet> (shared tonalityBlock unchanged), proving the precedence lives in the system prompt only (D-05).
    - Test G: VARIANT_SYSTEM_PROMPT matches neither the em dash nor the en dash character (assert with a regex built from the unicode escapes u2014 and u2013) (D-07).
    - Existing first test ("frames the task as rewriting an existing letter") stays green unchanged.
  </behavior>
  <action>
1. RED: add Tests D to G from the behavior block to web/src/__tests__/generateLetterVariantPrompt.test.ts in a new `describe("Eigene Stimme bleibt", ...)`. Run `cd web && npx jest generateLetterVariantPrompt` and confirm D and E fail (F and G may already pass; they guard regressions). Commit the failing tests.

2. GREEN, VARIANT_SYSTEM_PROMPT in web/src/lib/generation/generateLetterVariant.ts:

   a. Per D-04, change the bullet that starts "Behalte etwa 70 bis 90 Prozent" so its second sentence becomes: "Überarbeite die Sprache im Rahmen von <tonalitaet> und <aenderungswunsch>, die Substanz bleibt dieselbe." The first sentence stays as it is. The words for shortening, smoothing and sharpening language disappear from this bullet.

   b. Per D-04 and D-05, delete the last bullet of the list that forces a formal letter in Sie-Form. The address-form rule in step c replaces it.

   c. Per D-03 and D-05, insert a new block after the "Nicht verhandelbare Regeln:" list and before "Antworte ausschließlich im JSON-Format:", separated by one blank line on each side, in the same plain style as the existing list. Use this exact German copy, one line each:
      Header line: "Eigene Stimme bleibt:"
      Intro line: "Der Brief gehört der Person, die ihn abschreibt und unterschreibt. Die Variante klingt weiter nach ihr."
      Bullet (a): "Persönliche Meinungen und Wertungen bleiben inhaltlich und möglichst wörtlich stehen, auch Wertungen über die Empfängerin oder den Empfänger."
      Bullet (b): "Gendergerechte Formen wie \"Autofahrende\" oder \"Bürger*innen\" bleiben genau so geschrieben." (inner quotes as plain double quotes inside the template string, same as the existing "Mit freundlichen Grüßen" bullet)
      Bullet (c): "Erkennbar bewusst gesetzte Sätze, zum Beispiel ein eigener Schlusssatz, bleiben wörtlich stehen. Sie ändern sich nur, wenn <aenderungswunsch> das verlangt."
      Bullet (d): "Die Variante übernimmt die Anredeform des bestehenden Briefs: Du-Form bleibt Du-Form, Sie-Form bleibt Sie-Form. Ist keine Anredeform erkennbar, schreibe in Sie-Form."
      Bullet (precedence, D-05): "Die Anredeform des bestehenden Briefs hat Vorrang vor <tonalitaet>, auch wenn die Tonstufe die Du-Form ausschließt."
      Bullet (override, Claude's discretion): "Was <aenderungswunsch> ausdrücklich ändern will, setzt du um, auch wenn es diese Punkte betrifft."
      All bullets use the existing "- " prefix. Positive wording throughout (project prompt style: positive directives, no new prohibition list). No em or en dash characters.

   d. Claude's discretion: change the preservation_check hint in the JSON answer format to "<ein Satz, dass Fakten, Forderung, Anrede, Anredeform, eigene Wertungen und Grußformel erhalten blieben>". The JSON keys and parsing stay unchanged.

   e. Do not edit web/src/lib/generation/generateLetter.ts, buildVariantUserPrompt, the frame-preserving helpers or any runtime logic (D-05). This task is prompt text only.

3. Run the verify command. Do not run any script or test that calls real Mistral (D-02). Commit locally, no push (D-07).
  </action>
  <verify>
    <automated>cd web && npx jest generateLetterVariant && git diff --quiet HEAD -- src/lib/generation/generateLetter.ts && grep -c "Eigene Stimme bleibt" src/lib/generation/generateLetterVariant.ts</automated>
  </verify>
  <acceptance_criteria>
    - `cd web && npx jest generateLetterVariant` passes, including Tests D to G and all pre-existing tests in both matched files.
    - `git diff --quiet origin/main -- web/src/lib/generation/generateLetter.ts` exits 0 after both tasks are committed (no change to main letter generation).
    - `grep -c "Vorrang vor <tonalitaet>" web/src/lib/generation/generateLetterVariant.ts` returns 1.
    - `grep -c "Anredeform, eigene Wertungen" web/src/lib/generation/generateLetterVariant.ts` returns 1.
  </acceptance_criteria>
  <done>Every variant request carries the "Eigene Stimme bleibt" block with the Du/Sie precedence over the tone level, the conflicting phrasing is gone, generateLetter.ts is untouched, and the Jest suite for the variant flow is green with Mistral mocked. Committed locally.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser (/brief/anpassen) -> /api/generate-letter-variant | Untrusted original letter and change request (preset text plus free text) cross here; existing Zod schema limits length |
| Next.js server -> Mistral | Prompt with user text goes to the pay-per-use model; quota of 15 requests per minute is shared with the live site |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-qdd-01 | Tampering | changeRequest / originalLetter into VARIANT prompt (prompt injection) | low | accept | Blast radius is the user themselves: the variant goes only to their own email address, and the project decision is no input moderation or XML escaping on the letter pipeline. The new override bullet only lets the user's explicit wish change their own letter. Existing Zod limits (letter 500 to 10000 chars, change request max 1000) stay unchanged |
| T-qdd-02 | Denial of service | Shared Mistral quota (15 per minute for mistral-large) | medium | mitigate | D-02: tests mock @/lib/mistral via the existing jest.mock in generateLetterVariantPrompt.test.ts; no real generateLetter or generateLetterVariant call from tests or scripts; the plan adds no Mistral call path |
| T-qdd-03 | Information disclosure | Prompt and logs | low | accept | No new data is collected, stored or logged; preservation_check text is model output about the letter only, handled as before |
| T-qdd-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan (D-07: no new dependency); nothing to audit |
</threat_model>

<verification>
Run from repo root after both tasks:
- `cd web && npx jest` (full suite green; on odd module or "alias" crashes check iCloud-evicted files first)
- `cd web && npx tsc --noEmit -p .`
- `cd web && npm run lint`
- `git diff --stat origin/main -- web/package.json web/package-lock.json` shows no change (no new dependency)
- `git diff --stat origin/main -- web/src/lib/generation/generateLetter.ts` shows no change
- `git status --short` is clean apart from planning artifacts; `git log origin/main..HEAD --oneline` lists only this plan's commits; nothing pushed
- No real Mistral call was made during execution (only mocked Jest runs)
</verification>

<success_criteria>
- /brief/anpassen shows the chip "Einfache Worte" in third position; clicking it writes the locked text into the change request field.
- A variant request for a letter in Du-Form, with gender-inclusive forms and a personal opinion about the recipient, is sent with explicit instructions to keep all three, also at tone level 5 (prompt level, verified by tests; model behavior not verified per D-02).
- The variant prompt no longer forces Sie-Form or invites smoothing language.
- Main letter generation unchanged. Jest, tsc and lint green. Nothing pushed.
</success_criteria>

<output>
Create `.planning/quick/261022-qdd-brief-anpassen-beh-lt-eigene-stimme-knop/261022-qdd-SUMMARY.md` when done. Include:
- What changed in the prompt (block text as shipped) and the chip list in order.
- Result of the D-06 reference check (expected: only VariantForm.tsx and the todo).
- Verification gap, stated plainly: per D-02 there was no real Mistral run, so it is unverified whether the model actually keeps Du-Form, gendering and own opinions. The todo's first "Fertig, wenn" item (real run with 3 letters) stays open by decision; Thomas observes HeySpeak feedback after the push instead.
- Push status: not pushed; Thomas pushes manually (push to main = production).
- Separate follow-up options, not done here: (1) web/src/app/(site)/brief-verbessern/page.tsx still tells external chatbots "durchgehend Sie-Form"; (2) extractSalutation in generateLetterVariant.ts only restores "Sehr geehrte"/"Guten Tag" salutations, so a dropped Du salutation like "Lieber ..." is not restored by code; (3) the "70 bis 90 Prozent" rule still allows dropping own additions (feedback 09.10.).
</output>
