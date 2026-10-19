---
created: 2026-10-19T00:00:00.000Z
title: Innenminister:innen der Laender als optionaler Brief-Empfaenger
area: product
files:
  - web/data/landesregierung-addresses.json
  - web/src/lib/lookup/landesregierungRecipient.ts
  - web/src/lib/lookup/resolveRecipient.ts
  - web/src/components/wizard/Step3Success.tsx
  - web/src/lib/generation/generateLetter.ts
  - web/supabase/migrations/017_letter_signals.sql
  - web/supabase/migrations/023_campaign_fixed_recipient.sql
  - .claude/skills/refresh-after-bundestagswahl/SKILL.md
---

# Story: Innenminister:innen der Länder als Brief-Empfänger

Status: backlog (nur Story, nicht umsetzen; Stand 19.10.2026)

## Story

Als Bürgerin oder Bürger, die bzw. der über eine Landeskampagne wie `prueft-die-afd` einen Brief schreibt,
möchte ich den Brief wahlweise an die Innenministerin bzw. den Innenminister (in Stadtstaaten: Senator:in für Inneres) meines Bundeslands adressieren können,
damit mein Anliegen bei der fachlich zuständigen Stelle und nicht nur bei der allgemeinen Regierungsspitze ankommt.

## Anlass

- Kampagne `prueft-die-afd` (Verein innn.it, Ebene Land ohne festes Bundesland, 378 Briefe) bittet die Landesregierung, sich im Bundesrat für einen Antrag nach Art. 21 GG / § 43 BVerfGG beim Bundesverfassungsgericht einzusetzen.
- Entscheidung vom 19.10.2026: Der Antrag wird vorerst nicht umgesetzt. Parallel wird für diese Kampagne Regierungschef:in statt der anonymen Landesregierung vorausgewählt (bestehende Option `addressee: "head"`).
- Diese Story hält die Idee fest, den Empfängerkreis um das Innenressort zu erweitern.

## Produktentscheidung / Hintergrund

- Über das Abstimmungsverhalten im Bundesrat entscheidet das Kabinett. Die Regierungsspitze hat die Richtlinienkompetenz, die Staatskanzlei koordiniert.
- Fachlich zuständig ist das Innenministerium: Der Landesverfassungsschutz liefert das Material, die Länder stimmen sich über die Innenministerkonferenz ab.
- In Koalitionen liegt das Innenressort oft beim anderen Partner als die Regierungsspitze. Ein direkter Brief stärkt diese Stimme im Kabinett.
- Briefe an die Staatskanzlei werden meist ohnehin an das Fachministerium weitergegeben. Das Produkt darf eine Weiterleitung trotzdem nie zusagen.
- Das Feature ist allgemein gedacht: Auch andere Landeskampagnen könnten Fachminister:innen brauchen. Innen ist der erste Fall, weitere Ressorts sind nicht Teil dieser Story.
- Nichts raten: Fehlt der Datensatz eines Landes, wird die Option nicht angezeigt.

## Datenbedarf pro Land (16, Stadtstaaten: Senator:in für Inneres)

- Name
- offizieller Amtstitel
- Anrede (Salutation)
- Postanschrift des Ministeriums, nur wenn abweichend von der Staats- bzw. Senatskanzlei (sonst Verweis auf die vorhandene Anschrift)
- offizielle Quell-URL
- Quelltitel
- `verifiedAt`

Pflege analog zu `headOfGovernment` in `web/data/landesregierung-addresses.json` (neuer optionaler Block je Land, z. B. `interiorMinister`).

Hinweis: Berlin (Wahl 20.09.2026), Mecklenburg-Vorpommern (20.09.2026) und Sachsen-Anhalt (06.09.2026) bilden gerade neue Regierungen. Namen und Titel erst bei Umsetzung recherchieren, nicht vorab.

## Bestehender Code, an den das andockt (verifiziert am 19.10.2026)

- `web/data/landesregierung-addresses.json`: je Land `institution` plus optional `headOfGovernment`.
- `web/src/lib/lookup/landesregierungRecipient.ts`: `addressee: "institution" | "head"`, `getLandesregierungRecipient` gibt `null` zurück, wenn `head` fehlt.
- `web/src/lib/lookup/resolveRecipient.ts`: Empfänger wird serverseitig aus der PLZ neu abgeleitet, der Client schickt keine Namen oder Adressen.
- `web/src/components/wizard/Step3Success.tsx`: Option „Regierungschef:in“ erscheint nur bei Landeskampagnen ohne `targetState`.
- `web/src/lib/generation/generateLetter.ts`: Anrede und Prompt-Branch für den Landesregierungs-Empfänger.
- `letter_signals.recipient_kind` kennt `'landesregierung'` (Migration `web/supabase/migrations/017_letter_signals.sql`, erweitert in `023_campaign_fixed_recipient.sql`).

## Acceptance Criteria

1. **Datensatz für alle 16 Länder**
   - Given die Datei `landesregierung-addresses.json`,
   - then enthält jedes Land einen optionalen Innenressort-Block mit Name, Amtstitel, Anrede, Quell-URL, Quelltitel und `verifiedAt`; die Postanschrift nur bei Abweichung von der Staats- bzw. Senatskanzlei.
   - Stadtstaaten führen den Titel „Senator:in für Inneres“ (bzw. den amtlichen Titel).
   - Fehlende oder nicht verifizierte Einträge werden nicht geraten.

2. **Neuer Addressee im Recipient**
   - `addressee` wird um einen Wert für das Innenressort erweitert (Name wird bei Umsetzung festgelegt).
   - `getLandesregierungRecipient` liefert `null`, wenn der Block fehlt; ohne Postanschrift im Block wird die vorhandene Anschrift der Kanzlei verwendet.

3. **Serverseitige Ableitung**
   - Der Client sendet nur den diskriminierten Auswahltyp, keine Namen, Titel, Anschriften oder Bundesland-Keys.
   - `selectPoliticianAction`, `resendLetterAction` und `/api/generate-letter` validieren den neuen Wert und leiten den Empfänger über PLZ -> Bundesland -> Datensatz neu ab (Muster wie bei `head`).
   - Eine manipulierte Client-Eingabe kann den Empfänger nicht beeinflussen.

4. **Wizard**
   - In `Step3Success.tsx` erscheint die Option nur, wenn das Kampagnenziel sie erlaubt und für das Bundesland ein Datensatz existiert.
   - Fehlt der Datensatz, wird die Option nicht angezeigt und der Flow bleibt unverändert (kein Fehler, keine leere Karte).
   - Der Bund- und Kommune-Flow bleibt unverändert.

5. **Brief und Anrede**
   - Die Anrede kommt aus dem gepflegten Datensatz (Salutation).
   - Das Prompt-Framing für ein Fachministerium erfindet keine Zuständigkeiten, Programme, Ausschüsse oder Namen und sagt keine Weiterleitung oder persönliche Kenntnisnahme zu.

6. **E-Mail, Erfolgsscreen und Signale**
   - Adressblock, Betreff, Intro und Share-Copy nennen das Innenministerium bzw. die Senatsverwaltung für Inneres korrekt, nie Landtag oder MdL.
   - Der Resend-Pfad erzeugt dieselbe Mail wie der Erstversand.
   - Die Signalerfassung ist mit dem Ergebnis der offenen Frage 3 konsistent; bei neuem Signal-Typ gibt es eine Migration, die den `recipient_kind`-Check erweitert.

7. **Tests**
   - Datentest: alle 16 Länder geprüft, Pflichtfelder vorhanden, Stadtstaaten-Titel korrekt.
   - Recipient-Tests: Anrede, Label und Anschrift je Land; Fallback auf Kanzleianschrift; `null` bei fehlendem Datensatz.
   - Sicherheitstests: serverseitige Ableitung, manipulierte Selection beeinflusst den Empfänger nicht.
   - Wizard-Test: keine Option bei fehlendem Datensatz.
   - Regressionen für `institution` und `head` bleiben grün.

8. **Prüfung im Wizard**
   - Manuell bzw. per Test mit je einer PLZ aus Berlin, Baden-Württemberg und Sachsen-Anhalt: Option sichtbar bzw. korrekt ausgeblendet, richtiger Titel und richtige Anrede im Brief, korrekte Anschrift in der Mail-Vorschau.
   - Kein Mistral-Aufruf mit echten Nutzerdaten und kein echter Versand für diese Prüfung.

9. **Pflege-Runbook**
   - Der Abschnitt „Nach Landtagswahlen“ in `.claude/skills/refresh-after-bundestagswahl/SKILL.md` wird um die Innenminister:innen ergänzt: erst tauschen, wenn die neue Regierung im Amt ist und das Innenressort feststeht; `verifiedAt` pro Eintrag und in `_meta` aktualisieren.
   - Berlin, Mecklenburg-Vorpommern und Sachsen-Anhalt sind die ersten Fälle (neue Regierungen nach den Wahlen im September 2026).

## Offene Fragen

1. **Global für alle Landeskampagnen oder pro Kampagne einstellbar (Kampagnenformular)?**
   Empfehlung: pro Kampagne einstellbar, weil nicht jedes Anliegen ins Innenressort gehört; Default aus, bis die Kampagne es aktiviert.

2. **Bleibt der Default Regierungschef:in bzw. Landesregierung?**
   Empfehlung: ja. Der Innenminister ist eine bewusste zusätzliche Option, kein neuer Standard. Bei `prueft-die-afd` bleibt Regierungschef:in vorausgewählt.

3. **Eigener Signal-Typ oder weiter `landesregierung`?**
   Empfehlung: weiter `landesregierung`, solange nur der Addressee wechselt. Ein eigener Typ lohnt erst, wenn die Auswertung ihn wirklich braucht; er erfordert eine Migration.

4. **Prompt-Framing für ein Fachministerium ohne erfundene Zuständigkeiten?**
   Empfehlung: nur die Rolle aus dem Amtstitel verwenden, die Zuständigkeit allgemein halten ("Ihr Haus", "Ihr Ressort") und keine konkreten Gremien oder Verfahren nennen, die nicht im Datensatz oder in der Kampagne stehen.

## Nicht im Scope

- Keine Umsetzung jetzt, keine Recherche echter Namen oder Adressen.
- Keine weiteren Fachressorts über Innen hinaus.
- Keine Änderung an Bund- und Kommune-Logik.
- Keine Weiterleitungs- oder Antwortzusagen in der Copy.

## Verwandte Backlog-Punkte

- `2026-07-19-land-empfaenger-landesregierung-landtag-oder-mdl-entscheiden.md`
- `.planning/phases/999.6-landtag-and-kommune-politician-coverage-expansion/999.6.2-landesregierung-default-STORY.md`
