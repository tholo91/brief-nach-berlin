---
created: 2026-06-25T13:36:48+0200
title: Bekannt-aus Medien-Logo-Marquee über Review-Marquee
area: ui
files:
  - web/src/app/(site)/presse/page.tsx
  - web/src/components/CallToAction.tsx
---

## Problem

Brief nach Berlin ist per dpa breit in der Presse erschienen (siehe `/presse`). Diese Reichweite ist Social Proof, der auf der Landing Page bisher fehlt. Ziel: eine "Bekannt aus"-Logo-Leiste der berichtenden Medien einführen, die das Vertrauen erhöht und auf die echten Artikel verlinkt.

## Solution

Zwei gegenläufige Marquee-Leisten auf der Landing Page:

1. **Oben (neu): Medien-Logo-Marquee**
   - Wording: **"Bekannt aus"** (deutscher Standard, äquivalent zu "As seen in")
   - Logos der Outlets, die konkret über Brief nach Berlin berichtet haben
   - Jedes Logo verlinkt auf den jeweiligen Artikel: `target="_blank"` + `rel="noopener"` (neuer Tab)
   - Logos in **Graustufen / reduzierter Opacity** (kein Endorsement-Eindruck)
   - **dpa-Logo selbst NICHT zeigen** — nur die übernehmenden Medien (deren Logos gehören ihnen, nicht der dpa)
   - Logo-Liste / Artikel-URLs aus `web/src/app/(site)/presse/page.tsx` ziehen
   - Logos für nahtloses Endlos-Loopen ggf. duplizieren (sonst zappelig bei wenigen Items)

2. **Darunter (bestehend): Review-Marquee**
   - Bestehende Bewertungs-Leiste (inkl. Anzahl Briefe)
   - Läuft in **entgegengesetzter Richtung** zur Logo-Leiste
   - Beide Marquees zum Start **gleiche Geschwindigkeit** (bei zu mechanischem Eindruck Logo-Leiste minimal langsamer testen)

**Rechtlicher Rahmen (geklärt):** Redaktionelle Referenz mit Link auf echte Artikel = unbedenklich. Kein "empfohlen von X"-Claim. Nachfragen bei den Medien nur nötig, falls die Logos später in bezahlter Werbung / Print genutzt würden — für die Website-Presseleiste nicht erforderlich.

### OFFENE FRAGEN vor Umsetzung klären
- **(a) Logo-Quelle:** Brand-Kits / Press-Mappen der Medien selbst beschaffen (SVG/PNG), oder hat Thomas die Logos schon irgendwo gesammelt?
- **(b) Graustufen vs. Original-Farben:** Bleibt es bei Graustufen/Opacity, oder sollen Original-Farben gezeigt werden?

### Umsetzungshinweis
Frontend-Umsetzung über `/frontend-design` oder `/taste` (UI-Skill-Pflicht laut Memory).
