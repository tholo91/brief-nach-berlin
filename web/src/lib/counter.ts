import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function incrementLetterCount(): Promise<void> {
  const { error } = await supabase.rpc("increment_counter", { key_name: "letter_count" });
  if (error) console.error("[counter] increment failed:", error.message);
}

export async function getLetterCount(): Promise<number> {
  noStore();
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
