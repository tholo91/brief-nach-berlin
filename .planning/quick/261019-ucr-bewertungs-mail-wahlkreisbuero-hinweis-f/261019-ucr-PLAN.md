---
quick_id: 261019-ucr
mode: quick
description: Bewertungs-Mail (Follow-up) mit Wahlkreisbüro-Hinweis für MdB-Briefe + Datenschutz-Satz ehrlich machen
---

# Quick 261019-ucr: Bewertungs-Mail mit Wahlkreisbüro-Hinweis

Vorgänger: 261019-u1n (Finder auf /aktiv-werden mit Anker `#wahlkreisbuero`; Brief-Mail-Zeile `meetMdbIntro`/`meetMdbLink` in `web/src/lib/email/mailLocale.ts`, Test `web/src/__tests__/emailMeetMdbLine.test.ts`).
Entscheidung Thomas (19.10.2026): Datenschutz-Satz anpassen („ausschließlich" streichen, Zusatzhinweise nennen), Rechtsgrundlage bleibt Art. 6 Abs. 1 lit. f.

Regeln: keine Gedankenstriche (— –) in neuen Texten, „ich" statt „wir", du-Form in Mails (Datenschutzseite bleibt Sie-Form wie bisher). Nur eigene Dateien per Pfad stagen; `.gitignore`, `.planning/research/*`, `web/*.jsonl` nie stagen. Kein Push. Keine echten Mistral-/Brevo-Aufrufe (Tests mocken Brevo bereits, falls nötig).

## Task 1: recipientKind bis in die Follow-up-Mail + MdB-Block

files: `web/src/lib/email/buildFollowupHtml.ts`, `web/src/lib/email/sendFollowupEmail.ts`, `web/src/app/api/generate-letter/route.ts`, `web/src/lib/email/mailLocale.ts`, neuer Test `web/src/__tests__/followupMeetMdb.test.ts`

action:
- `BuildFollowupParams` und `SendFollowupEmailParams`: optionales Feld `recipientKind?: SendLetterEmailParams["recipientKind"]` (Typ aus `sendLetterEmail.ts` wiederverwenden, nicht neu definieren). `sendFollowupEmail` reicht es an `buildFollowupHtml` durch.
- `route.ts` (~Z. 411): `recipientKind: params.recipientKind` mitgeben (`params` kommt aus `prepareLetterEmail` ~Z. 378).
- `mailLocale.ts`, im `followup`-Objekt je Locale:
  - DE `meetMdb: (name) => \`Wenn du dein Anliegen auch persönlich besprechen möchtest: Beim Büro von ${name} kannst du nach einer Bürgersprechstunde fragen.\`` und `meetMdbLink: "Wahlkreisbüro finden"`
  - EN: „If you'd like to discuss your concern in person, you can ask ${name}'s office about a Bürgersprechstunde (open office hours)." / „Find the constituency office (in German)"
  - TR: sinngemäß in Siz-Form wie die übrigen TR-Followup-Texte, Link-Text mit „(Almanca)".
- `buildFollowupHtml.ts`: Nur wenn `recipientKind === "mdb"` und `politicianName` gesetzt: kurzer Absatz NACH dem Bewertungs-/Spenden-Block (`<!-- Primary rating action ... -->`) und VOR dem Sign-off. Stil wie bestehende Body-Absätze der Mail, Link `${base}/aktiv-werden#wahlkreisbuero`, `target="_blank" rel="noopener noreferrer"`, `color:#2D5016;text-decoration:underline;`. Name mit dem vorhandenen `escapeHtml`. Gleiches im Plaintext (`text`), z. B. „…fragen. Wahlkreisbüro finden: <url>".
- Link ohne Query-Parameter.

verify: neuer Jest-Test:
  a. mdb + Name → html und text enthalten `/aktiv-werden#wahlkreisbuero` und den Namen.
  b. mdl, rathaus, landesregierung, campaign_fixed, bundeskanzler, mdb_later, undefined → kein `#wahlkreisbuero`.
  c. Name mit `<b>` wird escaped.
  d. alle drei Locales liefern den Block.
  Dann `cd web && npx jest src/__tests__/followupMeetMdb.test.ts src/__tests__/followupShareButtons.test.ts src/__tests__/followupDonationCta.test.ts src/__tests__/emailLocalization.test.ts src/__tests__/generateLetterRouteHardening.test.ts src/__tests__/emailSocialFollow.test.ts` grün; `npx tsc --noEmit -p .` ohne neue Fehler in den berührten Dateien.
done: Tests grün.

## Task 2: Datenschutz-Satz

files: `web/src/app/(site)/datenschutz/page.tsx` (~Z. 394-401)

action: Den Satz „Die zusätzliche zeitversetzte Feedback-Nachfrage dient ausschließlich der freiwilligen Bewertung und Verbesserung des Dienstes." ersetzen durch:
„Die zusätzliche zeitversetzte Feedback-Nachfrage dient der freiwilligen Bewertung und Verbesserung des Dienstes. Sie enthält außerdem kurze Hinweise, wie Sie Brief-nach-Berlin unterstützen oder weiterempfehlen können, und bei Briefen an Bundestagsabgeordnete einen Link, über den Sie das zuständige Wahlkreisbüro finden."
Rest des Absatzes (Rechtsgrundlage, Widerspruch) unverändert. Prüfen, ob `privacyEmail.test.ts` oder ein anderer Test den alten Wortlaut erwartet, und ggf. anpassen. Prüfen, ob es einen „Stand"-Datumshinweis auf der Seite gibt; falls ja auf Oktober 2026 / 19.10.2026 setzen.

verify: `cd web && npx jest src/__tests__/privacyEmail.test.ts` grün; `grep -n "ausschließlich" "src/app/(site)/datenschutz/page.tsx"` zeigt die alte Stelle nicht mehr.

## Commits
Pro Task ein Commit, z. B. `feat(email): Bewertungs-Mail verlinkt bei MdB-Briefen auf das Wahlkreisbüro` und `docs(datenschutz): Inhalt der Feedback-Nachfrage vollständig beschreiben`. Message endet mit:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
