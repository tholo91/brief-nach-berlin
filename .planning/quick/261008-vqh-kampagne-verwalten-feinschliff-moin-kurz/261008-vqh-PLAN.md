# Kampagne verwalten: Feinschliff (7 Punkte)

## Context
Thomas hat die Verwalten-Seite (`/kampagne/verwalten`) live angeschaut und will sie aufgeräumter und wärmer: Einstellungen weniger prominent, Unterstützen-Karte ohne Zeilenbruch und mit Herz, Quellen-Satz in einer Zeile, Avatar nicht so leer, kürzere vorlesbare Teillinks, persönliche Begrüßung und "Live seit" im Header. Entscheidungen (per Rückfrage geklärt): kurze Links in zwei Zeilen, "Moin {Name} 👋" ersetzt das Eyebrow, Datum im Status-Pill, Emojis statisch.

Ausführung über `/gsd:quick` (Repo-Regel), Frontend-Edits mit `frontend-design`-Skill (Memory-Regel).

## Änderungen

1. **Einstellungen in "Kampagne bearbeiten"** — `src/components/campaigns/CampaignManager.tsx`
   a. Den `{!ended && (...)}`-Block "Einstellungen / Laufzeit und Status" in das `<details>` verschieben, unterhalb von `</form>` (nicht verschachtelt in die Form), mit `border-t` + gleichem Padding (`px-5 pb-5 md:px-7 md:pb-7`). Eyebrow "Einstellungen" entfällt, h2 "Laufzeit und Status" bleibt (als h3).
   b. Summary-Untertitel: "Titel, Anliegen, Empfänger, Bild, Laufzeit und Status" (bei `canEdit`).
   c. Dialoge (Beenden/Übertragen) bleiben außerhalb, unverändert.

2. **Unterstützen-Button in einer Zeile + Herz** — `src/components/campaigns/CampaignDonationCard.tsx`
   a. Button-Container von `grid sm:grid-cols-2 md:max-w-md` auf `flex flex-wrap gap-2`, Buttons `whitespace-nowrap` → ab sm kein Umbruch im Button.
   b. Inline-SVG-Herz (Stil wie `PencilIcon`, `currentColor`, `aria-hidden`) vor "Brief-nach-Berlin unterstützen".

3. **Emojis um den Avatar** — gleiche Datei
   a. 5 statische, leicht gedrehte Emojis (💌 ❤️ 🙏 ✉️ 🌱) absolut um das Avatar-Bild, `aria-hidden`, `pointer-events-none`, nur `md:block` (Desktop), Mobile bleibt wie jetzt.

4. **Quellen-Satz in einer Zeile** — `src/components/campaigns/CampaignCreatorStats.tsx`
   a. `max-w-xl` an beiden `SOURCE_SENTENCE`-Absätzen entfernen, beide `text-xs` → passt auf Desktop in eine Zeile (Card-Innenbreite ~840px), Mobile darf umbrechen.

5. **Kurze Teillinks** — `CampaignManager.tsx`, `CampaignShareCard.tsx`, `CampaignUrlCopyField.tsx`
   a. Live verifiziert: `brief-nach-berlin.de/afd-vor-gericht` → www → Root-`[slug]`-Route → `/kampagne/afd-vor-gericht`; `/afdvorgericht` genauso (308). Root-Route löst nur `status === "active"` auf.
   b. Neue Helper `campaignShortUrl(slug)` in `src/lib/share.ts` = `${APP_URL}/${slug}`.
   c. ShareCard: bei `status === "active"` Zeile 1 = Kurz-URL mit Bindestrichen, Zeile 2 "Kurzlink für Radio und Podcast" = kompakte Kurz-URL. Sonst (pausiert/archiviert) weiter die `/kampagne/`-URL, da die Kurzform dann 404 wäre.
   d. `CampaignUrlCopyField` compact-Variante: Anzeige ohne `https://` und ohne `www.` (`brief-nach-berlin.de/` + fetter Slug); kopiert wird die volle https-URL der angezeigten Form. Die `card`-Variante (Verifizieren-Seite) bleibt unverändert.
   e. QR-Code und "Kampagnenseite ansehen" bleiben auf der direkten `/kampagne/`-URL.

6. **"Moin {Name} 👋" statt "Deine Kampagne"** — `CampaignManagerHeader.tsx`
   a. Neue Prop `creatorName: string | null`; Eyebrow wird `Moin {creatorName} 👋`, ohne Namen `Moin 👋`. Gesetzt in `font-body`, normale Schreibung statt Uppercase-Typewriter ("MOIN" wäre zu laut).

7. **"aktiv seit 14.08.2026" im Status-Pill** — `CampaignManagerHeader.tsx`, `CampaignCreatorStats.tsx`, `src/lib/campaigns/creatorStats.ts`
   a. Neue Prop `liveSinceLabel: string | null`, berechnet in `CampaignManager` aus `campaign.activatedAt` mit dem vorhandenen `dateFormatter` aus `creatorStats.ts` (exportieren statt neu bauen). Pill: "aktiv seit 14.08.2026" nur bei aktiv, sonst Status wie bisher.
   b. "Live seit / Gestartet am" aus der Statistik-Karte und `liveSinceLabel` aus `CampaignCreatorStatsView` entfernen. Folge: bei beendeten Kampagnen steht das Startdatum nicht mehr auf der Seite (nur "Beendet am"). Bewusst in Kauf genommen.

## Tests (anpassen, nicht neu erfinden)
- `src/__tests__/campaignManagerLayout.test.ts`: Reihenfolge jetzt header → share → insights → edit (mit "Laufzeit und Status" innerhalb `<details>`); Header-Tests für "Moin Anna 👋", "Moin 👋", "aktiv seit"; ShareCard-Tests auf Kurz-URL-Anzeige ohne https/www und Fallback auf `/kampagne/` bei inaktiv.
- `src/__tests__/campaignCreatorStats.test.ts`: Live-seit-Erwartungen entfernen.

## Verification
1. `npm run test -- campaignManagerLayout campaignCreatorStats` und `npx tsc --noEmit`, `npm run lint` (aus `web/`).
2. Lokale Seite: `preview_start {name: "web"}`. Zugang ohne Mail-Token: kleines tsx-Skript im Scratchpad, lädt `.env.local`, erzeugt per `createCampaignManagementSessionValue` ein Session-Cookie für eine echte aktive Kampagne (z. B. afd-vor-gericht), Cookie im Browser-Pane setzen, `/kampagne/verwalten` öffnen. Achtung: lokaler Dev hängt an der Prod-DB, daher nur ansehen, keine Buttons (Speichern/Pausieren/Beenden) klicken.
3. Screenshots Desktop (1280) + Mobile (375) an Thomas, **vor** Commit/Push. Erst nach seinem OK: commit auf `main`, push.
