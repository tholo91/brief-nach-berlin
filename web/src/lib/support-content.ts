import {
  DONATION_PATH,
  DONATION_PROVIDER_URL,
  FOUNDER_NAME,
} from "@/lib/config";

export const SUPPORT_CONTENT = {
  headline: "Brief-nach-Berlin unterstützen",
  status:
    "Brief-nach-Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH.",
  intro:
    "Brief-nach-Berlin soll für alle kostenlos und unabhängig bleiben. Deine Spende hält das Projekt am Laufen.",
  costIntro:
    "Die laufenden Kosten trage ich selbst. Deine Spende hält Brief-nach-Berlin stabil, unabhängig und kostenlos.",
  costNote:
    "Die Kosten schwanken mit der Nutzung. Deshalb nenne ich bewusst die wichtigsten Kostenarten statt einer Scheingenauigkeit.",
  fiscalHost: {
    name: "WE AID gGmbH",
    text:
      "WE AID nimmt Spenden zweckgebunden entgegen und stellt auf Wunsch Spendenbescheinigungen aus.",
  },
  founder: {
    name: FOUNDER_NAME,
    portraitPath: "/images/thomas-portrait.webp",
    avatarPath: "/images/thomas-avatar.jpg",
    text:
      "Ich bin Thomas Lorenz und baue Brief-nach-Berlin seit Mai 2026 ehrenamtlich auf. Damit Menschen ihre Anliegen einfach und kostenlos an die zuständigen Abgeordneten richten können.",
    successText:
      "Seit Mai 2026 baue ich Brief-nach-Berlin ehrenamtlich und halte den Zugang bewusst kostenlos.",
  },
  costCategories: [
    {
      title: "Laufender Betrieb",
      description:
        "Mistral für KI-Aufrufe, Brevo für den E-Mail-Versand, Vercel für Hosting sowie Domain- und weitere Infrastrukturkosten. Diese Ausgaben wachsen mit der Nutzung.",
    },
    {
      title: "Technische Betreuung",
      description:
        "KI-Abos und Software für Entwicklung, Fehleranalyse und Pflege, zusätzlich zu meiner ehrenamtlichen Zeit.",
    },
    {
      title: "Reichweite & Vernetzung",
      description:
        "Konferenzen, Gespräche und später kleine Ausgaben für Werbung oder Informationsmaterial, damit mehr Menschen das Werkzeug finden.",
    },
  ],
  fundingNote:
    "Ich möchte Brief-nach-Berlin nicht nur starten, sondern dauerhaft weiterbetreuen. Wenn dir das Projekt wichtig ist, hilf mit, damit es nicht an meiner privaten Kasse hängt.",
  sharePrompt:
    "Kannst du gerade nicht spenden? Drei Empfehlungen helfen genauso.",
  relatedLinks: [
    {
      title: "Wer steckt hinter Brief-nach-Berlin?",
      description: "Warum ich das Projekt baue und was mich dabei antreibt.",
      href: "/warum",
    },
    {
      title: "Warum kann ein persönlicher Brief wirken?",
      description: "Was einen eigenen Brief von Petition und Massenmail unterscheidet.",
      href: "/brief-schreiben-wirkt",
    },
    {
      title: "Wie schützt Brief-nach-Berlin meine Daten?",
      description: "Welche Daten gebraucht werden und was bewusst nicht gespeichert wird.",
      href: "/datenschutz",
    },
  ],
  feedbackDonation: {
    headline: "Schön, dass dir dein Brief gefällt",
    text:
      "Ich mache Brief-nach-Berlin allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Damit es für die Nächsten kostenlos bleibt: Schon 5 € helfen.",
  },
  ctas: {
    donate: {
      label: "Jetzt über WE AID spenden",
      href: DONATION_PROVIDER_URL,
    },
    learnMore: {
      label: "Mehr über die Unterstützung erfahren",
      href: DONATION_PATH,
    },
    share: {
      label: "Weiterempfehlen",
      href: "/weitersagen",
    },
  },
} as const;

export type SupportContent = typeof SUPPORT_CONTENT;

export const SUPPORT_EMAIL_COPY = {
  de: {
    heading: "Damit Brief-nach-Berlin kostenlos bleibt",
    body:
      "Ich baue Brief-nach-Berlin allein und ehrenamtlich in meiner Freizeit und trage die laufenden Kosten bisher selbst. Deine Spende hilft, das Projekt kostenlos und unabhängig weiterzubetreiben.",
    status: SUPPORT_CONTENT.status,
    button: "Jetzt spenden",
    compactButton: "Jetzt spenden",
    infoButton: "Mehr Informationen",
    followupBody:
      "Ich mache das allein und ehrenamtlich und zahle KI, Mailversand und Server bisher selbst. Schon 5 € helfen.",
  },
  en: {
    heading: "Support Brief-nach-Berlin",
    body:
      "Brief-nach-Berlin should remain free and independent for everyone. Your donation helps keep the project running.",
    status:
      "Brief-nach-Berlin is a non-profit initiative fiscally sponsored by WE AID gGmbH.",
    button: "Donate now",
    compactButton: "Donate now",
    infoButton: "More information",
    followupBody:
      "I do this on my own as a volunteer and so far pay for the AI, email delivery and servers myself. Even €5 helps.",
  },
  tr: {
    heading: "Brief-nach-Berlin'i destekle",
    body:
      "Brief-nach-Berlin herkes için ücretsiz ve bağımsız kalmalı. Bağışın projenin devam etmesine yardımcı olur.",
    status:
      "Brief-nach-Berlin, WE AID gGmbH çatısı altında faaliyet gösteren kâr amacı gütmeyen bir girişimdir.",
    button: "Şimdi bağış yap",
    compactButton: "Şimdi bağış yap",
    infoButton: "Daha fazla bilgi",
    followupBody:
      "Bunu tek başıma ve gönüllü olarak yapıyorum, yapay zekâ, e-posta gönderimi ve sunucu masraflarını şimdiye kadar kendim karşılıyorum. 5 € bile yardımcı olur.",
  },
} as const;

export const SUPPORT_CAMPAIGN_CREATOR_COPY = {
  heading: "Schön, dass du eine Briefkampagne startest 🥳",
  milestoneHeading: "Schön, dass deine Kampagne so wächst 🥳",
  body:
    "Wenn du Hilfe brauchst, schreib mir einfach. Je mehr Briefe zu deiner Kampagne entstehen, desto mehr Aufmerksamkeit bekommt das Anliegen. Damit steigen auch die Kosten für Mailversand, Datenbank und Hosting, die ich als Soloprojekt trage. Wenn du magst und kannst, freue ich mich über jede Unterstützung.",
  button: "Brief-nach-Berlin unterstützen",
  infoButton: "Was dein Beitrag bringt",
  status: SUPPORT_CONTENT.status,
} as const;
