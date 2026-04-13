---
phase: 02-core-engine
plan: "02"
subsystem: voice-recording
tags: [audio, voice, transcription, mistral, recordrtc, react]
dependency_graph:
  requires: []
  provides: [VoiceRecorder, AudioRecorder, /api/transcribe]
  affects: [Step2Issue (Plan 04)]
tech_stack:
  added: ["@mistralai/mistralai@2.2.0", "recordrtc@5.6.2", "@types/recordrtc"]
  patterns: [lazy-import-ssr-safe, route-handler-formdata, one-shot-recording]
key_files:
  created:
    - web/src/components/audio/AudioRecorder.ts
    - web/src/components/audio/VoiceRecorder.tsx
    - web/src/app/api/transcribe/route.ts
  modified:
    - web/package.json
    - web/package-lock.json
decisions:
  - "Used mistral.audio.transcriptions.complete() instead of chat.complete() with audio_url — the SDK's TypeScript types for chat.complete do not include audio_url content type; the dedicated transcription endpoint is type-safe and semantically correct"
  - "AudioRecorder.getAnalyserNode() added for future wave animation (visual feedback during recording)"
  - "German error messages in classifyMediaError for consistent UI language"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-13"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 02 Plan 02: Voice Recording Subsystem Summary

One-shot audio recording with Mistral Voxtral transcription — reusable `<VoiceRecorder onTranscription={(text) => ...} />` component backed by a lazy-loaded RecordRTC AudioRecorder class and a Route Handler piping audio blobs to Mistral's dedicated transcription endpoint.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Adapt AudioRecorder + /api/transcribe Route Handler | 53cf29a | AudioRecorder.ts, route.ts, package.json |
| 2 | VoiceRecorder React component | 98326aa | VoiceRecorder.tsx |

## What Was Built

### AudioRecorder.ts
Adapted from surv.ai's `lib/audio/recorder.ts` for one-shot recording:
- Removed chunked upload logic (`onDataAvailable` callback and `timeSlice` configuration)
- Reduced `MAX_RECORDING_DURATION_MS` from 600,000 to 180,000 (3 minutes)
- Kept lazy-loading pattern for RecordRTC (`loadRecordRTC()`) to prevent SSR crash
- Added `getAnalyserNode()` method for future wave animation
- Exports: `AudioRecorder`, `RecorderState`, `RecordingResult`, `RecorderError`, `BrowserContext`, `getBrowserContext`, `classifyMediaError`, `MAX_RECORDING_DURATION_MS`

### /api/transcribe Route Handler
- Accepts `audio` blob via FormData POST (T-02-05: validates presence before processing)
- Uses `mistral.audio.transcriptions.complete()` — the SDK's dedicated transcription endpoint
- German language hint (`language: "de"`) for accuracy
- MISTRAL_API_KEY accessed server-side only (T-02-07)
- Returns `{ text: string }` or structured error responses

### VoiceRecorder.tsx
Full lifecycle React component (`"use client"`) with 5 UI states per UI-SPEC:
- **Idle:** mic SVG (waldgruen color) + "Sprachaufnahme starten"
- **Recording:** animate-pulse red dot + MM:SS elapsed timer + "Aufnahme stoppen"
- **Processing:** animate-spin spinner + "Transkription laeuft..." (button disabled)
- **Done:** "Aufnahme uebernommen" → auto-resets to idle after 2s
- **Error:** "Aufnahme fehlgeschlagen -- bitte erneut versuchen" → auto-resets after 3s
- `aria-label` updates with state for accessibility
- 44px minimum touch target (WCAG)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used dedicated transcription endpoint instead of chat.complete with audio_url**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** The plan's template used `mistral.chat.complete()` with `{ type: "audio_url", audioUrl: dataUri }` content. The Mistral SDK's TypeScript types for `MessageInputContentChunks` only allow `"text" | "thinking"` — `audio_url` type would cause TS error TS2322.
- **Fix:** Used `mistral.audio.transcriptions.complete()` — the SDK's dedicated, type-safe transcription endpoint (`/v1/audio/transcriptions`). Accepts `file: Blob` directly, no base64 conversion needed. Returns `{ text: string }` natively.
- **Files modified:** `web/src/app/api/transcribe/route.ts`
- **Commit:** 53cf29a

## Known Stubs

None. The VoiceRecorder component is fully wired: it records audio, posts to /api/transcribe, and delivers transcription text via the `onTranscription` callback. The API key will need to be set in environment variables before the transcription endpoint works in production.

## Threat Flags

None. All surfaces were in the plan's threat model and mitigations were applied:
- T-02-05: FormData validation implemented (400 on missing audio)
- T-02-06: AudioRecorder max duration enforced (180s); Vercel body limit handles server-side
- T-02-07: MISTRAL_API_KEY server-side only in Route Handler
- T-02-08: Accepted — browser permission model handles mic access

## Self-Check: PASSED

Files exist:
- [x] web/src/components/audio/AudioRecorder.ts
- [x] web/src/components/audio/VoiceRecorder.tsx
- [x] web/src/app/api/transcribe/route.ts

Commits exist:
- [x] 53cf29a — Task 1
- [x] 98326aa — Task 2
