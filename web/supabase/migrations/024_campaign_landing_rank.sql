-- 024: Kuratierte Kampagnen-Pills im Hero der Startseite (ab iPad sichtbar).
-- landing_rank: 1, 2, 3 ... bestimmt Reihenfolge; null = nicht auf der Startseite.
-- landing_label: kurzer Pill-Text (max. 24 Zeichen); null = Kampagnentitel.
-- Gerendert werden hoechstens 3 aktive, freigegebene Kampagnen.
-- Lokal vorbereitete Migration. Vor dem Livegang separat in Supabase anwenden
-- und den Remote-Migrationsstand unabhaengig verifizieren.
--
-- Studio-Befehle:
--   update public.campaigns set landing_rank = 1, landing_label = 'Erbschaftsteuer' where slug = '<slug>';
--   update public.campaigns set landing_rank = null, landing_label = null where slug = '<slug>';
--   select slug, title, landing_rank, landing_label, status, moderation_status
--     from public.campaigns where landing_rank is not null order by landing_rank;

alter table public.campaigns
  add column if not exists landing_rank smallint,
  add column if not exists landing_label text;

alter table public.campaigns
  drop constraint if exists campaigns_landing_rank_check,
  drop constraint if exists campaigns_landing_label_check;

alter table public.campaigns
  add constraint campaigns_landing_rank_check
    check (landing_rank is null or landing_rank between 1 and 9),
  add constraint campaigns_landing_label_check
    check (landing_label is null or char_length(btrim(landing_label)) between 1 and 24);

create index if not exists campaigns_landing_rank_idx
  on public.campaigns (landing_rank)
  where landing_rank is not null;
