---
created: 2026-08-11T00:00:00.000Z
title: Ton-Stimme: Stil-Referenz aus eigenen Texten (depriorisiert)
area: generation
status: backlog
priority: low
files:
  - web/src/lib/generation/generateLetter.ts
  - web/src/components/wizard/Step1bLengthTone.tsx
  - web/src/lib/types/wizard.ts
---

## Problem

Die häufigste negative Review-Beschwerde ist `klingt_nicht_nach_mir` (9 Reviews im 08-11-Batch, größter Negativcluster). Conversion-Datenpunkt aus Review-Batch 2026-08-11: Reviews mit `klingt_nicht_nach_mir`/`falscher_ton` → nur 3 von 15 Briefen verschickt (20%) vs. 83% ohne diese Tags. Ein Brief, der nicht nach dem Absender klingt, wird fast nie eingeworfen.

## Diagnose (Thomas, 2026-08-11)

Kein Slider-Problem: User haben schlicht keine eigenen Briefe/E-Mails/Anfragen als Stil-Referenz herumliegen, die die KI nachbilden koennte. Es fehlt Material, nicht ein feinerer Regler. Input-Korrelation der Daten: Der Ton-Cluster hat im Schnitt kuerzeren Input (434 Zeichen vs. 580 bei 4-5★) - weniger Material = weniger eigene Stimme.

## Loesungsidee (BACKLOG, depriorisiert)

Optionaler Eingabe-Schritt im Wizard: "Eigener Text als Stil-Referenz einfuegen" (z.B. eine fruehere E-Mail an die Verwaltung, ein eigener Brief). Dieser Text wird als `<stil_referenz>` zusaetzlich in den User-Prompt gegeben, mit Direktive: "Passe Satzbau, Vokabular und argumentativen Stil an diese Referenz an, uebernimm aber NUR inhaltliche Fakten aus dem <transkript>."

## Warum depriorisiert

- Die meisten User haben kein solches Referenzmaterial - der Hauptfall (wenig Input) wird dadurch nicht geloest.
- Zusaetzlicher Input-Schritt erhoeht Friction im Wizard, gegen das "lean"-Prinzip.
- 20% vs. 83% Send-Quote bleibt als Motivation eingefroren, falls es wieder relevant wird.

## Offene Fragen (bei Reaktivierung)

- Hoeher- vs. niedrigschwellig: optionaler Schritt vs. dezenter Link "Klingt nicht nach dir?"
- DSGVO-Check: Referenztext wird nur in den Prompt geschickt, nicht gespeichert (wie <transkript>).

## Status

Depriorisiert, kein P-Budget. Nur aufnehmen, wenn `klingt_nicht_nach_mir` erneut dominant wird ODER die Stil-Referenz als Kampagnen-/Power-User-Feature nachgefragt wird.