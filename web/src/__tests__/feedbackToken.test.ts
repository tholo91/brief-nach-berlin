import { createHmac } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";

const SECRET = "test-feedback-secret";
const NOW = 1_800_000_000;

const REALISTIC_PAYLOAD = {
  toneLevel: 3,
  toneLabel: "sachlich-bestimmt",
  letterLengthKey: "standard",
  letterLengthMin: 200,
  letterLengthMax: 280,
  issueTextLength: 612,
  wordCount: 247,
  wordCountInRange: true,
  fallbackUsed: false,
  retried: false,
  politicalLevel: "bundestag",
  representativeName: "Dr. Annalena Müller-Schröder",
  representativeWahlkreis: "Bremen I",
  recipientRegion: "Bremen",
  representativeLevel: "bundestag",
  representativeParty: "BÜNDNIS 90/DIE GRÜNEN",
  representativeKind: "direct",
  mdbContextUsed: true,
  availablePoliticianCount: 7,
  model: "mistral-large-latest",
  temperature: 0.7,
  generationMs: 8421,
  hasParty: true,
  hasNgo: false,
  usedSpeechToText: false,
  tipsOpened: true,
  userEmail: "erika.mustermann@example.org",
  politicianId: 123456,
  plz: "28203",
  letterId: "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b",
  codeVersion: "847635c2afec6516922b559a669162bdac034b85",
  campaignSlug: "bremen-rauchfrei-2026",
  routedPrimaryLevel: "bundestag",
  routedPrimaryConfidence: "high",
  wasOverridden: false,
  selectedLevel: "bundestag",
};

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signRaw(body: string): string {
  const mac = b64url(createHmac("sha256", SECRET).update(body).digest());
  return `${body}.${mac}`;
}

function legacyToken(payload: object): string {
  return signRaw(b64url(Buffer.from(JSON.stringify({ ...payload, iat: NOW }), "utf8")));
}

describe("feedback token", () => {
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;

  beforeEach(() => {
    process.env.FEEDBACK_TOKEN_SECRET = SECRET;
    jest.spyOn(Date, "now").mockReturnValue(NOW * 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
    else process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
  });

  it("round-trips every payload field plus iat", () => {
    const token = signFeedbackToken(REALISTIC_PAYLOAD);
    expect(verifyFeedbackToken(token)).toEqual({ ...REALISTIC_PAYLOAD, iat: NOW });
  });

  it("emits a z-prefixed URL-safe token with exactly one dot", () => {
    const token = signFeedbackToken(REALISTIC_PAYLOAD);
    expect(token).toMatch(/^z[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("still verifies legacy uncompressed tokens", () => {
    const token = legacyToken(REALISTIC_PAYLOAD);
    expect(token.startsWith("eyJ")).toBe(true);
    expect(verifyFeedbackToken(token)).toEqual({ ...REALISTIC_PAYLOAD, iat: NOW });
  });

  it("is at most 70% of the legacy length and keeps the star link under 1000 chars", () => {
    const token = signFeedbackToken(REALISTIC_PAYLOAD);
    const legacy = legacyToken(REALISTIC_PAYLOAD);
    expect(token.length).toBeLessThanOrEqual(legacy.length * 0.7);
    expect(`https://brief-nach-berlin.de/feedback?r=5&t=${token}&s=2`.length).toBeLessThan(1000);
  });

  it("rejects a tampered body, a tampered MAC and a different secret", () => {
    const token = signFeedbackToken(REALISTIC_PAYLOAD);
    const flip = (t: string, i: number) =>
      t.slice(0, i) + (t[i] === "A" ? "B" : "A") + t.slice(i + 1);
    expect(verifyFeedbackToken(flip(token, 5))).toBeNull();
    expect(verifyFeedbackToken(flip(token, token.length - 3))).toBeNull();

    process.env.FEEDBACK_TOKEN_SECRET = "another-secret";
    const foreign = signFeedbackToken(REALISTIC_PAYLOAD);
    process.env.FEEDBACK_TOKEN_SECRET = SECRET;
    expect(verifyFeedbackToken(foreign)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyFeedbackToken("")).toBeNull();
    expect(verifyFeedbackToken("zabcdef")).toBeNull();
    expect(verifyFeedbackToken("zabcdef.")).toBeNull();
    expect(verifyFeedbackToken(signRaw("z"))).toBeNull();
  });

  it("rejects validly signed garbage without throwing", () => {
    expect(verifyFeedbackToken(signRaw("z" + b64url(Buffer.from("not deflate data"))))).toBeNull();
    expect(verifyFeedbackToken(signRaw(b64url(Buffer.from("not json"))))).toBeNull();
  });

  it("rejects a validly signed decompression bomb", () => {
    const bomb = signRaw("z" + b64url(deflateRawSync(Buffer.alloc(200_000, 0x20))));
    expect(() => verifyFeedbackToken(bomb)).not.toThrow();
    expect(verifyFeedbackToken(bomb)).toBeNull();
  });

  it("rejects expired tokens and tokens without iat", () => {
    const token = signFeedbackToken(REALISTIC_PAYLOAD);
    (Date.now as jest.Mock).mockReturnValue((NOW + 91 * 24 * 60 * 60) * 1000);
    expect(verifyFeedbackToken(token)).toBeNull();

    const noIat = signRaw("z" + b64url(deflateRawSync(Buffer.from(JSON.stringify({ a: 1 })))));
    expect(verifyFeedbackToken(noIat)).toBeNull();
  });
});
