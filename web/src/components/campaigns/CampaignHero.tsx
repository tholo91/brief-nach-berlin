import type { Campaign } from "@/lib/campaigns/schema";
import { CampaignIssueStarter } from "./CampaignIssueStarter";

type PublicCampaign = Pick<
  Campaign,
  "slug" | "title" | "issueText" | "description" | "creatorName" | "externalUrl"
>;

export function CampaignHero({ campaign }: { campaign: PublicCampaign }) {
  const attribution = campaign.creatorName?.trim();

  return (
    <section className="relative overflow-hidden bg-creme">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(98,138,90,0.18),transparent_34%),linear-gradient(180deg,rgba(250,248,245,0.76),rgba(250,248,245,1))]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-12 pt-12 md:grid-cols-[0.88fr_1.12fr] md:pb-18 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Kampagne
          </p>
          <h1 className="mt-4 font-typewriter text-4xl font-bold leading-tight text-waldgruen-dark md:text-5xl">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="mt-5 font-body text-lg leading-relaxed text-warmgrau/75">
              {campaign.description}
            </p>
          )}
          {attribution && (
            <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/70">
              Gestartet von{" "}
              {campaign.externalUrl ? (
                <a
                  href={campaign.externalUrl}
                  className="font-semibold text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 transition-colors hover:text-waldgruen"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {attribution}
                </a>
              ) : (
                <span className="font-semibold text-waldgruen-dark">{attribution}</span>
              )}
            </p>
          )}
          <p className="mt-6 rounded-md border border-warmgrau/15 bg-white/60 px-4 py-3 font-body text-sm leading-relaxed text-warmgrau/70">
            Hinweis: Brief nach Berlin stellt nur das Werkzeug bereit. Ich mache
            mir den von der Kampagne vorgegebenen Text nicht zu eigen und
            uebernehme keine Haftung fuer Inhalte der Erstellerinnen.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 font-handwriting text-xl leading-snug text-warmgrau">
            Passe das Anliegen so an, dass es nach dir klingt. Danach geht es im
            normalen Brief-Flow weiter.
          </p>
          <CampaignIssueStarter
            slug={campaign.slug}
            initialIssueText={campaign.issueText}
          />
        </div>
      </div>
    </section>
  );
}
