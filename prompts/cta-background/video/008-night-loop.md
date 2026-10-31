# 008 — Night Loop: Lights in the Reichstag

- **Type:** Video (first and last frame)
- **Status:** done — live as `hero-night`
- **Input:** `assets/images/hero-night-source.jpg` as first frame and as last frame
- **Target tool:** Google Flow, Frames mode, Gemini Omni 1.1 Flash, 16:9, longest duration offered
- **Purpose:** Seamless night loop for the dark hero

## How to Use

1. Flow: Video Frames, add the same image as start frame and end frame
2. Test in 360p first (about a third of the cost)
3. Render the best result in 1080p
4. Save it as `assets/videos/hero-night-loop.mp4`

Generate at natural speed. The website plays every hero video at 0.5.

## Prompt

```
Use this image as the first frame and the last frame. Create an endless loop
using this start and end frame.

Static locked-off camera, one continuous shot. No zoom, no pan, no cuts. The
painted look, the architecture and the composition stay exactly the same.

Only these things move, at a calm natural speed:
- A few dark windows in the Reichstag facade and in the buildings on the right
  turn on, stay lit for a moment, then turn off again.
- One lit window turns off and comes back on.
- The golden glow in the dome breathes very slightly.
- The leaves of the trees rustle lightly in a soft breeze. No leaves fall.
- The reflections on the river shimmer gently.
- A few stars twinkle faintly.

Every window and every leaf is back in its exact starting state in the final
frame.

No people, no cars, no birds, no boats moving, no clouds crossing the sky, no
flags waving, no text. No dialogue, no music, no sound effects.
```

If the result is restless: drop the stars and the windows on the right, keep Reichstag windows, dome, trees and river.

## Acceptance

- The picture does not shift
- Nothing jumps from the last frame to the first
- Windows stay windows

## Post-production

- Remove the audio track
- Compare first and last frame, add a short crossfade if the seam shows
- `web/public/hero-night.webm` at most 1 MB, `hero-night.mp4` at most 1.5 MB, 1280 px wide; raise the bitrate only if the night sky shows banding
- `web/public/hero-night.webp` from frame 0 of the finished video, at most 200 KB, so the poster and the video match exactly
