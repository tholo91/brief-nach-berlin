import { readFileSync } from "fs";
import { join } from "path";
import type { Politician, PoliticiansCache } from "../types/politician";

// Module-scope caching — parsed once, reused across requests
let _plzMapping: Record<string, number[]> | null = null;
let _politiciansCache: PoliticiansCache | null = null;

function loadPlzMapping(): Record<string, number[]> {
  if (_plzMapping) return _plzMapping;

  // Try relative path from web/ root (development), then fallback to data/ inside web/
  const primaryPath = join(process.cwd(), "../data/plz-wahlkreis-mapping.json");
  const fallbackPath = join(process.cwd(), "data/plz-wahlkreis-mapping.json");

  try {
    _plzMapping = JSON.parse(readFileSync(primaryPath, "utf-8"));
  } catch {
    try {
      _plzMapping = JSON.parse(readFileSync(fallbackPath, "utf-8"));
    } catch {
      // Data files not yet present — return empty mapping (build-time scripts generate these)
      _plzMapping = {};
    }
  }

  return _plzMapping!;
}

function loadPoliticiansCache(): PoliticiansCache {
  if (_politiciansCache) return _politiciansCache;

  const primaryPath = join(process.cwd(), "../data/politicians-cache.json");
  const fallbackPath = join(process.cwd(), "data/politicians-cache.json");

  try {
    _politiciansCache = JSON.parse(readFileSync(primaryPath, "utf-8"));
  } catch {
    try {
      _politiciansCache = JSON.parse(readFileSync(fallbackPath, "utf-8"));
    } catch {
      // Data files not yet present — return empty cache
      _politiciansCache = {
        bundestag: [],
        landtag: [],
        kommune: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  return _politiciansCache!;
}

export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] } {
  const mapping = loadPlzMapping();
  const cache = loadPoliticiansCache();

  const wahlkreisIds = mapping[plz] ?? [];

  if (wahlkreisIds.length === 0) {
    return { wahlkreisIds: [], politicians: [] };
  }

  // Include politicians from all levels (Bundestag, Landtag, Kommune)
  const allPoliticians = [
    ...cache.bundestag,
    ...(cache.landtag || []),
    ...(cache.kommune || []),
  ];

  const politicians = allPoliticians.filter((p) =>
    wahlkreisIds.includes(p.wahlkreisId)
  );

  return { wahlkreisIds, politicians };
}
