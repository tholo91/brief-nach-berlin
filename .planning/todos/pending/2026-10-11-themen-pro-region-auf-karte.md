# Idee: "Was schreibt meine Region?" auf der Karte

Geparkt am 2026-10-11 (aus Quick-Task 261011-lgc, Karten-Zoom).

Region in der großen Karte antippen und die Top-Themen sehen (z.B. "Bahn, Mieten, Schulen"). Keine Brieftexte, die werden nicht gespeichert.

## Vorher klären
1. Einwilligung: Der aktuelle Text in `web/src/components/wizard/LetterSignalCard.tsx` sagt "Öffentlich erscheint nur ein Punkt bei deiner ungefähren PLZ". Öffentliche Themen sind davon nicht gedeckt, also neue `consent_version` + Datenschutz-Text nötig, Altbestand nicht zeigen.
2. Mindestanzahl pro Region (z.B. ab 5 Briefen), damit kleine PLZ niemanden identifizierbar machen.
3. Neue Supabase-RPC für aggregierte `topic_labels` pro Region (Bundesland oder PLZ-2-Präfix).
