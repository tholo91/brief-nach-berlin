---
quick_id: 260621-og8
slug: letzte-lastcall-followup-mail
date: 2026-06-21
---

# Quick Task: Dritte/letzte Follow-up-Mail (Last-Call)

Dritte und letzte Follow-up-Mail (~2-3 Monate nach Briefversand) für Brief nach Berlin. Fragt aus Neugier, ob das MdB reagiert hat, lädt zum Story-Teilen (heyspeak-Sprachnachricht oder Mail-Antwort) und zum Weitersagen ein. Manueller Versand via Brevo, Dedup über Brevo-Tag `followup-3m` + Ausschluss-CSV (keine DB).

## Aufgaben

1. `web/src/lib/email/buildLastcallHtml.ts` — Template (Klon von buildFollowupHtml.ts), zwei CTA-Buttons statt Star-Bar, prominenter Abschluss-Hinweis im Footer. Kein Feedback-Token.
2. `web/scripts/send-lastcall-followup.ts` — Versand-Script (Klon von send-backlog-followup.ts), ohne Token/Supabase, neues `--exclude`-Flag, Tag `followup-3m`.
3. `~/.claude/skills/send-lastcall-batch/SKILL.md` — Operator-Skill, führt durch Export → Dry-Run → Versand.

## Constraints

- Keine neue Dependency (Brevo via fetch, csv-parse).
- Alles German UI/Copy, kein Em-Dash.
- Copy von Thomas final abgenommen (Betreff "Brief aus Berlin?", heyspeak-Link, ohne "ohnmächtig fühlen").
