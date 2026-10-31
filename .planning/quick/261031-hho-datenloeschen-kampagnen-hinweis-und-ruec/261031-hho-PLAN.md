---
phase: quick-261031-hho
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx
  - web/src/__tests__/datenloeschenPage.test.ts
autonomous: true
requirements:
  - QUICK-261031-hho
user_setup: []

estimate:
  tokens: 15000
  raw_tokens: 15000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "D-01: Die Seite /datenloeschen nennt in den Zuständen empty, stored und Erfolg den Satz 'Kampagnen sind hier nicht enthalten. Die verwaltest du unter Kampagne verwalten.' mit Link auf /kampagne/verwalten. Im Erfolgszustand steht er vor dem Button 'Neuen Brief schreiben'."
    - "D-02: Der Zustand empty sagt 'Höchstens kommt noch eine Rückfrage-Mail, die schon geplant war. Danach ist Schluss.', wortgleich zum Erfolgszustand."
    - "D-03: Der Test deckt beides ab: Zustand B0 enthält Rückfrage-Mail und den Kampagnen-Link, Zustand B enthält den Kampagnen-Link."
    - "Zwei getrennte fix-Commits auf main, nur die zwei Plan-Dateien, kein Push."
  artifacts:
    - path: web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx
      provides: "CampaignNotice, eingebunden in SmallPrint und im Erfolgszustand; Rückfrage-Satz im Zustand empty"
      contains: "function CampaignNotice"
    - path: web/src/__tests__/datenloeschenPage.test.ts
      provides: "Positive Erwartungen für Kampagnen-Link (B0, B) und Rückfrage-Mail (B0)"
      contains: "expect(markup).toContain(\"Rückfrage-Mail\")"
  key_links:
    - from: web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx
      to: web/src/app/(site)/kampagne/verwalten/page.tsx
      via: "CampaignNotice verlinkt per next/link auf die bestehende Route /kampagne/verwalten"
      pattern: "href=\"/kampagne/verwalten\""
---

<objective>
Zwei bestätigte Datenschutz-Funde auf der Datenlöschen-Seite beheben. Commit 097ee9f hat beide Sätze entfernt, die Entscheidungen stehen fest und werden hier nicht neu verhandelt. Die Punkte aus dem Auftrag heißen in diesem Plan D-01 bis D-03:

- D-01 Kampagnen-Hinweis: Die Seite sucht und löscht keine Kampagnen (campaigns.creator_email), sagt aber "keine Daten gespeichert" und "Deine Daten sind gelöscht". Der Satz "Kampagnen sind hier nicht enthalten. Die verwaltest du unter Kampagne verwalten." kommt zurück, in den Zuständen empty, stored und Erfolg.
- D-02 Rückfrage-Mail: Löschen stoppt die bei Brevo schon geplante Mail nicht. Der Zustand empty bekommt denselben Satz wie der Erfolgszustand.
- D-03 Tests: In web/src/__tests__/datenloeschenPage.test.ts drehen Zustand B0 (Zeilen 72 und 73) und Zustand B (Zeile 93) von negativ auf positiv.

Purpose: Rechtlich relevante Aussagen auf der Seite müssen stimmen (Bauprinzip: Recht und Datenschutz).
Output: 2 fix-Commits auf main, Tests grün, kein Push.

Reine Textkorrektur im vorhandenen Layout: ein wiederhergestellter Hinweis, ein Absatz, keine neue Gestaltung. Ein /frontend-design-Durchlauf ist deshalb nicht nötig (Memory: Frontend über UI-Skill, im Plan benannt).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx
@web/src/__tests__/datenloeschenPage.test.ts

Befunde aus der Planung (gegen HEAD b7df67b geprüft):
- Link (next/link) und linkClass sind in DatenloeschenClient.tsx schon vorhanden, kein neuer Import nötig.
- SmallPrint wird in den Zuständen empty und stored gerendert, nicht im Erfolgszustand. Deshalb die eigene Komponente statt doppeltem JSX.
- Der Erfolgszustand hängt am Client-State result und lässt sich mit renderToStaticMarkup nicht rendern. Er wird über das Regions-Gate in Task 1 geprüft, nicht über Jest.
- Die Route web/src/app/(site)/kampagne/verwalten/page.tsx existiert.
- Baselines: 13 Tests in datenloeschenPage.test.ts grün, eslint auf beiden Dateien sauber. Der Test ruft kein Mistral auf.
- Alle Gates in verify wurden auf einer Kopie mit der geplanten Änderung geprüft; die Baselines stehen in done.

Copy-Regeln: keine Gedankenstriche oder Halbgeviertstriche, "ich" statt "wir". Die Texte in diesem Plan sind wörtlich zu übernehmen. Das Copy-Gate in datenloeschenPage.test.ts prüft die Datei zusätzlich.

Abdeckung: D-01 in Task 1, D-02 in Task 2, D-03 aufgeteilt (Zeilen 73 und 93 in Task 1, Zeile 72 in Task 2). Quick-Task ohne Research und ohne Roadmap-Anforderungen.

Commits: jeweils nur die zwei Dateien per git add mit Pfad, mit dem Attribution-Trailer der Umgebung. Task 1 committen, bevor Task 2 beginnt. Kein Push, keine Branches, keine Worktrees.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1 (Commit 1): Kampagnen-Hinweis in allen drei Zuständen</name>
  <files>web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx, web/src/__tests__/datenloeschenPage.test.ts</files>
  <behavior>
    - Zustand B0 (gültiger Token, keine Daten): das gerenderte Markup enthält href="/kampagne/verwalten"
    - Zustand B (gültiger Token, Daten vorhanden): das gerenderte Markup enthält href="/kampagne/verwalten"
    - Erfolgszustand: CampaignNotice steht vor dem Button "Neuen Brief schreiben" (per Regions-Gate geprüft, siehe Befunde)
  </behavior>
  <action>
Setzt D-01 um und den Kampagnen-Teil von D-03.

1. RED: In web/src/__tests__/datenloeschenPage.test.ts Zeile 73 (Zustand B0) und Zeile 93 (Zustand B) ändern: die negative Erwartung auf den Kampagnen-Pfad wird jeweils zu expect(markup).toContain('href="/kampagne/verwalten"'). Zeile 72 bleibt in diesem Task unverändert. Test laufen lassen, die Tests für B0 und B müssen rot sein.

2. GREEN in web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx: Direkt über SmallPrint eine lokale Komponente CampaignNotice ohne Props anlegen. Sie rendert einen Absatz mit className "font-body text-sm text-warmgrau leading-relaxed". Inhalt wörtlich: "Kampagnen sind hier nicht enthalten. Die verwaltest du unter" gefolgt von {" "}, dann ein Link mit href "/kampagne/verwalten", className linkClass und Text "Kampagne verwalten", dann ein Punkt. Der Satz ist die in 097ee9f entfernte Fassung, die Schrift bleibt text-sm wie der bestehende Absatz (per D-01, nicht das frühere text-xs).

3. SmallPrint umbauen: Das äußere Element wird ein div mit className "mt-6 space-y-3". Der bestehende Absatz behält Text und Mailto-Link, seine className wird "font-body text-sm text-warmgrau leading-relaxed" (mt-6 wandert auf das div). Darunter CampaignNotice. Damit haben die Zustände empty und stored den Hinweis.

4. Erfolgszustand (Zweig result?.ok): Am Absatz mit dem Rückfrage-Satz mb-6 zu mb-3 ändern. Direkt danach, vor dem Link "Neuen Brief schreiben", ein div mit className "mb-6" einfügen, das CampaignNotice enthält. Überschrift, Spendenbitte und Button bleiben unverändert.

5. Prüfen (siehe verify), dann committen: git add auf die beiden Dateien, Nachricht "fix(quick-261031-hho): Datenlöschen-Seite nennt Kampagnen wieder in allen Zuständen".
  </action>
  <verify>
    <automated>cd web && F="src/app/(site)/datenloeschen/DatenloeschenClient.tsx" && T="src/__tests__/datenloeschenPage.test.ts" && npx jest "$T" && npx eslint "$F" "$T" && grep -q 'function CampaignNotice' "$F" && test "$(grep -o 'Kampagnen sind hier nicht enthalten. Die verwaltest du unter' "$F" | wc -l | tr -d ' ')" = 1 && awk '/function SmallPrint/,/^}/' "$F" | grep -q 'CampaignNotice />' && awk '/Erledigt. Deine Daten sind gelöscht/,/Neuen Brief schreiben/' "$F" | grep -q 'CampaignNotice />' && test "$(grep -o "toContain('href=\"/kampagne/verwalten\"')" "$T" | wc -l | tr -d ' ')" -ge 2 && ! grep -q 'not.toContain("/kampagne/verwalten")' "$T"</automated>
  </verify>
  <done>Tests und eslint grün. Baselines HEAD zu Ziel: Definition CampaignNotice 0 zu 1, Einbindung in SmallPrint 0 zu 1, Einbindung im Erfolgszustand 0 zu 1, Hinweissatz 0 zu genau 1 (kein doppeltes JSX), positive href-Erwartungen 0 zu 2, negative Erwartungen auf den Kampagnen-Pfad 2 zu 0. Commit 1 enthält nur die zwei Dateien.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2 (Commit 2): Rückfrage-Mail-Satz im Zustand empty</name>
  <files>web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx, web/src/__tests__/datenloeschenPage.test.ts</files>
  <behavior>
    - Zustand B0: das gerenderte Markup enthält Rückfrage-Mail
    - Der Satz steht wortgleich im Erfolgszustand und im Zustand empty
  </behavior>
  <action>
Setzt D-02 um und den Rest von D-03.

1. RED: In web/src/__tests__/datenloeschenPage.test.ts Zeile 72 (Zustand B0) ändern: die negative Erwartung auf das Wort Rückfrage-Mail wird zu expect(markup).toContain("Rückfrage-Mail"). Test laufen lassen, der Test für B0 muss rot sein.

2. GREEN in web/src/app/(site)/datenloeschen/DatenloeschenClient.tsx: Im Zweig für view.kind "empty" im bestehenden Textblock mit space-y-3 nach dem Absatz "Es gibt keinen Newsletter ..." einen dritten Absatz ohne eigene Klassen ergänzen. Text wörtlich: "Höchstens kommt noch eine Rückfrage-Mail, die schon geplant war. Danach ist Schluss." SmallPrint bleibt direkt unter dem Block.

3. Prüfen (siehe verify), dann committen: git add auf die beiden Dateien, Nachricht "fix(quick-261031-hho): Leerzustand kündigt die geplante Rückfrage-Mail wieder an".
  </action>
  <verify>
    <automated>cd web && F="src/app/(site)/datenloeschen/DatenloeschenClient.tsx" && T="src/__tests__/datenloeschenPage.test.ts" && npx jest "$T" && npx eslint "$F" "$T" && test "$(grep -o 'Höchstens kommt noch eine Rückfrage-Mail, die schon geplant war. Danach ist Schluss.' "$F" | wc -l | tr -d ' ')" -ge 2 && awk '/view.kind === "empty"/,/SmallPrint \/>/' "$F" | grep -q 'Höchstens kommt noch eine Rückfrage-Mail' && grep -q 'expect(markup).toContain("Rückfrage-Mail")' "$T" && ! grep -q 'not.toContain("Rückfrage-Mail")' "$T"</automated>
  </verify>
  <done>Tests und eslint grün. Baselines HEAD zu Ziel: Rückfrage-Satz im Client 1 zu 2 (davon 0 zu 1 im Zustand empty), positive Erwartung 0 zu 1, negative Erwartung 1 zu 0. Commit 2 enthält nur die zwei Dateien.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Seitentext zu Nutzer:in | Aussagen zu gespeicherten und gelöschten Daten sind rechtlich relevante Zusagen |

Keine neuen Datenflüsse: Der Plan ändert nur statischen Text und einen statischen Link.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-hho-01 | Repudiation | DatenloeschenClient, Zustände empty, stored, Erfolg | medium | mitigate | CampaignNotice stellt klar, dass Kampagnen nicht erfasst sind; Jest für B0 und B, Regions-Gate für den Erfolgszustand (Task 1) |
| T-hho-02 | Repudiation | DatenloeschenClient, Zustand empty | medium | mitigate | Rückfrage-Satz wieder im Zustand empty, Jest für B0 und Zähl-Gate (Task 2) |
| T-hho-03 | Information Disclosure | Link auf /kampagne/verwalten | low | accept | Statischer Link ohne Token oder Mailadresse; page.tsx setzt referrer no-referrer, per Test abgesichert |
| T-hho-SC | Tampering | npm/pip/cargo installs | low | accept | Dieser Plan installiert keine Pakete; kein Legitimitäts-Gate nötig |
</threat_model>

<verification>
- Nach Task 2 der gemeinsame Lauf aus web/: npx jest src/__tests__/datenloeschenPage.test.ts und npx eslint auf beide Dateien (Dateipfad mit Klammern in Anführungszeichen).
- git log --oneline -2 zeigt die zwei fix(quick-261031-hho)-Commits, git status --short ist leer, git diff --stat HEAD~2 listet nur die zwei Plan-Dateien. Kein Push.
</verification>

<success_criteria>
- D-01: Kampagnen-Hinweis mit Link in den Zuständen empty, stored und Erfolg, im Erfolgszustand vor dem Button, aus einer einzigen Komponente.
- D-02: Rückfrage-Satz im Zustand empty, wortgleich zum Erfolgszustand.
- D-03: Zeilen 72, 73 und 93 prüfen positiv, Tests grün.
- Eslint sauber, zwei getrennte Commits, nur zwei Dateien, kein Push.
</success_criteria>

<output>
Create `.planning/quick/261031-hho-datenloeschen-kampagnen-hinweis-und-ruec/261031-hho-SUMMARY.md` when done
</output>
