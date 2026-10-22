---
created: 2026-10-21T00:00:00.000Z
title: Brief anpassen behält die eigene Stimme, plus Knopf "Einfache Worte"
area: letter-variant
files:
  - web/src/lib/generation/generateLetterVariant.ts
  - web/src/app/(site)/brief/anpassen/VariantForm.tsx
  - web/src/__tests__/generateLetterVariantPrompt.test.ts
---

# Brief anpassen: eigene Stimme bleibt, einfache Worte auf Wunsch

Status: backlog (Stand 21.10.2026). Noch keine Codeänderung, Thomas entscheidet vor der Umsetzung.

## Story

Als Person, die ihren Brief auf `/brief/anpassen` überarbeiten lässt, möchte ich, dass meine eigenen Formulierungen, meine Meinung und meine Anredeform stehen bleiben, damit der Brief nach mir klingt und das Überarbeiten Sinn ergibt.

Als Person ohne politische Erfahrung möchte ich den Brief mit einem Klick in Alltagssprache umschreiben lassen, damit er nicht nach Vorlage klingt.

## Warum (HeySpeak-Antworten, Export vom 19.10.2026)

Häufigste Kritik in den 65 Antworten: Die Überarbeitung nimmt eigene Inhalte wieder raus (ca. 6 Fälle).

- Meinung zum Empfänger am Briefanfang sollte bleiben (19.10., Gera, Brief an Herrn Voigt)
- Gendern ("Autofahrende") wurde zurückkorrigiert (11.08.)
- Du-Form für einen bekannten Empfänger wurde entfernt: "Das macht das Korrigieren sinnfrei" (10.10.)
- Eigener letzter Satz sollte bleiben (04.10.)
- Ergänzungen verschwunden (09.10.), "Warum muss mein Brief verbessert werden?" (27.09. und 29.09.)

Zweitens: zu gestelzte Sprache, Wunsch nach einfacher Sprache (09.09. und 19.10.). Der Fall vom 19.10. ("Potenzialitätskriterium") kommt aus dem Kampagnentext `prueft-die-afd`, nicht aus dem Prompt. Thomas formuliert den Kampagnentext selbst um, das ist nicht Teil dieser Story.

## Ursache im Code (geprüft am 19.10.2026)

- `VARIANT_SYSTEM_PROMPT` erlaubt "Kürze, glätte oder schärfe Sprache". Eigene Formulierungen sind nur geschützt, wenn jemand den Knopf "Eigene Worte behalten" anklickt.
- Der Prompt erzwingt "Der Brief bleibt ein formeller Brief in Sie-Form". Tonstufe 5 (`tonalityBlock` in `generateLetter.ts`) verbietet die Du-Form zusätzlich.
- Der Prompt erhält "konkrete Sachverhalte", deshalb überleben Fachwörter aus einer Vorlage.
- `generateLetterVariant` wird nur von `/brief/anpassen` genutzt (über `/api/generate-letter-variant`). Die Leute kommen über den Link "Brief anpassen" in der Brief-Mail (`buildVariantUrl` in `web/src/lib/email/buildEmailHtml.ts`).

## Umsetzung (Vorschlag)

1. Prompt `generateLetterVariant.ts`, neuer Regelblock "Eigene Stimme bleibt":
   a. Persönliche Meinungen und Wertungen bleiben inhaltlich und möglichst wörtlich stehen, auch über den Empfänger.
   b. Gendergerechte Formen ("Autofahrende", "Bürger*innen") bleiben so.
   c. Erkennbar bewusst gesetzte Sätze (z. B. ein eigener Schlusssatz) nur ändern, wenn der Änderungswunsch das verlangt.
   d. "Sie-Form" ersetzen durch: Anredeform des Originals behalten (Sie oder Du), sonst Sie. Die Anredeform des Originals hat Vorrang vor der Tonstufe.
   Positiv formulieren, nicht als Verbotsliste (siehe Prompt-Stil).
2. `VariantForm.tsx`, `CHANGE_PRESETS`: Knopf "Einfache Worte" mit Text "Bitte Alltagssprache und kurze Sätze, Fachwörter und Fremdwörter durch einfache Wörter ersetzen."
3. Test `generateLetterVariantPrompt.test.ts`: neue Regeln stehen im Prompt. Mistral bleibt gemockt.
4. Echter Mistral-Durchlauf mit 3 Briefen (Du-Form, Gendern, eigene Meinung), nur abends und nicht während einer Kampagnenwelle (15 Anfragen pro Minute, geteilt mit der Live-Seite).

Umsetzung als `/gsd-quick`. Der Knopf ist eine kleine UI-Änderung im bestehenden Muster.

## Offene Entscheidungen

1. Knopf "Eigene Worte behalten": 1A durch "Einfache Worte" ersetzen (die Regel gilt dann immer, 5 Knöpfe bleiben auf dem Handy übersichtlich) · 1B behalten und sechsten Knopf ergänzen. Empfehlung 1A.
2. Echter Mistral-Test: 2A abends 3 Briefe vor dem Push · 2B ohne echten Test pushen und Feedback beobachten. Empfehlung 2A.

## Fertig, wenn

- Eine Variante eines Briefs mit Du-Form, Gendern und eigener Meinung behält alle drei (echter Durchlauf, 3 Briefe).
- Der Knopf "Einfache Worte" erscheint auf `/brief/anpassen` und fügt den Text in den Änderungswunsch ein.
- `cd web && npx jest generateLetterVariant` ist grün.

## Verwandt

- `2026-07-10-variant-flow-briefentwurf-anpassen-level-aware-machen.md` (gleicher Flow)
