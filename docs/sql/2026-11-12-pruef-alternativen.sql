-- pruef: Zwei Alternativtexte zum Haupttext von PRÜF-Demos ergänzen (Kampagne an die Landesregierungen, Bitte: Bundesrat).
-- Vorbereitet am 2026-11-12. Stand des Haupttexts: md5 f5ecde672e7e9936030a55218b3875e2.
-- Im Supabase SQL Editor als vollständigen Block ausführen.
-- Quelle der Texte: .planning/kampagnen-varianten/pruef-2026-11-12.json

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  alternativen text[] := array[
$v1$Ob eine Partei verfassungswidrig ist, entscheidet nach dem Grundgesetz allein das Bundesverfassungsgericht. Prüfen kann es das aber nur, wenn jemand einen Antrag stellt. Antragsberechtigt sind Bundestag, Bundesrat und Bundesregierung, und im Bundesrat haben die Landesregierungen eine Stimme.
Mir ist eine feste Regel wichtig: Jede Partei, die der Verfassungsschutz als rechtsextremen Verdachtsfall oder gesichert rechtsextrem einstuft, sollte überprüft werden, gleich welche Partei es ist. Dann wird die Frage nicht zur Taktik zwischen den Parteien, und niemand muss eine einzelne Partei vorab beurteilen.
Ein Ergebnis steht damit nicht fest, und Meinungen werden nicht verboten. Es geht um Klarheit durch ein rechtsstaatliches Verfahren. Die Väter und Mütter des Grundgesetzes haben aus dem Scheitern der Weimarer Republik gelernt und dafür ein eigenes Verfahren vorgesehen.
Bitte setzen Sie sich im Bundesrat dafür ein, dass ein solcher Antrag gestellt wird.$v1$,
$v2$Aus dem Scheitern der Weimarer Republik haben die Väter und Mütter des Grundgesetzes gelernt, dass eine Demokratie auch von Kräften geschwächt werden kann, die ihre Verfahren von innen nutzen. Deshalb entscheidet das Bundesverfassungsgericht über die Verfassungswidrigkeit von Parteien.
Mich beschäftigt, dass Parteien, die der Verfassungsschutz als rechtsextremen Verdachtsfall oder gesichert rechtsextrem einstuft, ganz normal zu Wahlen antreten, obwohl kein Gericht geklärt hat, ob sie mit der Verfassung vereinbar sind.
Damit ist nichts vorweggenommen. Meinungen werden dabei nicht verboten, und das Ergebnis ist offen. Es geht um Klarheit durch ein ordentliches Verfahren in Karlsruhe, nach einer Regel, die für jede Partei mit dieser Einstufung gilt.
Einen Antrag können Bundestag, Bundesrat und Bundesregierung stellen. Im Bundesrat haben die Landesregierungen eine Stimme, deshalb bitte ich Sie, sich dort für einen solchen Antrag einzusetzen.$v2$
  ]::text[];
begin
  select * into c
  from public.campaigns
  where slug = 'pruef'
  for update;

  if not found then
    raise exception 'Kampagne pruef wurde nicht gefunden.';
  end if;

  if md5(c.issue_text) <> 'f5ecde672e7e9936030a55218b3875e2' then
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
where slug = 'pruef';
