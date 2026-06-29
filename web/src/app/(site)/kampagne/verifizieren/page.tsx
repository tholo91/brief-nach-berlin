import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyCampaignEmailAction } from "@/lib/actions/verifyCampaignEmail";
import { CampaignShareActions } from "@/components/campaigns/CampaignShareActions";
import { CampaignUrlCopyField } from "@/components/campaigns/CampaignUrlCopyField";
import { CAMPAIGN_CREATOR_FEEDBACK_URL } from "@/lib/config";
import { getCampaignBySlug } from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";
import { buildShareTarget } from "@/lib/share";

export const metadata: Metadata = {
  title: "Kampagne bestätigen | Brief nach Berlin",
  alternates: { canonical: "/kampagne/verifizieren" },
};

async function confirmCampaignEmail(token: string) {
  "use server";

  const result = await verifyCampaignEmailAction(token);
  if (result.status === "activated") {
    redirect(
      `/kampagne/verifizieren?status=aktiv&slug=${encodeURIComponent(result.slug)}`
    );
  }
  redirect(`/kampagne/verifizieren?status=${encodeURIComponent(result.status)}`);
}

export default async function VerifyCampaignEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string; slug?: string }>;
}) {
  const params = await searchParams;
  if (params.status === "aktiv" && params.slug) {
    const parsedSlug = campaignSlugSchema.safeParse(params.slug);
    const campaign = parsedSlug.success
      ? await getCampaignBySlug(parsedSlug.data)
      : null;
    const share = parsedSlug.success
      ? buildShareTarget(
          { slug: parsedSlug.data, title: campaign?.title },
          "creator"
        )
      : null;

    return (
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne bestätigen
          </p>
          <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
            Kampagne ist aktiv
          </h1>
          <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
            Deine E-Mail ist bestätigt. Die Kampagne ist jetzt aktiv.
          </p>
          {share && (
            <>
              <div className="mt-6">
                <CampaignUrlCopyField url={share.url} />
              </div>
              <div className="mt-6">
                <p className="mb-3 font-body text-sm leading-relaxed text-warmgrau/70">
                  Teile diesen Link mit Menschen, die ihren eigenen Brief aus der Kampagne starten sollen.
                </p>
                <CampaignShareActions share={share} />
              </div>
              <a
                href={CAMPAIGN_CREATOR_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-waldgruen/25 bg-white px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
              >
                Feedback geben
              </a>
            </>
          )}
          <Link
            href={`/kampagne/${parsedSlug.success ? parsedSlug.data : params.slug}`}
            className="mt-6 inline-block rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
          >
            Kampagne ansehen
          </Link>
        </div>
      </section>
    );
  }

  if (params.token) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne bestätigen
          </p>
          <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
            E-Mail-Bestätigung abschließen
          </h1>
          <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
            Klicke auf den Button, damit deine Kampagne öffentlich wird. So
            verhindern wir, dass automatische E-Mail-Prüfungen den Link vor dir
            auslösen.
          </p>
          <form action={confirmCampaignEmail.bind(null, params.token)} className="mt-6">
            <button
              type="submit"
              className="inline-block rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
            >
              Kampagne jetzt bestätigen
            </button>
          </form>
        </div>
      </section>
    );
  }

  const result = {
    status: params.status ?? "invalid",
    message:
      params.status === "already_used"
        ? "Dieser Bestätigungslink wurde bereits genutzt oder ist abgelaufen."
        : params.status === "blocked"
          ? "Die E-Mail ist bestätigt, aber der aktuelle Kampagnentext wurde nicht freigeschaltet."
          : params.status === "error"
            ? "Die Bestätigung konnte gerade nicht abgeschlossen werden. Bitte versuch es später noch einmal."
            : "Dieser Bestätigungslink ist unvollständig.",
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <div className="rounded-2xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
        <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          Kampagne bestätigen
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
          Bestätigung verarbeitet
        </h1>
        <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
          {result.message}
        </p>
        <Link
          href="/kampagne/starten"
          className="mt-6 inline-block rounded-md border border-waldgruen/25 px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
        >
          Zurück zum Kampagnenstart
        </Link>
      </div>
    </section>
  );
}
