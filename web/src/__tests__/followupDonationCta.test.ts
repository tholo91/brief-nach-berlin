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
  it("renders the donation box with text around Thomas and a single button", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });
    const copy = SUPPORT_EMAIL_COPY.de;

    expect(SUPPORT_CONTENT.ctas.donate.href).toBe(DONATION_PROVIDER_URL);
    expect(followup.html).not.toContain("spenden-banner-thomas.jpg");
    expect(followup.html).not.toContain("email-followup-envelope.png");

    expect(followup.html).toContain(`src="${APP_URL}${SUPPORT_CONTENT.founder.cutoutPath}"`);
    expect(followup.html).not.toContain(SUPPORT_CONTENT.founder.avatarPath);
    expect(followup.html).toContain('class="bnb-support-corner"');
    expect(followup.html).toMatch(/<img class="bnb-support-photo"[^>]*align="right"[^>]*float:right/);
    expect(followup.html.indexOf('class="bnb-support-photo"')).toBeLessThan(
      followup.html.indexOf(escapeHtml(copy.followupBody)),
    );
    expect(followup.html).not.toContain('<td class="bnb-support');
    expect(followup.html).toContain("icon-heart-white.png");
    expect(followup.html).not.toContain(escapeHtml(copy.infoButton));
    expect(followup.html).not.toContain("/spenden?src=email");
    expect(followup.html).toContain('>Gemeinnützig<br class="bnb-support-note-break"> über WE AID</span>');
    expect(followup.html).not.toContain(copy.status);

    expect(countOccurrences(followup.html, DONATION_PROVIDER_URL)).toBe(1);
    expect(countOccurrences(followup.text, DONATION_PROVIDER_URL)).toBe(1);
    expect(followup.text).toContain(`${copy.compactButton}: ${DONATION_PROVIDER_URL}`);
    expect(followup.html).toContain("Schon 5 € helfen");
    expect(followup.text).toContain("Schon 5 € helfen");
  });

  it("uses the baseUrl override for the photo", () => {
    const html = buildFollowupHtml({ token: "preview", baseUrl: "http://localhost:3011" }).html;

    expect(html).toContain(`src="http://localhost:3011${SUPPORT_CONTENT.founder.cutoutPath}"`);
  });

  it("places the stars first, then the donation box, then the sign-off", () => {
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
    const tThanks = text.indexOf(getEmailCopy("de").followup.thanks);
    expect(tStar).toBeGreaterThan(-1);
    expect(tStar).toBeLessThan(tBody);
    expect(tBody).toBeLessThan(tThanks);
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

  it("shows the compact boxed star row with its question", () => {
    const html = buildFollowupHtml({ token: "signed-token" }).html;
    const start = html.indexOf("followup-rating-column");
    const tag = html.slice(start, html.indexOf(">", start));

    expect(tag).toContain("border:1px solid #E0DCD7");
    expect(tag).toContain("padding:8px 16px");
    expect(html).toContain("Wie findest du deinen Brief?");
    for (let n = 1; n <= 5; n++) {
      expect(html).toContain(`/feedback?r=${n}&t=signed-token&s=2`);
    }
  });

  it("keeps question and stars on one height, with the hint only on narrow screens", () => {
    const html = buildFollowupHtml({ token: "signed-token" }).html;
    const cells = html.match(/<td class="bnb-rating-cell"[^>]*>/g) ?? [];

    expect(cells).toHaveLength(2);
    for (const cell of cells) expect(cell).toContain("vertical-align:middle");
    expect(cells[0]).toContain("padding:0 24px 0 0");
    expect(html).toContain('class="bnb-rating-hint" style="display:none;');
    expect(html).toContain(getEmailCopy("de").feedbackHint);
    expect(html).toMatch(/max-width: 480px\)[\s\S]*\.bnb-rating-cell \{ display: block !important;/);
    expect(html).toMatch(/max-width: 480px\)[\s\S]*\.bnb-rating-hint \{ display: block !important; \}/);
  });

  it("gives the donation button a wide fixed size next to the two-line note", () => {
    const html = buildFollowupHtml({ token: "signed-token" }).html;
    const cta = html.slice(html.indexOf('class="bnb-support-cta"'), html.indexOf("icon-heart-white.png"));
    const note = html.slice(html.indexOf('class="bnb-support-note"'), html.indexOf("Gemeinnützig<br"));

    expect(cta).toContain("width:256px;box-sizing:border-box");
    expect(note).toContain("line-height:1.15");
  });

  it("switches to a one-row title, a round photo and a full-width button on small screens", () => {
    const html = buildFollowupHtml({ token: "signed-token" }).html;
    const small = html.slice(html.indexOf("max-width: 600px"), html.indexOf("max-width: 480px"));

    expect(html).toContain('<span class="bnb-mob" style="display:none;">Brief-nach-Berlin unterstützen</span>');
    expect(small).toMatch(/\.bnb-support-photo \{[^}]*border-radius: 50% !important;/);
    expect(small).toContain(".bnb-support-actions { clear: both !important;");
    expect(small).toContain(".bnb-support-cta { display: block !important; width: auto !important; }");
    expect(small).toContain(".bnb-support-note-break { display: none !important; }");
  });

  it("drops the share box, the ignore line and the old Wahlkreisbüro sentence", () => {
    const followup = buildFollowupHtml({
      token: "signed-token",
      recipientKind: "mdb",
      politicianName: "Max Muster",
    });

    expect(followup.html).not.toContain("bnb-share-btn");
    expect(followup.html).not.toContain("Gemeinsam noch lauter");
    expect(followup.text).not.toContain("WhatsApp");
    expect(followup.html).not.toContain("diese Mail ignorieren");
    expect(followup.html).not.toContain("Wahlkreisbüro finden");
    expect("ignore" in getEmailCopy("de").followup).toBe(false);
  });

  it("uses the new opening and ends with the Bremen greeting", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });

    expect(getEmailCopy("de").followup.created).toBe(
      "Vor ein paar Tagen hast du deinen Brief-nach-Berlin geschrieben und das freut mich sehr. Ich hoffe, du hast ihn mit deiner Handschrift bereits eingeworfen?",
    );
    expect(followup.html).toContain("Tausend Dank dir und beste Grüße aus Bremen ✌️");
    expect(followup.text).toContain("Tausend Dank dir und beste Grüße aus Bremen ✌️");
  });

  it("keeps the footer as short as the letter mail", () => {
    const followup = buildFollowupHtml({ token: "signed-token" });

    expect(followup.html).not.toContain("/was-noch-kommt");
    expect(followup.html).not.toContain("/wer-darf-mdb-schreiben");
    expect(followup.text).not.toContain("/was-noch-kommt");
    expect(followup.html).toContain(`>Datenschutz</a>: ${getEmailCopy("de").followup.oneOff}`);
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

  it("uses the donation body Thomas approved", () => {
    expect(SUPPORT_EMAIL_COPY.de.followupBody).toBe(
      "Ich betreibe Brief-nach-Berlin allein in meiner Freizeit und zahle KI und Server bisher selbst. Schon 5 € helfen.",
    );
    for (const locale of ["de", "en", "tr"] as const) {
      expect(SUPPORT_EMAIL_COPY[locale].followupBody).not.toMatch(/\bwir\b/i);
    }
  });
});
