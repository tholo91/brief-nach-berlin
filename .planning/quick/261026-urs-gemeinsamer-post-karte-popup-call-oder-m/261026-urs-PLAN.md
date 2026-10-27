# Gemeinsamer Post: Auswahl Call oder Mail, Accounts sichtbar

## Context
Creator sehen auf ihrer Kampagnen-Verwaltungsseite die Karte "Lust auf einen gemeinsamen Post?". Der Button öffnet heute eine leere Mail (nur Betreff). Ziel (Grilling 1A/2A/3A/4A): Reichweite für die Kampagne, Thomas' Follower als Nebeneffekt. Entschieden:
- Thomas' Instagram/LinkedIn sichtbar auf der Karte (bestehende Icons).
- Klick auf den Button öffnet ein kleines Popup: "Kurz Call buchen" (Calendly) oder "Mail schreiben".
- Mail schlank: Betreff wie bisher, Text nur 2 Lücken. Kein Netzwerk-Auswahlschritt.
- Calendly-URL ist öffentlich: Konstante in `config.ts`, keine Vercel-Env-Var.

## Änderungen
1. `web/src/lib/config.ts`: `FOUNDER_CALENDLY = "https://calendly.com/thomas-lorenz-eu/call"` neben `FOUNDER_LINKEDIN`.
2. `web/src/lib/contact.ts`: `campaignJointPostHref(slug)` neben `campaignContactHref` (bestehende Stelle erweitern). Betreff `Gemeinsamer Post: <slug>`, Body:
   ```
   Hallo Thomas,

   Netzwerk (Instagram oder LinkedIn):
   Mein Account:

   ```
3. Menü-Logik nicht kopieren: Outside-Click + Escape aus `web/src/components/SocialFollow.tsx` in einen kleinen Hook `useDismissableMenu` ziehen (gleiche Datei-Nachbarschaft, z. B. `web/src/components/useDismissableMenu.ts`), `SocialFollow` nutzt ihn danach unverändert im Verhalten.
4. Neue Client-Komponente `web/src/components/campaigns/CampaignJointPostMenu.tsx`: Button "Gemeinsamen Post planen" (gleiche Klassen wie heute), öffnet Menü im Stil von `SocialFollow` mit zwei Einträgen: "Kurz Call buchen" (Calendly, neuer Tab) und "Mail schreiben" (`campaignJointPostHref`).
5. `web/src/components/campaigns/CampaignReferralCard.tsx`: `<a href={jointPostHref}>` durch `CampaignJointPostMenu` ersetzen; `SocialFollowIcons` als kleine Reihe unter dem Absatz (der Text nennt Instagram/LinkedIn schon).
6. UI-Feinschliff (Popup-Position mobil, Icon-Reihe) über `/frontend-design`, Copy ohne Gedankenstriche, "ich" statt "wir".

## Tests
- `web/src/__tests__/campaignCreatorStats.test.ts`, Test "plans a joint post by mail": umstellen auf
  - `campaignJointPostHref(SLUG)` enthält Betreff `Gemeinsamer%20Post%3A%20klima-jetzt` und die zwei Lücken, keine `–—`.
  - Markup enthält Button "Gemeinsamen Post planen" vor dem Share-Button und die Links zu `FOUNDER_INSTAGRAM`/`FOUNDER_LINKEDIN`.
- Ausführung: `cd web && npx jest campaignCreatorStats` und danach volle Suite `npx jest`, `npx tsc --noEmit`.

## Verifikation im Browser
Dev-Server per `preview_start`, eine Kampagnen-Verwaltungsseite öffnen: Popup öffnet/schließt (Klick außen, Escape), Calendly in neuem Tab, Mail-Link öffnet Entwurf mit Betreff + 2 Lücken, Mobil 375 px ohne Überlauf. Screenshot als Nachweis.

## Ablauf
Start über `/gsd-quick`. Kein Commit/Push ohne OK.
