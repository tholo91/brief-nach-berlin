jest.mock("@/lib/generation/generateLetterVariant", () => ({ generateLetterVariant: jest.fn() }));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/email/sendVariantEmail", () => ({ sendVariantEmail: jest.fn() }));
jest.mock("@/lib/email/variantDebugPayload", () => ({ buildVariantDebugPayload: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: {
    LETTER_VARIANTS_PER_IP: { max: 10, windowMs: 3_600_000 },
    LETTER_VARIANTS_PER_EMAIL: { max: 3, windowMs: 86_400_000 },
  },
}));
jest.mock("@/lib/mistral", () => ({
  MistralProviderUnavailableError: class extends Error {},
}));

import { POST } from "@/app/api/generate-letter-variant/route";
import { generateLetterVariant } from "@/lib/generation/generateLetterVariant";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendVariantEmail } from "@/lib/email/sendVariantEmail";
import { checkRateLimit, hashIdentifier } from "@/lib/rateLimit";

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
