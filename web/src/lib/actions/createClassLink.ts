"use server";

import { APP_URL } from "@/lib/config";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";
import { CLASS_TOKEN_MAX_AGE_SECONDS, signClassToken } from "@/lib/schule/classToken";
import { qrFits } from "@/lib/qr-code";
import { isValidKlasse, normalizeSchule, SCHULE_MAX_CHARS } from "@/lib/schule/youth";

type ClassLinkError = "invalid_input" | "unknown_plz" | "rate_limited";

const MESSAGES: Record<ClassLinkError, string> = {
  invalid_input: "Bitte wähl eine Klassenstufe und gib eine fünfstellige Postleitzahl ein.",
  unknown_plz: "Diese Postleitzahl kenne ich nicht. Bitte prüf sie.",
  rate_limited:
    "Du hast in der letzten Stunde schon viele Links erstellt. Versuch es später noch einmal.",
};

const SCHULE_MESSAGE = `Schule und Ort darf höchstens ${SCHULE_MAX_CHARS} Zeichen lang sein, mit vielen Sonderzeichen auch weniger. Bitte kürz den Namen.`;

function fail(
  error: ClassLinkError,
  message: string = MESSAGES[error]
): { error: ClassLinkError; message: string } {
  return { error, message };
}

export async function createClassLinkAction(input: {
  klasse: number;
  plz: string;
  /** Fehlt das Feld, gilt "email". */
  delivery?: "pdf" | "email";
  /** Empfänger-Ebene: "auto" (Standard, der Router entscheidet), "Land" oder "Bund". */
  level?: "auto" | "Land" | "Bund";
  /** Optional: "Schule und Ort", landet signiert im Token. */
  schule?: string;
}): Promise<{ url: string; expiresAt: string } | { error: ClassLinkError; message: string }> {
  const klasse = input?.klasse;
  const plz = input?.plz;
  const delivery = input?.delivery === undefined ? "email" : input.delivery;
  const level = input?.level === undefined ? "auto" : input.level;
  if (
    !isValidKlasse(klasse) ||
    (level !== "auto" && level !== "Land" && level !== "Bund") ||
    typeof plz !== "string" ||
    !/^\d{5}$/.test(plz) ||
    (delivery !== "pdf" && delivery !== "email")
  ) {
    return fail("invalid_input");
  }
  const rawSchule = input?.schule;
  const hasSchule = typeof rawSchule === "string" && rawSchule.trim().length > 0;
  const schule = hasSchule ? normalizeSchule(rawSchule) : undefined;
  if (rawSchule !== undefined && rawSchule !== null && typeof rawSchule !== "string") {
    return fail("invalid_input");
  }
  if (hasSchule && !schule) return fail("invalid_input", SCHULE_MESSAGE);
  if (lookupPLZ(plz).wahlkreisIds.length === 0) return fail("unknown_plz");

  const ipHash = hashIdentifier(await getClientIp());
  const limit = checkRateLimit(
    `class-link:ip:${ipHash}`,
    LIMITS.CLASS_LINKS_PER_IP.max,
    LIMITS.CLASS_LINKS_PER_IP.windowMs
  );
  if (!limit.allowed) return fail("rate_limited");

  const token = signClassToken({
    klasse,
    plz,
    delivery,
    ...(level === "auto" ? {} : { level }),
    ...(schule ? { schule } : {}),
  });
  const url = `${APP_URL}/schule?k=${token}`;
  // Ungewöhnliche Zeichen (z. B. Kyrillisch) lassen sich schlecht komprimieren: lieber kürzen lassen als einen QR-Code ohne Platz.
  if (!qrFits(url)) return fail("invalid_input", SCHULE_MESSAGE);
  return {
    url,
    expiresAt: new Date(Date.now() + CLASS_TOKEN_MAX_AGE_SECONDS * 1000).toISOString(),
  };
}
