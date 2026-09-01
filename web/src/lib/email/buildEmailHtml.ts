import type { SendLetterEmailParams, LetterDebugPayload } from "./sendLetterEmail";
import {
  APP_URL,
  FOUNDER_HOMEPAGE,
  FOUNDER_FEEDBACK_URL,
  abgeordnetenwatchProfileUrl,
} from "@/lib/config";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";
import { formatPartyShort } from "@/lib/formatParty";
import { buildShareTarget } from "@/lib/share";
import { normalizeLetterClosing } from "./normalizeLetterClosing";
import { getEmailCopy, resolveEmailLocale } from "./mailLocale";

function buildDebugUrl(d: LetterDebugPayload): string {
  // base64url-encode JSON payload so it survives URLs without padding/+/ issues
  const json = JSON.stringify(d);
  const b64 = Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${APP_URL}/debug?d=${b64}`;
}

function buildVariantUrl(recipientEmail: string, debug?: LetterDebugPayload): string {
  const params = new URLSearchParams({ email: recipientEmail });
  if (debug?.toneLevel != null) params.set("originalToneLevel", String(debug.toneLevel));
  return `${APP_URL}/brief/anpassen#${params.toString()}`;
}

// Email-client-safe star rating bar. Used inside the Postadresse box
// (replacing the static abgeordnetenwatch profile button). Each star is
// its own anchor pointing at /feedback with the chosen rating; no JS,
// no hover state (mail clients strip :hover).
//
// Visual: 3 gold-filled + 2 gold-outlined stars. The neutral midpoint
// invites a "besser/schlechter"-Polarität — leaving it as 4/5 made the
// rating look already-decided. The form on /feedback prefills with
// whichever star was clicked and lets the user change it.
export function buildStarBarHtml(token: string, seq?: number, locale?: SendLetterEmailParams["locale"]): string {
  const copy = getEmailCopy(locale);
  const feedbackQuestion = copy.feedbackQuestion.replace(
    "<br>",
    '<span class="bnb-feedback-break" style="display:none;"><br></span><span class="bnb-feedback-space"> </span>',
  );
  const seqParam = seq != null ? `&s=${seq}` : "";
  const url = (n: number) => `${APP_URL}/feedback?r=${n}&t=${token}${seqParam}`;
  // Padding bumped to clear the 44pt iOS HIG tap target on mobile mail.
  const star = (n: number, glyph: "filled" | "outline") => `
    <a href="${url(n)}" target="_blank" rel="noopener noreferrer"
       style="color:#D4A017;mso-color-alt:#D4A017;text-decoration:none;font-size:26px;line-height:1;padding:8px 4px;display:inline-block;">${glyph === "filled" ? "&#9733;" : "&#9734;"}</a>`;
  return `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#2D5016;font-weight:bold;line-height:1.4;">${feedbackQuestion}</p>
    <div style="white-space:nowrap;line-height:1;">${star(1, "filled")}${star(2, "filled")}${star(3, "filled")}${star(4, "outline")}${star(5, "outline")}</div>
    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#b0b0b0;line-height:1.4;">${copy.feedbackHint}</p>`;
}

// Escape HTML entities to prevent HTML injection in email (T-03-02)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Convert newlines to <br> for Outlook compatibility (RESEARCH.md pitfall 2 / assumption A5)
function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function isFirstLetterEmail(data: SendLetterEmailParams): boolean {
  return !data.debug?.resent;
}

function buildFinancingNoticeHtml(locale: ReturnType<typeof resolveEmailLocale>): string {
  const supportCopy = SUPPORT_EMAIL_COPY[locale];
  const donationUrl = SUPPORT_CONTENT.ctas.donate.href;
  const learnMoreUrl = `${APP_URL}${SUPPORT_CONTENT.ctas.learnMore.href}?src=email`;
  return `<div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:18px 20px;">
      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${escapeHtml(supportCopy.heading)}</h2>
      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">${escapeHtml(supportCopy.body)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td class="bnb-support-action bnb-support-action-primary" width="52%" valign="top" style="width:52%;padding-right:5px;">
            <a href="${donationUrl}" target="_blank" rel="noopener noreferrer" style="display:block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:11px 10px;border:2px solid #2D5016;border-radius:4px;line-height:1.4;text-align:center;">${escapeHtml(supportCopy.button)}</a>
          </td>
          <td class="bnb-support-action" width="48%" valign="top" style="width:48%;padding-left:5px;">
            <a href="${learnMoreUrl}" target="_blank" rel="noopener noreferrer" style="display:block;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:11px 10px;border:2px solid #2D5016;border-radius:4px;line-height:1.4;text-align:center;">${escapeHtml(supportCopy.infoButton)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">${escapeHtml(supportCopy.status)}</p>
    </div>`;
}

export function buildLetterEmailText(data: SendLetterEmailParams): string {
  const supportCopy = SUPPORT_EMAIL_COPY[resolveEmailLocale(data.locale)];
  const parts = [
    normalizeLetterClosing(data.letterText),
    `Beste Grüße aus Bremen\n\nThomas\nEine Initiative von ${FOUNDER_HOMEPAGE}`,
  ];
  if (isFirstLetterEmail(data)) {
    parts.push(
      `${supportCopy.prefix} ${supportCopy.status}\n${supportCopy.button}: ${SUPPORT_CONTENT.ctas.donate.href}\n${supportCopy.learnMore}: ${APP_URL}${SUPPORT_CONTENT.ctas.learnMore.href}?src=email`,
    );
  }
  return parts.join("\n\n");
}

function buildCampaignAttributionHtml(
  campaign: SendLetterEmailParams["campaign"],
  locale?: SendLetterEmailParams["locale"],
): string {
  if (!campaign?.slug) return "";

  const copy = getEmailCopy(locale);
  const campaignUrl = `${APP_URL}/kampagne/${encodeURIComponent(campaign.slug)}`;
  const creator = campaign.creatorName?.trim();
  return `
    <div class="bnb-inner-pad" style="margin:0 0 16px;background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:14px 18px;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#4A4A4A;line-height:1.6;">
        ${copy.campaignBy(creator ? escapeHtml(creator) : undefined)}
        <a href="${campaignUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.campaignLink}</a>
      </p>
    </div>`;
}

const LANDTAG_WATERMARKS: Record<string, string> = {
  BW: "/images/email-variants/email-landtag-baden-wuerttemberg.webp",
  BY: "/images/email-variants/email-landtag-bayern.webp",
  BE: "/images/email-variants/email-landtag-berlin.webp",
  BB: "/images/email-variants/email-landtag-brandenburg.webp",
  HB: "/images/email-variants/email-landtag-bremen.webp",
  HH: "/images/email-variants/email-landtag-hamburg.webp",
  HE: "/images/email-variants/email-landtag-hessen.webp",
  MV: "/images/email-variants/email-landtag-mecklenburg-vorpommern.webp",
  NI: "/images/email-variants/email-landtag-niedersachsen.webp",
  NW: "/images/email-variants/email-landtag-nordrhein-westfalen.webp",
  RP: "/images/email-variants/email-landtag-rheinland-pfalz.webp",
  SL: "/images/email-variants/email-landtag-saarland.webp",
  SN: "/images/email-variants/email-landtag-sachsen.webp",
  ST: "/images/email-variants/email-landtag-sachsen-anhalt.webp",
  SH: "/images/email-variants/email-landtag-schleswig-holstein.webp",
  TH: "/images/email-variants/email-landtag-thueringen.webp",
};

function getEmailWatermarkPath(data: SendLetterEmailParams): string {
  if (data.recipientKind === "rathaus") {
    return "/images/email-variants/email-kommune-rathaus.webp";
  }
  if (data.recipientKind === "mdl" || data.recipientKind === "landesregierung") {
    return LANDTAG_WATERMARKS[data.bundeslandKey ?? ""] ?? "/images/email-title-watermark-v2.png";
  }
  return "/images/email-title-watermark-v2.png";
}

function getEmailWatermarkStyle(data: SendLetterEmailParams): string {
  if (data.recipientKind === "mdl" || data.recipientKind === "landesregierung") {
    return "display:inline-block;width:110px;height:110px;margin:2px -2px 8px 14px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;transform:rotate(6deg);transform-origin:center center;";
  }
  if (data.recipientKind === "rathaus") {
    return "display:inline-block;width:110px;height:110px;margin:1px 0 8px 14px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;transform:rotate(-5deg);transform-origin:center center;";
  }
  return "display:inline-block;width:110px;height:110px;margin:0 0 6px 14px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;";
}

function getLandtagDestination(postalAddress: string): string | null {
  const postalCity = postalAddress.split(",").at(-1)?.trim();
  const match = postalCity?.match(/^\d{5}\s+(.+)$/);
  return match?.[1]?.trim() || null;
}

function getGovernmentDestination(postalAddress: string): string | null {
  const postalCity = postalAddress.split(",").at(-1)?.trim();
  const match = postalCity?.match(/^\d{5}\s+(.+)$/);
  return match?.[1]?.trim() || null;
}

function formatGermanDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function formatGovernmentDisplayName(value: string): string {
  return value
    .replace(/Staatskanzlei des Landes Nordrhein-Westfalen/g, "Staatskanzlei NRW")
    .replace(/Staatskanzlei Nordrhein-Westfalen/g, "Staatskanzlei NRW")
    .replace(/Landesregierung Nordrhein-Westfalen/g, "Landesregierung NRW")
    .replace(/Nordrhein-Westfalen/g, "NRW");
}

function getGovernmentAddressLines(data: SendLetterEmailParams): string {
  const parts = data.politicianPostalAddress.split(",").map((part) => part.trim());
  const first = parts[0] ?? "";
  const second = parts[1] ?? "";
  const label = data.politicianName.trim();
  const officeName = data.governmentSource?.officeName.trim();
  const addressParts =
    first === label && second === officeName
      ? parts.slice(2)
      : officeName && first === officeName
        ? parts.slice(1)
        : parts.slice(1);

  return addressParts.map((part) => escapeHtml(part)).join("<br>");
}

export function buildLetterEmailSubject(data: SendLetterEmailParams): string {
  const copy = getEmailCopy(data.locale);
  if (data.recipientKind === "landesregierung") {
    const destination = getGovernmentDestination(data.politicianPostalAddress);
    return destination ? copy.subject.destination(destination) : copy.subject.standard;
  }
  if (data.recipientKind === "mdl") {
    const destination = getLandtagDestination(data.politicianPostalAddress);
    return destination ? copy.subject.destination(destination) : copy.subject.standard;
  }
  if (data.recipientKind === "rathaus") {
    const destination = data.rathausSearch?.ort?.trim();
    return copy.subject.townHall(destination);
  }
  return copy.subject.standard;
}

function getEmailIntro(data: SendLetterEmailParams): string {
  const copy = getEmailCopy(data.locale);
  if (data.recipientKind === "landesregierung") {
    const destination = getGovernmentDestination(data.politicianPostalAddress);
    return destination
      ? copy.intro.destination(destination)
      : copy.intro.state;
  }
  if (data.recipientKind === "mdl") {
    const destination = getLandtagDestination(data.politicianPostalAddress);
    return destination
      ? copy.intro.destination(destination)
      : copy.intro.parliament;
  }
  if (data.recipientKind === "rathaus") {
    const destination = data.rathausSearch?.ort?.trim();
    return destination
      ? copy.intro.townHall(destination)
      : copy.intro.townHall();
  }
  return copy.intro.standard;
}

function getPersonalImpactCopy(data: SendLetterEmailParams): string {
  const copy = getEmailCopy(data.locale);
  if (data.recipientKind === "landesregierung") {
    return copy.impact.state;
  }
  if (data.recipientKind === "mdl") {
    return copy.impact.mdl;
  }
  if (data.recipientKind === "rathaus") {
    return copy.impact.townHall;
  }
  return copy.impact.mdb;
}

function getRecruitCopy(data: SendLetterEmailParams): string {
  const copy = getEmailCopy(data.locale);
  if (data.locale && data.locale !== "de") return copy.recruit;
  if (data.campaign?.slug) {
    if (data.recipientKind === "landesregierung") {
      return "Dein Brief ist ein Anfang. Teile die Kampagne, damit weitere Menschen aus ihrem Bundesland mit eigenen Worten schreiben.";
    }
    if (data.recipientKind === "rathaus") {
      return "Dein Brief ist ein Anfang. Teile die Kampagne, damit weitere Menschen vor Ort mit eigenen Worten schreiben.";
    }
    if (data.recipientKind === "mdl") {
      return "Dein Brief ist ein Anfang. Teile die Kampagne, damit weitere Menschen aus ihrer Region mit eigenen Worten schreiben.";
    }
    return "Dein Brief ist ein Anfang. Teile die Kampagne, damit weitere Menschen aus ihrem Wahlkreis mit eigenen Worten schreiben.";
  }
  if (data.recipientKind === "rathaus") {
    return "Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen vor Ort dazukommen. Teile Brief-nach-Berlin per…";
  }
  if (data.recipientKind === "landesregierung") {
    return "Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deinem Bundesland dazukommen. Teile Brief-nach-Berlin per…";
  }
  if (data.recipientKind === "mdl") {
    return "Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deiner Region dazukommen. Teile Brief-nach-Berlin per…";
  }
  return "Dein Brief wirkt. Und er wirkt noch stärker, wenn weitere Stimmen aus deinem Wahlkreis dazukommen. Teile Brief-nach-Berlin per…";
}

function buildEmailShareTarget(data: SendLetterEmailParams) {
  const locale = resolveEmailLocale(data.locale);
  if (locale !== "de") {
    const url = data.campaign?.slug
      ? `${APP_URL}/kampagne/${encodeURIComponent(data.campaign.slug)}`
      : APP_URL;
    const isTurkish = locale === "tr";
    const subject = isTurkish
      ? "Sen de Brief-nach-Berlin ile bir mektup yazar mısın?"
      : "Would you also write a letter with Brief-nach-Berlin?";
    const text = isTurkish
      ? `Brief-nach-Berlin ile siyasete kişisel bir mektup hazırladım. Sen de kendi sözlerinle bir mektup yazmak ister misin? ${url}`
      : `I just prepared a personal letter to politicians with Brief-nach-Berlin. Would you also like to write a letter in your own words? ${url}`;
    return {
      url,
      text,
      subject,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(text)}`,
      telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      emailUrl: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    };
  }
  const level =
    data.recipientKind === "rathaus"
      ? "Kommune"
      : data.recipientKind === "mdl" || data.recipientKind === "landesregierung"
        ? "Land"
        : "Bund";
  const share = buildShareTarget(
    data.campaign,
    "participant",
    level,
    data.governmentSource?.institutionKind ?? "landesregierung"
  );
  if (data.campaign?.slug || data.recipientKind === "mdb") return share;

  const text =
    data.recipientKind === "landesregierung"
      ? `Ich habe gerade mit Brief-nach-Berlin einen persönlichen Brief an ${data.governmentSource?.institutionKind === "senat" ? "den Senat meines Bundeslands" : "meine Landesregierung"} vorbereitet. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? ${APP_URL}`
      : data.recipientKind === "mdl"
      ? `Ich habe gerade mit Brief-nach-Berlin einen persönlichen Brief an meinen Landtag vorbereitet. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? ${APP_URL}`
      : `Ich habe gerade mit Brief-nach-Berlin einen persönlichen Brief an meine Kommune vorbereitet. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? ${APP_URL}`;

  return {
    ...share,
    text,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(text)}`,
    emailUrl: `mailto:?subject=${encodeURIComponent(share.subject)}&body=${encodeURIComponent(text)}`,
  };
}

function getFooterBannerHtml(data: SendLetterEmailParams): string {
  if (data.recipientKind === "mdl" || data.recipientKind === "landesregierung") return "";
  const path =
    data.recipientKind === "rathaus"
      ? "/images/email-variants/email-rathaus-banner.webp"
      : "/images/email-bundestag-banner.png";
  const height = data.recipientKind === "rathaus" ? 238 : 130;
  return `<div class="bnb-bleed" style="margin:18px -22px -20px;font-size:0;line-height:0;">
                        <img src="${APP_URL}${path}" alt="" width="556" height="${height}" style="display:block;width:100%;max-width:556px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">
                      </div>`;
}

export function buildEmailHtml(data: SendLetterEmailParams): string {
  const locale = resolveEmailLocale(data.locale);
  const copy = getEmailCopy(locale);
  const isRathaus = data.recipientKind === "rathaus";
  const isMdl = data.recipientKind === "mdl";
  const isLandesregierung = data.recipientKind === "landesregierung";
  const isFallback =
    !isRathaus && !isLandesregierung && data.politicianFirstName === "" && data.politicianLastName === "MdB";
  const letterNumberText =
    typeof data.letterNumber === "number" ? ` · Brief # ${data.letterNumber}` : "";

  const fullName = data.politicianTitle
    ? `${escapeHtml(data.politicianTitle)} ${escapeHtml(data.politicianName)}`
    : escapeHtml(data.politicianName);
  const party = data.politicianParty ? escapeHtml(formatPartyShort(data.politicianParty)) : "";
  const mandateLabel = isMdl ? "MdL" : "MdB";

  // Format postal address: split on comma, one part per line. Kommunale
  // Anschriften kommen strukturiert aus dem amtlichen Snapshot.
  const addressLines = data.politicianPostalAddress
    .split(",")
    .map((part) => escapeHtml(part.trim()))
    .join("<br>");
  const officialRathausAddress =
    isRathaus && data.rathausSearch?.address.source === "destatis"
      ? data.rathausSearch.address
      : null;
  const visibleAddressLines = officialRathausAddress
    ? `${escapeHtml(officialRathausAddress.streetAddress)}<br>${escapeHtml(officialRathausAddress.postalCode)} ${escapeHtml(officialRathausAddress.city)}`
    : isLandesregierung && data.governmentSource
      ? getGovernmentAddressLines(data)
    : isRathaus
      ? ""
      : addressLines;

  // Profile link (Abgeordnetenwatch: voting record, public Q&A, transparent source).
  // Prefer the API-provided URL; fall back to a slug-derived URL.
  // Rathaus-Empfänger haben kein Abgeordnetenwatch-Profil — kein Link.
  const profileUrl = isRathaus || isLandesregierung
    ? null
    : data.politicianAbgeordnetenwatchUrl ??
      abgeordnetenwatchProfileUrl(data.politicianFirstName, data.politicianLastName);

  const fallbackUrl = `${APP_URL}/kein-mdb-im-wahlkreis`;

  const addressNameLine = isRathaus
    ? `<strong>${fullName}</strong><br>`
    : isLandesregierung && data.governmentSource
      ? `<strong>${escapeHtml(formatGovernmentDisplayName(data.governmentSource.officeName))}</strong><br>`
    : isLandesregierung
      ? `<strong>${escapeHtml(formatGovernmentDisplayName(data.politicianName))}</strong><br>`
    : isFallback
      ? `<strong><a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.noRepresentative}</a></strong><br>`
      : `<strong><a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${fullName}, ${mandateLabel}${party ? ` (${party})` : ""}</a></strong><br>`;

  // Institutionszeile: für MdB heutiges Layout (postalAddress trägt nur die
  // Straße, die Institution steht hier). MdL/Rathaus tragen die Institution
  // bereits in der postalAddress — keine Extra-Zeile.
  const institutionLine = data.recipientKind === "mdb" ? "Deutscher Bundestag<br>" : "";

  // Google dient bei einem amtlichen Treffer nur zur Kontrolle. Ohne
  // eindeutige Destatis-Zuordnung ist die Suche der ehrliche Fallback.
  const rathausSearchUrl = data.rathausSearch
    ? `https://www.google.com/search?q=${encodeURIComponent(
        `${data.rathausSearch.kind === "bezirksamt" ? "Bezirksamt" : "Bürgermeisteramt"}${data.rathausSearch.ort.trim() ? ` ${data.rathausSearch.ort.trim()}` : ""} Postanschrift`
      )}`
    : null;
  const rathausSearchLine =
    isRathaus && rathausSearchUrl
      ? officialRathausAddress
        ? `<p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#666666;line-height:1.5;">${copy.source} <a href="${escapeHtml(officialRathausAddress.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Destatis</a>, ${copy.checked} ${escapeHtml(officialRathausAddress.sourceStand)}. ${copy.verifyGoogle} <a href="${rathausSearchUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.verifyHere}</a> ${copy.verifyEnd}</p>`
        : `<p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#666666;line-height:1.5;">${copy.noAddress} <a href="${rathausSearchUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.verifyHere}</a>.</p>`
      : "";
  const governmentSourceLine =
    isLandesregierung && data.governmentSource
      ? `<p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#666666;line-height:1.5;">${copy.source} <a href="${escapeHtml(data.governmentSource.url)}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${escapeHtml(formatGovernmentDisplayName(data.governmentSource.title))}</a>, ${copy.checked} ${escapeHtml(formatGermanDate(data.governmentSource.stand))}.</p>`
      : "";

  const profileButtonText = isFallback ? copy.findRecipient : copy.profile;
  const profileButtonUrl = isFallback ? fallbackUrl : profileUrl;
  const profileButtonHtml = profileButtonUrl
    ? `<a href="${profileButtonUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#2D5016;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 14px;border-radius:4px;line-height:1.5;text-align:center;">${profileButtonText}</a>`
    : "";

  const disclaimerSiteName = isFallback ? "bundestag.de" : "abgeordnetenwatch.de";

  const share = buildEmailShareTarget(data);
  const instagramUrl = `${APP_URL}/weitersagen#insta`;
  const variantUrl = locale === "de" ? buildVariantUrl(data.recipientEmail, data.debug) : null;
  const emailIntro = escapeHtml(getEmailIntro(data));
  const personalImpactCopy = getPersonalImpactCopy(data);
  const recruitCopy = getRecruitCopy(data);
  const footerGuideLink =
    data.recipientKind === "mdb"
      ? `<a href="${APP_URL}/wer-darf-mdb-schreiben" style="color:#888888;">${copy.guideMdb}</a>`
      : `<a href="${APP_URL}/guide" style="color:#888888;">${copy.guide}</a>`;

  // Letter text: escape then convert newlines to <br> for email clients
  const letterHtml = nlToBr(normalizeLetterClosing(data.letterText));

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style>td { font-family: 'Courier New', Courier, monospace !important; }</style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .bnb-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .bnb-inner-pad { padding-left: 14px !important; padding-right: 14px !important; }
      .bnb-stack { display: block !important; width: 100% !important; }
      .bnb-stack-left { padding: 0 0 14px 0 !important; width: 100% !important; }
      .bnb-stack-right { padding: 14px 0 0 0 !important; border-left: 0 !important; border-top: 1px solid #E0DCD7 !important; width: 100% !important; text-align: center !important; }
      .bnb-bleed { margin-left: -14px !important; margin-right: -14px !important; }
      .bnb-support-action { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .bnb-support-action-primary { padding-bottom: 8px !important; }
      .bnb-feedback-break { display: inline !important; }
      .bnb-feedback-space { display: none !important; }
      /* Share row: on mobile only the square icon-buttons remain (labels hidden). */
      .bnb-share-label { display: none !important; }
      .bnb-share-btn { padding: 14px 0 !important; }
      .bnb-share-icon { width: 24px !important; height: 24px !important; margin: 0 !important; }
      /* Mobile-only text swaps: kürzere Varianten auf kleinen Screens. */
      .bnb-desk { display: none !important; }
      .bnb-mob { display: inline !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:Georgia,'Times New Roman',serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-collapse:collapse;">

                <!-- Airmail stripe header (D-06): thin diagonal red/white/blue like landing page -->
                <tr>
                  <td colspan="7" style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
                </tr>

                <!-- Title: "Brief-nach-Berlin". Watermark wandert in den Brief-Kasten als Briefmarke. -->
                <tr>
                  <td colspan="7" class="bnb-pad" bgcolor="#ffffff" style="padding:28px 32px 28px;text-align:center;background-color:#ffffff;">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#2D5016;font-weight:bold;letter-spacing:0.5px;">Brief-nach-Berlin</h1>
                    <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#666666;">${emailIntro}</p>
                  </td>
                </tr>

                <!-- Intro: warm founder voice -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 20px;background-color:#ffffff;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">${copy.review}${locale === "de" ? ` <a href="${APP_URL}/brief-verbessern" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.improve}</a>,` : ""} ${copy.reviewEnd}<span class="bnb-desk"><br>${copy.reviewRating}</span><span class="bnb-mob" style="display:none;"><br>${copy.reviewMobile}</span></p>
                  </td>
                </tr>

                <!-- Brief block (D-08, section 1) — Briefmarke oben rechts, Text fließt drumherum.
                     align="right" floatet das Bild zuverlässig in allen Mail-Clients; Opacity ist
                     in die PNG eingebrannt (~80%), weil CSS opacity in Outlook nicht greift. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 8px;background-color:#ffffff;">
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:24px;">
                      <img src="${APP_URL}${getEmailWatermarkPath(data)}" width="110" height="110" alt="" align="right" style="${getEmailWatermarkStyle(data)}">
                      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#4A4A4A;white-space:pre-wrap;">${letterHtml}</p>
                    </div>
                  </td>
                </tr>

                ${variantUrl ? `<!-- Brief anpassen CTA: only for German, because the target flow is German-only. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 8px;background-color:#ffffff;text-align:center;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;text-align:center;">Nicht ganz dein Ton? Hier deinen &rarr; <a href="${variantUrl}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">Briefentwurf schnell anpassen</a></p>
                  </td>
                </tr>` : ""}

                <!-- Postadresse (D-08, section 2): name links to abgeordnetenwatch,
                     right column hosts the star-rating widget instead of a static profile button. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:16px 32px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${copy.address}</h2>
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:4px;padding:16px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="bnb-stack bnb-stack-left" style="vertical-align:top;padding-right:16px;width:60%;">
                            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.8;color:#4A4A4A;">
                              ${addressNameLine}
                              ${institutionLine}${visibleAddressLines}
                            </p>${rathausSearchLine}${governmentSourceLine}
                          </td>
                          <td class="bnb-stack bnb-stack-right" style="vertical-align:middle;text-align:center;padding-left:16px;border-left:1px solid #E0DCD7;width:40%;">
                            ${data.feedbackToken ? buildStarBarHtml(data.feedbackToken, undefined, locale) : profileButtonHtml}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Naechste Schritte (D-08, section 3) -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 8px;background-color:#ffffff;">
                    <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${copy.nextSteps}</h2>

                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">1</span>
                          <span class="bnb-desk">${copy.steps[0]}</span><span class="bnb-mob" style="display:none;">${copy.steps[0]}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">2</span>
                          <span class="bnb-desk">${copy.steps[1]}</span><span class="bnb-mob" style="display:none;">${copy.steps[1]}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.5;">
                          <span style="display:inline-block;width:24px;height:24px;background-color:#2D5016;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;margin-right:10px;vertical-align:middle;">3</span>
                          <span class="bnb-desk"><a href="https://www.deutschepost.de/de/m/mobile-briefmarke.html" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.steps[2]}</a> ${copy.stampTail}</span><span class="bnb-mob" style="display:none;"><a href="https://www.deutschepost.de/de/m/mobile-briefmarke.html" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.steps[2]}</a></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>


                <!-- Personal sign-off from Thomas (handwritten Caveat) -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 16px;background-color:#ffffff;text-align:left;">
                    <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      ${personalImpactCopy} &rarr; <a href="${APP_URL}/tipps" style="color:#2D5016;text-decoration:underline;">${copy.tips}</a>
                    </p>
                    <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                      ${copy.engagement} <a href="${FOUNDER_FEEDBACK_URL}" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.questions}</a>. ${copy.greeting}
                    </p>
                    <p style="margin:0;font-family:'Caveat','Brush Script MT','Lucida Handwriting',cursive;font-size:32px;color:#1D3557;line-height:1.1;">
                      Thomas
                    </p>
                    <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#bcbcbc;line-height:1.5;">
                      ${copy.initiative} <a href="${FOUNDER_HOMEPAGE}" target="_blank" rel="noopener noreferrer" style="color:#bcbcbc;text-decoration:underline;">www.thomas-lorenz.eu</a>
                    </p>
                  </td>
                </tr>

                ${isFirstLetterEmail(data) ? `
                <!-- Donation CTA: first letter email only, before sharing. -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 16px;background-color:#ffffff;text-align:left;">
                    ${buildFinancingNoticeHtml(locale)}
                  </td>
                </tr>` : ""}

                ${data.campaign?.slug ? `
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:0 32px 8px;background-color:#ffffff;">
                    ${buildCampaignAttributionHtml(data.campaign, locale)}
                  </td>
                </tr>` : ""}

                <!-- Cause-recruit block: motivate sender to invite Wahlkreis-people to write their own letters -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 24px;background-color:#ffffff;">
                    <div class="bnb-inner-pad" style="background-color:#FAF8F5;border:1px solid #E0DCD7;border-radius:6px;padding:20px 22px;">
                      <h2 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#2D5016;font-weight:bold;">${data.campaign?.slug ? copy.campaignShareHeading : copy.shareHeading}</h2>
                      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;">
                        ${recruitCopy}
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding-right:4px;width:25%;" valign="top">
                            <a href="${share.whatsappUrl}" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-whatsapp.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">WhatsApp</span></a>
                          </td>
                          <td style="padding:0 2px;width:25%;" valign="top">
                            <a href="${share.telegramUrl}" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-telegram.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">Telegram</span></a>
                          </td>
                          <td style="padding:0 2px;width:25%;" valign="top">
                            <a href="${instagramUrl}" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-instagram.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">Instagram</span></a>
                          </td>
                          <td style="padding-left:4px;width:25%;" valign="top">
                            <a href="${share.emailUrl}" class="bnb-share-btn" style="display:block;text-align:center;background-color:#ffffff;color:#2D5016;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;text-decoration:none;padding:10px 4px;border-radius:6px;border:2px solid #2D5016;line-height:1;white-space:nowrap;"><img src="${APP_URL}/images/icon-email.png" alt="" width="18" height="18" class="bnb-share-icon" style="width:18px;height:18px;vertical-align:middle;border:0;margin-right:6px;"><span class="bnb-share-label">E-Mail</span></a>
                          </td>
                        </tr>
                      </table>
                      <!-- Secondary links: weiterführende Seiten, normale Schriftgröße, eine Zeile -->
                      <p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4A4A4A;line-height:1.6;text-align:center;">
                        <a href="${APP_URL}/aktiv-werden" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.otherAction}</a>
                        &nbsp;·&nbsp;
                        <a href="${APP_URL}/andere-tools" target="_blank" rel="noopener noreferrer" style="color:#2D5016;text-decoration:underline;">${copy.otherTools}</a>
                      </p>
                      ${getFooterBannerHtml(data)}
                    </div>
                  </td>
                </tr>

                <!-- Airmail stripe before footer (mirrors header) -->
                <tr>
                  <td colspan="7" style="height:4px;font-size:0;line-height:0;background:repeating-linear-gradient(-45deg,#C1121F,#C1121F 8px,#FAF8F5 8px,#FAF8F5 12px,#1D3557 12px,#1D3557 20px,#FAF8F5 20px,#FAF8F5 24px);">&nbsp;</td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:24px 32px 16px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#999999;">
                      <a href="${APP_URL}" style="color:#2D5016;text-decoration:none;">Brief-nach-Berlin</a>${letterNumberText} · ${copy.voiceCounts}
                    </p>
                  </td>
                </tr>

                <!-- Legal / disclaimer block (smaller, below footer) -->
                <tr>
                  <td colspan="7" class="bnb-pad" style="padding:8px 32px 24px;background-color:#FAF8F5;text-align:center;">
                    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                      <strong>${copy.notice}</strong> ${copy.noticeText}${profileUrl ? ` <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="color:#888888;">${disclaimerSiteName}</a>` : ""}. ${copy.responsibility}
                    </p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#aaaaaa;line-height:1.5;">
                      <a href="${APP_URL}/datenschutz" style="color:#888888;">${copy.privacy}</a>: ${copy.dataPolicy} · ${footerGuideLink}${data.debug ? ` · <a href="${buildDebugUrl(data.debug)}" style="color:#888888;text-decoration:none;">Debug</a>` : ""}
                    </p>
                  </td>
                </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
