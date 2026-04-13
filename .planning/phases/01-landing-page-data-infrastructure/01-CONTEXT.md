# Phase 1: Landing Page & Data Infrastructure - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the landing page and preprocess all static data required for PLZ-to-politician lookup. Citizens can discover and understand Brief nach Berlin, and the data infrastructure (PLZ→Wahlkreis mapping + Abgeordnetenwatch politician cache) is ready for Phase 2's core engine.

Two distinct workstreams:
1. **Landing page** — polish existing Next.js app in `/web`, fix issues, add app entry point buttons
2. **Data infrastructure** — build preprocessing scripts that output static JSON for PLZ→Wahlkreis and politician data

</domain>

<decisions>
## Implementation Decisions

### Landing page visual direction & tone
- **D-01:** Visual direction is Ghibli-style solarpunk Berlin — already implemented in hero video/poster. No changes needed to visual direction.
- **D-02:** Emotional positioning blends citizen empowerment ("Dein Anliegen. Dein Brief.") with practical evidence ("96% der Kongressmitarbeitenden sagen..."). Already implemented. Keep as-is.
- **D-03:** Fix gender-neutral language throughout. Remove all Doppelpunkt gendering (Mitarbeiter:innen, Bürger:innen, Freund:innen). Replace with neutral formulations: "Abgeordnete", "Kongressmitarbeitende", "Bürgerinnen und Bürger", or rephrased sentences. This is a project-wide constraint.
- **D-04:** Fix typo in HowItWorks.tsx: "Förderugn" → "Förderung"

### Landing page structure & CTA
- **D-05:** Keep current section order: Header → Hero → HowItWorks → WhyItWorks → Vision → Support → CallToAction → Footer
- **D-06:** Hero gets a CTA **button** (not inline input) linking to `/app` page. Bottom CallToAction section also gets a button linking to `/app`. Both positions — eager users act from Hero, convinced users act from bottom.
- **D-07:** Support section ("Feedback geben", "Weitersagen", "Fördern") stays as-is. Good for community building.
- **D-08:** CallToAction section transforms from pre-launch teaser ("Wir bauen gerade...") to an active CTA with button to `/app`. Remove "Wir bauen gerade" messaging.

### Politician data sourcing
- **D-09:** Include all 3 political levels in data infrastructure: Bundestag + Landtag + Kommune.
- **D-10:** When data gaps exist (especially Kommune), the app should surface uncertainty: "Wir sind nicht sicher — hier kannst du selbst prüfen" with link to official source. Not a silent failure.
- **D-11:** Build-time Node script fetches Abgeordnetenwatch API data, outputs structured JSON files. Local cache, not runtime API calls. Monthly refresh cadence (or after elections/reshuffles).
- **D-12:** Abgeordnetenwatch API (CC0, v2) is the primary data source for politician data. Bundestag Open Data is fallback only if Abgeordnetenwatch gaps are found.

### PLZ-to-Wahlkreis mapping
- **D-13:** Data source: Published PLZ lists per Wahlkreis from Bundeswahlleiter (CSV). Not shapefile/geo-processing — simpler approach for v1.
- **D-14:** Store ALL matching Wahlkreise per PLZ (some PLZs span multiple). Phase 2 handles disambiguation by showing all matching Abgeordnete to the user.

### Legal disclaimer
- **D-15:** Add a visible disclaimer covering: (a) we reformulate to lower the barrier/speed up the process, (b) we do not guarantee accuracy of politician data or AI-generated content, (c) even the best AI can make mistakes — users should verify before sending, (d) links to official sources (Bundestag, Landtag, Kommune portals) for verification.
- **D-16:** Disclaimer lives on Datenschutz page (expanded) and as a brief note in the Footer for Phase 1. In Phase 2, it also appears near the generated letter output.

### Claude's Discretion
- Exact neutral formulations for each gendered phrase (as long as no Gendersternchen/Doppelpunkt/Binnen-I)
- Data script implementation details (file structure, caching strategy, error handling)
- PLZ CSV parsing approach and output JSON schema
- Exact disclaimer wording (following the principles above)
- Whether to add a loading/placeholder state for the `/app` route until Phase 2 ships

</decisions>

<specifics>
## Specific Ideas

- The airmail stripe pattern (red/blue diagonal) is a charming recurring motif in Header, Footer, and HowItWorks dividers. Keep it — it reinforces the "letter" theme.
- The Bundestag internship quote in WhyItWorks ("Handgeschriebene Briefe landen auf dem Schreibtisch. E-Mails landen im Spam.") is strong social proof. Keep it prominent.
- Font stack (Courier Prime for typewriter feel, Source Sans for body, Caveat for handwriting) works well and shouldn't change.
- Color palette (waldgruen, creme, warmgrau, airmail-rot, airmail-blau) is established and consistent.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing codebase
- `web/src/app/page.tsx` — Landing page component composition and section order
- `web/src/components/Hero.tsx` — Hero section with video background, headline, CTA
- `web/src/components/HowItWorks.tsx` — 3-step process explanation (contains typo + gendering issues)
- `web/src/components/WhyItWorks.tsx` — Evidence section with stats (contains gendering issues)
- `web/src/components/Vision.tsx` — Founder story section
- `web/src/components/Support.tsx` — Community engagement cards (contains gendering issues)
- `web/src/components/CallToAction.tsx` — Bottom CTA (needs transformation from pre-launch to active)
- `web/src/components/Footer.tsx` — Footer with legal links
- `web/src/components/Header.tsx` — Sticky header with nav
- `web/src/app/layout.tsx` — Root layout with font definitions and metadata
- `web/src/app/datenschutz/page.tsx` — Privacy policy page
- `web/src/app/impressum/page.tsx` — Legal notice page

### Project documentation
- `CLAUDE.md` — Technology stack, constraints, conventions
- `.planning/PROJECT.md` — Project vision, requirements, constraints
- `.planning/REQUIREMENTS.md` — Detailed requirement specifications with REQ-IDs
- `KONZEPT.md` — Original product concept (German)
- `MARKET-RESEARCH.md` — Competitive analysis and market positioning

### External data sources
- Abgeordnetenwatch API v2: `https://www.abgeordnetenwatch.de/api` — CC0, politician data endpoints
- Bundeswahlleiter open data: `https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html` — PLZ-to-Wahlkreis CSV files

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 8 landing page components already built (Hero, HowItWorks, WhyItWorks, Vision, Support, CallToAction, Header, Footer)
- Tailwind CSS custom colors defined (waldgruen, creme, warmgrau, airmail-rot, airmail-blau)
- 3 Google Fonts loaded (Courier Prime, Source Sans 3, Caveat)
- Hero background video + poster images in `/web/public/`
- Datenschutz and Impressum pages already exist with content

### Established Patterns
- Utility-first Tailwind CSS with custom color tokens (no component library beyond native HTML)
- SVG icons inline (no icon library)
- Font classes: `font-typewriter` (Courier Prime), `font-body` (Source Sans), `font-handwriting` (Caveat)
- Section pattern: full-width section → max-w container → content
- Airmail stripe pattern used as visual divider in header, footer, and between steps

### Integration Points
- New `/app` route needed (Phase 2 will build the full page, but Phase 1 needs the route/placeholder)
- Data scripts output to a `data/` directory (or similar) that Phase 2 will import
- No database — all data is static JSON files

</code_context>

<deferred>
## Deferred Ideas

### Phase 2 — Core Engine
- **App page flow:** PLZ input (pre-focused) → email address (format validation + tooltip: "Wir bereiten deinen Brief datenschutzkonform mit EU-KI vor und senden dir diesen per Email zu. Das dauert einen Moment...") → text input or voice-to-text → letter generation
- **Mistral (EU-hosted AI)** for DSGVO compliance as alternative to OpenAI — evaluate during Phase 2 planning
- **Handwriting recommendation on results page** with statistics about effectiveness: "Am allerbesten schreibst du diesen per Hand ab, da dies mit Abstand am effektivsten ist" + citation
- **Multiple Wahlkreis disambiguation UI** — show all matching Abgeordnete when PLZ spans multiple Wahlkreise

### v2+ Ideas
- **Bürgerbüro routing** — check whether a letter is better addressed to a Bürgerbüro than directly to the Abgeordnete
- **Personal context enrichment** — profession, affiliations, how personally affected (currently "Brief verstärken" in requirements)

</deferred>

---

*Phase: 01-landing-page-data-infrastructure*
*Context gathered: 2026-04-13*
