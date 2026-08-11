---
created: 2026-08-11T00:00:00.000Z
title: "Adresse-löschen-Link in Follow-up-Mails hinterfragen (Liste gibt es nicht)"
area: email
files:
  - web/src/lib/email/buildFollowupHtml.ts:200
  - web/src/lib/email/buildLastcallHtml.ts:239
---

## Problem (Warum)

In beiden Follow-up-Mails steht im Footer der Textlink **„Adresse löschen"** (`buildFollowupHtml.ts:200`, `buildLastcallHtml.ts:239`, plus Text-Varianten). Der Link ist ein `mailto:` mit vorbefülltem Text:

- Subject: „Brief nach Berlin: Adresse löschen"
- Body: *„Hallo Thomas, bitte lösche meine E-Mail-Adresse aus deinen Followup-Listen. Danke!"*

Das erzeugt zwei Probleme:

1. **Fehlende Ein-Klick-Erwartung:** Nutzer:innen klicken den Link im News-Unsubscribe-Mental-Model (ein Klick = fertig). Tatsächlich öffnet er nur einen Mail-Entwurf, den sie selbst abschicken müssen. Wer klickt, ohne zu senden, wundert sich über weitere Mails.
2. **Selbst eingepflanzte „Listen"-Vorstellung:** Der vorbefüllte Body redet von „deinen Followup-Listen" — die gibt es aber nicht. Mails werden je Batch aus CSV/Brevo-Export einmalig versendet und dedupliziert, nirgends als Abo-Liste gehalten (vgl. `DSGVO-AUDIT.md:103`: „Kein Newsletter, keine Liste, kein Marketing. Brevo nur SMTP"). Menschen, die sich melden, schicken exakt den vorbefüllten Text und glauben an eine Liste, die es nicht gibt.

## Open / zu klären

Status: **Unklar, wie wir das lösen wollen.** Offene Frage: Wollen wir den Link/Fußtext anpassen (kein Listen-Suggerieren) oder einen echten Ein-Klick-Unsubscribe bauen? Vor der Umsetzung wird Thomas **auf jeden Fall gefragt** — mit mehreren konkreten Umsetzungsvorschlägen zur Auswahl. Nicht selbstständig umsetzen.

## Zwei Lösungsvorschläge

**Vorschlag A — Ehrlich umformulieren (minimal, kein neuer Endpunkt):**
Footer der Nachfrage-Mail neu formulieren, z. B. „Ich melde mich nur dieses eine Mal. Kein Newsletter." mit [Datenschutz] und „Direkt antworten" statt „Adresse löschen". Kein Mailto mit Listen-Wortlaut. Antworten auf „Bitte löschen"-Mails sind dann wahrheitsgemäß: „Alles gut, du bekommst keine weitere Mail von mir." (Zu prüfen: Die Last-Call-Mail ist aktuell die zweite Nachricht — „nur dieses eine Mal" stimmt nur, wenn die Last-Call-Warteschlange mitgemeint ist.)

**Vorschlag B — Echter Ein-Klick-Unsubscribe (etwas mehr Arbeit):**
`/abmelden?token=…`-Link + „don't contact"-Markierung, sodass z. B. die Last-Call-Mail nie an diese Adresse rausgeht. Entspricht der Ein-Klick-Erwartung und dem DSGVO-Gedanken. Braucht Token-Endpunkt, Speicherung der Abmelde-Adresse und Anbindung an die Send-Skripte (Dedup).

## Randbemerkung

Mittelweg denkbar: Textlink behalten, aber neutral formulieren („Keine weiteren Mails? Schreib mir kurz …") ohne das Wort „Liste(n)" im vorbefüllten Text. Details bei der Klärung mit Thomas entscheiden.

## Trigger

Immer wieder relevant: Menschen schreiben diese Mails. Kein zeitlicher Druck, aber die Folgearbeit pro Antwort ist manuell — ein Grund, den Flow perspektivisch zu entschärfen.
