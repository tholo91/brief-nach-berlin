import { resolveMdbContactQuery } from "@/lib/lookup/mdbContactQuery";

describe("resolveMdbContactQuery", () => {
  it.each(["?plz=28195&mdb=123", "?mdb=123&plz=28195"])(
    "uses the MdB ID and keeps a valid PLZ for prefill: %s",
    (search) => {
      expect(resolveMdbContactQuery(search)).toEqual({
        type: "mdb",
        mdbId: 123,
        plz: "28195",
      });
    },
  );

  it.each(["?plz=2819&mdb=123", "?mdb=123"])(
    "uses the MdB ID without a PLZ when the PLZ is invalid or missing: %s",
    (search) => {
      const result = resolveMdbContactQuery(search);
      expect(result).toEqual({ type: "mdb", mdbId: 123 });
      expect(result).not.toHaveProperty("plz");
    },
  );

  it("searches by PLZ when only a PLZ is given", () => {
    expect(resolveMdbContactQuery("?plz=28195")).toEqual({
      type: "plz",
      plz: "28195",
    });
  });

  it.each(["?mdb=abc&plz=28195", "?mdb=0&plz=28195"])(
    "falls back to the PLZ search when the MdB ID is invalid: %s",
    (search) => {
      expect(resolveMdbContactQuery(search)).toEqual({
        type: "plz",
        plz: "28195",
      });
    },
  );

  it.each(["?plz=abcde", "?plz=123456", "?mdb=abc", ""])(
    "returns no lookup for invalid or missing values: %s",
    (search) => {
      expect(resolveMdbContactQuery(search)).toBeNull();
    },
  );
});
