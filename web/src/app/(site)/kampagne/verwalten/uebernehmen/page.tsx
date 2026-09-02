import type { Metadata } from "next";
import { CampaignBackground } from "@/components/campaigns/CampaignBackground";
import { acceptCampaignTransferAction } from "@/lib/actions/acceptCampaignTransfer";
import { getCampaignById } from "@/lib/campaigns/repository";
import { getUsableCampaignTransferToken } from "@/lib/campaigns/tokens";

export const metadata: Metadata = {
  title: "Kampagne übernehmen | Brief-nach-Berlin",
  robots: { index: false, follow: false },
};

export default async function AcceptCampaignTransferPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const transfer = token
    ? await getUsableCampaignTransferToken(token).catch(() => null)
    : null;
  const campaign = transfer ? await getCampaignById(transfer.campaignId).catch(() => null) : null;

  return (
    <CampaignBackground>
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne übernehmen
          </p>
          {campaign ? (
            <>
              <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
                {campaign.title}
              </h1>
              <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
                Du wurdest eingeladen, diese Kampagne künftig zu verwalten. Mit deiner Bestätigung wird deine E-Mail als neue Inhaberin eingetragen.
              </p>
              <form action={acceptCampaignTransferAction} className="mt-7 grid gap-3">
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
                >
                  Kampagne jetzt übernehmen
                </button>
              </form>
              <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/60">
                Der Link ist nur einmal verwendbar. Wenn du diese Übergabe nicht erwartest, kannst du die Seite schließen.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
                Link nicht mehr gültig
              </h1>
              <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
                Der Übernahme-Link wurde bereits verwendet, ist abgelaufen oder gehört nicht mehr zu einer aktiven Kampagne.
              </p>
            </>
          )}
        </div>
      </section>
    </CampaignBackground>
  );
}
