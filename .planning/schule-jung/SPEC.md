# /schule + /jung: Stories und Brief für den Product-Owner-Agent

## Context

Schüler:innen dürfen erst spät wählen und werden selten gehört. Brief-nach-Berlin soll ihnen eine Stimme geben, auf zwei Wegen:

- Einzeln über einen Jugendmodus des bestehenden Wizards.
- Im Klassenverband über eine Seite für Lehrkräfte mit Klassenlink und einem Ablauf für 45 bzw. 90 Minuten.

Grundlage ist Phase 999.36 „Schulmodus `/schule`“ in `.planning/ROADMAP.md` (Zeilen 220–274). Davon weichen wir bewusst ab:

- **Nicht** der Arbeitsblatt-Generator aus dem DSS-Tool (`brief-nach-offebach`), sondern der bestehende Wizard plus Jugendkontext.
- **Nicht** erst auf das DSS-Feedback warten.

Ziel des Wochenendes: Ein Product-Owner-Agent setzt die Stories mit Sub-Agents in einem Branch um. Thomas reviewt danach und gibt den Merge frei.

## Entscheidungen (von Thomas)

1. **Jetzt bauen**, als eigene BnB-Variante mit Politiker:innen als Empfänger. Ideen aus dem DSS-Tool dürfen übernommen werden, der Code wird nicht synchron gehalten.
2. **Zielgruppe:** Klasse 8–10, also 13 bis 16 Jahre. Die Klassenstufe steuert Alter und Ausdrucksweise im Prompt.
3. **Inhalt des Briefs:** Er sagt, dass die Person zur Schule geht und noch nicht bzw. bald wählen darf.
4. **Sichtbarkeit:** `/schule` und `/jung` gehen sofort öffentlich online, mit SEO.
5. **Start der Stunde:** Klassenlink mit QR-Code, ohne Login.
6. **Agent-Autonomie:** Worktree-Branch, kein Push. Thomas reviewt und gibt den Merge frei.
7. **Daten:** Jugendliche geben kein `letter_signal` ab. Das ist die einwilligungsbasierte Kartenfunktion; unter 16 bräuchte sie die Einwilligung der Eltern.

## Annahmen (meine Empfehlung, mit der Plan-Freigabe bestätigt)

- **A1 Slugs.** `/schule` ist die Seite für Lehrkräfte. `/jung` ist der Einstieg für Jugendliche. Der Klassenlink führt auf `/jung?…`.
- **A2 Aneignung.**
  - Alle bekommen denselben KI-Entwurf.
  - Eigenständig wird der Brief auf Papier: Beim Abschreiben fügen die Schüler:innen ein eigenes Erlebnis ein und schreiben einen Satz in eigenen Worten neu.
  - Kein Lückenbrief, kein Baukasten-Generator.
- **A3 Absender im Brief.**
  - Der Brief nennt die Klassenstufe.
  - Bis Klasse 11 steht darin „bei der Bundestagswahl darf ich noch nicht wählen“, ohne Jahreszahlen.
  - Über den Klassenlink kommt hinzu: „im Rahmen eines Unterrichtsprojekts“.
  - Der Ton ist klar, ehrlich und höflich, nicht kindlich und ohne Jugendslang.
- **A4 Länge.** Im Jugendmodus 150–200 Wörter statt 200–280. Mit der Hand sind das 15 Minuten statt 25, und das passt in die Stunde.
- **A5 Themen-Chips.**
  - Das Muster von `/schreib-merz` wird wiederverwendet, mit neuer Liste: Schulgebäude & Ausstattung, Lehrkräftemangel, Handy & Digitales, Schulweg & Bus, Mentale Gesundheit, Klima, Wehrdienst, Orte für Jugendliche.
  - Dazu ein eigenes Anliegen als Text oder per Sprache.
- **A6 E-Mail.**
  - Die E-Mail bleibt Pflicht, so bleiben Flow und Rate-Limit unverändert.
  - Im Jugendmodus geht nur die Briefkopie raus (transaktional).
  - Keine Folge-Mail, kein `letter_signal`, keine Meilenstein- oder sonstigen Mails.
- **A7 Nutzung messen.** Ein cookieloses Vercel-Analytics-Event `jung_brief` mit `{klasse, klassenlink: bool}`, ohne personenbezogene Daten. Laut `web/AGENTS.md` braucht ein neues Analytics-Event Thomas' OK; die Plan-Freigabe gilt als dieses OK.
- **A8 Partei und NGO.** Die Felder für Partei und NGO in `StepPreferences` sind im Jugendmodus ausgeblendet (Beutelsbacher Konsens).

## Klassenrisiken, die vorher gelöst sein müssen (verifiziert im Code)

- **Gemeinsame IP der Schule:**
  - `LIMITS.LETTERS_PER_IP` und `ROUTING_PREFETCH_PER_IP` erlauben je 10 pro Stunde (`web/src/lib/rateLimit.ts:75-81`).
  - Eine Klasse mit 25 Schüler:innen surft über dieselbe Schul-IP. Ab dem 11. Brief ist die Klasse blockiert.
- **Mistral-Limit:**
  - mistral-large erlaubt 15 Anfragen pro Minute und teilt sich das mit der Live-Seite.
  - Am 19.10. sind 16 Briefe an 429-Fehlern gescheitert (Memory `mistral-rate-limit-2026-10`).
  - Wenn 25 Schüler:innen gleichzeitig auf „Brief erstellen“ drücken, scheitern sichtbar Briefe vor der Klasse.

## Stories (Reihenfolge; jede endet mit einem Commit im Branch)

### S0 Klassenlink-Token und Belastbarkeit (muss zuerst)
- Ein signierter Klassen-Token (HMAC, ohne DB) enthält `{klasse, plz, issuedAt}` und gilt 14 Tage.
- Das Muster kommt aus `web/src/lib/feedback/token.ts` bzw. `web/src/lib/lookup/routingToken.ts`; einen neuen Token-Typ nur anlegen, wenn sich keiner erweitern lässt.
- Mit gültigem Token ersetzt der Bucket `letter:class:<hash>` (ca. 40 pro Stunde) die IP-Buckets für Brief und Routing-Prefetch. Das Limit pro E-Mail (3 pro 24 h) bleibt.
- Mistral bei 429:
  - `withMistralRetry` in `web/src/lib/mistral.ts` bekommt ein längeres Backoff innerhalb von `maxDuration` der Route.
  - Der Client zeigt den Wartetext „Viele schreiben gerade, dein Brief kommt gleich“.
  - Bevor die Retry-Logik geändert wird, die Notiz zum Mistral-Rate-Limit in `.planning/` lesen (Commit `2ab4f07`).
- **DoD:**
  - Jest-Tests für Token-Validierung, Klassen-Bucket und 429-Retry, Mistral gemockt.
  - Ein ungültiger oder abgelaufener Token fällt sauber auf das normale IP-Limit zurück.

### S1 Jugendmodus im Wizard
- `WizardHandoff` (`web/src/lib/wizard-handoff.ts`) bekommt die Felder `audience: "jung"`, `klasse` und `classToken?`. Sie laufen über `WizardData` bis in `/api/generate-letter`.
- Die PLZ aus dem Klassenlink ist vorausgefüllt und bleibt änderbar.
- `buildUserPrompt`/`buildSystemPrompt` in `web/src/lib/generation/generateLetter.ts` bekommen einen Jugendkontext:
  - Absender und Ton nach A3, Länge nach A4.
  - Positive Anweisungen statt Verbote (Memory `feedback_prompt-style`).
- Im Jugendmodus:
  - Folge-Mail überspringen (`route.ts` ca. Z. 404).
  - Kein Opt-in für `letter_signal` anzeigen.
  - Partei- und NGO-Felder ausblenden.
  - Event `jung_brief` senden.
- **DoD:**
  - Prompt-Snapshot-Tests für Klasse 8, 10 und 12, jeweils mit und ohne Klassenlink.
  - Bestehende Wizard-Tests bleiben grün.
  - Im Erwachsenen-Flow ändert sich nachweislich nichts (Regressionstest).

### S2 `/jung` als Einstiegsseite
- Das Muster ist `SchreibMerzExperienceV2.tsx` + `composeSpecialCampaignIssue()` + `saveHandoff`. Die Chip-Logik wird geteilt, nicht kopiert.
- Klassenstufe wählbar von 7 bis 13. Kommt die Seite über den Klassenlink, ist die Stufe vorbelegt.
- Spracheingabe wie in `Step2Issue` (Voxtral).
- SEO über den Skill `add-subpage` (JSON-LD, Sitemap). Die Copy richtet sich an Jugendliche.
- **DoD:**
  - Auf dem Handy erreicht man in unter 60 Sekunden den Wizard-Schritt mit dem Entwurf.
  - Screenshots in 375 px und Desktop.

### S3 `/schule` für Lehrkräfte + Klassenlink-Generator
- Ein Formular mit Klassenstufe und Schul-PLZ erzeugt Link und QR-Code. QR mit `CampaignQrDownload.tsx` und der vorhandenen `qrcode`-Lib, ohne neues Paket.
- Inhalt der Seite:
  - Warum handgeschriebene Briefe wirken.
  - Ablauf für 45 und 90 Minuten (siehe unten).
  - Material, FAQ, Datenschutz für die Schulleitung.
- Die FAQ deckt ab:
  - Beutelsbacher Konsens: neutral, die Schüler:innen wählen ihr Anliegen selbst.
  - Welche Daten erfasst werden (E-Mail, PLZ), europäische KI.
  - Was tun, wenn die KI etwas Falsches schreibt.
  - Porto und Sammelumschlag.
- **DoD:** Ein Link aus dem Generator öffnet `/jung` mit vorbelegter Klassenstufe und PLZ, und der Token wird akzeptiert.

### S4 Unterrichtsmaterial (druckbar, ohne PDF-Lib)
- `/schule/ablauf` mit Print-CSS. Inhalt:
  - Stundenablauf für 45 und 90 Minuten.
  - Arbeitsblatt „Mach den Brief zu deinem“ mit Checkliste: Anrede, eigenes Erlebnis, konkrete Bitte, Bitte um Antwort, Einladung in die Klasse.
  - Tafelbild zu Bund, Land und Kommune.
- **DoD:** Der Druck auf A4 ist sauber (Screenshot der Druckvorschau).

### S5 Recht und Feinschliff
- `/datenschutz` und `/ki-transparenz` bekommen einen Abschnitt zu Minderjährigen und zum Jugendmodus.
- Sitemap-Einträge für die neuen Seiten.
- Copy-Check:
  - Keine Gedankenstriche (em dash).
  - Checkliste aus `signs-of-ai-writing`.
  - „ich“ statt „wir“.
  - Markenname „Brief-nach-Berlin“.
- **DoD:** `npm run lint`, `npx jest` und `npm run build` laufen grün.

## Ablauf aus Sicht der Lehrkraft (Inhalt für S3/S4)

**45 Minuten:**

| Zeit | Phase | Inhalt |
|---|---|---|
| 0–5 | Einstieg | Frage an die Klasse: „Wer darf bei der nächsten Bundestagswahl wählen?“ Dann: „Schreiben dürft ihr trotzdem, und Handgeschriebenes wird gelesen.“ |
| 5–12 | Thema finden | Think-Pair-Share „Was nervt dich an Schule, Ort, Zukunft?“, die Chips helfen |
| 12–25 | Tool | QR-Code scannen, Anliegen, Ebene wählen, Entwurf. **In zwei Wellen erzeugen** (erst Reihe 1–3, dann der Rest), wegen des KI-Limits |
| 25–40 | Abschreiben von Hand | Eigenes Erlebnis einfügen, einen Satz in eigenen Worten |
| 40–45 | Abschluss | 2–3 Schüler:innen lesen vor. Die Lehrkraft sammelt ein; Briefe an denselben Empfänger gehen im Sammelumschlag raus |

**90 Minuten**, zusätzlich zur Einzelstunde:

- Sortierübung: Wer ist zuständig, Bund, Land oder Kommune? Bildung ist Ländersache.
- Profil der Abgeordneten auf Abgeordnetenwatch ansehen.
- Peer-Feedback in Paaren mit der Checkliste.
- Reinschrift und Umschläge adressieren.
- Ausblick: Antworten im Unterricht besprechen.
- Im Brief Abgeordnete in die Klasse einladen.

Hinweis: Die Schul-PLZ ist für die ganze Klasse gesetzt, also schreiben alle an dieselben MdB und MdL. Ein Sammelumschlag ist billiger und wirkt stärker („23 Briefe der 9b“).

## Nicht im Wochenend-Scope

- Klassenraum mit Live-Zähler.
- Lückenbrief.
- Arbeitsblatt-Generator.
- Code-Merge mit DSS.
- Kultusministerium als Empfänger.
- E-Mail optional machen.
- Neue Supabase-Tabellen.

Wenn der Agent etwas davon braucht, notiert er es in `REPORT.md` und baut es nicht.

## Regeln für den PO-Agent

- **Arbeitsort:** Worktree-Branch `feat/schule-jung`.
- **Pro Story:** `/gsd-quick` (laut Projektregel). Sub-Agents:
  - `worker-sonnet` für die Umsetzung.
  - `worker-haiku` für Lookups.
  - Frontend über `frontend-design` und `../.planning/brand-identity.md`.
- **Pflichtlektüre:** Next.js-16-Doku in `node_modules/next/dist/docs/` vor Änderungen an Routen oder Metadata.
- **Verboten:**
  - Push.
  - Supabase-Migrationen.
  - Echte Mistral-Aufrufe (es laufen Kampagnen).
  - Brevo-Versand.
  - Neue npm-Pakete.
- **Nach jeder Story:** Der PO prüft selbst mit Tests und Screenshots über den Preview-Server und denkt aus Sicht von Lehrkraft und Schüler:in mit.
- **Debug-Spirale:** Nach 3 Fehlversuchen stoppen und den Punkt in `REPORT.md` eintragen.
- **Ende:** `REPORT.md` im Worktree mit erledigten Stories, Screenshots, offenen Fragen und einem fertigen Text für eine Lehrkraft (Link plus 3 Sätze).

## Status

Von Thomas am 24.10.2026 freigegeben (Grilling-Session). Umsetzung durch den PO-Agent im Branch `feat/schule-jung`.

## Verifikation (durch den PO-Agent, von Thomas stichprobenartig)

- `cd web && npx jest && npm run lint && npm run build` laufen grün.
- Preview mit Klassenlink → `/jung` → Wizard → Entwurf (Mistral gemockt bzw. Demo-Weg) → Screenshot in 375 px.
- Test: 25 simulierte Requests über einen Klassen-Token bleiben unter dem Limit, ohne Token greift das IP-Limit.
- Der Erwachsenen-Flow auf `/app` bleibt unverändert (Regressionstests).
