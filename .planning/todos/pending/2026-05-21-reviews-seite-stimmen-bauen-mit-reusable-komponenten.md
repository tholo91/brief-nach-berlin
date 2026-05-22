---
created: 2026-05-21T23:53:18.555Z
title: Reviews-Seite /stimmen bauen mit reusable Komponenten für Landing
area: frontend
files:
  - web/src/app/(site)/ (neue Route: stimmen/)
  - web/src/app/sitemap.ts
  - web/src/components/ (neue Folder: reviews/ oder social-proof/)
  - web/src/lib/reviews/ (neue Helpers)
  - web/supabase/migrations/002_extend_reviews.sql (Referenz, RLS schon gesetzt)
---

## Problem

Wir sammeln seit ein paar Wochen Reviews in Supabase (table `public.reviews`), aber sie liegen ungenutzt rum. Zwei Ziele:

1. **Trust-Aufbau** über eine eigene `/stimmen`-Seite, die den Schnitt zeigt und Reviews schön durchlaufen lässt
2. **Reusable Komponenten** für späteres Recycling auf der Landing (1-2 Quotes + Stat-Pill)

Zusätzlich ist die Seite ein wichtiger Feedback-Funnel: viele User trauen sich nicht zu schreiben, weil sie denken, sie müssten den Brief verschickt haben. Das räumen wir auf der Seite explizit ab.

**Aktueller Stand (Mai 2026):** ~300 Briefe generiert, Follow-up-Mails laufen, Feedback fließt schon in Prompt-Iterationen. Genug Substanz, um eine eigene Seite zu rechtfertigen.

**Verwandt, aber nicht überlappend:**
- `2026-04-18-feedback-letter-quality-collection...` → Collection-Layer (war Voraussetzung, ist umgesetzt)
- `2026-04-28-sherpa-audit-landing-page...` Punkt #8 → Landing-Testimonial-Slot, hängt davon ab, dass diese Seite zuerst existiert

## Solution

### Route
`/stimmen` (deutsch, kurz, passend). Alternativen: `/bewertungen`, `/echo`.

### Page-Struktur (top → bottom)

1. **Hero** — "Stimmen aus dem ganzen Land", Eyebrow "seit April 2026". Subtitle: Feedback macht das Tool laufend besser.
2. **StatStrip** — Schnitt aller Reviews (Service-Role-Aggregat über ALLE rows, nur Zahl raus), Review-Count, optional Brief-Count.
3. **Feedback-CTA WEIT OBEN** — "Auch ohne Brief: schreib uns." Zwei Buttons: `/feedback` und `mailto:`. Klargestellt: Versand nicht nötig, jede Rückmeldung zählt, wir verbessern laufend.
4. **ReviewMarquee** — durchlaufende Karten, nur `consent=true` mit `body IS NOT NULL`, pause-on-hover. **Reusable für Landing.**
5. **Curated Highlights** — 3 ausgewählte 5⭐-Quotes als `<PullQuote />` (existiert in `src/components/editorial/`).
6. **Wo wir herkommen** — max 2 Absätze. Idee Anfang 2026 → 300+ Briefe. Follow-ups laufen. Feedback fließt in jeden Prompt-Zyklus.
7. **FAQ** (5-6 Items, SEO/GEO Pflicht):
   - Was passiert mit meinem Feedback?
   - Werden alle Reviews veröffentlicht? (nur mit Consent)
   - Kann ich Feedback geben, ohne den Brief abzuschicken? (ja)
   - Was wurde dank Feedback konkret verbessert?
   - Wie schreibe ich euch direkt?
   - Wie geht ihr mit kritischen Stimmen um?
8. **Final-CTA** — "Schreib uns. Auch wenn du nichts schickst."

### Reusable Komponenten
- `<ReviewMarquee limit variant="full|compact" />` — horizontaler Auto-Scroll, pause-on-hover. Später 1:1 in Landing.
- `<ReviewCard />` — Sterne + Body + display_name + Datum.
- `<RatingStat />` — Schnitt + Count, evtl. Mini-Verteilung.
- Helpers:
  - `lib/reviews/getPublicReviews.ts` — anon SELECT, nur display-safe columns.
  - `lib/reviews/getReviewStats.ts` — Service Role, aggregate only (avg, count, evtl. distribution). Kein Row-Leak.

### SEO/GEO
- **Title:** "Stimmen & Bewertungen | Brief nach Berlin"
- **Target-Queries:** "Brief nach Berlin Erfahrungen", "Brief nach Berlin Bewertung", "Brief nach Berlin Reviews"
- **JSON-LD:** Article + FAQPage (Pattern aus `/lohnt-sich-brief-an-politiker` übernehmen)
- **AggregateRating-Schema** prüfen — kann Sterne im Google-Snippet bringen, aber nur wenn die Daten ehrlich repräsentativ sind
- **Sitemap-Eintrag** in `src/app/sitemap.ts`, priority 0.8, changeFrequency "weekly"
- Open Graph + Twitter Cards

### Voice/Copy-Regeln
- Keine Em-Dashes (Komma/Doppelpunkt/Punkt)
- Anti-AI-Voice-Checkliste (`signs-of-ai-writing.md`) durchlaufen
- Du-Form konsistent
- Konkrete Zahlen statt Adjektive

### Orientierung
Bestehende Subpages in `src/app/(site)/` als Vorlage, besonders `/lohnt-sich-brief-an-politiker` (gleiches Layout: Prose, FAQAccordion, PullQuote, FactCallout).

### Sicherheit/Datenschutz
- Public Read läuft über bestehende RLS (consent=true, nur display-safe columns: id, created_at, rating, body, display_name).
- Schnitt-Aggregat serverseitig mit Service-Role, gibt NUR die berechnete Zahl raus, nie Rows.
- Caching: Page mit `revalidate ~3600s`, reicht für Reviews.

### Follow-ups (eigener Scope)
- Landing-Page: 2-3 Quotes + Schnitt-Pill einbauen (nutzt die neuen Komponenten, schließt Sherpa-Audit #8)
- `/roadmap`-Seite existiert noch nicht. Wenn sie gebaut wird, von dort auf `/stimmen` verlinken
- Optional: Admin-View für Thomas, um Highlights manuell zu kuratieren (z.B. `is_featured` column)

### Asset bereits da
`web/public/images/img-stimmen-tisch.webp` (167 KB, 1280×768, Ghibli-Stil: Holztisch mit handgeschriebenen Briefen, Umschlägen, Teetassen, Papier-Fliegern). Direkt einsetzbar im Hero der Seite oder als Editorial-Figure.

### Ausführung
Implementation via `/gsd-plan-phase` oder `/gsd-quick` in eigener Session. Diese Notiz hier ist nur der Brief.
