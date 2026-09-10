# Schreib Merz: Vorbereitung für den späteren Start

Die Sonderseite `/schreib-merz` funktioniert lokal mit dem bestehenden Kampagnen-Handoff. Für den öffentlichen Start braucht sie zusätzlich einen freigegebenen Kampagnendatensatz. Dieser Commit legt den Datensatz nicht remote an und aktiviert ihn nicht.

## Benötigter Kampagnendatensatz

| Feld | Wert |
| --- | --- |
| `slug` | `schreib-merz` |
| `creator_email` | kontrollierte Projektadresse von Brief-nach-Berlin |
| `title` | `Schreib Merz` |
| `issue_text` | neutraler Fallbacktext mit mindestens 20 Zeichen; die sechs Themen bleiben im Code |
| `description` | Kurzbeschreibung aus `SCHREIB_MERZ_CAMPAIGN` |
| `creator_name` | `Brief-nach-Berlin` |
| `target_level` | `Bund` |
| `target_state` | `null` |
| `target_politician_ids` | `[]` |
| `status` | `active` |
| `moderation_status` | `approved` |
| `email_verified_at`, `activated_at` | tatsächliche Aktivierungszeitpunkte |

Der leere Wert bei `target_politician_ids` ist beabsichtigt: Neben dem vorausgewählten Bundeskanzler bleiben die über die PLZ ermittelten Wahlkreis-MdBs als Alternativen sichtbar. Themen und Textbausteine werden versioniert im Code gepflegt, nicht im Kampagnendatensatz.

## Vor dem öffentlichen Start

1. Migration `021_letter_signals_bundeskanzler.sql` separat auf Supabase anwenden und den Remote-Zustand prüfen.
2. Den Kampagnendatensatz mit den obigen Werten anlegen, freigeben und aktivieren.
3. Den vollständigen Ablauf auf der Live-Umgebung mit einer kontrollierten Testadresse prüfen.
4. Erst danach `schreib-merz.de` und `www.schreib-merz.de` dauerhaft auf `https://brief-nach-berlin.de/schreib-merz` weiterleiten.

Die Anwendung protokolliert keine ausgewählten Themen und überträgt das Anliegen nicht in der URL. Der Übergang in den Wizard nutzt den bestehenden kurzlebigen `sessionStorage`-Handoff.
