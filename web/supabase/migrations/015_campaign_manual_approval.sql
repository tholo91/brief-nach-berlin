-- 015: keep verified campaigns private until Thomas approves them in Supabase Studio.
--
-- Apply manually in Supabase Studio SQL Editor after migration 014.
--
-- Studio release command:
-- select id, title, status, moderation_status, activated_at
-- from public.approve_campaign('<campaign-id>');

alter table public.campaigns
  drop constraint if exists campaigns_status_check;

alter table public.campaigns
  add constraint campaigns_status_check
  check (status in (
    'draft',
    'awaiting_email_verification',
    'awaiting_approval',
    'active',
    'paused',
    'archived',
    'blocked'
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
  select *
  into campaign_row
  from public.campaigns
  where id = campaign_id
  for update;

  if not found then
    raise exception 'Campaign % was not found', campaign_id
      using errcode = 'P0002';
  end if;

  if campaign_row.status <> 'awaiting_approval' then
    raise exception 'Campaign % is not awaiting approval', campaign_id
      using errcode = 'P0001';
  end if;

  if campaign_row.email_verified_at is null then
    raise exception 'Campaign % has no verified creator email', campaign_id
      using errcode = 'P0001';
  end if;

  if campaign_row.moderation_status <> 'pending' then
    raise exception 'Campaign % is not pending moderation', campaign_id
      using errcode = 'P0001';
  end if;

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
  values (
    campaign_row.id,
    'activated',
    campaign_row.title,
    campaign_row.issue_text,
    campaign_row.description,
    campaign_row.creator_name,
    campaign_row.external_url,
    'approved',
    campaign_row.moderation_categories,
    campaign_row.target_politician_ids
  )
  returning id into revision_id;

  update public.campaigns
  set
    status = 'active',
    moderation_status = 'approved',
    activated_at = now(),
    paused_at = null,
    last_published_revision_id = revision_id,
    updated_at = now()
  where id = campaign_row.id
  returning * into approved_campaign;

  return approved_campaign;
end;
$$;

revoke all on function public.approve_campaign(uuid) from public;
revoke all on function public.approve_campaign(uuid) from anon;
revoke all on function public.approve_campaign(uuid) from authenticated;
