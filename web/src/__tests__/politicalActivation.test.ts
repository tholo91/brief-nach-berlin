import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  validatePoliticalReviewAnswers,
} from "@/lib/feedback/politicalActivation";

describe("political activation review answers", () => {
  it("requires political self-efficacy only for a full review with send intent", () => {
    expect(
      validatePoliticalReviewAnswers({
        mode: "full",
        letterSent: true,
        politicalSelfEfficacy: null,
      }),
    ).toBe(
      "Bitte beantworte noch, ob du dich durch den Brief eher politisch einbringen kannst.",
    );

    expect(
      validatePoliticalReviewAnswers({
        mode: "full",
        letterSent: true,
        politicalSelfEfficacy: "rather_yes",
      }),
    ).toBeNull();
    expect(
      validatePoliticalReviewAnswers({
        mode: "full",
        letterSent: false,
        politicalSelfEfficacy: null,
      }),
    ).toBeNull();
  });

  it("rejects a hidden self-efficacy answer when send intent is not positive", () => {
    expect(
      validatePoliticalReviewAnswers({
        mode: "full",
        letterSent: false,
        politicalSelfEfficacy: "clearly_yes",
      }),
    ).toBe("Ungültige Antwort zur politischen Handlungsfähigkeit.");
  });

  it("keeps the silent initial rating compatible with empty political answers", () => {
    expect(
      validatePoliticalReviewAnswers({
        mode: "initial",
        letterSent: null,
        politicalSelfEfficacy: null,
      }),
    ).toBeNull();
  });
});

describe("political activation review UI", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/(site)/feedback/FeedbackForm.tsx"),
    "utf8",
  );

  it("keeps the impact question conditional and resets it after a no", () => {
    expect(source).toContain("letterSent === true ?");
    expect(source).toContain("if (!value) setPoliticalSelfEfficacy(null)");
    expect(source).toContain(
      "Fühlst du dich durch diesen Brief eher in der Lage, dich politisch",
    );
  });

  it("shows the optional powerlessness question after the impact question", () => {
    const efficacyQuestion = source.indexOf(
      "Fühlst du dich durch diesen Brief eher in der Lage",
    );
    const powerlessnessQuestion = source.indexOf(
      "Wie oft kennst du das: Du liest, siehst oder hörst etwas Politisches",
    );

    expect(efficacyQuestion).toBeGreaterThan(-1);
    expect(powerlessnessQuestion).toBeGreaterThan(efficacyQuestion);
    expect(source.slice(powerlessnessQuestion, powerlessnessQuestion + 300)).toContain(
      "(optional)",
    );
  });
});

describe("political activation migration", () => {
  const migration = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/019_reviews_political_self_efficacy.sql",
    ),
    "utf8",
  );

  it("limits both private columns to the agreed values and send state", () => {
    expect(migration).toContain("political_self_efficacy text");
    expect(migration).toContain("political_powerlessness_frequency text");
    expect(migration).toContain(
      "political_self_efficacy IS NULL OR letter_sent IS TRUE",
    );
    expect(migration).toContain("'clearly_yes'");
    expect(migration).toContain("'never'");
  });

  it("does not grant the new review signals to public roles", () => {
    expect(migration).toContain(
      "REVOKE SELECT (political_self_efficacy, political_powerlessness_frequency)",
    );
    expect(migration).not.toMatch(/GRANT SELECT[\s\S]*political_self_efficacy/);
  });
});
