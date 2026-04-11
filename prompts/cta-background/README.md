# CTA Background Prompts — Brief nach Berlin

Prompts for generating the landing page hero/CTA section background (image + video).

## Workflow

**Image first, then video.**

1. Generate a **reference image** (`image/`) until composition, colors, and style are right
2. Feed the approved image + an image-to-video prompt (`video/`) to the video generator
3. The video prompt only describes **what moves** — visuals are already locked

## Folder Structure

```
prompts/cta-background/
├── image/          ← Still frame / reference image prompts
│   ├── 001-static-header-solarpunk.md        (archived)
│   └── 005-reference-image-ghibli-berlin.md  (done — image generated)
├── video/          ← Looping background video prompts
│   ├── 002-looping-bg-solarpunk.md           (archived)
│   ├── 003-ghibli-berlin-static-camera.md    (archived)
│   ├── 004-ghibli-berlin-final.md            (standalone video prompt)
│   └── 006-image-to-video-ambient-loop.md    (next step)
└── README.md
```

## Current Status

| Step | Status | File |
|------|--------|------|
| Generate reference image | done | `image/005` |
| Animate reference image into looping video | **next** | `video/006` |
| Post-production (brightness, edges, loop) | after video | see notes in `video/006` |
