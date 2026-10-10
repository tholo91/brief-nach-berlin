---
quick_id: 261009-urp
status: complete
---

# Summary: Kampagnen-Mail zeigt Briefanzahl ab 25 Briefen

- route.ts berechnet `campaignLetterCount = campaign.letterCount + 1` und gibt es an `prepareLetterEmail`.
- `SendLetterEmailParams.campaignLetterCount` neu, in allen Empfänger-Zweigen durchgereicht.
- `campaignCount()` in de/en/tr, Schwelle `CAMPAIGN_COUNT_MIN = 25` in buildEmailHtml.
- Email-Preview `?campaign=1` zeigt 63 Briefe.

## Verifikation
- emailLocalization.test.ts: 13/13 grün, verwandte Email-/Kampagnen-/generate-letter-Suites: 540/540 grün.
- tsc --noEmit und eslint ohne Befund.
- Preview localhost:3000/api/email-preview?campaign=1 rendert den Satz korrekt.

## Hinweise
- Gleichzeitige Briefe können dieselbe Zahl zeigen (Read vor Increment), bewusst akzeptiert.
- mailLocale.ts, buildEmailHtml.ts und emailLocalization.test.ts enthalten zusätzlich fremde WIP (Quick 261009-psc, mobile Schritte). Nicht committet, um diese nicht mitzunehmen.
