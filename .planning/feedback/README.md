# Feedback-Workflow

Operativer Loop für User-Reviews aus Supabase. Keine CSV-Exports mehr.

## Daten ziehen

Reviews leben in der Supabase-Tabelle `reviews`. Lokales Abfragen geht über:

```bash
pnpm -F web tsx scripts/fetch-reviews.ts --since 2026-05-24 --with-body
pnpm -F web tsx scripts/fetch-reviews.ts --rating-max 3 --uncontacted
pnpm -F web tsx scripts/fetch-reviews.ts --tag anliegen_verfehlt --format md
```

Standard-Filter blendet Test-Mails (tholorenz@posteo.de etc.) aus. `--include-tests` schaltet das ab.

## Wer wurde schon kontaktiert?

`reviews.contacted_at` (date, nullable) wird gesetzt, sobald Thomas einer Person persönlich geantwortet hat.

```bash
# Markieren (default: heute)
pnpm -F web tsx scripts/mark-contacted.ts <uuid-or-email>

# Rückwirkend mit Datum
pnpm -F web tsx scripts/mark-contacted.ts <id> --date 2026-05-20

# Mehrere Reviews einer Person auf einmal
pnpm -F web tsx scripts/mark-contacted.ts user@example.com --all-matches

# Zurücknehmen
pnpm -F web tsx scripts/mark-contacted.ts <id> --unset

# Filtern nach Status
pnpm -F web tsx scripts/fetch-reviews.ts --uncontacted
pnpm -F web tsx scripts/fetch-reviews.ts --contacted
```

## Mail-Drafts

Persönliche Antworten an Reviewer:innen landen unter `drafts/<email-handle>.md`. Diese Dateien sind **nicht committed** (gitignored) — sie enthalten konkrete Personenbezüge.

Konvention:
- Dateiname: `<email-handle>.md` (z.B. `joimurlaub.md` für joimurlaub@gmail.com)
- Inhalt: Betreff + Body + zugehörige `reviews.id` für `mark-contacted`
- Versand: Thomas kopiert raus und schickt aus Posteo (thomas-lorenz@posteo.de)
- Danach: `mark-contacted.ts <id>` — der Loop bleibt sauber

## TODOs

`TODOS-YYYY-MM-DD.md` sammeln Produkt-TODOs aus jedem Batch. Die wichtigsten landen via `/gsd-add-backlog` direkt in der `ROADMAP.md`.
