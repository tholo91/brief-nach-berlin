import type { RathausCandidate } from "@/lib/lookup/rathausRecipient";
import { formatBezirkeList } from "@/lib/lookup/recipientEnvelope";

/** Hinweis für Berliner PLZ in mehreren Bezirken: Kandidaten mit Adresse, keine Auswahl. */
export function RathausCandidateList({ candidates }: { candidates: RathausCandidate[] }) {
  if (candidates.length === 0) return null;
  return (
    <>
      <p className="mt-1">
        Deine PLZ liegt in {formatBezirkeList(candidates.map((c) => c.bezirk))}. Nimm die
        Adresse deines Bezirks:
      </p>
      <ul className="mt-2 flex list-none flex-col gap-2 p-0">
        {candidates.map((candidate) => (
          <li key={candidate.bezirk}>
            <address className="not-italic leading-relaxed">
              <span className="font-semibold text-waldgruen-dark">{candidate.label}</span>
              {candidate.streetAddress && (
                <>
                  <br />
                  {candidate.streetAddress}
                </>
              )}
              <br />
              {candidate.postalCode} {candidate.city}
            </address>
          </li>
        ))}
      </ul>
    </>
  );
}

export function RathausSearchButton({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-lg bg-waldgruen px-4 py-2.5",
        "font-body text-sm font-semibold text-creme transition-colors hover:bg-waldgruen-dark",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        className ?? "",
      ].join(" ")}
    >
      Adresse suchen
    </a>
  );
}
