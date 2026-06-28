import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { consumeCampaignToken } from "./tokens";
import type { CampaignTokenKind } from "./schema";

export const CAMPAIGN_MANAGEMENT_SESSION_COOKIE =
  "bnb_campaign_management_session";

const SESSION_TTL_SECONDS = 60 * 60 * 2;

const managementSessionSchema = z.object({
  campaignId: z.string().uuid(),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});

export type CampaignManagementSession = z.infer<
  typeof managementSessionSchema
>;

function sessionSecret(): string {
  const secret =
    process.env.CAMPAIGN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "CAMPAIGN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }
  return secret;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): string {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(body: string): string {
  return b64url(createHmac("sha256", sessionSecret()).update(body).digest());
}

export function createCampaignManagementSessionValue(
  campaignId: string,
  ttlSeconds = SESSION_TTL_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(
    JSON.stringify({
      campaignId,
      iat: now,
      exp: now + ttlSeconds,
    })
  );
  return `${body}.${sign(body)}`;
}

export function verifyCampaignManagementSessionValue(
  value: string
): CampaignManagementSession | null {
  const dot = value.indexOf(".");
  if (dot < 1 || dot === value.length - 1) return null;
  const body = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = sign(body);
  const actualBuffer = Buffer.from(mac);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = managementSessionSchema.parse(JSON.parse(fromB64url(body)));
    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCampaignManagementSession(
  campaignId: string,
  ttlSeconds = SESSION_TTL_SECONDS
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
    value: createCampaignManagementSessionValue(campaignId, ttlSeconds),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/kampagne",
    maxAge: ttlSeconds,
  });
}

export async function getCampaignManagementSession(): Promise<CampaignManagementSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CAMPAIGN_MANAGEMENT_SESSION_COOKIE);
  return cookie ? verifyCampaignManagementSessionValue(cookie.value) : null;
}

export async function clearCampaignManagementSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: CAMPAIGN_MANAGEMENT_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/kampagne",
    maxAge: 0,
  });
}

export async function exchangeCampaignTokenForManagementSession(
  token: string,
  expectedKind: CampaignTokenKind = "verify_email"
): Promise<CampaignManagementSession | null> {
  const record = await consumeCampaignToken(token, expectedKind);
  if (!record) return null;
  await setCampaignManagementSession(record.campaignId);
  return getCampaignManagementSession();
}
