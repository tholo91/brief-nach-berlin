---
phase: 2
slug: core-engine
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-13
---

# Phase 2 — Core Engine: UI Design Contract

> Visual and interaction contract for Phase 2: multi-step wizard, voice recording, PLZ lookup disambiguation, content safety feedback, and success/processing states.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — custom Tailwind v4 tokens only |
| Preset | not applicable |
| Component library | none (custom components, no Radix/shadcn) |
| Icon library | inline SVG (as per existing codebase pattern in Hero.tsx) |
| Font — typewriter | Courier Prime (`font-typewriter`), weights 400 + 700 |
| Font — body | Source Sans 3 (`font-body`), weights 400 + 600 |
| Font — handwriting | Caveat (`font-handwriting`), weight 400 |

Source: `web/src/app/layout.tsx`, `web/src/app/globals.css`

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, input-label gap, inline padding |
| sm | 8px | Field helper text spacing, checkbox/radio gap |
| md | 16px | Default field spacing, button padding, form group gaps |
| lg | 24px | Step section padding, card padding |
| xl | 32px | Wizard content vertical rhythm between groups |
| 2xl | 48px | Step transition spacing, major section breaks |
| 3xl | 64px | Page-level top/bottom padding on wizard container |

Exceptions:
- Mic button touch target: minimum 44px (WCAG 2.5.5 AA compliance)
- Progress indicator dots: 8px diameter, 12px gap between dots
- Recording elapsed timer: 4px gap between timer icon and text

---

## Typography

| Role | Font | Size | Weight | Line Height | Usage |
|------|------|------|--------|-------------|-------|
| Body | Source Sans 3 (`font-body`) | 16px | 400 | 1.5 | Form field labels, helper text, descriptions |
| Label | Source Sans 3 (`font-body`) | 14px | 600 | 1.4 | Step labels, input labels, optional badges |
| Heading | Source Sans 3 (`font-body`) | 20px | 600 | 1.3 | Step headings (e.g. "Dein Anliegen") |
| Display | Courier Prime (`font-typewriter`) | 28px | 700 | 1.2 | Step number + title display (e.g. "Schritt 1") |

Handwriting accent (Caveat, 18px, weight 400, line-height 1.4): reserved for success page confirmation text only.

Source: `web/src/app/layout.tsx` (font definitions), `web/src/components/Hero.tsx` (sizing reference)

---

## Color

All tokens are declared in `web/src/app/globals.css` and the Tailwind `@theme inline` block.

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Dominant (60%) | `creme` | `#FAF8F5` | Wizard page background, input field backgrounds, card surfaces |
| Secondary (30%) | `waldgruen-dark` / `warmgrau` | `#1B4332` / `#3D3D3D` | Step headings, body text, borders, inactive step indicators |
| Accent (10%) | `waldgruen` | `#2D6A4F` | Reserved-for list below |
| Error/Destructive | `airmail-rot` | `#C1121F` | Error messages, moderation rejection banner, invalid field borders |
| Recording state | `airmail-rot` | `#C1121F` | Pulsing mic indicator during active recording |
| Structural accent | `airmail-blau` | `#1D3557` | Airmail stripe dividers only (inherited from Phase 1 motif) |

**Accent (`waldgruen`) reserved for:**
- Primary submit button background ("Brief anfordern")
- Active step indicator dot
- Textarea focus ring
- Politician selection card hover/selected border
- Voice recording "Start" button icon color (idle state)
- Progress bar fill

**`waldgruen-light` (`#40916C`):** Button hover states only.

Source: `web/src/app/globals.css`

---

## Component Inventory

### Wizard Shell
- Single-page state machine (`step: 1 | 2 | 3`)
- Progress indicator: 3 dots at top, active dot filled `waldgruen`, inactive dots `warmgrau/30`
- Step transition: fade only (opacity 0→1, 150ms ease-in) — no slide, no transform (discretion: CONTEXT.md §Claude's Discretion)
- Max content width: `max-w-xl` (672px) centered, horizontal padding `px-4` (mobile) / `px-8` (desktop)

### Step 1 — Kontaktdaten
Fields (in order):
1. PLZ — text input, 5 digits, label "Postleitzahl", helper "Damit finden wir deinen zuständigen Abgeordneten"
2. E-Mail — email input, label "E-Mail-Adresse", helper "Wir schicken dir deinen Brief per Mail zu"
3. Collapsible section — "Angaben zu deiner Person (optional)"
   - Name — text input, label "Dein Name", placeholder "Max Mustermann"
   - Party — text input, label "Parteimitgliedschaft", placeholder "z.B. SPD, Grüne, CDU"
   - NGO/Gewerkschaft — text input, label "Organisation / Gewerkschaft", placeholder "z.B. Greenpeace, ver.di"
   - Collapsed by default. Toggle uses `waldgruen` chevron icon.

### Step 2 — Dein Anliegen
- Textarea — min-height 160px, max-height 320px (auto-grow), label "Was beschäftigt dich?", placeholder "Schreib hier, was dich stört, was du dir wünschst oder was du fragen möchtest. Je konkreter, desto überzeugender wird dein Brief."
- Character counter — right-aligned below textarea, 14px, `warmgrau/60`, format: "247 Zeichen"
- Voice recording button — below textarea, full-width on mobile / inline on desktop
  - Idle: mic SVG icon + label "Sprachaufnahme starten", `waldgruen` icon color
  - Recording: red pulsing dot + elapsed timer (MM:SS) + label "Aufnahme stoppen"
  - Processing: spinner + "Transkription läuft..." (disabled)
  - Transcription populates textarea and is editable
  - Pulsing animation: `animate-pulse` on the red indicator dot, 1s duration
  - Source pattern: surv.ai RecordingInterface (adapted per CONTEXT.md D-11)

### Step 3 — Erfolg / Verarbeitung
Two sub-states:

**Sub-state A: Single Wahlkreis (D-10)**
- Heading (Courier Prime 28px/700): "Dein Brief wird erstellt..."
- Body copy (Source Sans 16px/400): see Copywriting Contract
- Handwriting accent (Caveat 18px): confirmation line below body
- Processing animation: typewriter cursor blinking after heading text

**Sub-state B: Disambiguation needed (D-09)**
- Heading: "Wir haben mehrere Abgeordnete gefunden"
- Subheading: "Wer soll deinen Brief erhalten?"
- Politician cards: one card per MdB, showing name + party + Wahlkreis name
  - Card background: `creme` with `waldgruen/20` border
  - Selected state: `waldgruen` border (2px), `waldgruen/10` background
  - Name: 16px/600, Party: 14px/400 `warmgrau`, Wahlkreis: 14px/400 `warmgrau/70`
- After selection: transitions to Sub-state A processing animation

### Input Fields (shared)
- Background: `creme`
- Border: 1px `warmgrau/30`, rounded-lg (8px)
- Focus: 2px ring `waldgruen`, border color `waldgruen`
- Error: 1px border `airmail-rot`, error message 14px `airmail-rot` below field
- Disabled: `warmgrau/20` background, `warmgrau/50` text

### Buttons (shared)
- Primary: `waldgruen` bg, `creme` text, 16px/600, px-8 py-4, rounded-xl, hover `waldgruen-dark`
- Secondary: `creme` bg, `waldgruen` text + border, same sizing as primary
- Touch target minimum: 44px height (applies to all interactive elements)

### Moderation Rejection Banner (SAFE-03)
- Full-width banner above the form, `airmail-rot/10` bg, `airmail-rot` left border (4px), `airmail-rot` text
- Dismissible: user edits textarea, banner auto-hides on keystroke
- Copy: see Copywriting Contract

---

## Copywriting Contract

All copy is in German. No Gendersternchen, no Doppelpunkt gendering, no Binnen-I (CONTEXT.md D-03, Phase 1 D-03).

| Element | Copy |
|---------|------|
| Primary CTA — Step 1 | "Weiter zum Anliegen" |
| Primary CTA — Step 2 | "Brief anfordern" |
| Step 1 heading | "Schritt 1: Kontaktdaten" |
| Step 2 heading | "Schritt 2: Dein Anliegen" |
| Step 3 heading (processing) | "Dein Brief wird erstellt …" |
| Step 3 body (processing) | "Wir analysieren dein Anliegen, finden den zuständigen Abgeordneten und formulieren deinen Brief mit den besten Argumenten. Das kann einen Moment dauern — wir schicken dir den Brief per Mail zu." |
| Step 3 handwriting accent | "Dein Anliegen ist auf dem Weg." |
| Disambiguation heading | "Wir haben mehrere Abgeordnete gefunden" |
| Disambiguation subheading | "Wer soll deinen Brief erhalten?" |
| Voice — idle label | "Sprachaufnahme starten" |
| Voice — recording label | "Aufnahme stoppen" |
| Voice — processing label | "Transkription läuft …" |
| Voice — done label | "Aufnahme übernommen" |
| Voice — error label | "Aufnahme fehlgeschlagen — bitte erneut versuchen" |
| Optional fields toggle | "Angaben zu deiner Person (optional)" |
| PLZ helper | "Damit finden wir deinen zuständigen Abgeordneten" |
| Email helper | "Wir schicken dir deinen Brief per Mail zu" |
| Moderation rejection | "Wir können dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich und ohne beleidigende Formulierungen." |
| PLZ invalid format | "Bitte gib eine gültige 5-stellige Postleitzahl ein." |
| PLZ not found | "Für diese Postleitzahl haben wir keine Daten. Bitte prüfe deine Eingabe." |
| Email invalid | "Bitte gib eine gültige E-Mail-Adresse ein." |
| Missing politician data | "Für dieses Anliegen haben wir leider keine Daten zum Landtag. Hier kannst du selbst prüfen: [Link]" |
| Output moderation rejection | "Beim Erstellen deines Briefes ist ein Problem aufgetreten. Bitte formuliere dein Anliegen anders und versuche es erneut." |
| Generic server error | "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut." |

No destructive actions in this phase. Moderation rejection is a soft block — user edits and resubmits, no confirmation dialog required.

Source: CONTEXT.md D-07, D-09, D-11, D-12, D-15; REQUIREMENTS.md SAFE-03

---

## Interaction States

| Component | States |
|-----------|--------|
| PLZ input | idle → typing → valid → invalid |
| Email input | idle → typing → valid → invalid |
| Textarea | idle → focused → populated → character-limit-warn (>600 chars) |
| Voice button | idle → recording → processing → done → error |
| Submit button | idle → loading (spinner) → success (disabled) → error (re-enabled) |
| Politician card | idle → hover → selected |
| Step | 1 → 2 → 3 (forward only; no back navigation in Phase 2) |

---

## Accessibility

- All form inputs have explicit `<label>` elements with `htmlFor` matching input `id`
- Error messages use `role="alert"` and are linked via `aria-describedby`
- Voice button has `aria-label` that updates with state: "Sprachaufnahme starten" / "Aufnahme stoppen" / "Transkription läuft"
- Mic permission denied: show `PermissionRecoveryGuide` pattern from surv.ai reference
- Politician selection cards: `role="radio"` within `role="radiogroup"`, keyboard navigable
- Processing state: `aria-live="polite"` on the processing message container
- Touch targets: 44px minimum on all interactive elements

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none — shadcn not initialized | not applicable |
| third-party | none declared | not applicable |

No third-party component registries. All components are custom-built using Tailwind v4 tokens.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
