import type { Locale } from "./locale";

/**
 * Youth and school strings of the letter wizard (class link step 1, step labels,
 * youth part of the success page, draft editor, PDF button). The letter itself and
 * server messages stay German. Values with `{braces}` are templates; keep the token
 * unchanged in every locale.
 */
export interface YouthCopy {
  steps: { tone: string; postalCode: string };
  classLink: {
    heading: string;
    intro: string;
    /** Locked postal-code line with the code as `{plz}`. */
    postalCodeLine: string;
  };
  success: {
    headline: string;
    pdfSubtitle: string;
    /** Copy-by-email line with the masked address as `{email}`. */
    copySubtitle: string;
    /** Loading line: lead, then the last word that stays on one line with the dots. */
    loadingLead: string;
    loadingLast: string;
    waitLong: string;
    waitShort: string;
    /** School recipient line with the recipient name as `{name}`. */
    recipientLead: string;
    whyHeading: string;
  };
  draft: {
    heading: string;
    intro: string;
    mailNote: string;
    versionsLabel: string;
    tabFirst: string;
    tabImproved: string;
    textareaLabel: string;
    copyButton: string;
    copied: string;
    editHint: string;
    tipsHeading: string;
    tips: readonly [string, string, string];
    improveHeading: string;
    improveIntro: string;
    improveLabel: string;
    improvePlaceholder: string;
    improveIdle: string;
    improveLoading: string;
    chips: readonly [string, string, string, string];
    tooShort: string;
    fallbackError: string;
    envelopeHeading: string;
  };
  pdf: {
    save: string;
    preparing: string;
    failed: string;
    retry: string;
    saveHint: string;
  };
}

const de: YouthCopy = {
  steps: { tone: "Ton", postalCode: "PLZ" },
  classLink: {
    heading: "Wohin soll deine Kopie gehen?",
    intro: "Deine Lehrkraft hat die Postleitzahl schon eingetragen. An deine E-Mail-Adresse schicke ich dir den Entwurf und die Anschrift.",
    postalCodeLine: "PLZ {plz} (von deiner Lehrkraft)",
  },
  success: {
    headline: "Dein Brief ist fertig",
    pdfSubtitle: "Dein Entwurf steht unten. Speicher ihn als PDF, bevor du die Seite schließt.",
    copySubtitle: "Dein Entwurf steht unten. Eine Kopie kommt an {email}.",
    loadingLead: "Dein Entwurf erscheint gleich ",
    loadingLast: "hier",
    waitLong: "Viele schreiben gerade, dein Brief kommt gleich. Bitte lass diese Seite offen.",
    waitShort: "Bitte lass diese Seite offen. Lange Briefe können bis zu einer Minute dauern.",
    recipientLead: "Dein Brief geht an {name}",
    whyHeading: "Warum diese Person?",
  },
  draft: {
    heading: "Dein Entwurf",
    intro: "Schreib deinen Brief von Hand, der Entwurf hilft dir dabei. Du kannst ihn hier direkt ändern und ein eigenes Erlebnis ergänzen.",
    mailNote: "Eine Kopie kommt per Mail.",
    versionsLabel: "Fassungen",
    tabFirst: "Erste Fassung",
    tabImproved: "Verbesserte Fassung",
    textareaLabel: "Dein Brief, du kannst ihn bearbeiten",
    copyButton: "Text kopieren",
    copied: "Kopiert",
    editHint: "Tipp ins Blatt, um etwas zu ändern.",
    tipsHeading: "So wirkt dein Brief",
    tips: [
      "Kurz und klar: ein, höchstens zwei Anliegen.",
      "Gut begründet: Warum ist es wichtig, und was soll sich ändern?",
      "Persönlich: Schreib, was das Thema mit dir zu tun hat.",
    ],
    improveHeading: "Brief verbessern lassen",
    improveIntro: "Sag, was anders werden soll und warum. Das geht einmal, danach siehst du beide Fassungen.",
    improveLabel: "Was soll anders werden und warum?",
    improvePlaceholder: "Zum Beispiel: Der Brief klingt zu erwachsen. Er soll einfacher und mehr nach mir klingen.",
    improveIdle: "Brief verbessern",
    improveLoading: "Brief wird verbessert...",
    chips: ["Kürzer", "Einfachere Wörter", "Klingt mehr nach mir", "Höflicher"],
    tooShort: "Schreib kurz, was anders werden soll.",
    fallbackError: "Das hat nicht geklappt. Versuch es gleich noch einmal.",
    envelopeHeading: "Für den Umschlag",
  },
  pdf: {
    save: "PDF speichern",
    preparing: "PDF wird vorbereitet...",
    failed: "Das PDF ließ sich nicht erstellen. Dein Entwurf steht weiter oben, du kannst deinen Brief auch direkt danach schreiben.",
    retry: "Noch einmal versuchen",
    saveHint: "Speicher das PDF, bevor du die Seite schließt. Auf dem iPad: Teilen, dann „In Dateien sichern“.",
  },
};

const en: YouthCopy = {
  steps: { tone: "Tone", postalCode: "Postal code" },
  classLink: {
    heading: "Where should your copy go?",
    intro: "Your teacher has already entered the postal code. I send the draft and the address to your email address.",
    postalCodeLine: "Postal code {plz} (from your teacher)",
  },
  success: {
    headline: "Your letter is ready",
    pdfSubtitle: "Your draft is below. Save it as a PDF before you close the page.",
    copySubtitle: "Your draft is below. A copy is on its way to {email}.",
    loadingLead: "Your draft will show up ",
    loadingLast: "here",
    waitLong: "Many people are writing right now, your letter will be ready soon. Please keep this page open.",
    waitShort: "Please keep this page open. Long letters can take up to a minute.",
    recipientLead: "Your letter goes to {name}",
    whyHeading: "Why this person?",
  },
  draft: {
    heading: "Your draft",
    intro: "Write your letter by hand, the draft helps you with it. You can edit it right here and add an experience of your own.",
    mailNote: "A copy comes by email.",
    versionsLabel: "Versions",
    tabFirst: "First version",
    tabImproved: "Improved version",
    textareaLabel: "Your letter, you can edit it",
    copyButton: "Copy text",
    copied: "Copied",
    editHint: "Tap the page to change something.",
    tipsHeading: "What makes your letter work",
    tips: [
      "Short and clear: one concern, two at most.",
      "Well reasoned: why does it matter, and what should change?",
      "Personal: write what the topic has to do with you.",
    ],
    improveHeading: "Have the letter improved",
    improveIntro: "Say what should be different and why. You can do this once, then you see both versions.",
    improveLabel: "What should be different, and why?",
    improvePlaceholder: "For example: The letter sounds too grown-up. It should be simpler and sound more like me.",
    improveIdle: "Improve letter",
    improveLoading: "Improving the letter...",
    chips: ["Shorter", "Simpler words", "Sounds more like me", "More polite"],
    tooShort: "Write briefly what should be different.",
    fallbackError: "That did not work. Please try again in a moment.",
    envelopeHeading: "For the envelope",
  },
  pdf: {
    save: "Save PDF",
    preparing: "Preparing the PDF...",
    failed: "The PDF could not be created. Your draft is further up, so you can also write your letter from it.",
    retry: "Try again",
    saveHint: "Save the PDF before you close the page. On an iPad: Share, then “Save to Files”.",
  },
};

const tr: YouthCopy = {
  steps: { tone: "Ton", postalCode: "Posta kodu" },
  classLink: {
    heading: "Kopyanız nereye gitsin?",
    intro: "Posta kodunu öğretmeniniz zaten girdi. Taslağı ve adresi e-posta adresinize gönderirim.",
    postalCodeLine: "Posta kodu {plz} (öğretmeninizden)",
  },
  success: {
    headline: "Mektubunuz hazır",
    pdfSubtitle: "Taslağınız aşağıda. Sayfayı kapatmadan önce PDF olarak kaydedin.",
    copySubtitle: "Taslağınız aşağıda. Bir kopyası {email} adresine gelir.",
    loadingLead: "Taslağınız birazdan ",
    loadingLast: "burada",
    waitLong: "Şu anda çok kişi yazıyor, mektubunuz birazdan hazır olur. Lütfen bu sayfayı açık tutun.",
    waitShort: "Lütfen bu sayfayı açık tutun. Uzun mektuplar bir dakikaya kadar sürebilir.",
    recipientLead: "Mektubunuz şu kişiye gider: {name}",
    whyHeading: "Neden bu kişi?",
  },
  draft: {
    heading: "Taslağınız",
    intro: "Mektubunuzu elle yazın, taslak bu konuda size yardımcı olur. Taslağı burada doğrudan değiştirebilir ve kendi deneyiminizi ekleyebilirsiniz.",
    mailNote: "Bir kopyası e-postayla gelir.",
    versionsLabel: "Sürümler",
    tabFirst: "İlk sürüm",
    tabImproved: "Geliştirilmiş sürüm",
    textareaLabel: "Mektubunuz, düzenleyebilirsiniz",
    copyButton: "Metni kopyala",
    copied: "Kopyalandı",
    editHint: "Bir şeyi değiştirmek için sayfaya dokunun.",
    tipsHeading: "Mektubunuzu etkili yapan şeyler",
    tips: [
      "Kısa ve net: bir talep, en fazla iki.",
      "İyi gerekçelendirilmiş: neden önemli ve ne değişmeli?",
      "Kişisel: konunun sizinle ne ilgisi olduğunu yazın.",
    ],
    improveHeading: "Mektubu geliştirtin",
    improveIntro: "Neyin farklı olması gerektiğini ve nedenini yazın. Bu bir kez yapılabilir, sonra iki sürümü de görürsünüz.",
    improveLabel: "Ne farklı olmalı ve neden?",
    improvePlaceholder: "Örneğin: Mektup fazla yetişkin gibi. Daha basit olmalı ve bana daha çok benzemeli.",
    improveIdle: "Mektubu geliştir",
    improveLoading: "Mektup geliştiriliyor...",
    chips: ["Daha kısa", "Daha basit sözcükler", "Daha çok bana benzesin", "Daha kibar"],
    tooShort: "Neyin farklı olması gerektiğini kısaca yazın.",
    fallbackError: "Bu olmadı. Lütfen birazdan tekrar deneyin.",
    envelopeHeading: "Zarf için",
  },
  pdf: {
    save: "PDF'yi kaydet",
    preparing: "PDF hazırlanıyor...",
    failed: "PDF oluşturulamadı. Taslağınız yukarıda, mektubunuzu doğrudan ona bakarak da yazabilirsiniz.",
    retry: "Tekrar dene",
    saveHint: "Sayfayı kapatmadan önce PDF'yi kaydedin. iPad'de: Paylaş, sonra “Dosyalara Kaydet”.",
  },
};

export const YOUTH_COPY: Record<Locale, YouthCopy> = { de, en, tr };
