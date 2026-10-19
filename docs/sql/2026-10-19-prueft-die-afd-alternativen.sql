-- prueft-die-afd: Zwei Alternativtexte zum Haupttext von innn.it ergänzen.
-- Vorbereitet, NICHT ausgeführt. Stand des Haupttexts: 2026-10-19.
-- Erst ausführen, wenn innn.it die Texte freigegeben hat.
-- Im Supabase SQL Editor als vollständigen Block ausführen.
-- Quelle der Texte: .planning/kampagnen-varianten/prueft-die-afd-2026-10-19.md

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  alternativen text[] := array[
$v1$Ob eine Partei verfassungswidrig ist, entscheidet allein das Bundesverfassungsgericht. Prüfen kann es diese Frage aber nur, wenn ein Antrag gestellt wird, etwa aus dem Bundesrat. Deshalb wende ich mich an Sie.
Die Gesellschaft für Freiheitsrechte (GFF) hat die AfD in einem umfangreichen Gutachten untersucht. Sie kommt zu dem Ergebnis, dass die AfD die Voraussetzungen für ein Verbot erfüllt. Das ist eine juristische Einschätzung, kein Urteil. Schwer wiegt, was sie zur Religionsfreiheit beschreibt: Mit einem Kopftuchverbot und Beschränkungen für Moscheen soll muslimisches Glaubensleben aus der Öffentlichkeit gedrängt werden. Laut Gutachten gibt es in der AfD außerdem Forderungen, Eingebürgerte und Doppelstaatler auszubürgern, wenn sie straffällig geworden sind. Die GFF sieht dahinter ein Volksverständnis, das an der Abstammung ansetzt. Sie hat zudem mehr als 200 Forderungen aus der AfD dokumentiert, Abgeordnete anderer Parteien für demokratisch legitimierte Entscheidungen strafrechtlich zu verfolgen.
Nach dem Gutachten geben in der Partei die Radikalen den Ton an. Wer gemäßigter war, ist gegangen, hat sich selbst radikalisiert oder nimmt die Entwicklung hin. Im Bundesvorstand bestimmen die Radikalen, Widerspruch wird kaum laut.
Im NPD-Verfahren 2017 stufte das Bundesverfassungsgericht die Ziele der NPD als gegen die freiheitliche demokratische Grundordnung gerichtet ein. Ein Verbot lehnte es ab, weil konkrete Anhaltspunkte fehlten, dass die NPD diese Ziele auch durchsetzen könnte. Die GFF sieht große inhaltliche Übereinstimmungen zwischen AfD und NPD und hält diese Hürde bei der AfD für genommen. Ob das stimmt, muss das Gericht klären.
Bitte setzen Sie sich im Bundesrat dafür ein, dass dieser Antrag gestellt wird. Das Gericht soll unabhängig entscheiden, das Ergebnis ist offen.$v1$,
$v2$Im NPD-Verfahren 2017 hat das Bundesverfassungsgericht festgestellt, dass die NPD Ziele verfolgte, die gegen die freiheitliche demokratische Grundordnung gerichtet waren. Ein Verbot gab es trotzdem nicht. Es fehlten konkrete Anhaltspunkte dafür, dass die Partei diese Ziele auch erreichen könnte. Die Gesellschaft für Freiheitsrechte (GFF) sieht bei der AfD deutliche inhaltliche Parallelen zur NPD. In ihrem Gutachten kommt sie zu dem Ergebnis, dass die AfD auch diese zweite Bedingung erfüllt und die Voraussetzungen für ein Verbot vorliegen. Das ist eine rechtliche Bewertung. Ein Urteil kann nur das Bundesverfassungsgericht fällen.
Das Gutachten stützt sich auf konkrete Belege. Allein zur Strafverfolgung von Abgeordneten anderer Parteien wegen Entscheidungen, die demokratisch zustande gekommen sind, zählt es mehr als 200 Forderungen aus der AfD. Ein anderer Teil betrifft die Staatsbürgerschaft: Eingebürgerte und Menschen mit zwei Staatsbürgerschaften sollen ausgebürgert werden können, sofern sie straffällig geworden sind. Die GFF sieht darin einen ethnisch verstandenen Volksbegriff. Und die Religionsfreiheit von Muslimen wird laut Gutachten systematisch angegriffen: Kopftuchverbot und Einschränkungen für Moscheen sollen muslimische Religionspraxis aus dem öffentlichen Leben verdrängen.
Laut GFF bestimmt inzwischen der radikale Flügel, wohin die Partei geht. Gemäßigte sind ausgetreten, haben sich radikalisiert oder lassen es geschehen. Im Bundesvorstand hat dieser Flügel die Oberhand, kaum jemand widerspricht offen.
Bitte setzen Sie sich im Bundesrat dafür ein, dass das Bundesverfassungsgericht mit einem Antrag beauftragt wird, die Verfassungswidrigkeit der AfD zu prüfen. Das Gericht soll unabhängig und ohne vorgegebenes Ergebnis entscheiden.$v2$
  ]::text[];
begin
  select * into c
  from public.campaigns
  where slug = 'prueft-die-afd'
  for update;

  if not found then
    raise exception 'Kampagne prueft-die-afd wurde nicht gefunden.';
  end if;

  if md5(c.issue_text) <> 'f8593692334cc84b1743d177bc0a5168' then
    raise exception 'Der Haupttext wurde seit der Prüfung geändert. Bitte SQL neu vorbereiten.';
  end if;

  if c.issue_text_alternatives = alternativen
    and c.issue_text_alternatives_base = c.issue_text then
    raise notice 'Diese Alternativen sind bereits hinterlegt. Keine Änderung.';
    return;
  end if;

  if cardinality(c.issue_text_alternatives) > 0 then
    raise exception 'Es gibt bereits Alternativen. Sie werden nicht überschrieben.';
  end if;

  if not public.campaign_issue_alternatives_valid(c.issue_text, alternativen) then
    raise exception 'Alternativen bestehen die Prüfung nicht (Länge, Anzahl oder Dubletten).';
  end if;

  update public.campaigns
  set issue_text_alternatives = alternativen,
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
where slug = 'prueft-die-afd';
