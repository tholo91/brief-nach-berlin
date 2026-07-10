---
created: 2026-07-10T15:58:53.579Z
title: Variant-Flow "Briefentwurf schnell anpassen" level-aware machen
area: api
files:
  - web/src/lib/validation/wizardSchemas.ts:27
  - web/src/lib/generation/generateLetterVariant.ts:7
  - web/src/lib/generation/generateLetterVariant.ts:41
  - web/src/lib/email/buildEmailHtml.ts:23
  - web/src/app/(site)/brief/anpassen/VariantForm.tsx:39
  - web/src/app/(site)/brief-verbessern/page.tsx:56
---

## Problem

Seit 999.6 gibt es drei politische Ebenen (Bund/MdB, Land/MdL, Kommune/Rathaus). Die Hauptgenerierung ist level-aware (recipient.level + LETTER_PROMPT_LEVEL_AWARE), der Anpassungs-Flow "Briefentwurf schnell anpassen" (aus der Ergebnis-Mail heraus, Quick-Tasks 260707-vrt / 260707-uhp) aber nicht.

Audit-Befund vom 2026-07-10 (Read-only-Agent, Worktree brief-nach-berlin-999.6, Branch codex/999-6-level-routing-v2):

1. `letterVariantSchema` (web/src/lib/validation/wizardSchemas.ts:27) traegt kein `level` und kein `recipientKind`. Der Flow weiss nicht, ob der Originalbrief an Bund/Land/Kommune ging.
2. `buildVariantUrl` (web/src/lib/email/buildEmailHtml.ts:23) uebergibt per URL-Hash nur `email` und `originalToneLevel`. Der Brieftext wird vom User manuell eingefuegt.
3. Groesstes reales Risiko: `VARIANT_SYSTEM_PROMPT` Zeile 41 (web/src/lib/generation/generateLetterVariant.ts): Bei Aenderungswunsch "mehr Wahlkreisbezug" soll das Modell Formulierungen wie "in unserem Wahlkreis" nutzen. Fuer Kommune-Briefe (Stadtverwaltung/Rathaus, kein Wahlkreis-Konzept) ist das falsches Framing.
4. Abgemildert wird das Ganze dadurch, dass der Prompt Empfaengeranrede, Adressatenbezug und Grussformel aus dem eingefuegten Original erzwingt und keine neuen Fakten erlaubt. Anrede/Kompetenzrahmen bleiben also meist korrekt. Kein hartkodiertes "Bundestag/MdB" im Variant-Prompt.
5. Zusatzfund: `PROMPT_HEADER` in web/src/app/(site)/brief-verbessern/page.tsx:56-58 (separate SEO-/Copy-Paste-Prompt-Seite, kein KI-Call) ist hart auf "Abgeordnete" / "meinen Abgeordneten" gerahmt. Fuer Kommune (keine Einzelperson) inhaltlich falsch.

## Solution

1. `level` ("Bund" | "Land" | "Kommune") in `letterVariantSchema` und `GenerateLetterVariantInput` aufnehmen (optional, Default "Bund" fuer alte Mail-Links).
2. Bei der Erstgenerierung ist `recipient.level` bekannt: in `buildVariantUrl` als weiteres Hash-Param mitgeben (analog `originalToneLevel`), in `variantDataFromHash` (VariantForm.tsx:39) auslesen und im Payload mitschicken.
3. `VARIANT_SYSTEM_PROMPT` Zeile 41 level-abhaengig machen: fuer Kommune "vor Ort" / "in unserer Stadt/Gemeinde" statt "in unserem Wahlkreis"; optional kurzen Ebenen-Kontextblock analog LETTER_PROMPT_LEVEL_AWARE ergaenzen.
4. `PROMPT_HEADER` auf brief-verbessern neutraler formulieren (z.B. "an deine zustaendige Vertretung oder Stadtverwaltung").
5. Test analog generateLetterLevelPrompt-Suite: Kommune-Variante darf kein "Wahlkreis" ins Framing ziehen.

Umsetzung auf Branch codex/999-6-level-routing-v2 (Worktree brief-nach-berlin-999.6), da level-Konzepte dort leben.

## Optionale UX-Verbesserungen (2026-07-10, aus Flow-Review, gern als eigene Tasks splitten)

Prioritaet 1: Variante direkt auf der Erfolgsseite anzeigen. Die API generiert den Brief ohnehin und koennte `letter` im JSON zurueckgeben (kein Storage, nur Response-Body, DSGVO-unkritisch). Erfolgsseite rendert den Text mit Copy-Button, Mail bleibt als dauerhafte Kopie. Loest auch das "Noch eine Variante"-Problem: Aktuell fuehrt der Button zurueck zum leeren Formular, der neue Text liegt aber nur im Postfach. Mit Inline-Anzeige kann "Noch eine Variante" den neuen Text direkt vorbefuellen (Iterations-Loop ohne Inbox-Roundtrip). Dateien: web/src/app/api/generate-letter-variant/route.ts:94, VariantSuccessClient.tsx, letterVariantSubmission.ts.

Prioritaet 2: Einfuege-Friktion senken: Button "Aus Zwischenablage einfuegen" am Textfeld (navigator.clipboard.readText mit Fallback, mobil der fummeligste Schritt). Datei: VariantForm.tsx.

Prioritaet 3: `originalToneLevel` ist tote Daten: wird durch die ganze Pipeline gereicht (Hash-Param, Schema, GenerateLetterVariantInput), aber weder als Slider-Default genutzt (Slider startet fix bei 3) noch im Prompt. Fix: Slider auf originalToneLevel defaulten (Default-Aktion = gleicher Ton, bessere Formulierung) und Mistral das Delta nennen ("Original war Stufe 4, gewuenscht 2, spuerbar abmildern"). Dateien: VariantForm.tsx:53, generateLetterVariant.ts:57.

Was bewusst NICHT anfassen: Rate-Limiting (IP+Email vorhanden), Output-Moderation, Retry-UI auf der Erfolgsseite, Anrede/Grussformel-Preservation. Funktioniert.
