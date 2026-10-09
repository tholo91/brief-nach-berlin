-- Kampagnen: Meilenstein-Mails an Ersteller.
-- Eine Kampagne bekommt Stufen (milestones). Erreicht letter_count eine Stufe,
-- geht einmal eine Mail an den Ersteller (BCC an Thomas). milestone_notified
-- merkt die zuletzt gemeldete Stufe und dient als Claim gegen doppelte Mails.
-- milestone_mails_enabled ist der Schalter des Erstellers, getrennt von den
-- Stufen, damit Aus- und wieder Einschalten die eigenen Stufen nicht verliert.
--
-- Apply manually in Supabase Studio SQL Editor.
-- Der Code verkraftet fehlende Spalten (Lesen faellt auf die Standardstufen
-- und "an" zurueck, Anlegen mit Standard erwaehnt die Spalte nicht, der Claim
-- loggt nur). Meilenstein-Mails starten aber erst nach dieser Migration.
--
-- Stufen pro Kampagne direkt in Supabase aendern, z. B. fuer Influencer- oder
-- NGO-Kampagnen:
--   update public.campaigns set milestones = '{1000,5000,10000}' where slug = '...';
-- Ueber der letzten Stufe gibt es keine Mails mehr.

alter table public.campaigns
  add column if not exists milestones integer[] not null default '{50,100,500,1000,2000,5000}',
  add column if not exists milestone_notified integer not null default 0,
  add column if not exists milestone_mails_enabled boolean not null default true;

comment on column public.campaigns.milestones is
  'Briefstufen, bei denen der Ersteller eine Meilenstein-Mail bekommt. Ueber der letzten Stufe keine Mails.';

comment on column public.campaigns.milestone_notified is
  'Zuletzt per Mail gemeldete Stufe. Bedingtes Update darauf dient als Claim gegen doppelte Mails.';

comment on column public.campaigns.milestone_mails_enabled is
  'Schalter des Erstellers fuer Meilenstein-Mails. Getrennt von milestones, damit die eigenen Stufen erhalten bleiben.';
