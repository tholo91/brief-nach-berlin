jest.mock("server-only", () => ({}), { virtual: true });

const mockSend = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSend(...args) },
  })),
}));

import { readFileSync } from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_CAMPAIGN_MILESTONES,
  formatLetterCount,
  formatMilestoneList,
  reachedMilestone,
} from "@/lib/campaigns/milestones";

const DEFAULTS = [...DEFAULT_CAMPAIGN_MILESTONES];

describe("reachedMilestone", () => {
  it.each([
    [49, 0, null],
    [50, 0, 50],
    [730, 0, 500],
    [730, 500, null],
    [6000, 0, 5000],
    [6000, 5000, null],
    [6500, 5000, null],
  ])("default stufen: %i letters, notified %i -> %s", (letters, notified, expected) => {
    expect(reachedMilestone(DEFAULTS, letters, notified)).toBe(expected);
  });

  it("works with own stufen", () => {
    expect(reachedMilestone([1000, 5000], 730, 0)).toBeNull();
    expect(reachedMilestone([1000, 5000], 1000, 0)).toBe(1000);
  });

  it("handles empty, missing, unsorted and invalid input", () => {
    expect(reachedMilestone([], 900, 0)).toBeNull();
    expect(reachedMilestone(null, 900, 0)).toBeNull();
    expect(reachedMilestone(undefined, 900, 0)).toBeNull();
    expect(reachedMilestone([500, 50, 100], 120, 0)).toBe(100);
    expect(reachedMilestone([0, -5, 50], 60, 0)).toBe(50);
    expect(reachedMilestone([0, -5], 60, 0)).toBeNull();
  });
});

describe("formatting", () => {
  it("formats letter counts and stufen lists in German", () => {
    expect(formatLetterCount(1000)).toBe("1.000");
    expect(formatLetterCount(50)).toBe("50");
    expect(formatMilestoneList(DEFAULTS)).toBe("50, 100, 500, 1.000, 2.000 und 5.000");
    expect(formatMilestoneList([1000])).toBe("1.000");
    expect(formatMilestoneList([1000, 5000])).toBe("1.000 und 5.000");
    expect(formatMilestoneList([])).toBe("");
  });
});

describe("migration 027", () => {
  it("adds the three columns with the agreed defaults", () => {
    const sql = readFileSync(
      path.join(process.cwd(), "supabase/migrations/027_campaign_milestones.sql"),
      "utf8",
    );

    expect(sql).toContain(
      "add column if not exists milestones integer[] not null default '{50,100,500,1000,2000,5000}'",
    );
    expect(sql).toContain(
      "add column if not exists milestone_notified integer not null default 0",
    );
    expect(sql).toContain(
      "add column if not exists milestone_mails_enabled boolean not null default true",
    );
  });
});

type Row = {
  id: string;
  slug: string;
  title: string;
  creator_email: string;
  creator_name: string | null;
  status: string;
  ends_at: string | null;
  letter_count: number;
  milestones: number[];
  milestone_notified: number;
  milestone_mails_enabled: boolean;
};

function baseRow(overrides: Partial<Row> = {}): Row {
  return {
    id: "campaign-1",
    slug: "mehr-busse",
    title: "Mehr Busse",
    creator_email: "lena@example.org",
    creator_name: "Lena",
    status: "active",
    ends_at: null,
    letter_count: 731,
    milestones: [...DEFAULT_CAMPAIGN_MILESTONES],
    milestone_notified: 0,
    milestone_mails_enabled: true,
    ...overrides,
  };
}

/** One in-memory campaigns row. Reads snapshot at call time, updates apply at await time. */
function fakeClient(row: Row, readError: string | null = null) {
  const tokenInserts: unknown[] = [];
  const client = {
    from: (table: string) => {
      if (table === "campaign_tokens") {
        return {
          insert: (payload: Record<string, unknown>) => {
            tokenInserts.push(payload);
            return {
              select: () => ({
                single: async () => ({
                  data: {
                    id: "token-1",
                    campaign_id: payload.campaign_id,
                    kind: payload.kind,
                    token_hash: payload.token_hash,
                    recipient_email: null,
                    expires_at: payload.expires_at,
                    used_at: null,
                    created_at: "2026-10-09T10:00:00.000Z",
                  },
                  error: null,
                }),
              }),
            };
          },
        };
      }
      return {
        select: () => ({
          eq: () => {
            const snapshot = { ...row };
            return {
              maybeSingle: async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
                return readError
                  ? { data: null, error: { message: readError } }
                  : { data: snapshot, error: null };
              },
            };
          },
        }),
        update: (patch: Partial<Row>) => {
          const filters: Array<(r: Row) => boolean> = [];
          const builder = {
            eq: (column: keyof Row, value: unknown) => {
              filters.push((r) => r[column] === value);
              return builder;
            },
            lt: (column: keyof Row, value: number) => {
              filters.push((r) => (r[column] as number) < value);
              return builder;
            },
            select: () => ({
              then: (resolve: (value: unknown) => unknown) => {
                const matches = filters.every((filter) => filter(row));
                if (matches) Object.assign(row, patch);
                return resolve({ data: matches ? [{ id: row.id }] : [], error: null });
              },
            }),
          };
          return builder;
        },
      };
    },
  };
  return { client: client as unknown as SupabaseClient, tokenInserts };
}

describe("claimAndSendCampaignMilestone", () => {
  const original = {
    brevo: process.env.BREVO_API_KEY,
    thomas: process.env.THOMAS_MAIL,
  };
  let claimAndSendCampaignMilestone: typeof import("@/lib/campaigns/milestoneNotification").claimAndSendCampaignMilestone;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.THOMAS_MAIL = "thomas@example.org";
    ({ claimAndSendCampaignMilestone } = await import("@/lib/campaigns/milestoneNotification"));
  });

  afterAll(() => {
    if (original.brevo === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = original.brevo;
    if (original.thomas === undefined) delete process.env.THOMAS_MAIL;
    else process.env.THOMAS_MAIL = original.thomas;
  });

  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ messageId: "msg-1" });
  });

  it("sends one milestone mail through the real sender and builder, with BCC and a fresh manage token", async () => {
    const row = baseRow();
    const { client, tokenInserts } = fakeClient(row);

    await claimAndSendCampaignMilestone("mehr-busse", client);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const payload = mockSend.mock.calls[0]![0];
    expect(payload.subject).toBe("500 Briefe für „Mehr Busse“");
    expect(payload.to).toEqual([{ email: "lena@example.org" }]);
    expect(payload.bcc).toEqual([{ email: "thomas@example.org" }]);
    expect(payload.tags).toContain("campaign-milestone");
    expect(payload.htmlContent).toContain("500 Briefe und kein Ende in Sicht.");
    expect(payload.htmlContent).toContain("/kampagne/verwalten?token=");
    expect(tokenInserts).toHaveLength(1);
    expect(tokenInserts[0]).toMatchObject({ campaign_id: "campaign-1", kind: "manage" });
    expect(row.milestone_notified).toBe(500);
  });

  it("does not send a second time for the same stufe", async () => {
    const { client } = fakeClient(baseRow());

    await claimAndSendCampaignMilestone("mehr-busse", client);
    await claimAndSendCampaignMilestone("mehr-busse", client);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("sends exactly one mail for two concurrent claims", async () => {
    const { client } = fakeClient(baseRow());

    await Promise.all([
      claimAndSendCampaignMilestone("mehr-busse", client),
      claimAndSendCampaignMilestone("mehr-busse", client),
    ]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("sends nothing when the creator switched mails off", async () => {
    const row = baseRow({ milestone_mails_enabled: false });
    const { client } = fakeClient(row);

    await claimAndSendCampaignMilestone("mehr-busse", client);

    expect(mockSend).not.toHaveBeenCalled();
    expect(row.milestone_notified).toBe(0);
  });

  it.each([
    ["paused", { status: "paused" }],
    ["ended", { ends_at: "2026-10-01T10:00:00.000Z" }],
  ] as const)("sends nothing for a %s campaign", async (_label, overrides) => {
    const row = baseRow(overrides);
    const { client } = fakeClient(row);

    await claimAndSendCampaignMilestone(
      "mehr-busse",
      client,
      new Date("2026-10-09T10:00:00.000Z"),
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(row.milestone_notified).toBe(0);
  });

  it("sends nothing below the first stufe or above the last notified one", async () => {
    const { client } = fakeClient(baseRow({ letter_count: 49 }));
    await claimAndSendCampaignMilestone("mehr-busse", client);
    const { client: second } = fakeClient(baseRow({ letter_count: 730, milestone_notified: 500 }));
    await claimAndSendCampaignMilestone("mehr-busse", second);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("logs a read error without the creator email and never throws", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const { client } = fakeClient(baseRow(), "column milestones does not exist");

      await expect(claimAndSendCampaignMilestone("mehr-busse", client)).resolves.toBeUndefined();

      expect(spy).toHaveBeenCalled();
      expect(JSON.stringify(spy.mock.calls)).not.toContain("lena@example.org");
      expect(mockSend).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it("keeps the claim and logs without the email when the send fails", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      mockSend.mockRejectedValue(new Error("brevo down"));
      const row = baseRow();
      const { client } = fakeClient(row);

      await expect(claimAndSendCampaignMilestone("mehr-busse", client)).resolves.toBeUndefined();

      expect(row.milestone_notified).toBe(500);
      expect(JSON.stringify(spy.mock.calls)).not.toContain("lena@example.org");
    } finally {
      spy.mockRestore();
    }
  });
});
