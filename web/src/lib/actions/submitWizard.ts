"use server";

import type {
  WizardData,
  WizardActionResult,
  LevelRoutingContext,
} from "@/lib/types/wizard";
import {
  firstZodIssueMessage,
  step1Schema,
  step1bSchema,
  step2Schema,
  localeSchema,
} from "@/lib/validation/wizardSchemas";
import {
  getBundestagPoliticiansByIds,
  lookupPLZ,
  lookupPLZWithLevel,
  buildCoverageHint,
} from "@/lib/lookup/plzLookup";
import { routeToLevel, type RoutingResult } from "@/lib/lookup/levelRouter";
import {
  hashRoutingIssue,
  normalizeRoutingIssue,
  signRoutingToken,
  verifyRoutingToken,
} from "@/lib/lookup/routingToken";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { getActiveCampaignBySlug } from "@/lib/campaigns/repository";
import {
  BUNDESLAND_NAMES,
  type CampaignTargetLevel,
} from "@/lib/campaigns/schema";
import { DEFAULT_LETTER_LENGTH } from "@/lib/config";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";

const RATE_LIMIT_MESSAGE =
  "Du hast in kurzer Zeit viele Briefe erstellt. Bitte versuche es später erneut.";

const ROUTING_TIMEOUT_MS = 3500;

type SubmitWizardResult = WizardActionResult & {
  routingToken?: string;
  campaignTargetLevel?: CampaignTargetLevel;
};

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
        errorName: err instanceof Error ? err.name : "NonError",
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
): Promise<SubmitWizardResult> {
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
    data.locale = localeSchema.safeParse(data.locale).success ? data.locale : "de";
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
        message: firstZodIssueMessage(
          step2Result.error,
          "Bitte beschreibe dein Anliegen.",
        ),
      };
    }
    log("validated");

    // Campaign metadata in sessionStorage is presentation-only. Whenever a
    // slug is present, the active, moderated campaign and its target binding
    // are resolved again with the service-role client.
    let campaignTarget:
      | {
          targetLevel: CampaignTargetLevel;
          targetState: keyof typeof BUNDESLAND_NAMES | null;
          targetPoliticianIds: number[];
        }
      | null = null;
    if (data.campaign?.slug) {
      const campaign = await getActiveCampaignBySlug(data.campaign.slug);
      if (!campaign) {
        return {
          error: "server_error",
          message: "Diese Kampagne ist aktuell nicht aktiv. Du kannst stattdessen einen freien Brief schreiben.",
        };
      }
      campaignTarget = {
        targetLevel: campaign.targetLevel,
        targetState: campaign.targetState,
        targetPoliticianIds: campaign.targetPoliticianIds,
      };
    }

    // PLZ lookup using Phase 1 static data. Runs BEFORE the rate-limit checks
    // on purpose: lookupPLZ is a free static in-memory lookup, and a
    // plz_not_found should not burn one of the user's daily letter tokens.
    // Otherwise a user who mistypes their PLZ (or lives in a list-only
    // Wahlkreis) could lock themselves out for 24h without ever sending a
    // letter. The expensive steps (AI/email in selectPoliticianAction) stay
    // behind the rate limit below.
    const { wahlkreisIds, politicians: localPoliticians } = lookupPLZ(data.plz);
    const campaignTargetIds = [...new Set(campaignTarget?.targetPoliticianIds ?? [])];
    const campaignPoliticians = getBundestagPoliticiansByIds(campaignTargetIds);
    const validCampaignTargetIds = new Set(campaignPoliticians.map((politician) => politician.id));
    const localCampaignPoliticians = localPoliticians.filter((politician) =>
      validCampaignTargetIds.has(politician.id)
    );
    const campaignRestricted = campaignTargetIds.length > 0;
    const campaignRestrictedNoLocalMatch = campaignRestricted && localCampaignPoliticians.length === 0;
    const politicians = campaignRestricted
      ? localCampaignPoliticians.length > 0
        ? localCampaignPoliticians
        : campaignPoliticians
      : localPoliticians;
    log("plz lookup", {
      wahlkreisCount: wahlkreisIds.length,
      politicianCount: politicians.length,
      campaignRestricted,
      campaignRestrictedNoLocalMatch,
      campaignTargetCount: campaignPoliticians.length,
    });
    if (campaignRestricted && politicians.length === 0) {
      return {
        error: "server_error",
        message:
          "Die ausgewählten Personen dieser Kampagne sind derzeit nicht verfügbar. Bitte versuche es später erneut.",
      };
    }
    // Fallback is handled within lookupPLZ.ts, returning an anonymous politician if none are found.

    // Kampagne mit fester Bundesland-Bindung: liegt die Besucher-PLZ in einem
    // anderen Bundesland, freundlich abfangen. Läuft wie plz_not_found VOR dem
    // Rate-Limit, damit kein Brief-Token verbrannt wird.
    if (campaignTarget?.targetLevel === "Land" && campaignTarget.targetState) {
      const derivedBundeslandKey = lookupPLZWithLevel(data.plz).bundeslandKey;
      if (derivedBundeslandKey !== campaignTarget.targetState) {
        const targetStateName = BUNDESLAND_NAMES[campaignTarget.targetState];
        const targetRecipient = getLandesregierungRecipient(campaignTarget.targetState);
        const targetLabel = targetRecipient?.label ?? `Landesregierung ${targetStateName}`;
        const targetArticle = targetRecipient?.institutionKind === "senat" ? "den" : "die";
        log("campaign state mismatch", {
          targetState: campaignTarget.targetState,
          derivedBundeslandKey,
        });
        return {
          error: "campaign_state_mismatch",
          targetStateName,
          message: `Diese Kampagne richtet sich an ${targetArticle} ${targetLabel}. Deine Postleitzahl liegt in einem anderen Bundesland.`,
        };
      }
    }

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

    // Ebenen-Routing (Bund/Land/Kommune) mit einem serverseitig signierten
    // Prefetch-Token; ohne Token folgt der zeitlich begrenzte Fallback.
    let levelRouting: LevelRoutingContext | undefined;
    let resolvedRoutingToken: string | undefined;

    {
      // Prefetch-Token verifizieren (Signatur, TTL, Issue-Hash) — sonst
      // Foreground-Fallback. Rohe Client-Routing-Objekte gibt es nicht (LOCK-10).
      let routing: RoutingResult | null = null;
      if (prefetchedRoutingToken) {
        routing = verifyRoutingToken(prefetchedRoutingToken, data.issueText);
        if (routing) resolvedRoutingToken = prefetchedRoutingToken;
        log(routing ? "routing source: prefetch-token" : "routing source: prefetch-token-invalid");
      }
      if (!routing) {
        if (!prefetchedRoutingToken) log("routing source: foreground-fallback");
        const normalizedIssueText = normalizeRoutingIssue(data.issueText);
        routing = await routeToLevelWithTimeout(normalizedIssueText);
        if (routing) {
          resolvedRoutingToken = signRoutingToken({
            issueHash: hashRoutingIssue(normalizedIssueText),
            routing,
          });
        }
      }

      const levelResult = lookupPLZWithLevel(data.plz);
      if (
        campaignTarget?.targetLevel === "Land" &&
        (!levelResult.coverage.landSupported || levelResult.byLevel.Land.length === 0)
      ) {
        return {
          error: "level_data_missing",
          level: "Land",
          fallbackUrl: "/",
          message:
            "Für deine Postleitzahl können wir in dieser Landeskampagne noch keinen verifizierten institutionellen Empfänger anbieten. Du kannst stattdessen einen freien Brief schreiben.",
        };
      }
      const recommended = routing
        ? { level: routing.primary.level, confidence: routing.primary.confidence }
        : null;
      levelRouting = {
        recommended,
        reasoning: routing?.reasoning || null,
        byLevel: levelResult.byLevel,
        optionalByLevel: levelResult.optionalByLevel,
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
    }

    // 4. Always route through the politician picker. Even for a single
    // Wahlkreis there are typically 4-5 candidates (1 Direktmandat + list
    // candidates) and the user benefits from being able to (a) see who
    // they're writing to and (b) open the Abgeordnetenwatch profile before
    // committing. The Direktmandat holder is pre-selected in Step3Success,
    // so users on a confident-1-Wahlkreis flow can confirm with one click.
    // Letter generation + email send happen in selectPoliticianAction once
    // the user picks (or confirms the pre-selected) candidate.
    return {
      disambiguationNeeded: true,
      politicians,
      ...(campaignRestricted ? { campaignRestricted: true } : {}),
      ...(campaignRestrictedNoLocalMatch ? { campaignRestrictedNoLocalMatch: true } : {}),
      ...(campaignRestricted ? { campaignTargetCount: campaignPoliticians.length } : {}),
      ...(levelRouting ? { levelRouting } : {}),
      ...(resolvedRoutingToken ? { routingToken: resolvedRoutingToken } : {}),
      ...(campaignTarget ? { campaignTargetLevel: campaignTarget.targetLevel } : {}),
    };
  } catch (error) {
    const err = error as Error & { status?: number; code?: string };
    console.error("[submitWizard] FAILED", {
      name: err?.name,
      status: err?.status,
      code: err?.code,
      issueTextLength: data.issueText?.length ?? 0,
      plz: data.plz,
    });
    return {
      error: "server_error",
      message:
        "Es ist ein Fehler aufgetreten. Bitte versuche es in einem Moment erneut.",
    };
  }
}
