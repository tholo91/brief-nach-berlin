---
phase: quick-261027-t9h
plan: 01
subsystem: schulseiten
tags: [jung, schule, eltern, topic-chips, copy]
status: complete
commits: 3
plan_head_before: 2447d58a39308c1b32e2e2e294cabecda6f06464
plan_head_after: d02f21eda316fd001490f935e8c4a28cc2a8447f
key-files:
  created:
    - web/src/components/topics/ExpandableTopicChips.tsx
  modified:
    - web/src/components/topics/TopicStarterGrid.tsx
    - web/src/components/FAQAccordion.tsx
    - web/src/components/jung/JungExperience.tsx
    - web/src/components/eltern/ElternExperience.tsx
    - web/src/app/(site)/jung/page.tsx
    - web/src/app/(site)/schule/page.tsx
    - web/src/app/(site)/eltern/page.tsx
    - web/src/__tests__/topicStarters.test.ts
    - web/src/__tests__/jungEntry.test.ts
    - web/src/__tests__/schulePage.test.ts
    - web/src/__tests__/elternHandoff.test.ts
actuals:
  tasks: 3
  commits: 3
---

# Quick 261027-t9h: Schulseiten Feinschliff Summary

Shared `ExpandableTopicChips` ("Alle Themen" / "Weniger" toggle) on /jung and /eltern, new /jung intro with rotating placeholder, prefilled "Thomas schreiben" mailto on /schule, new /eltern H1 and door copy.

## Commits

- 766031c feat: Themen-Chips aufklappbar, geteilte Komponente, /jung angebunden
- b2b3b72 feat: /jung Intro, wechselnde Beispiele, kuerzerer Hinweis, flacheres Bild
- d02f21e feat: /schule Kontakt-Mail und neuer Einstieg, /eltern Texte und aufklappbare Themen

## Copy changes (old -> new)

/jung
- Intro: "Erzähl, was dich stört. Ich schreibe dir einen Entwurf an die zuständige Person." -> "Erzähl, was dich stört oder was du dir für deine Zukunft wünschst. Das Tool schreibt daraus einen Briefentwurf an die Zuständigen in der Politik."
- H2 "Worum geht es dir? (bis zu zwei)" -> "Worum geht es dir?" plus Toggle "Alle Themen" / "Weniger" (Limit-Meldung bei drittem Chip bleibt)
- Placeholder: "Ein Erlebnis reicht, zum Beispiel: Seit den Herbstferien hatten wir in Mathe drei Vertretungen." -> vier Beispiele im 4-s-Wechsel (1: "Seit den Herbstferien hatten wir in Mathe drei Vertretungen. Ich fühle mich allein gelassen.")
- Unter "Brief entwerfen": "Als Nächstes gibst du deine E-Mail-Adresse an ... eine Kopie kommt per Mail." -> "An wen dein Brief geht, schlägt dir das Tool vor."
- Bildstreifen mobil: h-20 -> h-14 (sm:h-auto unverändert)

/schule
- Hero: "In einer Schulstunde schreiben deine Schüler:innen echte Briefe an ihre Abgeordneten. Los geht es per QR-Code." -> "Ein kurzer Unterrichtsentwurf: Deine Schüler:innen schreiben in einer Stunde Briefe für ihre Zukunft an ihre Abgeordneten."
- Neu unter den Hero-Buttons: "Hilfe bei der Planung? Ich unterstütze dich gern." + Link "Thomas schreiben" (mailto FOUNDER_EMAIL, Betreff "Brief-nach-Berlin im Unterricht", vorbefüllter Body)

/eltern
- H1: "Schreib der Politik, was an der Schule fehlt." -> "Schreib der Politik, was an der Schule deiner Kinder fehlt."
- Tür 1: "Ich will selbst schreiben" -> "Ich will selbst einen Brief schreiben"
- Tür 2: "Mein Kind hat es in der Schule genutzt" -> "Mein Kind will Brief-nach-Berlin mit seiner Klasse nutzen"; Subtext "Welche Daten verarbeitet werden und welche nicht." -> "Was mit den Daten passiert und wie die Lehrkraft startet."
- Themen-Chips: Toggle "Alle Themen" / "Weniger" neben dem H2 (Hilfetext "Wähl bis zu zwei Themen ..." unverändert)

## Deviations from Plan

None - plan executed as written. Notes:
- `ChevronIcon` in FAQAccordion exported (as planned); FAQAccordion has no "use client", but the icon has no hooks, so importing it from the client component is fine.
- Commit message of Task 1 body line uses plain ASCII; all commits end with the requested Co-Authored-By line.

## Verification

- Task 1 red first (module missing), green after: topicStarters + jungEntry 28 passed, 1 snapshot passed (numbered, 0 updates).
- Task 2 red first (1 failed), green after: jungEntry 14/14; eslint on touched files 0 errors, 0 warnings.
- Task 3 red first (2 failed), green after: schulePage + elternHandoff 13/13.
- `npx jest --ci`: 169 suites passed, 1584 tests passed, 19 snapshots passed, 0 written.
- `npm run lint`: 0 errors, 7 warnings (all pre-existing, none in touched files).
- `npm run build`: exit 0 after `rm -rf .next/server .next/static` (first attempt hit the known ENOTEMPTY iCloud error). The log shows a `[counter] read failed: JWT issued at future` message during static generation, unrelated to this change (Supabase clock skew, pre-existing).
- `git diff --stat HEAD~3 -- web/src/components/campaigns web/src/app/api web/src/lib web/package.json`: empty.
- No em/en dash in added lines (0 matches). No Caveat class added. No new dependency.

## Browser checks (orchestrator, 375x812)

- /jung: "Brief entwerfen" bottom was 827px with h-14. Fix 71aee3c: image strip h-12, intro mb-4 and leading-snug on mobile (sm:leading-relaxed). Now 803px. Intro 3 lines, line under the button 1 line, no horizontal overflow.
- Expanded chips wrapped mostly one per row (364px). Fix 71aee3c: expanded state is a 2-column grid (sm: 3), chips wrap text inside. Now 275px. Tests updated (grid-cols-2, h-12).
- /eltern: H2 "Worum geht es dir?" wrapped next to the toggle at text-lg. Fix 71aee3c: Eltern form headings text-base sm:text-lg like /jung. Now 1 line. H1 3 lines (accepted, 7A). Doors show the new copy, #schreiben / #sicher.
- Placeholder rotation seen (3 distinct strings in 9 s), textarea not overflowing.
- /schule: new hero sentence; "Thomas schreiben" mailto to Brief-nach-Berlin@posteo.de with locked subject and body, 44px tap height.
- Console without errors. Full Jest after fix: 169 suites, 1584 tests passed; lint 0 errors.
- Not checked: reduced-motion emulation, real iPhone Safari, production.

## Known Stubs

None.

## Threat Flags

None (static mailto with FOUNDER_EMAIL, all encoded; no user input interpolated).

## Self-Check: PASSED

Files exist, commits 766031c, b2b3b72, d02f21e on main (3 commits since 2447d58), not pushed.
