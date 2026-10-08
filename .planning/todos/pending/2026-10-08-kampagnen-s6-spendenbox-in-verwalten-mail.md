---
created: 2026-10-08T13:36:32.000Z
title: "Kampagnen S6: Spendenbox in der Verwalten-Mail für Kampagnen-Ersteller"
area: api
severity: minor
files:
  - web/src/lib/email/buildEmailHtml.ts:78-98,686-691
  - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
  - web/src/lib/email/sendCampaignCreatorEmail.ts:33
  - web/src/lib/support-content.ts
---

## Problem

Teil von "Kampagnen 2.0" (S6, unabhängig, kann sofort). Kampagnen-Ersteller erfahren nirgends, dass Thomas die Infrastruktur bezahlt, die mit großen Kampagnen teurer wird: Feedback-Datenbank, Brevo-Mailversand, Hosting. Nicht jede Kampagne endet, deshalb reicht die Danke-Mail (S4) allein nicht. Die Mail mit dem Verwalten-Link heben Ersteller auf und öffnen sie immer wieder, also gehört der Hinweis dort hinein.

## Solution

1. `buildFinancingNoticeHtml` aus `buildEmailHtml.ts:78` in ein geteiltes Modul ziehen (z.B. `web/src/lib/email/financingNotice.ts`). Copy wird als Parameter übergeben. Die Brief-Mail nutzt es mit der bisherigen Copy, ihr HTML bleibt unverändert.
2. Neue Copy-Konstante für Kampagnen-Ersteller in `support-content.ts` neben `SUPPORT_EMAIL_COPY` (de, en falls die Ersteller-Mail Locales kennt): Heading, Body (wofür die Kosten anfallen, klar freiwillig, "völlig ok, wenn du nicht spenden kannst oder willst"), Button zu WE AID, Info-Button, Status-Zeile. Keine Gedankenstriche, Check gegen signs-of-ai-writing.
3. Box in `buildCampaignCreatorEmailHtml.ts` einbauen (unter dem Verwalten-Button), plus eine Zeile in der Text-Version.
4. S3 nutzt dieselbe Copy-Konstante für die Karte auf der Verwalten-Seite, damit Mail und Seite gleich sprechen.

Check: Jest-Test, dass die Brief-Mail unverändert ist (bestehende Snapshot-/String-Tests grün) und die Ersteller-Mail Box + WE-AID-Link enthält. HTML lokal als Preview rendern, Screenshot. Kein Versand.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-s6-spendenbox-in-verwalten-mail.md` um. Plan-Kontext: `/Users/thomas/.claude/plans/ok-ich-will-mit-hashed-reddy.md`.
