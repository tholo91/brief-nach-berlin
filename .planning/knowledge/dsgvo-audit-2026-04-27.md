# DSGVO-Audit: Brief nach Berlin

**Stand:** 2026-04-27 (Initial-Audit) · Fortschritt-Update 2026-06-11
**Branch:** `claude/gdpr-compliance-audit-ba4QM`
**Scope:** Vollständige Codebase `web/`, Datenschutzerklärung, Impressum, Hosting-Konfiguration, eingebundene Drittdienste

---

## Fortschritt (Stand 2026-06-11)

| Befund | Status | Evidence |
|--------|--------|----------|
| **H1** Datenschutz nennt OpenAI, Code nutzt Mistral | ✅ erledigt | Datenschutz §6/§9 komplett überarbeitet; Copy-Paste-Bug LfDI in §14 gefixt (Commit `610d4d1`) |
| **H2** `issueTextPreview` (120 Zeichen Anliegen) im Vercel-Log | ✅ erledigt | `generateLetter.ts:436` → `issueTextLength` (Commit `610d4d1`) |
| **H3** `created-letters/*.eml` im Repo | ✅ erledigt | Ordner entfernt, `.gitignore` ergänzt (Commit `610d4d1`) |
| **H4** Google-Fonts-Tracking-Pixel in E-Mail | ✅ erledigt | `<link>` aus `buildEmailHtml.ts:103` raus, Fallback auf System-Cursive (Commit `610d4d1`) |
| **M1** Impressum TMG/RStV veraltet | ✅ erledigt | DDG / MStV § 18 (Commit `610d4d1`) |
| **M2** LfDI als Aufsichtsbehörde fehlte | ✅ erledigt | LfDI Bremen in Datenschutz §1 und §14 |
| **M3** Art. 21 Widerspruchsrecht fehlte | ✅ erledigt | Datenschutz §14 |
| **M4** Art. 9 / besondere Kategorien | ✅ erledigt | Datenschutz §3 + §7 (ausdrückliche Einwilligung Art. 9 (2) lit. a) |
| **M5** PII (`?text=` bis 1500 Zeichen) im "Neuen Brief"-Link | ✅ erledigt | Button öffnet Wizard leer; `buildEmailHtml.ts:78` ersetzt durch URL ohne Parameter. Pre-Fill-Code in `WizardShell.tsx` bleibt zwar erhalten (für selbstgeteilte Links durch User), aber unsere eigenen Mails leaken keine PII mehr. |
| **M6** Brevo Open-/Click-Tracking aktivieren | ✅ erledigt | Im Brevo-Backoffice deaktiviert (verifiziert 2026-06-11); Hinweis in `.env.example` |
| **M7** IP-/E-Mail-Hashing für Rate-Limit-Keys | ✅ erledigt | `hashIdentifier()` in `rateLimit.ts`, 7 Aufrufstellen + `RATE_LIMIT_SALT` (Commit `5377cfc`) |
| **M8** Security-Header (CSP/HSTS/X-Frame/…) | ✅ erledigt (außer CSP) | `next.config.ts` setzt HSTS preload, `X-Frame-Options: DENY`, `nosniff`, strict Referrer-Policy, Permissions-Policy (mic=self, rest=()), COOP same-origin. CSP bewusst weggelassen — restriktive CSP ohne Live-Testing bricht leicht etwas; report-only als Folgeschritt möglich. |
| **M9** heyspeak.io in Datenschutz nicht erwähnt | ✅ erledigt | Neue §14 "Feedback-Weiterleitung (heyspeak.io)" — als selbst betriebene Privatpersonen-App, Vercel `fra1`, Mistral EU, kein Drittlandtransfer; Cross-Refs (§14 Rights → §15 etc.) angepasst |
| **M10** AI-Act-Hinweis in UI | ✅ erledigt (vor Audit-Phase) | `/ki-transparenz` deckt Art. 50 AI Act vollständig ab |
| **M11** Verarbeitungsverzeichnis (Art. 30) | ⏳ offen | als internes Markdown geplant (`.planning/knowledge/dpa-status.md`) |

Die folgenden Abschnitte beschreiben den Initial-Audit-Stand zum Zeitpunkt 2026-04-27 — sie sind historische Dokumentation, kein aktueller Zustand mehr.

---

## 0. Executive Summary

Brief nach Berlin ist im Vergleich zu typischen MVPs **deutlich überdurchschnittlich gut** aufgestellt. Die zentrale Designentscheidung "**keine persistente Speicherung von Nutzerdaten in v1**" ist konsequent umgesetzt: kein Account, kein Cookie, kein Analytics, kein Local Storage, keine Datenbank. Daten leben nur für die Dauer eines HTTP-Requests im Memory und werden danach verworfen.

**Gesamteinschätzung: GRUNDSÄTZLICH DSGVO-KONFORM, mit klar adressierbaren Lücken vor Public-Launch.**

| Kategorie | Status | Schwere offene Punkte |
|-----------|--------|-----------------------|
| Hosting / Region | ✅ Frankfurt (`fra1`) | Vercel Inc. ist US-Konzern → SCC/DPF nötig (bereits dokumentiert) |
| Drittanbieter / Auftragsverarbeiter | ⚠️ Diskrepanz Doku ↔ Code | Datenschutzerklärung nennt OpenAI, Code nutzt aber nur Mistral |
| Speicherbegrenzung | ✅ Keine User-PII persistiert | Aber: `created-letters/` mit echten E-Mails im Repo |
| Transparenz (Art. 13) | ✅ Gut, aber teilweise falsch | OpenAI-Sektion ist faktisch inkorrekt |
| Logging | ⚠️ Größtenteils sauber | `issueTextPreview` (120 Zeichen Klartext) bei Fallback-Logging |
| TDDDG / Cookie-Consent | ✅ Keine Cookies → kein Banner nötig | Aber: externe Webfonts in E-Mail laden Google-Server |
| Impressum (DDG, MStV) | ⚠️ Veraltete Paragrafen | TMG → DDG, RStV § 55 → MStV § 18 |
| Security-Header | ⚠️ Keine konfiguriert | CSP/HSTS/X-Frame-Options fehlen |
| AVVs (Art. 28) | ⚠️ Müssen geprüft werden | DPAs mit Vercel, Mistral, Brevo manuell abzuschließen |

**Top-3 Sofortmaßnahmen vor Public-Launch:**

1. **Datenschutzerklärung an Code angleichen:** OpenAI-Sektion entfernen oder als optional/nicht-aktiv kennzeichnen — wir nutzen Mistral Moderation, nicht OpenAI.
2. **`created-letters/` aus dem Repo nehmen** und in `.gitignore` aufnehmen.
3. **`issueTextPreview: input.issueText.slice(0, 120)`** in `generateLetter.ts:191` entfernen oder durch Hash/Länge ersetzen.

---

## 1. Welche Dienste werden _tatsächlich_ angesprochen?

Quelle: Volltextsuche in `web/src/**` + Inspektion aller Server Actions + `.env.example`.

### 1.1 Tatsächlich produktiv eingebunden

| Dienst | Anbieter / Sitz | Genutzt für | Datenkategorien an Anbieter | Code-Referenz |
|--------|------------------|-------------|------------------------------|---------------|
| **Mistral AI** | Mistral AI SAS, Paris (EU) | Briefgenerierung, Inhaltsmoderation _und_ Voice-Transkription | Freitext-Anliegen, optionaler Name/Partei/Org, gewählter Ton, generierter Brief, Audio-Blob (WebM) | `lib/mistral.ts:3`, `lib/generation/generateLetter.ts:136`, `lib/moderation/moderateText.ts:9`, `app/api/transcribe/route.ts:54` |
| **Brevo** (vormals Sendinblue) | Brevo SAS, Paris (EU) | Transaktionaler Versand der fertigen Brief-E-Mail | Empfänger-E-Mail, gesamter Brieftext, Adresse des Abgeordneten, ggf. Debug-Payload (Metadaten) | `lib/email/sendLetterEmail.ts:9,50` |
| **Vercel** | Vercel Inc., Walnut (USA) — Edge in `fra1` Frankfurt | Hosting des Next.js-Backends, Function-Logs | Request-Metadaten (IP, User-Agent, Pfad), Server-Logs, Build-Artefakte | `vercel.json:1` (`{"regions": ["fra1"]}`) |
| **Google Fonts (next/font)** | Google Ireland Ltd. (selbstgehostet zur Build-Zeit) | Web-Schriften auf Landing-Page | Bei `next/font/google` werden Fonts **at build time** heruntergeladen und mit der App ausgeliefert — keine Runtime-Calls vom Browser zu Google. | `app/layout.tsx:2` |
| **Google Fonts (`fonts.googleapis.com`) — in E-Mail** | Google Ireland Ltd. | `Caveat`-Handschrift im E-Mail-HTML | **Runtime-Call:** Jeder Mail-Client, der Remote-CSS lädt, sendet IP + User-Agent an Google. Effektiv ein **Tracking-Pixel**. | `lib/email/buildEmailHtml.ts:79` |
| **Abgeordnetenwatch / Bundeswahlleiterin** | Statische Daten | PLZ→Wahlkreis-Mapping, Politikerdaten | **Keine Runtime-Calls.** Daten sind als JSON im Build vorgebacken (`data/politicians-cache.json`, `data/plz-wahlkreis-mapping.json`) | `lib/lookup/plzLookup.ts` |
| **WhatsApp / Telegram / `mailto:`** | Meta, Telegram, lokaler Mail-Client | Share-Links in der Brief-E-Mail | Erst aktiv, wenn _Empfänger_ klickt — keine automatische Übertragung | `lib/email/buildEmailHtml.ts:67–69` |
| **heyspeak.io (Feedback)** | Drittanbieter | Feedback-Button im Footer der E-Mail | Was auch immer der Nutzer dort einträgt | `lib/config.ts:45` (`FOUNDER_FEEDBACK_URL`) |

### 1.2 _Nicht_ aktiv, obwohl erwähnt

| Dienst | Wo erwähnt | Realität |
|--------|------------|----------|
| **OpenAI** | `.env.example:9`, Datenschutzerklärung Sektion 9 | **Nicht im Code referenziert.** Die Datei `lib/moderation/moderateText.ts:9` ruft `mistral.classifiers.moderate({ model: "mistral-moderation-latest" })` auf. `grep` nach `openai` in `web/src/` liefert _nur_ Treffer in der Datenschutzerklärung — kein Import, kein API-Call. |
| **Langfuse** | `.env.example:17–19` | Keine Code-Referenz (`grep -r "langfuse" web/src` → 0 Treffer). Env-Variablen sind vorbereitet, aber inaktiv. |

→ **Antwort auf deine Kernfrage "Nutzen wir nur Mistral?":**
**Ja, für alle AI-Workloads.** Mistral übernimmt Briefgenerierung (`mistral-small-latest`), Voice-Transkription (`voxtral-mini-transcribe-2507`) **und Moderation** (`mistral-moderation-latest`). OpenAI ist _historisches Artefakt_ in `.env.example` und Datenschutzerklärung — wird tatsächlich **nicht** aufgerufen.

---

## 2. Perspektive: Datenschutz-Beauftragter / DSGVO-Compliance

### 2.1 Rechtsgrundlagen je Verarbeitungszweck

| Daten | Zweck | Rechtsgrundlage | Bewertung |
|-------|-------|------------------|-----------|
| PLZ | Zuordnung Wahlkreis | Art. 6 (1) b — Vertrag (Vorbereitung) | ✅ Korrekt |
| E-Mail | Versand des Briefs | Art. 6 (1) b — Vertrag | ✅ Korrekt |
| Freitext-Anliegen | KI-Briefgenerierung | Art. 6 (1) b — Vertrag | ✅ Korrekt, aber **Sondertbestimmungen Art. 9 prüfen** — Anliegen können Gesundheitsdaten, politische Meinung, religiöse Überzeugung enthalten. Im Free-Text-Feld nicht ausschließbar. |
| Audio-Aufnahme | Transkription | Art. 6 (1) b | ✅ Korrekt |
| IP-Adresse | Rate-Limit, technisches Logging | Art. 6 (1) f — berechtigtes Interesse (Missbrauchsschutz) | ✅ Korrekt, sollte aber im Datenschutz benannt sein (ist bei Vercel-Sektion sinngemäß enthalten) |
| Moderation-Calls | Missbrauchsverhinderung | Art. 6 (1) f | ✅ Korrekt |

**Heikel: Art. 9 DSGVO (besondere Kategorien personenbezogener Daten).**
Wenn ein Bürger schreibt _"Ich bin chronisch krank und brauche ein Medikament"_ oder _"Als Mitglied der Grünen Partei …"_, fließen Gesundheitsdaten bzw. politische Meinung in den Freitext und werden an Mistral übermittelt. Diese Verarbeitung benötigt strenggenommen eine Art. 9 (2) Rechtsgrundlage. **Empfehlung:** In der Datenschutzerklärung explizit anerkennen, dass Nutzer freiwillig solche Daten einbringen können und durch die Nutzung in die Verarbeitung gemäß Art. 9 (2) a (ausdrückliche Einwilligung durch konkrete Handlung) einwilligen — ggf. Hinweis-Text im Wizard direkt vor dem Freitextfeld ergänzen.

### 2.2 Transparenz (Art. 13) — Konkrete Findings in `datenschutz/page.tsx`

| Sektion | Befund | Schwere |
|---------|--------|---------|
| §2 (Allgemeines) | Aussage _"Es werden keine Cookies gesetzt, kein Tracking eingesetzt"_ — stimmt mit Code überein | ✅ |
| §3 (Vercel, USA) | Korrekt: SCCs + DPF erwähnt. Aussage _"Vercel verarbeitet IP, Zugriffszeitpunkt"_ ist zutreffend (Vercel-Logs) | ✅ |
| §4 (PLZ) | _"Vollständig lokal anhand statischer Daten"_ — stimmt mit `lookupPLZ` überein | ✅ |
| §5 (E-Mail) | Korrekt — Brevo wird sauber als Empfänger benannt | ✅ |
| §6 (Anliegen / Voice) | Sagt: _"an Mistral AI zur Brieferstellung und an OpenAI zur Inhaltsprüfung übermittelt"_ → **FAKTISCH FALSCH.** Moderation läuft über Mistral. | 🔴 **HIGH** |
| §8 (Mistral) | Korrekt benannt — Paris, AVV-Link | ✅ |
| §9 (OpenAI Moderation) | **Komplette Sektion ist obsolet** — OpenAI wird nicht aufgerufen. Stehenlassen verletzt Art. 13 (Wahrheitspflicht). | 🔴 **HIGH** |
| §10 (Brevo) | Korrekt | ✅ |
| §11 (Betroffenenrechte) | Listet Art. 15/16/17/18/20/77 auf, ohne Verfahren zur Wahrnehmung zu beschreiben | ⚠️ MEDIUM — sollte ergänzt werden: _"Anfragen bitte an thomas_lorenz@posteo.de"_, plus Bestätigungs-/Antwortfrist |
| §11 — Fehlt | Art. 21 (Widerspruchsrecht) nicht erwähnt | ⚠️ LOW |
| Allgemein fehlt | Verweis auf zuständige Aufsichtsbehörde (LfDI NRW, da Duisburg) | ⚠️ MEDIUM |
| Allgemein fehlt | Hinweis auf Voxtral / Audio-Modellname für Voice-Transkription (Modell wird in §6 nur generisch "Voxtral API" benannt — das ist OK) | ✅ |
| Allgemein fehlt | Hinweis auf `fonts.googleapis.com` in der E-Mail | ⚠️ MEDIUM (siehe §4 dieses Reports) |
| Allgemein fehlt | Hinweis auf `heyspeak.io` (Feedback-Link in E-Mail) | ⚠️ LOW |
| Allgemein fehlt | Hinweis auf die `?text=…`-URL im "Neuen Brief schreiben"-Button (PII im Klartext-Link, bis zu 1500 Zeichen — siehe §3.4) | ⚠️ MEDIUM |
| Stand-Hinweis | _"Stand: April 2026"_ ist gepflegt | ✅ |

### 2.3 Verarbeitungsverzeichnis (Art. 30)

Für eine Einzelperson als Verantwortlicher unter 250 Beschäftigten ist Art. 30 grundsätzlich nicht zwingend, **aber:** sobald die Verarbeitung _nicht nur gelegentlich_ erfolgt (was bei einer öffentlich zugänglichen Web-App der Fall ist), greift die Pflicht doch. **Empfehlung:** Verzeichnis erstellen — kann ein einseitiges Markdown sein, das pro Datenkategorie Zweck/Empfänger/Speicherdauer dokumentiert. Vorlage: das `.planning/knowledge/`-Verzeichnis dieses Repos.

### 2.4 Datenschutz-Folgenabschätzung (DSFA, Art. 35)

**Nicht zwingend, aber ratsam:**
- Kein Profiling, keine automatisierten Einzelentscheidungen mit Rechtsfolgen (Art. 22) — die KI _entwirft_ einen Brief, aber der Bürger entscheidet selbst, ob er ihn verschickt.
- Keine Verarbeitung sensibler Daten _systematisch_ (Art. 9 kann aber im Freitext auftauchen → siehe oben).
- Kleine Reichweite (MVP), keine Überwachung.

→ **DSFA nicht zwingend erforderlich**, aber kurze Risikoanalyse als Schutzdokumentation sinnvoll.

### 2.5 Betroffenenrechte — praktische Umsetzbarkeit

Da keine Userdaten persistiert werden, sind Auskunft/Löschung trivial: _"Wir speichern nichts."_ Brevo-seitig wird aber jede E-Mail in deren Transaktionsprotokoll archiviert. Dort kann ein Bürger nicht direkt Auskunft verlangen, aber theoretisch über uns als Verantwortlichen. **Empfehlung:** Verfahren intern festlegen — bei Auskunftsanfrage Brevo-Search nach E-Mail-Adresse durchführen.

---

## 3. Perspektive: Security-Engineer

### 3.1 Datenflüsse — wo lebt PII wie lange?

```
Browser
  └─ Form-State (PLZ, E-Mail, Name, Anliegen)
     Lebensdauer: bis Tab geschlossen / Navigation; kein localStorage

  ↓ HTTPS → Vercel fra1 (Frankfurt)

Next.js Server Action (submitWizardAction / selectPoliticianAction)
  ├─ Zod-Validierung
  ├─ Rate-Limit-Check (In-Memory Map → IP/E-Mail-Hash, max. 1h–24h)
  ├─ lookupPLZ()                              [lokale JSON]
  ├─ moderateText(issueText) ─────────────→  Mistral (EU)
  ├─ generateLetter() ─────────────────────→  Mistral (EU)
  ├─ moderateText(letter) ─────────────────→  Mistral (EU)
  └─ after(() => sendLetterEmail(…)) ──────→  Brevo (EU)
                                              │
                                              └─ E-Mail enthält:
                                                 ├─ Brief im Klartext
                                                 ├─ Politiker-Postadresse
                                                 ├─ ?text=<URL-encoded Issue>  (bis 1500 Zeichen!)
                                                 └─ <link rel="stylesheet"
                                                       href="fonts.googleapis.com/…">

POST /api/transcribe
  └─ Audio-Blob (FormData) ──────────────→  Mistral Voxtral (EU)
     Audio im Server-Memory nur für Request-Dauer, nicht persistiert
```

**Persistenz-Stationen außerhalb unserer Kontrolle:**
- Brevo: Versandprotokolle (Standard: 30+ Tage, je nach Plan)
- Mistral: laut DPA werden API-Inputs zu Trainingszwecken **nicht** verwendet, Logs nach Retention-Policy gelöscht
- Vercel: Function-Logs (Standard 1h Live, 1 Tag Archive auf Hobby; länger auf Pro)

### 3.2 Logging — PII-Leaks in unseren eigenen Logs

| Datei : Zeile | Was wird geloggt | Bewertung |
|---------------|------------------|-----------|
| `submitWizard.ts:24` | `plz, issueTextLength, hasName, hasParty, hasNgo, letterLength` | ✅ Keine Volltexte, PLZ ist nur 5 Ziffern |
| `submitWizard.ts:164` | Error-Details + `plz`, `issueTextLength`, Stack | ✅ Kein Volltext |
| `submitWizard.ts:62, 75` | `ip` (im Rate-Limit-Log) | ⚠️ IP ist personenbezogen — sollte gehasht oder gekürzt werden |
| `resendLetter.ts:17` | `email: "***"` explizit maskiert | ✅ Vorbildlich |
| `generateLetter.ts:187–195` | **`issueTextPreview: input.issueText.slice(0, 120)`** | 🔴 **HIGH** — 120 Zeichen des Nutzer-Anliegens landen in Vercel-Logs, sobald Mistral eine unbekannte Politiker-ID zurückgibt (Fallback-Pfad). Das ist PII (potenziell Art.9!). **Fix:** Auf `issueTextHash` (z.B. SHA-256, erste 8 Zeichen) ersetzen oder ganz weglassen. |
| `selectPolitician.ts:98` | `plz, selectedPoliticianId, derivedIds` | ✅ Keine PII |
| `api/transcribe/route.ts:62` | `result` (Mistral-Response) bei leerem Text | ⚠️ Könnte Tail-Transkript enthalten, vermutlich aber nicht — Code prüft auf `!text` → result ist hier wahrscheinlich Metadata. Trotzdem: lieber strukturiert loggen. |
| `api/transcribe/route.ts:25` | IP-Adresse (im Rate-Limit-Key, nicht direkt geloggt) | ✅ |

### 3.3 IP-Adresse als personenbezogenes Datum

`getClientIp()` in `lib/rateLimit.ts:66` extrahiert die IP aus `x-forwarded-for` und nutzt sie als Bucket-Key. Die IP wird _nicht direkt geloggt_ als eigenes Feld, aber:
- bei Vercel landet sie ohnehin im Request-Log
- im Fehler-Log `submitWizard.ts:62` wird `ip` als `extra`-Parameter mitgegeben → landet in Vercel

**Empfehlung:** IP für Rate-Limiting-Bucket-Key **hashen** (`crypto.createHash("sha256").update(ip + SALT).digest("hex").slice(0, 16)`) — dann ist der Key pseudonym, und die IP existiert nur kurz im Funktionsspeicher der ersten Header-Extraktion.

### 3.4 PII in URL-Parametern der E-Mail

`buildEmailHtml.ts:50–54`:
```ts
const truncatedText =
  data.issueText.length > WIZARD_TEXT_PARAM_MAX_LENGTH  // = 1500
    ? data.issueText.slice(0, WIZARD_TEXT_PARAM_MAX_LENGTH) + "..."
    : data.issueText;
const regenerateUrl = `${APP_URL}${WIZARD_PATH}?text=${encodeURIComponent(truncatedText)}`;
```

Das Anliegen des Bürgers wird **bis zu 1500 Zeichen im Klartext** als URL-Parameter in der E-Mail eingebettet. Konsequenzen:
- Wenn der Bürger die E-Mail weiterleitet, weiß der Empfänger Bescheid.
- Wenn ein Mail-Client URLs voranalysiert (Spam-Filter, Link-Vorschauen, Outlook Safe Links), wird der gesamte Anliegen-Text an Dritte (Microsoft, Google, Proofpoint, …) gesendet.
- HTTP-Referer beim Klick auf `?text=…` kann den Text an Tracker auf der Zielseite leaken (in unserem Fall harmlos, weil die Zielseite wir selbst sind, aber als Pattern problematisch).

**Empfehlung:** Statt vollem `?text=` einen **kurzen Token** generieren (z.B. signed-JWT mit Hash), der zum Wizard-Aufruf das Anliegen aus einer Server-seitigen Zwischenstation lädt — oder schlicht nur den Re-Wizard-Link ohne Vorbefüllung anbieten und in der UI darauf hinweisen.

### 3.5 Google Fonts in der E-Mail = Tracking-Pixel

`buildEmailHtml.ts:79`:
```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet">
```

Jeder Mail-Client, der externe Ressourcen rendert (Apple Mail mit "Bilder laden", Outlook mit aktivierter Bildanzeige, Gmail im Web), löst beim Öffnen einen Request an Google aus. Übertragen werden:
- IP-Adresse des Mail-Empfängers
- User-Agent (Mail-Client-String)
- Referer / Mail-Client-Header
- Cookies, falls Google-Cookies im Mail-Client-Webview vorhanden

Das ist effektiv ein **Tracking-Vorgang ohne Einwilligung**, der Google Daten über den Mail-Empfang gibt. **Datenschutzrechtlich heikel**, auch wenn die Caveat-Handschrift schick aussieht. **Fix:** entweder
- Caveat als `@font-face` mit Base64-Inline-Daten einbetten (aufgebläht, viele Mail-Clients ignorieren `@font-face` aber),
- oder den Schriftzug "Thomas" als **SVG/PNG** rendern und im E-Mail-Body als Bild einbetten,
- oder Fallback auf System-Cursive (`'Brush Script MT', cursive`) akzeptieren.

### 3.6 Security-Header

`next.config.ts` ist leer, `vercel.json` definiert nur die Region. Es fehlen:
- `Content-Security-Policy`
- `Strict-Transport-Security` (Vercel setzt HSTS auf Custom Domains automatisch — verifizieren)
- `X-Frame-Options: DENY` (Schutz vor Clickjacking)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (insbesondere `microphone=(self)` für Voice-Eingabe einschränken)

→ Vorschlag: `next.config.ts` um `async headers()` ergänzen oder `vercel.json` headers-Block.

### 3.7 Rate-Limiting

`lib/rateLimit.ts` ist In-Memory pro Vercel-Instanz. Dokumentierte Grenze: Cold-Starts und horizontaler Skalierung erzeugen unabhängige Buckets. **Für DSGVO unkritisch** (kein zentraler Speicher = noch weniger Daten), **für Abuse-Schutz aber löchrig**. SEED-001 (`.planning/seeds/SEED-001-shared-rate-limit-and-captcha.md`) hat das offenbar bereits als Backlog-Item.

### 3.8 Eingabe-Validierung / Injection

- `buildEmailHtml.ts:24–31`: `escapeHtml()` deckt `&<>"'` → ✅ schützt vor HTML-Injection in der Mail.
- `selectPolitician.ts:80–104`: Re-Derivation der Politiker-Liste server-seitig + ID-Verifikation gegen die Liste → ✅ verhindert Politician-Spoofing durch manipulierte Clients.
- Zod-Schemas in `lib/validation/wizardSchemas.ts`: prüfen PLZ (5 Ziffern), E-Mail, Issue-Length. ✅

Allgemein: Server Actions tun das Richtige.

---

## 4. Perspektive: Hosting & Infrastruktur (Vercel in DE/EU)

### 4.1 Aktueller Zustand

`vercel.json`:
```json
{ "regions": ["fra1"] }
```

Das bedeutet: **Serverless Functions und Edge Functions laufen in Frankfurt am Main (AWS eu-central-1).** Auch der Build wird dort durchgeführt. Das ist genau das, was du willst.

### 4.2 Was bedeutet "Vercel in Deutschland/Europa" wirklich?

| Komponente | Wo läuft sie? | Wer ist Betreiber? |
|------------|----------------|---------------------|
| Static Assets / Edge-Cache | Globales Vercel-CDN (auch außerhalb EU, je nach Visitor-Geo) | Vercel Inc. (US-Konzern), CDN-Nodes via AWS/Cloudflare-Infra |
| Serverless Functions (Server Actions, API Routes) | `fra1` = AWS Frankfurt | Vercel Inc., physische Server bei AWS DE |
| Edge Middleware | Globales Vercel-Edge | Vercel Inc. |
| Build | `fra1` (lt. `regions`-Setting in `vercel.json` für Build-Output) | Vercel Inc. |
| Logs / Observability | Vercel-Backend, primär USA | Vercel Inc. |
| Customer-Support / DNS / Admin | Vercel-Backoffice in USA | Vercel Inc. |

**Wichtig:** Auch wenn der Code in `fra1` läuft, ist der **Vertragspartner** Vercel Inc. (USA). Das ist datenschutzrechtlich ein **Drittlandtransfer**, weil
- Vercel-Mitarbeiter in den USA Logs/Support-Tickets einsehen können,
- US-Behörden potenziell Zugriff verlangen können (CLOUD Act),
- Backup-/Failover-Konstellationen Daten temporär aus EU rausziehen können.

Dafür existieren bei Vercel:
- **EU-US Data Privacy Framework** (Vercel ist gelistet) → reicht als Transfer-Grundlage nach Art. 45 DSGVO.
- **Standardvertragsklauseln (SCCs)** im Vercel DPA als Backup.

→ **Aktuelle Datenschutzerklärung benennt das korrekt.** Du hast hier nichts zu reparieren.

### 4.3 "Geht es noch europäischer?" — Alternativen

| Anbieter | Vorteil | Nachteil |
|----------|---------|----------|
| **Vercel + `fra1` (Status quo)** | Beste DX, Next.js 16 first-class, Build und Runtime in EU | US-Konzern, DPF/SCC als Transfer-Mechanismus |
| **OVHcloud (FR) / IONOS Cloud (DE)** | Vertragspartner in EU, kein Drittlandtransfer, Bare-Metal/Container | Kein Next.js-Hosting out-of-the-box; eigene CI/CD, eigene Edge, eigenes Deployment-Pipeline |
| **Hetzner Cloud (DE)** | EU-Vertragspartner, sehr günstig, Frankfurt/Nürnberg | Wie OVH — eigene Ops, kein Vercel-DX |
| **Cloudflare Pages + Workers** | Edge in EU, eigenes EU-DPA, jüngst verbessertes EU-Cluster | US-Konzern, nicht 1:1 Next.js-RSC-kompatibel |
| **Netlify** | Ähnliches Modell wie Vercel | US-Konzern, gleiche Drittland-Logik wie Vercel |

**Pragmatische Empfehlung:** **Bei Vercel + `fra1` bleiben.** Das DPF-Listing + SCC + die Tatsache, dass Funktionen tatsächlich in DE laufen, ist für den Anwendungsfall (Bürger schreiben Briefe, kein hochsensibles B2B) **mehr als angemessen**. Der Umzug auf reines EU-Hosting kostet Tage und macht den Datenschutz nicht meßbar besser, solange Mistral und Brevo weiter genutzt werden.

Wenn du _formal_ jeden US-Konzern aus der Lieferkette nehmen willst, müsstest du auch
- `next/font/google` durch lokale Fonts ersetzen (Build-Time-Download kommt von Google),
- `fonts.googleapis.com` aus der E-Mail entfernen,
- ggf. Github-Pages / Codeberg statt GitHub fürs Repo nutzen.

→ Bestes Kosten/Nutzen-Verhältnis: bei Vercel bleiben, aber Vercel-DPA prüfen und im Vercel-Dashboard unter Settings → Compliance bestätigen, dass du den DPA akzeptiert hast.

### 4.4 Vercel Logs als Retention-Risiko

- Hobby Plan: Function Logs 1 Stunde live, 1 Tag persistiert.
- Pro Plan: 1 Tag live, bis zu 30 Tage persistiert.
- Logs enthalten auf `submitWizard.ts:24` per Default `plz`, `issueTextLength`, IP-Adresse (im Vercel-Request-Log).

**Empfehlung:**
- Im Vercel-Dashboard Log-Retention nicht hochstellen.
- PLZ + IP in Logs reduzieren (siehe §3.2).
- Für Production keine Log-Drains zu Drittservices (Datadog, Logflare) aufsetzen, ohne deren DPA zu prüfen.

---

## 5. Perspektive: Vendor Due Diligence

### 5.1 Mistral AI

- **Sitz:** 15 rue des Halles, 75001 Paris, Frankreich.
- **Verarbeitungsorte:** Mistral wirbt mit "EU-only inference". Standardendpunkt `api.mistral.ai` routet auf EU-Infrastruktur.
- **Trainings-Opt-out:** Mistral DPA schließt aus, dass API-Calls auf der Plattform für Trainings genutzt werden. Quelle: `legal.mistral.ai/terms/data-processing-addendum`.
- **AVV / DPA:** **Du musst diesen DPA aktiv unterzeichnen** — typischerweise via Mistral Console → Compliance → Sign DPA. Bis dahin gilt nur der Standard-ToS. **Bitte verifizieren und in einem internen `dpa-status.md` festhalten.**
- **Sub-Processors:** Mistral nutzt Cloud-Infrastruktur (laut deren Doku u.a. Scaleway, GCP-Europe, OVH). Liste prüfen.
- **Modelle in Nutzung:**
  - `mistral-small-latest` für Generierung (`generateLetter.ts:6`)
  - `mistral-moderation-latest` für Klassifikation (`moderateText.ts:10`)
  - `voxtral-mini-transcribe-2507` für Audio (`route.ts:55`)
- **Risiko:** **gering** — französischer Anbieter, EU-Verarbeitung, AVV-Standard vorhanden.

### 5.2 Brevo

- **Sitz:** 106 boulevard Haussmann, 75008 Paris, Frankreich.
- **Verarbeitungsorte:** Rechenzentren in Frankreich + Deutschland (OVH).
- **DPA:** Standardvertrag verfügbar im Brevo-Backoffice (Settings → Privacy & Compliance).
- **Datenarten an Brevo:**
  - Empfänger-E-Mail (zwingend)
  - Brief-Volltext im HTML-Body (zwingend)
  - Politikername + Adresse (Public-Data)
  - Debug-Payload, falls aktiv (Metadaten — nicht PII)
- **Brevo-Tracking:** Standard-Brevo-Mails enthalten _von Brevo eingefügt_ Tracking-Pixel und Link-Rewriting, **wenn nicht deaktiviert**. **Im Code (`sendLetterEmail.ts:50`) ist kein Opt-out gesetzt.** Bitte im Brevo-Account prüfen: Settings → Tracking → "Open Tracking" und "Click Tracking" für transaktionale Mails **deaktivieren**, oder pro Send-Call `params: { TRACKING: false }` setzen (Brevo-API-Doku konsultieren — exakter Parameter-Name kann je nach SDK-Version variieren).
- **List-Unsubscribe:** Die `.eml`-Beispiele in `created-letters/` zeigen `List-Unsubscribe: One-Click`-Header. Bei transaktionalen Briefen ist das OK (Brevo setzt das automatisch).
- **Risiko:** **gering**, sobald Tracking deaktiviert ist.

### 5.3 Vercel

Siehe §4. **AVV via Vercel Dashboard → Settings → Privacy → Data Processing Addendum** akzeptieren, falls noch nicht geschehen.

### 5.4 Google (next/font + E-Mail-Fonts)

- **`next/font/google`**: Build-Time-Download, danach selbstgehostet. **Kein Runtime-Call.** ✅
- **`fonts.googleapis.com` in E-Mail**: Runtime-Call beim Öffnen der Mail. ⚠️ Siehe §3.5.

### 5.5 heyspeak.io

- Feedback-Tool eines Drittanbieters. Was Nutzer dort schreiben, geht direkt an heyspeak.
- **Empfehlung:**
  - Datenschutzerklärung des Anbieters verlinken,
  - in §10 oder eigener Sektion erwähnen,
  - prüfen, ob heyspeak DSGVO-konform ist (Sitz? Server-Standort? DPA?).
- **Risiko:** **mittel**, weil schwer kontrollierbar, was Nutzer eingeben.

### 5.6 Abgeordnetenwatch / Bundeswahlleiterin

- Nur statische Daten, kein Outbound-Call. **Kein Drittlandtransfer.** ✅
- Politikerdaten sind **öffentliche Mandatsträger-Daten** (Art. 6 (1) f berechtigtes Interesse), Lizenz CC0.

---

## 6. Perspektive: Privacy-Engineer (Privacy-by-Design)

### 6.1 Was gut ist

- **Stateless by default**: keine DB, kein Account, kein Login. Reduziert die Angriffsfläche drastisch.
- **`after(async () => sendLetterEmail(…))`** in `submitWizard.ts:141` — der Brief wird per Fire-and-Forget verschickt und **nicht** in der HTTP-Response zurückgegeben (Kommentar im Code: _"letter field removed — sent by email only (D-03, PRIV-01)"_). Verhindert versehentliches Caching durch Vercel/Browser.
- **Zwei-Stufen-Moderation** (Input + Output) reduziert den Datentransfer an Mistral nicht, aber schützt vor Output-PII-Leakage.
- **Server-seitige Re-Derivation** der Politiker-Liste in `selectPolitician.ts:83` — verhindert, dass ein manipulierter Client-Request den Brief an eine fremde Adresse umleitet. Sehr ordentlich.
- **Email-Maskierung in Logs** (`resendLetter.ts:17`) — explizit `"***"`.

### 6.2 Was noch fehlt

1. **In-Browser-Datenminimierung**: aktuell wird die Form bei Wizard-Reload aus dem `?text=`-Param wieder befüllt (`buildEmailHtml.ts:54` zeigt die Outbound-Seite). Sicherstellen, dass im _Eingabe_-Wizard nichts versehentlich in `sessionStorage`/`localStorage` landet (kurz checken — der WizardShell-Kommentar legt nahe, dass das bewusst nicht passiert).
2. **Server-seitiges Redacting im Fallback-Log** (`generateLetter.ts:191`): **siehe §3.2 — höchste Priorität.**
3. **IP-Hashing im Rate-Limit-Bucket**: siehe §3.3.
4. **AVVs aktiv abschließen** mit Mistral, Brevo, Vercel und intern dokumentieren.
5. **DPA-Status-Tabelle** als kleines Markdown unter `.planning/knowledge/` pflegen (Anbieter, DPA-Datum, DPA-Version, Sub-Processors, Server-Region).

### 6.3 Datenkategorien-Klassifikation für ein internes Doc

| Kategorie | Beispiele | Schutzbedarf |
|-----------|-----------|--------------|
| **Pseudonyme Technik-Daten** | IP, User-Agent | normal |
| **Identitätsdaten** | E-Mail | normal |
| **Optionale Identitätsdaten** | Name, Partei, Org | normal–hoch |
| **Anliegen-Freitext** | beliebig, ggf. Art. 9 | **hoch** |
| **Audio** | Stimm-Charakteristik = biometrisches Datum, **Art. 9 (1) DSGVO**! | **sehr hoch** |
| **Generierter Brief** | enthält alles oben drin | **hoch** |

→ Insbesondere **Audio** ist ein _biometrisches_ Datum. Solange du es **nicht** zur Identifikation verwendest (du tust es nicht), gilt der erhöhte Schutz von Art. 9 **nicht zwingend** (siehe ErwGr 51) — aber **die Tatsache der Verarbeitung von Stimmaufnahmen sollte in der Datenschutzerklärung explizit Art. 9 ansprechen** und festhalten, dass keine biometrische Identifizierung stattfindet.

---

## 7. Perspektive: Rechtsanwalt / IT-Recht

### 7.1 Impressum (DDG § 5 — vormals TMG § 5)

`impressum/page.tsx` zeigt:
- **§5 TMG** als Überschrift → **veraltet**. Seit 14.05.2024 ist es **§ 5 Digitale-Dienste-Gesetz (DDG)** statt TMG.
- **§ 55 Abs. 2 RStV** → **veraltet**. Seit 07.11.2020 ist es **§ 18 Abs. 2 Medienstaatsvertrag (MStV)** statt RStV.

→ **Fix:**
```diff
- Angaben gemäß § 5 TMG
+ Angaben gemäß § 5 DDG

- Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
+ Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
```

Inhaltlich ist das Impressum sonst sauber: Name, Anschrift, Kontakt-E-Mail vorhanden. **Telefonnummer ist nicht zwingend**, wenn alternative elektronische Kontaktmöglichkeit (E-Mail) gegeben ist und die unmittelbare Kommunikation ermöglicht — was bei einer E-Mail-Adresse mit aktivem Posteingang gegeben ist (EuGH C-298/07).

### 7.2 KI-Verordnung (AI Act)

- Geltung in Stufen ab 02.02.2025, vollständig anwendbar 02.08.2026.
- Brief nach Berlin ist ein **GenAI-System mit eingeschränktem Risiko** (Transparenz-Pflicht nach Art. 50 AI Act).
- **Pflicht:** Nutzer:innen müssen erkennen können, dass sie mit/von einer KI interagieren bzw. dass der Output KI-generiert ist.
- **Status:** §13 der Datenschutzerklärung adressiert das vorbildlich (Disclaimer "KI kann Fehler machen", Bitte um Prüfung) → **erfüllt** den Geist von Art. 50 AI Act bereits.
- Empfehlung: Im Wizard direkt vor dem Generieren (Step 2 / Step 3) zusätzlich einen kurzen "Wird durch KI erzeugt"-Hinweis platzieren — viele User lesen die Datenschutzerklärung nicht.

### 7.3 § 7 UWG / Werbung per E-Mail

Die Brief-E-Mail an den Bürger ist **angeforderte Servicekommunikation** (Bürger hat aktiv das Generieren angestoßen und seine E-Mail-Adresse zur Briefzustellung angegeben). **Kein UWG-Werbe-Problem.** Die "Empfehlen-Sie-uns-weiter"-Block in der Mail wäre theoretisch Werbung — ist aber durch die Vertragserfüllung gedeckt, solange sie nicht überwiegt. Aktuell ist die Mail sehr serviceorientiert. ✅

### 7.4 § 4 NetzDG / Plattformverantwortung

Brief nach Berlin ist **kein soziales Netzwerk** im Sinne des NetzDG (kein Posten/Teilen zwischen Nutzern). NetzDG-Pflichten greifen nicht.

### 7.5 Verbraucherinformation (Art. 246a EGBGB)

Sobald das Tool _entgeltlich_ wird oder Spenden annimmt, greifen Verbraucherinformationspflichten. **Aktuell für v1 nicht einschlägig** (kostenlos, kein Vertrag im klassischen Sinn).

### 7.6 Geistiges Eigentum / Urheberrecht am Brief

- KI-generierte Texte ohne ausreichende menschliche Schöpfungshöhe sind **nicht urheberrechtlich geschützt** (BGH-Linie + EU-DSM-Richtlinie).
- Der Bürger nimmt den Entwurf, schreibt ihn händisch ab → seine Handlung kann eigene Schöpfungshöhe erzeugen.
- **Für uns als Plattformbetreiber relevant:** Wir _nutzen_ den KI-Output für den Bürger, behalten keine Rechte daran. Die ToS/Datenschutz sagen das nicht explizit — das ist OK, aber für klare Verhältnisse könnten wir hinzufügen: _"Du behältst alle Rechte am Brief-Entwurf."_

### 7.7 Aufsichtsbehörde

Wohnsitz Duisburg → zuständig ist die **Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LfDI NRW)**, Kavalleriestraße 2–4, 40213 Düsseldorf. **Sollte in §11 der Datenschutzerklärung benannt werden.**

---

## 8. Konsolidierte Findings-Liste (priorisiert)

### 🔴 HIGH — vor Public-Launch zu fixen

| # | Befund | Datei | Aufwand |
|---|--------|-------|---------|
| H1 | Datenschutzerklärung §6 und §9 erwähnen OpenAI, Code nutzt Mistral Moderation. Aktive Falschangabe → Verletzung Art. 13. | `web/src/app/datenschutz/page.tsx:131, 191–213` | 15 min |
| H2 | `issueTextPreview` = erste 120 Zeichen des Anliegens landen in Vercel-Logs (Fallback-Fall). PII (potenziell Art.9) im Log. | `web/src/lib/generation/generateLetter.ts:191` | 5 min |
| H3 | `created-letters/*.eml` mit realen E-Mail-Headern (Brevo Message-IDs, Empfänger-Adressen) liegen im Repo, nicht in `.gitignore`. | `/created-letters/`, `.gitignore` | 10 min |
| H4 | E-Mail lädt Caveat-Font von `fonts.googleapis.com` → Google sieht jeden Mail-Open (IP, UA). Kein Hinweis in Datenschutzerklärung. | `web/src/lib/email/buildEmailHtml.ts:79` | 30 min (Font ersetzen oder SVG) |

### 🟡 MEDIUM — zeitnah, vor öffentlicher Skalierung

| # | Befund | Datei | Aufwand |
|---|--------|-------|---------|
| M1 | Impressum nennt veraltetes TMG / RStV. Sollte DDG / MStV sein. | `web/src/app/impressum/page.tsx:27, 53` | 5 min |
| M2 | Datenschutzerklärung nennt keine Aufsichtsbehörde (LfDI NRW). | `web/src/app/datenschutz/page.tsx:238–245` | 5 min |
| M3 | Datenschutzerklärung erwähnt Art. 21 (Widerspruchsrecht) nicht. | `web/src/app/datenschutz/page.tsx:238–245` | 5 min |
| M4 | Audio-Verarbeitung sollte Art. 9 / biometrische Daten explizit adressieren (auch wenn wir nicht identifizieren). | `web/src/app/datenschutz/page.tsx:135–144` | 10 min |
| M5 | `?text=<bis 1500 Zeichen Anliegen>` im "Neuen Brief schreiben"-Link in der Mail = PII im Klartext-URL. | `web/src/lib/email/buildEmailHtml.ts:50` | 1–2 h (signed token + server lookup) |
| M6 | Brevo-Tracking (Open/Click-Pixel, Link-Rewriting) im Brevo-Account aktivierungs-status verifizieren und _deaktivieren_ für transaktionale Mails. | Brevo-Backend | 10 min |
| M7 | IP-Adresse als Rate-Limit-Key sollte gehasht werden. | `web/src/lib/rateLimit.ts:66` + Aufrufstellen | 30 min |
| M8 | Security-Header (CSP, HSTS, X-Frame, X-CTO, Referrer-Policy, Permissions-Policy) fehlen. | `web/next.config.ts` oder `web/vercel.json` | 1 h |
| M9 | `heyspeak.io` Feedback-Link in E-Mail wird in Datenschutzerklärung nicht erwähnt. | `web/src/app/datenschutz/page.tsx`, `web/src/lib/config.ts:45` | 15 min |
| M10 | AI-Act Art. 50: KI-Hinweis nur in Datenschutzerklärung. Zusätzlich UI-Hinweis im Wizard wäre sauber. | Wizard-Komponenten | 30 min |
| M11 | Verarbeitungsverzeichnis (Art. 30) als internes Doc anlegen. | `.planning/knowledge/dpa-status.md` | 1 h |

### 🟢 LOW / Best-Practice — danach

| # | Befund | Aufwand |
|---|--------|---------|
| L1 | In `submitWizard.ts:62, 75` IP nicht direkt loggen (Rate-Limit-Result reicht). | 5 min |
| L2 | Rate-Limiter zu `@vercel/kv` / Upstash migrieren (Cross-Instance-Schutz). | 2–4 h |
| L3 | Internes "Breach Response"-Verfahren festlegen (Art. 33 / 34): Kontakt, 72h-Fenster, Vorlage. | 1 h |
| L4 | Hinweis in Datenschutzerklärung, dass Nutzer mit Eingabe sensibler Daten (Gesundheit, politische Meinung etc.) konkludent in Verarbeitung nach Art. 9 (2) a einwilligen — plus UI-Hinweis vor Freitext. | 30 min |
| L5 | DPF/SCC-Status pro Anbieter in `.planning/knowledge/dpa-status.md` dokumentieren und mit Datum versehen. | 30 min |
| L6 | `/debug`-Route absichern (zumindest Production-only deaktivieren oder hinter Basic-Auth stellen). Sie ist `robots: noindex`, aber erreichbar mit gültigem Base64-Payload. | 30 min |

---

## 9. Antworten auf deine konkreten Fragen

### 9.1 _"Wie kann ich Vercel in Deutschland / Europa hosten?"_

**Du tust es bereits.** `vercel.json` setzt `regions: ["fra1"]` → alle Serverless-Funktionen laufen in AWS Frankfurt. Was du _nicht_ vermeiden kannst, weil Vercel selbst US-Konzern ist:
- Logs/Support/Admin sitzen primär in den USA → daher der dokumentierte Drittlandtransfer.
- Mitigiert über **EU-US Data Privacy Framework** (Vercel ist gelistet) + **SCCs** im Vercel-DPA.
- Akzeptiere im Vercel-Dashboard den DPA, falls noch nicht geschehen.

Wenn du _formal komplett raus aus US-Konzernen_ willst → Hetzner/IONOS/OVH-Container. Empfehle ich **nicht** für diesen Use-Case (Aufwand zu hoch, Datenschutzgewinn marginal).

### 9.2 _"Nutzen wir nur Mistral?"_

**Ja, für alles AI-bezogene:** Briefgenerierung, Moderation, Voice-Transkription. OpenAI taucht zwar in `.env.example` und in der Datenschutzerklärung auf, wird aber **nicht aufgerufen**. → Datenschutzerklärung an die Realität anpassen (Finding H1).

**Was bedeutet das für Datenschutz?**
- Sehr gut, weil Mistral französisch ist, EU-Server nutzt und im DPA Trainings-Nutzung ausschließt.
- Du brauchst _einen_ aktiven DPA mit Mistral, nicht zwei.
- Drittlandtransfer-Frage entfällt für AI-Komponente komplett.

### 9.3 _"Wie gut ist Brevo?"_

**Sehr gut für unseren Use-Case:**
- Französisches Unternehmen (Brevo SAS), Rechenzentren bei OVH in FR/DE.
- DPA-Standard verfügbar.
- Kein Drittlandtransfer.

**Aber:** Brevo aktiviert per Default _Open-Tracking_ und _Click-Tracking_ über Pixel und URL-Rewriting. Für transaktionale Bürger-Mails ist das **nicht erwünscht**:
- Datenschutzrechtlich heikel (Tracking ohne separate Einwilligung).
- Im Vercel-Code sehe ich keinen Deaktivierungs-Parameter beim `sendTransacEmail`-Call.
- → **Im Brevo-Account auf "Disabled" stellen** für transaktionale Templates, _oder_ pro API-Call die entsprechenden Tracking-Felder ausschalten.

### 9.4 _"Wo wird überhaupt was gespeichert?"_

| Daten | Speicherort | Wer kontrolliert |
|-------|-------------|-------------------|
| **Auf unseren Servern (Vercel)** | Nur Function-Logs, kurzlebig | Wir + Vercel |
| **Im Browser des Nutzers** | Form-State während Session, kein localStorage | Nutzer |
| **Mistral** | API-Logs gemäß Mistral-Retention (laut DPA nicht für Training) | Mistral |
| **Brevo** | E-Mail-Versandprotokoll + Inhalts-Archiv gemäß Brevo-Retention (typ. 30 Tage Live, 6 Monate Archiv) | Brevo |
| **Mail-Postfach des Nutzers** | E-Mail dauerhaft, bis Nutzer löscht | Nutzer + Mail-Provider |
| **Repo `created-letters/`** | Sechs reale E-Mails (an Founder-Adresse) im Git-Tree | **DU — und das ist das einzige Problem** |

### 9.5 _"Muss ich bei verbundenen Drittservices etwas einstellen?"_

**Ja, drei Dinge:**

1. **Mistral AI:** DPA in der Console aktiv akzeptieren (nicht nur ToS).
2. **Brevo:** Open-/Click-Tracking für transaktionale Mails deaktivieren (Settings → Tracking, oder pro Send-Call).
3. **Vercel:** DPA in den Account-Settings akzeptieren, EU-Region (`fra1`) ist bereits gesetzt.

### 9.6 _"Wie gut sind wir bei DSGVO?"_

Auf einer Skala von 1 (Schrott) bis 10 (besser als die meisten Anwaltskanzleien): **~8/10 _vor_ den Fixes**, **9–9,5/10 _nach_ den HIGH-Findings**.

Die _Architektur_ — kein Account, kein Tracking, keine Persistenz — ist genau das, was man sich wünscht. Die offenen Punkte sind Detailarbeit, keine Strukturprobleme.

---

## 10. Roadmap — was wann tun

### Vor Public-Launch (Tag 0–1)
- [ ] H1: Datenschutzerklärung: OpenAI-Sektion entfernen, §6 anpassen
- [ ] H2: `issueTextPreview` durch Hash/Länge ersetzen
- [ ] H3: `created-letters/` aus Repo löschen + `.gitignore`
- [ ] H4: Google-Fonts-Link aus E-Mail entfernen (oder SVG)
- [ ] M1: Impressum auf DDG / MStV aktualisieren
- [ ] M2: LfDI NRW als Aufsichtsbehörde in §11 ergänzen
- [ ] M3: Art. 21 in §11 ergänzen
- [ ] M6: Brevo-Tracking im Account-Backend deaktivieren

### Innerhalb 2 Wochen nach Launch
- [ ] M4: Audio / Art. 9 Klarstellung in Datenschutzerklärung
- [ ] M5: PII aus `?text=`-URL entfernen
- [ ] M7: IP-Hashing im Rate-Limiter
- [ ] M8: Security-Header
- [ ] M9: heyspeak.io in Datenschutzerklärung erwähnen
- [ ] M10: KI-Hinweis im Wizard-UI
- [ ] M11: Verarbeitungsverzeichnis als internes Markdown

### Backlog / nice-to-have
- [ ] L1–L6 wie oben gelistet
- [ ] DPAs mit Mistral, Brevo, Vercel aktiv abschließen und in `.planning/knowledge/dpa-status.md` dokumentieren

---

## 11. Anhang: Code-Pointer Quick-Reference

```
web/src/lib/mistral.ts:3                    Mistral-Client (Letter Gen, Moderation, Voxtral)
web/src/lib/generation/generateLetter.ts:6  Model = mistral-small-latest
web/src/lib/generation/generateLetter.ts:191 ⚠️ issueTextPreview-Log (HIGH)
web/src/lib/moderation/moderateText.ts:9    Mistral classifier (NICHT OpenAI)
web/src/app/api/transcribe/route.ts:54      Voxtral mini transcribe
web/src/lib/email/sendLetterEmail.ts:9      Brevo-Client
web/src/lib/email/sendLetterEmail.ts:50     sendTransacEmail (Tracking-Defaults!)
web/src/lib/email/buildEmailHtml.ts:79      ⚠️ fonts.googleapis.com (HIGH)
web/src/lib/email/buildEmailHtml.ts:50      ⚠️ ?text= mit bis zu 1500 Zeichen (MEDIUM)
web/src/lib/rateLimit.ts:11                 In-Memory Bucket (kein KV, nicht verteilt)
web/src/lib/rateLimit.ts:66                 getClientIp — Klartext-IP
web/src/lib/actions/submitWizard.ts:141     after(()=>sendLetterEmail) — Fire-and-Forget
web/src/app/layout.tsx                      Kein Tracking, kein Analytics ✅
web/src/app/datenschutz/page.tsx:131,191    ⚠️ OpenAI fälschlich erwähnt (HIGH)
web/src/app/impressum/page.tsx:27,53        ⚠️ TMG / RStV statt DDG / MStV (MEDIUM)
web/vercel.json:1                           regions: ["fra1"] ✅
web/.env.example:9                          OPENAI_API_KEY — Legacy, entfernen
web/.env.example:17–19                      Langfuse — inaktiv
created-letters/*.eml                       ⚠️ aus Repo entfernen + .gitignore (HIGH)
```

---

**Bearbeiter:** Claude Code (Opus 4.7), GSD-Audit-Workflow
**Methodik:** Volltextsuche `web/src/**`, manuelle Inspektion aller Server Actions, API-Routes, Lib-Module, Datenschutz/Impressum-Seiten, Vercel-Konfiguration. Vendor-Bewertungen auf Basis der jeweiligen DPAs (Stand 2026-04).
**Kein Rechtsrat im juristischen Sinn** — vor produktivem Launch durch Fachanwalt für IT-Recht abnehmen lassen, insbesondere für Art. 9, Art. 28 DPA-Texte und AI Act Art. 50.
