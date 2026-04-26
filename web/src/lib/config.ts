// Central app configuration — change once, updates everywhere

export const APP_NAME = "Brief nach Berlin" as const;
export const APP_URL = "https://brief-nach-berlin.de" as const;
export const APP_TAGLINE = "Deine Stimme zählt." as const;

// Email
export const EMAIL_SUBJECT = "Dein Brief nach Berlin ist fertig" as const;
export const EMAIL_SENDER_NAME = APP_NAME;

// Letter generation targets
// Bands calibrated for handwritten DIN A4 (~180-220 words per page with normal handwriting)
export const LETTER_LENGTHS = {
  "1": { min: 180, max: 240, label: "1 Seite" },
  "1.5": { min: 280, max: 360, label: "1,5 Seiten" },
  "2": { min: 380, max: 480, label: "2 Seiten" },
} as const;

export type LetterLength = keyof typeof LETTER_LENGTHS;
export const DEFAULT_LETTER_LENGTH: LetterLength = "1";

// Sharing — used in email template and success page
export const SHARE_TEXT = `Hey, ich hab eben meinem Abgeordneten in Berlin geschrieben und fand's hiermit total einfach. Wenn du dir auch mal Luft verschaffen willst, kann ich Brief nach Berlin nur empfehlen, ist komplett kostenlos: ${APP_URL}` as const;
export const SHARE_URL_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}` as const;
export const SHARE_URL_TWITTER = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}` as const;

// Wizard
export const WIZARD_PATH = "/app" as const;
export const WIZARD_TEXT_PARAM_MAX_LENGTH = 1500; // chars before truncation in ?text= URL param
