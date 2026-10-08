---
created: 2026-10-08T20:09:36.233Z
title: "Brieflänge: Mistral hält 1,5 und 2 Seiten nicht ein"
area: generation
severity: minor
files:
  - web/src/lib/generation/generateLetter.ts:573 (<ziel>: Wortfenster pro Länge, aber "absaetze: 3 bis 4" fix für alle Längen)
  - web/src/lib/generation/generateLetter.ts:669-725 (Längen-Retry, Korridor ±15 %)
  - web/src/lib/config.ts:23 (LETTER_LENGTHS: 1 = 200-240, 1,5 = 310-350, 2 = 420-460 Wörter)
---

## Problem

Wer im Wizard "1,5 Seiten" oder "2 Seiten" wählt, bekommt im ersten Mistral-Versuch fast immer einen Ein-Seiten-Brief. Erst der Längen-Retry (zweiter kompletter Mistral-Call, etwa 8 s extra) macht ihn länger, erreicht das Zielfenster aber selten.

Belege (Stand 07./08.10.2026):

- **Vercel-Logs 07.10. abends (47 Briefe):** Länge 1,5 brauchte in 6 von 6 Fällen den Retry, nur einmal lag der Brief danach im Zielfenster (typisch 218 → 276 und 231 → 262 Wörter bei Ziel 310-350). Länge 1: 19 von 40 mit Retry.
- **Lokaler A/B-Test** (8 Testanliegen, Fake-MdB ohne MdB-Kontext, nur erster Versuch gemessen):

  | Länge | Ziel | Heute (Median) | Mit mehr Absätzen (1,5: 4-5, 2: 5-6) |
  |---|---|---|---|
  | 1,5 | 310-350 | 178 | 207 |
  | 2 | 420-460 | 185 | 249 |

  In allen 32 Fällen wäre trotzdem ein Retry fällig gewesen. Mehr Absätze bringen nur 30-60 Wörter und eher Füllstoff: Ein Testbrief erfand "Die Elterninitiative vor Ort hat wiederholt auf die Missstände hingewiesen".
- **Reviews in Supabase** (497 seit Januar, Abfragelimit 500 erreicht): 85 % mit 4-5★. Tags "zu_kurz" 2×, "zu_lang" 2×. In Freitexten eher "zu lang", etwa: 1,5 Seiten gewählt, handschriftlich wurden es 2,5.
- **Zusammenhang mit Fehler-Reports:** Lange Briefe mit Retry warten am längsten. Beide Netzwerkabbruch-Reports vom 07.10. (Politiker 68440 und 68463) waren Länge 1,5 mit Retry. Alleinige Ursache für die Abbrüche ist das vermutlich nicht (Inferenz aus 2 Fällen).

Das Testskript lag nur im Scratchpad: Monkeypatch auf `mistral.chat.complete`, Variante B ersetzt `absaetze: 3 bis 4` im User-Prompt, Retry-Calls werden abgefangen. Bei Bedarf nach dem Muster von `web/scripts/test-argument-chain.ts` neu bauen.

## Solution

Entscheidung am 08.10.2026: Prompt und Retry vorerst nicht ändern. Die Nutzer sind mit den Briefen zufrieden, die Länge ist kein Beschwerdethema, und jede Prompt-Änderung riskiert die Qualität (erfundene Details).

Wenn das Thema wieder aufkommt (Reviews zur Länge oder gehäufte Abbrüche bei langen Briefen):

1. Erst messen: Mit dem schlanken Fehler-Logging (Wartezeit, Brieflänge, Seite im Hintergrund) prüfen, ob Abbrüche bei Länge 1,5 und 2 gehäuft auftreten.
2. Ehrliche Optionen statt Prompt-Druck: Längen-Labels an das anpassen, was Mistral tatsächlich liefert (etwa "kurz / ausführlich" statt Seitenzahlen), oder "2 Seiten" streichen. Handschriftlich wird ein Brief ohnehin länger als getippt.
3. Falls doch der Prompt angefasst wird: ein Wortziel pro Absatz statt einer Gesamtwortzahl testen, mit demselben A/B-Aufbau und einer Prüfung auf erfundene Details.
4. Phase 999.20 in `.planning/ROADMAP.md` ("öfter retryen") nach diesen Daten zurückstellen.

Verwandt: `.planning/todos/pending/2026-10-07-kampagnenbriefe-mit-kleiner-prompt-anpassung-variieren.md` berührt ebenfalls den Längen-Retry.
