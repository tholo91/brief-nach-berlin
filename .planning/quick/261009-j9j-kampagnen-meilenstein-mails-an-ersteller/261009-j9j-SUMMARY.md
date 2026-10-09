---
phase: quick-261009-j9j
plan: 01
subsystem: kampagnen
tags: [meilenstein-mails, email, next-og, brevo, supabase-migration]
status: complete
requirements: [KAMPAGNEN-MEILENSTEIN]
commits: 3
plan_head_before: c66d50ff50a6ccab79e89132532e3884faaacd49
plan_head_after: 76d9fcf7fde8e74f338cd4d69c597ab4eef96538
actuals:
  tokens: 20000
  tasks: 3
  commits: 3
key-files:
  created:
    - web/supabase/migrations/027_campaign_milestones.sql
    - web/src/lib/campaigns/milestones.ts
    - web/src/lib/campaigns/milestoneNotification.ts
    - web/src/app/(site)/kampagne/[slug]/meilenstein/[stufe]/bild/route.tsx
    - web/assets/fonts/ (Gelasio-Regular.ttf, Gelasio-Bold.ttf, CourierPrime-Bold.ttf, OFL-Gelasio.txt, OFL-CourierPrime.txt)
    - web/public/images/icon-download.png
    - web/src/lib/actions/setMilestoneMails.ts
    - web/src/components/campaigns/MilestoneMailsSwitch.tsx
    - web/scripts/render-milestone-email-preview.ts
  modified:
    - web/src/lib/email/buildCampaignCreatorEmailHtml.ts
    - web/src/lib/email/sendCampaignCreatorEmail.ts
    - web/src/app/api/generate-letter/route.ts
    - web/src/lib/campaigns/schema.ts
    - web/src/lib/campaigns/repository.ts
    - web/src/lib/support-content.ts
    - web/src/lib/share.ts
    - web/src/lib/actions/createCampaignDraft.ts
    - web/src/components/campaigns/CreatorCampaignForm.tsx
    - web/src/components/campaigns/CampaignManager.tsx
---

# Quick 261009-j9j: Kampagnen Meilenstein-Mails an Ersteller

Ein Brief, der `letter_count` auf eine Stufe (50, 100, 500, 1.000, 2.000, 5.000) hebt, loest genau eine Mail an den Ersteller aus (BCC an Thomas), mit serverseitig erzeugtem Kopfbild, Teilen-Box, Spendenbox ab 500 und Ein/Aus-Schalter beim Erstellen und in der Verwaltung. Nichts gepusht, Migration nicht angewendet, nichts versendet.

**Vor dem Push: Migration 027 (`web/supabase/migrations/027_campaign_milestones.sql`) in Supabase Studio anwenden.** Davor laeuft die App normal weiter (Lesen faellt auf Standardstufen und "an" zurueck, Anlegen mit Standard erwaehnt die Spalte nicht, der Claim loggt nur einen Fehler), aber es gehen keine Meilenstein-Mails raus.

## Commits (lokal, nicht gepusht)

| Task | Commit | Inhalt |
| ---- | ------ | ------ |
| 1 (Tracer) | 290b27e | Migration (nur Datei), `milestones.ts`, Claim `milestoneNotification.ts`, Hook im `after()`-Block, Mail-Typ `milestone` (Builder + Sender), `milestoneHeading` |
| 2 | b96de3b | next/og Route `/kampagne/<slug>/meilenstein/<stufe>/bild`, Fonts + OFL, `icon-download.png`, Box "Fortschritt teilen", Share-Text `milestone`, LinkedIn-Badge-Fix (48 px) |
| 3 | 76d9fcf | `MilestoneMailsSwitch`, Schalter im Erstellformular, Karte `#meilenstein-mails` in der Verwaltung, `setMilestoneMailsAction`, Repository/Schema, Vorschau-Skript |

## Ergebnisse der Checks

- **Tests**: `npm --prefix web test`: 106 Suites, 879 Tests, alle gruen. Baseline vor meinen Aenderungen: 101 Suites, 795 Tests, gruen. Neu: `campaignMilestones`, `campaignMilestoneEmail`, `campaignMilestoneImage`, `campaignMilestoneMailsAction` plus Erweiterungen in 6 bestehenden Suites.
- **Lint**: 0 Fehler, 7 Warnungen, alle bereits vorher vorhanden (beispiele, guide, wahlkreisbuero-oder-berlin, PromptCopyBlock, Step1Form, fetchMdbContext, parse-plz-mapping). Keine in meinen Dateien (die `<img>`-Warnung der Bildroute ist per eslint-disable-Kommentar behandelt).
- **Build**: gruen, aber nur in einer sauberen Kopie des Working Trees ohne die iCloud-Duplikate. Im echten Verzeichnis scheitert `next build` am Type-Check von `web/src/components/campaigns/CampaignCreatorStats 2.tsx` (untracked iCloud-Duplikat, nicht von mir, `liveSinceLabel` fehlt am Typ). **Vorher vorhanden, unabhaengig von diesem Task.** Kopie lag im Scratchpad und ist geloescht.
- **tsc**: Fehler nur in den untracked " 2"/" 3"-Duplikaten und in `campaignTopicReset.test.ts` (TS7022, vorher vorhanden). Keine in meinen Dateien.
- **Route-Trace**: `.next/server/app/(site)/kampagne/[slug]/meilenstein/[stufe]/bild/route.js.nft.json` listet `assets/fonts/Gelasio-Regular.ttf`, `Gelasio-Bold.ttf`, `CourierPrime-Bold.ttf` und `public/images/email-meilenstein.jpg`. `next.config.ts` musste nicht angepasst werden.
- **Dev-Server**: Bild-Route auf 200 `image/png`, `file` = 1200 x 805; nonsense-Slug und echte Kampagne ohne Freigabe/Stufe liefern 404; Download-Variante hat `content-disposition: attachment; filename="brief-nach-berlin-mehr-busse-bremen-nord-500-briefe.png"`. Dev-Server habe ich selbst gestartet (Port 3000) und wieder gestoppt.
- **Header-PNG-Groessen** (Vorschau, RGBA): 50 Briefe 1,24 MB (Download-Variante), 500 Briefe 1,28 MB, 500 Download 1,25 MB, langer Titel mit 1.000 1,29 MB. Alle unter 1,5 MB, aber nah dran. Cache-Header (1 h Browser, 24 h CDN) fangen die Last ab. Falls Mail-Ladezeit stoert: JPEG-Ausgabe waere der naechste Hebel (next/og liefert nur PNG).
- **Button-Hoehen**: per Playwright gemessen, alle vier Share-Buttons bei 375 px exakt 48 px hoch in `milestone-50`, `milestone-500` und `management-active` (vorher war der LinkedIn-Badge am Handy niedriger). Bei 640 px 38 px, ebenfalls gleich.
- **Dash-Check**: 0 U+2013/U+2014 in hinzugefuegten Strings.

## Vorschau (nicht committet, Orchestrator committet)

Ordner: `/Users/thomas/Documents/Git Repos/brief-nach-berlin/.planning/quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/preview/`

- `milestone-50.html`, `milestone-500.html`, `management-active.html`
- `milestone-50-640.png`, `milestone-50-375.png`
- `milestone-500-640.png`, `milestone-500-375.png`
- `management-active-640.png`, `management-active-375.png`

Neu erzeugen (Dev-Server muss laufen, `/images/...` zeigt in der Vorschau auf den Dev-Server, damit noch nicht deployte Dateien wie `icon-download.png` erscheinen):

```
cd web && npx tsx scripts/render-milestone-email-preview.ts --out "../.planning/quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/preview" --base http://localhost:3000 --screenshots
```

Vergleich mit `prompts/meilenstein-mail/assets/vorschau-v4.jpg`: Reihenfolge (Streifen, Kopfbild mit Zahl, Text, Fortschritt teilen, ab 500 Spendenbox, Buttons, Streifen, Footer), drei gestapelte Buttons bei 375 px unter 500, zwei ab 500, Footer-Zeilen und Social-Follow stimmen ueberein. Beispielkampagne ist die erfundene "Mehr Busse fuer Bremen-Nord", kein Create-Formular-Screenshot (Dev-Server nutzt live Supabase).

## Abweichungen und Entscheidungen fuer Thomas

1. **Spendenbox-Buttons (offene Frage)**: Die Referenz zeigt "Ueber WE AID unterstuetzen" / "Wohin das Geld geht". Umgesetzt sind die bestehenden Labels aus `SUPPORT_CAMPAIGN_CREATOR_COPY` ("Brief-nach-Berlin unterstuetzen" / "Was dein Beitrag bringt"), nur die Ueberschrift ist neu (`milestoneHeading`). Soll ich die Labels der Referenz angleichen? Das waere eine Copy-Variante nur fuer diese Mail.
2. **`milestones.ts` ohne `import "server-only"`**: bewusst, weil Mail-Builder, tsx-Vorschau-Skript und der Client-Schalter die reinen Helper importieren (server-only wirft ausserhalb des Next-Servers). Der Service-Role-Claim liegt getrennt in `milestoneNotification.ts` (server-only).
3. **Gelasio statt Georgia Bold** fuer die Zahl im Bild (Georgia darf nicht weitergegeben werden). Gelasio ist OFL und metrisch kompatibel; Courier Prime Bold fuer Kicker und Caption. Fonts nach deiner Freigabe von Google Fonts (fonts.gstatic.com) geladen, OFL-Texte von github.com/google/fonts, nur diese Downloads.
4. **`format`-Parameter nicht implementiert**: Hochformate 4:5 / 9:16 sind laut Todo "Offen"; "Bild speichern" liefert das Querformat. Die Route ignoriert `format`.
5. **Impressum-Link nur in der Meilenstein-Mail**, nicht in den bestehenden Mails (Todo: separat nachziehen).
6. **`vorschau`-Query-Param der Bildroute**: wird nur bei `NODE_ENV === "development"` gelesen (kein DB-Zugriff), in Production-Builds ist der Zweig tot. Dient allein dem Vorschau-Skript.
7. **Claim steht als erstes im `after()`-Block**, wie im Plan. Das Brevo-Senden des Meilenstein-Mails laeuft damit vor dem Brief-Mail; der Claim wirft nie, kann aber das Brief-Mail um die Sendezeit verzoegern. Falls das stoert, hinter das Brief-Mail verschieben (eine Zeile).
8. **Test-first nur teilweise strikt**: Tests und Implementation habe ich pro Task zusammen geschrieben und gegen den Code laufen lassen; ein separater roter Lauf ist nicht dokumentiert.
9. **Share-Button-Hoehe**: Plan sagte `height: 46px` plus `box-sizing: border-box` (ergibt 46). Umgesetzt ist `height: 48px` (border-box, `line-height: 46px`), damit es wie in Design 4 gefordert 48 px gesamt sind; so ist es gemessen.
10. **Frontend-Skill**: Switch, Karte und Mail folgen den vorhandenen Tokens und der Referenz, kein eigenes visuelles System; `/frontend-design` nur als Qualitaetscheck herangezogen, nicht als eigener Lauf.

### Umgebungsprobleme (nicht Teil des Codes)

- **Turbopack-Cache war defekt** ("invalid digit found in string", 8 iCloud-Duplikate im Cache-Ordner). Ich habe `web/.next/dev/cache/turbopack` (nur Cache, gitignored) verschoben und danach geloescht; Dev-Server lief danach. Memory-Eintrag "iCloud-evicted repo files" passt dazu.
- Die untracked `* 2.*`-Duplikate (u. a. `CampaignCreatorStats 2.tsx`) brechen `npm run build` im echten Verzeichnis. Bitte aufraeumen, bevor du lokal baust.

## Known Stubs

Keine. Alle neuen UI-Teile sind an echte Daten bzw. Actions angebunden.

## Threat Flags

Keine neue Flaeche ausserhalb des Threat Models. Neue oeffentliche Route ist die Bild-Route (T-j9j-01/02/09 mitigiert: Slug-/Stufen-Validierung, nur freigegebene aktive/pausierte Kampagnen mit `stufe <= letter_count`, 404 vor dem Rendern, CDN-Cache).

## Naechste Schritte fuer Thomas

1. Screenshots im Vorschau-Ordner ansehen und freigeben (insbesondere Spendenbox-Button-Labels, Frage 1 oben).
2. **Migration 027 in Supabase Studio anwenden**, bevor das auf einen deployten `main` kommt.
3. Danach pushen. Bestandskampagnen ueber einer Stufe bekommen beim naechsten Brief einmal die Mail zur hoechsten erreichten Stufe (Entscheidung 3 im Todo), die Mails kommen dann tatsaechlich raus; Thomas bekommt sie per BCC.
4. Todo-Rest "Offen": Hochformat-Hintergruende (4:5, 9:16), Lesbarkeit des Titels am Handy (im Screenshot bei 375 px ca. 10 px, Zahl ist gut lesbar), Caption mit @-Handle, S3-Werte (Abschickquote, Bewertung) in der Mail.

## Self-Check: PASSED

- Dateien vorhanden: Migration, `milestones.ts`, `milestoneNotification.ts`, Bildroute, 3 Fonts, 2 OFL-Texte, `icon-download.png` (96 x 96 RGBA), `setMilestoneMails.ts`, `MilestoneMailsSwitch.tsx`, Vorschau-Skript, 9 Vorschau-Dateien.
- Commits 290b27e, b96de3b, 76d9fcf liegen auf `main` (lokal, `git log origin/main..HEAD` zeigt sie plus fremde Commits anderer Sessions).
- Keine " 2"-Duplikate angefasst, nichts gepusht, keine Migration angewendet, kein Brevo-Aufruf ausserhalb von Jest-Mocks, keine POSTs gegen den Dev-Server.
