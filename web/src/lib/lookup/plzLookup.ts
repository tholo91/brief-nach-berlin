import type { Politician, PoliticiansCache } from "../types/politician";
import plzMappingJson from "../../../data/plz-wahlkreis-mapping.json";
import politiciansJson from "../../../data/politicians-cache.json";

const plzMapping = plzMappingJson as Record<string, number[]>;
const politiciansCache = politiciansJson as PoliticiansCache;

export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] } {
  const wahlkreisIds = plzMapping[plz] ?? [];

  if (wahlkreisIds.length === 0) {
    // If PLZ has no wahlkreise, we skip filtering the politicians and leave politicians array empty, 
    // which will trigger the fallback below.
  }

  const allPoliticians = [
    ...politiciansCache.bundestag,
    ...politiciansCache.landtag,
    ...politiciansCache.kommune,
  ];

  const politicians = allPoliticians.filter((p) =>
    wahlkreisIds.includes(p.wahlkreisId)
  );

  if (politicians.length === 0) {
    const fallbackWahlkreis = wahlkreisIds.length > 0 ? `Wahlkreis ${wahlkreisIds[0]}` : "Unbekannter Wahlkreis";
    const fallbackWahlkreisId = wahlkreisIds.length > 0 ? wahlkreisIds[0] : 0;
    
    politicians.push({
      id: -1,
      politicianId: -1,
      firstName: "",
      lastName: "MdB",
      title: null,
      party: "Unbekannt",
      wahlkreisId: fallbackWahlkreisId,
      wahlkreisName: fallbackWahlkreis,
      level: "Bund",
      postalAddress: "Platz der Republik 1, 11011 Berlin",
      isDirect: false,
      abgeordnetenwatchUrl: `https://www.bundestag.de/abgeordnete/wahlkreissuche?wknr=${fallbackWahlkreisId}`,
    });
  }

  return { wahlkreisIds, politicians };
}
