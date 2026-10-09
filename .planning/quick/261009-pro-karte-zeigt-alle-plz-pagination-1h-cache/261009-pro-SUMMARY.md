---
quick_id: 261009-pro
status: complete
commits: [639e6df, 9c1e9e2, 21e6857]
---

# Summary 261009-pro

1. `getPublicMapData.ts` lädt die RPC in 1.000er-Seiten (`.range`) und cacht das Ergebnis mit `unstable_cache` 1 h (Tag `letter-map`). Der CDN-Cache der Route (5 min) bleibt unverändert.
2. Der Text über der Karte lautet jetzt „X Briefe aus Städten, Dörfern und Gemeinden“, mobil „X Briefe aus ganz Deutschland“. Das harte „+“ ist weg.
3. Story-Todo: `.planning/todos/pending/2026-10-09-wabenkarte-mit-aggregat-tabelle.md`.

Verifikation:
- jest: 110 Suites, 924 Tests grün, inklusive eines neuen Pagination-Tests.
- tsc: 12 bereits vorhandene Fehler (`.next`-Typen, campaignTopicReset-Test), identisch vor und nach der Änderung.
- Lokal gegen die echte Supabase: `/api/letter-signals/map` liefert 1.275 PLZ (vorher bei 1.000 gekappt). Auf der Karte ist Bayern gefüllt. Mobil passt der Text in eine Zeile.
- Abweichung: Kein gsd-executor im Worktree, da die Isolation für die kleine Änderung zu viel Aufwand gewesen wäre. Direkt auf main umgesetzt.
