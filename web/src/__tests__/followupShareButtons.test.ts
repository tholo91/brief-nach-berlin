import {
  APP_URL,
  SHARE_URL_EMAIL,
  SHARE_URL_TELEGRAM,
  SHARE_URL_WHATSAPP,
} from "@/lib/config";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";

const CHANNELS = ["WhatsApp", "Telegram", "Instagram", "E-Mail"] as const;

function shareButtons(html: string): string[] {
  return html.match(/<a\b(?=[^>]*\bclass="[^"]*\bbnb-share-btn\b)[^>]*>[\s\S]*?<\/a>/g) ?? [];
}

function expectedLocalizedShareUrls(locale: "de" | "en" | "tr", base: string) {
  if (locale === "de") {
    return [SHARE_URL_WHATSAPP, SHARE_URL_TELEGRAM, `${base}/weitersagen#insta`, SHARE_URL_EMAIL];
  }

  const shareText = locale === "en"
    ? `I just prepared a personal letter to politicians with Brief-nach-Berlin. Would you also like to write a letter in your own words? ${base}`
    : `Brief-nach-Berlin ile siyasete kişisel bir mektup hazırladım. Sen de kendi sözlerinle bir mektup yazmak ister misin? ${base}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(base)}&text=${encodeURIComponent(shareText)}`;
  const emailSubject = locale === "tr"
    ? "Sen de Brief-nach-Berlin ile bir mektup yazar mısın?"
    : "Would you also write a letter with Brief-nach-Berlin?";
  const email = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareText)}`;
  return [whatsapp, telegram, `${base}/weitersagen#insta`, email];
}

describe("follow-up share buttons", () => {
  it.each(["de", "en", "tr"] as const)(
    "renders four ordered, accessible share buttons and matching text links for %s",
    (locale) => {
      const followup = buildFollowupHtml({ token: "signed-token", locale });
      const buttons = shareButtons(followup.html);
      const expectedUrls = expectedLocalizedShareUrls(locale, APP_URL);

      expect(buttons).toHaveLength(4);
      buttons.forEach((button, index) => {
        const channel = CHANNELS[index];
        expect(button).toContain(`class="bnb-share-label">${channel}</span>`);
        expect(button).toMatch(/aria-label="[^"]+"/);
        expect(button.match(/aria-label="([^"]+)"/)?.[1].toLowerCase()).toContain(
          channel === "E-Mail" ? "mail" : channel.toLowerCase(),
        );
        expect(button).toContain(`href="${expectedUrls[index]}"`);
        expect(button).toContain(`src="${APP_URL}/images/icon-${channel === "E-Mail" ? "email" : channel.toLowerCase()}.png"`);
        expect(button).toContain('width="18" height="18"');
      });

      expect(followup.html).toMatch(/@media[^}]*max-width:\s*600px[\s\S]*?\.bnb-share-label\s*\{[^}]*display:\s*none/i);
      expectedUrls.forEach((url) => expect(followup.text).toContain(url));
    },
  );

  it("uses the base URL override for share links and icon assets", () => {
    const base = "https://preview.example.test";
    const followup = buildFollowupHtml({ token: "signed-token", locale: "en", baseUrl: base });
    const buttons = shareButtons(followup.html);
    const expectedUrls = expectedLocalizedShareUrls("en", base);

    expect(buttons).toHaveLength(4);
    buttons.forEach((button, index) => {
      expect(button).toContain(`href="${expectedUrls[index]}"`);
      expect(button).toContain(`src="${base}/images/icon-${CHANNELS[index] === "E-Mail" ? "email" : CHANNELS[index].toLowerCase()}.png"`);
    });
    expectedUrls.forEach((url) => expect(followup.text).toContain(url));
  });
});
