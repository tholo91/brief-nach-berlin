import { z } from "zod";

export const TOPIC_TAXONOMY_VERSION = "v1" as const;

export const TOPIC_CATEGORY_CODES = [
  "demokratie_staat",
  "bildung",
  "gesundheit_pflege",
  "soziales_familie",
  "wohnen_bauen",
  "verkehr_mobilitaet",
  "klima_umwelt",
  "wirtschaft_arbeit",
  "migration_integration",
  "sicherheit_justiz",
  "digitales_verwaltung",
  "kultur_sport",
  "sonstiges",
] as const;

export type TopicCategoryCode = (typeof TOPIC_CATEGORY_CODES)[number];

export const TOPIC_JSON_SCHEMA_PROPERTIES = {
  topic_categories: {
    type: "array",
    items: { type: "string", enum: [...TOPIC_CATEGORY_CODES] },
    minItems: 1,
    maxItems: 3,
  },
  topic_labels: {
    type: "array",
    items: { type: "string", minLength: 1, maxLength: 60 },
    minItems: 1,
    maxItems: 3,
  },
} as const;

export const TopicCategoryCodeSchema = z.enum(TOPIC_CATEGORY_CODES);
export const TopicSourceSchema = z.enum(["routing", "routing_fallback", "generation_fallback"]);
export type TopicSource = z.infer<typeof TopicSourceSchema>;

const TOPIC_LABEL_REGEX = /^[\p{L}\p{N}][\p{L}\p{N} &'/-]{0,59}$/u;
const SAFE_GENERIC_TOPICS = new Set([
  "arbeit", "bildung", "demokratie", "digitalisierung", "energie", "gesundheit",
  "integration", "justiz", "klima", "kultur", "migration", "mobilität", "pflege",
  "rente", "sicherheit", "soziales", "sport", "umwelt", "verkehr", "verwaltung",
  "wohnen", "wohnraum", "schlaglöcher", "schulwege",
]);
const SAFE_MULTIWORD_TOPICS = new Set([
  "allgemeines anliegen", "bezahlbarer wohnraum", "berufliche bildung",
  "digitale verwaltung", "erneuerbare energien", "kommunale finanzen",
  "öffentliche sicherheit", "öffentlicher nahverkehr", "sichere straßen",
  "soziale pflege", "sozialer wohnungsbau",
]);
const SAFE_COMPOUND_TOPIC_REGEX = /^(?:arbeits|bildungs|demokratie|digitalisierungs|energie|familien|gesundheits|infrastruktur|integrations|justiz|kita|klima|krankenhaus|kultur|lehrer|miet|migrations|mobilitäts|nahverkehrs|pflege|renten|schul|sicherheits|sozial|sport|steuer|straßen|umwelt|verkehrs|verwaltungs|wahl|wirtschafts|wohnungs)(?:arbeit|ausbau|bildung|finanzierung|förderung|gesetz|hilfe|infrastruktur|kosten|mangel|mobilität|pflege|plätze|politik|recht|reform|sanierung|schutz|sicherheit|teilhabe|verkehr|verwaltung|versorgung)$/u;

export const TopicLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .refine((label) => TOPIC_LABEL_REGEX.test(label), "ungültiges neutrales Unterthema")
  .refine((label) => label.split(/\s+/).length <= 2, "Unterthema darf höchstens zwei Wörter enthalten")
  .refine(
    (label) =>
      !/(?:@|\b\d{5}\b|\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b)/u.test(label) &&
      !/\b(?:mein(?:e|en|em)?|unser(?:e|en|em)?|ich|wir|herr|frau|dr\.?|prof\.?)\b/iu.test(label) &&
      !/\b(?:gmbh|ag|kg|e\.?\s*v\.?|verein|partei)\b/iu.test(label) &&
      !/(?:\p{L}+)?(?:straße|strasse|weg|allee|gasse|platz)\s+\d/iu.test(label),
    "Unterthema enthält möglicherweise persönliche oder institutionelle Angaben",
  )
  .refine((label) => {
    const normalized = label.toLocaleLowerCase("de-DE");
    return SAFE_GENERIC_TOPICS.has(normalized) ||
      SAFE_MULTIWORD_TOPICS.has(normalized) ||
      SAFE_COMPOUND_TOPIC_REGEX.test(normalized);
  }, "Unterthema liegt außerhalb der minimierten Themenliste");

function unique<T>(values: T[]): boolean {
  return new Set(values).size === values.length;
}

export const TopicSignalContentSchema = z.object({
  topicCategories: z.array(TopicCategoryCodeSchema).min(1).max(3).refine(unique, "doppelte Themenkategorie"),
  topicLabels: z.array(TopicLabelSchema).min(1).max(3).refine(unique, "doppeltes Unterthema"),
});

export type TopicSignalContent = z.infer<typeof TopicSignalContentSchema>;

/** Public model/persistence content contract without server-owned metadata. */
export const TopicSignalSchema = TopicSignalContentSchema;

/** Content plus provenance attached by the server after model validation. */
export const TopicSignalWithMetadataSchema = TopicSignalContentSchema.extend({
  topicTaxonomyVersion: z.literal(TOPIC_TAXONOMY_VERSION),
  topicSource: TopicSourceSchema,
  topicModel: z.string().trim().min(1).max(120),
});

export type TopicSignal = z.infer<typeof TopicSignalWithMetadataSchema>;

/** Shape expected from Mistral's letter/routing JSON response. */
export const TopicModelResponseSchema = z.object({
  topic_categories: z.array(TopicCategoryCodeSchema).min(1).max(3).refine(unique, "doppelte Themenkategorie"),
  topic_labels: z.array(TopicLabelSchema).min(1).max(3).refine(unique, "doppeltes Unterthema"),
});

export type TopicModelResponse = z.infer<typeof TopicModelResponseSchema>;

const CATEGORY_FALLBACK_LABELS: Record<TopicCategoryCode, string> = {
  demokratie_staat: "Demokratie",
  bildung: "Bildung",
  gesundheit_pflege: "Gesundheit",
  soziales_familie: "Soziales",
  wohnen_bauen: "Wohnen",
  verkehr_mobilitaet: "Verkehr",
  klima_umwelt: "Klima",
  wirtschaft_arbeit: "Arbeit",
  migration_integration: "Migration",
  sicherheit_justiz: "Sicherheit",
  digitales_verwaltung: "Digitalisierung",
  kultur_sport: "Kultur",
  sonstiges: "Allgemeines Anliegen",
};

export const ROUTING_FALLBACK_TOPIC: TopicSignal = {
  topicCategories: ["sonstiges"],
  topicLabels: ["Allgemeines Anliegen"],
  topicTaxonomyVersion: TOPIC_TAXONOMY_VERSION,
  topicSource: "routing_fallback",
  topicModel: "local-fallback",
};

/**
 * Converts optional model output into the server-owned topic contract.
 * Topic extraction is deliberately fail-soft: callers can keep generating or
 * routing when the model omits or invents a topic field.
 */
export function buildTopicSignal(
  value: unknown,
  source: TopicSource,
  model: string,
): TopicSignal | null {
  const raw = z.object({
    topic_categories: z.array(TopicCategoryCodeSchema).min(1).max(3).refine(unique),
    topic_labels: z.array(z.unknown()).min(1).max(3),
  }).safeParse(value);
  if (!raw.success) return null;
  const safeLabels = Array.from(new Set(
    raw.data.topic_labels.flatMap((label) => {
      const parsed = TopicLabelSchema.safeParse(label);
      return parsed.success ? [parsed.data] : [];
    }),
  ));
  const topicLabels = safeLabels.length > 0
    ? safeLabels.slice(0, 3)
    : Array.from(new Set(
        raw.data.topic_categories.map((category) => CATEGORY_FALLBACK_LABELS[category]),
      )).slice(0, 3);
  const content = TopicSignalContentSchema.safeParse({
    topicCategories: raw.data.topic_categories,
    topicLabels,
  });
  if (!content.success) return null;
  return TopicSignalWithMetadataSchema.parse({
    ...content.data,
    topicTaxonomyVersion: TOPIC_TAXONOMY_VERSION,
    topicSource: source,
    topicModel: model,
  });
}
