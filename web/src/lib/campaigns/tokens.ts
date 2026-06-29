import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  campaignTokenKindSchema,
  type CampaignTokenKind,
  type CampaignTokenRecord,
} from "./schema";

type CampaignTokenRow = {
  id: string;
  campaign_id: string;
  kind: CampaignTokenKind;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

type RepositoryClient = SupabaseClient;

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const MANAGE_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365 * 100;

export class CampaignTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignTokenError";
  }
}

function client(db?: RepositoryClient): RepositoryClient {
  return db ?? getServiceRoleClient();
}

function mapToken(row: CampaignTokenRow): CampaignTokenRecord {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    kind: row.kind,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
}

export function createCampaignTokenValue(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCampaignToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function createCampaignToken(
  campaignId: string,
  kind: CampaignTokenKind,
  ttlSeconds = kind === "manage" ? MANAGE_TOKEN_TTL_SECONDS : DEFAULT_TOKEN_TTL_SECONDS,
  db?: RepositoryClient
): Promise<{ token: string; record: CampaignTokenRecord }> {
  const parsedKind = campaignTokenKindSchema.parse(kind);
  const token = createCampaignTokenValue();
  const tokenHash = hashCampaignToken(token);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const { data, error } = await client(db)
    .from("campaign_tokens")
    .insert({
      campaign_id: campaignId,
      kind: parsedKind,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) {
    throw new CampaignTokenError(`Campaign token create failed: ${error.message}`);
  }

  return { token, record: mapToken(data as CampaignTokenRow) };
}

export async function consumeCampaignToken(
  token: string,
  expectedKind?: CampaignTokenKind,
  db?: RepositoryClient
): Promise<CampaignTokenRecord | null> {
  const found = await getUsableCampaignToken(token, expectedKind, db);
  if (!found) return null;

  const { data: consumed, error: consumeError } = await client(db)
    .from("campaign_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", found.id)
    .is("used_at", null)
    .select("*")
    .maybeSingle();

  if (consumeError) {
    throw new CampaignTokenError(
      `Campaign token consume failed: ${consumeError.message}`
    );
  }

  return consumed ? mapToken(consumed as CampaignTokenRow) : null;
}

export async function getUsableCampaignToken(
  token: string,
  expectedKind?: CampaignTokenKind,
  db?: RepositoryClient
): Promise<CampaignTokenRecord | null> {
  const tokenHash = hashCampaignToken(token);
  const query = client(db)
    .from("campaign_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString());

  const { data: found, error: findError } = expectedKind
    ? await query.eq("kind", campaignTokenKindSchema.parse(expectedKind)).maybeSingle()
    : await query.maybeSingle();

  if (findError) {
    throw new CampaignTokenError(`Campaign token lookup failed: ${findError.message}`);
  }
  return found ? mapToken(found as CampaignTokenRow) : null;
}

export async function revokeCampaignToken(
  tokenId: string,
  db?: RepositoryClient
): Promise<void> {
  const { error } = await client(db)
    .from("campaign_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenId)
    .is("used_at", null);

  if (error) {
    throw new CampaignTokenError(`Campaign token revoke failed: ${error.message}`);
  }
}

export async function revokeCampaignTokensForCampaign(
  campaignId: string,
  kind?: CampaignTokenKind,
  db?: RepositoryClient
): Promise<void> {
  const query = client(db)
    .from("campaign_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("campaign_id", campaignId)
    .is("used_at", null);

  const { error } = kind
    ? await query.eq("kind", campaignTokenKindSchema.parse(kind))
    : await query;

  if (error) {
    throw new CampaignTokenError(`Campaign tokens revoke failed: ${error.message}`);
  }
}
