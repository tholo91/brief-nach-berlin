# Brief nach Berlin

## What This Is

A web app that helps people move from political frustration to a first concrete democratic action. Users describe their issue (text or voice), enter their postal code, and the platform uses AI to draft a personal letter addressed to the right representative — Bundestag, Landtag, or municipal level. The user then reviews, personalizes, handwrites, and mails the letter themselves.

Brief-nach-Berlin removes a concrete research and writing barrier. It does not remove the person's own opinion, responsibility, or decision to act. The letter is a possible first step when a larger action feels too difficult, not a complete platform for every form of democratic participation.

## Core Value

A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required. Brief-nach-Berlin helps people move from political powerlessness into action by removing the excuse that finding the address and writing the letter takes too much time.

### Positioning by audience

- **Default:** A first, concrete step into political action.
- **Deeper explanation:** A small action that can strengthen democratic self-efficacy, without promising a guaranteed response or political outcome.
- **Media and podcast CTA:** After a political article, podcast, or video, Brief-nach-Berlin offers a practical next step for people who do not want to stop at frustration or agreement.

### Product guardrails

- No automatic mass mailing and no generated message flood.
- The AI produces a draft; the person must decide whether to use it, adapt it, handwrite it, and send it.
- Correct political responsibility and personal relevance matter more than volume.
- Do not promise a reply, individual processing, or policy change.
- Open source is a trust and adaptation layer: the pattern can be adapted to other countries, while political data and responsibility rules remain local.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page that explains the concept and captures interest
- [ ] Text input for describing a frustration/issue
- [ ] Voice input (speech-to-text) for describing a frustration
- [ ] PLZ input with validation (German postal codes only)
- [ ] Politician lookup: PLZ → Wahlkreis → responsible MdB (Bundestag)
- [ ] Politician lookup: PLZ → responsible MdL (Landtag)
- [ ] Politician lookup: PLZ → Kommune (where data available)
- [ ] AI-powered letter generation (formal, personal, 1-page handwriting length)
- [ ] AI determines which political level is primarily responsible
- [ ] Letter display with politician name, address, and instructions
- [ ] Optional personal context to strengthen the letter (profession, affiliations, how personally affected) — presented as optional "Brief verstärken" step after first draft
- [ ] Legal disclaimer under generated letter: "KI-gestützter Formulierungsvorschlag — bitte vor dem Versand prüfen und personalisieren"
- [ ] AI neutrality: system prompt must produce sachlich-bürgerlich tone, no political bias, no activism — test with issues across the political spectrum
- [ ] Gender-neutral language throughout (neutral formulations like "Abgeordnete", "Ihr Bundestagsbüro" — no Gendersternchen/Doppelpunkt/Binnen-I)
- [ ] Optional email collection to send the letter draft
- [ ] Post-flow user feedback collection (via surv.ai link) — **backlog 999.1**, post-launch
- [ ] Mobile-responsive design

### Out of Scope

- EU Parliament / Brussels — v2 (teased but not built in v1)
- User accounts / login — unnecessary friction for v1
- Auto-pen / physical mail sending — requires partner integration (Pensaki), v2+
- Photo upload as input — adds complexity, text + voice sufficient for v1
- Payment / donations — v1 is completely free, validate first
- Real-time politician data updates — static/periodic refresh sufficient
- Multiple language support — German only for v1

## Context

- **Founder insight:** Thomas did a Bundestag internship and saw firsthand that personal letters stand out among institutional communications. The project started with a smaller question: how could he remove his mother's excuse not to write to her political representative when she was frustrated with politics?
- **Political science background:** Research connects political self-efficacy and participation, and suggests that concrete, planned actions are more useful for activation than general encouragement. Evidence for the specific effect of an individual handwritten letter remains limited.
- **Market gap:** No tool in Germany combines AI drafting + PLZ-to-politician matching + handwritten letter focus. Closest tools (Abgeordnetenwatch, Resistbot US) do different things
- **Key data sources:** Abgeordnetenwatch API (free, CC0), Bundeswahlleiter open data for PLZ-to-Wahlkreis mapping
- **Market research:** Completed (see MARKET-RESEARCH.md) — competitive gap is wide open. The product's strongest defensible claim is lowered friction for a real personal action, not guaranteed political effectiveness of handwriting.
- **Visual direction:** Ghibli-style solarpunk Berlin aesthetic chosen for hero imagery (see prompts/)
- **Technical challenge:** PLZ-to-Wahlkreis mapping is non-trivial — postal codes don't align with electoral district boundaries

## Constraints

- **Budget**: Zero/minimal — free tiers only (Vercel free, OpenAI API pay-per-use via Thomas's existing key)
- **Stack**: Next.js on Vercel for hosting, OpenAI API for letter generation, Abgeordnetenwatch API for politician data
- **Frontend**: Landing page built in Lovable first (beautiful UI fast), exported to GitHub, then extended with Claude Code
- **Data privacy**: DSGVO-compliant — minimal data collection, no accounts, no persistent storage of user data in v1
- **Language**: German-only UI and letter output
- **Domain**: brief-nach-berlin.de is available (as of 2026-04-10)
- **Letter format**: ~200-280 words (1 handwritten page), flowing prose, personal but formal tone
- **Tone/language**: Gender-neutral without gendering (no *, :, Binnen-I). Sachlich-bürgerlich, not activist. AI must not impose political direction — the user's concern drives the letter, not the model's tendencies.
- **Legal**: Generated letters are explicitly marked as "Formulierungsvorschlag" — no legal advice, no implied authority

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js directly (skip Lovable) | Existing Next.js app in /web already has landing page structure. Lovable exports Vite, not Next.js — migration overhead not worth it. | ✓ Good |
| OpenAI API over Claude API for letter generation | Thomas has existing OpenAI API key, cost matters | — Pending |
| No user accounts in v1 | Zero friction > feature completeness. Optional email only. | — Pending |
| Handwrite-and-mail-yourself (no auto-pen in v1) | Keeps the human decision and effort in the loop. The draft is a starting point, not an automatically dispatched message. Auto-pen is v2 with Pensaki. | — Pending |
| Free with no donations in v1 | Pure validation — don't let monetization distract from learning | — Pending |
| Bundestag + Landtag + Kommune in v1, EU in v2 | Good German coverage without EU API complexity. Tease Brussels. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 after initialization*
