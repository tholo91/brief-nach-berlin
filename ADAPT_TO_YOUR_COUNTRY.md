# Adapt Brief nach Berlin to another country

This guide is written for an LLM, coding agent, or AI-assisted builder working
inside a fork of `https://github.com/tholo91/brief-nach-berlin`.

The goal is not to translate a German website. The goal is to create a small,
credible local version that helps people contact the right political office in
their own country.

## 1. First instruction for the agent

Before changing code, create a plan.

Recommended first prompt:

```text
You are working in a fork of https://github.com/tholo91/brief-nach-berlin.

First read:
- README.md
- ADAPT_TO_YOUR_COUNTRY.md
- web/src/lib/generation/generateLetter.ts
- web/src/lib/lookup/plzLookup.ts
- web/src/lib/config.ts
- web/src/lib/contact.ts

Goal:
Create LOCAL_ADAPTATION_PLAN.md for adapting this project to [COUNTRY/REGION].

Use the GSD framework if available:
https://github.com/gsd-build/get-shit-done

If GSD is not available, create the same structure manually.

The plan must include:
- MUST / SHOULD / OPTIONAL tasks
- local data requirements
- representative lookup strategy
- AI provider setup
- output language and official-language decisions
- email setup
- domain setup
- design localization
- political letter prompt changes
- local validation test cases

Do not start coding yet.
```

If you use GSD, treat this as the first planning phase. If you do not use GSD,
ask your coding agent to produce the same structured plan manually.

## 2. The smallest useful fork

Do not copy the full German site first.

For a first local MVP, keep only:

1. Homepage with the input entry point
2. Wizard: location, email, issue, representative selection
3. Letter generation with Mistral or another LLM provider
4. Email delivery with the letter, address, and next steps
5. Privacy, legal notice, and a short local explanation of why letters work

Everything else is optional at the start: campaigns, reviews, press pages,
roadmap pages, long SEO pages, German political background pages, follow-up
emails.

## 3. What must be checked locally

The riskiest part is not the AI. The riskiest part is sending someone to the
wrong representative, office, or political level.

The local owner must answer:

- Which political level does the MVP cover first?
- Is a postal code enough, or do you need constituency, municipality, region, or
  full address?
- Which reliable data source provides representatives, parties, offices, and
  constituencies?
- What license does that data have?
- Are representatives directly elected, list-based, or both?
- Can multiple representatives be responsible for one place?
- Which office should receive the letter: local office, parliamentary office,
  party group, ministry, municipality?
- Which form of address is normal and respectful?
- Which output language should the letter use?
- Does the country have multiple official languages or relevant language
  regions?
- What must the privacy and legal text say locally?

If only one thing is done carefully: make sure the tool never shows the wrong
recipient as if it were certain.

## 4. Files the agent will probably touch

### Must inspect

| Area | Files | Why |
| --- | --- | --- |
| App name, domain, contact | `web/src/lib/config.ts`, `web/src/lib/contact.ts` | Name, URL, founder contact, share text |
| AI provider | `web/src/lib/mistral.ts`, `web/.env.example` | Mistral is recommended, but replaceable |
| Letter prompt | `web/src/lib/generation/generateLetter.ts` | Output language, tone, address, political incentives |
| Location lookup | `web/src/lib/lookup/plzLookup.ts` | Connects user input to representatives |
| Data model | `web/src/lib/types/politician.ts`, `web/src/lib/types/wizard.ts` | Fields for representative, constituency, office, level |
| Validation | `web/src/lib/validation/wizardSchemas.ts` | German five-digit postal codes are hard-coded |
| Data files | `web/data/plz-wahlkreis-mapping.json`, `web/data/politicians-cache.json` | Local mapping and representative cache |
| Data scripts | `web/scripts/fetch-politician-data.ts`, `web/scripts/parse-plz-mapping.ts` | Generate local JSON data |
| Homepage and wizard copy | `web/src/components/Hero.tsx`, `web/src/components/wizard/*` | First user-facing German assumptions |
| Email | `web/src/lib/email/sendLetterEmail.ts`, `web/src/lib/email/buildEmailHtml.ts` | Sender, address, postage or sending instructions |
| Legal pages | `web/src/app/(site)/datenschutz/page.tsx`, `web/src/app/(site)/impressum/page.tsx` | Must be rewritten locally |

### Usually inspect

| Area | Files | Why |
| --- | --- | --- |
| Layout and metadata | `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/sitemap.ts` | SEO, language, structured data |
| Header and footer | `web/src/components/Header.tsx`, `web/src/components/Footer.tsx`, `web/src/components/AppHeader.tsx`, `web/src/components/AppFooter.tsx` | Navigation and project links |
| Political context | `web/src/lib/enrichment/fetchMdbContext.ts` | Currently uses German sources and stopwords |
| Speech input | `web/src/app/api/transcribe/route.ts` | Transcription currently assumes German |
| Location display | `web/src/components/wizard/Step1Form.tsx` | Uses German OpenPLZ lookup |
| Tests | `web/src/__tests__/*`, `web/scripts/test-*.ts` | Replace German fixtures |

### Optional for a quick MVP

- Campaigns: `web/src/components/campaigns/*`, `web/src/app/(site)/kampagne*`
- Reviews and feedback pages
- Roadmap and follow-up emails
- Press/story pages
- German SEO pages such as `guide`, `tipps`, `warum-ein-brief`,
  `wahlkreisbuero-oder-berlin`, `kommune-land-bund-eu`

## 5. AI provider and language

Brief nach Berlin uses Mistral AI because it is a European provider, works well
for German, and is practical for this civic use case. Mistral is recommended, not
required.

If another LLM provider is better for the country, language, privacy situation,
or budget, replace the adapter cleanly. Do not only rename the API key.

Check:

- `web/src/lib/mistral.ts`: provider, model names, retry behavior
- `web/src/lib/generation/generateLetter.ts`: output language, local letter
  culture, political levels, parties, date format
- `web/src/app/api/transcribe/route.ts`: speech transcription language
- `web/src/app/layout.tsx`: HTML language and structured data
- `web/src/lib/validation/wizardSchemas.ts`: user input format and errors

Multilingual countries need an explicit decision. For many MVPs, one main
language is enough. For countries like Switzerland, Belgium, Canada, or other
multilingual systems, decide:

- What is the default language?
- Can the app infer language region from postal code, canton, municipality, or
  user selection?
- Can the user choose the letter language?
- Do forms of address, institutions, and legal terms differ by language?
- Can representatives receive letters in more than one language?

Pragmatic MVP rule: ship one language properly before offering four weakly
translated languages.

## 6. Mistral, Brevo, and domain setup

### Mistral

Setup checklist:

1. Create a Mistral AI Studio account.
2. Activate API access and create an API key.
3. Set `MISTRAL_API_KEY=` in `web/.env.local`.
4. Set the same key in the hosting environment.
5. Check the model in `web/src/lib/mistral.ts`.
6. Check the prompt in `web/src/lib/generation/generateLetter.ts`.
7. Set a small budget or usage limit before real users arrive.

Cost assumption: for a normal letter, expect roughly 1 to 2 cents per letter
generation. This is only an MVP estimate. Real cost depends on model, prompt
length, answer length, and current Mistral pricing. Always check current pricing
and set a limit before launch.

If speech input stays enabled, estimate transcription separately. Audio can cost
more than text generation depending on provider and length.

### Brevo

Brevo is a good Europe-first choice for transactional email. The free plan is
often enough for a small MVP because Brevo currently allows up to 300 emails per
day after account approval. Check current limits before launch.

Setup checklist:

1. Create a Brevo account.
2. Verify sender address or sender domain.
3. Create a Transactional Email API key.
4. Set `BREVO_API_KEY=` and `BREVO_SENDER_EMAIL=`.
5. Add SPF, DKIM, and DMARC DNS records at the domain provider.
6. Send a real test letter to yourself.
7. Check inbox and spam placement.

For the MVP, keep email simple: send the letter, address, and next steps.
Newsletter, automation, and CRM features are optional.

### Domain and hosting

Vercel is the simplest default because this is a Next.js app. Other hosts are
fine.

Setup checklist:

1. Import the forked repository into Vercel.
2. Check build settings for the `web` folder.
3. Set all environment variables in the Vercel project.
4. Add the custom domain in Vercel.
5. Add the DNS records shown by Vercel at the domain provider.
6. Usually: apex domain via `A` record, `www` via `CNAME`. Use the exact values
   Vercel shows for the project.
7. Wait until DNS and SSL are active.
8. Change `APP_URL` in `web/src/lib/config.ts`.
9. Update contact and sender data in `web/src/lib/contact.ts` and Brevo.

If you want email addresses on the same domain, configure a mail provider with
MX records. That is separate from website DNS.

Useful provider docs:

- Mistral API and keys: https://docs.mistral.ai/
- Mistral models: https://docs.mistral.ai/models/overview
- Brevo pricing and free plan: https://www.brevo.com/pricing/
- Vercel domains and DNS: https://vercel.com/docs/domains

## 7. Local design and political incentives

Do not copy the German look. Copy the principle.

The current design is inspired by a German children's-book and letter-writing
feeling: warm, civic, postal, slightly nostalgic. That may work in Germany. It
may feel strange, childish, or politically misplaced elsewhere.

The local agent should answer:

- Which visual references create trust locally?
- Does a postal, civic, public-service, newspaper, schoolbook, or institutional
  style fit the country?
- Which colors or symbols feel partisan, state-run, activist, childish, or
  unserious?
- Should the product feel official, friendly, activist, neutral, local, or
  editorial?
- Which examples make the tool feel local without becoming party-political?

The letter prompt also needs local political logic. A good letter is not just
polite. It should match the incentives of the person receiving it.

Research:

- Are representatives elected by constituency, list, party, region, or mixed
  systems?
- Do they care most about local voters, committee work, media pressure, party
  leadership, district offices, or casework?
- Is direct citizen contact normal or unusual?
- Which tone is effective: formal, direct, diplomatic, emotional, factual,
  solution-oriented?
- What would make a letter counterproductive in that political culture?

Optional research prompt:

```text
Analyze [COUNTRY/REGION] and explain which incentives make representatives
respond to citizen letters.

Cover:
- electoral system and constituency logic
- committee or office responsibilities
- local political communication culture
- normal forms of address and formality
- issues that representatives realistically answer
- tones that would reduce credibility

Turn the findings into concrete rules for web/src/lib/generation/generateLetter.ts.
```

## 8. Recommended implementation order

1. Fork the project and run it locally.
2. Create `LOCAL_ADAPTATION_PLAN.md`.
3. Choose one political level for the MVP.
4. Define default language and any official-language rules.
5. Choose AI provider: Mistral recommended, not required.
6. Choose mail provider: Brevo recommended, not required.
7. Find reliable representative data and check the license.
8. Manually create 5 to 20 test representatives.
9. Build a small mapping for one pilot region.
10. Adapt lookup, validation, and UI copy.
11. Rewrite the letter prompt for local political incentives.
12. Adapt design, name, imagery, and trust signals.
13. Configure domain, email, and environment variables.
14. Test with 10 to 20 real local people.
15. Only then expand SEO pages, campaigns, and extra features.

## 9. Validation tests before launch

Create at least:

- 3 normal locations with one clear representative
- 2 edge cases with multiple possible representatives
- 2 invalid inputs
- 1 representative without a clear address
- 1 issue that belongs to another political level
- 1 very short issue text
- 1 emotional or angry issue text
- 1 test in each supported output language
- 1 audio input if speech stays enabled
- 1 delivered email test to a real inbox
- 1 domain and SSL test on production

Each test should answer:

- Is the right representative shown?
- Is uncertainty shown honestly?
- Does the letter sound natural locally?
- Is the output language correct?
- Is the address practically usable?
- Does the user know what to do next?

## 10. What not to do

- Do not translate every German page before testing the core flow.
- Do not pretend a postal-code lookup is certain if the local system is more
  complex.
- Do not keep German legal text.
- Do not keep the German design if it feels foreign locally.
- Do not generate generic petition language.
- Do not start coding before the local data and political logic are understood.

## 11. When to contact Thomas

Send a short message if you:

- want to build a real local version
- found reliable data sources
- are unsure how to structure the mapping
- want context on technical decisions
- have first test results from local users

Most useful email:

- country or region
- first political level
- representative data source
- territory or postal-code mapping source
- whether you can build, validate data, or organize tests
