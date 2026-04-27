import { NextRequest, NextResponse } from "next/server";
import { mistral } from "@/lib/mistral";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";

export const maxDuration = 60;

function ipFromRequest(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB — Mistral's file size limit
const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/mpeg",
  "audio/x-m4a",
]);

export async function POST(req: NextRequest) {
  if (!process.env.MISTRAL_API_KEY) {
    console.error("Transcription error: MISTRAL_API_KEY is not set");
    return NextResponse.json(
      { error: "Transkription nicht konfiguriert." },
      { status: 503 }
    );
  }

  try {
    // Reject oversized uploads before reading the body (cost + memory protection)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audiodatei zu groß." }, { status: 413 });
    }

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

    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return NextResponse.json(
        { error: "Keine Audiodatei empfangen." },
        { status: 400 }
      );
    }

    // Secondary size check after formData parse (Content-Length may be absent)
    if (audioBlob.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audiodatei zu groß." }, { status: 413 });
    }

    // MIME type whitelist — reject anything that isn't a known audio format
    const rawMime = audioBlob.type || "";
    const baseMime = rawMime.split(";")[0]!.trim().toLowerCase();
    if (!ALLOWED_MIME.has(rawMime) && !ALLOWED_MIME.has(baseMime)) {
      return NextResponse.json({ error: "Nicht unterstütztes Audioformat." }, { status: 415 });
    }

    // Convert to ArrayBuffer then File to ensure consistent behavior across runtimes
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioFile = new File([arrayBuffer], "recording.webm", {
      type: audioBlob.type || "audio/webm",
    });

    const result = await mistral.audio.transcriptions.complete({
      model: "voxtral-mini-transcribe-2507",
      file: audioFile,
      language: "de",
    });

    const text = result.text;
    if (!text || typeof text !== "string") {
      console.error("Transcription returned no text:", result);
      return NextResponse.json(
        { error: "Transkription fehlgeschlagen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Transcription error:", errMsg);
    return NextResponse.json(
      { error: "Transkription fehlgeschlagen." },
      { status: 500 }
    );
  }
}
