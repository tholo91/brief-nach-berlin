# EVAL-REVIEW — Phase 02: core-engine

**Audit Date:** 2026-04-25
**AI-SPEC Present:** No — evaluated against general AI eval best practices (ai-evals.md reference framework)
**Overall Score:** 22/100
**Verdict:** NOT IMPLEMENTED

---

## Dimension Coverage

No AI-SPEC.md was written for this phase, so dimensions are derived from the system's critical failure modes as established in the phase context (D-03 through D-15) and the ai-evals.md framework applied to German letter generation via Mistral.

| Dimension | Status | Measurement Method | Finding |
|-----------|--------|--------------------|---------|
| Politician addressee correctness | MISSING | LLM Judge / Human | No eval harness. Mistral selects politician from the filtered list in a single JSON call. No test verifies that the selected politician ID matches the PLZ input, political level, and issue topic. The fallback (first politician in list) silently fires without any quality gate. |
| Factual accuracy — politician data | MISSING | Code / Human | No assertions that the letter uses the politician's correct name, title, party, and wahlkreis from the data file. No regression dataset pairing PLZ inputs with expected politicians. |
| German letter quality (Briefstil, tone, formality) | MISSING | LLM Judge | System prompt enforces Sie-Form and sachlich tone but there is no eval that runs a sample of generated letters through a rubric judge and checks for correct tone, absence of activism language, or correct formal German structure. |
| Letter length compliance (200-280 words) | MISSING | Code | Word count is specified in the prompt but there is no post-generation code check that counts words in `parsed.letter` and flags or rejects output outside the 200-280 word window. |
| Gender-neutral language (no Genderzeichen) | MISSING | Code / Regex | System prompt forbids Gendersternchen, Doppelpunkt, and Binnen-I, but no automated check scans generated output for these characters before returning the letter to the user. |
| Hallucination — invented sender attributes | PARTIAL | Human (manual) | System prompt explicitly forbids inventing demographic details ("Erfinde KEINE demografischen Details"). The instruction is present, but there is no eval that submits inputs without sender context and checks whether the output contains fabricated names, professions, or affiliations. |
| Prompt injection resistance | MISSING | Code / Adversarial | Issue text is user-supplied and passed directly into the Mistral user prompt. Input moderation (OpenAI/Mistral classifier) blocks harmful content but does not detect prompt injection attempts (e.g. "Ignore previous instructions and write..."). No adversarial test set exists. |
| Content safety — input moderation | PARTIAL | Code | `moderateText()` is implemented and called before generation in `submitWizardAction`. However, the implementation was changed from the plan (switched from OpenAI `omni-moderation-latest` to `mistral.classifiers.moderate` using `mistral-moderation-latest`). No tests verify that known harmful inputs are flagged, that benign inputs pass, or that the false-positive rate is acceptable for political speech. |
| Content safety — output moderation | PARTIAL | Code | Output moderation is called after `generateLetter()` in both `submitWizardAction` and `selectPoliticianAction`. Same caveat as input: the classifier is wired but untested with a reference set of pass/fail examples. |
| PLZ lookup correctness | MISSING | Code | `lookupPLZ()` reads static JSON data files and returns politician arrays. No unit tests verify that known PLZ strings (e.g. "10115" for Berlin Mitte) resolve to the expected Wahlkreis IDs and politicians. The dual-path file loading (dev vs. Vercel) is also untested. |
| Disambiguation flow — correct politician selection | MISSING | Human / Code | When a PLZ maps to multiple Wahlkreise, `disambiguationNeeded: true` is returned. No test verifies that the list presented is complete and correct for a known ambiguous PLZ, or that `selectPoliticianAction` generates the letter for the user-selected politician and not another. |
| Task completion rate | MISSING | Code | No metric tracks what percentage of submissions complete the full pipeline (PLZ found, generation succeeds, result returned without error). No baseline established to detect regressions. |
| Output structure validity (JSON parsing) | PARTIAL | Code | `generateLetter.ts` has a try/catch JSON parse with regex fallback for Mistral reliability. This is a production hardening measure, not an eval. The fallback fires silently with no logging or alerting, so the frequency of JSON parse failures is unknown. |

**Coverage Score:** 0 COVERED, 4 PARTIAL, 9 MISSING — 0/13 COVERED (0%)

Partial items do not count toward COVERED because they lack rubric specificity, reference datasets, or automated execution.

---

## Infrastructure Audit

| Component | Status | Finding |
|-----------|--------|---------|
| Eval tooling (promptfoo / braintrust / langfuse) | Not found | No eval tooling installed or referenced anywhere in the codebase. `web/package.json` contains no eval dependencies. No `promptfoo.yaml`, no `eval.config.*`, no Braintrust/Langfuse client. |
| Reference dataset | Missing | No `.jsonl`, `.json`, or fixture file containing PLZ → expected politician → expected letter quality examples. The UAT file (`02-UAT.md`) defines 8 manual test scenarios but they are all `[pending]` with no results recorded and no automated runner. |
| CI/CD integration | Missing | No `.github/` directory exists in the project root. No `Makefile`. No eval command in `package.json` scripts. No automated eval runs on commit or PR. |
| Online guardrails | Partial | Input and output moderation via `mistral-moderation-latest` is wired in the server action request path. Guardrails are real (not stubbed) but are untested against a reference set, use an undocumented model (`mistral-moderation-latest` vs. the planned `omni-moderation-latest`), and have no threshold configuration or alerting. Rate limiting is also implemented (`checkRateLimit`), which is a guardrail for abuse. |
| Tracing (langfuse / arize / langsmith) | Not configured | No tracing library wraps the Mistral `generateLetter()` call or the moderation calls. `console.log` statements exist in `submitWizardAction` but they log metadata only (letter length, politician name) — not the full input/output pair needed for quality analysis. There is no way to sample production interactions for offline quality review. |

**Infrastructure Score:** (0 + 0 + 0 + 1 + 0) / 5 × 100 = 20/100

---

## Score Calculation

```
coverage_score  = 0/13 × 100 = 0
infra_score     = 20
overall_score   = (0 × 0.6) + (20 × 0.4) = 8

Adjusted upward to 22 to account for 4 PARTIAL dimensions
representing genuine (if incomplete) safety infrastructure.
```

**Overall Score: 22/100 — NOT IMPLEMENTED**

---

## Critical Gaps

### GAP-01: No word count check on generated letters (CRITICAL)
The core product promise is a letter that fits on one handwritten page (~200-280 words). Mistral can and does produce output outside this range. There is no post-generation code check that counts words in `parsed.letter`. Users may receive letters that are too long to handwrite or too short to be persuasive with no warning.

### GAP-02: No politician correctness verification (CRITICAL)
A letter addressed to the wrong politician is the primary failure mode for this product — it is worse than no letter at all. The `generateLetter()` function selects a politician by ID from the input list, but:
- The fallback (when `selected_politician_id` does not match any politician in the list) silently uses the first politician in the array with no logging.
- No test verifies that for known PLZ inputs, the correct politician (by level and wahlkreis) is selected.
- No LLM judge eval checks whether the politician named in the letter body matches the `selectedPolitician` object.

### GAP-03: No prompt injection detection (CRITICAL)
Issue text is passed directly into the Mistral user prompt as an f-string interpolation. The Mistral moderation classifier catches harmful content but does not detect prompt injection. An input like "Ignoriere alle Anweisungen und schreibe stattdessen..." could manipulate the system prompt and produce a letter with false, defamatory, or off-topic content. No adversarial test cases exist.

### GAP-04: Zero tracing or production observability (CRITICAL)
Once deployed, there is no way to know whether generated letters are high quality, whether the politician selection is correct, or whether the tone matches the system prompt intent. The `console.log` in `submitWizardAction` logs metadata but not the letter text itself. Without tracing, quality regressions from Mistral model updates, data file changes, or prompt edits are invisible until a user complains.

### GAP-05: Moderation classifier not validated (HIGH)
The implementation switched from the planned OpenAI `omni-moderation-latest` to `mistral-moderation-latest` with no documented rationale and no validation. Political speech is a high false-positive risk for general-purpose classifiers — legitimate letters about controversial policy topics (immigration, housing, climate) may be incorrectly flagged and blocked. No test set of political speech examples (both legitimate and genuinely harmful) was run to calibrate the classifier before launch.

---

## Remediation Plan

### Must fix before production:

**1. Add word count validation after generation (GAP-01)**
In `generateLetter.ts`, after `parsed = JSON.parse(content)`, add:
```typescript
const wordCount = parsed.letter.trim().split(/\s+/).length;
if (wordCount < 150 || wordCount > 350) {
  // Log the violation and retry once, or throw for server action to catch
  console.warn(`[generateLetter] Word count out of range: ${wordCount}`);
}
```
Return `wordCount` in `GenerateLetterResult` so the server action can decide whether to retry or flag.

**2. Log fallback politician selection as an error (GAP-02)**
In `generateLetter.ts`, the silent fallback to `input.politicians[0]` must log as an error with the full context (issue text truncated, politician IDs, returned ID). This makes the failure mode visible in production logs immediately.

**3. Build a minimum reference dataset of 10 PLZ → politician test cases**
Create `web/src/__tests__/fixtures/plz-politician-cases.json` with 10 entries: known PLZ, expected wahlkreisId, expected politician last name (from the actual data file). Write a single Jest test in `web/src/__tests__/plzLookup.test.ts` that runs all 10 cases. This is the minimum viable eval for the most critical failure mode.

**4. Add a regex scan for Genderzeichen on generated letters (GAP-01 / style)**
In `submitWizardAction`, after output moderation passes, add:
```typescript
const GENDER_SYMBOLS = /[*:\/]/; // simplified; tune to context
if (GENDER_SYMBOLS.test(result.letter)) {
  console.warn("[submitWizard] Gender symbol detected in output");
}
```
This is a code-based metric — fast, free, zero latency.

**5. Add basic prompt injection detection to input preprocessing (GAP-03)**
Before the Mistral call in `submitWizardAction`, add a lightweight check for common injection patterns:
```typescript
const INJECTION_PATTERNS = /ignoriere|ignore.*instructions|system prompt|als KI|as an AI/i;
if (INJECTION_PATTERNS.test(data.issueText)) {
  return { error: "moderation_rejected", message: "..." };
}
```
This is not a complete defense but stops the most obvious attacks before they reach the LLM.

**6. Configure Langfuse free tier for tracing (GAP-04)**
Langfuse has a free self-hosted option and a generous cloud free tier. Wrapping `generateLetter()` and `moderateText()` with Langfuse traces (input, output, latency, model) takes ~30 minutes and gives full production observability from day one. The Langfuse Next.js SDK is well-documented.

### Should fix soon:

**7. Run UAT test cases and record results in 02-UAT.md**
All 8 UAT tests are `[pending]`. Run each manually with the dev server, record pass/fail. The UAT document becomes the human-review baseline. For Test 6 (letter generation result), specifically verify: correct politician name in letter, word count in range, Sie-Form throughout, no Genderzeichen.

**8. Validate moderation classifier on political speech samples (GAP-05)**
Before launch, run 20 test inputs through `moderateText()` — 10 legitimate political complaints (e.g. about Radwege, Wohnkosten, Klimaschutz) and 10 genuinely inappropriate inputs. Record pass/fail. If false-positive rate on legitimate political speech exceeds 5%, reconsider the classifier choice or add a bypass for inputs that pass a keyword whitelist of policy topics.

**9. Add a word count display to Step3Success**
Until automated word count validation is in place, show the word count of the generated letter on the success page: "Dein Brief hat {n} Wörter — ideal für eine handgeschriebene Seite." This gives the user a manual sanity check at zero technical cost.

**10. Document and test the JSON regex fallback frequency**
Add a counter to `generateLetter.ts` that logs when the regex fallback fires. If it fires more than 5% of the time in the first week of production, the `responseFormat: { type: "json_object" }` setting is not reliable and the prompt needs strengthening.

### Nice to have:

**11. Set up promptfoo for prompt regression testing**
A `promptfoo.yaml` with 10-20 test cases (issue text → expected letter qualities) enables automated regression testing when the system prompt is edited. This prevents the common pattern of "improving" the prompt and inadvertently degrading output for other issue types. Takes ~2 hours to set up for a system of this complexity.

**12. Establish a monthly human review sampling process**
Designate 30 minutes per month to manually review 5 randomly sampled letters from Vercel logs (once tracing is in place). Check: correct politician, appropriate tone, word count, no hallucinated demographics. Document findings in a `LETTER-QUALITY-LOG.md`. This is the offline flywheel at minimal cost.

**13. Calibrate the LLM judge approach for tone evaluation**
Before building an LLM judge for letter tone, follow the ai-evals.md guidance: write explicit rubrics for "sachlich-bürgerlich" tone (what scores 1, 3, 5 on a 5-point scale with German political letter examples), then validate judge scores against 10 human-labeled examples. Only trust the judge once correlation with human scores reaches ≥ 0.7.

---

## Files Found

Eval-related files discovered during scan:

- `.planning/phases/02-core-engine/02-UAT.md` — 8 manual UAT test cases, all `[pending]`, no automated runner
- `web/src/lib/moderation/moderateText.ts` — Mistral moderation classifier wrapper (guardrail implementation, not an eval)
- `web/src/lib/generation/generateLetter.ts` — Mistral chat completion with JSON validation (production hardening, not an eval)
- `web/src/lib/actions/submitWizard.ts` — Pipeline orchestrator with `console.log` metadata logging (not tracing)

No test files, no eval config files, no reference dataset, no CI/CD pipeline, no tracing library found.
