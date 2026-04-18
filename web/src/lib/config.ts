// Central app configuration — change once, updates everywhere

export const APP_NAME = "Brief nach Berlin" as const;
export const APP_URL = "https://brief-nach-berlin.de" as const;
export const APP_TAGLINE = "Deine Stimme zählt." as const;

// Email
export const EMAIL_SUBJECT = "Dein Brief nach Berlin ist fertig" as const;
export const EMAIL_SENDER_NAME = APP_NAME;

// Letter generation targets
export const LETTER_LENGTHS = {
  "1": { min: 200, max: 300, label: "1 Seite" },
  "1.5": { min: 400, max: 550, label: "1,5 Seiten" },
  "2": { min: 600, max: 800, label: "2 Seiten" },
} as const;

export type LetterLength = keyof typeof LETTER_LENGTHS;
export const DEFAULT_LETTER_LENGTH: LetterLength = "1.5";

// Sharing — used in email template and success page
export const SHARE_TEXT = `Ich habe gerade einen Brief an meinen Abgeordneten geschrieben — in unter 3 Minuten. Probier es selbst: ${APP_URL}` as const;
export const SHARE_URL_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}` as const;
export const SHARE_URL_TWITTER = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}` as const;

// Wizard
export const WIZARD_PATH = "/app" as const;
export const WIZARD_TEXT_PARAM_MAX_LENGTH = 1500; // chars before truncation in ?text= URL param
