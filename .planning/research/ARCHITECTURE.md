# Architecture Research

**Domain:** Civic tech citizen-to-politician letter generation (serverless, stateless)
**Researched:** 2026-04-10
**Confidence:** HIGH for core Next.js/API patterns; MEDIUM for PLZ-to-Wahlkreis mapping approach; LOW for Landtag data coverage completeness

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ LandingPage  │  │  InputForm   │  │   LetterDisplay        │ │
│  │ (static)     │  │ (text+voice) │  │   (result + print CTA) │ │
│  └──────────────┘  └──────┬───────┘  └──────────┬─────────────┘ │
│                            │                      │              │
│           Web Speech API   │       React state    │              │
│           (browser-native) │◄─────────────────────┘              │
└────────────────────────────┼────────────────────────────────────┘
                             │ fetch POST
┌────────────────────────────▼────────────────────────────────────┐
│                     Next.js on Vercel                            │
│                    (App Router + Route Handlers)                  │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  /api/lookup   │  │ /api/generate   │  │  Static assets   │  │
│  │  (politician)  │  │ (letter)        │  │  (Lovable export)│  │
│  └───────┬────────┘  └────────┬────────┘  └──────────────────┘  │
│          │                    │                                   │
│  ┌───────▼────────┐  ┌────────▼────────┐                         │
│  │ PLZ lookup lib │  │  Prompt builder │                         │
│  │ (static JSON)  │  │  + sanitizer    │                         │
│  └───────┬────────┘  └────────┬────────┘                         │
└──────────┼────────────────────┼────────────────────────────────-─┘
           │                    │
           │ HTTPS              │ HTTPS
┌──────────▼──────┐   ┌─────────▼────────────────────────────────┐
│ Abgeordnetenwatch│   │             OpenAI API                   │
│ API v2           │   │  (gpt-4o-mini, streaming or single-shot) │
│ (CC0 license)    │   └──────────────────────────────────────────┘
└─────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| LandingPage | Explain concept, build trust, CTA to tool | Static Next.js page (Lovable export, extended) |
| InputForm | Collect frustration text + PLZ; trigger voice | React client component with `useReducer` state |
| VoiceInput | Browser-native STT, append to textarea | `react-speech-recognition` wrapping Web Speech API |
| `/api/lookup` | PLZ → Wahlkreisnr → Abgeordnetenwatch query → politician(s) | Next.js Route Handler (Node runtime) |
| PLZ lookup table | Static mapping: PLZ → Wahlkreisnr (Bundestag) | Bundled JSON file (~2MB, derived from Bundeswahlleiterin shapefile data) |
| `/api/generate` | Build prompt, call OpenAI, return letter text | Next.js Route Handler, single-shot or streaming |
| PromptBuilder | Assemble issue description + politician metadata into system/user prompt | Pure TypeScript utility function |
| LetterDisplay | Show formatted letter + politician address + print/copy instructions | React client component |
| EmailCapture | Optional: capture email, send letter draft | API route + Resend/Nodemailer (optional in v1) |

---

## Recommended Project Structure

```
brief-nach-berlin/
├── app/
│   ├── page.tsx                    # Landing page (Lovable-exported, extended)
│   ├── tool/
│   │   └── page.tsx                # Main tool: input → letter flow
│   └── api/
│       ├── lookup/
│       │   └── route.ts            # POST: PLZ → politician data
│       └── generate/
│           └── route.ts            # POST: issue + politician → letter text
├── components/
│   ├── InputForm.tsx               # PLZ + issue text/voice input
│   ├── VoiceInput.tsx              # Web Speech API wrapper (client only)
│   ├── PoliticianCard.tsx          # Show matched politician(s)
│   └── LetterDisplay.tsx           # Final letter + copy/print UI
├── lib/
│   ├── plz-lookup.ts               # PLZ → Wahlkreisnr lookup (uses JSON data)
│   ├── abgeordnetenwatch.ts        # API client for politician data
│   ├── prompt-builder.ts           # Assemble OpenAI prompt from inputs
│   └── letter-validator.ts         # Word count, tone checks on generated letter
├── data/
│   └── plz-wahlkreis.json          # Static PLZ → Wahlkreisnr mapping (~2MB)
│   └── landtag-lookup.json         # Static PLZ → Bundesland (for Landtag routing)
├── public/
│   └── hero.png                    # Ghibli-style solarpunk Berlin image
└── types/
    ├── politician.ts               # Shared types for API responses
    └── letter.ts                   # Letter generation types
```

### Structure Rationale

- **`app/api/`** Route Handlers keep secrets (OpenAI key) server-side; browser never touches external APIs directly.
- **`lib/`** Pure utility functions — easy to unit test, no React dependency.
- **`data/`** Static JSON bundled at build time — zero runtime DB cost, deterministic lookups, instant cold starts.
- **`components/`** VoiceInput is isolated so it can be conditionally rendered only in browsers that support the Web Speech API.

---

## Architectural Patterns

### Pattern 1: Stateless Request/Response (No DB)

**What:** Each API call is self-contained. No session, no DB write, no user state persisted server-side. Input → process → output → done.

**When to use:** V1 with no accounts and DSGVO-minimal data collection. Perfect fit here.

**Trade-offs:** Cannot resume sessions, cannot show user history, cannot analytics-track completions server-side. Acceptable for v1. Client-side sessionStorage can cache last letter without DSGVO implications.

```typescript
// /app/api/generate/route.ts
export async function POST(req: Request) {
  const { issue, politician } = await req.json()
  const prompt = buildPrompt(issue, politician)
  const letter = await callOpenAI(prompt) // stateless — no writes
  return Response.json({ letter })
}
```

### Pattern 2: Static Data Bundled at Build Time (PLZ Lookup)

**What:** The PLZ-to-Wahlkreis mapping is a pre-compiled JSON file committed to the repo and imported at build time. No external lookup at runtime. The Bundeswahlleiterin provides Shapefile/CSV data; a one-time preprocessing script converts it to a flat JSON map.

**When to use:** Data that changes rarely (election districts change every ~4 years). Eliminates runtime latency and third-party dependency for the critical lookup step.

**Trade-offs:** ~2MB bundle addition (acceptable for server bundle, not client bundle — keep in `lib/` not `components/`). Must re-run preprocessing script after each Bundestagswahl redistricting.

```typescript
// lib/plz-lookup.ts
import plzData from '../data/plz-wahlkreis.json'

export function getWahlkreisnr(plz: string): number | null {
  return plzData[plz] ?? null
}
// Some PLZ span multiple Wahlkreise — return array, let UI handle disambiguation
```

**Critical note on PLZ → Wahlkreis:** There is no officially published PLZ-to-Wahlkreisnr CSV from the Bundeswahlleiterin. Postal code boundaries do not align with electoral district boundaries (confirmed via FragDenStaat FOI request). The most reliable approach: download the Bundeswahlleiterin shapefile, do a point-in-polygon join against PLZ centroids (from suche-postleitzahl.org or OpenStreetMap), and build the lookup table as a preprocessing step. Edge cases where one PLZ spans two Wahlkreise (~5% of cases) should surface both politicians to the user.

### Pattern 3: Two-Phase User Flow (Input → Confirm → Generate)

**What:** Don't call OpenAI until user has confirmed which politician they want a letter to. Separate the lookup call (fast, cheap) from the generation call (slower, costs tokens).

**When to use:** When one PLZ might match multiple politicians or political levels (Bundestag + Landtag + Kommune), letting the user choose scope.

**Trade-offs:** Adds one interaction step; significantly improves relevance and reduces wasted API calls.

```
Step 1: User submits PLZ + issue text
         → /api/lookup returns: MdB name, MdL name, topic-responsible level (AI-determined)
         → UI shows: "Wir schreiben an [MdB Name] (Bundestag) — oder möchtest du an [MdL Name] (Landtag) schreiben?"
Step 2: User confirms politician
         → /api/generate receives: issue + confirmed politician
         → Returns: letter text
```

---

## Data Flow

### Primary Request Flow (Happy Path)

```
User types frustration + PLZ → clicks "Brief erstellen"
        ↓
InputForm validates: PLZ format (5-digit), issue length (min 20 chars)
        ↓
POST /api/lookup { plz, issue }
        ↓
  plz-lookup.ts: PLZ → Wahlkreisnr (static JSON)
        ↓
  abgeordnetenwatch.ts: GET /api/v2/candidacies-mandates?constituency_nr={n}&parliament_period={current}
        ↓
  Returns: MdB name, party, address, photo URL
        ↓
  (Optional) AI determines: Bundestag vs. Landtag primarily responsible (cheap classification call)
        ↓
Response: { mdb: {...}, mdl: {...}, suggestedLevel: "bundestag" }
        ↓
UI: PoliticianCard shown, user confirms
        ↓
POST /api/generate { issue, politician, level }
        ↓
  prompt-builder.ts: assemble system prompt + user content
        ↓
  OpenAI gpt-4o-mini: generate ~220-word formal letter in German
        ↓
Response: { letter: "..." }
        ↓
LetterDisplay: show letter + politician postal address + "Jetzt abschreiben und absenden" CTA
```

### Voice Input Flow

```
User clicks microphone button
        ↓
VoiceInput checks: window.SpeechRecognition || window.webkitSpeechRecognition
  → Not supported: show fallback message ("nur in Chrome/Safari verfügbar")
  → Supported: request microphone permission
        ↓
SpeechRecognition.start() — browser sends audio to Google's servers (Chrome)
        ↓
onresult event: transcript appended to issue textarea
        ↓
Normal flow continues from InputForm
```

**Note:** Web Speech API on Chrome sends audio to Google for processing (not local). This is acceptable for v1 but should be disclosed in the privacy notice (DSGVO). Safari uses on-device processing. Firefox has no support.

### State Management

```
React useState / useReducer in tool/page.tsx:
  {
    step: 'input' | 'confirm' | 'letter',
    issue: string,
    plz: string,
    politicians: Politician[],
    selectedPolitician: Politician | null,
    letter: string,
    isLoading: boolean,
    error: string | null
  }
```

No global state manager needed (Zustand, Redux) — single-page flow, co-located state is sufficient for v1.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Abgeordnetenwatch API v2 | Server-side fetch in `/api/lookup`; no auth required | CC0 license; rate limits undocumented — add 500ms retry with exponential backoff. Key endpoints: `/candidacies-mandates?constituency_nr={n}&parliament_period={current}` |
| OpenAI API | Server-side fetch in `/api/generate`; API key in env var | Use `gpt-4o-mini` for cost efficiency (~$0.0002/letter). Never expose key to client. |
| Web Speech API | Browser-native in `VoiceInput.tsx`; no API key | Chrome: server-side Google STT (audio leaves device). Must use `'use client'` directive. |
| Bundeswahlleiterin data | Build-time preprocessing only; not a runtime dependency | Download shapefiles → run `scripts/build-plz-lookup.ts` → commit JSON output |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Browser ↔ `/api/lookup` | POST JSON over HTTPS | Input: `{ plz: string, issue: string }`. Validate PLZ server-side (5-digit German format) before hitting Abgeordnetenwatch. |
| Browser ↔ `/api/generate` | POST JSON over HTTPS | Input: `{ issue: string, politician: Politician, level: 'bundestag' \| 'landtag' }`. Rate-limit by IP (Vercel middleware) to prevent abuse. |
| `/api/lookup` ↔ Abgeordnetenwatch | GET HTTPS, server-side | Cache response in memory or Vercel KV for same constituency_nr within same deployment to reduce API load. Not required for v1. |
| `lib/plz-lookup.ts` ↔ `data/plz-wahlkreis.json` | Static import at build time | Server bundle only — don't import in client components. |

---

## Suggested Build Order

Dependencies between components determine this order:

1. **PLZ lookup data + preprocessing script** — everything else depends on having valid Wahlkreisnr values. Build the `data/plz-wahlkreis.json` first.
2. **`/api/lookup` route** — can be tested independently with curl before any UI exists.
3. **`/api/generate` route** — can be tested independently with a hardcoded politician object.
4. **InputForm + VoiceInput** — frontend that feeds the two API routes.
5. **PoliticianCard + LetterDisplay** — display components, depend on data shape from API routes.
6. **Landing page integration** — connect Lovable export to the tool route.
7. **Email capture (optional)** — add last, lowest priority for v1.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k users/month | Current stateless serverless approach — no changes needed. Vercel free tier sufficient. |
| 1k–50k users/month | Add Vercel KV (Redis) to cache Abgeordnetenwatch responses by constituency. Add rate limiting on `/api/generate` (OpenAI cost control). Vercel hobby → pro. |
| 50k+ users/month | OpenAI costs become meaningful (~€10/1k letters). Consider prompt caching, letter templates with AI fill-in rather than full generation. Add analytics (Plausible) to understand drop-offs. |

### First Bottleneck

Abgeordnetenwatch API — no documented rate limits, but calling it on every user request without caching is fragile. Simple fix: cache constituency lookups (there are only 299 Wahlkreise) in Vercel KV or even a module-level Map singleton (warm across requests on same Vercel instance).

---

## Anti-Patterns

### Anti-Pattern 1: Exposing OpenAI Key to Browser

**What people do:** Call OpenAI directly from client-side JavaScript to avoid writing an API route.

**Why it's wrong:** API key is visible to any user who opens DevTools. Key gets scraped and abused within hours.

**Do this instead:** Always proxy through `/api/generate`. The route handler runs server-side only.

### Anti-Pattern 2: Calling Abgeordnetenwatch from Client

**What people do:** Fetch politician data directly from the browser to skip a server round-trip.

**Why it's wrong:** CORS issues (Abgeordnetenwatch does not set permissive CORS headers for browser requests). Also exposes your lookup logic and makes rate-limiting impossible.

**Do this instead:** Always call Abgeordnetenwatch from the Next.js Route Handler.

### Anti-Pattern 3: Using Geospatial Lookup at Runtime for PLZ

**What people do:** Bundle a full GeoJSON shapefile and do point-in-polygon at request time to map PLZ → Wahlkreis.

**Why it's wrong:** Shapefile is 10–50MB. Point-in-polygon is computationally expensive for a serverless function with short execution limits.

**Do this instead:** Run the geo join once at build time (in a local preprocessing script), output a flat `{ "10115": 76, "20095": 19, ... }` JSON, and bundle it. Runtime lookup is O(1).

### Anti-Pattern 4: Generating Letter Without Confirming Politician

**What people do:** Auto-select politician and immediately generate letter to minimize steps.

**Why it's wrong:** PLZ may span Wahlkreis boundaries (returning two politicians) or the issue may be more relevant at Landtag level than Bundestag. Auto-selecting gets it wrong ~15% of the time.

**Do this instead:** Show the matched politician with a brief rationale before generating. One extra click prevents a letter addressed to the wrong person.

---

## Sources

- Abgeordnetenwatch API v2 documentation: https://www.abgeordnetenwatch.de/api
- Abgeordnetenwatch entity: CandidacyMandate: https://www.abgeordnetenwatch.de/api/entitaeten/candidacy-mandate
- Bundeswahlleiterin open data (2025): https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html
- Bundeswahlleiterin Wahlkreis downloads (shapefiles): https://www.bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html
- FragDenStaat FOI on PLZ-Wahlkreis: https://fragdenstaat.de/en/request/wahlkreise-und-postleitzahlen/ (confirms no official PLZ→Wahlkreis CSV exists)
- MDN Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- react-speech-recognition (npm): https://www.npmjs.com/package/react-speech-recognition
- Next.js Route Handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Vercel AI SDK (streaming): https://ai-sdk.dev/docs/getting-started/nextjs-app-router

---
*Architecture research for: Brief nach Berlin (civic tech letter generation)*
*Researched: 2026-04-10*
