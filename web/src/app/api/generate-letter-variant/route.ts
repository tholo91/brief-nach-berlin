import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { letterVariantSchema } from "@/lib/validation/wizardSchemas";
import { generateLetterVariant } from "@/lib/generation/generateLetterVariant";
import { moderateText } from "@/lib/moderation/moderateText";
import { sendVariantEmail } from "@/lib/email/sendVariantEmail";
import { buildVariantDebugPayload } from "@/lib/email/variantDebugPayload";
import { checkRateLimit, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { MistralProviderUnavailableError } from "@/lib/mistral";

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

export async function POST(req: NextRequest) {
  try {
    const parsed = letterVariantSchema.safeParse(await req.json());
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
      changeRequest: data.changeRequest,
    });

    const outputModeration = await moderateText(result.letter);
    if (outputModeration.flagged) {
      return NextResponse.json(
        { error: "Beim Anpassen deines Briefes ist ein Problem aufgetreten. Bitte prüfe den eingefügten Text und versuche es erneut." },
        { status: 422 }
      );
    }

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
            "Unser KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut.",
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
