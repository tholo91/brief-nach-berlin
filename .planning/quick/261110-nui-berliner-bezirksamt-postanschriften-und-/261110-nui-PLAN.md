---
quick_id: 261110-nui
mode: quick
---

# Quick 261110-nui: Berliner Bezirksamt-Postanschriften und besserer Rathaus-Fallback

## Why
Berliner Kommune-Briefe bekommen nie eine Anschrift: `buildRathausRecipient` setzt für `BE` `officialAddress = null` (Destatis kennt nur „Berlin“). Alle 192 Berliner PLZ zeigen den grauen Fallback-Satz. 153 PLZ haben einen eindeutigen Bezirk, 39 liegen in 2–3 Bezirken (`plz-bundesland-mapping.json` → `bezirke`). Außerhalb Berlins sucht der Fallback-Link nur „Bürgermeisteramt Postanschrift“ ohne Ort.

Locked decisions (Thomas, 10.11.2026):
- 12 feste Postanschriften im Repo, Quelle berlin.de + Stand.
- Mehrdeutige Berliner PLZ: mögliche Bezirke mit Adresse auflisten, KEINE Auswahl-Logik.
- Restfälle: kurzer Satz + klarer Button „Adresse suchen“ statt grauem „hier“-Link (UI und Mail).
- Google-Suche nimmt im Fallback den Ortsnamen mit.

## Task 1: Daten + Typ + Lookup
files: `web/data/berlin-bezirksaemter.json` (neu), `web/src/lib/lookup/rathausRecipient.ts`, `web/src/lib/lookup/plzLookup.ts`, `web/src/lib/letterSignals/token.ts`, `web/src/lib/generation/generateLetter.ts`, `web/src/lib/lookup/recipientEnvelope.ts`, `web/src/lib/email/sendLetterEmail.ts`

- JSON: `{ "_meta": { "source": { "title", "url", "stand" } }, "byBezirk": { "<Bezirk>": { "recipientLine", "streetAddress", "postalCode", "city", "sourceUrl" } } }`. Keys exakt wie die Werte in `web/data/berlin-bezirke.json`. Inhalte vom Orchestrator geliefert (siehe Executor-Prompt).
- Adress-Union: `source: "destatis"` → `source: "official"` mit `sourceName: "Destatis" | "berlin.de"`, `ags?: string` optional, übrige Felder gleich (`streetAddress` darf "" sein bei Großkunden-PLZ). Alle `=== "destatis"`-Checks auf `"official"` umstellen. token.ts: `localKey = address.source === "official" && address.ags ? address.ags : \`${plz}:${gemeindeName}\``.
- Neues optionales Feld `candidates?: { bezirk: string; label: string; streetAddress: string; postalCode: string; city: string }[]` am `RathausRecipient`, nur bei `ambiguous`.
- `buildRathausRecipient`: Berlin mit Bezirk → Adresse aus JSON, `sourceName: "berlin.de"`, `postalAddress` vollständig. Berlin ohne Bezirk bleibt fallback. Nicht-Berlin unverändert (sourceName "Destatis").
- `plzLookup.ts` mehrdeutig: `candidates` aus `kommuneBezirke` + JSON füllen.
- `recipientEnvelope.ts`: `rathausSearchUrl` nutzt im Fallback den `gemeindeName` (auch Bürgermeisteramt ohne Treffer: „Bürgermeisteramt <Ort> Postanschrift“; mehrdeutiges Berlin bleibt „Bezirksamt Berlin Postanschrift“). Envelope-Zeilen: Straße nur wenn nicht leer.
- `sendLetterEmail.ts:207`: `ort` immer `recipient.gemeindeName`; `candidates` an `rathausSearch` durchreichen.

## Task 2: UI + Mail-Copy
files: `web/src/components/wizard/RathausAdresseButton.tsx`, `web/src/components/wizard/Step3Success.tsx`, `web/src/lib/email/buildEmailHtml.ts`, `web/src/lib/email/mailLocale.ts`

- „Quelle: Destatis“ → `sourceName` (Link auf `sourceUrl`). Berlin: „Quelle: berlin.de, Stand …“.
- Mehrdeutig (Step3 Hinweis `Step3Success.tsx:1387`, RathausAdresseButton, Mail): „Deine PLZ liegt in Pankow oder Mitte. Nimm die Adresse deines Bezirks:“ + je Kandidat Label + Adresse. Bei 3 Kandidaten „A, B oder C“.
- Restfall ohne Adresse: Satz „Die Postanschrift konnte ich für deine PLZ nicht sicher zuordnen.“ + Button „Adresse suchen“ (UI: bestehender Button-Stil der Wizard-Komponenten; Mail: grüner Button wie `profileButtonHtml`, Farbe #2D5016). `mailLocale.ts` `noAddress` entsprechend, plus neuer Key für den Button-Text; englische Locale (falls vorhanden) analog.
- Copy-Regeln: ich-Form, keine Gedankenstriche (—/–), kurz, kein „wir“.

## Task 3: Tests
files: `web/src/__tests__/rathausRecipient.test.ts`, `lookupPLZWithLevel.test.ts`, `recipientEnvelope.test.ts`, `rathausAdresseButton.test.ts`, `buildEmailHtmlRecipients.test.ts`, `letterSignalActions.test.ts`
- Bestehende Destatis-Erwartungen auf `source: "official"`/`sourceName` anpassen.
- Neu: eindeutige Berliner PLZ (z. B. 13187 → Pankow) hat berlin.de-Adresse, Envelope complete; mehrdeutige Berliner PLZ (eine aus den 39) hat 2+ `candidates`; Mail zeigt Kandidaten; Nicht-Berliner PLZ ohne Destatis-Treffer → Suche enthält Ort, Mail enthält Button „Adresse suchen“.
- Jest-Regel: nur `*.test.ts`, Mistral mocken (`@/lib/mistral`).

verify: `cd web && npx jest && npx tsc --noEmit && npx eslint <geänderte Dateien>`
done: alle Tests grün, tsc ohne Fehler, 3 atomare Commits auf main (nicht pushen).
