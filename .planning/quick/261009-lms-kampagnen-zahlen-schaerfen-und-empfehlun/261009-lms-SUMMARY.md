---
quick_id: 261009-lms
status: complete
commits: 3
plan_head_before: d4eae8d8a828c687b062b15f60fe31b6a4f43e23
plan_head_after: b55f1b654e787e8fd01f76aa91d6dfe8a9f2a1cb
actuals:
  tasks: 4
  commits: 3
---

# Quick 261009-lms: Kampagnen-Zahlen schärfen + Empfehlungs-Ask

Rating-Kachel mit Teilsternen und 3-Kachel-Grid mit Vorher-Kontextzeile, Empfehlungs-Karte statt Spendenkarte auf `/kampagne/verwalten`, Empfehlungszeile in der Meilenstein-Mail.

## Commits
- b473912 feat(kampagne): Rating-Kachel mit Teilsternen, Ohnmacht als Kontextzeile
- ee5981e feat(kampagne): Empfehlungs-Karte statt Spendenkarte auf der Verwalten-Seite
- b55f1b6 feat(kampagne): Empfehlungszeile in der Meilenstein-Mail

## Änderungen
1. `RatingStat.tsx`: `StarBar` exportiert, `size?: "sm" | "lg"` (Default `lg` = bisher). `CampaignCreatorStats.tsx`: Rating-Tile "4,4/5" + kleine Teilsterne (`role="img"`, aria-label "4,4 von 5 Sternen"), `Tile` bekam `extra`-Slot, `unit`-Prop entfernt. Ohnmacht-Kachel entfernt, Grid `lg:grid-cols-3`, Kontextzeile nur bei `powerlessness.status === "shown"`. `creatorStats.ts` unverändert.
2. `CampaignDonationCard` per `git mv` zu `CampaignReferralCard` (id `creator-referral`, Section-Nav hatte keinen Verweis auf `creator-donation`). Neuer Client-Button `CampaignReferralShareButton` (Web Share API, ohne JS/Desktop Mail-Fallback als normaler `<a href=mailto>`). Neuer Helper `buildCampaignStartShare` / `campaignStartUrl` in `lib/share.ts`. "Thomas vorstellen" = mailto mit Betreff "Vorstellung: Kampagne". Spendenlink als kleine Zeile (`_blank`, noopener). Avatar bleibt.
3. `buildMilestoneEmailHtml`: Zeile unter dem Teilen-Block mit Link auf `https://www.brief-nach-berlin.de/kampagne/starten` und mailto "stell mich vor". Erscheint bei allen Meilensteinen.

## Tests
- `campaignCreatorStats.test.ts`: Powerlessness-Assertion angepasst, Rating-Test neu, DonationCard-Block durch ReferralCard-Block ersetzt.
- `campaignMilestoneEmail.test.ts`: neuer Test für Position/Links.
- `npm run test`: 107 Suites, 902 Tests grün. `npm run lint`: 0 Errors, 7 Warnings (alle vorbestehend, keine in geänderten Dateien). `npx tsc --noEmit`: nur vorbestehende Fehler (`src/__tests__/campaignTopicReset.test.ts` TS7022/7024 und iCloud-Duplikate `.next/dev/types/* 3.ts`), keine in geänderten Dateien.
- Mail-Vorschau: `scratchpad/milestone-preview.html`, neue Zeile vorhanden.

## Deviations from Plan
- BRIEF_EMAIL in `lib/contact.ts` ist `Brief-nach-Berlin@posteo.de`, nicht `thomas_lorenz@posteo.de`. Bewusst die bestehende Konstante genutzt (wie "Thomas schreiben" in allen Mails).

## Offen / Hinweise
- `SUPPORT_CAMPAIGN_CREATOR_COPY.manageHeading` in `lib/support-content.ts` ist jetzt ungenutzt (nur die alte Karte nutzte es). Nicht entfernt (Scope).
- Browser-Verifikation (375px, Teilsterne sichtbar, Karte) steht noch aus (Lead).

## Known Stubs
None.

## Self-Check: PASSED
Commits b473912, ee5981e, b55f1b6 vorhanden; geänderte Dateien existieren.
