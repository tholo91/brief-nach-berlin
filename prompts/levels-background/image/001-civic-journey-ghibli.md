# 001 — Civic Journey: Kommune → Land → Bund → EU

- **Type:** Image
- **Status:** ready to generate
- **Iteration:** 1
- **Target tool:** Google Nano Banana Pro
- **Purpose:** Background illustration for the page that distinguishes the four levels of representation (Kommune, Land, Bund, EU). Sits at the bottom of the page; fade-to-cream handled in CSS, not in the image.

## Prompt

```
A wide 16:9 painted panoramic landscape in Studio Ghibli background art style
(Kazuo Oga), with a gentle comic/storybook exaggeration — a slightly
whimsical, symbolic journey through the four levels of German and European
democracy. Static composition, no motion implied.

COMPOSITION: A meandering cobblestone path winds across the lower third of the
frame, curving playfully — not a straight road. Along the path, four buildings
spaced evenly from left to right, clearly separated by open landscape (rolling
meadows, small groves of trees, the occasional hedge). The buildings do NOT
sit next to each other — each stands alone in its own pocket of countryside,
storybook-style, like illustrations in a children's atlas.

IMPORTANT — SIZE & PERSPECTIVE: All four buildings are rendered at roughly
the same visual size on the canvas. This is NOT a depth-perspective scene
where distant buildings shrink — it's a flat, storybook arrangement, like
icons on a map. The Rathaus is just as prominent as the EU building. Each
sits in its own little landscape patch at a similar distance from the viewer.
Atmospheric haze is minimal and consistent across all four; do not push the
later buildings into the background.

  1. LEFT: A charming small-town German Rathaus — half-timbered or sandstone,
     modest clock tower, flower boxes in the windows, a small fountain in
     front. Intimate, walkable. This is "Kommune" — the municipality.

  2. CENTER-LEFT: A modern German Landtag (state parliament) inspired by
     the NRW Landtag in Düsseldorf — a low-rise contemporary building with
     a distinctive round/circular form, large glass facades, light concrete,
     a flat roof. NOT classical, NOT a dome, NOT a cathedral. Think
     1980s-2000s civic modernism. A small state flag (e.g. the green-white-red
     stripes of North Rhine-Westphalia, or another recognizable German
     Bundesland flag) flies on a slim pole next to the entrance. This is
     "Land".

  3. CENTER-RIGHT: The Reichstag in Berlin with its glass Kuppel clearly
     recognizable, monumental. Two or three small German flags
     (black-red-gold horizontal stripes) fly on slim poles along the roofline
     or in front of the building, just like on the real Reichstag.
     This is "Bund".

  4. RIGHT: The European Parliament in Strasbourg or the Berlaymont in
     Brussels — modern glass and curves, EU-blue accent. A subtle EU flag
     (12 gold stars on blue) flies on a slender pole. This is "EU".

ON THE PATH: Three or four small figures walking, hand-painted Ghibli style,
each at a different point along the journey. The cast is realistic and
diverse:

  - Foreground left, mid-stride toward the Rathaus: a citizen in a warm
    coat carrying a white envelope.
  - Mid-path: a woman politician in a tailored business suit, walking
    purposefully, briefcase in hand.
  - Near the Reichstag: a male politician in a dark suit, a person of
    color, also carrying documents.
  - Optional, near the EU building: one more figure, same scale as the
    others (not shrunk by distance).

  The figures are small enough not to dominate, but rendered with care —
  they bring the scene to life and quietly signal that politics is people.

ALONG THE PATH: One or two classic yellow German Briefkästen (Deutsche Post,
bright postal yellow) — NOT red. Place one near the Rathaus, optionally a
second somewhere mid-path. A wooden bench. Wildflowers between the
cobblestones. A bicycle leaned against the first mailbox. A linden tree on
the left with a Ghibli-detailed leafy crown. The occasional songbird.

SKY: A wide Ghibli sky — warm golden-peach near the horizon transitioning to
gentle cerulean above, with enormous softly painted cumulus clouds. Late
afternoon honey-gold light, long soft shadows across the path.

STYLE: Studio Ghibli background art with a touch of children's-book
storybook exaggeration. Hand-painted, visible brushstrokes. Watercolor
washes for sky and distant buildings. Gouache-like rendering for mid-ground.
Warm, organic, crafted. European civic architecture through a Japanese
animation sensibility — Kiki's Delivery Service or Howl's Moving Castle,
grounded in real German civic buildings.

COLOR PALETTE: Dominant layered greens (forest, sage, olive, moss) in
foreground vegetation and meadows. Warm sandstone and cream buildings. Sky
in peach-gold to cerulean. Bright postal-yellow mailbox accents. A single
soft EU-blue accent in the far distance. Soft blue-green shadows, never
black. Overall slightly desaturated and warm, like a beautiful faded
postcard.

EDGES: No vignette, no fade. Clean rectangular composition with full
illustration to all four edges — the page will handle any fade-out in CSS.
The TOP of the image should naturally feature open sky (which can be
masked-out cleanly later), and the bottom should be grounded with the path
and meadows running to the edge.

BRIGHTNESS: Natural, not pre-dimmed. The page may apply an opacity layer
on top — deliver the image at full vibrancy.

Aspect ratio 16:9, high resolution, no text, no UI elements, no captions,
no labels on buildings.
```

## CSS Fade Note

The page will fade only the TOP edge into the cream background (#FAF8F5),
using something like:

```css
mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
```

That's why the prompt asks for open sky at the top and no built-in vignette.

## After Generation

When happy with the image:
1. Save the approved image to `prompts/levels-background/assets/civic-journey.png`
2. Update this file's status to `approved`
3. Wire into the levels page background with the CSS mask above
