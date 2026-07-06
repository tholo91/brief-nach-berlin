# Brief nach Berlin in ein anderes Land bringen

Diese Anleitung ist für Menschen, die das Projekt forken und lokal an ihr Land
anpassen wollen. Ziel ist kein perfekter Europa-Rollout. Ziel ist eine kleine,
funktionierende lokale Version, die echte Menschen testen können.

## 1. Der kleinste sinnvolle Fork

Übernimm nicht sofort die ganze deutsche Website.

Für eine erste lokale Version reicht:

1. Startseite mit Eingabefeld
2. Wizard: Ort/Postleitzahl, E-Mail, Anliegen, Abgeordneten-Auswahl
3. Briefgenerierung mit Mistral oder einem anderen LLM-Anbieter
4. E-Mail mit Brief, Adresse und nächsten Schritten
5. Datenschutz, Impressum und eine kurze Erklärung, warum Briefe in deinem Land wirken

Alles andere ist optional: Presse, Bewertungen, Kampagnen, Roadmap, lange SEO-Seiten,
deutsche Hintergrundtexte, Follow-up-Mails.

## 2. Was du lokal wirklich prüfen musst

Die gefährlichste Stelle ist nicht die KI. Die gefährlichste Stelle ist eine
falsche Zuordnung von Person, Ort und politischer Zuständigkeit.

Muss geprüft werden:

- Welche politische Ebene soll die erste Version abdecken?
- Reicht eine Postleitzahl, oder brauchst du Wahlkreis, Gemeinde, Region oder Adresse?
- Welche verlässliche Datenquelle liefert Mandate, Parteien, Büroadressen und Wahlkreise?
- Welche Lizenz haben diese Daten?
- Gibt es direkt gewählte Abgeordnete, Listenmandate oder mehrere zuständige Personen?
- Welche Anrede ist politisch und kulturell normal?
- In welcher Sprache soll der Brief entstehen?
- Hat das Land mehrere Amtssprachen oder relevante Sprachregionen?
- Wohin soll ein Brief praktisch geschickt werden: Wahlkreisbüro, Parlamentsadresse, Partei-/Fraktionsbüro?
- Was muss Datenschutzrecht lokal erklären?

Wenn du nur einen Punkt gründlich machst: Stelle sicher, dass der Brief niemals
an die falsche Person geschickt wird.

## 3. KI-Anbieter und Sprache

Brief nach Berlin nutzt Mistral AI, weil Mistral europäisch ist, gut Deutsch kann
und für dieses Projekt datenschutzpraktisch gut passt. Für deinen Fork ist Mistral
eine Empfehlung, keine Pflicht.

Du kannst einen anderen LLM-Anbieter nutzen, wenn er für dein Land, deine Sprache,
deine Datenschutzlage und dein Budget besser passt. Dann musst du aber die
Adapter-Stelle sauber austauschen, statt nur den API-Key zu ändern.

Prüfe konkret:

- `web/src/lib/mistral.ts`: Anbieter, Modellnamen, Retry-Verhalten.
- `web/src/lib/generation/generateLetter.ts`: Output-Sprache, Briefkultur,
  Anreden, politische Ebenen, Parteien, Datumsformat.
- `web/src/app/api/transcribe/route.ts`: Sprache für Audio-Transkription
  (`language: "de"` ist aktuell deutsch).
- `web/src/app/layout.tsx`: HTML-Sprache und strukturierte Daten
  (`lang="de"`, `inLanguage: "de-DE"`).
- `web/src/lib/validation/wizardSchemas.ts`: Eingabeformat und Fehlermeldungen.

Mehrsprachige Länder brauchen eine bewusste Entscheidung. Für viele Länder reicht
eine Hauptlandessprache zum Start. Für Länder wie die Schweiz, Belgien, Kanada
oder andere mehrsprachige Systeme solltest du festlegen:

- Welche Sprache ist die Standard-Sprache?
- Erkennt die App die Sprachregion automatisch, z. B. über Postleitzahl, Kanton,
  Gemeinde oder Nutzerauswahl?
- Darf die Nutzerin die Briefsprache selbst wählen?
- Müssen Anrede, Institutionen und Rechtsbegriffe je Sprache anders formuliert werden?
- Gibt es Vertreterinnen oder Behörden, die in mehreren Sprachen angeschrieben werden können?

Für den MVP ist die pragmatische Regel: eine Sprache sauber bauen, bevor du vier
halb übersetzte Sprachen anbietest.

## 4. Dateien, die du wahrscheinlich anfassen musst

### Muss

| Bereich | Dateien | Warum |
| --- | --- | --- |
| App-Name, Domain, Sharing, Kontakt | `web/src/lib/config.ts`, `web/src/lib/contact.ts` | Name, URL, Gründerkontakt, Share-Texte, Feedback-Links |
| KI-Anbieter | `web/src/lib/mistral.ts`, `web/.env.example` | Mistral ist empfohlen, aber austauschbar; hier sitzt der Anbieter-Adapter |
| Briefprompt | `web/src/lib/generation/generateLetter.ts` | Output-Sprache, Kultur, Anreden, politische Ebenen, Parteien, Ausgabeformat |
| Ort-zu-Vertretung-Lookup | `web/src/lib/lookup/plzLookup.ts` | Verbindet Nutzereingabe mit den passenden Abgeordneten |
| Datenstruktur | `web/src/lib/types/politician.ts`, `web/src/lib/types/wizard.ts` | Felder für Vertreter, Wahlkreis, Adresse, Level |
| Validierung | `web/src/lib/validation/wizardSchemas.ts` | Deutsche 5-stellige PLZ ist hart codiert |
| Datendateien | `web/data/plz-wahlkreis-mapping.json`, `web/data/politicians-cache.json` | Lokales Mapping und Vertreter-Cache |
| Datenskripte | `web/scripts/fetch-politician-data.ts`, optional `web/scripts/parse-plz-mapping.ts` | Erzeugt die lokalen JSON-Dateien |
| Startseite/Wizard-Copy | `web/src/components/Hero.tsx`, `web/src/components/wizard/Step1Form.tsx`, `web/src/components/wizard/Step3Success.tsx` | Nutzer sehen dort die deutschen Annahmen zuerst |
| E-Mail | `web/src/lib/email/sendLetterEmail.ts`, `web/src/lib/email/buildEmailHtml.ts` | Absender, Adresse, Porto-/Abschickhinweise, Sprache |
| Rechtliches | `web/src/app/(site)/datenschutz/page.tsx`, `web/src/app/(site)/impressum/page.tsx` | Muss lokal neu geschrieben werden |

### Sollte

| Bereich | Dateien | Warum |
| --- | --- | --- |
| Layout/Metadaten | `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/sitemap.ts` | Name, SEO, Sprache, strukturierte Daten |
| Footer/Header | `web/src/components/Header.tsx`, `web/src/components/Footer.tsx`, `web/src/components/AppHeader.tsx`, `web/src/components/AppFooter.tsx` | Navigation und Projektlinks |
| Politischer Kontext | `web/src/lib/enrichment/fetchMdbContext.ts` | Nutzt aktuell Abgeordnetenwatch und deutsche Stopwords |
| Spracheingabe | `web/src/app/api/transcribe/route.ts` | Transkription ist aktuell auf `language: "de"` gesetzt |
| Lokalitätsanzeige | `web/src/components/wizard/Step1Form.tsx` | Nutzt `openplzapi.org/de` für deutsche Orte |
| Moderation | `web/src/lib/moderation/moderateText.ts` | Kann bleiben, sollte aber lokal getestet werden |
| Tests | `web/src/__tests__/*`, `web/scripts/test-*.ts` | Deutsche Fixtures ersetzen |

### Optional

Diese Teile kannst du für einen schnellen Fork ausblenden, später anpassen oder löschen:

- Kampagnen: `web/src/components/campaigns/*`, `web/src/app/(site)/kampagne*`,
  `web/src/lib/campaigns/*`
- Bewertungen und Stimmen: `web/src/components/reviews/*`, `web/src/app/(site)/stimmen`,
  `web/src/app/(site)/feedback`
- Roadmap und Follow-ups: `web/src/app/(site)/was-noch-kommt`,
  `web/src/lib/email/buildFollowupHtml.ts`, `web/src/lib/email/sendFollowupEmail.ts`
- Presse-/Story-Seiten: `web/src/app/(site)/presse`,
  `web/src/app/(site)/lage-der-nation`, `web/src/app/(site)/was-bisher-geschah`
- Deutsche SEO-Seiten: `guide`, `tipps`, `warum-ein-brief`,
  `wahlkreisbuero-oder-berlin`, `kommune-land-bund-eu` usw.

## 5. Environment-Variablen

Minimum für lokale Entwicklung mit Mistral:

```env
MISTRAL_API_KEY=
THOMAS_MAIL=
RATE_LIMIT_SALT=
```

Wenn du nicht Mistral nutzt, ersetze `MISTRAL_API_KEY` durch den Key deines
Anbieters und passe `web/src/lib/mistral.ts` plus alle Importe entsprechend an.

Für echten Mailversand:

```env
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
FEEDBACK_TOKEN_SECRET=
```

Für Bewertungen, Kampagnen, Roadmap und persistente Zähler:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REVIEW_IP_SALT=
CAMPAIGN_SESSION_SECRET=
BREVO_FOLLOWUP_ENABLED=
```

Für einen schnellen MVP kannst du Supabase, Kampagnen, Reviews und Follow-ups
erstmal ignorieren. Mistral plus ein Mailanbieter reichen.

## 6. Mistral, Brevo und Domain einrichten

### Mistral AI

Mistral ist für diesen Fork die naheliegende Empfehlung: europäischer Anbieter,
gute Mehrsprachigkeit, einfache API, überschaubare Kosten. Du kannst trotzdem
einen anderen Anbieter nutzen.

So setzt du Mistral auf:

1. Account bei Mistral AI Studio erstellen.
2. API-Zugang aktivieren und einen API-Key erzeugen.
3. Lokal `MISTRAL_API_KEY=` in `web/.env.local` setzen.
4. Beim Hosting denselben Key als Environment Variable setzen.
5. In `web/src/lib/mistral.ts` prüfen, welches Modell genutzt wird.
6. In `web/src/lib/generation/generateLetter.ts` Sprache, Ton und Prompt prüfen.
7. In Mistral ein kleines Budget oder Usage-Limit setzen, bevor echte Nutzer kommen.

Kostenannahme: Rechne für einen normalen Brief grob mit 1 bis 2 Cent pro
Briefgenerierung. Das ist nur eine MVP-Schätzung. Die echten Kosten hängen von
Modell, Promptlänge, Antwortlänge und aktueller Mistral-Preisliste ab. Vor einem
öffentlichen Launch immer die aktuellen Preise prüfen und ein Limit setzen.

Wenn Spracheingabe aktiv bleibt, rechne Transkription getrennt. Audio kann je
nach Anbieter und Länge teurer werden als die reine Briefgenerierung.

### Brevo

Für E-Mail ist Brevo eine gute Europa-first-Wahl. Der Free-Plan reicht für einen
kleinen MVP meistens aus, weil Brevo nach Freischaltung aktuell bis zu 300
E-Mails pro Tag erlaubt. Prüfe das vor Launch trotzdem nochmal, weil Pläne und
Limits sich ändern können.

So setzt du Brevo auf:

1. Brevo-Account erstellen.
2. Absenderadresse oder Absenderdomain verifizieren.
3. API-Key für Transactional Email erzeugen.
4. `BREVO_API_KEY=` und `BREVO_SENDER_EMAIL=` setzen.
5. DNS-Einträge für SPF, DKIM und DMARC beim Domain-Anbieter eintragen.
6. Einen echten Testbrief an dich selbst schicken.
7. Prüfen, ob der Brief im Posteingang landet und nicht im Spam.

Für den MVP reicht ein einfacher transaktionaler Versand: Nutzer bekommt den
Brief, die Adresse und die nächsten Schritte. Newsletter, Automationen und CRM
sind optional.

### Domain und Hosting

Für den schnellsten Fork ist Vercel naheliegend, weil die App eine Next.js-App
ist. Andere Hoster gehen auch.

So bringst du eine eigene Domain dran:

1. Repository bei Vercel importieren.
2. Build-Einstellungen für den `web`-Ordner prüfen.
3. Alle Environment Variables im Vercel-Projekt setzen.
4. In Vercel unter Domains die eigene Domain hinzufügen.
5. Die von Vercel genannten DNS-Einträge beim Domain-Anbieter setzen.
6. Üblich ist: Apex-Domain per `A`-Record, `www` per `CNAME`. Nimm aber immer
   die Werte, die Vercel für dein Projekt anzeigt.
7. Warten, bis DNS und SSL aktiv sind.
8. `APP_URL` in `web/src/lib/config.ts` auf die neue Domain ändern.
9. Kontakt- und Absenderdaten in `web/src/lib/contact.ts` und Brevo anpassen.

Wenn du eine Mailadresse auf der eigenen Domain willst, brauchst du zusätzlich
einen Mailanbieter mit MX-Einträgen. Das ist getrennt vom Website-DNS.

### Links zu den aktuellen Anbieter-Dokumenten

- Mistral API und Keys: https://docs.mistral.ai/
- Mistral Modelle und Modellnamen: https://docs.mistral.ai/models/overview
- Brevo Preise und Free-Plan: https://www.brevo.com/pricing/
- Vercel Domains und DNS: https://vercel.com/docs/domains

## 7. Empfohlene Reihenfolge

1. Projekt forken und lokal starten.
2. Neue Marke, Domain und Kontakt in `web/src/lib/config.ts` eintragen.
3. Eine politische Ebene wählen, nicht alle gleichzeitig.
4. Standardsprache und mögliche Amtssprachen festlegen.
5. KI-Anbieter wählen: Mistral empfohlen, aber nicht zwingend.
6. Verlässliche Datenquelle finden und Lizenz prüfen.
7. `politicians-cache.json` manuell mit 5 bis 20 Testpersonen füllen.
8. `plz-wahlkreis-mapping.json` für eine kleine Pilotregion bauen.
9. `lookupPLZ.ts` so umbauen, dass er für dein Land korrekt auflöst.
10. `wizardSchemas.ts` und `Step1Form.tsx` an dein Eingabeformat anpassen.
11. `generateLetter.ts` kulturell neu schreiben: Sprache, Anrede, Parteien, Briefstil.
12. E-Mail-Template lokal anpassen: Adresse, Porto, nächste Schritte.
13. 10 bis 20 echte Menschen testen lassen.
14. Erst danach Design, SEO-Seiten und Zusatzfunktionen ausbauen.

## 8. Copy-Paste-Prompt für Codex, Claude oder GSD

Wenn du GSD nutzt, ist das ein guter erster Auftrag für eine Phase. Wenn du kein
GSD nutzt, funktioniert derselbe Prompt auch als normaler Codex-/Claude-Auftrag.

```text
Du arbeitest in einem Fork von https://github.com/tholo91/brief-nach-berlin.

Ziel: Baue eine lokale MVP-Version für [LAND/REGION].
Nicht Ziel: Alle deutschen Unterseiten übersetzen oder das Produkt perfektionieren.

Kontext:
- Erste politische Ebene: [z.B. nationales Parlament / Region / Kommune]
- Nutzereingabe zur Zuordnung: [Postleitzahl / Wahlkreis / Gemeinde / Adresse]
- Datenquelle für Vertreter: [URL oder Datei]
- Datenquelle für Gebietsmapping: [URL oder Datei]
- KI-Anbieter: [Mistral empfohlen / anderer Anbieter]
- Standardsprache für Output: [z.B. Deutsch / Französisch / Niederländisch]
- Weitere Amtssprachen oder Sprachregionen: [keine / Liste]
- Sprache und Anrede: [kurze Beschreibung]
- Mailanbieter: [Brevo / anderer / erstmal nur lokaler Preview]
- Domain und Hosting: [Vercel + eigene Domain / anderes Setup]

Arbeitsweise:
1. Lies zuerst README.md, ADAPT_TO_YOUR_COUNTRY.md und die relevanten Dateien unter web/src/lib.
2. Erstelle eine konkrete To-do-Liste in LOCAL_ADAPTATION_TODO.md.
3. Sortiere Aufgaben in MUST, SHOULD und OPTIONAL.
4. Fange mit dem kleinsten funktionierenden Flow an:
   - Eingabe validieren
   - richtige Vertreter finden
   - Brief mit Mistral generieren
   - Brief und Adresse anzeigen oder mailen
5. Ignoriere zunächst Kampagnen, Bewertungen, Presse-Seiten, Roadmap und deutsche SEO-Unterseiten.
6. Ändere keine Dateien, die für den MVP nicht nötig sind.
7. Nach jeder größeren Änderung: npm run lint und npm run build ausführen.

Besonders prüfen:
- Es darf nie eine falsche Vertreteradresse angezeigt werden.
- Wenn die Zuordnung unsicher ist, muss die UI das zeigen und eine Auswahl anbieten.
- Der Briefprompt muss zur politischen Kultur des Landes passen.
- Die Output-Sprache muss explizit gesetzt sein.
- Falls das Land mehrere Amtssprachen hat, muss entschieden werden, ob der MVP
  nur eine Standardsprache nutzt oder eine Sprachauswahl braucht.
- Mistral ist empfohlen, aber nicht zwingend. Wenn ein anderer Anbieter genutzt
  wird, muss der Adapter sauber ersetzt werden.
- Für Mistral und Brevo müssen Setup-Schritte, Kostenannahmen und Limits geprüft
  sein, bevor echte Nutzerinnen und Nutzer kommen.
- Die eigene Domain muss in App-Konfiguration, Hosting und Mailversand
  konsistent gesetzt sein.
- Datenschutz- und Impressumstexte dürfen nicht aus Deutschland kopiert bleiben.
- Die Seite soll lokal glaubwürdig wirken, nicht wie eine übersetzte deutsche Kampagne.

Liefer am Ende:
- Liste der geänderten Dateien
- Was funktioniert
- Was bewusst noch nicht übernommen wurde
- Welche 10 Testfälle ein Mensch vor Ort prüfen muss
```

## 9. Testfälle, bevor du live gehst

Lege mindestens diese manuellen Testfälle an:

- 3 normale Orte, die eindeutig zu einer Vertretung führen
- 2 Grenzfälle, in denen mehrere Vertreter möglich sind
- 2 ungültige Eingaben
- 1 Person ohne eindeutige Adresse
- 1 Thema, das eigentlich auf eine andere politische Ebene gehört
- 1 sehr kurzer Anliegen-Text
- 1 emotionaler oder wütender Anliegen-Text
- 1 Test in jeder unterstützten Output-Sprache
- 1 Audio-Eingabe, falls Spracheingabe aktiv bleibt

Jeder Testfall sollte beantworten:

- Wird die richtige Person angezeigt?
- Wird die Unsicherheit ehrlich gezeigt?
- Klingt der Brief lokal natürlich?
- Ist die Sprache korrekt gewählt?
- Ist die Adresse praktisch nutzbar?
- Versteht eine reale Person, was sie nach dem Brief tun muss?

## 10. Design-Hinweise

Du musst das deutsche Brief-/Airmail-Design nicht behalten.

Behalte nur das Prinzip:

- erste Ansicht ist das Tool, keine Marketingseite
- wenig Ablenkung
- klare politische Zuständigkeit
- sichtbarer Datenschutz
- ein konkreter nächster Schritt nach der Briefgenerierung

Passe an:

- Farben und Bildwelt
- Name und Logo
- Beispiele
- Vertrauenssignale
- Schreibstil
- Bilder von Parlament, Post, Stadt oder lokalen Institutionen

Wenn die lokale Kultur digitale Briefe, E-Mail oder Petitionen ernster nimmt als
handgeschriebene Post, ändere das Produkt entsprechend. Nicht das deutsche
Ritual kopieren, sondern die lokale Wirkung suchen.

## 10. Wann du Thomas schreiben solltest

Schreib kurz an Thomas, wenn du:

- eine echte lokale Version bauen willst
- gute Datenquellen gefunden hast
- unsicher bist, wie das Mapping strukturiert werden sollte
- wissen willst, warum bestimmte technische Entscheidungen so getroffen wurden
- erste Testergebnisse hast

Am hilfreichsten ist eine kurze Mail mit:

- Land oder Region
- politische Ebene
- Datenquelle für Vertreter
- Datenquelle für Gebietsmapping
- ob du selbst entwickelst oder lokale Tests organisierst
