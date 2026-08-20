import { revalidateTag, unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

const LETTER_COUNT_TAG = "letter-count";

const readLetterCount = unstable_cache(
  async (): Promise<number> => {
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
  },
  [LETTER_COUNT_TAG],
  { revalidate: 3600, tags: [LETTER_COUNT_TAG] },
);

export function invalidateLetterCountCache(): void {
  revalidateTag(LETTER_COUNT_TAG, { expire: 0 });
}

export async function incrementLetterCount(): Promise<void> {
  const { error } = await supabase.rpc("increment_counter", { key_name: "letter_count" });
  if (error) console.error("[counter] increment failed:", error.message);
  else invalidateLetterCountCache();
}

export async function incrementLetterCounters(campaignSlug?: string): Promise<number | undefined> {
  const { data, error } = await supabase.rpc("increment_letter_counters", {
    campaign_slug: campaignSlug ?? null,
  });
  if (error) {
    console.error("[counter] increment failed:", error.message);
    await incrementLetterCount();
    return undefined;
  }
  invalidateLetterCountCache();
  return typeof data === "number" ? data : undefined;
}

export async function getLetterCount(): Promise<number> {
  return readLetterCount();
}
