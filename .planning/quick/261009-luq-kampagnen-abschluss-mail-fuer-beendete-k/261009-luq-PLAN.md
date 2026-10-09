---
quick_id: 261009-luq
title: Kampagnen-Abschluss-Mail (kind "ended")
mode: quick
---

# Kampagnen-Abschluss-Mail für beendete Kampagnen

Erster Einsatz: NRV-Kampagne `unterschrift-ist-kein-dienstvergehen` (90 Briefe, Ersteller:in Stephanie Beyrich). Thomas will eine Danke-Mail, die optisch sehr nah an der Meilenstein-Mail ist: großes Zahlenbild oben und eine Box zum Teilen, damit die NGO das Ergebnis medial nutzen kann. Neu sind eine Statistik-Infobox, eine Bitte um Feedback und Weiterempfehlung (Antworten gehen an Thomas) und ein kleiner Spendenhinweis.

## Harte Grenzen
- **Kein** Mailversand, **kein** Beenden der Kampagne, **keine** DB-Schreibzugriffe, **kein** git commit/push. Thomas gibt jeden dieser Schritte einzeln frei.
- Die schmutzige Datei `web/public/images/thomas-avatar.jpg` nicht anfassen und nicht stagen.
- Im Mailtext keine Gedankenstriche (em dash „—“) und keine en dashes als Gedankenstrich. Den Text unten wörtlich übernehmen.

## Task 1: Template und Versand

Dateien: `web/src/lib/email/buildCampaignCreatorEmailHtml.ts`, `web/src/lib/email/sendCampaignCreatorEmail.ts`

1. In `CampaignCreatorEmailKind` die Art `"ended"` ergänzen.
   - Neuer Typ `CampaignEndedEmailParams { count: number; imageUrl: string; downloadUrl: string }`.
   - Neues optionales Feld `ended` in `BuildCampaignCreatorEmailHtmlParams`.
   - In `buildCampaignCreatorEmailHtml` verzweigen und einen Fehler werfen, wenn `ended` fehlt. Muster: der Zweig für `milestone`.
2. Gemeinsame Teile aus `buildMilestoneEmailHtml` als kleine Funktionen herausziehen und von beiden Mail-Arten nutzen:
   - `outlineButton`
   - die Button-Zeile, die aus einer Liste von Buttons die Tabellenzellen baut
   - die Box zum Teilen mit Label, Download-URL und Share-Ziel
   - das Hülle-HTML: doctype, head, Bild-Zeile, Footer-Zeile
   
   Die Meilenstein-Mail muss danach byte-gleich bleiben, `campaignMilestoneEmail.test.ts` bleibt grün.
3. Neue Funktion `buildCampaignEndedEmailHtml(params, ended)`.
   - **Kopfbild:** `ended.imageUrl`, alt-Text `${count} Briefe für „${title}“`.
   - **Box zum Teilen:** Label „Endstand teilen“. Share-Ziel über `buildShareTarget({slug,title,letterCount: count}, "milestone")`.
   - **Kein** `buildFinancingNoticeHtml`-Block.
   - **Button-Zeile:** drei Buttons wie bei Meilenstein unter 500: `&#9998;&nbsp;Verwalten` (actionUrl), `&#9829;&nbsp;Unterstützen` (`DONATION_PROVIDER_URL`), `Thomas schreiben` (mailto `BRIEF_EMAIL`).
   - **Text**, wörtlich (`${count}` über `formatLetterCount`, Name und Titel escaped):
     - Begrüßung: `Moin ${name},` beziehungsweise `Moin,`
     - Absatz 1: `deine Kampagne ist beendet. ${count} Briefe sind darüber entstanden: So viele Menschen haben deine Argumente aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben. Danke, dass du das angestoßen hast.`
     - Absatz 2: `Wenn du magst, teil den Endstand auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.`
     - Danach die Box zum Teilen.
   - **Statistik-Box**, gleicher Stil wie die Share-Box (`#FAF8F5`, Rahmen `#E0DCD7`, Mono-Label in grün):
     - Label: `Neu: Statistiken zu deiner Kampagne`
     - Text: `Auf deiner Verwaltungsseite siehst du jetzt, aus welchen Bundesländern geschrieben wurde, wie viele ihren Brief abgeschickt haben und wie die Schreibenden ihren Brief bewertet haben.`
     - Voller grüner Button wie „Bild speichern“: `Statistiken ansehen`, Ziel `${actionUrl}#creator-stats`.
   - **Feedback-Box**, gleicher Stil:
     - Label: `Wie war es für dich?`
     - Text 1: `Ich baue Brief nach Berlin allein und lerne am meisten von Leuten wie dir. Antworte einfach auf diese Mail: Was hat gut funktioniert, was hat dir gefehlt?`
     - Text 2: `Und falls es für dich passt: Darf ich dich gegenüber anderen NGOs zitieren? Wenn du Initiativen kennst, für die so eine Kampagne passt, freue ich mich über deine Empfehlung:` mit Link `${APP_URL}/ngo-briefkampagne`, Linktext `brief-nach-berlin.de/ngo-briefkampagne`.
   - **Danach:** `Viele Grüße<br>Thomas`, dann die Button-Zeile.
   - **Footer** wie bei Meilenstein, mit zwei Unterschieden:
     - Zeile 1: `Brief-nach-Berlin · Kampagnen-Abschluss`
     - Zeile 2 statt Abmeldelink: `Du bekommst diese Mail einmalig, weil deine Kampagne beendet ist.`
     - Links, Rest und Social-Icons bleiben wie bisher.
4. Änderungen in `sendCampaignCreatorEmail.ts`:
   - Neues Feld im Basistyp: `ended?: { count: number }`.
   - Bild-URL über `milestoneImageUrl(slug, count)`, Download mit `?download=1`.
   - Betreff: `Danke für ${formatLetterCount(count)} Briefe zu „${campaignTitle}“`.
   - `replyTo: { email: FOUNDER_EMAIL }` für `report` **und** `ended`.
   - Der Tag ergibt sich automatisch: `campaign-ended`.

## Task 2: Einmal-Skript `web/scripts/send-campaign-ended-mail.ts`

Muster: `scripts/fetch-reviews.ts` (Funktion `loadEnvLocal`) und `scripts/render-milestone-email-preview.ts`.

1. Kopfkommentar wie in den anderen Skripten, mit Beispielaufrufen.
2. Argumente:
   - `--slug <slug>` (Pflicht)
   - `--out <datei.html>` (Vorschau)
   - `--to <email>` (Empfänger überschreiben)
   - `--send`
3. Ablauf:
   - `loadEnvLocal()` aufrufen, dann einen Supabase-Service-Client erzeugen.
   - Die Kampagne lesen: `id, slug, title, creator_email, creator_name, letter_count, status, ends_at`.
   - Abbrechen, wenn die Kampagne fehlt.
4. Ohne `--send`:
   - Das HTML über `buildCampaignCreatorEmailHtml` bauen. `actionUrl` ist dabei `${APP_URL}/kampagne/verwalten?token=vorschau`, das Bild kommt von der Produktions-URL der Bild-Route.
   - Nach `--out` schreiben, Standard ist `send-campaign-ended-preview.html` im aktuellen Ordner.
   - Ausgeben: Empfänger, Betreff, `letter_count`.
   - Keine Schreibzugriffe.
5. Mit `--send`:
   - Einen neuen `manage`-Token erzeugen. `src/lib/campaigns/tokens.ts` ist `server-only` und lässt sich nicht importieren. Deshalb die Logik von `createCampaignToken` inline nachbauen, wie es `scripts/render-email-preview.ts` und `send-backlog-followup.ts` mit ihren Tokens machen: gleiche Tabelle, gleicher Hash, gleiches Ablaufdatum. Vorher `tokens.ts` lesen.
   - `sendCampaignCreatorEmail` erst nach `loadEnvLocal` per dynamischem `import()` laden, weil `BREVO_API_KEY` schon beim Import geprüft wird.
   - Aufruf: `kind: "ended"`, Empfänger ist `--to` oder `creator_email`. `adminCopy` ist nur ohne `--to` gesetzt.
   - Die `messageId` ausgeben.
6. **In dieser Aufgabe wird das Skript nur ohne `--send` ausgeführt.**

## Task 3: Tests und Todo

1. Den Fall `ended` in `web/src/__tests__/campaignCreatorEmail.test.ts` ergänzen, oder in einer neuen Datei `campaignEndedEmail.test.ts`, je nachdem, wo die Builder-Tests liegen. Geprüft wird:
   - Das HTML enthält die Briefzahl, die Bild-URL und `#creator-stats`.
   - Es enthält `DONATION_PROVIDER_URL` und `/ngo-briefkampagne`.
   - Es gibt keinen Abmeldelink `#meilenstein-mails` und kein „—“.
   - Ohne `ended` wird ein Fehler geworfen.
   - Wenn der Send-Pfad schon mit gemocktem Brevo getestet wird, zusätzlich: `replyTo` ist bei `ended` gesetzt, und der Betreff stimmt.
2. Das Todo `.planning/todos/pending/2026-10-08-kampagnen-s4-danke-mail-zum-kampagnenende.md` aktualisieren, unter einem kurzen Abschnitt „Stand 2026-10-09“:
   - Template `ended` und das Einmal-Skript gibt es (quick-261009-luq).
   - Offen ist nur noch der automatische Auslöser: direkt in `endCampaignAction`, kein Cron, weil es noch keinen Vercel-Cron gibt. Dazu die Spalte `ended_notified_at`.
   - Die Feedback-Bitte läuft per Antwort auf die Mail (`replyTo`).
   - Testimonials von NGOs pflegt Thomas später von Hand (`creatorTestimonials.ts` und ein Block auf `/ngo-briefkampagne`), sobald die erste Zitat-Freigabe da ist. Eine eigene Bewertungsseite ist bewusst nicht geplant.

## Verifikation
Alle Befehle laufen aus `web/`.

1. `npx jest src/__tests__/campaignMilestoneEmail.test.ts src/__tests__/campaignCreatorEmail.test.ts` (plus neue Testdatei) ist grün.
2. `npx eslint` auf die geänderten Dateien ist sauber, und `npx tsc --noEmit` hat keine neuen Fehler.
3. `npx tsx scripts/send-campaign-ended-mail.ts --slug unterschrift-ist-kein-dienstvergehen --out ../.planning/quick/261009-luq-kampagnen-abschluss-mail-fuer-beendete-k/preview/ended.html` schreibt die Vorschau.
4. Optional Screenshots in 640 und 375 Pixel Breite mit Playwright Chrome, wie in `render-milestone-email-preview.ts`.
