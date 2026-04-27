# Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

**Verantwortlicher:** Thomas Lorenz, Zur Plangemühle 5, 47198 Duisburg, Deutschland
**Kontakt:** thomas_lorenz@posteo.de
**Dienst:** Brief nach Berlin (brief-nach-berlin.de)
**Stand:** 2026-04-27

Es ist kein Datenschutzbeauftragter bestellt (keine Pflicht nach § 38 BDSG, da unter 20 Personen mit der automatisierten Verarbeitung beschäftigt; keine Kerntätigkeit i.S.v. Art. 37 DSGVO).

---

## VT-1 - Briefgenerierung und Versand

| Punkt | Inhalt |
|---|---|
| Zweck | Erstellung eines personalisierten Briefs an einen zuständigen Mandatsträger und Übermittlung des Briefs per Transaktions-E-Mail an den Nutzer. |
| Betroffene Personen | Websitenutzer, die das Formular freiwillig ausfüllen. |
| Datenkategorien | E-Mail-Adresse, Postleitzahl, Anliegentext (Freitext), optional: Name, Parteizugehörigkeit, Organisationszugehörigkeit, Tonalität, gewünschte Brieflänge, optional: Audioaufnahme. |
| Besondere Kategorien (Art. 9) | Politische Meinung (zwangsläufig); fallweise Gesundheit, Religion, Weltanschauung, Gewerkschaftszugehörigkeit (je nach Anliegen). |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b DSGVO (Erfüllung der Anfrage); für besondere Kategorien zusätzlich Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung durch Absenden). |
| Empfänger / Auftragsverarbeiter | Vercel Inc. (Hosting, Region fra1 / Frankfurt); Mistral AI SAS, Paris (Brief-Generierung, Moderation, Spracherkennung); Brevo SAS, Paris (Transaktionsmail-Versand). |
| Drittlandtransfer | Vercel Inc. (USA): EU-U.S. Data Privacy Framework + ergänzende SCCs; Vercel-DPA: vercel.com/legal/dpa. Mistral & Brevo: kein Drittland (FR). |
| Speicherfrist | Auf eigenen Servern: keine Speicherung. Vercel-Logs: bis zu 30 Tage. Mistral API-Logs: typischerweise bis zu 30 Tage. Brevo Versandlogs: typischerweise wenige Tage bis Wochen. |
| TOMs (Art. 32) | TLS, Server-Region EU (Frankfurt), Rate-Limiting, Input- und Output-Moderation, Zod-Validierung, HTML-Escaping in der ausgehenden Mail, Security-Header (HSTS, X-Frame-Options, Permissions-Policy etc.), API-Keys ausschließlich serverseitig in Vercel-Env-Vars. |

---

## VT-2 - Schutz vor Missbrauch (Rate Limiting)

| Punkt | Inhalt |
|---|---|
| Zweck | Abwehr automatisierter Massenanfragen und Schutz von Mandatsträgern vor missbräuchlichen Briefen. |
| Betroffene Personen | Alle Websitenutzer. |
| Datenkategorien | IP-Adresse, E-Mail-Adresse (in Kleinbuchstaben). |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Missbrauchsschutz). |
| Empfänger | Keine externen Empfänger. Verarbeitung ausschließlich im flüchtigen Arbeitsspeicher der Vercel-Server-Instanz. |
| Drittlandtransfer | Keiner (Region fra1). |
| Speicherfrist | 1 Stunde (IP) bzw. 24 Stunden (E-Mail), automatisch bei Instanz-Neustart oder Scale-Down verworfen. Keine Persistierung. |
| TOMs | In-Memory-Map; kein Disk-Write; pruning nach Ablauf des Zeitfensters. |

---

## VT-3 - Hosting und technische Logs

| Punkt | Inhalt |
|---|---|
| Zweck | Bereitstellung der Website, Sicherstellung der Verfügbarkeit, Fehleranalyse, Abwehr von Angriffen. |
| Betroffene Personen | Alle Websitenutzer. |
| Datenkategorien | IP-Adresse, Zeitpunkt, User-Agent, angefragter Pfad, Statuscode. |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO. |
| Empfänger | Vercel Inc. als Auftragsverarbeiter. |
| Drittlandtransfer | USA: DPF + SCCs (siehe VT-1). |
| Speicherfrist | Bis zu 30 Tage bei Vercel. |
| TOMs | Vercel-eigene Sicherheitsmaßnahmen (SOC 2, ISO 27001), eingegrenzt durch Vercel-DPA. |

---

## VT-4 - Kommunikation per E-Mail (Anfragen, Betroffenenrechte)

| Punkt | Inhalt |
|---|---|
| Zweck | Beantwortung von Anfragen (Art. 15-22 DSGVO, Support, Feedback). |
| Betroffene Personen | Personen, die freiwillig per E-Mail Kontakt aufnehmen. |
| Datenkategorien | Absender-Adresse, Inhalt der Nachricht. |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO; bei Anfragen nach Art. 15 ff.: Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung). |
| Empfänger | Posteo e.K., Berlin (Mail-Provider von thomas_lorenz@posteo.de). |
| Drittlandtransfer | Keiner (DE). |
| Speicherfrist | Bis Erledigung des Anliegens; bei nachweispflichtigen Vorgängen (z. B. Auskunft) 3 Jahre. |

---

## Auftragsverarbeiter im Überblick

| Verarbeiter | Sitz | Zweck | DPA / AVV |
|---|---|---|---|
| Vercel Inc. | Walnut, CA, USA (Region fra1 / Frankfurt) | Hosting | https://vercel.com/legal/dpa |
| Mistral AI SAS | Paris, FR | KI-Briefgenerierung, Moderation, Spracherkennung | https://mistral.ai/terms#data-processing-agreement |
| Brevo SAS | Paris, FR | Transaktionsmail-Versand | https://www.brevo.com/legal/termsofuse/dpa/ |
| Posteo e.K. | Berlin, DE | E-Mail-Postfach für Verantwortlichen | https://posteo.de/site/datenschutz |
