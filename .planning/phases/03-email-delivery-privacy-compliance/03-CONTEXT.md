# Phase 3: Email Delivery & Privacy Compliance — Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the email delivery that Phase 2 prepared, and update the Datenschutzerklaerung to accurately reflect all data processing for public launch.

Phase 2 already generates the letter and holds politician data in the server action. Phase 3 closes the loop: sending the email, then documenting all data flows in the Datenschutzerklaerung.

Two workstreams:
1. **Email delivery** — Brevo integration, email template, action buttons, wiring into Phase 2 server actions
2. **Privacy compliance** — Update `datenschutz/page.tsx` to accurately cover all processing activities introduced by Phase 1–3

</domain>

<decisions>
## Implementation Decisions

### Email provider
- **D-01:** **Brevo** (EU-native, formerly Sendinblue). Chosen over Resend explicitly for DSGVO reasons — French company, EU data residency, strong GDPR compliance documentation. 300 emails/day free tier (sufficient for v1 validation phase).
- **D-02:** Use Brevo **API** (not SMTP), for cleaner Next.js server action integration. Planner to confirm correct npm package (`@getbrevo/brevo` or `sib-api-v3-sdk` — verify current package name).

### Phase 2→3 wiring
- **D-03:** Email sending is **inline and server-side**, fire-and-forget. When the Mistral letter generation completes, the server action immediately calls Brevo to send the email, then returns `{ success: true }` to the client. **The letter text is never sent back to the browser.**
- **D-04:** This wiring applies to BOTH code paths that generate letters:
  1. Main wizard server action (single Wahlkreis flow — immediate generation after Step 2)
  2. `selectPoliticianAction.ts` (disambiguation flow — triggered when user picks a politician on Step 3)
- **D-05:** The `letterText` state in `Step3Success.tsx` (marked "for Phase 3 email pickup") and its associated forward-contract comment **should be removed** — the no-persistence guarantee is now enforced server-side.

### Email template
- **D-06:** HTML email, **branded but lean**. Airmail red/blue stripe header (CSS-only, no heavy images). Waldgruen accent color for headings/buttons. Courier Prime (monospace/typewriter) for the letter body block. Simple, readable layout — no over-engineering.
- **D-07:** Subject line: **"Dein Brief nach Berlin ist fertig"**
- **D-08:** Email sections in order:
  1. **Brief block** — generated letter in a visually distinct typewriter-style block (monospace, slight border or background)
  2. **Postadresse** — politician's full postal address + title, formatted for envelope copying
  3. **Nächste Schritte** — clear, well-formatted next-steps section:
     - **Empfehlung: von Hand abschreiben** (prominent, not buried). Include the reasons inline: handwritten letters are far more likely to be read and discussed; they signal genuine personal investment; printed letters look like mass mail and are treated like it; the handwriting makes it unmistakably personal. Then offer the fallback: "Du kannst den Brief auch ausdrucken — das ist besser als gar nichts."
     - Step-by-step instructions: (1) Brief abschreiben / ausdrucken, (2) Adresse auf Kuvert schreiben (Adresse oben), (3) Rücksendeadresse oben links, (4) Freimachen (Briefmarke), (5) Absenden
  4. **Disclaimer** — repeat the disclaimer from the website (same content as D-15 in Phase 1 CONTEXT.md): brief note that data accuracy is not guaranteed, AI can make mistakes, users should verify before sending, links to official sources. Plus a link back to the full Datenschutzerklaerung on the website.
  5. **Action buttons** — see D-09 below
- **D-09:** Footer with 3 action buttons:
  - **"Neu generieren"** → `https://brief-nach-berlin.de/app?text=[URL-encoded issue text]`. The issue text from `wizardData.issueText` is URL-encoded and appended as a query param. The `/app` route reads this on load and pre-fills the textarea.
  - **"Mit KI verbessern"** → planner's discretion (options: copy letter text to clipboard via a mailto: link trick, or a short-lived web page that auto-copies; avoid client-side JS in email)
  - **"Brief nach Berlin teilen"** → planner's discretion (options: pre-composed Twitter/WhatsApp share URL, or a simple landing page share link)

### Datenschutzerklaerung (PRIV-04)
- **D-10:** The existing Datenschutz page (`web/src/app/datenschutz/page.tsx`) currently states "Diese Website erhebt und verarbeitet derzeit keine personenbezogenen Daten" — this is **no longer accurate** once Phase 2+3 is live and MUST be updated.
- **D-11:** The updated Datenschutzerklaerung must cover these processing activities:
  - **PLZ**: entered by user, used for Wahlkreis lookup, not stored
  - **E-Mail-Adresse**: entered by user, used solely to deliver the generated letter, not stored server-side after send
  - **Anliegen (Freitext)**: entered by user, sent to Mistral API for letter generation, not stored
  - **Sprachaufnahme (optional)**: sent to Mistral Voxtral API for transcription, not stored
  - **Mistral API**: EU-hosted, French company; processes issue text and produces the letter
  - **OpenAI Moderation API**: US-hosted; issue text and generated letter sent for safety checks before delivery
  - **Brevo**: EU-hosted email delivery provider; receives email address + letter content to dispatch the email
  - **Vercel**: hosting infrastructure (EU region to the extent possible)
- **D-12:** Planner writes the Datenschutz copy (no user-facing German legalese needs sign-off from Thomas — follow DSGVO standard phrasing, keep it readable, not lawyer-speak). Thomas's only constraint: honest and complete, no marketing language.

### Claude's Discretion
- Exact Brevo npm package and client initialization pattern
- Sending email address (`brief@brief-nach-berlin.de` or similar — requires domain DNS verification in Brevo dashboard)
- "Mit KI verbessern" exact mechanism (see D-09 note)
- "Brief nach Berlin teilen" exact share URL format
- Exact Datenschutzerklaerung text (within the processing activities in D-11)
- Exact handwriting instruction copy
- Error handling if Brevo send fails (log + return success anyway, or surface error to user — planner to decide)
- Pre-fill behavior on `/app?text=...` — how long the param is accepted, URL length limits

</decisions>

<specifics>
## Specific Ideas

- The email should feel like receiving actual correspondence — the letter block in typewriter style (Courier Prime) reinforces that this is a real letter, not a notification email
- Keep the email focused on the letter itself; action buttons are secondary (not the hero of the email)
- DSGVO text: be honest about OpenAI Moderation being US-hosted — don't hide it; explain it briefly ("zur Sicherheitsprüfung")

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 handoff (read first)
- `.planning/phases/02-core-engine/02-CONTEXT.md` — D-12 through D-14 define the letter delivery contract and the open scope conflict that Phase 3 resolves
- `web/src/components/wizard/Step3Success.tsx` — Contains the `letterText` forward-contract state that Phase 3 wiring should remove (see D-05)
- `web/src/lib/actions/selectPolitician.ts` — Disambiguation server action; Phase 3 must wire email sending here too

### Email integration
- `web/package.json` — Current dependencies; no email package installed yet
- `web/src/app/app/page.tsx` — Wizard entry point; Phase 3 must add `?text=` param reading for "Neu generieren" magic link

### Privacy compliance
- `web/src/app/datenschutz/page.tsx` — Existing Datenschutz page (currently says no data collected — must be replaced)
- `.planning/REQUIREMENTS.md` §PRIV-01, PRIV-04 — Privacy requirements for this phase
- `.planning/phases/01-landing-page-data-infrastructure/01-CONTEXT.md` — D-15, D-16: disclaimer principles and Datenschutz scope established in Phase 1

### Project documentation
- `CLAUDE.md` — Technology stack, constraints, DSGVO constraints
- `.planning/PROJECT.md` — Project vision and constraints
- `.planning/REQUIREMENTS.md` — Full MAIL-01, MAIL-02, MAIL-03, PRIV-01, PRIV-04 requirement specs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Wizard `wizardData` object (available in server actions): contains `email`, `plzInput`, `issueText`, `name`, `party`, `ngo` — all needed for email composition
- `Step3Success.tsx`: renders success/disambiguation UI; `letterText` state (forward contract) to be removed in Phase 3
- `web/src/app/datenschutz/page.tsx`: full page structure to be rewritten with accurate processing documentation

### Established Patterns
- Tailwind custom colors: `waldgruen`, `creme`, `warmgrau`, `airmail-rot`, `airmail-blau` — use these in email CSS too (inline styles required for email)
- Font: Courier Prime for letter-style typewriter text (must use web-safe fallback `monospace` in email HTML since Google Fonts won't load in email clients)
- Gender-neutral language rule from Phase 1 applies to all new copy (no Gendersternchen/Doppelpunkt/Binnen-I)
- Airmail stripe motif (red/blue diagonal) can be referenced in email header as a CSS border trick or simple colored header band

### Integration Points
- Both `generateLetter` server action AND `selectPoliticianAction` must call Brevo after letter generation (fire-and-forget, before returning response)
- `/app` route needs to read `?text=` query param on load and pre-fill `issueText` textarea (for "Neu generieren" magic link)
- Datenschutz page: full rewrite of `web/src/app/datenschutz/page.tsx` content (keep page structure and styling)

</code_context>

<deferred>
## Deferred Ideas

### v2+
- PDF attachment with formatted letter (MAIL-11 — v2 requirement)
- Edit link in email to reopen and modify (MAIL-10 — v2 requirement)
- Email magic links via temporary tokens (more secure than URL params for longer issue texts — consider if URL param approach hits length limits)

### Not in scope
- Analytics or open-rate tracking — explicitly excluded (no analytics in v1 per privacy constraint)
- Email marketing / follow-up sequences — explicitly excluded (no marketing, MAIL-03)

</deferred>

---

*Phase: 03-email-delivery-privacy-compliance*
*Context gathered: 2026-04-14*
