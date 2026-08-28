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

## Ausgearbeitetes Backlog-Item: Partei-Priorisierung über geteilte URLs

**Ausgangslage**

Der bestehende Capture „Per URL Parameter Partei im array forcieren“ soll nicht als offener Parameter `fav=CDU,afd` umgesetzt werden, wenn daraus im Open-Source-Code eine politische Präferenz des Projekts oder der Kampagnenbetreibenden ablesbar wäre. Der eigentliche Zweck ist: progressive Anliegen sollen auch Abgeordnete der politischen Mitte bzw. konservative Parteien zuverlässig erreichen können.

**Problem mit `fav=CDU,afd`**

Eine echte politische Präferenz lässt sich in Open Source nicht dauerhaft geheim halten. Versteckte Client-Logik, verschlüsselte Parameter oder Minifizierung wären nur Scheinschutz und würden Vertrauen beschädigen. Außerdem könnte ein beliebiger Link-Ersteller damit Empfänger:innen politisch beeinflussen, ohne dass Nutzer:innen die Auswahl verstehen.

**Optionen**

1. **Transparenter `fav`-Parameter**: technisch einfach und überprüfbar, aber politische Absicht und Priorisierung sind öffentlich nachvollziehbar. Nur vertretbar, wenn `fav` ausdrücklich als Kampagnenkontext dokumentiert und im UI erklärt wird.
2. **Opaque Kampagnen-ID statt Parteienliste**: URL enthält z. B. `campaign=<öffentliche-id>`; die Zuordnung zu Parteien liegt in einer kampagnenbezogenen Konfiguration. Besser für redaktionelle Kontrolle und kurze Links, aber die Zuordnung bleibt über Laufzeitverhalten, Datenbank oder API prinzipiell rekonstruierbar.
3. **Signierter, serverseitig validierter Kontext-Token**: verhindert Manipulation und begrenzt den Parameter auf veröffentlichte Kampagnen. Er versteckt politische Präferenzen jedoch nicht zuverlässig und ist für das Kernprodukt wahrscheinlich zu komplex.
4. **Kein Partei-Parameter; explizite Auswahl im Flow**: Nutzer:innen wählen selbst mehrere passende Empfänger:innen. Am transparentesten und neutralsten, aber für Kampagnen weniger bequem.

**Empfehlung für ein späteres MVP**

Option 2 als Kampagnenmechanik, kombiniert mit Option 4 als sichtbarer Nutzerkontrolle: Kampagnen teilen eine öffentliche Kampagnen-ID; die Konfiguration kann eine oder mehrere Zielparteien als „zusätzliche Ansprache“ markieren. Die UI zeigt diese Auswahl bzw. den Grund verständlich an und lässt sie ändern. Keine geheime politische Voreinstellung und kein autonomes Vorauswählen ohne sichtbare Erklärung.

**Sortier- und Routingregel**

- Zuerst entscheidet die sachliche Ebene des Anliegens: Bund → MdB, Land → MdL/Landtag, Kommune → kommunale Stelle. Eine Partei-Priorisierung darf diese Zuständigkeit niemals überstimmen.
- Innerhalb der zuständigen, nach PLZ bzw. Wahlkreis ermittelten Liste bleiben Direktmandat/Wahlkreisbezug, Datenqualität und Erreichbarkeit die primären Kriterien.
- Der Kampagnenkontext darf nur als nachgelagerter Tie-Breaker wirken: passende Zielpartei(en) nach oben, mehrere Treffer in der vom Kampagnenbetreiber begründeten Reihenfolge; keine passenden Treffer → normale neutrale Reihenfolge.
- Wenn es kein direkt zugeordnetes Mandat gibt, dürfen passende Listenabgeordnete aus derselben zuständigen Region vorgeschlagen werden. Das darf nicht zu einer bundesweiten oder landesweiten beliebigen Parteiauswahl führen.
- Nutzer:innen müssen die Empfehlung vor dem Erstellen des Briefs sehen, abwählen und weitere zuständige Abgeordnete hinzufügen können. Bei MdB und MdL gilt dieselbe Logik, aber jeweils nur innerhalb der passenden Ebene.
- Für die Kommunikationslogik gilt: progressive Anliegen können gezielt konservative bzw. bürgerliche Abgeordnete ansprechen, weil parlamentarische Wirksamkeit nicht voraussetzt, dass Empfänger:innen politisch gleich denken. Das ist ein Kampagnenziel, keine allgemeine parteipolitische Sortierregel des Produkts.

**Akzeptanzkriterien für die spätere Umsetzung**

- Keine politische Präferenz ist als globale Default-Logik im Open-Source-Code versteckt.
- Kampagnenkontext ist öffentlich erklärbar, signiert/validiert und auf erlaubte Parteien sowie zuständige Ebenen begrenzt.
- Ohne Kampagnenkontext bleibt die bestehende neutrale Reihenfolge unverändert.
- `fav` bzw. die neue Kampagnen-ID kann keine unzuständigen MdB/MdL einschleusen und keine PLZ-/Wahlkreislogik umgehen.
- Tests decken Bund/Land, Direktmandat, Listenfallback, mehrere Zielparteien, keine Treffer und manipulierte/unbekannte Parameter ab.

**Offene Produktentscheidung**

Vor Umsetzung festlegen, ob Kampagnenbetreiber die Zielparteien selbst konfigurieren dürfen oder ob Brief-nach-Berlin jede Kampagnenkonfiguration redaktionell freigibt. Empfehlung: redaktionelle Freigabe, weil die Empfängerpriorisierung politisch sensibel ist.

## Spateres Produkt-To-do

- **Varianten-Flow aus Review und E-Mail schlank zusammenfuhren** (Priority: ⚪ Normal)
  - Die bestehende E-Mail und ihr CTA bleiben unverandert, da dieser Einstieg genutzt wird.
  - Im Review fuhrt „Brief uberarbeiten“ in denselben Varianten-Flow, aber mit Einstiegskontext `review`.
  - Je nach Einstieg bleibt die Seite minimal angepasst: Review-Einstieg bringt den uberarbeiteten Brief zur Review-Entscheidung zuruck; E-Mail-Einstieg behalt die heutige Tipps-/Anpassen-Seite bei.
  - Gemeinsame Messung: Quelle (`email` oder `review`) und gewahlte Anderungsart erfassen, ohne Brieftext oder personliche Anliegen zu speichern.
  - Vor Umsetzung in Supabase prufen, welche Events die heute stark genutzte E-Mail-Funktion bereits liefert.
