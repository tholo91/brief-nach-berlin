// Central app configuration — change once, updates everywhere

export const APP_NAME = "Brief nach Berlin" as const;
export const APP_URL = "https://www.brief-nach-berlin.de" as const;
export const APP_TAGLINE = "Deine Stimme zählt." as const;

// Email
export const EMAIL_SUBJECT = "Dein Brief nach Berlin ist fertig" as const;
export const EMAIL_SENDER_NAME = APP_NAME;

// Letter generation targets
// Formula: pages × WORDS_PER_PAGE ± TOLERANCE.
// 220 words/page is a realistic mean for handwritten DIN A4.
// Tight tolerance (±20) so the slider effect is actually felt by the LLM.
const WORDS_PER_PAGE = 220 as const;
const TOLERANCE = 20 as const;
const band = (pages: number) => ({
  min: Math.round(pages * WORDS_PER_PAGE - TOLERANCE),
  max: Math.round(pages * WORDS_PER_PAGE + TOLERANCE),
});

export const LETTER_LENGTHS = {
  "1":   { ...band(1),   label: "1 Seite" },     // 200–240
  "1.5": { ...band(1.5), label: "1,5 Seiten" },  // 310–350
  "2":   { ...band(2),   label: "2 Seiten" },    // 420–460
} as const;

export type LetterLength = keyof typeof LETTER_LENGTHS;
export const DEFAULT_LETTER_LENGTH: LetterLength = "1";

// Sharing — used in email template and success page
// Two distinct intents:
//   1. SHARE_TEXT_CAUSE  — invites RECIPIENT to write their own letter (movement)
//   2. SHARE_TEXT_TOOL   — promotes the product itself (e.g. for LinkedIn / X)
export const SHARE_TEXT_CAUSE = `Ich habe heute meinem Abgeordneten im Bundestag geschrieben, weil mich ein lokales Thema beschäftigt. Briefe aus dem eigenen Wahlkreis bekommen besonderes Gewicht: wenn mehrere Stimmen aus derselben Gegend zum gleichen Thema schreiben, wird das Anliegen nachweislich stärker gehört. Magst du auch einen Brief schreiben, mit deinen eigenen Worten? Brief nach Berlin macht es einfach und kostenlos: ${APP_URL}` as const;
export const SHARE_TEXT_TOOL = `Ich habe gerade Brief nach Berlin ausprobiert: ein kostenloses Tool, das aus ein paar Sätzen Frust einen formellen Brief an deinen MdB im Bundestag macht. Idee dahinter: handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen. Probier's aus: ${APP_URL}` as const;

// Backwards-compat alias (some callers may still import SHARE_TEXT)
export const SHARE_TEXT = SHARE_TEXT_CAUSE;

// Cause-recruit URLs
export const SHARE_URL_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT_CAUSE)}` as const;
export const SHARE_URL_TELEGRAM = `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(SHARE_TEXT_CAUSE)}` as const;
export const SHARE_URL_EMAIL = `mailto:?subject=${encodeURIComponent("Schreibst du auch einen Brief nach Berlin?")}&body=${encodeURIComponent(SHARE_TEXT_CAUSE)}` as const;

// Tool-promo URLs (LinkedIn share dialog only takes a URL, not text)
export const SHARE_URL_LINKEDIN = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}` as const;
export const SHARE_URL_TWITTER = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT_TOOL)}` as const;

// Founder credit (footer of email + success page)
export const FOUNDER_NAME = "Thomas Lorenz" as const;
export const FOUNDER_HOMEPAGE = "https://www.thomas-lorenz.eu" as const;
export const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/tholo91/" as const;
export const FOUNDER_FEEDBACK_URL = "https://heyspeak.io/l/WIOENjqJn6z6WKtkWgDEFg" as const;

// Build a public abgeordnetenwatch.de profile URL from a politician's name.
// Format: lowercase, German umlaut transliteration, hyphen-joined.
// Verified 2026-04-26 against e.g. /profile/kirsten-kappert-gonther, /profile/thomas-roewekamp.
export function abgeordnetenwatchProfileUrl(firstName: string, lastName: string): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  return `https://www.abgeordnetenwatch.de/profile/${slug(firstName)}-${slug(lastName)}`;
}

// Wizard
export const WIZARD_PATH = "/app" as const;
export const WIZARD_TEXT_PARAM_MAX_LENGTH = 1500; // chars before truncation in ?text= URL param
