# 006 — Image-to-Video: Ambient Animation Loop

- **Type:** Video (image-to-video)
- **Status:** next step
- **Input:** Approved reference image from image generation round
- **Satisfaction:** Not yet generated
- **Target tool:** Nana Banana (image-to-video) / Runway Gen-3 / Kling / Pika
- **Purpose:** Bring the approved reference image to life with minimal, subtle animation

## How to Use

1. Upload your approved reference image as the input/reference frame
2. Use the prompt below to describe ONLY what should move
3. Keep generation length at 5-10 seconds (loop it in post if needed)

## Prompt

```
Use the uploaded image as the exact visual base. Do not change the composition,
colors, style, or framing. The camera is completely static — no movement, no
zoom, no pan, no drift.

Bring this still painting gently to life with only these subtle ambient
animations:

1. BIRDS: A small flock of 3-5 birds (tiny dark silhouettes) glides slowly
   across the distant sky from left to right, high up near the clouds. They
   move in a natural, slightly undulating formation. Very small — just specks
   against the sky.

2. BICYCLE: One person on a bicycle moves slowly through the mid-ground
   street, crossing from right to left at a calm, unhurried pace. They are
   small and far away — not a focal point, just ambient life.

3. PEDESTRIANS: Two or three tiny figures walk very slowly in the mid-distance.
   One along the canal/street, another on a sidewalk. No detail — just soft
   silhouettes with a hint of color. Their movement is barely perceptible,
   like watching real people from far away.

4. LEAVES: A few leaves on the large tree in the foreground flutter gently,
   as if touched by the softest breeze. Two or three leaves slowly detach
   and float downward in long, lazy arcs.

5. WATER: The canal/river surface has the subtlest shimmer — tiny shifts
   in reflections, barely noticeable. Like real water seen from a distance.

6. CLOUDS: The clouds drift almost imperceptibly — so slow you only notice
   if you stare for 20+ seconds.

Everything else remains perfectly still — buildings, street, trees (trunks
and branches), all landmarks. The animation should feel like watching a
painting breathe, not like watching a movie. Extremely slow, peaceful,
meditative.

No camera movement. No sound. No text. No new elements added to the scene.
Maintain the exact painted/illustrated art style of the input image.
```

## Tips for Best Results

- **Short clip, then loop:** Generate 5-8 seconds. A perfect 20-second loop is hard for AI. Instead, generate a short clip and use a video editor to crossfade the end into the beginning (1-2 second dissolve) for a seamless loop.
- **Multiple generations:** You may need 3-5 attempts. The first one often adds too much movement or changes the style. Regenerate until it respects the stillness.
- **If too much moves:** Simplify the prompt. Remove pedestrians and bicycle, keep only birds + leaves + water. Add elements back one by one.
- **If style changes:** Add "maintain the exact hand-painted illustration style, do not make it photorealistic or 3D" to the prompt.

## Minimal Fallback Prompt

If the full prompt causes too much hallucination, use this stripped-down version:

```
Animate this image with extremely subtle movement only. Static camera, no
zoom or pan. A few tiny birds fly slowly across the distant sky. Tree leaves
flutter gently in a soft breeze. Water surface shimmers slightly. Everything
else stays perfectly still. Very slow, peaceful, dreamlike. Maintain the
exact art style of the input image. No sound.
```

## Post-Production Notes

After generating:
- [ ] Trim to best loop point
- [ ] Crossfade last 1-2 seconds into first 1-2 seconds for seamless loop
- [ ] Reduce brightness to ~70-80% for use as website background
- [ ] Add soft feathered edges (CSS or video editor) fading to cream (#FAF8F5)
- [ ] Export as MP4 (H.264) and WebM for web compatibility
- [ ] Consider also exporting a poster frame (first frame as .jpg) for loading state
