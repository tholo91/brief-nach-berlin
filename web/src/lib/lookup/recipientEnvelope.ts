import type { RathausRecipient, Recipient } from "./rathausRecipient";

export interface RecipientEnvelope {
  /** Zeilen für den Umschlag, die erste ist der Name. */
  lines: string[];
  /** false: Straße oder Ort fehlen, die Anschrift muss von Hand ergänzt werden. */
  complete: boolean;
  searchUrl?: string;
}

function splitAddress(address: string): string[] {
  return address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function personName(recipient: { title: string | null; firstName: string; lastName: string }): string {
  return [recipient.title, recipient.firstName, recipient.lastName].filter(Boolean).join(" ");
}

export function rathausSearchUrl(recipient: RathausRecipient): string {
  const target =
    recipient.recipientKind === "bezirksamt"
      ? recipient.gemeindeName === "Berlin"
        ? "Bezirksamt Berlin Postanschrift"
        : `Bezirksamt ${recipient.gemeindeName} Postanschrift`
      : recipient.address.source === "destatis"
        ? `Bürgermeisteramt ${recipient.gemeindeName} Postanschrift`
        : "Bürgermeisteramt Postanschrift";
  return `https://www.google.com/search?q=${encodeURIComponent(target)}`;
}

// Gleiche Empfängerzeilen wie in der Brief-Mail, nur ohne HTML: läuft auch im Browser.
export function recipientEnvelope(recipient: Recipient): RecipientEnvelope {
  switch (recipient.kind) {
    case "mdb": {
      const street = splitAddress(recipient.postalAddress);
      return {
        lines: [`${personName(recipient)}, MdB`, "Deutscher Bundestag", ...street],
        complete: street.length >= 2,
      };
    }
    case "mdl": {
      const street = splitAddress(recipient.postalAddress);
      return { lines: [`${personName(recipient)}, MdL`, ...street], complete: street.length >= 2 };
    }
    case "mdb_later":
      return {
        lines: [recipient.label, "Deutscher Bundestag", ...splitAddress(recipient.postalAddress)],
        complete: true,
      };
    case "bundeskanzler":
      return {
        lines: [recipient.label, recipient.officeName, ...recipient.address.addressLines.slice(3)],
        complete: true,
      };
    case "landesregierung":
      return {
        lines:
          recipient.addressee === "head"
            ? [...recipient.address.addressLines]
            : [recipient.officeName, ...recipient.address.addressLines],
        complete: true,
      };
    case "campaign_fixed":
      return {
        lines: [
          recipient.organizationName,
          recipient.personName,
          `${recipient.address.street} ${recipient.address.houseNumber}`,
          `${recipient.address.postalCode} ${recipient.address.city}`,
        ].filter((line): line is string => Boolean(line)),
        complete: true,
      };
    case "rathaus":
      return recipient.address.source === "destatis"
        ? {
            lines: [
              recipient.label,
              recipient.address.streetAddress,
              `${recipient.address.postalCode} ${recipient.address.city}`,
            ],
            complete: true,
            searchUrl: rathausSearchUrl(recipient),
          }
        : { lines: [recipient.label], complete: false, searchUrl: rathausSearchUrl(recipient) };
  }
}
