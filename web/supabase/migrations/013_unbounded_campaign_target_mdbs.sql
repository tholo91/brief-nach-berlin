-- 013: Remove the legacy 20-MdB cap from campaign targeting.
-- Apply manually in Supabase Studio (SQL Editor), after migration 012.
--
-- Empty arrays keep the standard PLZ-based Bundestag campaign behavior.

alter table public.campaigns
  drop constraint if exists campaigns_target_politician_ids_valid;
