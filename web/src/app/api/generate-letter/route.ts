import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { WizardData } from "@/lib/types/wizard";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import { verifyRoutingToken } from "@/lib/lookup/routingToken";
import { moderateText } from "@/lib/moderation/moderateText";
import { generateLetter } from "@/lib/generation/generateLetter";
import { fetchMdbContext } from "@/lib/enrichment/fetchMdbContext";
import { sendLetterEmail, prepareLetterEmail } from "@/lib/email/sendLetterEmail";
import { sendFollowupEmail } from "@/lib/email/sendFollowupEmail";
import { computeFollowupSlot } from "@/lib/email/computeFollowupSlot";
import { buildDebugPayload, type LetterRoutingInfo } from "@/lib/email/buildDebugPayload";
import { checkRateLimit, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { MistralProviderUnavailableError } from "@/lib/mistral";
import { incrementLetterCounters } from "@/lib/counter";

// Client-Auswahl: diskriminierte Union (999.6). Institutionelle Empfänger
// tragen bewusst KEINE ID; der Server leitet sie aus der PLZ ab (LOCK-5).
const selectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mdb"), selectedPoliticianId: z.number().int() }),
  z.object({ kind: z.literal("mdl"), selectedPoliticianId: z.number().int() }).strict(),
  z.object({ kind: z.literal("landesregierung") }).strict(),
  z.object({ kind: z.literal("rathaus") }).strict(),
]);

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
    const body = await req.json() as {
      wizardData?: WizardData;
      selection?: unknown;
      selectedPoliticianId?: unknown;
      routingToken?: unknown;
    };
    const { wizardData: data } = body;

    // Auswahl normalisieren: neues selection-Objekt bevorzugt, nackte Zahl
    // bleibt als Legacy-Pfad (Bund/mdb) akzeptiert.
    let selection: RecipientSelection | null = null;
    if (body.selection !== undefined) {
      const parsedSelection = selectionSchema.safeParse(body.selection);
      if (parsedSelection.success) selection = parsedSelection.data;
    } else if (typeof body.selectedPoliticianId === "number") {
      selection = { kind: "mdb", selectedPoliticianId: body.selectedPoliticianId };
    }

    if (!data || !selection) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    if (
      selection.kind !== "mdb" &&
      (process.env.LANDTAG_ROUTING_ENABLED !== "true" ||
        process.env.LETTER_PROMPT_LEVEL_AWARE !== "true")
    ) {
      return NextResponse.json({ error: "Empfänger nicht verfügbar." }, { status: 400 });
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

    // Re-derive recipient server-side — never trust client-supplied data.
    // mdb/mdl: ID muss in der PLZ-abgeleiteten Ebenen-Liste stehen.
    // Institutionelle Empfänger werden komplett aus der PLZ gebaut (LOCK-5).
    const resolved = resolveRecipientSelection(data.plz, selection);
    if (!resolved.ok) {
      return NextResponse.json({ error: "Empfänger nicht gefunden." }, { status: 400 });
    }
    const recipient = resolved.recipient;

    // Routing-Kontext: NUR über den signierten Prefetch-Token (LOCK-10).
    // Daraus leiten sich Kompetenz-Mismatch-Framing und Debug-Telemetrie ab —
    // beides serverseitig, ohne dem Client zu vertrauen.
    let routingInfo: LetterRoutingInfo | null = null;
    if (typeof body.routingToken === "string") {
      const routing = verifyRoutingToken(body.routingToken, data.issueText);
      if (routing) {
        const routedLevelAvailable =
          lookupPLZWithLevel(data.plz).byLevel[routing.primary.level].length > 0;
        routingInfo = {
          routedPrimaryLevel: routing.primary.level,
          routedPrimaryConfidence: routing.primary.confidence,
          wasOverridden:
            routing.primary.confidence !== "low" &&
            routedLevelAvailable &&
            routing.primary.level !== recipient.level,
          selectedLevel: recipient.level,
        };
      }
    }
    const mismatchRecommendedLevel =
      routingInfo?.wasOverridden && routingInfo.routedPrimaryLevel
        ? routingInfo.routedPrimaryLevel
        : undefined;

    // Enrich with MdB context (silent failure: letter still ships if slow/unreachable).
    // Nur für den Bund-Pfad — MdL/Rathaus haben keine gecachten Ausschussdaten;
    // der leere <mdb_kontext>-Block verhindert Halluzinationen.
    const mdbContext =
      recipient.kind === "mdb"
        ? await fetchMdbContext(recipient.id, data.issueText, recipient.committees)
        : undefined;

    console.log("[generate-letter] recipient resolved", {
      kind: recipient.kind,
      level: recipient.level,
      politicianId:
        recipient.kind === "mdb" || recipient.kind === "mdl" ? recipient.id : null,
      mismatch: Boolean(mismatchRecommendedLevel),
    });

    // Generate letter
    const result = await generateLetter({
      issueText: data.issueText,
      politicians:
        recipient.kind === "mdb" || recipient.kind === "mdl" ? [recipient] : [],
      party: data.party,
      ngo: data.ngo,
      letterLength: data.letterLength,
      toneLevel: data.toneLevel,
      mdbContext,
      level: recipient.level,
      rathaus: recipient.kind === "rathaus" ? recipient : undefined,
      landesregierung:
        recipient.kind === "landesregierung" ? recipient : undefined,
      mismatchRecommendedLevel,
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
      const debugPayload = buildDebugPayload(
        data,
        result,
        resolved.availableCount,
        routingInfo ?? undefined
      );
      const politicianFullName =
        result.selectedRecipient.kind === "rathaus" ||
        result.selectedRecipient.kind === "landesregierung"
          ? result.selectedRecipient.label
          : `${result.selectedRecipient.firstName} ${result.selectedRecipient.lastName}`;
      const { params, feedbackToken } = prepareLetterEmail({
        recipientEmail: data.email,
        recipient: result.selectedRecipient,
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
      if (recipient.kind === "mdb" && process.env.BREVO_FOLLOWUP_ENABLED === "true") {
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
      recipient: result.selectedRecipient,
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
            "Der KI-Anbieter ist gerade kurz nicht erreichbar. Bitte versuche es in ein, zwei Minuten erneut.",
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
