# Kampagne verwalten: Redesign

## Context
`/kampagne/verwalten` ist funktional fertig (S1–S3), aber gewachsen statt gestaltet. Probleme:
- Reihenfolge folgt der Entstehung, nicht der Nutzung: Das Bearbeiten-Formular ist der größte Block und steht in der Mitte. QR-Code und Laufzeit liegen ganz unten unter dem Formular.
- Teilen ist der wichtigste Hebel für mehr Briefe, steht aber nur als kleines Kopierfeld im Kopf. Der Kasten mit den zwei Adressen ist ein langer Absatz.
- Das hochgeladene Bild erscheint nur als 72px-Quadrat im Formular (`contain`). Öffentlich wird es rund und beschnitten gezeigt (`CampaignLogo`, `cover`). Wer die Kampagne verwaltet, sieht also nie, wie das Bild öffentlich wirkt.
- Kleinere Inkonsistenzen: Die Notices nutzen `rounded-2xl`, der Rest `rounded-md`. Die Pending-Notice ist `max-w-2xl`, der Manager `max-w-4xl`. Die h1 steht in `font-typewriter`, auf den öffentlichen Seiten in `font-body`.

Ziel ist eine Seite, die beim Öffnen sofort drei Fragen beantwortet: Was ist meine Kampagne, wie teile ich sie, wie läuft sie? Selten genutzte Aktionen rutschen nach unten.

## Entscheidungen (Thomas, 2026-10-08)
- Bild: rund im Kopf, gleiche Darstellung wie öffentlich (`CampaignLogo`)
- Layout: eine Spalte, `max-w-4xl` bleibt, nur neu sortiert
- Bearbeiten-Formular: standardmäßig eingeklappt

## Neue Reihenfolge (eine Spalte, mobil und Desktop gleich)
1. **Kopf**
   a. Rundes Logo (lg, ca. 80px) über `CampaignLogo`; ohne Bild greift der bestehende Initial-Fallback.
   b. Titel, Status-Pill mit Farbpunkt (aktiv = waldgrün, pausiert = bernstein, beendet = grau).
   c. Button „Kampagnenseite ansehen“.
   d. Bei beendeten Kampagnen wird der Ended-Banner in den Kopf integriert statt als eigene Karte davor.
2. **Teilen**
   a. Der Link-Kopierfeld (`CampaignUrlCopyField`).
   b. Die Kurzadresse als eine Zeile mit eigenem Kopieren, Text „Kurzlink für Radio und Podcast“.
   c. Der QR-Download wandert aus dem Fußbereich hierher.
3. **Stats** (`CampaignCreatorStats`): bleibt inhaltlich unverändert, ist nach S3 schon gut.
4. **Spendenkarte**: bleibt nach den Stats, ohne Änderung.
5. **„Kampagne bearbeiten“**
   a. Wird ein eingeklapptes `<details>`.
   b. Inputs bleiben im DOM, das Formular-Submit funktioniert also unverändert.
   c. Die Bildvorschau im Formular wird rund mit dem Hinweis „So erscheint dein Bild auf der Kampagnenseite“.
6. **„Laufzeit und Status“**: bleibt ganz unten. Pausieren, Beenden und Übertragen werden als Einstellungsbereich visuell abgesetzt.

## Dateien
- `web/src/components/campaigns/CampaignManager.tsx` (869 Zeilen)
  a. Kopf und Teilen-Block werden in eigene Komponenten ausgelagert: `CampaignManagerHeader.tsx` und `CampaignShareCard.tsx`.
  b. Das Formular kommt in `<details>`.
  c. Die Reihenfolge wird umgestellt.
- `web/src/components/campaigns/CampaignLogo.tsx`: neue Größe `lg`.
- `web/src/components/campaigns/CampaignQrDownload.tsx`: eventuell eine kompakte Variante für die Teilen-Karte.
- `web/src/app/(site)/kampagne/verwalten/page.tsx`
  a. Notices bekommen `rounded-md` und dieselbe Breite wie der Manager.
  b. **Achtung:** Die uncommittete Änderung „Link verlegt? Kontaktiere mich“ muss erhalten bleiben.
- Wiederverwendet werden die bestehenden Card-, Button- und Eyebrow-Klassen sowie `CampaignUrlCopyField`, `CampaignLogo` und `campaignLogoPublicUrl` (`web/src/lib/campaigns/logo.ts`).

## Ablauf
- Ausführung über `/gsd:quick`, Frontend-Arbeit mit `frontend-design`.
- Keine Logikänderungen an Server Actions, Upload oder Moderation.

## Verifikation
1. Eine temporäre, nur lokale Vorschau-Route mit Mockdaten (wie das gelöschte `verwalten/vorschau/`) für die Zustände aktiv, pausiert, beendet, wartet auf Freigabe, mit Bild und ohne Bild. Sie wird vor dem Commit gelöscht.
2. Dev-Server über preview_start, Screenshots bei 375px und 1280px, Konsole auf Fehler prüfen.
3. Kopieren, QR-Download, `<details>` auf- und zuklappen, Bildvorschau nach Dateiauswahl, Dialoge zum Beenden und Übertragen.
4. `npm run lint` und `npm run build` in `web/`.
