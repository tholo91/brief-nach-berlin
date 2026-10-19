# MdEP-Kampagnen: Briefe an Europaabgeordnete

Stand: 2026-10-14. Anlass: Lilly (eeg-so-nicht, EEG-Novelle 2027) fragt, ob Brief-nach-Berlin eine Kampagne an "unsere" Europaabgeordneten in ihren Regionalbüros schalten kann, z. B. "Niederbayern-Büro Manfred Weber, MdEP, Mühlsteingasse 7, 94315 Straubing".

## Entscheidungsstand

- **Gewählt (vorläufig):** eine gemeinsame Kampagne. Die PLZ bestimmt das Bundesland, und pro Bundesland geht der Brief an genau eine:n MdEP mit Regionalbüro-Adresse in Deutschland (95 Cent Porto).
- **Wartet auf Lilly:** eine Liste pro Bundesland (Name, Anrede, Büroadresse), einen Termin und Ersatzadressen für Länder ohne Büro.
- **Nicht jetzt:** die EU-Ebene im normalen Wizard (eventuell V3) und die Parteizentrale als Empfänger (der Brief erreicht dort nicht die Person).

## Fakten (geprüft)

- 96 deutsche MdEP (2024–2029), keine Wahlkreise. CDU tritt mit Landeslisten an, CSU nur in Bayern, alle anderen Parteien mit einer Bundesliste. Eine offizielle Zuordnung von PLZ zu MdEP gibt es nicht.
- Inoffiziell betreuen viele MdEP eine Region und haben dort ein Büro (siehe Lillys Beispiel mit Weber). Nicht alle MdEP haben eine deutsche Postadresse auf ihrem EP-Profil.
- Porto ab Deutschland: national 0,95 €, international 1,25 €, mit einem Preis für alle Länder ([Deutsche Post](https://www.deutschepost.de/de/b/briefe-ins-ausland.html)).
- EP-Adresse in Brüssel: Parlement européen, Gebäude + Raum, Rue Wiertz / Wiertzstraat 60, B-1047 Bruxelles. Die Raumnummer lässt sich über die EP Open Data API ermitteln ([EP-Kontakt](https://www.europarl.europa.eu/portal/en/contact)).
- Abgeordnetenwatch API: `parliament_period=155` (EU-Parlament 2024–2029) liefert 96 Mandate mit Liste, Fraktion und Nachrückenden, aber keine Adressen.
- Das EP-Verbindungsbüro in Berlin (Unter den Linden 78) leitet laut den gefundenen Quellen keine Post an einzelne MdEP weiter.
- Liste der MdEP nach Bundesland: [ZDH-PDF](https://www.zdh.de/fileadmin/Oeffentlich/Europa/Themen/Deutsche_Abgeordnete_im_Europaeischen_Parlament_Bundeslaender.pdf). Bayern: [vbw-PDF](https://vbw-bayern.de/Redaktion/Frei-zugaengliche-Medien/Abteilungen-GS/Europa/2024/Downloads/240724-Bayerische-Abgeordnete-im-Europaparlament-und-ihre-Aktivit%C3%A4ten.pdf).

## Einschätzung (Schlussfolgerung)

- Bei EU-Themen wirken Berichterstatter:innen und Ausschussmitglieder (beim EEG: Industrie- und Energieausschuss ITRE) stärker als "der eigene" MdEP. Lilly sollte pro Land jemanden wählen, der beim Thema mitredet.
- Große Länder wie Bayern: Weber betreut nur Niederbayern, also landen Briefe aus Franken trotzdem in Straubing. Für den Start ist das okay, eine Aufteilung nach Region (PLZ-Bereich) wäre ein späterer Schritt.
- Das EEG selbst wird im Bundestag beschlossen. Eine Bund-Kampagne nach PLZ an die eigenen MdBs läuft heute schon und ist eventuell der stärkere Hebel. Der EU-Bezug kommt vermutlich von den Differenzverträgen (CfD) aus dem EU-Strommarktdesign; das ist nicht geprüft.

## Code-Stand und Umbau

Pfade relativ zu `web/`.

- **Kampagnen-Modus `Fixed` gibt es schon** (so läuft die NRV-Kampagne ans hessische Justizministerium): Migration `supabase/migrations/023_campaign_fixed_recipient.sql`, Schema in `src/lib/campaigns/schema.ts:56-75`, Empfänger in `src/lib/lookup/campaignFixedRecipient.ts`, neutraler Prompt-Block in `generateLetter.ts:386-394`.
- **Grenzen heute:** genau ein fester Empfänger pro Kampagne, `countryCode: z.literal("DE")`, PLZ mit 5 Stellen, "0,95 EUR" fest im Code (`mailLocale.ts:44`, `:218`).
- **Die PLZ-zu-Bundesland-Zuordnung gibt es schon:** `data/plz-bundesland-mapping.json`.

### Stufen

| Stufe | Was | Umfang |
|---|---|---|
| V0 | eine `Fixed`-Kampagne pro Region/MdEP mit deutscher Büroadresse | kein Code |
| **V1 (gewählt)** | eine Kampagne, Bundesland → genau ein fester Empfänger (16 Einträge + Fallback) | mittel: Migration + ca. 8 Dateien (Schema, Creator-Form, Auflösung via PLZ→Bundesland, Guards in `selectPolitician.ts` / `api/generate-letter/route.ts`, Mail) |
| V1b | Brüssel-Adressen (BE, 4-stellige PLZ, Zeile "BELGIEN", 1,25 € Porto) | klein: ca. 6 Dateien, nur bei Bedarf |
| V2 | feinere Aufteilung nach PLZ-Bereich/Region bzw. Auswahl aus mehreren MdEP | mittel |
| V3 | EU-Ebene im normalen Wizard (Level `EU`, Typ `mdep`, Fetch-Skript, Level-Router, Stats, CHECK-Constraints) | groß |

## Offene Fragen

1. Bundesweit oder nur Bayern?
2. Wer pro Land, und gibt es überhaupt in jedem Land ein Büro?
3. Termin, bis wann die Briefe ankommen sollen.
4. Gilt die Handyporto-Marke im Ausland? Relevant nur für V1b.
