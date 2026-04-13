# Phase 2: Core Engine — Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full citizen input → politician lookup → AI letter generation pipeline. A citizen can describe their issue via text or voice, enter their PLZ, and the system generates a formal letter addressed to the correct politician. The letter is delivered by email (though see scope note below on email vs. Phase 3 boundary).

Three distinct workstreams:
1. **App UI** — Multi-step wizard at `/app` (replace Phase 1 placeholder)
2. **Lookup pipeline** — PLZ → Wahlkreis → politician data, validated before AI call
3. **AI generation** — Mistral-powered letter generation with content safety checks

</domain>

<decisions>
## Implementation Decisions

### App UX Flow

- **D-01:** Multi-step wizard at `/app` with 3 steps:
  - **Step 1:** PLZ (required) + Email (required, with tooltip: "Wir senden dir deinen Brief per Mail zu") + Name (optional) + Party membership (optional) + NGO/Gewerkschaft affiliation (optional)
  - **Step 2:** Issue description — text textarea as primary input, voice recording as secondary/alternative. Transcription from voice populates the textarea and is fully editable. Line breaks in the textarea must be preserved in the final letter.
  - **Step 3:** Success page — "Wir erstellen gerade deinen Brief mit den besten Argumenten und prüfen, an wen er am wirksamsten adressiert werden sollte. Wir schicken ihn dir per Mail zu." If PLZ spans multiple Wahlkreise, the success page also shows a politician selection UI (see D-12 below).

- **D-02:** The app entry point is the existing `/app` route created as a placeholder in Phase 1. Phase 2 replaces the placeholder content with the full wizard.

### AI Model

- **D-03:** **Mistral** (EU-hosted) is the primary AI model for letter generation. NOT OpenAI. Reason: DSGVO compliance — Mistral is EU-based, reducing data residency concerns. Thomas explicitly chose this over OpenAI/GPT-4o for the core generation task.
  - Research: Mistral API docs, appropriate model (mistral-large or mistral-small — planner to recommend based on German language quality and cost)
  - Voxtral (Mistral) is used for voice-to-text transcription — same vendor as letter generation, EU-hosted, no OpenAI dependency for STT

- **D-04:** Letter format: ~200–280 words (1 handwritten page), formal German Briefstil (Sie-Form), personal but sachlich — not aggressive, not devot. AI system prompt must:
  - Produce gender-neutral language (no Gendersternchen/Doppelpunkt/Binnen-I)
  - Not impose political bias or activism tone — neutral, citizen-voice
  - Include date, salutation, body, closing, placeholder for sender name
  - Reference the specific local issue described by the user
  - Address the politician by name and title as derived from POLI lookup

### Political Level & Politician Selection

- **D-05:** AI decides the responsible political level silently (Bund/Land/Kommune). No level selection UI shown to the user. The classified level is passed to the AI alongside the politician data.

- **D-06:** Before the AI call, the system pre-filters the politician database using the PLZ lookup result. The filtered politician list (small JSON) is passed to Mistral as context. Mistral uses the issue description + politician list to:
  1. Classify the responsible political level
  2. Select the specific politician from the filtered list
  3. Generate the letter addressed to that politician

- **D-07:** If politician data is missing for a level (e.g., no Landtag data for this PLZ), surface a transparent message on the success page with a link to the official source (Landtag website, etc.). Do NOT silently fall back or fail. Message: "Für dieses Anliegen haben wir leider keine Daten zum Landtag. Hier kannst du selbst prüfen: [Link]"

- **D-08:** Optional affiliation context (Party membership, NGO/Gewerkschaft name from Step 1) is included in the Mistral prompt to strengthen the letter's credibility. These fields are passed as contextual enrichment. Do NOT include if empty.

### PLZ Disambiguation (Multiple Wahlkreise)

- **D-09:** When a PLZ maps to multiple Wahlkreise (and thus multiple politicians), the system does NOT auto-pick. Instead:
  1. After form submission on Step 2, show the success page
  2. The success page shows a politician selection section: "Wir haben mehrere zuständige Abgeordnete gefunden — wer soll deinen Brief erhalten?"
  3. User selects one politician from the list
  4. Selection triggers letter generation (Mistral call)
  5. Letter is generated and sent by email to the user

- **D-10:** If PLZ maps to exactly 1 Wahlkreis, skip disambiguation — proceed directly to letter generation immediately after Step 2 submission. Success page shows pure processing state: "Brief wird erstellt..."

### Voice Input

- **D-11:** Voice recording: click-to-start, click-to-stop interaction. A mic button sits below the textarea on Step 2. On click: starts recording with a red pulsing indicator and elapsed timer. On second click: stops, uploads audio blob to Route Handler → Mistral Voxtral transcription → result populates the textarea.
  - Transcription result is fully editable in the textarea
  - Voice available on all devices (mobile + desktop) — MediaRecorder API is the mechanism
  - **Reuse recording logic from:** `/Users/thomas/Documents/Git Repos/surv.ai/components/receiver/RecordingInterface.tsx` and `/Users/thomas/Documents/Git Repos/surv.ai/lib/audio/recorder.ts`
  - Adapt the AudioRecorder class and recording state management for the brief-nach-berlin context (different UI, no submission — just transcription to textarea)

### Letter Delivery & Email Actions

- **D-12:** The generated letter is delivered **only by email**. It is NOT displayed on the web success page. The success page shows a processing/confirmation state only.

- **D-13:** Email content (to be implemented in Phase 3, but Phase 2 must queue/prepare):
  - The generated letter text
  - The politician's full postal address and title
  - Handwriting + mailing instructions
  - Action buttons in the email:
    - "Neu generieren" — magic link back to app with pre-filled issue text for regeneration
    - "Mit KI verbessern" — copies letter text into clipboard / links to a neutral AI (e.g., Claude.ai) for further editing
    - "Brief nach Berlin teilen" — social share prompt to spread the project

- **D-14:** **Scope conflict to resolve:** The current ROADMAP places email delivery (MAIL-01, MAIL-02, MAIL-03) in Phase 3. But the UX flow Thomas described implies the success page says "Wir schicken dir den Brief per Mail" — which suggests email is part of the Phase 2 user promise. Planner should decide: either (a) Phase 2 generates the letter and stores it temporarily until Phase 3 wires the email, showing "Brief in Bearbeitung" without claiming email delivery, OR (b) merge Phase 2 and 3 if email wiring is simple enough. **Do not silently ignore this conflict.**

### Content Safety

- **D-15:** OpenAI Moderation API for content safety checks (SAFE-01, SAFE-02, SAFE-03):
  - Check user input (issue text) BEFORE letter generation
  - Check generated letter BEFORE delivery/queuing
  - On rejection: show a friendly, clear German error message ("Wir können dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich.") and allow the user to edit and resubmit
  - Soft block only — user can retry with different input

### Data & Privacy

- **D-16:** No persistent storage. User input, PLZ, email, and generated letter are processed in-memory during the request. Email is the only output artifact. After email is queued/sent, no data is retained server-side.

- **D-17:** PLZ and email address are the only personal data collected. Email purpose: delivery of the generated letter only. No marketing, no tracking. (Full DSGVO documentation is Phase 3.)

### Claude's Discretion

- Exact Mistral model variant (mistral-large vs. mistral-small — test for German letter quality)
- Server action structure (one action vs. multiple actions for lookup, generation, safety)
- Exact system prompt wording for letter generation (within the constraints in D-04)
- PLZ validation regex and edge cases (e.g., East German PLZ ranges)
- Exact wizard step transition animation (slide, fade, or none)
- Error state UI details (beyond the copy specified above)
- Audio recording max duration and timeout handling

</decisions>

<specifics>
## Specific Ideas & Details

- The success page "processing" animation could use a typewriter effect on "Brief wird erstellt..." — consistent with the Courier Prime typewriter font theme
- The politician selection UI (disambiguation) should show: name, party, Wahlkreis name — enough to make an informed choice without requiring political knowledge
- The optional "party/NGO" fields on Step 1 should be grouped under a collapsible "Angaben zu deiner Person (optional)" section to keep Step 1 clean
- Email magic links for "Neu generieren" can pre-fill the issue text via URL params or a temporary token
- The Voxtral transcription prompt should instruct to ignore leading/trailing silence — this improves transcription quality
- Gender-neutral language rule from Phase 1 applies to ALL UI copy in Phase 2 (wizard labels, error messages, success page text)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing codebase (brief-nach-berlin)
- `web/src/app/app/page.tsx` — Phase 1 placeholder to be replaced by Phase 2 wizard
- `web/src/app/layout.tsx` — Root layout with font definitions (Courier Prime, Source Sans 3, Caveat)
- `web/src/components/Hero.tsx` — Reference for design patterns (airmail theme, waldgruen/creme palette)
- `web/src/app/datenschutz/page.tsx` — Existing DSGVO page (Phase 3 will expand)
- `data/plz-wahlkreis-mapping.json` — Output from Phase 1 data scripts (PLZ → Wahlkreis IDs)
- `data/politicians-cache.json` — Output from Phase 1 data scripts (Bundestag, Landtag, Kommune data)
- `scripts/parse-plz-mapping.ts` — Phase 1 preprocessing scripts (reference, not modified in Phase 2)

### Voice recording reference (surv.ai)
- `/Users/thomas/Documents/Git Repos/surv.ai/components/receiver/RecordingInterface.tsx` — Voice recording UI (click-to-start/stop, pulsing indicator, elapsed timer) — adapt for brief-nach-berlin
- `/Users/thomas/Documents/Git Repos/surv.ai/lib/audio/recorder.ts` — AudioRecorder class with MediaRecorder API integration and RecorderState machine
- `/Users/thomas/Documents/Git Repos/surv.ai/lib/audio/recording-timer.ts` — Timer utilities for recording elapsed time

### Project documentation
- `CLAUDE.md` — Technology stack, constraints, conventions (note: D-03 above supersedes OpenAI for generation)
- `.planning/PROJECT.md` — Project vision, requirements, constraints
- `.planning/REQUIREMENTS.md` — Detailed requirement specs with REQ-IDs for Phase 2
- `.planning/phases/01-landing-page-data-infrastructure/01-CONTEXT.md` — Prior phase decisions (color palette, font tokens, gender-neutral language rules)

### External APIs
- Mistral API docs: https://docs.mistral.ai/ — EU-hosted AI, model selection, German language capability
- OpenAI Moderation API: https://platform.openai.com/docs/guides/moderation — content safety endpoint
- Mistral Voxtral (audio): https://docs.mistral.ai/ — speech-to-text via multimodal chat completions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (brief-nach-berlin)
- Tailwind custom colors: waldgruen, creme, warmgrau, airmail-rot, airmail-blau
- Font classes: font-typewriter (Courier Prime), font-body (Source Sans 3), font-handwriting (Caveat)
- Phase 1 placeholder at `web/src/app/app/page.tsx` (replace entirely)
- Static data files from Phase 1: `data/plz-wahlkreis-mapping.json`, `data/politicians-cache.json`

### Reusable Assets (surv.ai reference)
- `AudioRecorder` class: handles MediaRecorder lifecycle, chunked recording, blob assembly
- `RecorderState` type: "idle" | "recording" | "processing" | "done" | "error"
- `RecordingResult` type: blob + duration + mimeType
- `WaveAnimation` component: animated waveform during recording (could reuse or simplify)
- `PermissionRecoveryGuide` component: handles mic permission denied gracefully

### Integration Points
- `/app` route: Phase 2 delivers the full wizard here
- Phase 1 data files: Phase 2 reads these at request time (via dynamic import or fs.readFileSync in server actions)
- Server Actions + Route Handlers: PLZ lookup, Mistral letter generation, moderation live in Server Actions; Voxtral transcription uses a Route Handler (file upload requires it per Pitfall 4)
- Email queue: Phase 2 prepares the letter + politician address; Phase 3 wires the actual email sending

</code_context>

<deferred>
## Deferred Ideas

### Phase 3 — Email Delivery & Privacy Compliance
- Full email sending via Resend/SendGrid/similar
- Complete Datenschutzerklaerung update covering Mistral data processing
- Email magic link implementation for "Neu generieren"

### v2+ Ideas
- "Brief verstärken" as a dedicated post-generation step (show draft first, then ask for enrichment context) — currently merged into Step 1 as optional fields
- EU Parliament (Brussels) coverage — teased in Phase 1 landing page
- Multiple language support (currently German only)
- Auto-pen via Pensaki API for physical letter sending
- Bürgerbüro routing (is it better to address the Bürgerbüro than the Abgeordnete directly?)
- Verifying politician response: anonymous tracking of whether the politician responded

</deferred>

---

*Phase: 02-core-engine*
*Context gathered: 2026-04-13*
