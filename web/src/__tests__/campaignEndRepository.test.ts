jest.mock("server-only", () => ({}), { virtual: true });

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  activateVerifiedCampaign,
  CampaignRepositoryError,
  createCampaign,
  endCampaignNow,
  getCampaignById,
  getLandingCampaigns,
  getRecentActiveCampaigns,
  pauseCampaign,
  publishCampaignEdits,
  saveAwaitingApprovalCampaignEdits,
  setCampaignEndsAt,
  updateCampaignPublicFields,
} from "@/lib/campaigns/repository";

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "campaign-1",
    slug: "school-routes",
    creator_email: "creator@example.org",
    title: "Sichere Schulwege",
    issue_text: "Schulwege brauchen sichere Querungen.",
    description: null,
    creator_name: null,
    external_url: null,
    logo_path: null,
    status: "active",
    moderation_status: "approved",
    moderation_categories: [],
    target_level: "Bund",
    target_state: null,
    target_politician_ids: [],
    email_verified_at: "2026-09-01T10:00:00.000Z",
    activated_at: "2026-09-02T10:00:00.000Z",
    paused_at: null,
    archived_at: null,
    last_published_revision_id: null,
    letter_count: 3,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-02T10:00:00.000Z",
    ...overrides,
  };
}

function listDb(rows: Record<string, unknown>[]) {
  const query: Record<string, jest.Mock> = {};
  for (const name of ["select", "eq", "or", "not", "order"]) {
    query[name] = jest.fn(() => query);
  }
  query.limit = jest.fn(async () => ({ data: rows, error: null }));
  const db = { from: jest.fn(() => query) } as unknown as SupabaseClient;
  return { db, query };
}

describe("campaign end date in the repository", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-08T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("maps ends_at and defaults a missing column to null", async () => {
    const { db } = listDb([
      baseRow(),
      baseRow({ slug: "ends", ends_at: "2026-12-01T22:59:59.000Z" }),
    ]);

    const campaigns = await getRecentActiveCampaigns(5, db);

    expect(campaigns[0].endsAt).toBeNull();
    expect(campaigns[1].endsAt).toBe("2026-12-01T22:59:59.000Z");
  });

  it("filters ended campaigns out of the recent list in SQL", async () => {
    const { db, query } = listDb([baseRow()]);

    await getRecentActiveCampaigns(3, db);

    expect(query.or).toHaveBeenCalledWith(
      "ends_at.is.null,ends_at.gt.2026-10-08T10:00:00.000Z",
    );
  });

  it("filters ended campaigns out of the landing pills in SQL", async () => {
    const { db, query } = listDb([]);

    await getLandingCampaigns(3, db);

    expect(query.or).toHaveBeenCalledWith(
      "ends_at.is.null,ends_at.gt.2026-10-08T10:00:00.000Z",
    );
  });
});

function writeDb(row: Record<string, unknown>) {
  const patches: Record<string, unknown>[] = [];
  const inserts: Record<string, unknown>[] = [];
  const campaigns: Record<string, jest.Mock> = {};
  campaigns.select = jest.fn(() => campaigns);
  campaigns.eq = jest.fn(() => campaigns);
  campaigns.maybeSingle = jest.fn(async () => ({ data: row, error: null }));
  campaigns.update = jest.fn((patch: Record<string, unknown>) => {
    patches.push(patch);
    Object.assign(row, patch);
    return campaigns;
  });
  campaigns.insert = jest.fn((payload: Record<string, unknown>) => {
    inserts.push(payload);
    Object.assign(row, payload);
    return campaigns;
  });
  campaigns.single = jest.fn(async () => ({ data: row, error: null }));
  const revisions: Record<string, jest.Mock> = {};
  revisions.insert = jest.fn(() => revisions);
  revisions.select = jest.fn(() => revisions);
  revisions.single = jest.fn(async () => ({
    data: { id: "revision-1", campaign_id: row.id, snapshot_reason: "created" },
    error: null,
  }));
  const db = {
    from: jest.fn((table: string) => (table === "campaigns" ? campaigns : revisions)),
  } as unknown as SupabaseClient;
  return { db, patches, inserts };
}

describe("campaign end writes", () => {
  const endedAt = "2026-10-01T21:59:59.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-08T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects every creator write on an ended campaign", async () => {
    const ended = () => writeDb(baseRow({ ends_at: endedAt, email_verified_at: "2026-09-01T10:00:00.000Z" }));
    const edit = { title: "Neuer Titel" };

    await expect(updateCampaignPublicFields("campaign-1", edit, ended().db)).rejects.toThrow(CampaignRepositoryError);
    await expect(publishCampaignEdits("campaign-1", edit, [], ended().db)).rejects.toThrow(CampaignRepositoryError);
    await expect(pauseCampaign("campaign-1", ended().db)).rejects.toThrow(CampaignRepositoryError);
    await expect(
      setCampaignEndsAt("campaign-1", "2026-12-01T22:59:59.000Z", ended().db),
    ).rejects.toThrow(CampaignRepositoryError);
    await expect(endCampaignNow("campaign-1", ended().db)).rejects.toThrow(CampaignRepositoryError);

    const awaiting = writeDb(baseRow({ status: "awaiting_approval", ends_at: endedAt }));
    await expect(
      saveAwaitingApprovalCampaignEdits("campaign-1", edit, [], awaiting.db),
    ).rejects.toThrow(CampaignRepositoryError);

    const paused = writeDb(baseRow({ status: "paused", ends_at: endedAt }));
    const pausedCampaign = await getCampaignById("campaign-1", paused.db);
    await expect(
      activateVerifiedCampaign(pausedCampaign!, paused.db),
    ).rejects.toThrow(CampaignRepositoryError);
  });

  it("ends an active campaign at the current instant", async () => {
    const { db, patches } = writeDb(baseRow());

    const campaign = await endCampaignNow("campaign-1", db);

    expect(patches[0]).toMatchObject({ ends_at: "2026-10-08T10:00:00.000Z" });
    expect(patches[0]).not.toHaveProperty("status");
    expect(campaign.endsAt).toBe("2026-10-08T10:00:00.000Z");
  });

  it("reactivates a paused campaign when ending it so the ended page is reachable", async () => {
    const { db, patches } = writeDb(baseRow({ status: "paused" }));

    await endCampaignNow("campaign-1", db);

    expect(patches[0]).toMatchObject({ ends_at: "2026-10-08T10:00:00.000Z", status: "active" });
  });

  it.each(["archived", "blocked"])("refuses to end a %s campaign", async (status) => {
    const { db } = writeDb(baseRow({ status }));

    await expect(endCampaignNow("campaign-1", db)).rejects.toThrow(CampaignRepositoryError);
  });

  it("accepts a future end date or null and rejects a past instant", async () => {
    const future = writeDb(baseRow());
    await setCampaignEndsAt("campaign-1", "2026-12-01T22:59:59.000Z", future.db);
    expect(future.patches[0]).toMatchObject({ ends_at: "2026-12-01T22:59:59.000Z" });

    const cleared = writeDb(baseRow({ ends_at: "2026-12-01T22:59:59.000Z" }));
    await setCampaignEndsAt("campaign-1", null, cleared.db);
    expect(cleared.patches[0]).toMatchObject({ ends_at: null });

    await expect(
      setCampaignEndsAt("campaign-1", "2026-10-08T10:00:00.000Z", writeDb(baseRow()).db),
    ).rejects.toThrow(CampaignRepositoryError);
    await expect(
      setCampaignEndsAt("campaign-1", "2026-10-01T10:00:00.000Z", writeDb(baseRow()).db),
    ).rejects.toThrow(CampaignRepositoryError);
  });

  it("sends ends_at on create only when an end date was chosen", async () => {
    const input = {
      slug: "neue-kampagne",
      creatorEmail: "creator@example.org",
      title: "Neue Kampagne",
      issueText: "Ein ausreichend langer Text für die neue Kampagne.",
    };

    const without = writeDb(baseRow());
    await createCampaign(input, without.db);
    expect(without.inserts[0]).not.toHaveProperty("ends_at");

    const withDate = writeDb(baseRow());
    await createCampaign({ ...input, endsAt: "2026-12-01T22:59:59.000Z" }, withDate.db);
    expect(withDate.inserts[0]).toMatchObject({ ends_at: "2026-12-01T22:59:59.000Z" });
  });
});
