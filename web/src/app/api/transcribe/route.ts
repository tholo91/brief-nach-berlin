import { NextRequest, NextResponse } from "next/server";
import { mistral } from "@/lib/mistral";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";

function ipFromRequest(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit transcription per IP — Voxtral is the most expensive
    // per-call surface and a prime target for abuse.
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(
      `transcribe:ip:${ip}`,
      LIMITS.TRANSCRIBE_PER_IP.max,
      LIMITS.TRANSCRIBE_PER_IP.windowMs
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Transkriptionen in kurzer Zeit. Bitte später erneut." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;

    // T-02-05: Validate that FormData contains "audio" field and it is a Blob
    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return NextResponse.json(
        { error: "Keine Audiodatei empfangen." },
        { status: 400 }
      );
    }

    // T-02-06: Vercel Hobby tier enforces 4.5MB body limit — no additional
    // server-side check needed; oversized requests are rejected before reaching here.

    // Use Mistral's dedicated audio transcription endpoint (Voxtral)
    // MISTRAL_API_KEY is accessed server-side only — never exposed to client (T-02-07)
    const result = await mistral.audio.transcriptions.complete({
      model: "voxtral-mini-latest",
      file: audioBlob,
      language: "de",
    });

    const text = result.text;
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Transkription fehlgeschlagen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Transkription fehlgeschlagen." },
      { status: 500 }
    );
  }
}
