# Brief nach Berlin

## What This Is

A web app that turns citizens' frustrations into effective, personalized letters to the politicians responsible. Users describe their issue (text or voice), enter their postal code, and the platform uses AI to draft a formal letter addressed to the right representative — Bundestag, Landtag, or municipal level. The user then handwrites and mails the letter themselves. The core insight: handwritten letters actually get read and discussed in the Bundestag, unlike emails or petitions.

## Core Value

A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.

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
- [ ] Optional email collection to send the letter draft
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

- **Founder insight:** Thomas did a Bundestag internship and saw firsthand that handwritten letters are read, discussed, and tracked internally — unlike mass emails or petitions
- **Political science background:** Responsiveness research confirms direct citizen contact is the most effective influence channel
- **Market gap:** No tool in Germany combines AI drafting + PLZ-to-politician matching + handwritten letter focus. Closest tools (Abgeordnetenwatch, Resistbot US) do different things
- **Key data sources:** Abgeordnetenwatch API (free, CC0), Bundeswahlleiter open data for PLZ-to-Wahlkreis mapping
- **Market research:** Completed (see MARKET-RESEARCH.md) — competitive gap is wide open, strong evidence for handwritten letter effectiveness
- **Visual direction:** Ghibli-style solarpunk Berlin aesthetic chosen for hero imagery (see prompts/)
- **Technical challenge:** PLZ-to-Wahlkreis mapping is non-trivial — postal codes don't align with electoral district boundaries

## Constraints

- **Budget**: Zero/minimal — free tiers only (Vercel free, OpenAI API pay-per-use via Thomas's existing key)
- **Stack**: Next.js on Vercel for hosting, OpenAI API for letter generation, Abgeordnetenwatch API for politician data
- **Frontend**: Landing page built in Lovable first (beautiful UI fast), exported to GitHub, then extended with Claude Code
- **Data privacy**: DSGVO-compliant — minimal data collection, no accounts, no persistent storage of user data in v1
- **Language**: German-only UI and letter output
- **Letter format**: ~200-280 words (1 handwritten page), flowing prose, personal but formal tone

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lovable for landing page, Claude Code for backend | Best of both: design quality + full-stack capability. Lovable too expensive for API/AI work. | — Pending |
| OpenAI API over Claude API for letter generation | Thomas has existing OpenAI API key, cost matters | — Pending |
| No user accounts in v1 | Zero friction > feature completeness. Optional email only. | — Pending |
| Handwrite-and-mail-yourself (no auto-pen in v1) | Authenticity + simplicity. Auto-pen is v2 with Pensaki. | — Pending |
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
