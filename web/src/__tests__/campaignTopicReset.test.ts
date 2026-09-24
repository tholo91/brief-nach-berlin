jest.mock("server-only", () => ({}), { virtual: true });

import type { SupabaseClient } from "@supabase/supabase-js";
import { publishCampaignEdits } from "@/lib/campaigns/repository";

it("clears a published campaign's old topic with the issue edit", async () => {
  const row = {
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
    target_level: "Land",
    target_state: "HB",
    target_politician_ids: [],
    topic_categories: ["verkehr_mobilitaet"],
    topic_labels: ["Sichere Schulwege"],
    topic_taxonomy_version: "v1",
    topic_model: "mistral-small-latest",
    topic_classified_at: "2026-09-24T10:00:00.000Z",
    email_verified_at: "2026-09-01T10:00:00.000Z",
    activated_at: "2026-09-02T10:00:00.000Z",
    paused_at: null,
    archived_at: null,
    last_published_revision_id: "revision-old",
    letter_count: 0,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-02T10:00:00.000Z",
  };
  const patches: Record<string, unknown>[] = [];
  const campaigns = {
    select: jest.fn(() => campaigns),
    eq: jest.fn(() => campaigns),
    maybeSingle: jest.fn(async () => ({ data: row, error: null })),
    update: jest.fn((patch: Record<string, unknown>) => {
      patches.push(patch);
      Object.assign(row, patch);
      return campaigns;
    }),
    single: jest.fn(async () => ({ data: row, error: null })),
  };
  const revisions = {
    insert: jest.fn(() => revisions),
    select: jest.fn(() => revisions),
    single: jest.fn(async () => ({
      data: { id: "revision-new", campaign_id: row.id, snapshot_reason: "edited" },
      error: null,
    })),
  };
  const db = {
    from: jest.fn((table: string) => table === "campaigns" ? campaigns : revisions),
  } as unknown as SupabaseClient;

  const updated = await publishCampaignEdits(row.id, {
    issueText: "Mehr Lehrkräfte für die Schulen in unserem Land.",
  }, [], db);

  expect(updated.issueText).toBe("Mehr Lehrkräfte für die Schulen in unserem Land.");
  expect(updated.topic).toBeNull();
  expect(patches[0]).toMatchObject({
    topic_categories: null,
    topic_labels: null,
    topic_taxonomy_version: null,
    topic_model: null,
    topic_classified_at: null,
  });
});
