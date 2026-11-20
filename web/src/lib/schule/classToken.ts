import "server-only";
import { z } from "zod";
import { signFeedbackToken, verifyFeedbackToken } from "@/lib/feedback/token";
import { hashIdentifier } from "@/lib/rateLimit";
import { KLASSE_MAX, KLASSE_MIN, normalizeSchule } from "@/lib/schule/youth";

export const CLASS_TOKEN_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

// Trennt Klassen-Tokens von Feedback-Tokens: gleiches Secret, andere MAC-Eingabe.
const MAC_DOMAIN = "class-link-v1.";
const MAX_TOKEN_LENGTH = 512;
// shortMac: beim Prüfen werden volle und gekürzte MACs akzeptiert; gekürzt wird nur beim Signieren mit fester Ebene.
const OPTS = { macDomain: MAC_DOMAIN, maxAgeSeconds: CLASS_TOKEN_MAX_AGE_SECONDS, shortMac: true };

const payloadSchema = z.object({
  v: z.literal(1),
  k: z.number().int().min(KLASSE_MIN).max(KLASSE_MAX),
  p: z.string().regex(/^\d{5}$/),
  // Nur für "PDF statt E-Mail" gesetzt; fehlt das Feld, gilt E-Mail (alte und neue E-Mail-Tokens sind identisch).
  d: z.literal(1).optional(),
  // Von der Lehrkraft fest eingestellte Ebene: "L" = Land, "B" = Bund. Fehlt das Feld
  // (alle alten Tokens), entscheidet der Router.
  l: z.enum(["L", "B"]).optional(),
  // Schule und Ort, von der Lehrkraft eingegeben. Absichtlich nur ein Typ-Check: ein
  // ungültiger Wert verwirft nur das Feld (siehe verifyClassToken), nicht das ganze Token.
  s: z.unknown().optional(),
  iat: z.number(),
});

export type ClassDelivery = "pdf" | "email";
/** Feste Ebene aus dem Klassen-Link; fehlt sie, gilt "automatisch". */
export type ClassLevel = "Land" | "Bund";

export function signClassToken({
  klasse,
  plz,
  delivery,
  level,
  schule,
}: {
  klasse: number;
  plz: string;
  /** Fehlt das Feld, gilt "email". */
  delivery?: ClassDelivery;
  /** Fehlt das Feld, gilt "automatisch" (kein Token-Feld). */
  level?: ClassLevel;
  /** Schule und Ort; wird mit normalizeSchule geprüft, ungültig oder leer fällt weg. */
  schule?: string;
}): string {
  const school = normalizeSchule(schule);
  // Kurze Felder ("d: 1", "l: L|B", "s") statt Klartext: der QR-Code hat wenig Platz.
  return signFeedbackToken(
    {
      v: 1,
      k: klasse,
      p: plz,
      ...(delivery === "pdf" ? { d: 1 } : {}),
      ...(level ? { l: level === "Land" ? "L" : "B" } : {}),
      ...(school ? { s: school } : {}),
    },
    // Mit festem Level oder Schulname kürzt der MAC auf 128 Bit, sonst wird der QR-Code unnötig groß.
    { ...OPTS, shortMac: Boolean(level || school) }
  );
}

export function verifyClassToken(
  token: unknown
): {
  klasse: number;
  plz: string;
  delivery: ClassDelivery;
  /** Von der Lehrkraft fest gewählte Ebene; undefined = automatisch. */
  level?: ClassLevel;
  /** Schule und Ort aus dem Token; fehlt bei alten Tokens. */
  schule?: string;
  issuedAt: number;
  bucketId: string;
} | null {
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return null;
  }
  try {
    const parsed = payloadSchema.safeParse(verifyFeedbackToken(token, OPTS));
    if (!parsed.success) return null;
    // Ein ungültiger Schulname macht das Token nicht ungültig, er wird nur ignoriert.
    const schule = normalizeSchule(parsed.data.s);
    return {
      klasse: parsed.data.k,
      plz: parsed.data.p,
      delivery: parsed.data.d === 1 ? "pdf" : "email",
      ...(parsed.data.l ? { level: parsed.data.l === "L" ? ("Land" as const) : ("Bund" as const) } : {}),
      ...(schule ? { schule } : {}),
      issuedAt: parsed.data.iat,
      bucketId: hashIdentifier(token),
    };
  } catch {
    return null;
  }
}
