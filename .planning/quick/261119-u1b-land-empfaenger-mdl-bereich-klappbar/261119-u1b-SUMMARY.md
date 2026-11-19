---
quick_id: 261119-u1b
status: complete
---
# Summary: Land-Empfänger MdL-Bereich klappbar

- Regierungs-Karten (Landesregierung/Senat, Regierungsspitze) bleiben sichtbar, wenn der MdL-Bereich offen ist.
- „Lieber einer Person im Landtag schreiben?“ ist jetzt ein Auf-/Zuklapp-Button mit Chevron (`aria-expanded`); Zuklappen wählt wieder die vorausgewählte Regierung und setzt Filter zurück.
- Ab 7 lokalen MdLs: Partei-Chips + „MdL suchen“ über den Karten (wiederverwendet `filterCampaignRecipients`).
- Landtags-Suche direkt offen, Link heißt „Nicht dabei? Im ganzen Landtag suchen“.
- Rück-Link unten dynamisch: „Zurück zum Senat“ / „Zurück zur Landesregierung“.
- Hinweis zur Zuordnung (mehrere Landtagswahlkreise) steht jetzt über der MdL-Liste statt über den Regierungs-Karten.

Verifikation: tsc, eslint, Jest 194/194 Suites grün; Preview PLZ 10115 (Desktop + Mobile): Auf-/Zuklappen, CDU-Filter 13→2, Zuklappen wählt Senat.
