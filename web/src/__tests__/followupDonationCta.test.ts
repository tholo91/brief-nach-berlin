import { DONATION_PROVIDER_URL } from "@/lib/config";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

describe("follow-up donation CTA", () => {
  it("keeps rating primary and links the compact secondary CTA directly to WE AID", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });

    expect(SUPPORT_CONTENT.ctas.donate.href).toBe(DONATION_PROVIDER_URL);
    expect(followup.html).toContain("followup-rating-column");
    expect(followup.html.match(/width="48\.5%"/g)).toHaveLength(2);
    expect(followup.html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(followup.html).toContain("Jetzt spenden");
    expect(followup.html).toContain("über WE AID");
    expect(followup.html.match(/background-color:#FAF8F5/g)).not.toBeNull();
    expect(followup.text).toContain(
      `${SUPPORT_EMAIL_COPY.de.button}: ${DONATION_PROVIDER_URL}`,
    );
    expect(followup.html).not.toContain(
      'href="https://www.brief-nach-berlin.de/spenden',
    );
  });

  it.each(["de", "en", "tr"] as const)(
    "uses the localized CTA copy for %s",
    (locale) => {
      const followup = buildFollowupHtml({ token: "signed-token", locale });

      expect(followup.html).toContain(
        SUPPORT_EMAIL_COPY[locale].compactHeading.replace(/'/g, "&#39;"),
      );
      expect(followup.html).toContain(
        SUPPORT_EMAIL_COPY[locale].compactButton.replace(/&/g, "&amp;"),
      );
      expect(followup.text).toContain(SUPPORT_EMAIL_COPY[locale].button);
    },
  );
});
