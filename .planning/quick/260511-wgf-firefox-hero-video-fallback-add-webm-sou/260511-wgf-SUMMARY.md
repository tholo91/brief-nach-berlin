---
id: 260511-wgf
status: complete
date: 2026-05-11
commit: db9524b
---

# Quick Task 260511-wgf — Summary

## What was done

Fixed the Firefox hero-video-fallback issue reported by some landing-page visitors who saw only the poster image instead of the animated background.

### Task 1 — Transcoded MP4 → WebM/VP9

- Added [web/public/hero-bg.webm](web/public/hero-bg.webm), 635 KB, VP9 1280x720 @ 24 fps, no audio (playback is muted anyway).
- ffmpeg flags: `-c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -tile-columns 2 -pix_fmt yuv420p`.
- Source MP4 retained at `web/public/hero-bg.mp4` as fallback for browsers without VP9.

### Task 2 — Updated [web/src/components/Hero.tsx:50-61](web/src/components/Hero.tsx#L50-L61)

- Added `loop` (clip is 8 s — previously froze on last frame).
- Added `preload="auto"` (default `metadata` left the poster visible longer than needed).
- Added `<source src="/hero-bg.webm" type="video/webm" />` **before** the existing MP4 source. Browsers try WebM first.

## Why

Firefox does not ship its own H.264 decoder. On Linux (and some corporate/ESR builds) without OS-level H.264 codecs, the previous MP4-only `<source>` would silently fail to decode, leaving the poster image visible — exactly the "old picture" symptom users reported. VP9 is decoded by Firefox itself on every platform, so adding a WebM source resolves the root cause.

The `loop` and `preload="auto"` are minor quality fixes that ride along: they shorten the time the poster is visible on every browser and prevent the 8-second clip from freezing on its final frame.

## Verification

- `npx tsc --noEmit -p tsconfig.json` — clean
- `npx eslint src/components/Hero.tsx` — clean
- `ffprobe` confirms `codec_name=vp9`, 1280x720 — matches source dimensions
- File size: WebM (635 KB) is smaller than MP4 (1.2 MB)

## Not done / future

- Reduced-motion handling for the video itself (separate concern; currently only the sub-headline rotation honors it).
- No telemetry on video playback success rate. If we want to confirm impact post-deploy, add a one-line `onError`/`onPlay` ping to a simple endpoint — but per project rules, no analytics in v1.

## Commit

`db9524b` — `fix(web): Firefox hero video fallback - add WebM source, loop, preload`
