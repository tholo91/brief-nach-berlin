import { CampaignQrDownload } from "./CampaignQrDownload";
import { CampaignUrlCopyField } from "./CampaignUrlCopyField";
import { ExternalLinkIcon } from "./ExternalLinkIcon";

type CampaignShareCardProps = {
  publicUrl: string;
  shareUrl: string;
  compactUrl: string | null;
  slug: string;
  logoUrl: string | null;
  linkInactive: boolean;
};

export function CampaignShareCard({
  publicUrl,
  shareUrl,
  compactUrl,
  slug,
  logoUrl,
  linkInactive,
}: CampaignShareCardProps) {
  return (
    <section
      aria-labelledby="campaign-share-heading"
      className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="campaign-share-heading"
          className="font-typewriter text-lg font-bold text-waldgruen-dark md:text-2xl"
        >
          Kampagne teilen
        </h2>
        {!linkInactive && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-waldgruen/25 px-4 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
          >
            Kampagnenseite ansehen
            <ExternalLinkIcon />
            <span className="sr-only">(öffnet in neuem Tab)</span>
          </a>
        )}
      </div>
      <div className="mt-4 grid max-w-xl gap-3">
        <CampaignUrlCopyField url={shareUrl} variant="compact" />
        {compactUrl && (
          <CampaignUrlCopyField
            url={compactUrl}
            label="Kurzlink für Radio und Podcast"
            variant="compact"
          />
        )}
        {linkInactive && (
          <p className="font-body text-sm text-warmgrau/70">
            Die Seite ist nur erreichbar, solange die Kampagne aktiv ist.
          </p>
        )}
      </div>
      <div className="mt-5 border-t border-warmgrau/12 pt-5">
        <CampaignQrDownload url={publicUrl} slug={slug} logoUrl={logoUrl} />
      </div>
    </section>
  );
}
