---
gsd_state_version: "1.0"
milestone: v1.0
current_phase: 05
status: verifying
stopped_at: Completed 05-04-PLAN.md
last_updated: "2026-10-28T09:41:02.725Z"
last_activity: 2026-10-28
last_activity_desc: Quick 261013-wuq lokal implementiert und geprüft; manueller Release offen
state_head: 221d4773c0eaa2507339b6251d08f258767db43d
progress:
  total_phases: 33
  completed_phases: 4
  total_plans: 22
  completed_plans: 15
  percent: 68
milestone_name: milestone
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-10)

**Core value:** A frustrated citizen can go from "this is broken" to "here's a letter to the person who can fix it" in under 3 minutes — with zero political knowledge required.
**Current focus:** Betriebs- und Produktprüfung nach dem Land-/Kommune-Rollout

## Current Truth Audit (2026-07-20)

Der aktuelle `main`-Stand ist die Quelle der Wahrheit; ältere Roadmap-Checkboxen und Pending-Todos sind nicht automatisch offen. Im Code und in den Tests bereits vorhanden sind:

- Land-/Kommune-Level-Routing mit Ebenen-Auswahl, Landesregierung als institutionellem Land-Empfänger, Rathaus-Flow und Kampagnen-Ziel-Ebene.
- Level-spezifische Brief- und E-Mail-Logik einschließlich Betreff für Land, Landesregierung und Rathaus.
- Creator-Kampagnen inklusive öffentlicher Prefill-Seite, Verwaltung sowie Pause/Archivierung.
- 24 Jest-Suites / 220 Tests grün am 2026-07-20.

Für die nächste Arbeit bleiben vor allem diese Punkte belastbar offen:

1. Land-Rollout verifizieren: 16 Landtag-Adressen, `ROUTING_TOKEN_SECRET`, Feature-Flag-Smoke-Test, Cache-Fetch-Monitoring und veraltete PLZ-Fixtures.
2. Land-Empfängerentscheidung abschließen: institutionelle Landesregierung als Standard gegen MdL-/Ausschussauswahl begründen und den aktuellen Personenlisten-Flow entsprechend weiterführen oder bewusst stoppen.
3. Variant-Flow level-aware machen: politische Ebene aus der Erst-Mail mitgeben und das Kommune-Framing ohne „Wahlkreis“ halten.
4. Den offenen Capture `fav=...` prüfen/umsetzen: URL-Parteipräferenzen existieren im aktuellen Code noch nicht.

Der level-aware E-Mail-Betreff ist dagegen bereits implementiert und getestet; das zugehörige Pending-Todo ist veraltet.

## Current Position

Phase: 05 — EXECUTING
Plan: 4 of 4
Status: Phase complete — ready for verification
Last activity: 2026-10-28 - Completed quick task 261028-enu: Erstschreiber-Frage im Feedback-Formular mit Auswertung

Progress: [███████░░░] 68%

## Current Implementation Notes

- Landing is now the practical first issue step: `Hero.tsx` renders `Step2Issue variant="landing"` and sends the issue to `/app` through `wizard-handoff.ts`.
- Wizard step 1 is now review/tone confirmation for a prefilled issue when arriving from the Landing. It is not a blank first contact in the common flow.
- The Landing issue draft survives browser-back through `landing-draft.ts` and is cleared after successful send in `WizardShell`.
- The Landing-to-Wizard field morph is implemented with the current View Transition path. Future 999.6 routing prefetch must not block that morph or add a visible intermediate step.
- Phase 999.6 plans were amended on 2026-06-26 so `routeToLevel` prefetch starts at Landing submit and is passed forward only as a signed, issue-hash-bound token.

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: 10.5 min
- Total execution time: 21 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 03 | 3 | - | - |
| 05 | 2 | 21 min | 10.5 min |

**Recent Trend:**

- Last 5 plans: 05-01, 05-02
- Trend: Phase 5 started

*Updated after each plan completion*
| Phase 05 P02 | 12 min | 3 tasks | 7 files |
| Phase 05 P03 | 4 min | 3 tasks | 6 files |
| Phase 05 P04 | 6min | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: PLZ-to-Wahlkreis preprocessing (shapefile → static JSON) placed in Phase 1 as data infrastructure prerequisite
- Roadmap: Abgeordnetenwatch cache build placed in Phase 1 alongside data prep
- Roadmap: Content safety (SAFE-01..03) placed in Phase 2 — must exist before any letter can be generated or shown
- Phase 05-01: Campaign access uses random DB-backed token hashes, not stateless feedback HMAC links.
- Phase 05-01: `markPaid` currently advances draft campaigns to awaiting_email_verification without adding payment columns because Stripe/payment is deferred.
- Phase 05-01: Management sessions are short-lived HttpOnly cookies signed server-side and scoped to `/kampagne`.
- 05-02: Stripe/payment stayed out of the creator flow; draft creation advances directly to email verification for validation.
- 05-02: Verification links are one-time tokens; reused or expired links return status without duplicate management emails.
- 05-02: Management token creation and email delivery are implemented, while the management UI remains for the later creator-management plan.
- 05-03: Public campaign pages load active campaigns only via `getActiveCampaignBySlug`; invalid, paused, archived, draft, blocked, and missing slugs return `notFound()`.
- 05-03: Campaign visitor issue text uses the existing sessionStorage wizard handoff, not URL text parameters.
- 05-03: Campaign drafts are namespaced by slug so campaign pages do not collide with the generic landing draft.
- 05-04: Creator management remains a single no-account page gated by emailed manage tokens and the existing short-lived management cookie.
- 05-04: Pause and archive are status transitions only; public routes serve active campaigns only.

### Roadmap Evolution

- Phase 4 added: Stadtstaaten PLZ-Wahlkreis Genauigkeit und Wahlkreis-Gruppierung im Wizard (user-reported defect, Matthias 2026-05-27 — Stadtstaat PLZs surface 3-4 neighbouring Wahlkreise; fix = PLZ-polygon ∩ Wahlkreis-polygon intersection + group results by Wahlkreis in wizard)
- Phase 5 added: Creator-Paid Brief Templates & Shareable Prefilled Pages (creator-owned no-login template pages with moderated prefill, share links, and frozen/archiveable versions)

### Pending Todos

35 pending — see `.planning/todos/pending/`

### Blockers/Concerns

- Phase 1: No official PLZ-to-Wahlkreis CSV exists. Bundeswahlleiter shapefiles require preprocessing. Script must be written and validated before Phase 2 can proceed.
- Phase 1: Landing page structure (Hero, HowItWorks, etc.) exists in /web but LAND-03 (letter counter) requires real data — placeholder acceptable for Phase 1, real data in v2.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260426-c59 | Polish letter email + kill em dashes + warmer share copy + OG fix | 2026-04-26 | 30b1d14 | [260426-c59-polish-letter-email-kill-em-dashes-warme](./quick/260426-c59-polish-letter-email-kill-em-dashes-warme/) |
| 260511 | Retry Mistral on transient errors, surface 503 as specific user message | 2026-05-11 | 3a562ec | [260511-mistral-retry-backoff](./quick/260511-mistral-retry-backoff/) |
| 260511-wgf | Firefox hero video fallback - add WebM source, loop, preload | 2026-05-11 | db9524b | [260511-wgf-firefox-hero-video-fallback-add-webm-sou](./quick/260511-wgf-firefox-hero-video-fallback-add-webm-sou/) |
| 260512-vco | Stichpunkte-Botschaft auf Landingpage + Wizard klarstellen (User-Feedback) | 2026-05-12 | 43e8d07 | [260512-vco-stichpunkte-copy-clarification](./quick/260512-vco-stichpunkte-copy-clarification/) |
| 260521-tn1 | Review-Lernschleife: Chips, Anti-Halluzination, Length-Korridor, Wiederholungs-Fix | 2026-05-21 | 1a9e8e3 | [260521-tn1-review-lernschleife-chips-anti-halluzina](./quick/260521-tn1-review-lernschleife-chips-anti-halluzina/) |
| 260522-k6t | Reviews-Seite /stimmen bauen mit reusable Komponenten | 2026-05-22 | (post-merge) | [260522-k6t-reviews-seite-stimmen-bauen-mit-reusable](./quick/260522-k6t-reviews-seite-stimmen-bauen-mit-reusable/) |
| 260522-u2u | /stimmen Polish: Reviews-Filter ab 2026-05-21, Karten uniform, Copy/Captions | 2026-05-22 | b628913 | [260522-u2u-stimmen-polish-reviews-filter-ab-2026-05](./quick/260522-u2u-stimmen-polish-reviews-filter-ab-2026-05/) |
| 260522-upk | /stimmen Editorial Polish: eyebrows, signed close, FAQ intro, list, standfirst | 2026-05-22 | fb35a26 | [260522-upk-stimmen-editorial-polish-eyebrows-signed](./quick/260522-upk-stimmen-editorial-polish-eyebrows-signed/) |
| 260522-v52 | /stimmen Hero-Note + Datums-Korrektur: Mitte Mai 2026, 350+ Briefe | 2026-05-22 | bd4e181 | [260522-v52-stimmen-hero-note-datums-korrektur-mitte](./quick/260522-v52-stimmen-hero-note-datums-korrektur-mitte/) |
| 260523-e8o | Switch von "wir" auf "ich" über Landing + Subpages, plus Mithelfen-Block auf /was-noch-kommt und /stimmen | 2026-05-23 | a9b7c5a | [260523-e8o-switch-wir-auf-ich-ber-landing-und-subpa](./quick/260523-e8o-switch-wir-auf-ich-ber-landing-und-subpa/) |
| 260523-n2a | /stimmen dynamic letter count + consolidate Mithelfen and Sign-off (hide email) | 2026-05-23 | d20ca74 | [260523-n2a-stimmen-dynamic-letter-count-consolidate](./quick/260523-n2a-stimmen-dynamic-letter-count-consolidate/) |
| 260523-pph | /stimmen sign-off copy + /brief-verbessern mobile copy button + bold prompt anchors | 2026-05-23 | ff75d77 | [260523-pph-stimmen-sign-off-copy-brief-verbessern-m](./quick/260523-pph-stimmen-sign-off-copy-brief-verbessern-m/) |
| 260526-u4r | /stimmen: swipeable reviews on touch + hide reviews below 3 stars | 2026-05-26 | 35a98a3 | [260526-u4r-stimmen-swipe-and-filter](./quick/260526-u4r-stimmen-swipe-and-filter/) |
| 260527-fast | Hero sub-headlines 5→4 + Art. 17 GG variant (inspired by liebemdb competitor analysis) | 2026-05-27 | b29e24c | (gsd-fast, no PLAN.md) |
| 260527-wu1 | Subpage /was-bisher-geschah: kuratiertes, monatsgruppiertes Fortschritts-Log aus Git-Historie + Footer-Link + Sitemap | 2026-05-27 | 27a7557 | [260527-wu1-subpage-was-bisher-geschah-kuratiertes-f](./quick/260527-wu1-subpage-was-bisher-geschah-kuratiertes-f/) |
| 260527-m36 | E-Mail Footer MdB-Link inline + Resend mit Debug & Sterne vereinheitlichen | 2026-05-27 | 755b077 | [260527-m36-e-mail-footer-mdb-link-inline-resend-mit](./quick/260527-m36-e-mail-footer-mdb-link-inline-resend-mit/) |
| 260530-kk4 | Mistral model migration: centralize IDs + URGENT voxtral swap + switch letter gen to small+reasoning_effort=high | 2026-05-30 | ac5b9d3 | [260530-kk4-mistral-model-migration-centralize-ids-i](./quick/260530-kk4-mistral-model-migration-centralize-ids-i/) |
| 260601-jts | PLZ-Ort-Anzeige unter dem PLZ-Inputfeld in Step1Form.tsx | 2026-06-01 | 98f50bb | [260601-jts-plz-ort-anzeige-unter-dem-plz-inputfeld-](./quick/260601-jts-plz-ort-anzeige-unter-dem-plz-inputfeld-/) |
| 260610-jal | PLZ-Lookup vor Rate-Limit ziehen: plz_not_found verbraucht keinen Email-Token mehr (kein Self-Lockout bei Tippfehler/Listen-Wahlkreis) | 2026-06-10 | (pending) | [260610-jal-rate-limit-after-plz-lookup](./quick/260610-jal-rate-limit-after-plz-lookup/) |
| 260621-og8 | Dritte/letzte Follow-up-Mail (Last-Call, followup-3m): MdB-Reaktion + Story-Sharing via heyspeak/Mail, Versand-Script + Skill | 2026-06-21 | dba21c4 | [260621-og8-letzte-lastcall-followup-mail](./quick/260621-og8-letzte-lastcall-followup-mail/) |
| 260625-9at | E-Mail-Adresse aus Hardcoding befreien — THOMAS_MAIL env var (contact.ts, config.ts, 7 Dateien) | 2026-06-25 | 6fa05fc | [260625-9at-email-hardcoding-env-var](./quick/260625-9at-email-hardcoding-env-var/) |
| 260625-w13 | Voice-Flag (usedSpeechToText) durch Landing→Wizard-Handoff reichen — Debug-Link meldete Voice immer false | 2026-06-25 | 5e5acbe | [260625-w13-voice-flag-usedspeechtotext-geht-beim-la](./quick/260625-w13-voice-flag-usedspeechtotext-geht-beim-la/) |
| 260625-wh4 | Debug-Readout schlanker: Anliegen-Auszug 300→600 Zeichen, Issue-text-words-Zeile raus | 2026-06-25 | b6c1410 | [260625-wh4-debug-readout-schlanker-input-cap-600-is](./quick/260625-wh4-debug-readout-schlanker-input-cap-600-is/) |
| 260625-skh | Landing-Anliegen übersteht Browser-Zurück: per-Tab sessionStorage-Draft (lib/landing-draft.ts), Restore in Step2Issue, Clear nach Versand in WizardShell | 2026-06-25 | 99ddfac | [260625-skh-landing-anliegen-ueberlebt-browser-zurue](./quick/260625-skh-landing-anliegen-ueberlebt-browser-zurue/) |
| 260625-wko | Log-Observability fetchMdbContext: 404→no_poll_results info statt api_error warning, Log-Label politicianId→mandateId | 2026-06-25 | cb1d15b | [260625-wko-log-observability-fetchmdbcontext-404-al](./quick/260625-wko-log-observability-fetchmdbcontext-404-al/) |
| 260626-0cz | View-Transition-Morph fürs Anliegen-Feld Landing→Wizard (nativer VT-Flag + geteilter view-transition-name, graceful degradation) | 2026-06-26 | 96969f6 | [260626-0cz-vt-morph-anliegenfeld](./quick/260626-0cz-vt-morph-anliegenfeld/) |
| 260626-h4r | Hero verschlanken + 2-zeiliges Anliegen-Feld, laengere Placeholder, Reassurance in "So einfach geht's" | 2026-06-26 | (pending) | [260626-h4r-hero-vereinfachen-2zeiliger-input](./quick/260626-h4r-hero-vereinfachen-2zeiliger-input/) |
| 260628-ta0 | Marken-Entity-Schema Organization und WebSite JSON-LD im Next Root-Layout ergänzen | 2026-06-28 | 09bf448 | [260628-ta0-marken-entity-schema-organization-und-we](./quick/260628-ta0-marken-entity-schema-organization-und-we/) |
| 260707-vrt | No-Storage-Flow zum Anpassen bestehender Briefentwürfe | 2026-07-07 | 2e6cc60 | [260707-vrt-briefvariante-no-storage-flow](./quick/260707-vrt-briefvariante-no-storage-flow/) |
| 260707-uhp | Improve brief variant tone adjustment debug payload and prompt | 2026-07-07 | 985c86c | [260707-uhp-improve-brief-variant-tone-adjustment-de](./quick/260707-uhp-improve-brief-variant-tone-adjustment-de/) |
| 260710-dgq | Kampagnen-Ziel-Ebene Bund/Landtag: targetLevel+targetState, Creator-Formular, Wizard-Skip des Ebene-Steps, PLZ-Mismatch-Fallback, Landtagskampagne-Pill | 2026-07-10 | 6416a1a | [260710-dgq-kampagnen-ziel-ebene-bund-landtag-target](./quick/260710-dgq-kampagnen-ziel-ebene-bund-landtag-target/) |
| 261008-n29 | S1 Reviews kennen ihre Kampagne (reviews.campaign_slug, Migration 025) | 2026-10-08 | 7c4ca49 | [261008-n29-s1-reviews-kennen-ihre-kampagne-reviews-](./quick/261008-n29-s1-reviews-kennen-ihre-kampagne-reviews-/) |
| 261008-xfr | Kampagne übertragen als Link + Dialog, Archivieren mit Bestätigung | 2026-10-08 | (pending) | [261008-xfr-uebertragen-als-dialog](./quick/261008-xfr-uebertragen-als-dialog/) |
| 261008-n4c | Kampagnen S6: Spendenbox in Ersteller-Mails (persönliche Einladung mit Foto, Buttons im Verwaltungszugang, Thomas schreiben, Footer-Links) | 2026-10-08 | 10e3a71 | [261008-n4c-kampagnen-s6-spendenbox-in-verwalten-mai](./quick/261008-n4c-kampagnen-s6-spendenbox-in-verwalten-mai/) |
| 261008-n3g | Kampagnen S2: Ablaufdatum und Beendet-Ansichten | 2026-10-08 | 57aa3c4 | [261008-n3g-kampagnen-s2-ablaufdatum-und-beendet-ans](./quick/261008-n3g-kampagnen-s2-ablaufdatum-und-beendet-ans/) |
| 261008-s1m | Topic-Labels: Whitelist durch Blocklist ersetzen (STORY 261007-topic-labels-blocklist) | 2026-10-08 | 56a9583 | [261008-s1m-topic-labels-whitelist-durch-blocklist-e](./quick/261008-s1m-topic-labels-whitelist-durch-blocklist-e/) |
| 261008-rvm | Kampagnen S3: Ersteller-Stats und Spendenkarte auf Verwalten | 2026-10-08 | 01909e0 | [261008-rvm-kampagnen-s3-ersteller-stats-und-spenden](./quick/261008-rvm-kampagnen-s3-ersteller-stats-und-spenden/) |
| 261008-t65 | Kampagne verwalten Redesign: Bild rund im Kopf, Teilen-Karte, eingeklapptes Formular | 2026-10-08 | 1df5ebc | [261008-t65-kampagne-verwalten-redesign-bild-rund-im](./quick/261008-t65-kampagne-verwalten-redesign-bild-rund-im/) |
| 261008-ngo2 | NGO-Seite: alle laufenden Kampagnen, Liste zweispaltig | 2026-10-08 | (pending) | [261008-ngo-liste-zweispaltig](./quick/261008-ngo-liste-zweispaltig/) |
| 261008-vqh | Kampagne verwalten: Einstellungen im Aufklapper, Kurzlinks, Moin-Header, Herz-Button | 2026-10-08 | (this commit) | [261008-vqh-kampagne-verwalten-feinschliff-moin-kurz](./quick/261008-vqh-kampagne-verwalten-feinschliff-moin-kurz/) |
| 261008-vx5 | Kampagne verwalten: Herkunft nach Bundesland, Verlauf, weitere Creator-Stats | 2026-10-08 | b3c819d | [261008-vx5-kampagne-verwalten-herkunft-nach-bundesl](./quick/261008-vx5-kampagne-verwalten-herkunft-nach-bundesl/) |
| 261009-dl0 | Kampagne verwalten: Bundesländer-Karte, Sprungleiste, Fußnoten gebündelt, Karte auf /stats | 2026-10-09 | 634c338 | [261009-dl0-kampagne-verwalten-bundeslaender-karte-s](./quick/261009-dl0-kampagne-verwalten-bundeslaender-karte-s/) |
| 261009-jb1 | Verlauf Tage statt Wochen ab Tag 3 und kuerzere Kampagnenlinks | 2026-10-09 | 5efd543 | [261009-jb1-verlauf-tage-statt-wochen-ab-tag-3-und-k](./quick/261009-jb1-verlauf-tage-statt-wochen-ab-tag-3-und-k/) |
| 261009-jv4 | Debug-Link verbessern: Routing, Mismatch, Code-Version, Anliegen 2000 Zeichen | 2026-10-09 | b96de3b | [261009-jv4-debug-link-verbessern-routing-mismatch-c](./quick/261009-jv4-debug-link-verbessern-routing-mismatch-c/) |
| 261009-j9j | Kampagnen: Meilenstein-Mails an Ersteller (Migration 027 nur Datei) | 2026-10-09 | 76d9fcf | [261009-j9j-kampagnen-meilenstein-mails-an-ersteller](./quick/261009-j9j-kampagnen-meilenstein-mails-an-ersteller/) |
| 46 | Neues Avatar-Foto von Thomas (Spendenbox Mails + Kampagnenseite), 160px, ohne EXIF/GPS | 2026-10-09 | 7b32e32 | — |
| 261009-jrt | Kampagnen: Stimmt-was-nicht-Meldung + Verantwortungs-Text | 2026-10-09 | 45183ac | [261009-jrt-kampagnen-stimmt-was-nicht-meldung-und-v](./quick/261009-jrt-kampagnen-stimmt-was-nicht-meldung-und-v/) |
| 261009-kn2 | Kampagne verwalten: Sprunglinks + Kontakt in Navbar, Zahlen-Refresh | 2026-10-09 | fc1f971 | [261009-kn2-kampagne-verwalten-navbar-sprunglinks-ko](./quick/261009-kn2-kampagne-verwalten-navbar-sprunglinks-ko/) |
| 261009-lms | Kampagnen-Zahlen schaerfen (Teilsterne, Ohnmacht als Kontext) und Empfehlungskarte + Meilenstein-Mail-Zeile | 2026-10-09 | 2cb17b2 | [261009-lms-kampagnen-zahlen-schaerfen-und-empfehlun](./quick/261009-lms-kampagnen-zahlen-schaerfen-und-empfehlun/) |
| 50 | Vorher-Kachel zurueck, Icons, Hover-Datum/KW im Verlauf, Taube statt Herz | 2026-10-09 | 25fc887 | — |
| 261009-mxa | Unterseite /bundestag-besuch-kostenlos, PLZ-MdB-Karte, Treppe-Stufe 7 | 2026-10-09 | 654517f | [261009-mxa-unterseite-bundestag-besuch-kostenlos-mi](./quick/261009-mxa-unterseite-bundestag-besuch-kostenlos-mi/) |
| 261009-pro | Karte zeigt alle PLZ (Pagination + 1h-Cache), neuer Text, Waben-Story | 2026-10-09 | 21e6857 | [261009-pro-karte-zeigt-alle-plz-pagination-1h-cache](./quick/261009-pro-karte-zeigt-alle-plz-pagination-1h-cache/) |
| 261009-psc | Briefmarken-Link in Brief-Mail (online kaufen) + optionale Altersgruppe im Review | 2026-10-09 | uncommitted | [261009-psc-briefmarken-link-schaerfen-und-altersgru](./quick/261009-psc-briefmarken-link-schaerfen-und-altersgru/) |
| 261009-r0z | Feedback-Formular für Kampagnen-Ersteller:innen (Formular, Migration 029 lokal, Verwalten-Karte, Datenschutz) | 2026-10-09 | f6ce471 | [261009-r0z-feedback-formular-fuer-kampagnen-erstell](./quick/261009-r0z-feedback-formular-fuer-kampagnen-erstell/) |
| 261009-ryw | Landing So-einfach-gehts: Header in linke Spalte, Countdown auch auf Desktop | 2026-10-09 | 4a0b78d | [261009-ryw-landing-so-einfach-gehts-header-in-linke](./quick/261009-ryw-landing-so-einfach-gehts-header-in-linke/) |
| 261009-sdc | Politiker-Daten aktualisieren: Junge-Zschau, Landtag ST, RP-MP Schnieder, Fetch-Guards | 2026-10-09 | eeedc4b | [261009-sdc-politiker-daten-aktualisieren-junge-zsch](./quick/261009-sdc-politiker-daten-aktualisieren-junge-zsch/) |
| 57 | Wahlkreisbüro-Scraper an neues bundestag.de-Format angepasst, Guard, Daten neu (Zschau) | 2026-10-09 | 21f8507 | — |
| 261009-u31 | Creator-Statistik: Versandring, Erklärzeile, aufklappbare Länder-Legende | 2026-10-09 | 8d4fd79 | [261009-u31-creator-statistik-versandring-erklaerzei](./quick/261009-u31-creator-statistik-versandring-erklaerzei/) |
| 261010-rhx | Landing: Kampagnen-Pills erklaert (oder-Trennlinie), mobil als wischbare Reihe, Reviews mobil kompakter, NGO-Notizzettel geparkt | 2026-10-10 | 8399f29 | [261010-rhx-landing-kampagnen-pills-erklaeren-notizz](./quick/261010-rhx-landing-kampagnen-pills-erklaeren-notizz/) |
| 261011-lgc | Ending-Page Deutschlandkarte: Tipp öffnet Vollbild-Zoom | 2026-10-11 | 2f170fd | [261011-lgc-ending-page-deutschlandkarte-tipp-ffnet-](./quick/261011-lgc-ending-page-deutschlandkarte-tipp-ffnet-/) |
| 261012-oj1 | Kampagnenseiten: Zähler ab 21, Disclaimer, pausiert per Link, "Weitere Kampagnen" | 2026-10-12 | 6b20dd3 | [261012-oj1-kampagnenseiten-zaehler-disclaimer-pausi](./quick/261012-oj1-kampagnenseiten-zaehler-disclaimer-pausi/) |
| 261012-pnq | Karten-Vergrößerung von Success-Seite auf Landing Page verschoben | 2026-10-12 | 01282e8 | [261012-pnq-karten-vergroesserung-von-success-seite-](./quick/261012-pnq-karten-vergroesserung-von-success-seite-/) |
| 261012-o70 | Self-Service-Datenlöschung /datenloeschen: erst prüfen, dann löschen; Löschlink in Rückfrage- und Last-Call-Mail | 2026-10-12 | 083a576 | [261012-o70-datenloeschen-seite-self-service](./quick/261012-o70-datenloeschen-seite-self-service/) |
| fast-261012 | Briefmail: Karten-Ausnahme im Datenschutz-Satz + persönlicher /datenloeschen-Link (de/en/tr) | 2026-10-12 | f5a435a | - |
| 261013-vi5 | Förderunterlagen (Anträge, Wettbewerbe, Finanzierung) aus dem öffentlichen Repo genommen, lokal gitignored | 2026-10-13 | (this) | [261013-vi5-foerderunterlagen-aus-git](./quick/261013-vi5-foerderunterlagen-aus-git/) |
| 261013-wuq | Rückmeldeseite + Last-Call komplett lokal umgesetzt; Migration/Deploy/Versand manuell offen | 2026-10-14 | 3c49b89 | [261013-wuq-rueckmeldeseite-und-lastcall-mail-komple](./quick/261013-wuq-rueckmeldeseite-und-lastcall-mail-komple/) |
| 67 | Last-Call-Mail aufgeräumt + Rückmeldeseite poliert | 2026-10-14 | 62a5e9b | — |
| 261014-hpa | Kampagnen-Karte: gemeinsamer Post statt Thomas vorstellen, Weiterempfehlen mit Kontext | 2026-10-14 | 8b3957e | [261014-hpa-kampagnen-karte-gemeinsamer-post-weitere](./quick/261014-hpa-kampagnen-karte-gemeinsamer-post-weitere/) |
| 261014-iuq | Stats-Seite: Sektion Nach dem Brief fuer Rueckmeldungen (letter_outcomes) | 2026-10-14 | 914b37f | [261014-iuq-stats-seite-sektion-nach-dem-brief-fuer-](./quick/261014-iuq-stats-seite-sektion-nach-dem-brief-fuer-/) |
| 70 | Mistral-Fehlerart bei 429/5xx als detail.upstream im Fehler-Report (a049bf3) | 2026-10-19 | a049bf3 | — |
| 71 | Landeskampagnen: Regierungschef:in statt Landesregierung vorauswählen (prueft-die-afd) | 2026-10-19 | c33a3f5 | — |
| 261019-trg | Kampagnen-Stats: Doppelte-Schätzung in Fußnote, Verlauf stündlich an Tag 1-2 | 2026-10-19 | 0886d6e | [261019-trg-kampagnen-stats-fussnote-stundenverlauf](./quick/261019-trg-kampagnen-stats-fussnote-stundenverlauf/) |
| 73 | Button vor Schritt 3 einheitlich Empfänger:in auswählen (360bb37) | 2026-10-19 | 360bb37 | — |
| 261019-u1n | /aktiv-werden mit Wahlkreisbuero-Finder verbinden + MdB-Zeile in Brief-Mail | 2026-10-19 | 1379284 | [261019-u1n-aktiv-werden-mit-wahlkreisbuero-finder-v](./quick/261019-u1n-aktiv-werden-mit-wahlkreisbuero-finder-v/) |
| 261019-ucr | Bewertungs-Mail mit Wahlkreisbuero-Hinweis fuer MdB-Briefe + Datenschutz-Satz | 2026-10-19 | 3104fcb | [261019-ucr-bewertungs-mail-wahlkreisbuero-hinweis-f](./quick/261019-ucr-bewertungs-mail-wahlkreisbuero-hinweis-f/) |
| 261019-uim | Rueckmeldeformular: Frage Wie war die Reaktion fuer dich (Migration 035, Formular, Stats) | 2026-10-19 | 2ca0c35 | [261019-uim-rueckmeldeformular-frage-wie-war-die-rea](./quick/261019-uim-rueckmeldeformular-frage-wie-war-die-rea/) |
| 261019-uyl | Uebergabe-Mail mit Briefzahl, Stats-Bloecken und Anrede-Fix | 2026-10-19 | 6406f28 | [261019-uyl-uebergabe-mail-mit-briefzahl-stats-bloec](./quick/261019-uyl-uebergabe-mail-mit-briefzahl-stats-bloec/) |
| 261019-v48 | Seite /kampagnen-grundsaetze + Links | 2026-10-19 | e195b41 | [261019-v48-kampagnen-grundsaetze-seite](./quick/261019-v48-kampagnen-grundsaetze-seite/) |
| 261019-w59 | Review-Fixes vor Push: Pruefversprechen Kampagnenformular, Stand Nutzungsbedingungen, Anrede nach Uebernahme | 2026-10-19 | 49801db | [261019-w59-review-fixes-vor-push-pruefversprechen-k](./quick/261019-w59-review-fixes-vor-push-pruefversprechen-k/) |
| 80 | Agent-Doku auf Ist-Stand: Stack (Mistral, Vercel/Brevo bezahlt, Supabase Free), Bauprinzipien lean und nachhaltig in CLAUDE.md und AGENTS.md, doppelter Gitty-Abschnitt entfernt | 2026-10-20 | 1c3fb25 | — |
| 261021-kcm | Erfolgsseite: HTTP 504 (Vercel-Timeout) als nicht erstellt behandeln, Retry zeigen | 2026-10-21 | 4ee870e | [261021-kcm-erfolgsseite-http-504-vercel-timeout-als](./quick/261021-kcm-erfolgsseite-http-504-vercel-timeout-als/) |
| 261021-oma | Mobiles Burger-Menü: Kampagnen-Links, kein doppelter CTA, Stift-Icon | 2026-10-21 | 22cf755 | [261021-oma-mobiles-burger-menue-kampagnen-links-cta](./quick/261021-oma-mobiles-burger-menue-kampagnen-links-cta/) |
| 261021-ols | MdB-Mail Wahlkreisbüro-Link mit mdb-ID, aktiv-werden zeigt Büro direkt | 2026-10-21 | 7af0c1c | [261021-ols-mdb-mail-wahlkreisb-ro-link-mit-mdb-id-a](./quick/261021-ols-mdb-mail-wahlkreisb-ro-link-mit-mdb-id-a/) |
| 261021-ot3 | Verwaltungslink per E-Mail anfordern, Erklärtext, Buttons, Sitzung 7 Tage | 2026-10-21 | 687282b | [261021-ot3-kampagne-verwalten-link-anfordern](./quick/261021-ot3-kampagne-verwalten-link-anfordern/) |
| 261021-oy6 | Briefseite und Mailschutz: 500er retry-sicher, kein Zustaendigkeits-Hinweis bei Kampagnen, Resend nur mit Nachweis, Rate-Limit Kampagnenanlage | 2026-10-21 | 97b3878 | [261021-oy6-briefseite-und-mailschutz-500er-retry-si](./quick/261021-oy6-briefseite-und-mailschutz-500er-retry-si/) |
| 261021-oy7 | Analytics ohne sensible URLs, Next.js 16.4.2, CI per GitHub Actions | 2026-10-21 | 97b3878 | [261021-oy7-analytics-ohne-sensible-urls-next-js-16-](./quick/261021-oy7-analytics-ohne-sensible-urls-next-js-16-/) |
| 261021-oy9 | Stats ohne 1000-Zeilen-Grenze: Paginierung fuer reviews und letter_signals | 2026-10-21 | 97b3878 | [261021-oy9-stats-ohne-1000-zeilen-grenze-paginierun](./quick/261021-oy9-stats-ohne-1000-zeilen-grenze-paginierun/) |
| 261022-qdd | Brief anpassen behält eigene Stimme, Knopf Einfache Worte | 2026-10-22 | 847635c | [261022-qdd-brief-anpassen-beh-lt-eigene-stimme-knop](./quick/261022-qdd-brief-anpassen-beh-lt-eigene-stimme-knop/) |
| 261022-qg2 | Feedback-Token komprimieren (deflateRaw), damit Brevo-Stern-Links unter 2083 Zeichen bleiben | 2026-10-22 | 87ab6ff | [261022-qg2-feedback-token-komprimieren-deflateraw-d](./quick/261022-qg2-feedback-token-komprimieren-deflateraw-d/) |
| 82 | Autopilot: tote Doku-Links (DSGVO-AUDIT, ROADMAP) repariert, 4 erledigte Todos nach completed | 2026-10-21 | 4b97ffb | — |
| 261023-ilb | Fallback-Reviews entfernen, Review-Streifen blendet bei Fehler aus | 2026-10-23 | 2556d99 | [261023-ilb-fallback-reviews-entfernen-review-streif](./quick/261023-ilb-fallback-reviews-entfernen-review-streif/) |
| 92 | Bauprinzip Nur das Wichtigste shippen in CLAUDE.md und AGENTS.md | 2026-10-23 | 49ae6ca | — |
| 261023-mak | MdbLookupCard Maps-Link nutzt PLZ-Zeile statt letzter zwei Zeilen | 2026-10-23 | ad220eb | [261023-mak-mdblookupcard-maps-link-nutzt-plz-zeile-](./quick/261023-mak-mdblookupcard-maps-link-nutzt-plz-zeile-/) |
| 261026-tca | Spendenbitte aus Brief-Mail in Follow-up-Mail verlegen (Banner, 5-€-Anker) | 2026-10-26 | 292928c | [261026-tca-spendenbitte-aus-brief-mail-in-follow-up](./quick/261026-tca-spendenbitte-aus-brief-mail-in-follow-up/) |
| 261024-xax | S0 schule-jung: Klassenlink-Token, Klassen-Bucket, 429-Backoff, Wartetext | 2026-10-25 | d4bf324 | [261024-xax-s0-klassenlink-token-und-belastbarkeit-s](./quick/261024-xax-s0-klassenlink-token-und-belastbarkeit-s/) |
| 261025-0a4 | S1 schule-jung: Jugendmodus im Wizard (Prompt, Mail, Handoff, Event) | 2026-10-25 | 245f380 | [261025-0a4-s1-jugendmodus-im-wizard-schule-jung](./quick/261025-0a4-s1-jugendmodus-im-wizard-schule-jung/) |
| 261025-0kf | S2 schule-jung: Einstiegsseite /jung mit Klassenlink, geteilten Chips, Spracheingabe | 2026-10-25 | 0829329 | [261025-0kf-s2-jung-einstiegsseite-schule-jung](./quick/261025-0kf-s2-jung-einstiegsseite-schule-jung/) |
| 261025-0n9 | S3 schule-jung: /schule mit Klassenlink-Generator, QR-Encoder-Fix | 2026-10-25 | 9e5aa11 | [261025-0n9-s3-schule-lehrkraefte-klassenlink-genera](./quick/261025-0n9-s3-schule-lehrkraefte-klassenlink-genera/) |
| 261025-0ny | S4 schule-jung: druckbares Material /schule/ablauf (3 A4-Seiten) | 2026-10-25 | 7c00cd6 | [261025-0ny-s4-schule-ablauf-druckbares-material-sch](./quick/261025-0ny-s4-schule-ablauf-druckbares-material-sch/) |
| 261025-0wl | S5 schule-jung: Datenschutz und KI-Transparenz Jugendmodus, Copy-Check, Lint | 2026-10-25 | 6f941c9 | [261025-0wl-s5-recht-und-feinschliff-schule-jung](./quick/261025-0wl-s5-recht-und-feinschliff-schule-jung/) |
| 261025-2y7 | S6 schule-jung: Entwurf im Jugendmodus auf der Erfolgsseite (Entscheidung 1A) | 2026-10-25 | 342900b | [261025-2y7-s6-entwurf-im-jugendmodus-auf-dem-bildsc](./quick/261025-2y7-s6-entwurf-im-jugendmodus-auf-dem-bildsc/) |
| 261026-urs | Gemeinsamer Post: Popup Call (Calendly) oder Mail, Social-Icons auf der Karte | 2026-10-26 | - | [261026-urs-gemeinsamer-post-karte-popup-call-oder-m](./quick/261026-urs-gemeinsamer-post-karte-popup-call-oder-m/) |
| 261027-h8l | Schule-Jung-Eltern-Paket: /eltern, /mitbestimmen-ohne-wahlrecht, /projekttag-demokratie, Aufwertung /jung und /schule, Bilder | 2026-10-27 | 8d59b10 | [261027-h8l-schule-jung-eltern-paket-eltern-seite-zw](./quick/261027-h8l-schule-jung-eltern-paket-eltern-seite-zw/) |
| 261027-itd | Follow-up-Mail kürzer mit kompakter Spendenbox, Spendenkarte auf /feedback-Danke-Seite bei 4-5 Sternen | 2026-10-27 | 64502b0 | [261027-itd-spendenbitte-schaerfen-follow-up-kuerzen](./quick/261027-itd-spendenbitte-schaerfen-follow-up-kuerzen/) |
| 261027-mrw | Repo-Hygiene: .planning/local, Todos und Outreach lokal, Nutzer anonymisiert | 2026-10-27 | e54ed42 | [261027-mrw-repo-hygiene-privater-ordner-planning-lo](./quick/261027-mrw-repo-hygiene-privater-ordner-planning-lo/) |
| 261027-ore | Schulseiten /jung, /schule, /eltern UX-Umbau: Navbar-CTA, Überschriften ohne Handschrift, Formular im ersten Screen, Ablauf-Umschalter, zwei Einstiege für Eltern | 2026-10-27 | 6e58f04 | [261027-ore-schulseiten-jung-schule-eltern-ux-umbau](./quick/261027-ore-schulseiten-jung-schule-eltern-ux-umbau/) |
| 261027-t9h | Schulseiten Feinschliff: Intro, aufklappbare Themen, wechselnde Platzhalter, Kontakt auf /schule, Eltern-Texte | 2026-10-27 | 71aee3c | [261027-t9h-schulseiten-feinschliff-intro-aufklappba](./quick/261027-t9h-schulseiten-feinschliff-intro-aufklappba/) |
| 261027-w2f | Briefmail: Nebenlinks in Block Gut zu wissen | 2026-10-27 | a55cd48 | [261027-w2f-briefmail-nebenlinks-in-block-gut-zu-wis](./quick/261027-w2f-briefmail-nebenlinks-in-block-gut-zu-wis/) |
| 261028-0pn | Review-Fixes vor Push: Themen-Limit-Hinweis /jung, Schulleitung-Anker, Resend-Audience | 2026-10-28 | e0e6bfa | [261028-0pn-review-fixes-vor-push-themen-limit-hinwe](./quick/261028-0pn-review-fixes-vor-push-themen-limit-hinwe/) |
| 261028-0x0 | Briefmail Kampagnen-Kasten: Text neu, Link vorne, Logo, Herz | 2026-10-28 | 82df97b | [261028-0x0-briefmail-kampagnen-kasten-text-neu-link](./quick/261028-0x0-briefmail-kampagnen-kasten-text-neu-link/) |
| 261028-cgi | Jugend-Prompt: Kurz-Hinweis konkret, keine Partei-Wertesprache, Unterrichtsprojekt-Satz frei | 2026-10-28 | 8c3780b | [261028-cgi-jugend-prompt-kurz-hinweis-parteiframing](./quick/261028-cgi-jugend-prompt-kurz-hinweis-parteiframing/) |
| 261028-enu | Erstschreiber-Frage im Feedback-Formular mit Auswertung in /stats und Kampagnen-Statistik | 2026-10-28 | 221d477 | [261028-enu-erstschreiber-frage-im-feedback-formular](./quick/261028-enu-erstschreiber-frage-im-feedback-formular/) |

## Session Continuity

Last session: 2026-06-28T14:56:10.946Z
Stopped at: Completed 05-04-PLAN.md
Resume file: None

**Planned Phase:** 4 (Stadtstaaten PLZ-Wahlkreis Genauigkeit und Wahlkreis-Gruppierung im Wizard) — 3 plans — 2026-05-27T21:50:31.369Z
