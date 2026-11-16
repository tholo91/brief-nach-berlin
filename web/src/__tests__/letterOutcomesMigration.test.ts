import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OUTCOME_COHORTS } from "@/lib/rueckmeldung/cohort";
import { LETTER_SENT_VALUES } from "@/lib/rueckmeldung/schema";

describe("letter outcomes migration 040", () => {
  const sql = readFileSync(join(process.cwd(), "supabase/migrations/040_letter_outcomes_second_round.sql"), "utf8");

  it("guards on migration 035", () => {
    expect(sql).toContain("reply_feeling");
    expect(sql).toContain("migration 035");
  });
  it.each(LETTER_SENT_VALUES)("allows letter_sent %s", (value) => {
    expect(sql).toContain(`'${value}'`);
  });
  it.each(OUTCOME_COHORTS)("allows cohort %s", (cohort) => {
    expect(sql).toContain(`'${cohort}'`);
  });
  it("recreates the completed branch and the function allowlist", () => {
    expect(sql).toContain("letter_outcomes_completed_branch");
    expect(sql).toContain("letter_sent IN ('handwritten', 'typed', 'printed', 'email')");
    expect(sql).toContain("p_cohort NOT IN");
  });
  it("keeps the function locked to service_role", () => {
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.submit_letter_outcome");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.submit_letter_outcome");
  });
});
