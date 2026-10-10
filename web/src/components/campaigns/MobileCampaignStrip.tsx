"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { LandingCampaign } from "@/lib/campaigns/landing";
import { HeroCampaignPills } from "./HeroCampaignPills";

// Mobile counterpart to the hero pills (which only show from md up): sits
// between the press logos and the review strip on the landing page.
export function MobileCampaignStrip({ campaigns }: { campaigns: LandingCampaign[] }) {
  const { locale } = useLocale();
  if (locale !== "de" || campaigns.length === 0) return null;

  return (
    <div className="md:hidden mt-2">
      <p className="text-center font-typewriter text-xs tracking-widest uppercase text-warmgrau/50 mb-3 px-6">
        Laufende Briefkampagnen:
      </p>
      <HeroCampaignPills campaigns={campaigns} layout="scroll" />
    </div>
  );
}
