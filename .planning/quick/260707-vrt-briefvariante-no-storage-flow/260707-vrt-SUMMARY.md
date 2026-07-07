---
quick_id: 260707-vrt
status: complete
date: "2026-07-07"
commit: 2e6cc60
---

# Summary: No-Storage-Flow zum Anpassen bestehender Briefentwürfe

## Was wurde gemacht

Ein separater Varianten-Flow wurde umgesetzt, ohne den normalen Erstbrief-Flow zu
verwenden oder den öffentlichen Counter zu erhöhen.

**Änderungen:**
- Mail-Template: CTA "Nicht ganz dein Ton?" direkt unter dem Briefentwurf ergänzt.
- CTA-Link: `/brief/anpassen#email=<encoded-email>`, ohne Brieftext in der URL.
- Neue Seite `/brief/anpassen`: E-Mail-Input, Brief-Textarea, Tonalitätsauswahl,
  optionales Feld "Was soll anders werden?".
- Neue API `/api/generate-letter-variant`: validiert E-Mail und mindestens 500
  Zeichen Brieftext, erzeugt eine Variante und versendet sie.
- Neuer Varianten-Prompt: behandelt Input als bestehenden Brief, erhält Fakten,
  Empfängeranrede, Forderung und Grußformel, fügt keine neuen Fakten hinzu.
- Neue Varianten-Mail mit Brevo-Tag `brief_variant`.
- Neue Success-Seite `/brief/anpassen/erfolg` mit der Copy:
  "Angepasster Brief wurde dir zugeschickt."
- Tests für Varianten-Prompt und E-Mail-CTA ergänzt.

**Nicht geändert:**
- Keine MdB-Auswahl auf der Anpassungsseite.
- Keine Speicherung von Brieftexten in Supabase.
- Kein Brieftext in URL-Parametern.
- Kein Import oder Aufruf von `incrementLetterCounters` im Varianten-Flow.

## Verification

- `npm test -- --runInBand src/__tests__/generateLetterVariantPrompt.test.ts src/__tests__/emailVariantCta.test.ts`
- `npx eslint ...` auf allen geänderten Dateien
- `npm run build`
- Lokaler HTTP-Check: `/brief/anpassen` und `/brief/anpassen/erfolg` liefern `200 OK`.

## Hinweis

Die gesamte bestehende Testsuite scheitert weiterhin an bereits vorhandenen
PLZ-Fixture-Erwartungen in `plzLookup.test.ts`. Die neuen Tests laufen grün.
