import Link from "next/link";
import Image from "next/image";
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

function CampaignCreatorMark() {
  return (
    <Image
      src="/images/campaign-creator-icon.webp"
      alt=""
      width={64}
      height={64}
      className="mx-auto h-16 w-16"
      priority
    />
  );
}

function ViewIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        d="M2.25 9s2.45-4.5 6.75-4.5S15.75 9 15.75 9 13.3 13.5 9 13.5 2.25 9 2.25 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.75A1.75 1.75 0 1 0 9 7.25a1.75 1.75 0 0 0 0 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

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
      <section className="relative overflow-hidden bg-creme">
        <div className="mx-auto grid max-w-2xl gap-5 px-6 py-14 md:py-20">
          <div className="rounded-md border border-warmgrau/12 bg-white/80 p-6 text-center shadow-sm md:p-8">
            <CampaignCreatorMark />
            <p className="mt-4 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Kampagne bestätigen
            </p>
            <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              Kampagne ist aktiv
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-warmgrau/75">
              Deine E-Mail ist bestätigt. Die Kampagne ist öffentlich und kann jetzt geteilt werden.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/kampagne/${parsedSlug.success ? parsedSlug.data : params.slug}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
              >
                <ViewIcon />
                Kampagne ansehen
              </Link>
              <a
                href={CAMPAIGN_CREATOR_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-waldgruen/25 bg-white px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
              >
                Feedback geben
              </a>
            </div>
          </div>
          {share && (
            <div className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-6">
              <CampaignUrlCopyField url={share.url} variant="compact" />
              <div className="mt-5">
                <p className="mb-3 font-body text-sm leading-relaxed text-warmgrau/70">
                  Teile diesen Link mit Menschen, die ihren eigenen Brief aus der Kampagne starten sollen.
                </p>
                <CampaignShareActions share={share} />
              </div>
            </div>
          )}
          <p className="text-center font-body text-sm leading-relaxed text-warmgrau/55">
            Den Verwaltungslink bekommst du separat per E-Mail. Bewahre ihn gut auf.
          </p>
        </div>
      </section>
    );
  }

  if (params.token) {
    return (
      <section className="relative overflow-hidden bg-creme">
        <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
          <div className="rounded-md border border-warmgrau/12 bg-white/80 p-6 text-center shadow-sm md:p-8">
            <CampaignCreatorMark />
            <p className="mt-4 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
              Kampagne bestätigen
            </p>
            <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
              E-Mail-Bestätigung abschließen
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-warmgrau/75">
              Klicke auf den Button, damit deine Kampagne öffentlich wird. So verhindern wir, dass automatische E-Mail-Prüfungen den Link vor dir auslösen.
            </p>
            <form
              action={confirmCampaignEmail.bind(null, params.token)}
              className="mt-6"
            >
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark sm:w-auto"
              >
                Kampagne jetzt bestätigen
              </button>
            </form>
          </div>
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
    <section className="relative overflow-hidden bg-creme">
      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <div className="rounded-md border border-warmgrau/12 bg-white/80 p-6 text-center shadow-sm md:p-8">
          <CampaignCreatorMark />
          <p className="mt-4 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne bestätigen
          </p>
          <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
            Bestätigung verarbeitet
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-warmgrau/75">
            {result.message}
          </p>
          <Link
            href="/kampagne/starten"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-waldgruen/25 bg-white px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
          >
            Zurück zum Kampagnenstart
          </Link>
        </div>
      </div>
    </section>
  );
}
