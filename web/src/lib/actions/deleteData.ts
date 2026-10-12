"use server";

import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { verifyDataDeletionToken } from "@/lib/dataDeletion/token";
import { deleteUserDataByEmail, type DeletedCounts } from "@/lib/dataDeletion/userData";
import { checkRateLimit, getClientIp, hashIdentifier, LIMITS } from "@/lib/rateLimit";

export type DeleteDataResult =
  | { ok: true; deleted: DeletedCounts }
  | { ok: false; reason: "invalid_link" | "rate_limited" | "server_error" };

// Strict on purpose: the deleted address comes only from the verified token, never from the caller.
const inputSchema = z.object({ token: z.string().min(1).max(4096) }).strict();

export async function deleteDataAction(input: unknown): Promise<DeleteDataResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid_link" };

  const verified = verifyDataDeletionToken(parsed.data.token);
  if (!verified) return { ok: false, reason: "invalid_link" };

  try {
    const ipLimit = checkRateLimit(
      `data-deletion:ip:${hashIdentifier(await getClientIp())}`,
      LIMITS.DATA_DELETION_PER_IP.max,
      LIMITS.DATA_DELETION_PER_IP.windowMs,
    );
    if (!ipLimit.allowed) return { ok: false, reason: "rate_limited" };
    const emailLimit = checkRateLimit(
      `data-deletion:email:${hashIdentifier(verified.email)}`,
      LIMITS.DATA_DELETION_PER_EMAIL.max,
      LIMITS.DATA_DELETION_PER_EMAIL.windowMs,
    );
    if (!emailLimit.allowed) return { ok: false, reason: "rate_limited" };

    const deleted = await deleteUserDataByEmail(getServiceRoleClient(), verified.email);
    return { ok: true, deleted };
  } catch (error) {
    // userData errors carry only table, step and error code; never log the address or the token.
    console.error("[data-deletion] delete failed", error instanceof Error ? error.message : "unknown error");
    return { ok: false, reason: "server_error" };
  }
}
