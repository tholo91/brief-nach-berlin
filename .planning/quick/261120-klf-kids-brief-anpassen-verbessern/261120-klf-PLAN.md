# Kids: Brief auf der Erfolgsseite anpassen und einmal verbessern

## Context
Am 20.11.2026 lief der Klassenlink-Test an der Oberschule Habenhausen gut. Die Kids fragten, wie sie den Brief noch anpassen können. Heute ist der Jugend-Entwurf nur zum Lesen da (`YouthLetterDraft`). `/brief/anpassen` ist nur per Mail erreichbar, und PDF-Kids bekommen keine Mail. Der Zähler läuft schon richtig: jeder generierte Brief zählt, auch beim Klassenlink.

Ziel für **alle Kids** (freier Schul-Wizard und Klassenlink), Erwachsene bleiben unverändert:
1. Brieftext direkt editierbar.
2. Button „Text kopieren“ (Zwischenablage, iPad).
3. Infobox „So wirkt dein Brief“: kurz und klar, gut begründet, persönlich betroffen.
4. **Einmal** „Brief verbessern“: das Kind schreibt, was anders werden soll und warum. Danach gibt es zwei Tabs, „Erste Fassung“ und „Verbesserte Fassung“. Danach ist kein weiterer Versuch möglich.

Nicht im Umfang: kein neues Argument per KI, keine Mail im PDF-Modus, keine DB-Absicherung für „einmal“. Die Sperre ist nur im Client, Missbrauch bremsen die bestehenden Limits.

Workflow: `/gsd:quick`. Frontend-Teil über `/frontend-design` (UI-Skill-Regel).

## Umsetzung

### 1. Server: Verbesserung als Text zurückgeben (bestehende Route erweitern)
- `web/src/app/api/generate-letter-variant/route.ts`: Jugend-Modus ergänzen, etwa ein Feld `mode: "youth"`.
  - Keine Mail, keine E-Mail-Pflicht. Antwort ist `{ success, letter }`.
- `web/src/lib/validation/wizardSchemas.ts`: Neben `letterVariantSchema` ein schlankes Jugend-Schema.
  - Felder: `originalLetter` (Mindestlänge passend zu Jugendbriefen, nicht 500) und `changeRequest` (Pflicht, max. 1000).
  - Optional `classToken` für das Klassen-Limit.
- `web/src/lib/generation/generateLetterVariant.ts`: wiederverwenden.
  - Länge bleibt beim Wortfenster des Originals. Ton bleibt gleich.
  - `rateLimitBudgetMs` an `withMistralRetry` geben (wie `generateLetter.ts:778`), damit ein Klassen-Ansturm 429 abfedert.
- Limits über `checkRateLimit` / `checkOriginRateLimit` in `web/src/lib/rateLimit.ts`:
  - pro IP (bestehendes `LETTER_VARIANTS_PER_IP`, Schulnetz beachten: ggf. Klassen-Bucket statt IP)
  - pro Klassenlink-Bucket, falls ein Token da ist (neuer Wert neben `LETTERS_PER_CLASS`)
- Zähler: Verbesserung zählt **nicht** als neuer Brief.

### 2. Client: Erfolgsseite für Kids
- `web/src/components/wizard/YouthLetterDraft.tsx`: Das read-only `<p>` wird eine `<textarea>`.
  - Die aktive Fassung speist PDF (`LetterPdfButton`) und den Kopieren-Button.
- `Step3Success.tsx` (`letterText`-State, Zeile ~271): Fassungen halten.
  - `versions: { first, improved? }`, dazu `activeTab` und `improveUsed`.
  - Bearbeitungen bleiben pro Fassung erhalten.
- Kopieren über bestehendes `web/src/components/CopyTextButton.tsx`.
- Infobox und Verbessern-Box unter dem Text:
  - drei kurze Tipps
  - Feld „Was soll anders werden und warum?“
  - Button „Brief verbessern (einmal möglich)“
- Die Verbesserung nimmt den **aktuell bearbeiteten** Text als Grundlage.
- Nach Erfolg: Tabs „Erste Fassung / Verbesserte Fassung“ erscheinen, die Box verschwindet.
- Fehler (429/503): klare Meldung, erneut versuchen möglich. Erst ein Erfolg verbraucht den einen Versuch.
- Copy auf Deutsch, du-Form, keine Gedankenstriche, Anti-KI-Checkliste.

## Kritische Dateien
- `web/src/app/api/generate-letter-variant/route.ts`
- `web/src/lib/generation/generateLetterVariant.ts`
- `web/src/lib/validation/wizardSchemas.ts`
- `web/src/lib/rateLimit.ts`
- `web/src/components/wizard/YouthLetterDraft.tsx`
- `web/src/components/wizard/Step3Success.tsx`

## Verifikation
- Jest (`cd web && npx jest`), nur `*.test.ts`, `@/lib/mistral` gemockt:
  - Jugend-Modus liefert Text, sendet keine Mail, verlangt keine E-Mail.
  - Limit pro Klassen-Bucket greift.
  - Der Erwachsenen-Modus ist unverändert (bestehende Tests grün).
- Browser-Preview lokal, Mistral gemockt oder einmaliger echter Aufruf außerhalb von Kampagnen-Spitzen:
  - Klassenlink im PDF-Modus: Text bearbeiten, dann ist die Änderung im PDF.
  - Kopieren funktioniert.
  - Verbessern einmal, Tabs wechseln, die Box ist danach weg.
  - Freier Schul-Wizard: dasselbe ohne PDF.
  - Erwachsenen-Flow: unverändert.
- Schmale iPad-Breite prüfen (`resize_window` tablet).
