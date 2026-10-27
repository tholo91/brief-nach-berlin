import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DonationCard } from "@/components/support/DonationCard";
import { DONATION_PROVIDER_URL } from "@/lib/config";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

jest.mock("@/lib/mistral", () => ({}));

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

const BASE_CLASS =
  "overflow-hidden rounded-2xl border border-waldgruen/15 bg-creme/90 px-5 py-5 shadow-[0_18px_50px_-38px_rgba(24,70,51,0.7)] backdrop-blur-[2px] sm:px-6";

describe("DonationCard", () => {
  const props = {
    titleId: "success-support-title",
    title: SUPPORT_CONTENT.headline,
    body: SUPPORT_EMAIL_COPY.de.body,
  };

  it("renders the former success-screen markup", () => {
    const html = renderToStaticMarkup(
      createElement(DonationCard, { ...props, className: "md:col-start-1 md:row-start-2" }),
    );

    expect(html).toContain('aria-labelledby="success-support-title"');
    expect(html).toContain(`class="${BASE_CLASS} md:col-start-1 md:row-start-2"`);
    expect(html).toContain(
      `<h2 id="success-support-title" class="font-body text-lg font-semibold leading-snug text-waldgruen-dark">${SUPPORT_CONTENT.headline}</h2>`,
    );
    expect(html).toContain(`src="${SUPPORT_CONTENT.founder.portraitPath}"`);
    expect(html).toContain('alt="Thomas Lorenz, der Brief-nach-Berlin entwickelt"');
    expect(html).toContain(SUPPORT_EMAIL_COPY.de.body);
    expect(html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Jetzt spenden");
    expect(html).toContain('href="/spenden"');
    expect(html).toContain("Mehr Informationen");
  });

  it("has no trailing space or undefined without className", () => {
    const html = renderToStaticMarkup(createElement(DonationCard, props));

    expect(html).toContain(`class="${BASE_CLASS}"`);
    expect(html).not.toContain("undefined");
  });
});
