# Kampagnen S5: Startseiten-Platzierung für Unterstützer (Spende vs. Sponsoring)

Stand: 08.10.2026
Recherche gegen Primärquellen, soweit abrufbar; **keine Steuer- oder Rechtsberatung**. Labels: **[verifiziert]** = Primärquelle gelesen, **[Sekundär]** = nur Fachportal/Blog, **[Schluss]** = eigene Schlussfolgerung, **[Annahme]**, **[offen]**.

## TL;DR

1. **Nicht bauen: "ab 50 € Spende = bevorzugte Platzierung".** Eine Platzierung als Gegenleistung für eine Zahlung macht diese Zahlung sehr wahrscheinlich zum Entgelt. Dann darf WE AID keine Zuwendungsbestätigung ausstellen, und bei einer falschen Bestätigung haften Aussteller und Veranlasser (§ 10b Abs. 4 EStG). [Schluss, gestützt auf Sekundärquellen zur BFH-Rechtsprechung]
2. **Empfohlen: `landing_rank` bleibt rein redaktionell** (Qualität, Wirkung, Themenmix), ohne jede Verbindung zu Zahlungen, und das so auch öffentlich sagen.
3. **Danke an Unterstützer ist okay, wenn schlicht:** Name nennen, keine Hervorhebung, keine Verlinkung, kein Werberecht, keine Platzierungszusage.
4. **Falls Sichtbarkeit je verkauft werden soll:** getrennt als bezahlte Leistung mit Rechnung von WE AID (nicht von Thomas), ohne Zuwendungsbestätigung. Steuerlich machbar, markenpolitisch riskant. Nicht jetzt.
5. **Ein nächster Schritt:** eine kurze E-Mail an WE AID (start@we-aid.org), ob Spender:innen Nennung/Danke erhalten dürfen und ob Sichtbarkeit als bezahlte Leistung über WE AID abgewickelt werden könnte. Details unten.

## Ist-Zustand (Repo)

- **Rechtliche Struktur [verifiziert, Repo]:** Brief nach Berlin ist "eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH". Spenden laufen über `https://spende.we-aid.org/Brief-nach-Berlin` (`web/src/lib/config.ts`, `web/src/app/(site)/spenden/page.tsx`, Test `followupDonationCta.test.ts`). Kein eigener e.V./gGmbH, kein Einzelunternehmen als Spendenempfänger. Die Rechtsform-Recherche ([2026-08-16](./2026-08-16-rechtsform-foerderung.md)) war Vorstufe; die tatsächliche Wahl ist WE AID als Fiscal Host ([2026-09-16 Funding-Landscape](./2026-09-16-funding-landscape-de-eu.md), [docs/research/bcause-vs-we-aid-2026-09-18.md](../../docs/research/bcause-vs-we-aid-2026-09-18.md)).
- **Offen:** Ein schriftlicher Vertrag mit WE AID wurde nirgends geprüft (laut bcause-Vergleich "nicht geprüft"). Anbieterfrage Thomas persönlich vs. WE AID ist in `nutzungsbedingungen/page.tsx` als "PRÜFEN (Anwalt)" markiert. [offen]
- **landing_rank heute [verifiziert, Code]:** `024_campaign_landing_rank.sql` legt `landing_rank` (1-9) und `landing_label` an. `getLandingCampaigns()` zeigt höchstens 3 aktive, freigegebene, laufende Kampagnen mit gesetztem Rang, sortiert nach Rang. Gesetzt wird der Rang von Thomas per Studio-Befehl. Es gibt keine Verknüpfung zu Zahlungen. Wichtig: Die Plätze sind knapp (3), die Platzierung ist ein echter Vorteil.

## 1. Spende vs. Sponsoring vs. Werbeleistung

**1a. Unentgeltlichkeit ist Voraussetzung der Spende.**
- § 10b Abs. 1 EStG regelt den Abzug von "Zuwendungen (Spenden und Mitgliedsbeiträge)" zur Förderung steuerbegünstigter Zwecke; das Wort "unentgeltlich" steht dort nicht. [verifiziert: [§ 10b EStG](https://www.gesetze-im-internet.de/estg/__10b.html)]
- Die Unentgeltlichkeit kommt aus der Rechtsprechung (BFH X R 191/87 vom 20.02.1991; XI R 6/03 vom 02.08.2006). Danach darf eine Spende kein "offensichtliches oder verdecktes Entgelt" sein; auch ein nicht-wirtschaftlicher eigener Vorteil schadet, und dann sei "kein Raum" für eine Spendenbescheinigung. [Sekundär: [IWW Fachbeitrag](https://www.iww.de/vb/spendenrecht/spenden-spendenabzug-jede-irgendwie-geartete-gegenleistung-schaedlich-f85169), [Haufe-Kommentar](https://www.haufe.de/id/kommentar/frotschergeurts-estg-10b-steuerbeguenstigte-zwecke-21-allgemeines-HI2276600.html)] Die BFH-Urteile selbst nicht gelesen. [offen]
- Bei einheitlichen Leistungen gilt laut denselben Quellen ein Aufteilungsverbot: Man kann nicht "50 € = 40 € Spende + 10 € Platzierung" machen. [Sekundär]

**1b. Sponsoringerlass (BMF 18.02.1998, BStBl I 1998 S. 212).**
- Er behandelt die ertragsteuerliche Seite von Sponsoring bei Sponsor und steuerbegünstigtem Empfänger. Nr. 7: Zahlungen, die keine Betriebsausgaben sind, sind Spenden, wenn sie freiwillig sind, kein Entgelt für eine konkrete Leistung des Empfängers darstellen und keinen wirtschaftlichen Zusammenhang mit dessen Leistungen haben. [Sekundär, aus Suchauszügen; Volltext vom BMF-Server nicht abrufbar (503). Quelle: [Haufe](https://www.haufe.de/id/verwaltungsanweisung/sponsoring-umsatzsteuer-HI2153673.html), [IWW](https://www.iww.de/gstb/archiv/bundesfinanzministerium-steuerliche-behandlung-des-sponsoring-f42603)]
- **Einordnung [Schluss]:** Der Erlass denkt an Unternehmen als Sponsoren. Die Ersteller von Kampagnen sind meist Privatpersonen, Vereine oder Initiativen. Das ändert die Logik nicht: Wer zahlt, um etwas zu bekommen (bessere Sichtbarkeit seiner Kampagne), zahlt im eigenen Interesse, also kein reines "fremdnütziges" Geben.

**1c. Passive Duldung vs. aktive Werbung.**
- AEAO zu § 64 Nr. 9: Erlaubt die Körperschaft dem Sponsor nur, ihren Namen zu nutzen, und weist der Sponsor selbst auf seine Leistungen hin, liegt kein wirtschaftlicher Geschäftsbetrieb vor. Dasselbe, wenn der Empfänger auf die Unterstützung hinweist, auch mit Name, Emblem oder Logo, "ohne besondere Hervorhebung". [Sekundär, Text von steuerschroeder.de; BMF-Seite lieferte 503: [AEAO § 64](https://ao.bundesfinanzministerium.de/ao/2025/Abgabenordnung/Zweiter-Teil/Dritter-Abschnitt/Paragraf-64/ae-64.html) zur Prüfung des Wortlauts]
- UStAE Abschn. 1.1 Abs. 23 (aus BMF 13.11.2012, ergänzt 25.07.2014): Ein bloßer Hinweis auf den Sponsor ist keine Leistung im Leistungsaustausch, solange der Name/das Logo ohne "besondere Hervorhebung oder Verlinkung" genannt wird. Anders, wenn dem Sponsor das ausdrückliche Recht eingeräumt wird, die Maßnahme in eigener Werbung zu vermarkten. [Sekundär: [Betriebs-Berater](https://betriebs-berater.ruw.de/steuerrecht/nachrichten/Umsatzsteuerrechtliche-Behandlung-des-Sponsorings-11138), [BMF-Schreiben 13.11.2012 als PDF](https://kooperation.uni-wuppertal.de/fileadmin/kommunikation/Fundraising/2012-11-13-BMF_Sponsoring.pdf), nicht lesbar]
- **Anwendung [Schluss]:** Eine **hervorgehobene Platzierung in den 3 Hero-Pills der Startseite** ist keine "Nennung ohne besondere Hervorhebung", sondern ein Vorteil mit Werbewert. Das wäre aktive Werbeleistung: Leistungsaustausch, Umsatzsteuer, wirtschaftlicher Geschäftsbetrieb.

**1d. Folgen, wenn es kein Spendenfall mehr ist.**
- **Zuwendungsbestätigung:** Spendenabzug erfordert grundsätzlich die Bestätigung auf amtlichem Vordruck (bis 300 € genügt Buchungsbeleg, nur bei bestimmten Empfängern). [verifiziert: [§ 50 EStDV](https://www.gesetze-im-internet.de/estdv_1955/__50.html)] Für ein Entgelt darf sie nicht ausgestellt werden. [Schluss]
- **Haftung:** "Wer vorsätzlich oder grob fahrlässig eine unrichtige Bestätigung ausstellt oder veranlasst", haftet; der entgangene Steuerbetrag wird mit 30 % des Betrags angesetzt (Veranlasserhaftung, Empfängerkörperschaft zuerst). [verifiziert: [§ 10b Abs. 4 EStG](https://www.gesetze-im-internet.de/estg/__10b.html)] **Risiko [Schluss]:** WE AID als Aussteller, Thomas als "Veranlasser", wenn er ein Modell aufsetzt, das die Entgeltlichkeit erkennbar macht. Der konkrete Umfang der Veranlasserhaftung für Thomas ist Steuerberater-Frage. [offen]
- **Ertragsteuer bei WE AID:** Aktive Werbung ist wirtschaftlicher Geschäftsbetrieb ohne Zweckbetrieb; die Freigrenze liegt bei 50.000 € Einnahmen pro Jahr (einschließlich USt), darüber droht Steuerpflicht für diesen Bereich, "verliert die Körperschaft die Steuervergünstigung" für ihn. [verifiziert: [§ 64 AO](https://www.gesetze-im-internet.de/ao_1977/__64.html)] Bei wenigen 50-€-Beträgen sehr weit entfernt, aber das Konto von WE AID insgesamt zählt. [Annahme]
- **Umsatzsteuer:** Bezahlte Platzierung = steuerbare Leistung. Ob 19 % oder 7 % (ermäßigt gilt nach älterer Verwaltungsmeinung für reine Duldungsleistungen, § 12 Abs. 2 Nr. 8 UStG) und ob WE AID Kleinunternehmer ist, entscheidet WE AID. [Sekundär/Annahme, siehe 3c]

**1e. Direkte Antworten.**
- **"Danke"/Nennung ohne hervorgehobene Werbung: bleibt es eine Spende?** [Schluss, gestützt auf AEAO § 64 Nr. 9 und UStAE 1.1 Abs. 23] Ja, nach der Verwaltungsauffassung: schlichte Nennung des Namens, keine Hervorhebung, keine Verlinkung, kein Werberecht, keine Zusage vorab. Einmalig freiwilliges Danke nach der Spende ist am unkritischsten; ein **vorab versprochenes** Danke "ab 50 €" nähert sich einer Gegenleistung. [offen: Steuerberater/WE AID]
- **Zählt ein spendenabhängiger Ranking-Boost als Gegenleistung?** Ja, sehr wahrscheinlich: ein konkreter, werthaltiger, zugesagter Vorteil im eigenen Interesse des Zahlenden, mit Schwelle (50 €) als Preis. [Schluss, hohe Sicherheit] Die Schwelle macht es schlimmer: Sie ist ein Preis.

## 2. WE-AID-Bedingungen

- **Gefunden [verifiziert, live abgerufen 08.10.2026]:**
  - WE AID ist Vertragspartner und stellt "die Spendenbescheinigungen" aus; Spenden und Fördermittel müssen für die gemeinnützige Tätigkeit der Initiative verwendet werden. [Über uns](https://www.we-aid.org/de/about-us/)
  - Spenden an WE AID oder Initiativen "berechtigen zum Steuerabzug"; 5-10 % Beitrag. [Transparenz](https://www.we-aid.org/de/transparency/), [Unterstützen](https://www.we-aid.org/de/support/)
  - Spenden sind für den genannten Zweck einzusetzen. [Unterstützen](https://www.we-aid.org/de/support/)
- **Nicht gefunden:** Weder auf Support-, Transparenz-, FAQ- noch Über-uns-Seite stehen Aussagen zu Gegenleistung, Sponsoring, Werbung, Umsatzsteuer oder was Projektpartner Spender:innen versprechen dürfen. Eine öffentliche AGB für Initiativen fand ich nicht. [verifiziert als Negativbefund, begrenzt auf die abgerufenen Seiten] Die Bedingungen stehen vermutlich im Initiativen-Vertrag, den das Repo nicht enthält. [Annahme]
- **Folgerung [Schluss]:** WE AID stellt die Bescheinigungen aus und haftet dafür zuerst. Es ist praktisch auszuschließen, dass WE AID ein Modell erlaubt, bei dem Spenden mit Platzierungsvorteil verknüpft sind und trotzdem bescheinigt werden. Das ist aber nicht belegt, sondern muss schriftlich bestätigt werden. [offen: WE AID]

## 3. Alternativen ohne Gegenleistung

**3a. Redaktionelle Auswahl (empfohlen).**
- Thomas wählt `landing_rank` nach nachvollziehbaren Kriterien (Qualität, politische Neutralität, Unterschriften/Briefe, Aktualität), unabhängig vom Spendenstatus. Technisch passiert das heute schon. [verifiziert, Code]
- Steuerlich unkritisch: keine Zahlung, keine Gegenleistung. [Schluss]
- Marke: Passt zur Neutralität einer politischen Briefplattform; die Kriterien öffentlich machen ("Wie wir auswählen"), inkl. Satz "Spenden beeinflussen die Auswahl nicht". [Vorschlag]
- Falle: Die Auswahl **darf nicht stillschweigend** doch Spender bevorzugen. Dann wäre sie faktisch Gegenleistung, nur unsichtbar. [Schluss]

**3b. Öffentliches Danke.**
- Zulässig im Sinne der Nennung ohne Hervorhebung (siehe 1c). Praktisch: eine schlichte, alphabetische Liste "Danke an" mit Vornamen/Selbstbezeichnung auf `/spenden`, nur mit Einwilligung, ohne Link, ohne Betrag, ohne Rang, nicht auf der Startseite. Nicht vorab versprechen, nicht nach Betrag staffeln. [Schluss]
- DSGVO: Namen von Spender:innen sind personenbezogene Daten; Nennung nur mit ausdrücklicher Einwilligung, Widerruf möglich. WE AID hält die Spenderdaten, nicht Brief nach Berlin (siehe bcause-Vergleich, Frage 4). Also müsste WE AID die Einwilligung einholen oder Thomas fragt nach der Spende separat. [Schluss/offen]

**3c. Getrenntes bezahltes "Hervorheben" mit Rechnung.**
- **Wer rechnet ab? [Schluss/Annahme]** WE AID ist "Vertragspartner und Rechnungsempfänger" der Initiativen (Über uns). Einnahmen der Initiative sind Einnahmen von WE AID. Also muss WE AID Leistungserbringerin und Rechnungsstellerin sein, nicht Thomas privat. Würde Thomas privat abrechnen, wäre das ein privates Gewerbe mit Einkommensteuer, Gewerbeanmeldung und mit ALG-I-Folgen, die [2026-08-16-alg1-gruendung.md](./2026-08-16-alg1-gruendung.md) behandelt. WE AID müsste zustimmen, weil es einen wirtschaftlichen Geschäftsbetrieb (Werbung) begründet. [offen: WE AID]
- **Kleinunternehmer § 19 UStG:** Grenze 25.000 € im Vorjahr und 100.000 € im laufenden Jahr, Verzicht möglich. [verifiziert: [§ 19 UStG](https://www.gesetze-im-internet.de/ustg_1980/__19.html)] Ob WE AID Kleinunternehmerin ist, ist unwahrscheinlich bei ihrem Volumen; die Umsatzsteuer-Behandlung (19 %?) legt WE AID fest. [Annahme, offen]
- **Getrennt halten:** Kein Zusammenhang zwischen Spendenbutton und Hervorhebung, keine Zuwendungsbestätigung für diesen Betrag, Rechnung mit Leistungsbeschreibung. Wer beides will, zahlt zweimal getrennt. [Schluss]
- **Marke/Neutralität:** Eine Plattform für Briefe an Politiker, die Sichtbarkeit verkauft, riskiert den Vorwurf "wer zahlt, wird gehört", besonders bei politischen Kampagnen (Lobbygruppen, Parteinähe). Das widerspricht dem Gemeinnützigkeitszweck "politische Bildung/geistige Offenheit" ([AEAO zu § 52, siehe 2026-08-16](./2026-08-16-rechtsform-foerderung.md)) und gefährdet das Vertrauen der Nutzer. [Schluss] Zusätzlich: Moderationsentscheidung und Zahlung wären verknüpft; eine abgelehnte Kampagne zahlt nicht, was Streit erzeugt. Die Plätze sind begrenzt (3).
- **DSGVO:** Rechnungsdaten von Kampagnenerstellern sind zusätzlich zu verarbeiten (Aufbewahrungspflichten). Verbunden mit der Prinzipentscheidung "Datensparsamkeit, keine Accounts" für Nutzer, aber nicht für Kampagnenersteller. [Schluss]
- **Fazit:** Machbar, aber Aufwand (Vertrag mit WE AID, Rechnungslauf, Umsatzsteuer, Moderations-Policy) steht in keinem Verhältnis zu den Einnahmen von wenigen 50-€-Beträgen. Die "Traction Mai 2026" (~300 Briefe) rechtfertigt es nicht. [Schluss]

## 4. Empfehlung

1. **Nicht umsetzen:** Zahlungsschwelle für Rangvorteil. Begründung: Gegenleistung zerstört Spendenqualität und gefährdet WE AIDs Bescheinigungsrecht; Haftungsrisiko 30 % (§ 10b Abs. 4 EStG).
2. **`landing_rank` weiter manuell und redaktionell** nach veröffentlichten Kriterien.
3. **Danke** optional, später, schlicht und einwilligungsbasiert.
4. **Bezahlte Sichtbarkeit** vorerst nicht; nur falls Nachfrage von Organisationen belegt ist (erst Validierung: gibt es überhaupt Ersteller, die dafür zahlen würden?).

## Offene Fragen (Steuerberater / WE AID)

1. **WE AID:** Dürfen Spender:innen eine öffentliche Nennung ("Danke") erhalten, ohne dass die Bescheinigung gefährdet ist? Ab welcher Form (Name, Link, Logo) ist das aus ihrer Sicht Gegenleistung?
2. **WE AID:** Gibt es Regeln im Initiativen-Vertrag zu Gegenleistungen, Sponsoring, Werbeeinnahmen und Rechnungsstellung? Würde WE AID bezahlte Sichtbarkeit abrechnen (inkl. Umsatzsteuer, Kleinunternehmerstatus)?
3. **Steuerberater:** Veranlasserhaftung (§ 10b Abs. 4 EStG) für Thomas als Projektleiter bei einem spendenabhängigen Ranking.
4. **Steuerberater:** Wirtschaftlicher Geschäftsbetrieb bei WE AID durch Werbeeinnahmen, Freigrenze 50.000 €, Umsatzsteuersatz.
5. **Nicht geprüft:** Volltext BMF 18.02.1998 und AEAO § 64 Nr. 9 (BMF-Server lieferte 503), BFH-Urteile im Original, die aktuelle Fassung von UStAE 1.1 Abs. 23. Stützt sich auf Sekundärquellen.

## Nächster Schritt

**Eine E-Mail von Thomas an WE AID (start@we-aid.org), entworfen nicht gesendet:** "Wir möchten Kampagnen-Ersteller, die gespendet haben, öffentlich danken (nur Name, ohne Link/Hervorhebung, nur mit Einwilligung) und separat eine bezahlte Hervorhebung prüfen. Welche Regeln gelten in unserem Initiativenvertrag für Gegenleistungen, Sponsoring und Rechnungsstellung, und würdet ihr eine bezahlte Leistung über WE AID abrechnen?" Bis zur Antwort bleibt alles beim Ist-Zustand (manuelles `landing_rank`). Aufwand: 10 Minuten. Nichts senden ohne Freigabe.

## Quellen

Primär [verifiziert gelesen]:
- [§ 10b EStG](https://www.gesetze-im-internet.de/estg/__10b.html)
- [§ 50 EStDV](https://www.gesetze-im-internet.de/estdv_1955/__50.html)
- [§ 64 AO](https://www.gesetze-im-internet.de/ao_1977/__64.html)
- [§ 19 UStG](https://www.gesetze-im-internet.de/ustg_1980/__19.html)
- WE AID: [Unterstützen](https://www.we-aid.org/de/support/), [Transparenz](https://www.we-aid.org/de/transparency/), [Über uns](https://www.we-aid.org/de/about-us/), [FAQ](https://www.we-aid.org/de/faq/)

Primär, aber nicht abrufbar (503/PDF nicht lesbar), nur über Sekundärquellen zitiert:
- [AEAO zu § 64](https://ao.bundesfinanzministerium.de/ao/2025/Abgabenordnung/Zweiter-Teil/Dritter-Abschnitt/Paragraf-64/ae-64.html)
- BMF 18.02.1998 Sponsoringerlass (Kopie: [VKU-PDF](https://www.vku.de/fileadmin/user_upload/Verbandsseite/Sparten/Wasserwirtschaft/Ukraine_Wasserwirtschaft/220330_Anlage_Sponsoring-Erlass_BMF.pdf))
- [BMF 13.11.2012 Umsatzsteuer/Sponsoring](https://kooperation.uni-wuppertal.de/fileadmin/kommunikation/Fundraising/2012-11-13-BMF_Sponsoring.pdf) und UStAE 1.1 Abs. 23

Sekundär [nur zur Erklärung]:
- [IWW: Gegenleistung schädlich](https://www.iww.de/vb/spendenrecht/spenden-spendenabzug-jede-irgendwie-geartete-gegenleistung-schaedlich-f85169)
- [Haufe: § 10b Allgemeines](https://www.haufe.de/id/kommentar/frotschergeurts-estg-10b-steuerbeguenstigte-zwecke-21-allgemeines-HI2276600.html)
- [Haufe: Sponsoring Umsatzsteuer](https://www.haufe.de/id/verwaltungsanweisung/sponsoring-umsatzsteuer-HI2153673.html)
- [IWW: BMF zu Sponsoring](https://www.iww.de/gstb/archiv/bundesfinanzministerium-steuerliche-behandlung-des-sponsoring-f42603)
- [Betriebs-Berater: UStAE Sponsoring](https://betriebs-berater.ruw.de/steuerrecht/nachrichten/Umsatzsteuerrechtliche-Behandlung-des-Sponsorings-11138)

Repo: `web/supabase/migrations/024_campaign_landing_rank.sql`, `web/src/lib/campaigns/repository.ts` (getLandingCampaigns), `web/src/lib/config.ts`, `.planning/research/2026-08-16-rechtsform-foerderung.md`, `2026-09-16-funding-landscape-de-eu.md`, `docs/research/bcause-vs-we-aid-2026-09-18.md`.

*Keine Steuer- oder Rechtsberatung. Keine Anfrage gesendet.*
