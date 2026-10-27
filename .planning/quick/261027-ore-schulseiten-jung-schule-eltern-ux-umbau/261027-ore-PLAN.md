---
phase: quick-261027-ore
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "web/src/components/AppHeader.tsx"
  - "web/src/components/topics/TopicStarterGrid.tsx"
  - "web/src/app/globals.css"
  - "web/src/app/(site)/jung/page.tsx"
  - "web/src/components/jung/JungExperience.tsx"
  - "web/src/app/(site)/eltern/page.tsx"
  - "web/src/components/eltern/ElternExperience.tsx"
  - "web/src/app/(site)/schule/page.tsx"
  - "web/src/components/schule/LessonPlanToggle.tsx"
  - "web/src/components/schule/ClassLinkGenerator.tsx"
  - "web/src/__tests__/appHeader.test.ts"
  - "web/src/__tests__/topicStarters.test.ts"
  - "web/src/__tests__/__snapshots__/topicStarters.test.ts.snap"
  - "web/src/__tests__/jungEntry.test.ts"
  - "web/src/__tests__/elternHandoff.test.ts"
  - "web/src/__tests__/schulePage.test.ts"
autonomous: true
requirements: [QUICK-261027-ore]

estimate:
  tokens: 170000
  raw_tokens: 170000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-01: On /jung and /eltern the sticky header shows a green primary button 'Brief entwerfen' (mobile 'Schreiben') linking to #schreiben; on /schule 'Klassenlink erstellen' (mobile 'Klassenlink') linking to #klassenlink; no such button on /mitbestimmen-ohne-wahlrecht, /projekttag-demokratie or any other path; the /ngo-briefkampagne 'Kampagne starten' button is unchanged"
    - "D-01: Jumping to #schreiben, #klassenlink, #ablauf, #schulleitung and #sicher lands with the target top visible below the two-row sticky header (scroll-mt-32), and on /jung?k=... the query string survives the jump"
    - "D-02 (Entscheidung 7A): No heading on /jung, /schule, /eltern uses Caveat; every H1 is one element in Courier Prime with max 2 lines at 375px; every H2 fits on one line at 375px; the brand name is in no heading"
    - "D-03: Below-the-fold sections fade/slide in via CSS scroll-driven animation only in browsers that support animation-timeline and only without reduced motion; otherwise they are static and fully visible; the /jung step connector draws itself; newly shown 90-minute rows fade in; no new npm dependency, no infinite loop"
    - "D-07: At 375x812 on /jung the 'Brief entwerfen' submit button is visible without scrolling, both without a class link and with a valid ?k= link (with margin); with a valid link the class picker is replaced by the confirmation 'Klasse N und PLZ NNNNN sind über den Klassenlink eingetragen.' plus an 'ändern' button that reveals the picker"
    - "D-07 / D-09: Topic chips on /jung and /eltern are one horizontally scrollable row; the numbered TopicStarterGrid variant used by /schreib-merz renders byte-identical markup (snapshot taken before the change still passes)"
    - "D-08 (incl. Entscheidung 8B): /schule has a split hero with two CTAs, the generator at #klassenlink, a 2-column checklist, one 'Ablauf der Stunde' section (#ablauf) with an accessible 45|90 toggle, a merged 'Warum das wirkt', a collapsible 'Für die Schulleitung' (#schulleitung) with word-for-word unchanged privacy bullets, the Elternbrief link to /eltern#sicher, and the old #schule-leitung anchor still works"
    - "D-09: /eltern shows two door cards under the hero (#schreiben, #sicher), the form at #schreiben, Courier h3 'Land'/'Schulträger', and 'Ist das sicher?' at #sicher with word-for-word unchanged bullets and links"
    - "D-10: Routes, sub-nav, metadata (title/description/canonical), JSON-LD, form field names, wizard handoff logic, analytics events and privacy copy are unchanged"
  artifacts:
    - path: "web/src/components/AppHeader.tsx"
      provides: "Per-path school CTA (SCHOOL_PAGE_CTAS) sharing PRIMARY_CTA_CLASS with the NGO CTA"
      contains: "#klassenlink"
    - path: "web/src/components/topics/TopicStarterGrid.tsx"
      provides: "variant 'scroll' (replaces the unused-after-change 'plain'); 'numbered' untouched"
      contains: "\"scroll\""
    - path: "web/src/app/globals.css"
      provides: ".reveal, .step-connector, .fade-in-row, .chip-scroll-fade utilities with @supports + reduced-motion guards"
      contains: "animation-timeline: view()"
    - path: "web/src/components/schule/LessonPlanToggle.tsx"
      provides: "Client island: 45|90 segmented toggle + vertical timeline + extras"
      contains: "export function LessonPlanToggle"
    - path: "web/src/__tests__/__snapshots__/topicStarters.test.ts.snap"
      provides: "Pre-change snapshot of the numbered variant markup (SchreibMerz regression gate)"
  key_links:
    - from: "web/src/components/AppHeader.tsx"
      to: "web/src/app/(site)/jung/page.tsx, web/src/app/(site)/eltern/page.tsx"
      via: "href=\"#schreiben\" -> wrapper id=\"schreiben\" around the Experience form"
      pattern: "id=\"schreiben\""
    - from: "web/src/components/AppHeader.tsx"
      to: "web/src/app/(site)/schule/page.tsx"
      via: "href=\"#klassenlink\" -> wrapper id=\"klassenlink\" around ClassLinkGenerator"
      pattern: "id=\"klassenlink\""
    - from: "web/src/app/(site)/schule/page.tsx"
      to: "web/src/app/(site)/eltern/page.tsx"
      via: "Elternbrief link /eltern#sicher -> section id=\"sicher\""
      pattern: "/eltern#sicher"
    - from: "web/src/app/(site)/projekttag-demokratie/page.tsx (unchanged)"
      to: "web/src/app/(site)/schule/page.tsx"
      via: "existing link /schule#schule-leitung -> h2 id=\"schule-leitung\" must stay"
      pattern: "id=\"schule-leitung\""
    - from: "web/src/components/jung/JungExperience.tsx, web/src/components/eltern/ElternExperience.tsx"
      to: "web/src/components/topics/TopicStarterGrid.tsx"
      via: "variant=\"scroll\""
      pattern: "variant=\"scroll\""
    - from: "the three page.tsx files"
      to: "web/src/app/globals.css"
      via: "classNames reveal / step-connector / fade-in-row"
      pattern: "reveal"
---

<objective>
Rework the three school pages /jung (students, phone via QR in class), /schule (teachers, laptop) and /eltern (parents) as a "Redesign - Preserve": same routes, IA, SEO and privacy copy, but a clear header CTA, Courier-only headings, a /jung form that fits the first phone screen, scannable /schule lesson planning and two clear entry doors on /eltern, plus restrained CSS-only motion.

Decision IDs used in this plan (from Thomas' approval in the planning context):
- D-01 Header primary CTA per school page + in-page anchors with scroll-margin
- D-02 Heading rule (Entscheidung 7A): no Caveat in headings, H1 max 2 lines and H2 one line at 375px
- D-03 CSS-only motion (.reveal, step connector, 90-row fade), reduced-motion + @supports guards, no dependency
- D-04 Collapsibles via FAQAccordion or native details styled like it, content stays in DOM
- D-05 Copy rules (German, no em/en dash separators, "ich" not "wir", "Brief-nach-Berlin", max one middle dot per line)
- D-06 Project conventions over skill defaults (hand-rolled inline SVG icons, light theme, Tailwind tokens, rounded-lg controls / rounded-xl cards)
- D-07 /jung specifics, D-08 /schule specifics (incl. Entscheidung 8B), D-09 /eltern specifics
- D-10 Preserve: routes, sub-nav, metadata, JSON-LD, form field names, analytics events, wizard handoff, privacy wording

Design read (design-taste-frontend, Redesign - Preserve): "Reading this as: redesign-preserve of three civic school subpages for students on phones, teachers on laptops and parents, with a trust-first airmail/paper language, leaning toward native CSS + existing Tailwind v4 tokens + CSS scroll-driven animation." Dials: DESIGN_VARIANCE 4, MOTION_INTENSITY 3, VISUAL_DENSITY 4. Project conventions (D-06, CLAUDE.md "Keine neuen Dienste oder SDKs") override skill defaults: no Motion/GSAP, no icon library, no dark mode, no image generation.

Output: one tracer task (shared layer wired end-to-end on /jung), then /jung + /eltern, then /schule. Three atomic commits on main, never pushed.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md
@.planning/brand-identity.md (section 6 only)
@~/.claude/skills/design-taste-frontend/SKILL.md (sections 4.5, 4.7, 9.G, 11, 14 only)
@web/src/components/AppHeader.tsx
@web/src/components/topics/TopicStarterGrid.tsx
@web/src/components/FAQAccordion.tsx
@web/src/app/globals.css (lines 1-40 tokens, 210-270 map-dialog + reduced-motion block + .scrollbar-hide)
@web/src/app/(site)/jung/page.tsx
@web/src/components/jung/JungExperience.tsx
@web/src/app/(site)/eltern/page.tsx
@web/src/components/eltern/ElternExperience.tsx
@web/src/app/(site)/schule/page.tsx
@web/src/components/schule/ClassLinkGenerator.tsx
@web/src/lib/schule/lessonPlan.ts
@web/src/components/editorial/Figure.tsx
@web/src/components/wizard/WizardForwardIcon.tsx

Repo facts the executor can rely on (verified while planning):
- Only Jung/Eltern use TopicStarterGrid variant "plain"; SchreibMerzExperienceV2 uses "numbered" and must not be touched.
- web/src/app/(site)/projekttag-demokratie/page.tsx links to /schule#schule-leitung, so the h2 id "schule-leitung" must survive.
- No ancestor of the page content has overflow hidden/auto (site layout: div > main flex; one unrelated overflow-x: clip on .wizard-step-stage), so view() timelines bind to the document scroller. Do not add overflow hidden/auto to any ancestor of a .reveal element.
- html has scroll-behavior: smooth (globals.css line 35). A site Footer follows main, so short sections near the page end can still scroll far enough for the reveal range.
- KLASSE_MIN 7, KLASSE_MAX 13 (7 class chips). JUNG_TOPICS has 8, ELTERN_TOPICS 7 entries; titles contain soft hyphens (harmless with nowrap).
- Images: img-jung-treppe 1200x510, img-eltern-kuechentisch 1200x510, img-schule-klasse 1200x670, img-schule-sammelumschlag 1200x896, img-im-buero 1376x768, img-drei-briefe 400x400 (all in web/public/images/).
- Jest 29.7, testEnvironment node, only *.test.ts runs (use createElement, not JSX, in tests). Jest path patterns are case-sensitive: use "appHeader", not "AppHeader".
- Existing page-render precedent: web/src/__tests__/schulePage.test.ts (mocks next/link; next/image renders fine in node).

Heading measurement rule (use instead of a browser, D-02): Courier Prime advance is about 0.6em per character [ASSUMED from monospace metrics, orchestrator confirms visually]; with tracking-tight it is about 0.575em. Max characters per line = content width / (0.575 x font px). At 375px viewport the page column is 335px (px-5). Results: H1 at 24px (text-2xl) fits 24 chars/line, at 28px only 20.8 (so text-[1.75rem] breaks /jung and /eltern into 3 lines, do not use it on mobile). H1 at 32px (sm:text-[2rem]) in a 536px column fits 29 chars. H2 at 20px (text-xl, no tracking) fits 27 chars at 335px and 24 chars inside a card with p-5. Record the computed line splits per heading in SUMMARY.

Repo quirks: iCloud-evicted files can crash git or jest with "alias" errors, fix with `brctl download <file>`. The orchestrator owns the dev server; never delete web/.next/dev while it runs (next build writes web/.next, dev uses web/.next/dev).
</context>

<tasks>

<task type="tracer">
  <name>Task 1 (tracer): shared header CTA, scroll chip variant and motion utilities, wired end-to-end on /jung</name>
  <files>web/src/components/AppHeader.tsx, web/src/components/topics/TopicStarterGrid.tsx, web/src/app/globals.css, web/src/components/jung/JungExperience.tsx, web/src/components/eltern/ElternExperience.tsx, web/src/app/(site)/jung/page.tsx, web/src/__tests__/appHeader.test.ts, web/src/__tests__/topicStarters.test.ts, web/src/__tests__/__snapshots__/topicStarters.test.ts.snap</files>
  <read_first>web/src/components/AppHeader.tsx, web/src/components/topics/TopicStarterGrid.tsx, web/src/app/globals.css (lines 200-270), web/src/__tests__/appHeader.test.ts, web/src/__tests__/topicStarters.test.ts, web/src/components/campaigns/SchreibMerzExperienceV2.tsx (lines 170-185, read only)</read_first>
  <action>
Step A, regression gate FIRST (D-07/D-09, SchreibMerz must render identically): before editing TopicStarterGrid, add a describe "TopicStarterGrid numbered" to web/src/__tests__/topicStarters.test.ts that renders TopicStarterGrid via createElement + renderToStaticMarkup with variant "numbered", three fixture topics (id, title, eyebrow), selectedIds ["a"] and limitReached true (covers selected, disabled and default states), and asserts toMatchSnapshot(). Run `cd web && npx jest topicStarters` on the UNMODIFIED component so the snapshot file web/src/__tests__/__snapshots__/topicStarters.test.ts.snap records today's markup. Only then continue. Never update this snapshot with -u afterwards.

Step B, TopicStarterGrid (D-07, D-09, D-06): change the variant union to "numbered" | "scroll". The old quiet-chip branch (the second variant today) has no users left after this task (grep confirmed only Jung/Eltern), so convert it into "scroll" instead of keeping dead code; rewrite the German JSDoc on the prop so it describes only "numbered" and "scroll" and no longer names the old variant anywhere in code or comments. The numbered branch, its container class string and its markup stay byte-identical. Scroll container: a single flex row with classes chip-scroll-fade scrollbar-hide mt-2 flex snap-x gap-2 overflow-x-auto -mx-1 py-1 pl-1 pr-10 sm:mt-3 (py-1/pl-1 keep the 2px focus ring + 2px offset from being clipped, pr-10 lets the last chip leave the fade zone at the scroll end). Chip button: flex h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 font-body text-[0.95rem] font-semibold transition-colors plus the existing focus-visible ring classes, the existing selected / disabled / default colour classes and the existing small ✓/+ indicator circle from the old plain branch. Keep aria-pressed, disabled, type="button" and onToggle exactly as before. Shape: rounded-lg per the D-06 radius system (the word "pills" in the brief is read as chip shape, not rounded-full). One row at all breakpoints as locked; note in SUMMARY that desktop mouse users scroll it via trackpad, shift+wheel or Tab, and offer "wrap from sm" as a follow-up option for Thomas. Switch JungExperience and ElternExperience to variant="scroll" (one prop each, nothing else in those files in this task).

Step C, globals.css (D-03, all CSS, no dependency): add three keyframes next to the existing ones: reveal-in (opacity 0 + translateY(16px) to opacity 1 + no transform), step-connector-draw (scaleY(0) to scaleY(1)), fade-in-row (opacity 0 + translateY(6px) to opacity 1). Add a base rule .step-connector (always on, so it is visible when not animated): background is a vertical repeating-linear-gradient in airmail style using var(--color-airmail-rot) 0 6px, transparent 6px 10px, var(--color-airmail-blau) 10px 16px, transparent 16px 20px; transform-origin top. Add a block @supports (animation-timeline: view()) containing @media screen and (prefers-reduced-motion: no-preference) with: .reveal using LONGHANDS only (animation-name reveal-in, animation-timing-function linear, animation-fill-mode both, animation-duration auto, animation-timeline view(), animation-range entry 0% cover 25%) and .step-connector with the same longhands but animation-name step-connector-draw and animation-range entry 10% cover 50%. Use longhands because the animation shorthand resets animation-timeline and Lightning CSS may reorder shorthand + longhand pairs; "screen" keeps printed pages static. Add @media screen and (prefers-reduced-motion: no-preference) with .fade-in-row animation fade-in-row 260ms cubic-bezier(0.16, 1, 0.3, 1) both (time-based, plays when a hidden element becomes displayed). Next to .scrollbar-hide add .chip-scroll-fade with mask-image and -webkit-mask-image linear-gradient(to right, #000 calc(100% - 2.5rem), transparent). Add .reveal, .step-connector and .fade-in-row to the selector list of the existing @media (prefers-reduced-motion: reduce) block (animation none !important). No infinite animations, no height/width animation, transform and opacity only.

Step D, AppHeader (D-01): extract the NGO CTA class string verbatim into a module const PRIMARY_CTA_CLASS and append the focus-visible outline classes already used on the "Weitere Kampagnen" link (focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen); use it for the NGO CTA and the new school CTA. Add a module const SCHOOL_PAGE_CTAS keyed by exact pathname: "/jung" and "/eltern" map to href "#schreiben", label "Brief entwerfen", mobileLabel "Schreiben"; "/schule" maps to href "#klassenlink", label "Klassenlink erstellen", mobileLabel "Klassenlink". Look it up with the current pathname (only these three keys, so /mitbestimmen-ohne-wahlrecht, /projekttag-demokratie and /schule/ablauf get none). Render it in the right-hand action group as a plain anchor element (not next/link): a fragment-only href keeps /jung?k=TOKEN intact and the browser applies scroll-margin and smooth scrolling natively. Inside: a span with sm:hidden for mobileLabel and a span with hidden sm:inline for label, same pattern as "Starten"/"Kampagne starten". Sub-nav, logo, NGO links and manager slots unchanged.

Step E, wire one path end-to-end on /jung (tracer): in web/src/app/(site)/jung/page.tsx wrap the JungExperience element in a div with id="schreiben" and className scroll-mt-32 (header is about 107px with two rows, 128px leaves breathing room), and add className reveal to the existing FAQ section (keep its mt-14). Nothing else on the page yet.

Step F, tests: in web/src/__tests__/appHeader.test.ts add it.each cases: on /jung and /eltern the markup contains href="#schreiben", "Brief entwerfen" and ">Schreiben<"; on /schule it contains href="#klassenlink", "Klassenlink erstellen" and ">Klassenlink<"; on /mitbestimmen-ohne-wahlrecht, /projekttag-demokratie and / it contains neither "#schreiben" nor "#klassenlink"; on /ngo-briefkampagne it still contains "Kampagne starten" and href="/kampagne/starten". In topicStarters.test.ts add a "TopicStarterGrid scroll" test: markup contains overflow-x-auto, snap-x, chip-scroll-fade, whitespace-nowrap, aria-pressed="true" for the selected chip, a disabled attribute on the others when limitReached, and does not contain grid-cols-2.

Commit: `feat(quick-261027-ore): Header-CTA, Chip-Scrollreihe und Scroll-Reveal fuer Schulseiten` with the trailer line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Between this commit and Tasks 2/3 the /eltern and /schule header anchors have no target yet; that is fine because nothing is pushed.
  </action>
  <verify>
    <automated>cd web && npx jest appHeader topicStarters && npx tsc --noEmit -p . && npx eslint src/components/AppHeader.tsx src/components/topics/TopicStarterGrid.tsx src/components/jung/JungExperience.tsx src/components/eltern/ElternExperience.tsx "src/app/(site)/jung/page.tsx" src/__tests__/appHeader.test.ts src/__tests__/topicStarters.test.ts && npm run build && grep -rlq "animation-timeline" .next/static && grep -rlq "animation-range" .next/static</automated>
  </verify>
  <acceptance_criteria>
    - The numbered snapshot was written before TopicStarterGrid changed and passes unchanged after (jest reports "1 snapshot written" on the first run against the unmodified component and "0 written, 0 updated" afterwards).
    - `grep -rn '"plain"' web/src/components web/src/app` prints nothing.
    - `grep -n "animation-timeline: view()" web/src/app/globals.css` prints at least 2 lines; `grep -n "\.reveal" web/src/app/globals.css` prints at least 2 lines (rule + reduced-motion list).
    - The production CSS under web/.next/static still contains animation-timeline and animation-range (Lightning CSS did not drop them).
    - web/src/components/campaigns/SchreibMerzExperienceV2.tsx has no diff.
  </acceptance_criteria>
  <done>The header shows the right CTA on exactly /jung, /eltern, /schule; tapping it on /jung jumps to the form at #schreiben; /jung and /eltern chips are one scrollable row; the reveal/connector/fade utilities exist with both guards and survive the production build; all listed checks pass; one commit, not pushed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: /jung and /eltern rework (first-screen form on /jung, doors on /eltern)</name>
  <files>web/src/app/(site)/jung/page.tsx, web/src/components/jung/JungExperience.tsx, web/src/app/(site)/eltern/page.tsx, web/src/__tests__/jungEntry.test.ts, web/src/__tests__/elternHandoff.test.ts</files>
  <read_first>web/src/app/(site)/jung/page.tsx, web/src/components/jung/JungExperience.tsx, web/src/app/(site)/eltern/page.tsx, web/src/components/editorial/Figure.tsx, web/src/__tests__/jungEntry.test.ts (lines 1-45), web/src/__tests__/elternHandoff.test.ts (lines 1-15), web/public/images/img-jung-treppe.webp, web/public/images/img-eltern-kuechentisch.webp, web/public/images/img-im-buero.webp, web/public/images/img-drei-briefe.webp (view the images with the Read tool before cropping or choosing)</read_first>
  <behavior>
    - /jung without k: HTML contains id="schreiben", the h1 text "Wählen darfst du noch nicht. Schreiben schon.", seven name="klasse" radios, "Brief entwerfen", overflow-x-auto (scroll chips), step-connector and reveal; no Caveat class, no em dash.
    - /jung with a valid signed token (signClassToken with FEEDBACK_TOKEN_SECRET set, klasse 9, plz 28195): HTML contains "Klasse 9 und PLZ 28195 sind über den Klassenlink eingetragen." and an "ändern" button, and contains no name="klasse" radio.
    - /jung with a broken token: HTML contains "Dieser Klassenlink ist abgelaufen oder ungültig."
    - /eltern: HTML contains the h1 "Schreib der Politik, was an der Schule fehlt.", href="#schreiben", href="#sicher", id="schreiben", id="sicher", "Ist das sicher?", the unchanged bullet "Im Jugendmodus bekommt dein Kind nur die eine Mail mit dem Entwurf: keine Erinnerungen, keine Spendenbitte, keine Frage nach einer Partei, keine Kartenfunktion.", the Niedersachsen source sentence, application/ld+json; no Caveat class, no em dash.
  </behavior>
  <action>
Write the behavior tests first (RED), then implement (GREEN). Tests: in jungEntry.test.ts add describe "/jung page" (file-level jest.mock for next/navigation returning useRouter with prefetch/push jest.fn, next/link mocked like schulePage.test.ts, @/components/audio/VoiceRecorder returning null, and a guard jest.mock("@/lib/mistral", () => ({}))). Set FEEDBACK_TOKEN_SECRET in a beforeAll, import the page dynamically, await JungPage({ searchParams: Promise.resolve({ k }) }) and renderToStaticMarkup the result. In elternHandoff.test.ts add describe "/eltern page" with the same mocks and a plain render of the default export. Existing tests in both files stay untouched.

/jung page (D-07, D-02, D-05, D-10). The first-screen budget at 375x812 (conservative estimates, header about 115px incl. airmail stripe) is the main constraint; keep these exact values: container pt-4 sm:pt-10 (rest unchanged). The invalid-link banner stays on the page (mb-4). Remove the valid-link banner from the page (it moves into JungExperience, see below). Hero image: keep src, alt, width/height, priority; className mb-4 h-24 w-full rounded-xl object-cover shadow-md shadow-waldgruen/10 sm:mb-6 sm:h-auto, plus an object-position (for example object-[center_35%]) chosen after viewing the image so faces and the letter stay in the strip; on sm+ it sits above the headline at natural aspect. H1: one element, text "Wählen darfst du noch nicht. Schreiben schon.", classes font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-pretty sm:text-[2rem] (24px gives "Wählen darfst du noch" / "nicht. Schreiben schon." on mobile; 32px fits "Wählen darfst du noch nicht." on line one at sm+; text-balance would force the less natural even split there). Intro: mt-2 mb-5 font-body text-base leading-relaxed text-warmgrau sm:mt-4 sm:mb-7 sm:text-lg with the text "Erzähl, was dich stört. Ich schreibe dir einen Entwurf an die zuständige Person." (14 words, about 80 characters, 2 lines at 375px; Thomas' 103-character example needs 3 lines and costs the button its place on screen; list both in SUMMARY). The id="schreiben" wrapper from Task 1 stays.
Below the form (all three sections get className reveal, the closing cross-link paragraphs do not because they are short and at the page end): "So geht's" h2 (font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl, same class for all H2 on this page): ol mt-6 space-y-6, each li relative flex gap-4; number circle span aria-hidden relative z-10 h-8 w-8 shrink-0 rounded-full border border-waldgruen/40 bg-creme (bg hides the connector behind it) with the number; for every item except the last an aria-hidden span with className step-connector absolute left-[15px] top-9 -bottom-5 w-0.5 (runs from below this circle to 4px above the next one); content: step title as its own line in font-body font-bold text-waldgruen-dark (no "Schritt 1" text, no trailing colon) and the step text below in mt-1 font-body text-base leading-relaxed text-warmgrau. Capitalise the first step text to "Ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." (it used to follow a colon). The connector stays vertical on desktop too: the column is max-w-xl, three horizontal steps would be cramped (Thomas allowed scaleY or scaleX). "Warum dein Brief zählt" (renamed from "Warum gerade dein Brief zählt", 22 chars): the three existing list items unchanged; optionally one supporting image via the existing Figure component (side right, rotate right, real width/height) choosing img-im-buero or img-drei-briefe only if, after viewing, it shows a letter being read or arriving; otherwise no image, and say which in SUMMARY. "Häufige Fragen" with FAQAccordion unchanged. Cross-link paragraphs unchanged. Metadata, faqs, jsonLd and steps texts (except the capitalisation) unchanged.

JungExperience (D-07, D-10). Card: keep the airmail stripe and outer classes; inner padding p-4 sm:p-7 and spacing space-y-4 sm:space-y-8. Step headings (legend and both h2): text-base sm:text-lg, keep the numbers 1/2/3. New state showPicker initialised to entry.status !== "valid". When showPicker is false (valid link), render instead of the fieldset a confirmation row: flex items-start justify-between gap-3 rounded-lg border border-waldgruen/25 bg-waldgruen/5 px-3 py-2.5 containing a p with role="status" (font-body text-sm leading-snug text-waldgruen-dark) that starts with the same aria-hidden step number "1" span style as the legends, then the text "Klasse {entry.klasse} und PLZ {entry.plz} sind über den Klassenlink eingetragen.", and a type="button" "ändern" button (aria-label "Klasse ändern", -my-1 shrink-0 rounded-lg px-2 py-1 font-body text-sm font-semibold text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark with the focusRing const). Clicking it sets showPicker true and in a requestAnimationFrame focuses the checked radio inside klasseGroupRef. In continueToWizard, if the reason is "klasse" and the picker is hidden, show it first and focus in a requestAnimationFrame. The klasse state, sessionStorage restore effect, selectKlasse, validateJungSubmit, buildJungHandoff, saveHandoff, router.push, input name="klasse", ids and aria wiring stay as they are. Class chips (fieldset content): container mt-2 grid max-w-sm grid-cols-7 gap-1.5 sm:mt-3; chip span h-11 w-full (drop min-w-11 and px-3), rest unchanged. Note for SUMMARY: inside the card (p-4) the row is 301px wide, so 7 chips are about 38px wide by 44px tall; 44x44 is geometrically impossible in one row there; 38x44 passes WCAG 2.5.8 (24px). Step 2: remove the help paragraph and instead append to the h2 an inline span " (bis zu zwei)" in font-body text-sm font-normal text-warmgrau/70 (same pattern as "(optional)" on /eltern); the starter mechanics are still explained by the existing status message after the first tap. Step 3: keep the help p with id="jung-text-help" (aria-describedby stays) but shorten it to one line, "Du kannst auch sprechen statt tippen."; textarea rows={3} with min-h-24 sm:min-h-44 replacing min-h-44, mt-2 sm:mt-3. Status p (id jung-status, aria-live polite, always rendered): remove min-h-5 and use mt-3 empty:mt-0 so it takes no space until a message exists; button mt-3. The note under the button stays word for word. List every helper-copy change old to new in SUMMARY.
Expected budget (conservative): no link, button bottom about 810px; valid link about 795px; calibrated against Thomas' measured y=591 for today's class picker, real values should be roughly 30px lower. If the orchestrator measures a miss, the knobs in order are: image h-20, drop the step-3 help line, shorter intro.

/eltern page (D-09, D-02, D-05, D-10): container pt-4 sm:pt-10. Image like /jung (h-24 object-cover with an object-position chosen after viewing, sm:h-auto, keep alt/priority/size props), mb-4 sm:mb-6. H1 one element "Schreib der Politik, was an der Schule fehlt." with font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-balance sm:text-[2rem] (tightest case: one 24-character line at 24px is about 331px of 335px; flag for the orchestrator). Subtext (mt-2 sm:mt-4, same body classes as /jung intro): "Unterrichtsausfall, gesperrte Turnhalle, verspäteter Schulbus? Ich suche die zuständige Ebene und schreibe dir einen Entwurf zum Abschreiben." (16 words). Directly below: a grid mt-6 gap-3 sm:grid-cols-2 with two anchor elements (fragment links, rounded-xl border border-waldgruen/20 bg-white p-4 transition-colors hover:border-waldgruen/45 plus focus-visible ring classes, flex items-start justify-between gap-3): first href="#schreiben", title "Ich will selbst schreiben" (font-body text-base font-bold text-waldgruen-dark, a span, not a heading) and description "Anliegen schildern, Entwurf bekommen, von Hand abschreiben." (font-body text-sm text-warmgrau/80); second href="#sicher", title "Mein Kind hat es in der Schule genutzt", description "Welche Daten verarbeitet werden und welche nicht."; each ends with WizardForwardIcon className "mt-1 shrink-0 rotate-90 text-waldgruen" (reused icon pointing down = jump on this page). The door labels differ from the header label "Brief entwerfen" because Thomas locked them; note it against the skill's duplicate-intent rule in SUMMARY. Then a div id="schreiben" className mt-8 scroll-mt-32 around ElternExperience. "Wer ist zuständig?" section: add reveal; both h3 become font-typewriter text-xl font-bold with their current colours (waldgruen / airmail-blau); card, texts and the Niedersachsen note unchanged. Data section: id="sicher" plus aria-labelledby kept, className reveal mt-14 scroll-mt-32, h2 text "Ist das sicher?", bullets and the Datenschutz//schule link paragraph unchanged word for word. FAQ section gets reveal, FAQAccordion and faqs unchanged; footer paragraph unchanged. All H2 on /eltern use font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl. Metadata, faqs and jsonLd unchanged.

Apply the design-taste-frontend section 14 pre-flight items that apply (zero em dashes, light theme only, waldgruen as the one accent, rounded-lg controls / rounded-xl cards, button contrast, no CTA wrap at desktop, no eyebrows, reduced motion) and note the result in SUMMARY. Commit: `feat(quick-261027-ore): /jung und /eltern umgebaut (Formular im ersten Screen, zwei Einstiege)` with the Co-Authored-By trailer.
  </action>
  <verify>
    <automated>cd web && npx jest jung eltern topic appHeader && npx tsc --noEmit -p . && npx eslint "src/app/(site)/jung/page.tsx" "src/app/(site)/eltern/page.tsx" src/components/jung/JungExperience.tsx src/__tests__/jungEntry.test.ts src/__tests__/elternHandoff.test.ts && ! grep -rn "font-handwriting" "src/app/(site)/jung" "src/app/(site)/eltern" src/components/jung src/components/eltern</automated>
  </verify>
  <acceptance_criteria>
    - New page-render tests failed before the page changes and pass after.
    - Before committing, `git diff HEAD -- "web/src/app/(site)/jung/page.tsx" "web/src/app/(site)/eltern/page.tsx"` (working tree vs HEAD, intentionally uncommitted) shows no change inside metadata, faqs, jsonLd, the /eltern data bullets or the Datenschutz links.
    - JungExperience still saves the handoff via buildJungHandoff/saveHandoff and still renders inputs with name="klasse" when the picker is visible; jungHandoff.ts and elternHandoff.ts have no diff.
    - The /jung page HTML contains exactly one h1 and every h2 text on both pages is 22 characters or fewer.
  </acceptance_criteria>
  <done>/jung shows image strip, two-line H1, short intro and the compact form with the submit button inside the first phone screen (pending orchestrator measurement); valid class links show the confirmation with "ändern"; /eltern shows the two doors, the form at #schreiben and "Ist das sicher?" at #sicher; all checks pass; one commit, not pushed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: /schule rework with 45|90 toggle, then full verification</name>
  <files>web/src/app/(site)/schule/page.tsx, web/src/components/schule/LessonPlanToggle.tsx, web/src/components/schule/ClassLinkGenerator.tsx, web/src/__tests__/schulePage.test.ts</files>
  <read_first>web/src/app/(site)/schule/page.tsx, web/src/lib/schule/lessonPlan.ts, web/src/components/schule/ClassLinkGenerator.tsx (lines 70-95), web/src/components/FAQAccordion.tsx, web/src/components/editorial/Figure.tsx, web/src/__tests__/schulePage.test.ts, web/public/images/img-schule-klasse.webp (view before cropping)</read_first>
  <behavior>
    - The "/schule page" test asserts this order: "Deine Klasse schreibt an die Politik.", href="#klassenlink", href="#ablauf", id="klassenlink", "Vorher kurz prüfen", id="ablauf", "Ablauf der Stunde", LESSON_45[0].phase, "Zusätzlich zum Ablauf oben:", LESSON_90_EXTRAS[0], "/schule/ablauf", "Warum das wirkt", "Warum Handschrift?", id="schulleitung", id="schule-leitung", href="/eltern#sicher", "projekttag-demokratie", "Häufige Fragen", href="/jung".
    - It also asserts: application/ld+json present, aria-pressed="true" on the 45 button, the 90 extras block carries the hidden attribute in the default render, the Schulleitung bullet "Der Klassenlink enthält nur Klassenstufe, Schul-Postleitzahl und den Zeitpunkt der Erstellung, keine Namen. Er gilt 14 Tage." is present, no table element (no "<table"), no Caveat class, no em dash.
    - Existing lessonPlan, class link helper and CampaignQrDownload tests stay unchanged and green.
  </behavior>
  <action>
Update the "/schule page" test in schulePage.test.ts to the behavior above first (RED), then implement (GREEN).

LessonPlanToggle (new file web/src/components/schule/LessonPlanToggle.tsx, "use client", D-08, D-03): imports LESSON_45, LESSON_90_EXTRAS and formatMinuteRange from @/lib/schule/lessonPlan (lib unchanged). State mode 45 | 90, default 45. Control: div role="group" aria-label "Länge der Stunde" with mt-4 inline-flex rounded-xl border border-waldgruen/25 bg-white p-1, two type="button" buttons "45 Min" and "90 Min" with aria-pressed, min-h-10 rounded-lg px-4 font-body text-sm font-semibold transition-colors and focus-visible ring classes; pressed bg-waldgruen text-creme, otherwise text-warmgrau hover:bg-waldgruen/5 (rounded-xl container with p-1 around rounded-lg buttons keeps the corners concentric). The 90 button gets aria-controls pointing at the extras id. Timeline: ol mt-6, each LESSON_45 row an li grid grid-cols-[5.5rem_1fr] gap-x-4 (5.5rem fits "25–40 Min" in Courier text-sm); left a span pt-0.5 font-typewriter text-sm font-bold text-waldgruen with formatMinuteRange(row) followed by " Min"; right a div border-l-2 border-dashed border-waldgruen/25 pl-4 pb-6 (no pb on the last row) with the phase in font-body text-base font-bold text-waldgruen-dark and the description below in mt-1 font-body text-base leading-relaxed text-warmgrau. Extras: a div with an id, always rendered (SEO, content in DOM) and hidden when mode is 45, containing the existing sentence "Zusätzlich zum Ablauf oben:" and a ul whose li items each carry className fade-in-row with an inline animationDelay of index x 40ms, flex gap-3, an aria-hidden "+" in font-typewriter font-bold text-waldgruen and the extra text. The fade plays because a hidden element becoming displayed starts its CSS animation; nothing animates height.

/schule page (D-08, D-02, D-04, D-05, D-10): outer container mx-auto w-full max-w-5xl px-5 pb-16 pt-6 sm:pt-10. Hero section (aria-labelledby the h1 id) with md:grid md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10; text column first, image second (mobile: text, then image strip). H1 one element "Deine Klasse schreibt an die Politik." with font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-balance sm:text-[2rem] md:text-[1.75rem] lg:text-[2rem] (md text column is about 370px, so 28px fits "Deine Klasse schreibt" with 21 of 22.9 chars). Subtext mt-3 body classes sm:text-lg: "In einer Schulstunde schreiben deine Schüler:innen echte Briefe an ihre Abgeordneten. Los geht es per QR-Code." (17 words; drops "Kostenlos, ohne Accounts" because the fact row below says exactly that; note in SUMMARY). Fact row: ul mt-4 flex flex-wrap gap-x-5 gap-y-1 font-typewriter text-sm font-bold text-waldgruen-dark with "45 oder 90 Minuten", "Kostenlos", "Ohne Accounts" as plain items (no icons, no dots, no separators). CTA row mt-6 flex flex-col gap-3 sm:flex-row: primary anchor href="#klassenlink" "Klassenlink erstellen" (inline-flex min-h-12 items-center justify-center rounded-lg bg-waldgruen px-5 py-3 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark active:scale-[0.98] + focus-visible ring), secondary anchor href="#ablauf" "Ablauf ansehen" (same sizing, border border-waldgruen/40 bg-white text-waldgruen-dark hover:bg-waldgruen/5). Image: keep src/alt/width/height/priority, sizes "(min-width: 768px) 460px, 100vw", className mt-8 aspect-[5/2] w-full rounded-xl object-cover shadow-md shadow-waldgruen/10 md:mt-0 md:aspect-auto md:h-auto plus an object-position chosen after viewing.
Everything after the hero sits in a div mx-auto max-w-2xl. All H2 use font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl (update the h2Class const). Order:
1. div id="klassenlink" className mt-10 scroll-mt-32 around ClassLinkGenerator. In ClassLinkGenerator change only the h2 size classes to text-xl sm:text-2xl ("Klassenlink erstellen" is 21 chars, at text-2xl it wraps inside the p-5 card); no logic change.
2. "Vorher kurz prüfen" section (reveal mt-14, id schule-pruefen kept): ul mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2 (one column below md), each PRECHECK_ITEMS item an li flex gap-3 with a local CheckIcon (inline SVG function in this file following the WizardForwardIcon pattern: 24 viewBox, stroke currentColor, strokeWidth 2.25, round caps, aria-hidden, single check path, h-5 w-5 mt-0.5 shrink-0 text-waldgruen) and the item text in body classes.
3. Section id="ablauf" (reveal mt-14 scroll-mt-32, aria-labelledby schule-ablauf) with h2 "Ablauf der Stunde", LessonPlanToggle, then the COLLECTIVE_ENVELOPE_NOTE in a box mt-6 rounded-xl border border-dashed border-waldgruen/30 bg-white/70 p-4 with body classes, then the existing print link paragraph "Ablauf, Arbeitsblatt und Tafelbild zum Ausdrucken" to /schule/ablauf. The old 45 table and the separate "Mit 90 Minuten" section are removed (their content now lives in the toggle).
4. "Warum das wirkt" section (reveal mt-14 flow-root, h2 id schule-warum): the existing Figure for img-schule-sammelumschlag (moved here from "Warum Handschrift", same props), the existing KMK paragraph word for word, then a div clear-both mt-5 with FAQAccordion items containing one entry, q "Warum Handschrift?" and a = the existing handwriting paragraph word for word (reuses FAQAccordion per D-04, content stays in DOM), then the existing "Mehr dazu unter ..." paragraph with both links, visible.
5. "Für die Schulleitung" (Entscheidung 8B): section id="schulleitung" className reveal mt-14 scroll-mt-32 aria-labelledby schule-leitung, with the visible h2 id="schule-leitung" "Für die Schulleitung" (keeps /projekttag-demokratie's #schule-leitung link working; a heading inside summary would lose its heading role in some screen readers, so the h2 stays outside). Below it a native details element styled like FAQAccordion (group mt-4 -mx-3 rounded-lg border-y border-waldgruen/15 px-3 transition-colors duration-150 with the open-state background and chevron rotation selectors copied from FAQAccordion), summary with the same summary classes and span classes as FAQAccordion and the text "Datenschutz und Technik im Überblick", plus a local ChevronIcon in this file mirroring FAQAccordion's (FAQAccordion.tsx is outside the file boundary; mention "export ChevronIcon from FAQAccordion" as a follow-up in SUMMARY). Inside details: the seven existing bullets word for word in the existing ul. After the details, visible: the Elternbrief paragraph with its Link href changed from /eltern to /eltern#sicher (text unchanged), and the "Alle Details stehen in der ..." paragraph unchanged.
6. "Projekttag" section (reveal mt-14, h2 id schule-gross kept, text "Projekttag"): the existing paragraph and link unchanged, wrapped in a card rounded-xl border border-waldgruen/20 bg-white p-5 so this block reads differently from the text sections above.
7. "Häufige Fragen" section (reveal) with FAQAccordion and faqs unchanged; final /jung paragraph unchanged.
Metadata, DATA_SUMMARY, faqs and jsonLd unchanged.

Final full verification for the whole plan: full jest, full lint, build. Then write SUMMARY (see output). Commit: `feat(quick-261027-ore): /schule umgebaut (Split-Hero, Ablauf-Umschalter, Schulleitung aufklappbar)` with the Co-Authored-By trailer. Never push.
  </action>
  <verify>
    <automated>cd web && npx jest schule && npx tsc --noEmit -p . && npm run lint && npx jest && npm run build && ! grep -rn "font-handwriting" "src/app/(site)/schule" src/components/schule</automated>
  </verify>
  <acceptance_criteria>
    - schulePage.test.ts "/schule page" test failed before the page change and passes after; the other describes in that file are unchanged.
    - Before committing, `git diff HEAD -- "web/src/app/(site)/schule/page.tsx" web/src/components/schule/ClassLinkGenerator.tsx web/src/lib/schule/lessonPlan.ts` (working tree vs HEAD, intentionally uncommitted) shows no change inside metadata, DATA_SUMMARY, faqs, jsonLd or the seven Schulleitung bullet texts, no lessonPlan.ts change, and a ClassLinkGenerator.tsx change limited to the h2 className.
    - `grep -n 'id="schule-leitung"' "web/src/app/(site)/schule/page.tsx"` prints one line.
    - Full `npx jest`, `npm run lint` and `npm run build` pass.
  </acceptance_criteria>
  <done>/schule shows the split hero with "Klassenlink erstellen" and "Ablauf ansehen", the generator at #klassenlink, checklist, toggleable timeline at #ablauf, merged "Warum das wirkt", collapsible Schulleitung at #schulleitung with unchanged privacy text, Projekttag card and FAQ; full test/lint/build green; SUMMARY written; three commits on main, none pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query -> server page | /jung reads ?k= (class token); verification via resolveJungEntry/verifyClassToken is unchanged |
| Server page -> client islands | JungExperience and the new LessonPlanToggle receive only non-secret props (klasse, plz, token already in the URL; static lesson data) |
| Page copy -> users and schools | Privacy and data-processing statements are relied on by Schulleitungen and parents |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261027-ore-01 | Information disclosure | JungExperience confirmation / header CTA | low | mitigate | Confirmation shows only klasse and plz from the verified entry (never bucketId, as today); header CTA is a fragment-only href, so the token never leaves the page or reaches a new URL |
| T-261027-ore-02 | Repudiation (compliance) | /schule Schulleitung bullets, /eltern "Ist das sicher?" bullets, FAQ answers | medium | mitigate | Word-for-word preservation required in actions; render tests assert a full Schulleitung bullet and a full /eltern bullet; git diff review of those lines in acceptance criteria |
| T-261027-ore-03 | Denial of service (content availability) | .reveal / .step-connector in globals.css | medium | mitigate | Animations only inside @supports (animation-timeline: view()) and screen + prefers-reduced-motion: no-preference; added to the reduce override; no overflow-hidden ancestors; range entry 0% cover 25% plus the site footer guarantee full opacity is reachable; build output checked for animation-timeline/animation-range |
| T-261027-ore-04 | Tampering | wizard handoff (jungHandoff/elternHandoff) | low | accept | Handoff modules are not edited; only presentation changes in the Experience components; existing handoff tests keep running |
| T-261027-ore-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this plan (CLAUDE.md forbids new SDKs); any install attempt is out of scope and must stop for Thomas |
</threat_model>

<verification>
- After Task 1: header CTA tests, numbered snapshot (pre-change) and scroll-variant test green; production CSS contains animation-timeline and animation-range.
- After Task 2: /jung and /eltern page-render tests green; no Caveat class in jung/eltern files.
- After Task 3: full `cd web && npx jest`, `cd web && npm run lint`, `cd web && npm run build` green; no Caveat class in schule files; SchreibMerzExperienceV2.tsx, wizard, API routes, lib/, prompts and mails have no diff (`git diff --stat HEAD~3` lists only files from files_modified).
- Browser checks are the orchestrator's (listed in output), not the executor's.
</verification>

<success_criteria>
- All D-01 to D-10 truths in must_haves hold (browser-dependent ones confirmed by the orchestrator).
- Three commits `feat(quick-261027-ore): ...`, each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, on main, not pushed.
- No new dependency in web/package.json, no dark mode, no icon library, no changes outside the file boundary.
</success_criteria>

<output>
Create `.planning/quick/261027-ore-schulseiten-jung-schule-eltern-ux-umbau/261027-ore-SUMMARY.md` with:
1. Final H1/H2 per page with the computed line split at 375px (chars per line math).
2. Copy changes old -> new: /jung intro, step-2 help (now "(bis zu zwei)"), step-3 help, step-1 capitalisation, "Warum dein Brief zählt"; /eltern H1, subtext, door descriptions, "Ist das sicher?"; /schule subtext (dedup), H2 renames, "Datenschutz und Technik im Überblick".
3. Deviations and why: class chips about 38x44px (44x44 impossible in one row inside the card), "plain" variant replaced by "scroll", connector vertical on desktop, chips one row also on desktop (offer "wrap from sm"), door labels vs header label (locked), local ChevronIcon copy (follow-up: export from FAQAccordion), image choice for "Warum dein Brief zählt".
4. Orchestrator browser checklist: (a) /jung 375x812 without k and with a valid k (generate one via the /schule generator locally): bottom of "Brief entwerfen" at most 812px, with a valid link at least 24px margin; if it misses, apply knobs in order: image h-20, drop step-3 help line, shorter intro; (b) header CTA jumps on all three pages land below the two-row header, ?k= survives on /jung; /eltern door links, /schule "Ablauf ansehen", /schule#schulleitung and /projekttag-demokratie -> /schule#schule-leitung; (c) H1 max 2 lines and H2 one line at 375px on all three pages (tightest: /eltern H1 at 24px); (d) reveal and connector animate in Chrome, static with DevTools reduced-motion emulation and in a browser without scroll-timeline support, nothing stuck transparent at the page end; (e) 45|90 toggle by mouse and keyboard, rows fade in; (f) /schreib-merz topic tiles unchanged; (g) desktop 1280px: /schule split hero, /jung image above H1; (h) stale preview: stop dev server, `rm -rf web/.next/dev`, restart.
5. Design-taste pre-flight result (applicable items) and test/lint/build evidence.
</output>
