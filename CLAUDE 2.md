<!-- GSD:project-start source:PROJECT.md -->
## Project

**Brief nach Berlin**

A web app that turns citizens' frustrations into effective, personalized letters to the politicians responsible. Users describe their issue (text or voice), enter their postal code, and the platform uses AI to draft a formal letter addressed to the right representative — Bundestag, Landtag, or municipal level. The user then handwrites and mails the letter themselves. The core insight: handwritten letters actually get read and discussed in the Bundestag, unlike emails or petitions.

**Core Value:** A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.

### Constraints

- **Budget**: Zero/minimal — free tiers only (Vercel free, OpenAI API pay-per-use via Thomas's existing key)
- **Stack**: Next.js on Vercel for hosting, OpenAI API for letter generation, Abgeordnetenwatch API for politician data
- **Frontend**: Landing page built in Lovable first (beautiful UI fast), exported to GitHub, then extended with Claude Code
- **Data privacy**: DSGVO-compliant — minimal data collection, no accounts, no persistent storage of user data in v1
- **Language**: German-only UI and letter output
- **Domain**: brief-nach-berlin.de is available (as of 2026-04-10)
- **Letter format**: ~200-280 words (1 handwritten page), flowing prose, personal but formal tone
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2 | Full-stack React framework | Constrained by project: Vercel-native, App Router is stable, Server Actions eliminate separate API routes, RSC reduces JS bundle. Latest stable as of April 2026. |
| TypeScript | 5.x (bundled with Next.js) | Type safety across full stack | Non-negotiable for an app touching external APIs (Abgeordnetenwatch, OpenAI) — runtime errors on politician data structures are a liability. |
| Tailwind CSS | v4 | Utility-first styling | Ships with modern Next.js starters, Lovable exports it, shadcn/ui is built on it. v4 no longer needs a config file. |
| shadcn/ui | latest (CLI-based, not versioned) | Component primitives | Lovable already generates these; extending the codebase with Claude Code means no component library switch. Copy-paste components stay fully owned. |
| OpenAI SDK (openai) | 6.34.0 | Letter generation + Whisper STT | Thomas has an existing key. Single SDK covers both chat completions and Whisper transcription. Streaming support is first-class. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | ^3.24 | Runtime validation of PLZ input, API responses, form data | Use for ALL external data: PLZ validation, Abgeordnetenwatch API responses, OpenAI output schema. Server Actions validate with Zod server-side. |
| react-hook-form | ^7.54 | Client-side form state for PLZ + text input | Pairs with Zod via `@hookform/resolvers`. Gives instant PLZ feedback before hitting the server. |
| @hookform/resolvers | ^3.10 | Bridge between react-hook-form and Zod schemas | Required whenever react-hook-form + Zod are combined. |
| swr | ^2.3 | Client-side data fetching for politician lookup results | Lightweight, built for Next.js. Only needed if politician lookup becomes async/cached client-side. |
| csv-parse | ^5.6 | Parse Bundeswahlleiter PLZ→Wahlkreis CSV at build time | The PLZ-Wahlkreis mapping is a static CSV file from Bundeswahlleiterin.de — parse it at build time into a lookup table, not at runtime. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev server bundler (built into Next.js 16) | Enabled by default with `next dev --turbopack`. ~400% faster startup vs Webpack. No config needed. |
| ESLint (next/eslint) | Linting | Ships with `create-next-app`. Use `next lint`. |
| Prettier | Formatting | Add with `prettier` + `eslint-config-prettier` to avoid conflicts. |
| Vercel CLI | Local preview + deployment | `vercel dev` mirrors edge/serverless behavior locally — important for testing OpenAI API routes. |
## Installation
# Create the project (if starting fresh, not from Lovable export)
# Core dependencies
# SWR (add only if async politician fetch is needed client-side)
# Dev dependencies
# Option 1: Manual migration per Next.js official guide
# https://nextjs.org/docs/app/guides/migrating/from-vite
# Rename src/main.tsx → remove, create app/layout.tsx + app/page.tsx
# Replace react-router-dom routes with app/ directory routing
# Option 2: Use automated migration script
# https://github.com/sergust/lovable-vite-nextjs-migration
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| OpenAI Whisper API ($0.006/min) | Web Speech API (browser-native, free) | Use Web Speech API ONLY as progressive enhancement for Chrome/Edge desktop users. Do NOT rely on it as the primary path — Firefox has zero support, Safari is partial, Android Chrome is unreliable. Whisper via API works everywhere. |
| Web Speech API as enhancement | Picovoice Web SDK | If cross-browser on-device STT becomes a hard requirement. Adds SDK cost and complexity — overkill for v1. |
| CSV parse at build time (Bundeswahlleiter) | Geospatial API / point-in-polygon | PLZ→Wahlkreis mapping via geometry is accurate but massively over-engineered for v1. Bundeswahlleiter provides a PLZ list per Wahlkreis as CSV — parse it statically, ship as JSON lookup table. |
| Abgeordnetenwatch API v2 | Bundestagsverwaltung / Bundestag Open Data API | Abgeordnetenwatch is CC0, has mandate/candidacy endpoints, and is documented. The Bundestag's own API is harder to use and less structured for PLZ-level lookups. |
| shadcn/ui + Tailwind v4 | Mantine, Ant Design, MUI | shadcn/ui is the only component library that matches Lovable's output without a CSS reset war. Mantine/MUI impose their own styles and don't survive Lovable→Claude Code handoff cleanly. |
| Server Actions for form submission | Separate REST API routes (`/api/...`) | Server Actions are simpler for this use case — no fetch boilerplate, no separate route files. REST routes only needed for webhook callbacks or external consumers. |
| Vercel Hobby (free) | Railway, Render, Fly.io | Vercel is the natural host for Next.js. Hobby tier (150k invocations/month, 10s execution limit) is sufficient — each request is short (PLZ lookup ~100ms, OpenAI call ~3-8s). No persistent compute needed. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-speech-recognition` npm library | Wraps Web Speech API — same browser support gap (no Firefox, unreliable mobile). Still calls Chrome's Google server for recognition. Last major update 2022. | OpenAI Whisper API via a Server Action that accepts a recorded audio blob |
| Prisma / Supabase / any database | DSGVO constraint: no persistent user data in v1. A database adds a data retention liability without adding value. | Stateless — all data lives in the browser session and is discarded |
| NextAuth / Clerk | No user accounts in v1. Auth libraries add JWT/session complexity and cookie consent requirements for zero benefit. | No auth at all. Optional email captured via a simple form POST — no session needed. |
| `pages/` directory (Next.js Pages Router) | Pages Router is entering maintenance mode as of Next.js 15+. No new features. | App Router (`app/` directory) — stable, documented, and what Vercel recommends for all new projects |
| `axios` for HTTP | Unnecessary in Next.js 16 — native `fetch` is built into Next.js with caching/revalidation semantics. Axios adds bundle size with no benefit. | Native `fetch` with Next.js cache options |
| Separate OpenAI and Whisper SDKs | The `openai` npm package (v6+) covers both chat completions AND audio transcription under one client. | Single `openai` package, one `new OpenAI()` instance |
## Stack Patterns by Variant
- Parse Bundeswahlleiter CSV at build time into a static `wahlkreis-plz.json` lookup
- Call Abgeordnetenwatch `GET /api/v2/candidacies-mandates?parliament_period=111&electoral_district=<id>` with the resolved Wahlkreis ID
- Cache Abgeordnetenwatch responses at the edge (Vercel edge cache) — politician data changes rarely
- Note: PLZ boundaries don't align with Wahlkreis boundaries 1:1. Some PLZ spans multiple Wahlkreise. Strategy: show all matching MdBs, let user select if ambiguous.
- Primary: Record audio blob client-side using `MediaRecorder` API (supported in all modern browsers including Firefox/Safari)
- Upload blob to a Next.js Server Action → pipe to OpenAI Whisper API (`audio.transcriptions.create`)
- Secondary/enhancement: Offer Web Speech API for Chrome/Edge desktop as real-time preview while recording
- Fallback: Text input always available — voice is additive, not required
- Call `openai.chat.completions.create` with a system prompt defining format, tone, and German formality (Sie-Form)
- Stream the response with `stream: true` and use Next.js streaming response to show the letter being typed in real-time
- Target: gpt-4o-mini for cost (sufficient for structured letter drafting). Escalate to gpt-4o only if quality is poor.
- No cookies beyond session (none needed — no auth, no tracking in v1)
- No analytics in v1 (skip Vercel Analytics, Plausible, GA — nothing to justify data collection before validation)
- Optional email: captured server-side, logged to a simple CSV/email notification — do NOT store in a database
- Input text and generated letter: never persisted to any storage
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.2 | react@19, react-dom@19 | React 19 is the default with Next.js 16. Required for Server Actions stability. |
| tailwindcss@4 | next@15+ | Tailwind v4 uses CSS-first config. No `tailwind.config.js` needed. Breaking change from v3 — don't mix v3 config with v4 installs. |
| shadcn/ui (CLI) | tailwindcss@4, next@16 | shadcn/ui CLI updated for Tailwind v4 in early 2025. Use `npx shadcn@latest init` — older `npx shadcn-ui@latest` is deprecated. |
| openai@6.x | node@18+ | Node 18 is minimum. Vercel Hobby uses Node 20 by default. |
| zod@3.x | TypeScript 5.x | Zod v4 is in beta as of early 2026. Stick to v3.x for stability — v4 has breaking changes to the `.parse` API. |
## Sources
- Next.js official docs: https://nextjs.org/docs/app — App Router is stable, Pages Router in maintenance mode (HIGH confidence)
- Next.js 16.2 release notes: https://nextjs.org/blog/next-16-1 — version confirmation (HIGH confidence)
- Vercel Hobby plan limits: https://vercel.com/docs/plans/hobby — 150k invocations, 10s execution limit (HIGH confidence)
- OpenAI npm registry: https://www.npmjs.com/package/openai — v6.34.0 latest (HIGH confidence)
- OpenAI Whisper pricing: https://developers.openai.com/api/docs/pricing — $0.006/min, German language supported (HIGH confidence)
- Abgeordnetenwatch API: https://www.abgeordnetenwatch.de/api — v2 endpoints confirmed, CC0 license, NO native PLZ endpoint (MEDIUM confidence — PLZ→Wahlkreis must be resolved separately)
- Bundeswahlleiterin open data: https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html — CSV files available for 2025 Wahlkreise (MEDIUM confidence — format needs validation)
- Web Speech API browser support: https://caniuse.com/speech-recognition — Chrome/Edge only, no Firefox (HIGH confidence)
- Lovable tech stack: https://lovable.dev/faq/capabilities/tech-stack/lovable-tech-stack — exports Vite + React, NOT Next.js (HIGH confidence — requires migration step)
- Vite→Next.js migration guide: https://nextjs.org/docs/app/guides/migrating/from-vite (HIGH confidence)
- Tailwind v4 + shadcn/ui compatibility: https://ui.shadcn.com/docs/tailwind-v4 (HIGH confidence)
- Zod v3 stability recommendation: training data + WebSearch corroboration that v4 is still in beta (MEDIUM confidence)
## Critical Discovery: Lovable Exports Vite, Not Next.js
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
