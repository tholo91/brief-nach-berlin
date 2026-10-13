-- 032: add manually curated campaign issue-text alternatives.
-- Apply manually in Supabase Studio SQL Editor.
--
-- Alternatives are creator-authored campaign content. Runtime code must only
-- use them when issue_text_alternatives_base exactly matches issue_text.
-- This migration does not alter RLS or grants.

create or replace function public.campaign_issue_alternatives_valid(
  p_issue_text text,
  p_values text[]
)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, pg_temp
as $$
declare
  item text;
  seen text[] := '{}';
begin
  if cardinality(p_values) > 2
    or (cardinality(p_values) > 0 and array_ndims(p_values) <> 1)
    or array_position(p_values, null) is not null then
    return false;
  end if;

  foreach item in array p_values loop
    if char_length(btrim(item)) < 50 or char_length(btrim(item)) > 4000 then
      return false;
    end if;
    if btrim(item) = btrim(p_issue_text) or btrim(item) = any(seen) then
      return false;
    end if;
    seen := array_append(seen, btrim(item));
  end loop;

  return true;
end;
$$;

alter table public.campaigns
  add column if not exists issue_text_alternatives text[] not null default '{}',
  add column if not exists issue_text_alternatives_base text;

alter table public.campaign_revisions
  add column if not exists issue_text_alternatives text[] not null default '{}',
  add column if not exists issue_text_alternatives_base text;

alter table public.campaigns
  drop constraint if exists campaigns_issue_text_alternatives_valid;
alter table public.campaigns
  add constraint campaigns_issue_text_alternatives_valid
  check (public.campaign_issue_alternatives_valid(
    coalesce(issue_text_alternatives_base, issue_text),
    issue_text_alternatives
  ));

alter table public.campaign_revisions
  drop constraint if exists campaign_revisions_issue_text_alternatives_valid;
alter table public.campaign_revisions
  add constraint campaign_revisions_issue_text_alternatives_valid
  check (public.campaign_issue_alternatives_valid(
    coalesce(issue_text_alternatives_base, issue_text),
    issue_text_alternatives
  ));

create or replace function public.approve_campaign(campaign_id uuid)
returns public.campaigns
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  campaign_row public.campaigns%rowtype;
  revision_id uuid;
  approved_campaign public.campaigns%rowtype;
begin
  select * into campaign_row
  from public.campaigns
  where id = campaign_id
  for update;

  if not found then
    raise exception 'Campaign % was not found', campaign_id using errcode = 'P0002';
  end if;
  if campaign_row.status <> 'awaiting_approval' then
    raise exception 'Campaign % is not awaiting approval', campaign_id using errcode = 'P0001';
  end if;
  if campaign_row.email_verified_at is null then
    raise exception 'Campaign % has no verified creator email', campaign_id using errcode = 'P0001';
  end if;
  if campaign_row.moderation_status <> 'pending' then
    raise exception 'Campaign % is not pending moderation', campaign_id using errcode = 'P0001';
  end if;

  insert into public.campaign_revisions (
    campaign_id, snapshot_reason, title, issue_text, description,
    creator_name, external_url, moderation_status, moderation_categories,
    target_level, target_state, target_recipient, target_politician_ids,
    issue_text_alternatives, issue_text_alternatives_base
  ) values (
    campaign_row.id, 'activated', campaign_row.title, campaign_row.issue_text,
    campaign_row.description, campaign_row.creator_name, campaign_row.external_url,
    'approved', campaign_row.moderation_categories, campaign_row.target_level,
    campaign_row.target_state, campaign_row.target_recipient,
    campaign_row.target_politician_ids, campaign_row.issue_text_alternatives,
    campaign_row.issue_text_alternatives_base
  ) returning id into revision_id;

  update public.campaigns
  set status = 'active', moderation_status = 'approved', activated_at = now(),
      paused_at = null, last_published_revision_id = revision_id, updated_at = now()
  where id = campaign_row.id
  returning * into approved_campaign;

  return approved_campaign;
end;
$$;
