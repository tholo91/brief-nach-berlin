# Compliance-Akte

Beweismaterial für DSGVO-Audit. Alles hier wird im Beschwerdefall einer Aufsichtsbehörde gegenüber als Nachweis vorgelegt.

## Was hier reingehört

| Datei | Inhalt | Erneuern wenn |
|---|---|---|
| `brevo-tracking-off-YYYY-MM.png` | Screenshot der Brevo-Tracking-Settings mit Open/Click Tracking = OFF | Brevo-UI ändert sich, Setting versehentlich aktiviert |
| `vercel-dpa-YYYY-MM.pdf` | Unterzeichnete oder akzeptierte Data Processing Agreement | Vercel veröffentlicht neue DPA-Version |
| `supabase-dpa-YYYY-MM.pdf` | Supabase Data Processing Agreement | Supabase veröffentlicht neue DPA-Version |
| `supabase-region-frankfurt.png` | Screenshot Region = `eu-central-1` aus Supabase Dashboard | Region wird verschoben (sollte nie passieren) |
| `mistral-scale-plan-YYYY-MM.png` | Screenshot Mistral Workspace = Scale Plan (Data Sharing off) | Plan wird gedowngraded |

Dateinamen mit Datumsstempel (`YYYY-MM`), damit die jeweils aktuelle Version eindeutig identifizierbar ist. Alte Versionen NICHT löschen, sondern liegen lassen, damit der Verlauf nachvollziehbar bleibt.

## Quartalsweise Re-Check

Siehe [DSGVO-INCIDENT-RESPONSE.md](../../../DSGVO-INCIDENT-RESPONSE.md) Abschnitt 7. Alle drei Anbieter-Settings können sich durch UI-Updates oder versehentliches Klicken ändern.

## Verweise

- Audit: [DSGVO-AUDIT.md](../../../DSGVO-AUDIT.md)
- TODO: [DSGVO-TODO.md](../../../DSGVO-TODO.md)
- Verarbeitungsverzeichnis: [DSGVO-VERARBEITUNGSVERZEICHNIS.md](../../../DSGVO-VERARBEITUNGSVERZEICHNIS.md)
