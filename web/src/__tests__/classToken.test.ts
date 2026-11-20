jest.mock("server-only", () => ({}), { virtual: true });

import { createHmac } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { signClassToken, verifyClassToken } from "@/lib/schule/classToken";
import { normalizeSchule, SCHULE_MAX_CHARS } from "@/lib/schule/youth";

const SECRET = "test-class-token-secret";
const DAY_MS = 24 * 60 * 60 * 1000;

function signRaw(payload: object, domain: string): string {
  const body =
    "z" +
    deflateRawSync(Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })))
      .toString("base64url");
  const mac = createHmac("sha256", SECRET).update(domain + body).digest("base64url");
  return `${body}.${mac}`;
}

describe("classToken", () => {
  beforeEach(() => {
    process.env.FEEDBACK_TOKEN_SECRET = SECRET;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("signiert und verifiziert im Roundtrip", () => {
    const token = signClassToken({ klasse: 9, plz: "28203" });
    const result = verifyClassToken(token);

    expect(result).toMatchObject({ klasse: 9, plz: "28203" });
    expect(result?.issuedAt).toEqual(expect.any(Number));
    expect(result?.bucketId).toMatch(/^[0-9a-f]{16}$/);
    expect(verifyClassToken(token)?.bucketId).toBe(result?.bucketId);
  });

  it("markiert nur PDF-Tokens mit delivery pdf, alles andere ist email", () => {
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203", delivery: "pdf" }))?.delivery).toBe("pdf");
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203", delivery: "email" }))?.delivery).toBe("email");
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203" }))?.delivery).toBe("email");
    expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", d: 1 }, "class-link-v1."))?.delivery).toBe("pdf");
    expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", d: "pdf" }, "class-link-v1."))).toBeNull();
  });

  it("liest die feste Ebene aus dem Kurzfeld l, ohne l gilt automatisch", () => {
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203", level: "Land" }))?.level).toBe("Land");
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203", level: "Bund" }))?.level).toBe("Bund");
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203" }))?.level).toBeUndefined();
    expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", l: "L" }, "class-link-v1."))?.level).toBe("Land");
    expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", l: "X" }, "class-link-v1."))).toBeNull();
    expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", l: "Land" }, "class-link-v1."))).toBeNull();
  });

  it("Token mit fester Ebene trägt einen gekürzten MAC und lehnt Manipulation ab", () => {
    const withLevel = signClassToken({ klasse: 9, plz: "28203", level: "Land" });
    const withoutLevel = signClassToken({ klasse: 9, plz: "28203" });
    expect(withLevel.split(".")[1]).toHaveLength(22);
    expect(withoutLevel.split(".")[1]).toHaveLength(43);

    const [body, mac] = withLevel.split(".");
    const flip = (s: string) => s.slice(0, -1) + (s.endsWith("A") ? "B" : "A");
    expect(verifyClassToken(`${flip(body!)}.${mac}`)).toBeNull();
    expect(verifyClassToken(`${body}.${flip(mac!)}`)).toBeNull();
    expect(verifyClassToken(`${body}.${mac!.slice(0, 10)}`)).toBeNull();
    // Ein anderer Token-Typ akzeptiert den gekürzten MAC nicht.
    expect(verifyFeedbackToken(withLevel)).toBeNull();
  });

  it("alter Token ohne l bleibt gültig und unverändert", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const legacy = signFeedbackToken({ v: 1, k: 9, p: "28203" }, {
      macDomain: "class-link-v1.",
      maxAgeSeconds: 14 * 24 * 60 * 60,
    });
    expect(verifyClassToken(legacy)).toMatchObject({ klasse: 9, plz: "28203", delivery: "email" });
    expect(signClassToken({ klasse: 9, plz: "28203", level: "Bund" })).not.toBe(legacy);
  });

  it("lässt E-Mail-Tokens unverändert und PDF-Tokens verschieden", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const legacy = signFeedbackToken({ v: 1, k: 9, p: "28203" }, {
      macDomain: "class-link-v1.",
      maxAgeSeconds: 14 * 24 * 60 * 60,
    });
    expect(signClassToken({ klasse: 9, plz: "28203", delivery: "email" })).toBe(legacy);
    expect(signClassToken({ klasse: 9, plz: "28203", delivery: "pdf" })).not.toBe(legacy);
  });

  it("gibt für verschiedene Tokens verschiedene Buckets zurück", () => {
    const a = verifyClassToken(signClassToken({ klasse: 8, plz: "28203" }));
    const b = verifyClassToken(signClassToken({ klasse: 9, plz: "28203" }));
    expect(a?.bucketId).not.toBe(b?.bucketId);
  });

  it("lehnt manipulierten Body oder MAC ab", () => {
    const token = signClassToken({ klasse: 9, plz: "28203" });
    const [body, mac] = token.split(".");
    const flip = (s: string) => s.slice(0, -1) + (s.endsWith("A") ? "B" : "A");

    expect(verifyClassToken(`${flip(body!)}.${mac}`)).toBeNull();
    expect(verifyClassToken(`${body}.${flip(mac!)}`)).toBeNull();
  });

  it("lehnt nach 15 Tagen ab, akzeptiert nach 13 Tagen", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const token = signClassToken({ klasse: 9, plz: "28203" });

    jest.setSystemTime(Date.now() + 13 * DAY_MS);
    expect(verifyClassToken(token)).not.toBeNull();

    jest.setSystemTime(Date.now() + 2 * DAY_MS);
    expect(verifyClassToken(token)).toBeNull();
  });

  it("lehnt einen normalen Feedback-Token ab", () => {
    const feedback = signFeedbackToken({ v: 1, k: 9, p: "28203" });
    expect(verifyClassToken(feedback)).toBeNull();
  });

  it("wird als Feedback-Token nicht akzeptiert", () => {
    const token = signClassToken({ klasse: 9, plz: "28203" });
    expect(verifyFeedbackToken(token)).toBeNull();
  });

  it("lehnt ungültige Klasse oder PLZ ab", () => {
    expect(verifyClassToken(signClassToken({ klasse: 4, plz: "28203" }))).toBeNull();
    expect(verifyClassToken(signClassToken({ klasse: 14, plz: "28203" }))).toBeNull();
    expect(verifyClassToken(signClassToken({ klasse: 9.5, plz: "28203" }))).toBeNull();
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "2820" }))).toBeNull();
    expect(verifyClassToken(signClassToken({ klasse: 9, plz: "abcde" }))).toBeNull();
    expect(verifyClassToken(signRaw({ v: 2, k: 9, p: "28203" }, "class-link-v1."))).toBeNull();
  });

  it("lehnt Müll, falsche Typen und zu lange Tokens ab, ohne zu werfen", () => {
    expect(verifyClassToken(undefined)).toBeNull();
    expect(verifyClassToken(null)).toBeNull();
    expect(verifyClassToken(42)).toBeNull();
    expect(verifyClassToken({})).toBeNull();
    expect(verifyClassToken("")).toBeNull();
    expect(verifyClassToken("nur-muell")).toBeNull();
    expect(verifyClassToken("a.b")).toBeNull();
    expect(verifyClassToken("x".repeat(513))).toBeNull();
  });

  it("gibt ohne FEEDBACK_TOKEN_SECRET null statt einer Exception zurück", () => {
    const token = signClassToken({ klasse: 9, plz: "28203" });
    delete process.env.FEEDBACK_TOKEN_SECRET;
    expect(verifyClassToken(token)).toBeNull();
  });

  describe("Schule und Ort", () => {
    it("läuft im Roundtrip mit und ohne Schulname", () => {
      const withSchule = signClassToken({ klasse: 9, plz: "28203", schule: "Oberschule am Leibnizplatz, Bremen" });
      expect(verifyClassToken(withSchule)?.schule).toBe("Oberschule am Leibnizplatz, Bremen");
      expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203" }))?.schule).toBeUndefined();
      expect(verifyClassToken(signClassToken({ klasse: 9, plz: "28203", schule: "  " }))?.schule).toBeUndefined();
    });

    it("lässt Tokens ohne Schulname unverändert (kein s-Feld, voller MAC)", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-10-01T10:00:00Z"));
      const legacy = signFeedbackToken({ v: 1, k: 9, p: "28203" }, {
        macDomain: "class-link-v1.",
        maxAgeSeconds: 14 * 24 * 60 * 60,
      });
      expect(signClassToken({ klasse: 9, plz: "28203" })).toBe(legacy);
      expect(signClassToken({ klasse: 9, plz: "28203", schule: undefined })).toBe(legacy);
    });

    it("kürzt den MAC, sobald ein Schulname im Token steht, und lehnt Manipulation ab", () => {
      const token = signClassToken({ klasse: 9, plz: "28203", schule: "Gymnasium Musterstadt" });
      const [body, mac] = token.split(".");
      expect(mac).toHaveLength(22);
      const flip = (s: string) => s.slice(0, -1) + (s.endsWith("A") ? "B" : "A");
      expect(verifyClassToken(`${flip(body!)}.${mac}`)).toBeNull();
      expect(verifyClassToken(`${body}.${flip(mac!)}`)).toBeNull();
    });

    it("ignoriert einen ungültigen Schulnamen im Token, das Token bleibt gültig", () => {
      const tooLong = verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", s: "x".repeat(SCHULE_MAX_CHARS + 1) }, "class-link-v1."));
      expect(tooLong).toMatchObject({ klasse: 9, plz: "28203" });
      expect(tooLong?.schule).toBeUndefined();
      expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", s: 42 }, "class-link-v1."))?.schule).toBeUndefined();
      expect(verifyClassToken(signRaw({ v: 1, k: 9, p: "28203", s: "" }, "class-link-v1."))?.schule).toBeUndefined();
    });

    it("trägt auch den längsten Schulnamen in Klasse 13 mit PDF und fester Ebene ins QR", () => {
      const { createQrMatrix } = jest.requireActual("@/lib/qr-code") as typeof import("@/lib/qr-code");
      const { APP_URL } = jest.requireActual("@/lib/config") as typeof import("@/lib/config");
      // Gemischte Umlaute und Buchstaben lassen sich kaum komprimieren.
      const alphabet = "äöüßÄÖÜabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ,.-";
      const names = [
        "ü".repeat(SCHULE_MAX_CHARS),
        Array.from({ length: SCHULE_MAX_CHARS }, (_, i) => alphabet[(i * 37 + 11) % alphabet.length]).join(""),
        "äöüßÄÖÜ".repeat(10).slice(0, SCHULE_MAX_CHARS),
      ];
      for (const schule of names) {
        expect(normalizeSchule(schule)).toBe(schule.trim().replace(/\s+/g, " "));
        const token = signClassToken({ klasse: 13, plz: "28203", delivery: "pdf", level: "Land", schule });
        expect(verifyClassToken(token)?.schule).toBe(schule.trim().replace(/\s+/g, " "));
        expect(() => createQrMatrix(`${APP_URL}/schule?k=${token}`)).not.toThrow();
      }
    });
  });

  describe("normalizeSchule", () => {
    it("bereinigt Leerraum, Steuerzeichen und spitze Klammern", () => {
      expect(normalizeSchule("  Oberschule\n am   Platz\t, Bremen ")).toBe("Oberschule am Platz , Bremen");
      expect(normalizeSchule("A\u0000B<script>")).toBe("A B script");
      expect(normalizeSchule("Scho\u0308ne Schule")).toBe("Schöne Schule");
    });

    it("lehnt leer, zu lang und Nicht-Text ab, ohne zu kürzen", () => {
      expect(normalizeSchule("")).toBeUndefined();
      expect(normalizeSchule("   ")).toBeUndefined();
      expect(normalizeSchule("x".repeat(SCHULE_MAX_CHARS))).toHaveLength(SCHULE_MAX_CHARS);
      expect(normalizeSchule("x".repeat(SCHULE_MAX_CHARS + 1))).toBeUndefined();
      expect(normalizeSchule(42)).toBeUndefined();
      expect(normalizeSchule(null)).toBeUndefined();
      expect(normalizeSchule({})).toBeUndefined();
    });
  });
});
