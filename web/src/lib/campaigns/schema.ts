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

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type CampaignModerationStatus = (typeof MODERATION_STATUSES)[number];
export type CampaignTokenKind = (typeof CAMPAIGN_TOKEN_KINDS)[number];
export type CampaignRevisionReason = (typeof REVISION_REASONS)[number];

const slugPattern = /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/;

export function normalizeCampaignSlug(input: string): string {
  return input
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidCampaignSlug(slug: string): boolean {
  return slugPattern.test(slug);
}

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES);
export const campaignModerationStatusSchema = z.enum(MODERATION_STATUSES);
export const campaignTokenKindSchema = z.enum(CAMPAIGN_TOKEN_KINDS);
export const campaignRevisionReasonSchema = z.enum(REVISION_REASONS);

export const campaignSlugSchema = z
  .string()
  .trim()
  .transform(normalizeCampaignSlug)
  .refine(isValidCampaignSlug, "Ungültiger Kampagnen-Slug.");

export const campaignPublicFieldsSchema = z.object({
  title: z.string().trim().min(3).max(120),
  issueText: z.string().trim().min(20).max(4000),
  description: z.string().trim().max(400).optional().nullable(),
  creatorName: z.string().trim().max(120).optional().nullable(),
  externalUrl: z.string().trim().url().max(500).optional().nullable(),
});

export const createCampaignSchema = campaignPublicFieldsSchema.extend({
  slug: campaignSlugSchema,
  creatorEmail: z.string().trim().toLowerCase().email().max(200),
  moderationStatus: campaignModerationStatusSchema.default("pending"),
  moderationCategories: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

export const updateCampaignPublicFieldsSchema = campaignPublicFieldsSchema
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
  status: CampaignStatus;
  moderationStatus: CampaignModerationStatus;
  moderationCategories: string[];
  emailVerifiedAt: string | null;
  activatedAt: string | null;
  pausedAt: string | null;
  archivedAt: string | null;
  lastPublishedRevisionId: string | null;
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
