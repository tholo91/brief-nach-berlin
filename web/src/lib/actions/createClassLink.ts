"use server";

import { APP_URL } from "@/lib/config";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { CLASS_TOKEN_MAX_AGE_SECONDS, signClassToken } from "@/lib/schule/classToken";
import { isValidKlasse } from "@/lib/schule/youth";

type ClassLinkError = "invalid_input" | "unknown_plz" | "rate_limited";

const MESSAGES: Record<ClassLinkError, string> = {
  invalid_input: "Bitte wähl eine Klassenstufe und gib eine fünfstellige Postleitzahl ein.",
  unknown_plz: "Diese Postleitzahl kenne ich nicht. Bitte prüf sie.",
  rate_limited:
    "Du hast in der letzten Stunde schon viele Links erstellt. Versuch es später noch einmal.",
};

function fail(error: ClassLinkError): { error: ClassLinkError; message: string } {
  return { error, message: MESSAGES[error] };
}

export async function createClassLinkAction(input: {
  klasse: number;
  plz: string;
  /** Fehlt das Feld, gilt "email". */
  delivery?: "pdf" | "email";
}): Promise<{ url: string; expiresAt: string } | { error: ClassLinkError; message: string }> {
  const klasse = input?.klasse;
  const plz = input?.plz;
  const delivery = input?.delivery === undefined ? "email" : input.delivery;
  if (
    !isValidKlasse(klasse) ||
    typeof plz !== "string" ||
    !/^\d{5}$/.test(plz) ||
    (delivery !== "pdf" && delivery !== "email")
  ) {
    return fail("invalid_input");
  }
  if (lookupPLZ(plz).wahlkreisIds.length === 0) return fail("unknown_plz");

  const ipHash = hashIdentifier(await getClientIp());
  const limit = checkRateLimit(
    `class-link:ip:${ipHash}`,
    LIMITS.CLASS_LINKS_PER_IP.max,
    LIMITS.CLASS_LINKS_PER_IP.windowMs
  );
  if (!limit.allowed) return fail("rate_limited");

  const token = signClassToken({ klasse, plz, delivery });
  return {
    url: `${APP_URL}/schule?k=${token}`,
    expiresAt: new Date(Date.now() + CLASS_TOKEN_MAX_AGE_SECONDS * 1000).toISOString(),
  };
}
