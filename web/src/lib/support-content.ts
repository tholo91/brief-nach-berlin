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
    "Brief-nach-Berlin soll für alle kostenlos und unabhängig bleiben. Deine Spende hilft, das Projekt dauerhaft zu betreiben.",
  fiscalHost: {
    name: "WE AID gGmbH",
    text:
      "WE AID nimmt die Spenden zweckgebunden entgegen, übernimmt die Abwicklung und stellt auf Wunsch Spendenbescheinigungen aus.",
  },
  founder: {
    name: FOUNDER_NAME,
    portraitPath: "/images/thomas-portrait.webp",
    text:
      "Ich bin Thomas Lorenz und baue Brief-nach-Berlin in meiner Freizeit. Ich entwickle das Projekt weiter, damit Menschen ihre Anliegen unkompliziert und kostenlos an die zuständigen politischen Vertreter:innen richten können.",
    successText:
      "Moin, ich bin Thomas. Ich baue Brief-nach-Berlin in meiner Freizeit und halte den Zugang bewusst kostenlos.",
  },
  costCategories: [
    {
      title: "Betrieb",
      description: "Hosting, Domain, E-Mail sowie Software- und KI-Kosten.",
    },
    {
      title: "Weiterentwicklung",
      description: "Barrierearme Weiterentwicklung und Design.",
    },
    {
      title: "Reichweite",
      description:
        "Outreach, Dokumentation sowie dokumentierte Veranstaltungs- und Reisekosten.",
    },
  ],
  sharePrompt:
    "Du kannst gerade nicht spenden? Eine Empfehlung an drei Menschen hilft dem Projekt ebenfalls.",
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
      label: "Brief-nach-Berlin weitersagen",
      href: "/weitersagen",
    },
  },
} as const;

export type SupportContent = typeof SUPPORT_CONTENT;

export const SUPPORT_EMAIL_COPY = {
  de: {
    prefix: "Hinweis zur Finanzierung:",
    heading: "Brief-nach-Berlin unterstützen ❤️",
    compactHeading: SUPPORT_CONTENT.headline,
    body:
      "Mein Projekt soll weiterhin für alle kostenlos und unabhängig bleiben. Deine Spende hilft, Brief-nach-Berlin dauerhaft zu betreiben.",
    status: SUPPORT_CONTENT.status,
    learnMore: SUPPORT_CONTENT.ctas.learnMore.label,
    button: SUPPORT_CONTENT.ctas.donate.label,
    compactButton: "Jetzt spenden",
    providerLabel: "über WE AID",
    infoButton: "Mehr Informationen",
  },
  en: {
    prefix: "Funding note:",
    heading: "Support Brief-nach-Berlin ❤️",
    compactHeading: "Support Brief-nach-Berlin",
    body:
      "Brief-nach-Berlin should remain free and independent for everyone. Your donation helps keep the project running.",
    status:
      "Brief-nach-Berlin is a non-profit initiative fiscally sponsored by WE AID gGmbH.",
    learnMore: "How Brief-nach-Berlin is funded (in German)",
    button: "Donate via WE AID",
    compactButton: "Donate now",
    providerLabel: "via WE AID",
    infoButton: "More information",
  },
  tr: {
    prefix: "Finansman bilgisi:",
    heading: "Brief-nach-Berlin'i destekle ❤️",
    compactHeading: "Brief-nach-Berlin'i destekle",
    body:
      "Brief-nach-Berlin herkes için ücretsiz ve bağımsız kalmalı. Bağışın projenin devam etmesine yardımcı olur.",
    status:
      "Brief-nach-Berlin, WE AID gGmbH çatısı altında faaliyet gösteren kâr amacı gütmeyen bir girişimdir.",
    learnMore: "Brief-nach-Berlin nasıl finanse ediliyor? (Almanca)",
    button: "WE AID üzerinden bağış yap",
    compactButton: "Şimdi bağış yap",
    providerLabel: "WE AID üzerinden",
    infoButton: "Daha fazla bilgi",
  },
} as const;
