import Link from "next/link";
import { getRecentActiveCampaigns } from "@/lib/campaigns/repository";

export default async function CampaignNotFound() {
  const campaigns = await getRecentActiveCampaigns(5).catch(() => []);

  return (
    <section className="relative overflow-hidden bg-creme">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(98,138,90,0.14),transparent_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 py-14 md:py-20">
        <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          Kampagnenlink
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
          Diese Kampagne wurde nicht gefunden.
        </h1>
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-warmgrau/75 md:text-lg">
          Vielleicht hat sich beim Vorlesen oder Eintippen ein kleiner Fehler eingeschlichen. Hier findest du aktuelle öffentliche Kampagnen.
        </p>

        {campaigns.length > 0 && (
          <div className="mt-8 grid gap-3">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/kampagne/${campaign.slug}`}
                className="rounded-md border border-warmgrau/15 bg-white/75 px-4 py-4 transition-colors hover:border-waldgruen/40 hover:bg-white"
              >
                <span className="font-body text-base font-semibold text-waldgruen-dark">
                  {campaign.title}
                </span>
                {campaign.creatorName && (
                  <span className="mt-1 block font-body text-sm text-warmgrau/60">
                    von {campaign.creatorName}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/kampagne/starten"
          className="mt-8 inline-flex rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          Eigene Kampagne starten
        </Link>
      </div>
    </section>
  );
}
