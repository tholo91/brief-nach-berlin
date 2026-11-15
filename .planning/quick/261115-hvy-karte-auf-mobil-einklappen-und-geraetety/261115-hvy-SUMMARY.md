---
quick_id: 261115-hvy
status: complete
commit: e894705
---

# Summary

- Kartenkarte klappt unter md 1,2 s nach dem Eintragen zu; Titel + Chevron bleiben, „Dein Anliegen ist auf der Karte.“ als Unterzeile. Desktop unverändert.
- `device_class` (mobile/tablet/desktop) am Kartenbeitrag, Client-Erkennung inkl. iPad mit Desktop-UA. Consent-Version `letter-signals-2026-11-v4-device-class`, Consent-Text und Datenschutz ergänzt.
- Tests: deviceClass, letterSignal*, successPageExperience grün (38). Browser: Einklappen/Aufklappen mobil per temporärer Vorschauseite geprüft (Zustand per React-State gesetzt, kein echter Supabase-Schreibzugriff).
- Offen: Migration 039 vor dem Push im SQL-Editor ausführen, sonst schlagen Kartenbeiträge fehl.
