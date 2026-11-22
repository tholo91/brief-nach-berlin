import { createQrMatrix } from "@/lib/qr-code";
import { qrCanvasSize, qrLogoBackingModules, qrLogoGeometry } from "@/lib/qrCanvas";

const lengths = [29, 33, 37, 41, 57, 65, 73];

describe("qrCanvas geometry", () => {
  const matrixLength = createQrMatrix("https://www.briefnachberlin.de/beispielkampagne").length;

  it("includes a 4 module quiet zone on every side", () => {
    expect(qrCanvasSize(matrixLength, 16)).toBe((matrixLength + 8) * 16);
  });

  it.each(lengths)("keeps the logo square small enough for level Q (QR %i)", (length) => {
    const modules = qrLogoBackingModules(length);
    expect((modules * modules) / (length * length)).toBeLessThan(0.1);
  });

  it.each(lengths)("centers an odd, module-aligned square and fits the logo inside (QR %i)", (length) => {
    const cell = 24;
    const size = qrCanvasSize(length, cell);
    const { backingSize, logoSize, backingX, logoX } = qrLogoGeometry(length, cell);
    expect(qrLogoBackingModules(length) % 2).toBe(1);
    expect(backingSize % cell).toBe(0);
    expect(backingX * 2 + backingSize).toBe(size);
    expect(backingX % cell).toBe(0);
    expect(logoSize).toBeLessThan(backingSize);
    expect(logoX).toBeGreaterThan(backingX);
  });

  it("keeps the logo at least as large as before on the long class-link codes", () => {
    const { logoSize } = qrLogoGeometry(57, 16);
    expect(logoSize / 16).toBeGreaterThanOrEqual(13);
  });
});
