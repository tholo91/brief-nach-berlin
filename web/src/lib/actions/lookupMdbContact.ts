"use server";

import { z } from "zod";
import { buildMdbContactById, buildMdbContacts, type MdbContact } from "@/lib/lookup/mdbContact";

const plzSchema = z.string().regex(/^\d{5}$/);
const idSchema = z.number().int().positive();

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

export async function lookupMdbContactByIdAction(id: number): Promise<LookupMdbContactResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const contact = buildMdbContactById(parsed.data);
  if (!contact) return { ok: false, reason: "not_found" };

  return { ok: true, contacts: [contact] };
}
