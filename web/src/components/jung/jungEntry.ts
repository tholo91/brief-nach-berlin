import { CLASS_TOKEN_MAX_AGE_SECONDS, verifyClassToken } from "@/lib/schule/classToken";

/** Was der Client über den Klassenlink erfährt. Nie die bucketId. */
export type JungEntry =
  | { status: "none" }
  | { status: "invalid" }
  | {
      status: "valid";
      klasse: number;
      plz: string;
      token: string;
      delivery: "pdf" | "email";
      /** Ablauf des Tokens in ms; der Client merkt den Link bis dahin im Tab. */
      expiresAt?: number;
    };

type Verify = (
  token: unknown,
) => { klasse: number; plz: string; delivery?: "pdf" | "email"; issuedAt?: number } | null;

export function resolveJungEntry(
  k: string | string[] | undefined,
  verify: Verify = verifyClassToken,
): JungEntry {
  const token = Array.isArray(k) ? k[0] : k;
  if (!token) return { status: "none" };
  const verified = verify(token);
  if (!verified) return { status: "invalid" };
  return {
    status: "valid",
    klasse: verified.klasse,
    plz: verified.plz,
    token,
    delivery: verified.delivery === "pdf" ? "pdf" : "email",
    ...(typeof verified.issuedAt === "number"
      ? { expiresAt: (verified.issuedAt + CLASS_TOKEN_MAX_AGE_SECONDS) * 1000 }
      : {}),
  };
}
