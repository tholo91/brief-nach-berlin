jest.mock("server-only", () => ({}), { virtual: true });

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CampaignRepositoryError,
  updateCampaignPublicFields,
} from "@/lib/campaigns/repository";

const fixedRecipient = {
  organizationName: "Beispielministerium",
  personName: null,
  salutation: "Sehr geehrte Damen und Herren,",
  street: "Beispielstraße",
  houseNumber: "1",
  postalCode: "12345",
  city: "Beispielstadt",
  countryCode: "DE" as const,
};

function campaignRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "oeffentliche-testkampagne",
    creator_email: "creator@example.org",
    title: "Eine öffentliche Testkampagne",
    issue_text: "Eine ausreichend lange Beschreibung des Kampagnenanliegens.",
    description: null,
    creator_name: "Test Initiative",
    external_url: null,
    logo_path: null,
    status: "awaiting_approval",
    moderation_status: "pending",
    moderation_categories: [],
    target_level: "Bund",
    target_state: null,
    target_recipient: null,
    target_politician_ids: [],
    email_verified_at: "2026-09-29T09:00:00.000Z",
    activated_at: null,
    paused_at: null,
    archived_at: null,
    last_published_revision_id: null,
    letter_count: 0,
    created_at: "2026-09-29T09:00:00.000Z",
    updated_at: "2026-09-29T09:00:00.000Z",
    ...overrides,
  };
}

function campaignClient(row: ReturnType<typeof campaignRow>): SupabaseClient {
  type CampaignQuery = {
    select: jest.Mock;
    eq: jest.Mock;
    maybeSingle: jest.Mock;
    update: jest.Mock;
    single: jest.Mock;
  };
  const campaigns: CampaignQuery = {
    select: jest.fn(() => campaigns),
    eq: jest.fn(() => campaigns),
    maybeSingle: jest.fn(async () => ({ data: row, error: null })),
    update: jest.fn((patch: Record<string, unknown>) => {
      Object.assign(row, patch);
      return campaigns;
    }),
    single: jest.fn(async () => ({ data: row, error: null })),
  };
  return {
    from: jest.fn(() => campaigns),
  } as unknown as SupabaseClient;
}

describe("campaign target lock", () => {
  it("erlaubt Zieltyp und feste Adresse vor der ersten Aktivierung", async () => {
    const row = campaignRow();

    const updated = await updateCampaignPublicFields(row.id, {
      targetLevel: "Fixed",
      targetState: null,
      targetRecipient: fixedRecipient,
      targetPoliticianIds: [],
    }, campaignClient(row));

    expect(updated).toMatchObject({
      targetLevel: "Fixed",
      targetState: null,
      targetRecipient: fixedRecipient,
    });
  });

  it.each(["active", "paused"] as const)(
    "sperrt die feste Adresse nach der ersten Aktivierung auch im Status %s",
    async (status) => {
      const row = campaignRow({
        status,
        moderation_status: "approved",
        target_level: "Fixed",
        target_recipient: fixedRecipient,
        activated_at: "2026-09-29T10:00:00.000Z",
        paused_at: status === "paused" ? "2026-09-29T11:00:00.000Z" : null,
      });

      await expect(updateCampaignPublicFields(row.id, {
        targetRecipient: { ...fixedRecipient, houseNumber: "2" },
      }, campaignClient(row))).rejects.toThrow(CampaignRepositoryError);
    },
  );
});
