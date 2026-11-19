jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/server", () => ({ after: jest.fn() }));
jest.mock("@/lib/campaigns/repository", () => {
  class CampaignRepositoryError extends Error {}
  return {
    CampaignRepositoryError,
    getCampaignById: jest.fn(),
    publishCampaignEdits: jest.fn(),
    saveAwaitingApprovalCampaignEdits: jest.fn(),
  };
});
jest.mock("@/lib/campaigns/session", () => ({
  getCampaignManagementSession: jest.fn(),
}));
jest.mock("@/lib/moderation/moderateText", () => ({ moderateText: jest.fn() }));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/lookup/plzLookup", () => ({ getBundestagPoliticiansByIds: jest.fn(() => []) }));
jest.mock("@/lib/campaigns/classifyTopic", () => ({ classifyAndSaveCampaignTopic: jest.fn() }));

import type { SupabaseClient } from "@supabase/supabase-js";
import { updateCampaignAction } from "@/lib/actions/updateCampaign";
import {
  getCampaignById,
  publishCampaignEdits,
  saveAwaitingApprovalCampaignEdits,
} from "@/lib/campaigns/repository";
import { getCampaignManagementSession } from "@/lib/campaigns/session";
import { moderateText } from "@/lib/moderation/moderateText";
import {
  campaignPersonalHooksSchema,
  getCampaignIssueTexts,
  validateCampaignVariantInput,
} from "@/lib/campaigns/issueVariants";

const CAMPAIGN_ID = "11111111-1111-4111-8111-111111111111";
const issueText = "Das Hauptanliegen braucht eine langfristige und verlässliche öffentliche Lösung.";
const variantA = "Eine erste alternative Perspektive mit mindestens fünfzig Zeichen für den Test.";
const variantB = "Eine zweite alternative Perspektive mit mindestens fünfzig Zeichen für den Test.";

const campaign = {
  id: CAMPAIGN_ID,
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  creatorName: null,
  title: "Sichere Schulwege",
  issueText,
  description: null,
  externalUrl: null,
  logoPath: null,
  status: "active",
  moderationStatus: "approved",
  moderationCategories: [],
  targetLevel: "Bund",
  targetState: null,
  targetRecipient: null,
  targetPoliticianIds: [],
  activatedAt: "2026-09-01T10:00:00.000Z",
  endsAt: null,
};

function formData(
  options: {
    issueText?: string;
    alternatives?: string[];
    hooks?: string[];
    submitted?: boolean;
  } = {}
): FormData {
  const data = new FormData();
  data.set("campaignId", CAMPAIGN_ID);
  data.set("title", "Sichere Schulwege");
  data.set("issueText", options.issueText ?? issueText);
  if (options.submitted !== false) data.set("variantsSubmitted", "1");
  for (const text of options.alternatives ?? []) data.append("issueTextAlternative", text);
  for (const text of options.hooks ?? []) data.append("personalHook", text);
  return data;
}

describe("updateCampaignAction: Varianten und Satzanfänge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCampaignManagementSession).mockResolvedValue({
      campaignId: CAMPAIGN_ID,
      creatorEmail: campaign.creatorEmail,
      iat: 1,
      exp: 4_000_000_000,
    });
    jest.mocked(getCampaignById).mockResolvedValue(campaign as never);
    jest.mocked(publishCampaignEdits).mockResolvedValue({ ...campaign, slug: campaign.slug } as never);
    jest.mocked(saveAwaitingApprovalCampaignEdits).mockResolvedValue(campaign as never);
    jest.mocked(moderateText).mockResolvedValue({ flagged: false, categories: [] });
  });

  it("speichert getrimmte Varianten und Satzanfänge und lässt Leeres weg", async () => {
    const result = await updateCampaignAction(
      formData({
        alternatives: [`  ${variantA}  `, "   "],
        hooks: ["  Ich pendle täglich:  ", "", "Meine Familie wartet:"],
      })
    );

    expect(result.ok).toBe(true);
    expect(publishCampaignEdits).toHaveBeenCalledWith(
      CAMPAIGN_ID,
      expect.objectContaining({
        issueTextAlternatives: [variantA],
        personalHooks: ["Ich pendle täglich:", "Meine Familie wartet:"],
      }),
      [],
    );
  });

  it("speichert bei Kampagnen vor der Freigabe über den privaten Pfad", async () => {
    jest.mocked(getCampaignById).mockResolvedValue({ ...campaign, status: "awaiting_approval" } as never);
    const result = await updateCampaignAction(formData({ alternatives: [variantA] }));

    expect(result.ok).toBe(true);
    expect(saveAwaitingApprovalCampaignEdits).toHaveBeenCalledWith(
      CAMPAIGN_ID,
      expect.objectContaining({ issueTextAlternatives: [variantA] }),
      [],
    );
    expect(publishCampaignEdits).not.toHaveBeenCalled();
  });

  it("leert beides, wenn das Formular absichtlich keine Einträge schickt", async () => {
    await updateCampaignAction(formData());
    expect(publishCampaignEdits).toHaveBeenCalledWith(
      CAMPAIGN_ID,
      expect.objectContaining({ issueTextAlternatives: [], personalHooks: [] }),
      [],
    );
  });

  it("fasst Varianten und Satzanfänge nicht an, wenn das Formular sie nicht mitschickt", async () => {
    await updateCampaignAction(formData({ submitted: false, alternatives: [variantA] }));
    const input = jest.mocked(publishCampaignEdits).mock.calls[0][1];
    expect(input).not.toHaveProperty("issueTextAlternatives");
    expect(input).not.toHaveProperty("personalHooks");
  });

  it.each([
    ["zu kurze Variante", { alternatives: ["Zu kurz"] }, "issueTextAlternatives"],
    ["doppelte Variante", { alternatives: [variantA, variantA] }, "issueTextAlternatives"],
    ["Variante gleich Anliegen", { alternatives: [issueText] }, "issueTextAlternatives"],
    [
      "drei Varianten",
      { alternatives: [variantA, variantB, `${variantA} Und noch mehr Text.`] },
      "issueTextAlternatives",
    ],
    ["zu kurzer Satzanfang", { hooks: ["ab"] }, "personalHooks"],
    ["zu langer Satzanfang", { hooks: ["x".repeat(81)] }, "personalHooks"],
    ["doppelter Satzanfang", { hooks: ["Ich bin betroffen:", "Ich bin betroffen:"] }, "personalHooks"],
    ["vier Satzanfänge", { hooks: ["Eins eins", "Zwei zwei", "Drei drei", "Vier vier"] }, "personalHooks"],
  ])("lehnt ab: %s", async (_label, options, field) => {
    const result = await updateCampaignAction(formData(options));

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ fieldErrors: { [field]: expect.any(String) } });
    expect(publishCampaignEdits).not.toHaveBeenCalled();
    expect(saveAwaitingApprovalCampaignEdits).not.toHaveBeenCalled();
  });

  it("schickt Varianten und Satzanfänge durch die Moderation", async () => {
    await updateCampaignAction(formData({ alternatives: [variantA], hooks: ["Ich pendle täglich:"] }));

    const moderated = jest.mocked(moderateText).mock.calls.map(([text]) => text);
    expect(moderated).toEqual(expect.arrayContaining([issueText, variantA, "Ich pendle täglich:"]));
  });

  it("veröffentlicht nichts, wenn eine Variante von der Moderation markiert wird", async () => {
    jest.mocked(moderateText).mockImplementation(async (text) =>
      text === variantA
        ? { flagged: true, categories: ["hate_and_discrimination"] }
        : { flagged: false, categories: [] }
    );

    const result = await updateCampaignAction(formData({ alternatives: [variantA] }));
    expect(result.ok).toBe(false);
    expect(publishCampaignEdits).not.toHaveBeenCalled();
  });
});

describe("Varianten-Validierung", () => {
  it("trimmt, entfernt Leeres und meldet keine Fehler für gültige Eingaben", () => {
    expect(validateCampaignVariantInput([` ${variantA} `, ""], [" Ich bin betroffen: "], issueText)).toEqual({
      alternatives: [variantA],
      hooks: ["Ich bin betroffen:"],
      errors: {},
    });
  });

  it("das Zod-Schema für Satzanfänge verlangt 3 bis 80 Zeichen, höchstens 3, eindeutig", () => {
    expect(campaignPersonalHooksSchema.safeParse(["Ich bin betroffen:"]).success).toBe(true);
    expect(campaignPersonalHooksSchema.safeParse(["ab"]).success).toBe(false);
    expect(campaignPersonalHooksSchema.safeParse(["Eins eins", "Zwei zwei", "Drei drei", "Vier vier"]).success).toBe(false);
    expect(campaignPersonalHooksSchema.safeParse(["Gleich gleich", "Gleich gleich"]).success).toBe(false);
  });
});

describe("Repository: Base folgt dem Anliegen", () => {
  const actual = jest.requireActual("@/lib/campaigns/repository") as typeof import("@/lib/campaigns/repository");

  function repositoryDb(initialRow: Record<string, unknown>) {
    const row = { ...initialRow };
    const snapshots: Record<string, unknown>[] = [];
    const campaigns: Record<string, jest.Mock> = {};
    campaigns.select = jest.fn(() => campaigns);
    campaigns.eq = jest.fn(() => campaigns);
    campaigns.maybeSingle = jest.fn(async () => ({ data: row, error: null }));
    campaigns.update = jest.fn((patch: Record<string, unknown>) => {
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
      data: { ...revisions.pendingSnapshot, id: "revision-1", created_at: "2026-09-03T10:00:00.000Z" },
      error: null,
    }));
    const db = {
      from: jest.fn((table: string) => (table === "campaigns" ? campaigns : revisions)),
    } as unknown as SupabaseClient;
    return { db, row, snapshots };
  }

  const baseRow = {
    id: CAMPAIGN_ID,
    slug: "sichere-schulwege",
    creator_email: "owner@example.org",
    title: "Sichere Schulwege",
    issue_text: issueText,
    issue_text_alternatives: [variantA],
    issue_text_alternatives_base: issueText,
    personal_hooks: [],
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

  it("hält die Base synchron, wenn das Anliegen mit Varianten geändert wird", async () => {
    const { db, row, snapshots } = repositoryDb(baseRow);
    const changed = "Das Hauptanliegen fordert weiterhin eine nachvollziehbare öffentliche Lösung.";
    await actual.publishCampaignEdits(
      CAMPAIGN_ID,
      { issueText: changed, issueTextAlternatives: [variantA, variantB], personalHooks: ["Ich pendle täglich:"] },
      [],
      db
    );

    expect(row.issue_text_alternatives).toEqual([variantA, variantB]);
    expect(row.issue_text_alternatives_base).toBe(changed);
    expect(row.personal_hooks).toEqual(["Ich pendle täglich:"]);
    expect(getCampaignIssueTexts({
      issueText: row.issue_text as string,
      issueTextAlternatives: row.issue_text_alternatives,
      issueTextAlternativesBase: row.issue_text_alternatives_base as string,
    })).toEqual([changed, variantA, variantB]);
    // Die Revision bekommt die neuen Varianten, nicht die alten.
    expect(snapshots[0]).toMatchObject({
      issue_text: changed,
      issue_text_alternatives: [variantA, variantB],
      issue_text_alternatives_base: changed,
    });
    expect(snapshots[0]).not.toHaveProperty("personal_hooks");
  });

  it("speichert Varianten und Satzanfänge auch vor der Freigabe", async () => {
    const { db, row } = repositoryDb({ ...baseRow, status: "awaiting_approval", moderation_status: "pending" });
    const changed = "Das Hauptanliegen fordert weiterhin eine nachvollziehbare öffentliche Lösung.";
    await actual.saveAwaitingApprovalCampaignEdits(
      CAMPAIGN_ID,
      { issueText: changed, issueTextAlternatives: [variantB], personalHooks: ["Meine Familie wartet:"] },
      [],
      db
    );

    expect(row.issue_text_alternatives).toEqual([variantB]);
    expect(row.issue_text_alternatives_base).toBe(changed);
    expect(row.personal_hooks).toEqual(["Meine Familie wartet:"]);
  });
});
