import { useUiCopy } from "@/components/i18n/LocaleProvider";
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
  const copy = useUiCopy().wizard.rathaus;
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
          <p className="font-semibold text-waldgruen-dark">{copy.officialHeading}</p>
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
            {copy.sourceLead}{" "}
            <a
              href={officialAddress.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={officialAddress.sourceTitle}
              className="font-semibold text-waldgruen-dark underline underline-offset-2"
            >
              {officialAddress.sourceName}
            </a>
            {copy.googleLead.replace("{date}", () => officialAddress.sourceStand)}{" "}
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-waldgruen-dark underline underline-offset-2"
            >
              {copy.googleLink}
            </a>{" "}
            {copy.googleTail}
          </p>
        </>
      ) : recipient.ambiguous && recipient.candidates && recipient.candidates.length > 0 ? (
        <div className="text-warmgrau leading-relaxed">
          <RathausCandidateList candidates={recipient.candidates} />
        </div>
      ) : (
        <>
          <p className="text-warmgrau leading-relaxed">
            {copy.noAddress}
          </p>
          <RathausSearchButton href={searchUrl} className="self-start" />
        </>
      )}
    </div>
  );
}
