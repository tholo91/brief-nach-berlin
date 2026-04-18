import { NextRequest, NextResponse } from "next/server";
import { mistral } from "@/lib/mistral";

export async function POST(req: NextRequest) {
  try {
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
