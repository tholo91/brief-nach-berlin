import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { letterVariantSchema, youthLetterVariantSchema } from "@/lib/validation/wizardSchemas";
import { generateLetterVariant } from "@/lib/generation/generateLetterVariant";
import { sendVariantEmail } from "@/lib/email/sendVariantEmail";
import { buildVariantDebugPayload } from "@/lib/email/variantDebugPayload";
import { checkRateLimit, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { MistralProviderUnavailableError } from "@/lib/mistral";
import { verifyClassToken } from "@/lib/schule/classToken";

export const maxDuration = 60;

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit mehrere Varianten angefordert. Bitte versuche es später erneut.";

function ipFromRequest(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function errorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Ungültige Eingabe.";
  const issues = (error as { issues?: { message?: string }[] }).issues;
  const first = issues?.find((issue) => issue.message)?.message;
  return first ?? "Ungültige Eingabe.";
}

function rateLimited(retryAfterSeconds?: number) {
  return NextResponse.json(
    { error: RATE_LIMIT_MESSAGE },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds ?? 60) } }
  );
}

async function handleYouth(req: NextRequest, body: unknown) {
  const parsed = youthLetterVariantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: errorMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  const bucketId = verifyClassToken(data.classToken)?.bucketId;
  const limit = bucketId
    ? checkRateLimit(
        `letter-variant:class:${bucketId}`,
        LIMITS.LETTER_VARIANTS_PER_CLASS.max,
        LIMITS.LETTER_VARIANTS_PER_CLASS.windowMs
      )
    : checkRateLimit(
        `letter-variant-youth:ip:${hashIdentifier(ipFromRequest(req))}`,
        LIMITS.LETTER_VARIANTS_PER_IP.max,
        LIMITS.LETTER_VARIANTS_PER_IP.windowMs
      );
  if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

  const wordCount = data.originalLetter.split(/\s+/).filter(Boolean).length;
  const result = await generateLetterVariant({
    originalLetter: data.originalLetter,
    changeRequest: data.changeRequest,
    toneLevel: 3,
    originalToneLevel: 3,
    wordWindow: { min: Math.round(wordCount * 0.7), max: Math.round(wordCount * 1.2) },
    rateLimitBudgetMs: 20_000,
  });
  return NextResponse.json({ success: true, letter: result.letter });
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if ((body as { mode?: unknown } | null)?.mode === "youth") {
      return await handleYouth(req, body);
    }
    const parsed = letterVariantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: errorMessage(parsed.error) }, { status: 400 });
    }

    const data = parsed.data;
    const ipHash = hashIdentifier(ipFromRequest(req));
    const ipLimit = checkRateLimit(
      `letter-variant:ip:${ipHash}`,
      LIMITS.LETTER_VARIANTS_PER_IP.max,
      LIMITS.LETTER_VARIANTS_PER_IP.windowMs
    );
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) } }
      );
    }

    const emailLimit = checkRateLimit(
      `letter-variant:email:${hashIdentifier(data.email.toLowerCase())}`,
      LIMITS.LETTER_VARIANTS_PER_EMAIL.max,
      LIMITS.LETTER_VARIANTS_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds ?? 60) } }
      );
    }

    const result = await generateLetterVariant({
      originalLetter: data.originalLetter,
      toneLevel: data.toneLevel,
      originalToneLevel: data.originalToneLevel,
      letterLength: data.letterLength,
      changeRequest: data.changeRequest,
    });

    const debugPayload = buildVariantDebugPayload(data, result);
    const emailResult = await sendVariantEmail({
      recipientEmail: data.email,
      letterText: result.letter,
      debug: debugPayload,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "E-Mail konnte nicht gesendet werden." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorId = randomUUID().slice(0, 8);
    console.error(`[generate-letter-variant] error [${errorId}]:`, error);
    if (error instanceof MistralProviderUnavailableError) {
      return NextResponse.json(
        {
          error:
            "Der KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut.",
          errorId,
        },
        { status: 503, headers: { "Retry-After": "60" } }
      );
    }
    return NextResponse.json(
      { error: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.", errorId },
      { status: 500 }
    );
  }
}
