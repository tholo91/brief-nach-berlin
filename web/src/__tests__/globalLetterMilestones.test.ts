jest.mock("server-only", () => ({}), { virtual: true });

const mockSendMilestoneEmail = jest.fn();
jest.mock("@/lib/email/sendGlobalLetterMilestoneEmail", () => ({
  sendGlobalLetterMilestoneEmail: (...args: unknown[]) => mockSendMilestoneEmail(...args),
}));

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildGlobalLetterMilestoneEmailHtml } from "@/lib/email/buildGlobalLetterMilestoneEmailHtml";
import {
  GLOBAL_LETTER_MILESTONE_INTERVAL,
  isGlobalLetterMilestone,
} from "@/lib/campaigns/globalLetterMilestones";

describe("global letter milestones", () => {
  it.each([
    [999, false],
    [1000, true],
    [1001, false],
    [2000, true],
    [0, false],
    [-1000, false],
    [1000.5, false],
  ])("recognizes %i as a milestone: %s", (count, expected) => {
    expect(isGlobalLetterMilestone(count)).toBe(expected);
  });

  it("keeps the interval at every one thousand generated letters", () => {
    expect(GLOBAL_LETTER_MILESTONE_INTERVAL).toBe(1000);
  });

  it("builds a celebration email with the image and stats as the only CTA", () => {
    const html = buildGlobalLetterMilestoneEmailHtml({
      count: 1000,
      imageUrl: "https://brief-nach-berlin.de/stats/meilenstein/1000/bild",
      statsUrl: "https://brief-nach-berlin.de/stats/unlock?pw=secret",
    });

    expect(html.indexOf("/stats/meilenstein/1000/bild")).toBeLessThan(
      html.indexOf("Zu den Statistiken"),
    );
    expect(html).toContain("1.000 Briefe erstellt");
    expect(html).toContain('href="https://brief-nach-berlin.de/stats/unlock?pw=secret"');
    expect(html).not.toMatch(/Bild speichern|download=|WhatsApp|LinkedIn|Fortschritt teilen/i);
  });
});

function fakeClaimDb(): { claims: Set<number>; client: SupabaseClient } {
  const claims = new Set<number>();
  const client = {
    from: (table: string) => {
      if (table !== "global_letter_milestone_claims") throw new Error(`unexpected table ${table}`);
      return {
        upsert: (row: { milestone_count: number }) => ({
          select: async () => {
            if (claims.has(row.milestone_count)) return { data: [], error: null };
            claims.add(row.milestone_count);
            return { data: [{ milestone_count: row.milestone_count }], error: null };
          },
        }),
      };
    },
  };
  return { claims, client: client as unknown as SupabaseClient };
}

describe("claimAndSendGlobalLetterMilestone", () => {
  let claimAndSendGlobalLetterMilestone: typeof import("@/lib/campaigns/globalLetterMilestoneNotification").claimAndSendGlobalLetterMilestone;

  beforeAll(async () => {
    ({ claimAndSendGlobalLetterMilestone } = await import(
      "@/lib/campaigns/globalLetterMilestoneNotification"
    ));
  });

  beforeEach(() => {
    mockSendMilestoneEmail.mockReset();
    mockSendMilestoneEmail.mockResolvedValue({ success: true });
  });

  it("does not send below or between exact thresholds", async () => {
    const { client } = fakeClaimDb();
    await Promise.all(
      [999, 1001, 1999].map((count) => claimAndSendGlobalLetterMilestone(count, client)),
    );
    expect(mockSendMilestoneEmail).not.toHaveBeenCalled();
  });

  it("sends once at each newly reached threshold", async () => {
    const { client } = fakeClaimDb();
    await claimAndSendGlobalLetterMilestone(1000, client);
    await claimAndSendGlobalLetterMilestone(1000, client);
    await claimAndSendGlobalLetterMilestone(2000, client);

    expect(mockSendMilestoneEmail.mock.calls).toEqual([[1000], [2000]]);
  });

  it("sends only one email when requests concurrently claim the same threshold", async () => {
    const { client } = fakeClaimDb();
    await Promise.all([
      claimAndSendGlobalLetterMilestone(3000, client),
      claimAndSendGlobalLetterMilestone(3000, client),
    ]);

    expect(mockSendMilestoneEmail).toHaveBeenCalledTimes(1);
  });
});
