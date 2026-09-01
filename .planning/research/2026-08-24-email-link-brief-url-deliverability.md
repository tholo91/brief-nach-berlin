# Vollständigen Brief in einen E-Mail-Link packen

Stand: 24.08.2026
Recherchefrage: Ist ein kompletter Brief als `mailto:`-Body sinnvoll, und welche Best Practices gelten für URL-Länge, Tracking, Zustellbarkeit und URL-Shortener?

## Kurzfazit

Ein vollständiger Brief in einem `mailto:`-Link ist als optionale Komfortfunktion technisch möglich, aber nicht als alleiniger Versandweg empfehlenswert. RFC 6068 definiert `body`, weist aber ausdrücklich darauf hin, dass es primär für kurze Textnachrichten zur automatischen Verarbeitung gedacht ist, nicht für allgemeine MIME-Mailbodys. Außerdem hängt die Auflösung vom Mailprogramm des Nutzers ab; es muss den vollständigen, dekodierten Text anzeigen und vor dem Senden die Bestätigung des Nutzers einholen.

Empfehlung für Brief nach Berlin: den bestehenden Copy/Paste- beziehungsweise Abschreib-Flow als verlässlichen Primärweg behalten. Falls ein E-Mail-CTA ergänzt wird, sollte er den bereits sichtbaren Brief in das lokale Mailprogramm vorbefüllen, ohne Tracking- oder Shortener-Link. Für einen Link aus einer von Brief nach Berlin versendeten E-Mail sollte die URL nur einen kurzen, zufälligen, zweckgebundenen Token enthalten; der Brief bleibt serverseitig und wird nicht als Klartext, Base64 oder JWT in der URL abgelegt.

## Belegte Aussagen

### 1. `mailto:` und kompletter Brief

- RFC 6068 erlaubt Headerfelder und einen `body`-Wert in `mailto:`-URIs.
- Der `body`-Wert ist für den ersten `text/plain`-Bodyteil gedacht und laut RFC primär für kurze Nachrichten zur automatischen Verarbeitung, nicht für allgemeine MIME-Bodys.
- Leerzeichen, Zeilenumbrüche und reservierte Zeichen müssen percent-encodiert werden; Zeilenumbrüche im Body müssen als `%0D%0A` codiert werden. Dadurch kann der Link deutlich länger als der sichtbare Brief werden.
- Mailprogramme dürfen Headerfelder begrenzen oder ignorieren. Sie müssen mindestens `subject` und `body` korrekt unterstützen, aber die Spezifikation garantiert keine identische UX über alle Mailprogramme.
- Das Mailprogramm soll den vollständigen dekodierten Text zeigen und vor dem Senden die Zustimmung des Nutzers einholen. Ein `mailto:`-Link versendet also nicht selbsttätig.

Quelle: [RFC 6068, Abschnitte 2–5 und 7](https://www.rfc-editor.org/rfc/rfc6068.html).

### 2. URL-Länge

- RFC 3986 setzt für URIs keine allgemeine Längen- oder Ressourcengrenze; konkrete URI-Schemata und die jeweiligen Protokolle beziehungsweise Implementierungen dürfen einschränken.
- HTTP definiert keine universelle „sichere URL-Länge“. RFC 9110 definiert den Fehler `414 URI Too Long`, wenn ein Server eine Ziel-URI nicht interpretieren will oder kann. RFC 7230 nannte als praktische Mindestempfehlung für HTTP/1.1 eine Unterstützung von mindestens 8.000 Oktetten für die Request-Line; RFC 7230 ist inzwischen durch RFC 9110 teilweise abgelöst.
- WHATWG standardisiert Parsing, Serialisierung und Percent-Encoding von URLs, aber keinen universellen Grenzwert für die Gesamtlänge.

Quellen: [RFC 3986, Abschnitte 1.2 und 7](https://www.rfc-editor.org/rfc/rfc3986.html), [RFC 9110, Abs. 15.5.15](https://www.rfc-editor.org/rfc/rfc9110.html#name-414-uri-too-long), [RFC 7230, Abs. 3.1.1](https://www.rfc-editor.org/rfc/rfc7230.html#section-3.1.1), [WHATWG URL Standard](https://url.spec.whatwg.org/).

### 3. Tracking und Brevo

- Brevo verwendet bei normalen HTTP-Links eine Redirect-URL, um Klicks zu messen; dabei sieht der Empfänger kurz eine andere URL.
- Brevo schließt `mail_to`-Links aus den Click-Metriken aus; sie erscheinen auch nicht in der Click-Heatmap.
- Brevo bietet anonymisiertes Open- und Click-Tracking für Kampagnen und Transaktionsmails. Dabei bleiben aggregierte Kennzahlen erhalten, werden aber nicht mit einzelnen Kontakten verknüpft.
- Brevo empfiehlt für Zustellbarkeit einen eigenen gebrandeten Tracking-Subdomain statt der generischen Brevo-Tracking-Domain.

Quellen: [Brevo: Warum ist die URL meiner Links anders?](https://help.brevo.com/hc/en-us/articles/209421325-Why-is-the-URL-of-my-links-different-from-what-I-have-chosen), [Brevo: Kampagnenbericht](https://help.brevo.com/hc/en-us/articles/19764406559506-Analyze-and-export-your-email-campaign-report), [Brevo: anonymisiertes Tracking](https://help.brevo.com/hc/en-us/articles/11643306229906-Can-I-anonymize-the-tracking-of-opens-and-clicks-for-my-emails), [Brevo: gebrandete Subdomain](https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability).

### 4. Spam und Deliverability

- Google verlangt beziehungsweise empfiehlt für relevante Versandklassen SPF/DKIM, gültiges DNS, TLS, RFC-5322-konforme Nachrichten und niedrige Spamraten. Für Bulk-Sender an persönliche Gmail-Konten kommen DMARC, Domain-Alignment und One-Click-Unsubscribe für Marketing-/Subscription-Mails hinzu.
- Google verlangt für Marketing-/Promotional-Mails die List-Unsubscribe-Header nach RFC 8058. Ein `mailto:`-Unsubscribe-Link im Nachrichtenkörper erfüllt diese One-Click-Anforderung nicht. Transaktionale Nachrichten sind von dieser speziellen One-Click-Anforderung ausgenommen.
- Google empfiehlt, dass Weblinks im Nachrichtenkörper sichtbar und verständlich sind, damit Empfänger wissen, wohin sie klicken.
- Yahoo bewertet unter anderem URL-, Domain-, IP- und Sender-Reputation. Yahoo verlangt für Bulk-Sender einen funktionierenden List-Unsubscribe-Mechanismus mit One-Click-Unterstützung und einen sichtbaren Abmeldelink im Body.
- Microsoft Defender führt „excessive links“ und „URL shorteners“ ausdrücklich als mögliche Content-Trigger für Spamklassifizierung auf. Das ist ein möglicher Filterfaktor, keine Aussage, dass jeder Shortener zwangsläufig blockiert wird.
- Brevo rät ausdrücklich von URL-Shortenern wie bit.ly oder goo.gl ab, weil sie mit Spamfiltern verbunden sind, und empfiehlt vollständige beziehungsweise gebrandete Links.

Quellen: [Google Email Sender Guidelines](https://support.google.com/mail/answer/81126), [Google FAQ zu One-Click-Unsubscribe](https://support.google.com/mail/answer/14229414), [Yahoo Sender Best Practices](https://senders.yahooinc.com/best-practices/?is_listing=false), [Yahoo Sender FAQ](https://senders.yahooinc.com/faqs/), [Microsoft Defender Anti-spam FAQ](https://learn.microsoft.com/en-us/defender-office-365/anti-spam-protection-faq), [Brevo Best Practices](https://help.brevo.com/hc/en-us/articles/360020418259-Best-practices-for-email-deliverability), [Brevo Gmail Deliverability](https://help.brevo.com/hc/en-us/articles/36039161138706-Troubleshooting-Deliverability-issues-with-Gmail).

### 5. Stateful oder signierte Links

- RFC 6750 warnt, dass Token in URL-Queries mit hoher Wahrscheinlichkeit in Browserhistorien, Serverlogs und anderen Stellen auftauchen, und empfiehlt, Bearer-Tokens nicht in Seiten-URLs zu übergeben.
- Wenn ein Token-Link unvermeidbar ist, empfiehlt RFC 6750 unter anderem TLS, kurze Laufzeiten und eine Einschränkung des Geltungsbereichs.
- Supabase dokumentiert signierte URLs als zeitlich begrenzte URLs; die konkrete Dokumentation betrifft Storage-Dateien, bestätigt aber das Grundmuster aus kurzer Laufzeit und signiertem Zugriff.

Quellen: [RFC 6750, Abschnitte 2.3 und 5](https://www.rfc-editor.org/rfc/rfc6750.html), [Supabase: createSignedUrl](https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl).

## Schlussfolgerungen für Brief nach Berlin

1. **Kein kompletter Brief als einziges `mailto:`-Verhalten.** Es kann als Zusatz-CTA sinnvoll sein, wenn der Nutzer explizit „per E-Mail öffnen“ wählt. Die Funktion sollte klar „E-Mail öffnen und prüfen“ heißen. Copy/Paste und Abschreiben bleiben die robusteren Wege.
2. **Kein harter Standardwert wie „2.000 Zeichen sind sicher“.** Für einen vollständigen Brief ist die relevante Größe die fertig percent-encodierte URI, nicht die sichtbare Zeichenzahl. Eine konkrete Obergrenze müsste empirisch auf den unterstützten Desktop-/Mobil-Mailprogrammen getestet werden.
3. **Praktisches Engineering-Budget:** Wenn ein `mailto:`-Link eingesetzt wird, ihn deutlich unter typischen HTTP-Grenzen halten und bei Überschreitung auf Copy/Paste beziehungsweise einen kurzen HTTPS-Zustandslink ausweichen. Die Grenze ist eine Produktentscheidung, keine RFC-Garantie.
4. **Kein URL-Shortener.** Ein Shortener verkürzt zwar die sichtbare URL, fügt aber eine zusätzliche Redirect-Domain und einen weiteren Vertrauens-/Reputationspunkt hinzu. Für Brief nach Berlin ist eine eigene, verständliche HTTPS-Domain beziehungsweise Subdomain besser.
5. **Keine personenbezogenen oder inhaltlichen Klartextdaten in URLs.** Brieftext, Anliegen, E-Mail-Adresse, PLZ und Empfängerdaten gehören nicht in Querystring, Fragment, Base64 oder JWT. Bei einem HTTPS-Link nur einen zufälligen, kurzen, zweckgebundenen Token verwenden; serverseitig den Brief referenzieren, Ablauf und Zweck prüfen und nach Einlösung auf eine URL ohne Token weiterleiten. Das ist eine aus RFC 3986/RFC 6068/RFC 6750 und dem Datenschutzkontext abgeleitete Empfehlung.
6. **Tracking standardmäßig aus.** Bei dieser Funktion ist der Klick auf „E-Mail öffnen“ kein belastbarer Nachweis, dass der Brief versendet wurde. Brevo zählt `mailto:` ohnehin nicht als normale Klickmetrik; individuelles Tracking würde zusätzlich Datenschutz- und Vertrauenskosten erzeugen.

## Nicht belegt / bewusst offen

- Es gibt keine Primärquelle, die eine universell funktionierende maximale `mailto:`-Länge für Apple Mail, Outlook, Gmail, Android-Mailclients und Webmail festlegt.
- Es gibt keine belastbare Primärquelle für die pauschale Aussage „lange URLs landen im Spam“. Die offiziellen Quellen belegen stattdessen einzelne Filterfaktoren wie URL-Shortener, übermäßige Links, URL-/Domain-Reputation, Authentifizierung und Nutzerbeschwerden.
- Ein HMAC- oder signierter Token ist nicht automatisch vertraulich: Wenn der Token selbst oder sein Payload sensible Daten enthält, können diese weiterhin aus URL, Logs oder Referrern sichtbar werden. Die Empfehlung für Brief nach Berlin ist deshalb ein opaker Referenz-Token mit serverseitigem Zustand, nicht ein signiertes Klartext-Payload.
