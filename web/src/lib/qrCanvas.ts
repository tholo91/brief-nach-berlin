import { createQrMatrix } from "@/lib/qr-code";

export const fallbackQrLogoUrl = "/images/img-umschlag-icon.webp";

const defaultCellPixels = 16;
const quietZoneCells = 4;

// The own encoder in qr-code.ts uses error correction level Q (about 25 % recoverable).
// The logo backing covers 0.24 * 0.24 = 5.8 % of the whole image, so far below that.
const logoBackingRatio = 0.24;
const logoImageRatio = 0.17;

export function qrCanvasSize(matrixLength: number, cellPixels: number = defaultCellPixels): number {
  return (matrixLength + quietZoneCells * 2) * cellPixels;
}

export function qrLogoGeometry(size: number): { backingSize: number; logoSize: number; backingX: number } {
  const backingSize = Math.round(size * logoBackingRatio);
  return {
    backingSize,
    logoSize: Math.round(size * logoImageRatio),
    backingX: Math.round((size - backingSize) / 2),
  };
}

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
  const { backingSize, logoSize, backingX } = qrLogoGeometry(size);

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

/**
 * Draws the QR code (with the logo in the center) on the canvas.
 * Pass `logoUrl: null` for a QR code without logo.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  logoUrl: string | null,
  cellPixels: number = defaultCellPixels
): Promise<void> {
  const matrix = createQrMatrix(url);
  const size = qrCanvasSize(matrix.length, cellPixels);
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

  if (logoUrl) await drawLogo(context, size, logoUrl);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
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

/**
 * Downloads the canvas as PNG. If exporting fails (e.g. a tainted canvas from a
 * cross-origin logo), `recover` can redraw the canvas once before the retry.
 */
export async function downloadCanvasPng(
  canvas: HTMLCanvasElement,
  fileName: string,
  recover?: () => Promise<void>
): Promise<void> {
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas);
  } catch (error) {
    if (!recover) throw error;
    await recover();
    blob = await canvasToBlob(canvas);
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
