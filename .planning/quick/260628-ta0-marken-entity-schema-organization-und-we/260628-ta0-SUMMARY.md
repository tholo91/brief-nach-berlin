---
status: complete
quick_id: 260628-ta0
date: 2026-06-28
commit: 09bf448
---

# Quick Task 260628-ta0: Marken-Entity-Schema Organization und WebSite JSON-LD im Next Root-Layout ergänzen

## Ergebnis

`web/src/app/layout.tsx` rendert jetzt ein serverseitiges `application/ld+json`-Script mit einem Schema.org-`@graph`.

## Geändert

- `Organization` für `Brief nach Berlin` mit stabilem `@id`, URL, Logo, Image, Beschreibung und offiziellem GitHub-Repo als `sameAs`.
- `Person` für Thomas Lorenz mit stabilem `@id`, Website und LinkedIn als `sameAs`.
- `WebSite` mit stabilem `@id`, URL, Publisher-Referenz auf die Organization und `inLanguage: de-DE`.

## Bewusst nicht geändert

- Keine bestehenden Metadaten, OG/Twitter-Tags, Sitemap, Robots oder Article/FAQ-Schemas geändert.
- Kein `SearchAction`, weil die Website aktuell keine echte Site-Suche anbietet.

## Verifikation

- `npm run build` in `web/`: PASS.
- `npm run lint` in `web/`: FAIL wegen bereits bestehender, nicht berührter Lint-Fehler in anderen Dateien.
- Lokaler Production-Server auf `localhost:3010` gestartet und Homepage per `curl` abgerufen.
- Emittiertes JSON-LD lokal geparst: 1 Script, Graph-Nodes `Organization`, `Person`, `WebSite`, erwartete stabile `@id`s vorhanden.
