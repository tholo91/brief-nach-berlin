---
phase: quick-261031-i0q
plan: 01
subsystem: seo-metadata
tags: [opengraph, metadata, next-og, jest-guard]
status: complete
requirements: [QUICK-261031-i0q]
key-files:
  created:
    - web/scripts/generate-schule-og.ts
    - web/src/app/(site)/schule/opengraph-image.jpg
    - web/src/app/(site)/schule/opengraph-image.alt.txt
    - web/src/__tests__/openGraphDefaults.test.ts
    - .planning/quick/261031-i0q-og-bilder-reparieren-und-eigenes-bild-f-/check-og-tags.sh
  modified:
    - web/src/lib/config.ts
    - .claude/skills/add-subpage/SKILL.md
    - 40 page.tsx (39 plus warum), plus (site)/schreib-merz/page.tsx
commits: 3
plan_head_before: c382699b249c953016927d042e250cd2f3085c2a
plan_head_after: 5c6a5763b713d0b18a504cccbc43934ed812f2d1
actuals:
  tasks: 3
  commits: 3
---

# Quick 261031-i0q: OG-Bilder reparieren und eigenes Bild für /schule

Standard-Vorschaubild über die Konstante `DEFAULT_OG_IMAGES` auf 40 Seiten, /schreib-merz auf die echte Dateiroute umgestellt, eigenes OG-Bild für /schule.

## Commits

- e8dd368: DEFAULT_OG_IMAGES in config.ts, /warum, check-og-tags.sh (Tracer)
- a4e893d: /schule-Bild, Alt-Text, Generator-Skript
- 5c6a576: 39 weitere Seiten, /schreib-merz, Jest-Wächter, add-subpage-Vorlage

## /schule-Bild (Beurteilung D-06)

Skill frontend-design geladen. Gewählt wurde die Panel-Fassung (Nachtgrün-Verlauf links), nicht die Tafel: Die Tafel misst nur rund 40 Prozent der Bildbreite, Text darauf wäre bei 360 px etwa 11 px hoch. Die erste Panel-Probe ließ "schon." auf die helle Wand laufen (Kontrast) und überdeckte die Lehrerin. Fix: Caveat auf zwei Zeilen ("Schreiben" / "schon."), 112 px, Verlauf bis 52 Prozent bei 0.86 Deckkraft. Ergebnis: Der gesamte Text liegt auf dem dunklen Panel, der Kopf der Lehrerin bleibt frei, in 1200 px und in 360 px gut lesbar, Umlaut in "Wählen" korrekt. 1200x630, 123 KB, Pfad `web/src/app/(site)/schule/opengraph-image.jpg`. Alt-Text benutzt "Im Bild steht".

## Deviations from Plan

**1. [Amendment lead] /schreib-merz einbezogen.** Beide `images`-Einträge in `schreib-merz/page.tsx` entfernt, die Dateiroute `opengraph-image.tsx` greift jetzt (og:image und twitter:image zeigen auf `/schreib-merz/opengraph-image-1flbga?...`, 200 image/png). Guard-Test braucht keine Ausnahme, das Geschwister-Bild genügt.

**2. [Layout] Panel statt Tafel** (siehe oben, vom Lead als Fallback freigegeben).

**3. Commit auf main.** Der Pre-Commit-Check meldet main als geschützt; der Plan und der Auftrag verlangen ausdrücklich lokale Commits auf main (Trunk-based, sequentieller Executor). Konfiguration nicht verändert, kein Push.

## Verification

- Jest gesamt: 175 Suites, 1686 Tests grün. openGraphDefaults war vor dem Rollout rot mit 39 Offendern, danach grün.
- Lint: 0 Fehler, 7 Warnungen (unverändert).
- Build grün (zweimal).
- Seiten-Diff der 39 Seiten: nur images- und Importzeilen. Der Diff-Filter zeigte zusätzlich 6 Zeilen aus `(site)/schule/page.tsx` aus der parallelen Nachtmodus-Arbeit, nicht von diesem Task, nicht committet.
- Render-Check (next start, Port 3457, Scraper-User-Agent), 14 Routen PASS inklusive Bild-URL: /schule (200 image/jpeg), /unterricht, /eltern, /warum, /unterricht/ablauf, /spenden, /presse, /stimmen, /tipps (alle /opengraph-image.jpg 200 image/jpeg), / und /kampagne (unverändert, 200 jpeg), /europe (200 webp), /bundestag-besuch-kostenlos (200 webp), /schreib-merz (200 image/png).
- Port 3457 danach frei.

## Offene Punkte

- Kampagnenseite (`/[slug]` bzw. `/kampagne/[slug]`) lokal nicht geprüft: braucht Supabase-Daten und einen echten Slug.
- Produktion ungeprüft bis Push; Messenger-Caches können alte Vorschauen zeigen.
- Das Skript generate-schule-og.ts lädt Schriften von fonts.gstatic.com, nur lokal.

## Known Stubs

None.

## Self-Check: PASSED

Dateien und drei Commits vorhanden (git log geprüft).
