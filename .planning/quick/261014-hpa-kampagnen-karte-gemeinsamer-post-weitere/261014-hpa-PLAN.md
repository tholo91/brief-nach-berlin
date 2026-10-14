---
phase: quick-261014-hpa
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/campaigns/CampaignReferralCard.tsx
  - web/src/components/campaigns/CampaignReferralShareButton.tsx
  - web/src/lib/share.ts
  - web/src/app/(site)/kampagne/verwalten/page.tsx
  - web/src/__tests__/campaignCreatorStats.test.ts
autonomous: true
requirements: [QUICK-261014-hpa]

estimate:
  tokens: 40000
  raw_tokens: 40000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "On /kampagne/verwalten the referral card heading reads 'Lust auf einen gemeinsamen Post?' and the paragraph is the approved copy verbatim"
    - "The first button is the filled 'Gemeinsamen Post planen' mailto link to BRIEF_EMAIL with subject 'Gemeinsamer Post: <slug>' of the current campaign"
    - "The second button is the outline share button labelled 'Brief-nach-Berlin weiterempfehlen' with the share icon, and its label can wrap on narrow phones instead of overflowing"
    - "The shared text (Web Share / mail fallback) uses subject 'Briefkampagne mit Brief-nach-Berlin' and the approved text including the campaign start URL and BRIEF_EMAIL"
    - "The card markup contains the brand only in hyphenated form and no em/en dashes"
    - "All changes stay uncommitted in the working tree"
  artifacts:
    - path: "web/src/components/campaigns/CampaignReferralCard.tsx"
      provides: "Card with slug prop, joint-post mailto as primary button, new copy"
    - path: "web/src/components/campaigns/CampaignReferralShareButton.tsx"
      provides: "Outline share button labelled 'Brief-nach-Berlin weiterempfehlen'"
    - path: "web/src/lib/share.ts"
      provides: "buildCampaignStartShare with new subject/text using BRIEF_EMAIL"
    - path: "web/src/__tests__/campaignCreatorStats.test.ts"
      provides: "Updated describe('CampaignReferralCard') assertions"
  key_links:
    - from: "web/src/app/(site)/kampagne/verwalten/page.tsx"
      to: "CampaignReferralCard"
      via: "slug={authorizedCampaign.slug} prop"
      pattern: "CampaignReferralCard slug=\\{authorizedCampaign\\.slug\\}"
    - from: "web/src/components/campaigns/CampaignReferralCard.tsx"
      to: "BRIEF_EMAIL from @/lib/contact"
      via: "joint-post mailto href with encodeURIComponent subject"
      pattern: "Gemeinsamer Post: "
    - from: "web/src/lib/share.ts"
      to: "@/lib/contact"
      via: "import { BRIEF_EMAIL }"
      pattern: "from \"@/lib/contact\""
---

<objective>
Rework the copy and button order of `CampaignReferralCard` on `/kampagne/verwalten` exactly as in the user-approved plan `/Users/thomas/.claude/plans/auf-einer-kampagnenmanagement-seite-steh-wondrous-fox.md` (all copy is LOCKED, transcribe verbatim, never rephrase). The card now asks NGOs and creators for a joint post (primary, filled mailto button carrying the campaign slug) and for recommending Brief-nach-Berlin (secondary, outline share button). The old introduce-Thomas link is removed; Thomas' address now lives inside the shared text.

Purpose: Creators get a clear, specific ask ("gemeinsamer Post", "weiterempfehlen") instead of the vague introduce link, and the brand is spelled with hyphens everywhere on the card.
Output: 4 source files + 1 test file changed, all uncommitted.

HARD RULES for the executor:
1. Do NOT run `git add`, `git commit`, `git push` or any other git write. Thomas forbids commits without explicit approval. Leave every change uncommitted in the working tree; the SUMMARY lists the changed files instead of commit hashes. This overrides the default per-task commit step of the execute workflow.
2. Copy strings below are locked. Copy them character for character, including umlauts, the colon after "Schritt" and the straight apostrophe in "geht's" (rendered via the existing `&apos;`). No em or en dashes anywhere.
3. Do NOT touch `SUPPORT_CONTENT.ctas.share` / `uiCatalog` ("Weiterempfehlen" in the support block is a different place), `web/src/lib/email/buildCampaignCreatorEmailHtml.ts` (its "stell mich vor" mail line is out of scope) or `web/src/__tests__/campaignMilestoneEmail.test.ts`.
4. No UI skill pass: per the approved plan only copy, button order and existing class strings change (no new styles, no layout change). This is the stated exception to the frontend-design rule.

Locked copy (source: approved plan, section "Neue Copy"):
- H2: `Lust auf einen gemeinsamen Post?`
- Paragraph: `Ich teile deine Kampagne gern auf Instagram oder LinkedIn, am liebsten in einem gemeinsamen Post. Und kennst du Creator oder Initiativen, die über Politik posten? Mit Brief-nach-Berlin bekommt ihr Publikum einen konkreten nächsten Schritt: einen Brief an die eigenen Abgeordneten.`
- Primary button (filled): `Gemeinsamen Post planen`, href = mailto to BRIEF_EMAIL with subject `Gemeinsamer Post: <slug>`
- Secondary button (outline, share icon): `Brief-nach-Berlin weiterempfehlen`
- Donation line: `Du willst Brief-nach-Berlin unterstützen?` followed by the existing link `Hier geht's zur Spende.`
- Shared subject: `Briefkampagne mit Brief-nach-Berlin`
- Shared text: `Kennst du Brief-nach-Berlin? Darüber schreiben Menschen einen persönlichen Brief an ihre Abgeordneten, kostenlos und ohne Account. Ich nutze es für meine Kampagne, es passt gut als Aufruf unter politische Posts. Eine eigene Kampagne startest du hier: {url} Bei Fragen hilft Thomas, der das Projekt macht: {BRIEF_EMAIL}` where `{url}` is the existing `campaignStartUrl()` value and `{BRIEF_EMAIL}` is the constant from `@/lib/contact` (value `Brief-nach-Berlin@posteo.de`).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/AGENTS.md
@/Users/thomas/.claude/plans/auf-einer-kampagnenmanagement-seite-steh-wondrous-fox.md
@web/src/components/campaigns/CampaignReferralCard.tsx
@web/src/components/campaigns/CampaignReferralShareButton.tsx
@web/src/lib/share.ts
@web/src/lib/contact.ts

<interfaces>
From web/src/lib/contact.ts (pattern to mirror, do not modify this file):
- `export const BRIEF_EMAIL = "Brief-nach-Berlin@posteo.de" as const;`
- `campaignContactHref(slug)` returns a mailto to BRIEF_EMAIL with `subject=${encodeURIComponent(\`Kampagne ${slug}\`)}`. The joint-post href uses the same shape with the subject text `Gemeinsamer Post: ${slug}`.

From web/src/lib/share.ts (signature stays unchanged):
- `buildCampaignStartShare(): Pick<ShareTarget, "url" | "text" | "subject" | "emailUrl">` with `url = campaignStartUrl()` and `emailUrl = mailto:?subject=...&body=...` built via encodeURIComponent. Only the `subject` and `text` constants change.

From web/src/app/(site)/kampagne/verwalten/page.tsx (verified while planning):
- `const authorizedCampaign = ... ? campaign : null;` (line ~135). Line ~176 already reads `authorizedCampaign.slug`. Line ~201 renders the card inside the `authorizedCampaign ? (...)` branch, so `authorizedCampaign` is narrowed to non-null there and `authorizedCampaign.slug` type-checks.

Current class strings (for the swap):
- FILLED (currently on the share button `<a>`): `inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-waldgruen px-4 py-2.5 text-center font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen`
- OUTLINE (currently on the introduce link in the card): `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md border border-waldgruen/30 bg-white/45 px-4 py-2.5 text-center font-body text-sm font-semibold text-waldgruen-dark transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen`

Mobile decision (planner, per locked decision "planner decides"): at a 375px viewport the button row is about 285px wide (375 minus page section px-6, card border, button row px-5). The share button keeps px-4 plus a 16px icon and gap-2, leaving about 229px for the label. "Brief-nach-Berlin weiterempfehlen" in Source Sans 3 semibold 14px measures roughly 210 to 230px, so there is no safe margin at 375px and it overflows at 360px and 320px. Therefore the share button gets `whitespace-normal text-balance` instead of `whitespace-nowrap`. On sm and up the row is `flex-row flex-wrap`; flex items keep their max-content basis, so the button moves to its own row before its label breaks. The primary button ("Gemeinsamen Post planen", about 150px) keeps `whitespace-nowrap`.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer: campaign slug flows from the manage page into the joint-post mailto (primary button)</name>
  <files>web/src/app/(site)/kampagne/verwalten/page.tsx, web/src/components/campaigns/CampaignReferralCard.tsx, web/src/__tests__/campaignCreatorStats.test.ts</files>
  <behavior>
    - Rendering `CampaignReferralCard` with `{ slug: "klima-jetzt" }` produces an anchor whose href is exactly `mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent("Gemeinsamer Post: klima-jetzt")}`, i.e. it contains `subject=Gemeinsamer%20Post%3A%20klima-jetzt`.
    - That anchor's text is `Gemeinsamen Post planen` and it appears in the markup BEFORE the share button's mail fallback href (button order swapped).
    - The old introduce mailto (subject "Vorstellung" plus "Kampagne") no longer appears in the card markup.
    - The manage page passes `slug={authorizedCampaign.slug}` to the card.
  </behavior>
  <action>
RED first: in `web/src/__tests__/campaignCreatorStats.test.ts`, inside `describe("CampaignReferralCard")` (line ~1016), add a `const SLUG = "klima-jetzt";` and render with `createElement(CampaignReferralCard, { slug: SLUG })`. Replace the existing test that checks the introduce-Thomas mailto (the third `it`, currently asserting a `Vorstellung%3A%20Kampagne` subject) with a test named like "plans a joint post by mail with the campaign slug as subject" that asserts: (a) markup contains `href="mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(`Gemeinsamer Post: ${SLUG}`)}"`; (b) markup contains the literal encoded fragment `Gemeinsamer%20Post%3A%20klima-jetzt`; (c) markup does not contain `Vorstellung%3A`; (d) the index of the joint-post href in markup is lower than the index of the share fallback href (`share.emailUrl` with `&` escaped as `&amp;`, same as the existing second test). In the first `it` ("renders the referral copy and both buttons"), remove the old introduce-link label from the string list and add `Gemeinsamen Post planen`. Leave the remaining copy assertions for Task 2. Run the suite and confirm the new test fails.

GREEN: in `web/src/components/campaigns/CampaignReferralCard.tsx`:
1. Delete the module-level introduce-mailto constant. Change the signature to `export function CampaignReferralCard({ slug }: { slug: string })` and compute `const jointPostHref = \`mailto:${BRIEF_EMAIL}?subject=${encodeURIComponent(\`Gemeinsamer Post: ${slug}\`)}\`;` inside the component (same shape as `campaignContactHref` in `web/src/lib/contact.ts`; encodeURIComponent keeps the slug from injecting extra mailto headers).
2. In the button row `<div>` (line ~41), put a plain `<a href={jointPostHref}>` with text `Gemeinsamen Post planen` FIRST, then `<CampaignReferralShareButton ... />` SECOND (props unchanged). Give the mailto anchor the FILLED class string from the interfaces block minus `gap-2` (it has no icon), keeping `whitespace-nowrap`. Remove the old introduce `<a>` element entirely.
3. Keep `BRIEF_EMAIL` import, section id `creator-referral`, avatar, emojis and the donation link attributes untouched.

In `web/src/app/(site)/kampagne/verwalten/page.tsx` line ~201 change the card render to `<CampaignReferralCard slug={authorizedCampaign.slug} />` (the variable is narrowed to non-null in that branch, verified in planning). No other change in this file.

Do not commit. Leave changes in the working tree.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/campaignCreatorStats.test.ts -t "CampaignReferralCard" && grep -q 'CampaignReferralCard slug={authorizedCampaign.slug}' "src/app/(site)/kampagne/verwalten/page.tsx" && ! grep -q "INTRODUCE_HREF" src/components/campaigns/CampaignReferralCard.tsx</automated>
  </verify>
  <done>The joint-post test passes, the mailto carries `Gemeinsamer Post: <slug>` URL-encoded, the mailto is the first button with filled styling, the page passes the slug, and nothing is committed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Locked copy for heading, paragraph, donation line, share button and shared text</name>
  <files>web/src/components/campaigns/CampaignReferralCard.tsx, web/src/components/campaigns/CampaignReferralShareButton.tsx, web/src/lib/share.ts, web/src/__tests__/campaignCreatorStats.test.ts</files>
  <behavior>
    - Card markup (with `&#x27;` and `&quot;` decoded like the existing `decoded` helper) contains: `Lust auf einen gemeinsamen Post?`; `Ich teile deine Kampagne gern auf Instagram oder LinkedIn, am liebsten in einem gemeinsamen Post.`; `Und kennst du Creator oder Initiativen, die über Politik posten?`; `Mit Brief-nach-Berlin bekommt ihr Publikum einen konkreten nächsten Schritt: einen Brief an die eigenen Abgeordneten.`; `Gemeinsamen Post planen`; `Brief-nach-Berlin weiterempfehlen`; `Du willst Brief-nach-Berlin unterstützen?`; `Hier geht's zur Spende.`
    - Card markup contains no em/en dash (existing regex assertion kept) and does not contain the brand spelled with spaces.
    - `buildCampaignStartShare().subject` equals `Briefkampagne mit Brief-nach-Berlin`; `.text` equals the locked shared text with `{url}` = `${APP_URL}/kampagne/starten` and ends with `Bei Fragen hilft Thomas, der das Projekt macht: ${BRIEF_EMAIL}`; subject and text contain no em/en dash; the card still renders the share mail fallback href.
    - Donation link (new tab, noopener) and founder avatar tests still pass unchanged.
  </behavior>
  <action>
RED first: in `describe("CampaignReferralCard")` of `web/src/__tests__/campaignCreatorStats.test.ts`:
1. In the first `it`, replace the old heading string and the old unhyphenated donation question with the eight locked strings listed in the behavior block (paragraph asserted as its three sentences so JSX line wrapping cannot break the match). Keep `expect(decoded).not.toMatch(...)` (the existing em/en dash regex) and add the brand-spelling assertion below.
<!-- planner-discipline-allow: Brief nach Berlin -->
2. Add `expect(decoded).not.toContain("Brief nach Berlin");` in the first `it`.
3. Extend the second `it` ("shares a mail fallback that links the campaign start page"): assert `share.subject` toBe `Briefkampagne mit Brief-nach-Berlin`; assert `share.text` toBe the full locked shared text built as a template literal with `${share.url}` and `${BRIEF_EMAIL}`; assert `share.subject + share.text` does not match the em/en dash regex and does not contain the spaced brand name (same literal as step 2). Keep the existing emailUrl href assertion.
4. Leave the donation and avatar `it` blocks untouched. Run the suite and confirm the copy tests fail.

GREEN:
1. `web/src/components/campaigns/CampaignReferralCard.tsx`: set the H2 text to `Lust auf einen gemeinsamen Post?`; replace the paragraph text with the locked paragraph (JSX may wrap across lines between words); change the donation question to `Du willst Brief-nach-Berlin unterstützen?` and keep the `{" "}` plus the existing `Hier geht&apos;s zur Spende.` link. No class changes in this file beyond Task 1.
2. `web/src/components/campaigns/CampaignReferralShareButton.tsx`: change the label to `Brief-nach-Berlin weiterempfehlen`; keep `<ShareIcon />` before it. Replace the `<a>` className with the OUTLINE class string from the interfaces block, with `gap-2` added after `justify-center` and `whitespace-nowrap` replaced by `whitespace-normal text-balance` (planner mobile decision, see interfaces block). Props, `handleClick` and the Web Share logic stay unchanged.
3. `web/src/lib/share.ts`: add `import { BRIEF_EMAIL } from "@/lib/contact";` next to the existing imports. In `buildCampaignStartShare` set `subject` to `Briefkampagne mit Brief-nach-Berlin` and `text` to the locked shared text as a template literal interpolating `${url}` and `${BRIEF_EMAIL}` (no hard-coded address). Signature, `url` and `emailUrl` construction stay unchanged. Do not touch `buildShareTarget` or any other function.

Do not commit. Leave changes in the working tree.
  </action>
  <verify>
    <automated>cd web && npx jest src/__tests__/campaignCreatorStats.test.ts src/__tests__/campaignMilestoneEmail.test.ts src/__tests__/shareRecipients.test.ts src/__tests__/campaignManagerLayout.test.ts && npx eslint src/components/campaigns/CampaignReferralCard.tsx src/components/campaigns/CampaignReferralShareButton.tsx src/lib/share.ts "src/app/(site)/kampagne/verwalten/page.tsx" src/__tests__/campaignCreatorStats.test.ts && ! (npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/") && ! grep -n "Brief nach Berlin" src/lib/share.ts src/components/campaigns/CampaignReferralCard.tsx src/components/campaigns/CampaignReferralShareButton.tsx && grep -q 'from "@/lib/contact"' src/lib/share.ts && grep -q "whitespace-normal text-balance" src/components/campaigns/CampaignReferralShareButton.tsx</automated>
  </verify>
  <done>All four related Jest suites pass, eslint is clean, tsc shows no errors outside `.next/`, the three source files contain only the hyphenated brand, share.ts imports BRIEF_EMAIL instead of a literal address, the share button can wrap, and nothing is committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| campaign DB row to mailto href | `slug` comes from the stored campaign and is interpolated into a mailto subject rendered for the authorized creator |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261014hpa-01 | Tampering | CampaignReferralCard joint-post mailto | low | mitigate | Slug passed through `encodeURIComponent` inside the subject (same as `campaignContactHref`), so `&`, `?` or newlines cannot add mailto headers like `body`/`cc`; React escapes the attribute value. Test asserts the encoded subject. |
| T-261014hpa-02 | Information disclosure | buildCampaignStartShare text | low | accept | Text exposes only the public project address BRIEF_EMAIL and the public start URL; no creator data or slug is included in the shared text. |
| T-261014hpa-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this plan; executor must not add dependencies. |
</threat_model>

<verification>
1. `cd web && npx jest src/__tests__/campaignCreatorStats.test.ts src/__tests__/campaignMilestoneEmail.test.ts src/__tests__/shareRecipients.test.ts src/__tests__/campaignManagerLayout.test.ts` passes.
2. `cd web && npm run lint` passes (approved plan verification step). Typecheck: `cd web && npx tsc --noEmit -p . 2>&1 | grep "error TS" | grep -v "^\.next/"` prints nothing. Baseline (checked while planning, 2026-10-14): tsc reports only pre-existing duplicate-identifier errors in iCloud copies such as `.next/types/routes.d 2.ts`; those are unrelated and must not be "fixed" in this task, only filtered.
3. `git status --short` shows exactly the 5 files from `files_modified` as modified (plus the SUMMARY), and `git log -1` is unchanged from the start of execution: no commit was made.
4. Print the rendered card markup once (for example a throwaway `node`/jest snippet run from the scratchpad, not saved in the repo) and confirm button order: "Gemeinsamen Post planen" before "Brief-nach-Berlin weiterempfehlen".
5. Mobile 375px visual check: `/kampagne/verwalten` needs a valid manage token. If no valid local manage link exists, report the 375px check as an OPEN verification gap for Thomas in the SUMMARY (do not report it as passed). The wrap fallback (`whitespace-normal text-balance`) is already applied, so the remaining risk is cosmetic only.
</verification>

<success_criteria>
- Card shows the locked H2, paragraph, donation line and both buttons in the new order, verbatim.
- Primary mailto targets BRIEF_EMAIL with subject `Gemeinsamer Post: <slug>` of the current campaign.
- Shared text and subject match the approved plan exactly and use the BRIEF_EMAIL constant.
- No unhyphenated brand name, no em/en dashes in the changed copy.
- SUPPORT_CONTENT / uiCatalog, the creator email HTML and its test are untouched.
- All changes uncommitted; SUMMARY lists changed files, test/lint/tsc evidence and the mobile check status.
</success_criteria>

<output>
Create `.planning/quick/261014-hpa-kampagnen-karte-gemeinsamer-post-weitere/261014-hpa-SUMMARY.md` when done (do not commit it).
</output>
