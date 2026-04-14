---
phase: 260414-pci
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/AppHeader.tsx
  - web/src/components/AppFooter.tsx
  - web/src/app/app/layout.tsx
  - web/src/app/app/page.tsx
autonomous: false
requirements:
  - QUICK-01
must_haves:
  truths:
    - "Users on any page under /app see a persistent header with a link back to the landing page (/)"
    - "Users on any page under /app see a persistent footer with links to / , /impressum, and /datenschutz"
    - "The landing page (/) is NOT affected — it still uses its own Header/Footer (in page.tsx), not the new app shell"
    - "Header/footer styling matches the existing airmail/creme visual language of the landing page (consistent brand)"
  artifacts:
    - path: "web/src/components/AppHeader.tsx"
      provides: "Minimal app-section header with 'Brief nach Berlin' brand linking back to /"
      exports: ["default"]
    - path: "web/src/components/AppFooter.tsx"
      provides: "Minimal app-section footer with home + legal links"
      exports: ["default"]
    - path: "web/src/app/app/layout.tsx"
      provides: "Next.js App Router segment layout wrapping /app/* routes with AppHeader + AppFooter"
      exports: ["default"]
  key_links:
    - from: "web/src/app/app/layout.tsx"
      to: "web/src/components/AppHeader.tsx"
      via: "import + render above {children}"
      pattern: "AppHeader"
    - from: "web/src/app/app/layout.tsx"
      to: "web/src/components/AppFooter.tsx"
      via: "import + render below {children}"
      pattern: "AppFooter"
    - from: "web/src/components/AppHeader.tsx"
      to: "/"
      via: "next/link Link href='/'"
      pattern: "href=\"/\""
---

<objective>
Add a persistent, minimal header and footer to the `/app/*` section of the Next.js app so users inside the letter-writing wizard can always navigate back to the landing page.

Purpose: Right now `/app/page.tsx` renders only the WizardShell with no chrome — a user deep in the flow has no way to escape back to `/` except the browser back button. This fixes that with an App Router segment layout, without touching the landing page.

Output:
- New `AppHeader.tsx` + `AppFooter.tsx` components (lighter than the marketing Header/Footer — no section anchors, no "Brief schreiben" CTA)
- New `web/src/app/app/layout.tsx` segment layout that wraps all `/app/*` routes
- `/app/page.tsx` trimmed to not double-wrap with `<main className="min-h-screen">` (the layout owns the shell)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@web/CLAUDE.md
@web/AGENTS.md
@web/src/app/layout.tsx
@web/src/app/app/page.tsx
@web/src/components/Header.tsx
@web/src/components/Footer.tsx

<interfaces>
Existing root layout (web/src/app/layout.tsx) already sets `<body className="min-h-full flex flex-col">` — segment layouts should return a fragment or a flex container that fills available space.

Existing Header.tsx (marketing) uses:
- `"use client"` directive
- `sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8`
- Airmail stripe: 2px repeating diagonal gradient using CSS vars `--color-airmail-rot`, `--color-creme`, `--color-airmail-blau`
- Brand text: `font-typewriter text-base md:text-lg font-bold text-waldgruen-dark`
- Links: `next/link` for internal, `<a>` for hash anchors

Existing Footer.tsx uses:
- Airmail stripe (same gradient)
- `max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4`
- Legal links to `/impressum` and `/datenschutz`

Existing `/app/page.tsx` wraps WizardShell in `<main className="min-h-screen bg-creme">` — this `<main>` + min-h-screen should move to the layout so the shell flex-grows between header and footer correctly.
</interfaces>

NOTE ON NEXT.JS VERSION: `web/AGENTS.md` says this is a non-standard Next.js. Before writing layout.tsx, run `ls web/node_modules/next/dist/docs/` and skim the App Router layout doc if anything looks off. Standard App Router segment layout convention (`app/app/layout.tsx` exporting a default component that receives `{ children }`) is expected to work, but verify if errors arise.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create AppHeader and AppFooter components</name>
  <files>web/src/components/AppHeader.tsx, web/src/components/AppFooter.tsx</files>
  <action>
Create two new components (do NOT modify existing Header.tsx / Footer.tsx — those belong to the marketing landing page).

**web/src/components/AppHeader.tsx** — client component:
- `"use client"` directive at top
- Same airmail stripe as existing Header (copy the inline-style div exactly — 2px diagonal gradient using `--color-airmail-rot`, `--color-creme`, `--color-airmail-blau`)
- `<header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8">`
- Inside: `<nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">`
- Left: `next/link` Link to `/` wrapping brand text `"Brief nach Berlin"` with classes `font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight hover:text-waldgruen transition-colors`
- Right: `next/link` Link to `/` with text `"← Zur Startseite"` and classes `font-body text-sm text-warmgrau/60 hover:text-waldgruen-dark transition-colors duration-200`
- NO section anchor links (no "Wie es funktioniert" etc. — those don't exist inside /app)
- NO "Brief schreiben" CTA (user is already in the app)

**web/src/components/AppFooter.tsx** — server component (no directive needed):
- Same airmail stripe as existing Footer
- `<footer className="bg-creme mt-auto">` (mt-auto pushes to bottom in flex layout)
- Inner div: `max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4`
- Left: `<span className="font-typewriter text-sm text-warmgrau/40">Brief-nach-Berlin &copy; {new Date().getFullYear()}</span>`
- Right: flex gap-6 with three next/link Links — `/` ("Startseite"), `/impressum` ("Impressum"), `/datenschutz` ("Datenschutz") — all with classes `font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200`

Both components: German UI copy only (per CLAUDE.md).
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit 2>&1 | grep -E "AppHeader|AppFooter" || echo "OK: no type errors in new components"</automated>
  </verify>
  <done>Both files exist, compile with no TS errors, export default components, contain a Link to "/" for home navigation.</done>
</task>

<task type="auto">
  <name>Task 2: Create /app segment layout and trim /app/page.tsx</name>
  <files>web/src/app/app/layout.tsx, web/src/app/app/page.tsx</files>
  <action>
**Create web/src/app/app/layout.tsx** (Next.js App Router segment layout — wraps everything under `/app/*`):

```tsx
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function AppSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <AppHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <AppFooter />
    </div>
  );
}
```

Rationale: Root layout's `<body>` is `min-h-full flex flex-col`. This segment layout provides the min-h-screen flex column that lets the footer sit at the bottom on short pages and the WizardShell flex-grow between header and footer.

**Modify web/src/app/app/page.tsx**:
- Remove the outer `<main className="min-h-screen bg-creme">` wrapper — the layout now owns that
- Keep the `<Suspense>` + `<WizardShell />`
- Return just `<Suspense><WizardShell /></Suspense>` (or wrap in a fragment/div if Suspense needs a parent for styling — it doesn't)

Result: `/app/page.tsx` becomes ~6 lines.

Do NOT touch `web/src/app/layout.tsx` (root layout) or `web/src/app/page.tsx` (landing page). The landing page continues to render its own Header/Footer from within `page.tsx`.
  </action>
  <verify>
    <automated>cd web && npx tsc --noEmit && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
- `web/src/app/app/layout.tsx` exists and exports default layout component
- `/app/page.tsx` no longer has `<main>` wrapper
- `next build` succeeds
- Visiting `/app` renders: airmail stripe → header with brand + "Zur Startseite" link → WizardShell → footer with legal links
- Visiting `/` is unchanged (still uses marketing Header/Footer from page.tsx)
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Visual verification</name>
  <what-built>
- AppHeader component with brand link + "Zur Startseite" back-link
- AppFooter component with home + legal links
- /app segment layout wrapping WizardShell with header/footer
- /app/page.tsx trimmed to let layout own the shell
  </what-built>
  <how-to-verify>
1. Run `cd web && npm run dev`
2. Visit `http://localhost:3000/` — landing page should look EXACTLY as before (marketing Header/Footer unchanged)
3. Visit `http://localhost:3000/app` — should see:
   - Airmail stripe at top
   - New minimal header with "Brief nach Berlin" on left and "← Zur Startseite" on right
   - WizardShell in the middle
   - Airmail stripe + footer at the bottom with copyright + Startseite / Impressum / Datenschutz links
4. Click "← Zur Startseite" in the header → should navigate to `/`
5. Click "Startseite" in the footer → should navigate to `/`
6. Resize to mobile width (~375px) — header + footer should remain readable, not overflow
7. Scroll inside /app if content is tall — header stays sticky, footer sits at bottom
  </how-to-verify>
  <resume-signal>Type "approved" or describe visual/nav issues to fix.</resume-signal>
</task>

</tasks>

<verification>
- `cd web && npx tsc --noEmit` passes
- `cd web && npx next build` succeeds
- Manual: `/` unchanged, `/app` has new header + footer, both home links navigate to `/`
</verification>

<success_criteria>
- Users inside `/app/*` can always navigate back to `/` via header or footer
- Landing page visual/behavior is untouched
- No TypeScript or build errors
- Footer sits at bottom of viewport on short content; header is sticky on long content
</success_criteria>

<output>
After completion, create `.planning/quick/260414-pci-add-header-and-footer-to-app-layout-with/260414-pci-SUMMARY.md` noting files created, files modified, and any deviations from the plan.
</output>
