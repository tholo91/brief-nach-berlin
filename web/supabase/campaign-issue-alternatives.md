# Kuratierte Anliegen für Kampagnen

Die Hauptvorlage bleibt `issue_text`. Optional enthält `issue_text_alternatives`
ein bis zwei weitere vollständige Anliegen; der ursprüngliche Haupttext wird
nicht noch einmal in dieses Array kopiert. `issue_text_alternatives_base` muss
eine exakte Kopie des Haupttexts sein, für den die Varianten geprüft wurden.

## Texte erstellen und pflegen

- Manuell entscheiden, ob eine Kampagne insgesamt ein, zwei oder drei Anliegen
  braucht. Synonyme allein ergeben keine sinnvolle Variante.
- Varianten sollen dieselbe Forderung, dieselben Fakten und Einschränkungen
  beibehalten, aber unterschiedliche Argumente oder Schwerpunkte setzen.
- Keine persönlichen Erlebnisse oder Betroffenheit erfinden.
- Zusatztexte auf 50–4.000 getrimmte Zeichen begrenzen. Pro Kampagne höchstens
  zwei Zusatztexte.
- `issue_text_alternatives`, `issue_text_alternatives_base` und bei Bedarf
  `issue_text` atomar aktualisieren. Die Basis exakt auf den neuen Haupttext
  setzen.
- Beim Veröffentlichen eine neue Revision fortschreiben. Revisionen müssen
  Haupttext, Array und Basis gemeinsam abbilden. Auch die Aktivierung über
  `approve_campaign` erstellt einen vollständigen Snapshot dieser Felder.

## Manuelle Pflege in Supabase

Die folgende Vorlage ist absichtlich mit Platzhaltern versehen. Ersetze den
Slug, den erwarteten aktuellen Haupttext und den Alternativtext durch geprüfte
Werte. Der erwartete Haupttext muss exakt dem aktuell gespeicherten Text
entsprechen. Ein veralteter Erwartungswert bricht mit Fehler ab, bevor etwas
geschrieben wird. Für zwei Alternativen ergänze einen zweiten Array-Eintrag;
für keine Alternative verwende `ARRAY[]::text[]`.

Führe den gesamten `DO`-Block in einem Aufruf im Supabase SQL Editor aus. Er
sperrt die Kampagnenzeile, prüft den erwarteten Haupttext, aktualisiert Array
und Basis zusammen, legt einen vollständigen Revisionssnapshot an und setzt
`last_published_revision_id` auf diese Revision. Der Block ändert den
Haupttext nicht.

```sql
do $$
declare
  campaign_row public.campaigns%rowtype;
  alternatives text[] := array[
    '[PLATZHALTER: geprüfter Alternativtext mit 50 bis 4000 Zeichen]'
  ]::text[];
  expected_issue_text text := '[PLATZHALTER: exakte aktuelle Hauptvorlage]';
  revision_id uuid;
begin
  select * into campaign_row
  from public.campaigns
  where slug = '[PLATZHALTER: kampagnen-slug]'
  for update;

  if not found then
    raise exception 'Campaign slug was not found';
  end if;

  if campaign_row.issue_text is distinct from expected_issue_text then
    raise exception 'Campaign issue_text changed since it was reviewed';
  end if;

  if alternatives is null then
    raise exception 'Alternatives array must not be NULL; use ARRAY[]::text[]';
  end if;

  if not public.campaign_issue_alternatives_valid(
    campaign_row.issue_text,
    alternatives
  ) then
    raise exception 'Alternatives failed validation';
  end if;

  update public.campaigns
  set issue_text_alternatives = alternatives,
      issue_text_alternatives_base = campaign_row.issue_text,
      updated_at = now()
  where id = campaign_row.id;

  insert into public.campaign_revisions (
    campaign_id, snapshot_reason, title, issue_text,
    issue_text_alternatives, issue_text_alternatives_base,
    description, creator_name, external_url, moderation_status,
    moderation_categories, target_level, target_state, target_recipient,
    target_politician_ids
  ) values (
    campaign_row.id, 'edited', campaign_row.title, campaign_row.issue_text,
    alternatives, campaign_row.issue_text,
    campaign_row.description, campaign_row.creator_name,
    campaign_row.external_url, campaign_row.moderation_status,
    campaign_row.moderation_categories, campaign_row.target_level,
    campaign_row.target_state, campaign_row.target_recipient,
    campaign_row.target_politician_ids
  ) returning id into revision_id;

  update public.campaigns
  set last_published_revision_id = revision_id,
      updated_at = now()
  where id = campaign_row.id;
end;
$$;
```

Der Datenbank-Check vergleicht Alternativen nach `btrim` mit der geprüften Basis
(`issue_text_alternatives_base`; falls sie `NULL` ist, mit `issue_text`) und
untereinander. So kann ein späterer Haupttextwechsel nicht durch eine alte
Zusatzvariante blockiert werden. Er prüft außerdem Anzahl, Dimension,
Nullwerte und Textlänge. Laufzeitcode muss veraltete Varianten bei einer
Abweichung zwischen Basis und aktuellem `issue_text` weiterhin ausblenden.

## Laufzeit und Haupttextänderungen

Die Laufzeit darf Varianten nur anbieten, wenn die Basis exakt mit dem aktuellen
`issue_text` übereinstimmt und alle Werte den Runtime-Validator bestehen. Nach
einer Haupttextänderung gelten zunächst nur der neue Haupttext und keine
Zusatzvarianten; erst nach erneuter redaktioneller Prüfung werden Array und
Basis gemeinsam aktualisiert.

Die Kampagne `eeg-so-nicht` kann später als Pilot dienen. Vor der Prüfung und
Freigabe werden keine Varianten eingetragen.
