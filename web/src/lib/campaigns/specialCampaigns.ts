export const SCHREIB_MERZ_CAMPAIGN_SLUG = "schreib-merz" as const;
export const SPECIAL_CAMPAIGN_SLUG = SCHREIB_MERZ_CAMPAIGN_SLUG;

export type SpecialCampaignRecipientKind = "bundeskanzler";

export type SpecialCampaignTopic = {
  id: string;
  emoji: string;
  eyebrow: string;
  title: string;
  shortDescription: string;
  issueText: string;
};

export type SpecialCampaignConfig = {
  slug: typeof SPECIAL_CAMPAIGN_SLUG;
  path: `/${typeof SPECIAL_CAMPAIGN_SLUG}`;
  title: string;
  description: string;
  creatorName: string;
  targetLevel: "Bund";
  featuredRecipientKind: SpecialCampaignRecipientKind;
  allowLocalMdbs: true;
  topics: readonly SpecialCampaignTopic[];
  sharedRequest: string;
};

export const SCHREIB_MERZ_CAMPAIGN = {
  slug: SPECIAL_CAMPAIGN_SLUG,
  path: "/schreib-merz",
  title: "Schreib Merz",
  description:
    "Wähle bis zu zwei Themen, ergänze deine Sicht und erstelle deinen persönlichen Brief an den Bundeskanzler oder ein Mitglied des Bundestags.",
  creatorName: "Brief-nach-Berlin",
  targetLevel: "Bund",
  featuredRecipientKind: "bundeskanzler",
  allowLocalMdbs: true,
  topics: [
    {
      id: "ausbildung",
      emoji: "💸",
      eyebrow: "Studium & Ausbildung",
      title: "BAföG reicht nicht",
      shortDescription:
        "Finanzierung, die gestiegene Kosten abbildet und wirklich ankommt.",
      issueText:
        "Viele junge Menschen erleben, dass BAföG und Ausbildungsförderung nicht mit den gestiegenen Lebenshaltungskosten Schritt halten. Ich wünsche mir, dass Ausbildung und Studium unabhängig vom Einkommen der Eltern möglich bleiben und Anträge schneller und verständlicher bearbeitet werden.",
    },
    {
      id: "wohnen",
      emoji: "🏠",
      eyebrow: "Wohnen",
      title: "WG-Zimmer unbezahlbar",
      shortDescription:
        "Mehr bezahlbarer Wohnraum für Ausbildung, Studium und Berufseinstieg.",
      issueText:
        "Bezahlbarer Wohnraum ist für viele junge Menschen kaum noch zu finden. Hohe Mieten erschweren den Auszug von zu Hause, die Wahl eines Ausbildungs- oder Studienorts und den Start ins Berufsleben. Ich wünsche mir wirksame Maßnahmen, die günstiges Wohnen schneller und dauerhaft möglich machen.",
    },
    {
      id: "wehrdienst",
      emoji: "🪖",
      eyebrow: "Sicherheit",
      title: "Wehrdienst: fragt uns",
      shortDescription:
        "Entscheidungen transparent machen und junge Perspektiven einbeziehen.",
      issueText:
        "Die Debatte über Wehrdienst und Sicherheit betrifft junge Menschen unmittelbar. Entscheidungen dazu sollten transparent begründet werden, ihre Perspektiven ernst nehmen und zivile wie militärische Möglichkeiten fair behandeln. Ich wünsche mir eine offene Debatte darüber, welche Verantwortung jungen Menschen zugemutet wird und welche Unterstützung sie erhalten.",
    },
    {
      id: "klima",
      emoji: "🌍",
      eyebrow: "Klima & Zukunft",
      title: "Klima nicht vertagen",
      shortDescription:
        "Verlässliche Klimapolitik, die Kosten und Chancen fair verteilt.",
      issueText:
        "Die Folgen heutiger Klimaentscheidungen werden junge Menschen besonders lange tragen. Ich wünsche mir eine verlässliche Klimapolitik mit nachvollziehbaren Zielen, die notwendige Veränderungen nicht weiter verschiebt und Kosten wie Chancen sozial fair verteilt.",
    },
    {
      id: "mobilitaet",
      emoji: "🚌",
      eyebrow: "Bus & Bahn",
      title: "Bus & Bahn zu teuer",
      shortDescription:
        "Ein verlässliches Deutschlandticket und bessere Verbindungen überall.",
      issueText:
        "Günstige und verlässliche Mobilität entscheidet darüber, ob junge Menschen Ausbildung, Hochschule, Arbeit und Freund:innen erreichen können. Ich wünsche mir ein langfristig bezahlbares Deutschlandticket und bessere Bus- und Bahnverbindungen, auch außerhalb großer Städte.",
    },
    {
      id: "digitales",
      emoji: "💻",
      eyebrow: "Digitale Bildung & KI",
      title: "Schule digital von gestern",
      shortDescription:
        "Zeitgemäße Schulen, digitale Kompetenzen und faire Regeln für KI.",
      issueText:
        "Schule und Ausbildung müssen besser auf eine Arbeitswelt mit künstlicher Intelligenz und schnellen digitalen Veränderungen vorbereiten. Dazu gehören funktionierende Technik, gut fortgebildete Lehrkräfte, Medienkompetenz und klare Regeln, die Chancen ermöglichen und gleichzeitig vor Benachteiligung schützen.",
    },
  ],
  sharedRequest:
    "Ich bitte Sie, mir mitzuteilen, wie die Bundesregierung dieses Problem konkret angehen will und welche nächsten Schritte geplant sind.",
} as const satisfies SpecialCampaignConfig;

export function getSpecialCampaignBySlug(
  slug: string
): SpecialCampaignConfig | null {
  return slug === SPECIAL_CAMPAIGN_SLUG ? SCHREIB_MERZ_CAMPAIGN : null;
}

export function toggleSpecialCampaignTopic(
  selectedIds: readonly string[],
  topicId: string,
  maxSelected = 2
): string[] {
  if (selectedIds.includes(topicId)) {
    return selectedIds.filter((id) => id !== topicId);
  }
  if (selectedIds.length >= maxSelected) return [...selectedIds];
  return [...selectedIds, topicId];
}

export function composeSpecialCampaignIssue(input: {
  selectedTopicIds: readonly string[];
  topicTexts: Readonly<Record<string, string>>;
  personalText: string;
  sharedRequest: string;
}): string {
  return [
    ...input.selectedTopicIds.map((id) => input.topicTexts[id] ?? ""),
    input.personalText,
    input.sharedRequest,
  ]
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}
