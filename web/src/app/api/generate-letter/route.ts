import { NextRequest, NextResponse, after } from "next/server";
import type { WizardData } from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { fetchMdbContext } from "@/lib/enrichment/fetchMdbContext";
import { sendLetterEmail } from "@/lib/email/sendLetterEmail";
import { buildDebugPayload } from "@/lib/email/buildDebugPayload";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

export const maxDuration = 30;

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

    // Re-moderate input before LLM spend
    const inputModeration = await moderateText(data.issueText);
    if (inputModeration.flagged) {
      return NextResponse.json(
        { error: "Wir können dieses Anliegen nicht weiterverarbeiten. Bitte formuliere dein Anliegen sachlich." },
        { status: 422 }
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

    // Send email fire-and-forget
    after(async () => {
      await sendLetterEmail({
        recipientEmail: data.email,
        politicianName: `${result.selectedPolitician.firstName} ${result.selectedPolitician.lastName}`,
        politicianFirstName: result.selectedPolitician.firstName,
        politicianLastName: result.selectedPolitician.lastName,
        politicianTitle: result.selectedPolitician.title,
        politicianPostalAddress: result.selectedPolitician.postalAddress,
        politicianAbgeordnetenwatchUrl: result.selectedPolitician.abgeordnetenwatchUrl,
        letterText: result.letter,
        issueText: data.issueText,
        debug: buildDebugPayload(data, result, derivedPoliticians.length),
      });
    });

    return NextResponse.json({
      letterText: result.letter,
      politician: result.selectedPolitician,
      politicalLevel: result.politicalLevel,
    });
  } catch (error) {
    console.error("[generate-letter] error:", error);
    return NextResponse.json(
      { error: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
