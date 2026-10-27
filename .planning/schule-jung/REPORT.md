# REPORT: /schule + /jung (Branch `feat/schule-jung`)

Stand 25.10.2026, nachts. S0 bis S5 sind fertig und im Branch committet, nichts gepusht, `main` unberührt.
Abschluss-Gate grün (Stand nach S6): `npx jest` 166 Suites / 1530 Tests, `npm run lint` 0 Fehler (7 alte Warnungen), `npm run build` Exit 0 (mit Dummy-Umgebung und lokalem Mock, weil der Worktree keine `.env.local` hat; Routen `/jung`, `/schule`, `/schule/ablauf` im Build-Output).

Worktree: `/Users/thomas/Documents/Git Repos/brief-nach-berlin/.claude/worktrees/schule-jung`

## 1 Stories

| Story | Status | Commits | Beleg |
|---|---|---|---|
| S0 Klassenlink-Token und Belastbarkeit | fertig | `d4bf324`, Docs `e57aa1c` | jest: Token (Roundtrip, Manipulation, 14 Tage), Klassen-Bucket, 25 Requests über die echte Route `/api/generate-letter` ohne 429, ohne Token 429 beim 11.; 429-Backoff mit Budget |
| S1 Jugendmodus im Wizard | fertig | `245f380`, Docs `71d150e` | Prompt-Snapshots Klasse 8/10/12 mit und ohne Klassenlink; 6 Erwachsenen-Prompt- und 6 Mail-Snapshots vorher gegen alten Code erzeugt, unverändert grün; Preview 375 px bis „Dein Brief ist fertig“, Event `jung_brief` in der Konsole |
| S2 `/jung` | fertig | `0829329`, Docs `989280b` | Preview 375 px und Desktop; Klassenlink füllt Klasse 9 und PLZ 28195; kaputter Link zeigt Hinweis; `/schreib-merz` vorher und nachher gleich |
| S3 `/schule` + Generator | fertig | `9e5aa11`, QR-Fix `9aa3e3b`, Docs `435042f` | Link erzeugt, geöffnet → `/jung` mit Klasse 9 und PLZ 28195, Token akzeptiert; QR klein und groß decodieren exakt auf den Link; PLZ 00000 → Fehlermeldung |
| S4 `/schule/ablauf` | fertig | `7c00cd6`, Docs `fd4b723` | Druck-PDF: 3 Seiten, jede 210 × 297 mm, ohne Kopf/Fuß, weißer Hintergrund |
| S6 Entwurf auf dem Bildschirm (Entscheidung 1A) | fertig | `342900b`, Docs `36cb04a` | Preview 375 px: Jugend-Erfolgsseite zeigt „Dein Entwurf“ mit Brieftext; Erwachsenen-Erfolgsseite unverändert (Postfach-Hinweis, Karte, Spendenblock) |
| S5 Recht und Feinschliff | fertig | `6f941c9`, Docs `384d29f` | `/datenschutz#jugendmodus`, `/ki-transparenz#schueler`, Sitemap mit allen 3 Seiten, Copy-Check, `npm run lint` ohne Fehler |

Tests: 166 Suites, 1530 Tests grün (vorher 149 / 1424). `npm run lint`: 0 Fehler, 7 Warnungen (alle schon auf `main`).

## 2 Was du zuerst wissen musst

1. **QR-Codes auf `main` sind kaputt.** `web/src/lib/qr-code.ts` überschreibt seit 04.09.2026 (`da627b6`) die Finder-Muster mit dem Timing-Muster. CoreImage (macOS) und Chromes `BarcodeDetector` lesen weder Klassen- noch Kampagnen-Links. Fix ist ein eigener Commit (`9aa3e3b`) mit Regressionstest, nach dem Fix decodieren beide exakt. Ob Handy-Kameras den alten Code trotzdem lesen, habe ich nicht geprüft. Betrifft die QR-Downloads auf Kampagnenseiten: nach dem Merge neu herunterladen und ggf. neu drucken.
2. **Entwurf auf dem Bildschirm (Entscheidung 1A, umgesetzt in S6).** Im Jugendmodus steht der Brieftext jetzt direkt auf der Erfolgsseite, die Mail kommt als Kopie mit der Anschrift für den Umschlag. Für Erwachsene bleibt es bei „nur per Mail“.
3. **Für Erwachsene ändern sich zwei Dinge:** Bei Mistral-429 wartet die Brief-Generierung bis zu 20 s länger (statt nach ca. 6 s abzubrechen), und nach 20 s Wartezeit steht „Viele schreiben gerade, dein Brief kommt gleich.“. Prompt, Mail, Folge-Mail und Kartenfunktion für Erwachsene sind per Snapshot unverändert.
4. **Nichts davon ist live geprüft.** Alles lief lokal mit gemocktem Mistral, Supabase und Brevo (Dummy-Umgebung, weil der Worktree keine `.env.local` hat). Keine echte Mail, kein echter Mistral-Aufruf, keine Migration.

## 3 Was gebaut ist

- **Klassenlink:** `/schule` erzeugt `https://www.brief-nach-berlin.de/jung?k=<Token>` (140 Byte). Token: signiert (eigene MAC-Domäne mit `FEEDBACK_TOKEN_SECRET`), enthält Klasse, Schul-PLZ, Zeitpunkt, gilt 14 Tage. Erzeugung: 10 Links pro Stunde und IP.
- **Limits mit Klassenlink:** Brief 80 Checks pro Stunde und Link (Vorprüfung und Generierung zählen je einmal, also ca. 40 Briefe), Routing-Prefetch 60, Spracheingabe 90. E-Mail-Limit bleibt 3 pro Adresse und Tag. Ohne oder mit ungültigem Token gelten die IP-Limits wie bisher.
- **Jugendmodus:** Prompt-Block mit Klassenstufe, „noch nicht wählen“ (bis Klasse 11) bzw. „bald zum ersten Mal“ (ab 12), „Unterrichtsprojekt“ nur mit gültigem Link, 150 bis 200 Wörter, Ton nach Klassenstufe. Keine Partei/NGO- und Längenauswahl, keine Folge-Mail, kein `letter_signal`, Mail ohne Spendenbitte und ohne Sterne-Bewertung, Erfolgsseite ohne Spendenblock. Event `jung_brief` mit `{klasse, klassenlink}`.
- **Seiten:** `/jung` (Klassenstufe, 8 neutrale Themen-Chips als Satzanfänge, Text oder Sprache), `/schule` (Generator, Vollbild-QR für den Beamer, Prüfliste, Ablauf 45/90, Schulleitung, FAQ), `/schule/ablauf` (drei Druckseiten). Footer-Link „Für Schulen“. Chip-Logik mit `/schreib-merz` geteilt.

## 4 Screenshots und Belege

Alle lokal im Worktree, per `.gitignore` nicht im Repo:

- S1: `.planning/quick/261025-0a4-s1-jugendmodus-im-wizard-schule-jung/screenshots/` (`s1-375-praeferenzen-jugend.jpg`, `s1-375-ebene-jugend.jpg`, `s1-375-brief-fertig-jugend.jpg`)
- S2: `.planning/quick/261025-0kf-s2-jung-einstiegsseite-schule-jung/screenshots/` (`s2-375-jung-klassenlink.jpg`, `s2-375-jung-chips.jpg`, `s2-375-jung-textfeld-cta.jpg`, `s2-desktop-jung-klassenlink.jpg`, `s2-375-jung-link-ungueltig.jpg`, `s2-375-brief-fertig-aus-jung.jpg`, `s2-375-schreib-merz-vorher.jpg`, `s2-375-schreib-merz-nachher.jpg`)
- S3: `.planning/quick/261025-0n9-s3-schule-lehrkraefte-klassenlink-genera/screenshots/` (`s3-375-schule-oben.jpg`, `s3-375-klassenlink-ergebnis.jpg`, `s3-desktop-qr-gross.jpg`, `s3-375-plz-unbekannt.jpg`, `s3-375-ablauf-45.jpg`, `s3-desktop-schule.jpg`, `s3-375-link-oeffnet-jung.jpg`)
- S4: `.planning/quick/261025-0ny-s4-schule-ablauf-druckbares-material-sch/screenshots/` (`s4-druck-a4-seite-1.png` bis `-3.png`, `s4-druck-a4.pdf`, `s4-375-ablauf.jpg`, `s4-desktop-ablauf.jpg`)
- S6: `.planning/quick/261025-2y7-s6-entwurf-im-jugendmodus-auf-dem-bildsc/screenshots/` (`s6-375-jugend-entwurf-oben.jpg`, `s6-375-jugend-entwurf-unten.jpg`, `s6-375-erwachsene-unveraendert.jpg`)

Klickweg `/jung` bis Entwurf: 1 Chip, 1 Satz, „Brief entwerfen“, E-Mail, dann 4 Taps (Weiter, Ebene, Empfänger:in, Brief erstellen). Automatisiert 90 s inklusive Tool-Latenz und Fehlersuche; für Schüler:innen geschätzt 45 bis 60 s plus ca. 15 s Generierung. Nicht mit echten Personen gemessen.

## 5 Was in der Klasse noch haken kann (nicht gebaut)

- Die Anschrift für den Umschlag steht nur in der Mail, nicht unter dem Entwurf auf dem Bildschirm (die Adresslogik steckt im Mail-Builder). Für den Sammelumschlag reicht es, wenn die Lehrkraft sie einmal heraussucht.
- Wizard-Schritt 2 sagt im Jugendmodus weiter „Den fertigen Brief bekommst du per E-Mail.“ Stimmt als Kopie, ist aber nicht mehr der Hauptweg.
- Neuladen im Wizard ab Schritt 3 verliert den Jugendmodus (Zustand nur im Speicher, Handoff dann schon gelöscht). Selten, aber dann schreibt die KI aus Erwachsenensicht.
- Mikrofon-Button im bestehenden `VoiceRecorder` ist 36 px, unter dem 44-px-Tap-Ziel (alle Flows).
- E-Mail-Limit: Vorprüfung und Generierung zählen beide gegen „3 pro Adresse und Tag“, wenn sie auf derselben Server-Instanz landen. Wer zweimal scheitert, kann mit derselben Adresse für 24 h gesperrt sein (bestehendes Verhalten, betrifft auch Erwachsene).
- „Brief anpassen“ aus der Mail nutzt weiter das IP-Limit (15 pro Stunde); in der Stunde selten, zu Hause egal.
- Bestehender Bug: Jede normale Seite druckt leer (globale Druckregel `body > *:not(main)` trifft das Site-Layout). `/schule/ablauf` umgeht das.
- Entwicklung: Der Turbopack-Cache im iCloud-Ordner übersah Dateiänderungen, erst `rm -rf web/.next/dev` half. Für Previews in diesem Repo gut zu wissen.

## 6 Offene Entscheidungen

**1. Entwurf im Jugendmodus zusätzlich auf dem Bildschirm zeigen?** Entschieden: A (Thomas, 25.10.), umgesetzt in S6.

**2. E-Mail-Adressen von unter 16-Jährigen**
A. Vor der ersten Schul-Ansprache kurz rechtlich prüfen lassen (Rechtsgrundlage, ob Hinweis an Eltern nötig ist)
B. So starten: Hinweis „Schul-Mail nutzen“ auf `/schule`, Datenschutz-Abschnitt 22 wie gebaut
C. Klassenmodus nur mit der Adresse der Lehrkraft (bräuchte eine Ausnahme vom E-Mail-Limit)
➡️ Empfehlung: A (Sicherheit: mittel) – ich habe bewusst keine Rechtsaussage zu Minderjährigen geschrieben.

**3. Mistral-Limit vor der ersten Klasse**
A. Beim Mistral-Support ein höheres Limit für Large 3 anfragen (Zahlen in `.planning/research/2026-10-19-mistral-rate-limit.md`)
B. Nur Zwei-Wellen-Ablauf plus das neue Backoff
C. Jugendmodus auf `mistral-medium` umstellen (eigener Topf, 3- bis 5-mal teurer, schreibt kürzer, bräuchte Re-Test)
➡️ Empfehlung: A (Sicherheit: hoch) – kostet nichts außer Wartezeit; 25 gleichzeitige Klicks liegen über 15 pro Minute.

**4. Feedback-Link (heyspeak) in der Jugend-Mail**
A. Im Jugendmodus weglassen, wie Spendenbitte und Sterne-Bewertung
B. Lassen, Feedback von Schüler:innen ist wertvoll
➡️ Empfehlung: A (Sicherheit: mittel) – gleiche Begründung wie bei der Bewertung (freiwillige Datenerhebung bei Minderjährigen).

**5. Debug-Link in der Jugend-Mail (enthält E-Mail und PLZ in der URL)**
A. Im Jugendmodus weglassen
B. Lassen wie bei Erwachsenen (Entscheidung vom 27.05.)
➡️ Empfehlung: A (Sicherheit: mittel) – Datensparsamkeit bei Minderjährigen, Support geht auch ohne.

**6. Ton-Schritt im Jugendmodus**
A. Lassen (Schüler:innen wählen bewusst, wie höflich oder bestimmt sie schreiben)
B. Überspringen, Ton fest „sachlich“, ein Schritt weniger
➡️ Empfehlung: A (Sicherheit: niedrig) – der Schritt kostet 2 Sekunden und ist gutes Unterrichtsmaterial.

**7. Missbrauch über viele Klassenlinks**
A. So lassen (10 Links pro Stunde und IP, je ca. 40 Briefe)
B. Klassenlinks nur per Mail an die Lehrkraft verschicken (Token-Link wie bei Kampagnen)
➡️ Empfehlung: A (Sicherheit: mittel) – Risiko klein, beobachten und nachziehen, falls es auftaucht.

## 7 Nachricht an eine Lehrkraft (erst nach Merge und Deploy senden)

```text
Moin [Name],

ich hab mit Brief-nach-Berlin eine Unterrichtsidee gebaut: Deine Klasse schreibt in einer Stunde echte, handgeschriebene Briefe an ihre Abgeordneten, auch wenn die meisten noch nicht wählen dürfen. Unter https://www.brief-nach-berlin.de/schule erstellst du einen Klassenlink mit QR-Code und findest einen Ablauf für 45 oder 90 Minuten mit Arbeitsblatt, kostenlos und ohne Accounts. Hast du Lust, es mit einer 8., 9. oder 10. Klasse auszuprobieren und mir danach zu sagen, was in der Stunde gehakt hat?

Danke für deine Zeit,
Thomas
```

Stil nach deinen NGO-Erstmails, Sicherheit niedrig (kein Lehrkraft-Beispiel im Stil-Archiv). Bei förmlicher Ansprache auf „Sie“ umstellen.

## 8 Nächste Schritte

1. Review der Commits (`git log main..feat/schule-jung`), besonders `9aa3e3b` (QR) und `245f380` (Prompt).
2. Entscheidungen 2 und 3 treffen (1 ist umgesetzt), 4 bis 7 bei Gelegenheit.
3. Merge nach `main` (Fast-Forward oder Squash), danach Worktree aufräumen:

```bash
git worktree remove ".claude/worktrees/schule-jung"
```
