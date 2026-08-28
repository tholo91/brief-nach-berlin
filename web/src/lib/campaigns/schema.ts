import { z } from "zod";

export const CAMPAIGN_STATUSES = [
  "draft",
  "awaiting_email_verification",
  "active",
  "paused",
  "archived",
  "blocked",
] as const;

export const MODERATION_STATUSES = ["pending", "approved", "rejected"] as const;

export const CAMPAIGN_TOKEN_KINDS = ["verify_email", "manage"] as const;

export const REVISION_REASONS = [
  "created",
  "published",
  "edited",
  "activated",
] as const;

export const CAMPAIGN_TARGET_LEVELS = ["Bund", "Land"] as const;

export type CampaignTargetLevel = (typeof CAMPAIGN_TARGET_LEVELS)[number];

// Single Source für Bundesland-Dropdown und Hero-Copy.
// Keys entsprechen bundeslandKey aus lookupPLZWithLevel.
export const BUNDESLAND_KEYS = [
  "BW",
  "BY",
  "BE",
  "BB",
  "HB",
  "HH",
  "HE",
  "MV",
  "NI",
  "NW",
  "RP",
  "SL",
  "SN",
  "ST",
  "SH",
  "TH",
] as const;

export type BundeslandKey = (typeof BUNDESLAND_KEYS)[number];

export const BUNDESLAND_NAMES: Record<BundeslandKey, string> = {
  BW: "Baden-Württemberg",
  BY: "Bayern",
  BE: "Berlin",
  BB: "Brandenburg",
  HB: "Bremen",
  HH: "Hamburg",
  HE: "Hessen",
  MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen",
  NW: "Nordrhein-Westfalen",
  RP: "Rheinland-Pfalz",
  SL: "Saarland",
  SN: "Sachsen",
  ST: "Sachsen-Anhalt",
  SH: "Schleswig-Holstein",
  TH: "Thüringen",
};

// Default-Handling für Altdaten: Kampagnen ohne target_level gelten als Bund.
// Wird von mapCampaign im Repository genutzt und ist hier pur testbar.
export function resolveCampaignTarget(row: {
  target_level?: string | null;
  target_state?: string | null;
}): { targetLevel: CampaignTargetLevel; targetState: BundeslandKey | null } {
  return campaignTargetSchema.parse({
    targetLevel: row.target_level ?? "Bund",
    targetState: row.target_state ?? null,
  });
}

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type CampaignModerationStatus = (typeof MODERATION_STATUSES)[number];
export type CampaignTokenKind = (typeof CAMPAIGN_TOKEN_KINDS)[number];
export type CampaignRevisionReason = (typeof REVISION_REASONS)[number];

const slugPattern = /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/;
const reservedCampaignSlugs = new Set(["starten", "verifizieren", "verwalten"]);

export function normalizeCampaignSlug(input: string): string {
  return input
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function compactCampaignSlug(input: string): string {
  return normalizeCampaignSlug(input).replaceAll("-", "");
}

export function isValidCampaignSlug(slug: string): boolean {
  return slugPattern.test(slug);
}

export function isReservedCampaignSlug(slug: string): boolean {
  return reservedCampaignSlugs.has(slug);
}

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export const campaignTargetLevelSchema = z.enum(CAMPAIGN_TARGET_LEVELS);
export const campaignTargetStateSchema = z.enum(BUNDESLAND_KEYS);
export const campaignTargetPoliticianIdsSchema = z
  .array(z.number().int().positive())
  .refine((ids) => new Set(ids).size === ids.length, "Eine Person darf nur einmal ausgewählt werden.")
  .default([]);
export const campaignTargetSchema = z
  .object({
    targetLevel: campaignTargetLevelSchema,
    targetState: campaignTargetStateSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.targetLevel === "Bund" && value.targetState !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetState"],
        message: "Ein Bundesland ist nur bei Landeskampagnen erlaubt.",
      });
    }
  });
export const campaignModerationStatusSchema = z.enum(MODERATION_STATUSES);
export const campaignTokenKindSchema = z.enum(CAMPAIGN_TOKEN_KINDS);
export const campaignRevisionReasonSchema = z.enum(REVISION_REASONS);

export const campaignSlugSchema = z
  .string()
  .trim()
  .transform(normalizeCampaignSlug)
  .refine(isValidCampaignSlug, "Ungültiger Kampagnen-Slug.")
  .refine((slug) => !isReservedCampaignSlug(slug), "Reservierter Kampagnen-Slug.");

export const campaignExternalUrlSchema = z
  .string()
  .trim()
  .url("Bitte gib eine gültige Adresse ein.")
  .max(500)
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Bitte gib eine http(s)-Adresse ein.");

export const campaignPublicFieldsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  issueText: z.string().trim().min(20).max(4000),
  description: z.string().trim().max(400).optional().nullable(),
  creatorName: z.string().trim().max(120).optional().nullable(),
  externalUrl: campaignExternalUrlSchema.optional().nullable(),
  logoPath: z.string().trim().max(500).optional().nullable(),
});

export const createCampaignSchema = campaignPublicFieldsSchema
  .extend({
    slug: campaignSlugSchema,
    creatorEmail: z.string().trim().toLowerCase().email().max(200),
    moderationStatus: campaignModerationStatusSchema.default("pending"),
    moderationCategories: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    targetLevel: campaignTargetLevelSchema.default("Bund"),
    targetState: campaignTargetStateSchema.nullable().default(null),
    targetPoliticianIds: campaignTargetPoliticianIdsSchema,
  })
  .superRefine((value, ctx) => {
    if (value.targetLevel === "Bund" && value.targetState !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetState"],
        message: "Ein Bundesland ist nur bei Landeskampagnen erlaubt.",
      });
    }
    if (value.targetPoliticianIds.length > 0 && value.targetLevel !== "Bund") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetPoliticianIds"],
        message: "Bestimmte MdBs können nur bei Bundestagskampagnen ausgewählt werden.",
      });
    }
  });

export const updateCampaignTargetSchema = campaignTargetPoliticianIdsSchema.optional();

export const updateCampaignPublicFieldsSchema = campaignPublicFieldsSchema
  .extend({ targetPoliticianIds: campaignTargetPoliticianIdsSchema.optional() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Keine Änderungen übergeben.");

export type CampaignPublicFieldsInput = z.input<typeof campaignPublicFieldsSchema>;
export type CreateCampaignInput = z.input<typeof createCampaignSchema>;
export type UpdateCampaignPublicFieldsInput = z.input<
  typeof updateCampaignPublicFieldsSchema
>;

export type Campaign = {
  id: string;
  slug: string;
  creatorEmail: string;
  title: string;
  issueText: string;
  description: string | null;
  creatorName: string | null;
  externalUrl: string | null;
  logoPath: string | null;
  status: CampaignStatus;
  moderationStatus: CampaignModerationStatus;
  moderationCategories: string[];
  targetLevel: CampaignTargetLevel;
  targetState: BundeslandKey | null;
  targetPoliticianIds: number[];
  emailVerifiedAt: string | null;
  activatedAt: string | null;
  pausedAt: string | null;
  archivedAt: string | null;
  lastPublishedRevisionId: string | null;
  letterCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CampaignRevision = {
  id: string;
  campaignId: string;
  snapshotReason: CampaignRevisionReason;
  title: string;
  issueText: string;
  description: string | null;
  creatorName: string | null;
  externalUrl: string | null;
  moderationStatus: CampaignModerationStatus;
  moderationCategories: string[];
  targetPoliticianIds: number[];
  createdAt: string;
};

export type CampaignTokenRecord = {
  id: string;
  campaignId: string;
  kind: CampaignTokenKind;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};
