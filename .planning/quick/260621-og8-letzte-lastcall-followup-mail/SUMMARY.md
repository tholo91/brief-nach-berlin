---
quick_id: 260621-og8
slug: letzte-lastcall-followup-mail
date: 2026-06-21
status: complete
---

# Summary: Dritte/letzte Follow-up-Mail (Last-Call)

## Erstellt

- `web/src/lib/email/buildLastcallHtml.ts` — Last-Call-Template. Betreff "Brief aus Berlin?", Preview "Kurze Nachfrage, kein Newsletter". Zwei zentrierte CTA-Buttons (🎙️ heyspeak-Sprachnachricht + ✉️ Mail-Antwort), die auf Mobile (<=480px) untereinander stacken. Share-Reihe WhatsApp/Telegram/Instagram/E-Mail wie in der Letter-Mail. Footer prominent: allerletzte Mail, kein Newsletter, nichts gespeichert. Exportiert `buildLastcallHtml({ baseUrl? }) => { subject, html, text }`, kein Feedback-Token.
- `web/scripts/send-lastcall-followup.ts` — Versand-Script. Klon von send-backlog-followup.ts, ohne Token-Signierung und ohne Supabase-Dedup. Neues `--exclude=PATH` (Ausschluss-CSV der schon Angeschriebenen). Brevo-Tag `followup-3m`. Dry-Run an thomas@visualmakers.de, Confirm-Prompt, Throttle 300 ms, 500er-Schutz + `--allow-large`.
- `~/.claude/skills/send-lastcall-batch/SKILL.md` — Operator-Skill: Quell-CSV exportieren → Ausschluss-CSV exportieren → Dry-Run → echter Versand.

## Verifiziert

- Template rendert (smoke via tsx): heyspeak-Link vorhanden, kein Em-Dash, alle 4 Share-Icons, beide CTAs.
- tsc: keine Fehler in den neuen Dateien (nur vorbestehende `.next/types/* 2.ts` Duplikat-Artefakte).

## Offen / nächster Schritt

- Vor erstem Echtversand: Dry-Run-Mail visuell in Thomas' Client prüfen.
- Heyspeak-Prompt auf der Sprach-Seite setzen (Vorschlag: "Hat sich dein MdB gemeldet? Wie ging es dir mit deinem Brief nach Berlin? Erzähl einfach drauflos, ich höre dir zu. Es gibt kein richtig oder falsch.").
- Optional: Bild "Antwort/Nachhall" generieren und als Header-Watermark einbauen (aktuell ohne Watermark-Bild, anders als Mail 2).
