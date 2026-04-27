---
created: 2026-04-27T13:23:32.382Z
title: Success-Page Fire-and-forget Brief-Generierung für schnellere Navigation
area: api
files:
  - web/src/lib/actions/selectPolitician.ts
  - web/src/lib/actions/submitWizard.ts
  - web/src/components/wizard/Step3Success.tsx:215
---

## Problem

Beim Klick auf "Brief erstellen" (Politiker-Auswahl-Seite) wartet der User aktuell 5–10s, bis die nächste Seite erscheint. Grund: `selectPoliticianAction` führt synchron aus:

1. Validation, Rate-Limit, Input-Moderation, PLZ-Lookup, Politiker-Verifikation (~500ms — schnell)
2. `fetchMdbContext` (Abgeordnetenwatch, kann langsam sein)
3. `generateLetter` (Mistral, ~3–8s — Hauptblock)
4. Output-Moderation (~500ms)
5. `sendLetterEmail` läuft schon via `after()` fire-and-forget

Die Success-Page zeigt den Brief gar nicht an (nur "Brief per Mail geschickt", siehe Step3Success.tsx:215). Der Brief lebt ausschließlich in der E-Mail. Daher braucht der User die generierten Daten nicht im Response.

## Solution

Schnelle Pre-Checks synchron behalten, alles Teure in `after()` schieben, sofort returnen + navigieren.

**Synchron behalten (~300–800ms):**
- Validation, Rate-Limit, Input-Moderation, PLZ-Lookup, Politiker-Verifikation

**In `after()` verschieben:**
- `fetchMdbContext`, `generateLetter`, Output-Moderation, `sendLetterEmail`

**Copy-Änderung Step3Success.tsx:215:**
- Alt: "Wir haben dir den Brief per E-Mail geschickt. Schau in dein Postfach."
- Neu: "Dein Brief ist auf dem Weg zu dir! Wir schreiben gerade die letzten Sätze und senden dir den Brief in den nächsten Minuten per E-Mail. Schau in dein Postfach (auch im Spam-Ordner)."

**Trade-offs zu entscheiden vor Umsetzung:**

1. **Output-Moderation-Reject wird unsichtbar** (User sieht Success-Page, aber Mail kommt nie). Mitigation: Fallback-Mail "Brief konnte leider nicht erstellt werden, bitte formuliere anders" einbauen.

2. **"Brief erneut senden"-Feature bricht** (braucht aktuell `letterText` im Client-State). Optionen:
   - (a) Resend-Button entfernen, nur Spam-Hinweis lassen — **empfohlen, einfacher**
   - (b) Kurzlebigen Server-Cache mit Token (1h TTL für DSGVO)

3. **Keine künstliche 3s-Wartezeit einbauen** — wenn Server in 500ms antwortet, sofort navigieren. Fake-Delay würde Geschwindigkeitsgefühl untergraben.

**Alternative verworfen: Streaming** (Brief live auf Success-Page entstehen lassen) wäre schöner UX-Move, lohnt sich aber nur wenn Brief auf Success-Page angezeigt werden soll. Erst mit Nutzern validieren ob sie das vermissen, bevor Streaming geplant wird.
