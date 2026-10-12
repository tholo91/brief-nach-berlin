import { readFileSync } from "node:fs";
import path from "node:path";

describe("global letter milestone migration", () => {
  it("stores unique, service-only claims for every thousand-letter threshold", () => {
    const sql = readFileSync(
      path.join(process.cwd(), "supabase/migrations/030_global_letter_milestone_claims.sql"),
      "utf8",
    );

    expect(sql).toContain("milestone_count integer primary key");
    expect(sql).toContain("milestone_count % 1000 = 0");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on public.global_letter_milestone_claims from anon, authenticated");
  });
});
