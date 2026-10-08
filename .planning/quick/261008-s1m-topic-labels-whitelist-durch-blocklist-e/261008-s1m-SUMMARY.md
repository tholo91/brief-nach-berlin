---
phase: quick-261008-s1m
plan: 01
subsystem: topics
tags: [topic-labels, blocklist, mistral-prompt, consent, datenschutz]
status: complete
commits: 3
plan_head_before: 622e93ad21ff69ebd04ae7dd04dfc50ef105aa24
plan_head_after: 56a9583a9c85d56e1e99c5c9e374d32b7d36c129
requirements: [TOPIC-LABELS-BLOCKLIST]
key-files:
  modified:
    - web/src/lib/topics/topicTaxonomy.ts
    - web/src/lib/lookup/levelRouter.ts
    - web/src/lib/generation/generateLetter.ts
    - web/src/lib/actions/letterSignals.ts
    - web/src/components/wizard/LetterSignalCard.tsx
    - web/src/app/(site)/datenschutz/page.tsx
    - web/src/__tests__/topicTaxonomy.test.ts
    - web/src/__tests__/levelRouter.test.ts
    - web/src/__tests__/generateLetterPrompt.test.ts
    - web/src/__tests__/letterSignalActions.test.ts
    - web/src/__tests__/successPageExperience.test.ts
decisions:
  - "Topic labels use a blocklist (PII refines + PARTY_NAME_REGEX with Unicode boundaries) instead of a whitelist; TOPIC_TAXONOMY_VERSION stays v1."
  - "Both Mistral prompts share one TOPIC_PROMPT_RULES constant."
actuals:
  tokens: 14000
  tasks: 3
  commits: 3
---

# Phase quick-261008-s1m Plan 01: Topic-Labels per Blocklist Summary

Concrete Mistral keywords ("Bundesverfassungsgericht", "Erziehermangel", "Racial Profiling") are now stored instead of being flattened to "Demokratie"; party names (also hyphen compounds like "AfD-Verbot") are blocked, PII refines stay.

## Commits

1. `3951397` feat: Whitelist-Konstanten und Refine entfernt, PARTY_NAME_REGEX (Lookbehind/Lookahead mit `\p{L}\p{N}`, kein `\b`), Tests PASS/DROP, buildTopicSignal-Tests, Routing-Tracer in levelRouter.test.ts.
2. `49efb04` feat: `TOPIC_PROMPT_RULES` (Hauptthema zuerst, konkrete Stichworte) in Routing-Prompt und Generierungs-Fallback; vorklassifizierte Kampagnenbriefe bekommen keinen Themen-Text. Prompt-Assertions (`toContain`, es gibt keine Jest-Snapshots).
3. `56a9583` copy: Einwilligungssatz ("Thema und bis zu drei Stichworte deines Anliegens"), `LETTER_SIGNAL_CONSENT_VERSION = letter-signals-2026-10-v3-topic-keywords`, Datenschutz Abschnitt 7 und 18, Stand 8. Oktober 2026.

## Verification

- Jest gesamt (`cd web && npx jest`): 97 von 98 Suites gruen, 696 von 697 Tests gruen. Einzige Rote: `supportContent.test.ts` ("Zeit" in `SUPPORT_CONTENT.founder.text`). Das ist ein bereits vor diesem Plan bestehender Fehler (Baseline fe5e53e), ausserhalb des Scopes, nicht angefasst, **offen**.
- Pre-existing und hier behoben: `letterSignalActions.test.ts` "stores the signed letter number when generation is recorded" scheiterte an einer Rathaus-Fixture ohne `address` (token.ts:139). Nur die Fixture wurde ergaenzt, token.ts unveraendert.
- `tsc --noEmit`: keine Fehler in den beruehrten Dateien (4 bekannte, nicht zugehoerige Fehler in campaignTopicReset.test.ts bleiben). ESLint auf den beruehrten Quelldateien: Exit 0.
- Kein Diff in `web/supabase/migrations`; uiCatalog.ts, landingPageContent.test.ts und `.planning/research/` nicht committet.
- **Live-Mistral-Check (STORY Akzeptanz 1): lief, bestanden.** Throwaway-Skript im Scratchpad (geloescht), nur erfundene Beispiele, Key nicht ausgegeben. Ergebnis (Kategorien / Labels):
  - A: demokratie_staat / Bundesverfassungsgericht, Richterwahl
  - B: bildung / Kita-Platzmangel, Erziehermangel
  - C: verkehr_mobilitaet / Radverkehr, Verkehrssicherheit
  - D: demokratie_staat / Racial Profiling, Allgemeines Gleichbehandlungsgesetz
  - E: soziales_familie / Mietendeckel, Mietrecht
  - F: demokratie_staat, sicherheit_justiz / Rechtsextremismus, Landtag, Sachsen
  - "AfD" taucht nirgends auf. Hinweis: Mistral ist nicht deterministisch; Kategorien und Labels weichen teils von der STORY-Tabelle ab, die Spezifik bleibt aber erhalten.

## Bewusst ausgelassen

- Optional `web/src/lib/internalStats/aggregate.ts` (Hauptthema zaehlen): nicht klein (neues Ergebnisfeld, Initializer, Anzeige, Test); der Wert ist spaeter aus `topic_categories[0]` ableitbar. Datei unveraendert.

## Deviations from Plan

None - plan executed as written. Einzige Anpassung: die Datenschutz-Phrase "Themen-Stichworte (z. B. Radverkehr, Erziehermangel)," steht auf einer JSX-Zeile, damit der grep-Check des Plans greift.

## Hinweise

- Laufende Kampagnen behalten ihre alten, flachen Labels, bis der Kampagnentext einmal neu gespeichert wird (STORY "Bekannte Grenzen").
- Akzeptierter Trade-off: eigenstaendige Woerter "Gruene", "Linke", "Volt" werden als Partei geblockt (z. B. "Gruene Welle"); geschlossene Komposita ohne Bindestrich werden nicht erkannt.
- Alte `letter_signals`-Zeilen bleiben flach; Schnitt fuer Auswertungen ist `consent_version` bzw. `created_at`.

## Known Stubs

None.

## Self-Check: PASSED

Commits 3951397, 49efb04, 56a9583 vorhanden auf main; geaenderte Dateien existieren.
