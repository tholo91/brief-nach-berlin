-- Migration 008: create the campaign foundation for creator-owned templates.
-- Apply manually in Supabase Studio SQL Editor against project brief-nach-berlin.
--
-- What this migration does:
--   1. Creates `campaigns` for the current public campaign record.
--   2. Creates `campaign_revisions` for immutable public-text snapshots.
--   3. Creates `campaign_tokens` for revocable, expirable creator access links.
--   4. Locks every table down: RLS enabled + forced, all grants revoked.
--
-- Privacy boundary:
--   - Only creator-authored campaign text is persisted here.
--   - Visitor-generated letters and visitor-edited campaign issue text are not stored.
--
-- Idempotent: safe to re-run.

create table if not exists public.campaigns (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                       text NOT NULL,
  creator_email              text NOT NULL,
  title                      text NOT NULL,
  issue_text                 text NOT NULL,
  description                text,
  creator_name               text,
  external_url               text,
  status                     text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft',
      'awaiting_email_verification',
      'active',
      'paused',
      'archived',
      'blocked'
    )),
  moderation_status          text NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_categories      text[] NOT NULL DEFAULT '{}',
  email_verified_at          timestamptz,
  activated_at               timestamptz,
  paused_at                  timestamptz,
  archived_at                timestamptz,
  last_published_revision_id uuid,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_slug_unique UNIQUE (slug),
  CONSTRAINT campaigns_slug_format CHECK (
    slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$'
  ),
  CONSTRAINT campaigns_creator_email_format CHECK (
    creator_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create table if not exists public.campaign_revisions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  snapshot_reason       text NOT NULL
    CHECK (snapshot_reason IN ('created', 'published', 'edited', 'activated')),
  title                 text NOT NULL,
  issue_text            text NOT NULL,
  description           text,
  creator_name          text,
  external_url          text,
  moderation_status     text NOT NULL
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_categories text[] NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_last_published_revision_fk;
ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_last_published_revision_fk
  FOREIGN KEY (last_published_revision_id)
  REFERENCES public.campaign_revisions(id)
  ON DELETE SET NULL;

create table if not exists public.campaign_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('verify_email', 'manage')),
  token_hash  text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_tokens_hash_length CHECK (char_length(token_hash) = 64)
);

CREATE INDEX IF NOT EXISTS campaign_revisions_campaign_created_idx
  ON public.campaign_revisions (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_tokens_campaign_kind_idx
  ON public.campaign_tokens (campaign_id, kind, created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_tokens_expires_at_idx
  ON public.campaign_tokens (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS campaign_tokens_active_hash_unique
  ON public.campaign_tokens (token_hash)
  WHERE used_at IS NULL;

ALTER TABLE public.campaigns enable row level security;
ALTER TABLE public.campaigns FORCE  ROW LEVEL SECURITY;
ALTER TABLE public.campaign_revisions enable row level security;
ALTER TABLE public.campaign_revisions FORCE  ROW LEVEL SECURITY;
ALTER TABLE public.campaign_tokens enable row level security;
ALTER TABLE public.campaign_tokens FORCE  ROW LEVEL SECURITY;

REVOKE ALL ON public.campaigns FROM anon;
REVOKE ALL ON public.campaigns FROM authenticated;
REVOKE ALL ON public.campaigns FROM PUBLIC;
REVOKE ALL ON public.campaign_revisions FROM anon;
REVOKE ALL ON public.campaign_revisions FROM authenticated;
REVOKE ALL ON public.campaign_revisions FROM PUBLIC;
REVOKE ALL ON public.campaign_tokens FROM anon;
REVOKE ALL ON public.campaign_tokens FROM authenticated;
REVOKE ALL ON public.campaign_tokens FROM PUBLIC;
