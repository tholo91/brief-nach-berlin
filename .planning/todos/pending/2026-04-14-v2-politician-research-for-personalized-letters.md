---
created: "2026-04-14T09:18:20.664Z"
title: "v2: Politician research for personalized letters"
area: api
files:
  - web/src/lib/generation/generateLetter.ts
  - web/src/lib/actions/submitWizard.ts
---

## Problem

The current letter generation only knows the politician's name, party, and Wahlkreis. It cannot reference their committee memberships, voting behavior, public statements, or specific policy positions. This makes letters generic — a letter to a Grüne MdB reads the same as one to a CDU MdB on the same topic.

## Solution

After determining which politician to address (post-Wahlkreis lookup), do a short research step:
1. Fetch additional data from Abgeordnetenwatch API: committee memberships, recent votes, profile URL
2. Optionally: use Mistral/web search to find 1-2 recent public statements on the topic area
3. Pass this context to the letter generation prompt so Mistral can reference specific positions

Implementation options:
- **Lightweight (v2a):** Expand cached Abgeordnetenwatch data to include committee memberships. Pass to prompt. No live lookup.
- **Full (v2b):** Add a research step between politician selection and letter generation that queries Abgeordnetenwatch API live + optional web search. Higher latency but much more personalized.

Latency budget: current generation is ~3-8s. Research step should add max 2-3s. Consider parallel fetch.
