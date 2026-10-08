---
created: 2026-10-08T13:36:32.000Z
completed: 2026-10-08T00:00:00.000Z
title: "Kampagnen S2: Ablaufdatum und Beendet-Ansichten"
area: ui
severity: major
files:
  - web/supabase/migrations/026_campaign_ends_at.sql (neu)
  - web/supabase/migrations/009_campaign_letter_count.sql:32-37
  - web/src/lib/campaigns/schema.ts
  - web/src/lib/campaigns/repository.ts:405-446
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/components/campaigns/CampaignManager.tsx:236-300,609-650
  - web/src/components/campaigns/CampaignList.tsx
  - web/src/app/(site)/kampagne/[slug]/page.tsx
  - web/src/app/(site)/[slug]/page.tsx
  - web/src/app/(site)/kampagne/verwalten/page.tsx
  - web/src/app/api/generate-letter/route.ts:295
  - web/src/lib/contact.ts
---

## Problem

Teil von "Kampagnen 2.0" (S2 von 5). Kampagnen haben kein Enddatum. Sie enden nur per Archivieren, und dann sind Seite, geteilte Links und QR-Codes weg. Kampagnen können aber aus vielen Gründen vorbei sein (Gesetz verabschiedet, Initiative will nicht mehr live sein). Besucher sollen dann nicht ins Leere laufen, Ersteller sollen ihren Endstand weiter sehen.

## Solution

Entschieden mit Thomas (Grill-Runden 2026-10-08):

1. **Datenmodell:** Migration `026_campaign_ends_at.sql`: `campaigns.ends_at timestamptz null`. `increment_letter_counters` zählt nach `ends_at` nicht mehr hoch (Endstand eingefroren). Helper `isCampaignEnded(campaign, now)` in `web/src/lib/campaigns/`; Schema + Repository-Mapping erweitern.
2. **Enddatum setzen:** optional, Schnellwahl "Kein Enddatum" (Default) / 2 Wochen / 1 Monat / 3 Monate / eigenes Datum. In `CreatorCampaignForm` und `CampaignManager`. Vor Ablauf frei änderbar oder verlängerbar. Ende = 23:59 Europe/Berlin am gewählten Tag.
3. **"Archivieren" wird "Kampagne jetzt beenden"** (setzt `ends_at = now()`, mit Bestätigung). "Pausieren" bleibt. Status `archived` bleibt intern für Thomas/Moderation.
4. **Listen:** `getLandingCampaigns`, `getRecentActiveCampaigns` und `/kampagne`-Liste blenden beendete Kampagnen aus.
5. **Öffentliche Seite nach Ende** (`kampagne/[slug]` + Root-Alias `[slug]`): Seite bleibt erreichbar. Neutral formuliert: "Diese Kampagne ist seit {Datum} beendet" + "{n} Briefe wurden über diese Kampagne formuliert". Darunter weitere aktive Kampagnen (bestehende `CampaignList`, max. 3) und CTA "Schreib deinen eigenen Brief nach Berlin" → `/app`. Kein Wizard-Einstieg mehr.
6. **Brief-Generierung:** `generate-letter` und Wizard-Handoff behandeln eine beendete Kampagne wie keine Kampagne (normaler Brief, kein Kampagnenzähler).
7. **Ersteller nach Ende** (`/kampagne/verwalten`): Banner "Beendet am {Datum}", Stats bleiben sichtbar, alles read-only (Edit-Actions auch serverseitig ablehnen), Button "Kontakt aufnehmen" als mailto auf `BRIEF_EMAIL` aus `web/src/lib/contact.ts`.

Design: `/frontend-design:frontend-design` + `/design-taste-frontend` laden, `.planning/brand-identity.md` lesen. Copy ohne Gedankenstriche, Check gegen signs-of-ai-writing.

Check: Jest für `isCampaignEnded` (Zeitzone, Grenze 23:59, null = läuft) und Repository-Filter. Browser-Preview: aktive und beendete Kampagne öffentlich + Verwalten, mobil 375px + Desktop, Screenshots. `npm run test`, `npm run lint`, `npm run build`. Migration lokal vs. remote getrennt berichten.

Parallel zu S1 umsetzbar. S3 baut danach auf derselben Verwalten-Seite auf. Danke-Mail zum Ende ist S4, nicht hier.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-s2-ablaufdatum-und-beendet-ansichten.md` um. Plan-Kontext: `/Users/thomas/.claude/plans/ok-ich-will-mit-hashed-reddy.md`.
