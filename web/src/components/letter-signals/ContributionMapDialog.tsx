"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { GermanyContributionMap } from "@/components/letter-signals/GermanyContributionMap";
import { GERMANY_MAP_VIEWBOX } from "@/lib/letterSignals/germanyMapGeometry.generated";
import type { LetterMapPoint } from "@/lib/letterSignals/mapTypes";
import {
  MAP_BUTTON_ZOOM_STEP,
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  clampViewport,
  formatMapCounts,
  initialViewport,
  parseViewBox,
  viewBoxString,
  viewportWindow,
  zoomAt,
  type MapViewport,
} from "@/lib/letterSignals/mapViewport";

const BOUNDS = parseViewBox(GERMANY_MAP_VIEWBOX);

const controlButtonClass =
  "inline-flex h-11 w-11 items-center justify-center text-waldgruen-dark transition-colors hover:bg-waldgruen/10 active:bg-waldgruen/15 disabled:cursor-not-allowed disabled:text-warmgrau/30 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-waldgruen";

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
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

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
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={onClose}
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
      className="fixed inset-0 m-auto max-h-none max-w-none flex-col overflow-hidden overscroll-contain rounded-2xl border border-waldgruen/20 bg-creme p-0 text-waldgruen-dark shadow-2xl backdrop:bg-waldgruen-dark/45 backdrop:backdrop-blur-[2px] open:flex h-[min(88dvh,48rem)] w-[min(92vw,60rem)]"
    >
      {open && (
        <MapViewer
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

function MapViewer({
  titleId,
  points,
  ownPoint,
  ownVisible,
  totalContributions,
  postcodeAreas,
  reducedMotion,
  onRequestClose,
}: Omit<ContributionMapDialogProps, "open" | "onClose"> & {
  titleId: string;
  onRequestClose: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [rawViewport, setRawViewport] = useState<MapViewport>(() => initialViewport(BOUNDS));
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setAspect(width / height);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const viewport = useMemo(() => clampViewport(rawViewport, BOUNDS, aspect), [rawViewport, aspect]);
  const windowBounds = useMemo(() => viewportWindow(viewport, BOUNDS, aspect), [viewport, aspect]);
  const counts = formatMapCounts(totalContributions, postcodeAreas);

  const zoomByStep = (factor: number) => {
    setRawViewport(zoomAt(viewport, factor, { x: viewport.cx, y: viewport.cy }, BOUNDS, aspect));
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
      <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-4 md:px-7">
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
          onClick={onRequestClose}
          className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-waldgruen-dark transition-colors hover:bg-waldgruen/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div ref={stageRef} className="relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-waldgruen/[0.04] md:mx-5 md:mb-5">
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
            onClick={() => setRawViewport(initialViewport(BOUNDS))}
            className={controlButtonClass}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
