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

### Phase 999.6: Landtag + Kommune politician coverage expansion (BACKLOG)

**Goal:** Expand politician data beyond Bund-level MdBs to Landtag and Kommune representatives. Currently only Bundestag MdBs are cached — ~80% of real citizen concerns (local infrastructure, education, housing, policing, waste, Bauanträge) are routed to the wrong level of government. The letter prompt papers over this by asking the AI to justify contacting a Bund-MdB about a local issue; proper fix = real multi-level coverage.

Research before building: have an AI agent evaluate candidate data sources and produce a strategy doc in `.planning/research/` ranking by coverage/freshness/license/effort. Sources to evaluate: (1) Abgeordnetenwatch.de v2 API — check Landtag/Stadtrat coverage (likely partial); (2) per-Landtag APIs (heterogeneous formats, prioritise by population); (3) **OParl standard** — uniform schema adopted by ~100 German cities (Köln, München, Münster...), ideal for scalable Kommune coverage; (4) Ratsinformationssysteme (SessionNet, ALLRIS) for smaller Kommunen without OParl; (5) bpb / GovData / Destatis for occasional curated datasets.

Deliverable: phased rollout (e.g. Landtage via Abgeordnetenwatch → OParl cities → top-N manual Kommunen) with effort estimate per phase.

Integration points: extend `fetch-politician-data.ts` with per-level fetchers; `PoliticalLevel` type already supports Bund/Land/Kommune; letter prompt already does level detection; disambiguation UI must surface the level prominently so users pick the right recipient.

**Requirements:** POLI-10 (Sub-phase A: Landtag via Abgeordnetenwatch for NRW/BY/BW/NI + Mistral level routing + level badge in disambiguation UI; Kommune-Flow pivoted 2026-05-22 to Generic-Rathaus-Brief mit synthetischem Stadtverwaltung-Recipient, siehe PLAN 07)
**Plans:** 7 plans (post-review 2026-05-21)

Plans:
- [ ] 999.6-01-PLAN.md — Build-time PLZ→Stimmkreis pipeline for top-4 Länder + OpenPLZ enrichment (Wave 1)
- [ ] 999.6-02-PLAN.md — Fetch Landtag mandates for all 16 parliaments via Abgeordnetenwatch (Wave 2)
- [ ] 999.6-03-PLAN.md — Static landtag-addresses.json + zustaendigkeit-taxonomie.json (Wave 1)
- [ ] 999.6-04-PLAN.md — routeToLevel Mistral server function + Land-aware lookupPLZ + graceful degradation (Wave 3)
- [ ] 999.6-05-PLAN.md — LevelBadge + LevelOverrideChips + EuComingSoonCard + disambiguation grouping + coverage hint (Wave 4)
- [ ] 999.6-06-PLAN.md — generateLetter level+mode adaptation (Anrede gender-resolved, no GG-Artikel, Stellvertretend-Framing) (Wave 4)
- [ ] 999.6-07-PLAN.md — Generic-Rathaus-Brief mit synthetischem Stadtverwaltung / Bezirksamt-Recipient + RathausAdresseHint + Stadtstaat re-route (Wave 4)

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

### Phase 999.15: Public Letter-Generation API für Dritt-Plattformen (BACKLOG)

**Goal:** Brief-nach-Berlin als Infrastruktur öffnen — Drittanbieter (Civic-Tech-Tools, NGOs, Journalisten, Petitionsplattformen, andere Bürger-Portale) sollen per HTTPS-API ihren Nutzer:innen Briefe an die richtigen Abgeordneten generieren lassen können, ohne das eigene UI verlassen zu müssen. Brief nach Berlin liefert dabei (a) PLZ → Politiker-Resolution (alle Ebenen), (b) Anliegen → personalisierter Brieftext, (c) optional Versand-Anleitung. Der Mehrwert für uns: technische Reichweite, Markenbekanntheit ("Powered by brief-nach-berlin.de"), und perspektivisch eine Einnahmequelle, die unabhängig von der B2C-Conversion ist.

**Trigger (2026-05-16):** Erwähnung im Podcast *Lage der Nation* — größter politischer Podcast in DACH, Zielgruppe = exakt die politisch engagierten Multiplikatoren, die so eine API in eigenen Tools verbauen würden. Vor diesem Moment war API-Demand reine Spekulation; jetzt potenziell real. **Bevor irgendwas gebaut wird:** abwarten und zählen, wie viele inbound-Anfragen nach genau dieser Funktionalität in den nächsten 2-4 Wochen reinkommen.

#### API-Design (Kern-Endpoints)

Minimal-viable Surface: drei Endpoints, REST + JSON, kein GraphQL-Overengineering.

1. **`POST /api/v1/politicians/lookup`** — PLZ-Auflösung
   - Input: `{ plz: "10115", level?: "bund" | "land" | "kommune" | "auto" }`
   - Output: `{ politicians: [{ id, name, party, level, wahlkreisName, kreisName?, address }], ambiguous: boolean }`
   - Wiederverwendbar: viele Tools wollen NUR die Auflösung, nicht den Brief.

2. **`POST /api/v1/letters/generate`** — Brief-Generierung
   - Input (Minimum):
     - `plz: string` (Pflicht, 5-stellig, Zod-validiert)
     - `issueText: string` (Pflicht, 50-2000 Zeichen, Bürger-Anliegen)
   - Input (Optional):
     - `tone: "sachlich" | "bestimmt" | "drastisch"` — Default: `"bestimmt"` (siehe unten)
     - `level: "bund" | "land" | "kommune" | "auto"` — Default: `"auto"` (LLM-Routing wie heute)
     - `politicianId: string` — explizite Wahl, überspringt Disambiguierung
     - `salutation: "Sie" | "Du"` — Default: `"Sie"`
     - `signatureName: string` — wenn Anbieter den Namen schon hat
     - `language: "de"` — v1 nur Deutsch, Feld reserviert
     - `webhook: string` — async-Mode für lange Generierung (>10s Vercel-Limit umgehen)
   - Output: `{ letterId, letter: { recipient, body, address }, generatedAt, tokensUsed }`
   - Failure-Modi sauber: `400` bei Zod-Fail, `422` bei Moderation-Reject, `429` bei Rate-Limit, `503` bei Mistral-Down.

3. **`POST /api/v1/letters/moderate`** — Standalone Safety-Check (optional)
   - Input: `{ text: string }`
   - Output: `{ flagged: boolean, categories: [...] }`
   - Erlaubt Anbietern, schon vor dem teuren Generate-Call zu filtern → spart Kosten beidseits.

#### Tonalität / "Defaultstärke" (das Thomas-Konzept)

Drei Stufen, klar definiert im System-Prompt, nicht als Slider sondern als Enum:

| Stufe | Charakter | Beispiel-Phrasing |
|-------|-----------|-------------------|
| `sachlich` | Faktenbasiert, höflich, kein emotionaler Aufschlag. Schwerpunkt auf Problembeschreibung und Frage nach Position. | "Ich bitte Sie um Ihre Einschätzung zu …" |
| `bestimmt` *(Default)* | Klare Haltung, fordernd aber respektvoll, expliziter Handlungsappell. Sweet Spot für die meisten Anliegen. | "Ich erwarte von Ihnen als meiner gewählten Vertretung, dass …" |
| `drastisch` | Maximale rhetorische Schärfe innerhalb der Grenzen des Respekts (keine Beleidigung, keine Drohung — sonst Moderation-Block). Macht Dringlichkeit + persönliche Betroffenheit unmissverständlich. | "Ihre bisherige Untätigkeit ist nicht hinnehmbar. Ich werde meine Wahlentscheidung an Ihrer Reaktion auf diesen Brief messen." |

**Warum Default `bestimmt`:** Sachlich ist zu zahnlos für die emotionale Realität der Nutzer:innen (siehe Lage-der-Nation-Demographie). Drastisch ist riskant bei Bulk-Verwendung durch Drittanbieter (Image-Risiko für uns + Spam-Wirkung bei MdBs). Bestimmt ist die robusteste Default-Wahl.

**Wichtig:** `drastisch` MUSS doppelte Moderation durchlaufen (vor + nach Generierung), und Drittanbieter sollten standardmäßig nur `sachlich` und `bestimmt` aktiviert haben — `drastisch` als opt-in mit separatem Approval pro API-Key.

#### Auth & Identitäts-Modell

- **API-Keys** (`Authorization: Bearer bnb_live_xxx...`), keine OAuth-Flows in v1 — overkill.
- Key-Format: prefix `bnb_test_` (free, gedrosselt) und `bnb_live_` (registriert, mit Quota).
- Registration: einfaches Formular auf `/api/signup` — Email + Name + Use-Case-Beschreibung. Manuelle Freischaltung in v1 (kein Self-Service). So filtern wir Spam-Anbieter raus, bevor sie unsere Mistral-Kosten verbrennen.
- **Per-Key Tracking:** Postgres oder Vercel KV mit `{ keyId, requestsToday, requestsMonth, tokensThisMonth, plan }`.
- KEIN User-Account auf API-Seite (analog zum B2C-Produkt — DSGVO-Minimalismus).

#### Rate-Limiting & Kostenkontrolle

- **Sliding Window** via Upstash Redis (analog zum existierenden `lib/rateLimit.ts`).
- Default-Limits Test-Tier: 10 Letters/Tag, 100 Lookups/Tag.
- Default-Limits Live-Tier (free): 100 Letters/Tag, 1000 Lookups/Tag.
- Hard-Stop bei monatlichem Token-Budget pro Key (z.B. 100k Mistral-Tokens für Free-Tier ≈ 50 Briefe). Verhindert Mistral-Bill-Shock.
- Globaler Notbremsen-Toggle: ENV-Variable `API_KILL_SWITCH=true` schaltet alle Drittanbieter-Calls sofort ab, ohne dass B2C betroffen ist.

#### Missbrauchs-Risiken & Mitigation

Das ist die kritischste Sektion — hier kann das Projekt ernsthaft Schaden nehmen.

1. **MdB-Spam-Risiko:** Eine API macht es trivial, 1000+ generierte Briefe an einen einzelnen MdB zu schicken (Bot-Farmen, politische Aktivisten, ausländische Akteure). Das wäre nicht nur ethisch problematisch, sondern würde abgeordnetenwatch.de und die Bundestagsverwaltung gegen uns aufbringen.
   - **Mitigation:** API liefert NUR den Brief-Text, NICHT den Versand. Drittanbieter müssen den Brief selbst zustellen (per User-Handschrift, wie im B2C-Flow). Email-Versand bleibt B2C-only.
   - **Mitigation:** Briefe enthalten unsichtbares Wasserzeichen (`X-Generated-By: brief-nach-berlin-api/v1` in Email-Header oder als kleiner Footer im PDF), damit wir auffällige Muster bei MdBs erkennen können.

2. **Hate-Speech-Vehikel:** Drittanbieter könnten User-Inputs vorab manipulieren, um drastische Inhalte durchzudrücken.
   - **Mitigation:** Doppelte Moderation (Input + Output). Bei `drastisch` zusätzlich striktere Schwellen.
   - **Mitigation:** Abuse-Reporting-Endpoint, plus Recht, Keys jederzeit zu sperren (in ToS verankert).

3. **Brand-Hijacking:** Anbieter könnte mit „Powered by brief-nach-berlin.de" werben, aber selbst grenzwertige Tools sein.
   - **Mitigation:** Approval-Schritt vor Live-Key-Vergabe. Klare ToS-Klauseln zu Branding und akzeptablen Use-Cases.

4. **Mistral-Bill-Shock:** Ein Bug in Drittanbieter-Code könnte 10.000 Calls/Stunde verursachen.
   - **Mitigation:** Per-Key Quotas (siehe Rate-Limiting), Vercel-Edge-Cap auf 50 req/min global pro Key.

#### Pricing-Modelle (zu evaluieren, NICHT zu entscheiden bevor reale Demand validiert ist)

| Modell | Pro | Contra |
|--------|-----|--------|
| **Free + manuelle Genehmigung** *(v1-Default)* | Niedrige Hürde, gut für Adoption, gute Filterung über Approval | Keine Einnahmen, Kosten wachsen mit Adoption |
| **Freemium** (100 Briefe/Monat free, danach €0.10/Brief) | Echte Monetarisierung, deckt Mistral-Kosten 5x+ | Stripe-Integration, Billing-Komplexität, höhere Hürde |
| **Spenden-basiert** ("Pay what you want") | Mission-Fit (Civic Tech), kein Vendor-Lock-Gefühl | Vermutlich <5% Pay-Through, deckt Kosten kaum |
| **Tiered Subscriptions** (€9/29/99/Monat nach Volume) | SaaS-Standard, planbarer Revenue | Klassisches Vendor-Modell, passt schlecht zu Civic-Tech-Vibe |

**Empfehlung für v1:** Free + manuelle Genehmigung, mit klarer Kommunikation "wir behalten uns vor, in v2 Bezahlmodelle einzuführen". So lernen wir, ob die Demand echt ist, ohne dass Pricing der Adoptions-Blocker wird.

#### ToS-Eckpunkte

1. Briefe dürfen nur an natürliche/juristische Personen versandt werden, die der User selbst kontaktieren würde — kein Bulk-Versand, keine Bot-Pipelines.
2. Drittanbieter ist verpflichtet, User über die Herkunft des Brief-Textes zu informieren ("Generiert mit Brief-nach-Berlin-API").
3. Verbot von: Hate Speech, Drohungen, Wahlbeeinflussung durch ausländische Akteure, Werbung, Spam.
4. Wir behalten uns das Recht vor, Keys jederzeit ohne Ankündigung zu sperren.
5. Haftungsausschluss: Briefe sind KI-generierte Drafts, finale Verantwortung beim Endnutzer.
6. Logs (anonymisiert, ohne Brief-Inhalt) werden 30 Tage zur Missbrauchserkennung gespeichert — DSGVO-konform via Art. 6 (1) f.

#### Wann macht das Sinn?

**Voraussetzungen, bevor in Bau gehen:**

1. **B2C-Validierung muss stehen:** Mindestens 100 Briefe von echten Nutzern, klare Conversion-Funnel-Metrics, stabile Mistral-Kosten pro Brief.
2. **Mindestens 5 echte inbound API-Anfragen** von potenziellen Drittanbietern in den ~4 Wochen nach Lage-der-Nation-Erwähnung. Wenn keine kommen → nicht bauen, war Bauchgefühl.
3. **Phase 999.6 (Multi-Level Politiker-Coverage) sollte vorher fertig sein** — eine API, die nur Bund liefert, wäre für 80% der realen Anliegen kaputt.

**Entwicklungsaufwand-Schätzung** (wenn diese Voraussetzungen erfüllt sind): ~2 Wochen für MVP-Endpoints + Auth + Dokumentation + minimale Developer-Landing-Page (`/developers`).

#### Konkrete nächste Schritte (vor Promotion zu aktiver Phase)

1. **Nichts bauen.** Auf inbound Demand warten.
2. **Demand quantifizieren:** Track in einer Notion/Sheet jede inbound Anfrage nach API/Integration → wenn 5+, ernsthaft promoten.
3. **Falls 1-2 sehr ernsthafte Anfragen:** Manuelle Whitelabel-Integration für genau diesen Anbieter (Custom HTTP-Endpoint, ohne öffentliche API). Lernt 80% der Public-API-Lessons mit 20% des Aufwands.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.16: Follow-up-Email — Wirksamkeit zeigen & Stories sammeln (BACKLOG)

**Goal:** In die zweite Follow-up-Email (Feedback-Mail) einen zusätzlichen Block einbauen: "Melde dich gerne, wenn sich in deinem Anliegen etwas getan hat oder jemand auf deinen Brief reagiert hat — wir würden deine Geschichte mit deiner Erlaubnis gerne veröffentlichen." Verlinkt einen HeySpeak-Link, über den die Person sich melden kann (Voice oder Call). Ziele: (1) Wirksamkeit des Tools sichtbar machen, (2) Social Proof für mehr Nutzer:innen generieren, (3) Stories für Marketing/Lage-der-Nation/LinkedIn gewinnen.

**Offene Fragen:**
- In welche Mail genau (Feedback-Email = die mit Star-Rating, token-gated)?
- Wie formulieren ohne den Feedback-CTA zu kannibalisieren?
- HeySpeak-Link mit eigenem Topic/Magic-Link pro Empfänger oder generisch?
- Opt-in für Veröffentlichung explizit in der Anfrage klären (DSGVO + Vertrauen)?
- Lohnt sich ein eigener `/stories`-Bereich auf der Site als Ziel/Anchor?

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.24: Level-Routing-UI-Hinweis — Übergangsstütze bis 999.6 (BACKLOG)

**Goal:** Tina (Review c6ae8c89, 5★, PLZ 12163, Berlin-Steglitz-Zehlendorf): `politicalLevel: "Kommune"` aber `representativeLevel: "Bund"` (Ruppert Stüwe, SPD). Der Mistral-Klassifier hat das Anliegen als Kommune-Sache erkannt, das System hat trotzdem den Bundestags-MdB zugewiesen. Bis 999.6 live ist, sollten User wenigstens darauf hingewiesen werden.

**Cluster:** Adressaten-Routing (Cluster 5).

**Priorität:** P3 — Übergangslösung. Voll gelöst durch 999.6 (Landtag + Kommune).

**Fix-Skizze:** Auf der Politiker-Auswahl-Seite: wenn `politicalLevel === "Kommune"` oder `politicalLevel === "Land"` und Phase 999.6 noch nicht aktiv → kleiner Hinweis-Banner: "Dein Anliegen klingt nach Kommune/Landtag. Bund-Briefe sind möglich, aber die Wirkung ist kleiner. Landtag- und Stadtverwaltungs-Briefe kommen demnächst."

**Aufwand:** 0,2 Tag.

**Quellen:** Tina (Review c6ae8c89).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.23: Multi-Recipient — auch an Bundespräsident / Regierungspartei schicken (BACKLOG)

**Goal:** Christina aus Kassel (Review f371f6e0, 5★): "gleiches Schreiben geht es den Bundespräsidenten". Doro Berlin (Review 6a7c022b, 5★ trotzdem, aber nicht abgeschickt): "möchte mein Anliegen nicht an meine Grüne MdB, sondern an CDU und SPD, die in Regierung sind". User wünschen sich explizit Mehrfach-Versand jenseits des Wahlkreis-MdB.

**Cluster:** Adressaten-Wunsch (Cluster 5).

**Priorität:** P2 — Doros Verhalten ist eine stille Abbruchsursache (sent=false trotz 5★).

**Fix-Skizze:** Auf der Success-Page Chip-Reihe "Auch an … schicken": (1) Bundespräsident (statische Adresse), (2) Regierungspartei-MdB im selben Wahlkreis, (3) Fachausschuss-Vorsitz zum Thema. Pro Auswahl wird ein zweiter Brief generiert mit angepasster Anrede + 1-Satz-Begründung ("Ich schreibe Ihnen, weil Ihre Partei in der Regierungsverantwortung steht").

**Aufwand:** 1-2 Tage.

**Quellen:** Christina Kassel (Review f371f6e0), Doro Berlin (Review 6a7c022b — `letter_sent: false`).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.22: Kurz-Option — "0,5 Seiten / ~120 Wörter" (BACKLOG)

**Goal:** Johannes (Review dac265b5): "Für einzelne Anliegen finde ich 1-3 Seiten zu lang. Hier wäre es besser präzise zu sein anstatt viel Text zu generieren." Heute gibt es nur 1 / 1,5 / 2 Seiten.

**Cluster:** Brief-Länge (Cluster 6).

**Priorität:** P2 — Quick Win, addressiert ein konkretes Bedürfnis.

**Fix-Skizze:** Vierte Option "Kurz und präzise" in `LETTER_LENGTHS` (web/src/lib/config.ts) mit min=110 / max=140. Plus Prompt-Hint: "Bei kurzer Länge: keine Vita-Bausteine, keine Pflicht-Anrede-Höflichkeitsfloskel, direkt zum Anliegen."

**Aufwand:** 0,3 Tag.

**Quellen:** Johannes (joimurlaub, Review dac265b5).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.21: "Brief nachschärfen" als Feature — In-App-Iteration statt Doku-Seite (BACKLOG)

**Goal:** Alex Berlin (Review 376dc8e4, 4★): "Review Funktion für eine Feedback Schleife direkt in der App wäre super". Johannes (Review dac265b5): "Vielleicht könnte man in der Email eine Option anbieten Prompt anpassen, die dann Vorschläge macht". Implizit: Dora, l.landmann, Florian — alle wollen iterieren ohne Tool-Wechsel.

**Cluster:** In-App-Iteration (Cluster 4).

**Priorität:** P2 — Größter Convert-Hebel (3★→5★-Konversion).

**Fix-Skizze:** In der Letter-Mail ein zusätzlicher Button "Brief nachschärfen" → öffnet [/brief-verbessern](https://brief-nach-berlin.de/brief-verbessern) mit vorausgefülltem Brief + Token. Tokenisiert, sodass der Brief client-side rein lädt (DSGVO-konform, kein DB-Storage). Die `/brief-verbessern`-Seite kriegt eine zweite Variante mit Live-Re-Generation (statt nur Prompt-Copy für externe Tools) — User gibt 1-2 Sätze Hinweis ("schärfer", "persönlicher", "Erwähne dass ich selbst betroffen bin"), Server triggert 2. Generation-Call.

**Aufwand:** 1-2 Tage.

**Quellen:** Alex Berlin (Review 376dc8e4), Johannes (Review dac265b5), implizit 4 weitere (Dora, l.landmann, Florian, Anna Wartewig).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.20: Wortzahl-Korridor — Off-by-One bei knappem Unterschreiten (BACKLOG)

**Goal:** `wordCountInRange: false` in 8 von 21 LIVE-Reviews (38%) trotz Retry-Logik. Beispiele: Review d-office (4★, 173 Wörter, < Min 200, kein Retry weil unter `min × 0.85 = 170`), Barbara (5★, 251 Wörter > Max 240). User sehen Briefe außerhalb der gewählten Länge, ohne dass das thematisiert wird.

**Cluster:** Länge / Korridor (Cluster 6).

**Priorität:** P1 — Quick Win, Vertrauen.

**Fix-Skizze:** (a) Retry-Trigger-Off-by-One in [web/src/lib/generation/generateLetter.ts](web/src/lib/generation/generateLetter.ts) Z. 318+: bei `wordCount < min` immer retry, nicht erst unter `min × 0.85`. (b) UI-Hinweis bei finaler Out-of-Range: kleine Banner-Notiz auf Success-Page: "Hinweis: Dein Brief ist 173 Wörter (du hattest 1 Seite gewählt, ~200-240). Du kannst ihn ergänzen oder so schicken."

**Aufwand:** 0,3 Tag.

**Quellen:** d-office, Barbara Spelger, Anne aus Uelzen, Florian Ennepetal — alle Reviews mit `wordCountInRange: false`.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.19: Position-Probe — Pre-Check "Bist du FÜR oder GEGEN X?" + Echo auf Success-Page (BACKLOG, PARKED)

**Status:** PARKED 2026-05-27 — Thomas: "find ich komisch, erstmal nicht wichtig". Reaktivierung, wenn Position-Inversion (Cluster 3) wieder häufiger in Reviews auftaucht oder ein konkreter User direkt nach einer "Verstanden?"-Checkschleife fragt. Bis dahin nicht ausarbeiten.

**Goal:** Katja (Review d9c8fb60, 2★, E-Auto-Besitzerin gegen Heizungsgesetz → KI hat pro-Klima-Brief geschrieben). Florian (Review b2ec9816, 3★): "Im Brief wurde eine Änderung gefordert, statt die geplante Änderung zu kritisieren". 2 von 19 Body-Reviews zeigen aktive Position-Umkehrung. Schmerzpunkt rettet 1★/2★-Reviews.

**Cluster:** Position-Inversion (Cluster 3).

**Priorität:** P1 ursprünglich, jetzt geparkt.

**Fix-Skizze:** Vor der Brief-Generation ein 1-Satz-Mistral-Small-Call (temp=0.1) "Bist du FÜR oder GEGEN X, und warum?". Output als `<position>`-Anker in den Hauptprompt. Auf der Success-Page über dem Brief 1 Zeile: "Wir haben verstanden: Du bist GEGEN X weil Y. Falls das nicht stimmt — Brief nachschärfen." Kostenseite: ~0,1ct pro Brief zusätzlich.

**Aufwand:** 1 Tag.

**Quellen:** Katja (Review d9c8fb60), Florian Ennepetal (Review b2ec9816), Linus Karlsruhe (Review 3bbbeb0a, 1★, `anliegen_verfehlt`).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.18: Argumentations-Verkettungs-Direktive im System-Prompt (BACKLOG)

**Goal:** Anna Wartewig (Review c33edabf, 2★): "hat eher meine Stichpunkte in Sätze verpackt als sie in einen Zusammenhang zu setzen oder gute Argumentationen aufzubauen". Bestätigt durch Florian ("Wiederholungen"), Katja ("nicht logisch aufgebaut"), Andreas ("wiederholt sich"). Das ist nicht "klingt nach KI" — das ist "fehlende Argumentationskette".

**Cluster:** Authentizität / Argumentations-Aufbau (Cluster 1).

**Priorität:** P1 — Schnellster Cluster-1-Win.

**Fix-Skizze:** Zusätzliche System-Prompt-Direktive in [web/src/lib/generation/generateLetter.ts](web/src/lib/generation/generateLetter.ts) Z. 74+: "Verknüpfe die 1-3 stärksten Stichpunkte zu einer Argumentationskette mit Ursache → Folge → Forderung. Niemals eine Aufzählung ('Erstens, zweitens') und keine Floskel-Brücken ('Nicht nur, sondern auch')." Plus pro Absatz ein logischer Marker (Anlass / Begründung / Forderung).

**Aufwand:** 0,5 Tag (Prompt-Iteration + manueller Test mit 5 echten Inputs).

**Quellen:** Anna Wartewig (Review c33edabf), Florian Ennepetal (Review b2ec9816), Katja (Review d9c8fb60), Dora aus Karlsruhe (Review 518afb81).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.17: MdB-Kontext-Anreicherung fixen — silent failure in Production (BACKLOG)

**Goal:** `mdbContextUsed: false` in 21 von 21 LIVE-Reviews. Die Anreicherung über abgeordnetenwatch (Ausschüsse + jüngste Positionen) läuft systemisch nie scharf. Konsequenz: Die KI hat keinen Anker, was sie über die/den Abgeordnete:n sagen darf, und erfindet (Sven Ruttor: "Ausschuss erfunden", Jonathan Berlin: "Aussagen über mich, die nicht zutreffend sind").

**Cluster:** Halluzination / Faktentreue (Cluster 2 aus Feedback-Analyse 2026-05-27).

**Priorität:** P0 — blockiert Phase 999.6 PLAN-06, weil Level-aware Prompts den Bug auf 3 Ebenen (Bund/Land/Kommune) vervielfältigen würden.

**Fix-Skizze:**
- `fetchMdbContext` in [web/src/lib/enrichment/](web/src/lib/enrichment/) instrumentieren: explizit loggen, warum die Anreicherung scheitert (Timeout? leerer cachedCommittees? Build-Daten fehlen? abgeordnetenwatch-API down?).
- Daten gezielt beheben (z.B. fetch-politician-data.ts ergänzen, Cache neu aufbauen).
- Defensiver Prompt-Block: wenn `<mdb_kontext>` leer/abwesend → expliziter Anti-Halluzinations-Satz "Es liegen KEINE verifizierten Informationen über Ausschüsse oder Positionen dieser/dieses Abgeordneten vor. Erwähne KEINE konkreten Ausschüsse, Reden oder Abstimmungen."

**Aufwand:** 0,5 Tag Audit + 0,5 Tag Fix.

**Quellen:** Sven Ruttor (Review 038e6014, 3★), Jonathan Berlin (Review 4b57e8ed, 2★), plus systemisch jeder generierte Brief seit Launch.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.25: Named-MdB-Suche als zweiter Empfänger-Modus (BACKLOG)

**Goal:** Empfänger-Auswahl erweitern, sodass Nutzer:innen statt der eigenen Wahlkreis-MdBs gezielt eine bestimmte Person anschreiben können (z. B. "ich will Karl Lauterbach schreiben" oder "die Innenministerin"). Heute zwingt der PLZ-Flow zur eigenen Wahlkreis-MdB.

**Vorschlag:** Im Empfänger-Schritt ein Toggle "Meine Wahlkreis-MdBs" vs. "Anderer/andere MdB". Im zweiten Modus: Suchfeld mit Type-Ahead über alle Bundestagsabgeordneten. Datenquelle = bestehende Abgeordnetenwatch-API (`politicians`-Endpoint mit Namens-Filter), also kein neuer Daten-Layer.

**Inspiration:** liebemdb.org bietet diesen Toggle (PLZ / Name) direkt auf der Landing. Konkurrenz-Feature, aktuell nicht von Usern explizit nachgefragt.

**Warum nicht jetzt:** Keine Validierung, dass es ein echter Schmerz ist. PLZ-Flow funktioniert für ~95 % der Nutzer. Erst priorisieren, wenn jemand aktiv danach fragt oder Engagement-Daten es nahelegen.

**Aufwand:** klein, ~halber Tag (Type-Ahead + ein API-Call).

**Voraussetzungen:** Erst nach Abschluss von 999.6 (Landtag/Kommune), damit die Sucharchitektur nicht doppelt umgebaut wird.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.26: Re-Target Flow — Brief auf andere politische Ebene umschreiben (BACKLOG)

**Goal:** User hat Brief generiert (z.B. an Kommune/Landtag/MdB) und will denselben Inhalt für eine andere politische Ebene umformulieren lassen — neuer Adressat, angepasster Hebel und Tonalität, gleicher Kern. Subpage oder Inline-Komponente nimmt bestehenden Brief + Thema + PLZ-Kontext und schreibt via angepasstem System-Prompt für den neuen Empfänger um.

**Validierung zuerst:** Vor dem Bau Klick-Test auf der "Brief fertig"-Seite einbauen — ein Button "Auch an deinen MdB / an deine Kommune schicken?". 1-2 Wochen Daten sammeln. Bei >20% Klickrate lohnt die Implementierung; bei <5% nicht bauen.

**Aufwand (falls validiert):** klein, ~halber Tag. Bestehender State liegt schon vor, neue Server Action `re-target` mit Ebenen-spezifischem System-Prompt (Bundestag/Landtag/Kommune), Inline-Komponente auf der Result-Page.

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.27: Clarifying-Question-Step vor Brief-Generierung (BACKLOG)

**Goal:** Wenn der User-Input zu kurz oder zu breit für eine einseitige Brief-Generierung ist, soll Mistral 1× zurückfragen, bevor generiert wird — statt aus dünnem Input einen vagen oder verdrehten Brief zu halluzinieren. Ziel: weniger 1-2★-Reviews mit Tag `anliegen_verfehlt` bei kurzem Input.

**Cluster:** Brief-Qualität / Input-Vagheit (verwandt mit Cluster 1 aus Feedback-Analyse 2026-05-27).

**Evidenz aus Reviews-Analyse (15 ≤2★-Reviews seit 2026-04-01):**
- 4 von 8 LIVE-Bad-Reviews hatten Input <30 Wörter:
  - drparade (17w, Rating 2)
  - andreas (11w Voice, Rating 1)
  - ennenbach (~10w Voice, Rating 2, Tag `details_erfunden`)
  - linus (~22w, Rating 1, Tag `anliegen_verfehlt`)
- Bei so wenig Input *muss* Mistral raten und rät schlecht
- Backlog-Campaign (5 Reviews) zeigt zusätzlich dominantes Pattern `zu_generisch`

**Skizze (grob, wird vor Umsetzung konkretisiert):**
- Nach Eingabe (Text oder Voice) + bevor `generateLetter()` aufgerufen wird: 1× Mistral-Klassifikator-Call
- Trigger: Input <30 Wörter ODER Klassifikator sagt "zu breit für eine Seite" ODER "Mehrdeutigkeit bei zentraler Forderung"
- Wenn Trigger feuert: 1 Yes/No-Frage oder 2-3 Optionen anzeigen ("Soll ich auf X fokussieren? Oder Y dazunehmen?")
- User-Optionen: (a) Vorschlag akzeptieren → generieren, (b) zweiten kurzen Input nachschießen → generieren, (c) "Trotzdem so generieren" → mit Original-Input
- Max 1 Rückfrage pro Brief (keine Endlosschleife)

**Erwarteter Impact:** Bessere Briefqualität bei kurzem Input → weniger 1-2★-Reviews → mehr verschickte Briefe.

**Risiko:** Zusätzlicher Schritt im Flow kann Conversion senken. → Erst hinter Feature-Flag ausrollen und Funnel messen.

**Nicht adressiert:** Halluzinationen bei *langem* Input (siehe Phase 999.28 "Fakten-Treue-Check"), Level-Mismatch (eigenes Feature, siehe 999.6).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.28: Fakten-Treue-Check — zweiter Mistral-Pass gegen Halluzination (BACKLOG)

**Goal:** Auch bei *ausreichend langem* User-Input verdreht oder erfindet Mistral Aussagen (Geschlecht, politische Position, persönliche Details). Ein zweiter Mistral-Pass nach der Generierung soll alle Behauptungen im Brief gegen den Original-Input prüfen und nicht-belegte Claims markieren oder streichen, bevor der Brief dem User gezeigt wird.

**Cluster:** Halluzination / Faktentreue (Cluster 2 aus Feedback-Analyse 2026-05-27, verwandt mit 999.17).

**Evidenz aus Reviews-Analyse (15 ≤2★-Reviews seit 2026-04-01):**
- 4 von 8 LIVE-Bad-Reviews trotz ausreichendem Input (>100 Wörter) durch Halluzination ruiniert:
  - ayse (248w Input, Rating 1): "KI hat teils meine Aussagen genau umgekehrt"
  - mila (166w Input, Rating 2): "Vater → Mutter samt Anpassung Personalpronomen"
  - jonathan (Rating 2, Tags `falscher_ton` + `klingt_nicht_nach_mir`): "Aussagen über mich, die nicht zutreffend sind"
  - ennenbach (Rating 2, Tag `details_erfunden`)

**Skizze (grob, wird vor Umsetzung konkretisiert):**
- Nach `generateLetter()` + bevor Brief dem User gezeigt wird: 2. Mistral-Call mit Verifikator-Prompt
- Input: Original-User-Text + generierter Brief
- Output: Liste von Aussagen im Brief, die NICHT durch den Input gedeckt sind (Geschlecht, Beruf, Position, persönliche Details)
- Aktion bei Fund:
  - Variante 1: Unbelegte Claims automatisch streichen/abschwächen ("Ich bin Vater" → entfernt)
  - Variante 2: Brief mit markierten Stellen anzeigen, User entscheidet
  - Variante 3: Bei kritischer Halluzination (Geschlecht, Position) → Re-Generierung mit Anti-Halluzinations-Direktive
- Komplementär zu 999.17 (MdB-Kontext-Fix) — der adressiert Halluzination *über* die/den Abgeordnete:n, dieser hier Halluzination *über* die/den User:in

**Erwarteter Impact:** Eliminiert die destruktivste Fehlerklasse (User würde Brief NICHT verschicken, weil falsche Aussagen über die eigene Person drin stehen) → höheres Vertrauen, mehr verschickte Briefe.

**Risiko:** Verdoppelt Generation-Zeit (~10-25s zusätzlich) und Token-Kosten. Strikter Verifikator kann legitime KI-Formulierungen fälschlich als Halluzination markieren.

**Verwandt:** 999.17 (MdB-Kontext-Anreicherung fixen) löst die andere Hälfte (Halluzination über Politiker:in).

**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Page & Data Infrastructure | 0/TBD | Not started | - |
| 2. Core Engine | 0/4 | Planned | - |
| 3. Email Delivery & Privacy Compliance | 0/3 | Planned | - |

### Phase 4: Stadtstaaten PLZ-Wahlkreis Genauigkeit und Wahlkreis-Gruppierung im Wizard

**Goal:** For Stadtstaat PLZs (Berlin/Hamburg/Bremen) return only the responsible Wahlkreis(e) by computing a true PLZ-area intersection Wahlkreis-polygon area share at build time, replacing the centroid+perturbation+union over-reach, AND group the wizard's politician results by Wahlkreis with Direkt vs ueber-Liste labelling. Fully offline/build-time, no existing PLZ lookup may break, no PLZ may move to a wrong Wahlkreis, no result may go empty, no Bundesland boundary may be crossed.
**Requirements**: POLI-02, POLI-04, PRIV-02
**Depends on:** Phase 3
**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md - Data foundation: filter + commit PLZ-polygon GeoJSON (Berlin/HH/Bremen), add turf devDeps, ODbL attribution
- [ ] 04-02-PLAN.md - Build-script rewrite to polygon area-intersection, regenerate mapping, precision tests (20249 to [21], 20354 keeps [18,20])
- [ ] 04-03-PLAN.md - Wizard grouping: results grouped by Wahlkreis with Direkt/ueber-Liste labels (via UI skill)
