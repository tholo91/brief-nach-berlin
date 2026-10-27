---
created: 2026-10-27T12:00:00.000Z
title: "Eltern-Bereich auf /jung und /schule: Vertrauen klären und eigenen Brief zur Schulpolitik anbieten"
area: ui
severity: minor
files:
  - web/src/app/(site)/jung/page.tsx
  - web/src/app/(site)/schule/page.tsx
  - web/src/components/AppHeader.tsx
  - web/src/components/jung/jungHandoff.ts
  - web/src/lib/wizard-handoff.ts
  - web/src/lib/campaigns/specialCampaigns.ts:115
---

## Problem

Schüler:innen zeigen /jung vermutlich ihren Eltern, oder Eltern landen über die Lehrkraft dort. Eltern fragen sich zuerst: Ist das seriös, was passiert mit den Daten meines Kindes (unter 16), schreibt hier eine KI für mein Kind? Gleichzeitig sind Eltern eine erwachsene Zielgruppe mit eigenem Anliegen (Unterrichtsausfall, Lehrkräftemangel, Schulgebäude), die heute auf /jung keinen eigenen Einstieg findet.

Idee von Thomas am 27.10.2026, noch nicht freigegeben.

## Solution

Lean-Variante, keine eigene Route:

- Abschnitt "Für Eltern" auf /jung (Anker `#eltern`), kurzer Verweis auf /schule.
- Header-Link "Für Eltern" nur auf /jung und /schule, pfadabhängig wie `showCampaignCta` in `AppHeader.tsx`. Keine globale Navigation.
- 3 kurze Vertrauensantworten: welche Daten (E-Mail, PLZ), KI von Mistral aus Frankreich, das Kind bekommt nur die eine Mail mit dem Entwurf.
- Button "Eigenen Brief zur Schulpolitik schreiben": normaler Erwachsenen-Wizard, per `saveHandoff` vorbefüllt mit Eltern-Startsatz (z. B. "Mein Kind geht in die ... Klasse.") plus Themen-Chips (Unterrichtsausfall, Lehrkräftemangel, Schulgebäude, Ganztag, Inklusion, Schulweg). Chip-Logik teilen, nicht kopieren.
- Startsatz statt fertigem Text, damit Eltern ein eigenes Erlebnis ergänzen (sonst generische Briefe).
- Bildung ist Ländersache: Routing bzw. Copy sollte Richtung Landtag/Landesregierung zeigen.

Reihenfolge: erst schule-jung pushen und mit 1-2 Lehrkräften testen, dann bauen. Frontend über `frontend-design`.
