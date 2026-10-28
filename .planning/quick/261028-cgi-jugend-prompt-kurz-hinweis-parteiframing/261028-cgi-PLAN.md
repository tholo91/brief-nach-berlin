---
phase: quick-261028-cgi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/lib/generation/generateLetter.ts
  - web/src/__tests__/generateLetterYouthPrompt.test.ts
  - web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap
autonomous: true
requirements:
  - QUICK-261028-cgi
user_setup: []

estimate:
  tokens: 30000
  raw_tokens: 30000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Ist input.youth gesetzt, enthält der System-Prompt für MdB (Bund) und MdL (Land) weder „PARTEI-BEWUSSTES FRAMING“ noch die Partei-Werte-Liste (kein „Bewahrung des Bewährten“, kein „- SPD:“). An ihrer Stelle steht „PARTEI-NEUTRALITÄT (Jugendbrief):“ mit genau einer Zeile. Sonst ist der Jugend-System-Prompt zeichengleich mit dem Erwachsenen-Prompt für dieselbe Eingabe."
    - "Hat der System-Prompt im Jugendmodus schon einen Neutralitätskopf (Landesregierung, Kommune, Bundeskanzler, Empfänger offen, Kampagne mit festem Empfänger), bleibt dieser unverändert."
    - "Bei Jugend-Eingaben unter 200 Zeichen enthält der User-Prompt einen Jugend-<hinweis>, der weder „Bürger“ noch „abstrakt“ enthält. Er sagt: einfach und konkret bei dem bleiben, was im <transkript> steht, und keine Erlebnisse, Angaben zur Person oder Orte erfinden. Bei Jugend-Eingaben ab 200 Zeichen gibt es keinen <hinweis>."
    - "Mit Klassenlink enthält <absender_jugend> die Wörter „Unterrichtsprojekt“ und „in eigenen Worten“, aber nicht „im Rahmen“. Der Ankersatz „Ich gehe in die N. Klasse.“ bleibt wortgleich."
    - "Prompts für Erwachsene, /eltern und Kampagnen bleiben byte-identisch: generateLetterAdultRegression läuft mit --ci grün, die Snapshot-Datei ist gegenüber 1af62cb unverändert, und der Kurz-Hinweis für Erwachsene steht wortgleich im Code."
    - "Keine echten Mistral-Aufrufe, alle Tests mocken @/lib/mistral. Commits mit Scope quick-261028-cgi auf main, kein Push."
  artifacts:
    - path: web/src/lib/generation/generateLetter.ts
      provides: "YOUTH_PARTEI_HEADER plus youth-Ersetzung in buildSystemPrompt, YOUTH_SHORT_INPUT_HINWEIS in buildUserPrompt, neu formulierte viaClassLink-Zeile in youthBlock"
    - path: web/src/__tests__/generateLetterYouthPrompt.test.ts
      provides: "Tests: Jugend-System-Prompt ohne Partei-Werte, Diff-Wächter gegen den Erwachsenen-Prompt, Jugend-Kurzhinweis, Unterrichtsprojekt ohne „im Rahmen“, Ende-zu-Ende über generateLetter"
    - path: web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap
      provides: "Bewusst aktualisierte Jugend-Block-Snapshots (nur die drei Fälle mit Klassenlink)"
  key_links:
    - from: web/src/lib/generation/generateLetter.ts (buildSystemPrompt)
      to: BUND_PARTEI_HEADER / BUND_PARTEI_LIST
      via: "if (input.youth) direkt nach der Ebenen-Kette, gleiches .replace-Muster wie die Zweige für Kommune, Kanzler und Kampagne; auf bereits neutralen Zweigen ein No-op"
    - from: web/src/lib/generation/generateLetter.ts (buildUserPrompt)
      to: shortInputHinweis
      via: "Bei issueText.length < 200 wählt input.youth zwischen YOUTH_SHORT_INPUT_HINWEIS und dem unveränderten Erwachsenen-Literal"
    - from: web/src/app/api/generate-letter/route.ts
      to: web/src/lib/schule/youthContext.ts
      via: "resolveYouthLetterContext setzt youth nur bei audience \"jung\" und gültiger Klasse. Erwachsene, /eltern und Kampagnen erreichen die Jugend-Zweige deshalb nie."
---

<objective>
Der Jugend-Briefprompt wird schärfer. Alle drei Änderungen greifen nur, wenn `input.youth` gesetzt ist:

1. Partei-Framing (System-Prompt): Im Jugendmodus fällt die parteibezogene Werte-Sprache weg. Eine kurze Neutralitätszeile ersetzt sie. Eine Person aus der 7. Klasse, die an die CDU schreibt, bekommt sonst „Bewahrung des Bewährten“ in den Brief.
2. Kurz-Hinweis (User-Prompt): Schüler:innen schreiben fast immer weniger als 200 Zeichen. Der Hinweis für Erwachsene („bleibe abstrakt“, „Der Bürger“) widerspricht dem Jugend-Block („eigene Beobachtungen“). Die Jugend-Variante sagt: einfach und konkret beim Transkript bleiben, nichts erfinden. Der Schutz vor Halluzinationen bleibt.
3. Unterrichtsprojekt-Satz (Jugend-Block): Die viaClassLink-Zeile wird ohne „im Rahmen“ formuliert, das auf der eigenen Verbotsliste des Prompts steht. Sie wird frei formulierbar, damit 25 Briefe einer Klasse an dieselbe Abgeordnete nicht denselben Satz tragen. Der Ankersatz „Ich gehe in die N. Klasse.“ bleibt unverändert.

Purpose: Bessere Jugendbriefe ohne Risiko für den Erwachsenen-Flow. Prompts für Erwachsene, /eltern und Kampagnen bleiben byte-identisch.
Output: Änderungen in generateLetter.ts, erweiterte Tests in generateLetterYouthPrompt.test.ts und bewusst aktualisierte Jugend-Snapshots. Keine neuen Dateien, keine UI-Änderung, der Ton-Regler bleibt außen vor.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@web/src/lib/generation/generateLetter.ts
@web/src/__tests__/generateLetterYouthPrompt.test.ts
@web/src/__tests__/generateLetterAdultRegression.test.ts

Fakten aus dem Code (Planner hat sie gelesen, Zeilen ca.):
- SYSTEM_PROMPT_TEMPLATE (Z. 89) enthält ab Z. 167 den Block PARTEI-BEWUSSTES FRAMING. Die exakten Segmente stehen als Konstanten BUND_PARTEI_HEADER (Z. 320) und BUND_PARTEI_LIST (Z. 335). Der Kommentar in Z. 220 sagt, dass diese Segmente 1:1 im Template stehen müssen. Das Template selbst wird NICHT angefasst.
- buildSystemPrompt (Z. 376) leitet den Prompt per `.replace` auf diesen Konstanten ab. Die Zweige für Kampagne, Bundeskanzler, mdbLater, Landesregierung und Kommune ersetzen BUND_PARTEI_HEADER durch einen *_PARTEI_HEADER und entfernen `\n${BUND_PARTEI_LIST}`. Der Land-Zweig für MdL und der Bund-Zweig für MdB lassen den Partei-Block stehen.
- BUND_PARTEI_HEADER enthält ein weiches Trennzeichen (U+00AD in „anschlussfähig“). Deshalb immer die Konstante verwenden und den Text nie abtippen.
- youthBlock (Z. 506): Die viaClassLink-Zeile steht in Z. 524. Der Ankersatz kommt aus Z. 520.
- buildUserPrompt (Z. 587): shortInputHinweis greift bei `input.issueText.length < 200`. Der Text für Erwachsene beginnt mit „Der Bürger hat sich knapp gehalten.“
- Die Jugend-Snapshots in generateLetterYouthPrompt.test.ts.snap erfassen nur den <absender_jugend>-Block. Die Erwachsenen-Snapshots in generateLetterAdultRegression.test.ts.snap erfassen System- und User-Prompt für Bund mit MdB, Landesregierung und Kampagne mit festem Empfänger.
- Jest führt nur *.test.ts aus. Mistral wird über jest.mock("@/lib/mistral") gemockt, das Muster steht schon in der Testdatei.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer: Jugend-System-Prompt ohne Partei-Werte-Sprache, Ende-zu-Ende über generateLetter</name>
  <files>web/src/lib/generation/generateLetter.ts, web/src/__tests__/generateLetterYouthPrompt.test.ts</files>
  <behavior>
    - generateLetter(input(12, true)) mit gemocktem Mistral: messages[0].content (System) enthält „PARTEI-NEUTRALITÄT (Jugendbrief):“ und nicht „Bewahrung des Bewährten“.
    - buildSystemPrompt im Jugendmodus, Bund mit MdB: enthält weder „PARTEI-BEWUSSTES FRAMING“ noch „Bewahrung des Bewährten“ noch „- SPD:“. Enthält „PARTEI-NEUTRALITÄT (Jugendbrief):“ und „Verwende keine parteibezogene Werte-Sprache.“
    - Land mit MdL im Jugendmodus (level "Land", politicians [{...mdb, level: "Land"}]): dieselben Assertions.
    - Landesregierung im Jugendmodus (level "Land", politicians [], landesregierung getLandesregierungRecipient("NW")!): enthält „PARTEI-NEUTRALITÄT (Landesregierung/Senat)“, nicht „(Jugendbrief)“.
    - Diff-Wächter: Jugend- und Erwachsenen-System-Prompt für dieselbe Bund-Eingabe unterscheiden sich, sind aber gleich, sobald in beiden der Partei-Abschnitt durch denselben Marker ersetzt ist.
    - Erwachsener Bund mit MdB enthält weiter „PARTEI-BEWUSSTES FRAMING“ und „Bewahrung des Bewährten“.
  </behavior>
  <action>
RED: Erweitere web/src/__tests__/generateLetterYouthPrompt.test.ts, keine neue Datei. Importiere zusätzlich buildSystemPrompt aus "@/lib/generation/generateLetter" und getLandesregierungRecipient aus "@/lib/lookup/landesregierungRecipient". Lege ein neues describe „Jugend-System-Prompt ohne Partei-Werte“ an. Darin setzt beforeAll die festen Timer wie in generateLetterAdultRegression.test.ts: useFakeTimers mit setSystemTime(new Date("2026-03-15T12:00:00Z")), afterAll nimmt useRealTimers. Schreibe dort die buildSystemPrompt-Fälle aus <behavior>. Für den Diff-Wächter: youth = buildSystemPrompt(input(8, false)) und adult = buildSystemPrompt({ ...input(8, false), youth: undefined }). Beide gehen durch eine kleine Hilfsfunktion, die mit dem Regex `/PARTEI-[^\n]*\n[\s\S]*?\n\nMdB-KONTEXT NUTZEN/` den Abschnitt durch "PARTEI\n\nMdB-KONTEXT NUTZEN" ersetzt. Danach müssen beide Ergebnisse gleich sein (toBe), und youth darf nicht gleich adult sein. Den Ende-zu-Ende-Fall legst du in das bestehende describe „generateLetter im Jugendmodus“, also ohne feste Timer. Mock-Antwort ist ein Brief mit 175 Wörtern im Muster der bestehenden Tests, Aufruf ist await generateLetter(input(12, true)), geprüft wird messages[0].content. Führe die Suite aus und sieh die neuen Tests rot werden.

GREEN, in web/src/lib/generation/generateLetter.ts:
(a) Lege die neue Konstante YOUTH_PARTEI_HEADER direkt hinter FIXED_CAMPAIGN_RECIPIENT_PARTEI_HEADER an, im selben Muster wie die anderen *_PARTEI_HEADER. Zeile 1 ist exakt „PARTEI-NEUTRALITÄT (Jugendbrief):“, Zeile 2 ist exakt „Bleibe sachlich und beim Anliegen aus dem <transkript>. Verwende keine parteibezogene Werte-Sprache.“ Das ist positiv formuliert, wie es der Projektstil für Prompts vorgibt.
(b) Füge in buildSystemPrompt direkt nach dem Ende der if/else-if-Kette der Ebenen (nach dem Kommune-Zweig, vor der recipientRelation-Prüfung) einen Block `if (input.youth)` ein. Er setzt prompt = prompt.replace(BUND_PARTEI_HEADER, YOUTH_PARTEI_HEADER).replace(`\n${BUND_PARTEI_LIST}`, ""). Das ist exakt das Muster der bestehenden Zweige. So wird der vorhandene Replace-Mechanismus erweitert, ohne zweiten Template-Pfad und ohne Kopie des Templates. Auf Zweigen, die den Header schon ersetzt haben, ändert der Block nichts. Ihr Neutralitätskopf bleibt also stehen.
(c) Ergänze den JSDoc von buildSystemPrompt um einen Punkt: „Jugendmodus: Partei-Werte-Liste raus, neutrale Jugendzeile rein (nur wo der Bund-Partei-Block noch steht).“
SYSTEM_PROMPT_TEMPLATE, BUND_PARTEI_HEADER und BUND_PARTEI_LIST bleiben unverändert. Gib BUND_PARTEI_HEADER nie als abgetippten Text weiter, weil er ein weiches Trennzeichen enthält. Kein echter Mistral-Aufruf, kein Skript, kein Snapshot-Update in diesem Task.
  </action>
  <verify>
    <automated>cd web && npx jest generateLetterYouthPrompt generateLetterAdultRegression generateLetterLevelPrompt --ci && cd .. && git diff --quiet 1af62cb -- web/src/__tests__/__snapshots__/generateLetterAdultRegression.test.ts.snap && grep -c "PARTEI-NEUTRALITÄT (Jugendbrief):" web/src/lib/generation/generateLetter.ts</automated>
  </verify>
  <done>Die drei Suites laufen mit --ci grün, der neue Diff-Wächter und der Ende-zu-Ende-Fall sind grün, der Adult-Snapshot ist gegenüber 1af62cb unverändert, und „PARTEI-NEUTRALITÄT (Jugendbrief):“ kommt in generateLetter.ts genau einmal vor. Ein feat-Commit mit Scope quick-261028-cgi.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Jugend-Kurzhinweis und frei formulierter Unterrichtsprojekt-Satz im User-Prompt</name>
  <files>web/src/lib/generation/generateLetter.ts, web/src/__tests__/generateLetterYouthPrompt.test.ts, web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap</files>
  <behavior>
    - Jugend-Eingabe unter 200 Zeichen (input(8, false), Text mit 71 Zeichen): Der User-Prompt enthält einen <hinweis>-Block. Dieser Block, per Regex /<hinweis>[\s\S]*<\/hinweis>/ ausgeschnitten, enthält „konkret“ und „Erfinde keine Erlebnisse“, aber weder „Bürger“ noch „abstrakt“.
    - Jugend-Eingabe ab 200 Zeichen (issueText "Unterricht fällt bei uns oft aus. ".repeat(8), 272 Zeichen): Der User-Prompt enthält keinen „<hinweis>“.
    - Erwachsene Kurz-Eingabe ({ issueText: "Test", politicians: [mdb] }): Der User-Prompt enthält wortgleich „Der Bürger hat sich knapp gehalten. Bleibe entsprechend abstrakt“.
    - it.each mit Klassenlink: Der Block enthält „Unterrichtsprojekt“ (bestehende Assertion) und „in eigenen Worten“, aber nicht „im Rahmen“. Ohne Klassenlink fehlt „Unterrichtsprojekt“ weiterhin. Der Ankersatz „Ich gehe in die N. Klasse.“ wird weiter geprüft.
  </behavior>
  <action>
RED: Erweitere in web/src/__tests__/generateLetterYouthPrompt.test.ts den viaClassLink-Zweig im bestehenden it.each um die beiden neuen Assertions aus <behavior>. Lege ein neues describe „Kurz-Hinweis im Jugendmodus“ mit den drei Fällen aus <behavior> an. Führe die Suite einmal ohne -u aus und sieh die neuen Tests rot werden.

GREEN, in web/src/lib/generation/generateLetter.ts:
(a) Lege hinter youthBlock die Modul-Konstante YOUTH_SHORT_INPUT_HINWEIS an. Sie hat dieselbe Hülle wie der Erwachsenen-Hinweis: zwei Zeilenumbrüche, <hinweis>, Zeilenumbruch, Text, Zeilenumbruch, </hinweis>. Der Text lautet exakt: „Die schreibende Person hat sich kurz gehalten. Bleibe einfach und konkret bei dem, was im <transkript> steht. Erfinde keine Erlebnisse, keine Angaben zur Person und keine Orte dazu.“
(b) In buildUserPrompt bleibt die Bedingung `input.issueText.length < 200`. Innerhalb davon wählt `input.youth` zwischen YOUTH_SHORT_INPUT_HINWEIS und dem bisherigen Template-Literal für Erwachsene. Dieses Literal bleibt Zeichen für Zeichen stehen, du verschiebst oder umformatierst es nicht. Ergänze den Kommentar über shortInputHinweis um einen Satz: Jugendliche schreiben meist weniger als 200 Zeichen. Ihre Variante bleibt konkret beim Transkript statt abstrakt, damit sie dem Jugend-Block (eigene Beobachtungen) nicht widerspricht. Der Halluzinationsschutz bleibt.
(c) Ersetze in youthBlock den Text der viaClassLink-Zeile (Z. ~524) durch exakt: „- Erwähne beiläufig und in eigenen Worten, dass ich den Brief in einem Unterrichtsprojekt schreibe. Formuliere diesen Satz frei, damit Briefe aus derselben Klasse an dieselbe Person nicht gleich klingen.“ Die Zeile mit dem Ankersatz (Z. ~520) bleibt unverändert.

SNAPSHOTS, bewusst und nur für diese Suite: Führe cd web && npx jest generateLetterYouthPrompt -u aus. Führe -u nie für andere Suites und nie ohne Muster aus. Prüfe danach git diff auf web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap. Erwartet sind nur Änderungen in den drei Snapshots „Klassenlink true“ (Klasse 8, 10, 12), jeweils nur in der Unterrichtsprojekt-Zeile. Weicht der Diff davon ab, halte an und melde es, statt weiterzumachen.

Kein echter Mistral-Aufruf, keine UI-Änderung, der Ton-Regler bleibt außen vor.
  </action>
  <verify>
    <automated>cd web && npx jest generateLetterYouthPrompt generateLetterAdultRegression generateLetterLevelPrompt generateLetterVariantPrompt letterEmailYouth youthClient jungEntry --ci && npx tsc --noEmit && cd .. && git diff --quiet 1af62cb -- web/src/__tests__/__snapshots__/generateLetterAdultRegression.test.ts.snap web/src/__tests__/__snapshots__/letterEmailAdultSnapshot.test.ts.snap && ! grep -q "Rahmen eines Unterrichtsprojekts" web/src/lib/generation/generateLetter.ts web/src/__tests__/__snapshots__/generateLetterYouthPrompt.test.ts.snap && test "$(grep -c 'Der Bürger hat sich knapp gehalten. Bleibe entsprechend abstrakt' web/src/lib/generation/generateLetter.ts)" = "1" && git diff --stat 1af62cb -- web/src/__tests__/__snapshots__/</automated>
  </verify>
  <done>Die sieben Suites laufen mit --ci grün und tsc ist sauber. Die Adult- und Adult-Mail-Snapshots sind gegenüber 1af62cb unverändert. git diff --stat unter web/src/__tests__/__snapshots__/ zeigt nur generateLetterYouthPrompt.test.ts.snap. Die alte Formulierung mit „im Rahmen“ ist aus Code und Jugend-Snapshot verschwunden. Der Kurz-Hinweis für Erwachsene steht genau einmal wortgleich im Code. Ein feat-Commit mit Scope quick-261028-cgi, kein Push.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client → /api/generate-letter | audience und klasse kommen vom Client. youth wird serverseitig über resolveYouthLetterContext abgeleitet. |
| Server → Mistral | Der System- und User-Prompt geht an ein externes Modell. Die Änderung betrifft nur den Prompt-Text, keine neuen Daten. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261028-cgi-01 | Tampering | buildSystemPrompt / buildUserPrompt, Prompt für Erwachsene | medium | mitigate | Alle drei Änderungen hängen an `input.youth`. Die youth-Ersetzung im System-Prompt nutzt dieselben Konstanten wie die bestehenden Zweige und ist auf neutralen Zweigen ein No-op. Die Byte-Identität sichert generateLetterAdultRegression mit --ci, ohne Snapshot-Update, plus `git diff --quiet 1af62cb` auf die Adult-Snapshots und den Diff-Wächter aus Task 1. |
| T-261028-cgi-02 | Spoofing | audience "jung" vom Client | low | accept | Wer sich als jung ausgibt, verändert nur den eigenen Brief: keine Partei-Werte, andere Kurz-Hinweise. Für Dritte und für Kosten ändert sich nichts. resolveYouthLetterContext bleibt unverändert. |
| T-261028-cgi-03 | Information Disclosure | Tests | low | mitigate | @/lib/mistral ist in allen Suites gemockt. Es gibt keine echten generateLetter-Aufrufe, keine Supabase- oder Brevo-Zugriffe und keine Nutzerdaten in Fixtures. Das schont das Mistral-Kontingent von 15 Anfragen pro Minute, das sich mit der Live-Seite teilt. |
| T-261028-cgi-SC | Tampering | npm/pip/cargo installs | low | accept | Keine Paketinstallation in diesem Plan. |
</threat_model>

<verification>
- cd web && npx jest generateLetterYouthPrompt generateLetterAdultRegression generateLetterLevelPrompt generateLetterVariantPrompt letterEmailYouth youthClient jungEntry --ci ist grün.
- cd web && npx tsc --noEmit ist sauber.
- git diff --stat 1af62cb -- web/src/__tests__/__snapshots__/ zeigt nur generateLetterYouthPrompt.test.ts.snap, mit Änderungen nur in den drei Snapshots „Klassenlink true“.
- SYSTEM_PROMPT_TEMPLATE, BUND_PARTEI_HEADER und BUND_PARTEI_LIST sind unverändert (git diff auf generateLetter.ts zeigt dort keine Zeilen).
</verification>

<success_criteria>
- Ein Jugendbrief an MdB oder MdL bekommt keine parteibezogene Werte-Sprache mehr, nur die sachliche Neutralitätszeile.
- Kurze Jugend-Eingaben bekommen einen Hinweis „konkret beim Transkript bleiben, nichts erfinden“ ohne „Bürger“ und ohne „abstrakt“.
- Der Unterrichtsprojekt-Satz ist frei formuliert und steht ohne „im Rahmen“ im Prompt. Der Ankersatz zur Klasse ist unverändert.
- Prompts für Erwachsene, /eltern und Kampagnen sind byte-identisch, belegt durch Adult-Snapshots ohne Update.
- Zwei feat-Commits mit Scope quick-261028-cgi auf main, kein Push.
</success_criteria>

<output>
Create `.planning/quick/261028-cgi-jugend-prompt-kurz-hinweis-parteiframing/261028-cgi-SUMMARY.md` when done
</output>
