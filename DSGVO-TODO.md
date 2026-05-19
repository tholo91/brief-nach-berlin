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

## ☑ Task 2: Mistral - Training-Opt-Out verifizieren + Screenshot — ERLEDIGT 2026-05-19

**Lösung:** Workspace auf **Scale Plan** (pay-per-use) upgegradet. Scale-Plan-Daten werden laut Mistral-Policy **standardmäßig nicht** zum Training verwendet (data isolation by default, im Gegensatz zum Experiment-Plan, wo Inputs/Outputs per Default ins Training fließen). Damit ist Abschnitt 9 der Datenschutzerklärung gedeckt.

**Quelle:** https://help.mistral.ai/en/articles/347617-do-you-use-my-user-data-to-train-your-artificial-intelligence-models

**Resthinweis:** Bei nächstem Login zusätzlich in den Workspace Privacy Settings einen Screenshot des "Data Sharing"-Status sichern und unter `web/docs/compliance/mistral-scale-plan.png` ablegen (für die Akte, nicht blockierend).

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

## ☐ Task 4: Supabase - DPA herunterladen + EU-Region (Frankfurt) verifizieren

**Warum:** Mit der `reviews`-Tabelle verarbeiten wir personenbezogene Daten (E-Mail, optional Name, Kommentar) in einer Datenbank. DSGVO Art. 28 verlangt einen Auftragsverarbeitungsvertrag (DPA) mit Supabase. Die Datenschutzerklärung Abschnitt 16 verweist auf den DPA und behauptet Server-Region Frankfurt - beides muss beweissicher belegt sein.

**Schritte:**
1. Login: https://supabase.com/dashboard
2. Projekt `brief-nach-berlin` (Ref `fkejmnqkmmmjmesgpiop`) öffnen
3. **Settings** -> **General**: Region prüfen - muss `Frankfurt (eu-central-1)` sein. Screenshot machen.
4. **Settings** -> **Compliance** (oder Account-Settings -> Legal): DPA-PDF herunterladen unter https://supabase.com/legal/dpa
5. PDF ablegen unter `web/docs/compliance/supabase-dpa-2026-XX.pdf` (mit aktuellem Monat)
6. Verarbeitungsverzeichnis ([DSGVO-VERARBEITUNGSVERZEICHNIS.md](DSGVO-VERARBEITUNGSVERZEICHNIS.md)) prüfen: Eintrag „VT-5 Nutzer-Bewertungen" muss vorhanden sein.

**Beweis sichern:** Region-Screenshot + signiertes/heruntergeladenes DPA-PDF.

**Bonus-Check:** RLS-Verifikation in Supabase Studio SQL-Editor:
```sql
-- Mit anon-Key: muss nur consented Rows liefern
SELECT count(*) FROM reviews;
```

---

## Wenn alle vier Häkchen gesetzt sind

- Diese Datei umbenennen in `DSGVO-TODO-DONE-2026-XX-XX.md` oder löschen
- Compliance-Score: 95/100
- Datenschutzerklärung stimmt mit Realität überein
- Du hast eine Akte, die du im Beschwerdefall vorlegen kannst

## Quartalsweise Re-Check (Erinnerung)

Alle drei Settings können sich durch Anbieter-UI-Updates oder versehentliches Klicken ändern. Quartalsweise Checkliste in [DSGVO-INCIDENT-RESPONSE.md](DSGVO-INCIDENT-RESPONSE.md) Abschnitt 7.
