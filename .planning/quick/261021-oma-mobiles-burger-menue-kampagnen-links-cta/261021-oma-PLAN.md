---
quick_id: 261021-oma
mode: quick
files:
  - web/src/components/Header.tsx
---

# Quick 261021-oma: Mobiles Burger-Menü schlanker und mit Kampagnen-Einstieg

Entscheidung mit Thomas (21.10.2026): Menü bleibt schlank, keine Kampagnen-Liste, nur zwei Textlinks auf `/ngo-briefkampagne`.

Zielbild (mobil, Menü offen):

```
Brief-nach-Berlin                   ✕
Wie es funktioniert
Die Idee
Mitmachen
Laufende Kampagnen      → /ngo-briefkampagne#laufende-kampagnen   (nur locale "de")
Für NGOs + Creator      → /ngo-briefkampagne                      (nur locale "de")
Sprache                          [DE]
[ ✎  Brief schreiben ]
```

## Task 1: Header.tsx anpassen

Nur `web/src/components/Header.tsx` ändern.

1. Solange `menuOpen` true ist: Header-CTA "Brief schreiben" (der collapsible Link neben dem Burger) mobil ausblenden. Desktop (`md:`) bleibt unverändert. Gleichen max-w/opacity-Übergang wiederverwenden, kein harter Sprung.
2. Solange `menuOpen` true ist: den mobilen `LanguageSwitcher mobile` im Header ausblenden (sonst doppelt), weil die Sprache-Zeile jetzt immer im Menü steht.
3. Sprache-Zeile im Panel immer rendern (Bedingung `showNavCta &&` entfernen).
4. Nach den `navLinks` zwei Zeilen im gleichen Stil wie die bestehenden Panel-Links (gleiche Klassen, `onClick={closeMenu}`), nur wenn `useLocale().locale === "de"` (Muster aus `web/src/components/campaigns/MobileCampaignStrip.tsx`, Strings dort ebenfalls hartcodiert deutsch):
   - "Laufende Kampagnen" → `next/link` auf `/ngo-briefkampagne#laufende-kampagnen`
   - "Für NGOs + Creator" → `next/link` auf `/ngo-briefkampagne`
5. Großer Panel-Button "Brief schreiben": kleines Stift-Icon als Inline-SVG (stroke `currentColor`, ca. 18px, `aria-hidden="true"`) links vom Text, Button als `inline-flex items-center justify-center gap-2`. Stil wie vorhandene Inline-SVGs im Repo. Keine neue Abhängigkeit.
6. Panel auf kleinen Displays scrollbar machen: `max-h-[calc(100dvh-<Headerhöhe>)] overflow-y-auto` o. ä. am Panel-Container.

Kein Em-Dash in sichtbarer Copy. Keine anderen Dateien anfassen.

## Verify

- `cd web && npx tsc --noEmit -p .` und `npx eslint src/components/Header.tsx` ohne neue Fehler.
- `cd web && npx jest` falls Header-Tests existieren (`grep -rl "Header" src/__tests__`), sonst überspringen. Mistral wird nicht aufgerufen.

## Done

Header.tsx umgesetzt wie oben, Checks grün, ein Commit `feat(header): mobiles Menü mit Kampagnen-Links und ohne doppelten CTA`, nur `web/src/components/Header.tsx` gestaged (Worktree hat fremde Änderungen an AGENTS.md, CLAUDE.md, .planning/*, die NICHT gestaged werden dürfen).
