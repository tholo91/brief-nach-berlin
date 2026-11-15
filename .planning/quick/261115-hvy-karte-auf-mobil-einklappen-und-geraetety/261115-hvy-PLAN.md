---
quick_id: 261115-hvy
mode: quick
---

# Karte auf Mobil einklappen und Gerätetyp in Letter-Signals

## Task 1: Kartenkarte klappt auf Mobil nach dem Eintragen ein
- files: web/src/components/wizard/LetterSignalCard.tsx, web/src/__tests__/successPageExperience.test.ts
- action: Unter `md` (max-width 767px) klappt die Karte nach Flug-Animation plus kurzer Pause zu. Titel bleibt stehen, rechts Chevron zum Auf- und Zuklappen. Spendenkarte rückt dadurch hoch. Desktop unverändert.
- verify: `npx jest successPageExperience`, Browser-Check mobil
- done: Nach Eintragen auf Mobil nur Titel + Chevron sichtbar, Tippen klappt auf.

## Task 2: Gerätetyp in letter_signals
- files: web/src/lib/letterSignals/deviceClass.ts, web/src/lib/letterSignals/types.ts, web/src/lib/actions/letterSignals.ts, web/src/components/wizard/LetterSignalCard.tsx, web/supabase/migrations/039_letter_signals_device_class.sql, web/supabase/MIGRATION_STATUS.md, Datenschutzseite, Tests
- action: Client bestimmt `mobile | tablet | desktop` (iPad mit Desktop-UA über maxTouchPoints). Server validiert per Zod und speichert `device_class`. Consent-Text, Consent-Version und Datenschutz nennen den Gerätetyp.
- verify: `npx jest letterSignal successPageExperience`
- done: Neue Kartenbeiträge tragen den Gerätetyp. Migration 039 muss vor dem Push laufen.
