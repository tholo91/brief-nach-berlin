jest.mock("server-only", () => ({}), { virtual: true });

import { createCampaignTransferToken } from "@/lib/campaigns/tokens";

describe("campaign transfer tokens", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("expires takeover links after seven days", async () => {
    const now = new Date("2026-09-04T00:00:00.000Z");
    jest.useFakeTimers().setSystemTime(now);

    const revokeQuery = {
      eq: jest.fn(),
      is: jest.fn(),
    };
    revokeQuery.eq.mockImplementation((field: string) =>
      field === "kind" ? Promise.resolve({ error: null }) : revokeQuery
    );
    revokeQuery.is.mockReturnValue(revokeQuery);

    let inserted: Record<string, unknown> | null = null;
    const db = {
      from: jest.fn()
        .mockReturnValueOnce({
          update: jest.fn(() => revokeQuery),
        })
        .mockReturnValueOnce({
          insert: jest.fn((payload: Record<string, unknown>) => {
            inserted = payload;
            return {
              select: () => ({
                single: async () => ({
                  data: {
                    id: "token-id",
                    campaign_id: "11111111-1111-4111-8111-111111111111",
                    kind: "transfer",
                    token_hash: payload.token_hash,
                    recipient_email: payload.recipient_email,
                    expires_at: payload.expires_at,
                    used_at: null,
                    created_at: now.toISOString(),
                  },
                  error: null,
                }),
              }),
            };
          }),
        }),
    };

    await createCampaignTransferToken(
      "11111111-1111-4111-8111-111111111111",
      "New.Owner@Example.org",
      db as never
    );

    expect(inserted).toMatchObject({
      recipient_email: "new.owner@example.org",
      expires_at: "2026-09-11T00:00:00.000Z",
    });
  });
});
