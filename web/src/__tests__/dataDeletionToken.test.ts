jest.mock("server-only", () => ({}), { virtual: true });

import { createHmac } from "node:crypto";
import {
  DATA_DELETION_TOKEN_MAX_AGE_SECONDS,
  createDataDeletionToken,
  verifyDataDeletionToken,
} from "@/lib/dataDeletion/token";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { createLetterSignalContext } from "@/lib/letterSignals/token";

const SECRET = "test-feedback-secret";
const NOW = 1_800_000_000;

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Rebuilds a validly signed token with the same domain-separated scheme.
function forge(envelope: object): string {
  const body = b64url(Buffer.from(JSON.stringify(envelope), "utf8"));
  const mac = b64url(createHmac("sha256", SECRET).update(`data-deletion-v1.${body}`).digest());
  return `${body}.${mac}`;
}

describe("data deletion token", () => {
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
  const originalLetterSecret = process.env.LETTER_SIGNAL_TOKEN_SECRET;

  beforeEach(() => {
    process.env.FEEDBACK_TOKEN_SECRET = SECRET;
    delete process.env.LETTER_SIGNAL_TOKEN_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
    else process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
    if (originalLetterSecret === undefined) delete process.env.LETTER_SIGNAL_TOKEN_SECRET;
    else process.env.LETTER_SIGNAL_TOKEN_SECRET = originalLetterSecret;
  });

  it("round-trips and normalizes the email", () => {
    const token = createDataDeletionToken("  Person@Example.org ", NOW);
    expect(verifyDataDeletionToken(token, NOW)).toEqual({ email: "person@example.org" });
  });

  it("uses a 90 day lifetime", () => {
    expect(DATA_DELETION_TOKEN_MAX_AGE_SECONDS).toBe(90 * 24 * 60 * 60);
  });

  it("accepts the token exactly at the max age and rejects one second later", () => {
    const token = createDataDeletionToken("a@b.de", NOW);
    expect(verifyDataDeletionToken(token, NOW + DATA_DELETION_TOKEN_MAX_AGE_SECONDS)).toEqual({ email: "a@b.de" });
    expect(verifyDataDeletionToken(token, NOW + DATA_DELETION_TOKEN_MAX_AGE_SECONDS + 1)).toBeNull();
  });

  it("rejects a token issued more than 30 seconds in the future", () => {
    const token = createDataDeletionToken("a@b.de", NOW + 31);
    expect(verifyDataDeletionToken(token, NOW)).toBeNull();
    const withinSkew = createDataDeletionToken("a@b.de", NOW + 30);
    expect(verifyDataDeletionToken(withinSkew, NOW)).toEqual({ email: "a@b.de" });
  });

  it("rejects a tampered body or MAC", () => {
    const token = createDataDeletionToken("a@b.de", NOW);
    const [body, mac] = token.split(".");
    const flip = (value: string) => (value[0] === "A" ? "B" : "A") + value.slice(1);
    expect(verifyDataDeletionToken(`${flip(body)}.${mac}`, NOW)).toBeNull();
    expect(verifyDataDeletionToken(`${body}.${flip(mac)}`, NOW)).toBeNull();
  });

  it("rejects malformed shapes", () => {
    const token = createDataDeletionToken("a@b.de", NOW);
    const [body, mac] = token.split(".");
    expect(verifyDataDeletionToken(body, NOW)).toBeNull();
    expect(verifyDataDeletionToken(`.${mac}`, NOW)).toBeNull();
    expect(verifyDataDeletionToken(`${body}.`, NOW)).toBeNull();
    expect(verifyDataDeletionToken("", NOW)).toBeNull();
    expect(verifyDataDeletionToken(`${"a".repeat(4100)}.${mac}`, NOW)).toBeNull();
  });

  it("rejects signed envelopes with a wrong purpose, version or email", () => {
    expect(verifyDataDeletionToken(forge({ v: 1, purpose: "data_deletion", email: "a@b.de", iat: NOW }), NOW))
      .toEqual({ email: "a@b.de" });
    expect(verifyDataDeletionToken(forge({ v: 1, purpose: "feedback", email: "a@b.de", iat: NOW }), NOW)).toBeNull();
    expect(verifyDataDeletionToken(forge({ v: 2, purpose: "data_deletion", email: "a@b.de", iat: NOW }), NOW)).toBeNull();
    expect(verifyDataDeletionToken(forge({ v: 1, purpose: "data_deletion", email: "not-an-email", iat: NOW }), NOW)).toBeNull();
  });

  it("is domain separated from feedback tokens in both directions", () => {
    const feedbackShaped = signFeedbackToken({ v: 1, purpose: "data_deletion", email: "a@b.de" });
    expect(verifyDataDeletionToken(feedbackShaped)).toBeNull();
    expect(verifyFeedbackToken(createDataDeletionToken("a@b.de"))).toBeNull();
  });

  it("rejects a letter-signal context token", () => {
    process.env.LETTER_SIGNAL_TOKEN_SECRET = SECRET;
    const contextToken = createLetterSignalContext({
      letterId: "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0",
      plz: "28203",
      bundeslandKey: "HB",
      politicalLevel: "Land",
      recipientKind: "landesregierung",
      issueBinding: "b".repeat(64),
      topicCategories: ["bildung"],
      topicLabels: ["Lehrermangel"],
      topicTaxonomyVersion: "v1",
      topicSource: "routing",
      topicModel: "mistral-small-latest",
      campaignSlug: null,
      emailLookupHash: "c".repeat(64),
    });
    expect(verifyDataDeletionToken(contextToken)).toBeNull();
  });

  it("throws on create and returns null on verify when no secret is set", () => {
    const token = createDataDeletionToken("a@b.de", NOW);
    delete process.env.FEEDBACK_TOKEN_SECRET;
    expect(() => createDataDeletionToken("a@b.de", NOW)).toThrow();
    expect(verifyDataDeletionToken(token, NOW)).toBeNull();
  });
});
