-- Migration 014: support spoken campaign URLs without hyphens.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- The canonical slug remains the hyphenated `slug`. This generated value is
-- only used to find a unique redirect target for compact spoken URLs.

alter table public.campaigns
  add column if not exists compact_slug text
  generated always as (replace(slug, '-', '')) stored;

create index if not exists campaigns_active_compact_slug_idx
  on public.campaigns (compact_slug)
  where status = 'active' and moderation_status = 'approved';
