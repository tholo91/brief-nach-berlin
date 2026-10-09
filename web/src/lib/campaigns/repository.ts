import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { isCampaignEnded } from "./endDate";
import { DEFAULT_CAMPAIGN_MILESTONES, normalizeMilestones } from "./milestones";
import {
  createCampaignSchema,
  compactCampaignSlug,
  isCampaignTargetLocked,
  parseCampaignTopic,
  resolveCampaignTarget,
  updateCampaignPublicFieldsSchema,
  type Campaign,
  type CampaignModerationStatus,
  type CampaignRevision,
  type CampaignRevisionReason,
  type CampaignStatus,
  type CreateCampaignInput,
  type UpdateCampaignPublicFieldsInput,
} from "./schema";
import {
  LANDING_CAMPAIGN_COLUMNS,
  toLandingCampaign,
  type LandingCampaign,
  type LandingCampaignRow,
} from "./landing";

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
  target_level: string | null;
  target_state: string | null;
  target_recipient: unknown;
  target_politician_ids: number[] | null;
  topic_categories?: string[] | null;
  topic_labels?: string[] | null;
  topic_taxonomy_version?: string | null;
  topic_model?: string | null;
  ends_at?: string | null;
  milestones?: number[] | null;
  milestone_notified?: number | null;
  milestone_mails_enabled?: boolean | null;
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
  target_level: string | null;
  target_state: string | null;
  target_recipient: unknown;
  target_politician_ids: number[] | null;
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
  target_level: string;
  target_state: string | null;
  target_recipient: unknown;
  target_politician_ids: number[];
  topic_categories: string[] | null;
  topic_labels: string[] | null;
  topic_taxonomy_version: string | null;
  topic_model: string | null;
  topic_classified_at: string | null;
  ends_at: string | null;
  milestone_mails_enabled: boolean;
  email_verified_at: string;
  activated_at: string;
  paused_at: string;
  archived_at: string;
  last_published_revision_id: string;
  updated_at: string;
}>;

type RepositoryClient = SupabaseClient;

function clearCampaignTopic(): Pick<CampaignUpdate,
  "topic_categories" | "topic_labels" | "topic_taxonomy_version" | "topic_model" | "topic_classified_at"
> {
  return {
    topic_categories: null,
    topic_labels: null,
    topic_taxonomy_version: null,
    topic_model: null,
    topic_classified_at: null,
  };
}

export class CampaignRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignRepositoryError";
  }
}

function runningCampaignFilter(): string {
  return `ends_at.is.null,ends_at.gt.${new Date().toISOString()}`;
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
    ...resolveCampaignTarget(row),
    targetPoliticianIds: row.target_politician_ids ?? [],
    topic: parseCampaignTopic(row),
    endsAt: row.ends_at ?? null,
    milestones:
      row.milestones == null
        ? [...DEFAULT_CAMPAIGN_MILESTONES]
        : normalizeMilestones(row.milestones),
    milestoneMailsEnabled: row.milestone_mails_enabled ?? true,
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
  const target = resolveCampaignTarget(row);
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
    ...target,
    targetPoliticianIds: row.target_politician_ids ?? [],
    createdAt: row.created_at,
  };
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function targetChanged(
  campaign: Campaign,
  next: Pick<Campaign, "targetLevel" | "targetState" | "targetRecipient">
): boolean {
  return (
    campaign.targetLevel !== next.targetLevel ||
    campaign.targetState !== next.targetState ||
    JSON.stringify(campaign.targetRecipient) !== JSON.stringify(next.targetRecipient)
  );
}

function validateCampaignUpdate(
  campaign: Campaign,
  input: ReturnType<typeof updateCampaignPublicFieldsSchema.parse>
): ReturnType<typeof createCampaignSchema.parse> {
  return createCampaignSchema.parse({
    slug: campaign.slug,
    creatorEmail: campaign.creatorEmail,
    title: input.title ?? campaign.title,
    issueText: input.issueText ?? campaign.issueText,
    description: input.description !== undefined ? input.description : campaign.description,
    creatorName: input.creatorName !== undefined ? input.creatorName : campaign.creatorName,
    externalUrl: input.externalUrl !== undefined ? input.externalUrl : campaign.externalUrl,
    logoPath: input.logoPath !== undefined ? input.logoPath : campaign.logoPath,
    moderationStatus: campaign.moderationStatus,
    moderationCategories: campaign.moderationCategories,
    targetLevel: input.targetLevel ?? campaign.targetLevel,
    targetState: input.targetState !== undefined ? input.targetState : campaign.targetState,
    targetRecipient:
      input.targetRecipient !== undefined ? input.targetRecipient : campaign.targetRecipient,
    targetPoliticianIds:
      input.targetPoliticianIds !== undefined
        ? input.targetPoliticianIds
        : campaign.targetPoliticianIds,
  });
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

function assertNotEnded(campaign: Campaign, action: string): void {
  if (isCampaignEnded(campaign, new Date())) {
    throw new CampaignRepositoryError(
      `${action} is not allowed after the campaign ended`
    );
  }
}

const END_ALLOWED_STATUSES: CampaignStatus[] = [
  "draft",
  "awaiting_email_verification",
  "awaiting_approval",
  "active",
  "paused",
];

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
      target_level: parsed.targetLevel,
      target_state: parsed.targetLevel === "Land" ? parsed.targetState : null,
      target_recipient: parsed.targetRecipient,
      target_politician_ids: parsed.targetPoliticianIds,
      ...(parsed.endsAt ? { ends_at: parsed.endsAt } : {}),
      ...(parsed.milestoneMailsEnabled ? {} : { milestone_mails_enabled: false }),
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

/**
 * Speichert ein internes Kampagnen-Themensignal nur, solange der klassifizierte
 * Text noch der aktuelle Kampagnentext ist. Ein paralleler Edit kann dadurch
 * niemals ein veraltetes Signal zur Live-Kampagne machen.
 */
export async function saveCampaignTopic(
  campaignId: string,
  issueText: string,
  topic: import("@/lib/topics/topicTaxonomy").TopicSignal,
  db?: RepositoryClient,
): Promise<void> {
  const { error } = await client(db)
    .from("campaigns")
    .update({
      topic_categories: topic.topicCategories,
      topic_labels: topic.topicLabels,
      topic_taxonomy_version: topic.topicTaxonomyVersion,
      topic_model: topic.topicModel,
      topic_classified_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("issue_text", issueText);

  if (error) {
    throw new CampaignRepositoryError(`Campaign topic save failed: ${error.message}`);
  }
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
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .maybeSingle();

  if (error) {
    throw new CampaignRepositoryError(`Active campaign lookup failed: ${error.message}`);
  }
  return data ? mapCampaign(data as CampaignRow) : null;
}

export async function getActiveCampaignByCompactSlug(
  compactSlug: string,
  db?: RepositoryClient
): Promise<Campaign | null> {
  const normalizedCompactSlug = compactCampaignSlug(compactSlug);
  if (!normalizedCompactSlug) return null;

  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("compact_slug", normalizedCompactSlug)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .limit(2);

  if (error) {
    throw new CampaignRepositoryError(`Compact campaign lookup failed: ${error.message}`);
  }
  if (!data || data.length !== 1) return null;
  return mapCampaign(data[0] as CampaignRow);
}

export async function getRecentActiveCampaigns(
  limit = 5,
  db?: RepositoryClient
): Promise<Campaign[]> {
  const cappedLimit = Math.min(Math.max(limit, 1), 6);
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or(runningCampaignFilter())
    .order("activated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (error) {
    throw new CampaignRepositoryError(
      `Campaign list lookup failed: ${error.message}`
    );
  }
  return (data as CampaignRow[]).map(mapCampaign);
}

/** Alle laufenden Kampagnen für die Übersicht auf /ngo-briefkampagne. */
export async function getRunningCampaigns(
  limit = 24,
  db?: RepositoryClient
): Promise<Campaign[]> {
  const cappedLimit = Math.min(Math.max(limit, 1), 24);
  const { data, error } = await client(db)
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or(runningCampaignFilter())
    .order("activated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (error) {
    throw new CampaignRepositoryError(
      `Running campaign lookup failed: ${error.message}`
    );
  }
  return (data as CampaignRow[]).map(mapCampaign);
}

/** Von Thomas per landing_rank kuratierte Kampagnen für den Hero der Startseite. */
export async function getLandingCampaigns(
  limit = 3,
  db?: RepositoryClient
): Promise<LandingCampaign[]> {
  const cappedLimit = Math.min(Math.max(limit, 1), 3);
  const { data, error } = await client(db)
    .from("campaigns")
    .select(LANDING_CAMPAIGN_COLUMNS)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or(runningCampaignFilter())
    .not("landing_rank", "is", null)
    .order("landing_rank", { ascending: true })
    .order("activated_at", { ascending: false, nullsFirst: false })
    .limit(cappedLimit);

  if (error) {
    throw new CampaignRepositoryError(
      `Landing campaign lookup failed: ${error.message}`
    );
  }
  return (data as LandingCampaignRow[]).map(toLandingCampaign);
}

export async function updateCampaignPublicFields(
  campaignId: string,
  input: UpdateCampaignPublicFieldsInput,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["draft", "awaiting_email_verification", "awaiting_approval", "active", "paused"], "edit");
  assertNotEnded(campaign, "edit");
  const parsed = updateCampaignPublicFieldsSchema.parse(input);
  const validated = validateCampaignUpdate(campaign, parsed);
  const nextTarget = {
    targetLevel: validated.targetLevel,
    targetState: validated.targetState,
    targetRecipient: validated.targetRecipient,
    targetPoliticianIds: validated.targetPoliticianIds,
  };
  if (isCampaignTargetLocked(campaign) && targetChanged(campaign, nextTarget)) {
    throw new CampaignRepositoryError("Campaign target is locked after activation");
  }
  const patch: CampaignUpdate = {};

  if (parsed.title !== undefined) patch.title = parsed.title;
  if (parsed.issueText !== undefined) {
    patch.issue_text = parsed.issueText;
    if (parsed.issueText !== campaign.issueText) Object.assign(patch, clearCampaignTopic());
  }
  if (parsed.description !== undefined) patch.description = nullableText(parsed.description);
  if (parsed.creatorName !== undefined) patch.creator_name = nullableText(parsed.creatorName);
  if (parsed.externalUrl !== undefined) patch.external_url = nullableText(parsed.externalUrl);
  if (parsed.logoPath !== undefined) patch.logo_path = nullableText(parsed.logoPath);
  if (parsed.targetLevel !== undefined) patch.target_level = parsed.targetLevel;
  if (parsed.targetState !== undefined) patch.target_state = parsed.targetState;
  if (parsed.targetRecipient !== undefined) patch.target_recipient = parsed.targetRecipient;
  if (parsed.targetPoliticianIds !== undefined) {
    patch.target_politician_ids = parsed.targetPoliticianIds;
  }

  return updateCampaignRow(campaignId, patch, db);
}

export async function saveAwaitingApprovalCampaignEdits(
  campaignId: string,
  input: UpdateCampaignPublicFieldsInput,
  moderationCategories: string[] = [],
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, ["awaiting_approval"], "edit");
  assertNotEnded(campaign, "edit");
  const parsed = updateCampaignPublicFieldsSchema.parse(input);
  validateCampaignUpdate(campaign, parsed);
  const patch: CampaignUpdate = {
    moderation_status: "pending",
    moderation_categories: moderationCategories,
  };

  if (parsed.title !== undefined) patch.title = parsed.title;
  if (parsed.issueText !== undefined) {
    patch.issue_text = parsed.issueText;
    if (parsed.issueText !== campaign.issueText) Object.assign(patch, clearCampaignTopic());
  }
  if (parsed.description !== undefined) patch.description = nullableText(parsed.description);
  if (parsed.creatorName !== undefined) patch.creator_name = nullableText(parsed.creatorName);
  if (parsed.externalUrl !== undefined) patch.external_url = nullableText(parsed.externalUrl);
  if (parsed.logoPath !== undefined) patch.logo_path = nullableText(parsed.logoPath);
  if (parsed.targetLevel !== undefined) patch.target_level = parsed.targetLevel;
  if (parsed.targetState !== undefined) patch.target_state = parsed.targetState;
  if (parsed.targetRecipient !== undefined) patch.target_recipient = parsed.targetRecipient;
  if (parsed.targetPoliticianIds !== undefined) {
    patch.target_politician_ids = parsed.targetPoliticianIds;
  }

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
      target_level: campaign.targetLevel,
      target_state: campaign.targetState,
      target_recipient: campaign.targetRecipient,
      target_politician_ids: campaign.targetPoliticianIds,
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
  assertNotEnded(campaign, "edit");
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
    targetPoliticianIds:
      parsed.targetPoliticianIds !== undefined
        ? parsed.targetPoliticianIds
        : campaign.targetPoliticianIds,
    targetLevel: parsed.targetLevel ?? campaign.targetLevel,
    targetState:
      parsed.targetState !== undefined ? parsed.targetState : campaign.targetState,
    targetRecipient:
      parsed.targetRecipient !== undefined
        ? parsed.targetRecipient
        : campaign.targetRecipient,
  };

  if (isCampaignTargetLocked(campaign) && targetChanged(campaign, next)) {
    throw new CampaignRepositoryError("Campaign target is locked after activation");
  }

  createCampaignSchema.parse({
    slug: campaign.slug,
    creatorEmail: campaign.creatorEmail,
    title: next.title,
    issueText: next.issueText,
    description: next.description,
    creatorName: next.creatorName,
    externalUrl: next.externalUrl,
    logoPath: next.logoPath,
    moderationStatus: "approved",
    moderationCategories,
    targetLevel: next.targetLevel,
    targetState: next.targetState,
    targetRecipient: next.targetRecipient,
    targetPoliticianIds: next.targetPoliticianIds,
  });

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
      target_level: next.targetLevel,
      target_state: next.targetState,
      target_recipient: next.targetRecipient,
      target_politician_ids: next.targetPoliticianIds,
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
      ...(next.issueText !== campaign.issueText ? clearCampaignTopic() : {}),
      description: next.description,
      creator_name: next.creatorName,
      external_url: next.externalUrl,
      logo_path: next.logoPath,
      moderation_status: "approved",
      moderation_categories: moderationCategories,
      target_level: next.targetLevel,
      target_state: next.targetState,
      target_recipient: next.targetRecipient,
      target_politician_ids: next.targetPoliticianIds,
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
    {
      status: "awaiting_approval",
      email_verified_at: new Date().toISOString(),
    },
    db
  );
}

export async function blockCampaign(
  campaignId: string,
  moderationCategories: string[] = [],
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(
    campaign,
    ["awaiting_email_verification", "awaiting_approval"],
    "block"
  );
  return updateCampaignRow(
    campaignId,
    {
      status: "blocked",
      moderation_status: "rejected",
      moderation_categories: moderationCategories,
    },
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
  assertStatus(campaign, ["awaiting_approval", "paused"], "activate");
  assertNotEnded(campaign, "activate");
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
  assertNotEnded(campaign, "pause");
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
  assertStatus(campaign, ["draft", "awaiting_email_verification", "awaiting_approval", "active", "paused", "blocked"], "archive");
  return updateCampaignRow(
    campaignId,
    { status: "archived", archived_at: new Date().toISOString() },
    db
  );
}

export async function setCampaignEndsAt(
  campaignId: string,
  endsAt: string | null,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, END_ALLOWED_STATUSES, "set end date");
  assertNotEnded(campaign, "set end date");
  if (endsAt !== null && Date.parse(endsAt) <= Date.now()) {
    throw new CampaignRepositoryError("End date must be in the future");
  }
  return updateCampaignRow(campaignId, { ends_at: endsAt }, db);
}

export async function setCampaignMilestoneMailsEnabled(
  campaignId: string,
  enabled: boolean,
  db?: RepositoryClient
): Promise<Campaign> {
  return updateCampaignRow(campaignId, { milestone_mails_enabled: enabled }, db);
}

export async function endCampaignNow(
  campaignId: string,
  db?: RepositoryClient
): Promise<Campaign> {
  const campaign = await requireCampaign(campaignId, db);
  assertStatus(campaign, END_ALLOWED_STATUSES, "end");
  assertNotEnded(campaign, "end");
  return updateCampaignRow(
    campaignId,
    {
      ends_at: new Date().toISOString(),
      ...(campaign.status === "paused" ? { status: "active" as const } : {}),
    },
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
