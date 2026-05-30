import { NextRequest, NextResponse, after } from "next/server";
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
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { MistralProviderUnavailableError } from "@/lib/mistral";
import { incrementLetterCount } from "@/lib/counter";

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
    const step2Result = step2Schema.safeParse({ issueText: data.issueText });
    if (!step2Result.success) {
      return NextResponse.json({ error: "Bitte beschreibe dein Anliegen." }, { status: 400 });
    }

    // Rate limit (shares buckets with selectPoliticianAction)
    const ip = ipFromRequest(req);
    const ipLimit = checkRateLimit(`letter:ip:${ip}`, LIMITS.LETTERS_PER_IP.max, LIMITS.LETTERS_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 60) } }
      );
    }
    const emailLimit = checkRateLimit(
      `letter:email:${data.email.toLowerCase()}`,
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

    // Moderate user input before sending it to the LLM. Prevents toxic content
    // from being passed to Mistral and gives a server-side log of flagged attempts.
    const inputModeration = await moderateText(data.issueText);
    if (inputModeration.flagged) {
      return NextResponse.json(
        { error: "Dein Anliegen enthält Formulierungen, die wir so nicht weiterverarbeiten können. Bitte formuliere es sachlich um und versuche es erneut." },
        { status: 422 }
      );
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
      name: data.name,
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
      await incrementLetterCount();
      const debugPayload = buildDebugPayload(data, result, derivedPoliticians.length);
      const politicianFullName = `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`;
      const { params, feedbackToken } = prepareLetterEmail({
        recipientEmail: data.email,
        politician: result.selectedPolitician,
        letterText: result.letter,
        issueText: data.issueText,
        debug: debugPayload,
      });

      const sends: Array<Promise<{ success: boolean; messageId?: string }>> = [
        sendLetterEmail(params),
      ];

      // Ziel: 9:45 Berlin-Zeit an Tag+3 (Frühstücks-Inbox statt nachts).
      // Brevos historische Obergrenze für scheduledAt ist 72h — bei
      // Submission vor 9:45 Berlin fällt der Slot automatisch auf Tag+2@9:45.
      // BREVO_FOLLOWUP_ENABLED erlaubt Notabschaltung ohne Deploy.
      if (process.env.BREVO_FOLLOWUP_ENABLED === "true") {
        const scheduledAt = computeFollowupSlot();
        sends.push(
          sendFollowupEmail({
            recipientEmail: data.email,
            politicianName: politicianFullName,
            feedbackToken,
            scheduledAt,
          }),
        );
      }

      const settled = await Promise.allSettled(sends);
      settled.forEach((r, i) => {
        const label = i === 0 ? "letter" : "followup";
        if (r.status === "rejected") {
          console.error(`[brief-nach-berlin][after][${label}] rejected:`, r.reason);
        } else if (!r.value.success) {
          console.error(`[brief-nach-berlin][after][${label}] returned success=false`);
        }
      });
    });

    return NextResponse.json({
      letterText: result.letter,
      politician: result.selectedPolitician,
      politicalLevel: result.politicalLevel,
    });
  } catch (error) {
    console.error("[generate-letter] error:", error);
    if (error instanceof MistralProviderUnavailableError) {
      return NextResponse.json(
        {
          error:
            "Unser KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut.",
        },
        { status: 503, headers: { "Retry-After": "60" } }
      );
    }
    return NextResponse.json(
      { error: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
