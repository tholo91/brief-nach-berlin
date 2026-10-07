# Bundestag-Aktivierung: Mailaufteilung, Datenqualität und Pilot

**Rechercheabruf:** 2. Oktober 2026, Europe/Berlin  
**Status:** Entscheidungsvorlage; keine Produktimplementierung, kein Versand  
**Grundlage:** aktuelle lokale Dateien sowie drei parallele Prüfungen zu Mailkette, MdB-Quellen und offiziellen Besuchs-/Datenschutzinformationen.

## Empfehlung

Die bestehende Seite `/aktiv-werden` zuerst um verlässliche Bundestagsbesuchs- und Büroinformationen erweitern. Anschließend einen Pilot mit 6–10 manuell zugeordneten MdBs starten. Die zweite Mail erhält nach der Bewertung einen kleinen, zeitlich stabilen Link zum Weitergehen. Konkrete Termine, Anmeldestatus und Bedingungen stehen auf der aktuellen Seite beziehungsweise bei der Originalquelle.

Die zu prüfende Annahme lautet: Menschen, die einen Brief vorbereitet haben, möchten danach persönlich mit einem Büro sprechen oder das Parlament kennenlernen. Nicht voraussetzen, dass sie den Brief bereits verschickt haben oder die angeschriebene Partei unterstützen. Ob der Zusatz hilfreich ist und die Brief-/Feedbackaufgabe nicht verdrängt, ist bislang nicht belegt.

Ein automatischer bundesweiter Veranstaltungskalender lohnt sich erst nach diesem Nutzungsnachweis. Für den ersten Pilot genügt eine kleine versionierte JSON-Datei mit öffentlichen Quellen und redaktioneller Freigabe. Eine neue Supabase-Tabelle, ein Modellaufruf und eine Versandqueue sind hierfür nicht erforderlich.

## Welche Inhalte in welche Mail?

| Mail | Aufgabe | Empfohlener Inhalt | Beispiel |
|---|---|---|---|
| 1: sofortiger Briefentwurf | Prüfen, abschreiben, selbst abschicken | Brief und Versandhinweise bleiben vorn; ein kleiner weiterführender Link am Ende | „Wenn du danach weiter aktiv werden möchtest: Hier findest du weitere Möglichkeiten.“ |
| 2: Bewertungsnachfrage nach 2–3 Tagen | Briefqualität bewerten und freiwillig Versandstatus angeben | Bewertung zuerst, dann ein kleiner Aktivierungsblock mit einem Link; Spende anschließend untergeordnet | „Wenn du dein Anliegen auch persönlich besprechen möchtest, kannst du beim Büro von [Name] nach einer Bürgersprechstunde fragen.“ |
| 3: letzte Nachfrage nach etwa 2–3 Monaten | Reaktion und tatsächlichen Verlauf verstehen | „Hast du eine Antwort erhalten?“; freiwillige Antwort/Geschichte als Hauptaktion. Allgemeiner Aktivierungslink höchstens im Nachsatz | „Hat sich die angeschriebene Person oder Stelle bei dir gemeldet? Auch ‚nicht abgeschickt‘ oder ‚keine Antwort‘ hilft mir weiter.“ |

Der Social-Baustein ist ein Footer in bestehenden Mails, keine separate vierte Mail. Die jetzige Lastcall-Mail ist ein manuell angestoßener CSV-Batch und kein nachgewiesener zeitgesteuerter 3-Monats-Automatismus.

Die Mail sollte nicht Veranstaltung, Reise, Spende, Social und Teilen als gleich große Aufgaben präsentieren. Ein Aktivierungslink führt zu zwei Möglichkeiten: **Anliegen persönlich besprechen** und **politisches Berlin kennenlernen**. Die Auswahl bleibt bei der Person; keine Themen- oder Parteipräferenz aus dem Brief ableiten.

### Entwurf für Mail 2 bei geprüftem lokalen MdB

> Moin,
>
> vor ein paar Tagen hast du mit Brief-nach-Berlin einen Briefentwurf erstellt. War er für dich hilfreich?
>
> **[Brief bewerten]**
>
> Wenn du dein Anliegen auch persönlich besprechen möchtest: Beim Büro von [Name] kannst du nach einer Bürgersprechstunde fragen. Dort erfährst du auch, ob geförderte Informationsfahrten nach Berlin angeboten werden und welche Bedingungen gelten.
>
> **[Kontakt und nächste Möglichkeiten ansehen]**
>
> Wenn du Brief-nach-Berlin unterstützen möchtest, findest du hier die Spendenmöglichkeit.
>
> Danke dir!
>
> Thomas

Dieser Text ist ein Vorschlag nach Klärung des Versandzwecks, keine Versandfreigabe. Der Link sollte auf die bestehende `/aktiv-werden`-Seite mit einer freigegebenen öffentlichen MdB-Zuordnung oder direkt auf die offizielle Quelle führen. Bei einem auswärtigen MdB keine Berechtigung zu dessen Wahlkreisfahrt behaupten. Bei Land, Kommune, Kanzler, institutionellen Kampagnenadressaten und „MdB später auswählen“ den MdB-Block nicht verwenden.

### Stabile Erklärung für die Seite

> **Den Bundestag kennenlernen**
>
> Viele Bundestagsabgeordnete laden Menschen aus ihrem Wahlkreis zu geförderten politischen Informationsfahrten nach Berlin ein. Frag im Wahlkreisbüro nach kommenden Fahrten, freien Plätzen oder einer Warteliste. Das Büro informiert dich auch über Teilnahmebedingungen und mögliche Eigenkosten.
>
> **[Informationen beim jeweiligen Büro]**

Eine eigene Anmeldung oder Übernahme von Geburts-, Ausweis-, Gesundheits- oder Unterkunftsdaten ist für Brief-nach-Berlin unnötig. Anmeldungen bleiben bei den Originalanbietern.

## Verifizierter lokaler Stand und Umsetzungslücken

| Befund | Bedeutung | Code-/Datenbeleg |
|---|---|---|
| `/aktiv-werden` existiert und ist bereits in der Erstmail verlinkt | Bestehende Seite ausbauen, statt eine parallele `/mitmachen`-Seite einzuführen | `web/src/app/(site)/aktiv-werden/page.tsx:10`; `web/src/lib/email/buildEmailHtml.ts:721` |
| Followup wird nach erfolgreichem Erstversand sofort fertig gerendert und bei Brevo eingeplant | Ein beim Erstellen geprüfter Termin ist bei Zustellung/Lesen möglicherweise veraltet | `web/src/app/api/generate-letter/route.ts:345–375`; `web/src/lib/email/sendFollowupEmail.ts:33–54` |
| Followup-Schnittstelle enthält Sprache, E-Mail, Name, Feedback-Token und Versandzeit | Empfängerart und freigegebene Quellenzuordnung müssen ausdrücklich ergänzt werden | `web/src/lib/email/sendFollowupEmail.ts:14–26` |
| `politicianName` wird im Followup-Builder nur deklariert, nicht verwendet | Aktuelle Mail ist auch textlich keine MdB-personalisierte Aktivierung | `web/src/lib/email/buildFollowupHtml.ts:21` |
| Politiker-Cache verwendet AW-Mandats-ID und AW-Personen-ID; Bürodaten verwenden Bundestag-ID | IDs sind nicht austauschbar; geprüfte Crosswalk-Zuordnung erforderlich | `web/src/lib/types/politician.ts:3–17`; `web/scripts/fetch-constituency-offices.ts:10–26` |
| Lastcall rendert dieselbe Mail für alle CSV-Adressen | Mit der bestehenden Liste keine sichere persönliche Terminempfehlung | `web/scripts/send-lastcall-followup.ts:1–16` |
| Review erfasst `letter_sent`; kein strukturiertes Antwort-erhalten-Feld nachgewiesen | Qualität/Versand in Mail 2 erfragen, spätere Wirkung separat; bestehende Bewertungen sind keine vollständige Empfängerdatenbank | `web/src/lib/actions/submitReview.ts:199`; `web/src/lib/email/buildLastcallHtml.ts:53–84` |

**Datenstichprobe aus lokalen Dateien:** Bürodaten enthalten 638 Datensätze mit Profil-URLs, davon 433 mit extrahierter Büroadresse; Snapshot vom 04.07.2026. Der Politiker-Cache enthält 608 Bundestagsdatensätze; Snapshot vom 07.07.2026. Die Differenz beweist nicht, welcher Datensatz falsch oder welches Mandat aktuell ist. Sie reicht aber aus, um vollständige, aktuelle und problemlos verbindbare Abdeckung **nicht** zu behaupten. „Keine Adresse extrahiert“ bedeutet nicht „kein Wahlkreisbüro vorhanden“.

Konkretes Identitätsbeispiel: Bei Kirsten Kappert-Gonther stehen im lokalen Cache AW-Mandats-ID `68633` und AW-Personen-ID `73426`; die Bürodaten verwenden Bundestag-ID `1045310`. Im Pilot alle drei Bezeichner ausdrücklich benennen und die Person manuell bestätigen. Namensähnlichkeit darf einen Vorschlag erzeugen, keine automatische Freigabe.

Der Followup wird lokal für verschiedene Empfängerarten/Ebenen eingeplant. Für eine MdB-Gelegenheit deshalb die echte Empfängerart `mdb` und gegebenenfalls die Beziehung zum Wahlkreis prüfen; `Bund` allein genügt nicht.

Das lokale Timing ist Tag+3 um 9:45 Uhr Berlin, teilweise Tag+2. Brevo dokumentiert weiterhin eine Vorplanung bis 72 Stunden. [Brevo: Schedule emails](https://developers.brevo.com/docs/schedule-batch-sendings)

## Datenqualität: unterschiedliche Aussagen brauchen unterschiedliche Belege

| Information | Urteil | Was als Aussage tragfähig ist |
|---|---|---|
| Zentraler Bundestagsbesuch | Gut für einen allgemeinen Informationslink | Kostenlose Teilnahme an Besucherangeboten mit vorheriger Anmeldung; keine kostenlose Anreise und keine Platzzusage |
| BPA-Informationsfahrt als Programm | Gut für eine vorsichtige Erklärung | Einladung/Auswahl über MdB-Büros, gefördert; konkrete Berechtigung, Eigenkosten und Plätze prüfen |
| Offizielles Profil/Kontakt eines einzelnen MdB | Gut nach Identitäts- und Linkprüfung; Gesamtdatensatz nicht zertifiziert | „Informationen beim Büro von [Name]“ |
| Nächste öffentliche Bürgersprechstunde | Heterogen, redaktionell zu prüfen | Nur zukünftiger, eindeutig zugeordneter, öffentlich zugänglicher Termin mit widerspruchsfreien Angaben |
| Freie Plätze/Absagen | Schwächster Teil | Nur behaupten, wenn ausdrücklich und frisch bestätigt; veröffentlichte Datumsangabe/Formular genügt nicht |

Die offiziellen zentralen Open-Data-Angebote dokumentieren Biografien, Parlamentsdokumente und Abstimmungsdaten. In den geprüften Angeboten wurde **keine bundesweite API für persönliche Wahlkreistermine gefunden**. Das ist kein Nachweis, dass kein einzelnes Büro oder keine Partei strukturierte Feeds anbietet. [Bundestag Open Data](https://www.bundestag.de/services/opendata)

Zwei Programme auseinanderhalten: Die Mindestgröße von zehn Personen betrifft bestimmte Bundestagsgruppenbesuche auf Einladung; sie ist keine Voraussetzung, dass eine einzelne Person beim Büro nach einer mehrtägigen BPA-Fahrt fragen darf. Die zitierte hib-Meldung zu bis zu drei Gruppen à 50 ist vom **12.02.2025**, nicht von Oktober 2026. Ein aktuelles Ausdrucksdatum beweist keine neue Veröffentlichung. [Gruppenbesuche](https://www.bundestag.de/besuche/fuehrung/besuchaufeinladungeinesabgeordneten), [hib-Meldung](https://www.bundestag.de/presse/hib/kurzmeldungen-1050032), [BPA-Besucherdienst](https://www.bundesregierung.de/breg-de/bundesregierung/bundespresseamt/im-gespraech-mit-dem-bundespresseamt/besucherdienst-1962016)

## Quellenstichprobe mit echten Fehlerfällen

Bewusst heterogene qualitative Stichprobe, keine statistisch repräsentative Abdeckungsmessung. Recherchezugriff am 02.10.2026; Web-Ergebnisse enthalten teilweise ältere Caches. Deshalb sind die folgenden Befunde Recherchebelege, keine 48-Stunden-Verfügbarkeitszertifikate für einen Mailversand.

| MdB / Partei / Land | Primärquelle / belegtes Format | Konkreter Befund | Folgerung |
|---|---|---|---|
| Kirsten Kappert-Gonther / Grüne / Bremen | [Berlinfahrt](https://kappert-gonther.de/berlinfahrt/) mit externem [Jotform](https://form.jotform.com/242883213381355), HTML/Formular | Formulartitel „Berlinfahrten 2026“, tatsächliche Auswahl „Warteliste für 2027“ | Warteliste und Voraussetzungen verlinken; keine aktuelle 2026-Fahrt behaupten |
| Marc Biadacz / CDU / Baden-Württemberg | [Eigene Ankündigung](https://marc-biadacz.de/aktuelles/buergersprechstunde-des-cdu-bundestagsabgeordneten-marc-biadacz-12/), publiziert 25.09.2026; ergänzend [CDU Renningen](https://www.cdu-renningen.de/aktuelles/artikel/buergersprechstunde-des-cdu-bundestagsabgeordneten-marc-biadacz-13) | Telefonische Bürgersprechstunde 13.10.2026 ab 17 Uhr, Anmeldung über Büro erforderlich; vollständige Angaben im Primärquellen-Suchindex, direkter Abruf zunächst Cache miss | Positiver Terminkandidat mit geringem Teilnahmeaufwand, vor Freigabe direkt nachprüfen; keine freien Slots behaupten |
| Christoph Schmid / SPD / Bayern | [Sprechstundenartikel](https://www.christoph-schmid-spd.de/meldungen/buergersprechstunde-in-memmingen/), HTML; Homepage verlinkt [RSS](https://www.christoph-schmid-spd.de/meldungen/rss/) | Artikel enthält 17.07.2026, 13–14:30 Uhr, Ort und Voranmeldung; Termin vergangen. RSS-Payload nicht erfolgreich geprüft | Gute Felder für einen Adapter, aber Nachrichtenticker ist noch kein Eventfeed |
| Ralph Brinkhaus / CDU / NRW | [Service](https://www.ralph-brinkhaus.de/service/), HTML | Als „nächste“ Sprechstunde erscheint 22.07.2026. BPA-Plätze werden für Ehrenamt/gemeinnützige Organisationen vergeben; Büro bittet, von Einzelanfragen abzusehen | Juli-Termin sperren; allgemeinen Reise-CTA für Einzelpersonen hier nicht ausspielen |
| Alexander Hoffmann / CSU / Bayern | [Termine](https://www.alexander-hoffmann.org/termine), [Berlinbesuch](https://www.alexander-hoffmann.org/besuch-unserer-hauptstadt), HTML | Terminliste enthält Sitzungswochen; Besuchsseite nennt begrenzte Plätze/Wartezeiten und Vorrang für Engagement | Sitzungswoche ist kein buchbarer Wahlkreistermin; Einladung nicht als freier Platz darstellen |
| Heidi Reichinnek / Die Linke / Niedersachsen | [Eigene Website](https://heidi-reichinnek.de/), HTML; ergänzend offizieller Veranstalter | Im gelesenen Website-Inhalt kein eigener Terminfeed/BPA-Angebot belegt. [Veranstalterseite](https://www.linksfraktion.berlin/aktuelles/termine/termine-der-abgeordneten/detail/news/lichtenberger-strandolypiade-mit-spezialgast/) zu vergangenem 08.09.2026 mit widersprüchlichen Uhrzeiten | Kontakt-Fallback; fehlender Fund beweist keine fehlenden Veranstaltungen |
| Denis Pauli / AfD / NRW | [Besucherfahrten](https://denispauli.de/besucherfahrten/), HTML | Reiseintervall 06.–08.12.2026 veröffentlicht; freie Plätze nicht belegt | Nur als veröffentlichte Fahrtinformation mit Büroprüfung, keine Buchungszusage |
| Rainer Rothfuß / AfD / Bayern | [Berlinfahrten](https://www.rainer-rothfuss.de/berlinfahrt-auswahl/), HTML | 08.–11.12.2026 liegt in der Zukunft, aber ausdrücklich ausgebucht | Zukünftiges Datum allein reicht nicht für ein Angebot |
| Chantal Kopf / Grüne / Baden-Württemberg | [BPA-Fahrten](https://chantal-kopf.de/bpa-fahrten/), HTML/Formular | Alle drei Reisen 2026 vergeben/Anmeldung geschlossen, zuletzt 22.–25.09.; bis 30 Euro mögliche Eintritte, Einzelzimmer zusätzlich; Formular weiterhin sichtbar | Formular nicht mit Verfügbarkeit verwechseln; „gefördert“ statt „alles kostenlos“ |

Aktuelle Amtszuordnung wurde anhand aktueller Bundestags-/Fraktionsprofile beziehungsweise offizieller Angaben geprüft: [Kappert-Gonther](https://www.bundestag.de/abgeordnete/biografien/K/kappert_gonther_kirsten-1045310), [Schmid](https://www.spdfraktion.de/abgeordnete/schmid-christoph), [Brinkhaus](https://www.cducsu.de/abgeordnete/ralph-brinkhaus), [Hoffmann](https://www.cducsu.de/abgeordnete/alexander-hoffmann), [Reichinnek](https://www.bundestag.de/abgeordnete/biografien/R/reichinnek_heidi-1046720), [Pauli](https://afdbundestag.de/abgeordnete/denis-pauli/), [Kopf](https://www.bundestag.de/abgeordnete/biografien/K/kopf_chantal-1045532). Einzelne Fraktionsprofile waren nur im Primärquellen-Suchindex erreichbar; Rothfuß ergänzend im aktuellen [Auswärtigen Ausschuss](https://www.bundestag.de/ausschuesse/a03_auswaertiges). Alte Profil-URLs können ins Archiv einer vergangenen Wahlperiode umleiten.

RSS-Verlinkung ist bei Schmid nachgewiesen, nicht die Verwendbarkeit des Feed-Inhalts. Für die übrigen Quellen wurden ICS-/JSON-LD-/JSON-Eventendpunkte nicht nachgewiesen. robots.txt, Nutzungsbedingungen, HTTP-Stabilität, Rate Limits und tatsächliche Änderungsfrequenz sind noch nicht systematisch geprüft. Daher wäre „automatisiertes Scraping bereits abgesichert“ falsch.

**Konkreter positiver Seitentext, erst nach erneuter direkter Quellenprüfung:** „Marc Biadacz kündigt für den 13. Oktober 2026 ab 17 Uhr eine telefonische Bürgersprechstunde an. Eine vorherige Anmeldung beim Büro ist erforderlich. Details und Terminbestätigung bekommst du beim Büro.“ Diesen Zeitbezug auf der aktuellen Seite anzeigen; die vorgeplante Mail enthält nur „Kontakt und nächste Möglichkeiten ansehen“. Telefonnummer und offizielle Büro-Mail stehen in der verlinkten Originalankündigung.

Ein weiteres vollständig im offiziellen Seiteninhalt gefundenes Zukunftsbeispiel ist ein [Bürgerdialog in Pirna am 10.10.2026, 19–21 Uhr](https://afdsachsen.de/termine/buergerdialog-in-pirna/), Herderhalle, Rudolf-Renner-Straße 41, mit Chrupalla und Janich. Das ist eine von der Partei veranstaltete Veranstaltung, keine neutrale Bürgersprechstunde. Anmelde-/Platzstatus wurde dort nicht belegt. Im ersten Pilot sind Büro-Sprechstunden und Parlamentsbesuche vorzuziehen; Parteiveranstaltungen müssten ausdrücklich als solche erkennbar sein und aktiv von der Person gewählt werden.

## Qualitätsprozess für den Pilot

1. **Quellenregister:** Für 6–10 MdBs öffentliche Personen-/Mandats-/Bundestag-IDs, offizielle Profil-/Büro-URL und angebotene Möglichkeiten manuell bestätigen. Parteien und Regionen bewusst mischen; unbekanntes Mapping bedeutet allgemeiner Fallback.
2. **Gelegenheit prüfen:** Lokaler Bürgertermin, Informationsfahrt und allgemeine Kontaktmöglichkeit unterscheiden. Öffentlichkeit/Zielgruppe, Wahlkreis-/Wohnsitzvoraussetzung, Datum/Jahr, Ortsangabe/Online-Link, Anmeldung und Status getrennt festhalten. Ein Parteitreffen oder eine Sitzungswoche wird nicht zur Bürgersprechstunde.
3. **Freigabe und Frische:** Konkrete Termine nur mit Quellenlink, kurzem Beleg, `verifiedAt` und `expiresAt` freigeben. Vorgeschlagene Betriebsregel: höchstens 48 Stunden alte Prüfung; bei Terminen innerhalb der nächsten sieben Tage täglich prüfen. Abgelaufene, abgesagte, widersprüchliche oder überalterte Datensätze ausblenden. Ausgebuchte Reisen nicht als verfügbar anbieten, außer es gibt eine ausdrücklich angebotene Warteliste.
4. **Seite statt eingefrorener Mail:** Mail enthält den stabilen Hinweis; Seite prüft bei Darstellung Frist und Status des kuratierten Datensatzes. Das ist kein Live-Crawl bei jeder Nutzeranfrage. Fehlt eine aktuelle Freigabe, nur den geprüften offiziellen Kontaktlink zeigen. Quelle und Prüftag sichtbar, Anmeldung beim Büro.
5. **Nutzen erfassen:** Nach 2–4 Wochen freiwillige Rückmeldungen einholen: Hinweis hilfreich, Büro kontaktiert, Teilnahme angefragt/erfolgt? Diese Stufen auseinanderhalten. Einige tatsächliche Handlungen rechtfertigen eine nächste Pilotstufe, aber noch keine bundesweite Wirksamkeitsbehauptung. Keine still eingeführte Öffnungs-/Klickmessung.

Zusätzlich zum ursprünglichen Modell werden benötigt: klar benannte ID-Systeme, Art der Gelegenheit, `eventStatus` (geplant/abgesagt), `registrationStatus` (offen/Warteliste/ausgebucht/geschlossen/unbekannt), gegebenenfalls Anmeldeschluss, Zielgruppe, Kostenhinweis und redaktionelle Freigabe. Für eine lokale Veranstaltung sind eindeutige Uhrzeit/Zeitzone und Ort beziehungsweise Online-Zugang Pflicht; für eine mehrtägige Reise kann ein Datumsintervall als reine Reiseinformation genügen. Fehlende Pflichtfelder dürfen trotz optionaler TypeScript-Felder nicht veröffentlicht werden.

Ein funktionierender HTTP-Abruf bestätigt nur die Erreichbarkeit. Er setzt nicht automatisch das Datum der inhaltlichen Prüfung neu und bestätigt weder freie Plätze noch das Ausbleiben einer Absage. Bei Parserfehlern keinen früheren Termin unbegrenzt weiteranzeigen.

## Technikvarianten und Aufwand

| Variante | Bewertung |
|---|---|
| Zentrale offizielle Veranstaltungs-API | Für den benötigten Umfang nicht gefunden; nicht als Planungsgrundlage verfügbar |
| Regelmäßiger serverseitiger Abruf | Nach einem Pilot sinnvoll für einzelne geprüfte Quellen; Parser, Fristen und Fehler-Fallback pro Quelle notwendig |
| Live-Abfrage bei jedem Seitenaufruf | Für den Start unnötig; höhere Latenz, Ausfallabhängigkeit und Fremdseitenlast ohne belegten Nutzwert |
| Kuratiertes JSON | Empfohlener Start: kleine Datenmenge, Git-Diff, keine neuen Nutzer-Datensätze; Aktualisierung erfordert dann bewusstes Deployment |
| Kuratierte Supabase-Tabelle plus Parser | Später bei häufiger redaktioneller Pflege nützlich; öffentliche Ansicht nur auf freigegebene Datensätze, administrative Änderungen absichern |

Ein Sprachmodell ist im Pilot nicht erforderlich. Falls später öffentliches HTML schwer zu strukturieren ist: HTTP-Fetch → deterministischer Parser → Schema-/Datumsprüfung → optional Modell als Extraktionshilfe → Quellenvergleich/Freigabe. Ausschließlich öffentlichen Quelltext an die Extraktion geben; kein Anliegen, keine Nutzer-E-Mail, keine Feedback-Token. Strukturierter Modellausgang ist kein Aktualitäts- oder Verfügbarkeitsbeweis.

**Aufwandsschätzungen, keine Zusagen:** allgemeine Informationen auf bestehender Seite etwa ½–1 Arbeitstag; 6–10 MdB-Mappings und datensparsame Mailanbindung einschließlich fokussierter Checks etwa 1–2 zusätzliche Tage; kuratierte Terminanzeige mit Fristen/Status/Fallback etwa 2–4 zusätzliche Tage. Laufende Pflege zunächst separat messen, grob 1–3 Stunden pro Woche als Pilotbudget reservieren. Eine Rechtsprüfung hat darin keinen zugesagten Zeitrahmen. Ein oder zwei Quellenadapter können danach ein weiteres kleines Vorhaben sein; bundesweite Abdeckung ist vor Quelleninventar und gemessener Pflegezeit nicht seriös zu schätzen.

Für spätere Implementierung fokussiert prüfen: falsche ID, Empfänger außerhalb des Wahlkreises, Land/Kommune/institutioneller Bund-Empfänger, abgesagte/abgelaufene/ausgebuchte Gelegenheit, Jahreswechsel, fehlender Ort, Sommer-/Winterzeit, HTML/Text-Parität und keine personenbezogenen Parameter im Aktivierungslink. Erst nach lokalem Check gesondert Deployment und reale Provider-/Maildarstellung prüfen.

## Versandzweck und Datenschutz: konkreter offener Punkt

Die lokale Datenschutzerklärung beschreibt die zeitversetzte Mail derzeit **ausschließlich** als freiwillige Bewertung und Verbesserung des Dienstes und beruft sich hierfür auf Art. 6 Abs. 1 lit. f DSGVO. Ein Aktivierungsblock ist eine Erweiterung dieses beschriebenen Zwecks. Vor Mail-Release den tatsächlich vorgesehenen Inhalt, die Rechtsgrundlage und die Nutzerinformation prüfen. Eine Änderung der Erklärung allein erzeugt keine nachträgliche Einwilligung für bestehende Adressen. Regelmäßige Terminmails wären ein eigener, freiwillig gewählter Dienst.

Beleg: `web/src/app/(site)/datenschutz/page.tsx:394–401`. [DSGVO, insbesondere Art. 5, 6, 7, 9 und 13](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de), [§ 7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html). Ob ein konkreter sachlicher Hinweis in dieser Konstellation als Werbung einzuordnen ist, ist mit diesem Research nicht abschließend entschieden. Die Bezeichnung „Transaktionsmail“ ersetzt diese Prüfung nicht.

Für neue Links keine E-Mail, PLZ, Anliegen, persönlichen IDs oder vorhandenen Feedback-Token übernehmen. Eine öffentliche MdB-ID erfordert keine neue personenbezogene Datenbank, ist aber im Zusammenhang mit einer E-Mail-Adresse nicht automatisch anonym. Keine Interessen-/Parteiprofile aus der Empfängerwahl bilden. Signierte Token sind keine Verschlüsselung und keine Rechtsgrundlage.

Brevo-Tracking wird in Codekommentaren als global deaktiviert beschrieben; die aktuelle Dashboard-Einstellung wurde in dieser Recherche nicht geprüft. Live-Featureflag, tatsächliche Versandkette, Produktdeployment, aktuelle Mandatsvollständigkeit und freie Veranstaltungsplätze bleiben unbestätigt.

## Konkreter nächster Arbeitsschritt

Zuerst die vorhandene `/aktiv-werden`-Seite mit allgemeinen Bundestagsbesuchen und sechs geprüften Büroquellen konkretisieren. Bremen einbeziehen; für den Start Quellen wie Kappert-Gonther, Brinkhaus und Kopf bewusst nutzen, weil sie unterschiedliche Bedingungen und Fallbacks demonstrieren. Parallel den Versandzweck des vorgeschlagenen zweiten Mailblocks klären. Erst danach die geprüften öffentlichen Zuordnungen in die zweite Mail übernehmen. Automatisierung anhand tatsächlicher Anfragen/Teilnahmen und gemessener Pflegezeit entscheiden.

**In dieser Recherche geändert:** ausschließlich diese neue Markdown-Entscheidungsvorlage. Bestehende Recherchedatei und Produktcode unverändert; kein Commit, Push, Deployment, Modellaufruf oder Mailversand.
