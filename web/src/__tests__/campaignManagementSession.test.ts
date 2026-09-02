import { createHmac } from "node:crypto";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/campaigns/repository", () => ({
  getCampaignById: jest.fn(),
}));
jest.mock("@/lib/campaigns/tokens", () => ({
  consumeCampaignToken: jest.fn(),
}));

import {
  createCampaignManagementSessionValue,
  verifyCampaignManagementSessionValue,
} from "@/lib/campaigns/session";

describe("campaign management sessions", () => {
  const originalSecret = process.env.CAMPAIGN_SESSION_SECRET;

  beforeAll(() => {
    process.env.CAMPAIGN_SESSION_SECRET = "test-campaign-session-secret";
  });

  afterAll(() => {
    process.env.CAMPAIGN_SESSION_SECRET = originalSecret;
  });

  it("binds a signed session to the current creator email", () => {
    const value = createCampaignManagementSessionValue(
      "11111111-1111-4111-8111-111111111111",
      "Owner@Example.org",
      60
    );

    expect(verifyCampaignManagementSessionValue(value)).toMatchObject({
      campaignId: "11111111-1111-4111-8111-111111111111",
      creatorEmail: "owner@example.org",
    });
  });

  it("rejects a session without the creator email claim", () => {
    const body = Buffer.from(
      JSON.stringify({
        campaignId: "11111111-1111-4111-8111-111111111111",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      })
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const signature = createHmac(
      "sha256",
      "test-campaign-session-secret"
    )
      .update(body)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(
      verifyCampaignManagementSessionValue(`${body}.${signature}`)
    ).toBeNull();
  });
});
