# DSGVO - Offene manuelle Tasks

> Diese drei Tasks sind die letzten Schritte aus dem DSGVO-Audit ([DSGVO-AUDIT.md](DSGVO-AUDIT.md)). Code ist live-fähig, **diese Schritte müssen aber in den Anbieter-Dashboards erledigt werden**, damit die Datenschutzerklärung mit der Realität übereinstimmt.
>
> **Aufwand gesamt: ~30 Minuten.** Erst danach ist Compliance-Score auf 95+.

---

## ☐ Task 1: Brevo - Open- und Click-Tracking deaktivieren

**Warum:** Sonst bettet Brevo Tracking-Pixel in jede ausgehende Mail. Das macht die Datenschutzerklärung falsch (sagt: "kein Tracking") und löst eine Cookie-Banner-Diskussion aus.

**Schritte:**
1. Login: https://app.brevo.com
2. Navigation: **Senders, Domains & Dedicated IPs** -> Tab **Tracking** (oder: Account-Icon oben rechts -> Settings -> Email -> Tracking)
3. **Open Tracking** auf OFF
4. **Click Tracking** auf OFF
5. Speichern
6. Test: Eine Test-Mail an dich selbst schicken, im Mail-Source nach `<img` mit `brevo.com`-URL suchen - sollte weg sein.

**Beweis sichern:** Screenshot vom Tracking-Settings-Dialog -> ablegen unter `web/docs/compliance/brevo-tracking-off.png` (Ordner notfalls anlegen).

---

## ☐ Task 2: Mistral - Training-Opt-Out verifizieren + Screenshot

**Warum:** Datenschutzerklärung Abschnitt 9 sagt zu, dass deine API-Daten nicht für Modelltraining genutzt werden. Das musst du in der Console verifizieren und beweissicher dokumentieren.

**Schritte:**
1. Login: https://console.mistral.ai
2. Workspace auswählen (das, dessen API-Key in `BREVO_API_KEY` ... äh, Verzeihung: in `MISTRAL_API_KEY` steckt)
3. Navigation: **Settings** -> **Data Sharing** (oder **Workspace Settings** -> **Privacy**)
4. Sicherstellen: **"Use my data to train models"** ist OFF / "Opt out"
5. Falls Toggle nicht da: bei Mistral Support nachfragen (privacy@mistral.ai), schriftliche Bestätigung einholen.

**Beweis sichern:** Screenshot vom Data-Sharing-Toggle -> `web/docs/compliance/mistral-training-optout.png` mit aktuellem Datum.

---

## ☐ Task 3: Vercel - Data Processing Addendum (DPA) digital unterzeichnen

**Warum:** Datenschutzerklärung Abschnitt 4 und Verarbeitungsverzeichnis VT-1 verweisen auf einen aktiven AVV mit Vercel. Auf Hobby-Plan ist die DPA standardmäßig akzeptiert, aber für die Akte willst du eine signierte/datierte Version haben.

**Schritte:**
1. Login: https://vercel.com/dashboard
2. Navigation: **Settings** (für deinen Account, nicht das Projekt) -> **Legal**
3. Sektion **Data Processing Agreement**: aktuelle Version anzeigen
4. Falls digitaler Sign-Button: ausführen. Falls schon akzeptiert: PDF runterladen.
5. Optional: über https://vercel.com/contact/sales eine Counter-Signed-Version anfordern (für Vercel-Pro-Kunden Standard).

**Beweis sichern:** PDF runterladen -> `web/docs/compliance/vercel-dpa-2026-04.pdf`.

---

## Wenn alle drei Häkchen gesetzt sind

- Diese Datei umbenennen in `DSGVO-TODO-DONE-2026-XX-XX.md` oder löschen
- Compliance-Score: 95/100
- Datenschutzerklärung stimmt mit Realität überein
- Du hast eine Akte, die du im Beschwerdefall vorlegen kannst

## Quartalsweise Re-Check (Erinnerung)

Alle drei Settings können sich durch Anbieter-UI-Updates oder versehentliches Klicken ändern. Quartalsweise Checkliste in [DSGVO-INCIDENT-RESPONSE.md](DSGVO-INCIDENT-RESPONSE.md) Abschnitt 7.
