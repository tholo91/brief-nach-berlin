# 002 — OG-Bild: Gruppe im Gespräch vor dem Reichstag

- **Type:** Image
- **Status:** approved
- **Iteration:** 1
- **Target tool:** Google Nano Banana Pro (or Midjourney v6 / Flux)
- **Aspect ratio:** 1.91:1 landscape (1200 x 630)
- **Purpose:** Social share image (Open Graph) for `/bundestag-besuch-kostenlos`. Same scene as 001, recomposed so it still reads when LinkedIn, WhatsApp or Mastodon crop it to a small preview card.

## Prompt

```
A wide 1.91:1 painted illustration (1200x630) in Studio Ghibli background
art style (Kazuo Oga): hand-painted, visible brush strokes, watercolor sky,
gouache middle ground. Warm, hopeful, never cute.

SCENE: A small mixed group of ordinary people, painted large enough to read
at thumbnail size, stands in conversation with one woman in a plain dark
blazer, a fictional member of parliament, in front of the Reichstag in
Berlin. The group: a grandmother with a cane, a teenager in a bright rain
jacket, a father with a toddler on his shoulders, a woman in a wheelchair.
The MP is mid-gesture, listening, eye level with everyone. Faces soft and
small, nobody identifiable.

COMPOSITION: Tight crop. Group and MP fill the lower two thirds, centered
slightly left. The Reichstag with its glass dome rises directly behind them
and fills the upper right, in warm honey-gold light. Keep the outer 8% of
the canvas calm (sky, paving, foliage), because platforms crop the edges.
Strong simple silhouettes, readable at 300 px width.

SOLARPUNK HINT (minimal): fresh young linden trees, ivy on a low wall, one
bicycle. Nothing futuristic.

COLOR: Staggered greens (forest green #2D6A4F, sage, olive), cream #FAF8F5
and sandstone, honey-golden light, blue-green shadows, never black. One
muted accent of airmail red (#C1121F) in the teenager's jacket.

EXCLUSIONS: No text, no signs, no UI. No recognizable politicians. No party
colors or logos. No phones, laptops, cameras. No stock-photo look, no AI
glow, no glossy 3D.
```

## After Generation

1. Export at 1200 x 630 as WebP, under 200 KB.
2. Save to `web/public/images/og-bundestag-besuch.webp`.
3. The page sets it as OG and Twitter image automatically once the file exists.
4. Update this file's status to `approved`.
