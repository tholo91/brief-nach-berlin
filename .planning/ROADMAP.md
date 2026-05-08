# Roadmap: Brief nach Berlin

## Overview

Three phases deliver a complete citizen-to-politician letter pipeline. Phase 1 ships the landing page and preprocesses the data that makes PLZ lookup possible. Phase 2 builds the core engine: input capture, politician lookup, safety checks, and AI letter generation — the product actually works at the end of this phase. Phase 3 wires in email delivery and closes all DSGVO/privacy obligations, making the product publicly safe to promote.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Landing Page & Data Infrastructure** - Ship the landing page and preprocess PLZ/politician data so the core engine has what it needs
- [ ] **Phase 2: Core Engine** - Build the full input → lookup → safety → letter generation pipeline
- [ ] **Phase 3: Email Delivery & Privacy Compliance** - Wire in email delivery and satisfy all DSGVO obligations

## Phase Details

### Phase 1: Landing Page & Data Infrastructure
**Goal**: Citizens can discover and understand Brief nach Berlin, and all static data required for PLZ-to-politician lookup is preprocessed and ready
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, PRIV-02, PRIV-03
**Success Criteria** (what must be TRUE):
  1. A visitor landing on the site immediately understands what Brief nach Berlin does and how it works
  2. The landing page works correctly on mobile and desktop
  3. Datenschutz and Impressum pages are accessible and linked from every page
  4. A script can preprocess Bundeswahlleiter shapefiles and output a static PLZ-to-Wahlkreis JSON file
  5. Abgeordnetenwatch politician data is fetched, structured, and stored as a local cache that can be refreshed without touching the app
**Plans**: TBD
**UI hint**: yes

### Phase 2: Core Engine
**Goal**: A citizen can describe their issue, enter their PLZ, and receive a properly addressed, AI-generated letter ready to be handwritten and mailed
**Depends on**: Phase 1
**Requirements**: INPT-01, INPT-02, INPT-03, INPT-04, POLI-01, POLI-02, POLI-03, POLI-04, POLI-05, SAFE-01, SAFE-02, SAFE-03, LETR-01, LETR-02, LETR-03, LETR-04, LETR-05
**Success Criteria** (what must be TRUE):
  1. User can describe their issue via free text or voice (Whisper), enter a valid German PLZ, and submit
  2. The system identifies the correct MdB and postal address for the entered PLZ (including disambiguation when a PLZ spans multiple Wahlkreise)
  3. Hateful, threatening, or abusive input is rejected with a clear German error message before any letter is generated
  4. A generated letter is displayed: properly addressed to the politician by name and title, ~200-280 words, formal German Briefstil, referencing the specific local issue
  5. The letter output passes moderation before being shown to the user
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Foundation: types, Zod schemas, PLZ lookup, moderation wrapper
- [x] 02-02-PLAN.md — Voice recording subsystem: AudioRecorder, VoiceRecorder, /api/transcribe
- [x] 02-03-PLAN.md — AI pipeline: Mistral letter generation, server actions
- [ ] 02-04-PLAN.md — Wizard UI: WizardShell, Step1-3 components, full integration

**UI hint**: yes

### Phase 3: Email Delivery & Privacy Compliance
**Goal**: The generated letter is delivered to the user's inbox with mailing instructions, and the product is fully DSGVO-compliant and safe for public launch
**Depends on**: Phase 2
**Requirements**: MAIL-01, MAIL-02, MAIL-03, PRIV-01, PRIV-04
**Success Criteria** (what must be TRUE):
  1. User receives the generated letter by email, including the politician's full postal address and clear instructions for handwriting and mailing
  2. No user frustration text or generated letter is stored after the email is sent
  3. The Datenschutzerklaerung accurately covers PLZ processing, email usage, and OpenAI API data handling
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Brevo email module and HTML email template
- [x] 03-02-PLAN.md — Wire email into server actions, remove letter from client, add ?text= pre-fill
- [x] 03-03-PLAN.md — Rewrite Datenschutzerklaerung with full DSGVO Art. 13 disclosures

## Backlog

### Phase 999.1: surv.ai User-Feedback Integration (BACKLOG)

**Goal:** Embed a surv.ai feedback link after the letter generation flow to collect real user feedback ("Hat der Brief geholfen?"). Enables validation without building custom analytics.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.2: surv.ai Persönlicher Kontext-Abfrage (BACKLOG)

**Goal:** Use surv.ai to collect personal context (profession, affiliations, how personally affected) instead of a simple in-app form. Richer data = stronger letters, and surv.ai handles the conversational UX.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.3: Research — Wirksamkeit persönlicher Infos auf Abgeordnete (BACKLOG)

**Goal:** Research and quantify how much personal details (profession, union/association membership, direct personal impact) influence whether a letter gets read, forwarded, or acted on by an Abgeordnete. Informs how aggressively to push context collection in the UX.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.4: Link Petitionsseiten (Change.org, WeAct) auf Landing/Success Page (BACKLOG)

**Goal:** Auf Landing Page und/oder Success Page zu Petitionsplattformen (Change.org, WeAct, weitere) verlinken, um progressive Causes zu unterstützen und dem Nutzer nach dem Brief weitere Handlungsoptionen anzubieten. Offene Fragen: Welche Plattformen taggen? Wo platzieren (Landing vs. Success)? Thematisch gefiltert nach Issue?
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.5: CTA Copy — "Schreib der Politik!!" als Alternative diskutieren (BACKLOG)

**Goal:** Alternative CTA-Formulierungen evaluieren. Thomas's Idee: "Schreib der Politik!!" könnte klarer/direkter sein als aktuelle Variante. Noch zu diskutieren — keine Entscheidung getroffen. Ggf. A/B-Testing oder Nutzerfeedback einholen.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.6: Landtag + Kommune politician coverage expansion (BACKLOG)

**Goal:** Expand politician data beyond Bund-level MdBs to Landtag and Kommune representatives. Currently only Bundestag MdBs are cached — ~80% of real citizen concerns (local infrastructure, education, housing, policing, waste, Bauanträge) are routed to the wrong level of government. The letter prompt papers over this by asking the AI to justify contacting a Bund-MdB about a local issue; proper fix = real multi-level coverage.

Research before building: have an AI agent evaluate candidate data sources and produce a strategy doc in `.planning/research/` ranking by coverage/freshness/license/effort. Sources to evaluate: (1) Abgeordnetenwatch.de v2 API — check Landtag/Stadtrat coverage (likely partial); (2) per-Landtag APIs (heterogeneous formats, prioritise by population); (3) **OParl standard** — uniform schema adopted by ~100 German cities (Köln, München, Münster...), ideal for scalable Kommune coverage; (4) Ratsinformationssysteme (SessionNet, ALLRIS) for smaller Kommunen without OParl; (5) bpb / GovData / Destatis for occasional curated datasets.

Deliverable: phased rollout (e.g. Landtage via Abgeordnetenwatch → OParl cities → top-N manual Kommunen) with effort estimate per phase.

Integration points: extend `fetch-politician-data.ts` with per-level fetchers; `PoliticalLevel` type already supports Bund/Land/Kommune; letter prompt already does level detection; disambiguation UI must surface the level prominently so users pick the right recipient.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.7: Partner with abgeordnetenwatch.de for credibility (BACKLOG)

**Goal:** Formalise a partnership / mutual mention with abgeordnetenwatch.de. We already depend on their v2 API for all politician data — a visible partnership would massively boost legitimacy with the target audience (politically engaged German citizens who trust aw.de), open a channel for official logo use / backlinks, and could unlock Landtag/Kommune data access ahead of 999.6.

Actions to explore (cheapest first):
1. Add an attribution line on the landing page + email footer ("Politikerdaten von abgeordnetenwatch.de — CC0") — unilateral, no negotiation needed, goes live today.
2. Write a short outreach email to aw.de (info@abgeordnetenwatch.de) introducing Brief nach Berlin, asking if they'd link back / mention it in a newsletter, and whether they'd collaborate on cross-level coverage.
3. Propose a feature swap: they link to Brief-nach-Berlin from constituent-engagement pages, we link prominently to their MdB-profile and vote history.
4. Offer to contribute: give them anonymised aggregate data on which topics drive real handwritten letters per Wahlkreis (valuable signal they don't currently have).
5. Long-term: co-branded campaigns around Bundestagswahlen / Petitionsausschuss-Jahresbericht moments.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.8: Disambiguation UI — show district / Kreis context (BACKLOG)

**Goal:** When a PLZ spans multiple Wahlkreise (26% of PLZs, up to 12 politicians for Berlin), users currently see only "Wahlkreis {ID}: {wahlkreisName}" + party. For Berlin this works — wahlkreisNames already contain districts ("Berlin-Mitte", "Berlin-Steglitz-Zehlendorf"). For other cities the information is too thin for a citizen to pick the right representative.

Investigation (2026-04-17) confirmed:
- politicians-cache.json has only `wahlkreisId` and `wahlkreisName`, no Gemeinde / Kreis / neighborhood field.
- `geonames_de.txt` (already in the data pipeline) carries admin2Name (Kreis) per PLZ — unused today.
- `btw25_wkr_gemeinden.csv` has `Gemeindename` and `Gemeindeteil` but only for each Gemeinde's administrative PLZ, not comprehensively.

Approach (cheapest first):
1. **Extend the build script** (`parse-plz-mapping.ts` / `fetch-politician-data.ts`) to surface admin2Name (Kreis) when materialising politicians-cache, keyed by the wahlkreis. Add a `kreisName` or `areaHint` field per politician.
2. **Disambiguation UI** shows the extra line under the party badge: e.g. "CDU · Kreis Darmstadt-Dieburg" — disambiguates the two Darmstadt WKs.
3. **Optional Phase B:** full PLZ → Gemeinde enrichment via geonames reverse lookup during cache generation, so the user sees their actual city/town.

Success criteria: for every PLZ with ambiguity, the disambiguation cards show enough geographic context that a non-expert can confidently pick the right Wahlkreis in under 10 seconds.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.9: Test coverage — PLZ lookup, Zod schemas, Mistral parse fallback (BACKLOG)

**Goal:** Playwright is in devDependencies but no tests exist. The highest-leverage targets are:
1. **PLZ lookup** (`lib/lookup/plzLookup.ts`) — every known PLZ returns ≥1 Wahlkreis; a deliberately invalid PLZ returns empty; disambiguation case (multiple WKs) returns expected politician list.
2. **Zod schemas** (`lib/validation/wizardSchemas.ts`) — step1/step1b/step2 reject malformed inputs (non-5-digit PLZ, invalid email, oversized issueText).
3. **Mistral JSON parse fallback** (`lib/generation/generateLetter.ts` lines ~113–119) — handles both clean JSON and markdown-wrapped JSON responses without throwing; politician-ID validation falls back to first-in-list on unknown ID.
4. **Moderation wrapper** — flagged vs. unflagged category handling.
5. **Rate limiter** (`lib/rateLimit.ts`) — allows up to N, rejects N+1, resets after window.
6. **Email HTML builder** — HTML escaping covers <, >, &, quotes, apostrophes; address splitting works for multi-line postal addresses.

Not MVP-critical; schedule after first real user cohort. Estimated effort: 2–4 hours using Vitest (or Node's built-in test runner) for unit tests, Playwright for a single end-to-end happy path (PLZ → email sent). Should run in CI on every push.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.10: v2 — Optionales zweites Eingabefeld "Zielvorstellung / Wunsch" (BACKLOG)

**Goal:** Nutzer beschreibt nicht nur das Problem, sondern auch wie eine Lösung aussehen könnte. Macht den Brief konkreter und konstruktiver — nicht nur Beschwerde, sondern Forderung. Offene Frage: erhöht das die Hürde am Anfang zu sehr? Eventuell als optionaler Klappschritt nach dem Hauptinput. Erstmal parken, in v2 testen.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.11: Spenden annehmen via Buy Me a Coffee (BACKLOG)

**Goal:** Nach erfolgreichem Brief eine niedrigschwellige Möglichkeit anbieten, das Tool finanziell zu unterstützen. Primärer Ort: am Ende der Email mit dem fertigen Briefentwurf, optional auch dezent auf der Success-Page. Kanäle prüfen: Buy Me a Coffee, Ko-fi, Stripe-Donate-Link. Niedrige Friction, kein Account, keine PII-Erfassung. Open Questions: (1) Platzierung — vor/nach Footer in der Mail? Auch auf Success-Page oder nur Mail? (2) Tonalität — locker ("Spendier mir einen Kaffee") vs. seriös ("Initiative unterstützen"). (3) Impact-Messung — Conversion-Rate, durchschnittliche Spendenhöhe. (4) DSGVO-Implikationen für Buy-Me-a-Coffee/Ko-fi (Drittanbieter-Tracking).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.12: "Treppe der Selbstwirksamkeit" auf Success Page + Email verlinken (BACKLOG)

**Goal:** Die Seite `/treppe-der-selbstwirksamkeit` ist fertig aber nirgendwo verlinkt — weder auf der Success Page noch in der Email. Nutzer, die gerade einen Brief geschrieben haben, haben maximale Motivation und sollten direkt zu weiteren Wegen der politischen Teilhabe geführt werden.

Konzept (Gemini-Input, 2026-04-27):
1. **Success Page (`Step3Success.tsx`):** Sektion "Und was kommt danach?" / "Lust auf mehr Wirkung?" mit Hook: "Du hast gerade Stufe 3 von 10 erklommen — damit bist du bereits weiter als 95% der Bevölkerung." Button/Link → `/treppe-der-selbstwirksamkeit`.
2. **Email-Template (`buildEmailHtml.ts`):** Subtiler Block nach "Nächste Schritte": "Dein Brief ist ein starkes Zeichen. Es gibt noch 9 weitere Wege, wie du in Deutschland wirklich etwas bewegst — von 60-Sekunden-Petitionen bis zur eigenen Bürgerinitiative." + Link "Alle 10 Stufen ansehen".

Warum es funktioniert: Gamification via Level-Logik ("du bist auf Stufe 3"), Neugier auf weitere Stufen, Momentum-Capture im richtigen Moment.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.13: Vercel Web Analytics deaktivieren + Datenschutz anpassen (BACKLOG)

**Goal:** Vercel Web Analytics wurde initial aktiviert, um in der Pre-Validation-Phase Traffic-Insights zu sammeln (cookielos, anonymisiert, DSGVO-konform via berechtigtes Interesse Art. 6 Abs. 1 lit. f). Sobald genug Validierungsdaten vorliegen bzw. eine privacy-freundlichere Alternative gefunden ist, soll Analytics wieder ausgeschaltet werden, um das Datensparsamkeits-Versprechen v1 voll einzuhalten.

**Wichtiger Datenschutz-Disclaimer (jetzt schon in der Datenschutzerklärung verankern):** Analytics wird ausschliesslich genutzt, um Brief nach Berlin in der Anfangsphase zu skalieren (Reichweite verstehen, Crashes/Fehler erkennen, Performance-Probleme finden). Daten werden niemals an Dritte verkauft, niemals zur Profilbildung verwendet, niemals mit Werbenetzwerken geteilt. Sobald die Plattform stabil läuft, wird Analytics deaktiviert.

Tasks:
1. Datenschutzerklärung JETZT um diesen Disclaimer ergänzen (Phase 1 — sofort, nicht erst bei Deaktivierung)
2. Vercel Web Analytics im Dashboard deaktivieren (später, bei Reife der Plattform)
3. Entsprechenden Absatz aus Datenschutzerklärung entfernen
4. DSGVO-TODO.md aktualisieren
5. Optional: privacy-freundliche Alternative evaluieren (z.B. Plausible Self-Hosted, Umami, oder komplett ohne Analytics)

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.14: Petition-per-URL — Shareable Anliegen-Links (BACKLOG)

**Goal:** User erstellt Brief → generiert shareable Link (URL-Parameter, kein Datenbank-Eintrag, DSGVO-konform). Andere User öffnen Link → Anliegen ist vorausgewählt, sie generieren ihren eigenen Brief frisch. Kein Backend nötig.

Konzept (aus /gsd-explore Session, 2026-05-08):
- Mistral generiert einen kurzen Anliegen-Slug (~60-80 Zeichen) für die URL
- URL-Parameter encoded das Anliegen (kein Datenbankpersistenz, vollständig stateless)
- Empfänger landen auf dem Wizard mit vorausgefülltem Anliegenfeld — können ergänzen oder direkt generieren
- Jeder User erhält seinen eigenen, frisch generierten Brief (eigene PLZ, eigener Politiker) — Qualität bleibt hoch
- Viral-Mechanismus: "Ich habe gerade einen Brief an meinen MdB zu Klimaschutz geschrieben — tu es auch" + Link
- Design-Implementierung soll mit taste-skill / frontend-design skill passieren
- Ausführung noch offen — v1-Konzept ist geklärt, technische Details (URL-Encoding-Strategie, Länge) müssen noch ausgearbeitet werden

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Page & Data Infrastructure | 0/TBD | Not started | - |
| 2. Core Engine | 0/4 | Planned | - |
| 3. Email Delivery & Privacy Compliance | 0/3 | Planned | - |
