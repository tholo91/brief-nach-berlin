import { createHash } from "node:crypto";
import { createQrMatrix, QR_MAX_BYTES, qrFits } from "@/lib/qr-code";

// Erwartete Hashes stammen aus einer unabhängigen Referenz (Python-Paket "qrcode",
// Fehlerkorrektur Q, Byte-Modus, Maske 0), nicht aus diesem Encoder. Version 10 deckt
// zugleich ab, dass die bisherigen Codes unverändert bleiben. Kurze Links bekommen
// seit der Erweiterung die kleinen Versionen 3 bis 6.
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.";

function sample(bytes: number): string {
  let text = "https://www.brief-nach-berlin.de/schule?k=";
  for (let i = 0; text.length < bytes; i += 1) {
    text += ALPHABET[(i * 7 + Math.floor(i / 5)) % ALPHABET.length];
  }
  return text;
}

function compact(bytes: number): string {
  let text = "https://www.briefnachberlin.de/";
  for (let i = 0; text.length < bytes; i += 1) {
    text += "abcdefghijklmnopqrstuvwxyz0123456789"[(i * 7 + Math.floor(i / 5)) % 36];
  }
  return text;
}

function hash(matrix: boolean[][]): string {
  const rows = matrix.map((row) => row.map((cell) => (cell ? "1" : "0")).join(""));
  return createHash("sha256").update(rows.join("\n")).digest("hex");
}

describe("createQrMatrix Versionen", () => {
  const cases: Array<[string, string, number, string]> = [
    ["Kurzlink 31 Byte (v3)", compact(31), 29, "901430f52814856b94acf864aa394ff3c1bdeb5dc71a991a42c1514ef1a585e7"],
    ["Kurzlink 32 Byte (v3, voll)", compact(32), 29, "25ad6e9631c0241271abe9a24ffc34e55b6c373c40c3ad9fc157af69a427b656"],
    ["Kurzlink 33 Byte (v4)", compact(33), 33, "4ecd0f29384c8068a1fe0817cd4db94fd60eb0899d13b61f964d42cc8b648b54"],
    ["Kurzlink 46 Byte (v4, voll)", compact(46), 33, "e8e01f0bfaebbea9cdef7500ec552d40fa1c1fe9eab6cfbc2c8035bc077ce8a7"],
    ["Kurzlink 47 Byte (v5)", compact(47), 37, "478986d619e703f728e9e7a2e134ec6c806d17a4f4ecdedf01873159366432e4"],
    ["Kurzlink 60 Byte (v5, voll)", compact(60), 37, "942a86dc5171b81a6b2f3648bce93cf89e8cb2fd31260c0e567a051616affb4d"],
    ["Kurzlink 61 Byte (v6)", compact(61), 41, "c96fd57c0184878e190fbc53f3e8fb2ed2028a09d217790b3cf44b3c3dc916ea"],
    ["Kurzlink 74 Byte (v6, voll)", compact(74), 41, "1852da381d82f2b16aac930b499e2084b1357349213f182c8c72378fa5077ad5"],
    ["Kampagnen-Link 50 Byte (v5)", "https://www.brief-nach-berlin.de/kampagne/beispiel", 37, "a81bbdf07c03a5e62086bd10567a88fc313f7d09011e17bbc5dac3c813cc84ea"],
    ["75 Byte (v10, erste Byte-Länge in v10)", sample(75), 57, "7ccaa053a9b2e0b941ecec6e84237a14a45ac1bc168c6eb0cdb6bae6c52863ee"],
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
