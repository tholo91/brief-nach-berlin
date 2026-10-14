# Last-Call Versand am 14.10.2026

Arbeite die fünf Schritte der Reihe nach ab. Keine automatische Planung oder automatische Sendung.

## 1. Migration 033 im Supabase SQL Editor schreibgeschützt prüfen

Thomas hat Migration 033 laut eigener Rückmeldung bereits im SQL Editor ausgeführt und `schedule: 2` erhalten. Das bestätigt noch nicht sämtliche Datenbankobjekte und Rechte. Prüfe zuerst schreibgeschützt; führe die Migration nicht allein wegen der ausstehenden Prüfung erneut aus:

```sql
select c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'letter_outcomes';

select conname, pg_get_constraintdef(oid) as definition from pg_constraint
where conrelid = 'public.letter_outcomes'::regclass and contype in ('u', 'c');

select pg_get_functiondef(
  'public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text)'::regprocedure
);

select has_function_privilege('service_role',
  'public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text)', 'EXECUTE') as service_role_can_submit,
  has_function_privilege('anon',
  'public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text)', 'EXECUTE') as anon_can_submit,
  has_function_privilege('authenticated',
  'public.submit_letter_outcome(text,text,text,text,jsonb,boolean,text,text,boolean,text,boolean,text)', 'EXECUTE') as authenticated_can_submit;

select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'letter_outcomes'
order by grantee, privilege_type;

select jobname, schedule, active, command from cron.job where jobname = 'cleanup-letter-outcomes';
```

`relrowsecurity` und `relforcerowsecurity` müssen `true` sein; der Unique-Constraint deckt `(email, cohort)` ab, das RPC-Recht für `service_role` ist `true`, für `anon` und `authenticated` jeweils `false`, `service_role` hat Tabellenrechte, `anon` und `authenticated` haben keine Tabellenrechte. Vergleiche CHECK-Constraints und Funktionsdefinition mit Migration 033, einschließlich der Sperre gegen verspätete Progress-Aufrufe. Der Cron-Job muss genau einmal vorkommen, aktiv sein und die Aufbewahrung auf knapp unter 24 Monate begrenzen.

## 2. Geprüften Stand auf `main` bringen und deployen

Die Implementierung liegt im lokalen Commit `3c49b89`, gefolgt von den Review-Korrekturen. `3c49b89` enthält auch vorher vorhandene Änderungen. Aktualisiere vor Push/Deploy den Remote-Stand mit `git fetch --quiet` und prüfe die gesamte Reihe mit `git log --oneline origin/main..main`.

Prüfe `git status --short`, stage nur die geprüften Taskdateien und verwende kein `git add .`, weil der Worktree weitere Änderungen enthält. Committe und deploye den geprüften Stand auf `main` erst, wenn Schritt 1 erfolgreich war. Die Produktionsumgebung braucht `FEEDBACK_TOKEN_SECRET` und `REVIEW_IP_SALT`; beide müssen auch lokal in `web/.env.local` vorhanden sein und denselben Wert haben. `FEEDBACK_TOKEN_SECRET` muss übereinstimmen, damit lokale Preview-Links in Produktion geprüft werden können. Secret-Werte nicht in Logs oder Chat kopieren.

## 3. Lokale Vorschau erzeugen und auf dem Handy öffnen

```bash
cd "/Users/thomas/Documents/Git Repos/brief-nach-berlin/web"
npm exec -- tsx scripts/send-lastcall-followup.ts --check-token
npm exec -- tsx scripts/send-lastcall-followup.ts --preview
open .lastcall-preview.html
```

`--preview` braucht weder CSV noch `BREVO_API_KEY`, ruft kein Netzwerk auf und erzeugt HTML/Text mit Gründer-Testtokens in Dateien mit Modus `0600`. Die Ausgabe enthält nur die Dateipfade. Öffne die drei Antwortlinks aus der HTML-Vorschau auf deinem eigenen Handy, zum Beispiel indem du sie dir privat überträgst. Prüfe Vorauswahl, Änderbarkeit, Einwilligung vor sensiblen Antworten und Löschseite. Lösche die Preview-Dateien anschließend.

## 4. Empfängerzahlen prüfen und echte Testmail ansehen

```bash
npm exec -- tsx scripts/export-lastcall-cohort.ts
git check-ignore .lastcall-cohort.csv .lastcall-cohort.csv.tmp .lastcall-send-journal.json .lastcall-send-journal.json.lock .lastcall-send-journal.json.tmp .lastcall-send-journal.json.preflight .lastcall-preview.html .lastcall-preview.txt
npm exec -- tsx scripts/send-lastcall-followup.ts .lastcall-cohort.csv --dry-run
```

Der Export liest Reviews mit `created_at < 2026-08-12T22:00:00Z` (13.08.2026 00:00 Europe/Berlin, exklusiv) und `web/.backlog-recipients.csv`. Er schließt dieselben Testadressen wie `fetch-reviews.ts` aus, normalisiert und dedupliziert und zeigt nur Summenzahlen. Prüfe die Quellzahlen und Empfängerzahl. `--dry-run` sendet genau eine echte Testmail an `Brief-nach-Berlin@posteo.de`. Sieh sie in Mail.app und auf dem Handy an und teste die drei Antwortlinks.

Falls du den Testeintrag in Supabase kontrollieren willst, verwende nur diese datensparsame Abfrage. Sie zeigt keine Freitextantworten:

```sql
select email, cohort,
  count(*) filter (where last_step = 'entry' and completed = false) as entry_rows,
  count(*) filter (where last_step <> 'entry' and completed = false) as progress_rows,
  count(*) filter (where completed = true) as completed_rows
from public.letter_outcomes
where lower(email) = lower('Brief-nach-Berlin@posteo.de')
  and cohort = 'lastcall_2026_10'
group by email, cohort;
```

Nach dem Test lösche den Testdatensatz über den persönlichen Löschlink. Bestätige die Löschung mit:

```sql
select count(*) = 0 as test_row_deleted
from public.letter_outcomes
where lower(email) = lower('Brief-nach-Berlin@posteo.de')
  and cohort = 'lastcall_2026_10';
```

## 5. Am 14.10. um 09:30 Uhr Europe/Berlin Kontingent prüfen und manuell senden

Unmittelbar vor dem Versand prüfe im Brevo-Dashboard das verfügbare Kontingent und gleiche es mit der Empfängerzahl aus Schritt 4 ab. Bei zu wenig Kontingent abbrechen und neu terminieren. Wenn alles passt, manuell starten:

```bash
npm exec -- tsx scripts/send-lastcall-followup.ts .lastcall-cohort.csv --confirm
```

Tippe an der Nachfrage `SENDEN`. Das Journal speichert erfolgreiche Empfänger. Vor jeder Anfrage wird `pendingEmail` gesetzt. Bei Abbruch oder Netzwerkfehler blockiert der Eintrag weitere Läufe. Prüfe Brevo für genau diesen Empfänger und Zeitpunkt: Wenn die Mail angenommen wurde, ergänze ihn in `sentEmails` und leere danach `pendingEmail`; wenn Brevo die Mail nachweislich nicht angenommen hat, leere `pendingEmail`. Nie blind wiederholen. Ein zurückgebliebenes `.lock` erst entfernen, wenn sicher kein Versandprozess läuft.

Nach geprüftem Versand und abgeschlossener Klärung lösche `.lastcall-cohort.csv` und die Preview-Dateien lokal. Das Versandjournal enthält Empfängeradressen und darf höchstens 24 Monate aufbewahrt werden; danach lokal löschen. Es wird nicht in Git eingecheckt.

## Voraussetzungen

`web/.env.local` benötigt `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `FEEDBACK_TOKEN_SECRET` und `REVIEW_IP_SALT`. Für die Löschseite und das manuelle Löschscript ist außerdem `LETTER_SIGNAL_EMAIL_HASH_SECRET` erforderlich, auch bei reinen Mail-Klicks ohne Kartenbeitrag. Prüfe dessen Vorhandensein in Produktion und lokal vor dem Löschtest; verwende das bestehende Secret und rotiere es nicht, da sonst bestehende Hash-Zuordnungen verloren gehen. Keine dieser Variablen in Logs oder Tickets kopieren.

## Versandprotokoll

Nach dem Versand hier eintragen, ohne Adressen: Datum, Uhrzeit, Anzahl erfolgreich, Anzahl fehlgeschlagen, ob `pendingEmail` leer ist. Wer genau angeschrieben wurde, steht nur im lokalen Journal `web/.lastcall-send-journal.json` (gitignored). Prüfe nach dem Versand, dass die Datei wirklich lokal liegt und nicht von iCloud ausgelagert wurde (`brctl download web/.lastcall-send-journal.json`).

- Versand: 14.10.2026, ca. 09:07 bis 09:09 Uhr. Erfolgreich 335, fehlgeschlagen 0, nicht versucht 0. Journal hat 335 Einträge, `pendingEmail` leer, kein Lock. Kohorten-CSV danach gelöscht.

## Nächste Runde (z. B. Januar 2027)

Die Grenze dieser Runde ist fest: Reviews vor dem 13.08.2026 plus die Mai-Liste. Für die nächste Runde:

1. Neuer Kohorten-Name, z. B. `lastcall_2027_01`. Migration 033 erlaubt per CHECK nur `lastcall_2026_10`, also braucht `letter_outcomes` und `submit_letter_outcome` eine kleine Migration, die den neuen Namen zulässt.
2. `LASTCALL_CUTOFF_UTC` in `web/src/lib/rueckmeldung/cohort.ts` wird zur Untergrenze: Reviews ab `2026-08-12T22:00:00Z` bis zum neuen Stichtag. Die Mai-Liste nicht erneut einlesen.
3. Das alte Journal als Ausschlussliste verwenden: `sentEmails` in eine CSV mit Spalte `email` schreiben und beim Versand `--exclude=<datei>` angeben. So bekommt niemand die Mail doppelt.
4. Neues Journal für die neue Kohorte anlegen; das alte Journal bis zum Ablauf der 24 Monate behalten.
