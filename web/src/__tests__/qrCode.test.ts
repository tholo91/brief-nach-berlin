import { createQrMatrix } from "@/lib/qr-code";

// Ein Finder ist 7x7: dunkler Rand, heller Ring, dunkler 3x3-Kern. Scanner suchen
// genau dieses Muster; ein überschriebener Finder macht den Code unlesbar.
const FINDER = [
  "1111111",
  "1000001",
  "1011101",
  "1011101",
  "1011101",
  "1000001",
  "1111111",
];

function block(matrix: boolean[][], top: number, left: number): string[] {
  return Array.from({ length: 7 }, (_, dy) =>
    Array.from({ length: 7 }, (_, dx) => (matrix[top + dy][left + dx] ? "1" : "0")).join(""),
  );
}

describe("createQrMatrix", () => {
  const url = "https://www.brief-nach-berlin.de/kampagne/beispiel";
  const matrix = createQrMatrix(url);
  const size = matrix.length;

  it("zeichnet alle drei Finder unversehrt", () => {
    expect(size).toBe(57);
    expect(block(matrix, 0, 0)).toEqual(FINDER);
    expect(block(matrix, 0, size - 7)).toEqual(FINDER);
    expect(block(matrix, size - 7, 0)).toEqual(FINDER);
  });

  it("hält die Trennlinien um die Finder hell", () => {
    for (let i = 0; i < 8; i += 1) {
      expect(matrix[7][i]).toBe(false);
      expect(matrix[i][7]).toBe(false);
      expect(matrix[7][size - 1 - i]).toBe(false);
      expect(matrix[size - 8][i]).toBe(false);
    }
  });

  it("zeichnet das Timing-Muster nur zwischen den Findern abwechselnd", () => {
    for (let i = 8; i < size - 8; i += 1) {
      expect(matrix[6][i]).toBe(i % 2 === 0);
      expect(matrix[i][6]).toBe(i % 2 === 0);
    }
  });
});
