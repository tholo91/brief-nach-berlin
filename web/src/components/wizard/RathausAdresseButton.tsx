import type { RathausRecipient } from "@/lib/lookup/rathausRecipient";
import { rathausSearchUrl } from "@/lib/lookup/recipientEnvelope";
import { RathausCandidateList, RathausSearchButton } from "./RathausHinweise";

interface RathausAdresseButtonProps {
  recipient: RathausRecipient;
  className?: string;
}

export function RathausAdresseButton({
  recipient,
  className,
}: RathausAdresseButtonProps) {
  const searchUrl = rathausSearchUrl(recipient);
  const officialAddress =
    recipient.address.source === "official" ? recipient.address : null;

  return (
    <div
      role="note"
      className={[
        "rounded-xl border border-warmgrau/25 bg-creme/70 p-4",
        "flex flex-col gap-2.5 text-sm font-body",
        className ?? "",
      ].join(" ")}
    >
      {officialAddress ? (
        <>
          <p className="font-semibold text-waldgruen-dark">Amtliche Postanschrift</p>
          <address className="not-italic text-warmgrau leading-relaxed">
            {officialAddress.recipientLine ?? recipient.label}
            {officialAddress.streetAddress && (
              <>
                <br />
                {officialAddress.streetAddress}
              </>
            )}
            <br />
            {officialAddress.postalCode} {officialAddress.city}
          </address>
          <p className="text-xs text-warmgrau/70 leading-relaxed">
            Quelle:{" "}
            <a
              href={officialAddress.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={officialAddress.sourceTitle}
              className="font-semibold text-waldgruen-dark underline underline-offset-2"
            >
              {officialAddress.sourceName}
            </a>
            , Stand {officialAddress.sourceStand}. Du kannst die Adresse bei Google noch einmal{" "}
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-waldgruen-dark underline underline-offset-2"
            >
              hier
            </a>{" "}
            prüfen.
          </p>
        </>
      ) : recipient.ambiguous && recipient.candidates && recipient.candidates.length > 0 ? (
        <div className="text-warmgrau leading-relaxed">
          <RathausCandidateList candidates={recipient.candidates} />
        </div>
      ) : (
        <>
          <p className="text-warmgrau leading-relaxed">
            Die Postanschrift konnte ich für deine PLZ nicht sicher zuordnen.
          </p>
          <RathausSearchButton href={searchUrl} className="self-start" />
        </>
      )}
    </div>
  );
}
