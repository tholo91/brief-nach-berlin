"use client";

import { useEffect, useRef, useState } from "react";
import { createQrMatrix } from "@/lib/qr-code";
import {
  downloadCanvasPng,
  fallbackQrLogoUrl,
  qrCanvasSize,
  renderQrToCanvas,
} from "@/lib/qrCanvas";
import { CloseIcon, DownloadIcon } from "./icons";

const FILE_NAME = "brief-nach-berlin-klasse-qr.png";
const MIN_CELL_PIXELS = 16;
const MAX_CELL_PIXELS = 40;

// Pixel size per QR module so the canvas has at least the on-screen resolution
// (80vmin at device pixel ratio), which keeps it crisp on projectors and 4K screens.
function pickCellPixels(matrixLength: number): number {
  const target = Math.min(window.innerWidth, window.innerHeight) * 0.8 * window.devicePixelRatio;
  const cells = qrCanvasSize(matrixLength, 1);
  return Math.min(MAX_CELL_PIXELS, Math.max(MIN_CELL_PIXELS, Math.ceil(target / cells)));
}

export function BigQrOverlay({
  url,
  klasse,
  onClose,
}: {
  url: string;
  klasse: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const downloadRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cellPixels = pickCellPixels(createQrMatrix(url).length);
    renderQrToCanvas(canvas, url, fallbackQrLogoUrl, cellPixels).catch(() =>
      renderQrToCanvas(canvas, url, null, cellPixels).catch(() =>
        setStatus("QR-Code konnte nicht erstellt werden")
      )
    );
  }, [url]);

  async function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await downloadCanvasPng(canvas, FILE_NAME, () =>
        renderQrToCanvas(canvas, url, null, pickCellPixels(createQrMatrix(url).length))
      );
      setStatus("QR-Code gespeichert");
    } catch {
      setStatus("Speichern fehlgeschlagen. Bitte noch einmal versuchen.");
    }
  }

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        event.preventDefault();
        const order = [closeRef.current, downloadRef.current].filter(
          (el): el is HTMLButtonElement => el !== null
        );
        const index = order.indexOf(document.activeElement as HTMLButtonElement);
        const step = event.shiftKey ? -1 : 1;
        order[(index + step + order.length) % order.length]?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`QR-Code zum Klassenlink für Klasse ${klasse}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-white p-4"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-waldgruen/30 bg-white px-4 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:bg-waldgruen/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2"
      >
        <CloseIcon />
        Schließen
      </button>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="QR-Code zum Klassenlink"
        style={{ width: "min(80vmin, 100%)", aspectRatio: "1 / 1" }}
      />
      <p className="text-center font-body text-lg text-warmgrau">
        Mit der Kamera scannen und den Brief schreiben.
      </p>
      <button
        ref={downloadRef}
        type="button"
        onClick={downloadQr}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2"
      >
        <DownloadIcon />
        QR-Code speichern
      </button>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
