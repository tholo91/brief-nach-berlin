# Requirements: Brief nach Berlin

**Defined:** 2026-04-10
**Core Value:** A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.

## v1 Requirements

### Landing Page

- [ ] **LAND-01**: User sees a hero section explaining what Brief nach Berlin does, with Ghibli-style solarpunk Berlin visual
- [ ] **LAND-02**: User sees a "How it works" section with 3 clear steps (describe issue → get letter → mail it)
- [ ] **LAND-03**: User sees a social proof section with a letter counter ("X Briefe generiert")
- [ ] **LAND-04**: User can navigate to the letter generator via a clear CTA
- [ ] **LAND-05**: Landing page is mobile-responsive
- [ ] **LAND-06**: Datenschutz and Impressum pages exist and are linked

### Input & Issue Capture

- [ ] **INPT-01**: User can describe their frustration/issue via free text input
- [ ] **INPT-02**: User can describe their frustration via voice input (OpenAI Whisper API)
- [ ] **INPT-03**: User enters their German PLZ (validated format: 5 digits, valid range)
- [ ] **INPT-04**: User enters their email address to receive the generated letter

### Politician Lookup

- [ ] **POLI-01**: System maps PLZ to Bundestagswahlkreis using preprocessed Bundeswahlleiter data
- [ ] **POLI-02**: System resolves Wahlkreis to the direct MdB via Abgeordnetenwatch API (cached locally)
- [ ] **POLI-03**: System retrieves politician name and contact/postal address
- [ ] **POLI-04**: When a PLZ spans multiple Wahlkreise, user is asked to disambiguate
- [ ] **POLI-05**: AI classifies which political level (Bund/Land/Kommune) is primarily responsible for the user's issue

### Letter Generation

- [ ] **LETR-01**: AI generates a formal, personal letter in German Briefstil (~200-280 words, 1 handwritten page)
- [ ] **LETR-02**: Letter includes date, salutation, body text, closing, and placeholder for sender name
- [ ] **LETR-03**: Letter tone is personal but sachlich — not aggressive, not devot, auf Augenhoehe
- [ ] **LETR-04**: Letter references the specific local issue described by the user
- [ ] **LETR-05**: Letter is addressed to the identified politician by name and title

### Content Safety

- [ ] **SAFE-01**: User input is checked via OpenAI Moderation API before letter generation
- [ ] **SAFE-02**: Generated letter output is checked via OpenAI Moderation API before delivery
- [ ] **SAFE-03**: System rejects input that is hateful, threatening, or abusive with a clear user-facing message

### Email Delivery

- [ ] **MAIL-01**: Generated letter is sent to the user's email with politician address and mailing instructions
- [ ] **MAIL-02**: Email includes clear instructions on how to handwrite and mail the letter
- [ ] **MAIL-03**: Email is DSGVO-compliant (minimal data, clear purpose, no marketing)

### Data & Privacy

- [ ] **PRIV-01**: No persistent storage of user frustration text or generated letters beyond email delivery
- [ ] **PRIV-02**: PLZ-to-Wahlkreis mapping data is preprocessed and stored as static JSON (no external API call at runtime for this)
- [ ] **PRIV-03**: Abgeordnetenwatch data is cached locally, refreshed periodically (not called per-request)
- [ ] **PRIV-04**: Datenschutzerklaerung covers: PLZ processing, email usage, OpenAI API data processing

## v2 Requirements

### Enhanced Input

- **INPT-10**: User can upload a photo of a local problem (pothole, broken infrastructure) with AI vision analysis

### Multi-Level Coverage

- **POLI-10**: Landtag (MdL) lookup per Bundesland (pending Abgeordnetenwatch coverage audit)
- **POLI-11**: Kommune/Buergermeister lookup (fragmented data, requires curation)
- **POLI-12**: EU Parliament (MdEP) lookup via EU Parliament API

### Enhanced Delivery

- **MAIL-10**: Edit link in email to reopen and modify the letter
- **MAIL-11**: PDF attachment with formatted letter
- **MAIL-12**: Auto-pen physical mail via Pensaki API

### Engagement

- **ENGM-01**: Letter counter on landing page backed by real data
- **ENGM-02**: Anonymous response tracking (did the politician respond?)
- **ENGM-03**: NGO campaign mode (pre-filled issues for advocacy campaigns)

### Sustainability

- **SUST-01**: Donation prompt after letter generation ("This was free — help us keep it that way")
- **SUST-02**: Prototype Fund application

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login | Zero friction > feature completeness; email-based flow sufficient |
| Real-time Abgeordnetenwatch API calls | No SLA, no rate limit docs; cache locally instead |
| Web Speech API for voice | Sends audio to Google/Apple servers — DSGVO violation; use Whisper |
| Multiple languages | German only for v1 — target audience is German citizens |
| Payment / Stripe integration | v1 is completely free; validate demand first |
| Mobile app | Web-first, responsive design sufficient |
| Real-time chat with politicians | Different product category entirely |
| Petition / collective letter mode | Changes product from personal letter to mass action — anti-feature |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 1 | Pending |
| LAND-02 | Phase 1 | Pending |
| LAND-03 | Phase 1 | Pending |
| LAND-04 | Phase 1 | Pending |
| LAND-05 | Phase 1 | Pending |
| LAND-06 | Phase 1 | Pending |
| PRIV-02 | Phase 1 | Pending |
| PRIV-03 | Phase 1 | Pending |
| INPT-01 | Phase 2 | Pending |
| INPT-02 | Phase 2 | Pending |
| INPT-03 | Phase 2 | Pending |
| INPT-04 | Phase 2 | Pending |
| POLI-01 | Phase 2 | Pending |
| POLI-02 | Phase 2 | Pending |
| POLI-03 | Phase 2 | Pending |
| POLI-04 | Phase 2 | Pending |
| POLI-05 | Phase 2 | Pending |
| SAFE-01 | Phase 2 | Pending |
| SAFE-02 | Phase 2 | Pending |
| SAFE-03 | Phase 2 | Pending |
| LETR-01 | Phase 2 | Pending |
| LETR-02 | Phase 2 | Pending |
| LETR-03 | Phase 2 | Pending |
| LETR-04 | Phase 2 | Pending |
| LETR-05 | Phase 2 | Pending |
| MAIL-01 | Phase 3 | Pending |
| MAIL-02 | Phase 3 | Pending |
| MAIL-03 | Phase 3 | Pending |
| PRIV-01 | Phase 3 | Pending |
| PRIV-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-10 — traceability populated during roadmap creation*
