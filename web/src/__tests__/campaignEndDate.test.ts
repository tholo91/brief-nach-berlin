import {
  berlinDateKey,
  campaignEndsAtFromDate,
  endDateForChoice,
  formatCampaignEndDate,
  formatCampaignLiveSince,
  isCampaignEnded,
  parseCampaignEndDateInput,
  runningCampaign,
} from "@/lib/campaigns/endDate";

describe("campaignEndsAtFromDate", () => {
  it("uses 23:59:59 Berlin wall time in summer and winter", () => {
    expect(campaignEndsAtFromDate("2026-10-22")).toBe("2026-10-22T21:59:59.000Z");
    expect(campaignEndsAtFromDate("2026-01-15")).toBe("2026-01-15T22:59:59.000Z");
  });

  it("handles DST switch days", () => {
    expect(campaignEndsAtFromDate("2026-03-29")).toBe("2026-03-29T21:59:59.000Z");
    expect(campaignEndsAtFromDate("2026-10-25")).toBe("2026-10-25T22:59:59.000Z");
  });
});

describe("isCampaignEnded", () => {
  const campaign = { endsAt: "2026-10-22T21:59:59.000Z" };

  it("treats a missing end date as running", () => {
    expect(isCampaignEnded({ endsAt: null }, new Date())).toBe(false);
    expect(isCampaignEnded({}, new Date())).toBe(false);
  });

  it("switches exactly at the 23:59:59 boundary", () => {
    expect(isCampaignEnded(campaign, new Date("2026-10-22T21:59:00Z"))).toBe(false);
    expect(isCampaignEnded(campaign, new Date("2026-10-22T21:59:59Z"))).toBe(true);
    expect(isCampaignEnded(campaign, new Date("2026-10-22T22:00:00Z"))).toBe(true);
  });
});

describe("runningCampaign", () => {
  const now = new Date("2026-10-22T22:00:00Z");

  it("returns the campaign while running and null afterwards", () => {
    const running = { endsAt: "2026-12-01T22:59:59.000Z" };
    const ended = { endsAt: "2026-10-22T21:59:59.000Z" };
    expect(runningCampaign(running, now)).toBe(running);
    expect(runningCampaign({}, now)).toEqual({});
    expect(runningCampaign(ended, now)).toBeNull();
    expect(runningCampaign(null, now)).toBeNull();
  });
});

describe("berlinDateKey", () => {
  it("returns the Berlin calendar day", () => {
    expect(berlinDateKey(new Date("2026-10-22T22:30:00Z"))).toBe("2026-10-23");
    expect(berlinDateKey(new Date("2026-01-15T23:30:00Z"))).toBe("2026-01-16");
  });
});

describe("endDateForChoice", () => {
  const now = new Date("2026-10-08T10:00:00Z");

  it("adds two weeks, one month and three months", () => {
    expect(endDateForChoice("2w", now)).toBe("2026-10-22");
    expect(endDateForChoice("1m", now)).toBe("2026-11-08");
    expect(endDateForChoice("3m", now)).toBe("2027-01-08");
  });

  it("clamps to the last day of shorter months", () => {
    expect(endDateForChoice("1m", new Date("2026-01-31T10:00:00Z"))).toBe("2026-02-28");
    expect(endDateForChoice("3m", new Date("2026-11-30T10:00:00Z"))).toBe("2027-02-28");
  });

  it("starts from the Berlin day, not the UTC day", () => {
    expect(endDateForChoice("2w", new Date("2026-10-08T22:30:00Z"))).toBe("2026-10-23");
  });
});

describe("parseCampaignEndDateInput", () => {
  const now = new Date("2026-10-08T10:00:00Z");

  it("treats empty input as no end date", () => {
    expect(parseCampaignEndDateInput("", now)).toEqual({ ok: true, endsAt: null });
    expect(parseCampaignEndDateInput("  ", now)).toEqual({ ok: true, endsAt: null });
  });

  it("rejects impossible and malformed dates", () => {
    expect(parseCampaignEndDateInput("2026-02-30", now)).toEqual({
      ok: false,
      message: "Bitte wähle ein gültiges Datum.",
    });
    expect(parseCampaignEndDateInput("morgen", now)).toMatchObject({ ok: false });
  });

  it("rejects days before Berlin today and accepts today", () => {
    expect(parseCampaignEndDateInput("2026-10-07", now)).toEqual({
      ok: false,
      message: "Das Enddatum darf nicht in der Vergangenheit liegen.",
    });
    expect(parseCampaignEndDateInput("2026-10-08", now)).toEqual({
      ok: true,
      endsAt: "2026-10-08T21:59:59.000Z",
    });
  });
});

describe("formatCampaignEndDate", () => {
  it("formats the Berlin day in long German form", () => {
    expect(formatCampaignEndDate("2026-10-22T21:59:59.000Z")).toBe("22. Oktober 2026");
  });
});

describe("formatCampaignLiveSince", () => {
  it("formats the Berlin day as dd.mm.yyyy", () => {
    expect(formatCampaignLiveSince("2026-08-11T23:30:00Z")).toBe("12.08.2026");
  });
});
