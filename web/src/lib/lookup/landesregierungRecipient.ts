import governmentDataJson from "../../../data/landesregierung-addresses.json";

export interface LandesregierungDataEntry {
  stateKey: string;
  stateName: string;
  label: string;
  officeName: string;
  institutionKind: "landesregierung" | "senat";
  addressLines: string[];
  source: {
    title: string;
    url: string;
    verifiedAt: string;
  };
}

export interface LandesregierungRecipient {
  kind: "landesregierung";
  level: "Land";
  institutionKind: "landesregierung" | "senat";
  bundeslandKey: string;
  bundeslandName: string;
  label: string;
  officeName: string;
  postalAddress: string;
  address: {
    addressLines: string[];
    sourceTitle: string;
    sourceUrl: string;
    sourceStand: string;
  };
}

const governmentData = governmentDataJson as {
  recipients: Record<string, LandesregierungDataEntry>;
};

export function buildLandesregierungRecipient(
  entry: LandesregierungDataEntry
): LandesregierungRecipient {
  return {
    kind: "landesregierung",
    level: "Land",
    institutionKind: entry.institutionKind,
    bundeslandKey: entry.stateKey,
    bundeslandName: entry.stateName,
    label: entry.label,
    officeName: entry.officeName,
    postalAddress: [entry.label, entry.officeName, ...entry.addressLines].join(", "),
    address: {
      addressLines: entry.addressLines,
      sourceTitle: entry.source.title,
      sourceUrl: entry.source.url,
      sourceStand: entry.source.verifiedAt,
    },
  };
}

export function getLandesregierungRecipient(
  bundeslandKey: string
): LandesregierungRecipient | null {
  const entry = governmentData.recipients[bundeslandKey];
  return entry ? buildLandesregierungRecipient(entry) : null;
}
