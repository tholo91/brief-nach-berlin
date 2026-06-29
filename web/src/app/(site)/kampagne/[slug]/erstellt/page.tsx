import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAMPAIGN_CREATOR_FEEDBACK_URL } from "@/lib/config";
import { getCampaignBySlug } from "@/lib/campaigns/repository";
import { campaignSlugSchema } from "@/lib/campaigns/schema";

type CampaignCreatedPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CampaignCreatedPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return {};

  return {
    title: "Kampagne angelegt | Brief nach Berlin",
    alternates: { canonical: `/kampagne/${parsedSlug.data}/erstellt` },
  };
}

export default async function CampaignCreatedPage({
  params,
}: CampaignCreatedPageProps) {
  const { slug: rawSlug } = await params;
  const parsedSlug = campaignSlugSchema.safeParse(rawSlug);
  if (!parsedSlug.success) notFound();

  const campaign = await getCampaignBySlug(parsedSlug.data);
  if (!campaign) notFound();

  return (
    <section className="relative overflow-hidden bg-creme">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(98,138,90,0.14),transparent_42%)]" />
      <div className="relative mx-auto max-w-2xl px-6 py-14 md:py-20">
        <div className="rounded-xl border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne angelegt
          </p>
          <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark md:text-4xl">
            Bitte bestätige jetzt deine E-Mail.
          </h1>
          <p className="mt-5 font-body text-base leading-relaxed text-warmgrau/75">
            Wir haben dir den Freischaltlink geschickt. Erst nach dem Klick in dieser E-Mail wird die Kampagne öffentlich und kann von anderen genutzt werden.
          </p>

          <div className="mt-6 rounded-md border border-waldgruen/15 bg-creme/70 px-4 py-4">
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
              So geht es weiter
            </p>
            <ol className="mt-3 grid gap-3 font-body text-sm leading-relaxed text-warmgrau/75">
              <li>
                <strong className="text-waldgruen-dark">1. E-Mail bestätigen.</strong>{" "}
                Ohne Bestätigung bleibt die Kampagne unsichtbar.
              </li>
              <li>
                <strong className="text-waldgruen-dark">2. Verwaltungslink aufbewahren.</strong>{" "}
                Damit kannst du Inhalte später bearbeiten, pausieren oder archivieren.
              </li>
              <li>
                <strong className="text-waldgruen-dark">3. Kampagne teilen.</strong>{" "}
                Teile den Link, sobald die Kampagne aktiv ist.
              </li>
            </ol>
          </div>

          <div className="mt-6 rounded-md border border-warmgrau/15 bg-white/65 px-4 py-4">
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
              Teilen kommt gleich
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
              Nach deiner Bestätigung bekommst du die aktive Kampagnenseite und den Verwaltungslink per E-Mail.
            </p>
          </div>

          <a
            href={CAMPAIGN_CREATOR_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-waldgruen/25 bg-white px-5 py-3 font-body text-base font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen"
          >
            Feedback geben
          </a>

          {campaign.status === "active" && (
            <Link
              href={`/kampagne/${campaign.slug}`}
              className="mt-6 inline-flex rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
            >
              Kampagne ansehen
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
