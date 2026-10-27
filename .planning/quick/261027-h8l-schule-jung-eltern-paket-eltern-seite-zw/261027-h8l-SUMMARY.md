---
quick_id: 261027-h8l
date: 2026-10-27
status: complete
---

# Schule-Jung-Eltern-Paket: Summary

## Gebaut

- `/eltern`: Banner, Eltern-Wizard-Einstieg (Klasse 1 bis 13 optional, 7 Themen-Chips über geteilte `TopicStarterGrid`/`useTopicStarters`), Zettel „Wer ist zuständig?“ (Land vs. Schulträger), Vertrauensabschnitt zum Jugendmodus, 5 FAQ. Handoff geht in den normalen Erwachsenen-Flow (`source: "landing"`, kein `audience`).
- `/mitbestimmen-ohne-wahlrecht`: SEO-Seite für Jugendliche mit `WahlalterLeiste` (14 bis 18, fünf Wahlen), Article + FAQPage JSON-LD.
- `/projekttag-demokratie`: SEO-Seite für Lehrkräfte, Tagesplan als Fahrplan mit fünf Stationen, Klassen zeitversetzt wegen KI-Limit, KMK 2018.
- `/jung` und `/schule`: neue Abschnitte zu jungen Stimmen, Projekttag-Verweis, Eltern-Hinweise, neue FAQ „Ab wann darf ich wählen?“, Bilder.
- Unternavigation Schüler:innen/Lehrkräfte/Eltern im Header nur auf den fünf Schulseiten, Footer-Link „Für Eltern“ (nur DE), Sitemap-Einträge.
- Bilder: 4 WebP, 1200 px, 84 bis 138 KB, Metadaten entfernt.

## Verifikation

- `npx jest`: 167 Suites, 1545 Tests grün (neu: `elternHandoff.test.ts`, 6 Tests).
- `npm run lint`: 0 Fehler, 7 Warnungen in fremden Bestandsdateien.
- `npm run build`: grün, alle fünf Seiten im Output.
- Preview 375 px und Desktop: kein horizontales Scrollen, keine Konsolenfehler. Eltern-Chip → Handoff im sessionStorage geprüft, Navigation in den Wizard bewusst blockiert (kein Mistral-Aufruf).

## Offen

- Routing-Taxonomie kennt Schulgebäude/Schulträger nicht als Kommune-Thema; der Eltern-Chip nennt den Schulträger im Text, das Routing wurde nicht live getestet.
- Wahlalter-Liste ohne Bayern und Berlin (unbestätigt), KMK-Wortlaut aus Sekundärquellen.
- „Briefe von Jugendlichen sind die Ausnahme“ ist eine Beobachtung ohne Quelle.
