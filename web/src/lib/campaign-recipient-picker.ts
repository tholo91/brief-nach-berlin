import type { Politician } from "@/lib/types/politician";

type PickerPolitician = Pick<
  Politician,
  | "id"
  | "firstName"
  | "lastName"
  | "party"
  | "wahlkreisName"
  | "isDirect"
  | "committees"
>;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function initialPoliticianId(
  politicians: readonly PickerPolitician[],
  options: {
    ambiguousLand: boolean;
    campaignRestricted: boolean;
    campaignRestrictedNoLocalMatch: boolean;
  }
): number | null {
  if (options.ambiguousLand || options.campaignRestrictedNoLocalMatch) return null;

  const direct = politicians.find((politician) => politician.isDirect);
  if (direct) return direct.id;

  if (options.campaignRestricted && politicians.length === 1) {
    return politicians[0].id;
  }

  return politicians.length === 1 && politicians[0].id === -1 ? -1 : null;
}

export function filterCampaignRecipients<T extends PickerPolitician>(
  politicians: readonly T[],
  query: string,
  parties: readonly string[] = []
): T[] {
  const normalizedQuery = normalize(query);
  const selectedParties = new Set(parties);

  return politicians.filter((politician) => {
    const matchesQuery =
      !normalizedQuery ||
      normalize(
        [
          politician.firstName,
          politician.lastName,
          politician.party,
          politician.wahlkreisName,
          ...(politician.committees ?? []),
        ].join(" ")
      ).includes(normalizedQuery);
    const matchesParty =
      selectedParties.size === 0 || selectedParties.has(politician.party);

    return matchesQuery && matchesParty;
  });
}

export function visibleLocalCampaignRecipients<T extends PickerPolitician>(
  politicians: readonly T[],
  selectedId: number | null,
  expanded: boolean
): T[] {
  if (expanded || politicians.length <= 1 || selectedId === null) {
    return [...politicians];
  }

  const selected = politicians.find((politician) => politician.id === selectedId);
  return selected ? [selected] : [...politicians];
}

export function bundRecipientsForCampaign<T>(
  campaignPoliticians: readonly T[],
  routedPoliticians: readonly T[],
  campaignRestricted: boolean
): T[] {
  return [...(campaignRestricted ? campaignPoliticians : routedPoliticians)];
}
