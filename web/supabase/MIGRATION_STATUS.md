# Production migration status

| Migration | Production status | Evidence |
| --- | --- | --- |
| `022_campaign_topic_signals.sql` | Manually applied by Thomas on 2026-09-24 | Read-only PostgREST query for all five new `campaigns.topic_*` columns returned HTTP 200 with the app's service role on 2026-09-24. |
| `023_campaign_fixed_recipient.sql` | Manually applied by Thomas (confirmed by Thomas on 2026-10-07) | On 2026-09-29 a read-only PostgREST query for `campaigns.target_recipient` still returned `42703`; Thomas confirmed on 2026-10-07 that fixed-recipient campaigns work in production. Not independently re-queried. |
| `024_campaign_landing_rank.sql` | Manually applied by Thomas (confirmed by Thomas on 2026-10-07) | Confirmed by Thomas; not independently queried. |
| `025_reviews_campaign_slug.sql` | Manually applied by Thomas (confirmed by Thomas on 2026-10-08) | Thomas ran it in the SQL Editor without errors; not independently queried. Code that writes `reviews.campaign_slug` is committed but not yet deployed. Backfill UPDATE re-run by Thomas on 2026-10-08 after deploy; a read-only service-role query afterwards found 0 reviews without slug whose `letter_signals` row has one. |
| `026_campaign_ends_at.sql` | Manually applied by Thomas on 2026-10-08 | Read-only PostgREST query for `campaigns.ends_at` returned rows on 2026-10-08. Thomas ran `pg_get_functiondef(...) like '%ends_at%'` for `increment_letter_counters` in the SQL Editor: true. |
| `028_reviews_age_group.sql` | Not yet applied | Must run in the Supabase SQL Editor before deploying the code that writes `reviews.age_group`, otherwise every full review upsert fails. |
| `029_campaign_creator_surveys.sql` | Not yet applied | Run in the Supabase SQL Editor only after Thomas' OK. Until then `getCreatorSurveyStatus` returns `unavailable`: no card, no nav item, the feedback page redirects; code is safe to deploy before the migration. |

The `letter_signals_topic_source_check` constraint was part of the SQL Thomas applied, but its definition was not independently queried. Running SQL in the Supabase Dashboard does not automatically record the file in Supabase CLI migration history; that history remains unverified because the local CLI has no access token. Check the remote migration history before any future `supabase db push`.
