---
created: 2026-06-02T20:55:00.000Z
updated: 2026-06-21T00:00:00.000Z
title: v2 Landing wizard merge with voice input field
area: ui
files:
  - web/src/components/Hero.tsx
  - web/src/components/Header.tsx
  - web/src/components/CallToAction.tsx
  - web/src/components/wizard/WizardShell.tsx
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/app/page.tsx
  - web/src/app/app/page.tsx
---

## Umgesetzt (2026-06-21, Branch `feat/landing-wizard-merge`)

Implementiert nach Design-Session mit Thomas. Die Interaktion wurde gegenüber
dem ursprünglichen Plan verfeinert:

- **Eskalations-Modell statt statischer Felder:** 0-19 Zeichen = schlanke
  1-Zeilen-Leiste + ruhige Value-Prop-Zeile darüber. Ab 20 Zeichen
  (`LANDING_EXPAND_CHARS`) = Feld wächst (auto-grow), Zeile crossfadet zu
  „Je konkreter, desto wirksamer" (feste Höhe, nur Opacity -> kein Springen).
  Ab 50 Zeichen (`MIN_CHARS`) = Tonalitäts-Slider + „Weiter" faden ein.
- **Tagline statt Rotation:** Die 4 rotierenden Sub-Headlines sind raus; die
  einzige Rotation above-the-fold sind jetzt die Feld-Platzhalter (eigene
  **kurze** 1-Zeilen-Variante `LANDING_PLACEHOLDER_EXAMPLES` für die schlanke
  Leiste; die langen Beispiele bleiben im Wizard).
- **`suppressUrlWrite`-Prop entfällt:** unnötig. `Step2Issue` schreibt selbst
  nie in die URL (nur `WizardShell` tut das). Die Landing mountet `Step2Issue`
  standalone ohne `WizardShell` -> null URL-Verschmutzung by construction.
- **Handoff:** `lib/wizard-handoff.ts` (`saveHandoff`/`peekHandoff`/
  `clearHandoff`). `WizardShell` liest beim Init (peek, kein Flash), startet auf
  Step 2, cl{ear}t den Eintrag in einem Effect (Reload -> sauberer Neustart).
- **Autofokus** nur Desktop (`(hover: hover) and (pointer: fine)`), `#hero-cta`
  auf Feld-Wrapper (Observer ok), `#anliegen` als Scroll-Anchor; Header- &
  CallToAction-CTAs -> `/#anliegen` (CallToAction auf `<Link>` umgestellt).

**Feedback-Runde (2026-06-21) eingearbeitet:**
- Hinweis „Tippen oder Mikrofon antippen zum Diktieren" entfernt (zu unruhig);
  betrifft auch den Wizard (dort durch den Intro-Text redundant).
- Schlanke Leiste: Padding reduziert (`px-4 py-2.5`), Höhen 52/88 px,
  Platzhalter auf knappe 1-Zeilen-Varianten gekürzt (kein Wrap/Clipping mobil).
- „Je konkreter, desto wirksamer" auf der Landing ist jetzt **dieselbe**
  `TipsDisclosure` wie in `/app` (exportiert, self-contained), crossfadet ab
  20 Zeichen aus der Value-Prop-Zeile; Ausklappen schiebt das Feld runter.
- Mobile Trust-Badges nebeneinander statt gestapelt; „Kein Account
  erforderlich" -> „ohne Account" (nur mobil, Desktop unverändert).

Verifiziert im Preview (Desktop + Mobile): Eskalation, Handoff -> `/app?step=2`
(kein `issueText` in URL), „zurück" -> Step 1 mit Text + Ton erhalten, direkter
`/app`-Aufruf unverändert, kein Keyboard-Popup mobil. `tsc` + `eslint` sauber.
Noch offen: Thomas' visuelle Abnahme im echten Browser, dann Commit/Push.

## Problem

Die Vercel-Logs vom 2026-06-02 zeigen: ~79 % der Sessions auf der Landing Page starten den Wizard nie. Der Routen-Sprung `/` → `/app` ist der größte Funnel-Leak. Jeder Klick zwischen Visitor und erster Aktion ist Friction.

Heutiger Funnel:
1. Visitor landet auf `/`.
2. Sieht Hero, CTAs, Marketing-Content.
3. Klickt „Brief schreiben" → navigiert zu `/app`.
4. Startet erst dann mit dem Anliegen-Input.

Hypothese: Wenn der erste Kontakt bereits der Input ist (kein Extra-Klick), steigt die Conversion.

## Entschiedene Lösung

### Kern-Architektur: Handoff statt Klon

`Step2Issue` (Anliegen-Textarea + Mic + Tonalität) wird das **gemeinsame Reusable** — gemountet an zwei Orten:

1. **Landing Page (`/`)**: direkt above-the-fold, breites auto-grow Feld, sofort tippbar.
2. **Wizard (`/app`, Schritt 1)**: wie heute, unverändert.

Änderungen an `Step2Issue` wirken automatisch an beiden Stellen. Kein Code-Duplikat.

### Flow Landing → Wizard

```
/ (Landing)
  └─ User tippt/spricht Anliegen
  └─ Klickt "Weiter"
  └─ sessionStorage.setItem('wizard-handoff', {issueText, toneLevel})
  └─ router.push('/app')
        └─ WizardShell liest sessionStorage beim Mount
        └─ füllt issueText + toneLevel aus
        └─ löscht den sessionStorage-Eintrag
        └─ startet direkt auf Schritt 2 (PLZ + E-Mail)
```

**Kein `?text=` in der URL** — Privacy-Prinzip bleibt gewahrt (issueText wandert nie in die Adresszeile).

### "Zurück" aus Schritt 2

Zurück-Button aus Schritt 2 → landet auf Schritt 1 von `/app` (normaler Wizard, Text noch im State). Ab dort: existierender Pfad, keine neuen Sonderfälle. Sauber.

### /app bleibt vollständig erhalten

- Alle ~20 SEO-Unterseiten (`/guide`, `/lage-der-nation`, `/beispiele`, `/tipps`, `/kommunalpolitik-brief` …) linken auf `/app` → **kein Anfassen**.
- Externe Links (Lage der Nation Podcast, Reddit) zeigen auf `/app` → **kein Redirect**.
- `WIZARD_PATH = "/app"` in `lib/config.ts` → **unverändert**.
- `/app` funktioniert weiterhin als eigenständiger Einstieg (direkt aufrufbar, ohne Landing).

---

## Implementierungs-Checkliste

### 1. `Step2Issue` als sauberes Reusable vorbereiten

- [ ] `initialHeight`-Prop hinzufügen (Landing: schlank, /app: heutiger Wert `min-h-[160px]`). So können beide Orte unabhängig dimensioniert werden.
- [ ] Auto-grow implementieren: `height = scrollHeight` bei jeder Eingabe (aktuell fixer resize-y Griff → rauswerfen). Verhält sich wie ChatGPT-Eingabefeld.
- [ ] `autoFocus`-Prop (boolean, default false). Landing setzt sie auf true, `/app` behält false.
- [ ] Autofokus-Gate in der Komponente: nur fokussieren wenn `window.matchMedia("(hover: hover) and (pointer: fine)").matches` → schließt Handy + iPad aus (verhindert Tastatur-Popup auf Touch-Geräten).
- [ ] `suppressUrlWrite`-Prop (boolean, default false). Landing-Instanz setzt sie auf true → kein `router.replace` mit Wizard-Params auf `/` (verhindert URL-Verschmutzung und SEO-Risiko). Gilt nur für die Step2Issue-Instanz auf der Landing, WizardShell bleibt unverändert.

### 2. sessionStorage-Handoff

- [ ] Neues Modul `lib/wizard-handoff.ts` mit zwei Funktionen:
  - `saveHandoff({ issueText, toneLevel })` → sessionStorage
  - `readAndClearHandoff()` → gibt `{ issueText, toneLevel } | null` zurück und löscht Eintrag
- [ ] Kein PII außer issueText (User-Input), der bewusst kurzlebig in sessionStorage landet und nach dem Einlesen sofort gelöscht wird. DSGVO-konform.

### 3. WizardShell: Handoff-Erkennung

Einzige Änderung an WizardShell ([web/src/components/wizard/WizardShell.tsx:63](web/src/components/wizard/WizardShell.tsx)):

- [ ] Beim Init: `readAndClearHandoff()` aufrufen.
- [ ] Falls Handoff vorhanden: `wizardData` mit `issueText` + `toneLevel` vorbelegen, `step` auf `2` setzen (überspringt Step 1 von /app).
- [ ] Falls kein Handoff: normaler Start auf `step = 1` wie heute.
- [ ] Keine anderen Änderungen an WizardShell.

### 4. Hero.tsx umbauen

- [ ] Den `<a href="/app">` CTA-Button entfernen.
- [ ] `id="hero-cta"` wandert auf das neue Eingabefeld (oder einen Wrapper-Div), damit der IntersectionObserver in `Header.tsx` weiterhin funktioniert. **Kritisch — nicht vergessen**, sonst bricht die sticky Header-CTA auf Mobile.
- [ ] Die 4 rotierenden Sub-Headlines (aktuell Font Handwriting, 8-Sek-Interval) durch **eine statische Zeile** ersetzen. Formulierung TBD (kann z.B. `sub[0]` der ersten Variante sein, oder eine neue Zeile). Rationale: nach dem Merge gibt es schon die rotierenden Platzhalter im Feld — zwei gleichzeitige Animationen würden kollidieren und die Hero-Section aufblähen.
- [ ] `Step2Issue` with `autoFocus={true}` und `initialHeight="slim"` einbinden.
- [ ] Breiter Container für die Landing-Instanz (größer als `max-w-xl` des Wizards).
- [ ] "Weiter"-Button in der Landing-Instanz ruft `saveHandoff()` + `router.push('/app')` auf statt `onSubmit` an WizardShell zu übergeben.

### 5. Header.tsx: CTAs anpassen

- [ ] Sticky-Header-CTA (`href="/app"`) → `href="/#anliegen"` (Smooth-Scroll zum neuen Feld-Anchor). Oder `onClick` mit `document.querySelector('#anliegen')?.scrollIntoView()` wenn der Anchor auf derselben Seite ist.
- [ ] Mobile-Menu CTA: gleiche Änderung.
- [ ] `id="hero-cta"` muss weiter existieren (Observer!) → liegt jetzt am Feld-Wrapper.

### 6. CallToAction.tsx

- [ ] `href="/app"` → `href="/#anliegen"` (Scroll zum Feld, nicht Route-Wechsel).
- [ ] Ggf. Button-Text anpassen: „Jetzt Brief schreiben →" passt noch, alternativ „Direkt starten →".

### 7. Lokaler Test vor Push

- [ ] Auf eigenem Feature-Branch bauen (z.B. `feat/landing-wizard-merge`).
- [ ] `/app` direkt aufrufen → muss exakt wie heute funktionieren (Regression-Check).
- [ ] Landing aufrufen → Feld fokussiert automatisch (Desktop), Mic-Button sichtbar, Platzhalter rotiert.
- [ ] Anliegen eingeben → „Weiter" → landet auf `/app` Schritt 2, Text befüllt, Tonalität übernommen.
- [ ] Zurück aus Schritt 2 → Schritt 1 von `/app`, Text im Feld.
- [ ] Mobile: kein Tastatur-Popup beim Laden.
- [ ] URL nach Handoff: `/app?step=2&plz=` (kein issueText in URL).
- [ ] Landing-URL während Eingabe: bleibt `/` ohne Wizard-Params.

---

## Was NICHT Teil dieses Todos ist

- **Umami Analytics**: eigene Story [[2026-06-02-setup-umami-cloud-analytics-for-funnel-visibility]]. Separat umsetzen, idealerweise vorher für eine Baseline.
- **SEO-Unterseiten**: alle `href="/app"` in Unterseiten bleiben unangetastet.
- **Wizard-Logik** (Server Actions, PLZ-Lookup, Disambiguierung, Letter-Generierung): kein Eingriff.
- **VoiceRecorder / AudioRecorder**: kein Eingriff, wird 1:1 wiederverwendet.

---

## Risiken & Mitigations

| Risiko | Mitigation |
|--------|-----------|
| `#hero-cta` Observer bricht (Header sticky CTA) | `id="hero-cta"` auf Feld-Wrapper setzen, nicht auf alten Button |
| URL-Verschmutzung auf `/` | `suppressUrlWrite`-Prop verhindert `router.replace` in Landing-Instanz |
| Zwei Rotations-Animationen kollidieren | Hero-Sub-Headlines werden statisch |
| Mobile Tastatur-Popup beim Laden | Autofokus nur wenn `(hover: hover) and (pointer: fine)` |
| `/app` bricht für externe Links | `/app` bleibt eigenständige Route, kein Redirect |

---

## GSD-Start

```
/gsd-execute-phase
```

Oder für Planung zuerst:

```
/gsd-plan-phase
```

Kontext: Dieses Todo enthält alle Architektur-Entscheidungen. Kein weiteres Discuss nötig — direkt in Planung oder Ausführung einsteigen.
