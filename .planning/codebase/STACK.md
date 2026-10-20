# Stack (Ist-Stand Oktober 2026)

Quelle für den Stack-Abschnitt in `CLAUDE.md` (GSD `generate-claude-md` liest diese Datei vor `research/STACK.md`). `research/STACK.md` ist die ursprüngliche Recherche vom April 2026 und beschreibt noch OpenAI.

## Technology Stack

| Bereich | Technik | Hinweis |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | App unter `web/`, Befehle immer aus `web/` |
| Styling | Tailwind CSS v4 | kein `tailwind.config.js` |
| KI Text | Mistral (`@mistralai/mistralai`), Modell-IDs zentral in `web/src/lib/mistral.ts` | bewusst europäisch, kein US-Modell, pro Nutzung bezahlt |
| KI Sprache | Voxtral (Mistral) über `web/src/app/api/transcribe/route.ts` | |
| Validierung | Zod 4, react-hook-form | |
| Datenbank | Supabase Postgres, Free-Tarif | nur serverseitig per Service-Role, RLS auf allen Tabellen |
| Migrationen | `web/supabase/migrations/`, von Thomas per SQL-Editor angewendet | Stand in `web/supabase/MIGRATION_STATUS.md` |
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
