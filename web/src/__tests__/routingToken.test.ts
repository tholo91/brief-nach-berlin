/**
 * Tests für den signierten Routing-Prefetch-Token (LOCK-10):
 * Signatur, TTL, Issue-Hash-Bindung.
 */

process.env.ROUTING_TOKEN_SECRET = "test-secret-fuer-routing-token";

// jest.mock von "server-only" — das Paket existiert nur im Next-Kontext.
jest.mock("server-only", () => ({}), { virtual: true });

// levelRouter (RoutingResultSchema) zieht @/lib/mistral — ESM-SDK stubben.
jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: jest.fn() } },
  withMistralRetry: <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: { letter: "mistral-large-latest", levelRouting: "mistral-small-latest" },
}));

import {
  signRoutingToken,
  verifyRoutingToken,
  hashRoutingIssue,
  normalizeRoutingIssue,
} from "@/lib/lookup/routingToken";
import type { RoutingResult } from "@/lib/lookup/levelRouter";

const routing: RoutingResult = {
  primary: { level: "Land", confidence: "high" },
  reasoning: "Bildungspolitik ist Ländersache.",
};

const issueText = "Lehrermangel an meiner Grundschule in NRW";

describe("routingToken", () => {
  it("verifiziert einen frisch signierten Token", () => {
    const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
    const verified = verifyRoutingToken(token, issueText);
    expect(verified).not.toBeNull();
    expect(verified?.primary.level).toBe("Land");
    expect(verified?.reasoning).toBe("Bildungspolitik ist Ländersache.");
  });

  it("toleriert Whitespace-Unterschiede im Anliegen (Normalisierung)", () => {
    const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
    expect(verifyRoutingToken(token, `  ${issueText.replace(" ", "   ")}  `)).not.toBeNull();
  });

  it("verwendet für Routing und Hash dieselbe normalisierte Eingabe", () => {
    expect(normalizeRoutingIssue(`  ${issueText.replace(" ", "   ")}  `)).toBe(issueText);
    expect(hashRoutingIssue(normalizeRoutingIssue(issueText))).toBe(hashRoutingIssue(issueText));
  });

  it("lehnt einen Token für einen anderen Anliegen-Text ab", () => {
    const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
    expect(verifyRoutingToken(token, "Ein ganz anderes Anliegen")).toBeNull();
  });

  it("lehnt manipulierte Tokens ab", () => {
    const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
    const [body, mac] = token.split(".");
    const tamperedBody = Buffer.from(
      JSON.stringify({
        v: 1,
        issueHash: hashRoutingIssue(issueText),
        routing: { primary: { level: "Bund", confidence: "high" }, reasoning: "x" },
        iat: Math.floor(Date.now() / 1000),
      }),
      "utf8"
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(verifyRoutingToken(`${tamperedBody}.${mac}`, issueText)).toBeNull();
    expect(verifyRoutingToken(`${body}.AAAA`, issueText)).toBeNull();
    expect(verifyRoutingToken("kaputt", issueText)).toBeNull();
  });

  it("lehnt abgelaufene Tokens ab (TTL 15 Minuten)", () => {
    const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + 16 * 60 * 1000;
      expect(verifyRoutingToken(token, issueText)).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("lehnt Tokens mit einem iat weit in der Zukunft ab", () => {
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + 60 * 1000;
      const token = signRoutingToken({ issueHash: hashRoutingIssue(issueText), routing });
      Date.now = realNow;
      expect(verifyRoutingToken(token, issueText)).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("lehnt übergroße Tokens vor der Signaturprüfung ab", () => {
    expect(verifyRoutingToken(`${"a".repeat(4096)}.b`, issueText)).toBeNull();
  });
});
