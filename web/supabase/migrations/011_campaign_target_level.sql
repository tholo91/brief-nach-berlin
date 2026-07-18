-- 011: Kampagnen bekommen eine feste politische Ziel-Ebene.
-- Apply manually in Supabase Studio (SQL Editor).
--
-- target_level: 'Bund' (Bundestag) oder 'Land' (Landtag). Altdaten defaulten auf 'Bund'.
-- target_state: bundeslandKey (BB, BE, BW, BY, HB, HE, HH, MV, NI, NW, RP, SH, SL, SN, ST, TH)
--   oder NULL = alle Bundeslaender (die PLZ der schreibenden Person entscheidet).
--   Nur relevant, wenn target_level = 'Land'.

alter table public.campaigns
  add column if not exists target_level text not null default 'Bund',
  add column if not exists target_state text;

alter table public.campaigns
  drop constraint if exists campaigns_target_level_valid;

alter table public.campaigns
  drop constraint if exists campaigns_target_state_valid;

alter table public.campaigns
  drop constraint if exists campaigns_target_scope_valid;

alter table public.campaigns
  add constraint campaigns_target_level_valid
    check (target_level in ('Bund', 'Land')),
  add constraint campaigns_target_state_valid
    check (
      target_state is null or target_state in (
        'BB', 'BE', 'BW', 'BY', 'HB', 'HE', 'HH', 'MV',
        'NI', 'NW', 'RP', 'SH', 'SL', 'SN', 'ST', 'TH'
      )
    ),
  add constraint campaigns_target_scope_valid
    check (target_level = 'Land' or target_state is null);
