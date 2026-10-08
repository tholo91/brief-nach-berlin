import { CampaignQrDownload } from "./CampaignQrDownload";
import { CampaignUrlCopyField } from "./CampaignUrlCopyField";

type CampaignShareCardProps = {
  publicUrl: string;
  compactUrl: string | null;
  slug: string;
  logoUrl: string | null;
  linkInactive: boolean;
};

export function CampaignShareCard({
  publicUrl,
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
      <h2
        id="campaign-share-heading"
        className="font-typewriter text-lg font-bold text-waldgruen-dark md:text-2xl"
      >
        Kampagne teilen
      </h2>
      <div className="mt-4 grid max-w-xl gap-3">
        <CampaignUrlCopyField url={publicUrl} variant="compact" />
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
