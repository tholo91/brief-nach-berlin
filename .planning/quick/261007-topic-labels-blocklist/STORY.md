# Konkrete Subthemen statt Whitelist (Topic-Labels)

Stand: 2026-10-07. Entscheidung von Thomas: umsetzen.
Umsetzung als `/gsd-quick` in einem eigenen Tab. Diese Datei ist die Vorgabe.

## Ziel

Langfristig auswerten: wer (E-Mail, nur mit Opt-in), wann, von wo (PLZ, Bundesland) zu welchem Thema geschrieben hat. Dafür zwei Ebenen pro Brief:

- **Oberthema** = die bestehenden 13 Kategorien (`topic_categories`). Bleibt wie es ist. Erster Code = Hauptthema.
- **Subthemen** = 1 bis 3 konkrete Stichworte aus dem eigentlichen Anliegen (`topic_labels`). Heute fast wertlos, soll aussagekräftig werden.

## Ist-Zustand (verifiziert am 2026-10-07)

- Mistral liefert im Routing-Call (`routeToLevel`) beide Felder. Die 13 Kategorie-Codes sieht es als Enum im JSON-Schema, die Labels sind freie Strings.
- Die Labels werden danach serverseitig gegen eine Whitelist gefiltert (`SAFE_GENERIC_TOPICS`, `SAFE_MULTIWORD_TOPICS`, `SAFE_COMPOUND_TOPIC_REGEX` in `web/src/lib/topics/topicTaxonomy.ts`). Was nicht auf der Liste steht, wird stillschweigend verworfen. Bleibt nichts übrig, wird der Kategorie-Name eingesetzt ("Demokratie", "Verkehr").
- **Mistral sieht die Whitelist nie.** Es gibt kein Feedback, kein Nachfragen.
- Live-Daten `letter_signals`: 714 Zeilen (223 frei, 491 Kampagne). Bei den freien Briefen tragen 148 nur das Label "Demokratie". Insgesamt gibt es 32 verschiedene Labels.

### Live-Test (mistral-small, gleiche Themen-Anweisung und gleiches JSON-Schema wie die App)

| # | Anliegen (erfunden) | Kategorien | Mistral schlägt vor | Gespeichert heute |
|---|---|---|---|---|
| A | Bundesverfassungsgericht vor Sperrminorität schützen, AfD könnte Richterwahl blockieren | demokratie_staat, sicherheit_justiz | Bundesverfassungsgericht, Richterwahl, Parteieneinfluss | Demokratie, Sicherheit |
| B | Sohn wartet seit acht Monaten auf Kitaplatz, keine Erzieher | bildung, soziales_familie | Kita-Platzvergabe, Erziehermangel, Vereinbarkeit von Familie und Beruf | Bildung, Soziales |
| C | Radweg auf der Hauptstraße zugeparkt, lebensgefährlich | verkehr_mobilitaet | Radverkehr, Falschparken, Verkehrssicherheit | Verkehrssicherheit |
| D | Als Schwarzer Deutscher ständig am Bahnhof kontrolliert, Racial Profiling verbieten | sicherheit_justiz, migration_integration | Polizeikontrollen, Diskriminierungsschutz, Racial Profiling | Sicherheit, Migration |
| E | Miete in drei Jahren um 40 Prozent gestiegen, Mietendeckel | wohnen_bauen | Mietpreisentwicklung, Wohnungspolitik | Wohnungspolitik |
| F | AfD stark bei Landtagswahl Sachsen, Angst vor Rechtsruck, was gegen Rechtsextremismus | demokratie_staat, sicherheit_justiz | Rechtsextremismus, Landespolitik Sachsen, Wahlanalyse | Demokratie, Sicherheit |

Mistral liefert bereits genau das, was wir wollen. Die Whitelist wirft es weg.

## Entscheidung: Blocklist statt größerer Whitelist

1. Eine Whitelist muss das Vokabular der Bürger vorhersagen. Das geht nicht, siehe Tabelle: sechs von sechs Fällen verlieren ihre Spezifik.
2. Eine Blocklist muss nur die Risiken kennen: Personen, Adressen, Daten, Organisationen, Parteien. Das ist eine endliche Liste, und die Regexe dafür existieren schon.
3. Das DSGVO-Risiko liegt in der Zeilenstruktur (E-Mail plus Thema), nicht in der Label-Feinheit. Die Zeile ist heute schon Meinungsdaten mit ausdrücklicher Einwilligung (Art. 9 Abs. 2 lit. a steht bereits in der Datenschutzerklärung). Labels sind nicht öffentlich, die Karte zeigt nur PLZ-Zähler. Neu dazu kommt nur: Parteinamen explizit sperren.

Verworfen: Whitelist erweitern und Mistral als Enum zeigen. Gleiches Problem, nur später.

## Was sich ändert

### Supabase: nichts

- `letter_signals.topic_labels`: Constraint prüft nur Anzahl 1 bis 3 und keine NULL-Einträge (Migration 017). Keine Whitelist in der DB.
- `campaigns.topic_labels`: ebenso (Migration 022).
- `consent_version` ist Freitext.
- Postgres-Arrays behalten die Reihenfolge, Hauptthema = Index 0. Keine neue Spalte.
- Keine Migration, kein Studio-Schritt.

### Mistral: nur Prompt-Text, zwei Stellen

Kein Modellwechsel, keine Account-Einstellung, JSON-Schema (`TOPIC_JSON_SCHEMA_PROPERTIES`) bleibt.

1. `web/src/lib/lookup/levelRouter.ts`, `buildSystemPrompt()`: die JSON-Strukturzeile und die Regeln ergänzen:
   - `topic_categories`: geordnet, erster Code = Hauptthema.
   - `topic_labels`: 1 bis 3 konkrete Stichworte aus dem Anliegen, je höchstens zwei Wörter, Substantive, so spezifisch wie der Text (z. B. "Erziehermangel", "Radverkehr", "Bundesverfassungsgericht"). Keine Personen, Adressen, Firmen, Parteien, keine Platzhalter wie "Anliegen" oder "Politik".
2. `web/src/lib/generation/generateLetter.ts`, Fallback-Antwortformat (`__RESPONSE_FORMAT__`, um Zeile 379): dieselbe Anweisung. Greift nur, wenn das Routing kein Topic geliefert hat.

### Code: `web/src/lib/topics/topicTaxonomy.ts`

- Entfernen: `SAFE_GENERIC_TOPICS`, `SAFE_MULTIWORD_TOPICS`, `SAFE_COMPOUND_TOPIC_REGEX` und das Refine "Unterthema liegt außerhalb der minimierten Themenliste".
- Behalten: Zeichen-Regex, Zwei-Wort-Limit, max. 60 Zeichen, die PII-Refines (E-Mail, PLZ, Datum, mein/unser/ich/Herr/Frau/Dr./Prof., GmbH/AG/e.V./Verein/Partei, Straße plus Hausnummer).
- Neu: Partei-Blocklist als Refine. Mindestens: AfD, CDU, CSU, SPD, FDP, Grüne, Grünen, Bündnis 90, Linke, Linkspartei, BSW, Volt, Freie Wähler, NPD, Die PARTEI, Werteunion, Piraten, Tierschutzpartei. Mit Wortgrenzen und Bindestrich-Komposita ("AfD-Verbot" wird geblockt). Groß/Klein egal.
- Fallback bleibt: Sind alle Labels geblockt, greift `CATEGORY_FALLBACK_LABELS`.
- `TOPIC_TAXONOMY_VERSION` bleibt `v1`. Die Kategorien ändern sich nicht. Schnitt für die Auswertung ist die neue `consent_version` bzw. `created_at`.
- Bewusst nicht: Politikernamen sperren. Namen öffentlicher Personen sind keine Daten des Absenders. Die bestehende Herr/Frau-Sperre reicht.

### Einwilligung und Datenschutz

- `web/src/components/wizard/LetterSignalCard.tsx` Zeile 159: "ein grobes Thema" wird zu "Thema und bis zu drei Stichworte deines Anliegens". Kein Gedankenstrich, Stil wie bisher.
- `web/src/lib/actions/letterSignals.ts` Zeile 20: `LETTER_SIGNAL_CONSENT_VERSION` auf `letter-signals-2026-10-v3-topic-keywords`.
- `web/src/app/(site)/datenschutz/page.tsx` um Zeile 222: "kurze Themenlabels" wird zu "kurze Themen-Stichworte (z. B. Radverkehr, Erziehermangel)". Der Art.-9-Satz (Zeile 226 bis 228) bleibt.

### Tests

- `web/src/__tests__/topicTaxonomy.test.ts`: die Tests "rejects ambiguous labels that look like a person, organization, or place" und "keeps valid categories with a safe generic label when free labels are unsafe or unsupported" anpassen. Neue Fälle: PASS für Bundesverfassungsgericht, Racial Profiling, Erziehermangel, Mietendeckel. DROP für AfD, AfD-Verbot, Herr Müller, Hauptstraße 12, 28195, thomas@example.de.
- Prompt-Snapshots in `generateLetterPrompt.test.ts`, `generateLetterLevelPrompt.test.ts`, `levelRouter.test.ts` aktualisieren.
- `letterSignalActions.test.ts`: neue Consent-Version.

### Optional, klein

- `web/src/lib/internalStats/aggregate.ts`: zusätzlich Hauptthema zählen (`topic_categories[0]`), neben der bestehenden Gesamtzählung.

## Nicht anfassen

- `web/src/lib/i18n/uiCatalog.ts` und `web/src/__tests__/landingPageContent.test.ts` sind im Worktree modifiziert (fremde, uncommittete Arbeit). Nicht berühren, nicht committen.
- Die 13 Kategorien, die Karte, die Supabase-RPCs.

## Bekannte Grenzen

- Alte Zeilen bleiben flach. Ohne Volltext gibt es kein Re-Clustering, nur die 13 Codes.
- Kampagnen-Briefe übernehmen das gespeicherte Kampagnen-Topic. Das wird erst beim nächsten inhaltlichen Speichern der Kampagne neu klassifiziert. Für laufende Kampagnen einmal den Kampagnentext neu speichern, damit die Labels konkret werden.
- Label-Varianten ("Energiewende" vs. "Energiepolitik") werden beim Schreiben nicht normalisiert. Das passiert später beim Clustern per LLM.

## Akzeptanz

1. Die sechs Beispiele oben durch `routeToLevel` schicken: gespeicherte Labels entsprechen den Mistral-Vorschlägen, abzüglich geblockter. "AfD" taucht nie auf.
2. `cd web && npx jest` grün.
3. Consent-Text, Consent-Version und Datenschutzerklärung geändert.
4. Kein Schema-Diff in `web/supabase/migrations`.

Aufwand etwa 2 Stunden.

## Umgebungshinweis

iCloud hat am 2026-10-07 rund 14.000 Dateien in `web/node_modules` ausgelagert. jest und tsx hängen dann ohne Fehlermeldung. Vor dem Start prüfen und ggf. zurückladen:

```bash
cd "/Users/thomas/Documents/Git Repos/brief-nach-berlin" && find web/node_modules -flags +dataless -type f | wc -l
```

```bash
cd "/Users/thomas/Documents/Git Repos/brief-nach-berlin" && find web/node_modules -flags +dataless -type f -print0 | xargs -0 -n 1 -P 16 brctl download
```
