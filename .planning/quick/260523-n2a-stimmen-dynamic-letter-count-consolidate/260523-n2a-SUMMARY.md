---
quick_id: 260523-n2a
slug: stimmen-dynamic-letter-count-consolidate
description: /stimmen dynamic letter count + consolidate Mithelfen and Sign-off (hide email)
date: 2026-05-23
status: complete
tasks_total: 2
tasks_completed: 2
commits:
  - afbbdaa
  - d20ca74
---

# /stimmen Dynamic Count + Consolidate End Blocks

Two atomic commits, inline orchestrator.

## Was wurde gemacht

### 1. Dynamic letter count (`afbbdaa`)

- Import `getLetterCount` aus `@/lib/counter` (Footer nutzt dasselbe).
- `export const revalidate = 3600` entfernt: `getLetterCount` ruft intern `noStore()`, was die Seite eh dynamic macht. Die `revalidate`-Direktive wäre dead code.
- `Promise.all` um den Counter erweitert. `displayCount = letterCount > 0 ? letterCount.toString() : "350"` als Fallback, damit die Seite nie "0 Briefe" anzeigt wenn der Counter mal failt.
- Drei hardcoded Stellen ersetzt:
  - Standfirst Section 5: "dreihundertfünfzig Briefe" → `{displayCount} Briefe`
  - Figure caption: "Über 350 Briefe..." → `${displayCount} Briefe...` (das "Über" raus, weil die exakte Zahl rauskommt)
  - Paragraph Section 5: "über 350 Briefe entstanden" → `{displayCount} Briefe entstanden`

Kosten: jeder Request auf /stimmen hits Supabase 3× (reviews + stats + counter) statt 1× pro Stunde. Bei ~5k Pageviews/Monat absolut im Rahmen der Free Tier.

### 2. Mithelfen + Sign-off zusammengelegt (`d20ca74`)

Vorher: Section 7b (Box mit Mithelfen-Text und großem Mail-Button mit Email als Beschriftung) UND Section 8 (boxless handwriting close mit "Thomas, Bremen" und sichtbarem Email-Link). Beide am Ende, beide mit der Email offen sichtbar.

Nachher: ein einziger Closing-Block in Section 8 (boxless, zentriert), der die Mithelfen-Substanz absorbiert:

1. Typewriter-Kicker "Mithelfen"
2. Handwriting opener "Wenn du bis hier gelesen hast: schreib mir. Auch eine Zeile reicht."
3. Body-Absatz (Mithelfen-Substanz): Politiker-Daten, Texte gegenlesen, Bugs melden, weitersagen
4. Ein Button mit Label "Schreib mir" (Mailto im href, Email nicht sichtbar — gleiches Pattern wie Section 2 "Direkt schreiben")
5. Typewriter signature "Thomas, Bremen"

Email-Sichtbarkeit: 0 (vorher 2). Email steht nur noch in `mailto:` hrefs (Section 2 + Section 8). Vollständige DOM-Obfuskation wäre ein Kontaktformular gewesen, out of scope.

## Verifikation

- `grep -c "thomas-lorenz@posteo.de" web/src/app/(site)/stimmen/page.tsx` → 2 (beide nur in `href="mailto:"`)
- `grep -nE "350|dreihundertfünfzig" ...` → nur 1 Match, der Fallback-String in Line 121
- `grep -n "—" ...` → empty
- `npx tsc --noEmit` → exit 0
- Net diff: +22/-37 Zeilen über beide Commits in derselben Datei.

## Trade-offs dokumentiert

- /stimmen ist jetzt dynamic statt ISR. Akzeptiert für die Frische des Counters.
- Email ist nicht 100% obfuskiert (steht im `mailto:` href). Wenn ernsthafter Schutz gewünscht: Kontaktformular mit Captcha + Backend-Route. Separater Task.
