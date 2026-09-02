-- 016: allow a campaign creator to transfer management to another email address.
-- Apply manually in Supabase Studio SQL Editor after migration 015.

alter table public.campaign_tokens
  drop constraint if exists campaign_tokens_kind_check;

alter table public.campaign_tokens
  add constraint campaign_tokens_kind_check
  check (kind in ('verify_email', 'manage', 'transfer'));

alter table public.campaign_tokens
  add column if not exists recipient_email text;

alter table public.campaign_tokens
  drop constraint if exists campaign_tokens_recipient_email_check;

alter table public.campaign_tokens
  add constraint campaign_tokens_recipient_email_check
  check (
    (kind = 'transfer' and recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    or (kind <> 'transfer' and recipient_email is null)
  );

create unique index if not exists campaign_tokens_one_open_transfer_idx
  on public.campaign_tokens (campaign_id)
  where kind = 'transfer' and used_at is null;

create or replace function public.accept_campaign_transfer(transfer_token_hash text)
returns public.campaigns
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  transfer_row public.campaign_tokens%rowtype;
  campaign_row public.campaigns%rowtype;
  accepted_campaign public.campaigns%rowtype;
begin
  select *
  into transfer_row
  from public.campaign_tokens
  where token_hash = transfer_token_hash
    and kind = 'transfer'
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Campaign transfer token was not found or was already used'
      using errcode = 'P0002';
  end if;

  select *
  into campaign_row
  from public.campaigns
  where id = transfer_row.campaign_id
  for update;

  if not found then
    raise exception 'Campaign % was not found', transfer_row.campaign_id
      using errcode = 'P0002';
  end if;

  if campaign_row.status not in ('awaiting_approval', 'active', 'paused') then
    raise exception 'Campaign % cannot be transferred while it is %', campaign_row.id, campaign_row.status
      using errcode = 'P0001';
  end if;

  update public.campaigns
  set
    creator_email = lower(transfer_row.recipient_email),
    updated_at = now()
  where id = campaign_row.id
  returning * into accepted_campaign;

  update public.campaign_tokens
  set used_at = now()
  where campaign_id = campaign_row.id
    and kind in ('transfer', 'manage')
    and used_at is null;

  return accepted_campaign;
end;
$$;

revoke all on function public.accept_campaign_transfer(text) from public;
revoke all on function public.accept_campaign_transfer(text) from anon;
revoke all on function public.accept_campaign_transfer(text) from authenticated;
grant execute on function public.accept_campaign_transfer(text) to service_role;
