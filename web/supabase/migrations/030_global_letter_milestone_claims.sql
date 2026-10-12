-- Claim rows prevent duplicate global letter milestone emails under concurrent requests.
-- Each reached threshold is claimed once before the email send attempt.
-- Apply manually in Supabase Studio SQL Editor before deploying the notification code.

create table if not exists public.global_letter_milestone_claims (
  milestone_count integer primary key
    check (milestone_count > 0 and milestone_count % 1000 = 0),
  claimed_at timestamptz not null default now()
);

alter table public.global_letter_milestone_claims enable row level security;
revoke all on public.global_letter_milestone_claims from anon, authenticated;
grant select, insert on public.global_letter_milestone_claims to service_role;
