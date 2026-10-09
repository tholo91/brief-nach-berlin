"use server";

import { z } from "zod";
import { buildMdbContacts, type MdbContact } from "@/lib/lookup/mdbContact";

const plzSchema = z.string().regex(/^\d{5}$/);

export type LookupMdbContactResult =
  | { ok: true; contacts: MdbContact[] }
  | { ok: false; reason: "invalid" | "not_found" };

export async function lookupMdbContactAction(plz: string): Promise<LookupMdbContactResult> {
  const parsed = plzSchema.safeParse(plz.trim());
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const contacts = buildMdbContacts(parsed.data);
  if (contacts.length === 0) return { ok: false, reason: "not_found" };

  return { ok: true, contacts };
}
