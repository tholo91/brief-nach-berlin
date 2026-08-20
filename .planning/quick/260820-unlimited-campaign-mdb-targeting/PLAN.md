# Unbegrenzte MdB-Auswahl für Kampagnen

## Ziel

Eine Bundestagskampagne kann eine unbegrenzte, eindeutige Liste konkreter MdBs speichern. Eine leere Liste bedeutet weiterhin: alle über die PLZ zuständigen MdBs.

## Umsetzung

- Migration `012_campaign_target_mdbs.sql` vorab in Supabase anwenden, falls die Spalten noch fehlen.
- Migration `013_unbounded_campaign_target_mdbs.sql` anwenden; sie entfernt nur die 20er-Constraint auf `campaigns.target_politician_ids`.
- Alle Client- und Server-Validierungen akzeptieren beliebig viele positive, eindeutige IDs. Ungültige oder nicht mehr im Bundestags-Cache vorhandene IDs bleiben abgewiesen.
- Bestehende Kampagnen und Revisionen mit leerer Liste bleiben unverändert kompatibel.

## Manuelle Admin-Änderung in Supabase

Die Verwaltungsoberfläche ist der bevorzugte Weg. Für eine bewusst manuelle Änderung die IDs erst im lokalen `web/data/politicians-cache.json` prüfen und anschließend in einer Transaktion sowohl Kampagne als auch Revision aktualisieren:

```sql
begin;

with updated_campaign as (
  update public.campaigns
  set
    target_politician_ids = array[70563, 69005]::bigint[],
    updated_at = now()
  where slug = 'dein-kampagnen-slug'
  returning *
), created_revision as (
  insert into public.campaign_revisions (
    campaign_id,
    snapshot_reason,
    title,
    issue_text,
    description,
    creator_name,
    external_url,
    moderation_status,
    moderation_categories,
    target_politician_ids
  )
  select
    id,
    'edited',
    title,
    issue_text,
    description,
    creator_name,
    external_url,
    moderation_status,
    moderation_categories,
    target_politician_ids
  from updated_campaign
  returning id, campaign_id
)
update public.campaigns campaigns
set last_published_revision_id = created_revision.id
from created_revision
where campaigns.id = created_revision.campaign_id;

commit;
```

## Abnahme

- 21 und mehr eindeutige IDs werden akzeptiert.
- Doppelte oder unbekannte IDs werden abgewiesen.
- Leere Liste führt weiter zum normalen PLZ-Flow.
- Direkte SQL-Änderung erzeugt eine passende Revision und setzt `last_published_revision_id`.
