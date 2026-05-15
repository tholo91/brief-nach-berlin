# 001 — Letter on Desk (Ghibli, 1:1)

- **Type:** Image
- **Status:** ready to generate
- **Iteration:** 1
- **Satisfaction:** Not yet generated
- **Target tool:** Midjourney / DALL-E / Nana Banana image mode
- **Used in:** `web/src/components/WhyItWorks.tsx` → `src="/images/letter-on-desk.webp"`
- **Container:** `aspect-square` — generate 1:1, not 16:9

## Style Consistency

This prompt shares visual language with `prompts/cta-background/image/005-reference-image-ghibli-berlin.md`:
- Same Ghibli artist reference (Kazuo Oga)
- Same color palette (cream base, layered greens, honey-gold light)
- Same Berlin Altbau context visible through a window

Both images should feel like they come from the same animated film.

## Prompt

```
A 1:1 square painted scene in Studio Ghibli background art style (Kazuo Oga,
Kiki's Delivery Service, Whisper of the Heart). Quiet, intimate interior moment.
Hand-painted, visible brushstrokes, watercolor and gouache rendering. No people
visible — only their hands or just the desk itself.

SCENE: The wooden desk of a Berlin Bundestagsabgeordneten-Büro, viewed from
slightly above at a gentle 3/4 angle. A single handwritten letter on cream paper
lies open in the center, the handwriting rendered as soft, believable ink strokes
in blue-black — legible as German cursive without spelling out actual words. The
envelope rests beside it, slit open, with a real German stamp and a faint
postmark. A fountain pen, a half-drunk cup of coffee in a simple white cup, a
small stack of folders, reading glasses folded on top. Warm afternoon light falls
across the desk from the left, casting long honey-colored shadows.

BACKGROUND: Through a tall Altbau window with delicate white muntins, a soft
view of classic Berlin Altbau facades — cream and sandstone, ornate balconies,
rooftops with wildflower meadows and a hint of ivy. The Reichstag dome softened
by atmospheric haze in the far distance, almost dreamlike. A linden tree branch
just outside the window, leaves in detailed Ghibli botanical style. The window
is slightly open; a sheer curtain lifts gently.

FOREGROUND DETAILS: A small potted plant on the windowsill. A red ribbon or
paperclip as a single warm accent. Dust motes in the sunbeam.

STYLE: Studio Ghibli interior background — warm, lived-in, crafted. European
bureaucratic interior softened by Japanese animation sensibility. Slight
storybook quality. No photorealism, no 3D-render look, no AI-glossy finish.
Soft feathered edges, no hard borders.

COLOR PALETTE: Dominant warm cream and sandstone (#FAF8F5 base). Rich layered
greens through the window (forest, sage, olive, moss). Honey-gold afternoon
light. Muted red accent (one small object only). Blue-black ink on the letter.
Soft blue-green shadows, never black. Slightly desaturated, warm,
like a beautiful faded postcard.

MOOD: Quiet attention. The letter has been read. Someone listened.

No text legible on the letter, no logos, no UI, no modern tech (no laptop,
no phone). Square aspect ratio 1:1, high resolution.
```

## After Generation

1. Save approved image to `prompts/why-it-works/assets/letter-on-desk.png`
2. Convert to WebP and place at `web/public/images/letter-on-desk.webp`
3. Update status to `approved`
