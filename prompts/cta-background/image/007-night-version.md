# 007 — Night Version of the Reference Image

- **Type:** Image (repaint of an existing image)
- **Status:** done
- **Input:** `assets/images/Google Gemini Generated Image.png` (frame 0 of the current hero video, not the current poster)
- **Target tool:** Google Flow, image model, 16:9, highest resolution
- **Purpose:** Same composition as the day image at night, lit windows in the Reichstag. Base for `video/008`.

## Prompt

```
Repaint this exact illustration as a calm night scene. Keep the composition,
camera position, every building, tree, river bend, bench, post box and bicycle
in exactly the same place and at the same scale. Change only the time of day
and the light.

Time: around 11 pm, clear deep blue-green night sky with a few soft stars and
one thin band of hazy cloud. Shadows are deep blue-green, never black. Keep the
hand-painted animated film background look: visible brush strokes, watercolour
sky, gouache midground, same paper grain as the original.

Light: most windows are dark. On the Reichstag, the glass dome glows softly
from within in honey gold, and five to seven scattered windows in the facade
are lit, warm honey gold, clearly readable against the dark sandstone. The
Fernsehturm has only a faint light at its sphere. In the buildings on the
right, only three or four windows are lit. The street lamp throws one warm pool
of light on the cobblestones. The river mirrors these lights in soft, long
reflections. The wind turbines are quiet dark silhouettes.

Edges: remove the cream paper border. The painted scene runs to all four edges
and falls off into deep night green at the borders.

Remove all readable writing: shop signs and the label on the post box become
plain shapes. No logos, no watermark, no glow halos, no glossy 3D look.
```

## Acceptance

- Reichstag sits in the same spot as in the day image
- Lights in the Reichstag are visible in a small preview
- No cream border, no readable writing, no Gemini sparkle

Save the chosen image as `assets/images/hero-night-source.jpg`.
