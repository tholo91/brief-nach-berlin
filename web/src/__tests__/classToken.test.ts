jest.mock("server-only", () => ({}), { virtual: true });

import { createHmac } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { signClassToken, verifyClassToken } from "@/lib/schule/classToken";

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
    expect(verifyClassToken(signClassToken({ klasse: 6, plz: "28203" }))).toBeNull();
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
});
