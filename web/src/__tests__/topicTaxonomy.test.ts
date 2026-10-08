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

  it("keeps concrete keywords from the citizen's concern", () => {
    for (const label of [
      "Bundesverfassungsgericht",
      "Racial Profiling",
      "Erziehermangel",
      "Mietendeckel",
      "Kita-Platzvergabe",
      "Grünflächen",
      "Linksabbieger",
    ]) {
      const parsed = TopicSignalSchema.parse({
        topicCategories: ["sonstiges"],
        topicLabels: [label],
      });
      expect(parsed.topicLabels).toEqual([label]);
    }
  });

  it("drops party names, hyphen compounds and personal data", () => {
    for (const label of [
      "AfD",
      "AfD-Verbot",
      "afd",
      "CDU/CSU",
      "SPD-Fraktion",
      "Bündnis 90",
      "Freie Wähler",
      "Linkspartei",
      "Werteunion",
      "Herr Müller",
      "Hauptstraße 12",
      "28195",
      "thomas@example.de",
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

  it("keeps concrete labels in model order and drops blocked ones", () => {
    const signal = buildTopicSignal({
      topic_categories: ["demokratie_staat", "sicherheit_justiz"],
      topic_labels: ["Bundesverfassungsgericht", "Richterwahl", "AfD"],
    }, "routing", "mistral-small-latest");

    expect(signal).toMatchObject({
      topicCategories: ["demokratie_staat", "sicherheit_justiz"],
      topicLabels: ["Bundesverfassungsgericht", "Richterwahl"],
    });
  });

  it("falls back to the category label when every label is blocked", () => {
    const signal = buildTopicSignal({
      topic_categories: ["demokratie_staat"],
      topic_labels: ["AfD-Verbot", "Herr Müller"],
    }, "routing", "mistral-small-latest");

    expect(signal).toMatchObject({
      topicCategories: ["demokratie_staat"],
      topicLabels: ["Demokratie"],
    });
  });
});
