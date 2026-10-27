import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AGE_GROUP_LABELS, AGE_GROUP_VALUES } from "@/lib/feedback/ageGroup";

describe("age group values", () => {
  it("offers exactly the six agreed groups in order", () => {
    expect([...AGE_GROUP_VALUES]).toEqual([
      "under_20",
      "20_29",
      "30_44",
      "45_59",
      "60_74",
      "75_plus",
    ]);
  });

  it("has a label for every value", () => {
    for (const value of AGE_GROUP_VALUES) {
      expect(AGE_GROUP_LABELS[value].length).toBeGreaterThan(0);
    }
    expect(AGE_GROUP_LABELS.under_20).toBe("unter 20");
    expect(AGE_GROUP_LABELS["20_29"]).toBe("20 bis 29");
  });
});

describe("migration 037 age group split", () => {
  const migration = readFileSync(
    join(process.cwd(), "supabase/migrations/037_reviews_age_group_split.sql"),
    "utf8",
  );
  const addIndex = migration.indexOf("ADD CONSTRAINT reviews_age_group_check");

  it("runs in a transaction and rewrites legacy rows before adding the constraint", () => {
    expect(migration).toContain("BEGIN;");
    expect(migration).toContain("COMMIT;");
    expect(migration).toContain(
      "DROP CONSTRAINT IF EXISTS reviews_age_group_check",
    );
    const updateIndex = migration.indexOf("UPDATE public.reviews");
    expect(updateIndex).toBeGreaterThan(-1);
    expect(addIndex).toBeGreaterThan(updateIndex);
  });

  it("allows exactly the app values in the new constraint", () => {
    const constraint = migration.slice(addIndex);
    for (const value of AGE_GROUP_VALUES) {
      expect(constraint).toContain(`'${value}'`);
    }
    expect(constraint).not.toContain("under_30");
  });
});
