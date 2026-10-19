---
quick_id: 261019-trg
status: complete
commit: 0886d6e
---

# Summary: Kampagnen-Stats Fußnote + Stundenverlauf

- „ca. X ohne Doppelte“ steht nicht mehr unter der Briefzahl, sondern in der Fußnote: „… Ohne Doppelte sind es rund X Briefe (pauschal 4 % abgezogen).“ `/stats` unverändert (`DUPLICATE_LETTER_NOTE` baut jetzt auf `DUPLICATE_LETTER_SHARE_NOTE` auf).
- `buildTimeline`: bis 2 Berliner Kalendertage `granularity: "hour"` (volle Stunden als ISO-Zeitpunkt, erste Brief-Stunde bis jetzt bzw. letzter Brief bei beendeten Kampagnen). Status `pending` entfällt, `CREATOR_TIMELINE_MIN_DAYS` heißt jetzt `CREATOR_TIMELINE_HOURLY_MAX_DAYS = 2`.
- UI: „Stärkste Stunde: 18. Okt., 20 Uhr mit 31 Briefen“, Achse/Tooltip in Berliner Zeit, `gap-px` bei Stundenbalken, Hinweis „Ab dem dritten Tag zeigt der Verlauf ganze Tage.“
- Keine Supabase-Änderung: `letter_signals.generated_at` ist `timestamptz`.

## Verification
- jest campaignCreatorStats + internalStats: 150/150 grün; tsc ohne Fehler in `src/`; eslint ok.
- Sichtprüfung Desktop + 375px über temporäre lokale Route mit Fake-Daten (danach gelöscht). Nicht live geprüft.
