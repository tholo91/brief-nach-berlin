# E-Mail-Link zum Briefentwurf anpassen

**Recherche- und Datumsstand:** 24.08.2026  
**Fragestellung:** Kann der komplette Brief in den Anpassungs-Link, und helfen Tiny-URLs oder andere Konventionen bei Usability und Zustellbarkeit?

## Kurzfazit

**Keinen generischen URL-Shortener wie TinyURL/bit.ly verwenden.** Brevo selbst warnt, dass URL-Shortener mit Spam assoziiert werden können, und empfiehlt vollständige Links sowie eine eigene gebrandete Tracking-Subdomain.

Der komplette Brief kann technisch in einem URL-Fragment (`#...`) transportiert werden. Das Fragment wird nicht an den Webserver gesendet und passt deshalb grundsätzlich zum bisherigen No-Storage-Ansatz. Es ist aber keine gute Standardlösung: Ein Brief mit 310–460 Wörtern wird als percent-encodierter oder Base64-URL-encodierter Payload schnell mehrere Kilobytes groß; E-Mail-Clients, Link-Tracking und Browser müssen diese lange URL unverändert durchreichen. Außerdem liegt der Brief im HTML der E-Mail, in der Browser-History und für lokale Mail-/Browser-Erweiterungen sichtbar vor.

**Empfohlener Produktweg:** ein eigener, kurzer, zufälliger und zeitlich begrenzter Draft-Link auf `brief-nach-berlin.de`, der auf einen kurzlebigen serverseitigen Entwurf zeigt. Das ist kein TinyURL-Dienst, sondern ein first-party Draft-Token. Für die Datenschutzkonventionen des Projekts sollte dieser Weg nur mit kurzer TTL, minimaler Speicherung, `no-store`, ohne Analytics-Payload und mit klarer Lösch-/Ablauflogik umgesetzt werden.

## Belegte Aussagen

### 1. URL-Länge und Fragmente

HTTP definiert keine allgemeine Maximalgröße für Request-Zeilen; RFC 9112 empfiehlt aber, mindestens 8.000 Oktette zu unterstützen, und sieht `414 URI Too Long` vor, wenn ein Empfänger die Ziel-URI nicht verarbeiten kann. Das ist keine harte Browsergrenze, aber ein guter Interoperabilitäts-Hinweis für sehr lange Links.

Quelle: [RFC 9112, Abschnitt 3](https://www.rfc-editor.org/rfc/rfc9112.html)

Ein URL-Fragment beginnt nach `#` und wird vor der Anfrage abgetrennt. Es wird bei HTTP nicht an den Server gesendet, sondern vom User Agent verarbeitet.

Quelle: [RFC 3986, Abschnitt 3.5](https://www.rfc-editor.org/rfc/rfc3986.html)

### 2. Deliverability und URL-Shortener

Brevo nennt URL-Shortener wie bit.ly ausdrücklich als möglichen Grund für Spam-Einstufung und empfiehlt vollständige Links. Brevo empfiehlt außerdem, statt der eigenen Standard-Tracking-Domain eine gebrandete Subdomain für Tracking- und Bild-Links einzurichten.

Quellen: [Brevo – Why are emails being delivered to the spam folder?](https://help.brevo.com/hc/en-us/articles/213888965-FAQs-Why-are-emails-being-delivered-to-the-spam-folder), [Brevo – Troubleshooting deliverability issues with Gmail](https://help.brevo.com/hc/en-us/articles/36039161138706-Troubleshooting-Deliverability-issues-with-Gmail), [Brevo – Domain setup for better email deliverability](https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability)

Google nennt für Zustellbarkeit vor allem Authentifizierung, niedrige Spam-Beschwerden, korrekte RFC-5322-Formatierung und verständliche, nicht irreführende Links. Eine pauschale Regel „lange URL = Spam“ ist in den offiziellen Sender Guidelines nicht dokumentiert.

Quelle: [Google – Email sender guidelines](https://support.google.com/mail/answer/81126)

Brevo erklärt, dass seine Link-Redirection die Klicks trackt und Empfänger anschließend zum ursprünglichen Ziel weiterleitet. Das erklärt die lange `sendibt2.com`-URL im beobachteten E-Mail-Link; die Länge stammt nicht zwingend aus dem eigentlichen Ziel-Link.

Quelle: [Brevo – Why is the URL of my links different from what I have chosen?](https://help.brevo.com/hc/en-us/articles/209421325-Why-is-the-URL-of-my-links-different-from-what-I-have-chosen)

## Lokaler Befund im Projekt

- `web/src/lib/email/buildEmailHtml.ts` erzeugt aktuell `/brief/anpassen#email=...` und optional `originalToneLevel`; der Brieftext wird bewusst nicht in der URL übertragen.
- `web/src/app/(site)/brief/anpassen/VariantForm.tsx` liest diese Hash-Daten clientseitig und fordert weiterhin das Einfügen des vollständigen Briefs aus der E-Mail.
- Die Brief-Längeneinstellungen liegen aktuell bei ca. 200–240, 310–350 und 420–460 Wörtern. Ein vollständiger Payload wäre daher nicht winzig, aber auch nicht zwangsläufig über jeder technischen Grenze.
- Die vorhandene Datenschutzlogik bevorzugt Stateless-/No-Storage-Flows. Ein Draft-Token wäre deshalb eine bewusste Produkt- und Datenschutzänderung, nicht nur eine Link-Kürzung.

## Optionen

| Weg | Nutzerkomfort | Zustellbarkeit/Kompatibilität | Datenschutz | Bewertung |
|---|---:|---:|---:|---|
| Volltext in Fragment, percent-encoded | hoch | mittel bis schlecht bei langen Briefen/Tracking | mittel | technisch möglich, nicht als erste Wahl |
| Volltext komprimiert in Fragment | hoch | mittel; Kompression/Decoding und Tracking testen | mittel | guter No-Storage-Prototyp, aber fragiler |
| Generischer Shortener | hoch | schlecht; Drittanbieter-/Redirect-Signal | schlecht bis mittel | vermeiden |
| Eigener Draft-Token mit kurzer TTL | sehr hoch | gut; kurzer first-party Link | gut, wenn sauber begrenzt | beste Produktlösung |
| Aktueller Flow, aber UX verbessern | mittel | sehr gut | sehr gut | günstigster Fallback |

## Praktische Empfehlung

1. Nicht den kompletten Brief in die URL und keinen generischen Shortener einführen.
2. Als nächste Produktiteration einen first-party Draft-Link prüfen: zufälliger Token, nur gehashter Token in der Speicherung, TTL z. B. 24 Stunden, einmalige oder begrenzte Nutzung, keine Briefdaten in Logs/Analytics, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`.
3. Vorher einen kleinen A/B-Test mit dem jetzigen Copy/Paste-Flow und dem Draft-Link vorbereiten. Erfolg messen: CTA-Klick → Anpassungsseite geladen → Anpassungsanfrage abgesendet; nicht nur Klickrate.
4. Unabhängig davon in Brevo eine gebrandete Tracking-Subdomain prüfen. Das verbessert Vertrauen/Markenkonsistenz stärker als eine Tiny-URL und folgt Brevos eigener Empfehlung.

## Offene technische Checks vor Umsetzung

- Behält Brevo bei der Link-Redirection Fragmente und sehr lange Ziel-URLs in allen relevanten Mailclients unverändert bei?
- Welche kurzlebige Speicherung ist mit den vorhandenen DSGVO-Dokumenten und der bestehenden Supabase-Nutzung vertretbar?
- Wird für diesen transaktionalen Briefversand wirklich Klicktracking benötigt, oder kann der Anpassungslink vom Tracking ausgenommen werden?
- Wie viele Empfänger:innen brechen heute zwischen E-Mail und manuellem Einfügen ab? Ohne diesen Baseline-Wert ist eine größere Link-Infrastruktur noch nicht validiert.

## Einordnung

Die Aussage „Encoding macht die E-Mail automatisch spamverdächtig“ ist zu stark. Die offiziellen Quellen belegen eher: Generische Shortener und fremde/irreführende Redirect-Domains sind ein Deliverability- und Vertrauensrisiko; für lange, verständliche, eigene URLs gibt es keine entsprechende pauschale Spamregel. Beim aktuellen Brevo-Setup ist die sichtbare technische Ziel-URL ohnehin ein Tracking-Redirect. Der größere praktische Risikoblock beim Volltext-Fragment ist deshalb nicht primär Spam, sondern Linklänge, Tracking-Kompatibilität, Datenschutz und Fehlersuche.
