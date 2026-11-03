# Regierungschef:in als Alternative in der normalen Land-Strecke

## Context
Wer in der normalen Brief-Strecke die Landesebene wählt, sieht nur die Landesregierung (oder den Senat) plus den Link zum Personenpfad. In Land-Kampagnen ohne festes Bundesland gibt es zusätzlich die Karte Regierungschef:in. Diese Karte soll auch in der normalen Strecke erscheinen, die Landesregierung bleibt dort vorausgewählt.

Entschieden im Grilling:
- Gemeint ist die Regierungschef:in, keine Fachminister:innen (dafür bleibt die Story `2026-10-19-innenminister-als-land-empfaenger.md` im Backlog).
- Land-Kampagnen ohne festes Bundesland bleiben unverändert: dort ist die Regierungschef:in vorausgewählt.
- Kampagnen mit festem Bundesland bleiben unverändert: nur die Institution.

Daten, Karte, Server-Auflösung (`resolveRecipient.ts:141-156`, ohne Kampagnen-Prüfung), Prompt und Mail können `addressee: "head"` schon. Die Sperre sitzt nur in der UI.

## Änderungen
Über `/gsd:quick`. Einzige Code-Datei: `web/src/components/wizard/Step3Success.tsx`. Keine neue Gestaltung, die vorhandene Karte wird wiederverwendet, deshalb kein Design-Skill nötig.

1. **Karte freischalten** (Zeile 153-159): Bedingung wird `landesregierung && !wizardData.campaign?.targetState`, Dependency-Array anpassen.
2. **Vorauswahl** : neue Konstante `headPreselected = Boolean(governmentHead && wizardData.campaign)`. Einsetzen an zwei Stellen:
   - `useState`-Default von `landAddressee` (Zeile 232)
   - „Zurück zur Landesregierung" (Zeile 1923), sonst springt die Auswahl nach dem Rückweg auf die Regierungschef:in
3. **Einleitungstext** (Zeile 1284-1286): Aktuell sagt der Text bei vorhandener `governmentHead`, die Regierungsspitze sei vorausgewählt. Drei Fälle:
   - `headPreselected`: bisheriger Text
   - `governmentHead` ohne Vorauswahl: „Die Landesregierung ist vorausgewählt. Du kannst stattdessen an die Regierungsspitze oder an ein Mitglied des Landtags schreiben." (bei `institutionKind === "senat"`: „Der Senat ist vorausgewählt. …")
   - sonst: „Der institutionelle Empfänger ist bereits vorausgewählt."
4. **Daten prüfen**: Die Köpfe von BE, MV und ST sind vom 24.09.2026 und stehen laut Story in Regierungsbildung. Die Namen werden jetzt für viel mehr Menschen sichtbar. Vor dem Push per Webrecherche auf amtlichen Seiten prüfen; bei neuer Regierung `web/data/landesregierung-addresses.json` inkl. `verifiedAt` aktualisieren.

## Tests
In `web/src/__tests__/step3Landesregierung.test.ts` (Jest läuft nur `*.test.ts`, Mistral bleibt gemockt):
- Normale Strecke Bremen: Karte Regierungschef:in sichtbar, Institution `aria-checked="true"`, Regierungschef:in `aria-checked="false"`, neuer Einleitungstext.
- Bestehender Kampagnentest bleibt grün (Regierungschef:in vorausgewählt).
- Kampagne mit `targetState`: weiterhin keine Regierungschef-Karte. Falls schon abgedeckt, nichts ergänzen.

Prüfen, dass bestehende Tests mit dem alten Einleitungstext nicht brechen.

## Verifikation
- `cd web && npx jest step3Landesregierung landesregierung prepareLetterEmailLandesregierung campaignTargetLevel`
- `npx tsc --noEmit` und `npm run lint`
- Lokal im Browser: PLZ 28203, Landesebene wählen. Prüfen: Vorauswahl Senat, Wechsel auf Regierungschef:in ändert die Überschrift, Personenpfad und Rückweg landen wieder auf dem Senat, Mobilbreite passt.
- Keine echte Brieferzeugung: Die Abzweigung `addressee: "head"` ist durch vorhandene Tests abgedeckt, das Mistral-Kontingent bleibt unberührt.

## Nicht Teil davon
Fachminister:innen, Thema-zu-Ressort-Zuordnung, Änderungen an Kampagnen-Formularen. Commit und Push nur auf Thomas' Ansage; der Arbeitsbaum enthält fremde Änderungen, die unberührt bleiben.
