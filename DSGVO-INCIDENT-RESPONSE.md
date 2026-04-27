# Datenpannen-Notfallplan (Art. 33 / 34 DSGVO)

**Verantwortlicher:** Thomas Lorenz, thomas_lorenz@posteo.de
**Zuständige Aufsichtsbehörde:** LDI NRW (Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen), Kavalleriestr. 2-4, 40213 Düsseldorf, https://www.ldi.nrw.de
**Stand:** 2026-04-27

## 1. Was zählt als Datenpanne?

Jede Verletzung der Sicherheit, die zu unbeabsichtigter oder unrechtmäßiger Vernichtung, Verlust, Veränderung, Offenlegung oder Zugang zu personenbezogenen Daten führt. In diesem Projekt typische Szenarien:

- Leak von API-Keys (Mistral, Brevo) im Repo, Logs oder öffentlich
- Kompromittierter Vercel-Account
- Versand-Bug, der Briefe an die falsche E-Mail-Adresse zustellt
- Sicherheitsvorfall bei Vercel, Mistral oder Brevo (wird vom Auftragsverarbeiter gemeldet)
- Unbefugter Zugriff auf das Posteo-Postfach
- Persistierung personenbezogener Daten ohne Rechtsgrundlage (z. B. versehentliches Logging des Anliegen-Texts)

## 2. Sofortmaßnahmen (binnen 1 Stunde)

1. **Kontain.** Verursachenden Vorgang stoppen: Deployment rollback, kompromittierte Keys rotieren, Vercel-Account-Sessions beenden.
2. **Beweise sichern.** Logs und Zeitstempel exportieren bevor Vercel sie verfallen lässt (Vercel Dashboard -> Logs -> Download).
3. **Umfang abschätzen.** Wie viele Personen betroffen? Welche Datenkategorien? Welche Dauer?

## 3. Bewertung & Meldung (binnen 72 Stunden, Art. 33)

Meldepflicht an LDI NRW besteht, **außer** wenn die Verletzung "voraussichtlich nicht zu einem Risiko für die Rechte und Freiheiten natürlicher Personen führt".

Faustregel für dieses Projekt: **im Zweifel melden**. Politische Meinungen sind besondere Kategorien - Risiko ist schnell als "nicht gering" einzustufen.

Meldeweg LDI NRW: https://www.ldi.nrw.de/meldungen-an-die-aufsichtsbehoerde
Notwendige Angaben (Art. 33 Abs. 3): Art der Verletzung, Kategorien und Anzahl Betroffener, voraussichtliche Folgen, ergriffene und geplante Maßnahmen, Kontaktdaten.

## 4. Benachrichtigung der Betroffenen (Art. 34)

Pflicht, wenn "voraussichtlich ein hohes Risiko" für die Betroffenen besteht. Bei diesem Projekt typischerweise dann der Fall, wenn Anliegentexte oder E-Mail-Adressen Dritten zugänglich wurden.

Da wir keine E-Mail-Adressen speichern, ist Direktbenachrichtigung oft nicht möglich. Ersatz-Benachrichtigung über die Website (prominenter Hinweis auf der Startseite) gemäß Art. 34 Abs. 3 lit. c DSGVO.

## 5. Dokumentation (Art. 33 Abs. 5)

Jede Datenpanne (auch ohne Meldepflicht) wird hier dokumentiert mit: Datum, Beschreibung, betroffene Daten, Maßnahmen, Bewertung. Datei: `DSGVO-INCIDENT-LOG.md` (anlegen bei erstem Vorfall).

## 6. Kontakte der Auftragsverarbeiter

| Verarbeiter | Security/Privacy-Kontakt |
|---|---|
| Vercel | security@vercel.com |
| Mistral | privacy@mistral.ai |
| Brevo | dpo@brevo.com |
| Posteo | datenschutz@posteo.de |

## 7. Präventiv-Checkliste (alle 3 Monate)

- [ ] API-Keys rotieren (Mistral, Brevo)
- [ ] Vercel-Account: 2FA aktiv? Sessions geprüft?
- [ ] GitHub-Repo: keine Secrets committet? `.env.local` in `.gitignore`?
- [ ] Dependency-Audit: `npm audit` ausgeführt?
- [ ] Brevo-Account: Tracking weiterhin aus?
- [ ] Mistral-Workspace: Training-Opt-Out weiterhin aktiv?
- [ ] Datenschutzerklärung noch aktuell (alle Verarbeiter, alle Modelle)?
