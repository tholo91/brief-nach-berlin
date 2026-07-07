"use server";

import type {
  WizardData,
  WizardActionResult,
  LevelRoutingContext,
} from "@/lib/types/wizard";
import { step1Schema, step1bSchema, step2Schema } from "@/lib/validation/wizardSchemas";
import { lookupPLZ, lookupPLZWithLevel, buildCoverageHint } from "@/lib/lookup/plzLookup";
import { routeToLevel, type RoutingResult } from "@/lib/lookup/levelRouter";
import { verifyRoutingToken } from "@/lib/lookup/routingToken";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit viele Briefe erstellt. Bitte versuche es später erneut.";

const ROUTING_TIMEOUT_MS = 3500;

/**
 * Foreground-Fallback (CONTEXT G3): wird nur gebraucht, wenn kein gültiger
 * Prefetch-Token vorliegt. 3.5s-Budget mit AbortController, damit der
 * in-flight HTTP-Call wirklich abgebrochen wird. Gibt null zurück statt zu
 * werfen — der User sieht nie einen Routing-Fehler.
 */
async function routeToLevelWithTimeout(text: string): Promise<RoutingResult | null> {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), ROUTING_TIMEOUT_MS);
  try {
    const result = await routeToLevel(text, ctrl.signal);
    console.log("[submitWizard] routeToLevel ok", {
      elapsed: Date.now() - t0,
      primaryLevel: result.primary.level,
      primaryConfidence: result.primary.confidence,
    });
    return result;
  } catch (err) {
    const elapsed = Date.now() - t0;
    const isAbort =
      err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
    if (isAbort) {
      console.warn("[submitWizard] routeToLevel timeout fallback", { elapsed });
    } else {
      console.warn("[submitWizard] routeToLevel failed", {
        elapsed,
        err: err instanceof Error ? err.message : String(err),
      });
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function submitWizardAction(
  data: WizardData,
  prefetchedRoutingToken?: string | null
): Promise<WizardActionResult> {
  const log = (stage: string, extra?: Record<string, unknown>) => {
    console.log(`[submitWizard] ${stage}`, extra ?? "");
  };

  log("start", {
    plz: data.plz,
    issueTextLength: data.issueText?.length ?? 0,
    hasParty: Boolean(data.party),
    hasNgo: Boolean(data.ngo),
    letterLength: data.letterLength,
  });

  try {
    // 1. Validate input server-side with Zod (T-02-09)
    const step1Result = step1Schema.safeParse(data);
    if (!step1Result.success) {
      console.warn("[submitWizard] step1 validation failed", step1Result.error.flatten());
      return { error: "server_error", message: "Ungültige Eingabe." };
    }

    const step1bResult = step1bSchema.safeParse(data);
    if (!step1bResult.success) {
      console.warn("[submitWizard] step1b validation failed", step1bResult.error.flatten());
      // Fallback to default length if validation fails
      data.letterLength = DEFAULT_LETTER_LENGTH;
    }

    const step2Result = step2Schema.safeParse({ issueText: data.issueText, toneLevel: data.toneLevel });
    if (!step2Result.success) {
      console.warn("[submitWizard] step2 validation failed", step2Result.error.flatten());
      return {
        error: "server_error",
        message: "Bitte beschreibe dein Anliegen.",
      };
    }
    log("validated");

    // PLZ lookup using Phase 1 static data. Runs BEFORE the rate-limit checks
    // on purpose: lookupPLZ is a free static in-memory lookup, and a
    // plz_not_found should not burn one of the user's daily letter tokens.
    // Otherwise a user who mistypes their PLZ (or lives in a list-only
    // Wahlkreis) could lock themselves out for 24h without ever sending a
    // letter. The expensive steps (AI/email in selectPoliticianAction) stay
    // behind the rate limit below.
    const { wahlkreisIds, politicians } = lookupPLZ(data.plz);
    log("plz lookup", { wahlkreisCount: wahlkreisIds.length, politicianCount: politicians.length });
    // Fallback is handled within lookupPLZ.ts, returning an anonymous politician if none are found.

    // 1b. Rate limit check (IP + email) BEFORE moderation/AI spend.
    // IP and email are salted-hashed before use as bucket keys (DSGVO M7).
    const ipHash = hashIdentifier(await getClientIp());
    const ipLimit = checkRateLimit(`letter:ip:${ipHash}`, LIMITS.LETTERS_PER_IP.max, LIMITS.LETTERS_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      log("rate limited by ip", { ipHash, retryAfterSeconds: ipLimit.retryAfterSeconds });
      return {
        error: "rate_limited",
        message: RATE_LIMIT_MESSAGE,
        retryAfterSeconds: ipLimit.retryAfterSeconds,
      };
    }
    const emailLimit = checkRateLimit(
      `letter:email:${hashIdentifier(data.email.toLowerCase())}`,
      LIMITS.LETTERS_PER_EMAIL.max,
      LIMITS.LETTERS_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      log("rate limited by email", { retryAfterSeconds: emailLimit.retryAfterSeconds });
      return {
        error: "rate_limited",
        message: RATE_LIMIT_MESSAGE,
        retryAfterSeconds: emailLimit.retryAfterSeconds,
      };
    }

    // 999.6: Ebenen-Routing (Bund/Land/Kommune), gated hinter
    // LANDTAG_ROUTING_ENABLED. Wenn das Flag aus ist, verhält sich die Action
    // exakt wie bisher (flacher Bund-Pfad).
    const landtagRoutingEnabled = process.env.LANDTAG_ROUTING_ENABLED === "true";
    let levelRouting: LevelRoutingContext | undefined;

    if (landtagRoutingEnabled) {
      // Prefetch-Token verifizieren (Signatur, TTL, Issue-Hash) — sonst
      // Foreground-Fallback. Rohe Client-Routing-Objekte gibt es nicht (LOCK-10).
      let routing: RoutingResult | null = null;
      if (prefetchedRoutingToken) {
        routing = verifyRoutingToken(prefetchedRoutingToken, data.issueText);
        log(routing ? "routing source: prefetch-token" : "routing source: prefetch-token-invalid");
      }
      if (!routing) {
        if (!prefetchedRoutingToken) log("routing source: foreground-fallback");
        routing = await routeToLevelWithTimeout(data.issueText);
      }

      const levelResult = lookupPLZWithLevel(data.plz);
      const recommended = routing
        ? { level: routing.primary.level, confidence: routing.primary.confidence }
        : null;
      levelRouting = {
        recommended,
        reasoning: routing?.reasoning || null,
        byLevel: levelResult.byLevel,
        coverage: levelResult.coverage,
        bundeslandName: levelResult.bundeslandName,
        ortsname: levelResult.ortsname,
        coverageHint: recommended ? buildCoverageHint(levelResult, recommended.level) : null,
      };
      log("level routing", {
        recommendedLevel: recommended?.level ?? null,
        confidence: recommended?.confidence ?? null,
        landCount: levelResult.byLevel.Land.length,
        kommuneCount: levelResult.byLevel.Kommune.length,
        landSupported: levelResult.coverage.landSupported,
      });
    } else {
      log("routing source: legacy-flag-off");
    }

    // 4. Always route through the politician picker. Even for a single
    // Wahlkreis there are typically 4-5 candidates (1 Direktmandat + list
    // candidates) and the user benefits from being able to (a) see who
    // they're writing to and (b) open the Abgeordnetenwatch profile before
    // committing. The Direktmandat holder is pre-selected in Step3Success,
    // so users on a confident-1-Wahlkreis flow can confirm with one click.
    // Letter generation + email send happen in selectPoliticianAction once
    // the user picks (or confirms the pre-selected) candidate.
    return { disambiguationNeeded: true, politicians, ...(levelRouting ? { levelRouting } : {}) };
  } catch (error) {
    const err = error as Error & { status?: number; code?: string; cause?: unknown };
    console.error("[submitWizard] FAILED", {
      name: err?.name,
      message: err?.message,
      status: err?.status,
      code: err?.code,
      cause: err?.cause,
      issueTextLength: data.issueText?.length ?? 0,
      plz: data.plz,
      stack: err?.stack,
    });
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
