import { isWinterActionActive, isWinterFollowupActive } from "@/lib/winter-action";
import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const mail: SendLetterEmailParams = {
  locale: "de",
  recipientEmail: "test@example.org",
  politicianName: "Anna Müller",
  politicianFirstName: "Anna",
  politicianLastName: "Müller",
  politicianTitle: null,
  politicianParty: "SPD",
  politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
  politicianAbgeordnetenwatchUrl: null,
  recipientKind: "mdb",
  letterText: "Testbrief",
  issueText: "Testanliegen",
};

afterEach(() => jest.useRealTimers());

describe("winter action schedule", () => {
  it.each([
    ["2026-11-30T22:59:59.000Z", false], // 30.11. 23:59:59 Berlin
    ["2026-11-30T23:00:00.000Z", true], // 01.12. 00:00 Berlin
    ["2026-12-31T22:59:59.000Z", true], // 31.12. 23:59:59 Berlin
    ["2026-12-31T23:00:00.000Z", true], // 01.01. 00:00 Berlin
    ["2027-01-07T22:59:59.000Z", true], // 07.01. 23:59:59 Berlin
    ["2027-01-07T23:00:00.000Z", false], // 08.01. 00:00 Berlin
  ])("checks Berlin boundary %s", (date, expected) => {
    expect(isWinterActionActive(new Date(date))).toBe(expected);
  });

  it.each([
    ["2026-11-28T22:59:59.000Z", false],
    ["2026-11-28T23:00:00.000Z", true],
    ["2026-12-30T22:59:59.000Z", true],
    ["2026-12-30T23:00:00.000Z", false],
  ])("uses the Berlin creation date for follow-ups %s", (date, expected) => {
    jest.useFakeTimers().setSystemTime(new Date(date));
    expect(isWinterFollowupActive()).toBe(expected);
    expect(buildFollowupHtml({ token: "test" }).html.includes("/weihnachten")).toBe(expected);
  });

  it("routes only follow-up emails through the Christmas page during December", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-12-15T12:00:00.000Z"));
    const firstHtml = buildEmailHtml(mail);
    expect(firstHtml).not.toContain("/weihnachten");
    expect(buildLetterEmailText(mail)).not.toContain("/weihnachten");

    const followup = buildFollowupHtml({ token: "test" });
    expect(followup.html).toContain("Dieses Weihnachten teile ich meine Reichweite");
    expect(followup.html).toContain("/weihnachten");
    expect(followup.html).toContain("/images/thomas-weihnachten.png");
    expect(followup.text).toMatch(/Jetzt unterstützen: https:\/\/[^/]+\/weihnachten/);
    expect(followup.html).not.toContain(SUPPORT_CONTENT.ctas.donate.href);
  });

  it.each([
    ["de", "Jetzt unterstützen"],
    ["en", "Support winter projects"],
    ["tr", "Kış projelerini destekle"],
  ] as const)("localizes the winter follow-up for %s", (locale, label) => {
    jest.useFakeTimers().setSystemTime(new Date("2026-12-15T12:00:00.000Z"));
    const followup = buildFollowupHtml({ token: "test", locale });
    expect(followup.html).toContain(label);
    expect(followup.html).toContain("/weihnachten");
    expect(followup.text).toContain("/weihnachten");
  });

  it("keeps youth emails and dates outside December on the ordinary flow", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-12-15T12:00:00.000Z"));
    const youth = { ...mail, audience: "jung" as const };
    expect(buildEmailHtml(youth)).not.toContain("/winteraktion");
    expect(buildEmailHtml(youth)).not.toContain("/weihnachten");
    expect(buildEmailHtml(youth)).not.toContain("/spenden");
    expect(buildLetterEmailText(youth)).not.toContain("/winteraktion");
    expect(buildLetterEmailText(youth)).not.toContain("/weihnachten");

    jest.setSystemTime(new Date("2027-01-01T12:00:00.000Z"));
    expect(buildEmailHtml(mail)).toContain(SUPPORT_CONTENT.ctas.learnMore.href);
    expect(buildLetterEmailText(mail)).toContain(`/spenden`);
    expect(buildFollowupHtml({ token: "test" }).html).toContain(SUPPORT_CONTENT.ctas.donate.href);
  });
});
