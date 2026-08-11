---
created: 2026-08-11T09:30:00.000Z
title: TSC + Lint-Fehler aufräumen (Typ-Drift in Tests, no-explicit-any, ungenutzte Imports)
area: quality
files:
  - web/src/__tests__/campaignRolloutSafety.test.ts:123
  - web/src/__tests__/campaignRolloutSafety.test.ts:192
  - web/src/__tests__/campaignTargetLevel.test.ts:112
  - web/src/__tests__/landesregierungRecipient.test.ts:33
  - web/src/__tests__/recipientSelectionHardening.test.ts:67
  - web/src/__tests__/stepLevelSelect.test.ts:9
  - web/scripts/filter-plz-polygons.ts:78
  - web/scripts/parse-plz-mapping.ts:49
  - web/scripts/parse-plz-mapping.ts:259
  - web/src/app/(site)/feedback/PrivacyDisclosure.tsx:57
  - web/src/app/(site)/beispiele/page.tsx:58
  - web/src/app/(site)/guide/page.tsx:6
  - web/src/app/(site)/wahlkreisbuero-oder-berlin/page.tsx:117
  - web/src/components/PromptCopyBlock.tsx:3
  - web/src/components/wizard/Step1Form.tsx:30
  - web/src/components/wizard/Step1bOptional.tsx:84
  - web/src/lib/enrichment/fetchMdbContext.ts:152
---

## Problem (Warum)

`npx tsc --noEmit` und `npm run lint` sind nicht grün. Das ist vorbestehend und hat nichts
mit anderen Fixes zu tun (Fund anlässlich des LinkedIn-Link-Fixes, 2026-08-11). Aktueller Stand:

- **6 TSC-Fehler**, alle in `web/src/__tests__/`: Die Test-Fixtures sind hinter den echten
  Interfaces veraltet (Typ-Drift). Wenn Interfaces weiterwachsen (z.B. `gemeindeName` in
  `PlzLookupResult`, neue Pflichtfelder an `MdbRecipient`), aktualisiert niemand die Mocks.
- **3 Lint-Fehler + 8 Warnungen** über Skripte und UI-Komponenten verteilt.

Warum aufräumen, obwohl Build/App weiter laufen:
- Rote Checks gehen im Rauschen unter: Echte neue Typfehler werden nicht mehr bemerkt, weil
  schon alte da sind.
- CI / `npm run test` (je nach Setup) kann daran hängenbleiben.
- Veraltete Test-Fixtures sind ein Korrektheitsrisiko: Ein Test, der mit einem Mock ohne
  Pflichtfelder läuft, testet nicht mehr das, was die App wirklich macht.

Zielzustand: `npx tsc --noEmit` → 0 Fehler, `npm run lint` → 0 errors **und** 0 warnings.

## Verifikation (vorher/nachher)

```bash
cd web
npx tsc --noEmit        # vorher: 6 Fehler, nachher: 0
npm run lint            # vorher: 3 errors + 8 warnings, nachher: 0/0
npm run test            # muss weiter grün sein — Fixtures nur angleichen, keine Erwartungen abschwächen
```

Wichtig: **Keine Produktlogik ändern.** Nur Typen, Fixtures, Imports. Falls ein Feld im
Produktcode (nicht im Test) optional gemacht werden soll, vorher Logik/DSGVO-Kontext prüfen —
vermutlich unnötig, in fast allen Fällen reicht das Fixture anzupassen.

## TSC-Fehler (6) — alle in Tests, Fixtures an Interfaces angleichen

1. `web/src/__tests__/campaignRolloutSafety.test.ts:123` und `:192`
   - Fehler: Mock-Fixture für `lookupPLZWithLevel` ist kein gültiges `PlzLookupResult` —
     `gemeindeName` fehlt.
   - Fix: `gemeindeName` in beide Fixtures aufnehmen (realer Wert, z.B. Ortsname). Einmal
     definieren, beide Mocks nutzen es.

2. `web/src/__tests__/campaignTargetLevel.test.ts:112`
   - Fehler: TS7053 — `BUNDESLAND_NAMES[key]` mit `key: string` auf
     `Record<"BW"|"BY"|…|"TH", string>`.
   - Fix: `expectedKeys` als `(keyof typeof BUNDESLAND_NAMES)[]` typisieren (oder die Schleife
     über `Object.keys(BUNDESLAND_NAMES)` iterieren). Assertion „alle 16 enthalten" bleibt
     identisch.

3. `web/src/__tests__/landesregierungRecipient.test.ts:33`
   - Fehler: `governmentData.recipients[key]` mit `key: string` liefert eine Union, deren
     `institutionKind` als `string` gilt — nicht `"landesregierung" | "senat"`.
   - Fix: it.each-Parameter als `keyof typeof governmentData.recipients` typisieren. Evtl.
     zusätzlich Daten mit `as const` versehen, falls die Quelle der Union das `string` ist.

4. `web/src/__tests__/recipientSelectionHardening.test.ts:67`
   - Fehler: MdbRecipient-Fixture fehlt `politicianId, title, wahlkreisId, wahlkreisName` und
     2 weitere Felder.
   - Fix: Fixture-Feld für Feld gegen das echte `MdbRecipient`-Interface abgleichen und alle
     fehlenden Pflichtfelder ergänzen (die Fehlermeldung nennt die Namen).

5. `web/src/__tests__/stepLevelSelect.test.ts:9`
   - Fehler: `optionalByLevel` im Fixture ist `{ Land: … } | undefined`, gefordert ist
     `{ Land: … }`.
   - Fix: Fixture konsistent als gültiges `LevelRoutingContext`-Objekt aufbauen (alle Pflicht-
     Felder setzen), statt eines Objekts, das durch Typabschwächung „irgendwie passt".

## Lint-Fehler (3)

1. `web/scripts/filter-plz-polygons.ts:78` — `@typescript-eslint/no-explicit-any`
   - Fix: `any` durch einen konkreten Typ ersetzen (GeoJSON-Feature-Typ oder
     `unknown` + Verengung). Kein `// eslint-disable`.

2. `web/scripts/parse-plz-mapping.ts:259` — `prefer-const`
   - Fix: `let stadtstaatPolygons` → `const` (wird nie reassigned).

3. `web/src/app/(site)/feedback/PrivacyDisclosure.tsx:57` — `react/no-unescaped-entities`
   - Fix: das `"` im JSX-Text als `&quot;` (bzw. `&ldquo;`/`&rdquo;`) escapen oder als
     `{"\""}` inline. Kein Raw-`"` im JSX-Text.

## Lint-Warnungen (8) — Ziel: 0, optional separat aufteilbar

1. `web/scripts/parse-plz-mapping.ts:49` — `STADTSTAAT_AGS5` nie verwendet → löschen oder verwenden.
2. `web/src/app/(site)/beispiele/page.tsx:58` — `AIRMAIL_STRIPE_BG` nie verwendet → löschen.
3. `web/src/app/(site)/guide/page.tsx:6` — `FactCallout` importiert, nie verwendet → Import entfernen.
4. `web/src/app/(site)/wahlkreisbuero-oder-berlin/page.tsx:117` — `<img>` statt `next/image`
   → auf `next/image` umstellen (Alt-Text vorhanden halten).
5. `web/src/components/PromptCopyBlock.tsx:3` — `useEffect` importiert, nie verwendet → Import entfernen.
6. `web/src/components/wizard/Step1Form.tsx:30` — `react-hooks/incompatible-library`
   (React Hook Form `watch()` ist nicht sicher memoizierbar). Bekanntes Framework-Konflikt-
   Muster: NICHT den Code umbauen, sondern gezielt per Kommentar begründen (Konfiguration auf
   ESLint-Ebene) oder die Komponente vom React-Compiler ausschließen.
7. `web/src/components/wizard/Step1bOptional.tsx:84` — gleiches Muster wie #6 (`watch()`).
8. `web/src/lib/enrichment/fetchMdbContext.ts:152` — `_score` nie verwendet → Benennung/Umbenennung
   oder Destrukturierung ohne das Feld.

## Trigger

Kein zeitlicher Druck — Item ist unabhängig vom LinkedIn-Fix und kann jederzeit als eigenes
Quick-Task/PR umgesetzt werden. Sinnvoller Moment: vor einem größeren Type-Refactoring oder
wenn die Test-Suite um neue Fixtures erweitert wird.
