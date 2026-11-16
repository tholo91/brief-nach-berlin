jest.mock("server-only", () => ({}), { virtual: true });

import { createDataDeletionToken } from "@/lib/dataDeletion/token";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { createHmac } from "node:crypto";
import { OUTCOME_COHORTS } from "@/lib/rueckmeldung/cohort";
import {
  RUECKMELDUNG_COHORT,
  RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS,
  createRueckmeldungToken,
  verifyRueckmeldungToken,
} from "@/lib/rueckmeldung/token";

const SECRET = "test-feedback-secret";
const NOW = 1_800_000_000;
const b64url = (value: Buffer) => value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const forge = (payload: object) => {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  return `${body}.${b64url(createHmac("sha256", SECRET).update(`rueckmeldung-v1.${body}`).digest())}`;
};

describe("rueckmeldung token", () => {
  const original = process.env.FEEDBACK_TOKEN_SECRET;
  beforeEach(() => { process.env.FEEDBACK_TOKEN_SECRET = SECRET; });
  afterAll(() => { if (original === undefined) delete process.env.FEEDBACK_TOKEN_SECRET; else process.env.FEEDBACK_TOKEN_SECRET = original; });

  it("normalizes email and locks the payload to this cohort", () => {
    const token = createRueckmeldungToken(" Person@Example.org ", RUECKMELDUNG_COHORT, NOW);
    expect(verifyRueckmeldungToken(token, NOW)).toEqual({ email: "person@example.org", cohort: RUECKMELDUNG_COHORT });
  });
  it.each(OUTCOME_COHORTS)("round-trips email and cohort for %s", (cohort) => {
    const token = createRueckmeldungToken(" Person@Example.org ", cohort, NOW);
    expect(verifyRueckmeldungToken(token, NOW)).toEqual({ email: "person@example.org", cohort });
  });
  it("rejects a correctly signed payload with an unknown cohort", () => {
    expect(verifyRueckmeldungToken(forge({ v: 1, purpose: "rueckmeldung", email: "a@b.de", cohort: "lastcall_2026_12", iat: NOW }), NOW)).toBeNull();
  });
  it("rejects tokens across feedback and deletion MAC domains", () => {
    expect(verifyRueckmeldungToken(createDataDeletionToken("a@b.de", NOW), NOW)).toBeNull();
    expect(verifyRueckmeldungToken(signFeedbackToken({ purpose: "rueckmeldung", email: "a@b.de", cohort: RUECKMELDUNG_COHORT }), NOW)).toBeNull();
    expect(verifyFeedbackToken(createRueckmeldungToken("a@b.de"))).toBeNull();
  });
  it("expires after 90 days", () => {
    const token = createRueckmeldungToken("a@b.de", RUECKMELDUNG_COHORT, NOW);
    expect(RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS).toBe(90 * 24 * 60 * 60);
    expect(verifyRueckmeldungToken(token, NOW + RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS)).not.toBeNull();
    expect(verifyRueckmeldungToken(token, NOW + RUECKMELDUNG_TOKEN_MAX_AGE_SECONDS + 1)).toBeNull();
  });
  it("rejects a different MAC domain, wrong purpose, expired, future, and tampered tokens", () => {
    expect(verifyRueckmeldungToken(forge({ v: 1, purpose: "data_deletion", email: "a@b.de", cohort: RUECKMELDUNG_COHORT, iat: NOW }), NOW)).toBeNull();
    expect(verifyRueckmeldungToken(forge({ v: 1, purpose: "rueckmeldung", email: "a@b.de", cohort: "other", iat: NOW }), NOW)).toBeNull();
    expect(verifyRueckmeldungToken(createRueckmeldungToken("a@b.de", RUECKMELDUNG_COHORT, NOW + 31), NOW)).toBeNull();
    const valid = createRueckmeldungToken("a@b.de", RUECKMELDUNG_COHORT, NOW);
    expect(verifyRueckmeldungToken(`${valid.slice(0, -1)}x`, NOW)).toBeNull();
  });
});
