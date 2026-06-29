import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  createCampaignSchema,
  updateCampaignPublicFieldsSchema,
  type Campaign,
  type CampaignModerationStatus,
  type CampaignRevision,
  type CampaignRevisionReason,
  type CampaignStatus,
  type CreateCampaignInput,
  type UpdateCampaignPublicFieldsInput,
} from "./schema";

type CampaignRow = {
  id: string;
  slug: string;
  creator_email: string;
  title: string;
  issue_text: string;
  description: string | null;
  creator_name: string | null;
  external_url: string | null;
  logo_path: string | null;
  status: CampaignStatus;
  moderation_status: CampaignModerationStatus;
  moderation_categories: string[] | null;
  email_verified_at: string | null;
  activated_at: string | null;
  paused_at: string | null;
  archived_at: string | null;
  last_published_revision_id: string | null;
  letter_count: number | null;
  created_at: string;
  updated_at: string;
};

type CampaignRevisionRow = {
  id: string;
  campaign_id: string;
  snapshot_reason: CampaignRevisionReason;
  title: string;
  issue_text: string;
  description: string | null;
  creator_name: string | null;
  external_url: string | null;
  moderation_status: CampaignModerationStatus;
  moderation_categories: string[] | null;
  created_at: string;
};

type CampaignUpdate = Partial<{
  title: string;
  issue_text: string;
  description: string | null;
  creator_name: string | null;
  external_url: string | null;
  logo_path: string | null;
  status: CampaignStatus;
  moderation_status: CampaignModerationStatus;
  moderation_categories: string[];
  email_verified_at: string;
  activated_at: string;
  paused_at: string;
  archived_at: string;
  last_published_revision_id: string;
  updated_at: string;
}>;

type RepositoryClient = SupabaseClient;

export class CampaignRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignRepositoryError";
  }
}

function client(db?: RepositoryClient): RepositoryClient {
  return db ?? getServiceRoleClient();
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    slug: row.slug,
    creatorEmail: row.creator_email,
    title: row.title,
    issueText: row.issue_text,
    description: row.description,
    creatorName: row.creator_name,
    externalUrl: row.external_url,
    logoPath: row.logo_path,
    status: row.status,
    moderationStatus: row.moderation_status,
    moderationCategories: row.moderation_categories ?? [],
    emailVerifiedAt: row.email_verified_at,
    activatedAt: row.activated_at,
    pausedAt: row.paused_at,
    archivedAt: row.archived_at,
    lastPublishedRevisionId: row.last_published_revision_id,
    letterCount: row.letter_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRevision(row: CampaignRevisionRow): CampaignRevision {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    snapshotReason: row.snapshot_reason,
    title: row.title,
    issueText: row.issue_text,
    description: row.description,
    creatorName: row.creator_name,
    externalUrl: row.external_url,
    moderationStatus: row.moderation_status,
    moderationCategories: row.moderation_categories ?? [],
    createdAt: row.created_at,
  };
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function assertStatus(
  campaign: Campaign,
  allowed: CampaignStatus[],
  action: string
): void {
  if (!allowed.includes(campaign.status)) {
    throw new CampaignRepositoryError(
      `${action} is not allowed while campaign is ${campaign.status}`
    );
  }
}

function assertPubliclyPublishable(campaign: Campaign, action: string): void {
  if (campaign.moderationStatus !== "approved") {
    throw new CampaignRepositoryError(
      `${action} requires approved moderation status`
    );
  }
}

async function updateCampaignRow(
  campaignId: string,
  patch: CampaignUpdate,
  db?: RepositoryClient
): Promise<Campaign> {
  const { data, error } = await client(db)
    .from("campaigns")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", campaignId)
    .select("*")
    .single();

  if (error) {
    throw new CampaignRepositoryError(`Campaign update failed: ${error.message}`);
  }
  return mapCampaign(data as CampaignRow);
}

export async function createCampaign(
  input: CreateCampaignInput,
  db?: RepositoryClient
): Promise<Campaign> {
  const parsed = createCampaignSchema.parse(input);
  const { data, error } = await client(db)
    .from("campaigns")
    .insert({
      slug: parsed.slug,
      creator_email: parsed.creatorEmail,
      title: parsed.title,
      issue_text: parsed.issueText,
      description: nullableText(parsed.description),
      creator_name: nullableText(parsed.creatorName),
      external_url: nullableText(parsed.externalUrl),
      logo_path: nullableText(parsed.logoPath),
      status: "draft",
      moderation_status: parsed.moderationStatus,
      moderation_categories: parsed.moderationCategories,
    })
    .select("*")
    .single();

  if (error) {
    throw new CampaignRepositoryError(`Campaign create failed: ${error.message}`);
  }

  const campaign = mapCampaign(data as CampaignRow);
  await createCampaignRevision(campaign.id, "created", db);
  return campaign;
}

export async function getCampaignById(
  id: string,
  db?: RepositoryClient
): Promise<Campaign | null> {
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new CampaignRepositoryError(`Campaign lookup failed: ${error.message}`);
  }
  return data ? mapCampaign(data as CampaignRow) : null;
}

export async function deleteCampaign(
  campaignId: string,
  db?: RepositoryClient
): Promise<void> {
  const { error } = await client(db)
    .from("campaigns")
    .delete()
    .eq("id", campaignId);

  if (error) {
    throw new CampaignRepositoryError(`Campaign delete failed: ${error.message}`);
  }
}

export async function getCampaignBySlug(
  slug: string,
  db?: RepositoryClient
): Promise<Campaign | null> {
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new CampaignRepositoryError(`Campaign lookup failed: ${error.message}`);
  }
  return data ? mapCampaign(data as CampaignRow) : null;
}

export async function getActiveCampaignBySlug(
  slug: string,
  db?: RepositoryClient
): Promise<Campaign | null> {
  const campaign = await getCampaignBySlug(slug, db);
  return campaign?.status === "active" ? campaign : null;
}

export async function updateCampaignPublicFields(
  campaignId: string,
  input: UpdateCampaignPublicFieldsInput,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["draft", "awaiting_email_verification", "active", "paused"], "edit");
  const parsed = updateCampaignPublicFieldsSchema.parse(input);
  const patch: CampaignUpdate = {};

  if (parsed.title !== undefined) patch.title = parsed.title;
  if (parsed.issueText !== undefined) patch.issue_text = parsed.issueText;
  if (parsed.description !== undefined) patch.description = nullableText(parsed.description);
  if (parsed.creatorName !== undefined) patch.creator_name = nullableText(parsed.creatorName);
  if (parsed.externalUrl !== undefined) patch.external_url = nullableText(parsed.externalUrl);
  if (parsed.logoPath !== undefined) patch.logo_path = nullableText(parsed.logoPath);

  return updateCampaignRow(campaignId, patch, db);
}

export async function setCampaignModeration(
  campaignId: string,
  moderationStatus: CampaignModerationStatus,
  moderationCategories: string[] = [],
  db?: RepositoryClient
): Promise<Campaign> {
  return updateCampaignRow(
    campaignId,
    {
      moderation_status: moderationStatus,
      moderation_categories: moderationCategories,
    },
    db
  );
}

export async function createCampaignRevision(
  campaignId: string,
  reason: CampaignRevisionReason,
  db?: RepositoryClient
): Promise<CampaignRevision> {
  const campaign = await requireCampaign(campaignId, db);
  return createCampaignRevisionFromCampaign(campaign, reason, db);
}

async function createCampaignRevisionFromCampaign(
  campaign: Campaign,
  reason: CampaignRevisionReason,
  db?: RepositoryClient
): Promise<CampaignRevision> {
  const { data, error } = await client(db)
    .from("campaign_revisions")
    .insert({
      campaign_id: campaign.id,
      snapshot_reason: reason,
      title: campaign.title,
      issue_text: campaign.issueText,
      description: campaign.description,
      creator_name: campaign.creatorName,
      external_url: campaign.externalUrl,
      moderation_status: campaign.moderationStatus,
      moderation_categories: campaign.moderationCategories,
    })
    .select("*")
    .single();

  if (error) {
    throw new CampaignRepositoryError(
      `Campaign revision create failed: ${error.message}`
    );
  }
  return mapRevision(data as CampaignRevisionRow);
}

export async function publishCampaignRevision(
  campaignId: string,
  reason: CampaignRevisionReason = "published",
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertPubliclyPublishable(campaign, "publish");
  const revision = await createCampaignRevision(campaignId, reason, db);
  return updateCampaignRow(
    campaignId,
    { last_published_revision_id: revision.id },
    db
  );
}

export async function publishCampaignEdits(
  campaignId: string,
  input: UpdateCampaignPublicFieldsInput,
  moderationCategories: string[] = [],
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["draft", "awaiting_email_verification", "active", "paused"], "edit");
  const parsed = updateCampaignPublicFieldsSchema.parse(input);
  const next = {
    title: parsed.title ?? campaign.title,
    issueText: parsed.issueText ?? campaign.issueText,
    description:
      parsed.description !== undefined
        ? nullableText(parsed.description)
        : campaign.description,
    creatorName:
      parsed.creatorName !== undefined
        ? nullableText(parsed.creatorName)
        : campaign.creatorName,
    externalUrl:
      parsed.externalUrl !== undefined
        ? nullableText(parsed.externalUrl)
        : campaign.externalUrl,
    logoPath:
      parsed.logoPath !== undefined
        ? nullableText(parsed.logoPath)
        : campaign.logoPath,
  };

  const { data: revisionData, error: revisionError } = await client(db)
    .from("campaign_revisions")
    .insert({
      campaign_id: campaign.id,
      snapshot_reason: "edited",
      title: next.title,
      issue_text: next.issueText,
      description: next.description,
      creator_name: next.creatorName,
      external_url: next.externalUrl,
      moderation_status: "approved",
      moderation_categories: moderationCategories,
    })
    .select("*")
    .single();

  if (revisionError) {
    throw new CampaignRepositoryError(
      `Campaign revision create failed: ${revisionError.message}`
    );
  }

  const revision = mapRevision(revisionData as CampaignRevisionRow);
  return updateCampaignRow(
    campaignId,
    {
      title: next.title,
      issue_text: next.issueText,
      description: next.description,
      creator_name: next.creatorName,
      external_url: next.externalUrl,
      logo_path: next.logoPath,
      moderation_status: "approved",
      moderation_categories: moderationCategories,
      last_published_revision_id: revision.id,
    },
    db
  );
}

export async function markPaid(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["draft"], "markPaid");
  return updateCampaignRow(
    campaignId,
    { status: "awaiting_email_verification" },
    db
  );
}

export async function markEmailVerified(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["awaiting_email_verification"], "markEmailVerified");
  return updateCampaignRow(
    campaignId,
    { email_verified_at: new Date().toISOString() },
    db
  );
}

export async function activateCampaign(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  return activateVerifiedCampaign(campaign, db);
}

export async function activateVerifiedCampaign(
  campaign: Campaign,
  db?: RepositoryClient
): Promise<Campaign> {
  assertStatus(campaign, ["awaiting_email_verification", "paused"], "activate");
  assertPubliclyPublishable(campaign, "activate");
  if (!campaign.emailVerifiedAt) {
    throw new CampaignRepositoryError("activate requires verified creator email");
  }
  const revision = await createCampaignRevisionFromCampaign(campaign, "activated", db);
  return updateCampaignRow(
    campaign.id,
    {
      status: "active",
      activated_at: new Date().toISOString(),
      paused_at: undefined,
      last_published_revision_id: revision.id,
    },
    db
  );
}

export async function pauseCampaign(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["active"], "pause");
  return updateCampaignRow(
    campaignId,
    { status: "paused", paused_at: new Date().toISOString() },
    db
  );
}

export async function archiveCampaign(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["draft", "awaiting_email_verification", "active", "paused", "blocked"], "archive");
  return updateCampaignRow(
    campaignId,
    { status: "archived", archived_at: new Date().toISOString() },
    db
  );
}

async function requireCampaign(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await getCampaignById(campaignId, db);
  if (!campaign) {
    throw new CampaignRepositoryError("Campaign not found");
  }
  return campaign;
}
