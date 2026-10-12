---
created: 2026-10-11T13:30:00.000Z
title: "Doppelte Brief-Mails: derselbe Brief wird manchmal zweimal erzeugt und verschickt"
area: briefgenerierung
severity: minor
files:
  - web/src/components/wizard/Step3Success.tsx
  - web/src/app/api/generate-letter/route.ts
  - web/src/lib/email/sendLetterEmail.ts
---

## Anlass

Nutzerin Nomy (GMX, Android) meldete am 2026-10-09 per Mail: zweimal je zwei Briefentwürfe zum selben Anliegen, etwa 1 Minute auseinander, die ersten Sätze identisch, danach leicht abweichend. Am 08.10. um 20:09 („Dein Brief nach Berlin ist fertig“), am 09.10. um 08:47/08:48 („Dein Brief ans Rathaus ist fertig“). Sie war irritiert, welchen sie nehmen soll.

Entscheidung 2026-10-11: **vorerst nicht fixen.** Der Schaden ist klein: einige Prozent zusätzliche Mistral- und Brevo-Calls und gelegentliche Verwirrung, aber niemand verliert etwas. Wieder aufgreifen, falls sich weitere Leute beschweren oder die Brevo-Kosten spürbar werden.

## Erkenntnisse und Sicherheit

1. **Verifiziert (Brevo-Log):** Alle 4 Mails von Nomy tragen das Tag `brief`, keine `brief-resend`. Es waren also zwei echte Generierungen, kein Klick auf „Keine E-Mail erhalten?“.
2. **Verifiziert (Brevo-Export 08.10. 00:06 bis 11.10. 15:03, 2.562 Brief-Mails):** 161 Paare mit gleicher Adresse, gleichem Betreff und gleichem Tag innerhalb von 5 Minuten, das sind rund 6 % aller Mails. Davon 64 Paare mit weniger als 60 s Abstand (rund 2,5 %). Verteilung: unter 30 s: 13, 30 bis 60 s: 51, 60 bis 120 s: 38, 2 bis 5 min: 59.
3. **Inferenz, hohe Sicherheit:** Paare unter 60 s sind fast sicher Duplikate, weil ein bewusster zweiter Brief an eine andere Person länger dauert. Die längeren Abstände können auch echte Zweitbriefe sein (z. B. an ein anderes MdB im Wahlkreis). Trennen lässt sich das nicht, weil nicht gespeichert wird, an wen ein Brief ging.
4. **Verifiziert (Code gelesen, nicht live getestet):** Ein einzelner Klick erzeugt nur eine Mail. Der Fetch-Guard `fetchInFlightRef` in `Step3Success.tsx` und `disabled={isGenerating}` blockieren Doppelklicks. Es gibt keinen automatischen Retry. Der Server hat aber **keinen Schutz gegen doppelte Requests**: Jeder Request an `/api/generate-letter`, der ankommt, generiert neu und verschickt die Mail in `after()`.
5. **Inferenz, mittlere Sicherheit, Ursache nicht bewiesen:** Am wahrscheinlichsten hängt die Seite oder wird auf dem Handy neu geladen bzw. im Hintergrund beendet, und die Person schickt noch einmal ab. Möglich ist auch „Nochmal versuchen“ nach einem angezeigten Fehler. Vercel-Logs für die Zeitpunkte wurden nicht geprüft.
6. **Offen:** Ob das Problem neu ist. Am 08.10. und 09.10. änderten sich die Fehler- und Abbruch-Behandlung (Commits ea95a70, e86cea3), der Export deckt nur die Zeit danach ab. Ein Brevo-Export aus dem September würde zeigen, ob die Quote vorher niedriger war.

## Lösungsideen (falls es wieder hochkommt)

1. **Sperre im Server über Supabase:** Schlüssel aus Hash von E-Mail, Person und Anliegen, 3 Minuten gültig. Kommt derselbe Schlüssel nochmal, geht keine zweite Mail raus. Last ist vernachlässigbar (eine kleine Zeile pro Brief, nach Ablauf löschbar). Bei Supabase-Fehler den Brief trotzdem senden (fail-open). Ein zweiter Brief an eine andere Person bleibt erlaubt.
2. **Sperre nur im Browser:** gleiches Anliegen an dieselbe Person nicht neu erzeugen, z. B. über sessionStorage. Ohne Supabase, greift aber nicht nach einem kompletten Neuladen.
3. Prüfen per Jest-Test, der zwei Requests schickt und erwartet, dass nur eine Mail rausgeht.

## Nebenbefund

GMX markiert einen Teil der Brief-Mails als „Newsletter“, sogar uneinheitlich innerhalb eines Paars. Das ist die automatische Sortierung von GMX, kein Header aus dem Code. Abstellen lässt es sich höchstens durch schlichtere Mails.
