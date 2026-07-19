import type { RathausRecipient } from "@/lib/lookup/rathausRecipient";

interface RathausAdresseButtonProps {
  recipient: RathausRecipient;
  className?: string;
}

export function RathausAdresseButton({
  recipient,
  className,
}: RathausAdresseButtonProps) {
  const isBezirksamt = recipient.recipientKind === "bezirksamt";
  const searchTarget = isBezirksamt
    ? recipient.gemeindeName === "Berlin"
      ? "Bezirksamt Berlin Postanschrift"
      : `Bezirksamt ${recipient.gemeindeName} Postanschrift`
    : recipient.address.source === "destatis"
      ? `Bürgermeisteramt ${recipient.gemeindeName} Postanschrift`
      : "Bürgermeisteramt Postanschrift";
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTarget)}`;
  const officialAddress =
    recipient.address.source === "destatis" ? recipient.address : null;

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
            {recipient.label}
            <br />
            {officialAddress.streetAddress}
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
              Destatis
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
      ) : (
        <p className="text-warmgrau leading-relaxed">
          Für diese Postleitzahl lässt sich keine eindeutige amtliche Anschrift
          zuordnen. Ergänze in der Suche deinen Wohnort und prüfe die Adresse,
          bevor du den Brief abschickst. Die genaue Anschrift findest du {" "}
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-waldgruen-dark underline underline-offset-2"
          >
            hier
          </a>
          .
        </p>
      )}
    </div>
  );
}
