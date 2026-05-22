---
created: 2026-05-21T23:55:00.000Z
title: Roadmap-Signup auf /was-noch-kommt mit Supabase verdrahten
area: backend
files:
  - web/src/app/(site)/was-noch-kommt/page.tsx (PLACEHOLDER-Form ersetzen)
  - web/src/lib/actions/ (neue Server Action: submitRoadmapSignup.ts)
  - web/supabase/migrations/ (neue Migration: roadmap_signups Table + RLS)
  - web/src/lib/supabase.ts (ggf. erweitern)
---

## Problem

`/was-noch-kommt` ist live mit einem Email-Signup-Placeholder ("Sag mir Bescheid, wenn die Landtag-Ebene kommt"). Form fake't gerade Success und loggt nur in die Console. Daten gehen verloren, niemand wird benachrichtigt.

Wir brauchen den Backend-Layer, damit wir bei Launch der Landtag-Ebene (Juni 2026) gezielt die User benachrichtigen können, die sich dafür eingetragen haben. Gleicher Mechanismus später für Kommune und EU.

## Solution

### Database

Neue Migration `web/supabase/migrations/00X_create_roadmap_signups.sql`:

```sql
create table public.roadmap_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ebene text not null check (ebene in ('land', 'kommune', 'eu')),
  created_at timestamptz not null default now(),
  ip_hash text,           -- sha256(ip + salt), kein Klartext
  notified_at timestamptz, -- gesetzt nach Versand der Launch-Mail
  deleted_at timestamptz   -- soft-delete für Auto-Cleanup
);

create unique index on public.roadmap_signups (email, ebene) where deleted_at is null;
create index on public.roadmap_signups (ebene, notified_at);

alter table public.roadmap_signups enable row level security;
-- Kein Public Read, kein Public Write. Nur Service-Role-Inserts via Server Action.
```

### Server Action

`web/src/lib/actions/submitRoadmapSignup.ts`:

- Input: `{ email: string, ebene: "land" | "kommune" | "eu" }` (Zod-validated)
- Email-Validierung: gleiche Regex wie wizardSchemas.ts
- IP-Hashing über bestehende Helper (analog zu rate-limit oder feedback)
- Rate-Limit: max 3 Signups pro IP pro Stunde
- Idempotent: existierender (email, ebene)-Eintrag → friendly success ohne Duplicate-Error
- Supabase Service Role Client (nicht Anon Key, RLS lässt sonst nichts durch)
- Return: `{ ok: true } | { ok: false, error: string }`

### GDPR

**Doppelt geklärt:**

1. **Klarer Hinweis im UI** (Pflicht, direkt unterm Input, Privacy-by-Design):
   *"Wir speichern nur deine Email und die gewählte Ebene. Du bekommst eine einzige Mail, sobald die Ebene live geht. Danach werden deine Daten gelöscht. Kein Newsletter, keine Weitergabe."*

2. **Double-Opt-In oder Single-Opt-In?**
   - Option A (Double-Opt-In): Bestätigungsmail mit Confirm-Link, erst nach Click wird `confirmed_at` gesetzt. Sauber juristisch, aber zusätzlicher Reibungspunkt + Brevo-Cost (~5x mehr Mails als nötig).
   - Option B (Single-Opt-In + klarer Hinweis): User trägt Email ein, ist eingetragen. Rechtlich tragbar wenn die Zweckbindung minimal ist (genau eine Launch-Mail, dann Löschung). Vermutlich akzeptabel via Art. 6 Abs. 1 lit. a + Datensparsamkeit.
   - **Entscheidung:** Option B in v1 (analog zur restlichen Datensparsamkeit-Linie), Option A nachrüsten falls juristisch nötig (DSGVO-Audit checken).

3. **Automatic Deletion nach Notification:**
   - Cron / Supabase Edge Function läuft 7 Tage nach Launch der jeweiligen Ebene
   - Setzt `deleted_at` für alle (ebene, notified_at IS NOT NULL)-Rows
   - Hard-Delete nach weiteren 30 Tagen via separater Cron
   - In Datenschutzerklärung dokumentieren

4. **Datenschutzerklärung** unter `/datenschutz` ergänzen: neuer Absatz "Roadmap-Benachrichtigung".

### Frontend-Änderung

In `web/src/app/(site)/was-noch-kommt/page.tsx`:

- Placeholder-Form raus, Client Component `RoadmapSignupForm` rein
- `ebene`-Prop fest auf `"land"` für v1 (Landtag-Launch ist der einzige aktive Use-Case)
- Bei Launch der EU-Ebene später separates Signup-Formular auf der EU-Card aktivieren (heute statische Coming-Soon-Card, siehe D15 aus 999.6-CONTEXT)
- Success-State: warm + konkret ("Danke. Wir melden uns, wenn die Landtag-Ebene live geht, voraussichtlich im Juni 2026.")
- Error-State: behutsam, nicht schreiend ("Hat nicht geklappt. Versuch's noch mal oder schreib uns direkt.")

### Notification Workflow

Bei Launch der Landtag-Ebene (Juni 2026):

1. Admin-Script `web/scripts/notify-roadmap-signups.ts` läuft einmal
2. Iteriert über alle `roadmap_signups WHERE ebene='land' AND notified_at IS NULL AND deleted_at IS NULL`
3. Sendet pro Email einen Brevo-Versand mit Template "Landtag-Ebene ist da" (eigene HTML-Mail, ähnlich `buildEmailHtml.ts`-Pattern)
4. Setzt `notified_at = now()` nach erfolgreichem Versand
5. Loggt Fehlversände in eigene Tabelle oder Log-File

### Tests

- Unit: Zod-Schema, Email-Regex, IP-Hash-Determinismus
- Integration: Server Action → Supabase Insert → korrekter Idempotenz-Check bei Duplicate
- Manual: GDPR-Hinweis ist im UI sichtbar, Datenschutzerklärung enthält den Roadmap-Absatz

### Ausführung

Implementation via `/gsd-plan-phase` oder `/gsd-quick` in eigener Session. Vor Launch der Landtag-Ebene (Phase 999.6 Wave 4+) abschließen, damit Signup-Bestand groß genug ist, dass eine Launch-Mail Sinn macht.

### Verwandt

- Phase 999.6 (Landtag + Kommune politician coverage expansion) liefert den Trigger-Moment für die erste Notification
- `/was-noch-kommt` ist die Conversion-Quelle für Signups
- DSGVO-TODO.md: neuer Eintrag "Roadmap-Signups Datenschutzerklärung-Absatz"
