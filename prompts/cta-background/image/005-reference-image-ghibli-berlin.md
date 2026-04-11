# 005 — Reference Image: Ghibli Berlin (for video generation)

- **Type:** Image (reference frame for video prompt 004)
- **Status:** next step
- **Iteration:** 1
- **Satisfaction:** Not yet generated
- **Target tool:** Midjourney / DALL-E / Nana Banana image mode
- **Purpose:** Lock down composition, style, and color before generating the video

## Why Image First?

Video generators burn credits and time. By creating a reference image first:
1. You iterate cheaply on composition, color, and style
2. Once approved, feed it as a reference to the video generator
3. The video prompt only describes what moves — visuals are already locked

## Prompt

```
A wide 16:9 painted landscape of an idealized, green Berlin in Studio Ghibli
background art style (Kazuo Oga). Static composition, no motion implied.

The scene is viewed from a slightly elevated perspective, like sitting on a
second-floor balcony.

FOREGROUND: The crown of a large linden tree fills the bottom-left, leaves
rendered in detailed Ghibli botanical style — multiple greens, visible
individual leaves. A cobblestone street with wildflowers between the stones.
A classic red German Briefkasten (mailbox) near the tree. A wooden bench
with a forgotten book. Warm afternoon shadows on the cobblestones.

MIDDLE GROUND: Classic Berlin Altbau buildings — cream and sandstone facades,
tall windows, ornate weathered balconies. Rooftops covered in wildflower
meadows, small vegetable gardens, solar panels. Vines and ivy climbing
facades. A section of the Spree canal with clear green water. No cars.
Bicycle racks with colorful bikes. Potted plants outside a Späti.

BACKGROUND: The glass dome (Kuppel) of the Reichstag/Bundestag building,
clearly visible but softened by atmospheric haze. The Fernsehturm behind it,
even softer. Two or three modern wind turbines among the rooftops — they
signal this is Berlin as it could be, not as it is. A Ghibli sky: warm
golden-peach at the horizon to gentle cerulean above, with enormous softly
painted cumulus clouds.

STYLE: Studio Ghibli background art. Hand-painted, visible brushstrokes.
Watercolor washes for sky and distance. Gouache-like rendering for mid-ground.
Warm, organic, crafted. European architecture through a Japanese animation
sensibility — like Kiki's Delivery Service or Howl's Moving Castle, but
grounded in real Berlin Altbau.

COLOR PALETTE: Dominant rich layered greens (forest, sage, olive, emerald,
moss). Warm sandstone and cream buildings. Sky in peach-gold to cerulean.
Muted red mailbox accent. Golden afternoon light — honey, not orange.
Soft blue-green shadows, never black. Overall slightly desaturated and warm,
like a beautiful faded postcard.

EDGES: Soft feathered vignette dissolving into warm cream (#FAF8F5) on all
sides, especially left, right, and bottom. No hard borders. Image should
blend seamlessly into a cream website background.

BRIGHTNESS: Slightly dimmed (70-80% opacity feel) — this will be used as a
website background behind text and UI elements.

Aspect ratio 16:9, high resolution, no text, no UI elements.
```

## After Generation

When happy with the image:
1. Save the approved image to `prompts/assets/reference-ghibli-berlin.png`
2. Update this file's status to `approved`
3. Use as reference input when generating video with prompt 004
