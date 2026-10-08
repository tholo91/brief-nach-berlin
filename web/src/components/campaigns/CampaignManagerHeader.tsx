"use client";

import type { Campaign } from "@/lib/campaigns/schema";
import { CampaignLogo } from "./CampaignLogo";
import { ExternalLinkIcon } from "./ExternalLinkIcon";

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

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.2 2.3a1.6 1.6 0 0 1 2.3 2.3L5.4 12.7l-3.1.8.8-3.1 8.1-8.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  // Keeps the trailing icon glued to the last word so it never wraps alone.
  const lastSpace = title.lastIndexOf(" ");
  const titleHead = lastSpace === -1 ? "" : title.slice(0, lastSpace + 1);
  const titleTail = title.slice(lastSpace + 1);

  return (
    <section className="rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-4 sm:items-start md:gap-x-6">
        <div className="flex sm:row-span-2">
          {onEditImage ? (
            <button
              type="button"
              onClick={onEditImage}
              aria-label={logoPath ? "Bild ändern" : "Bild hinzufügen"}
              className={`group relative flex rounded-full ${focusRing}`}
            >
              <CampaignLogo logoPath={logoPath} name={title} size="lg" />
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center rounded-full bg-waldgruen-dark/60 font-body text-xs font-semibold text-creme opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {logoPath ? "Ändern" : "Hinzufügen"}
              </span>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-waldgruen text-creme shadow-sm"
              >
                <PencilIcon />
              </span>
            </button>
          ) : (
            <CampaignLogo logoPath={logoPath} name={title} size="lg" />
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="whitespace-nowrap font-typewriter text-xs font-bold uppercase tracking-wider text-waldgruen/60 sm:text-sm sm:tracking-widest">
            Deine Kampagne
          </p>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-warmgrau/15 bg-creme px-3 py-1 font-body text-sm font-semibold text-waldgruen-dark">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${statusDotClass(status, ended)}`}
            />
            {ended ? "beendet" : statusLabels[status]}
          </span>
        </div>
        <h1 className="col-span-2 break-words text-balance font-body text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark sm:col-span-1 sm:col-start-2 md:text-4xl">
          {showPublicLink ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-sm decoration-waldgruen/40 decoration-2 underline-offset-4 transition-colors hover:underline ${focusRing}`}
            >
              {titleHead}
              <span className="whitespace-nowrap">
                {titleTail}
                <ExternalLinkIcon className="ml-2 inline-block h-[0.6em] w-[0.6em] align-baseline text-waldgruen/45 transition-colors group-hover:text-waldgruen" />
              </span>
              <span className="sr-only"> (Kampagnenseite, öffnet in neuem Tab)</span>
            </a>
          ) : (
            title
          )}
        </h1>
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
