---
quick_id: 261009-lms
mode: quick
---

# Kampagnen-Zahlen schärfen + Empfehlungs-Ask für Kampagnen-Starter:innen

## Context
Thomas sieht auf `/kampagne/verwalten` (Abschnitt "Zahlen", `#creator-stats`) vier Kacheln. Fragen:
1. Rating schöner: Sterne mit Teilfüllung statt nur "4,4 von 5 Sternen".
2. Warum steht "97 % wissen oft oder manchmal nicht, was sie politisch konkret tun können" da?
3. Sind das die richtigen Zahlen für Kampagnen-Starter:innen?
4. Wo fragen wir nach Empfehlungen ("kennst du andere, die eine Kampagne führen wollen?"): Mail oder Seite, statt Spendenlink?

## Blick durch die Brille der Kampagnen-Starter:innen
- **NGO:** braucht Zahlen für Förderberichte, Vorstand, Newsletter. Wichtig: "Hat unser Publikum gehandelt?" (Briefe, abgeschickt) und "Hat es Menschen gestärkt?" (Selbstwirksamkeit, das ist ein klassischer Wirkungs-KPI für Förderer). Spenden an ein Tool: eher nein, eigenes Budget ist knapp. Weiterempfehlen an Partner-Orgas: ja, kostet nichts, macht sie zu Gebenden im Netzwerk.
- **Influencer:** will Beweis, dass die Community mitgezogen hat, und etwas Teilbares. Spendet nicht, empfiehlt aber gern, wenn es den eigenen Status zeigt.
- **Lokale Initiative:** will Bestätigung, dass es nicht umsonst war. Kennt andere Initiativen im Ort, das ist dein bester Akquise-Kanal.

Daraus folgt:
- Kachel 1 (abgeschickt), 2 (Zufriedenheit), 3 (Selbstwirksamkeit) = richtig. Das sind Wirkung + Qualität + Stärkung.
- Kachel 4 (Ohnmacht) ist ein **Vorher-Zustand**, keine Wirkung. Für Starter:innen wirkt sie verwirrend und, mit dem dritten "97 %" in Folge, unglaubwürdig. **Als Kachel raus, als Vorher-Kontextzeile behalten (siehe Änderung 2).**
- Was am meisten fehlt: "Hat ein MdB geantwortet?" Wird nirgends gespeichert (nur Freitext-Antworten auf die Last-Call-Mail). Später, nicht jetzt.
- Spendenkarte auf der Verwalten-Seite trifft die falsche Zielgruppe. Ein **Empfehlungs-Ask** im Moment des Stolzes (gerade gute Zahlen gesehen) passt besser. Spenden bleibt als kleiner Link.
- Info-Icon statt Karte: nein, ein verstecktes Icon wird kaum geklickt. Sichtbare, ruhige Karte.

## Änderungen (Empfehlung)
Frontend-Arbeit über `/frontend-design`, Ausführung über `/gsd:quick`.

### 1. Sterne mit Teilfüllung im Rating-Tile
- `web/src/components/reviews/RatingStat.tsx`: lokale `StarBar` exportieren und eine Größe-Prop ergänzen (`size?: "sm" | "lg"`, default wie heute `text-3xl`), damit sie im Tile klein (`text-lg`) laufen kann. Keine neue Komponente.
- `web/src/components/campaigns/CampaignCreatorStats.tsx` L363-372: Rating-Tile zeigt `4,4/5` als Wert, darunter `StarBar size="sm"` mit Teilfüllung, Label "Zufriedenheit mit dem fertigen Brief", darunter wie gehabt "aus N Rückmeldungen". `aria-label` "4,4 von 5 Sternen". Prüfen, ob `Tile` (L46) einen Slot für Extra-Inhalt braucht (kleines `children`).
- Die `Stars`-Komponente bei den Zitaten (L237) bleibt, dort sind ganze Sterne pro Einzelbewertung korrekt.

### 2. Ohnmacht-Kachel als Kontext-Zeile (Entscheidung Thomas: umdeuten)
- `CampaignCreatorStats.tsx` L382-390 Tile raus, Grid auf `lg:grid-cols-3`.
- Über den 3 Kacheln eine kleine Kontextzeile (nur wenn `powerlessness.status === "shown"`), z. B.: "Vorher wussten 97 % oft oder manchmal nicht, was sie politisch konkret tun können. Danach:" Die Kacheln lesen sich dann als Antwort darauf (Vorher/Nachher-Story). Daten und Schwellen in `lib/campaigns/creatorStats.ts` bleiben unverändert.

### 3. Empfehlungs-Karte statt Spendenkarte (Verwalten-Seite)
Annahme: "eigentliche Kampagnenseite" = die Verwalten-Seite der Starter:innen (die öffentliche Kampagnenseite sehen Briefschreiber:innen, nicht die Starter:innen). Jetzt: Empfehlung prominent, Spende als kleiner Link. Die Review-Bitte an Starter:innen (ab 50 Briefen, "dauert 1-2 Minuten", Spende nur unter 50) ist eine eigene spätere Story, siehe unten.
- `web/src/components/campaigns/CampaignDonationCard.tsx` umbauen (oder neue `CampaignReferralCard.tsx` und Donation-Card dort nicht mehr rendern, `app/(site)/kampagne/verwalten/page.tsx` L180-187).
- Inhalt (Entwurf, Feinschliff mit avoid-ai-writing-Check, keine Gedankenstriche):
  - Überschrift: "Kennst du jemanden, der auch was bewegen will?"
  - Text: "Eine Initiative, ein Verein, jemand mit Community und einem Anliegen? Erzähl ihnen von Brief nach Berlin oder stell mich kurz vor. Ich richte die Kampagne gern mit ein."
  - Primär-Button: "Weiterempfehlen" = WhatsApp/Mail-Share mit vorformuliertem Text + Link auf `/kampagne/starten` (bestehende Share-Helfer aus dem Share-Block wiederverwenden).
  - Sekundär-Button: "Thomas vorstellen" = `mailto:thomas_lorenz@posteo.de` mit Betreff "Vorstellung: Kampagne".
  - Kleine Zeile darunter: "Du willst Brief nach Berlin unterstützen? Hier geht's zur Spende." (Link `DONATION_PROVIDER_URL`).
  - Founder-Avatar bleibt (persönlich, wirkt).
- Kein Tracking, keine neue Tabelle (DSGVO, keine neuen Tools).

### 4. Ein Satz in der Meilenstein-Mail
- `web/src/lib/email/buildCampaignCreatorEmailHtml.ts` `buildMilestoneEmailHtml` (L115-219): unter "Fortschritt teilen" eine Zeile + Link "Kennst du andere, die eine Kampagne starten wollen? Schick ihnen den Link oder stell mich vor." Meilenstein = Peak-Moment, Mail wird ohnehin verschickt, kein neuer Mail-Typ.

## Später (nicht in diesem Schritt)
- **Story "Review von Starter:innen":** ab 50 Briefen auf der Verwalten-Seite um eine kurze Bewertung bitten ("dauert 1-2 Minuten"), angelehnt an das bestehende `/feedback`-Formular. Unter 50 Briefen stattdessen Spenden-Hinweis. Braucht eigene Fragen + Speicherort, daher separat.
- "Hat dein MdB geantwortet?" als Feld erfassen (Follow-up/Last-Call), dann als stärkste Kachel zeigen.
- "Zahlen teilen"-Bild für Starter:innen (wie Meilenstein-Bild), damit sie Wirkung an ihr Publikum zurückspielen.

## Verifikation
1. `npm run lint` + `npx tsc --noEmit` + bestehende Tests in `web/` (Stats/Email-Builder, falls vorhanden).
2. Dev-Server, `/kampagne/verwalten` mit Verwaltungstoken einer Test-/eigenen Kampagne öffnen: 3 Kacheln, Teil-Sterne bei z. B. 4,4 sichtbar (ca. 40 % des 5. Sterns gefüllt), Mobile 375px ohne Umbruch-Chaos, Empfehlungskarte statt Spendenkarte.
3. Meilenstein-Mail-HTML lokal rendern (Builder mit Testdaten aufrufen, HTML in Browser öffnen) und Zeile prüfen.
4. Screenshot an Thomas.
