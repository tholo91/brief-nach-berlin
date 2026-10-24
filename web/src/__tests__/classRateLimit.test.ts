process.env.FEEDBACK_TOKEN_SECRET = "test-class-rate-limit-secret";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("@/lib/lookup/resolveRecipient", () => ({ resolveRecipientSelection: jest.fn() }));
jest.mock("@/lib/lookup/routingToken", () => ({ verifyRoutingToken: jest.fn() }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/generation/generateLetter", () => ({ generateLetter: jest.fn() }));
jest.mock("@/lib/enrichment/fetchMdbContext", () => ({ fetchMdbContext: jest.fn() }));
jest.mock("@/lib/email/sendLetterEmail", () => ({
  sendLetterEmail: jest.fn(),
  prepareLetterEmail: jest.fn(),
}));
jest.mock("@/lib/email/sendFollowupEmail", () => ({ sendFollowupEmail: jest.fn() }));
jest.mock("@/lib/email/computeFollowupSlot", () => ({ computeFollowupSlot: jest.fn() }));
jest.mock("@/lib/email/buildDebugPayload", () => ({ buildDebugPayload: jest.fn() }));
jest.mock("@/lib/counter", () => ({ incrementLetterCounters: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => ({ getPublicCampaignBySlug: jest.fn() }));
jest.mock("@/lib/campaigns/milestoneNotification", () => ({
  claimAndSendCampaignMilestone: jest.fn(),
}));
jest.mock("@/lib/campaigns/globalLetterMilestoneNotification", () => ({
  claimAndSendGlobalLetterMilestone: jest.fn(),
}));
jest.mock("@/lib/actions/letterSignals", () => ({
  markLetterSignalGeneratedAction: jest.fn(async () => ({ ok: true })),
}));
jest.mock("@/lib/mistral", () => ({
  MistralProviderUnavailableError: class extends Error {},
  MistralStageError: class extends Error {},
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/generate-letter/route";
import { POST as transcribePOST } from "@/app/api/transcribe/route";
import { getPublicCampaignBySlug } from "@/lib/campaigns/repository";
import { checkOriginRateLimit, checkRateLimit, hashIdentifier } from "@/lib/rateLimit";
import { signClassToken, verifyClassToken } from "@/lib/schule/classToken";

const DAY_MS = 24 * 60 * 60 * 1000;

// Jeder Test nutzt eigene IPs/Tokens, damit sich die Buckets (Modul-Map) nicht überschneiden.
let counter = 0;
function uniqueIp(): string {
  counter += 1;
  return `ip-hash-${counter}`;
}

function classTokenFor(plz: string): string {
  const token = signClassToken({ klasse: 9, plz });
  return token;
}

function bucketIdOf(token: string): string {
  const result = verifyClassToken(token);
  if (!result) throw new Error("Token im Test ungültig");
  return result.bucketId;
}

function tamper(token: string): string {
  const [body, mac] = token.split(".");
  return `${body}.${mac!.slice(0, -1)}${mac!.endsWith("A") ? "B" : "A"}`;
}

describe("checkOriginRateLimit", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("lässt 25 Briefe einer Klasse hinter einer IP durch (je zwei Checks, eigene E-Mail)", () => {
    const token = classTokenFor("28203");
    const ip = uniqueIp();
    for (let i = 0; i < 25; i++) {
      const classBucketId = verifyClassToken(token)?.bucketId;
      expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(true);
      expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(true);
      expect(checkRateLimit(`letter:email:${hashIdentifier(`schueler${i}@example.org`)}`, 3, DAY_MS).allowed).toBe(true);
    }
  });

  it("blockiert ohne Token den 11. Check derselben IP", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      expect(checkOriginRateLimit("letter", ip).allowed).toBe(true);
    }
    const blocked = checkOriginRateLimit("letter", ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("blockiert die Klasse erst nach 80 Checks", () => {
    const classBucketId = bucketIdOf(classTokenFor("28204"));
    const ip = uniqueIp();
    for (let i = 0; i < 80; i++) {
      expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(false);
    // Der IP-Bucket derselben IP bleibt unberührt.
    expect(checkOriginRateLimit("letter", ip).allowed).toBe(true);
  });

  it("fällt bei manipuliertem Token auf den IP-Bucket zurück", () => {
    const token = tamper(classTokenFor("28205"));
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      expect(checkOriginRateLimit("letter", ip, verifyClassToken(token)?.bucketId).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("letter", ip, verifyClassToken(token)?.bucketId).allowed).toBe(false);
  });

  it("fällt bei abgelaufenem Token auf den IP-Bucket zurück", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const token = classTokenFor("28206");
    jest.setSystemTime(Date.now() + 15 * DAY_MS);
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      expect(checkOriginRateLimit("letter", ip, verifyClassToken(token)?.bucketId).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("letter", ip, verifyClassToken(token)?.bucketId).allowed).toBe(false);
  });

  it("hält das E-Mail-Limit auch mit Klassen-Token ein (4. Check blockiert)", () => {
    const classBucketId = bucketIdOf(classTokenFor("28207"));
    const ip = uniqueIp();
    const emailKey = `letter:email:${hashIdentifier("gleiche@example.org")}`;
    for (let i = 0; i < 3; i++) {
      expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(true);
      expect(checkRateLimit(emailKey, 3, DAY_MS).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("letter", ip, classBucketId).allowed).toBe(true);
    expect(checkRateLimit(emailKey, 3, DAY_MS).allowed).toBe(false);
  });

  it("nutzt für Routing-Prefetch einen eigenen Klassen-Bucket (60) und sonst den IP-Bucket (10)", () => {
    const classBucketId = bucketIdOf(classTokenFor("28208"));
    const ip = uniqueIp();
    for (let i = 0; i < 60; i++) {
      expect(checkOriginRateLimit("routing-prefetch", ip, classBucketId).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("routing-prefetch", ip, classBucketId).allowed).toBe(false);

    for (let i = 0; i < 10; i++) {
      expect(checkOriginRateLimit("routing-prefetch", ip).allowed).toBe(true);
    }
    expect(checkOriginRateLimit("routing-prefetch", ip).allowed).toBe(false);
  });

  it("trennt Brief- und Prefetch-Bucket", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) checkOriginRateLimit("letter", ip);
    expect(checkOriginRateLimit("letter", ip).allowed).toBe(false);
    expect(checkOriginRateLimit("routing-prefetch", ip).allowed).toBe(true);
  });
});

describe("POST /api/generate-letter mit Klassen-Token", () => {
  beforeEach(() => {
    jest.mocked(getPublicCampaignBySlug).mockResolvedValue(null);
  });

  // Beendet nach dem Rate-Limit mit 400 (Kampagne nicht aktiv): 400 = durchgelassen, 429 = blockiert.
  function request(ip: string, email: string, classToken?: string) {
    return {
      json: async () => ({
        wizardData: {
          plz: "28203",
          email,
          issueText: "Der Spielplatz an unserer Schule ist seit Monaten gesperrt.",
          letterLength: "1.5",
          toneLevel: 3,
          campaign: { slug: "nicht-aktiv", title: "Test" },
          ...(classToken ? { classToken } : {}),
        },
        selection: { kind: "rathaus" },
      }),
      headers: new Headers({ "x-forwarded-for": ip }),
    } as unknown as Parameters<typeof POST>[0];
  }

  it("lässt 25 Requests mit Klassen-Token von einer IP durch", async () => {
    const token = classTokenFor("28203");
    const ip = "198.51.100.1";
    for (let i = 0; i < 25; i++) {
      const response = await POST(request(ip, `klasse${i}@example.org`, token));
      expect(response.status).toBe(400);
    }
  });

  it("antwortet ohne Token beim 11. Request derselben IP mit 429", async () => {
    const ip = "198.51.100.2";
    for (let i = 0; i < 10; i++) {
      const response = await POST(request(ip, `einzeln${i}@example.org`));
      expect(response.status).toBe(400);
    }
    const blocked = await POST(request(ip, "einzeln10@example.org"));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toEqual(expect.any(String));
  });

  it("behandelt einen manipulierten Token wie keinen Token", async () => {
    const token = tamper(classTokenFor("28203"));
    const ip = "198.51.100.3";
    for (let i = 0; i < 10; i++) {
      const response = await POST(request(ip, `fake${i}@example.org`, token));
      expect(response.status).toBe(400);
    }
    const blocked = await POST(request(ip, "fake10@example.org", token));
    expect(blocked.status).toBe(429);
  });

  it("hält das E-Mail-Limit auch mit Klassen-Token ein", async () => {
    const token = classTokenFor("28203");
    const ip = "198.51.100.4";
    for (let i = 0; i < 3; i++) {
      const response = await POST(request(ip, "mehrfach@example.org", token));
      expect(response.status).toBe(400);
    }
    const blocked = await POST(request(ip, "mehrfach@example.org", token));
    expect(blocked.status).toBe(429);
  });
});

describe("POST /api/transcribe mit Klassen-Token", () => {
  beforeAll(() => {
    process.env.MISTRAL_API_KEY = "test-key";
  });

  // Ohne Audiodatei endet der Request nach dem Rate-Limit mit 400: 400 = durchgelassen, 429 = blockiert.
  function request(ip: string, classToken?: string) {
    const formData = new FormData();
    if (classToken) formData.append("classToken", classToken);
    return new NextRequest("http://localhost/api/transcribe", {
      method: "POST",
      body: formData,
      headers: { "x-forwarded-for": ip },
    });
  }

  it("lässt mit Klassen-Token den 31. Request einer IP durch", async () => {
    const token = classTokenFor("28203");
    const ip = "198.51.100.11";
    for (let i = 0; i < 31; i++) {
      expect((await transcribePOST(request(ip, token))).status).toBe(400);
    }
  });

  it("blockiert mit manipuliertem Token den 31. Request (IP-Bucket)", async () => {
    const token = tamper(classTokenFor("28203"));
    const ip = "198.51.100.12";
    for (let i = 0; i < 30; i++) {
      expect((await transcribePOST(request(ip, token))).status).toBe(400);
    }
    expect((await transcribePOST(request(ip, token))).status).toBe(429);
  });

  it("blockiert ohne Token den 31. Request (IP-Bucket)", async () => {
    const ip = "198.51.100.13";
    for (let i = 0; i < 30; i++) {
      expect((await transcribePOST(request(ip))).status).toBe(400);
    }
    expect((await transcribePOST(request(ip))).status).toBe(429);
  });
});
