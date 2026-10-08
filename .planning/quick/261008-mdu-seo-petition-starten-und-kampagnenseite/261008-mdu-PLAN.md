---
quick_id: 261008-mdu
mode: quick
---

# SEO: "Petition starten" + aufgewertete Kampagnenseite

## Context
Menschen googeln oder fragen ChatGPT "Wie starte ich eine Petition?". Brief nach Berlin taucht dort nicht auf. Ziel: eine neue Seite, die die Frage ehrlich und vollständig beantwortet (Bundestag, Landtag, Kommune, Online-Plattformen) und Briefe bzw. Briefkampagnen als stärkere Ergänzung anbietet. Dazu wird die bestehende Initiativen-Seite `/kampagne-starten` aufgewertet statt eine zweite neue Seite zu bauen (vermeidet Kannibalisierung). Positionierung laut Thomas: Ergänzung + echte Anleitung, Plattformen sachlich beim Namen nennen, Kampagnen kostenlos und spendenfinanziert.

Ausführung über `/gsd-quick` (Projektregel), Seitenaufbau nach Skill `add-subpage`, Texte gegen `/Users/thomas/Documents/Git Repos/signs-of-ai-writing.md` + Voice-Checkliste aus `add-subpage` prüfen. Keine Em-Dashes.

## 1. Neu: `/petition-starten` (für Einzelpersonen)
Datei: `web/src/app/(site)/petition-starten/page.tsx`, gebaut nach Template `web/src/app/(site)/kampagne-starten/page.tsx` (Konstanten, Metadata, inline `faqJsonLd` + `articleJsonLd`, `Prose`, `FactCallout`, `PullQuote`, `FAQAccordion`, "Mehr dazu"-Block). Kein i18n, hart codiertes Deutsch.

- Title: "Petition starten: So geht's beim Bundestag, Land und online | Brief nach Berlin" (Feinschliff bei Umsetzung, ~60 Zeichen Ziel)
- Lead (40–60 Wörter, answer-first): Petitionsrecht nach Art. 17 GG, Bundestag-ePetition als offizieller Weg, Landtag/Kommune je nach Zuständigkeit, Online-Plattformen für öffentlichen Druck, Brief an die zuständige Abgeordnete als Ergänzung.
- H2 als echte Suchfragen:
  1. Wie starte ich eine Petition beim Bundestag? (epetitionen.bundestag.de, öffentliche vs. einfache Petition, Quorum 30.000 in 6 Wochen, Zahlen 2024: 9.260 eingereicht, 607 einzeln beraten; Quelle wie in `/brief-oder-petition`)
  2. Bundestag, Landtag oder Gemeinde: Wer ist zuständig? (Querlink `/kommune-land-bund-eu`)
  3. Was ist der Unterschied zwischen offizieller Petition und Online-Petition? (openPetition, Change.org, WeAct/innn.it sachlich beschreiben, Querlink `/andere-tools#petitionen`)
  4. Was passiert nach dem Einreichen? (Ablauf, realistische Dauer)
  5. Wie mache ich meine Petition wirksamer? (persönlicher Brief an die zuständige Abgeordnete parallel; Briefkampagne für Gruppen → `/kampagne-starten`)
- Vergleichsraster wie in `kampagne-starten` (3 Spalten: offizielle Petition / Online-Petition / persönlicher Brief)
- Satz zur Finanzierung: Brief nach Berlin ist kostenlos, gemeinnützig (Träger WE AID gGmbH, siehe `SUPPORT_CONTENT` in `web/src/lib/support-content.ts`), spendenfinanziert → Link `/spenden` (`DONATION_PATH` aus `web/src/lib/config.ts`)
- 5–6 FAQs (z. B. "Kann jeder eine Petition starten?", "Wie viele Unterschriften braucht eine Petition?", "Ist eine Online-Petition rechtlich bindend?", "Petition oder Brief an Abgeordnete: was wirkt mehr?", "Was kostet Brief nach Berlin?")
- Querlinks "Mehr dazu": `/brief-oder-petition`, `/kampagne-starten`, `/andere-tools`, `/kommune-land-bund-eu`, `/lohnt-sich-brief-an-politiker`
- Doppel-CTA am Ende: "Brief schreiben" (`/app`) + "Briefkampagne starten" (`/kampagne/starten`)
- Fakten (Quorum, Fristen, Zahlen, Plattform-Modelle) bei Umsetzung per Web gegen Primärquellen prüfen (bundestag.de, openpetition.de, change.org); nur Zahlen verwenden, die belegt sind.

## 2. Aufwerten: `/kampagne-starten` (für Initiativen, Vereine, Gruppen)
Datei: `web/src/app/(site)/kampagne-starten/page.tsx`
- `MODIFIED`-Konstante ergänzen, `dateModified` darauf setzen (Muster aus `ngo-briefkampagne`)
- Title/Description um Petitions-Keywords schärfen: "Petition oder Briefkampagne starten" / "Alternative zu Petition"
- Kosten-FAQ + Absatz "Für wen…": "perspektivisch bezahlbares Angebot" ersetzen durch "kostenlos, gemeinnützig (WE AID gGmbH), spendenfinanziert" + Link `/spenden`
- Neue H2: "Petition und Briefkampagne kombinieren: wie geht das?" (kurz, verlinkt `/petition-starten`)
- Querlinks ergänzen: `/petition-starten`, `/brief-oder-petition`, `/ngo-briefkampagne` (für größere Organisationen)

## 3. Sitemap + eingehende Querlinks
- `web/src/app/sitemap.ts`: `/petition-starten` (priority 0.9, Guide-Seite) und `/kampagne-starten` (0.8, fehlte bisher) eintragen
- Je ein Link auf `/petition-starten` in den "Mehr dazu"-Blöcken von `/brief-oder-petition` und `/andere-tools` (minimaler Eingriff, nur `<li>` ergänzen)
- `ngo-briefkampagne/page.tsx` und `uiCatalog.ts` haben uncommittete Änderungen von Thomas: nicht anfassen

## Verification
1. `cd web && npm run lint` und `npm run build`: `/petition-starten` erscheint im Build-Output
2. `npm run test` (bestehende Tests grün, kein neuer Test nötig, da keine Logik)
3. Preview: beide Seiten im Browser öffnen, Desktop + Mobile (375px) Screenshot, JSON-LD per `javascript_tool` parsen (2 Scripts, valides JSON, FAQ-Anzahl stimmt), alle Querlinks liefern 200
4. Textcheck: grep auf `—`, verbotene Wörter aus `add-subpage`-Checkliste, Abgleich mit `signs-of-ai-writing.md`
5. Bericht: Slugs, primäre Suchziele, FAQ-Anzahl, Sitemap-Prioritäten, geprüfte Quellen. Kein Commit/Push ohne Freigabe.
