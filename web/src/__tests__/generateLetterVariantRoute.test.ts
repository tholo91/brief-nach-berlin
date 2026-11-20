jest.mock("@/lib/generation/generateLetterVariant", () => ({ generateLetterVariant: jest.fn() }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/email/sendVariantEmail", () => ({ sendVariantEmail: jest.fn() }));
jest.mock("@/lib/email/variantDebugPayload", () => ({ buildVariantDebugPayload: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: {
    LETTER_VARIANTS_PER_IP: { max: 10, windowMs: 3_600_000 },
    LETTER_VARIANTS_PER_CLASS: { max: 40, windowMs: 3_600_000 },
    LETTER_VARIANTS_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
  },
}));
jest.mock("@/lib/schule/classToken", () => ({ verifyClassToken: jest.fn() }));
jest.mock("@/lib/mistral", () => ({
  MistralProviderUnavailableError: class extends Error {},
}));

import { POST } from "@/app/api/generate-letter-variant/route";
import { generateLetterVariant } from "@/lib/generation/generateLetterVariant";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendVariantEmail } from "@/lib/email/sendVariantEmail";
import { checkRateLimit, hashIdentifier } from "@/lib/rateLimit";
import { verifyClassToken } from "@/lib/schule/classToken";

function requestWith(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
  } as Parameters<typeof POST>[0];
}

describe("generate-letter-variant personal moderation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
  });

  it("versendet eine persönliche Variante, ohne moderateText aufzurufen", async () => {
    jest.mocked(generateLetterVariant).mockResolvedValue({
      letter: "Sachlich umformulierte persönliche Variante.",
    } as never);
    jest.mocked(moderateText).mockResolvedValue({
      flagged: true,
      categories: ["hate_and_discrimination"],
    });
    jest.mocked(sendVariantEmail).mockResolvedValue({ success: true, messageId: "id" });

    const response = await POST(requestWith({
      email: "test@example.org",
      originalLetter: "A".repeat(500),
      toneLevel: 5,
      originalToneLevel: 3,
      letterLength: "1.5",
      changeRequest: "Bitte meine Wut sachlich und respektvoll ausdrücken.",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(moderateText).not.toHaveBeenCalled();
    expect(sendVariantEmail).toHaveBeenCalled();
  });
});

describe("generate-letter-variant youth mode", () => {
  const youthBody = {
    mode: "youth",
    originalLetter: "wort ".repeat(100).trim(),
    changeRequest: "Bitte einfacher schreiben.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(hashIdentifier).mockReturnValue("hashed");
    jest.mocked(verifyClassToken).mockReturnValue(null);
    jest.mocked(generateLetterVariant).mockResolvedValue({ letter: "Neuer Brief." } as never);
  });

  it("gibt den Brief direkt zurück, ohne E-Mail", async () => {
    const response = await POST(requestWith(youthBody));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, letter: "Neuer Brief." });
    expect(sendVariantEmail).not.toHaveBeenCalled();
    expect(generateLetterVariant).toHaveBeenCalledWith(
      expect.objectContaining({
        wordWindow: { min: 70, max: 120 },
        rateLimitBudgetMs: 20_000,
        toneLevel: 3,
      })
    );
    expect(checkRateLimit).toHaveBeenCalledWith("letter-variant-youth:ip:hashed", 10, 3_600_000);
  });

  it("antwortet mit 400, wenn der Änderungswunsch fehlt", async () => {
    const response = await POST(requestWith({ ...youthBody, changeRequest: undefined }));
    expect(response.status).toBe(400);
    expect(generateLetterVariant).not.toHaveBeenCalled();
  });

  it("nutzt den Klassen-Bucket bei gültigem Klassen-Token", async () => {
    jest.mocked(verifyClassToken).mockReturnValue({ bucketId: "b1" } as never);
    const response = await POST(requestWith({ ...youthBody, classToken: "tok" }));
    expect(response.status).toBe(200);
    expect(checkRateLimit).toHaveBeenCalledWith("letter-variant:class:b1", 40, 3_600_000);
  });

  it("antwortet mit 429 bei erreichtem Limit", async () => {
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterSeconds: 30 });
    const response = await POST(requestWith(youthBody));
    expect(response.status).toBe(429);
    expect(generateLetterVariant).not.toHaveBeenCalled();
  });
});
