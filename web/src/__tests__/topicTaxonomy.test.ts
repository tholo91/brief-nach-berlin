import {
  TOPIC_CATEGORY_CODES,
  TOPIC_TAXONOMY_VERSION,
  TopicSignalSchema,
  buildTopicSignal,
} from "@/lib/topics/topicTaxonomy";

describe("topic taxonomy v1", () => {
  it("accepts up to three canonical categories and neutral labels", () => {
    const parsed = TopicSignalSchema.parse({
      topicCategories: ["wohnen_bauen", "soziales_familie"],
      topicLabels: ["Mietkosten", "Familienhilfe"],
    });

    expect(parsed.topicCategories).toEqual(["wohnen_bauen", "soziales_familie"]);
    expect(parsed.topicLabels).toEqual(["Mietkosten", "Familienhilfe"]);
  });

  it("rejects unknown, empty, duplicate, or overlong topic data", () => {
    expect(() => TopicSignalSchema.parse({
      topicCategories: ["unbekannt"],
      topicLabels: ["Mietkosten"],
    })).toThrow();
    expect(() => TopicSignalSchema.parse({
      topicCategories: ["wohnen_bauen", "wohnen_bauen"],
      topicLabels: ["Mietkosten"],
    })).toThrow();
    expect(() => TopicSignalSchema.parse({
      topicCategories: ["wohnen_bauen"],
      topicLabels: ["dieses Label enthält zu viele Wörter für das Feld"],
    })).toThrow();
    expect(() => TopicSignalSchema.parse({
      topicCategories: ["wohnen_bauen", "soziales_familie", "bildung", "verkehr_mobilitaet"],
      topicLabels: ["Mietkosten"],
    })).toThrow();
  });

  it("rejects labels that leak contact, address, organization, or personal-life data", () => {
    for (const label of [
      "Thomas Lorenz 28203",
      "Goethestraße 12",
      "thomas@example.org",
      "Meine Kinder",
      "Muster GmbH",
    ]) {
      expect(() => TopicSignalSchema.parse({
        topicCategories: ["soziales_familie"],
        topicLabels: [label],
      })).toThrow();
    }
  });

  it("rejects ambiguous labels that look like a person, organization, or place", () => {
    for (const label of [
      "Thomas Kündigung",
      "Siemens Streik",
      "Berlin Wohnung",
      "Soziale Anna",
      "Pflegebedürftig",
      "Lehrerin",
      "Mieterin",
      "Demokratin",
      "Thomasreform",
      "Soziale Anna Pflege",
      "Öffentliche Siemens Arbeit",
      "Sichere Berlin Straße",
      "Meyersteuerhilfe",
      "Berlinmietkosten",
      "Siemensarbeitshilfe",
    ]) {
      expect(() => TopicSignalSchema.parse({
        topicCategories: ["sonstiges"],
        topicLabels: [label],
      })).toThrow();
    }
  });

  it("keeps the versioned code list small and stable", () => {
    expect(TOPIC_TAXONOMY_VERSION).toBe("v1");
    expect(TOPIC_CATEGORY_CODES).toContain("demokratie_staat");
    expect(TOPIC_CATEGORY_CODES).toContain("sonstiges");
  });

  it("keeps valid categories with a safe generic label when free labels are unsafe or unsupported", () => {
    const signal = buildTopicSignal({
      topic_categories: ["digitales_verwaltung"],
      topic_labels: ["Bürokratieabbau bei Siemens"],
    }, "routing", "mistral-small-latest");

    expect(signal).toMatchObject({
      topicCategories: ["digitales_verwaltung"],
      topicLabels: ["Digitalisierung"],
    });
  });
});
