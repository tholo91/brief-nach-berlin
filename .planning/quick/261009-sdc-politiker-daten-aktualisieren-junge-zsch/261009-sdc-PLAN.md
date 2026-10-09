---
quick_id: 261009-sdc
mode: quick
date: 2026-10-09
---

# Politiker-Daten aktualisieren (Stand 09.10.2026)

User feedback: Frank Junge (SPD, MV) left the Bundestag on 19.07.2026, successor Katrin Zschau (since 20.07.2026). `web/data/politicians-cache.json` is a static snapshot from 2026-07-07, so it predates that change and the 2026 Landtag elections. Sachsen-Anhalt's new Landtag constituted on 06.10.2026 (Abgeordnetenwatch period 178). MV (constitutes 20.10.) and Berlin (~end of Oct) have no new period in Abgeordnetenwatch yet and must stay unchanged. Rheinland-Pfalz MP changed to Gordon Schnieder (CDU) on 18.05.2026, but `landesregierung-addresses.json` still says Alexander Schweitzer.

Constraint: the working tree has unrelated user edits in `web/src/__tests__/landingPageContent.test.ts` and `web/src/components/letter-signals/LetterActivityCard.tsx`. Never stage, commit, revert or modify them. Stage files explicitly by path.

## Task 1: Safety guards in fetch scripts
files: web/scripts/fetch-politician-data.ts, web/scripts/fetch-landtag-data.ts
action:
- `fetch-politician-data.ts` (~line 241 writes `landtag: []`): preserve the existing `landtag` array from the current cache file when writing (read the existing cache if it exists, fall back to `[]`). Keep the style of the surrounding code.
- `fetch-landtag-data.ts` (loop ~lines 363-400): before the loop, read the existing cache. If a state yields 0 mandates (or no period found), keep that state's previous MdL from the existing cache (filter by the field that holds the Bundesland, check the Politician type) and `console.warn` a clear message. Minimal change, no new abstractions.
verify: `npx tsc --noEmit -p web` (or the project's type check) passes for these files.
done: Running `fetch:politicians` alone no longer wipes MdL; a state with 0 mandates no longer gets wiped.
commit: `fix(quick-261009-sdc): Fetch-Skripte behalten Landtag-Daten bei leeren Antworten`

## Task 2: Refresh data
files: web/data/politicians-cache.json, web/data/plz-landtagswahlkreis-mapping.json, web/data/constituency-offices.json (+ whatever these scripts write)
action (cwd `web/`):
1. Record before-state: MdL counts per Bundesland and "PLZs mit WK-Match" count (`Object.keys` of the mapping JSON).
2. `npm run fetch:politicians` (takes several minutes, ~600 ms per committee request; run with a long timeout).
3. `npm run fetch:landtag`. Capture log lines per state (period id + counts).
4. Re-run the constituency offices scraper (`web/scripts/fetch-constituency-offices.ts`; find its npm script name in package.json, else `npx tsx scripts/fetch-constituency-offices.ts`).
verify:
- `grep -c Junge web/data/politicians-cache.json` → 0 for the politician entry; Katrin Zschau present (expect wahlkreis 14 Rostock).
- fetch:landtag log: Sachsen-Anhalt period 178, ~83 mandates; BW period 165; RP period 166; MV still period 134, Berlin still period 133.
- MdB count stays ~608; total MdL count plausible; PLZ match count for ST did not collapse (compare before/after; report numbers).
- `git diff --stat web/data` sane, no file emptied.
- Zschau in constituency-offices.json (if bundestag.de lists her office); report if not.
If the API rate-limits (429) or a state unexpectedly returns 0, stop and report instead of committing broken data.
commit: `chore(quick-261009-sdc): Politiker-Daten neu geladen (Zschau statt Junge, Landtag ST neu)`

## Task 3: RP head of government + runbook
files: web/data/landesregierung-addresses.json, .claude/skills/refresh-after-bundestagswahl/SKILL.md
action:
- In `recipients.RP.headOfGovernment`: name "Gordon Schnieder", title unchanged, salutation "Sehr geehrter Herr Ministerpräsident Schnieder,", addressLines ["Ministerpräsident Gordon Schnieder", "Staatskanzlei Rheinland-Pfalz", "Postfach 3880", "55028 Mainz"], source { title: "Staatskanzlei Rheinland-Pfalz: Ministerpräsident Gordon Schnieder", url: "https://www.rlp.de/regierung/staatskanzlei", verifiedAt: "2026-10-09" }. Update `_meta.verifiedAt` to "2026-10-09". Grep the repo (web/src, tests) for "Schweitzer" and update any test fixtures/expectations that reference the RP head.
- SKILL.md: add a short section (German, no em dashes) "Nach Landtagswahlen": (1) Reihenfolge `fetch:politicians` dann `fetch:landtag` dann Wahlkreisbüros; (2) Landtag erst nach der konstituierenden Sitzung UND sobald Abgeordnetenwatch die neue Legislatur mit Mandaten hat neu laden; (3) Regierungschef in `web/data/landesregierung-addresses.json` erst nach der Wahl der/des neuen MP/RBm tauschen, bis dahin ist die alte Person geschäftsführend korrekt.
verify: `cd web && npm test` and `npm run build` pass (report any pre-existing failures separately; the two user-modified files may cause failures unrelated to this task, report them, do not fix them).
commit: `fix(quick-261009-sdc): RP-Ministerpräsident Schnieder, Runbook Landtagswahlen`
