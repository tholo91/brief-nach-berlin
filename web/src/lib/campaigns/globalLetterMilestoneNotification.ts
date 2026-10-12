import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isGlobalLetterMilestone } from "./globalLetterMilestones";
import { getServiceRoleClient } from "@/lib/supabase/server";

const LOG_PREFIX = "[brief-nach-berlin][global-milestone]";

/** Claims each exact global counter milestone once, then makes one email attempt. */
export async function claimAndSendGlobalLetterMilestone(
  letterNumber: number,
  db?: SupabaseClient,
): Promise<void> {
  if (!isGlobalLetterMilestone(letterNumber)) return;

  try {
    const client = db ?? getServiceRoleClient();
    const { data, error } = await client
      .from("global_letter_milestone_claims")
      .upsert(
        { milestone_count: letterNumber },
        { onConflict: "milestone_count", ignoreDuplicates: true },
      )
      .select("milestone_count");

    if (error) {
      console.error(LOG_PREFIX, "claim failed", letterNumber, error.message);
      return;
    }
    if (!Array.isArray(data) || data.length === 0) return;

    const { sendGlobalLetterMilestoneEmail } = await import(
      "@/lib/email/sendGlobalLetterMilestoneEmail"
    );
    const result = await sendGlobalLetterMilestoneEmail(letterNumber);
    if (!result.success) console.error(LOG_PREFIX, "send returned success=false", letterNumber);
  } catch (error) {
    console.error(
      LOG_PREFIX,
      "failed",
      letterNumber,
      error instanceof Error ? error.message : String(error),
    );
  }
}
