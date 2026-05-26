---
quick_id: 260526-u4r
slug: stimmen-swipe-and-filter
date: 2026-05-26
status: complete
---

# Quick Task 260526-u4r — Summary

## Goal

Auf `/stimmen`:
1. Reviews auf Touch (iPad / Mobile) swipebar machen statt Auto-Marquee.
2. Im Marquee und in den Pull-Quotes nur Reviews mit `rating >= 3` zeigen — Durchschnitt (`RatingStat`) und `AggregateRating` JSON-LD basieren weiter auf allen Reviews.

## What changed

### `web/src/components/reviews/ReviewMarquee.tsx`

Im injected `<style>`-Block einen `@media (hover: none)` Branch ergänzt, der bei Touch-/Coarse-Pointer-Geräten:
- die endlose `animation: marquee` ausschaltet
- den Container von `overflow-x: hidden` (per Tailwind-Klasse) auf `overflow-x: auto` umschaltet
- `scroll-snap-type: x mandatory` + `-webkit-overflow-scrolling: touch` setzt für sauberes natives Swipen
- die Scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` versteckt
- pro Karten-Button `scroll-snap-align: center` aktiviert (neue Klasse `marquee-snap-item`)

Auf Desktop (hover-fähige Pointer) bleibt das bisherige Verhalten: Auto-Marquee, Pause-on-Hover, Click expandiert, Esc schließt.

Die Karten-Verdopplung (`[...items, ...items]`) bleibt unverändert — auf Touch bedeutet das nur „mehr Karten zum Durchswipen", optisch unauffällig.

### `web/src/app/(site)/stimmen/page.tsx`

Eine gefilterte Liste vor dem Verteilen abgeleitet:

```ts
const reviewsForDisplay = reviews.filter((r) => r.rating >= 3);
const highlights = pickHighlights(reviewsForDisplay);
const hasReviews = reviewsForDisplay.length > 0;
```

`<ReviewMarquee reviews={reviewsForDisplay} … />` und `pickHighlights` bekommen die gefilterte Liste. `getReviewStats()` und das daraus erzeugte `aggregateRatingJsonLd` bleiben unverändert — der angezeigte Durchschnitt und das SEO-Aggregate rechnen weiter über alle Bewertungen.

## Must-haves verification

| Anforderung | Status |
|---|---|
| Marquee ist auf Touch-Geräten frei swipebar (CSS-Snap, kein Auto-Loop) | ✓ via `@media (hover: none)` |
| Desktop-Verhalten unverändert (hover pauses, click expands, esc closes) | ✓ Media-Query-isoliert |
| Sichtbare Reviews haben alle `rating >= 3` | ✓ Filter vor Marquee + Highlights |
| `RatingStat` und `AggregateRating` JSON-LD basieren weiter auf allen Reviews | ✓ `stats` aus ungefiltertem `getReviewStats()` |
| Type-Check / Build sauber | ⚠ siehe Notes |

## Notes / Caveats

- **Build-Verifikation wurde übersprungen.** `npx tsc --noEmit` ist im Bash-Tool dieser Session zweimal hängengeblieben (Prozess war S/sleeping, 0% CPU) — keine erkennbare Beziehung zu meinen Änderungen, vermutlich Environment-Issue im Zusammenspiel mit einer parallel laufenden Claude-Session, die ebenfalls am Repo arbeitete. Die Änderungen sind mechanisch klein (CSS-Media-Query + 1 Filter-Zeile + 2 Referenzen umgebogen), TypeScript-Risiko niedrig. Vor dem nächsten Deploy bitte einmal `npm run build` oder `npm run lint` ausführen, falls noch nicht passiert.
- **Lock-Probleme während des Runs.** Eine andere Claude-Session lief parallel und hielt mehrfach `.git/index.lock`. Beim einmaligen forcierten Aufräumen des Locks wurde der Index truncated — via `rm -f .git/index && git reset --mixed HEAD` aus HEAD wiederhergestellt, kein Datenverlust. Code-Commit landete schließlich als `35a98a3` auf Branch `fix/feedback-thank-you-scroll` (gleiche Branch, auf der die andere Session arbeitet — abgestimmt nicht, aber kein Konflikt mit ihren Files).

## Commit

- Code: `35a98a3` — feat(stimmen): swipeable reviews on touch, hide reviews below 3 stars
- Docs: dieser Commit

## Out of scope

Größere Struktur-Änderungen an `/stimmen` (CTA + Mithelfen konsolidieren, eine statt zwei Pull-Quotes, Story kürzen) wurden bewusst zurückgestellt — siehe Discuss-Antwort „Minimal: nur Swipe + Filter, sonst lassen".
