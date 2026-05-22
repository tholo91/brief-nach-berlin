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
---

<objective>
Five surgical editorial-polish moves to `web/src/app/(site)/stimmen/page.tsx`, each landing as one atomic commit in strict order. The file is touched by all five tasks, but every commit MUST contain only one task's diff - no bundling.

Purpose: Tighten the page's editorial voice (typewriter eyebrows on quotes, scannable list, standfirst deck, handwritten sign-off) and remove the duplicate final CTA box. The Section 2 Feedback CTA stays canonical primary; Section 8 becomes a sign-off, not a second CTA.

Output: 5 atomic commits, no new files, no new dependencies, no em dashes anywhere.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@./CLAUDE.md
@./web/AGENTS.md
@web/src/app/(site)/stimmen/page.tsx
@web/src/components/editorial/Prose.tsx
@web/src/components/editorial/PullQuote.tsx
@web/src/components/editorial/FAQAccordion.tsx
@.planning/quick/260522-u2u-stimmen-polish-reviews-filter-ab-2026-05/260522-u2u-SUMMARY.md

<interfaces>
<!-- Key context the executor needs - extracted from the codebase, no exploration required. -->

**Prose component (`web/src/components/editorial/Prose.tsx`):**
- Wraps children in `<article>` with `font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg`
- Bakes baseline h2 styling: `[&>h2]:font-body [&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-waldgruen-dark [&>h2]:pt-4`
- Clears floats around `h2 h3 ul ol aside section div` siblings
- **Does NOT style `<ul>` markers/spacing** - no `list-disc`, no marker color. Task 4 MUST add explicit `list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40` to the `<ul>`.

**PullQuote component (`web/src/components/editorial/PullQuote.tsx`):**
- Renders an `<aside className="my-10 md:my-14 relative">` containing a bordered block with handwriting body and typewriter attribution.
- For task 1: the typewriter eyebrow `<p>` goes BEFORE the `<PullQuote>` element, INSIDE the `<Prose>` wrapper. The eyebrow is a sibling of `<PullQuote>` inside `<Prose>`, not a child.

**FAQAccordion (`web/src/components/FAQAccordion.tsx`):**
- Pure component, sits OUTSIDE the `<Prose>` wrapper in Section 7.
- For task 3: the bridge `<p>` belongs INSIDE the `<Prose>` wrapper, after the h2 - NOT inside the `<FAQAccordion>`. Confirmed from page.tsx Section 7 (lines 312-320): h2 is the only child of `<Prose>`, accordion is sibling outside.

**Current Section 5 structure (lines 259-296):** h2 -> Figure (right-floated) -> p1 (origin) -> p2 (dense feedback paragraph, lines 280-289) -> p3 (follow-up). Tasks 4 and 5 reshape this.

**Section 5 first paragraph trim decision (task 5):** After the standfirst "Drei Monate, dreihundert Briefe..." lands above the Figure, the first paragraph's opening sentence "Die Idee entstand Anfang 2026." becomes redundant with the standfirst's "Drei Monate". **Decision: trim the first sentence.** Paragraph starts with "Seitdem sind über 300 Briefe entstanden..."

**Token rules:** Tailwind v4 already configured. Use only existing tokens: `creme`, `waldgruen`, `waldgruen-dark`, `warmgrau`, `font-typewriter`, `font-handwriting`, `font-body`. No new tokens, no new utilities, no new components, no new files.

**Hard constraints:** No em dashes (U+2014) anywhere. Use forward slash `/` (U+002F), comma, or hyphen instead. Each task = one commit with only that task's diff. After every commit, `grep -n "—" web/src/app/(site)/stimmen/page.tsx` MUST return empty.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Typewriter eyebrows above both PullQuotes</name>
  <files>web/src/app/(site)/stimmen/page.tsx</files>
  <action>
    Add a typewriter eyebrow `<p>` BEFORE each `<PullQuote>`, INSIDE the surrounding `<Prose>` wrapper.

    Section 4 (currently ~lines 246-256, inside the `{quote1 && ...}` block): inside `<Prose>`, immediately before `<PullQuote ...>`, insert:
    `<p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-4">Aus den Reviews / Mai 2026</p>`

    Section 6 (currently ~lines 299-309, inside the `{quote2 && ...}` block): same pattern, copy is `Aus den Reviews / einen Monat später`.

    The `/` separator is a forward slash (U+002F), NOT an em dash. Do not introduce any em dash. Do not touch anything else. Then commit.
  </action>
  <verify>
    <automated>cd web && grep -c "Aus den Reviews / Mai 2026" src/app/\(site\)/stimmen/page.tsx | grep -q "^1$" && grep -c "Aus den Reviews / einen Monat später" src/app/\(site\)/stimmen/page.tsx | grep -q "^1$" && ! grep -q "—" src/app/\(site\)/stimmen/page.tsx && npx tsc --noEmit</automated>
  </verify>
  <done>
    Both eyebrow `<p>` elements present, sit inside their respective `<Prose>` wrappers immediately before the `<PullQuote>`, render typewriter / uppercase / waldgruen/60. No em dashes anywhere in the file. `npx tsc --noEmit` clean. Committed with subject `feat(stimmen): typewriter eyebrows above pullquotes` and only the page.tsx file in the commit.
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace Section 8 CTA box with signed handwritten close</name>
  <files>web/src/app/(site)/stimmen/page.tsx</files>
  <action>
    Delete the entire Section 8 block - currently the `<div className="mt-4 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">` containing an h2, paragraph, and two CTA buttons (Feedback zum Tool + Direkt schreiben). No box, no border, no bg, no button.

    Replace with exactly this markup (single block, no extra wrapping):
    ```tsx
    <div className="mt-12 mb-8">
      <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug max-w-md mx-auto text-center">
        Wenn du bis hier gelesen hast: schreib mir. Auch eine Zeile reicht.
      </p>
      <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mt-4 text-center">
        Thomas, Bremen
      </p>
      <p className="text-center">
        <a
          href="mailto:thomas-lorenz@posteo.de?subject=Brief%20nach%20Berlin%20Feedback"
          className="font-body text-sm text-waldgruen-dark underline decoration-waldgruen/40 underline-offset-4 hover:decoration-waldgruen mt-2 inline-block"
        >
          thomas-lorenz@posteo.de
        </a>
      </p>
    </div>
    ```

    Keep the `{/* 8. Final-CTA */}` comment OR update it to `{/* 8. Sign-off */}` - either is fine, both communicate intent. Comma between "Thomas" and "Bremen" (NOT em dash). The `FOUNDER_FEEDBACK_URL` import is still used in Section 2, so do NOT remove that import. Then commit.
  </action>
  <verify>
    <automated>cd web && grep -q "Wenn du bis hier gelesen hast: schreib mir" src/app/\(site\)/stimmen/page.tsx && grep -q "Thomas, Bremen" src/app/\(site\)/stimmen/page.tsx && ! grep -q "Schreib uns. Auch wenn du nichts schickst" src/app/\(site\)/stimmen/page.tsx && ! grep -q "—" src/app/\(site\)/stimmen/page.tsx && grep -c "FOUNDER_FEEDBACK_URL" src/app/\(site\)/stimmen/page.tsx | grep -qE "^[12]$" && npx tsc --noEmit</automated>
  </verify>
  <done>
    Section 8 box is gone (no border, no bg, no h2 "Schreib uns. Auch wenn du nichts schickst.", no duplicate "Feedback zum Tool" button). Sign-off block present with handwriting line, typewriter "Thomas, Bremen", and small underlined posteo mailto link, all centered. Section 2's CTA still intact and unchanged. `FOUNDER_FEEDBACK_URL` still imported (used by Section 2). No em dashes. `npx tsc --noEmit` clean. Committed with subject `feat(stimmen): replace duplicate final CTA with signed handwritten close`.
  </done>
</task>

<task type="auto">
  <name>Task 3: Bridge line between FAQ heading and accordion</name>
  <files>web/src/app/(site)/stimmen/page.tsx</files>
  <action>
    In Section 7 (the `{/* 7. FAQ */}` block, currently ~lines 312-320), the structure is:
    ```tsx
    <div className="mb-16">
      <Prose>
        <h2 ...>Häufige Fragen</h2>
      </Prose>
      <FAQAccordion items={faqs} />
    </div>
    ```

    Insert a bridge `<p>` INSIDE the `<Prose>` wrapper, AFTER the h2 and BEFORE `</Prose>`:
    `<p className="font-body text-base text-warmgrau/80 mb-6 max-w-md">Was wir am häufigsten gefragt werden, kurz beantwortet.</p>`

    The accordion stays OUTSIDE `<Prose>` (do not move it). Then commit.
  </action>
  <verify>
    <automated>cd web && grep -q "Was wir am häufigsten gefragt werden, kurz beantwortet" src/app/\(site\)/stimmen/page.tsx && ! grep -q "—" src/app/\(site\)/stimmen/page.tsx && npx tsc --noEmit</automated>
  </verify>
  <done>
    Bridge `<p>` present inside the `<Prose>` wrapper directly after the h2 "Häufige Fragen" and before `</Prose>`. `<FAQAccordion>` still rendered as a sibling outside `<Prose>`. No em dashes. `npx tsc --noEmit` clean. Committed with subject `feat(stimmen): bridge line between FAQ heading and accordion`.
  </done>
</task>

<task type="auto">
  <name>Task 4: Convert dense feedback-changes paragraph into scannable list</name>
  <files>web/src/app/(site)/stimmen/page.tsx</files>
  <action>
    In Section 5 (`{/* 5. Wo wir herkommen */}`, currently ~lines 259-296), the dense feedback paragraph runs from "Konkrete Beispiele aus den letzten Wochen: Nach mehreren Hinweisen..." through "...damit wir Muster schneller erkennen." This is the second paragraph in the `<Prose>` wrapper (between the origin paragraph and the follow-up paragraph). Replace this entire paragraph with:

    ```tsx
    <p>Konkrete Beispiele aus den letzten Wochen:</p>
    <ul className="list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40">
      <li>Komplexitäts-Floskel raus, ersetzt durch positive Anti-Halluzinations-Regel</li>
      <li>Wiederholungs-Fix für doppelte Sätze</li>
      <li>Längen-Korridor auf plus minus fünfzehn Prozent gelockert</li>
      <li>Negative Feedback-Chips für strukturierte Kritik</li>
    </ul>
    ```

    The explicit list classes are required because `Prose.tsx` only clears floats around `<ul>` - it does NOT style markers, padding, or spacing. The `marker:text-waldgruen/40` keeps the bullet color on-brand. Use the words "plus minus" not the `±` symbol (Thomas's product is letters; the symbol does not survive copy-paste cleanly). Origin paragraph and follow-up paragraph stay untouched in this task. Then commit.
  </action>
  <verify>
    <automated>cd web && grep -q "Konkrete Beispiele aus den letzten Wochen:" src/app/\(site\)/stimmen/page.tsx && grep -q "list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40" src/app/\(site\)/stimmen/page.tsx && grep -q "Komplexitäts-Floskel raus, ersetzt durch positive Anti-Halluzinations-Regel" src/app/\(site\)/stimmen/page.tsx && grep -q "Längen-Korridor auf plus minus fünfzehn Prozent gelockert" src/app/\(site\)/stimmen/page.tsx && ! grep -q "Wiederholungs-Fix nach Rückmeldung über doppelte Sätze" src/app/\(site\)/stimmen/page.tsx && ! grep -q "±" src/app/\(site\)/stimmen/page.tsx && ! grep -q "—" src/app/\(site\)/stimmen/page.tsx && npx tsc --noEmit</automated>
  </verify>
  <done>
    Dense feedback paragraph fully removed. New intro line `<p>Konkrete Beispiele aus den letzten Wochen:</p>` followed by a `<ul>` with the four `<li>` items in the specified order. List has `list-disc pl-5 space-y-2 my-4 marker:text-waldgruen/40` classes (bullets visible, on-brand color, vertical rhythm matches Prose). No `±` symbol used. No em dashes. `npx tsc --noEmit` clean. Committed with subject `feat(stimmen): convert feedback-changes paragraph into scannable list`.
  </done>
</task>

<task type="auto">
  <name>Task 5: Standfirst deck above Section 5 story + trim redundant opener</name>
  <files>web/src/app/(site)/stimmen/page.tsx</files>
  <action>
    In Section 5 (`{/* 5. Wo wir herkommen */}`), BETWEEN the `<h2>Wo das hier herkommt</h2>` and the `<Figure ...>`, insert a handwriting standfirst block with a left-border rule:

    ```tsx
    <p className="font-handwriting text-xl md:text-2xl text-waldgruen leading-snug text-balance border-l-2 border-waldgruen/30 pl-5 my-6 not-italic">
      Drei Monate, dreihundert Briefe, und eine Liste an Dingen, die wir wegen euch geändert haben.
    </p>
    ```

    Then trim the first paragraph's opener: the paragraph currently starts with "Die Idee entstand Anfang 2026. Seitdem sind über 300 Briefe entstanden, viele davon mit Anliegen, die sonst nirgendwo gelandet wären: Schlaglöcher in der Straße..." Remove the leading "Die Idee entstand Anfang 2026. " - the standfirst now announces "Drei Monate, dreihundert Briefe", so that sentence is redundant. The paragraph now starts: "Seitdem sind über 300 Briefe entstanden, viele davon mit Anliegen..."

    The standfirst with the left-border rule is the editorial signature of this section - do not regress on a later edit. Then commit.
  </action>
  <verify>
    <automated>cd web && grep -q "Drei Monate, dreihundert Briefe, und eine Liste an Dingen, die wir wegen euch geändert haben" src/app/\(site\)/stimmen/page.tsx && grep -q "border-l-2 border-waldgruen/30 pl-5 my-6 not-italic" src/app/\(site\)/stimmen/page.tsx && grep -q "Seitdem sind über 300 Briefe entstanden" src/app/\(site\)/stimmen/page.tsx && ! grep -q "Die Idee entstand Anfang 2026" src/app/\(site\)/stimmen/page.tsx && ! grep -q "—" src/app/\(site\)/stimmen/page.tsx && npx tsc --noEmit</automated>
  </verify>
  <done>
    Standfirst `<p>` present between `<h2>Wo das hier herkommt</h2>` and `<Figure ...>` with the specified handwriting/border-l/pl-5/my-6/not-italic classes and exact copy. First paragraph of Section 5 now starts with "Seitdem sind über 300 Briefe entstanden..." (the "Die Idee entstand Anfang 2026." sentence is gone). No em dashes. `npx tsc --noEmit` clean. Committed with subject `feat(stimmen): standfirst deck above story section`.
  </done>
</task>

</tasks>

<verification>
After all 5 commits land:

1. `git log --oneline -5` shows the 5 commits in order:
   - standfirst deck above story section
   - convert feedback-changes paragraph into scannable list
   - bridge line between FAQ heading and accordion
   - replace duplicate final CTA with signed handwritten close
   - typewriter eyebrows above pullquotes

2. `git log --oneline -5 --name-only` shows ONLY `web/src/app/(site)/stimmen/page.tsx` per commit (no bundled files).

3. `grep -n "—" web/src/app/(site)/stimmen/page.tsx` returns empty.

4. `cd web && npx tsc --noEmit` exits clean.

5. Visual smoke test in dev (`cd web && npm run dev`, open /stimmen):
   - Both PullQuotes have a typewriter eyebrow above ("Aus den Reviews / Mai 2026" and "Aus den Reviews / einen Monat später")
   - Section 5 opens with a handwriting standfirst with left-border rule, then Figure floats right, then origin paragraph (starting "Seitdem sind über 300 Briefe entstanden..."), then "Konkrete Beispiele" intro + bulleted list with 4 items + waldgruen markers, then the follow-up paragraph
   - Section 7 (FAQ) shows the bridge line "Was wir am häufigsten gefragt werden, kurz beantwortet." between heading and accordion
   - Section 8 has no box - just centered handwriting line, "Thomas, Bremen" in typewriter, and a small underlined mailto link below
</verification>

<success_criteria>
- 5 atomic commits in the specified order, each with exactly one task's diff
- Each commit touches only `web/src/app/(site)/stimmen/page.tsx`
- After each commit: no em dashes in the file, `npx tsc --noEmit` clean
- Section 2 Feedback CTA intact (canonical primary CTA), Section 8 is a sign-off not a duplicate CTA
- No new files, no new dependencies, no new Tailwind tokens, no `"use client"` added
</success_criteria>

<output>
After completion, write `.planning/quick/260522-upk-stimmen-editorial-polish-eyebrows-signed/260522-upk-SUMMARY.md` covering: the 5 commits with hashes, what each changed, any deviations from this plan (especially around the Section 5 opener trim decision), verification results.
</output>
