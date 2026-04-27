# DSGVO-Audit: Brief nach Berlin

**Stand:** 2026-04-27
**Auditor-Perspektiven:** Datenschutzbeauftragter (DSB), IT-Security, Rechtsanwalt (IT-Recht), Produktverantwortlicher
**Geltungsbereich:** Web-App unter brief-nach-berlin.de, Codebasis im Repo

---

## TL;DR (Executive Summary)

**Gesamtbewertung: 7,5 / 10** - solide Grundlage, aber ein paar konkrete Lücken vor Skalierung schließen.

**Was schon gut ist:**
- Keine Datenbank, keine Cookies, keine Tracker, keine Accounts -> minimaler Datenfußabdruck
- Hosting läuft in Frankfurt (Vercel `fra1`)
- Hauptverarbeiter (Mistral, Brevo) sitzen in Frankreich (EU)
- Rate-Limiting, Input-/Output-Moderation, Zod-Validierung, HTML-Escaping vorhanden
- Datenschutzerklärung und Impressum existieren

**Was dringend zu fixen ist (vor mehr Reichweite):**
1. **Datenschutzerklärung beschreibt OpenAI Moderation API - Code nutzt aber ausschließlich Mistral.** Das ist eine falsche Aussage in einem rechtlich relevanten Dokument. Sofort korrigieren.
2. **Langfuse-Variablen in `.env.example`, aber nicht dokumentiert.** Entweder rausnehmen oder dokumentieren.
3. **Vercel = US-Unternehmen.** Auch mit Region `fra1` braucht es eine korrekte Drittland-Begründung. Das ist in der Erklärung erwähnt, aber DPA-Link fehlt.
4. **Keine Sicherheits-Header (CSP, HSTS, X-Frame-Options).** Nicht DSGVO-relevant im engen Sinn, aber Stand der Technik nach Art. 32.
5. **AVV-Links für Mistral und Brevo fehlen** in der Datenschutzerklärung.
6. **Kein Mistral Training-Opt-Out im Code.** Klären, ob im Mistral B2B-Account Standard ausgeschaltet, sonst Header setzen.

**Rechtsrisiko aktuell: niedrig bis mittel.** Du verarbeitest sehr wenig (Email + Anliegentext + PLZ), versendest selbst keine Werbung, hast keine Profilbildung. Die offenen Punkte sind formaler Natur, nicht strukturell.

---

## 1. Vercel in Deutschland/Europa hosten

### Wie es jetzt ist
In [vercel.json](vercel.json) ist `regions: ["fra1"]` gesetzt - alle Serverless Functions und Server Actions laufen in **Frankfurt**. Das gilt auch für die AI-Calls an Mistral und die Email-Calls an Brevo, denn die initiieren von dort aus.

Edge Network / CDN von Vercel ist aber global verteilt. Statische Assets können von einem PoP näher am Nutzer ausgeliefert werden. Das ist DSGVO-rechtlich okay (statische HTML-/JS-Assets sind keine PII), bedeutet aber: ein Edge-Node in den USA sieht IP-Adressen.

### Realität: Vercel ist ein US-Unternehmen
Auch mit `fra1` bleibt Vercel Inc. (Delaware, USA) der Vertragspartner. Das Mutterunternehmen kann theoretisch unter dem CLOUD Act Zugriff erhalten. Deshalb:
- **Du brauchst die Vercel DPA** (Data Processing Addendum). Vercel bietet eine an: https://vercel.com/legal/dpa
- **EU-US Data Privacy Framework (DPF)**: Vercel ist seit 2023 zertifiziert. Seit dem Adequacy Decision der EU-Kommission (Juli 2023) ist Datenübermittlung in die USA an DPF-zertifizierte Unternehmen wieder ohne SCCs zulässig.
- **Aktuelle Erklärung sagt SCCs** ([datenschutz/page.tsx:74-77](src/app/datenschutz/page.tsx#L74-L77)). Korrekt wäre: "DPF + ergänzende SCCs für Restrisiken". Beides nennen.

### Echte EU-Alternativen (falls du wirklich raus willst)
| Option | Aufwand | EU-Souveränität | Kommentar |
|---|---|---|---|
| Vercel `fra1` + DPA + DPF | ✅ aktuell | mittel | Pragmatisch. CLOUD Act bleibt Restrisiko. |
| Hetzner Cloud + Coolify/Dokploy | hoch | hoch | EU-Unternehmen, voll souverän. Du verlierst Vercel-DX. |
| Netlify | mittel | mittel | Auch US-Firma. Kein Gewinn. |
| Cloudflare Pages mit EU-Datalocalisation Suite | mittel | mittel | US-Firma, aber EU-only Datenverarbeitung kaufbar. |
| Self-hosted Next.js auf Hetzner mit Docker | hoch | sehr hoch | Mehr Wartung, aber souverän. |
| Sevalla / Coolify auf eigenem VPS | mittel | hoch | Vercel-ähnliche DX, EU-Hosting. |

**Empfehlung für jetzt:** Bei Vercel bleiben + DPA unterzeichnen + Datenschutzerklärung präzisieren. Erst wechseln, wenn ein konkreter Stakeholder (z.B. Behörde, NGO mit harten Compliance-Anforderungen) das fordert. **Migration = Validation-Zeit-Killer.**

---

## 2. Welches AI-Modell nutzen wir wirklich?

### Code-Realität (nicht Doku-Realität)

**Nur Mistral AI.** Punkt.

| Use Case | Modell | Datei |
|---|---|---|
| Briefgenerierung | `mistral-small-latest` | [generateLetter.ts:136](src/lib/generation/generateLetter.ts#L136) |
| Input-Moderation | `mistral-moderation-latest` | [moderateText.ts:9](src/lib/moderation/moderateText.ts#L9) |
| Output-Moderation | `mistral-moderation-latest` | [moderateText.ts:9](src/lib/moderation/moderateText.ts#L9) |
| Audio-Transkription | `voxtral-mini-transcribe-2507` | [api/transcribe/route.ts:54](src/app/api/transcribe/route.ts#L54) |

`@openai/sdk` ist nicht in `package.json`. `OPENAI_API_KEY` taucht in `.env.example` auf, wird aber nirgendwo gelesen. **Die Datenschutzerklärung beschreibt einen Datenfluss zu OpenAI, der nicht stattfindet.**

### Was bedeutet "nur Mistral" für DSGVO?

**Positiv:**
- Mistral AI ist französisch (Paris). Server in der EU. Kein Drittlandtransfer.
- Mistral hat ein DPA: https://mistral.ai/terms#data-processing-agreement
- Standard-Aussage von Mistral: API-Daten werden **nicht** zum Training genutzt, wenn du über die kostenpflichtige API gehst (im Gegensatz zu Le Chat Free).

**Aber:**
- **Verifiziere das schriftlich für deinen Account.** Die Default-ToS sind nicht immer eindeutig. Workspace-Setting in der Mistral Console prüfen: "Data sharing for training" muss aus sein.
- **Du sendest einen kompletten Brief inkl. Anliegen + optional Name/Partei/NGO an Mistral.** Anliegen können sehr persönlich sein ("Ich bin krank, weil ..." / "Mein Kind wird in der Schule ..."). Das ist potenziell Art. 9 DSGVO (besondere Kategorien personenbezogener Daten - Gesundheit, politische Meinung, Weltanschauung).
- Politische Meinung wird de facto **immer** verarbeitet (das ist der Zweck der App). User willigt durch Eingabe ein, aber das sollte explizit in der Datenschutzerklärung stehen: **"Wir verarbeiten politische Meinungen nach Art. 9 Abs. 2 lit. a DSGVO auf Basis Ihrer ausdrücklichen Einwilligung."**

### Konkrete Aktionen
1. Mistral Console öffnen, Training-Opt-Out verifizieren, Screenshot ablegen.
2. Datenschutzerklärung umschreiben: OpenAI-Sektion raus, Mistral-Moderation rein, Art.-9-Hinweis ergänzen.
3. Mistral DPA als PDF im Repo ablegen oder verlinken.

---

## 3. Brevo - was passiert wirklich?

### Code-Realität
[sendLetterEmail.ts:50](src/lib/email/sendLetterEmail.ts#L50) sendet pro Brief **eine** Transaktionsmail an die User-Email. Inhalt:
- Brieftext (HTML-escaped)
- Politiker-Adresse
- Profil-Link
- Optional: Debug-Payload (base64)
- Social-Share-Links

**Kein Newsletter, keine Liste, kein Marketing.** Brevo ist hier nur SMTP-Versand-Dienstleister.

### DSGVO-Bewertung Brevo

| Punkt | Status |
|---|---|
| Sitz | Frankreich (Sendinblue SAS) - EU |
| DPA verfügbar | Ja: https://www.brevo.com/legal/termsofuse/dpa/ |
| Single Opt-In ausreichend? | **Ja**, weil Transaktionsmail (User fordert sie aktiv an, kein Marketing) |
| Speicherdauer Logs | Standard ~7-30 Tage in Brevo (je nach Plan) |
| Inhalts-Speicherung | Brevo speichert HTML der gesendeten Mail im Log (= dein Brief liegt dort) |

### Wichtig: was Brevo automatisch loggt
Auch wenn **du** keine Liste pflegst, speichert Brevo:
- Empfänger-Email
- Inhalt (für Bounce-Analyse / Logs)
- Open-/Click-Tracking - **standardmäßig aktiv!**

**Action: Open- und Click-Tracking in Brevo deaktivieren.** Sonst bettet Brevo Tracking-Pixel in deine Mail ein -> du brauchst eine Cookie/Consent-Diskussion. Setting findest du in Brevo unter Account -> Settings -> Email -> Tracking.

Im Code könntest du es auch per API erzwingen:
```typescript
await brevo.transactionalEmails.sendTransacEmail({
  // ...
  params: { ... },
  // Falls SDK das exposed - sonst account-weit deaktivieren
});
```

### Action-Liste Brevo
1. Open-/Click-Tracking deaktivieren (in Brevo-Account).
2. Brevo DPA-Link in Datenschutzerklärung einfügen.
3. Speicherfrist der Transaktionsmail-Logs in Brevo prüfen und in Erklärung nennen ("typisch 7-30 Tage").
4. Eigenen `Reply-To` setzen, der nicht thomas_lorenz@posteo.de ist - sonst landet jede Antwort + ggf. Kommunikation in deinem Posteo. Das ist okay, aber du verarbeitest dann Folge-Kommunikation in einem weiteren System.

---

## 4. Datenfluss-Karte (was geht wohin?)

```
User Browser
    |
    | 1. PLZ + Email + Anliegen + (optional) Name/Partei/NGO/Audio
    v
Vercel Frankfurt (fra1)
    |
    +---> [optional] Audio-Blob ---> Mistral Voxtral (FR) ---> Transkription zurück
    |
    +---> Anliegentext ---> Mistral Moderation (FR) ---> ok/blocked
    |
    +---> Anliegen+Politiker+Optionen ---> Mistral Small (FR) ---> Brieftext
    |
    +---> Brieftext ---> Mistral Moderation (FR) ---> ok/blocked
    |
    +---> Email+Brieftext+Politikeradresse ---> Brevo (FR) ---> User-Email
    |
    +---> IP in In-Memory-Map (verworfen bei Redeploy/scale-down)
    |
    `---> Vercel Logs (console.log/error, ohne PII)
```

**Was nirgends gespeichert wird (auf deiner Seite):**
- Anliegentext, Brieftext, Politikerwahl, PLZ, Email -> **kein DB-Write**
- Audio-Blob -> nach Transkription verworfen

**Was bei Dritten gespeichert wird:**
- Brevo: Mail-Log mit Brieftext (Tage)
- Mistral: API-Logs (laut DPA: Inferenz-Daten 30 Tage für Abuse-Detection, danach gelöscht; Training off)
- Vercel: Request-Logs mit IP (Standard 30 Tage)

---

## 5. Audit nach DSGVO-Pflichten (Artikel-Check)

| Art. | Anforderung | Status | Was fehlt |
|---|---|---|---|
| 5 | Datenminimierung | ✅ | - |
| 5 | Speicherbegrenzung | ✅ keine eigene Speicherung | Brevo/Mistral/Vercel-Fristen nennen |
| 6 | Rechtsgrundlage | ⚠️ | Explizit nennen (Art. 6(1)(b) Vertragserfüllung + Art. 9(2)(a) Einwilligung politische Meinung) |
| 7 | Einwilligung | ⚠️ | Aktuell implizit - Checkbox bei Step1 mit "Ich willige ein, dass mein Anliegen zur KI-gestützten Briefgenerierung an Mistral (FR) übermittelt wird" wäre sauberer |
| 9 | Besondere Kategorien | ❌ | **Nirgends erwähnt, dass politische Meinung verarbeitet wird** |
| 13 | Informationspflichten | ⚠️ | Großteils erfüllt, aber Empfänger-Listen, Speicherfristen unvollständig |
| 15-22 | Betroffenenrechte | ⚠️ | In Erklärung erwähnt, aber kein Self-Service. Email an thomas_lorenz@posteo.de reicht für Größe. |
| 25 | Privacy by Design | ✅ | Vorbildlich (keine DB, keine Cookies) |
| 28 | AV-Verträge | ⚠️ | Mit Mistral, Brevo, Vercel: vorhanden? Unterzeichnet? Im Repo abgelegt? |
| 30 | Verarbeitungsverzeichnis | ❌ | Existiert vermutlich nicht. Pflicht auch für Einzelpersonen, wenn regelmäßig PII verarbeitet wird |
| 32 | Stand der Technik (Sicherheit) | ⚠️ | CSP/HSTS/X-Frame-Options fehlen in [next.config.ts](next.config.ts), TLS via Vercel okay |
| 33 | Meldepflicht bei Vorfällen | ⚠️ | Kein dokumentierter Prozess - schreibe einen 1-Pager "Was tue ich bei Datenpanne" |
| 35 | DSFA (Datenschutz-Folgenabschätzung) | ❓ | Wegen automatisierter Entscheidung + politischer Meinung **vermutlich erforderlich** ab gewisser Skalierung. Aktuell vertretbar wegzulassen, weil keine Speicherung & User initiiert jeden Vorgang. |

---

## 6. Sicherheits-Audit (Art. 32 DSGVO - Stand der Technik)

### Was fehlt im Code
[next.config.ts](next.config.ts) ist leer. Das heißt **keine Security Headers**:

```typescript
// EMPFOHLEN für next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        // CSP ist mehr Arbeit - separat ausrollen
      ],
    }];
  },
};
```

`microphone=(self)` lassen, weil VoiceRecorder das braucht.

### Weitere Punkte
- ✅ TLS: Vercel macht das
- ✅ Rate-Limiting: vorhanden
- ✅ Input-Validierung: Zod
- ✅ Output-Escaping: `escapeHtml()` in [buildEmailHtml.ts](src/lib/email/buildEmailHtml.ts)
- ⚠️ Secrets-Management: API-Keys in Vercel Env Vars - okay, aber prüfe, dass sie nicht in Logs landen
- ❌ Keine Monitoring-Alerts (Sentry o.ä.) - bei Sicherheitsvorfall merkst du es spät. Akzeptabel im Frühstadium.

---

## 7. Cookie-Banner: brauchst du einen?

**Aktuell: Nein.** Der Code setzt keine Cookies, lädt keine Tracker. TTDSG §25 verlangt Consent nur für nicht-essenzielle Speicherzugriffe. Du hast keine.

**Aufpassen, wenn du:**
- Brevo Open/Click-Tracking aktiv lässt (Pixel = "Speicherzugriff" diskutabel, aber außerhalb deiner Domain)
- Vercel Analytics aktivierst (das wäre Consent-pflichtig)
- Plausible/Umami aktivierst - cookieless, aber EDPB sagt: trotzdem Consent für IP-Verarbeitung; viele Datenschützer akzeptieren Plausible/Umami ohne Consent unter Art. 6(1)(f). Grauzone. Empfehlung: Plausible self-hosted in EU, kein Banner.

---

## 8. Konkrete Aktions-Liste (priorisiert)

### Sofort (vor mehr Reichweite)
1. ☐ [datenschutz/page.tsx](src/app/datenschutz/page.tsx) Zeilen 191-214: OpenAI-Sektion entfernen, durch Mistral-Moderation ersetzen
2. ☐ Datenschutzerklärung: Hinweis Art. 9 DSGVO (politische Meinung) einfügen
3. ☐ Datenschutzerklärung: AVV-Links zu Mistral, Brevo, Vercel hinzufügen
4. ☐ [.env.example](web/.env.example): Langfuse + OpenAI raus, falls nicht geplant
5. ☐ Brevo: Open-/Click-Tracking im Account deaktivieren
6. ☐ Mistral Console: Training-Opt-Out verifizieren

### Diese Woche
7. ☐ [next.config.ts](next.config.ts): Security-Header ergänzen (siehe Block oben)
8. ☐ Vercel DPA digital unterzeichnen (Vercel Dashboard -> Settings -> Legal)
9. ☐ Datenschutzerklärung: Speicherfristen Brevo/Mistral/Vercel präzisieren
10. ☐ Verarbeitungsverzeichnis (1 Seite Markdown im Repo): wer verarbeitet was, wo, wie lange

### Vor 1.000 Nutzern
11. ☐ DSFA leicht (1-2 Seiten) durchführen + dokumentieren
12. ☐ Datenpannen-Notfallplan (1 Seite): wen kontaktieren, welche Aufsichtsbehörde (LDI NRW, da Duisburg)
13. ☐ Rechts-Check durch IT-Anwalt buchen (Pauschale 300-800 EUR für Solo-Projekt typisch)

### Optional / später
14. ☐ Cookie-/Consent-Banner-Lib einplanen, falls Tracking dazukommt
15. ☐ EU-Hosting-Migration nur, wenn konkreter Compliance-Druck

---

## 9. Was ist noch wichtig (rechtlich, jenseits DSGVO)?

### TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz)
- §25 betrifft Cookies/Local Storage. Aktuell unkritisch.

### TMG / DDG (Digitale-Dienste-Gesetz)
- Impressumspflicht ✅ erfüllt
- Anbieterkennzeichnung ✅

### UWG (Unlauterer Wettbewerb)
- Single Opt-In bei Transaktionsmail ist okay. Würdest du Newsletter draus machen -> Double Opt-In Pflicht.

### Urheberrecht / KI-Output
- KI-generierter Brief: Wem gehört das? Aktuell nicht abschließend geklärt in DE-Recht. Pragmatisch: User, weil er der Prompter ist. In der Erklärung kannst du sagen: "Der generierte Brief steht Ihnen zur freien Verwendung zur Verfügung."

### Politik & Meinungsfreiheit
- Du baust ein Werkzeug zur politischen Partizipation. Das ist von Art. 5 GG (Meinungsfreiheit) und Art. 21 GG (Petitionsrecht) gedeckt. Trotzdem: **du übernimmst keine Verantwortung für den Inhalt der Briefe** - das steht hoffentlich in den Nutzungsbedingungen. Falls keine AGB existieren: kurzes "Nutzungshinweise"-Dokument anlegen.

### Möglicher Missbrauch durch User
- Volksverhetzung, Beleidigung von Politikern: deine Moderation (Mistral) fängt einiges, aber nicht alles. Du bist als Diensteanbieter nach DDG nicht verpflichtet, jeden Inhalt zu prüfen, aber bei Kenntnis musst du reagieren. Idee: in `submitWizard.ts` zumindest den Hash des Anliegens loggen (für Forensik bei Beschwerde) - wäre aber ein neuer Speichervorgang. Alternativ: Restrisiko akzeptieren, weil der User den Brief eh selbst handschriftlich versendet. Du bist nicht der Vertriebskanal.

---

## 10. Meine ehrliche Einschätzung

**Du bist deutlich besser aufgestellt als 95% der MVPs.** Die Architektur (keine DB, keine Cookies) ist eine Datenschutz-Goldgrube und solltest du in der Außenkommunikation als Feature herausstellen ("Ihre Daten sehen nur Sie und der Empfänger - wir speichern nichts").

Die offenen Punkte sind formal und in 2-3 Stunden Arbeit erledigbar. Was ich **nicht** machen würde:
- Hosting-Anbieter wechseln (jetzt nicht der Hebel)
- DSFA-Großprojekt aufsetzen (nicht erforderlich bei aktueller Größe)
- Anwaltsgutachten holen (zu teuer für jetzt)

Was ich **sofort** machen würde:
- Die OpenAI-Falschaussage in der Datenschutzerklärung korrigieren - das ist ein konkretes Risiko, falls jemand die Erklärung mit dem Code abgleicht
- Brevo-Tracking abschalten (5 Min, vermeidet Cookie-Banner-Diskussion)
- Mistral Training-Opt-Out screenshot-dokumentieren

Soll ich die Korrekturen an Datenschutzerklärung und [next.config.ts](next.config.ts) direkt umsetzen? Sind 2-3 fokussierte Edits.
