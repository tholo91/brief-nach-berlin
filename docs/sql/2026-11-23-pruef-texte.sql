-- pruef: Haupttext und beide Alternativen gemeinsam ersetzen (AfD-Satz, Bitte für Regierung und Landtag).
-- Abgestimmt mit PRÜF-Demos (Mail 23.11.2026). md5 der Live-Texte per Skript gelesen am 2026-11-23.
-- Am 2026-11-23 inhaltsgleich per Service-Role-Skript eingetragen (CLI hatte keine Rechte), inklusive Teaser unten.

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  haupttext text := $h$Mir macht Sorge, dass Parteien, die der Verfassungsschutz als rechtsextremen Verdachtsfall oder gesichert rechtsextrem einstuft, ganz normal zu Wahlen antreten, ohne dass je ein Gericht geklärt hat, ob sie mit unserer Verfassung vereinbar sind. Ich möchte, dass das Bundesverfassungsgericht alle diese Parteien prüft. Aktuell geht es dabei vor allem um die AfD.
Die Regel soll für jede Partei mit dieser Einstufung gelten. So wird die Frage nicht zur Taktik zwischen den Parteien, und sie wird dort entschieden, wo das Grundgesetz es vorsieht: in Karlsruhe. Ein Ergebnis steht damit nicht fest, und Meinungen werden nicht verboten.
Das Grundgesetz hat aus dem Scheitern der Weimarer Republik gelernt: Eine Demokratie kann auch von Kräften geschwächt werden, die ihre Verfahren von innen nutzen. Für diesen Fall gibt es Artikel 21.
Einen Antrag beim Bundesverfassungsgericht können Bundestag, Bundesrat und Bundesregierung stellen. Im Bundesrat entscheiden die Landesregierungen. Deshalb bitte ich Sie, sich in Ihrem Amt dafür einzusetzen, dass unser Land dort einen solchen Antrag unterstützt.$h$;
  alt1 text := $v1$Ob eine Partei verfassungswidrig ist, entscheidet nach dem Grundgesetz allein das Bundesverfassungsgericht. Prüfen kann es das aber nur, wenn jemand einen Antrag stellt. Antragsberechtigt sind Bundestag, Bundesrat und Bundesregierung.
Mir ist eine feste Regel wichtig: Jede Partei, die der Verfassungsschutz als rechtsextremen Verdachtsfall oder gesichert rechtsextrem einstuft, sollte überprüft werden. Derzeit betrifft das vor allem die AfD. Mit einer solchen Regel wird die Frage nicht zur Taktik zwischen den Parteien, und niemand muss eine einzelne Partei vorab beurteilen.
Das Ergebnis bleibt offen, Meinungen werden nicht verboten. Für genau diese Prüfung hat das Grundgesetz nach den Erfahrungen von Weimar ein eigenes Verfahren vorgesehen.
Im Bundesrat entscheiden die Landesregierungen. Ich bitte Sie daher, sich in Ihrem Amt dafür einzusetzen, dass unser Land dort einen solchen Antrag unterstützt.$v1$;
  alt2 text := $v2$Aus dem Scheitern der Weimarer Republik zieht das Grundgesetz eine Lehre: Eine Demokratie kann auch von Kräften geschwächt werden, die ihre Verfahren von innen nutzen. Deshalb entscheidet das Bundesverfassungsgericht, ob eine Partei verfassungswidrig ist.
Mich beschäftigt, dass Parteien, die der Verfassungsschutz als rechtsextremen Verdachtsfall oder gesichert rechtsextrem einstuft, ganz normal zu Wahlen antreten, obwohl kein Gericht geklärt hat, ob sie mit der Verfassung vereinbar sind. Ich wünsche mir, dass Karlsruhe all diese Parteien prüft, im Moment vor allem die AfD.
Damit ist nichts vorweggenommen, und Meinungen werden nicht verboten. Die Regel gilt für jede Partei mit dieser Einstufung, das Urteil fällt das Gericht.
Einen Antrag können Bundestag, Bundesrat und Bundesregierung stellen. Im Bundesrat stimmen die Landesregierungen ab. Ich bitte Sie deshalb, sich in Ihrem Amt dafür einzusetzen, dass unser Land einen solchen Antrag dort mitträgt.$v2$;
begin
  select * into c from public.campaigns where slug = 'pruef' for update;
  if not found then
    raise exception 'Kampagne pruef wurde nicht gefunden.';
  end if;

  if c.issue_text = haupttext
    and c.issue_text_alternatives = array[alt1, alt2]
    and c.issue_text_alternatives_base = c.issue_text then
    raise notice 'Die neuen Texte sind bereits hinterlegt. Keine Änderung.';
    return;
  end if;

  if md5(c.issue_text) <> 'f5ecde672e7e9936030a55218b3875e2'
    or cardinality(c.issue_text_alternatives) <> 2
    or md5(c.issue_text_alternatives[1]) <> '3caf3cd7bda763bd7049345412d1785c'
    or md5(c.issue_text_alternatives[2]) <> '0712c8dd7408155c8a6df49bd43c51f0' then
    raise exception 'Die Texte wurden seit der Prüfung geändert. Bitte SQL neu vorbereiten.';
  end if;

  update public.campaigns
  set description = 'PRÜF bittet dich, deiner Landesregierung zu schreiben: Alle Parteien, die der Verfassungsschutz als rechtsextrem einstuft, sollen vom Bundesverfassungsgericht überprüft werden. Aktuell geht es vor allem um die AfD. Deine Landesregierung kann sich im Bundesrat dafür einsetzen.',
      issue_text = haupttext,
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

  update public.campaigns set last_published_revision_id = revision_id where id = c.id;
end;
$pflege$;

select slug,
       1 + cardinality(issue_text_alternatives) as anzahl_vorlagen,
       issue_text_alternatives_base = issue_text as basis_passt,
       md5(issue_text) as md5_haupttext,
       left(issue_text, 60) as haupttext_beginn
from public.campaigns
where slug = 'pruef';
