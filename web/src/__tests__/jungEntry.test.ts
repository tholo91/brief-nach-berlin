jest.mock("server-only", () => ({}), { virtual: true });

import { resolveJungEntry } from "@/components/jung/jungEntry";
import { buildJungHandoff, validateJungSubmit } from "@/components/jung/jungHandoff";
import { signClassToken } from "@/lib/schule/classToken";

describe("resolveJungEntry", () => {
  const verify = jest.fn();
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
  beforeEach(() => {
    verify.mockReset();
    process.env.FEEDBACK_TOKEN_SECRET = "test-class-token-secret";
  });
  afterAll(() => {
    process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
  });

  it("returns none without k", () => {
    expect(resolveJungEntry(undefined, verify)).toEqual({ status: "none" });
    expect(resolveJungEntry("", verify)).toEqual({ status: "none" });
    expect(verify).not.toHaveBeenCalled();
  });
  it("returns invalid for a bad token", () => {
    verify.mockReturnValue(null);
    expect(resolveJungEntry("kaputt", verify)).toEqual({ status: "invalid" });
  });
  it("returns klasse, plz and token but never bucketId", () => {
    verify.mockReturnValue({ klasse: 9, plz: "28195", issuedAt: 1, bucketId: "geheim" });
    const entry = resolveJungEntry(["tok", "zweites"], verify);
    expect(entry).toEqual({ status: "valid", klasse: 9, plz: "28195", token: "tok" });
    expect(JSON.stringify(entry)).not.toContain("geheim");
  });
  it("works with the real verifier", () => {
    const token = signClassToken({ klasse: 10, plz: "28195" });
    expect(resolveJungEntry(token)).toEqual({ status: "valid", klasse: 10, plz: "28195", token });
    expect(resolveJungEntry("kaputt")).toEqual({ status: "invalid" });
  });
});

describe("validateJungSubmit", () => {
  it("requires a Klasse first", () => {
    expect(validateJungSubmit({ klasse: null, issueText: "genug Text hier" })).toEqual({ ok: false, reason: "klasse" });
    expect(validateJungSubmit({ klasse: 6, issueText: "genug Text hier" })).toEqual({ ok: false, reason: "klasse" });
  });
  it("requires the minimum text length after trimming", () => {
    expect(validateJungSubmit({ klasse: 9, issueText: "   kurz   " })).toEqual({ ok: false, reason: "text-short" });
    expect(validateJungSubmit({ klasse: 9, issueText: "x".repeat(5001) })).toEqual({ ok: false, reason: "text-long" });
  });
  it("accepts and trims", () => {
    expect(validateJungSubmit({ klasse: 9, issueText: "  zehn Zeichen!  " })).toEqual({ ok: true, issueText: "zehn Zeichen!" });
  });
});

describe("buildJungHandoff", () => {
  it("builds the plain youth handoff without a class link", () => {
    expect(
      buildJungHandoff({ issueText: "Text", klasse: 8, entry: { status: "none" }, usedSpeechToText: false }),
    ).toEqual({ issueText: "Text", source: "landing", audience: "jung", klasse: 8 });
  });
  it("adds token and plz only for a valid class link, plus voice flag", () => {
    expect(
      buildJungHandoff({
        issueText: "Text",
        klasse: 9,
        entry: { status: "valid", klasse: 9, plz: "28195", token: "tok" },
        usedSpeechToText: true,
      }),
    ).toEqual({
      issueText: "Text",
      source: "landing",
      audience: "jung",
      klasse: 9,
      classToken: "tok",
      plz: "28195",
      usedSpeechToText: true,
    });
    expect(
      buildJungHandoff({ issueText: "T", klasse: 9, entry: { status: "invalid" }, usedSpeechToText: false }),
    ).not.toHaveProperty("classToken");
  });
});
