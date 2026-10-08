"use client";

import type { Campaign } from "@/lib/campaigns/schema";
import { CampaignLogo } from "./CampaignLogo";

const statusLabels: Record<Campaign["status"], string> = {
  draft: "Entwurf",
  awaiting_email_verification: "wartet auf E-Mail-Bestätigung",
  awaiting_approval: "wartet auf Freigabe",
  active: "aktiv",
  paused: "pausiert",
  archived: "beendet / archiviert",
  blocked: "blockiert",
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";

type CampaignManagerHeaderProps = {
  title: string;
  logoPath: string | null;
  status: Campaign["status"];
  ended: boolean;
  endedLabel: string | null;
  contactHref: string;
  publicUrl: string;
  onEditImage?: () => void;
};

function statusDotClass(status: Campaign["status"], ended: boolean): string {
  if (ended) return "bg-warmgrau/50";
  if (status === "active") return "bg-waldgruen";
  if (status === "paused") return "bg-bernstein";
  return "bg-warmgrau/50";
}

export function CampaignManagerHeader({
  title,
  logoPath,
  status,
  ended,
  endedLabel,
  contactHref,
  publicUrl,
  onEditImage,
}: CampaignManagerHeaderProps) {
  const showPublicLink = ended || status === "active";

  return (
    <section className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start md:gap-6">
        <CampaignLogo logoPath={logoPath} name={title} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Deine Kampagne
          </p>
          <h1 className="mt-1 break-words text-balance font-body text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark md:text-4xl">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-warmgrau/15 bg-creme px-3 py-1 font-body text-sm font-semibold text-waldgruen-dark">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${statusDotClass(status, ended)}`}
              />
              {ended ? "beendet" : statusLabels[status]}
            </span>
            {showPublicLink && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-11 items-center justify-center rounded-md border border-waldgruen/25 px-4 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen ${focusRing}`}
              >
                Kampagnenseite ansehen
              </a>
            )}
            {onEditImage && (
              <button
                type="button"
                onClick={onEditImage}
                className={`inline-flex min-h-11 items-center font-body text-sm font-semibold text-waldgruen-dark underline underline-offset-4 transition-colors hover:text-waldgruen ${focusRing}`}
              >
                {logoPath ? "Bild ändern" : "Bild hinzufügen"}
              </button>
            )}
          </div>
        </div>
      </div>

      {ended && endedLabel && (
        <div className="mt-5 border-t border-warmgrau/12 pt-5">
          <div className="border-l-4 border-waldgruen pl-4">
            <h2 className="font-typewriter text-lg font-bold text-waldgruen-dark md:text-xl">
              Beendet am {endedLabel}
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-warmgrau/75 md:text-base">
              Die Kampagnenseite bleibt online und zeigt den Endstand. Ändern lässt sich nichts mehr.
              Wenn du die Kampagne neu starten willst oder Fragen hast, schreib uns.
            </p>
          </div>
          <a
            href={contactHref}
            className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark sm:w-auto ${focusRing}`}
          >
            Kontakt aufnehmen
          </a>
        </div>
      )}

      {!ended && (status === "archived" || status === "blocked") && (
        <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/70">
          {status === "archived"
            ? "Diese Kampagne ist beendet und kann nicht mehr verändert werden."
            : "Diese Kampagne ist blockiert und kann nicht mehr verändert werden."}
        </p>
      )}
    </section>
  );
}
