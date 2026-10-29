jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/rateLimit", () => {
  const actual = jest.requireActual("@/lib/rateLimit");
  return { ...actual, getClientIp: jest.fn() };
});

import { createClassLinkAction } from "@/lib/actions/createClassLink";
import { APP_URL } from "@/lib/config";
import { verifyClassToken } from "@/lib/schule/classToken";
import { createQrMatrix } from "@/lib/qr-code";
import { getClientIp } from "@/lib/rateLimit";

const mockedIp = getClientIp as jest.Mock;
let ipCounter = 0;

beforeAll(() => {
  process.env.FEEDBACK_TOKEN_SECRET = "test-class-link-secret";
});

beforeEach(() => {
  ipCounter += 1;
  mockedIp.mockResolvedValue(`10.0.0.${ipCounter}`);
});

describe("createClassLinkAction", () => {
  it("returns a verifiable link that fits the QR code", async () => {
    const res = await createClassLinkAction({ klasse: 9, plz: "10115" });
    if ("error" in res) throw new Error(res.error);
    const prefix = `${APP_URL}/schule?k=`;
    expect(res.url.startsWith(prefix)).toBe(true);
    expect(verifyClassToken(res.url.slice(prefix.length))).toMatchObject({
      klasse: 9,
      plz: "10115",
    });
    expect(Buffer.byteLength(res.url)).toBeLessThanOrEqual(151);
    expect(() => createQrMatrix(res.url)).not.toThrow();
    expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it.each([
    [6, "10115"],
    [14, "10115"],
    [9.5, "10115"],
    [9, "1234"],
    [9, "abcde"],
  ])("rejects klasse %p plz %p", async (klasse, plz) => {
    expect(await createClassLinkAction({ klasse, plz })).toMatchObject({
      error: "invalid_input",
    });
  });

  it("rejects unknown but well-formed plz", async () => {
    expect(await createClassLinkAction({ klasse: 9, plz: "00000" })).toMatchObject({
      error: "unknown_plz",
    });
  });

  it("rate limits the 11th call per IP", async () => {
    for (let i = 0; i < 10; i += 1) {
      const ok = await createClassLinkAction({ klasse: 8, plz: "10115" });
      expect("url" in ok).toBe(true);
    }
    expect(await createClassLinkAction({ klasse: 8, plz: "10115" })).toMatchObject({
      error: "rate_limited",
    });
  });
});
