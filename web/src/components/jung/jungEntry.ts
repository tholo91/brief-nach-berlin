import { verifyClassToken } from "@/lib/schule/classToken";

/** Was der Client über den Klassenlink erfährt. Nie die bucketId. */
export type JungEntry =
  | { status: "none" }
  | { status: "invalid" }
  | { status: "valid"; klasse: number; plz: string; token: string };

type Verify = (token: unknown) => { klasse: number; plz: string } | null;

export function resolveJungEntry(
  k: string | string[] | undefined,
  verify: Verify = verifyClassToken,
): JungEntry {
  const token = Array.isArray(k) ? k[0] : k;
  if (!token) return { status: "none" };
  const verified = verify(token);
  if (!verified) return { status: "invalid" };
  return { status: "valid", klasse: verified.klasse, plz: verified.plz, token };
}
