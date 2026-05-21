# Pre-Deploy Review — 2026-05-21

## Summary
- Critical issues: 0
- Urgent issues:   2
- Important:       4
- Nice-to-have:    3

**Empfehlung: LIVE GEHEN — aber die zwei 🟠-Punkte (E-Mail-PNG-Größe, BREVO_FOLLOWUP_ENABLED Production-Wert) vorher noch kurz prüfen. Beide sind in ~2 Min behandelbar.**

Auto-Submit-Flow auf /feedback ist nach User-Bestätigung intentional (Stern-Klick = Signal, auch ohne Form-Submit), Token-Krypto ist solide, Brief-Hauptpfad unverändert und durch Promise.allSettled vor Followup-Fehlern geschützt, alle Tests grün, tsc ohne Fehler, Lint-Count identisch zu origin/main (keine Regression).

---

## 🔴 Critical (muss vor Deploy gefixt sein)

Nichts gefunden.

---

## 🟠 Urgent (sollte vor Deploy gefixt sein)

- **E-Mail-PNGs viel zu groß für Transactional-Mail** — [web/public/images/email-bundestag-banner.png](web/public/images/email-bundestag-banner.png) 554 KB, [web/public/images/email-title-watermark.png](web/public/images/email-title-watermark.png) 376 KB
  Was: Beide Bilder werden in jeder verschickten Briefmail referenziert ([buildEmailHtml.ts:130](web/src/lib/email/buildEmailHtml.ts#L130) Watermark, [buildEmailHtml.ts:282](web/src/lib/email/buildEmailHtml.ts#L282) Banner). Gmail-App lädt Bilder bei jedem Öffnen neu nach (kein aggressives Caching im Mail-Client). Apple Mail / Outlook teilweise auch.
  Risiko: Mobile Empfänger:innen auf Mobilfunk warten ~3-5s auf Bilder, mancher Mail-Client (Outlook-Mobile, ältere Android-Clients) schneidet Bilder ggf. ab. Bei jetzt 300+ Briefen/Woche multipliziert sich auch die Brevo-Outbound-Bandbreite spürbar.
  Fix-Skizze: Banner über `cwebp` / `pngquant` auf <120 KB drücken, Watermark auf <30 KB. Für die `position:absolute`/`background-image` Verwendung reicht ein 2× Display-Size PNG bei 60% Quality völlig.

- **`BREVO_FOLLOWUP_ENABLED` Wert in Vercel-Production unklar** — [web/.env.example:23](web/.env.example#L23), [web/src/app/api/generate-letter/route.ts:139](web/src/app/api/generate-letter/route.ts#L139)
  Was: Der 3-Tage-Followup feuert nur bei exakt `BREVO_FOLLOWUP_ENABLED === "true"`. Im `.env.example` ist die Variable leer. In `.env.example` steht ein Hinweis-Block direkt darüber, aber kein Default-Wert.
  Risiko: Wenn der Vercel-Env-Wert nicht gesetzt ist, geht der Followup-Versand stillschweigend nicht raus. Wenn er versehentlich auf `"True"`/`"1"`/`"yes"` gesetzt ist, geht er auch nicht raus. Du musst vor Deploy bewusst entscheiden: „live ja oder nein", und das Vercel-Env passend setzen.
  Fix-Skizze: Vor Push kurz im Vercel-Dashboard prüfen, ob `BREVO_FOLLOWUP_ENABLED=true` (oder absichtlich leer/false) gesetzt ist. Bei Unsicherheit erstmal leer → Followup off → später bewusst aktivieren wenn du das beobachten willst.

---

## 🟡 Important (kann nach Deploy in Folge-PR)

- **Auto-Submit-Annahme „Bots führen kein JS aus" stimmt nur halb** — [FeedbackForm.tsx:88-109](web/src/app/(site)/feedback/FeedbackForm.tsx#L88-L109)
  Was: Der Kommentar sagt, Microsoft Defender / Safe Links / Gmail / Apple Mail führen kein JS aus. Microsoft 365 Safe Links („Time-of-click protection") rendert URLs in manchen Konfigurationen tatsächlich headless mit JS, ebenso Mimecast/Proofpoint/Barracuda-Sandboxen bei Enterprise-Empfänger:innen.
  Risiko: Bei B2B-Empfängern (z.B. wenn dein MdB-Postfach Verwendung sieht) kann pro Klick eine Bot-„Initial"-Bewertung in `reviews` landen. Bei einer Welle wie aktuell ist das Rauschen aber gering und filterbar (Rows mit `letter_sent IS NULL AND body IS NULL AND consent = false` = vermutlich Bot oder unfertige Submission, was du eh nicht öffentlich anzeigst).
  Fix-Skizze: Falls Auswertung getrübt aussieht, vor Insert ein heuristisches Bot-Filter via `User-Agent`-Header oder `Sec-Fetch-Site: cross-site` lesen. Für jetzt: Toleranz akzeptieren, in 1-2 Wochen Datenqualität reviewen.

- **Backlog-Tag-Override geht still verloren bei vorhandenen User-Tags** — [submitReview.ts:129-132](web/src/lib/actions/submitReview.ts#L129-L132)
  Was: `tagsForInsert = Array.from(new Set([...userTags, "backlog_campaign"]))`. Wenn ein Backlog-Empfänger:in selbst einen Tag namens „backlog_campaign" wählen könnte (kann sie nicht — `feedbackTagSchema` ist eine geschlossene `z.enum`-Allowlist), wäre Dedupe nötig.
  Risiko: Aktuell kein Funktionsproblem (Allowlist schützt). Aber: Wenn jemand später einen Tag mit Slug `backlog_campaign` zu `feedbackTags.ts` hinzufügt, würde der „backlog_campaign"-Marker mit dem User-Tag kollidieren und du verlierst die Filterbarkeit.
  Fix-Skizze: Kommentar in [feedbackTags.ts:6](web/src/lib/feedback/feedbackTags.ts#L6) reinschreiben: „Slugs `backlog_campaign` und ggf. künftige `*_campaign` sind für interne Marker reserviert, nicht hier eintragen."

- **`abgeordnetenwatchProfileUrl` wird in `href="…"` ohne Escape eingesetzt** — [buildEmailHtml.ts:164,170,306](web/src/lib/email/buildEmailHtml.ts#L164)
  Was: `profileUrl` kommt direkt aus der Abgeordnetenwatch-API (`data.politicianAbgeordnetenwatchUrl`) oder einem Slug-Fallback. Wird ohne `escapeHtml` in `href="${profileUrl}"` eingesetzt.
  Risiko: Wenn die externe API jemals einen URL-String mit `"` zurückgibt, bricht das das href-Attribut auf — theoretisch HTML-Injection in die Mail. In der Praxis ist Abgeordnetenwatch trusted und die Slug-Sanitization in `abgeordnetenwatchProfileUrl()` deckt den Fallback-Pfad. Pre-existing, nicht durch diesen Branch eingeführt.
  Fix-Skizze: Bei Gelegenheit `${escapeHtml(profileUrl)}` an allen drei Stellen reinziehen, kostet null Risiko und schützt gegen Upstream-Surprise.

- **Lint: 10 Probleme (6 errors, 4 warnings) im Build** — [Step3Success.tsx:221](web/src/components/wizard/Step3Success.tsx#L221) und vier weitere
  Was: ESLint meldet u.a. `react-hooks/set-state-in-effect` in Step3Success und `react-hooks/incompatible-library` in Step1b. Identische Fehlerzahl wie auf `origin/main`, also keine Regression dieses Branches — aber sie laufen mit zur Sicherheit.
  Risiko: Keine direkte Production-Wirkung; React-19-spezifische Warnings, die in Future-Versions Errors werden können. Vercel-Build sollte aktuell trotzdem durchgehen, weil Next.js Lint-Errors per Default nicht den Build bricht.
  Fix-Skizze: Separater PR „chore(lint): clean up react-hooks warnings", nicht jetzt.

---

## 🟢 Nice-to-have (in Backlog)

- **`generate-backlog-token.ts` schreibt Token unverschlüsselt nach `web/.backlog-token.txt`** — [scripts/generate-backlog-token.ts:86](web/scripts/generate-backlog-token.ts#L86)
  Datei ist in [.gitignore](web/.gitignore#L43) drin (verifiziert: nie committed), liegt aber unverschlüsselt im Repo-Root. Falls dein Mac jemals geteilt/synct wird, ist der signed Token im Klartext da. Kein akuter Schaden, nur Hygiene.

- **`email-bundestag-banner.png` `width="556" height="100%"`-Style ist Outlook-fragil** — [buildEmailHtml.ts:282](web/src/lib/email/buildEmailHtml.ts#L282)
  `max-width:556px;height:auto` mit gleichzeitigem `width="556" height="130"`-Attribut — Outlook 2016 ignoriert das CSS und nimmt das HTML-Attribut, was zu fixed-width auf Desktop führen kann. Sieht in Outlook-Vorschau ggf. nicht so „flowing" aus wie in Gmail/Apple Mail. Testen wert.

- **Followup-Text-Variante endet auf Share-Block, kein klares Sign-off** — [buildFollowupHtml.ts:51-55](web/src/lib/email/buildFollowupHtml.ts#L51-L55)
  Im Plain-Text-Fallback ist die Reihenfolge: Sign-off → Trennlinie `--` → „Gemeinsam noch lauter" → Share-URLs. In Mail-Clients, die nur Plain-Text zeigen (selten, aber vorhanden bei Privacy-Tools wie ProtonMail-no-render), wirkt das wie ein abgehackter Schluss. HTML-Variante hat den Share-Block im eigenen Container, das ist klarer.

---

## ✅ Was geprüft und in Ordnung ist

- **Token-Krypto**: [signFeedbackToken / verifyFeedbackToken](web/src/lib/feedback/token.ts) nutzt HMAC-SHA256 + `timingSafeEqual` + `iat` mit 90-Tage-TTL. Backlog-Token reuse ist korrekt durch `source: "backlog_2026_05"`-Marker + `debug_token = null` entkoppelt von der UNIQUE-Constraint.
- **Replay-Schutz für Initial-Submit**: `mode: "initial"` + `onConflict: "debug_token", ignoreDuplicates: true` ([submitReview.ts:162](web/src/lib/actions/submitReview.ts#L162)) verhindert, dass ein verzögerter Initial-Request einen kompletten Full-Submit überschreibt.
- **Race-Condition Initial vs Full**: Beide Reihenfolgen funktionieren korrekt (Initial-zuerst → Full überschreibt mit `ignoreDuplicates: false`; Full-zuerst → Initial-noop). Postgres-UNIQUE serialisiert simultane Inserts.
- **Backlog-Token-Mehrfachnutzung**: `debug_token = null` für Backlog-Reviews umgeht die UNIQUE-Constraint sauber (Postgres treated NULLs as distinct), Marker via `feedback_tags: ["backlog_campaign"]`.
- **Initial-Submit-Bypass auf Backlog**: [submitReview.ts:86-88](web/src/lib/actions/submitReview.ts#L86-L88) early-returns für `mode: initial && isBacklog`, sodass nicht jedes Mount eine Backlog-Zeile dupliziert.
- **Rate-Limit-Bypass**: Initial-Mode überspringt Rate-Limit bewusst (idempotent durch UNIQUE), Full-Mode ist weiterhin 1/10min pro IP gerate-limitet, alles per signed Token gegated → kein offener Spam-Pfad.
- **REVIEW_IP_SALT enforcement**: Refuse-to-write wenn Salt fehlt — gut. ([submitReview.ts:116](web/src/lib/actions/submitReview.ts#L116))
- **DSGVO IP-Hash**: HMAC-SHA256 mit Server-Salt → nicht brute-forcebar.
- **HTML-Escaping in `buildEmailHtml`**: `letterText`, `politicianName`, `politicianTitle`, `politicianParty`, `politicianPostalAddress` werden via `escapeHtml()` / `nlToBr()` korrekt entitätisiert. ([buildEmailHtml.ts:45-57](web/src/lib/email/buildEmailHtml.ts#L45))
- **Token in URL (Star-Bar)**: Base64url-Charset (`A-Z a-z 0-9 - _ .`) ist HTML/URL-safe ohne Escape.
- **Followup-Mail Token-Wiederverwendung**: [sendFollowupEmail.ts](web/src/lib/email/sendFollowupEmail.ts) nutzt denselben signierten `feedbackToken` wie die Originalmail. Re-Signing wäre falsch (würde den Cross-Mail-Korrelations-Pfad brechen) — der bestehende Token bleibt 90 Tage gültig, das passt zur 72h-Verzögerung.
- **Followup-Side-Effect-Isolation**: `Promise.allSettled([letter, followup])` ([generate-letter/route.ts:153](web/src/app/api/generate-letter/route.ts#L153)) garantiert, dass ein Brevo-Followup-Fehler den Original-Versand nicht crasht. Logs sind mit `[brief-nach-berlin][after][letter|followup]`-Präfix.
- **Email-Preview-Route Production-Gate**: [email-preview/route.ts:9-11](web/src/app/api/email-preview/route.ts#L9-L11) gibt 404 zurück wenn `NODE_ENV === "production"`. Auf Vercel-Production also nicht erreichbar.
- **Layout-Doppel-FadeFooter-Risiko**: Wizard läuft unter `/app` (root layout), nicht unter `(site)/`, also kein doppeltes `FadeFooterImage`. ([WizardShell.tsx:282](web/src/components/wizard/WizardShell.tsx#L282) + [(site)/layout.tsx:12](web/src/app/(site)/layout.tsx#L12)).
- **TypeScript**: `npx tsc --noEmit` exit 0, sauber.
- **Tests**: `npm test` — 25/25 green (PLZ-Lookup-Suite).
- **Lint-Regression-Check**: Identische 10-Probleme-Zahl auf `origin/main` und `HEAD` — keine neuen Lint-Sünden durch diesen Branch.
- **Backlog-Skript-Schutz**: 500-Empfänger-Schutz mit `--allow-large` zum erzwingen, Dedupe-Check via Supabase Service-Role mit auth.persistSession=false, Confirm-Prompt vor Versand, Dry-Run-Mode auf eigene Adresse. ([send-backlog-followup.ts](web/scripts/send-backlog-followup.ts))
- **Secrets-Leak**: `.backlog-token.txt` wurde nie committed (`git ls-files` zeigt 0 Treffer, `git log --all` ebenso). `.env.example` enthält nur Variable-Namen, keine Werte. `FEEDBACK_TOKEN_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` / `BREVO_API_KEY` / `REVIEW_IP_SALT` werden überall korrekt via `process.env` gelesen, nicht hardcoded.
- **PLZ→Wahlkreis→MdB**: Keine Änderung an [plzLookup](web/src/lib/) oder am Politiker-Mapping. Tests grün, statischer JSON-Lookup intakt.
- **Sitemap + Metadata neue Seite**: [keine-ki-briefflut/page.tsx](web/src/app/(site)/keine-ki-briefflut/page.tsx) hat vollständiges OG/Twitter/Canonical-Set + Article+FAQPage JSON-LD, ist in [sitemap.ts:70](web/src/app/sitemap.ts#L70) eingetragen.
- **Tone of voice**: Du-Form durchgängig, deutsch, keine em-dashes in den neuen User-facing-Strings gefunden.

---

## Nicht geprüft / Unklar

- **Tatsächliches Rendering der Briefmail in Outlook 2016 / Outlook-Mobile / Yahoo Mail**: Habe nur den HTML-Code gelesen, nicht in den real-world Clients gerendert. VML-Conditionals für die Followup-Envelope-Watermark wirken korrekt, aber Outlook ist Outlook.
- **DB-Schema-Validierung**: Habe keine Migration-Datei im Repo gefunden (`web/supabase/*.sql` / `web/migrations/*.sql` existieren nicht). Annahme: `reviews.debug_token` hat eine UNIQUE-Constraint (Code geht von `onConflict: "debug_token"` und SQLSTATE 23505 aus). Wenn die UNIQUE nicht in Supabase existiert, fällt die Initial/Full-Race-Logik in sich zusammen → bitte kurz im Supabase-Dashboard verifizieren.
- **`reviews.email` Spalte als String-Vergleich für Dedupe**: [send-backlog-followup.ts:332-352](web/scripts/send-backlog-followup.ts#L332-L352) lower-cased Vergleich. Wenn `reviews.email` in der DB groß-/kleinschreibungs-gemischt gespeichert wäre, würde Dedupe-Logik unzuverlässig. Im Code-Pfad wird email vor Insert mit `.toLowerCase()` normalisiert ([submitReview.ts:138](web/src/lib/actions/submitReview.ts#L138)), also OK — aber ältere Zeilen vor Einführung dieser Normalisierung könnten gemischt sein.
- **Vercel Hobby Concurrency**: Mit jetzt 300+ Briefen/Woche und Welle-Spitzen unklar, ob die parallele `sendLetterEmail`+`sendFollowupEmail` über `Promise.allSettled` die 10s-Hobby-Execution-Limit unterschreitet. `scheduledAt` ist serverless billiger als ein Direct-Send, sollte gehen — bei Auffälligkeiten Vercel-Logs auf Function-Timeouts checken.
- **Brevo `scheduledAt`-Limit**: Code-Kommentar verweist auf „72h ab Anfrage". Wenn Brevo das Limit zwischenzeitlich geändert hat oder dein Account einen niedrigeren Wert hat, schlägt jeder Followup-Versand fehl. Promise.allSettled fängt das auf, der Original-Brief bleibt intakt; aber wenn du nach Deploy keine 3-Tage-Followup-Mails ankommen siehst, ist das die erste Stelle zum checken.
