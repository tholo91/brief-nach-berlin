<!-- GSD:project-start source:PROJECT.md -->
## Project

**Brief nach Berlin**

A web app that turns citizens' frustrations into effective, personalized letters to the politicians responsible. Users describe their issue (text or voice), enter their postal code, and the platform uses AI to draft a formal letter addressed to the right representative — Bundestag, Landtag, or municipal level. The user then handwrites and mails the letter themselves. The core insight: handwritten letters actually get read and discussed in the Bundestag, unlike emails or petitions.

**Core Value:** A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.

### Constraints

- **Budget**: Lean and cost-aware: Vercel (paid plan) and Brevo are paid, Mistral is pay-per-use, Supabase stays on the free tier as long as possible
- **Stack**: Next.js on Vercel, Mistral for letter generation and Voxtral for transcription (deliberately European, no US model), Supabase Postgres, Brevo for email, Abgeordnetenwatch API for politician data
- **Frontend**: Landing page built in Lovable first (beautiful UI fast), exported to GitHub, then extended with Claude Code
- **Data privacy**: DSGVO-compliant — minimal data collection, no accounts, no persistent storage of user data in v1
- **Language**: German-only UI and letter output
- **Domain**: brief-nach-berlin.de is available (as of 2026-04-10)
- **Letter format**: ~200-280 words (1 handwritten page), flowing prose, personal but formal tone
<!-- GSD:project-end -->

## Bauprinzipien

In `CLAUDE.md` und `AGENTS.md` identisch halten.

- **Lean und nachhaltig bauen.** Die einfachste Lösung, die das echte Problem der Nutzer:innen löst. Keine komplexen Funktionen, die jeden denkbaren Edge Case abdecken. Seltene Fälle lieber sauber scheitern lassen (klare Meldung, erneut versuchen möglich), statt Sonderlogik zu bauen.
- **Nur das Wichtigste shippen.** Vor jedem Fix fragen: Merken echte Nutzer:innen es, kostet es Geld, oder geht es um Recht und Datenschutz? Wenn nein, notieren statt bauen. Review-Funde und Kleinigkeiten nicht automatisch abarbeiten: erst den Einfluss auf Nutzer:innen einschätzen und Thomas aktiv bremsen, wenn es Richtung Perfektionieren geht. Nachhaltig heißt sauber gebaut, nicht vollständig.
- **Erweitern statt kopieren.** Vor neuer Logik prüfen, ob es sie schon gibt (z. B. Rate-Limit, Token, Mailversand, Empfänger-Prüfung). Eine bestehende Stelle erweitern, keine zweite Kopie anlegen.
- **Kosten im Blick.** Vercel und Brevo sind bezahlt, Mistral wird pro Nutzung bezahlt. Supabase soll so lange wie möglich im Free-Tarif bleiben: Daten in SQL aggregieren statt alle Zeilen zu laden, keine zusätzlichen Supabase-Dienste ohne Rückfrage.
- **Keine neuen Dienste oder SDKs** ohne Rückfrage bei Thomas.
- **Mistral-Kontingent schonen.** Tests mocken Mistral immer (`@/lib/mistral`). Keine echten `generateLetter`-Aufrufe aus Tests oder Skripten, während Kampagnen laufen: Das Kontingent (15 Anfragen pro Minute für mistral-large) teilt sich mit der Live-Seite.

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

| Bereich | Technik | Hinweis |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | App unter `web/`, Befehle immer aus `web/` |
| Styling | Tailwind CSS v4 | kein `tailwind.config.js` |
| KI Text | Mistral (`@mistralai/mistralai`), Modell-IDs zentral in `web/src/lib/mistral.ts` | bewusst europäisch, kein US-Modell, pro Nutzung bezahlt |
| KI Sprache | Voxtral (Mistral) über `web/src/app/api/transcribe/route.ts` | |
| Validierung | Zod 4, react-hook-form | |
| Datenbank | Supabase Postgres, Free-Tarif | nur serverseitig per Service-Role, RLS auf allen Tabellen |
| Migrationen | `web/supabase/migrations/`, von Thomas per SQL-Editor angewendet | Stand in `web/supabase/MIGRATION_STATUS.md`. Neue Tabelle in `public`: in derselben Migration `REVOKE ALL` von `anon`, `authenticated`, `PUBLIC` und `GRANT` an `service_role` (Supabase vergibt ab 30.10.2026 keine Rechte mehr automatisch, Vorlage: `033_letter_outcomes.sql`) |
| Mails | Brevo (`@getbrevo/brevo`) | bezahlt, kann echte Menschen erreichen |
| Hosting | Vercel, bezahlter Tarif, Region `fra1` | Push auf `main` = Produktion |
| Reichweite | Vercel Analytics, ohne Cookies | Filter in `web/src/components/AnalyticsWrapper.tsx` |
| Politikerdaten | Abgeordnetenwatch API v2, PLZ- und Wahlkreisdaten statisch in `web/data/` | gebaut per Skripte in `web/scripts/` |
| Tests | Jest (`cd web && npx jest`) | Mistral immer mocken (`@/lib/mistral`) |

## Nicht verwenden

| Vermeiden | Warum |
|---|---|
| OpenAI, Whisper oder andere US-Modelle | bewusste Entscheidung für europäische KI |
| Neue Dienste, SDKs oder Bezahl-Add-ons ohne Rückfrage | Kosten und Datenschutz, Thomas entscheidet |
| Accounts oder Auth-Bibliotheken | kein Login, Verwaltung läuft über Token-Links |
| Zusätzliche Supabase-Funktionen (Edge Functions, Realtime, Storage-Ausbau, zweites Projekt) ohne Rückfrage | Supabase soll so lange wie möglich im Free-Tarif bleiben |
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

> Generated by GSD from questionnaire. Run `/gsd-profile-user --refresh` to update.

| Dimension | Rating | Confidence |
|-----------|--------|------------|
| Communication | mixed | LOW |
| Decisions | delegator | MEDIUM |
| Explanations | concise | MEDIUM |
| Debugging | fix-first | MEDIUM |
| UX Philosophy | design-conscious | MEDIUM |
| Vendor Choices | pragmatic-fast | MEDIUM |
| Frustrations | regression | MEDIUM |
| Learning | guided | MEDIUM |

**Directives:**
- **Communication:** Adapt response detail to match the complexity of each request. Brief for simple tasks, detailed for complex ones.
- **Decisions:** Make clear recommendations with confidence. Explain your reasoning briefly, but own the suggestion.
- **Explanations:** Pair code with a brief explanation (1-2 sentences) of the approach. Keep prose minimal.
- **Debugging:** Prioritize the fix. Show the corrected code first, then optionally explain what was wrong. Minimize diagnostic preamble.
- **UX Philosophy:** Invest in UX quality: thoughtful spacing, smooth transitions, responsive layouts. Treat design as a first-class concern.
- **Vendor Choices:** Suggest libraries quickly based on popularity and reliability. Don't over-analyze choices for non-critical dependencies.
- **Frustrations:** Before modifying working code, verify the change is safe. Run existing tests mentally. Flag potential regression risks explicitly.
- **Learning:** Explain concepts in context of the developer's codebase. Use their actual code as examples when teaching.
<!-- GSD:profile-end -->

<!-- code-tasks:agent-front-door -->
## Captured Ideas (Gitty)

Dieses Repo ist mit der Gitty-App für mobiles Task-Capturing verbunden. Captures landen in `captured-ideas-<username>.md`.

**Zu Beginn jeder Session, vor allem anderen:**
1. `git fetch --quiet` ausführen, um den neuesten Stand zu holen, ohne den Working Tree anzufassen.
2. Die frischeste `captured-ideas-*.md` lesen — falls die lokale Kopie veraltet sein könnte, direkt remote: `git show origin/<branch>:captured-ideas-<username>.md`.
3. Dem Header „Instructions for AI Agents" in der Datei folgen: offene `- [ ]` Punkte nach Priorität gruppiert auflisten und auf Anweisung warten. Nicht still ausführen.

