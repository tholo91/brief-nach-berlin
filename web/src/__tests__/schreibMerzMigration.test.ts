import { readFileSync } from "node:fs";
import { join } from "node:path";
import { letterSignalContextSchema } from "@/lib/letterSignals/types";

describe("Schreib-Merz letter signal migration", () => {
  const baseMigration = readFileSync(
    join(process.cwd(), "supabase/migrations/017_letter_signals.sql"),
    "utf8",
  );
  const chancellorMigration = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/021_letter_signals_bundeskanzler.sql",
    ),
    "utf8",
  );

  it("replaces the existing recipient constraint and keeps every prior kind", () => {
    expect(baseMigration).toContain(
      "CONSTRAINT letter_signals_recipient_kind_check",
    );
    expect(chancellorMigration).toContain(
      "DROP CONSTRAINT IF EXISTS letter_signals_recipient_kind_check",
    );
    expect(chancellorMigration).toContain(
      "ADD CONSTRAINT letter_signals_recipient_kind_check",
    );

    for (const recipientKind of [
      "mdb",
      "mdl",
      "landesregierung",
      "rathaus",
      "bundeskanzler",
    ]) {
      expect(chancellorMigration).toContain(`'${recipientKind}'`);
    }
  });

  it("does not add campaign content, analytics, or letter text storage", () => {
    expect(chancellorMigration).not.toMatch(
      /issue_text|letter_text|topic_click|analytics/i,
    );
  });

  it("accepts the chancellor kind in the application-side signal contract", () => {
    expect(
      letterSignalContextSchema.parse({
        letterId: "6f5a0e93-3bb8-43cf-bb94-9bb7d0052ed0",
        plz: "50667",
        bundeslandKey: "NW",
        politicalLevel: "Bund",
        recipientKind: "bundeskanzler",
        issueBinding: "b".repeat(64),
        topicCategories: ["wohnen_bauen"],
        topicLabels: ["Wohnen"],
        topicTaxonomyVersion: "v1",
        topicSource: "routing",
        topicModel: "mistral-small-latest",
        campaignSlug: "schreib-merz",
        emailLookupHash: "a".repeat(64),
      }).recipientKind,
    ).toBe("bundeskanzler");
  });
});
