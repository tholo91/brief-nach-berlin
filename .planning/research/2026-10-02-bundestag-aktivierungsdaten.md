# Bundestag-Aktivierung nach dem Brief: Informationsfahrten und Wahlkreisveranstaltungen

**Stand:** 3. Oktober 2026
**Status:** Recherche- und Entscheidungsgrundlage, noch keine Implementierung
**Scope:** zunächst nur Bundestag/MdB; Landtag und Kommune bleiben als spätere Erweiterung offen

**Technische Vertiefung:** Die am 2. Oktober 2026 ausgeführte MdB-Quellenstichprobe, Mailketten-Prüfung und Variantenbewertung stehen in [Bundestag-Aktivierung: Mailaufteilung, Datenqualität und Pilot](./2026-10-02-bundestag-aktivierung-naechste-schritte.md). Diese Notiz hält den Produkt- und Entscheidungsrahmen; die Vertiefung dokumentiert konkrete Quellen- und Fehlerfälle.

## Ziel

Die Follow-up-Mail soll nach dem Brief nicht nur Bewertung und Spende abfragen, sondern eine konkrete nächste Handlung anbieten:

1. eine mögliche geförderte Informationsfahrt über das zuständige MdB;
2. möglichst einen oder zwei kommende Termine im Wahlkreis dieses MdB.

Die Qualität der Veranstaltungsdaten ist dabei wichtiger als eine große Abdeckung. Ein veralteter oder falscher Termin beschädigt Vertrauen stärker, als ein fehlender Termin.

## Entscheidungsrahmen

Der Bundestag-Pilot testet nicht, ob sich möglichst viele politische Angebote auflisten lassen. Er testet eine engere Produktthese:

> Wenn eine Person den Versand ihres Briefs **selbst bestätigt** hat und danach **genau einen** konkreten, empfängerbezogenen nächsten Schritt erhält, steigt die Wahrscheinlichkeit einer weiteren politischen Handlung.

Daraus folgt eine feste Reihenfolge:

```text
Brief wirklich versendet?
        ├─ nein / noch nicht → genau ein Schritt: Brief fertigstellen und versenden
        └─ ja              → genau ein Schritt mit Bezug zum angeschriebenen MdB
```

Ein Linkkatalog aus Ehrenamt, Partei, Demonstration, Petition, Besuch und Veranstaltung würde den eigentlichen Test verwässern. Im Pilot wird deshalb pro Person und Ansicht nur **eine primäre Handlung** empfohlen.

In dieser Notiz gilt:

- **Verifiziert:** durch eine aktuelle offizielle oder wissenschaftliche Primärquelle belegt.
- **Produktinferenz:** aus verifizierten Fakten abgeleitete Gestaltungsentscheidung, aber selbst nicht empirisch belegt.
- **Hypothese:** muss im Pilot gegen tatsächliches Verhalten getestet werden.

## Verifizierte Fakten

### Allgemeine Besuche im Deutschen Bundestag

Der Bundestag bietet eine zentrale Besucherinformation und Online-Anmeldung für kostenlose Besuche, Plenarsitzungen, Informationsvorträge, Führungen sowie Kuppel- und Dachterrassenbesuche an. Für alle Angebote ist eine vorherige Anmeldung erforderlich; wegen begrenzter Plätze können Anfragen abgelehnt werden.

- [Informationen für Besucher](https://www.bundestag.de/besuche/hinweise)
- [Aktuelle Informationen zum Besuch beim Deutschen Bundestag](https://www.bundestag.de/besuche/hinweise/aktuelles-1058424)
- [Online-Anmeldung](https://www.bundestag.de/besuche/formular-249314)

Das ist eine stabile, zentrale Fallback-Empfehlung für jede Person. Es ist aber keine personalisierte Wahlkreisveranstaltung und keine Zusage für eine kostenlose Anreise.

### Geförderte Informationsfahrten über ein MdB

Besuchergruppen von mindestens zehn Personen können von einem MdB zu einem Plenar- oder Informationsbesuch eingeladen werden. Die Einladung läuft über das MdB beziehungsweise das Wahlkreisbüro; Plätze sind begrenzt.

Eine Bundestagsmeldung vom 12. Februar 2025 beschreibt außerdem das dahinterliegende Informationsfahrten-Programm: Das Presse- und Informationsamt der Bundesregierung organisiert die Fahrten und trägt die Kosten. MdBs können bis zu drei Besuchergruppen mit jeweils bis zu 50 Personen aus ihrem Wahlkreis pro Jahr einladen. Auswahl und Einladung der Teilnehmenden erfolgen durch die Abgeordneten und ihre Büros.

- [Besuch auf Einladung eines Abgeordneten](https://www.bundestag.de/besuche/fuehrung/besuchaufeinladungeinesabgeordneten)
- [Bundestagsmeldung zu Informationsfahrten nach Berlin](https://www.bundestag.de/presse/hib/kurzmeldungen-1050032)

Für Brief-nach-Berlin darf daraus nicht pauschal „dein MdB bietet jetzt eine kostenlose Reise an“ werden. Korrekt wäre:

> Dein MdB kann Menschen aus dem Wahlkreis zu einer geförderten Informationsfahrt nach Berlin einladen. Frag im Wahlkreisbüro nach, ob aktuell Plätze oder eine Warteliste verfügbar sind.

### Wahlkreisveranstaltungen

Es gibt keine erkennbare zentrale, bundesweit einheitliche Veranstaltungs-API für Wahlkreisveranstaltungen der MdBs. Die offiziellen Bundestagsdaten stellen vor allem Abgeordneten-, Dokument- und Parlamentsdaten bereit, nicht die individuellen Veranstaltungskalender der Wahlkreisbüros.

Die Bundestagsseiten verweisen bei Besuchen ausdrücklich auf das jeweilige MdB oder Wahlkreisbüro. Konkrete Termine liegen typischerweise auf:

- der offiziellen MdB-Seite beim Bundestag;
- der persönlichen Website des MdB;
- der Website des Wahlkreisbüros;
- offiziellen Social-Media-Kanälen oder Veranstaltungsseiten des MdB.

Das ist eine Recherche-Einschätzung, keine Behauptung, dass es für einzelne MdBs oder Parteien keine Kalender-, ICS-, RSS- oder JSON-Schnittstellen gibt. Genau diese Heterogenität muss ein separater Quellencheck prüfen.

### Empfängerbezug und Bürgersprechstunden

**Verifiziert:** Der Bundestag verweist für die Suche nach dem zuständigen MdB auf seine Wahlkreissuche. Die offiziellen Biografieseiten enthalten Kontaktmöglichkeiten und Links zur persönlichen Website. In seiner Abgeordneten-FAQ beschreibt der Bundestag Bürgersprechstunden ausdrücklich als Teil der Arbeit im Wahlkreis. Konkrete Angaben zum Wahlkreisbüro müssen anschließend auf der persönlichen beziehungsweise offiziellen Büroseite des MdB geprüft werden.

- [Abgeordneten-FAQ des Deutschen Bundestages](https://www.bundestag.de/services/faq/abgeordnete-244894)
- [Abgeordnete des Deutschen Bundestages](https://www.bundestag.de/abgeordnete)

**Produktinferenz:** Der Anschluss an das bereits angeschriebene MdB ist für den Pilot kohärenter als eine allgemeine Ehrenamts- oder Aktionssuche. Eine konkrete, aktuell belegte Bürgersprechstunde ist die erste Wahl. Fehlt ein geprüfter Termin, ist die direkte Anfrage beim offiziellen Wahlkreisbüro der belastbarere Fallback als ein thematisch nur ungefähr passender Fremdlink.

### Petitionen als spätere Option

**Verifiziert:** Im offiziellen Petitionsportal können Menschen Petitionen einreichen, diskutieren und mitzeichnen. Eine öffentliche Petition muss in die Zuständigkeit des Petitionsausschusses fallen und ein Anliegen von allgemeinem Interesse betreffen; die Mitzeichnungsfrist beträgt sechs Wochen.

- [Petitionsportal des Deutschen Bundestages](https://epetitionen.bundestag.de/)
- [Verfahrensgrundsätze des Petitionsausschusses](https://www.bundestag.de/ausschuesse/ausschuesse/a02_Petitionsausschuss/verfahrensgrundsaetze-1075826)

**Produktinferenz:** Eine Petition ist erst nach Empfängerbezug, Bürgersprechstunde und Informationsfahrt sinnvoll. Sie darf nur empfohlen werden, wenn Zuständigkeit, Themenpassung, Laufzeit und offizieller Status manuell oder deterministisch geprüft sind. Eine bloße Stichwortähnlichkeit zum Anliegen reicht nicht.

## Evidenzgrenze: Aktivierung ist noch eine Hypothese

**Verifiziert:** Die OECD unterscheidet zwei Dimensionen politischer Selbstwirksamkeit:

- **intern:** die eigene wahrgenommene Fähigkeit, politische Prozesse zu verstehen und sich daran zu beteiligen;
- **extern:** die Wahrnehmung, dass das politische System beziehungsweise politische Institutionen für die Anliegen von Menschen ansprechbar sind.

Die OECD berichtet Zusammenhänge zwischen politischer Selbstwirksamkeit und Beteiligung. Das belegt jedoch nicht, dass ein Brief oder eine anschließende Empfehlung diese Selbstwirksamkeit kausal erhöht.

- [OECD: Internal and external political efficacy](https://www.oecd.org/en/publications/2021/07/government-at-a-glance-2021_70df9612/full-report/component-77.html)
- [GESIS: Political Efficacy Kurzskala (PEKS)](https://zis.gesis.org/s/skala/Beierlein-Kemper-Kovaleva-Rammstedt-Political-Efficacy-Kurzskala-%28PEKS%29)

**Einordnung des aktuellen Produkts:** Die bestehende Frage „Fühlst du dich durch diesen Brief eher in der Lage, dich politisch einzubringen?“ ([`FeedbackForm.tsx`](<../../web/src/app/(site)/feedback/FeedbackForm.tsx>)) erfasst am ehesten eine Selbstauskunft zur **internen** Selbstwirksamkeit. Sie misst weder institutionelle Responsivität noch eine tatsächlich ausgeführte Folgehandlung. Auch „Ja, geht raus“ fasst bereits verschickte und unmittelbar geplante Briefe zusammen und ist kein Versandnachweis.

**Hypothesen für den Pilot:**

1. Ein einzelner empfängerbezogener Schritt erzeugt mehr tatsächliche Folgehandlungen als der heutige Ablauf ohne Aktivierungsangebot.
2. Das Ausführen dieses Schritts kann interne Selbstwirksamkeit stärken.
3. Eine reale, als responsiv erlebte Begegnung oder Antwort kann externe Selbstwirksamkeit stärken.

Ein Klick zeigt nur Interesse. Als Aktivierung zählen erst selbst berichtete oder anderweitig belastbar bestätigte Handlungen wie „Wahlkreisbüro kontaktiert“, „Bürgersprechstunde angefragt/gebucht“ oder „Informationsfahrt angefragt“. Aussagen wie „Brief-nach-Berlin aktiviert Menschen“ bleiben bis zu einem kontrollierten Pilot eine Hypothese.

## Produktentscheidung für den ersten Pilot

Die Follow-up-Strecke soll weiterhin drei Funktionen erfüllen, aber nicht als drei gleichwertige Handlungsangebote in einer Mail:

1. **Bewerten:** Hat die Person den Brief abgeschrieben, verschickt und eine Reaktion erhalten?
2. **Weitergehen:** Nur nach bestätigtem Versand genau einen geprüften, empfängerbezogenen Schritt zeigen.
3. **Unterstützen:** Spendenhinweis für Brief-nach-Berlin.

Die bestehende Follow-up-Mail enthält bereits Bewertung, Spende, Teilen und Social Links ([`buildFollowupHtml.ts`](../../web/src/lib/email/buildFollowupHtml.ts)). Ein weiterer gleichrangiger Empfehlungsblock würde die Mail überladen. Der Pilot nutzt deshalb die vorhandene Feedback-Strecke als Weiche:

```text
Follow-up-Mail: Bewertung bleibt primär
        ↓
Feedback: „Brief bereits wirklich versendet?“
        ├─ nein → Brief abschließen/verbessern und versenden
        └─ ja   → Danke-Zustand oder /mitmachen: genau eine Empfehlung
Spende und Teilen bleiben nachgeordnet
```

Für die Versand-Weiche sollte „Bereits verschickt“ von „verschicke ich gleich“ getrennt werden. Nur der bestätigte Versand öffnet das Aktivierungsangebot; sonst bleibt der nächste Schritt der Versand selbst.

### Prioritätslogik für genau eine Empfehlung

1. **Konkreter Termin mit dem angeschriebenen MdB:** geprüfte Bürgersprechstunde oder Wahlkreisveranstaltung.
2. **Direkter Kontakt zum angeschriebenen MdB:** offizielle Seite beziehungsweise Wahlkreisbüro mit der konkreten Aufforderung, nach einer Bürgersprechstunde zu fragen.
3. **Geförderte Informationsfahrt:** beim Wahlkreisbüro des angeschriebenen MdB nach Platz oder Warteliste fragen.
4. **Petition:** erst in einer späteren Ausbaustufe und nur bei offiziell geprüfter Themen- und Zuständigkeitspassung.

Partei-Einstieg und Demonstrationstermine sind **nicht Teil dieses Bundestagspiloten**. Beides erhöht Neutralitäts-, Aktualitäts- und Profiling-Risiken, ohne die Kernhypothese des empfängerbezogenen Anschlusses sauberer zu testen. Allgemeines Ehrenamt kann später ein eigener Test sein, gehört aber nicht in diesen Pilot.

Die vorgeplante Follow-up-Mail enthält keinen konkreten, veränderlichen Termin. Sie verwendet nur einen stabilen CTA wie „Kontakt und nächste Möglichkeiten ansehen“. Termin, Status und Prüfdatum erscheinen erst auf der beim Öffnen aktuellen `/mitmachen`-Seite.

Auf der verlinkten Seite für ein MdB mit geprüftem Termin:

> **Dein nächster Schritt**
>
> Am [Datum] lädt [Name] um [Uhrzeit] nach [Ort] ein. Hier findest du Details und die Anmeldung.
>
> Stand: [Prüfdatum] · Quelle: offizielle Seite von [Name]

Für ein MdB ohne geprüften Termin:

> **Dein nächster Schritt**
>
> Dein Brief war der erste Schritt. Auf der offiziellen Seite deines MdB findest du aktuelle Bürgersprechstunden, Wahlkreisveranstaltungen und die Kontaktdaten des Wahlkreisbüros. Dort kannst du auch nach einer geförderten Informationsfahrt nach Berlin fragen.

Für Briefe an Landtag oder Kommune sollte zunächst kein MdB-Termin als persönliche Empfehlung erscheinen. Die zentrale Bundestagsbesuchsseite kann dort höchstens als allgemeiner Zusatz „Bundestag kennenlernen“ auftauchen. Eine konkrete Veranstaltung muss zur adressierten politischen Ebene passen.

## Qualitätsmodell für Veranstaltungsdaten

Ein Termin darf nur erscheinen, wenn alle Pflichtfelder vorhanden sind:

```ts
type BundestagOpportunity = {
  politicianId: number;
  wahlkreisId: number;
  opportunityType: "constituency_event" | "information_trip";
  title: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  onlineUrl?: string;
  registrationUrl?: string;
  eventStatus: "scheduled" | "cancelled";
  registrationStatus: "open" | "waitlist" | "full" | "closed" | "unknown";
  eligibilityNote?: string;
  costNote?: string;
  sourceUrl: string;
  sourceType: "bundestag" | "official_mdb_site" | "official_office_site";
  verifiedAt: string;
  expiresAt?: string;
};
```

### Veröffentlichungsgates

- Die Quelle muss offiziell sein.
- Datum und Uhrzeit müssen eindeutig sein.
- Ort oder Online-Link müssen vorhanden sein.
- `verifiedAt` darf bei einem nahen Termin höchstens 48 Stunden alt sein.
- Abgelaufene und abgesagte Termine werden nicht angezeigt.
- Ausgebuchte oder geschlossene Angebote werden nicht als Handlung empfohlen; eine ausdrücklich angebotene Warteliste darf angezeigt werden.
- Eine Veranstaltung wird höchstens einmal pro MdB und Zeitraum angezeigt.
- Ohne geprüften Termin wird der stabile offizielle Profil-/Kontaktlink gezeigt.
- Auf der aktuellen `/mitmachen`-Seite werden Quelle und Prüfdatum angezeigt; die vorgeplante E-Mail enthält keine eingefrorene Terminzusage.

### Quellenpriorität

1. Offizielle Bundestagsseite oder offizieller Bundestagsbesucherdienst.
2. Offizielle Website des MdB oder Wahlkreisbüros.
3. Offizieller Social-Media-Account nur als Einstieg zu einer überprüfbaren Detailseite.
4. Keine Drittanbieter-Kalender als alleinige Veröffentlichungsquelle.

## Technischer Vorschlag

### Phase 0: stabile Links ohne Veranstaltungsdaten

Für den nach bestätigtem Versand freigeschalteten Aktivierungsschritt stehen folgende offizielle Ziele zur Verfügung, von denen nach der obigen Prioritätslogik **genau eines** ausgespielt wird:

- Link zur offiziellen MdB-Seite beziehungsweise zum Wahlkreisbüro;
- Link zur zentralen Bundestagsbesuchsseite;
- kurzer Hinweis auf die geförderten Informationsfahrten und die direkte Anfrage beim Wahlkreisbüro.

Das ist ohne neue Veranstaltungsdaten umsetzbar. Als Phase-0-Standard sollte der Link zum offiziellen Wahlkreisbüro mit der Aufforderung dienen, nach einer Bürgersprechstunde zu fragen; die Informationsfahrt ist der Fallback.

Im aktuellen Repository existieren bereits PLZ, MdB, Wahlkreis und offizielle Bundestagsprofil-/Wahlkreisbüro-Daten. Die relevante E-Mail-Logik liegt in:

- [`web/src/lib/email/buildFollowupHtml.ts`](../../web/src/lib/email/buildFollowupHtml.ts)
- [`web/src/lib/email/sendFollowupEmail.ts`](../../web/src/lib/email/sendFollowupEmail.ts)
- [`web/data/constituency-offices.csv`](../../web/data/constituency-offices.csv)

### Phase 1: manuell verifizierter Pilot

Für zunächst 10–20 Wahlkreise wird eine kleine normalisierte Datenquelle gepflegt, zum Beispiel als JSON oder öffentliche Supabase-Tabelle. Jeder Datensatz braucht `sourceUrl`, `verifiedAt` und einen klaren Ablaufzeitpunkt.

Die Follow-up-Mail sollte keinen dynamischen Termin als dauerhaft gültige Wahrheit enthalten. Sie verlinkt mit einem stabilen CTA auf eine kleine `/mitmachen`-Seite, die beim Öffnen den aktuellen, freigegebenen Stand zeigt.

### Phase 2: deterministische Quellen-Adapter

Erst wenn der Pilot zeigt, dass Nutzer:innen diese Hinweise tatsächlich öffnen oder nutzen, lohnen sich automatisierte Adapter:

- offizielle Bundestagsseiten auslesen;
- persönliche MdB-Seiten prüfen;
- JSON-LD, ICS, RSS oder eingebettete Kalender erkennen;
- Änderungen und Absagen speichern;
- Quelle und Prüfdaten sichtbar halten.

Ein Sprachmodell sollte dabei nicht der Crawler sein. Die Reihenfolge sollte sein:

```text
HTTP-Fetch / offizieller API-Call
        ↓
HTML-, JSON-LD-, ICS- oder RSS-Parser
        ↓
Schema- und Plausibilitätsprüfung
        ↓
optional Mistral zur Extraktion uneinheitlicher Freitexte
        ↓
Quellenprüfung / Freigabe
        ↓
Anzeige in Mail und /mitmachen
```

Mistral kann bei schwer strukturierten offiziellen Seiten helfen, sollte aber nicht eigenständig entscheiden, ob ein Termin aktuell, offiziell oder abgesagt ist.

### Datenschutz

Die Veranstaltungsdaten selbst sind öffentlich. Trotzdem dürfen E-Mail-Adresse, Anliegen und Feedback-Token nicht in Veranstaltungs-URLs landen. Für die personalisierte `/mitmachen`-Seite sollten nur die erforderlichen öffentlichen IDs oder ein eigener datensparsamer, kurzlebiger Signatur-Token verwendet werden.

**Verifiziert:** Politische Meinungen sind nach Art. 9 DSGVO eine besondere Kategorie personenbezogener Daten. Art. 5 DSGVO verlangt Zweckbindung und Datenminimierung.

- [DSGVO bei EUR-Lex, insbesondere Art. 5 und Art. 9](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679)
- [EDPB: Special categories of personal data](https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en)

**Produkt- und Datenschutzgrenze für den Pilot:**

- Keine Parteipräferenz aus Anliegen, ausgewähltem MdB, Klicks oder Empfehlung ableiten.
- Keine Partei-, Demonstrations- oder Organisationszugehörigkeit empfehlen.
- Phase 0 und 1 brauchen nur die öffentliche Empfänger-/Bürozuordnung; Anliegen-Volltext und Themenkategorie werden für diesen Pilot nicht verwendet.
- PLZ oder Themenkategorie erst in einer späteren thematischen Erweiterung verwenden, wenn die Person dies auf der verlinkten Seite ausdrücklich auswählt; keine stille Zweckausweitung aus dem Briefprozess.
- Weder Roh-Anliegen noch politische Kategorie, PLZ, E-Mail oder Feedback-Token in ausgehende URLs, Analytics-Events oder Drittanbieter-Logs schreiben.
- Für alle Parteien dieselbe Quellen- und Prioritätslogik anwenden. Empfohlen wird der institutionelle Anschluss an den bereits gewählten Empfänger, keine ideologische Nähe.

Vor einer Implementierung ist die konkrete Rechtsgrundlage und Datenschutzerklärung für neue Messereignisse separat zu prüfen. Die obigen Regeln ersetzen keine Datenschutzprüfung.

## Pilot und Erfolgsmessung

Der Pilot sollte nur Personen einschließen, die bestätigen, dass ihr Brief bereits versendet wurde. Idealerweise wird unter diesen Personen zufällig zwischen Aktivierungsangebot und bestehendem Ablauf ohne Angebot aufgeteilt; sonst lassen sich Selbstselektion und Wirkung kaum trennen.

### Messhierarchie

1. **Primär: tatsächliche Folgehandlung** – Anteil der Berechtigten, die innerhalb eines festgelegten Fensters (Vorschlag: 14 Tage) „Wahlkreisbüro kontaktiert“, „Termin angefragt/gebucht“ oder „Informationsfahrt angefragt“ bestätigen.
2. **Sekundär: Beginn der Handlung** – Aufruf der einen empfohlenen Aktion; ein Klick allein ist kein Aktivierungsnachweis.
3. **Explorativ: interne Selbstwirksamkeit** – dieselbe kurze Frage vor der Empfehlung und nach dem Messfenster; nur Veränderung und Gruppenunterschied gemeinsam interpretieren.
4. **Explorativ: externe Selbstwirksamkeit** – getrennte Frage, ob die Person MdB/Büro als ansprechbar erlebt hat; nicht mit der internen Dimension vermischen.
5. **Guardrails:** Abmeldung/Beschwerde, veralteter oder falscher Termin, nicht erreichbares Wahlkreisbüro, Abbruch vor dem Ziel.

Nur für den Pilot erforderliche Ereignisse speichern: Pilotgruppe, Empfehlungsart, Opportunity-ID beziehungsweise offizielle `sourceUrl`, `verifiedAt`, Aktionsbeginn und freiwillige Abschlussbestätigung. Kein Roh-Anliegen und kein daraus abgeleitetes politisches Profil. Wenn eine erneute Befragung eine zusätzliche E-Mail erfordern würde, braucht diese vorab eine bewusste Produkt- und Datenschutzentscheidung; sie darf nicht still in den bestehenden Einmal-Mailfluss eingebaut werden.

**Erfolgskriterium vor dem Start festlegen:** Der Pilot gilt nicht wegen hoher Klickrate als erfolgreich, sondern nur bei einer vorher definierten Mindestzahl beziehungsweise Quote bestätigter Folgehandlungen und ohne auffällige Trust-/Datenschutz-Guardrails. Bei kleinen Fallzahlen werden Konfidenzintervalle und qualitative Rückmeldungen berichtet statt einer überzogenen Wirkungsbehauptung.

## Verbleibende offene Fragen

Die technische Vertiefung hat bereits eine heterogene MdB-Stichprobe geprüft, keine zentrale Veranstaltungs-API gefunden und kuratiertes JSON als leanen Pilot empfohlen. Offen bleiben:

1. Wie häufig ändern, löschen oder korrigieren die ausgewählten Wahlkreisbüros konkrete Termine bei wiederholter Beobachtung?
2. Welche robots.txt-, Nutzungs- und Zugriffsvorgaben gelten für jeden später automatisierten Quellenadapter?
3. Wie wird die Identität zwischen Abgeordnetenwatch-, Bundestags- und lokalen Büro-IDs dauerhaft geprüft?
4. Welche einzelne Folgehandlung und welches 14-Tage-Erfolgskriterium werden vor Pilotstart verbindlich festgelegt?
5. Kann die freiwillige Abschlussbestätigung ohne zusätzliche E-Mail erhoben werden, oder braucht es dafür eine gesonderte Einwilligung?
6. Reicht versioniertes JSON im realen Redaktionsablauf aus, oder rechtfertigt die Pflegefrequenz später eine abgesicherte Supabase-Tabelle?

## Reproduzierbarer Vertiefungs-Prompt

```text
Arbeite als technische:r Researcher für Brief-nach-Berlin. Untersuche ausschließlich die Bundestagsebene und kläre, wie wir zwei Arten von nächsten Schritten für Nutzer:innen zuverlässig und dauerhaft mit Daten versorgen können:

1. Geförderte Informationsfahrten nach Berlin über ein zuständiges MdB beziehungsweise Wahlkreisbüro.
2. Die nächsten ein oder zwei Wahlkreisveranstaltungen des zuständigen MdB.

Produktkontext:
- Brief-nach-Berlin erhält bereits PLZ, ausgewähltes MdB, Wahlkreis, politische Ebene und E-Mail-Adresse.
- Nach dem Brief gibt es eine automatische Follow-up-Mail nach ungefähr drei Tagen.
- Diese Mail soll Bewertung, nächsten politischen Handlungsschritt und Spendenhinweis verbinden.
- Vor einer Anschluss-Empfehlung muss geklärt sein, ob der Brief bereits tatsächlich versendet wurde; eine bloße Versandabsicht reicht nicht.
- Pro Person und Ansicht wird genau eine primäre Folgehandlung gezeigt, kein Linkkatalog.
- Priorität: angeschriebenes MdB/Bürgersprechstunde → Wahlkreisbüro → Informationsfahrt; Petitionen erst später bei geprüfter Passung.
- Partei-Einstieg, Demonstrationen und allgemeines Ehrenamt gehören nicht in diesen Bundestagspiloten.
- Ein konkreter Termin darf nur angezeigt werden, wenn Quelle, Datum, Ort und Aktualität belastbar sind.
- Falsche oder veraltete Veranstaltungen sind schlimmer als keine Veranstaltung.
- Für Briefe an Landtag und Kommune geht es in diesem Research-Schritt nur um einen möglichen allgemeinen Hinweis auf Bundestagsbesuche; keine falsche persönliche Zuordnung zu einem MdB herstellen.

Zu untersuchende Quellen:
- bundestag.de/besuche
- bundestag.de/abgeordnete
- bundestag.de/services/opendata
- bundestag.de/presse
- offizielle Bundestagsprofile und Wahlkreisbüro-Links der MdBs
- offizielle persönliche MdB-Websites
- offizielle MdB-Veranstaltungsseiten
- offizielle Social-Media-Profile nur ergänzend
- bundespresseamt.de, sofern dort Primärinformationen zu den Informationsfahrten liegen

Untersuche eine repräsentative Stichprobe von mindestens sechs aktuell amtierenden MdBs aus unterschiedlichen Bundesländern, Parteien und Website-Systemen. Nimm mindestens ein MdB aus Bremen oder Norddeutschland auf. Verwende nur aktuell verifizierte Quellen und notiere das Prüfdatum.

Für jede gefundene Quelle prüfe:
- Gibt es eine offizielle API?
- Gibt es JSON, JSON-LD, ICS, RSS, Sitemap oder einen stabilen HTML-Endpunkt?
- Gibt es Pagination, Rate Limits, robots.txt, Nutzungsbedingungen oder andere Crawl-Grenzen?
- Welche Felder können zuverlässig extrahiert werden: Titel, Datum, Uhrzeit, Ort, Anmeldung, Absage/Änderung?
- Wie häufig ändern sich Termine?
- Ist die Quelle für automatisierte regelmäßige Prüfung geeignet?
- Kann die Information rechtssicher und transparent mit Quellenlink angezeigt werden?

Bewerte ausdrücklich diese technischen Varianten:
1. zentrale offizielle API;
2. regelmäßiger serverseitiger Fetch offizieller Seiten;
3. Live-Abfrage erst beim Öffnen einer Nutzerseite;
4. kuratierte Datenbank mit manueller Prüfung;
5. Hybrid aus kuratierten Daten, deterministischen Parsern und optionaler Mistral-Extraktion.

Wichtig zur Mistral-Frage:
- Prüfe, ob Mistral überhaupt als Crawler/Browser geeignet ist.
- Trenne HTTP-Fetch und Datenbeschaffung klar von Modell-gestützter Extraktion.
- Empfiehl Mistral nur dort, wo es einen konkreten Mehrwert gegenüber Parsern gibt.
- Beschreibe, wie wir Halluzinationen, veraltete Termine, abgesagte Termine und falsche Ortszuordnungen verhindern.

Erstelle als Ergebnis:

1. Ein klares Kurzurteil: zentrale Datenquelle ja/nein, API ja/nein, Live-Crawling nötig ja/nein.
2. Eine Quellenmatrix mit URL, Betreiber, Datenformat, Zugriff, Aktualität, Stabilität und rechtlichen/technischen Risiken.
3. Eine belastbare Empfehlung für einen schlanken Bundestag-MVP.
4. Ein konkretes Datenmodell für eine Veranstaltung inklusive sourceUrl, sourceType, verifiedAt und expiresAt.
5. Einen Aktualisierungs- und Qualitätsprozess mit konkreten Fristen.
6. Eine Empfehlung, was in die Follow-up-Mail darf und was nur auf eine aktuelle /mitmachen-Seite gehört.
7. Eine grobe Aufwandsschätzung für MVP, kuratierten Pilot und automatische bundesweite Abdeckung.
8. Eine Liste offener Fragen, die ich mit Franziska oder einzelnen Wahlkreisbüros klären sollte.
9. Einen Pilot-Messplan, der tatsächliche Folgehandlungen von Klicks sowie interne von externer Selbstwirksamkeit trennt.

Arbeitsregeln:
- Keine Implementierung und keine Änderungen im Repository.
- Keine Kontaktaufnahme, kein Versand und keine Anmeldung bei externen Diensten.
- Keine Behauptung als Fakt darstellen, wenn sie nur aus einem einzelnen unbestätigten Kalender stammt.
- Primärquellen direkt verlinken.
- Zwischen verifiziertem Fakt, begründeter Inferenz und offener Frage unterscheiden.
- Am Ende eine einzige klare Empfehlung aussprechen.
```

## Vorläufige Empfehlung

Für den ersten Test: **Nach bestätigtem Briefversand genau einen empfängerbezogenen Schritt zeigen: eine manuell geprüfte Bürgersprechstunde, sonst die direkte Anfrage beim offiziellen Wahlkreisbüro, danach eine Informationsfahrt als Fallback.** Petitionen folgen erst bei geprüfter Themenpassung; Partei und Demonstrationen bleiben außerhalb dieses Piloten.

Keine bundesweite Live-Scraping-Infrastruktur bauen, bevor nicht anhand bestätigter Folgehandlungen – nicht nur Klicks – belegt ist, dass Nutzer:innen diesen nächsten Schritt tatsächlich annehmen. Die technische Zielarchitektur sollte Fetch/Parser, Qualitätsprüfung, Quellenlink und Aktualitätsdatum trennen. Mistral gehört höchstens in die Extraktionsstufe, nicht an die Stelle der Quelle.
