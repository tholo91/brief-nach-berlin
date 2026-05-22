---
quick_id: 260522-u2u
slug: stimmen-polish-reviews-filter-ab-2026-05
description: /stimmen Polish - Reviews-Filter ab 2026-05-21, Karten uniform, Copy/Captions
date: 2026-05-22
status: complete
tasks_total: 3
tasks_completed: 3
commits:
  - 79001e1
  - 5c2a9d9
  - b628913
---

# /stimmen Polish

Drei kleine, voneinander unabhängige Verbesserungen an der /stimmen-Seite. Ein Plan, drei atomic commits, in dieser Reihenfolge.

## Was wurde gemacht

### 1. Reviews-Cutoff einbauen (`79001e1`)

Reviews und Aggregat-Stats werden ab jetzt nach Datum gefiltert. Alles vor dem 21. Mai 2026 fällt raus.

**Warum:** Der Prompt-Rewrite landete am 20./21. Mai (Commits `c9b09dc`, `26abb48`, `6b5a411`). Bewertungen davor sind stale signal für das aktuelle Produkt - sie beziehen sich auf einen Brief, den es so nicht mehr gibt. Die Backlog-Campaign-Reviews vom 22. Mai zur 2-Sterne- und 3-Sterne-Range gehören zur alten Welt und sollten weder in der Marquee noch in der `RatingStat`-Anzeige auftauchen.

**Wie:**
- Neue konstante `MIN_PUBLIC_REVIEW_DATE = "2026-05-21T00:00:00Z"` exportiert aus `web/src/lib/reviews/types.ts` (kein neues Modul nötig).
- `getPublicReviews.ts` ergänzt die Supabase-Query um `.gte("created_at", MIN_PUBLIC_REVIEW_DATE)` vor `.order("created_at", { ascending: false })`.
- `getReviewStats.ts` gleicher Filter vor `.select("rating", ...)`.

**Wirkung:** Die `RatingStat`-Komponente im Hero und die `ReviewMarquee` zeigen jetzt nur noch das Cohort ab 21. Mai. Stats und Marquee laufen synchron.

### 2. Review-Karten uniform (`5c2a9d9`)

Die Resting-State-Karten haben jetzt feste Maße: `w-[340px]` und `min-h-[240px]`.

**Warum:** Vorher hatten die Karten `min-w-[320px] max-w-[360px]` und keine Mindesthöhe - sie sahen im Marquee ungleich gross und ungleich hoch aus, je nachdem wie lang der Body-Text war. `flex-1` + `line-clamp-4` blieben drin, sodass der Body in der Karte gleichmässig läuft.

**Wirkung:** Im Marquee ist jetzt ein einheitlicher visueller Takt da. Expanded-State (`min-w-[360px] max-w-[440px]` + `scale-[1.03]`) bleibt komplett wie er war.

### 3. Copy und Captions auf /stimmen (`b628913`)

Drei textliche Ergänzungen rund um Bilder und die "Wo das hier herkommt"-Section:

**A. Caption unter der Deutschland-Illustration (Hero/Section 2):**
> Aus jedem Postleitzahlgebiet ein Brief, jeder mit einem anderen Anliegen.

Klein, handgeschrieben, italic, dezent `text-warmgrau/70`.

**B. Figcaption am Tisch-Figure (Section 5):**
> Über 300 Briefe seit April 2026. Hier liegen einige davon, kurz bevor sie in die Post gingen.

Über den bestehenden `caption`-Prop von `Figure.tsx`.

**C. Neuer Absatz in "Wo das hier herkommt":**
Konkrete Beispiele für Prompt-Änderungen, die aus Nutzer-Feedback entstanden sind:
- Komplexitäts-Floskel raus, durch positive Anti-Halluzinations-Regel ersetzt
- Wiederholungs-Fix nach Rückmeldung über doppelte Sätze
- Längen-Korridor-Lockerung auf plus minus fünfzehn Prozent
- Vorgefertigte Feedback-Chips für negative Hinweise

72 Wörter, "wir"-Stimme, keine Marketing-Floskeln, keine em dashes.

## Verifikation

- `npx tsc --noEmit` exits clean nach jedem commit (vom Executor in der Worktree gelaufen)
- `grep -n "—"` auf allen vier edited Files: keine em dashes
- Drei separate atomic commits, jeder Files-only (keine docs mit reingeworfen)
- Worktree-Branch sauber zurück in main gemerged (`f13ff1d`)

## Abweichungen

Keine. Plan-Konvention war minimal vom Plan abgewichen: konstante landete in `types.ts` statt in neuem `constants.ts` - das war im Plan als Option offen. Eine Datei weniger, ein Import-Pfad weniger.

## Recovery-Hinweis

`SUMMARY.md` ist hier vom Orchestrator rekonstruiert. Der Executor hatte ihn in der Worktree erstellt, aber beim `git worktree remove -f -f` ging er verloren bevor der Safety-Net-Schritt aus quick.md greifen konnte. Inhalt deckt sich mit dem Executor-Report (drei Commit-Hashes, drei Tasks, dieselben Files).
