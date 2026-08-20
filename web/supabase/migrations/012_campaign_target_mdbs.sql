-- 012: Optional allowlist of Bundestag mandates for a campaign.
-- Apply manually in Supabase Studio (SQL Editor).
--
-- An empty array preserves the existing PLZ-based campaign behavior.
-- The list contains candidacy_mandate IDs from the build-time politician cache.

alter table public.campaigns
  add column if not exists target_politician_ids bigint[] not null default '{}';

alter table public.campaign_revisions
  add column if not exists target_politician_ids bigint[] not null default '{}';
