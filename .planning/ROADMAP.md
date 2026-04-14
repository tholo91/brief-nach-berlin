# Roadmap: Brief nach Berlin

## Overview

Three phases deliver a complete citizen-to-politician letter pipeline. Phase 1 ships the landing page and preprocesses the data that makes PLZ lookup possible. Phase 2 builds the core engine: input capture, politician lookup, safety checks, and AI letter generation — the product actually works at the end of this phase. Phase 3 wires in email delivery and closes all DSGVO/privacy obligations, making the product publicly safe to promote.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Landing Page & Data Infrastructure** - Ship the landing page and preprocess PLZ/politician data so the core engine has what it needs
- [ ] **Phase 2: Core Engine** - Build the full input → lookup → safety → letter generation pipeline
- [ ] **Phase 3: Email Delivery & Privacy Compliance** - Wire in email delivery and satisfy all DSGVO obligations

## Phase Details

### Phase 1: Landing Page & Data Infrastructure
**Goal**: Citizens can discover and understand Brief nach Berlin, and all static data required for PLZ-to-politician lookup is preprocessed and ready
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, PRIV-02, PRIV-03
**Success Criteria** (what must be TRUE):
  1. A visitor landing on the site immediately understands what Brief nach Berlin does and how it works
  2. The landing page works correctly on mobile and desktop
  3. Datenschutz and Impressum pages are accessible and linked from every page
  4. A script can preprocess Bundeswahlleiter shapefiles and output a static PLZ-to-Wahlkreis JSON file
  5. Abgeordnetenwatch politician data is fetched, structured, and stored as a local cache that can be refreshed without touching the app
**Plans**: TBD
**UI hint**: yes

### Phase 2: Core Engine
**Goal**: A citizen can describe their issue, enter their PLZ, and receive a properly addressed, AI-generated letter ready to be handwritten and mailed
**Depends on**: Phase 1
**Requirements**: INPT-01, INPT-02, INPT-03, INPT-04, POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, SAFE-01, SAFE-02, SAFE-03, LETR-01, LETR-02, LETR-03, LETR-04, LETR-05
**Success Criteria** (what must be TRUE):
  1. User can describe their issue via free text or voice (Whisper), enter a valid German PLZ, and submit
  2. The system identifies the correct MdB and postal address for the entered PLZ (including disambiguation when a PLZ spans multiple Wahlkreise)
  3. Hateful, threatening, or abusive input is rejected with a clear German error message before any letter is generated
  4. A generated letter is displayed: properly addressed to the politician by name and title, ~200-280 words, formal German Briefstil, referencing the specific local issue
  5. The letter output passes moderation before being shown to the user
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Foundation: types, Zod schemas, PLZ lookup, moderation wrapper
- [x] 02-02-PLAN.md — Voice recording subsystem: AudioRecorder, VoiceRecorder, /api/transcribe
- [x] 02-03-PLAN.md — AI pipeline: Mistral letter generation, server actions
- [ ] 02-04-PLAN.md — Wizard UI: WizardShell, Step1-3 components, full integration

**UI hint**: yes

### Phase 3: Email Delivery & Privacy Compliance
**Goal**: The generated letter is delivered to the user's inbox with mailing instructions, and the product is fully DSGVO-compliant and safe for public launch
**Depends on**: Phase 2
**Requirements**: MAIL-01, MAIL-02, MAIL-03, PRIV-01, PRIV-04
**Success Criteria** (what must be TRUE):
  1. User receives the generated letter by email, including the politician's full postal address and clear instructions for handwriting and mailing
  2. No user frustration text or generated letter is stored after the email is sent
  3. The Datenschutzerklaerung accurately covers PLZ processing, email usage, and OpenAI API data handling
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Brevo email module and HTML email template
- [x] 03-02-PLAN.md — Wire email into server actions, remove letter from client, add ?text= pre-fill
- [x] 03-03-PLAN.md — Rewrite Datenschutzerklaerung with full DSGVO Art. 13 disclosures

## Backlog

### Phase 999.1: surv.ai User-Feedback Integration (BACKLOG)

**Goal:** Embed a surv.ai feedback link after the letter generation flow to collect real user feedback ("Hat der Brief geholfen?"). Enables validation without building custom analytics.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.2: surv.ai Persönlicher Kontext-Abfrage (BACKLOG)

**Goal:** Use surv.ai to collect personal context (profession, affiliations, how personally affected) instead of a simple in-app form. Richer data = stronger letters, and surv.ai handles the conversational UX.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.3: Research — Wirksamkeit persönlicher Infos auf Abgeordnete (BACKLOG)

**Goal:** Research and quantify how much personal details (profession, union/association membership, direct personal impact) influence whether a letter gets read, forwarded, or acted on by an Abgeordnete. Informs how aggressively to push context collection in the UX.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Page & Data Infrastructure | 0/TBD | Not started | - |
| 2. Core Engine | 0/4 | Planned | - |
| 3. Email Delivery & Privacy Compliance | 0/3 | Planned | - |
