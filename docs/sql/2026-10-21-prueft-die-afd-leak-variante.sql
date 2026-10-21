-- prueft-die-afd: Alternative 1 (Einstieg über das Verfahren) durch die Leak-Variante ersetzen.
-- Alternative 2 (Einstieg über das NPD-Urteil) und der Haupttext bleiben unverändert.
-- Freigabe: Thomas am 2026-10-21.
-- Quelle der Texte: .planning/kampagnen-varianten/prueft-die-afd-leak-2026-10-21.md

do $pflege$
declare
  c public.campaigns%rowtype;
  revision_id uuid;
  alternativen text[] := array[
$v1$Mitte Oktober 2026 sind nach Angaben anonymer Veröffentlicher rund 420.000 interne E-Mails aus AfD-Postfächern aus den Jahren 2014 bis 2026 ins Netz gestellt worden. Die AfD bestätigt einen Hackerangriff auf einen ihrer Dienstleister. Ob die Mails echt sind, ist bisher nicht unabhängig geprüft. Die taz berichtet aus Zusammenfassungen der Mails unter anderem über ein Kreisvorstandsmitglied, das den Holocaust geleugnet haben soll, und über antisemitische Beiträge einer Landtagsabgeordneten. Bestätigt sich das, reichen solche Fälle bis in Parteiämter und Landtagsmandate.
Falls die Mails echt sind, könnte das Bundesverfassungsgericht sie nach einer ersten Einschätzung der Gesellschaft für Freiheitsrechte (GFF) in einem Verfahren wohl verwerten. Vorher müssten sie wissenschaftlich ausgewertet werden. Klären lässt sich das nur in einem solchen Verfahren.
Unabhängig von den Mails hat die GFF die AfD schon vorher in einem umfangreichen Gutachten untersucht. Sie kommt zu dem Schluss, dass die AfD die Voraussetzungen für ein Verbot erfüllt. Das ist eine juristische Bewertung, kein Urteil des Bundesverfassungsgerichts. Das Gutachten zählt mehr als 200 Forderungen aus der AfD, Abgeordnete anderer Parteien wegen demokratisch legitimierter Entscheidungen strafrechtlich zu verfolgen. Wer eingebürgert wurde oder zwei Staatsangehörigkeiten hat und straffällig wird, soll nach Forderungen aus der AfD ausgebürgert werden können. Die GFF sieht darin ein ethnisch geprägtes Volksverständnis. Außerdem spricht das Gutachten von systematischen Angriffen auf die Religionsfreiheit von Muslimen: Kopftuchverbot und Beschränkungen für Moscheen sollen muslimische Religionspraxis aus der Öffentlichkeit verdrängen. Den Kurs der Partei bestimmen nach dem Gutachten radikale Kräfte, auch im Bundesvorstand. Gemäßigtere haben die AfD verlassen, sich radikalisiert oder dulden die Entwicklung, offener Widerspruch ist kaum zu hören.
Die NPD hat das Bundesverfassungsgericht 2017 nicht verboten, obwohl es ihre Ziele als gegen die freiheitliche demokratische Grundordnung gerichtet einstufte. Es fehlten konkrete Anhaltspunkte, dass die NPD diese Ziele durchsetzen könnte. Die GFF sieht deutliche inhaltliche Übereinstimmungen zwischen AfD und NPD und kommt zu dem Ergebnis, dass bei der AfD auch diese Voraussetzung vorliegt. Ob das trägt, muss das Gericht entscheiden.
Bitte setzen Sie sich im Bundesrat dafür ein, dass das Bundesverfassungsgericht die Verfassungswidrigkeit der AfD prüft. Das Gericht entscheidet unabhängig, das Ergebnis ist offen.$v1$,
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

  if cardinality(c.issue_text_alternatives) <> 2
    or md5(c.issue_text_alternatives[1]) <> '4fb360bd7d25ed462906868b7384337e'
    or md5(c.issue_text_alternatives[2]) <> 'b66682c1c76756e7abf5d5bde0221d3b' then
    raise exception 'Die Alternativen entsprechen nicht dem Stand vom 19.10. Bitte SQL neu vorbereiten.';
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
       issue_text_alternatives_base = issue_text as basis_passt,
       md5(issue_text_alternatives[1]) as md5_leak,
       md5(issue_text_alternatives[2]) as md5_npd
from public.campaigns
where slug = 'prueft-die-afd';
