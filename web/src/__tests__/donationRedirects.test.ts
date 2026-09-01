const permanentRedirect = jest.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});

jest.mock("next/navigation", () => ({ permanentRedirect }));

import SpendePage from "@/app/(site)/spende/page";
import SupportPage from "@/app/(site)/support/page";
import UnterstuetzenPage from "@/app/(site)/unterstuetzen/page";
import { DONATION_PATH } from "@/lib/config";

describe("donation aliases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["/spende", SpendePage],
    ["/support", SupportPage],
    ["/unterstuetzen", UnterstuetzenPage],
  ])("permanently redirects %s to the canonical donation page", (_path, Page) => {
    expect(Page).toThrow(`redirect:${DONATION_PATH}`);
    expect(permanentRedirect).toHaveBeenCalledWith(DONATION_PATH);
  });
});
