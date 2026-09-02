import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { CampaignManager } from "@/components/campaigns/CampaignManager";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";

function PendingApprovalNotice({ campaign }: { campaign: NonNullable<Awaited<ReturnType<typeof getCampaignById>>> }) {
  return (
    <>
    <section className="mx-auto max-w-2xl px-6 py-10 md:py-14">
      <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
        <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          Kampagne verwalten
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
          Kampagne wartet auf Freigabe
        </h1>
        <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
          Thomas prüft Kampagnen in der Regel innerhalb von 24 Stunden. Du kannst die Angaben bis dahin noch korrigieren. Die Kampagne bleibt bis zur Freigabe privat.
        </p>
      </div>
    </section>
    <section className="relative mx-auto max-w-4xl px-6 pb-14 md:pb-20">
      <CampaignManager campaign={campaign} />
    </section>
    </>
  );
}

export const metadata: Metadata = {
  title: "Kampagne verwalten | Brief-nach-Berlin",
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
  searchParams: Promise<{ token?: string; transfer?: string }>;
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

  const transferMessage =
    params.transfer === "accepted"
      ? "Die Kampagne wurde übertragen. Du bist jetzt als neue Inhaberin eingetragen. Eine neue Verwaltungs-Mail wurde verschickt."
      : params.transfer === "mail_failed"
        ? "Die Übergabe ist abgeschlossen, aber die neue Verwaltungs-Mail konnte nicht verschickt werden. Bewahre diesen Verwaltungszugang auf und melde dich, wenn du einen neuen Link brauchst."
        : params.transfer === "error"
          ? "Die Übergabe konnte nicht abgeschlossen werden. Der Link ist möglicherweise ungültig oder die Kampagne wurde inzwischen beendet."
          : null;

  const authorizedCampaign =
    campaign && session && campaign.creatorEmail.toLowerCase() === session.creatorEmail.toLowerCase()
      ? campaign
      : null;

  return (
    <CampaignBackground>
      {authorizedCampaign ? (
        <>
          {transferMessage && (
            <section className="mx-auto max-w-4xl px-6 pt-10 md:pt-14">
              <div className="rounded-md border border-waldgruen/20 bg-waldgruen/8 px-4 py-3 font-body text-sm leading-relaxed text-waldgruen-dark">
                {transferMessage}
              </div>
            </section>
          )}
          {authorizedCampaign.status === "awaiting_approval" ? (
            <PendingApprovalNotice campaign={authorizedCampaign} />
          ) : (
            <section className="relative mx-auto max-w-4xl px-6 py-14 md:py-20">
              <CampaignManager campaign={authorizedCampaign} />
            </section>
          )}
        </>
      ) : (
        <AccessNotice message="Bitte öffne den aktuellen Verwaltungslink aus deiner Kampagnen-E-Mail. Es gibt keine Nutzerkonten und keinen Login-Bereich." />
      )}
    </CampaignBackground>
  );
}
