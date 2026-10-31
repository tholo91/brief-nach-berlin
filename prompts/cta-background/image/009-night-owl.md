# 009 — Night Owl with Letter

- **Type:** Image (cut-out element)
- **Status:** done — live as `web/public/images/img-eule-nacht.webp`
- **Input:** the chosen night image `assets/images/hero-night-source.jpg` as style reference
- **Target tool:** Google Flow, image model, 1:1, highest resolution, 3 to 4 variants
- **Purpose:** Replaces the envelope icon in the dark hero and flies in from the left with the same CSS animation. No video needed.

## Prompt

```
A single small owl in full flight, seen from the side, flying from left to
right, head and body facing right. Both wings are spread wide in a clear,
readable silhouette. In its beak the owl carries one small airmail envelope
with a red and blue striped edge.

Paint it in the same hand-painted animated film background style as the
reference image: visible brush strokes, gouache and watercolour, soft edges.

The owl is a tawny owl with warm brown and honey feathers and a soft moonlit
rim of light along the top of its wings. The envelope is slightly darker and
muted, a dusky moonlit cream rather than bright white, and its stripes are
dimmed as well.

The owl fills about 75 percent of the square and is centred, with clear space
on all sides. Nothing is cut off at the edges.

Background: one flat, uniform, solid deep green (#0F6B55) from edge to edge.
No gradient, no scenery, no moon, no clouds, no shadow on the background.

No text, no readable writing on the envelope, no logos, no watermark, no glow
halo, no glossy 3D look, no second bird.
```

## Acceptance

- Clear silhouette at 150 px: owl, wings and envelope are recognisable
- Flies to the right, envelope is held in the beak
- Background is one flat colour and nothing touches the edge

Save the chosen image as `assets/images/hero-night-owl.png`.

## Post-production

- Cut out the owl from the edges inwards, so dark feathers stay intact
- `web/public/images/img-eule-nacht.webp`, 480 x 480 px, transparent, at most 30 KB
