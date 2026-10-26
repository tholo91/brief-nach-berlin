---
phase: quick-261026-tca
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/public/images/spenden-banner-thomas.jpg
  - web/src/lib/support-content.ts
  - web/src/lib/email/mailLocale.ts
  - web/src/lib/email/buildFollowupHtml.ts
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/__tests__/followupDonationCta.test.ts
  - web/src/__tests__/emailVariantCta.test.ts
  - web/src/__tests__/financingNotice.test.ts
  - .planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md
  - .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md
autonomous: true
requirements:
  - QUICK-261026-tca

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The letter email (first send and resend via sendLetterEmail.ts, locales de/en/tr) contains no donation ask anymore: HTML and plain text have no link to https://spende.we-aid.org/Brief-nach-Berlin, no /spenden?src=email link, no text 'Hinweis zur Finanzierung' and no 'Damit Brief-nach-Berlin kostenlos bleibt' box; the dataPolicy sentence in mailLocale.ts is byte-identical to before"
    - "The follow-up email renders in this order: greeting, new created text, new feedback text, star bar in full width (no 48.5 % / 3 % / 48.5 % columns), donation section (heading, text with 5-euro anchor, banner image linked to WE AID, green 'Jetzt spenden' button with white heart, small line 'über WE AID, Spendenquittung möglich'), then unchanged MdB-office line, sign-off, share box, footer; the plain-text version follows the same order without the image"
    - "German follow-up copy is exactly the approved wording (created, feedback, donation heading and body); en and tr carry the translations given in this plan; all new copy uses Ich-Form, spells 'Brief-nach-Berlin' with hyphens and contains no em or en dash"
    - "web/public/images/spenden-banner-thomas.jpg exists, is a JPEG 1283 px wide, under 200 KB, carries no GPS metadata, and the follow-up mail references it via the baseUrl override with width=\"536\" and max-width:100%"
    - "Last-call mail, campaign creator mails, financingNotice.ts and the success screen Step3Success.tsx are unchanged (no donation ask added to last-call)"
    - "The backlog reflects the new direction: the 2026-10-09 donation todo marks item 2 (follow-up) and item 4 (avatar) as done and notes 'Spendenbitte nur in der Follow-up-Mail'; a new pending todo describes the banner donation card on the /rueckmeldung thank-you state for people who got a reaction"
    - "No email was sent (no Brevo call) and nothing was pushed"
  artifacts:
    - path: "web/public/images/spenden-banner-thomas.jpg"
      provides: "Reusable donation banner (Polaroid 'Moin, ich bin Thomas' plus three reviews), email-safe JPEG"
    - path: "web/src/lib/support-content.ts"
      provides: "SUPPORT_EMAIL_COPY[locale].followup with heading, body, providerLabel, bannerAlt for de/en/tr"
      contains: "followup"
    - path: "web/src/lib/email/buildFollowupHtml.ts"
      provides: "Follow-up mail with full-width stars and donation section with banner"
      contains: "spenden-banner-thomas.jpg"
    - path: "web/src/lib/email/buildEmailHtml.ts"
      provides: "Letter mail without donation block"
    - path: "web/src/__tests__/followupDonationCta.test.ts"
      provides: "Rewritten follow-up donation tests (layout, banner, WE AID link, 5-euro text, order, de/en/tr)"
    - path: ".planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md"
      provides: "New backlog todo for /rueckmeldung donation card"
  key_links:
    - from: "web/src/lib/email/buildFollowupHtml.ts"
      to: "web/src/lib/support-content.ts"
      via: "SUPPORT_EMAIL_COPY[locale].followup.* and compactButton, SUPPORT_CONTENT.ctas.donate.href"
      pattern: "supportCopy\\.followup"
    - from: "web/src/lib/email/buildFollowupHtml.ts"
      to: "web/public/images/spenden-banner-thomas.jpg"
      via: "img src built from base (params.baseUrl ?? APP_URL)"
      pattern: "\\$\\{base\\}/images/spenden-banner-thomas\\.jpg"
    - from: "web/src/lib/email/sendLetterEmail.ts"
      to: "web/src/lib/email/buildEmailHtml.ts"
      via: "resends reuse buildEmailHtml / buildLetterEmailText, so removal applies to resends automatically"
      pattern: "buildEmailHtml"
---

<objective>
Move the donation ask out of the letter email into the follow-up email, with warmer copy and the new banner, exactly as in the approved plan `/Users/thomas/.claude/plans/also-mein-gedanke-ist-purring-kettle.md` (source of truth, decisions are closed; do not re-open them).

Purpose: The first mail is only about the letter. The donation ask comes three days later, after the person has (hopefully) used the letter, with a concrete 5-euro anchor and Thomas' face on the banner.

Output: Converted banner asset, reworked follow-up mail (HTML + text, de/en/tr), letter mail without donation block, updated tests, updated and new backlog todo. No mail sent, no push.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@/Users/thomas/.claude/plans/also-mein-gedanke-ist-purring-kettle.md
@web/src/lib/email/buildFollowupHtml.ts
@web/src/lib/support-content.ts
@web/src/__tests__/followupDonationCta.test.ts
@web/src/__tests__/emailVariantCta.test.ts

Verified facts (planner, 2026-10-26):
- Letter mail donation block: `web/src/lib/email/buildEmailHtml.ts` lines ~674-685 (comment "Donation CTA: shared by first letter emails and resends" plus one `<tr>` calling the financing-notice renderer with avatar and showHeart). Plain-text block: the `parts.push` at lines ~97-99 (heading, prefix+status, button, learnMore). `const supportCopy` at line 81 is used only there. The import on line 8 (`SUPPORT_CONTENT, SUPPORT_EMAIL_COPY`) and the import on line 18 (`./financingNotice`) are used only by these two blocks. Media-query lines ~541-542 (`.bnb-support-action`, `.bnb-support-action-primary`) only style that box. `.bnb-inner-pad` is used by other boxes in the same file: keep it.
- `sendLetterEmail.ts` has no donation code; resends inherit the removal.
- Follow-up layout today: one `<tr>` "Primary rating action with a compact secondary donation CTA" with a 48.5 % / 3 % / 48.5 % table (star bar left, compact donation box right). Media query at max-width 480px has `.followup-action-column` and `.followup-action-gap` rules used only by that row. `buildDonationButtonLabelHtml(label, base)` from `financingNotice.ts` renders the white heart and must be reused.
- `SUPPORT_EMAIL_COPY` consumers: `buildEmailHtml.ts` (prefix, learnMore, heading/body/button/infoButton/status via the notice), `buildFollowupHtml.ts` (compactHeading, compactButton, providerLabel), `web/src/components/wizard/Step3Success.tsx` (de.body, de.compactButton, de.infoButton, must stay untouched), tests (`financingNotice.test.ts` passes `SUPPORT_EMAIL_COPY.de` as `FinancingNoticeCopy`, `supportContent.test.ts` checks `status`).
- `buildFinancingNoticeHtml` stays: `buildCampaignCreatorEmailHtml.ts` uses it with `SUPPORT_CAMPAIGN_CREATOR_COPY`.
- `financingNotice.test.ts` has one case that will break: `it.each(["de","en","tr"])("is embedded unchanged in the %s letter email")`. The approved plan keeps this test file for the creator-mail renderer; only this letter-embedding case must flip to a negative assertion (necessary consequence of step 1, not a decision change).
- Other follow-up suites that must stay green: `followupMeetMdb` (asserts `/feedback?r=` index < MdB hint < "Sign-off paragraph" comment), `followupShareButtons`, `emailLocalization`, `privacyEmail`, `emailSocialFollow`. No other test asserts the old created/feedback wording.
- No footer/social block contains a donation link, so the follow-up HTML has exactly the donation links this plan adds.
- Banner source (gitignored, main checkout only): `output/imagegen/WEAID-Titelbild-Thomas-v8_1283x474.png`, 1283x474 px, no alpha, 1.0 MB. At width 536 the display height is 198 px.
- Dev preview route: `web/src/app/api/email-preview/route.ts`, dev-only; `/api/email-preview` renders the letter mail, `/api/email-preview?type=followup` the follow-up with `baseUrl: origin`.
- `/rueckmeldung`: `web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx` gets `entryChoice` (`OUTCOME_ENTRY_CHOICES = ["yes","no","not_sent"]` in `web/src/lib/rueckmeldung/schema.ts`; "no" pre-fills replyChannels ["none"], so "yes" means a reaction came). Thank-you state is the `if (submitted) return (` block (~line 153).
- Worktree is dirty with Thomas' own changes: `.planning/ROADMAP.md` (modified), `.github/FUNDING.yml` and `.planning/schule-jung/` (untracked). Never stage them; stage only the files listed in each task.
- Pitfalls from memory: if jest crashes with an "alias" error or git reports a corrupt object, the file is iCloud-evicted; run `brctl download <file>` for that file. If the dev preview contradicts the code, stop the dev server, delete `web/.next/dev`, restart.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Follow-up mail end-to-end: banner asset, new copy, full-width stars, donation section, rewritten test</name>
  <files>web/public/images/spenden-banner-thomas.jpg, web/src/lib/support-content.ts, web/src/lib/email/mailLocale.ts, web/src/lib/email/buildFollowupHtml.ts, web/src/__tests__/followupDonationCta.test.ts</files>
  <precondition>output/imagegen/WEAID-Titelbild-Thomas-v8_1283x474.png exists in the main checkout (gitignored source of the banner).</precondition>
  <read_first>/Users/thomas/.claude/plans/also-mein-gedanke-ist-purring-kettle.md (sections 2, 3, 4 and "Wiederverwenden"), web/src/lib/email/buildFollowupHtml.ts, web/src/lib/support-content.ts, web/src/lib/email/mailLocale.ts lines 80-95 / 171-185 / 262-276, web/src/__tests__/followupDonationCta.test.ts, web/src/__tests__/followupMeetMdb.test.ts</read_first>
  <action>
Implements approved plan steps 2, 3 and the follow-up half of step 4. Decisions are closed (Erfolgsscreen unchanged, banner quotes have consent, last-call stays donation-free).

A. Banner asset. Convert with macOS sips: source output/imagegen/WEAID-Titelbild-Thomas-v8_1283x474.png, format jpeg, formatOptions 80, out web/public/images/spenden-banner-thomas.jpg. Keep 1283 px width (Retina-sharp at 536 px). If the file is 200 KB or larger, redo with formatOptions 70, then 60. JPEG, not WebP (Outlook). Check metadata with mdls: no GPS, latitude or longitude keys. Look at the JPG once with the Read tool to confirm it is not visually broken and to refine the alt text below if the content differs.

B. Copy in web/src/lib/support-content.ts. Add a nested object `followup` to each locale of SUPPORT_EMAIL_COPY with keys heading, body, providerLabel, bannerAlt. Leave all existing keys in place in this task (cleanup happens in Task 2). The button label stays `compactButton` ("Jetzt spenden" / "Donate now" / "Şimdi bağış yap"), which Step3Success also uses.
- de.followup.heading: "Damit Brief-nach-Berlin kostenlos bleibt"
- de.followup.body: "Brief-nach-Berlin ist kostenlos und soll es bleiben. Ich betreibe es allein und ehrenamtlich und trage die Kosten für KI, Mailversand und Server bisher selbst. Wenn dir dein Brief geholfen hat: Schon 5 € helfen, dass es für die Nächsten weiterläuft."
- de.followup.providerLabel: "über WE AID, Spendenquittung möglich"
- de.followup.bannerAlt: "Polaroid von Thomas mit „Moin, ich bin Thomas“ und drei Bewertungen von Menschen, die mit Brief-nach-Berlin einen Brief geschrieben haben"
- en.followup.heading: "Keeping Brief-nach-Berlin free"
- en.followup.body: "Brief-nach-Berlin is free and should stay that way. I run it on my own as a volunteer and so far I pay for the AI, email delivery and servers myself. If your letter helped you: even €5 helps keep it running for the next people."
- en.followup.providerLabel: "via WE AID, donation receipt available"
- en.followup.bannerAlt: "Polaroid photo of Thomas and three reviews from people who wrote a letter with Brief-nach-Berlin"
- tr.followup.heading: "Brief-nach-Berlin ücretsiz kalsın diye"
- tr.followup.body: "Brief-nach-Berlin ücretsizdir ve öyle kalmalı. Projeyi tek başıma ve gönüllü olarak yürütüyorum, yapay zekâ, e-posta gönderimi ve sunucu masraflarını şimdiye kadar kendim karşılıyorum. Mektubunuz işinize yaradıysa: 5 € bile, sonraki kişiler için de devam etmesine yardımcı olur."
- tr.followup.providerLabel: "WE AID üzerinden, bağış makbuzu alınabilir"
- tr.followup.bannerAlt: "Thomas'ın polaroid fotoğrafı ve Brief-nach-Berlin ile mektup yazan kişilerden üç değerlendirme"
(tr uses the formal "siz" register to match the existing tr follow-up copy in the same mail.)

C. Copy in web/src/lib/email/mailLocale.ts, `followup.created` and `followup.feedback` only (de ~line 82-83, en ~173-174, tr ~264-265). Do not touch dataPolicy or any other key.
- de.created: "Vor ein paar Tagen hast du deinen Brief-nach-Berlin erstellt. Ich hoffe, ich konnte dir damit helfen und du hast ihn schon handgeschrieben eingeworfen. Ich drücke dir die Daumen, dass du eine Antwort bekommst. Und wenn viele Menschen zum selben Thema schreiben, steigt die Chance, dass sich jemand der Sache annimmt."
- de.feedback: "Damit das Tool besser wird, hilft mir deine ehrliche Bewertung: Wie hat dir dein Brief gefallen? Kritik gerne schonungslos, Lob natürlich auch 😉"
- en.created: "A few days ago, you created your letter with Brief-nach-Berlin. I hope it helped you and that you have already handwritten it and posted it. I'm keeping my fingers crossed that you get a reply. And when many people write about the same issue, the chance grows that someone takes it up."
- en.feedback: "To make the tool better, your honest rating helps me a lot: How did you like your letter? Feel free to be blunt with criticism, and praise is welcome too 😉"
- tr.created: "Birkaç gün önce Brief-nach-Berlin ile mektubunuzu oluşturdunuz. Umarım size yardımcı olabilmişimdir ve mektubu elinizle yazıp postaya vermişsinizdir. Bir yanıt almanız için şimdiden şans diliyorum. Aynı konuda çok sayıda kişi yazdığında, birinin bu konuyla ilgilenme olasılığı da artar."
- tr.feedback: "Aracı geliştirebilmem için dürüst değerlendirmeniz bana çok yardımcı olur: Mektubunuzu nasıl buldunuz? Eleştirilerinizi çekinmeden yazın, övgüye de elbette sevinirim 😉"

D. Layout in web/src/lib/email/buildFollowupHtml.ts. Before designing the section, invoke the frontend-design skill (Skill frontend-design:frontend-design) per Thomas' standing rule for frontend edits, and apply it within email constraints: table layout, inline styles, existing palette (#2D5016 green, #4A4A4A text, #FAF8F5 / #E0DCD7 boxes, Georgia), no CSS background images, no new web fonts, Outlook-safe bulletproof button.
- Replace the two-column rating/donation row with a single full-width rating row: keep the #FAF8F5 bordered box and the `followup-rating-column` class, render `buildStarBarHtml(token, 2, locale)` centered across the full content width.
- Directly after it add a donation section row (white background, padding 0 32px so content width is 536 px) containing, in order: h2 heading from `supportCopy.followup.heading` (same style as the share-box h2), paragraph from `supportCopy.followup.body` (body text style, 15px, line-height 1.75), the banner wrapped in an anchor to `SUPPORT_CONTENT.ctas.donate.href` (target _blank, rel noopener noreferrer) with img src `${base}/images/spenden-banner-thomas.jpg`, alt from bannerAlt, width="536" height="198", inline style display:block;width:100%;max-width:100%;height:auto;border:0;outline:none plus a subtle border-radius, then a centered green button (bgcolor #2D5016 cell, link to the same donate href, label via `buildDonationButtonLabelHtml(supportCopy.compactButton, base)`), then a small grey centered line from `supportCopy.followup.providerLabel`. Run all four copy fields through the local escapeHtml.
- Remove the `.followup-action-column` and `.followup-action-gap` rules from the 480px media query (no longer used). Keep `.bnb-feedback-break` / `.bnb-feedback-space`. Keep the "Sign-off paragraph" HTML comment (followupMeetMdb anchors on it).
- Everything after (MdB-office line, sign-off, share box, footer) stays unchanged.
- Plain text: after the five star links insert heading, body, "${compactButton}: ${donate href}", providerLabel (each as its own line, blank line after the block), replacing the old compactHeading / compactButton / providerLabel lines. No image line. Order of the rest unchanged.
- Do not add a /spenden learn-more link to the follow-up.

E. Rewrite web/src/__tests__/followupDonationCta.test.ts (Jest only runs *.test.ts; no Mistral involved). Cases:
1. de default render: HTML has no `48.5%` and no `followup-action-gap`; still contains `followup-rating-column`; contains `${APP_URL}/images/spenden-banner-thomas.jpg`, `width="536"`, `max-width:100%`; the banner img sits inside an anchor whose href is DONATION_PROVIDER_URL (regex from `<a href="DONATION_PROVIDER_URL"` to the banner filename without crossing `</a>`); DONATION_PROVIDER_URL occurs exactly 2 times in HTML (banner + button) and exactly 1 time in text as "Jetzt spenden: <url>"; contains "Schon 5 € helfen" in HTML and text; contains "über WE AID, Spendenquittung möglich"; contains `icon-heart-white.png` and `margin-right:6px;">Jetzt spenden`; contains "Ich drücke dir die Daumen"; does not contain `/spenden?src=email`.
2. baseUrl override `http://localhost:3011`: both `src="http://localhost:3011/images/spenden-banner-thomas.jpg"` and `src="http://localhost:3011/images/icon-heart-white.png"` present.
3. Order (de, HTML): index of `/feedback?r=5` < index of followup.heading < index of `spenden-banner-thomas.jpg` < index of followup.providerLabel < index of "Sign-off paragraph". Order (text): `/feedback?r=5` < heading < `${compactButton}: ` < copy.followup.ignore from getEmailCopy.
4. it.each de/en/tr: HTML contains escaped followup.heading, followup.body, followup.providerLabel, and `alt="<escaped bannerAlt>"` (escape & < > " ' like the builder; tr bannerAlt has an apostrophe); text contains heading, body, providerLabel, compactButton; the 5-euro anchor per locale is present ("Schon 5 €" / "€5" / "5 € bile"); `followup.text` and every value of `SUPPORT_EMAIL_COPY[locale].followup` and getEmailCopy(locale).followup.created/feedback contain no em dash (U+2014) and no en dash (U+2013); write the regex with those two code points.
  </action>
  <verify>
    <automated>test -f web/public/images/spenden-banner-thomas.jpg && test "$(stat -f%z web/public/images/spenden-banner-thomas.jpg)" -lt 204800 && sips -g pixelWidth -g format web/public/images/spenden-banner-thomas.jpg | grep -q "pixelWidth: 1283" && ! mdls web/public/images/spenden-banner-thomas.jpg | grep -qiE "latitude|longitude|gps" && cd web && npx jest followupDonationCta followupMeetMdb followupShareButtons emailLocalization privacyEmail emailSocialFollow</automated>
  </verify>
  <done>Banner JPG committed-ready (1283 px, under 200 KB, no GPS). Follow-up HTML and text in de/en/tr show full-width stars followed by the donation section with banner, heart button and provider line; the rewritten test and all other follow-up suites pass. Commit only the five task files, e.g. "feat(followup-mail): Spendenbitte mit Banner unter den Sternen".</done>
</task>

<task type="auto">
  <name>Task 2: Letter mail without donation block, flipped tests, dead copy fields removed</name>
  <files>web/src/lib/email/buildEmailHtml.ts, web/src/__tests__/emailVariantCta.test.ts, web/src/__tests__/financingNotice.test.ts, web/src/lib/support-content.ts</files>
  <read_first>web/src/lib/email/buildEmailHtml.ts lines 1-20, 75-105, 530-545, 660-700; web/src/__tests__/emailVariantCta.test.ts lines 53-106; web/src/__tests__/financingNotice.test.ts lines 1-30 and 100-117</read_first>
  <action>
Implements approved plan step 1 and the letter-mail half of step 4.

A. web/src/lib/email/buildEmailHtml.ts: delete the donation `<tr>` including its HTML comment (~lines 674-685), delete the plain-text `parts.push` with heading/prefix/status/button/learnMore (~lines 97-99), delete `const supportCopy` (line 81), the import line for SUPPORT_CONTENT / SUPPORT_EMAIL_COPY (line 8) and the import from "./financingNotice" (line 18), and the two media-query lines for `.bnb-support-action` and `.bnb-support-action-primary` (~541-542). Before deleting each import, grep the file to confirm no other usage remains. Do not touch mailLocale.ts dataPolicy ("In 2-3 Tagen kommt nur noch eine Mail mit der Bitte um eine Bewertung" stays verbatim). Do not touch sendLetterEmail.ts, financingNotice.ts, buildCampaignCreatorEmailHtml.ts, buildLastcallHtml.ts, Step3Success.tsx.

B. web/src/__tests__/emailVariantCta.test.ts:
- First case becomes "keeps the first letter email free of donation asks in HTML and plaintext": HTML and text do not contain the WE AID donation URL, do not contain `https://www.brief-nach-berlin.de/spenden?src=email`, do not contain "Hinweis zur Finanzierung", do not contain "Damit Brief-nach-Berlin kostenlos bleibt". Keep the existing `SUPPORT_CONTENT.ctas.donate.label` assertions.
- The en/tr it.each becomes a negative check per locale: letter HTML and text contain neither the donation URL nor the localized button label ("Donate now" / "Şimdi bağış yap"); keep the providerLabel negatives.
- The resend case becomes "keeps resent letter emails and follow-up emails free of the financing notice": resent HTML and text contain neither the learn-more URL nor the donation URL; the follow-up assertions (no learn-more URL) stay.

C. web/src/__tests__/financingNotice.test.ts: replace only the `it.each(["de","en","tr"])("is embedded unchanged in the %s letter email")` case with "is no longer embedded in the %s letter email": `buildEmailHtml(params(locale))` contains neither `SUPPORT_CONTENT.ctas.donate.href` nor `bnb-support-action`. All renderer cases above it stay unchanged (creator mails still use the renderer). Remove imports that become unused (likely APP_URL); let eslint decide.

D. web/src/lib/support-content.ts cleanup: after A-C, grep web/src and web/scripts for `.prefix`, `.learnMore` (on SUPPORT_EMAIL_COPY, not SUPPORT_CONTENT.ctas.learnMore), `compactHeading` and `providerLabel` usages of SUPPORT_EMAIL_COPY. Remove from all three locales exactly those keys of SUPPORT_EMAIL_COPY that have zero remaining references. Keep heading, body, button, infoButton, status (FinancingNoticeCopy shape used by financingNotice.test.ts and supportContent.test.ts), compactButton (follow-up button and Step3Success) and the new followup object. If any key still has a reference, keep it and note it in the summary.
  </action>
  <verify>
    <automated>cd web && npx jest emailVariantCta financingNotice supportContent lastcallEmail followupDonationCta followupMeetMdb emailLocalization privacyEmail && npx eslint src/lib/email/buildEmailHtml.ts src/lib/email/buildFollowupHtml.ts src/lib/email/mailLocale.ts src/lib/support-content.ts src/__tests__/followupDonationCta.test.ts src/__tests__/emailVariantCta.test.ts src/__tests__/financingNotice.test.ts && ! (npx tsc --noEmit 2>&1 | grep -E "src/lib/email/(buildEmailHtml|buildFollowupHtml|mailLocale)|src/lib/support-content|src/components/wizard/Step3Success|src/__tests__/(followupDonationCta|emailVariantCta|financingNotice)") && git diff --quiet HEAD -- src/lib/email/buildLastcallHtml.ts src/lib/email/financingNotice.ts src/lib/email/buildCampaignCreatorEmailHtml.ts src/lib/email/sendLetterEmail.ts src/components/wizard/Step3Success.tsx</automated>
  </verify>
  <done>Letter mail HTML and text (first send, resend, de/en/tr) contain no donation ask; the eight listed suites pass; eslint clean on touched files; tsc reports no errors in touched files (pre-existing errors elsewhere are out of scope); last-call, creator mail, notice renderer, sendLetterEmail and Step3Success unchanged. Commit only the four task files, e.g. "feat(brief-mail): Spendenbitte aus der Brief-Mail entfernt".</done>
</task>

<task type="auto">
  <name>Task 3: Visual check of both mails (375 px and desktop) and backlog update</name>
  <files>.planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md, .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md</files>
  <read_first>.planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md, .planning/todos/pending/2026-10-11-doppelte-briefmails-dedup.md (frontmatter format only), web/src/app/api/email-preview/route.ts lines 1-50</read_first>
  <action>
Implements approved plan verification step 3 and step 5.

A. Visual check, no sending. Start the dev server in the background on a free port (e.g. from web: npm run dev -- -p 3011). Open http://localhost:3011/api/email-preview?type=followup and http://localhost:3011/api/email-preview (letter mail). Screenshot each at 375 px width and at desktop width (about 1280 px), full page, into your scratchpad directory (never into the repo). Use the browser pane / browser tool if available; otherwise headless Chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" with --headless=new --hide-scrollbars --window-size=375,3200 (and 1280,2400) --screenshot=<scratchpad file> <url>. Read every PNG and check: follow-up stars span the full width; donation section sits below the stars and above the sign-off; banner loads from localhost, is not cropped or distorted and its review text stays readable at 375 px; heart button and provider line are centered; letter mail shows no donation box between signature and the following blocks. If a layout problem shows, fix it in web/src/lib/email/buildFollowupHtml.ts, rerun the Task 1 verify, and amend nothing: make a separate small commit. If the preview contradicts the code, stop the server, delete web/.next/dev, restart. Stop the dev server afterwards. Report screenshot paths in the summary. No Brevo test mail (only after Thomas' explicit approval, not part of this plan).

B. Update .planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md (keep frontmatter): in "## Solution" mark item 2 (Follow-up-Mail) and item 4 (Avatar) as done, prefixing each with "[erledigt 2026-10-26, Quick 261026-tca]" plus one short sentence on what actually shipped (item 2: Sterne in voller Breite, darunter Spendenabschnitt mit Banner, 5-€-Anker und Button; item 4: Avatar war schon drin, die Spendenbox ist mit dieser Änderung ganz aus der Brief-Mail raus). Add a short section "## Neue Richtung (2026-10-26)" directly above "## Solution": Spendenbitte nur noch in der Follow-up-Mail, Brief-Mail und Resend ohne Bitte, Last-Call bleibt ohne Bitte, Erfolgsscreen unverändert, Banner liegt als web/public/images/spenden-banner-thomas.jpg und ist für /spenden und /rueckmeldung wiederverwendbar, Folge-Todo für /rueckmeldung angelegt (filename).

C. Create .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md with the same frontmatter shape as the other pending todos: created 2026-10-26T<current time>Z, title "Spendenkarte mit Banner auf der /rueckmeldung-Danke-Seite, wenn jemand eine Reaktion bekommen hat", area ui, severity minor, files web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx, web/src/lib/rueckmeldung/schema.ts, web/src/lib/support-content.ts, web/public/images/spenden-banner-thomas.jpg. Body "## Problem": the strongest moment for a donation ask is when someone reports a reaction from the politician; the last-call mail deliberately stays without an ask, so the thank-you page is the place. "## Solution": in the thank-you state of RueckmeldungForm.tsx (the `if (submitted)` block) show a donation card with the banner, heading and 5-€ text reused from SUPPORT_EMAIL_COPY.de.followup and a button to SUPPORT_CONTENT.ctas.donate.href, only when entryChoice is "yes" (reaction came; "no" and "not_sent" get no ask); build via /frontend-design; check with a page test as *.test.ts and screenshots mobile + desktop. Note the open question whether "yes" with replyChannels "acknowledgement" (only Eingangsbestätigung) should also show it. German, Ich-Form, no em/en dashes, brand "Brief-nach-Berlin".

Commit only these two todo files (docs commit), never ROADMAP.md, .github/FUNDING.yml or .planning/schule-jung/.
  </action>
  <verify>
    <automated>test -f .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md && grep -q "^created: 2026-10-26" .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md && grep -q "RueckmeldungForm.tsx" .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md && test "$(grep -c "261026-tca" .planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md)" -ge 2 && grep -q "Neue Richtung (2026-10-26)" .planning/todos/pending/2026-10-09-spendenbereitschaft-touchpoints-optimieren.md && ! grep -qE "[—–]" .planning/todos/pending/2026-10-26-spendenkarte-mit-banner-auf-rueckmeldung-danke-seite.md</automated>
    <human-check>Four screenshots (follow-up 375 px / desktop, letter mail 375 px / desktop) in the executor scratchpad, paths listed in the summary; banner readable on mobile.</human-check>
  </verify>
  <done>Both mails visually checked at 375 px and desktop with screenshot paths reported; dev server stopped; existing donation todo updated (items 2 and 4 marked done, new direction noted); new /rueckmeldung todo exists with correct frontmatter; only the two todo files committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| repo asset -> public web / email clients | Banner JPG is served publicly from brief-nach-berlin.de and loaded by every recipient's mail client |
| code constants -> email HTML | New copy strings are interpolated into HTML mails; no user input enters the new section |
| dev machine -> Brevo | Any accidental send would reach real people |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-q261026tca-01 | Information disclosure | web/public/images/spenden-banner-thomas.jpg | medium | mitigate | Task 1 mdls gate fails on any GPS/latitude/longitude key before commit (memory feedback_strip-photo-gps) |
| T-q261026tca-02 | Information disclosure | Banner review quotes (Waltraud, Julia, Tina) | low | accept | Thomas confirmed consent on 2026-10-26 (approved plan, "Entschieden") |
| T-q261026tca-03 | Tampering | buildFollowupHtml.ts donation section | low | mitigate | heading, body, providerLabel, bannerAlt pass through escapeHtml; test asserts the escaped alt (tr apostrophe) |
| T-q261026tca-04 | Spoofing | Donation links in follow-up | low | mitigate | Only SUPPORT_CONTENT.ctas.donate.href (DONATION_PROVIDER_URL constant) is used; test asserts exact href and exact count 2 |
| T-q261026tca-05 | Repudiation / accidental send | Brevo | high | mitigate | Plan uses only jest and the dev-only preview route; no Brevo call, no test mail, no push |
| T-q261026tca-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan; sips/mdls/Chrome are preinstalled system tools |
</threat_model>

<verification>
1. `cd web && npx jest followupDonationCta emailVariantCta financingNotice supportContent lastcallEmail` green (approved plan check 1), plus followupMeetMdb, followupShareButtons, emailLocalization, privacyEmail, emailSocialFollow.
2. Final sweep: `cd web && npx jest` once at the end (all suites mock Mistral; no real generateLetter calls).
3. eslint clean on touched files; tsc shows no errors in touched files.
4. Screenshots of follow-up and letter mail at 375 px and desktop, banner readable on mobile.
5. `git status` shows ROADMAP.md, .github/FUNDING.yml and .planning/schule-jung/ still uncommitted and untouched; no push; no Brevo send.
</verification>

<success_criteria>
- Letter mail and resend carry no donation ask in de/en/tr (HTML and text).
- Follow-up mail: full-width stars, then donation section with approved de copy, en/tr translations, banner linked to WE AID, heart button, "über WE AID, Spendenquittung möglich"; text version analog.
- Banner asset email-safe (JPEG, 1283 px, under 200 KB, no GPS).
- Last-call, creator mails, financingNotice renderer and Step3Success unchanged.
- Donation backlog todo updated; new /rueckmeldung todo created.
- All listed tests green, nothing sent, nothing pushed.
</success_criteria>

<output>
Create `.planning/quick/261026-tca-spendenbitte-aus-brief-mail-in-follow-up/261026-tca-SUMMARY.md` when done (include screenshot paths, final banner size and JPEG quality used, which SUPPORT_EMAIL_COPY keys were removed, and any deviation).
</output>
