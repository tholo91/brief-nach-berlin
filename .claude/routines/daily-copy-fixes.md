# Routine: Brief nach Berlin — Täglicher Copy-/UX-Fix (1 Item pro Lauf → PR zum Review)

> So einrichten: Inhalt unten als **Prompt** in claude.ai/code/routines → *New routine* einfügen.
> Repo: `tholo91/brief-nach-berlin` · App liegt in `web/` · Trigger: täglich 07:30 Europe/Berlin · Branch-Policy: `claude/*` + PR · Kein Auto-Merge · Abo-Auth (kein API-Key).

---

Du arbeitest autonom im Repo `tholo91/brief-nach-berlin` (Next.js/TypeScript, App in `web/`). Ziel: pro Lauf GENAU EINE kuratierte, risikoarme Copy-/UX-Aufgabe umsetzen und als PR zum Review öffnen. Alles auf Deutsch. Stelle keine Rückfragen.

## Harte Regeln
- Nur die kuratierten Copy-/Text-Aufgaben unten. KEINE Logik-Änderungen (kein PLZ-/Wahlkreis-Mapping, keine OpenAI-/Supabase-/API-Logik, keine DSGVO-relevanten Datenflüsse).
- Push NUR auf einen Branch `claude/<kurzslug>`. NIEMALS auf `main`. Kein Merge.
- Minimaler Diff, exakt im Scope der einen Aufgabe.

## Kuratierte Items (Quelle: `.planning/quick/`) — nur diese, in dieser Reihenfolge. Lies je den Task-Ordner für die genaue Anforderung.
1. **e8o** — Ordner in `.planning/quick/`, dessen Name `260523-e8o` enthält — „wir" → „ich" über Landing + Subpages (reine Copy).
2. **pph** — Ordner in `.planning/quick/`, dessen Name `260523-pph` enthält — Sign-off-Copy im Brief verbessern.
3. **v52** — Ordner in `.planning/quick/`, dessen Name `260522-v52` enthält — Datums-Korrektur in der Hero-Note.

## Ablauf
1. **Erledigte ermitteln:** `gh pr list --state all` und `git branch -r | grep claude/`. Überspringe Items mit vorhandenem Branch/PR.
2. Nimm das erste offene Item; finde den zugehörigen Ordner in `.planning/quick/` per ID-Präfix (z. B. `260523-e8o`) — Ordnernamen sind auf der Platte evtl. abgeschnitten — und lies dort die `*-PLAN.md` / `*-SUMMARY.md` für die genaue Anforderung. Alle erledigt → melde „Alle kuratierten Items erledigt." und stoppe.
3. Branch `claude/<slug-kurz>` von `main` erstellen.
4. Aufgabe umsetzen (nur Text/Copy/UI, minimaler Diff).
5. **Verifier in `web/`:** `npm ci || npm install`, dann `npm run build` und `npm run lint`. Beide müssen fehlerfrei durchlaufen. (Optional `npm test`; bei Fehlschlag im PR-Body vermerken, nicht blockieren.)
6. Bei grün: committen (deutsche Message), pushen, PR öffnen (Titel + kurze Beschreibung der Copy-Änderung + Build/Lint-Status im Body).
7. Bei rotem Build/Lint nach 2 Versuchen: Draft-PR mit Notiz zum Blocker + stoppen.
8. Knappe Schlussmeldung: Item-ID, Branch, PR-URL, Build/Lint-Status.

Stelle keine Rückfragen. Arbeite pro Lauf nur die eine Aufgabe ab.
