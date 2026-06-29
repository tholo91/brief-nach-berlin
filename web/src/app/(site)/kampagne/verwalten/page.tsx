import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { CampaignManager } from "@/components/campaigns/CampaignManager";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

export const metadata: Metadata = {
  title: "Kampagne verwalten | Brief nach Berlin",
  alternates: { canonical: "/kampagne/verwalten" },
};

function AccessNotice({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
        <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          Kampagne verwalten
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
          Verwaltungslink benötigt
        </h1>
        <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
          {message}
        </p>
        <Link
          href="/kampagne/starten"
          className="mt-6 inline-block rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          Zur Kampagnenseite
        </Link>
      </div>
    </section>
  );
}

export default async function ManageCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  if (params.token) {
    redirect(
      `/kampagne/verwalten/zugang?token=${encodeURIComponent(params.token)}`
    );
  }

  const session = await getCampaignManagementSession();

  let campaign = null;
  if (session) {
    campaign = await getCampaignById(session.campaignId);
  }

  return (
    <CampaignBackground>
      {campaign ? (
        <section className="relative mx-auto max-w-4xl px-6 py-14 md:py-20">
          <CampaignManager campaign={campaign} />
        </section>
      ) : (
        <AccessNotice message="Bitte öffne den aktuellen Verwaltungslink aus deiner Kampagnen-E-Mail. Es gibt keine Nutzerkonten und keinen Login-Bereich." />
      )}
    </CampaignBackground>
  );
}
