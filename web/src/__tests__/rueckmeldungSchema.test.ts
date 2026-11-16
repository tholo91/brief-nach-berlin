import { outcomeAnswersSchema, SENT_METHOD_VALUES } from "@/lib/rueckmeldung/schema";

describe("outcomeAnswersSchema letterSent", () => {
  it.each(["handwritten", "typed", "printed", "email", "not_sent"])("accepts %s", (letterSent) => {
    expect(outcomeAnswersSchema.safeParse({ letterSent }).success).toBe(true);
  });
  it("rejects another string", () => {
    expect(outcomeAnswersSchema.safeParse({ letterSent: "fax" }).success).toBe(false);
  });
  it("does not count not_sent as a sent method", () => {
    expect(SENT_METHOD_VALUES).not.toContain("not_sent");
  });
});
