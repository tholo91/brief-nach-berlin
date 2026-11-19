---
quick_id: 261119-qe1
task: 1
status: complete
---

# Task 1 (A2): QR big view with logo and download

- New shared module `web/src/lib/qrCanvas.ts`: `renderQrToCanvas` (canvas + `drawLogo`), `downloadCanvasPng`, `canvasToBlob`, geometry helpers. Logic moved from `CampaignQrDownload.tsx`, no copy.
- `CampaignQrDownload.tsx` now uses the module; behaviour unchanged (fallback logo on render error and on tainted-canvas export).
- `BigQrOverlay.tsx`: SVG replaced by canvas with logo, size `min(80vmin,100%)`; cell pixels 16-40 chosen from viewport x devicePixelRatio (crisp on projector). Button "QR-Code speichern" (filename `brief-nach-berlin-klasse-qr.png`). Focus trap cycles close/save. Logo failure falls back to QR without logo.
- EC level of `lib/qr-code.ts`: Q (format bits 3, version 10-Q). Logo backing = 5.8 % of image area, keeps the campaign ratio; well below 25 %.
- Test: `web/src/__tests__/qrCanvas.test.ts` (3 pass).
- `ClassLinkGenerator.tsx` not touched.
- Verify: `npx tsc --noEmit` clean, eslint clean on 3 files, jest pass.
- Not done: real phone scan and browser check of the overlay.
