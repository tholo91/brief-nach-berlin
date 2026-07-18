<!-- code-tasks:ai-ready-header -->
# Captured Ideas - tholo91

> **Instructions for AI Agents (read this first, every session):**
>
> 1. This file is managed by [code-tasks](https://github.com/tholo91/code-tasks). Tasks between the `managed-start` and `managed-end` markers are auto-generated. Never edit them by hand.
> 2. **First action every session:** scan the managed block for unchecked items (`- [ ]`). Print them back to the user **grouped by priority** (🔴 Important first, then ⚪ Normal), with a one-line suggested approach per task. Then wait for direction. Do not execute silently.
> 3. **These are on-the-go captures** — quick sketches and loose thoughts typed on the go, not polished specs. If a task's intent, scope, or wording is ambiguous, **ask clarifying questions before acting**. Confirm your understanding of unclear items with the user instead of guessing.
> 4. **Decide per task:**
>    - **Trivial** (≤ 30 min, clearly bounded, no design choices) → execute, mark `- [x]`, append `[Processed by: YourAgentName]` to the task line, and add a brief note in the task body describing the change.
>    - **Non-trivial** → propose turning it into a story or quick spec. Do not implement until the user confirms scope.
> 5. Tasks use markdown checkboxes (`- [ ]` / `- [x]`). Priority: 🔴 Important or ⚪ Normal.
> 6. Never delete or reorder tasks. Only the mobile app manages task lifecycle.
> 7. You may add notes or context **below** the `managed-end` marker. They will not be overwritten.

---

<!-- code-tasks:managed-start -->

- [ ] **Per URL Parameter Partei im array forcieren** ([Created: 2026-07-01]) (Priority: ⚪ Normal) [Updated: 2026-07-07] <!-- ct:0e959a29-0711-4da2-8697-efd27f3d829a -->
  Man kann per link, den man teilt die Auswahl der Partei, sollte diese auftreten, favorisieren. Sprich, bei Brief-nach-berlin.de?fav=CDU,afd würde, sofern jemand in seiner plz eine Liste hat in der eine der beiden Parteien im Parameter dabei ist, diese nach oben ziehen und voraus wählen, wenn es bspw. Kein direktmandat gibt
  Das wäre vor allem bei Kampagnen sinnvoll, wenn diese progressive character haben und konservative Parteien erreichen wollen

- [x] **Neuer test** ([Created: 2026-06-11]) (Priority: 🔴 Important) [Updated: 2026-06-13] [Completed: 2026-06-26] <!-- ct:6b935f4c-2750-4188-81cf-c50d8edf5555 -->

- [x] **UI: in list view kleines Kalender icon anzeigen** ([Created: 2026-04-11]) (Priority: ⚪ Normal) [Completed: 2026-06-13] <!-- ct:99697a5e-a573-40af-8e5a-eaf51727e420 -->
  Nur wenn man einen Kalender link hinterlegt hat

- [x] **Kläre value proposition / 3 steps** ([Created: 2026-04-11]) (Priority: 🔴 Important) [Completed: 2026-06-13] <!-- ct:57e42f02-e54c-45ce-bed4-1e1ffc4b965e -->
  [Archived] Du/schilderst dein Anliegen, unsere Datenschutz konform KI (Mistral? EU?) schreibt den vor mit besten Argumenten + du bekommst den per Mail

- [x] **Landing page design verbessern** ([Created: 2026-04-11]) (Priority: ⚪ Normal) [Updated: 2026-04-11] [Completed: 2026-06-03] <!-- ct:12527de9-c831-4fca-834a-0439d1305c39 -->
  Bislang wirkt es eher wie eine powerpoint Präsentation - Texte müssen besser werden und wir sollten auch magic mcp nutzen (teste, ob das klappt). Vielleicht better mit Gemini cli oder antigravity?

- [x] **Konkurrenz?** ([Created: 2026-03-27]) (Priority: 🔴 Important) [Completed: 2026-06-03] <!-- ct:8e49798d-a915-43f7-8e2d-a7bde00a3598 -->
  Gibt es bereits einen ähnlichen service?

- [x] **Images kreieren** ([Created: 2026-03-27]) (Priority: ⚪ Normal) [Completed: 2026-06-03] <!-- ct:11cf1cfc-742c-4e11-a238-cfb0710bb7fc -->
  Für header // ggf. unsplash?

- [x] **Default auf 1 Seite** ([Created: 2026-04-26]) (Priority: ⚪ Normal) [Completed: 2026-06-03] <!-- ct:d4e80f5f-2e0e-4b02-8e7a-a96d8c0dc20d -->
  Und checke bitte auch, ob die worteranzahl realistisch ist von 1, 1,5 oder 2 Seiten. Recherchiere dazu im Internet

- [x] **Gsd Oder lovable?** ([Created: 2026-03-27]) (Priority: ⚪ Normal) [Completed: 2026-04-08] <!-- ct:f47ca2d3-0cee-4a36-9caa-c446ff2b1444 -->
  Mit Claude prompt erstellen lassen

<!-- code-tasks:managed-end -->

## Agent Preference Notes

- 2026-06-26: Offene Captures sollen zu Sessionbeginn weiter gruppiert gelistet werden. Danach nicht automatisch auf Anweisung warten, außer der User spricht den Capture-Check ausdrücklich an.

## Spateres Produkt-To-do

- **Varianten-Flow aus Review und E-Mail schlank zusammenfuhren** (Priority: ⚪ Normal)
  - Die bestehende E-Mail und ihr CTA bleiben unverandert, da dieser Einstieg genutzt wird.
  - Im Review fuhrt „Brief uberarbeiten“ in denselben Varianten-Flow, aber mit Einstiegskontext `review`.
  - Je nach Einstieg bleibt die Seite minimal angepasst: Review-Einstieg bringt den uberarbeiteten Brief zur Review-Entscheidung zuruck; E-Mail-Einstieg behalt die heutige Tipps-/Anpassen-Seite bei.
  - Gemeinsame Messung: Quelle (`email` oder `review`) und gewahlte Anderungsart erfassen, ohne Brieftext oder personliche Anliegen zu speichern.
  - Vor Umsetzung in Supabase prufen, welche Events die heute stark genutzte E-Mail-Funktion bereits liefert.
