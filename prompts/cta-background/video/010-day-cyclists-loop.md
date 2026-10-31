# 010 — Day Loop: Cyclists from Both Sides

- **Type:** Video (first and last frame)
- **Status:** done — live as `hero-bg`
- **Input:** `assets/images/hero-day-source.jpg` as first frame and as last frame
- **Target tool:** Google Flow, Frames mode, Gemini Omni 1.1 Flash, 16:9, longest duration offered
- **Purpose:** New day loop that matches the day poster exactly

## How to Use

Same as `video/008`. Generate at natural speed; the website plays it at 0.5. Save it as `assets/videos/hero-day-loop.mp4`.

The first and the last frame show the same picture, so the new cyclists must be out of view at both ends, and the parent with the child stays where they are.

## Prompt

```
Use this image as the first frame and the last frame. Create an endless loop
using this start and end frame.

Static locked-off camera, one continuous shot. No zoom, no pan, no cuts. The
painted look, the architecture and the composition stay exactly the same.

Two new cyclists ride along the cobblestone street at a relaxed natural pace:
- One enters from behind the large tree on the left, rides along the
  cobblestones and leaves at the bottom right corner.
- The other enters at the bottom right corner, rides along the cobblestones and
  leaves behind the large tree on the left.
They pass each other in the middle of the street. Neither of them is visible in
the first two seconds or in the last two seconds.

Everything else stays calm:
- The parent and child on the bicycle at the railing stay in place, pausing to
  look at the river.
- The shopkeeper waters the plants with small movements and ends in the same
  pose as at the start.
- The leaves of the trees rustle lightly in a soft breeze. No leaves fall.
- The water shimmers gently and the wind turbines turn slowly.

Every person and every leaf is back in the exact starting position in the final
frame.

No cars, no extra people, no clouds crossing the sky, no text changes. The small
people stay simple and painted. No dialogue, no music, no sound effects.
```

## Acceptance

- The picture does not shift
- Bicycles have two wheels and keep their shape
- Nothing jumps from the last frame to the first

## Post-production

- Remove the audio track
- Compare first and last frame, add a short crossfade if the seam shows
- `web/public/hero-bg.webm` at most 1 MB, `hero-bg.mp4` at most 1.5 MB, 1280 px wide
- `web/public/hero-bg.webp` from frame 0 of the finished video, at most 200 KB
