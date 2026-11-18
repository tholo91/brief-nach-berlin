jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/feedback/token", () => ({
  verifyFeedbackToken: jest.fn(),
}));
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true })),
  getClientIp: jest.fn(async () => "203.0.113.1"),
  hashIdentifier: jest.fn(() => "hash"),
  LIMITS: { REVIEW_PER_IP: { max: 1, windowMs: 1000 } },
}));

import { verifyFeedbackToken } from "@/lib/feedback/token";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { submitReviewAction } from "@/lib/actions/submitReview";

const TOKEN = "t".repeat(40);

describe("Bewertung aus dem Schul-Track", () => {
  const upsert = jest.fn(async () => ({ error: null }));

  beforeEach(() => {
    process.env.REVIEW_IP_SALT = "salt";
    upsert.mockClear();
    (getServiceRoleClient as jest.Mock).mockReturnValue({
      from: () => ({ upsert }),
    });
  });

  function youthToken() {
    (verifyFeedbackToken as jest.Mock).mockReturnValue({
      audience: "jung",
      klasse: 9,
      // Ein manipulierter Token darf trotzdem nichts Persönliches ablegen.
      userEmail: "schueler@example.org",
      plz: "28195",
      letterId: "abc",
      politicianId: 7,
    });
  }

  it("speichert nur Sterne, Chips, Verschickt-Antwort, Klassenstufe und feste Altersgruppe", async () => {
    youthToken();
    const result = await submitReviewAction({
      mode: "full",
      rating: 4,
      letterSent: true,
      feedbackTags: ["tonfall_passt"],
      // Alles Folgende ignoriert der Server im Jugendmodus.
      body: "Freitext",
      displayName: "Name",
      consent: true,
      ageGroup: "45_59",
      politicalSelfEfficacy: "clearly_yes",
      token: TOKEN,
    });

    expect(result).toEqual({ success: true });
    const [row] = upsert.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(row).toMatchObject({
      rating: 4,
      letter_sent: true,
      feedback_tags: ["tonfall_passt"],
      age_group: "under_20",
      consent: false,
      body: null,
      display_name: null,
      email: null,
      plz: null,
      letter_id: null,
      politician_id: null,
      campaign_slug: null,
    });
    expect(row.debug_payload).toEqual({ audience: "jung", klasse: 9 });
    expect(row.debug_token).toMatch(/^jung:[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toMatch(/schueler@|28195|Freitext|abc/);
  });

  it("Auto-Submit per Sternklick speichert ebenfalls ohne Personenbezug", async () => {
    youthToken();
    await submitReviewAction({ mode: "initial", rating: 5, token: TOKEN, mailSeq: 1 });

    const [row] = upsert.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(row).toMatchObject({ rating: 5, consent: false, email: null, plz: null, age_group: "under_20" });
    expect(row.debug_payload).toEqual({ audience: "jung", klasse: 9, mail_seq: 1 });
  });
});
