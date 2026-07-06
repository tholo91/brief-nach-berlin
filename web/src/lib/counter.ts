import { unstable_noStore as noStore } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/server";

export async function incrementLetterCount(): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.rpc("increment_counter", { key_name: "letter_count" });
  if (error) console.error("[counter] increment failed:", error.message);
}

export async function incrementLetterCounters(campaignSlug?: string): Promise<number | undefined> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.rpc("increment_letter_counters", {
    campaign_slug: campaignSlug ?? null,
  });
  if (error) {
    console.error("[counter] increment failed:", error.message);
    await incrementLetterCount();
    return undefined;
  }
  return typeof data === "number" ? data : undefined;
}

export async function getLetterCount(): Promise<number> {
  noStore();
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("counters")
    .select("value")
    .eq("key", "letter_count")
    .single();
  if (error) {
    console.error("[counter] read failed:", error.message);
    return 0;
  }
  return data?.value ?? 0;
}
