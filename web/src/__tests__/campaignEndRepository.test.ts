jest.mock("server-only", () => ({}), { virtual: true });

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getLandingCampaigns,
  getRecentActiveCampaigns,
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
