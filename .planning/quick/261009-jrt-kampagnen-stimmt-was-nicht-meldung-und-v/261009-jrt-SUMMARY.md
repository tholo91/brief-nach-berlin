---
phase: quick-261009-jrt
plan: 01
subsystem: kampagnen
tags: [dsa-art-16, report-form, brevo, server-action, native-dialog]
requires: []
provides:
  - "reportCampaignAction: Meldeweg 'Stimmt was nicht?' mit Mail an Ersteller (BCC Thomas)"
  - "CampaignReportDialog auf Kampagnenseiten"
key-files:
  created:
    - web/src/lib/campaigns/reportOptions.ts
    - web/src/lib/actions/reportCampaign.ts
    - web/src/lib/email/sendCampaignReportEmails.ts
    - web/src/components/campaigns/CampaignReportDialog.tsx
    - web/src/__tests__/reportCampaign.test.ts
  modified:
    - web/src/lib/rateLimit.ts
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
    - web/src/lib/email/sendCampaignCreatorEmail.ts
    - web/src/components/campaigns/CampaignHero.tsx
    - web/src/components/campaigns/CampaignEndedView.tsx
    - web/src/components/campaigns/CreatorCampaignForm.tsx
    - "web/src/app/(site)/nutzungsbedingungen/page.tsx"
    - web/src/__tests__/campaignHero.test.ts
    - web/src/__tests__/campaignHeroFixedRecipient.test.ts
    - web/src/__tests__/campaignPage.test.ts
decisions:
  - "Keine DB-Schreibzugriffe, keine neuen Pakete; replyTo ist FOUNDER_EMAIL, nie THOMAS_MAIL"
  - "Report-Zeile in CampaignEndedView nur bei status active"
metrics:
  tasks: 3
status: complete
commits: 3
plan_head_before: 5d9b8a2029c2431d62080c046d667958d82b6f0d
plan_head_after: 45183ac
actuals:
  tasks: 3
  commits: 3
---

# Quick 261009-jrt: "Stimmt was nicht?"-Meldung und Verantwortungstext

Meldeweg nach DSA Art. 16 auf jeder aktiven Kampagnenseite: kleiner gedaempfter Text-Button ganz unten in "Warum Briefkampagne?" oeffnet einen nativen Dialog. Die Meldung geht per Brevo an den Ersteller (BCC THOMAS_MAIL), die Melder-Mail nur an Thomas, nichts wird gespeichert.

## Commits

| Task | Commit | Inhalt |
|------|--------|--------|
| 1 (tracer) | 6fafb54 | Action, Optionen, Rate-Limit, Report-Mail-Typ, Admin- und Eingangsmail, Jest-Test (Brevo gemockt) |
| 2 | bf91b67 | CampaignReportDialog, Einbau in CampaignHero und aktive CampaignEndedView, Testanpassungen |
| 3 | 45183ac | Verantwortungstext im Erstellformular, Nutzungsbedingungen (D-09 a-d) |

## Verification

- `npx jest reportCampaign campaignCreatorEmail transferCampaignAction`: 43 passed (Tracer-Gate, Task 1).
- `npx jest campaignHero campaignHeroFixedRecipient campaignPage reportCampaign`: 36 passed.
- `npm run test` (volle Suite): 107 Suites, 899 Tests passed.
- `npm run lint`: 0 Errors, 7 Warnings (alle vorbestehend, keine in neuen Dateien).
- `npx tsc --noEmit`: keine Fehler in neuen oder geaenderten Dateien. Verbleibende Fehler nur in iCloud-Duplikaten (" 2.ts/.tsx", `.next/dev/types/* 3.ts`) und `src/__tests__/campaignTopicReset.test.ts` (unveraendert, vorbestehend).
- `npm run build`: FEHLGESCHLAGEN beim Type-Check, nicht wegen dieses Tasks. Turbopack-Compile war erfolgreich ("Compiled successfully"), der Type-Check bricht an `web/src/components/campaigns/CampaignCreatorStats 2.tsx` (iCloud-Duplikat, `liveSinceLabel`). Die Duplikate sollten laut Auftrag nicht angefasst werden. Build ist damit unverifiziert bis die " 2"-Dateien entfernt sind.
- Em-Dash-Check (U+2014) in allen neuen und geaenderten Zeilen: sauber.
- Lokaler Smoke (Playwright mit Google Chrome gegen den bereits laufenden Dev-Server auf :3000, Kampagne `eeg-so-nicht`): leerer Submit zeigt alle 4 deutschen Fehlermeldungen, Fokus landet auf dem ersten Feld (Select "Was stimmt nicht?"), Escape bringt den Fokus zurueck auf "Stimmt was nicht?". Es wurde KEINE gueltige Meldung abgeschickt, kein Brevo-Aufruf.
- Screenshots (Task-Verzeichnis): `smoke-line-mobile-375.png`, `smoke-line-desktop-1280.png`, `smoke-dialog-errors-mobile-375.png`, `smoke-dialog-errors-desktop-1280.png`.

## Frontend-Design

Skill `frontend-design:frontend-design` wurde geladen. Visueller Rahmen war durch D-07 fest vorgegeben (unauffaellige Zeile, kein Hero-Umbau), daher bewusst keine neue Aesthetik: Dialog-Huelle, Farben und Pill-Button uebernehmen die bestehende Waldgruen/Creme-Sprache von `CampaignFixedRecipientBadge`. Trigger: `text-xs text-warmgrau/45`, Unterstreichung nur bei Hover/Fokus, 44px Tap-Target ueber `min-h-11`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bestehende Hero-Tests brachen durch den neuen Dialog**
- **Found during:** Task 2
- **Issue:** Zwei Tests in `campaignHero.test.ts` pruefen "kein `<dialog>`/`aria-haspopup`" fuer den Hero ohne Empfaenger-Daten. Der neue Report-Dialog liegt im selben Markup.
- **Fix:** Die Assertions pruefen jetzt nur den Teil vor "Warum Briefkampagne?".
- **Files modified:** web/src/__tests__/campaignHero.test.ts
- **Commit:** bf91b67

**2. Test-Anpassung Task 1:** Der Plan-Testfall "invalid slug format" nutzt `!!!` statt `../etc`, weil `campaignSlugSchema` normalisiert und `../etc` zu dem gueltigen Slug `etc` wird.

Keine Abweichung beim freigegebenen Wortlaut: Verantwortungstext und Nutzungsbedingungen-Texte exakt wie im Plan. Die Checkliste zu AI-Schreibmustern wurde nicht gesondert geoeffnet, Texte stammen unveraendert aus dem freigegebenen Entwurf.

## Known Stubs

Keine.

## Threat Flags

Keine neue Flaeche ausserhalb des Plan-Threat-Models (neue Server-Action ist dort als T-jrt-01..08 abgedeckt). Logs enthalten nur Praefix und Slug.

## Open Items

1. Datenschutzerklaerung beschreibt die Verarbeitung durch das Meldeformular noch nicht (Melder-Mail optional, Weitergabe der Meldung an Ersteller, Brevo). Nicht im freigegebenen Scope.
2. `npm run build` laeuft erst wieder durch, wenn die iCloud-Duplikate (" 2.tsx"/" 2.ts") aus `web/src` bereinigt sind. Danach Build einmal nachziehen.
3. Anwaltspruefung: Kommentar in der Nutzungsbedingungen-Datei listet gGmbH-Satzung und EuGH C-492/23.
4. `web/src/components/wizard/Step3Success.tsx` und `successPageExperience.test.ts` (andere Session) blieben unberuehrt und uncommittet.

## Self-Check: PASSED

- Neue Dateien vorhanden (reportOptions.ts, reportCampaign.ts, sendCampaignReportEmails.ts, CampaignReportDialog.tsx, reportCampaign.test.ts).
- Commits 6fafb54, bf91b67, 45183ac liegen auf main (`git log`).
