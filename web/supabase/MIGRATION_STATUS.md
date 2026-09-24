# Production migration status

| Migration | Production status | Evidence |
| --- | --- | --- |
| `022_campaign_topic_signals.sql` | Manually applied by Thomas on 2026-09-24 | Read-only PostgREST query for all five new `campaigns.topic_*` columns returned HTTP 200 with the app's service role on 2026-09-24. |

The `letter_signals_topic_source_check` constraint was part of the SQL Thomas applied, but its definition was not independently queried. Running SQL in the Supabase Dashboard does not automatically record the file in Supabase CLI migration history; that history remains unverified because the local CLI has no access token. Check the remote migration history before any future `supabase db push`.
