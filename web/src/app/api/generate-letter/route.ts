import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import type { WizardData } from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { fetchMdbContext } from "@/lib/enrichment/fetchMdbContext";
import { sendLetterEmail, prepareLetterEmail } from "@/lib/email/sendLetterEmail";
import { sendFollowupEmail } from "@/lib/email/sendFollowupEmail";
import { computeFollowupSlot } from "@/lib/email/computeFollowupSlot";
import { buildDebugPayload } from "@/lib/email/buildDebugPayload";
import { checkRateLimit, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { MistralProviderUnavailableError } from "@/lib/mistral";
import { incrementLetterCounters } from "@/lib/counter";

export const maxDuration = 60;

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit viele Briefe erstellt. Bitte versuche es später erneut.";

function ipFromRequest(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// Zieht aus einem geworfenen Fehler die für die "Fehler melden"-Mail nützlichen
// Felder. Wichtig: Vercel-Free-Logs verfallen nach ~1h, daher MUSS dieses Detail
// (inkl. Mistral-Status/Body) in die Antwort, damit es selbst-enthaltend in
// Thomas' Postfach landet. Stack wird auf die ersten Zeilen gekürzt.
interface ErrorDetail {
  name: string;
  message: string;
  stack?: string;
  status?: number;
  body?: string;
}

function extractErrorDetail(error: unknown): ErrorDetail {
  if (!(error instanceof Error)) {
    let message: string;
    try {
      message = typeof error === "string" ? error : JSON.stringify(error);
    } catch {
      message = String(error);
    }
    return { name: "NonError", message };
  }

  const e = error as Error & {
    statusCode?: number;
    status?: number;
    body?: unknown;
    cause?: unknown;
  };
  const status =
    typeof e.statusCode === "number"
      ? e.statusCode
      : typeof e.status === "number"
        ? e.status
        : undefined;

  const readBody = (raw: unknown): string | undefined => {
    if (raw === undefined || raw === null) return undefined;
    try {
      return (typeof raw === "string" ? raw : JSON.stringify(raw)).slice(0, 2000);
    } catch {
      return String(raw).slice(0, 2000);
    }
  };

  let message = e.message;
  let body = readBody(e.body);

  // MistralProviderUnavailableError wraps the real provider error in `cause`.
  const cause = e.cause;
  if (cause) {
    const causeMsg =
      cause instanceof Error ? cause.message : typeof cause === "string" ? cause : undefined;
    if (causeMsg) message += ` | cause: ${causeMsg}`;
    if (body === undefined) body = readBody((cause as { body?: unknown }).body);
  }

  return {
    name: e.name,
    message,
    stack: e.stack ? e.stack.split("\n").slice(0, 8).join("\n") : undefined,
    status,
    body,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { wizardData?: WizardData; selectedPoliticianId?: unknown };
    const { wizardData: data, selectedPoliticianId } = body;

    if (!data || typeof selectedPoliticianId !== "number") {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    // Re-validate (defense in depth — client could call this endpoint directly)
    const step1Result = step1Schema.safeParse(data);
    if (!step1Result.success) {
      return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
    }
    if (!step1bSchema.safeParse(data).success) {
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }
    const step2Result = step2Schema.safeParse({ issueText: data.issueText, toneLevel: data.toneLevel });
    if (!step2Result.success) {
      return NextResponse.json({ error: "Bitte beschreibe dein Anliegen." }, { status: 400 });
    }

    // Rate limit (shares buckets with selectPoliticianAction).
    // IP and email are salted-hashed before use as bucket keys (DSGVO M7).
    const ipHash = hashIdentifier(ipFromRequest(req));
    const ipLimit = checkRateLimit(`letter:ip:${ipHash}`, LIMITS.LETTERS_PER_IP.max, LIMITS.LETTERS_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) } }
      );
    }
    const emailLimit = checkRateLimit(
      `letter:email:${hashIdentifier(data.email.toLowerCase())}`,
      LIMITS.LETTERS_PER_EMAIL.max,
      LIMITS.LETTERS_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSeconds ?? 60) } }
      );
    }

    // Re-derive politicians server-side — never trust the client-supplied ID alone
    const { politicians: derivedPoliticians } = lookupPLZ(data.plz);
    if (derivedPoliticians.length === 0) {
      return NextResponse.json(
        { error: "Für diese Postleitzahl haben wir keine Abgeordneten in unseren Daten." },
        { status: 404 }
      );
    }
    const selectedPolitician = derivedPoliticians.find((p) => p.id === selectedPoliticianId);
    if (!selectedPolitician) {
      return NextResponse.json({ error: "Politiker nicht gefunden." }, { status: 400 });
    }

    // Enrich with MdB context (silent failure: letter still ships if slow/unreachable)
    const mdbContext = await fetchMdbContext(
      selectedPolitician.id,
      data.issueText,
      selectedPolitician.committees
    );

    // Generate letter
    const result = await generateLetter({
      issueText: data.issueText,
      politicians: [selectedPolitician],
      party: data.party,
      ngo: data.ngo,
      letterLength: data.letterLength,
      toneLevel: data.toneLevel,
      mdbContext,
    });

    // Moderate output
    const outputModeration = await moderateText(result.letter);
    if (outputModeration.flagged) {
      return NextResponse.json(
        { error: "Beim Erstellen deines Briefes ist ein Problem aufgetreten. Bitte formuliere dein Anliegen anders und versuche es erneut." },
        { status: 422 }
      );
    }

    // Send email + increment counter fire-and-forget
    after(async () => {
      const letterNumber = await incrementLetterCounters(data.campaign?.slug);
      const debugPayload = buildDebugPayload(data, result, derivedPoliticians.length);
      const politicianFullName = `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`;
      const { params, feedbackToken } = prepareLetterEmail({
        recipientEmail: data.email,
        politician: result.selectedPolitician,
        letterText: result.letter,
        issueText: data.issueText,
        debug: debugPayload,
        campaign: data.campaign,
        letterNumber,
      });

      const letterResult = await sendLetterEmail(params);
      if (!letterResult.success) {
        console.error("[brief-nach-berlin][after][letter] returned success=false");
        return;
      }

      // Ziel: 9:45 Berlin-Zeit an Tag+3 (Frühstücks-Inbox statt nachts).
      // BREVO_FOLLOWUP_ENABLED erlaubt Notabschaltung ohne Deploy.
      // Dedup: max. 1 Followup pro Email in 24h. In-memory, also nicht
      // cross-instance-sicher, aber gut genug gegen ehrliche Mehrfach-Submissions.
      if (process.env.BREVO_FOLLOWUP_ENABLED === "true") {
        const followupDedup = checkRateLimit(
          `followup:${hashIdentifier(data.email.toLowerCase())}`,
          1,
          24 * 60 * 60_000,
        );
        if (followupDedup.allowed) {
          const scheduledAt = computeFollowupSlot();
          const followupResult = await sendFollowupEmail({
            recipientEmail: data.email,
            politicianName: politicianFullName,
            feedbackToken,
            scheduledAt,
          });
          if (!followupResult.success) {
            console.error("[brief-nach-berlin][after][followup] returned success=false");
          }
        }
      }
    });

    return NextResponse.json({
      letterText: result.letter,
      politician: result.selectedPolitician,
      politicalLevel: result.politicalLevel,
    });
  } catch (error) {
    // errorId: billiger Live-Grep-Anker für Vercel-Logs im Moment des Fehlers.
    // detail: der eigentliche, selbst-enthaltende Fehlerkontext für die
    // "Fehler melden"-Mail. Wird im Client NIE gerendert, nur weitergereicht.
    const errorId = randomUUID().slice(0, 8);
    const detail = extractErrorDetail(error);
    console.error(`[generate-letter] error [${errorId}]:`, detail);
    if (error instanceof MistralProviderUnavailableError) {
      return NextResponse.json(
        {
          error:
            "Unser KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut.",
          errorId,
          detail,
        },
        { status: 503, headers: { "Retry-After": "60" } }
      );
    }
    return NextResponse.json(
      { error: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.", errorId, detail },
      { status: 500 }
    );
  }
}
