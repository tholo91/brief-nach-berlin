export type PoliticalLevel = "Bund" | "Land" | "Kommune";

export interface Politician {
  id: number;            // candidacy_mandate ID from Abgeordnetenwatch
  politicianId: number;  // politician entity ID
  firstName: string;
  lastName: string;
  title: string | null;  // academic title (Dr., Prof., etc.)
  party: string;         // e.g. "SPD", "CDU"
  wahlkreisId: number;
  wahlkreisName: string;
  level: PoliticalLevel;
  postalAddress: string;  // Standard Bundestag formula for MdBs: 'Platz der Republik 1, 11011 Berlin'
  isDirect: boolean;     // Held the Direktmandat (Erststimmensieg) for this Wahlkreis
  abgeordnetenwatchUrl: string | null;  // Public profile URL on abgeordnetenwatch.de
  committees?: string[]; // Committee labels for current legislature, fetched at build time
  bundeslandKey?: string; // ISO 3166-2:DE letter code ("NW", "BY", ...); set for Landtag entries
}

export interface PoliticiansCache {
  bundestag: Politician[];
  landtag: Politician[];
  kommune: Politician[];
  lastUpdated: string;   // ISO date string
}
