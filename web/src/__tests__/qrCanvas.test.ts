import { createQrMatrix } from "@/lib/qr-code";
import { qrCanvasSize, qrLogoGeometry } from "@/lib/qrCanvas";

describe("qrCanvas geometry", () => {
  const matrixLength = createQrMatrix("https://brief-nach-berlin.de/schule?k=test").length;

  it("includes a 4 module quiet zone on every side", () => {
    expect(qrCanvasSize(matrixLength, 16)).toBe((matrixLength + 8) * 16);
  });

  it("keeps the logo backing well below the level Q tolerance (25 %)", () => {
    const size = qrCanvasSize(matrixLength, 16);
    const { backingSize } = qrLogoGeometry(size);
    expect((backingSize * backingSize) / (size * size)).toBeLessThan(0.1);
  });

  it("centers the backing and fits the logo inside it", () => {
    const size = qrCanvasSize(matrixLength, 24);
    const { backingSize, logoSize, backingX } = qrLogoGeometry(size);
    expect(backingX * 2 + backingSize).toBeCloseTo(size, -1);
    expect(logoSize).toBeLessThan(backingSize);
  });
});
