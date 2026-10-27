---
quick_id: 261027-mrw
status: complete
---

# Summary: Repo-Hygiene

- `.planning/local/` ist der eine ignorierte Ordner für Privates. `OUTREACH.md` (Pressekontakte) liegt jetzt dort.
- `.planning/todos/` ist ignoriert und aus dem Index genommen (54 Dateien), lokal unverändert. GSD-Befehle nutzen den Pfad weiter.
- `.playwright-mcp/` aus dem Index genommen.
- Nutzer-Bezug in `ROADMAP.md` und `feedback/README.md` anonymisiert.
- Abweichung vom Auftrag: Todos nicht verschoben, weil GSD `.planning/todos/` fest erwartet.
- Nicht gemacht: History-Rewrite. Alte Commits enthalten die Dateien weiterhin.
