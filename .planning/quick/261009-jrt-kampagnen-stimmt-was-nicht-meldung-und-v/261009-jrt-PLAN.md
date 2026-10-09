---
phase: quick-261009-jrt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "web/src/lib/campaigns/reportOptions.ts"
  - "web/src/lib/actions/reportCampaign.ts"
  - "web/src/lib/rateLimit.ts"
  - "web/src/lib/email/buildCampaignCreatorEmailHtml.ts"
  - "web/src/lib/email/sendCampaignCreatorEmail.ts"
  - "web/src/lib/email/sendCampaignReportEmails.ts"
  - "web/src/__tests__/reportCampaign.test.ts"
  - "web/src/components/campaigns/CampaignReportDialog.tsx"
  - "web/src/components/campaigns/CampaignHero.tsx"
  - "web/src/components/campaigns/CampaignEndedView.tsx"
  - "web/src/__tests__/campaignHero.test.ts"
  - "web/src/__tests__/campaignHeroFixedRecipient.test.ts"
  - "web/src/__tests__/campaignPage.test.ts"
  - "web/src/components/campaigns/CreatorCampaignForm.tsx"
  - "web/src/app/(site)/nutzungsbedingungen/page.tsx"
autonomous: true
requirements: [KAMPAGNEN-MELDUNG]

estimate:
  tokens: 130000
  raw_tokens: 130000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-02/D-07: Every public active campaign page shows one small muted text button 'Stimmt was nicht?' at the very bottom of the 'Warum Briefkampagne?' section (below the FAQ list), with no icon, no color and underline only on hover/focus. The hero, the letter form and the line 'Die Kampagne nutzt die Infrastruktur von Brief-nach-Berlin.' are unchanged. No email address is shown for reporting."
    - "D-02/D-04: The button opens a native <dialog> with a 'Was stimmt nicht?' dropdown (Falsche Angaben / Falscher Empfänger oder Adresse / Beleidigend oder hetzerisch / Bild- oder Logorechte verletzt / Sonstiges), an 'Ich bin' dropdown (Briefschreiber:in / Selbst betroffen / Sonstige), a required text (20 to 1000 characters), an optional email field with the hint that only Brief-nach-Berlin sees it, and a required 'nach bestem Wissen' checkbox. Escape and backdrop click close it and focus returns to the trigger."
    - "D-03/D-05: reportCampaignAction loads the campaign server-side with getActiveCampaignBySlug and sends exactly one Brevo mail to campaign.creatorEmail with BCC to THOMAS_MAIL (existing adminCopy path), replyTo FOUNDER_EMAIL, containing reason label, role label, message and 'Ich melde mich, falls etwas zu tun ist'. It returns only { success } and never the creator email. Nothing is written to the database."
    - "D-04: The reporter's email never appears anywhere in the creator mail payload. Only when a reporter email is given, two more mails go out: a short admin mail to Thomas (reporter email + slug) and a receipt confirmation to the reporter. Without a reporter email exactly one mail is sent."
    - "D-06: Invalid input (unknown reason/role, message under 20 or over 1000 chars, invalid email, missing goodFaith, unknown or inactive slug) sends no mail and returns { success: false }. The 4th report from one IP within an hour is rejected (LIMITS.REPORT_CAMPAIGN_PER_IP = 3 per hour)."
    - "D-08: The 'Verantwortung' box in the create form shows the casual text from the approved plan; checkbox and Nutzungsbedingungen link stay."
    - "D-01/D-09: Nutzungsbedingungen describe the Freigabe as a rough check for obvious violations and spam, not a content review; 'Rechtswidrige Inhalte melden' points to 'Stimmt was nicht?' on every campaign page with the mail address as alternative; Stand is 9. Oktober 2026; the PRÜFEN (Anwalt) comment lists the gGmbH-Satzung and EuGH C-492/23 questions."
  artifacts:
    - path: "web/src/lib/campaigns/reportOptions.ts"
      provides: "Client-safe reason/role values and German labels shared by dialog and action"
      contains: "Bild- oder Logorechte verletzt"
    - path: "web/src/lib/actions/reportCampaign.ts"
      provides: "'use server' reportCampaignAction(input: unknown): Promise<{ success: boolean }>"
      contains: "getActiveCampaignBySlug"
    - path: "web/src/lib/email/sendCampaignReportEmails.ts"
      provides: "sendCampaignReportAdminEmail and sendCampaignReportConfirmationEmail (soft BREVO_API_KEY guard)"
      contains: "sendCampaignReportConfirmationEmail"
    - path: "web/src/components/campaigns/CampaignReportDialog.tsx"
      provides: "'use client' trigger line + native dialog form, prop slug only"
      contains: "showModal"
    - path: "web/src/__tests__/reportCampaign.test.ts"
      provides: "Jest test with mocked Brevo for validation, routing, BCC and reporter-email privacy"
      contains: "@getbrevo/brevo"
  key_links:
    - from: "web/src/components/campaigns/CampaignHero.tsx"
      to: "web/src/components/campaigns/CampaignReportDialog.tsx"
      via: "rendered after the FAQ list inside the 'Warum Briefkampagne?' section with slug={campaign.slug}"
      pattern: "CampaignReportDialog slug="
    - from: "web/src/components/campaigns/CampaignReportDialog.tsx"
      to: "web/src/lib/actions/reportCampaign.ts"
      via: "submit calls reportCampaignAction with a plain object"
      pattern: "reportCampaignAction\\("
    - from: "web/src/lib/actions/reportCampaign.ts"
      to: "web/src/lib/email/sendCampaignCreatorEmail.ts"
      via: "kind report, recipientEmail campaign.creatorEmail, adminCopy true"
      pattern: "kind: \"report\""
    - from: "web/src/lib/email/sendCampaignCreatorEmail.ts"
      to: "THOMAS_MAIL"
      via: "existing bcc branch for adminCopy"
      pattern: "THOMAS_MAIL"
---

<objective>
Add a DSA-Art.-16 reporting path to public campaign pages and make campaign responsibility clear, exactly as approved in /Users/thomas/.claude/plans/wer-haftet-denn-f-r-fancy-lerdorf.md.

Purpose: Campaigns are third-party content (Art. 6 DSA host privilege). Thomas needs an unobtrusive "Stimmt was nicht?" report form that mails the campaign creator (BCC Thomas) without exposing any email address on the page, plus a casual responsibility note in the create form and factual wording updates in the Nutzungsbedingungen (D-01 to D-10).

Output: server action + two mail paths with a mocked-Brevo Jest test, a native dialog on the campaign page, and copy changes in the create form and the terms page. No database writes, no new packages.
</objective>

<decisions>
Decision IDs map to the approved plan (source of truth). Locked, do not reinterpret:
- D-01: The Freigabe is only an abuse and spam check, not a content review.
- D-02: No email addresses on the campaign page. A "Stimmt was nicht?" link opens a form with dropdowns.
- D-03: The report goes via Brevo to the campaign creator, BCC to THOMAS_MAIL through the existing adminCopy path in sendCampaignCreatorEmail, replyTo Thomas so answers do not reach the reporter.
- D-04: The reporter email is optional and only visible to Thomas. If given: separate short admin mail (email + slug) to Thomas and a receipt confirmation to the reporter (Art. 16 Abs. 5).
- D-05: Campaign loaded server-side via getActiveCampaignBySlug; creator email never leaves the server; action returns only { success }; no DB table, nothing stored (DSGVO).
- D-06: Zod fields slug, reason (enum), role (enum), message (20 to 1000), reporterEmail (optional email), goodFaith (required checkbox, Art. 16 Abs. 2 d). Rate limit about 3 per hour per IP via a new LIMITS entry. No captcha, no honeypot.
- D-07: Placement is unobtrusive: only at the very bottom of the "Warum Briefkampagne?" section in CampaignHero.tsx (below the FAQ list), text-xs text-warmgrau/45, text button underlined only on hover/focus, no icon, no color, not in the hero and not in the letter form. Hero layout and the Infrastruktur line stay unchanged. The approved plan allows the same line at the end of CampaignEndedView "bei Bedarf".
- D-08: Casual responsibility text only in the CreatorCampaignForm "Verantwortung" box; checkbox and Nutzungsbedingungen link stay.
- D-09: Nutzungsbedingungen (factual): a) "Wie ich prüfe" describes the Freigabe as a rough check for obvious violations and spam, no content review; b) "Rechtswidrige Inhalte melden" mentions "Stimmt was nicht?" on every campaign page, mail stays as alternative; c) update Stand date; d) extend the PRÜFEN (Anwalt) comment with gGmbH-Satzung as provider and DSGVO duties for campaign texts after EuGH C-492/23.
- D-10: UI work goes through the frontend-design skill. Verification: mocked-Brevo Jest test, lint/test/build, local preview without any real send.

Out of scope (approved plan, not a change): homepage campaign highlighting (random/newness).

Claude's discretion (choices made here):
- Client-safe option constants live in a new web/src/lib/campaigns/reportOptions.ts because a "use server" file may only export async functions.
- Admin + confirmation mails live in a new web/src/lib/email/sendCampaignReportEmails.ts with the soft API-key guard of sendErrorReportEmail.ts, so a missing key never crashes the reporting path.
- replyTo uses FOUNDER_EMAIL from web/src/lib/config.ts (same as sendFollowupEmail.ts), so the private THOMAS_MAIL address is never revealed to creators or reporters. The admin mail goes to THOMAS_MAIL, falling back to CONTACT.email.
- CampaignEndedView gets the line only when the campaign status is "active", because ended-while-paused campaigns are not found by getActiveCampaignBySlug and the form would always fail there.
- The dialog states that the message goes to the person behind the campaign and to Brief-nach-Berlin (transparency, since the text is forwarded).
</decisions>

<coordination>
Quick task 261009-j9j (Meilenstein-Mails) currently has UNCOMMITTED edits in web/src/lib/email/sendCampaignCreatorEmail.ts and web/src/lib/email/buildCampaignCreatorEmailHtml.ts and its plan also edits web/src/components/campaigns/CreatorCampaignForm.tsx. Never overwrite, stash, revert or partially stage those edits. Task 1 and Task 3 carry a precondition: if it fails, stop and report "Blocked: 261009-j9j edits in <file> are not committed yet" instead of editing. Once j9j is committed, build on top of it: keep the "milestone" kind, its optional milestone field, HEAD_STYLE/STRIPE_ROW and the milestone early return exactly as they are.

Ignore iCloud duplicate files whose names end in " 2.ts", " 2.tsx", " 2.md" or " 2.jpg". Do not edit, stage or delete them.
</coordination>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/thomas/.claude/plans/wer-haftet-denn-f-r-fancy-lerdorf.md
@.planning/STATE.md
@web/AGENTS.md
@web/src/lib/actions/reportError.ts
@web/src/lib/rateLimit.ts
@web/src/lib/email/sendCampaignCreatorEmail.ts
@web/src/lib/email/buildCampaignCreatorEmailHtml.ts
@web/src/lib/email/sendErrorReportEmail.ts
@web/src/components/campaigns/CampaignFixedRecipientBadge.tsx
@web/src/components/campaigns/CampaignHero.tsx

Known code facts (verified 2026-10-09):
- sendCampaignCreatorEmail.ts builds its BrevoClient at import time and throws if BREVO_API_KEY is unset. Any test that imports it (directly or through the action) must set the env first and import dynamically (pattern: web/src/__tests__/schreibMerzEmail.test.ts), or mock the module.
- BCC branch: `params.adminCopy && process.env.THOMAS_MAIL ? [{ email: THOMAS_MAIL }] : undefined`. Tags are `campaign-${kind}`.
- replyTo pattern: web/src/lib/email/sendFollowupEmail.ts uses `replyTo: { email: FOUNDER_EMAIL }`; FOUNDER_EMAIL is exported from web/src/lib/config.ts.
- getActiveCampaignBySlug(slug) in web/src/lib/campaigns/repository.ts returns Campaign | null (status active + moderation approved) and throws CampaignRepositoryError on DB errors. Campaign has creatorEmail, title, slug, creatorName, status.
- campaignSlugSchema is exported from web/src/lib/campaigns/schema.ts.
- zod is v4 in this repo; existing code uses z.string().trim().email().max(200) (keep that style).
- Jest: testEnvironment node, ts-jest with type checking, tests in web/src/__tests__/*.test.ts. campaignHero.test.ts, campaignHeroFixedRecipient.test.ts and campaignPage.test.ts render CampaignHero / CampaignEndedView with renderToStaticMarkup without mocking them.
- Copy rules: German, du-Form, warm and direct, no em dashes (U+2014) in any user-facing text, check against /Users/thomas/Documents/Git Repos/signs-of-ai-writing.md.
</context>

<source_coverage>
| Source item | Covered by |
|---|---|
| GOAL: Meldeweg auf Kampagnenseite + klarer Verantwortungshinweis | Tasks 1-3 |
| REQ KAMPAGNEN-MELDUNG | Tasks 1-3 |
| D-01 | Task 3 (terms a, form text) |
| D-02 | Task 2 |
| D-03 | Task 1 |
| D-04 | Task 1 (mails), Task 2 (optional field + hint) |
| D-05 | Task 1 |
| D-06 | Task 1 (server), Task 2 (client mirror) |
| D-07 | Task 2 |
| D-08 | Task 3 |
| D-09 a-d | Task 3 |
| D-10 | Task 2 (frontend-design), Tasks 1-3 verify |
| Approved-plan Verifikation (Jest mocked Brevo, lint/test/build, preview without sends) | Task 1 verify, Task 2 smoke, Task 3 verify |
</source_coverage>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end report path: reportCampaignAction to creator mail with BCC, plus admin and receipt mails (mocked Brevo)</name>
  <files>web/src/lib/campaigns/reportOptions.ts, web/src/lib/actions/reportCampaign.ts, web/src/lib/rateLimit.ts, web/src/lib/email/buildCampaignCreatorEmailHtml.ts, web/src/lib/email/sendCampaignCreatorEmail.ts, web/src/lib/email/sendCampaignReportEmails.ts, web/src/__tests__/reportCampaign.test.ts</files>
  <precondition>261009-j9j email edits are committed: `git diff --quiet HEAD -- web/src/lib/email/sendCampaignCreatorEmail.ts web/src/lib/email/buildCampaignCreatorEmailHtml.ts` exits 0 from the repo root.</precondition>
  <read_first>web/src/lib/actions/reportError.ts, web/src/lib/rateLimit.ts, web/src/lib/email/sendCampaignCreatorEmail.ts, web/src/lib/email/buildCampaignCreatorEmailHtml.ts (milestone early return near the top of buildCampaignCreatorEmailHtml), web/src/lib/email/sendErrorReportEmail.ts, web/src/lib/email/sendFollowupEmail.ts (replyTo), web/src/__tests__/schreibMerzEmail.test.ts (Brevo mock + env + dynamic import), web/src/__tests__/transferCampaignAction.test.ts</read_first>
  <behavior>
    - Valid report without reporterEmail: exactly 1 sendTransacEmail call; to = [{ email: creator email }]; bcc = [{ email: THOMAS_MAIL }]; replyTo.email = FOUNDER_EMAIL; tags contain "campaign-report"; htmlContent contains the reason label, the role label and the message; action resolves to exactly { success: true }.
    - Valid report with reporterEmail "melder@example.org": exactly 3 calls. The creator call (to = creator) does not contain "melder@example.org" anywhere in JSON.stringify(payload). One call goes to THOMAS_MAIL and contains "melder@example.org" and the slug. One call goes to "melder@example.org" (receipt) and does not contain the creator email.
    - Message containing "<script>alert(1)</script>" appears escaped in the creator htmlContent (no raw "<script>").
    - No mail and { success: false } for: message under 20 chars, message over 1000 chars, unknown reason, unknown role, invalid reporterEmail, goodFaith false or missing, invalid slug format, getActiveCampaignBySlug returning null, getActiveCampaignBySlug throwing.
    - Empty-string reporterEmail is treated as "not given" (1 mail only).
    - Rate limit: 3 valid reports from the same IP succeed, the 4th returns { success: false } and sends nothing.
    - The returned object never contains the creator email.
  </behavior>
  <action>
Per D-03, D-04, D-05, D-06. Write the test first (RED), then implement (GREEN).

1. web/src/lib/campaigns/reportOptions.ts (new, no server imports, importable by client and server): export the reason values with German labels in this exact order: "falsche-angaben" = "Falsche Angaben", "falscher-empfaenger" = "Falscher Empfänger oder Adresse", "beleidigend" = "Beleidigend oder hetzerisch", "rechte-verletzt" = "Bild- oder Logorechte verletzt", "sonstiges" = "Sonstiges". Export role values: "briefschreiber" = "Briefschreiber:in", "betroffen" = "Selbst betroffen", "sonstige" = "Sonstige". Shape: readonly value tuples (usable with z.enum) plus label lookup records typed by value, and exported CAMPAIGN_REPORT_MESSAGE_MIN = 20 and CAMPAIGN_REPORT_MESSAGE_MAX = 1000.

2. web/src/lib/rateLimit.ts: add LIMITS.REPORT_CAMPAIGN_PER_IP = { max: 3, windowMs: 60 * 60_000 } next to REPORT_ERROR_PER_IP with a one-line comment in the existing style (campaign reports per IP, each one mails a real creator).

3. web/src/lib/email/buildCampaignCreatorEmailHtml.ts: add "report" to CampaignCreatorEmailKind. Add exported interface CampaignReportEmailParams { reasonLabel: string; roleLabel: string; message: string } and optional report?: CampaignReportEmailParams on BuildCampaignCreatorEmailHtmlParams. Add a private buildCampaignReportEmailHtml(params, report) and an early return at the top of buildCampaignCreatorEmailHtml when kind is "report" and report is set, mirroring the milestone early return. Reuse escapeHtml, HEAD_STYLE, STRIPE_ROW and the existing color palette (#2D6A4F, #1B4332, #666666, #E0DCD7). Content: greeting "Moin {creatorName}," or "Moin,"; headline "Hinweis zu deiner Kampagne"; one intro sentence saying someone used "Stimmt was nicht?" on the campaign page of "{title}" (title escaped, linked to campaignUrl); a box with three rows "Was stimmt nicht", "Meldet als", "Nachricht" (all escaped, message newlines converted to br); then the sentence "Ich melde mich, falls etwas zu tun ist." and the normal sign-off/footer used by the other creator mails. No management button, no share block, no reporter email field exists in this builder at all.

4. web/src/lib/email/sendCampaignCreatorEmail.ts: turn SendCampaignCreatorEmailParams into a discriminated union on kind: a shared base (recipientEmail, campaignTitle, slug, creatorName?, adminCopy?, campaignStatus?, plus the existing milestone? field) combined with either kind Exclude of "report" with token: string, or kind "report" with report: CampaignReportEmailParams and no token. All existing callers keep compiling unchanged. For kind "report": subject is "{APP_NAME}: Hinweis zu deiner Kampagne", actionUrl passed to the builder is campaignUrl(slug) (not rendered), and replyTo is { email: FOUNDER_EMAIL }. All other kinds behave exactly as before (no replyTo added to them). The existing adminCopy BCC branch stays the only BCC mechanism.

5. web/src/lib/email/sendCampaignReportEmails.ts (new): BrevoClient built only if BREVO_API_KEY is set (soft guard like sendErrorReportEmail.ts, return { success: false } with a console.error that contains no email address). Same sender as the other mails (EMAIL_SENDER_NAME, BREVO_SENDER_EMAIL fallback brief@brief-nach-berlin.de) and replyTo FOUNDER_EMAIL.
   a. sendCampaignReportAdminEmail({ reporterEmail, slug, campaignTitle, reasonLabel }): to process.env.THOMAS_MAIL, falling back to CONTACT.email; subject "[BnB Kampagnen-Meldung] {slug}"; short escaped HTML with reporter email, slug, campaign link ({APP_URL}/kampagne/{slug}) and reason label; tag "campaign-report-admin".
   b. sendCampaignReportConfirmationEmail({ reporterEmail, campaignTitle }): to the reporter; subject "{APP_NAME}: Deine Meldung ist angekommen"; short escaped HTML: "Moin," then "Danke, deine Meldung zur Kampagne „{title}“ ist angekommen. Ich schaue drauf." and the sign-off; tag "campaign-report-confirmation". It never contains the creator email or the reported message.

6. web/src/lib/actions/reportCampaign.ts (new, first line "use server"): export type ReportCampaignResult = { success: boolean } and async reportCampaignAction(input: unknown). Zod schema: slug via campaignSlugSchema; reason and role via z.enum over the reportOptions tuples; message trimmed string min 20 max 1000; reporterEmail optional, empty or whitespace-only string preprocessed to undefined, otherwise z.string().trim().email().max(200); goodFaith z.literal(true). Order: safeParse (fail returns { success: false }), then rate limit with key "report-campaign:ip:{hashIdentifier(await getClientIp())}" and LIMITS.REPORT_CAMPAIGN_PER_IP, then inside try/catch getActiveCampaignBySlug(slug) (null or throw returns { success: false }), then sendCampaignCreatorEmail with kind "report", recipientEmail campaign.creatorEmail, campaignTitle, slug, creatorName, adminCopy true and report { reasonLabel, roleLabel, message }. If that send fails return { success: false } and send nothing else. If reporterEmail is set, await both sendCampaignReportAdminEmail and sendCampaignReportConfirmationEmail (their failure does not flip the result). Return { success: true }. Never log the message, the reporter email or the creator email; console.error only with a generic prefix and the slug. No database writes.

7. web/src/__tests__/reportCampaign.test.ts (new): jest.mock("server-only") virtual like other tests; jest.mock("@getbrevo/brevo") so every BrevoClient instance shares one jest.fn named mockSendTransacEmail (resolves { messageId: "m1" }); jest.mock("@/lib/campaigns/repository") with getActiveCampaignBySlug as jest.fn; partial jest.mock("@/lib/rateLimit") that spreads jest.requireActual and replaces getClientIp with an async function returning a mutable mockClientIp variable (give each test its own IP; the rate-limit test reuses one). In beforeAll set BREVO_API_KEY = "test-key" and THOMAS_MAIL = "thomas@example.org" (restore in afterAll), then load the action with await import("@/lib/actions/reportCampaign"). Campaign fixture: slug "sichere-schulwege", title "Sichere Schulwege", creatorEmail "creator@example.org", creatorName "Initiative Beispiel", status "active" (cast as never). Cover every bullet in behavior. No real network: the Brevo module is fully mocked.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/reportCampaign.test.ts src/__tests__/campaignCreatorEmail.test.ts src/__tests__/transferCampaignAction.test.ts && npx tsc --noEmit -p . && ! grep -n "$(printf '\342\200\224')" src/lib/campaigns/reportOptions.ts src/lib/actions/reportCampaign.ts src/lib/email/sendCampaignReportEmails.ts && D=$(git diff -U0 HEAD -- src/lib/email src/lib/rateLimit.ts) && ! (printf '%s\n' "$D" | grep '^+' | grep -q "$(printf '\342\200\224')")</automated>
  </verify>
  <done>reportCampaign.test.ts passes with all behavior cases, existing creator-mail and transfer tests stay green, tsc has no errors, no em dash in new or added lines. The creator mail payload never contains the reporter email, BCC is THOMAS_MAIL, admin + receipt mails only exist when a reporter email was given. No real email was sent.</done>
</task>

<task type="auto">
  <name>Task 2: "Stimmt was nicht?" dialog, unobtrusive line in CampaignHero and active ended view</name>
  <files>web/src/components/campaigns/CampaignReportDialog.tsx, web/src/components/campaigns/CampaignHero.tsx, web/src/components/campaigns/CampaignEndedView.tsx, web/src/__tests__/campaignHero.test.ts, web/src/__tests__/campaignHeroFixedRecipient.test.ts, web/src/__tests__/campaignPage.test.ts</files>
  <read_first>web/src/components/campaigns/CampaignFixedRecipientBadge.tsx (native dialog, backdrop click, focus return, button styles), web/src/components/campaigns/CampaignHero.tsx (section "Warum Briefkampagne?" at the end), web/src/components/campaigns/CampaignEndedView.tsx, web/src/lib/campaigns/reportOptions.ts, .planning/brand-identity.md</read_first>
  <action>
Per D-02, D-04, D-06, D-07, D-10. Load the frontend-design skill (frontend-design:frontend-design) before writing UI, and state in the SUMMARY that it was used. The visual scope is locked by D-07: do not restyle anything outside the new line and the dialog.

1. web/src/components/campaigns/CampaignReportDialog.tsx (new, "use client"), props { slug: string } only. Renders:
   a. Trigger line: a p with mt-6 font-body text-xs text-warmgrau/45 containing a type="button" text button "Stimmt was nicht?" with aria-haspopup="dialog", no underline by default, underline only on hover and focus-visible, visible focus outline (focus-visible:outline-waldgruen like the badge), inline-flex min-h-11 items-center for a 44px tap target without visual weight. No icon, no extra color.
   b. A native dialog opened with showModal(), aria-labelledby the title, backdrop click closes (same bounding-rect check as CampaignFixedRecipientBadge), Escape closes natively, onClose returns focus to the trigger. Same dialog shell classes as the badge (bg-creme, max-w-md, max-h-[90dvh] overflow-y-auto, w-[calc(100%-2rem)]). No animation unless wrapped in motion-safe.
   c. Content: title "Stimmt was nicht?"; one line "Deine Nachricht geht an die Person hinter der Kampagne und an Brief-nach-Berlin."; form with noValidate and custom German errors:
      - select "Was stimmt nicht?" with first disabled empty option "Bitte auswählen" and the reason options from reportOptions in order;
      - select "Ich bin" with the role options;
      - textarea "Was genau?" (maxLength 1000, hint "Mindestens 20 Zeichen.");
      - input type email, autocomplete email, label "Deine E-Mail (optional)", hint "Nur wenn du eine Antwort möchtest. Sieht nur Brief-nach-Berlin.";
      - checkbox "Ich mache diese Angaben nach bestem Wissen.";
      - buttons "Meldung senden" (primary pill like the badge's Schließen button) and "Abbrechen" (text button, closes).
      Every field has a real label (htmlFor/id via useId), aria-invalid and aria-describedby pointing to its error; on submit with errors show messages ("Bitte wähl aus, was nicht stimmt.", "Bitte wähl aus, wer du bist.", "Bitte beschreib es in mindestens 20 Zeichen.", "Die E-Mail-Adresse sieht nicht vollständig aus.", "Bitte bestätige, dass du nach bestem Wissen meldest.") and move focus to the first invalid field. Client checks mirror the server schema; the server stays the authority.
   d. Submit calls reportCampaignAction({ slug, reason, role, message, reporterEmail, goodFaith }) inside useTransition; the submit button is disabled while pending and reads "Wird gesendet …". Success replaces the form with a role="status" text "Danke, ist angekommen. Ich schaue drauf." plus, only if an email was given, "Du bekommst gleich eine Bestätigung per Mail.", and an autofocused "Schließen" button. Failure shows role="alert" text "Das hat nicht geklappt. Versuch es bitte in ein paar Minuten noch mal." and keeps the input. Closing after success resets the form. No email address is shown anywhere in the component.

2. web/src/components/campaigns/CampaignHero.tsx: import CampaignReportDialog and render it with slug={campaign.slug} directly after the FAQ div (the divide-y list) as the last child of the "Warum Briefkampagne?" section. Change nothing else in the file: hero, letter starter, the line "Die Kampagne nutzt die Infrastruktur von Brief-nach-Berlin." and all classes stay byte-identical. Pass only the slug, never other campaign fields.

3. web/src/components/campaigns/CampaignEndedView.tsx: add "status" to the EndedCampaign Pick and render the same CampaignReportDialog at the end of the main content container only when campaign.status is "active" (ended-while-paused campaigns are not reachable by getActiveCampaignBySlug). The page already passes the full campaign, so web/src/app/(site)/kampagne/[slug]/page.tsx needs no change.

4. Tests (they render the real components and would otherwise load Brevo at import): add jest.mock("@/lib/actions/reportCampaign", () => ({ reportCampaignAction: jest.fn() })) to campaignHero.test.ts, campaignHeroFixedRecipient.test.ts and campaignPage.test.ts. Add assertions:
   a. campaignHero.test.ts: markup contains "Stimmt was nicht?", its index is greater than the index of "Weniger Klick, mehr Gewicht", markup still contains "Die Kampagne nutzt die Infrastruktur von Brief-nach-Berlin.", and markup contains the labels "Was stimmt nicht?", "Ich bin" and "Bild- oder Logorechte verletzt".
   b. campaignPage.test.ts: the active ended view contains "Stimmt was nicht?"; the ended-while-paused view does not.

5. Local smoke (executor, no real sends): run `cd web && npm run dev`, open an active campaign from the local campaign list at /kampagne/<slug>, open the dialog, press "Meldung senden" with empty fields and confirm the German errors plus focus on the first field, press Escape and confirm focus is back on "Stimmt was nicht?", check 375px and desktop width and save screenshots to the quick-task directory. NEVER submit a valid report against the dev server: .env.local has a real Brevo key and the mail would reach a real creator. Stop the dev server afterwards.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/campaignHero.test.ts src/__tests__/campaignHeroFixedRecipient.test.ts src/__tests__/campaignPage.test.ts src/__tests__/reportCampaign.test.ts && grep -cF "Die Kampagne nutzt die Infrastruktur von Brief-nach-Berlin." src/components/campaigns/CampaignHero.tsx && grep -qF "CampaignReportDialog slug=" src/components/campaigns/CampaignHero.tsx && ! grep -n "$(printf '\342\200\224')" src/components/campaigns/CampaignReportDialog.tsx && npm run lint</automated>
  </verify>
  <done>The campaign page shows only the small muted "Stimmt was nicht?" line at the bottom of "Warum Briefkampagne?"; the dialog validates in German, closes on Escape/backdrop and returns focus; active ended views show the line, paused-ended views do not; hero tests and page tests pass; lint passes; smoke screenshots (375px + desktop) exist; no valid report was submitted locally.</done>
</task>

<task type="auto">
  <name>Task 3: Responsibility text in the create form and factual Nutzungsbedingungen updates</name>
  <files>web/src/components/campaigns/CreatorCampaignForm.tsx, web/src/app/(site)/nutzungsbedingungen/page.tsx</files>
  <precondition>261009-j9j form edits are committed: `git diff --quiet HEAD -- web/src/components/campaigns/CreatorCampaignForm.tsx` exits 0 from the repo root.</precondition>
  <read_first>web/src/components/campaigns/CreatorCampaignForm.tsx (the "Verantwortung" box, around the responsibilityAccepted checkbox), web/src/app/(site)/nutzungsbedingungen/page.tsx (top comment, "Wie ich prüfe", "Kampagnen" with "Rechtswidrige Inhalte melden", Stand line), /Users/thomas/Documents/Git Repos/signs-of-ai-writing.md</read_first>
  <action>
Per D-01, D-08, D-09.

1. web/src/components/campaigns/CreatorCampaignForm.tsx: in the "Verantwortung" box replace only the text of the first paragraph (the one beginning "Die Kampagne erscheint mit deinem Anliegen öffentlich.") with exactly: "Rein rechtlich liegen Inhalt und Verantwortung für deine Kampagne bei dir: Titel, Beschreibung, Bild, Links und der vorbereitete Brieftext. Ich schaue vor der Freischaltung nur, dass das Gröbste passt, damit du dich nicht aufs Glatteis begibst." Keep the heading, classes, the required responsibilityAccepted checkbox, its label text and the Nutzungsbedingungen link unchanged. Check the sentence against signs-of-ai-writing.md; it was approved as a draft, so only change wording if the checklist clearly flags something and report any change in the SUMMARY.

2. web/src/app/(site)/nutzungsbedingungen/page.tsx (factual tone, ich-Form as in the rest of the page, no em dashes):
   a. "Wie ich prüfe": keep the KI sentence and the Mistral filter, replace the part about approving every new campaign with: "Bevor eine neue Kampagne online geht, schaue ich sie kurz durch. Das ist eine grobe Prüfung auf offensichtliche Verstöße und Spam, keine inhaltliche Prüfung." Keep the "Filter machen Fehler..." sentences.
   b. "Rechtswidrige Inhalte melden": lead with "Auf jeder Kampagnenseite findest du ganz unten den Link „Stimmt was nicht?“. Deine Meldung geht an die Person hinter der Kampagne und an mich." then "Alternativ schreib eine Mail an" with the existing mailto link to CONTACT.email (keep it), keep "Nenn die Kampagne, das Problem und warum du den Inhalt für rechtswidrig hältst." and change the receipt sentence to "Wenn du deine E-Mail-Adresse angibst oder mir schreibst, bestätige ich den Eingang und prüfe die Meldung zügig."
   c. Stand line: "Stand: 9. Oktober 2026".
   d. Extend the existing "PRÜFEN (Anwalt)" code comment with two more questions: whether the Satzung of the WE AID gGmbH covers it acting as provider (Anbieter), and which DSGVO duties apply to personal data in campaign texts after EuGH C-492/23. Comment only, not rendered.

3. Run the full web checks.
  </action>
  <verify>
    <automated>cd web && grep -qF "aufs Glatteis" src/components/campaigns/CreatorCampaignForm.tsx && grep -qF "keine inhaltliche Prüfung" "src/app/(site)/nutzungsbedingungen/page.tsx" && grep -qF "Stimmt was nicht?" "src/app/(site)/nutzungsbedingungen/page.tsx" && grep -qF "Stand: 9. Oktober 2026" "src/app/(site)/nutzungsbedingungen/page.tsx" && grep -qF "C-492/23" "src/app/(site)/nutzungsbedingungen/page.tsx" && grep -qF "responsibilityAccepted" src/components/campaigns/CreatorCampaignForm.tsx && D=$(git diff -U0 HEAD -- src/components/campaigns/CreatorCampaignForm.tsx "src/app/(site)/nutzungsbedingungen/page.tsx") && ! (printf '%s\n' "$D" | grep '^+' | grep -q "$(printf '\342\200\224')") && npm run lint && npm run test && npm run build</automated>
  </verify>
  <done>Create form shows the casual responsibility text with checkbox and link intact; the terms page has the four D-09 changes; full lint, full Jest suite and production build pass in web/.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser to reportCampaignAction | Untrusted form input (free text, optional email, enum values, slug) crosses into a server action that sends mail |
| server to Brevo to creator inbox | User-supplied text is rendered into HTML mail delivered to a third party (campaign creator) |
| server to reporter inbox | Receipt mail goes to an address the requester typed in |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-jrt-01 | Information disclosure | reportCampaignAction / CampaignReportDialog | high | mitigate | Dialog receives only slug; action loads creatorEmail server-side and returns only { success }; Task 1 test asserts result has no creator email |
| T-jrt-02 | Information disclosure | creator report mail | high | mitigate | Builder has no reporter-email field; reporter email only in admin mail to Thomas; Task 1 test asserts JSON of creator payload lacks it |
| T-jrt-03 | Denial of service / abuse | reportCampaignAction | medium | mitigate | Zod enums, 20-char minimum, required goodFaith, LIMITS.REPORT_CAMPAIGN_PER_IP 3/h; only active approved campaigns are reachable via getActiveCampaignBySlug. In-memory limiter per instance is an accepted residual (documented in rateLimit.ts) |
| T-jrt-04 | Tampering (HTML injection) | buildCampaignReportEmailHtml, sendCampaignReportEmails | medium | mitigate | All user text escaped with escapeHtml, newlines converted after escaping; subjects contain only fixed text, APP_NAME and validated slug; Task 1 test checks escaped script tag |
| T-jrt-05 | Spoofing | receipt mail to typed address | low | accept | Receipt is short, neutral, contains no report text or creator data; rate limit caps volume |
| T-jrt-06 | Repudiation | no persistence | low | accept | Deliberate DSGVO decision (D-05); Thomas keeps BCC and admin mail as record |
| T-jrt-07 | Information disclosure | logs | medium | mitigate | console.error only with prefix and slug, never message or email addresses |
| T-jrt-08 | Information disclosure | replyTo header | low | mitigate | replyTo uses public FOUNDER_EMAIL, never the private THOMAS_MAIL |
| T-jrt-SC | Tampering | npm installs | high | accept | No packages installed in this plan; existing @getbrevo/brevo, zod, react only |
</threat_model>

<verification>
- `cd web && npx jest src/__tests__/reportCampaign.test.ts` passes (mocked Brevo; creator mail without reporter email, BCC set, admin + receipt only with reporter email).
- `cd web && npm run lint && npm run test && npm run build` passes.
- Local smoke on /kampagne/<slug>: dialog opens from the bottom line, empty-field errors, Escape returns focus, 375px + desktop screenshots. No valid report submitted.
- `git status` shows j9j and iCloud " 2" files untouched by this task.
</verification>

<success_criteria>
- A visitor can report a campaign via "Stimmt was nicht?" without seeing any email address; the creator gets the report with Thomas in BCC; the reporter's email only reaches Thomas; a reporter who leaves an email gets a receipt.
- The campaign page looks the same as before except one small muted line under the FAQ list.
- Create form and Nutzungsbedingungen carry the approved responsibility and Freigabe wording.
- Nothing is persisted, no new dependency, all checks green.
</success_criteria>

<output>
Create `.planning/quick/261009-jrt-kampagnen-stimmt-was-nicht-meldung-und-v/261009-jrt-SUMMARY.md` when done. Include: frontend-design skill used, any wording deviation from the approved copy with reason, smoke screenshot paths, and the open item that the Datenschutzerklärung does not yet describe the report form processing (not in the approved scope).
</output>
