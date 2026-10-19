---
quick_id: 261019-uyl
mode: quick
status: planned
---

# Übergabe-Mail (kind "transfer"): Briefzahl, "siehst / kannst / bekommst nicht", Anrede-Fix

Context: Wer eine Kampagne übertragen bekommt, erfährt in der Mail heute nicht, was die Übernahme bedeutet.
Thomas hat entschieden (2026-10-19): echte Briefzahl als Kachel + drei kurze Blöcke, reines Mail-HTML ohne Bild.
Bug: `transferCampaign.ts` übergibt `creatorName: campaign.creatorName`, dadurch wird die NEUE Adresse mit dem Namen der ALTEN Inhaberin begrüßt.

## Task 1: Daten durchreichen + Anrede-Fix
files: web/src/lib/actions/transferCampaign.ts, web/src/lib/email/sendCampaignCreatorEmail.ts, web/src/lib/email/buildCampaignCreatorEmailHtml.ts (nur Params-Typ)
action:
- In `transferCampaignAction` an `sendCampaignCreatorEmail` übergeben: `letterCount: campaign.letterCount`, `inviterName: campaign.creatorName`, `campaignStatus: campaign.status` (falls Feld schon existiert, wiederverwenden). `creatorName` NICHT mehr übergeben.
- Erfolgsmeldung "Die neue Inhaberin muss den Link bestätigen." → "Die neue Adresse muss den Link noch bestätigen."
- Optionale Felder `letterCount?: number`, `inviterName?: string | null` in den Params-Typen von send + build ergänzen und durchreichen. Bestehende Muster/Benennungen folgen.
verify: `cd web && npx jest src/__tests__/transferCampaignAction.test.ts` (Erwartungen auf neue Felder/Meldung anpassen).
done: neue Felder kommen im Builder an; Anrede der Transfer-Mail ist "Moin," ohne alten Namen.

## Task 2: Transfer-Mail-Layout
files: web/src/lib/email/buildCampaignCreatorEmailHtml.ts (nur `isTransfer`-Zweige ab ~Zeile 442)
action:
- Intro: mit `inviterName` → "{Name} möchte dir die Kampagne übergeben. Ein Klick bestätigt deine E-Mail-Adresse und öffnet den Verwaltungszugang." Ohne Namen bisheriger Satz. Name mit `escapeHtml`.
- Zahl-Kachel direkt nach der Kampagnen-Box, nur wenn `letterCount > 0` UND Status nicht `awaiting_approval`: Eyebrow "STAND HEUTE" (Courier-Stil wie die anderen Eyebrows), Zahl groß (`formatLetterCount` aus `@/lib/campaigns/milestones`, ca. 40px, Georgia, #1B4332, zentriert), darunter "Briefe geschrieben" bzw. bei 1 "Brief geschrieben". Hintergrund #FAF8F5, Border #E0DCD7, radius 4px, wie bestehende Boxen.
- `managementHelp` im Transfer-Zweig ersetzen durch EINE weiße Box (Stil der bestehenden "Wichtig"-Box) mit drei Abschnitten, jeweils Courier-Eyebrow + Zeilen als `<table role="presentation">`-Rows mit kleinem grünem Zeichen (&#10003; für siehst/kannst, &#10005; in #999 für bekommst nicht), kein `<ul>`:
  1. "Das siehst du live" (bei awaiting_approval: "Das siehst du live, sobald die Kampagne freigegeben ist"):
     - Briefe gesamt und Verlauf pro Tag oder Woche
     - Woher geschrieben wird, nach Bundesländern
     - Wie viele ihren Brief wirklich abschicken
     - Zufriedenheit und was über die Briefe gesagt wird
  2. "Das kannst du":
     - Texte ändern, pausieren, beenden oder weitergeben
     - Meilenstein-Mails an- oder ausschalten
  3. "Das bekommst du nicht":
     - Briefe oder E-Mail-Adressen der Schreibenden. Jeder Brief geht von Hand direkt an die Politik und wird nicht gespeichert.
  Darunter (kleiner, grau) der bestehende Satz: "Der Link ist nur einmal verwendbar. Nach deiner Bestätigung erhältst du zusätzlich eine E-Mail mit deinem dauerhaften Verwaltungslink."
- Copy-Regeln: keine Gedankenstriche (— oder –), Ich-Form/keine "wir", Marke "Brief-nach-Berlin". Andere kinds unverändert lassen.
verify: `cd web && npx jest src/__tests__/campaignCreatorEmail.test.ts`
done: alle bestehenden Tests grün.

## Task 3: Tests
files: web/src/__tests__/campaignCreatorEmail.test.ts, web/src/__tests__/transferCampaignAction.test.ts
action: ergänzen:
- Transfer mit letterCount 1234 → enthält "1.234" und "Stand heute"; mit 0 → kein "Stand heute".
- Transfer mit inviterName "Anna" → enthält "Anna möchte dir die Kampagne übergeben", Anrede "Moin," (nicht "Moin Anna,").
- Enthält "Das bekommst du nicht" und "Das siehst du live".
- Kein "—"/"–" im Transfer-HTML.
- Action-Test: `sendCampaignCreatorEmail` wird mit `letterCount`, `inviterName` und ohne `creatorName` aufgerufen.
verify: `cd web && npx jest src/__tests__/campaignCreatorEmail.test.ts src/__tests__/transferCampaignAction.test.ts && npx tsc --noEmit -p .`
done: Tests + Typecheck grün.

Constraints: keine echte Mail senden, keine Mistral-Calls, keine anderen Dateien anfassen. Untracked `web/*.jsonl`, `.gitignore`-Änderung und `.planning/research/...` NICHT stagen.
