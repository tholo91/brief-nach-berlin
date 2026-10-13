-- eeg-so-nicht: Den aktuellen Haupttext behalten und Thomas' Original ergänzen.
-- Im Supabase SQL Editor als vollständigen Block ausführen.
-- Vorbereitet, nicht ausgeführt. Stand des Haupttexts: 2026-10-13.

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  originaltext text := $original$ich bitte Sie, EEG-Novelle und Netzpaket in der vorliegenden Form nicht zuzustimmen.
Deutschland braucht günstigen, verlässlichen Strom. Wind und Solar gehören zu den günstigsten neuen Stromquellen. Gleichzeitig wollen mehr Investoren Windparks bauen, als derzeit zum Zug kommen.
Der geplante Redispatchvorbehalt erhöht jedoch das Risiko für neue Anlagen: Wird ein Windpark wegen überlasteter Netze abgeregelt, soll der Betreiber stärker auf Einnahmen verzichten. Das verteuert Finanzierung und kann Projekte verhindern.
Alle 16 Energieminister der Länder haben sich gegen zentrale Teile dieser Reform gestellt. Sie fordern unter anderem bessere Bedingungen für Netze, Speicher, flexible Anschlüsse und Dach-PV.
Hinzu kommt unsere fossile Abhängigkeit: Deutschland zahlt jedes Jahr Milliarden für Öl, Gas und Kohle ins Ausland. Seit Beginn des Iran-Kriegs hat die EU mehr als 100 Milliarden Euro zusätzlich für fossile Energieimporte bezahlt – ohne dafür zusätzliche Energie zu erhalten.
Auch Klimaschäden kosten längst Milliarden.
Deutschland braucht deshalb mehr heimische Energie, weniger Abhängigkeit von fossilen Weltmärkten und Regeln, die Investitionen erleichtern.
Bitte stimmen Sie den Gesetzen in dieser Form nicht zu.$original$;
begin
  select * into c
  from public.campaigns
  where slug = 'eeg-so-nicht'
  for update;

  if not found then
    raise exception 'Kampagne eeg-so-nicht wurde nicht gefunden.';
  end if;

  if md5(c.issue_text) <> 'c9929e9efc88ec5c71d08cc3f0948039' then
    raise exception 'Der Haupttext wurde seit der Prüfung geändert. Bitte SQL neu vorbereiten.';
  end if;

  if c.issue_text_alternatives = array[originaltext]
    and c.issue_text_alternatives_base = c.issue_text then
    raise notice 'Diese Alternative ist bereits hinterlegt. Keine Änderung.';
    return;
  end if;

  if cardinality(c.issue_text_alternatives) > 0 then
    raise exception 'Es gibt bereits Alternativen. Sie werden nicht überschrieben.';
  end if;

  update public.campaigns
  set issue_text_alternatives = array[originaltext],
      issue_text_alternatives_base = issue_text,
      updated_at = now()
  where id = c.id
  returning * into c;

  insert into public.campaign_revisions (
    campaign_id, snapshot_reason, title, issue_text,
    issue_text_alternatives, issue_text_alternatives_base,
    description, creator_name, external_url, moderation_status,
    moderation_categories, target_level, target_state, target_recipient,
    target_politician_ids
  ) values (
    c.id, 'edited', c.title, c.issue_text,
    c.issue_text_alternatives, c.issue_text_alternatives_base,
    c.description, c.creator_name, c.external_url, c.moderation_status,
    c.moderation_categories, c.target_level, c.target_state, c.target_recipient,
    c.target_politician_ids
  ) returning id into revision_id;

  update public.campaigns
  set last_published_revision_id = revision_id
  where id = c.id;
end;
$pflege$;

select slug,
       1 + cardinality(issue_text_alternatives) as anzahl_vorlagen,
       issue_text_alternatives_base = issue_text as basis_passt
from public.campaigns
where slug = 'eeg-so-nicht';
