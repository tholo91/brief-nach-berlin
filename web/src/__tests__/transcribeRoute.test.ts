jest.mock("@/lib/mistral", () => ({
  mistral: {
    audio: {
      transcriptions: {
        complete: jest.fn(),
      },
    },
  },
  MISTRAL_MODELS: { transcription: "voxtral-mini-latest" },
}));

jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  hashIdentifier: jest.fn(() => "test-ip"),
  LIMITS: { TRANSCRIBE_PER_IP: { max: 5, windowMs: 60_000 } },
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/transcribe/route";
import { mistral } from "@/lib/mistral";

function requestWithLanguage(language?: string) {
  const formData = new FormData();
  formData.append("audio", new Blob(["audio"], { type: "audio/webm" }), "recording.webm");
  if (language !== undefined) formData.append("language", language);
  return new NextRequest("http://localhost/api/transcribe", { method: "POST", body: formData });
}

describe("transcribe route language", () => {
  const complete = mistral.audio.transcriptions.complete as jest.Mock;

  beforeEach(() => {
    process.env.MISTRAL_API_KEY = "test-key";
    complete.mockReset().mockResolvedValue({ text: "Transcribed text" });
  });

  it("passes English through to Mistral", async () => {
    const response = await POST(requestWithLanguage("en"));

    expect(response.status).toBe(200);
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en" }),
      expect.any(Object)
    );
  });

  it("defaults requests without a language to German", async () => {
    const response = await POST(requestWithLanguage());

    expect(response.status).toBe(200);
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({ language: "de" }),
      expect.any(Object)
    );
  });

  it("rejects unsupported languages before sending audio to Mistral", async () => {
    const response = await POST(requestWithLanguage("tr"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ungültige Transkriptionssprache." });
    expect(complete).not.toHaveBeenCalled();
  });
});
