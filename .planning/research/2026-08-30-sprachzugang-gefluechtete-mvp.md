# Sprachzugang fuer gefluechtete Menschen: MVP-Entscheidung fuer Brief-nach-Berlin

Stand: 30.08.2026
Status: Recherche und Produktempfehlung, keine Implementierungsfreigabe

## Kurzfazit

**Ja, das ist ein sinnvoller Zugang und fuer den Kernflow gut machbar, aber keine kleine „Sprache-auswaehlen“-Aenderung.** Brief-nach-Berlin sollte nicht die komplette oeffentliche Website in vier Sprachen uebersetzen. Der vernuenftige erste Schritt ist ein **mehrsprachiger, mobil optimierter Kernflow**: Verstehen, Anliegen eingeben, Empfaenger finden, deutschen Brief pruefen und abschreiben.

Empfohlene Reihenfolge fuer einen validierten MVP:

1. **Englisch und Arabisch** fuer den Kernflow (`/app`) und eine kurze Einstiegsseite.
2. **Tuerkisch** erst nach einem kurzen Test mit der passenden Community oder einer belastbaren Nachfrage.
3. Nicht „Kurdisch“ als eine Sprache anbieten: getrennt **Kurmancî** und **Soranî** testen und nur die Varietaet liefern, die Menschen tatsaechlich nutzen.
4. Den fertigen Brief weiterhin als klar ausgewiesenen, **formellen deutschen Entwurf** erzeugen. Die Uebersetzung der Bedienung ist keine Rechtsberatung, keine behördliche Uebersetzung und keine Garantie, dass ein Eingabetext in jeder Sprache korrekt verstanden wird.

Diese Reihenfolge reduziert den Aufwand, wahrt die politische Kernfunktion und verhindert, dass ein nur halb uebersetztes Angebot ein falsches Sicherheitsversprechen abgibt.

## Was die Quellen konkret nahelegen

### 1. Zugang ist mehr als uebersetzter Fliesstext

UNHCR beschreibt vertrauenswuerdige Informationen fuer gefluechtete Menschen als kurz, leicht verstaendlich, korrekt, vollstaendig relevant und in den passenden Sprachen sowie schriftlichen, muendlichen und bildlichen Formaten. Sie sollen zudem sagen, wo es Klaerung gibt und Erwartungen nicht ueberziehen.
Quelle: [UNHCR: Good information product](https://www.unhcr.org/registration-guidance/chapter4/key-messages/)

Fuer Brief-nach-Berlin bedeutet das:

- Vor dem Start einfach erklaeren: „Du beschreibst dein Anliegen in deiner Sprache. Wir erstellen einen deutschen Entwurf. Du pruefst ihn vor dem Absenden.“
- Keine langen politischen Hintergrundseiten als Voraussetzung fuer die Nutzung.
- Jede wichtige Fehlermeldung, jeder Datenschutzhinweis und jeder naechste Schritt muss in der gewaehlten Sprache vorliegen.
- Einen sichtbaren menschlichen Klaerungsweg nennen, statt die App als Behoerden-, Rechts- oder Dolmetschdienst darzustellen.

UNHCRs aktuelle Help-Plattformen setzen zudem auf mobile, bandbreitensparende Nutzung, lokale Anpassung, Rueckmeldungen aus betroffenen Communities, Sprachumschalter in den jeweiligen Alphabeten und vereinfachte Layouts.
Quellen: [UNHCR Help sites](https://www.unhcr.org/digitalstrategy/help-sites/), [UNHCR Help 2.0](https://www.unhcr.org/digitalstrategy/case-studies/help-2-0-a-digital-lifeline-reimagined/)

### 2. Fachliche oder folgenrelevante Inhalte brauchen menschliche Absicherung

UNHCR empfiehlt, frueh Sprachassistenz passend zu den gesprochenen Sprachen zu planen. Gerade bei rechtlichen oder gesundheitlichen Fachinhalten reichen Familie, Freunde oder ungeschulte Personen wegen Vertraulichkeit und Genauigkeit nicht verlaesslich aus; zentrale Dokumente sollen qualitaetsgesichert uebersetzt werden.
Quelle: [UNHCR: Easing early communication](https://www.unhcr.org/handbooks/ih/language/easing-early-communication)

Konsequenz fuer das Produkt:

- UI-Texte und unverbindliche Erklaerungen duerfen professionell uebersetzt und mit Muttersprachler:innen getestet werden.
- Keine Aussage wie „rechtssicher“, „amtlich uebersetzt“ oder „wir beraten zu Asyl/Sozialrecht“.
- Bei Verweisen auf Aufenthalts-, Asyl-, Sozial- oder Verfahrensfragen immer klar an eine anerkannte Beratungsstelle verweisen, statt den Brief als Loesung darzustellen.
- Erst nach fachlicher/praktischer Pruefung durch eine geeignete Organisation Links zu konkreten Beratungsangeboten einbauen; nicht als generische, ungetestete Linkliste.

### 3. Sprache, Schreibrichtung und technische Semantik gehoeren zusammen

W3C WCAG 2.2 verlangt, dass die Hauptsprache einer Seite programmatisch bestimmbar ist; bei anderssprachigen Passagen gilt dies ebenfalls. Das ist fuer Screenreader und korrekte Aussprache relevant.
Quelle: [W3C WCAG 2.2, 3.1 Readable](https://www.w3.org/TR/WCAG22/#readable)

W3C betont ausserdem: Eine Sprache bestimmt nicht verlaesslich die Text-Richtung. Richtung muss separat gesetzt und getestet werden. Das gilt besonders fuer Kurdisch, weil Varianten verschiedene Schriften nutzen koennen.
Quelle: [W3C: direction is not derivable from language](https://www.w3.org/International/questions/qa-direction-from-language)

MVP-Anforderungen:

- Jede lokalisierte Route setzt die passende Dokumentsprache, z. B. `lang="ar"`, `lang="tr"`, `lang="en"`, `lang="kmr"` oder `lang="ckb"`.
- Arabisch und Soranî muessen mit `dir="rtl"` und einem echten RTL-Layout getestet werden: Lesereihenfolge, Icons, Pfeile, Formulare, Fortschritt, Fehlermeldungen und gemischte deutsche Namen/PLZ.
- Kurmancî wird in der lateinischen Schrift angeboten und bleibt normalerweise LTR; Soranî wird heute meist arabischbasiert geschrieben und braucht RTL. Das sind keine austauschbaren Labels.
- Sprachoptionen im eigenen Alphabet anzeigen, etwa: `العربية`, `Türkçe`, `Kurmancî`, `سۆرانی`, `English`, nicht nur deutsche Exonyme.
- W3C verweist fuer HTML auf BCP 47/IANA-Sprachtags. Das konkrete, spezifische Tag ist vorzuziehen; W3C nennt `ku` als Makrosprache mit u. a. `kmr` (Kurmancî) und `ckb` (Soranî).
  Quellen: [W3C: Language tags](https://www.w3.org/International/articles/language-tags/index.en.html), [W3C: Choosing language tags](https://www.w3.org/International/questions/qa-choosing-language-tags)

### 4. Die bestehende allgemeine Barrierefreiheit bleibt Voraussetzung

Mehrsprachigkeit ersetzt keine Barrierefreiheit. WCAG 2.2 deckt unter anderem Tastaturbedienung, sichtbaren Fokus, Kontrast, Reflow auf Mobilgeraeten, klare Labels/Fehler und Statusmeldungen ab. W3C empfiehlt die aktuelle Version 2.2 als Ziel.
Quelle: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Der bestehende lokale Audit dokumentiert bereits offene Kernpunkte wie Skip-Link, Fokus bei Schrittwechsel, semantischen Fortschritt und Voice-Status. Diese sollten im gleichen Release-Paket erledigt werden, weil sonst eine neue Sprachoberflaeche gerade fuer die anvisierte mobile Nutzung trotzdem schwer zugaenglich bleibt.
Lokale Grundlage: [`BARRIEREFREIHEIT-AUDIT.md`](../../BARRIEREFREIHEIT-AUDIT.md)

## Sprachpriorisierung

| Sprachoption | Empfehlung | Technischer Hinweis |
| --- | --- | --- |
| English | V1 | LTR, geringer Zusatzaufwand, nuetzlich als Brueckensprache |
| العربية | V1 | RTL und arabische Tests sind Pflicht |
| Türkçe | V1.1 nach Test | LTR; keine RTL-Sonderlogik |
| Kurmancî | erst nach Bedarfstest | LTR, genauer Tag `kmr` |
| سۆرانی | erst nach Bedarfstest | RTL, genauer Tag `ckb` |

Die Tabelle ist **keine Rangfolge menschlicher Bedarfe**, sondern eine risikobewusste Produktreihenfolge. Vor dem Start reichen fuenf bis acht kurze, moderierte Nutzungstests: mindestens je zwei Personen fuer Arabisch und Englisch, fuer die weiteren Sprachen nur nach verfuegbarer Community-Anbindung. Gefragt wird nicht nach Aufenthaltsstatus, sondern danach, ob sie den Ablauf verstehen, wo sie abbrechen und ob der deutsche Brief dem gemeinten Anliegen entspricht.

## Realistische technische Einordnung im aktuellen Repo

Lokaler Befund vom 30.08.2026:

- Die Next.js-App hat derzeit keine i18n-Bibliothek oder Locale-Routen; sichtbare Texte liegen direkt in vielen React-Komponenten und Seiten.
- Der Briefgenerator verlangt explizit einen formellen Brief „in gepflegtem Deutsch“. Das ist fuer den Empfaenger richtig, muss in der anderssprachigen UI aber transparent erklaert werden.
- Die Eingabe wird als Freitext an den Generator weitergereicht. Es gibt derzeit keine explizite Sprachwahl, keine dokumentierte Erkennung und keine Zusicherung, dass arabische, tuerkische oder kurdische Eingaben korrekt verarbeitet werden.

Deshalb ist die vollstaendige Website-Lokalisierung ein mehrwoechiges Content-, Uebersetzungs- und QA-Projekt, nicht ein Package-Install. Ein begrenzter Kernflow ist dagegen gut schneidbar:

1. Locale-Infrastruktur und Umschalter, ohne automatische Browser-Weiterleitung.
2. Eine kurze lokalisierte Einstiegsseite und der gesamte `/app`-Kernflow, einschliesslich Consent/Datenschutz-Kurzfassung, Fehlern, E-Mail-Hinweisen und Erfolgsschirm.
3. Generator explizit auf mehrsprachigen Eingabetext testen: Er muss die Aussage im deutschen Brief erhalten, keine Fakten erfinden und niemals vorgeben, die Sprache professionell zu uebersetzen.
4. Professionelle Uebersetzung plus Muttersprachler:innen-Review fuer alle sichtbaren, handlungsrelevanten Texte; maschinelle Rohuebersetzungen nicht ohne Review veroeffentlichen.
5. RTL- und Mobiltests auf echten Geraeten, danach kurze Nutzertests.

## Empfohlener MVP-Schnitt

**In Scope**

- sichtbarer Sprachumschalter auf Landing und im Wizard, Auswahl bleibt im Link oder lokal fuer die Sitzung erhalten;
- Englisch und Arabisch fuer den beschriebenen Kernflow;
- kurze, einfache Erklaerung der Grenzen, Datenschutz und der Tatsache, dass der fertige Brief Deutsch ist;
- deutsche Namen, Postleitzahlen und Brieftext bleiben technisch unveraendert und lesbar in RTL-Kontexten;
- professionell gepruefte UI-Texte; deutschsprachige Langform-SEO-Inhalte bleiben vorerst deutsch;
- Feedback-Kontakt in allen MVP-Sprachen und ein klarer „etwas stimmt nicht“-Weg.

**Aus Scope fuer V1**

- Vollstaendige Uebersetzung aller Ratgeber-, Kampagnen-, Presse- und SEO-Seiten;
- Rechts-, Asyl- oder Sozialberatung;
- automatische Uebersetzung als alleinige Grundlage fuer folgenreiche Entscheidungen;
- Sprache anhand von Name, Herkunft, IP oder Eingabetext automatisch erraten;
- die Behauptung „Leichte Sprache“, solange nicht mit qualifizierter Zielgruppenpruefung gearbeitet wurde.

## Offene Entscheidungen vor einer Umsetzung

1. Hat der Kontakt zu Seyda Kurt oder einer Organisation Zugang zu Personen fuer die kurzen Nutzungstests und die Sprachreview? Das ist wertvoller als sofort vier Sprachen zu bauen.
2. Soll die Eingabe von Anfang an in allen angebotenen Sprachen offiziell unterstuetzt werden? Wenn ja, braucht es einen klaren mehrsprachigen Generator-Testkatalog mit echten, einwilligungsbasierten Testtexten.
3. Gibt es fuer politische Anliegen einen verifizierten Partner fuer die Abgrenzung zu Asyl-/Sozialberatung und einen sicheren Verweisweg?

## Quellen

- [UNHCR: Good information product](https://www.unhcr.org/registration-guidance/chapter4/key-messages/)
- [UNHCR: Easing early communication](https://www.unhcr.org/handbooks/ih/language/easing-early-communication)
- [UNHCR: Help sites](https://www.unhcr.org/digitalstrategy/help-sites/)
- [UNHCR: Help 2.0](https://www.unhcr.org/digitalstrategy/case-studies/help-2-0-a-digital-lifeline-reimagined/)
- [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C: Language tags in HTML and XML](https://www.w3.org/International/articles/language-tags/index.en.html)
- [W3C: Choosing language tags](https://www.w3.org/International/questions/qa-choosing-language-tags)
- [W3C: direction is not derivable from language](https://www.w3.org/International/questions/qa-direction-from-language)
