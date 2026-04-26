# Deferred items from 260426-c59

## Stale Vercel domain in SEO files (out of scope here)

`web/src/app/robots.ts` and `web/src/app/sitemap.ts` both hardcode
`https://brief-nach-berlin.vercel.app` as `BASE_URL`. This is an SEO bug —
search engines crawling the sitemap will index the Vercel URL instead of the
production `.de` domain.

This was discovered during the 260426-c59 stale-domain sweep but the plan
explicitly scoped the change to OG/share/email surfaces only ("other places
may legitimately still reference Vercel for deploy"). Fix in a follow-up
quick task: replace both with `https://brief-nach-berlin.de` (or import
`APP_URL` from `@/lib/config`).
