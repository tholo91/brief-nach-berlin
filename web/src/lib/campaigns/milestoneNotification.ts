import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { isCampaignEnded } from "./endDate";
import { normalizeMilestones, reachedMilestone } from "./milestones";
import { createCampaignToken } from "./tokens";

const LOG_PREFIX = "[brief-nach-berlin][milestone]";

type MilestoneRow = {
  id: string;
  slug: string;
  title: string;
  creator_email: string;
  creator_name: string | null;
  status: string;
  ends_at: string | null;
  letter_count: number | null;
  milestones: number[] | null;
  milestone_notified: number | null;
  milestone_mails_enabled: boolean | null;
};

const COLUMNS =
  "id, slug, title, creator_email, creator_name, status, ends_at, letter_count, milestones, milestone_notified, milestone_mails_enabled";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Sends at most one milestone mail per reached stufe. The conditional update is
 * the claim: only the request that gets the row back sends. Never throws.
 */
export async function claimAndSendCampaignMilestone(
  slug: string,
  db?: SupabaseClient,
  now = new Date(),
): Promise<void> {
  let milestone: number | null = null;
  try {
    const client = db ?? getServiceRoleClient();
    const { data, error } = await client
      .from("campaigns")
      .select(COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(LOG_PREFIX, "read failed", slug, error.message);
      return;
    }
    if (!data) return;

    const row = data as MilestoneRow;
    if (
      row.status !== "active" ||
      isCampaignEnded({ endsAt: row.ends_at }, now) ||
      row.milestone_mails_enabled === false
    ) {
      return;
    }

    milestone = reachedMilestone(
      row.milestones,
      row.letter_count ?? 0,
      row.milestone_notified ?? 0,
    );
    if (milestone === null) return;

    const { data: claimed, error: claimError } = await client
      .from("campaigns")
      .update({ milestone_notified: milestone })
      .eq("id", row.id)
      .lt("milestone_notified", milestone)
      .eq("milestone_mails_enabled", true)
      .select("id");

    if (claimError) {
      console.error(LOG_PREFIX, "claim failed", slug, milestone, claimError.message);
      return;
    }
    if (!Array.isArray(claimed) || claimed.length === 0) return;

    const { token } = await createCampaignToken(row.id, "manage", undefined, client);
    const result = await sendCampaignCreatorEmail({
      kind: "milestone",
      recipientEmail: row.creator_email,
      campaignTitle: row.title,
      slug: row.slug,
      token,
      creatorName: row.creator_name,
      adminCopy: true,
      milestone: { count: milestone, milestones: normalizeMilestones(row.milestones) },
    });
    if (!result.success) {
      console.error(LOG_PREFIX, "send returned success=false", slug, milestone);
    }
  } catch (error) {
    console.error(LOG_PREFIX, "failed", slug, milestone, errorMessage(error));
  }
}
