-- hamburgs-schulen: Haupttext und beide Alternativen gemeinsam ersetzen.
-- Im Supabase SQL Editor als vollständigen Block ausführen.
-- Vorbereitet, nicht ausgeführt. Stand der Live-Texte: 2026-11-16 (md5 per Skript gelesen).

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  haupttext text := $h$Im Doppelhaushalt 2027/28 plant der Senat Kürzungen an Hamburgs Schulen, auch bei der Schulbegleitung. Jedes Kind muss die Schulbegleitung bekommen, die seinem Bedarf entspricht: mit der nötigen Qualifikation, mit ausreichend Stunden und mit verlässlich denselben Bezugspersonen. Bildung, Teilhabe und körperliche Unversehrtheit unserer Kinder sind Menschenrechte. Für die Schulbegleitung braucht es deshalb verbindliche Qualitätsstandards und eine Personal- und Finanzplanung, die langfristig gesichert ist.

Ich fordere die Senatorin auf, die Kürzungen an Hamburgs Schulen zurückzunehmen und die Schulen nach ihrem tatsächlichen Bedarf zu finanzieren. Eltern, Schülerinnen und Schüler sowie Lehrkräfte müssen beteiligt werden, bevor über solche Einschnitte entschieden wird.$h$;
  alt1 text := $v1$Wird in Hamburg eine Lehrkraft krank, springt die Vertretungsreserve ein. Genau diese Reserve soll mit dem Doppelhaushalt 2027/28 kleiner werden. Sie muss erhalten bleiben, damit Unterricht und sonderpädagogische Förderung auch bei Krankheit stattfinden und Doppelbesetzungen und Förderstunden nicht für Vertretungen wegfallen. Ebenso dürfen die Lehrkraftstunden pro Kind nicht sinken, denn alle Schulformen brauchen Personal nach Bedarf, Sonder- und Heilpädagogik eingeschlossen. Mehr Arbeitszeit für Lehrkräfte ersetzt keine fehlenden Stellen. Zusätzliche Pflichten darf es nur mit Entlastung geben.

Ich fordere die Senatorin auf, die Kürzungen an Hamburgs Schulen zurückzunehmen und den Unterricht verlässlich zu finanzieren. Eltern, Schülerinnen und Schüler sowie Lehrkräfte sind zu beteiligen, bevor über Einschnitte an ihren Schulen entschieden wird.$v1$;
  alt2 text := $v2$Hamburg bezuschusst das Mittagessen in der Schule für alle Kinder. Dieser Zuschuss muss bleiben, denn gemeinsames Essen fördert Gemeinschaft und Demokratie, und Familien dürfen nicht zusätzlich belastet werden. An den Ganztagsgrundschulen sichern eigene Lehrkraftstunden und Honorarmittel ein vielfältiges Angebot, für das Lehrkräfte, Erzieherinnen und Erzieher sowie Honorarkräfte zusammenarbeiten. An weiterführenden Schulen könnten Kurse in Fremdsprachen, Kunst, Musik und MINT wegfallen. Jugendlichen fehlen dann Möglichkeiten, ihre Stärken auszubauen und sich auf ihre Zukunft vorzubereiten.

Ich fordere die Senatorin auf, die Kürzungen an Hamburgs Schulen zurückzunehmen und die Schulen so auszustatten, wie es ihr Bedarf verlangt. Über solche Einschnitte darf erst entschieden werden, wenn Eltern, Schülerinnen und Schüler sowie Lehrkräfte beteiligt wurden.$v2$;
begin
  select * into c
  from public.campaigns
  where slug = 'hamburgs-schulen'
  for update;

  if not found then
    raise exception 'Kampagne hamburgs-schulen wurde nicht gefunden.';
  end if;

  if c.issue_text = haupttext
    and c.issue_text_alternatives = array[alt1, alt2]
    and c.issue_text_alternatives_base = c.issue_text then
    raise notice 'Die neuen Texte sind bereits hinterlegt. Keine Änderung.';
    return;
  end if;

  if md5(c.issue_text) <> 'fd78171d9f00b261b151816077c6ea38'
    or cardinality(c.issue_text_alternatives) <> 2
    or md5(c.issue_text_alternatives[1]) <> '23e44bdb1aa4276cf774e5d8c310b964'
    or md5(c.issue_text_alternatives[2]) <> '122d09dd0ecb95f16084be2e3442c453' then
    raise exception 'Die Texte wurden seit der Prüfung geändert. Bitte SQL neu vorbereiten.';
  end if;

  update public.campaigns
  set issue_text = haupttext,
      issue_text_alternatives = array[alt1, alt2],
      issue_text_alternatives_base = haupttext,
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
       issue_text_alternatives_base = issue_text as basis_passt,
       left(issue_text, 60) as haupttext_beginn
from public.campaigns
where slug = 'hamburgs-schulen';
