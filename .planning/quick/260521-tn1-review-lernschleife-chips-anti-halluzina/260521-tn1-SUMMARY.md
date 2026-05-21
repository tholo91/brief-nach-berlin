---
id: 260521-tn1
slug: review-lernschleife-chips-anti-halluzina
date: 2026-05-21
status: complete
type: quick
---

# Summary: Review-Lernschleife - Chips, Anti-Halluzination, Length-Korridor, Wiederholungs-Fix

## Motivation

Auswertung von 4 echten Reviews (Stand 21. Mai 2026) ergab vier Bug-Pattern:

1. **Halluzinierte Vita** (Review 2, Jonathan, 2★): Mistral hat Aussagen über den Absender erfunden, weil die abstrakte "KEINE ERFINDUNGEN"-Regel allein nicht reicht.
2. **Wiederholte Floskel** "Ich verstehe, dass [X] kompliziert ist" in allen vier Briefen, weil das System-Prompt diesen Satz als Pflicht-Element verlangte.
3. **Logik-Flip bei aktuellen Vorhaben** (Review 3, Florian, 3★) - bleibt explizit aus Scope draußen, separates Thema.
4. **Word-Count-Compliance**: 2 von 4 Briefen lagen knapp außerhalb des Ziel-Fensters, was teure Retries (~10s) triggerte, die am Ende verworfen wurden.

Zusätzlich fehlten den Feedback-Chips drei Kategorien, die User per Freitext nannten (Vita erfunden, Anliegen verfehlt, Wiederholungen).

## Changes

- **`web/src/lib/feedback/feedbackTags.ts`** (commit `1a9e8e3`) - 3 neue Slugs in `NEGATIVE_FEEDBACK_TAGS`: `details_erfunden`, `anliegen_verfehlt`, `wiederholt_sich`. Form rendert dynamisch aus der Allowlist, Server-Zod-Schema (`z.enum(FEEDBACK_TAG_SLUGS)`) zieht die neuen Slugs automatisch. Keine UI- oder DB-Änderung nötig.
- **`web/src/lib/generation/generateLetter.ts`** (commit `26abb48`) - zwei Prompt-Änderungen:
  - **B) Anti-Halluzination per positiver Vorgabe**: Neuer Block `ÜBER DEN ABSENDER (positive Vorgabe)` direkt unter dem bestehenden `KEINE ERFINDUNGEN`-Block. Sagt explizit "abstrakte Ich-Form, wenn keine Selbstbeschreibung im Transkript steht".
  - **B) Kurz-Input-Hinweis**: In `buildUserPrompt` wird bei `issueText.length < 200` ein `<hinweis>`-Block angehängt, der vor Erlebnis-Szenen und Vita warnt. Genau die Konstellation, in der Mistral bislang gefälscht hat.
  - **E) Pflicht-Element 2 (`KOMPLEXITÄT ANERKENNEN`) komplett gestrichen**, kein Ersatz. Folgepunkte (`EINE BITTE`, `SCHLUSS-SATZ`) auf Nummer 2 und 3 hochgezogen. Damit verschwindet der "Ich verstehe, dass..."-Generator-Zwang.
- **`web/src/lib/generation/generateLetter.ts`** (commit `6b5a411`) - **C+D) Retry-Akzeptanz-Korridor ±15%**:
  - Neue Konstanten `acceptableMin = floor(minWords * 0.85)`, `acceptableMax = ceil(maxWords * 1.15)`.
  - Retry-Bedingung umgestellt von `< minWords || > maxWords` auf `< acceptableMin || > acceptableMax`.
  - User-Prompt verlangt weiterhin die ursprüngliche Ziel-Spanne (Mistral wird nicht weicher).
  - `wordCountInRange`-Flag bleibt am ursprünglichen Min/Max - Telemetrie misst weiter, wie oft Mistral das *Zielfenster* trifft, nicht den weiteren Korridor.
  - Warn-Log erweitert um `acceptableMin`/`acceptableMax`.

## Constraints respektiert

- Keine neuen Dependencies, keine DB-Migration, keine UI-Komponenten-Änderung.
- Existierende `KEINE ERFINDUNGEN`- und `REGELN`-Blöcke blieben unangetastet, nur punktuell *ergänzt*. Verboten-Listen nicht erweitert (per Mistral/Anthropic-Doku-Empfehlung).
- Keine em-dashes in den neuen Prompt-Texten.

## Verification

- `cd web && npx tsc --noEmit` → clean.
- `cd web && npm run lint` → clean **in den geänderten Dateien**. Pre-existing Lint-Errors in nicht angefassten Files (`Step3Success.tsx`, `fetchMdbContext.ts`, `Step1bLengthTone.tsx` u.a.) sind out-of-scope und in `deferred-items.md` festgehalten.
- Funktionale Verifikation (Wizard durchspielen mit Kurz-Input, "Ich verstehe..."-Check, Chip-Sichtbarkeit) ist Browser-basiert und steht zur User-Verifikation aus.

## Erwartete Wirkung gegen die 4 Reviews

| Review | Problem | Fix |
|---|---|---|
| 1 (Anna, 5★) | – positiv | unverändert |
| 2 (Jonathan, 2★) | Vita erfunden | B: positive Vorgabe + Kurz-Input-Hinweis |
| 3 (Florian, 3★) | Wiederholungen + Stoßrichtung | E: Wiederholungs-Bug fix; Stoßrichtung separat (Phase 2) |
| 4 (anonym, 2★) | unbekannt (kein Body) | manuell per Mail nachfassen |

Zusätzlich: ±15%-Korridor hätte auf Reviews 3 + 4 die Retries gespart - ~10s Latenz-Gewinn in ~50% der Fälle auf der bisherigen Sample.

## Deviations from Plan

None - Plan wurde 1:1 umgesetzt. Reihenfolge der Tasks innerhalb des Commits ist:

1. Chips (Task A) - `1a9e8e3`
2. Prompt-Änderungen B + E in einem Commit - `26abb48`
3. Retry-Korridor C+D - `6b5a411`

Diese Aufteilung folgt der Plan-Scope-Struktur (A separate Datei, B+E gemeinsam am System-Prompt, C+D als Control-Flow-Änderung).

## Deferred Issues

Pre-existing Lint-Errors aus dem Lint-Run, alle nicht durch diese Aufgabe verursacht:

- `web/src/components/wizard/Step1bLengthTone.tsx:73` - `react-hooks/incompatible-library` (`watch()` Memoization)
- `web/src/components/wizard/Step3Success.tsx:211` - `react-hooks/set-state-in-effect`
- `web/src/lib/enrichment/fetchMdbContext.ts:119` - unused `_score` warning
- Weitere Errors / Warnings in Files, die nicht Teil dieses Plans waren

Empfehlung: separater Lint-Cleanup-Task später.

## Telemetrie nach Deploy

- Vercel-Logs auf `[generateLetter]` filtern → `retried: true` sollte deutlich seltener werden.
- Nach ~5-10 echten Briefen: `wordCountInRange`-Quote in Supabase `reviews.debug_payload` checken (bleibt am alten Ziel-Fenster gemessen).
- Nach ~10-20 echten Reviews: Verteilung der neuen Chips analysieren.

## Self-Check: PASSED

**Commits:**

- `1a9e8e3` - feat: add 3 negative feedback chips - FOUND
- `26abb48` - feat: drop forced 'Komplexität anerkennen' + positive anti-hallucination directive - FOUND
- `6b5a411` - perf: widen retry corridor to ±15% - FOUND

**Files touched:**

- `web/src/lib/feedback/feedbackTags.ts` - FOUND
- `web/src/lib/generation/generateLetter.ts` - FOUND
