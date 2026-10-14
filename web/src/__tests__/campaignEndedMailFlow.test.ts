import {
  buildCampaignCreatorStats,
  CREATOR_STATS_MIN_RESPONSES,
  type CampaignFeedbackRow,
} from "@/lib/campaigns/creatorStatsView";
import {
  endedMailSendStat,
  isAwaitingEndedMail,
  resolveEndedMailSend,
  type EndedMailCandidate,
} from "@/lib/campaigns/endedMail";

const NOW = new Date("2026-10-14T10:00:00.000Z");
const PAST = "2026-10-01T10:00:00.000Z";
const FUTURE = "2026-11-01T10:00:00.000Z";

function candidate(overrides: Partial<EndedMailCandidate> = {}): EndedMailCandidate {
  return {
    status: "active",
    letterCount: 90,
    endsAt: PAST,
    endedNotifiedAt: null,
    ...overrides,
  };
}

function row(letterSent: boolean | null): CampaignFeedbackRow {
  return {
    created_at: "2026-10-01T10:00:00.000Z",
    rating: 5,
    letter_sent: letterSent,
    political_self_efficacy: null,
    body: null,
    consent: null,
    political_powerlessness_frequency: null,
    feedback_tags: [],
  };
}

function view(rows: CampaignFeedbackRow[] | null, letterCount = 90) {
  return buildCampaignCreatorStats({
    rows,
    signalRows: null,
    now: NOW,
    letterCount,
    ended: true,
  });
}

describe("isAwaitingEndedMail (--list selection)", () => {
  it("selects ended, not yet notified campaigns with 10 or more letters", () => {
    expect(isAwaitingEndedMail(candidate({ letterCount: 10 }), NOW)).toBe(true);
    expect(isAwaitingEndedMail(candidate(), NOW)).toBe(true);
  });

  it.each([
    ["9 letters", candidate({ letterCount: 9 })],
    ["a running campaign", candidate({ endsAt: FUTURE })],
    ["a campaign without an end date", candidate({ endsAt: null })],
    ["an already notified campaign", candidate({ endedNotifiedAt: "2026-10-10T10:00:00.000Z" })],
    ["a blocked campaign", candidate({ status: "blocked" })],
  ])("skips %s", (_label, value) => {
    expect(isAwaitingEndedMail(value, NOW)).toBe(false);
  });

  it("keeps a paused or archived ended campaign in the list", () => {
    expect(isAwaitingEndedMail(candidate({ status: "paused" }), NOW)).toBe(true);
    expect(isAwaitingEndedMail(candidate({ status: "archived" }), NOW)).toBe(true);
  });
});

describe("endedMailSendStat", () => {
  const sent = (count: number) => Array.from({ length: count }, () => row(true));

  it("has no stat for 9 answers", () => {
    expect(endedMailSendStat(view([...sent(5), ...Array.from({ length: 4 }, () => row(false))]))).toBeNull();
  });

  it("shows percent and answer count from 10 answers", () => {
    const rows = [...sent(8), row(false), row(false)];
    expect(CREATOR_STATS_MIN_RESPONSES).toBe(10);
    expect(endedMailSendStat(view(rows))).toEqual({ percent: 80, responses: 10 });
  });

  it("counts only answers that know whether the letter was sent", () => {
    const rows = [...sent(9), ...Array.from({ length: 5 }, () => row(null))];
    expect(endedMailSendStat(view(rows))).toBeNull();
  });

  it("is null when the reviews could not be read", () => {
    expect(endedMailSendStat(view(null))).toBeNull();
  });
});

describe("resolveEndedMailSend", () => {
  const base = {
    note: "Danke euch.",
    surveyAvailable: true,
    recipientOverridden: false,
    now: NOW,
  };

  it("always allows a file preview and a preview to Thomas, without marking", () => {
    for (const mode of ["file", "preview_to_me"] as const) {
      expect(
        resolveEndedMailSend({
          ...base,
          mode,
          note: null,
          candidate: candidate({ letterCount: 3, endedNotifiedAt: "2026-10-10T10:00:00.000Z" }),
          surveyAvailable: false,
        }),
      ).toEqual({ ok: true, markNotified: false });
    }
  });

  it("sends with a note and marks the campaign as notified", () => {
    expect(resolveEndedMailSend({ ...base, mode: "send", candidate: candidate() })).toEqual({
      ok: true,
      markNotified: true,
    });
  });

  it.each([null, "", "   "])("refuses to send without a note (%p)", (note) => {
    const result = resolveEndedMailSend({ ...base, mode: "send", note, candidate: candidate() });
    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.reason).toContain("--note");
  });

  it.each([
    ["a running campaign", candidate({ endsAt: FUTURE })],
    ["9 letters", candidate({ letterCount: 9 })],
    ["a blocked campaign", candidate({ status: "blocked" })],
  ])("refuses to send for %s", (_label, value) => {
    expect(resolveEndedMailSend({ ...base, mode: "send", candidate: value })).toMatchObject({
      ok: false,
    });
  });

  it("refuses to send while the survey is unavailable", () => {
    const result = resolveEndedMailSend({
      ...base,
      mode: "send",
      candidate: candidate(),
      surveyAvailable: false,
    });
    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.reason).toContain("029");
  });

  it("refuses to send when ended_notified_at cannot be read", () => {
    const result = resolveEndedMailSend({
      ...base,
      mode: "send",
      candidate: candidate({ endedNotifiedAt: undefined }),
    });
    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.reason).toContain("034");
  });

  it("refuses a second send but allows a test send with --to, which never marks", () => {
    const notified = candidate({ endedNotifiedAt: "2026-10-10T10:00:00.000Z" });
    expect(resolveEndedMailSend({ ...base, mode: "send", candidate: notified })).toMatchObject({
      ok: false,
    });
    expect(
      resolveEndedMailSend({ ...base, mode: "send", candidate: notified, recipientOverridden: true }),
    ).toEqual({ ok: true, markNotified: false });
    expect(
      resolveEndedMailSend({
        ...base,
        mode: "send",
        candidate: candidate(),
        recipientOverridden: true,
      }),
    ).toEqual({ ok: true, markNotified: false });
  });
});
