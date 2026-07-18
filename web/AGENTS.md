<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Web app orientation

- This is the active Next.js app for Brief nach Berlin. Run npm commands from `web/`.
- Main code lives in `src/app/`, reusable UI in `src/components/`, domain logic in `src/lib/`, data build scripts in `scripts/`, static/generated data in `data/`, and local Supabase SQL in `supabase/migrations/`.
- Use `npm run lint`, `npm run test`, and `npm run build` according to change risk. For routing, PLZ, prompt, or email changes, prefer the targeted Jest tests in `src/__tests__/` plus one relevant script or manual smoke check.
- Do not rely on model memory for Next.js APIs here. This repo uses Next.js 16; inspect the local docs or existing code before changing app-router, metadata, route handlers, or server/client boundaries.

## Product and UI rules

- The product must feel like a trustworthy German civic tool: clear, warm, direct, non-partisan, and low-friction. Do not turn utility flows into marketing sections.
- Before larger visual changes, read `../.planning/brand-identity.md`. Use the existing airmail/paper/green visual language and avoid party-coded primary colors.
- Keep mobile-first flows fast: Anliegen input, PLZ lookup, politician routing, letter generation, and final hand-copy instructions should stay reachable and readable on phone screens.
- For substantial UI work, use `frontend-design` or `design-taste-frontend`. Preserve accessibility basics, especially labels, focus states, reduced-motion safety, and readable contrast.

## Privacy, data, and side effects

- Treat user Anliegen, generated letters, email addresses, and feedback as sensitive. Do not add persistence, analytics events, logs, or prompt dumps for them without explicit approval and DSGVO review.
- Supabase migrations may exist locally without being applied remotely or recorded in migration history. Verify those states separately before reporting them as current.
- Brevo scripts and contact-status scripts can affect real people. Do not run send or mark-contacted workflows unless Thomas explicitly authorizes the exact batch/action.
- Mistral/Voxtral calls are external AI calls. Keep prompt changes reviewable and avoid sending unnecessary personal data.
