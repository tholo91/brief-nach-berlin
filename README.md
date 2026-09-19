# Brief-nach-Berlin

> Deine Meinung. Handschriftlich. An die Richtigen.

[![Live ausprobieren](https://img.shields.io/badge/live-brief--nach--berlin.de-1f6feb?labelColor=24292f)](https://brief-nach-berlin.de)
[![MIT License](https://img.shields.io/badge/license-MIT-1f6feb?labelColor=24292f)](LICENSE)

Brief-nach-Berlin hilft Menschen, aus einem politischen Anliegen einen persönlichen Brief an die zuständige politische Vertretung zu machen. Anliegen beschreiben, Zuständigkeit prüfen, Entwurf anpassen, abschreiben und selbst abschicken.

[Live-App öffnen](https://brief-nach-berlin.de) · [Anpassung für andere Länder](ADAPT_TO_YOUR_COUNTRY.md) · [Issues und Ideen](https://github.com/tholo91/brief-nach-berlin/issues)

![Illustration einer handschriftlichen Postkarte auf dem Weg zu einem Briefkasten vor der Berliner Stadtsilhouette](web/src/app/opengraph-image.jpg)

## Für Nutzer:innen

1. Anliegen als Text oder Sprachnachricht beschreiben
2. PLZ eingeben
3. Zuständige politische Ebene und Vertretung prüfen
4. Einen persönlichen Briefentwurf erhalten
5. Anpassen, von Hand abschreiben und per Post abschicken

Die KI nimmt niemandem die eigene Meinung ab. Sie erleichtert Recherche und Formulierung. Ob der Brief passt und ob er abgeschickt wird, entscheidet die Person selbst. Brief-nach-Berlin ist keine Petition, kein automatisierter Massenversand und kein politischer Autopilot.

Warum handschriftlich? Weil der Brief dadurch nicht bei der Formulierung endet: Du liest ihn, passt ihn an, schreibst ihn selbst ab und schickst ihn ab. Diese menschliche Handlung ist der Punkt.

## Datenschutz und Datenfluss

- Kein Nutzerkonto und keine persönliche Brief-Historie
- Persönliche Anliegen und Briefentwürfe werden nicht als allgemeine Nutzerhistorie gespeichert
- Supabase wird für klar abgegrenzte Funktionen wie aggregierte Statistik, freiwilliges Feedback, Themensignale und öffentliche Kampagnen genutzt
- KI unterstützt Entwurf, Moderation und Transkription; der persönliche Text wird nicht als öffentlicher Prompt- oder Log-Dump geführt

Details stehen in der [Datenschutzerklärung](https://brief-nach-berlin.de/datenschutz), im [DSGVO-Audit](DSGVO-AUDIT.md) und im [Technik- und Datenschutz-Spicker](TECHNIK-SPICKER.md).

## Für Entwickler:innen

### Voraussetzungen

- Node.js und npm
- API-Schlüssel für die Funktionen, die lokal getestet werden sollen

### Lokal starten

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Danach ist die lokale App unter [http://localhost:3000](http://localhost:3000) erreichbar. Für einen vollständigen Brief-Flow müssen die benötigten Werte in `web/.env.local` gesetzt werden. Die Vorlage dokumentiert auch die relevanten Datenschutz- und Feature-Flag-Hinweise.

Weitere technische Hinweise stehen in [`web/README.md`](web/README.md). Für Prüfungen sind unter anderem `npm run lint`, `npm test` und `npm run build` verfügbar.

## Technik und Datenquellen

- **Next.js, React und TypeScript** für Oberfläche und Serverlogik
- **Vercel** für Hosting und serverseitige Funktionen
- **Mistral AI / Voxtral** für Briefentwurf, Moderation und Sprachtranskription
- **Supabase** für abgegrenzte Statistik-, Feedback- und Kampagnenfunktionen
- **Brevo** für den optionalen E-Mail-Versand des eigenen Briefs
- **Bundeswahlleiterin** für das PLZ-Wahlkreis-Mapping
- **Abgeordnetenwatch API** für Politiker-Daten

Die fachlich kritische Zuständigkeits-, Wahlkreis- und Datenlogik wird lokal gepflegt und muss bei einer Länderanpassung durch verlässliche Quellen und Regeln des jeweiligen Landes ersetzt werden.

## Open Source und Anpassung

Der Quellcode steht unter der [MIT-Lizenz](LICENSE). Du darfst ihn für eigene Projekte verwenden, anpassen und weiterveröffentlichen, solange Copyright- und Lizenzhinweis erhalten bleiben.

Die deutsche Zuständigkeitslogik, die Marke Brief-nach-Berlin, Logos, Bilder, redaktionelle Inhalte und externe Datenquellen können eigenen Rechten oder Lizenzen unterliegen. Eine Länderanpassung ist daher mehr als eine Übersetzung: Zuständigkeiten, Datenquellen, Sprache, politische Ebenen und Datenschutz müssen vor Ort neu geprüft werden.

Der beste Einstieg dafür ist der [Guide zur Anpassung an ein anderes Land](ADAPT_TO_YOUR_COUNTRY.md). Ideen, Fragen und konkrete Verbesserungen kannst du als [GitHub Issue](https://github.com/tholo91/brief-nach-berlin/issues) eröffnen.

## For builders outside Germany

Brief-nach-Berlin is an open-source civic-tech project for turning a personal political concern into a well-addressed letter. People review, personalize and send their own letters.

To adapt it to another country, start with the [adaptation guide](ADAPT_TO_YOUR_COUNTRY.md). Replace the German representative, constituency and data layers with reliable local sources, then validate the political routing, language, privacy model and mailing flow locally.

If you build an adaptation, please open an [issue](https://github.com/tholo91/brief-nach-berlin/issues) so others can find it.

## Projekt und Finanzierung

Brief-nach-Berlin ist eine kostenlose, gemeinnützige Initiative in Trägerschaft der [WE AID gGmbH](https://www.brief-nach-berlin.de/spenden). Spenden helfen bei Betrieb und Weiterentwicklung; Teilen, Anpassen und Beitragen sind ebenso wertvoll.

Das Projekt wurde aus einem Bundestags-Praktikum und einem Studium der Politikwissenschaft heraus entwickelt. Die Ausgangsfrage war: Wie kann ich meiner Mutter die Ausrede nehmen, einen Brief nicht zu schreiben, obwohl sie sich über Politik ärgert?

Ein Solo-Projekt von [Thomas Lorenz](https://thomas-lorenz.eu).
