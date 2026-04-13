---
phase: 01-landing-page-data-infrastructure
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/HowItWorks.tsx
  - web/src/components/Hero.tsx
  - web/src/components/CallToAction.tsx
  - web/src/components/WhyItWorks.tsx
  - web/src/components/Support.tsx
  - web/src/components/LetterCounter.tsx
  - web/src/app/page.tsx
  - web/src/app/datenschutz/page.tsx
  - web/src/app/impressum/page.tsx
  - data/politicians-cache.json
  - data/plz-wahlkreis-mapping.json
  - scripts/fetch-politician-data.ts
  - scripts/parse-plz-mapping.ts
autonomous: true
requirements: [LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, PRIV-02, PRIV-03]

must_haves:
  truths:
    - "Landing page hero section has a clear CTA button linking to the /app page"
    - "Landing page CallToAction section has been transformed from pre-launch teaser to active CTA with button"
    - "All gendered language (Doppelpunkt gendering) has been replaced with neutral formulations throughout landing page components"
    - "Typo 'Förderugn' in HowItWorks.tsx has been corrected to 'Förderung'"
    - "Landing page is mobile-responsive and works correctly on all screen sizes"
    - "Letter counter component displays on landing page showing social proof ('Briefe generiert')"
    - "Datenschutz page includes a comprehensive disclaimer about AI-generated letter limitations and accuracy"
    - "Impressum page is accessible and linked from footer"
    - "PLZ-to-Wahlkreis mapping preprocessed as static JSON file at data/plz-wahlkreis-mapping.json"
    - "Abgeordnetenwatch politician data cached as static JSON file at data/politicians-cache.json"
    - "Politician data includes all 3 levels: Bundestag, Landtag, Kommune where available"

  artifacts:
    - path: "web/src/components/Hero.tsx"
      provides: "Hero section with working CTA button to /app"
      min_lines: 50

    - path: "web/src/components/CallToAction.tsx"
      provides: "Active CTA section (no 'Wir bauen gerade' messaging) with button"
      min_lines: 30

    - path: "web/src/components/HowItWorks.tsx"
      provides: "Process steps with fixed typo and neutral language (no Doppelpunkt)"
      min_lines: 100

    - path: "web/src/components/WhyItWorks.tsx"
      provides: "Evidence section with neutral language (no Mitarbeiter:innen, Bürger:innen)"
      min_lines: 60

    - path: "web/src/components/Support.tsx"
      provides: "Community section with neutral language (no Freund:innen)"
      min_lines: 60

    - path: "web/src/components/LetterCounter.tsx"
      provides: "Social proof component displaying letter counter ('X Briefe generiert')"
      min_lines: 20

    - path: "web/src/app/page.tsx"
      provides: "Landing page with LetterCounter component integrated"
      contains: "LetterCounter import and usage"

    - path: "web/src/app/datenschutz/page.tsx"
      provides: "Privacy policy with disclaimer section covering AI limitations, data accuracy warnings"
      contains: "section about accuracy limitations"

    - path: "data/plz-wahlkreis-mapping.json"
      provides: "PLZ-to-Wahlkreis lookup indexed by PLZ, arrays of matching Wahlkreise per PLZ"
      format: "{ \"10115\": [1, 2, ...], ... }"

    - path: "data/politicians-cache.json"
      provides: "Structured politician data for all 3 levels with addresses and contact info"
      format: "{ bundestag: [...], landtag: {...}, kommune: {...} }"

  key_links:
    - from: "web/src/components/Hero.tsx"
      to: "/app route"
      via: "href in CTA button"
      pattern: "href=\"/app\""

    - from: "web/src/components/CallToAction.tsx"
      to: "/app route"
      via: "href in active CTA button"
      pattern: "href=\"/app\""

    - from: "web/src/app/datenschutz/page.tsx"
      to: "disclaimer content"
      via: "new section 6"
      pattern: "KI-Disclaimer|Fehlerquellen"

    - from: "web/src/components/Footer.tsx"
      to: "datenschutz and impressum pages"
      via: "Link components (already exist)"
      pattern: "href=\"/datenschutz\"|href=\"/impressum\""

    - from: "data/plz-wahlkreis-mapping.json"
      to: "Phase 2 app engine"
      via: "static import at build time"
      pattern: "import.*plz-wahlkreis"

    - from: "data/politicians-cache.json"
      to: "Phase 2 app engine"
      via: "static import at build time"
      pattern: "import.*politicians-cache"

---

<objective>
Ship a polished, live landing page that citizens can discover and understand Brief nach Berlin. Also preprocess and cache all static data required for Phase 2's core engine (PLZ-to-politician lookup infrastructure).

Purpose: Citizens see a beautiful, clear landing page explaining the 3-step process. Data infrastructure is ready for Phase 2 so app can load instantly without runtime API calls to external services.

Output: 
1. Corrected landing page components with all decisions implemented (CTAs, gendering fixes, typo)
2. Enhanced Datenschutz page with AI accuracy disclaimer
3. Static PLZ-to-Wahlkreis JSON file
4. Static Abgeordnetenwatch politician data cache JSON file
5. Node.js scripts to refresh both data sources (runnable monthly or post-election)
</objective>

<execution_context>
@/Users/thomas/.claude/get-shit-done/workflows/execute-plan.md
@/Users/thomas/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-landing-page-data-infrastructure/01-CONTEXT.md

**Existing landing page components:**
- web/src/app/page.tsx — Landing page composition
- web/src/components/Hero.tsx — Hero with video background (needs CTA button to /app)
- web/src/components/HowItWorks.tsx — 3-step process (has typo + gendering)
- web/src/components/WhyItWorks.tsx — Stats/evidence section (has gendering)
- web/src/components/Vision.tsx — Founder story (no changes needed per CONTEXT)
- web/src/components/Support.tsx — Community cards (has gendering: "Freund:innen")
- web/src/components/CallToAction.tsx — Bottom CTA section (pre-launch messaging, needs refresh)
- web/src/components/Header.tsx — Sticky header (no changes needed)
- web/src/components/Footer.tsx — Footer with legal links (already correct)
- web/src/app/datenschutz/page.tsx — Privacy policy (needs disclaimer section added)
- web/src/app/impressum/page.tsx — Impressum (exists, linked from footer)

**Technology stack:**
- Next.js 16.2 with App Router
- Tailwind CSS v4, shadcn/ui, TypeScript
- Node.js for preprocessing scripts
- CSV parsing via csv-parse library
- Fetch API for external data sources

**Data sources:**
- Abgeordnetenwatch API v2 (CC0 license): https://www.abgeordnetenwatch.de/api
- Bundeswahlleiter open data: https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix landing page typos and gendering issues</name>
  <files>
    web/src/components/HowItWorks.tsx
    web/src/components/WhyItWorks.tsx
    web/src/components/Support.tsx
  </files>
  <action>
Apply the following fixes to landing page components (per D-03 and D-04):

**HowItWorks.tsx:**
- Fix typo on line 6: "Förderugn" → "Förderung"
- Remove Doppelpunkt gendering: No gendering changes needed in this component (text is already neutral)

**WhyItWorks.tsx:**
- Line 5: "der Mitarbeiter:innen" → "der Mitarbeitenden"
- Line 5: "Bürger:innen" → "Bürgerinnen und Bürger" (or rephrase to "Bürgern")

**Support.tsx:**
- Line 40: "Freund:innen" → "Freunden"

Use neutral, gender-inclusive language (Mitarbeitende, Abgeordnete, Bürgerinnen und Bürger) — no Gendersternchen, no Doppelpunkt, no Binnen-I. All other gendering phrases throughout the app should follow the same pattern in future phases.

Verify each change by reading the file after editing.
  </action>
  <verify>
grep -n "Förderugn\|:innen\|Freund" /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/src/components/{HowItWorks,WhyItWorks,Support}.tsx
Should return no matches (gendering fixed, typo fixed)
  </verify>
  <done>
All typos corrected. All Doppelpunkt gendering replaced with neutral formulations. Landing page language is consistent and professional.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add CTA buttons to Hero and transform CallToAction section</name>
  <files>
    web/src/components/Hero.tsx
    web/src/components/CallToAction.tsx
  </files>
  <action>
**Hero.tsx (per D-06):**
Update the existing CTA button at line 75-80. Currently it links to "#so-funktionierts" (jump to How It Works section). Change to link to "/app":

```jsx
<a
  href="/app"
  className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/25 active:scale-[0.98]"
>
  In 3 Minuten zum fertigen Brief →
</a>
```

This allows eager users to jump directly to the app generator from the hero.

**CallToAction.tsx (per D-08):**
Replace the entire section. The current text says "Wir bauen gerade an Brief nach Berlin" and "Bald kannst du deinen ersten Brief schreiben." This is pre-launch messaging. Transform it to an active CTA section:

1. Replace headline from "Wir bauen gerade an / Brief nach Berlin." to something like "Bereit für deinen Brief?" or "Jetzt aktiv werden" (or similar, inviting)
2. Replace body text from pre-launch messaging to an active invitation: "Beschreib dein Anliegen, wir finden die richtige Person und formulieren einen Brief, der ankommt."
3. Add a primary CTA button linking to "/app" with text "Jetzt Brief schreiben" or "Zum Brief Generator"
4. Keep the handwriting quote at the bottom ("Demokratie braucht deine Stimme...") — it's strong.

Maintain design consistency: bg-waldgruen-dark with creme text, same button style as Hero, envelope SVG decorations at corners (keep as-is).

This transforms the section from "coming soon" to "join us now" — Phase 2 will build the full /app page, but Phase 1 needs the route and placeholder.
  </action>
  <verify>
grep -n "href=\"/app\"" /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/src/components/Hero.tsx
grep -n "href=\"/app\"" /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/src/components/CallToAction.tsx
Both should return at least one match each. No "Wir bauen gerade" text should remain in CallToAction.tsx.
  </verify>
  <done>
Hero CTA button points to /app. CallToAction section has been transformed from pre-launch teaser to active CTA with button. Users have two clear entry points to the app (eager users from Hero, convinced users from bottom).
  </done>
</task>

<task type="auto">
  <name>Task 3: Add AI accuracy disclaimer to Datenschutz page</name>
  <files>
    web/src/app/datenschutz/page.tsx
  </files>
  <action>
Expand the Datenschutz page with a new section 6 containing the AI accuracy disclaimer (per D-15). Insert after the "Streitschlichtung" section (after the closing div of section 5, before the "Stand: April 2026" timestamp).

New section structure (section 6):

Heading: "6. KI-Generierte Inhalte und Disclaimer"

Body text covering these points (in natural German prose, flowing well):
- We use AI to draft letters quickly and lower barriers to entry. However, AI can make mistakes.
- We do NOT guarantee accuracy of politician data (names, addresses, roles may change).
- We do NOT guarantee accuracy or correctness of the AI-generated letter content.
- Users MUST verify the letter before mailing — especially politician details (name, title, address) against official sources.
- Links to official sources for verification: Bundestag (www.bundestag.de), Landtag pages, Kommune/Rathaus websites.
- Even the best AI can miss context, make assumptions, or misunderstand local nuances. The user is responsible for the final letter content.
- This is a tools for acceleration, not for delegation. You are writing the letter — we just help you formulate it faster.

Write in a friendly but serious tone (Sie-Form). This is not a cop-out — it's honest about AI limitations and empowers users.

Example structure (adapt as needed):
```
6. KI-generierte Inhalte und Disclaimer

Brief nach Berlin nutzt künstliche Intelligenz, um deine Anliegen schnell und einfach in formale Briefe umzuwandeln. Allerdings können KI-Systeme Fehler machen.

Wir garantieren nicht die Genauigkeit...
[cover the points above in flowing prose]

Verifiziere vor dem Versand...
```

Keep typography consistent with rest of page (font-body, text-warmgrau, etc.).
  </action>
  <verify>
grep -n "6\. KI-generierte\|Disclaimer\|Verifiziere" /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/src/app/datenschutz/page.tsx
Should return matches showing section 6 exists with disclaimer content.
  </verify>
  <done>
Datenschutz page now includes a comprehensive disclaimer about AI limitations, data accuracy, and user responsibility. Citizens are informed before using the tool.
  </done>
</task>

<task type="auto">
  <name>Task 4: Create /app route placeholder (basic page)</name>
  <files>
    web/src/app/app/page.tsx
  </files>
  <action>
Create a new file web/src/app/app/page.tsx as a placeholder for Phase 2's full app page. For Phase 1, this is a minimal page that:

1. Exists and is routable (so Hero and CallToAction CTAs don't 404)
2. Shows a simple placeholder message indicating the app is coming soon or is in development
3. Maintains design consistency (uses same font/color tokens as landing page)
4. Optionally displays an email signup for early access (or just a "coming soon" message)

Minimal example:
```tsx
import Link from "next/link";

export const metadata = {
  title: "Brief Generator | Brief nach Berlin",
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20 flex flex-col items-center justify-center">
      <div className="max-w-2xl text-center">
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark mb-6">
          Brief nach Berlin
        </h1>
        <p className="font-body text-lg text-warmgrau leading-relaxed mb-10">
          Der Brief-Generator wird gerade für dich vorbereitet.
          <br />
          <br />
          Wir arbeiten daran, dass du dein Anliegen in 3 Minuten 
          in einen wirkungsvollen Brief umwandeln kannst.
        </p>
        <Link
          href="/"
          className="inline-block bg-waldgruen text-creme font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
```

This placeholder prevents 404s when users click the CTA buttons, maintains brand consistency, and sets expectations. Phase 2 replaces this with the full form/input flow.
  </action>
  <verify>
curl -s http://localhost:3000/app | grep -i "brief nach berlin\|generator"
Should return HTML containing the placeholder page content (when running next dev).
Or check: test -f /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/src/app/app/page.tsx && echo "File exists"
  </verify>
  <done>
/app route exists and displays a consistent, friendly placeholder. Users clicking CTAs no longer hit 404s.
  </done>
</task>

<task type="auto">
  <name>Task 5: Build PLZ-to-Wahlkreis mapping data script</name>
  <files>
    scripts/parse-plz-mapping.ts
    data/plz-wahlkreis-mapping.json
  </files>
  <action>
Create a Node.js TypeScript script that preprocesses the Bundeswahlleiter PLZ data into a static JSON lookup table (per D-13, D-14, PRIV-02).

**Script location:** web/scripts/parse-plz-mapping.ts

**Data source:** Download the Bundeswahlleiter CSV from https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html (2025 Wahlkreise file). The CSV format is typically: Wahlkreis ID, Wahlkreis Name, PLZ list.

**Script logic:**
1. Fetch or read the CSV file (you may need to manually download it first and place it in scripts/ or data/raw/)
2. Parse the CSV using the csv-parse library (already in CLAUDE.md stack, add if missing: `npm install csv-parse`)
3. For each row: extract Wahlkreis ID and all PLZs in the row
4. Build an object indexed by PLZ: `{ "10115": [1, 3, 5], "10117": [1, 2], ... }`
5. Write output to data/plz-wahlkreis-mapping.json with proper formatting (2-space indent)
6. Add a console.log at the end: "PLZ mapping generated: X entries"

**Output format:**
```json
{
  "10115": [1, 3],
  "10117": [1, 2],
  "10119": [1],
  ...
}
```
Where keys are PLZs (strings) and values are arrays of Wahlkreis IDs (numbers). Each PLZ maps to one or more Wahlkreise because PLZ boundaries don't align 1:1 with electoral districts.

**Error handling:**
- Log warnings if a PLZ appears in multiple rows (shouldn't happen, but catch it)
- Log warnings if parsing fails on specific rows
- Exit with code 1 if file cannot be written

**Documentation:** Add a comment block at the top of the script explaining:
- What it does (preprocesses Bundeswahlleiter data at build-time)
- When to run it (monthly or after elections)
- How to run it: `npm run build:data` or `ts-node scripts/parse-plz-mapping.ts`

Also add a build script to package.json: `"build:data": "ts-node scripts/parse-plz-mapping.ts"` (or similar, can be run separately from the main next build).

**Important:** This script is NOT run during `next build` — it's a separate manual script. Thomas runs it monthly or when elections happen, then commits the resulting JSON. This keeps the app fast (zero startup cost to parse CSV).
  </action>
  <verify>
test -f /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/data/plz-wahlkreis-mapping.json && echo "Mapping file exists" && head -20 /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/data/plz-wahlkreis-mapping.json | grep -E "^\s+\"[0-9]{5}\":" && echo "JSON structure is valid"
Should confirm file exists and contains PLZ keys with proper JSON format.
  </verify>
  <done>
PLZ-to-Wahlkreis mapping preprocessed as static JSON. Script is ready for manual refresh (monthly or post-election). Phase 2 will import this file at build-time for O(1) PLZ lookups.
  </done>
</task>

<task type="auto">
  <name>Task 6: Build Abgeordnetenwatch politician data cache script</name>
  <files>
    scripts/fetch-politician-data.ts
    data/politicians-cache.json
  </files>
  <action>
Create a Node.js TypeScript script that fetches and caches Abgeordnetenwatch politician data for all 3 levels (per D-11, D-12, PRIV-03).

**Script location:** web/scripts/fetch-politician-data.ts

**Data sources:**
- Abgeordnetenwatch API v2: https://www.abgeordnetenwatch.de/api/v2
- Endpoints needed:
  - `/candidacies-mandates?parliament_period=111` (current Bundestag, period 111 = 2025 session)
  - `/candidacies-mandates?parliament_period={LANDTAG_PERIOD}` per Bundesland (periods vary; API docs have a list)
  - Fallback for Kommune: Abgeordnetenwatch has limited Kommune data; include what's available with a note that it's incomplete

**Script logic:**
1. Fetch all candidacies-mandates records from Abgeordnetenwatch v2 API (may require pagination; check API docs for `limit` and `offset`)
2. Filter by parliament_period to group Bundestag vs Landtag vs Kommune records
3. For each politician record, extract:
   - Full name
   - Party affiliation (if available)
   - Electoral district ID (Wahlkreis ID for Bundestag, Landkreis for Landtag, etc.)
   - Title/role (MdB, MdL, Bürgermeister, etc.)
   - Contact info (postal address, email if available — do NOT assume it exists)
   - Parliament period / session
4. Structure the output as:
```json
{
  "bundestag": {
    "1": [  // Wahlkreis 1
      { "name": "...", "party": "...", "wahlkreis": 1, "address": "...", ... },
      ...
    ],
    "2": [ ... ],
    ...
  },
  "landtag": {
    "Baden-Württemberg": [
      { "name": "...", "role": "MdL", ... },
      ...
    ],
    ...
  },
  "kommune": {
    "by_stadt": { "Berlin": [...], "Hamburg": [...], ... }
  }
}
```
5. Write output to data/politicians-cache.json with proper formatting

**Error handling:**
- Log warnings if API calls fail (rate limiting, network errors)
- If API is unreachable, retry up to 3 times with exponential backoff
- Exit with code 0 even if some Landtag/Kommune data is missing (Bundestag is the priority)
- Add a `_metadata` field at the top of the JSON: `{ "fetched_at": "2026-04-13T12:00:00Z", "bundestag_records": 299, "landtag_records": 1400, ... }`

**API Rate Limiting:**
- Abgeordnetenwatch has a public API with no auth needed but likely has rate limits
- Add a 0.1-0.2 second delay between requests to be respectful
- Log request count: "Fetched X candidates..."

**Important notes:**
- This script is NOT run during `next build` — it's a separate manual script
- Thomas runs it monthly or after elections, then commits the resulting JSON
- Address details may be incomplete or outdated in the API; Phase 2 handles this gracefully (shows uncertainty message per D-10)
- Add a comment at the top of the script: "Run this monthly or after elections. It fetches fresh Abgeordnetenwatch data and updates the local cache."

**How to run:** Add to package.json: `"fetch:politicians": "ts-node scripts/fetch-politician-data.ts"`

**Data privacy note:** This is public API data (CC0 license), not user data. No privacy concerns — we're caching public information locally to reduce API calls.
  </action>
  <verify>
test -f /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/data/politicians-cache.json && echo "Cache file exists" && jq '.bundestag | keys | length' /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/data/politicians-cache.json
Should confirm file exists and contains some Bundestag Wahlkreis entries. Count should be > 200 (at least most of the 299 Bundestag seats).
  </verify>
  <done>
Abgeordnetenwatch politician data cached as static JSON for all 3 levels. Script ready for monthly refresh. Phase 2 will import this file at build-time for instant politician lookups without runtime API calls.
  </done>
</task>

<task type="auto">
  <name>Task 7: Update package.json with data scripts and add csv-parse dependency</name>
  <files>
    web/package.json
  </files>
  <action>
Update web/package.json to add:

1. **New dependency** (if not already present):
   - `csv-parse@^5.6` — for parsing Bundeswahlleiter CSV

   Add to "dependencies" section:
   ```json
   "csv-parse": "^5.6"
   ```

2. **Build scripts** in "scripts" section:
   ```json
   "build:data": "ts-node scripts/parse-plz-mapping.ts && ts-node scripts/fetch-politician-data.ts",
   "build:plz": "ts-node scripts/parse-plz-mapping.ts",
   "fetch:politicians": "ts-node scripts/fetch-politician-data.ts"
   ```

   This allows Thomas (or CI) to run:
   - `npm run build:data` — refresh all data
   - `npm run build:plz` — refresh just PLZ mapping
   - `npm run fetch:politicians` — refresh just politician cache

3. Ensure `ts-node` is in devDependencies (TypeScript scripts need it). If not present, add:
   ```json
   "ts-node": "^10.9.2"
   ```

Keep all existing scripts unchanged (dev, build, start, lint).

Documentation: Add a comment or README note explaining when these scripts should be run (monthly, or after major political changes like elections).
  </action>
  <verify>
grep -E '"csv-parse"|"ts-node"|"build:data"|"build:plz"|"fetch:politicians"' /Users/thomas/Documents/Git\ Repos/brief-nach-berlin/web/package.json
Should return matches for csv-parse, ts-node, and the three build scripts.
  </verify>
  <done>
package.json updated with data processing scripts and csv-parse dependency. Developers can run `npm run build:data` to refresh both PLZ mapping and politician cache.
  </done>
</task>

<task type="auto">
  <name>Task 8: Test landing page on mobile and desktop, verify all CTAs and links work</name>
  <files>
    (verification only — no files modified)
  </files>
  <action>
Test the landing page to ensure all decisions are implemented and working correctly. Use `npm run dev` to start a local Next.js server, then visit http://localhost:3000 and verify:

**Mobile (use browser DevTools to simulate, or test on real phone):**
1. Hero section displays correctly (video/poster background, text centered, readable)
2. Hero CTA button is visible and links to /app (click it, should navigate to /app placeholder page)
3. HowItWorks section displays in single column (steps stack vertically) with proper spacing
4. WhyItWorks stats section is readable on mobile (grid collapses to 1 column)
5. Support cards stack vertically and are readable
6. CallToAction section displays with button, visible and clickable
7. All text is readable (no overflow, proper font sizes)
8. Footer links (Impressum, Datenschutz) are visible and clickable

**Desktop:**
1. Hero section full-width with video background, text centered in card overlay
2. Hero CTA button is clearly visible and styled correctly
3. HowItWorks displays as 2-column grid with zigzag layout (steps alternate left/right)
4. WhyItWorks displays as 2-column stat grid
5. Support displays as 3-column card grid
6. CallToAction section full-width with dark background and centered CTA button
7. Footer layout is horizontal (left: copyright, right: links)

**Link verification:**
1. Click Hero CTA button → navigates to /app (should see placeholder page)
2. Click CallToAction CTA button → navigates to /app
3. Click footer Datenschutz link → should display datenschutz page with new disclaimer section (section 6)
4. Click footer Impressum link → should display impressum page
5. Navigation back to home from /app or datenschutz works (← Zurück button)

**Text verification:**
1. Verify typo "Förderugn" is fixed to "Förderung" in HowItWorks
2. Verify no Doppelpunkt gendering remains (no "Mitarbeiter:innen", "Bürger:innen", "Freund:innen")
3. Verify CallToAction no longer says "Wir bauen gerade" — should have active CTA text

**Data files verification:**
1. Check that data/plz-wahlkreis-mapping.json exists and contains valid JSON with PLZ keys
2. Check that data/politicians-cache.json exists and contains valid JSON with bundestag entries
3. Optionally run: `npm run build:data` to verify scripts execute without errors (this will require Bundeswahlleiter CSV to be downloaded first)

No automated test command — this is manual verification via browser and file checks.
  </action>
  <verify>
Manual testing. Checklist items above should all pass. If any failures:
1. Visual issues on mobile → check Tailwind responsive classes (md:, lg: prefixes)
2. Links broken → check href attributes in components
3. Typos still present → grep as per earlier tasks
4. Data files missing → check file paths and JSON validity with `jq .` command

If all visual/link tests pass and data files exist, Phase 1 landing page is complete.
  </verify>
  <done>
Landing page is pixel-perfect on mobile and desktop. All CTAs work. All links navigate correctly. Datenschutz page shows new disclaimer. Typos fixed. Gendering neutral. Data files exist and are valid. Ready for Phase 2 development.
  </done>
</task>

<task type="auto">
  <name>Task 9: Create letter counter component (LAND-03)</name>
  <files>
    web/src/components/LetterCounter.tsx
    web/src/app/page.tsx
  </files>
  <action>
Create a new LetterCounter component to satisfy LAND-03 requirement (per verification feedback).

**Create new file: web/src/components/LetterCounter.tsx**

This is a simple, reusable component that displays how many letters have been generated (social proof). For Phase 1, show a static value "0 Briefe generiert". Phase 2 will replace this with a real counter fetched from analytics/database.

```tsx
export default function LetterCounter() {
  const count = 0; // Phase 2: Replace with real data
  
  return (
    <div className="text-center py-8">
      <p className="font-body text-warmgrau text-sm uppercase tracking-wider mb-2">
        Impact
      </p>
      <h3 className="font-handwriting text-4xl md:text-5xl font-bold text-waldgruen mb-2">
        {count}
      </h3>
      <p className="font-body text-warmgrau text-base">
        Briefe generiert & versendet
      </p>
    </div>
  );
}
```

**Update: web/src/app/page.tsx**

Import and add the LetterCounter component to the landing page. Best placement is in the WhyItWorks section or as its own small section between WhyItWorks and Vision. Suggested placement: after WhyItWorks (around line 15-20 in the page composition).

Add import:
```tsx
import LetterCounter from "@/components/LetterCounter";
```

Add to layout (suggested between WhyItWorks and Vision sections):
```tsx
<LetterCounter />
```

Design consistency: Use existing Tailwind colors (waldgruen, warmgrau, creme) and font classes (font-body, font-handwriting). The component should feel like a small, prominent stat that fits naturally between sections.

This provides social proof (X briefs generated) without being intrusive. Phase 2 will wire this to a real counter once letters start being generated.
  </action>
  <verify>
grep -n "LetterCounter" /Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/app/page.tsx
Should show the import and usage of LetterCounter component.

grep -n "Briefe generiert" /Users/thomas/Documents/Git Repos/brief-nach-berlin/web/src/components/LetterCounter.tsx
Should show the counter text is present.

Visual: The letter counter should appear on the landing page between sections, displaying "0" with text "Briefe generiert & versendet".
  </verify>
  <done>
LetterCounter component created and integrated into landing page. LAND-03 requirement satisfied with social proof component ready for Phase 2 wiring to real data.
  </done>
</task>

</tasks>

<verification>
**Phase 1 completion verification:**

1. **Visual/Functional (manual browser testing):**
   - [ ] Hero CTA button visible and links to /app
   - [ ] CallToAction CTA button visible and links to /app
   - [ ] Letter counter component visible on landing page ("0 Briefe generiert")
   - [ ] /app route loads without 404
   - [ ] Landing page responsive on mobile (tested with DevTools or real device)
   - [ ] All footer links work (Datenschutz, Impressum)

2. **Text/Content:**
   - [ ] Typo "Förderugn" → "Förderung" fixed (grep confirms)
   - [ ] No Doppelpunkt gendering remains (grep confirms)
   - [ ] CallToAction section transformed (no "Wir bauen gerade")
   - [ ] Datenschutz page section 6 exists with disclaimer content

3. **Data Infrastructure:**
   - [ ] data/plz-wahlkreis-mapping.json exists and contains valid JSON
   - [ ] data/politicians-cache.json exists and contains valid JSON
   - [ ] scripts/parse-plz-mapping.ts exists and is executable
   - [ ] scripts/fetch-politician-data.ts exists and is executable
   - [ ] package.json includes csv-parse, ts-node, and build:data/build:plz/fetch:politicians scripts

4. **Requirements Coverage:**
   - [ ] LAND-01: Hero section explains what Brief nach Berlin does ✓
   - [ ] LAND-02: "How it works" section shows 3 steps ✓
   - [ ] LAND-03: Social proof section with letter counter ("X Briefe generiert") ✓
   - [ ] LAND-04: Clear CTA to letter generator (Hero + CallToAction) ✓
   - [ ] LAND-05: Landing page mobile-responsive ✓
   - [ ] LAND-06: Datenschutz and Impressum pages linked in footer ✓
   - [ ] PRIV-02: PLZ-to-Wahlkreis mapping preprocessed as static JSON ✓
   - [ ] PRIV-03: Abgeordnetenwatch data cached locally as JSON ✓

All items above should be confirmed before Phase 1 is marked complete.
</verification>

<success_criteria>
1. Landing page is live at root (/) with all visual corrections (typos, gendering, CTA buttons)
2. Hero and CallToAction sections have working CTA buttons pointing to /app
3. Letter counter component is visible on landing page displaying social proof ("0 Briefe generiert")
4. /app route exists (placeholder page for Phase 2)
5. All landing page components are mobile-responsive and display correctly
6. Datenschutz page includes new section 6 with AI accuracy disclaimer
7. Impressum page is accessible via footer link
8. data/plz-wahlkreis-mapping.json exists with all German PLZs indexed to Wahlkreise
9. data/politicians-cache.json exists with Bundestag, Landtag, and Kommune data
10. scripts/parse-plz-mapping.ts and scripts/fetch-politician-data.ts exist and are executable
11. package.json includes build:data, build:plz, and fetch:politicians scripts for monthly data refresh

Phase 1 is complete when all 11 criteria are satisfied. Phase 2 can then begin building the core app engine (input form, PLZ lookup, letter generation, email delivery).
</success_criteria>

<output>
After completion, create `.planning/phases/01-landing-page-data-infrastructure/01-SUMMARY.md`

Summary should include:
- What was built (landing page polished, data infrastructure scripts + cached data)
- Key decisions implemented (decisions D-01 through D-16)
- Artifacts created (file list)
- Requirements covered (LAND-01 through LAND-06, PRIV-02, PRIV-03)
- Data refresh strategy (monthly scripts, how to run)
- Known gaps/deferred (anything from deferred ideas that Phase 2 should address)
- Next phase trigger (Phase 2 can begin: app form, input capture, letter generation)
</output>
