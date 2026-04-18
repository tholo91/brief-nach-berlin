---
created: 2026-04-18T21:16:43.181Z
title: Feedback + letter quality collection without breaking privacy promise
area: general
files:
  - web/src/lib/email/buildEmailHtml.ts
  - web/src/components/wizard/Step3Success.tsx
  - web/src/app/datenschutz/page.tsx
---

## Problem

To improve letter quality (few-shot examples in the Mistral prompt) and learn which letters users actually mail, we need some form of persistent feedback or letter retention. But right now Brief-nach-Berlin genuinely stores nothing — email captured, letter sent via Brevo, both discarded. That "wir speichern nichts" is a credible trust signal Thomas wants to keep as a public promise and competitive differentiator.

The whole architecture today reinforces this: no database, no accounts, no cookies, no analytics. Any storage we add must be either completely opt-in, aggregate-only, or outsourced — anything else erodes the promise.

## Solution

Decide *before* writing storage code which of these options fits the trust strategy:

1. **Email-based feedback (zero storage):** Add "War dieser Brief hilfreich? [Ja] / [Nein]" mailto links in the outgoing email + success page. Prefilled subject lets Thomas triage in his inbox. No server-side storage.
2. **Anonymous click-through counter (aggregate only):** "👍 Brief war gut" link in email hits a stateless endpoint that increments a counter in Vercel KV. Stores only {rating, timestamp} — no letter content, no email.
3. **Opt-in letter sharing (explicit consent):** Default-off checkbox after generation: "Darf ich diesen Brief anonymisiert verwenden, um Brief-nach-Berlin zu verbessern?" Store only opt-in letters. Requires Datenschutz update.
4. **surv.ai integration:** Already in backlog as phase 999.1. Outsources feedback to surv.ai; user consents to their collection, our server stays data-free.

Recommended phased path:
- **Phase A (now, no infra):** Option 1 (mailto feedback) + Option 2 (anon counter via Vercel KV) + a "Was wir (nicht) speichern" section on the landing page that leans into the trust signal.
- **Phase B (after ~20 letters/week):** Option 3 (opt-in sharing) with explicit consent copy. Collect 10–20 good letters, anonymise, curate into few-shot examples.
- **Phase C:** If 999.1 (surv.ai) ships, route richer feedback there.

Deliverables for this story:
- Decision on which option(s) to build first
- Exact German consent + Datenschutz wording
- Storage backend choice (Vercel KV vs. static JSON vs. third-party)
- Explicit answer to: is storing *anything* acceptable within our trust-signal strategy?

Landing-page copy upgrade to ship alongside: "Wir speichern nichts. Keine Briefe, keine Postleitzahlen, keine E-Mails über den Versand hinaus. Keine Cookies, keine Tracker, keine Datenbank. Das ist kein Marketing — das ist unsere Architektur."
