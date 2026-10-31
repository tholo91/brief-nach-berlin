# /unterricht: neuer Einstieg für Lehrkräfte und Klassenlink mit PDF statt E-Mail

## Context

Lehrkräfte sollen auf iPhone, iPad und Desktop sofort sehen, worum es geht, und ohne Umweg einen Klassenlink erstellen. Heute konkurrieren Hero-Text, Bild und Karte, die Buttons haben keine Icons, und die Karte liegt unter dem Hero. Die größte Hürde im Unterricht ist die E-Mail-Pflicht pro Kind; außerdem zeigt der Ergebnis-Screen keine Anschrift. Hängt die Mail, fehlt die Adresse.

Ergebnis: Tafel-Hero, zwei Spalten mit Erklärung und Klassenlink-Karte, Navbar-CTA, Icons auf allen Buttons. Dazu ein von der Lehrkraft gewählter PDF-Modus ohne E-Mail.

## Entscheidungen (von Thomas)

- Headline steht auf der Tafel im Bild: „Deine Klasse schreibt an den Bundestag.“
- Vorhandenes Bild wird retuschiert und hochskaliert, Datei später austauschbar.
- Umfang Seite: oberer Teil plus Icons plus Druckmaterial als sichtbarer Button. Der Rest der Seite bleibt.
- Lehrkraft wählt pro Klassenlink, PDF ist vorausgewählt. `/schule` ohne Klassenlink bleibt bei E-Mail.
- PDF enthält Brief, Anschrift, Checkliste und KI-Hinweis, ohne zweiten KI-Aufruf.

## Teil A: Landingpage

Umsetzung als eigener `/gsd-quick`, UI-Arbeit über `frontend-design`. Keine neue Abhängigkeit.

1. **Navbar** (`web/src/components/AppHeader.tsx`): CTA „Für meine Klasse starten“, auf dem Handy „Klasse starten“, mit Icon, auf `/unterricht` immer sichtbar. `heroId`, `useElementOutOfView` und `header-cta-in` (`globals.css`) entfallen, weil nur diese Seite sie nutzt.
2. **Bild**: Einmal-Skript mit `sharp` aus dem Scratchpad, kein Skript im Repo. Tafel per weichgezeichneter, abgedunkelter Maske säubern (Wischspuren und Umschlag weg), Bild außerhalb der Tafel leicht aufhellen, auf 2000 px skalieren. Neue Datei `web/public/images/img-schule-klasse-hero.webp`, Original bleibt.
3. **Hero** (`web/src/app/(site)/unterricht/page.tsx`): volle Breite, Bild und Headline skalieren gemeinsam über Container-Einheiten (`cqw`), damit der Text auf der Tafel bleibt. Höhe etwa `min(40cqw, 56vh)`, Beschnitt nur unten. Auf dem Handy zoomt der Ausschnitt auf Tafel, Lehrerin und erste Reihe. Echte `<h1>` in Creme mit `font-typewriter`, kein `font-handwriting`. Kein Button im Hero.
4. **Zwei Spalten** ab `md`, in `max-w-5xl`, links flexibel, rechts etwa 25rem. Links: Erklärtext, drei Fakten, Button „Ablauf ansehen“, Button zum Druckmaterial, „Thomas schreiben“. Rechts die Karte mit `id="klassenlink"`. Auf dem Handy untereinander, Erklärung zuerst.
5. **Karte** (`web/src/components/schule/ClassLinkGenerator.tsx`): Felder untereinander, darunter „Link erstellen“ in voller Breite. Nach dem Erstellen steht „QR-Code groß zeigen“ zuerst. Kurzer Rahmen-Hinweis per CSS `:target`, damit der CTA auch sichtbar reagiert, wenn die Karte schon im Bild ist; bei reduzierter Bewegung aus.
6. **Icons**: neue Datei `web/src/components/schule/icons.tsx` mit Inline-SVGs, wie im Repo üblich, keine Icon-Bibliothek. Alle Buttons im Bereich bekommen Icon und gleiche Höhe und Rundung. Auch der Button in `CampaignQrDownload.tsx`; das gilt dann auch für Kampagnen.
7. **Tests**: `web/src/__tests__/unterrichtPage.test.ts` (Copy, Reihenfolge, `klassenlink-hero` raus), `web/src/__tests__/appHeader.test.ts`.

Meta-Titel und Beschreibung bleiben für die Suche unverändert.

## Teil B: PDF statt E-Mail

Eigener `/gsd-quick` nach Teil A, weil beide die Karte anfassen. Neue Abhängigkeit: nur `@react-pdf/renderer` 4.9.0, lädt erst beim Erstellen des PDFs. Erst prüfen, ob es auf Next 16.4.2 baut (DSS läuft auf 16.2.3) und der Download im iPad-Simulator klappt. Wenn nicht: stoppen und melden.

1. **Token** (`web/src/lib/schule/classToken.ts`): optionales `d: z.literal(1)` nur für PDF, `v: 1` bleibt, alte Links bleiben E-Mail. Ein längeres `d: "pdf"` sprengt das QR-Limit von 151 Bytes. `createClassLink.ts` nimmt die Wahl entgegen und testet das Limit weiter.
2. **Weitergabe**: `jungEntry.ts`, `jungHandoff.ts`, Allow-List in `peekHandoff`, `WizardShell.tsx`.
3. **Validierung**: neues `step1PlzSchema`, `step1Schema` bleibt unverändert. Eine Stelle `validateStep1()` in `web/src/lib/schule/youthContext.ts` für alle Server-Pfade: ohne E-Mail nur mit geprüftem PDF-Token im Jugendmodus. `audience` allein reicht nie. `Step1Form` blendet das Feld aus.
4. **Server**: E-Mail-Limits (`generate-letter/route.ts:191`, `submitWizard.ts:258`) und Mailblock (`route.ts:374-441`) im PDF-Modus überspringen. Klassen-Bucket, Zähler und Meilensteine bleiben. `resendLetter.ts` lehnt PDF-Modus ab, `Step3Success.tsx:741` meldet Fehler ohne leere Adresse. `letterId` bleibt, die Kollision gibt es nicht.
5. **Anschrift**: neue reine Funktion `web/src/lib/lookup/recipientEnvelope.ts` für alle Empfängerarten inklusive `bundeskanzler` und `mdb_later`, sichtbar auf dem Ergebnis-Screen. Kommune: vollständig nur bei `address.source === "destatis"`, sonst Suchhilfe `RathausAdresseButton.tsx` und auf dem PDF Such-Link plus Leerzeilen. Berlin läuft immer über diesen Weg.
6. **PDF**: `web/src/lib/schule/letterPdf.tsx` und `web/src/components/schule/LetterPdfButton.tsx`, Download-Muster aus DSS `PdfExport.tsx`. NotoSans mit OFL nach `web/public/fonts`. A4 mit Anschrift, Brief, `WORKSHEET_CHECKLIST` und sichtbarem KI-Hinweis wie `mailLocale.ts:80-85`, Metadaten-Konstante in `aiContentMarking.ts`. Hinweis für iPad und „Speicher das PDF, bevor du die Seite schließt.“
7. **Fehlerfall**: Im PDF-Modus nie „Brief kommt per Mail“. `connectionLost` und `generationMayHaveSucceeded` nicht setzen, Text bleibt, Retry nur per Klick, 429 mit eigener Meldung.
8. **Karte**: Auswahl „Als PDF, ohne E-Mail“ (vorausgewählt) oder „Per E-Mail“, kurze Erklärung, Icon.
9. **Texte und Recht**, beide Modi korrekt beschreiben: `lessonPlan.ts:53-54`, `/unterricht`, `/eltern`, `/schule`, `/projekttag-demokratie`, `/ki-transparenz`, Datenschutz Abschnitt 22, `uiCatalog.ts` `introYouth`, `WizardShell.tsx:47`, `YouthLetterDraft.tsx:8`. Copy gegen No-Em-Dash, Ich-Form und `signs-of-ai-writing`. Thomas liest den Datenschutz-Text vor dem Push.
10. **Tests**: `classToken`, `createClassLink` (PDF ≤ 151 Bytes), `jungEntry`, `wizardHandoff`, `successPageExperience`, `unterrichtPage`. `generateLetterYouthRoute` erweitern: kein Versand, Meilensteine laufen, gefälschte `audience` abgelehnt. Neu: `recipientEnvelope`. Nur `*.test.ts`, `@/lib/mistral` gemockt.

**Risiken**

- Kostendeckel bleibt rechnerisch bei rund 400 Briefen pro Stunde je IP (10 Links mal 40 Briefe). Das geht heute schon mit Fake-Adressen, darum kein neuer Schutz. Ein Kind kann das Klassenkontingent aufbrauchen; das nehme ich hin.
- Nach einem Reload ist der Text weg, weil nichts gespeichert wird.
- Größtes Risiko für Erwachsene: die Bedingungen in `Step3Success.tsx` und die Mail-Snapshots.

## Verifikation

- `cd web && npx jest`, Lint, Build.
- Preview bei 375, 768, 1024, 1440 und 1920 px: Headline bleibt auf der Tafel, Kontrast mindestens 4,5:1 gemessen, kein horizontales Scrollen, CTA reagiert, Tastaturfokus sichtbar.
- iPad- und iPhone-Simulator: Klassenlink erstellen, QR groß zeigen, `/schule?k=` ohne E-Mail-Feld, Anschrift sichtbar, PDF lädt, Umlaute stimmen. Das echte iPad-Verhalten bleibt offen, bis Thomas es auf einem Gerät testet.
- PDF-Ablauf mit abgefangener API-Antwort, kein echter Mistral-Aufruf.
- Regression: `/schule` ohne Link und alte Klassenlinks bleiben E-Mail, Erwachsenen-Wizard unverändert.
- Kein Commit und kein Push ohne Thomas' Freigabe; Push auf `main` ist Produktion, danach Live-Check.
