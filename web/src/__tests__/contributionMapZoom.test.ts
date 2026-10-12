import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  clampViewport,
  clientToMap,
  contributionPointRadius,
  formatMapCounts,
  initialViewport,
  isDoubleTap,
  panBy,
  pinchStep,
  parseViewBox,
  scaledPointRadius,
  shouldDismissSheet,
  viewBoxString,
  viewportWindow,
  wheelZoomFactor,
  zoomAt,
} from "@/lib/letterSignals/mapViewport";
import { GermanyContributionMap } from "@/components/letter-signals/GermanyContributionMap";
import { ContributionMapDialog } from "@/components/letter-signals/ContributionMapDialog";
import { LetterActivityCard } from "@/components/letter-signals/LetterActivityCard";

const bounds = parseViewBox("0 0 180 180");

describe("mapViewport helpers", () => {
  it("parses the viewBox and starts centered at scale 1", () => {
    expect(bounds).toEqual({ x: 0, y: 0, width: 180, height: 180 });
    expect(initialViewport(bounds)).toEqual({ cx: 90, cy: 90, scale: 1 });
  });

  it("computes the visible window fitted to the stage aspect", () => {
    const start = initialViewport(bounds);
    expect(viewportWindow(start, bounds, 1)).toEqual({ x: 0, y: 0, width: 180, height: 180 });
    const tall = viewportWindow(start, bounds, 0.5);
    expect(tall.width).toBe(180);
    expect(tall.height).toBe(360);
    expect(tall.y).toBe(-90);
    const wide = viewportWindow(start, bounds, 2);
    expect(wide.height).toBe(180);
    expect(wide.width).toBe(360);
    expect(viewportWindow({ ...start, scale: 2 }, bounds, 1).width).toBe(90);
  });

  it("clamps scale and center to the Germany bounds", () => {
    const start = initialViewport(bounds);
    expect(clampViewport({ ...start, scale: 10 }, bounds, 1).scale).toBe(MAP_MAX_ZOOM);
    expect(clampViewport({ ...start, scale: 0.5 }, bounds, 1).scale).toBe(MAP_MIN_ZOOM);
    expect(clampViewport({ cx: 170, cy: 90, scale: 2 }, bounds, 1).cx).toBe(135);
    expect(clampViewport({ cx: 10, cy: 90, scale: 2 }, bounds, 1).cx).toBe(45);
  });

  it("zooms around a focal point without moving it on screen", () => {
    const start = { cx: 90, cy: 90, scale: 1.5 };
    const focal = { x: 100, y: 80 };
    const before = viewportWindow(start, bounds, 1);
    const next = zoomAt(start, 1.6, focal, bounds, 1);
    const after = viewportWindow(next, bounds, 1);
    expect((focal.x - after.x) / after.width).toBeCloseTo((focal.x - before.x) / before.width, 6);
    expect((focal.y - after.y) / after.height).toBeCloseTo((focal.y - before.y) / before.height, 6);
    expect(zoomAt({ cx: 90, cy: 90, scale: 5.5 }, 3, focal, bounds, 1).scale).toBe(MAP_MAX_ZOOM);
  });

  it("pans so the content follows the finger and never at scale 1", () => {
    const start = initialViewport(bounds);
    expect(panBy(start, 30, 20, bounds, 1)).toEqual(start);
    const zoomed = { cx: 90, cy: 90, scale: 3 };
    const moved = panBy(zoomed, 10, -5, bounds, 1);
    expect(moved.cx).toBe(80);
    expect(moved.cy).toBe(95);
  });

  it("formats viewBox strings and maps client coordinates", () => {
    expect(viewBoxString({ x: 1.23456, y: 0, width: 90.1, height: 90 })).toBe("1.235 0 90.1 90");
    const rect = { left: 0, top: 0, width: 300, height: 300 };
    expect(clientToMap(150, 150, rect, { x: 0, y: 0, width: 180, height: 180 })).toEqual({ x: 90, y: 90 });
    expect(clientToMap(5, 5, { left: 0, top: 0, width: 0, height: 0 }, { x: 0, y: 0, width: 180, height: 180 })).toEqual({ x: 90, y: 90 });
  });

  it("keeps the point radius formula and shrinks it with zoom", () => {
    expect(contributionPointRadius(1)).toBe(Math.min(2.5, 0.75 + Math.log2(2) * 0.32));
    expect(contributionPointRadius(1_000_000)).toBe(2.5);
    const r = contributionPointRadius(10);
    expect(scaledPointRadius(r, 1)).toBe(r);
    expect(scaledPointRadius(r, 4)).toBeLessThan(r);
    expect(scaledPointRadius(r, 4) * 4).toBeGreaterThan(r);
  });

  it("formats the header counts in German", () => {
    expect(formatMapCounts(0, 0)).toBe("Noch keine Punkte auf der Karte");
    expect(formatMapCounts(1, 1)).toBe("1 Brief aus 1 PLZ-Gebiet");
    expect(formatMapCounts(1234, 56)).toBe("1.234 Briefe aus 56 PLZ-Gebieten");
  });
});

describe("gesture helpers", () => {
  it("computes pinch factor and midpoints", () => {
    const step = pinchStep({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: -50, y: 0 }, { x: 150, y: 0 });
    expect(step.factor).toBe(2);
    expect(step.prevMidpoint).toEqual({ x: 50, y: 0 });
    expect(step.nextMidpoint).toEqual({ x: 50, y: 0 });
    expect(pinchStep({ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 0, y: 0 }, { x: 40, y: 0 }).factor).toBe(1);
  });

  it("detects double taps by time and distance", () => {
    const first = { time: 1000, x: 100, y: 100 };
    expect(isDoubleTap(null, first)).toBe(false);
    expect(isDoubleTap(first, { time: 1200, x: 106, y: 108 })).toBe(true);
    expect(isDoubleTap(first, { time: 1400, x: 100, y: 100 })).toBe(false);
    expect(isDoubleTap(first, { time: 1200, x: 140, y: 100 })).toBe(false);
  });

  it("decides sheet dismissal by distance and velocity", () => {
    expect(shouldDismissSheet(120, 0)).toBe(true);
    expect(shouldDismissSheet(40, 0.8)).toBe(true);
    expect(shouldDismissSheet(40, 0.2)).toBe(false);
    expect(shouldDismissSheet(20, 2)).toBe(false);
  });

  it("maps wheel deltas to a clamped zoom factor", () => {
    expect(wheelZoomFactor(-100, 0, false)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100, 0, false)).toBeLessThan(1);
    expect(wheelZoomFactor(-10, 0, true)).toBeGreaterThan(wheelZoomFactor(-10, 0, false));
    expect(wheelZoomFactor(-100000, 0, true)).toBe(2);
    expect(wheelZoomFactor(100000, 1, false)).toBe(0.5);
  });
});

describe("GermanyContributionMap rendering", () => {
  const points = [
    { x: 40, y: 50, count: 3 },
    { x: 100, y: 120, count: 1 },
  ];

  it("keeps compact and landing output unchanged at zoom 1", () => {
    const compact = renderToStaticMarkup(createElement(GermanyContributionMap, { points, label: "Karte" }));
    expect(compact).toContain('viewBox="0 0 180 180"');
    expect(compact).toContain("max-w-[13rem]");
    expect(compact).toContain(`r="${contributionPointRadius(3)}"`);
    const landing = renderToStaticMarkup(createElement(GermanyContributionMap, { points, label: "Karte", variant: "landing" }));
    expect(landing).toContain("max-w-[18rem]");
  });

  it("renders the expanded variant with custom viewBox and scaled radii", () => {
    const html = renderToStaticMarkup(
      createElement(GermanyContributionMap, {
        points,
        label: "Karte",
        variant: "expanded",
        viewBox: "10 20 45 45",
        zoom: 4,
      }),
    );
    expect(html).toContain('viewBox="10 20 45 45"');
    expect(html).toContain("h-full w-full");
    expect(html).toContain(`r="${scaledPointRadius(contributionPointRadius(3), 4)}"`);
  });
});

describe("ContributionMapDialog rendering", () => {
  const base = {
    onClose: () => undefined,
    points: [
      { x: 40, y: 50, count: 3 },
      { x: 100, y: 120, count: 1 },
    ],
    ownPoint: { x: 40, y: 50 },
    ownVisible: true,
    totalContributions: 3,
    postcodeAreas: 2,
    reducedMotion: false,
  };

  it("renders header, controls, legend and own point while open", () => {
    const html = renderToStaticMarkup(createElement(ContributionMapDialog, { ...base, open: true }));
    expect(html).toContain("3 Briefe aus 2 PLZ-Gebieten");
    for (const label of ["Karte schließen", "Hineinzoomen", "Herauszoomen", "Ansicht zurücksetzen"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
    expect(html).toContain("Dein Anliegen");
    expect(html).toContain("fill-airmail-rot");
  });

  it("renders no circles while closed", () => {
    const html = renderToStaticMarkup(createElement(ContributionMapDialog, { ...base, open: false }));
    expect(html).not.toContain("<circle");
  });
});

describe("LetterActivityCard expand trigger", () => {
  it("renders trigger, badge and a closed dialog when expandable", () => {
    const html = renderToStaticMarkup(createElement(LetterActivityCard, { letterCount: 10, expandable: true }));
    expect(html).toContain('aria-label="Karte vergrößern"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain("cursor-zoom-in");
    expect(html).toContain("Vergrößern");
    expect(html).toContain("<dialog");
  });

  it("stays a plain display without the expandable prop", () => {
    const html = renderToStaticMarkup(createElement(LetterActivityCard, { letterCount: 10 }));
    expect(html).toContain("max-w-[18rem]");
    expect(html).not.toContain("Karte vergrößern");
    expect(html).not.toContain("cursor-zoom-in");
    expect(html).not.toContain("<dialog");
  });
});

describe("map dialog sources", () => {
  const dialogSource = readFileSync(
    join(process.cwd(), "src/components/letter-signals/ContributionMapDialog.tsx"),
    "utf8",
  );
  const landingCardSource = readFileSync(
    join(process.cwd(), "src/components/letter-signals/LetterActivityCard.tsx"),
    "utf8",
  );

  const successCardSource = readFileSync(
    join(process.cwd(), "src/components/wizard/LetterSignalCard.tsx"),
    "utf8",
  );

  it("keeps the success card map non-interactive", () => {
    expect(successCardSource).not.toContain("ContributionMapDialog");
    expect(successCardSource).not.toContain("cursor-zoom-in");
    expect(successCardSource).not.toContain("Karte vergrößern");
    expect(successCardSource).not.toContain('aria-haspopup="dialog"');
    expect(successCardSource).toContain("GermanyContributionMap");
    expect(successCardSource).toContain("ownPointState");
    expect(successCardSource).toContain("Mein Anliegen auf die Karte setzen");
  });

  it("wires the landing card trigger to the dialog", () => {
    expect(landingCardSource).toContain("ContributionMapDialog");
    expect(landingCardSource).toContain('aria-haspopup="dialog"');
    expect(landingCardSource).toContain("Karte vergrößern");
    expect(landingCardSource).toContain("cursor-zoom-in");
    expect(landingCardSource).toContain("Vergrößern");
    expect(landingCardSource).toContain("expandable");
  });

  it("keeps copy free of em dashes and first-person plural", () => {
    const emDash = String.fromCharCode(0x2014);
    expect(dialogSource).not.toContain(emDash);
    expect(landingCardSource).not.toContain(emDash);
    expect(successCardSource).not.toContain(emDash);
    const plural = new RegExp("\\b(" + ["w", "ir"].join("") + "|" + ["u", "ns"].join("") + "|" + ["un", "ser\\w*"].join("") + ")\\b", "i");
    expect(dialogSource).not.toMatch(plural);
  });

  it("implements gesture, wheel, sheet and animation hooks", () => {
    for (const token of [
      "setPointerCapture",
      "passive: false",
      "gesturestart",
      "requestAnimationFrame",
      "data-state",
      "onCancel",
      "(max-width: 767.98px)",
    ]) {
      expect(dialogSource).toContain(token);
    }
  });

  it("lists every map dialog animation class in the reduced-motion block", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const start = css.indexOf("@media (prefers-reduced-motion: reduce)");
    const end = css.indexOf("animation: none !important", start);
    const region = css.slice(start, end);
    for (const name of [
      ".map-dialog-sheet",
      ".map-dialog-panel",
      ".map-dialog-backdrop",
    ]) {
      expect(css).toContain(name);
      expect(region).toContain(name);
    }
  });
});
