---
quick_id: 260625-9at
status: complete
date: "2026-06-25"
commit: 6fa05fc
---

# Summary: E-Mail-Adresse aus Hardcoding befreien

## Was wurde gemacht

9 Vorkommen von `thomas_lorenz@posteo.de` im Code durch `process.env.THOMAS_MAIL` ersetzt.

**Änderungen:**
- `contact.ts` — Single Source of Truth: `process.env.THOMAS_MAIL ?? "thomas_lorenz@posteo.de"`
- `config.ts` — `FOUNDER_EMAIL` delegiert jetzt an `CONTACT.email` (kein Duplikat mehr)
- `sendFollowupEmail.ts` — `replyTo` via `FOUNDER_EMAIL`
- `buildLastcallHtml.ts` — 3 Vorkommen (STORY_REPLY_MAILTO, Plaintext, HTML-Footer)
- `buildFollowupHtml.ts` — 2 Vorkommen (Plaintext, HTML-Footer)
- `Step3Success.tsx` — mailto-Link im Error-Fallback
- `.env.example` — `THOMAS_MAIL=` dokumentiert

**Nicht geändert:**
- `datenschutz@brief-nach-berlin.de` bleibt hardkodiert (Datenschutz-Adresse des Projekts, keine persönliche Adresse)
- Kommentar in `PressContactButton.tsx:7` (kein aktiver Code)
- Fallback-String in `contact.ts` (lokale Entwicklung ohne .env.local)

## Deployment

Vercel hat `THOMAS_MAIL` bereits hinterlegt — greift ab dem nächsten Deploy.
