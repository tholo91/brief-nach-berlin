export type MapBounds = { x: number; y: number; width: number; height: number };
export type MapViewport = { cx: number; cy: number; scale: number };
export type MapPoint2D = { x: number; y: number };

export const MAP_MIN_ZOOM = 1;
export const MAP_MAX_ZOOM = 6;
export const MAP_BUTTON_ZOOM_STEP = 1.6;
export const POINT_RADIUS_ZOOM_EXPONENT = 0.7;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseViewBox(viewBox: string): MapBounds {
  const [x, y, width, height] = viewBox.trim().split(/\s+/).map(Number);
  return { x, y, width, height };
}

export function initialViewport(bounds: MapBounds): MapViewport {
  return {
    cx: bounds.x + bounds.width / 2,
    cy: bounds.y + bounds.height / 2,
    scale: MAP_MIN_ZOOM,
  };
}

export function viewportWindow(viewport: MapViewport, bounds: MapBounds, aspect: number): MapBounds {
  const boundsAspect = bounds.width / bounds.height;
  let width: number;
  let height: number;
  if (aspect >= boundsAspect) {
    height = bounds.height;
    width = height * aspect;
  } else {
    width = bounds.width;
    height = width / aspect;
  }
  width /= viewport.scale;
  height /= viewport.scale;
  return { x: viewport.cx - width / 2, y: viewport.cy - height / 2, width, height };
}

function clampAxis(center: number, size: number, boundsMin: number, boundsSize: number): number {
  if (size >= boundsSize) return boundsMin + boundsSize / 2;
  return clamp(center, boundsMin + size / 2, boundsMin + boundsSize - size / 2);
}

export function clampViewport(viewport: MapViewport, bounds: MapBounds, aspect: number): MapViewport {
  const scale = clamp(viewport.scale, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const window = viewportWindow({ ...viewport, scale }, bounds, aspect);
  return {
    scale,
    cx: clampAxis(viewport.cx, window.width, bounds.x, bounds.width),
    cy: clampAxis(viewport.cy, window.height, bounds.y, bounds.height),
  };
}

export function zoomAt(
  viewport: MapViewport,
  factor: number,
  focal: MapPoint2D,
  bounds: MapBounds,
  aspect: number,
): MapViewport {
  const scale = clamp(viewport.scale * factor, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  const ratio = scale / viewport.scale;
  return clampViewport(
    {
      scale,
      cx: focal.x + (viewport.cx - focal.x) / ratio,
      cy: focal.y + (viewport.cy - focal.y) / ratio,
    },
    bounds,
    aspect,
  );
}

export function panBy(
  viewport: MapViewport,
  dx: number,
  dy: number,
  bounds: MapBounds,
  aspect: number,
): MapViewport {
  return clampViewport({ ...viewport, cx: viewport.cx - dx, cy: viewport.cy - dy }, bounds, aspect);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function viewBoxString(window: MapBounds): string {
  return [window.x, window.y, window.width, window.height].map(round3).join(" ");
}

export function clientToMap(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  window: MapBounds,
): MapPoint2D {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: window.x + window.width / 2, y: window.y + window.height / 2 };
  }
  return {
    x: window.x + ((clientX - rect.left) / rect.width) * window.width,
    y: window.y + ((clientY - rect.top) / rect.height) * window.height,
  };
}

export function contributionPointRadius(count: number): number {
  return Math.min(2.5, 0.75 + Math.log2(count + 1) * 0.32);
}

export function scaledPointRadius(radius: number, zoom: number): number {
  return radius / Math.max(zoom, 1) ** POINT_RADIUS_ZOOM_EXPONENT;
}

const numberFormat = new Intl.NumberFormat("de-DE");

export function formatMapCounts(total: number, areas: number): string {
  if (total === 0) return "Noch keine Punkte auf der Karte";
  return `${numberFormat.format(total)} ${total === 1 ? "Brief" : "Briefe"} aus ${numberFormat.format(areas)} ${areas === 1 ? "PLZ-Gebiet" : "PLZ-Gebieten"}`;
}
