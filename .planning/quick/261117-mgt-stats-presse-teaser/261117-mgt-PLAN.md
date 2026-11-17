# /stats: Navbar, Footer, Presse-Teaser, Zugang per Mail

## Context
/stats liegt außerhalb des `(site)`-Layouts: kein Header, kein Footer, kein Weg zurück. Journalist:innen sehen nur ein nacktes Passwortfeld ("intern", "Demo-Ansicht"). Ziel: Seite wirkt wie Teil von Brief-nach-Berlin, zeigt offen ein paar stolze Zahlen als Teaser und lädt per vorausgefüllter Mail ein, Zugang anzufragen. Passwortschutz bleibt wie er ist (ein Passwort, Env `INTERNAL_STATS_PASSWORD`).

## Entscheidungen (Grilling)
- Header + Footer auf Login **und** Dashboard.
- Info-Box: was (anonyme, zusammengefasste Zahlen), für wen (Presse, Förderer, Partner), wie (Mail). "intern"/"Demo-Ansicht" fällt weg.
- Teaser offen: **Briefe gesamt, Anteil verschickt, Top-3-Themen**. Keine Politik-Antworten (noch nicht aussagekräftig).
- Teaser-Daten live, 24 h gecacht (kein Pflegeaufwand, max. 1 Supabase-Vollabruf/Tag).
- Zugang: Mail-Anfrage, Thomas antwortet mit `/stats/unlock?pw=…` (existiert schon). Kein neuer Auth-Code.
- /presse: Zeile in der Pressekontakt-Box → /stats.

## Umsetzung
1. **`web/src/app/stats/layout.tsx`** (neu): wie `app/(site)/layout.tsx` (AppHeader + main + Footer, bg-creme). URL bleibt `/stats`, gilt auch für `/stats/meilenstein/*` (prüfen, ob dort ok).
   - Dashboard: `<main className="min-h-screen ...">` in page.tsx auf normales Element umstellen, damit kein doppeltes `main`/Vollhöhe.
   - `SectionNav` hat schon `stickyBelow`; auf `[data-app-header]` setzen, damit es unter dem sticky AppHeader klebt.
2. **Teaser-Daten** `web/src/lib/internalStats/publicTeaser.ts` (neu): `unstable_cache` (Muster aus `lib/counter.ts`, revalidate 86400) um `getInternalStats()`; liefert nur `{ letterCount, sentShare, topTopics[3], fetchedAt }`. Kleine Basis (`isSmallBasis`/`SHARE_PERCENT_MIN_BASE`) → Anteil ausblenden. Fehler → Teaser weg, Login bleibt.
3. **`StatsLogin`** in `app/stats/page.tsx` umbauen (via /frontend-design, Brand-Look airmail/paper/green):
   - Kopf "Zahlen zu Brief-nach-Berlin", Info-Box (3 Sätze, ich-Form, keine Gedankenstriche).
   - 3 Teaser-Kacheln (Briefe, verschickt %, Top-Themen mit `topicCategoryLabel`), Stand-Datum.
   - CTA "Zugang anfragen" (Mail) + darunter das bestehende Passwortformular ("Sie haben schon ein Passwort?").
4. **Mail-Button**: `PressContactButton` um optionale Props `subject`, `body`, `label` erweitern (kein zweiter Button). Betreff "Presseanfrage: Zugang Statistik", Text "Hallo Thomas, ich schreibe für [Medium] über … und hätte gern Zugang zur Statistik."
5. **/presse** (`app/(site)/presse/page.tsx`, Pressekontakt-Box): Zeile "Aktuelle Zahlen zu Briefen und Themen →" Link `/stats`.
6. Metadata /stats: weiter `noindex` prüfen (soll nicht in Google, Presse kommt über /presse).

## Verifikation
- `cd web && npx jest` (ggf. kleiner Test für publicTeaser-Mapping als `.test.ts`, Supabase gemockt), `npm run lint`, `npm run build`.
- Preview: /stats ausgeloggt → Header, Footer, Teaser, Mail-Link mit Betreff/Text; mobil 375px. Einloggen → Dashboard mit Header, SectionNav klebt unter Header. /presse → Link sichtbar.
- Screenshots als Beleg. Kein Push ohne OK.
