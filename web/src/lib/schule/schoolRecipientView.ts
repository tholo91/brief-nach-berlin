import type { Recipient } from "@/lib/lookup/rathausRecipient";

/** Was die feste Empfänger-Karte im Schulmodus zeigt. Reine Anzeige, keine Entscheidung. */
export interface SchoolRecipientView {
  /** Kleine Marke über dem Namen: bei Personen ihre Rolle (z. B. "Senatorin"), sonst die Institution. Kann fehlen. */
  badge?: string;
  name: string;
  office?: string;
  addressLines: string[];
}

/** Kurze Rolle aus einem Amtstitel: "Senatorin für Bau, Mobilität" wird "Senatorin", "Bürgermeister, Senator für X" wird "Bürgermeister". */
export function roleBadge(title: string | undefined): string | undefined {
  const role = title?.split(",")[0]?.split(" für ")[0]?.trim();
  return role || undefined;
}

function withoutFirstIfName(lines: readonly string[], name: string): string[] {
  return lines[0] === name ? lines.slice(1) : [...lines];
}

export function describeSchoolRecipient(recipient: Recipient): SchoolRecipientView {
  switch (recipient.kind) {
    case "mdb":
    case "mdl": {
      const name = [recipient.title, recipient.firstName, recipient.lastName].filter(Boolean).join(" ");
      return {
        badge: recipient.kind === "mdb" ? "Bundestag" : "Landtag",
        name: recipient.party ? `${name} (${recipient.party})` : name,
        office: recipient.wahlkreisName ? `Wahlkreis ${recipient.wahlkreisName}` : undefined,
        addressLines: [recipient.postalAddress],
      };
    }
    case "mdb_later":
      return { badge: "Bundestag", name: recipient.label, addressLines: [recipient.postalAddress] };
    case "bundeskanzler":
      return {
        badge: "Bundeskanzler",
        name: recipient.label,
        office: recipient.officeName,
        addressLines: [recipient.postalAddress],
      };
    case "landesminister":
      return {
        badge: roleBadge(recipient.title),
        name: recipient.label,
        office: recipient.officeName,
        addressLines: withoutFirstIfName(recipient.address.addressLines, recipient.label),
      };
    case "landesregierung":
      return {
        badge: recipient.addressee === "head" ? roleBadge(recipient.headTitle) : undefined,
        name: recipient.label,
        office: recipient.officeName !== recipient.label ? recipient.officeName : undefined,
        addressLines: withoutFirstIfName(recipient.address.addressLines, recipient.label),
      };
    case "rathaus": {
      const lines =
        recipient.address.source === "official"
          ? [
              recipient.address.streetAddress,
              `${recipient.address.postalCode} ${recipient.address.city}`.trim(),
            ].filter(Boolean)
          : [];
      return {
        badge: recipient.recipientKind === "bezirksamt" ? "Bezirksamt" : "Rathaus",
        name: recipient.label,
        addressLines: lines,
      };
    }
    case "campaign_fixed":
      return { badge: "Empfänger", name: recipient.label, addressLines: [] };
  }
}
