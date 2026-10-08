# Plan: /ngo-briefkampagne – Empfänger-Optionen + Copy aus NGO/Influencer-Sicht

## Context
Richtig: Die Seite sagt nirgends, **an wen** die Briefe gehen können. Der Hero und "Eure Zielgruppe macht mit" behaupten sogar pauschal "Abgeordnete in ihrem Wahlkreis". Das Produkt kann aber mehr (verifiziert in `web/src/lib/campaigns/schema.ts:28` und `web/src/components/campaigns/CreatorCampaignForm.tsx:93-109`, `MdbCampaignSelector.tsx`):

1. **Bundestag, Wahlkreis** – jede Person schreibt ihrem MdB (PLZ entscheidet).
2. **Bundestag, ausgewählte MdBs** – Kampagne richtet sich an eine Auswahl (Filter nach Partei, Ausschuss, Wahlkreis, Name).
3. **Landesregierung** – Briefe gehen institutionell an Landesregierung bzw. Senat; festes Bundesland oder per PLZ.
   - Achtung: Das sind **nicht MdLs** im Wahlkreis. Die Copy darf "MdL" nicht versprechen.
4. **Fester Empfänger** – alle Briefe an eine Person/Organisation mit deutscher Adresse (Ministerin, Bürgermeister, Behörde, Unternehmen).

Weitere Features, die auf der Seite fehlen: eigene Kampagnenseite mit Logo, Link + QR-Code, Zähler "Briefe erstellt", Verwalten-Link, Übergabe an Kolleg:in (`CampaignManager.tsx`), aktuell kostenlos (steht nur auf `/kampagne-starten`).

## Was eine NGO / ein politischer Influencer hier vermisst
1. **An wen geht das?** Kernfrage, unbeantwortet → neue Sektion "Wen eure Briefe erreichen" mit den 4 Optionen + je einem Beispiel.
2. **Was bekomme ich in der Hand?** Link, QR für Flyer/Story, Logo, Zähler → kurze "Das bekommt ihr"-Liste.
3. **Wie schnell / was kostet es?** Anlegen in ca. 10 Min, E-Mail-Bestätigung, kurze Prüfung, dann live. Kostenlos.
4. **Was passiert mit den Daten meiner Community?** NGOs müssen das vor dem Teilen wissen. (Formulierung erst nach Code-Check, s. Schritt 5.)
5. **Zielgruppen-Ansprache zu eng**: Hero nennt nur "Entscheider:innen aus NGOs und Engagierte in Vereinen". Creator, Initiativen, Bürgerinitiativen fehlen.

## Änderungen (eine Datei: `web/src/app/(site)/ngo-briefkampagne/page.tsx`)
1. **Hero-Text** neu: Zielgruppe öffnen (NGOs, Vereine, Initiativen, Creator mit politischer Community), Empfänger offen formulieren ("an Abgeordnete, die Landesregierung oder genau die Person, die entscheidet"). Jargon "Schnellstart" raus.
2. **shortPoints** Punkt 2 korrigieren: nicht mehr pauschal "zuständige Abgeordnete", sondern "je nach Kampagne der eigene MdB oder euer fester Empfänger".
3. **Neue Sektion "Wen eure Briefe erreichen"** direkt nach shortPoints, gleiche Optik wie shortPoints (Liste mit `divide-y`, keine neuen Komponenten). 4 Einträge wie oben, je 1 Satz + Beispiel.
4. **Neue Mini-Sektion "Das bekommt ihr"**: Kampagnenseite mit Logo, Link + QR-Code, Briefzähler, Verwalten-Link, Übergabe im Team, kostenlos.
5. **Datenschutz-Satz**: vorher im Code prüfen, was Ersteller:innen sehen (`lib/campaigns/repository.ts`, `CampaignManager.tsx`). Erwartung (Annahme): nur Zähler, keine Namen/Adressen/Brieftexte. Nur das schreiben, was der Code belegt.
6. **Forschungs-Box** (McEntire) ans Ende vor "Mehr dazu" verschieben; auf einer Pitch-Seite wirkt "kein Wirkungsversprechen" oben defensiv.
7. **FAQ** +2 Fragen: "An wen können die Briefe gehen?" und "Was kostet das, was sehen wir danach?" (fließt automatisch in FAQ-JSON-LD).
8. `MODIFIED` auf `2026-10-08`, `DESCRIPTION` um Empfänger-Optionen ergänzen.

Regeln: keine Em-Dashes (bestehendes "–" in der Forschungs-Box mit ersetzen), Check gegen `signs-of-ai-writing`-Checkliste, `/frontend-design` für die neue Sektion, Ausführung via `/gsd:quick`. Dirty Worktree (`uiCatalog.ts`, Test, STATE.md) nicht anfassen.

Später, nicht jetzt: Mini-Screenshot vom Unterstützer-Flow; Spiegelung der Empfänger-Optionen auf `/kampagne-starten` (dort steht ebenfalls nur "PLZ entscheidet").

## Verifikation
1. `npm run lint` und `npx tsc --noEmit` in `web/`.
2. `npm run test -- landingPageContent` (einziger Test, der die Route referenziert).
3. Dev-Server via preview_start, `/ngo-briefkampagne` mobil (375px) + Desktop prüfen, Screenshot.
4. FAQ-JSON-LD im DOM enthält die 2 neuen Fragen.
5. Copy-Check: kein "MdL", keine Em-Dashes, jede Feature-Aussage im Code belegt.
