# PROJECT_CONTEXT.md — Brief nach Berlin

> Generated 2026-04-28 from full codebase analysis. Intended for AI collaboration: audits, feature planning, prompt engineering.

---

## 📌 Project Overview

**Brief nach Berlin** is a German civic-tech web app that converts citizens' everyday frustrations into formal, personalized letters addressed to their elected representatives — at Bundestag, Landtag, or municipal level.

**Problem:** Most political participation channels (email, petitions) are ignored. Handwritten letters, however, are actually read and discussed in the Bundestag. But most citizens lack the political knowledge, time, or writing confidence to compose one.

**Core insight:** A frustrated citizen should be able to go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.

**Vision:** Make political self-efficacy frictionless. Turn passive frustration into concrete civic action at scale.

---

## 🎯 Goals & Roadmap

### Short-Term (v1 — launched)
- PLZ-based identification of responsible representatives (Bundestag focus)
- AI-generated formal German letter from user's free-text or voice input
- Email delivery of the finished letter to the user
- DSGVO-compliant: no accounts, no persistent data storage
- Zero/minimal cost: free tiers only (Vercel Hobby, Mistral pay-per-use)

### Long-Term (v2+)
- **Auto-Pen integration:** Physical signing + mailing service so the user doesn't even have to visit a post office
- **Campaign mode:** One issue → letters to multiple politicians simultaneously
- **Full Landtag + Kommunal coverage:** Currently only Bundestag data is comprehensive
- **Tracking + confirmation:** Letter receipt confirmation from representative's office
- **Analytics (DSGVO-compliant):** Anonymized counters, topic heatmaps, regional engagement maps
- **User accounts (optional):** Letter history, follow-up reminders, impact tracking

---

## 🧑‍💼 Ideal Customer Profile (ICP)

### Primary Persona: "Der Frustrierte Bürger"
- Age 25–55, politically aware but not active
- Frustrated by a specific local or national issue (traffic, healthcare wait times, housing costs, school conditions)
- Has thought "someone should do something" but never acted politically
- Low confidence in formal writing; unsure who to contact
- Values anonymity; doesn't want to create an account

### Secondary Persona: "Der Engagierte"
- Member of an NGO, union, or civic group
- Wants to help constituents send letters en masse on shared topics
- Would benefit from campaign/template features (v2)

### Why they choose this over alternatives
- Email to politicians: ignored
- Petitions: symbolic, rarely legislative
- Calling the office: intimidating, requires preparation
- Writing yourself: "I don't know where to start"
- Brief nach Berlin: guided, fast, delivers a real artifact (a letter), to the right person, in the right format

---

## ⚙️ Core Functionality

### Main Workflow (4-step Wizard)

**Step 1 — Contact Details**
- User enters PLZ (5-digit postal code) + email
- PLZ is mapped to Wahlkreis ID(s) via a static lookup table
- Email used only to deliver the finished letter; not stored afterward

**Step 1b — Optional Enrichment (skippable)**
- Name, party affiliation, NGO/union membership (adds credibility signals to letter)
- Letter length: 1, 1.5, or 2 pages (maps to word count bands)
- Tone slider: 5 levels from "freundlich" (friendly) to "konfrontativ-aber-respektvoll"

**Step 2 — Issue Description**
- Voice recording (MediaRecorder → Mistral Voxtral transcription) OR direct text input
- Minimum 50 characters; maximum 5,000 characters
- Rotating placeholder examples show real-world use cases
- Collapsible tips panel for writing guidance
- Character counter with color feedback

**Step 3a — Disambiguation (if PLZ spans multiple Wahlkreise)**
- Card grid of all eligible politicians (sorted: Direktmandate first)
- Keyboard navigable; pre-selects Direktmandat holder
- Shows party, Wahlkreis, links to Abgeordnetenwatch profile

**Step 3b — Generation + Success**
- Pre-check runs server-side (re-validates, re-derives politicians, verifies no tampering)
- Letter generated asynchronously via `/api/generate-letter`
- Animated progress indicator ("Brief wird formuliert...")
- On success: 3-step mailing instructions, share buttons (email + native/clipboard)
- "Keine E-Mail erhalten?" resend form (up to 3 resends per email per 24h)

---

## 🏗️ Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router, Server Actions) |
| Language | TypeScript 5.x (strict mode) |
| UI | React 19.2.4 + Tailwind CSS v4 + shadcn/ui |
| Forms | react-hook-form + Zod (client + server validation) |
| AI — Letter Generation | Mistral (`mistral-medium-latest`, temp 0.4) |
| AI — Moderation | Mistral (`mistral-moderation-latest`) |
| AI — Voice Transcription | Mistral Voxtral (`voxtral-mini-transcribe-2507`) |
| Email | Brevo (transactional, tracking disabled) |
| Hosting | Vercel Hobby (free tier) |
| Rate Limiting | In-memory (MVP); planned migration to Vercel KV |

### Architecture Overview

```
Browser (React)
  └── WizardShell (client state machine)
        ├── Step1Form → submitWizardAction (Server Action)
        │     ├── Zod validate
        │     ├── Rate limit check (IP + email)
        │     ├── Input moderation (Mistral)
        │     └── PLZ lookup → return politicians or disambiguationNeeded
        ├── Step2Issue → VoiceRecorder → POST /api/transcribe
        │     └── Mistral Voxtral → transcript text
        └── Step3 → selectPoliticianAction (Server Action)
              ├── Re-validate + re-moderate + re-derive politicians
              ├── Verify selectedPoliticianId (anti-tampering)
              └── Return preCheckOk → client fires POST /api/generate-letter
                    ├── Re-validate + rate limit + moderation
                    ├── Generate letter (Mistral Medium)
                    ├── Moderate output
                    ├── Send email (Brevo, fire-and-forget)
                    └── Return { letterText, politician }
```

### Data Flow

1. **Build time:** `scripts/parse-plz-mapping.ts` → `/data/plz-wahlkreis-mapping.json`; `scripts/fetch-politician-data.ts` → `/data/politicians-cache.json`
2. **Request time:** PLZ → Wahlkreis IDs (in-memory JSON lookup) → Politician records (in-memory filter)
3. **Stateless:** No DB reads/writes during user sessions. All data lives in the request lifecycle and browser session.

---

## 📂 Codebase Structure

```
brief-nach-berlin/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (marketing funnel)
│   │   ├── layout.tsx                  # Root layout (fonts, html lang)
│   │   ├── app/
│   │   │   ├── layout.tsx              # App wrapper (creme bg, AppHeader/Footer)
│   │   │   └── page.tsx                # Renders WizardShell with Suspense
│   │   ├── api/
│   │   │   ├── generate-letter/route.ts # POST: Mistral letter generation + email
│   │   │   └── transcribe/route.ts      # POST: Mistral Voxtral audio transcription
│   │   ├── datenschutz/page.tsx        # Privacy policy (DSGVO)
│   │   ├── impressum/page.tsx          # Legal imprint
│   │   ├── warum-ein-brief/page.tsx    # Value prop deep-dive
│   │   └── treppe-der-selbstwirksamkeit/page.tsx # Empowerment framing
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx         # State machine (250 lines)
│   │   │   ├── Step1Form.tsx           # PLZ + email form
│   │   │   ├── Step1bOptional.tsx      # Enrichment + length + tone
│   │   │   ├── Step2Issue.tsx          # Text/voice input (core UX)
│   │   │   └── Step3Success.tsx        # Generation + disambiguation + success
│   │   ├── audio/
│   │   │   ├── VoiceRecorder.tsx       # State-driven recorder UI
│   │   │   └── AudioRecorder.ts        # MediaRecorder wrapper
│   │   └── landing/                    # Hero, HowItWorks, WhyItWorks, etc.
│   └── lib/
│       ├── actions/
│       │   ├── submitWizard.ts         # Server Action: step 1+2 processing
│       │   ├── selectPolitician.ts     # Server Action: pre-check + anti-tampering
│       │   └── resendLetter.ts         # Server Action: resend email
│       ├── generation/
│       │   └── generateLetter.ts       # Mistral orchestration + prompt (400 lines)
│       ├── lookup/
│       │   └── plzLookup.ts            # PLZ → Wahlkreis → Politicians
│       ├── moderation/
│       │   └── moderateText.ts         # Mistral moderation wrapper
│       ├── email/
│       │   ├── sendLetterEmail.ts      # Brevo client
│       │   ├── buildEmailHtml.ts       # HTML email template
│       │   └── buildDebugPayload.ts    # Monitoring payload injected into email
│       ├── validation/
│       │   └── wizardSchemas.ts        # Zod schemas for all 3 form steps
│       ├── rateLimit.ts                # In-memory bucket rate limiter
│       └── mistral.ts                  # Mistral client singleton
├── data/
│   ├── plz-wahlkreis-mapping.json      # 200k+ PLZ entries → Wahlkreis IDs
│   └── politicians-cache.json          # ~500 politician records (Bund/Land/Kommune)
├── scripts/
│   ├── parse-plz-mapping.ts            # Builds plz-wahlkreis-mapping.json
│   └── fetch-politician-data.ts        # Builds politicians-cache.json
├── public/                             # Static assets (images, fonts, OG images)
├── next.config.ts                      # Security headers, build config
├── package.json                        # 21 dependencies (prod + dev)
└── jest.config.js                      # Unit tests (plzLookup tested)
```

---

## 🧠 Important Logic & Mechanisms

### Letter Generation System (`src/lib/generation/generateLetter.ts`)

The 170+ line system prompt is the core IP of the product. Key mechanics:

**Voice Preservation (non-negotiable rules):**
- Uses ONLY facts from the user's transcript — no invented details
- Preserves political arguments even if sharp or uncomfortable
- No sanitization of user's perspective

**Forbidden Elements:**
- AI-tell words: "ressortübergreifend", "ganzheitlich", "navigieren", "foster", "garner"
- Lists, bullet points, numbered structures
- Em-dashes, gender symbols (`*`, `:`)
- "Trotz X, aber optimistisch" false-hope closings
- Triple adjective stacks ("schnell, sicher und nachhaltig")

**Tone Registers (5 levels):**
- Level 1 (freundlich): Warm, polite — explicit "no self-apology" rule
- Level 2 (höflich-konstruktiv): Clear, constructive, no drama
- Level 3 (sachlich-engagiert): Civic peer-to-peer, default register
- Level 4 (scharf-pointiert): Direct, personal impact allowed
- Level 5 (konfrontativ): Blunt, impatient — political criticism allowed but no insults

**Party-Aware Framing:**
Argument framing adapts to politician's party (SPD → worker rights; CDU → reliability; Grüne → generational justice; AfD → strict sachlich with no ideology mirroring).

**Length Correction Loop:**
- Target: midpoint of word band (±15% tolerance)
- If first attempt out of range: one automatic retry with corrective directive
- Retry accepted only if closer to target than first attempt

**JSON Response Schema:**
```json
{
  "political_level": "Bund | Land | Kommune",
  "selected_politician_id": 123,
  "voice_check": "self-reflection field",
  "letter": "Sehr geehrte/r..."
}
```

### PLZ Lookup (`src/lib/lookup/plzLookup.ts`)

1. Query `plzMapping[plz]` → array of Wahlkreis IDs (can be multiple if PLZ spans districts)
2. Filter `politicians-cache.json` by matching `wahlkreisId`
3. Sort: Direktmandate first, then list candidates
4. Return all matches (disambiguation UI if >1 politician)

### Anti-Tampering Architecture

`selectPoliticianAction` never trusts the client's politician object. It:
1. Re-derives politicians from PLZ (server-authoritative)
2. Verifies `selectedPoliticianId` exists in derived list
3. Returns error on any mismatch — no silent fallback

### Rate Limiting (`src/lib/rateLimit.ts`)

In-memory bucket store with 5-minute pruning intervals:

| Bucket | Limit | Window |
|--------|-------|--------|
| LETTERS_PER_EMAIL | 3 | 24 hours |
| LETTERS_PER_IP | 10 | 1 hour |
| TRANSCRIBE_PER_IP | 30 | 1 hour |
| RESEND_PER_IP | 3 | 1 hour |
| RESEND_PER_EMAIL | 2 | 1 hour |

**Known MVP limitation:** In-memory rate limits don't share state across Vercel serverless instances. Production fix: migrate to Vercel KV.

---

## 🔌 Integrations & External Services

| Service | Purpose | Env Var |
|---------|---------|---------|
| Mistral AI | Letter generation (`mistral-medium-latest`), Moderation (`mistral-moderation-latest`), Transcription (`voxtral-mini-transcribe-2507`) | `MISTRAL_API_KEY` |
| Brevo | Transactional email delivery (tracking disabled for DSGVO) | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` |
| Abgeordnetenwatch API v2 (CC0) | Politician data — fetched at build time, cached in JSON | Build-time only |
| Bundeswahlleiter (CSV) | PLZ→Wahlkreis mapping — parsed at build time | Build-time only |
| Vercel | Hosting (Hobby free tier, 150k invocations/month, 10s limit) | Deploy config |
| Heyspeak | User feedback form (linked from success page) | `FOUNDER_FEEDBACK_URL` |

**No external calls at request time** (except Mistral + Brevo). Politician and PLZ data are static JSON loaded into memory at module initialization.

---

## 🚧 Current Limitations / Tech Debt

1. **Rate limiting is per-instance:** In-memory state is not shared across Vercel cold starts. Under load, limits could be effectively bypassed. Fix: Vercel KV or Upstash Redis.

2. **No analytics:** Zero visibility into how many letters are sent, which topics are most common, which PLZs are most active. By DSGVO design, but limits product iteration.

3. **Static politician data decays:** Politicians change committees, retire, or switch districts. Manual rebuild (`npm run build:data`) required to stay current. Frequency: Abgeordnetenwatch updates quarterly.

4. **Landtag/Kommune coverage is incomplete:** Wahlkreis → Landtag/Kommune mapping requires per-state data. Currently best-effort; user may see no local politician for some PLZs.

5. **No letter preview before email send:** User cannot see the letter before it's emailed. If generation fails after pre-check, the error is shown but there's no retry-with-preview flow.

6. **Single Mistral dependency:** If Mistral degrades or rate-limits, the entire generation flow breaks. No OpenAI fallback configured (was the original stack choice).

7. **`LetterCounter` is fake:** The landing page counter increments client-side from a hardcoded base value with localStorage. It does not reflect real send counts.

8. **Test coverage is thin:** Only `plzLookup.test.ts` exists. No component tests, no integration tests, no E2E tests (Playwright configured but unused).

9. **No email verification:** User can enter any email — no confirmation step. The letter goes to whatever address is typed.

---

## 💡 Opportunities for Improvement

### High Value / Low Effort
- **Real letter counter:** Persist send count to Vercel KV and expose as a public endpoint. Replaces the fake client-side counter with a social proof signal that actually grows.
- **Vercel KV rate limiting:** Drop-in replacement for the in-memory store. Makes rate limits reliable across instances.
- **Email retry on failure:** If Brevo send fails (fire-and-forget currently), user has no recourse beyond the resend form. A simple retry queue would help.

### High Value / Medium Effort
- **Letter preview before send:** Show the generated letter text in the UI before emailing. Lets users see and optionally regenerate. Requires streaming the letter to the client.
- **Topic tagging:** Classify each submitted issue into a topic category (housing, transport, healthcare, etc.) and store anonymized counts in KV. Enables a public "what are citizens writing about" dashboard.
- **Refresh politician data automatically:** A Vercel Cron job (`vercel.json` crons) to rebuild `politicians-cache.json` weekly would eliminate manual rebuild dependency.

### Strategic
- **Shareable letter templates:** Pre-filled issue descriptions for common civic issues (Bahnstreik, Wohnungsnot, etc.) that users can adopt. Drives viral/community sharing.
- **"Meine Abgeordneten" overview:** A mini-profile page per politician showing how many letters they've received via Brief nach Berlin (requires persistent counting).
- **Auto-Pen partnership (v2):** Biggest UX unlock. Removes the handwriting step entirely. High conversion impact.

---

## 🧪 How to Work With This Codebase

### Setup
```bash
# Install dependencies
npm install

# Build static data (required before first run)
npm run build:data

# Start dev server (Turbopack)
npm run dev
```

### Environment Variables (`.env.local`)
```
MISTRAL_API_KEY=sk-...
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=brief@brief-nach-berlin.de
APP_URL=http://localhost:3000
```

### Rebuild Politician/PLZ Data
```bash
npm run build:data        # Both
npm run build:plz         # PLZ mapping only
npm run fetch:politicians # Politicians only
```

### Testing
```bash
npm run test              # Jest (unit tests)
npm run test:watch        # Watch mode
```
Current coverage: PLZ lookup logic only. No component or E2E tests.

### Deployment
Vercel auto-deploys from `main` branch. Politician data is bundled at build time — trigger a rebuild in Vercel dashboard when data needs refreshing.

---

## 🧭 Strategic Context for AI Collaboration

### How to Approach This Project

**This is a civic-tech product optimizing for emotional impact and trust.** Technical decisions must always be weighed against:
- DSGVO compliance (no persistent user data in v1)
- User trust (German citizens are skeptical of data collection)
- Letter quality (the AI output is the product — degrading it is a launch risk)

### What Kind of Help Is Most Valuable

1. **Prompt engineering for `generateLetter.ts`:** The system prompt is the core IP. Improvements should be tested against diverse issue types and tone levels. Look for: hallucination patterns, tonal drift, forbidden element leakage.

2. **Security audits:** Anti-tampering, rate limit bypass, input injection, prompt injection via user issueText — all are live threat surfaces.

3. **Data freshness strategy:** Proposing a non-manual approach to keeping politician data current (Vercel Cron + Abgeordnetenwatch polling).

4. **UX flow improvements:** The wizard is functional but has rough edges — especially the error states and the "no politician found for PLZ" edge case.

5. **Feature ideation within constraints:** Zero budget means no paid services beyond Mistral + Brevo. Proposals must work on Vercel Hobby.

### Constraints to Always Respect

- **No new 3rd-party services without asking Thomas first** (he will flag DSGVO + cost implications)
- **No em-dashes in user-facing copy** — use hyphens, commas, or colons instead
- **German-only UI and letter output** — never propose English in the app layer
- **No persistent user data in v1** — do not propose databases or auth without explicit approval
- **Letter quality is non-negotiable** — any change to the system prompt or generation logic requires careful testing, not just "looks good"
- **Mistral is the AI provider** — OpenAI was the original plan but Mistral is the current implementation; don't assume OpenAI compatibility

### Assumptions Embedded in the Codebase
- PLZ-to-Wahlkreis mapping is static and built at compile time (Bundeswahlleiter 2025 data)
- Abgeordnetenwatch API v2 is the authoritative politician data source (CC0 licensed)
- A handwritten letter is more impactful than digital alternatives — this is the product's core claim and should never be undermined in copy
- Bundestag focus is intentional for v1; Landtag/Kommune is best-effort

---

*Last updated: 2026-04-28 | Generated from full codebase analysis*
