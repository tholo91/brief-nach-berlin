# Kampagne PRÜF: Ministerpräsident:innen und Bundesrat

## Context
PRÜF (c/o innn.it e.V., Kontakt Andreas Joppich) hat am 12.11.2026 Textbausteine und 2 Beispielbriefe geschickt (Pages-Datei, nur Bundestag/MdB gedacht). Thomas will daraus schnell eine Kampagne an die Ministerpräsident:innen der Länder bauen, nach dem Muster von „Prüft die AfD“ (innn.it, Ebene Land, Bundesrat-Bitte, Original + 2 Alternativen, seit 19.10. live, über 2.000 Briefe).

## Entschieden
- **Empfänger:** Regierungschef:in des Landes der schreibenden Person (aus PLZ), namentlich. Ebene `Land`. Alle 16 sind in `web/data/landesregierung-addresses.json` belegt, keiner gehört einer vom Verfassungsschutz eingestuften Partei an (Regel „nicht anschreiben“ greift nicht).
- **Bitte:** Bundesrat. Antragsberechtigt beim BVerfG sind Bundestag, Bundesrat und Bundesregierung (Art. 21 Abs. 4 GG). Die Länder entscheiden über das Stimmverhalten im Bundesrat, deshalb ist das der Hebel. „Fraktion und Bundestag“ aus den PRÜF-Texten entfällt.
- **Parteigewicht:** keins. Ein neutraler Text (Beispiel „Parteiunabhängig“) + 2 Alternativen über die vorhandene Zufallsrotation. Kein neuer Code.
- **Verhältnis zu innn.it „Prüft die AfD“:** eigene Kampagne parallel, Ersteller PRÜF, eigener Link, Logo. Alte Kampagne bleibt unberührt.

## Befunde, die den Text betreffen
- pruef-demos.de nennt keinen Adressaten (nur BVerfG), kein Bundesrat, keine Landespetitionen. Die Zahlen aus dem Pages-Dokument (145.000 Landespetitionen, 1,6 Mio. bundesweit) stehen dort nicht; die Seite zeigt „338.382 mal gePRÜFt“. Zahlen daher nur mit Andreas' Bestätigung, sonst weglassen.
- Beispielbrief sagt „bei den PRÜF-Demos in [Stadt]“. Die Pipeline erfindet sonst Bezüge (Erfahrung vom 19.10.). Demo-Satz nicht in den Anliegentext, nur falls die schreibende Person es selbst sagt.
- Der Bundesrat-Bezug ist neu für PRÜF und braucht ihr OK.
- Koalitionsländer enthalten sich im Bundesrat bei Uneinigkeit. Kein Textthema, aber ehrlich gegenüber Andreas: Wirkung hängt am Koalitionsfrieden.

## Umsetzung
Rahmen `/gsd-quick` (CLAUDE.md-Pflicht). Repo-Dateien nur `.planning/kampagnen-varianten/` (gitignored) und `docs/sql/`. Kein Code-Eingriff, Vorlage: `.planning/quick/261110-hat-hateaid-kampagne-kinder-im-netz-schuetzen/PLAN.md` und `.planning/kampagnen-varianten/prueft-die-afd-2026-10-19.md`.

1. **Voraussetzung prüfen:** unterstützt eine Land-Kampagne die namentliche Anrede der Regierungschef:in (Commit d930ae0 `Step3Success.tsx`, `landesregierungRecipient.ts`)? Falls nur Institution: Thomas fragen (Text bleibt gleich).
2. **Anliegentext** (Haupttext) aus Pages-Bausteinen: Anliegen-Zitat, Art. 21, eine Regel statt Einzelfall, Prüfung statt Vorverurteilung, keine Meinungsverbote, GFF/KAS, 57 % (innn.it-Umfrage), Nicht gegen Wähler:innen, Bitte Bundesrat. Prüfung gegen `signs-of-ai-writing.md`, keine Gedankenstriche, Ich-Form.
3. **Skill `kampagnen-varianten`:** 2 Alternativen (andere Gewichtung/Einstieg, gleiche Forderung), Vergleichstest mit echter Pipeline, max. 9 Aufrufe, 30 s Pause, vorher Briefe/Minute prüfen (Mistral-Limit 15/min, teilt sich mit Live-Seite).
4. **Kampagne anlegen** über `brief-nach-berlin.de/kampagne/starten`: Titel z. B. „Prüf die Prüfung“ o. ä. (Thomas wählt), Slug, Ersteller PRÜF, Link pruef-demos.de, Logo von pruef-demos.de (WebP < 512 KB, EXIF weg), Beschreibung ≤ 400 Zeichen. Danach Freigabe/Pausierung über Skill `kampagne-freigeben`, Beispielbrief lesen.
5. **SQL** `docs/sql/2026-11-12-pruef-ministerpraesidenten-alternativen.sql` nach Muster `2026-10-19-prueft-die-afd-alternativen.sql`; Thomas führt sie aus.
6. **Nachricht an Andreas** (Skill `write-like-me`, unversendet): Testlink, Texte zur Freigabe, Frage Bundesrat-Ansatz, Zahlenquellen (145.000 / 1,6 Mio.), Logo, Hinweis auf „Prüft die AfD“ (gleiche Organisation, parallele Kampagne okay?).

## Verifikation
- Direktlink lädt, Logo sichtbar, Texte rotieren (6 Aufrufe mit leerem sessionStorage).
- DB: 1 + Alternativen = 3 Texte, md5 der Alternativen identisch mit JSON, Status wie gewollt.
- Ein Probebrief pro Text: genau eine Bitte (Bundesrat), richtige Anrede für Ministerpräsident:in, keine erfundenen Demo-Bezüge, Fakten korrekt.
- Tests: Mistral immer mocken, keine echten Aufrufe während laufender Kampagnen-Spitzen.
