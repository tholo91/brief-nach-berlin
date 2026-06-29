-- Migration 010: add optional campaign logos.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- Stores only the Supabase Storage object path in `campaigns.logo_path`.
-- The bucket is public so campaign pages can render small trust logos without
-- signed URLs.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS logo_path text;

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_logo_path_length;
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_logo_path_length
  CHECK (logo_path IS NULL OR char_length(logo_path) <= 500);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-logos',
  'campaign-logos',
  true,
  524288,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
