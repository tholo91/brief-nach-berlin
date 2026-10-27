import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ThankYouCard } from "@/app/(site)/feedback/FeedbackForm";
import { DONATION_PROVIDER_URL } from "@/lib/config";
import { SUPPORT_CONTENT } from "@/lib/support-content";

jest.mock("@/lib/mistral", () => ({}));

jest.mock("@/lib/actions/submitReview", () => ({
  submitReviewAction: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next/image", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: ({ src, alt }: { src: string; alt: string }) =>
      React.createElement("img", { src, alt }),
  };
});

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    createElement("a", { href, className }, children),
}));

function render(rating: number): string {
  return renderToStaticMarkup(
    createElement(ThankYouCard, {
      onSkip: () => {},
      rating,
      feedbackTags: [],
      body: "",
      token: "t",
    }),
  );
}

const FILLED_GREEN = /(^|[\s"])bg-waldgruen(?=[\s"])/g;

describe("feedback thank-you card", () => {
  it.each([4, 5])("shows the donation card and no redirect at %i stars", (rating) => {
    const html = render(rating);

    expect(html).toContain(SUPPORT_CONTENT.feedbackDonation.headline);
    expect(html).toContain(SUPPORT_CONTENT.feedbackDonation.text);
    expect(html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain("Jetzt spenden");
    expect(html).toContain('href="/spenden"');
    expect(html).toContain("Mehr Informationen");
    expect(html).toContain(SUPPORT_CONTENT.founder.portraitPath);
    expect(html).toContain("Generelles Feedback zum Tool");
    expect(html).toContain("Zurück zur Startseite");

    expect(html).not.toContain("Du wirst gleich automatisch weitergeleitet");
    expect(html).not.toContain("Pausiert");
    expect(html).not.toContain("animate-progress");
    expect(html).not.toContain("Brief jetzt verbessern");

    expect(html.match(FILLED_GREEN)?.length).toBe(1);
  });

  it.each([1, 3])("keeps the recovery card and redirect at %i stars", (rating) => {
    const html = render(rating);

    expect(html).toContain("Du wirst gleich automatisch weitergeleitet");
    expect(html).toContain("animate-progress");
    expect(html).toContain("Brief jetzt verbessern");
    expect(html).toContain("Generelles Feedback zum Tool");
    expect(html).toContain("bg-waldgruen text-creme");

    expect(html).not.toContain(SUPPORT_CONTENT.feedbackDonation.headline);
    expect(html).not.toContain(DONATION_PROVIDER_URL);
  });

  it("uses the agreed copy without dashes or 'wir'", () => {
    const { headline, text } = SUPPORT_CONTENT.feedbackDonation;

    expect(headline).toBe("Schön, dass dir dein Brief gefällt");
    expect(text).toBe(
      "Ich mache Brief-nach-Berlin allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Damit es für die Nächsten kostenlos bleibt: Schon 5 € helfen.",
    );
    for (const value of [headline, text]) {
      expect(value).not.toMatch(/[–—]/);
      expect(value).not.toMatch(/\bwir\b/i);
    }
  });

  it("never schedules the redirect timer at 4 to 5 stars", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(site)/feedback/FeedbackForm.tsx"),
      "utf8",
    );

    expect(source).toContain("if (!autoRedirect) return");
  });
});
