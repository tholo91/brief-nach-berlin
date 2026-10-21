jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/campaigns/repository", () => ({
  getManageableCampaignsByCreatorEmail: jest.fn(),
}));
jest.mock("@/lib/campaigns/tokens", () => ({
  createCampaignToken: jest.fn(),
  revokeCampaignToken: jest.fn(),
}));
jest.mock("@/lib/email/sendCampaignCreatorEmail", () => ({
  sendCampaignCreatorEmail: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(),
  hashIdentifier: jest.fn(),
  LIMITS: {
    MANAGE_LINK_PER_IP: { max: 5, windowMs: 3_600_000 },
    MANAGE_LINK_PER_EMAIL: { max: 2, windowMs: 3_600_000 },
  },
}));

import { requestCampaignManageLinkAction } from "@/lib/actions/requestCampaignManageLink";
import { getManageableCampaignsByCreatorEmail } from "@/lib/campaigns/repository";
import { createCampaignToken, revokeCampaignToken } from "@/lib/campaigns/tokens";
import { sendCampaignCreatorEmail } from "@/lib/email/sendCampaignCreatorEmail";
import { checkRateLimit, getClientIp, hashIdentifier } from "@/lib/rateLimit";

const activeCampaign = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "sichere-schulwege",
  creatorEmail: "owner@example.org",
  title: "Sichere Schulwege",
  creatorName: "Initiative Beispiel",
  status: "active",
};

const pendingCampaign = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "mehr-radwege",
  creatorEmail: "owner@example.org",
  title: "Mehr Radwege",
  creatorName: "Initiative Beispiel",
  status: "awaiting_approval",
};

describe("requestCampaignManageLinkAction", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    jest.mocked(getClientIp).mockResolvedValue("127.0.0.1");
    jest.mocked(hashIdentifier).mockImplementation((value) => `h${value.length}x`);
    jest.mocked(getManageableCampaignsByCreatorEmail).mockResolvedValue([]);
    jest
      .mocked(createCampaignToken)
      .mockResolvedValueOnce({ token: "token-a", record: { id: "rec-a" } as never })
      .mockResolvedValueOnce({ token: "token-b", record: { id: "rec-b" } as never });
    jest.mocked(sendCampaignCreatorEmail).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a neutral success for an unknown address", async () => {
    const result = await requestCampaignManageLinkAction("nobody@example.org");

    expect(result).toEqual({ ok: true });
    expect(createCampaignToken).not.toHaveBeenCalled();
    expect(sendCampaignCreatorEmail).not.toHaveBeenCalled();
  });

  it("sends one fresh management mail per manageable campaign", async () => {
    jest
      .mocked(getManageableCampaignsByCreatorEmail)
      .mockResolvedValue([activeCampaign, pendingCampaign] as never);

    const result = await requestCampaignManageLinkAction(" Owner@Example.org ");

    expect(result).toEqual({ ok: true });
    expect(getManageableCampaignsByCreatorEmail).toHaveBeenCalledWith("owner@example.org");
    expect(createCampaignToken).toHaveBeenCalledTimes(2);
    expect(createCampaignToken).toHaveBeenNthCalledWith(1, activeCampaign.id, "manage");
    expect(createCampaignToken).toHaveBeenNthCalledWith(2, pendingCampaign.id, "manage");
    expect(sendCampaignCreatorEmail).toHaveBeenCalledTimes(2);
    expect(sendCampaignCreatorEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        kind: "management",
        campaignStatus: "active",
        recipientEmail: "owner@example.org",
        campaignTitle: "Sichere Schulwege",
        slug: "sichere-schulwege",
        token: "token-a",
        creatorName: "Initiative Beispiel",
      })
    );
    expect(sendCampaignCreatorEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        kind: "management_pending",
        campaignStatus: "awaiting_approval",
        recipientEmail: "owner@example.org",
        token: "token-b",
      })
    );
    expect(revokeCampaignToken).not.toHaveBeenCalled();
  });

  it.each(["kein-at-zeichen", `${"a".repeat(195)}@example.org`])(
    "rejects invalid input %#",
    async (input) => {
      const result = await requestCampaignManageLinkAction(input);

      expect(result).toEqual({ ok: false, reason: "validation" });
      expect(checkRateLimit).not.toHaveBeenCalled();
      expect(getManageableCampaignsByCreatorEmail).not.toHaveBeenCalled();
    }
  );

  it("returns rate_limited without a lookup when a bucket is exhausted", async () => {
    jest.mocked(checkRateLimit).mockReturnValue({ allowed: false });

    const result = await requestCampaignManageLinkAction("owner@example.org");

    expect(result).toEqual({ ok: false, reason: "rate_limited" });
    expect(getManageableCampaignsByCreatorEmail).not.toHaveBeenCalled();
  });

  it("keeps the plain address out of bucket keys", async () => {
    await requestCampaignManageLinkAction("owner@example.org");

    const keys = jest.mocked(checkRateLimit).mock.calls.map((call) => call[0]);
    expect(keys).toHaveLength(2);
    for (const key of keys) {
      expect(key).not.toContain("@");
      expect(key).not.toContain("owner");
    }
  });

  it("revokes the new token when the mail fails and still answers ok", async () => {
    jest
      .mocked(getManageableCampaignsByCreatorEmail)
      .mockResolvedValue([activeCampaign] as never);
    jest.mocked(sendCampaignCreatorEmail).mockResolvedValue({ success: false });
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await requestCampaignManageLinkAction("owner@example.org");

    expect(result).toEqual({ ok: true });
    expect(revokeCampaignToken).toHaveBeenCalledTimes(1);
    expect(revokeCampaignToken).toHaveBeenCalledWith("rec-a");
  });

  it("continues with the next campaign when a token insert throws", async () => {
    jest.mocked(createCampaignToken).mockReset();
    jest
      .mocked(createCampaignToken)
      .mockRejectedValueOnce(new Error("insert failed"))
      .mockResolvedValueOnce({ token: "token-b", record: { id: "rec-b" } as never });
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest
      .mocked(getManageableCampaignsByCreatorEmail)
      .mockResolvedValue([activeCampaign, pendingCampaign] as never);

    const result = await requestCampaignManageLinkAction("owner@example.org");

    expect(result).toEqual({ ok: true });
    expect(sendCampaignCreatorEmail).toHaveBeenCalledTimes(1);
    expect(sendCampaignCreatorEmail).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mehr-radwege", token: "token-b" })
    );
  });

  it("returns server_error on a lookup failure and logs no address", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest
      .mocked(getManageableCampaignsByCreatorEmail)
      .mockRejectedValue(new Error("Campaign lookup failed: boom"));

    const result = await requestCampaignManageLinkAction("owner@example.org");

    expect(result).toEqual({ ok: false, reason: "server_error" });
    const logged = JSON.stringify([
      ...errorSpy.mock.calls,
      ...logSpy.mock.calls,
      ...warnSpy.mock.calls,
    ]);
    expect(errorSpy).toHaveBeenCalled();
    expect(logged).not.toContain("owner@example.org");
    expect(logged).not.toContain("owner");
  });
});
