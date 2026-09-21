# TODO: Interne Stats-Seite aussagekräftiger machen

Status: umgesetzt (alle Punkte außer dem Abschnitt „Später: wirklich fehlende Wirkungsdaten")  
Route: `/stats`  
Ziel: Zahlen schneller einordnen können, ohne aus Selbstauskünften oder kleinen Stichproben zu starke Wirkungsbehauptungen abzuleiten.

## Festgelegte Richtung

- [x] In der oberen Seiten-Navigation einen globalen Umschalter ergänzen: `Prozentual | Absolut`.
- [x] Der Umschalter verändert die Hervorhebung auf der ganzen Seite, soweit beide Darstellungen fachlich sinnvoll sind.
- [x] In der prozentualen Ansicht steht der Anteil groß und die absolute Basis klein daneben oder darunter.
- [x] In der absoluten Ansicht steht die Anzahl groß und der Anteil klein daneben oder darunter.
- [x] Kennzahlen ohne sinnvollen Gegenwert bleiben unverändert, zum Beispiel die Gesamtzahl erzeugter Briefe und die Durchschnittsbewertung.
- [x] Nenner und fehlende Antworten bleiben in beiden Ansichten sichtbar. Der Umschalter darf keine Daten ausblenden.
- [x] Die Auswahl gilt nur für die aktuelle Ansicht; keine neue Analyse-, Tracking- oder Cookie-Speicherung einführen.

## Priorität 1: Kontext und Vergleichbarkeit

- [x] Oben eine kompakte Filterleiste vorsehen:
  - Zeitraum: `30 Tage | 90 Tage | Gesamt`
  - Quelle: `Alle | Freie Anliegen | Kampagnen`
  - bei `Kampagnen` optional eine einzelne Kampagne auswählen
  - Ansicht: `Prozentual | Absolut`
- [x] Deutlich zeigen, wenn Kampagnen die Verteilung dominieren. Die Themenverteilung darf nicht wie ein allgemeines Stimmungsbild wirken.
- [x] Jede zentrale Quote nach dem Muster `224 von 269 Antworten (83,3 %)` ausgeben.
- [x] Fehlende Antworten separat zeigen und niemals als negative Antworten werten.
- [x] Erhebungszeitraum und Datenbasis direkt im jeweiligen Abschnitt nennen, nicht nur im Seiten-Footer.

## Priorität 2: Seitenstruktur

- [x] Den Einstieg auf vier Kernwerte reduzieren:
  - erfolgreiche Brief-Erstellungen
  - durchschnittliche Bewertung mit Anzahl der Bewertungen
  - positives Versandsignal mit beantworteten und fehlenden Angaben
  - wahrgenommene politische Handlungsfähigkeit mit `Ja / Nein / Unsicher`
- [x] Einen Funnel ergänzen: `Brief erstellt → Bewertung → vollständiges Feedback → Versandfrage beantwortet → positives Versandsignal`.
- [x] Funnel-Stufen nur dann prozentual gegeneinander stellen, wenn ihre Erhebungszeiträume und Grundgesamtheiten wirklich vergleichbar sind.
- [x] Reihenfolge der Detailbereiche:
  1. Entwicklung im Zeitverlauf
  2. Themen und politische Ebene
  3. Bewertung und Versandsignal
  4. politische Handlungsfähigkeit
  5. Datenqualität und Definitionen

## Darstellungsregeln je Bereich

- [x] Oberkategorien und Unterthemen: Anteil an allen gefilterten Themensignalen; Hinweis, dass Mehrfachzuordnungen möglich sind und die Summe deshalb über 100 % liegen kann.
- [x] Politische Ebene, Bundesland und PLZ-Region: Anteil an allen Signalen mit auswertbarem Wert; fehlende Werte separat nennen.
- [x] Bewertungen: Anteil an allen Bewertungen sowie absolute Anzahl je Sternestufe.
- [x] Versandsignal: Verteilung über alle Feedbackzeilen; die positive Quote zusätzlich nur auf Basis beantworteter Versandfragen berechnen.
- [x] Selbstwirksamkeit: `Ja`, `Nein` und `Unsicher` absolut zeigen; die positive Quote darf `Unsicher` aus dem gerichteten Nenner ausschließen, muss diesen Nenner aber direkt nennen.
- [x] Kreuztabellen und Feedback-Tags: Prozentwert immer zusammen mit `x von n` anzeigen.
- [x] Werte mit `n < 10` sichtbar als `kleine Basis` markieren und visuell nicht als belastbaren Haupterfolg hervorheben.

## Inhaltliche Präzisierung

- [x] Hero `Wirkung, nicht nur Klicks.` durch eine neutralere Aussage ersetzen, zum Beispiel `Nutzung, Qualität und Selbstauskunft.`
- [x] `Vom Interesse zur Handlung` in `Versandsignal aus dem Feedback` umbenennen.
- [x] `Positive Wirkung nach Ohnmachtsfrequenz` in `Positive Selbstauskunft nach berichteter Ohnmachtsfrequenz` umbenennen.
- [x] Durchgehend klarstellen: `Ja, geht raus` umfasst bereits verschickt und unmittelbar geplanten Versand; es ist kein physischer Versandnachweis.
- [x] Korrelationen zwischen Bewertung, Tags und Versandabsicht nicht als Ursache formulieren.

## Bekannte Daten- und Darstellungsfehler beheben

- [x] Den Monatsverlauf chronologisch statt nach Anzahl sortieren.
- [x] Für den Verlauf der freiwilligen Themensignale `created_at` beziehungsweise den Zeitpunkt der Einwilligung verwenden, nicht nur `generated_at`.
- [x] Signale ohne `generated_at` dürfen nicht aus dem Monatsverlauf verschwinden.
- [x] Bei `Bewertung & Versandabsicht nach Oberkategorie` Bewertungen, beantwortete Versandfragen und fehlende Angaben getrennt ausweisen.
- [x] Kampagnen-Slug und freie Anliegen in die interne Aggregation aufnehmen, damit der Quellenfilter serverseitig korrekt funktioniert.

## Später: wirklich fehlende Wirkungsdaten

- [ ] Separat prüfen, ob ein datensparsames Follow-up erfassen soll:
  - Brief später tatsächlich verschickt: `Ja | Nein | keine Angabe`
  - Antwort aus dem politischen Büro erhalten: `Ja | Nein | noch offen`
- [ ] Diese späteren Angaben niemals mit der heutigen Versandabsicht vermischen.
- [ ] Für einen echten 30-/90-Tage-Verlauf der Brief-Erstellungen eine datensparsame tägliche Aggregation konzipieren; der aktuelle Gesamtzähler besitzt keine Ereignishistorie.

## Akzeptanzkriterien

- [x] Der globale Ansichtswechsel funktioniert für alle geeigneten Diagramme und Karten konsistent.
- [x] Kein Prozentwert erscheint ohne erkennbaren Nenner oder absolute Basis.
- [x] Kampagnen und freie Anliegen lassen sich getrennt betrachten.
- [x] Monatswerte sind vollständig und chronologisch.
- [x] Kleine Stichproben, Mehrfachzuordnungen, fehlende Antworten und Selbstauskünfte sind sichtbar gekennzeichnet.
- [x] Es werden weiterhin nur Aggregate angezeigt; keine Anliegen, Brieftexte, E-Mail-Adressen, vollständigen PLZ oder Einzelzeilen.
- [x] Aggregationstests decken beide Ansichten, Filter, fehlende Werte, Mehrfachkategorien und kleine Stichproben ab.
- [x] Bestehende Zugriffssperre, `noindex` und Datenschutzgrenzen bleiben erhalten.

## Nicht Teil des ersten Umbaus

- Neue öffentliche Statistikseite
- Veröffentlichung oder Export einzelner Datensätze
- Behauptung eines bestätigten physischen Versands
- Behauptung einer kausalen politischen Wirkung
- Neue Tracking-Dienste oder personenbezogene Analyse