---
phase: quick-260601-jts
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/wizard/Step1Form.tsx
autonomous: true
requirements:
  - QUICK-260601-jts-01
must_haves:
  truths:
    - "When user has typed exactly 5 digits into PLZ, a dezent hint appears below the PLZ field showing the Ort (and Ortsteil if available)"
    - "While fewer than 5 digits are entered, no locality hint is shown"
    - "If the API call fails or returns no result, no hint is shown and the existing UX is unchanged (silent fail)"
    - "If the user changes the PLZ after a successful lookup, the stale hint disappears and a fresh lookup runs once 5 digits are present again"
    - "The locality hint matches the existing wizard design (font-body, warmgrau token, sizing consistent with the existing plz-hint)"
  artifacts:
    - path: "web/src/components/wizard/Step1Form.tsx"
      provides: "PLZ input with live Ort/Ortsteil hint below the field"
      contains: "openplzapi.org"
  key_links:
    - from: "Step1Form PLZ input"
      to: "openplzapi.org/de/Localities"
      via: "native fetch in useEffect, triggered by react-hook-form watch on plz field"
      pattern: "fetch.*openplzapi\\.org"
---

<objective>
Add a dezent Ort/Ortsteil hint directly below the PLZ input in Step1Form, fetched live from openplzapi.org once 5 digits are entered. Purely additive — silent fail on errors, no new packages, no behavior change when the API is unavailable.

Purpose: Help users confirm they typed the right PLZ before continuing, reducing wrong-Wahlkreis frustration.
Output: Updated `web/src/components/wizard/Step1Form.tsx` with a locality lookup that displays "Ort · Ortsteil" beneath the existing hint text.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@web/CLAUDE.md
@web/AGENTS.md
@web/src/components/wizard/Step1Form.tsx
@web/src/components/wizard/Step2Issue.tsx

<interfaces>
<!-- Design tokens used in the wizard (from Step1Form.tsx and Step2Issue.tsx) -->
Color tokens in use:
- `text-warmgrau` (default body text)
- `text-warmgrau/60` (existing plz-hint subdued)
- `text-warmgrau/70` (paragraph subdued)
- `text-waldgruen-dark` (headings, accent)
- `bg-creme` (input background)
- `border-warmgrau/30` (input border)
- `border-airmail-rot` (error border)

Typography:
- `font-body text-sm` for hint text
- Existing PLZ hint: `<p id="plz-hint" className="text-sm text-warmgrau/60 mt-1">`

react-hook-form usage in Step1Form:
- `register("plz")` already wires the PLZ input
- To observe the value, use `watch` from `useForm`: `const plz = watch("plz")`

openplzapi.org endpoint (per task constraints):
- `GET https://openplzapi.org/de/Localities?postalCode=47169`
- Returns JSON array of objects with shape (only fields we need):
  ```ts
  type Locality = {
    name: string;       // Ort, e.g. "Duisburg"
    postalCode: string;
    district?: { name?: string; key?: string }; // Ortsteil container in some responses
    // Some entries flatten district to a string — handle both defensively
  };
  ```
  We will read `name` for the Ort and best-effort read a district name (string or `district.name`) for the Ortsteil. If the array is empty or the field is missing, treat as no result.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add live Ort/Ortsteil hint under the PLZ input</name>
  <files>web/src/components/wizard/Step1Form.tsx</files>
  <behavior>
    - When `plz.length < 5`: no locality hint is rendered.
    - When `plz.length === 5` (and matches /^\d{5}$/): fetch `https://openplzapi.org/de/Localities?postalCode=${plz}`. On success with a non-empty array, render a small hint line below the existing plz-hint showing the Ort, and the Ortsteil after a middle dot if present and different from the Ort.
    - On fetch error, non-200 response, or empty array: do not render any locality hint (silent fail). Do not log to the user.
    - Stale-response guard: if the PLZ changes while a fetch is in flight, ignore the older response (use an AbortController, or compare against the current watched plz before setting state).
    - When the PLZ changes back to <5 digits, the previously-shown hint is cleared.
  </behavior>
  <action>
    Edit `web/src/components/wizard/Step1Form.tsx`:

    1. Add `watch` to the destructure from `useForm<Step1Data>({...})`:
       `const { register, handleSubmit, watch, formState: { errors, isValid, touchedFields } } = useForm<...>({ ... });`

    2. Add `import { useEffect, useState } from "react";` at the top.

    3. Inside the component (after the `useForm` call), add:
       ```ts
       const plzValue = watch("plz");
       const [locality, setLocality] = useState<{ ort: string; ortsteil?: string } | null>(null);

       useEffect(() => {
         // Reset hint whenever PLZ is not a clean 5-digit value
         if (!/^\d{5}$/.test(plzValue ?? "")) {
           setLocality(null);
           return;
         }

         const controller = new AbortController();
         (async () => {
           try {
             const res = await fetch(
               `https://openplzapi.org/de/Localities?postalCode=${plzValue}`,
               { signal: controller.signal }
             );
             if (!res.ok) return; // silent fail
             const data: unknown = await res.json();
             if (!Array.isArray(data) || data.length === 0) return;
             const first = data[0] as {
               name?: unknown;
               district?: unknown;
             };
             const ort = typeof first.name === "string" ? first.name : null;
             if (!ort) return;
             let ortsteil: string | undefined;
             const d = first.district;
             if (typeof d === "string" && d.trim() && d !== ort) {
               ortsteil = d;
             } else if (d && typeof d === "object" && "name" in d) {
               const dn = (d as { name?: unknown }).name;
               if (typeof dn === "string" && dn.trim() && dn !== ort) ortsteil = dn;
             }
             setLocality({ ort, ortsteil });
           } catch {
             // silent fail (network error, abort, JSON parse error)
           }
         })();

         return () => controller.abort();
       }, [plzValue]);
       ```

    4. In the PLZ block of the JSX, directly AFTER the existing `<p id="plz-hint" ...>` paragraph and BEFORE the `errors.plz && touchedFields.plz && (...)` error block, insert:
       ```tsx
       {locality && (
         <p
           id="plz-locality"
           className="font-body text-sm text-warmgrau/70 mt-1"
           aria-live="polite"
         >
           {locality.ort}
           {locality.ortsteil ? ` · ${locality.ortsteil}` : ""}
         </p>
       )}
       ```

    5. Update the input's `aria-describedby` so the locality hint is announced when present, without dropping the existing hint/error wiring:
       ```ts
       aria-describedby={
         errors.plz && touchedFields.plz
           ? "plz-error"
           : locality
             ? "plz-hint plz-locality"
             : "plz-hint"
       }
       ```

    Notes / why:
    - Native `fetch` only, no SWR/axios (per constraints + per project "no unsolicited tools").
    - AbortController prevents a stale 5-digit lookup from overwriting a newer one when the user keeps typing/correcting.
    - Silent fail on every error path: the feature is purely additive, so the wizard works identically if openplzapi.org is down.
    - We deliberately do NOT show a loading spinner — the lookup is fast and a spinner would be noisier than the hint itself. (Matches the "dezent" requirement.)
    - Color/spacing chosen to match the existing `plz-hint` (`text-sm text-warmgrau/60 mt-1`); the locality uses `text-warmgrau/70` so it reads as a sibling info line, slightly more present than the static hint above it but still subdued.
    - `district` shape varies in openplzapi.org responses (sometimes string, sometimes object with `name`). The defensive parsing handles both without crashing if the shape changes.

    Do NOT:
    - Add a new package (no swr, no axios).
    - Persist or log the PLZ/locality anywhere (DSGVO).
    - Wire this into validation — the hint is informational only; the existing Zod schema continues to gate the submit button.
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit && npx next lint --file src/components/wizard/Step1Form.tsx</automated>
  </verify>
  <done>
    - `Step1Form.tsx` compiles with no TS errors and passes lint.
    - Manual smoke (developer): type "10115" into the PLZ field → "Berlin" (with an Ortsteil where applicable) appears under the static hint within ~1s.
    - Type "99999" or an invalid PLZ → no locality hint shown, no console error visible to the user, wizard still submits when other fields are valid.
    - Delete a digit (PLZ goes to 4 chars) → locality hint disappears immediately.
    - Existing PLZ validation error UX (border + message) is unchanged.
  </done>
</task>

</tasks>

<verification>
- TypeScript: `cd web && npx tsc --noEmit` → no errors.
- Lint: `cd web && npx next lint --file src/components/wizard/Step1Form.tsx` → clean.
- Functional smoke on `pnpm dev` (or `npm run dev`):
  1. `/wizard` → Step 1: PLZ field empty → no locality hint.
  2. Type "10115" → "Berlin" (with Ortsteil if returned) appears below the static hint, styled to match.
  3. Type "47169" → "Duisburg · Marxloh" (or similar) appears.
  4. Replace with "00000" or any invalid 5-digit code → hint disappears, no error surfaced to the user.
  5. Simulate offline (devtools throttling: offline) → no hint, no broken UI, wizard still works.
</verification>

<success_criteria>
- Locality hint appears below the PLZ input within ~1s of typing 5 valid digits.
- Hint cleanly disappears on edit, on invalid PLZ, on API failure.
- Zero new dependencies in `web/package.json`.
- No changes to Zod schema, submit behavior, or other wizard steps.
- Visual styling reads as part of the existing wizard (uses `font-body`, `text-sm`, `text-warmgrau/70`, `mt-1`).
</success_criteria>

<output>
After completion, create `.planning/quick/260601-jts-plz-ort-anzeige-unter-dem-plz-inputfeld-/260601-jts-SUMMARY.md` capturing:
- The exact diff applied to `Step1Form.tsx` (hook additions + JSX insertion).
- Behavior under success/failure/edit cases.
- Any oddities observed in openplzapi.org response shape (esp. how `district` came back for the tested PLZs) so future tasks can rely on the parsing.
</output>
