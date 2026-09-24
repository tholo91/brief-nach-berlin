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
  headOfGovernment?: {
    name: string;
    title: string;
    salutation: string;
    addressLines: string[];
    source: {
      title: string;
      url: string;
      verifiedAt: string;
    };
  };
}

export interface LandesregierungRecipient {
  kind: "landesregierung";
  level: "Land";
  addressee: "institution" | "head";
  headName?: string;
  headTitle?: string;
  salutation: string;
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
  entry: LandesregierungDataEntry,
  addressee: "institution" | "head" = "institution"
): LandesregierungRecipient {
  if (addressee === "head") {
    const head = entry.headOfGovernment;
    if (!head) throw new Error(`Regierungsspitze für ${entry.stateKey} fehlt.`);
    return {
      kind: "landesregierung",
      level: "Land",
      addressee,
      headName: head.name,
      headTitle: head.title,
      salutation: head.salutation,
      institutionKind: entry.institutionKind,
      bundeslandKey: entry.stateKey,
      bundeslandName: entry.stateName,
      label: head.addressLines[0],
      officeName: entry.officeName,
      postalAddress: head.addressLines.join(", "),
      address: {
        addressLines: head.addressLines,
        sourceTitle: head.source.title,
        sourceUrl: head.source.url,
        sourceStand: head.source.verifiedAt,
      },
    };
  }
  return {
    kind: "landesregierung",
    level: "Land",
    addressee,
    salutation: "Sehr geehrte Damen und Herren,",
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
  bundeslandKey: string,
  addressee: "institution" | "head" = "institution"
): LandesregierungRecipient | null {
  const entry = governmentData.recipients[bundeslandKey];
  if (!entry || (addressee === "head" && !entry.headOfGovernment)) return null;
  return buildLandesregierungRecipient(entry, addressee);
}
