import type { Politician, PoliticiansCache } from "../types/politician";
import plzMappingJson from "../../../data/plz-wahlkreis-mapping.json";
import politiciansJson from "../../../data/politicians-cache.json";

const plzMapping = plzMappingJson as Record<string, number[]>;
const politiciansCache = politiciansJson as PoliticiansCache;

export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] } {
  const wahlkreisIds = plzMapping[plz] ?? [];

  if (wahlkreisIds.length === 0) {
    return { wahlkreisIds: [], politicians: [] };
  }

  const allPoliticians = [
    ...politiciansCache.bundestag,
    ...politiciansCache.landtag,
    ...politiciansCache.kommune,
  ];

  const politicians = allPoliticians.filter((p) =>
    wahlkreisIds.includes(p.wahlkreisId)
  );

  return { wahlkreisIds, politicians };
}
