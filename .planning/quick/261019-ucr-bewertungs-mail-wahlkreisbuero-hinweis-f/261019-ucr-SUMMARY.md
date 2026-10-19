---
quick_id: 261019-ucr
status: complete
completed: 2026-10-19
commits: [cc05737, 3104fcb]
---

# Quick 261019-ucr Summary

Follow-up-Bewertungs-Mail zeigt bei MdB-Briefen einen Wahlkreisbüro-Hinweis; Datenschutz-Satz ehrlich gemacht.

## Commits
- cc05737 feat(email): Bewertungs-Mail verlinkt bei MdB-Briefen auf das Wahlkreisbüro
- 3104fcb docs(datenschutz): Inhalt der Feedback-Nachfrage vollständig beschreiben

## Tests
`cd web && npx jest src/__tests__/followupMeetMdb.test.ts followupShareButtons followupDonationCta emailLocalization generateLetterRouteHardening emailSocialFollow privacyEmail emailMeetMdbLine datenloeschenPage` : alle grün (8+2 Suites, 0 Fehler).
`npx tsc --noEmit -p .`: keine Fehler außerhalb von `.next/types/* 2.ts|3.ts` (bereits vorhandene iCloud-Duplikate).

## Neue Copy
- DE: `Wenn du dein Anliegen auch persönlich besprechen möchtest: Beim Büro von ${name} kannst du nach einer Bürgersprechstunde fragen.` / Link `Wahlkreisbüro finden`
- EN: `If you'd like to discuss your concern in person, you can ask ${name}'s office about a Bürgersprechstunde (open office hours).` / Link `Find the constituency office (in German)`
- TR: `Konunuzu yüz yüze de görüşmek isterseniz, ${name} ofisinden Bürgersprechstunde (halk görüşme saati) için randevu isteyebilirsiniz.` / Link `Seçim bölgesi ofisini bulun (Almanca)`
- Datenschutz: "Die zusätzliche zeitversetzte Feedback-Nachfrage dient der freiwilligen Bewertung und Verbesserung des Dienstes. Sie enthält außerdem kurze Hinweise, wie Sie Brief-nach-Berlin unterstützen oder weiterempfehlen können, und bei Briefen an Bundestagsabgeordnete einen Link, über den Sie das zuständige Wahlkreisbüro finden." (Rest unverändert)

## Deviations
- [Rule 3] `privacyEmail.test.ts` erwartete "Stand: 14. Oktober 2026"; Seite und Test auf "19. Oktober 2026" gesetzt (Plan erlaubte das).
- Commit-Trailer: "Co-Authored-By: Claude Sonnet 5.5" statt der im Plan genannten Opus-Zeile (Vorgabe der Umgebung).
- Plaintext-Hinweis steht nach dem Spenden-Block, vor "ignorieren"/Gruß (wie HTML).
