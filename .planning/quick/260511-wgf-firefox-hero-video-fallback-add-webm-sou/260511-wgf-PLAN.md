---
id: 260511-wgf
mode: quick
title: Firefox hero video fallback (WebM source + loop + preload)
date: 2026-05-11
---

# Quick Task 260511-wgf — Firefox hero video fallback

## Problem

Some users — particularly on Mozilla Firefox — see the hero `<video>` poster image (`/hero-bg.webp`) instead of the animated background. Root causes ranked by likelihood:

1. **Firefox on Linux (and some Windows ESR/corporate builds) has no bundled H.264 decoder.** The current `<video>` only has an `.mp4` (H.264/AVC) source. Without an OS-level H.264 codec, Firefox silently fails to decode and stays on the poster.
2. Firefox autoplay setting / Resist Fingerprinting / battery saver can block muted autoplay; nothing in our markup helps recovery.
3. Video has no `loop` and no `preload` hint: when autoplay does run, it stops after 8 s (the clip length) and freezes on the last frame; before play it lingers on the poster longer than needed.

## Scope

Single edit to [web/src/components/Hero.tsx](web/src/components/Hero.tsx) plus one new asset.

### Task 1 — Transcode MP4 → WebM/VP9

- Source: `web/public/hero-bg.mp4` (H.264, 1280x720, 24 fps, 8 s, 1.2 MB, has audio track)
- Output: `web/public/hero-bg.webm` (VP9 video, no audio — playback is muted anyway)
- ffmpeg command (good size/quality tradeoff):
  ```
  ffmpeg -i web/public/hero-bg.mp4 -an \
    -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -tile-columns 2 \
    -pix_fmt yuv420p web/public/hero-bg.webm
  ```
- **Verify:** file exists, size is reasonable (<2 MB target), `ffprobe` shows `codec_name=vp9`, dimensions match source.
- **Done when:** `hero-bg.webm` sits alongside `hero-bg.mp4` in `web/public/`.

### Task 2 — Update Hero.tsx video element

Apply three changes to the `<video>` in [web/src/components/Hero.tsx:50-59](web/src/components/Hero.tsx#L50-L59):

1. Add `loop` attribute (so the 8-second clip cycles instead of freezing).
2. Add `preload="auto"` (so the video starts faster; default is `metadata` which delays first paint).
3. Add a WebM source **before** the MP4 source so the browser picks WebM when supported (Firefox-on-Linux without H.264 codecs will then succeed):
   ```tsx
   <source src="/hero-bg.webm" type="video/webm" />
   <source src="/hero-bg.mp4" type="video/mp4" />
   ```

- **Verify:** TypeScript builds (`pnpm typecheck` or `pnpm build` in `web/`).
- **Done when:** Hero.tsx contains both `<source>` elements in WebM-first order, plus `loop` and `preload="auto"` on the `<video>` tag.

## must_haves

- `web/public/hero-bg.webm` exists, VP9-encoded, plays standalone.
- Hero.tsx `<video>` element has `loop`, `preload="auto"`, and a `<source type="video/webm">` ordered before the existing MP4 source.
- No regression: existing autoplay behavior on Chrome/Safari/Edge is preserved (same attributes apply, MP4 fallback still present).

## Out of scope

- Reduced-motion handling for the video itself (separate concern).
- Replacing the poster image.
- Lazy-loading or `<picture>`-style fallback for the poster.
- Analytics on video failure rates.
