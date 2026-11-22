import { createQrMatrix } from "@/lib/qr-code";

export const fallbackQrLogoUrl = "/images/img-umschlag-icon.webp";

const defaultCellPixels = 16;
const quietZoneCells = 4;

// The own encoder in qr-code.ts uses error correction level Q (about 25 % of the codewords
// recoverable). The white logo square covers about 7 to 9 % of the modules, so with margin
// for print noise and scanning from a distance. It is a whole number of modules (odd, so
// it sits centered on the module grid) and has a one module white frame around the logo.
const logoBackingShare = 0.28;
const logoFrameModules = 1;

export function qrCanvasSize(matrixLength: number, cellPixels: number = defaultCellPixels): number {
  return (matrixLength + quietZoneCells * 2) * cellPixels;
}

function nearestOdd(value: number): number {
  const lower = 2 * Math.floor((value - 1) / 2) + 1;
  return value - lower <= lower + 2 - value ? lower : lower + 2;
}

/** Square white field in the center: edge length in modules, odd, scales with the QR size. */
export function qrLogoBackingModules(matrixLength: number): number {
  return nearestOdd(matrixLength * logoBackingShare);
}

export function qrLogoGeometry(
  matrixLength: number,
  cellPixels: number = defaultCellPixels
): { backingSize: number; logoSize: number; backingX: number; logoX: number } {
  const size = qrCanvasSize(matrixLength, cellPixels);
  const backingModules = qrLogoBackingModules(matrixLength);
  const backingSize = backingModules * cellPixels;
  const logoSize = (backingModules - logoFrameModules * 2) * cellPixels;
  const backingX = (size - backingSize) / 2;
  return { backingSize, logoSize, backingX, logoX: backingX + logoFrameModules * cellPixels };
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
  matrixLength: number,
  cellPixels: number,
  logoUrl: string
): Promise<void> {
  const image = await loadImage(logoUrl);
  const { backingSize, logoSize, backingX, logoX } = qrLogoGeometry(matrixLength, cellPixels);

  context.fillStyle = "#ffffff";
  context.fillRect(backingX, backingX, backingSize, backingSize);

  const scale = Math.min(logoSize / image.naturalWidth, logoSize / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  context.drawImage(
    image,
    Math.round(logoX + (logoSize - width) / 2),
    Math.round(logoX + (logoSize - height) / 2),
    width,
    height
  );
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

  if (logoUrl) await drawLogo(context, matrix.length, cellPixels, logoUrl);
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
