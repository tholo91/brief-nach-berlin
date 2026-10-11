"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { GermanyContributionMap } from "@/components/letter-signals/GermanyContributionMap";
import { GERMANY_MAP_VIEWBOX } from "@/lib/letterSignals/germanyMapGeometry.generated";
import type { LetterMapPoint } from "@/lib/letterSignals/mapTypes";
import {
  DOUBLE_TAP_ZOOM,
  MAP_BUTTON_ZOOM_STEP,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  TAP_MAX_MOVE_PX,
  clampViewport,
  clientToMap,
  formatMapCounts,
  initialViewport,
  isDoubleTap,
  panBy,
  parseViewBox,
  pinchStep,
  shouldDismissSheet,
  viewBoxString,
  viewportWindow,
  wheelZoomFactor,
  zoomAt,
  type MapPoint2D,
  type MapViewport,
} from "@/lib/letterSignals/mapViewport";

const BOUNDS = parseViewBox(GERMANY_MAP_VIEWBOX);
const CLOSE_ANIMATION_MS = 220;
const SWIPE_CLOSE_MS = 200;
const ZOOM_ANIMATION_MS = 180;
const MOBILE_SHEET_QUERY = "(max-width: 767.98px)";
const MAP_ATTRIBUTION = "Karte: © OSM (ODbL) · GeoNames (CC BY 4.0) · Natural Earth (PD)";

const controlButtonClass =
  "inline-flex h-11 w-11 items-center justify-center text-waldgruen-dark transition-colors hover:bg-waldgruen/10 active:bg-waldgruen/15 disabled:cursor-not-allowed disabled:text-warmgrau/30 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-waldgruen";

type CloseOptions = { swipe?: boolean };

export type ContributionMapDialogProps = {
  open: boolean;
  onClose: () => void;
  points: LetterMapPoint[];
  ownPoint: { x: number; y: number } | null;
  ownVisible: boolean;
  totalContributions: number;
  postcodeAreas: number;
  reducedMotion: boolean;
};

export function ContributionMapDialog({
  open,
  onClose,
  points,
  ownPoint,
  ownVisible,
  totalContributions,
  postcodeAreas,
  reducedMotion,
}: ContributionMapDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropDownRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const requestClose = useCallback(
    (options?: CloseOptions) => {
      const dialog = dialogRef.current;
      if (!dialog?.open || closeTimerRef.current !== null) return;
      if (reducedMotion) {
        dialog.close();
        return;
      }
      if (options?.swipe) {
        dialog.style.transition = `transform ${SWIPE_CLOSE_MS}ms ease-out`;
        dialog.style.transform = "translateY(100%)";
        closeTimerRef.current = window.setTimeout(() => dialog.close(), SWIPE_CLOSE_MS);
        return;
      }
      setClosing(true);
      closeTimerRef.current = window.setTimeout(() => dialog.close(), CLOSE_ANIMATION_MS);
    },
    [reducedMotion],
  );

  const handleNativeClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.style.transform = "";
      dialog.style.transition = "";
    }
    setClosing(false);
    onClose();
  };

  const isOutsidePanel = (event: { clientX: number; clientY: number }) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-state={closing ? "closing" : "open"}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={handleNativeClose}
      onPointerDown={(event) => {
        backdropDownRef.current = event.target === event.currentTarget && isOutsidePanel(event);
      }}
      onClick={(event) => {
        const startedOnBackdrop = backdropDownRef.current;
        backdropDownRef.current = false;
        if (startedOnBackdrop && event.target === event.currentTarget && isOutsidePanel(event)) {
          requestClose();
        }
      }}
      className="map-dialog-sheet map-dialog-panel map-dialog-backdrop fixed inset-x-0 bottom-0 top-auto m-0 h-[88dvh] max-h-none w-full max-w-none flex-col overflow-hidden overscroll-contain rounded-b-none rounded-t-3xl border border-waldgruen/20 bg-creme p-0 pb-[env(safe-area-inset-bottom)] text-waldgruen-dark shadow-2xl backdrop:bg-waldgruen-dark/45 backdrop:backdrop-blur-[2px] open:flex md:inset-0 md:m-auto md:h-[min(88dvh,48rem)] md:w-[min(92vw,60rem)] md:rounded-2xl md:pb-0"
    >
      {open && (
        <MapViewer
          dialogRef={dialogRef}
          titleId={titleId}
          points={points}
          ownPoint={ownPoint}
          ownVisible={ownVisible}
          totalContributions={totalContributions}
          postcodeAreas={postcodeAreas}
          reducedMotion={reducedMotion}
          onRequestClose={requestClose}
        />
      )}
    </dialog>
  );
}

type PointerRecord = { x: number; y: number };

function MapViewer({
  dialogRef,
  titleId,
  points,
  ownPoint,
  ownVisible,
  totalContributions,
  postcodeAreas,
  reducedMotion,
  onRequestClose,
}: Omit<ContributionMapDialogProps, "open" | "onClose"> & {
  dialogRef: RefObject<HTMLDialogElement | null>;
  titleId: string;
  onRequestClose: (options?: CloseOptions) => void;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<MapViewport>(initialViewport(BOUNDS));
  const aspectRef = useRef(1);
  const commitFrameRef = useRef(0);
  const animationRef = useRef<{ frame: number; target: MapViewport } | null>(null);
  const pointersRef = useRef(new Map<number, PointerRecord>());
  const gestureRef = useRef({ startX: 0, startY: 0, panning: false, multi: false });
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const swipeRef = useRef<{ id: number; startY: number; startTime: number } | null>(null);
  const [rawViewport, setRawViewport] = useState<MapViewport>(() => initialViewport(BOUNDS));
  const [aspect, setAspect] = useState(1);

  const viewport = useMemo(() => clampViewport(rawViewport, BOUNDS, aspect), [rawViewport, aspect]);
  const windowBounds = useMemo(() => viewportWindow(viewport, BOUNDS, aspect), [viewport, aspect]);
  const counts = formatMapCounts(totalContributions, postcodeAreas);

  const scheduleCommit = useCallback(() => {
    if (commitFrameRef.current) return;
    commitFrameRef.current = requestAnimationFrame(() => {
      commitFrameRef.current = 0;
      setRawViewport(viewportRef.current);
    });
  }, []);

  const applyViewport = useCallback(
    (next: MapViewport) => {
      viewportRef.current = clampViewport(next, BOUNDS, aspectRef.current);
      scheduleCommit();
    },
    [scheduleCommit],
  );

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current.frame);
      animationRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: MapViewport) => {
      cancelAnimation();
      if (reducedMotion) {
        applyViewport(target);
        return;
      }
      const from = viewportRef.current;
      const startedAt = performance.now();
      const state = { frame: 0, target };
      animationRef.current = state;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / ZOOM_ANIMATION_MS);
        const eased = 1 - (1 - t) ** 3;
        applyViewport({
          cx: from.cx + (target.cx - from.cx) * eased,
          cy: from.cy + (target.cy - from.cy) * eased,
          scale: from.scale + (target.scale - from.scale) * eased,
        });
        if (t < 1) {
          state.frame = requestAnimationFrame(tick);
        } else if (animationRef.current === state) {
          animationRef.current = null;
        }
      };
      state.frame = requestAnimationFrame(tick);
    },
    [applyViewport, cancelAnimation, reducedMotion],
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(commitFrameRef.current);
      cancelAnimation();
    },
    [cancelAnimation],
  );

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      aspectRef.current = width / height;
      viewportRef.current = clampViewport(viewportRef.current, BOUNDS, aspectRef.current);
      setAspect(width / height);
      scheduleCommit();
    });
    observer.observe(surface);
    return () => observer.disconnect();
  }, [scheduleCommit]);

  const toMap = useCallback((clientX: number, clientY: number, from: MapViewport = viewportRef.current): MapPoint2D => {
    const surface = surfaceRef.current;
    if (!surface) return { x: from.cx, y: from.cy };
    const win = viewportWindow(from, BOUNDS, aspectRef.current);
    return clientToMap(clientX, clientY, surface.getBoundingClientRect(), win);
  }, []);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cancelAnimation();
      const factor = wheelZoomFactor(event.deltaY, event.deltaMode, event.ctrlKey);
      const focal = toMap(event.clientX, event.clientY);
      applyViewport(zoomAt(viewportRef.current, factor, focal, BOUNDS, aspectRef.current));
    };

    let gestureStart: MapViewport | null = null;
    type SafariGestureEvent = Event & { scale: number; clientX: number; clientY: number };
    const onGestureStart = (event: Event) => {
      event.preventDefault();
      cancelAnimation();
      gestureStart = viewportRef.current;
    };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as SafariGestureEvent;
      if (!gestureStart || pointersRef.current.size > 0) return;
      const focal = toMap(gesture.clientX, gesture.clientY, gestureStart);
      applyViewport(zoomAt(gestureStart, gesture.scale, focal, BOUNDS, aspectRef.current));
    };
    const onGestureEnd = (event: Event) => {
      event.preventDefault();
      gestureStart = null;
    };

    surface.addEventListener("wheel", onWheel, { passive: false });
    surface.addEventListener("gesturestart", onGestureStart);
    surface.addEventListener("gesturechange", onGestureChange);
    surface.addEventListener("gestureend", onGestureEnd);
    return () => {
      surface.removeEventListener("wheel", onWheel);
      surface.removeEventListener("gesturestart", onGestureStart);
      surface.removeEventListener("gesturechange", onGestureChange);
      surface.removeEventListener("gestureend", onGestureEnd);
    };
  }, [applyViewport, cancelAnimation, toMap]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    cancelAnimation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      gestureRef.current = { startX: event.clientX, startY: event.clientY, panning: false, multi: false };
    } else {
      gestureRef.current.multi = true;
      gestureRef.current.panning = true;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    const gesture = gestureRef.current;

    if (pointers.size === 1) {
      if (!gesture.panning) {
        if (Math.hypot(next.x - gesture.startX, next.y - gesture.startY) <= TAP_MAX_MOVE_PX) return;
        gesture.panning = true;
      }
      const from = toMap(previous.x, previous.y);
      const to = toMap(next.x, next.y);
      applyViewport(panBy(viewportRef.current, to.x - from.x, to.y - from.y, BOUNDS, aspectRef.current));
      pointers.set(event.pointerId, next);
      return;
    }

    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
      if (!other) return;
      const step = pinchStep(previous, other, next, other);
      const zoomed = zoomAt(
        viewportRef.current,
        step.factor,
        toMap(step.prevMidpoint.x, step.prevMidpoint.y),
        BOUNDS,
        aspectRef.current,
      );
      const before = toMap(step.prevMidpoint.x, step.prevMidpoint.y, zoomed);
      const after = toMap(step.nextMidpoint.x, step.nextMidpoint.y, zoomed);
      applyViewport(panBy(zoomed, after.x - before.x, after.y - before.y, BOUNDS, aspectRef.current));
    }
    pointers.set(event.pointerId, next);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    const gesture = gestureRef.current;
    const wasTap =
      event.type === "pointerup" && pointers.size === 1 && !gesture.multi && !gesture.panning;
    pointers.delete(event.pointerId);
    if (!wasTap) return;

    const tap = { time: event.timeStamp, x: event.clientX, y: event.clientY };
    if (isDoubleTap(lastTapRef.current, tap)) {
      lastTapRef.current = null;
      const current = viewportRef.current;
      animateTo(
        current.scale >= MAP_MAX_ZOOM
          ? initialViewport(BOUNDS)
          : zoomAt(current, DOUBLE_TAP_ZOOM, toMap(tap.x, tap.y), BOUNDS, aspectRef.current),
      );
    } else {
      lastTapRef.current = tap;
    }
  };

  const zoomByStep = (factor: number) => {
    const base = animationRef.current?.target ?? viewportRef.current;
    animateTo(zoomAt(base, factor, { x: base.cx, y: base.cy }, BOUNDS, aspectRef.current));
  };

  const isSheet = () => window.matchMedia(MOBILE_SHEET_QUERY).matches;

  const handleSwipeDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button") || !isSheet()) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    swipeRef.current = { id: event.pointerId, startY: event.clientY, startTime: event.timeStamp };
  };

  const handleSwipeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    const dialog = dialogRef.current;
    if (!swipe || swipe.id !== event.pointerId || !dialog) return;
    const distance = Math.max(0, event.clientY - swipe.startY);
    dialog.style.transition = "none";
    dialog.style.transform = `translateY(${distance}px)`;
  };

  const handleSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    const dialog = dialogRef.current;
    if (!swipe || swipe.id !== event.pointerId || !dialog) return;
    swipeRef.current = null;
    const distance = Math.max(0, event.clientY - swipe.startY);
    const elapsed = Math.max(1, event.timeStamp - swipe.startTime);
    if (event.type === "pointerup" && shouldDismissSheet(distance, distance / elapsed)) {
      onRequestClose({ swipe: true });
      return;
    }
    dialog.style.transition = reducedMotion ? "none" : "transform 200ms ease-out";
    dialog.style.transform = "";
  };

  return (
    <>
      <div
        aria-hidden="true"
        className="h-1.5 shrink-0"
        style={{
          background:
            "repeating-linear-gradient(-45deg, var(--color-airmail-rot) 0 10px, var(--color-creme) 10px 15px, var(--color-airmail-blau) 15px 25px, var(--color-creme) 25px 30px)",
        }}
      />
      <div
        className="shrink-0 touch-none md:touch-auto"
        onPointerDown={handleSwipeDown}
        onPointerMove={handleSwipeMove}
        onPointerUp={handleSwipeEnd}
        onPointerCancel={handleSwipeEnd}
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-warmgrau/25 md:hidden" />
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-3 md:px-7 md:pt-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-body text-lg font-semibold leading-snug text-waldgruen-dark md:text-xl">
              Woher die Briefe kommen
            </h2>
            <p className="mt-0.5 font-body text-sm text-warmgrau/75">{counts}</p>
            {ownVisible && (
              <p className="mt-2 inline-flex items-center gap-2 font-body text-xs font-semibold text-warmgrau/80">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-airmail-rot ring-2 ring-white" />
                Dein Anliegen
              </p>
            )}
          </div>
          <button
            type="button"
            autoFocus
            aria-label="Karte schließen"
            onClick={() => onRequestClose()}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-waldgruen-dark transition-colors hover:bg-waldgruen/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
      </div>

      <div className="relative mx-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-waldgruen/[0.04] md:mx-5">
        <div
          ref={surfaceRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`absolute inset-0 touch-none select-none ${viewport.scale > MAP_MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          <GermanyContributionMap
            points={points}
            ownPoint={ownPoint}
            ownPointState={ownVisible ? "contributed" : "idle"}
            reducedMotion={reducedMotion}
            variant="expanded"
            viewBox={viewBoxString(windowBounds)}
            zoom={viewport.scale}
            label={`Deutschlandkarte: ${counts}${ownVisible ? "; dein Anliegen ist dabei" : ""}`}
          />
        </div>
        <div
          role="group"
          aria-label="Kartenansicht"
          className="absolute bottom-3 right-3 flex flex-col divide-y divide-waldgruen/15 overflow-hidden rounded-xl border border-waldgruen/20 bg-creme/95 shadow-md"
        >
          <button
            type="button"
            aria-label="Hineinzoomen"
            disabled={viewport.scale >= MAP_MAX_ZOOM}
            onClick={() => zoomByStep(MAP_BUTTON_ZOOM_STEP)}
            className={controlButtonClass}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Herauszoomen"
            disabled={viewport.scale <= MAP_MIN_ZOOM}
            onClick={() => zoomByStep(1 / MAP_BUTTON_ZOOM_STEP)}
            className={controlButtonClass}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Ansicht zurücksetzen"
            disabled={viewport.scale <= MAP_MIN_ZOOM}
            onClick={() => animateTo(initialViewport(BOUNDS))}
            className={controlButtonClass}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      <footer className="shrink-0 px-5 pb-3 pt-2 md:px-7 md:pb-4">
        <p className="font-body text-xs text-warmgrau/70">
          <span className="md:hidden">Mit zwei Fingern zoomen, doppelt tippen für mehr Nähe.</span>
          <span className="hidden md:inline">Mausrad oder Doppelklick zum Zoomen, ziehen zum Verschieben.</span>
        </p>
        <p className="mt-1 font-body text-[10px] leading-relaxed tracking-tight text-warmgrau/45">{MAP_ATTRIBUTION}</p>
      </footer>
    </>
  );
}
