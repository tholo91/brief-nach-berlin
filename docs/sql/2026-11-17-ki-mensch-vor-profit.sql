-- ki-mensch-vor-profit: Kampagne wurde am 2026-11-17 per Service-Role-Skript direkt angelegt
-- (draft -> awaiting_approval -> paused, moderation approved, Bund, ohne Logo).
-- Dieses SQL ist nur der Pflegepfad, falls die Texte später ersetzt werden sollen. Nicht ausgeführt.
-- Texte: .planning/kampagnen-varianten/ki-mensch-vor-profit-2026-11-17.json (texts[0] = Haupttext, [1], [2] = Alternativen)
select slug, status, moderation_status, target_level,
       1 + cardinality(issue_text_alternatives) as anzahl_vorlagen,
       issue_text_alternatives_base = issue_text as basis_passt, letter_count
from public.campaigns
where slug = 'ki-mensch-vor-profit';
