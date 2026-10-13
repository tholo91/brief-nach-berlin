jest.mock("server-only", () => ({}), { virtual: true });

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createCampaignRevision,
  getCampaignById,
  publishCampaignEdits,
} from "@/lib/campaigns/repository";
import { getCampaignIssueTexts } from "@/lib/campaigns/issueVariants";

const main = "Das Hauptanliegen braucht eine langfristige und verlässliche öffentliche Lösung.";
const alternative = "Eine alternative Perspektive mit mindestens fünfzig Zeichen für den Test.";
const base = {
  id: "campaign-1",
  slug: "issue-test",
  creator_email: "creator@example.org",
  title: "Kampagne",
  issue_text: main,
  description: null,
  creator_name: null,
  external_url: null,
  logo_path: null,
  status: "active",
  moderation_status: "approved",
  moderation_categories: [],
  target_level: "Bund",
  target_state: null,
  target_recipient: null,
  target_politician_ids: [],
  email_verified_at: "2026-09-01T10:00:00.000Z",
  activated_at: "2026-09-02T10:00:00.000Z",
  paused_at: null,
  archived_at: null,
  last_published_revision_id: null,
  letter_count: 0,
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-02T10:00:00.000Z",
};

function repositoryDb(initialRow: Record<string, unknown>) {
  const row = { ...initialRow };
  const patches: Record<string, unknown>[] = [];
  const snapshots: Record<string, unknown>[] = [];
  const campaigns: Record<string, jest.Mock> = {};
  campaigns.select = jest.fn(() => campaigns);
  campaigns.eq = jest.fn(() => campaigns);
  campaigns.maybeSingle = jest.fn(async () => ({ data: row, error: null }));
  campaigns.update = jest.fn((patch: Record<string, unknown>) => {
    patches.push(patch);
    Object.assign(row, patch);
    return campaigns;
  });
  campaigns.single = jest.fn(async () => ({ data: row, error: null }));

  const revisions: Record<string, jest.Mock> = {};
  revisions.insert = jest.fn((snapshot: Record<string, unknown>) => {
    snapshots.push(snapshot);
    Object.assign(revisions, { pendingSnapshot: snapshot });
    return revisions;
  });
  revisions.select = jest.fn(() => revisions);
  revisions.single = jest.fn(async () => ({
    data: {
      ...revisions.pendingSnapshot,
      id: "revision-1",
      created_at: "2026-09-03T10:00:00.000Z",
    },
    error: null,
  }));

  const db = {
    from: jest.fn((table: string) => table === "campaigns" ? campaigns : revisions),
  } as unknown as SupabaseClient;
  return { db, row, patches, snapshots };
}

describe("campaign issue alternatives in the repository", () => {
  it("defaults missing columns to no alternatives and a null base", async () => {
    const { db } = repositoryDb(base);
    const campaign = await getCampaignById("campaign-1", db);
    expect(campaign).toMatchObject({ issueTextAlternatives: [], issueTextAlternativesBase: null });
  });

  it("maps valid alternatives and tolerates invalid stored data", async () => {
    const valid = repositoryDb({
      ...base,
      issue_text_alternatives: [alternative],
      issue_text_alternatives_base: main,
    });
    expect(await getCampaignById("campaign-1", valid.db)).toMatchObject({
      issueTextAlternatives: [alternative],
      issueTextAlternativesBase: main,
    });

    const invalid = repositoryDb({ ...base, issue_text_alternatives: ["too short"] });
    const campaign = await getCampaignById("campaign-1", invalid.db);
    expect(campaign?.issueTextAlternatives).toEqual([]);
    expect(campaign?.issueText).toBe(main);
  });

  it("snapshots alternatives and their base for created and published revisions", async () => {
    const { db, snapshots } = repositoryDb({
      ...base,
      issue_text_alternatives: [alternative],
      issue_text_alternatives_base: main,
    });
    await createCampaignRevision("campaign-1", "created", db);
    await publishCampaignEdits("campaign-1", { title: "Neuer Titel" }, [], db);

    expect(snapshots).toHaveLength(2);
    expect(snapshots).toEqual(expect.arrayContaining([
      expect.objectContaining({ issue_text_alternatives: [alternative], issue_text_alternatives_base: main }),
    ]));
    for (const snapshot of snapshots) {
      expect(snapshot).toMatchObject({ issue_text_alternatives: [alternative], issue_text_alternatives_base: main });
    }
  });

  it("keeps the prior base after a main text edit so only the new main text is used", async () => {
    const { db, row } = repositoryDb({
      ...base,
      issue_text_alternatives: [alternative],
      issue_text_alternatives_base: main,
    });
    const changedMain = "Das aktualisierte Hauptanliegen fordert weiterhin eine nachvollziehbare öffentliche Lösung.";
    await publishCampaignEdits("campaign-1", { issueText: changedMain }, [], db);

    expect(row.issue_text_alternatives_base).toBe(main);
    expect(getCampaignIssueTexts({
      issueText: row.issue_text as string,
      issueTextAlternatives: row.issue_text_alternatives,
      issueTextAlternativesBase: row.issue_text_alternatives_base as string,
    })).toEqual([changedMain]);
  });

  it("retains valid alternatives on a title-only edit", async () => {
    const { db } = repositoryDb({
      ...base,
      issue_text_alternatives: [alternative],
      issue_text_alternatives_base: main,
    });
    const campaign = await publishCampaignEdits("campaign-1", { title: "Neuer Titel" }, [], db);
    expect(campaign.issueTextAlternatives).toEqual([alternative]);
    expect(campaign.issueTextAlternativesBase).toBe(main);
  });
});
