import type { Politician, PoliticiansCache, PoliticalLevel } from "../types/politician";
import plzMappingJson from "../../../data/plz-wahlkreis-mapping.json";
import politiciansJson from "../../../data/politicians-cache.json";
import plzBundeslandJson from "../../../data/plz-bundesland-mapping.json";
import plzLandtagWahlkreisJson from "../../../data/plz-landtagswahlkreis-mapping.json";
import destatisGemeindeanschriftenJson from "../../../data/destatis-gemeindeanschriften.json";
import plzRathausAgsJson from "../../../data/plz-rathaus-ags.json";
import {
  buildRathausRecipient,
  RathausRecipientNotApplicable,
  type RathausRecipient,
} from "./rathausRecipient";
import {
  getLandesregierungRecipient,
  type LandesregierungRecipient,
} from "./landesregierungRecipient";

const plzMapping = plzMappingJson as Record<string, number[]>;
const politiciansCache = politiciansJson as PoliticiansCache;

export function getBundestagPoliticiansByIds(ids: readonly number[]): Politician[] {
  const allowedIds = new Set(ids);
  return politiciansCache.bundestag.filter((politician) => allowedIds.has(politician.id));
}

interface PlzEnrichment {
  bundeslandKey: string;
  bundeslandName: string;
  ortsname: string;
  kreisname: string | null;
  gemeindeName: string;
  bezirke?: string[];
}
const plzBundesland = plzBundeslandJson as Record<string, PlzEnrichment>;
const plzLandtagWahlkreis = plzLandtagWahlkreisJson as Record<string, number[]>;

interface OfficialMunicipalAddress {
  ags: string;
  bundeslandKey: string;
  gemeindeName: string;
  verwaltungssitz: string;
  streetAddress: string;
  postalCode: string;
  city: string;
}

const destatisGemeindeanschriften = destatisGemeindeanschriftenJson as {
  _meta: {
    source: { title: string; url: string; stand: string };
  };
  addresses: Record<string, OfficialMunicipalAddress>;
};
const plzRathausAgs = plzRathausAgsJson as {
  byPlz: Record<string, string | null>;
};

export function lookupPLZ(plz: string): { wahlkreisIds: number[]; politicians: Politician[] } {
  const wahlkreisIds = plzMapping[plz] ?? [];

  // Nur Bundestag: plz-wahlkreis-mapping enthält BTW-Wahlkreisnummern.
  // Landtag-Einträge (seit 999.6 im Cache) haben eigene, pro Land gezählte
  // Wahlkreisnummern, die mit BTW-Nummern kollidieren würden — sie werden
  // ausschließlich über lookupPLZWithLevel + plz-landtagswahlkreis-mapping
  // aufgelöst.
  const politicians = politiciansCache.bundestag.filter((p) =>
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

export interface PlzLookupResult {
  bundeslandKey: string | null;
  bundeslandName: string | null;
  gemeindeName: string | null;
  ortsname: string | null;
  byLevel: {
    Bund: Politician[];
    Land: LandesregierungRecipient[];
    Kommune: RathausRecipient[];
  };
  optionalByLevel: {
    Land: Politician[];
  };
  coverage: {
    /** true, wenn für das verifizierte Bundesland ein Regierungsdatensatz existiert */
    landSupported: boolean;
    /** true, wenn ein Rathaus-/Bezirksamt-Empfänger baubar ist */
    kommuneSupported: boolean;
    /** true für HH/HB: Stadt ist zugleich Land, Kommune-Ebene existiert nicht */
    stadtstaatEinheitsgemeinde: boolean;
    /** PLZ deckt mehrere mögliche Landtagswahlkreise ab; User muss selbst wählen */
    landAmbiguous: boolean;
    /** Alle aus der PLZ abgeleiteten möglichen Landtagswahlkreise */
    landWahlkreisIds: number[];
    /** Berlin-PLZ deckt mehrere Bezirke ab; kein Bezirk wird automatisch gewählt */
    kommuneAmbiguous: boolean;
    /** Alle aus der PLZ abgeleiteten möglichen Berliner Bezirke */
    kommuneBezirke: string[];
  };
}

/**
 * Ebenen-bewusster PLZ-Lookup (999.6). Bund nutzt den bestehenden Pfad,
 * Land den institutionellen Regierungsdatensatz, Kommune einen synthetischen
 * Stadtverwaltungs-/Bezirksamt-Empfänger (serverseitig aus der PLZ abgeleitet,
 * LOCK-5).
 */
export function lookupPLZWithLevel(plz: string): PlzLookupResult {
  const { politicians: bund } = lookupPLZ(plz);
  const enrichment = plzBundesland[plz];
  const bundeslandKey = enrichment?.bundeslandKey ?? null;

  // Land-Default: genau eine Institution aus PLZ -> Bundesland -> statischem Datensatz.
  const landesregierung = bundeslandKey
    ? getLandesregierungRecipient(bundeslandKey)
    : null;

  // Optionaler Personenpfad: MdLs bleiben getrennt vom institutionellen Default.
  let landPoliticians: Politician[] = [];
  const landtagWahlkreise = plzLandtagWahlkreis[plz] ?? [];
  if (bundeslandKey) {
    if (landtagWahlkreise.length > 0) {
      landPoliticians = politiciansCache.landtag.filter(
        (p) => p.bundeslandKey === bundeslandKey && landtagWahlkreise.includes(p.wahlkreisId)
      );
    }
  }

  // Kommune: generischer Verwaltungs-Empfänger (kein HH/HB — Einheitsgemeinde)
  let kommune: RathausRecipient[] = [];
  let stadtstaatEinheitsgemeinde = false;
  const kommuneBezirke = enrichment?.bezirke ?? [];
  const kommuneAmbiguous = bundeslandKey === "BE" && kommuneBezirke.length > 1;
  if (enrichment && bundeslandKey) {
    try {
      if (kommuneAmbiguous) {
        kommune = [
          {
            ...buildRathausRecipient({
              gemeindeName: "Berlin",
              plz,
              bundeslandKey,
              bezirk: null,
            }),
            ambiguous: true,
          },
        ];
      } else {
        const ags = plzRathausAgs.byPlz[plz];
        const officialAddress = ags
          ? destatisGemeindeanschriften.addresses[ags]
          : null;
        const verifiedOfficialAddress =
          officialAddress?.bundeslandKey === bundeslandKey
            ? {
                ags: officialAddress.ags,
                streetAddress: officialAddress.streetAddress,
                postalCode: officialAddress.postalCode,
                city: officialAddress.city,
                sourceTitle: destatisGemeindeanschriften._meta.source.title,
                sourceUrl: destatisGemeindeanschriften._meta.source.url,
                sourceStand: destatisGemeindeanschriften._meta.source.stand,
              }
            : null;
        kommune = [
          buildRathausRecipient({
            gemeindeName: enrichment.gemeindeName,
            plz,
            bundeslandKey,
            bezirk: kommuneBezirke[0] ?? null,
            officialAddress: verifiedOfficialAddress,
          }),
        ];
      }
    } catch (err) {
      if (err instanceof RathausRecipientNotApplicable) {
        stadtstaatEinheitsgemeinde = true;
      } else {
        throw err;
      }
    }
  }

  return {
    bundeslandKey,
    bundeslandName: enrichment?.bundeslandName ?? null,
    gemeindeName: enrichment?.gemeindeName ?? null,
    ortsname: enrichment?.ortsname ?? null,
    byLevel: {
      Bund: bund,
      Land: landesregierung ? [landesregierung] : [],
      Kommune: kommune,
    },
    optionalByLevel: { Land: landPoliticians },
    coverage: {
      landSupported: Boolean(landesregierung),
      kommuneSupported: kommune.length > 0,
      stadtstaatEinheitsgemeinde,
      landAmbiguous: landtagWahlkreise.length > 1,
      landWahlkreisIds: landtagWahlkreise,
      kommuneAmbiguous,
      kommuneBezirke,
    },
  };
}

/**
 * Ehrlicher Hinweis, wenn die empfohlene Ebene für diese PLZ nicht
 * abgedeckt ist. Copy für den Land-Fall ist gelockt (CONTEXT G4, 2026-05-21):
 * kein Gedankenstrich, kein "weitergeben"-Versprechen (Art. 38 GG, freies Mandat).
 */
export function buildCoverageHint(
  result: PlzLookupResult,
  routedLevel: PoliticalLevel
): string | null {
  if (routedLevel === "Land" && !result.coverage.landSupported) {
    const region = result.bundeslandName ?? "Dein Bundesland";
    if (result.coverage.stadtstaatEinheitsgemeinde || result.bundeslandName) {
      return `${region} ist in der Beta noch nicht sauber abgedeckt. Solange schreibst du an deine Bundestagsabgeordneten: Sie haben das Mandat, Themen aus allen Bundesländern in Berlin einzubringen.`;
    }
    return `Dieses Bundesland ist in der Beta noch nicht sauber abgedeckt. Solange schreibst du an deine Bundestagsabgeordneten: Sie haben das Mandat, Themen aus allen Bundesländern in Berlin einzubringen.`;
  }
  if (routedLevel === "Kommune" && !result.coverage.kommuneSupported) {
    if (result.coverage.stadtstaatEinheitsgemeinde && result.bundeslandName) {
      const institution = result.byLevel.Land[0];
      const institutionTarget = institution
        ? `an ${institution.institutionKind === "senat" ? "den" : "die"} ${institution.label}`
        : "an den institutionellen Empfänger des Landes";
      return `In ${result.bundeslandName} ist die Stadt zugleich ein Bundesland. Dein Anliegen gehört deshalb auf die Land-Ebene und geht dort ${institutionTarget}.`;
    }
    return `Für diese Postleitzahl konnten wir keine Stadtverwaltung zuordnen. Du kannst stattdessen an Land oder Bund schreiben.`;
  }
  return null;
}
