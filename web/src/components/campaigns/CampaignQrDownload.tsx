"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon } from "@/components/schule/icons";
import { downloadCanvasPng, fallbackQrLogoUrl, renderQrToCanvas } from "@/lib/qrCanvas";

type CampaignQrDownloadProps = {
  url: string;
  slug: string;
  logoUrl?: string | null;
  fileName?: string;
  ariaLabel?: string;
  description?: string;
};

export function CampaignQrDownload({ url, slug, logoUrl, fileName, ariaLabel, description }: CampaignQrDownloadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState("QR-Code bereit");
  const effectiveLogoUrl = logoUrl ?? fallbackQrLogoUrl;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setMessage("QR-Code wird erstellt...");
    renderQrToCanvas(canvas, url, effectiveLogoUrl)
      .catch(() => renderQrToCanvas(canvas, url, fallbackQrLogoUrl))
      .then(() => {
        if (!cancelled) setMessage("QR-Code bereit");
      })
      .catch(() => {
        if (!cancelled) setMessage("QR-Code konnte nicht erstellt werden");
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveLogoUrl, url]);

  async function downloadQr() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      await downloadCanvasPng(
        canvas,
        fileName ?? `brief-nach-berlin-kampagne-${slug}-qr.png`,
        () => renderQrToCanvas(canvas, url, fallbackQrLogoUrl)
      );
      setMessage("QR-Code heruntergeladen");
      window.setTimeout(() => setMessage("QR-Code bereit"), 2200);
    } catch {
      setMessage("Download fehlgeschlagen");
    }
  }

  return (
    <div className="grid grid-cols-[128px_1fr] items-center gap-4 sm:grid-cols-[160px_1fr]">
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel ?? "QR-Code zum Kampagnenlink"}
        className="h-32 w-32 border border-warmgrau/12 bg-white sm:h-40 sm:w-40"
      />
      <div className="grid gap-3">
        <div>
          <h3 className="font-typewriter text-base font-bold text-waldgruen-dark">
            QR-Code
          </h3>
          <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/70">
            {description ??
              "Zum Ausdrucken, Teilen oder Aushängen, damit Menschen direkt zur öffentlichen Kampagnenseite gelangen."}
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
        <button
          type="button"
          onClick={downloadQr}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-4 py-2.5 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen sm:w-fit"
        >
          <DownloadIcon />
          QR-Code herunterladen
        </button>
      </div>
    </div>
  );
}
