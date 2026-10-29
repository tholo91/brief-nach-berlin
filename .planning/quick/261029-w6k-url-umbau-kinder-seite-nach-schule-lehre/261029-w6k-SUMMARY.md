---
phase: quick-261029-w6k
plan: 01
subsystem: routing
tags: [nextjs, redirects, seo, schule, unterricht, header-nav]
requires: []
provides:
  - "/schule = Kinder-Seite, /unterricht und /unterricht/ablauf = Lehrer-Seiten"
  - "sechs 301-Weiterleitungen in web/next.config.ts mit Query-Durchreichung"
  - "Zielgruppen-Nav mit Für-Labels, Header-CTA auf /unterricht erst nach dem Hero-Button"
affects: [schule, unterricht, eltern, projekttag-demokratie, sitemap, klassenlinks]
actuals:
  tokens: 22700
  tasks: 3
  commits: 3
plan_head_before: 70a1416b1d51dbeb4cf31431acee524f3b17b822
plan_head_after: c0a63c8e0e2c99df2e891f8c0d096f5d01a8ff8c
tech-stack:
  added: []
  patterns:
    - "IntersectionObserver-Hook (useElementOutOfView) in AppHeader, Button erst nach Hydration und nur wenn Hero-Button aus dem Bild ist"
key-files:
  created:
    - web/src/__tests__/schoolRoutes.test.ts
  modified:
    - web/next.config.ts
    - web/src/app/sitemap.ts
    - web/src/components/AppHeader.tsx
    - web/src/components/schule/ClassLinkGenerator.tsx
    - web/src/lib/actions/createClassLink.ts
    - web/src/app/globals.css
  moved:
    - "web/src/app/(site)/schule -> (site)/unterricht"
    - "web/src/app/schule/ablauf -> web/src/app/unterricht/ablauf"
    - "web/src/app/(site)/jung -> (site)/schule"
key-decisions:
  - "Interne Modulnamen (components/jung, components/schule, lib/schule, audience: jung, jung-bg-Assets) bleiben, keine URLs"
  - "Redirects mit statusCode: 301 statt permanent (Next nutzt dort 308)"
  - "Header-CTA auf /unterricht bleibt, erscheint aber nur, wenn der Hero-Button nicht im Bild ist (Thomas)"
status: complete
completed: 2026-10-29
---

# Phase quick-261029-w6k Plan 01: URL-Umbau Schul-Seiten Summary

Kinder-Seite liegt jetzt unter /schule, Lehrer-Seite unter /unterricht (plus /unterricht/ablauf); sechs 301-Redirects, alte Klassenlinks /jung?k=TOKEN laufen auf /schule?k=TOKEN weiter.

## Commits (lokal, nicht gepusht)

| Task | Commit | Inhalt |
| ---- | ------ | ------ |
| a | 469232d | Lehrer-Seite nach /unterricht und /unterricht/ablauf, 301 von /schule/ablauf, /lehrer, /lehrkraefte, neuer Test schoolRoutes.test.ts |
| b | 42144a4 | Kinder-Seite nach /schule, 301 von /jung, /genz, /schueler, neue Klassenlinks /schule?k=, Lehrkraft-Link im Hero |
| c | c0a63c8 | Nav "Für Schüler:innen / Für den Unterricht / Für Eltern", ein Klassenlink-CTA, Querverweis-Absätze entfernt |

## Was geändert wurde

- Routen per git mv verschoben, alle internen Links, Sitemap, Canonicals, OG und JSON-LD ziehen mit. Die Sitemap hat /schule, /unterricht, /unterricht/ablauf, /eltern, /projekttag-demokratie ohne Duplikate, kein /jung.
- Redirects in `web/next.config.ts`: `/schule/ablauf` (spezifische Regel zuerst), `/lehrer`, `/lehrkraefte`, `/jung`, `/genz`, `/schueler`. `/schule` selbst wird nie umgeleitet (D-07).
- Kinder-Seite: kleiner Pill-Link "Du bist Lehrkraft? Zur Seite für den Unterricht" absolut oben links im Hero (kein zusätzliches Höhenwachstum vor dem Formular).
- AppHeader: Für-Labels, `whitespace-nowrap`, engerer Gap auf dem Handy, horizontal scrollbar ohne Scrollbalken als Fallback. Header-CTA "Klassenlink erstellen" auf /unterricht erscheint nur, wenn der Hero-Button (`id="klassenlink-hero"`) aus dem Viewport ist (IntersectionObserver, SSR und Start: versteckt, sanftes Einblenden mit prefers-reduced-motion-Schutz).
- Generator-Karte: Überschrift "Dein Klassenlink", Button "Link erstellen". "Klassenlink erstellen" steht im SSR-HTML von /unterricht genau einmal.
- Querverweis-Absätze vor dem Footer auf /schule, /unterricht, /eltern, /projekttag-demokratie entfernt (Projekttag-Entfernung von Thomas freigegeben).

## Verifikation

Geprüft:
- Jest: gesamte Suite grün (174 Suites, 1662 Tests), Mistral gemockt, nur *.test.ts.
- `tsc --noEmit` sauber (nach Löschen veralteter generierter Typen in web/.next/dev/types und web/.next/types, gitignored).
- `npm run build` grün; Routenliste zeigt /schule, /unterricht, /unterricht/ablauf, kein /jung.
- ESLint auf den berührten Quelldateien von Task 3 sauber.
- Grep-Gates: /schule-Lehrer-URLs 32 auf 0, /jung 22 auf 0, Label-Gate 0 auf 3.
- Redirect-Smoke gegen `next start` (Port 3210): `/jung?k=abc` gives 301 nach `/schule?k=abc`; `/schule/ablauf` 301 nach `/unterricht/ablauf`; `/lehrer`, `/lehrkraefte` 301 nach `/unterricht`; `/genz`, `/schueler` 301 nach `/schule`; `/schule` und `/unterricht` 200. Server danach gestoppt.
- Browser (headless Chrome via playwright-core gegen den Produktionsserver, 360px und 1280px): Header-CTA auf /unterricht oben nicht vorhanden, nach Scrollen vorhanden, zurück oben wieder weg; Nav auf einer Zeile ohne Seitenüberlauf (360px: scrollWidth gleich clientWidth); Lehrkraft-Link im Hero von /schule vorhanden; Screenshots von /schule (Handy und Desktop) und /unterricht gescrollt (Handy) angesehen, aktiver Nav-Zustand und Pill lesbar, Formular weiterhin im ersten Handy-Screen sichtbar.

Nicht geprüft:
- Kein Vorher/Nachher-Pixelvergleich der Formularhöhe auf dem Handy (nur Sichtprüfung des Nachher-Screenshots).
- Fokusring der Nav-Links bei overflow-x nicht visuell geprüft (Padding oben/unten ist dafür gesetzt).
- Sanftes Einblenden des Header-Buttons nicht visuell geprüft (nur Sichtbarkeitslogik).
- Produktion/Vercel nicht geprüft, nichts gepusht.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Veraltete generierte Next-Typen brachen tsc**
- **Found during:** Task 1 (tsc nach git mv)
- **Issue:** web/.next/dev/types und web/.next/types (inkl. iCloud-Duplikate "validator 3.ts") verwiesen auf die alten Routen.
- **Fix:** Verzeichnisse web/.next/dev/types und web/.next/types gelöscht (gitignored, werden neu erzeugt).
- **Commit:** keiner (nur Build-Artefakte)

**2. [Plan wording override] Header-CTA bleibt konditional**
- Laut Thomas' Override nicht entfernt, sondern nur sichtbar, solange der Hero-Button außer Sicht ist; die Plan-Zeile "no header button on /unterricht" im Visual-Check entsprechend als "oben nicht, nach Scrollen ja" geprüft.

Hinweis zum Commit-Guard: HEAD ist `main` (laut Plan und Dispatch gewollt, sequenziell auf dem Haupt-Worktree). `git.base-branch --is-protected main` meldet true; es gibt kein `git.allow_default_branch_commits` in `.planning/config.json`. Ich habe die drei Commits trotzdem lokal auf main gesetzt, weil Plan, Orchestrator und Thomas' Trunk-Regel das so vorgeben, und die Config nicht angefasst. Bitte bei Bedarf prüfen.

## Known Stubs

Keine.

## Threat Flags

Keine neuen Angriffsflächen. Redirects nur auf statische interne Ziele (Test prüft "/" ohne "//", keine Ketten, kein /schule-Wildcard).

## Offene Punkte

- Dev-Server auf Port 3333 (PID 976) lief schon vor Beginn und wurde nicht angefasst; sein Cache in web/.next/dev kann wegen der verschobenen Routen veraltet sein (Dev-Server neu starten, ggf. web/.next/dev löschen).

## Self-Check: PASSED

- Commits 469232d, 42144a4, c0a63c8 liegen in der Historie (git rev-list --count 70a1416..HEAD gleich 3).
- web/src/__tests__/schoolRoutes.test.ts, web/src/app/(site)/schule/page.tsx, web/src/app/(site)/unterricht/page.tsx, web/src/app/unterricht/ablauf/page.tsx vorhanden; web/src/app/(site)/jung und web/src/app/schule entfernt.
- Fremde dirty Dateien (debug, MdbLookupCard, lib/email, *email* Tests, ROADMAP, .gitignore) in keinem der drei Commits.
