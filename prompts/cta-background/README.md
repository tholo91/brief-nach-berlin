# CTA Background Prompts — Brief-nach-Berlin

Overall image style for all prompts: see `.planning/brand-identity.md`, section 6.4a. Brand name is always written "Brief-nach-Berlin" (with hyphens).

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
│   ├── 005-reference-image-ghibli-berlin.md  (done — image generated)
│   ├── 007-night-version.md                  (done)
│   └── 009-night-owl.md                      (done)
├── video/          ← Looping background video prompts
│   ├── 002-looping-bg-solarpunk.md           (archived)
│   ├── 003-ghibli-berlin-static-camera.md    (archived)
│   ├── 004-ghibli-berlin-final.md            (standalone video prompt)
│   ├── 006-image-to-video-ambient-loop.md    (replaced)
│   ├── 008-night-loop.md                     (done)
│   └── 010-day-cyclists-loop.md              (done — live as hero-bg)
└── README.md
```

## Current Status

| Step | Status | File |
|------|--------|------|
| Day: reference image | done | `image/005` |
| Day: looping video (old) | replaced | `video/006` |
| Night: repaint of the day image | done | `image/007` |
| Night: owl with letter | done | `image/009` |
| Night: looping video | done | `video/008` |
| Day: new loop with cyclists | done | `video/010` |
| Post-production | done | see notes in `video/008` |
