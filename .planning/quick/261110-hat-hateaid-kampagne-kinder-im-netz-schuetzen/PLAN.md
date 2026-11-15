# Kampagne „Kinder im Netz schützen“ mit HateAid

## Context
HateAid (Kontakt: Jenny) will eine Briefkampagne zum Kinderschutz auf Social Media. Ihr Entwurf ist ein fertiger Brief mit drei Forderungen, Drohung am Ende und Musk/Zuckerberg-Namen. Unser Brief-Prompt macht pro Brief genau eine Bitte, keine Bitte um Antwort (`web/src/lib/generation/generateLetter.ts:191-193`). Ziel: eine Testkampagne anlegen, pausiert (nur per Link erreichbar), die Thomas Jenny schickt, plus eine Nachricht mit offenen Punkten.

## Entschieden (Grilling-Runden)
- **Empfänger:** MdB im Wahlkreis (`target_level = Bund`, keine `target_politician_ids`). Jenny wird gefragt, ob sie anderes will.
- **Ton:** persönlich, ohne Drohung, ohne Namen. Tonstufe wählen Schreibende selbst.
- **Bitten:** 3 Texte rotierend (Haupttext + 2 Alternativen), jeder mit anderer Haupt-Bitte und einer zweiten als Stütze. Bewusste Abweichung von der Skill-Regel „gleiche Forderung“.
- **Perspektive:** Eltern-Ich, allgemein, kein Aufruf/Hinweis im Anliegentext.
- **EU KIDS Act:** keine Altersgrenze im Text („unter 16“ steht nicht im Vorschlag). Punkt geht an Jenny.
- **Anlage:** mit Thomas' Mail, später Transfer an Jenny. Logo von hateaid.org.
- **Titel/Slug:** „Kinder im Netz schützen“ / `kinder-im-netz-schuetzen`.
- **Zähler:** pausiert zählen Briefe nicht für die Kampagne (`036_campaign_letter_hours.sql:59-65`). OK für Test, vor HateAids Start aktivieren.

## Geprüfte Fakten (Quellen in der Recherche, Stand 10.11.2026)
- Expertenkommission BMBFSFJ: 56 Handlungsempfehlungen am 24.06.2026, Kern u. a. sichere Voreinstellungen (Safety by Design).
- Bundeskabinett 14.10.2026: Eckpunkte, unterstützt EU KIDS Act, nennt sie „ersten Schritt“; keine Gesamtstrategie beschlossen.
- EU KIDS Act, Vorschlag 17.09.2026 (Verordnung): Profile Minderjähriger standardmäßig privat, Endlos-Scroll und Autoplay verboten, tracking-basierte Empfehlungen standardmäßig aus. Altersstufen 13/15, keine 16. Rat und Parlament am Anfang.
- DSA Art. 28 gilt seit Feb. 2024. Kommission 2026: vorläufige Feststellungen gegen Meta und TikTok zum Minderjährigenschutz, kein Verfahren abgeschlossen. Aufsicht DE: Bundesnetzagentur, für Art. 28 mit BzKJ.

## Anliegentexte (Entwurf, vor Eintrag gegen signs-of-ai-writing.md prüfen)

**Text 1 (Haupttext), Bitte: Empfehlungen der Expertenkommission verbindlich machen; Stütze: KIDS Act**
> Abends läuft bei meinem Kind ein Video nach dem anderen. Das nächste startet von selbst, der Feed hört nie auf. Oft geht das bis spät in die Nacht, am nächsten Morgen ist es müde und gereizt. Jugendschutz-Einstellungen und Kontrollen helfen nur begrenzt. Vielen Familien in meinem Umfeld geht es genauso.
>
> Mit Erziehung allein ist das nicht zu lösen. Die Plattformen verdienen daran, dass Kinder möglichst lange dranbleiben: mit Endlos-Scroll, automatisch startenden Videos und Algorithmen, die immer extremere Inhalte vorschlagen. Dazu kommen Gefahren, vor denen Eltern ihr Kind kaum schützen können. Fremde schreiben Kinder an und fragen nach Nacktbildern, Bloßstellungen im Klassenchat verbreiten sich in Minuten, verstörende Gewaltvideos tauchen ungefragt im Feed auf.
>
> Die Expertenkommission des Bundesfamilienministeriums hat im Juni 2026 dazu 56 Handlungsempfehlungen vorgelegt. Ein Kernpunkt: Plattformen sollen für Kinder von Anfang an sicher voreingestellt sein. Die Bundesregierung hat im Oktober Eckpunkte beschlossen und nennt sie selbst einen ersten Schritt. Verbindlich ist bisher nichts.
>
> Ich bitte Sie, sich im Bundestag dafür einzusetzen, dass die Empfehlungen der Expertenkommission zu verbindlichen Kinderschutzstandards für Plattformen werden. Auf EU-Ebene liegt mit dem EU KIDS Act ein Vorschlag vor, der private Profile für Minderjährige und das Ende von Endlos-Scroll und Autoplay vorsieht. Beides sollte zusammenpassen.

**Text 2 (Alternative), Bitte: EU KIDS Act im Rat nicht verwässern; Stütze: DSA ohne Folgen**
> Seit September 2026 liegt der Vorschlag der EU-Kommission für den EU KIDS Act auf dem Tisch. Profile von Minderjährigen sollen danach standardmäßig privat sein. Endlos-Scroll und automatisch startende Videos sollen für sie wegfallen, Empfehlungen sollen nicht mehr auf ihrem Verhalten aufbauen. Jetzt verhandeln Parlament und Mitgliedstaaten darüber.
>
> Zu Hause sehe ich jeden Tag, warum das nötig ist. Mein Kind kommt kaum vom Handy los, oft bis tief in die Nacht. Ich verbringe viel Zeit mit Jugendschutz-Einstellungen und weiß trotzdem nie, wer mein Kind gerade anschreibt oder was ihm als Nächstes angezeigt wird.
>
> Regeln allein reichen nicht, sie müssen auch durchgesetzt werden. Der Digital Services Act verpflichtet Plattformen schon seit Februar 2024, Minderjährige besonders zu schützen. Die EU-Kommission hat 2026 vorläufig festgestellt, dass Meta und TikTok das nicht ausreichend tun. Abgeschlossen ist keines dieser Verfahren.
>
> Die Bundesregierung hat sich im Oktober hinter den EU KIDS Act gestellt. Ich bitte Sie, sich dafür einzusetzen, dass sie in den Verhandlungen im Rat bei dieser Linie bleibt und der Vorschlag nicht verwässert wird. Dazu gehören spürbare Strafen, wenn Plattformen sich nicht daran halten.

**Text 3 (Alternative), Bitte: DSA beim Kinderschutz durchsetzen; Stütze: Expertenkommission**
> Seit Februar 2024 gilt der Digital Services Act. Er verpflichtet Plattformen, die von Minderjährigen genutzt werden, für deren Sicherheit und Privatsphäre zu sorgen. Im Alltag merke ich davon wenig. Mein Kind hängt stundenlang in Video-Feeds, die von selbst weiterlaufen. Trotz aller Einstellungen kann ich nicht verhindern, dass Fremde es anschreiben oder es auf verstörende Gewaltvideos stößt.
>
> Die EU-Kommission hat 2026 vorläufig festgestellt, dass Meta und TikTok Minderjährige nicht ausreichend schützen. Abgeschlossen ist keines dieser Verfahren. In Deutschland ist die Bundesnetzagentur für die Aufsicht zuständig, beim Kinderschutz zusammen mit der Bundeszentrale für Kinder- und Jugendmedienschutz. Damit Verstöße Folgen haben, brauchen diese Stellen genug Personal und politische Rückendeckung.
>
> Ich bitte Sie, sich im Bundestag dafür einzusetzen, dass der Digital Services Act beim Schutz von Kindern konsequent durchgesetzt wird, bis hin zu empfindlichen Strafen. Was Plattformen konkret ändern müssen, hat die Expertenkommission des Bundesfamilienministeriums im Juni 2026 beschrieben: sichere Voreinstellungen für Kinder von Anfang an.

**Kampagnenseite:** Titel „Kinder im Netz schützen“, Ersteller-Name „HateAid“, Link hateaid.org, Beschreibung (≤400 Zeichen, nicht im Prompt): „HateAid bittet Eltern, ihrer oder ihrem Bundestagsabgeordneten zu schreiben: Plattformen sollen Kinder schützen, statt sie mit Endlos-Scroll und Autoplay am Handy zu halten.“

## Umsetzung
Rahmen: `/gsd-quick` (CLAUDE.md-Pflicht). Repo-Dateien nur `.planning/kampagnen-varianten/` (gitignored) und `docs/sql/`. Kein Code-Eingriff.

1. **Logo:** HateAid-Logo von hateaid.org (Presse/Website) in Scratchpad laden, mit `sharp` (web/node_modules) zu WebP < 512 KB, Metadaten weg.
2. **Anlegen:** im eingebauten Browser `brief-nach-berlin.de/kampagne/starten` ausfüllen (Bund, ohne MdB-Auswahl, Text 1, Felder oben, Mail thomas_lorenz@posteo.de, Logo). Vor dem Absenden kurz bestätigen lassen. Falls der Datei-Upload im Browser-Tool nicht geht: Kampagne ohne Logo anlegen, Logo danach per Wegwerfskript (Service-Role, Muster `createCampaignDraft.ts:192-225`) hochladen und `logo_path` setzen, nach Thomas' OK.
3. **Thomas** klickt den Bestätigungslink in seiner Mail.
4. **Beispielbrief:** vorher Briefe der letzten 60 Min. in `letter_signals` zählen (> 2/Min.: warten). `kampagne-freigeben beispiel kinder-im-netz-schuetzen` (1 Mistral-Aufruf), Brief lesen.
5. **Freigeben + pausieren:** nach Thomas' OK `approve <id>` (Live-Mail geht an Thomas), direkt danach pausieren über den Verwalten-Link aus der Mail (`pauseCampaign.ts`).
6. **Varianten:** `.planning/kampagnen-varianten/kinder-im-netz-schuetzen-2026-11-10.json` mit Text 2 und 3, Vergleichstest `vergleich.ts … 3 <Land> 30` (Bund-Zweig, max. 9 Aufrufe, 30 s Pause, bei 429 abbrechen). Briefe lesen: genau eine Bitte, Fakten korrekt, Stütze kommt vor, Einstiege verschieden. Freigabe-Dokument `.md` daneben.
7. **SQL:** `docs/sql/2026-11-10-kinder-im-netz-schuetzen-alternativen.sql` nach Muster `docs/sql/2026-10-13-eeg-so-nicht-original-als-alternative.sql` (md5 per Skript aus Live-Text). Thomas führt sie im Supabase SQL Editor aus.
8. **Nachricht an Jenny** (Skill `write-like-me`, Ich-Form, unversendet): Testlink; was angepasst wurde (eine Bitte pro Brief, drei rotierende Texte, keine Drohung/Namen, Ton wählen Schreibende); Frage Empfänger (MdB oder auch Ministerin Prien/MdEP); „unter 16“ vs. KIDS-Act-Stufen 13/15; offizielle Logo-Datei; Übertragung an ihre Mail; Zähler läuft erst nach Aktivierung.

## Verifikation
- Direktlink `/kampagne/kinder-im-netz-schuetzen` lädt, Logo sichtbar, `noindex` gesetzt.
- Nicht in `/ngo-briefkampagne`, nicht auf der Startseite.
- Kontrollabfrage: `status = 'paused'`, `1 + cardinality(issue_text_alternatives) = 3`, `issue_text_alternatives_base = issue_text`.
- Mehrmals neu laden: verschiedene Starttexte erscheinen.
- Ein PLZ-Durchlauf bis zur MdB-Auswahl (ohne Brief zu erzeugen).
