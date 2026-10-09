# 001 — Gruppe im Gespräch mit einer Abgeordneten vor dem Reichstag

- **Type:** Image
- **Status:** ready to generate
- **Iteration:** 1
- **Target tool:** Google Nano Banana Pro (or Midjourney v6 / Flux)
- **Aspect ratio:** 16:9 landscape
- **Purpose:** Hero image for `/bundestag-besuch-kostenlos`. Shows what the page is about: ordinary people from a constituency standing in front of the Reichstag, talking with their member of parliament on eye level. Warm and welcoming, not official or staged.

## Prompt

```
A wide 16:9 painted illustration in Studio Ghibli background art style
(Kazuo Oga): hand-painted, visible brush strokes, watercolor for sky and
distance, gouache for the middle ground. Warm, hopeful, never cute or kitschy.

SCENE: Late afternoon in front of the Reichstag in Berlin. On the wide
paved forecourt on the left side of the canvas, a small, mixed group of
about eight everyday people stands in a loose half circle, talking with
one woman in a plain dark blazer who is the member of parliament. She
stands slightly turned toward the group, one hand lifted mid-gesture,
listening and answering. She is a fictional person, middle-aged, friendly,
no recognizable real politician. No name badge, no party symbol.

THE GROUP: Clearly different people, painted small and friendly: a
grandmother with a cane and a woolen scarf, a teenager in a bright
rain jacket with a backpack, a father with a toddler on his shoulders, a
woman in a wheelchair at the front of the circle, a man in work trousers
and a cap, a student with a tote bag. A few of them are smiling, one is
mid-question with a raised hand. Nobody looks at a phone. Nobody holds a
camera. Body language open, relaxed, curious. Eye level between all
of them.

THE REICHSTAG: Fills the right half of the background, clearly
recognizable with its sandstone facade, columns and glass dome catching
warm honey-gold light. Slightly softened by atmospheric haze so the people
stay the focus. Two or three small German flags (black-red-gold horizontal
stripes) on slim poles.

THE SOLARPUNK HINT (keep it minimal): Only a whisper of the idealized green
Berlin. A few young linden trees with fresh leaves along the forecourt,
ivy on a low wall, one parked bicycle, a thin line of solar panels on a
roof far in the background. No wind turbines, no towering green
skyscrapers, no futuristic elements.

LIGHT AND COLOR: Dominant staggered greens (forest green #2D6A4F, sage,
olive, moss) in the trees and grass. Cream #FAF8F5 and sandstone for the
building and paper. Honey-golden light, not orange. Blue-green shadows,
never black. A single muted accent of airmail red (#C1121F) or airmail
blue (#1D3557), for example the jacket of the teenager or a scarf. Sky:
watercolor cerulean fading to peach near the horizon, with large softly
painted cumulus clouds.

COMPOSITION: Group and MP in the left-center third at eye level, Reichstag
rising behind and to the right, generous sky above. Leave calm space in the
upper left for the page headline. Depth: foreground paving stones, middle
ground people, background building and trees.

EXCLUSIONS: No text, no letters, no signs with readable writing, no UI.
No recognizable politicians. No party colors or party logos. No laptops, no
phones, no cameras. No stock-photo look, no AI glow, no glossy 3D.
```

## Composition notes

- The wheelchair user stands in the front of the circle, not at the edge, so inclusion reads as normal, not as a gesture.
- Faces stay small and soft, so the image works for every constituency and no one is identifiable.
- If the MP reads as too formal, ask for "casual open blazer, no tie, no stiff pose".
- Reject variants where the group looks like a tour group following a guide. The point is conversation, not a guided walk.

## Layout (page hero)

Used as the full-width hero image on `/bundestag-besuch-kostenlos`, rounded corners, text sits below on cream. Fade into cream at the bottom edge is done in CSS.

## After Generation

When happy with the image:
1. Export at 1600px wide as WebP (~150-200 KB target).
2. Save to `web/public/images/img-bundestag-besuch.webp`.
3. The page picks the file up automatically, the placeholder disappears.
4. Update this file's status to `approved`.
