# Brief-nach-Berlin: To-dos nach dem Abendreview

Stand: 13.10.2026. Grundlage: [Review vom 12.10.](2026-10-12-code-review.md) und anschließende Rückfragen von Thomas. Diese Datei ist ein Umsetzungsbriefing, keine Freigabe für Produktivänderungen. In der Planungsrunde wurde kein Anwendungscode geändert.

## Festgehalten und noch offen

1. **Debug behalten:** Thomas ist mit den aktuell sichtbaren Diagnosedaten zufrieden. Anliegen-/Briefauszüge, Routing, Empfänger, Modell, Laufzeit, Längenprüfung und Codeversion dürfen nicht ersatzlos verschwinden.
2. **Kampagnenentscheidung bestätigt (2A):** Pausierte, freigegebene Kampagnen bleiben über ihren Direktlink erreichbar und können weiterhin Briefe erzeugen. Sie sollen nicht in öffentlichen Empfehlungs-/Aktivlisten erscheinen. In der eigenen Verwaltung müssen sie weiterhin auffindbar bleiben.
3. **Debug-Transport noch offen:** Vorgeschlagen ist `#d=` statt `?d=` bei neuen Links, gleiche Anzeige, Nutzer-E-Mail nur aus dem versteckten Debug-Link-Payload entfernen, PLZ für Diagnose behalten. Thomas hat nach der Bedeutung gefragt; die Erklärung wurde gegeben, die anschließende Auswahl ist bei Erstellung dieses Briefings noch nicht beantwortet. Alternative: vorerst nur Analytics schützen und Debuglinks unverändert lassen. Keine stillschweigende Zustimmung behaupten.

Fragment bedeutet hier den Linkteil nach `#`: Beim Öffnen von `/debug#d=DATEN` fordert der Browser beim Webserver `/debug` an. Die Debug-Seite liest den Datenblock anschließend im Browser und zeigt dieselbe Diagnose. Der Link selbst enthält weiterhin lesbare Daten; er ist nicht verschlüsselt. Neue Links benötigen JavaScript, alte Query-Links sollen weiterhin funktionieren. Der Fragmentwechsel ersetzt den zentralen Analytics-Schutz nicht, weil JavaScript auch Fragmente auslesen kann.

## Aktuell im Codex-Browser geprüft: Brevo

| Bereich | Sichtbarer Stand am 13.10.2026 | Konsequenz |
| --- | --- | --- |
| [Tracking](https://app.brevo.com/transactional/email/settings/tracking) | **Anonymes E-Mail-Tracking: Ja.** Beschreibung: Öffnungen/Klicks werden gezählt, aber nicht bestimmten Kontakten zugeordnet. | Aggregierte Opens/Klicks sind damit erklärbar. Nicht mit „Tracking ausgeschaltet“ gleichsetzen; keine rechtliche Unbedenklichkeit daraus ableiten. |
| [Aufbewahrung](https://app.brevo.com/transactional/email/settings/retention-rules) | **Alle Absender: ein Monat. Vorschau nie aufbewahren.** | Diese Regeln erhalten; kein belegter Bedarf für eine Konfigurationsänderung. |
| [Kontonutzung](https://app.brevo.com/billing/account/plans/subscriptions) | Starter, monatliche Abrechnung, **10.000 Marketing-/Transaktionsmails**, davon **2.377 übrig**. Erneuerung am **17.10.2026, 21:42 laut Oberfläche**. | Aktuelle Restkapazität prüfen, bevor eine Tarifentscheidung getroffen wird. Zahlen sind eine Momentaufnahme des Accounts. |
| [Rechnungen](https://app.brevo.com/billing/account/plans/billing-history) | Nächste Rechnung: **14,00 € netto + 2,66 € MwSt. = 16,66 € monatlich**. | Tatsächlich gebuchter Preis belegt; Preisvergleich oder Tarifwechsel nicht Teil der Freigabe. |
| Warteschlangenanzeige | **0 pausierte E-Mails.** | Das ist keine Aussage über die Zahl bereits geplanter Follow-ups. Diese Zahl bleibt offen. |

Beim ersten Öffnen der Tracking-Seite erschien unerwartet eine Bestätigung, dass Einstellungen zum anonymen Tracking gespeichert wurden. Der Agent hat ausschließlich Navigation ausgelöst und keinen Radio-Schalter oder Speichern-Button betätigt. Ursache und Zustand vor dieser Meldung sind nicht nachgewiesen; deshalb nur den danach sichtbar ausgewählten Zustand als aktuell belegt behandeln. Keine eigenmächtige Rückänderung vornehmen.

Die Anbieterzahlen vom 12.10. zeigten zuletzt etwa 1.000 Mailrequests täglich im Account. **Ableitung, keine Zusage:** Bei anhaltendem Volumen könnten 2.377 Mails vor der Erneuerung knapp werden. Vor weiteren Entscheidungen aktuelle Tagesrate und bereits geplante Mails lesen; nicht automatisch upgraden oder Follow-ups abschalten.

## Die fünf Aufgaben

### 1. Analytics zentral absichern

**Ziel:** Anliegen, E-Mails und Berechtigungslinks dürfen nicht in vorbereiteten Analytics-URL-Nutzlasten auftauchen. Normale Seitenstatistik erhalten.

Dateigrenze: `web/src/components/AnalyticsWrapper.tsx` und eigener fokussierter Privacy-Test. Falls ein kleiner testbarer URL-Helper nötig ist, kein zusätzliches Package einführen.

Erwartetes Verhalten:

- `/feedback`, `/debug`, `/datenloeschen` und `/kampagne/verwalten/uebernehmen` inklusive passender Unterpfade ausschließen.
- Bei übrigen erlaubten URLs `search` und `hash` aus der Event-URL entfernen. Die tatsächlich geöffnete Nutzer-URL dabei nicht umschreiben; Links/Formulare bleiben funktionsfähig.
- Unlesbare/ungültige Event-URLs nicht ungeprüft durchlassen.
- Kampagnen-Slugs im Pfad und normale Seitenaufrufe erhalten. Welche Attribution außerhalb der URL der SDK separat führt, nicht ungeprüft als bereinigt behaupten.

**Abnahme:** Synthetische Marker für Anliegen, E-Mail, Lösch-/Übernahme-Token erreichen die zurückgegebene Analytics-Nutzlast nicht. Bestehender Feedback-Ausschluss, gewöhnliche Seiten, Query + Fragment gemeinsam und ungültige URLs sind getestet. Mit dem tatsächlich verwendeten SDK-Vertrag prüfen, nicht nur auf Quelltextzeichenfolgen testen. Keine echten Tokens oder produktiven Analytics-POSTs für die Prüfung verwenden.

### 2. Debug-Anzeige erhalten; Transport nach Entscheidung verbessern

**Nur nach Bestätigung des Fragmentvorschlags:** Neue HTML-Mail-Debuglinks auf `#d=` umstellen. Beide Generatoren berücksichtigen:

- `web/src/lib/email/buildEmailHtml.ts` für Erstmail/Resend;
- `web/src/lib/email/buildVariantEmailHtml.ts` für Varianten;
- `web/src/app/debug/page.tsx` und eine kleine Client-Komponente für das Fragmentlesen.

`web/src/app/debug/formatDebug.ts` möglichst unverändert nutzen. Keine neue Datenbank, Anmeldung, Verschlüsselungsinfrastruktur oder Template-Engine. Eine Meldung für deaktiviertes JavaScript vorsehen; keine fehlerhafte „Missing ?d=“-Anzeige während des regulären Fragment-Ladens. Metadata/noindex auf dem Server erhalten.

**Wichtige Fachgrenze:** `buildDebugPayload` ist auch Grundlage des signierten Feedback-Tokens. `sendLetterEmail.ts:167–175` kopiert den Payload und entfernt dort nur `issueTextPreview`; `submitReview.ts` benötigt die E-Mail für Review-Zuordnung und spätere Löschbarkeit. Deshalb die Nutzer-E-Mail ausschließlich auf einer Kopie beim Serialisieren des Debuglinks entfernen. Feedback- und Lösch-Tokens, Mail-Empfänger und gespeicherte Review-Zuordnung unverändert lassen. Nutzer-PLZ und alle bisher sichtbaren Diagnosefelder erhalten.

**Abnahme:** Neue Links enthalten kein `d` in der Query; ursprüngliche Standard-/Varianten-Diagnose bleibt darstellbar. Unicode/Umlaute/Emoji, fehlerhafte Base64-/JSON-Daten, fehlende Daten und alte `?d=`-Links testen. Synthetische E-Mail fehlt im neuen Debug-Payload, aber Feedback-/Löschpfade behalten ihre benötigten Identitätsdaten. Erstmail, Resend und Varianten berücksichtigen. Kein separater Debug-Link im aktuell geprüften Plaintext-Builder gefunden; bei Umsetzung erneut gezielt nach Generatoren suchen.

**Restgrenzen ausdrücklich benennen:** Daten bleiben im Mail-Link und beim Weitergeben lesbar. Alte Query-Links haben ihren Inhalt bereits im ersten HTTP-Request; Kompatibilität löscht weder alte Mail-Links noch frühere Logs. Der Analytics-Ausschluss gilt auch für alte Links. Kein globales „es wird nirgends gespeichert“ versprechen.

**Falls Thomas den Transportwechsel verschiebt:** Nur Aufgabe 1 durchführen und Debug-Anzeige unverändert lassen; kein ersatzloses Entfernen von Diagnoseinhalten.

### 3. Pausierte Kampagnen korrekt beschreiben und Listen aktualisieren

Dateigrenze: `web/src/lib/actions/pauseCampaign.ts`, gezielte Tests; zusätzliche Dateien nur bei konkret belegtem fehlendem Verhalten.

Falschen Erfolgstext ersetzen, etwa: „Kampagne pausiert. Sie bleibt über ihren Link nutzbar und erscheint nicht mehr in öffentlichen Listen.“ Startseite beim Pausieren gezielt revalidieren. Weitere öffentliche Listen nur einbeziehen, wenn sie tatsächlich gecachte aktive Kampagnen zeigen. Keine neue umfassende Cache-Abstraktion.

**Abnahme:** Pausierte, freigegebene, nicht beendete Kampagne bleibt per Direktlink erreichbar und generierbar; aus öffentlichen aktiven/kuratierten Listen verschwindet sie. Creator-Verwaltung bleibt nutzbar. Beendete oder nicht freigegebene Kampagnen werden dadurch nicht freigeschaltet. Action-Test prüft Text und Revalidierung. Bestehende Autorisierung unangetastet lassen.

### 4. Brevo-Annahmen und Kontingent abgleichen

Lead-Aufgabe, lesende Account-Prüfung plus kleine Dokumentations-/Kommentaränderungen nach Umsetzungsfreigabe. **Keine Provider-Einstellung oder Tarifänderung aus dieser Liste ableiten.**

- Aktuelles Restkontingent, Tagesrate und geplante Follow-ups lesen; bei drohender Erschöpfung konkrete Optionen mit Preis/Umfang vorlegen. Kein Kauf, Upgrade, zusätzliches Kontingent oder Deaktivieren geplanter Mails ohne ausdrücklichen Auftrag.
- Falsche Aussagen „Open-/Click-Tracking global ausgeschaltet“ in `sendLetterEmail.ts`, `sendFollowupEmail.ts` und der Env-Vorlage mit dem tatsächlich verifizierten anonymisierten Tracking abgleichen. Keine pauschale Rechtsaussage über erforderlichen Consent durch eine andere ungesicherte Rechtsaussage ersetzen.
- `web/src/app/(site)/datenschutz/page.tsx:365–370` beschreibt einen zukünftigen Aufbewahrungscheck. Die aktuellen konkreten Regeln und den Debug-Datenfluss sachlich abgleichen; Änderungen am öffentlichen Text reviewbar halten. Die aktuelle UI-Einstellung belegt keine rückwirkende Konfiguration aller versandten Mails.
- Einen datierten Nachtrag zum Review oder Verweis auf dieses Briefing ergänzen; historische Messungen und Preise nicht rückwirkend umschreiben.

### 5. Integrieren, verifizieren und Ergebnis zur Freigabe zeigen

Lead liest aktuelle Anweisungen, prüft Git-/Remote-Stand und vorhandene Änderungen vor dem Start. Der zuletzt geprüfte lokale Stand ist `main`, zwei Commits vor dem gecachten Remote, mit bestehenden Änderungen in Kampagnen-, Stats- und Maildateien. Der Git-Fetch scheiterte zuletzt am Schreibschutz von `.git/FETCH_HEAD`; nicht als erfolgreichen Refresh ausgeben. Produktionsstand aus dem Review vom 12.10. ist ein datierter Snapshot, kein aktueller Deployment-Beweis.

Gezielte Tests während der Umsetzung, anschließend angemessener gemeinsamer Test-/Lint-/Typprüflauf. Der frühere Gesamtlauf hatte 130 Suites / 1.151 Tests; das ist kein Pass für neue Änderungen. Full Build nur mit sicherem Environment ohne echte AI-/Versandaufrufe; Blocker ausdrücklich melden. Der alte isolierte Build war durch Font-Downloads blockiert. Der integrierte Codex-Browser ist inzwischen verfügbar und kann für einen lokalen synthetischen Debug-/Navigationscheck genutzt werden; daraus keine echte Versand-/Inbox-Verifikation ableiten.

Geändertes Verhalten, Tests und verbleibende Grenzen kompakt berichten. Bestehende lokale Änderungen erhalten; keine Commit-/Push-/Deploy-, Versand- oder Produktivdatenänderung ohne gesonderten ausdrücklichen Auftrag.

## Aufteilung für Subagents

| Agent | Aufgabe / Grenze | Fertig, wenn |
| --- | --- | --- |
| Worker Analytics | Aufgabe 1, eigene Komponente/Helper und fokussierte Tests | Alle beschriebenen Markerfälle abgesichert, normale Seitenstatistik bleibt möglich. |
| Worker Debug | Aufgabe 2 nur nach geklärter Transportentscheidung; beide Debug-Link-Builder, Debug-Seite/Client, passende Tests | Bisherige Diagnose bleibt erhalten, neue/alte Links funktionieren, Feedback-Identität unverändert. |
| Worker Kampagnen | Aufgabe 3, Pause-Action und ihre Tests | Bestätigtes Direktlink-Verhalten erhalten, Text und Listenaktualisierung stimmen. |
| Lead | Entscheidungen, Aufgabe 4, Integration und Aufgabe 5 | Änderungen zusammen geprüft, keine unbeabsichtigte Überschneidung/Produktivaktion, belastbarer Abschlussbericht. |

Drei Worker können mit abgegrenzten Dateien parallel arbeiten. Jeder Auftrag nennt Ziel, Dateigrenze, Abnahmekriterien und verlangt eine kurze Zusammenfassung statt Logs. Keine Agenten sollen unabhängig an denselben Mail-Tests oder bestehenden lokalen Änderungen arbeiten. Keine neuen Worktrees allein zur Ablage fertiger Arbeit erzeugen; bei tatsächlich nötiger Isolation bestehenden Stand und Zusammenführung vorher klären.

## TL;DR

Analytics-Schutz ist der erste kleine Code-Schritt. Debug bleibt erhalten; der Transportwechsel ist vorgeschlagen und noch zu bestätigen. Kampagnenentscheidung 2A ist bestätigt. Brevo ist aktuell auf anonymes Tracking, einen Monat Logs und keine Vorschauen eingestellt; der Tarif kostet 16,66 € inklusive MwSt., das Kontingent ist knapp und muss aktuell geprüft werden. Providerwechsel, große Refactors und neue Features bleiben außerhalb dieses Auftrags.
