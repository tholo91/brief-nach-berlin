# DSGVO - Offene manuelle Tasks

> Stand 2026-05-27: **Brevo und Mistral erledigt, Supabase-Region bestätigt (Frankfurt).** Verbleibend: 2 PDF-Downloads (Vercel + Supabase DPA) plus optional Screenshots für die Akte. Compliance-Ordner liegt unter [web/docs/compliance/](web/docs/compliance/) mit README, die das Naming-Schema dokumentiert.
>
> **Aufwand verbleibend: ~10 Minuten.** Erst danach ist Compliance-Score auf 95+.

---

## ☑ Task 1: Brevo - Open- und Click-Tracking deaktivieren — ERLEDIGT 2026-05-27

**Status:** Tracking ist im Brevo-Workspace abgeschaltet (Open + Click).

**Resthinweis:** Screenshot der Tracking-Settings noch ablegen unter `web/docs/compliance/brevo-tracking-off-2026-05.png` (für die Akte, nicht blockierend).

**Quartals-Re-Check:** Setting kann durch Brevo-UI-Update oder versehentliches Klicken wieder anspringen. In Quartals-Routine aufnehmen (siehe [DSGVO-INCIDENT-RESPONSE.md](DSGVO-INCIDENT-RESPONSE.md) Abschnitt 7).

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

**Beweis sichern:** PDF runterladen -> `web/docs/compliance/vercel-dpa-2026-05.pdf`. Compliance-Ordner liegt bereit, README dokumentiert das Naming-Schema.

---

## ◐ Task 4: Supabase - DPA herunterladen + EU-Region (Frankfurt) verifizieren — TEILWEISE 2026-05-27

**Status:** Region bestätigt = `eu-central-1` (Frankfurt). Verbleibend: DPA-PDF + Region-Screenshot ablegen.

**Schritte (verbleibend):**
1. Region-Screenshot: Supabase Dashboard → Projekt `brief-nach-berlin` → Settings → General → Region-Sektion abfotografieren → ablegen als `web/docs/compliance/supabase-region-frankfurt.png`
2. DPA-PDF: https://supabase.com/legal/dpa öffnen → Browser → drucken → „Als PDF speichern" → ablegen als `web/docs/compliance/supabase-dpa-2026-05.pdf`
3. Verarbeitungsverzeichnis ([DSGVO-VERARBEITUNGSVERZEICHNIS.md](DSGVO-VERARBEITUNGSVERZEICHNIS.md)) prüfen: Eintrag „VT-5 Nutzer-Bewertungen" muss vorhanden sein.

**Beweis sichern:** Region-Screenshot + DPA-PDF im Compliance-Ordner.

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
