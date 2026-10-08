---
created: 2026-10-08T16:00:00.000Z
title: "Supabase-Migrationen an einem Ort bündeln"
area: infra
severity: minor
files:
  - supabase/migrations/ (4 Dateien, 2026-05-18 bis 2026-06-01, CLI-Zeitstempel-Format)
  - web/supabase/migrations/ (002 bis 026, nummeriert)
---

## Problem

Migrationen liegen an zwei Orten: `supabase/migrations/` im Repo-Root (4 frühe Dateien im CLI-Format: Zähler, Reviews-Basis, `increment_counter`, `hero_featured`) und `web/supabase/migrations/` (ab 002, fortlaufend). In `web/` fehlt eine 001, und die Nummer 024 ist doppelt vergeben (`024_campaign_landing_rank.sql`, `024_letter_signals_letter_number.sql`). Solange alles manuell im Supabase Studio angewendet wird, ist das harmlos. Es wird zum Problem bei `supabase db push` oder wenn jemand aus den Dateien den Produktionsstand ableiten will.

## Solution

1. Inhalt der 4 Root-Dateien mit `web/supabase/migrations/002+` abgleichen (Überschneidungen?).
2. Root-Dateien nach `web/supabase/migrations/archive/` verschieben (oder als `000a_` bis `000d_`), Root-Ordner `supabase/` entfernen, falls sonst leer (`.temp` ist gitignored).
3. Doppelte 024 nicht umbenennen (in Produktion angewendet), sondern in einer README dokumentieren.
4. `web/supabase/migrations/README.md`: einziger Ort, Nummern fortlaufend vergeben, manuell im Studio anwenden, Anwendung in Produktion per Doku-Commit festhalten (wie bei 023/024/025).

Kein SQL wird neu angewendet. Check: `git ls-files | grep '\.sql$'` zeigt nur noch `web/supabase/migrations/`.
