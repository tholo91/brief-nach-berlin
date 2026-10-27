import { APP_URL, DONATION_PROVIDER_URL } from "@/lib/config";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { getEmailCopy } from "@/lib/email/mailLocale";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

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

describe("follow-up donation box", () => {
  it("renders full-width stars and the compact donation box with avatar", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });
    const copy = SUPPORT_EMAIL_COPY.de;

    expect(SUPPORT_CONTENT.ctas.donate.href).toBe(DONATION_PROVIDER_URL);
    expect(followup.html).not.toContain("48.5%");
    expect(followup.html).toContain("followup-rating-column");
    expect(followup.html).not.toContain("spenden-banner-thomas.jpg");

    expect(followup.html).toContain(`src="${APP_URL}${SUPPORT_CONTENT.founder.avatarPath}"`);
    expect(followup.html).toContain("bnb-support-action-primary");
    expect(followup.html).toContain(".bnb-support-action {");
    expect(followup.html).toContain("icon-heart-white.png");
    expect(followup.html).toContain(escapeHtml(copy.infoButton));
    expect(followup.html).toContain("/spenden?src=email");

    expect(countOccurrences(followup.html, DONATION_PROVIDER_URL)).toBe(1);
    expect(countOccurrences(followup.text, DONATION_PROVIDER_URL)).toBe(1);
    expect(followup.text).toContain(`${copy.compactButton}: ${DONATION_PROVIDER_URL}`);
    expect(followup.html).toContain("Schon 5 € helfen");
    expect(followup.text).toContain("Schon 5 € helfen");
  });

  it("uses the baseUrl override for the avatar", () => {
    const html = buildFollowupHtml({ token: "preview", baseUrl: "http://localhost:3011" }).html;

    expect(html).toContain(`src="http://localhost:3011${SUPPORT_CONTENT.founder.avatarPath}"`);
  });

  it("places the donation box between the stars and the sign-off", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });
    const copy = SUPPORT_EMAIL_COPY.de;
    const html = followup.html;

    const star = html.indexOf("/feedback?r=5");
    const box = html.indexOf(escapeHtml(copy.followupBody));
    const signoff = html.indexOf("Sign-off paragraph");
    expect(star).toBeGreaterThan(-1);
    expect(star).toBeLessThan(box);
    expect(box).toBeLessThan(signoff);

    const text = followup.text;
    const tStar = text.indexOf("/feedback?r=5");
    const tBody = text.indexOf(copy.followupBody);
    const tIgnore = text.indexOf(getEmailCopy("de").followup.ignore);
    expect(tStar).toBeGreaterThan(-1);
    expect(tStar).toBeLessThan(tBody);
    expect(tBody).toBeLessThan(tIgnore);
  });

  const fiveEuro = { de: "Schon 5 €", en: "€5", tr: "5 € bile" } as const;

  it.each(["de", "en", "tr"] as const)("carries the localized donation copy for %s", (locale) => {
    const followup = buildFollowupHtml({ token: "signed-token", locale });
    const copy = SUPPORT_EMAIL_COPY[locale];

    expect(followup.html).toContain(escapeHtml(copy.heading));
    expect(followup.html).toContain(escapeHtml(copy.followupBody));
    expect(followup.text).toContain(copy.heading);
    expect(followup.text).toContain(copy.followupBody);
    expect(followup.text).toContain(copy.compactButton);
    expect(copy.followupBody).toContain(fiveEuro[locale]);
    expect(copy.followupBody).not.toMatch(/[–—]/);
  });
});

describe("follow-up mail is shorter and calmer", () => {
  const oldParagraph = {
    de: "Wichtig für die Zukunft des Projekts",
    en: "Your feedback helps shape the future",
    tr: "Geri bildiriminiz bu projenin geleceğini",
  } as const;
  const preview = {
    de: "Und eine Bitte von mir, falls dir der Brief geholfen hat.",
    en: "And one request from me, in case the letter helped you.",
    tr: "Mektup işinize yaradıysa, sizden bir ricam var.",
  } as const;

  it.each(["de", "en", "tr"] as const)("drops the feedback paragraph for %s", (locale) => {
    const followup = buildFollowupHtml({ token: "signed-token", locale });

    expect(followup.html).not.toContain(oldParagraph[locale]);
    expect(followup.text).not.toContain(oldParagraph[locale]);
    expect("feedback" in getEmailCopy(locale).followup).toBe(false);
  });

  it("shows the boxed star rating with its question", () => {
    const html = buildFollowupHtml({ token: "signed-token" }).html;
    const start = html.indexOf("followup-rating-column");
    const tag = html.slice(start, html.indexOf(">", start));

    expect(tag).toContain("border:1px solid #E0DCD7");
    expect(html).toContain("Wie findest du");
    for (let n = 1; n <= 5; n++) {
      expect(html).toContain(`/feedback?r=${n}&t=signed-token&s=2`);
    }
  });

  it("puts the Wahlkreisbüro line before the donation box and drops the share box", () => {
    const followup = buildFollowupHtml({
      token: "signed-token",
      recipientKind: "mdb",
      politicianName: "Max Muster",
    });
    const body = escapeHtml(SUPPORT_EMAIL_COPY.de.followupBody);

    expect(followup.html.indexOf("Wahlkreisbüro finden")).toBeLessThan(followup.html.indexOf(body));
    expect(followup.text.indexOf("Wahlkreisbüro finden")).toBeLessThan(
      followup.text.indexOf(SUPPORT_EMAIL_COPY.de.followupBody),
    );
    expect(followup.html).not.toContain("bnb-share-btn");
    expect(followup.html).not.toContain("Gemeinsam noch lauter");
    expect(followup.text).not.toContain("WhatsApp");
  });

  it("mentions supporters in the ignore line", () => {
    expect(getEmailCopy("de").followup.ignore).toBe(
      "Falls du deinen Brief schon bewertet oder Brief-nach-Berlin unterstützt hast, kannst du diese Mail ignorieren.",
    );
  });

  it.each(["de", "en", "tr"] as const)("uses the new preview text for %s", (locale) => {
    const html = buildFollowupHtml({ token: "signed-token", locale }).html;

    expect(html).toContain(preview[locale]);
    if (locale === "de") {
      expect(html.indexOf(preview.de)).toBeLessThan(html.indexOf("<h1"));
    }
  });

  it("keeps the subject unchanged", () => {
    expect(buildFollowupHtml({ token: "signed-token" }).subject).toBe("Wie fandest du deinen Brief?");
  });

  it("uses the short donation body", () => {
    expect(SUPPORT_EMAIL_COPY.de.followupBody).toBe(
      "Ich mache das allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Schon 5 € helfen.",
    );
    for (const locale of ["de", "en", "tr"] as const) {
      expect(SUPPORT_EMAIL_COPY[locale].followupBody).not.toMatch(/\bwir\b/i);
    }
  });
});
