---
created: 2026-10-07
title: Kampagnenbriefe mit kleiner Prompt-Anpassung variieren
area: campaigns+generation
files:
  - web/src/app/api/generate-letter/route.ts
  - web/src/lib/generation/generateLetter.ts
  - web/src/lib/types/wizard.ts
  - web/src/__tests__/generateLetterLevelPrompt.test.ts
---

## Ziel

Aus unveränderten Kampagnenvorlagen entstehen schlüssige Briefentwürfe mit unterschiedlichen Einstiegen, Argumentationswegen und, wenn der Text es hergibt, Schwerpunkten. Die zentrale Forderung bleibt erhalten. Dafür sind weder Datenbankänderungen noch zusätzliche Felder für NGOs oder zusätzliche Eingabeschritte für Teilnehmende nötig.

## Ausgangspunkt

Thomas vermutet, dass die meisten Teilnehmenden die Kampagnenvorlage unverändert übernehmen; eine konkrete Quote ist nicht verifiziert. Der bisherige Generator verlangt die ein bis drei stärksten Argumente und den Aufbau Anlass → Begründung → Forderung. Auch die Längenkorrektur schreibt einen festen Aufbau vor. Bei identischer Vorlage sind daher ähnliche Argumentauswahl und Dramaturgie zu erwarten; ein Vergleich vieler Ausgaben steht noch aus.

## Gewünschtes Verhalten

- Serverseitig erkennen, ob der eingegebene Text der bereits geladenen aktiven Kampagnenvorlage entspricht. Für den Vergleich nur äußere Leerzeichen und Zeilenumbrüche vereinheitlichen. Jede andere Änderung fällt konservativ unter den bisherigen Ablauf zur Bewahrung eigener Aussagen.
- Nur bei unveränderter Vorlage die starren Vorgaben zur Argumentauswahl und zum Aufbau durch einen Kampagnen-Prompt ersetzen. Keine widersprüchlichen Pflichtregeln stehen lassen.
- Pro Generierung einen von drei Aufbauhinweisen auswählen: mit der Bitte beginnen, mit einer vorhandenen Begründung beginnen oder mit einer ausdrücklich beschriebenen Auswirkung beginnen. Ist der Hinweis mangels Inhalt ungeeignet, darf das Modell einen passenden anderen Einstieg verwenden.
- Den gewählten Hinweis beim vorhandenen Längen-Korrekturversuch beibehalten. Dieser Versuch darf nicht wieder den bisherigen festen Aufbau erzwingen.
- Änderungen an Empfängerlogik, Tonwahl und sachlichen Schutzregeln vermeiden. Das Verhalten gilt für Bundestags-, Landes- und feste Kampagnenempfänger gleichermaßen, mit ihren jeweiligen bestehenden Zuständigkeitsregeln.

## Entwurf für die Prompt-Regeln

> Dieser Text ist eine gemeinsame Kampagnenvorlage. Bewahre die zentrale Forderung, ihre Zielrichtung und alle dafür notwendigen Fakten und Einschränkungen.
>
> Wenn mehrere eigenständige Begründungen vorhanden sind, darf eine davon den Schwerpunkt bilden. Weitere Argumente müssen nicht vollständig wiedergegeben werden, sofern dadurch keine notwendige Begründung oder wesentliche Aussage verloren geht. Zusammenhängende Begründungsketten dürfen nicht auseinandergerissen werden.
>
> Wenn nur ein Argument vorhanden ist, bleibe dabei. Erfinde keine weiteren Gründe. Wenn hauptsächlich ein Ziel genannt wird, formuliere dieses klar und ergänze nur Begründungen, die im Text stehen.
>
> Übernimm weder Satzfolge noch Absatzaufbau der Vorlage automatisch. Persönliche Erfahrungen, Betroffenheit und Ortsbezüge dürfen ausschließlich aus vorhandenen Angaben stammen.

Den Aufbauhinweis separat ergänzen. Die Variation beschreibt eine redaktionelle Entscheidung für den Entwurf, keine vermeintlich bekannte persönliche Priorität der schreibenden Person.

## Umsetzungshinweise

Die aktive Kampagne und ihr Anliegen werden am Generierungsendpunkt bereits geladen. Ein internes, serverseitig abgeleitetes Signal genügt; kein neues Kampagnenfeld, kein öffentliches API-Feld und keine zusätzliche KI-Anfrage zur Argumentextraktion. Kampagnenmodus nicht aus einem Statistiksignal wie `preclassifiedTopic` ableiten.

Den vollständigen eingegebenen Text weiterhin als Quelle übergeben. Keine Textteile vorab zufällig entfernen. Die Temperatur zunächst beibehalten; zuerst die Wirkung der gezielten Prompt-Änderung prüfen.

## Akzeptanzkriterien und Prüfung

- [ ] Unveränderte Vorlage aktiviert den Kampagnen-Prompt; bearbeitete Texte und Briefe ohne Kampagne behalten die bisherige Bewahrung der eigenen Aussagen. Eine Kampagne ohne vorab klassifiziertes Thema wird ebenfalls erkannt.
- [ ] Hauptforderung, notwendige Einschränkungen und zusammenhängende Begründungen bleiben bei allen Aufbauhinweisen erhalten. Ein einzelnes Argument wird nicht künstlich vervielfacht; ein überwiegend zielorientierter Text erhält keine erfundenen Begründungen.
- [ ] Einstieg und Aufbau dürfen variieren, ohne persönliche Erfahrungen, lokale Probleme, Gesetze oder Zuständigkeiten zu erfinden. Die bestehende Unterscheidung zwischen lokalem MdB, nichtlokalem MdB und fester Adresse bleibt erhalten.
- [ ] Gezielte Tests prüfen Modusauswahl, Prompt-Konflikte und Beibehaltung des Aufbauhinweises bei Längenkorrektur. Tests mit gemocktem Mistral belegen keine tatsächliche Textvielfalt.
- [ ] Vor Freigabe bisherige und neue Generierung an drei synthetischen Vorlagentypen vergleichen: mehrere unabhängige Argumente, eine notwendige Begründungskette, überwiegend eine konkrete Forderung. Je fünf Entwürfe pro Typ und Prompt-Version erzeugen. Inhaltserhalt, Schwerpunkt, Einstieg und Aufbau manuell vergleichen; Ergebnis dokumentieren. Reale Mistral-Aufrufe dafür separat autorisieren und keine produktiven Teilnehmer-Endpunkte oder Zähler verwenden.

## Festgelegte Grenzen

Keine Datenbankmigration, keine zusätzlichen Formularfelder, keine zusätzliche KI-Anfrage pro regulärem Brief und keine neue Speicherung oder Protokollierung von Anliegen oder Brieftexten. Kein Ähnlichkeitsalgorithmus und kein Vergleich mit gespeicherten Teilnehmerbriefen.

Gemeinsame Fakten, Gesetze und Forderungen dürfen wiederkehren. Die Änderung verspricht weder einzigartige Briefe noch eine unerkennbare Kampagne. Ohne eigene Angaben entstehen keine unterschiedlichen persönlichen Lebensgeschichten und kein zusätzlicher echter Ortsbezug. Teilnehmende prüfen den Entwurf weiterhin selbst, schreiben ihn ab und versenden ihn eigenständig.

Dieses To-do dokumentiert den Vorschlag. Umsetzung, bezahlte Modelltests, Commit, Push und Deployment sind damit nicht freigegeben.
