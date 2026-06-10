# Stats — Brief nach Berlin

Stand: 2026-06-09

## Briefe

- **Generierte Briefe (counter):** 661
- **Feedback-Rücklauf (Reviews gesamt):** 91 → 13,8% Feedback-Quote

## Letter Sent (Selbstauskunft im Feedback)

| Antwort | Anzahl |
|---|---|
| Ja, abgeschickt | 53 |
| Nein | 17 |
| Frage übersprungen (null) | 21 |
| **Reviews gesamt** | **91** |

## Prozentual

- **Von den 70 Antwortenden:** 75,7% haben den Brief tatsächlich abgeschickt
- **Von allen 91 Reviews:** 58,2% bestätigt abgeschickt
- **Von allen 661 generierten Briefen:** 8,0% bestätigt abgeschickt (Rest = Dunkelziffer, kein Feedback)

## Versand-Rhythmus (Brevo-Logs)

Quelle: Brevo Mail-Logs, Tag `brief`. Enthält **nur** Mails mit `brief`-Tag — andere Tags (z. B. Feedback-Reminder) sind nicht erfasst.
Zeitraum: **22.05.2026 – 08.06.2026** (18 Tage). Basis: **311 versendete Brief-Mails** (unique mid).

- **Ø ~17,3 Briefe/Tag** über den gesamten Zeitraum
- Spitzentag: **Mo 01.06.2026 mit 48 Briefen** (Tag nach Weser-Kurier-Artikel über Thomas, gedruckt am Wochenende 30./31.05.)
- Schwächster voller Tag: Sa 06.06. mit 5

### Pro Tag

| Datum | Briefe |
|---|---|
| Fr 22.05. | 9 |
| Sa 23.05. | 12 |
| So 24.05. | 13 |
| Mo 25.05. | 6 |
| Di 26.05. | 19 |
| Mi 27.05. | 16 |
| Do 28.05. | 10 |
| Fr 29.05. | 11 |
| **Sa 30.05.** | **30** ← Weser-Kurier-Artikel erscheint |
| **So 31.05.** | **28** |
| **Mo 01.06.** | **48** ← Peak |
| Di 02.06. | 26 |
| Mi 03.06. | 14 |
| Do 04.06. | 24 |
| Fr 05.06. | 16 |
| Sa 06.06. | 5 |
| So 07.06. | 18 |
| Mo 08.06. | 6 (Teiltag) |

**Wochenende-Muster:** Kein durchgängiges "Wochenende = schwach". 4 von 6 Wochenend-Tagen lagen über dem Schnitt (u. a. Weser-Kurier-Welle). Nur einzelne Samstage fallen ab.

**Presse-Effekt (Weser-Kurier):** 30.05.–02.06. (4 Tage) brachten **132 Briefe = 42% des gesamten 18-Tage-Volumens**. Effekt ebbt nach ~4 Tagen ab auf ein erhöhtes neues Baseline-Level (Di 02.06. noch 26, Mi 03.06. wieder 14).

### Stoßzeiten (Stunde, alle Tage zusammen)

Breite Verteilung über den ganzen Tag, mehrere Peaks:

- **10–13 Uhr:** 86 Briefe (Vormittag bis Mittag — stärkster Block)
- **16–17 Uhr:** 42 (Feierabend)
- **22 Uhr:** 19 (Spätabend)
- Schwache Zeiten: 00–05 Uhr (Nacht), 23 Uhr fällt ab

### Bevölkerungsgruppen — Caveat

Aus Brevo-Logs allein (Timestamp + E-Mail) lassen sich **keine seriösen Cluster** ableiten. Vorsichtige Hypothesen: starker Vormittags-Block werktags → evtl. Rentner/Home-Office/Elternzeit; Spätabend-Peak → eher Berufstätige nach Feierabend. Für belastbare Segmente: PLZ-Auswertung aus Supabase nötig.

## Caveats

- `letter_sent` ist Selbstauskunft im Feedback-Formular nach Klick auf den Mail-Link.
- Tatsächliche Versand-Quote liegt vermutlich höher (viele klicken den Feedback-Link nicht, schicken den Brief aber trotzdem ab).
- Quelle: Supabase `counters.letter_count` + `reviews.letter_sent`.
