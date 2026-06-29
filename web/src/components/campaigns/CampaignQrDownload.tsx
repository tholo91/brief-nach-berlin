"use client";

import { useEffect, useRef, useState } from "react";
import { createQrMatrix } from "@/lib/qr-code";

const fallbackLogoUrl = "/images/img-umschlag-icon.webp";
const cellPixels = 16;
const quietZoneCells = 4;

type CampaignQrDownloadProps = {
  url: string;
  slug: string;
  logoUrl?: string | null;
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function drawLogo(
  context: CanvasRenderingContext2D,
  size: number,
  logoUrl: string
): Promise<void> {
  const image = await loadImage(logoUrl);
  const backingSize = Math.round(size * 0.24);
  const logoSize = Math.round(size * 0.17);
  const backingX = Math.round((size - backingSize) / 2);

  context.fillStyle = "#faf8f5";
  roundedRect(context, backingX, backingX, backingSize, backingSize, Math.round(backingSize * 0.22));
  context.fill();
  context.strokeStyle = "rgba(57, 74, 55, 0.16)";
  context.lineWidth = Math.max(3, Math.round(size * 0.004));
  context.stroke();

  const scale = Math.min(logoSize / image.naturalWidth, logoSize / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const x = Math.round((size - width) / 2);
  const y = Math.round((size - height) / 2);
  context.drawImage(image, x, y, width, height);
}

async function renderQr(
  canvas: HTMLCanvasElement,
  url: string,
  logoUrl: string
): Promise<void> {
  const matrix = createQrMatrix(url);
  const totalCells = matrix.length + quietZoneCells * 2;
  const size = totalCells * cellPixels;
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = size;
  canvas.height = size;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#172516";

  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix.length; x += 1) {
      if (!matrix[y][x]) continue;
      context.fillRect(
        (x + quietZoneCells) * cellPixels,
        (y + quietZoneCells) * cellPixels,
        cellPixels,
        cellPixels
      );
    }
  }

  await drawLogo(context, size, logoUrl);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("QR download failed."));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

export function CampaignQrDownload({ url, slug, logoUrl }: CampaignQrDownloadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState("QR-Code bereit");
  const effectiveLogoUrl = logoUrl ?? fallbackLogoUrl;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setMessage("QR-Code wird erstellt...");
    renderQr(canvas, url, effectiveLogoUrl)
      .catch(() => renderQr(canvas, url, fallbackLogoUrl))
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
      let blob: Blob;
      try {
        blob = await canvasToBlob(canvas);
      } catch {
        await renderQr(canvas, url, fallbackLogoUrl);
        blob = await canvasToBlob(canvas);
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `brief-nach-berlin-kampagne-${slug}-qr.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
      setMessage("QR-Code heruntergeladen");
      window.setTimeout(() => setMessage("QR-Code bereit"), 2200);
    } catch {
      setMessage("Download fehlgeschlagen");
    }
  }

  return (
    <div className="grid gap-4 rounded-md border border-warmgrau/12 bg-white/65 p-4 sm:grid-cols-[132px_1fr] sm:items-center">
      <canvas
        ref={canvasRef}
        aria-label="QR-Code zum Kampagnenlink"
        className="h-[132px] w-[132px] rounded-md border border-warmgrau/12 bg-white"
      />
      <div className="grid gap-3">
        <div>
          <h2 className="font-typewriter text-xl font-bold text-waldgruen-dark">
            QR Code
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
            Zum Ausdrucken, Teilen oder Aushängen, damit Menschen direkt zur
            öffentlichen Kampagnenseite gelangen.
          </p>
        </div>
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
        <button
          type="button"
          onClick={downloadQr}
          className="inline-flex w-full items-center justify-center rounded-md bg-waldgruen px-4 py-2.5 font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark sm:w-fit"
        >
          QR-Code herunterladen
        </button>
      </div>
    </div>
  );
}
