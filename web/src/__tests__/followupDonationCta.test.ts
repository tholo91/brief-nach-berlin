import { APP_URL, DONATION_PROVIDER_URL } from "@/lib/config";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { getEmailCopy } from "@/lib/email/mailLocale";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

const BANNER = "spenden-banner-thomas.jpg";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe("follow-up donation section", () => {
  it("renders full-width stars and a donation section with banner linked to WE AID", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });
    const copy = SUPPORT_EMAIL_COPY.de;

    expect(SUPPORT_CONTENT.ctas.donate.href).toBe(DONATION_PROVIDER_URL);
    expect(followup.html).not.toContain("48.5%");
    expect(followup.html).not.toContain("followup-action-gap");
    expect(followup.html).toContain("followup-rating-column");

    expect(followup.html).toContain(`${APP_URL}/images/${BANNER}`);
    expect(followup.html).toContain('width="536"');
    expect(followup.html).toContain("max-width:100%");
    const bannerInAnchor = new RegExp(
      `<a href="${DONATION_PROVIDER_URL}"(?:(?!</a>).)*${BANNER}`,
    );
    expect(followup.html).toMatch(bannerInAnchor);

    expect(countOccurrences(followup.html, DONATION_PROVIDER_URL)).toBe(2);
    expect(countOccurrences(followup.text, DONATION_PROVIDER_URL)).toBe(1);
    expect(followup.text).toContain(
      `${copy.compactButton}: ${DONATION_PROVIDER_URL}`,
    );
    expect(followup.text).toContain("Jetzt spenden: ");

    expect(followup.html).toContain("Schon 5 € helfen");
    expect(followup.text).toContain("Schon 5 € helfen");
    expect(followup.html).toContain("über WE AID, Spendenquittung möglich");
    expect(followup.html).toContain("icon-heart-white.png");
    expect(followup.html).toContain('margin-right:6px;">Jetzt spenden');
    expect(followup.html).toContain("Ich drücke dir die Daumen");
    expect(followup.html).not.toContain("/spenden?src=email");
    expect(followup.text).not.toContain(BANNER);
  });

  it("uses the baseUrl override for banner and heart icon", () => {
    const html = buildFollowupHtml({
      token: "preview",
      baseUrl: "http://localhost:3011",
    }).html;

    expect(html).toContain(`src="http://localhost:3011/images/${BANNER}"`);
    expect(html).toContain('src="http://localhost:3011/images/icon-heart-white.png"');
  });

  it("places the donation section between the stars and the sign-off", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });
    const copy = SUPPORT_EMAIL_COPY.de;
    const html = followup.html;

    const star = html.indexOf("/feedback?r=5");
    const heading = html.indexOf(escapeHtml(copy.followup.heading));
    const banner = html.indexOf(BANNER);
    const provider = html.indexOf(escapeHtml(copy.followup.providerLabel));
    const signoff = html.indexOf("Sign-off paragraph");
    expect(star).toBeGreaterThan(-1);
    expect(star).toBeLessThan(heading);
    expect(heading).toBeLessThan(banner);
    expect(banner).toBeLessThan(provider);
    expect(provider).toBeLessThan(signoff);

    const text = followup.text;
    const tStar = text.indexOf("/feedback?r=5");
    const tHeading = text.indexOf(copy.followup.heading);
    const tButton = text.indexOf(`${copy.compactButton}: `);
    const tIgnore = text.indexOf(getEmailCopy("de").followup.ignore);
    expect(tStar).toBeGreaterThan(-1);
    expect(tStar).toBeLessThan(tHeading);
    expect(tHeading).toBeLessThan(tButton);
    expect(tButton).toBeLessThan(tIgnore);
  });

  const fiveEuro = { de: "Schon 5 €", en: "€5", tr: "5 € bile" } as const;

  it.each(["de", "en", "tr"] as const)(
    "carries the localized donation copy for %s",
    (locale) => {
      const followup = buildFollowupHtml({ token: "signed-token", locale });
      const copy = SUPPORT_EMAIL_COPY[locale];

      expect(followup.html).toContain(escapeHtml(copy.followup.heading));
      expect(followup.html).toContain(escapeHtml(copy.followup.body));
      expect(followup.html).toContain(escapeHtml(copy.followup.providerLabel));
      expect(followup.html).toContain(`alt="${escapeHtml(copy.followup.bannerAlt)}"`);

      expect(followup.text).toContain(copy.followup.heading);
      expect(followup.text).toContain(copy.followup.body);
      expect(followup.text).toContain(copy.followup.providerLabel);
      expect(followup.text).toContain(copy.compactButton);

      expect(copy.followup.body).toContain(fiveEuro[locale]);
    },
  );

  it.each(["de", "en", "tr"] as const)(
    "keeps the new %s copy free of em and en dashes",
    (locale) => {
      const dashes = /[–—]/;
      const followupMail = getEmailCopy(locale).followup;
      const values = [
        ...Object.values(SUPPORT_EMAIL_COPY[locale].followup),
        followupMail.created,
        followupMail.feedback,
      ];

      for (const value of values) {
        expect(value).not.toMatch(dashes);
      }
    },
  );
});
