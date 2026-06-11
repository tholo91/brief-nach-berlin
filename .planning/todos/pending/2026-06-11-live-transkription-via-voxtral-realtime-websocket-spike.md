---
created: 2026-06-11T18:17:41.667Z
title: Live-Transkription via Voxtral Realtime (Spike zuerst, dann bauen)
area: api
files:
  - web/src/app/api/transcribe/route.ts
  - web/src/lib/mistral.ts
  - web/src/components/audio/VoiceRecorder.tsx
  - web/src/components/audio/AudioRecorder.ts
  - web/src/components/wizard/Step2Issue.tsx
---

## Problem

Heute ist die Transkription Batch: ein POST mit der fertigen Audiodatei →
eine JSON-Antwort zurück ([transcribe/route.ts:83](web/src/app/api/transcribe/route.ts),
`mistral.audio.transcriptions.complete`). Der Nutzer spricht, wartet, dann erscheint
der Text am Stück. Gewünscht ist **simultane Live-Transkription**: man spricht und die
Wörter erscheinen direkt im Feld — senkt die Einstiegshürde spürbar.

Mistral bietet das inzwischen an (Voxtral Realtime): WebSocket-Endpoint
`wss://api.mistral.ai/v1/audio/transcriptions/realtime`, Latenz <500ms,
Partial-Transcripts, Deutsch dabei, **gleicher Preis wie Batch: $0,006/min**. Passt zur
Mistral-only-Linie (kein neuer Anbieter). Quelle: https://mistral.ai/news/voxtral-transcribe-2/

Baut auf der Inline-Mic-Komponente aus
[[2026-06-11-mic-button-inline-ins-eingabefeld-batch-beibehalten]] auf (Todo A) — gleiche
UI, nur Transkriptions-Backend wird getauscht.

## Solution

**Architektur-Shift:** weg vom Request/Response, hin zu einer persistenten WebSocket-
Verbindung mit laufendem Anhängen der Partial-Transcripts ans Textfeld.

**Offene Kernfrage → erst SPIKE, dann Entscheidung mit Thomas:**
- Der Browser darf NICHT direkt mit dem `wss`-Endpoint reden — das würde den
  `MISTRAL_API_KEY` offenlegen. Vercel-Serverless hält keine langlebigen WS-Verbindungen.
- Spike klärt: **Unterstützt Mistral Realtime einen ephemeral / kurzlebigen Token**, sodass
  der Server den Token mintet und der Browser direkt verbindet?
  - **Ja** → machbar ohne neue Infra. Vercel-60s-Function-Limit fällt weg (Stream läuft
    Browser ↔ Mistral direkt), Cap wird reine Produktentscheidung.
  - **Nein** → Relay-Server nötig = neue Infra/Dependency → triggert die
    "keine ungefragten Tools"-Regel → Entscheidung mit Thomas vor dem Bau.

**Cap (Produktentscheidung, nicht mehr Plattform-Grenze bei Direkt-Verbindung):**
Wort-Cap ~350 Wörter statt Zeit-Cap. 350 Wörter Input reichen für einen 200-280-Wörter-
Brief; ein harter Zeitschnitt mitten im Satz wäre unschön. Kosten selbst bei voller Länge
vernachlässigbar (~0,20 $ bei 33 Min, typische Session 1-2 Cent).

**DSGVO:** Live-Streaming sendet Audio laufend an Mistral — selber Auftragsverarbeiter wie
heute, daher vermutlich gedeckt; im Spike kurz gegen die bestehende Mistral-Vereinbarung
prüfen.

Reihenfolge: 1) Spike ephemeral-Token-Frage. 2) Ergebnis mit Thomas besprechen.
3) Implementierung (Backend-Stream + Frontend-Anbindung an die Inline-Mic-UI aus Todo A).

Risiko: mittel-hoch (Architektur), abhängig vom Spike-Ergebnis.
