# Feature: Kuratierte Kampagnen auf der Startseite („Andere schreiben gerade zu …")

> Stand: 19.09.2026 | Status: **Planungsdokument — noch nicht umgesetzt**
> Erstellt aus einem UX-Entscheidungsworkshop (Thomas + Agent). Dieser Plan ist dafür gedacht, von einem Coding-Agenten umgesetzt zu werden. Der Agent soll gemäß `web/AGENTS.md` vorgehen (insb. Next.js-16-Hinweise lesen, `npm run lint` / `npm run test` / `npm run build` nach Risiko ausführen).

---

## 1. Zielbild

Auf der Startseite (`web/src/app/page.tsx`) erscheint zwischen dem Review-Band (Rezensionen/Presse nach dem Hero) und der Sektion „So einfach geht's" eine **schmale, kuratierte Reihe kampagnenartiger Mini-Karten**.

- Menschen mit ähnlichem Anliegen sehen sofort, dass es zu ihrem Thema schon eine laufende Briefkampagne gibt, und können direkt draufklicken.
- Design wird **nicht großartig verändert**: Die Startseite bleibt slim und direkt. Es kommt eine einzelne, kompakte Kartenreihe hinzu, keine Marketing-Sektion.
- Klick führt auf die **öffentliche Kampagnen-Seite** `/kampagne/[slug]` (Entscheidung aus Workshop: kein direkter Sprung in den Brief-Flow).

## 2. Getroffene Entscheidungen (aus dem Workshop)

| Entscheidung | Ergebnis |
|---|---|
| Bedeutung „populär" | **Kuratiert von Thomas** — kein Algorithmus, keine letter_count-Sortierung |
| Kuratier-Mechanik | **Boolean-Flag `featured` auf `campaigns`**; Thomas setzt es in **Supabase Studio** (Muster: `015_campaign_manual_approval.sql` / `hero_featured` auf `reviews`) |
| Klick-Verhalten | Erst **Kampagnen-Seite** (`/kampagne/[slug]`) |
| Ortsbezug | Ohne Filter — allen Besucher:innen zeigen, PLZ spielt keine Rolle |
| Formfaktor | **Mini-Karten nach dem Hero**, responsive 3 / 4 / 5 sichtbar (mobil / Tablet / Desktop) |
| Titelzeile | **„Andere schreiben gerade zu …"** |
| Karteninhalt | Rundes kleines Bild (Logo), Kampagnen-Titel, Person/NGO (`creatorName`), optional kurze Anliegen-Beschreibung |
| Sortierung | **Aktuellste zuerst** unter den featured (`activated_at` DESC, Fallback `created_at` DESC) |

**Ausdrücklich NICHT Teil dieses Plans:**
- Kein „featured"-Toggle im Creator-Manager-Portal (`CampaignManager.tsx`). Grund: Das Portal ist creator-gebunden (Token-Link), ein dortiger Toggle würde Selbst-Promotion auf der Startseite erlauben und die Kuratierung aushebeln.
- Kein PLZ-/Wahlkreis-Filtering, keine Distance-/Level-Logik.
- Keine Änderung an `CampaignList`, `CampaignHero` oder dem Wizard.

---

## 3. Betroffene Dateien (Überblick)

| # | Datei | Aktion |
|---|---|---|
| 1 | `web/supabase/migrations/022_campaign_featured.sql` | **neu** — Spalte + Index |
| 2 | `web/src/lib/campaigns/schema.ts` | `Campaign`-Typ um `featured: boolean` erweitern |
| 3 | `web/src/lib/campaigns/repository.ts` | Row-Mapping + neue Query `getFeaturedCampaigns` |
| 4 | `web/src/lib/i18n/uiCatalog.ts` | Copy-Sektion `landingCampaigns` (de/en/tr) |
| 5 | `web/src/components/campaigns/LandingCampaigns.tsx` | **neu** — Client-Komponente mit den Karten |
| 6 | `web/src/app/page.tsx` | Daten laden + Sektion einfügen |
| 7 | `web/src/__tests__/campaignPage.test.ts` (+ ggf. neuer Test) | Testdaten `featured` ergänzen, Rendering testen |

---

## 4. Umsetzungsschritte im Detail

### 4.1 Migration: `web/supabase/migrations/022_campaign_featured.sql`

Stil wie `021_letter_signals_bundeskanzler.sql`: Header-Kommentar mit „Lokal vorbereitete Migration. Vor dem Livegang separat in Supabase anwenden und den Remote-Migrationsstand unabhaengig verifizieren." Idempotent (`IF NOT EXISTS`).

```sql
-- 022: Kampagnen fuer die Startseite sichtbar machen (kuratiert von Thomas).
-- Spalte 'featured' ist ein Boolean. Wer featured ist, koennen die aktuellsten
-- aktiven + freigegebenen Kampagnen auf der Startseite erscheinen.
-- Lokal vorbereitete Migration. Vor dem Livegang separat in Supabase anwenden
-- und den Remote-Migrationsstand unabhaengig verifizieren.
--
-- Studio release command (wie bei approve_campaign in Migration 015):
--   update public.campaigns set featured = true  where slug = '<slug>';
--   update public.campaigns set featured = false where slug = '<slug>';
--   -- Alternativ mit verifizierender Ausgabe:
--   select slug, title, featured from public.campaigns where featured = true;

alter table public.campaigns
  add column if not exists featured boolean not null default false;

create index if not exists campaigns_featured_active_idx
  on public.campaigns (activated_at desc)
  where featured = true and status = 'active' and moderation_status = 'approved';
```

Hinweis für Thomas: Die Migration **ist** die Quelle der Wahrheit; remote in Supabase Studio anwenden. Lokaler Migrationsstand ≠ Remote-Zustand (siehe `web/AGENTS.md`).

### 4.2 `web/src/lib/campaigns/schema.ts`

`Campaign`-Typ (ab Zeile 209) um ein Feld erweitern:

```ts
letterCount: number;
featured: boolean;   // NEU
createdAt: string;
```

Nicht in `createCampaignSchema` / `updateCampaignPublicFieldsSchema` aufnehmen — Creators dürfen das Feld nicht setzen (Kuratierung bleibt bei Thomas).

### 4.3 `web/src/lib/campaigns/repository.ts`

1. `CampaignRow` (Zeile 19 ff.) um `featured: boolean;` ergänzen (kommt via `.select("*")` automatisch mit).
2. `mapCampaign` (Zeile 92 ff.) ergänzen: `featured: row.featured,`.
3. Neue Funktion nach `getRecentActiveCampaigns` (Zeile 300 ff.), als Vorbild exakt dieser Funktion:

```ts
export async function getFeaturedCampaigns(
  limit = 5,
  db?: RepositoryClient
): Promise<Campaign[]> {
  const cappedLimit = Math.min(Math.max(limit, 1), 6);
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .eq("featured", true)
    .order("activated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (error) {
    throw new CampaignRepositoryError(
      `Featured campaign lookup failed: ${error.message}`
    );
  }
  return (data as CampaignRow[]).map(mapCampaign);
}
```

### 4.4 `web/src/lib/i18n/uiCatalog.ts`

1. Interface `UiCatalog` um Sektion ergänzen (nach `status`, vor Interface-Ende):

```ts
landingCampaigns: {
  title: string;
};
```

2. Werte in allen drei Locales (an `hero`-Stil angelehnt, per Du, kein Marketing-Ton):

- de: `title: "Andere schreiben gerade zu …"`
- en: `title: "Others are writing about right now …"`
- tr: `title: "Başkaları şu anda yazıyor …"`

### 4.5 Neue Komponente `web/src/components/campaigns/LandingCampaigns.tsx`

**Client-Komponente** (`"use client"`), damit `useUiCopy()` für die Titelzeile funktioniert (Muster: `Hero.tsx`, `ReviewMarquee`).

**Props:**
```ts
type LandingCampaignsProps = {
  campaigns: Campaign[];
};
```

**Verhalten:**
- `campaigns.length === 0` → `null` rendern (Sektion fällt komplett weg).
- Maximal **5** Karten verwenden (Server liefert limit 5).

**Struktur:**

```tsx
import Link from "next/link";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { CampaignLogo } from "./CampaignLogo";
import type { Campaign } from "@/lib/campaigns/schema";
```

- Wrapper: `<section className="mx-auto max-w-6xl px-6 pt-12 md:pt-16">` (als Puffer nach dem Review-Band; Review-Band hat `pb-2` und negative Margins).
- Titelzeile, **exakt** im Stil des Briefe-Zählers in `page.tsx` Zeile 42:
  ```tsx
  <h2 className="mb-4 text-center font-typewriter text-xs sm:text-sm tracking-widest uppercase text-warmgrau/50">
    {copy.landingCampaigns.title}
  </h2>
  ```
- Grid — **eine Einzelreihe, exakt 3/4/5 sichtbar**, keine Zeilenumbrüche:

```tsx
<div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
  {campaigns.slice(0, 5).map((campaign, index) => {
    const hiddenBelowMd = index >= 3 ? "hidden md:block" : "";
    const hiddenBelowLg = index >= 4 ? "hidden lg:block" : "";
    return (
      <Link
        key={campaign.slug}
        href={`/kampagne/${campaign.slug}`}
        className={`group flex flex-col items-center gap-2 rounded-md border border-waldgruen/12 bg-white/55 p-3 text-center transition-colors duration-150 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 focus-visible:ring-offset-creme active:scale-[0.99] ${hiddenBelowMd} ${hiddenBelowLg}`}
      >
        <CampaignLogo
          logoPath={campaign.logoPath}
          name={campaign.creatorName?.trim() || campaign.title}
          size="sm"
        />
        <span className="font-body text-xs font-bold leading-tight text-waldgruen-dark line-clamp-2 text-balance sm:text-sm group-hover:text-waldgruen">
          {campaign.title}
        </span>
        {campaign.creatorName && (
          <span className="w-full truncate font-body text-[10px] font-semibold text-warmgrau/55 sm:text-xs">
            {campaign.creatorName}
          </span>
        )}
      </Link>
    );
  })}
</div>
```

**Detailentscheidungen:**
- `CampaignLogo` rendert bereits **rund** (`rounded-full`), Größe `sm` (48 px).
- Anliegen-Beschreibung (`campaign.description`) **optional** ergänzbar: `hidden md:block line-clamp-2 text-[10px] sm:text-xs font-body text-warmgrau/55` unter dem Titel. Damit bleibt die Karte mobil extrem flach. (Entscheidung: erstmal weglassen, wenn auf Desktop zu voll — Thomas hat „vielleicht das Anliegen schildern" gesagt.)
- Optionaler Social-Proof: kleines „X Briefe" (`campaign.letterCount`) als dritte Zeile, gilt aber als nice-to-have und nicht für v1 nötig.

### 4.6 `web/src/app/page.tsx` — Home einbinden

1. Importe ergänzen:
   ```ts
   import LandingCampaigns from "@/components/campaigns/LandingCampaigns";
   import { getFeaturedCampaigns } from "@/lib/campaigns/repository";
   ```
2. In `Home()` das Laden erweitern (Fehlerfall darf die Startseite nie brechen):
   ```ts
   const [heroReviews, letterCount] = await Promise.all([
     getHeroReviews(),
     getLetterCount(),
   ]);
   const featuredCampaigns = await getFeaturedCampaigns(5).catch(() => []);
   ```
3. Einfügen **zwischen** Review-Band (schließt vor `</section>` Zeile 50) und `<HowItWorksWithExample letterCount={letterCount} />` (Zeile 51):
   ```tsx
   <LandingCampaigns campaigns={featuredCampaigns} />
   ```

Hinweis: `revalidate = 3600` bleibt bestehen — die Sektion aktualisiert sich wie der Briefe-Zähler stündlich. Für schnelles Live-Testen der Auswahl einfach in Studio `featured` umschalten und auf nächsten Revalidate warten (bzw. Dev-Server nutzen).

### 4.7 Tests

1. **`web/src/__tests__/campaignPage.test.ts`**: Das `Campaign`-Testobjekt (Zeile 35 ff.) um `featured: false` ergänzen — sonst TypeScript-Fehler (das Feld wird im Typ jetzt Pflicht).
2. **Neuer Test `web/src/__tests__/landingCampaigns.test.ts`** nach Muster `campaignList.test.ts` (Jest + `renderToStaticMarkup`):
   - leere Liste → rendert `null` (DOCTYPE/leer).
   - Karten verlinken auf `/kampagne/{slug}`.
   - Titelzeile „Andere schreiben gerade zu …" erscheint.
   - Kreator-Name erscheint.
   - 3/4/5-Logik: index 3 hat `hidden md:block`, index 4 hat `hidden lg:block` (per Markup-String prüfen).
3. **Bestandscheck**: `npm run lint`, `npm run test`, `npm run build` in `web/`.

---

## 5. Verifikation (nach Umsetzung)

- [ ] `npm run lint`, `npm run test`, `npm run build` in `web/` grün.
- [ ] Migration in Supabase Studio angewendet; Remote-Status **getrennt verifiziert** (`.eq("featured", true)`-State im Studio prüfen).
- [ ] Dev-Server: 3 aktive, approved Kampagnen auf `featured = true` setzen → Reihe erscheint mit exakt diesen Karten; Klick führt auf `/kampagne/[slug]`.
- [ ] 4. und 5. aktive Kampagne featured → Tablet zeigt 4, Desktop zeigt 5 (eine Reihe, kein Wrap).
- [ ] Kampagne pausieren/archivieren while featured → fällt aus der Reihe (Query filtert aktiv+approved).
- [ ] `featured = false` auf allen → Sektion verschwindet komplett (kein leerer Titelstrich).
- [ ] Mobile (375 px): 3 Karten sichtbar, Karten nicht quetschend; a11y-Fokus-Stile vorhanden.
- [ ] Home revalidate: nach Deploy `revalidate = 3600` beachten (gilt für die neue Sektion genauso).

## 6. Datenschutz-Hinweis

Nur öffentliche Kampagnenfelder (Titel, Logo, creatorName, description, letterCount) werden gerendert — keine Anliegen- oder Besucherdaten. Es entsteht kein neuer Storage- oder Tracking-Flow. Kein DSGVO-Konflikt erkennbar; bei Zweifel gegen `web/docs/compliance/` prüfen.

## 7. Umgebungs-Hinweis für den implementierenden Agenten

- `git fetch` schlug beim Planen mit `fatal: bad object refs/remotes/origin/main` fehl (möglicherweise beschädigtes lokales Pack/Object-Store-Element). Falls git-Kommandos beim Umsetzen auffällig sind: zuerst lokale Git-Integrität prüfen (u.a. mit git-fsck-Skill `fix-git-corruption`), bevor am Code gearbeitet wird.
- `web/AGENTS.md` betont: Nicht auf Memory-Output für Next.js 16 verlassen — bei Route-Handlern/Metadata/Server-Client-Grenzen lokale Docs in `node_modules/next/dist/docs/` lesen.

## 8. Offene Punkte / Follow-ups (nicht blockierend)

- [ ] Entscheiden, ob die Karten zusätzlich die **Anliegen-Beschreibung** (description) zeigen — Desktop-only (`hidden md:block`) vorgeschlagen.
- [ ] Entscheiden, ob ein **Briefe-Zähler** (`X Briefe`) auf den Karten gewünscht ist (Social Proof, vgl. Brand Identity §7).
- [ ] Optional später: Pflege über ein Admin-Surface statt Studio-SQL (erst wenn es ein Admin-Konzept gibt).