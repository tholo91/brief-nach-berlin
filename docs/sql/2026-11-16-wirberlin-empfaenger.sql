-- wirBERLIN Plakatwettbewerb: Empfänger gegendert (Wunsch von Anne Sebald, 16.11.2026).
-- Empfänger ist nach Aktivierung gesperrt, deshalb einmalig direkt in der DB.
-- Im Supabase SQL-Editor nacheinander ausführen.

-- 1) Prüfen: Es muss genau eine Zeile kommen.
select id, slug, title, status, target_recipient
from public.campaigns
where target_level = 'Fixed'
  and title ilike '%plakat%';

-- 2) Ändern. Bricht mit "more than one row" ab, falls 1) mehrere Zeilen zeigt.
update public.campaigns
set target_recipient = jsonb_build_object(
  'organizationName', 'Senatskanzlei',
  'personName', 'Amt der Regierenden/r Bürgermeister*in',
  'salutation', 'Sehr geehrte Damen und Herren',
  'street', 'Jüdenstraße',
  'houseNumber', '1',
  'postalCode', '10178',
  'city', 'Berlin',
  'countryCode', 'DE'
)
where id = (
  select id from public.campaigns
  where target_level = 'Fixed' and title ilike '%plakat%'
)
returning id, slug, target_recipient;
