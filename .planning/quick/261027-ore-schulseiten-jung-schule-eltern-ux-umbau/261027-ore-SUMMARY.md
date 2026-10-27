---
phase: quick-261027-ore
plan: 01
subsystem: ui
tags: [schule, jung, eltern, header-cta, css-scroll-animation, redesign-preserve]
requires: []
provides:
  - "Header primary CTA per school page (/jung, /eltern, /schule)"
  - "TopicStarterGrid variant 'scroll' (one-row chips)"
  - "CSS utilities .reveal, .step-connector, .fade-in-row, .chip-scroll-fade"
  - "LessonPlanToggle (45|90) on /schule"
affects: [jung, eltern, schule, AppHeader]
tech-stack:
  added: []
  patterns: ["CSS scroll-driven animation behind @supports + screen + no-preference", "fragment-only anchors with scroll-mt-32"]
key-files:
  created:
    - web/src/components/schule/LessonPlanToggle.tsx
    - web/src/__tests__/__snapshots__/topicStarters.test.ts.snap
  modified:
    - web/src/components/AppHeader.tsx
    - web/src/components/topics/TopicStarterGrid.tsx
    - web/src/app/globals.css
    - web/src/app/(site)/jung/page.tsx
    - web/src/components/jung/JungExperience.tsx
    - web/src/components/eltern/ElternExperience.tsx
    - web/src/app/(site)/eltern/page.tsx
    - web/src/app/(site)/schule/page.tsx
    - web/src/components/schule/ClassLinkGenerator.tsx
    - web/src/__tests__/appHeader.test.ts
    - web/src/__tests__/topicStarters.test.ts
    - web/src/__tests__/jungEntry.test.ts
    - web/src/__tests__/elternHandoff.test.ts
    - web/src/__tests__/schulePage.test.ts
decisions:
  - "Chips are one scrollable row at all breakpoints (locked); 'wrap from sm' is an open follow-up option"
  - "Time ranges in the /schule timeline keep the en dash from formatMinuteRange (number range, not a separator)"
metrics:
  tasks: 3
  tests: "169 suites, 1580 tests, 19 snapshots, all green"
status: complete
actuals:
  tasks: 3
  commits: 3
plan_head_before: c95e75ab02a0f1eb8ad9bfd172dfae7725a4612a
plan_head_after: c22b677a5a4903aea1ac5ad49b9b70ab23bc7d39
completed: 2026-10-27
---

# Phase quick-261027-ore Plan 01: Schulseiten /jung, /schule, /eltern UX-Umbau Summary

Redesign-Preserve of the three school pages: header CTA with in-page anchors, Courier-only headings, /jung form compacted for the first phone screen, /eltern two doors, /schule split hero with 45|90 timeline and collapsible Schulleitung block, plus CSS-only scroll motion (no new dependency).

## Commits (main, not pushed)

| Task | Commit | Message |
| --- | --- | --- |
| 1 (tracer) | 6cbcf42 | feat(quick-261027-ore): Header-CTA, Chip-Scrollreihe und Scroll-Reveal fuer Schulseiten |
| 2 | fcdcb8a | feat(quick-261027-ore): /jung und /eltern umgebaut (Formular im ersten Screen, zwei Einstiege) |
| 3 | c22b677 | feat(quick-261027-ore): /schule umgebaut (Split-Hero, Ablauf-Umschalter, Schulleitung aufklappbar) |

## 1. Final headings and line splits at 375px (column 335px)

Math: Courier Prime about 0.575em per char with tracking-tight; 24px H1 gives about 24 chars/line, H2 at 20px about 27 chars/line (24 inside a p-5 card). These are computed, not measured.

| Page | Heading | Size | Split |
| --- | --- | --- | --- |
| /jung | H1 "Wählen darfst du noch nicht. Schreiben schon." | 24px (sm 32px) | "Wählen darfst du noch" (21) / "nicht. Schreiben schon." (23); sm: "Wählen darfst du noch nicht." (28 of 29) / "Schreiben schon." |
| /jung | H2 So geht's (9), Warum dein Brief zählt (22), Häufige Fragen (14) | 20px | one line each |
| /eltern | H1 "Schreib der Politik, was an der Schule fehlt." | 24px | text-balance: "Schreib der Politik," (20) / "was an der Schule fehlt." (24, about 331 of 335px, TIGHTEST CASE) |
| /eltern | H2 Wer ist zuständig? (18), Ist das sicher? (15), Häufige Fragen (14); H3 Land, Schulträger (Courier 20px) | 20px | one line each |
| /schule | H1 "Deine Klasse schreibt an die Politik." | 24px (md 28px, lg 32px) | "Deine Klasse schreibt" (21) / "an die Politik." (15) |
| /schule | H2 Klassenlink erstellen (21, in card, limit 24), Vorher kurz prüfen (18), Ablauf der Stunde (16), Warum das wirkt (15), Für die Schulleitung (20), Projekttag (10), Häufige Fragen (14) | 20px | one line each |

The brand name appears in no heading. No Caveat (font-handwriting) class remains in jung, eltern, schule files (grep clean).

## 2. Copy changes (old -> new)

/jung
- H1: two spans ("Wählen darfst du noch nicht." + Caveat "Schreiben schon.") -> one Courier H1 "Wählen darfst du noch nicht. Schreiben schon."
- Intro: "Erzähl, was dich an der Schule, in deinem Ort oder bei deiner Zukunft stört. Ich finde heraus, wer in der Politik dafür zuständig ist, und schreibe dir einen Entwurf. Du schreibst ihn von Hand ab und schickst ihn mit der Post." -> "Erzähl, was dich stört. Ich schreibe dir einen Entwurf an die zuständige Person." (about 80 chars, 2 lines). Thomas' 103-character variant would need 3 lines at 375px and cost the button its place on screen; not used.
- Valid-link banner on the page "Über den Klassenlink sind Klasse N und PLZ NNNNN schon eingetragen." -> in the form card: "Klasse N und PLZ NNNNN sind über den Klassenlink eingetragen." plus "ändern" button (aria-label "Klasse ändern"); picker hidden until clicked or until submit fails with reason "klasse".
- Step 2 help paragraph "Wähl bis zu zwei Themen. Jedes fügt einen Satzanfang ein, den du selbst zu Ende schreibst." -> removed; heading now "Worum geht es dir? (bis zu zwei)".
- Step 3 help "Je genauer, desto stärker dein Brief. Du kannst auch sprechen statt tippen." -> "Du kannst auch sprechen statt tippen."
- Step 1 text of "So geht's": "ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." -> "Ein Thema und ein eigenes Erlebnis, das dauert zwei Minuten." (title on its own line, no "Titel:" colon).
- H2 "Warum gerade dein Brief zählt" -> "Warum dein Brief zählt". Image chosen: img-im-buero (handwritten letter on a desk, stack of airmail post, Reichstag dome in the window), via Figure, side right.
- Class chips: flex-wrap -> grid-cols-7 (about 38x44px inside the card).

/eltern
- H1 "Dein Kind schreibt an die Politik. / Du darfst auch." (Caveat second line) -> "Schreib der Politik, was an der Schule fehlt."
- Subtext "Unterricht fällt aus, die Turnhalle ist gesperrt, der Schulbus kommt zu spät? Schreib es der Person in der Politik, die dafür zuständig ist. Ich suche die Ebene heraus und schreibe dir einen Entwurf, den du von Hand abschreibst." -> "Unterrichtsausfall, gesperrte Turnhalle, verspäteter Schulbus? Ich suche die zuständige Ebene und schreibe dir einen Entwurf zum Abschreiben."
- New door cards: "Ich will selbst schreiben" / "Anliegen schildern, Entwurf bekommen, von Hand abschreiben." (#schreiben) and "Mein Kind hat es in der Schule genutzt" / "Welche Daten verarbeitet werden und welche nicht." (#sicher).
- H2 "Dein Kind hat Brief-nach-Berlin in der Schule benutzt?" -> "Ist das sicher?" (bullets and links word for word unchanged).
- H3 Land / Schulträger: Caveat -> Courier Prime 20px bold (same colours).

/schule
- H1 "Deine Klasse schreibt / an die Politik." (Caveat) -> one Courier H1 "Deine Klasse schreibt an die Politik."
- Subtext (long, 5 sentences) -> "In einer Schulstunde schreiben deine Schüler:innen echte Briefe an ihre Abgeordneten. Los geht es per QR-Code." ("Kostenlos, ohne Accounts" dropped here because the fact row says it).
- New fact row: 45 oder 90 Minuten / Kostenlos / Ohne Accounts; CTAs "Klassenlink erstellen" and "Ablauf ansehen".
- H2 renames: "Warum Jugendliche schreiben sollten" + "Warum Handschrift" -> merged "Warum das wirkt" (KMK paragraph visible, handwriting paragraph as accordion "Warum Handschrift?"); "Ablauf in 45 Minuten" + "Mit 90 Minuten" -> "Ablauf der Stunde" (toggle); "Größer machen: Projekttag oder Schulversammlung" -> "Projekttag" (text unchanged, now in a card).
- "Für die Schulleitung": the seven bullets (word for word) now sit inside a details "Datenschutz und Technik im Überblick"; the Elternbrief link now points to /eltern#sicher.
- "Vorher kurz prüfen": bullet list -> two-column checklist with check icons (same texts).

## 3. Deviations from plan

No Rule 1-3 auto-fixes were needed. Judgement calls and plan deviations:
- Class chips are about 38x44px inside the p-4 card (301px / 7 chips); 44x44 is impossible in one row there. 38x44 passes WCAG 2.5.8.
- Variant "plain" was replaced by "scroll" (no dead code); "numbered" untouched, snapshot written before the change and passing after (0 updates).
- Chips are one row on desktop too (as locked). Mouse users scroll via trackpad, shift+wheel or Tab. Follow-up option for Thomas: "wrap from sm".
- Step connector stays vertical on desktop (column is max-w-xl).
- Door labels on /eltern differ from the header label "Brief entwerfen" (locked by Thomas); this knowingly breaks the skill's duplicate-intent rule.
- LessonPlanToggle shows en dashes in time ranges ("25–40 Min") because formatMinuteRange returns them (number ranges, not separators). The /schule test therefore forbids the em dash and spaced " – ", not every en dash.
- Local ChevronIcon copy in schule/page.tsx (FAQAccordion.tsx is outside the file boundary). Follow-up: export ChevronIcon from FAQAccordion.
- Tests: the jung/eltern page-render tests live in the existing jungEntry.test.ts and elternHandoff.test.ts with file-level mocks (next/navigation, next/link, VoiceRecorder, @/lib/mistral guard); existing tests unchanged and green.
- `tsc --noEmit` reports errors only in iCloud duplicate files under web/.next/types ("routes.d 3.ts", gitignored, not from this work); no errors in src. `next build` itself passes.
- Commits were made on main as instructed (the protected-branch assertion in the executor protocol was overridden by the explicit "Branch: main" instruction).
- Elternexperience.tsx got only the one-prop variant change in Task 1; its headings/help copy are unchanged.

## 4. Verification evidence

- `npx jest` full: 169 suites, 1580 tests, 19 snapshots, all pass.
- Targeted: appHeader + topicStarters 25 tests (snapshot 1 passed); jung/eltern page tests 56 tests across matched suites; schule 9 tests.
- RED before GREEN confirmed: jung (2 of 3) and eltern page tests failed before the page changes; schule page test failed before the rewrite.
- `npm run lint`: 0 errors, 7 pre-existing warnings (none in touched files).
- `npm run build`: exit 0; production CSS contains `animation-timeline:view()` (inside @supports + screen + no-preference), `animation-range` and `.chip-scroll-fade`.
- `git diff HEAD~3 --stat`: only plan files; SchreibMerzExperienceV2.tsx, wizard, API, lib, prompts, mails untouched. No package.json change.
- Design-taste pre-flight (applicable items): zero em dashes in copy; light theme only; waldgruen the single accent, airmail colours only in the connector; rounded-lg controls and rounded-xl cards; button contrast creme on waldgruen; hero CTAs min-h-12 and no wrap on desktop; no eyebrows; transform and opacity only, no infinite animation, reduced-motion and @supports guards; no new dependency or icon library. Not applicable: dark mode, image generation.
- Known Stubs: none. Threat flags: none (no new endpoints; fragment-only header href keeps ?k=).

## 5. Browser checklist for the orchestrator

(a) /jung at 375x812 without k and with a valid k (make one via the /schule generator): bottom of "Brief entwerfen" at most 812px; with a valid link at least 24px margin. If it misses, knobs in order: image h-20, drop the step-3 help line, shorter intro. Check that the 7 class chips are tappable (about 38x44).
(b) Header CTA jumps on /jung, /eltern (Schreiben / Brief entwerfen -> #schreiben) and /schule (Klassenlink -> #klassenlink) land below the two-row header; ?k= survives on /jung. Also: /eltern door links, /schule "Ablauf ansehen", /schule#schulleitung, and /projekttag-demokratie -> /schule#schule-leitung. No CTA on /mitbestimmen-ohne-wahlrecht and /projekttag-demokratie.
(c) H1 max 2 lines and H2 one line at 375px on all three pages; tightest: /eltern H1 (24 chars in one line, about 331 of 335px).
(d) .reveal and the connector animate in Chrome; static with DevTools reduced-motion emulation and in a browser without scroll-timeline support; nothing stuck transparent near the page end (the last reveal blocks are FAQ sections).
(e) /schule 45|90 toggle by mouse and keyboard; the extras rows fade in; the print link still works.
(f) /schreib-merz topic tiles unchanged.
(g) Desktop 1280px: /schule split hero (text left, image right), /jung image above H1, /eltern doors side by side, topic chip row scrolls horizontally with the right-edge fade.
(h) If the preview looks stale: stop the dev server, `rm -rf web/.next/dev`, restart.

## Self-Check: PASSED

Created files exist (LessonPlanToggle.tsx, topicStarters.test.ts.snap); commits 6cbcf42, fcdcb8a, c22b677 are ancestors of HEAD; `git rev-list --count` from plan_head_before gives 3.
