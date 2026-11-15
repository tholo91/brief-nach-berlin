-- kinder-im-netz-schuetzen (HateAid): zwei Alternativen zum Haupttext ergänzen.
-- Jeder Text setzt eine andere Haupt-Bitte: Expertenkommission / EU KIDS Act im Rat / DSA durchsetzen.
-- Im Supabase SQL Editor als vollständigen Block ausführen.
-- Vorbereitet, nicht ausgeführt. Stand des Haupttexts: 2026-11-11.

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  v1 text := $v1$Seit September 2026 liegt der Vorschlag der EU-Kommission für den EU KIDS Act auf dem Tisch. Profile von Minderjährigen sollen danach standardmäßig privat sein. Endlos-Scroll und automatisch startende Videos sollen für sie wegfallen, Empfehlungen sollen nicht mehr auf ihrem Verhalten aufbauen. Jetzt verhandeln Parlament und Mitgliedstaaten darüber.

Zu Hause sehe ich jeden Tag, warum das nötig ist. Mein Kind kommt kaum vom Handy los, oft bis tief in die Nacht. Ich verbringe viel Zeit mit Jugendschutz-Einstellungen und weiß trotzdem nie, wer mein Kind gerade anschreibt oder was ihm als Nächstes angezeigt wird.

Gute Regeln helfen aber nur, wenn sie durchgesetzt werden. Der Digital Services Act verpflichtet Plattformen schon seit Februar 2024, Minderjährige besonders zu schützen. Gegen Meta und TikTok laufen deshalb Verfahren der EU-Kommission. Abgeschlossen ist bis heute keines davon.

Die Bundesregierung hat sich im Oktober hinter den EU KIDS Act gestellt. Ich bitte Sie, sich dafür einzusetzen, dass sie in den Verhandlungen im Rat bei dieser Linie bleibt und der Vorschlag nicht verwässert wird. Dazu gehören spürbare Strafen, wenn Plattformen sich nicht daran halten.$v1$;
  v2 text := $v2$Seit Februar 2024 gilt der Digital Services Act. Er verpflichtet Plattformen, die von Minderjährigen genutzt werden, für deren Sicherheit und Privatsphäre zu sorgen. Im Alltag merke ich davon wenig. Mein Kind hängt stundenlang in Video-Feeds, die von selbst weiterlaufen. Trotz aller Einstellungen kann ich nicht verhindern, dass Fremde es anschreiben oder es auf verstörende Gewaltvideos stößt.

Die EU-Kommission führt zum Schutz Minderjähriger Verfahren gegen Meta und TikTok. Abgeschlossen ist bis heute keines davon. In Deutschland ist die Bundesnetzagentur für die Aufsicht zuständig, beim Kinderschutz zusammen mit der Bundeszentrale für Kinder- und Jugendmedienschutz. Damit Verstöße Folgen haben, brauchen diese Stellen genug Personal und politische Rückendeckung.

Ich bitte Sie, sich im Bundestag dafür einzusetzen, dass der Digital Services Act beim Schutz von Kindern konsequent durchgesetzt wird, bis hin zu empfindlichen Strafen. Was Plattformen konkret ändern müssen, hat die Expertenkommission des Bundesfamilienministeriums im Juni 2026 beschrieben: sichere Voreinstellungen für Kinder von Anfang an.$v2$;
begin
  select * into c
  from public.campaigns
  where slug = 'kinder-im-netz-schuetzen'
  for update;

  if not found then
    raise exception 'Kampagne kinder-im-netz-schuetzen wurde nicht gefunden.';
  end if;

  if md5(c.issue_text) <> '6a648a854a1b272eb8ebacea01fbd1a8' then
    raise exception 'Der Haupttext wurde seit der Prüfung geändert. Bitte SQL neu vorbereiten.';
  end if;

  if c.issue_text_alternatives = array[v1, v2]
    and c.issue_text_alternatives_base = c.issue_text then
    raise notice 'Diese Alternativen sind bereits hinterlegt. Keine Änderung.';
    return;
  end if;

  if cardinality(c.issue_text_alternatives) > 0 then
    raise exception 'Es gibt bereits Alternativen. Sie werden nicht überschrieben.';
  end if;

  update public.campaigns
  set issue_text_alternatives = array[v1, v2],
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

select slug, status,
       1 + cardinality(issue_text_alternatives) as anzahl_vorlagen,
       issue_text_alternatives_base = issue_text as basis_passt
from public.campaigns
where slug = 'kinder-im-netz-schuetzen';
