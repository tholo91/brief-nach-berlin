---
quick_id: 261027-mrw
type: quick
---

# Repo-Hygiene: privater Ordner, Todos und Outreach lokal

Ziel: Private Arbeitsnotizen bleiben im öffentlichen Repo lokal, ohne GSD zu brechen.

1. `.planning/local/` als einen ignorierten Ordner für Privates anlegen.
2. `.planning/todos/` ignorieren und aus dem Index nehmen. Bleibt am Ort, weil GSD-Befehle den Pfad fest nutzen.
3. `archive/OUTREACH.md` (Pressekontakte mit Versandvermerken) nach `.planning/local/` verschieben.
4. `.playwright-mcp/` aus dem Index nehmen (war ignoriert, aber getrackt).
5. Echten Nutzer in `.planning/ROADMAP.md` und `.planning/feedback/README.md` anonymisieren.

Check: `git ls-files .planning/todos .playwright-mcp archive/OUTREACH.md` leer, lokale Dateien vorhanden, `git check-ignore` greift.
Kein History-Rewrite, kein Push.
