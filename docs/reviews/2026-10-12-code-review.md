# Brief-nach-Berlin: Entscheidungsbericht vom 12. Oktober 2026

**Zuerst die Übergabe persönlicher URLs an Analytics schließen und personenbezogene Debug-Inhalte aus Links entfernen. Die gemessenen Betriebskosten rechtfertigen derzeit keinen größeren Umbau.**

Prüfstand: Abendsession am 12.10.2026; Live-/Provider-Abfragen um 23:19–23:28 Uhr CEST. Anwendungscode wurde in diesem Review nicht geändert. Keine Commits, Pushes, Deployments, Versände, kostenpflichtigen AI-Aufrufe oder Produktivdatenänderungen. Erlaubte lokale Dokumentationskorrekturen stehen unten.

## 1. Die vier Empfehlungen für morgen

| Priorität und Befund | Auswirkung / Dringlichkeit | Kleinste sinnvolle Maßnahme und Begründung | Aufwand / Verifikation |
| --- | --- | --- | --- |
| **1 · Belegter Datenschutzfehler:** `web/src/components/AnalyticsWrapper.tsx:10–18` schließt ausschließlich `/feedback` aus. Das aktuell ausgelieferte Analytics-Skript übernimmt bei passendem Pfad die vollständige URL. Offline reproduziert für Debug-Payload, Lösch-Token, Varianten-E-Mail im Fragment und Kampagnen-Übernahme-Token. | Persönliche Inhalte bzw. Berechtigungslinks gelangen in die clientseitig vorbereitete Analytics-Nutzlast. **Zeitnah beheben.** Eine tatsächliche Speicherung dieser Werte bei Vercel wurde nicht nachgewiesen. | Zentral Query und Fragment aus erlaubten Analytics-URLs entfernen; Debug-, Lösch- und Übernahmeseite zusätzlich ausschließen, bisherigen Feedback-Ausschluss behalten. Ein kleiner Schutz an einer Stelle deckt mehrere Funktionen ab. | **Klein.** Tests mit synthetischen Markern für alle vier Pfade und erlaubte normale Seiten. Anschließend Browserprüfung mit abgefangenem Analytics-Request; keine echten Tokens verwenden. |
| **2 · Belegtes Datenschutzproblem:** `web/src/lib/email/buildDebugPayload.ts:23,59–60,103–106`, `buildEmailHtml.ts:20–28`: bis zu 2.000 Zeichen Anliegen, E-Mail und PLZ werden als lesbares Base64-JSON in `/debug?d=` eingebettet. Varianten enthalten bis zu je 1.200 Zeichen Originalbrief und Änderungswunsch (`variantDebugPayload.ts:4,54–56`). | Sensible Inhalte stecken im weiterleitbaren Link, unabhängig von Analytics; Browserhistorie und mögliche URL-Protokollierung sind weitere Expositionswege. Der April-Datenschutzaudit bildet diesen Zustand nicht ab. **Gemeinsam mit 1 beheben.** | Inhalt, E-Mail und Nutzer-PLZ aus beiden Debug-URL-Payloads entfernen; technische Kennzahlen, Modell und Codeversion behalten. Kein neuer Storage oder verschlüsselter Debug-Dienst nötig. Anschließend die Datenschutzaussagen gegen den verkleinerten Datenfluss prüfen. | **Klein.** E-Mail-Builder-Tests dekodieren Links und schließen synthetische sensible Marker aus. Feedback-, Erstmail-, Resend- und Variantenpfade prüfen. Bereits versandte Links bleiben als Restbestand bestehen. |
| **3 · Belegte Abweichung, Konfiguration offen:** Brevo meldet für den Projekt-Tag `brief` allein am 12.10. **404 Opens / 155 Klicks**, obwohl der Code ausgeschaltetes Tracking voraussetzt (`sendLetterEmail.ts:16–18`). Außerdem meldet die Account-API **2.779 `sendLimit`-Credits**, Periodenende 17.10.; zuletzt über 1.000 Requests täglich im Account. | Die bisherige Tracking-Annahme ist nicht belastbar. Nicht geklärt: anonymisierte oder personenbeziehbare Erfassung und genaue Credit-Bedeutung. **Morgen prüfen**, auch zur Vermeidung einer Versandunterbrechung. | Kontoeinstellungen und Quota-Anzeige lesen; an einer bereits zugestellten Mail Pixel und umgeschriebene Links prüfen. Tatsächlichen Zustand datieren. Tracking-Änderung oder Tarifwechsel erst anhand dieser Evidenz entscheiden. | **Klein.** Screenshot/Notiz der Einstellungen, verbliebenes Kontingent einschließlich geplanter Follow-ups. Kein Testversand nötig. Aggregate allein beweisen keine personenbezogene Verfolgung. |
| **4 · Belegter kleiner Kampagnenfehler:** `web/src/lib/actions/pauseCampaign.ts:40–45` verspricht eine unerreichbare Seite; seit `6b20dd3` bleiben pausierte, freigegebene Kampagnen ausdrücklich per Direktlink nutzbar. `/` wird beim Pausieren nicht revalidiert, obwohl dort kuratierte aktive Kampagnen stündlich gecacht werden (`app/page.tsx:26–33`, `campaigns/repository.ts:501–515`). | Falsche Erwartung beim Pausieren; eine zuvor gelistete Kampagne kann bis zur nächsten Startseiten-Revalidierung sichtbar bleiben. **Kleine nächste Korrektur nach Datenschutz.** Kein nachgewiesener Autorisierungsbruch. | Erfolgstext an das gewollte Verhalten anpassen und Startseite beim Pausieren revalidieren. Direktlink-Verhalten beibehalten: Es ist implementiert und getestet. | **Klein.** Action-Test für Text und Revalidierung; pausierte Kampagne bleibt per Link nutzbar, verschwindet aus Listen. Kein produktives Pausieren im Review ausgeführt. |

**Bewusst zurückstellen:** neue Infrastruktur gegen Duplikate, große Mail-/Routing-Abstraktionen, Providerwechsel und weitere Produktfeatures. Dafür fehlt aktuell ein entsprechend großer belegter Nutzen.

## 2. Evidenz und Ausgangslage

**Belegter Fakt** bedeutet: aktuell gelesener Code, ausgeführter Check oder konkret genannte Provider-Antwort. **Ableitung** benennt eine daraus folgende Gefahr oder ein erwartbares Verhalten. **Offen** kennzeichnet fehlende Prüfung. Ein bestandener Mock-Test beweist weder AI-Qualität noch Zustellung oder mobile Bedienbarkeit.

| Ebene | Aktuell belegter Stand | Grenze |
| --- | --- | --- |
| Lokaler Git-Stand | `main`, HEAD `ff982bc6ea1102900ab751a0a7059e814c7569b4`, **2 Commits vor origin/main**, bereits bei Beginn dirty. | Lokale Änderungen sind nicht automatisch geshippt. |
| Remote `origin/main` | GitHub-Connector bestätigt **`3e1bddcb91fd66d0d301ea98681db7997fc16c62`**; stimmt mit gecachtem Remote-Ref überein. | `git fetch --quiet` scheiterte am Schreibschutz von `.git/FETCH_HEAD`; Remote-Frische daher über GitHub, nicht erfolgreichen Fetch belegt. |
| Vercel-Produktion | Deployment `dpl_5KN6Fftg8NnVQSdk58vtyVCYbtPL`, **READY**, Branch `main`, SHA `3e1bddc`; Hauptdomain als Alias bestätigt. Node 24.x, Projektroot `web/`, Teamtarif Pro aktiv. | Deployment-Status ist kein vollständiger Funktionstest. [Deployment](https://vercel.com/thomas-lorenz-1314s-projects/brief-nach-berlin/5KN6Fftg8NnVQSdk58vtyVCYbtPL). |
| Live-Verhalten | Sichere öffentliche GETs, Header, HTML-Merkmale, Kartenprojektion und ausgeliefertes Analytics-Skript geprüft. | Kein echter Wizard-Abschluss, Mailversand, AI-Aufruf, Löschvorgang oder Kampagnen-Schreibzugriff. |
| Supabase | Ausgewählte API-Schema-/Leserechte mit `select … limit=0` geprüft, siehe Abschnitt 8. | Keine vollständige Migration-History, Constraint-/RPC-Definitionen oder Schreibrechte verifiziert. |

Die geltenden Root- und Web-Anweisungen wurden gelesen. Es gab keine lokale oder im geprüften Remote-Baum vorhandene `captured-ideas-*.md` zum Auflisten.

**Nicht geshippt:** `f5a435a` ergänzt Karten-Ausnahme und persönlichen Löschlink in der Briefmail; `ff982bc` protokolliert diese Aufgabe. Diese zwei lokalen Commits dürfen nicht als aktuelle Produktion beschrieben werden. Andere bereits deployte Mailpfade enthalten Löschlinks; die Löschseite selbst ist live.

Die vorhandenen Änderungen wurden erhalten: neun bereits geänderte getrackte Dateien und sieben untracked Dateien, insbesondere Kampagnen-Anliegenalternativen samt Migration 032 sowie ein Duplikat-Hilfsmodul. Abschlussvergleich: Der Diff dieser neun Dateien ist bytegleich mit dem zu Beginn gesicherten Diff; alle sieben untracked Dateien sind noch vorhanden. Während der Prüfung kamen außerhalb dieses Reviews Änderungen an `buildEmailHtml.ts`, `emailVariantCta.test.ts` und `financingNotice.test.ts` hinzu; sie entfernen die zusätzliche WE-AID-Anbieterzeile. Auch diese Änderungen blieben erhalten. Der vollständige Testlauf und die isolierte Typprüfung liegen zeitlich davor; die beiden betroffenen Mail-Tests wurden danach erneut geprüft.

## 3. Zuletzt geshippt und vertieft geprüft

| Änderung | Geprüfte Wechselwirkung / Ergebnis |
| --- | --- |
| Politische Daten, Pagination und Adressen, 9.–10.10. (`87f3dac`, `175912a`, `5e68d6e`) | Import-Pagination, ID-Deduplizierung, Partei-Fallbacks, Hamburger Zuordnung und Büroauswahl gelesen; Datenbestand und Zuordnungslücken gezählt. Keine konkret falsch adressierte Person nachgewiesen; Vollständigkeit braucht fachliche Stichproben, siehe Abschnitt 6. |
| Karte: vollständige PLZ-Pagination und Cache (`639e6df`), Zoom/Startseiten-Einbindung bis `01282e8` | Datenbank-Projektion, stabile Sortierung, serverseitiger Stunden-Cache, API-/Client-Cache und Dialogbedienung gelesen. Live nur öffentliche Koordinaten/Zähler, keine Anliegen oder E-Mails erhalten. Browserbedienung nicht ausgeführt. |
| Kampagnenzähler (`cfc5654`), pausierte Direktlinks/Listen (`6b20dd3`) | Zähler gilt erst nach erfolgreichem Counter-Aufruf; Server überprüft Empfänger und Laufzeit. Pausierte Direktlinks sind gewollt und getestet. Übrig: widersprüchlicher Pausentext und fehlende Startseiten-Revalidierung. |
| Meilenstein-Mail und Statistik-Zugang (`34855c5`, `6b10beb`) | Datenbank-Claim schützt vor parallelem Mehrfachversand. Fehler blockieren keinen Nutzerbrief. Trade-off: bei fehlgeschlagenem Mailversand geht die interne Benachrichtigung ohne Wiederaufnahme verloren. Statistik bleibt zugriffsgeschützt. |
| Löschtokens, Löschaktion und Follow-up-Links (`2ade4e4`, `b90f1f2`, `2206f37`, `083a576`) | Signatur, Zweckbindung, Ablauf, Eigentumszuordnung, explizite Löschaktion und Tests sind solide. Neue Wechselwirkung: globale Analytics-Einbindung erfasst die Token-URL im clientseitigen Senderpfad. |
| Donation-/Sharing-Mails (`176845e`, `1fc7325`) und alte Roadmap-Tabelle (`ec23003`, Origin-Tip-Doku) | Mailpfade getrennt betrachtet; keine ungewollte Zusammenlegung von Erstmail/Resend/Follow-up vorgeschlagen. `roadmap_signups` über Produktions-API nicht mehr verfügbar. |

Der größere Anliegen-Auszug im Debug-Link wurde bereits am 9.10. bewusst eingeführt (`4577a9a`, 600 → 2.000 Zeichen). `0251803` schützt den Feedback-Token vor diesem Auszug. **Dieser Schutz greift nicht für den separaten Debug-Link.**

## 4. Datenschutz, Sicherheit und Vertrauen

### 4.1 Reproduzierbarer URL-Datenfluss zu Analytics

Die Analytics-Komponente hängt am globalen Layout (`web/src/app/layout.tsx:104`). Ihr Filter lässt alle URLs außer `/feedback…` unverändert passieren. Das live per GET geladene `/_vercel/insights/script.js` liest `location.href`; bei einem zum tatsächlichen Pfad passenden Pageview bleibt die Suchzeichenfolge erhalten. Auch ein Fragment wird übernommen.

**Reproduktion ohne Produktiv-Event:** Das exakt ausgelieferte Skript wurde offline in einer VM ausgeführt, mit synthetischem Browserzustand, dem funktional identischen `beforeSend`-Filter und vollständig abgefangenem `fetch`. SDK-Pageview-Parameter `path` und `route` entsprachen dem jeweiligen Pfad. Ergebnis im vorgesehenen POST an `/_vercel/insights/view`:

| Synthetische URL | In abgefangener Nutzlast |
| --- | --- |
| `/debug?d=SYNTHETIC_DEBUG_PAYLOAD` | Vollständige URL einschließlich `d` |
| `/datenloeschen?t=SYNTHETIC_DELETE_TOKEN` | Vollständige URL einschließlich `t` |
| `/brief/anpassen#email=synthetic%40example.invalid` | Vollständige URL einschließlich E-Mail-Fragment |
| `/kampagne/verwalten/uebernehmen?token=SYNTHETIC_TRANSFER_TOKEN` | Vollständige URL einschließlich Übernahme-Token |
| `/feedback?t=SYNTHETIC_FEEDBACK_TOKEN` | Kein Request, bestehender Filter greift |

Skript-SHA256: `b1fa9fc8104da15958badc63bbebe46eeea4d9ce88e587d7732b2c4f4238d8af`. Temporäre Reproduktion: `/private/tmp/bnb-evening-analytics-repro.cjs`; Ergebnis: `/private/tmp/bnb-evening-analytics-repro.json`. Diese Dateien sind lokale Prüfhilfen, keine Repository-Abhängigkeiten.

**Belegt:** Die derzeitige Kombination konstruiert eine Analytics-Nutzlast mit sensibler URL. **Nicht belegt:** Ein bestimmter Nutzer hat diese Seite geöffnet, ein entsprechender Request wurde tatsächlich zugestellt oder Vercel hat diese Werte gespeichert. Das Review hat keine echten Tokens verwendet und keinen Analytics-POST gesendet.

Zusätzliche Quellen: `buildEmailHtml.ts:31–34` erzeugt das Varianten-E-Mail-Fragment; `web/src/app/(site)/brief/anpassen/VariantForm.tsx:62–73` liest es, entfernt es aber nicht. `web/src/app/(site)/kampagne/verwalten/uebernehmen/page.tsx:12–22,39–49` rendert die Bestätigungsseite mit weiter vorhandenem Token. Löschlinks enthalten eine signierte, lesbare E-Mail und eine bis zu 90 Tage gültige Berechtigung (`web/src/lib/dataDeletion/token.ts`). Signieren verschlüsselt nicht.

`noindex` und ein `no-referrer`-Meta-Tag verhindern das Lesen von `location.href` durch eigenes JavaScript nicht. Dagegen ist `/stats/unlock?pw=` ein serverseitiger 303-Redirect ohne gerenderte Seite; für diese Route wurde **keine Analytics-Übergabe behauptet**. Auch `/kampagne/verifizieren?token=` und `/kampagne/verwalten?token=` redirecten vor dem Rendern. Die oben genannte Übernahmeseite rendert dagegen mit Token.

### 4.2 Debug-Link: mehr als technische Metadaten

`buildDebugPayload` nimmt Anliegen-Auszug, Nutzer-E-Mail und PLZ auf; `buildDebugUrl` kodiert das gesamte Objekt. `/debug` dekodiert es ohne Anmeldung (`web/src/app/debug/page.tsx:9–27,78–80`). Die Seite liest dabei keinen fremden Datensatz aus einer Datenbank: Zugriff entsteht durch Besitz des inhaltstragenden Links. Base64 ist ohne Geheimnis umkehrbar.

Der Feedback-Payload entfernt `issueTextPreview` vor dem Signieren (`sendLetterEmail.ts:167–175`), was eine sinnvolle bestehende Grenze ist. Der Debug-Link und die Varianten-Debug-Payload bleiben davon unberührt. Die Aussage der Debug-Seite, es werde nichts dauerhaft gespeichert (`debug/page.tsx:63–65`), ist angesichts des Analytics-Datenflusses zu weitgehend; tatsächliche Provider-Speicherung bleibt offen. Bei der späteren Codekorrektur diesen Hinweis mit anpassen.

Das Entfernen der Inhalte aus neuen Links ist die kleinste wirksame Maßnahme. Schon versandte Links verschwinden dadurch nicht. Eine Abschaltung der alten Debug-Anzeige allein entfernt auch die Daten aus alten URLs nicht; deshalb ist der zentrale Analytics-Schutz zusätzlich nötig.

### 4.3 Was hier bereits gut gelöst ist

1. **Löschen:** HMAC-Signatur mit Zweck/Version, normalisierte E-Mail, maximale Gültigkeit, Längenbegrenzung und konstante Signaturprüfung. GET löscht nichts; die Server-Action validiert erneut, begrenzt Anfragen und nutzt die verifizierte Identität. `userData.ts` teilt Eigentumslogik für Vorschau/Löschung, ohne Kampagnen pauschal zu löschen. Teilfehler bei parallelen Löschoperationen könnten teilweise gelöschte Daten hinterlassen; ein erneuter Versuch ist grundsätzlich möglich. Ein gezielter Teilfehler-Test wäre bei der nächsten Änderung sinnvoll, kein aktueller Schadensfall belegt.
2. **Fehlermeldungen:** `web/src/lib/actions/reportError.ts:72–105` verwirft mitgesandte Client-Logs, bereinigt Fehlerdetails und entfernt Query/Fragment aus der Seiten-URL. Kein dort nachgewiesener Anliegen-Logpfad. Einzelne rohe Provider-Fehler werden serverseitig geloggt; ein konkreter Leak des Mailinhalts daraus wurde nicht nachgewiesen.
3. **Öffentliche Endpunkte:** Produktions-Mailvorschau live 404. Transkription prüft Typ, Größe und Rate; kein Test mit Audiodaten/AI. Review-Interaktionen verlangen signierte Tokens; Erzeugung/Resend validieren Eingaben und rekonstruieren Empfänger serverseitig. Kein produktiver Schreibtest durchgeführt.
4. **Zugriff und Header:** `/stats` zeigt ohne Freischaltung das Passwortformular, Antworten sind privat/no-store. Cookies sind HttpOnly und zeitlich begrenzt. Live HSTS, `nosniff`, Frame-Schutz und Permissions-Policy vorhanden. Eine CSP fehlt; ohne belegten XSS-Pfad ist ein umfassendes CSP-Projekt aktuell nachrangig.

**Grenzen:** `web/src/lib/rateLimit.ts:1–8` beschreibt selbst die pro Instanz arbeitenden In-Memory-Limits. Cold Starts und mehrere Instanzen begrenzen deren Wirkung als globalen Missbrauchs-/Kostenstopp. Das ist eine reale Architekturgrenze, aber kein in dieser Session beobachteter Missbrauch. Ohne Signal keine zusätzliche Redis-Abhängigkeit einführen.

## 5. Fehlerfälle, Wiederholungen und Zustellung

### Keine dauerhafte Idempotenz bei Briefgenerierung

**Belegter Mechanismus:** Der Auswahlpfad erzeugt `letterId` und signierten Kontext (`web/src/lib/actions/selectPolitician.ts:108–140`); `/api/generate-letter` übernimmt die geprüfte ID (`route.ts:200–218`), erhöht Zähler (`295–303`) und startet Mailarbeit (`315–355`). Eine atomare Bearbeitungs-/Erfolgsmarkierung pro Vorgang fehlt. Ein erneut eingereichter gültiger Request kann AI, Zähler und Mail erneut auslösen. Das wurde im Code geprüft, nicht in Produktion wiederholt.

Die Oberfläche verhindert übliche Doppelklicks und unterscheidet unklare Netzwerkfehler (`Step3Success.tsx:674–686,1030–1071`). Ein Reload mit neuer Auswahl kann jedoch eine neue ID erzeugen; reine Deduplizierung nach `letterId` löst daher nicht alle Fälle.

Die vorhandene Notiz `.planning/todos/pending/2026-10-11-doppelte-briefmails-dedup.md` dokumentiert bereits Support-Indizien und die Entscheidung, eine größere Lösung vorerst zu verschieben. Die dort früher ermittelten Kandidatenpaare wurden hier **nicht erneut gegen Mailereignisse geprüft** und sind keine bestätigte Duplikatquote. Auch die lokale untracked 4-%-Schätzung in `duplicateLetters.ts` ist keine aktuelle Messung und keine deployte Korrektur des Zählers.

**Empfehlung: vorerst weiter beobachten.** Falls wiederholt Nutzer betroffen sind: kleine dauerhafte Vorgangstabelle mit atomarem Claim, definiertem Zustand bei unklarem Versand und kurzer Löschfrist planen. Ein HMAC-Fingerabdruck kann Roh-Anliegen vermeiden, erzeugt aber weiterhin neue Datenhaltung und Betriebsarbeit. Aufwand **mittel**; Mock-Tests müssen Parallelität, Retry, Reload/neue ID, definitive Ablehnung und unklaren Provider-Timeout unterscheiden. Kein generisches Exactly-once-Versprechen und kein schneller in-memory Patch.

### Interne Meilenstein-Mail: bewusst höchstens ein Versuch

`web/src/lib/campaigns/globalLetterMilestoneNotification.ts:18–36` reserviert den Schwellenwert vor Brevo. Das verhindert parallele Mehrfachmails. Bei negativem Versandresultat bleibt der Claim bestehen; eine Benachrichtigung kann dauerhaft ausfallen. Die Tests sichern Einmaligkeit/Parallelität, keinen Wiederaufnahmeweg.

Auswirkung: **interne Betreiber-Mail**, nicht der Nutzerbrief. Dringlichkeit niedrig. Für das Solo-Projekt ist das derzeit vertretbar. Wenn nötig, später einen manuellen, nachvollziehbaren Wiederaufnahmeweg ergänzen. Einen Claim nach jedem Timeout blind zu löschen könnte Mehrfachversand erzeugen; der nächste Brief löst nicht automatisch denselben exakten 1.000er-Schwellenwert erneut aus.

### AI-Retries und Follow-ups

`web/src/lib/mistral.ts:18–29,81–123` begrenzt Wrapper-Versuche auf drei und unterscheidet transiente Fehler. Generierung kann nach Längenabweichung einen zweiten Durchlauf starten (`generation/generateLetter.ts:645,694`): bis zu sechs Wrapper-Versuche für diese beiden Durchläufe, zusätzlich zu Routing/Enrichment und etwaigen SDK-internen Retries. Das ist ein plausibler Kostenmultiplikator, **kein gemessener Verschwendungsnachweis**. Keine bezahlten Calls ausgeführt.

Resend verwendet vorhandenen Brieftext statt neu zu generieren. Follow-ups werden bei Brevo über `scheduledAt` geplant; kein Vercel-Cron in `web/vercel.json`. Erstmail-, Resend-, Varianten- und Follow-up-Verträge sollten getrennt bleiben.

## 6. Zuständigkeit und Datenqualität

Die fokussierten Mock-Tests zu Empfängersuche, Kampagnen-Allowlist, festen Empfängern, gehärteten Routen und Ebenenrouter bestehen: **5 Suites / 48 Tests**, bereits im Gesamtlauf enthalten. Serverseitige Empfängerauflösung und feste Kampagnenempfänger sind sinnvolle Schutzgrenzen. Für ausdrücklich nicht lokale Landtagskontakte gibt es eine entsprechende Beziehung/Prompt-Kennzeichnung; das ist kein Beweis falscher lokaler Zuständigkeit.

| Lokaler Bestand / Check | Ergebnis und Einordnung |
| --- | --- |
| `web/data/politicians-cache.json`, Stand 10.10.2026 | Bund: **609 eindeutige IDs**; Landtage: **1.766 eindeutige IDs**, alle 16 Länder. Keine leeren Namen oder Anschriften im geprüften Bestand. |
| Bundes-PLZ-Zuordnung | 10.812 PLZ-Schlüssel, 299 Wahlkreise; Personenbestand deckt 295 davon ab. Kein passender Eintrag für **44, 109, 185, 259**. Fehlender Direktmandatseintrag kann durch Wahlrecht/Datenmodell erklärt sein; keine vorschnelle „vier falsche Wahlkreise“-Diagnose. |
| Landtags-Zuordnung | 7.357 PLZ mit Zuordnung, alle 222 dort referenzierten Wahlkreis-IDs im Cache. **2.492 von 9.849** PLZ-Bundesland-Einträgen ohne optionale Landtags-Wahlkreiszuordnung. Institutionelle Empfänger bleiben verfügbar. Das begrenzt die individuelle lokale Abdeckung. |
| Kommune | 9.849 PLZ im AGS-Mapping, davon **2.167 mit null-AGS**. Für vorhandene AGS kein fehlender Destatis-Empfänger. Destatis-Cache Stand 31.01.2026; kein Live-Adressabgleich. |
| Primärquelle Bund, lesende Metadatenabfrage | Abgeordnetenwatch meldet **630 aktuelle Mandate** für die Bundestagsperiode. Der Importer überspringt u. a. Einträge ohne auflösbare Person/Wahlkreis (`scripts/fetch-politician-data.ts:223–233`). Deshalb sind 609 vs. 630 nicht automatisch 21 fehlende verwendbare Empfänger. |

**Nächste kleine Wartungsmaßnahme beim regulären Datenrefresh:** Quelle → behalten → übersprungen → nicht zugeordnet als getrennte Zähler ausgeben und die vier Bundes-Wahlkreise sowie einige nicht zugeordnete Landtags-PLZ fachlich prüfen. Keine neue Datenpipeline aufbauen. Der aktuelle Import prüft Pagination/ID-Anzahl und erhält bei leerer Landtagsantwort den alten Cache; diese Sicherungen behalten.

Offen: live vollständiger Landtagsvergleich. Eine NRW-Abfrage endete mit **HTTP 429**; keine weiteren Imports oder aggressiven Retries. Ebenso nicht geprüft: aktuelle Öffnungszeiten/Adressänderungen einzelner Wahlkreisbüros und semantische Zuständigkeit mit bezahlter AI.

## 7. Betriebskosten: gemessen, plausibel, offen

### Vercel: aktuell kein großer Kostentreiber belegt

Die lesende Billing-Charges-API wurde auf **dieses Projekt** gefiltert; andere Projekte im Team wurden nicht zugerechnet. Verfügbare Charge-Perioden: **17.09.2026 07:00 UTC bis 12.10.2026 07:00 UTC**; der laufende Tag ist nicht vollständig enthalten. Summe: **4,59 USD `EffectiveCost`**, `BilledCost` auf Cent gerundet **0,00 USD**. Das ist ein projektspezifischer Nutzungsdatensatz, **keine Gesamtrechnung**; fixe Pro-Gebühr und Steuer sind daraus nicht bestimmt. Die API stellt tägliche Kostendaten im FOCUS-Format bereit. [Vercel: Billing Usage Cost Data API](https://vercel.com/changelog/access-billing-usage-cost-data-api).

| Position | `EffectiveCost` im verfügbaren Zeitraum |
| --- | ---: |
| Web Analytics Events | 0,85 USD |
| Fast Data Transfer, ca. 34,77 GB | 0,82 USD |
| Build CPU, 168 Minuten | 0,56 USD |
| ISR Writes, 104.787 Einheiten | 0,54 USD |
| Fluid Memory + Active CPU | 0,88 USD |
| CDN Requests, 876.430 | 0,33 USD |
| Übrige Positionen | ca. 0,61 USD |

ISR-Writes lagen am 17.09. bei 46.694, danach meist bei etwa 1.300–2.700 pro Tagesfenster; zuletzt 3.650–4.210. Das zeigt keinen wiederholten Ausreißer in ursprünglicher Größenordnung. Ursache des alten Peaks und Einfluss einzelner Deployments wurden nicht isoliert. Writes sind Abrechnungseinheiten, keine 1:1-Zählung von Seitenupdates; Vercel berücksichtigt Payload-Größe und Region. [Offizielle ISR-Limits und Preise](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing).

Sinnvolle bestehende Begrenzungen:

1. `web/src/lib/counter.ts:7–35`: gemeinsamer Stunden-Cache, kein globales Footer-Invalidieren nach jedem Brief.
2. `web/src/lib/letterSignals/getPublicMapData.ts:14–27,67–70`: paginierte Abfrage mit Stunden-Cache; öffentliche API zusätzlich CDN-Cache, Client mit 60-Sekunden-Cache und Zusammenführung gleichzeitiger Requests.
3. `CreatorStatsRefresh.tsx:21–34`: der Zehn-Sekunden-Timer aktualisiert einen UI-Text; er pollt nicht alle zehn Sekunden das Netz. Refresh ist manuell mit Cooldown.

**Empfehlung:** Caching und Vercel-Setup zunächst behalten. Die Analytics-Korrektur ist aus Datenschutzgründen sinnvoll; die geringe gemessene Analytics-Nutzung rechtfertigt für sich keinen Kostenumbau. Kein pauschales Verlängern aller Caches: Kampagnenverwaltung braucht gezielte Aktualität.

### Brevo: Volumen rechtfertigt Paid, tatsächliche Rechnung offen

Account-Aggregat **13.09.–12.10.2026**: 7.705 Requests, 7.572 Delivery-Ereignisse, 17 Hard Bounces, 93 Soft Bounces, 23 blockiert, 0 Spam-Reports, 33 Abmeldungen. Das sind Anbieter-Ereignisse, keine bestätigte Inbox-Sichtbarkeit oder exakt deckungsgleiche Kohorte.

| Projekt-Tag | Requests | Delivery-Ereignisse | Opens / Klicks |
| --- | ---: | ---: | ---: |
| `brief` | 4.166 | 4.100 | 4.880 / 2.492 |
| `brief-resend` | 47 | 44 | 39 / 40 |
| `followup-3d` | 3.220 | 3.155 | 1.153 / 289 |
| `brief_variant` | 212 | 213 | 245 / 53 |

Die Reihen sind nach Tags und Ereigniszeit gefiltert; nicht jede Account-Mail muss einen dieser Tags tragen. Eine Delivery kann sich auf einen Request außerhalb des Zeitfensters beziehen. Öffnungen durch Proxy/Bots sind enthalten; die Zahlen sind keine menschliche Leserquote. [Brevo: Aggregated SMTP Report](https://developers.brevo.com/reference/get-aggregated-smtp-report).

In 8 der 30 abgefragten Tageszeilen liegen mehr als 300 Requests. Spitzen: 09.10. 1.288, 10.10. 1.241, 11.10. 1.126; am 12.10. bis zur Abfrage 1.050. Der kostenlose Tarif mit 300 Mails/Tag passt damit derzeit nicht. Brevo nennt Starter ab 9 USD/Monat mit volumenabhängigen Stufen; tatsächlicher gebuchter Tier, Währung, Zusatzoptionen und Rechnungsbetrag wurden nicht bestimmt. [Offizielle Brevo-Pläne](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans).

Account-API: aktives `subscription`-Paket, `creditsType=sendLimit`, `credits=2779`, Zeitraum 17.09.–17.10. Die genaue Anzeige-/Restkontingent-Semantik im gebuchten Tarif und noch geplante Mails sind offen. Bei jüngstem Volumen ist die Prüfung vor dem Periodenende sinnvoll, eine verlässliche Reichweitenprognose daraus nicht möglich. [Account-API](https://developers.brevo.com/reference/get-account).

**Tracking:** Aktuelle Tag-Ereignisse widersprechen der sicheren Annahme „es gibt keine Open-/Click-Erfassung“. Sie unterscheiden jedoch nicht anonymisierte und identifizierbare Auswertung: Brevo dokumentiert ausdrücklich weiterhin aggregierte Events bei Anonymisierung. Deshalb erst Einstellung und vorhandene Mail prüfen, dann über eine Änderung entscheiden. [Brevo: Anonymisierung von Opens/Klicks](https://help.brevo.com/hc/en-us/articles/11643306229906-Can-I-anonymize-the-tracking-of-opens-and-clicks-for-my-emails).

**Plausible, nicht gemessen quantifizierte Kostentreiber:** automatisch geplante zweite Mails, erneut eingereichte Generierungen, AI-Längen-Retries, serverless-weite Umgehung lokaler Rate Limits. Follow-ups sind ein bewusstes Produktmerkmal; ihr Volumen allein belegt keine Verschwendung. Mistral-Rechnung, tatsächliche Planpreise und Nutzen einzelner Follow-up-Kohorten bleiben offen. Keine Kündigungs-/Migrationsentscheidung aus Paid-Plänen allein ableiten.

## 8. Checks und verbleibende Prüflücken

### Ausgeführt

| Check | Ergebnis / Reichweite |
| --- | --- |
| `cd web; npm test -- --runInBand` | **Bestanden: 130 Suites, 1.151 Tests.** Anbieter gemockt, keine echten Schlüssel/Calls nötig. Einschließlich zu Beginn vorhandener lokaler Änderungen. |
| `npm run lint` | **Bestanden: 0 Fehler, 7 Warnungen.** Überwiegend ungenutzte Variablen, ein Bildhinweis und React-Compiler-Hinweis bei `react-hook-form`. Kein Anlass für eine separate Aufräumaktion. |
| Isolierte Kopie: `npx tsc --noEmit --incremental false` | **Bestanden, keine Diagnosen.** Ohne Produktions-Env und ohne Nutzung/Änderung des ursprünglichen `.next`-Verzeichnisses. |
| Isolierter Build: `npm run build -- --webpack` | **Nicht bestanden / durch Netzwerkbegrenzung blockiert.** `next/font` konnte Caveat, Courier Prime und Source Sans 3 nicht laden. Kein bestätigter Anwendungscodefehler, aber ausdrücklich auch kein bestandener Full Build. Nur Dummy-Env, externe Dienste gesperrt. |
| Nach späteren externen lokalen Mailänderungen | **2 Suites / 19 Tests bestanden:** `emailVariantCta.test.ts`, `financingNotice.test.ts`. Kein zweiter Gesamtlauf oder Build danach. |
| Fokussierte Privacy-/Routing-Checks | Lösch- und Meilenstein-Tests, Debug-/Fehlerdaten-Tests und 48 Routing-/Campaign-Tests bestanden; Teilmengen des Gesamtlaufs, nicht zusätzlich zur Gesamtzahl zählen. |
| Analytics-Reproduktion | Ausgeliefertes Skript offline, ausschließlich synthetische Werte, alle fünf Fälle in Abschnitt 4 geprüft; kein echter Netzwerkversand. |
| Dokumentation | Geänderte Pfade und Aussagen mit Code abgeglichen; `git diff --check` ohne Befund. |

Vorhandene installierte Dependencies wurden genutzt. Ein frisches `npm ci` und ein vollständig neu aufgesetztes Contributor-Supabase wurden nicht verifiziert.

### Tatsächliche Live-GETs

| Pfad | Beobachtung |
| --- | --- |
| `/` | 200, erwarteter Titel, Vercel **HIT**, Cache-Alter 1.453 Sekunden |
| `/app` | 200, Wizard-HTML mit Postleitzahl-Feld |
| `/kampagne` | Redirect nach `/kampagne/starten`, dort 200 / HIT |
| `/datenschutz` | 200 / HIT |
| `/datenloeschen` ohne Token | 200, Hinweis auf fehlenden Link/Token, private/no-store, `no-referrer` im HTML |
| `/stats` ohne Freischaltung | 200, Passwortformular, private/no-store |
| `/api/email-preview` | 404, Produktionsschutz greift |
| `/api/letter-signals/map` | 200 / HIT; 2.220 Beiträge, 1.591 Punkte/PLZ-Bereiche. Punktfelder ausschließlich `x`, `y`, `count`; keine E-Mail oder Anliegen im geprüften JSON. Das ist kein Gesamtbriefzähler. |

Die Kartenkoordinaten sind eine öffentliche räumliche Projektion, keine Zusage vollständiger Anonymität einzelner Kleinstgruppen. Geprüft wurde die vereinbarte eingeschränkte Ausgabe, keine formale Reidentifikationsanalyse.

### Produktions-Schema, nur lesend

`select` mit `limit=0` vermeidet das Auslesen persönlicher Datensätze:

| Migration / Objekt | API-Ergebnis | Aussage |
| --- | --- | --- |
| 029 `campaign_creator_surveys` | 404 / `PGRST205` | Über PostgREST nicht verfügbar; vereinbarter Feature-Fallback bleibt relevant. Keine vollständige DB-Abwesenheitsprüfung. |
| 030 `global_letter_milestone_claims` | Service-Role 200; anon 401 / `42501` | Objekt lesbar für Service-Role, anon-Lesen verweigert. Insert-Recht/Constraint-Definition nicht getestet. |
| 031 `roadmap_signups` | 404 / `PGRST205` | Über API nicht verfügbar, konsistent mit dokumentiertem DROP. Keine Migration-History-Verifikation. |
| Lokaler Entwurf 032, neue Kampagnen-Spalten | 400 / `42703` | Angefragte Spalten derzeit nicht verfügbar; lokale Änderungen nicht mit produktiv angewendeter Migration verwechseln. |

### Fehlgeschlagen, korrigiert oder offen

1. **Git-Fetch blockiert:** `.git/FETCH_HEAD` nicht beschreibbar; Remote-Commit stattdessen via GitHub bestätigt. Allgemeine Web-Tool-/Sandbox-DNS-Zugriffe auf Live-Domain scheiterten zunächst; genehmigte lesende HTTPS-Probes funktionierten. Das war kein Nachweis eines Website-Ausfalls.
2. **Provider-Abfragen korrigiert:** Brevo-Tagesreport mit `limit=50` lieferte 400; mit dokumentiertem Maximum 30 erfolgreich. Der zunächst falsch geschriebene Varianten-Tag wurde zu `brief_variant` korrigiert. Ein erster lokaler Env-Parser übersah Leerzeichen um `=`; die Schemaabfrage wurde mit korrigiertem Parser wiederholt. Nur erfolgreiche korrigierte Ergebnisse tragen die Befunde.
3. **Build blockiert:** externe Font-Downloads im absichtlich abgeschirmten Build; daher kein Full-Build-Pass. Kein Produktiv-Env in diese Prüfung übernommen.
4. **Browser-/Mobile-/A11y-Prüfung offen:** erwartetes Playwright-Chromium-Binary fehlte; keine Installation. Kein echter Touch-, Viewport-, VoiceOver- oder Tastatur-End-to-End-Test. Quellcode zeigt sinnvolle native Dialoge, Fokus-/Escape-Behandlung, reduzierte Bewegung und größere Karten-Steuerflächen. Bestehende Quellcode-Assertions ersetzen diese Bedienprüfung nicht.
5. **Fachliche/operative Grenzen:** NRW-Primärquelle 429; kein Live-Versand-/Inbox-Beweis, keine AI-Briefqualitätsprobe, keine vollständige Supabase-History-/Policy-Prüfung, keine Provider-Tracking-Einstellung und keine echte Rechnung verifiziert.

## 9. Wartbarkeit und Open Source

**Gemeinsame Logik nur dort behalten/ergänzen, wo sie einen fachlichen Vertrag absichert:**

| Fundstelle | Konkreter Nutzen / Entscheidung | Zusätzliche Abhängigkeiten bzw. Kosten |
| --- | --- | --- |
| `web/src/lib/lookup/resolveRecipient.ts` und bestehende Schemas | Gemeinsame Empfängerauflösung verhindert divergierende Adressen/Zuständigkeit zwischen Auswahl, Generierung und Resend. Behalten; nicht drei separate Resolver schaffen. | Bestehende Typen/Datenmodule; keine neue Library nötig. |
| `web/src/lib/dataDeletion/userData.ts` | Vorschau, Löschaktion und CLI teilen die Eigentumszuordnung. Das macht Sicherheitskorrekturen konsistenter. | Bestehender serverseitiger Supabase-Zugriff. Keine zusätzliche Infrastruktur. |
| `web/src/lib/letterSignals/publicMapClient.ts` | Gemeinsamer Cache und Zusammenführung laufender Requests verhindern tatsächlich unnötige Kartenabrufe mehrerer Ansichten. Behalten. | Browserzustand, bestehendes Fetch; kein externer Cacheanbieter. |
| Kampagnen-Actions, insbesondere `pauseCampaign.ts` und `campaignEnd.ts` | Gemeinsame Invalidierung nur dann extrahieren, wenn mehrere Mutationen dieselbe Liste aktueller Seiten pflegen müssen. Für den konkreten Pause-Fehler reicht zunächst ein zusätzlicher `revalidatePath`-Aufruf. | Ein Helper hätte Next-Cache-Kopplung und einen weiteren Vertrag; keine neue Package-Abhängigkeit, aber nicht kostenlos verständlicher. |
| Erstmail-/Varianten-/Follow-up-Builder | Ähnliche HTML-Strukturen begründen keine gemeinsame Template-Engine. Inhalt, Datenschutz und Wiederholungsregeln unterscheiden sich. Kleine vorhandene Bausteine nutzen, keinen Großumbau. | Eine Engine würde Pfade koppeln und Mailclient-Regressionsrisiken erhöhen. |

Geringe Aufräumkandidaten: Client-Logpuffer, dessen Inhalt der Server ohnehin verwirft; einzelne Lint-Warnungen; unterschiedliche Supabase-Initialisierungsstile. Keine nachgewiesene relevante Störung, deshalb höchstens bei der nächsten Änderung derselben Stelle anfassen. Historische Planungsdateien sind nicht automatisch ungenutzter Anwendungscode.

**Contributor-Einstieg:** Die Root-README liefert brauchbaren Projekt-/Produktkontext. Die Web-README war dagegen unveränderte Next-Boilerplate mit falschem Seitenpfad/Font und ohne projektspezifischen Startvertrag; sie wurde lokal korrigiert. Die Env-Vorlage fehlte bei zentralen Variablen und enthielt leere optionale Secrets, die `??`-Fallbacks verhindern; ebenfalls korrigiert. Die Anwendung darf mit eigenen Zugangsdaten lokal kostenpflichtige Calls/echte Mails auslösen: Ein Dev-Server ist kein Sandboxmodus. Gemockte Tests sind der sichere erste Einstieg.

Offen bleibt ein wirklich frischer Start mit eigener Entwicklungsdatenbank und überprüfter Migrationsreihenfolge. Dafür genügt später ein kurzer Onboarding-Durchlauf; neue Governance-Dateien oder ein umfassendes Contributor-Portal sind nicht nötig. Im Repo wurde kein GitHub-Actions-Workflow gefunden; der beobachtete Remote-Status war der Vercel-Check. Ein kleiner Jest-/Lint-Check für PRs wäre **optional** nach den Datenschutzkorrekturen, kein Anlass für eine große CI-Plattform.

## 10. Dokumentationsabgleich und lokale Korrekturen

| Dokument / Klasse | Umgang in dieser Session |
| --- | --- |
| **Gültige Anleitungen:** Root-README, aktuelle Projekt-/Datenflussdokumente | Stichproben gegen aktuelle Pfade und Verträge; keine pauschale Neufassung. Allgemeine Aussagen zur fehlenden Anliegen-Speicherung in Supabase sind vom Debug-URL-Sonderfall zu unterscheiden. |
| **Aktuelle Anleitung, nachweislich falsch/unvollständig:** `web/README.md` | Boilerplate ersetzt durch tatsächlichen Start, Env-Vertrag, sichere Mock-Tests, Build-Grenzen und Verzeichnisübersicht. |
| **Aktuelle Konfigurationsvorlage:** `web/.env.example` | Supabase-, Feedback- und Review-Variablen ergänzt; optionale Secret-Zeilen auskommentiert, damit Fallbacks funktionieren; Routing-Modell ergänzt; historische Tracking-Prüfung nicht mehr als sichere aktuelle Aussage dargestellt. Keine echten Werte ergänzt. |
| **Historischer Audit:** `DSGVO-AUDIT.md`, April 2026 | Deutlichen historischen Hinweis und Link auf diesen Bericht ergänzt. Frühere Aussagen zu DB, Cookies, Modellen, Moderation, Tracking und Headern nicht als aktuellen Zustand präsentieren. Historischen Text und bestehende Verweise erhalten, keine Archivverschiebung. |
| **Aktueller Betriebsstatus mit historischer Evidenz:** `web/supabase/MIGRATION_STATUS.md` | Widersprüchliche „noch nicht deployed“-Aussage bei 025 entfernt; lesende API-Evidenz für 029/031 und lokalen Entwurf 032 ergänzt. Keine ausgeführte Migration oder History behauptet. |
| **Pläne / frühere Entscheidungen:** `.planning/`, lokale Kampagnen-Alternativen und Duplikat-Notiz | Erhalten. Ein Plan ist keine Produktivbeschreibung; die frühere Entscheidung gegen eine größere Dedupe-Lösung bleibt sichtbar. Unklare Absicht wurde nicht durch Löschen/Archivieren aufgelöst. |
| **Öffentliche Datenschutz-/Debug-Texte:** Anwendungscode | Keine Änderung in diesem Auftrag. Nach der Datenflusskorrektur abgleichen; Änderungen gehören in den nächsten ausdrücklich beauftragten Code-Schritt. |

Review-eigene Änderungen sind ausschließlich diese vier Dokumentationsdateien und dieser Bericht. `web/.env.example` ist eine Beispiel-/Dokumentationsdatei, kein produktives Environment.

Am Ende: weiterhin nur Branch `main`, ein Worktree, die zwei bereits vorhandenen ungepushten Commits; keine neue Branch-/Worktree-Bereinigung nötig. Arbeitsstand vor weiteren Git-Aktionen mit `git status --short` sichten. Keine vorhandenen Änderungen zurücksetzen, um das Review „sauber“ aussehen zu lassen.

## TL;DR

**Zuerst:** Empfehlungen 1 und 2 als begrenzte Datenschutzkorrektur umsetzen und mit synthetischen URLs testen. Parallel lesend Brevo-Tracking und Kontingent klären. Danach den kleinen Kampagnen-Text-/Cachefehler korrigieren.

**Kann warten:** dauerhafte Deduplizierung, Wiederaufnahme interner Meilenstein-Mails, CI-Ergänzung und Aufräumen. Bei nächstem Datenrefresh Zuordnungslücken gezielt prüfen. Ein kurzer manueller mobiler Durchlauf bis zur Empfängerauswahl wäre eine günstige zusätzliche Produktprüfung, ohne Generierung oder Versand.

**Bewusst so lassen:** bestehende Provider, Stunden-/Karten-Caches, getrennte Mailpfade, serverseitige Empfängerprüfung, pausierte Direktlinks und die signierte explizite Löschaktion. Kein neues Produktfeature aus diesem Review ableiten.

**Empfehlung: Datenschutz vor Umbau.** Die geprüfte Basis ist stabil genug für kleine gezielte Änderungen; aktuelle Kosten und belegte Fehler tragen keine größere Infrastruktur- oder Architekturmaßnahme.
