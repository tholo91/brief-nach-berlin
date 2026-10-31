"use client";

import { useEffect, useMemo, useRef } from "react";
import { createQrMatrix } from "@/lib/qr-code";
import { CloseIcon } from "./icons";

const QUIET_ZONE = 4;

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

  const { path, size } = useMemo(() => {
    const matrix = createQrMatrix(url);
    let d = "";
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix.length; x += 1) {
        if (matrix[y][x]) d += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { path: d, size: matrix.length + QUIET_ZONE * 2 };
  }, [url]);

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
        closeRef.current?.focus();
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-4"
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
      <svg
        role="img"
        aria-label="QR-Code zum Klassenlink"
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        style={{ width: "min(80vmin, 100%)", aspectRatio: "1 / 1" }}
      >
        <rect width={size} height={size} fill="#ffffff" />
        <path d={path} fill="#172516" />
      </svg>
      <p className="text-center font-body text-lg text-warmgrau">
        Mit der Kamera scannen und den Brief schreiben.
      </p>
    </div>
  );
}
