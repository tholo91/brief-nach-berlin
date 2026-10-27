---
phase: quick-261027-itd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/email/buildFollowupHtml.ts
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/lib/email/mailLocale.ts
  - web/src/lib/support-content.ts
  - web/src/__tests__/followupDonationCta.test.ts
  - web/src/components/support/DonationCard.tsx
  - web/src/components/wizard/Step3Success.tsx
  - web/src/__tests__/successPageExperience.test.ts
  - web/src/__tests__/donationCard.test.ts
  - web/src/app/(site)/feedback/FeedbackForm.tsx
  - web/src/__tests__/feedbackThankYouDonation.test.ts
autonomous: true
requirements: [QUICK-261027-itd]

estimate:
  tokens: 75000
  raw_tokens: 75000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-01: The follow-up mail (de, en, tr) no longer contains the long feedback paragraph, neither in HTML nor in the text version, and the followup.feedback key is gone from mailLocale.ts"
    - "D-02: In the follow-up mail the stars are a plain centered row without border box and without the question above them; the hint (de 'Dauert 10 Sek, hilft mir sehr') stays"
    - "D-02: The letter mail star bar is byte-identical to before (letterEmailAdultSnapshot passes without snapshot update) and still shows the question"
    - "D-03: The follow-up donation box keeps avatar, heading, 'Jetzt spenden', 'Mehr Informationen' and status line; only followupBody is shorter (de exactly 'Ich mache das allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Schon 5 € helfen.')"
    - "D-04 / D-09: The follow-up preview text is the new request sentence per locale; the subject feedbackSubject is unchanged"
    - "D-05 / D-07 / D-08: After a 4 or 5 star review the /feedback thank-you card shows a donation card (photo, 'Schön, dass dir dein Brief gefällt', text with 5 € anchor, 'Jetzt spenden' with heart in a new tab, 'Mehr Informationen' to /spenden), has no redirect timer, no progress bar, no redirect text, and 'Jetzt spenden' is the only filled green button"
    - "D-07 / D-08: After a 1 to 3 star review the thank-you card is unchanged (recovery card, pausable redirect, progress bar, filled 'Generelles Feedback zum Tool')"
    - "D-06: The success screen donation card is rendered by the shared DonationCard and produces the same classes, ids and texts as before"
  artifacts:
    - path: "web/src/components/support/DonationCard.tsx"
      provides: "Shared donation card (titleId, title, body, className)"
      contains: "export function DonationCard"
    - path: "web/src/lib/support-content.ts"
      provides: "Shortened followupBody (de/en/tr) and SUPPORT_CONTENT.feedbackDonation copy"
      contains: "feedbackDonation"
    - path: "web/src/lib/email/buildEmailHtml.ts"
      provides: "buildStarBarHtml option showQuestion (default true)"
      contains: "showQuestion"
    - path: "web/src/__tests__/feedbackThankYouDonation.test.ts"
      provides: "Render tests for ThankYouCard at rating 1-5"
    - path: "web/src/__tests__/donationCard.test.ts"
      provides: "Render test proving the success-screen card markup is unchanged"
  key_links:
    - from: "web/src/lib/email/buildFollowupHtml.ts"
      to: "web/src/lib/email/buildEmailHtml.ts"
      via: "buildStarBarHtml(token, 2, locale, { showQuestion: false })"
      pattern: "showQuestion: false"
    - from: "web/src/components/wizard/Step3Success.tsx"
      to: "web/src/components/support/DonationCard.tsx"
      via: "DonationCard with titleId success-support-title and className md:col-start-1 md:row-start-2"
      pattern: "<DonationCard"
    - from: "web/src/app/(site)/feedback/FeedbackForm.tsx"
      to: "web/src/components/support/DonationCard.tsx"
      via: "ThankYouCard renders DonationCard when rating >= 4"
      pattern: "<DonationCard"
---

<objective>
Sharpen the donation ask in two places, based on local commit 8a3d3fb (compact donation box with avatar in the follow-up mail via buildFinancingNoticeHtml):

A) Follow-up mail: shorter and calmer. Drop the long feedback paragraph, show the stars as a plain centered row without box and question, shorten the donation body, new preview text, subject unchanged.
B) /feedback thank-you page: after 4 or 5 stars show a donation card (shared with the success screen) instead of the auto redirect, and make "Jetzt spenden" the only filled green button.

Decision IDs (Thomas, from the task description; all locked):
- D-01 remove `followup.feedback` paragraph (HTML + text), delete the key in de/en/tr (it is only used in buildFollowupHtml.ts, verified by grep)
- D-02 follow-up stars without box and without question; hint stays; extend buildStarBarHtml with an option, letter mail unchanged
- D-03 donation box look unchanged; only `SUPPORT_EMAIL_COPY[locale].followupBody` shorter
- D-04 new preview text for the follow-up only. Grep shows `feedbackPreview` is used only in buildFollowupHtml.ts (letter mail does not use it), so its value is changed in place, no new key
- D-05 donation card on /feedback thank-you at rating >= 4 with the given copy, copy stored in support-content.ts
- D-06 extract the success-screen card into web/src/components/support/DonationCard.tsx and use it in both places; success screen stays identical
- D-07 rating >= 4: no auto redirect, no timer, no progress bar, no redirect text; rating <= 3 unchanged
- D-08 rating >= 4: "Jetzt spenden" only filled green button, the other two become secondary; rating <= 3 unchanged
- D-09 subject `feedbackSubject` stays as is

Purpose: Thomas wants more donations from happy users without making the follow-up mail longer or pushier.
Output: changed mail builder and copy, new shared DonationCard, changed ThankYouCard, Jest tests. No mail is sent, nothing is pushed.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
@web/src/lib/email/buildFollowupHtml.ts
@web/src/lib/support-content.ts
@web/src/__tests__/followupDonationCta.test.ts

Project rules that apply to every task:
- All commands run from `web/` (`cd web && ...`). Jest only picks up `web/src/__tests__/**/*.test.ts`; `.test.tsx` never runs. Component tests are `.ts` files using `createElement` from react and `renderToStaticMarkup` from react-dom/server (pattern: web/src/__tests__/campaignCreatorStats.test.ts lines 1-45 for the `next/image` and `next/navigation` mocks, web/src/__tests__/campaignList.test.ts lines 1-8 for the `next/link` mock).
- Every new test file mocks `@/lib/mistral` (project rule, even if not reached).
- No new dependencies. No mail sending (no Brevo scripts, no send-* skills). No push. No branch: commit on `main`, local only.
- Copy rules: no en or em dashes in user-facing copy, first person singular ("ich"), never "wir/uns", brand spelled "Brief-nach-Berlin".
- Frontend edits go through the design skill (Thomas memory): before the first visual edit invoke the Skill tool with `frontend-design:frontend-design` once; its guidance applies to Task 1 (star row) and Task 3 (thank-you layout). Task 2 is a pure extraction and must not change any class or text.
- The worktree has unrelated pre-existing changes (`.planning/ROADMAP.md`, `.github/FUNDING.yml`, `.planning/schule-jung/SPEC.md`). Never stage them: always `git add` explicit file paths, never `git add -A` or `git add .`.
- If Jest crashes with an odd "alias" or read error on a file that exists, it is an iCloud-evicted file: run `brctl download <path>` for that file and retry.
- Never run Jest with `-u` / `--updateSnapshot`. The letter mail snapshot must pass unchanged.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Follow-up mail shorter (no feedback paragraph, plain star row, short donation body, new preview)</name>
  <files>web/src/lib/email/buildEmailHtml.ts, web/src/lib/email/buildFollowupHtml.ts, web/src/lib/email/mailLocale.ts, web/src/lib/support-content.ts, web/src/__tests__/followupDonationCta.test.ts</files>
  <read_first>web/src/lib/email/buildEmailHtml.ts lines 34-60 (buildStarBarHtml), web/src/lib/email/buildFollowupHtml.ts (whole file, already in context), web/src/lib/email/mailLocale.ts (keys feedbackPreview and followup.feedback per locale, around lines 13, 83, 104, 174, 195, 265), web/src/__tests__/followupDonationCta.test.ts, web/src/__tests__/letterEmailAdultSnapshot.test.ts</read_first>
  <behavior>
    Extend web/src/__tests__/followupDonationCta.test.ts (write these first, see them fail, then implement):
    - Test A (D-01, each of de/en/tr): `buildFollowupHtml({ token: "signed-token", locale })` html and text do not contain the old paragraph openings (de "Wichtig für die Zukunft des Projekts", en "Your feedback helps shape the future", tr "Geri bildiriminiz bu projenin geleceğini"); `"feedback" in getEmailCopy(locale).followup` is false.
    - Test B (D-02, each locale): follow-up html does not contain `bnb-feedback-break`; de html does not contain "Wie findest du"; html contains `getEmailCopy(locale).feedbackHint`; html still contains all five links `/feedback?r=1&t=signed-token&s=2` to `r=5`.
    - Test C (D-02): the opening tag of the cell with class `followup-rating-column` (substring from that class name to the next `>`) contains neither "border" nor "#FAF8F5" nor "border-radius".
    - Test D (D-02, letter mail unchanged): `buildStarBarHtml("t")` contains `bnb-feedback-break` and "Wie findest du"; `buildStarBarHtml("t", 2, "de", { showQuestion: false })` contains neither, but contains "Dauert 10 Sek, hilft mir sehr" and `/feedback?r=5&t=t&s=2`.
    - Test E (D-04, D-09): de follow-up html contains "Und eine Bitte von mir, falls dir der Brief geholfen hat." and its index is lower than the index of `<h1`; en html contains "And one request from me, in case the letter helped you."; tr html contains "Mektup işinize yaradıysa, sizden bir ricam var."; de subject is exactly "Wie fandest du deinen Brief?".
    - Test F (D-03): `SUPPORT_EMAIL_COPY.de.followupBody` equals exactly "Ich mache das allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Schon 5 € helfen." The existing localized test (fiveEuro anchors de "Schon 5 €", en "€5", tr "5 € bile", no en/em dash) keeps passing; additionally no followupBody matches /\bwir\b/i.
    - Replace the existing line asserting `followup.html` contains "followup-rating-column" only if needed; the class name stays on the plain cell, so the existing assertion should keep passing.
  </behavior>
  <action>
    Per D-02: in web/src/lib/email/buildEmailHtml.ts add a fourth optional parameter `options: { showQuestion?: boolean } = {}` to `buildStarBarHtml`. When `showQuestion` is false, skip the bold question paragraph; the star row div and the hint paragraph stay exactly as now. Default (true) must produce byte-identical output, so the letter mail call at about line 611 stays untouched and letterEmailAdultSnapshot passes without update. Do not copy the function.

    Per D-02: in web/src/lib/email/buildFollowupHtml.ts replace the bordered rating box: keep the row `<!-- Primary rating action, full width -->` and a single centered cell that keeps class `followup-rating-column`, but drop the box styling (no border, no #FAF8F5 background, no border-radius, no bgcolor attribute). Call `buildStarBarHtml(token, 2, locale, { showQuestion: false })`. Tune the vertical padding so the row sits calmly between the intro paragraph and the donation box (design skill guidance, email-safe inline styles only). Remove the two mobile CSS rules for `.bnb-feedback-break` and `.bnb-feedback-space` from the follow-up `<style>` block, because the question no longer renders in this mail (keep the other rules in that media query).

    Per D-01: remove the `copy.feedback` paragraph from the HTML body block and remove the `copy.feedback` line plus its following empty line from the text array (no double blank line left). Delete the `feedback` key from `followup` in de, en and tr in web/src/lib/email/mailLocale.ts. Leave `feedbackQuestion` and `feedbackHint` (still used by the letter mail).

    Per D-04: change the `feedbackPreview` values in place (only the follow-up uses them): de "Und eine Bitte von mir, falls dir der Brief geholfen hat.", en "And one request from me, in case the letter helped you.", tr "Mektup işinize yaradıysa, sizden bir ricam var." Per D-09 do not touch `feedbackSubject`.

    Per D-03: in web/src/lib/support-content.ts change only `followupBody`: de "Ich mache das allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Schon 5 € helfen.", en "I do this on my own as a volunteer and so far pay for the AI, email delivery and servers myself. Even €5 helps.", tr (siz form, neutral first person) "Bunu tek başıma ve gönüllü olarak yapıyorum, yapay zekâ, e-posta gönderimi ve sunucu masraflarını şimdiye kadar kendim karşılıyorum. 5 € bile yardımcı olur." Do not touch buildFinancingNoticeHtml, heading, status, buttons or the avatar.

    Commit only the five files of this task: `git add` with explicit paths, message `feat(quick-261027-itd): Follow-up-Mail kürzer, Sterne ohne Box, neue Spendenzeile` plus the Co-Authored-By trailer.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/followupDonationCta.test.ts src/__tests__/letterEmailAdultSnapshot.test.ts src/__tests__/emailLocalization.test.ts src/__tests__/followupMeetMdb.test.ts src/__tests__/followupShareButtons.test.ts src/__tests__/privacyEmail.test.ts src/__tests__/emailSocialFollow.test.ts src/__tests__/financingNotice.test.ts src/__tests__/emailVariantCta.test.ts</automated>
  </verify>
  <done>All listed suites green without snapshot update; follow-up mail in de/en/tr has no feedback paragraph, no star question, no star box, new preview text, shorter donation body; letter mail snapshot unchanged; commit on main with only the five task files.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Extract the success-screen donation card into a shared DonationCard (no visual change)</name>
  <files>web/src/components/support/DonationCard.tsx, web/src/components/wizard/Step3Success.tsx, web/src/__tests__/successPageExperience.test.ts, web/src/__tests__/donationCard.test.ts</files>
  <read_first>web/src/components/wizard/Step3Success.tsx lines 1-45 (imports) and 1200-1250 (the `<section aria-labelledby="success-support-title">` block), web/src/__tests__/successPageExperience.test.ts lines 33-58, web/src/__tests__/campaignCreatorStats.test.ts lines 1-45, web/src/__tests__/campaignList.test.ts lines 1-8</read_first>
  <behavior>
    New web/src/__tests__/donationCard.test.ts (mocks `@/lib/mistral`, `next/image` as in campaignCreatorStats, `next/link` as in campaignList). Render `DonationCard` with exactly the props Step3Success passes (titleId "success-support-title", title SUPPORT_CONTENT.headline, body SUPPORT_EMAIL_COPY.de.body, className "md:col-start-1 md:row-start-2") and assert the markup contains:
    - `aria-labelledby="success-support-title"` and the exact section class string `overflow-hidden rounded-2xl border border-waldgruen/15 bg-creme/90 px-5 py-5 shadow-[0_18px_50px_-38px_rgba(24,70,51,0.7)] backdrop-blur-[2px] sm:px-6 md:col-start-1 md:row-start-2`
    - `<h2 id="success-support-title" class="font-body text-lg font-semibold leading-snug text-waldgruen-dark">` followed by the headline text
    - the portrait src SUPPORT_CONTENT.founder.portraitPath with alt "Thomas Lorenz, der Brief-nach-Berlin entwickelt"
    - SUPPORT_EMAIL_COPY.de.body, the donate link `href` DONATION_PROVIDER_URL with `target="_blank"` and `rel="noopener noreferrer"`, text "Jetzt spenden", the learn-more link to "/spenden" with text "Mehr Informationen"
    - Without className the section class string ends with `sm:px-6"` (no trailing space, no "undefined").
    Update web/src/__tests__/successPageExperience.test.ts: read web/src/components/support/DonationCard.tsx as `donationSource`; move the assertions for `SUPPORT_CONTENT.ctas.donate.href`, `SUPPORT_CONTENT.ctas.learnMore.href`, `SUPPORT_EMAIL_COPY.de.compactButton`, `SUPPORT_EMAIL_COPY.de.infoButton`, `SUPPORT_CONTENT.founder.portraitPath`, `mt-4 flex items-start gap-4` from successSource to donationSource; replace the `id="success-support-title" className="font-body text-lg` assertion by successSource containing `titleId="success-support-title"` and donationSource containing `id={titleId} className="font-body text-lg`; add successSource contains `<DonationCard`, `title={SUPPORT_CONTENT.headline}`, `body={SUPPORT_EMAIL_COPY.de.body}`. Keep every other assertion as is (including `md:col-start-1 md:row-start-2` on successSource).
  </behavior>
  <action>
    Per D-06: create web/src/components/support/DonationCard.tsx exporting `DonationCard({ titleId, title, body, className }: { titleId: string; title: string; body: string; className?: string })`. Move the JSX of the current success-screen `<section>` into it unchanged: same element order, same class strings, same Image (fill, sizes "80px", same alt), same heart SVG, `SUPPORT_EMAIL_COPY.de.compactButton` and `SUPPORT_EMAIL_COPY.de.infoButton` labels, `SUPPORT_CONTENT.ctas.donate.href` (target _blank, rel noopener noreferrer) and `SUPPORT_CONTENT.ctas.learnMore.href` via next/link with prefetch false. The section uses `aria-labelledby={titleId}`, the h2 uses `id={titleId}` and renders `{title}`, the paragraph renders `{body}`. The section class is the base string from the current code joined with `className` by a single space only when className is set (filter empty, join with space). No "use client" directive needed (no hooks); it must work inside both client components.

    In web/src/components/wizard/Step3Success.tsx replace the inline section inside `{!isYouth && (...)}` with `<DonationCard titleId="success-support-title" title={SUPPORT_CONTENT.headline} body={SUPPORT_EMAIL_COPY.de.body} className="md:col-start-1 md:row-start-2" />` and add the import. Keep the `Image`, `Link`, `SUPPORT_CONTENT` and `SUPPORT_EMAIL_COPY` imports (still used elsewhere in the file or in the props); remove an import only if eslint reports it unused. No class, copy or layout change: this is the identity guarantee Thomas asked for.

    Commit only the four task files with explicit `git add`, message `refactor(quick-261027-itd): Spendenkarte als gemeinsame DonationCard` plus the Co-Authored-By trailer.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/donationCard.test.ts src/__tests__/successPageExperience.test.ts && npx eslint src/components/support/DonationCard.tsx src/components/wizard/Step3Success.tsx</automated>
  </verify>
  <done>DonationCard exists and renders the exact former success-screen classes, ids and texts; Step3Success uses it; both suites green, eslint clean on both files; commit on main with only the four task files.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: /feedback thank-you at 4-5 stars: donation card, no redirect, one primary button</name>
  <files>web/src/lib/support-content.ts, web/src/app/(site)/feedback/FeedbackForm.tsx, web/src/__tests__/feedbackThankYouDonation.test.ts</files>
  <read_first>web/src/app/(site)/feedback/FeedbackForm.tsx lines 1-56 (imports, REDIRECT_MS) and 629-786 (ThankYouCard), web/src/components/support/DonationCard.tsx (from Task 2), web/src/__tests__/politicalActivation.test.ts lines 55-82 (reads FeedbackForm source, must keep passing)</read_first>
  <behavior>
    New web/src/__tests__/feedbackThankYouDonation.test.ts. Mocks before importing: `@/lib/mistral` (factory returning an empty object), `@/lib/actions/submitReview` (`submitReviewAction: jest.fn()`), `next/navigation` (`useRouter: () => ({ push: jest.fn() })`), `next/image` and `next/link` as in the existing tests. Render `ThankYouCard` via `renderToStaticMarkup(createElement(ThankYouCard, { onSkip: () => {}, rating, feedbackTags: [], body: "", token: "t" }))`.
    - rating 4 and 5: markup contains SUPPORT_CONTENT.feedbackDonation.headline ("Schön, dass dir dein Brief gefällt"), SUPPORT_CONTENT.feedbackDonation.text, `href="https://spende.we-aid.org/Brief-nach-Berlin"` with `target="_blank"`, "Jetzt spenden", `href="/spenden"`, "Mehr Informationen", the portrait path, "Generelles Feedback zum Tool", "Zurück zur Startseite"; does not contain "Du wirst gleich automatisch weitergeleitet", "Pausiert", "animate-progress", "Brief jetzt verbessern"; the number of class tokens that are exactly `bg-waldgruen` (regex /(^|[\s"])bg-waldgruen(?=[\s"])/g) is 1.
    - rating 1 and 3: markup contains "Du wirst gleich automatisch weitergeleitet", "animate-progress", "Brief jetzt verbessern", "Generelles Feedback zum Tool" with the filled class `bg-waldgruen text-creme`; does not contain the feedbackDonation headline nor the donation provider URL.
    - Copy: feedbackDonation.headline equals "Schön, dass dir dein Brief gefällt"; feedbackDonation.text equals "Ich mache Brief-nach-Berlin allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Damit es für die Nächsten kostenlos bleibt: Schon 5 € helfen."; neither matches /[–—]/ nor /\bwir\b/i.
    - Source guard for the timer (effects do not run in renderToStaticMarkup): the FeedbackForm.tsx source contains `if (!autoRedirect) return`.
  </behavior>
  <action>
    Per D-05: in web/src/lib/support-content.ts add to SUPPORT_CONTENT a `feedbackDonation` object with `headline: "Schön, dass dir dein Brief gefällt"` and `text: "Ich mache Brief-nach-Berlin allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Damit es für die Nächsten kostenlos bleibt: Schon 5 € helfen."` (copy exactly as Thomas wrote it).

    In web/src/app/(site)/feedback/FeedbackForm.tsx make `ThankYouCard` a named export (needed for the render test; FeedbackForm keeps using it). Inside ThankYouCard derive `const autoRedirect = rating <= 3` next to `showRecoveryCard`.

    Per D-07: in the redirect useEffect put `if (!autoRedirect) return;` as the very first statement and add `autoRedirect` to its dependency array, so no timeout is ever scheduled at 4-5 stars. Keep the scroll-to-top effect. Render the "Pausiert. Nimm dir Zeit." / "Du wirst gleich automatisch weitergeleitet." paragraph and the bottom progress bar (the `aria-hidden` div with `animate-progress`) only when `autoRedirect` is true. Rating <= 3 renders exactly as today.

    Per D-05 and D-06: replace the `: null` branch of the `showRecoveryCard` ternary with `<DonationCard titleId="feedback-support-title" title={SUPPORT_CONTENT.feedbackDonation.headline} body={SUPPORT_CONTENT.feedbackDonation.text} className=... />` importing DonationCard from `@/components/support/DonationCard` and SUPPORT_CONTENT from `@/lib/support-content`. The thank-you card is `text-center`, so pass a className that restores left alignment and centers the card at the same width rhythm as the recovery card (for example `mx-auto mb-8 max-w-md text-left animate-feedback-in`); final spacing per the design skill. Do not create a second card markup: reuse DonationCard (Bauprinzip "Erweitern statt kopieren").

    Per D-08: when `autoRedirect` is false, "Generelles Feedback zum Tool" gets the outline style the "Zurück zur Startseite" button has today (`border border-waldgruen/30 bg-white text-waldgruen-dark ... hover:bg-waldgruen/5 hover:border-waldgruen`) and "Zurück zur Startseite" becomes a quiet text button (warmgrau text, underline with underline-offset-2, hover waldgruen-dark, still min-h-[44px] tap target). When `autoRedirect` is true both buttons keep their exact current classes. Use a conditional class string, not duplicated button markup. Keep the copy of all existing texts unchanged.

    Commit only the three task files with explicit `git add`, message `feat(quick-261027-itd): Spendenkarte auf der Danke-Seite bei 4-5 Sternen, kein Auto-Redirect` plus the Co-Authored-By trailer.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/feedbackThankYouDonation.test.ts src/__tests__/politicalActivation.test.ts src/__tests__/supportContent.test.ts src/__tests__/donationCard.test.ts && npx eslint "src/app/(site)/feedback/FeedbackForm.tsx" src/lib/support-content.ts src/__tests__/feedbackThankYouDonation.test.ts</automated>
  </verify>
  <done>At 4-5 stars the thank-you card shows the donation card with the given copy, no timer, no progress bar, no redirect text and exactly one filled green button; at 1-3 stars it renders as before; suites green, eslint clean; commit on main with only the three task files.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| App -> external donation provider | "Jetzt spenden" opens spende.we-aid.org in a new tab |
| Mail -> /feedback | Star links carry the signed feedback token |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-itd-01 | T | DonationCard donate link (target _blank) | low | mitigate | Keep `rel="noopener noreferrer"` on the external link (moved unchanged into DonationCard, asserted in donationCard.test.ts and feedbackThankYouDonation.test.ts). |
| T-itd-02 | I | Follow-up star links with feedback token | low | mitigate | URL builder inside buildStarBarHtml is unchanged; only the question paragraph becomes optional. Test D asserts the token links are identical. |
| T-itd-03 | T | New mail and page copy | low | accept | All new strings are static constants from mailLocale.ts / support-content.ts; no user input is interpolated into the changed HTML. |
| T-itd-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan; no new dependencies allowed. |
</threat_model>

<verification>
- `cd web && npx jest` fully green (no `-u`), including letterEmailAdultSnapshot unchanged.
- `cd web && npx eslint src/lib/email/buildFollowupHtml.ts src/lib/email/buildEmailHtml.ts src/lib/email/mailLocale.ts src/lib/support-content.ts src/components/support/DonationCard.tsx src/components/wizard/Step3Success.tsx "src/app/(site)/feedback/FeedbackForm.tsx" src/__tests__/followupDonationCta.test.ts src/__tests__/successPageExperience.test.ts src/__tests__/donationCard.test.ts src/__tests__/feedbackThankYouDonation.test.ts` clean.
- `cd web && npx tsc --noEmit` clean.
- `git status --short` afterwards still shows the three pre-existing unrelated changes untouched and unstaged; `git log origin/main..main --oneline` shows the new local commits; nothing pushed, no mail sent.
- Screenshots (follow-up mail preview, /feedback at 5 and at 2 stars, success screen) are taken by the orchestrator, not part of this plan.
</verification>

<success_criteria>
- Follow-up mail: no feedback paragraph, plain centered stars with hint only, unchanged-looking donation box with the short body, new preview text, same subject (D-01 to D-04, D-09).
- Letter mail byte-identical (snapshot) (D-02).
- /feedback thank-you at 4-5 stars: donation card, no auto redirect, single filled green "Jetzt spenden" (D-05, D-07, D-08); at 1-3 stars unchanged.
- One shared DonationCard used by the success screen and the thank-you page; success screen unchanged (D-06).
- Full Jest suite green, eslint and tsc clean, three local commits on main, no push, no send.
</success_criteria>

<output>
Create `.planning/quick/261027-itd-spendenbitte-schaerfen-follow-up-kuerzen/261027-itd-SUMMARY.md` when done
</output>
