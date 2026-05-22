# 001 — Germany with Voices Rising, Letters Flying to the Reichstag

- **Type:** Image
- **Status:** ready to generate
- **Iteration:** 1
- **Target tool:** Google Nano Banana Pro (or Midjourney v6 / Flux)
- **Aspect ratio:** 4:3 landscape (sits next to RatingStat on /stimmen hero)
- **Purpose:** Hero illustration for the /stimmen page, left column. Conveys that voices come from all over Germany and converge on Berlin. The RatingStat (average rating + count) sits to the right of this image.

## Prompt

```
A wide 4:3 painted illustration in Studio Ghibli background art style
(Kazuo Oga), warm and hopeful, with a gentle storybook quality. A
slightly tilted, semi-aerial view of Germany rendered as if looking
down from a low-flying balloon — geographically recognizable (the
rough silhouette of the country, the Baltic and North Sea to the
north, the Alps just hinted at the bottom) but softened into a
Ghibli landscape of rolling green meadows, patchwork fields, small
forests, winding rivers (a hint of the Rhine on the left, the Elbe
center-right), and tiny clustered villages with red and grey rooftops.

COMPOSITION: The country fills most of the canvas. The Baltic and
North Sea at the top edge are a soft watercolor blue. The horizon
sits just above the upper third — a wide Ghibli sky with warm
golden-peach light near the horizon transitioning to cerulean above,
with enormous softly painted cumulus clouds catching late-afternoon
honey-gold light.

THE REICHSTAG: On the right side of the canvas, roughly where Berlin
sits geographically (northeast quadrant, but pulled visually rightward
for prominence), a small but clearly recognizable Reichstag building
with its glass Kuppel catches the warm light. Slightly larger than
strict map-scale would allow — readable at a glance, but still nested
in the landscape, not dominating. Two or three small German flags
(black-red-gold horizontal stripes) on slim poles in front. A faint
warm glow around the Kuppel, like it's the destination.

LETTERS FLYING: One or two white paper letters (envelopes, classic
rectangular shape, sealed) in mid-flight across the sky — captured
in motion, slightly angled, with soft motion lines or a barely-there
trailing wisp of warm air behind them. Their trajectories curve
gently toward the Reichstag from different parts of Germany. One
letter comes from the southwest (Schwarzwald / Stuttgart region),
another from the north (Hamburg region). They are clearly hand-folded
paper, not stylized icons. Soft warm shadow underneath each letter.

VOICES RISING: Across the country, in maybe six to ten places (small
towns, mid-sized cities, scattered rural areas — covering north,
south, west, east, no region forgotten), tiny warm-yellow speech
bubbles or soft golden glow-dots rise gently from the ground, like
fireflies at dusk or whispered words made visible. Each glow is
small, around the size of a fingertip on canvas, not flashy. A few
trail upward in a gentle drift, suggesting they are voices being
spoken and travelling outward. NOT speech bubbles with text — just
soft glowing motes, almost like dandelion seeds or candle-light
specks.

A FEW LETTER-SOURCE HINTS: At the bottom of one or two glowing spots,
the tiniest hint of a hand-painted figure (a postbox, a window with
light, a Briefkasten in postal yellow). Not detailed people — just
the suggestion that real lives are behind the voices.

STYLE: Studio Ghibli background art (Kazuo Oga), hand-painted,
visible brushstrokes. Watercolor washes for sky, sea, and distant
landscape. Gouache-like rendering for the foreground meadows and
the Reichstag. Warm, organic, crafted. Slight storybook
exaggeration — like a beautiful illustrated children's atlas page,
but with grown-up emotional weight.

COLOR PALETTE: Layered greens (forest, sage, olive, moss) across
the country, with patches of warm yellow-gold for ripe fields. Soft
terracotta and grey for village roofs. Watercolor blue for seas and
rivers. Sky in peach-gold to cerulean. Warm-yellow accents for the
voice-glows. White paper for letters. The Reichstag in soft cream
sandstone with the Kuppel catching golden light. Soft blue-green
shadows, never black. Overall slightly desaturated and warm, like
a beautiful faded postcard.

EDGES: Clean rectangular composition, full illustration to all
edges. No vignette, no built-in fade. The page may apply soft
masking in CSS. The bottom edge should be grounded landscape (no
abrupt cutoff), the top edge open sky.

BRIGHTNESS: Natural, not pre-dimmed. Deliver at full vibrancy.

Aspect ratio 4:3, high resolution, no text, no UI elements, no
captions, no labels on cities or regions. No compass rose. No
political borders drawn as lines — borders are implied only by the
coastlines and the Alps silhouette.
```

## Composition Notes

- **Map but not map**: Germany should be recognizable but feel like a Ghibli landscape, not a cartographic illustration. Soft silhouettes, no political borders, no city labels.
- **Reichstag prominence**: Slightly larger than strict scale would allow, on the right where Berlin is. It should read clearly as "the destination" without dominating the frame.
- **Voices, not text**: Soft glowing dots / firefly motes, NOT speech bubbles with words. Lets the viewer project their own voice.
- **Letters in flight**: One or two, not a swarm. Hand-folded paper feel, curved trajectories toward Berlin.
- **Even regional spread**: The voice-glows should appear across north, south, east, west — Brief nach Berlin is not just a Berlin thing.

## Layout Use

This image sits in the **left column** of the /stimmen page hero. The right column shows the `<RatingStat />` component (average rating + total count). On mobile, the image stacks above the stat. Suggested wrapper:

```tsx
<section className="grid md:grid-cols-2 gap-8 items-center">
  <Image
    src="/images/img-stimmen-deutschland.webp"
    alt="Karte von Deutschland mit aufsteigenden Stimmen und Briefen, die zum Reichstag in Berlin fliegen"
    width={1024}
    height={768}
    className="rounded-2xl"
    priority
  />
  <RatingStat stats={stats} showDistribution />
</section>
```

## After Generation

When happy with the image:
1. Export at 1280px wide as WebP (~150-180 KB target, similar to existing hero images).
2. Save to `web/public/images/img-stimmen-deutschland.webp`.
3. Update this file's status to `approved`.
4. Wire into `/stimmen` hero per layout above (separate task — ask Claude to integrate).

## Alternative Image Already in Repo

The existing `web/public/images/img-stimmen-tisch.webp` (Ghibli-style table covered in letters, generated earlier in the visual-direction workflow) is a different concept — intimate close-up of the "Brief-Tisch" rather than the country-wide view. You could:

- **Option A:** Use the new Germany map for the /stimmen hero (this prompt), keep `img-stimmen-tisch.webp` for the "Wo wir herkommen" section as a secondary illustration.
- **Option B:** Use `img-stimmen-tisch.webp` as the hero and drop this prompt.

The country-wide map (this prompt) reads better next to the RatingStat because it adds geographic / movement context that complements the numbers. The table-of-letters image is cozier but more static. Thomas's instinct (country-view) is probably right for the hero slot.
