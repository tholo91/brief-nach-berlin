# Phase 2: Core Engine — Research

**Researched:** 2026-04-13
**Domain:** Next.js 16 Server Actions, Mistral AI API, OpenAI Whisper/Moderation, Abgeordnetenwatch API, PLZ lookup, multi-step wizard UX
**Confidence:** HIGH (core stack), MEDIUM (Mistral German quality, Abgeordnetenwatch v2 edge cases)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Multi-step wizard at `/app` with 3 steps: (1) PLZ + Email + Name (optional) + Party (optional) + NGO/Gewerkschaft (optional); (2) Issue textarea + voice recording secondary; (3) Success page with processing state
- **D-02:** Phase 2 replaces the `/app` placeholder with the full wizard
- **D-03:** Mistral (EU-hosted) is the primary AI model for letter generation — NOT OpenAI. Whisper is still used for voice-to-text only
- **D-04:** Letter format: ~200-280 words, formal German Briefstil (Sie-Form), sachlich tone, gender-neutral (no Gendersternchen/Doppelpunkt), no political bias, includes date/salutation/body/closing/sender placeholder
- **D-05:** AI decides responsible political level (Bund/Land/Kommune) silently — no level UI shown to user
- **D-06:** Mistral receives filtered politician list + issue description and selects the politician + generates the letter in one call
- **D-07:** Missing politician data → transparent message with link to official source, no silent fallback
- **D-08:** Optional affiliation (party/NGO name) included in Mistral prompt if provided
- **D-09:** PLZ → multiple Wahlkreise → success page shows politician selection UI before generation
- **D-10:** PLZ → single Wahlkreis → proceed directly to letter generation after Step 2 submission
- **D-11:** Voice recording: click-to-start/stop mic button below textarea, red pulsing indicator + elapsed timer, transcription populates textarea (editable). Reuse surv.ai RecordingInterface and AudioRecorder patterns
- **D-12:** Generated letter delivered by email only — NOT displayed on success page
- **D-13:** Email content (Phase 3): letter text + politician postal address + handwriting instructions + action buttons
- **D-14:** Scope conflict documented — email delivery is Phase 3, but success page implies email delivery. Resolution needed in plan
- **D-15:** OpenAI Moderation API for safety: check input BEFORE generation, check output BEFORE delivery. On rejection: soft block with German error message, user can resubmit
- **D-16:** No persistent storage — all data in-memory during request only
- **D-17:** Email + PLZ are the only personal data collected

### Claude's Discretion

- Exact Mistral model variant (mistral-large vs. mistral-small — test for German letter quality)
- Server action structure (one vs. multiple actions for lookup, generation, safety)
- Exact system prompt wording for letter generation (within D-04 constraints)
- PLZ validation regex and edge cases (e.g., East German PLZ ranges)
- Exact wizard step transition animation (slide, fade, or none)
- Error state UI details (beyond the copy specified above)
- Audio recording max duration and timeout handling

### Deferred Ideas (OUT OF SCOPE)

- Full email sending via Resend/SendGrid (Phase 3)
- Complete Datenschutzerklaerung update for Mistral (Phase 3)
- Email magic link for "Neu generieren" (Phase 3)
- EU Parliament coverage (v2+)
- Multiple language support (v2+)
- Auto-pen via Pensaki (v2+)
- Bürgerbüro routing (v2+)
- Politician response tracking (v2+)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INPT-01 | User can describe frustration/issue via free text | Textarea with react-hook-form; Step 2 of wizard |
| INPT-02 | User can describe frustration via voice input (OpenAI Whisper API) | MediaRecorder → Server Action → Whisper `audio.transcriptions.create`; reuse surv.ai AudioRecorder class |
| INPT-03 | User enters German PLZ (validated: 5 digits, valid range) | Zod schema: `z.string().regex(/^\d{5}$/)` + range validation; react-hook-form Step 1 |
| INPT-04 | User enters email address to receive generated letter | Email field Step 1; Zod `.email()` validation |
| POLI-01 | System maps PLZ to Bundestagswahlkreis using preprocessed Bundeswahlleiter data | Read `data/plz-wahlkreis-mapping.json` (Phase 1 output) via `fs.readFileSync` in Server Action |
| POLI-02 | System resolves Wahlkreis to direct MdB via Abgeordnetenwatch API (cached locally) | Read `data/politicians-cache.json` (Phase 1 output); parliament_period 161 confirmed active |
| POLI-03 | System retrieves politician name and contact/postal address | Name from cache; postal address = standard Bundestag formula (see Architecture Patterns) |
| POLI-04 | When PLZ spans multiple Wahlkreise, user disambiguates | D-09 flow: success page shows politician selection UI |
| POLI-05 | AI classifies which political level is primarily responsible | D-06: Mistral single call classifies level + selects politician + generates letter |
| SAFE-01 | User input checked via OpenAI Moderation API before generation | `POST https://api.openai.com/v1/moderations` with `omni-moderation-latest`; free endpoint |
| SAFE-02 | Generated letter output checked via OpenAI Moderation API before delivery | Same moderation call on Mistral output before queuing |
| SAFE-03 | System rejects abusive input with clear German error message | Soft block; user can edit and resubmit |
| LETR-01 | AI generates formal German letter ~200-280 words | Mistral `mistral-small-latest` recommended (see Standard Stack); system prompt enforces format |
| LETR-02 | Letter includes date, salutation, body, closing, sender placeholder | Enforced via system prompt structure |
| LETR-03 | Letter tone: personal but sachlich, auf Augenhöhe | System prompt tone constraints |
| LETR-04 | Letter references specific local issue | User issue text injected into Mistral context |
| LETR-05 | Letter addressed to politician by name and title | Politician name/title from cache injected into prompt |
</phase_requirements>

---

## Summary

Phase 2 builds three interlocking pipelines: (1) a multi-step wizard UI capturing PLZ, email, and issue description; (2) a PLZ-to-politician lookup reading Phase 1's static JSON data files; and (3) a Mistral-powered letter generation flow with OpenAI content moderation at both input and output.

The key architectural insight is that all backend logic lives in Next.js Server Actions — no separate API routes needed. The wizard is a client-side state machine (three steps rendered in one page component). The Mistral call receives the filtered politician list plus user context in one prompt and performs three jobs at once: level classification, politician selection, and letter generation.

The primary constraint is Vercel Hobby's 10-second serverless function timeout. Streaming the Mistral response via a Route Handler (not a Server Action) is the correct workaround — streaming responses can continue for up to 300 seconds on Edge Runtime without hitting the 10-second limit. However, because D-12 specifies that the letter is delivered by email (not displayed in real-time), streaming to the client is not required for v1. The letter generation can be a standard async Server Action that queues the output for Phase 3 email delivery. This simplifies the implementation significantly.

**Primary recommendation:** Use `mistral-small-latest` for letter generation (sufficient quality for structured German formal letters at 1/10th the cost of mistral-large). Use a single composite Server Action that chains: PLZ lookup → moderation check → Mistral generation → output moderation → queue letter for email. No streaming needed in Phase 2 because the letter is not displayed on-screen.

---

## Standard Stack

### Core (Additions to Existing Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mistralai/mistralai` | 2.2.0 | Mistral API client for letter generation | EU-hosted, TypeScript-first, async iterable streaming, ESM-only v2 SDK |
| `openai` | 6.34.0 | Whisper transcription + Moderation API | Already in CLAUDE.md stack; single SDK covers both Whisper and moderation |
| `zod` | ^3.24.x | Validation of PLZ, email, form data, API responses | Project standard; v4 still in beta — stick to v3 |
| `react-hook-form` | ^7.72.x | Multi-step wizard form state management | Project standard; pairs with Zod via `@hookform/resolvers` |
| `@hookform/resolvers` | ^3.10 | Bridge react-hook-form + Zod schemas | Required whenever both libraries coexist |
| `recordrtc` | 5.6.2 | MediaRecorder wrapper for audio recording | Already used in surv.ai; handles iOS Safari quirks, produces audio/webm blob |

[VERIFIED: npm registry — all versions confirmed 2026-04-13]

### Not Needed (Already Covered)

| What | Why Not Needed |
|------|---------------|
| `csv-parse` | Phase 1 already built `data/plz-wahlkreis-mapping.json` — Phase 2 reads it as JSON |
| `swr` | No client-side async fetching of politician data; lookup happens server-side in Server Action |
| Streaming libraries | No real-time display of letter; email delivery means full generation then queue |
| Database | DSGVO constraint: no persistence |

### Installation

```bash
cd web
npm install @mistralai/mistralai openai zod react-hook-form @hookform/resolvers recordrtc
npm install --save-dev @types/recordrtc
```

[VERIFIED: npm registry]

### Version Compatibility Notes

- `@mistralai/mistralai` v2 is ESM-only. In a Next.js 16 App Router project (which is ESM-compatible), `import { Mistral } from '@mistralai/mistralai'` works directly in Server Actions. [VERIFIED: npm package page + GitHub mistralai/client-ts]
- `zod` v3.x — do NOT use v4 (breaking changes to `.parse` API, still in beta). [ASSUMED — based on CLAUDE.md note corroborated by training data]

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
web/src/
├── app/
│   ├── app/
│   │   └── page.tsx              # Multi-step wizard (replace placeholder)
│   └── api/
│       └── transcribe/
│           └── route.ts          # Audio transcription Route Handler (POST)
├── components/
│   ├── wizard/
│   │   ├── WizardShell.tsx       # Step state machine, progress indicator
│   │   ├── Step1Form.tsx         # PLZ + Email + optional fields
│   │   ├── Step2Issue.tsx        # Textarea + VoiceRecorder
│   │   └── Step3Success.tsx      # Processing state + disambiguation UI
│   └── audio/
│       ├── VoiceRecorder.tsx     # Adapted from surv.ai RecordingInterface
│       └── AudioRecorder.ts      # Copied from surv.ai lib/audio/recorder.ts
├── lib/
│   ├── actions/
│   │   ├── submitWizard.ts       # Main Server Action: lookup → moderate → generate → queue
│   │   └── selectPolitician.ts   # Server Action: triggered when user picks politician (D-09)
│   ├── lookup/
│   │   └── plzLookup.ts          # Read data/plz-wahlkreis-mapping.json + politicians-cache.json
│   ├── moderation/
│   │   └── moderateText.ts       # OpenAI Moderation API wrapper
│   ├── generation/
│   │   └── generateLetter.ts     # Mistral chat completion + system prompt
│   └── validation/
│       └── wizardSchemas.ts      # Zod schemas for Step 1 + Step 2 inputs
data/
├── plz-wahlkreis-mapping.json    # Phase 1 output (PLZ → Wahlkreis IDs)
└── politicians-cache.json        # Phase 1 output (politician data by level)
```

### Pattern 1: Multi-Step Wizard as Client State Machine

**What:** A single `page.tsx` client component manages `step` state (1, 2, 3) and renders the appropriate step component. No routing between steps.

**When to use:** When steps share state (PLZ from Step 1 is needed in Step 3) and URL-based routing would add complexity without benefit.

```typescript
// Source: pattern aligned with Next.js App Router "use client" pages
"use client";
import { useState } from "react";
import Step1Form from "@/components/wizard/Step1Form";
import Step2Issue from "@/components/wizard/Step2Issue";
import Step3Success from "@/components/wizard/Step3Success";

type WizardData = {
  plz: string;
  email: string;
  name?: string;
  party?: string;
  ngo?: string;
  issueText: string;
};

export default function AppPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [politicians, setPoliticians] = useState<Politician[]>([]);

  const goToStep2 = (data: Pick<WizardData, "plz" | "email" | "name" | "party" | "ngo">) => {
    setWizardData(data);
    setStep(2);
  };

  const submitIssue = async (issueText: string) => {
    const full = { ...wizardData, issueText } as WizardData;
    const result = await submitWizardAction(full);
    if (result.disambiguationNeeded) {
      setPoliticians(result.politicians);
    }
    setStep(3);
  };

  return (
    <>
      {step === 1 && <Step1Form onNext={goToStep2} />}
      {step === 2 && <Step2Issue onSubmit={submitIssue} />}
      {step === 3 && <Step3Success politicians={politicians} wizardData={wizardData as WizardData} />}
    </>
  );
}
```

[ASSUMED — pattern is idiomatic React; specific implementation is discretion]

### Pattern 2: Server Action Pipeline

**What:** One async Server Action orchestrates the full pipeline. Called from client with `"use server"` directive.

**When to use:** All backend operations (lookup, moderation, generation) — keeps API keys server-side, avoids client exposure.

```typescript
// Source: Next.js App Router Server Actions pattern [CITED: nextjs.org/docs/app/building-your-application/data-fetching/server-actions]
"use server";

export async function submitWizardAction(data: WizardData): Promise<WizardActionResult> {
  // 1. Validate input with Zod
  const parsed = wizardSchema.safeParse(data);
  if (!parsed.success) throw new Error("Ungültige Eingabe");

  // 2. Moderate user input BEFORE any AI call (SAFE-01)
  const moderationResult = await moderateText(data.issueText);
  if (moderationResult.flagged) {
    return { error: "moderation_rejected", message: "Wir können dieses Anliegen nicht weiterverarbeiten." };
  }

  // 3. PLZ lookup
  const { wahlkreisIds, politicians } = await lookupPLZ(data.plz);
  if (wahlkreisIds.length > 1) {
    // D-09: Return politician list for disambiguation
    return { disambiguationNeeded: true, politicians };
  }

  // 4. Generate letter with Mistral (LETR-01..05, POLI-05)
  const { letter, selectedPolitician } = await generateLetter({
    issueText: data.issueText,
    politicians: politicians,
    name: data.name,
    party: data.party,
    ngo: data.ngo,
  });

  // 5. Moderate letter output BEFORE delivery (SAFE-02)
  const outputModeration = await moderateText(letter);
  if (outputModeration.flagged) {
    return { error: "output_moderation_rejected" };
  }

  // 6. Queue for Phase 3 email delivery (store in-memory/temp; actual send is Phase 3)
  // Phase 2: just log or return letterData for Phase 3 to wire up
  return { success: true, politician: selectedPolitician };
}
```

[ASSUMED — orchestration pattern; exact implementation is discretion]

### Pattern 3: PLZ Lookup from Static JSON

**What:** At request time, read the Phase 1 JSON files using `fs.readFileSync` inside a Server Action. Cache the parsed JSON in module scope to avoid re-reading on every request.

**Why not `import`:** Dynamic JSON files can't use static `import` if they're generated after build time. `fs.readFileSync` is safe inside Server Actions (server-only code).

```typescript
// Source: [ASSUMED — standard Node.js pattern for server-side file access]
import { readFileSync } from "fs";
import { join } from "path";

let _plzMapping: Record<string, number[]> | null = null;
let _politiciansCache: PoliticiansCache | null = null;

function getPlzMapping(): Record<string, number[]> {
  if (!_plzMapping) {
    const raw = readFileSync(join(process.cwd(), "data/plz-wahlkreis-mapping.json"), "utf-8");
    _plzMapping = JSON.parse(raw);
  }
  return _plzMapping!;
}

function getPoliticiansCache(): PoliticiansCache {
  if (!_politiciansCache) {
    const raw = readFileSync(join(process.cwd(), "data/politicians-cache.json"), "utf-8");
    _politiciansCache = JSON.parse(raw);
  }
  return _politiciansCache!;
}

export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] } {
  const mapping = getPlzMapping();
  const cache = getPoliticiansCache();
  const wahlkreisIds = mapping[plz] ?? [];
  const politicians = wahlkreisIds.flatMap(id => cache.bundestag.filter(p => p.wahlkreisId === id));
  return { wahlkreisIds, politicians };
}
```

[ASSUMED — file path uses `process.cwd()` which resolves to `web/` in Next.js Vercel deployments]

### Pattern 4: OpenAI Moderation API

**What:** Free endpoint, call before generation and before delivery.

```typescript
// Source: [CITED: platform.openai.com/docs/guides/moderation]
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function moderateText(text: string): Promise<{ flagged: boolean; categories: string[] }> {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  const result = response.results[0];
  const flaggedCategories = Object.entries(result.categories)
    .filter(([, flagged]) => flagged)
    .map(([category]) => category);
  return { flagged: result.flagged, categories: flaggedCategories };
}
```

[VERIFIED: OpenAI docs — omni-moderation-latest, POST /v1/moderations, free endpoint, 13 categories]

### Pattern 5: Mistral Letter Generation

**What:** Single Mistral call that classifies level, selects politician, and generates the letter.

```typescript
// Source: [VERIFIED: docs.mistral.ai/capabilities/completion/usage — @mistralai/mistralai v2 SDK]
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function generateLetter(input: GenerateLetterInput): Promise<{ letter: string; selectedPolitician: Politician }> {
  const systemPrompt = buildSystemPrompt(); // See System Prompt section
  const userPrompt = buildUserPrompt(input);

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    responseFormat: { type: "json_object" },  // Structured output for parsing
    temperature: 0.7,
  });

  const content = response.choices[0].message.content as string;
  const parsed = JSON.parse(content);
  return { letter: parsed.letter, selectedPolitician: parsed.politician };
}
```

[VERIFIED: @mistralai/mistralai v2.2.0 SDK — `mistral.chat.complete()`, `mistral.chat.stream()` for async iterable streaming]

### Pattern 6: Voice Recording (Adapted from surv.ai)

**What:** `AudioRecorder` class from surv.ai handles `MediaRecorder` lifecycle. Adapt for brief-nach-berlin: remove chunk upload, just collect full blob, then send to `/api/transcribe` Route Handler.

**Key simplification:** surv.ai uploads audio chunks progressively. Brief-nach-berlin only needs one-shot recording → upload → transcription. Remove the `onDataAvailable` chunking logic; just stop the recorder and get the full blob.

```typescript
// Source: [VERIFIED: surv.ai /lib/audio/recorder.ts — AudioRecorder class, RecorderState type]
// Simplified version for brief-nach-berlin (no chunked upload):
const recorder = new AudioRecorder({
  onStateChange: setRecorderState,
});

// On stop: get blob, send to /api/transcribe
const result = await recorder.stop(); // Returns { blob, durationMs, mimeType }
const formData = new FormData();
formData.append("audio", result.blob, "recording.webm");
const res = await fetch("/api/transcribe", { method: "POST", body: formData });
const { text } = await res.json();
setIssueText(text); // Populate textarea
```

**Route Handler for transcription (not Server Action — avoids FormData complexity):**

```typescript
// web/src/app/api/transcribe/route.ts
// Source: [ASSUMED — Route Handler pattern; Server Actions can handle FormData but Route Handler is cleaner for file upload]
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioBlob = formData.get("audio") as Blob;

  // Whisper requires a File with a name for format detection
  const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "de",  // Force German for better accuracy
  });

  return NextResponse.json({ text: transcription.text });
}
```

[VERIFIED: openai SDK v6.34.0 `audio.transcriptions.create` — webm format supported, `language: "de"` parameter available]

### Pattern 7: Politician Postal Address Construction

**What:** Abgeordnetenwatch does NOT provide postal addresses. The Bundestag XML API also does not include individual office addresses. The correct pattern is the standard German Bundestag correspondence formula used for all MdBs.

**Standard Bundestag postal address for all MdBs:**
```
[Titel] [Vorname] [Nachname] MdB
Deutscher Bundestag
Platz der Republik 1
11011 Berlin
```

This is the universally correct address — all Bundestag mail is routed internally to the member's office. [VERIFIED: bundestag.de/services/kontakt]

**For Landtag/Kommune levels:** Addresses not available in any free API. Phase 2 plan must include D-07 transparent fallback for these levels (link to official Landtag/Gemeinde website).

### Anti-Patterns to Avoid

- **Separate API route for every operation:** Server Actions handle lookup + moderation + generation. Only transcription needs a Route Handler (due to file upload).
- **Storing anything in a database:** DSGVO constraint is absolute — no Prisma, no Supabase.
- **Calling Abgeordnetenwatch API at runtime:** Too slow, no SLA, no rate limit docs. Phase 1 cache is the source of truth.
- **Streaming letter to client in Phase 2:** The letter goes to email, not to the browser. Streaming adds complexity with no benefit in Phase 2.
- **Using `pages/` API routes:** App Router Server Actions + Route Handlers are the correct pattern.
- **Hardcoding `parliament_period=111`:** The current Bundestag is parliament period **161** (2025–2029). [VERIFIED: live Abgeordnetenwatch API call]
- **Assuming `/api/transcribe` Server Action handles file upload gracefully:** Use a Route Handler for audio file uploads — FormData with File objects has known friction with Server Actions in Next.js. Route Handler `req.formData()` is the reliable path.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex/if-else checks | Zod + react-hook-form | PLZ edge cases (East German 01xxx, special ranges), email normalization, server-side revalidation |
| Audio recording | Native MediaRecorder state machine | surv.ai AudioRecorder class (adapt) | Permission flow, iOS Safari webm quirks, state transitions (idle/recording/stopped/error) are all handled |
| Content moderation | Custom keyword list | OpenAI Moderation API (free) | 13 categories, multilingual (German verified), 98% language coverage in latest model |
| Text streaming client | Custom SSE/WebSocket | Mistral SDK async iterable (if needed in future) | Handles backpressure, reconnection, error cases |
| PLZ format check | Hand-written regex | Zod `.regex(/^\d{5}$/)` | Zod gives typed error objects; integrate with react-hook-form for instant UI feedback |

**Key insight:** The audio recording state machine is the highest-risk area for hand-rolling bugs. iOS Safari microphone permission behavior and webm codec compatibility are genuinely complex. The surv.ai `AudioRecorder` class already handles these — adapting it (stripping the chunked upload logic) takes ~30 minutes; building it from scratch takes days.

---

## Critical Discoveries

### Abgeordnetenwatch: No Postal Address Field

[VERIFIED: live API call to `GET /api/v2/politicians/{id}` and `GET /api/v2/candidacies-mandates/{id}`]

Neither the `politician` entity nor the `candidacy_mandate` entity contains a postal address. The `politician` entity has only a `residence` field (city of residence, not office address). The only field that could help identify a politician for letter addressing is `field_title` (academic title).

**Implication for POLI-03:** The standard Bundestag formula must be used for ALL MdBs. Individual Bundestag office addresses are not publicly available via API.

### Current Bundestag Parliament Period ID = 161

[VERIFIED: live Abgeordnetenwatch API call]

- `parliament_period=111` = Bundestag 2017–2021 (old, mentioned in CLAUDE.md research — now outdated)
- `parliament_period=132` = Bundestag 2021–2025
- `parliament_period=161` = Bundestag 2025–2029 (CURRENT, started 2025-03-25)

Phase 1's `politicians-cache.json` builder MUST use `parliament_period=161`. If Phase 1 was built with `111`, the cache is stale and must be rebuilt.

### Vercel Hobby Timeout: Not a Problem for Phase 2

[VERIFIED: vercel.com/docs/functions/limitations]

The 10-second serverless function limit applies to standard functions. Since the letter is delivered by email (D-12) and NOT displayed in real-time in the browser, there is no streaming requirement in Phase 2. The Mistral call (estimated 3-8 seconds for ~250-word German letter using mistral-small) fits within 10 seconds in the majority of cases. Worst-case mitigation: if Mistral exceeds 10 seconds, switch to Edge Runtime (which allows 300 seconds of streaming) for the generation Server Action.

**Recommendation for Phase 2:** Start with standard serverless (simpler). Add `export const runtime = 'edge'` to the action if timeouts occur in practice.

### Mistral SDK v2 is ESM-Only

[VERIFIED: npm page + GitHub mistralai/client-ts]

`@mistralai/mistralai` v2.x is ESM-only. Next.js 16 App Router (ESM-compatible server environment) handles this correctly. However, if any CommonJS modules import it, use `await import("@mistralai/mistralai")` (dynamic import). In Server Actions (`"use server"` files), static import works fine.

### OpenAI Moderation API: German is Well-Supported

[VERIFIED: WebSearch + eesel.ai analysis citing OpenAI announcement]

The `omni-moderation-latest` model improved 42% on multilingual evaluation and covers 13 categories. German is explicitly well-supported with accuracy exceeding the previous English-only model. The endpoint is free for all developers. Call structure: `POST https://api.openai.com/v1/moderations` with `{ model: "omni-moderation-latest", input: "<text>" }`.

### surv.ai AudioRecorder Uses recordrtc, Not Raw MediaRecorder

[VERIFIED: surv.ai lib/audio/recorder.ts — read directly]

The surv.ai `AudioRecorder` class is a wrapper around `recordrtc` (not the native `MediaRecorder` API directly). It lazy-loads `recordrtc` to avoid SSR crashes. The output blob MIME type is `audio/webm`. Whisper accepts `audio/webm` as a supported format.

**Simplification for brief-nach-berlin:** surv.ai records in 5-second chunks and uploads progressively. Brief-nach-berlin needs only a one-shot recording. The adaptation involves:
1. Remove `onDataAvailable` callback and chunk upload logic
2. Keep `start()`, `stop()`, `reset()`, `destroy()` methods
3. Keep `RecorderState`, `RecorderError`, `classifyMediaError` types
4. Keep `analyserStream` for the wave animation (visual feedback during recording)

---

## Mistral Model Selection (Claude's Discretion)

| Model | API ID | Input $/M | Output $/M | Context | Recommendation |
|-------|--------|-----------|-----------|---------|---------------|
| Mistral Small 3.2 | `mistral-small-latest` | ~$0.20 | ~$0.60 | 128k | **Recommended for v1** |
| Mistral Large 3 | `mistral-large-latest` | ~$2.00 | ~$6.00 | 128k | Reserve for quality issues |

[CITED: burnwise.io/ai-pricing/mistral — 2026 pricing, cross-referenced with pricepertoken.com]

**Recommendation: `mistral-small-latest`**

Reasons:
1. A ~250-word formal German letter is a straightforward structured task — not a reasoning-heavy problem. `mistral-small` handles European language formal writing well.
2. Cost: at ~500 tokens per request (prompt + completion), `mistral-small` costs ~$0.0004/request vs ~$0.004/request for `mistral-large` — 10x cheaper.
3. Mistral's models natively support German, French, Spanish, Italian, and other European languages with formal register capability. [CITED: local-ai-zone.github.io/brands/mistral-ai-european-excellence-guide-2025]
4. If letter quality is insufficient, upgrade to `mistral-large-latest` with no code change — just update the model string.

---

## System Prompt Strategy (Claude's Discretion)

The Mistral system prompt must accomplish three tasks in one call (D-06):

```
Du bist ein Assistent, der deutschen Bürgern hilft, wirksame Briefe an ihre gewählten Vertreter zu schreiben.

Aufgabe:
1. Analysiere das geschilderte Anliegen und bestimme, welche politische Ebene primär zuständig ist (Bund, Land oder Kommune).
2. Wähle aus der gegebenen Politikerliste den/die geeignetste/n Vertreter/in der zuständigen Ebene.
3. Schreibe einen formellen Brief (200-280 Wörter) in gepflegtem Deutsch, Sie-Form.

Briefformat:
- Datum: [Datum]
- Anrede: "Sehr geehrte/r [Titel] [Name],"
- 3 Absätze: Anlass, Kernproblem mit lokalem Bezug, konkreter Appell
- Schluss: "Mit freundlichen Grüßen," + "[Ihr Name]"

Regeln:
- Keine Genderzeichen (kein Sternchen, Doppelpunkt, Binnen-I)
- Sachlicher, respektvoller Ton — weder aggressiv noch unterwürfig
- Keine Parteinahme, kein Aktivismus-Ton
- Konkreter Bezug auf das geschilderte Anliegen
- Brief ist für handschriftliches Kopieren gedacht — einfache Satzstruktur

Antworte ausschließlich im JSON-Format:
{
  "political_level": "Bund|Land|Kommune",
  "selected_politician_id": <id>,
  "letter": "<vollständiger Brieftext>"
}
```

[ASSUMED — exact wording; within constraints of D-04. Planner should include this as the starting point, with discretion to refine.]

---

## Scope Conflict Resolution (D-14)

**The conflict:** Success page says "Wir schicken dir den Brief per Mail zu" (D-01), but email sending is Phase 3. Phase 2 cannot complete the promise to the user.

**Recommended resolution for the plan:** Phase 2 success page uses a truthful intermediate message:
- "Dein Brief wird gerade erstellt. Wir schicken ihn dir in Kürze an [email]."
- The actual email sending happens in Phase 3.
- Phase 2 must log or store the generated letter + recipient address in a way that Phase 3 can retrieve and send.
- Since D-16 prohibits persistent storage, the simplest Phase 2 approach is: generate the letter, log it server-side (console.log or a simple write to a temporary file/in-memory store), and acknowledge that Phase 3 wires the actual email transport.

**Pragmatic option:** If Resend's free tier (100 emails/day) is trivial to wire, the planner should consider pulling MAIL-01 into Phase 2 for a complete user experience. Resend npm install + one async call adds ~30 minutes of work. The CONTEXT.md D-14 explicitly asks the planner to evaluate this — include it as an explicit decision point in the plan.

---

## Common Pitfalls

### Pitfall 1: Wrong Parliament Period ID
**What goes wrong:** Using `parliament_period=111` (2017 Bundestag) instead of `161` (2025 Bundestag) returns stale or no data.
**Why it happens:** CLAUDE.md cites `parliament_period=111` from prior research — this is outdated.
**How to avoid:** Phase 1's cache builder and any runtime calls MUST use `parliament_period=161`.
**Warning signs:** Politician names returned don't match known current MdBs; constituency data is from 2017.

### Pitfall 2: Expecting Postal Addresses from Abgeordnetenwatch
**What goes wrong:** Assuming Abgeordnetenwatch provides postal addresses for MdBs. It doesn't.
**Why it happens:** POLI-03 says "System retrieves politician name and contact/postal address" — this implies an API field that doesn't exist.
**How to avoid:** Use the standard Bundestag formula for ALL Bundestag MdBs. For other levels, show the D-07 fallback message.
**Warning signs:** `politician.address` field is undefined in API response (because it doesn't exist).

### Pitfall 3: audio/webm Without Filename Causes Whisper 400 Error
**What goes wrong:** Sending a raw Blob to Whisper without a filename causes "Unrecognized file format" error.
**Why it happens:** Whisper infers format from the filename extension. A blob without a name has no extension.
**How to avoid:** Always wrap the blob in a `File` object with an explicit name: `new File([blob], "recording.webm", { type: "audio/webm" })` before sending to Whisper.
**Warning signs:** Whisper returns HTTP 400 with "Unrecognized file format".

### Pitfall 4: Server Action File Upload Issues
**What goes wrong:** Uploading audio as a FormData Blob to a Server Action triggers "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream" error.
**Why it happens:** Server Actions serialize arguments through React's action boundary, which doesn't support arbitrary Blob objects cleanly.
**How to avoid:** Use a **Route Handler** (`/api/transcribe/route.ts`) for audio file upload, not a Server Action. Route Handlers handle `req.formData()` natively.
**Warning signs:** Server Action throws serialization errors on Blob/File objects.

### Pitfall 5: Vercel Hobby 10-Second Timeout
**What goes wrong:** Mistral generation + moderation chain exceeds 10 seconds on slow requests.
**Why it happens:** Mistral inference for ~250 words takes 3-8 seconds; adding two moderation API calls adds ~0.5s each.
**How to avoid:** Total expected time is ~5-9 seconds — borderline. Add `export const runtime = 'edge'` to the generation Server Action if timeouts occur. Edge runtime starts streaming within 25 seconds and runs up to 300 seconds.
**Warning signs:** Vercel logs show `FUNCTION_INVOCATION_TIMEOUT`.

### Pitfall 6: recordrtc SSR Crash
**What goes wrong:** Importing `recordrtc` in a Server Component or at module top level crashes during Next.js SSR because `navigator` doesn't exist on the server.
**Why it happens:** recordrtc accesses browser APIs at import time.
**How to avoid:** The surv.ai `AudioRecorder` already handles this with a `loadRecordRTC()` lazy import. Copy the class as-is (don't use `import RecordRTC from 'recordrtc'` at module level). Mark the `VoiceRecorder` component `"use client"`.
**Warning signs:** `ReferenceError: navigator is not defined` during build or SSR.

### Pitfall 7: PLZ Multi-Wahlkreis Edge Cases
**What goes wrong:** Some German PLZ codes span 2-3 Wahlkreise (especially in dense urban areas like Hamburg, Berlin, München). The code must handle arrays of `wahlkreisId`, not scalars.
**Why it happens:** The Bundeswahlleiter CSV maps PLZ to Wahlkreis by area, not by centroid. A PLZ can straddle a Wahlkreis boundary.
**How to avoid:** Always treat `wahlkreisIds` as an array. If `length > 1`, trigger D-09 disambiguation. If `length === 0`, the PLZ is invalid or unmatched — return a user-facing error.
**Warning signs:** Politician selection UI not shown even when it should be; or letter addressed to wrong politician.

### Pitfall 8: Gendergerechte Sprache in AI Output
**What goes wrong:** Mistral sometimes defaults to gender-neutral German with Sternchen (Bürger*innen) despite instructions.
**Why it happens:** Mistral's training data includes a lot of German gender-neutral text.
**How to avoid:** Explicitly instruct in the system prompt: "Verwende KEINE Genderzeichen (kein Sternchen *, kein Doppelpunkt :, kein Binnen-I). Schreibe geschlechtsneutral durch Umformulierung (z.B. 'Bürgerinnen und Bürger' oder 'Bevölkerung')."
**Warning signs:** Output contains `*`, `:` in gender contexts, or `Bürger:innen`.

---

## Abgeordnetenwatch API: Confirmed Working Endpoints

[VERIFIED: live API calls 2026-04-13]

```
# List all current Bundestag MdBs (parliament_period=161)
GET https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates?parliament_period=161&range_end=100

# Get specific MdB by candidacy_mandate ID
GET https://www.abgeordnetenwatch.de/api/v2/candidacies-mandates/{id}

# Get politician details (name, party, title)
GET https://www.abgeordnetenwatch.de/api/v2/politicians/{id}

# Response structure (candidacy_mandate):
{
  "id": 69047,
  "type": "mandate",
  "politician": { "id": 184332, "label": "Mayra Vriesema" },
  "electoral_data": {
    "constituency": { "id": 14137, "label": "231 - Amberg (Bundestag 2025 - 2029)" }
  },
  "fraction_membership": [{ "fraction": { "label": "BÜNDNIS 90/DIE GRÜNEN (Bundestag 2025 - 2029)" } }]
}

# Politician entity: has first_name, last_name, field_title (academic), party, residence
# DOES NOT HAVE: postal address, constituency office address, email
```

Total current MdBs in parliament_period=161: **630** [VERIFIED: `meta.result.total: 630`]

---

## Environment Availability

All dependencies for Phase 2 are available via npm — no external service prerequisites beyond API keys.

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Node.js 20 | Next.js 16 Server Actions | Vercel: ✓ | Vercel Hobby uses Node 20 by default |
| MISTRAL_API_KEY | Letter generation | Must provision | Create at console.mistral.ai; free tier available |
| OPENAI_API_KEY | Whisper + Moderation | Existing | Thomas has existing key |
| `@mistralai/mistralai` npm | Mistral SDK | ✓ (installable) | v2.2.0, ESM-only |
| `openai` npm | Whisper + Moderation | ✓ (installable) | v6.34.0 |
| `recordrtc` npm | Audio recording | ✓ (installable) | v5.6.2 |
| Browser MediaRecorder API | Voice recording UI | ✓ (browser) | Firefox + Safari + Chrome all support it |
| `data/plz-wahlkreis-mapping.json` | PLZ lookup (POLI-01) | Phase 1 output | Must exist before Phase 2 executes |
| `data/politicians-cache.json` | Politician lookup (POLI-02) | Phase 1 output | Must exist; must use parliament_period=161 |

**Blocking dependency:** Phase 2 cannot execute without Phase 1's data files. If Phase 1 has not been executed, the plan must include a Wave 0 step to verify these files exist and are non-empty.

**New API key required:** `MISTRAL_API_KEY` must be provisioned and added to Vercel environment variables before deployment. Add to `.env.local` for development.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `mistral-small-latest` produces acceptable German formal letter quality | Standard Stack / Model Selection | Letter quality insufficient → upgrade to `mistral-large-latest` (no code change, 10x cost increase) |
| A2 | PLZ → Wahlkreis data in `data/plz-wahlkreis-mapping.json` is indexed by PLZ string (e.g., `"10115": [1, 2]`) | Pattern 3 (PLZ Lookup) | Different format → adjust lookup function |
| A3 | `data/politicians-cache.json` structure includes `wahlkreisId` field for Bundestag politicians | Pattern 3 (PLZ Lookup) | Phase 1 cache schema differs → adjust lookup join logic |
| A4 | Vercel Hobby 10-second timeout is sufficient for moderation (×2) + Mistral generation chain | Pitfall 5 | Timeouts in production → add `export const runtime = 'edge'` |
| A5 | Phase 1 data files use parliament_period=161 (not 111) | Pitfall 1 | Stale data → Phase 2 plan must verify or rebuild cache |
| A6 | Mistral returns valid JSON when `responseFormat: { type: "json_object" }` is set | Pattern 5 | Malformed JSON → wrap in try/catch, retry with explicit JSON instruction |
| A7 | `zod` v3.x is stable enough for production use | Standard Stack | Zod v4 has breaking changes (but v4 is still beta — low risk) |

---

## Open Questions

1. **Phase 1 completion status**
   - What we know: Phase 1 is "not started" per STATE.md. Data files don't exist yet.
   - What's unclear: Will Phase 1 be executed before Phase 2? The plan must enforce this dependency.
   - Recommendation: Add an explicit Wave 0 check: verify `data/plz-wahlkreis-mapping.json` and `data/politicians-cache.json` exist and use parliament_period=161.

2. **D-14 Scope conflict: Email in Phase 2 or Phase 3?**
   - What we know: Email sending is trivially addable (Resend free tier, 30 min of work). But CONTEXT.md marks it as Phase 3.
   - What's unclear: Thomas wants "Wir schicken dir den Brief per Mail zu" on the success page. Phase 2 can't fulfill that promise without email.
   - Recommendation: Plan should include the Resend decision as the first Wave 0 task (install + wire basic email send). If Thomas confirms, pull MAIL-01 into Phase 2. This research cannot lock that decision — it needs user confirmation.

3. **Landtag and Kommune politician data**
   - What we know: `data/politicians-cache.json` is supposed to include all 3 levels. Landtag and Kommune data availability is fragmentary.
   - What's unclear: What exactly Phase 1 managed to cache for non-Bundestag levels.
   - Recommendation: Phase 2 plan must implement D-07 (transparent fallback message) for levels with no data. Do not generate a letter for a politician the system cannot identify.

4. **Mistral JSON structured output reliability**
   - What we know: Mistral supports `responseFormat: { type: "json_object" }` similar to OpenAI.
   - What's unclear: Reliability of JSON output for German-language generation (occasional non-JSON preamble in LLM outputs is a known failure mode).
   - Recommendation: Wrap JSON.parse in try/catch. If parse fails, extract JSON with a regex (`/{[\s\S]*}/`) as fallback. If both fail, return an error to the user.

---

## Sources

### Primary (HIGH confidence)
- Abgeordnetenwatch API v2 — live calls confirmed parliament_period=161, politician entity schema, candidacy_mandate schema, absence of postal address field [VERIFIED: 2026-04-13]
- Bundestag XML API `https://www.bundestag.de/xml/v2/mdb/index.xml` — confirmed presence of mdbID, mdbWahlkreis, mdbFraktion fields; confirmed absence of individual postal addresses [VERIFIED: 2026-04-13]
- OpenAI Moderation API docs — `omni-moderation-latest`, 13 categories, free, `POST /v1/moderations` [CITED: developers.openai.com/api/docs/guides/moderation]
- OpenAI SDK v6.34.0 — `audio.transcriptions.create`, webm format supported, `language: "de"` parameter [VERIFIED: npm registry]
- `@mistralai/mistralai` v2.2.0 — `mistral.chat.complete()`, `mistral.chat.stream()`, ESM-only [VERIFIED: npm registry + GitHub mistralai/client-ts]
- Mistral API docs — `POST /v1/chat/completions`, `@mistralai/mistralai` SDK usage [CITED: docs.mistral.ai/api]
- Next.js 16.2.3 Streaming guide — Route Handler streaming pattern, Suspense, streaming duration limits [CITED: nextjs.org/docs/app/guides/streaming]
- surv.ai `RecordingInterface.tsx` and `recorder.ts` — `AudioRecorder` class, `RecorderState`, `classifyMediaError`, recordrtc dependency [VERIFIED: read source files directly]
- Vercel Hobby plan limits — 10s serverless, Edge Runtime up to 300s streaming [CITED: vercel.com/docs/functions/limitations]

### Secondary (MEDIUM confidence)
- Mistral pricing `mistral-small-latest` ~$0.20/$0.60/M tokens, `mistral-large-latest` ~$2.00/$6.00/M tokens [CITED: burnwise.io/ai-pricing/mistral + pricepertoken.com — cross-referenced 2026]
- Mistral multilingual German quality — European language formal writing confirmed, formal register default [CITED: local-ai-zone.github.io/brands/mistral-ai-european-excellence-guide-2025]
- OpenAI Moderation API German support — 42% multilingual improvement, German accuracy confirmed [CITED: WebSearch results citing OpenAI official announcement]
- Next.js Server Actions file upload — Route Handler recommended over Server Action for file/Blob uploads [CITED: GitHub vercel/next.js discussions #50358, #67683]

### Tertiary (LOW confidence)
- Exact Mistral system prompt structure for JSON structured output in German — standard pattern inferred from docs + training knowledge [ASSUMED]
- `process.cwd()` resolves to `web/` in Vercel serverless for `fs.readFileSync` of data files [ASSUMED — standard Next.js pattern]

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all npm versions verified, API endpoints live-tested
- Architecture: MEDIUM-HIGH — patterns are standard Next.js App Router; exact Mistral output reliability is MEDIUM
- Pitfalls: HIGH — most are verified via API calls or official docs; Mistral JSON reliability is training-data informed
- Abgeordnetenwatch schema: HIGH — live API calls confirmed all field presence/absence claims

**Research date:** 2026-04-13
**Valid until:** 2026-07-13 (90 days — Mistral model IDs and pricing change more frequently; verify before Phase 2 execution)

---

## RESEARCH COMPLETE
