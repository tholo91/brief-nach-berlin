import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("letter signal migration", () => {
  const contributionMigration = readFileSync(
    join(process.cwd(), "supabase/migrations/018_independent_letter_signals.sql"),
    "utf8",
  );
  const exactMapMigration = readFileSync(
    join(process.cwd(), "supabase/migrations/020_letter_signal_exact_map.sql"),
    "utf8",
  );
  const vercelConfig = JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
  ) as { crons?: unknown };

  it("keeps contributions independently of letter generation", () => {
    expect(contributionMigration).toContain("status = 'contributed'");
    expect(contributionMigration).toContain("cron.unschedule");
    expect(contributionMigration).not.toContain("DELETE FROM public.letter_signals");
  });

  it("adds clear email storage and exposes only private postcode aggregates", () => {
    expect(exactMapMigration).toContain("email_normalized text");
    expect(exactMapMigration).toContain("get_letter_signal_postcode_counts");
    expect(exactMapMigration).toContain("GROUP BY letter_signals.plz");
    expect(exactMapMigration).toContain("REVOKE ALL ON FUNCTION");
    expect(exactMapMigration).toContain("GRANT EXECUTE ON FUNCTION");
  });

  it("does not depend on a Vercel cron that the Hobby plan cannot deploy", () => {
    expect(vercelConfig.crons).toBeUndefined();
  });
});
