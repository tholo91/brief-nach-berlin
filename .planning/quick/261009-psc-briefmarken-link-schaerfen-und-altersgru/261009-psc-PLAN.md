# Plan: Briefmarken-Hinweis schärfen + freiwillige Altersgruppe im Review

## Context
1. Briefmarke: In der Brief-Mail ist Schritt 3 der Link "Briefmarke aufkleben". Das liest sich wie eine Anweisung, nicht wie "hier kaufen", deshalb klickt vermutlich kaum jemand. Es gibt null Tracking (kein Redirect, kein UTM, kein Counter). Thomas will den Hinweis sekundär und kurz halten, keinen weiteren Button neben Letter Signal und Spenden.
2. Alter: Wir wissen nicht, wer das Tool nutzt (Vermutung: eher älter). Eine freiwillige Altersgruppe im Review-Formular, mit einem Satz "warum fragen wir das", soll helfen, das Tool zu verbessern und andere Gruppen gezielter zu erreichen.

Ausführung über `/gsd:quick` (Repo-Regel). Formular-Änderung mit `/frontend-design` (Memory-Regel für Frontend).

## Teil 1: Briefmarke (nur Copy, kein neuer Button)
Entschieden (Thomas, 2026-10-09): Link auf "online kaufen", Rest bleibt kurz.
- Desktop: `Briefmarke drauf (0,95 EUR, <a>online kaufen</a>) + ab in den Briefkasten!`
- Mobil: `Briefmarke drauf (<a>online kaufen</a>) + ab in den Briefkasten`
- `web/src/lib/email/mailLocale.ts:43-44` (+ EN :126-127, TR :209-210): `steps[2]` → "Briefmarke drauf"; neue Keys `stampPrice` ("0,95 EUR"), `stampBuy` ("online kaufen" / EN "buy online" / TR "online satın al"), `stampTail` → "+ ab in den Briefkasten" (EN "+ into the mailbox", TR "+ posta kutusuna").
- `web/src/lib/email/buildEmailHtml.ts:640`: Desktop- und Mobil-Span nach obigem Muster bauen; Link-Ziel bleibt `deutschepost.de/.../mobile-briefmarke.html` (Code per Hand aufs Kuvert, keine Marke im Haus nötig).
- `isMdbLater`-Zweig: nutzt `nextSteps[2]` ohne Link. Prüfen, dass "Briefmarke drauf" dort noch Sinn ergibt, sonst eigenen Text behalten.
- Ergebnisseite (`Step3Success.tsx:1114`) bleibt unverändert, kein weiterer Button.
- Messen ohne Code: Thomas schaut in Brevo > Transaktional > Statistik, ob Link-Klicks getrackt werden. Erst wenn das nicht geht, separat über einen `/go/briefmarke`-Zähler nachdenken (nicht Teil dieses Plans).

## Teil 2: Altersgruppe im Review (optional)
Muster 1:1 von der bestehenden optionalen Frage "politische Ohnmacht" übernehmen (`web/src/lib/feedback/politicalActivation.ts`, Migration `019_reviews_political_self_efficacy.sql`).
1. Migration `web/supabase/migrations/028_reviews_age_group.sql`: `alter table reviews add column age_group text check (age_group in ('unter_30','30_44','45_59','60_74','75_plus'))`, nullable.
2. Neue Datei `web/src/lib/feedback/ageGroup.ts`: `AGE_GROUP_VALUES` + `AGE_GROUP_LABELS` ("unter 30", "30 bis 44", "45 bis 59", "60 bis 74", "75 oder älter").
3. `web/src/lib/actions/submitReview.ts`: Zod `ageGroup: z.enum(AGE_GROUP_VALUES).optional()`, im `full`-Upsert als `age_group` schreiben.
4. `web/src/app/(site)/feedback/FeedbackForm.tsx`: neues optionales `<fieldset>` direkt nach der Ohnmacht-Frage (vor "Mehr sagen"), gleiche `SurveyChoice`-Optik.
   - Legend: "Wie alt bist du? (optional)"
   - Hilfetext darunter: "Ich möchte verstehen, wer Brief nach Berlin nutzt, damit ich es besser machen und auch andere Menschen erreichen kann."
   - Antippen nochmal = abwählen (falls die bestehende Ohnmacht-Frage das auch kann, sonst wie dort).
5. `web/src/app/(site)/feedback/PrivacyDisclosure.tsx`: Listenpunkt "Deine Altersgruppe, falls du sie angibst". `web/src/app/(site)/datenschutz/page.tsx` prüfen und ergänzen, falls dort Review-Felder aufgezählt sind.

**Regressionsrisiko:** Wenn der Code vor der Migration live geht, scheitert jeder volle Review-Upsert (unbekannte Spalte). Reihenfolge daher: Migration in Supabase (Prod) zuerst, dann Deploy. Migration auch in `web/supabase/MIGRATION_STATUS.md` eintragen.

Copy-Check: keine Gedankenstriche, gegen `signs-of-ai-writing.md` prüfen.

## Verifikation
1. `npx tsc --noEmit`, `npm run lint`, bestehende Tests (`npm test`, inkl. evtl. Tests zu `submitReview`/`buildEmailHtml`).
2. Mail: `buildEmailHtml` per kleinem tsx-Script im Scratchpad rendern, HTML im Browser-Pane öffnen, Schritt 3 desktop + mobil (375px) screenshotten; DE/EN/TR prüfen.
3. Formular: Dev-Server, `/feedback` mit lokal signiertem Token (`FEEDBACK_TOKEN_SECRET` aus `.env.local`), Altersgruppe wählen, absenden gegen lokale/Test-DB bzw. Upsert-Payload prüfen; Screenshot desktop + mobil.
4. Nach Prod-Migration: ein Test-Review absenden, Spalte `age_group` per tsx-Script (Supabase-Zugriffsweg aus Memory) prüfen.

## Später (nicht jetzt)
- Altersverteilung in `/brief-review-batch` auswerten.
- `/go/briefmarke`-Zähler, falls Brevo keine Klickzahlen liefert.
