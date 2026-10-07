-- Allgemeiner dritter Kampagnentyp: fester deutscher Postempfaenger.
-- Die strukturierte Anschrift wird serverseitig geladen; der Browser sendet
-- im Brief-Flow nur recipient_kind = campaign_fixed.

alter table public.campaigns
  add column if not exists target_recipient jsonb;

alter table public.campaign_revisions
  add column if not exists target_level text not null default 'Bund',
  add column if not exists target_state text,
  add column if not exists target_recipient jsonb;

alter table public.campaigns
  drop constraint if exists campaigns_target_level_valid;

alter table public.campaigns
  add constraint campaigns_target_level_valid
    check (target_level in ('Bund', 'Land', 'Fixed'));

alter table public.campaigns
  drop constraint if exists campaigns_target_recipient_requires_land,
  drop constraint if exists campaigns_target_recipient_valid;

alter table public.campaigns
  add constraint campaigns_target_recipient_valid
    check (
      (target_level = 'Fixed' and target_state is null and jsonb_typeof(target_recipient) = 'object')
      or (target_level <> 'Fixed' and target_recipient is null)
    );

alter table public.campaigns
  drop constraint if exists campaigns_target_politicians_require_bund;

alter table public.campaigns
  add constraint campaigns_target_politicians_require_bund
    check (target_level = 'Bund' or cardinality(target_politician_ids) = 0);

alter table public.campaigns
  drop constraint if exists campaigns_target_scope_valid;

alter table public.campaigns
  add constraint campaigns_target_scope_valid
    check (target_level = 'Land' or target_state is null);

alter table public.campaign_revisions
  drop constraint if exists campaign_revisions_target_level_valid,
  drop constraint if exists campaign_revisions_target_scope_valid,
  drop constraint if exists campaign_revisions_target_recipient_valid,
  drop constraint if exists campaign_revisions_target_politicians_require_bund;

alter table public.campaign_revisions
  add constraint campaign_revisions_target_level_valid
    check (target_level in ('Bund', 'Land', 'Fixed')),
  add constraint campaign_revisions_target_scope_valid
    check (target_level = 'Land' or target_state is null),
  add constraint campaign_revisions_target_recipient_valid
    check (
      (target_level = 'Fixed' and target_state is null and jsonb_typeof(target_recipient) = 'object')
      or (target_level <> 'Fixed' and target_recipient is null)
    ),
  add constraint campaign_revisions_target_politicians_require_bund
    check (target_level = 'Bund' or cardinality(target_politician_ids) = 0);

update public.campaigns
set
  target_level = 'Fixed',
  target_state = null,
  target_recipient = jsonb_build_object(
    'organizationName', 'Hessisches Ministerium der Justiz und für den Rechtsstaat',
    'personName', null,
    'salutation', 'Sehr geehrte Damen und Herren,',
    'street', 'Luisenstraße',
    'houseNumber', '13',
    'postalCode', '65185',
    'city', 'Wiesbaden',
    'countryCode', 'DE'
  ),
  target_politician_ids = '{}',
  updated_at = now()
where slug = 'unterschrift-ist-kein-dienstvergehen';

-- Die Zielspalten gab es in historischen Revisionen bislang nicht. Als
-- bestmögliche Rückfüllung übernehmen sie den nach dieser Migration gültigen
-- Kampagnenstand; dadurch bleibt insbesondere die veröffentlichte NRV-Revision
-- konsistent mit ihrem neuen festen Empfänger.
update public.campaign_revisions as revision
set
  target_level = campaign.target_level,
  target_state = campaign.target_state,
  target_recipient = campaign.target_recipient
from public.campaigns as campaign
where revision.campaign_id = campaign.id;

alter table public.letter_signals
  drop constraint if exists letter_signals_level_check,
  drop constraint if exists letter_signals_recipient_kind_check;

alter table public.letter_signals
  add constraint letter_signals_level_check
    check (political_level in ('Bund', 'Land', 'Kommune', 'Fixed')),
  add constraint letter_signals_recipient_kind_check
    check (recipient_kind in (
      'mdb', 'mdb_later', 'mdl', 'bundeskanzler',
      'landesregierung', 'campaign_fixed', 'rathaus'
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
    target_level, target_state, target_recipient, target_politician_ids
  ) values (
    campaign_row.id, 'activated', campaign_row.title, campaign_row.issue_text,
    campaign_row.description, campaign_row.creator_name, campaign_row.external_url,
    'approved', campaign_row.moderation_categories, campaign_row.target_level,
    campaign_row.target_state, campaign_row.target_recipient,
    campaign_row.target_politician_ids
  ) returning id into revision_id;

  update public.campaigns
  set status = 'active', moderation_status = 'approved', activated_at = now(),
      paused_at = null, last_published_revision_id = revision_id, updated_at = now()
  where id = campaign_row.id
  returning * into approved_campaign;

  return approved_campaign;
end;
$$;
