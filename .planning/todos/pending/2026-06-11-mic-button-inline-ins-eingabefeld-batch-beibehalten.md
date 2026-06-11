---
created: 2026-06-11T18:17:41.667Z
title: Mic-Button inline ins Eingabefeld (Step2Issue), Batch beibehalten
area: ui
files:
  - web/src/components/audio/VoiceRecorder.tsx
  - web/src/components/wizard/Step2Issue.tsx
  - web/src/components/audio/AudioRecorder.ts
---

## Problem

Die Sprachaufnahme sitzt heute als separater Full-Width-Button UNTER dem Textfeld
([VoiceRecorder.tsx](web/src/components/audio/VoiceRecorder.tsx)) plus ein
"oder tipp deine Stichpunkte"-Divider dazwischen ([Step2Issue.tsx:216](web/src/components/wizard/Step2Issue.tsx)).
Das wird laut Thomas selten genutzt und ist als eigener Block eine Hürde. Außerdem
ist die Aufnahme aktuell **One-Shot**: nach einer Transkription bleibt der Recorder
permanent im "done"-Zustand (`uiState === "done"`, VoiceRecorder.tsx:132) und das Feld
blendet ihn komplett aus (`voiceDone`, Step2Issue.tsx:208) — man kann also nur einmal
diktieren.

Vorbild für die Ziel-UX: Inline-Mic-Icon oben rechts IM Textfeld (wie die Cursor/Claude-
Extension; Screenshot lag auf Thomas' Desktop, `inline_transcript.png`).

Dies ist die baufertige Vorarbeit für den größeren Landing-Wizard-Merge
[[2026-06-02-v2-landing-wizard-merge-with-voice-input-field]] — die dort skizzierte
"Mic-Icon am rechten Rand des Eingabefelds"-Komponente entsteht hier und wird dort
wiederverwendet.

## Solution

Batch-Transkription bleibt unverändert (POST `/api/transcribe` →
`mistral.audio.transcriptions.complete`). KEIN Streaming — das ist Todo B
(Live-Transkription via Voxtral Realtime, separater Spike).

Konkrete Änderungen:
- **Mic ins Feld holen:** Mikrofon-Icon dezent oben rechts im `<textarea>`-Container.
  Separater Record-Button-Block UND der "oder tipp deine Stichpunkte"-Divider raus.
- **Wiederholbar:** "done"-Endzustand entfernen — nach einer Aufnahme zurück auf "idle",
  damit mehrfach diktiert werden kann; transkribierter Text wird wie heute ans Feld
  angehängt (`handleTranscription`, Step2Issue.tsx:184).
- **Auffälliger bei leerem Feld (für weniger tech-affine Tester):** solange kein Text drin
  ist, Mic prominenter (waldgrün gefüllter Kreis + kleines Label "oder diktieren"). Sobald
  Text vorhanden, dezentes Outline-Icon oben rechts.
- **Recording-Status klar zeigen:** Mic wird rot + sanfter Puls, Live-Pegel-Balken über das
  bereits vorhandene `getAnalyserNode()` ([AudioRecorder.ts:152](web/src/components/audio/AudioRecorder.ts)),
  laufender Timer; Tap aufs Mic = Stop. Placeholder wechselt schon heute auf
  "Sprich jetzt, dein Text erscheint hier..." (Step2Issue.tsx:158).
- **Cap bleibt:** 3-Min-Aufnahme-Auto-Stop client-seitig (`MAX_RECORDING_DURATION_MS`,
  AudioRecorder.ts:11); das Vercel-60s-Limit greift nur auf dem Batch-POST.

Bau über `/frontend-design` bzw. `/taste` (Frontend-Konvention), danach lokal über
Dev-Server testen.

Status: baufertig, kann sofort umgesetzt werden.
