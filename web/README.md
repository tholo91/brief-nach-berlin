# Brief-nach-Berlin: Web-App

Die aktive Anwendung liegt in diesem Verzeichnis. Produkt, Datenfluss und Lizenz
stehen in der [Projekt-README](../README.md).

## Lokal starten

Vom Repository-Root aus:

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Die App läuft unter [localhost:3000](http://localhost:3000). Vercel verwendet
derzeit Node.js 24.x; dieselbe Hauptversion ist auch lokal sinnvoll.

Vor dem Start die benötigten Werte in `.env.local` setzen. Die Startseite liest
Supabase-Daten; ein leeres Environment reicht deshalb nicht für den vollständigen
App-Start. Eigene Entwicklungszugänge verwenden und Schlüssel nicht einchecken.

| Funktion | Benötigte Variablen |
| --- | --- |
| Datenzugriff, Zähler und Kampagnen | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Briefgenerierung und Transkription | `MISTRAL_API_KEY` |
| Brief-Mail und signierte Feedback-/Löschlinks | `BREVO_API_KEY`, `FEEDBACK_TOKEN_SECRET`; optional `BREVO_SENDER_EMAIL` |
| Bewertungen speichern | zusätzlich `REVIEW_IP_SALT` |
| Freiwillige Kartensignale | `LETTER_SIGNAL_EMAIL_HASH_SECRET`; Token-Secret gemäß `.env.example` |
| Persönliche Datenübersicht und Löschung | `FEEDBACK_TOKEN_SECRET`, `LETTER_SIGNAL_EMAIL_HASH_SECRET` |
| Kampagnenverwaltung | optional separates `CAMPAIGN_SESSION_SECRET`; sonst Service-Role-Key als Fallback |
| Interne Statistik und Meilenstein-Mail | `INTERNAL_STATS_PASSWORD`; für die Mail zusätzlich `THOMAS_MAIL` |

Feature-Flags, weitere optionale Variablen und Datenschutzhinweise stehen in
[`.env.example`](.env.example). Ein Development-Server ist kein Sandbox-Modus für
externe Dienste: Generierung, Transkription und Mailversand verwenden die
konfigurierten Anbieterzugänge.

## Prüfen

Alle Befehle in `web/` ausführen:

```bash
npm test -- --runInBand
npm run lint
npm run build
```

Die Jest-Tests verwenden Mocks und benötigen keine echten Anbieterzugänge.
Einzelne Tests lassen sich etwa mit
`npm test -- --runInBand src/__tests__/campaignFixedRecipient.test.ts` ausführen.
Der Build lädt Environment-Dateien, führt serverseitigen Seitencode aus und
lädt die in `src/app/layout.tsx` konfigurierten Google Fonts. Er benötigt deshalb
passende Entwicklungswerte und Netzwerkzugriff; ein bestandener Testlauf beweist
keinen bestandenen Build oder funktionierenden Produktivversand.

## Orientierung

| Pfad | Inhalt |
| --- | --- |
| `src/app/` | Seiten, Server-Routen und Layout; Startseite: `src/app/page.tsx` |
| `src/components/` | Oberfläche und Wizard |
| `src/lib/` | Zuständigkeit, Generierung, Versand und weitere Fachlogik |
| `src/__tests__/` | Jest-Tests und Anbieter-Mocks |
| `data/`, `scripts/` | Politische Daten und deren Build-/Importskripte |
| `supabase/` | SQL-Migrationen und dokumentierter Produktionsstatus |

[Migrationsstatus](supabase/MIGRATION_STATUS.md) und ausgeführte SQL-Änderungen
sind getrennt von einem Git-Push oder Vercel-Deployment zu prüfen.
Import-, Versand- und Löschskripte nicht als Start- oder Smoke-Test verwenden.
