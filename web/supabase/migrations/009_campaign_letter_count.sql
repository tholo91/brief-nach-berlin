alter table public.campaigns
  add column if not exists letter_count integer not null default 0;

alter table public.campaigns
  drop constraint if exists campaigns_letter_count_nonnegative;

alter table public.campaigns
  add constraint campaigns_letter_count_nonnegative check (letter_count >= 0);

create or replace function public.increment_letter_counters(campaign_slug text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_letter_count integer;
begin
  update public.counters
  set value = value + 1
  where key = 'letter_count'
  returning value into next_letter_count;

  if next_letter_count is null then
    insert into public.counters (key, value)
    values ('letter_count', 1)
    on conflict (key) do update
      set value = public.counters.value + 1
    returning public.counters.value into next_letter_count;
  end if;

  if campaign_slug is not null and btrim(campaign_slug) <> '' then
    update public.campaigns
    set letter_count = letter_count + 1,
        updated_at = now()
    where slug = campaign_slug
      and status = 'active';
  end if;

  return next_letter_count;
end;
$$;
