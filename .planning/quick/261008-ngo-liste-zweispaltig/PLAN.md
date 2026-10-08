# NGO-Briefkampagne: alle aktiven Kampagnen in kompakter Liste, zweispaltig

## Context
`/ngo-briefkampagne` zeigt nur 5 Kampagnen (`getRecentActiveCampaigns(6)`, intern auf 6 gedeckelt). Laut Supabase (08.10.2026) laufen 10 öffentliche Kampagnen (ohne Sonderkampagne „Schreib Merz“). Unsichtbar sind z. B. „AfD vor Gericht“ (496 Briefe), GFF, Greenpeace, IFG, Save Social. Thomas will die bestehende Listenansicht behalten (keine großen Cards), nur zweispaltig, alle aktiven, Seite nicht überladen. Gruppierung nach Thema jetzt nicht (7 von 11 Kampagnen ohne Themendaten, zu wenige Kampagnen).

## Änderungen
1. **`web/src/lib/campaigns/repository.ts`**: neue Funktion `getRunningCampaigns(limit = 24)`, gleicher Filter wie `getRecentActiveCampaigns` (status `active`, moderation `approved`, `runningCampaignFilter()`, gleiche Sortierung), Cap 24. `getRecentActiveCampaigns` bleibt unverändert (genutzt von `kampagne/[slug]`, `CampaignEndedView`, `CampaignNotFound`).
2. **`web/src/components/campaigns/CampaignList.tsx`**: optionale Prop `columns?: 1 | 2` (Default 1, alle bisherigen Aufrufer unverändert). Bei 2: `sm:grid-cols-2` auf dem `<ol>`; Titel dann `line-clamp-2` statt `truncate`, damit lange Titel („Ehrensache Erbschaftsteuer: …“) in der schmaleren Spalte lesbar bleiben; „Öffnen“-Label in der 2-Spalten-Variante ausblenden, um Platz zu sparen. Kartenhöhe/Padding bleiben wie heute.
3. **`web/src/app/(site)/ngo-briefkampagne/page.tsx`**:
   - `getRunningCampaigns()` statt `getRecentActiveCampaigns(6)`, Sonderkampagne weiter per `SPECIAL_CAMPAIGN_SLUG` filtern, kein `.slice(0, 5)`.
   - Kampagnen-Section breiter als der Textblock (`max-w-5xl` statt `max-w-3xl`), damit zwei Spalten Luft haben; Rest der Seite bleibt `max-w-3xl`.
   - `<CampaignList columns={2} … />`.
   - Optional, klein (nur wenn es nicht überlädt): eine Zeile unter „Aktuell aktiv“ mit Live-Zahlen, z. B. „10 Kampagnen · 1.720 Briefe“, berechnet aus den geladenen Kampagnen.
   - `MODIFIED` auf 2026-10-08 lassen bzw. aktualisieren.
4. Todo anlegen: „Kampagnen nach Thema gruppieren ab ~20 laufenden + Topic-Backfill für Altkampagnen“.

Nicht Teil dieser Änderung: Bild zurück, Schritt-Karten, Logo-Reihe, „Was ihr bekommt“-Block (separat entscheiden).

Workflow: `/gsd:quick`, UI-Detail über `frontend-design`. Copy ohne Gedankenstriche.

## Verifikation
- `npm run lint`, `npm run test` (insb. `campaignList.test.ts`, `campaignPage.test.ts`), Test ergänzen für `columns={2}`-Rendering falls `campaignList.test.ts` das Muster hergibt.
- `preview_start` Dev-Server, `/ngo-briefkampagne`: alle 10 aktiven Kampagnen sichtbar, 2 Spalten ab `sm`, 1 Spalte mobil (375px) ohne horizontales Scrollen, lange Titel zweizeilig statt abgeschnitten, Kampagnenseiten-Listen (Ende/NotFound) unverändert. Screenshots desktop + mobil.
- Live erst nach Deploy prüfen.
