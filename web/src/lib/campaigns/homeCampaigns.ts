import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getLandingCampaigns } from "@/lib/campaigns/repository";
import type { LandingCampaign } from "@/lib/campaigns/landing";

/**
 * Kampagnen für die Startseite. Ein Fehler wird nicht als leere Liste
 * zurückgegeben: Beim stündlichen Neubau behält Next.js dann die letzte gute
 * Seite. Nur im Build fällt die Liste leer aus, damit ein Supabase-Aussetzer
 * kein Deploy blockiert.
 */
export async function getHomeCampaigns(
  load: () => Promise<LandingCampaign[]> = () => getLandingCampaigns()
): Promise<LandingCampaign[]> {
  try {
    return await load();
  } catch (firstError) {
    console.error("[home] Kampagnen-Abfrage fehlgeschlagen, neuer Versuch:", firstError);
    try {
      return await load();
    } catch (error) {
      console.error("[home] Kampagnen-Abfrage erneut fehlgeschlagen:", error);
      if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return [];
      throw error;
    }
  }
}
