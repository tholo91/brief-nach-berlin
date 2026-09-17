import "server-only";

import { randomUUID } from "node:crypto";
import { getServiceRoleClient } from "@/lib/supabase/server";

const CLAIM_LEASE_MS = 2 * 60_000;

export type LetterGenerationClaim =
  | { status: "claimed"; ownerToken: string }
  | { status: "in_progress" | "duplicate" };

export async function claimLetterGeneration(
  letterId: string,
): Promise<LetterGenerationClaim> {
  const ownerToken = randomUUID();
  const { error } = await getServiceRoleClient()
    .from("letter_generation_claims")
    .insert({ letter_id: letterId, owner_token: ownerToken });

  if (!error) return { status: "claimed", ownerToken };
  if (error.code !== "23505") {
    console.error("[letter-generation] claim failed", error.message);
    throw new Error("Letter generation claim failed");
  }

  const client = getServiceRoleClient();
  const { data: existing, error: readError } = await client
    .from("letter_generation_claims")
    .select("completed_at, irreversible_at, updated_at")
    .eq("letter_id", letterId)
    .maybeSingle();
  if (readError || !existing) {
    console.error(
      "[letter-generation] claim lookup failed",
      readError?.message ?? "missing claim",
    );
    throw new Error("Letter generation claim lookup failed");
  }
  if (existing.completed_at || existing.irreversible_at) {
    return { status: "duplicate" };
  }

  const leaseExpiresAtMs = Date.now() - CLAIM_LEASE_MS;
  const existingUpdatedAtMs = Date.parse(existing.updated_at);
  if (!Number.isFinite(existingUpdatedAtMs)) {
    console.error("[letter-generation] claim has invalid updated_at");
    throw new Error("Letter generation claim has invalid timestamp");
  }
  if (existingUpdatedAtMs > leaseExpiresAtMs) return { status: "in_progress" };

  const leaseExpiresBefore = new Date(leaseExpiresAtMs).toISOString();
  const now = new Date().toISOString();
  const { data: reclaimed, error: reclaimError } = await client
    .from("letter_generation_claims")
    .update({ owner_token: ownerToken, updated_at: now })
    .eq("letter_id", letterId)
    .is("completed_at", null)
    .is("irreversible_at", null)
    .lte("updated_at", leaseExpiresBefore)
    .select("letter_id")
    .maybeSingle();
  if (reclaimError) {
    console.error("[letter-generation] claim reclaim failed", reclaimError.message);
    throw new Error("Letter generation claim reclaim failed");
  }
  return reclaimed
    ? { status: "claimed", ownerToken }
    : { status: "in_progress" };
}

export async function releaseLetterGenerationClaim(
  letterId: string,
  ownerToken: string,
): Promise<void> {
  try {
    const { error } = await getServiceRoleClient()
      .from("letter_generation_claims")
      .delete()
      .eq("letter_id", letterId)
      .eq("owner_token", ownerToken)
      .is("completed_at", null)
      .is("irreversible_at", null);
    if (error) {
      console.error("[letter-generation] claim release failed", error.message);
    }
  } catch (error) {
    console.error("[letter-generation] claim release failed", error);
  }
}

export async function markLetterGenerationIrreversible(
  letterId: string,
  ownerToken: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { data, error } = await getServiceRoleClient()
    .from("letter_generation_claims")
    .update({ irreversible_at: now, updated_at: now })
    .eq("letter_id", letterId)
    .eq("owner_token", ownerToken)
    .is("irreversible_at", null)
    .select("letter_id")
    .single();
  if (error || !data) {
    console.error(
      "[letter-generation] irreversible marker failed",
      error?.message ?? "missing claim",
    );
    throw new Error("Letter generation irreversible marker failed");
  }
}

export async function completeLetterGenerationClaim(
  letterId: string,
  ownerToken: string,
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { error } = await getServiceRoleClient()
      .from("letter_generation_claims")
      .update({ completed_at: now, updated_at: now })
      .eq("letter_id", letterId)
      .eq("owner_token", ownerToken);
    if (error) {
      console.error("[letter-generation] claim completion failed", error.message);
    }
  } catch (error) {
    console.error("[letter-generation] claim completion failed", error);
  }
}
