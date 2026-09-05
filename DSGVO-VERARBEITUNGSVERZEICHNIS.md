# Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

**Verantwortlicher:** Thomas Lorenz, Zur Plangemühle 5, 47198 Duisburg, Deutschland
**Kontakt:** thomas_lorenz@posteo.de
**Dienst:** Brief-nach-Berlin (brief-nach-berlin.de)
**Stand:** 2026-09-02

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
| Speicherfrist | Auf eigenen Servern: keine Speicherung des Anliegen- oder Brief-Volltexts. Vercel-Logs: gemäß aktuellem Hosting-Tarif und verifizierter Projekteinstellung. Mistral-Ein- und Ausgaben: gemäß verifizierter API-Privacy-Einstellung; Zero Data Retention muss vor Aktivierung der Themensignale im Admin-Panel nachgewiesen werden. Brevo: Transaktionslogs werden laut Anbieter standardmäßig unbegrenzt gespeichert; vor Livegang muss eine begrenzte Retention gesetzt und das Speichern von E-Mail-Previews deaktiviert bzw. begründet werden. |
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

## VT-5 - Nutzer-Bewertungen (Reviews)

| Punkt | Inhalt |
|---|---|
| Zweck | Produktverbesserung anhand von Nutzer-Feedback; optional: anonymisierte öffentliche Anzeige als Social Proof. |
| Betroffene Personen | Nutzer, die nach Brief-Versand freiwillig auf den Sterne-Link in der Mail klicken und das Bewertungs-Formular absenden. |
| Datenkategorien | Sterne-Bewertung (1-5), optional Kommentar, optional Name/Pseudonym, Consent-Flag, E-Mail-Adresse (aus signiertem Link), Politiker-ID + PLZ + technische Brief-Metadaten (intern), pseudonymisierter IP-Hash, Zeitstempel. |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für die öffentliche Anzeige; Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Produktverbesserung) für die interne Auswertung. |
| Empfänger | Supabase Inc. (Auftragsverarbeiter), Server-Region Frankfurt (eu-central-1). |
| Drittlandtransfer | Keiner (Server in EU/DE). Supabase Inc. ist in den USA ansässig; Datenverarbeitung erfolgt in der EU-Region. |
| Technische Sicherheit | Schreibzugriff nur server-seitig mit Service-Role-Key; RLS-Policy schränkt Lesezugriff via anon-Key auf consented Rows ein. Bewertungs-Link ist HMAC-signiert, ungültige Tokens werden ohne DB-Schreibvorgang abgewiesen. IP wird per HMAC-SHA256 (Salt: `REVIEW_IP_SALT`) pseudonymisiert. |
| Speicherfrist | Maximal 24 Monate. Löschung auf Anfrage jederzeit per E-Mail an datenschutz@brief-nach-berlin.de. |

---

## VT-6 - Freiwillige Themensignale

| Punkt | Inhalt |
|---|---|
| Zweck | Interne Auswertung freiwillig geteilter Themen und politischer Ebenen sowie unmittelbare Anzeige des zugehörigen PLZ-Kartenpunkts. Keine Werbung, kein Verkauf und kein individuelles politisches Profiling. |
| Betroffene Personen | Nutzer, die auf der Successpage ausdrücklich und freiwillig zustimmen. Die Brief-Erstellung funktioniert auch ohne Zustimmung. |
| Datenkategorien | Normalisierte Klartext-E-Mail, fünfstellige PLZ, daraus abgeleitete Kartenposition und Bundesland, gewählte politische Ebene, 1-3 erlaubte Oberkategorien, 1-3 minimierte Unterthemen, Zeitpunkt, optionaler Kampagnen-Slug, zufällige `letter_id`, HMAC der normalisierten E-Mail und versionierter Einwilligungsnachweis. |
| Nicht gespeicherte Daten | Kein Brieftext, kein Anliegen-Volltext, kein Name, keine Empfängerperson und keine IP-Adresse. |
| Besondere Kategorien (Art. 9) | Das Themensignal kann politische Meinungen oder andere besondere Kategorien mittelbar erkennen lassen. Die Daten sind pseudonymisiert, nicht anonym. |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO und, soweit besondere Kategorien betroffen sind, Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung). |
| Empfänger / Auftragsverarbeiter | Supabase Inc. (Speicherung in der EU-Region); Mistral AI SAS (Ableitung des minimierten Themensignals im ohnehin erforderlichen Routing-/Generierungsaufruf). |
| Drittlandtransfer | Gemäß den jeweils aktuellen AVV, Subprozessoren und verifizierten Account-/Regionseinstellungen. Vor Livegang gesondert zu dokumentieren. |
| Speicherfrist | Bis zum Widerruf, Ende des dokumentierten Analysezwecks oder Projektende. Eine fehlgeschlagene Briefgenerierung löscht den freiwilligen Kartenbeitrag nicht. |
| Betroffenenrechte | Widerruf und Löschung über den Link „Meine gespeicherten Daten löschen“ in der Feedback-Mail. Die vorbefüllte E-Mail muss von der betroffenen Person abgesendet werden. Die Wartungsroutine zeigt zuerst einen Dry-Run und löscht erst nach gesonderter Bestätigung Reviews und Themensignale. |
| Technische Sicherheit | Zufällige `letter_id`; HMAC-Verknüpfung zur E-Mail; kurzlebige signierte Kontexte; serverseitige Prüfung der beim Opt-in übermittelten Klartext-E-Mail; Service-Role-Zugriff; `ENABLE/FORCE RLS`; vollständige Revokes für `anon`, `authenticated` und `PUBLIC`; keine öffentliche Rohdaten-View. |
| Öffentliche Nutzung | Ab dem ersten freiwilligen Beitrag erscheint ein projizierter Punkt am ungefähren Mittelpunkt der fünfstelligen PLZ. Die API gibt nur Koordinaten, aggregierte Anzahl und Summen aus, aber keine PLZ, E-Mail, Themen, `letter_id` oder Einzelzeitpunkte. Die Position kann die ungefähre PLZ-Region erkennen lassen. |

---

## Auftragsverarbeiter im Überblick

| Verarbeiter | Sitz | Zweck | DPA / AVV |
|---|---|---|---|
| Vercel Inc. | Walnut, CA, USA (Region fra1 / Frankfurt) | Hosting | https://vercel.com/legal/dpa |
| Mistral AI SAS | Paris, FR | KI-Briefgenerierung, Moderation, Spracherkennung und minimierte Themenableitung. Training-Opt-out und Zero Data Retention sind getrennte Einstellungen und vor Livegang im Admin-Panel zu verifizieren. | https://legal.mistral.ai/terms/data-processing-addendum |
| Brevo SAS | Paris, FR | Transaktionsmail-Versand und einmalige Feedback-Mail; Account-Retention und Preview-Speicherung vor Livegang prüfen. | https://www.brevo.com/legal/termsofuse/dpa/ |
| Supabase Inc. | San Francisco, CA, USA (Region eu-central-1 / Frankfurt) | Datenbank-Speicherung von Nutzer-Bewertungen und freiwilligen Themensignalen | https://supabase.com/legal/dpa |
| Posteo e.K. | Berlin, DE | E-Mail-Postfach für Verantwortlichen | https://posteo.de/site/datenschutz |
