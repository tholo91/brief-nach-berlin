---
created: 2026-10-13T00:00:00.000Z
title: "Analytics-URLs und Debugdaten schützen, pausierte Kampagnen korrekt behandeln"
area: privacy
severity: major
files:
  - web/src/components/AnalyticsWrapper.tsx
  - web/src/lib/email/buildDebugPayload.ts
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/lib/email/buildVariantEmailHtml.ts
  - web/src/app/debug/page.tsx
  - web/src/app/debug/formatDebug.ts
  - web/src/app/debug/
  - web/src/lib/actions/pauseCampaign.ts
  - web/src/app/page.tsx
  - web/src/lib/campaigns/repository.ts
  - web/src/lib/email/sendLetterEmail.ts
  - web/src/lib/email/sendFollowupEmail.ts
  - web/src/app/(site)/datenschutz/page.tsx
  - web/.env.example
  - docs/reviews/2026-10-12-code-review.md
  - docs/reviews/2026-10-13-follow-up-todos.md
---

> Folgestory aus dem Abendreview vom 12.10. und den geklärten bzw. noch offenen Rückfragen vom 13.10. Sie bündelt die kleine Analytics-Privacy-Korrektur, den optionalen Debug-Link-Transport, den bestätigten Kampagnen-Fix und den Abgleich der Brevo-Aussagen. Das ist ein Implementierungsbriefing für einen späteren Auftrag, keine Freigabe für Code-, Provider- oder Produktivänderungen.

## Story

Als Maintainer von Brief-nach-Berlin möchte ich verhindern, dass persönliche URL-Inhalte in Analytics-Nutzlasten gelangen, die sichtbare Diagnose für mich erhalten und pausierte Kampagnen in Text und öffentlichen Listen korrekt behandeln, damit Datenschutz, Fehlersuche und erwartbares Kampagnenverhalten zusammenpassen.

## Kontext und belegter Ausgangspunkt

### Analytics

- Im Review vom 12.10. war `web/src/components/AnalyticsWrapper.tsx` so umgesetzt, dass nur `/feedback` ausgeschlossen wurde. Das ausgelieferte Vercel-Insights-Skript las `location.href`.
- Das Skript wurde offline in einer VM mit synthetischen URLs ausgeführt; `fetch` war vollständig abgefangen. Die vorbereitete Nutzlast enthielt die ganze URL bei `/debug?d=…`, `/datenloeschen?t=…`, `/brief/anpassen#email=…` und `/kampagne/verwalten/uebernehmen?token=…`. Der Feedback-Ausschluss griff.
- **Belegt ist die Vorbereitung einer Analytics-Nutzlast, nicht** ein real zugestellter Analytics-Request oder eine Speicherung beim Anbieter. Für die Umsetzung keine echten Tokens und keine produktiven Analytics-POSTs verwenden.
- `noindex` und `no-referrer` verhindern nicht, dass JavaScript die aktuelle URL ausliest.

### Debug-Links und Identitätsdaten

- Debug-Daten werden ohne Anmeldung aus einem Base64-kodierten Link gelesen. Base64 ist lesbar/umkehrbar, keine Verschlüsselung. Linkbesitz reicht für den Zugriff auf die enthaltenen Daten.
- Die bisherigen Payloads enthalten je nach Mailpfad Anliegen-/Briefauszüge, Änderungswunsch, Nutzer-E-Mail, PLZ und technische Diagnosefelder. Die Prüfung vom 12.10. fand bis zu 2.000 Zeichen Anliegen im normalen Debug-Payload und bis zu 1.200 Zeichen Originalbrief bzw. Änderungswunsch in Varianten-Payloads.
- Thomas ist mit der derzeit sichtbaren Diagnose zufrieden. Anliegen-/Briefauszüge, Routing, Empfänger, Modell, Laufzeit, Längenprüfung und Codeversion dürfen nicht ersatzlos aus der Anzeige verschwinden.
- `buildDebugPayload` ist zugleich Grundlage eines signierten Feedback-Tokens. `sendLetterEmail.ts` kopiert den Payload und entfernt für den Feedback-Pfad nur `issueTextPreview`; die Review-Zuordnung und spätere Löschbarkeit benötigen die E-Mail. Deshalb dürfen gemeinsame Feedback-/Lösch-Identitätsdaten bei einer Debug-Link-Änderung nicht verändert werden.
- Der Review vom 12.10. empfahl allgemein, persönliche Inhalte aus Debug-URLs zu entfernen. Im Follow-up vom 13.10. wurde die engere, aktuelle Vorgabe festgehalten: Bei einer optionalen Umstellung auf `#d=` die Nutzer-E-Mail nur aus einer Kopie beim Serialisieren des Debug-Links entfernen; PLZ und die bisherigen Diagnosefelder erhalten. Die Entscheidung für diesen Transportwechsel ist **noch offen**.

### Pausierte Kampagnen

- Entscheidung **2A ist bestätigt**: Eine pausierte, freigegebene und nicht beendete Kampagne bleibt per Direktlink erreichbar und kann weiter Briefe erzeugen.
- Sie soll aus öffentlichen aktiven/kuratierten Listen verschwinden. In der eigenen Creator-Verwaltung bleibt sie auffindbar.
- Der aktuelle Erfolgstext von `pauseCampaign.ts` verspricht, die Seite werde nicht mehr erreichbar. Der Review fand außerdem, dass die gecachte Startseite beim Pausieren nicht revalidiert wird. Es gibt keinen belegten Autorisierungsfehler.

### Brevo und Dokumentation

Im Codex-Browser wurde am 13.10.2026 folgender Account-Stand gelesen; alle Werte sind Momentaufnahmen und vor späterer Umsetzung erneut zu prüfen:

| Einstellung / Anzeige | Gelesener Stand | Einordnung |
| --- | --- | --- |
| Anonymes E-Mail-Tracking | Ja | Opens/Klicks werden aggregiert gezählt, laut UI aber nicht bestimmten Kontakten zugeordnet. Nicht als „Tracking aus“ oder als Rechtsbewertung beschreiben. |
| Logs | Alle Absender: ein Monat | Aktueller UI-Stand; kein rückwirkender Nachweis für bereits versandte Mails. |
| Mailvorschauen | Nie aufbewahren | Aktueller UI-Stand. |
| Tarif/Kontingent | Starter, 10.000 Mails/Monat, 2.377 übrig; Erneuerung 17.10.2026 um 21:42 laut UI | Vor jeder späteren Entscheidung live nachlesen. |
| Preis | 14,00 € netto + 2,66 € MwSt. = 16,66 € monatlich | Gebuchter Preis laut UI am Prüftag; kein Preisvergleich beauftragt. |
| Warteschlangenanzeige | 0 pausierte E-Mails | Sagt nichts über die Anzahl geplanter Follow-ups aus. |

Beim ersten Öffnen der Tracking-Seite erschien unerwartet eine Bestätigung, dass Einstellungen zum anonymen Tracking gespeichert wurden. Der Agent hatte keinen Schalter und keinen Speichern-Button betätigt. Ursache und vorheriger Zustand sind nicht nachgewiesen. Nur den danach sichtbaren Stand als gelesen behandeln; nicht eigenmächtig zurückstellen.

Der Review vom 12.10. hatte außerdem mehr als 1.000 Requests pro Tag an mehreren Tagen und zuletzt 1.050 Requests am 12.10. gesehen. Daraus folgt keine verlässliche Verbrauchsprognose. Vor einer Tarifentscheidung Tagesrate und geplante Follow-ups erneut lesend ermitteln; keine Follow-ups abschalten und kein Upgrade kaufen.

## Umfang und Umsetzungsregeln

### 1. Analytics zentral absichern — unabhängig von der Debug-Entscheidung

- `/feedback`, `/debug`, `/datenloeschen` und `/kampagne/verwalten/uebernehmen` jeweils einschließlich ihrer Unterpfade ausschließen. Pfadgrenzen so behandeln, dass ähnlich benannte, andere Routen nicht versehentlich mit ausgeschlossen werden.
- Bei allen übrigen zulässigen Analytics-URLs `search` und `hash` vor dem Eventversand entfernen. Pfad inklusive Kampagnen-Slug und normale Seitenaufrufe erhalten.
- Die Browser-URL nicht verändern; Links, Formulare und bestehende Nutzerabläufe müssen unverändert funktionieren.
- Ungültige oder nicht lesbare Event-URLs nicht ungeprüft durchlassen: den betroffenen Event verwerfen.
- Den Vertrag des tatsächlich installierten Analytics-SDK prüfen. Keine Aussage treffen, dass separat geführte SDK-Attribution ebenfalls bereinigt sei, bevor das belegt ist.
- Eine fokussierte Privacy-Testdatei bzw. einen kleinen testbaren URL-Helper ergänzen, falls nötig; kein neues Package.

### 2. Debug-Anzeige beibehalten; Link-Transport nur nach ausdrücklicher Bestätigung wechseln

**Ohne Bestätigung:** Debug-Anzeige und Mail-Links unverändert lassen; Aufgabe 1 schützt Analytics weiterhin zentral.

**Nur wenn Thomas `#d=` bestätigt:**

- Beide HTML-Mail-Builder berücksichtigen: `buildEmailHtml.ts` für Erstmail/Resend und `buildVariantEmailHtml.ts` für Varianten. Bei Umsetzung erneut gezielt nach weiteren Debug-Link-Generatoren suchen; im früheren Review war kein separater Plaintext-Debug-Link bekannt.
- Neue Links als `/debug#d=…` ausgeben. Der Fragmentteil wird beim HTTP-Request an den Server nicht mitgesendet, bleibt aber für Nutzer:innen lesbar und kann von JavaScript gelesen werden. Das Fragment ersetzt daher nicht den Analytics-Schutz.
- `/debug` serverseitig mit einer kleinen Client-Komponente ausstatten, die zuerst `#d=` und weiterhin alte `?d=`-Links lesen kann. Darstellung mit denselben Diagnosefeldern beibehalten; `formatDebug.ts` möglichst weiterverwenden. Metadaten und `noindex` erhalten.
- Ladezustand für das reguläre Fragment-Lesen und verständlicher Zustand bei deaktiviertem JavaScript vorsehen. Während der Fragment-Ladung darf nicht fälschlich „Missing ?d=“ erscheinen.
- Für den neuen Debug-Link nur beim Serialisieren eine Payload-Kopie erstellen und daraus die Nutzer-E-Mail entfernen. Gemeinsamen `buildDebugPayload`-/Feedback-Vertrag, signierte Feedback-Tokens, Lösch-Tokens, Review-Zuordnung, Mail-Empfänger und gespeicherte Löschbarkeit nicht ändern. Nutzer-PLZ und Diagnosefelder bleiben vorhanden.
- Keine Datenbank, Anmeldung, Verschlüsselungsinfrastruktur oder neue Template-Engine einführen.

Grenzen: Fragment-Links sind nicht verschlüsselt und bleiben beim Weitergeben lesbar. Bereits versandte `?d=`-Links und frühere URL-Logs werden dadurch nicht rückwirkend geändert; alte Query-Links enthalten ihre Daten weiterhin beim ersten HTTP-Request. Kein globales Versprechen abgeben, Debug-Daten würden „nirgends gespeichert“.

### 3. Pausentext und Listen-Cache korrigieren

- Erfolgstext an bestätigtes Verhalten anpassen, zum Beispiel: „Kampagne pausiert. Sie bleibt über ihren Link nutzbar und erscheint nicht mehr in öffentlichen Listen.“
- Startseite beim Pausieren gezielt revalidieren. Weitere öffentliche Listen nur dann einbeziehen, wenn sie tatsächlich gecachte aktive Kampagnen anzeigen. Keine allgemeine Cache-Abstraktion schaffen.
- Bestehende Autorisierung und Zustandsregeln beibehalten. Der Direktlink-Fallback gilt nur für pausierte, freigegebene, nicht beendete Kampagnen; er schaltet beendete oder nicht freigegebene Kampagnen nicht frei.

### 4. Brevo-Annahmen und Datenschutztexte abgleichen

- Die Aussagen „Open-/Click-Tracking global ausgeschaltet“ in `sendLetterEmail.ts`, `sendFollowupEmail.ts` und der Env-Vorlage mit dem bei Umsetzung erneut geprüften anonymisierten Tracking abgleichen. Keine pauschale Rechtsaussage durch eine andere ungeprüfte Rechtsaussage ersetzen.
- Den künftigen Aufbewahrungscheck in `datenschutz/page.tsx` mit den tatsächlich gelesenen Regeln und dem Debug-Datenfluss abgleichen. Öffentliche Textänderungen reviewbar halten; der aktuelle UI-Stand belegt keine rückwirkende Konfiguration aller gesendeten Mails.
- Einen datierten Nachtrag oder Verweis ergänzen, statt historische Messungen/Preise im Review vom 12.10. rückwirkend umzuschreiben.
- Kontingent, Tagesrate und geplante Follow-ups ausschließlich lesend prüfen. Bei knapper Reichweite Optionen mit aktuellem Preis/Umfang vorlegen. Keine Tracking-/Retention-Einstellung, keinen Tarif und keine Versandplanung ohne gesonderten Auftrag ändern.

## Akzeptanzkriterien

- [ ] Synthetische Marker für Anliegen, E-Mail, Lösch-Token und Übernahme-Token erscheinen nicht in der von der Analytics-Komponente zurückgegebenen Nutzlast.
- [ ] Der tatsächliche Analytics-Event-Vertrag ist berücksichtigt; reguläre Seiten und Kampagnen-Slugs bleiben messbar. Tests decken normalen Pfad, Query plus Fragment gemeinsam, bestehendes Feedback-Verhalten und ungültige URLs ab.
- [ ] Die Browseradresse wird nicht umgeschrieben. Der sichere lokale Browsercheck fängt Requests ab und sendet keine echten Daten an Analytics.
- [ ] Debug-Diagnosefelder bleiben sichtbar. Falls `#d=` bestätigt wurde: neue Standard-, Resend- und Variantenlinks enthalten kein `d` in der Query, der serialisierte Debug-Payload enthält keine synthetische E-Mail, PLZ und Diagnosefelder bleiben erhalten, und alte `?d=`-Links funktionieren.
- [ ] Feedback-/Löschpfade behalten ihre benötigten Identitätsdaten und Token-Verträge; sie verwenden nicht versehentlich die reduzierte Debug-Kopie.
- [ ] Debug-Tests decken Unicode, Umlaute, Emoji, fehlerhaftes Base64/JSON, fehlende Daten und Query-/Fragment-Ladezustände ab.
- [ ] Eine pausierte, freigegebene, nicht beendete Kampagne bleibt über den Direktlink nutzbar und generierbar, verschwindet aus öffentlichen aktiven/kuratierten Listen und bleibt in der Creator-Verwaltung auffindbar.
- [ ] Beendete bzw. nicht freigegebene Kampagnen werden nicht freigeschaltet. Der Action-Test prüft Erfolgstext und gezielte Revalidierung.
- [ ] Brevo-Kommentare und Datenschutztexte entsprechen der bei der Umsetzung erneut gelesenen Einstellung; historische Aussagen bleiben datiert und als Momentaufnahme kenntlich.

## Verifikation und Beweisgrenzen

1. Vor Beginn aktuelle Agent-Anweisungen, Git-/Remote-Stand und Worktree erneut prüfen. Zum Erstellungszeitpunkt war `main` gegenüber dem gecachten `origin/main` voraus und der Worktree geändert; mehrere dieser Story-Dateien waren bereits lokal geändert. Das beweist weder, dass diese Story erledigt ist, noch, dass die Änderungen zusammengehören. Vorhandene Änderungen erhalten und Überschneidungen zuerst prüfen. Der letzte dokumentierte `git fetch --quiet` scheiterte am Schreibschutz von `.git/FETCH_HEAD`; Remote-Frische nicht behaupten, falls ein neuer Fetch erneut scheitert.
2. Fokussierte Mock-Tests für Analytics, Debug-Payload/Links, Feedback-Identität und Pause-Action ausführen; anschließend den angemessenen gemeinsamen Test-, Lint- und Typprüflauf.
3. Full Build nur in einer sicheren lokalen Umgebung ohne echte AI- oder Versandaufrufe versuchen. Der Build vom 12.10. war wegen nicht erreichbarer `next/font`-Downloads blockiert, kein Anwendungscode-Pass. Das damalige Gesamtergebnis (130 Suites/1.151 Tests, Lint 0 Fehler/7 Warnungen, isolierte TypeScript-Prüfung bestanden) ist historisch und deckt neue Änderungen nicht ab.
4. Lokalen synthetischen Browsercheck mit abgefangenen Analytics-Requests und Navigation durchführen. Das belegt lokale Darstellung/URL-Verhalten, keinen realen Mailversand, Inbox-Eingang, Analytics-Provider-Speicherung oder Deployment.
5. Keine echten Tokens, echten Anliegen, produktiven Analytics-POSTs, Mailversände, kostenpflichtigen AI-Aufrufe, Provider-Schreibzugriffe, Datenbank-Schreibzugriffe, Commits, Pushes oder Deployments im Rahmen dieser Story ohne separaten ausdrücklichen Auftrag.

## Entscheidungen und Abgrenzung

- **Bestätigt:** pausierte, freigegebene Kampagnen bleiben direkt nutzbar, erscheinen aber nicht in öffentlichen aktiven/kuratierten Listen; Creator-Verwaltung bleibt erhalten.
- **Noch offen:** Umstellung neuer Debuglinks von `?d=` auf `#d=`. Eine Erklärung des Vorschlags ist keine Zustimmung. Bei späterem Umsetzungsauftrag muss diese Wahl geklärt sein; bei Vertagung nur Analytics-Schutz und Debuganzeige unverändert lassen.
- **Kein Umfang:** Tarif-/Providerwechsel, Änderungen an Brevo-Einstellungen, Abschalten geplanter Follow-ups, umfassender Umbau von Mail-Templates/Cache/Analytics, Entfernung der Diagnoseanzeige oder neue Debug-Infrastruktur.
- **Quellen:** [Code-Review vom 12.10.](../../../docs/reviews/2026-10-12-code-review.md) und [Follow-up-Briefing vom 13.10.](../../../docs/reviews/2026-10-13-follow-up-todos.md). Das Follow-up-Briefing enthält die neueren Detailentscheidungen zu Diagnosefeldern, Fragmentvorschlag und Brevo-Momentaufnahme.
