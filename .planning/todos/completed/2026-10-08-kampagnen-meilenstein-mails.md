---
created: 2026-10-08T18:30:00.000Z
title: "Kampagnen: Meilenstein-Mails an Ersteller"
area: api
severity: minor
files:
  - web/src/app/api/generate-letter/route.ts:297-313
  - web/src/lib/counter.ts
  - web/src/lib/campaigns/milestones.ts (neu)
  - web/src/lib/campaigns/tokens.ts
  - web/src/lib/email/sendCampaignCreatorEmail.ts
  - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
  - web/src/lib/actions/pauseCampaign.ts (Muster für neue Action)
  - web/src/components/campaigns/CampaignManager.tsx
  - web/src/components/campaigns/CreatorCampaignForm.tsx
  - web/src/lib/actions/createCampaignDraft.ts
  - web/public/images/email-meilenstein.jpg
  - prompts/meilenstein-mail/assets/vorschau-v4.jpg
  - web/src/lib/support-content.ts
  - web/src/app/(site)/kampagne/[slug]/opengraph-image.tsx (Muster für Teilen-Kachel)
  - prompts/meilenstein-mail/image/001-briefe-in-die-luft.md
---

## Problem

Ersteller erfahren nicht, wenn ihre Kampagne Fahrt aufnimmt. Eine Mail bei 50 oder 1000 Briefen ist ein Erfolgserlebnis und ein guter Anlass, die Kampagne weiter zu teilen. Thomas bekommt jede dieser Mails per BCC und sieht so früh, wann Brevo hochgestuft werden muss (auch wegen der Follow-up-Mails an Schreibende).

## Entscheidungen (mit Thomas, 2026-10-08)

1. Stufen pro Kampagne als `int[]` in Supabase, Default `{50,100,500,1000,2000,5000}`. Thomas kann sie pro Kampagne direkt in Supabase ändern, z. B. `{1000,5000,10000}` für Influencer- oder NGO-Kampagnen. Über der letzten Stufe keine Mails.
2. Genauigkeit egal: Es reicht, wenn die Mail ungefähr beim 1000. Brief rausgeht.
3. Bestand: Kampagnen, die beim Start schon über einer Stufe liegen, bekommen beim nächsten Brief einmal die Mail zur höchsten erreichten Stufe (730 Briefe → einmal „500").
4. Beim Erstellen einer Kampagne ein Schalter „Benachrichtige mich bei 50, 100, 500 … Briefen", Default an.
5. Default an. Abbestellen: Link in der Mail öffnet den Verwaltungszugang, dort ein Schalter „Meilenstein-Mails" an/aus. Kein Ein-Klick-Abbestellen per GET, weil Mail-Scanner Links vorab öffnen.

## Solution

Keine neue Supabase-Function nötig, nur eine Migration mit drei Spalten.

1. **Migration 027:** `campaigns.milestones integer[] not null default '{50,100,500,1000,2000,5000}'`, `campaigns.milestone_notified integer not null default 0`, `campaigns.milestone_mails_enabled boolean not null default true`. Getrennt von `milestones`, damit Aus- und wieder Einschalten die eigenen Stufen nicht verliert.
2. **`web/src/lib/campaigns/milestones.ts`** (server-only):
   - `DEFAULT_CAMPAIGN_MILESTONES = [50, 100, 500, 1000, 2000, 5000]` (nur für Schema/Tests, Quelle der Wahrheit ist die Spalte).
   - Reine Funktion `reachedMilestone(milestones, letterCount, alreadyNotified)`: Array sortieren, ungültige Werte (≤ 0) ignorieren, höchste Stufe ≤ `letterCount` und > `alreadyNotified`, sonst `null`.
   - `claimAndSendCampaignMilestone(slug)`: frisches `letter_count` und `milestones` lesen (Service-Role-Client), Stufe berechnen, dann bedingtes Update als Claim: `update campaigns set milestone_notified = M where id = X and milestone_notified < M and milestone_mails_enabled = true` mit `.select()`. Nur der Request, der die Zeile zurückbekommt, versendet. Danach frischen `manage`-Token mit `createCampaignToken` erzeugen (Tokens sind gehasht, alte Links bleiben gültig) und Mail senden. Fehler loggen, nie werfen.
3. **Aufruf** im bestehenden `after()`-Block von `generate-letter/route.ts`, nur wenn eine Kampagne im Spiel ist und `letterNumber` gesetzt ist. Nur aktive, nicht beendete Kampagnen (`isCampaignEnded` aus `endDate.ts`).
4. **Mail-Typ `milestone`** in `buildCampaignCreatorEmailHtml` / `sendCampaignCreatorEmail`, im bestehenden Ersteller-Design (Luftpost-Streifen, Georgia, Waldgrün). `adminCopy: true` für BCC an `THOMAS_MAIL`. Aufbau und Copy siehe „Design" unten.
5. **Erstellen:** Schalter „Meilenstein-Mails" in `web/src/components/campaigns/CreatorCampaignForm.tsx`, Default an, durchreichen über `createCampaignDraft.ts` nach `milestone_mails_enabled`.
6. **Verwalten:** Schalter „Meilenstein-Mails" in `CampaignManager.tsx`, neue Server Action `setMilestoneMailsAction` nach dem Muster von `pauseCampaign.ts` (`getCampaignManagementSession`, Abgleich `creatorEmail`).
7. **Kopfbild mit Zahl, serverseitig erzeugt:** neue `next/og`-Route nach dem Muster von `web/src/app/(site)/kampagne/[slug]/opengraph-image.tsx`, z. B. `/kampagne/[slug]/meilenstein/[stufe]/bild`. Hintergrund `web/public/images/email-meilenstein.jpg` (1200×805, Fade schon eingebacken: unten 50 % Deckkraft, nach oben auf 0, Seiten weich). Darüber zentriert: „BRIEF-NACH-BERLIN · MEILENSTEIN" (Courier Bold, gesperrt, #2D6A4F), Zahl groß (Georgia Bold, ca. 200 px bei 1200 Breite, #1B4332), darunter einzeilig „Briefe für „<Titel>"" (Georgia ca. 50 px), weicher weißer Schein hinter dem Text. Text endet oberhalb der Reichstagskuppel (ca. y 330). Zu lange Titel mit „…" kürzen. Text muss ins Bild, weil Outlook Text über Hintergrundbildern nicht zuverlässig zeigt. `alt` = „500 Briefe für „<Titel>"".
8. **Teilen-Kachel:** dieselbe Route mit `format=post` (4:5) und `format=story` (9:16) als Download hinter „Bild speichern". Braucht eigene Hochformat-Hintergründe (Prompts Format B/C in `prompts/meilenstein-mail/image/001-briefe-in-die-luft.md`), das 1264×848-Original reicht dafür nicht. In der Kachel zusätzlich `brief-nach-berlin.de/kampagne/<slug>` als Verweis auf uns. Bis die Hochformate da sind: Querformat als Download.
9. Copy vor Umsetzung nicht neu erfinden, sondern die freigegebene aus „Design" übernehmen. Kein echter Versand ohne explizite Freigabe.

## Design (mit Thomas abgestimmt, 2026-10-08)

Referenz: `prompts/meilenstein-mail/assets/vorschau-v4.jpg` (50 und 500 Briefe, Desktop und Handy).

1. Reihenfolge: Luftpost-Streifen, Kopfbild mit Zahl, Text, Box „Fortschritt teilen", ab 500 Spendenbox, Buttons, Streifen, Footer.
2. Copy:
   > Moin {Name},
   >
   > {n} Briefe und kein Ende in Sicht. So viele Menschen haben die Argumente deiner Kampagne aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben.
   >
   > Wenn du magst, teil deinen Fortschritt auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.

   „die Argumente deiner Kampagne" passt für Einzelpersonen und NGOs, kein du/ihr-Schalter nötig. Ohne Namen: „Moin,".
3. Box „Fortschritt teilen": Hauptbutton „Bild speichern" mit weißem Download-Icon (neues `web/public/images/icon-download.png`, PNG, kein SVG wegen Outlook). Darunter WhatsApp, Telegram, LinkedIn, E-Mail wie im bestehenden Teilen-Block, Text über `buildShareTarget` mit Meilenstein-Variante, z. B. „Schon 500 Briefe für „<Titel>". Schreibst du auch einen?".
4. **Alle Icon-Buttons am Handy gleich hoch** (feste Höhe ca. 48 px). Der LinkedIn-Badge („in"-Span) hat heute keine `bnb-share-icon`-Klasse und ist am Handy niedriger. Der Fehler steckt auch im bestehenden `shareBlock` von `buildCampaignCreatorEmailHtml.ts`, dort mit beheben.
5. Spendenbox (`buildFinancingNoticeHtml` mit `SUPPORT_CAMPAIGN_CREATOR_COPY`) **erst ab Stufe ≥ 500**, Überschrift für diese Mail „Schön, dass deine Kampagne so wächst 🥳" (neue Copy-Variante in `support-content.ts`, Body unverändert). Darunter zwei Buttons „✎ Kampagne verwalten" · „Thomas schreiben".
6. Unter 500: keine Spendenbox, stattdessen drei Buttons „✎ Verwalten" · „♥ Unterstützen" (→ `DONATION_PROVIDER_URL`) · „Thomas schreiben". Am Handy untereinander.
7. Footer: „Brief-nach-Berlin · Meilenstein-Mail"; „Du bekommst diese Mail bei {Stufen der Kampagne}. Diese Mails abbestellen" (→ Verwalten-Link); „Kampagnenseite · Impressum · Datenschutz · Feedback"; darunter `buildSocialFollowHtml()` (Instagram/LinkedIn von Thomas). Impressum-Link fehlt in allen bisherigen Mails, separat nachziehen.

Check: Jest für `reachedMilestone` (Default-Stufen: 49 → null, 50 → 50, 730 bei 0 → 500, 730 bei 500 → null, 6000 bei 0 → 5000 und danach null; eigene Stufen `{1000,5000}`: 730 → null, 1000 → 1000; leeres Array → null; unsortiertes Array), Claim-Idempotenz mit gemocktem Client (zweiter Claim versendet nicht), abgeschaltete Mails versenden nicht. Mail-HTML für 50 und 500 als Preview rendern und mit `vorschau-v4.jpg` vergleichen (Desktop + 375 px). `npm run test`, `npm run lint`, `npm run build`. Live erst nach Migration 027 in Supabase.

Offen: Hochformat-Bilder (4:5, 9:16) für die Teilen-Kachel. Am Handy ist der Titel im Bild klein (ca. 10 px), beim Bauen prüfen, ob die Zahl allein reicht. Caption-Text mit Verweis auf @-Handle (aktuell nur `FOUNDER_INSTAGRAM`, kein Marken-Account). Ob die Stufen-Mail später Abschickquote und Bewertung aus S3 zeigt, sobald S3 gemerged ist.

## Startprompt für neuen Chat

`/gsd-quick` Setze `.planning/todos/pending/2026-10-08-kampagnen-meilenstein-mails.md` um. Design und Copy sind abgestimmt (siehe Abschnitt Design), Ergebnis als Preview zeigen, kein Versand.
