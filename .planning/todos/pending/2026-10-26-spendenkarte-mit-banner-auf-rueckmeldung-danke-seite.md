---
created: 2026-10-26T20:18:26.000Z
title: "Spendenkarte mit Banner auf der /rueckmeldung-Danke-Seite, wenn jemand eine Reaktion bekommen hat"
area: ui
severity: minor
files:
  - web/src/app/(site)/rueckmeldung/RueckmeldungForm.tsx
  - web/src/lib/rueckmeldung/schema.ts
  - web/src/lib/support-content.ts
  - web/public/images/spenden-banner-thomas.jpg
---

## Problem

Der stärkste Moment für eine Spendenbitte ist, wenn jemand meldet, dass die Politikerin oder der Politiker reagiert hat. Die Last-Call-Mail bleibt bewusst ohne Bitte, also ist die Danke-Seite von /rueckmeldung der Ort dafür. Die Spendenbitte steht seit Quick 261026-tca nur noch in der Follow-up-Mail.

## Solution

Im Danke-Zustand von `RueckmeldungForm.tsx` (der `if (submitted)`-Block) eine Spendenkarte zeigen:

1. Banner `/images/spenden-banner-thomas.jpg`, Überschrift und 5-€-Text aus `SUPPORT_EMAIL_COPY.de.followup` wiederverwenden.
2. Button zu `SUPPORT_CONTENT.ctas.donate.href`.
3. Nur anzeigen, wenn `entryChoice` den Wert "yes" hat (Reaktion kam). Bei "no" und "not_sent" keine Bitte.
4. Bauen über /frontend-design, prüfen mit einem Seiten-Test als `*.test.ts` (createElement, `@/lib/mistral` mocken) und Screenshots mobil und Desktop.

Offene Frage: Soll die Karte bei "yes" mit replyChannels "acknowledgement" (nur Eingangsbestätigung) auch erscheinen, oder erst bei einer inhaltlichen Antwort?
