import { createHash } from "node:crypto";
import { createQrMatrix, QR_MAX_BYTES, qrFits } from "@/lib/qr-code";

// Erwartete Hashes stammen aus einer unabhängigen Referenz (Python-Paket "qrcode",
// Fehlerkorrektur Q, Byte-Modus, Maske 0), nicht aus diesem Encoder. Version 10 deckt
// zugleich ab, dass die bisherigen Codes unverändert bleiben.
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.";

function sample(bytes: number): string {
  let text = "https://www.brief-nach-berlin.de/schule?k=";
  for (let i = 0; text.length < bytes; i += 1) {
    text += ALPHABET[(i * 7 + Math.floor(i / 5)) % ALPHABET.length];
  }
  return text;
}

function hash(matrix: boolean[][]): string {
  const rows = matrix.map((row) => row.map((cell) => (cell ? "1" : "0")).join(""));
  return createHash("sha256").update(rows.join("\n")).digest("hex");
}

describe("createQrMatrix Versionen", () => {
  const cases: Array<[string, string, number, string]> = [
    ["Kampagnen-Link (v10, unverändert)", "https://www.brief-nach-berlin.de/kampagne/beispiel", 57, "32fd84588bfc457890ac26a60484cf79f3712e1d72d3d1f2d3479097447539f7"],
    ["60 Byte (v10)", sample(60), 57, "6a379344575ad68c5a783022148c2998675647b2847c04c9928a183e633ecb39"],
    ["135 Byte (v10)", sample(135), 57, "d5b42054d953b4e135c4c46c19866a4ea0c6f60d2088c8361c6a2e094e8a0e57"],
    ["151 Byte (v10, voll)", sample(151), 57, "3ffd2a2d421e9a60bcdf2568766f0c3e2109b24f1d2599ea4e010463000b1d8c"],
    ["152 Byte (v12)", sample(152), 65, "7f8b1ee5163eac2ca2b0df7f7c43774cdd5f846cdc8cef5880096aa9b5c50cbe"],
    ["203 Byte (v12, voll)", sample(203), 65, "b78a24edb46eb6938f607834d7b8edeb31b31edf6ac3f763645d07ec653610c8"],
    ["204 Byte (v14)", sample(204), 73, "8bd79756bc66d14cab2c8a0fcb97b41674ffeba6a07fc506d63a0d6785360dd7"],
    ["258 Byte (v14, voll)", sample(258), 73, "4ac5eb08b095635515f11c54c715c4c80a97363bfa43fd73409c7eb015b25ef7"],
  ];

  it.each(cases)("%s: Größe und Modulmuster stimmen mit der Referenz", (_name, text, size, expected) => {
    const matrix = createQrMatrix(text);
    expect(matrix).toHaveLength(size);
    expect(hash(matrix)).toBe(expected);
  });

  it("nimmt bis zur Kapazität der größten Version Text an, darüber nicht", () => {
    expect(QR_MAX_BYTES).toBe(258);
    expect(qrFits(sample(258))).toBe(true);
    expect(qrFits(sample(259))).toBe(false);
    expect(() => createQrMatrix(sample(259))).toThrow("QR payload is too long.");
  });
});
